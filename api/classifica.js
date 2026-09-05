/**
 * GET /api/classifica?giocatoreId=…
 *
 * I primi cinquanta, e dove stai tu.
 *
 * La seconda metà è quella che conta. Una classifica in cui non compari è
 * una classifica di altre persone: la posizione propria è la sola riga che
 * fa tornare qualcuno a guardarla, anche quando è la novantesima.
 *
 * Non si conserva niente che non sia stato scritto apposta: un
 * identificativo generato dal dispositivo, il nome scelto da chi gioca, e
 * i numeri delle partite. Nessuna email, nessuna password, e un indice TTL
 * che toglie di mezzo chi non gioca da sei mesi.
 */
import { giocatori, statoConfigurazione } from "./_lib/db.js";
import { json, errore, validoId } from "./_lib/http.js";
import { PARTITE_PER_CLASSIFICA } from "../src/game/arena.js";

const QUANTI = 50;

export default async function handler(req, res) {
  if (req.method !== "GET") return errore(res, 405, "Metodo non consentito.");
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  try {
    const col = await giocatori();
    const primi = await col
      .find({ partite: { $gte: PARTITE_PER_CLASSIFICA } }, { projection: { _id: 0, giocatoreId: 1, nome: 1, valutazione: 1, partite: 1, vittorie: 1 } })
      .sort({ valutazione: -1, partite: -1 })
      .limit(QUANTI)
      .toArray();

    const id = req.query.giocatoreId;
    let io = null;
    if (validoId(id)) {
      const mio = await col.findOne({ giocatoreId: id }, { projection: { _id: 0 } });
      if (mio) {
        /* La posizione è un conteggio, non una scansione: quanti stanno
           sopra di me. Su una collezione con l'indice giusto è una lettura
           sola, e resta una lettura sola anche con centomila iscritti. */
        const sopra = await col.countDocuments({
          partite: { $gte: PARTITE_PER_CLASSIFICA },
          $or: [
            { valutazione: { $gt: mio.valutazione } },
            { valutazione: mio.valutazione, partite: { $gt: mio.partite } },
          ],
        });
        io = {
          giocatoreId: mio.giocatoreId, nome: mio.nome, valutazione: mio.valutazione,
          partite: mio.partite, vittorie: mio.vittorie || 0,
          /* La posizione ha senso solo per chi è in classifica: a due
             partite dire "sei primo" sarebbe una bugia gentile. */
          posizione: (mio.partite || 0) >= PARTITE_PER_CLASSIFICA ? sopra + 1 : null,
          mancano: Math.max(0, PARTITE_PER_CLASSIFICA - (mio.partite || 0)),
        };
      }
    }

    return json(res, 200, { primi, io });
  } catch (e) {
    console.error("classifica:", e);
    return errore(res, 500, "Errore di lettura della classifica.");
  }
}
