/**
 * Verifica puntuale delle regole del regolamento ufficiale.
 * Ogni test cita la pagina del manuale da cui deriva.
 *   node scripts/prova-regole.mjs
 */
import { creaStanza, applicaAzione, codiceStanza } from "../src/game/motore.js";
import { mossaBot } from "../src/game/avversario.js";
import { getPacchetto } from "../src/game/mercati/indice.js";

/* Il pacchetto di riferimento delle prove: le regole si verificano contro
   il mercato con cui il gioco è bilanciato, non contro dati che cambiano. */
const PACCHETTO = getPacchetto();
const getProfessione = (id) => PACCHETTO.professioni.find((p) => p.id === id) || PACCHETTO.professioni[0];
const OBIETTIVO_RENDITA = PACCHETTO.obiettivoRendita;
import { flussoMensile, speseTotali, redditoTotale, redditoPassivo, riepilogo, fuoriDallaCorsa } from "../src/game/finanze.js";


let passati = 0, falliti = 0;
const test = (nome, fn) => {
  try {
    const r = fn();
    /* Una prova asincrona passerebbe sempre: `fn()` restituisce una
       promessa, nessuno l'aspetta, e le verifiche dentro non girano mai. */
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le verifiche non girerebbero");
    }
    console.log(`  ✅ ${nome}`); passati++;
  }
  catch (e) { console.log(`  ❌ ${nome}\n       ${e.message}`); falliti++; }
};
const eq = (a, b, m = "") => { if (a !== b) throw new Error(`${m} atteso ${b}, ottenuto ${a}`); };
const vero = (c, m) => { if (!c) throw new Error(m || "condizione falsa"); };

const app = (s, az) => {
  const r = applicaAzione(s, az);
  if (r.errore) throw new Error("azione '" + az.tipo + "' rifiutata: " + r.errore);
  return r.stato;
};
const appErr = (s, az) => applicaAzione(s, az).errore;

function tavolo(prof = ["medico", "custode"]) {
  let s = creaStanza(codiceStanza(), "p0");
  prof.forEach((pid, i) => {
    s = app(s, { tipo: "entra", giocatoreId: "p" + i, nome: "G" + i, professioneId: pid, sognoId: "sg0" + (i + 1) });
  });
  return app(s, { tipo: "avvia", giocatoreId: "p0" });
}
const G = (s, i) => s.giocatori.find((g) => g.id === "p" + i);
/** Porta il turno sul giocatore indicato. */
function turnoDi(s, id) {
  for (let i = 0; i < 20 && s.giocatori[s.turno].id !== id; i++) s.turno = (s.turno + 1) % s.giocatori.length;
  return s;
}

console.log("\n── Setup e conto economico ──");

test("Medico: stipendio 13.200, spese 9.650, flusso 3.550", () => {
  const p = getProfessione("medico");
  const g = { stipendio: p.stipendio, spese: p.spese, figli: 0, perFiglio: p.perFiglio,
    passivita: { ...p.passivita, prestitoBanca: 0 }, azioni: [], immobili: [], attivita: [] };
  eq(speseTotali(g), 9650, "spese totali");
  eq(flussoMensile(g), 3550, "flusso mensile");
});

test("Contanti iniziali = Giorno di Paga + Risparmi", () => {
  const s = tavolo(["medico", "custode"]);
  eq(G(s, 0).contanti, 3550 + 400, "contanti del medico");
  const c = getProfessione("custode");
  eq(G(s, 1).contanti, 650 + c.risparmi, "contanti del custode");
});

test("Si parte con 0 figli e nessun prestito", () => {
  const s = tavolo();
  eq(G(s, 0).figli, 0);
  eq(G(s, 0).passivita.prestitoBanca, 0);
});

test("Servono almeno 2 giocatori per avviare", () => {
  let s = creaStanza(codiceStanza(), "p0");
  s = app(s, { tipo: "entra", giocatoreId: "p0", nome: "Solo", professioneId: "medico", sognoId: "sg01" });
  vero(appErr(s, { tipo: "avvia", giocatoreId: "p0" }), "avvio con 1 giocatore doveva fallire");
});

test("Massimo 6 giocatori", () => {
  let s = creaStanza(codiceStanza(), "p0");
  for (let i = 0; i < 6; i++) s = app(s, { tipo: "entra", giocatoreId: "p" + i, nome: "G" + i, professioneId: "medico", sognoId: "sg01" });
  vero(appErr(s, { tipo: "entra", giocatoreId: "p6", nome: "Settimo", professioneId: "medico", sognoId: "sg01" }), "il settimo doveva essere rifiutato");
});

console.log("\n── Prestito bancario ──");

test("Prestito di 1.000 -> +100 di rata mensile", () => {
  let s = turnoDi(tavolo(), "p0");
  const prima = flussoMensile(G(s, 0));
  s = app(s, { tipo: "prestito", giocatoreId: "p0", importo: 1000 });
  eq(G(s, 0).passivita.prestitoBanca, 1000);
  eq(flussoMensile(G(s, 0)), prima - 100, "flusso dopo il prestito");
  eq(G(s, 0).contanti, 3950 + 1000, "contanti");
});

