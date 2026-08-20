import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bottone, GettoneGiocatore } from "../components/Base.jsx";
import { PROFESSIONI, getProfessione } from "../game/data/professioni.js";
import { SOGNI, getSogno } from "../game/data/largo.js";
import { soldi, flussoMensile } from "../game/finanze.js";
import { MAX_GIOCATORI } from "../game/data/tabellone.js";

/** Sala d'attesa: si vede chi è entrato e si può ancora cambiare scelta. */
export default function Attesa({ stato, mioId, invia, inAzione, avvisa, suEsci }) {
  const io = stato.giocatori.find((g) => g.id === mioId);
  const sonoHost = stato.hostId === mioId;
  const [modifica, setModifica] = useState(false);

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(stato.codice);
      avvisa("Codice copiato negli appunti.");
    } catch { avvisa(`Il codice è ${stato.codice}`); }
  };

  const condividi = async () => {
    const testo = `Giochiamo a Quota Zero! Entra con il codice ${stato.codice}: ${location.origin}?c=${stato.codice}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Quota Zero", text: testo }); return; } catch { /* annullato */ }
    }
    copia();
  };

  const cambia = async (campo, valore) => {
    const r = await invia({
      tipo: "entra",
      nome: io.nome,
      professioneId: campo === "prof" ? valore : io.professioneId,
      sognoId: campo === "sogno" ? valore : io.sognoId,
    });
    if (r.errore) avvisa(r.errore);
  };

  const avvia = async () => {
    const r = await invia({ tipo: "avvia" });
    if (r.errore) avvisa(r.errore);
  };

  return (
    <div className="contenuto">
      <motion.div initial={false} animate={{ opacity: 1 }}>
        <div className="carta ta-c">
          <div className="maiusc tenue">Codice della stanza</div>
          <div className="titolo numeri" style={{ fontSize: 44, letterSpacing: 10, margin: "6px 0 4px" }}>
            {stato.codice}
          </div>
          <p className="f13 tenue" style={{ margin: "0 0 14px" }}>
            Chi ha questo codice può entrare, fino a {MAX_GIOCATORI} giocatori.
          </p>
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" onClick={copia}>Copia</Bottone>
            <Bottone variante="btn-blu" onClick={condividi}>Invita</Bottone>
          </div>
        </div>

        <div className="carta-scura mt12">
          <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>
            Al tavolo · {stato.giocatori.length}/{MAX_GIOCATORI}
          </div>
          {stato.giocatori.map((g, i) => {
            const p = getProfessione(g.professioneId);
            const s = getSogno(g.sognoId);
            return (
              // initial={false}: il contenuto deve essere visibile SUBITO. Se la riga
              // comparisse mentre la scheda è in secondo piano, un'animazione d'ingresso
              // resterebbe congelata a opacità 0 e il giocatore risulterebbe invisibile.
              <motion.div key={g.id} className="riga-giocatore"
                initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                <GettoneGiocatore giocatore={g} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="grassetto f15">
                    {g.nome}
                    {g.id === mioId && <span className="tenue"> · tu</span>}
                    {g.id === stato.hostId && <span className="tag tag-oro" style={{ marginLeft: 8 }}>host</span>}
                  </div>
                  <div className="f12 tenue">
                    {p.emoji} {p.nome} · {soldi(p.stipendio)}/mese · sogno {s.emoji}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {stato.giocatori.length < 2 && (
            <p className="f13 tenue mt12" style={{ margin: "12px 0 0" }}>
              Serve almeno un altro giocatore per cominciare.
            </p>
          )}
        </div>

        <div className="carta mt12">
          <button className="flex tra cen pieno p0" style={{ background: "none" }}
            onClick={() => setModifica(!modifica)}>
            <span className="titolo f14">La tua scelta</span>
            <motion.span animate={{ rotate: modifica ? 180 : 0 }} className="tenue">▾</motion.span>
          </button>
          {!modifica && io && (
            <p className="f13 tenue" style={{ margin: "8px 0 0" }}>
              {getProfessione(io.professioneId).emoji} {getProfessione(io.professioneId).nome}
              {" · "}sogno: {getSogno(io.sognoId).nome}
            </p>
          )}
          {modifica && io && (
            <div className="mt12">
              <label className="etichetta">Professione</label>
              <select className="campo mb12" value={io.professioneId} disabled={inAzione}
                onChange={(e) => cambia("prof", e.target.value)}>
                {PROFESSIONI.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.nome} — {soldi(p.stipendio)}/mese</option>
                ))}
              </select>
              <label className="etichetta">Sogno</label>
              <select className="campo" value={io.sognoId} disabled={inAzione}
                onChange={(e) => cambia("sogno", e.target.value)}>
                {SOGNI.map((s) => (
                  <option key={s.id} value={s.id}>{s.emoji} {s.nome} — {soldi(s.costo)}</option>
                ))}
              </select>
              {io && (
                <p className="f12 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
                  Partirai con <strong className="numeri">{soldi(flussoMensile(io) + getProfessione(io.professioneId).risparmi)}</strong> in
                  contanti (giorno di paga + risparmi).
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt16">
          {sonoHost ? (
            <Bottone variante="btn-oro" disabled={inAzione || stato.giocatori.length < 2} onClick={avvia}>
              {stato.giocatori.length < 2 ? "In attesa di giocatori…" : "Comincia la partita"}
            </Bottone>
          ) : (
            <div className="carta ta-c">
              <p className="f14" style={{ margin: 0 }}>
                In attesa che {stato.giocatori.find((g) => g.id === stato.hostId)?.nome || "l'host"} avvii la partita.
              </p>
            </div>
          )}
          <Bottone variante="btn-fantasma mt8" style={{ color: "rgba(244,241,230,.6)" }} onClick={suEsci}>
            Esci dalla stanza
          </Bottone>
        </div>
      </motion.div>
    </div>
  );
}
