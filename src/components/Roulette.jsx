import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bottone } from "./Base.jsx";
import { soldi } from "../game/finanze.js";
import { useLingua } from "../Lingua.jsx";
import { useMercato } from "../Mercato.jsx";

/**
 * CHI SEI, QUESTA VOLTA.
 *
 * Chi entra dalla coda o gioca contro il computer non sceglie il mestiere:
 * glielo pesca il server. Prima gliene toccava sempre lo stesso — il primo
 * dell'elenco — e chi ha giocato tre partite di fila si è convinto che nel
 * gioco esista un mestiere solo, il pilota. Ce ne sono tredici.
 *
 * Ma non basta che sia diverso: bisogna **vederlo cambiare**. Una scheda
 * che compare già compilata si legge come un dato di fatto; un rullo che
 * gira e si ferma si legge come un'estrazione, e la volta dopo si guarda
 * per sapere cos'è uscito. È la stessa differenza che c'è fra ricevere una
 * carta e vederla pescare.
 *
 * Il rullo non decide niente: la professione è già stata scelta dal server
 * ed è la stessa per tutti al tavolo. Qui si mostra soltanto — girare per
 * finta su un esito già scritto è quello che fa qualunque slot machine, e
 * nessuno lo considera un imbroglio finché il risultato non dipende dal
 * rullo. Qui non dipende.
 */

/* Quanto dura il giro, e quanti nomi passano prima di fermarsi. */
const MS_GIRO = 1500;
const TAPPE = 14;

export default function Roulette({ professioneId, suContinua }) {
  const { t } = useLingua();
  const { professioni, trovaProfessione } = useMercato();
  const scelta = trovaProfessione(professioneId);
  const [ferma, setFerma] = useState(false);
  const [i, setI] = useState(0);
  const tempi = useRef([]);

  useEffect(() => {
    /* Le tappe rallentano verso la fine: un rullo che si ferma di colpo
       sembra rotto, uno che decelera sembra un rullo. */
    tempi.current.forEach(clearTimeout);
    tempi.current = [];
    let quando = 0;
    for (let k = 0; k < TAPPE; k++) {
      /* Da un ritmo veloce a uno lento: la somma fa MS_GIRO. */
      const peso = (k + 1) / TAPPE;
      quando += (MS_GIRO / TAPPE) * (0.45 + 1.1 * peso * peso);
      const indice = k;
      tempi.current.push(setTimeout(() => setI(indice + 1), quando));
    }
    tempi.current.push(setTimeout(() => setFerma(true), quando + 120));
    return () => tempi.current.forEach(clearTimeout);
  }, [professioneId]);

  /* Durante il giro si mostrano nomi qualunque; alla fine, quello vero.
     L'elenco parte da una posizione che dipende dalla professione scelta,
     così due giri diversi non mostrano la stessa sequenza. */
  const partenza = Math.max(0, professioni.findIndex((p) => p.id === professioneId));
  const mostrata = ferma
    ? scelta
    : professioni[(partenza + i * 5 + 1) % professioni.length];

  const spese = Object.values(scelta.spese).reduce((a, b) => a + b, 0);

  return (
    <div className="carta ta-c mt12">
      <div className="etichetta" style={{ margin: 0 }}>
        {t(ferma ? "roulette.seiTu" : "roulette.estrazione")}
      </div>

      <div className="rullo" aria-live="polite">
        <motion.div
          key={mostrata.id + (ferma ? "-fine" : "-giro")}
          initial={{ y: ferma ? 0 : -14, opacity: ferma ? 1 : 0.35 }}
          animate={{ y: 0, opacity: 1 }}
          transition={ferma ? { type: "spring", stiffness: 300, damping: 18 } : { duration: 0.08 }}
        >
          <div className="rullo-emoji" aria-hidden="true">{mostrata.emoji}</div>
          <div className="rullo-nome titolo">{mostrata.nome}</div>
        </motion.div>
      </div>

      {/* I numeri compaiono solo alla fine: leggerli mentre cambiano non
          serve a niente e fa sembrare che stiano cambiando anche loro. */}
      {ferma && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="carta mt12" style={{ background: "#F2F0E6", padding: 12 }}>
            <div className="flex tra f13">
              <span className="tenue">{t("ingresso.stipendio")}</span>
              <span className="numeri">{soldi(scelta.stipendio)}</span>
            </div>
            <div className="flex tra f13">
              <span className="tenue">{t("ingresso.speseTotali")}</span>
              <span className="numeri">{soldi(spese)}</span>
            </div>
            <div className="flex tra f13 grassetto"
              style={{ borderTop: "1px dashed var(--linea)", paddingTop: 6, marginTop: 6 }}>
              <span>{t("ingresso.giornoDiPaga")}</span>
              <span className="numeri pos">{soldi(scelta.stipendio - spese)}</span>
            </div>
          </div>

          <p className="f12 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
            {t("roulette.stessaPerTutti")}
          </p>

          <Bottone variante="btn-verde mt12" onClick={suContinua}>
            {t("roulette.comincia")}
          </Bottone>
        </motion.div>
      )}
    </div>
  );
}
