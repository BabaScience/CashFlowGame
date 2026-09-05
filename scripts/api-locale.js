/**
 * Plugin Vite: fa girare le API in locale senza MongoDB.
 *
 * Serve solo in sviluppo (`npm run dev`): tiene le stanze in memoria, con la
 * stessa logica di scadenza del server vero, così si può giocare subito
 * — anche in due schede diverse — senza configurare un database.
 * In produzione valgono le funzioni serverless dentro /api.
 */
import { creaStanza, codiceStanza, applicaAzione } from "../src/game/motore.js";
import { preparaMessaggio, accoda } from "../src/game/chat.js";
import { incrementiPer } from "../src/game/metriche.js";
import { pacchettoDi } from "../src/game/mercati/indice.js";
import { statoRivincita } from "../api/_lib/rivincita.js";
import { chiaveCoda, formatoValido, valutazioniDopo, partitaValida, ordineFinale, VALUTAZIONE_ARENA_INIZIALE } from "../src/game/arena.js";
import { redditoPassivo, speseTotali } from "../src/game/finanze.js";

/** Nomi degli avversari automatici: italiani, corti, riconoscibili. */
const NOMI_BOT = ["Bea", "Nico", "Rosa", "Furio", "Lella"];

const TTL = { attesa: 6 * 3600e3, inCorso: 48 * 3600e3, finita: 6 * 3600e3 };
const stanze = new Map();
const metriche = new Map();   // giorno -> contatori, come in produzione
/* La coda e la classifica, in memoria. Stessa forma delle collezioni vere,
   così il comportamento in sviluppo è quello che si vedrà in produzione. */
const coda = new Map();       // giocatoreId -> riga
const albo = new Map();       // giocatoreId -> { nome, valutazione, partite, vittorie }
const TTL_CODA = 3 * 60e3;

const progressoDi = (g) => {
  if (g.tracciato === "veloce") {
    return 1 + Math.max(0, (g.redditoRendita || 0) - (g.redditoInizialeVeloce || 0)) / 1000;
  }
  const spese = speseTotali(g);
  return spese > 0 ? Math.min(0.999, redditoPassivo(g) / spese) : 0;
};

