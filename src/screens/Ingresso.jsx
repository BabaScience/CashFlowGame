import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bottone } from "../components/Base.jsx";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import { MERCATI, MERCATO_PREDEFINITO } from "../game/mercati/indice.js";
import { soldi } from "../game/finanze.js";
import * as api from "../lib/api.js";
import { traccia } from "../lib/traccia.js";
import { partiteAperte, dimenticaPartita } from "../lib/partite.js";
import { useLingua } from "../Lingua.jsx";

/**
 * Schermata iniziale.
 *
 * Il mercato si sceglie qui e prima di tutto il resto, perché è il mercato
 * a decidere quali professioni esistono e quanto costano le cose: scegliere
 * "Roma" dopo aver scelto la professione significherebbe cambiarla sotto i
 * piedi a chi l'ha appena letta. Chi entra con un codice non sceglie nulla:
 * il mercato è quello della stanza, uno per tavolo.
 */
export default function Ingresso({ suEntrato, avvisa, suSfida, suImpara }) {
  const [mercatoId, setMercato] = useState(
    () => localStorage.getItem("quotazero:mercato") || MERCATO_PREDEFINITO
  );
  return (
    <MercatoProvider mercatoId={mercatoId}>
      <Modulo suEntrato={suEntrato} avvisa={avvisa} suSfida={suSfida} suImpara={suImpara}
        mercatoId={mercatoId} setMercato={setMercato} />
    </MercatoProvider>
  );
}

