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
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
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
/* La lingua si fissa qui, e non si lascia decidere all'ambiente.
   Node 21+ definisce già `navigator.languages` (["en-US"]), quindi la
   guardia qui sotto non scattava mai e ogni schermata veniva disegnata in
   inglese: le prove passavano lo stesso perché nessuna guardava il testo.
   La prima che l'ha fatto è finita a cercare "Gioca al tavolo" dentro una
   pagina che diceva "Play at a table". */
memoria.set("quotazero:lingua", "it");

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

const { traduci } = await import("../src/i18n/index.js");
const { LinguaProvider } = await import("../src/Lingua.jsx");
const { MercatoProvider } = await import("../src/Mercato.jsx");
const Ingresso = (await import("../src/screens/Ingresso.jsx")).default;
const require_partite = await import("../src/lib/partite.js");
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
  try {
    const r = fn();
    /* Una prova asincrona qui passerebbe SEMPRE: `fn()` restituisce una
       promessa, nessuno l'aspetta, e le sue verifiche non vengono mai
       eseguite. È già successo — sette prove in sei file non controllavano
       più niente da settimane. Meglio rumore che silenzio. */
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le sue verifiche non verrebbero eseguite");
    }
    console.log("  ✅ " + nome); passati++;
  }
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

prova("Ingresso, visitatore nuovo: prima le destinazioni", () => {
  /* Chi arriva non deve trovarsi davanti un modulo di otto campi prima di
     sapere che gioco sia. */
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
  }));
  vero(html.length > 500, "markup troppo corto: la schermata è vuota");
  vero(html.includes("Quota Zero"), "manca il nome del prodotto");
  vero(/class="destinazione/.test(html), "mancano le destinazioni");
  vero(!/role="combobox"/.test(html), "il modulo non deve venire prima della scelta");
});

prova("Ogni destinazione dice cosa succede se la scegli", () => {
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
  }));
  for (const k of ["casa.tavolo", "casa.sfida", "casa.lezioni", "casa.quesiti"]) {
    const testo = traduci("it", k);
    vero(html.includes(testo), `manca la destinazione "${testo}"`);
  }
  /* Una destinazione senza spiegazione è un pulsante che si preme a caso. */
  vero(html.includes(traduci("it", "casa.tavoloNota")), "le destinazioni non si spiegano");
});

prova("Ingresso, chi ha scelto di giocare trova il modulo", () => {
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo",
  }));
  vero(/role="combobox"/.test(html), "mancano i campi di scelta");
  vero(html.includes(traduci("it", "casa.torna")), "non si può tornare indietro");
});

prova("Chi entra con un codice non vede la configurazione", () => {
  /* Mercato, livello, professione e sogno non riguardano chi entra: il
     mercato lo decide la stanza, e gli altri due si scelgono nella sala
     d'attesa, dove l'elenco è quello giusto. Prima si compilavano tutti e
     quattro e solo in fondo si scopriva che non servivano. */
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo", modoIniziale: "entra",
  }));
  vero(html.includes('id="campo-codice"'), "manca il campo del codice");
  vero(html.includes('id="campo-nome"'), "manca il nome");
  for (const campo of ["campo-mercato", "campo-professione", "campo-sogno", "campo-livello"]) {
    vero(!html.includes(`id="${campo}"`), `"${campo}" non riguarda chi entra`);
  }
});

prova("Chi crea vede tutto quello che gli serve, e nessun codice", () => {
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo", modoIniziale: "crea",
  }));
  for (const campo of ["campo-nome", "campo-mercato", "campo-professione", "campo-sogno"]) {
    vero(html.includes(`id="${campo}"`), `manca "${campo}"`);
  }
  vero(!html.includes('id="campo-codice"'), "chi crea non ha un codice da inserire");
});

prova("La scelta fra creare ed entrare viene prima dei campi", () => {
  /* Se sta dopo, si compila e poi si scopre di aver compilato per niente. */
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo",
  }));
  const scelta = html.indexOf("scelta-modo");
  const primoCampo = html.indexOf('id="campo-nome"');
  vero(scelta >= 0, "manca la scelta fra creare ed entrare");
  vero(scelta < primoCampo, "la scelta sta dopo i campi che governa");
});

