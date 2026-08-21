/**
 * Verifiche di accessibilità che una macchina può fare da sola.
 *   node scripts/prova-accessibilita.mjs
 *
 * Un audit vero richiede un browser e, soprattutto, qualcuno che provi il
 * gioco con un lettore di schermo. Questo controllo non lo sostituisce: fa
 * la parte deterministica, cioè i contrasti dei colori dichiarati e le
 * regole che si possono leggere nel sorgente.
 *
 * Perché conta più della media qui: la strada delle scuole passa da una
 * procedura d'acquisto pubblica, e un difetto di accessibilità scoperto in
 * quel momento costa una trattativa. Costa molto meno adesso.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");
const CSS = readFileSync(join(RADICE, "src/styles/globale.css"), "utf8");

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/* ── contrasto secondo WCAG ── */
const canale = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
function luminanza(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c) : h.match(/../g);
  const [r, g, b] = n.map((x) => parseInt(x, 16));
  return 0.2126 * canale(r) + 0.7152 * canale(g) + 0.0722 * canale(b);
}
function contrasto(a, b) {
  const [x, y] = [luminanza(a), luminanza(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** I token di colore dichiarati nel foglio di stile. */
function token() {
  const out = {};
  for (const m of CSS.matchAll(/--([\w-]+):\s*(#[0-9A-Fa-f]{3,8});/g)) out[m[1]] = m[2];
  return out;
}
const T = token();

console.log("\n── Contrasto dei colori dichiarati ──");

/* Coppie che compaiono davvero nell'interfaccia. */
const COPPIE = [
  ["inchiostro", "carta", 4.5, "testo normale sulla carta chiara"],
  ["tenue-carta", "carta", 4.5, "testo secondario sulla carta chiara"],
  ["verde-testo", "carta", 4.5, "importi positivi sulla carta"],
  ["rosso", "carta", 4.5, "importi negativi sulla carta"],
  ["carta", "tavolo", 4.5, "testo chiaro sul tavolo scuro"],
  ["carta", "tavolo-alto", 4.5, "testo chiaro sulle carte scure"],
  ["oro-chiaro", "tavolo", 4.5, "accento dorato sul tavolo scuro"],
];

for (const [primo, secondo, soglia, che] of COPPIE) {
  prova(`${che}: ${primo} su ${secondo}`, () => {
    vero(T[primo], `token --${primo} non dichiarato`);
    vero(T[secondo], `token --${secondo} non dichiarato`);
    const c = contrasto(T[primo], T[secondo]);
    vero(c >= soglia, `${c.toFixed(2)}:1, ne servono ${soglia}:1`);
  });
}

console.log("\n── Regole che si leggono nel sorgente ──");

function sorgenti(dir = join(RADICE, "src"), out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) sorgenti(p, out);
    else if (/\.jsx$/.test(p)) out.push(p);
  }
  return out;
}
const JSX = sorgenti();

/* Il codice senza i commenti. Serve perché questi controlli cercano
   frammenti di markup con espressioni regolari, e un commento che *cita*
   `<select>` per spiegare perché non lo si usa risultava un `<select>`
   vero. Il resto della suite già lo fa; qui mancava. */
const codice = (f) => readFileSync(f, "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

prova("Ogni campo ha un'etichetta associata", () => {
  const guai = [];
  for (const f of JSX) {
    const src = codice(f);
    for (const m of src.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
      const attr = m[2];
      const ok = /\bid=/.test(attr) || /aria-label/.test(attr) || /aria-labelledby/.test(attr);
      if (!ok) guai.push(`${relative(RADICE, f)}: <${m[1]}> senza id né aria-label`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

prova("I pulsanti senza testo dichiarano un nome", () => {
  const guai = [];
  for (const f of JSX) {
    const src = codice(f);
    /* Un pulsante il cui contenuto è solo un'icona o un'emoji ha bisogno
       di aria-label, altrimenti un lettore di schermo legge "pulsante". */
    for (const m of src.matchAll(/<button\b([^>]*)>\s*([^<]{0,4})\s*</g)) {
      const attr = m[1], dentro = m[2].trim();
      if (/aria-label/.test(attr)) continue;
      if (!dentro) continue;
      if (/^[\w àèéìòù]+$/i.test(dentro) && dentro.length > 2) continue;
      guai.push(`${relative(RADICE, f)}: <button>${dentro}</button> senza aria-label`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

prova("Il fuoco da tastiera è sempre visibile", () => {
  vero(CSS.includes(":focus-visible"), "manca qualunque stile di fuoco");
  const conteggio = (CSS.match(/:focus-visible/g) || []).length;
  vero(conteggio >= 5, `solo ${conteggio} regole di fuoco: troppe poche superfici coperte`);
  /* Si guarda solo il codice: un `outline: none` citato in un commento
     che spiega perché NON si fa non è un difetto. */
  const senzaCommenti = CSS.replace(/\/\*[\s\S]*?\*\//g, " ");
  vero(!/outline:\s*none/.test(senzaCommenti.replace(/:focus-visible[^}]*}/g, "")),
    "da qualche parte si toglie il contorno senza rimetterlo");
});

prova("Chi preferisce meno movimento viene ascoltato", () => {
  vero(CSS.includes("prefers-reduced-motion"), "manca la regola per il movimento ridotto");
});

prova("Le pedine non si distinguono solo per colore", () => {
  const tab = readFileSync(join(RADICE, "src/components/Tabellone.jsx"), "utf8");
  vero(tab.includes("sagoma"), "serve una forma oltre al colore");
  vero(/un uomo su|colori/i.test(tab), "va spiegato perché");
});

prova("La lingua del documento segue la lingua scelta", () => {
  const l = readFileSync(join(RADICE, "src/Lingua.jsx"), "utf8");
  vero(l.includes("documentElement.lang"), "un lettore di schermo pronuncia secondo lang");
});

prova("Gli avvisi importanti sono annunciati", () => {
  const dadi = readFileSync(join(RADICE, "src/components/Dadi.jsx"), "utf8");
  vero(/aria-live|role="status"/.test(dadi), "il risultato del dado va annunciato");
});

console.log("\n── Ogni componente che traduce chiede la lingua ──");

prova("Nessun componente usa il mercato senza useMercato()", () => {
  /* `CorpoAffare` usava `categorie` senza il gancio, e `SchedaVeloce`
     usava `obiettivo`: entrambi sotto-componenti che compaiono solo in
     certi momenti della partita, quindi il difetto non si vedeva
     all'apertura. */
  const NOMI = ["categorie", "debitiEstinguibili", "etichetteSpese", "etichettePassivita",
                "obiettivo", "trovaProfessione", "trovaSogno", "trovaAffare", "professioni", "sogni"];
  const guai = [];
  for (const f of JSX) {
    const src = readFileSync(f, "utf8");
    for (const parte of src.split(/\n(?=(?:export )?(?:default )?function [A-Z]\w*\()/)) {
      const m = parte.match(/^(?:export )?(?:default )?function ([A-Z]\w*)\(/);
      if (!m || parte.includes("useMercato()")) continue;
      for (const n of NOMI) {
        const usato = new RegExp(`(?<![\\w.$])${n}\\s*[([.]`).test(parte);
        const locale = new RegExp(`(?:const|let)\\s*\\{[^}]*\\b${n}\\b`).test(parte)
                    || new RegExp(`function [A-Z]\\w*\\([^)]*\\b${n}\\b`).test(parte);
        if (usato && !locale) guai.push(`${relative(RADICE, f)} · ${m[1]}() usa "${n}"`);
      }
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

prova("Nessun componente usa t() senza useLingua()", () => {
  /* `SulTavolo` e `Azioni` usavano t() senza il gancio: sono
     sotto-componenti che compaiono solo quando c'è una decisione in
     sospeso, quindi la schermata si rompeva a metà partita e non
     all'apertura. */
  const guai = [];
  for (const f of JSX) {
    const src = readFileSync(f, "utf8");
    const parti = src.split(/\n(?=(?:export )?(?:default )?function [A-Z]\w*\()/);
    for (const parte of parti) {
      const m = parte.match(/^(?:export )?(?:default )?function ([A-Z]\w*)\(/);
      if (!m) continue;
      const usa = /(?<![\w.$])t\(/.test(parte);
      if (usa && !parte.includes("useLingua()")) {
        guai.push(`${relative(RADICE, f)} · ${m[1]}()`);
      }
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log("\n── La tendina fatta in casa ──");

prova("Nessuno rimette un <select> di sistema", () => {
  /* Non è una questione di gusto: dentro un <option> ci va solo testo, e le
     nostre scelte hanno emoji, nome e importo in colonne separate. Chi
     tornasse al nativo li rischiaccerebbe in una riga. */
  const guai = [];
  for (const f of JSX) {
    if (/<select\b/.test(codice(f))) guai.push(relative(RADICE, f));
  }
  if (guai.length) throw new Error("<select> nativo in: " + guai.join(", "));
});

prova("Ogni tendina porta il contratto completo", () => {
  /* Una tendina a mano che dimentica uno di questi attributi si annuncia
     come un pulsante qualunque: chi usa un lettore di schermo non sa che
     c'è un elenco, né se è aperto. */
  const dovuti = ["aria-haspopup", "aria-expanded", "aria-controls"];
  for (const f of JSX) {
    const src = codice(f);
    for (const m of src.matchAll(/role="combobox"([\s\S]{0,400}?)>/g)) {
      for (const a of dovuti) {
        vero(m[1].includes(a), `${relative(RADICE, f)}: combobox senza ${a}`);
      }
    }
  }
});

prova("L'opzione attiva non si distingue col solo colore", () => {
  /* Il fondo dorato da solo sparisce per chi non distingue i colori: serve
     qualcosa che si veda comunque, qui la barra a sinistra. */
  const regola = CSS.match(/\.scelta-voce\.attiva\s*\{([^}]*)\}/)?.[1] || "";
  vero(regola.length > 0, "manca lo stile dell'opzione attiva");
  vero(/box-shadow|outline|border|text-decoration|font-weight/.test(regola),
    "l'opzione attiva si distingue solo per colore");
});

prova("Il foglio su schermo stretto lascia spazio alla tacca", () => {
  vero(/\.scelta-elenco[\s\S]{0,400}safe-area-inset-bottom/.test(CSS),
    "sull'iPhone l'ultima voce finirebbe sotto la barra di sistema");
});

prova("Chi ha chiesto meno movimento non vede il foglio salire", () => {
  const blocco = CSS.match(/prefers-reduced-motion[^{]*\{([\s\S]*?)\n\}/g)?.join(" ") || "";
  vero(/scelta/.test(blocco), "la tendina ignora la preferenza di movimento ridotto");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
