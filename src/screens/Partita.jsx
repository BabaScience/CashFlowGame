import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tabellone, { Legenda } from "../components/Tabellone.jsx";
import Dadi from "../components/Dadi.jsx";
import Scheda from "../components/Scheda.jsx";
import Giocatori from "../components/Giocatori.jsx";
import Registro from "../components/Registro.jsx";
import Manuale from "../components/Manuale.jsx";
import Chat from "../components/Chat.jsx";
import Decisione from "../components/Decisione.jsx";
import { Bottone, NumeroAnimato, Barra } from "../components/Base.jsx";
import { soldi, riepilogo, fuoriDallaCorsa } from "../game/finanze.js";
import { PERCORSO_RUOTA, CASELLE_RUOTA, PERCORSO_LARGO, CASELLE_LARGO } from "../game/tabellone.js";
import { useSchermoLargo } from "../hooks/useSchermo.js";
import { orologio } from "../game/tempo.js";
import { useSuoni } from "../hooks/useSuoni.js";
import { avvisaTurno, chiediAvvisi, ricordaPartita, statoAvvisi } from "../lib/partite.js";
import { audioAcceso, impostaAudio, sbloccaAudio } from "../lib/suoni.js";
import { useLingua } from "../Lingua.jsx";

/* Il tabellone non è più una scheda fra le altre: resta sempre a schermo,
   quindi le linguette servono solo per ciò che gli sta sotto. */
/**
 * Le sezioni della colonna di destra, sulla scrivania.
 *
 * Su telefono le schede sono cinque e si sfogliano con la barra in basso.
 * Sullo schermo grande la barra spariva e i pannelli venivano impilati
 * tutti insieme: milleottocento pixel di contenuto in una colonna alta
 * settecento, cioè la metà del gioco raggiungibile solo scorrendo.
 *
 * Quattro sezioni invece di cinque, perché sullo schermo grande c'è spazio
 * per tenere insieme le cose che si guardano insieme: chi c'è al tavolo e
 * cosa si stanno dicendo sono la stessa domanda.
 */
const SEZIONI = [
  { id: "conto",    icona: "▤", chiave: "sezioni.conto" },
  { id: "tavolo",   icona: "◉", chiave: "sezioni.tavolo" },
  { id: "registro", icona: "☰", chiave: "sezioni.registro" },
  { id: "regole",   icona: "?", chiave: "sezioni.regole" },
];

const SCHEDE = [
  { id: "scheda", icona: "▤", chiave: "schede.scheda" },
  { id: "gioc", icona: "◉", chiave: "schede.giocatori" },
  { id: "chat", icona: "✉", chiave: "schede.chat" },
  { id: "log", icona: "☰", chiave: "schede.registro" },
  { id: "regole", icona: "?", chiave: "schede.regole" },
];

/**
 * Cosa sta facendo, in una riga.
 *
 * Prima era un riquadro sotto il tabellone. Il guaio non era il testo ma
 * dove stava: la colonna del tavolo dà al tabellone lo spazio che avanza,
 * quindi ogni volta che qualcuno pescava una carta compariva un riquadro e
 * il tabellone si rimpiccioliva — si muoveva sotto gli occhi di chi lo
 * stava guardando, e per la sola durata di una decisione altrui.
 *
 * L'informazione però serviva: il registro annota le cose quando sono
 * finite, non mentre stanno succedendo, e senza questa riga chi guarda non
 * sa perché il turno non avanza. Quindi resta, ma dentro il riquadro del
 * turno che c'è già: una riga sola, che non cambia l'altezza di niente.
 */
