/**
 * Rome, en français.
 *
 * Seuls les mots changent. Les prix, les loyers, les salaires et les taux
 * restent romains et restent en euros : un marché est son marché, quelle
 * que soit la langue dans laquelle on le lit.
 *
 * Les noms de lieux ne se traduisent pas — Prati reste Prati, Trastevere
 * reste Trastevere — parce que c'est ainsi qu'on les dit, et qu'« un
 * deux-pièces aux Prés » ne voudrait rien dire. Ce qui se traduit, c'est la
 * nature de la chose : un *bilocale* est un deux-pièces, un *box auto* est
 * un garage fermé, un *stabile* est un immeuble de rapport.
 */
export default {
  professioni: {
    "dirigente-medico": { nome: "Médecin hospitalier" },
    pilota: { nome: "Pilote de ligne" },
    quadro: { nome: "Cadre d'entreprise" },
    avvocato: { nome: "Avocat" },
    ingegnere: { nome: "Ingénieur" },
    architetto: { nome: "Architecte" },
    autotrasportatore: { nome: "Routier" },
    infermiere: { nome: "Infirmier" },
    agente: { nome: "Policier" },
    meccanico: { nome: "Mécanicien" },
    insegnante: { nome: "Enseignant" },
    impiegato: { nome: "Employé de bureau" },
    operatore: { nome: "Éboueur" },
  },

  sogni: {
    sg01: { nome: "Faire le tour du monde, sans se presser" },
    sg02: { nome: "Construire une école au village de vos parents" },
    sg03: { nome: "Une maison face à la mer en Sardaigne" },
    sg04: { nome: "Ouvrir le restaurant dont vous rêvez depuis des années" },
    sg05: { nome: "Créer une association et la financer dix ans" },
    sg06: { nome: "Une expédition dans l'Himalaya" },
    sg07: { nome: "Un voilier de quinze mètres" },
    sg08: { nome: "Une année sabbatique pour toute la famille" },
    sg09: { nome: "Financer dix jeunes entreprises" },
    sg10: { nome: "Acheter et restaurer une ferme en Ombrie" },
    sg11: { nome: "Payer les études de tous vos petits-enfants" },
    sg12: { nome: "Un refuge en montagne, rien qu'à vous" },
  },

  etichetteSpese: {
    casa: "Prêt ou loyer",
    tasse: "Impôt sur les loyers",
    prestitoStudio: "Prêt étudiant",
    auto: "Voiture et transports",
    cartaCredito: "Carte de crédit",
    utenze: "Charges et téléphone",
    vita: "Courses, santé, loisirs",
  },

  etichettePassivita: {
    mutuo: "Prêt immobilier",
    prestitoStudio: "Prêt étudiant",
    auto: "Crédit auto",
    cartaCredito: "Carte de crédit",
    prestitoBanca: "Découvert bancaire",
  },

  professionisti: {
    commercialista: { nome: "Expert-comptable" },
    avvocato: { nome: "Avocat" },
  },

  /* Les cartes s'ajoutent ici, clé par clé. */
  carte: {},
};
