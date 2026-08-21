/**
 * LE DODICI PROFESSIONI DI ROMA.
 *
 * Importi NETTI mensili. Lo stipendio è quello VERO della professione, per
 * una persona sola; il secondo reddito è dichiarato a parte.
 *
 * Prima erano fusi in un numero solo, di nucleo, e la scheda lo chiamava
 * "Stipendio": chi leggeva "Insegnante · 2.550 €" credeva che un insegnante
 * a Roma prendesse 2.550 € al mese, e non è vero — ne prende circa 1.650.
 * Un gioco che vuole insegnare come funziona il mondo non può cominciare
 * mentendo sulla prima riga della scheda.
 *
 * La distinzione conta, e ci è costata una diagnosi: le spese della scheda
 * — affitto, utenze, auto, spesa — sono di una famiglia, quindi accostarle
 * al reddito di una persona sola lasciava margini da 145 € al mese e rendeva
 * il gioco una macina. In Italia un nucleo ha in media circa un percettore e
 * mezzo, e quel mezzo adesso è una riga sua invece di essere nascosto dentro
 * lo stipendio. La professione indicata è quella principale. Le fasce vengono
 * dal Salary Outlook di JobPricing (RAL media nel privato 32.991 €, Lazio
 * 32.220 €) riportate al netto, e dalle tabelle contrattuali per il pubblico
 * impiego.
 *
 * Le spese sono costruite su Roma, non su una città media:
 *  - la casa è la voce che schiaccia tutto. Il canone medio comunale è di
 *    19,8 €/m² al mese, cioè circa 1.000 € per cinquanta metri quadri;
 *  - chi guadagna di più ha comprato, e paga una rata invece di un affitto,
 *    ma su un immobile più grande e più centrale;
 *  - trasporti, spesa, utenze e sanità integrativa seguono la fascia.
 *
 * La cosa importante non sono i valori assoluti ma il rapporto fra reddito
 * e spese: a Roma il divario fra il netto e il costo del vivere è stretto
 * per quasi tutti, e il gioco deve farlo sentire.
 *
 * Ogni scheda è verificata dai test: somma delle spese = speseTotali, e
 * stipendio − spese = flusso dichiarato.
 */

/** Costruisce una scheda e ne calcola le voci derivate. */
const scheda = (id, nome, emoji, stipendio, secondoReddito, risparmi, perFiglio, spese, passivita) => ({
  id, nome, emoji, stipendio, secondoReddito, risparmi, perFiglio, spese, passivita,
});

