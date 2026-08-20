/**
 * Verifiche delle partite aperte e degli avvisi.
 *   node scripts/prova-partite.mjs
 *
 * Il gioco a turni distanziati serve a togliere il vincolo peggiore che
 * abbia un gioco da tavolo online: che sei persone siano libere nello
 * stesso momento. È il motivo per cui questi giochi muoiono, e non perché
 * siano brutti.
 *
 * Qui si verifica la parte che una macchina può verificare: che l'elenco
 * delle partite viva sul dispositivo, che si ripulisca da solo quando le
 * stanze sul server sono già scadute, e che gli avvisi non facciano danni
 * dove non esistono.
 */
import { readFileSync } from "node:fs";

/* localStorage finto: il modulo è scritto per il browser, ma non deve
   esplodere altrove — ed è esattamente il difetto che va sorvegliato. */
const memoria = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
  setItem: (k, v) => memoria.set(k, String(v)),
  removeItem: (k) => memoria.delete(k),
};

const {
  partiteAperte, ricordaPartita, dimenticaPartita, statoAvvisi, avvisaTurno,
} = await import("../src/lib/partite.js");

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
  }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const pulisci = () => memoria.clear();

console.log("\n── L'elenco delle partite ──");

prova("Parte vuoto", () => { pulisci(); eq(partiteAperte(), []); });

prova("Ricorda una partita", () => {
  pulisci();
  ricordaPartita("ABCD", { mercatoId: "roma", giocatori: 3 });
  const a = partiteAperte();
  eq(a.length, 1);
  eq(a[0].codice, "ABCD");
  eq(a[0].mercatoId, "roma");
});

prova("Non duplica la stessa stanza", () => {
  pulisci();
  ricordaPartita("ABCD", { giocatori: 2 });
  ricordaPartita("ABCD", { giocatori: 4 });
  const a = partiteAperte();
  eq(a.length, 1, "una sola voce per stanza:");
  eq(a[0].giocatori, 4, "vince l'ultima notizia:");
});

prova("La più recente sta in cima", () => {
  pulisci();
  ricordaPartita("AAAA");
  ricordaPartita("BBBB");
  eq(partiteAperte()[0].codice, "BBBB");
});

prova("Si può togliere dall'elenco", () => {
  pulisci();
  ricordaPartita("AAAA"); ricordaPartita("BBBB");
  dimenticaPartita("AAAA");
  eq(partiteAperte().map((p) => p.codice), ["BBBB"]);
});

prova("Dimenticare una stanza che non c'è non rompe niente", () => {
  pulisci();
  ricordaPartita("AAAA");
  dimenticaPartita("ZZZZ");
  eq(partiteAperte().length, 1);
});

prova("Le partite più vecchie di 48 ore spariscono da sole", () => {
  pulisci();
  /* Sul server la stanza è già scaduta: tenerla nell'elenco significherebbe
     offrire un pulsante che porta a un errore. */
  const vecchia = Date.now() - 49 * 3600e3;
  localStorage.setItem("quotazero:partite", JSON.stringify([
    { codice: "VECC", vista: vecchia },
    { codice: "NUOV", vista: Date.now() },
  ]));
  eq(partiteAperte().map((p) => p.codice), ["NUOV"]);
});

prova("L'elenco non cresce all'infinito", () => {
  pulisci();
  for (let i = 0; i < 40; i++) ricordaPartita("C" + String(i).padStart(3, "0"));
  vero(partiteAperte().length <= 12, `troppe voci: ${partiteAperte().length}`);
});

prova("Un contenuto corrotto non fa esplodere l'avvio", () => {
  pulisci();
  localStorage.setItem("quotazero:partite", "{non json");
  eq(partiteAperte(), []);
  localStorage.setItem("quotazero:partite", '{"non":"un array"}');
  eq(partiteAperte(), []);
});

prova("Un codice vuoto non entra nell'elenco", () => {
  pulisci();
  ricordaPartita("");
  ricordaPartita(null);
  eq(partiteAperte(), []);
});

console.log("\n── Gli avvisi ──");

prova("Senza le notifiche del browser non si rompe niente", () => {
  eq(typeof Notification, "undefined", "questo test ha senso solo fuori dal browser:");
  eq(statoAvvisi(), "non disponibile");
  eq(avvisaTurno({ codice: "ABCD", titolo: "x", testo: "y" }), false);
});

prova("Il permesso non si chiede all'avvio", async () => {
  const src = readFileSync(new URL("../src/lib/partite.js", import.meta.url), "utf8");
  vero(/non si chiede all'avvio/i.test(src),
    "va dichiarato: chiedere il permesso prima che si capisca perché serve se lo prende un no");
});

prova("Non si avvisa chi sta già guardando", () => {
  const src = readFileSync(new URL("../src/lib/partite.js", import.meta.url), "utf8");
  vero(src.includes("document.hidden"), "un avviso per una cosa che hai davanti è rumore");
});

prova("Una stanza produce una notifica sola, non una pila", () => {
  const src = readFileSync(new URL("../src/lib/partite.js", import.meta.url), "utf8");
  vero(src.includes("tag:"), "senza tag le notifiche si accumulano a ogni turno");
});

prova("Il limite delle notifiche è dichiarato, non nascosto", () => {
  const src = readFileSync(new URL("../src/lib/partite.js", import.meta.url), "utf8")
    .replace(/\n\s*\*\s*/g, " ");   // i commenti vanno a capo, le frasi no
  vero(/ad applicazione chiusa/i.test(src) && /service worker/i.test(src),
    "va detto che non funzionano ad app chiusa e che cosa servirebbe");
});

console.log("\n── Niente identificativi ──");

prova("L'elenco vive sul dispositivo e non parla col server", () => {
  const src = readFileSync(new URL("../src/lib/partite.js", import.meta.url), "utf8");
  vero(src.includes("localStorage"));
  vero(!/fetch\(|\/api\//.test(src), "questo modulo non deve fare richieste");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
