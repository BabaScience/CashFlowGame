/**
 * LA NOSTRA TENDINA.
 *
 * ═══ PERCHÉ NON IL `<select>` DI SISTEMA ═══
 *
 * Il `<select>` nativo disegna l'elenco il sistema operativo, non noi. Su
 * iPhone diventa una ruota a tutto schermo, su Android un dialogo grigio,
 * su Windows un rettangolo di sistema: tre aspetti diversi, nessuno dei
 * quali somiglia al resto del gioco.
 *
 * Ma il motivo vero non è l'aspetto: è che dentro un `<option>` ci va solo
 * testo. Le nostre scelte hanno tre pezzi — emoji, nome, e un numero che
 * conta (lo stipendio, il costo del sogno, il sommario del livello) — e nel
 * nativo finivano schiacciati in una riga sola separata da trattini:
 *
 *     👩‍🏫 Insegnante — 1.850 €/mese
 *
 * Qui il numero sta nella sua colonna, allineato con gli altri, e si
 * possono confrontare due professioni guardandole invece che leggendole.
 *
 * ═══ COSA SI PERDE, E COME SI RIMETTE ═══
 *
 * Il nativo regala accessibilità e tastiera. Rifarlo a mano vuol dire
 * rimetterceli a mano, ed è la parte che quasi tutte le tendine artigianali
 * sbagliano. Qui si segue il modello "select-only combobox" del WAI-ARIA:
 *
 *   · il fuoco non si sposta mai dal pulsante; l'opzione attiva si dichiara
 *     con `aria-activedescendant`, così il lettore di schermo la annuncia
 *     senza che il fuoco viaggi e senza perderlo alla chiusura;
 *   · frecce, Home/Fine, Invio, Spazio, Esc e Tab fanno quello che fanno
 *     nel nativo — Esc annulla, Tab conferma e prosegue;
 *   · si può scrivere per cercare, come nel nativo: "ins" salta a
 *     Insegnante. Con dodici professioni non è un lusso.
 *
 * Su schermo stretto l'elenco non è una tendina ma un foglio che sale dal
 * basso: una tendina ancorata, sotto il pollice, o esce dallo schermo o si
 * apre dove la mano la copre.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

/* In Node `useLayoutEffect` non esiste e React se ne lamenta ad ogni
   disegno dei test. L'elenco chiuso non c'è comunque, quindi il ripiego non
   cambia niente. */
const usaLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Sopra o sotto, e quanto alta.
 *
 * Un elenco ancorato in fondo allo schermo esce dalla finestra: il nativo in
 * quel caso si apre verso l'alto, e chi non lo fa costringe a scorrere per
 * leggere le ultime voci — proprio quelle che di solito si stanno cercando.
 *
 * Funzione a parte, e senza DOM, perché è l'unico pezzo di questo componente
 * che si può verificare senza un browser.
 */
export function posizione({
  spazioSopra, spazioSotto, altezza, margine = 12, guadagnoMinimo = 60,
}) {
  const sotto = Math.max(0, spazioSotto - margine);
  const sopra = Math.max(0, spazioSopra - margine);
  /* Si ribalta solo se sotto non ci sta E sopra ci sta MOLTO meglio.
     Senza `guadagnoMinimo` bastavano quattro pixel di differenza per
     ribaltare: il campo resta fermo e l'elenco salta da una parte
     all'altra senza che si capisca perché. */
  const vaSopra = altezza > sotto && sopra > sotto + guadagnoMinimo;
  const spazio = vaSopra ? sopra : sotto;
  /* Mai più alto del suo contenuto, mai così basso da non mostrare nulla:
     in uno spazio minimo meglio un elenco corto che si scorre. */
  return {
    sopra: vaSopra,
    altezzaMax: Math.max(140, Math.min(altezza, Math.round(spazio))),
  };
}

/**
 * @param {string}   id         serve per legare etichetta e elenco
 * @param {string}   etichetta  l'etichetta visibile (omessa se c'è etichettaAria)
 * @param {string}   etichettaAria  il nome per chi non vede l'etichetta
 * @param {any}      valore     il valore scelto adesso
 * @param {Function} onCambia   riceve il valore nuovo
 * @param {Array}    opzioni    { valore, etichetta, dettaglio?, emoji?, nota? }
 * @param {boolean}  disabilitato
 */