prova("La professione mandata è quella del mercato della stanza", () => {
  /* Il difetto originale: il modulo offriva le professioni del mercato
     scelto in locale e il motore, non trovandole, sostituiva in silenzio
     con la prima del mercato giusto — si sceglieva una cosa e se ne
     otteneva un'altra. La correzione non è smettere di mandarla (per un
     po' è stato così, e chi entrava si ritrovava assegnata una professione
     senza averla scelta): è chiedere PRIMA su che mercato si gioca. */
  const src = readFileSync(process.cwd() + "/src/screens/Ingresso.jsx", "utf8");

  const chiamata = src.match(/api\.azione\([^;]*?tipo: "entra"[^;]*?\);/s)?.[0] || "";
  vero(chiamata.length > 0, "non trovo la chiamata d'ingresso");
  vero(/professioneId/.test(chiamata), "chi entra deve poter scegliere la professione");

  const trova = src.match(/const trovaStanza[\s\S]*?\n  \};/)?.[0] || "";
  vero(trova.length > 0, "manca il passo che cerca la stanza");
  vero(/leggiStato/.test(trova), "non legge lo stato della stanza prima di entrare");
  vero(/getPacchetto\(stato\.mercatoId/.test(trova),
    "non riparte dalle professioni del mercato della stanza");
  vero(/setProfessione\(/.test(trova) && /setSogno\(/.test(trova),
    "non azzera le scelte fatte su un altro mercato");
});

prova("Trovata la stanza, si sceglie dal mercato di QUELLA stanza", () => {
  /* Il punto di tutto il secondo passo. Il mercato scelto in locale è
     "classico"; la stanza è su Roma. Le professioni offerte devono essere
     quelle romane, in euro. */
  memoria.set("quotazero:mercato", "classico");
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo", modoIniziale: "entra",
    stanzaIniziale: { codice: "ABCD", mercatoId: "roma", livello: 2, giocatori: ["Ada"] },
  }));
  const roma = require_pacchetto("roma").professioni[0].nome;
  const classico = require_pacchetto("classico").professioni[0].nome;
  vero(html.includes(roma), `manca la professione romana "${roma}"`);
  vero(!html.includes(classico), `offre "${classico}", che a Roma non esiste`);
  vero(html.includes("€"), "gli stipendi devono essere in euro");
  vero(html.includes("ABCD"), "non dice in che stanza si sta entrando");
  memoria.delete("quotazero:mercato");
});

prova("Chi entra può cambiare idea sul codice", () => {
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
    vistaIniziale: "modulo", modoIniziale: "entra",
    stanzaIniziale: { codice: "ABCD", mercatoId: "roma", livello: 1, giocatori: ["Ada"] },
  }));
  vero(html.includes(traduci("it", "ingresso.altroCodice")), "non si può tornare al codice");
});

prova("Le partite salvate non seppelliscono il pulsante per giocare", () => {
  /* Sei partite spingevano "Gioca al tavolo" sotto la piega: il pulsante
     per cui si è sulla pagina finiva sotto un elenco di codici. */
  const ora = Date.now();
  memoria.set("quotazero:partite", JSON.stringify(
    ["AAAA", "BBBB", "CCCC", "DDDD", "EEEE", "FFFF"].map((c, i) => ({
      codice: c, vista: ora - i * 3600e3, mercatoId: "roma", giocatori: 2, n: 10 - i,
      scadeIl: ora + 40 * 3600e3,
    }))
  ));
  const html = disegna(React.createElement(Ingresso, {
    suEntrato: nulla, avvisa: nulla, suSfida: nulla, suImpara: nulla,
  }));
  const mostrate = ["AAAA", "BBBB", "CCCC", "DDDD", "EEEE", "FFFF"].filter((c) => html.includes(c));
  vero(mostrate.length === 3, `ne mostra ${mostrate.length} invece di 3`);
  vero(html.includes(traduci("it", "ingresso.mostraTutte", { n: 6 })), "non si possono vedere le altre");
  memoria.delete("quotazero:partite");
});

