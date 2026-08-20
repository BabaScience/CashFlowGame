/**
 * English.
 *
 * An English interface over the Rome market is the cheapest reach this
 * product has: the work is already done, only the dictionary changes. Note
 * that the market stays Rome — prices, salaries and rates are still Roman,
 * still in euros. Language and market are separate on purpose.
 *
 * The game's own vocabulary is translated rather than transliterated:
 * "la Ruota" becomes "the Wheel", "il Largo" becomes "Open Water". The
 * nautical metaphor carries the name — you start at sea level and you make
 * for open water — and it survives the crossing.
 */
export default {
  app: {
    nome: "Quota Zero",
    titoloPagina: "Quota Zero · Make for open water",
    motto: "Get off the Wheel.",
    sottotitolo: "2 to 6 players, wherever you are.",
    nessunaRegistrazione: "No sign-up. A room code is all you need.",
  },

  ingresso: {
    sfidaTitolo: "Daily challenge",
    sfidaSotto: "On your own, five minutes. Same game for everyone.",
    sfidaAria: "Play today's challenge: on your own, five minutes",
    nome: "Your name",
    nomeSegnaposto: "What people call you",
    dovegiochi: "Where you play",
    mercatoNota: "The market sets prices, salaries, rates and currency. It applies to the whole table and cannot be changed once the game starts.",
    professione: "Profession",
    stipendio: "Income",
    speseTotali: "Total expenses",
    giornoDiPaga: "Payday",
    perUscire: "To get off the Wheel you need passive income above {importo} a month.",
    sogno: "Your dream",
    sognoNota: "Buying it in Open Water wins instantly. Careful: every opponent who lands on it doubles its price for you.",
    creaStanza: "Create a room",
    entraConCodice: "Join with a code",
    creaEInvita: "Create and invite friends",
    creando: "Creating the room…",
    entrando: "Joining…",
    entraNellaPartita: "Join the game",
    codice: "Room code",
    scriviNome: "Enter your name.",
    codiceCorto: "The code is 4 letters.",
    partiteAperte: "Your games",
    dimentica: "Remove from list",
    livello: "How much realism",
    lingua: "Language",
  },

  attesa: {
    codiceStanza: "Room code",
    copia: "Copy",
    invita: "Invite",
    copiato: "Code copied to clipboard.",
    laTuaScelta: "Your choice",
    professione: "Profession",
    sogno: "Dream",
    inAttesa: "Waiting for players…",
    comincia: "Start the game",
    invitoTesto: "Let's play Quota Zero! Join with code {codice}: {url}",
  },

  partita: {
    stanza: "Room",
    contanti: "Cash",
    ruota: "The Wheel",
    largo: "Open Water",
    tiraIlDado: "Roll the die",
    tiraIDadi: "Roll the dice",
    toccaA: "{nome}'s turn",
    toccaATe: "Your turn!",
    sulTavolo: "On the table",
    renditaVersoSpese: "Passive income vs expenses",
    seiLibero: "You're free!",
    prendiIlLargo: "Make for open water",
    fuoriDallaPartita: "You're out of the game, but you can keep watching.",
    quantiDadi: "How many dice?",
    casellaRisolta: "Square resolved. The turn is passing…",
    saltiTurni: "You'll miss the next {n} turns.",
    regoleDelGioco: "Rules of the game",
    tornaAlTavolo: "Back to the table",
    suoniAccesi: "Sound on",
    avvisami: "Notify me when it's my turn",
    suoniSpenti: "Sound off",
  },

  schede: {
    scheda: "Sheet",
    giocatori: "Players",
    chat: "Chat",
    registro: "Log",
    regole: "Rules",
  },

  chat: {
    titolo: "Table chat",
    spegni: "Turn off",
    riaccendi: "Turn on",
    spenta: "Chat is switched off in this room.",
    vuota: "No messages yet. Messages only last as long as the game does.",
    segnaposto: "Say something…",
    messaggio: "Message",
    invia: "Send",
    tu: "You",
  },

  sfida: {
    titolo: "Daily challenge",
    spiegazione: "Same sheet, same deck, same cards for everyone playing today. {turni} turns to bring your passive income as close as you can to your expenses. One attempt.",
    gioca: "Play today's challenge",
    tornaInizio: "Back to the start",
    serie: "Streak",
    record: "Best",
    giocate: "Played",
    oggiHaiFatto: "Today you scored",
    tornaDomani: "Come back tomorrow: the challenge changes at midnight.",
    turno: "Turn",
    punteggio: "Score",
    su100: "out of 100",
    condividi: "Share your result",
    copiato: "Copied!",
    cambiaAMezzanotte: "The challenge changes at midnight. Same game for everyone, one attempt each.",
    fasce: {
      largo: "Open water",
      quasi: "Nearly",
      meta: "Halfway",
      avviato: "Started",
      zero: "Sea level",
    },
  },

  vittoria: {
    partitaConclusa: "Game over",
    vincitore: "Winner",
    nessunVincitore: "No winner",
    comeEAndata: "How everyone did",
    nuovaPartita: "New game",
    contantiFinali: "Final cash",
    redditoRendita: "Open Water income",
    guadagnatoAlLargo: "Gained in Open Water",
    affariAcquistati: "Deals bought",
    redditoPassivo: "Passive income",
    turniGiocati: "Turns played",
    motivo: {
      sogno: "achieved their dream",
      rendita: "reached +{importo} of income in Open Water",
      ultimo: "is the last player standing",
      tempo: "came closest to their goal when time ran out",
      generico: "won",
    },
  },

  impara: {
    titolo: "Learn",
    lezioni: "Lessons",
    quesiti: "Puzzles",
    minuti: "min",
    giusto: "Correct.",
    sbagliato: "Not quite.",
    prossimo: "Next puzzle",
    richiamo: "Learn",
    richiamoSotto: "Short lessons and thirty-second puzzles.",
  },

  mercati: {
    classico: {
      nome: "Classic",
      descrizione: "The balanced economy the game is tuned against.",
    },
    roma: {
      nome: "Rome, Italy",
      descrizione: "Real prices, rents, salaries and rates from the capital.",
    },
  },

  comune: {
    chiudi: "Close",
    avanti: "Continue",
    annulla: "Cancel",
    tu: "you",
    alTavolo: "At the table",
    caricamento: "One moment…",
  },
};
