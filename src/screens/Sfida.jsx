import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { applicaAzione } from "../game/motore.js";
import {
  creaSfida, punteggio, fasciaPunteggio, testoDaCondividere,
  registraRisultato, risultatoDiOggi, storicoSfida,
  giornoSfida, TURNI_SFIDA,
} from "../game/sfida.js";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import {
  riferimentoDelGiorno, registraValutazione, storicoValutazione, fasciaValutazione,
} from "../game/valutazione.js";
import { Bottone, Barra } from "../components/Base.jsx";
import Tabellone from "../components/Tabellone.jsx";
import Dadi from "../components/Dadi.jsx";
import Scheda from "../components/Scheda.jsx";
import Decisione from "../components/Decisione.jsx";
import Registro from "../components/Registro.jsx";
import { riepilogo } from "../game/finanze.js";
import { traccia } from "../lib/traccia.js";
import { useSuoni } from "../hooks/useSuoni.js";

/**
 * LA SFIDA DEL GIORNO.
 *
 * Gira tutta qui, nel browser: nessuna stanza, nessuna scrittura sul
 * database, nessun costo. Il motore è la stessa funzione pura che usa il
 * server, quindi la sfida e la partita al tavolo si comportano allo stesso
 * modo — e i componenti sono gli stessi, quindi non c'è una seconda
 * interfaccia da tenere allineata.
 */
export default function Sfida({ suEsci, mercatoId = "roma" }) {
  const giorno = giornoSfida();
  const gia = risultatoDiOggi(giorno);
  const [partita, setPartita] = useState(null);

  if (!partita) {
    return (
      <MercatoProvider mercatoId={mercatoId}>
        <Presentazione giorno={giorno} gia={gia} suEsci={suEsci}
          suGioca={() => { traccia("sfidaIniziata"); setPartita(creaSfida({ giorno, mercatoId })); }} />
      </MercatoProvider>
    );
  }

  return (
    <MercatoProvider stato={partita.stato}>
      <Tavolo partita={partita} setPartita={setPartita} giorno={giorno} suEsci={suEsci} />
    </MercatoProvider>
  );
}

/* ── prima di cominciare ───────────────────────────────────── */

