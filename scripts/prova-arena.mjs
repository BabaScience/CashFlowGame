/**
 * Verifiche dell'arena: formato Lampo, valutazione fra persone, rivincita.
 *   node scripts/prova-arena.mjs
 *
 * Il difetto che questi test inseguono non è "l'Elo è sbagliato di due
 * punti": è che la classifica misuri la cosa sbagliata senza dirlo. Un
 * punteggio che sale sempre, o che si può gonfiare battendo un computer,
 * smette di significare qualcosa e nessuno se ne accorge finché non è
 * tardi — è già successo con la valutazione della sfida in solitaria.
 */
import {
  valutazioniDopo, partitaValida, ordineFinale, attesa, passoDi,
  chiaveCoda, formatoValido, inClassifica, PARTITE_PER_CLASSIFICA,
  VALUTAZIONE_ARENA_INIZIALE, PASSO_ARENA, PASSO_ESORDIENTE,
} from "../src/game/arena.js";
import { creaStanza, codiceStanza, applicaAzione, limiteTurni, fermoDa, TURNI_LAMPO, ATTESA_MASSIMA_MS } from "../src/game/motore.js";
import { statoRivincita, puoChiederla } from "../api/_lib/rivincita.js";
import { mossaBot } from "../src/game/avversario.js";
import { getPacchetto } from "../src/game/mercati/indice.js";
import { PERCORSO_LARGO, N_LARGO } from "../src/game/tabellone.js";
import { mesiAlSogno } from "../src/game/tempo.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le sue verifiche non verrebbero eseguite");
    }
    console.log("  ✅ " + nome); passati++;
  } catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Un tavolo pronto, con i giocatori chiesti. */
function tavolo({ formato = "lunga", quanti = 2, bot = [], mercatoId = "roma", seme = 7 } = {}) {
  let s = creaStanza(codiceStanza(), "g0", { mercatoId, seme, formato });
  const p = getPacchetto(mercatoId);
  for (let i = 0; i < quanti; i++) {
    const r = applicaAzione(s, {
      tipo: "entra", giocatoreId: `g${i}`, bot: bot.includes(i),
      nome: `G${i}`, professioneId: p.professioni[i % p.professioni.length].id,
      sognoId: p.sogni[i % p.sogni.length].id,
    });
    if (r.errore) throw new Error(r.errore);
    s = r.stato;
  }
  return applicaAzione(s, { tipo: "avvia", giocatoreId: "g0" }).stato;
}

/** Gioca fino in fondo con l'avversario automatico. */
function finoInFondo(s, massimo = 30000) {
  let n = 0;
  while (s.fase === "inCorso" && n < massimo) {
    const az = mossaBot(s);
    if (!az) break;
    const r = applicaAzione(s, az);
    if (r.errore) break;
    s = r.stato; n++;
  }
  return s;
}

console.log("\n── Il formato Lampo ──");

prova("Il Lampo mette un tetto ai turni, la Lunga no", () => {
  const lampo = tavolo({ formato: "lampo" });
  const lunga = tavolo({ formato: "lunga" });
  eq(lampo.formato, "lampo");
  eq(lampo.turniPerGiocatore, TURNI_LAMPO, "turni a testa:");
  eq(limiteTurni(lampo), TURNI_LAMPO * 2, "il tetto conta i turni di tutti:");
  eq(lunga.turniPerGiocatore, 0, "la Lunga non deve avere un tetto proprio:");
  vero(limiteTurni(lunga) > limiteTurni(lampo), "la Lunga deve durare di più");
});

prova("Il tetto segue quanti sono davvero al tavolo", () => {
  /* In sala d'attesa la gente entra ed esce: "quaranta a testa" deve
     valere per quanti si siedono, non per quanti c'erano al momento della
     creazione. */
  eq(limiteTurni(tavolo({ formato: "lampo", quanti: 2 })), TURNI_LAMPO * 2);
  eq(limiteTurni(tavolo({ formato: "lampo", quanti: 4 })), TURNI_LAMPO * 4);
});

prova("Una partita Lampo finisce davvero, e finisce a tempo", () => {
  const fine = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [0, 1] }));
  eq(fine.fase, "finita", "non è finita:");
  eq(fine.motivoVittoria, "tempo", "il Lampo deve finire allo scadere dei turni:");
  vero(fine.numeroTurno <= TURNI_LAMPO * 2, `ha superato il tetto: ${fine.numeroTurno}`);
  vero(fine.vincitore, "nessun vincitore");
});

