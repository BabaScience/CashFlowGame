/**
 * Controlla vercel.json prima di spedirlo.
 *
 * Vercel valida il file con uno schema che rifiuta le proprietà sconosciute:
 * una chiave di troppo — per esempio un "comment", visto che JSON non ha
 * commenti — fa fallire l'intero deploy. Meglio scoprirlo qui in mezzo
 * secondo che dopo tre minuti di compilazione.
 *
 *   node scripts/prova-vercel.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";

let ko = 0;
const errore = (m) => { console.log(`  ✗ ${m}`); ko++; };
const ok = (m) => console.log(`  ✓ ${m}`);

const config = JSON.parse(readFileSync("vercel.json", "utf8"));

/* Proprietà ammesse, come da schema ufficiale (openapi.vercel.sh/vercel.json). */
const AMMESSE = {
  radice: ["$schema", "buildCommand", "devCommand", "installCommand", "ignoreCommand",
    "outputDirectory", "framework", "public", "regions", "functions", "routes",
    "rewrites", "redirects", "headers", "cleanUrls", "trailingSlash", "crons",
    "images", "git", "github"],
  rewrites: ["source", "destination", "has", "missing", "statusCode", "env",
    "transforms", "respectOriginCacheControl"],
  redirects: ["source", "destination", "permanent", "statusCode", "has", "missing"],
  headers: ["source", "headers", "has", "missing"],
  crons: ["path", "schedule"],
};

const controllaChiavi = (oggetto, ammesse, dove) => {
  for (const k of Object.keys(oggetto)) {
    if (!ammesse.includes(k)) {
      errore(`${dove}: proprietà non ammessa "${k}" (ammesse: ${ammesse.join(", ")})`);
    }
  }
};

console.log("\nControllo di vercel.json\n");

controllaChiavi(config, AMMESSE.radice, "radice");

for (const [chiave, ammesse] of [["rewrites", AMMESSE.rewrites],
                                 ["redirects", AMMESSE.redirects],
                                 ["headers", AMMESSE.headers],
                                 ["crons", AMMESSE.crons]]) {
  (config[chiave] || []).forEach((voce, i) => controllaChiavi(voce, ammesse, `${chiave}[${i}]`));
}
if (ko === 0) ok("nessuna proprietà sconosciuta");

/* Ogni pattern in "functions" deve corrispondere ad almeno un file,
   altrimenti Vercel interrompe il deploy. */
const funzioni = existsSync("api")
  ? readdirSync("api").filter((f) => f.endsWith(".js") && !f.startsWith("_"))
  : [];
for (const pattern of Object.keys(config.functions || {})) {
  const re = new RegExp("^" + pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*\//g, "(?:.*/)?")
    .replace(/\*/g, "[^/]*") + "$");
  const trovate = funzioni.filter((f) => re.test(`api/${f}`));
  if (trovate.length === 0) errore(`functions["${pattern}"] non corrisponde a nessuna funzione`);
  else ok(`functions["${pattern}"] → ${trovate.join(", ")}`);
}

/* Le funzioni devono esistere davvero e i file di supporto restare esclusi. */
for (const attesa of ["room.js", "state.js", "cleanup.js"]) {
  if (!funzioni.includes(attesa)) errore(`manca api/${attesa}`);
}
if (existsSync("api/_lib")) ok("api/_lib è escluso dal deploy (prefisso _)");

