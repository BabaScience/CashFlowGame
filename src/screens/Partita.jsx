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
import Icona from "../components/Icona.jsx";
import { copiaTesto } from "../lib/appunti.js";
import { useSuoni } from "../hooks/useSuoni.js";
import { avvisaTurno, chiediAvvisi, ricordaPartita, statoAvvisi } from "../lib/partite.js";
import { audioAcceso, impostaAudio, sbloccaAudio } from "../lib/suoni.js";
import { useLingua } from "../Lingua.jsx";

/* Il tabellone non è più una scheda fra le altre: resta sempre a schermo,
   quindi le linguette servono solo per ciò che gli sta sotto. */
/**
 * Le sezioni del gioco: le stesse sul telefono e sulla scrivania.
 *
 * Per un po' la scrivania ne ha avute quattro, con "chi c'è al tavolo" e
 * "cosa si stanno dicendo" tenute insieme. Aveva senso finché la chat sul
 * telefono era una striscia; ora che è una sezione a sé, due elenchi
 * diversi per le stesse cose sono solo due posti in cui sbagliarsi.
 */
const SCHEDE = [
  { id: "scheda", icona: "scheda",    chiave: "schede.scheda" },
  { id: "gioc",   icona: "giocatori", chiave: "schede.giocatori" },
  { id: "chat",   icona: "chat",      chiave: "schede.chat" },
  { id: "log",    icona: "registro",  chiave: "schede.registro" },
  { id: "regole", icona: "regole",    chiave: "schede.regole" },
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

/** Sulla Ruota si tira un dado solo, salvo beneficenza. */
const unSoloDado = (g) => g.tracciato === "topi" && g.turniBeneficenza === 0;

/**
 * Il pulsante del tiro, dentro la ruota.
 *
 * Sul telefono stava sotto il tabellone, in un riquadro alto quasi
 * duecento pixel: sommato alla barra del tempo e a quella del progresso,
 * del pannello sotto — la scheda, la chat, il registro — restava una
 * striscia. E quel riquadro c'è solo quando tocca a te, quindi il pannello
 * cambiava altezza a ogni giro di turno.
 *
 * Il centro della ruota invece è spazio già speso e sempre lì. Quando
 * tocca a te il cerchio smette di ripetere su che casella sei — lo dice il
 * tuo gettone — e diventa la cosa da fare.
 */
function TiraAlCentro({ io, inAzione, suTira }) {
  const { t } = useLingua();
  return (
    <div className="centro-azione">
      <button className="tira-centro" disabled={inAzione} onClick={suTira}>
        <Icona nome="dado" dim={19} />
        <span>{t(unSoloDado(io) ? "partita.tiraIlDado" : "partita.tiraIDadi")}</span>
      </button>
    </div>
  );
}

/** Il pannello delle azioni: cambia in base a cosa puoi fare adesso. */
function Azioni({ stato, mioId, invia, inAzione, avvisa, tiroAltrove = false }) {
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

  const libero = io.tracciato === "topi" && fuoriDallaCorsa(io);
  /* Col tiro spostato nel cerchio, questo riquadro può restare senza
     niente dentro: un rettangolo scuro e vuoto sotto il tabellone. Se non
     ha nulla da dire, non si disegna. */
  const beneficenzaInCorso = io.tracciato === "topi" && io.turniBeneficenza > 0;
  const sceltaDadi = io.tracciato === "veloce" && io.beneficenzaVeloce;
  const vuoto = tiroAltrove && !libero && !beneficenzaInCorso && !sceltaDadi
    && !stato.pending && !stato.dado;
  if (vuoto) return null;
  const fai = async (az) => {
    const r = await invia(az);
    if (r.errore) avvisa(r.errore);
  };

  if (!mioTurno) {
    /* Di chi sia il turno, e cosa stia facendo, lo dice il centro del
       tabellone. Ripeterlo qui costava un riquadro, e il riquadro costava
       spazio al tabellone. Resta solo ciò che riguarda te e che lì non
       starebbe: i turni che salterai. */
    if (io.turniDaSaltare > 0) {
      return (
        <div className="carta-scura ta-c">
          <p className="f13 tenue" style={{ margin: 0 }}>
            {t("partita.salterai", { n: io.turniDaSaltare })}
          </p>
        </div>
      );
    }
    return null;
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
          {/* Sul telefono il pulsante sta dentro la ruota: vedi il
              commento in `TiraAlCentro`. Qui resta tutto il contorno —
              quanti dadi, la beneficenza — che nel cerchio non starebbe. */}
          {!tiroAltrove && (
            <Bottone variante="btn-oro" className="mt12" disabled={inAzione}
              onClick={() => fai({ tipo: "tira", nDadi: io.tracciato === "veloce" ? nDadi : 2 })}>
              {t(unSoloDado(io) ? "partita.tiraIlDado" : "partita.tiraIDadi")}
            </Bottone>
          )}
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

export default function Partita({ stato, mioId, invia, inAzione, avvisa, suEsci, schedaIniziale = null }) {
  const { t } = useLingua();
  /* Sul telefono nessuna scheda è aperta all'inizio: lo schermo è il
     tabellone e basta. `null` vuol dire "nessun foglio aperto". */
  const [scheda, setScheda] = useState(schedaIniziale);
  /* Su telefono si sfoglia con la barra in basso (`scheda`), sulla
     scrivania con le linguette in cima alla colonna (`sezione`). Due stati
     separati perché i raggruppamenti sono diversi, e perché passando da
     una forma all'altra ognuna deve ritrovarsi dove l'avevi lasciata. */
  const [sezione, setSezione] = useState("scheda");
  const [audio, setAudio] = useState(audioAcceso);
  const [copiato, setCopiato] = useState(false);
  const [uscita, setUscita] = useState(false);

  /**
   * Copia il codice, e in ogni caso dice com'è andata.
   *
   * `navigator.clipboard` esiste solo in contesto sicuro: su HTTPS e su
   * localhost sì, ma aprendo il gioco dal telefono sulla rete di casa —
   * http://192.168.x.x:5173, che è come lo si prova davvero — è
   * `undefined`. Lì il pulsante non faceva niente e non lo diceva, che è
   * il difetto peggiore di tutti: sembra rotto il gioco, non il permesso.
   */
  const copiaCodice = async () => {
    const riuscito = await copiaTesto(stato.codice);
    if (riuscito) {
      setCopiato(true);
      setTimeout(() => setCopiato(false), 1600);
    } else {
      avvisa(t("partita.copiaFallita", { codice: stato.codice }));
    }
  };
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

  /* Il tiro va nel cerchio solo sul telefono, e solo quando è davvero
     l'unica cosa da fare: se ci sono dadi da scegliere o una beneficenza
     in corso, quel contorno nel cerchio non ci starebbe. */
  const tiroAlCentro = !scrivania && mioTurno && !stato.pending && !stato.dado
    && io && !io.eliminato && !(io.tracciato === "veloce" && io.beneficenzaVeloce)
    && !(io.tracciato === "topi" && fuoriDallaCorsa(io));

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
    const guardo = scheda === "chat" || sezione === "chat";
    if (n > lettiChat.current && !guardo) setChatNuova(true);
    if (guardo) { lettiChat.current = n; setChatNuova(false); }
  }, [stato.chat, scheda, sezione]);
  const segnaLetti = useCallback((n) => { lettiChat.current = n; }, []);

  const nuoveRighe = useRef(stato.registro[0]?.id);
  const [logNuovo, setLogNuovo] = useState(false);
  useEffect(() => {
    if (stato.registro[0]?.id !== nuoveRighe.current) {
      nuoveRighe.current = stato.registro[0]?.id;
      if (scheda !== "log" && sezione !== "log") setLogNuovo(true);
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
      {/* Il codice era un pulsante che usciva dalla stanza. Sembrava
          un'etichetta, si premeva per curiosità, e la partita spariva senza
          che niente dicesse cos'era successo. Ora è quello che sembra: un
          codice, che al massimo si copia per invitare qualcuno. */}
      {/* Uscita accanto al codice: riguardano tutte e due la stanza, e
          stanno insieme invece che agli estremi opposti della barra. */}
      <div className="flex cen g8">
        {/* L'uscita prima del codice: si legge da sinistra, e "indietro"
            sta a sinistra in ogni schermata che si sia mai usata. */}
        <button className="btn-barra" onClick={() => setUscita(true)}>
          <Icona nome="esci" dim={16} />
          <span className="etichetta-barra">{t("partita.esci")}</span>
        </button>
        <button onClick={copiaCodice} className="barra-codice"
          aria-label={t("partita.copiaCodice")}>
          <span className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{t("partita.stanza")}</span>
          <span className="flex cen g8">
            <span className="numeri grassetto f16" style={{ color: "var(--carta)", letterSpacing: 2 }}>{stato.codice}</span>
            <Icona nome={copiato ? "spunta" : "copia"} dim={14} />
          </span>
        </button>
      </div>

      {/* La casella su cui sei sta già al centro del tabellone, scritta per
          intero. Quassù era una seconda copia che per giunta non ci stava
          — "Giorno di ..." — e rubava spazio alle due cose che invece
          esistono solo qui: il codice e i contanti. */}
      {scrivania && (
        <div className="ta-c" style={{ flex: 1, minWidth: 0 }}>
          <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>
            {t(io.tracciato === "topi" ? "partita.ruota" : "partita.largo")}
          </div>
          <div className="f13 grassetto riga-sola"
            style={{ color: casella.colore === "#6B4423" ? "#C8A278" : casella.colore }}>
            {casella.emoji} {casella.nome}
          </div>
        </div>
      )}
      <div className="flex cen g12">
        {/* Un pulsante che dice cosa fa se lo premi, non com'è messo
            adesso: "Spegni i suoni" è un'azione, l'altoparlante barrato era
            un indovinello. */}
        <button className="btn-barra" onClick={() => setAudio(impostaAudio(!audio))}
          aria-pressed={audio}>
          <Icona nome={audio ? "suonoAcceso" : "suonoSpento"} dim={16} />
          <span className="etichetta-barra">
            {t(audio ? "partita.spegniSuoni" : "partita.accendiSuoni")}
          </span>
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
            <Tabellone stato={stato} mioId={mioId}
              nota={cheStaFacendo(stato, t)} centroLibero={tiroAlCentro} />
            <Dadi tiro={stato.ultimoTiro} mioId={mioId} />
            {tiroAlCentro && (
              <TiraAlCentro io={io} inAzione={inAzione}
                suTira={async () => {
                  const r = await invia({ tipo: "tira", nDadi: io.tracciato === "veloce" ? 1 : 2 });
                  if (r?.errore) avvisa(r.errore);
                }} />
            )}
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
            <Azioni stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} avvisa={avvisa} tiroAltrove={tiroAlCentro} />
          </div>
        </div>

        {/* La colonna di destra: le linguette non scorrono, il pannello sì. */}
        <div className="colonna-pannello">
          {scrivania && (
            <nav className="pannello-schede" aria-label={t("schede.etichetta")}>
              {SCHEDE.map((sz) => (
                <button key={sz.id} data-attivo={sezione === sz.id}
                  aria-current={sezione === sz.id ? "true" : undefined}
                  onClick={() => {
                    setSezione(sz.id);
                    if (sz.id === "log") setLogNuovo(false);
                  }}>
                  <Icona nome={sz.icona} dim={15} />
                  {t(sz.chiave)}
                  {sz.id === "log" && logNuovo && <span className="punto" />}
                  {sz.id === "chat" && chatNuova && <span className="punto" />}
                </button>
              ))}
            </nav>
          )}

          <div className={`zona-pannello ${scrivania && sezione === "chat" ? "zona-pannello-pieno" : ""}`}>
            {scrivania ? (
              <>
                {sezione === "scheda" && <Scheda giocatore={io} invia={invia} inAzione={inAzione} mio />}
                {sezione === "gioc" && <Giocatori stato={stato} mioId={mioId} />}
                {sezione === "chat" && <Chat stato={stato} mioId={mioId} suLetto={segnaLetti} />}
                {sezione === "log" && <Registro stato={stato} />}
                {sezione === "regole" && <Manuale />}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Decisione stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} />

      {/* Uscire non distrugge niente — si rientra col codice — ma sparire
          dal tavolo senza preavviso è comunque una sorpresa. La conferma
          dice anche come tornare, che è l'informazione che serve. */}
      {uscita && (
        <div className="velo-modale" role="dialog" aria-modal="true"
          aria-labelledby="uscita-titolo">
          <div className="carta modale-uscita">
            <h2 id="uscita-titolo" className="titolo f18" style={{ margin: "0 0 8px" }}>
              {t("partita.esciTitolo")}
            </h2>
            <p className="f13" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
              {t("partita.esciSpiegazione", { codice: stato.codice })}
            </p>
            <div className="riga-btn">
              <Bottone variante="btn-chiaro" onClick={() => setUscita(false)}>
                {t("partita.resta")}
              </Bottone>
              <Bottone variante="btn-rosso" onClick={suEsci}>
                {t("partita.esci")}
              </Bottone>
            </div>
          </div>
        </div>
      )}

      {/* ═══ IL FOGLIO DEL TELEFONO ═══
       *
       * Prima lo schermo era diviso in due: tabellone sopra, pannello
       * sotto. Nessuna delle due metà era abbastanza grande — il tabellone
       * stava in un terzo di schermo e del pannello si vedeva una striscia
       * — e l'altezza della striscia cambiava a ogni turno, perché il
       * pulsante del tiro compare solo quando tocca a te.
       *
       * Ora il tabellone si tiene lo schermo. Le sezioni si aprono come
       * foglio, si leggono per intero e si chiudono: è il gesto che sul
       * telefono si conosce già, ed è lo stesso che il gioco usa per le
       * decisioni. */}
      {!scrivania && scheda && (
        <div className="velo-foglio" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setScheda(null);
        }}>
          <div className={`foglio ${scheda === "regole" ? "foglio-chiaro" : ""}`}
            role="dialog" aria-modal="true"
            aria-label={t(SCHEDE.find((x) => x.id === scheda)?.chiave || "schede.scheda")}>
            <div className="foglio-testa">
              <span className="maniglia" aria-hidden="true" />
              <div className="flex tra cen">
                <h2 className="titolo f18" style={{ margin: 0 }}>
                  {t(SCHEDE.find((x) => x.id === scheda)?.chiave || "schede.scheda")}
                </h2>
                <button className="foglio-chiudi" onClick={() => setScheda(null)}
                  aria-label={t("partita.chiudi")}>
                  <Icona nome="chiudi" dim={18} />
                </button>
              </div>
            </div>
            <div className={`foglio-corpo ${scheda === "chat" ? "foglio-corpo-pieno" : ""}`}>
              {scheda === "scheda" && <Scheda giocatore={io} invia={invia} inAzione={inAzione} mio />}
              {scheda === "gioc" && <Giocatori stato={stato} mioId={mioId} />}
              {scheda === "chat" && <Chat stato={stato} mioId={mioId} suLetto={segnaLetti} />}
              {scheda === "log" && <Registro stato={stato} />}
              {scheda === "regole" && <Manuale />}
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        {SCHEDE.map((sc) => (
          <button key={sc.id} data-attivo={scheda === sc.id}
            aria-expanded={scheda === sc.id}
            onClick={() => {
              /* Premere la scheda già aperta la chiude: è il modo più
                 rapido per tornare al tabellone. */
              setScheda((v) => (v === sc.id ? null : sc.id));
              if (sc.id === "log") setLogNuovo(false);
            }}>
            <Icona nome={sc.icona} dim={19} />
            {t(sc.chiave)}
            {sc.id === "log" && logNuovo && <span className="punto" />}
            {sc.id === "chat" && chatNuova && <span className="punto" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
