/**
 * LE LEZIONI.
 *
 * ═══ IL LIMITE, PRIMA DI TUTTO ═══
 *
 * In Italia la consulenza in materia di investimenti è attività riservata:
 * serve l'iscrizione all'albo tenuto dall'OCF, e farla senza è un reato
 * (art. 166 TUF). Il confine non è sfumato, ed è questo:
 *
 *   SI PUÒ  spiegare che cos'è una cosa e come funziona il meccanismo —
 *           che cos'è un ETF, come si compone la rata di un mutuo, che
 *           cosa cambia fra cedolare secca al 21% e al 10%;
 *
 *   NON SI PUÒ  dire a qualcuno che cosa comprare. Nessuno strumento
 *               preciso, nessun portafoglio consigliato, nessuna risposta
 *               a "che cosa faccio con diecimila euro".
 *
 * Ogni lezione qui dentro sta dalla parte giusta per costruzione: spiega
 * meccanismi e definizioni, usa gli strumenti di fantasia del gioco al
 * posto di titoli veri, e non contiene mai un'esortazione a fare qualcosa.
 * Un test cerca le parole che tradirebbero questo confine.
 *
 * ═══ PERCHÉ VALGONO QUALCOSA ═══
 *
 * I numeri degli esempi non sono inventati: si calcolano dal pacchetto del
 * mercato, che a Roma viene da quotazioni OMI, canoni rilevati e tassi
 * della BCE. Una lezione che dice "un trilocale a Prati rende meno di un
 * bilocale a Ostia" e lo dimostra con i prezzi veri delle due zone insegna
 * qualcosa che nessun manuale generico può insegnare.
 */
import { rataMutuo, zona, QUOTA_COSTI_L1 } from "../game/mercati/roma/derivazione.js";
import { numero } from "../game/finanze.js";
import { CREDITO, ZONE } from "../game/mercati/roma/fonti.js";

/** L'avvertenza che accompagna ogni lezione, sempre visibile. */
export const AVVERTENZA =
  "Questo è materiale didattico: spiega come funzionano le cose. Non è " +
  "consulenza finanziaria e non suggerisce che cosa comprare o vendere.";

const eur = (n) => `${numero(n)} €`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

/* Esempi calcolati sui dati veri, non scritti a mano. */
function esempioRata() {
  const capitale = 160000;
  const rata = rataMutuo(capitale, CREDITO.taeg, CREDITO.anni);
  const totale = rata * CREDITO.anni * 12;
  return { capitale, rata, totale, interessi: totale - capitale };
}

function esempioZone() {
  const centro = zona("centro");
  const periferia = zona("torbella");
  const resa = (z) => (z.canoneMq * 12) / z.euroMq;
  return { centro, periferia, resaCentro: resa(centro), resaPeriferia: resa(periferia) };
}

