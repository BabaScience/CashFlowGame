/**
 * BILANCIA — prova che il gioco si possa vincere.
 *
 * `simula.mjs` dimostra che il motore non si blocca. Non dimostra affatto
 * che la partita sia vincibile: una partita in cui nessuno esce mai dalla
 * Ruota "non si blocca" comunque, e passerebbe il test.
 *
 * Questo controllo risponde invece alle due domande che contano davvero,
 * professione per professione:
 *
 *   1. esiste una via d'uscita dalla Ruota?
 *   2. si arriva davvero a vincere, e in quanto tempo?
 *
 * È il cancello da attraversare ogni volta che i dati cambiano — nuovi
 * prezzi, nuovi stipendi, un nuovo mercato. Cambiare i numeri di un gioco
 * è una modifica di bilanciamento, non un aggiornamento di contenuti: può
 * rendere una professione impossibile senza che nulla vada in errore.
 *
 *   node scripts/bilancia.mjs [partite per professione] [--verboso]
 *
 * Uscita 0 = i dati reggono. Uscita 1 = i dati hanno rotto il gioco.
 */
import { creaStanza, applicaAzione, codiceStanza, TURNI_LAMPO } from "../src/game/motore.js";
import { getPacchetto, MERCATI, esiste, versioneCorrente } from "../src/game/mercati/indice.js";

/* Quale mercato si sta verificando: `node scripts/bilancia.mjs 12 roma`.
   Senza argomento si verificano TUTTI i mercati registrati, perché un
   pacchetto ingiocabile non deve poter arrivare in produzione solo
   perché nessuno si è ricordato di controllarlo. */
const MERCATO = process.argv.find((a) => /^[a-z]+$/.test(a) && a !== "--verboso" && esiste(a, versioneCorrente(a)));
const DA_VERIFICARE = MERCATO ? [MERCATO] : MERCATI.map((m) => m.id);
import { flussoMensile, fuoriDallaCorsa, riepilogo, soldi, redditoPassivo, speseTotali } from "../src/game/finanze.js";

/* ═══════════════ soglie di accettazione ═══════════════ */
/* Alzarle rende il gioco più severo con sé stesso. Vanno tarate una volta
   e poi lasciate stare: sono la definizione di "gioco funzionante". */
export const SOGLIE = {
  /* Nessuna professione può essere una condanna: se partendo da qui non si
     esce mai, quella scheda è rotta e va ribilanciata. */
  usciteMinPerProfessione: 0.15,
  /* Con poche partite per professione questa soglia diventa un lancio di
     dadi: a 8 partite servono 2 uscite su 8, e una professione che sta
     davvero al 19% falliva o passava a caso. La suite gira con 14, che è il
     minimo perché il risultato smetta di dipendere dalla fortuna. */
  /* Il gioco deve concludersi con una vittoria vera, non per abbandono:
     "ultimo rimasto" significa che gli altri sono falliti, non che qualcuno
     ha giocato bene. */
  vittorieVereMin: 0.60,
  /* Ritmo: se si esce troppo presto non si impara nulla, troppo tardi e
     nessuno arriva in fondo. Turni del singolo giocatore, non del tavolo. */
  /* Quanti turni PERSONALI per lasciare la Ruota.
     La fascia era 8–120 quando uscire faceva finire la partita. Ora uscire
     è metà strada — dopo c'è il Largo, che con la continuità si gioca
     davvero invece di risolversi in due caselle — quindi la prima metà può
     durare di più. Quello che conta adesso è che l'uscita non arrivi né
     subito né mai, e che la partita INTERA finisca: per quello c'è la
     verifica sulle vittorie vere, che misura proprio le partite chiuse. */
  turniUscitaMediana: [8, 170],
  /* Equità fra professioni: la più lenta non può essere un altro gioco
     rispetto alla più rapida. */
  rapportoMaxLentaVeloce: 4.0,
  /* Un bagno di sangue continuo non insegna, frustra. */
  bancarotteMax: 0.45,
};

/* ═══════════════ il giocatore automatico ═══════════════ */
/**
 * Deterministico di proposito: nessuna chiamata a Math.random.
 * Dato un seme, la partita è identica a ogni esecuzione — così una
 * differenza fra due esecuzioni è colpa dei dati, mai della fortuna.
 *
 * Non è un giocatore ottimo, è un giocatore ragionevole: compra ciò che
 * rende, si indebita solo quando l'affare ripaga l'interesse, vende quando
 * il mercato offre più del costo. Se un giocatore così non esce mai dalla
 * Corsa, non ne uscirebbe nemmeno una persona.
 */

