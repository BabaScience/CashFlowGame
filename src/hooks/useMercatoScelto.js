import { useCallback, useEffect, useState } from "react";
import { mercatoIniziale, mercatoDaPercorso, percorsoDi } from "../lib/percorso.js";

const CHIAVE = "quotazero:mercato";

/**
 * QUAL È IL MERCATO SCELTO, IN UN POSTO SOLO.
 *
 * Prima erano due stati indipendenti — uno dentro `Ingresso`, uno dentro
 * `ArenaConMercato` — che leggevano la stessa chiave di `localStorage` e la
 * riscrivevano ognuno per conto suo, con due valori di ripiego diversi
 * (`classico` di qua, `roma` di là). Due copie della stessa regola: in
 * questo progetto è il difetto che si è già ripetuto tre volte.
 *
 * Adesso la regola sta qui, e l'indirizzo è l'autorità: chi apre `/roma`
 * vede Roma, chi cambia mercato cambia indirizzo, e il tasto indietro del
 * browser fa quello che ci si aspetta invece di uscire dal sito.
 */
export function useMercatoScelto() {
  const [mercatoId, setStato] = useState(() =>
    mercatoIniziale(
      typeof location !== "undefined" ? location.pathname : "/",
      leggiSalvato(),
    ));

  /* Scrivere l'indirizzo è un effetto, non parte della scelta: così vale
     anche all'apertura, quando il mercato arriva da `localStorage` e nel
     percorso non c'è ancora. Si sostituisce la voce di cronologia invece di
     aggiungerne una, altrimenti il tasto indietro tornerebbe a una pagina
     identica a quella che si sta guardando. */
  useEffect(() => {
    if (typeof history === "undefined" || typeof location === "undefined") return;
    const atteso = percorsoDi(mercatoId);
    if (location.pathname !== atteso) {
      history.replaceState(null, "", atteso + location.search);
    }
    try { localStorage.setItem(CHIAVE, mercatoId); } catch { /* scheda privata */ }
  }, [mercatoId]);

  /* Il tasto indietro cambia il percorso senza ricaricare: senza questo lo
     schermo resterebbe sul mercato di prima con l'indirizzo dell'altro. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const suPop = () => setStato(mercatoIniziale(location.pathname, leggiSalvato()));
    window.addEventListener("popstate", suPop);
    return () => window.removeEventListener("popstate", suPop);
  }, []);

  /* Cambiare mercato è una destinazione, non una preferenza nascosta:
     aggiunge una voce di cronologia, così ci si torna indietro. */
  const scegli = useCallback((id) => {
    setStato((prima) => {
      if (id === prima) return prima;
      if (typeof history !== "undefined" && typeof location !== "undefined") {
        history.pushState(null, "", percorsoDi(id) + location.search);
      }
      return id;
    });
  }, []);

  return [mercatoId, scegli];
}

function leggiSalvato() {
  try { return localStorage.getItem(CHIAVE); } catch { return null; }
}
