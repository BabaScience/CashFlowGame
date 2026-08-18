import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soldi } from "../game/finanze.js";
import { CATEGORIE } from "../game/data/mazzi.js";

/**
 * Contenitore di una carta pescata: parte coperta e si gira.
 * L'animazione serve a dare il tempo di "vedere" che è stata pescata,
 * come quando qualcuno gira una carta sul tavolo.
 */
export default function CartaGioco({ classe = "c-piccoli", etichetta, titolo, children, chiave }) {
  // La copertura è puramente decorativa: il fronte della carta è SEMPRE
  // disegnato sotto. Se l'animazione non parte — scheda in secondo piano,
  // fotogrammi sospesi dal browser, "riduci animazioni" attivo — la carta
  // resta comunque leggibile, perché la copertura viene tolta da un timer
  // e non dal termine dell'animazione.
  const [coperta, setCoperta] = useState(true);

  useEffect(() => {
    setCoperta(true);
    const t = setTimeout(() => setCoperta(false), 620);
    return () => clearTimeout(t);
  }, [chiave]);

  return (
    <div className="scena mb16">
      <div className="gioco-carta">
        <div className={`faccia ${classe}`} style={{ boxShadow: "var(--ombra-carta)" }}>
          {etichetta && <div className="maiusc mb8" style={{ opacity: 0.62 }}>{etichetta}</div>}
          {titolo && <div className="titolo f18 mb8" style={{ lineHeight: 1.2 }}>{titolo}</div>}
          {children}
        </div>

        <AnimatePresence>
          {coperta && (
            <motion.div
              className="faccia copertura"
              aria-hidden="true"
              initial={{ rotateY: 0, opacity: 1 }}
              animate={{ rotateY: -96, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.58, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="ta-c">
                <div style={{ fontSize: 30 }}>◆</div>
                <div className="maiusc mt8" style={{ opacity: 0.8 }}>Cashflow</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Riga di dettaglio economico dentro una carta. */
export const Voce = ({ k, v, forte }) => (
  <div className="kv" style={forte ? { borderTop: "2px solid rgba(0,0,0,.12)" } : undefined}>
    <span className="kv-k">{k}</span>
    <span className="kv-v">{v}</span>
  </div>
);

/** Rendimento annuo sull'acconto: la metrica che insegna il gioco. */
export function roi(flusso, acconto) {
  if (!acconto) return null;
  return Math.round((flusso * 12 * 100) / acconto);
}

/** Corpo di una carta Opportunità. */
export function CorpoAffare({ carta }) {
  if (carta.tipo === "azione") {
    return (
      <>
        <p className="f14 mb12" style={{ margin: "0 0 12px", lineHeight: 1.45 }}>{carta.testo}</p>
        <Voce k="Simbolo" v={carta.simbolo} />
        <Voce k="Prezzo di oggi" v={soldi(carta.prezzo)} />
        <Voce k="Dividendo mensile" v={carta.dividendo ? `${soldi(carta.dividendo)} / azione` : "nessuno"} />
        <Voce k="Fascia di oscillazione" v={`${soldi(carta.min)} – ${soldi(carta.max)}`} />
      </>
    );
  }
  if (carta.tipo === "spesa") {
    return (
      <>
        <p className="f14" style={{ margin: "0 0 12px", lineHeight: 1.45 }}>{carta.testo}</p>
        <Voce k="Costo" v={soldi(carta.importo)} forte />
        {carta.condizione === "immobile" && (
          <p className="f12 tenue mt8" style={{ margin: "8px 0 0" }}>
            Si paga solo se possiedi almeno un immobile.
          </p>
        )}
      </>
    );
  }
  const r = roi(carta.flusso, carta.acconto);
  return (
    <>
      <p className="f14" style={{ margin: "0 0 12px", lineHeight: 1.45 }}>{carta.testo}</p>
      {carta.categoria && CATEGORIE[carta.categoria] && (
        <div className="tag tag-verde mb8">{CATEGORIE[carta.categoria]}</div>
      )}
      <Voce k="Costo totale" v={soldi(carta.costo)} />
      <Voce k="Acconto richiesto" v={soldi(carta.acconto)} />
      <Voce k={carta.tipo === "immobile" ? "Mutuo" : "Debito"} v={soldi(carta.mutuo ?? carta.passivita ?? 0)} />
      <Voce k="Flusso mensile" v={carta.flusso ? `+${soldi(carta.flusso)}` : "nessuno"} forte />
      {r !== null && carta.flusso > 0 && (
        <p className="f12 tenue" style={{ margin: "10px 0 0" }}>
          Rendimento sull'acconto: <strong>{r}%</strong> all'anno
          ({soldi(carta.flusso)} × 12 ÷ {soldi(carta.acconto)}).
        </p>
      )}
    </>
  );
}