/** Rendimento mensile sui contanti impegnati: il solo criterio che conta. */
const resa = (flusso, contanti) => (contanti > 0 ? flusso / contanti : flusso > 0 ? Infinity : 0);

function mossa(s) {
  const p = s.pending;
  const diTurno = s.giocatori[s.turno];

  if (p) {
    /* Il Mercato coinvolge tutti gli aventi diritto, uno alla volta. */
    if (p.tipo === "mercato") {
      const chi = (p.idonei || []).find((id) => !(p.risposto || []).includes(id));
      if (!chi) return { tipo: "chiudiMercato", giocatoreId: diTurno.id };
      const g = s.giocatori.find((x) => x.id === chi);
      const c = p.carta;

      if (c.tipo === "offerta") {
        /* Si vende solo con un guadagno reale sul costo d'acquisto. */
        if (c.categoria === "attivita" && g.attivita.length) {
          const a = g.attivita.find((x) => (c.prezzo || x.costo * (c.moltiplicatore || 0)) > x.costo * 1.2);
          if (a) return { tipo: "vendiAlMercato", giocatoreId: chi, rid: a.rid, ultima: true };
        } else {
          const m = g.immobili.filter((i) => i.categoria === c.categoria);
          const scelto = m.find((i) => (c.prezzo || i.costo * (c.moltiplicatore || 0)) > i.costo * 1.2);
          if (scelto) return { tipo: "vendiAlMercato", giocatoreId: chi, rid: scelto.rid, ultima: true };
        }
      }
      if (c.tipo === "prezzo") {
        const a = g.azioni.find((x) => x.simbolo === c.simbolo);
        /* Si liquida solo con un margine sensato, e mai i titoli che pagano
           cedola: quelli sono reddito passivo, cioè la via d'uscita. */
        if (a && !a.dividendo && c.prezzo > a.prezzoAcquisto * 1.5)
          return { tipo: "vendiAlMercato", giocatoreId: chi, quantita: a.quantita, ultima: true };
      }
      return { tipo: "passaMercato", giocatoreId: chi };
    }

    const id = p.giocatoreId;
    const g = s.giocatori.find((x) => x.id === id);

    switch (p.tipo) {
      case "sceltaTaglia":
        /* I Grandi Affari rendono molto di più, ma serve l'acconto. */
        return { tipo: "scegliTaglia", giocatoreId: id, taglia: g.contanti >= 20000 ? "grandi" : "piccoli" };

      case "carta": {
        const c = p.carta;
        if (c.tipo === "spesa") return { tipo: "passaCarta", giocatoreId: id };

        if (c.tipo === "azione") {
          /* Solo titoli che pagano una cedola: il gioco premia il reddito,
             non la speculazione, e la speculazione non è insegnabile. */
          if (!c.dividendo) return { tipo: "passaCarta", giocatoreId: id };
          const quantita = Math.floor((g.contanti * 0.25) / c.prezzo);
          if (quantita >= 1) return { tipo: "compraCarta", giocatoreId: id, quantita };
          return { tipo: "passaCarta", giocatoreId: id };
        }

        /* Immobili e attività: si valuta la resa mensile sull'acconto. */
        if (!(c.flusso > 0)) return { tipo: "passaCarta", giocatoreId: id };
        if (g.contanti >= c.acconto && resa(c.flusso, c.acconto) >= 0.01)
          return { tipo: "compraCarta", giocatoreId: id };

        /* Il prestito costa il 10% al mese: conviene solo se l'affare rende
           più dell'interesse che si accende per farlo. */
        const manca = c.acconto - g.contanti;
        if (manca > 0) {
          const serve = Math.ceil(manca / 1000) * 1000;
          if (serve <= 40000 && c.flusso > serve * 0.1)
            return { tipo: "prestito", giocatoreId: id, importo: serve };
        }
        return { tipo: "passaCarta", giocatoreId: id };
      }

      case "extra": return { tipo: "confermaExtra", giocatoreId: id };
      case "figlio": return { tipo: "confermaFiglio", giocatoreId: id };
      case "licenziamento": return { tipo: "confermaLicenziamento", giocatoreId: id };
      case "penalitaVeloce": return { tipo: "confermaPenalita", giocatoreId: id };

      case "beneficenza":
        /* Due dadi accelerano il giro: conviene se i contanti abbondano. */
        return { tipo: "beneficenza", giocatoreId: id, accetta: g.contanti > p.costo * 6 };
      case "beneficenzaVeloce":
        return { tipo: "beneficenzaVeloce", giocatoreId: id, accetta: false };

      case "bancarotta": {
        /* Si estingue prima il prestito (costa il 10% al mese), poi si
           svendono gli attivi meno redditizi. */
        if (flussoMensile(g) < 0) {
          if (g.passivita.prestitoBanca >= 1000 && g.contanti >= 1000) {
            const importo = Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000);
            return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "prestito", importo };
          }
          const peggiore = (lista) =>
            [...lista].sort((a, b) => resa(a.flusso, a.acconto) - resa(b.flusso, b.acconto))[0];
          if (g.immobili.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "immobile", rid: peggiore(g.immobili).rid };
          if (g.attivita.length) return { tipo: "vendiPerBancarotta", giocatoreId: id, categoria: "attivita", rid: peggiore(g.attivita).rid };
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

      default:
        throw new Error("pending non gestito: " + p.tipo);
    }
  }

  const g = diTurno;
  if (g.tracciato === "topi" && fuoriDallaCorsa(g)) return { tipo: "esciDallaCorsa", giocatoreId: g.id };
  if (!s.dado) return { tipo: "tira", giocatoreId: g.id, nDadi: 2 };
  return null;
}

