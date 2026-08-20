/**
 * Verifiche dei contenuti didattici.
 *   node scripts/prova-contenuti.mjs
 *
 * ═══ PERCHÉ QUESTI TEST ESISTONO ═══
 *
 * In Italia la consulenza in materia di investimenti è attività riservata:
 * richiede l'iscrizione all'albo OCF, e svolgerla senza è un reato punito
 * dall'art. 166 del Testo Unico della Finanza.
 *
 * Il confine è netto — spiegare un meccanismo si può, dire a qualcuno che
 * cosa comprare no — ma è anche facilissimo da attraversare per sbaglio,
 * scrivendo una frase in più a fine paragrafo. Una lezione che finisce con
 * "quindi conviene comprare" ha appena cambiato natura giuridica.
 *
 * Questi test leggono ogni riga di testo e cercano le formule che
 * tradirebbero il confine. Non sostituiscono un parere legale: fanno in
 * modo che una modifica distratta non passi inosservata.
 */
import { LEZIONI, AVVERTENZA } from "../src/contenuti/lezioni.js";
import { QUESITI, testoDi, quesitoDelGiorno } from "../src/contenuti/quesiti.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};

/** Tutto il testo pubblicato, in un pezzo solo. */
function tuttoIlTesto() {
  const pezzi = [AVVERTENZA];
  for (const l of LEZIONI) {
    pezzi.push(l.titolo, l.sommario, ...l.corpo());
  }
  for (const q of QUESITI) {
    pezzi.push(q.titolo, testoDi(q.domanda), testoDi(q.spiegazione));
    for (const o of q.opzioni) pezzi.push(o.testo);
  }
  return pezzi.join("\n");
}

console.log("\n── Il confine dell'art. 166 TUF ──");

prova("Nessuna esortazione a comprare o vendere", () => {
  const testo = tuttoIlTesto().toLowerCase();
  /* Formule che trasformano una spiegazione in una raccomandazione. */
  const vietate = [
    "ti consiglio", "consigliamo", "dovresti comprare", "dovresti investire",
    "conviene comprare", "conviene investire", "compra subito", "da comprare assolutamente",
    "il migliore investimento", "investimento sicuro", "rendimento garantito",
    "non puoi perdere", "soldi facili",
  ];
  for (const v of vietate) {
    vero(!testo.includes(v), `formula vietata nei contenuti: "${v}"`);
  }
});

prova("Nessuno strumento finanziario reale viene nominato", () => {
  const testo = tuttoIlTesto();
  /* Nominare un titolo o un emittente vero avvicina pericolosamente la
     spiegazione alla raccomandazione, anche senza dirlo. */
  const nomi = [
    "BTP", "BOT", "CCT", "S&P 500", "MSCI", "Nasdaq", "FTSE MIB",
    "Vanguard", "iShares", "Amundi", "Bitcoin", "Tesla",
  ];
  for (const n of nomi) {
    vero(!testo.includes(n), `nominato uno strumento reale: "${n}"`);
  }
});

prova("Dove si parla di ETF si spiega e ci si ferma", () => {
  const l = LEZIONI.find((x) => x.id === "che-cose-un-etf");
  vero(l, "manca la lezione sugli ETF");
  const corpo = l.corpo().join(" ");
  vero(/non è una garanzia/i.test(corpo), "va detto che non garantisce nulla");
  vero(/consulenza in materia di investimenti/i.test(corpo),
    "va dichiarato perché ci si ferma lì");
});

prova("L'avvertenza dice le due cose che deve dire", () => {
  vero(/non è consulenza/i.test(AVVERTENZA), "deve negare di essere consulenza");
  vero(/non suggerisce/i.test(AVVERTENZA), "deve negare di suggerire acquisti");
});

console.log("\n── Le lezioni ──");

