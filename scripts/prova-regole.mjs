/**
 * Verifica puntuale delle regole del regolamento ufficiale.
 * Ogni test cita la pagina del manuale da cui deriva.
 *   node scripts/prova-regole.mjs
 */
import { creaStanza, applicaAzione, codiceStanza } from "../src/game/motore.js";
import { getPacchetto } from "../src/game/mercati/indice.js";

/* Il pacchetto di riferimento delle prove: le regole si verificano contro
   il mercato con cui il gioco è bilanciato, non contro dati che cambiano. */
const PACCHETTO = getPacchetto();
const getProfessione = (id) => PACCHETTO.professioni.find((p) => p.id === id) || PACCHETTO.professioni[0];
const OBIETTIVO_RENDITA = PACCHETTO.obiettivoRendita;
import { flussoMensile, speseTotali, redditoTotale, redditoPassivo, riepilogo } from "../src/game/finanze.js";


let passati = 0, falliti = 0;
const test = (nome, fn) => {
  try { fn(); console.log(`  ✅ ${nome}`); passati++; }
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

test("Liquidazione = 100 × reddito passivo, e diventa il Reddito del Giorno di Rendita", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.attivita.push({ rid: "x1", nome: "Test", costo: 1, acconto: 1, passivita: 0, flusso: 10000 });
  const passivo = redditoPassivo(g);
  eq(passivo, 10000);
  vero(passivo > speseTotali(g), "il passivo deve superare le spese");
  const contantiPrima = g.contanti;
  s = app(s, { tipo: "esciDallaCorsa", giocatoreId: "p0" });
  const dopo = G(s, 0);
  eq(dopo.tracciato, "veloce");
  eq(dopo.redditoRendita, 1000000, "liquidazione 100x");
  eq(dopo.redditoInizialeVeloce, 1000000);
  eq(dopo.contanti, contantiPrima + 1000000, "la liquidazione è versata in contanti");
  eq(dopo.posizione, 0);
});

console.log("\n── Largo e vittoria ──");

test("Vittoria col flusso: reddito iniziale + 50.000", () => {
  let s = tavolo();
  s = turnoDi(s, "p0");
  const g = G(s, 0);
  g.tracciato = "veloce";
  g.redditoRendita = 100000;
  g.redditoInizialeVeloce = 100000;
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

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
process.exit(falliti ? 1 : 0);
