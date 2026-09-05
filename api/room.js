/**
 * POST /api/room
 *
 * Unico punto di scrittura. Corpo:
 *   { op: "crea",   giocatoreId, nome, professioneId, sognoId }
 *   { op: "azione", codice, giocatoreId, azione: { tipo, ... } }
 *   { op: "chiudi", codice, giocatoreId }        cancella subito la stanza
 *
 * Il motore è autorevole: il client non calcola mai lo stato.
 * La concorrenza è gestita con un controllo di versione ottimistico:
 * si riscrive il documento solo se nel frattempo nessun altro l'ha toccato.
 */
import { stanze, giocatori, statoConfigurazione, scadenza, TTL_GIOCATORE_MS } from "./_lib/db.js";
import { registraEsito } from "./_lib/classifica.js";
import { statoRivincita, puoChiederla } from "./_lib/rivincita.js";
import { json, errore, corpo, normalizzaCodice, validoId } from "./_lib/http.js";
import { creaStanza, codiceStanza, applicaAzione } from "../src/game/motore.js";

/** Nomi degli avversari automatici: italiani, corti, riconoscibili. */
const NOMI_BOT = ["Bea", "Nico", "Rosa", "Furio", "Lella"];

const MAX_TENTATIVI = 5;

export default async function handler(req, res) {
  if (req.method !== "POST") return errore(res, 405, "Metodo non consentito.");
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  const body = await corpo(req);
  const { op } = body;
  const giocatoreId = body.giocatoreId;
  if (!validoId(giocatoreId)) return errore(res, 400, "Identificativo giocatore non valido.");

  try {
    const col = await stanze();

    /* ── Creazione di una nuova stanza ── */
    if (op === "crea") {
      for (let i = 0; i < 6; i++) {
        const codice = codiceStanza();
        let stato = creaStanza(codice, giocatoreId, { mercatoId: body.mercatoId, livello: Number(body.livello) || undefined });
        const r = applicaAzione(stato, {
          tipo: "entra", giocatoreId,
          nome: body.nome, professioneId: body.professioneId, sognoId: body.sognoId,
        });
        if (r.errore) return errore(res, 400, r.errore);
        stato = r.stato;

        /* Avversari automatici: si aggiungono qui, come giocatori normali.
           Il server non li tratta in modo speciale — le mosse gliele manda
           il browser di chi gioca (vedi src/hooks/useAvversari.js). */
        const quanti = Math.max(0, Math.min(5, Number(body.avversari) || 0));
        const pac = pacchettoDi(stato);
        for (let n = 0; n < quanti; n++) {
          const b = applicaAzione(stato, {
            tipo: "entra", giocatoreId: `bot${n + 1}`, bot: true,
            nome: NOMI_BOT[n],
            professioneId: pac.professioni[(n + 1) % pac.professioni.length].id,
            sognoId: pac.sogni[(n + 1) % pac.sogni.length].id,
          });
          if (b.errore) return errore(res, 400, b.errore);
          stato = b.stato;
        }
        try {
          await col.insertOne({ ...stato, scadeIl: scadenza(stato) });
          return json(res, 200, { stato });
        } catch (e) {
          if (e.code === 11000) continue;   // codice già usato: riprova
          throw e;
        }
      }
      return errore(res, 500, "Non riesco a generare un codice libero, riprova.");
    }

    /* ── Chiusura esplicita: libera subito lo spazio ── */
    if (op === "chiudi") {
      const codice = normalizzaCodice(body.codice);
      const doc = await col.findOne({ codice }, { projection: { hostId: 1, _id: 0 } });
      if (!doc) return errore(res, 404, "Stanza non trovata.");
      if (doc.hostId !== giocatoreId) return errore(res, 403, "Solo chi ha creato la stanza può chiuderla.");
      await col.deleteOne({ codice });
      return json(res, 200, { chiusa: true });
    }

    /* ── Rivincita: stessa gente, stanza nuova, già avviata ── */
    if (op === "rivincita") {
      const codice = normalizzaCodice(body.codice);
      const vecchia = await col.findOne({ codice }, { projection: { _id: 0, scadeIl: 0 } });
      if (!vecchia) return errore(res, 404, "Stanza non trovata o scaduta.");
      /* Il permesso si controlla PRIMA di dare qualunque codice: anche
         quello di una rivincita già aperta è un invito a un tavolo. */
      const permesso = puoChiederla(vecchia, giocatoreId);
      if (permesso.errore) return errore(res, 403, permesso.errore);
      /* Se qualcun altro l'ha già chiesta si entra in quella, invece di
         aprirne una seconda e dividere il tavolo in due. */
      if (vecchia.rivincita) return json(res, 200, { codice: vecchia.rivincita });

      for (let i = 0; i < 6; i++) {
        const nuovoCodice = codiceStanza();
        const r = statoRivincita(vecchia, nuovoCodice, giocatoreId);
        if (r.errore) return errore(res, 400, r.errore);
        try {
          await col.insertOne({ ...r.stato, scadeIl: scadenza(r.stato) });
        } catch (e) {
          if (e.code === 11000) continue;
          throw e;
        }
        /* Il collegamento sulla vecchia: gli altri lo vedono col polling
           che stanno già facendo, senza nessun canale nuovo. */
        await col.updateOne({ codice, rivincita: { $exists: false } }, { $set: { rivincita: nuovoCodice } });
        const dopo = await col.findOne({ codice }, { projection: { rivincita: 1, _id: 0 } });
        return json(res, 200, { codice: dopo?.rivincita || nuovoCodice });
      }
      return errore(res, 500, "Non riesco a creare la rivincita, riprova.");
    }

    /* ── Applicazione di una mossa ── */
    if (op === "azione") {
      const codice = normalizzaCodice(body.codice);
      if (!codice) return errore(res, 400, "Codice stanza mancante.");
      const azione = body.azione;
      if (!azione || typeof azione.tipo !== "string") return errore(res, 400, "Azione non valida.");

      for (let tentativo = 0; tentativo < MAX_TENTATIVI; tentativo++) {
        const attuale = await col.findOne({ codice }, { projection: { _id: 0, scadeIl: 0 } });
        if (!attuale) return errore(res, 404, "Stanza non trovata o scaduta.");

        /* Chi agisce.
           Di norma vale solo la propria identità: `giocatoreId` arriva dal
           corpo autenticato e sovrascrive quello dell'azione, così nessuno
           può giocare al posto di un altro.
           L'eccezione sono gli avversari automatici: non hanno un client
           che li muova, quindi le loro mosse le manda il browser di chi sta
           giocando. Si concede solo per chi è marcato `bot` in QUESTA
           stanza — un umano resta impersonabile da nessuno. */
        const bersaglio = azione.giocatoreId;
        const eBotDiQui = bersaglio
          && attuale.giocatori.some((g) => g.id === bersaglio && g.bot);
        const attore = eBotDiQui ? bersaglio : giocatoreId;
        const r = applicaAzione(attuale, { ...azione, giocatoreId: attore });
        if (r.errore) return json(res, 409, { errore: r.errore, stato: attuale });

        const nuovo = r.stato;
        const esito = await col.replaceOne(
          { codice, versione: attuale.versione },
          { ...nuovo, scadeIl: scadenza(nuovo) }
        );
        if (esito.matchedCount === 1) {
          /* La partita è appena finita: la classifica si aggiorna qui, con
             la stanza già scritta. Se qualcosa va storto la partita resta
             valida — una valutazione mancata è un fastidio, una mossa
             persa è un danno. */
          if (nuovo.fase === "finita" && attuale.fase !== "finita") {
            try {
              const variazioni = await registraEsito(col, await giocatori(), nuovo, TTL_GIOCATORE_MS);
              if (variazioni) return json(res, 200, { stato: nuovo, valutazioni: variazioni });
            } catch (e) { console.error("classifica:", e); }
          }
          return json(res, 200, { stato: nuovo });
        }
        // Qualcuno ha scritto nel frattempo: rileggo e riprovo.
      }
      return errore(res, 503, "Troppe mosse contemporanee, riprova.");
    }

    return errore(res, 400, "Operazione sconosciuta.");
  } catch (e) {
    console.error("room:", e);
    return errore(res, 500, "Errore di scrittura sul database.");
  }
}
