/**
 * L'AGENTE CHE PROPONE UN AGGIORNAMENTO DEI DATI.
 *
 *   node agente/proponi.mjs [mercato]        guarda e riferisce
 *   node agente/proponi.mjs roma --scrivi    scrive anche il candidato
 *
 * LA REGOLA, UNA SOLA: questo programma NON tocca i dati in produzione.
 * Legge le fonti, misura quanto si sono spostate rispetto al pacchetto in
 * uso, e al massimo scrive un FILE NUOVO da rivedere a mano. Il motivo non
 * è prudenza generica: un errore di lettura in un campo si trasformerebbe
 * in un'economia rotta per tutti i tavoli aperti, e nessuno se ne
 * accorgerebbe finché qualcuno non perde una partita per colpa nostra.
 *
 * Il percorso è sempre lo stesso:
 *
 *   1. l'agente legge le fonti e calcola la deriva;
 *   2. se la deriva supera la soglia, propone una versione nuova;
 *   3. `npm run test:bilancia` decide se quella versione è giocabile;
 *   4. una persona legge il rapporto e decide se pubblicare.
 *
 * Il passo 3 è quello che rende sicuro il resto. Cambiare i numeri di un
 * gioco è una modifica di bilanciamento, non un aggiornamento di contenuti.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TUTTE } from "./fonti.mjs";
import { getPacchetto, versioneCorrente } from "../src/game/mercati/indice.js";

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = join(QUI, "..");

/** Sotto questa deriva non vale la pena rifare i conti. */
const SOGLIA_DERIVA = 0.03;   // 3%

const pct = (x) => (x == null ? "—" : `${(x * 100).toFixed(1)}%`);
const riga = (t = "─") => t.repeat(70);

/* ═══════════════ raccolta ═══════════════ */

async function raccogli(paese) {
  const out = {};
  for (const [nome, fn] of Object.entries(TUTTE)) {
    process.stdout.write(`  ${nome.padEnd(20)} `);
    const r = await fn(paese);
    out[nome] = r;
    if (r.ok) console.log(`✅ ${r.valore}${r.unita ? " " + r.unita : ""}  (${r.periodo})`);
    else if (r.manuale) console.log("✋ richiede una persona");
    else console.log(`⚠️  ${r.errore}`);
  }
  return out;
}

/* ═══════════════ confronto ═══════════════ */

function confronta(pacchetto, letture) {
  const scostamenti = [];

  const tasso = letture.tassoMutui;
  if (tasso?.ok) {
    /* Il pacchetto porta un TAEG, la BCE pubblica il tasso: si confrontano
       dopo aver aggiunto i costi accessori, altrimenti si insegue un
       fantasma e si propone un aggiornamento a ogni esecuzione. */
    const COSTI_ACCESSORI = 0.004;
    const taegStimato = tasso.valore + COSTI_ACCESSORI;
    const attuale = pacchetto.creditoTaeg ?? null;
    if (attuale != null) {
      const deriva = (taegStimato - attuale) / attuale;
      scostamenti.push({
        campo: "TAEG del credito",
        attuale: pct(attuale),
        proposto: pct(taegStimato),
        deriva,
        fonte: tasso.fonte,
        nota: tasso.nota,
      });
    }
  }

  const indice = letture.indicePrezziCase;
  if (indice?.ok && indice.variazione != null) {
    scostamenti.push({
      campo: "Prezzi delle abitazioni (deriva annua)",
      attuale: "—",
      proposto: pct(indice.variazione),
      deriva: indice.variazione,
      fonte: indice.fonte,
      nota: "Se supera la soglia, vanno riscaricate le quotazioni OMI per zona: "
          + "l'indice dice QUANTO si è mosso il mercato, non DOVE.",
    });
  }

  return scostamenti;
}

/* ═══════════════ rapporto ═══════════════ */

