/**
 * LE PARTITE APERTE — perché il gioco non richieda che siate tutti liberi
 * nello stesso momento.
 *
 * È il motivo per cui muoiono i giochi da tavolo online: non perché siano
 * brutti, ma perché mettere sei persone davanti allo schermo alla stessa ora
 * è difficile, e chi ci prova una volta non ci riprova.
 *
 * Il motore era già pronto per il gioco a turni distanziati — lo stato vive
 * sul server, la stanza dura quarantotto ore, chi torna riprende da dov'era.
 * Mancavano due cose, entrambe piccole: sapere che è il tuo turno, e
 * ritrovare la strada per tornarci.
 *
 * Questo modulo è la seconda. L'elenco sta sul dispositivo: non serve un
 * account, e non c'è niente da conservare sul server.
 */

const CHIAVE = "quotazero:partite";
/** Oltre questo non ha senso ricordarle: la stanza sul server è già sparita. */
const DURATA_MS = 48 * 60 * 60 * 1000;

const leggi = () => {
  try {
    const v = JSON.parse(localStorage.getItem(CHIAVE) || "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
};

const scrivi = (v) => {
  try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch { /* modalità privata */ }
};

/** Toglie quelle troppo vecchie per esistere ancora sul server. */
const vive = (elenco, ora = Date.now()) =>
  elenco.filter((p) => p && p.codice && ora - (p.vista || 0) < DURATA_MS);

/**
 * Le partite in cui sei dentro, dalla più recente.
 *
 * L'ordinamento usa un progressivo e non solo l'orario: due stanze aperte
 * nello stesso millisecondo avrebbero la stessa `vista`, e l'ordine
 * diventerebbe arbitrario. Capita davvero — entrare in due partite di
 * seguito richiede meno di un millisecondo a una macchina.
 */
export function partiteAperte() {
  const elenco = vive(leggi());
  return [...elenco].sort(
    (a, b) => (b.vista || 0) - (a.vista || 0) || (b.n || 0) - (a.n || 0)
  );
}

/** Segna che sei in questa stanza, adesso. */
export function ricordaPartita(codice, dati = {}) {
  if (!codice) return;
  const tutte = vive(leggi());
  const elenco = tutte.filter((p) => p.codice !== codice);
  const n = Math.max(0, ...tutte.map((p) => p.n || 0)) + 1;
  elenco.push({ codice, vista: Date.now(), n, ...dati });
  scrivi(elenco.slice(-12));
}

/** Toglila dall'elenco: è finita, o te ne sei andato. */
export function dimenticaPartita(codice) {
  scrivi(vive(leggi()).filter((p) => p.codice !== codice));
}

/* ═══════════ avvisi ═══════════ */

/**
 * Avvisare che è il tuo turno.
 *
 * Si usano le notifiche del browser, che non costano niente e non
 * richiedono infrastruttura. Il limite va detto chiaro: funzionano finché
 * la scheda è aperta, anche in secondo piano, ma NON ad applicazione
 * chiusa. Per quello servirebbero un service worker, VAPID e un servizio di
 * push — cioè un pezzo di infrastruttura da mantenere e da pagare. Sta
 * nell'elenco dei lavori, non qui.
 *
 * Il permesso non si chiede all'avvio. Chiederlo prima che la persona abbia
 * capito perché serve è il modo migliore per farselo negare per sempre: si
 * chiede quando ha senso, cioè quando qualcuno lascia una partita a metà.
 */
export function statoAvvisi() {
  if (typeof Notification === "undefined") return "non disponibile";
  return Notification.permission;   // "granted" | "denied" | "default"
}

export async function chiediAvvisi() {
  if (typeof Notification === "undefined") return "non disponibile";
  if (Notification.permission !== "default") return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return "denied"; }
}

/**
 * Avvisa che tocca a te, ma solo se non stai già guardando.
 * Un avviso per una cosa che hai davanti agli occhi è solo rumore.
 */
export function avvisaTurno({ codice, titolo, testo }) {
  if (typeof document !== "undefined" && !document.hidden) return false;
  if (statoAvvisi() !== "granted") return false;
  try {
    const n = new Notification(titolo, {
      body: testo,
      tag: `quotazero:${codice}`,   // una sola notifica per stanza, non una pila
      renotify: false,
    });
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  } catch { return false; }
}

/**
 * Da quanto non tocchi questa partita, a parole.
 *
 * Senza, l'elenco è una colonna di codici a quattro lettere tutti uguali e
 * non si riconosce quello che si stava giocando cinque minuti fa. Le stanze
 * durano 48 ore, quindi non serve andare oltre i giorni.
 */
export function daQuanto(vista, t) {
  const min = Math.max(0, Math.round((Date.now() - (vista || 0)) / 60000));
  if (min < 2) return t("ingresso.adesso");
  if (min < 60) return t("ingresso.minutiFa", { n: min });
  const ore = Math.round(min / 60);
  if (ore < 24) return t(ore === 1 ? "ingresso.oraFa" : "ingresso.oreFa", { n: ore });
  const giorni = Math.round(ore / 24);
  return t(giorni === 1 ? "ingresso.giornoFa" : "ingresso.giorniFa", { n: giorni });
}