prova("Ogni lezione è completa", () => {
  for (const l of LEZIONI) {
    vero(l.id && l.titolo && l.sommario, `lezione incompleta: ${l.id}`);
    vero(typeof l.corpo === "function", `${l.id}: il corpo deve essere calcolato`);
    vero(l.minuti > 0 && l.minuti < 15, `${l.id}: durata implausibile`);
  }
});

prova("Nessuna lezione è vuota o troncata", () => {
  for (const l of LEZIONI) {
    const p = l.corpo();
    vero(Array.isArray(p) && p.length >= 2, `${l.id}: servono almeno due paragrafi`);
    for (const t of p) {
      vero(typeof t === "string" && t.trim().length > 40, `${l.id}: paragrafo troppo corto`);
      vero(!t.includes("undefined") && !t.includes("NaN"),
        `${l.id}: un valore calcolato non è stato risolto`);
    }
  }
});

prova("Gli identificativi sono unici", () => {
  eq(new Set(LEZIONI.map((l) => l.id)).size, LEZIONI.length);
});

prova("Gli esempi usano i numeri veri del mercato", () => {
  const rata = LEZIONI.find((l) => l.id === "rata").corpo().join(" ");
  vero(/€/.test(rata), "l'esempio deve mostrare importi");
  const zone = LEZIONI.find((l) => l.id === "centro-periferia").corpo().join(" ");
  vero(/Centro Storico/.test(zone) && /Tor Bella Monaca/.test(zone),
    "l'esempio deve citare zone vere");
});

console.log("\n── I quesiti ──");

prova("Ogni quesito ha una risposta giusta fra le opzioni", () => {
  for (const q of QUESITI) {
    vero(q.opzioni.length >= 2, `${q.id}: servono almeno due opzioni`);
    vero(q.opzioni.some((o) => o.id === q.giusta), `${q.id}: la risposta giusta non è fra le opzioni`);
    eq(new Set(q.opzioni.map((o) => o.id)).size, q.opzioni.length, `${q.id}: opzioni duplicate`);
  }
});

prova("Ogni quesito spiega, non si limita a correggere", () => {
  for (const q of QUESITI) {
    const s = testoDi(q.spiegazione);
    vero(typeof s === "string" && s.length > 80, `${q.id}: spiegazione troppo breve`);
    vero(!s.includes("undefined") && !s.includes("NaN"), `${q.id}: valore non risolto`);
  }
});

prova("La domanda si risolve senza informazioni mancanti", () => {
  for (const q of QUESITI) {
    const d = testoDi(q.domanda);
    vero(typeof d === "string" && d.length > 40, `${q.id}: domanda troppo breve`);
    vero(!d.includes("undefined") && !d.includes("NaN"), `${q.id}: valore non risolto`);
  }
});

prova("Ogni quesito rimanda a una lezione che esiste", () => {
  const ids = new Set(LEZIONI.map((l) => l.id));
  for (const q of QUESITI) {
    if (q.lezione) vero(ids.has(q.lezione), `${q.id}: rimanda a "${q.lezione}", che non esiste`);
  }
});

prova("Gli identificativi dei quesiti sono unici", () => {
  eq(new Set(QUESITI.map((q) => q.id)).size, QUESITI.length);
});

prova("La risposta giusta non è sempre nella stessa posizione", () => {
  const posizioni = QUESITI.map((q) => q.opzioni.findIndex((o) => o.id === q.giusta));
  vero(new Set(posizioni).size >= 2, `sempre in posizione ${posizioni[0]}: si indovina senza leggere`);
});

console.log("\n── Il quesito del giorno ──");

prova("È lo stesso per tutti nello stesso giorno", () => {
  eq(quesitoDelGiorno("2026-08-21").id, quesitoDelGiorno("2026-08-21").id);
});

prova("Cambia nei giorni successivi", () => {
  const g = ["2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25", "2026-08-26"];
  const visti = new Set(g.map((x) => quesitoDelGiorno(x).id));
  vero(visti.size >= 3, `troppo ripetitivo: ${[...visti].join(", ")}`);
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
