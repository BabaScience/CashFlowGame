/**
 * Dati del Largo (percorso esterno).
 *
 * AFFARI (caselle verdi): ogni casella è un investimento unico. Chi ci atterra
 * può comprarlo pagando l'acconto; da quel momento non è più disponibile per
 * gli altri ed entra nel suo portafoglio come qualunque altra attività.
 *
 * ═══ RIPREZZATI ═══
 *
 * Costavano 250.000–500.000 e rendevano il 140-150% l'anno. Erano numeri
 * sensati finché uscire dalla Ruota moltiplicava tutto per cento: si
 * incassava mezzo milione a ogni Giorno di Rendita e li si comprava a
 * manciate. Con la continuità — sul Largo si vive del flusso vero — quelle
 * cifre erano irraggiungibili e quelle rese assurde.
 * Ora stanno sulla stessa economia della Ruota, che nel mercato classico
 * rende intorno al 50% l'anno sul capitale versato: acconti da 55.000 a
 * 110.000 e rese intorno al 40%.
 *
 * SOGNI (caselle rosa): l'obiettivo personale scelto a inizio partita.
 * Comprare il proprio sogno fa vincere la partita all'istante.
 */

export const AFFARI_LARGO = [
  { id: "av01", nome: "Piantagione di caffè in Brasile", acconto: 41000, flusso: 1350, testo: "600 ettari già produttivi, con contratti di fornitura pluriennali." },
  { id: "av02", nome: "Compagnia di navigazione", acconto: 50000, flusso: 1650, testo: "Quattro navi cargo su rotte asiatiche consolidate." },
  { id: "av03", nome: "Centro commerciale", acconto: 66000, flusso: 2200, testo: "Quaranta negozi, occupazione al 95%, gestione esternalizzata." },
  { id: "av04", nome: "Miniera d'oro", acconto: 58000, flusso: 1950, testo: "Giacimento certificato, concessione ventennale." },
  { id: "av05", nome: "Catena di alberghi", acconto: 52000, flusso: 1750, testo: "Otto strutture in località turistiche di primo livello." },
  { id: "av06", nome: "Squadra sportiva professionistica", acconto: 82000, flusso: 2750, testo: "Diritti televisivi e merchandising inclusi nell'operazione." },
  { id: "av07", nome: "Rete di data center", acconto: 74000, flusso: 2450, testo: "Tre poli in Europa affittati a operatori cloud." },
  { id: "av08", nome: "Studio cinematografico", acconto: 46000, flusso: 1550, testo: "Catalogo di 90 titoli con ricavi ricorrenti da licenze." },
  { id: "av09", nome: "Parco eolico", acconto: 63000, flusso: 2100, testo: "Quaranta turbine con incentivi garantiti per vent'anni." },
  { id: "av10", nome: "Compagnia aerea regionale", acconto: 69000, flusso: 2300, testo: "Dodici aeromobili e slot aeroportuali di valore." },
  { id: "av11", nome: "Rete di cliniche private", acconto: 43000, flusso: 1450, testo: "Sei poliambulatori con convenzioni assicurative." },
  { id: "av12", nome: "Fondo immobiliare urbano", acconto: 33000, flusso: 1100, testo: "Portafoglio di 200 appartamenti in tre capitali europee." },
  { id: "av13", nome: "Catena di ristoranti", acconto: 30000, flusso: 1000, testo: "Quindici locali con format collaudato e cucina centralizzata." },
  { id: "av14", nome: "Società di software gestionale", acconto: 25000, flusso: 850, testo: "Abbonamenti annuali da 400 aziende clienti." },
  { id: "av15", nome: "Porto turistico", acconto: 56000, flusso: 1850, testo: "300 posti barca con lista d'attesa." },
  { id: "av16", nome: "Rete di torri per telecomunicazioni", acconto: 48000, flusso: 1600, testo: "Affittate a tre operatori con contratti ventennali." },
  { id: "av17", nome: "Fabbrica di batterie", acconto: 59000, flusso: 1950, testo: "Impianto automatizzato con ordini già in portafoglio." },
  { id: "av18", nome: "Catena di palestre", acconto: 26000, flusso: 850, testo: "Venti club urbani in abbonamento mensile." },
  { id: "av19", nome: "Vigneto e cantina", acconto: 36000, flusso: 1200, testo: "Etichetta premiata, export in trenta paesi." },
  { id: "av20", nome: "Piattaforma logistica dell'ultimo miglio", acconto: 51000, flusso: 1700, testo: "Magazzini automatizzati in sei città." },
];

export const SOGNI = [
  { id: "sg01", nome: "Fare il giro del mondo in prima classe", costo: 150000, emoji: "🌍" },
  { id: "sg02", nome: "Costruire una scuola nel tuo paese d'origine", costo: 200000, emoji: "🏫" },
  { id: "sg03", nome: "Casa sulla spiaggia ai Caraibi", costo: 300000, emoji: "🏝️" },
  { id: "sg04", nome: "Cenare con il capo di Stato", costo: 100000, emoji: "🍽️" },
  { id: "sg05", nome: "Fondare una organizzazione non profit", costo: 250000, emoji: "🤝" },
  { id: "sg06", nome: "Scalare l'Everest con una spedizione privata", costo: 120000, emoji: "🏔️" },
  { id: "sg07", nome: "Yacht di 30 metri", costo: 500000, emoji: "🛥️" },
  { id: "sg08", nome: "Un anno sabbatico per tutta la famiglia", costo: 100000, emoji: "🧳" },
  { id: "sg09", nome: "Finanziare dieci giovani imprese", costo: 400000, emoji: "🚀" },
  { id: "sg10", nome: "Correre la 24 Ore di Le Mans", costo: 350000, emoji: "🏎️" },
  { id: "sg11", nome: "Volo suborbitale nello spazio", costo: 600000, emoji: "🚀" },
  { id: "sg12", nome: "Rifugio privato sulle Alpi", costo: 180000, emoji: "🏂" },
];

export const getSogno = (id) => SOGNI.find((s) => s.id === id) || SOGNI[0];
export const getAffareVeloce = (id) => AFFARI_LARGO.find((a) => a.id === id);
