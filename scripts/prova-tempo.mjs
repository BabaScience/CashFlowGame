/**
 * Il tempo di gioco.
 *   node scripts/prova-tempo.mjs
 *
 * Un Giorno di Paga è un mese. Il numero che ne esce è quello che il
 * giocatore si porta a casa — "ci ho messo quattro anni e due mesi" — quindi
 * deve essere giusto, deve essere leggibile in due lingue, e deve restare
 * plausibile: se una partita raccontasse quarant'anni di lavoro non
 * sarebbe più una simulazione ma una condanna.
 */
import { creaStanza, applicaAzione } from "../src/game/motore.js";
import { orologio, durata, MESI_ANNO } from "../src/game/tempo.js";
import { traduci } from "../src/i18n/index.js";
import { gioca } from "./bot.mjs";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const it = (k, v) => traduci("it", k, v);
const en = (k, v) => traduci("en", k, v);

console.log("\n── L'orologio ──");

prova("Il primo mese è il mese 1 dell'anno 1", () => {
  /* Contare da zero qui sarebbe corretto e illeggibile: nessuno dice "sono
     al mese zero". */
  eq(orologio(1).anno, 1); eq(orologio(1).mese, 1);
});

prova("Dodici mesi stanno ancora nel primo anno", () => {
  eq(orologio(12).anno, 1); eq(orologio(12).mese, 12);
});

prova("Il tredicesimo mese apre il secondo anno", () => {
  eq(orologio(13).anno, 2); eq(orologio(13).mese, 1);
});

prova("Regge valori assurdi senza produrre NaN", () => {
  for (const v of [undefined, null, 0, -5, "3"]) {
    const o = orologio(v);
    vero(Number.isFinite(o.anno) && Number.isFinite(o.mese), `orologio(${v})`);
    vero(o.anno >= 1 && o.mese >= 1, `orologio(${v}) sotto il minimo`);
  }
});

console.log("\n── Il tempo a parole ──");

prova("Singolare e plurale, in tutte e due le lingue", () => {
  eq(durata(1, it), "1 mese");
  eq(durata(2, it), "2 mesi");
  eq(durata(12, it), "1 anno");
  eq(durata(24, it), "2 anni");
  eq(durata(1, en), "1 month");
  eq(durata(12, en), "1 year");
  eq(durata(24, en), "2 years");
});

prova("Anni e mesi insieme", () => {
  eq(durata(14, it), "1 anno e 2 mesi");
  eq(durata(38, it), "3 anni e 2 mesi");
  eq(durata(14, en), "1 year, 2 months");
});

prova("Un anno tondo non dice «e 0 mesi»", () => {
  vero(!durata(36, it).includes("0"), durata(36, it));
  vero(!durata(36, en).includes("0"), durata(36, en));
});

prova("Zero mesi resta una frase, non un trattino", () => {
  vero(durata(0, it).length > 2 && /\d/.test(durata(0, it)), durata(0, it));
});

prova("Nessuna lingua lascia un segnaposto per strada", () => {
  for (const f of [it, en]) {
    for (const m of [0, 1, 7, 12, 13, 25, 100]) {
      vero(!/\{\w+\}/.test(durata(m, f)), `${m}: ${durata(m, f)}`);
    }
  }
});

console.log("\n── Il motore conta i mesi ──");

/** Una partita pronta a giocare. */
function tavolo(mercatoId = "roma") {
  let s = creaStanza("TEMP", "a", { seme: 11, mercatoId });
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "Ada", professioneId: mercatoId === "roma" ? "quadro" : "medico", sognoId: "sg01" }).stato;
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "Bo", professioneId: mercatoId === "roma" ? "meccanico" : "meccanico", sognoId: "sg02" }).stato;
  return applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
}

