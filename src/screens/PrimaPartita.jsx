import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { applicaAzione } from "../game/motore.js";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import { Bottone, Barra } from "../components/Base.jsx";
import Partita from "./Partita.jsx";
import Logo from "../components/Logo.jsx";
import { redditoPassivo, speseTotali, sogliaUscita, progressoLiberta } from "../game/finanze.js";
import { durata } from "../game/tempo.js";
import { prossimoPasso } from "../game/guida.js";
import {
  creaPrimaPartita, segnaPrimaPartita, turniPrimaPartita,
} from "../game/prima-partita.js";
import { preparaMessaggio, accoda } from "../game/chat.js";
import { useAvversari } from "../hooks/useAvversari.js";
import { traccia } from "../lib/traccia.js";
import { useSuoni } from "../hooks/useSuoni.js";
import { useLingua } from "../Lingua.jsx";
import { testoErrore } from "../lib/errori.js";

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
  const { t, lingua } = useLingua();
  const { soldi } = useMercato();
  const [errore, setErrore] = useState("");
  const [finita, setFinita] = useState(false);
  const stato = partita.stato;
  const io = stato.giocatori[0];
  useSuoni(stato, "io");

  /* La voce. `detti` è un riferimento e non uno stato perché non deve far
     ridisegnare niente da solo: cambia insieme al messaggio. */
  const detti = useRef(new Set());

  /* La prima frase si calcola disegnando, non in un effetto.
     In un effetto arrivava un istante dopo — il primo fotogramma della
     prima partita era senza la voce — e non c'era affatto quando la
     schermata viene disegnata sul server, dove gli effetti non girano.
     Così sparisce anche la guardia contro il doppio montaggio di
     sviluppo: l'inizializzatore di `useState` e il riferimento `detti`
     nascono insieme, quindi restano d'accordo comunque. */
  const [voce, setVoce] = useState(() => {
    const passo = prossimoPasso(null, stato, detti.current);
    if (!passo) return null;
    detti.current.add(passo.id);
    return { id: passo.id, testo: t(`guida.${passo.id}`, passo.valori ? passo.valori(stato, soldi) : {}) };
  });

  const parla = useCallback((prima, dopo) => {
    const passo = prossimoPasso(prima, dopo, detti.current);
    if (!passo) return;
    detti.current.add(passo.id);
    const valori = passo.valori ? passo.valori(dopo, soldi) : {};
    setVoce({ id: passo.id, testo: t(`guida.${passo.id}`, valori) });
  }, [soldi, t]);


  /* `giocatoreId` non si forza più: le mosse dell'avversario automatico
     arrivano da `useAvversari` col proprio, e riscriverle come "io" le
     faceva rifiutare dal motore — la partita si fermava al primo turno
     di Bea. Quelle che arrivano dai pulsanti non ce l'hanno, e sono mie. */
  const invia = useCallback(async (az) => {
    const r = applicaAzione(stato, { giocatoreId: "io", ...az });
    if (r.errore) {
      const msg = testoErrore(lingua, r);
      setErrore(msg);
      return { errore: msg };
    }
    setErrore("");
    const nuovo = r.stato;
    setPartita({ ...partita, stato: nuovo });
    parla(stato, nuovo);

    if (nuovo.fase === "finita" || nuovo.numeroTurno > turniPrimaPartita(nuovo)) {
      segnaPrimaPartita();
      traccia("primaPartitaFinita", { turni: nuovo.numeroTurno });
      setFinita(true);
    }
    return { errore: null };
  }, [stato, partita, setPartita, parla]);

  /* L'avversario automatico gioca come in una partita vera: stessa
     funzione, stesse regole, stessa pausa perché si veda cosa fa. */
  useAvversari(stato, invia, true);

  /* ═══ UNA CHAT CHE FUNZIONA DAVVERO ═══
   *
   * Qui la stanza non esiste da nessuna parte: non c'è un codice, non c'è
   * un server. La chat però deve funzionare lo stesso, perché una chat
   * spenta alla prima partita insegna che la chat non serve — e invece è
   * metà del motivo per cui si gioca con qualcuno.
   *
   * Passa dalle stesse funzioni del server (`preparaMessaggio`, `accoda`),
   * quindi valgono gli stessi limiti: lunghezza, pausa fra due messaggi,
   * tetto della cronologia. */
  const scrivi = useCallback((chi, testo) => {
    setPartita((p) => {
      const r = preparaMessaggio(p.stato, chi, testo);
      if (!r.messaggio) return p;
      return { ...p, stato: accoda(structuredClone(p.stato), r.messaggio) };
    });
    return { errore: null };
  }, [setPartita]);

  const canaleChat = useMemo(() => ({
    manda: async (testo) => scrivi("io", testo),
    interruttore: async () => ({ errore: null }),
  }), [scrivi]);

  /* Bea dice qualcosa, una volta sola, quando la partita è avviata: una
     chat vuota si legge come una chat rotta. */
  const salutato = useRef(false);
  useEffect(() => {
    if (salutato.current || stato.fase !== "inCorso") return;
    salutato.current = true;
    const quando = setTimeout(() => scrivi("bea", t("guida.beaSaluta")), 1800);
    return () => clearTimeout(quando);
  }, [stato.fase, scrivi, t]);

  if (finita) {
    return <Fine stato={stato} suEsci={suEsci} suGiocaDavvero={suGiocaDavvero} />;
  }

  return (
    <Partita
      stato={stato} mioId="io" invia={invia} inAzione={false}
      avvisa={setErrore} suEsci={suEsci}
      guida={<Voce voce={voce} />}
      canaleChat={canaleChat}
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
