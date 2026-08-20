/**
 * POST /api/chat
 *   { codice, giocatoreId, testo }
 *
 * Scrittura in append, deliberatamente fuori dal motore.
 *
 * Le mosse passano da /api/room, che rilegge il documento, applica la
 * mossa e riscrive solo se nessun altro l'ha toccato nel frattempo. È la
 * cosa giusta per un tiro di dado, ed è la cosa sbagliata per un messaggio:
 * chi scrive mentre gli altri giocano perderebbe la corsa e si vedrebbe
 * rifiutare il messaggio, oppure lo farebbe ritentare in coda ai dadi.
 *
 * Qui invece si accoda e basta: `$push` con `$slice` tiene il tetto, `$inc`
 * sulla versione fa accorgere il polling che c'è qualcosa di nuovo. Nessuna
 * corsa da perdere, nessuna mossa da ritentare.
 */
import { stanze, statoConfigurazione, scadenza } from "./_lib/db.js";
import { json, errore, corpo, normalizzaCodice, validoId } from "./_lib/http.js";
import { preparaMessaggio, MAX_MESSAGGI } from "../src/game/chat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return errore(res, 405, "Metodo non consentito.");
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  const body = await corpo(req);
  const giocatoreId = body.giocatoreId;
  if (!validoId(giocatoreId)) return errore(res, 400, "Identificativo giocatore non valido.");

  const codice = normalizzaCodice(body.codice);
  if (!codice) return errore(res, 400, "Codice stanza mancante.");

  try {
    const col = await stanze();

    // Si legge il minimo necessario a validare: non serve tutto lo stato.
    const stanza = await col.findOne(
      { codice },
      { projection: { _id: 0, giocatori: 1, chat: 1, chatAperta: 1, fase: 1 } }
    );
    if (!stanza) return errore(res, 404, "Stanza non trovata o scaduta.");

    const esito = preparaMessaggio(stanza, giocatoreId, body.testo);
    if (esito.errore) return errore(res, 400, esito.errore);

    await col.updateOne(
      { codice },
      {
        $push: { chat: { $each: [esito.messaggio], $slice: -MAX_MESSAGGI } },
        $inc: { versione: 1 },
        $set: { scadeIl: scadenza(stanza), aggiornataIl: Date.now() },
      }
    );

    return json(res, 200, { messaggio: esito.messaggio });
  } catch (e) {
    console.error("chat:", e);
    return errore(res, 500, "Errore di scrittura sul database.");
  }
}
