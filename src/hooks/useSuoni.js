import { useEffect, useRef } from "react";
import { suona } from "../lib/suoni.js";

/**
 * Traduce i cambiamenti di stato in suoni.
 *
 * Sta in un posto solo di proposito: sparpagliare le chiamate dentro i
 * componenti significa suonare due volte quando un componente si rimonta,
 * o restare muti quando cambia solo un ramo dell'interfaccia. Qui si guarda
 * lo stato della partita, che è l'unica verità.
 *
 * Ogni effetto confronta col valore precedente, quindi il primo caricamento
 * non suona nulla: chi entra a partita in corso non deve sentire il riassunto
 * di quello che si è perso.
 */
export function useSuoni(stato, mioId) {
  const primo = useRef(true);
  const tiroVisto = useRef(null);
  const contantiVisti = useRef(null);
  const cartaVista = useRef(null);
  const eraMioTurno = useRef(false);
  const eraAlLargo = useRef(false);
  const eraFinita = useRef(false);

  const io = stato?.giocatori?.find((g) => g.id === mioId) || null;
  const diTurno = stato?.giocatori?.[stato.turno]?.id;

  useEffect(() => {
    if (!stato || !io) return;

    // Primo giro: si prende nota e basta.
    if (primo.current) {
      primo.current = false;
      tiroVisto.current = stato.ultimoTiro?.n ?? 0;
      contantiVisti.current = io.contanti;
      cartaVista.current = stato.pending?.carta?.id ?? null;
      eraMioTurno.current = diTurno === mioId;
      eraAlLargo.current = io.tracciato === "veloce";
      eraFinita.current = stato.fase === "finita";
      return;
    }

    // Il dado di chiunque: è l'evento condiviso del tavolo.
    const n = stato.ultimoTiro?.n ?? 0;
    if (n !== tiroVisto.current) {
      tiroVisto.current = n;
      suona("dado");
    }

    // Una carta nuova sul tavolo.
    const carta = stato.pending?.carta?.id ?? null;
    if (carta && carta !== cartaVista.current) suona("carta");
    cartaVista.current = carta;

    // Il proprio denaro che si muove. Solo il proprio: i conti degli altri
    // cambiano di continuo e sarebbe un carillon.
    if (contantiVisti.current !== null && io.contanti !== contantiVisti.current) {
      suona(io.contanti > contantiVisti.current ? "incasso" : "esborso");
    }
    contantiVisti.current = io.contanti;

    // Tocca a te.
    const mioTurno = diTurno === mioId;
    if (mioTurno && !eraMioTurno.current) suona("tuoTurno");
    eraMioTurno.current = mioTurno;

    // Hai preso il largo.
    const alLargo = io.tracciato === "veloce";
    if (alLargo && !eraAlLargo.current) suona("largo");
    eraAlLargo.current = alLargo;

    // Partita finita.
    const finita = stato.fase === "finita";
    if (finita && !eraFinita.current) suona("vittoria");
    eraFinita.current = finita;
  }, [stato, io, diTurno, mioId]);
}
