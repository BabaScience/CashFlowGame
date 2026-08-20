/**
 * Verifiche della valutazione.
 *   node scripts/prova-valutazione.mjs
 *
 * Una valutazione può rompersi in un modo solo, ed è silenzioso: continuare
 * a salire per tutti. Se anche chi gioca male guadagna punti, il numero
 * smette di significare qualcosa e nessuno se ne accorge finché non è
 * troppo tardi per cambiarlo. È successo alla prima versione di questo
 * file — l'ancora era sbagliata e chi comprava a caso arrivava a 920.
 *
 * Perciò quasi tutti i test qui misurano la stessa cosa da angoli diversi:
 * che giocare peggio faccia scendere e giocare meglio faccia salire.
 */
import {
  riferimentoDelGiorno, nuovaValutazione, esitoControRiferimento,
  fasciaValutazione, VALUTAZIONE_INIZIALE, VALUTAZIONE_RIFERIMENTO,
} from "../src/game/valutazione.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};

const GIORNI = ["2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25"];

/** Dove si assesta chi gioca sempre alla stessa forza relativa. */
function assestamento(moltiplicatore, sfide = 60) {
  let v = VALUTAZIONE_INIZIALE;
  for (let i = 0; i < sfide; i++) {
    const rif = riferimentoDelGiorno(GIORNI[i % GIORNI.length]);
    v = nuovaValutazione(v, Math.round(rif * moltiplicatore), rif);
  }
  return v;
}

console.log("\n── Il riferimento ──");

prova("Gioca la stessa partita di chi si valuta, ed è deterministico", () => {
  for (const g of GIORNI) {
    eq(riferimentoDelGiorno(g), riferimentoDelGiorno(g), `${g}:`);
  }
});

prova("Ottiene punteggi diversi in giorni diversi", () => {
  const p = new Set(GIORNI.map((g) => riferimentoDelGiorno(g)));
  vero(p.size >= 3, `troppo uniforme: ${[...p].join(", ")}`);
});

prova("Non è né perfetto né inutile", () => {
  for (const g of GIORNI) {
    const p = riferimentoDelGiorno(g);
    vero(p > 0, `${g}: il riferimento non combina nulla (${p})`);
    vero(p < 100, `${g}: il riferimento esce sempre (${p}), battere lui sarebbe impossibile`);
  }
});

console.log("\n── Il confronto ──");

prova("Pareggiare col riferimento vale mezzo punto", () => {
  eq(Number(esitoControRiferimento(100, 100).toFixed(2)), 0.5);
});

prova("Fare di più vale di più, fare di meno vale di meno", () => {
  vero(esitoControRiferimento(200, 100) > esitoControRiferimento(100, 100));
  vero(esitoControRiferimento(50, 100) < esitoControRiferimento(100, 100));
});

prova("Una giornata storta costa, ma non azzera", () => {
  vero(esitoControRiferimento(0, 100) === 0);
  vero(esitoControRiferimento(10, 100) > 0);
});

prova("Un riferimento vicino a zero non fa esplodere il rapporto", () => {
  const e = esitoControRiferimento(50, 0);
  vero(Number.isFinite(e) && e > 0 && e <= 1, `esito fuori scala: ${e}`);
});

console.log("\n── Il numero deve significare qualcosa ──");

prova("Chi non combina nulla SCENDE", () => {
  const v = assestamento(0);
  vero(v < VALUTAZIONE_INIZIALE, `è salito invece di scendere: ${v}`);
});

prova("Chi gioca male resta sotto la partenza o poco sopra", () => {
  const v = assestamento(0.4);
  vero(v < VALUTAZIONE_RIFERIMENTO - 100, `troppo generoso con chi gioca male: ${v}`);
});

prova("Chi pareggia col riferimento tende al valore del riferimento", () => {
  const v = assestamento(1.0);
  vero(Math.abs(v - VALUTAZIONE_RIFERIMENTO) < 120, `atteso vicino a ${VALUTAZIONE_RIFERIMENTO}, ottenuto ${v}`);
});

prova("Chi gioca bene supera il riferimento", () => {
  vero(assestamento(2.0) > VALUTAZIONE_RIFERIMENTO, "giocare bene deve portare sopra il riferimento");
});

prova("Le forze si ordinano senza scavalcarsi", () => {
  const scala = [0, 0.4, 1.0, 2.0, 3.5].map(assestamento);
  for (let i = 1; i < scala.length; i++) {
    vero(scala[i] > scala[i - 1], `ordine rotto: ${scala.join(" → ")}`);
  }
});

prova("Non si sale all'infinito giocando sempre uguale", () => {
  const a = assestamento(2.0, 40);
  const b = assestamento(2.0, 200);
  vero(b - a < 200, `la valutazione non si assesta: ${a} → ${b}`);
});

prova("Non si scende sotto il pavimento", () => {
  let v = 150;
  for (let i = 0; i < 60; i++) v = nuovaValutazione(v, 0, 50);
  vero(v >= 100, `sceso sotto il minimo: ${v}`);
});

console.log("\n── Le fasce ──");

prova("Ogni valutazione ha una fascia con un nome", () => {
  for (const v of [0, 100, 800, 1000, 1200, 1500, 1800, 5000]) {
    const f = fasciaValutazione(v);
    vero(f && f.nome && f.emoji, `nessuna fascia per ${v}`);
  }
});

prova("Le fasce non tornano indietro salendo", () => {
  const viste = [];
  for (let v = 100; v <= 2000; v += 50) {
    const n = fasciaValutazione(v).nome;
    if (viste.at(-1) !== n) viste.push(n);
  }
  eq(new Set(viste).size, viste.length, "una fascia ricompare dopo esserne uscita:");
});

console.log("\n── Nessun identificativo ──");

prova("La valutazione vive sul dispositivo, non sul server", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../src/game/valutazione.js", import.meta.url), "utf8");
  vero(src.includes("localStorage"), "deve stare in locale");
  vero(!/fetch\(|\/api\//.test(src), "non deve parlare con nessun server");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
