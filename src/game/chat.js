/**
 * CHAT DI STANZA — regole condivise fra server vero e server di sviluppo.
 *
 * I messaggi vivono dentro il documento della stanza, non in una collezione
 * a parte. Tre conseguenze, tutte volute:
 *
 *  - spariscono da soli con la stanza, grazie all'indice TTL che c'è già.
 *    Nessuna cancellazione da programmare, nessun dato che sopravvive alla
 *    partita: è anche la risposta più semplice da dare a una scuola che
 *    chiede per quanto tempo conserviamo le cose;
 *  - non serve infrastruttura nuova, quindi non serve budget nuovo;
 *  - il client se ne accorge da solo, perché scrivere un messaggio alza la
 *    `versione` che il polling già sorveglia.
 *
 * La scrittura NON passa dal motore: un messaggio non è una mossa, e farlo
 * passare dal controllo di versione ottimistico lo metterebbe in coda a
 * litigare con i tiri di dado. L'endpoint scrive in append e basta.
 */

/** Oltre questo tetto i messaggi più vecchi cadono. */
export const MAX_MESSAGGI = 80;
/** Un messaggio lungo quanto un SMS: è una chat da tavolo, non un forum. */
export const LUNGHEZZA_MAX = 240;
/** Pausa minima fra due messaggi dello stesso giocatore. */
export const PAUSA_MS = 900;

/** Toglie i caratteri di controllo e comprime gli spazi. */
export function ripulisci(testo) {
  return String(testo ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, LUNGHEZZA_MAX);
}

/**
 * Verifica un messaggio e lo prepara.
 * Restituisce `{ messaggio }` oppure `{ errore }`: mai un'eccezione, così
 * entrambi i server possono limitarsi a inoltrare l'esito.
 */
export function preparaMessaggio(stato, giocatoreId, testoGrezzo, ora = Date.now()) {
  if (!stato) return { errore: "Stanza non trovata o scaduta." };
  if (stato.chatAperta === false) return { errore: "La chat è spenta in questa stanza." };

  const chi = (stato.giocatori || []).find((g) => g.id === giocatoreId);
  if (!chi) return { errore: "Non fai parte di questa partita." };

  const testo = ripulisci(testoGrezzo);
  if (!testo) return { errore: "Il messaggio è vuoto." };

  const suoUltimo = [...(stato.chat || [])].reverse().find((m) => m.di === giocatoreId);
  if (suoUltimo && ora - suoUltimo.t < PAUSA_MS) {
    return { errore: "Vai un po' più piano." };
  }

  return {
    messaggio: {
      id: `${ora.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      di: giocatoreId,
      nome: chi.nome,
      colore: chi.colore,
      testo,
      t: ora,
    },
  };
}

/** Aggiunge il messaggio in coda rispettando il tetto. In memoria. */
export function accoda(stato, messaggio) {
  stato.chat = [...(stato.chat || []), messaggio].slice(-MAX_MESSAGGI);
  stato.versione += 1;
  return stato;
}