export const LEZIONI = [
  {
    id: "rendita",
    titolo: "Che cos'è una rendita",
    minuti: 2,
    sommario: "La differenza fra guadagnare e possedere qualcosa che guadagna.",
    corpo: () => [
      "Uno stipendio si ferma quando ti fermi tu. Una rendita no: continua ad arrivare " +
      "anche nei mesi in cui non fai niente, perché a produrla è una cosa che possiedi, " +
      "non il tuo tempo.",
      "È tutta qui la domanda del gioco, ed è una domanda contabile prima che filosofica: " +
      "quanta parte delle tue spese è coperta da entrate che non dipendono dal tuo lavoro? " +
      "Se la risposta è «tutte», il lavoro diventa una scelta.",
      "Attenzione a non confondere rendita e guadagno. Vendere una casa in guadagno è un " +
      "incasso una volta sola; affittarla è una rendita. Il gioco misura solo la seconda, " +
      "perché è quella che cambia la vita di qualcuno.",
    ],
  },

  {
    id: "attivo-passivo",
    titolo: "Attivo e passivo, per davvero",
    minuti: 3,
    sommario: "Non conta che cosa possiedi, conta in che direzione muove i soldi.",
    corpo: () => [
      "La distinzione utile non è fra cose belle e cose brutte, ma fra cose che ogni mese " +
      "ti mettono soldi in tasca e cose che ogni mese te li tolgono.",
      "La casa in cui vivi, per questa definizione, non è un attivo: paghi rata, utenze, " +
      "manutenzione e imposte, e non incassi niente. Non significa che sia un errore " +
      "comprarla — significa che nel conto economico sta a sinistra, fra le uscite.",
      "La stessa casa affittata a qualcun altro può essere un attivo, oppure no. Dipende " +
      "da un calcolo, non da un'etichetta: canone meno rata, meno imposte, meno spese, " +
      "meno i mesi in cui resta vuota. Nel gioco quel calcolo è già fatto e si chiama flusso.",
    ],
  },

  {
    id: "rata",
    titolo: "Come si compone la rata di un mutuo",
    minuti: 3,
    sommario: "Perché i primi anni sembrano non ridurre il debito.",
    corpo: () => {
      const e = esempioRata();
      return [
        "Una rata è fatta di due pezzi: una parte restituisce il capitale, l'altra paga " +
        "gli interessi. Nei mutui all'italiana più diffusi la rata resta uguale, ma la " +
        "proporzione cambia: all'inizio quasi tutto sono interessi, alla fine quasi tutto " +
        "è capitale.",
        `Con i numeri di oggi: ${eur(e.capitale)} a ${pct(CREDITO.taeg)} per ` +
        `${CREDITO.anni} anni fanno una rata di circa ${eur(e.rata)} al mese.`,
        `Alla fine avrai versato ${eur(e.totale)}, di cui ${eur(e.interessi)} di soli ` +
        "interessi. È il motivo per cui un decimo di punto sul tasso, su vent'anni, non è " +
        "un dettaglio.",
        "Il seguito pratico: nei primi anni il debito scende pianissimo. Chi vende dopo " +
        "cinque anni scopre di dovere alla banca quasi quanto all'inizio.",
      ];
    },
  },

  {
    id: "lordo-netto",
    titolo: "Rendimento lordo e rendimento netto",
    minuti: 4,
    sommario: "Perché un 7% annunciato diventa un 4% incassato.",
    corpo: () => [
      "Il rendimento lordo è il conto più facile: canone annuo diviso prezzo. È anche " +
      "quello che si trova scritto ovunque, perché è il più alto.",
      "Fra quel numero e quello che arriva sul conto ci sono almeno cinque voci: " +
      "l'imposta sull'affitto, l'imposta sull'immobile, le spese di condominio e " +
      "manutenzione, i mesi in cui l'appartamento resta vuoto, e gli inquilini che non " +
      "pagano.",
      `Nel gioco, al primo livello, tutte queste voci sono raccolte in un'unica ` +
      `trattenuta del ${pct(QUOTA_COSTI_L1)} sul canone. È una semplificazione ` +
      "dichiarata: prima si impara che un affitto non è tutto tuo, poi si impara perché.",
      "La regola pratica da portare via è una sola: quando qualcuno ti dice un rendimento, " +
      "la prima domanda è se è lordo o netto. Quasi sempre è lordo.",
    ],
  },

  {
    id: "cedolare",
    titolo: "La cedolare secca: 21% oppure 10%",
    minuti: 3,
    sommario: "Che cos'è, e che cosa cambia scegliere il canone concordato.",
    corpo: () => [
      "Chi affitta un immobile può scegliere di pagare un'imposta fissa sul canone invece " +
      "di sommarlo agli altri redditi. Si chiama cedolare secca e l'aliquota ordinaria è " +
      "il 21%.",
      "Esiste però un'aliquota ridotta al 10% per i contratti a canone concordato: " +
      "affitti seguendo i parametri stabiliti dagli accordi territoriali del comune, " +
      "che di norma sono sotto il prezzo libero di mercato, e in cambio paghi la metà " +
      "delle imposte.",
      "È uno scambio, non un regalo: si incassa meno canone e si pagano meno imposte. " +
      "Quale delle due strade lasci più soldi in tasca dipende dai numeri di quel " +
      "contratto e di quel comune — è un calcolo, e va fatto ogni volta.",
      "Chi sceglie la cedolare rinuncia anche ad aggiornare il canone all'inflazione per " +
      "la durata del contratto. Vale la pena saperlo prima, non dopo.",
    ],
  },

  {
    id: "costi-acquisto",
    titolo: "Quanto costa comprare, oltre al prezzo",
    minuti: 3,
    sommario: "Le spese che non tornano più indietro.",
    corpo: () => [
      "Il prezzo di un immobile non è quello che serve per comprarlo. Sopra ci sono " +
      "l'imposta di registro, il notaio e, quasi sempre, la provvigione dell'agenzia.",
      "L'imposta di registro è del 2% sul valore catastale per la prima casa e del 9% " +
      "per le altre. Il valore catastale è di norma parecchio più basso del prezzo pagato, " +
      "quindi la percentuale spaventa meno di quanto sembri — ma sulla seconda casa resta " +
      "la voce più pesante.",
      "Questi soldi non tornano. Non diventano parte del valore dell'immobile: se rivendi " +
      "il giorno dopo allo stesso prezzo, li hai persi. È la ragione per cui comprare e " +
      "rivendere in fretta raramente conviene.",
      "Nel gioco sono inclusi nell'anticipo di ogni carta immobiliare, e questo è il " +
      "motivo per cui l'anticipo è più alto della semplice differenza fra prezzo e mutuo.",
    ],
  },

  {
    id: "leva",
    titolo: "La leva funziona in tutte e due le direzioni",
    minuti: 4,
    sommario: "Perché indebitarsi moltiplica i guadagni e anche le perdite.",
    corpo: () => [
      "Comprare con un mutuo significa controllare una cosa grande mettendo una cifra " +
      "piccola. Se quella cosa rende più di quanto costa il debito, la differenza è tua, " +
      "e sul capitale che hai messo diventa una percentuale alta.",
      "Lo stesso meccanismo, girato: se rende meno di quanto costa il debito, la " +
      "differenza la metti tu, ogni mese, e sul capitale che hai messo diventa una " +
      "percentuale altrettanto alta con il segno meno.",
      "Non c'è niente di magico né di losco nella leva: è aritmetica. Amplifica quello " +
      "che c'è. Su un affare che funziona lo rende ottimo; su uno che non funziona lo " +
      "rende un problema mensile che dura vent'anni.",
      "Il segnale da guardare non è il rendimento, è il margine fra rendimento e costo " +
      "del debito. Quando quel margine è sottile, la leva smette di essere uno strumento " +
      "e diventa una scommessa sul fatto che niente vada storto.",
    ],
  },

  {
    id: "centro-periferia",
    titolo: "Perché il centro rende meno della periferia",
    minuti: 4,
    sommario: "Il conto che quasi nessuno fa prima di innamorarsi di un indirizzo.",
    corpo: () => {
      const e = esempioZone();
      return [
        "I canoni d'affitto salgono avvicinandosi al centro. I prezzi di acquisto salgono " +
        "molto di più. Siccome il rendimento è il rapporto fra i due, il rendimento scende.",
        `Con i valori di Roma: ${e.centro.nome} sta intorno a ${eur(e.centro.euroMq)} al ` +
        `metro quadro con canoni di ${e.centro.canoneMq} €, che fanno un lordo del ` +
        `${pct(e.resaCentro)}. ${e.periferia.nome} sta a ${eur(e.periferia.euroMq)} al ` +
        `metro con canoni di ${e.periferia.canoneMq} €: lordo del ${pct(e.resaPeriferia)}.`,
        "Quasi il triplo, per la stessa operazione. E il divario resta anche togliendo " +
        "imposte e spese, che pesano più o meno allo stesso modo su entrambi.",
        "Questo non significa che comprare in centro sia un errore: chi lo fa spesso punta " +
        "sulla rivalutazione, sulla facilità di rivendere o sull'uso personale, che sono " +
        "ragioni diverse dal rendimento. Significa che sono due operazioni diverse, e che " +
        "confonderle costa caro.",
      ];
    },
  },

  {
    id: "che-cose-un-etf",
    titolo: "Che cos'è un fondo, e che cos'è un ETF",
    minuti: 4,
    sommario: "Il meccanismo, in parole povere. Nessun nome, nessun consiglio.",
    corpo: () => [
      "Un fondo comune è un contenitore: tante persone mettono dei soldi, qualcuno li " +
      "investe seguendo una regola dichiarata, e ognuno possiede una quota del " +
      "contenitore in proporzione a quanto ha messo.",
      "Un ETF è un fondo con due caratteristiche in più. La prima è che si compra e si " +
      "vende in borsa come un'azione, durante la giornata. La seconda è che di norma non " +
      "cerca di battere il mercato: si limita a replicare un indice, cioè un elenco " +
      "predefinito di titoli con dei pesi.",
      "Da questo discende la differenza che si sente nominare più spesso: replicare un " +
      "elenco costa meno che pagare qualcuno perché scelga, quindi i costi di gestione " +
      "sono di solito più bassi. I costi contano perché si pagano ogni anno, anche negli " +
      "anni in cui il valore scende.",
      "Due cose che un ETF non è. Non è una garanzia: replica l'indice anche quando " +
      "l'indice perde. E non è una cosa sola: esistono ETF su qualunque cosa, con rischi " +
      "molto diversi fra loro, e «è un ETF» non dice quasi niente su che cosa contiene.",
      "Qui ci fermiamo, ed è una scelta obbligata: dire quale comprare sarebbe consulenza " +
      "in materia di investimenti, che in Italia richiede l'iscrizione a un albo.",
    ],
  },

  {
    id: "conto-economico",
    titolo: "Leggere il proprio conto economico",
    minuti: 3,
    sommario: "Quattro righe che dicono quasi tutto.",
    corpo: () => [
      "Entrate da lavoro. Entrate da rendita. Spese. Differenza. Sono quattro numeri, e " +
      "quasi nessuno li ha scritti da nessuna parte.",
      "La quarta riga dice se questo mese sei andato avanti o indietro. Le prime tre " +
      "dicono perché, e soprattutto quale delle leve puoi muovere: guadagnare di più da " +
      "lavoro, costruire rendita, o spendere meno.",
      "La cosa non ovvia è che le tre leve non sono equivalenti. Guadagnare di più da " +
      "lavoro spesso porta con sé spese più alte — casa più grande, auto nuova — e il " +
      "saldo si muove meno di quanto ci si aspetti. Nel gioco lo si vede subito: la " +
      "scheda con il reddito più alto non è quella che esce prima.",
      "È anche il motivo per cui il gioco ti fa compilare quelle righe a ogni turno " +
      "invece di mostrarti solo il saldo.",
    ],
  },
];

export const perId = (id) => LEZIONI.find((l) => l.id === id);
