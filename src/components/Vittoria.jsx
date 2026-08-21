import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Bottone, KV } from "./Base.jsx";
import { soldi } from "../game/finanze.js";

import { classifica } from "../game/motore.js";
import { useMercato } from "../Mercato.jsx";
import { useLingua } from "../Lingua.jsx";

const COLORI = ["#C9A227", "#C4362B", "#2E6FA8", "#4E8B3D", "#D98324", "#7B4FA8"];

function Coriandoli() {
  const pezzi = useMemo(
    () => Array.from({ length: 44 }, (_, i) => ({
      i,
      x: Math.random() * 100,
      ritardo: Math.random() * 1.6,
      durata: 2.4 + Math.random() * 1.8,
      colore: COLORI[i % COLORI.length],
      rot: Math.random() * 360,
    })), []
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 70 }}>
      {pezzi.map((p) => (
        <motion.span
          key={p.i}
          className="coriandolo"
          style={{ left: `${p.x}%`, background: p.colore }}
          initial={{ y: -30, opacity: 0, rotate: p.rot }}
          animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: p.rot + 420 }}
          transition={{ duration: p.durata, delay: p.ritardo, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/**
 * Schermata finale: chi ha vinto, perché, e la posizione economica
 * completa di ogni giocatore. È il momento in cui il gioco insegna
 * davvero qualcosa, quindi vale la pena mostrare tutti i numeri.
 */
export default function Vittoria({ stato, mioId, suNuovaPartita, suChiudi, sonoHost }) {
  const { t } = useLingua();
  const { trovaProfessione, trovaSogno, obiettivo } = useMercato();
  const tabella = useMemo(() => classifica(stato), [stato]);
  const vincitore = tabella.find((riga) => riga.vincitore);
  const motivo = {
    sogno: t("vittoria.motivo.sogno"),
    rendita: t("vittoria.motivo.rendita", { importo: soldi(obiettivo) }),
    ultimo: t("vittoria.motivo.ultimo"),
    tempo: t("vittoria.motivo.tempo"),
  }[stato.motivoVittoria] || t("vittoria.motivo.generico");

  return (
    <>
      <Coriandoli />
      <div className="velo" style={{ alignItems: "flex-start", overflowY: "auto", padding: 0 }}>
        <div
          className="modale modale-centro"
          style={{ margin: "auto", borderRadius: 22, maxHeight: "none" }}
        >
          <div className="ta-c mb16">
            <motion.div
              style={{ fontSize: 46 }}
              animate={{ scale: [1, 1.16, 1], rotate: [0, 7, -7, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 1.2 }}
            >🏆</motion.div>
            <div className="maiusc tenue mt8">{t("vittoria.partitaConclusa")}</div>
            <h2 className="titolo f28" style={{ margin: "6px 0 4px" }}>
              {vincitore ? vincitore.nome : t("vittoria.nessunVincitore")}
            </h2>
            <p className="f14 tenue" style={{ margin: 0 }}>{motivo}.</p>
          </div>

          {vincitore && (
            <div className="carta mb16" style={{ background: "linear-gradient(165deg,#FBF4E4,#F0DFB4)", borderColor: "#DFC27E" }}>
              <div className="flex cen g12 mb12">
                <span style={{ fontSize: 26 }}>{trovaSogno(vincitore.sognoId).emoji}</span>
                <div>
                  <div className="grassetto f16">{trovaSogno(vincitore.sognoId).nome}</div>
                  <div className="f12 tenue">{trovaProfessione(vincitore.professioneId).nome}</div>
                </div>
              </div>
              <KV k={t("vittoria.contantiFinali")} v={soldi(vincitore.contanti)} />
              {vincitore.tracciato === "veloce" ? (
                <>
                  <KV k={t("vittoria.redditoRendita")} v={soldi(vincitore.redditoRendita)} />
                  <KV k={t("vittoria.guadagnatoAlLargo")} v={soldi(vincitore.guadagnoVeloce)} forte />
                  <KV k={t("vittoria.affariAcquistati")} v={String(vincitore.affariVeloci)} />
                </>
              ) : (
                <KV k="Reddito passivo" v={soldi(vincitore.redditoPassivo)} forte />
              )}
              <KV k={t("vittoria.turniGiocati")} v={String(vincitore.turniGiocati)} />
            </div>
          )}

          <div className="sezione-tit">{t("vittoria.comeEAndata")}</div>
          {tabella.map((riga, i) => (
            <motion.div
              key={riga.id}
              className="carta mb8"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={riga.vincitore ? { borderColor: "var(--oro)", borderWidth: 2 } : undefined}
            >
              <div className="flex cen g12 mb8">
                <span className="gettone gettone-p" style={{ background: riga.colore }}>
                  {riga.nome.slice(0, 2).toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="grassetto f15">
                    {i + 1}. {riga.nome}
                    {riga.id === mioId && <span className="tenue"> · tu</span>}
                  </div>
                  <div className="f12 tenue">
                    {trovaProfessione(riga.professioneId).nome}
                    {" · "}
                    {riga.eliminato ? "eliminato" : riga.tracciato === "veloce" ? "Largo" : "Ruota"}
                    {riga.usciteDallaCorsa ? ` · uscito dalla corsa al suo ${riga.usciteDallaCorsa}° turno` : ""}
                  </div>
                </div>
                {riga.vincitore && <span className="tag tag-oro">{t("vittoria.vincitore")}</span>}
              </div>

              <KV k="Contanti" v={soldi(riga.contanti)} />
              {riga.tracciato === "veloce" ? (
                <>
                  <KV k="Flusso mensile" v={soldi(riga.redditoRendita)} />
                  <KV k="Crescita al Largo" v={`+${soldi(riga.guadagnoVeloce)}`} />
                  <KV k="Affari" v={String(riga.affariVeloci)} />
                </>
              ) : (
                <>
                  <KV k="Reddito passivo" v={soldi(riga.redditoPassivo)} />
                  <KV k="Spese totali" v={soldi(riga.speseTotali)} />
                  <KV k="Giorno di paga" v={soldi(riga.flussoMensile)} />
                  <KV k="Attivi / Passività" v={`${soldi(riga.valoreAttivi)} / ${soldi(riga.passivitaTotali)}`} />
                </>
              )}
              <KV k="Patrimonio netto" v={soldi(riga.patrimonioNetto)} forte />
              <KV k="Figli" v={String(riga.figli)} />
            </motion.div>
          ))}

          <p className="f12 tenue mt16" style={{ margin: "16px 0 0", lineHeight: 1.55 }}>
            I dati di questa partita restano disponibili ancora per qualche ora,
            poi vengono cancellati automaticamente dal server.
          </p>

          <div className="mt16">
            <Bottone variante="btn-oro" onClick={suNuovaPartita}>{t("vittoria.nuovaPartita")}</Bottone>
            {sonoHost && (
              <Bottone variante="btn-fantasma mt8" onClick={suChiudi}>
                Chiudi la stanza e cancella i dati
              </Bottone>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