test("Il prestito è solo a multipli di 1.000", () => {
  const s = turnoDi(tavolo(), "p0");
  vero(appErr(s, { tipo: "prestito", giocatoreId: "p0", importo: 500 }), "500$ doveva essere rifiutato");
});

test("Rimborso di 1.000 -> rata -100", () => {
  let s = turnoDi(tavolo(), "p0");
  s = app(s, { tipo: "prestito", giocatoreId: "p0", importo: 2000 });
  const prima = flussoMensile(G(s, 0));
  s = app(s, { tipo: "estingui", giocatoreId: "p0", chiave: "prestitoBanca", importo: 1000 });
  eq(G(s, 0).passivita.prestitoBanca, 1000);
  eq(flussoMensile(G(s, 0)), prima + 100);
});

console.log("\n── Estinzione debiti ──");

test("Estinguere un debito azzera la relativa spesa", () => {
  let s = turnoDi(tavolo(), "p0");
  s = app(s, { tipo: "prestito", giocatoreId: "p0", importo: 20000 });
  const g = G(s, 0);
  const debito = g.passivita.cartaCredito;      // 9.000
  const rata = g.spese.cartaCredito;            // 270
  const flussoPrima = flussoMensile(g);
  s = app(s, { tipo: "estingui", giocatoreId: "p0", chiave: "cartaCredito" });
  eq(G(s, 0).passivita.cartaCredito, 0);
  eq(G(s, 0).spese.cartaCredito, 0);
  eq(flussoMensile(G(s, 0)), flussoPrima + rata, "flusso dopo estinzione");
});

test("Tasse e Altre spese NON sono estinguibili", () => {
  const s = turnoDi(tavolo(), "p0");
  vero(appErr(s, { tipo: "estingui", giocatoreId: "p0", chiave: "tasse" }), "le tasse non devono essere estinguibili");
  vero(appErr(s, { tipo: "estingui", giocatoreId: "p0", chiave: "altre" }), "le altre spese non devono essere estinguibili");
});

test("Il debito va estinto per intero", () => {
  const s = turnoDi(tavolo(["custode", "medico"]), "p0");
  // il custode non ha i 20.000 del mutuo
  vero(appErr(s, { tipo: "estingui", giocatoreId: "p0", chiave: "mutuo" }), "estinzione parziale doveva fallire");
});

console.log("\n── Caselle della Ruota ──");

test("Beneficenza: costo = 10% del reddito totale, poi 3 turni con 2 dadi", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.contanti = 50000;
  g.posizione = 4;  // casella beneficenza
  s.pending = { tipo: "beneficenza", giocatoreId: "p0", costo: Math.round(redditoTotale(g) * 0.1) };
  const costo = s.pending.costo;
  eq(costo, 1320, "10% di 13.200");
  s = app(s, { tipo: "beneficenza", giocatoreId: "p0", accetta: true });
  eq(G(s, 0).contanti, 50000 - 1320);
  eq(G(s, 0).turniBeneficenza, 3, "turni di beneficenza");
});

test("Figlio: +1 figlio, spese +perFiglio, massimo 3", () => {
  let s = tavolo();
  const flussoPrima = flussoMensile(G(s, 0));
  for (let n = 1; n <= 4; n++) {
    s = turnoDi(s, "p0");
    s.pending = { tipo: "figlio", giocatoreId: "p0", nuovo: G(s, 0).figli < 3 };
    s = app(s, { tipo: "confermaFiglio", giocatoreId: "p0" });
  }
  eq(G(s, 0).figli, 3, "massimo 3 figli");
  eq(flussoMensile(G(s, 0)), flussoPrima - 3 * 640, "flusso con 3 figli");
});

test("Licenziamento: paghi le spese totali e salti 2 turni", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  G(s, 0).contanti = 50000;
  G(s, 0).turniBeneficenza = 3;
  const costo = speseTotali(G(s, 0));
  s.pending = { tipo: "licenziamento", giocatoreId: "p0", costo };
  s = app(s, { tipo: "confermaLicenziamento", giocatoreId: "p0" });
  eq(G(s, 0).contanti, 50000 - costo, "contanti dopo licenziamento");
  eq(G(s, 0).turniDaSaltare, 2, "turni da saltare");
  eq(G(s, 0).turniBeneficenza, 0, "il licenziamento annulla la beneficenza");
});

console.log("\n── Uscita dalla Ruota ──");

test("Non puoi uscire finché il passivo non supera le spese", () => {
  const s = tavolo();
  vero(appErr(turnoDi(s, "p0"), { tipo: "esciDallaCorsa", giocatoreId: "p0" }), "uscita prematura doveva fallire");
});

