/**
 * POST /api/eventi   registra un evento (solo contatori)
 * GET  /api/eventi   rilegge gli ultimi giorni (protetto da token)
 *
 * Non si registra nessun identificativo, nessun indirizzo, nessun dato
 * personale: solo "più uno" su un contatore del giorno. Vedi la spiegazione
 * in src/game/metriche.js — è una scelta di prodotto, non una limitazione.
 *
 * L'endpoint di lettura è protetto perché i numeri d'uso sono affari nostri,
 * non perché contengano qualcosa di sensibile: non contengono nulla.
 */
import { metriche, statoConfigurazione } from "./_lib/db.js";
import { json, errore, corpo } from "./_lib/http.js";
import { incrementiPer, giornoDi } from "../src/game/metriche.js";

/** Quanti giorni si conservano. Oltre, si cancellano da soli. */
const GIORNI_CONSERVATI = 400;

export default async function handler(req, res) {
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  try {
    const col = await metriche();

    /* ── lettura ── */
    if (req.method === "GET") {
      const atteso = process.env.METRICHE_TOKEN;
      if (!atteso) return errore(res, 503, "METRICHE_TOKEN non configurato.");
      const dato = req.headers?.authorization?.replace(/^Bearer\s+/i, "") || req.query?.token;
      if (dato !== atteso) return errore(res, 401, "Non autorizzato.");

      const giorni = Math.min(400, Math.max(1, Number(req.query?.giorni) || 30));
      const da = giornoDi(Date.now() - giorni * 86400e3);
      const righe = await col.find({ _id: { $gte: da } }).sort({ _id: -1 }).limit(giorni).toArray();
      return json(res, 200, { giorni: righe });
    }

    if (req.method !== "POST") return errore(res, 405, "Metodo non consentito.");

    /* ── scrittura ── */
    const body = await corpo(req);
    const esito = incrementiPer(body);
    // Un evento non riconosciuto non è un errore da mostrare a nessuno:
    // si scarta in silenzio, così una versione vecchia del client non
    // riempie i log di rumore.
    if (esito.errore) return json(res, 204, undefined);

    await col.updateOne(
      { _id: esito.giorno },
      {
        $inc: esito.incrementi,
        $setOnInsert: { scadeIl: new Date(Date.now() + GIORNI_CONSERVATI * 86400e3) },
      },
      { upsert: true }
    );
    res.status(204).end();
  } catch (e) {
    // Le metriche non devono mai rompere il gioco: si registra e si tace.
    console.error("eventi:", e);
    res.status(204).end();
  }
}
