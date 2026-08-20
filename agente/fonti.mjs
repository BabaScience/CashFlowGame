/**
 * LE FONTI DELL'AGENTE.
 *
 * Solo dati pubblici e riutilizzabili. Non si estrae niente dai portali di
 * annunci: le loro condizioni d'uso non lo permettono per un prodotto
 * commerciale, e comunque pubblicano prezzi RICHIESTI, non prezzi di
 * compravendita. Un gioco che dice "dati reali" e li prende dalle
 * inserzioni starebbe mentendo due volte.
 *
 * Ogni fonte restituisce sempre la stessa forma:
 *   { ok, valore, unita, periodo, fonte, url, nota }
 * e non lancia mai: se la rete cade, l'agente lo scrive nel rapporto e
 * l'essere umano decide. Un aggiornamento dei dati non è un'emergenza.
 */

const TIMEOUT_MS = 25000;

async function prendi(url, intestazioni = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json", ...intestazioni } });
    if (!r.ok) return { ok: false, errore: `HTTP ${r.status}` };
    return { ok: true, dati: await r.json() };
  } catch (e) {
    return { ok: false, errore: e.name === "AbortError" ? "tempo scaduto" : e.message };
  } finally {
    clearTimeout(t);
  }
}

/* ═══════════ fonti che funzionano davvero ═══════════ */

/**
 * BCE — tasso sui nuovi mutui alle famiglie per acquisto abitazione.
 * È il TASSO, non il TAEG: il TAEG comprende anche i costi accessori ed è
 * di norma qualche decimo più alto. L'agente lo segnala, non lo confonde.
 */
export async function tassoMutuiBCE(paese = "IT") {
  const url = `https://data-api.ecb.europa.eu/service/data/MIR/M.${paese}.B.A2C.A.R.A.2250.EUR.N?lastNObservations=6&format=jsondata`;
  const r = await prendi(url);
  if (!r.ok) return { ok: false, errore: r.errore, fonte: "BCE", url };

  try {
    const periodi = r.dati.structure.dimensions.observation[0].values.map((v) => v.name);
    const serie = Object.values(r.dati.dataSets[0].series)[0].observations;
    const voci = Object.entries(serie)
      .map(([i, o]) => ({ periodo: periodi[Number(i)], valore: o[0] }))
      .filter((v) => typeof v.valore === "number")
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
    const ultimo = voci.at(-1);
    return {
      ok: true,
      valore: ultimo.valore / 100,
      unita: "tasso annuo",
      periodo: ultimo.periodo,
      storico: voci,
      fonte: "BCE — statistiche sui tassi bancari (MIR)",
      url,
      nota: "Tasso, non TAEG: il TAEG comprende i costi accessori ed è di norma più alto di qualche decimo.",
    };
  } catch (e) {
    return { ok: false, errore: "risposta non nel formato atteso: " + e.message, fonte: "BCE", url };
  }
}

/**
 * Eurostat — indice dei prezzi delle abitazioni.
 * Serve a misurare la DERIVA, non a fissare i prezzi: dice di quanto si è
 * mosso il mercato dall'ultima volta, e quindi se vale la pena rifare i
 * conti. I livelli restano quelli delle quotazioni per zona.
 */
export async function indicePrezziCaseEurostat(paese = "IT") {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?format=JSON&geo=${paese}&lang=EN&unit=I15_A_AVG&purchase=TOTAL&lastTimePeriod=6`;
  const r = await prendi(url);
  if (!r.ok) return { ok: false, errore: r.errore, fonte: "Eurostat", url };

  try {
    /* Con purchase e unit fissati resta una sola serie, quindi l'indice
       piatto di `value` corrisponde direttamente all'anno. Senza quei
       filtri Eurostat restituisce tutte le combinazioni e gli indici non
       corrispondono più: è il modo più facile di leggere il numero
       sbagliato senza accorgersene. */
    const tempo = r.dati.dimension?.time?.category?.index || {};
    const anni = Object.keys(tempo).sort();
    const valori = r.dati.value || {};
    const voci = anni
      .map((a) => ({ periodo: a, valore: valori[String(tempo[a])] }))
      .filter((v) => typeof v.valore === "number");
    if (!voci.length) return { ok: false, errore: "nessun valore utile", fonte: "Eurostat", url };
    const ultimo = voci.at(-1);
    const precedente = voci.at(-2);
    return {
      ok: true,
      valore: ultimo.valore,
      variazione: precedente ? (ultimo.valore - precedente.valore) / precedente.valore : null,
      unita: "indice (2015 = 100)",
      periodo: ultimo.periodo,
      storico: voci,
      fonte: "Eurostat — indice dei prezzi delle abitazioni",
      url,
      nota: "Misura la deriva del mercato, non il livello dei prezzi per zona.",
    };
  } catch (e) {
    return { ok: false, errore: "risposta non nel formato atteso: " + e.message, fonte: "Eurostat", url };
  }
}

/* ═══════════ fonti che richiedono una persona ═══════════ */

/**
 * OMI — quotazioni immobiliari per zona (Agenzia delle Entrate).
 *
 * È la fonte migliore che esista per i livelli di prezzo di una zona
 * romana, ed è anche l'unica di questo elenco che una macchina non può
 * prendere da sola: il download passa dall'area riservata, con
 * autenticazione Fisconline o Entratel.
 *
 * Non è un ostacolo da aggirare. È un semestre di lavoro manuale — due
 * volte l'anno, mezz'ora — e in cambio si ottiene il dato ufficiale.
 * Da confermare per iscritto, prima di far pagare qualcosa, che il
 * riutilizzo commerciale sia ammesso.
 */
export async function quotazioniOMI() {
  return {
    ok: false,
    manuale: true,
    fonte: "Agenzia delle Entrate — OMI",
    url: "https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/forniture-dati-omi",
    nota: "Scaricare il CSV semestrale dall'area riservata e aggiornare ZONE in "
        + "src/game/mercati/roma/fonti.js. Aggiornamento: due volte l'anno.",
  };
}

/**
 * ISTAT / JobPricing — retribuzioni.
 * Le fasce si muovono di poco e una volta l'anno: non vale la pena
 * automatizzarle, vale la pena ricordarsi di guardarle.
 */
export async function retribuzioni() {
  return {
    ok: false,
    manuale: true,
    fonte: "ISTAT · Osservatorio JobPricing",
    url: "https://osservatoriojobpricing.it/report/salary-outlook",
    nota: "Rileggere le fasce una volta l'anno e riportarle al netto di nucleo.",
  };
}

export const TUTTE = {
  tassoMutui: tassoMutuiBCE,
  indicePrezziCase: indicePrezziCaseEurostat,
  quotazioniOMI,
  retribuzioni,
};
