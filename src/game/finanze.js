/**
 * Calcoli del Conto Economico / Stato Patrimoniale.
 * Una sola fonte di verità: sia il server sia l'interfaccia usano queste funzioni.
 */

/**
 * Tasso del fido bancario, al mese, quando il mercato non ne dichiara uno.
 * Il valore alto del pacchetto "classico" è una regola da gioco da tavolo:
 * il prestito serve a togliersi dai guai, non a finanziare una strategia.
 * I mercati reali dichiarano il proprio (vedi `tassoPrestito` nel pacchetto).
 */
export const TASSO_PRESTITO = 0.1;
export const MAX_FIGLI = 3;

/**
 * Arrotonda, trattando i valori mancanti come zero.
 *
 * Attenzione a che cosa NON fa: non ripara un NaN che sia finito nei dati.
 * `Math.round(NaN || 0)` restituiva zero, e uno zero silenzioso al posto
 * delle spese di un giocatore è costato una diagnosi lunga — sembrava un
 * problema di bilanciamento del mercato di Roma, era un NaN. Adesso il NaN
 * resta NaN e si propaga fino ai test, che lo cercano apposta.
 */
export const arrotonda = (n) => {
  if (n === null || n === undefined || n === "") return 0;
  return Math.round(n);
};

/** Somma dei dividendi mensili di tutti i titoli posseduti. */
export function dividendi(g) {
  return arrotonda(g.azioni.reduce((s, a) => s + a.quantita * (a.dividendo || 0), 0));
}

/** Flusso mensile dagli immobili. */
export function flussoImmobili(g) {
  return arrotonda(g.immobili.reduce((s, i) => s + i.flusso, 0));
}

/** Flusso mensile dalle attività. */
export function flussoAttivita(g) {
  return arrotonda(g.attivita.reduce((s, a) => s + a.flusso, 0));
}

/** Reddito passivo = dividendi + immobili + attività. */
export function redditoPassivo(g) {
  return dividendi(g) + flussoImmobili(g) + flussoAttivita(g);
}

export function redditoTotale(g) {
  return g.stipendio + (g.secondoReddito || 0) + redditoPassivo(g);
}

/** Rata del prestito bancario: $100 al mese ogni $1.000 presi in prestito. */
export function ratePrestito(g) {
  /* Il tasso viaggia col giocatore, come lo stipendio: è una condizione del
     suo mercato, e va letto senza dover risalire allo stato della partita —
     speseTotali() è chiamata da mezza interfaccia. */
  const tasso = g.tassoPrestito ?? TASSO_PRESTITO;
  return arrotonda((g.passivita.prestitoBanca || 0) * tasso);
}

export function speseFigli(g) {
  return g.figli * g.perFiglio;
}

export function speseTotali(g) {
  const base = Object.values(g.spese).reduce((s, v) => s + v, 0);
  return arrotonda(base + speseFigli(g) + ratePrestito(g));
}

/** Flusso di cassa mensile = il tuo Giorno di Paga. */
export function flussoMensile(g) {
  return redditoTotale(g) - speseTotali(g);
}

/** Totale delle passività (Stato Patrimoniale). */
export function passivitaTotali(g) {
  const base = Object.values(g.passivita).reduce((s, v) => s + v, 0);
  const mutuiImmobili = g.immobili.reduce((s, i) => s + (i.mutuo || 0), 0);
  const debitiAttivita = g.attivita.reduce((s, a) => s + (a.passivita || 0), 0);
  return arrotonda(base + mutuiImmobili + debitiAttivita);
}

/** Valore complessivo degli attivi, ai prezzi di acquisto. */
export function valoreAttivi(g) {
  const titoli = g.azioni.reduce((s, a) => s + a.quantita * a.prezzoAcquisto, 0);
  const imm = g.immobili.reduce((s, i) => s + i.costo, 0);
  const att = g.attivita.reduce((s, a) => s + a.costo, 0);
  return arrotonda(titoli + imm + att);
}

/**
 * Quanto reddito passivo serve per uscire, in questa partita.
 *
 * Il margine viaggia col giocatore come lo stipendio e il tasso: `speseTotali`
 * è chiamata da mezza interfaccia, e risalire ogni volta al pacchetto del
 * mercato costerebbe più di quanto valga.
 */
export const sogliaUscita = (g) => speseTotali(g) * (g.margineUscita ?? 1);

/**
 * È libero dalla Ruota?
 *
 * Non basta pareggiare. A 1× si esce nel mese esatto in cui i conti si
 * toccano — una rata nuova, un mese di sfitto, un inquilino che non paga, e
 * si è dentro di nuovo. Nessuno lascia il lavoro al pareggio; ci si lascia
 * un margine, e su Roma il margine è il doppio.
 */
export function fuoriDallaCorsa(g) {
  return redditoPassivo(g) > sogliaUscita(g);
}