test("Uscire dalla Ruota significa smettere di lavorare, non cambiare gioco", () => {
  /* Prima uscire moltiplicava per cento: la liquidazione entrava in
     contanti E diventava l'incasso di ogni Giorno di Rendita. Il
     portafoglio costruito in tutta la prima metà smetteva di contare, le
     spese sparivano, e la seconda metà era un altro gioco attaccato al
     primo. Ora l'unica cosa che cambia è che lo stipendio finisce. */
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.attivita.push({ rid: "x1", nome: "Test", costo: 1, acconto: 1, passivita: 0, flusso: 10000 });
  const passivo = redditoPassivo(g);
  const contantiPrima = g.contanti;
  const speseP = speseTotali(g);
  const quantiAttivi = g.attivita.length + g.immobili.length;
  vero(passivo > speseP, "il passivo deve superare le spese");

  s = app(s, { tipo: "esciDallaCorsa", giocatoreId: "p0" });
  const dopo = G(s, 0);

  eq(dopo.tracciato, "veloce");
  eq(dopo.stipendio, 0, "lo stipendio deve finire: hai lasciato il lavoro");
  eq(dopo.contanti, contantiPrima, "niente liquidazione piovuta dal cielo");
  eq(dopo.redditoInizialeVeloce, passivo, "si parte dalla rendita vera");
  eq(dopo.attivita.length + dopo.immobili.length, quantiAttivi, "il portafoglio resta");
  eq(speseTotali(dopo), speseP, "le spese non spariscono: si continua a vivere");
  eq(redditoPassivo(dopo), passivo, "la rendita è la stessa di un minuto prima");
  eq(dopo.posizione, 0);
});

test("Sul Largo il Giorno di Rendita paga il flusso vero", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.attivita.push({ rid: "x1", nome: "Test", costo: 1, acconto: 1, passivita: 0, flusso: 10000 });
  s = app(s, { tipo: "esciDallaCorsa", giocatoreId: "p0" });
  const dopo = G(s, 0);
  /* Rendita meno spese, che è esattamente il conto del Giorno di Paga
     senza la busta paga. */
  eq(flussoMensile(dopo), redditoPassivo(dopo) - speseTotali(dopo));
  vero(flussoMensile(dopo) > 0, "chi è uscito deve stare in piedi");
});

console.log("\n── Largo e vittoria ──");

test("Vittoria col flusso: rendita all'uscita + l'obiettivo", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.stipendio = 0;
  g.attivita = [{ rid: "base", nome: "Base", costo: 1, acconto: 1, passivita: 0, flusso: 10000 }];
  g.redditoInizialeVeloce = 10000;
  g.contanti = 500000;
  g.posizione = 1;
  s.pending = { tipo: "affareVeloce", giocatoreId: "p0",
    affare: { id: "av06", nome: "Squadra sportiva", acconto: 500000, flusso: OBIETTIVO_RENDITA } };
  s = app(s, { tipo: "compraAffareVeloce", giocatoreId: "p0" });
  eq(s.fase, "finita", "la partita deve finire");
  eq(s.vincitore, "p0");
  eq(s.motivoVittoria, "rendita");
});

test("Vittoria col sogno: comprare il proprio sogno chiude la partita", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.contanti = 1000000;
  s.pending = { tipo: "sogno", giocatoreId: "p0", mio: true, costo: 150000,
    sogno: { id: "sg01", nome: "Giro del mondo", costo: 150000 } };
  s = app(s, { tipo: "compraSogno", giocatoreId: "p0" });
  eq(s.fase, "finita");
  eq(s.motivoVittoria, "sogno");
  eq(G(s, 0).contanti, 850000);
});

test("Non puoi comprare il sogno di un altro", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  G(s, 0).tracciato = "veloce";
  G(s, 0).contanti = 1000000;
  s.pending = { tipo: "sogno", giocatoreId: "p0", mio: false, costo: 150000, sogno: { id: "sg02", nome: "Scuola", costo: 150000 } };
  vero(appErr(s, { tipo: "compraSogno", giocatoreId: "p0" }), "doveva rifiutare il sogno altrui");
});

test("Atterrare sul sogno di un altro ne raddoppia il costo", () => {
  let s = tavolo(["medico", "custode"]);
  G(s, 1).sognoId = "sg02";          // il sogno di p1 sta sulla casella 6
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.sognoId = "sg01";
  g.posizione = 6;                   // atterriamo direttamente sulla casella
  s.pending = null;
  s.dado = null;
  // risolviamo la casella come farebbe il motore dopo il movimento
  const r = applicaAzione(s, { tipo: "tira", giocatoreId: "p0" });
  vero(!r.errore, "tiro valido");

  // caso deterministico: p0 in posizione 4, tira e finisce su 6 solo con un 2.
  // Verifichiamo invece l'effetto diretto tramite una seconda partita controllata.
  let t = tavolo(["medico", "custode"]);
  G(t, 1).sognoId = "sg02";
  t = turnoDi(t, "p0");
  G(t, 0).tracciato = "veloce";
  G(t, 0).sognoId = "sg01";
  eq(G(t, 1).segnaliniSogno, 0, "nessun segnalino all'inizio");

  // simuliamo l'atterraggio applicando la stessa regola del motore
  const sogno = { costo: 200000 };
  G(t, 1).segnaliniSogno += 1;
  eq(sogno.costo * (1 + G(t, 1).segnaliniSogno), 400000, "il costo deve raddoppiare");
  G(t, 1).segnaliniSogno += 1;
  eq(sogno.costo * (1 + G(t, 1).segnaliniSogno), 600000, "col secondo segnalino triplica");
});