prova("Il Lampo dura una frazione della partita lunga", () => {
  /* È il punto di tutta la cosa: se dura uguale, non serve a niente. */
  const conta = (s0) => {
    let s = s0, n = 0;
    while (s.fase === "inCorso" && n < 30000) {
      const az = mossaBot(s); if (!az) break;
      const r = applicaAzione(s, az); if (r.errore) break;
      s = r.stato; n++;
    }
    return n;
  };
  const breve = conta(tavolo({ formato: "lampo", quanti: 2, bot: [0, 1], seme: 11 }));
  const lunga = conta(tavolo({ formato: "lunga", quanti: 2, bot: [0, 1], seme: 11 }));
  vero(breve * 3 < lunga, `Lampo ${breve} azioni contro Lunga ${lunga}: non è abbastanza corto`);
});

prova("Un formato sconosciuto diventa la partita lunga", () => {
  eq(formatoValido("boh"), "lunga");
  eq(formatoValido(undefined), "lunga");
  eq(formatoValido("lampo"), "lampo");
});

console.log("\n── La coda ──");

prova("Si appaia solo chi gioca allo stesso gioco", () => {
  const a = { mercatoId: "roma", formato: "lampo", livello: 1 };
  eq(chiaveCoda(a), chiaveCoda({ ...a }), "due identici devono avere la stessa chiave:");
  vero(chiaveCoda(a) !== chiaveCoda({ ...a, mercatoId: "classico" }), "mercati diversi, stessa chiave");
  vero(chiaveCoda(a) !== chiaveCoda({ ...a, formato: "lunga" }), "formati diversi, stessa chiave");
  vero(chiaveCoda(a) !== chiaveCoda({ ...a, livello: 2 }), "livelli diversi, stessa chiave");
});

console.log("\n── La valutazione fra persone ──");

prova("Chi vince sale, chi perde scende, e la somma resta zero", () => {
  const [a, b] = valutazioniDopo([
    { id: "a", valutazione: 1000, partite: 30, posizione: 1 },
    { id: "b", valutazione: 1000, partite: 30, posizione: 2 },
  ]);
  vero(a.variazione > 0, "il vincitore non è salito");
  vero(b.variazione < 0, "il perdente non è sceso");
  eq(a.variazione + b.variazione, 0, "fra pari la somma deve essere zero:");
});

prova("Battere uno più forte vale di più che batterne uno più debole", () => {
  const contro = (loro) => valutazioniDopo([
    { id: "io", valutazione: 1000, partite: 30, posizione: 1 },
    { id: "lui", valutazione: loro, partite: 30, posizione: 2 },
  ])[0].variazione;
  vero(contro(1400) > contro(1000), "battere un più forte deve valere di più");
  vero(contro(1000) > contro(600), "battere un più debole deve valere di meno");
});

prova("Chi comincia si muove più in fretta", () => {
  const con = (partite) => valutazioniDopo([
    { id: "a", valutazione: 1000, partite, posizione: 1 },
    { id: "b", valutazione: 1000, partite: 50, posizione: 2 },
  ])[0].variazione;
  vero(con(0) > con(50), "un esordiente deve muoversi di più di un veterano");
  eq(passoDi(0), PASSO_ESORDIENTE);
  eq(passoDi(50), PASSO_ARENA);
});

prova("La probabilità attesa è simmetrica e sensata", () => {
  eq(Math.round(attesa(1000, 1000) * 100), 50, "fra pari:");
  vero(attesa(1400, 1000) > 0.9, "quattrocento punti sopra dovrebbe vincere quasi sempre");
  vero(Math.abs(attesa(1200, 900) + attesa(900, 1200) - 1) < 1e-9, "le due attese devono sommare a uno");
});

prova("La valutazione non scende sotto il pavimento", () => {
  const [a] = valutazioniDopo([
    { id: "a", valutazione: 100, partite: 0, posizione: 2 },
    { id: "b", valutazione: 2000, partite: 200, posizione: 1 },
  ]);
  vero(a.dopo >= 100, `è scesa a ${a.dopo}`);
});

prova("Un pari merito non muove niente fra i due", () => {
  const r = valutazioniDopo([
    { id: "a", valutazione: 1000, partite: 30, posizione: 1 },
    { id: "b", valutazione: 1000, partite: 30, posizione: 1 },
  ]);
  eq(r[0].variazione, 0);
  eq(r[1].variazione, 0);
});