prova("Ogni partita salvata dice da quanto non la tocchi", () => {
  /* Senza, è una colonna di codici a quattro lettere tutti uguali. */
  const { daQuanto } = require_partite;
  const t = (k, v) => traduci("it", k, v);
  vero(daQuanto(Date.now(), t) === traduci("it", "ingresso.adesso"));
  vero(daQuanto(Date.now() - 25 * 60000, t).includes("25"));
  vero(daQuanto(Date.now() - 3 * 3600e3, t).includes("3"));
  vero(daQuanto(Date.now() - 30 * 3600e3, t) === traduci("it", "ingresso.giornoFa"));
  for (const ms of [0, Date.now(), Date.now() - 1e9]) {
    vero(!/\{\w+\}/.test(daQuanto(ms, t)), "segnaposto non sostituito");
    vero(!/NaN/.test(daQuanto(ms, t)), "NaN in un'etichetta");
  }
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

prova("Partita con una decisione in sospeso: chi decide vede la carta", () => {
  const s = tavolo();
  const pacchetto = s.mercatoId === "roma" ? "roma" : "classico";
  const carta = (require_pacchetto(pacchetto)).mazzi.piccoli.find((c) => c.tipo === "immobile");
  s.pending = { tipo: "carta", giocatoreId: "a", carta };
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes(carta.nome), "chi deve decidere non vede la carta");
});

prova("Chi guarda lo legge nel tabellone, non in un riquadro sotto", () => {
  /* Il riquadro «sul tavolo» e poi quello del turno stavano nella colonna
     del tavolo, che dà al tabellone lo spazio che avanza: comparivano e il
     tabellone si rimpiccioliva sotto gli occhi di chi lo guardava. Il
     centro del tabellone è spazio già speso e non costa niente a nessuno. */
  const s = tavolo();
  const pacchetto = s.mercatoId === "roma" ? "roma" : "classico";
  const carta = (require_pacchetto(pacchetto)).mazzi.piccoli.find((c) => c.tipo === "immobile");
  /* L'ordine di gioco lo decide un tiro di dado, quindi va fissato. */
  s.turno = s.giocatori.findIndex((g) => g.id === "a");
  s.pending = { tipo: "carta", giocatoreId: "a", carta };
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "b", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(/TURNO DI ADA/i.test(html), "il tabellone non dice di chi è il turno");
  vero(html.includes("Ada sta valutando"), "il tabellone non dice cosa sta facendo");
  vero(!/Sul tavolo|On the table/.test(html), "il riquadro è tornato");
});

prova("La nota nel tabellone non supera mai la larghezza del centro", () => {
  /* In SVG il testo non va a capo e non si tronca da solo: esce dal
     cerchio e finisce sopra le caselle. Si taglia a mano, quindi si
     verifica a mano. */
  const s = tavolo();
  s.turno = s.giocatori.findIndex((g) => g.id === "a");
  s.pending = {
    tipo: "carta", giocatoreId: "a",
    carta: { tipo: "immobile", nome: "Un nome di carta lunghissimo che non starebbe mai nel cerchio centrale", costo: 1, acconto: 1, flusso: 1 },
  };
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "b", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  const testi = [...html.matchAll(/<text[^>]*>([^<]{20,})<\/text>/g)].map((m) => m[1]);
  for (const testo of testi) {
    vero(testo.length <= 44, `riga di ${testo.length} caratteri nel tabellone: "${testo}"`);
  }
  vero(html.includes("…"), "la nota lunga non è stata troncata");
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

prova("La scheda del Largo mostra la rendita vera", () => {
  /* Prima mostrava un contatore separato che partiva da cento volte la
     rendita. Ora sul Largo si vive del portafoglio, e la scheda deve dire
     quello che il portafoglio produce. */
  const s = tavolo();
  const io = s.giocatori.find((g) => g.id === "a");
  io.tracciato = "veloce";
  io.stipendio = 0;
  io.attivita = [{ rid: "k", nome: "Impianto", costo: 40000, acconto: 40000, passivita: 0, flusso: 1200 }];
  io.redditoInizialeVeloce = 1200;
  const html = conMercato(s, React.createElement(Scheda, {
    giocatore: io, invia: nulla, inAzione: false, mio: true,
  }));
  vero(html.length > 300, "la scheda del Largo non si disegna");
  /* 1.200 € formattati dal mercato romano. */
  vero(html.includes("1.200"), "non mostra la rendita vera del portafoglio");
  vero(!html.includes("120.000"), "mostra ancora il contatore moltiplicato per cento");
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

console.log("\n── Con l'interfaccia in inglese non resta italiano ──");

/* Il difetto che questa sezione insegue non è "una traduzione manca": è
   "una stringa non passa da t()". Non si vede leggendo il codice, perché
   una frase scritta a mano è indistinguibile da una tradotta finché non si
   cambia lingua. Si vede disegnando le schermate in inglese e cercandoci
   dentro parole che in inglese non esistono. */
/* Solo parole dell'INTERFACCIA. I contenuti del mercato — "Mutuo o
   affitto", "Prestito studi", i nomi delle professioni e dei sogni —
   restano in italiano di proposito: sono circa 150 stringhe per mercato e
   vanno tradotte da qualcuno che conosca il posto, non a macchina (vedi
   TODO). Pretenderle qui renderebbe questo controllo impossibile da
   passare, e un controllo impossibile da passare viene disattivato. */
const SPIE = [
  "Contanti", "Entrate", "Uscite", "Passività", "Attivi", "Stipendio",
  "Giorno di paga", "Tocca a", "Salterai", "Estingui", "Rimborsa",
  "Patrimonio netto", "Spese totali", "Reddito", "Professione",
  "Partirai", "Esci dalla stanza", "Il tuo sogno", "Conto economico",
  "Stato patrimoniale", "Valore degli attivi", "Spese figli",
];

/** Le parole italiane rimaste dentro un markup disegnato in inglese. */
function spieIn(html) {
  const nudo = html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  return SPIE.filter((w) => nudo.includes(w));
}

function inInglese(fn) {
  memoria.set("quotazero:lingua", "en");
  try { return fn(); } finally { memoria.set("quotazero:lingua", "it"); }
}

prova("La scheda finanziaria", () => {
  const s = tavolo();
  const io = s.giocatori[0];
  const html = inInglese(() => conMercato(s, React.createElement(Scheda, {
    giocatore: io, invia: nulla, inAzione: false, mio: true,
  })));
  const trovate = spieIn(html);
  vero(trovate.length === 0, "rimaste in italiano: " + trovate.join(", "));
});

prova("La scheda finanziaria con un debito in banca", () => {
  /* Il riquadro del debito compare solo quando c'è un debito: senza uno
     stato apposta non verrebbe mai disegnato, e quindi mai verificato. */
  const s = tavolo();
  const io = s.giocatori[0];
  io.passivita.prestitoBanca = 9000;
  io.contanti = 20000;
  const html = inInglese(() => conMercato(s, React.createElement(Scheda, {
    giocatore: io, invia: nulla, inAzione: false, mio: true,
  })));
  const trovate = spieIn(html);
  vero(trovate.length === 0, "rimaste in italiano: " + trovate.join(", "));
});

prova("La sala d'attesa", () => {
  const s = tavolo({ avviata: false });
  const html = inInglese(() => conMercato(s, React.createElement(Attesa, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  })));
  const trovate = spieIn(html);
  vero(trovate.length === 0, "rimaste in italiano: " + trovate.join(", "));
});

prova("La partita in corso", () => {
  const s = tavolo();
  const html = inInglese(() => conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "b", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  })));
  const trovate = spieIn(html);
  vero(trovate.length === 0, "rimaste in italiano: " + trovate.join(", "));
});

console.log("\n── Copiare negli appunti ──");
/* Questo file viene impacchettato in node_modules/.cache prima di girare
   (vedi prova-schermate.sh), quindi `import.meta.url` non dice dove sta il
   progetto: lo dice la directory di lavoro. */
const RADICE = process.cwd();
const relativo = (f) => relative(RADICE, f);
/* Il codice senza i commenti: un commento che CITA una cosa per spiegare
   perché non la si usa non è quella cosa. */
const senzaCommenti = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, " ")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
const JSXFILE = (function raccogli(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) raccogli(p, out);
    else if (/\.(jsx?|mjs)$/.test(p)) out.push(p);
  }
  return out;
})(join(RADICE, "src"));


