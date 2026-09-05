import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bottone } from "../components/Base.jsx";
import Logo from "../components/Logo.jsx";
import Scelta from "../components/Scelta.jsx";
import * as api from "../lib/api.js";
import { traccia } from "../lib/traccia.js";
import { useLingua } from "../Lingua.jsx";
import { useMercato } from "../Mercato.jsx";
import { MERCATI } from "../game/mercati/indice.js";
import { TURNI_LAMPO } from "../game/motore.js";

/**
 * L'ARENA: premi Gioca, e stai giocando.
 *
 * È la differenza fra un gioco che si gioca fra amici e un posto dove si
 * va. Fino a ieri per giocare con qualcuno bisognava conoscerlo, aprire
 * una stanza e passargli quattro lettere; qui si preme un pulsante e
 * qualcuno arriva.
 *
 * Due scelte che sembrano dettagli e non lo sono.
 *
 * **Si sceglie il formato, non l'avversario.** Chi vuole giocare vuole
 * giocare: ogni campo in più fra il pulsante e la partita è gente che se
 * ne va. Nome, mercato e professione sono già decisi altrove o hanno un
 * valore ragionevole.
 *
 * **Dopo tre quarti di minuto si propone il computer.** Con pochi
 * giocatori la coda è quasi sempre vuota, e una sala d'attesa vuota è il
 * modo più veloce per non tornare mai più. Meglio una partita subito.
 */

const SECONDI_PRIMA_DEL_COMPUTER = 45;
const OGNI = 2000;

