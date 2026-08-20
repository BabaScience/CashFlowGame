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

export const creaStanza = (nome, professioneId, sognoId) =>
  invia({ op: "crea", nome, professioneId, sognoId });

export const azione = (codice, azione) =>
  invia({ op: "azione", codice, azione });

export const chiudiStanza = (codice) =>
  invia({ op: "chiudi", codice });

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
