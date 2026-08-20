/**
 * I MAZZI DI ROMA.
 *
 * Gli immobili non sono scritti a mano: si calcolano dalle quotazioni per
 * zona (vedi derivazione.js), così ogni carta è riconducibile a un dato
 * pubblico e aggiornare Roma significa cambiare una tabella.
 *
 * Sulla composizione del mazzo c'è una scelta di progetto che vale la pena
 * dichiarare. Con i numeri veri di Roma, un appartamento comprato con
 * l'ottanta per cento di mutuo rende fra i 100 e i 140 euro al mese in
 * periferia, e PERDE denaro dentro il Raccordo. Un insegnante che tiene 150
 * euro al mese non arriverà mai a comprarne dodici.
 *
 * Perciò il mazzo contiene anche ciò che a Roma rende davvero e che i giochi
 * di questo genere ignorano sempre: box auto e posti auto, che rendono più
 * degli appartamenti e costano un decimo; immobili all'asta e con
 * finanziamento del venditore, dove l'anticipo crolla; e piccole attività,
 * che in Italia rendono sul capitale molto più del mattone.
 *
 * Non è una concessione al divertimento: è semplicemente vero, ed è la
 * lezione più utile che questo mazzo possa dare a chi vive a Roma.
 */
import { immobile, attivita } from "./derivazione.js";

export const CATEGORIE = {
  posto: "Posto o box auto",
  bilocale: "Bilocale",
  trilocale: "Trilocale",
  quadrilocale: "Quadrilocale",
  palazzina: "Piccola palazzina",
  stabile: "Stabile",
  terreno: "Terreno",
  attivita: "Attività",
};

