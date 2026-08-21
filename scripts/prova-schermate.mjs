/**
 * Disegna davvero ogni schermata.
 *   node scripts/prova-schermate.mjs
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * Tre volte di seguito, spostando pezzi di `Ingresso.jsx`, una modifica ha
 * perso una dichiarazione: prima `aperte`, poi l'import di `partiteAperte`,
 * poi `haFisco`. Ogni volta `vite build` ha compilato senza una parola, ogni
 * volta tutti i test sono passati, e ogni volta la schermata si è rotta
 * aprendola — perché nessun test disegnava un componente.
 *
 * `prova-import.mjs` copre metà del problema: i nomi importati. Non copre
 * l'altra metà, cioè le variabili locali mai dichiarate, e non può — per
 * saperlo bisogna eseguire il componente.
 *
 * Quindi si esegue. `renderToStaticMarkup` disegna ogni schermata in Node,
 * senza browser: se un nome non esiste, esplode qui invece che in faccia a
 * chi apre la pagina.
 *
 * Non verifica che l'aspetto sia giusto — quello richiede occhi. Verifica
 * che la schermata esista, che è il minimo sindacale e che ci è mancato
 * tre volte.
 */
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { creaStanza, applicaAzione } from "../src/game/motore.js";
import { getPacchetto as require_pacchetto } from "../src/game/mercati/indice.js";

/* Il DOM minimo di cui i componenti hanno bisogno al primo disegno. */
const memoria = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoria.has(k) ? memoria.get(k) : null),
  setItem: (k, v) => memoria.set(k, String(v)),
  removeItem: (k) => memoria.delete(k),
};
/* In Node moderno `navigator` esiste ed è di sola lettura: si aggiunge solo
   ciò che manca, invece di sostituirlo. */
if (!globalThis.navigator?.languages) {
  Object.defineProperty(globalThis, "navigator", {
    value: { languages: ["it"], language: "it" }, configurable: true, writable: true,
  });
}
if (!globalThis.location) {
  Object.defineProperty(globalThis, "location", {
    value: { origin: "http://localhost", search: "", pathname: "/" }, configurable: true, writable: true,
  });
}
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const { LinguaProvider } = await import("../src/Lingua.jsx");
const { MercatoProvider } = await import("../src/Mercato.jsx");
const Ingresso = (await import("../src/screens/Ingresso.jsx")).default;
const Attesa = (await import("../src/screens/Attesa.jsx")).default;
const Partita = (await import("../src/screens/Partita.jsx")).default;
const Impara = (await import("../src/screens/Impara.jsx")).default;
const Sfida = (await import("../src/screens/Sfida.jsx")).default;
const Vittoria = (await import("../src/components/Vittoria.jsx")).default;
const Chat = (await import("../src/components/Chat.jsx")).default;
const Scheda = (await import("../src/components/Scheda.jsx")).default;
const Giocatori = (await import("../src/components/Giocatori.jsx")).default;
const Registro = (await import("../src/components/Registro.jsx")).default;
const Tabellone = (await import("../src/components/Tabellone.jsx")).default;

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try { fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + (e.message || e)); if (process.env.STACK) console.log(e.stack); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Una partita vera da dare in pasto ai componenti. */
function tavolo({ mercatoId = "roma", livello = 1, avviata = true, finita = false } = {}) {
  let s = creaStanza("PROV", "a", { seme: 7, mercatoId, livello });
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "Ada", professioneId: mercatoId === "roma" ? "insegnante" : "medico", sognoId: "sg01" }).stato;
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "Bo", professioneId: mercatoId === "roma" ? "quadro" : "meccanico", sognoId: "sg03" }).stato;
  if (!avviata) return s;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
  if (finita) { s.fase = "finita"; s.vincitore = "a"; s.motivoVittoria = "rendita"; }
  return s;
}

/** Disegna, e restituisce il markup perché lo si possa controllare. */
const disegna = (elemento) => renderToStaticMarkup(
  React.createElement(LinguaProvider, null, elemento)
);
const conMercato = (stato, elemento) =>
  disegna(React.createElement(MercatoProvider, { stato }, elemento));

const nulla = () => {};

console.log("\n── Le schermate si disegnano ──");

prova("Ingresso, visitatore nuovo", () => {
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
  }));
  vero(html.length > 500, "markup troppo corto: la schermata è vuota");
  vero(html.includes("Quota Zero"), "manca il nome del prodotto");
  vero(/select/.test(html), "mancano i campi di scelta");
});

prova("Ingresso con partite lasciate a metà", () => {
  memoria.set("quotazero:partite", JSON.stringify([{ codice: "ABCD", vista: Date.now(), mercatoId: "roma", giocatori: 3, n: 1 }]));
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
  }));
  vero(html.includes("ABCD"), "la partita aperta non compare");
  memoria.delete("quotazero:partite");
});

prova("Ingresso subito dopo un cambio di mercato", () => {
  /* Il caso che ci è sfuggito: cambiando mercato, la professione scelta
     resta per un disegno quella del mercato precedente e non esiste nel
     nuovo. L'effetto che la corregge gira dopo, quindi il primo disegno
     deve reggere da solo. Si simula ricordando un mercato e disegnando
     l'altro. */
  memoria.set("quotazero:mercato", "roma");
  const html = disegna(React.createElement(MercatoProvider, { mercatoId: "classico" },
    React.createElement(Ingresso, { suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla })));
  vero(html.length > 500, "la schermata si è rotta durante il cambio");
  memoria.delete("quotazero:mercato");
});