prova("Nessuno chiama più gli appunti a mano", () => {
  /* Tre pulsanti diversi lo facevano, e tutti e tre tacevano quando
     fallivano: il codice stanza in partita, l'invito nella sala d'attesa
     e la condivisione del risultato della sfida. */
  const guai = [];
  for (const f of JSXFILE) {
    if (/lib\/appunti\.js$/.test(f)) continue;
    const src = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    if (/navigator\.clipboard/.test(src)) guai.push(relativo(f));
  }
  if (guai.length) throw new Error("usano gli appunti senza ripiego: " + guai.join(", "));
});

console.log("\n── Sul telefono il tabellone è solo ──");

/* Il banco di prova finge uno schermo stretto (`matchMedia` risponde
   sempre "no"), quindi qui si disegna sempre la forma da telefono. */

prova("A foglio chiuso non c'è nient'altro che il tabellone", () => {
  /* Prima lo schermo era diviso in due e nessuna delle due metà bastava:
     il tabellone in un terzo di schermo, del pannello una striscia. */
  const s = tavolo();
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(html.includes("svg"), "manca il tabellone");
  vero(!/class="foglio/.test(html), "un foglio è aperto senza che nessuno l'abbia chiesto");
  vero(!html.includes("Conto economico"), "la scheda non deve stare in pagina");
  vero(!html.includes("CHAT DEL TAVOLO") && !html.includes("Chat del tavolo"),
    "la chat non deve stare in pagina");
});

prova("Aprendo una sezione si apre un foglio", () => {
  const s = tavolo();
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
    schedaIniziale: "scheda",
  }));
  vero(/class="foglio/.test(html), "il foglio non si è aperto");
  vero(/role="dialog"/.test(html), "il foglio deve annunciarsi come finestra");
  vero(/aria-modal="true"/.test(html), "manca aria-modal");
  vero(html.includes("Conto economico"), "il foglio non contiene la sezione");
});

