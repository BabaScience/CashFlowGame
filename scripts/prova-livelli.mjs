/**
 * Verifiche dei livelli di realismo.
 *   node scripts/prova-livelli.mjs
 *
 * Il Livello 1 raccoglie imposte, condominio, manutenzione e sfitto in una
 * trattenuta unica; il Livello 2 le apre una per una. Deve valere una cosa
 * sola, ma deve valere sempre: **lo stesso immobile non può rendere di più
 * quando si mostrano le imposte**. Se accadesse, il gioco insegnerebbe il
 * contrario di quello che vuole insegnare.
 *
 * Qui si sorveglia anche il difetto che ci è già sfuggito una volta: le
 * carte scritte a mano (box e posti auto) non portavano un canone, quindi
 * al Livello 2 risultavano esenti da imposte. Un box si affitta e
 * l'affitto si tassa: l'esenzione era un difetto, non una scelta.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { creaStanza, applicaAzione } from "../src/game/motore.js";
import { getPacchetto, MERCATI } from "../src/game/mercati/indice.js";
import { LIVELLI, LIVELLO_PREDEFINITO, vociFlusso, flussoAlLivello, confrontoCanone } from "../src/game/regole/livelli.js";

let passati = 0, falliti = 0;
const prova = (nome, fn) => {
  try {
    const r = fn();
    /* Una prova asincrona qui passerebbe SEMPRE: `fn()` restituisce una
       promessa, nessuno l'aspetta, e le sue verifiche non vengono mai
       eseguite. È già successo — sette prove in sei file non controllavano
       più niente da settimane. Meglio rumore che silenzio. */
    if (r && typeof r.then === "function") {
      throw new Error("prova asincrona: questo banco è sincrono, le sue verifiche non verrebbero eseguite");
    }
    console.log("  ✅ " + nome); passati++;
  }
  catch (e) { console.log("  ❌ " + nome + "\n       " + e.message); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };
