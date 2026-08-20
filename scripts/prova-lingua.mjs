/**
 * Verifiche delle lingue.
 *   node scripts/prova-lingua.mjs
 *
 * Il guaio delle traduzioni non è tradurre male: è dimenticare una chiave e
 * accorgersene quando qualcuno trova un pulsante vuoto. Questi test
 * confrontano ogni lingua col dizionario italiano, che è la fonte.
 *
 * Verificano anche la separazione fra lingua e mercato, che è il motivo per
 * cui esiste tutto questo: cambiare lingua non deve toccare un prezzo.
 */
import { traduci, chiaviMancanti, dizionari, LINGUE } from "../src/i18n/index.js";
import { getPacchetto } from "../src/game/mercati/indice.js";
import { soldi } from "../src/game/finanze.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

const ALTRE = LINGUE.map((l) => l.id).filter((id) => id !== "it");

/** Tutte le chiave-foglia di un dizionario. */
function foglie(obj, prefisso = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefisso ? `${prefisso}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...foglie(v, p));
    else out.push(p);
  }
  return out;
}

console.log("\n── Completezza ──");

for (const id of ALTRE) {
  prova(`"${id}" non ha chiavi mancanti rispetto all'italiano`, () => {
    const m = chiaviMancanti(id);
    vero(m.length === 0, `mancano ${m.length}: ${m.slice(0, 6).join(", ")}`);
  });
}

prova("Nessuna lingua ha chiavi che l'italiano non conosce", () => {
  const base = new Set(foglie(dizionari.it));
  for (const id of ALTRE) {
    const extra = foglie(dizionari[id]).filter((k) => !base.has(k));
    vero(extra.length === 0, `"${id}" ha chiavi orfane: ${extra.slice(0, 5).join(", ")}`);
  }
});

prova("Nessuna traduzione è vuota", () => {
  for (const id of Object.keys(dizionari)) {
    for (const chiave of foglie(dizionari[id])) {
      const v = traduci(id, chiave);
      vero(typeof v === "string" && v.trim().length > 0, `"${id}" · ${chiave} è vuota`);
    }
  }
});

console.log("\n── I segnaposto ──");

prova("Ogni lingua usa gli stessi segnaposto dell'italiano", () => {
  const segna = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(",");
  for (const chiave of foglie(dizionari.it)) {
    const atteso = segna(traduci("it", chiave));
    for (const id of ALTRE) {
      eq(segna(traduci(id, chiave)), atteso, `"${id}" · ${chiave}:`);
    }
  }
});

prova("I valori vengono sostituiti davvero", () => {
  const r = traduci("it", "partita.toccaA", { nome: "Giulia" });
  vero(r.includes("Giulia"), r);
  vero(!r.includes("{nome}"), "segnaposto non sostituito");
});

prova("Un valore mancante resta visibile invece di sparire", () => {
  vero(traduci("it", "partita.toccaA", {}).includes("{nome}"));
});

console.log("\n── I ripieghi ──");

prova("Una chiave sconosciuta restituisce la chiave, mai il vuoto", () => {
  eq(traduci("it", "non.esiste.affatto"), "non.esiste.affatto");
});

prova("Una lingua sconosciuta ripiega sull'italiano", () => {
  eq(traduci("xx", "ingresso.creaStanza"), traduci("it", "ingresso.creaStanza"));
});

console.log("\n── Lingua e mercato sono assi diversi ──");

prova("Cambiare lingua non tocca nessun prezzo", () => {
  const p = getPacchetto("roma");
  const prima = p.professioni.map((x) => x.stipendio).join();
  traduci("en", "ingresso.creaStanza");
  const dopo = getPacchetto("roma").professioni.map((x) => x.stipendio).join();
  eq(dopo, prima, "gli stipendi devono restare identici:");
});

prova("Roma resta in euro anche con l'interfaccia in inglese", () => {
  const p = getPacchetto("roma");
  eq(p.valuta.simbolo, "€");
  vero(soldi(1000, p.valuta).includes("€"), "l'importo deve restare in euro");
});

prova("Ogni mercato è giocabile in ogni lingua", () => {
  for (const mercato of ["classico", "roma"]) {
    for (const id of Object.keys(dizionari)) {
      const p = getPacchetto(mercato);
      vero(p && traduci(id, "partita.tiraIlDado").length > 0, `${mercato} in ${id}`);
    }
  }
});

console.log("\n── Il lessico del gioco attraversa le lingue ──");

prova("I due tracciati hanno un nome in ogni lingua, e sono diversi fra loro", () => {
  for (const id of Object.keys(dizionari)) {
    const ruota = traduci(id, "partita.ruota");
    const largo = traduci(id, "partita.largo");
    vero(ruota !== largo, `"${id}": i due tracciati hanno lo stesso nome`);
  }
});

prova("L'inglese non ha lasciato dentro l'italiano", () => {
  const sospette = ["Stanza", "Giocatori", "Registro", "Contanti", "Sogno"];
  for (const chiave of foglie(dizionari.en)) {
    const v = traduci("en", chiave);
    for (const parola of sospette) {
      vero(v !== parola, `"${chiave}" è rimasta in italiano: ${v}`);
    }
  }
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
