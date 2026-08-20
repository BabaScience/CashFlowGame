/**
 * Verifiche del registro dei mercati.
 *   node scripts/prova-mercati.mjs
 *
 * Il guaio che questi test sorvegliano non è visibile finché non capita, e
 * quando capita rovina la partita di qualcuno: una stanza salva gli indici
 * dei mazzi già mescolati e vive fino a 48 ore, quindi un aggiornamento dei
 * dati pubblicato a metà partita distribuirebbe carte diverse da quelle
 * mescolate — o andrebbe fuori dai limiti di un mazzo accorciato.
 *
 * Da qui le due garanzie: ogni stanza si ancora a { mercatoId, versioneDati }
 * e rilegge sempre quella; i file di versione non si modificano mai.
 */
import { creaStanza, applicaAzione } from "../src/game/motore.js";
import {
  getPacchetto, pacchettoDi, versioneCorrente, esiste, tutteLeVersioni,
  MERCATI, MERCATO_PREDEFINITO,
} from "../src/game/mercati/indice.js";
import { soldi, VALUTA_PREDEFINITA } from "../src/game/finanze.js";

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

console.log("\n── Il registro ──");

prova("C'è almeno un mercato, ed è quello predefinito", () => {
  vero(MERCATI.length >= 1);
  vero(MERCATI.some((m) => m.id === MERCATO_PREDEFINITO));
});

prova("Ogni mercato annunciato esiste davvero nel registro", () => {
  for (const m of MERCATI) {
    vero(esiste(m.id, m.versione), `${m.id}:${m.versione} annunciato ma non registrato`);
  }
});

prova("Ogni versione registrata dichiara id e versione coerenti con la chiave", () => {
  for (const chiave of tutteLeVersioni()) {
    const [id, versione] = chiave.split(":");
    const p = getPacchetto(id, versione);
    eq(p.id, id, "id del pacchetto:");
    eq(p.versione, versione, "versione del pacchetto:");
  }
});

console.log("\n── Che cosa deve contenere un pacchetto ──");

prova("Nessun pacchetto è incompleto", () => {
  const richiesti = ["id", "versione", "nome", "valuta", "obiettivoRendita",
                     "professioni", "mazzi", "conteggi", "affariLargo", "sogni",
                     "etichetteSpese", "debitiEstinguibili"];
  for (const chiave of tutteLeVersioni()) {
    const [id, v] = chiave.split(":");
    const p = getPacchetto(id, v);
    for (const campo of richiesti) {
      vero(p[campo] !== undefined, `${chiave} non ha "${campo}"`);
    }
    vero(p.professioni.length >= 2, `${chiave}: servono almeno due professioni`);
    vero(p.sogni.length >= 1, `${chiave}: serve almeno un sogno`);
  }
});

prova("I conteggi dei mazzi corrispondono ai mazzi veri", () => {
  for (const chiave of tutteLeVersioni()) {
    const [id, v] = chiave.split(":");
    const p = getPacchetto(id, v);
    for (const nome of ["piccoli", "grandi", "mercato", "extra"]) {
      eq(p.conteggi[nome], p.mazzi[nome].length,
        `${chiave}: conteggio "${nome}" fuori sincrono con il mazzo —`);
    }
  }
});

prova("La valuta è completa: senza, gli importi escono senza simbolo", () => {
  for (const chiave of tutteLeVersioni()) {
    const [id, v] = chiave.split(":");
    const { valuta } = getPacchetto(id, v);
    vero(typeof valuta.simbolo === "string" && valuta.simbolo.length, `${chiave}: manca il simbolo`);
    vero(["prefisso", "suffisso"].includes(valuta.posizione), `${chiave}: posizione non valida`);
  }
});

console.log("\n── I file di versione non si modificano ──");

prova("Un pacchetto è congelato: non lo si può alterare a caldo", () => {
  const p = getPacchetto();
  vero(Object.isFrozen(p), "il pacchetto deve essere congelato");
  const prima = p.obiettivoRendita;
  try { p.obiettivoRendita = 1; } catch { /* in modalità stretta lancia */ }
  eq(p.obiettivoRendita, prima, "il valore non deve poter cambiare:");
});

console.log("\n── L'ancoraggio della stanza ──");

prova("Una stanza nuova registra mercato e versione", () => {
  const s = creaStanza("AAAA", "h", { seme: 1 });
  eq(s.mercatoId, MERCATO_PREDEFINITO);
  eq(s.versioneDati, versioneCorrente(MERCATO_PREDEFINITO));
});

prova("La stanza rilegge sempre il proprio pacchetto", () => {
  const s = creaStanza("BBBB", "h", { seme: 1 });
  eq(pacchettoDi(s).versione, s.versioneDati);
});

prova("I mazzi si mescolano sulla misura del pacchetto della stanza", () => {
  const s = creaStanza("CCCC", "h", { seme: 1 });
  const p = pacchettoDi(s);
  for (const nome of ["piccoli", "grandi", "mercato", "extra"]) {
    eq(s.mazzi[nome].ordine.length, p.conteggi[nome], `mazzo "${nome}":`);
    // Gli indici salvati devono essere validi nel mazzo di QUESTA versione.
    for (const i of s.mazzi[nome].ordine) {
      vero(i >= 0 && i < p.mazzi[nome].length, `indice ${i} fuori dal mazzo "${nome}"`);
    }
  }
});

prova("Una versione sconosciuta non fa esplodere la partita", () => {
  const s = creaStanza("DDDD", "h", { seme: 1 });
  s.versioneDati = "1999.01";        // come una stanza vecchia dopo un ritiro
  const p = pacchettoDi(s);
  vero(p && p.professioni.length, "deve ripiegare su dati validi");
});

prova("Un mercato sconosciuto ripiega sul predefinito", () => {
  const p = getPacchetto("atlantide", "2026.08");
  eq(p.id, MERCATO_PREDEFINITO);
});

console.log("\n── La valuta arriva dal mercato ──");

prova("soldi() usa la valuta che gli si passa", () => {
  eq(soldi(1234, { simbolo: "€", posizione: "suffisso" }), "1.234 €");
  eq(soldi(1234, { simbolo: "€", posizione: "prefisso" }), "€1.234");
  eq(soldi(-1234, { simbolo: "€", posizione: "suffisso" }), "-1.234 €");
});

prova("Si può passare direttamente il pacchetto", () => {
  const p = getPacchetto();
  eq(soldi(1000, p), soldi(1000, p.valuta));
});

prova("Senza valuta si ripiega, non si resta senza simbolo", () => {
  vero(soldi(50).length > 2);
  vero(VALUTA_PREDEFINITA.simbolo);
});

console.log("\n── Una partita usa i dati del proprio mercato ──");

prova("Le professioni del giocatore vengono dal pacchetto della stanza", () => {
  let s = creaStanza("EEEE", "h", { seme: 3 });
  const p = pacchettoDi(s);
  const prima = p.professioni[0];
  s = applicaAzione(s, {
    tipo: "entra", giocatoreId: "h", nome: "Tizio",
    professioneId: prima.id, sognoId: p.sogni[0].id,
  }).stato;
  eq(s.giocatori[0].stipendio, prima.stipendio, "stipendio dal pacchetto:");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
