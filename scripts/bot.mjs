/**
 * Il ciclo che fa girare una partita intera, per i test.
 * La logica di decisione vive in `src/game/avversario.js`: la usa anche il
 * client quando si gioca contro il computer.
 */
import { applicaAzione } from "../src/game/motore.js";
export { mossaBot, scegli } from "../src/game/avversario.js";
import { mossaBot } from "../src/game/avversario.js";

export function gioca(stato, maxAzioni = 4000) {
  let s = stato, azioni = 0, errori = 0;
  while (s.fase === "inCorso" && azioni < maxAzioni) {
    const az = mossaBot(s);
    if (!az) break;
    const r = applicaAzione(s, az);
    if (r.errore) {
      if (++errori > 100) break;
      /* Il Mercato è l'unico punto in cui il bot può incartarsi: lo si
         chiude d'autorità e si tira avanti. */
      if (s.pending?.tipo === "mercato") {
        const f = applicaAzione(s, { tipo: "chiudiMercato", giocatoreId: s.giocatori[s.turno].id });
        if (!f.errore) { s = f.stato; continue; }
      }
      continue;
    }
    errori = 0;
    s = r.stato;
    azioni++;
  }
  return { stato: s, azioni };
}