prova("Si comincia con un mese lavorato, non con zero", () => {
  /* All'avvio ognuno incassa il primo Giorno di Paga: quel mese è passato
     davvero, e contarlo zero renderebbe il totale sempre sbagliato di uno. */
  for (const g of tavolo().giocatori) eq(g.mesi, 1, g.nome + ":");
});

prova("Ogni Giorno di Paga vale un mese", () => {
  /* Si passa dal motore, non si scrive il campo a mano: il punto è proprio
     verificare che sia il motore a contarli. */
  const prima = tavolo().giocatori.map((g) => g.mesi);
  const { stato } = gioca(tavolo(), 300);
  const dopo = stato.giocatori.map((g) => g.mesi);
  vero(dopo.some((m, i) => m > prima[i]), "nessun mese è passato in trecento mosse");
  for (const g of stato.giocatori) {
    vero(Number.isFinite(g.mesi) && g.mesi >= 1, `${g.nome}: mesi = ${g.mesi}`);
  }
});

prova("Chi esce dalla Ruota si porta dietro la data", () => {
  for (let tentativo = 0; tentativo < 8; tentativo++) {
    const { stato } = gioca(tavolo(), 4000);
    const usciti = stato.giocatori.filter((g) => g.tracciato === "veloce");
    if (!usciti.length) continue;
    for (const g of usciti) {
      vero(g.mesiAllUscita >= 1, `${g.nome} è uscito senza registrare i mesi`);
      vero(g.mesiAllUscita <= g.mesi, `${g.nome}: uscita a ${g.mesiAllUscita}, ora ${g.mesi}`);
    }
    return;
  }
  throw new Error("in otto partite nessuno è uscito dalla Ruota");
});

prova("Una stanza vecchia senza il campo non fa esplodere niente", () => {
  /* Le stanze durano 48 ore: al momento dell'aggiornamento ci sono partite
     in corso salvate senza `mesi`. */
  const s = tavolo();
  for (const g of s.giocatori) delete g.mesi;
  const o = orologio(s.giocatori[0].mesi);
  vero(Number.isFinite(o.anno), "l'orologio si rompe su una stanza vecchia");
  vero(durata(s.giocatori[0].mesi, it).length > 0, "la durata si rompe");
});

console.log("\n── I numeri restano credibili ──");

prova("Un mese non costa mai più di un turno... né molto meno", () => {
  /* Se un turno valesse tre mesi, un anno passerebbe in quattro tiri e il
     numero perderebbe significato; se ne valesse un decimo, nessuno
     arriverebbe mai al secondo anno. */
  const { stato } = gioca(tavolo(), 3000);
  let controllati = 0;
  for (const g of stato.giocatori) {
    if (g.turniGiocati < 10) continue;
    controllati++;
    const perTurno = g.mesi / g.turniGiocati;
    vero(perTurno > 0.2 && perTurno < 2,
      `${g.nome}: ${perTurno.toFixed(2)} mesi per turno (${g.mesi} mesi in ${g.turniGiocati} turni)`);
  }
  vero(controllati > 0, "nessun giocatore ha giocato abbastanza da poter giudicare");
});

prova("Una vita lavorativa, non una condanna", () => {
  /* Il tempo che il gioco racconta deve somigliare a una vita: qualche
     anno. Se una partita tipica ne raccontasse quaranta, il numero
     smetterebbe di incoraggiare e comincerebbe a deprimere. */
  const durate = [];
  for (let i = 0; i < 6; i++) {
    const { stato } = gioca(tavolo(), 4000);
    durate.push(Math.max(...stato.giocatori.map((g) => g.mesi)) / MESI_ANNO);
  }
  const mediana = durate.sort((a, b) => a - b)[durate.length >> 1];
  vero(mediana >= 1, `una partita racconta solo ${mediana.toFixed(1)} anni`);
  vero(mediana < 40, `una partita racconta ${mediana.toFixed(1)} anni: troppi`);
  console.log(`       (una partita intera racconta ~${mediana.toFixed(0)} anni di lavoro)`);
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
