import React from "react";
import { motion } from "framer-motion";
import { GettoneGiocatore, Barra, Denaro } from "./Base.jsx";
import { Sagoma } from "./Tabellone.jsx";
import { soldi, riepilogo } from "../game/finanze.js";
import { useMercato } from "../Mercato.jsx";
import { useLingua } from "../Lingua.jsx";

/**
 * Il pannello degli avversari: si vede la rendita di tutti crescere.
 * È metà del gusto del gioco — capire chi sta per prendere il largo.
 */
export default function Giocatori({ stato, mioId, compatto }) {
  const { t } = useLingua();
  const { trovaProfessione, trovaSogno, obiettivo } = useMercato();
  const diTurno = stato.giocatori[stato.turno]?.id;

  return (
    <div className={compatto ? "" : "carta-scura"}>
      {!compatto && <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>{t("comune.alTavolo")}</div>}
      {stato.giocatori.map((g, i) => {
        const r = riepilogo(g);
        const prof = trovaProfessione(g.professioneId);
        const sogno = trovaSogno(g.sognoId);
        const veloce = g.tracciato === "veloce";
        const progressoVeloce = veloce
          ? (g.redditoRendita - g.redditoInizialeVeloce) / obiettivo
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
              {/* La stessa sagoma che porta la pedina sul tabellone. */}
              <span style={{
                position: "absolute", right: -3, bottom: -3,
                background: "rgba(10,20,17,.9)", borderRadius: 4, padding: 1.5,
                display: "grid", placeItems: "center",
              }}>
                <Sagoma indice={i} colore={g.colore} lato={11} />
              </span>
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
                  {veloce ? "🏁 Largo" : `${prof.emoji} ${prof.nome}`}
                  {g.eliminato && " · fuori"}
                  {g.turniDaSaltare > 0 && ` · salta ${g.turniDaSaltare}`}
                </span>
                <span className="f11 numeri" style={{ flex: "none", color: "var(--oro-chiaro)" }}>
                  {veloce
                    ? `${soldi(g.redditoRendita)}/mese`
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
          fondo, quel giocatore può uscire dalla Ruota.
        </p>
      )}
    </div>
  );
}
