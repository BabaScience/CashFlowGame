import React from "react";
import { useLingua } from "../Lingua.jsx";
import { useMercato } from "../Mercato.jsx";
import { useAttesaPedina } from "../hooks/useAttesaPedina.js";

/**
 * LA CARTA CHE STA GUARDANDO QUALCUN ALTRO.
 *
 * ═══ IL PROBLEMA ═══
 *
 * Al tavolo vero la carta si posa in mezzo e la vedono tutti: si sa cosa
 * ha pescato l'altro, quanto costa, quanto rende, e si capisce perché ci
 * mette tanto a decidere. Online no. Chi non doveva decidere vedeva solo
 * il registro dire, a cose fatte, «Ana valuta l'affare Bilocale» — cioè un
 * nome, dopo. Per metà del tempo si guardava qualcun altro pensare a
 * qualcosa di invisibile.
 *
 * I dati c'erano già tutti: `pending.carta` viaggia a tutti col resto
 * dello stato, perché lo stato è uno solo. Mancava solo di mostrarla.
 *
 * ═══ PERCHÉ QUI E NON IN UNA FINESTRA ═══
 *
 * Aprire il foglio di decisione anche a chi guarda sarebbe stato il modo
 * più vistoso e il peggiore: nel Lampo si gioca un turno ogni pochi
 * secondi, e una finestra che si apre da sola a ogni giro è una finestra
 * che si impara a chiudere senza leggere.
 *
 * Sta invece in una fascia sotto il tabellone, **di altezza fissa**. Fissa
 * perché `.zona-tavolo` prende lo spazio che avanza: una fascia che
 * compare e sparisce rimpicciolisce e ringrandisce il tabellone a ogni
 * carta, e chi lo sta guardando se lo vede muovere sotto gli occhi. Meglio
 * spendere quei pixel una volta sola, sempre, che riprenderseli a scatti.
 *
 * Quando non c'è niente da mostrare la fascia non resta vuota: dice di chi
 * è il turno e cosa sta facendo, che è l'altra domanda di chi aspetta.
 */

/** I momenti in cui c'è davvero una carta da posare in mezzo al tavolo. */
function cartaInTavola(p) {
  if (!p) return null;
  switch (p.tipo) {
    case "carta": return { carta: p.carta, tipo: "carta" };
    case "extra": return { carta: p.carta, tipo: "extra" };
    case "mercato": return { carta: p.carta, tipo: "mercato" };
    case "affareVeloce": return { carta: p.affare, tipo: "carta" };
    default: return null;
  }
}

export default function SulTavolo({ stato, mioId }) {
  const { t } = useLingua();
  const { traduciCarta, categorie, soldi } = useMercato();
  /* Stesso tempo del foglio di decisione: chi guarda non vede la carta
     prima di chi deve deciderla. */
  const pedinaFerma = useAttesaPedina(stato);

  const p = stato.pending;
  const inTavola = cartaInTavola(p);
  /* Chi deve decidere ha già il foglio davanti: qui vedrebbe due volte la
     stessa carta, e la fascia serve a chi *non* sta decidendo. */
  const mia = p?.tipo === "mercato"
    ? p.idonei?.includes(mioId)
    : p?.giocatoreId === mioId;
  const mostraCarta = inTavola && !mia && pedinaFerma;

  const chi = stato.giocatori.find((g) => g.id === p?.giocatoreId);
  const carta = mostraCarta ? (traduciCarta(inTavola.carta) || inTavola.carta) : null;

  return (
    <div className="sul-tavolo" aria-live="polite">
      <div className="maiusc tenue sul-tavolo-etichetta">{t("partita.sulTavolo")}</div>

      {carta ? (
        <>
          <div className="sul-tavolo-riga">
            <span className="sul-tavolo-chi">
              {t("sulTavolo.staGuardando", { nome: chi?.nome || t("partita.qualcuno") })}
            </span>
            {carta.categoria && categorie?.[carta.categoria] && (
              <span className="tag tag-scuro">{categorie[carta.categoria]}</span>
            )}
          </div>
          <div className="sul-tavolo-nome">{carta.nome}</div>
          <div className="sul-tavolo-numeri numeri">
            {inTavola.tipo === "extra"
              ? <span className="neg">−{soldi(carta.importo)}</span>
              : <>
                  {carta.acconto > 0 && <span>{soldi(carta.acconto)}</span>}
                  {carta.flusso > 0 && (
                    <span className="pos">+{soldi(carta.flusso)}{t("partita.alMeseBreve")}</span>
                  )}
                  {!carta.acconto && !carta.flusso && carta.costo > 0 && <span>{soldi(carta.costo)}</span>}
                </>}
          </div>
        </>
      ) : (
        /* Niente carta. La fascia resta comunque, vuota: è quello che
           tiene ferma l'altezza del tabellone. *Cosa* stia succedendo lo
           dice già il centro della ruota, e ripeterlo qui sarebbe la
           stessa frase due volte sullo stesso schermo. */
        <div className="sul-tavolo-attesa">{t("sulTavolo.nessuna")}</div>
      )}
    </div>
  );
}