export const PROFESSIONI = [
  scheda("dirigente-medico", "Dirigente medico", "🩺", 3400, 2300, 9100, 530,
    { casa: 1150, tasse: 0, prestitoStudio: 180, auto: 260, cartaCredito: 120, utenze: 210, vita: 860 },
    { mutuo: 235000, prestitoStudio: 14000, auto: 12000, cartaCredito: 3500 }),

  scheda("pilota", "Pilota di linea", "✈️", 4200, 2100, 10100, 560,
    { casa: 1300, tasse: 0, prestitoStudio: 240, auto: 300, cartaCredito: 140, utenze: 220, vita: 970 },
    { mutuo: 265000, prestitoStudio: 19000, auto: 14000, cartaCredito: 4000 }),

  scheda("avvocato", "Avvocato", "⚖️", 2600, 1750, 7000, 370,
    { casa: 980, tasse: 0, prestitoStudio: 150, auto: 220, cartaCredito: 110, utenze: 180, vita: 670 },
    { mutuo: 198000, prestitoStudio: 11000, auto: 10000, cartaCredito: 3000 }),

  scheda("architetto", "Architetto", "📐", 1900, 1250, 5000, 230,
    { casa: 820, tasse: 0, prestitoStudio: 120, auto: 180, cartaCredito: 90, utenze: 160, vita: 500 },
    { mutuo: 165000, prestitoStudio: 9000, auto: 8000, cartaCredito: 2500 }),

  /* Ingegnere: 35.000–42.000 € di RAL secondo le rilevazioni 2026, cioè
     circa 2.250 € netti al mese. Sta fra l'architetto e il quadro, ed è la
     professione che più spesso chiede "quanto guadagno davvero". */
  scheda("ingegnere", "Ingegnere", "⚙️", 2250, 1200, 5600, 260,
    { casa: 880, tasse: 0, prestitoStudio: 130, auto: 200, cartaCredito: 95, utenze: 170, vita: 545 },
    { mutuo: 178000, prestitoStudio: 10000, auto: 9000, cartaCredito: 2800 }),

  scheda("quadro", "Quadro d'azienda", "📊", 2700, 1400, 6600, 340,
    { casa: 950, tasse: 0, prestitoStudio: 110, auto: 240, cartaCredito: 110, utenze: 180, vita: 640 },
    { mutuo: 192000, prestitoStudio: 8000, auto: 11000, cartaCredito: 3000 }),

  scheda("insegnante", "Insegnante", "📚", 1650, 900, 4100, 190,
    { casa: 700, tasse: 0, prestitoStudio: 60, auto: 130, cartaCredito: 70, utenze: 140, vita: 400 },
    { mutuo: 138000, prestitoStudio: 4500, auto: 6000, cartaCredito: 1800 }),

  scheda("infermiere", "Infermiere", "💉", 1750, 850, 4200, 190,
    { casa: 700, tasse: 0, prestitoStudio: 60, auto: 130, cartaCredito: 70, utenze: 140, vita: 420 },
    { mutuo: 138000, prestitoStudio: 4500, auto: 6000, cartaCredito: 1800 }),

  scheda("agente", "Agente di polizia", "🚓", 1700, 900, 4200, 210,
    { casa: 690, tasse: 0, prestitoStudio: 0, auto: 140, cartaCredito: 70, utenze: 140, vita: 420 },
    { mutuo: 135000, prestitoStudio: 0, auto: 6500, cartaCredito: 1800 }),

  scheda("autotrasportatore", "Autotrasportatore", "🚚", 1800, 900, 4300, 220,
    { casa: 660, tasse: 0, prestitoStudio: 0, auto: 170, cartaCredito: 70, utenze: 140, vita: 440 },
    { mutuo: 128000, prestitoStudio: 0, auto: 8000, cartaCredito: 1800 }),

  scheda("impiegato", "Impiegato amministrativo", "🗂️", 1550, 850, 3800, 180,
    { casa: 660, tasse: 0, prestitoStudio: 50, auto: 110, cartaCredito: 70, utenze: 135, vita: 380 },
    { mutuo: 128000, prestitoStudio: 3500, auto: 5000, cartaCredito: 1700 }),

  scheda("meccanico", "Meccanico", "🔧", 1700, 800, 4000, 200,
    { casa: 640, tasse: 0, prestitoStudio: 0, auto: 120, cartaCredito: 70, utenze: 135, vita: 400 },
    { mutuo: 124000, prestitoStudio: 0, auto: 5500, cartaCredito: 1700 }),

  scheda("operatore", "Operatore ecologico", "🧹", 1500, 750, 3600, 180,
    { casa: 600, tasse: 0, prestitoStudio: 0, auto: 100, cartaCredito: 60, utenze: 130, vita: 350 },
    { mutuo: 116000, prestitoStudio: 0, auto: 4500, cartaCredito: 1500 }),
];

/**
 * Le voci del conto economico, in italiano corrente.
 * "Tasse" resta a zero perché gli stipendi sono già netti: la voce esiste
 * per il Livello 2, dove le imposte sulla rendita compariranno davvero.
 */
export const ETICHETTE_SPESE = {
  casa: "Mutuo o affitto",
  tasse: "Imposte sulla rendita",
  prestitoStudio: "Prestito studi",
  auto: "Auto e trasporti",
  cartaCredito: "Carta di credito",
  utenze: "Utenze e telefonia",
  vita: "Spesa, salute, tempo libero",
};

export const ETICHETTE_PASSIVITA = {
  mutuo: "Mutuo sulla casa",
  prestitoStudio: "Prestito studi",
  auto: "Finanziamento auto",
  cartaCredito: "Carta di credito",
  prestitoBanca: "Fido bancario",
};

/**
 * Che cosa si può estinguere.
 * Utenze e spese di vita non si estinguono: si riducono, ma non spariscono,
 * ed è una distinzione che vale la pena far percepire.
 */
export const DEBITI_ESTINGUIBILI = [
  { chiave: "mutuo", spesa: "casa", nome: "Mutuo sulla casa" },
  { chiave: "prestitoStudio", spesa: "prestitoStudio", nome: "Prestito studi" },
  { chiave: "auto", spesa: "auto", nome: "Finanziamento auto", dimezzabileInBancarotta: true },
  { chiave: "cartaCredito", spesa: "cartaCredito", nome: "Carta di credito", dimezzabileInBancarotta: true },
];
