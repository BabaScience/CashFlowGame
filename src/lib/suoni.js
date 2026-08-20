/**
 * SUONI — sintetizzati, non campionati.
 *
 * Nessun file audio nel repository. È una scelta, non una scorciatoia:
 *
 *  - niente licenze da tracciare. Un ufficio acquisti scolastico chiede la
 *    provenienza di ogni risorsa, e "generato da centoventi righe di codice"
 *    è una risposta più solida di un campione pescato in rete;
 *  - niente peso: sei suoni costano zero byte di rete invece di qualche
 *    centinaio di kilobyte, e su rete mobile si sente;
 *  - niente attesa: non c'è nulla da precaricare, il primo dado suona subito.
 *
 * I browser vietano l'audio finché la persona non tocca lo schermo, quindi
 * il contesto si apre al primo gesto e non prima.
 */

const CHIAVE = "quotazero:audio";

let ctx = null;
let acceso = leggiPreferenza();

function leggiPreferenza() {
  try {
    const v = localStorage.getItem(CHIAVE);
    return v === null ? true : v === "1";
  } catch { return true; }
}

export function audioAcceso() { return acceso; }

export function impostaAudio(valore) {
  acceso = Boolean(valore);
  try { localStorage.setItem(CHIAVE, acceso ? "1" : "0"); } catch { /* modalità privata */ }
  if (acceso) sbloccaAudio();
  return acceso;
}

/** Apre il contesto audio. Va chiamata dentro un gesto della persona. */
export function sbloccaAudio() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Una nota con inviluppo morbido: senza sfumatura si sente un "clic". */
function nota(t0, { freq, durata = 0.16, volume = 0.14, forma = "sine", scivola = null }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = forma;
  osc.frequency.setValueAtTime(freq, t0);
  if (scivola) osc.frequency.exponentialRampToValueAtTime(Math.max(1, scivola), t0 + durata);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durata);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durata + 0.02);
}

/** Rumore breve e secco: il legno del dado sul tavolo. */
function tonfo(t0, { durata = 0.05, volume = 0.09 } = {}) {
  const campioni = Math.max(1, Math.floor(ctx.sampleRate * durata));
  const buffer = ctx.createBuffer(1, campioni, ctx.sampleRate);
  const dati = buffer.getChannelData(0);
  for (let i = 0; i < campioni; i++) {
    dati[i] = (Math.random() * 2 - 1) * (1 - i / campioni) ** 2;
  }
  const src = ctx.createBufferSource();
  const filtro = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = buffer;
  filtro.type = "bandpass";
  filtro.frequency.value = 1400;
  gain.gain.value = volume;
  src.connect(filtro).connect(gain).connect(ctx.destination);
  src.start(t0);
}

/* Ogni voce descrive un momento del gioco, non un suono astratto. */
const VOCI = {
  /* Tre rimbalzi irregolari: un dado non rimbalza a tempo. */
  dado: (t) => { tonfo(t); tonfo(t + 0.075); tonfo(t + 0.135, { volume: 0.06 }); },

  /* Fruscio corto: una carta che scivola dal mazzo. */
  carta: (t) => tonfo(t, { durata: 0.11, volume: 0.05 }),

  /* Due note che salgono: è entrato del denaro. */
  incasso: (t) => {
    nota(t, { freq: 660, durata: 0.12, volume: 0.1 });
    nota(t + 0.09, { freq: 990, durata: 0.2, volume: 0.11 });
  },

  /* Una nota che scende: è uscito del denaro. */
  esborso: (t) => nota(t, { freq: 380, scivola: 190, durata: 0.24, volume: 0.1, forma: "triangle" }),

  /* Campanella discreta: tocca a te. Non deve far saltare sulla sedia. */
  tuoTurno: (t) => {
    nota(t, { freq: 880, durata: 0.16, volume: 0.09 });
    nota(t + 0.13, { freq: 1320, durata: 0.26, volume: 0.08 });
  },

  /* Arpeggio: hai preso il largo. */
  largo: (t) => [523, 659, 784].forEach((f, i) =>
    nota(t + i * 0.1, { freq: f, durata: 0.3, volume: 0.1 })),

  /* Arpeggio più lungo, con l'ottava in cima: partita vinta. */
  vittoria: (t) => [523, 659, 784, 1047].forEach((f, i) =>
    nota(t + i * 0.12, { freq: f, durata: 0.45, volume: 0.12, forma: "triangle" })),
};

/**
 * Suona una voce. Non fa nulla se l'audio è spento, se il browser non lo
 * permette ancora, o se la scheda è in secondo piano: un suono che arriva
 * da una scheda che non si sta guardando è solo fastidio.
 */
export function suona(voce) {
  if (!acceso) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const c = sbloccaAudio();
  if (!c || c.state !== "running") return;
  const fn = VOCI[voce];
  if (!fn) return;
  try { fn(c.currentTime + 0.01); } catch { /* contesto chiuso: pazienza */ }
}

export const VOCI_DISPONIBILI = Object.keys(VOCI);
