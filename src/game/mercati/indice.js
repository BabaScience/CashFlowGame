/**
 * REGISTRO DEI MERCATI
 *
 * Un mercato è una città (o un'economia) con i suoi prezzi, stipendi, tassi
 * e imposte. Una partita ne sceglie uno alla creazione della stanza e ci
 * resta per tutta la durata: mescolare mercati allo stesso tavolo romperebbe
 * l'economia e cancellerebbe il confronto, che è la cosa interessante.
 *
 * OGNI VERSIONE È UN FILE, E I FILE NON SI MODIFICANO.
 * La stanza salva { mercatoId, versioneDati } e rilegge sempre quella. Se
 * domani i prezzi di Roma cambiano, nasce roma/v2027.02.js: le partite in
 * corso continuano con i numeri con cui erano nate, quelle nuove partono
 * con i nuovi. Senza questo, un aggiornamento a metà partita distribuirebbe
 * carte diverse da quelle mescolate — le stanze salvano gli indici dei mazzi
 * già rimescolati, e vivono fino a 48 ore.
 *
 * Aggiungere un mercato: creare la cartella, scrivere il file di versione,
 * registrarlo qui, far passare `npm run test:bilancia`.
 */
import classico202608 from "./classico/v2026.08.js";

/** Ogni versione mai pubblicata, per chiave "id:versione". */
const REGISTRO = new Map([
  ["classico:2026.08", classico202608],
]);

/** L'ultima versione di ogni mercato: è quella che prendono le partite nuove. */
const CORRENTI = new Map([
  ["classico", "2026.08"],
]);

/** Il mercato di partenza, finché non se ne sceglie un altro. */
export const MERCATO_PREDEFINITO = "classico";

/** I mercati offerti a chi crea una stanza. */
export const MERCATI = [...CORRENTI.entries()].map(([id, versione]) => {
  const p = REGISTRO.get(`${id}:${versione}`);
  return {
    id,
    versione,
    nome: p.nome,
    luogo: p.luogo,
    descrizione: p.descrizione,
    valuta: p.valuta,
  };
});

/** La versione corrente di un mercato. */
export const versioneCorrente = (mercatoId) =>
  CORRENTI.get(mercatoId) || CORRENTI.get(MERCATO_PREDEFINITO);

/**
 * Il pacchetto di una stanza.
 *
 * Il ripiego non è pigrizia: se una stanza vecchia punta a una versione
 * ritirata, è molto meglio che la partita continui con dati vicini piuttosto
 * che esplodere in faccia a chi sta giocando. Chi indaga lo vede nei log.
 */
export function getPacchetto(mercatoId, versione) {
  const id = mercatoId || MERCATO_PREDEFINITO;
  const v = versione || versioneCorrente(id);

  const esatto = REGISTRO.get(`${id}:${v}`);
  if (esatto) return esatto;

  const corrente = REGISTRO.get(`${id}:${versioneCorrente(id)}`);
  if (corrente) {
    console.warn(`mercato ${id}:${v} non trovato, uso ${id}:${versioneCorrente(id)}`);
    return corrente;
  }

  console.warn(`mercato ${id} sconosciuto, uso ${MERCATO_PREDEFINITO}`);
  return REGISTRO.get(`${MERCATO_PREDEFINITO}:${versioneCorrente(MERCATO_PREDEFINITO)}`);
}

/** Il pacchetto di uno stato di partita. */
export const pacchettoDi = (stato) => getPacchetto(stato?.mercatoId, stato?.versioneDati);

/** Vero se quella coppia esiste davvero. Serve ai test. */
export const esiste = (mercatoId, versione) => REGISTRO.has(`${mercatoId}:${versione}`);

/** Tutte le versioni registrate, per i controlli. */
export const tutteLeVersioni = () => [...REGISTRO.keys()];
