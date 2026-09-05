/** Chiamate al server. Nessuna logica di gioco qui: solo trasporto. */

const identita = () => {
  let id = localStorage.getItem("quotazero:id");
  if (!id) {
    id = "g" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36).slice(-4);
    localStorage.setItem("quotazero:id", id);
  }
  return id;
};

export const mioId = identita;

async function invia(corpo) {
  const r = await fetch("/api/room", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...corpo, giocatoreId: identita() }),
  });
  let dati = null;
  try { dati = await r.json(); } catch { /* corpo vuoto */ }
  if (!r.ok) {
    const e = new Error(dati?.errore || `Errore ${r.status}`);
    e.stato = dati?.stato || null;
    e.codiceHttp = r.status;
    throw e;
  }
  return dati;
}

export const creaStanza = (nome, professioneId, sognoId, mercatoId, livello, avversari = 0, formato = "lunga") =>
  invia({ op: "crea", nome, professioneId, sognoId, mercatoId, livello, avversari, formato });

export const azione = (codice, azione) =>
  invia({ op: "azione", codice, azione });

export const chiudiStanza = (codice) =>
  invia({ op: "chiudi", codice });

/** Rivincita: stessa gente, stanza nuova, già avviata. */
export const rivincita = (codice) => invia({ op: "rivincita", codice });

/** La chat ha un endpoint suo: non è una mossa e non passa dal motore. */
export async function inviaMessaggio(codice, testo) {
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codice, testo, giocatoreId: identita() }),
  });
  let dati = null;
  try { dati = await r.json(); } catch { /* corpo vuoto */ }
  if (!r.ok) throw new Error(dati?.errore || `Errore ${r.status}`);
  return dati;
}

/**
 * Legge lo stato. Passando la versione corrente il server risponde 204
 * quando non è cambiato nulla: è il caso più frequente e costa pochissimo.
 */
export async function leggiStato(codice, versione = 0) {
  const r = await fetch(`/api/state?codice=${encodeURIComponent(codice)}&v=${versione}`);
  if (r.status === 204) return { invariato: true };
  const dati = await r.json().catch(() => null);
  if (!r.ok) {
    const e = new Error(dati?.errore || `Errore ${r.status}`);
    e.codiceHttp = r.status;
    throw e;
  }
  return { invariato: false, stato: dati.stato };
}


/**
 * LA CODA.
 *
 * Tre chiamate e nient'altro: entro, guardo se mi hanno preso, esco. La
 * scelta di far chiedere al client "mi ha preso qualcuno?" invece di
 * tenere una connessione aperta è la stessa che regge tutto il resto del
 * gioco: una connessione aperta è un servizio da pagare, una domanda ogni
 * due secondi per due minuti no.
 */
const allaCoda = async (corpo) => {
  const r = await fetch("/api/coda", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...corpo, giocatoreId: identita() }),
  });
  const dati = await r.json().catch(() => null);
  if (!r.ok) throw new Error(dati?.errore || `Errore ${r.status}`);
  return dati;
};

export const entraInCoda = (opzioni) => allaCoda({ op: "entra", ...opzioni });
export const guardaCoda = () => allaCoda({ op: "guarda" });
export const esciDallaCoda = () => allaCoda({ op: "esci" }).catch(() => null);

/** La classifica, e la propria riga dentro. */
export async function classifica() {
  const r = await fetch(`/api/classifica?giocatoreId=${encodeURIComponent(identita())}`);
  const dati = await r.json().catch(() => null);
  if (!r.ok) throw new Error(dati?.errore || `Errore ${r.status}`);
  return dati;
}