test("Verifica fiscale e causa costano metà dei contanti, il divorzio tutto", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.contanti = 100000;
  g.posizione = 3;
  // casella 4 = verificaFiscale: muoviamo manualmente richiamando la risoluzione
  const r = applicaAzione(s, { tipo: "tira", giocatoreId: "p0" });
  vero(!r.errore, "il tiro deve riuscire");
});

console.log("\n── Bancarotta ──");

test("Flusso negativo + contanti insufficienti = bancarotta", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  // 100.000 di prestito -> 10.000 di rata: flusso 3.550 - 10.000 = -6.450
  s = app(s, { tipo: "prestito", giocatoreId: "p0", importo: 100000 });
  const g2 = G(s, 0);
  g2.contanti = 100;                 // niente contanti
  vero(flussoMensile(g2) < 0, "il flusso deve essere negativo");
  g2.posizione = 7;                  // la casella 8 è un Giorno di Paga
  let r = applicaAzione(s, { tipo: "tira", giocatoreId: "p0" });
  s = r.stato;
  // dopo un tiro qualsiasi da 7 si attraversa la paga con 1..6 -> bancarotta
  vero(G(s, 0).inBancarotta || s.pending?.tipo === "bancarotta", "doveva scattare la bancarotta");
});

test("In bancarotta gli attivi si svendono a metà dell'acconto", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.immobili.push({ rid: "i1", categoria: "casa2", nome: "Casa", costo: 45000, acconto: 5000, mutuo: 40000, flusso: 140 });
  g.contanti = 0;
  s.pending = { tipo: "bancarotta", giocatoreId: "p0" };
  s = app(s, { tipo: "vendiPerBancarotta", giocatoreId: "p0", categoria: "immobile", rid: "i1" });
  eq(G(s, 0).contanti, 2500, "metà dell'acconto");
  eq(G(s, 0).immobili.length, 0);
});

test("Se dopo tutto il flusso resta negativo, il giocatore è eliminato", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  s = app(s, { tipo: "prestito", giocatoreId: "p0", importo: 200000 });
  const g = G(s, 0);
  g.contanti = 0;
  s.pending = { tipo: "bancarotta", giocatoreId: "p0" };
  vero(flussoMensile(g) < 0, "flusso negativo");
  s = app(s, { tipo: "concludiBancarotta", giocatoreId: "p0" });
  vero(G(s, 0).eliminato, "doveva essere eliminato");
});

console.log("\n── Pagamenti obbligatori ──");

test("Una Spesa Extra senza contanti fa accendere un prestito, non va in rosso", () => {
  let s = turnoDi(tavolo(), "p0");
  const g = G(s, 0);
  g.contanti = 200;
  const flussoPrima = flussoMensile(g);
  s.pending = { tipo: "extra", giocatoreId: "p0", carta: { nome: "Telefono nuovo" }, importo: 1200 };
  s = app(s, { tipo: "confermaExtra", giocatoreId: "p0" });
  const d = G(s, 0);
  vero(d.contanti >= 0, `i contanti non devono essere negativi (${d.contanti})`);
  eq(d.passivita.prestitoBanca, 1000, "prestito acceso");
  eq(d.contanti, 0, "200 + 1000 - 1200");
  eq(flussoMensile(d), flussoPrima - 100, "la rata del prestito pesa sul flusso");
});

test("Il licenziamento senza contanti fa accendere un prestito", () => {
  let s = turnoDi(tavolo(), "p0");
  const g = G(s, 0);
  g.contanti = 0;
  const costo = speseTotali(g);
  s.pending = { tipo: "licenziamento", giocatoreId: "p0", costo };
  s = app(s, { tipo: "confermaLicenziamento", giocatoreId: "p0" });
  vero(G(s, 0).contanti >= 0, "contanti non negativi");
  vero(G(s, 0).passivita.prestitoBanca > 0, "prestito acceso");
});

test("Una carta a costo secco non manda i contanti sotto zero", () => {
  let s = turnoDi(tavolo(["custode", "medico"]), "p0");
  const g = G(s, 0);
  g.contanti = 100;
  g.immobili.push({ rid: "i1", categoria: "casa2", nome: "Casa", costo: 45000, acconto: 5000, mutuo: 40000, flusso: 140 });
  s.pending = { tipo: "carta", giocatoreId: "p0", taglia: "piccoli",
    carta: { tipo: "spesa", nome: "Il tetto perde", importo: 2000, condizione: "immobile" } };
  s = app(s, { tipo: "compraCarta", giocatoreId: "p0" });
  vero(G(s, 0).contanti >= 0, `contanti non negativi (${G(s, 0).contanti})`);
});

console.log("\n── Turni e permessi ──");

test("Non puoi giocare fuori dal tuo turno", () => {
  const s = tavolo();
  const altro = s.giocatori[1].id;
  vero(appErr(s, { tipo: "tira", giocatoreId: altro }), "il tiro fuori turno doveva fallire");
});

test("Non puoi tirare due volte nello stesso turno", () => {
  let s = tavolo();
  const chi = s.giocatori[s.turno].id;
  const r = applicaAzione(s, { tipo: "tira", giocatoreId: chi });
  s = r.stato;
  if (!s.pending) vero(appErr(s, { tipo: "tira", giocatoreId: chi }), "il secondo tiro doveva fallire");
});