/* ═══════════════════ PICCOLI AFFARI ═══════════════════ */
export const PICCOLI_AFFARI = [
  /* ── Box e posti auto: il rendimento più alto di Roma, e il più ignorato ── */
  { tipo: "immobile", categoria: "posto", nome: "Posto auto a Tuscolano", costo: 18000, acconto: 5500, mutuo: 13000, flusso: 62,
    testo: "Scoperto, in un cortile condominiale. Nessuna manutenzione, nessun inquilino da inseguire." },
  { tipo: "immobile", categoria: "posto", nome: "Box auto a Montesacro", costo: 32000, acconto: 9500, mutuo: 23000, flusso: 95,
    testo: "Chiuso, con serranda elettrica. In zona i box si affittano prima delle case." },
  { tipo: "immobile", categoria: "posto", nome: "Box auto a Prati", costo: 62000, acconto: 18000, mutuo: 45000, flusso: 150,
    testo: "Dove parcheggiare è impossibile, un box vale quanto una stanza." },
  { tipo: "immobile", categoria: "posto", nome: "Due posti auto a Ostia", costo: 24000, acconto: 7000, mutuo: 18000, flusso: 78,
    testo: "Affittati entrambi a residenti. D'estate si potrebbero rivalutare." },

  /* ── Bilocali in periferia: dove i conti tornano ── */
  immobile({ zonaId: "torbella", mq: 45, categoria: "bilocale", nome: "Bilocale a Tor Bella Monaca",
    testo: "Il rendimento lordo più alto della città. Il quartiere spaventa, i numeri no." }),
  immobile({ zonaId: "ostia", mq: 50, categoria: "bilocale", nome: "Bilocale a Ostia",
    testo: "A dieci minuti dal mare. Affitti stabili tutto l'anno, non solo d'estate." }),
  immobile({ zonaId: "primavalle", mq: 48, categoria: "bilocale", nome: "Bilocale a Primavalle",
    testo: "Palazzina anni Sessanta, ristrutturata di recente. Inquilino già dentro." }),
  immobile({ zonaId: "torpigna", mq: 50, categoria: "bilocale", nome: "Bilocale a Torpignattara",
    testo: "Quartiere che cambia in fretta. Chi è arrivato prima ha pagato la metà." }),
  immobile({ zonaId: "cinecitta", mq: 52, categoria: "bilocale", nome: "Bilocale a Cinecittà",
    testo: "Vicino alla metro A. Chi lavora in centro e non vuole pagare il centro." }),
  immobile({ zonaId: "portuense", mq: 55, categoria: "bilocale", nome: "Bilocale a Portuense",
    testo: "Vicino all'ospedale: personale sanitario in cerca di casa tutto l'anno." }),

  /* ── Aste e finanziamento del venditore: l'anticipo crolla ── */
  immobile({ zonaId: "torpigna", mq: 55, categoria: "trilocale", sconto: 0.22, ltv: 0.9,
    nome: "Trilocale all'asta a Torpignattara",
    testo: "Asta giudiziaria: sotto mercato, ma l'immobile va liberato. Anticipo ridotto." }),
  immobile({ zonaId: "ostia", mq: 60, categoria: "trilocale", sconto: 0.18, ltv: 0.9,
    nome: "Trilocale all'asta a Ostia",
    testo: "Gli eredi vogliono chiudere la pratica entro l'anno." }),
  immobile({ zonaId: "primavalle", mq: 58, categoria: "trilocale", sconto: 0.12, ltv: 0.88,
    nome: "Trilocale a Primavalle, il venditore finanzia",
    testo: "Il proprietario accetta di essere pagato a rate: entri con molto meno." }),

  /* ── Trilocali ── */
  immobile({ zonaId: "tuscolano", mq: 65, categoria: "trilocale", nome: "Trilocale a Tuscolano",
    testo: "Famiglia in affitto da quattro anni, pagamenti sempre puuntuali." }),
  immobile({ zonaId: "montesacro", mq: 68, categoria: "trilocale", nome: "Trilocale a Montesacro",
    testo: "Zona tranquilla e ben servita. Si affitta in una settimana." }),
  immobile({ zonaId: "cinecitta", mq: 70, categoria: "trilocale", nome: "Trilocale a Cinecittà",
    testo: "Da rinfrescare, ma strutturalmente a posto. Il prezzo lo rispecchia." }),

  /* ── Il centro: bello da raccontare, pessimo da far quadrare ── */
  immobile({ zonaId: "prati", mq: 70, categoria: "trilocale", nome: "Trilocale a Prati",
    testo: "L'indirizzo che tutti vogliono. Guarda il flusso mensile prima di innamorarti." }),
  immobile({ zonaId: "trastevere", mq: 55, categoria: "bilocale", nome: "Bilocale a Trastevere",
    testo: "Affascinante, turistico, carissimo. Il canone non tiene il passo del prezzo." }),
  immobile({ zonaId: "centro", mq: 50, categoria: "bilocale", nome: "Bilocale in Centro Storico",
    testo: "Nove metri quadri di storia per ogni metro di utile. Il conto è impietoso." }),

  /* ── Terreni: nessuna rendita, si scommette sulla rivalutazione ── */
  { tipo: "immobile", categoria: "terreno", nome: "Terreno agricolo sulla Tiberina", costo: 22000, acconto: 22000, mutuo: 0, flusso: 0,
    testo: "Nessun affitto. Si guadagna solo se il piano regolatore cambia idea." },
  { tipo: "immobile", categoria: "terreno", nome: "Lotto ai margini di Ostia", costo: 15000, acconto: 15000, mutuo: 0, flusso: 0,
    testo: "Scommessa pura. Potrebbe non succedere mai nulla." },

  /* ── Piccole attività: in Italia rendono sul capitale più del mattone ── */
  attivita({ nome: "Distributori automatici", costo: 12000, acconto: 12000, flusso: 260,
    testo: "Dodici macchine fra palestre e uffici. Rifornimento una volta a settimana." }),
  attivita({ nome: "Lavanderia a gettoni a San Lorenzo", costo: 38000, acconto: 14000, flusso: 420,
    testo: "Zona universitaria: incassi stabili da ottobre a luglio." }),
  attivita({ nome: "Chiosco al mercato rionale", costo: 22000, acconto: 9000, flusso: 310,
    testo: "Licenza e posteggio già assegnati. Si lavora la mattina." }),
  attivita({ nome: "Autolavaggio self-service", costo: 45000, acconto: 16000, flusso: 480,
    testo: "Due piazzole su una strada di scorrimento. Quasi tutto automatico." }),
  attivita({ nome: "Corso online già registrato", costo: 8000, acconto: 8000, flusso: 190,
    testo: "Girato e pubblicato: incassa senza chiederti altro tempo." }),
  attivita({ nome: "Tre appartamenti in sublocazione", costo: 18000, acconto: 18000, flusso: 350,
    testo: "Sublocazione autorizzata per iscritto. Gestione affidata a un'agenzia." }),
  attivita({ nome: "Piccolo e-commerce avviato", costo: 26000, acconto: 11000, flusso: 330,
    testo: "Nicchia stretta, margini alti, magazzino esternalizzato." }),

  /* ── Titoli: quote di fondi, non consigli su strumenti veri ── */
  { tipo: "azione", nome: "Quote Farmia", simbolo: "FARMIA", prezzo: 12, dividendo: 0, min: 6, max: 34,
    testo: "Azienda farmaceutica di fantasia, ai minimi dopo una causa. Fascia 6 – 34." },
  { tipo: "azione", nome: "Quote Farmia", simbolo: "FARMIA", prezzo: 24, dividendo: 0, min: 6, max: 34,
    testo: "Un farmaco supera la fase due e il titolo si riprende." },
  { tipo: "azione", nome: "Quote Voltia", simbolo: "VOLTIA", prezzo: 15, dividendo: 0, min: 10, max: 44,
    testo: "Elettronica di consumo. Nessuna cedola, si guadagna solo rivendendo." },
  { tipo: "azione", nome: "Quote Energa", simbolo: "ENERGA", prezzo: 26, dividendo: 1.2, min: 20, max: 44,
    testo: "Servizi energetici regolati: distribuisce 1,20 per quota al mese." },
  { tipo: "azione", nome: "Quote Energa", simbolo: "ENERGA", prezzo: 34, dividendo: 1.2, min: 20, max: 44,
    testo: "Tariffe approvate dall'autorità: la cedola resta." },
  { tipo: "azione", nome: "Fondo Dimora", simbolo: "DIMORA", prezzo: 14, dividendo: 0.6, min: 8, max: 32,
    testo: "Fondo immobiliare di fantasia: distribuisce 0,60 per quota al mese." },
  { tipo: "azione", nome: "Fondo Altura", simbolo: "ALTURA", prezzo: 18, dividendo: 0, min: 10, max: 34,
    testo: "Fondo a forte crescita, nessuna cedola. Si scommette sul prezzo." },
  { tipo: "azione", nome: "Conto deposito vincolato", simbolo: "DEPOSITO", prezzo: 1000, dividendo: 2.4, min: 1000, max: 1000, unitaSingola: true,
    testo: "1.000 vincolati che rendono 2,40 al mese. Sicuro, lentissimo, onesto." },

  /* ── Spese e imprevisti legati agli immobili ── */
  { tipo: "spesa", nome: "Rifacimento della facciata", importo: 3200, condizione: "immobile",
    testo: "Delibera condominiale: la tua quota va versata entro due mesi." },
  { tipo: "spesa", nome: "Caldaia da sostituire", importo: 1800, condizione: "immobile",
    testo: "L'inquilino chiama a novembre. Non si rimanda." },
  { tipo: "spesa", nome: "Inquilino moroso", importo: 1400, condizione: "immobile",
    testo: "Tre mensilità non incassate e le spese dell'avvocato." },
  { tipo: "spesa", nome: "Un amico chiede un prestito", importo: 1000, opzionale: true,
    testo: "Puoi rifiutare senza alcuna penalità. Puoi anche dire di sì." },
];

