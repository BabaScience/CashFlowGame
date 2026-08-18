/**
 * Calcoli del Conto Economico / Stato Patrimoniale.
 * Una sola fonte di verità: sia il server sia l'interfaccia usano queste funzioni.
 */

export const TASSO_PRESTITO = 0.1; // 10% al mese, come da regolamento
export const MAX_FIGLI = 3;

export const arrotonda = (n) => Math.round(n || 0);

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
  return g.stipendio + redditoPassivo(g);
}

/** Rata del prestito bancario: $100 al mese ogni $1.000 presi in prestito. */
export function ratePrestito(g) {
  return arrotonda((g.passivita.prestitoBanca || 0) * TASSO_PRESTITO);
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

/** È libero dalla Corsa dei Topi? Reddito passivo > Spese totali. */
export function fuoriDallaCorsa(g) {
  return redditoPassivo(g) > speseTotali(g);
}

/** Percentuale di avanzamento verso la libertà finanziaria (0 - 1). */
export function progressoLiberta(g) {
  const sp = speseTotali(g);
  if (sp <= 0) return 1;
  return Math.min(1, redditoPassivo(g) / sp);
}

/**
 * Riepilogo completo, pronto da mostrare a schermo.
 * Usato anche dal pannello che mostra il cashflow degli avversari.
 */
export function riepilogo(g) {
  const div = dividendi(g);
  const imm = flussoImmobili(g);
  const att = flussoAttivita(g);
  const passivo = div + imm + att;
  const totEntrate = g.stipendio + passivo;
  const rataPrestito = ratePrestito(g);
  const figli = speseFigli(g);
  const totUscite = arrotonda(
    Object.values(g.spese).reduce((s, v) => s + v, 0) + figli + rataPrestito
  );
  return {
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
    libero: passivo > totUscite,
    progresso: totUscite > 0 ? Math.min(1, passivo / totUscite) : 1,
  };
}

/** Riepilogo per un giocatore già sulla Corsia Veloce. */
export function riepilogoVeloce(g) {
  return {
    redditoCashflowDay: g.redditoCashflowDay,
    redditoIniziale: g.redditoInizialeVeloce,
    guadagnato: g.redditoCashflowDay - g.redditoInizialeVeloce,
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

/** Formattazione monetaria italiana: $1.234 (e -$1.234 per i negativi). */
export function soldi(n) {
  const v = Math.round(n || 0);
  return (v < 0 ? "-$" : "$") + numero(Math.abs(v));
}
