/**
 * Verifiche della prima partita e della voce che la spiega.
 *   node scripts/prova-guida.mjs
 *
 * Il difetto che questi test inseguono è quello che rende inutile una
 * guida: che parli nel momento sbagliato, o che non parli affatto. Non si
 * vede leggendo il codice — si vede giocando, e chi la gioca è chi non sa
 * ancora niente del gioco e non ha modo di dire che manca qualcosa.
 */
import { applicaAzione } from "../src/game/motore.js";
import { mossaBot } from "../src/game/avversario.js";
import { prossimoPasso, PASSI } from "../src/game/guida.js";
import {
  creaPrimaPartita, TURNI_PRIMA_PARTITA, SEME_PRIMA_PARTITA,
  PROFESSIONE_PRIMA_PARTITA, MERCATO_PRIMA_PARTITA,
} from "../src/game/prima-partita.js";
import { getPacchetto } from "../src/game/mercati/indice.js";
import { redditoPassivo, speseTotali, sogliaUscita, flussoMensile } from "../src/game/finanze.js";
import { dizionari } from "../src/i18n/index.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le sue verifiche non verrebbero eseguite");
    }
    console.log("  ✅ " + nome); passati++;
  } catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Gioca la prima partita e restituisce i passi detti, in ordine. */
function giocata(seme) {
  const { stato } = creaPrimaPartita();
  let s = seme === undefined ? stato : { ...stato, seme };
  const detti = new Set();
  const ordine = [];
  const dì = (prima, dopo) => {
    const p = prossimoPasso(prima, dopo, detti);
    if (p) { detti.add(p.id); ordine.push(p.id); }
  };
  let prima = null, n = 0;
  dì(null, s);
  while (s.fase === "inCorso" && s.numeroTurno <= TURNI_PRIMA_PARTITA && n < 900) {
    const az = mossaBot(s);
    if (!az) break;
    const r = applicaAzione(s, { ...az, giocatoreId: "io" });
    if (r.errore) break;
    prima = s; s = r.stato; n++;
    dì(prima, s);
  }
  return { ordine, detti, stato: s };
}

console.log("\n── La prima partita ──");

prova("Si gioca sempre la stessa, e con la scheda giusta", () => {
  /* Un mazzo a caso può dare una prima partita in cui non esce un affare
     comprabile, e chi la gioca esce senza aver visto la cosa per cui il
     gioco esiste. */
  const a = creaPrimaPartita(), b = creaPrimaPartita();
  eq(a.stato.seme, SEME_PRIMA_PARTITA, "il seme non è quello dichiarato:");
  eq(b.stato.seme, a.stato.seme, "due prime partite hanno mazzi diversi:");
  eq(a.stato.mercatoId, MERCATO_PRIMA_PARTITA);
  eq(a.professione.id, PROFESSIONE_PRIMA_PARTITA, "professione:");
  eq(a.stato.giocatori.length, 1, "si gioca da soli:");
  eq(a.stato.fase, "inCorso", "comincia già avviata:");
});

prova("La scheda della prima partita ha il traguardo più vicino di tutte", () => {
  /* Con il pilota di linea si finirebbe la prima partita al nove per cento
     del traguardo, cioè senza aver visto la barra muoversi. */
  const p = getPacchetto(MERCATO_PRIMA_PARTITA);
  const { stato } = creaPrimaPartita();
  const mio = Math.round(sogliaUscita(stato.giocatori[0]));
  for (const prof of p.professioni) {
    const spese = Object.values(prof.spese).reduce((a, b) => a + b, 0);
    const suo = Math.round(spese * (p.margineUscita ?? 1));
    vero(mio <= suo, `${prof.nome} ha un traguardo più vicino (${suo}) di quello scelto (${mio})`);
  }
});

prova("Si comincia con qualcosa da spendere", () => {
  /* Senza, i primi venti turni se ne vanno a mettere insieme il primo
     anticipo e non si decide niente — e la guida non ha di che parlare. */
  const { stato } = creaPrimaPartita();
  const g = stato.giocatori[0];
  const p = getPacchetto(MERCATO_PRIMA_PARTITA);
  const minimo = Math.min(...p.mazzi.piccoli.filter((c) => c.acconto > 0).map((c) => c.acconto));
  vero(g.contanti >= minimo, `si comincia con ${g.contanti}, l'affare più economico ne chiede ${minimo}`);
});

