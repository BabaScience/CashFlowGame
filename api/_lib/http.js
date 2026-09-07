/** Piccoli aiuti condivisi dalle funzioni serverless. */

export function json(res, codice, corpo) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(codice).send(JSON.stringify(corpo));
}

/**
 * Un errore viaggia in due copie: la frase italiana e la chiave con cui
 * tradurla. Il server non conosce la lingua di chi gioca — la stessa
 * stanza la guardano in tre lingue diverse — quindi manda tutte e due e
 * lascia scegliere al browser. La frase resta come ripiego: quando una
 * chiave manca, un messaggio in italiano è meglio di niente.
 */
export function errore(res, codice, messaggio, chiave = null, valori = null) {
  return json(res, codice, { errore: messaggio, chiaveErrore: chiave, valoriErrore: valori });
}

/** Legge il corpo della richiesta, sia già decodificato sia grezzo. */
export async function corpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const pezzi = [];
  for await (const p of req) pezzi.push(p);
  if (!pezzi.length) return {};
  try { return JSON.parse(Buffer.concat(pezzi).toString("utf8")); } catch { return {}; }
}

/** Normalizza il codice stanza: 4 caratteri maiuscoli. */
export function normalizzaCodice(c) {
  return String(c || "").trim().toUpperCase().slice(0, 6);
}

/** Un identificativo giocatore accettabile (generato dal client, salvato in locale). */
export function validoId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{6,40}$/.test(id);
}