prova("Solo le regole hanno il foglio chiaro", () => {
  /* Il resto sta sul verde del tavolo, perché dentro ci vanno gli stessi
     riquadri disegnati per il fondo scuro. Le regole sono l'unica sezione
     che si legge come un testo lungo. */
  const s = tavolo();
  const disegnaCon = (sez) => conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
    schedaIniziale: sez,
  }));
  vero(/foglio foglio-chiaro/.test(disegnaCon("regole")), "le regole devono stare sul chiaro");
  for (const sez of ["scheda", "gioc", "chat", "log"]) {
    vero(!/foglio-chiaro/.test(disegnaCon(sez)), `"${sez}" non deve usare il foglio chiaro`);
  }
});

prova("Il pulsante del tiro sta nella ruota, non sotto", () => {
  /* Sotto il tabellone occupava quasi duecento pixel, e c'era solo quando
     toccava a te: il resto della pagina cambiava altezza a ogni turno. */
  const s = tavolo();
  s.turno = s.giocatori.findIndex((g) => g.id === "a");
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(/class="tira-centro"/.test(html), "il pulsante non è nella ruota");
  vero((html.match(/Tira il dado/g) || []).length === 1,
    "il pulsante del tiro compare due volte");
});

prova("Quando il pulsante è nella ruota, la ruota si libera", () => {
  /* Due cose nello stesso punto sono una cosa illeggibile. */
  const s = tavolo();
  s.turno = s.giocatori.findIndex((g) => g.id === "a");
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  vero(!html.includes(">Quota Zero</text>"), "il marchio resta sotto il pulsante");
});

