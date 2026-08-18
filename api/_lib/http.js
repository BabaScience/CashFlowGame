/** Piccoli aiuti condivisi dalle funzioni serverless. */

export function json(res, codice, corpo) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(codice).send(JSON.stringify(corpo));
}

export function errore(res, codice, messaggio) {
  return json(res, codice, { errore: messaggio });
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
