/**
 * GET /api/cleanup — eseguito una volta al giorno da Vercel Cron.
 *
 * L'indice TTL fa già il grosso del lavoro. Questa funzione è la rete di
 * sicurezza: rimuove le stanze rimaste senza scadenza valida, quelle mai
 * avviate e quelle finite da un pezzo, così il piano gratuito non si riempie.
 */
import { stanze, statoConfigurazione, TTL_ATTESA_MS, TTL_FINITA_MS, TTL_ATTIVA_MS } from "./_lib/db.js";
import { json, errore } from "./_lib/http.js";

export default async function handler(req, res) {
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  // Vercel Cron manda un header di autorizzazione se CRON_SECRET è impostato.
  const atteso = process.env.CRON_SECRET;
  if (atteso) {
    const dato = req.headers.authorization || "";
    if (dato !== `Bearer ${atteso}`) return errore(res, 401, "Non autorizzato.");
  }

  const ora = Date.now();
  try {
    const col = await stanze();

    const [scadute, attesa, finite, abbandonate] = await Promise.all([
      // documenti la cui scadenza è passata ma che il TTL non ha ancora rimosso
      col.deleteMany({ scadeIl: { $lt: new Date(ora) } }),
      // stanze mai avviate e inattive
      col.deleteMany({ fase: "attesa", aggiornataIl: { $lt: ora - TTL_ATTESA_MS } }),
      // partite concluse da più di 6 ore
      col.deleteMany({ fase: "finita", aggiornataIl: { $lt: ora - TTL_FINITA_MS } }),
      // partite iniziate e poi lasciate lì
      col.deleteMany({ fase: "inCorso", aggiornataIl: { $lt: ora - TTL_ATTIVA_MS } }),
    ]);

    const rimosse =
      scadute.deletedCount + attesa.deletedCount + finite.deletedCount + abbandonate.deletedCount;
    const rimaste = await col.countDocuments();

    console.log(`cleanup: rimosse ${rimosse}, rimaste ${rimaste}`);
    return json(res, 200, {
      rimosse,
      dettaglio: {
        scadute: scadute.deletedCount,
        maiAvviate: attesa.deletedCount,
        concluse: finite.deletedCount,
        abbandonate: abbandonate.deletedCount,
      },
      rimaste,
    });
  } catch (e) {
    console.error("cleanup:", e);
    return errore(res, 500, "Pulizia fallita.");
  }
}
