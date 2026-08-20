/**
 * MOTORE DI GIOCO — autorevole, eseguito solo sul server.
 *
 * Una funzione pura: applicaAzione(stato, azione) -> { stato, errore }.
 * Il client non muta mai lo stato: lo legge e basta. Così non esiste
 * divergenza fra ciò che vede un giocatore e ciò che vede un altro.
 */

import { PROFESSIONI, getProfessione, DEBITI_ESTINGUIBILI } from "./data/professioni.js";
import { MAZZI, PICCOLI_AFFARI, GRANDI_AFFARI, MERCATO, EXTRA } from "./data/mazzi.js";
import { AFFARI_LARGO, SOGNI, getSogno, getAffareVeloce } from "./data/largo.js";
import {
  PERCORSO_RUOTA, PERCORSO_LARGO, N_RUOTA, N_LARGO,
  OBIETTIVO_RENDITA, MAX_GIOCATORI, COLORI,
} from "./data/tabellone.js";
import {
  redditoPassivo, redditoTotale, speseTotali, flussoMensile,
  fuoriDallaCorsa, riepilogo, arrotonda, soldi, MAX_FIGLI,
} from "./finanze.js";
import { semeCasuale, dado, idBreve, mescola } from "./caso.js";

/* ═══════════════ utilità ═══════════════ */

/**
 * Il caso della partita è deterministico e vive nello stato (seme + passi):
 * vedi caso.js. Il codice stanza invece resta davvero casuale, perché deve
 * essere imprevedibile e unico nel database, non riproducibile.
 */
