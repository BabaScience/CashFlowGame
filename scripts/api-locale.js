/**
 * Plugin Vite: fa girare le API in locale senza MongoDB.
 *
 * Serve solo in sviluppo (`npm run dev`): tiene le stanze in memoria, con la
 * stessa logica di scadenza del server vero, così si può giocare subito
 * — anche in due schede diverse — senza configurare un database.
 * In produzione valgono le funzioni serverless dentro /api.
 */
import { creaStanza, codiceStanza, applicaAzione } from "../src/game/motore.js";

const TTL = { attesa: 6 * 3600e3, inCorso: 48 * 3600e3, finita: 6 * 3600e3 };
const stanze = new Map();

const scaduta = (v) => Date.now() > v.scadeIl;
const salva = (stato) => stanze.set(stato.codice, { stato, scadeIl: Date.now() + TTL[stato.fase] });

function pulisci() {
  for (const [k, v] of stanze) if (scaduta(v)) stanze.delete(k);
}

const invia = (res, codice, corpo) => {
  res.statusCode = codice;
  if (corpo === undefined) return res.end();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(corpo));
};

const leggiCorpo = (req) =>
  new Promise((ris) => {
    const pezzi = [];
    req.on("data", (c) => pezzi.push(c));
    req.on("end", () => {
      try { ris(JSON.parse(Buffer.concat(pezzi).toString() || "{}")); }
      catch { ris({}); }
    });
  });

export default function apiLocale() {
  return {
    name: "cashflow-api-locale",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();
        pulisci();
        const url = new URL(req.url, "http://localhost");

        try {
          /* ── stato ── */
          if (url.pathname === "/api/state" && req.method === "GET") {
            const codice = (url.searchParams.get("codice") || "").toUpperCase();
            const v = Number(url.searchParams.get("v") || 0);
            const rec = stanze.get(codice);
            if (!rec || scaduta(rec)) return invia(res, 404, { errore: "Stanza non trovata o scaduta." });
            if (v > 0 && rec.stato.versione === v) return invia(res, 204);
            return invia(res, 200, { stato: rec.stato });
          }

          /* ── mutazioni ── */
          if (url.pathname === "/api/room" && req.method === "POST") {
            const b = await leggiCorpo(req);
            const { op, giocatoreId } = b;
            if (!giocatoreId) return invia(res, 400, { errore: "Identificativo mancante." });

            if (op === "crea") {
              let codice;
              do { codice = codiceStanza(); } while (stanze.has(codice));
              const r = applicaAzione(creaStanza(codice, giocatoreId), {
                tipo: "entra", giocatoreId, nome: b.nome,
                professioneId: b.professioneId, sognoId: b.sognoId,
              });
              if (r.errore) return invia(res, 400, { errore: r.errore });
              salva(r.stato);
              return invia(res, 200, { stato: r.stato });
            }

            if (op === "chiudi") {
              const codice = (b.codice || "").toUpperCase();
              const rec = stanze.get(codice);
              if (!rec) return invia(res, 404, { errore: "Stanza non trovata." });
              if (rec.stato.hostId !== giocatoreId) return invia(res, 403, { errore: "Non sei l'host." });
              stanze.delete(codice);
              return invia(res, 200, { chiusa: true });
            }

            if (op === "azione") {
              const codice = (b.codice || "").toUpperCase();
              const rec = stanze.get(codice);
              if (!rec || scaduta(rec)) return invia(res, 404, { errore: "Stanza non trovata o scaduta." });
              const r = applicaAzione(rec.stato, { ...b.azione, giocatoreId });
              if (r.errore) return invia(res, 409, { errore: r.errore, stato: rec.stato });
              salva(r.stato);
              return invia(res, 200, { stato: r.stato });
            }

            return invia(res, 400, { errore: "Operazione sconosciuta." });
          }

          /* ── pulizia ── */
          if (url.pathname === "/api/cleanup") {
            const prima = stanze.size;
            pulisci();
            return invia(res, 200, { rimosse: prima - stanze.size, rimaste: stanze.size });
          }

          return invia(res, 404, { errore: "Endpoint sconosciuto." });
        } catch (e) {
          console.error("api locale:", e);
          return invia(res, 500, { errore: e.message });
        }
      });
    },
  };
}
