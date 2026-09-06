/**
 * MERCATO "CLASSICO" — versione 2026.08
 *
 * ⚠️  QUESTO FILE NON SI MODIFICA.
 *
 * Un aggiornamento dei dati pubblica un file NUOVO (v2027.02.js e così via)
 * e lo registra in ../indice.js. Il motivo non è ordine formale: la stanza
 * salva gli indici già mescolati dei mazzi, e le partite vivono fino a 48
 * ore. Cambiare i numeri sotto una partita in corso significa distribuire
 * carte diverse da quelle che erano state mescolate, o andare fuori dai
 * limiti di un mazzo accorciato. Le stanze si ancorano a { mercatoId,
 * versioneDati } e rileggono sempre la versione con cui sono nate.
 *
 * Che cos'è "classico": l'economia di equilibrio con cui il gioco è stato
 * bilanciato e verificato. Non sono dati di una città vera, e non pretende
 * di esserlo — la valuta è astratta apposta. Serve da riferimento stabile
 * per il bilanciamento e da rete di sicurezza se un mercato reale dovesse
 * risultare ingiocabile.
 *
 * Il primo mercato vero sarà `roma`, su quotazioni OMI, fasce ISTAT e tassi
 * di Banca d'Italia, con la fonte annotata campo per campo.
 */
import { PROFESSIONI, ETICHETTE_SPESE, ETICHETTE_PASSIVITA, DEBITI_ESTINGUIBILI } from "./professioni.js";
import { MAZZI, PICCOLI_AFFARI, GRANDI_AFFARI, MERCATO, EXTRA, CATEGORIE } from "./mazzi.js";
import { AFFARI_LARGO, SOGNI } from "./largo.js";
import en from "./lingue/en.js";
import fr from "./lingue/fr.js";

export default Object.freeze({
  id: "classico",
  versione: "2026.08",
  nome: "Classico",
  luogo: null,                 // non è una città vera
  descrizione: "L'economia di equilibrio con cui il gioco è bilanciato.",

  /* Come si scrivono i soldi. Non è un dettaglio grafico: è la prima cosa
     che distingue un mercato dall'altro sullo schermo. */
  valuta: {
    simbolo: "$",
    posizione: "prefisso",     // prefisso | suffisso
    locale: "it-IT",
  },

  /* Quanta rendita mensile serve, oltre a quella d'ingresso, per vincere. */
  obiettivoRendita: 50000,

  /* Regola da gioco da tavolo: 100 di rata ogni 1.000 presi in prestito. */
  /* Una partita deve stare in una serata, e deve comunque finire. */
  turniMassimi: 700,

  tassoPrestito: 0.1,

  /* Nessun fisco: "classico" è un'economia di equilibrio, non un paese.
     Si gioca solo al Livello 1, e il selettore lo rispetta. */
  /* Il mercato classico resta all'1×: è l'impianto astratto da tavolo, e
     cambiarlo qui significherebbe cambiare il gioco che la gente conosce.
     La regola più severa vive su Roma, che è il mercato che promette di
     somigliare alla realtà. */
  margineUscita: 1,
  lingue: { en, fr },
  /* Come su Roma: raddoppiare la rendita con cui si è usciti. La vecchia
     cifra fissa aveva senso solo finché uscire moltiplicava tutto per
     cento. */
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

  fisco: null,

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

  /* Da dove vengono i numeri. Vuoto qui perché non vengono da nessuna parte:
     sono scelti a mano. Nei mercati veri ogni voce porta la sua fonte, ed è
     ciò che separa un gioco da uno strumento che una scuola può adottare. */
  fonti: {},
});