/* ═══════════════ una partita ═══════════════ */

function partita({ mercatoId, livello, professioneId, giocatori = 3, seme, maxAzioni = 12000 }) {
  let s = creaStanza(codiceStanza(), "p0", { seme, mercatoId, livello });
  for (let i = 0; i < giocatori; i++) {
    const r = applicaAzione(s, {
      tipo: "entra", giocatoreId: "p" + i, nome: "Bot" + i,
      professioneId,                                   // stessa scheda per tutti:
      sognoId: getPacchetto(mercatoId).sogni[i % getPacchetto(mercatoId).sogni.length].id,
    });
    if (r.errore) throw new Error("entra: " + r.errore);
    s = r.stato;
  }
  let r = applicaAzione(s, { tipo: "avvia", giocatoreId: "p0" });
  if (r.errore) throw new Error("avvia: " + r.errore);
  s = r.stato;

  /* Turni personali al momento dell'uscita dalla Ruota. */
  const uscita = new Map();
  const mesiVisti = new Map();
  let azioni = 0, errori = 0;

  while (s.fase === "inCorso" && azioni < maxAzioni) {
    const az = mossa(s);
    if (!az) throw new Error("bot bloccato");
    const out = applicaAzione(s, az);
    if (out.errore) {
      if (++errori > 100) throw new Error("stallo: " + out.errore + " su " + az.tipo);
      if (s.pending?.tipo === "mercato") {
        const f = applicaAzione(s, { tipo: "chiudiMercato", giocatoreId: s.giocatori[s.turno].id });
        if (!f.errore) { s = f.stato; continue; }
      }
      continue;
    }
    errori = 0;
    s = out.stato;
    azioni++;
    /* Un solo NaN fra spese e passività azzerava silenziosamente il totale.
       Costa poco cercarlo a ogni mossa, e ha già ripagato la spesa. */
    for (const g of s.giocatori) {
      for (const [k, v] of Object.entries(g.spese)) {
        if (!Number.isFinite(v)) throw new Error(`spesa "${k}" non è un numero (${v}) su ${g.nome}`);
      }
      for (const [k, v] of Object.entries(g.passivita)) {
        if (!Number.isFinite(v)) throw new Error(`passività "${k}" non è un numero (${v}) su ${g.nome}`);
      }
      if (!Number.isFinite(g.contanti)) throw new Error(`contanti non numerici su ${g.nome}`);
      /* Il tempo non torna indietro, e dopo l'avvio non è mai zero: sono le
         due sole cose che il conto dei mesi deve garantire sempre. Qui si
         verificano su decine di migliaia di mosse vere. */
      if (!Number.isFinite(g.mesi) || g.mesi < 1) {
        throw new Error(`mesi non validi (${g.mesi}) su ${g.nome}`);
      }
      const prima = mesiVisti.get(g.id);
      if (prima !== undefined && g.mesi < prima) {
        throw new Error(`i mesi di ${g.nome} sono tornati indietro: ${prima} → ${g.mesi}`);
      }
      mesiVisti.set(g.id, g.mesi);
      if (g.tracciato === "veloce" && g.mesiAllUscita == null) {
        throw new Error(`${g.nome} è uscito dalla Ruota senza registrare i mesi`);
      }
    }
    for (const g of s.giocatori) {
      if (g.tracciato === "veloce" && !uscita.has(g.id)) uscita.set(g.id, g.turniGiocati);
    }
  }

  return { s, azioni, uscita, completata: s.fase === "finita" };
}