function rapporto(mercatoId, pacchetto, letture, scostamenti) {
  const oggi = new Date().toISOString().slice(0, 10);
  const rilevanti = scostamenti.filter((s) => Math.abs(s.deriva ?? 0) >= SOGLIA_DERIVA);
  const righe = [];

  righe.push(`# Proposta di aggiornamento — mercato "${pacchetto.nome}"`);
  righe.push("");
  righe.push(`Generata il ${oggi} · versione in uso: ${pacchetto.versione}`);
  righe.push("");
  righe.push("> Questo file è una proposta. Nessun dato di gioco è stato modificato.");
  righe.push("");

  righe.push("## Che cosa dicono le fonti");
  righe.push("");
  righe.push("| Fonte | Esito | Valore | Periodo |");
  righe.push("|---|---|---|---|");
  for (const [nome, r] of Object.entries(letture)) {
    const esito = r.ok ? "letta" : r.manuale ? "**richiede una persona**" : `non raggiunta (${r.errore})`;
    righe.push(`| ${nome} | ${esito} | ${r.ok ? r.valore : "—"} | ${r.periodo || "—"} |`);
  }
  righe.push("");

  righe.push("## Scostamenti");
  righe.push("");
  if (!scostamenti.length) {
    righe.push("Nessuno misurabile con le fonti automatiche.");
  } else {
    righe.push("| Campo | In uso | Dalle fonti | Deriva | Oltre soglia |");
    righe.push("|---|---|---|---|---|");
    for (const s of scostamenti) {
      const oltre = Math.abs(s.deriva ?? 0) >= SOGLIA_DERIVA ? "**sì**" : "no";
      righe.push(`| ${s.campo} | ${s.attuale} | ${s.proposto} | ${pct(s.deriva)} | ${oltre} |`);
    }
  }
  righe.push("");

  righe.push("## Che cosa fare");
  righe.push("");
  if (!rilevanti.length) {
    righe.push(`Niente. Nessuna deriva supera il ${pct(SOGLIA_DERIVA)}, e sotto quella soglia`);
    righe.push("rifare i conti sposterebbe cifre senza spostare il gioco.");
  } else {
    righe.push(`Vale la pena aggiornare: ${rilevanti.length} scostamento/i oltre il ${pct(SOGLIA_DERIVA)}.`);
    righe.push("");
    for (const s of rilevanti) {
      righe.push(`- **${s.campo}** — ${s.attuale} → ${s.proposto}. ${s.nota || ""}`);
    }
    righe.push("");
    righe.push("Passi:");
    righe.push("");
    righe.push("1. Scaricare le quotazioni OMI del semestre (area riservata) e aggiornare");
    righe.push("   `ZONE` in `src/game/mercati/roma/fonti.js`.");
    righe.push(`2. Creare \`src/game/mercati/${mercatoId}/v<AAAA.MM>.js\` — **un file nuovo**,`);
    righe.push("   senza toccare quello vecchio: le partite in corso ci sono ancorate.");
    righe.push("3. Registrarlo in `src/game/mercati/indice.js`.");
    righe.push("4. `npm run test:bilancia` — se non passa, il pacchetto non si pubblica.");
  }
  righe.push("");

  righe.push("## Fonti che una macchina non può leggere");
  righe.push("");
  for (const [nome, r] of Object.entries(letture)) {
    if (!r.manuale) continue;
    righe.push(`- **${nome}** — ${r.fonte}`);
    righe.push(`  ${r.nota}`);
    righe.push(`  <${r.url}>`);
  }
  righe.push("");
  righe.push("---");
  righe.push("");
  righe.push("Generato da `agente/proponi.mjs`. Non modifica nulla: propone e basta.");
  return righe.join("\n");
}

/* ═══════════════ esecuzione ═══════════════ */

const mercatoId = process.argv.find((a) => /^[a-z]+$/.test(a) && a !== "--scrivi") || "roma";
const scrivi = process.argv.includes("--scrivi");

const pacchetto = getPacchetto(mercatoId);
if (!pacchetto) {
  console.error(`Mercato "${mercatoId}" sconosciuto.`);
  process.exit(1);
}

console.log(`\n${riga("═")}`);
console.log(`AGENTE · mercato "${pacchetto.nome}" v${pacchetto.versione}`);
console.log(riga("═"));
console.log("\nLettura delle fonti:\n");

const paese = mercatoId === "roma" ? "IT" : "IT";
const letture = await raccogli(paese);

const scostamenti = confronta({ ...pacchetto, creditoTaeg: 0.039 }, letture);

console.log(`\n${riga()}`);
if (!scostamenti.length) {
  console.log("Nessuno scostamento misurabile con le fonti automatiche.");
} else {
  for (const s of scostamenti) {
    const oltre = Math.abs(s.deriva ?? 0) >= SOGLIA_DERIVA;
    console.log(`${oltre ? "⚠️ " : "   "} ${s.campo}: ${s.attuale} → ${s.proposto}  (deriva ${pct(s.deriva)})`);
  }
}
console.log(riga());

const testo = rapporto(mercatoId, pacchetto, letture, scostamenti);
const cartella = join(RADICE, "agente", "proposte");
if (scrivi) {
  if (!existsSync(cartella)) mkdirSync(cartella, { recursive: true });
  const file = join(cartella, `${mercatoId}-${new Date().toISOString().slice(0, 10)}.md`);
  writeFileSync(file, testo + "\n", "utf8");
  console.log(`\nRapporto scritto in agente/proposte/${mercatoId}-${new Date().toISOString().slice(0, 10)}.md`);
  console.log("Nessun dato di gioco è stato modificato.\n");
} else {
  console.log("\n" + testo + "\n");
  console.log("(esegui con --scrivi per salvare il rapporto)\n");
}
