/**
 * POST /api/coda
 *
 *   { op: "entra",  giocatoreId, nome, professioneId, sognoId,
 *     mercatoId, formato, livello }
 *   { op: "guarda", giocatoreId }
 *   { op: "esci",   giocatoreId }
 *
 * TROVARE QUALCUNO SENZA CONOSCERLO.
 *
 * Il meccanismo è volutamente il più stupido che funzioni: chi entra
 * guarda se c'è già qualcuno in attesa con la stessa chiave (mercato,
 * formato, livello). Se c'è, se lo prende e crea la stanza per tutti e
 * due; se non c'è, si mette in attesa e lascia che sia il prossimo a fare
 * il lavoro.
 *
 * La riga sola che rende il tutto corretto è `findOneAndDelete`: prendere
 * l'avversario e toglierlo dalla coda è una operazione unica e atomica sul
 * database. Due persone che premono nello stesso millisecondo non possono
 * prendersi lo stesso avversario — una delle due trova la coda vuota e ci
 * si mette dentro, che è esattamente quello che deve succedere.
 *
 * Costo: una collezione che per la maggior parte del tempo è vuota, con un
 * indice TTL che la svuota da sola. Nessun servizio nuovo, nessuna
 * variabile d'ambiente nuova.
 */
import { stanze, coda, scadenza, TTL_CODA_MS, statoConfigurazione } from "./_lib/db.js";
import { json, errore, corpo, validoId } from "./_lib/http.js";
import { creaStanza, codiceStanza, applicaAzione } from "../src/game/motore.js";
import { chiaveCoda, formatoValido } from "../src/game/arena.js";

const MAX_TENTATIVI = 6;

/** Il nome che si vede al tavolo: ripulito, corto, mai vuoto. */
const nomePulito = (n) => String(n || "").trim().slice(0, 20) || "Ospite";

export default async function handler(req, res) {
  if (req.method !== "POST") return errore(res, 405, "Metodo non consentito.");
  const config = statoConfigurazione();
  if (!config.ok) return errore(res, 503, config.errore);

  const body = await corpo(req);
  const { op } = body;
  const giocatoreId = body.giocatoreId;
  if (!validoId(giocatoreId)) return errore(res, 400, "Identificativo giocatore non valido.");

  try {
    const col = await coda();

    /* ── Uscire dalla coda ── */
    if (op === "esci") {
      await col.deleteOne({ giocatoreId });
      return json(res, 200, { uscito: true });
    }

    /* ── Guardare se qualcuno mi ha preso ──
       Chi aspetta non sa di essere stato appaiato: è l'altro che crea la
       stanza e scrive il codice sulla riga di chi aspettava. Qui la si
       legge e la si consuma. */
    if (op === "guarda") {
      const riga = await col.findOne({ giocatoreId });
      if (!riga) return json(res, 200, { stato: "scaduta" });
      if (riga.codice) {
        await col.deleteOne({ giocatoreId });
        return json(res, 200, { stato: "trovato", codice: riga.codice });
      }
      const quanti = await col.countDocuments({ chiave: riga.chiave, codice: { $exists: false } });
      return json(res, 200, { stato: "attesa", inCoda: quanti });
    }

    if (op !== "entra") return errore(res, 400, "Operazione sconosciuta.");

    const mercatoId = body.mercatoId || "roma";
    const formato = formatoValido(body.formato);
    const livello = Number(body.livello) || 1;
    const chiave = chiaveCoda({ mercatoId, formato, livello });
    const nome = nomePulito(body.nome);

    /* Chi rientra non deve poter stare in coda due volte. */
    await col.deleteOne({ giocatoreId });

    /* ── Cerco qualcuno che aspetta ──
       Atomico: o l'avversario è mio, o non c'era. */
    const preso = await col.findOneAndDelete(
      { chiave, giocatoreId: { $ne: giocatoreId }, codice: { $exists: false } },
      { sort: { creataIl: 1 } }
    );
    const avversario = preso?.value ?? preso;   // il driver cambia forma fra versioni

    if (!avversario || !avversario.giocatoreId) {
      /* Nessuno: mi metto in attesa e lascio fare al prossimo. */
      const ora = Date.now();
      await col.insertOne({
        giocatoreId, chiave, nome,
        professioneId: body.professioneId, sognoId: body.sognoId,
        mercatoId, formato, livello,
        creataIl: new Date(ora),
        scadeIl: new Date(ora + TTL_CODA_MS),
      });
      return json(res, 200, { stato: "attesa", inCoda: 1 });
    }

    /* ── C'era: creo la stanza per tutti e due e comincio subito ──
       Chi ha aspettato di più è l'host: ha avuto la pazienza, si prende il
       ruolo. E la partita parte già avviata — una sala d'attesa in cui
       aspettare qualcuno che è già lì non serve a niente. */
    const stanzeCol = await stanze();
    for (let i = 0; i < MAX_TENTATIVI; i++) {
      const codice = codiceStanza();
      let stato = creaStanza(codice, avversario.giocatoreId, { mercatoId, livello, formato });

      const entra = (g) => applicaAzione(stato, {
        tipo: "entra", giocatoreId: g.giocatoreId, nome: g.nome,
        professioneId: g.professioneId, sognoId: g.sognoId,
      });
      let r = entra(avversario);
      if (r.errore) return errore(res, 400, r.errore);
      stato = r.stato;
      r = entra({ giocatoreId, nome, professioneId: body.professioneId, sognoId: body.sognoId });
      if (r.errore) return errore(res, 400, r.errore);
      stato = r.stato;

      r = applicaAzione(stato, { tipo: "avvia", giocatoreId: avversario.giocatoreId });
      if (r.errore) return errore(res, 400, r.errore);
      stato = r.stato;

      try {
        await stanzeCol.insertOne({ ...stato, scadeIl: scadenza(stato) });
      } catch (e) {
        if (e?.code === 11000) continue;    // codice già preso: se ne prova un altro
        throw e;
      }

      /* L'altro sta chiedendo "qualcuno mi ha preso?": glielo diciamo
         rimettendo la sua riga con dentro il codice. Vive tre minuti come
         tutte le altre, e sparisce appena la legge.
         `upsert` e non `insertOne`: se nel frattempo è rientrato in coda
         da un'altra scheda, la sua riga esiste già e un inserimento
         fallirebbe per chiave duplicata — lasciandolo ad aspettare una
         partita che è già cominciata senza di lui. */
      await col.updateOne(
        { giocatoreId: avversario.giocatoreId },
        {
          $set: { chiave, codice, scadeIl: new Date(Date.now() + TTL_CODA_MS) },
          $setOnInsert: { giocatoreId: avversario.giocatoreId, creataIl: new Date() },
        },
        { upsert: true }
      ).catch((e) => console.error("coda/avviso:", e.message));

      return json(res, 200, { stato: "trovato", codice });
    }
    return errore(res, 500, "Non riesco a creare la stanza, riprova.");
  } catch (e) {
    console.error("coda:", e);
    return errore(res, 500, "Errore della coda.");
  }
}
