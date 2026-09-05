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
import { getPacchetto, MERCATI } from "../src/game/mercati/indice.js";
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

    /* E nemmeno due volte la stessa SEZIONE. È successo: aggiungendo un
       blocco `scheda:` senza sapere che ce n'era già uno, il secondo ha
       vinto e le chiavi del primo sono sparite — fra cui una che
       l'interfaccia usava davvero, che da allora mostrava il nome della
       chiave al posto della frase. */
    const sezioni = new Map();
    for (const riga of testo.split("\n")) {
      const apre = riga.match(/^  (\w+): \{/);
      if (apre) sezioni.set(apre[1], (sezioni.get(apre[1]) || 0) + 1);
    }
    const sezDoppie = [...sezioni].filter(([, n]) => n > 1).map(([k]) => k);
    vero(sezDoppie.length === 0, `"${f}" dichiara due volte la sezione: ${sezDoppie.join(", ")}`);
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

prova("Il registro esiste in ogni lingua dichiarata", () => {
  /* Il controllo qui sotto passa in rassegna le lingue PRESENTI in MESSAGGI:
     una lingua aggiunta all'interfaccia ma dimenticata nel registro non
     verrebbe vista, e chi la sceglie leggerebbe la partita in italiano. */
  for (const l of LINGUE) {
    vero(MESSAGGI[l.id], `"${l.id}" è fra le lingue del gioco ma non nel registro`);
  }
});

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

prova("Ogni t(\"…\") dell'interfaccia trova la sua voce", () => {
  /* Il difetto che questo test insegue è appena successo: togliendo una
     funzione ho cancellato `scheda.alMese` e, con lo stesso nome in un'altra
     sezione, anche `ingresso.alMese`. Nessun test si è mosso; la schermata
     d'ingresso mostrava la stringa "ingresso.alMese" al posto dello
     stipendio. Una chiave che non esiste non è un errore: è testo. */
  const RADICE = new URL("..", import.meta.url).pathname;
  const file = (dir, out = []) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) file(p, out);
      else if (/\.(jsx|js)$/.test(p)) out.push(p);
    }
    return out;
  };
  const note = new Set(foglie(dizionari.it));
  const guai = [];
  for (const f of file(join(RADICE, "src"))) {
    const src = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");
    /* Solo le chiavi scritte per intero: `t(\`scheda.cosaFa_${id}\`)` si
       compone a runtime e questo test non può seguirlo. */
    for (const m of src.matchAll(/\bt\(\s*"([\w.]+)"/g)) {
      if (!note.has(m[1])) guai.push(`${relative(RADICE, f)}: t("${m[1]}") non esiste nel dizionario`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log("\n── I contenuti dei mercati ──");

prova("Ogni mercato dichiara le stesse lingue del gioco", () => {
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    for (const l of LINGUE.filter((x) => x.id !== "it")) {
      vero(p.lingue?.[l.id], `${m.id} non ha i contenuti in "${l.id}"`);
    }
  }
});

prova("Professioni e sogni sono tradotti in ogni lingua", () => {
  /* Sono le due cose che si leggono prima di cominciare: se restano in
     italiano, l'interfaccia tradotta non serve a niente. */
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    for (const [id, tav] of Object.entries(p.lingue || {})) {
      for (const prof of p.professioni) {
        vero(tav.professioni?.[prof.id]?.nome,
          `${m.id}/${id}: manca la professione "${prof.id}"`);
      }
      for (const s of p.sogni) {
        vero(tav.sogni?.[s.id]?.nome, `${m.id}/${id}: manca il sogno "${s.id}"`);
      }
    }
  }
});

prova("Le voci del conto economico sono tradotte", () => {
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    for (const [id, tav] of Object.entries(p.lingue || {})) {
      for (const k of Object.keys(p.etichetteSpese)) {
        vero(tav.etichetteSpese?.[k], `${m.id}/${id}: manca la spesa "${k}"`);
      }
      for (const k of Object.keys(p.etichettePassivita)) {
        vero(tav.etichettePassivita?.[k], `${m.id}/${id}: manca la passività "${k}"`);
      }
    }
  }
});

prova("Ogni carta è tradotta in ogni lingua", () => {
  /* Le carte dei mazzi non hanno una chiave: la chiave È la frase
     italiana. Il rovescio della medaglia è che basta correggere un refuso
     nel mazzo perché la traduzione smetta di agganciarsi, in silenzio e
     senza rompere niente. Questo test è l'aggancio. */
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    const tutte = [...Object.values(p.mazzi).flat(), ...p.affariLargo];
    for (const [id, tav] of Object.entries(p.lingue || {})) {
      const mancanti = [];
      for (const c of tutte) {
        if (!tav.carte?.[c.nome]) mancanti.push(c.nome);
        if (c.testo && !tav.carte?.[c.testo]) mancanti.push(c.testo);
      }
      vero(mancanti.length === 0,
        `${m.id}/${id}: ${mancanti.length} stringhe non tradotte, la prima è "${mancanti[0]}"`);
    }
  }
});

prova("Nessuna traduzione di carta punta nel vuoto", () => {
  /* Una chiave che non corrisponde più a nessuna carta è una traduzione
     scritta e mai mostrata: di solito vuol dire che il mazzo è cambiato e
     la tavola no. */
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    const vive = new Set();
    for (const c of [...Object.values(p.mazzi).flat(), ...p.affariLargo]) {
      vive.add(c.nome);
      if (c.testo) vive.add(c.testo);
    }
    for (const [id, tav] of Object.entries(p.lingue || {})) {
      for (const k of Object.keys(tav.carte || {})) {
        vero(vive.has(k), `${m.id}/${id}: "${k}" non è più il testo di nessuna carta`);
      }
    }
  }
});

prova("Tradurre non tocca i numeri", () => {
  /* Un mercato resta il suo mercato: Roma costa quello che costa a Roma,
     in euro, anche letta in francese. */
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    for (const tav of Object.values(p.lingue || {})) {
      for (const voce of Object.values(tav.professioni || {})) {
        vero(voce.stipendio === undefined, "una traduzione non può cambiare uno stipendio");
        vero(voce.spese === undefined, "una traduzione non può cambiare le spese");
      }
      /* La tavola delle carte è testo → testo, e basta: se qualcuno ci
         infilasse un oggetto tornerebbe a poter riscrivere un prezzo. */
      for (const voce of Object.values(tav.carte || {})) {
        vero(typeof voce === "string", "una carta si traduce con una frase, non con un oggetto");
      }
    }
  }
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
