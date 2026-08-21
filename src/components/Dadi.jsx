import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLingua } from "../Lingua.jsx";

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
  const { t } = useLingua();
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
    /* Si dipende dal NUMERO del tiro, non dall'oggetto.
       `stato.ultimoTiro` arriva dal server a ogni interrogazione — una ogni
       1,4 secondi — ed è un oggetto nuovo ogni volta. Dipendendo
       dall'oggetto, l'effetto si rilanciava di continuo: React eseguiva
       prima la pulizia (che spegne il timer già avviato), poi il corpo
       usciva subito perché il numero non era cambiato, e il timer nuovo non
       veniva mai acceso. Risultato: i dadi restavano sul tabellone per
       sempre, fino al tiro successivo. */
  }, [tiro?.n]);

  const mio = tiro?.giocatoreId === mioId;

  return (
    /* ═══ SENZA AnimatePresence, DI PROPOSITO ═══
     *
     * `AnimatePresence` tiene in vita un figlio finché la sua animazione
     * d'uscita non dichiara di essere finita. Qui non lo dichiarava mai, e
     * ogni tiro lasciava sul tabellone un riquadro invisibile che non se ne
     * andava più: dopo qualche giro se ne trovavano due, tre, sovrapposti,
     * e quando uno di quelli veniva rianimato compariva sopra la plancia
     * senza motivo. È il difetto per cui "si vedono i dadi e non si vede
     * più il tabellone".
     *
     * Un elemento che compare, sta due secondi e sparisce non ha bisogno di
     * niente di tutto questo: basta non disegnarlo. L'entrata la fa il CSS;
     * l'uscita è semplicemente la fine del suo turno.
     */
    <div className="tiro-velo" aria-hidden={!visibile}>
      {visibile && tiro && (
        <div className="tiro" role="status" aria-live="polite">
          <div className="tiro-chi" style={{ color: tiro.colore }}>
            {mio ? t("partita.haiTirato") : t("partita.tira", { nome: tiro.nome })}
          </div>
          <div className="tiro-dadi">
            {tiro.valori.map((v, i) => <Dado key={`${tiro.n}-${i}`} valore={v} ritardo={i} />)}
          </div>
          <div className="tiro-totale numeri">
            {tiro.valori.length > 1 ? `${tiro.valori.join(" + ")} = ${tiro.totale}` : tiro.totale}
          </div>
        </div>
      )}
    </div>
  );
}