/* ═══════════════════ GRANDI AFFARI ═══════════════════ */
export const GRANDI_AFFARI = [
  immobile({ zonaId: "torbella", mq: 120, categoria: "palazzina", nome: "Quattro bilocali a Tor Bella Monaca",
    testo: "Un'unica proprietà, quattro inquilini. Il rischio si divide per quattro." }),
  immobile({ zonaId: "ostia", mq: 160, categoria: "palazzina", nome: "Palazzina di sei unità a Ostia",
    testo: "Occupazione piena da tre anni. Gestione già affidata a un'agenzia." }),
  immobile({ zonaId: "primavalle", mq: 140, categoria: "palazzina", nome: "Cinque unità a Primavalle",
    testo: "Il proprietario va in pensione e vende tutto insieme." }),
  immobile({ zonaId: "torpigna", mq: 180, categoria: "palazzina", sconto: 0.15, ltv: 0.85,
    nome: "Palazzina all'asta a Torpignattara",
    testo: "Sotto mercato: due unità sono da liberare, e ci vorrà tempo." }),
  immobile({ zonaId: "cinecitta", mq: 200, categoria: "stabile", nome: "Stabile di otto unità a Cinecittà",
    testo: "Vicino alla metro. Lista d'attesa per gli affitti." }),
  immobile({ zonaId: "portuense", mq: 240, categoria: "stabile", nome: "Stabile di dieci unità a Portuense",
    testo: "Grande, impegnativo, redditizio. Serve qualcuno che lo gestisca." }),
  immobile({ zonaId: "tuscolano", mq: 150, categoria: "palazzina", nome: "Cinque unità a Tuscolano",
    testo: "Impianti rifatti l'anno scorso: nessuna sorpresa a breve." }),
  immobile({ zonaId: "montesacro", mq: 130, categoria: "palazzina", nome: "Quattro unità a Montesacro",
    testo: "Affittate a personale sanitario dell'ospedale vicino." }),
  immobile({ zonaId: "ostiense", mq: 200, categoria: "stabile", nome: "Stabile a Ostiense",
    testo: "Zona in piena rivalutazione. Il rendimento oggi è modesto, domani si vedrà." }),
  immobile({ zonaId: "garbatella", mq: 170, categoria: "palazzina", nome: "Palazzina a Garbatella",
    testo: "Quartiere amatissimo. Si compra col cuore, si tiene con i conti." }),

  { tipo: "immobile", categoria: "terreno", nome: "Terreno edificabile sulla Cassia", costo: 180000, acconto: 180000, mutuo: 0, flusso: 0,
    testo: "Permesso a costruire già rilasciato. Nessuna rendita finché non si costruisce." },

  attivita({ nome: "Pizzeria avviata a San Lorenzo", costo: 140000, acconto: 45000, flusso: 1350,
    testo: "Locale storico, clientela fissa, il pizzaiolo resta." }),
  attivita({ nome: "Bed and breakfast a Trastevere", costo: 260000, acconto: 80000, flusso: 2100,
    testo: "Sei camere, licenza in regola. Dipende dal turismo, e il turismo va e viene." }),
  attivita({ nome: "Deposito self-storage al Prenestino", costo: 320000, acconto: 95000, flusso: 2650,
    testo: "Occupazione stabile all'88%. Quasi nessun personale." }),
  attivita({ nome: "Catena di tre lavanderie", costo: 180000, acconto: 60000, flusso: 1500,
    testo: "Tre punti in quartieri diversi, tutti con contratti lunghi." }),
  attivita({ nome: "Palestra di quartiere", costo: 150000, acconto: 52000, flusso: 1250,
    testo: "Seicento abbonati. Il modello regge finché non apre una catena vicino." }),
  attivita({ nome: "Software gestionale per studi medici", costo: 120000, acconto: 42000, flusso: 1400,
    testo: "Abbonamenti annuali da settanta studi. Margini alti, serve un tecnico." }),
  attivita({ nome: "Impianto fotovoltaico in locazione", costo: 220000, acconto: 70000, flusso: 1600,
    testo: "Incentivo ventennale già assegnato. Manutenzione a carico del gestore." }),
  attivita({ nome: "Rete di sei distributori automatici h24", costo: 95000, acconto: 34000, flusso: 950,
    testo: "Postazioni h24 in zone di passaggio. Rifornimento esternalizzato." }),
  attivita({ nome: "Autolavaggio in franchising", costo: 210000, acconto: 68000, flusso: 1700,
    testo: "Tre impianti su strade ad alto traffico. Marchio riconosciuto." }),
  attivita({ nome: "Studio dentistico associato", costo: 280000, acconto: 88000, flusso: 2200,
    testo: "Due poltrone, convenzioni assicurative, professionisti già dentro." }),

  { tipo: "spesa", nome: "Causa da un inquilino", importo: 6500, condizione: "immobile",
    testo: "Infortunio nelle parti comuni. L'assicurazione copre solo una parte." },
];

