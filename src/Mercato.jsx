import React, { createContext, useContext, useMemo } from "react";
import { getPacchetto, pacchettoDi } from "./game/mercati/indice.js";
import { flussoAlLivello, vociFlusso, LIVELLO_PREDEFINITO } from "./game/regole/livelli.js";
import { soldi as formatta, impostaValutaCorrente } from "./game/finanze.js";

/**
 * IL MERCATO CORRENTE, A DISPOSIZIONE DI TUTTA L'INTERFACCIA.
 *
 * Prima ogni componente importava direttamente i dati — le professioni, i
 * sogni, le categorie — da moduli globali. Funziona finché il gioco ha una
 * sola economia, e smette di funzionare al secondo mercato: due tavoli
 * aperti su città diverse leggerebbero gli stessi numeri.
 *
 * Qui il pacchetto arriva dallo stato della partita (che porta con sé
 * `mercatoId` e `versioneDati`) e scende a tutti per contesto, senza
 * trascinarlo di proprietà in proprietà. Fuori da una partita — la
 * schermata d'ingresso, dove il mercato si sta ancora scegliendo — si passa
 * `mercatoId` a mano.
 */
const Contesto = createContext(null);

export function MercatoProvider({ stato, mercatoId, children }) {
  const valore = useMemo(() => {
    const pacchetto = stato ? pacchettoDi(stato) : getPacchetto(mercatoId);
    const { valuta } = pacchetto;
    const livello = stato?.livello ?? LIVELLO_PREDEFINITO;
    // Da qui in poi ogni soldi() dell'interfaccia parla la valuta giusta.
    impostaValutaCorrente(valuta);
    return {
      pacchetto,
      valuta,
      /** Un importo nella valuta di questo mercato. */
      soldi: (n) => formatta(n, valuta),
      professioni: pacchetto.professioni,
      sogni: pacchetto.sogni,
      categorie: pacchetto.categorie,
      etichetteSpese: pacchetto.etichetteSpese,
      etichettePassivita: pacchetto.etichettePassivita,
      debitiEstinguibili: pacchetto.debitiEstinguibili,
      obiettivo: pacchetto.obiettivoRendita,
    obiettivoLargo: pacchetto.obiettivoLargo,
      livello,
      /* Il flusso di una carta al livello di QUESTA stanza. La carta porta
         stampato il numero del Livello 1: mostrarlo così com'è al Livello 2
         significa far decidere su un numero che poi non si avvera — la
         carta prometteva +151 e l'immobile ne rendeva -20. */
      flussoDi: (carta) => flussoAlLivello(carta, livello, pacchetto.fisco),
      vociDi: (carta) => vociFlusso(carta, livello, pacchetto.fisco),
      trovaProfessione: (id) =>
        pacchetto.professioni.find((p) => p.id === id) || pacchetto.professioni[0],
      trovaSogno: (id) => pacchetto.sogni.find((x) => x.id === id) || pacchetto.sogni[0],
      trovaAffare: (id) => pacchetto.affariLargo.find((a) => a.id === id),
    };
  }, [stato, mercatoId]);

  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>;
}

/**
 * Il mercato della partita in corso.
 * Il ripiego sul mercato predefinito evita che un componente montato fuori
 * dal provider faccia esplodere lo schermo: meglio numeri di riserva che
 * una pagina bianca.
 */
export function useMercato() {
  const v = useContext(Contesto);
  if (v) return v;
  const pacchetto = getPacchetto();
  return {
    pacchetto,
    valuta: pacchetto.valuta,
    soldi: (n) => formatta(n, pacchetto.valuta),
    professioni: pacchetto.professioni,
    sogni: pacchetto.sogni,
    categorie: pacchetto.categorie,
    etichetteSpese: pacchetto.etichetteSpese,
    etichettePassivita: pacchetto.etichettePassivita,
    debitiEstinguibili: pacchetto.debitiEstinguibili,
    obiettivo: pacchetto.obiettivoRendita,
    obiettivoLargo: pacchetto.obiettivoLargo,
    trovaProfessione: (id) => pacchetto.professioni.find((p) => p.id === id) || pacchetto.professioni[0],
    trovaSogno: (id) => pacchetto.sogni.find((x) => x.id === id) || pacchetto.sogni[0],
    trovaAffare: (id) => pacchetto.affariLargo.find((a) => a.id === id),
  };
}
