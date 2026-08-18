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

console.log(ko ? `\n${ko} problemi: il deploy fallirebbe.\n` : "\nvercel.json è a posto.\n");
process.exit(ko ? 1 : 0);
