/**
 * LE TREDICI PROFESSIONI DI ROMA.
 *
 * Importi NETTI mensili di UNA PERSONA SOLA. Non RAL, non reddito di nucleo.
 *
 * ═══ PERCHÉ UNA PERSONA SOLA ═══
 *
 * Ci sono passate tutte e due le strade. Prima le spese erano di una famiglia
 * accostate allo stipendio di un individuo, e i margini venivano da 145 € al
 * mese: il gioco era una macina. Poi lo stipendio è diventato di nucleo per
 * pareggiare i conti, e la scheda ha cominciato a dire che un insegnante a
 * Roma prende 2.550 € al mese, che non è vero.
 *
 * La terza strada è l'unica onesta: una persona sola, con il suo stipendio
 * vero e le SUE spese. Chi vive da solo a Roma non paga l'affitto di una
 * famiglia — condivide, o prende un monolocale — e non ha le utenze, la
 * spesa e l'auto di quattro persone.
 *
 * Coniuge e figli arriveranno, ma come cosa modellata per davvero: due
 * redditi che possono sparire uno per volta, l'assegno unico, il costo vero
 * di un bambino. Fino ad allora è meglio simulare bene una vita che
 * simulare male due.
 *
 * ═══ DA DOVE VENGONO I NUMERI ═══
 *
 * Stipendi: rilevazioni 2026 sulle retribuzioni italiane, riportate al netto
 * mensile su tredici mensilità. Un insegnante prende circa 1.650 €, un
 * infermiere 1.750, un ingegnere 2.250, un avvocato 2.600.
 *
 * Casa: dalle quotazioni di `fonti.js`, non inventata. Un monolocale di
 * 40 m² costa da 520 € a Tor Bella Monaca a 960 € a Prati; una stanza in
 * condivisione poco più della metà. Chi guadagna meno condivide o sta in
 * periferia, chi guadagna di più ha un bilocale suo e più centrale — che è
 * quello che succede.
 *
 * Le altre voci — utenze, spesa, trasporti — sono di una persona sola e
 * salgono con il tenore di vita, non con il numero di persone.
 *
 * La cosa importante non sono i valori assoluti ma il rapporto fra reddito e
 * spese: a Roma, da soli, il margine è stretto per quasi tutti, e il gioco
 * deve farlo sentire senza renderlo impossibile.
 *
 * Ogni scheda è verificata dai test: somma delle spese = speseTotali, e
 * stipendio − spese = flusso dichiarato.
 */

/** Costruisce una scheda e ne calcola le voci derivate. */
const scheda = (id, nome, emoji, stipendio, risparmi, perFiglio, spese, passivita) => ({
  id, nome, emoji, stipendio, risparmi, perFiglio, spese, passivita,
});

export const PROFESSIONI = [
  scheda("pilota", "Pilota di linea", "✈️", 4200, 12600, 235,
    { casa: 1300, tasse: 0, prestitoStudio: 240, auto: 300, cartaCredito: 140, utenze: 140, vita: 700 },
    { mutuo: 265000, prestitoStudio: 19000, auto: 14000, cartaCredito: 4000 }),

  scheda("dirigente-medico", "Dirigente medico", "🩺", 3400, 10200, 175,
    { casa: 1050, tasse: 0, prestitoStudio: 180, auto: 260, cartaCredito: 120, utenze: 130, vita: 620 },
    { mutuo: 235000, prestitoStudio: 14000, auto: 12000, cartaCredito: 3500 }),

  scheda("quadro", "Quadro d'azienda", "📊", 2700, 8100, 140,
    { casa: 830, tasse: 0, prestitoStudio: 110, auto: 220, cartaCredito: 100, utenze: 110, vita: 500 },
    { mutuo: 192000, prestitoStudio: 8000, auto: 11000, cartaCredito: 3000 }),

  scheda("avvocato", "Avvocato", "⚖️", 2600, 7800, 125,
    { casa: 820, tasse: 0, prestitoStudio: 150, auto: 200, cartaCredito: 100, utenze: 110, vita: 490 },
    { mutuo: 198000, prestitoStudio: 11000, auto: 10000, cartaCredito: 3000 }),

  scheda("ingegnere", "Ingegnere", "⚙️", 2250, 6800, 100,
    { casa: 720, tasse: 0, prestitoStudio: 130, auto: 180, cartaCredito: 90, utenze: 100, vita: 440 },
    { mutuo: 178000, prestitoStudio: 10000, auto: 9000, cartaCredito: 2800 }),

  scheda("architetto", "Architetto", "📐", 1900, 5700, 70,
    { casa: 640, tasse: 0, prestitoStudio: 120, auto: 70, cartaCredito: 80, utenze: 95, vita: 390 },
    { mutuo: 165000, prestitoStudio: 9000, auto: 8000, cartaCredito: 2500 }),

  scheda("autotrasportatore", "Autotrasportatore", "🚚", 1800, 5400, 80,
    { casa: 590, tasse: 0, prestitoStudio: 40, auto: 60, cartaCredito: 75, utenze: 92, vita: 380 },
    { mutuo: 132000, prestitoStudio: 2500, auto: 8500, cartaCredito: 2000 }),

  scheda("infermiere", "Infermiere", "💉", 1750, 5200, 75,
    { casa: 580, tasse: 0, prestitoStudio: 60, auto: 55, cartaCredito: 72, utenze: 90, vita: 370 },
    { mutuo: 142000, prestitoStudio: 4500, auto: 7000, cartaCredito: 1900 }),

  scheda("agente", "Agente di polizia", "🚓", 1700, 5100, 75,
    { casa: 565, tasse: 0, prestitoStudio: 45, auto: 55, cartaCredito: 70, utenze: 88, vita: 360 },
    { mutuo: 138000, prestitoStudio: 3500, auto: 6800, cartaCredito: 1800 }),

  scheda("meccanico", "Meccanico", "🔧", 1700, 5100, 75,
    { casa: 560, tasse: 0, prestitoStudio: 30, auto: 60, cartaCredito: 70, utenze: 88, vita: 360 },
    { mutuo: 128000, prestitoStudio: 1800, auto: 7500, cartaCredito: 1800 }),

  scheda("insegnante", "Insegnante", "📚", 1650, 5000, 70,
    { casa: 545, tasse: 0, prestitoStudio: 60, auto: 50, cartaCredito: 68, utenze: 86, vita: 350 },
    { mutuo: 138000, prestitoStudio: 4500, auto: 6000, cartaCredito: 1800 }),

  scheda("impiegato", "Impiegato amministrativo", "🗂️", 1550, 4600, 65,
    { casa: 455, tasse: 0, prestitoStudio: 45, auto: 48, cartaCredito: 64, utenze: 83, vita: 330 },
    { mutuo: 124000, prestitoStudio: 3200, auto: 5500, cartaCredito: 1600 }),

  scheda("operatore", "Operatore ecologico", "🧹", 1500, 4500, 70,
    { casa: 435, tasse: 0, prestitoStudio: 25, auto: 45, cartaCredito: 62, utenze: 80, vita: 320 },
    { mutuo: 118000, prestitoStudio: 1500, auto: 5200, cartaCredito: 1500 }),
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
