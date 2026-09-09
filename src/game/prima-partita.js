/**
 * LA PRIMA PARTITA.
 *
 * Una partita sola, corta, sempre la stessa, con una voce che spiega
 * mentre succede. Non è una modalità di gioco: è il modo in cui si impara
 * a giocare, e finisce quando si è capito.
 *
 * ═══ PERCHÉ UN SEME FISSO ═══
 *
 * Perché la guida possa dire la cosa giusta al momento giusto, quel
 * momento deve arrivare. Con un mazzo a caso può capitare una prima
 * partita in cui non esce nemmeno un affare comprabile, e chi la gioca
 * esce senza aver visto la cosa per cui il gioco esiste. Il seme è fisso e
 * scelto: la stessa prima partita per tutti, come la stessa prima partita
 * di scacchi in qualunque manuale.
 *
 * ═══ PERCHÉ UNA PROFESSIONE POVERA ═══
 *
 * L'operatore ecologico ha lo stipendio più basso e le spese più basse, e
 * quindi il traguardo più vicino: in venticinque turni si arriva davvero a
 * vedere la barra muoversi. Con il pilota di linea si finirebbe la prima
 * partita al nove per cento del traguardo, cioè senza aver visto niente.
 */
import { creaStanza, applicaAzione, codiceStanza } from "./motore.js";
import { getPacchetto, versioneCorrente } from "./mercati/indice.js";

/** Quanto dura. Corta: deve stare in cinque minuti e finire, non vincersi. */
export const TURNI_PRIMA_PARTITA = 25;

/** Con quanto si comincia, oltre ai risparmi della scheda. */
export const BONUS_PRIMA_PARTITA = 9000;

/**
 * Il seme.
 *
 * Scelto provando: con questo, entro i primi turni escono un Giorno di
 * Paga, una Opportunità comprabile e una Spesa Extra — cioè le tre cose
 * che la guida deve poter spiegare. Cambiarlo senza rigiocare la partita
 * significa spegnere metà delle spiegazioni senza accorgersene, ed è
 * quello che il test `prova-guida.mjs` sorveglia.
 */
export const SEME_PRIMA_PARTITA = 20260907;

export const MERCATO_PRIMA_PARTITA = "roma";
export const PROFESSIONE_PRIMA_PARTITA = "operatore";

/** Una prima partita pronta a cominciare. */
export function creaPrimaPartita({ nome } = {}) {
  const comeTiChiami = (nome || "").trim().slice(0, 18) || "Tu";
  const mercatoId = MERCATO_PRIMA_PARTITA;
  const pacchetto = getPacchetto(mercatoId);
  const prof = pacchetto.professioni.find((p) => p.id === PROFESSIONE_PRIMA_PARTITA)
    || pacchetto.professioni[pacchetto.professioni.length - 1];

  let s = creaStanza(codiceStanza(), "io", {
    seme: SEME_PRIMA_PARTITA,
    mercatoId,
    versioneDati: versioneCorrente(mercatoId),
    solitaria: true,
  });
  s = applicaAzione(s, {
    tipo: "entra", giocatoreId: "io", nome: comeTiChiami,
    professioneId: prof.id,
  }).stato;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "io" }).stato;
  s.giocatori[0].contanti += BONUS_PRIMA_PARTITA;
  return { stato: s, professione: prof };
}

/* ── Ricordarsi che è stata giocata ──────────────────────────
   Sul dispositivo, come tutto il resto che riguarda una persona sola:
   niente identificativi, niente server. */
const CHIAVE = "quotazero:primaPartita";

export function primaPartitaFatta() {
  try { return localStorage.getItem(CHIAVE) === "1"; } catch { return false; }
}

export function segnaPrimaPartita() {
  try { localStorage.setItem(CHIAVE, "1"); } catch { /* modalità privata */ }
}
