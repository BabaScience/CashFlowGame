/**
 * Verifiche dei suoni.
 *   node scripts/prova-suoni.mjs
 *
 * Il suono vero si può sentire solo in un browser, ma la parte che si rompe
 * davvero non è l'onda: è il contorno. Un modulo audio che al caricamento
 * tocca `localStorage` o `window` fa esplodere qualunque build o test che
 * giri fuori dal browser, e lo scopre l'ultima persona che dovrebbe.
 *
 * Qui si verifica proprio quello: che il modulo sia innocuo senza browser,
 * che l'interruttore sia coerente, e che nessuna voce sia sparita.
 */
import { suona, audioAcceso, impostaAudio, sbloccaAudio, VOCI_DISPONIBILI } from "../src/lib/suoni.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/* Le voci che l'interfaccia si aspetta di poter chiamare. Se una sparisce
   il gioco resta muto in quel momento, senza nessun errore visibile. */
const ATTESE = ["dado", "carta", "incasso", "esborso", "tuoTurno", "largo", "vittoria"];

console.log("\n── Fuori dal browser non deve fare danni ──");

prova("Il modulo si carica anche senza window e senza localStorage", () => {
  eq(typeof window, "undefined", "questo test ha senso solo fuori dal browser:");
  vero(typeof suona === "function");
});

prova("sbloccaAudio non esplode: restituisce nulla e basta", () => {
  eq(sbloccaAudio(), null);
});

prova("suona() non esplode e non blocca il chiamante", () => {
  for (const v of ATTESE) suona(v);
  suona("voce-che-non-esiste");
  suona(undefined);
});

console.log("\n── Interruttore ──");

prova("Di partenza i suoni sono accesi", () => {
  eq(audioAcceso(), true);
});

prova("Si spegne e resta spento", () => {
  eq(impostaAudio(false), false);
  eq(audioAcceso(), false);
});

prova("Si riaccende", () => {
  eq(impostaAudio(true), true);
  eq(audioAcceso(), true);
});

prova("Qualunque valore diventa un booleano", () => {
  eq(impostaAudio("sì"), true);
  eq(impostaAudio(0), false);
  impostaAudio(true);
});

console.log("\n── Le voci ──");

prova(`Ci sono tutte e ${ATTESE.length}`, () => {
  for (const v of ATTESE) {
    vero(VOCI_DISPONIBILI.includes(v), `manca la voce "${v}"`);
  }
});

prova("Non ce ne sono di sconosciute in giro", () => {
  for (const v of VOCI_DISPONIBILI) {
    vero(ATTESE.includes(v), `voce "${v}" non prevista da questo test: aggiornalo`);
  }
});

console.log("\n── Nessun file audio da tracciare ──");

prova("I suoni sono sintetizzati, non campionati", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(new URL("../src/lib/suoni.js", import.meta.url), "utf8");
  vero(!/\.(mp3|wav|ogg|m4a|aac)/i.test(src),
    "è comparso un file audio: va aggiunto un registro delle licenze");
  vero(src.includes("createOscillator"), "le note devono essere generate");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
