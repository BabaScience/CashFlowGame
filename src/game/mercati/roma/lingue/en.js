/**
 * Rome, in English.
 *
 * Only the words change. Prices, rents, salaries and rates stay Roman and
 * stay in euros: a market is its market, whatever language you read it in.
 *
 * Place names are left alone — Prati is Prati, Trastevere is Trastevere —
 * because that is how anyone would say them, and because a "two-room flat
 * in the Meadows" would be nonsense. What gets translated is the type of
 * thing: *bilocale* is a one-bedroom flat, *box auto* is a lock-up garage,
 * *stabile* is an apartment block.
 */
export default {
  professioni: {
    "dirigente-medico": { nome: "Senior hospital doctor" },
    pilota: { nome: "Airline pilot" },
    quadro: { nome: "Middle manager" },
    avvocato: { nome: "Lawyer" },
    ingegnere: { nome: "Engineer" },
    architetto: { nome: "Architect" },
    autotrasportatore: { nome: "Lorry driver" },
    infermiere: { nome: "Nurse" },
    agente: { nome: "Police officer" },
    meccanico: { nome: "Mechanic" },
    insegnante: { nome: "Teacher" },
    impiegato: { nome: "Office clerk" },
    operatore: { nome: "Refuse collector" },
  },

  sogni: {
    sg01: { nome: "Travel the world, taking your time" },
    sg02: { nome: "Build a school in your family's village" },
    sg03: { nome: "A house facing the sea in Sardinia" },
    sg04: { nome: "Open the restaurant you have had in mind for years" },
    sg05: { nome: "Start a charity and fund it for ten years" },
    sg06: { nome: "An expedition to the Himalayas" },
    sg07: { nome: "A fifteen-metre sailing boat" },
    sg08: { nome: "A sabbatical year for the whole family" },
    sg09: { nome: "Back ten young businesses" },
    sg10: { nome: "Buy and restore a farmhouse in Umbria" },
    sg11: { nome: "Pay for every grandchild's education" },
    sg12: { nome: "A mountain refuge, all your own" },
  },

  etichetteSpese: {
    casa: "Mortgage or rent",
    tasse: "Tax on rental income",
    prestitoStudio: "Student loan",
    auto: "Car and transport",
    cartaCredito: "Credit card",
    utenze: "Utilities and phone",
    vita: "Food, health, leisure",
  },

  etichettePassivita: {
    mutuo: "Home mortgage",
    prestitoStudio: "Student loan",
    auto: "Car finance",
    cartaCredito: "Credit card",
    prestitoBanca: "Bank overdraft",
  },


  /* Le carte si aggiungono qui, chiave per chiave. */
  carte: {},
};
