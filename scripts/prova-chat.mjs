/**
 * Verifiche della chat di stanza.
 *   node scripts/prova-chat.mjs
 *
 * La chat non passa dal motore, quindi non è coperta da prova-regole.mjs:
 * queste sono le sue regole, e sono le stesse che applicano sia il server
 * vero sia quello di sviluppo, perché entrambi chiamano `preparaMessaggio`.
 */
import { creaStanza, applicaAzione } from "../src/game/motore.js";
import {
  preparaMessaggio, accoda, ripulisci,
  MAX_MESSAGGI, LUNGHEZZA_MAX, PAUSA_MS,
} from "../src/game/chat.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Una stanza con tre giocatori, partita avviata. */
function tavolo() {
  let s = creaStanza("PROV", "a", { seme: 7 });
  for (const [id, nome, prof] of [["a", "Ada", "medico"], ["b", "Bo", "insegnante"], ["c", "Cy", "meccanico"]]) {
    s = applicaAzione(s, { tipo: "entra", giocatoreId: id, nome, professioneId: prof, sognoId: "sg01" }).stato;
  }
  return applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
}

console.log("\n── Ripulitura del testo ──");

prova("I caratteri di controllo spariscono", () => {
  eq(ripulisci("ci" + String.fromCharCode(0) + "ao"), "ciao");
});

prova("Gli spazi doppi si comprimono, i bordi si tagliano", () => {
  eq(ripulisci("   ciao    a    tutti   "), "ciao a tutti");
});

prova("Un messaggio troppo lungo viene troncato, non rifiutato", () => {
  eq(ripulisci("a".repeat(LUNGHEZZA_MAX + 500)).length, LUNGHEZZA_MAX);
});

console.log("\n── Chi può scrivere ──");

prova("Un giocatore del tavolo può scrivere", () => {
  const r = preparaMessaggio(tavolo(), "b", "ciao");
  eq(r.errore, undefined);
  eq(r.messaggio.nome, "Bo");
  eq(r.messaggio.testo, "ciao");
});

prova("Chi non è al tavolo non può scrivere", () => {
  const r = preparaMessaggio(tavolo(), "estraneo", "ciao");
  vero(r.errore, "un estraneo non dovrebbe poter scrivere");
});

prova("Un messaggio vuoto viene rifiutato", () => {
  vero(preparaMessaggio(tavolo(), "a", "     ").errore);
});

prova("Su una stanza inesistente si ottiene un errore, non un'eccezione", () => {
  vero(preparaMessaggio(null, "a", "ciao").errore);
});

console.log("\n── Freno e tetto ──");

prova("Due messaggi troppo ravvicinati: il secondo rimbalza", () => {
  let s = tavolo();
  const ora = Date.now();
  const primo = preparaMessaggio(s, "a", "uno", ora);
  s = accoda(s, primo.messaggio);
  vero(preparaMessaggio(s, "a", "due", ora + PAUSA_MS - 50).errore, "doveva rimbalzare");
});

prova("Passata la pausa si può riscrivere", () => {
  let s = tavolo();
  const ora = Date.now();
  s = accoda(s, preparaMessaggio(s, "a", "uno", ora).messaggio);
  eq(preparaMessaggio(s, "a", "due", ora + PAUSA_MS + 10).errore, undefined);
});

prova("Il freno è per giocatore, non per tavolo", () => {
  let s = tavolo();
  const ora = Date.now();
  s = accoda(s, preparaMessaggio(s, "a", "uno", ora).messaggio);
  eq(preparaMessaggio(s, "b", "anch'io", ora + 10).errore, undefined);
});

prova(`Oltre ${MAX_MESSAGGI} messaggi cadono i più vecchi`, () => {
  let s = tavolo();
  for (let i = 0; i < MAX_MESSAGGI + 25; i++) {
    s = accoda(s, { id: "m" + i, di: "a", nome: "Ada", testo: "n" + i, t: i });
  }
  eq(s.chat.length, MAX_MESSAGGI);
  eq(s.chat[s.chat.length - 1].testo, "n" + (MAX_MESSAGGI + 24), "l'ultimo deve restare");
  eq(s.chat[0].testo, "n25", "i primi devono essere caduti");
});

prova("Ogni messaggio alza la versione: il polling se ne accorge", () => {
  const s = tavolo();
  const prima = s.versione;
  accoda(s, { id: "x", di: "a", nome: "Ada", testo: "ciao", t: 1 });
  eq(s.versione, prima + 1);
});

console.log("\n── Interruttore dell'host ──");

prova("Solo chi ha creato la stanza può spegnere la chat", () => {
  vero(applicaAzione(tavolo(), { tipo: "impostaChat", giocatoreId: "b", aperta: false }).errore);
});

prova("Spenta la chat, nessuno scrive più", () => {
  const s = applicaAzione(tavolo(), { tipo: "impostaChat", giocatoreId: "a", aperta: false }).stato;
  eq(s.chatAperta, false);
  vero(preparaMessaggio(s, "a", "ciao").errore, "nemmeno l'host deve poter scrivere a chat spenta");
});

prova("Spegnere la chat cancella quello che c'era", () => {
  let s = tavolo();
  s = accoda(s, preparaMessaggio(s, "a", "un messaggio").messaggio);
  eq(s.chat.length, 1);
  const dopo = applicaAzione(s, { tipo: "impostaChat", giocatoreId: "a", aperta: false }).stato;
  eq(dopo.chat.length, 0);
});

prova("Si può riaccendere", () => {
  let s = applicaAzione(tavolo(), { tipo: "impostaChat", giocatoreId: "a", aperta: false }).stato;
  s = applicaAzione(s, { tipo: "impostaChat", giocatoreId: "a", aperta: true }).stato;
  eq(s.chatAperta, true);
  eq(preparaMessaggio(s, "a", "di nuovo qui").errore, undefined);
});

console.log("\n── Durata ──");

prova("La chat vive dentro la stanza, quindi muore con lei", () => {
  const s = tavolo();
  vero(Array.isArray(s.chat), "la chat deve stare nel documento della stanza");
  vero(!("chatId" in s), "nessun riferimento a una collezione esterna: niente da cancellare a parte");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