prova("Il nome si prende da chi gioca, e regge il vuoto", () => {
  eq(creaPrimaPartita({ nome: "Sofia" }).stato.giocatori[0].nome, "Sofia");
  eq(creaPrimaPartita({ nome: "   " }).stato.giocatori[0].nome, "Tu", "con un nome vuoto:");
  eq(creaPrimaPartita().stato.giocatori[0].nome, "Tu", "senza nome:");
});

console.log("\n── La voce parla quando serve ──");

prova("La prima cosa detta è chi sei", () => {
  /* È la frase che deve bastare a far tirare il dado: fra l'apertura e il
     primo tiro non succede niente, e la voce parla solo quando succede
     qualcosa. */
  const { ordine } = giocata();
  eq(ordine[0], "chiSei", "il primo passo detto:");
});

prova("Nella partita fissa si dicono tutti i passi", () => {
  const { detti } = giocata();
  const mai = PASSI.map((p) => p.id).filter((id) => !detti.has(id));
  vero(mai.length === 0, "passi mai detti: " + mai.join(", "));
});

prova("Si dicono tutti anche cambiando il mazzo", () => {
  /* Se la guida parlasse solo con quel seme, cambiare i dati del mercato
     la zittirebbe in silenzio. */
  for (const seme of [1, 42, 1234, 99999, 777777]) {
    const { detti } = giocata(seme);
    const mai = PASSI.map((p) => p.id).filter((id) => !detti.has(id));
    vero(mai.length === 0, `seme ${seme}: mai detti ${mai.join(", ")}`);
  }
});

prova("Ogni passo si dice una volta sola", () => {
  const { ordine } = giocata();
  eq(new Set(ordine).size, ordine.length, "un passo è stato ripetuto:");
});

prova("Non si parla di un affare che non ci si può permettere", () => {
  /* Spiegare come si legge un affare davanti a uno che costa quattro
     volte i contanti non insegna a scegliere: non c'è niente da
     scegliere. */
  const { stato } = creaPrimaPartita();
  const carta = { tipo: "immobile", nome: "X", acconto: 999999, flusso: 500, costo: 1 };
  const caro = { ...stato, pending: { tipo: "carta", giocatoreId: "io", carta } };
  const passo = prossimoPasso(stato, caro, new Set(["chiSei"]));
  eq(passo?.id, "prestito", "davanti a un affare fuori portata si parla di banca:");
});

prova("Ogni passo ha la sua frase, in ogni lingua", () => {
  for (const [lingua, dizionario] of Object.entries(dizionari)) {
    for (const passo of PASSI) {
      const testo = dizionario.guida?.[passo.id];
      vero(typeof testo === "string" && testo.length > 10,
        `${lingua}: manca o è vuota la frase del passo "${passo.id}"`);
    }
  }
});

prova("Nessuna frase promette numeri che il passo non prepara", () => {
  /* Un {segnaposto} senza valore resta scritto così com'è sullo schermo. */
  const { stato } = creaPrimaPartita();
  for (const passo of PASSI) {
    const valori = passo.valori ? passo.valori(
      passo.id === "carta"
        ? { ...stato, pending: { tipo: "carta", carta: { acconto: 1, flusso: 1 } } }
        : stato,
      (n) => String(n)
    ) : {};
    for (const [lingua, dizionario] of Object.entries(dizionari)) {
      const testo = dizionario.guida[passo.id];
      for (const m of testo.matchAll(/\{(\w+)\}/g)) {
        vero(m[1] in valori, `${lingua}/${passo.id}: la frase chiede {${m[1]}} e il passo non lo prepara`);
      }
    }
  }
});

prova("La partita finisce entro i turni dichiarati", () => {
  const { stato } = giocata();
  vero(stato.numeroTurno <= TURNI_PRIMA_PARTITA + 1,
    `è arrivata al turno ${stato.numeroTurno} su ${TURNI_PRIMA_PARTITA}`);
});

prova("Chi gioca arriva a costruirsi una rendita vera", () => {
  /* Il senso della prima partita è vedere la barra muoversi. Se si
     finisce a zero, non si è visto niente. */
  const { stato } = giocata();
  const g = stato.giocatori[0];
  vero(redditoPassivo(g) > 0, "si finisce senza aver comprato niente");
  vero(flussoMensile(g) > 0, "si finisce col flusso negativo");
  vero(speseTotali(g) > 0);
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
