/**
 * Verifiche delle metriche.
 *   node scripts/prova-metriche.mjs
 *
 * Il rischio di un sistema di misura non è che conti male: è che, senza che
 * nessuno lo decida, cominci a raccogliere qualcosa di personale. Questi
 * test sorvegliano soprattutto quello — che dal client non passi nulla che
 * identifichi qualcuno, e che il server non accetti campi arbitrari.
 */
import { incrementiPer, fascia, fasciaTurni, giornoDi, EVENTI, FASCE } from "../src/game/metriche.js";

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

console.log("\n── Fasce di ritorno ──");

prova("Stesso giorno, primo giorno, entro 7, entro 30, oltre", () => {
  eq(fascia(0), "d0");
  eq(fascia(1), "d1");
  eq(fascia(5), "d7");
  eq(fascia(7), "d7");
  eq(fascia(8), "d30");
  eq(fascia(30), "d30");
  eq(fascia(31), "oltre");
});

prova("Un valore assurdo non produce una fascia", () => {
  eq(fascia(-3), null);
  eq(fascia("ieri"), null);
  eq(fascia(undefined), null);
});

prova("Le fasce dichiarate sono quelle prodotte", () => {
  for (const g of [0, 1, 4, 20, 900]) vero(FASCE.includes(fascia(g)));
});

console.log("\n── Fasce di durata ──");

prova("Le partite si raggruppano per lunghezza", () => {
  eq(fasciaTurni(3), "t20");
  eq(fasciaTurni(35), "t50");
  eq(fasciaTurni(80), "t100");
  eq(fasciaTurni(240), "t100piu");
  eq(fasciaTurni(-1), null);
});

console.log("\n── Che cosa accetta il server ──");

prova("Un evento previsto produce il suo contatore", () => {
  const r = incrementiPer({ evento: "stanzaCreata" });
  eq(r.incrementi.stanzaCreata, 1);
});

prova("Un evento non previsto viene rifiutato", () => {
  vero(incrementiPer({ evento: "qualcosa-di-inventato" }).errore);
  vero(incrementiPer({}).errore);
  vero(incrementiPer(null).errore);
});

prova("Tutti gli eventi dichiarati sono accettati", () => {
  for (const e of EVENTI) eq(incrementiPer({ evento: e }).errore, undefined, e);
});

prova("I campi non previsti vengono ignorati, non salvati", () => {
  const r = incrementiPer({
    evento: "sessione",
    email: "qualcuno@esempio.it",
    ip: "1.2.3.4",
    nome: "Mario Rossi",
    userId: "abc123",
  });
  eq(Object.keys(r.incrementi), ["sessione"], "solo il contatore dell'evento:");
});

prova("Il ritorno diventa una fascia, mai un numero di giorni", () => {
  const r = incrementiPer({ evento: "sessione", giorniDallaPrima: 9 });
  eq(r.incrementi, { sessione: 1, ritorno_d30: 1 });
  vero(!JSON.stringify(r.incrementi).includes("9"), "il giorno esatto non deve sopravvivere");
});

prova("Il motivo della vittoria viene ripulito", () => {
  const r = incrementiPer({ evento: "partitaFinita", motivo: "rendita; drop table" });
  vero(Object.keys(r.incrementi).some((k) => k.startsWith("esito_")));
  for (const k of Object.keys(r.incrementi)) {
    vero(/^[a-z_]+$/i.test(k), `chiave sospetta: ${k}`);
  }
});

prova("Il numero di giocatori resta fra 2 e 6", () => {
  eq(incrementiPer({ evento: "stanzaCreata", giocatori: 99 }).incrementi.tavolo_6, 1);
  eq(incrementiPer({ evento: "stanzaCreata", giocatori: 1 }).incrementi.tavolo_2, 1);
});

console.log("\n── Nessun dato personale, per costruzione ──");

prova("Nessun incremento può contenere un identificativo", () => {
  const casi = [
    { evento: "sessione", giorniDallaPrima: 3 },
    { evento: "partitaFinita", turni: 62, motivo: "sogno" },
    { evento: "stanzaCreata", giocatori: 4 },
    { evento: "uscitaDallaRuota", turni: 41 },
  ];
  for (const c of casi) {
    const { incrementi } = incrementiPer(c);
    for (const [k, v] of Object.entries(incrementi)) {
      eq(v, 1, `ogni contatore vale uno (${k}):`);
      vero(/^[a-z][a-z0-9_]*$/i.test(k), `chiave non conforme: ${k}`);
    }
  }
});

prova("Il client non può far crescere il documento a piacere", () => {
  const finti = {};
  for (let i = 0; i < 200; i++) finti["campo" + i] = 1;
  const { incrementi } = incrementiPer({ evento: "sessione", ...finti });
  eq(Object.keys(incrementi).length, 1);
});

console.log("\n── Il giorno ──");

prova("La chiave del giorno è in UTC: i fusi non spostano i conti", () => {
  eq(giornoDi(Date.parse("2026-08-20T23:30:00Z")), "2026-08-20");
  eq(giornoDi(Date.parse("2026-08-21T00:30:00Z")), "2026-08-21");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