/* ═══════════════════ IL MERCATO ═══════════════════ */
export const MERCATO = [
  { tipo: "offerta", categoria: "bilocale", nome: "Giovane coppia cerca il primo bilocale", moltiplicatore: 1.22,
    testo: "Offre il 122% del costo per un bilocale. I mutui agevolati per gli under 36 muovono il mercato." },
  { tipo: "offerta", categoria: "bilocale", nome: "Investitore rastrella bilocali in periferia", moltiplicatore: 1.15,
    testo: "Offerta rapida, sotto le aspettative, ma in contanti." },
  { tipo: "offerta", categoria: "trilocale", nome: "Famiglia cerca un trilocale", moltiplicatore: 1.25,
    testo: "Trasferimento di lavoro: devono chiudere entro il mese." },
  { tipo: "offerta", categoria: "quadrilocale", nome: "Cercasi quadrilocale con terrazzo", moltiplicatore: 1.28,
    testo: "Il quartiere è diventato di moda e i prezzi sono saliti." },
  { tipo: "offerta", categoria: "posto", nome: "Il condominio compra i posti auto", moltiplicatore: 1.35,
    testo: "Vogliono chiudere il cortile. Offrono il 135% del costo." },
  { tipo: "offerta", categoria: "palazzina", nome: "Fondo immobiliare compra palazzine", moltiplicatore: 1.30,
    testo: "Un fondo sta costruendo un portafoglio residenziale a Roma sud." },
  { tipo: "offerta", categoria: "stabile", nome: "Gruppo internazionale cerca stabili", moltiplicatore: 1.26,
    testo: "Vogliono interi stabili da riconvertire in affitti brevi." },
  { tipo: "offerta", categoria: "terreno", nome: "Variante urbanistica approvata", prezzo: 260000,
    testo: "Il terreno agricolo diventa edificabile. Succede di rado, e cambia tutto." },
  { tipo: "offerta", categoria: "terreno", nome: "Cercasi lotto per un supermercato", prezzo: 95000,
    testo: "Una catena della distribuzione cerca terreni fuori dal Raccordo." },
  { tipo: "offerta", categoria: "attivita", nome: "Un concorrente vuole comprarti", moltiplicatore: 1.55,
    testo: "Offre il 155% del costo per una qualsiasi delle tue attività." },
  { tipo: "offerta", categoria: "attivita", nome: "Fondo di private equity", moltiplicatore: 1.30,
    testo: "Offerta di uscita al 130% del costo per una tua attività." },

  { tipo: "prezzo", simbolo: "FARMIA", prezzo: 34, nome: "Farmia ai massimi",
    testo: "Approvato un nuovo farmaco. Tutti possono vendere a 34." },
  { tipo: "prezzo", simbolo: "FARMIA", prezzo: 6, nome: "Farmia crolla",
    testo: "Effetti collaterali inattesi: il titolo torna al minimo di fascia." },
  { tipo: "prezzo", simbolo: "VOLTIA", prezzo: 44, nome: "Offerta pubblica su Voltia",
    testo: "Un gruppo estero lancia un'OPA. Tutti possono vendere a 44." },
  { tipo: "prezzo", simbolo: "VOLTIA", prezzo: 10, nome: "Voltia delude",
    testo: "Trimestrale sotto le attese, il titolo torna ai minimi." },
  { tipo: "prezzo", simbolo: "ENERGA", prezzo: 44, nome: "Energa acquisita",
    testo: "Fusione nel settore energetico. Tutti possono vendere a 44." },
  { tipo: "prezzo", simbolo: "ALTURA", prezzo: 34, nome: "Altura ai massimi",
    testo: "Il mercato corre e il fondo con lui." },
  { tipo: "prezzo", simbolo: "DIMORA", prezzo: 32, nome: "Dimora si rivaluta",
    testo: "Gli affitti salgono e il fondo immobiliare con loro." },

  { tipo: "evento", effetto: "spesaPerImmobile", importo: 420, nome: "Acconto IMU",
    testo: "Ogni giocatore paga 420 per ciascun immobile che non sia la propria abitazione." },
  { tipo: "evento", effetto: "incassoPerAttivita", importo: 900, nome: "Estate romana",
    testo: "Turismo record: ogni giocatore incassa 900 per ciascuna attività." },
  { tipo: "evento", effetto: "spesaPerImmobile", importo: 260, nome: "Aumento delle spese condominiali",
    testo: "Assicurazione e manutenzione salgono per tutti: 260 per immobile." },
  /* Il rischio vero di chi vive di affitti non è una spesa una tantum: è
     che cambi quanto entra ogni mese. Queste carte lo mettono sul tavolo. */
  { tipo: "evento", effetto: "variazioneCanoni", variazione: -0.15, nome: "Il mercato degli affitti si raffredda",
    testo: "Nuove regole sugli affitti brevi e più offerta in città: i canoni calano del 15% per tutti." },
  { tipo: "evento", effetto: "variazioneCanoni", variazione: 0.12, nome: "Corsa agli affitti",
    testo: "Domanda in crescita e poca offerta: i canoni salgono del 12% per tutti." },
  { tipo: "evento", effetto: "variazioneRate", variazione: 0.015, nome: "La BCE alza i tassi",
    testo: "Chi ha un mutuo a tasso variabile vede salire la rata. Chi non ha debiti non se ne accorge." },

  { tipo: "evento", effetto: "nessuno", nome: "Nuova fermata della metro C",
    testo: "Il quartiere si rivaluta. Nessun effetto immediato: i prossimi compratori pagheranno di più." },
];

