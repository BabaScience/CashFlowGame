/**
 * IL TABELLONE — la parte del gioco che NON cambia da un mercato all'altro.
 *
 * La divisione è questa: il tabellone è il gioco, l'economia è il mercato.
 * Ventiquattro caselle sull'anello interno e quarantotto su quello esterno
 * valgono a Roma come a Parigi; quanto costa una casa, no. Perciò qui
 * restano percorsi, tipi di casella e colori, mentre professioni, mazzi,
 * affari, valuta e obiettivo stanno nel pacchetto del mercato.
 *
 * I due tracciati del tabellone.
 *
 * LA RUOTA - 24 caselle (anello interno, si tira 1 dado).
 * Le Opportunità si alternano
 * agli eventi, con un Giorno di Paga ogni 8 caselle.
 *
 * IL LARGO - 48 caselle (anello esterno, si tirano 2 dadi).
 * Alterna affari (verde), Giorni del Quota Zero e le penalità.
 */

export const PERCORSO_RUOTA = [
  "paga",        // 0
  "opportunita", // 1
  "extra",       // 2
  "opportunita", // 3
  "beneficenza", // 4
  "opportunita", // 5
  "mercato",     // 6
  "opportunita", // 7
  "paga",        // 8
  "opportunita", // 9
  "extra",       // 10
  "opportunita", // 11
  "figlio",      // 12
  "opportunita", // 13
  "mercato",     // 14
  "opportunita", // 15
  "paga",        // 16
  "opportunita", // 17
  "extra",       // 18
  "opportunita", // 19
  "licenziamento", // 20
  "opportunita", // 21
  "mercato",     // 22
  "opportunita", // 23
];

/** Descrizione di ogni tipo di casella della Ruota. */
export const CASELLE_RUOTA = {
  paga: { nome: "Giorno di Paga", breve: "PAGA", colore: "#D98324", emoji: "💵" },
  opportunita: { nome: "Opportunità", breve: "OPP", colore: "#4E8B3D", emoji: "◆" },
  mercato: { nome: "Il Mercato", breve: "MERC", colore: "#2E6FA8", emoji: "📈" },
  extra: { nome: "Spesa Extra", breve: "EXTRA", colore: "#B23A2E", emoji: "🛍️" },
  beneficenza: { nome: "Beneficenza", breve: "BENEF", colore: "#7B4FA8", emoji: "❤️" },
  figlio: { nome: "Un figlio!", breve: "FIGLIO", colore: "#2F8F86", emoji: "👶" },
  licenziamento: { nome: "Licenziamento", breve: "LICENZ", colore: "#6B4423", emoji: "📉" },
};

/**
 * Largo: 48 caselle.
 * `rif` collega la casella all'affare corrispondente.
 */
export const PERCORSO_LARGO = [
  /* ═══ IL SECONDO TEMPO, PER QUANDO TORNERÀ ═══
   *
   * Questo tabellone oggi non si gioca: i mercati pubblicati hanno
   * `secondoTempo: false` e uscire dalla Ruota è la vittoria. Resta qui,
   * sistemato, perché il difetto che aveva era visibile a occhio nudo e
   * riaccenderlo com'era sarebbe stato riaccendere anche quello.
   *
   * ═══ COS'ERA STORTO ═══
   *
   * I Giorni di Rendita stavano a 0, 12, 24, 36, 40, 42, 44, 46: distanze
   * di 2, 12, 12, 12, 4, 2, 2, 2. E le ultime otto caselle erano un blocco
   * di rendite senza un solo affare.
   *
   * Si vedeva nel registro, ed è così che l'ho trovato: il 28% dei turni
   * produceva soltanto il tiro dei dadi, e il 36% di quelli che pagavano
   * scriveva da due a cinque righe identiche di fila. Carestia, poi
   * abbuffata. In mezzo, otto caselle in cui non si poteva comprare niente.
   *
   * ═══ COM'È ADESSO ═══
   *
   * Un Giorno di Rendita ogni sei caselle, otto in tutto: distanze tutte
   * uguali. Con due dadi (media 7) si incassa poco più di una volta a
   * turno, sempre. Le quantità non cambiano — 20 affari, 4
   * penalità, 2 beneficenze — cambia solo dove stanno, e adesso non c'è
   * nessun tratto senza affari.
   */
  { tipo: "rendita" },            // 0
  { tipo: "affare", rif: "av01" }, // 1
  { tipo: "affare", rif: "av02" }, // 2
  { tipo: "verificaFiscale" },    // 3
  { tipo: "rendita" },            // 4
  { tipo: "affare", rif: "av03" }, // 5
  { tipo: "affare", rif: "av04" }, // 6
  { tipo: "affare", rif: "av05" }, // 7
  { tipo: "rendita" },            // 8
  { tipo: "beneficenza" },        // 9
  { tipo: "affare", rif: "av06" }, // 10
  { tipo: "affare", rif: "av07" }, // 11
  { tipo: "rendita" },            // 12
  { tipo: "causa" },              // 13
  { tipo: "affare", rif: "av08" }, // 14
  { tipo: "affare", rif: "av09" }, // 15
  { tipo: "affare", rif: "av10" }, // 16
  { tipo: "rendita" },            // 17
  { tipo: "affare", rif: "av11" }, // 18
  { tipo: "affare", rif: "av12" }, // 19
  { tipo: "verificaFiscale" },    // 20
  { tipo: "rendita" },            // 21
  { tipo: "affare", rif: "av13" }, // 22
  { tipo: "affare", rif: "av14" }, // 23
  { tipo: "affare", rif: "av15" }, // 24
  { tipo: "rendita" },            // 25
  { tipo: "beneficenza" },        // 26
  { tipo: "affare", rif: "av16" }, // 27
  { tipo: "affare", rif: "av17" }, // 28
  { tipo: "rendita" },            // 29
  { tipo: "divorzio" },           // 30
  { tipo: "affare", rif: "av18" }, // 31
  { tipo: "affare", rif: "av19" }, // 32
  { tipo: "affare", rif: "av20" }, // 33
];

export const CASELLE_LARGO = {
  rendita: { nome: "Giorno di Rendita", breve: "RENDITA", colore: "#D98324", emoji: "💰" },
  affare: { nome: "Affare", breve: "AFFARE", colore: "#4E8B3D", emoji: "◆" },
  beneficenza: { nome: "Beneficenza", breve: "BENEF", colore: "#7B4FA8", emoji: "❤️" },
  verificaFiscale: { nome: "Verifica fiscale", breve: "FISCO", colore: "#B23A2E", emoji: "🧾" },
  causa: { nome: "Causa legale", breve: "CAUSA", colore: "#8A3324", emoji: "⚖️" },
  divorzio: { nome: "Divorzio", breve: "DIVORZIO", colore: "#5A5A5A", emoji: "💔" },
};

export const N_RUOTA = PERCORSO_RUOTA.length;
export const N_LARGO = PERCORSO_LARGO.length;

/** Numero massimo di giocatori per stanza (come il gioco da tavolo). */
export const MAX_GIOCATORI = 6;

/** Colori assegnati ai giocatori, nell'ordine di ingresso. */
export const COLORI = ["#C4362B", "#2E6FA8", "#4E8B3D", "#D98324", "#7B4FA8", "#2F8F86"];
