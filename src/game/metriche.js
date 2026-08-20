/**
 * METRICHE — solo conteggi, nessuna persona.
 *
 * Oggi non sappiamo rispondere a "la gente torna?", che è la sola domanda da
 * cui dipendono tutte le altre decisioni. Serve misurare. Ma misurare è anche
 * il punto in cui i prodotti si mettono nei guai, quindi qui la regola è
 * severa: **non esiste un identificativo lato server**.
 *
 * Come si misura il ritorno senza sapere chi torna:
 * il dispositivo si ricorda da solo quando ha giocato la prima volta, e
 * quando invia un evento dichiara soltanto in quale fascia di giorni si trova
 * ("primo giorno", "entro 7", "entro 30", "oltre"). Il server incrementa un
 * contatore per fascia. Nessun identificativo attraversa la rete, quindi non
 * c'è nulla da anonimizzare, nulla da conservare, nulla da esportare se
 * qualcuno lo chiede, e nessun banner da mostrare.
 *
 * Il documento di un giorno è fatto così:
 *   { _id: "2026-08-20", stanzaCreata: 12, partitaFinita: 4, ritorno_d7: 9 }
 */

/** Eventi ammessi. Qualunque altra cosa viene scartata dal server. */
export const EVENTI = [
  "sessione",          // apertura dell'app
  "stanzaCreata",
  "stanzaRaggiunta",   // qualcuno entra con un codice
  "partitaAvviata",
  "partitaFinita",
  "uscitaDallaRuota",  // il momento che il gioco esiste per insegnare
  "vittoria",
  "abbandono",         // si chiude con la partita ancora in corso
  "sfidaIniziata",
  "sfidaFinita",
];

/** Fasce di ritorno: la granularità che serve, non una in più. */
export const FASCE = ["d0", "d1", "d7", "d30", "oltre"];

/** In quale fascia cade un dispositivo, dati i giorni dalla prima volta. */
export function fascia(giorniDallaPrima) {
  const g = Number(giorniDallaPrima);
  if (!Number.isFinite(g) || g < 0) return null;
  if (g === 0) return "d0";
  if (g <= 1) return "d1";
  if (g <= 7) return "d7";
  if (g <= 30) return "d30";
  return "oltre";
}

/** Fasce di durata, per capire se le partite finiscono o si abbandonano. */
export function fasciaTurni(turni) {
  const t = Number(turni);
  if (!Number.isFinite(t) || t < 0) return null;
  if (t < 20) return "t20";
  if (t < 50) return "t50";
  if (t < 100) return "t100";
  return "t100piu";
}

/** La chiave del giorno, in UTC: i fusi non devono spostare i conti. */
export const giornoDi = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

/**
 * Traduce un evento grezzo del client negli incrementi da applicare.
 * Restituisce `{ giorno, incrementi }` oppure `{ errore }`.
 *
 * Tutto ciò che non è previsto viene scartato qui: il client non può
 * inventare campi e far crescere il documento a piacere.
 */
export function incrementiPer(corpo, ora = Date.now()) {
  const evento = String(corpo?.evento || "");
  if (!EVENTI.includes(evento)) return { errore: "Evento sconosciuto." };

  const incrementi = { [evento]: 1 };

  if (corpo.giorniDallaPrima !== undefined) {
    const f = fascia(corpo.giorniDallaPrima);
    if (f) incrementi[`ritorno_${f}`] = 1;
  }

  if (corpo.turni !== undefined) {
    const f = fasciaTurni(corpo.turni);
    if (f) incrementi[`durata_${f}`] = 1;
  }

  if (evento === "partitaFinita" && typeof corpo.motivo === "string") {
    const m = corpo.motivo.replace(/[^a-z]/gi, "").slice(0, 12);
    if (m) incrementi[`esito_${m}`] = 1;
  }

  if (evento === "stanzaCreata" && corpo.giocatori !== undefined) {
    const n = Math.max(2, Math.min(6, Math.round(Number(corpo.giocatori) || 0)));
    if (n >= 2) incrementi[`tavolo_${n}`] = 1;
  }

  return { giorno: giornoDi(ora), incrementi };
}
