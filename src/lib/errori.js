import { traduci } from "../i18n/index.js";

/**
 * DA ERRORE DEL SERVER A FRASE CHE SI CAPISCE.
 *
 * ═══ IL DIFETTO ═══
 *
 * Il server e il motore rifiutano una mossa con una frase italiana, e
 * quella frase finiva a schermo così com'era. Chi giocava in francese
 * leggeva l'interfaccia in francese e gli errori in italiano — e non erano
 * pochi: cinquantacinque rifiuti del motore e una ventina del server, cioè
 * tutta la parte del gioco che ti dice perché non puoi fare una cosa.
 *
 * Non l'ha visto nessuno perché il controllo sulle lingue disegna le
 * schermate con dati finti e uno stato sano: negli stati sani non ci sono
 * errori. La strada che porta un errore a schermo non passava di lì.
 *
 * ═══ LA CURA ═══
 *
 * Il server non conosce la lingua di chi gioca — la stessa stanza la
 * guardano in tre lingue diverse — quindi manda due cose: la frase italiana
 * e la chiave con cui tradurla. Il browser, che la lingua la sa, sceglie.
 *
 * La frase italiana resta come ripiego. Una chiave che manca deve dare un
 * messaggio in italiano, non una schermata muta né il nome della chiave:
 * l'errore che si vede è già un brutto momento, e non è quello giusto per
 * scoprire un secondo difetto.
 */
export function testoErrore(lingua, x) {
  const chiave = x?.chiaveErrore;
  const ripiego = x?.errore || x?.message || "";
  if (!chiave) return ripiego;
  /* Qualche rifiuto porta un numero dentro — il tetto del credito, quanti
     giocatori ci stanno — e quel numero lo sa solo chi ha rifiutato. */
  const tradotto = traduci(lingua, chiave, x?.valoriErrore || undefined);
  /* `traduci` restituisce la chiave quando non la trova: in quel caso la
     frase italiana dice molto di più di "errori.nonEIlTuoTurno". */
  return !tradotto || tradotto === chiave ? ripiego : tradotto;
}
