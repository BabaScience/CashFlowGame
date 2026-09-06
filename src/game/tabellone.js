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
 * Alterna affari (verde), sogni (rosa), Giorni del Quota Zero e le penalità.
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
 * `rif` collega la casella all'affare o al sogno corrispondente.
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
   * di rendite e sogni senza un solo affare.
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
   * turno, sempre. Le quantità non cambiano — 20 affari, 14 sogni, 4
   * penalità, 2 beneficenze — cambia solo dove stanno, e adesso non c'è
   * nessun tratto senza affari.
   */
  { tipo: "rendita" },                         // 0
  { tipo: "affare", rif: "av01" },             // 1
  { tipo: "sogno", rif: "sg01" },              // 2
  { tipo: "affare", rif: "av02" },             // 3
  { tipo: "verificaFiscale" },                 // 4
  { tipo: "affare", rif: "av03" },             // 5
  { tipo: "rendita" },                         // 6
  { tipo: "affare", rif: "av04" },             // 7
  { tipo: "sogno", rif: "sg02" },              // 8
  { tipo: "affare", rif: "av05" },             // 9
  { tipo: "beneficenza" },                     // 10
  { tipo: "sogno", rif: "sg03" },              // 11
  { tipo: "rendita" },                         // 12
  { tipo: "affare", rif: "av06" },             // 13
  { tipo: "sogno", rif: "sg04" },              // 14
  { tipo: "affare", rif: "av07" },             // 15
  { tipo: "causa" },                           // 16
  { tipo: "affare", rif: "av08" },             // 17
  { tipo: "rendita" },                         // 18
  { tipo: "affare", rif: "av09" },             // 19
  { tipo: "sogno", rif: "sg05" },              // 20
  { tipo: "affare", rif: "av10" },             // 21
  { tipo: "sogno", rif: "sg06" },              // 22
  { tipo: "sogno", rif: "sg07" },              // 23
  { tipo: "rendita" },                         // 24
  { tipo: "affare", rif: "av11" },             // 25
  { tipo: "sogno", rif: "sg08" },              // 26
  { tipo: "affare", rif: "av12" },             // 27
  { tipo: "verificaFiscale" },                 // 28
  { tipo: "affare", rif: "av13" },             // 29
  { tipo: "rendita" },                         // 30
  { tipo: "affare", rif: "av14" },             // 31
  { tipo: "sogno", rif: "sg09" },              // 32
  { tipo: "affare", rif: "av15" },             // 33
  { tipo: "beneficenza" },                     // 34
  { tipo: "sogno", rif: "sg10" },              // 35
  { tipo: "rendita" },                         // 36
  { tipo: "affare", rif: "av16" },             // 37
  { tipo: "sogno", rif: "sg11" },              // 38
  { tipo: "affare", rif: "av17" },             // 39
  { tipo: "divorzio" },                        // 40
  { tipo: "affare", rif: "av18" },             // 41
  { tipo: "rendita" },                         // 42
  { tipo: "affare", rif: "av19" },             // 43
  { tipo: "sogno", rif: "sg12" },              // 44
  { tipo: "affare", rif: "av20" },             // 45
  { tipo: "sogno", rif: "sg01" },              // 46
  { tipo: "sogno", rif: "sg02" },              // 47
];

export const CASELLE_LARGO = {
  rendita: { nome: "Giorno di Rendita", breve: "RENDITA", colore: "#D98324", emoji: "💰" },
  affare: { nome: "Affare", breve: "AFFARE", colore: "#4E8B3D", emoji: "◆" },
  sogno: { nome: "Sogno", breve: "SOGNO", colore: "#C2557A", emoji: "★" },
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
