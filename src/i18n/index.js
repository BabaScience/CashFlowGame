/**
 * LINGUA — separata dal mercato, di proposito.
 *
 * Sono due assi diversi e vanno tenuti tali. Il mercato dice quanto costa
 * una casa a Roma; la lingua dice in che lingua leggi l'interfaccia. Un
 * francese deve poter giocare *Roma* in francese, e un italiano deve poter
 * giocare *Parigi* in italiano. Legarli significherebbe rifare tutto al
 * secondo mercato.
 *
 * C'è anche una ragione più immediata: un'interfaccia in inglese sopra il
 * mercato di Roma è la copertura più economica che esista. Il lavoro è già
 * fatto, cambia solo il dizionario.
 *
 * Le chiavi sono descrittive e in italiano, perché l'italiano è la lingua
 * in cui questo gioco è stato pensato e perché una chiave come
 * "ingresso.creaStanza" si legge senza doverla cercare.
 */
import it from "./it.js";
import en from "./en.js";

const DIZIONARI = { it, en };

export const LINGUE = [
  { id: "it", nome: "Italiano", bandiera: "🇮🇹" },
  { id: "en", nome: "English", bandiera: "🇬🇧" },
];

const CHIAVE = "quotazero:lingua";

/** La lingua del browser, se la conosciamo; altrimenti italiano. */
function linguaDelBrowser() {
  if (typeof navigator === "undefined") return "it";
  for (const l of navigator.languages || [navigator.language || ""]) {
    const corta = String(l).slice(0, 2).toLowerCase();
    if (DIZIONARI[corta]) return corta;
  }
  return "it";
}

export function linguaCorrente() {
  try {
    const salvata = localStorage.getItem(CHIAVE);
    if (salvata && DIZIONARI[salvata]) return salvata;
  } catch { /* modalità privata */ }
  return linguaDelBrowser();
}

export function impostaLingua(id) {
  const scelta = DIZIONARI[id] ? id : "it";
  try { localStorage.setItem(CHIAVE, scelta); } catch { /* modalità privata */ }
  if (typeof document !== "undefined") document.documentElement.lang = scelta;
  return scelta;
}

/** Segue il percorso "a.b.c" dentro un dizionario. */
const dentro = (obj, percorso) =>
  percorso.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

/**
 * Traduce.
 *
 * Se una chiave manca nella lingua scelta si ripiega sull'italiano, e se
 * manca anche lì si restituisce la chiave stessa. Non si mostra mai una
 * stringa vuota: un testo nella lingua sbagliata è un fastidio, un pulsante
 * senza scritta è un blocco.
 */
export function traduci(lingua, chiave, valori) {
  const v = dentro(DIZIONARI[lingua], chiave) ?? dentro(DIZIONARI.it, chiave) ?? chiave;
  if (typeof v === "function") return v(valori || {});
  if (typeof v !== "string") return chiave;
  if (!valori) return v;
  return v.replace(/\{(\w+)\}/g, (_, k) => (valori[k] ?? `{${k}}`));
}

/** Le chiavi mancanti in una lingua, per i test. */
export function chiaviMancanti(lingua) {
  const mancanti = [];
  const cammina = (rif, tra, prefisso) => {
    for (const [k, v] of Object.entries(rif)) {
      const p = prefisso ? `${prefisso}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) cammina(v, tra?.[k] || {}, p);
      else if (tra?.[k] === undefined) mancanti.push(p);
    }
  };
  cammina(DIZIONARI.it, DIZIONARI[lingua] || {}, "");
  return mancanti;
}

export const dizionari = DIZIONARI;
