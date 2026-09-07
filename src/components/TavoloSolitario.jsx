import React from "react";
import { Bottone, Barra } from "./Base.jsx";
import Tabellone from "./Tabellone.jsx";
import Dadi from "./Dadi.jsx";
import Scheda from "./Scheda.jsx";
import Decisione from "./Decisione.jsx";
import Registro from "./Registro.jsx";
import { riepilogo } from "../game/finanze.js";
import { useLingua } from "../Lingua.jsx";

/**
 * IL TAVOLO DI CHI GIOCA DA SOLO.
 *
 * Lo usano la sfida del giorno e la prima partita. Erano due copie della
 * stessa impaginazione: stesso tabellone, stessi dadi, stessa scheda,
 * stesso pulsante del tiro — e due copie della stessa cosa in questo
 * progetto hanno già preso strade diverse tre volte (le due API, i due
 * tempi della pedina, i due conti delle spese).
 *
 * Quello che cambia fra i due usi entra da fuori: la barra in alto, la
 * riga di progresso, e — nella prima partita — la voce che spiega.
 */
export default function TavoloSolitario({
  stato, invia, errore,
  intestazione, sopraIlTabellone, progresso, finita = false,
}) {
  const { t } = useLingua();
  const io = stato.giocatori[0];
  const r = riepilogo(io);

  return (
    <div className="schermo schermo-partita">
      {intestazione}

      <div className="corpo">
        <div className="colonna-tavolo">
          {sopraIlTabellone}

          <div className="zona-tavolo">
            <Tabellone stato={stato} mioId="io" />
            <Dadi tiro={stato.ultimoTiro} mioId="io" />
          </div>

          {progresso && <div className="zona-progresso">{progresso}</div>}

          <div className="zona-azioni">
            {!finita && !stato.pending && !stato.dado && (
              <Bottone variante="btn-oro" onClick={() => invia({ tipo: "tira", nDadi: 2 })}>
                {t("partita.tiraIDadi")}
              </Bottone>
            )}
            {/* Uscire dalla Ruota è la vittoria: quando si può, è l'unica
                cosa che conta e sta sopra tutto il resto. */}
            {io.tracciato === "topi" && r.redditoPassivo > r.speseTotali && (
              <Bottone variante="btn-verde mt12" onClick={() => invia({ tipo: "esciDallaCorsa" })}>
                {t("partita.lasciaIlLavoro")}
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
