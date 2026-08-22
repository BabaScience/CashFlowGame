import { useEffect, useRef } from "react";
import { mossaBot } from "../game/avversario.js";

/**
 * Fa giocare gli avversari automatici.
 *
 * ═══ PERCHÉ DAL CLIENT ═══
 *
 * Il server è una funzione senza stato: riceve un'azione, la applica, la
 * salva. Non ha un processo che gira e che possa "pensare" per un bot, e
 * dargliene uno vorrebbe dire un servizio in più da tenere acceso e da
 * pagare — proprio la cosa che questo progetto ha evitato ovunque.
 *
 * Quindi la mossa la calcola il browser di chi sta giocando e la manda come
 * qualunque altra azione. Il server non sa che dall'altra parte c'è un
 * programma, e non ha bisogno di saperlo: le regole valgono uguali.
 *
 * ═══ LE DUE PRECAUZIONI ═══
 *
 * La prima è la pausa. Senza, il computer gioca tre turni nel tempo di un
 * battito di ciglia e chi guarda non capisce cos'è successo. Con un secondo
 * e mezzo si vede il dado, si legge la casella, si segue il gettone.
 *
 * La seconda è il lucchetto. Il polling ridisegna in continuazione, e senza
 * un blocco lo stesso turno verrebbe calcolato e mandato più volte: il
 * server rifiuterebbe i doppioni, ma il registro si riempirebbe di errori e
 * la partita andrebbe a scatti.
 */
export function useAvversari(stato, invia, attivo = true) {
  const occupato = useRef(false);
  const ultimaMossa = useRef(null);

  useEffect(() => {
    if (!attivo || !stato || stato.fase !== "inCorso") return;
    if (occupato.current) return;

    /* Chi deve muovere adesso: chi ha una decisione in sospeso, altrimenti
       chi ha il turno. Il Mercato riguarda tutti, quindi si guarda se fra
       gli idonei c'è un bot che non ha ancora risposto. */
    const p = stato.pending;
    let chi = null;
    if (p?.tipo === "mercato") {
      const manca = (p.idonei || []).find((id) => !(p.risposto || []).includes(id));
      chi = stato.giocatori.find((g) => g.id === manca);
    } else if (p) {
      chi = stato.giocatori.find((g) => g.id === p.giocatoreId);
    } else {
      chi = stato.giocatori[stato.turno];
    }
    if (!chi?.bot) return;

    /* La firma di questo momento: se non è cambiata, la mossa è già partita
       e sta solo tornando indietro il vecchio stato. */
    const firma = `${stato.versione}:${chi.id}:${p?.tipo || "turno"}`;
    if (ultimaMossa.current === firma) return;

    const azione = mossaBot(stato);
    if (!azione) return;

    occupato.current = true;
    const t = setTimeout(async () => {
      ultimaMossa.current = firma;
      try { await invia(azione); } catch { /* il polling rimetterà le cose a posto */ }
      finally { occupato.current = false; }
    }, 1500);
    return () => { clearTimeout(t); occupato.current = false; };
  }, [stato, invia, attivo]);
}
