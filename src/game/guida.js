import { redditoPassivo, speseTotali, sogliaUscita, flussoMensile } from "./finanze.js";

/**
 * LA GUIDA DELLA PRIMA PARTITA.
 *
 * Non un giro di finestrelle prima di cominciare: una voce che dice una
 * cosa sola, nel momento in cui quella cosa succede davvero.
 *
 * ═══ PERCHÉ COSÌ ═══
 *
 * Il gioco è stato provato da amici senza spiegazioni, e la domanda è
 * sempre la stessa: «cos'è questo? non capisco niente». Sono tre domande
 * diverse messe insieme — *a che serve*, *cosa vogliono dire queste
 * parole*, *tocca a me e adesso che faccio* — e l'ultima non si può
 * rispondere prima: si risponde mentre uno sta decidendo.
 *
 * Il materiale per rispondere c'era già, tutto: quindici lezioni e
 * quaranta quesiti. Era dietro un menù che nessuno apre prima di giocare.
 *
 * ═══ COM'È FATTA ═══
 *
 * Un elenco di passi. Ogni passo ha una condizione che guarda lo stato
 * prima e dopo una mossa, e si dice una volta sola. Sono funzioni pure, il
 * che vuol dire che si possono provare senza disegnare niente — ed è
 * l'unico modo di sapere che la guida parla davvero quando serve, invece
 * di scoprirlo giocando.
 *
 * L'ordine è quello di lettura: vince il primo passo non ancora detto la
 * cui condizione è vera. Meglio restare zitti che dire due cose insieme.
 */

const g0 = (s) => s?.giocatori?.[0];

/**
 * La decisione in sospeso è di chi sta imparando?
 *
 * Da quando al tavolo c'è un avversario, `pending` può essere suo. Senza
 * questo controllo la guida spiegherebbe la carta del computer come se
 * fosse la tua — «guarda due numeri: costa 12.000 e rende 260» mentre tu
 * non hai niente da decidere — che è peggio del silenzio.
 */
const mia = (s) => Boolean(s?.pending) && s.pending.giocatoreId === g0(s)?.id;
const rendita = (s) => { const g = g0(s); return g ? redditoPassivo(g) : 0; };
const mesi = (s) => g0(s)?.mesi ?? 0;

/**
 * I passi, in ordine di priorità.
 *
 * `quando(prima, dopo)` — `prima` è lo stato prima dell'ultima mossa e può
 * mancare (al primo disegno). `valori(dopo, inValuta)` prepara i numeri da
 * infilare nella frase.
 */
