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
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { traduci, chiaviMancanti, dizionari, LINGUE } from "../src/i18n/index.js";
import { getPacchetto } from "../src/game/mercati/indice.js";
import { soldi } from "../src/game/finanze.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try {
    const r = fn();
    /* Una prova asincrona qui passerebbe SEMPRE: `fn()` restituisce una
       promessa, nessuno l'aspetta, e le sue verifiche non vengono mai
       eseguite. È già successo — sette prove in sei file non controllavano
       più niente da settimane. Meglio rumore che silenzio. */
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le sue verifiche non verrebbero eseguite");
    }
    console.log("  ✅ " + nome); passati++;
  }
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

prova("Nessuna chiave dichiarata due volte", () => {
  /* In un oggetto JavaScript la seconda dichiarazione vince e la prima
     sparisce senza un fiato: né il compilatore né i test se ne accorgono.
     Ci sono già cascato aggiungendo `tiraIlDado` una seconda volta senza
     sapere che esisteva. */
  for (const f of ["it", "en"]) {
    const testo = readFileSync(new URL(`../src/i18n/${f}.js`, import.meta.url), "utf8");
    const perSezione = new Map();
    let sezione = "";
    for (const riga of testo.split("\n")) {
      const apre = riga.match(/^  (\w+): \{/);
      if (apre) { sezione = apre[1]; continue; }
      if (/^  \},?$/.test(riga)) { sezione = ""; continue; }
      const chiave = riga.match(/^\s{4}(\w+):/);
      if (!chiave || !sezione) continue;
      const dove = `${sezione}.${chiave[1]}`;
      perSezione.set(dove, (perSezione.get(dove) || 0) + 1);
    }
    const doppie = [...perSezione].filter(([, n]) => n > 1).map(([k]) => k);
    vero(doppie.length === 0, `"${f}" dichiara due volte: ${doppie.join(", ")}`);
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


/* ── Il registro della partita ─────────────────────────────── */
import { MESSAGGI, testoRiga } from "../src/game/messaggi.js";
import { creaStanza, applicaAzione } from "../src/game/motore.js";

console.log("\n── Il registro parla la lingua scelta ──");

prova("Ogni messaggio esiste in tutte le lingue", () => {
  const chiavi = Object.keys(MESSAGGI.it);
  vero(chiavi.length > 40, `solo ${chiavi.length} messaggi`);
  for (const id of Object.keys(MESSAGGI)) {
    for (const k of chiavi) {
      vero(MESSAGGI[id][k], `"${id}" non traduce ${k}`);
    }
  }
});

prova("I segnaposto coincidono fra le lingue", () => {
  const segna = (t) => (String(t).match(/\{(\w+)\}/g) || []).sort().join(",");
  for (const k of Object.keys(MESSAGGI.it)) {
    for (const id of Object.keys(MESSAGGI)) {
      eq(segna(MESSAGGI[id][k]), segna(MESSAGGI.it[k]), `${id}.${k}:`);
    }
  }
});

prova("Il motore salva chiave e valori, non solo il testo", () => {
  let s = creaStanza("REGI", "a", { seme: 4, mercatoId: "roma" });
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "Ada", professioneId: "quadro", sognoId: "sg01" }).stato;
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "Bo", professioneId: "meccanico", sognoId: "sg02" }).stato;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
  const conChiave = s.registro.filter((r) => r.k);
  vero(conChiave.length === s.registro.length,
    `${s.registro.length - conChiave.length} righe senza chiave`);
  for (const r of conChiave) {
    vero(testoRiga(r, "it").length > 0);
    vero(testoRiga(r, "en").length > 0);
  }
});

prova("La stessa riga cambia lingua", () => {
  const riga = { k: "r03", v: { nome: "Ada", importo: "2.920 €" }, testo: "…" };
  const it = testoRiga(riga, "it"), en = testoRiga(riga, "en");
  vero(it !== en, "le due lingue producono lo stesso testo");
  vero(it.includes("Ada") && en.includes("Ada"), "i valori vanno sostituiti in entrambe");
  vero(it.includes("2.920 €") && en.includes("2.920 €"), "gli importi restano nella valuta del mercato");
});

prova("Una riga vecchia senza chiave resta leggibile", () => {
  /* Le stanze durano 48 ore: al momento di un aggiornamento ci sono partite
     in corso con righe salvate nel formato vecchio. */
  eq(testoRiga({ testo: "Testo di prima" }, "en"), "Testo di prima");
  eq(testoRiga({ k: "chiave-inventata", testo: "Ripiego" }, "en"), "Ripiego");
});

prova("Nessun messaggio scrive un simbolo di valuta a mano", () => {
  for (const id of Object.keys(MESSAGGI)) {
    for (const [k, v] of Object.entries(MESSAGGI[id])) {
      vero(!/\$|€(?!\})/.test(v.replace(/\{\w+\}/g, "")),
        `${id}.${k} contiene un simbolo fisso: la valuta viene dal mercato`);
    }
  }
});

prova("Nessun componente scrive un simbolo di valuta a mano", () => {
  /* La spiegazione delle taglie diceva "$5.000" dentro una partita in euro,
     e la nota sui prestiti "$1.000 costa $100". La valuta viene dal mercato:
     scriverla a mano funziona finché il gioco ha una valuta sola. */
  const RADICE = new URL("..", import.meta.url).pathname;
  const file = (dir, out = []) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) file(p, out);
      else if (/\.jsx$/.test(p)) out.push(p);
    }
    return out;
  };
  const guai = [];
  for (const f of file(join(RADICE, "src"))) {
    const src = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");
    for (const m of src.matchAll(/[$€£]\s?[0-9][\d.,]*/g)) {
      guai.push(`${relative(RADICE, f)}: "${m[0]}"`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
