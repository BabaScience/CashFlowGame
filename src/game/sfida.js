/**
 * LA SFIDA DEL GIORNO.
 *
 * Una partita da soli, corta, con lo stesso identico mazzo per tutti quelli
 * che giocano oggi. Un tentativo. Un punteggio da confrontare.
 *
 * Perché esiste: la partita al tavolo dura fra i sessanta e i centoventi
 * minuti, e nessuno la gioca dieci volte al giorno. Quella non è
 * l'abitudine, è l'evento del fine settimana. L'abitudine è questa —
 * cinque minuti, un risultato da condividere, e la voglia di rifarlo domani.
 *
 * Non costa niente. La sfida gira interamente nel browser: il motore è una
 * funzione pura, il caso è ricostruibile da un seme, e quindi non serve né
 * una stanza sul server né una scrittura sul database. Zero infrastruttura
 * per la modalità che dovrebbe essere giocata più spesso di tutte.
 *
 * Il seme viene dalla data e dal mercato, così due persone a Roma giocano
 * la stessa partita e possono parlarne — che è tutto il punto.
 */
import { creaStanza, applicaAzione, codiceStanza } from "./motore.js";
import { riepilogo, redditoPassivo, speseTotali } from "./finanze.js";
import { getPacchetto, versioneCorrente } from "./mercati/indice.js";

/**
 * Quanti turni dura. Corta di proposito: è l'abitudine, non l'evento.
 * Cinquanta turni sono circa centoventi tocchi, cioè cinque minuti — e sono
 * il minimo perché il punteggio distingua chi sceglie bene da chi compra
 * tutto. Sotto i quaranta i risultati si schiacciano e vince il caso.
 */
export const TURNI_SFIDA = 50;

/**
 * Con quanto si parte, oltre ai risparmi della scheda.
 *
 * Serve a far entrare la sfida in cinque minuti: senza, i primi venti turni
 * se ne vanno solo a mettere insieme il primo anticipo, e non si decide
 * niente. È anche la cosa meno irrealistica da concedere — è quello che una
 * famiglia mette da parte in un anno, non una vincita.
 */
export const BONUS_PARTENZA = 8000;

/** Il giorno, in UTC: la sfida cambia alla stessa ora per tutti. */
export const giornoSfida = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

/**
 * Il seme del giorno.
 * Deterministico da (giorno, mercato): nessuno deve poterlo indovinare in
 * anticipo, ma tutti devono ottenere lo stesso.
 */
