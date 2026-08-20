/**
 * MERCATO "ROMA" — versione 2026.08
 *
 * ⚠️  QUESTO FILE NON SI MODIFICA.
 * Un aggiornamento dei dati pubblica roma/v2027.02.js e lo registra in
 * ../indice.js. Le stanze si ancorano a { mercatoId, versioneDati } e
 * rileggono sempre la propria versione: vedi la spiegazione nel registro.
 *
 * Che cosa rende questo pacchetto diverso da un gioco qualsiasi: i prezzi
 * degli immobili non sono inventati, si calcolano dalle quotazioni per zona
 * dell'Osservatorio del Mercato Immobiliare, i canoni dai rilevamenti sul
 * comune di Roma, le rate dal TAEG medio di Banca d'Italia, gli stipendi
 * dalle fasce del Salary Outlook riportate al netto. Ogni fonte è in
 * fonti.js, con la data.
 *
 * La conseguenza più interessante non l'ha decisa nessuno: con i numeri
 * veri, un appartamento in Centro Storico comprato con l'80% di mutuo perde
 * più di mille euro al mese, mentre un bilocale a Tor Bella Monaca ne rende
 * poco più di cento. Prestigio e rendimento tirano in direzioni opposte, e
 * questo pacchetto lo mette in mano a chi gioca invece di raccontarglielo.
 *
 * LIVELLO 1 — semplificazione dichiarata.
 * Le imposte sugli affitti (cedolare secca), l'IMU, il condominio, la
 * manutenzione e lo sfitto sono compresi in un'unica trattenuta del 28% sul
 * canone. Il Livello 2 aprirà ogni voce. Prima si impara che un affitto non
 * è tutto tuo, poi si impara perché.
 */
import { PROFESSIONI, ETICHETTE_SPESE, ETICHETTE_PASSIVITA, DEBITI_ESTINGUIBILI } from "./professioni.js";
import { MAZZI, PICCOLI_AFFARI, GRANDI_AFFARI, MERCATO, EXTRA, CATEGORIE } from "./mazzi.js";
import { AFFARI_LARGO, SOGNI } from "./largo.js";
import { FONTI } from "./fonti.js";

export default Object.freeze({
  id: "roma",
  versione: "2026.08",
  nome: "Roma",
  luogo: "Roma, Italia",
  descrizione: "Prezzi, canoni, stipendi e tassi reali della capitale.",

  valuta: { simbolo: "€", posizione: "suffisso", locale: "it-IT" },

  /* Rendita mensile da aggiungere a quella d'uscita per vincere.
     Cinquemila euro al mese di rendita, a Roma, sono l'indipendenza vera:
     non una fortuna astratta, una cifra che una persona riconosce. */
  obiettivoRendita: 5000,

  /* Un fido bancario italiano, non una regola da tabellone: circa il 14%
     annuo, che è quanto costa davvero il credito al consumo non garantito. */
  /* Una partita deve stare in una serata, e deve comunque finire. */
  turniMassimi: 400,

  tassoPrestito: 0.012,

  /* I parametri del Livello 2. Al Livello 1 conta solo `quotaCostiL1`,
     che li riassume tutti in una trattenuta sola. */
  fisco: {
    quotaCostiL1: 0.28,
    cedolare: 0.21,             // aliquota ordinaria
    cedolareConcordata: 0.10,   // canone concordato
    scontoConcordato: 0.85,     // il concordato sta sotto il libero
    imuAnnuaSuValore: 0.0075,   // stima sulla seconda casa
    quotaCondominio: 0.08,
    quotaManutenzione: 0.05,
    quotaSfitto: 0.05,
  },

  professioni: PROFESSIONI,
  etichetteSpese: ETICHETTE_SPESE,
  etichettePassivita: ETICHETTE_PASSIVITA,
  debitiEstinguibili: DEBITI_ESTINGUIBILI,

  mazzi: MAZZI,
  categorie: CATEGORIE,
  conteggi: {
    piccoli: PICCOLI_AFFARI.length,
    grandi: GRANDI_AFFARI.length,
    mercato: MERCATO.length,
    extra: EXTRA.length,
  },

  affariLargo: AFFARI_LARGO,
  sogni: SOGNI,
  fonti: FONTI,
});
