/**
 * Verifica che le credenziali MongoDB funzionino davvero, prima di mettere
 * online il progetto. Si connette, crea gli indici, scrive e cancella un
 * documento di prova, poi riporta quanto spazio è occupato.
 *
 *   node --env-file=.env scripts/prova-connessione.mjs
 */
import { componiUri, uriOscurata } from "../api/_lib/uri.js";
import { MongoClient } from "mongodb";

const NOME_DB = process.env.MONGODB_DB || "cashflow";

const { uri, errore } = componiUri(
  process.env.MONGODB_URI,
  process.env.MONGODB_USERNAME,
  process.env.MONGODB_PASSWORD
);

console.log("\nCASHFLOW · verifica della connessione\n");

const presente = (n) => (process.env[n] ? "impostata" : "MANCANTE");
console.log(`  MONGODB_URI       ${presente("MONGODB_URI")}`);
console.log(`  MONGODB_USERNAME  ${presente("MONGODB_USERNAME")}`);
console.log(`  MONGODB_PASSWORD  ${presente("MONGODB_PASSWORD")}`);
console.log(`  MONGODB_DB        ${NOME_DB}\n`);

if (errore) {
  console.error(`  ✗ ${errore}\n`);
  console.error("  Suggerimento: copia da Atlas la stringa in Connect > Drivers,");
  console.error("  lasciando i segnaposto <db_username> e <db_password> come sono,");
  console.error("  e metti utente e password nelle due variabili apposta.\n");
  process.exit(1);
}

console.log(`  Connessione a ${uriOscurata(uri)}\n`);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 2 });
const t0 = Date.now();

try {
  await client.connect();
  console.log(`  ✓ connesso in ${Date.now() - t0} ms`);

  const db = client.db(NOME_DB);
  await db.command({ ping: 1 });
  console.log("  ✓ il database risponde");

  const col = db.collection("stanze");
  await col.createIndex({ codice: 1 }, { unique: true });
  await col.createIndex({ scadeIl: 1 }, { expireAfterSeconds: 0 });
  const indici = await col.indexes();
  const ttl = indici.find((i) => i.expireAfterSeconds !== undefined);
  console.log(`  ✓ indici a posto (${indici.length}) · scadenza automatica: ${ttl ? "attiva" : "ASSENTE"}`);

  const prova = { codice: "__PROVA__", versione: 1, scadeIl: new Date(Date.now() + 60000) };
  await col.deleteOne({ codice: "__PROVA__" });
  await col.insertOne(prova);
  const riletto = await col.findOne({ codice: "__PROVA__" }, { projection: { versione: 1, _id: 0 } });
  await col.deleteOne({ codice: "__PROVA__" });
  console.log(`  ✓ scrittura e lettura funzionano (versione riletta: ${riletto?.versione})`);

  const stanze = await col.countDocuments();
  let usati = null;
  try {
    const stats = await db.command({ dbStats: 1 });
    usati = (stats.dataSize + (stats.indexSize || 0)) / (1024 * 1024);
  } catch { /* su Atlas M0 dbStats può essere negato: non è un problema */ }

  console.log(`\n  Stanze presenti: ${stanze}`);
  if (usati !== null) {
    console.log(`  Spazio occupato: ${usati.toFixed(2)} MB su 512 MB (${((usati / 512) * 100).toFixed(2)}%)`);
  }
  console.log("\n  Tutto a posto: puoi mettere online il progetto.\n");
} catch (e) {
  console.error(`\n  ✗ connessione fallita: ${e.message}\n`);
  const m = e.message || "";
  if (/authentication failed|bad auth/i.test(m)) {
    console.error("  Utente o password sbagliati. Controlla MONGODB_USERNAME e");
    console.error("  MONGODB_PASSWORD in Atlas, sotto Database Access.");
    console.error("  Nota: l'utente del database non è quello con cui entri su Atlas.\n");
  } else if (/ENOTFOUND|querySrv|getaddrinfo/i.test(m)) {
    console.error("  Indirizzo del cluster non raggiungibile: ricontrolla MONGODB_URI.\n");
  } else if (/timed out|ETIMEDOUT|ServerSelection/i.test(m)) {
    console.error("  Nessuna risposta dal cluster. Su Atlas, in Network Access,");
    console.error("  aggiungi 0.0.0.0/0 fra gli indirizzi ammessi: Vercel non ha IP fissi.\n");
  }
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
