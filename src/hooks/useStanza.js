import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../lib/api.js";

/** Ogni quanto interrogare il server, a seconda di cosa sta succedendo. */
const RITMO = {
  tuoTurno: 2500,   // la palla è tua: il server non ha novità da darti
  altrui:   1400,   // stai aspettando un altro giocatore: serve reattività
  nascosto: 8000,   // scheda in secondo piano
  finita:  15000,   // partita conclusa
};

/**
 * Tiene sincronizzata la stanza col server.
 * Il client non calcola mai lo stato di gioco: lo chiede e lo mostra.
 * Il ritmo si adatta da solo per non sprecare né batteria né letture.
 */
export function useStanza(codice, mioId) {
  const [stato, setStato] = useState(null);
  const [errore, setErrore] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [inAzione, setInAzione] = useState(false);

  const versione = useRef(0);
  const statoRef = useRef(null);
  const vivo = useRef(true);
  const timer = useRef(null);

  const applica = useCallback((s) => {
    if (!s) return;
    versione.current = s.versione;
    statoRef.current = s;
    setStato(s);
  }, []);

  const aggiorna = useCallback(async () => {
    if (!codice) return;
    try {
      const r = await api.leggiStato(codice, versione.current);
      if (!vivo.current) return;
      if (!r.invariato) applica(r.stato);
      setErrore(null);
    } catch (e) {
      if (!vivo.current) return;
      setErrore(e.codiceHttp === 404 ? "Stanza non trovata o scaduta." : "Connessione persa, riprovo…");
    }
  }, [codice, applica]);

  /** Quanto aspettare prima della prossima lettura. */
  const ritmo = useCallback(() => {
    if (document.hidden) return RITMO.nascosto;
    const s = statoRef.current;
    if (!s) return RITMO.altrui;
    if (s.fase === "finita") return RITMO.finita;
    if (s.fase === "attesa") return RITMO.altrui;
    const mio = s.giocatori?.[s.turno]?.id === mioId;
    const decidoIo = s.pending && s.pending.giocatoreId === mioId;
    const mercatoAperto = s.pending?.tipo === "mercato" && s.pending.idonei?.includes(mioId)
      && !s.pending.risposto?.includes(mioId);
    if ((mio && !s.pending) || decidoIo || mercatoAperto) return RITMO.tuoTurno;
    return RITMO.altrui;
  }, [mioId]);

  useEffect(() => {
    vivo.current = true;
    clearTimeout(timer.current);

    if (!codice) {
      versione.current = 0;
      statoRef.current = null;
      setStato(null);
      setCaricamento(false);
      return () => { vivo.current = false; };
    }

    setCaricamento(true);
    const ciclo = async () => {
      await aggiorna();
      if (!vivo.current) return;
      setCaricamento(false);
      timer.current = setTimeout(ciclo, ritmo());
    };
    ciclo();

    // Tornando sull'app si ricarica subito, senza aspettare il turno di polling.
    const suVisibilita = () => {
      if (document.hidden || !vivo.current) return;
      clearTimeout(timer.current);
      ciclo();
    };
    document.addEventListener("visibilitychange", suVisibilita);

    return () => {
      vivo.current = false;
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", suVisibilita);
    };
  }, [codice, aggiorna, ritmo]);

  /** Invia una mossa e adotta subito lo stato restituito dal server. */
  const invia = useCallback(async (az) => {
    if (!codice) return { errore: "Nessuna stanza." };
    setInAzione(true);
    try {
      const r = await api.azione(codice, az);
      applica(r.stato);
      return { errore: null };
    } catch (e) {
      if (e.stato) applica(e.stato);   // il server rimanda comunque lo stato valido
      return { errore: e.message };
    } finally {
      setInAzione(false);
    }
  }, [codice, applica]);

  return { stato, errore, caricamento, inAzione, invia, aggiorna, applica };
}
