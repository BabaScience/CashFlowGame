import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStanza } from "./hooks/useStanza.js";
import { Avviso, Bottone } from "./components/Base.jsx";
import Ingresso from "./screens/Ingresso.jsx";
import Sfida from "./screens/Sfida.jsx";
import Attesa from "./screens/Attesa.jsx";
import Partita from "./screens/Partita.jsx";
import Vittoria from "./components/Vittoria.jsx";
import * as api from "./lib/api.js";
import { traccia, tracciaSessione } from "./lib/traccia.js";
import { MercatoProvider } from "./Mercato.jsx";

const CHIAVE_STANZA = "quotazero:stanza";

export default function App() {
  const mioId = api.mioId();
  const [codice, setCodice] = useState(() => {
    // Un link con ?c=ABCD porta dritto nella stanza.
    const daUrl = new URLSearchParams(location.search).get("c");
    if (daUrl) return daUrl.toUpperCase();
    return localStorage.getItem(CHIAVE_STANZA) || null;
  });
  const [avviso, setAvviso] = useState("");
  const [sfida, setSfida] = useState(false);

  const avvisa = useCallback((t) => {
    setAvviso(t);
    setTimeout(() => setAvviso((a) => (a === t ? "" : a)), 2600);
  }, []);

  const { stato, errore, caricamento, inAzione, invia } = useStanza(codice, mioId);

  /* ── Misure d'uso: solo contatori, nessun identificativo. Vedi traccia.js ── */
  useEffect(() => { tracciaSessione(); }, []);

  const faseVista = useRef(null);
  const uscitaVista = useRef(false);
  useEffect(() => {
    if (!stato) return;
    const io = stato.giocatori.find((g) => g.id === mioId);

    if (stato.fase !== faseVista.current) {
      if (stato.fase === "inCorso" && faseVista.current === "attesa") {
        traccia("partitaAvviata", { giocatori: stato.giocatori.length });
      }
      if (stato.fase === "finita") {
        traccia("partitaFinita", { turni: stato.numeroTurno, motivo: stato.motivoVittoria });
        if (stato.vincitore === mioId) traccia("vittoria");
      }
      faseVista.current = stato.fase;
    }

    // Il momento che il gioco esiste per insegnare.
    if (io?.tracciato === "veloce" && !uscitaVista.current) {
      uscitaVista.current = true;
      traccia("uscitaDallaRuota", { turni: io.turniGiocati });
    }
  }, [stato, mioId]);

  // Chi chiude a partita in corso: è il numero che dice se il gioco è troppo lungo.
  useEffect(() => {
    const suChiusura = () => {
      if (stato?.fase === "inCorso") traccia("abbandono", { turni: stato.numeroTurno });
    };
    window.addEventListener("pagehide", suChiusura);
    return () => window.removeEventListener("pagehide", suChiusura);
  }, [stato]);

  useEffect(() => {
    if (codice) localStorage.setItem(CHIAVE_STANZA, codice);
    else localStorage.removeItem(CHIAVE_STANZA);
    // Ripulisce il parametro dall'indirizzo, così un ricaricamento non ripete l'ingresso.
    if (codice && new URLSearchParams(location.search).get("c")) {
      history.replaceState(null, "", location.pathname);
    }
  }, [codice]);

  const esci = useCallback(async () => {
    if (stato && stato.fase === "attesa") {
      await invia({ tipo: "esci" }).catch(() => {});
    }
    setCodice(null);
  }, [stato, invia]);

  const chiudiStanza = useCallback(async () => {
    try {
      await api.chiudiStanza(codice);
      avvisa("Stanza chiusa, dati cancellati.");
    } catch (e) { avvisa(e.message); }
    setCodice(null);
  }, [codice, avvisa]);

  /* ── Nessuna stanza: schermata d'ingresso ── */
  /* La sfida del giorno non ha stanza: gira tutta nel browser. */
  if (sfida) {
    return <Sfida suEsci={() => setSfida(false)} />;
  }

  if (!codice) {
    return (
      <MercatoProvider stato={stato}>
        <div className="schermo" style={{ paddingBottom: 24 }}>
          <Ingresso suEntrato={setCodice} avvisa={avvisa} suSfida={() => setSfida(true)} />
          <Avviso testo={avviso} />
        </div>
      </MercatoProvider>
    );
  }

  /* ── Stanza non raggiungibile ── */
  if (errore && !stato) {
    return (
      <MercatoProvider stato={stato}>
        <div className="schermo" style={{ paddingBottom: 24 }}>
          <div className="contenuto ta-c">
            <div className="carta mt20">
              <div style={{ fontSize: 30 }}>⚠️</div>
              <h2 className="titolo f18 mt12" style={{ margin: "12px 0 8px" }}>{errore}</h2>
              <p className="f13 tenue" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
                Le stanze inattive vengono cancellate dopo 48 ore per non occupare spazio inutilmente.
              </p>
              <Bottone variante="btn-oro" onClick={() => setCodice(null)}>Torna all'inizio</Bottone>
            </div>
          </div>
          <Avviso testo={avviso} />
        </div>
      </MercatoProvider>
    );
  }

  /* ── Caricamento ── */
  if (caricamento && !stato) {
    return (
      <MercatoProvider stato={stato}>
        <div className="schermo" style={{ justifyContent: "center", alignItems: "center", paddingBottom: 0 }}>
          <div className="ta-c">
            <div style={{ fontSize: 28, color: "var(--oro-chiaro)" }}>◆</div>
            <p className="f14 tenue mt12">Carico la stanza {codice}…</p>
          </div>
        </div>
      </MercatoProvider>
    );
  }

  if (!stato) return null;

  /* ── Sala d'attesa ── */
  if (stato.fase === "attesa") {
    return (
      <MercatoProvider stato={stato}>
        <div className="schermo" style={{ paddingBottom: 24 }}>
          <Attesa stato={stato} mioId={mioId} invia={invia} inAzione={inAzione}
            avvisa={avvisa} suEsci={esci} />
          <Avviso testo={avviso} />
        </div>
      </MercatoProvider>
    );
  }

  /* ── Partita ── */
  return (
    <MercatoProvider stato={stato}>
      <>
        <Partita stato={stato} mioId={mioId} invia={invia} inAzione={inAzione}
          avvisa={avvisa} suEsci={esci} />
        {stato.fase === "finita" && (
          <Vittoria
            stato={stato} mioId={mioId}
            sonoHost={stato.hostId === mioId}
            suNuovaPartita={() => setCodice(null)}
            suChiudi={chiudiStanza}
          />
        )}
        <Avviso testo={avviso} />
      </>
    </MercatoProvider>
  );
}
