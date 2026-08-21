/**
 * Il nome del prodotto.
 *   node scripts/prova-marchio.mjs
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * `src/marchio.js` dichiara di essere l'unico posto in cui vive il nome. Non
 * lo era: `scripts/genera-immagini.py` se lo scriveva a mano, e le immagini
 * in `public/` sono rimaste indietro alla rinomina. Il risultato è che
 * l'anteprima mostrata a ogni link condiviso — WhatsApp, Telegram, Slack,
 * LinkedIn — ha continuato a dire in grande il nome vecchio e "Esci dalla
 * Corsa dei Topi", cioè esattamente le due espressioni che la rinomina
 * doveva togliere di mezzo.
 *
 * Nessun test guardava lì, perché lì non c'è codice: c'è un PNG.
 *
 * Questi controlli non sanno leggere un PNG. Sanno però verificare che
 * nessun testo spedito porti il nome vecchio, e che chi genera le immagini
 * il nome se lo vada a prendere invece di ricordarselo.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { MARCHIO, LESSICO } from "../src/marchio.js";

const RADICE = new URL("..", import.meta.url).pathname;

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/* Le espressioni che la rinomina doveva togliere di mezzo. Il confronto è
   senza maiuscole: "Cashflow" vale quanto "CASHFLOW".
 *
 * "cash flow" staccato NON è in elenco, ed è una distinzione che conta: il
 * flusso di cassa è un termine di contabilità che chiunque può usare, e il
 * registro inglese dice giustamente "negative cash flow". Quello che non si
 * può usare è il nome commerciale attaccato. Mettere al bando anche il
 * termine comune renderebbe il gioco incapace di nominare la cosa di cui
 * parla. */
const VECCHIE = ["cashflow", "corsa dei topi", "rat race"];

/* Dove si guarda: tutto ciò che viene spedito e si può leggere. La cartella
   del codice sorgente è esclusa a parte — vedi il test dedicato. */
const ESTENSIONI = [".html", ".svg", ".json", ".webmanifest", ".txt", ".md"];
const SALTA = new Set(["node_modules", ".git", "dist", ".vercel", "TODO.md", "LICENSE"]);

function file(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (SALTA.has(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) file(p, out);
    else if (ESTENSIONI.includes(extname(p))) out.push(p);
  }
  return out;
}

console.log("\n── Il nome vive in un posto solo ──");

prova("Il marchio si dichiara per intero", () => {
  for (const k of ["nome", "nomeBreve", "motto", "descrizione", "dominio"]) {
    vero(MARCHIO[k] && MARCHIO[k].length > 1, `manca marchio.${k}`);
  }
  vero(LESSICO.anelloInterno && LESSICO.anelloEsterno, "manca il lessico dei tracciati");
});

prova("Nessun nome vecchio nei file spediti", () => {
  const guai = [];
  for (const f of file(join(RADICE, "public")).concat([join(RADICE, "index.html")])) {
    const testo = readFileSync(f, "utf8").toLowerCase();
    for (const v of VECCHIE) {
      if (testo.includes(v)) guai.push(`${relative(RADICE, f)}: "${v}"`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

prova("Nessun nome vecchio nell'interfaccia", () => {
  const guai = [];
  const jsx = [];
  const cerca = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) cerca(p);
      else if (/\.(jsx?|mjs)$/.test(p)) jsx.push(p);
    }
  };
  cerca(join(RADICE, "src"));
  for (const f of jsx) {
    /* `marchio.js` cita i nomi scartati per spiegare perché lo sono: è
       documentazione della scelta, non un residuo. */
    if (/marchio\.js$/.test(f)) continue;
    const testo = readFileSync(f, "utf8").toLowerCase();
    for (const v of VECCHIE) {
      if (testo.includes(v)) guai.push(`${relative(RADICE, f)}: "${v}"`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log("\n── Chi disegna le immagini non si inventa il nome ──");

prova("Il generatore legge marchio.js invece di ricordarselo", () => {
  /* Il difetto vero: il generatore aveva il nome scritto dentro, quindi la
     rinomina non lo ha toccato e le immagini sono rimaste al nome vecchio
     senza che niente segnalasse niente. */
  const gen = readFileSync(join(RADICE, "scripts/genera-immagini.py"), "utf8");
  vero(/marchio\.js/.test(gen), "il generatore non legge src/marchio.js");
  const senzaCommenti = gen.split("\n").filter((r) => !r.trim().startsWith("#")).join("\n").toLowerCase();
  for (const v of VECCHIE) {
    vero(!senzaCommenti.includes(v), `il generatore scrive ancora "${v}"`);
  }
  vero(!senzaCommenti.includes('"' + MARCHIO.nome.toLowerCase() + '"'),
    "il nome è scritto a mano nel generatore invece di essere letto");
});

prova("Le immagini spedite esistono tutte", () => {
  /* Se una manca, il link condiviso perde l'anteprima e nessuno se ne
     accorge finché non lo condivide qualcuno. */
  const attese = [
    "favicon.svg", "favicon.ico", "favicon-16.png", "favicon-32.png",
    "apple-touch-icon.png", "icona-192.png", "icona-512.png",
    "icona-maskable-512.png", "og-banner.png", "manifest.webmanifest",
  ];
  for (const n of attese) {
    const p = join(RADICE, "public", n);
    vero(statSync(p).size > 200, `${n} manca o è vuoto`);
  }
});

prova("index.html e il manifesto dicono lo stesso nome", () => {
  const html = readFileSync(join(RADICE, "index.html"), "utf8");
  const man = JSON.parse(readFileSync(join(RADICE, "public/manifest.webmanifest"), "utf8"));
  vero(html.includes(MARCHIO.nome), "index.html non porta il nome del prodotto");
  vero(man.short_name === MARCHIO.nome || man.name.includes(MARCHIO.nome),
    `il manifesto dice "${man.short_name}"`);
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