export const codiceStanza = () =>
  Array.from({ length: 4 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");

/** Aggiunge una riga al registro condiviso (massimo 120 righe). */
function nota(s, testo, tipo = "info", giocatoreId = null) {
  s.registro.unshift({ id: idBreve(s), testo, tipo, giocatoreId, t: Date.now() });
  if (s.registro.length > 120) s.registro.length = 120;
}

const gioc = (s, id) => s.giocatori.find((g) => g.id === id);
const attuale = (s) => s.giocatori[s.turno] || null;

/** Pesca una carta dal mazzo indicato, rimescolando quando finisce. */
function pesca(s, nomeMazzo) {
  const mazzo = MAZZI[nomeMazzo];
  const stato = s.mazzi[nomeMazzo];
  if (stato.p >= stato.ordine.length) {
    stato.ordine = mescola(s, mazzo.length);
    stato.p = 0;
  }
  const carta = mazzo[stato.ordine[stato.p]];
  stato.p += 1;
  return carta;
}

/* ═══════════════ creazione ═══════════════ */

export function creaGiocatore(id, nome, professioneId, sognoId, indice) {
  const p = getProfessione(professioneId);
  return {
    id,
    nome: (nome || "Giocatore").slice(0, 18),
    colore: COLORI[indice % COLORI.length],
    professioneId: p.id,
    sognoId: sognoId || SOGNI[0].id,
    pronto: false,

    // Ruota
    tracciato: "topi",
    posizione: 0,
    contanti: 0,
    stipendio: p.stipendio,
    perFiglio: p.perFiglio,
    figli: 0,
    spese: { ...p.spese },
    passivita: { ...p.passivita, prestitoBanca: 0 },
    azioni: [],      // { simbolo, quantita, prezzoAcquisto, dividendo }
    immobili: [],    // { rid, categoria, nome, costo, acconto, mutuo, flusso }
    attivita: [],    // { rid, nome, costo, acconto, passivita, flusso }
    turniBeneficenza: 0,
    turniDaSaltare: 0,
    inBancarotta: false,
    eliminato: false,

    // Largo
    redditoRendita: 0,
    redditoInizialeVeloce: 0,
    affariVeloci: [],       // id degli affari comprati
    beneficenzaVeloce: false,
    segnaliniSogno: 0,      // ogni segnalino raddoppia il costo del proprio sogno
    sognoComprato: false,

    // statistiche
    turniGiocati: 0,
    usciteDallaCorsa: null, // a quale dei SUOI turni è uscito dalla Ruota
  };
}

export function creaStanza(codice, hostId, opzioni = {}) {
  const s = {
    codice,
    versione: 1,
    fase: "attesa", // attesa | inCorso | finita
    hostId,
    // Il caso della partita, ricostruibile a ogni lettura dal database.
    seme: (opzioni.seme ?? semeCasuale()) >>> 0,
    passi: 0,
    giocatori: [],
    turno: 0,
    numeroTurno: 0,
    dado: null,
    pending: null,
    registro: [],
    mazzi: null,   // riempito sotto: mescolare consuma il generatore
    affariVenduti: {},   // idAffareVeloce -> idGiocatore
    vincitore: null,
    motivoVittoria: null,
    creataIl: Date.now(),
    aggiornataIl: Date.now(),
  };

  s.mazzi = {
    piccoli: { ordine: mescola(s, PICCOLI_AFFARI.length), p: 0 },
    grandi: { ordine: mescola(s, GRANDI_AFFARI.length), p: 0 },
    mercato: { ordine: mescola(s, MERCATO.length), p: 0 },
    extra: { ordine: mescola(s, EXTRA.length), p: 0 },
  };
  return s;
}

/* ═══════════════ avanzamento del turno ═══════════════ */

function prossimoTurno(s) {
  s.dado = null;
  s.pending = null;
  const vivi = s.giocatori.filter((g) => !g.eliminato);
  if (vivi.length === 0) return;

  for (let i = 0; i < s.giocatori.length * 3; i++) {
    s.turno = (s.turno + 1) % s.giocatori.length;
    const g = s.giocatori[s.turno];
    if (g.eliminato) continue;
    if (g.turniDaSaltare > 0) {
      g.turniDaSaltare -= 1;
      nota(s, `${g.nome} salta il turno (ne restano ${g.turniDaSaltare}).`, "salto", g.id);
      continue;
    }
    s.numeroTurno += 1;
    g.turniGiocati += 1;
    return;
  }
}

/* ═══════════════ movimento ═══════════════ */

/** Conta i Giorni di Paga attraversati muovendosi di `passi`. */
function paghePassate(da, passi) {
  let n = 0;
  for (let i = 1; i <= passi; i++) {
    if (PERCORSO_RUOTA[(da + i) % N_RUOTA] === "paga") n += 1;
  }
  return n;
}

function giorniRenditaPassati(da, passi) {
  let n = 0;
  for (let i = 1; i <= passi; i++) {
    if (PERCORSO_LARGO[(da + i) % N_LARGO].tipo === "rendita") n += 1;
  }
  return n;
}

/* ═══════════════ pagamenti ═══════════════ */

/**
 * Paga qualcosa di obbligatorio (Spesa Extra, licenziamento, carta a costo
 * secco, evento di mercato). Il regolamento è esplicito: queste uscite non
 * sono facoltative e, se mancano i contanti, si accende un prestito in banca
 * — non si va "in rosso". Il prestito è a multipli di $1.000 e porta con sé
 * la sua rata del 10% al mese, esattamente come se lo si chiedesse a mano.
 */
function pagaObbligatorio(s, g, importo, motivo) {
  if (importo <= 0) return;
  if (g.contanti < importo) {
    const serve = Math.ceil((importo - g.contanti) / 1000) * 1000;
    g.passivita.prestitoBanca += serve;
    g.contanti += serve;
    nota(
      s,
      `${g.nome} non ha contanti a sufficienza: la banca gli presta ${soldi(serve)} (rata +${soldi(serve / 10)}/mese) per pagare ${motivo}.`,
      "prestito", g.id
    );
  }
  g.contanti -= importo;
}

/**
 * Incassa il Giorno di Paga. Se il flusso è negativo e non ci sono contanti
 * a sufficienza, scatta la bancarotta (regolamento, pag. 5).
 * Restituisce true se il giocatore è finito in bancarotta.
 */
function giornoDiPaga(s, g) {
  const f = flussoMensile(g);
  if (f >= 0) {
    g.contanti += f;
    nota(s, `${g.nome} incassa il Giorno di Paga: +${soldi(f)}.`, "paga", g.id);
    return false;
  }
  const dovuto = -f;
  if (g.contanti >= dovuto) {
    g.contanti -= dovuto;
    nota(s, `${g.nome} ha flusso negativo e paga ${soldi(dovuto)} alla banca.`, "paga", g.id);
    return false;
  }
  nota(s, `${g.nome} non riesce a coprire il flusso negativo: BANCAROTTA.`, "bancarotta", g.id);
  g.inBancarotta = true;
  return true;
}

/** Vendita forzata in bancarotta: metà dell'acconto versato. */
function apriBancarotta(s, g) {
  s.pending = {
    tipo: "bancarotta",
    giocatoreId: g.id,
    testo:
      "Flusso di cassa negativo e contanti insufficienti. Vendi i tuoi attivi alla banca " +
      "a metà dell'acconto versato finché il flusso non torna positivo. Perdi 3 turni.",
  };
}

/* ═══════════════ risoluzione delle caselle ═══════════════ */

function risolviCasella(s, g) {
  if (g.tracciato === "topi") return risolviTopi(s, g);
  return risolviVeloce(s, g);
}

function risolviTopi(s, g) {
  const tipo = PERCORSO_RUOTA[g.posizione];

  if (tipo === "paga") {
    // già incassata durante il movimento
    return prossimoTurno(s);
  }

  if (tipo === "opportunita") {
    s.pending = { tipo: "sceltaTaglia", giocatoreId: g.id, testo: "Scegli il tipo di affare da esaminare." };
    return;
  }

  if (tipo === "mercato") {
    const carta = pesca(s, "mercato");
    return apriMercato(s, g, carta);
  }

  if (tipo === "extra") {
    const carta = pesca(s, "extra");
    const importo = carta.perFiglio ? carta.importo * Math.max(g.figli, 0) : carta.importo;
    if (carta.perFiglio && g.figli === 0) {
      nota(s, `${g.nome} pesca "${carta.nome}" ma non ha figli: nessuna spesa.`, "extra", g.id);
      s.pending = { tipo: "extra", giocatoreId: g.id, carta, importo: 0 };
      return;
    }
    s.pending = { tipo: "extra", giocatoreId: g.id, carta, importo };
    return;
  }

  if (tipo === "beneficenza") {
    const costo = arrotonda(redditoTotale(g) * 0.1);
    s.pending = {
      tipo: "beneficenza", giocatoreId: g.id, costo,
      testo: `Puoi donare il 10% del tuo reddito totale (${soldi(costo)}) per tirare 2 dadi nei prossimi 3 turni.`,
    };
    return;
  }

  if (tipo === "figlio") {
    if (g.figli >= MAX_FIGLI) {
      nota(s, `${g.nome} ha già ${MAX_FIGLI} figli: nessun cambiamento.`, "figlio", g.id);
      s.pending = { tipo: "figlio", giocatoreId: g.id, nuovo: false };
      return;
    }
    s.pending = { tipo: "figlio", giocatoreId: g.id, nuovo: true };
    return;
  }

  if (tipo === "licenziamento") {
    const costo = speseTotali(g);
    s.pending = { tipo: "licenziamento", giocatoreId: g.id, costo };
    return;
  }

  return prossimoTurno(s);
}

function apriMercato(s, g, carta) {
  // Chi possiede l'attivo indicato dalla carta può vendere.
  const idonei = new Set([g.id]);

  if (carta.tipo === "offerta") {
    for (const p of s.giocatori) {
      if (p.eliminato || p.tracciato !== "topi") continue;
      const possiede =
        carta.categoria === "attivita"
          ? p.attivita.length > 0
          : p.immobili.some((i) => i.categoria === carta.categoria);
      if (possiede) idonei.add(p.id);
    }
  } else if (carta.tipo === "prezzo") {
    for (const p of s.giocatori) {
      if (p.eliminato || p.tracciato !== "topi") continue;
      if (p.azioni.some((a) => a.simbolo === carta.simbolo)) idonei.add(p.id);
    }
  } else if (carta.tipo === "evento") {
    applicaEventoMercato(s, carta);
  }

  nota(s, `${g.nome} pesca dal Mercato: "${carta.nome}".`, "mercato", g.id);
  s.pending = {
    tipo: "mercato",
    giocatoreId: g.id,
    carta,
    idonei: [...idonei],
    risposto: [],
  };
}

function applicaEventoMercato(s, carta) {
  for (const p of s.giocatori) {
    if (p.eliminato || p.tracciato !== "topi") continue;
    if (carta.effetto === "spesaPerImmobile") {
      const n = p.immobili.filter((i) => i.categoria !== "terreno").length;
      if (n > 0) {
        const tot = n * carta.importo;
        pagaObbligatorio(s, p, tot, `"${carta.nome}"`);
        nota(s, `${p.nome} paga ${soldi(tot)} (${n} immobili).`, "mercato", p.id);
      }
    } else if (carta.effetto === "incassoPerAttivita") {
      const n = p.attivita.length;
      if (n > 0) {
        const tot = n * carta.importo;
        p.contanti += tot;
        nota(s, `${p.nome} incassa ${soldi(tot)} (${n} attività).`, "mercato", p.id);
      }
    }
  }
}

function risolviVeloce(s, g) {
  const casella = PERCORSO_LARGO[g.posizione];

  if (casella.tipo === "rendita") return prossimoTurno(s);

  if (casella.tipo === "affare") {
    const affare = getAffareVeloce(casella.rif);
    const proprietario = s.affariVenduti[casella.rif];
    if (proprietario) {
      nota(s, `${g.nome} trova "${affare.nome}" già acquistato.`, "veloce", g.id);
      return prossimoTurno(s);
    }
    s.pending = { tipo: "affareVeloce", giocatoreId: g.id, affare };
    return;
  }

  if (casella.tipo === "sogno") {
    const sogno = getSogno(casella.rif);
    const mio = g.sognoId === casella.rif;

    if (mio) {
      const costo = sogno.costo * (1 + g.segnaliniSogno);
      s.pending = { tipo: "sogno", giocatoreId: g.id, sogno, costo, mio: true };
      return;
    }

    // Atterrare sul sogno di un altro ne raddoppia il costo per quel giocatore.
    const vittime = s.giocatori.filter(
      (p) => p.id !== g.id && p.sognoId === casella.rif && !p.eliminato && !p.sognoComprato
    );
    for (const v of vittime) {
      v.segnaliniSogno += 1;
      nota(
        s,
        `${g.nome} atterra sul sogno di ${v.nome}: ora costa ${soldi(sogno.costo * (1 + v.segnaliniSogno))}.`,
        "sogno", v.id
      );
    }
    s.pending = { tipo: "sogno", giocatoreId: g.id, sogno, costo: sogno.costo, mio: false, vittime: vittime.map((v) => v.nome) };
    return;
  }

  if (casella.tipo === "beneficenza") {
    s.pending = { tipo: "beneficenzaVeloce", giocatoreId: g.id, gia: g.beneficenzaVeloce };
    return;
  }

  if (casella.tipo === "verificaFiscale" || casella.tipo === "causa") {
    const perso = Math.floor(g.contanti / 2);
    g.contanti -= perso;
    const nome = casella.tipo === "verificaFiscale" ? "Verifica fiscale" : "Causa legale";
    nota(s, `${g.nome}: ${nome}. Perde metà dei contanti (${soldi(perso)}).`, "penalita", g.id);
    s.pending = { tipo: "penalitaVeloce", giocatoreId: g.id, nome, perso };
    return;
  }

  if (casella.tipo === "divorzio") {
    const perso = g.contanti;
    g.contanti = 0;
    nota(s, `${g.nome}: Divorzio. Perde tutti i contanti (${soldi(perso)}).`, "penalita", g.id);
    s.pending = { tipo: "penalitaVeloce", giocatoreId: g.id, nome: "Divorzio", perso };
    return;
  }

  return prossimoTurno(s);
}

/* ═══════════════ vittoria ═══════════════ */

function controllaVittoria(s, g) {
  if (g.sognoComprato) {
    s.fase = "finita";
    s.vincitore = g.id;
    s.motivoVittoria = "sogno";
    nota(s, `🏆 ${g.nome} ha comprato il proprio sogno e vince la partita!`, "vittoria", g.id);
    return true;
  }
  if (
    g.tracciato === "veloce" &&
    g.redditoRendita >= g.redditoInizialeVeloce + OBIETTIVO_RENDITA
  ) {
    s.fase = "finita";
    s.vincitore = g.id;
    s.motivoVittoria = "rendita";
    nota(
      s,
      `🏆 ${g.nome} raggiunge +${soldi(OBIETTIVO_RENDITA)} di flusso al Largo e vince!`,
      "vittoria", g.id
    );
    return true;
  }
  return false;
}

/* ═══════════════ AZIONI ═══════════════ */

export function applicaAzione(stato, azione) {
  const s = structuredClone(stato);
  const err = (m) => ({ stato: null, errore: m });
  const ok = () => {
    s.versione += 1;
    s.aggiornataIl = Date.now();
    return { stato: s, errore: null };
  };

  const { tipo, giocatoreId } = azione;
  const g = gioc(s, giocatoreId);

  /* ─── Sala d'attesa ─── */

  if (tipo === "entra") {
    if (s.fase !== "attesa") return err("La partita è già iniziata.");
    if (g) {
      g.nome = (azione.nome || g.nome).slice(0, 18);
      g.professioneId = azione.professioneId || g.professioneId;
      g.sognoId = azione.sognoId || g.sognoId;
      const p = getProfessione(g.professioneId);
      g.stipendio = p.stipendio;
      g.perFiglio = p.perFiglio;
      g.spese = { ...p.spese };
      g.passivita = { ...p.passivita, prestitoBanca: 0 };
      return ok();
    }
    if (s.giocatori.length >= MAX_GIOCATORI) return err(`Massimo ${MAX_GIOCATORI} giocatori.`);
    const nuovo = creaGiocatore(giocatoreId, azione.nome, azione.professioneId, azione.sognoId, s.giocatori.length);
    s.giocatori.push(nuovo);
    nota(s, `${nuovo.nome} entra nella stanza.`, "lobby", nuovo.id);
    return ok();
  }

  if (tipo === "pronto") {
    if (!g) return err("Giocatore non trovato.");
    g.pronto = !!azione.valore;
    return ok();
  }

  if (tipo === "esci") {
    if (!g) return err("Giocatore non trovato.");
    if (s.fase === "attesa") {
      s.giocatori = s.giocatori.filter((x) => x.id !== giocatoreId);
      s.giocatori.forEach((x, i) => { x.colore = COLORI[i % COLORI.length]; });
      if (s.hostId === giocatoreId && s.giocatori.length) s.hostId = s.giocatori[0].id;
      nota(s, `${g.nome} lascia la stanza.`, "lobby");
    } else {
      g.eliminato = true;
      nota(s, `${g.nome} abbandona la partita.`, "lobby", g.id);
      if (attuale(s)?.id === giocatoreId) prossimoTurno(s);
    }
    return ok();
  }

  if (tipo === "avvia") {
    if (s.fase !== "attesa") return err("La partita è già iniziata.");
    if (s.hostId !== giocatoreId) return err("Solo chi ha creato la stanza può avviare.");
    if (s.giocatori.length < 2) return err("Servono almeno 2 giocatori.");

    // Ognuno riceve il primo Giorno di Paga più i risparmi (regolamento pag. 2).
    for (const p of s.giocatori) {
      const prof = getProfessione(p.professioneId);
      p.contanti = flussoMensile(p) + prof.risparmi;
    }
    // Ordine di gioco: si tira un dado, il più alto comincia.
    const tiri = s.giocatori.map((p) => ({ id: p.id, nome: p.nome, v: dado(s) }));
    tiri.sort((a, b) => b.v - a.v);
    const ordine = tiri.map((t) => t.id);
    s.giocatori.sort((a, b) => ordine.indexOf(a.id) - ordine.indexOf(b.id));
    s.giocatori.forEach((p, i) => { p.colore = COLORI[i % COLORI.length]; });

    s.fase = "inCorso";
    s.turno = 0;
    s.numeroTurno = 1;
    s.giocatori[0].turniGiocati = 1;
    nota(s, `Partita avviata. Ordine: ${tiri.map((t) => `${t.nome} (${t.v})`).join(", ")}.`, "sistema");
    nota(s, `Tocca a ${s.giocatori[0].nome}.`, "turno", s.giocatori[0].id);
    return ok();
  }

  /* ─── Da qui in poi serve una partita in corso ─── */
  if (s.fase !== "inCorso") return err("La partita non è in corso.");
  if (!g) return err("Giocatore non trovato.");
  if (g.eliminato) return err("Non sei più in partita.");

  const suoTurno = attuale(s)?.id === giocatoreId;

  /* ─── Il Mercato: possono rispondere anche gli altri ─── */

  if (tipo === "vendiAlMercato" || tipo === "passaMercato") {
    if (s.pending?.tipo !== "mercato") return err("Nessuna carta Mercato attiva.");
    if (!s.pending.idonei.includes(giocatoreId)) return err("Questa carta non ti riguarda.");
    if (s.pending.risposto.includes(giocatoreId)) return err("Hai già risposto.");
    const carta = s.pending.carta;

    if (tipo === "vendiAlMercato") {
      const r = vendiAlMercato(s, g, carta, azione);
      if (r) return err(r);
      // Chi vende può vendere ancora (più immobili della stessa categoria).
      if (!azione.ultima) return ok();
    }

    s.pending.risposto.push(giocatoreId);
    if (s.pending.risposto.length >= s.pending.idonei.length) {
      prossimoTurno(s);
    }
    return ok();
  }

  if (tipo === "chiudiMercato") {
    if (s.pending?.tipo !== "mercato") return err("Nessuna carta Mercato attiva.");
    if (!suoTurno) return err("Solo chi ha pescato la carta può chiudere il Mercato.");
    nota(s, "Fase di Mercato chiusa.", "mercato");
    prossimoTurno(s);
    return ok();
  }

  /* ─── Tutto il resto richiede che sia il tuo turno ─── */
  if (!suoTurno) return err("Non è il tuo turno.");

  /* ─── Azioni libere ─── */

  if (tipo === "prestito") {
    const imp = Math.floor(azione.importo || 0);
    if (imp < 1000 || imp % 1000 !== 0) return err("Il prestito è a multipli di $1.000.");
    if (imp > 500000) return err("Importo troppo alto.");
    g.passivita.prestitoBanca += imp;
    g.contanti += imp;
    nota(s, `${g.nome} chiede un prestito di ${soldi(imp)} (rata +${soldi(imp / 10)}/mese).`, "prestito", g.id);
    return ok();
  }

  if (tipo === "estingui") {
    const chiave = azione.chiave;
    if (chiave === "prestitoBanca") {
      const imp = Math.floor(azione.importo || 0);
      if (imp < 1000 || imp % 1000 !== 0) return err("Rimborso a multipli di $1.000.");
      if (imp > g.passivita.prestitoBanca) return err("Importo superiore al debito.");
      if (imp > g.contanti) return err("Contanti insufficienti.");
      g.passivita.prestitoBanca -= imp;
      g.contanti -= imp;
      nota(s, `${g.nome} rimborsa ${soldi(imp)} di prestito bancario.`, "prestito", g.id);
      return ok();
    }
    const debito = DEBITI_ESTINGUIBILI.find((d) => d.chiave === chiave);
    if (!debito) return err("Questo debito non è estinguibile.");
    const dovuto = g.passivita[chiave];
    if (!dovuto) return err("Non hai questo debito.");
    if (g.contanti < dovuto) return err("Contanti insufficienti: va estinto per intero.");
    g.contanti -= dovuto;
    g.passivita[chiave] = 0;
    g.spese[debito.spesa] = 0;
    nota(s, `${g.nome} estingue "${debito.nome}" (${soldi(dovuto)}): spese ridotte.`, "prestito", g.id);
    return ok();
  }

  if (tipo === "esciDallaCorsa") {
    if (g.tracciato !== "topi") return err("Sei già al Largo.");
    if (s.pending) return err("Concludi prima l'azione in corso.");
    if (!fuoriDallaCorsa(g)) return err("Il tuo reddito passivo non supera ancora le spese totali.");
    const passivo = redditoPassivo(g);
    const buyout = passivo * 100;
    g.tracciato = "veloce";
    g.posizione = 0;
    g.redditoRendita = buyout;
    g.redditoInizialeVeloce = buyout;
    g.contanti += buyout;
    g.turniBeneficenza = 0;
    g.usciteDallaCorsa = g.turniGiocati;
    nota(
      s,
      `🎉 ${g.nome} esce dalla Ruota! Liquidazione ${soldi(buyout)} (100 × ${soldi(passivo)} di reddito passivo). Obiettivo: ${soldi(buyout + OBIETTIVO_RENDITA)}.`,
      "liberta", g.id
    );
    return ok();
  }

  /* ─── Tiro dei dadi ─── */

  if (tipo === "tira") {
    if (s.pending) return err("Concludi prima l'azione in corso.");
    if (s.dado) return err("Hai già tirato in questo turno.");

    let n = 1;
    if (g.tracciato === "topi") {
      n = g.turniBeneficenza > 0 ? Math.min(2, Math.max(1, azione.nDadi || 2)) : 1;
    } else {
      n = g.beneficenzaVeloce ? Math.min(3, Math.max(1, azione.nDadi || 2)) : 2;
    }
    const valori = Array.from({ length: n }, () => dado(s));
    const passi = valori.reduce((a, b) => a + b, 0);
    s.dado = { valori, totale: passi };

    if (g.tracciato === "topi" && g.turniBeneficenza > 0) g.turniBeneficenza -= 1;

    const da = g.posizione;
    if (g.tracciato === "topi") {
      const paghe = paghePassate(da, passi);
      g.posizione = (da + passi) % N_RUOTA;
      nota(s, `${g.nome} tira ${valori.join(" + ")} = ${passi}.`, "dado", g.id);
      for (let i = 0; i < paghe; i++) {
        if (giornoDiPaga(s, g)) {
          apriBancarotta(s, g);
          return ok();
        }
      }
      risolviTopi(s, g);
    } else {
      const giorni = giorniRenditaPassati(da, passi);
      g.posizione = (da + passi) % N_LARGO;
      nota(s, `${g.nome} tira ${valori.join(" + ")} = ${passi}.`, "dado", g.id);
      for (let i = 0; i < giorni; i++) {
        g.contanti += g.redditoRendita;
        nota(s, `${g.nome} incassa il Giorno di Rendita: +${soldi(g.redditoRendita)}.`, "paga", g.id);
      }
      risolviVeloce(s, g);
    }
    return ok();
  }

  /* ─── Risoluzione delle carte ─── */

  if (!s.pending) return err("Nessuna azione in sospeso.");
  if (s.pending.giocatoreId !== giocatoreId) return err("Non è una tua decisione.");

  if (tipo === "scegliTaglia") {
    if (s.pending.tipo !== "sceltaTaglia") return err("Azione non valida ora.");
    const taglia = azione.taglia === "grandi" ? "grandi" : "piccoli";
    const carta = pesca(s, taglia);
    nota(s, `${g.nome} pesca un ${taglia === "grandi" ? "Grande" : "Piccolo"} Affare: "${carta.nome}".`, "carta", g.id);
    s.pending = { tipo: "carta", giocatoreId: g.id, taglia, carta };
    return ok();
  }

  if (tipo === "compraCarta") {
    if (s.pending.tipo !== "carta") return err("Azione non valida ora.");
    const errore = compraCarta(s, g, s.pending.carta, azione);
    if (errore) return err(errore);
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "passaCarta") {
    if (s.pending.tipo !== "carta") return err("Azione non valida ora.");
    const c = s.pending.carta;
    if (c.tipo === "spesa" && !c.opzionale) {
      const dovuto = c.condizione === "immobile" && g.immobili.length === 0 ? 0 : c.importo;
      if (dovuto > 0) {
        pagaObbligatorio(s, g, dovuto, `"${c.nome}"`);
        nota(s, `${g.nome} paga ${soldi(dovuto)} per "${c.nome}".`, "carta", g.id);
      } else {
        nota(s, `${g.nome} non è colpito da "${c.nome}".`, "carta", g.id);
      }
    } else {
      nota(s, `${g.nome} lascia perdere "${c.nome}".`, "carta", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaExtra") {
    if (s.pending.tipo !== "extra") return err("Azione non valida ora.");
    const imp = s.pending.importo;
    if (imp > 0) {
      pagaObbligatorio(s, g, imp, `"${s.pending.carta.nome}"`);
      nota(s, `${g.nome} spende ${soldi(imp)}: "${s.pending.carta.nome}".`, "extra", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "beneficenza") {
    if (s.pending.tipo !== "beneficenza") return err("Azione non valida ora.");
    if (azione.accetta) {
      const costo = s.pending.costo;
      if (g.contanti < costo) return err("Contanti insufficienti per la donazione.");
      g.contanti -= costo;
      g.turniBeneficenza = 3;
      nota(s, `${g.nome} dona ${soldi(costo)}: 2 dadi per i prossimi 3 turni.`, "beneficenza", g.id);
    } else {
      nota(s, `${g.nome} non dona.`, "beneficenza", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaFiglio") {
    if (s.pending.tipo !== "figlio") return err("Azione non valida ora.");
    if (s.pending.nuovo) {
      g.figli += 1;
      nota(s, `👶 ${g.nome} ha un figlio! Spese +${soldi(g.perFiglio)}/mese (figli: ${g.figli}).`, "figlio", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaLicenziamento") {
    if (s.pending.tipo !== "licenziamento") return err("Azione non valida ora.");
    const costo = s.pending.costo;
    pagaObbligatorio(s, g, costo, "il licenziamento");
    g.turniDaSaltare = 2;
    g.turniBeneficenza = 0;
    nota(s, `📉 ${g.nome} è licenziato: paga ${soldi(costo)} e salta 2 turni.`, "licenziamento", g.id);
    if (g.contanti < 0 && flussoMensile(g) < 0) {
      g.inBancarotta = true;
      apriBancarotta(s, g);
      return ok();
    }
    prossimoTurno(s);
    return ok();
  }

  /* ─── Bancarotta ─── */

  if (tipo === "vendiPerBancarotta") {
    if (s.pending.tipo !== "bancarotta") return err("Azione non valida ora.");
    const errore = vendiPerBancarotta(s, g, azione);
    if (errore) return err(errore);
    return ok();
  }

  if (tipo === "concludiBancarotta") {
    if (s.pending.tipo !== "bancarotta") return err("Azione non valida ora.");
    if (flussoMensile(g) < 0) {
      // Dimezza auto, carte e rate insieme alle relative spese (regolamento pag. 5).
      for (const k of ["auto", "cartaCredito", "rate"]) {
        g.passivita[k] = Math.floor(g.passivita[k] / 2);
        g.spese[k] = Math.floor(g.spese[k] / 2);
      }
      nota(s, `${g.nome}: metà di prestito auto, carte e rate viene cancellata.`, "bancarotta", g.id);
    }
    if (flussoMensile(g) < 0) {
      g.eliminato = true;
      nota(s, `${g.nome} è ufficialmente fuori dalla partita.`, "bancarotta", g.id);
    } else {
      g.turniDaSaltare = 3;
      g.inBancarotta = false;
      if (g.contanti < 0) g.contanti = 0;
      nota(s, `${g.nome} esce dalla bancarotta e salta 3 turni.`, "bancarotta", g.id);
    }
    const restanti = s.giocatori.filter((p) => !p.eliminato);
    if (restanti.length === 1) {
      s.fase = "finita";
      s.vincitore = restanti[0].id;
      s.motivoVittoria = "ultimo";
      nota(s, `🏆 ${restanti[0].nome} è l'ultimo giocatore rimasto e vince.`, "vittoria", restanti[0].id);
      return ok();
    }
    prossimoTurno(s);
    return ok();
  }

  /* ─── Largo ─── */

  if (tipo === "compraAffareVeloce" || tipo === "passaAffareVeloce") {
    if (s.pending.tipo !== "affareVeloce") return err("Azione non valida ora.");
    const affare = s.pending.affare;
    if (tipo === "compraAffareVeloce") {
      if (g.contanti < affare.acconto) return err("Contanti insufficienti.");
      g.contanti -= affare.acconto;
      g.affariVeloci.push(affare.id);
      g.redditoRendita += affare.flusso;
      s.affariVenduti[affare.id] = g.id;
      nota(
        s,
        `${g.nome} compra "${affare.nome}" per ${soldi(affare.acconto)}: flusso +${soldi(affare.flusso)}/mese (totale ${soldi(g.redditoRendita)}).`,
        "veloce", g.id
      );
      if (controllaVittoria(s, g)) return ok();
    } else {
      nota(s, `${g.nome} lascia perdere "${affare.nome}".`, "veloce", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "compraSogno" || tipo === "passaSogno") {
    if (s.pending.tipo !== "sogno") return err("Azione non valida ora.");
    if (tipo === "compraSogno") {
      if (!s.pending.mio) return err("Puoi comprare solo il sogno che hai scelto.");
      const costo = s.pending.costo;
      if (g.contanti < costo) return err("Contanti insufficienti per il tuo sogno.");
      g.contanti -= costo;
      g.sognoComprato = true;
      nota(s, `⭐ ${g.nome} compra il proprio sogno "${s.pending.sogno.nome}" per ${soldi(costo)}!`, "sogno", g.id);
      if (controllaVittoria(s, g)) return ok();
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "beneficenzaVeloce") {
    if (s.pending.tipo !== "beneficenzaVeloce") return err("Azione non valida ora.");
    if (azione.accetta) {
      const costo = arrotonda(g.redditoRendita * 0.1);
      if (g.contanti < costo) return err("Contanti insufficienti.");
      g.contanti -= costo;
      g.beneficenzaVeloce = true;
      nota(s, `${g.nome} dona ${soldi(costo)}: da ora può scegliere quanti dadi tirare (1, 2 o 3).`, "beneficenza", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaPenalita") {
    if (s.pending.tipo !== "penalitaVeloce") return err("Azione non valida ora.");
    prossimoTurno(s);
    return ok();
  }

  return err("Azione sconosciuta: " + tipo);
}

/* ═══════════════ compravendita ═══════════════ */

function compraCarta(s, g, c, azione) {
  if (c.tipo === "azione") {
    const q = Math.max(1, Math.floor(azione.quantita || 0));
    if (!q) return "Indica quante azioni comprare.";
    const costo = q * c.prezzo;
    if (g.contanti < costo) return "Contanti insufficienti.";
    g.contanti -= costo;
    const esistente = g.azioni.find((a) => a.simbolo === c.simbolo);
    if (esistente) {
      const totQ = esistente.quantita + q;
      esistente.prezzoAcquisto = arrotonda(
        (esistente.prezzoAcquisto * esistente.quantita + c.prezzo * q) / totQ
      );
      esistente.quantita = totQ;
      esistente.dividendo = c.dividendo;
    } else {
      g.azioni.push({ simbolo: c.simbolo, quantita: q, prezzoAcquisto: c.prezzo, dividendo: c.dividendo || 0 });
    }
    nota(s, `${g.nome} compra ${q} × ${c.simbolo} a ${c.prezzo}$ (${soldi(costo)}).`, "carta", g.id);
    return null;
  }

  if (c.tipo === "immobile") {
    if (g.contanti < c.acconto) return "Contanti insufficienti per l'acconto.";
    g.contanti -= c.acconto;
    g.immobili.push({
      rid: idBreve(s), categoria: c.categoria, nome: c.nome,
      costo: c.costo, acconto: c.acconto, mutuo: c.mutuo, flusso: c.flusso,
    });
    nota(s, `${g.nome} compra "${c.nome}" (acconto ${soldi(c.acconto)}, flusso +${soldi(c.flusso)}/mese).`, "carta", g.id);
    return null;
  }

  if (c.tipo === "attivita") {
    if (g.contanti < c.acconto) return "Contanti insufficienti per l'acconto.";
    g.contanti -= c.acconto;
    g.attivita.push({
      rid: idBreve(s), nome: c.nome, costo: c.costo,
      acconto: c.acconto, passivita: c.passivita || 0, flusso: c.flusso,
    });
    nota(s, `${g.nome} compra "${c.nome}" (acconto ${soldi(c.acconto)}, flusso +${soldi(c.flusso)}/mese).`, "carta", g.id);
    return null;
  }

  if (c.tipo === "spesa") {
    const dovuto = c.condizione === "immobile" && g.immobili.length === 0 ? 0 : c.importo;
    pagaObbligatorio(s, g, dovuto, `"${c.nome}"`);
    nota(s, `${g.nome} paga ${soldi(dovuto)}: "${c.nome}".`, "carta", g.id);
    return null;
  }

  return "Tipo di carta sconosciuto.";
}

function vendiAlMercato(s, g, c, azione) {
  if (c.tipo === "offerta") {
    if (c.categoria === "attivita") {
      const a = g.attivita.find((x) => x.rid === azione.rid);
      if (!a) return "Attività non trovata.";
      const prezzo = c.moltiplicatore ? arrotonda(a.costo * c.moltiplicatore) : c.prezzo;
      const netto = prezzo - (a.passivita || 0);
      g.contanti += netto;
      g.attivita = g.attivita.filter((x) => x.rid !== a.rid);
      nota(s, `${g.nome} vende "${a.nome}" a ${soldi(prezzo)} (netto ${soldi(netto)}).`, "mercato", g.id);
      return null;
    }
    const i = g.immobili.find((x) => x.rid === azione.rid);
    if (!i) return "Immobile non trovato.";
    if (i.categoria !== c.categoria) return "Questa offerta non riguarda quell'immobile.";
    const prezzo = c.moltiplicatore ? arrotonda(i.costo * c.moltiplicatore) : c.prezzo;
    const netto = prezzo - i.mutuo;
    g.contanti += netto;
    g.immobili = g.immobili.filter((x) => x.rid !== i.rid);
    nota(
      s,
      `${g.nome} vende "${i.nome}" a ${soldi(prezzo)} (meno ${soldi(i.mutuo)} di mutuo = ${soldi(netto)}).`,
      "mercato", g.id
    );
    return null;
  }

  if (c.tipo === "prezzo") {
    const a = g.azioni.find((x) => x.simbolo === c.simbolo);
    if (!a) return "Non possiedi questo titolo.";
    const q = Math.min(a.quantita, Math.max(1, Math.floor(azione.quantita || a.quantita)));
    const incasso = q * c.prezzo;
    g.contanti += incasso;
    a.quantita -= q;
    if (a.quantita <= 0) g.azioni = g.azioni.filter((x) => x.simbolo !== c.simbolo);
    nota(s, `${g.nome} vende ${q} × ${c.simbolo} a ${c.prezzo}$ (+${soldi(incasso)}).`, "mercato", g.id);
    return null;
  }

  return "Questa carta non permette vendite.";
}

function vendiPerBancarotta(s, g, azione) {
  const meta = (n) => Math.floor(n / 2);
  if (azione.categoria === "immobile") {
    const i = g.immobili.find((x) => x.rid === azione.rid);
    if (!i) return "Immobile non trovato.";
    const incasso = meta(i.acconto);
    g.contanti += incasso;
    g.immobili = g.immobili.filter((x) => x.rid !== i.rid);
    nota(s, `${g.nome} svende "${i.nome}" alla banca per ${soldi(incasso)}.`, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "attivita") {
    const a = g.attivita.find((x) => x.rid === azione.rid);
    if (!a) return "Attività non trovata.";
    const incasso = meta(a.acconto);
    g.contanti += incasso;
    g.attivita = g.attivita.filter((x) => x.rid !== a.rid);
    nota(s, `${g.nome} svende "${a.nome}" alla banca per ${soldi(incasso)}.`, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "azione") {
    const a = g.azioni.find((x) => x.simbolo === azione.simbolo);
    if (!a) return "Titolo non trovato.";
    const incasso = meta(a.quantita * a.prezzoAcquisto);
    g.contanti += incasso;
    g.azioni = g.azioni.filter((x) => x.simbolo !== a.simbolo);
    nota(s, `${g.nome} liquida ${a.simbolo} per ${soldi(incasso)}.`, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "debito") {
    const d = DEBITI_ESTINGUIBILI.find((x) => x.chiave === azione.chiave);
    if (!d) return "Debito non estinguibile.";
    const dovuto = g.passivita[d.chiave];
    if (!dovuto) return "Non hai questo debito.";
    if (g.contanti < dovuto) return "Contanti insufficienti.";
    g.contanti -= dovuto;
    g.passivita[d.chiave] = 0;
    g.spese[d.spesa] = 0;
    nota(s, `${g.nome} estingue "${d.nome}" durante la bancarotta.`, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "prestito") {
    const richiesto = Math.floor(azione.importo || 0);
    if (richiesto < 1000 || richiesto % 1000 !== 0) return "Rimborso a multipli di $1.000.";
    const imp = Math.min(g.passivita.prestitoBanca, richiesto);
    if (g.contanti < imp) return "Contanti insufficienti.";
    g.contanti -= imp;
    g.passivita.prestitoBanca -= imp;
    nota(s, `${g.nome} rimborsa ${soldi(imp)} di prestito.`, "bancarotta", g.id);
    return null;
  }
  return "Categoria sconosciuta.";
}

/* ═══════════════ classifica finale ═══════════════ */

export function classifica(s) {
  return [...s.giocatori]
    .map((g) => {
      const r = riepilogo(g);
      return {
        id: g.id, nome: g.nome, colore: g.colore,
        professioneId: g.professioneId, sognoId: g.sognoId,
        tracciato: g.tracciato, eliminato: g.eliminato,
        contanti: g.contanti,
        redditoPassivo: r.redditoPassivo,
        speseTotali: r.speseTotali,
        flussoMensile: r.flussoMensile,
        valoreAttivi: r.valoreAttivi,
        passivitaTotali: r.passivitaTotali,
        patrimonioNetto: g.contanti + r.valoreAttivi - r.passivitaTotali,
        redditoRendita: g.redditoRendita,
        guadagnoVeloce: g.redditoRendita - g.redditoInizialeVeloce,
        affariVeloci: g.affariVeloci.length,
        sognoComprato: g.sognoComprato,
        figli: g.figli,
        turniGiocati: g.turniGiocati,
        usciteDallaCorsa: g.usciteDallaCorsa,
        vincitore: s.vincitore === g.id,
      };
    })
    .sort((a, b) => {
      if (a.vincitore !== b.vincitore) return a.vincitore ? -1 : 1;
      if (a.eliminato !== b.eliminato) return a.eliminato ? 1 : -1;
      if (a.tracciato !== b.tracciato) return a.tracciato === "veloce" ? -1 : 1;
      if (a.tracciato === "veloce") return b.guadagnoVeloce - a.guadagnoVeloce;
      return b.patrimonioNetto - a.patrimonioNetto;
    });
}

export { OBIETTIVO_RENDITA, MAX_GIOCATORI };
