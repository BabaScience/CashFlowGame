import { MERCATI, MERCATO_PREDEFINITO } from "../game/mercati/indice.js";

/**
 * L'INDIRIZZO DICE QUALE MERCATO SI STA GUARDANDO.
 *
 * `/roma` è Roma, `/beirut` sarà Beirut, `/` è quello di sempre. Serve a
 * tre cose che oggi non si possono fare: mandare a qualcuno il link di un
 * mercato, tornarci col tasto indietro, e — quando i mercati saranno venti
 * — dare a ognuno una pagina che esiste davvero invece di uno stato interno
 * al browser.
 *
 * ═══ PERCHÉ NEL PERCORSO E NON IN UN SOTTODOMINIO ═══
 *
 * `beirut.quota.com` e `roma.quota.com` sono due origini diverse, e
 * l'identità di chi gioca vive in `localStorage` (`quotazero:id`, vedi
 * lib/api.js), che è per origine. Due sottodomini vorrebbero dire due
 * identità per la stessa persona: punteggio, storico e partite giocate
 * ripartirebbero da zero passando da un mercato all'altro. Nel percorso
 * l'origine resta una sola.
 *
 * ═══ LA LINGUA NON STA QUI ═══
 *
 * Lingua e mercato sono separati apposta (vedi Mercato.jsx: un francese
 * gioca Roma in francese). Metterli tutti e due nel percorso moltiplicherebbe
 * gli indirizzi — tre lingue per venti mercati fanno sessanta pagine per
 * venti contenuti — quindi la lingua resta una preferenza.
 */

/** Gli id che esistono davvero: `/impara` o `/pippo` non sono mercati. */
const IDS = new Set(MERCATI.map((m) => m.id));

/** Il mercato scritto nell'indirizzo, o `null` se non ce n'è uno valido. */
export function mercatoDaPercorso(percorso) {
  const primo = String(percorso || "/").split("/").filter(Boolean)[0];
  return primo && IDS.has(primo) ? primo : null;
}

/** L'indirizzo di un mercato. */
export function percorsoDi(mercatoId) {
  return mercatoId && IDS.has(mercatoId) ? `/${mercatoId}` : "/";
}

/**
 * Il mercato da mostrare all'apertura, in ordine di autorità: quello
 * chiesto dall'indirizzo, poi l'ultimo scelto, poi quello di sempre.
 *
 * `salvato` si controlla come tutto il resto: un mercato ritirato che resta
 * in `localStorage` non deve far partire il gioco su un pacchetto che non
 * esiste più.
 */
export function mercatoIniziale(percorso, salvato) {
  return mercatoDaPercorso(percorso)
    || (salvato && IDS.has(salvato) ? salvato : null)
    || MERCATO_PREDEFINITO;
}
