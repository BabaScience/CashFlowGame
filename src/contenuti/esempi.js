/**
 * GLI ESEMPI DELLE LEZIONI, CALCOLATI SUI DATI VERI.
 *
 * Sta in un file suo per rompere un anello: `lezioni.js` importa le sue
 * traduzioni, e le traduzioni hanno bisogno di questi stessi conti per
 * ricalcolare i propri numeri. Con gli aiuti dentro `lezioni.js` i due
 * moduli si importavano a vicenda, e chi arrivava secondo trovava l'altro
 * ancora vuoto.
 *
 * I numeri non si scrivono a mano da nessuna parte: si calcolano dal
 * pacchetto del mercato, che a Roma viene da quotazioni OMI, canoni
 * rilevati e tassi della BCE. Una lezione tradotta che citasse «1.000 €»
 * scritti a mano comincerebbe a mentire al primo aggiornamento dei prezzi.
 */
import { rataMutuo, zona } from "../game/mercati/roma/derivazione.js";
import { numero } from "../game/finanze.js";
import { CREDITO } from "../game/mercati/roma/fonti.js";

export const eur = (n) => `${numero(n)} €`;
export const pct = (n) => `${(n * 100).toFixed(1)}%`;

export function esempioRata() {
  const capitale = 160000;
  const rata = rataMutuo(capitale, CREDITO.taeg, CREDITO.anni);
  const totale = rata * CREDITO.anni * 12;
  return { capitale, rata, totale, interessi: totale - capitale };
}

export function esempioZone() {
  const centro = zona("centro");
  const periferia = zona("torbella");
  const resa = (z) => (z.canoneMq * 12) / z.euroMq;
  return { centro, periferia, resaCentro: resa(centro), resaPeriferia: resa(periferia) };
}
