import React, { useEffect, useRef, useState } from "react";
import { useLingua } from "../Lingua.jsx";
import { useMercato } from "../Mercato.jsx";
import { useAttesaPedina } from "../hooks/useAttesaPedina.js";

/**
 * LA CARTA DI UN ALTRO GIOCATORE, E COSA CI HA FATTO.
 *
 * ═══ IL PROBLEMA ═══
 *
 * Al tavolo vero la carta si posa in mezzo e la vedono tutti: si sa cosa
 * ha pescato l'altro, quanto costa, quanto rende, e alla fine si vede se
 * l'ha presa. Online no: chi non doveva decidere leggeva solo il registro
 * dire, a cose fatte, «Ada valuta l'affare Bilocale» — un nome, dopo.
 *
 * I dati c'erano già tutti: `pending.carta` viaggia a tutti col resto
 * dello stato, perché lo stato è uno solo.
 *
 * ═══ PERCHÉ SI CHIUDE DA SOLA ═══
 *
 * Una finestra che si apre a ogni turno altrui e aspetta di essere chiusa
 * è una finestra che si impara a chiudere senza leggere — e nel Lampo si
 * gioca un turno ogni pochi secondi. Quindi non si chiude a mano: resta
 * finché l'altro decide, poi **mostra cosa ha scelto** e se ne va da sola.
 * Il momento che interessa non è la carta, è la scelta.
 *
 * L'esito si legge dal registro, che è già l'elenco autorevole di quello
 * che è successo: comprato (r49/r50/r51) o lasciato (r35/r46). Se arriva
 * qualcos'altro la finestra si chiude e basta, senza inventare un esito.
 */

/* Le chiavi con cui il motore annota l'esito di una carta. */
const ESITI = {
  r49: "comprato", r50: "comprato", r51: "comprato",
  r35: "lasciato", r46: "lasciato",
};

/**
 * Com'è andata a finire, letta dall'ultima riga del registro.
 *
 * Funzione pura e esportata perché è il pezzo che può sbagliare in
 * silenzio: una chiave nuova nel motore, o la riga di un altro giocatore
 * scambiata per la propria, e la finestra annuncerebbe una scelta che non
 * è stata fatta. Con un effetto dentro un componente non si prova.
 */
export function esitoDi(ultimaNota, giocatoreId) {
  if (!ultimaNota || !giocatoreId) return null;
  if (ultimaNota.giocatoreId !== giocatoreId) return null;
  return ESITI[ultimaNota.k] || null;
}

/** I momenti in cui c'è davvero una carta in mezzo al tavolo. */
function cartaInTavola(p) {
  if (!p) return null;
  switch (p.tipo) {
    case "carta": return { carta: p.carta, genere: "carta" };
    case "extra": return { carta: p.carta, genere: "extra" };
    case "mercato": return { carta: p.carta, genere: "mercato" };
    case "affareVeloce": return { carta: p.affare, genere: "carta" };
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
  /* Chi deve decidere ha già il foglio davanti. Questa finestra è per chi
     *non* sta decidendo. */
  const mia = p?.tipo === "mercato" ? p.idonei?.includes(mioId) : p?.giocatoreId === mioId;
  const attuale = inTavola && !mia && pedinaFerma
    ? { ...inTavola, chi: stato.giocatori.find((g) => g.id === p.giocatoreId) }
    : null;

  /* Quello che resta a schermo dopo che la decisione è stata presa, il
     tempo di far vedere com'è andata. */
  const [coda, setCoda] = useState(null);
  const ultima = useRef(null);
  if (attuale) ultima.current = attuale;

  const ultimaNota = stato.registro?.[0];
  useEffect(() => {
    if (attuale) { setCoda(null); return; }
    const appena = ultima.current;
    if (!appena) return;
    ultima.current = null;
    const esito = esitoDi(ultimaNota, appena.chi?.id);
    if (!esito) { setCoda(null); return; }
    setCoda({ ...appena, esito });
    const timer = setTimeout(() => setCoda(null), 1600);
    return () => clearTimeout(timer);
    /* Si guarda l'id dell'ultima nota, non l'oggetto: cambia solo quando
       succede qualcosa di nuovo. */
  }, [attuale, ultimaNota?.id]);

  const mostrata = attuale || coda;
  if (!mostrata) return null;

  const carta = traduciCarta(mostrata.carta) || mostrata.carta;
  const nome = mostrata.chi?.nome || t("partita.qualcuno");

  return (
    <div className="velo-modale velo-sul-tavolo">
      <div className="carta sul-tavolo-foglio">
        <div className="flex tra cen">
          <span className="maiusc tenue f11">{t("partita.sulTavolo")}</span>
          {carta.categoria && categorie?.[carta.categoria] && (
            <span className="tag tag-verde">{categorie[carta.categoria]}</span>
          )}
        </div>

        <div className="f12 tenue mt8">
          {t(mostrata.esito ? "sulTavolo.haScelto" : "sulTavolo.staDecidendo", { nome })}
        </div>
        <h3 className="titolo f18" style={{ margin: "4px 0 10px" }}>{carta.nome}</h3>

        <div className="flex" style={{ gap: 16, flexWrap: "wrap" }}>
          {mostrata.genere === "extra" ? (
            <Voce etichetta={t("decisione.costo")} valore={`−${soldi(carta.importo)}`} negativo />
          ) : (
            <>
              {carta.acconto > 0 && <Voce etichetta={t("decisione.acconto")} valore={soldi(carta.acconto)} />}
              {carta.costo > 0 && !carta.acconto && <Voce etichetta={t("decisione.costo")} valore={soldi(carta.costo)} />}
              {carta.flusso > 0 && <Voce etichetta={t("carta.flussoMensile")} valore={`+${soldi(carta.flusso)}`} positivo />}
            </>
          )}
        </div>

        {/* La scelta dell'altro, evidenziata: è il momento per cui la
            finestra esiste. Poi se ne va da sola. */}
        {mostrata.esito && (
          <div className={`sul-tavolo-esito ${mostrata.esito}`}>
            {t(`sulTavolo.${mostrata.esito}`)}
          </div>
        )}
      </div>
    </div>
  );
}

function Voce({ etichetta, valore, positivo, negativo }) {
  return (
    <div>
      <div className="f11 tenue maiusc">{etichetta}</div>
      <div className={`numeri grassetto f15 ${positivo ? "pos" : ""}${negativo ? "neg" : ""}`}>{valore}</div>
    </div>
  );
}
