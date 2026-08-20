/**
 * Verifica che ogni nome usato sia stato importato.
 *   node scripts/prova-import.mjs
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * `vite build` non se ne accorge. Un componente che usa `partiteAperte()`
 * senza averlo importato compila senza una parola, e si rompe solo quando
 * qualcuno apre quella schermata — cioè, se va male, in produzione.
 *
 * È successo due volte di seguito mentre si spostavano pezzi di
 * `Ingresso.jsx`: una modifica sistemava il codice ma perdeva la riga di
 * import, la compilazione passava, e la pagina mostrava la schermata di
 * recupero. Nessun test lo prendeva, perché i test girano sui moduli e non
 * sui componenti.
 *
 * Questo controllo è grezzo di proposito: raccoglie i nomi esportati dai
 * NOSTRI moduli e, per ogni file che ne usa uno, pretende che ci sia una
 * riga di import corrispondente. Non è un analizzatore di portata e non
 * pretende di esserlo — copre l'errore che ci ha morso davvero.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const SRC = join(QUI, "..", "src");

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};

/** Tutti i file sorgente sotto src/. */
function file(dir = SRC, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) file(p, out);
    else if (/\.(js|jsx)$/.test(p)) out.push(p);
  }
  return out;
}

const TUTTI = file();

/** I nomi esportati da ciascun modulo nostro. */
const esportati = new Map();
for (const f of TUTTI) {
  const src = readFileSync(f, "utf8");
  const nomi = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g)) nomi.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const pezzo of m[1].split(",")) {
      const nome = pezzo.trim().split(/\s+as\s+/).pop().trim();
      if (/^\w+$/.test(nome)) nomi.add(nome);
    }
  }
  esportati.set(f, nomi);
}

/* Nomi definiti in più moduli: ambigui, si saltano. */
const conteggio = new Map();
for (const nomi of esportati.values()) {
  for (const n of nomi) conteggio.set(n, (conteggio.get(n) || 0) + 1);
}
const univoci = new Map();
for (const [f, nomi] of esportati) {
  for (const n of nomi) if (conteggio.get(n) === 1) univoci.set(n, f);
}

/** I nomi importati da un file, comunque siano scritti. */
function importati(src) {
  const nomi = new Set();
  for (const m of src.matchAll(/import\s+([^;]+?)\s+from\s+["'][^"']+["']/g)) {
    const clausola = m[1];
    for (const g of clausola.matchAll(/\{([^}]*)\}/g)) {
      for (const pezzo of g[1].split(",")) {
        const nome = pezzo.trim().split(/\s+as\s+/).pop().trim();
        if (nome) nomi.add(nome);
      }
    }
    const diretto = clausola.replace(/\{[^}]*\}/g, "").replace(/,/g, " ").trim();
    for (const n of diretto.split(/\s+/)) if (/^\w+$/.test(n)) nomi.add(n);
    for (const g of clausola.matchAll(/\*\s+as\s+(\w+)/g)) nomi.add(g[1]);
  }
  return nomi;
}

/** Il testo senza commenti e senza stringhe: solo codice vero. */
const soloCodice = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n]*/g, " ")
    .replace(/`(?:[^`\\]|\\.)*`/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ")
    .replace(/'(?:[^'\\]|\\.)*'/g, " ");

console.log("\n── Ogni nome usato deve essere importato ──");

prova("Nessun riferimento a un nome non importato", () => {
  const guai = [];
  for (const f of TUTTI) {
    const grezzo = readFileSync(f, "utf8");
    const codice = soloCodice(grezzo);
    const dentro = importati(grezzo);
    const propri = esportati.get(f);

    for (const [nome, origine] of univoci) {
      if (origine === f) continue;             // è definito qui
      if (dentro.has(nome) || propri.has(nome)) continue;
      /* Chiamata di funzione, oppure componente JSX (che comincia sempre
         per maiuscola). Niente spazi prima della parentesi: "Tira il dado"
         seguito da un tag di chiusura non è una chiamata a dado(). */
      const usato = new RegExp(`(?<![.\\w$])${nome}\\(`).test(codice)
                 || (/^[A-Z]/.test(nome) && new RegExp(`<${nome}[\\s/>]`).test(codice));
      if (!usato) continue;
      /* Potrebbe essere una variabile locale con lo stesso nome. */
      const locale = new RegExp(`(?:const|let|var|function|class)\\s+${nome}\\b`).test(codice)
                  || new RegExp(`\\b${nome}\\s*[,}]\\s*=|{[^}]*\\b${nome}\\b[^}]*}\\s*=`).test(codice);
      if (locale) continue;
      guai.push(`${relative(SRC, f)} usa "${nome}" (da ${relative(SRC, origine)}) senza importarlo`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log("\n── Gli import puntano a file che esistono ──");

prova("Nessun percorso relativo rotto", () => {
  const guai = [];
  for (const f of TUTTI) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
      /* Vite ammette suffissi come "?raw": il file è quello che sta prima. */
      const p = join(dirname(f), m[1].split("?")[0]);
      try { statSync(p); } catch { guai.push(`${relative(SRC, f)} importa "${m[1]}", che non esiste`); }
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