prova("La barra in alto non ripete la casella su cui sei", () => {
  /* La dice già il centro del tabellone, per intero. Quassù non ci stava
     — "Giorno di ..." — e rubava spazio a codice e contanti. */
  const s = tavolo();
  const html = conMercato(s, React.createElement(Partita, {
    stato: s, mioId: "a", invia: nulla, inAzione: false, avvisa: nulla, suEsci: nulla,
  }));
  const primaRiga = html.slice(0, html.indexOf("</svg>"));
  vero(!/LA RUOTA<\/div>/.test(primaRiga), "la barra ripete il tracciato");
});

console.log("\n── I dadi non restano sul tabellone ──");

prova("Il riquadro del tiro non usa AnimatePresence", () => {
  /* Ci è costato caro. `AnimatePresence` tiene in vita un figlio finché la
     sua animazione d'uscita non dichiara d'essere finita; qui non lo
     dichiarava mai. Ogni tiro lasciava un riquadro nel documento: dopo
     qualche giro se ne trovavano due o tre sovrapposti sul tabellone, e
     quando uno veniva rianimato compariva sopra la plancia senza motivo.
     È il difetto per cui "si vedono i dadi e non si vede più il
     tabellone". Un elemento che compare, sta due secondi e sparisce non ha
     bisogno di presenza animata: basta non disegnarlo. */
  /* Senza commenti: qui sopra AnimatePresence è CITATO per spiegare
     perché non si usa, ed è esattamente il tranello in cui questo
     controllo è già cascato una volta con `<select>`. */
  const src = senzaCommenti(readFileSync(process.cwd() + "/src/components/Dadi.jsx", "utf8"));
  vero(!/AnimatePresence/.test(src),
    "AnimatePresence è tornato: i riquadri del tiro torneranno ad accumularsi");
  vero(/\{visibile && tiro && \(/.test(src), "il riquadro non è più condizionato allo stato");
});

prova("Il timer del tiro non dipende dall'oggetto che arriva dal server", () => {
  /* `stato.ultimoTiro` è un oggetto nuovo a ogni interrogazione, una ogni
     1,4 secondi. Dipendendo da quello, l'effetto si rilanciava di
     continuo: la pulizia spegneva il timer avviato, il corpo usciva subito
     perché il numero non era cambiato, e il timer nuovo non partiva mai. */
  const src = readFileSync(process.cwd() + "/src/components/Dadi.jsx", "utf8");
  vero(/\}, \[tiro\?\.n\]\);/.test(src),
    "l'effetto deve dipendere dal numero del tiro, non dall'oggetto");
});

console.log("\n── Il marchio ──");

const Logo = (await import("../src/components/Logo.jsx")).default;
const { MARCHIO } = await import("../src/marchio.js");

prova("Il logo prende il nome da marchio.js", () => {
  /* Scritto a mano nella pagina d'ingresso, il nome è quello che alla
     rinomina resta indietro. */
  vero(disegna(React.createElement(Logo, {})).includes(MARCHIO.nome));
});

prova("Senza destinazione non finge di essere un pulsante", () => {
  const html = disegna(React.createElement(Logo, {}));
  vero(!html.includes("<button"), "un logo che non porta da nessuna parte non è premibile");
});

prova("Con una destinazione è un pulsante che si annuncia", () => {
  const html = disegna(React.createElement(Logo, { suCasa: nulla }));
  vero(html.includes("<button"), "non è premibile");
  vero(/aria-label="[^"]+"/.test(html), "un pulsante col solo rombo va nominato");
});

console.log("\n── La tendina ──");

/* Disegnata da sola, per potersi guardare il contratto ARIA senza il
   rumore di una schermata intera. */
const modScelta = await import("../src/components/Scelta.jsx");
const Scelta = modScelta.default;
const { posizione } = modScelta;
const OPZIONI = [
  { valore: "a", emoji: "🧑‍🏫", etichetta: "Insegnante", dettaglio: "1.850 €/mese" },
  { valore: "b", emoji: "🔧", etichetta: "Meccanico", dettaglio: "1.600 €/mese" },
  { valore: "c", etichetta: "Quadro", nota: "stipendio più alto, spese più alte" },
];
const tendina = (extra = {}) => disegna(React.createElement(Scelta, {
  id: "prova", etichetta: "Professione", valore: "b",
  onCambia: nulla, opzioni: OPZIONI, ...extra,
}));