export const PASSI = [
  {
    /* Prima di tutto: chi sei, quanto ti resta ogni mese, e cosa vuol
       dire muoversi.
       Erano due passi. Il secondo non arrivava mai: fra l'apertura e il
       primo tiro non succede niente, e la voce parla solo quando succede
       qualcosa. Chi apre la prima partita legge questa frase e basta, e
       deve bastare a far tirare il dado. */
    id: "chiSei",
    quando: () => true,
    valori: (s, inValuta) => ({ importo: inValuta(flussoMensile(g0(s))) }),
  },
  {
    /* C'è qualcuno dall'altra parte, e ha la tua stessa scheda. Si dice
       appena si muove: vedere una pedina che non è la tua muoversi da
       sola, senza sapere di chi sia, è la prima cosa che confonde. */
    id: "avversario",
    quando: (prima, dopo) => (dopo.giocatori?.[1]?.turniGiocati ?? 0) > 0,
    valori: (s) => ({ nome: s.giocatori[1]?.nome || "" }),
  },
  {
    /* La prima paga incassata: è la cosa che finanzia tutto. */
    id: "paga",
    quando: (prima, dopo) => prima && mesi(dopo) > mesi(prima),
    valori: (s, inValuta) => ({ importo: inValuta(flussoMensile(g0(s))) }),
  },
  {
    id: "taglia",
    quando: (prima, dopo) => mia(dopo) && dopo.pending.tipo === "sceltaTaglia",
  },
  {
    /* Una carta con una rendita dentro: qui si spiega cosa guardare. Non
       "compra", che sarebbe un consiglio: *cosa* guardare. */
    id: "carta",
    /* Su una carta che ci si può permettere. Spiegare come si legge un
       affare davanti a uno che costa quattro volte i contanti non insegna
       a scegliere: non c'è niente da scegliere. Di quello parla il passo
       sul prestito. */
    quando: (prima, dopo) => mia(dopo) && dopo.pending.tipo === "carta"
      && dopo.pending.carta?.flusso > 0
      && dopo.pending.carta?.acconto > 0
      && dopo.pending.carta.acconto <= (g0(dopo)?.contanti ?? 0),
    valori: (s, inValuta) => ({
      acconto: inValuta(s.pending.carta.acconto),
      flusso: inValuta(s.pending.carta.flusso),
    }),
  },
  {
    /* Il primo mattone. È il momento in cui il gioco diventa chiaro. */
    id: "primaRendita",
    quando: (prima, dopo) => prima && rendita(prima) === 0 && rendita(dopo) > 0,
    valori: (s, inValuta) => ({
      rendita: inValuta(rendita(s)),
      traguardo: inValuta(Math.round(sogliaUscita(g0(s)))),
    }),
  },
  {
    /* Le Spese Extra: non si rifiutano, e sono quello che rallenta. */
    id: "extra",
    quando: (prima, dopo) => mia(dopo) && dopo.pending.tipo === "extra",
  },
  {
    /* La chat. Si nomina dopo che si è capito il gioco: prima non c'è
       niente da dirsi. */
    id: "chat",
    quando: (prima, dopo) => (dopo.giocatori?.[1]?.turniGiocati ?? 0) >= 3,
    valori: (s) => ({ nome: s.giocatori[1]?.nome || "" }),
  },
  {
    /* A metà strada si guarda la barra e si dice cosa misura. */
    id: "barra",
    quando: (prima, dopo) => rendita(dopo) > 0 && mesi(dopo) >= 6,
    valori: (s, inValuta) => ({
      rendita: inValuta(rendita(s)),
      spese: inValuta(speseTotali(g0(s))),
      traguardo: inValuta(Math.round(sogliaUscita(g0(s)))),
    }),
  },
  {
    /* Il registro: si nomina quando ha qualcosa dentro da leggere. */
    id: "registro",
    quando: (prima, dopo) => (dopo.registro?.length ?? 0) >= 10,
    valori: (s) => ({ nome: s.giocatori[1]?.nome || "" }),
  },
  {
    /* La banca: compare solo se si è davvero a corto, altrimenti è una
       nozione in cerca di un momento. */
    id: "prestito",
    quando: (prima, dopo) => mia(dopo) && dopo.pending.tipo === "carta"
      && dopo.pending.carta?.acconto > (g0(dopo)?.contanti ?? 0),
  },
  {
    /* Le regole, per ultime: sono lì per chi le vuole, e nominarle
       all'inizio suona come «prima studia». */
    id: "regole",
    quando: (prima, dopo) => mesi(dopo) >= 4,
  },
];

/**
 * Il prossimo passo da dire, o `null`.
 *
 * `detti` è l'insieme degli id già mostrati: un passo si dice una volta e
 * poi tace per sempre, anche se la sua condizione torna vera.
 */
export function prossimoPasso(prima, dopo, detti) {
  if (!dopo || !g0(dopo)) return null;
  for (const passo of PASSI) {
    if (detti.has(passo.id)) continue;
    let vero = false;
    try { vero = Boolean(passo.quando(prima, dopo)); } catch { vero = false; }
    if (vero) return passo;
  }
  return null;
}

/** Quanti passi ha la guida: serve a dire «3 di 9» senza contarli a mano. */
export const QUANTI_PASSI = PASSI.length;