function cheStaFacendo(stato, t) {
  const p = stato.pending;
  if (!p) return null;
  const chi = stato.giocatori.find((g) => g.id === p.giocatoreId);
  const nome = chi?.nome || t("partita.qualcuno");

  /* Con uno switch e non con un oggetto: un oggetto valuterebbe subito
     tutti i rami, e quello del Mercato legge campi che esistono soltanto
     sulle carte Mercato. */
  switch (p.tipo) {
    case "sceltaTaglia": return t("sulTavolo.taglia", { nome });
    case "carta": return t("sulTavolo.carta", { nome, carta: p.carta?.nome || "" });
    case "mercato": {
      const mancanti = (p.idonei?.length || 0) - (p.risposto?.length || 0);
      return t(mancanti === 1 ? "sulTavolo.mercatoUno" : "sulTavolo.mercato",
        { carta: p.carta?.nome || "", n: mancanti });
    }
    case "extra": return t("sulTavolo.extra", { nome, carta: p.carta?.nome || "" });
    case "beneficenza":
    case "beneficenzaVeloce": return t("sulTavolo.beneficenza", { nome });
    case "figlio": return t("sulTavolo.figlio", { nome });
    case "licenziamento": return t("sulTavolo.licenziamento", { nome });
    case "bancarotta": return t("sulTavolo.bancarotta", { nome });
    case "affareVeloce": return t("sulTavolo.affare", { nome, carta: p.affare?.nome || "" });
    case "sogno": return t("sulTavolo.sogno", { nome, carta: p.sogno?.nome || "" });
    case "penalitaVeloce": return `${nome}: ${p.nome}`;
    default: return t("sulTavolo.decide", { nome });
  }
}

