/**
 * Connessione a MongoDB, riutilizzata fra le invocazioni serverless.
 *
 * STRATEGIA ANTI-CONSUMO (piano gratuito M0, 512 MB):
 *  - indice TTL su `scadeIl`: MongoDB cancella da solo i documenti scaduti;
 *  - ogni scrittura sposta la scadenza avanti di 48 ore -> le stanze
 *    abbandonate spariscono da sole dopo 2 giorni di inattività;
 *  - a partita finita la scadenza scende a 6 ore: il tempo di guardare
 *    la classifica, poi i dati vengono liberati;
 *  - il registro eventi è limitato a 120 righe dal motore;
 *  - il polling legge solo il campo `versione` finché non cambia nulla.
 */
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI;
const NOME_DB = process.env.MONGODB_DB || "cashflow";

/** Quanto vive una stanza dopo l'ultima mossa. */
export const TTL_ATTIVA_MS = 48 * 60 * 60 * 1000;   // 48 ore
/** Quanto restano i dati dopo la fine della partita. */
export const TTL_FINITA_MS = 6 * 60 * 60 * 1000;    // 6 ore
/** Stanze mai avviate: si buttano prima. */
export const TTL_ATTESA_MS = 6 * 60 * 60 * 1000;    // 6 ore

let cached = global.__cashflowMongo;
if (!cached) cached = global.__cashflowMongo = { client: null, promise: null, indici: false };

export function configurato() {
  return Boolean(URI);
}

async function client() {
  if (!URI) throw new Error("MONGODB_URI non è configurata.");
  if (cached.client) return cached.client;
  if (!cached.promise) {
    cached.promise = new MongoClient(URI, {
      maxPoolSize: 5,              // le funzioni serverless non hanno bisogno di più
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    }).connect();
  }
  cached.client = await cached.promise;
  return cached.client;
}

export async function stanze() {
  const c = await client();
  const col = c.db(NOME_DB).collection("stanze");
  if (!cached.indici) {
    cached.indici = true;
    // Idempotente: creare un indice già esistente non costa nulla.
    await Promise.all([
      col.createIndex({ codice: 1 }, { unique: true }),
      col.createIndex({ scadeIl: 1 }, { expireAfterSeconds: 0 }),
    ]).catch((e) => {
      cached.indici = false;
      console.error("creazione indici fallita:", e.message);
    });
  }
  return col;
}

/** Calcola la scadenza in base alla fase della partita. */
export function scadenza(stato) {
  const ora = Date.now();
  if (stato.fase === "finita") return new Date(ora + TTL_FINITA_MS);
  if (stato.fase === "attesa") return new Date(ora + TTL_ATTESA_MS);
  return new Date(ora + TTL_ATTIVA_MS);
}
