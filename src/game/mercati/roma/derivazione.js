/**
 * COME NASCONO I NUMERI DI ROMA.
 *
 * Le carte non sono inventate: si calcolano dalle quotazioni per zona, dal
 * canone medio al metro quadro e dal tasso corrente dei mutui. Scritto così
 * per tre motivi.
 *
 * Primo, si può controllare. Chiunque sappia leggere una tabella può
 * risalire da una carta al prezzo al metro quadro da cui esce, ed è quello
 * che rende il gioco adottabile in una classe.
 *
 * Secondo, aggiornare Roma diventa cambiare una tabella, non riscrivere
 * cento carte a mano.
 *
 * Terzo, e più importante: le PROPORZIONI restano vere. Il Centro Storico
 * rende il 3,4% lordo e Tor Bella Monaca il 9,8%. Nessuno lo inventerebbe,
 * eppure è il cuore di ciò che il gioco dovrebbe insegnare — che prestigio
 * e rendimento tirano in direzioni opposte, e che l'affare bello da
 * raccontare spesso è quello che rende meno.
 */
import { ZONE, CREDITO, COSTI_ACQUISTO } from "./fonti.js";

export const zona = (id) => ZONE.find((z) => z.id === id);

/** Rata mensile di un mutuo alla francese. */
export function rataMutuo(capitale, taeg = CREDITO.taeg, anni = CREDITO.anni) {
  const r = taeg / 12;
  const n = anni * 12;
  return capitale * r / (1 - Math.pow(1 + r, -n));
}

/**
 * Quota del canone che se ne va in imposte e spese, al Livello 1.
 *
 * Il Livello 1 semplifica di proposito: una sola trattenuta al posto di
 * cedolare secca, IMU, condominio, manutenzione e sfitto. Non è una
 * scorciatoia, è didattica — prima si impara che un affitto non è tutto
 * tuo, poi si impara perché. Il Livello 2 aprirà ciascuna voce.
 */
export const QUOTA_COSTI_L1 = 0.28;

const arrotonda = (n, passo = 500) => Math.round(n / passo) * passo;

/**
 * Un immobile in affitto a Roma.
 * Restituisce la carta pronta: costo, acconto, mutuo e flusso mensile.
 */
export function immobile({ zonaId, mq, nome, testo, categoria, sconto = 0, ltv = CREDITO.ltvMax }) {
  const z = zona(zonaId);
  const prezzoPieno = z.euroMq * mq;
  const costo = arrotonda(prezzoPieno * (1 - sconto), 1000);

  const mutuo = arrotonda(costo * ltv, 1000);
  /* L'acconto vero non è solo la differenza: si pagano anche imposta di
     registro, notaio e agenzia, e sono soldi che non tornano. Ignorarli è
     il singolo errore più comune di chi compra la prima volta. */
  const spese = costo * COSTI_ACQUISTO.registroSeconda * 0.6   // sul valore catastale, più basso
              + COSTI_ACQUISTO.notaio
              + costo * COSTI_ACQUISTO.agenzia;
  const acconto = arrotonda(costo - mutuo + spese, 500);

  const canone = z.canoneMq * mq;
  const flusso = Math.round(canone * (1 - QUOTA_COSTI_L1) - rataMutuo(mutuo));

  return {
    tipo: "immobile",
    categoria,
    nome: nome || `${mq} m² a ${z.nome}`,
    zona: z.nome,
    mq,
    costo,
    acconto,
    mutuo,
    flusso,
    /* Gli ingredienti, non solo il risultato: il Livello 2 apre la
       trattenuta unica nelle sue voci vere, e per farlo gli servono il
       canone lordo e la rata separati. */
    canone: Math.round(canone),
    rata: Math.round(rataMutuo(mutuo)),
    testo,
    /* Tenuti per il pannello didattico e per i test. */
    rendimentoLordo: Number(((canone * 12) / costo * 100).toFixed(1)),
  };
}

/** Un'attività: nessun mutuo, si compra una quota e rende. */
export function attivita({ nome, costo, acconto, flusso, testo, categoria = "attivita" }) {
  return {
    tipo: "attivita",
    categoria,
    nome,
    costo,
    acconto,
    passivita: costo - acconto,
    flusso,
    testo,
  };
}

/**
 * Completa una carta immobiliare scritta a mano.
 *
 * Le carte derivate dalle zone portano già canone e rata; quelle scritte a
 * mano — box auto, posti auto — portavano solo il flusso, e al Livello 2
 * risultavano quindi **esenti da imposte**. Un box si affitta e l'affitto si
 * tassa come qualunque altro: l'esenzione era un difetto, non una scelta.
 *
 * Il canone si ricava all'indietro dal flusso dichiarato, così il Livello 1
 * resta identico a prima e il Livello 2 diventa finalmente vero.
 */
export function conCanone(carta) {
  if (carta.canone || !carta.flusso) return carta;
  const rata = Math.round(rataMutuo(carta.mutuo || 0));
  const canone = Math.round((carta.flusso + rata) / (1 - QUOTA_COSTI_L1));
  return { ...carta, canone, rata };
}