/* ═══════════════ esecuzione ═══════════════ */

const mediana = (a) => {
  if (!a.length) return null;
  const b = [...a].sort((x, y) => x - y);
  const m = b.length >> 1;
  return b.length % 2 ? b[m] : Math.round((b[m - 1] + b[m]) / 2);
};

const PER_PROFESSIONE = Number(process.argv.find((a) => /^\d+$/.test(a))) || 12;
const pad = (t, n) => String(t).padEnd(n);
const lpad = (t, n) => String(t).padStart(n);

let mercatiRotti = 0;

/* Ogni livello di realismo è un gioco diverso e va verificato da solo: il
   Livello 2 toglie a un immobile buona parte del flusso, e un mercato
   giocabile al base può diventare impossibile al reale. */
const COMBINAZIONI = [];
for (const mercatoId of DA_VERIFICARE) {
  const p = getPacchetto(mercatoId);
  COMBINAZIONI.push({ mercatoId, livello: 1 });
  if (p.fisco) COMBINAZIONI.push({ mercatoId, livello: 2 });
}

for (const { mercatoId, livello } of COMBINAZIONI) {
  const pacchetto = getPacchetto(mercatoId);
  const professioni = pacchetto.professioni;
  const den = (n) => soldi(n, pacchetto.valuta);

  console.log(`\n${"═".repeat(66)}`);
  console.log(`MERCATO "${pacchetto.nome}" v${pacchetto.versione} · LIVELLO ${livello} · ${PER_PROFESSIONE} partite × ${professioni.length} professioni`);
  console.log("═".repeat(66));

  const righe = [];
  let vittorieVere = 0, partiteTotali = 0, nonCompletate = 0;
  const azioniViste = [];
  let aTempo = 0;

  for (const prof of professioni) {
    let giocatoriTot = 0, usciti = 0, falliti = 0, vinte = 0;
    const turniUscita = [];

    for (let i = 0; i < PER_PROFESSIONE; i++) {
      const seme = (0x5bf03635 ^ (prof.id.length * 2654435761) ^ (i * 40503) ^ mercatoId.length) >>> 0;
      const { s, uscita, completata, azioni } = partita({ mercatoId, livello, professioneId: prof.id, seme });

      partiteTotali++;
      giocatoriTot += s.giocatori.length;
      usciti += uscita.size;
      falliti += s.giocatori.filter((g) => g.eliminato).length;
      turniUscita.push(...uscita.values());
      if (!completata) {
        nonCompletate++;
        if (process.argv.includes("--diagnosi")) {
          console.log(`\n  ⚠ partita appesa · ${prof.nome} · seme ${seme} · turno ${s.numeroTurno}`);
          for (const g of s.giocatori) {
            const r = riepilogo(g);
            console.log(`      ${g.nome} ${g.tracciato}${g.eliminato ? " (fuori)" : ""}`
              + ` · contanti ${Math.round(g.contanti)}`
              + ` · rendita ${g.tracciato === "veloce" ? g.redditoRendita : r.redditoPassivo}`
              + ` · obiettivo ${g.tracciato === "veloce" ? (g.redditoInizialeVeloce + getPacchetto(mercatoId).obiettivoRendita) : r.speseTotali}`
              + ` · affari ${g.affariVeloci?.length ?? 0}`);
          }
        }
      }
      azioniViste.push(azioni);
      if (s.motivoVittoria === "sogno" || s.motivoVittoria === "rendita") { vinte++; vittorieVere++; }
      else if (s.motivoVittoria === "tempo") aTempo++;
    }

    righe.push({
      nome: prof.nome, stipendio: prof.stipendio,
      quotaUscita: usciti / giocatoriTot,
      quotaFallimento: falliti / giocatoriTot,
      medianaTurni: mediana(turniUscita),
      vinte, su: PER_PROFESSIONE,
    });
  }

  console.log(pad("professione", 26) + lpad("reddito", 10) + lpad("uscite", 9) + lpad("turni", 8) + lpad("fallim.", 9) + lpad("vinte", 8));
  console.log("─".repeat(70));
  for (const r of righe) {
    const allarme = r.quotaUscita < SOGLIE.usciteMinPerProfessione ? "  ⚠" : "";
    console.log(
      pad(r.nome, 26) + lpad(den(r.stipendio), 10) +
      lpad((r.quotaUscita * 100).toFixed(0) + "%", 9) +
      lpad(r.medianaTurni ?? "—", 8) +
      lpad((r.quotaFallimento * 100).toFixed(0) + "%", 9) +
      lpad(`${r.vinte}/${r.su}`, 8) + allarme
    );
  }

  const mediane = righe.map((r) => r.medianaTurni).filter((x) => x != null);
  const medianaGlobale = mediana(mediane);
  const piuLenta = Math.max(...mediane, 0);
  const piuVeloce = Math.min(...mediane, Infinity);
  const quotaVittorieVere = vittorieVere / partiteTotali;
  const fallimentoMedio = righe.reduce((a, r) => a + r.quotaFallimento, 0) / righe.length;

  const esiti = [];
  const verifica = (ok, testo, dettaglio) => esiti.push({ ok, testo, dettaglio });

  const morte = righe.filter((r) => r.quotaUscita < SOGLIE.usciteMinPerProfessione);
  verifica(morte.length === 0, "Ogni professione ha una via d'uscita dalla Ruota",
    morte.length ? `senza uscita: ${morte.map((r) => r.nome).join(", ")}`
                 : `minimo osservato ${(Math.min(...righe.map((r) => r.quotaUscita)) * 100).toFixed(0)}%`);

  verifica(quotaVittorieVere >= SOGLIE.vittorieVereMin, "Le partite si concludono con una vittoria vera",
    `${(quotaVittorieVere * 100).toFixed(0)}% (minimo ${(SOGLIE.vittorieVereMin * 100).toFixed(0)}%)`
    + ` · a tempo ${(aTempo / partiteTotali * 100).toFixed(0)}%`);

  verifica(medianaGlobale != null && medianaGlobale >= SOGLIE.turniUscitaMediana[0] && medianaGlobale <= SOGLIE.turniUscitaMediana[1],
    "Lasciare la Ruota richiede il tempo giusto",
    `mediana ${medianaGlobale} turni (fascia ${SOGLIE.turniUscitaMediana.join("–")})`);

  const rapporto = piuVeloce > 0 && isFinite(piuVeloce) ? piuLenta / piuVeloce : Infinity;
  verifica(rapporto <= SOGLIE.rapportoMaxLentaVeloce, "Le professioni sono confrontabili fra loro",
    `la più lenta impiega ${rapporto.toFixed(1)}× la più rapida (massimo ${SOGLIE.rapportoMaxLentaVeloce}×)`);

  verifica(fallimentoMedio <= SOGLIE.bancarotteMax, "La bancarotta resta un rischio, non la norma",
    `${(fallimentoMedio * 100).toFixed(0)}% dei giocatori (massimo ${(SOGLIE.bancarotteMax * 100).toFixed(0)}%)`);

  verifica(nonCompletate === 0, "Nessuna partita resta appesa",
    `${nonCompletate} su ${partiteTotali} · azioni: mediana ${mediana(azioniViste)}, massimo ${Math.max(...azioniViste)}`);

  console.log();
  for (const e of esiti) console.log(`  ${e.ok ? "✅" : "❌"} ${e.testo}\n       ${e.dettaglio}`);

  const falliti = esiti.filter((e) => !e.ok);
  if (falliti.length) {
    mercatiRotti++;
    console.error(`\n  ❌ "${pacchetto.nome}" livello ${livello} non è pubblicabile: ${falliti.length} verifica/he non superata/e.`);
  } else {
    console.log(`\n  ✅ "${pacchetto.nome}" livello ${livello} regge: vincibile da tutte e ${professioni.length} le professioni.`);
  }
}

