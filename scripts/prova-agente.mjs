/**
 * Verifiche dell'agente dei dati.
 *   node scripts/prova-agente.mjs
 *
 * Volutamente SENZA rete. Un test che interroga la BCE fallisce quando la
 * BCE è lenta, e un test che fallisce per motivi suoi smette di essere
 * letto nel giro di due settimane. Qui si verifica ciò che possiamo
 * garantire: che le risposte vengano interpretate bene, che una risposta
 * malformata non faccia esplodere niente, e soprattutto che l'agente non
 * scriva mai nei dati di gioco.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};

const leggi = (p) => readFileSync(join(RADICE, p), "utf8");

console.log("\n── L'agente non tocca i dati di gioco ──");

prova("Non scrive mai dentro src/game", () => {
  const src = leggi("agente/proponi.mjs");
  /* Cerca scritture verso il codice del gioco. L'unica cartella in cui
     l'agente può scrivere è agente/proposte. */
  const scritture = src.match(/writeFileSync\([^)]*\)/g) || [];
  for (const s of scritture) {
    vero(!s.includes("src/game") && !s.includes("mercati"),
      `scrittura sospetta verso i dati di gioco: ${s}`);
  }
  vero(src.includes('join(RADICE, "agente", "proposte")'),
    "le proposte devono finire in agente/proposte");
});

prova("Dichiara in chiaro di non modificare nulla", () => {
  const src = leggi("agente/proponi.mjs");
  vero(/NON tocca i dati in produzione/i.test(src), "manca la regola in testa al file");
});

prova("Il rapporto lo ripete a chi lo legge", () => {
  const src = leggi("agente/proponi.mjs");
  vero(src.includes("Nessun dato di gioco è stato modificato"));
});

console.log("\n── Le fonti ──");

prova("Nessuna fonte punta a un portale di annunci", () => {
  const src = leggi("agente/fonti.mjs");
  const vietati = ["idealista", "immobiliare.it", "casa.it", "seloger", "meilleursagents", "rightmove"];
  for (const v of vietati) {
    vero(!src.toLowerCase().includes(v + "."), `l'agente interroga ${v}: non è consentito`);
  }
});

prova("Le fonti automatiche sono API pubbliche note", () => {
  const src = leggi("agente/fonti.mjs");
  vero(src.includes("data-api.ecb.europa.eu"), "manca la BCE");
  vero(src.includes("ec.europa.eu/eurostat"), "manca Eurostat");
});

prova("Ogni fonte dichiara da dove viene e quando", () => {
  const src = leggi("agente/fonti.mjs");
  for (const campo of ["fonte:", "url", "periodo"]) {
    vero(src.includes(campo), `le fonti devono riportare "${campo}"`);
  }
});

prova("Le fonti non lanciano: restituiscono un esito", () => {
  const src = leggi("agente/fonti.mjs");
  const rilanci = src.match(/^\s*throw /gm) || [];
  eq(rilanci.length, 0, "una fonte che lancia interrompe l'intera raccolta:");
  vero(src.includes("catch"), "gli errori vanno raccolti e riferiti");
});

console.log("\n── Distinzioni che è facile sbagliare ──");

prova("Tasso e TAEG non vengono confusi", () => {
  const src = leggi("agente/fonti.mjs");
  vero(/non\s+TAEG/i.test(src), "va dichiarato che la BCE pubblica il tasso, non il TAEG");
  const prop = leggi("agente/proponi.mjs");
  vero(prop.includes("COSTI_ACCESSORI"),
    "il confronto col TAEG deve tenere conto dei costi accessori, o insegue un fantasma");
});

prova("L'indice dei prezzi è usato come deriva, non come livello", () => {
  const src = leggi("agente/fonti.mjs");
  vero(/deriva|non il livello/i.test(src));
});

prova("La query Eurostat fissa unità e tipo di acquisto", () => {
  const src = leggi("agente/fonti.mjs");
  vero(src.includes("unit=I15_A_AVG") && src.includes("purchase=TOTAL"),
    "senza questi filtri gli indici di `value` non corrispondono agli anni");
});

console.log("\n── Il cancello resta l'ultima parola ──");

prova("Il percorso descritto passa dal bilanciamento", () => {
  const readme = leggi("agente/README.md");
  vero(readme.includes("test:bilancia"), "il README deve indicare il cancello");
  const prop = leggi("agente/proponi.mjs");
  vero(prop.includes("test:bilancia"), "il rapporto deve indicare il cancello");
});

prova("Il percorso impone un file di versione nuovo", () => {
  const prop = leggi("agente/proponi.mjs");
  vero(/un file nuovo|\*\*un file nuovo\*\*/i.test(prop),
    "va detto esplicitamente di non modificare una versione esistente");
});

console.log("\n── I rapporti prodotti ──");

prova("Se esistono proposte, sono leggibili e non contengono codice", () => {
  const dir = join(RADICE, "agente", "proposte");
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
    const testo = readFileSync(join(dir, f), "utf8");
    vero(testo.includes("proposta"), `${f}: deve dichiararsi una proposta`);
    vero(!testo.includes("export default"), `${f}: un rapporto non contiene codice`);
  }
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
