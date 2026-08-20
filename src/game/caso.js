/**
 * CASO — generatore pseudocasuale deterministico.
 *
 * Il motore gira su funzioni serverless: fra un'azione e l'altra lo stato
 * viene scritto su MongoDB e riletto da zero. Un generatore con memoria
 * interna sarebbe quindi inutilizzabile. Qui il caso è ricostruibile da due
 * soli campi salvati nello stato:
 *
 *   seme  -> scelto una volta alla creazione della stanza
 *   passi -> quante estrazioni sono già avvenute
 *
 * L'n-esima estrazione è una funzione pura di (seme, n): non serve
 * "riavvolgere" il generatore, si calcola direttamente. Costo costante.
 *
 * A cosa serve, concretamente:
 *  - la sfida del giorno: stesso seme per tutti, stessa partita per tutti;
 *  - i test di bilanciamento: due esecuzioni danno lo stesso risultato,
 *    quindi una differenza è colpa dei dati, non della fortuna;
 *  - i bug: un seme identifica la partita e la rende riproducibile.
 */

/** Mescolamento a 32 bit di due interi (variante di splitmix32). */
function mescolaBit(a, b) {
  let t = (a ^ Math.imul(b ^ (b >>> 15), 0x2c1b3c6d)) >>> 0;
  t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
  t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
  return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
}

/** Un seme casuale, per le partite normali. */
export const semeCasuale = () => (Math.random() * 4294967296) >>> 0;

/**
 * Estrazione successiva in [0, 1).
 * Muta `s.passi`: è l'unico effetto collaterale, ed è voluto.
 */
export function caso(s) {
  const n = s.passi | 0;
  s.passi = n + 1;
  return mescolaBit(s.seme >>> 0, n);
}

/** Intero in [0, n). */
export const casoIntero = (s, n) => Math.floor(caso(s) * n);

/** Una faccia di dado, 1-6. */
export const dado = (s) => 1 + casoIntero(s, 6);

/** Identificativo breve e irripetibile all'interno della partita. */
export const idBreve = (s) =>
  (casoIntero(s, 0xffffff).toString(36) + casoIntero(s, 0xffffff).toString(36)).slice(0, 8);

/** Gli indici 0..n-1 in ordine sparso (Fisher-Yates). */
export function mescola(s, n) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = casoIntero(s, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