/** Il pannello delle azioni: cambia in base a cosa puoi fare adesso. */
function Azioni({ stato, mioId, invia, inAzione, avvisa }) {
  const { t } = useLingua();
  const io = stato.giocatori.find((g) => g.id === mioId);
  const diTurno = stato.giocatori[stato.turno];
  const mioTurno = diTurno?.id === mioId;
  const [nDadi, setNDadi] = useState(2);

  if (!io) return null;
  if (io.eliminato) {
    return (
      <div className="carta-scura mt12 ta-c">
        <p className="f14" style={{ margin: 0 }}>{t("partita.fuoriDallaPartita")}</p>
      </div>
    );
  }

  const sta = cheStaFacendo(stato, t);
  const libero = io.tracciato === "topi" && fuoriDallaCorsa(io);
  const fai = async (az) => {
    const r = await invia(az);
    if (r.errore) avvisa(r.errore);
  };

  if (!mioTurno) {
    return (
      <div className="carta-scura mt12 ta-c">
        <div className="flex cen g8" style={{ justifyContent: "center" }}>
          <motion.span
            style={{ width: 9, height: 9, borderRadius: "50%", background: diTurno?.colore }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <span className="f14">{t("partita.toccaA", { nome: diTurno?.nome || "" })}</span>
        </div>
        {/* Una riga sola, troncata: non deve mai andare a capo, o
            tornerebbe a spostare il tabellone come faceva il riquadro. */}
        {sta && <p className="f12 tenue riga-sola" style={{ margin: "6px 0 0" }}>{sta}</p>}
        {io.turniDaSaltare > 0 && (
          <p className="f13 tenue" style={{ margin: "6px 0 0" }}>
            {t("partita.salterai", { n: io.turniDaSaltare })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="carta-scura mt12">
      {libero && (
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="mb12"
          style={{
            background: "linear-gradient(160deg,#C9A227,#8E7015)",
            borderRadius: 14, padding: 14, color: "#20190A",
          }}>
          <div className="titolo f16 mb4">{t("partita.seiLibero")}</div>
          <p className="f13" style={{ margin: "0 0 12px", lineHeight: 1.45 }}>
            Il tuo reddito passivo ({soldi(riepilogo(io).redditoPassivo)}) supera
            le spese ({soldi(riepilogo(io).speseTotali)}).
            Uscendo ricevi <strong>{soldi(riepilogo(io).redditoPassivo * 100)}</strong> di liquidazione.
          </p>
          <Bottone variante="btn-verde" disabled={inAzione}
            onClick={() => fai({ tipo: "esciDallaCorsa" })}>
            {t("partita.prendiIlLargo")}
          </Bottone>
        </motion.div>
      )}

      {!stato.pending && !stato.dado && (
        <>
          {io.tracciato === "topi" && io.turniBeneficenza > 0 && (
            <p className="f13 ta-c mb8" style={{ margin: "12px 0 8px", color: "var(--oro-chiaro)" }}>
              Beneficenza attiva: tiri 2 dadi ({io.turniBeneficenza} turni rimasti).
            </p>
          )}
          {io.tracciato === "veloce" && io.beneficenzaVeloce && (
            <div className="mb12 mt12">
              <div className="etichetta ta-c" style={{ color: "rgba(244,241,230,.6)" }}>{t("partita.quantiDadi")}</div>
              <div className="flex g8">
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`btn ${nDadi === n ? "btn-oro" : "btn-chiaro"}`}
                    onClick={() => setNDadi(n)}>{n}</button>
                ))}
              </div>
            </div>
          )}
          <Bottone variante="btn-oro" className="mt12" disabled={inAzione}
            onClick={() => fai({ tipo: "tira", nDadi: io.tracciato === "veloce" ? nDadi : 2 })}>
            Tira {io.tracciato === "topi" && io.turniBeneficenza === 0 ? "il dado" : "i dadi"}
          </Bottone>
        </>
      )}

      {stato.dado && !stato.pending && (
        <p className="f13 tenue ta-c mt12" style={{ margin: "12px 0 0" }}>
          {t("partita.casellaRisolta")}
        </p>
      )}
    </div>
  );
}

export default function Partita({ stato, mioId, invia, inAzione, avvisa, suEsci }) {
  const { t } = useLingua();
  const [scheda, setScheda] = useState("scheda");
  /* Su telefono si sfoglia con la barra in basso (`scheda`), sulla
     scrivania con le linguette in cima alla colonna (`sezione`). Due stati
     separati perché i raggruppamenti sono diversi, e perché passando da
     una forma all'altra ognuna deve ritrovarsi dove l'avevi lasciata. */
  const [sezione, setSezione] = useState("conto");
  const [audio, setAudio] = useState(audioAcceso);
  useSuoni(stato, mioId);

  // I browser aprono l'audio solo dentro un gesto: il primo tocco basta.
  useEffect(() => {
    const apri = () => sbloccaAudio();
    window.addEventListener("pointerdown", apri, { once: true });
    return () => window.removeEventListener("pointerdown", apri);
  }, []);
  /* "scrivania", non "largo": in questo gioco il Largo è un tracciato, e
     chiamare così anche lo schermo grande rendeva illeggibile ogni riga in
     cui comparivano tutti e due. */
  const scrivania = useSchermoLargo(1000);
  const io = stato.giocatori.find((g) => g.id === mioId);
  const diTurno = stato.giocatori[stato.turno];
  const mioTurno = diTurno?.id === mioId;

  // Notifica discreta quando arriva il tuo turno.
  const eraMio = useRef(mioTurno);
  useEffect(() => {
    if (mioTurno && !eraMio.current) {
      avvisa(t("partita.toccaATe"));
      if (navigator.vibrate) navigator.vibrate(45);
      /* Se non stai guardando, te lo diciamo fuori dalla pagina: è ciò che
         rende sopportabile una partita giocata a turni distanziati. */
      avvisaTurno({
        codice: stato.codice,
        titolo: t("partita.toccaATe"),
        testo: `${t("partita.stanza")} ${stato.codice}`,
      });
    }
    eraMio.current = mioTurno;
  }, [mioTurno, avvisa, t, stato.codice]);

  /* L'elenco delle partite aperte vive sul dispositivo: serve a ritrovare
     la strada, non a sapere chi sei. */
  useEffect(() => {
    ricordaPartita(stato.codice, {
      mercatoId: stato.mercatoId,
      giocatori: stato.giocatori.length,
      fase: stato.fase,
    });
  }, [stato.codice, stato.mercatoId, stato.giocatori.length, stato.fase]);

  /* Il permesso per gli avvisi si chiede quando ha senso: quando è il tuo
     turno e sei tornato apposta. Chiederlo all'avvio se lo prende un "no". */
  const [avvisiChiesti, setAvvisiChiesti] = useState(false);
  const mostraChiediAvvisi = mioTurno && !avvisiChiesti && statoAvvisi() === "default";

  const lettiChat = useRef((stato.chat || []).length);
  const [chatNuova, setChatNuova] = useState(false);
  useEffect(() => {
    const n = (stato.chat || []).length;
    /* La chat è aperta se la stai guardando, comunque tu ci sia arrivato:
       dalla scheda del telefono o dalla sezione della scrivania. */
    const guardo = scheda === "chat" || sezione === "tavolo";
    if (n > lettiChat.current && !guardo) setChatNuova(true);
    if (guardo) { lettiChat.current = n; setChatNuova(false); }
  }, [stato.chat, scheda, sezione]);
  const segnaLetti = useCallback((n) => { lettiChat.current = n; }, []);

  const nuoveRighe = useRef(stato.registro[0]?.id);
  const [logNuovo, setLogNuovo] = useState(false);
  useEffect(() => {
    if (stato.registro[0]?.id !== nuoveRighe.current) {
      nuoveRighe.current = stato.registro[0]?.id;
      if (scheda !== "log" && sezione !== "registro") setLogNuovo(true);
    }
  }, [stato.registro, scheda, sezione]);

  if (!io) {
    return (
      <div className="contenuto ta-c">
        <div className="carta mt20">
          <p className="f14" style={{ margin: 0 }}>Non fai parte di questa partita.</p>
          <Bottone variante="btn-fantasma mt12" onClick={suEsci}>Torna all'inizio</Bottone>
        </div>
      </div>
    );
  }

  const r = riepilogo(io);
  const casella = io.tracciato === "topi"
    ? CASELLE_RUOTA[PERCORSO_RUOTA[io.posizione]]
    : CASELLE_LARGO[PERCORSO_LARGO[io.posizione].tipo];

  const barraAlta = (
    <div className="flex tra cen g12" style={{
      padding: "12px 14px", background: "rgba(0,0,0,.24)",
      borderBottom: "1px solid rgba(255,255,255,.07)", position: "sticky", top: 0, zIndex: 30,
      backdropFilter: "blur(12px)",
    }}>
      <button onClick={suEsci} className="f11 tenue" style={{ textAlign: "left", background: "none" }}>
        <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{t("partita.stanza")}</div>
        <div className="numeri grassetto f16" style={{ color: "var(--carta)", letterSpacing: 2 }}>{stato.codice}</div>
      </button>
      <div className="ta-c" style={{ flex: 1, minWidth: 0 }}>
        <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>
          {t(io.tracciato === "topi" ? "partita.ruota" : "partita.largo")}
        </div>
        <div className="f13 grassetto" style={{ color: casella.colore === "#6B4423" ? "#C8A278" : casella.colore }}>
          {casella.emoji} {casella.nome}
        </div>
      </div>
      <div className="flex cen g12">
        <button
          onClick={() => setAudio(impostaAudio(!audio))}
          aria-label={audio ? "Spegni i suoni" : "Accendi i suoni"}
          aria-pressed={audio}
          title={audio ? t("partita.suoniAccesi") : t("partita.suoniSpenti")}
          style={{ fontSize: 17, lineHeight: 1, opacity: audio ? 0.85 : 0.35, padding: 4 }}
        >
          {audio ? "\u{1F50A}" : "\u{1F507}"}
        </button>
        <div className="ta-r">
          <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{t("partita.contanti")}</div>
          <div className="numeri grassetto f16"><NumeroAnimato valore={io.contanti} /></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="schermo schermo-partita">
      {barraAlta}

      <div className="corpo">
        {/* Colonna del tavolo: non scorre mai. */}
        <div className="colonna-tavolo">
          <div className="zona-tavolo">
            <Tabellone stato={stato} mioId={mioId} />
            <Dadi tiro={stato.ultimoTiro} mioId={mioId} />
          </div>

          {/* Il tempo passato. Sta qui e non nella barra in alto perché la
              domanda "da quanto lavoro" è la stessa a cui risponde la barra
              del progresso: quanto manca, e quanto è costato finora. */}
          <div className="zona-progresso zona-tempo">
            <span className="maiusc tenue">{t("tempo.inGioco")}</span>
            <span className="numeri grassetto">
              {t("tempo.annoMese", orologio(io.mesi))}
            </span>
          </div>

          {io.tracciato === "topi" && (
            <div className="zona-progresso">
              <div className="flex tra f12 mb4">
                <span className="tenue">{t("partita.renditaVersoSpese")}</span>
                <span className="numeri grassetto">
                  {soldi(r.redditoPassivo)} / {soldi(r.speseTotali)}
                </span>
              </div>
              <Barra scura valore={r.progresso} />
            </div>
          )}

          {scrivania && (
            <div className="zona-progresso"><Legenda tracciato={io.tracciato} /></div>
          )}

          {/* Il pulsante del turno resta sempre raggiungibile col pollice. */}
          <div className="zona-azioni">
            {mostraChiediAvvisi && (
              <button className="f12 tenue" style={{
                display: "block", width: "100%", textAlign: "center",
                padding: "6px 0", textDecoration: "underline", textUnderlineOffset: 3,
              }} onClick={async () => { await chiediAvvisi(); setAvvisiChiesti(true); }}>
                {t("partita.avvisami")}
              </button>
            )}
            <Azioni stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} avvisa={avvisa} />
          </div>
        </div>

        {/* La colonna di destra: le linguette non scorrono, il pannello sì. */}
        <div className="colonna-pannello">
          {scrivania && (
            <nav className="pannello-schede" aria-label={t("sezioni.etichetta")}>
              {SEZIONI.map((sz) => (
                <button key={sz.id} data-attivo={sezione === sz.id}
                  aria-current={sezione === sz.id ? "true" : undefined}
                  onClick={() => {
                    setSezione(sz.id);
                    if (sz.id === "registro") setLogNuovo(false);
                  }}>
                  <span className="icona" aria-hidden="true">{sz.icona}</span>
                  {t(sz.chiave)}
                  {sz.id === "registro" && logNuovo && <span className="punto" />}
                  {sz.id === "tavolo" && chatNuova && <span className="punto" />}
                </button>
              ))}
            </nav>
          )}

          <div className="zona-pannello">
            {scrivania ? (
              <>
                {sezione === "conto" && <Scheda giocatore={io} invia={invia} inAzione={inAzione} mio />}
                {sezione === "tavolo" && (
                  <>
                    <Giocatori stato={stato} mioId={mioId} />
                    {/* Chi c'è al tavolo e cosa si stanno dicendo sono la
                        stessa domanda: stanno bene nella stessa sezione. */}
                    <div className="mt12"><Chat stato={stato} mioId={mioId} suLetto={segnaLetti} /></div>
                  </>
                )}
                {sezione === "registro" && <Registro stato={stato} />}
                {sezione === "regole" && <Manuale />}
              </>
            ) : (
              <>
                {scheda === "scheda" && <Scheda giocatore={io} invia={invia} inAzione={inAzione} mio />}
                {scheda === "gioc" && <Giocatori stato={stato} mioId={mioId} />}
                {scheda === "chat" && <Chat stato={stato} mioId={mioId} suLetto={segnaLetti} />}
                {scheda === "log" && <Registro stato={stato} />}
                {scheda === "regole" && <Manuale />}
              </>
            )}
          </div>
        </div>
      </div>

      <Decisione stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} />

      <nav className="navbar">
        {SCHEDE.map((sc) => (
          <button key={sc.id} data-attivo={scheda === sc.id}
            onClick={() => { setScheda(sc.id); if (sc.id === "log") setLogNuovo(false); }}>
            <span className="icona">{sc.icona}</span>
            {t(sc.chiave)}
            {sc.id === "log" && logNuovo && <span className="punto" />}
            {sc.id === "chat" && chatNuova && <span className="punto" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
