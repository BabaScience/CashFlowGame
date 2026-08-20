/**
 * IL PUNTEGGIO CHE RESTA — una valutazione che si muove.
 *
 * Un numero visibile che sale e scende è la cosa che tiene una persona
 * attaccata a un gioco per anni. Chess.com non ha inventato niente di
 * complicato: ha mostrato un numero, e quel numero significava qualcosa.
 *
 * Il problema di solito è a che cosa agganciarlo. Un punteggio grezzo
 * premia la giornata fortunata; una classifica richiede di conservare
 * l'identità di qualcuno, e l'informativa promette il contrario.
 *
 * Qui c'è una scorciatoia che nasce dal fatto che il mazzo della sfida è
 * deterministico: **si può far giocare un riferimento sulla stessa identica
 * partita**. Non un avversario inventato, non una curva stimata a tavolino:
 * lo stesso mazzo, le stesse carte, le stesse spese. Il tuo punteggio
 * contro il suo dice quanto hai scelto meglio o peggio di un giocatore
 * ragionevole, e nient'altro.
 *
 * Ne segue tutto il resto: la valutazione vive sul dispositivo, non serve
 * nessun server, non si conserva nessun identificativo, e il numero è
 * confrontabile fra giorni diversi anche se un giorno era più difficile.
 */
import { applicaAzione } from "./motore.js";
import { creaSfida, punteggio, TURNI_SFIDA } from "./sfida.js";
import { fuoriDallaCorsa } from "./finanze.js";

/** Da dove si parte. Scelto sotto il riferimento: salire è più bello. */
export const VALUTAZIONE_INIZIALE = 800;

/**
 * Quanto "vale" il riferimento.
 *
 * È l'ancora di tutto il sistema, e sbagliarla rompe la valutazione in
 * silenzio: con un'ancora troppo alta chiunque sale sempre, anche chi gioca
 * male, e il numero smette di dire qualcosa. Fissarlo a 1000 significa che
 * chi pareggia col riferimento tende verso 1000, chi lo batte va sopra, e
 * chi non ci arriva scende. Che è l'unica cosa che un punteggio deve fare.
 */
export const VALUTAZIONE_RIFERIMENTO = 1000;

/** Quanto si muove al massimo in una giornata. */
const PASSO = 32;

/**
 * Il riferimento.
 *
 * Deliberatamente ragionevole, non ottimo: compra ciò che rende almeno
 * l'uno per cento al mese sull'anticipo, sceglie i Grandi Affari quando ha
 * di che pagarli, non si indebita e non dona. È il giocatore che chiunque
 * può essere dopo qualche partita. Batterlo deve voler dire qualcosa, e
 * perdere contro di lui non deve essere umiliante.
 */
function riferimento(giorno, mercatoId) {
  let s = creaSfida({ giorno, mercatoId }).stato;
  let n = 0;
  while (s.fase === "inCorso" && s.numeroTurno <= TURNI_SFIDA && n < 6000) {
    const p = s.pending;
    const g = s.giocatori[0];
    let az;
    if (p) {
      const id = p.giocatoreId;
      if (p.tipo === "mercato") az = { tipo: "chiudiMercato", giocatoreId: g.id };
      else if (p.tipo === "sceltaTaglia") {
        az = { tipo: "scegliTaglia", giocatoreId: id, taglia: g.contanti > 25000 ? "grandi" : "piccoli" };
      } else if (p.tipo === "carta") {
        const c = p.carta;
        const resa = c.acconto > 0 ? c.flusso / c.acconto : 0;
        az = (c.flusso > 0 && g.contanti >= c.acconto && resa >= 0.01)
          ? { tipo: "compraCarta", giocatoreId: id }
          : { tipo: "passaCarta", giocatoreId: id };
      }
      else if (p.tipo === "bancarotta") az = { tipo: "concludiBancarotta", giocatoreId: id };
      else if (p.tipo === "beneficenza") az = { tipo: "beneficenza", giocatoreId: id, accetta: false };
      else if (p.tipo === "beneficenzaVeloce") az = { tipo: "beneficenzaVeloce", giocatoreId: id, accetta: false };
      else if (p.tipo === "sogno") az = { tipo: "passaSogno", giocatoreId: id };
      else if (p.tipo === "affareVeloce") {
        az = g.contanti >= p.affare.acconto
          ? { tipo: "compraAffareVeloce", giocatoreId: id }
          : { tipo: "passaAffareVeloce", giocatoreId: id };
      }
      else az = {
        tipo: { extra: "confermaExtra", figlio: "confermaFiglio", licenziamento: "confermaLicenziamento", penalitaVeloce: "confermaPenalita" }[p.tipo],
        giocatoreId: id,
      };
    } else if (g.tracciato === "topi" && fuoriDallaCorsa(g)) {
      az = { tipo: "esciDallaCorsa", giocatoreId: g.id };
    } else az = { tipo: "tira", giocatoreId: g.id, nDadi: 2 };

    const r = applicaAzione(s, az);
    if (r.errore) break;
    s = r.stato;
    n++;
  }
  return punteggio(s);
}

