/**
 * IL BOT, IN UN POSTO SOLO.
 *
 * Era scritto due volte — in `simula.mjs` e, in una variante, in
 * `bilancia.mjs` — e stava per essere scritto una terza volta per provare il
 * conto dei mesi. Tre copie della stessa logica sono tre occasioni perché
 * una diverga dalle altre senza che nessuno se ne accorga.
 *
 * Non è un giocatore forte, e non deve esserlo: deve solo non restare mai
 * senza mosse, perché il suo mestiere è far girare il motore fino in fondo.
 */
import { applicaAzione } from "../src/game/motore.js";
import { fuoriDallaCorsa, flussoMensile } from "../src/game/finanze.js";

export const scegli = (a) => a[Math.floor(Math.random() * a.length)];

/** Un bot semplice ma non stupido: compra se può permetterselo e conviene. */
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
export function gioca(stato, maxAzioni = 4000) {
  let s = stato, azioni = 0, errori = 0;
  while (s.fase === "inCorso" && azioni < maxAzioni) {
    const az = mossaBot(s);
    if (!az) break;
    const r = applicaAzione(s, az);
    if (r.errore) {
      if (++errori > 100) break;
      /* Il Mercato è l'unico punto in cui il bot può incartarsi: lo si
         chiude d'autorità e si tira avanti. */
      if (s.pending?.tipo === "mercato") {
        const f = applicaAzione(s, { tipo: "chiudiMercato", giocatoreId: s.giocatori[s.turno].id });
        if (!f.errore) { s = f.stato; continue; }
      }
      continue;
    }
    errori = 0;
    s = r.stato;
    azioni++;
  }
  return { stato: s, azioni };
}
