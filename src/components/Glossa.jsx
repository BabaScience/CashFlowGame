import React, { useState } from "react";
import { Foglio, Bottone } from "./Base.jsx";
import { useLingua } from "../Lingua.jsx";

/**
 * UNA PAROLA CHE SI PUÒ CHIEDERE.
 *
 * Il gioco gira su cinque o sei parole — reddito passivo, Giorno di Paga,
 * acconto, flusso, conto economico — e nessuna di queste è ovvia per chi
 * non ha mai letto un bilancio. Erano scritte ovunque come se lo fossero.
 *
 * La spiegazione esisteva già, nelle lezioni: dietro un menù che nessuno
 * apre mentre sta decidendo se comprare una casa. Qui la stessa frase sta
 * attaccata alla parola, nel punto in cui la parola compare.
 *
 * A differenza della guida della prima partita, questa non scade: serve
 * alla prima partita e serve alla cinquantesima, quando ci si dimentica
 * cosa distingue il reddito passivo dal reddito totale.
 */
export default function Glossa({ termine, children }) {
  const { t } = useLingua();
  const [aperta, setAperta] = useState(false);

  return (
    <>
      <button type="button" className="glossa" onClick={() => setAperta(true)}
        aria-label={t("glossario.cosaVuolDire", { parola: t(`glossario.${termine}.titolo`) })}>
        {children ?? t(`glossario.${termine}.titolo`)}
        <span className="glossa-segno" aria-hidden="true">?</span>
      </button>

      <Foglio aperto={aperta} chiudibile suChiudi={() => setAperta(false)}>
        <div className="etichetta" style={{ margin: 0 }}>{t("glossario.cosaSignifica")}</div>
        <h3 className="titolo f20" style={{ margin: "4px 0 10px" }}>
          {t(`glossario.${termine}.titolo`)}
        </h3>
        <p className="f14" style={{ margin: 0, lineHeight: 1.6 }}>
          {t(`glossario.${termine}.testo`)}
        </p>
        <Bottone variante="btn-fantasma mt16" onClick={() => setAperta(false)}>
          {t("comune.chiudi")}
        </Bottone>
      </Foglio>
    </>
  );
}
