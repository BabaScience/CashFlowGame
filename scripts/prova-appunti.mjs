/**
 * Copiare negli appunti.
 *   node scripts/prova-appunti.mjs
 *
 * Vive in un file suo perché sostituisce `document` e `navigator` globali,
 * e farlo dentro il banco di prova delle schermate travolgeva React a metà
 * disegno.
 *
 * ═══ IL CASO CHE CONTA ═══
 *
 * `navigator.clipboard` esiste solo in contesto sicuro: HTTPS o localhost.
 * Aprendo il gioco dal telefono sulla rete di casa — http://192.168.x.x:5173,
 * che è il modo in cui lo si prova davvero prima di pubblicarlo — non
 * esiste proprio. Tre pulsanti lo chiamavano a mano dentro un try/catch
 * muto: il codice della stanza, l'invito nella sala d'attesa e la
 * condivisione del risultato della sfida. Su quel telefono non facevano
 * niente e non lo dicevano — e un pulsante che non fa niente in silenzio
 * fa sembrare rotto il gioco, non il permesso.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { copiaTesto } from "../src/lib/appunti.js";

const RADICE = new URL("..", import.meta.url).pathname;

let passati = 0, falliti = 0;
const prova = async (nome, fn) => {
  try { await fn(); console.log("  ✅ " + nome); passati++; }
  catch (e) { console.log("  ❌ " + nome + "\n       " + (e.message || e)); falliti++; }
};
const vero = (v, m) => { if (!v) throw new Error(m || "atteso vero"); };

/** Un `document` finto: quel poco che serve al ripiego. */
function documentoFinto(execRiesce) {
  const creati = [];
  globalThis.document = {
    createElement: () => {
      const el = { style: {}, value: "", setAttribute() {}, select() {}, setSelectionRange() {} };
      creati.push(el);
      return el;
    },
    body: { appendChild() {}, removeChild() {} },
    execCommand: () => execRiesce,
  };
  return creati;
}
/* In Node moderno `navigator` è un getter di sola lettura: si sostituisce
   ridefinendo la proprietà, non assegnandola. */
const fingiNavigator = (v) => {
  Object.defineProperty(globalThis, "navigator", {
    value: v, configurable: true, writable: true,
  });
};
const senzaApiAppunti = () => fingiNavigator({});

console.log("\n── Il ripiego ──");

await prova("Senza API degli appunti ripiega, invece di non fare niente", async () => {
  senzaApiAppunti();
  const creati = documentoFinto(true);
  vero(await copiaTesto("ABCD") === true, "il ripiego non ha funzionato");
  vero(creati.length === 1, "non ha creato il campo d'appoggio");
  vero(creati[0].value === "ABCD", `nel campo è finito "${creati[0].value}"`);
});

await prova("Il campo d'appoggio è fuori vista ma selezionabile", async () => {
  /* Con `display:none` non si può selezionare, e senza selezione non si
     copia niente: sarebbe un ripiego che non ripiega. */
  senzaApiAppunti();
  const creati = documentoFinto(true);
  await copiaTesto("ABCD");
  const st = creati[0].style;
  vero(st.display !== "none", "un campo nascosto così non si può selezionare");
  vero(st.position === "fixed", "deve stare fuori dal flusso, o la pagina salta");
});

await prova("Se non riesce lo dice, invece di fingere", async () => {
  senzaApiAppunti();
  documentoFinto(false);
  vero(await copiaTesto("ABCD") === false, "un fallimento non deve risultare riuscito");
});

await prova("Quando l'API c'è, si usa quella", async () => {
  let visto = null;
  fingiNavigator({ clipboard: { writeText: async (t) => { visto = t; } } });
  documentoFinto(false); // il ripiego fallirebbe: non deve servire
  vero(await copiaTesto("WXYZ") === true, "non ha usato l'API");
  vero(visto === "WXYZ", "il testo non è arrivato all'API");
});

await prova("Se l'API rifiuta, il ripiego la recupera", async () => {
  /* Succede davvero: il permesso può essere negato anche in HTTPS. */
  fingiNavigator({ clipboard: { writeText: async () => { throw new Error("negato"); } } });
  const creati = documentoFinto(true);
  vero(await copiaTesto("ABCD") === true, "un rifiuto dell'API non deve essere definitivo");
  vero(creati[0].value === "ABCD");
});

console.log("\n── Nessuno lo fa più a mano ──");

await prova("Nessun componente chiama gli appunti senza ripiego", () => {
  const file = (function raccogli(dir, out = []) {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) raccogli(p, out);
      else if (/\.(jsx?|mjs)$/.test(p)) out.push(p);
    }
    return out;
  })(join(RADICE, "src"));

  const guai = [];
  for (const f of file) {
    if (/lib\/appunti\.js$/.test(f)) continue;
    const src = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
    if (/navigator\.clipboard/.test(src)) guai.push(relative(RADICE, f));
  }
  if (guai.length) throw new Error("usano gli appunti senza ripiego: " + guai.join(", "));
});

console.log(`\n${passati} test superati, ${falliti} falliti\n`);
if (falliti) process.exit(1);
