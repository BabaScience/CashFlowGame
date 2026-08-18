import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* Posizione dei pallini per ogni faccia, su griglia 3×3. */
const FACCE = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Faccia({ valore }) {
  const attivi = new Set(FACCE[valore] || []);
  return (
    <div className="dado">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="pip" style={{ opacity: attivi.has(i) ? 1 : 0 }} />
      ))}
    </div>
  );
}

/** Un dado che rotola prima di fermarsi sul risultato. */
function Dado({ valore, ritardo = 0 }) {
  const [faccia, setFaccia] = useState(valore);
  const [rotola, setRotola] = useState(true);

  useEffect(() => {
    setRotola(true);
    let n = 0;
    const i = setInterval(() => {
      setFaccia(1 + Math.floor(Math.random() * 6));
      n += 1;
      if (n > 8 + ritardo * 3) {
        clearInterval(i);
        setFaccia(valore);
        setRotola(false);
      }
    }, 65);
    return () => clearInterval(i);
  }, [valore, ritardo]);

  return (
    <motion.div
      animate={rotola
        ? { rotate: [0, -14, 12, -8, 0], y: [0, -16, 0, -7, 0] }
        : { rotate: 0, y: 0, scale: [1.12, 1] }}
      transition={rotola
        ? { duration: 0.62, repeat: Infinity, ease: "easeInOut" }
        : { duration: 0.26, type: "spring", stiffness: 400, damping: 14 }}
    >
      <Faccia valore={faccia} />
    </motion.div>
  );
}

export default function Dadi({ dado }) {
  if (!dado) return null;
  return (
    <div className="flex g12 cen" style={{ justifyContent: "center" }}>
      {dado.valori.map((v, i) => <Dado key={`${dado.totale}-${i}-${v}`} valore={v} ritardo={i} />)}
      {dado.valori.length > 1 && (
        <div className="ta-c" style={{ minWidth: 46 }}>
          <div className="numeri f28 grassetto" style={{ color: "var(--oro-chiaro)" }}>{dado.totale}</div>
          <div className="f11 tenue">totale</div>
        </div>
      )}
    </div>
  );
}
