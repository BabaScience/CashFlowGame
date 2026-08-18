import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tabellone, { Legenda } from "../components/Tabellone.jsx";
import Dadi from "../components/Dadi.jsx";
import Scheda from "../components/Scheda.jsx";
import Giocatori from "../components/Giocatori.jsx";
import Registro from "../components/Registro.jsx";
import Manuale from "../components/Manuale.jsx";
import Decisione from "../components/Decisione.jsx";
import { Bottone, NumeroAnimato, Barra } from "../components/Base.jsx";
import { soldi, riepilogo, fuoriDallaCorsa } from "../game/finanze.js";
import { CORSA_TOPI, CASELLE_TOPI, CORSIA_VELOCE, CASELLE_VELOCE } from "../game/data/tabellone.js";
import { useSchermoLargo } from "../hooks/useSchermo.js";

const SCHEDE = [
  { id: "tavolo", icona: "◆", nome: "Tavolo" },
  { id: "scheda", icona: "▤", nome: "Scheda" },
  { id: "gioc", icona: "◉", nome: "Giocatori" },
  { id: "log", icona: "☰", nome: "Registro" },
  { id: "regole", icona: "?", nome: "Regole" },
];

/** Riquadro che racconta agli altri cosa sta succedendo sul tavolo. */
function SulTavolo({ stato }) {
  const p = stato.pending;
  if (!p) return null;
  const chi = stato.giocatori.find((g) => g.id === p.giocatoreId);
  const nome = chi?.nome || "Qualcuno";

  // Calcolato con uno switch e non con un oggetto: un oggetto valuterebbe
  // subito tutti i rami, e quello del Mercato legge campi che esistono
  // soltanto sulle carte Mercato.
  let testo;
  switch (p.tipo) {
    case "sceltaTaglia": testo = `${nome} sta scegliendo fra Piccolo e Grande Affare.`; break;
    case "carta": testo = `${nome} sta valutando "${p.carta?.nome}".`; break;
    case "mercato": {
      const mancanti = (p.idonei?.length || 0) - (p.risposto?.length || 0);
      testo = `Carta Mercato: "${p.carta?.nome}". In attesa di ${mancanti} giocator${mancanti === 1 ? "e" : "i"}.`;
      break;
    }
    case "extra": testo = `${nome} ha pescato una Spesa Extra: "${p.carta?.nome}".`; break;
    case "beneficenza":
    case "beneficenzaVeloce": testo = `${nome} decide se donare in beneficenza.`; break;
    case "figlio": testo = `${nome} è atterrato su "Un figlio".`; break;
    case "licenziamento": testo = `${nome} è stato licenziato.`; break;
    case "bancarotta": testo = `${nome} è in bancarotta e sta vendendo attivi.`; break;
    case "affareVeloce": testo = `${nome} valuta l'affare "${p.affare?.nome}".`; break;
    case "sogno": testo = `${nome} è atterrato su un sogno: "${p.sogno?.nome}".`; break;
    case "penalitaVeloce": testo = `${nome}: ${p.nome}.`; break;
    default: testo = `${nome} sta decidendo.`;
  }

  return (
    <motion.div className="carta-scura mt12"
      initial={false} animate={{ opacity: 1, y: 0 }}>
      <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)" }}>Sul tavolo</div>
      <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>{testo}</p>
      {p.carta?.testo && (
        <p className="f13 tenue mt8" style={{ margin: "8px 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
          «{p.carta.testo}»
        </p>
      )}
    </motion.div>
  );
}

/** Il pannello delle azioni: cambia in base a cosa puoi fare adesso. */
function Azioni({ stato, mioId, invia, inAzione, avvisa }) {
  const io = stato.giocatori.find((g) => g.id === mioId);
  const diTurno = stato.giocatori[stato.turno];
  const mioTurno = diTurno?.id === mioId;
  const [nDadi, setNDadi] = useState(2);

  if (!io) return null;
  if (io.eliminato) {
    return (
      <div className="carta-scura mt12 ta-c">
        <p className="f14" style={{ margin: 0 }}>Sei fuori dalla partita, ma puoi continuare a seguirla.</p>
      </div>
    );
  }

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
          <span className="f14">Tocca a <strong>{diTurno?.nome}</strong></span>
        </div>
        {io.turniDaSaltare > 0 && (
          <p className="f13 tenue mt8" style={{ margin: "8px 0 0" }}>
            Salterai i prossimi {io.turniDaSaltare} turni.
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
          <div className="titolo f16 mb4">Sei libero!</div>
          <p className="f13" style={{ margin: "0 0 12px", lineHeight: 1.45 }}>
            Il tuo reddito passivo ({soldi(riepilogo(io).redditoPassivo)}) supera
            le spese ({soldi(riepilogo(io).speseTotali)}).
            Uscendo ricevi <strong>{soldi(riepilogo(io).redditoPassivo * 100)}</strong> di liquidazione.
          </p>
          <Bottone variante="btn-verde" disabled={inAzione}
            onClick={() => fai({ tipo: "esciDallaCorsa" })}>
            Esci dalla Corsa dei Topi
          </Bottone>
        </motion.div>
      )}

      <Dadi dado={stato.dado} />

      {!stato.pending && !stato.dado && (
        <>
          {io.tracciato === "topi" && io.turniBeneficenza > 0 && (
            <p className="f13 ta-c mb8" style={{ margin: "12px 0 8px", color: "var(--oro-chiaro)" }}>
              Beneficenza attiva: tiri 2 dadi ({io.turniBeneficenza} turni rimasti).
            </p>
          )}
          {io.tracciato === "veloce" && io.beneficenzaVeloce && (
            <div className="mb12 mt12">
              <div className="etichetta ta-c" style={{ color: "rgba(244,241,230,.6)" }}>Quanti dadi?</div>
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
          Casella risolta. Il turno sta passando…
        </p>
      )}
    </div>
  );
}

export default function Partita({ stato, mioId, invia, inAzione, avvisa, suEsci }) {
  const [scheda, setScheda] = useState("tavolo");
  const largo = useSchermoLargo();
  const io = stato.giocatori.find((g) => g.id === mioId);
  const diTurno = stato.giocatori[stato.turno];
  const mioTurno = diTurno?.id === mioId;

  // Notifica discreta quando arriva il tuo turno.
  const eraMio = useRef(mioTurno);
  useEffect(() => {
    if (mioTurno && !eraMio.current) {
      avvisa("Tocca a te!");
      if (navigator.vibrate) navigator.vibrate(45);
    }
    eraMio.current = mioTurno;
  }, [mioTurno, avvisa]);

  const nuoveRighe = useRef(stato.registro[0]?.id);
  const [logNuovo, setLogNuovo] = useState(false);
  useEffect(() => {
    if (stato.registro[0]?.id !== nuoveRighe.current) {
      nuoveRighe.current = stato.registro[0]?.id;
      if (scheda !== "log") setLogNuovo(true);
    }
  }, [stato.registro, scheda]);

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
    ? CASELLE_TOPI[CORSA_TOPI[io.posizione]]
    : CASELLE_VELOCE[CORSIA_VELOCE[io.posizione].tipo];

  const barraAlta = (
    <div className="flex tra cen g12" style={{
      padding: "12px 14px", background: "rgba(0,0,0,.24)",
      borderBottom: "1px solid rgba(255,255,255,.07)", position: "sticky", top: 0, zIndex: 30,
      backdropFilter: "blur(12px)",
    }}>
      <button onClick={suEsci} className="f11 tenue" style={{ textAlign: "left", background: "none" }}>
        <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>Stanza</div>
        <div className="numeri grassetto f16" style={{ color: "var(--carta)", letterSpacing: 2 }}>{stato.codice}</div>
      </button>
      <div className="ta-c" style={{ flex: 1, minWidth: 0 }}>
        <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>
          {io.tracciato === "topi" ? "Corsa dei Topi" : "Corsia Veloce"}
        </div>
        <div className="f13 grassetto" style={{ color: casella.colore === "#6B4423" ? "#C8A278" : casella.colore }}>
          {casella.emoji} {casella.nome}
        </div>
      </div>
      <div className="ta-r">
        <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>Contanti</div>
        <div className="numeri grassetto f16"><NumeroAnimato valore={io.contanti} /></div>
      </div>
    </div>
  );

  const pannelloTavolo = (
    <>
      <Tabellone stato={stato} mioId={mioId} />
      <Legenda tracciato={io.tracciato} />
      <Azioni stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} avvisa={avvisa} />
      <SulTavolo stato={stato} />

      {io.tracciato === "topi" && (
        <div className="carta-scura mt12">
          <div className="flex tra f12 mb4">
            <span className="tenue">Reddito passivo verso le spese</span>
            <span className="numeri grassetto">{soldi(r.redditoPassivo)} / {soldi(r.speseTotali)}</span>
          </div>
          <Barra scura valore={r.progresso} />
        </div>
      )}
    </>
  );

  return (
    <div className="schermo">
      {barraAlta}

      <div className="contenuto">
        {/* Su schermi larghi si vede tutto insieme. */}
        <div className="scrivania">
          <div>
            {(largo || scheda === "tavolo") && pannelloTavolo}
            {largo && scheda === "regole" && <div className="mt12"><Manuale /></div>}
            {!largo && (
              <>
                {scheda === "scheda" && <div className="mt12"><Scheda giocatore={io} invia={invia} inAzione={inAzione} mio /></div>}
                {scheda === "gioc" && <div className="mt12"><Giocatori stato={stato} mioId={mioId} /></div>}
                {scheda === "log" && <div className="mt12"><Registro stato={stato} /></div>}
                {scheda === "regole" && <div className="mt12"><Manuale /></div>}
              </>
            )}
          </div>

          {largo && (
            <div className="scrivania-lato">
              <Giocatori stato={stato} mioId={mioId} />
              <div className="mt12"><Scheda giocatore={io} invia={invia} inAzione={inAzione} mio /></div>
              <div className="mt12"><Registro stato={stato} limite={25} /></div>
            </div>
          )}
        </div>
      </div>

      <Decisione stato={stato} mioId={mioId} invia={invia} inAzione={inAzione} />

      {largo && (
        <button
          className="btn btn-chiaro btn-piccolo"
          style={{ position: "fixed", right: 22, bottom: 22, width: "auto", zIndex: 35 }}
          onClick={() => setScheda(scheda === "regole" ? "tavolo" : "regole")}
        >
          {scheda === "regole" ? "Torna al tavolo" : "Regole del gioco"}
        </button>
      )}

      <nav className="navbar">
        {SCHEDE.map((s) => (
          <button key={s.id} data-attivo={scheda === s.id}
            onClick={() => { setScheda(s.id); if (s.id === "log") setLogNuovo(false); }}>
            <span className="icona">{s.icona}</span>
            {s.nome}
            {s.id === "log" && logNuovo && <span className="punto" />}
          </button>
        ))}
      </nav>
    </div>
  );
}
