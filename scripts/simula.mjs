/**
 * Simulatore: gioca N partite complete con giocatori automatici.
 * Serve a verificare che il motore non si blocchi mai e che le regole reggano.
 *   node scripts/simula.mjs [numeroPartite]
 */
import { creaStanza, applicaAzione, codiceStanza, classifica } from "../src/game/motore.js";
import { getPacchetto } from "../src/game/mercati/indice.js";

const PACCHETTO = getPacchetto();
const PROFESSIONI = PACCHETTO.professioni;
const SOGNI = PACCHETTO.sogni;
import { riepilogo } from "../src/game/finanze.js";

import { mossaBot, scegli } from "./bot.mjs";

function agisci(s, az) {
  const r = applicaAzione(s, az);
  if (r.errore) return { s, errore: r.errore };
  return { s: r.stato, errore: null };
}

function partita(maxAzioni = 8000) {
  let s = creaStanza(codiceStanza(), "p0");
  const n = 2 + Math.floor(Math.random() * 5); // 2-6 giocatori
  for (let i = 0; i < n; i++) {
    const r = applicaAzione(s, {
      tipo: "entra", giocatoreId: "p" + i, nome: "Bot" + i,
      professioneId: scegli(PROFESSIONI).id, sognoId: scegli(SOGNI).id,
    });
    if (r.errore) throw new Error("entra: " + r.errore);
    s = r.stato;
  }
  let r = applicaAzione(s, { tipo: "avvia", giocatoreId: "p0" });
  if (r.errore) throw new Error("avvia: " + r.errore);
  s = r.stato;

  let azioni = 0, errori = 0;
  while (s.fase === "inCorso" && azioni < maxAzioni) {
    const az = mossaBot(s);
    if (!az) throw new Error("bot bloccato: nessuna mossa disponibile");
    const out = agisci(s, az);
    if (out.errore) {
      errori++;
      if (errori > 200) throw new Error("troppi errori consecutivi: " + out.errore + " su " + az.tipo);
      // forza avanzamento se il bot si incarta
      if (s.pending?.tipo === "mercato") {
        const f = applicaAzione(s, { tipo: "chiudiMercato", giocatoreId: s.giocatori[s.turno].id });
        if (!f.errore) { s = f.stato; continue; }
      }
      continue;
    }
    errori = 0;
    s = out.s;
    azioni++;
  }
  return { s, azioni, finita: s.fase === "finita", n };
}

const N = Number(process.argv[2] || 40);
let finite = 0, sogno = 0, cash = 0, ultimo = 0, timeout = 0;
let sommaAzioni = 0, sommaTurni = 0, usciti = 0, totGiocatori = 0, eliminati = 0;
const t0 = Date.now();

for (let i = 0; i < N; i++) {
  const { s, azioni, finita, n } = partita();
  sommaAzioni += azioni;
  sommaTurni += s.numeroTurno;
  totGiocatori += n;
  usciti += s.giocatori.filter((g) => g.tracciato === "veloce").length;
  eliminati += s.giocatori.filter((g) => g.eliminato).length;
  if (finita) {
    finite++;
    if (s.motivoVittoria === "sogno") sogno++;
    else if (s.motivoVittoria === "rendita") cash++;
    else ultimo++;
  } else timeout++;
}

console.log(`\n${N} partite simulate in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
console.log(`  concluse regolarmente : ${finite}/${N}`);
console.log(`    - vinte col sogno   : ${sogno}`);
console.log(`    - vinte col flusso  : ${cash}`);
console.log(`    - ultimo rimasto    : ${ultimo}`);
console.log(`  non concluse (limite) : ${timeout}`);
console.log(`  azioni medie/partita  : ${Math.round(sommaAzioni / N)}`);
console.log(`  turni medi/partita    : ${Math.round(sommaTurni / N)}`);
console.log(`  usciti dalla corsa    : ${usciti}/${totGiocatori} giocatori (${Math.round(usciti / totGiocatori * 100)}%)`);
console.log(`  eliminati             : ${eliminati}/${totGiocatori}`);
if (timeout > N * 0.2) { console.error("\n⚠️  troppe partite non concluse"); process.exit(1); }
console.log("\n✅ nessun blocco del motore\n");
