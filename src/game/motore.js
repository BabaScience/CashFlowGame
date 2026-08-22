/**
 * MOTORE DI GIOCO — autorevole, eseguito solo sul server.
 *
 * Una funzione pura: applicaAzione(stato, azione) -> { stato, errore }.
 * Il client non muta mai lo stato: lo legge e basta. Così non esiste
 * divergenza fra ciò che vede un giocatore e ciò che vede un altro.
 */

import { PERCORSO_RUOTA, PERCORSO_LARGO, N_RUOTA, N_LARGO, MAX_GIOCATORI, COLORI } from "./tabellone.js";
import { getPacchetto, pacchettoDi, versioneCorrente, MERCATO_PREDEFINITO } from "./mercati/indice.js";
import { flussoAlLivello, LIVELLO_PREDEFINITO } from "./regole/livelli.js";
import {
  redditoPassivo, redditoTotale, speseTotali, flussoMensile,
  fuoriDallaCorsa, riepilogo, arrotonda, soldi, MAX_FIGLI,
  ratePrestito, TASSO_PRESTITO,
} from "./finanze.js";
import { semeCasuale, dado, idBreve, mescola } from "./caso.js";

/* ═══════════════ utilità ═══════════════ */

/* L'economia della partita vive nel pacchetto del mercato, ancorato alla
   stanza. Queste scorciatoie evitano di ripetere ovunque `pacchettoDi(s)`. */
const professioniDi = (s) => pacchettoDi(s).professioni;
const getProfessione = (s, id) =>
  professioniDi(s).find((p) => p.id === id) || professioniDi(s)[0];
const mazziDi = (s) => pacchettoDi(s).mazzi;
const sogniDi = (s) => pacchettoDi(s).sogni;
const getSogno = (s, id) => sogniDi(s).find((x) => x.id === id) || sogniDi(s)[0];
const affariLargoDi = (s) => pacchettoDi(s).affariLargo;
const getAffareVeloce = (s, id) => affariLargoDi(s).find((a) => a.id === id);
const obiettivoDi = (s) => pacchettoDi(s).obiettivoRendita;
/**
 * Quanta rendita serve per vincere, per questo giocatore.
 *
 * Un multiplo di quella che aveva quando ha lasciato il lavoro, se il
 * mercato lo dichiara; altrimenti la vecchia cifra fissa sommata.
 */
const traguardoLargo = (s, g) => {
  const molt = pacchettoDi(s).obiettivoLargo;
  return molt
    ? Math.round(g.redditoInizialeVeloce * molt)
    : g.redditoInizialeVeloce + obiettivoDi(s);
};
const debitiEstinguibiliDi = (s) => pacchettoDi(s).debitiEstinguibili;
const valutaDi = (s) => pacchettoDi(s).valuta;
/** Un importo nella valuta del mercato di questa partita. */
const den = (s, n) => soldi(n, valutaDi(s));


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
/**
 * Aggiunge una riga al registro condiviso (massimo 120 righe).
 *
 * Salva DUE cose: il testo già scritto in italiano e, accanto, la chiave del
 * messaggio con i suoi valori. Il client mostra la versione tradotta se
 * conosce la chiave, altrimenti il testo così com'è.
 *
 * La ridondanza è voluta. Il registro vive dentro la stanza e le stanze
 * durano fino a 48 ore: nel momento in cui si pubblica un aggiornamento ci
 * sono partite in corso con righe salvate nel formato vecchio, e devono
 * continuare a leggersi. Il testo è anche la rete di sicurezza se un giorno
 * una chiave sparisse da un dizionario.
 */
function nota(s, testo, chiave = null, valori = null, tipo = "info", giocatoreId = null) {
  s.registro.unshift({
    id: idBreve(s), testo, k: chiave, v: valori, tipo, giocatoreId, t: Date.now(),
  });
  if (s.registro.length > 120) s.registro.length = 120;
}

const gioc = (s, id) => s.giocatori.find((g) => g.id === id);
const attuale = (s) => s.giocatori[s.turno] || null;

