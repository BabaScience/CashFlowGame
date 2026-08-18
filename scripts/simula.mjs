/**
 * Simulatore: gioca N partite complete con giocatori automatici.
 * Serve a verificare che il motore non si blocchi mai e che le regole reggano.
 *   node scripts/simula.mjs [numeroPartite]
 */
import { creaStanza, applicaAzione, codiceStanza, classifica } from "../src/game/motore.js";
import { PROFESSIONI } from "../src/game/data/professioni.js";
import { SOGNI } from "../src/game/data/corsiaVeloce.js";
import { fuoriDallaCorsa, flussoMensile, riepilogo } from "../src/game/finanze.js";

const scegli = (a) => a[Math.floor(Math.random() * a.length)];

function agisci(s, az) {
  const r = applicaAzione(s, az);
  if (r.errore) return { s, errore: r.errore };
  return { s: r.stato, errore: null };
}

/** Un bot semplice ma non stupido: compra se può permetterselo e conviene. */
function mossaBot(s) {
  const p = s.pending;
  const attuale = s.giocatori[s.turno];

  if (p) {
    // Il Mercato lo devono risolvere tutti gli idonei.
    if (p.tipo === "mercato") {
      const chi = p.idonei.find((id) => !p.risposto.includes(id));
      if (!chi) return { tipo: "chiudiMercato", giocatoreId: attuale.id };
      const g = s.giocatori.find((x) => x.id === chi);
      const c = p.carta;
      if (c.tipo === "offerta" && Math.random() < 0.5) {
        if (c.categoria === "attivita" && g.attivita.length)
          return { tipo: "vendiAlMercato", giocatoreId: chi, rid: scegli(g.attivita).rid, ultima: true };
        const m = g.immobili.filter((i) => i.categoria === c.categoria);
        if (m.length) return { tipo: "vendiAlMercato", giocatoreId: chi, rid: scegli(m).rid, ultima: true };
      }
      if (c.tipo === "prezzo" && Math.random() < 0.6) {
        const a = g.azioni.find((x) => x.simbolo === c.simbolo);
        if (a && c.prezzo > a.prezzoAcquisto)
          return { tipo: "vendiAlMercato", giocatoreId: chi, quantita: a.quantita, ultima: true };
      }
      return { tipo: "passaMercato", giocatoreId: chi };
    }

    const id = p.giocatoreId;
    const g = s.giocatori.find((x) => x.id === id);
    switch (p.tipo) {
      case "sceltaTaglia":
        return { tipo: "scegliTaglia", giocatoreId: id, taglia: g.contanti > 30000 && Math.random() < 0.6 ? "grandi" : "piccoli" };
      case "carta": {
        const c = p.carta;
        if (c.tipo === "spesa") return { tipo: "passaCarta", giocatoreId: id };
        if (c.tipo === "azione") {
          const q = Math.floor(g.contanti * 0.3 / c.prezzo);
          if (q >= 1 && c.dividendo > 0) return { tipo: "compraCarta", giocatoreId: id, quantita: q };
          if (q >= 1 && Math.random() < 0.3) return { tipo: "compraCarta", giocatoreId: id, quantita: q };
          return { tipo: "passaCarta", giocatoreId: id };
        }
        if (g.contanti >= c.acconto && c.flusso > 0) return { tipo: "compraCarta", giocatoreId: id };
        // prova a finanziare con un prestito se il flusso lo giustifica
        if (c.flusso > 0 && c.acconto - g.contanti > 0) {
          const serve = Math.ceil((c.acconto - g.contanti) / 1000) * 1000;
          if (serve <= 20000 && c.flusso > serve / 10) return { tipo: "prestito", giocatoreId: id, importo: serve };
        }
        return { tipo: "passaCarta", giocatoreId: id };
      }
      case "extra": return { tipo: "confermaExtra", giocatoreId: id };
      case "beneficenza": {
        const costo = p.costo;
        return { tipo: "beneficenza", giocatoreId: id, accetta: g.contanti > costo * 4 };
      }
      case "figlio": return { tipo: "confermaFiglio", giocatoreId: id };
      case "licenziamento": return { tipo: "confermaLicenziamento", giocatoreId: id };
      case "bancarotta": {
        if (flussoMensile(g) < 0) {
          if (g.passivita.prestitoBanca >= 1000 && g.contanti >= 1000)
            return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "prestito", importo: Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000) };
          if (g.immobili.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "immobile", rid: g.immobili[0].rid };
          if (g.attivita.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "attivita", rid: g.attivita[0].rid };
          if (g.azioni.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "azione", simbolo: g.azioni[0].simbolo };
        }
        return { tipo: "concludiBancarotta", giocatoreId: id };
      }
      case "affareVeloce":
        return g.contanti >= p.affare.acconto
          ? { tipo: "compraAffareVeloce", giocatoreId: id }
          : { tipo: "passaAffareVeloce", giocatoreId: id };
      case "sogno":
        return p.mio && g.contanti >= p.costo
          ? { tipo: "compraSogno", giocatoreId: id }
          : { tipo: "passaSogno", giocatoreId: id };
      case "beneficenzaVeloce":
        return { tipo: "beneficenzaVeloce", giocatoreId: id, accetta: g.contanti > p.gia ? false : g.contanti > 100000 };
      case "penalitaVeloce": return { tipo: "confermaPenalita", giocatoreId: id };
      default: throw new Error("pending sconosciuto: " + p.tipo);
    }
  }

  // Nessun pending: tocca a chi ha il turno.
  const g = attuale;
  if (g.tracciato === "topi" && fuoriDallaCorsa(g)) return { tipo: "esciDallaCorsa", giocatoreId: g.id };
  if (!s.dado) return { tipo: "tira", giocatoreId: g.id, nDadi: 2 };
  return null; // stato impossibile
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
    else if (s.motivoVittoria === "cashflow") cash++;
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
