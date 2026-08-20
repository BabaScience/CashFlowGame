/**
 * Verifiche della sfida del giorno.
 *   node scripts/prova-sfida.mjs
 *
 * Due cose devono reggere, o la sfida non ha senso:
 *  - due persone che giocano lo stesso giorno devono ricevere ESATTAMENTE
 *    la stessa partita, altrimenti i punteggi non sono confrontabili e
 *    parlarne fra amici non significa niente;
 *  - il punteggio deve premiare chi sceglie meglio, non chi tira meglio.
 */
import { applicaAzione } from "../src/game/motore.js";
import {
  creaSfida, semeDelGiorno, professioneDelGiorno, punteggio, fasciaPunteggio,
  testoDaCondividere, giornoSfida, TURNI_SFIDA, BONUS_PARTENZA,
} from "../src/game/sfida.js";
import { fuoriDallaCorsa } from "../src/game/finanze.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
  }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Gioca la sfida con una strategia dichiarata, fino allo scadere dei turni. */
function gioca(giorno, strategia) {
  let s = creaSfida({ giorno }).stato;
  let n = 0;
  while (s.fase === "inCorso" && s.numeroTurno <= TURNI_SFIDA && n < 6000) {
    const p = s.pending, g = s.giocatori[0];
    let az;
    if (p) {
      const id = p.giocatoreId;
      if (p.tipo === "mercato") az = { tipo: "chiudiMercato", giocatoreId: g.id };
      else if (p.tipo === "sceltaTaglia") az = { tipo: "scegliTaglia", giocatoreId: id, taglia: g.contanti > 25000 ? "grandi" : "piccoli" };
      else if (p.tipo === "carta") {
        const c = p.carta;
        if (strategia === "fermo") az = { tipo: "passaCarta", giocatoreId: id };
        else if (strategia === "compraTutto") {
          az = (c.flusso > 0 && g.contanti >= c.acconto)
            ? { tipo: "compraCarta", giocatoreId: id } : { tipo: "passaCarta", giocatoreId: id };
        } else {
          const resa = c.acconto > 0 ? c.flusso / c.acconto : 0;
          az = (c.flusso > 0 && g.contanti >= c.acconto && resa >= 0.008)
            ? { tipo: "compraCarta", giocatoreId: id } : { tipo: "passaCarta", giocatoreId: id };
        }
      }
      else if (p.tipo === "bancarotta") az = { tipo: "concludiBancarotta", giocatoreId: id };
      else if (p.tipo === "beneficenza") az = { tipo: "beneficenza", giocatoreId: id, accetta: false };
      else if (p.tipo === "sogno") az = { tipo: "passaSogno", giocatoreId: id };
      else if (p.tipo === "affareVeloce") az = { tipo: "passaAffareVeloce", giocatoreId: id };
      else az = { tipo: { extra: "confermaExtra", figlio: "confermaFiglio", licenziamento: "confermaLicenziamento", penalitaVeloce: "confermaPenalita" }[p.tipo], giocatoreId: id };
    } else if (g.tracciato === "topi" && fuoriDallaCorsa(g)) {
      az = { tipo: "esciDallaCorsa", giocatoreId: g.id };
    } else az = { tipo: "tira", giocatoreId: g.id, nDadi: 2 };

    const r = applicaAzione(s, az);
    if (r.errore) break;
    s = r.stato;
    n++;
  }
  return { stato: s, punti: punteggio(s), azioni: n };
}

const GIORNI = ["2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25"];

console.log("\n── Stessa partita per tutti ──");

prova("Lo stesso giorno produce lo stesso seme", () => {
  eq(semeDelGiorno("2026-08-21", "roma"), semeDelGiorno("2026-08-21", "roma"));
});

prova("Giorni diversi producono sfide diverse", () => {
  const semi = new Set(GIORNI.map((g) => semeDelGiorno(g, "roma")));
  eq(semi.size, GIORNI.length, "tutti i giorni devono differire:");
});

prova("Mercati diversi, stesso giorno, sfide diverse", () => {
  vero(semeDelGiorno("2026-08-21", "roma") !== semeDelGiorno("2026-08-21", "classico"));
});

prova("Due giocatori ricevono mazzi identici", () => {
  const a = creaSfida({ giorno: "2026-08-21" });
  const b = creaSfida({ giorno: "2026-08-21" });
  for (const m of ["piccoli", "grandi", "mercato", "extra"]) {
    eq(a.stato.mazzi[m].ordine, b.stato.mazzi[m].ordine, `mazzo ${m}:`);
  }
});

