import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bottone } from "../components/Base.jsx";
import Scelta from "../components/Scelta.jsx";
import Logo from "../components/Logo.jsx";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import { MERCATI, MERCATO_PREDEFINITO, getPacchetto } from "../game/mercati/indice.js";
import { LIVELLI, LIVELLO_PREDEFINITO } from "../game/regole/livelli.js";
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
export default function Ingresso({ suEntrato, avvisa, suSfida, suImpara, vistaIniziale }) {
  const [mercatoId, setMercato] = useState(
    () => localStorage.getItem("quotazero:mercato") || MERCATO_PREDEFINITO
  );
  return (
    <MercatoProvider mercatoId={mercatoId}>
      <Modulo suEntrato={suEntrato} avvisa={avvisa} suSfida={suSfida} suImpara={suImpara}
        mercatoId={mercatoId} setMercato={setMercato} vistaIniziale={vistaIniziale} />
    </MercatoProvider>
  );
}

function Modulo({ suEntrato, avvisa, suSfida, suImpara, mercatoId, setMercato, vistaIniziale = "casa" }) {
  /* Le partite lasciate a metà. Il gioco a turni distanziati serve a poco
     se poi non si ritrova la strada per tornarci. */
  const [aperte, setAperte] = useState(() => partiteAperte());
  /* Il livello di realismo esiste solo dove esiste un fisco da mostrare:
     "classico" è un'economia astratta e non ha imposte da aprire. */
  const [livello, setLivello] = useState(LIVELLO_PREDEFINITO);
  const haFisco = Boolean(getPacchetto(mercatoId).fisco);
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
  /* "casa" mostra le destinazioni, "modulo" la configurazione della
     partita. Prima erano la stessa cosa: chi arrivava trovava un modulo di
     otto campi prima di sapere che gioco fosse, e chi voleva solo i
     quesiti doveva scorrere oltre tutto. */
  const [vista, setVista] = useState(vistaIniziale);

  /* Il ripiego non è pigrizia: cambiando mercato, `professioneId` resta per
     un attimo quello del mercato precedente. L'effetto che lo corregge gira
     DOPO il primo disegno, e in quel disegno `find` restituiva undefined.
     La schermata si rompeva a metà del cambio, e nessun test la coglieva
     perché nessuno cambiava mercato. */
  const prof = professioni.find((p) => p.id === professioneId) || professioni[0];
  const speseProf = Object.values(prof.spese).reduce((a, b) => a + b, 0);
  const flussoProf = prof.stipendio - speseProf;

  const ricorda = () => localStorage.setItem("quotazero:nome", nome.trim());

  const crea = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    setOccupato(true);
    try {
      ricorda();
      const r = await api.creaStanza(nome.trim(), professioneId, sognoId, mercatoId, haFisco ? livello : 1);
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
        {/* La lingua è un'impostazione, non una destinazione: sta in un
            angolo, non in mezzo alla pagina come prima. */}
        <div className="scelta-lingua scelta-lingua-angolo">
          {lingue.map((l) => (
            <button key={l.id} onClick={() => cambiaLingua(l.id)}
              data-attiva={lingua === l.id} aria-pressed={lingua === l.id}
              aria-label={l.nome}>
              <span aria-hidden="true">{l.bandiera}</span> {l.nome}
            </button>
          ))}
        </div>

        <div className="ta-c cappello">
          {/* Dal modulo il logo riporta alle destinazioni; dalla casa non
              porta da nessuna parte, e allora non finge di essere un
              pulsante. */}
          <Logo grande suCasa={vista === "modulo" ? () => setVista("casa") : undefined} />
          <p className="f14" style={{ margin: "8px 0 0", color: "rgba(244,241,230,.72)", lineHeight: 1.5 }}>
            {t("app.motto")}<br />
            {t("app.sottotitolo")}
          </p>
        </div>

        {vista === "casa" ? (
          <>
            {/* Chi ha una partita a metà ha una sola intenzione: tornarci.
                Sta prima di tutto il resto. */}
            {aperte.length > 0 && (
              <div className="carta partite-aperte">
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

            {/* Le destinazioni. Ognuna dice cosa succede se la scegli e
                quanto dura: sono le due cose che si vogliono sapere prima
                di cliccare. */}
            <div className="destinazioni">
              <button className="destinazione destinazione-prima"
                onClick={() => setVista("modulo")}>
                <span className="dest-icona" aria-hidden="true">🎲</span>
                <span className="dest-testo">
                  <span className="dest-titolo">{t("casa.tavolo")}</span>
                  <span className="dest-nota">{t("casa.tavoloNota")}</span>
                </span>
                <span className="dest-freccia" aria-hidden="true">→</span>
              </button>

              {suSfida && (
                <button className="destinazione" onClick={suSfida}>
                  <span className="dest-icona" aria-hidden="true">⚡</span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.sfida")}</span>
                    <span className="dest-nota">{t("casa.sfidaNota")}</span>
                  </span>
                  <span className="dest-freccia" aria-hidden="true">→</span>
                </button>
              )}

              {suImpara && (
                <button className="destinazione" onClick={() => suImpara("lezioni")}>
                  <span className="dest-icona" aria-hidden="true">📘</span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.lezioni")}</span>
                    <span className="dest-nota">{t("casa.lezioniNota")}</span>
                  </span>
                  <span className="dest-freccia" aria-hidden="true">→</span>
                </button>
              )}

              {suImpara && (
                <button className="destinazione" onClick={() => suImpara("quesiti")}>
                  <span className="dest-icona" aria-hidden="true">🧩</span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.quesiti")}</span>
                    <span className="dest-nota">{t("casa.quesitiNota")}</span>
                  </span>
                  <span className="dest-freccia" aria-hidden="true">→</span>
                </button>
              )}
            </div>

            {/* Cos'è, per chi non l'ha mai visto. Prima non lo diceva
                nessuno: si arrivava su un modulo e basta. */}
            <div className="carta spiegazione">
              <div className="etichetta">{t("casa.comeFunziona")}</div>
              <ol>
                <li>{t("casa.passo1")}</li>
                <li>{t("casa.passo2")}</li>
                <li>{t("casa.passo3")}</li>
              </ol>
            </div>
          </>
        ) : (
        <>
        <div className="carta">
          <button className="torna" onClick={() => setVista("casa")}>
            <span aria-hidden="true">←</span> {t("casa.torna")}
          </button>

          <div className="gruppo-campo">
            <label className="etichetta" htmlFor="campo-nome">{t("ingresso.nome")}</label>
            <input id="campo-nome" className="campo" value={nome} maxLength={18}
              onChange={(e) => setNome(e.target.value)} placeholder={t("ingresso.nomeSegnaposto")} />
          </div>

          {/* Prima scelta di tutte: decide professioni, prezzi e valuta. */}
          <div className="gruppo-campo">
            <Scelta
              id="campo-mercato"
              etichetta={t("ingresso.dovegiochi")}
              valore={mercatoId}
              onCambia={(v) => {
                setMercato(v);
                localStorage.setItem("quotazero:mercato", v);
              }}
              opzioni={MERCATI.map((m) => ({
                valore: m.id,
                etichetta: t(`mercati.${m.id}.nome`),
                nota: t(`mercati.${m.id}.descrizione`),
              }))}
            />
            <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
              {t("ingresso.mercatoNota")}
            </p>
          </div>

          {haFisco && (
            <div className="gruppo-campo">
              <Scelta
                id="campo-livello"
                etichetta={t("ingresso.livello")}
                valore={livello}
                onCambia={(v) => setLivello(Number(v))}
                opzioni={LIVELLI.map((l) => ({ valore: l.id, etichetta: l.nome, nota: l.sommario }))}
              />
              <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
                {LIVELLI.find((l) => l.id === livello)?.descrizione}
              </p>
            </div>
          )}

          <div className="gruppo-campo">
            <Scelta
              id="campo-professione"
              etichetta={t("ingresso.professione")}
              valore={professioneId}
              onCambia={setProfessione}
              opzioni={professioni.map((p) => ({
                valore: p.id, emoji: p.emoji, etichetta: p.nome,
                dettaglio: t("ingresso.alMese", { importo: soldi(p.stipendio) }),
              }))}
            />
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
            <Scelta
              id="campo-sogno"
              etichetta={t("ingresso.sogno")}
              valore={sognoId}
              onCambia={setSogno}
              opzioni={sogni.map((s) => ({
                valore: s.id, emoji: s.emoji, etichetta: s.nome, dettaglio: soldi(s.costo),
              }))}
            />
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
              id="campo-codice"
              aria-label={t("ingresso.codice")}
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

        </>
        )}

        <p className="f12 ta-c mt16" style={{ color: "rgba(244,241,230,.4)", lineHeight: 1.55 }}>
          {t("app.nessunaRegistrazione")}
        </p>
      </motion.div>
    </div>
  );
}