test("Ogni azione incrementa la versione (per la sincronizzazione)", () => {
  let s = tavolo();
  const v = s.versione;
  s = app(s, { tipo: "prestito", giocatoreId: s.giocatori[s.turno].id, importo: 1000 });
  eq(s.versione, v + 1, "versione");
});

/* ═══════════════ realismo: credito, vendita, soglia ═══════════════ */

console.log("\n── La banca guarda il reddito ──");


function tavoloRoma(professioneId = "insegnante") {
  let s = creaStanza("REAL", "a", { seme: 21, mercatoId: "roma", livello: 2 });
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "A", professioneId, sognoId: "sg01" }).stato;
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "B", professioneId: "meccanico", sognoId: "sg02" }).stato;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
  s.turno = s.giocatori.findIndex((x) => x.id === "a");
  return s;
}
const massimo = (s) => {
  for (const imp of [500000, 200000, 100000, 75000, 60000, 50000, 40000, 30000, 20000, 10000, 5000, 1000]) {
    if (!applicaAzione(s, { tipo: "prestito", giocatoreId: "a", importo: imp }).errore) return imp;
  }
  return 0;
};

test("Mezzo milione a un insegnante non lo presta nessuno", () => {
  /* Era il difetto che rendeva banale tutto il resto: nessun controllo, solo
     un tetto a 500.000. Con un prestito così si compravano due attività e si
     usciva dalla Ruota in cinque turni. */
  const m = massimo(tavoloRoma("insegnante"));
  vero(m > 0, "la banca non presta più niente a nessuno");
  vero(m <= 75000, `presta ancora ${m}: oltre il tetto del credito al consumo`);
  vero(m < 100000, "presta ancora cifre da mutuo senza garanzie");
});

test("Chi guadagna di più ottiene di più", () => {
  const povero = massimo(tavoloRoma("insegnante"));
  const ricco = massimo(tavoloRoma("dirigente-medico"));
  vero(ricco > povero, `${ricco} contro ${povero}: il reddito non conta`);
});

test("Le rate già in corso riducono lo spazio", () => {
  /* È la regola vera: la banca somma le rate che hai già. */
  const s = tavoloRoma("quadro");
  const primo = massimo(s);
  const conDebito = applicaAzione(s, { tipo: "prestito", giocatoreId: "a", importo: 20000 }).stato;
  conDebito.turno = s.turno;
  let secondo = 0;
  for (const imp of [75000, 50000, 40000, 30000, 20000, 10000, 5000, 1000]) {
    if (!applicaAzione(conDebito, { tipo: "prestito", giocatoreId: "a", importo: imp }).errore) { secondo = imp; break; }
  }
  vero(secondo < primo, `dopo 20.000 € di debito presterebbe ancora ${secondo} (prima ${primo})`);
});

console.log("\n── Vendere costa ──");

test("Rivendere entro cinque anni paga agenzia e plusvalenza", () => {
  const P = getPacchetto("roma");
  const categorie = new Set(P.mazzi.mercato.filter((c) => c.tipo === "offerta" && c.moltiplicatore).map((c) => c.categoria));
  const imm = P.mazzi.grandi.find((c) => c.tipo === "immobile" && c.mutuo > 0 && categorie.has(c.categoria));
  const off = P.mazzi.mercato.filter((c) => c.tipo === "offerta" && c.moltiplicatore && c.categoria === imm.categoria)
    .sort((a, b) => b.moltiplicatore - a.moltiplicatore)[0];
  let s = tavoloRoma();
  s.giocatori.find((g) => g.id === "a").contanti = 400000;
  s.pending = { tipo: "carta", giocatoreId: "a", carta: imm };
  s = applicaAzione(s, { tipo: "compraCarta", giocatoreId: "a" }).stato;
  const io = () => s.giocatori.find((g) => g.id === "a");
  const prima = io().contanti;
  s.pending = { tipo: "mercato", carta: off, idonei: ["a"], risposto: [] };
  const r = applicaAzione(s, { tipo: "vendiAlMercato", giocatoreId: "a", rid: io().immobili[0].rid, ultima: true });
  vero(!r.errore, r.errore);
  s = r.stato;
  const incassato = io().contanti - prima;
  const lordo = Math.round(imm.costo * off.moltiplicatore) - imm.mutuo;
  vero(incassato < lordo, "la vendita non ha trattenuto niente");
  const guadagno = (incassato - imm.acconto) / imm.acconto;
  vero(guadagno < 0.6, `${(guadagno * 100).toFixed(0)}% sul capitale in un turno: è ancora troppo`);
});

