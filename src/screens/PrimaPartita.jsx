import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { applicaAzione } from "../game/motore.js";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import { Bottone, Barra } from "../components/Base.jsx";
import TavoloSolitario from "../components/TavoloSolitario.jsx";
import Logo from "../components/Logo.jsx";
import { redditoPassivo, speseTotali, sogliaUscita, progressoLiberta } from "../game/finanze.js";
import { durata } from "../game/tempo.js";
import { prossimoPasso } from "../game/guida.js";
import {
  creaPrimaPartita, segnaPrimaPartita, TURNI_PRIMA_PARTITA,
} from "../game/prima-partita.js";
import { traccia } from "../lib/traccia.js";
import { useSuoni } from "../hooks/useSuoni.js";
import { useLingua } from "../Lingua.jsx";

/**
 * LA PRIMA PARTITA.
 *
 * Il gioco è stato provato da amici senza spiegazioni, e la domanda è
 * sempre la stessa: «cos'è questo? non capisco niente». Questa schermata è
 * la risposta, e non è un giro di finestrelle prima di cominciare: è una
 * partita vera, corta, con una voce che dice una cosa sola nel momento in
 * cui quella cosa succede.
 *
 * Un giro di finestrelle si salta e non insegna niente, perché spiega
 * l'interfaccia. Quello che mancava non era l'interfaccia: era l'idea.
 */
export default function PrimaPartita({ suEsci, suGiocaDavvero }) {
  /* Il nome che si è già dato altrove, se c'è: «Turno di Tu» si legge
     male, e questa è la prima frase che qualcuno legge del gioco. */
  const [partita, setPartita] = useState(() => creaPrimaPartita({
    nome: (() => {
      try { return localStorage.getItem("quotazero:nome") || undefined; } catch { return undefined; }
    })(),
  }));
  return (
    <MercatoProvider stato={partita.stato}>
      <Dentro partita={partita} setPartita={setPartita}
        suEsci={suEsci} suGiocaDavvero={suGiocaDavvero} />
    </MercatoProvider>
  );
}

function Dentro({ partita, setPartita, suEsci, suGiocaDavvero }) {
  const { t } = useLingua();
  const { soldi } = useMercato();
  const [errore, setErrore] = useState("");
  const [finita, setFinita] = useState(false);
  const stato = partita.stato;
  const io = stato.giocatori[0];
  useSuoni(stato, "io");

  /* La voce. `detti` è un riferimento e non uno stato perché non deve far
     ridisegnare niente da solo: cambia insieme al messaggio. */
  const detti = useRef(new Set());
  const [voce, setVoce] = useState(null);

  const parla = useCallback((prima, dopo) => {
    const passo = prossimoPasso(prima, dopo, detti.current);
    if (!passo) return;
    detti.current.add(passo.id);
    const valori = passo.valori ? passo.valori(dopo, soldi) : {};
    setVoce({ id: passo.id, testo: t(`guida.${passo.id}`, valori) });
  }, [soldi, t]);

  /* Il primo messaggio, prima di qualunque mossa.
     Con la guardia: in sviluppo React monta due volte, e senza questa il
     primo messaggio veniva detto e subito scavalcato dal secondo — chi
     apriva la prima partita non leggeva mai chi era. */
  const avviato = useRef(false);
  useEffect(() => {
    if (avviato.current) return;
    avviato.current = true;
    parla(null, stato);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const invia = useCallback(async (az) => {
    const r = applicaAzione(stato, { ...az, giocatoreId: "io" });
    if (r.errore) { setErrore(r.errore); return { errore: r.errore }; }
    setErrore("");
    const nuovo = r.stato;
    setPartita({ ...partita, stato: nuovo });
    parla(stato, nuovo);

    if (nuovo.fase === "finita" || nuovo.numeroTurno > TURNI_PRIMA_PARTITA) {
      segnaPrimaPartita();
      traccia("primaPartitaFinita", { turni: nuovo.numeroTurno });
      setFinita(true);
    }
    return { errore: null };
  }, [stato, partita, setPartita, parla]);

  if (finita) {
    return <Fine stato={stato} suEsci={suEsci} suGiocaDavvero={suGiocaDavvero} />;
  }

  const rendita = redditoPassivo(io);
  const traguardo = Math.round(sogliaUscita(io));

  return (
    <TavoloSolitario
      stato={stato} invia={invia} errore={errore}
      intestazione={(
        <div className="flex tra cen g12" style={{
          padding: "12px 14px", background: "rgba(0,0,0,.24)",
          borderBottom: "1px solid rgba(255,255,255,.07)", flex: "none",
        }}>
          <button onClick={suEsci} className="f11 tenue" style={{ textAlign: "left", background: "none" }}>
            <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{t("guida.titolo")}</div>
            <div className="numeri grassetto f16">
              {Math.min(stato.numeroTurno, TURNI_PRIMA_PARTITA)} / {TURNI_PRIMA_PARTITA}
            </div>
          </button>
          <div className="ta-r" style={{ flex: 1 }}>
            <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{t("sfida.contanti")}</div>
            <div className="numeri grassetto f16">{soldi(io.contanti)}</div>
          </div>
        </div>
      )}
      sopraIlTabellone={<Voce voce={voce} />}
      progresso={(
        <>
          <div className="flex tra f12 mb4">
            <span className="tenue">{t("partita.renditaVersoSpese")}</span>
            <span className="numeri grassetto">{soldi(rendita)} / {soldi(traguardo)}</span>
          </div>
          <Barra scura valore={progressoLiberta(io)} />
        </>
      )}
    />
  );
}

/** La striscia che parla. Sta sopra il tabellone, non sopra la partita. */
function Voce({ voce }) {
  if (!voce) return null;
  return (
    <motion.div
      key={voce.id}
      className="guida-voce"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <span className="guida-becco" aria-hidden="true">◆</span>
      <p>{voce.testo}</p>
    </motion.div>
  );
}

/** Alla fine: cosa hai costruito, e cosa succede in una partita vera. */
function Fine({ stato, suEsci, suGiocaDavvero }) {
  const { t } = useLingua();
  const { soldi } = useMercato();
  const io = stato.giocatori[0];
  const rendita = redditoPassivo(io);
  const traguardo = Math.round(sogliaUscita(io));
  const quota = Math.round(progressoLiberta(io) * 100);

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="ta-c cappello">
          <Logo grande />
        </div>

        <div className="carta ta-c mt12">
          <div className="etichetta" style={{ margin: 0 }}>{t("guida.fineTitolo")}</div>
          <div className="titolo numeri f28" style={{ margin: "6px 0 2px" }}>{soldi(rendita)}</div>
          <p className="f13 tenue" style={{ margin: 0 }}>{t("guida.fineRendita")}</p>

          <div className="mt16">
            <div className="flex tra f12 mb4">
              <span className="tenue">{t("partita.renditaVersoSpese")}</span>
              <span className="numeri grassetto">{quota}%</span>
            </div>
            <Barra valore={progressoLiberta(io)} />
          </div>

          <p className="f14" style={{ margin: "16px 0 0", lineHeight: 1.55 }}>
            {t("guida.fineSpiegazione", {
              traguardo: soldi(traguardo),
              tempo: durata(io.mesi, t),
            })}
          </p>
        </div>

        <div className="mt16 mb12">
          <Bottone variante="btn-verde" onClick={suGiocaDavvero}>{t("guida.giocaDavvero")}</Bottone>
          <Bottone variante="btn-fantasma mt8" onClick={suEsci}>{t("guida.tornaACasa")}</Bottone>
        </div>
      </div>
    </div>
  );
}