/** Come api/_lib/classifica.js, con Map al posto di MongoDB. */
function registraEsito(stato) {
  if (!partitaValida(stato) || stato.valutata) return null;
  stato.valutata = true;
  const ordine = ordineFinale(stato, progressoDi);
  const esito = ordine.map((r) => {
    const scheda = albo.get(r.id);
    return { id: r.id, posizione: r.posizione,
      valutazione: scheda?.valutazione ?? VALUTAZIONE_ARENA_INIZIALE, partite: scheda?.partite ?? 0 };
  });
  const nuove = valutazioniDopo(esito);
  nuove.forEach((v, i) => {
    const r = ordine[i], vecchia = albo.get(v.id) || { partite: 0, vittorie: 0 };
    albo.set(v.id, {
      giocatoreId: v.id, nome: r.nome, valutazione: v.dopo,
      partite: vecchia.partite + 1, vittorie: vecchia.vittorie + (r.vincitore ? 1 : 0),
    });
  });
  const righe = nuove.map((v, i) => ({ ...v, nome: ordine[i].nome, posizione: ordine[i].posizione }));
  stato.valutazioni = righe;   // come in produzione: la vedono tutti col polling
  return righe;
}

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
    name: "quotazero-api-locale",
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
              const r = applicaAzione(creaStanza(codice, giocatoreId, { mercatoId: b.mercatoId, livello: Number(b.livello) || undefined, formato: b.formato }), {
                tipo: "entra", giocatoreId, nome: b.nome,
                professioneId: b.professioneId, sognoId: b.sognoId,
              });
              if (r.errore) return invia(res, 400, { errore: r.errore });
              /* Avversari automatici, come nell'API vera: giocatori normali
                 con un flag. Le mosse gliele manda il client. */
              let stato = r.stato;
              const quanti = Math.max(0, Math.min(5, Number(b.avversari) || 0));
              const pac = pacchettoDi(stato);
              for (let n = 0; n < quanti; n++) {
                const bb = applicaAzione(stato, {
                  tipo: "entra", giocatoreId: `bot${n + 1}`, bot: true,
                  nome: NOMI_BOT[n],
                  professioneId: pac.professioni[(n + 1) % pac.professioni.length].id,
                  sognoId: pac.sogni[(n + 1) % pac.sogni.length].id,
                });
                if (bb.errore) return invia(res, 400, { errore: bb.errore });
                stato = bb.stato;
              }
              salva(stato);
              return invia(res, 200, { stato });
            }

            if (op === "chiudi") {
              const codice = (b.codice || "").toUpperCase();
              const rec = stanze.get(codice);
              if (!rec) return invia(res, 404, { errore: "Stanza non trovata." });
              if (rec.stato.hostId !== giocatoreId) return invia(res, 403, { errore: "Non sei l'host." });
              stanze.delete(codice);
              return invia(res, 200, { chiusa: true });
            }

            if (op === "rivincita") {
              const codice = (b.codice || "").toUpperCase();
              const rec = stanze.get(codice);
              if (!rec) return invia(res, 404, { errore: "Stanza non trovata o scaduta." });
              if (rec.stato.rivincita) return invia(res, 200, { codice: rec.stato.rivincita });
              let nuovoCodice;
              do { nuovoCodice = codiceStanza(); } while (stanze.has(nuovoCodice));
              const r = statoRivincita(rec.stato, nuovoCodice, giocatoreId);
              if (r.errore) return invia(res, 400, { errore: r.errore });
              salva(r.stato);
              rec.stato.rivincita = nuovoCodice;
              salva(rec.stato);
              return invia(res, 200, { codice: nuovoCodice });
            }

            if (op === "azione") {
              const codice = (b.codice || "").toUpperCase();
              const rec = stanze.get(codice);
              if (!rec || scaduta(rec)) return invia(res, 404, { errore: "Stanza non trovata o scaduta." });
              /* Come nell'API vera: vale solo la propria identità, tranne
                 per gli avversari automatici, che non hanno un client. */
              const bersaglio = b.azione?.giocatoreId;
              const eBotDiQui = bersaglio
                && rec.stato.giocatori.some((g) => g.id === bersaglio && g.bot);
              const r = applicaAzione(rec.stato, {
                ...b.azione, giocatoreId: eBotDiQui ? bersaglio : giocatoreId,
              });
              if (r.errore) return invia(res, 409, { errore: r.errore, stato: rec.stato });
              const finita = r.stato.fase === "finita" && rec.stato.fase !== "finita";
              const valutazioni = finita ? registraEsito(r.stato) : null;
              salva(r.stato);
              return invia(res, 200, valutazioni ? { stato: r.stato, valutazioni } : { stato: r.stato });
            }

            return invia(res, 400, { errore: "Operazione sconosciuta." });
          }

          /* ── coda: trovare un avversario che non conosci ── */
          if (url.pathname === "/api/coda" && req.method === "POST") {
            for (const [k, v] of coda) if (Date.now() > v.scadeIl) coda.delete(k);
            const b = await leggiCorpo(req);
            const { op, giocatoreId } = b;
            if (!giocatoreId) return invia(res, 400, { errore: "Identificativo mancante." });

            if (op === "esci") { coda.delete(giocatoreId); return invia(res, 200, { uscito: true }); }

            if (op === "guarda") {
              const riga = coda.get(giocatoreId);
              if (!riga) return invia(res, 200, { stato: "scaduta" });
              if (riga.codice) { coda.delete(giocatoreId); return invia(res, 200, { stato: "trovato", codice: riga.codice }); }
              const quanti = [...coda.values()].filter((r) => r.chiave === riga.chiave && !r.codice).length;
              return invia(res, 200, { stato: "attesa", inCoda: quanti });
            }

            if (op !== "entra") return invia(res, 400, { errore: "Operazione sconosciuta." });

            const mercatoId = b.mercatoId || "roma";
            const formato = formatoValido(b.formato);
            const livello = Number(b.livello) || 1;
            const chiave = chiaveCoda({ mercatoId, formato, livello });
            const nome = String(b.nome || "").trim().slice(0, 20) || "Ospite";
            coda.delete(giocatoreId);

            const avversario = [...coda.values()]
              .filter((r) => r.chiave === chiave && !r.codice && r.giocatoreId !== giocatoreId)
              .sort((x, y) => x.creataIl - y.creataIl)[0];

            if (!avversario) {
              coda.set(giocatoreId, {
                giocatoreId, chiave, nome, mercatoId, formato, livello,
                professioneId: b.professioneId, sognoId: b.sognoId,
                creataIl: Date.now(), scadeIl: Date.now() + TTL_CODA,
              });
              return invia(res, 200, { stato: "attesa", inCoda: 1 });
            }
            coda.delete(avversario.giocatoreId);

            let codice;
            do { codice = codiceStanza(); } while (stanze.has(codice));
            let stato = creaStanza(codice, avversario.giocatoreId, { mercatoId, livello, formato });
            for (const g of [avversario, { giocatoreId, nome, professioneId: b.professioneId, sognoId: b.sognoId }]) {
              const r = applicaAzione(stato, { tipo: "entra", giocatoreId: g.giocatoreId, nome: g.nome,
                professioneId: g.professioneId, sognoId: g.sognoId });
              if (r.errore) return invia(res, 400, { errore: r.errore });
              stato = r.stato;
            }
            const av = applicaAzione(stato, { tipo: "avvia", giocatoreId: avversario.giocatoreId });
            if (av.errore) return invia(res, 400, { errore: av.errore });
            salva(av.stato);
            coda.set(avversario.giocatoreId, {
              giocatoreId: avversario.giocatoreId, chiave, codice,
              creataIl: Date.now(), scadeIl: Date.now() + TTL_CODA,
            });
            return invia(res, 200, { stato: "trovato", codice });
          }

          /* ── classifica ── */
          if (url.pathname === "/api/classifica" && req.method === "GET") {
            const tutti = [...albo.values()].sort((a, c) => c.valutazione - a.valutazione || c.partite - a.partite);
            const id = url.searchParams.get("giocatoreId");
            const mio = id ? albo.get(id) : null;
            const io = mio ? { ...mio, posizione: tutti.findIndex((r) => r.giocatoreId === id) + 1 } : null;
            return invia(res, 200, { primi: tutti.slice(0, 50), io });
          }

          /* ── chat: append, fuori dal motore come in produzione ── */
          if (url.pathname === "/api/chat" && req.method === "POST") {
            const b = await leggiCorpo(req);
            if (!b.giocatoreId) return invia(res, 400, { errore: "Identificativo mancante." });
            const codice = (b.codice || "").toUpperCase();
            const rec = stanze.get(codice);
            if (!rec || scaduta(rec)) return invia(res, 404, { errore: "Stanza non trovata o scaduta." });
            const esito = preparaMessaggio(rec.stato, b.giocatoreId, b.testo);
            if (esito.errore) return invia(res, 400, { errore: esito.errore });
            salva(accoda(rec.stato, esito.messaggio));
            return invia(res, 200, { messaggio: esito.messaggio });
          }

          /* ── metriche: solo contatori, nessun identificativo ── */
          if (url.pathname === "/api/eventi") {
            if (req.method === "GET") {
              return invia(res, 200, { giorni: [...metriche.entries()].map(([_id, v]) => ({ _id, ...v })) });
            }
            const b = await leggiCorpo(req);
            const esito = incrementiPer(b);
            if (esito.errore) return invia(res, 204);
            const giorno = metriche.get(esito.giorno) || {};
            for (const [k, v] of Object.entries(esito.incrementi)) giorno[k] = (giorno[k] || 0) + v;
            metriche.set(esito.giorno, giorno);
            return invia(res, 204);
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
