import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bottone } from "./Base.jsx";
import { LUNGHEZZA_MAX, uniscilnVolo } from "../game/chat.js";
import * as api from "../lib/api.js";
import { useLingua } from "../Lingua.jsx";
import { testoErrore } from "../lib/errori.js";

const ora = (t, lingua) =>
  new Date(t).toLocaleTimeString(lingua === "en" ? "en-GB" : "it-IT", { hour: "2-digit", minute: "2-digit" });

/**
 * La chat del tavolo.
 *
 * I messaggi arrivano col resto dello stato, quindi non c'è niente da
 * sincronizzare a parte: quando qualcuno scrive, la versione della stanza
 * sale e il polling che c'è già li porta a bordo. Muoiono con la stanza.
 */
/**
 * `canale` è da dove passano i messaggi. Di norma è il server; nella prima
 * partita è il browser, perché lì la stanza non esiste da nessuna parte —
 * e una chat finta, spenta, insegnerebbe che la chat non serve.
 */
export default function Chat({ stato, mioId, suLetto, canale }) {
  const { t, lingua } = useLingua();
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);
  const fondo = useRef(null);
  /* I messaggi appena mandati, finché il server non li rimanda indietro.
     Vedi `messaggi` qui sotto. */
  const [inVolo, setInVolo] = useState([]);
  const spenta = stato.chatAperta === false;
  const sonoHost = stato.hostId === mioId;

  /* IL MESSAGGIO SI VEDE APPENA SI PREME INVIO.
   *
   * I messaggi arrivano col resto dello stato, e lo stato si rilegge ogni
   * uno-due secondi: fra «invia» e il proprio messaggio a schermo passava
   * tutto quel tempo, che in una chat si legge come «non è partito» — e
   * infatti si riscriveva. Quindi il messaggio compare subito, in grigio,
   * e resta lì finché non torna dal server.
   *
   * Non è una bugia: se l'invio fallisce sparisce e il testo torna nella
   * casella, dove chi scrive può correggerlo e riprovare. La chat non è il
   * motore — i messaggi non cambiano la partita — quindi mostrarne uno un
   * secondo prima che sia sicuro non può far divergere niente.
   */
  const messaggi = useMemo(
    () => uniscilnVolo(stato.chat || [], inVolo, mioId),
    [stato.chat, inVolo, mioId]);

  /* Ripulire la coda è un effetto, non parte del disegno: `messaggi` deve
     restare una funzione pura dello stato. */
  useEffect(() => {
    setInVolo((v) => (v.length && v.some((x) => !messaggi.includes(x))
      ? v.filter((x) => messaggi.includes(x)) : v));
  }, [messaggi]);

  // Si resta incollati in fondo: è una chat, non un archivio.
  useEffect(() => {
    fondo.current?.scrollIntoView({ block: "end" });
    suLetto?.(messaggi.length);
  }, [messaggi.length, suLetto]);

  const manda = async (e) => {
    e?.preventDefault();
    const pulito = testo.trim();
    if (!pulito || invio) return;
    setInvio(true);
    setErrore("");
    /* La casella si svuota adesso, non dopo: chi scrive veloce deve poter
       cominciare la frase dopo senza aspettare la rete. */
    const mio = {
      id: `volo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      di: mioId, nome: t("chat.tu"), colore: undefined,
      testo: pulito, t: Date.now(), inVolo: true,
    };
    setInVolo((v) => [...v, mio]);
    setTesto("");
    try {
      await (canale ? canale.manda(pulito) : api.inviaMessaggio(stato.codice, pulito));
    } catch (err) {
      /* Fallito: si toglie e si restituisce il testo, invece di lasciare a
         schermo un messaggio che nessuno ha ricevuto. */
      setInVolo((v) => v.filter((x) => x.id !== mio.id));
      setTesto((attuale) => attuale || pulito);
      setErrore(testoErrore(lingua, err));
    } finally {
      setInvio(false);
    }
  };

  const cambiaInterruttore = async () => {
    setErrore("");
    const r = await (canale
      ? canale.interruttore(spenta)
      : api.azione(stato.codice, { tipo: "impostaChat", aperta: spenta }))
      .catch((e) => ({ errore: testoErrore(lingua, e) }));
    if (r?.errore) setErrore(r.errore);
  };

  return (
    <div className="carta-scura chat">
      {/* Niente titolo qui dentro: lo dice già la linguetta sopra, sulla
          scrivania come sul telefono. Resta la sola cosa che non ha altro
          posto dove stare, cioè l'interruttore dell'ospite. */}
      <div className="flex cen mb8" style={{ justifyContent: "flex-end", minHeight: 18 }}>
        {sonoHost && (
          <button className="f11 tenue" onClick={cambiaInterruttore}
            style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            {spenta ? t("chat.riaccendi") : t("chat.spegni")}
          </button>
        )}
      </div>

      {spenta ? (
        <p className="f13 tenue" style={{ margin: 0 }}>
          {t("chat.spenta")}
        </p>
      ) : (
        <>
          <div className="chat-righe">
            {messaggi.length === 0 && (
              <p className="f13 tenue" style={{ margin: 0 }}>
                {t("chat.vuota")}
              </p>
            )}
            {messaggi.map((m) => (
              <div key={m.id}
                className={`chat-riga${m.di === mioId ? " mio" : ""}${m.inVolo ? " in-volo" : ""}`}>
                <div className="chat-testa">
                  <span className="chat-nome" style={{ color: m.colore }}>
                    {m.di === mioId ? t("chat.tu") : m.nome}
                  </span>
                  <span className="chat-ora numeri">{ora(m.t, lingua)}</span>
                </div>
                <div className="chat-corpo">{m.testo}</div>
              </div>
            ))}
            <div ref={fondo} />
          </div>

          <form className="chat-invio" onSubmit={manda}>
            <input
              type="text"
              value={testo}
              maxLength={LUNGHEZZA_MAX}
              placeholder={t("chat.segnaposto")}
              aria-label={t("chat.messaggio")}
              onChange={(e) => setTesto(e.target.value)}
            />
            <Bottone variante="btn-oro btn-piccolo" disabled={invio || !testo.trim()} onClick={manda}>
              {t("chat.invia")}
            </Bottone>
          </form>
          {errore && <p className="f12 neg" style={{ margin: "8px 0 0" }}>{errore}</p>}
        </>
      )}
    </div>
  );
}
