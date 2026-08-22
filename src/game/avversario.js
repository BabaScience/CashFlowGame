/**
 * L'AVVERSARIO AUTOMATICO.
 *
 * Nato come attrezzo dei test — serviva a far girare il motore fino in
 * fondo per verificare che una partita finisse sempre — e diventato una
 * parte del gioco il giorno in cui si è potuto giocare da soli.
 *
 * Non è un giocatore forte, e non deve esserlo: deve decidere sempre
 * qualcosa di sensato e non restare mai senza mosse. Chi vuole allenarsi lo
 * batte; chi vuole capire il gioco ci impara contro.
 *
 * Vive in `src/game/` e non fra gli script perché ora lo usa anche il
 * client: quando tocca a un avversario automatico è il browser di chi gioca
 * a calcolarne la mossa e a mandarla al server. Il server non sa che è un
 * bot, e non ha bisogno di saperlo.
 */
import { fuoriDallaCorsa, flussoMensile } from "./finanze.js";

export const scegli = (a) => a[Math.floor(Math.random() * a.length)];

export function mossaBot(s) {
  const p = s.pending;
  const attuale = s.giocatori[s.turno];

  if (p) {
    // Il Mercato lo devono risolvere tutti gli idonei.
    if (p.tipo === "mercato") {
      const chi = p.idonei.find((id) => !p.risposto.includes(id));
      if (!chi) return { tipo: "chiudiMercato", giocatoreId: attuale.id };
      const g = s.giocatori.find((x) => x.id === chi);
      const c = p.carta;
      if (c.tipo === "offerta" && Math.random() < 0.5) {
        if (c.categoria === "attivita" && g.attivita.length)
          return { tipo: "vendiAlMercato", giocatoreId: chi, rid: scegli(g.attivita).rid, ultima: true };
        const m = g.immobili.filter((i) => i.categoria === c.categoria);
        if (m.length) return { tipo: "vendiAlMercato", giocatoreId: chi, rid: scegli(m).rid, ultima: true };
      }
      if (c.tipo === "prezzo" && Math.random() < 0.6) {
        const a = g.azioni.find((x) => x.simbolo === c.simbolo);
        if (a && c.prezzo > a.prezzoAcquisto)
          return { tipo: "vendiAlMercato", giocatoreId: chi, quantita: a.quantita, ultima: true };
      }
      return { tipo: "passaMercato", giocatoreId: chi };
    }

    const id = p.giocatoreId;
    const g = s.giocatori.find((x) => x.id === id);
    switch (p.tipo) {
      case "sceltaTaglia":
        return { tipo: "scegliTaglia", giocatoreId: id, taglia: g.contanti > 30000 && Math.random() < 0.6 ? "grandi" : "piccoli" };
      case "carta": {
        const c = p.carta;
        if (c.tipo === "spesa") return { tipo: "passaCarta", giocatoreId: id };
        if (c.tipo === "azione") {
          const q = Math.floor(g.contanti * 0.3 / c.prezzo);
          if (q >= 1 && c.dividendo > 0) return { tipo: "compraCarta", giocatoreId: id, quantita: q };
          if (q >= 1 && Math.random() < 0.3) return { tipo: "compraCarta", giocatoreId: id, quantita: q };
          return { tipo: "passaCarta", giocatoreId: id };
        }
        if (g.contanti >= c.acconto && c.flusso > 0) return { tipo: "compraCarta", giocatoreId: id };
        // prova a finanziare con un prestito se il flusso lo giustifica
        if (c.flusso > 0 && c.acconto - g.contanti > 0) {
          const serve = Math.ceil((c.acconto - g.contanti) / 1000) * 1000;
          if (serve <= 20000 && c.flusso > serve / 10) return { tipo: "prestito", giocatoreId: id, importo: serve };
        }
        return { tipo: "passaCarta", giocatoreId: id };
      }
      case "extra": return { tipo: "confermaExtra", giocatoreId: id };
      case "beneficenza": {
        const costo = p.costo;
        return { tipo: "beneficenza", giocatoreId: id, accetta: g.contanti > costo * 4 };
      }
      case "figlio": return { tipo: "confermaFiglio", giocatoreId: id };
      case "licenziamento": return { tipo: "confermaLicenziamento", giocatoreId: id };
      case "bancarotta": {
        if (flussoMensile(g) < 0) {
          if (g.passivita.prestitoBanca >= 1000 && g.contanti >= 1000)
            return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "prestito", importo: Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000) };
          if (g.immobili.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "immobile", rid: g.immobili[0].rid };
          if (g.attivita.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "attivita", rid: g.attivita[0].rid };
          if (g.azioni.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "azione", simbolo: g.azioni[0].simbolo };
        }
        return { tipo: "concludiBancarotta", giocatoreId: id };
      }
      case "affareVeloce":
        return g.contanti >= p.affare.acconto
          ? { tipo: "compraAffareVeloce", giocatoreId: id }
          : { tipo: "passaAffareVeloce", giocatoreId: id };
      case "sogno":
        return p.mio && g.contanti >= p.costo
          ? { tipo: "compraSogno", giocatoreId: id }
          : { tipo: "passaSogno", giocatoreId: id };
      case "beneficenzaVeloce":
        return { tipo: "beneficenzaVeloce", giocatoreId: id, accetta: g.contanti > p.gia ? false : g.contanti > 100000 };
      case "penalitaVeloce": return { tipo: "confermaPenalita", giocatoreId: id };
      default: throw new Error("pending sconosciuto: " + p.tipo);
    }
  }

  // Nessun pending: tocca a chi ha il turno.
  const g = attuale;
  if (g.tracciato === "topi" && fuoriDallaCorsa(g)) return { tipo: "esciDallaCorsa", giocatoreId: g.id };
  if (!s.dado) return { tipo: "tira", giocatoreId: g.id, nDadi: 2 };
  return null; // stato impossibile
}

/**
 * Porta avanti una partita già avviata finché finisce o finiscono le mosse.
 * Restituisce lo stato raggiunto: è tutto ciò che serve a chi vuole
 * guardare com'è messo il tavolo dopo un po' di gioco vero.
 */

/** È un avversario automatico? */
export const eBot = (g) => Boolean(g?.bot);