/* ═══════════════ il formato Lampo ═══════════════
 *
 * Il Lampo non ha bisogno che si esca dalla Ruota — finisce a punti — ma
 * ha bisogno di due cose, e sono quelle che un cambio di dati può rompere
 * in silenzio.
 *
 * Che **finisca sempre**, e nel numero di turni dichiarato: se un mercato
 * nuovo allungasse le decisioni, dieci minuti diventerebbero venti e il
 * formato non servirebbe più a niente.
 *
 * E che **lo vinca chi gioca meglio**. Il modo più diretto di verificarlo
 * è metterci contro un giocatore che non compra mai niente: se in una
 * partita corta il caso conta più delle scelte, quello comincia a vincere,
 * e la classifica smette di misurare qualcosa.
 */
console.log("\n══════════════════════════════════════════════════════════════════");
console.log("FORMATO LAMPO · finisce in tempo, e lo vince chi gioca");
console.log("══════════════════════════════════════════════════════════════════");

function lampoContro(mercatoId, seme, scarsoPrimo) {
  let s = creaStanza(codiceStanza(), "p0", { seme, mercatoId, formato: "lampo" });
  const pac = getPacchetto(mercatoId);
  for (let i = 0; i < 2; i++) {
    const r = applicaAzione(s, {
      tipo: "entra", giocatoreId: "p" + i, nome: "Bot" + i,
      professioneId: pac.professioni[3 % pac.professioni.length].id,
      sognoId: pac.sogni[i].id,
    });
    if (r.errore) throw new Error(r.errore);
    s = r.stato;
  }
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "p0" }).stato;

  const scarso = scarsoPrimo ? "p0" : "p1";
  let n = 0;
  while (s.fase === "inCorso" && n < 20000) {
    const az = mossa(s);
    if (!az) break;
    /* Il giocatore scarso tiene i soldi sotto il materasso. */
    const suo = (s.pending?.giocatoreId || s.giocatori[s.turno].id) === scarso;
    const mossaSua = (suo && az.tipo === "compraCarta" && s.pending?.tipo === "carta"
      && s.pending.carta?.tipo !== "spesa")
      ? { tipo: "passaCarta", giocatoreId: scarso }
      : az;
    const r = applicaAzione(s, mossaSua);
    if (r.errore) break;
    s = r.stato; n++;
  }
  const q = (id) => {
    const g = s.giocatori.find((x) => x.id === id);
    return redditoPassivo(g) / Math.max(1, speseTotali(g));
  };
  const bravo = scarso === "p0" ? "p1" : "p0";
  return { finita: s.fase === "finita", turni: s.numeroTurno, azioni: n, vintaDalBravo: q(bravo) > q(scarso) };
}