prova("A tre giocatori chi arriva primo sale più di chi arriva secondo", () => {
  const r = valutazioniDopo([
    { id: "a", valutazione: 1000, partite: 30, posizione: 1 },
    { id: "b", valutazione: 1000, partite: 30, posizione: 2 },
    { id: "c", valutazione: 1000, partite: 30, posizione: 3 },
  ]);
  vero(r[0].variazione > r[1].variazione, "il primo deve salire più del secondo");
  vero(r[1].variazione > r[2].variazione, "il secondo deve fare meglio del terzo");
  eq(r[0].variazione + r[1].variazione + r[2].variazione, 0, "la somma deve restare zero:");
});

console.log("\n── Che cosa conta per la classifica ──");

prova("Una partita contro il computer non conta", () => {
  /* Se contasse, la classifica la vincerebbe chi ha più pazienza di
     battere un bot, e smetterebbe di dire qualcosa sul giocare. */
  const s = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [1] }));
  eq(s.fase, "finita", "la partita non è finita:");
  eq(partitaValida(s), false, "una partita con un bot non deve contare");
});

prova("Una partita fra persone conta, ma solo se è finita", () => {
  const viva = tavolo({ formato: "lampo", quanti: 2 });
  eq(partitaValida(viva), false, "una partita in corso non deve contare");
  const finita = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [] }));
  eq(finita.fase, "finita");
  eq(partitaValida(finita), true, "una partita finita fra persone deve contare");
});

prova("L'ordine finale mette il vincitore primo e gli eliminati ultimi", () => {
  const stato = {
    vincitore: "b",
    giocatori: [
      { id: "a", nome: "A", eliminato: false },
      { id: "b", nome: "B", eliminato: false },
      { id: "c", nome: "C", eliminato: true },
      { id: "z", nome: "Bot", bot: true, eliminato: false },
    ],
  };
  const progresso = { a: 0.8, b: 0.4, c: 0.9 };
  const ordine = ordineFinale(stato, (g) => progresso[g.id]);
  eq(ordine.length, 3, "i bot non entrano in classifica:");
  eq(ordine[0].id, "b", "il vincitore deve essere primo:");
  eq(ordine[1].id, "a", "poi chi è più avanti:");
  eq(ordine[2].id, "c", "l'eliminato va in fondo anche se era avanti:");
  eq(ordine[0].posizione, 1);
  eq(ordine[2].posizione, 3);
});

prova("Chi ha lo stesso progresso arriva pari merito", () => {
  const stato = {
    vincitore: null,
    giocatori: [{ id: "a", nome: "A" }, { id: "b", nome: "B" }],
  };
  const ordine = ordineFinale(stato, () => 0.5);
  eq(ordine[0].posizione, 1);
  eq(ordine[1].posizione, 1, "stesso progresso, stessa posizione:");
});

prova("Chi non ha mai giocato parte dal valore dichiarato", () => {
  eq(VALUTAZIONE_ARENA_INIZIALE, 1000);
});

prova("Si entra in classifica solo dopo qualche partita", () => {
  /* Con una partita sola chi vince per fortuna si ritrova primo, e una
     classifica in cui il primo posto si prende col caso non la guarda
     nessuno una seconda volta. */
  eq(PARTITE_PER_CLASSIFICA, 3);
  eq(inClassifica(0), false);
  eq(inClassifica(2), false);
  eq(inClassifica(3), true);
  eq(inClassifica(undefined), false, "chi non ha mai giocato:");
});

console.log("\n── Il secondo tempo, spento ma in ordine ──");

prova("I mercati pubblicati non hanno un secondo tempo", () => {
  /* Misurato: col Largo acceso due partite su trenta si vincevano e
     ventotto scadevano, e chi usciva dalla Ruota ci arrivava con meno
     soldi al mese di prima. Resta nel codice, spento. */
  for (const id of ["roma", "classico"]) {
    eq(getPacchetto(id).secondoTempo, false, id + ":");
  }
});

prova("I Giorni di Rendita del Largo sono distribuiti uniformemente", () => {
  /* Stavano a 0, 12, 24, 36, 40, 42, 44, 46: carestia per tre quarti del
     giro, poi quattro incassi in otto caselle. Si vedeva nel registro,
     ed è così che l'ho trovato. */
  const r = PERCORSO_LARGO.map((c, i) => (c.tipo === "rendita" ? i : null)).filter((x) => x !== null);
  eq(r.length, 8, "quanti Giorni di Rendita:");
  const distanze = r.map((x, i) => (i ? x - r[i - 1] : x + N_LARGO - r[r.length - 1]));
  const min = Math.min(...distanze), max = Math.max(...distanze);
  vero(max - min <= 1, `distanze da ${min} a ${max}: non sono uniformi`);
});

