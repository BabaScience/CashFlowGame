import React from "react";
import { motion } from "framer-motion";
import { GettoneGiocatore, Barra, Denaro } from "./Base.jsx";
import { soldi, riepilogo } from "../game/finanze.js";
import { getProfessione } from "../game/data/professioni.js";
import { getSogno } from "../game/data/corsiaVeloce.js";
import { OBIETTIVO_CASHFLOW as META } from "../game/data/tabellone.js";

/**
 * Il pannello degli avversari: si vede il cashflow di tutti crescere.
 * È metà del gusto del gioco da tavolo — capire chi sta per uscire dalla corsa.
 */
export default function Giocatori({ stato, mioId, compatto }) {
  const diTurno = stato.giocatori[stato.turno]?.id;

  return (
    <div className={compatto ? "" : "carta-scura"}>
      {!compatto && <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>Al tavolo</div>}
      {stato.giocatori.map((g, i) => {
        const r = riepilogo(g);
        const prof = getProfessione(g.professioneId);
        const sogno = getSogno(g.sognoId);
        const veloce = g.tracciato === "veloce";
        const progressoVeloce = veloce
          ? (g.redditoCashflowDay - g.redditoInizialeVeloce) / META
          : 0;

        return (
          <motion.div
            key={g.id}
            className="riga-giocatore"
            initial={false}
            animate={{ opacity: g.eliminato ? 0.45 : 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ position: "relative" }}>
              <GettoneGiocatore giocatore={g} />
              {g.id === diTurno && stato.fase === "inCorso" && (
                <motion.span
                  style={{
                    position: "absolute", inset: -4, borderRadius: "50%",
                    border: `2px solid ${g.colore}`,
                  }}
                  animate={{ opacity: [0.9, 0.2, 0.9] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex tra cen g8">
                <span className="grassetto f14" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {g.nome}{g.id === mioId && <span className="tenue"> · tu</span>}
                </span>
                <span className="numeri f13 grassetto" style={{ flex: "none" }}>{soldi(g.contanti)}</span>
              </div>

              <div className="flex tra cen g8" style={{ marginTop: 2 }}>
                <span className="f11 tenue" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {veloce ? "🏁 Corsia Veloce" : `${prof.emoji} ${prof.nome}`}
                  {g.eliminato && " · fuori"}
                  {g.turniDaSaltare > 0 && ` · salta ${g.turniDaSaltare}`}
                </span>
                <span className="f11 numeri" style={{ flex: "none", color: "var(--oro-chiaro)" }}>
                  {veloce
                    ? `${soldi(g.redditoCashflowDay)}/mese`
                    : `${soldi(r.redditoPassivo)} / ${soldi(r.speseTotali)}`}
                </span>
              </div>

              <div className="mt4">
                <Barra scura valore={veloce ? progressoVeloce : r.progresso} />
              </div>
            </div>

            <span style={{ fontSize: 17, flex: "none" }} title={sogno.nome}>{sogno.emoji}</span>
          </motion.div>
        );
      })}

      {!compatto && (
        <p className="f11 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
          La barra mostra quanto il reddito passivo copre le spese. Quando arriva in
          fondo, quel giocatore può uscire dalla Corsa dei Topi.
        </p>
      )}
    </div>
  );
}