/* Il cron deve puntare a una funzione che esiste. */
for (const c of config.crons || []) {
  const nome = c.path.replace(/^\/api\//, "") + ".js";
  if (!funzioni.includes(nome)) errore(`il cron ${c.path} non ha una funzione corrispondente`);
  else ok(`cron ${c.path} (${c.schedule}) → api/${nome}`);
}

/* L'instradamento non deve intercettare le API né i file statici. */
const rw = (config.rewrites || [])[0];
if (rw) {
  const re = new RegExp("^" + rw.source + "$");
  const statici = ["/api/state", "/og-banner.png", "/favicon.svg", "/manifest.webmanifest", "/robots.txt"];
  const catturati = statici.filter((p) => re.test(p));
  if (catturati.length) errore(`l'instradamento cattura file che deve lasciar stare: ${catturati.join(", ")}`);
  else ok("l'instradamento lascia passare API e file statici");
  if (!re.test("/") || !re.test("/stanza/ABCD")) errore("l'instradamento non copre i percorsi dell'applicazione");
  else ok("i percorsi dell'applicazione arrivano a index.html");
}

/* I file citati nelle intestazioni devono esistere in public/ */
for (const h of config.headers || []) {
  const nomi = h.source.match(/[\w.-]+\.(png|svg|ico|webmanifest|txt)/g) || [];
  const mancanti = nomi.filter((n) => !existsSync(`public/${n}`));
  if (mancanti.length) errore(`intestazioni per file inesistenti: ${mancanti.join(", ")}`);
}
ok("le intestazioni puntano a file esistenti");

/* ═══ Le funzioni chiamano solo cose che hanno importato ═══
 *
 * Questo controllo nasce da un difetto vero, arrivato in produzione e
 * rimasto lì: `api/room.js` chiamava `pacchettoDi()` senza importarla.
 * Creare una stanza contro il computer sollevava un ReferenceError che
 * finiva nel `catch` generale e usciva come "Errore di scrittura sul
 * database" — il messaggio che manda a cercare nel posto sbagliato.
 *
 * In sviluppo non si vedeva: la copia in memoria delle API (che è un
 * altro file) quella funzione la importava. E nessun test la coglieva,
 * perché i test non eseguono mai le funzioni serverless.
 *
 * L'euristica è semplice: ogni nome chiamato come funzione senza un punto
 * davanti deve essere importato, dichiarato nel file, o un nome del
 * linguaggio. Non è un analizzatore sintattico, ma prende esattamente
 * questa famiglia di sbagli, che è quella che fa male.
 */
const GLOBALI = new Set([
  "require", "fetch", "console", "process", "Buffer", "URL", "URLSearchParams",
  "Number", "String", "Boolean", "Array", "Object", "JSON", "Math", "Date",
  "Promise", "Error", "Set", "Map", "RegExp", "Symbol", "BigInt", "parseInt",
  "parseFloat", "isNaN", "isFinite", "encodeURIComponent", "decodeURIComponent",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "structuredClone",
  "if", "for", "while", "switch", "catch", "return", "typeof", "function", "await",
]);

/* L'ordine conta: prima i commenti a blocco, poi le espressioni regolari,
   poi i commenti di riga, e per ultime le stringhe.
   Le regolari prima dei commenti di riga perché `/^mongodb:\\/\\//i` finisce
   con due sbarre di fila e verrebbe scambiato per l'inizio di un commento.
   Le stringhe per ultime perché in questo progetto i commenti sono in
   italiano e pieni di apostrofi, che aprirebbero stringhe fantasma. */
const senzaCommenti = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/([(=,:!&|]\s*)\/(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, "$1RE")
  .replace(/\/\/[^\n]*/g, " ")
  .replace(/`(?:[^`\\]|\\.)*`/g, '""')
  .replace(/"(?:[^"\\]|\\.)*"/g, '""')
  .replace(/'(?:[^'\\]|\\.)*'/g, '""');

const fileApi = [];
const raccogli = (dir) => {
  for (const n of readdirSync(dir, { withFileTypes: true })) {
    if (n.isDirectory()) raccogli(`${dir}/${n.name}`);
    else if (n.name.endsWith(".js")) fileApi.push(`${dir}/${n.name}`);
  }
};
raccogli("api");

let nomiKo = 0;
for (const f of fileApi) {
  const src = senzaCommenti(readFileSync(f, "utf8"));

  const noti = new Set(GLOBALI);
  /* Quello che il file importa. */
  for (const m of src.matchAll(/import\s+(?:\{([^}]*)\}|(\w+))[^;]*from/g)) {
    if (m[2]) noti.add(m[2]);
    for (const pezzo of (m[1] || "").split(",")) {
      const nome = pezzo.trim().split(/\s+as\s+/).pop().trim();
      if (nome) noti.add(nome);
    }
  }
  /* Quello che dichiara, incluse le funzioni ricevute come parametro. */
  for (const m of src.matchAll(/\b(?:function|const|let|var|class)\s+(\w+)/g)) noti.add(m[1]);
  for (const m of src.matchAll(/\(([^)]*)\)\s*=>/g)) {
    for (const pezzo of m[1].split(",")) {
      const nome = pezzo.trim().replace(/[=:].*$/, "").trim();
      if (/^\w+$/.test(nome)) noti.add(nome);
    }
  }
  for (const m of src.matchAll(/function\s*\w*\s*\(([^)]*)\)/g)) {
    for (const pezzo of m[1].split(",")) {
      const nome = pezzo.trim().replace(/[=:].*$/, "").trim();
      if (/^\w+$/.test(nome)) noti.add(nome);
    }
  }

  const ignoti = new Set();
  for (const m of src.matchAll(/(^|[^\w.$])([a-zA-Z_$][\w$]*)\s*\(/g)) {
    if (!noti.has(m[2])) ignoti.add(m[2]);
  }
  if (ignoti.size) {
    errore(`${f}: chiama senza importare → ${[...ignoti].join(", ")}`);
    nomiKo++;
  }
}
if (!nomiKo) ok(`le ${fileApi.length} funzioni chiamano solo cose che hanno importato`);

console.log(ko ? `\n${ko} problemi: il deploy fallirebbe.\n` : "\nvercel.json è a posto.\n");
process.exit(ko ? 1 : 0);