/* ═══════════════════ SPESE EXTRA ═══════════════════ */
export const EXTRA = [
  { nome: "Bollo e revisione dell'auto", importo: 320, testo: "Arrivano sempre insieme, e sempre a gennaio." },
  { nome: "Telefono nuovo", importo: 380, testo: "Il vecchio funzionava ancora benissimo." },
  { nome: "Multa dell'autovelox", importo: 180, testo: "Sulla Colombo, in un tratto che conoscevi benissimo." },
  { nome: "Dentista", importo: 520, testo: "Una carie che sembrava innocua." },
  { nome: "Il cane dal veterinario", importo: 280, testo: "Ha mangiato qualcosa che non doveva. Di nuovo." },
  { nome: "Lavatrice da sostituire", importo: 420, testo: "Si è rotta con il bucato dentro." },
  { nome: "Cena e regalo di anniversario", importo: 160, testo: "Dimenticato, poi recuperato a caro prezzo." },
  { nome: "Weekend last minute", importo: 340, testo: "L'offerta scadeva tra due ore. Almeno così ti hanno detto." },
  { nome: "Gomme nuove", importo: 380, testo: "Il gommista è stato chiaro: non si rimanda." },
  { nome: "Abbonamento in palestra annuale", importo: 420, testo: "Da marzo diventerà un appendiabiti." },
  { nome: "Televisore nuovo", importo: 450, testo: "Quello vecchio aveva solo sei anni." },
  { nome: "Idraulico d'urgenza", importo: 340, testo: "Domenica sera, tariffa maggiorata." },
  { nome: "Vacanza in famiglia", importo: 900, testo: "Prenotata prima di guardare il conto corrente." },
  { nome: "Riparazione della frizione", importo: 650, testo: "Nessun preavviso, come sempre." },
  { nome: "Occhiali nuovi", importo: 300, testo: "Montatura firmata, lenti progressive." },
  { nome: "Regalo di matrimonio", importo: 180, testo: "Lista nozze in un negozio molto costoso." },
  { nome: "Abbonamenti in streaming dimenticati", importo: 140, testo: "Sette servizi attivi, due davvero usati." },
  { nome: "Corso online mai finito", importo: 220, testo: "Sei arrivato alla lezione due." },
  { nome: "Bicicletta elettrica", importo: 620, testo: "La userai tutti i giorni. Promesso." },
  { nome: "Scarpe e vestiti per i figli", importo: 110, perFiglio: true, testo: "Crescono più in fretta del previsto. 160 per figlio." },
  { nome: "Centro estivo", importo: 260, perFiglio: true, testo: "Due settimane di serenità, a caro prezzo. 380 per figlio." },
  { nome: "Libri e materiale scolastico", importo: 210, perFiglio: true, testo: "Ogni settembre, puntuale. 300 per figlio." },
  { nome: "Impianto audio", importo: 480, testo: "Il negoziante è stato molto convincente." },
  { nome: "Quota in una barca con gli amici", importo: 950, testo: "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende." },
];

export const MAZZI = {
  piccoli: PICCOLI_AFFARI,
  grandi: GRANDI_AFFARI,
  mercato: MERCATO,
  extra: EXTRA,
};
