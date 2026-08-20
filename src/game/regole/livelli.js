/**
 * I LIVELLI DI REALISMO.
 *
 * Stessi prezzi, stessi canoni, stessi tassi. Cambia quanto del vero fisco
 * si vede.
 *
 * L'ordine è didattico, non tecnico. Al **Livello 1** un affitto rende meno
 * del canone e basta: c'è una trattenuta unica, dichiarata, e chi gioca
 * impara la prima cosa — che un affitto non è tutto tuo. Al **Livello 2**
 * quella trattenuta si apre in quello che è davvero: cedolare secca, IMU,
 * condominio, manutenzione, sfitto. Ogni voce con il suo nome, ognuna che si
 * può guardare e discutere.
 *
 * Questa è la cosa che un gioco può fare e un manuale no: mostrare la stessa
 * identica operazione due volte, prima semplificata e poi vera, e lasciare
 * che sia il numero in fondo a spiegare la differenza.
 *
 * Il Livello 2 introduce anche una scelta che a Roma esiste per davvero e
 * quasi nessuno calcola: canone libero con cedolare al 21%, oppure canone
 * concordato — più basso — con cedolare al 10%. Quale delle due convenga
 * dipende dai numeri, e cambia da contratto a contratto.
 */

export const LIVELLI = [
  {
    id: 1,
    nome: "Base",
    sommario: "Prezzi e tassi veri, imposte in una voce sola.",
    descrizione:
      "Un affitto non è tutto tuo: una trattenuta unica copre imposte, " +
      "condominio, manutenzione e mesi vuoti. Serve a imparare il meccanismo " +
      "prima dei dettagli.",
  },
  {
    id: 2,
    nome: "Reale",
    sommario: "Cedolare secca, IMU, condominio e sfitto, voce per voce.",
    descrizione:
      "La stessa operazione, con ogni imposta al suo posto. Compare la scelta " +
      "fra canone libero al 21% e canone concordato al 10%, che è una " +
      "decisione vera e non ha una risposta valida sempre.",
  },
];

export const LIVELLO_PREDEFINITO = 1;

export const livello = (id) => LIVELLI.find((l) => l.id === id) || LIVELLI[0];

/**
 * Le voci che compongono il flusso di un immobile, al livello richiesto.
 *
 * Restituisce sempre lo stesso elenco di righe, così l'interfaccia può
 * mostrarle senza sapere a che livello si sta giocando. Al Livello 1
 * l'elenco ha una riga sola.
 */
export function vociFlusso(carta, idLivello, fisco) {
  const canone = carta.canone ?? 0;
  const rata = carta.rata ?? 0;

  if (!canone) {
    /* Terreni e attività: nessun canone da tassare, il flusso è quello. */
    return { voci: [], flusso: carta.flusso ?? 0, canone: 0, rata: 0 };
  }

  if (idLivello < 2) {
    const trattenuta = Math.round(canone * (fisco?.quotaCostiL1 ?? 0.28));
    return {
      canone, rata,
      voci: [
        { chiave: "canone", nome: "Canone", importo: canone },
        { chiave: "trattenuta", nome: "Imposte e spese (stimate)", importo: -trattenuta },
        { chiave: "rata", nome: "Rata del mutuo", importo: -Math.round(rata) },
      ],
      flusso: Math.round(canone - trattenuta - rata),
    };
  }

  /* ── Livello 2: ogni voce con il suo nome ── */
  const concordato = carta.concordato === true;
  const aliquota = concordato ? (fisco?.cedolareConcordata ?? 0.10) : (fisco?.cedolare ?? 0.21);
  /* Il canone concordato è più basso del libero: è metà dello scambio. */
  const canoneEffettivo = concordato
    ? Math.round(canone * (fisco?.scontoConcordato ?? 0.85))
    : canone;

  const cedolare = Math.round(canoneEffettivo * aliquota);
  const imu = Math.round((carta.costo ?? 0) * (fisco?.imuAnnuaSuValore ?? 0.0075) / 12);
  const condominio = Math.round(canoneEffettivo * (fisco?.quotaCondominio ?? 0.08));
  const manutenzione = Math.round(canoneEffettivo * (fisco?.quotaManutenzione ?? 0.05));
  const sfitto = Math.round(canoneEffettivo * (fisco?.quotaSfitto ?? 0.05));

  const voci = [
    { chiave: "canone", nome: concordato ? "Canone concordato" : "Canone libero", importo: canoneEffettivo },
    { chiave: "cedolare", nome: `Cedolare secca ${Math.round(aliquota * 100)}%`, importo: -cedolare },
    { chiave: "imu", nome: "IMU", importo: -imu },
    { chiave: "condominio", nome: "Condominio", importo: -condominio },
    { chiave: "manutenzione", nome: "Manutenzione", importo: -manutenzione },
    { chiave: "sfitto", nome: "Sfitto e morosità", importo: -sfitto },
    { chiave: "rata", nome: "Rata del mutuo", importo: -Math.round(rata) },
  ];

  return {
    canone: canoneEffettivo, rata,
    voci,
    flusso: voci.reduce((a, v) => a + v.importo, 0),
  };
}

/** Solo il flusso, che è ciò che serve al motore. */
export const flussoAlLivello = (carta, idLivello, fisco) =>
  vociFlusso(carta, idLivello, fisco).flusso;

/**
 * Le due strade a confronto, per la carta che si sta guardando.
 * Serve al pannello che mostra la scelta: nessuna delle due vince sempre.
 */
export function confrontoCanone(carta, fisco) {
  const libero = vociFlusso({ ...carta, concordato: false }, 2, fisco);
  const concordato = vociFlusso({ ...carta, concordato: true }, 2, fisco);
  return {
    libero: libero.flusso,
    concordato: concordato.flusso,
    migliore: concordato.flusso > libero.flusso ? "concordato" : "libero",
    differenza: Math.abs(concordato.flusso - libero.flusso),
  };
}
