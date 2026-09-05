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
  /* Il numero di giro: cambia a ogni cambio di stanza, e le risposte in
     ritardo del giro precedente si riconoscono e si buttano. */
  const giro = useRef(0);
  const timer = useRef(null);

  const applica = useCallback((s) => {
    if (!s) return;
    versione.current = s.versione;
    statoRef.current = s;
    setStato(s);
  }, []);

  /**
   * Una lettura.
   *
   * `miaVolta` è il numero di giro del ciclo che l'ha chiesta. Passare da
   * una stanza a un'altra — la rivincita, o una partita ripresa
   * dall'elenco — lascia in volo la richiesta della stanza vecchia: quando
   * torna, senza questo controllo scrive la sua versione nel riferimento
   * condiviso e da lì in poi i due cicli si pestano i piedi a vicenda.
   * Succedeva davvero: due catene di polling, una che chiedeva la stanza
   * nuova con la versione della vecchia e una il contrario, e la
   * schermata che restava su quella sbagliata.
   */
  const aggiorna = useCallback(async (miaVolta) => {
    if (!codice) return;
    try {
      const r = await api.leggiStato(codice, versione.current);
      if (giro.current !== miaVolta) return;
      if (!r.invariato) applica(r.stato);
      setErrore(null);
    } catch (e) {
      if (giro.current !== miaVolta) return;
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
    const miaVolta = ++giro.current;
    clearTimeout(timer.current);
    /* Stanza nuova, conti da zero: tenere la versione della precedente
       farebbe rispondere 204 ("non è cambiato niente") su una stanza che
       non abbiamo mai letto, e resteremmo a guardare quella di prima. */
    versione.current = 0;
    statoRef.current = null;

    if (!codice) {
      setStato(null);
      setCaricamento(false);
      return () => { giro.current++; };
    }

    setCaricamento(true);
    const ciclo = async () => {
      await aggiorna(miaVolta);
      if (giro.current !== miaVolta) return;
      setCaricamento(false);
      timer.current = setTimeout(ciclo, ritmo());
    };
    ciclo();

    // Tornando sull'app si ricarica subito, senza aspettare il turno di polling.
    const suVisibilita = () => {
      if (document.hidden || giro.current !== miaVolta) return;
      clearTimeout(timer.current);
      ciclo();
    };
    document.addEventListener("visibilitychange", suVisibilita);

    return () => {
      giro.current++;
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

  return { stato, errore, caricamento, inAzione, invia, aggiorna: () => aggiorna(giro.current), applica };
}