let lampoRotto = 0;
for (const mercatoId of DA_VERIFICARE) {
  const pac = getPacchetto(mercatoId);
  const out = [];
  for (let i = 0; i < 24; i++) out.push(lampoContro(mercatoId, 40000 + i, i % 2 === 0));
  const tetto = TURNI_LAMPO * 2;
  const tutteFinite = out.every((o) => o.finita && o.turni <= tetto);
  const quota = out.filter((o) => o.vintaDalBravo).length / out.length;
  const azioni = mediana(out.map((o) => o.azioni));

  const ok1 = tutteFinite;
  const ok2 = quota >= 0.85;
  console.log(`\n  ${ok1 ? "✅" : "❌"} "${pac.nome}": ogni partita Lampo finisce entro ${tetto} turni`);
  console.log(`       ${out.filter((o) => o.finita).length}/${out.length} concluse · mediana ${azioni} azioni in tutto`);
  console.log(`  ${ok2 ? "✅" : "❌"} "${pac.nome}": il Lampo lo vince chi gioca, non chi pesca`);
  console.log(`       chi compra batte chi non compra nel ${(quota * 100).toFixed(0)}% dei casi (minimo 85%)`);
  if (!ok1 || !ok2) lampoRotto++;
}

if (lampoRotto) {
  console.error(`\n❌ FORMATO LAMPO ROTTO in ${lampoRotto} mercato/i. Non pubblicare.\n`);
  process.exit(1);
}

if (mercatiRotti) {
  console.error(`\n❌ BILANCIAMENTO ROTTO in ${mercatiRotti} mercato/i. Non pubblicare.\n`);
  process.exit(1);
}
console.log(`\n✅ Tutti i mercati verificati reggono.\n`);
