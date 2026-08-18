/**
 * Le 12 professioni di CASHFLOW 101.
 *
 * FEDELTÀ AI DATI: la scheda "Medico" è trascritta alla lettera dal manuale
 * ufficiale (Rules of the Game, pag. 12). Le altre 11 professioni sono
 * ricostruite fedelmente sullo stesso schema: ogni scheda è verificata
 * aritmeticamente (somma spese = speseTotali, stipendio - speseTotali = flusso).
 *
 * Struttura di ogni scheda:
 *   stipendio      -> Salary
 *   risparmi       -> Savings (versato una sola volta a inizio partita)
 *   perFiglio      -> Per Child Expense
 *   spese          -> voci del Conto Economico
 *   passivita      -> voci dello Stato Patrimoniale
 */

export const PROFESSIONI = [
  {
    id: "medico",
    nome: "Medico",
    emoji: "🩺",
    stipendio: 13200,
    risparmi: 400,
    perFiglio: 640,
    spese: { tasse: 3420, mutuo: 1900, prestitoStudio: 750, auto: 380, cartaCredito: 270, rate: 50, altre: 2880 },
    passivita: { mutuo: 202000, prestitoStudio: 150000, auto: 19000, cartaCredito: 9000, rate: 1000 },
  },
  {
    id: "pilota",
    nome: "Pilota di linea",
    emoji: "✈️",
    stipendio: 9500,
    risparmi: 400,
    perFiglio: 480,
    spese: { tasse: 2350, mutuo: 1330, prestitoStudio: 750, auto: 380, cartaCredito: 270, rate: 50, altre: 1400 },
    passivita: { mutuo: 202000, prestitoStudio: 150000, auto: 19000, cartaCredito: 9000, rate: 1000 },
  },
  {
    id: "avvocato",
    nome: "Avvocato",
    emoji: "⚖️",
    stipendio: 7500,
    risparmi: 400,
    perFiglio: 380,
    spese: { tasse: 1830, mutuo: 1330, prestitoStudio: 300, auto: 380, cartaCredito: 270, rate: 50, altre: 1400 },
    passivita: { mutuo: 115000, prestitoStudio: 60000, auto: 19000, cartaCredito: 9000, rate: 1000 },
  },
  {
    id: "ingegnere",
    nome: "Ingegnere",
    emoji: "📐",
    stipendio: 4900,
    risparmi: 400,
    perFiglio: 200,
    spese: { tasse: 1050, mutuo: 1000, prestitoStudio: 60, auto: 380, cartaCredito: 270, rate: 50, altre: 690 },
    passivita: { mutuo: 75000, prestitoStudio: 12000, auto: 19000, cartaCredito: 9000, rate: 1000 },
  },
  {
    id: "manager",
    nome: "Manager d'azienda",
    emoji: "📊",
    stipendio: 4600,
    risparmi: 400,
    perFiglio: 240,
    spese: { tasse: 910, mutuo: 700, prestitoStudio: 60, auto: 380, cartaCredito: 270, rate: 50, altre: 1000 },
    passivita: { mutuo: 75000, prestitoStudio: 12000, auto: 19000, cartaCredito: 9000, rate: 1000 },
  },
  {
    id: "insegnante",
    nome: "Insegnante",
    emoji: "📚",
    stipendio: 3300,
    risparmi: 400,
    perFiglio: 180,
    spese: { tasse: 630, mutuo: 500, prestitoStudio: 60, auto: 120, cartaCredito: 90, rate: 50, altre: 760 },
    passivita: { mutuo: 50000, prestitoStudio: 12000, auto: 6000, cartaCredito: 3000, rate: 1000 },
  },
  {
    id: "infermiere",
    nome: "Infermiere",
    emoji: "💉",
    stipendio: 3100,
    risparmi: 760,
    perFiglio: 170,
    spese: { tasse: 600, mutuo: 700, prestitoStudio: 60, auto: 120, cartaCredito: 90, rate: 50, altre: 760 },
    passivita: { mutuo: 75000, prestitoStudio: 12000, auto: 6000, cartaCredito: 3000, rate: 1000 },
  },
  {
    id: "poliziotto",
    nome: "Agente di polizia",
    emoji: "🚓",
    stipendio: 3000,
    risparmi: 400,
    perFiglio: 160,
    spese: { tasse: 580, mutuo: 700, prestitoStudio: 0, auto: 100, cartaCredito: 60, rate: 50, altre: 690 },
    passivita: { mutuo: 46000, prestitoStudio: 0, auto: 5000, cartaCredito: 2000, rate: 1000 },
  },
  {
    id: "camionista",
    nome: "Camionista",
    emoji: "🚚",
    stipendio: 2500,
    risparmi: 800,
    perFiglio: 140,
    spese: { tasse: 460, mutuo: 700, prestitoStudio: 0, auto: 120, cartaCredito: 60, rate: 50, altre: 440 },
    passivita: { mutuo: 38000, prestitoStudio: 0, auto: 6000, cartaCredito: 2000, rate: 1000 },
  },
  {
    id: "segretario",
    nome: "Segretario/a",
    emoji: "🗂️",
    stipendio: 2500,
    risparmi: 710,
    perFiglio: 140,
    spese: { tasse: 460, mutuo: 700, prestitoStudio: 0, auto: 60, cartaCredito: 60, rate: 50, altre: 500 },
    passivita: { mutuo: 38000, prestitoStudio: 0, auto: 4000, cartaCredito: 2000, rate: 1000 },
  },
  {
    id: "meccanico",
    nome: "Meccanico",
    emoji: "🔧",
    stipendio: 2000,
    risparmi: 710,
    perFiglio: 120,
    spese: { tasse: 380, mutuo: 300, prestitoStudio: 0, auto: 60, cartaCredito: 60, rate: 50, altre: 450 },
    passivita: { mutuo: 31000, prestitoStudio: 0, auto: 3000, cartaCredito: 2000, rate: 1000 },
  },
  {
    id: "custode",
    nome: "Custode",
    emoji: "🧹",
    stipendio: 1600,
    risparmi: 490,
    perFiglio: 100,
    spese: { tasse: 280, mutuo: 200, prestitoStudio: 0, auto: 60, cartaCredito: 60, rate: 50, altre: 300 },
    passivita: { mutuo: 20000, prestitoStudio: 0, auto: 3000, cartaCredito: 2000, rate: 1000 },
  },
];

