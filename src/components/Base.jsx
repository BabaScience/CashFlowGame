import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soldi } from "../game/finanze.js";

export const Bottone = ({ children, variante = "", className = "", ...resto }) => (
  <button className={`btn ${variante} ${className}`} {...resto}>{children}</button>
);

export const Sezione = ({ children }) => <div className="sezione-tit">{children}</div>;

export const KV = ({ k, v, forte, colore, mono = true }) => (
  <div className={`kv ${forte ? "kv-forte" : ""}`}>
    <span className="kv-k">{k}</span>
    <span className={`kv-v ${colore || ""}`} style={mono ? undefined : { fontFamily: "var(--f-testo)" }}>{v}</span>
  </div>
);

export const Denaro = ({ v, segno }) => (
  <span className={v > 0 ? "pos" : v < 0 ? "neg" : ""}>
    {segno && v > 0 ? "+" : ""}{soldi(v)}
  </span>
);

export const Barra = ({ valore, scura }) => (
  <div className={`barra ${scura ? "barra-scura" : ""}`}>
    <motion.div
      className="barra-int"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, valore * 100))}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    />
  </div>
);

export const GettoneGiocatore = ({ giocatore, piccolo }) => (
  <span
    className={`gettone ${piccolo ? "gettone-p" : ""}`}
    style={{ background: giocatore.colore, opacity: giocatore.eliminato ? 0.45 : 1 }}
    title={giocatore.nome}
  >
    {giocatore.nome.slice(0, 2).toUpperCase()}
  </span>
);

export function Avviso({ testo }) {
  return (
    <AnimatePresence>
      {testo && (
        <motion.div
          className="avviso"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {testo}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Foglio che sale dal basso: usato per tutte le decisioni. */
export function Foglio({ aperto, children, suChiudi, chiudibile = false }) {
  if (!aperto) return null;
  return (
    <div className="velo" onClick={chiudibile ? suChiudi : undefined}>
      <div className="modale" onClick={(e) => e.stopPropagation()}>
        {chiudibile && <div className="maniglia" />}
        {children}
      </div>
    </div>
  );
}

/** Contatore che scorre da un valore all'altro: dà il senso del denaro che si muove. */
export function NumeroAnimato({ valore, className = "" }) {
  const [mostrato, setMostrato] = React.useState(valore);
  const rif = React.useRef(valore);
  React.useEffect(() => {
    const da = rif.current, a = valore;
    rif.current = a;
    if (da === a) return;
    const durata = 520, t0 = performance.now();
    let raf;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / durata);
      const e = 1 - Math.pow(1 - p, 3);
      setMostrato(Math.round(da + (a - da) * e));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valore]);
  return <span className={className}>{soldi(mostrato)}</span>;
}