/* Il riferimento di un giorno non cambia mai: si calcola una volta sola. */
const cache = new Map();

/** Quanto ha fatto il riferimento nella sfida di quel giorno. */
export function riferimentoDelGiorno(giorno, mercatoId = "roma") {
  const chiave = `${giorno}:${mercatoId}`;
  if (!cache.has(chiave)) cache.set(chiave, riferimento(giorno, mercatoId));
  return cache.get(chiave);
}

/**
 * Quanto ti sei comportato bene, da 0 a 1, contro il riferimento.
 *
 * Non è una proporzione secca: pareggiare col riferimento vale 0,5, farne
 * il doppio vale circa 0,75, e non arrivarci non azzera mai del tutto. Una
 * giornata storta deve costare, non cancellare.
 */
export function esitoControRiferimento(tuo, suo) {
  const base = Math.max(suo, 5);
  const rapporto = tuo / base;
  return rapporto / (rapporto + 1);
}

/**
 * La nuova valutazione dopo una sfida.
 * Aggiornamento in stile Elo: quanto ti muovi dipende da quanto il
 * risultato era inatteso.
 */
export function nuovaValutazione(valutazione, tuo, suo) {
  const esito = esitoControRiferimento(tuo, suo);
  /* Attesa alla Elo contro un avversario di forza nota: più sei in alto,
     più ci si aspetta che tu batta il riferimento, e meno rende batterlo. */
  const atteso = 1 / (1 + Math.pow(10, (VALUTAZIONE_RIFERIMENTO - valutazione) / 400));
  return Math.max(100, Math.round(valutazione + PASSO * (esito - atteso)));
}

/** Fasce leggibili: un numero da solo non dice niente a chi comincia. */
export function fasciaValutazione(v) {
  if (v >= 1600) return { nome: "Rendita", emoji: "🌊" };
  if (v >= 1300) return { nome: "Investitore", emoji: "📈" };
  if (v >= 1050) return { nome: "Risparmiatore", emoji: "🪙" };
  if (v >= 850) return { nome: "Apprendista", emoji: "🌱" };
  return { nome: "Quota zero", emoji: "⚓" };
}

/* ── memoria locale ── */

const CHIAVE = "quotazero:valutazione";

const leggi = () => {
  try { return JSON.parse(localStorage.getItem(CHIAVE) || "null"); } catch { return null; }
};

export function valutazioneCorrente() {
  const d = leggi();
  return d?.valutazione ?? VALUTAZIONE_INIZIALE;
}

export function storicoValutazione() {
  const d = leggi();
  return {
    valutazione: d?.valutazione ?? VALUTAZIONE_INIZIALE,
    massimo: d?.massimo ?? VALUTAZIONE_INIZIALE,
    partite: d?.partite ?? 0,
    ultimaVariazione: d?.ultimaVariazione ?? 0,
  };
}

/** Registra una sfida e restituisce come si è mossa la valutazione. */
export function registraValutazione(tuo, suo) {
  const prima = valutazioneCorrente();
  const dopo = nuovaValutazione(prima, tuo, suo);
  const d = leggi() || {};
  const nuovo = {
    valutazione: dopo,
    massimo: Math.max(d.massimo ?? VALUTAZIONE_INIZIALE, dopo),
    partite: (d.partite ?? 0) + 1,
    ultimaVariazione: dopo - prima,
  };
  try { localStorage.setItem(CHIAVE, JSON.stringify(nuovo)); } catch { /* modalità privata */ }
  return { prima, dopo, variazione: dopo - prima, ...nuovo };
}
