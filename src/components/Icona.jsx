/**
 * LE ICONE.
 *
 * Disegnate qui, non prese da una libreria: sono una quindicina di forme
 * geometriche e non vale una dipendenza in più da aggiornare, né un file di
 * font da scaricare prima che la pagina si veda.
 *
 * Tutte ereditano `currentColor` e si dimensionano sul testo accanto, così
 * un'icona dentro un pulsante prende da sola il colore del pulsante, anche
 * quando cambia al passaggio del mouse o al fuoco.
 *
 * ═══ ICONE, NON EMOJI ═══
 *
 * Le emoji le disegna il sistema operativo: la stessa 🔊 è grigia su un
 * Mac, blu su Android e piatta su Windows, cambia peso e allineamento, e
 * non si può colorare. Per il guscio dell'interfaccia — suoni, uscita,
 * sezioni — servono forme che si comportino come testo.
 *
 * Restano emoji i CONTENUTI: professioni, sogni, categorie delle carte.
 * Quelle vengono dai pacchetti dei mercati, sono centocinquanta per
 * mercato, e lì l'emoji è informazione — un aereo dice "pilota" più in
 * fretta di qualunque icona disegnata da noi.
 */

const FORME = {
  dado: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" /></>,
  fulmine: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  libro: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 20.5z" /></>,
  quesito: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><path d="M17 13v8M13 17h8" /></>,
  casa: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /></>,
  esci: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></>,
  suonoAcceso: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M17 8.5a5 5 0 0 1 0 7" /><path d="M19.5 6a8.5 8.5 0 0 1 0 12" /></>,
  suonoSpento: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M17 9.5l5 5M22 9.5l-5 5" /></>,
  scheda: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  giocatori: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M17.5 14.4A6 6 0 0 1 21 20" /></>,
  chat: <><path d="M21 12a8 8 0 0 1-8 8H7l-4 3 1.2-4.4A8 8 0 1 1 21 12z" /></>,
  registro: <><path d="M4 6h16M4 12h16M4 18h10" /></>,
  regole: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.8-.9 1.4v.6" /><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" /></>,
  copia: <><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></>,
  frecciaDestra: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
  frecciaSinistra: <><path d="M20 12H5" /><path d="M11 18l-6-6 6-6" /></>,
  giu: <path d="M6 9l6 6 6-6" />,
  spunta: <path d="M4 12.5l5.5 5.5L20 7" />,
  chiudi: <><path d="M6 6l12 12M18 6L6 18" /></>,
};

export const NOMI_ICONE = Object.keys(FORME);

/**
 * @param {string} nome   una delle chiavi di FORME
 * @param {number} dim    lato in pixel (default: si allinea al testo)
 */
export default function Icona({ nome, dim = 18, spessore = 1.8, className = "" }) {
  const forma = FORME[nome];
  if (!forma) return null;
  return (
    <svg
      className={`icona-svg ${className}`}
      width={dim} height={dim} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={spessore} strokeLinecap="round" strokeLinejoin="round"
      /* Decorativa: il nome accessibile lo dà il testo del pulsante, o il
         suo aria-label. Un'icona che si annuncia da sola dentro un pulsante
         già etichettato lo fa leggere due volte. */
      aria-hidden="true" focusable="false"
    >
      {forma}
    </svg>
  );
}
