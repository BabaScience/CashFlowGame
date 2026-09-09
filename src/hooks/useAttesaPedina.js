import { useEffect, useRef, useState } from "react";
import { msPrimaDellaCarta } from "../lib/ritmo.js";

/**
 * VERO QUANDO LA PEDINA HA FINITO DI CAMMINARE.
 *
 * La carta non compare insieme al tiro: si guarda la pedina muoversi, e
 * solo quando si è fermata si scopre dov'è finita. Vale per chi decide
 * (il foglio di decisione) e per chi guarda (la carta sul tavolo): se i
 * due tempi si scollassero, uno dei due vedrebbe la carta prima
 * dell'altro — e in una partita fra due persone quello è un vantaggio.
 *
 * Stava dentro Decisione.jsx. È uscito quando è servito anche a
 * SulTavolo: in questo progetto la seconda copia di una cosa ha già preso
 * strade diverse tre volte.
 */
export function useAttesaPedina(stato) {
  const tiro = stato.ultimoTiro;
  const [fermo, setFermo] = useState(true);
  const visto = useRef(tiro?.n ?? 0);

  useEffect(() => {
    const n = tiro?.n ?? 0;
    if (n === visto.current) return;
    visto.current = n;
    /* Scheda in secondo piano: la pedina non si anima, e aspettare
       vorrebbe dire tornare e trovare il foglio ancora chiuso. */
    if (typeof document !== "undefined" && document.hidden) return;
    setFermo(false);
    const durata = msPrimaDellaCarta(tiro?.totale);
    const t = setTimeout(() => setFermo(true), durata);
    return () => clearTimeout(t);
  }, [tiro?.n, tiro?.totale]);

  return fermo;
}