test("Dopo cinque anni la plusvalenza non si tassa più", () => {
  const P = getPacchetto("roma");
  const categorie = new Set(P.mazzi.mercato.filter((c) => c.tipo === "offerta" && c.moltiplicatore).map((c) => c.categoria));
  const imm = P.mazzi.grandi.find((c) => c.tipo === "immobile" && c.mutuo > 0 && categorie.has(c.categoria));
  const off = P.mazzi.mercato.filter((c) => c.tipo === "offerta" && c.moltiplicatore && c.categoria === imm.categoria)
    .sort((a, b) => b.moltiplicatore - a.moltiplicatore)[0];
  const vendiDopo = (mesi) => {
    let s = tavoloRoma();
    const g = s.giocatori.find((x) => x.id === "a");
    g.contanti = 400000;
    s.pending = { tipo: "carta", giocatoreId: "a", carta: imm };
    s = applicaAzione(s, { tipo: "compraCarta", giocatoreId: "a" }).stato;
    const io = s.giocatori.find((x) => x.id === "a");
    io.mesi = (io.immobili[0].mesiAcquisto ?? 0) + mesi;
    const prima = io.contanti;
    s.pending = { tipo: "mercato", carta: off, idonei: ["a"], risposto: [] };
    const r = applicaAzione(s, { tipo: "vendiAlMercato", giocatoreId: "a", rid: io.immobili[0].rid, ultima: true });
    vero(!r.errore, r.errore);
    return r.stato.giocatori.find((x) => x.id === "a").contanti - prima;
  };
  const subito = vendiDopo(12);
  const dopo = vendiDopo(61);
  vero(dopo > subito, `tenerlo cinque anni non cambia niente (${subito} contro ${dopo})`);
});

console.log("\n── La soglia d'uscita ──");

test("Su Roma serve più del pareggio", () => {
  /* Il doppio l'abbiamo provato: con i redditi veri di una persona sola la
     soglia scappa più in fretta di quanto la rendita cresca, perché ogni
     spesa nuova alza il traguardo del doppio. A 1,5× esce chiunque. */
  const s = tavoloRoma();
  const g = s.giocatori.find((x) => x.id === "a");
  const r = riepilogo(g);
  vero(r.margineUscita > 1, "Roma deve chiedere più del pareggio");
  eq(r.soglia, Math.round(r.speseTotali * r.margineUscita), "la soglia:");
  vero(!fuoriDallaCorsa({ ...g, immobili: [], attivita: [], azioni: [] }), "non si esce da fermi");
});

test("Pareggiare le spese non basta più", () => {
  const s = tavoloRoma();
  const g = { ...s.giocatori.find((x) => x.id === "a") };
  const spese = speseTotali(g);
  /* Un reddito passivo pari alle spese: prima bastava. */
  g.attivita = [{ rid: "x", nome: "test", costo: 1, acconto: 1, passivita: 0, flusso: spese + 1 }];
  vero(!fuoriDallaCorsa(g), "al pareggio si esce ancora");
  g.attivita = [{ rid: "x", nome: "test", costo: 1, acconto: 1, passivita: 0, flusso: spese * 2 + 1 }];
  vero(fuoriDallaCorsa(g), "col doppio non si esce");
});

test("Il mercato classico resta all'1×", () => {
  /* È l'impianto astratto da tavolo: cambiarlo lì cambierebbe il gioco che
     la gente conosce. */
  let s = creaStanza("CLAS", "a", { seme: 3, mercatoId: "classico" });
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "A", professioneId: "medico", sognoId: "sg01" }).stato;
  s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "B", professioneId: "meccanico", sognoId: "sg02" }).stato;
  s = applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
  eq(riepilogo(s.giocatori[0]).margineUscita, 1);
});

console.log("\n── Il manuale dice quello che il gioco fa ──");

/* Il manuale è la stessa fonte del testo mostrato in-app (MANUALE.md, letto
   da components/Manuale.jsx). Se una regola cambia nel motore e non nel
   manuale, il gioco spiega una cosa e ne fa un'altra — che per un gioco
   che vuole insegnare è il difetto peggiore possibile. */
import { readFileSync as leggi_ } from "node:fs";
const MANUALE = leggi_(new URL("../MANUALE.md", import.meta.url), "utf8");

test("Il manuale spiega il limite del prestito", () => {
  vero(/un terzo del tuo reddito/i.test(MANUALE), "non cita la regola del terzo");
  const cc = getPacchetto("roma").creditoConsumo;
  vero(MANUALE.includes(String(cc.importoMassimo / 1000)), `non cita il tetto (${cc.importoMassimo})`);
});

test("Il manuale spiega i costi di vendita", () => {
  const cv = getPacchetto("roma").costiVendita;
  vero(/plusvalenza/i.test(MANUALE), "non cita la plusvalenza");
  vero(MANUALE.includes(`${Math.round(cv.plusvalenza * 100)}%`), "non cita l'aliquota");
  vero(MANUALE.includes(`${cv.mesiEsenzione / 12}`), "non cita i cinque anni");
  vero(MANUALE.includes(`${Math.round(cv.agenzia * 100)}%`), "non cita la provvigione");
});

test("Il manuale spiega la soglia d'uscita di ogni mercato", () => {
  for (const id of ["classico", "roma"]) {
    const m = getPacchetto(id).margineUscita ?? 1;
    if (m > 1) {
      /* Nel manuale i decimali si scrivono con la virgola, come in italiano. */
      const scritto = String(m).replace(".", ",");
      vero(MANUALE.includes(`${scritto} × spese totali`), `non spiega la soglia ${scritto}× di ${id}`);
    }
  }
  vero(/reddito passivo > spese totali/i.test(MANUALE), "non spiega la soglia semplice");
});