function Presentazione({ giorno, gia, suGioca, suEsci }) {
  const { pacchetto, soldi } = useMercato();
  const storico = storicoSfida();
  const val = storicoValutazione();
  const fv = fasciaValutazione(val.valutazione);

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="carta-scura mt20 ta-c">
          <div className="maiusc" style={{ color: "rgba(244,241,230,.45)" }}>Sfida del giorno</div>
          <h1 className="titolo f28 mb8" style={{ margin: "6px 0 8px" }}>{pacchetto.nome}</h1>
          <p className="f13 tenue" style={{ margin: "0 0 16px" }}>{giorno}</p>

          <p className="f14" style={{ margin: "0 0 18px", lineHeight: 1.5 }}>
            Stessa scheda, stesso mazzo, stesse carte per tutti quelli che giocano
            oggi. {TURNI_SFIDA} turni per portare la rendita il più vicino possibile
            alle tue spese. Un solo tentativo.
          </p>

          <div className="carta mt12" style={{ padding: "14px 16px" }}>
            <div className="flex tra cen">
              <div style={{ textAlign: "left" }}>
                <div className="maiusc tenue">Valutazione</div>
                <div className="titolo f28" style={{ lineHeight: 1.1 }}>{val.valutazione}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="f20">{fv.emoji}</div>
                <div className="f13 grassetto">{fv.nome}</div>
              </div>
            </div>
          </div>

          {(storico.giocate > 0) && (
            <div className="flex g12" style={{ justifyContent: "center", margin: "16px 0 18px" }}>
              <Dato k="Serie" v={`${storico.serie} 🔥`} />
              <Dato k="Record" v={`${storico.migliore}`} />
              <Dato k="Giocate" v={`${storico.giocate}`} />
            </div>
          )}

          {gia ? (
            <>
              <div className="carta mt12" style={{ textAlign: "center" }}>
                <div className="maiusc tenue">Oggi hai fatto</div>
                <div className="titolo f28" style={{ color: "var(--verde)" }}>{gia.punteggio}<span className="f16 tenue">/100</span></div>
                <p className="f13 tenue" style={{ margin: "8px 0 0" }}>
                  Torna domani: la sfida cambia a mezzanotte.
                </p>
              </div>
              <Bottone variante="btn-fantasma mt12" onClick={suEsci}>Torna all'inizio</Bottone>
            </>
          ) : (
            <>
              <Bottone variante="btn-oro" onClick={suGioca}>Gioca la sfida di oggi</Bottone>
              <Bottone variante="btn-fantasma mt12" onClick={suEsci}>Torna all'inizio</Bottone>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Dato = ({ k, v }) => (
  <div className="ta-c">
    <div className="numeri grassetto f20">{v}</div>
    <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>{k}</div>
  </div>
);

/* ── la partita ────────────────────────────────────────────── */

function Tavolo({ partita, setPartita, giorno, suEsci }) {
  const { soldi } = useMercato();
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState(null);
  const stato = partita.stato;
  const io = stato.giocatori[0];
  useSuoni(stato, "io");

  const finita = stato.fase === "finita" || stato.numeroTurno > TURNI_SFIDA;

  const invia = useCallback(async (az) => {
    const r = applicaAzione(stato, { ...az, giocatoreId: "io" });
    if (r.errore) { setErrore(r.errore); return { errore: r.errore }; }
    setErrore("");
    const nuovo = r.stato;
    setPartita({ ...partita, stato: nuovo });

    if (nuovo.fase === "finita" || nuovo.numeroTurno > TURNI_SFIDA) {
      const res = registraRisultato(nuovo, giorno);
      /* Il riferimento gioca la stessa identica partita: il confronto misura
         le scelte, non la fortuna del mazzo. */
      const rif = riferimentoDelGiorno(giorno, nuovo.mercatoId);
      const v = registraValutazione(res.punteggio, rif);
      setEsito({ ...res, riferimento: rif, valutazione: v });
      traccia("sfidaFinita", { turni: nuovo.numeroTurno });
    }
    return { errore: null };
  }, [stato, partita, setPartita, giorno]);

  if (esito) return <Esito stato={stato} esito={esito} giorno={giorno} suEsci={suEsci} />;

  const r = riepilogo(io);
  const p = punteggio(stato);

  return (
    <div className="schermo schermo-partita">
      <div className="flex tra cen g12" style={{
        padding: "12px 14px", background: "rgba(0,0,0,.24)",
        borderBottom: "1px solid rgba(255,255,255,.07)", flex: "none",
      }}>
        <button onClick={suEsci} className="f11 tenue" style={{ textAlign: "left", background: "none" }}>
          <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>Sfida</div>
          <div className="numeri grassetto f16">{giorno.slice(5)}</div>
        </button>
        <div className="ta-c" style={{ flex: 1 }}>
          <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>Turno</div>
          <div className="numeri grassetto f16">{Math.min(stato.numeroTurno, TURNI_SFIDA)} / {TURNI_SFIDA}</div>
        </div>
        <div className="ta-r">
          <div className="maiusc" style={{ color: "rgba(244,241,230,.4)" }}>Contanti</div>
          <div className="numeri grassetto f16">{soldi(io.contanti)}</div>
        </div>
      </div>

      <div className="corpo">
        <div className="colonna-tavolo">
          <div className="zona-tavolo">
            <Tabellone stato={stato} mioId="io" />
            <Dadi tiro={stato.ultimoTiro} mioId="io" />
          </div>
          <div className="zona-progresso">
            <div className="flex tra f12 mb4">
              <span className="tenue">Punteggio</span>
              <span className="numeri grassetto">{p}/100</span>
            </div>
            <Barra scura valore={Math.min(1, p / 100)} />
          </div>
          <div className="zona-azioni">
            {!finita && !stato.pending && !stato.dado && (
              <Bottone variante="btn-oro" onClick={() => invia({ tipo: "tira", nDadi: 2 })}>
                Tira il dado
              </Bottone>
            )}
            {io.tracciato === "topi" && r.redditoPassivo > r.speseTotali && (
              <Bottone variante="btn-verde mt12" onClick={() => invia({ tipo: "esciDallaCorsa" })}>
                Prendi il largo
              </Bottone>
            )}
            {errore && <p className="f12 neg mt8" style={{ margin: "8px 0 0" }}>{errore}</p>}
          </div>
        </div>

        <div className="zona-pannello">
          <Scheda giocatore={io} invia={invia} inAzione={false} mio />
          <div className="mt12"><Registro stato={stato} limite={12} /></div>
        </div>
      </div>

      <Decisione stato={stato} mioId="io" invia={invia} inAzione={false} />
    </div>
  );
}

/* ── il risultato ──────────────────────────────────────────── */

function Esito({ stato, esito, giorno, suEsci }) {
  const [copiato, setCopiato] = useState(false);
  const f = fasciaPunteggio(esito.punteggio);
  const testo = useMemo(
    () => testoDaCondividere(stato, { giorno, url: location.origin }),
    [stato, giorno]
  );

  const condividi = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: testo }); return; } catch { /* annullato */ }
    }
    try {
      await navigator.clipboard.writeText(testo);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2200);
    } catch { /* niente appunti */ }
  };

  return (
    <div className="schermo">
      <div className="contenuto">
        <motion.div className="carta-scura mt20 ta-c"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="maiusc" style={{ color: "rgba(244,241,230,.45)" }}>Sfida del {giorno}</div>
          <div className="titolo" style={{ fontSize: 52, margin: "10px 0 0", color: "var(--oro-chiaro)" }}>
            {esito.punteggio}
          </div>
          <div className="f14 tenue" style={{ marginBottom: 14 }}>su 100 · {f.nome}</div>

          <div style={{ fontSize: 26, letterSpacing: 4, marginBottom: 18 }}>
            {"▰".repeat(f.blocchi)}<span style={{ opacity: 0.25 }}>{"▱".repeat(5 - f.blocchi)}</span>
          </div>

          {esito.valutazione && (
            <div className="carta" style={{ padding: "14px 16px", marginBottom: 16 }}>
              <div className="flex tra cen">
                <div style={{ textAlign: "left" }}>
                  <div className="maiusc tenue">Valutazione</div>
                  <div className="titolo f28" style={{ lineHeight: 1.1 }}>
                    {esito.valutazione.dopo}
                    <span className="f16" style={{
                      marginLeft: 8,
                      color: esito.valutazione.variazione >= 0 ? "var(--verde)" : "var(--rosso)",
                    }}>
                      {esito.valutazione.variazione >= 0 ? "+" : ""}{esito.valutazione.variazione}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="f20">{fasciaValutazione(esito.valutazione.dopo).emoji}</div>
                  <div className="f13 grassetto">{fasciaValutazione(esito.valutazione.dopo).nome}</div>
                </div>
              </div>
              <p className="f12 tenue" style={{ margin: "10px 0 0", lineHeight: 1.45 }}>
                Il riferimento ha fatto <strong>{esito.riferimento}</strong> sulla tua stessa partita.
              </p>
            </div>
          )}

          <div className="flex g12" style={{ justifyContent: "center", marginBottom: 18 }}>
            <Dato k="Serie" v={`${esito.serie} 🔥`} />
            <Dato k="Record" v={`${esito.migliore}`} />
          </div>

          <Bottone variante="btn-oro" onClick={condividi}>
            {copiato ? "Copiato!" : "Condividi il risultato"}
          </Bottone>
          <p className="f12 tenue" style={{ margin: "14px 0 0", lineHeight: 1.5 }}>
            La sfida cambia a mezzanotte. Stessa partita per tutti, un tentativo a testa.
          </p>
          <Bottone variante="btn-fantasma mt12" onClick={suEsci}>Torna all'inizio</Bottone>
        </motion.div>
      </div>
    </div>
  );
}