prova("Anche la professione e il sogno del giorno sono uguali per tutti", () => {
  const a = creaSfida({ giorno: "2026-08-21" });
  const b = creaSfida({ giorno: "2026-08-21" });
  eq(a.professione.id, b.professione.id);
  eq(a.sogno.id, b.sogno.id);
  eq(professioneDelGiorno("2026-08-21", "roma").id, a.professione.id);
});

console.log("\n── La partita ──");

prova("Si gioca da soli, e il motore lo consente", () => {
  const { stato } = creaSfida({ giorno: "2026-08-21" });
  eq(stato.giocatori.length, 1);
  eq(stato.fase, "inCorso");
  eq(stato.solitaria, true);
});

prova("Si parte con i risparmi della scheda più il capitale della sfida", () => {
  const { stato } = creaSfida({ giorno: "2026-08-21" });
  vero(stato.giocatori[0].contanti > BONUS_PARTENZA, "il bonus deve essere aggiunto, non sostituire");
});

prova("La sfida sta nei turni previsti", () => {
  for (const g of GIORNI) {
    const { stato } = gioca(g, "compraTutto");
    vero(stato.numeroTurno <= TURNI_SFIDA + 1, `${g}: ${stato.numeroTurno} turni`);
  }
});

prova("Nessuna sfida si blocca", () => {
  for (const g of GIORNI) {
    const { azioni } = gioca(g, "esperto");
    vero(azioni > 10 && azioni < 6000, `${g}: ${azioni} azioni`);
  }
});

console.log("\n── Il punteggio misura le scelte ──");

prova("Chi non compra niente resta a zero", () => {
  for (const g of GIORNI) eq(gioca(g, "fermo").punti, 0, `${g}:`);
});

prova("Chi compra fa più di chi sta fermo", () => {
  const fermo = GIORNI.map((g) => gioca(g, "fermo").punti);
  const attivo = GIORNI.map((g) => gioca(g, "compraTutto").punti);
  const meglio = attivo.filter((p, i) => p > fermo[i]).length;
    vero(meglio >= 4, `solo ${meglio} giorni su ${GIORNI.length} premiano chi compra`);
});

prova("Scegliere bene batte comprare tutto, il più delle volte", () => {
  const tutto = GIORNI.map((g) => gioca(g, "compraTutto").punti);
  const esperto = GIORNI.map((g) => gioca(g, "esperto").punti);
  const meglio = esperto.filter((p, i) => p >= tutto[i]).length;
  vero(meglio >= 3, `l'esperto vince o pareggia solo ${meglio} volte su ${GIORNI.length}`);
});

prova("I punteggi si distribuiscono, non si schiacciano", () => {
  const punti = GIORNI.map((g) => gioca(g, "esperto").punti);
  const min = Math.min(...punti), max = Math.max(...punti);
  vero(max - min >= 10, `intervallo troppo stretto: ${min}–${max}`);
  vero(max > 0, "almeno un giorno deve dare un punteggio positivo");
});

console.log("\n── Il testo da condividere ──");

prova("Racconta il risultato senza rivelare le carte", () => {
  const { stato } = gioca("2026-08-21", "esperto");
  const t = testoDaCondividere(stato, { giorno: "2026-08-21", url: "quotazero.it" });
  vero(t.includes("Quota Zero"));
  vero(t.includes("2026-08-21"));
  vero(/[▰▱]{5}/.test(t), "manca la barra dei blocchi");
  /* Non deve comparire il nome di nessuna carta pescata. */
  for (const nome of ["Bilocale", "Box auto", "Trilocale", "Distributori"]) {
    vero(!t.includes(nome), `il testo rivela una carta: ${nome}`);
  }
});

prova("Le fasce coprono tutto l'intervallo", () => {
  eq(fasciaPunteggio(0).blocchi, 1);
  eq(fasciaPunteggio(30).blocchi, 2);
  eq(fasciaPunteggio(60).blocchi, 3);
  eq(fasciaPunteggio(80).blocchi, 4);
  eq(fasciaPunteggio(100).blocchi, 5);
  eq(fasciaPunteggio(250).blocchi, 5);
});

prova("Il giorno è in UTC: la sfida cambia insieme per tutti", () => {
  eq(giornoSfida(Date.parse("2026-08-21T23:59:00Z")), "2026-08-21");
  eq(giornoSfida(Date.parse("2026-08-22T00:01:00Z")), "2026-08-22");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
