import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testoRiga } from "../game/messaggi.js";
import { nomiCaselle } from "../i18n/index.js";
import { useLingua } from "../Lingua.jsx";
import { useMercato } from "../Mercato.jsx";

const COLORI = {
  paga: "#D98324", carta: "#4E8B3D", mercato: "#2E6FA8", extra: "#B23A2E",
  beneficenza: "#7B4FA8", figlio: "#2F8F86", licenziamento: "#6B4423",
  bancarotta: "#B23A2E", liberta: "#C9A227", vittoria: "#C9A227",
  veloce: "#C9A227", sogno: "#C2557A", prestito: "#2E6FA8", dado: "#6E7B74",
  turno: "#6E7B74", lobby: "#6E7B74", sistema: "#6E7B74", salto: "#6E7B74",
  penalita: "#B23A2E", info: "#6E7B74",
};

const quando = (t, tr) => {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return tr("registro.ora");
  if (s < 3600) return tr("registro.minutiFa", { n: Math.floor(s / 60) });
  return tr("registro.oreFa", { n: Math.floor(s / 3600) });
};

/** Il registro condiviso: tutti vedono ogni carta pescata e ogni mossa. */
export default function Registro({ stato, limite }) {
  const { lingua, t } = useLingua();
  const { pacchetto } = useMercato();
  /* Nel registro finiscono due generi di nomi scritti dal motore: quelli
     delle carte e quelli delle caselle. Si traducono con la stessa tabella,
     perché al lettore sono la stessa cosa: una parola italiana in mezzo a
     una frase francese. */
  const carte = React.useMemo(
    () => ({ ...(pacchetto.lingue?.[lingua]?.carte || {}), ...nomiCaselle(lingua) }),
    [pacchetto, lingua]);
  const righe = limite ? stato.registro.slice(0, limite) : stato.registro;
  return (
    <div className="carta-scura">
      <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>{t("schede.registro")}</div>
      {righe.length === 0 && <p className="f13 tenue" style={{ margin: 0 }}>{t("registro.vuoto")}</p>}
      <AnimatePresence initial={false}>
        {righe.map((r) => (
          <motion.div
            key={r.id}
            className="riga-log"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="bollo" style={{ background: COLORI[r.tipo] || COLORI.info }} />
            <span style={{ flex: 1 }}>{testoRiga(r, lingua, carte)}</span>
            <span className="f11 tenue" style={{ flex: "none" }}>{quando(r.t, t)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