export default function Scelta({
  id, etichetta, etichettaAria, valore, onCambia, opzioni = [],
  disabilitato = false, className = "",
}) {
  const [aperto, setAperto] = useState(false);
  const [attivo, setAttivo] = useState(0);
  const [posto, setPosto] = useState(null);
  const innesco = useRef(null);
  const elenco = useRef(null);
  const involucro = useRef(null);
  const digitato = useRef({ testo: "", quando: 0 });
  const generato = useId();
  const base = id || generato;
  const idElenco = `${base}-elenco`;
  const idEtichetta = `${base}-etichetta`;
  const idOpzione = (i) => `${base}-opz-${i}`;

  const scelto = Math.max(0, opzioni.findIndex((o) => String(o.valore) === String(valore)));
  const corrente = opzioni[scelto];

  /* Aprendo si parte da ciò che è già scelto, non dall'inizio: è quello che
     fa il nativo, ed è l'unico punto di partenza che non sorprende. */
  const apri = (indice = scelto) => {
    if (disabilitato) return;
    setAttivo(indice);
    setPosto(null);
    setAperto(true);
  };

  const chiudi = ({ rimettiIlFuoco = true } = {}) => {
    setAperto(false);
    if (rimettiIlFuoco) innesco.current?.focus();
  };

  const conferma = (indice) => {
    const o = opzioni[indice];
    if (o && String(o.valore) !== String(valore)) onCambia(o.valore);
    chiudi();
  };

  /* Misurato prima che il disegno arrivi sullo schermo: deciderlo dopo
     farebbe vedere l'elenco saltare da sotto a sopra. Su schermo stretto
     non serve — lì è un foglio ancorato in basso, e ci pensa il CSS. */
  usaLayout(() => {
    if (!aperto || !elenco.current || !involucro.current) return;
    if (typeof matchMedia === "function" && matchMedia("(max-width: 640px)").matches) return;
    /* Si misura dall'involucro, non dal pulsante: l'elenco è ancorato al
       primo, e l'involucro comprende anche l'etichetta. Misurando dal
       pulsante l'elenco ribaltato sbordava sopra la finestra esattamente
       di quanto è alta l'etichetta. */
    const r = involucro.current.getBoundingClientRect();
    setPosto(posizione({
      spazioSopra: r.top,
      spazioSotto: window.innerHeight - r.bottom,
      altezza: elenco.current.scrollHeight,
    }));
  }, [aperto]);

  /* Un clic fuori chiude senza cambiare niente. `mousedown` e non `click`:
     altrimenti premendo su un altro campo il primo clic serve solo a
     chiudere e va sprecato. */
  useEffect(() => {
    if (!aperto) return;
    const fuori = (e) => {
      if (!involucro.current?.contains(e.target)) setAperto(false);
    };
    document.addEventListener("mousedown", fuori);
    return () => document.removeEventListener("mousedown", fuori);
  }, [aperto]);

  /* L'opzione attiva deve restare visibile anche quando ci si arriva da
     tastiera, che è il caso in cui nessuno la sta cercando con gli occhi. */
  useEffect(() => {
    if (!aperto) return;
    const riga = elenco.current?.children?.[attivo];
    riga?.scrollIntoView?.({ block: "nearest" });
  }, [aperto, attivo]);

  /** Scrivere per cercare, come nel nativo. */
  const cerca = (lettera) => {
    const adesso = Date.now();
    const d = digitato.current;
    /* Entro un secondo le lettere si sommano ("ins"); dopo, si ricomincia.
       Ripetere la stessa lettera scorre fra le voci che iniziano così. */
    d.testo = adesso - d.quando > 1000 ? lettera : d.testo + lettera;
    d.quando = adesso;
    const ago = d.testo.toLowerCase();
    const uguali = d.testo.length > 1 && [...d.testo].every((c) => c === d.testo[0]);
    const da = aperto ? attivo : scelto;
    const ordine = opzioni.map((_, i) => (da + 1 + i) % opzioni.length);
    const trovato = ordine.find((i) => {
      const testo = String(opzioni[i].etichetta ?? "").toLowerCase();
      return uguali ? testo.startsWith(ago[0]) : testo.startsWith(ago);
    });
    if (trovato === undefined) return;
    if (aperto) setAttivo(trovato);
    else conferma(trovato);
  };

  const tasti = (e) => {
    const ultimo = opzioni.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!aperto) apri(e.altKey ? scelto : Math.min(ultimo, scelto));
        else setAttivo((i) => Math.min(ultimo, i + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        if (!aperto) apri();
        else setAttivo((i) => Math.max(0, i - 1));
        return;
      case "Home":
        if (!aperto) return;
        e.preventDefault(); setAttivo(0); return;
      case "End":
        if (!aperto) return;
        e.preventDefault(); setAttivo(ultimo); return;
      case "PageDown":
        if (!aperto) return;
        e.preventDefault(); setAttivo((i) => Math.min(ultimo, i + 5)); return;
      case "PageUp":
        if (!aperto) return;
        e.preventDefault(); setAttivo((i) => Math.max(0, i - 5)); return;
      case "Enter":
        e.preventDefault();
        aperto ? conferma(attivo) : apri();
        return;
      case " ":
        /* Lo spazio conferma soltanto se non si sta scrivendo per cercare:
           dentro "posto auto" lo spazio è una lettera come le altre. */
        if (digitato.current.testo && Date.now() - digitato.current.quando < 1000) break;
        e.preventDefault();
        aperto ? conferma(attivo) : apri();
        return;
      case "Escape":
        if (!aperto) return;
        e.preventDefault(); chiudi(); return;
      case "Tab":
        /* Tab conferma e prosegue, come nel nativo. Niente preventDefault:
           il fuoco deve andarsene davvero. */
        if (aperto) conferma(attivo);
        return;
      default: break;
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      cerca(e.key);
    }
  };

  return (
    <div className={`scelta ${aperto ? "scelta-aperta" : ""} ${className}`} ref={involucro}>
      {etichetta && (
        <label className="etichetta" id={idEtichetta} htmlFor={base}>{etichetta}</label>
      )}

      <button
        type="button"
        id={base}
        ref={innesco}
        className="campo scelta-innesco"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aperto}
        aria-controls={idElenco}
        aria-activedescendant={aperto ? idOpzione(attivo) : undefined}
        aria-labelledby={etichetta ? `${idEtichetta} ${base}` : undefined}
        aria-label={etichetta ? undefined : etichettaAria}
        disabled={disabilitato}
        onKeyDown={tasti}
        onClick={() => (aperto ? chiudi() : apri())}
      >
        <span className="scelta-valore">
          {corrente?.emoji && <span className="scelta-emoji" aria-hidden="true">{corrente.emoji}</span>}
          <span className="scelta-nome">{corrente?.etichetta ?? ""}</span>
          {corrente?.dettaglio && <span className="scelta-dettaglio numeri">{corrente.dettaglio}</span>}
        </span>
        <span className="scelta-freccia" aria-hidden="true">▾</span>
      </button>

      {aperto && (
        <>
          {/* Su schermo stretto l'elenco è un foglio, e sotto ci va il velo.
              Su schermo largo il velo non si vede: lo nasconde il CSS. */}
          <div className="scelta-velo" aria-hidden="true" onMouseDown={() => setAperto(false)} />
          <ul className={`scelta-elenco ${posto?.sopra ? "scelta-sopra" : ""}`}
            style={posto ? { maxHeight: posto.altezzaMax } : undefined}
            id={idElenco} role="listbox" ref={elenco}
            aria-labelledby={etichetta ? idEtichetta : undefined}
            aria-label={etichetta ? undefined : etichettaAria}>
            {opzioni.map((o, i) => (
              <li
                key={o.valore}
                id={idOpzione(i)}
                role="option"
                aria-selected={i === scelto}
                className={`scelta-voce ${i === attivo ? "attiva" : ""} ${i === scelto ? "scelta-corrente" : ""}`}
                /* `mousedown` invece di `click`: il pulsante deve tenersi il
                   fuoco, e il click arriverebbe dopo che il velo ha chiuso. */
                onMouseDown={(e) => { e.preventDefault(); conferma(i); }}
                onMouseEnter={() => setAttivo(i)}
              >
                <span className="scelta-segno" aria-hidden="true">{i === scelto ? "✓" : ""}</span>
                {o.emoji && <span className="scelta-emoji" aria-hidden="true">{o.emoji}</span>}
                <span className="scelta-testo">
                  <span className="scelta-nome">{o.etichetta}</span>
                  {o.nota && <span className="scelta-nota">{o.nota}</span>}
                </span>
                {o.dettaglio && <span className="scelta-dettaglio numeri">{o.dettaglio}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