prova("Mostra il valore scelto, non il primo dell'elenco", () => {
  const html = tendina();
  vero(html.includes("Meccanico"), "non mostra ciò che è selezionato");
  vero(!html.includes("Insegnante"), "chiusa non deve elencare le altre voci");
});

prova("Dichiara di essere una tendina, e di essere chiusa", () => {
  const html = tendina();
  vero(/role="combobox"/.test(html), "manca role=combobox");
  vero(/aria-haspopup="listbox"/.test(html), "manca aria-haspopup");
  vero(/aria-expanded="false"/.test(html), "chiusa deve dirsi chiusa");
  vero(/aria-controls="prova-elenco"/.test(html), "non punta al proprio elenco");
});

prova("Il nome accessibile lega etichetta e valore", () => {
  /* Senza questo un lettore di schermo annuncia solo "Meccanico" e non
     dice di che campo si tratti. */
  vero(/aria-labelledby="prova-etichetta prova"/.test(tendina()),
    "l'etichetta non è legata al pulsante");
});

prova("Senza etichetta visibile ne resta una per chi non vede", () => {
  const html = tendina({ etichetta: undefined, etichettaAria: "Professione" });
  vero(/aria-label="Professione"/.test(html), "campo senza nome accessibile");
  vero(!/aria-labelledby/.test(html), "non deve puntare a un'etichetta che non c'è");
});

prova("È un pulsante, non un campo che si può inviare", () => {
  /* Senza type="button" dentro un form il primo clic invierebbe tutto. */
  vero(/type="button"/.test(tendina()), 'manca type="button"');
});

prova("Disabilitata si dichiara tale", () => {
  vero(/disabled/.test(tendina({ disabilitato: true })), "non risulta disabilitata");
});

prova("Regge un elenco vuoto e un valore che non esiste", () => {
  /* Succede per un disegno solo quando si cambia mercato: la professione
     scelta è ancora quella di prima e nel nuovo elenco non c'è. */
  vero(tendina({ opzioni: [] }).length > 0, "elenco vuoto: si rompe");
  vero(tendina({ valore: "inesistente" }).includes("Insegnante"),
    "con un valore ignoto deve ripiegare sulla prima voce");
});

prova("Sotto ci sta: si apre in giù", () => {
  const p = posizione({ spazioSopra: 200, spazioSotto: 400, altezza: 320 });
  vero(!p.sopra, "non c'era ragione di ribaltare");
});

prova("Sotto non ci sta e sopra sì: si ribalta", () => {
  /* Il caso visto per davvero nella sala d'attesa: l'elenco finiva cento
     pixel sotto il bordo della finestra. */
  const p = posizione({ spazioSopra: 500, spazioSotto: 90, altezza: 320 });
  vero(p.sopra, "doveva aprirsi verso l'alto");
});

prova("Stretti da tutte e due le parti, non si ribalta per nulla", () => {
  /* Ribaltare per guadagnare pochi pixel confonde: il campo resta fermo e
     l'elenco salta da una parte all'altra senza un motivo visibile. */
  vero(!posizione({ spazioSopra: 100, spazioSotto: 96, altezza: 320 }).sopra);
});

prova("L'altezza si adatta allo spazio, ma non sparisce", () => {
  const stretto = posizione({ spazioSopra: 100, spazioSotto: 300, altezza: 320 });
  vero(!stretto.sopra && stretto.altezzaMax === 288, "deve fermarsi allo spazio disponibile");
  vero(posizione({ spazioSopra: 20, spazioSotto: 20, altezza: 320 }).altezzaMax >= 140,
    "in uno spazio minimo resta comunque qualcosa da leggere");
  vero(posizione({ spazioSopra: 900, spazioSotto: 900, altezza: 200 }).altezzaMax === 200,
    "non deve crescere oltre il proprio contenuto");
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
