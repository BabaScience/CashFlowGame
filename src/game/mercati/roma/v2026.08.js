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
import { FONTI, CREDITO_CONSUMO, COSTI_VENDITA } from "./fonti.js";
import en from "./lingue/en.js";
import fr from "./lingue/fr.js";

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
  turniMassimi: 700,

  tassoPrestito: 0.012,

  /* I parametri del Livello 2. Al Livello 1 conta solo `quotaCostiL1`,
     che li riassume tutti in una trattenuta sola. */
  /* Quanto reddito passivo serve per uscire, in multipli delle spese.
     A 1× si esce nel mese in cui i conti pareggiano, senza margine: basta
     una rata nuova o un mese di sfitto per tornare dentro.
     Perché una volta e mezza e non due. Il doppio l'abbiamo provato, con
     tredici professioni e i redditi veri di una persona sola: la soglia
     scappa più in fretta di quanto la rendita cresca, perché ogni spesa
     nuova — un figlio, un prestito forzato — al 2× alza il traguardo del
     doppio. Le due professioni più povere non uscivano quasi mai.
     A 1,5× esce chiunque (minimo 17%), le vittorie vere restano al 74% e
     la mediana sta a 101 turni. È il margine più alto che questo mercato
     regge con un reddito solo. */
  margineUscita: 1.5,

  /* L'obiettivo del Largo, in multipli della rendita che avevi il giorno in
     cui hai lasciato il lavoro: raddoppiarla.
     Prima era una cifra fissa (5.000 € al mese) che aveva senso solo nella
     vecchia economia, dove uscire moltiplicava tutto per cento. Con la
     continuità quella cifra è diventata irraggiungibile per chi esce da
     1.739 €: servirebbero 240.000 € di capitale. Un multiplo invece scala
     da solo — chi esce piccolo ha un traguardo piccolo, e la domanda resta
     la stessa per tutti: sai raddoppiare quello che ti sei costruito? */
  obiettivoLargo: 1.5,

  /**
   * IL SECONDO TEMPO È SPENTO.
   *
   * Il Largo esiste ancora — tabellone, venti affari, sogni, penalità — ma
   * non ci si arriva più. La misura, su trenta partite a tre giocatori:
   *
   *   · due partite su trenta si vincevano davvero al Largo; le altre
   *     ventotto finivano perché scadevano i turni;
   *   · tutti e cinquantadue i giocatori che uscivano dalla Ruota ci
   *     arrivavano con MENO soldi al mese di prima (4.049 € → 1.449 €):
   *     il premio per aver vinto il primo tempo era una riduzione di
   *     stipendio;
   *   · ci si arrivava con 6.904 € in mano e l'affare più economico ne
   *     chiedeva 25.000 di acconto, per una mediana di quaranta turni
   *     prima di poterne comprare uno;
   *   · in tutto, 0,85 affari a testa. La maggior parte non ne comprava
   *     nessuno.
   *
   * Non era un finale: era una pista di rullaggio che finiva prima del
   * decollo. Uscire dalla Ruota diventa la vittoria — che è poi la cosa
   * che dà il nome al gioco — e il Largo resta qui, spento, per quando
   * varrà la pena giocarlo.
   *
   * Per riaccenderlo basta questa riga.
   */
  secondoTempo: false,
  creditoConsumo: CREDITO_CONSUMO,
  costiVendita: COSTI_VENDITA,
  /* I contenuti tradotti. I numeri non si traducono: un mercato resta il
     suo mercato, in euro, anche letto in inglese o in francese. */
  lingue: { en, fr },

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
