/**
 * IL TEMPO DI GIOCO.
 *
 * ═══ QUANTO DURA UN TURNO ═══
 *
 * Un mese. Non è una convenzione scelta a tavolino: il gioco paga stipendi
 * mensili, rate mensili, flussi mensili, e il Giorno di Paga è il momento in
 * cui quel mese si chiude. Contare i Giorni di Paga incassati è quindi
 * l'unica misura del tempo che il gioco già possedeva senza saperlo.
 *
 * ═══ PERCHÉ IL TEMPO SI CONTA PER GIOCATORE ═══
 *
 * Ognuno ha il suo. Chi tira alto attraversa più Giorni di Paga e vive più
 * mesi nello stesso numero di turni: incassa di più, ma invecchia prima. È
 * scomodo — due persone allo stesso tavolo possono trovarsi in anni diversi
 * — ed è però l'unica versione onesta. La domanda a cui il numero risponde
 * non è "da quanto stiamo giocando" ma **"quanti mesi ho lavorato per
 * arrivare qui"**, e quella è una domanda personale.
 *
 * È anche l'unico modo per cui il confronto finale significhi qualcosa: se
 * Ada esce in 3 anni e 2 mesi e Bo in 5 anni e 8 mesi, quei numeri si
 * possono mettere uno accanto all'altro.
 *
 * ═══ PERCHÉ ESISTE ═══
 *
 * Il numero di turni non dice niente a nessuno. "Quattro anni e due mesi"
 * dice tutto: è il costo della libertà pagato nella valuta in cui lo si
 * paga davvero, che non sono i soldi ma il tempo della propria vita.
 */

export const MESI_ANNO = 12;

/** Anno e mese correnti, contati da 1: il primo Giorno di Paga è "mese 1". */
export function orologio(mesi) {
  const n = Math.max(1, Math.round(mesi || 0) || 1);
  return {
    anno: Math.floor((n - 1) / MESI_ANNO) + 1,
    mese: ((n - 1) % MESI_ANNO) + 1,
  };
}

/**
 * Il tempo trascorso, a parole: "3 anni e 2 mesi".
 * Vuole la funzione di traduzione, perché il plurale non è uguale ovunque.
 */
export function durata(mesi, t) {
  const n = Math.max(0, Math.round(mesi || 0));
  const anni = Math.floor(n / MESI_ANNO);
  const resto = n % MESI_ANNO;
  const pAnni = anni ? t(anni === 1 ? "tempo.anno" : "tempo.anni", { n: anni }) : "";
  const pMesi = resto ? t(resto === 1 ? "tempo.mese" : "tempo.mesi", { n: resto }) : "";
  if (anni && resto) return t("tempo.anniEMesi", { anni: pAnni, mesi: pMesi });
  /* Zero mesi esiste solo prima della prima paga, e va detto lo stesso:
     un trattino lascerebbe credere a un dato mancante. */
  return pAnni || pMesi || t("tempo.mesi", { n: 0 });
}
