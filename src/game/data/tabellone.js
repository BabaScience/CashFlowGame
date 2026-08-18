/**
 * I due tracciati del tabellone.
 *
 * CORSA DEI TOPI - 24 caselle (anello interno, si tira 1 dado).
 * Ricostruzione fedele del tabellone originale: le Opportunità si alternano
 * agli eventi, con un Giorno di Paga ogni 8 caselle.
 *
 * CORSIA VELOCE - 48 caselle (anello esterno, si tirano 2 dadi).
 * Alterna affari (verde), sogni (rosa), Giorni del Cashflow e le penalità.
 */

export const CORSA_TOPI = [
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

/** Descrizione di ogni tipo di casella della Corsa dei Topi. */
export const CASELLE_TOPI = {
  paga: { nome: "Giorno di Paga", breve: "PAGA", colore: "#D98324", emoji: "💵" },
  opportunita: { nome: "Opportunità", breve: "OPP", colore: "#4E8B3D", emoji: "◆" },
  mercato: { nome: "Il Mercato", breve: "MERC", colore: "#2E6FA8", emoji: "📈" },
  extra: { nome: "Spesa Extra", breve: "EXTRA", colore: "#B23A2E", emoji: "🛍️" },
  beneficenza: { nome: "Beneficenza", breve: "BENEF", colore: "#7B4FA8", emoji: "❤️" },
  figlio: { nome: "Un figlio!", breve: "FIGLIO", colore: "#2F8F86", emoji: "👶" },
  licenziamento: { nome: "Licenziamento", breve: "LICENZ", colore: "#6B4423", emoji: "📉" },
};

/**
 * Corsia Veloce: 48 caselle.
 * `rif` collega la casella all'affare o al sogno corrispondente.
 */
export const CORSIA_VELOCE = [
  { tipo: "cashflowDay" },                    // 0
  { tipo: "affare", rif: "av01" },            // 1
  { tipo: "sogno", rif: "sg01" },             // 2
  { tipo: "affare", rif: "av02" },            // 3
  { tipo: "verificaFiscale" },                // 4
  { tipo: "affare", rif: "av03" },            // 5
  { tipo: "sogno", rif: "sg02" },             // 6
  { tipo: "affare", rif: "av04" },            // 7
  { tipo: "beneficenza" },                    // 8
  { tipo: "affare", rif: "av05" },            // 9
  { tipo: "sogno", rif: "sg03" },             // 10
  { tipo: "affare", rif: "av06" },            // 11
  { tipo: "cashflowDay" },                    // 12
  { tipo: "affare", rif: "av07" },            // 13
  { tipo: "sogno", rif: "sg04" },             // 14
  { tipo: "affare", rif: "av08" },            // 15
  { tipo: "causa" },                          // 16
  { tipo: "affare", rif: "av09" },            // 17
  { tipo: "sogno", rif: "sg05" },             // 18
  { tipo: "affare", rif: "av10" },            // 19
  { tipo: "verificaFiscale" },                // 20
  { tipo: "affare", rif: "av11" },            // 21
  { tipo: "sogno", rif: "sg06" },             // 22
  { tipo: "affare", rif: "av12" },            // 23
  { tipo: "cashflowDay" },                    // 24
  { tipo: "affare", rif: "av13" },            // 25
  { tipo: "sogno", rif: "sg07" },             // 26
  { tipo: "affare", rif: "av14" },            // 27
  { tipo: "divorzio" },                       // 28
  { tipo: "affare", rif: "av15" },            // 29
  { tipo: "sogno", rif: "sg08" },             // 30
  { tipo: "affare", rif: "av16" },            // 31
  { tipo: "beneficenza" },                    // 32
  { tipo: "affare", rif: "av17" },            // 33
  { tipo: "sogno", rif: "sg09" },             // 34
  { tipo: "affare", rif: "av18" },            // 35
  { tipo: "cashflowDay" },                    // 36
  { tipo: "affare", rif: "av19" },            // 37
  { tipo: "sogno", rif: "sg10" },             // 38
  { tipo: "affare", rif: "av20" },            // 39
  { tipo: "causa" },                          // 40
  { tipo: "sogno", rif: "sg11" },             // 41
  { tipo: "verificaFiscale" },                // 42
  { tipo: "sogno", rif: "sg12" },             // 43
  { tipo: "beneficenza" },                    // 44
  { tipo: "sogno", rif: "sg01" },             // 45
  { tipo: "causa" },                          // 46
  { tipo: "sogno", rif: "sg03" },             // 47
];

export const CASELLE_VELOCE = {
  cashflowDay: { nome: "Giorno del Cashflow", breve: "CASHFLOW", colore: "#D98324", emoji: "💰" },
  affare: { nome: "Affare", breve: "AFFARE", colore: "#4E8B3D", emoji: "◆" },
  sogno: { nome: "Sogno", breve: "SOGNO", colore: "#C2557A", emoji: "★" },
  beneficenza: { nome: "Beneficenza", breve: "BENEF", colore: "#7B4FA8", emoji: "❤️" },
  verificaFiscale: { nome: "Verifica fiscale", breve: "FISCO", colore: "#B23A2E", emoji: "🧾" },
  causa: { nome: "Causa legale", breve: "CAUSA", colore: "#8A3324", emoji: "⚖️" },
  divorzio: { nome: "Divorzio", breve: "DIVORZIO", colore: "#5A5A5A", emoji: "💔" },
};

export const N_TOPI = CORSA_TOPI.length;
export const N_VELOCE = CORSIA_VELOCE.length;

/** Obiettivo di flusso da aggiungere al reddito iniziale per vincere. */
export const OBIETTIVO_CASHFLOW = 50000;

/** Numero massimo di giocatori per stanza (come il gioco da tavolo). */
export const MAX_GIOCATORI = 6;

/** Colori assegnati ai giocatori, nell'ordine di ingresso. */
export const COLORI = ["#C4362B", "#2E6FA8", "#4E8B3D", "#D98324", "#7B4FA8", "#2F8F86"];
