/**
 * Verifica della composizione della stringa di connessione.
 *   node scripts/prova-uri.mjs
 */
import { componiUri, uriOscurata } from "../api/_lib/uri.js";

let ok = 0, ko = 0;
const test = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le verifiche non girerebbero");
    } console.log(`  ✅ ${nome}`); ok++; }
  catch (e) { console.log(`  ❌ ${nome}\n       ${e.message}`); ko++; }
};
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m}\n       atteso:  ${b}\n       ottenuto:${a}`); };
const vero = (c, m) => { if (!c) throw new Error(m); };

const CLUSTER = "cluster0.ab1cd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log("\n── Segnaposto lasciati da Atlas ──");

test("<db_username> e <db_password> vengono sostituiti", () => {
  const { uri, errore } = componiUri(
    `mongodb+srv://<db_username>:<db_password>@${CLUSTER}`, "bamba", "segreta"
  );
  eq(errore, null);
  eq(uri, `mongodb+srv://bamba:segreta@${CLUSTER}`);
});

test("funzionano anche <username> e <password>", () => {
  const { uri } = componiUri(`mongodb+srv://<username>:<password>@${CLUSTER}`, "bamba", "segreta");
  eq(uri, `mongodb+srv://bamba:segreta@${CLUSTER}`);
});

test("segnaposto senza credenziali: errore chiaro", () => {
  const { uri, errore } = componiUri(`mongodb+srv://<db_username>:<db_password>@${CLUSTER}`, "", "");
  eq(uri, null);
  vero(errore.includes("MONGODB_USERNAME"), "il messaggio deve indicare cosa impostare");
});

console.log("\n── Inserimento delle credenziali ──");

test("URI senza credenziali: utente e password vengono inseriti", () => {
  const { uri } = componiUri(`mongodb+srv://${CLUSTER}`, "bamba", "segreta");
  eq(uri, `mongodb+srv://bamba:segreta@${CLUSTER}`);
});

test("mongodb:// semplice (non SRV)", () => {
  const { uri } = componiUri("mongodb://localhost:27017/quotazero", "bamba", "segreta");
  eq(uri, "mongodb://bamba:segreta@localhost:27017/quotazero");
});

test("credenziali già nella URI e nessuna variabile: si tiene la URI", () => {
  const originale = `mongodb+srv://vecchio:vecchia@${CLUSTER}`;
  const { uri, errore } = componiUri(originale, "", "");
  eq(errore, null);
  eq(uri, originale);
});

test("le variabili separate hanno la precedenza su quelle nella URI", () => {
  const { uri } = componiUri(`mongodb+srv://vecchio:vecchia@${CLUSTER}`, "nuovo", "nuova");
  eq(uri, `mongodb+srv://nuovo:nuova@${CLUSTER}`);
});

console.log("\n── Password con caratteri speciali ──");

test("una password con @ : / ? # % viene codificata", () => {
  const pw = "a@b:c/d?e#f%g";
  const { uri } = componiUri(`mongodb+srv://${CLUSTER}`, "bamba", pw);
  eq(uri, `mongodb+srv://bamba:a%40b%3Ac%2Fd%3Fe%23f%25g@${CLUSTER}`);
  // La URI deve restare interpretabile: un solo @ separa credenziali e host.
  const dopoSchema = uri.slice("mongodb+srv://".length);
  eq(dopoSchema.split("@").length - 1, 1, "deve esserci una sola @ di separazione");
});

test("la password codificata torna quella originale", () => {
  const pw = "P@ss/w0rd#2024";
  const { uri } = componiUri(`mongodb+srv://${CLUSTER}`, "bamba", pw);
  const parte = uri.slice("mongodb+srv://".length).split("@")[0].split(":")[1];
  eq(decodeURIComponent(parte), pw, "decodificando si deve riottenere la password");
});

test("anche l'utente viene codificato", () => {
  const { uri } = componiUri(`mongodb+srv://${CLUSTER}`, "utente con spazio", "pw");
  vero(uri.includes("utente%20con%20spazio"), "l'utente va codificato");
});

console.log("\n── Errori ──");

test("MONGODB_URI mancante", () => {
  const { uri, errore } = componiUri("", "bamba", "segreta");
  eq(uri, null);
  vero(errore.includes("MONGODB_URI"), errore);
});

test("URI con schema sbagliato", () => {
  const { uri, errore } = componiUri("https://cluster0.mongodb.net", "bamba", "segreta");
  eq(uri, null);
  vero(errore.includes("mongodb"), errore);
});

test("solo la password, senza utente", () => {
  const { uri, errore } = componiUri(`mongodb+srv://${CLUSTER}`, "", "segreta");
  eq(uri, null);
  vero(errore.includes("MONGODB_USERNAME"), errore);
});

test("solo l'utente, senza password", () => {
  const { uri, errore } = componiUri(`mongodb+srv://${CLUSTER}`, "bamba", "");
  eq(uri, null);
  vero(errore.includes("MONGODB_PASSWORD"), errore);
});

test("nessuna credenziale da nessuna parte", () => {
  const { uri, errore } = componiUri(`mongodb+srv://${CLUSTER}`, "", "");
  eq(uri, null);
  vero(errore.includes("credenziale"), errore);
});

test("spazi accidentali attorno ai valori vengono tolti", () => {
  const { uri } = componiUri(`  mongodb+srv://${CLUSTER}  `, "  bamba  ", "segreta");
  eq(uri, `mongodb+srv://bamba:segreta@${CLUSTER}`);
});

console.log("\n── Log senza segreti ──");

test("la password non compare mai nella URI oscurata", () => {
  const { uri } = componiUri(`mongodb+srv://${CLUSTER}`, "bamba", "SuperSegreta123");
  const oscurata = uriOscurata(uri);
  vero(!oscurata.includes("SuperSegreta123"), `la password è trapelata: ${oscurata}`);
  vero(oscurata.includes("bamba"), "l'utente può restare visibile");
  vero(oscurata.includes("***"), "deve esserci il mascheramento");
});

console.log(`\n${ok} test superati, ${ko} falliti\n`);
process.exit(ko ? 1 : 0);