prova("Nel Largo non c'è un tratto lungo senza affari", () => {
  /* Le ultime otto caselle erano un blocco di rendite e sogni: chi ci
     capitava non poteva comprare niente per un giro intero. */
  let peggio = 0, corrente = 0;
  for (let i = 0; i < N_LARGO * 2; i++) {
    if (PERCORSO_LARGO[i % N_LARGO].tipo === "affare") corrente = 0;
    else { corrente++; peggio = Math.max(peggio, corrente); }
  }
  vero(peggio <= 4, `si sta fino a ${peggio} caselle senza poter comprare niente`);
});

prova("Ogni affare del Largo compare una volta sola", () => {
  const rif = PERCORSO_LARGO.filter((c) => c.tipo === "affare").map((c) => c.rif);
  eq(new Set(rif).size, rif.length, "ci sono affari ripetuti sul tabellone:");
  eq(rif.length, getPacchetto("roma").affariLargo.length, "affari sul tabellone contro affari nel mazzo:");
});

console.log("\n── Il sogno, che si misura invece di comprarsi ──");

prova("Il sogno si misura in mesi di rendita", () => {
  /* Non si compra quasi mai: costa da 70.000 a mezzo milione e il picco di
     contanti nella Ruota sta sui 46.000. Dirlo in mesi è l'unica cosa
     onesta, ed è l'unità che il gioco usa per tutto il resto. */
  eq(mesiAlSogno(90000, 3000), 30);
  eq(mesiAlSogno(90000, 4000), 23, "si arrotonda per eccesso:");
  eq(mesiAlSogno(90000, 0), null, "senza rendita la distanza non è un numero:");
  eq(mesiAlSogno(90000, -500), null, "con la rendita sotto le spese nemmeno:");
  eq(mesiAlSogno(0, 3000), null, "un sogno che non costa niente non ha distanza:");
});

console.log("\n── Chi chiude la scheda e non torna ──");

/** Sposta indietro l'ultima riga del registro, per simulare l'attesa. */
const invecchia = (s, ms) => ({ ...s, registro: s.registro.map((r, i) => (i === 0 ? { ...r, t: r.t - ms } : r)) });

prova("Non si mette fuori nessuno prima del tempo", () => {
  const s = tavolo({ quanti: 2 });
  const chi = s.giocatori[s.turno].id;
  const altro = s.giocatori.find((g) => g.id !== chi).id;
  const r = applicaAzione(s, { tipo: "fuoriTempo", giocatoreId: altro });
  vero(r.errore, "avrebbe dovuto rifiutare: non è passato tempo");
});

prova("Passato il tempo, chi resta può andare avanti", () => {
  const s = invecchia(tavolo({ quanti: 3 }), ATTESA_MASSIMA_MS + 1000);
  vero(fermoDa(s) >= ATTESA_MASSIMA_MS, "l'invecchiamento non ha funzionato");
  const fermo = s.giocatori[s.turno].id;
  const altro = s.giocatori.find((g) => g.id !== fermo).id;
  const r = applicaAzione(s, { tipo: "fuoriTempo", giocatoreId: altro });
  vero(!r.errore, r.errore);
  eq(r.stato.giocatori.find((g) => g.id === fermo).eliminato, true, "il fermo non è uscito:");
  eq(r.stato.fase, "inCorso", "in tre la partita continua:");
  vero(r.stato.giocatori[r.stato.turno].id !== fermo, "il turno è rimasto sul giocatore uscito");
});

prova("In due, chi resta vince", () => {
  const s = invecchia(tavolo({ quanti: 2 }), ATTESA_MASSIMA_MS + 1000);
  const fermo = s.giocatori[s.turno].id;
  const altro = s.giocatori.find((g) => g.id !== fermo).id;
  const r = applicaAzione(s, { tipo: "fuoriTempo", giocatoreId: altro });
  vero(!r.errore, r.errore);
  eq(r.stato.fase, "finita", "la partita doveva finire:");
  eq(r.stato.vincitore, altro, "vince chi è rimasto:");
  eq(r.stato.motivoVittoria, "ultimo");
});

