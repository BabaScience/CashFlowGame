import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bottone } from "../components/Base.jsx";
import { LEZIONI, AVVERTENZA } from "../contenuti/lezioni.js";
import { QUESITI, testoDi, quesitoDelGiorno } from "../contenuti/quesiti.js";
import { useLingua } from "../Lingua.jsx";

/**
 * IMPARA — lezioni e quesiti.
 *
 * Due formati con due scopi diversi. Le lezioni spiegano un meccanismo in
 * tre minuti e usano i numeri veri del mercato. I quesiti sono trenta
 * secondi e servono a scoprire che una cosa che credevi di aver capito non
 * l'avevi capita.
 *
 * L'avvertenza sta in cima e non si può chiudere. Non è un fastidio legale
 * da sopportare: è la promessa che questo materiale spiega come funzionano
 * le cose e non dice a nessuno che cosa comprare.
 */
export default function Impara({ suEsci }) {
  const { t } = useLingua();
  const [modo, setModo] = useState("lezioni");
  const [aperta, setAperta] = useState(null);

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="flex tra cen mt20 mb12">
          <h1 className="titolo f22" style={{ margin: 0 }}>{t("impara.titolo")}</h1>
          <button className="f13 tenue" onClick={suEsci}
            style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            {t("sfida.tornaInizio")}
          </button>
        </div>

        <p className="avvertenza">{AVVERTENZA}</p>

        <div className="flex g8 mb12">
          <button className={`btn ${modo === "lezioni" ? "btn-oro" : "btn-chiaro"}`}
            onClick={() => { setModo("lezioni"); setAperta(null); }}>
            {t("impara.lezioni")}
          </button>
          <button className={`btn ${modo === "quesiti" ? "btn-oro" : "btn-chiaro"}`}
            onClick={() => { setModo("quesiti"); setAperta(null); }}>
            {t("impara.quesiti")}
          </button>
        </div>

        {modo === "lezioni" ? <Lezioni aperta={aperta} setAperta={setAperta} />
                            : <Quesiti />}
      </div>
    </div>
  );
}

/* ── lezioni ───────────────────────────────────────────────── */

function Lezioni({ aperta, setAperta }) {
  const { t } = useLingua();
  return (
    <div>
      {LEZIONI.map((l) => {
        const apertaOra = aperta === l.id;
        return (
          <div key={l.id} className="carta mb8">
            <button className="voce-lezione" aria-expanded={apertaOra}
              onClick={() => setAperta(apertaOra ? null : l.id)}>
              <span>
                <span className="grassetto f15">{l.titolo}</span><br />
                <span className="f12 tenue">{l.sommario}</span>
              </span>
              <span className="f12 tenue" style={{ flex: "none", marginLeft: 10 }}>
                {l.minuti} {t("impara.minuti")}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {apertaOra && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: "hidden" }}>
                  <div style={{ paddingTop: 12 }}>
                    {l.corpo().map((p, i) => (
                      <p key={i} className="f14" style={{ margin: "0 0 12px", lineHeight: 1.55 }}>{p}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ── quesiti ───────────────────────────────────────────────── */

function Quesiti() {
  const { t } = useLingua();
  const [indice, setIndice] = useState(() => QUESITI.indexOf(quesitoDelGiorno()));
  const [scelta, setScelta] = useState(null);
  const q = QUESITI[Math.max(0, indice) % QUESITI.length];
  const risposto = scelta !== null;
  const giusto = scelta === q.giusta;

  const avanti = () => {
    setScelta(null);
    setIndice((i) => (i + 1) % QUESITI.length);
  };

  return (
    <div className="carta">
      <div className="maiusc tenue mb8">{q.titolo}</div>
      <p className="f15" style={{ margin: "0 0 16px", lineHeight: 1.55 }}>{testoDi(q.domanda)}</p>

      <div className="flex" style={{ flexDirection: "column", gap: 8 }}>
        {q.opzioni.map((o) => {
          const stato = !risposto ? "" : o.id === q.giusta ? "giusta" : o.id === scelta ? "sbagliata" : "";
          return (
            <button key={o.id} className="opzione" data-stato={stato}
              disabled={risposto} onClick={() => setScelta(o.id)}>
              {o.testo}
            </button>
          );
        })}
      </div>

      {risposto && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <p className="f13 grassetto" style={{ margin: "16px 0 6px", color: giusto ? "var(--verde)" : "var(--rosso)" }}>
            {giusto ? t("impara.giusto") : t("impara.sbagliato")}
          </p>
          {/* La spiegazione si mostra anche a chi ha indovinato: chi
              indovina senza capire non ha imparato niente. */}
          <p className="f14" style={{ margin: "0 0 14px", lineHeight: 1.55 }}>
            {testoDi(q.spiegazione)}
          </p>
          <Bottone variante="btn-oro" onClick={avanti}>{t("impara.prossimo")}</Bottone>
        </motion.div>
      )}
    </div>
  );
}