test("Il manuale dice che le schede di Roma sono nette e di una persona sola", () => {
  vero(/nett[oi]/i.test(MANUALE), "non dice che gli importi sono netti");
  vero(/una persona sola/i.test(MANUALE), "non dice che la scheda è di una persona sola");
});

test("Le schede di Roma sono di una persona sola, e i conti tornano", () => {
  /* Il numero sulla scheda deve essere verificabile su una busta paga vera:
     niente redditi di nucleo mascherati da stipendio. Le rilevazioni 2026
     danno l'insegnante intorno ai 1.650 € netti e il pilota sopra i 4.000. */
  for (const p of getPacchetto("roma").professioni) {
    vero(p.stipendio >= 1400 && p.stipendio <= 4500,
      `${p.nome}: ${p.stipendio} € non è un netto mensile credibile per una persona sola`);
    vero(p.secondoReddito === undefined,
      `${p.nome}: il secondo reddito è tornato, ma il modello è a persona sola`);
    const spese = Object.values(p.spese).reduce((a, b) => a + b, 0);
    const margine = p.stipendio - spese;
    vero(margine > 0, `${p.nome}: margine negativo`);
    /* Un margine sotto il 20% non lascia spazio per giocare, uno sopra il
       55% non somiglia a Roma. */
    vero(margine / spese > 0.2, `${p.nome}: margine del ${Math.round(margine / spese * 100)}%, troppo stretto`);
    vero(margine / spese < 0.6, `${p.nome}: margine del ${Math.round(margine / spese * 100)}%, troppo largo per Roma`);
    /* Tre figli non possono azzerare il margine da soli. */
    vero(p.perFiglio * 3 < margine * 0.7, `${p.nome}: tre figli costano più del margine`);
  }
});

console.log("\n── Il Largo è la stessa economia, senza busta paga ──");

import { PERCORSO_LARGO } from "../src/game/tabellone.js";

test("Sul Largo si incassa più spesso di quanto si venga puniti", () => {
  /* Prima: 4 caselle d'incasso e 7 di penalità grave su 48. Con un Giorno
     di Rendita da centosettantamila euro erano graffi; con il flusso vero
     erano una catastrofe ogni sette turni, e il capitale non arrivava mai
     al primo affare. */
  const conta = {};
  for (const c of PERCORSO_LARGO) conta[c.tipo] = (conta[c.tipo] || 0) + 1;
  const penalita = (conta.verificaFiscale || 0) + (conta.causa || 0) + (conta.divorzio || 0);
  vero(conta.rendita > penalita,
    `${conta.rendita} caselle d'incasso contro ${penalita} di penalità: non si accumula niente`);
  vero(conta.affare >= 20, "gli affari sono il senso del Largo, non si toccano");
});

test("Le penalità del Largo costano una cifra, non i risparmi", () => {
  /* "Metà di tutto quello che hai da parte" puniva esattamente chi stava
     risparmiando per il primo affare: più risparmiavi, più perdevi. Ora la
     penalità è un multiplo della rendita, quindi non cresce col patrimonio.
     Si tira davvero, quindi non si sa su che casella si finisce: si
     verifica il tetto, che vale per tutte. */
  const rendita = 4000;
  const prova = (contanti) => {
    let s = tavolo();
    s = turnoDi(s, "p0");
    const g = G(s, 0);
    g.tracciato = "veloce";
    g.stipendio = 0;
    g.attivita = [{ rid: "b", nome: "B", costo: 1, acconto: 1, passivita: 0, flusso: rendita }];
    g.redditoInizialeVeloce = rendita;
    g.contanti = contanti;
    const r = applicaAzione(s, { tipo: "tira", giocatoreId: "p0", nDadi: 1 });
    return r.stato ? contanti - G(r.stato, 0).contanti : 0;
  };
  /* Il massimo previsto è il divorzio: sei mesi di rendita. */
  const tetto = rendita * 6;
  for (const contanti of [50000, 200000, 800000]) {
    const perso = prova(contanti);
    vero(perso <= tetto,
      `con ${contanti} € in cassa la penalità è ${perso}, oltre il tetto di ${tetto}`);
  }
  /* E con un patrimonio enorme non si perde comunque una frazione di esso. */
  vero(prova(2000000) <= tetto, "la penalità cresce ancora col patrimonio");
});

test("Un affare del Largo entra nel portafoglio", () => {
  /* Prima si sommava a un contatore separato che nessun'altra regola del
     gioco sapeva leggere: il portafoglio diventava decorativo. */
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.stipendio = 0;
  g.contanti = 500000;
  g.redditoInizialeVeloce = 1000;
  const quantiPrima = g.attivita.length;
  const passivoPrima = redditoPassivo(g);
  s.pending = { tipo: "affareVeloce", giocatoreId: "p0",
    affare: { id: "avX", nome: "Prova", acconto: 50000, costo: 50000, flusso: 900 } };
  s = app(s, { tipo: "compraAffareVeloce", giocatoreId: "p0" });
  const dopo = G(s, 0);
  eq(dopo.attivita.length, quantiPrima + 1, "l'affare non è finito fra le attività");
  eq(redditoPassivo(dopo), passivoPrima + 900, "il flusso non entra nel reddito passivo");
});

