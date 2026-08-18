/**
 * Dati della Corsia Veloce (Fast Track).
 *
 * AFFARI (caselle verdi): ogni casella è un investimento unico. Chi ci atterra
 * può comprarlo pagando l'acconto; da quel momento non è più disponibile per
 * gli altri e aggiunge il suo flusso al Reddito del Giorno del Cashflow.
 *
 * SOGNI (caselle rosa): l'obiettivo personale scelto a inizio partita.
 * Comprare il proprio sogno fa vincere la partita all'istante.
 */

export const AFFARI_VELOCI = [
  { id: "av01", nome: "Piantagione di caffè in Brasile", acconto: 250000, flusso: 30000, testo: "600 ettari già produttivi, con contratti di fornitura pluriennali." },
  { id: "av02", nome: "Compagnia di navigazione", acconto: 300000, flusso: 35000, testo: "Quattro navi cargo su rotte asiatiche consolidate." },
  { id: "av03", nome: "Centro commerciale", acconto: 400000, flusso: 50000, testo: "Quaranta negozi, occupazione al 95%, gestione esternalizzata." },
  { id: "av04", nome: "Miniera d'oro", acconto: 350000, flusso: 40000, testo: "Giacimento certificato, concessione ventennale." },
  { id: "av05", nome: "Catena di alberghi", acconto: 320000, flusso: 38000, testo: "Otto strutture in località turistiche di primo livello." },
  { id: "av06", nome: "Squadra sportiva professionistica", acconto: 500000, flusso: 60000, testo: "Diritti televisivi e merchandising inclusi nell'operazione." },
  { id: "av07", nome: "Rete di data center", acconto: 450000, flusso: 55000, testo: "Tre poli in Europa affittati a operatori cloud." },
  { id: "av08", nome: "Studio cinematografico", acconto: 280000, flusso: 30000, testo: "Catalogo di 90 titoli con ricavi ricorrenti da licenze." },
  { id: "av09", nome: "Parco eolico", acconto: 380000, flusso: 45000, testo: "Quaranta turbine con incentivi garantiti per vent'anni." },
  { id: "av10", nome: "Compagnia aerea regionale", acconto: 420000, flusso: 48000, testo: "Dodici aeromobili e slot aeroportuali di valore." },
  { id: "av11", nome: "Rete di cliniche private", acconto: 260000, flusso: 28000, testo: "Sei poliambulatori con convenzioni assicurative." },
  { id: "av12", nome: "Fondo immobiliare urbano", acconto: 200000, flusso: 22000, testo: "Portafoglio di 200 appartamenti in tre capitali europee." },
  { id: "av13", nome: "Catena di ristoranti", acconto: 180000, flusso: 20000, testo: "Quindici locali con format collaudato e cucina centralizzata." },
  { id: "av14", nome: "Società di software gestionale", acconto: 150000, flusso: 18000, testo: "Abbonamenti annuali da 400 aziende clienti." },
  { id: "av15", nome: "Porto turistico", acconto: 340000, flusso: 36000, testo: "300 posti barca con lista d'attesa." },
  { id: "av16", nome: "Rete di torri per telecomunicazioni", acconto: 290000, flusso: 33000, testo: "Affittate a tre operatori con contratti ventennali." },
  { id: "av17", nome: "Fabbrica di batterie", acconto: 360000, flusso: 42000, testo: "Impianto automatizzato con ordini già in portafoglio." },
  { id: "av18", nome: "Catena di palestre", acconto: 160000, flusso: 17000, testo: "Venti club urbani in abbonamento mensile." },
  { id: "av19", nome: "Vigneto e cantina", acconto: 220000, flusso: 24000, testo: "Etichetta premiata, export in trenta paesi." },
  { id: "av20", nome: "Piattaforma logistica dell'ultimo miglio", acconto: 310000, flusso: 34000, testo: "Magazzini automatizzati in sei città." },
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
export const getAffareVeloce = (id) => AFFARI_VELOCI.find((a) => a.id === id);
