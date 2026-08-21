/**
 * IL MARCHIO, DISEGNATO.
 *
 * Un componente solo per due motivi. Il primo è che il nome deve venire da
 * `marchio.js`: era scritto a mano nella pagina d'ingresso, e un nome
 * scritto a mano è un nome che alla prossima rinomina resta indietro —
 * è esattamente così che il banner delle anteprime ha continuato a mostrare
 * il nome vecchio per settimane.
 *
 * Il secondo è che un logo, quando si può premere, riporta a casa. È una
 * convenzione così diffusa che chi non la trova la cerca lo stesso: da
 * dentro le lezioni o la sfida, il rombo in alto è la strada più corta per
 * uscirne.
 */
import { MARCHIO } from "../marchio.js";
import { useLingua } from "../Lingua.jsx";

export default function Logo({ suCasa, grande = false }) {
  const { t } = useLingua();

  const dentro = (
    <>
      <span className="logo-rombo" aria-hidden="true">◆</span>
      <span className="logo-nome">{MARCHIO.nome}</span>
    </>
  );

  if (!suCasa) {
    return <div className={`logo ${grande ? "logo-grande" : ""}`}>{dentro}</div>;
  }
  return (
    <button type="button" onClick={suCasa}
      className={`logo logo-cliccabile ${grande ? "logo-grande" : ""}`}
      aria-label={t("app.tornaAllaHome")}>
      {dentro}
    </button>
  );
}
