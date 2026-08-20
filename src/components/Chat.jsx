import React, { useEffect, useRef, useState } from "react";
import { Bottone } from "./Base.jsx";
import { LUNGHEZZA_MAX } from "../game/chat.js";
import * as api from "../lib/api.js";
import { useLingua } from "../Lingua.jsx";

const ora = (t, lingua) =>
  new Date(t).toLocaleTimeString(lingua === "en" ? "en-GB" : "it-IT", { hour: "2-digit", minute: "2-digit" });

/**
 * La chat del tavolo.
 *
 * I messaggi arrivano col resto dello stato, quindi non c'è niente da
 * sincronizzare a parte: quando qualcuno scrive, la versione della stanza
 * sale e il polling che c'è già li porta a bordo. Muoiono con la stanza.
 */
export default function Chat({ stato, mioId, suLetto }) {
  const { t, lingua } = useLingua();
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);
  const fondo = useRef(null);
  const messaggi = stato.chat || [];
  const spenta = stato.chatAperta === false;
  const sonoHost = stato.hostId === mioId;

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
    try {
      await api.inviaMessaggio(stato.codice, pulito);
      setTesto("");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setInvio(false);
    }
  };

  const cambiaInterruttore = async () => {
    setErrore("");
    const r = await api.azione(stato.codice, { tipo: "impostaChat", aperta: spenta })
      .catch((e) => ({ errore: e.message }));
    if (r?.errore) setErrore(r.errore);
  };

  return (
    <div className="carta-scura chat">
      <div className="flex tra cen mb8">
        <div className="sezione-tit" style={{ color: "rgba(244,241,230,.5)", margin: 0 }}>
          {t("chat.titolo")}
        </div>
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
              <div key={m.id} className={`chat-riga${m.di === mioId ? " mio" : ""}`}>
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