function Modulo({ suEntrato, avvisa, suSfida, suImpara, mercatoId, setMercato }) {
  /* Le partite lasciate a metà. Il gioco a turni distanziati serve a poco
     se poi non si ritrova la strada per tornarci. */
  const [aperte, setAperte] = useState(() => partiteAperte());
  const { t, lingua, cambiaLingua, lingue } = useLingua();
  const { professioni, sogni } = useMercato();
  const [nome, setNome] = useState(localStorage.getItem("quotazero:nome") || "");
  const [professioneId, setProfessione] = useState(professioni[0].id);
  const [sognoId, setSogno] = useState(sogni[0].id);

  /* Cambiando mercato le professioni cambiano: si riporta la scelta su una
     che esiste, altrimenti la scheda mostrata non è quella che si gioca. */
  useEffect(() => {
    if (!professioni.some((p) => p.id === professioneId)) setProfessione(professioni[0].id);
    if (!sogni.some((x) => x.id === sognoId)) setSogno(sogni[0].id);
  }, [professioni, sogni, professioneId, sognoId]);
  const [codice, setCodice] = useState("");
  const [occupato, setOccupato] = useState(false);
  const [modo, setModo] = useState("crea");

  const prof = professioni.find((p) => p.id === professioneId);
  const speseProf = Object.values(prof.spese).reduce((a, b) => a + b, 0);
  const flussoProf = prof.stipendio - speseProf;

  const ricorda = () => localStorage.setItem("quotazero:nome", nome.trim());

  const crea = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    setOccupato(true);
    try {
      ricorda();
      const r = await api.creaStanza(nome.trim(), professioneId, sognoId, mercatoId);
      traccia("stanzaCreata", { mercato: mercatoId });
      suEntrato(r.stato.codice);
    } catch (e) { avvisa(e.message); }
    finally { setOccupato(false); }
  };

  const entra = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    const c = codice.trim().toUpperCase();
    if (c.length < 4) return avvisa(t("ingresso.codiceCorto"));
    setOccupato(true);
    try {
      ricorda();
      await api.azione(c, { tipo: "entra", nome: nome.trim(), professioneId, sognoId });
      traccia("stanzaRaggiunta");
      suEntrato(c);
    } catch (e) { avvisa(e.message); }
    finally { setOccupato(false); }
  };

  return (
    <div className="contenuto">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
        <div className="ta-c" style={{ padding: "26px 0 22px" }}>
          <div style={{ fontSize: 34 }}>◆</div>
          <h1 className="titolo" style={{ fontSize: 32, margin: "8px 0 0", color: "var(--oro-chiaro)" }}>
            Quota Zero
          </h1>
          <p className="f14" style={{ margin: "8px 0 0", color: "rgba(244,241,230,.72)", lineHeight: 1.5 }}>
            {t("app.motto")}<br />
            {t("app.sottotitolo")}
          </p>
        </div>

        <div className="carta">
          {aperte.length > 0 && (
            <div className="partite-aperte">
              <div className="etichetta">{t("ingresso.partiteAperte")}</div>
              {aperte.map((p) => (
                <div key={p.codice} className="partita-aperta">
                  <button onClick={() => suEntrato(p.codice)} className="riprendi">
                    <span className="numeri grassetto">{p.codice}</span>
                    <span className="f12 tenue">
                      {t(`mercati.${p.mercatoId || "classico"}.nome`)}
                      {p.giocatori ? ` · ${p.giocatori}` : ""}
                    </span>
                  </button>
                  <button className="scarta" aria-label={t("ingresso.dimentica")}
                    onClick={() => { dimenticaPartita(p.codice); setAperte(partiteAperte()); }}>×</button>
                </div>
              ))}
            </div>
          )}

          {suImpara && (
            <button onClick={suImpara} className="richiamo-sfida" style={{ marginTop: 8 }}
              aria-label={t("impara.richiamo")}>
              <span>
                <strong>{t("impara.richiamo")}</strong><br />
                <span className="f12" style={{ color: "var(--tenue)" }}>{t("impara.richiamoSotto")}</span>
              </span>
              <span className="freccia" aria-hidden="true">→</span>
            </button>
          )}

          {/* La lingua non è il mercato: si può giocare Roma in inglese. */}
          <div className="scelta-lingua">
            {lingue.map((l) => (
              <button key={l.id} onClick={() => cambiaLingua(l.id)}
                data-attiva={lingua === l.id} aria-pressed={lingua === l.id}
                aria-label={l.nome}>
                <span aria-hidden="true">{l.bandiera}</span> {l.nome}
              </button>
            ))}
          </div>

          {suSfida && (
              <button onClick={suSfida} className="richiamo-sfida"
                aria-label={t("ingresso.sfidaAria")}>
                <span>
                  <strong>{t("ingresso.sfidaTitolo")}</strong><br />
                  <span className="f12" style={{ color: "var(--tenue)" }}>{t("ingresso.sfidaSotto")}</span>
                </span>
                <span className="freccia" aria-hidden="true">→</span>
              </button>
            )}

            <div className="gruppo-campo">
            <label className="etichetta">{t("ingresso.nome")}</label>
            <input className="campo" value={nome} maxLength={18}
              onChange={(e) => setNome(e.target.value)} placeholder={t("ingresso.nomeSegnaposto")} />
          </div>

          {/* Prima scelta di tutte: decide professioni, prezzi e valuta. */}
          <div className="gruppo-campo">
            <label className="etichetta">{t("ingresso.dovegiochi")}</label>
            <select className="campo" value={mercatoId}
              onChange={(e) => {
                setMercato(e.target.value);
                localStorage.setItem("quotazero:mercato", e.target.value);
              }}>
              {MERCATI.map((m) => (
                <option key={m.id} value={m.id}>
                  {t(`mercati.${m.id}.nome`)} — {t(`mercati.${m.id}.descrizione`)}
                </option>
              ))}
            </select>
            <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
              {t("ingresso.mercatoNota")}
            </p>
          </div>

          <div className="gruppo-campo">
            <label className="etichetta">{t("ingresso.professione")}</label>
            <select className="campo" value={professioneId} onChange={(e) => setProfessione(e.target.value)}>
              {professioni.map((p) => (
                <option key={p.id} value={p.id}>{p.emoji} {p.nome} — {soldi(p.stipendio)}/mese</option>
              ))}
            </select>
            <div className="carta mt8" style={{ background: "#F2F0E6", padding: 12 }}>
              <div className="flex tra f13">
                <span className="tenue">{t("ingresso.stipendio")}</span><span className="numeri">{soldi(prof.stipendio)}</span>
              </div>
              <div className="flex tra f13">
                <span className="tenue">{t("ingresso.speseTotali")}</span><span className="numeri">{soldi(speseProf)}</span>
              </div>
              <div className="flex tra f13 grassetto" style={{ borderTop: "1px dashed var(--linea)", paddingTop: 6, marginTop: 6 }}>
                <span>{t("ingresso.giornoDiPaga")}</span><span className="numeri pos">{soldi(flussoProf)}</span>
              </div>
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {t("ingresso.perUscire", { importo: soldi(speseProf) })}
              </p>
            </div>
          </div>

          <div className="gruppo-campo">
            <label className="etichetta">{t("ingresso.sogno")}</label>
            <select className="campo" value={sognoId} onChange={(e) => setSogno(e.target.value)}>
              {sogni.map((s) => (
                <option key={s.id} value={s.id}>{s.emoji} {s.nome} — {soldi(s.costo)}</option>
              ))}
            </select>
            <p className="f12 tenue mt8" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
              {t("ingresso.sognoNota")}
            </p>
          </div>
        </div>

        <div className="flex g8 mt16 mb12">
          <button className={`btn ${modo === "crea" ? "btn-oro" : "btn-chiaro"}`} onClick={() => setModo("crea")}>
            {t("ingresso.creaStanza")}
          </button>
          <button className={`btn ${modo === "entra" ? "btn-oro" : "btn-chiaro"}`} onClick={() => setModo("entra")}>
            {t("ingresso.entraConCodice")}
          </button>
        </div>

        {modo === "crea" ? (
          <Bottone variante="btn-verde" disabled={occupato} onClick={crea}>
            {occupato ? t("ingresso.creando") : t("ingresso.creaEInvita")}
          </Bottone>
        ) : (
          <>
            <input
              className="campo mb12"
              value={codice}
              onChange={(e) => setCodice(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="CODICE"
              maxLength={4}
              style={{ textAlign: "center", fontFamily: "var(--f-numeri)", fontSize: 24, letterSpacing: 8, height: 60 }}
            />
            <Bottone variante="btn-verde" disabled={occupato} onClick={entra}>
              {occupato ? t("ingresso.entrando") : t("ingresso.entraNellaPartita")}
            </Bottone>
          </>
        )}

        <p className="f12 ta-c mt16" style={{ color: "rgba(244,241,230,.4)", lineHeight: 1.55 }}>
          {t("app.nessunaRegistrazione")}
        </p>
      </motion.div>
    </div>
  );
}