const eq = (a, b, m = "") => {
  if (a !== b) throw new Error(`${m} atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
};

const ROMA = getPacchetto("roma");
const affitti = ROMA.mazzi.piccoli.concat(ROMA.mazzi.grandi)
  .filter((c) => c.tipo === "immobile" && c.flusso > 0);

console.log("\n── I livelli ──");

prova("Sono dichiarati e ordinati", () => {
  vero(LIVELLI.length >= 2);
  for (let i = 1; i < LIVELLI.length; i++) vero(LIVELLI[i].id > LIVELLI[i - 1].id);
  vero(LIVELLI.some((l) => l.id === LIVELLO_PREDEFINITO));
});

prova("Ognuno si spiega da sé", () => {
  for (const l of LIVELLI) {
    vero(l.nome && l.sommario && l.descrizione, `livello ${l.id} incompleto`);
  }
});

console.log("\n── Mostrare le imposte non può far guadagnare di più ──");

prova("Ogni immobile in affitto rende meno al Livello 2", () => {
  vero(affitti.length >= 10, `solo ${affitti.length} immobili da verificare`);
  for (const c of affitti) {
    const l1 = flussoAlLivello(c, 1, ROMA.fisco);
    const l2 = flussoAlLivello(c, 2, ROMA.fisco);
    vero(l2 <= l1, `"${c.nome}": ${l1} al livello 1 ma ${l2} al livello 2`);
  }
});

prova("Nessun immobile in affitto è esente da imposte", () => {
  /* Il difetto già visto: senza canone sulla carta, il Livello 2 non aveva
     niente da tassare e il flusso restava identico. */
  const esenti = affitti.filter((c) => flussoAlLivello(c, 1, ROMA.fisco) === flussoAlLivello(c, 2, ROMA.fisco));
  vero(esenti.length === 0,
    `esenti: ${esenti.map((c) => c.nome).slice(0, 4).join(", ")}`);
});

prova("Ogni immobile in affitto porta canone e rata", () => {
  for (const c of affitti) {
    vero(c.canone > 0, `"${c.nome}" senza canone: il Livello 2 non può calcolare niente`);
    vero(c.rata >= 0, `"${c.nome}" senza rata`);
  }
});

prova("Terreni e attività non vengono tassati come affitti", () => {
  const terreni = ROMA.mazzi.piccoli.filter((c) => c.categoria === "terreno");
  for (const c of terreni) {
    eq(flussoAlLivello(c, 2, ROMA.fisco), c.flusso ?? 0, `"${c.nome}":`);
  }
});

console.log("\n── Le voci del Livello 2 ──");

prova("Ogni voce ha un nome leggibile e un segno sensato", () => {
  const c = affitti[0];
  const { voci } = vociFlusso(c, 2, ROMA.fisco);
  vero(voci.length >= 5, "il livello reale deve mostrare più di una trattenuta");
  eq(voci[0].chiave, "canone", "la prima voce è ciò che incassi:");
  vero(voci[0].importo > 0);
  for (const v of voci.slice(1)) {
    vero(v.nome && v.nome.length > 2, "voce senza nome");
    vero(v.importo <= 0, `"${v.nome}" dovrebbe essere una trattenuta`);
  }
});

prova("Le voci sommano esattamente al flusso", () => {
  for (const c of affitti.slice(0, 12)) {
    const r = vociFlusso(c, 2, ROMA.fisco);
    eq(r.voci.reduce((a, v) => a + v.importo, 0), r.flusso, `"${c.nome}":`);
  }
});

prova("Al Livello 1 la trattenuta è una sola", () => {
  const r = vociFlusso(affitti[0], 1, ROMA.fisco);
  eq(r.voci.filter((v) => v.importo < 0 && v.chiave !== "rata").length, 1);
});

console.log("\n── Canone libero contro canone concordato ──");

prova("Il confronto restituisce entrambe le strade", () => {
  const c = confrontoCanone(affitti[0], ROMA.fisco);
  vero(Number.isFinite(c.libero) && Number.isFinite(c.concordato));
  vero(["libero", "concordato"].includes(c.migliore));
});

prova("Non vince sempre la stessa strada", () => {
  /* Se una delle due vincesse sempre, non sarebbe una decisione ma una
     regola, e insegnarla come scelta sarebbe fuorviante. */
  const esiti = new Set(affitti.map((c) => confrontoCanone(c, ROMA.fisco).migliore));
  vero(esiti.size === 2, `vince sempre "${[...esiti][0]}": non è una vera scelta`);
});

console.log("\n── La stanza ──");

prova("La stanza registra il livello scelto", () => {
  for (const l of [1, 2]) {
    eq(creaStanza("AAAA", "h", { seme: 1, mercatoId: "roma", livello: l }).livello, l);
  }
});

prova("Un mercato senza fisco resta al livello base", () => {
  eq(creaStanza("BBBB", "h", { seme: 1, mercatoId: "classico", livello: 2 }).livello, LIVELLO_PREDEFINITO);
});

prova("All'acquisto vale il livello della stanza, non la carta", () => {
  const carta = affitti.find((c) => c.canone && c.acconto < 60000);
  const flussi = [1, 2].map((liv) => {
    let s = creaStanza("CCCC", "a", { seme: 3, mercatoId: "roma", livello: liv });
    s = applicaAzione(s, { tipo: "entra", giocatoreId: "a", nome: "A", professioneId: "quadro", sognoId: "sg01" }).stato;
    s = applicaAzione(s, { tipo: "entra", giocatoreId: "b", nome: "B", professioneId: "meccanico", sognoId: "sg02" }).stato;
    s = applicaAzione(s, { tipo: "avvia", giocatoreId: "a" }).stato;
    const chi = s.giocatori[s.turno];
    chi.contanti = 500000;
    s.pending = { tipo: "carta", giocatoreId: chi.id, carta };
    const r = applicaAzione(s, { tipo: "compraCarta", giocatoreId: chi.id });
    return r.stato.giocatori.find((g) => g.id === chi.id).immobili[0].flusso;
  });
  vero(flussi[1] < flussi[0], `livello 1 ${flussi[0]}, livello 2 ${flussi[1]}: dovrebbero differire`);
});

console.log("\n── Ogni mercato dichiara ciò che gli serve ──");

prova("Chi ha un fisco lo ha completo", () => {
  for (const m of MERCATI) {
    const p = getPacchetto(m.id);
    if (!p.fisco) continue;
    for (const k of ["quotaCostiL1", "cedolare", "cedolareConcordata", "imuAnnuaSuValore"]) {
      vero(typeof p.fisco[k] === "number", `${m.id}: manca fisco.${k}`);
    }
  }
});

console.log("\n── Dal modulo alla stanza ──");

prova("Il client passa il livello, e la firma non è andata fuori sincrono", () => {
  const api = readFileSync(new URL("../src/lib/api.js", import.meta.url), "utf8");
  const ingresso = readFileSync(new URL("../src/screens/Ingresso.jsx", import.meta.url), "utf8");
  const locale = readFileSync(new URL("../scripts/api-locale.js", import.meta.url), "utf8");
  const stanza = readFileSync(new URL("../api/room.js", import.meta.url), "utf8");

  const firma = api.match(/export const creaStanza = \(([^)]*)\)/)?.[1] || "";
  const attesi = firma.split(",").map((x) => x.trim()).filter(Boolean);
  vero(attesi.includes("livello"), "api.creaStanza deve accettare il livello");

  const chiamata = ingresso.match(/api\.creaStanza\(([^;]*?)\);/s)?.[1] || "";
  const passati_ = chiamata.split(",").length;
  vero(passati_ >= attesi.length,
    `Ingresso passa ${passati_} argomenti su ${attesi.length}: la firma è cresciuta e il chiamante è rimasto indietro`);
  vero(/livello/.test(chiamata), "Ingresso non passa il livello");

  for (const [nome, testo] of [["api-locale", locale], ["api/room", stanza]]) {
    vero(/livello/.test(testo), `${nome} non legge il livello dal corpo della richiesta`);
  }
});

prova("L'interfaccia non scrive a mano il tasso del prestito", () => {
  /* Mostrava "18.000 € costano 1.800 € al mese" anche su Roma, dove il
     fido costa l'1,2%: il consiglio era sbagliato di otto volte. Il tasso
     viaggia col giocatore, come lo stipendio. */
  const RADICE = new URL("..", import.meta.url).pathname;
  const file = (dir, out = []) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) file(p, out);
      else if (/\.jsx$/.test(p)) out.push(p);
    }
    return out;
  };
  const guai = [];
  for (const f of file(join(RADICE, "src"))) {
    const src = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
    for (const m of src.matchAll(/\b(?:prestito|prestitoUtile|importo)\s*\/\s*10\b/g)) {
      guai.push(`${relative(RADICE, f)}: "${m[0]}"`);
    }
  }
  if (guai.length) throw new Error(guai.join("\n       "));
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