export function semeDelGiorno(giorno = giornoSfida(), mercatoId = "roma") {
  const testo = `quotazero:${giorno}:${mercatoId}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * La professione del giorno: uguale per tutti.
 * Se ognuno scegliesse la propria, i punteggi non sarebbero confrontabili
 * e la sfida perderebbe il senso.
 */
export function professioneDelGiorno(giorno = giornoSfida(), mercatoId = "roma") {
  const p = getPacchetto(mercatoId);
  const seme = semeDelGiorno(giorno, mercatoId);
  return p.professioni[seme % p.professioni.length];
}

/** Prepara la sfida di oggi, pronta da giocare. */
export function creaSfida({ giorno = giornoSfida(), mercatoId = "roma", nome = "Tu" } = {}) {
  const seme = semeDelGiorno(giorno, mercatoId);
  const pacchetto = getPacchetto(mercatoId);
  const prof = professioneDelGiorno(giorno, mercatoId);
  const sogno = pacchetto.sogni[seme % pacchetto.sogni.length];

  let s = creaStanza(codiceStanza(), "io", {
    seme,
    mercatoId,
    versioneDati: versioneCorrente(mercatoId),
    solitaria: true,
  });
  s = applicaAzione(s, {
    tipo: "entra", giocatoreId: "io", nome,
    professioneId: prof.id, sognoId: sogno.id,
  }).stato;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "io" }).stato;
  s.giocatori[0].contanti += BONUS_PARTENZA;
  return { stato: s, giorno, mercatoId, professione: prof, sogno };
}

/**
 * Il punteggio.
 *
 * Misura una cosa sola: quanto ti sei avvicinato a coprire le tue spese con
 * la rendita. È la domanda del gioco, ed è confrontabile fra persone che
 * hanno la stessa scheda. Zero se non hai comprato niente, cento se sei
 * uscito. Sopra cento se sei uscito e hai continuato a costruire.
 */
export function punteggio(stato) {
  const g = stato.giocatori[0];
  if (!g) return 0;
  if (g.tracciato === "veloce") {
    const p = getPacchetto(stato.mercatoId);
    const oltre = Math.max(0, g.redditoRendita - g.redditoInizialeVeloce);
    return Math.round(100 + (oltre / p.obiettivoRendita) * 100);
  }
  const passivo = redditoPassivo(g);
  const spese = speseTotali(g);
  if (spese <= 0) return 100;
  return Math.max(0, Math.round((passivo / spese) * 100));
}

/** Cinque fasce, per il testo da condividere. */
export function fasciaPunteggio(p) {
  if (p >= 100) return { blocchi: 5, nome: "Largo" };
  if (p >= 75) return { blocchi: 4, nome: "Quasi" };
  if (p >= 50) return { blocchi: 3, nome: "A metà" };
  if (p >= 25) return { blocchi: 2, nome: "Avviato" };
  return { blocchi: 1, nome: "Quota zero" };
}

/**
 * Il testo da condividere.
 *
 * Deve raccontare il risultato senza rivelare le mosse: chi legge deve poter
 * giocare la stessa partita senza sapere che cosa è uscito. È anche, molto
 * concretamente, l'unico budget pubblicitario che abbiamo.
 */
export function testoDaCondividere(stato, { giorno = giornoSfida(), url = "" } = {}) {
  const p = punteggio(stato);
  const f = fasciaPunteggio(p);
  const g = stato.giocatori[0];
  const pacchetto = getPacchetto(stato.mercatoId);
  const prof = pacchetto.professioni.find((x) => x.id === g.professioneId);
  const barra = "▰".repeat(f.blocchi) + "▱".repeat(5 - f.blocchi);
  const righe = [
    `Quota Zero · ${pacchetto.nome} · ${giorno}`,
    `${prof?.emoji || "•"} ${prof?.nome || ""}`,
    `${barra}  ${p}/100`,
    g.tracciato === "veloce" ? "Ho preso il largo 🌊" : `${f.nome}`,
  ];
  if (url) righe.push(url);
  return righe.join("\n");
}

/* ── memoria locale: quando hai giocato, come è andata, da quanti giorni ── */

const CHIAVE = "quotazero:sfida";

const leggi = () => {
  try { return JSON.parse(localStorage.getItem(CHIAVE) || "{}"); } catch { return {}; }
};
const scrivi = (v) => {
  try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch { /* modalità privata */ }
};

/** Il risultato di oggi, se la sfida è già stata giocata. */
export function risultatoDiOggi(giorno = giornoSfida()) {
  const d = leggi();
  return d.ultimoGiorno === giorno ? d : null;
}

/**
 * Registra il risultato. Un tentativo al giorno: è ciò che rende il
 * punteggio confrontabile e la sfida una cosa che si aspetta.
 */
export function registraRisultato(stato, giorno = giornoSfida()) {
  const d = leggi();
  const p = punteggio(stato);
  const ieri = new Date(Date.parse(giorno) - 86400e3).toISOString().slice(0, 10);
  const serie = d.ultimoGiorno === ieri ? (d.serie || 0) + 1 : 1;
  const nuovo = {
    ultimoGiorno: giorno,
    punteggio: p,
    serie,
    migliore: Math.max(d.migliore || 0, p),
    giocate: (d.giocate || 0) + 1,
  };
  scrivi(nuovo);
  return nuovo;
}

/** Serie e record, per mostrarli anche prima di giocare. */
export function storicoSfida() {
  const d = leggi();
  return { serie: d.serie || 0, migliore: d.migliore || 0, giocate: d.giocate || 0 };
}
