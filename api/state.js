/**
 * GET /api/state?codice=ABCD&v=12
 *
 * Endpoint di polling, tenuto volutamente leggerissimo:
 * se la versione del client è già aggiornata risponde 204 senza corpo,
 * leggendo dal database il solo campo `versione`.
 * Solo quando qualcosa è cambiato viene letto e spedito lo stato completo.
 */
import { stanze, configurato } from "./_lib/db.js";
import { json, errore, normalizzaCodice } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return errore(res, 405, "Metodo non consentito.");
  if (!configurato()) return errore(res, 503, "Database non configurato: manca MONGODB_URI.");

  const codice = normalizzaCodice(req.query.codice);
  if (!codice) return errore(res, 400, "Codice stanza mancante.");
  const vClient = Number(req.query.v || 0);

  try {
    const col = await stanze();

    // Lettura minima: solo il numero di versione.
    const leggera = await col.findOne({ codice }, { projection: { versione: 1, _id: 0 } });
    if (!leggera) return errore(res, 404, "Stanza non trovata o scaduta.");

    if (Number.isFinite(vClient) && vClient > 0 && leggera.versione === vClient) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(204).end();
    }

    const doc = await col.findOne({ codice }, { projection: { _id: 0, scadeIl: 0 } });
    if (!doc) return errore(res, 404, "Stanza non trovata o scaduta.");
    return json(res, 200, { stato: doc });
  } catch (e) {
    console.error("state:", e);
    return errore(res, 500, "Errore di lettura dal database.");
  }
}