prova("Non ci si mette fuori da soli", () => {
  const s = invecchia(tavolo({ quanti: 2 }), ATTESA_MASSIMA_MS + 1000);
  const fermo = s.giocatori[s.turno].id;
  vero(applicaAzione(s, { tipo: "fuoriTempo", giocatoreId: fermo }).errore,
    "avrebbe dovuto rifiutare");
});

prova("Chi non è al tavolo non mette fuori nessuno", () => {
  const s = invecchia(tavolo({ quanti: 2 }), ATTESA_MASSIMA_MS + 1000);
  vero(applicaAzione(s, { tipo: "fuoriTempo", giocatoreId: "passante" }).errore,
    "avrebbe dovuto rifiutare");
});

prova("Abbandonare in due chiude la partita invece di lasciarla appesa", () => {
  /* C'era da prima: il controllo \"è rimasto uno solo\" stava dentro il ramo
     della bancarotta, quindi chi premeva esci lasciava l'avversario in una
     partita che non finiva più. */
  const s = tavolo({ quanti: 2 });
  const chi = s.giocatori[0].id, altro = s.giocatori[1].id;
  const r = applicaAzione(s, { tipo: "esci", giocatoreId: chi });
  vero(!r.errore, r.errore);
  eq(r.stato.fase, "finita", "la partita doveva finire:");
  eq(r.stato.vincitore, altro, "vince chi è rimasto:");
});

console.log("\n── La rivincita ──");

prova("La rivincita rimette gli stessi al tavolo, e parte già avviata", () => {
  const finita = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [1] }));
  const r = statoRivincita(finita, "ZZZZ", "g0");
  vero(!r.errore, r.errore);
  eq(r.stato.fase, "inCorso", "deve partire già avviata:");
  eq(r.stato.giocatori.length, 2, "stessi giocatori:");
  eq(r.stato.formato, "lampo", "stesso formato:");
  eq(r.stato.mercatoId, finita.mercatoId, "stesso mercato:");
  eq(r.stato.hostId, "g0", "chi la chiede è l'host:");
  vero(r.stato.giocatori.some((g) => g.id === "g0" && !g.bot), "chi la chiede deve essere al tavolo");
  vero(r.stato.giocatori.some((g) => g.id === "g1" && g.bot), "il computer resta il computer");
  vero(r.stato.codice !== finita.codice, "deve essere una stanza nuova");
});

prova("Nella rivincita l'ordine di gioco si ritira", () => {
  /* Chi preme il pulsante non deve comprarsi il primo turno: l'ordine lo
     decidono i dadi, come in qualunque altra partita. */
  const finita = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [1] }));
  const primi = new Set();
  for (let i = 0; i < 40; i++) {
    const r = statoRivincita({ ...finita, seme: (finita.seme + i * 7919) >>> 0 }, "ZZZZ", "g0");
    if (!r.errore) primi.add(r.stato.giocatori[r.stato.turno].id);
  }
  vero(primi.size > 1, "comincia sempre lo stesso: l'ordine non si sta ritirando");
});

prova("Non si chiede la rivincita di una partita in corso", () => {
  const viva = tavolo({ quanti: 2 });
  vero(statoRivincita(viva, "ZZZZ", "g0").errore, "avrebbe dovuto rifiutare");
});

prova("Non la chiede chi non ha giocato", () => {
  const finita = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [1] }));
  vero(statoRivincita(finita, "ZZZZ", "passante").errore, "avrebbe dovuto rifiutare uno di fuori");
});

prova("Il permesso si può chiedere senza costruire niente", () => {
  /* Serve così: l'API deve poterlo controllare PRIMA di restituire il
     codice di una rivincita che qualcun altro ha già aperto. Senza questo
     chiunque conoscesse il codice di una partita finita si faceva dare il
     codice della rivincita — e poteva sedersi a un tavolo di due persone
     che non lo avevano invitato. Successo davvero, in produzione. */
  const finita = finoInFondo(tavolo({ formato: "lampo", quanti: 2, bot: [1] }));
  vero(!puoChiederla(finita, "g0").errore, "chi ha giocato deve poterla chiedere");
  vero(puoChiederla(finita, "passante").errore, "un estraneo no");
  vero(puoChiederla(finita, "g1").errore, "e nemmeno il computer");
  vero(puoChiederla(tavolo({ quanti: 2 }), "g0").errore, "non a partita in corso");
  vero(puoChiederla(null, "g0").errore, "non su una stanza che non c'è");
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
