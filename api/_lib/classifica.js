/**
 * Aggiornare la classifica a fine partita.
 *
 * Sta fuori dalle funzioni serverless perché la usano in due: la mossa che
 * fa finire la partita (api/room.js) e la copia in memoria che gira in
 * sviluppo (scripts/api-locale.js). La regola deve essere una sola, o le
 * due valutazioni divergono e nessuno se ne accorge finché non è tardi.
 *
 * Due cose sono importanti qui, e nessuna delle due è l'Elo.
 *
 * **Si aggiorna una volta sola.** La partita finisce con una mossa, ma la
 * stessa mossa può essere riprovata dal client, e due giocatori possono
 * far finire la stessa partita quasi insieme. La guardia è un campo sulla
 * stanza — `valutata` — scritto nella stessa `updateOne` condizionata: se
 * qualcun altro l'ha già scritto, non facciamo niente.
 *
 * **La calcola il server.** La valutazione della sfida in solitaria vive
 * sul dispositivo perché non c'è niente da difendere. Una classifica
 * pubblica calcolata dal browser è una classifica che si scrive da sola.
 */
import { valutazioniDopo, partitaValida, ordineFinale, VALUTAZIONE_ARENA_INIZIALE } from "../../src/game/arena.js";
import { redditoPassivo, speseTotali } from "../../src/game/finanze.js";

/** Quanto uno si è avvicinato al proprio traguardo, fra 0 e oltre 1. */
export function progressoDi(g) {
  if (g.tracciato === "veloce") {
    const oltre = Math.max(0, (g.redditoRendita || 0) - (g.redditoInizialeVeloce || 0));
    return 1 + oltre / 1000;
  }
  const spese = speseTotali(g);
  return spese > 0 ? Math.min(0.999, redditoPassivo(g) / spese) : 0;
}

/**
 * Applica l'esito di una partita alla classifica.
 *
 * `stanzeCol` serve solo per la guardia; `giocatoriCol` per i punteggi.
 * Restituisce le variazioni, o `null` se non c'era niente da fare.
 */
export async function registraEsito(stanzeCol, giocatoriCol, stato, ttlMs) {
  if (!partitaValida(stato)) return null;

  /* La guardia: chi arriva secondo trova matchedCount 0 e si ferma qui. */
  const preso = await stanzeCol.updateOne(
    { codice: stato.codice, valutata: { $ne: true } },
    { $set: { valutata: true } }
  );
  if (preso.matchedCount !== 1 || preso.modifiedCount !== 1) return null;

  const ordine = ordineFinale(stato, progressoDi);
  const ids = ordine.map((r) => r.id);
  const schede = await giocatoriCol.find({ giocatoreId: { $in: ids } }).toArray();
  const perId = new Map(schede.map((s) => [s.giocatoreId, s]));

  const esito = ordine.map((r) => ({
    id: r.id,
    posizione: r.posizione,
    valutazione: perId.get(r.id)?.valutazione ?? VALUTAZIONE_ARENA_INIZIALE,
    partite: perId.get(r.id)?.partite ?? 0,
  }));

  const nuove = valutazioniDopo(esito);
  const ora = new Date();
  const scadeIl = new Date(Date.now() + ttlMs);

  await Promise.all(nuove.map((v, i) => {
    const riga = ordine[i];
    return giocatoriCol.updateOne(
      { giocatoreId: v.id },
      {
        $set: { nome: riga.nome, valutazione: v.dopo, ultimaPartita: ora, scadeIl },
        $inc: { partite: 1, vittorie: riga.vincitore ? 1 : 0 },
        $setOnInsert: { giocatoreId: v.id, primaPartita: ora },
      },
      { upsert: true }
    );
  }));

  const righe = nuove.map((v, i) => ({ ...v, nome: ordine[i].nome, posizione: ordine[i].posizione }));

  /* Le variazioni si scrivono sulla stanza, non solo nella risposta.
     Chi ha fatto l'ultima mossa le riceve subito; tutti gli altri stanno
     leggendo lo stato col polling che già fanno, e senza questa riga
     vedrebbero la schermata finale senza sapere quanto hanno perso o
     guadagnato — che è la sola cosa che si guarda. */
  await stanzeCol.updateOne({ codice: stato.codice }, { $set: { valutazioni: righe } });
  return righe;
}