export default function Arena({ suEntrato, suEsci, avvisa, mercatoId, setMercato }) {
  const { t } = useLingua();
  const { professioni, sogni } = useMercato();
  const [nome, setNome] = useState(localStorage.getItem("quotazero:nome") || "");
  const [formato, setFormato] = useState("lampo");
  const [attesa, setAttesa] = useState(null);   // { secondi, inCoda }
  const [albo, setAlbo] = useState(null);
  const fermato = useRef(false);

  /* La classifica si legge una volta sola all'apertura: è una lettura
     piccola e non ha bisogno di essere fresca al secondo. */
  useEffect(() => {
    let vivo = true;
    api.classifica().then((d) => { if (vivo) setAlbo(d); }).catch(() => { /* offline: pazienza */ });
    return () => { vivo = false; };
  }, []);

  /* Uscire dalla coda quando si chiude la scheda: senza questo la coda si
     riempie di gente che non c'è più, e il primo che arriva viene appaiato
     con un fantasma. */
  useEffect(() => {
    const esci = () => { if (!fermato.current) api.esciDallaCoda(); };
    window.addEventListener("pagehide", esci);
    return () => window.removeEventListener("pagehide", esci);
  }, []);

  const dati = useCallback(() => ({
    nome: nome.trim() || t("arena.ospite"),
    professioneId: professioni[0].id,
    sognoId: sogni[0].id,
    mercatoId, livello: 1, formato,
  }), [nome, professioni, sogni, mercatoId, formato, t]);

  const annulla = useCallback(async () => {
    fermato.current = true;
    setAttesa(null);
    await api.esciDallaCoda();
  }, []);

  const cerca = async () => {
    if (nome.trim()) localStorage.setItem("quotazero:nome", nome.trim());
    fermato.current = false;
    setAttesa({ secondi: 0, inCoda: 1 });
    try {
      const r = await api.entraInCoda(dati());
      if (r.stato === "trovato") {
        traccia("arenaAppaiato", { formato });
        return suEntrato(r.codice);
      }
      setAttesa({ secondi: 0, inCoda: r.inCoda || 1 });
    } catch (e) {
      setAttesa(null);
      avvisa(e.message);
    }
  };

  /* Il battito dell'attesa: un secondo per il contatore, e ogni due
     secondi la domanda al server. */
  useEffect(() => {
    if (!attesa) return;
    const orologio = setInterval(() => {
      setAttesa((a) => (a ? { ...a, secondi: a.secondi + 1 } : a));
    }, 1000);
    const chiedi = setInterval(async () => {
      if (fermato.current) return;
      try {
        const r = await api.guardaCoda();
        if (r.stato === "trovato") {
          fermato.current = true;
          traccia("arenaAppaiato", { formato });
          suEntrato(r.codice);
        } else if (r.stato === "scaduta") {
          /* La riga è morta di TTL mentre aspettavamo: ci si rimette,
             invece di restare a guardare una rotella che non gira più. */
          api.entraInCoda(dati()).catch(() => {});
        } else if (typeof r.inCoda === "number") {
          setAttesa((a) => (a ? { ...a, inCoda: r.inCoda } : a));
        }
      } catch { /* un buco di rete non deve rompere l'attesa */ }
    }, OGNI);
    return () => { clearInterval(orologio); clearInterval(chiedi); };
  }, [attesa !== null, formato, dati, suEntrato]);   // eslint-disable-line react-hooks/exhaustive-deps

  const controIlComputer = async () => {
    await annulla();
    try {
      const d = dati();
      const r = await api.creaStanza(d.nome, d.professioneId, d.sognoId, mercatoId, 1, 1, formato);
      traccia("arenaComputer", { formato });
      suEntrato(r.stato.codice);
    } catch (e) { avvisa(e.message); }
  };

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="ta-c cappello">
          <Logo grande suCasa={suEsci} />
          <p className="f14" style={{ margin: "8px 0 0", color: "rgba(244,241,230,.72)", lineHeight: 1.5 }}>
            {t("arena.sottotitolo")}
          </p>
        </div>

        {attesa ? (
          <div className="carta ta-c mt12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: 30, display: "inline-block" }}
            >◆</motion.div>
            <h2 className="titolo f20" style={{ margin: "10px 0 4px" }}>{t("arena.cerco")}</h2>
            <p className="f13 tenue numeri" style={{ margin: 0 }}>
              {t("arena.daSecondi", { n: attesa.secondi })}
            </p>
            <p className="f13 tenue" style={{ margin: "8px 0 0" }}>
              {t(attesa.inCoda > 1 ? "arena.inCodaMolti" : "arena.inCodaSolo", { n: attesa.inCoda })}
            </p>

            {attesa.secondi >= SECONDI_PRIMA_DEL_COMPUTER && (
              <div className="mt16">
                <p className="f13" style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
                  {t("arena.nessunoAncora")}
                </p>
                <Bottone variante="btn-oro" onClick={controIlComputer}>
                  {t("arena.giocaColComputer")}
                </Bottone>
              </div>
            )}
            <Bottone variante="btn-fantasma mt8" onClick={annulla}>{t("arena.annulla")}</Bottone>
          </div>
        ) : (
          <>
            <div className="carta mt12">
              <button className="torna" onClick={suEsci}>{t("casa.torna")}</button>

              <div className="gruppo-campo">
                <label className="etichetta" htmlFor="arena-nome">{t("ingresso.nome")}</label>
                <input id="arena-nome" className="campo" value={nome} maxLength={18}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder={t("ingresso.nomeSegnaposto")} />
              </div>

              <div className="gruppo-campo">
                <label className="etichetta">{t("arena.formato")}</label>
                <div className="scelta-avversari" role="group" aria-label={t("arena.formato")}>
                  <button data-attivo={formato === "lampo"} onClick={() => setFormato("lampo")}>
                    {t("arena.lampo")}
                  </button>
                  <button data-attivo={formato === "lunga"} onClick={() => setFormato("lunga")}>
                    {t("arena.lunga")}
                  </button>
                </div>
                <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                  {t(formato === "lampo" ? "arena.lampoNota" : "arena.lungaNota", { n: TURNI_LAMPO })}
                </p>
              </div>

              <div className="gruppo-campo">
                <Scelta
                  id="arena-mercato"
                  etichetta={t("ingresso.dovegiochi")}
                  valore={mercatoId}
                  onCambia={(v) => { setMercato(v); localStorage.setItem("quotazero:mercato", v); }}
                  opzioni={MERCATI.map((m) => ({
                    valore: m.id,
                    etichetta: t(`mercati.${m.id}.nome`),
                    nota: t(`mercati.${m.id}.descrizione`),
                  }))}
                />
              </div>
            </div>

            <div className="mt16 mb12">
              <Bottone variante="btn-verde" onClick={cerca}>{t("arena.giocaOra")}</Bottone>
            </div>

            <Classifica albo={albo} />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * La classifica.
 *
 * La riga che conta è la propria, e sta in cima anche quando è la
 * novantesima: una classifica in cui non compari è la classifica di altre
 * persone, e non fa tornare nessuno.
 */
function Classifica({ albo }) {
  const { t } = useLingua();
  if (!albo) return null;
  const { primi = [], io } = albo;
  if (!primi.length && !io) {
    return (
      <div className="carta-scura mt12">
        <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>{t("arena.classifica")}</div>
        <p className="f13 tenue" style={{ margin: 0 }}>{t("arena.classificaVuota")}</p>
      </div>
    );
  }
  return (
    <div className="carta-scura mt12">
      <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>{t("arena.classifica")}</div>

      {io && (
        <>
          <div className="riga-log" style={{ borderBottom: "1px solid rgba(255,255,255,.12)", paddingBottom: 8 }}>
            <span className="numeri grassetto" style={{ minWidth: 34 }}>
              {io.posizione ?? t("arena.nonInClassifica")}
            </span>
            <span style={{ flex: 1 }}>{io.nome} · <span className="tenue">{t("arena.tu")}</span></span>
            <span className="numeri grassetto">{io.valutazione}</span>
          </div>
          {io.mancano > 0 && (
            <p className="f11 tenue" style={{ margin: "6px 0 10px" }}>
              {t(io.mancano === 1 ? "arena.mancanoUna" : "arena.mancanoMolte", { n: io.mancano })}
            </p>
          )}
        </>
      )}

      {primi.map((r, i) => (
        <div key={r.giocatoreId} className="riga-log">
          <span className="numeri tenue" style={{ minWidth: 34 }}>{i + 1}</span>
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{r.nome}</span>
          <span className="f11 tenue" style={{ marginRight: 8 }}>
            {t(r.partite === 1 ? "arena.unaPartita" : "arena.partiteVinte", { n: r.partite, v: r.vittorie || 0 })}
          </span>
          <span className="numeri grassetto">{r.valutazione}</span>
        </div>
      ))}
    </div>
  );
}