/** Percentuale di avanzamento verso la libertà finanziaria (0 - 1). */
export function progressoLiberta(g) {
  const sp = sogliaUscita(g);
  if (sp <= 0) return 1;
  return Math.min(1, redditoPassivo(g) / sp);
}

/**
 * Riepilogo completo, pronto da mostrare a schermo.
 * Usato anche dal pannello che mostra il flusso degli avversari.
 */
export function riepilogo(g) {
  const div = dividendi(g);
  const imm = flussoImmobili(g);
  const att = flussoAttivita(g);
  const passivo = div + imm + att;
  const totEntrate = g.stipendio + (g.secondoReddito || 0) + passivo;
  const rataPrestito = ratePrestito(g);
  const figli = speseFigli(g);
  const totUscite = arrotonda(
    Object.values(g.spese).reduce((s, v) => s + v, 0) + figli + rataPrestito
  );
  return {
    secondoReddito: g.secondoReddito || 0,
    dividendi: div,
    flussoImmobili: imm,
    flussoAttivita: att,
    redditoPassivo: passivo,
    redditoTotale: totEntrate,
    ratePrestito: rataPrestito,
    speseFigli: figli,
    speseTotali: totUscite,
    flussoMensile: totEntrate - totUscite,
    passivitaTotali: passivitaTotali(g),
    valoreAttivi: valoreAttivi(g),
    /* La soglia, non le spese: su Roma serve il doppio delle spese, e
       l'interfaccia deve mostrare quella barra lì — altrimenti dice
       "ci sei" a metà strada. */
    soglia: arrotonda(totUscite * (g.margineUscita ?? 1)),
    margineUscita: g.margineUscita ?? 1,
    libero: passivo > totUscite * (g.margineUscita ?? 1),
    progresso: totUscite > 0 ? Math.min(1, passivo / (totUscite * (g.margineUscita ?? 1))) : 1,
  };
}

/** Riepilogo per un giocatore già al Largo. */
export function riepilogoVeloce(g) {
  return {
    redditoRendita: g.redditoRendita,
    redditoIniziale: g.redditoInizialeVeloce,
    guadagnato: g.redditoRendita - g.redditoInizialeVeloce,
    numeroAffari: g.affariVeloci.length,
  };
}

/**
 * Separatore delle migliaia all'italiana.
 * Scritto a mano invece di usare toLocaleString: il risultato deve essere
 * identico ovunque — server Node, browser con dati di localizzazione ridotti,
 * telefoni con lingua diversa. I numeri del gioco non possono cambiare aspetto.
 */
export function numero(n) {
  const v = Math.round(n || 0);
  const seg = v < 0 ? "-" : "";
  return seg + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * La valuta di ripiego, quando non arriva dal mercato.
 * Esiste solo perché una cifra senza simbolo è peggio di una cifra col
 * simbolo sbagliato: nessuna schermata deve mai restare vuota.
 */
export const VALUTA_PREDEFINITA = { simbolo: "$", posizione: "prefisso", locale: "it-IT" };

/**
 * Formatta un importo nella valuta del mercato.
 *
 * `valuta` arriva dal pacchetto del mercato (vedi mercati/indice.js), perché
 * il simbolo e la sua posizione cambiano da un mercato all'altro: 1.234 $ a
 * Roma si scrive 1.234 €, e in francese il simbolo va dopo. Si accetta anche
 * lo stato di una partita, così i componenti possono passare quello che hanno
 * sottomano senza risalire al pacchetto.
 */
let valutaCorrente = VALUTA_PREDEFINITA;

/**
 * Dichiara la valuta del mercato che si sta guardando.
 *
 * La chiama il provider del mercato a ogni render (vedi Mercato.jsx). Serve
 * perché `soldi()` è chiamato in un centinaio di punti dell'interfaccia,
 * spesso da componenti di servizio che non hanno né lo stato né il contesto
 * sottomano: passare la valuta a ognuno di loro significherebbe trascinarla
 * per tutta l'applicazione.
 *
 * È una variabile di modulo, e va bene qui per una ragione precisa: sullo
 * schermo c'è sempre e solo una partita, quindi una sola valuta. Il motore
 * NON dipende da questa variabile — lì la valuta è sempre esplicita, presa
 * dal pacchetto della stanza — quindi anche se andasse fuori sincrono
 * potrebbe sbagliare un simbolo a schermo, mai un conto.
 */
export function impostaValutaCorrente(v) {
  valutaCorrente = v || VALUTA_PREDEFINITA;
}

export function soldi(n, valuta) {
  const v = valuta?.valuta || valuta || valutaCorrente;
  const simbolo = v.simbolo ?? "$";
  const importo = Math.round(n || 0);
  const segno = importo < 0 ? "-" : "";
  const cifre = numero(Math.abs(importo));
  return v.posizione === "suffisso"
    ? `${segno}${cifre} ${simbolo}`
    : `${segno}${simbolo}${cifre}`;
}
