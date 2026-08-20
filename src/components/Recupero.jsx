import React from "react";

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
    return (
      <div className="schermo" style={{ paddingBottom: 24 }}>
        <div className="contenuto ta-c">
          <div className="carta mt20">
            <div style={{ fontSize: 30 }}>⚠️</div>
            <h2 className="titolo f18" style={{ margin: "12px 0 8px" }}>
              Qualcosa si è rotto nella schermata
            </h2>
            <p className="f13 tenue" style={{ margin: "0 0 16px", lineHeight: 1.55 }}>
              La partita è al sicuro sul server: ricaricando la ritrovi esattamente
              dov'era. Se il problema si ripete, esci dalla stanza e rientra col codice.
            </p>
            <button className="btn btn-oro" onClick={() => location.reload()}>
              Ricarica
            </button>
            <button
              className="btn btn-fantasma mt8"
              onClick={() => {
                localStorage.removeItem("quotazero:stanza");
                location.href = location.pathname;
              }}
            >
              Torna all'inizio
            </button>
            <details className="mt16 ta-l">
              <summary className="f12 tenue" style={{ cursor: "pointer" }}>Dettagli tecnici</summary>
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
