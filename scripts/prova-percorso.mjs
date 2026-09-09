/**
 * Verifiche dell'indirizzo.
 *   node scripts/prova-percorso.mjs
 *
 * Il mercato adesso sta nel percorso (`/roma`), e un percorso è una cosa
 * che la gente manda ad altri e mette nei segnalibri: se domani un id di
 * mercato cambia, o ne nasce uno che si chiama come una schermata, i link
 * già mandati smettono di funzionare senza che nessuno se ne accorga.
 */
import { mercatoDaPercorso, percorsoDi, mercatoIniziale } from "../src/lib/percorso.js";
import { MERCATI, MERCATO_PREDEFINITO } from "../src/game/mercati/indice.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono");
    }
    console.log("  ✅ " + nome); passati++;
  } catch (e) {
    console.log("  ❌ " + nome + "\n       " + e.message); falliti++;
  }
};
const vero = (c, m) => { if (!c) throw new Error(m); };
const uguale = (a, b, m) => vero(a === b, `${m}: ${JSON.stringify(a)} invece di ${JSON.stringify(b)}`);

console.log("\n── Il mercato sta nell'indirizzo ──");

prova("Un mercato che esiste si legge dal percorso", () => {
  for (const m of MERCATI) {
    uguale(mercatoDaPercorso(`/${m.id}`), m.id, m.id);
    uguale(mercatoDaPercorso(`/${m.id}/`), m.id, `${m.id} con la barra finale`);
  }
});

prova("Un percorso che non è un mercato non ne inventa uno", () => {
  for (const p of ["/", "", "/pippo", "/impara", "/api/room", "/roma2", "/ROMA"]) {
    uguale(mercatoDaPercorso(p), null, `"${p}"`);
  }
});

prova("Andare e tornare dà lo stesso mercato", () => {
  for (const m of MERCATI) uguale(mercatoDaPercorso(percorsoDi(m.id)), m.id, m.id);
  uguale(percorsoDi("inesistente"), "/", "un mercato che non c'è non ha percorso");
  uguale(percorsoDi(null), "/", "nessun mercato");
});

prova("L'indirizzo conta più dell'ultima scelta, che conta più del ripiego", () => {
  const altro = MERCATI.find((m) => m.id !== MERCATO_PREDEFINITO)?.id;
  vero(altro, "serve più di un mercato per provare la precedenza");
  uguale(mercatoIniziale(`/${altro}`, MERCATO_PREDEFINITO), altro, "vince l'indirizzo");
  uguale(mercatoIniziale("/", altro), altro, "poi l'ultimo scelto");
  uguale(mercatoIniziale("/", null), MERCATO_PREDEFINITO, "infine il ripiego");
});

prova("Un mercato ritirato che resta salvato non fa partire il gioco", () => {
  /* I pacchetti si ritirano: `localStorage` no. Se il mercato salvato non
     esiste più si riparte dal predefinito, invece di chiedere al registro
     un pacchetto che non c'è. */
  uguale(mercatoIniziale("/", "mercato-di-tre-anni-fa"), MERCATO_PREDEFINITO, "ritirato");
  uguale(mercatoIniziale("/", ""), MERCATO_PREDEFINITO, "vuoto");
});

prova("Nessun mercato si chiama come una parte del sito", () => {
  /* `/api` è il server, `dist` e `assets` sono i file. Un mercato con uno di
     questi id verrebbe oscurato dal percorso e non si aprirebbe mai. */
  const riservate = new Set([
    "api", "assets", "dist", "index", "public", "favicon", "manifest", "robots",
  ]);
  for (const m of MERCATI) {
    vero(!riservate.has(m.id), `il mercato "${m.id}" si chiama come una parte del sito`);
    vero(/^[a-z0-9-]+$/.test(m.id),
      `l'id "${m.id}" non si può scrivere in un indirizzo senza essere codificato`);
  }
});

console.log(`\n${passati} test superati, ${falliti} falliti`);
process.exit(falliti ? 1 : 0);
