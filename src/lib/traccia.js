/**
 * TRACCIA — il lato dispositivo delle metriche.
 *
 * Il dispositivo si ricorda da solo quando ha giocato la prima volta e
 * quando è tornato l'ultima. Al server dichiara soltanto la *fascia* di
 * giorni in cui si trova, mai una data e mai un identificativo. Il ritorno
 * a 1, 7 e 30 giorni si misura così, e nessuno deve custodire nulla.
 *
 * Tre cautele:
 *  - si rispetta "Do Not Track", anche se quasi nessuno lo controlla più;
 *  - gli invii partono con `keepalive`, altrimenti l'evento di abbandono
 *    muore insieme alla scheda che si sta chiudendo;
 *  - un errore di rete non deve mai arrivare a chi gioca: si tace.
 */

const PRIMA = "quotazero:prima";
const ULTIMA = "quotazero:ultima";

const oggi = () => new Date().toISOString().slice(0, 10);
const giorniFra = (a, b) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 86400e3));

function leggi(chiave) {
  try { return localStorage.getItem(chiave); } catch { return null; }
}
function scrivi(chiave, valore) {
  try { localStorage.setItem(chiave, valore); } catch { /* modalità privata */ }
}

/** Vero se la persona ha chiesto di non essere seguita. */
function nonSeguire() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
}

/** Da quanti giorni questo dispositivo ci conosce. */
export function giorniDallaPrima() {
  const prima = leggi(PRIMA);
  if (!prima) return 0;
  return giorniFra(prima, oggi());
}

/** Registra la visita di oggi. Restituisce true se è una visita nuova. */
export function segnaVisita() {
  const g = oggi();
  if (!leggi(PRIMA)) scrivi(PRIMA, g);
  const ultima = leggi(ULTIMA);
  scrivi(ULTIMA, g);
  return ultima !== g;
}

/**
 * Invia un evento. Non attende, non restituisce nulla di utile, non lancia:
 * una metrica che rompe una partita è peggio di una metrica mancante.
 */
export function traccia(evento, dati = {}) {
  if (nonSeguire()) return;
  const corpo = JSON.stringify({ evento, giorniDallaPrima: giorniDallaPrima(), ...dati });
  try {
    fetch("/api/eventi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: corpo,
      keepalive: true,
    }).catch(() => {});
  } catch { /* niente rete: pazienza */ }
}

/** Apertura dell'app: una sola volta per giorno e per dispositivo. */
export function tracciaSessione() {
  if (segnaVisita()) traccia("sessione");
}
