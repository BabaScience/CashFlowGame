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
import { stanze, statoConfigurazione, scadenza } from "./_lib/db.js";
import { json, errore, corpo, normalizzaCodice, validoId } from "./_lib/http.js";
import { creaStanza, codiceStanza, applicaAzione } from "../src/game/motore.js";

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

    /* ── Applicazione di una mossa ── */
    if (op === "azione") {
      const codice = normalizzaCodice(body.codice);
      if (!codice) return errore(res, 400, "Codice stanza mancante.");
      const azione = body.azione;
      if (!azione || typeof azione.tipo !== "string") return errore(res, 400, "Azione non valida.");

      for (let tentativo = 0; tentativo < MAX_TENTATIVI; tentativo++) {
        const attuale = await col.findOne({ codice }, { projection: { _id: 0, scadeIl: 0 } });
        if (!attuale) return errore(res, 404, "Stanza non trovata o scaduta.");

        const r = applicaAzione(attuale, { ...azione, giocatoreId });
        if (r.errore) return json(res, 409, { errore: r.errore, stato: attuale });

        const nuovo = r.stato;
        const esito = await col.replaceOne(
          { codice, versione: attuale.versione },
          { ...nuovo, scadeIl: scadenza(nuovo) }
        );
        if (esito.matchedCount === 1) return json(res, 200, { stato: nuovo });
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
