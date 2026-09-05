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
  {
    id: "banca-presta",
    titolo: "Perché la banca ti presta (e quanto)",
    minuti: 3,
    sommario: "La regola del terzo, e perché nessuno ti dà mezzo milione a parola.",
    corpo: () => [
      "Una banca non presta guardando quanto ti serve: guarda quanto puoi restituire. " +
      "La misura che usa quasi sempre è il rapporto fra la rata e il reddito netto " +
      "mensile, e la soglia comune in Italia sta fra il 30 e il 35 per cento. Un terzo, " +
      "in pratica.",
      "Il conto si fa su TUTTE le rate insieme, non solo su quella nuova: se paghi già " +
      "un finanziamento per l'auto e uno per gli studi, quello spazio è occupato. È il " +
      "motivo per cui due persone con lo stesso stipendio ottengono cifre diverse.",
      "Il canone d'affitto di solito non entra in quel conto — non è un debito e non " +
      "compare nelle centrali rischi come CRIF — ma la banca lo vede lo stesso, perché " +
      "riduce quello che ti resta.",
      "Poi c'è il tipo di credito. Un mutuo è garantito dalla casa, quindi costa poco " +
      "(intorno al 4% l'anno) e arriva fino all'80% del valore dell'immobile. Un " +
      "prestito personale non è garantito da niente, costa il doppio o il triplo, e le " +
      "finanziarie si fermano fra i 30.000 e i 60.000 euro. Un fido di conto corrente " +
      "costa ancora di più.",
      "Nel gioco funziona così: prova a chiedere più di quanto il tuo reddito regge e la " +
      "banca dice di no, spiegando perché. Non è un ostacolo messo lì per rallentare: è " +
      "la cosa che ti succederà davvero allo sportello.",
    ],
  },
  {
    id: "vendere-costa",
    titolo: "Quanto costa vendere una casa",
    minuti: 3,
    sommario: "L'agenzia, la plusvalenza, e la regola dei cinque anni.",
    corpo: () => [
      "Comprare costa più del prezzo — imposta di registro, notaio, agenzia — e questa è " +
      "una cosa che quasi tutti sanno. Che anche VENDERE costi, lo scopre di solito chi " +
      "vende la prima volta.",
      "Due voci. La provvigione dell'agenzia, di norma intorno al 3% più IVA, la paga " +
      "anche il venditore. E se vendi entro cinque anni dall'acquisto, sul guadagno paghi " +
      "un'imposta sostitutiva del 26 per cento, che il notaio trattiene direttamente al " +
      "rogito e versa allo Stato.",
      "Il guadagno tassato è la differenza fra quanto incassi e quanto avevi pagato. Il " +
      "mutuo non c'entra: quello era solo il modo in cui avevi pagato l'acquisto.",
      "Dopo cinque anni quella tassa non si applica più. È una regola scritta apposta per " +
      "distinguere chi investe da chi specula, e cambia i conti in modo brutale: la " +
      "stessa identica compravendita può rendere il 29% se la chiudi subito e più del " +
      "50% se aspetti. Fa eccezione la prima casa in cui hai davvero abitato, che è " +
      "esente comunque.",
      "Nel gioco è esattamente così, e si vede nel registro: ogni vendita elenca il " +
      "mutuo estinto, l'agenzia e l'imposta, prima di dirti quanto ti resta in mano.",
    ],
  },
  {
    id: "margine",
    titolo: "Perché non basta pareggiare",
    minuti: 2,
    sommario: "Uscire dalla Ruota al pareggio significa rientrarci al primo imprevisto.",
    corpo: () => [
      "Il conto ovvio è: quando le rendite coprono le spese, il lavoro diventa " +
      "facoltativo. È vero in aritmetica e falso nella vita.",
      "Le rendite non sono ferme. Un inquilino se ne va e l'appartamento resta vuoto due " +
      "mesi; una caldaia si rompe; un'attività ha un'annata storta; il condominio " +
      "delibera dei lavori. Le spese, intanto, si muovono anche loro — e quasi sempre in " +
      "su.",
      "Chi lascia il lavoro nel mese esatto in cui i conti si toccano è un imprevisto " +
      "lontano dal tornare a cercarlo. Per questo il mercato di Roma chiede una volta e " +
      "mezza le spese, non il pareggio: quel margine non è prudenza esagerata, è il " +
      "costo di poter dire di no.",
      "È anche il motivo per cui prendere soldi a prestito per uscire prima raramente " +
      "funziona. Ogni euro di rata alza le tue spese, e quindi alza il traguardo di uno " +
      "e mezzo. Il debito accorcia la strada solo se ciò che compri rende molto più di " +
      "quanto il debito costa — e nella realtà quello scarto è sottile, non enorme.",
    ],
  },
  {
    id: "ral-netto",
    titolo: "RAL, lordo, netto: tre numeri diversi",
    minuti: 3,
    sommario: "Perché lo stipendio di cui si parla non è quello che arriva.",
    corpo: () => [
      "Quando qualcuno dice «guadagno 35.000 euro» quasi sempre intende la RAL, cioè la " +
      "retribuzione annua lorda: il costo del tuo contratto prima di qualunque " +
      "trattenuta. Non è quello che ti arriva.",
      "Dalla RAL si tolgono i contributi previdenziali (circa il 9-10% a carico del " +
      "lavoratore) e poi l'IRPEF, che è a scaglioni: più guadagni, più alta è l'aliquota " +
      "sull'ultima fetta di reddito — non su tutto. Si aggiungono addizionali regionali e " +
      "comunali, che a Roma non sono trascurabili.",
      "Il risultato è che una RAL di 35.000 euro diventa circa 2.200-2.300 euro netti al " +
      "mese su tredici mensilità. Il rapporto non è costante: più si sale, più la " +
      "distanza fra lordo e netto si allarga.",
      "Nel gioco le schede sono già al NETTO, perché è quello che si spende. Per la stessa " +
      "ragione la voce «Imposte» resta a zero sullo stipendio: le hai già pagate. Compare " +
      "invece quando cominci a incassare affitti, perché quelli sono un reddito nuovo, e " +
      "su un reddito nuovo le imposte si pagano di nuovo.",
      "Le schede di Roma sono di una persona sola: il suo stipendio e le sue spese. È il " +
      "motivo per cui l'affitto è quello di un monolocale o di una stanza condivisa, e " +
      "non quello di una casa di famiglia. Confrontare le spese di una famiglia con lo " +
      "stipendio di una persona darebbe un quadro falso, e per un po' il gioco l'ha " +
      "fatto.",
    ],
  },

  {
    id: "dopo-la-liberta",
    titolo: "Cosa succede il giorno dopo",
    minuti: 2,
    sommario: "Smettere di lavorare non è un traguardo: è un cambio di reddito.",
    corpo: () => [
      "Nell'immaginario, raggiungere l'indipendenza finanziaria è una linea che si " +
      "taglia: prima di qua, dopo di là. Nei conti non funziona così. Il giorno dopo " +
      "hai esattamente le stesse case, le stesse attività, gli stessi debiti e le " +
      "stesse spese del giorno prima. L'unica riga che cambia è lo stipendio, che va " +
      "a zero.",
      "È per questo che il margine conta. Finché lavori, uno sfitto o una caldaia rotta " +
      "li assorbe la busta paga. Dopo, li assorbe il tuo portafoglio — e se il " +
      "portafoglio copriva le spese e basta, non c'è niente da cui assorbirli.",
      "Cambia anche il modo in cui ti guarda una banca. Il reddito da dimostrare non è " +
      "più la busta paga ma la rendita, e le regole restano quelle: la rata non può " +
      "superare un terzo di quello che entra. Chi ha smesso di lavorare non ha smesso " +
      "di essere valutato.",
      "Nel gioco è la stessa cosa: uscire dalla Ruota non regala niente e non azzera " +
      "niente. Il Giorno di Rendita incassa quello che le tue cose producono davvero, " +
      "meno quello che ti costa vivere, e da lì si riparte — con l'obiettivo di " +
      "raddoppiare quello che ti sei costruito.",
    ],
  },


];

export const perId = (id) => LEZIONI.find((l) => l.id === id);
