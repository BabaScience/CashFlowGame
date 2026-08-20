import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Posizione dei pallini per ogni faccia, su griglia 3×3. */
const FACCE = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const menoAnimazioni = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Faccia({ valore }) {
  const attivi = new Set(FACCE[valore] || []);
  return (
    <div className="dado" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="pip" style={{ opacity: attivi.has(i) ? 1 : 0 }} />
      ))}
    </div>
  );
}

/** Un dado che rotola prima di fermarsi sul risultato. */
function Dado({ valore, ritardo = 0 }) {
  const [faccia, setFaccia] = useState(valore);
  const [rotola, setRotola] = useState(!menoAnimazioni());

  useEffect(() => {
    if (menoAnimazioni()) { setFaccia(valore); setRotola(false); return; }
    setRotola(true);
    let n = 0;
    const i = setInterval(() => {
      setFaccia(1 + Math.floor(Math.random() * 6));
      if (++n > 7 + ritardo * 3) {
        clearInterval(i);
        setFaccia(valore);
        setRotola(false);
      }
    }, 60);
    return () => clearInterval(i);
  }, [valore, ritardo]);

  return (
    <motion.div
      animate={rotola
        ? { rotate: [0, -14, 12, -8, 0], y: [0, -18, 0, -8, 0] }
        : { rotate: 0, y: 0, scale: [1.18, 1] }}
      transition={rotola
        ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
        : { duration: 0.3, type: "spring", stiffness: 380, damping: 13 }}
    >
      <Faccia valore={faccia} />
    </motion.div>
  );
}

/**
 * Il lancio, mostrato sopra al tabellone e visibile a tutti.
 *
 * Prima questo componente leggeva `stato.dado`, che il motore azzera al
 * cambio di turno: quando la casella non richiedeva una decisione, il tiro
 * spariva dentro la stessa scrittura e gli altri giocatori — che leggono lo
 * stato ogni 1,4 secondi — non lo vedevano proprio mai. Ora legge
 * `stato.ultimoTiro`, che resta nello stato, e lo tiene a schermo per un
 * tempo minimo: il numero si legge anche se il turno è già passato.
 */
export default function Dadi({ tiro, mioId }) {
  const [visibile, setVisibile] = useState(false);
  const ultimoVisto = useRef(0);
  const montato = useRef(false);

  useEffect(() => {
    // Al montaggio si prende nota del tiro già presente senza rianimarlo:
    // chi entra a partita in corso non deve vedersi ripetere l'ultimo lancio.
    // Va fatto qui e non alla prima variazione, altrimenti il primissimo
    // tiro della partita verrebbe scambiato per "stato iniziale" e ingoiato.
    if (!montato.current) {
      montato.current = true;
      ultimoVisto.current = tiro?.n ?? 0;
      return;
    }
    if (!tiro || tiro.n === ultimoVisto.current) return;
    ultimoVisto.current = tiro.n;
    setVisibile(true);
    const t = setTimeout(() => setVisibile(false), 2600);
    return () => clearTimeout(t);
  }, [tiro]);

  const mio = tiro?.giocatoreId === mioId;

  return (
    <AnimatePresence>
      {visibile && tiro && (
        <div className="tiro-velo" key="velo">
        <motion.div
          className="tiro"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          <div className="tiro-chi" style={{ color: tiro.colore }}>
            {mio ? "Hai tirato" : `${tiro.nome} tira`}
          </div>
          <div className="tiro-dadi">
            {tiro.valori.map((v, i) => <Dado key={`${tiro.n}-${i}`} valore={v} ritardo={i} />)}
          </div>
          <div className="tiro-totale numeri">
            {tiro.valori.length > 1 ? `${tiro.valori.join(" + ")} = ${tiro.totale}` : tiro.totale}
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