prova("Sala d'attesa", () => {
  const s = tavolo({ avviata: false });
  const html = conMercato(s, React.createElement(Attesa, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes("PROV"), "manca il codice della stanza");
});

prova("Partita in corso", () => {
  const s = tavolo();
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.length > 2000, "la schermata di gioco è sospettosamente corta");
  vero(html.includes("svg"), "manca il tabellone");
});

prova("Partita al Livello 2", () => {
  const s = tavolo({ livello: 2 });
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.length > 2000);
});

prova("Partita sul mercato classico", () => {
  const s = tavolo({ mercatoId: "classico" });
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes("$"), "il mercato classico deve restare in dollari");
});

prova("Partita con una decisione in sospeso", () => {
  /* Il caso che ci è sfuggito: `SulTavolo` e il pannello di decisione
     compaiono solo quando c'è un pending, quindi un difetto lì non si vede
     all'apertura ma a metà partita. */
  const s = tavolo();
  const pacchetto = s.mercatoId === "roma" ? "roma" : "classico";
  const carta = (require_pacchetto(pacchetto)).mazzi.piccoli.find((c) => c.tipo === "immobile");
  s.pending = { tipo: "carta", giocatoreId: "a", carta };
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes("Sul tavolo") || html.includes("On the table"), "manca il riquadro della decisione");
});

prova("Partita con una carta Mercato aperta", () => {
  const s = tavolo();
  s.pending = { tipo: "mercato", giocatoreId: "a", idonei: ["a", "b"], risposto: [],
                carta: { tipo: "evento", nome: "Acconto IMU", testo: "…", effetto: "nessuno" } };
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.length > 2000);
});

prova("Partita quando puoi prendere il largo", () => {
  const s = tavolo();
  /* Rendita che supera le spese: compare il riquadro "Sei libero". Il
     riquadro appare solo nel PROPRIO turno, e l'ordine di gioco lo decide
     un tiro di dado: qui lo si forza, altrimenti il test passa o fallisce
     a seconda del seme. */
  const io = s.giocatori.find((g) => g.id === "a");
  io.attivita.push({ rid: "x", nome: "Test", costo: 1, acconto: 1, passivita: 0, flusso: 99999 });
  s.turno = s.giocatori.indexOf(io);
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes("largo") || html.includes("open water") || html.includes("Open Water"),
    "manca l'invito a prendere il largo");
});

prova("Schermata finale", () => {
  const s = tavolo({ finita: true });
  const html = conMercato(s, React.createElement(Vittoria, {
    stato: s, mioId: "a", suNuovaPartita: nulla, suChiudi: nulla, sonoHost: true,
  }));
  vero(html.includes("Ada"), "manca il vincitore");
});

prova("Lezioni e quesiti", () => {
  const html = disegna(React.createElement(Impara, { suEsci: nulla }));
  vero(html.includes("didattico"), "manca l'avvertenza");
  vero(html.length > 1000);
});

prova("Sfida del giorno, prima di cominciare", () => {
  const html = disegna(React.createElement(Sfida, { suEsci: nulla }));
  vero(/Sfida del giorno|Daily challenge/.test(html), "manca il titolo");
  vero(/VALUTAZIONE|Valutazione|Rating/i.test(html), "manca la valutazione");
});

prova("Sfida già giocata oggi", () => {
  /* Un tentativo al giorno: chi torna deve vedere il proprio risultato,
     non un pulsante che non funziona. */
  const oggi = new Date().toISOString().slice(0, 10);
  memoria.set("quotazero:sfida", JSON.stringify({ ultimoGiorno: oggi, punteggio: 42, serie: 3, migliore: 55, giocate: 7 }));
  const html = disegna(React.createElement(Sfida, { suEsci: nulla }));
  vero(html.includes("42"), "manca il punteggio di oggi");
  memoria.delete("quotazero:sfida");
});

console.log("\n── I componenti dentro la partita ──");

const s = tavolo();
for (const [nome, elemento] of [
  ["Tabellone", React.createElement(Tabellone, { stato: s, mioId: "a" })],
  ["Scheda", React.createElement(Scheda, { giocatore: s.giocatori[0], invia: nulla, inAzione: false, mio: true })],
  ["Giocatori", React.createElement(Giocatori, { stato: s, mioId: "a" })],
  ["Registro", React.createElement(Registro, { stato: s })],
  ["Chat", React.createElement(Chat, { stato: s, mioId: "a", suLetto: nulla })],
]) {
  prova(nome, () => {
    const html = conMercato(s, elemento);
    vero(html.length > 50, "markup vuoto");
  });
}

console.log("\n── In tutte le lingue ──");

for (const lingua of ["it", "en"]) {
  prova(`Ogni schermata si disegna in "${lingua}"`, () => {
    memoria.set("quotazero:lingua", lingua);
    const st = tavolo();
    disegna(React.createElement(Ingresso, { suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla }));
    conMercato(st, React.createElement(Partita, { stato: st, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla }));
    disegna(React.createElement(Impara, { suEsci: nulla }));
    memoria.delete("quotazero:lingua");
  });
}

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