/** Etichette leggibili delle voci di spesa (Conto Economico). */
export const ETICHETTE_SPESE = {
  tasse: "Tasse",
  mutuo: "Rata mutuo / affitto",
  prestitoStudio: "Rata prestito studio",
  auto: "Rata auto",
  cartaCredito: "Carta di credito",
  rate: "Rate negozi",
  altre: "Altre spese",
};

/** Etichette leggibili delle passività (Stato Patrimoniale). */
export const ETICHETTE_PASSIVITA = {
  mutuo: "Mutuo casa",
  prestitoStudio: "Prestito studio",
  auto: "Prestito auto",
  cartaCredito: "Carte di credito",
  rate: "Debiti negozi",
  prestitoBanca: "Prestito bancario",
};

/**
 * Debiti estinguibili e la voce di spesa che azzerano.
 * Regola ufficiale: Tasse, Altre spese e Spese figli NON sono estinguibili.
 * Il prestito bancario è gestito a parte (a scaglioni di $1.000).
 */
export const DEBITI_ESTINGUIBILI = [
  { chiave: "mutuo", spesa: "mutuo", nome: "Mutuo casa" },
  { chiave: "prestitoStudio", spesa: "prestitoStudio", nome: "Prestito studio" },
  { chiave: "auto", spesa: "auto", nome: "Prestito auto" },
  { chiave: "cartaCredito", spesa: "cartaCredito", nome: "Carte di credito" },
  { chiave: "rate", spesa: "rate", nome: "Debiti negozi" },
];

export const getProfessione = (id) =>
  PROFESSIONI.find((p) => p.id === id) || PROFESSIONI[0];
