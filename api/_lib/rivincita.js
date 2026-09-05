/**
 * La rivincita.
 *
 * Il momento in cui si decide se una persona giocherà di nuovo è quello
 * subito dopo la sconfitta, e dura pochi secondi. Se in quei secondi
 * l'unica strada è tornare alla schermata iniziale, creare una stanza,
 * copiare un codice e mandarlo, non gioca di nuovo quasi nessuno.
 *
 * Qui la stanza nuova nasce con gli stessi giocatori già dentro e la
 * partita già avviata: chi accetta ci si ritrova, e basta.
 *
 * Sta in un file suo perché la usano sia la funzione serverless sia la
 * copia in memoria dello sviluppo, e perché la regola su chi può chiederla
 * — *un giocatore di quella partita, e solo a partita finita* — è una di
 * quelle che non devono esistere in due copie.
 */
import { creaStanza, applicaAzione } from "../../src/game/motore.js";

/**
 * Costruisce lo stato della rivincita a partire da una partita finita.
 * Restituisce `{ stato }` oppure `{ errore }`.
 *
 * Non tocca nessun database: chi chiama ci pensa a scriverlo.
 */
export function statoRivincita(vecchia, codiceNuovo, chiediChi) {
  if (!vecchia) return { errore: "Stanza non trovata." };
  if (vecchia.fase !== "finita") return { errore: "La partita non è finita." };
  if (!vecchia.giocatori.some((g) => g.id === chiediChi && !g.bot)) {
    return { errore: "Solo chi ha giocato può chiedere la rivincita." };
  }

  /* L'host della rivincita è chi la chiede: l'ha voluta lui. */
  let stato = creaStanza(codiceNuovo, chiediChi, {
    mercatoId: vecchia.mercatoId,
    versioneDati: vecchia.versioneDati,
    livello: vecchia.livello,
    formato: vecchia.formato,
  });

  /* Stessi giocatori, stesse professioni, stessi sogni: la rivincita è la
     stessa partita, altrimenti è un'altra partita.
     Chi tira per primo NON lo decidiamo qui: `avvia` fa tirare i dadi
     come in qualunque altra partita. Dare il primo turno a chi chiede la
     rivincita sarebbe un vantaggio regalato a chi ha perso — o a chi ha
     vinto, a seconda di chi preme prima. */
  for (const g of vecchia.giocatori) {
    const r = applicaAzione(stato, {
      tipo: "entra", giocatoreId: g.id, bot: Boolean(g.bot), nome: g.nome,
      professioneId: g.professioneId, sognoId: g.sognoId,
    });
    if (r.errore) return { errore: r.errore };
    stato = r.stato;
  }

  const avvio = applicaAzione(stato, { tipo: "avvia", giocatoreId: chiediChi });
  if (avvio.errore) return { errore: avvio.errore };
  return { stato: avvio.stato };
}