/** Pesca una carta dal mazzo indicato, rimescolando quando finisce. */
function pesca(s, nomeMazzo) {
  const mazzo = mazziDi(s)[nomeMazzo];
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

export function creaGiocatore(s, id, nome, professioneId, sognoId, indice) {
  const p = getProfessione(s, professioneId);
  return {
    id,
    nome: (nome || "Giocatore").slice(0, 18),
    colore: COLORI[indice % COLORI.length],
    professioneId: p.id,
    sognoId: sognoId || sogniDi(s)[0].id,
    pronto: false,

    // Ruota
    tracciato: "topi",
    posizione: 0,
    contanti: 0,
    stipendio: p.stipendio,
    perFiglio: p.perFiglio,
    tassoPrestito: pacchettoDi(s).tassoPrestito,
    /* Il margine d'uscita viaggia col giocatore: `fuoriDallaCorsa` è
       chiamata da mezza interfaccia e non deve risalire allo stato. */
    margineUscita: pacchettoDi(s).margineUscita ?? 1,
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
    /* Non c'è più un "reddito del Largo" separato: sul Largo si vive di
       quello che il portafoglio rende davvero. Resta solo la fotografia di
       quanto rendeva il giorno in cui hai lasciato il lavoro, perché è da
       lì che si misura quanto sei cresciuto dopo. */
    redditoInizialeVeloce: 0,
    affariVeloci: [],       // id degli affari comprati
    beneficenzaVeloce: false,
    segnaliniSogno: 0,      // ogni segnalino raddoppia il costo del proprio sogno
    sognoComprato: false,

    // statistiche
    turniGiocati: 0,
    usciteDallaCorsa: null, // a quale dei SUOI turni è uscito dalla Ruota
    /* Un Giorno di Paga = un mese. Vedi game/tempo.js: il tempo si conta
       per giocatore, perché la domanda a cui risponde è "quanti mesi ho
       lavorato per arrivare qui" e quella è personale. */
    mesi: 0,
    mesiAllUscita: null,
  };
}

export function creaStanza(codice, hostId, opzioni = {}) {
  /* Il mercato si sceglie qui e non cambia più: la stanza si ancora a una
     versione precisa dei dati e rilegge sempre quella, anche se nel
     frattempo ne esce una nuova. Vedi mercati/indice.js. */
  const mercatoId = opzioni.mercatoId || MERCATO_PREDEFINITO;
  const versioneDati = opzioni.versioneDati || versioneCorrente(mercatoId);
  const { conteggi } = getPacchetto(mercatoId, versioneDati);

  const s = {
    codice,
    versione: 1,
    fase: "attesa", // attesa | inCorso | finita
    hostId,
    mercatoId,
    versioneDati,
    /* Quanto del fisco vero si vede. Il mercato senza `fisco` resta al
       livello base: non ha un paese, quindi non ha imposte da mostrare. */
    livello: getPacchetto(mercatoId, versioneDati).fisco
      ? (opzioni.livello || LIVELLO_PREDEFINITO)
      : LIVELLO_PREDEFINITO,
    solitaria: Boolean(opzioni.solitaria),
    // Il caso della partita, ricostruibile a ogni lettura dal database.
    seme: (opzioni.seme ?? semeCasuale()) >>> 0,
    passi: 0,
    giocatori: [],
    turno: 0,
    numeroTurno: 0,
    dado: null,
    ultimoTiro: null,   // ultimo lancio, per mostrarlo a tutti
    pending: null,
    chat: [],
    chatAperta: true,   // l'host può spegnerla: in classe è obbligatorio poterlo fare

    registro: [],
    mazzi: null,   // riempito sotto: mescolare consuma il generatore
    affariVenduti: {},   // idAffareVeloce -> idGiocatore
    vincitore: null,
    motivoVittoria: null,
    creataIl: Date.now(),
    aggiornataIl: Date.now(),
  };

  s.mazzi = {
    piccoli: { ordine: mescola(s, conteggi.piccoli), p: 0 },
    grandi: { ordine: mescola(s, conteggi.grandi), p: 0 },
    mercato: { ordine: mescola(s, conteggi.mercato), p: 0 },
    extra: { ordine: mescola(s, conteggi.extra), p: 0 },
  };
  return s;
}

/* ═══════════════ avanzamento del turno ═══════════════ */

/**
 * Una partita deve finire.
 *
 * Senza un limite, un giocatore che prende il largo con una rendita minima
 * riceve una liquidazione minima, non arriva al primo affare, e le penalità
 * del Largo gli tolgono quel poco che accumula: gira per migliaia di turni
 * senza vincere e senza perdere. Non è una partita combattuta, è uno
 * stallo, ed è la cosa peggiore che possa capitare a un tavolo.
 *
 * Al limite vince chi si è avvicinato di più al proprio obiettivo. È anche
 * la regola giusta per una partita da tavolo che deve stare in una serata.
 */
function fineATempo(s) {
  const vivi = s.giocatori.filter((g) => !g.eliminato);
  if (!vivi.length) return;

  /* Quanto manca a ciascuno, come frazione del proprio traguardo. */
  const progresso = (g) => {
    if (g.tracciato === "veloce") {
      const traguardo = obiettivoDi(s);
      const fatto = redditoPassivo(g) - g.redditoInizialeVeloce;
      return 1 + Math.max(0, fatto) / Math.max(1, traguardo);
    }
    const r = riepilogo(g);
    return Math.min(0.999, r.redditoPassivo / Math.max(1, r.speseTotali));
  };

  const ordinati = [...vivi].sort((a, b) => progresso(b) - progresso(a));
  const capofila = ordinati[0];
  s.fase = "finita";
  s.vincitore = capofila.id;
  s.motivoVittoria = "tempo";
  nota(s, `⏳ Tempo scaduto dopo ${s.numeroTurno} turni. Vince ${capofila.nome}, il più vicino al proprio obiettivo.`, "r00", { numeroTurno: s.numeroTurno, capofilaNome: capofila.nome }, "sistema", capofila.id);
}

function prossimoTurno(s) {
  s.dado = null;
  s.pending = null;
  const vivi = s.giocatori.filter((g) => !g.eliminato);
  if (vivi.length === 0) return;

  const limite = pacchettoDi(s).turniMassimi;
  if (limite && s.numeroTurno >= limite) return fineATempo(s);

  for (let i = 0; i < s.giocatori.length * 3; i++) {
    s.turno = (s.turno + 1) % s.giocatori.length;
    const g = s.giocatori[s.turno];
    if (g.eliminato) continue;
    if (g.turniDaSaltare > 0) {
      g.turniDaSaltare -= 1;
      nota(s, `${g.nome} salta il turno (ne restano ${g.turniDaSaltare}).`, "r01", { nome: g.nome, turniDaSaltare: g.turniDaSaltare }, "salto", g.id);
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

/**
 * Quanto la banca presterebbe ancora a questo giocatore.
 *
 * Due vincoli, come nella realtà:
 *   · la rata totale — quelle già in corso più la nuova — non supera un
 *     terzo del reddito netto mensile;
 *   · c'è comunque un tetto, perché il credito al consumo non arriva a
 *     cifre da mutuo.
 *
 * Il reddito che conta è quello dimostrabile: lo stipendio e le rendite già
 * in essere, non quelle che si comprerebbero col prestito.
 */
function massimoPrestabile(s, g) {
  const cc = pacchettoDi(s).creditoConsumo;
  if (!cc) return 500000;  // mercati che non lo dichiarano: com'era prima
  const tasso = g.tassoPrestito ?? TASSO_PRESTITO;
  const reddito = g.stipendio + redditoPassivo(g);
  /* Le rate già in corso: tutte le voci di spesa che sono rate, più il
     costo del fido già acceso. */
  const escluse = new Set(cc.vociEscluse || []);
  const rateInCorso = ratePrestito(g)
    + (pacchettoDi(s).debitiEstinguibili || [])
      .filter((d) => !escluse.has(d.spesa))
      .reduce((somma, d) => somma + (g.spese[d.spesa] || 0), 0);
  const spazio = reddito * cc.quotaRedditoMax - rateInCorso;
  if (spazio <= 0) return 0;
  const perRata = Math.floor(spazio / tasso / 1000) * 1000;
  return Math.max(0, Math.min(perRata, cc.importoMassimo));
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
      `${g.nome} non ha contanti a sufficienza: la banca gli presta ${den(s, serve)} (rata +${den(s, serve / 10)}/mese) per pagare ${motivo}.`, "r02", { nome: g.nome, importo: den(s, serve), importo2: den(s, serve / 10), motivo: motivo },
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
  /* Prima di tutto il resto: il mese è passato comunque, che si incassi,
     che si paghi, o che si finisca in bancarotta proprio adesso. */
  g.mesi = (g.mesi || 0) + 1;
  const f = flussoMensile(g);
  if (f >= 0) {
    g.contanti += f;
    nota(s, `${g.nome} incassa il Giorno di Paga: +${den(s, f)}.`, "r03", { nome: g.nome, importo: den(s, f) }, "paga", g.id);
    return false;
  }
  const dovuto = -f;
  if (g.contanti >= dovuto) {
    g.contanti -= dovuto;
    nota(s, `${g.nome} ha flusso negativo e paga ${den(s, dovuto)} alla banca.`, "r04", { nome: g.nome, importo: den(s, dovuto) }, "paga", g.id);
    return false;
  }
  nota(s, `${g.nome} non riesce a coprire il flusso negativo: BANCAROTTA.`, "r05", { nome: g.nome }, "bancarotta", g.id);
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
      nota(s, `${g.nome} pesca "${carta.nome}" ma non ha figli: nessuna spesa.`, "r06", { nome: g.nome, cartaNome: carta.nome }, "extra", g.id);
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
      testo: `Puoi donare il 10% del tuo reddito totale (${den(s, costo)}) per tirare 2 dadi nei prossimi 3 turni.`,
    };
    return;
  }

  if (tipo === "figlio") {
    if (g.figli >= MAX_FIGLI) {
      nota(s, `${g.nome} ha già ${MAX_FIGLI} figli: nessun cambiamento.`, "r07", { nome: g.nome, MAX_FIGLI: MAX_FIGLI }, "figlio", g.id);
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

  nota(s, `${g.nome} pesca dal Mercato: "${carta.nome}".`, "r08", { nome: g.nome, cartaNome: carta.nome }, "mercato", g.id);
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
        nota(s, `${p.nome} paga ${den(s, tot)} (${n} immobili).`, "r09", { nome: p.nome, importo: den(s, tot), n: n }, "mercato", p.id);
      }
    } else if (carta.effetto === "incassoPerAttivita") {
      const n = p.attivita.length;
      if (n > 0) {
        const tot = n * carta.importo;
        p.contanti += tot;
        nota(s, `${p.nome} incassa ${den(s, tot)} (${n} attività).`, "r10", { nome: p.nome, importo: den(s, tot), n: n }, "mercato", p.id);
      }
    } else if (carta.effetto === "variazioneCanoni") {
      /* Il canone che cambia per tutti: il rischio più vero di chi vive di
         affitti, e l'unico modo onesto di mettere tensione in un mercato in
         cui le famiglie hanno margini larghi. Non toglie contanti — cambia
         quanto entra ogni mese, che è molto peggio e molto più realistico. */
      const immobili = p.immobili.filter((i) => i.flusso !== 0);
      if (immobili.length) {
        let delta = 0;
        for (const i of immobili) {
          const prima = i.flusso;
          i.flusso = arrotonda(i.flusso * (1 + carta.variazione));
          delta += i.flusso - prima;
        }
        const verso = delta >= 0 ? "sale" : "scende";
        nota(s, `${p.nome}: il flusso dagli affitti ${verso} di ${den(s, Math.abs(delta))} al mese.`,
          delta >= 0 ? "r11sale" : "r11scende", { nome: p.nome, v: den(s, Math.abs(delta)) }, "mercato", p.id);
      }
    } else if (carta.effetto === "variazioneRate") {
      /* I tassi che si muovono. Colpisce chi ha usato la leva, e solo lui:
         è esattamente ciò che succede con un mutuo a tasso variabile. */
      const conMutuo = p.immobili.filter((i) => (i.mutuo || 0) > 0);
      if (conMutuo.length) {
        let delta = 0;
        for (const i of conMutuo) {
          const aumento = arrotonda((i.mutuo * carta.variazione) / 12);
          i.flusso -= aumento;
          delta += aumento;
        }
        nota(s, `${p.nome}: le rate salgono di ${den(s, delta)} al mese (${conMutuo.length} mutui).`, "r12", { nome: p.nome, importo: den(s, delta), length: conMutuo.length }, "mercato", p.id);
      }
    }
  }
}

function risolviVeloce(s, g) {
  const casella = PERCORSO_LARGO[g.posizione];

  if (casella.tipo === "rendita") return prossimoTurno(s);

  if (casella.tipo === "affare") {
    const affare = getAffareVeloce(s, casella.rif);
    const proprietario = s.affariVenduti[casella.rif];
    if (proprietario) {
      nota(s, `${g.nome} trova "${affare.nome}" già acquistato.`, "r13", { nome: g.nome, affareNome: affare.nome }, "veloce", g.id);
      return prossimoTurno(s);
    }
    s.pending = { tipo: "affareVeloce", giocatoreId: g.id, affare };
    return;
  }

  if (casella.tipo === "sogno") {
    const sogno = getSogno(s, casella.rif);
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
        `${g.nome} atterra sul sogno di ${v.nome}: ora costa ${den(s, sogno.costo * (1 + v.segnaliniSogno))}.`, "r14", { nome: g.nome, vNome: v.nome, v: den(s, sogno.costo * (1 + v.segnaliniSogno)) },
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
    /* ═══ PROPORZIONALE AL REDDITO, NON AI RISPARMI ═══
     *
     * Prima costava metà dei contanti, e con la vecchia economia del Largo
     * — dove un solo Giorno di Rendita pagava centosettantamila euro — era
     * una scalfittura. Adesso che sul Largo si vive del proprio flusso
     * vero, "metà di tutto quello che hai messo da parte" ogni volta che si
     * passa di lì significa non mettere mai da parte niente: il capitale
     * non arrivava mai al primo affare.
     *
     * Una verifica fiscale o una causa costano una cifra, non una quota del
     * tuo patrimonio. Sei mesi di rendita è una stangata seria e
     * sopravvivibile, e non punisce chi ha risparmiato più degli altri. */
    /* Una verifica fiscale o una causa costano una cifra, non una quota del
       patrimonio: "metà di tutto quello che hai messo da parte" puniva
       esattamente chi stava risparmiando per il primo affare. Due o tre
       mesi di rendita sono una stangata seria e sopravvivibile. */
    const mesi = casella.tipo === "verificaFiscale" ? 2 : 3;
    const perso = Math.min(g.contanti, arrotonda(redditoPassivo(g) * mesi));
    g.contanti -= perso;
    const nome = casella.tipo === "verificaFiscale" ? "Verifica fiscale" : "Causa legale";
    nota(s, `${g.nome}: ${nome}. Costa ${den(s, perso)}.`, "r15", { nome: g.nome, nome2: nome, importo: den(s, perso) }, "penalita", g.id);
    s.pending = { tipo: "penalitaVeloce", giocatoreId: g.id, nome, perso };
    return;
  }

  if (casella.tipo === "divorzio") {
    /* Il divorzio resta la casella peggiore del tabellone, ma un anno di
       rendita invece di tutto: azzerare i contanti rendeva impossibile
       ripartire, e nella realtà si divide un patrimonio, non lo si brucia. */
    /* Il divorzio resta la casella peggiore, ma sei mesi invece di tutto:
       azzerare i contanti rendeva impossibile ripartire, e nella realtà si
       divide un patrimonio, non lo si brucia. */
    const perso = Math.min(g.contanti, arrotonda(redditoPassivo(g) * 6));
    g.contanti -= perso;
    nota(s, `${g.nome}: Divorzio. Costa ${den(s, perso)}.`, "r16", { nome: g.nome, importo: den(s, perso) }, "penalita", g.id);
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
    nota(s, `🏆 ${g.nome} ha comprato il proprio sogno e vince la partita!`, "r17", { nome: g.nome }, "vittoria", g.id);
    return true;
  }
  if (
    g.tracciato === "veloce" &&
    redditoPassivo(g) >= traguardoLargo(s, g)
  ) {
    s.fase = "finita";
    s.vincitore = g.id;
    s.motivoVittoria = "rendita";
    nota(
      s,
      `🏆 ${g.nome} raddoppia la sua rendita al Largo e vince!`, "r18", { nome: g.nome, v: den(s, obiettivoDi(s)) },
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
      const p = getProfessione(s, g.professioneId);
      g.stipendio = p.stipendio;
      g.perFiglio = p.perFiglio;
      g.spese = { ...p.spese };
      g.passivita = { ...p.passivita, prestitoBanca: 0 };
      return ok();
    }
    if (s.giocatori.length >= MAX_GIOCATORI) return err(`Massimo ${MAX_GIOCATORI} giocatori.`);
    const nuovo = creaGiocatore(s, giocatoreId, azione.nome, azione.professioneId, azione.sognoId, s.giocatori.length);
    s.giocatori.push(nuovo);
    nota(s, `${nuovo.nome} entra nella stanza.`, "r19", { nuovoNome: nuovo.nome }, "lobby", nuovo.id);
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
      nota(s, `${g.nome} lascia la stanza.`, "r20", { nome: g.nome }, "lobby");
    } else {
      g.eliminato = true;
      nota(s, `${g.nome} abbandona la partita.`, "r21", { nome: g.nome }, "lobby", g.id);
      if (attuale(s)?.id === giocatoreId) prossimoTurno(s);
    }
    return ok();
  }

  if (tipo === "avvia") {
    if (s.fase !== "attesa") return err("La partita è già iniziata.");
    if (s.hostId !== giocatoreId) return err("Solo chi ha creato la stanza può avviare.");
    /* Al tavolo servono almeno due persone. In solitaria no: la sfida del
       giorno è una persona sola contro il proprio conto economico, e il
       motore è lo stesso — cambia solo chi si ha di fronte. */
    if (!s.solitaria && s.giocatori.length < 2) return err("Servono almeno 2 giocatori.");
    if (s.solitaria && s.giocatori.length !== 1) return err("La sfida si gioca da soli.");

    // Ognuno riceve il primo Giorno di Paga più i risparmi (regolamento pag. 2).
    for (const p of s.giocatori) {
      const prof = getProfessione(s, p.professioneId);
      p.contanti = flussoMensile(p) + prof.risparmi;
      p.mesi = 1; // quella prima paga è un mese lavorato come gli altri
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
    const ordineTesto = tiri.map((t) => `${t.nome} (${t.v})`).join(", ");
    nota(s, `Partita avviata. Ordine: ${ordineTesto}.`, "r22", { ordineTesto: ordineTesto }, "sistema");
    nota(s, `Tocca a ${s.giocatori[0].nome}.`, "r23", { v: s.giocatori[0].nome }, "turno", s.giocatori[0].id);
    return ok();
  }

  /* ─── Da qui in poi serve una partita in corso ─── */
  /* La chat non passa di qui (vedi chat.js), ma il suo interruttore sì:
     è una decisione della stanza, e va registrata come le altre. */
  if (tipo === "impostaChat") {
    if (s.hostId !== giocatoreId) return err("Solo chi ha creato la stanza può spegnere la chat.");
    s.chatAperta = azione.aperta !== false;
    if (!s.chatAperta) s.chat = [];
    nota(s, s.chatAperta ? "La chat è stata riaperta." : "La chat è stata spenta.", "sistema");
    return ok();
  }

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
    nota(s, "Fase di Mercato chiusa.", "r24", null, "mercato");
    prossimoTurno(s);
    return ok();
  }

  /* ─── Tutto il resto richiede che sia il tuo turno ─── */
  if (!suoTurno) return err("Non è il tuo turno.");

  /* ─── Azioni libere ─── */

  if (tipo === "prestito") {
    const imp = Math.floor(azione.importo || 0);
    if (imp < 1000 || imp % 1000 !== 0) return err("Il prestito è a multipli di $1.000.");
    /* Quanto la banca è disposta a prestare.
       Prima: mezzo milione a chiunque, senza guardare niente. Nella realtà
       il credito al consumo si concede se la rata — sommata a quelle già in
       corso — non supera circa un terzo del reddito netto mensile, ed è
       comunque limitato a poche decine di migliaia di euro. Vedi
       mercati/roma/fonti.js. */
    const tetto = massimoPrestabile(s, g);
    if (imp > tetto) {
      return err(tetto <= 0
        ? `La banca non concede altro credito: le rate che hai già assorbono un terzo del tuo reddito.`
        : `La banca arriva a ${den(s, tetto)}: la rata non può superare un terzo del reddito netto.`);
    }
    g.passivita.prestitoBanca += imp;
    g.contanti += imp;
    nota(s, `${g.nome} chiede un prestito di ${den(s, imp)} (rata +${den(s, imp / 10)}/mese).`, "r25", { nome: g.nome, importo: den(s, imp), importo2: den(s, imp / 10) }, "prestito", g.id);
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
      nota(s, `${g.nome} rimborsa ${den(s, imp)} di prestito bancario.`, "r26", { nome: g.nome, importo: den(s, imp) }, "prestito", g.id);
      return ok();
    }
    const debito = debitiEstinguibiliDi(s).find((d) => d.chiave === chiave);
    if (!debito) return err("Questo debito non è estinguibile.");
    const dovuto = g.passivita[chiave];
    if (!dovuto) return err("Non hai questo debito.");
    if (g.contanti < dovuto) return err("Contanti insufficienti: va estinto per intero.");
    g.contanti -= dovuto;
    g.passivita[chiave] = 0;
    g.spese[debito.spesa] = 0;
    nota(s, `${g.nome} estingue "${debito.nome}" (${den(s, dovuto)}): spese ridotte.`, "r27", { nome: g.nome, debitoNome: debito.nome, importo: den(s, dovuto) }, "prestito", g.id);
    return ok();
  }

  if (tipo === "esciDallaCorsa") {
    if (g.tracciato !== "topi") return err("Sei già al Largo.");
    if (s.pending) return err("Concludi prima l'azione in corso.");
    if (!fuoriDallaCorsa(g)) return err("Il tuo reddito passivo non supera ancora le spese totali.");
    const passivo = redditoPassivo(g);
    /* ═══ NIENTE LIQUIDAZIONE, NIENTE SALTO DI SCALA ═══
     *
     * Prima uscire moltiplicava per cento: chi lasciava la Ruota con 1.739 €
     * di rendita si trovava 173.900 € in contanti E 173.900 € a ogni Giorno
     * di Rendita. Il portafoglio costruito in tutta la prima metà smetteva
     * di contare — l'incasso non veniva più dagli immobili e dalle attività
     * ma da un numero astratto — e le spese sparivano del tutto. Erano due
     * giochi diversi attaccati con lo scotch, ed è il gioco da tavolo
     * originale a farlo così.
     *
     * Qui no. Uscire vuol dire una cosa sola e concreta: **smetti di
     * lavorare**. Lo stipendio va a zero; tutto il resto resta com'è — le
     * case, le attività, i debiti, l'affitto, la spesa. Il Giorno di Rendita
     * incassa quello che il tuo portafoglio produce davvero, meno quello che
     * ti costa vivere. La seconda metà non è un altro gioco: è la stessa
     * economia senza più la busta paga. */
    g.tracciato = "veloce";
    g.posizione = 0;
    g.stipendioPrimaDiUscire = g.stipendio;
    g.stipendio = 0;
    g.redditoInizialeVeloce = passivo;
    g.turniBeneficenza = 0;
    g.usciteDallaCorsa = g.turniGiocati;
    g.mesiAllUscita = g.mesi;
    nota(
      s,
      `🎉 ${g.nome} lascia il lavoro! Vive di ${den(s, passivo)} al mese di rendita. Obiettivo: ${den(s, traguardoLargo(s, g))}.`, "r28", { nome: g.nome, importo: den(s, passivo), importo2: den(s, passivo), v: den(s, passivo + obiettivoDi(s)) },
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
    /* `dado` serve alla logica del turno e viene azzerato al cambio turno.
       `ultimoTiro` serve invece a mostrarlo, e non si azzera mai: chi legge
       lo stato ogni 1,4 secondi altrimenti non vedrebbe mai i tiri altrui,
       perché la casella spesso si risolve dentro la stessa scrittura. Il
       contatore `n` permette al client di riconoscere un tiro nuovo. */
    s.ultimoTiro = {
      n: (s.ultimoTiro?.n || 0) + 1,
      giocatoreId: g.id, nome: g.nome, colore: g.colore,
      valori, totale: passi,
    };

    if (g.tracciato === "topi" && g.turniBeneficenza > 0) g.turniBeneficenza -= 1;

    const da = g.posizione;
    if (g.tracciato === "topi") {
      const paghe = paghePassate(da, passi);
      g.posizione = (da + passi) % N_RUOTA;
      nota(s, `${g.nome} tira ${valori.join(" + ")} = ${passi}.`, "r29", { nome: g.nome, v: valori.join(" + "), passi: passi }, "dado", g.id);
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
      nota(s, `${g.nome} tira ${valori.join(" + ")} = ${passi}.`, "r30", { nome: g.nome, v: valori.join(" + "), passi: passi }, "dado", g.id);
      for (let i = 0; i < giorni; i++) {
        g.mesi = (g.mesi || 0) + 1; // fuori dalla Ruota il tempo passa uguale
        /* Lo stesso conto del Giorno di Paga, senza lo stipendio: quello
           che rendono le tue cose, meno quello che ti costa vivere. */
        const flusso = flussoMensile(g);
        g.contanti += flusso;
        nota(s, `${g.nome} incassa il Giorno di Rendita: ${flusso >= 0 ? "+" : ""}${den(s, flusso)}.`, "r31", { nome: g.nome, importo: den(s, flusso) }, "paga", g.id);
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
    nota(s, `${g.nome} pesca un ${taglia === "grandi" ? "Grande" : "Piccolo"} Affare: "${carta.nome}".`,
      taglia === "grandi" ? "r32grande" : "r32piccolo", { nome: g.nome, cartaNome: carta.nome }, "carta", g.id);
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
        nota(s, `${g.nome} paga ${den(s, dovuto)} per "${c.nome}".`, "r33", { nome: g.nome, importo: den(s, dovuto), cNome: c.nome }, "carta", g.id);
      } else {
        nota(s, `${g.nome} non è colpito da "${c.nome}".`, "r34", { nome: g.nome, cNome: c.nome }, "carta", g.id);
      }
    } else {
      nota(s, `${g.nome} lascia perdere "${c.nome}".`, "r35", { nome: g.nome, cNome: c.nome }, "carta", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaExtra") {
    if (s.pending.tipo !== "extra") return err("Azione non valida ora.");
    const imp = s.pending.importo;
    if (imp > 0) {
      pagaObbligatorio(s, g, imp, `"${s.pending.carta.nome}"`);
      nota(s, `${g.nome} spende ${den(s, imp)}: "${s.pending.carta.nome}".`, "r36", { nome: g.nome, importo: den(s, imp), nome2: s.pending.carta.nome }, "extra", g.id);
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
      nota(s, `${g.nome} dona ${den(s, costo)}: 2 dadi per i prossimi 3 turni.`, "r37", { nome: g.nome, importo: den(s, costo) }, "beneficenza", g.id);
    } else {
      nota(s, `${g.nome} non dona.`, "r38", { nome: g.nome }, "beneficenza", g.id);
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "confermaFiglio") {
    if (s.pending.tipo !== "figlio") return err("Azione non valida ora.");
    if (s.pending.nuovo) {
      g.figli += 1;
      nota(s, `👶 ${g.nome} ha un figlio! Spese +${den(s, g.perFiglio)}/mese (figli: ${g.figli}).`, "r39", { nome: g.nome, importo: den(s, g.perFiglio), figli: g.figli }, "figlio", g.id);
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
    nota(s, `📉 ${g.nome} è licenziato: paga ${den(s, costo)} e salta 2 turni.`, "r40", { nome: g.nome, importo: den(s, costo) }, "licenziamento", g.id);
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
      /* Quali debiti si dimezzano lo dice il pacchetto, non il motore.
         Prima l'elenco era scritto a mano con le chiavi del mercato
         "classico": su Roma, che non ha la voce "rate", si scriveva NaN
         dentro le spese — e siccome arrotonda() trattava NaN come zero,
         il giocatore si ritrovava spese pari a zero, usciva dalla Ruota
         con una rendita irrisoria e restava impantanato al Largo. Un
         numero mancante non deve mai diventare uno zero silenzioso. */
      for (const d of debitiEstinguibiliDi(s)) {
        if (!d.dimezzabileInBancarotta) continue;
        if (Number.isFinite(g.passivita[d.chiave])) {
          g.passivita[d.chiave] = Math.floor(g.passivita[d.chiave] / 2);
        }
        if (Number.isFinite(g.spese[d.spesa])) {
          g.spese[d.spesa] = Math.floor(g.spese[d.spesa] / 2);
        }
      }
      nota(s, `${g.nome}: metà di prestito auto, carte e rate viene cancellata.`, "r41", { nome: g.nome }, "bancarotta", g.id);
    }
    if (flussoMensile(g) < 0) {
      g.eliminato = true;
      nota(s, `${g.nome} è ufficialmente fuori dalla partita.`, "r42", { nome: g.nome }, "bancarotta", g.id);
    } else {
      g.turniDaSaltare = 3;
      g.inBancarotta = false;
      if (g.contanti < 0) g.contanti = 0;
      nota(s, `${g.nome} esce dalla bancarotta e salta 3 turni.`, "r43", { nome: g.nome }, "bancarotta", g.id);
    }
    const restanti = s.giocatori.filter((p) => !p.eliminato);
    if (restanti.length === 1) {
      s.fase = "finita";
      s.vincitore = restanti[0].id;
      s.motivoVittoria = "ultimo";
      nota(s, `🏆 ${restanti[0].nome} è l'ultimo giocatore rimasto e vince.`, "r44", { v: restanti[0].nome }, "vittoria", restanti[0].id);
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
      /* Un affare del Largo è un attivo come gli altri: entra nel
         portafoglio e da lì produce, invece di sommarsi a un contatore
         separato che nessun'altra regola del gioco sa leggere. */
      g.attivita.push({
        rid: idBreve(s), categoria: "largo", nome: affare.nome,
        costo: affare.costo ?? affare.acconto, acconto: affare.acconto,
        passivita: Math.max(0, (affare.costo ?? affare.acconto) - affare.acconto),
        flusso: affare.flusso, mesiAcquisto: g.mesi ?? 0,
      });
      s.affariVenduti[affare.id] = g.id;
      nota(
        s,
        `${g.nome} compra "${affare.nome}" per ${den(s, affare.acconto)}: flusso +${den(s, affare.flusso)}/mese (totale ${den(s, redditoPassivo(g))}).`, "r45", { nome: g.nome, affareNome: affare.nome, importo: den(s, affare.acconto), importo2: den(s, affare.flusso), importo3: den(s, redditoPassivo(g)) },
        "veloce", g.id
      );
      if (controllaVittoria(s, g)) return ok();
    } else {
      nota(s, `${g.nome} lascia perdere "${affare.nome}".`, "r46", { nome: g.nome, affareNome: affare.nome }, "veloce", g.id);
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
      nota(s, `⭐ ${g.nome} compra il proprio sogno "${s.pending.sogno.nome}" per ${den(s, costo)}!`, "r47", { nome: g.nome, nome2: s.pending.sogno.nome, importo: den(s, costo) }, "sogno", g.id);
      if (controllaVittoria(s, g)) return ok();
    }
    prossimoTurno(s);
    return ok();
  }

  if (tipo === "beneficenzaVeloce") {
    if (s.pending.tipo !== "beneficenzaVeloce") return err("Azione non valida ora.");
    if (azione.accetta) {
      const costo = arrotonda(redditoPassivo(g) * 0.1);
      if (g.contanti < costo) return err("Contanti insufficienti.");
      g.contanti -= costo;
      g.beneficenzaVeloce = true;
      nota(s, `${g.nome} dona ${den(s, costo)}: da ora può scegliere quanti dadi tirare (1, 2 o 3).`, "r48", { nome: g.nome, importo: den(s, costo) }, "beneficenza", g.id);
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
    nota(s, `${g.nome} compra ${q} × ${c.simbolo} a ${den(s, c.prezzo)} (${den(s, costo)}).`, "r49", { nome: g.nome, q: q, simbolo: c.simbolo, prezzo: den(s, c.prezzo), importo: den(s, costo) }, "carta", g.id);
    return null;
  }

  if (c.tipo === "immobile") {
    if (g.contanti < c.acconto) return "Contanti insufficienti per l'acconto.";
    g.contanti -= c.acconto;
    /* Il flusso non è quello stampato sulla carta: è quello che risulta al
       livello di realismo della stanza. Al Livello 2 lo stesso bilocale può
       passare da +113 a -49 al mese, ed è tutto il punto dell'esercizio. */
    const flussoReale = flussoAlLivello(c, s.livello, pacchettoDi(s).fisco);
    g.immobili.push({
      rid: idBreve(s), categoria: c.categoria, nome: c.nome,
      costo: c.costo, acconto: c.acconto, mutuo: c.mutuo, flusso: flussoReale,
      canone: c.canone, rata: c.rata,
      /* Il mese dell'acquisto: la plusvalenza si tassa solo se si rivende
         entro cinque anni, ed è la regola che distingue l'investimento
         dalla speculazione. Senza questa data non si può sapere. */
      mesiAcquisto: g.mesi ?? 0,
    });
    nota(s, `${g.nome} compra "${c.nome}" (acconto ${den(s, c.acconto)}, flusso +${den(s, c.flusso)}/mese).`, "r50", { nome: g.nome, cNome: c.nome, importo: den(s, c.acconto), importo2: den(s, c.flusso) }, "carta", g.id);
    return null;
  }

  if (c.tipo === "attivita") {
    if (g.contanti < c.acconto) return "Contanti insufficienti per l'acconto.";
    g.contanti -= c.acconto;
    g.attivita.push({
      rid: idBreve(s), nome: c.nome, costo: c.costo,
      acconto: c.acconto, passivita: c.passivita || 0, flusso: c.flusso,
    });
    nota(s, `${g.nome} compra "${c.nome}" (acconto ${den(s, c.acconto)}, flusso +${den(s, c.flusso)}/mese).`, "r51", { nome: g.nome, cNome: c.nome, importo: den(s, c.acconto), importo2: den(s, c.flusso) }, "carta", g.id);
    return null;
  }

  if (c.tipo === "spesa") {
    const dovuto = c.condizione === "immobile" && g.immobili.length === 0 ? 0 : c.importo;
    pagaObbligatorio(s, g, dovuto, `"${c.nome}"`);
    nota(s, `${g.nome} paga ${den(s, dovuto)}: "${c.nome}".`, "r52", { nome: g.nome, importo: den(s, dovuto), cNome: c.nome }, "carta", g.id);
    return null;
  }

  return "Tipo di carta sconosciuto.";
}

/**
 * I conti di una vendita immobiliare.
 *
 * Il gioco incassava prezzo meno mutuo e basta: si comprava con 56.500 € di
 * acconto, arrivava un'offerta a 1,55× e si portavano a casa 143.600 € netti
 * — il 154% sul capitale, esentasse, in un turno. Nella realtà si paga
 * l'agenzia e, se si rivende entro cinque anni, un'imposta sostitutiva del
 * 26% sulla plusvalenza, trattenuta dal notaio al rogito. Dopo i cinque anni
 * la plusvalenza non si tassa più: è la regola che distingue l'investimento
 * dalla speculazione, ed è la cosa più utile che una compravendita in questo
 * gioco possa insegnare.
 */
function contiDellaVendita(s, g, bene, prezzo) {
  const cv = pacchettoDi(s).costiVendita;
  if (!cv) return { agenzia: 0, imposta: 0, netto: prezzo - (bene.mutuo || 0) };

  const agenzia = arrotonda(prezzo * cv.agenzia);
  const mesiPossesso = (g.mesi ?? 0) - (bene.mesiAcquisto ?? 0);
  /* La plusvalenza è prezzo di vendita meno prezzo d'acquisto: il mutuo non
     c'entra, è solo il modo in cui l'acquisto era stato pagato. */
  const guadagno = prezzo - (bene.costo || 0);
  const imposta = (mesiPossesso < cv.mesiEsenzione && guadagno > 0)
    ? arrotonda(guadagno * cv.plusvalenza)
    : 0;
  return { agenzia, imposta, netto: prezzo - (bene.mutuo || 0) - agenzia - imposta };
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
      nota(s, `${g.nome} vende "${a.nome}" a ${den(s, prezzo)} (netto ${den(s, netto)}).`, "r53", { nome: g.nome, aNome: a.nome, importo: den(s, prezzo), importo2: den(s, netto) }, "mercato", g.id);
      return null;
    }
    const i = g.immobili.find((x) => x.rid === azione.rid);
    if (!i) return "Immobile non trovato.";
    if (i.categoria !== c.categoria) return "Questa offerta non riguarda quell'immobile.";
    const prezzo = c.moltiplicatore ? arrotonda(i.costo * c.moltiplicatore) : c.prezzo;
    const { agenzia, imposta, netto } = contiDellaVendita(s, g, i, prezzo);
    g.contanti += netto;
    g.immobili = g.immobili.filter((x) => x.rid !== i.rid);
    nota(
      s,
      `${g.nome} vende "${i.nome}" a ${den(s, prezzo)}: meno ${den(s, i.mutuo)} di mutuo, ${den(s, agenzia)} di agenzia e ${den(s, imposta)} di imposta = ${den(s, netto)}.`, "r54", { nome: g.nome, iNome: i.nome, importo: den(s, prezzo), importo2: den(s, i.mutuo), importo3: den(s, netto) },
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
    nota(s, `${g.nome} vende ${q} × ${c.simbolo} a ${den(s, c.prezzo)} (+${den(s, incasso)}).`, "r55", { nome: g.nome, q: q, simbolo: c.simbolo, prezzo: den(s, c.prezzo), importo: den(s, incasso) }, "mercato", g.id);
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
    nota(s, `${g.nome} svende "${i.nome}" alla banca per ${den(s, incasso)}.`, "r56", { nome: g.nome, iNome: i.nome, importo: den(s, incasso) }, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "attivita") {
    const a = g.attivita.find((x) => x.rid === azione.rid);
    if (!a) return "Attività non trovata.";
    const incasso = meta(a.acconto);
    g.contanti += incasso;
    g.attivita = g.attivita.filter((x) => x.rid !== a.rid);
    nota(s, `${g.nome} svende "${a.nome}" alla banca per ${den(s, incasso)}.`, "r57", { nome: g.nome, aNome: a.nome, importo: den(s, incasso) }, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "azione") {
    const a = g.azioni.find((x) => x.simbolo === azione.simbolo);
    if (!a) return "Titolo non trovato.";
    const incasso = meta(a.quantita * a.prezzoAcquisto);
    g.contanti += incasso;
    g.azioni = g.azioni.filter((x) => x.simbolo !== a.simbolo);
    nota(s, `${g.nome} liquida ${a.simbolo} per ${den(s, incasso)}.`, "r58", { nome: g.nome, simbolo: a.simbolo, importo: den(s, incasso) }, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "debito") {
    const d = debitiEstinguibiliDi(s).find((x) => x.chiave === azione.chiave);
    if (!d) return "Debito non estinguibile.";
    const dovuto = g.passivita[d.chiave];
    if (!dovuto) return "Non hai questo debito.";
    if (g.contanti < dovuto) return "Contanti insufficienti.";
    g.contanti -= dovuto;
    g.passivita[d.chiave] = 0;
    g.spese[d.spesa] = 0;
    nota(s, `${g.nome} estingue "${d.nome}" durante la bancarotta.`, "r59", { nome: g.nome, dNome: d.nome }, "bancarotta", g.id);
    return null;
  }
  if (azione.categoria === "prestito") {
    const richiesto = Math.floor(azione.importo || 0);
    if (richiesto < 1000 || richiesto % 1000 !== 0) return "Rimborso a multipli di $1.000.";
    const imp = Math.min(g.passivita.prestitoBanca, richiesto);
    if (g.contanti < imp) return "Contanti insufficienti.";
    g.contanti -= imp;
    g.passivita.prestitoBanca -= imp;
    nota(s, `${g.nome} rimborsa ${den(s, imp)} di prestito.`, "r60", { nome: g.nome, importo: den(s, imp) }, "bancarotta", g.id);
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
        redditoRendita: redditoPassivo(g),
        guadagnoVeloce: redditoPassivo(g) - g.redditoInizialeVeloce,
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

export { MAX_GIOCATORI };
export { getPacchetto, pacchettoDi, MERCATI, MERCATO_PREDEFINITO } from "./mercati/indice.js";
