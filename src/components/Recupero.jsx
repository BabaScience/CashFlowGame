import React from "react";
import { traduci, linguaCorrente } from "../i18n/index.js";

/**
 * Rete di sicurezza per l'interfaccia.
 *
 * Lo stato della partita vive sul server: se il disegno di un componente va in
 * errore, la partita non è persa. Meglio mostrare un messaggio con un pulsante
 * per ricaricare che lasciare lo schermo nero — soprattutto se gli altri
 * giocatori stanno aspettando il tuo turno.
 */
export default class Recupero extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errore: null };
  }

  static getDerivedStateFromError(errore) {
    return { errore };
  }

  componentDidCatch(errore, info) {
    console.error("Errore nell'interfaccia:", errore, info?.componentStack);
  }

  render() {
    if (!this.state.errore) return this.props.children;
    /* Questa è una classe: niente hook, e quindi niente useLingua. La
       lingua si legge alla fonte, che è dove la mette il selettore. Una
       schermata d'errore in italiano dentro un gioco in francese è un
       secondo difetto sopra il primo. */
    const t = (k) => traduci(linguaCorrente(), k);
    return (
      <div className="schermo" style={{ paddingBottom: 24 }}>
        <div className="contenuto ta-c">
          <div className="carta mt20">
            <div style={{ fontSize: 30 }}>⚠️</div>
            <h2 className="titolo f18" style={{ margin: "12px 0 8px" }}>
              {t("recupero.titolo")}
            </h2>
            <p className="f13 tenue" style={{ margin: "0 0 16px", lineHeight: 1.55 }}>
              {t("recupero.spiegazione")}
            </p>
            <button className="btn btn-oro" onClick={() => location.reload()}>
              {t("recupero.ricarica")}
            </button>
            <button
              className="btn btn-fantasma mt8"
              onClick={() => {
                localStorage.removeItem("quotazero:stanza");
                location.href = location.pathname;
              }}
            >
              {t("comune.tornaInizio")}
            </button>
            <details className="mt16 ta-l">
              <summary className="f12 tenue" style={{ cursor: "pointer" }}>{t("recupero.dettagli")}</summary>
              <pre className="f11" style={{ whiteSpace: "pre-wrap", marginTop: 8, color: "var(--tenue)" }}>
                {String(this.state.errore?.message || this.state.errore)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }
}
