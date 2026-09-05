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

/* Ripulire il codice prima di guardarlo, in due gradi.
 *
 * `senzaTesti` toglie commenti ed espressioni regolari: basta per
 * riconoscere una chiamata di funzione, e non può cancellare niente per
 * sbaglio. `senzaCommenti` toglie anche le stringhe, che serve per non
 * scambiare una parola dentro un messaggio per una chiamata.
 *
 * L'ordine conta. Le espressioni regolari prima dei commenti di riga,
 * perché `/^mongodb:\\/\\//i` finisce con due sbarre di fila e verrebbe
 * scambiato per l'inizio di un commento. Le stringhe per ultime perché in
 * questo progetto i commenti sono in italiano e pieni di apostrofi, che
 * aprirebbero stringhe fantasma.
 *
 * E una rete: se togliere le stringhe si porta via più della metà del
 * file, una virgoletta spaiata ha fatto danni e ci si ferma al grado
 * prima. Un controllo che non vede niente passa sempre, ed è il tipo di
 * test peggiore che ci sia — questo è successo davvero qui sotto.
 */
const senzaTesti = (t) => t
  /* I commenti diventano righe vuote, non spazio: se le righe si
     accorciano, il numero indicato dagli errori manda a cercare altrove. */
  .replace(/\/\*[\s\S]*?\*\//g, (c) => "\n".repeat((c.match(/\n/g) || []).length))
  .replace(/([(=,:!&|]\s*)\/(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, "$1RE")
  .replace(/\/\/[^\n]*/g, " ");

const senzaCommenti = (t) => {
  const base = senzaTesti(t);
  const nudo = base
    .replace(/`(?:[^`\\]|\\.)*`/g, '""')
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, '""');
  return nudo.length < base.length * 0.5 ? base : nudo;
};

/* ═══ Le due API restano d'accordo su cosa accettano ═══
 *
 * Le API esistono in due copie: le funzioni serverless in `api/`, e la
 * copia in memoria che gira con `npm run dev`. Sono due file, e per due
 * volte hanno preso strade diverse in silenzio.
 *
 * L'ultima: il formato della partita (Lampo o Lunga) arrivava al motore
 * in sviluppo e non in produzione, perché `api/room.js` non lo passava a
 * `creaStanza`. Il selettore c'era, funzionava sul computer di casa, e
 * online non faceva niente.
 *
 * Qui si confrontano le chiavi passate a `creaStanza` nei due file: se
 * una manca da una parte, quella cosa funziona solo in sviluppo.
 */
const chiamateCreaStanza = (file) => {
  const src = senzaTesti(readFileSync(file, "utf8"));
  const punti = [];
  for (const m of src.matchAll(/creaStanza\([^,]+,[^,]+,\s*\{([^}]*)\}/g)) {
    const chiavi = new Set();
    for (const pezzo of m[1].split(",")) {
      const nome = pezzo.trim().match(/^(\w+)/);
      if (nome) chiavi.add(nome[1]);
    }
    punti.push({ file, riga: src.slice(0, m.index).split("\n").length, chiavi });
  }
  return punti;
};

{
  /* Chiavi che una sola chiamata ha buon motivo di passare: la rivincita
     si ancora alla versione dei dati della partita di prima. */
  const SOLO_SUE = new Set(["versioneDati", "seme", "solitaria"]);
  const punti = [
    ...chiamateCreaStanza("api/room.js"),
    ...chiamateCreaStanza("api/coda.js"),
    ...chiamateCreaStanza("api/_lib/rivincita.js"),
    ...chiamateCreaStanza("scripts/api-locale.js"),
  ];
  const attese = new Set();
  for (const p of punti) for (const k of p.chiavi) if (!SOLO_SUE.has(k)) attese.add(k);

  let buchi = 0;
  for (const p of punti) {
    const mancanti = [...attese].filter((k) => !p.chiavi.has(k));
    if (mancanti.length) {
      errore(`${p.file}:${p.riga} apre una stanza senza ${mancanti.join(", ")} — quell'impostazione non arriva al motore`);
      buchi++;
    }
  }
  if (!buchi) ok(`le ${punti.length} chiamate a creaStanza passano tutte ${[...attese].join(", ")}`);
}

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