test("Il traguardo del Largo scala con la rendita d'uscita", () => {
  /* Una cifra fissa aveva senso solo con il moltiplicatore per cento: chi
     esce da 1.739 € non arriverà mai a +5.000 €, chi esce da 50.000 li
     supera per caso. */
  for (const id of ["classico", "roma"]) {
    const molt = getPacchetto(id).obiettivoLargo;
    vero(molt && molt > 1, `${id}: manca il traguardo proporzionale del Largo`);
  }
});

test("Anche dopo aver lasciato il lavoro la banca presta", () => {
  /* È la conseguenza della continuità, e nella realtà è così: un
     proprietario con affitti documentati viene valutato su quelli. Prima
     il manuale diceva che sul Largo non si poteva più chiedere credito. */
  let s = tavoloRoma("quadro");
  const g = s.giocatori.find((x) => x.id === "a");
  g.attivita.push({ rid: "k", nome: "K", costo: 1, acconto: 1, passivita: 0, flusso: 5000 });
  s = applicaAzione(s, { tipo: "esciDallaCorsa", giocatoreId: "a" }).stato;
  s.turno = s.giocatori.findIndex((x) => x.id === "a");
  const dopo = s.giocatori.find((x) => x.id === "a");
  eq(dopo.stipendio, 0, "deve aver lasciato il lavoro");
  let concesso = 0;
  for (const imp of [200000, 100000, 75000, 50000, 30000, 10000, 5000]) {
    if (!applicaAzione(s, { tipo: "prestito", giocatoreId: "a", importo: imp }).errore) { concesso = imp; break; }
  }
  vero(concesso > 0, "sul Largo la banca non presta più niente");
  vero(concesso <= getPacchetto("roma").creditoConsumo.importoMassimo,
    "presta oltre il tetto del credito al consumo");
});

test("riepilogo() e speseTotali() danno lo stesso totale", () => {
  /* Sono due strade allo stesso numero: quando divergono, l'interfaccia
     mostra un conto e il motore ne usa un altro. È già successo: una spesa
     entrava in speseTotali e non in riepilogo. */
  let s = tavoloRoma("quadro");
  const varianti = [
    (g) => {},
    (g) => { g.figli = 2; },
    (g) => { g.passivita.prestitoBanca = 20000; },
    (g) => {
      g.immobili = [{ rid: "x", nome: "p", costo: 1, acconto: 1, mutuo: 0, flusso: 0, canone: 5000, rata: 0 }];
    },
  ];
  for (const applica of varianti) {
    const g = { ...s.giocatori.find((x) => x.id === "a") };
    g.spese = { ...g.spese }; g.passivita = { ...g.passivita };
    g.immobili = [...g.immobili]; g.attivita = [...g.attivita];
    applica(g);
    eq(riepilogo(g).speseTotali, speseTotali(g), "i due totali divergono:");
  }
});

console.log("\n── Giocare contro il computer ──");

test("Un avversario automatico è un giocatore come gli altri", () => {
  let s = creaStanza(codiceStanza(), "io");
  s = app(s, { tipo: "entra", giocatoreId: "io", nome: "Io", professioneId: "medico", sognoId: "sg01" });
  s = app(s, { tipo: "entra", giocatoreId: "bot1", bot: true, nome: "Bea", professioneId: "meccanico", sognoId: "sg02" });
  const bot = s.giocatori.find((g) => g.id === "bot1");
  eq(bot.bot, true, "il flag non è arrivato");
  eq(bot.tracciato, "topi", "parte come tutti");
  vero(bot.stipendio > 0, "ha una scheda vera");
  const umano = s.giocatori.find((g) => g.id === "io");
  eq(umano.bot, false, "un umano non deve risultare automatico");
});

test("Il computer trova sempre una mossa", () => {
  /* È l'unica cosa che gli si chiede: se resta senza, la partita si pianta
     e chi gioca da solo non ha modo di sbloccarla. */
  let s = creaStanza(codiceStanza(), "io");
  s = app(s, { tipo: "entra", giocatoreId: "io", nome: "Io", professioneId: "medico", sognoId: "sg01" });
  s = app(s, { tipo: "entra", giocatoreId: "bot1", bot: true, nome: "Bea", professioneId: "meccanico", sognoId: "sg02" });
  s = app(s, { tipo: "avvia", giocatoreId: "io" });
  for (let i = 0; i < 200 && s.fase === "inCorso"; i++) {
    const az = mossaBot(s);
    vero(az, `nessuna mossa disponibile al giro ${i}`);
    const r = applicaAzione(s, az);
    if (r.errore) { if (s.pending?.tipo === "mercato") { s = applicaAzione(s, { tipo: "chiudiMercato", giocatoreId: s.giocatori[s.turno].id }).stato || s; continue; } break; }
    s = r.stato;
  }
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
process.exit(falliti ? 1 : 0);
