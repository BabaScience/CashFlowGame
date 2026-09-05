/**
 * L'ARENA: appaiamento e valutazione fra persone.
 *
 * Qui dentro non c'è niente che parli con un database o con la rete. Sono
 * funzioni pure, come il motore, per la stessa ragione: la valutazione è
 * la cosa che la gente guarda per mesi, e una cosa che si guarda per mesi
 * deve poter essere verificata da un test in mezzo secondo.
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * Fino a ieri per giocare con qualcuno bisognava conoscerlo: si crea una
 * stanza, si manda un codice di quattro lettere, si aspetta. Va benissimo
 * fra amici e non porta da nessuna parte: nessuno apre un gioco per
 * scoprire che non c'è nessuno dall'altra parte.
 *
 * Il pezzo che manca è quello che chess.com fa in tre secondi: premi
 * Gioca, e stai giocando. Il resto — la classifica, la rivincita, il
 * profilo — sta in piedi solo se prima esiste quello.
 */

/** Valutazione di partenza di chi non ha mai giocato contro nessuno. */
export const VALUTAZIONE_ARENA_INIZIALE = 1000;

/**
 * Quanto si muove al massimo una valutazione in una partita.
 *
 * Ventiquattro è il compromesso solito: abbastanza perché la prima decina
 * di partite ti porti dove sei davvero, abbastanza poco perché una serata
 * storta non cancelli un mese. Sotto le dieci partite si usa un passo
 * doppio, così chi comincia arriva in fretta al proprio livello invece di
 * passare due settimane a scalare da 1000.
 */
export const PASSO_ARENA = 24;
export const PASSO_ESORDIENTE = 48;
export const PARTITE_DA_ESORDIENTE = 10;

export const passoDi = (partite) =>
  (partite || 0) < PARTITE_DA_ESORDIENTE ? PASSO_ESORDIENTE : PASSO_ARENA;

/** La probabilità che A batta B, secondo la formula di sempre. */
export const attesa = (a, b) => 1 / (1 + Math.pow(10, (b - a) / 400));

/**
 * Le valutazioni nuove dopo una partita a più giocatori.
 *
 * L'Elo nasce per due persone. Con più di due la si applica a ogni coppia:
 * chi è arrivato davanti a te ti batte, chi è arrivato dietro perde con te,
 * e la somma si divide per il numero di avversari. Non è un'invenzione —
 * è il modo standard di estendere l'Elo a una classifica — ed è l'unico
 * che si comporta bene quando i giocatori sono tre o sei invece di due.
 *
 * `esito` è la classifica finale: `[{ id, valutazione, partite, posizione }]`
 * con `posizione` a partire da 1 e pari merito ammessi.
 *
 * Restituisce `[{ id, prima, dopo, variazione }]`.
 */
export function valutazioniDopo(esito) {
  const n = esito.length;
  if (n < 2) return esito.map((g) => ({ id: g.id, prima: g.valutazione, dopo: g.valutazione, variazione: 0 }));

  return esito.map((g) => {
    let punti = 0, previsti = 0;
    for (const altro of esito) {
      if (altro.id === g.id) continue;
      /* Pari merito vale mezzo punto, come una patta. */
      punti += g.posizione < altro.posizione ? 1 : g.posizione > altro.posizione ? 0 : 0.5;
      previsti += attesa(g.valutazione, altro.valutazione);
    }
    const passo = passoDi(g.partite);
    const variazione = Math.round((passo * (punti - previsti)) / (n - 1));
    return {
      id: g.id,
      prima: g.valutazione,
      dopo: Math.max(100, g.valutazione + variazione),
      variazione,
    };
  });
}

/**
 * Una partita conta per la classifica?
 *
 * Due condizioni, e vengono dal buon senso più che dalla teoria.
 *
 * Serve **più di una persona vera**: una vittoria contro il computer non
 * dice niente di come giochi contro qualcuno, e se contasse la classifica
 * la vincerebbe chi ha più pazienza di battere un bot.
 *
 * E serve che la partita sia **finita davvero**. Chi sta perdendo non deve
 * poter chiudere la scheda per non prendersi la sconfitta: se la stanza
 * scade a metà, non è successo niente.
 */
export function partitaValida(stato) {
  if (!stato || stato.fase !== "finita") return false;
  const umani = stato.giocatori.filter((g) => !g.bot);
  return umani.length >= 2;
}

/**
 * La classifica finale di una partita, dal migliore al peggiore.
 *
 * Il vincitore è primo per definizione. Gli altri si ordinano come già fa
 * il motore quando scade il tempo: per quanto ciascuno si è avvicinato al
 * proprio traguardo. Chi è fallito sta in fondo, sempre.
 */
export function ordineFinale(stato, progressoDi) {
  const righe = stato.giocatori
    .filter((g) => !g.bot)
    .map((g) => ({
      id: g.id,
      nome: g.nome,
      vincitore: g.id === stato.vincitore,
      eliminato: Boolean(g.eliminato),
      progresso: progressoDi(g),
    }));

  righe.sort((a, b) => {
    if (a.vincitore !== b.vincitore) return a.vincitore ? -1 : 1;
    if (a.eliminato !== b.eliminato) return a.eliminato ? 1 : -1;
    return b.progresso - a.progresso;
  });

  let posizione = 0;
  let precedente = null;
  return righe.map((r, i) => {
    /* Pari merito solo fra chi non ha vinto e ha lo stesso progresso al
       punto percentuale: al di sotto sono differenze che nessuno vede. */
    const chiave = r.vincitore ? "v" : `${r.eliminato}:${Math.round(r.progresso * 100)}`;
    if (chiave !== precedente) posizione = i + 1;
    precedente = chiave;
    return { ...r, posizione };
  });
}

/**
 * Il formato di una stanza, normalizzato.
 *
 * Sta qui e non nel motore perché lo usano anche la coda e l'interfaccia,
 * e perché il valore sbagliato deve diventare quello lungo invece di
 * rompere una partita.
 */
export const FORMATI = ["lampo", "lunga"];
export const formatoValido = (f) => (FORMATI.includes(f) ? f : "lunga");

/**
 * La chiave della coda.
 *
 * Due persone si possono appaiare solo se giocano allo stesso gioco: stesso
 * mercato, stesso formato, stesso livello di realismo. Sono tre cose che
 * cambiano i numeri, e appaiare due persone che vedono numeri diversi non
 * è una partita, è un malinteso.
 */
export const chiaveCoda = ({ mercatoId, formato, livello }) =>
  `${mercatoId || "roma"}|${formatoValido(formato)}|${Number(livello) || 1}`;
