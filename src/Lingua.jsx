import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { traduci, linguaCorrente, impostaLingua, LINGUE } from "./i18n/index.js";

/**
 * LA LINGUA DELL'INTERFACCIA.
 *
 * Vive fuori dal mercato e sopra di esso: cambiare lingua non cambia i
 * prezzi, cambiare mercato non cambia la lingua. Sono le due metà della
 * stessa promessa — un francese gioca Roma in francese, un italiano gioca
 * Parigi in italiano — e tenerle separate qui costa molto meno che
 * separarle al secondo mercato.
 */
const Contesto = createContext(null);

export function LinguaProvider({ children }) {
  const [lingua, setLinguaStato] = useState(() => {
    const l = linguaCorrente();
    if (typeof document !== "undefined") document.documentElement.lang = l;
    return l;
  });

  const cambiaLingua = useCallback((id) => setLinguaStato(impostaLingua(id)), []);

  const valore = useMemo(() => ({
    lingua,
    cambiaLingua,
    lingue: LINGUE,
    /** `t("ingresso.creaStanza")`, con eventuali valori da sostituire. */
    t: (chiave, valori) => traduci(lingua, chiave, valori),
  }), [lingua, cambiaLingua]);

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>;
}

/**
 * Il ripiego serve a non far esplodere un componente montato fuori dal
 * provider: meglio testo in italiano che una schermata bianca.
 */
export function useLingua() {
  return useContext(Contesto) || {
    lingua: "it",
    cambiaLingua: () => {},
    lingue: LINGUE,
    t: (chiave, valori) => traduci("it", chiave, valori),
  };
}
