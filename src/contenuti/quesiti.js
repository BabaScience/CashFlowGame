/**
 * I QUESITI.
 *
 * Una posizione, una domanda, trenta secondi. È l'equivalente degli esercizi
 * tattici di una scacchiera: brevi abbastanza da farne cinque in fila,
 * difficili abbastanza da sbagliarne qualcuno.
 *
 * Valgono le stesse regole delle lezioni (vedi lezioni.js): si insegna a
 * fare un CALCOLO, mai a comprare qualcosa. Ogni quesito ha una risposta
 * giusta perché i numeri la determinano, non perché lo diciamo noi — ed è
 * proprio questa la differenza fra didattica e consulenza.
 *
 * La spiegazione conta più della risposta. Chi indovina senza capire non ha
 * imparato niente, quindi si mostra sempre il conto, anche a chi ha
 * risposto bene.
 */
import { rataMutuo } from "../game/mercati/roma/derivazione.js";
import { numero } from "../game/finanze.js";
import { CREDITO } from "../game/mercati/roma/fonti.js";

const eur = (n) => `${numero(n)} €`;

export const QUESITI = [
  {
    id: "q1",
    titolo: "Due bilocali",
    domanda:
      "Due appartamenti, stesso canone di 700 € al mese. Il primo costa 140.000 €, " +
      "il secondo 210.000 €. Quale ha il rendimento lordo più alto?",
    opzioni: [
      { id: "a", testo: "Quello da 140.000 €" },
      { id: "b", testo: "Quello da 210.000 €" },
      { id: "c", testo: "Uguale: il canone è lo stesso" },
    ],
    giusta: "a",
    spiegazione:
      "Il rendimento è canone annuo diviso prezzo. 8.400 € su 140.000 € fanno il 6,0%; " +
      "gli stessi 8.400 € su 210.000 € fanno il 4,0%. A parità di canone, chi paga meno " +
      "rende di più — che è il motivo per cui il prezzo di acquisto conta quanto l'affitto.",
    lezione: "lordo-netto",
  },

  {
    id: "q2",
    titolo: "Il canone non è il flusso",
    domanda:
      "Un appartamento rende 900 € di canone al mese. La rata del mutuo è 620 €, le " +
      "imposte e le spese si mangiano il 28% del canone. Quanto resta ogni mese?",
    opzioni: [
      { id: "a", testo: "280 €" },
      { id: "b", testo: "28 €" },
      { id: "c", testo: "900 €, la rata la paga l'inquilino" },
    ],
    giusta: "b",
    spiegazione:
      "900 meno il 28% fa 648. Meno la rata di 620 restano 28 € al mese. È l'errore più " +
      "comune di chi compra la prima volta: sottrarre la rata al canone e fermarsi lì, " +
      "dimenticando imposte, condominio e sfitto. Il margine vero era dieci volte più " +
      "sottile di quello immaginato.",
    lezione: "lordo-netto",
  },

  {
    id: "q3",
    titolo: "Quanto serve davvero",
    domanda:
      "Un immobile da 180.000 €, mutuo all'80%. Contando imposta di registro, notaio e " +
      "agenzia, quanto serve avere in contanti, all'incirca?",
    opzioni: [
      { id: "a", testo: "36.000 €: il 20% e basta" },
      { id: "b", testo: "Circa 55.000 €" },
      { id: "c", testo: "180.000 €" },
    ],
    giusta: "b",
    spiegazione:
      "Il 20% sono 36.000 €, ma sopra ci vanno l'imposta di registro sulla seconda casa, " +
      "il notaio e la provvigione dell'agenzia: fra i quindici e i venti mila euro in più. " +
      "Sono soldi che non tornano e non diventano valore dell'immobile. Chi calcola solo " +
      "l'anticipo scopre la differenza al rogito.",
    lezione: "costi-acquisto",
  },

  {
    id: "q4",
    titolo: "Il primo anno di rata",
    domanda: () => {
      const rata = rataMutuo(160000, CREDITO.taeg, CREDITO.anni);
      return `Mutuo da 160.000 € al ${(CREDITO.taeg * 100).toFixed(1)}% per ` +
        `${CREDITO.anni} anni: la rata è circa ${eur(rata)}. Dopo il primo anno, ` +
        "quanto è sceso il debito?";
    },
    opzioni: [
      { id: "a", testo: "Di circa 10.000 €" },
      { id: "b", testo: "Di circa 4.000 €" },
      { id: "c", testo: "Di circa 800 €" },
    ],
    giusta: "b",
    spiegazione: () => {
      const rata = rataMutuo(160000, CREDITO.taeg, CREDITO.anni);
      const versato = rata * 12;
      const interessi = 160000 * CREDITO.taeg;
      return `Nel primo anno versi circa ${eur(versato)}, ma quasi ` +
        `${eur(interessi)} sono interessi: il debito scende di poco più di ` +
        `${eur(versato - interessi)}. Nei mutui la quota di capitale cresce col tempo, ` +
        "quindi all'inizio si paga soprattutto per il privilegio di avere i soldi. " +
        "È il motivo per cui rivendere dopo pochi anni lascia quasi tutto il debito in piedi.";
    },
    lezione: "rata",
  },

  {
    id: "q5",
    titolo: "Leva con margine sottile",
    domanda:
      "Un affare rende il 5% lordo l'anno. Il debito per comprarlo costa il 4,5%. " +
      "Che cosa succede se il canone cala del 10%?",
    opzioni: [
      { id: "a", testo: "Il margine si riduce un po', resta positivo" },
      { id: "b", testo: "Il margine diventa negativo: ci metti soldi ogni mese" },
      { id: "c", testo: "Non cambia niente: la rata è fissa" },
    ],
    giusta: "b",
    spiegazione:
      "Un calo del 10% porta il rendimento dal 5,0% al 4,5%, cioè esattamente al costo " +
      "del debito — e sopra ci sono ancora imposte e spese, quindi il saldo va sotto zero. " +
      "Quando il margine fra rendimento e costo del debito è mezzo punto, basta uno " +
      "scossone piccolo per girare il segno. La leva non crea il problema: lo moltiplica.",
    lezione: "leva",
  },

  {
    id: "q6",
    titolo: "Concordato o libero",
    domanda:
      "Canone libero: 800 € al mese, cedolare al 21%. Canone concordato: 680 € al mese, " +
      "cedolare al 10%. Quale lascia più soldi in tasca?",
    opzioni: [
      { id: "a", testo: "Il libero: 632 € contro 612 €" },
      { id: "b", testo: "Il concordato: sempre, per via dell'aliquota" },
      { id: "c", testo: "Sono identici" },
    ],
    giusta: "a",
    spiegazione:
      "800 meno il 21% fa 632. 680 meno il 10% fa 612. Qui vince il libero per venti euro. " +
      "Ma basta che il concordato di quel comune sia un po' più alto, o il libero un po' " +
      "più basso, e si gira. La lezione non è quale scegliere: è che va calcolato ogni " +
      "volta, con i numeri di quel contratto, invece di dare per scontata la risposta.",
    lezione: "cedolare",
  },

  {
    id: "q7",
    titolo: "La casa in cui vivi",
    domanda:
      "Compri la casa dove abiterai. Nel conto economico di questo gioco, che cos'è?",
    opzioni: [
      { id: "a", testo: "Un attivo: vale molto e rivaluta" },
      { id: "b", testo: "Una spesa: ogni mese toglie soldi e non ne porta" },
      { id: "c", testo: "Né l'uno né l'altra: è neutra" },
    ],
    giusta: "b",
    spiegazione:
      "Rata, utenze, manutenzione e imposte escono ogni mese; non entra niente. Per la " +
      "definizione usata qui — conta la direzione in cui si muovono i soldi — è una spesa. " +
      "Il che non significa che sia un errore comprarla: significa solo sapere in quale " +
      "colonna sta, e non contarla fra le cose che ti porteranno fuori dalla Ruota.",
    lezione: "attivo-passivo",
  },

  {
    id: "q8",
    titolo: "Il box e l'appartamento",
    domanda:
      "Un box auto da 32.000 € si affitta a 230 € al mese. Un bilocale da 160.000 € si " +
      "affitta a 800 €. Quale rende di più in percentuale?",
    opzioni: [
      { id: "a", testo: "Il bilocale" },
      { id: "b", testo: "Il box auto" },
      { id: "c", testo: "Uguali" },
    ],
    giusta: "b",
    spiegazione:
      "Il box fa 2.760 € l'anno su 32.000 €, cioè l'8,6%. Il bilocale fa 9.600 € su " +
      "160.000 €, cioè il 6,0%. I box rendono più degli appartamenti quasi ovunque, non " +
      "hanno inquilini da inseguire e non hanno caldaie che si rompono — e quasi nessuno " +
      "li considera, perché non si raccontano bene a cena.",
    lezione: "centro-periferia",
  },

  {
    id: "q9",
    titolo: "Stipendio alto, uscita lenta",
    domanda:
      "Due giocatori: uno guadagna 5.700 € al mese con 2.780 € di spese, l'altro 2.250 € " +
      "con 1.240 € di spese. Chi ha bisogno di meno rendita per uscire dalla Ruota?",
    opzioni: [
      { id: "a", testo: "Chi guadagna 5.700 €" },
      { id: "b", testo: "Chi guadagna 2.250 €" },
      { id: "c", testo: "Serve la stessa rendita a entrambi" },
    ],
    giusta: "b",
    spiegazione:
      "Per uscire serve una rendita che copra le SPESE, non che eguagli lo stipendio. " +
      "Al primo servono 2.780 € al mese, al secondo 1.240 €: meno della metà. È il " +
      "motivo per cui in questo gioco la scheda con il reddito più alto non è quella che " +
      "esce prima — il reddito alto porta con sé spese alte, e alza l'asticella che devi " +
      "superare.",
    lezione: "conto-economico",
  },

  {
    id: "q10",
    titolo: "Rendita o guadagno",
    domanda:
      "Compri un terreno a 22.000 € e lo rivendi a 50.000 €. Nel gioco, che cosa cambia " +
      "nella tua rendita mensile?",
    opzioni: [
      { id: "a", testo: "Sale di 28.000 € una volta" },
      { id: "b", testo: "Non cambia niente: la rendita resta quella di prima" },
      { id: "c", testo: "Sale di circa 230 € al mese" },
    ],
    giusta: "b",
    spiegazione:
      "Ventottomila euro di guadagno sono un incasso, non una rendita: aumentano i " +
      "contanti, non il flusso mensile. Servono a comprare qualcosa che poi produca " +
      "rendita, ma da soli non ti avvicinano di un centimetro all'uscita. È la stessa " +
      "distinzione fra vendere una casa e affittarla.",
    lezione: "rendita",
  },
];

/** Il testo di un campo che può essere una funzione calcolata. */
export const testoDi = (v) => (typeof v === "function" ? v() : v);

/** Un quesito diverso ogni giorno, uguale per tutti. */
export function quesitoDelGiorno(giorno = new Date().toISOString().slice(0, 10)) {
  let h = 0;
  for (let i = 0; i < giorno.length; i++) h = (h * 31 + giorno.charCodeAt(i)) >>> 0;
  return QUESITI[h % QUESITI.length];
}
