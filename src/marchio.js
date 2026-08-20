/**
 * MARCHIO — un solo posto in cui vive il nome del prodotto.
 *
 * Il nome è deliberatamente isolato qui: cambiarlo deve costare una riga,
 * non una giornata di ricerca e sostituzione. Se la verifica di un
 * consulente in proprietà industriale dovesse imporre un altro nome,
 * si modifica questo file e basta.
 *
 * Verifiche già fatte su TMview (EUIPO + UIBM + INPI), classi 9, 28 e 41:
 * nessun marchio in conflitto per "Quota Zero". Scartato "Rendita": Sisal
 * Lottery Italia detiene IL GIOCO DELLA RENDITA in classi 9, 16, 41, 42.
 *
 * Resta da fare prima di incassare un solo euro: ricerca di anteriorità
 * formale e deposito del marchio. Vedi §4 del dossier legale.
 */

export const MARCHIO = {
  nome: "Quota Zero",
  nomeBreve: "Quota Zero",
  /* Sotto il livello del mare si parte; prendere il largo è uscirne. */
  motto: "Parti da zero. Prendi il largo.",
  descrizione:
    "Simulatore finanziario multigiocatore su dati reali di città vere. " +
    "Da 2 a 6 giocatori, ognuno dal proprio telefono, con un codice stanza.",
  dominio: "quotazero.it",
};

/**
 * Terminologia del gioco.
 *
 * Deliberatamente nostra: i due tracciati, la condizione di vittoria e il
 * giorno di incasso hanno nomi originali, in italiano corrente, senza
 * riprendere il lessico di nessun altro prodotto. La metafora è nautica e
 * tiene insieme il nome: si parte da quota zero, si gira sulla Ruota
 * finché la rendita non supera le spese, e allora si prende il Largo.
 */
export const LESSICO = {
  anelloInterno: "La Ruota",
  anelloEsterno: "Il Largo",
  uscita: "Prendi il largo",
  giornoIncasso: "Giorno di Paga",
  giornoIncassoEsterno: "Giorno di Rendita",
};
