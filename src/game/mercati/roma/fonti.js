/**
 * LE FONTI DEL MERCATO DI ROMA.
 *
 * Ogni numero del pacchetto deve poter essere ricondotto a un dato pubblico.
 * Non è formalità: è la differenza fra un gioco e uno strumento che una
 * scuola può adottare. Un insegnante deve poter cliccare e vedere da dove
 * arriva il prezzo di un appartamento a Torpignattara.
 *
 * Le fonti sono tutte pubbliche e riutilizzabili. Non si estraggono dati
 * dai portali di annunci: le loro condizioni d'uso non lo consentono per un
 * prodotto commerciale, e per giunta pubblicano prezzi richiesti, non
 * prezzi di compravendita.
 */

export const FONTI = {
  immobili: {
    nome: "Osservatorio del Mercato Immobiliare (OMI) — Agenzia delle Entrate",
    url: "https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/banche-dati/quotazioni-immobiliari",
    aggiornato: "2026-S1",
    nota: "Quotazioni per zona OMI. Citazione della fonte obbligatoria. "
        + "L'uso commerciale va confermato per iscritto prima di far pagare il prodotto.",
  },
  affitti: {
    nome: "Canoni medi Roma — rilevazioni di mercato",
    url: "https://www.idealista.it/sala-stampa/report-prezzo-immobile/affitto/lazio/roma-provincia/roma/",
    aggiornato: "2026-T1",
    nota: "19,8 €/m²/mese media comunale, +6,5% su base annua.",
  },
  stipendi: {
    nome: "Osservatorio JobPricing — Salary Outlook",
    url: "https://osservatoriojobpricing.it/report/salary-outlook",
    aggiornato: "2026",
    nota: "RAL media privato 32.991 €; Lazio 32.220 €. Qui si usano importi NETTI mensili.",
  },
  credito: {
    nome: "Banca d'Italia — Banche e moneta",
    url: "https://www.bancaditalia.it/pubblicazioni/moneta-banche/",
    aggiornato: "2026-06",
    nota: "TAEG medio sulle nuove erogazioni 3,81–3,96% nel primo semestre 2026. "
        + "L'80% sceglie il tasso fisso.",
  },
  fisco: {
    nome: "Agenzia delle Entrate",
    url: "https://www.agenziaentrate.gov.it/",
    aggiornato: "2026",
    nota: "Cedolare secca 21% (10% con canone concordato), IMU sulle seconde case, "
        + "imposta di registro 2% prima casa / 9% seconda.",
  },
};

/**
 * Le zone di Roma usate per costruire le carte, con il prezzo al metro
 * quadro e il canone mensile al metro quadro.
 *
 * I valori sono arrotondati: servono a un gioco, non a una perizia. Le
 * proporzioni fra le zone, però, sono quelle vere — ed è quello che il
 * gioco insegna, perché è da lì che nasce la scelta fra rendimento e
 * rivalutazione.
 */
export const ZONE = [
  { id: "centro",     nome: "Centro Storico",            euroMq: 9500, canoneMq: 27.0 },
  { id: "prati",      nome: "Prati",                      euroMq: 6200, canoneMq: 24.0 },
  { id: "trastevere", nome: "Trastevere",                 euroMq: 6000, canoneMq: 25.0 },
  { id: "sanlorenzo", nome: "San Lorenzo",                euroMq: 4200, canoneMq: 23.0 },
  { id: "ostiense",   nome: "Ostiense",                   euroMq: 3600, canoneMq: 21.0 },
  { id: "garbatella", nome: "Garbatella",                 euroMq: 3500, canoneMq: 20.5 },
  { id: "marconi",    nome: "Marconi",                    euroMq: 3400, canoneMq: 20.0 },
  { id: "pigneto",    nome: "Pigneto",                    euroMq: 3300, canoneMq: 20.0 },
  { id: "montesacro", nome: "Montesacro",                 euroMq: 3100, canoneMq: 18.5 },
  { id: "tuscolano",  nome: "Tuscolano",                  euroMq: 3000, canoneMq: 18.0 },
  { id: "portuense",  nome: "Portuense",                  euroMq: 2800, canoneMq: 17.5 },
  { id: "cinecitta",  nome: "Cinecittà",                  euroMq: 2600, canoneMq: 17.0 },
  { id: "torpigna",   nome: "Torpignattara",              euroMq: 2300, canoneMq: 16.5 },
  { id: "primavalle", nome: "Primavalle",                 euroMq: 2200, canoneMq: 16.0 },
  { id: "ostia",      nome: "Ostia",                      euroMq: 2000, canoneMq: 15.0 },
  { id: "torbella",   nome: "Tor Bella Monaca",           euroMq: 1600, canoneMq: 13.0 },
];

/** Costi d'ingresso su una compravendita: notaio, imposte, agenzia. */
export const COSTI_ACQUISTO = {
  registroSeconda: 0.09,   // 9% sul valore catastale, seconda casa
  notaio: 2500,
  agenzia: 0.03,
};

/**
 * QUANTO COSTA VENDERE.
 *
 * Il gioco lo ignorava del tutto: si comprava, arrivava una carta Mercato a
 * 1,55× e si incassava il 154% sul capitale versato, netto, subito. Nella
 * realtà chi vende paga l'agenzia e, se vende entro cinque anni
 * dall'acquisto, un'imposta sostitutiva del 26% sulla plusvalenza —
 * trattenuta dal notaio in sede di rogito. Dopo i cinque anni la
 * plusvalenza non si tassa: è esattamente la regola che distingue
 * l'investimento dalla speculazione, ed è la cosa più utile che questo
 * gioco possa insegnare su una compravendita.
 */
export const COSTI_VENDITA = {
  agenzia: 0.03,           // provvigione del venditore
  plusvalenza: 0.26,       // imposta sostitutiva, entro i 5 anni
  mesiEsenzione: 60,       // cinque anni
};

/** Il credito, come lo concedono davvero le banche italiane. */
/**
 * IL CREDITO AL CONSUMO, cioè il "fido bancario" del gioco.
 *
 * Fonti (agosto 2026): il TAEG medio del credito al consumo sta intorno al
 * 10%, e le finanziarie principali arrivano a 30.000–60.000 € di importo
 * massimo. Un fido di conto corrente costa di più — 12–18% — ed è quello
 * che il gioco modella: debito che non si ammortizza e resta lì finché non
 * lo si estingue.
 *
 * Ma il numero che conta non è il tasso: è il LIMITE. Le banche italiane
 * concedono se la rata — sommata a quelle già in corso — non supera circa
 * un terzo del reddito netto mensile. È la regola del 30-35%, e "assenza di
 * altri debiti" è una delle condizioni per stare nella parte alta.
 *
 * Il gioco non aveva niente di tutto questo: chiunque poteva farsi prestare
 * mezzo milione con uno stipendio da insegnante.
 */
export const CREDITO_CONSUMO = {
  quotaRedditoMax: 1 / 3,   // rata totale sul netto mensile
  importoMassimo: 75000,    // tetto del credito al consumo, capo alto
  /* Il canone di casa non è una rata di finanziamento: non compare nelle
     centrali rischi e la banca lo pesa come costo di vita, non come debito
     in corso. Contarlo fra le rate rendeva impossibile ottenere un euro a
     chiunque paghi un affitto — cioè a tutti. */
  vociEscluse: ["casa"],
};

export const CREDITO = {
  taeg: 0.039,             // 3,9%: media del primo semestre 2026
  anni: 25,
  ltvMax: 0.80,            // di norma non si finanzia oltre l'80%
};
