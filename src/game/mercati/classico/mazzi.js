/**
 * I mazzi di Quota Zero, tradotti e adattati in italiano.
 *
 *  PICCOLI_AFFARI  -> Opportunità "Piccolo Affare" (max $5.000 di entrata)
 *  GRANDI_AFFARI   -> Opportunità "Grande Affare"  (da $6.000 in su)
 *  MERCATO         -> Il Mercato (compratori ed eventi economici)
 *  EXTRA           -> Spese Extra / spese non necessarie (obbligatorie)
 *
 * Tipi di carta:
 *  azione     { simbolo, prezzo, dividendo, min, max }   compra/vendi titoli
 *  immobile   { categoria, costo, acconto, mutuo, flusso }
 *  attivita   { costo, acconto, passivita, flusso }
 *  spesa      { importo }  costo secco, eventualmente condizionato
 *  offerta    (mercato) compratore per una categoria di immobili/attività
 *  prezzo     (mercato) nuovo prezzo di un titolo: tutti possono vendere
 *  evento     (mercato) evento economico che colpisce tutti
 */

/* ── Categorie immobiliari, usate per far combaciare offerte e proprietà ── */
export const CATEGORIE = {
  casa2: "Casa 2 locali",
  casa3: "Casa 3 locali",
  casa4: "Casa 4 locali",
  duplex: "Bifamiliare",
  quadri: "Quadrifamiliare",
  otto: "Palazzina 8 unità",
  appartamenti: "Condominio",
  terreno: "Terreno",
  attivita: "Attività",
};

/* ═══════════════════ PICCOLI AFFARI ═══════════════════ */
export const PICCOLI_AFFARI = [
  // ── Titoli ──
  { id: "pa01", tipo: "azione", nome: "Azioni Farmia", simbolo: "FARMIA", prezzo: 5, dividendo: 0, min: 5, max: 30,
    testo: "Il titolo è ai minimi storici dopo una causa legale. Solo tu puoi comprare a questo prezzo; tutti possono vendere." },
  { id: "pa02", tipo: "azione", nome: "Azioni Farmia", simbolo: "FARMIA", prezzo: 10, dividendo: 0, min: 5, max: 30,
    testo: "Un nuovo farmaco supera la fase 2. Fascia di oscillazione $5 - $30." },
  { id: "pa03", tipo: "azione", nome: "Azioni Farmia", simbolo: "FARMIA", prezzo: 20, dividendo: 0, min: 5, max: 30,
    testo: "La forza del mercato spinge in alto le quotazioni di questo storico produttore di medicinali." },
  { id: "pa04", tipo: "azione", nome: "Azioni Voltia", simbolo: "VOLTIA", prezzo: 10, dividendo: 0, min: 10, max: 40,
    testo: "Azienda di elettronica di consumo. Nessun dividendo, forte crescita attesa." },
  { id: "pa05", tipo: "azione", nome: "Azioni Voltia", simbolo: "VOLTIA", prezzo: 20, dividendo: 0, min: 10, max: 40,
    testo: "Il nuovo modello va a ruba nei negozi. Fascia di oscillazione $10 - $40." },
  { id: "pa06", tipo: "azione", nome: "Azioni Voltia", simbolo: "VOLTIA", prezzo: 30, dividendo: 0, min: 10, max: 40,
    testo: "Gli analisti alzano il target. Sei ancora in tempo o è già tardi?" },
  { id: "pa07", tipo: "azione", nome: "Azioni Energa", simbolo: "ENERGA", prezzo: 20, dividendo: 1, min: 20, max: 40,
    testo: "Azienda di servizi energetici: paga $1 di dividendo per azione al mese." },
  { id: "pa08", tipo: "azione", nome: "Azioni Energa", simbolo: "ENERGA", prezzo: 30, dividendo: 1, min: 20, max: 40,
    testo: "Tariffe approvate dall'autorità: il dividendo resta $1 per azione al mese." },
  { id: "pa09", tipo: "azione", nome: "Fondo comune Altura", simbolo: "ALTURA", prezzo: 10, dividendo: 0, min: 10, max: 30,
    testo: "Fondo azionario a forte crescita. Nessuna cedola, si guadagna sulla rivendita." },
  { id: "pa10", tipo: "azione", nome: "Fondo comune Altura", simbolo: "ALTURA", prezzo: 20, dividendo: 0, min: 10, max: 30,
    testo: "Il fondo ha battuto l'indice per il terzo anno consecutivo." },
  { id: "pa11", tipo: "azione", nome: "Fondo immobiliare Dimora", simbolo: "DIMORA", prezzo: 10, dividendo: 0.5, min: 5, max: 30,
    testo: "Fondo immobiliare quotato: distribuisce $0,50 per azione al mese." },
  { id: "pa12", tipo: "azione", nome: "Fondo immobiliare Dimora", simbolo: "DIMORA", prezzo: 25, dividendo: 0.5, min: 5, max: 30,
    testo: "Gli affitti salgono e il fondo si rivaluta. Cedola invariata a $0,50." },
  { id: "pa13", tipo: "azione", nome: "Certificato di deposito", simbolo: "CD", prezzo: 1000, dividendo: 5, min: 1000, max: 1000, unitaSingola: true,
    testo: "Deposito vincolato: $1.000 che rendono $5 al mese. Sicuro, ma lento." },

  // ── Immobili ──
  { id: "pa14", tipo: "immobile", categoria: "casa2", nome: "Casa 2 locali in vendita", costo: 45000, acconto: 5000, mutuo: 40000, flusso: 140,
    testo: "Il proprietario si trasferisce e vende in fretta. Zona tranquilla, inquilino già presente." },
  { id: "pa15", tipo: "immobile", categoria: "casa2", nome: "Casa 2 locali all'asta", costo: 40000, acconto: 4000, mutuo: 36000, flusso: 100,
    testo: "Immobile pignorato, venduto all'asta giudiziaria sotto il valore di mercato." },
  { id: "pa16", tipo: "immobile", categoria: "casa3", nome: "Casa 3 locali, quartiere in crescita", costo: 65000, acconto: 6000, mutuo: 59000, flusso: 160,
    testo: "Vicino alla nuova fermata della metropolitana. Lista d'attesa per gli affitti." },
  { id: "pa17", tipo: "immobile", categoria: "casa3", nome: "Casa 3 locali da ristrutturare", costo: 50000, acconto: 5000, mutuo: 45000, flusso: 120,
    testo: "Serve lavoro, ma il prezzo lo rispecchia. Buon potenziale di rivalutazione." },
  { id: "pa18", tipo: "immobile", categoria: "casa4", nome: "Casa 4 locali con giardino", costo: 80000, acconto: 8000, mutuo: 72000, flusso: 200,
    testo: "Famiglia numerosa in affitto da tre anni, pagamenti sempre puntuali." },
  { id: "pa19", tipo: "immobile", categoria: "duplex", nome: "Bifamiliare", costo: 100000, acconto: 5000, mutuo: 95000, flusso: 300,
    testo: "Due unità, entrambe affittate. Il venditore accetta un acconto minimo." },
  { id: "pa20", tipo: "immobile", categoria: "casa2", nome: "Casa 2 locali, vendita del proprietario", costo: 30000, acconto: 3000, mutuo: 27000, flusso: 90,
    testo: "Venduta direttamente dal proprietario, senza agenzia. Nessuna provvigione." },
  { id: "pa21", tipo: "immobile", categoria: "terreno", nome: "10 ettari di terreno agricolo", costo: 5000, acconto: 5000, mutuo: 0, flusso: 0,
    testo: "Nessun affitto: guadagni solo quando il terreno viene rivalutato e rivenduto." },
  { id: "pa22", tipo: "immobile", categoria: "terreno", nome: "20 ettari ai margini della città", costo: 4000, acconto: 4000, mutuo: 0, flusso: 0,
    testo: "Il piano regolatore potrebbe cambiare. Scommessa pura sul futuro." },
  { id: "pa23", tipo: "immobile", categoria: "casa3", nome: "Casa 3 locali, affare del mese", costo: 55000, acconto: 4000, mutuo: 51000, flusso: 130,
    testo: "Gli eredi vogliono liquidare in fretta. Acconto ridotto concordato." },

  // ── Piccole attività ──
  { id: "pa24", tipo: "attivita", categoria: "attivita", nome: "Distributori automatici", costo: 5000, acconto: 5000, passivita: 0, flusso: 100,
    testo: "Otto distributori in palestre e uffici. Rifornimento una volta a settimana." },
  { id: "pa25", tipo: "attivita", categoria: "attivita", nome: "Autolavaggio self-service", costo: 5000, acconto: 2000, passivita: 3000, flusso: 80,
    testo: "Due piazzole automatiche in una zona di passaggio." },
  { id: "pa26", tipo: "attivita", categoria: "attivita", nome: "Lavanderia a gettoni", costo: 4000, acconto: 2000, passivita: 2000, flusso: 60,
    testo: "Vicino a un campus universitario. Incassi stabili tutto l'anno." },
  { id: "pa27", tipo: "attivita", categoria: "attivita", nome: "Chiosco di street food", costo: 4500, acconto: 4500, passivita: 0, flusso: 90,
    testo: "Licenza già ottenuta, posizione assegnata nel mercato coperto." },
  { id: "pa28", tipo: "attivita", categoria: "attivita", nome: "Corso online già registrato", costo: 3000, acconto: 3000, passivita: 0, flusso: 70,
    testo: "Il corso è girato e pubblicato: incassa senza il tuo tempo." },

  // ── Spese e imprevisti ──
  { id: "pa29", tipo: "spesa", nome: "Il tetto perde", importo: 2000, condizione: "immobile",
    testo: "Uno dei tuoi immobili ha bisogno di un tetto nuovo. Paghi solo se possiedi almeno un immobile." },
  { id: "pa30", tipo: "spesa", nome: "Caldaia da sostituire", importo: 1500, condizione: "immobile",
    testo: "L'inquilino chiama a novembre. Non puoi rimandare." },
  { id: "pa31", tipo: "spesa", nome: "Un amico chiede un prestito", importo: 1000, opzionale: true,
    testo: "Un vecchio amico ti chiede $1.000. Puoi rifiutare senza alcuna penalità." },
  { id: "pa32", tipo: "spesa", nome: "Inquilino moroso", importo: 500, condizione: "immobile",
    testo: "Un mese di affitto non incassato, più le spese legali." },

  // ── Altri titoli e occasioni ──
  { id: "pa33", tipo: "azione", nome: "Azioni Farmia", simbolo: "FARMIA", prezzo: 30, dividendo: 0, min: 5, max: 30,
    testo: "Massimo storico. Chi ha comprato a $5 sorride." },
  { id: "pa34", tipo: "immobile", categoria: "casa2", nome: "Casa 2 locali, zona universitaria", costo: 35000, acconto: 3500, mutuo: 31500, flusso: 110,
    testo: "Studenti in affitto tutto l'anno accademico." },
  { id: "pa35", tipo: "attivita", categoria: "attivita", nome: "Micro-società di software", costo: 5000, acconto: 2500, passivita: 2500, flusso: 120,
    testo: "Un piccolo gestionale con 40 clienti in abbonamento. Margini alti." },
  { id: "pa36", tipo: "immobile", categoria: "casa4", nome: "Casa 4 locali pignorata", costo: 75000, acconto: 3000, mutuo: 72000, flusso: 150,
    testo: "La banca vuole chiudere la pratica. Acconto sorprendentemente basso." },
  { id: "pa37", tipo: "azione", nome: "Fondo comune Altura", simbolo: "ALTURA", prezzo: 30, dividendo: 0, min: 10, max: 30,
    testo: "Il fondo è caro. Gli analisti consigliano prudenza." },
  { id: "pa38", tipo: "immobile", categoria: "duplex", nome: "Bifamiliare da ristrutturare", costo: 90000, acconto: 9000, mutuo: 81000, flusso: 250,
    testo: "Una unità è già affittata, l'altra da sistemare." },
  { id: "pa39", tipo: "attivita", categoria: "attivita", nome: "Tre monolocali su affitto breve", costo: 5000, acconto: 5000, passivita: 0, flusso: 110,
    testo: "Sublocazione autorizzata dal proprietario. Gestione affidata a terzi." },
  { id: "pa40", tipo: "spesa", nome: "Multa edilizia", importo: 800, condizione: "immobile",
    testo: "Una difformità catastale su un tuo immobile: sanzione da pagare." },
];

/* ═══════════════════ GRANDI AFFARI ═══════════════════ */
export const GRANDI_AFFARI = [
  { id: "ga01", tipo: "immobile", categoria: "quadri", nome: "Quadrifamiliare in vendita", costo: 90000, acconto: 15000, mutuo: 75000, flusso: 640,
    testo: "Quattro unità, tutte affittate. Il proprietario va in pensione e vende." },
  { id: "ga02", tipo: "immobile", categoria: "quadri", nome: "Quadrifamiliare ristrutturata", costo: 120000, acconto: 20000, mutuo: 100000, flusso: 800,
    testo: "Impianti rifatti l'anno scorso. Nessuna manutenzione prevista a breve." },
  { id: "ga03", tipo: "immobile", categoria: "otto", nome: "Palazzina 8 unità", costo: 200000, acconto: 30000, mutuo: 170000, flusso: 1400,
    testo: "Occupazione al 100% da due anni. Zona con forte domanda di affitti." },
  { id: "ga04", tipo: "immobile", categoria: "appartamenti", nome: "Condominio 12 appartamenti", costo: 350000, acconto: 50000, mutuo: 300000, flusso: 2400,
    testo: "Offerto dagli eredi fuori regione del vecchio proprietario. Lunga lista d'attesa. ROI 58%." },
  { id: "ga05", tipo: "immobile", categoria: "appartamenti", nome: "Condominio 20 appartamenti", costo: 600000, acconto: 90000, mutuo: 510000, flusso: 4200,
    testo: "Grande complesso residenziale con gestione già avviata." },
  { id: "ga06", tipo: "immobile", categoria: "otto", nome: "Palazzina 8 unità, occasione", costo: 160000, acconto: 20000, mutuo: 140000, flusso: 1100,
    testo: "Il venditore ha bisogno di liquidità entro fine mese." },
  { id: "ga07", tipo: "attivita", categoria: "attivita", nome: "Pizzeria avviata", costo: 50000, acconto: 15000, passivita: 35000, flusso: 500,
    testo: "Locale storico con clientela fissa. Il cuoco resta in azienda." },
  { id: "ga08", tipo: "attivita", categoria: "attivita", nome: "Autolavaggio in franchising", costo: 130000, acconto: 20000, passivita: 110000, flusso: 800,
    testo: "Tre impianti automatici su strade ad alto traffico." },
  { id: "ga09", tipo: "attivita", categoria: "attivita", nome: "Sale giochi e biliardi", costo: 20000, acconto: 20000, passivita: 0, flusso: 1600,
    testo: "Macchine già installate in dieci locali. Contratti pluriennali firmati." },
  { id: "ga10", tipo: "attivita", categoria: "attivita", nome: "Deposito self-storage", costo: 320000, acconto: 60000, passivita: 260000, flusso: 2100,
    testo: "Occupazione stabile all'88%. Gestione quasi interamente automatizzata." },
  { id: "ga11", tipo: "attivita", categoria: "attivita", nome: "Piattaforma software B2B", costo: 90000, acconto: 25000, passivita: 65000, flusso: 1400,
    testo: "Ricavi ricorrenti da 60 aziende clienti. Richiede un direttore tecnico." },
  { id: "ga12", tipo: "attivita", categoria: "attivita", nome: "Catena di lavanderie", costo: 200000, acconto: 35000, passivita: 165000, flusso: 1000,
    testo: "Sei punti vendita in città, tutti con contratti di locazione lunghi." },
  { id: "ga13", tipo: "immobile", categoria: "terreno", nome: "40 ettari con permesso edificatorio", costo: 60000, acconto: 60000, mutuo: 0, flusso: 0,
    testo: "Il comune ha appena approvato la variante. Nessun affitto, ma forte potenziale." },
  { id: "ga14", tipo: "immobile", categoria: "appartamenti", nome: "Residence 30 unità", costo: 900000, acconto: 150000, mutuo: 750000, flusso: 6000,
    testo: "Un affare da investitore esperto. Il flusso di cassa parla da solo." },
  { id: "ga15", tipo: "attivita", categoria: "attivita", nome: "Impianto fotovoltaico in affitto", costo: 220000, acconto: 50000, passivita: 170000, flusso: 1500,
    testo: "Incentivo ventennale già assegnato. Manutenzione a carico del gestore." },
  { id: "ga16", tipo: "immobile", categoria: "quadri", nome: "Quadrifamiliare vicino all'ospedale", costo: 110000, acconto: 18000, mutuo: 92000, flusso: 720,
    testo: "Affittata a personale sanitario in trasferta." },
  { id: "ga17", tipo: "attivita", categoria: "attivita", nome: "Franchising di caffetterie", costo: 250000, acconto: 45000, passivita: 205000, flusso: 1800,
    testo: "Tre locali già aperti, marchio riconosciuto a livello nazionale." },
  { id: "ga18", tipo: "immobile", categoria: "otto", nome: "Palazzina 8 unità, asta giudiziaria", costo: 150000, acconto: 15000, mutuo: 135000, flusso: 900,
    testo: "Prezzo sotto mercato: due unità sono da liberare." },
  { id: "ga19", tipo: "attivita", categoria: "attivita", nome: "Cliniche veterinarie", costo: 180000, acconto: 30000, passivita: 150000, flusso: 1200,
    testo: "Due ambulatori con veterinari dipendenti già assunti." },
  { id: "ga20", tipo: "spesa", nome: "Causa legale da un inquilino", importo: 5000, condizione: "immobile",
    testo: "Un inquilino fa causa per un infortunio nelle parti comuni. Transazione immediata." },
  { id: "ga21", tipo: "immobile", categoria: "quadri", nome: "Quadrifamiliare in periferia", costo: 80000, acconto: 8000, mutuo: 72000, flusso: 480,
    testo: "Acconto contenuto perché il venditore finanzia parte del prezzo." },
  { id: "ga22", tipo: "attivita", categoria: "attivita", nome: "Capannone logistico affittato", costo: 400000, acconto: 70000, passivita: 330000, flusso: 2400,
    testo: "Contratto di locazione decennale con un corriere nazionale." },
];

/* ═══════════════════ IL MERCATO ═══════════════════ */
export const MERCATO = [
  // Compratori di immobili (tutti possono vendere il tipo indicato)
  { id: "me01", tipo: "offerta", categoria: "casa2", nome: "Cercasi casa 2 locali", prezzo: 60000,
    testo: "Una giovane coppia cerca la prima casa. Chiunque possieda una casa 2 locali può vendere a questo prezzo." },
  { id: "me02", tipo: "offerta", categoria: "casa2", nome: "Investitore compra case piccole", prezzo: 50000,
    testo: "Offerta rapida in contanti, ma sotto le aspettative del mercato." },
  { id: "me03", tipo: "offerta", categoria: "casa3", nome: "Famiglia cerca casa 3 locali", prezzo: 90000,
    testo: "Trasferimento di lavoro: devono comprare entro il mese." },
  { id: "me04", tipo: "offerta", categoria: "casa4", nome: "Cercasi casa 4 locali", prezzo: 115000,
    testo: "Il quartiere è diventato di moda e i prezzi sono saliti." },
  { id: "me05", tipo: "offerta", categoria: "duplex", nome: "Compratore per bifamiliari", prezzo: 140000,
    testo: "Un piccolo fondo immobiliare sta rastrellando bifamiliari in città." },
  { id: "me06", tipo: "offerta", categoria: "quadri", nome: "Compratore per quadrifamiliari", moltiplicatore: 1.4,
    testo: "Offre il 140% del costo di acquisto per ogni quadrifamiliare posseduta." },
  { id: "me07", tipo: "offerta", categoria: "otto", nome: "Fondo compra palazzine", moltiplicatore: 1.35,
    testo: "Offre il 135% del costo per ogni palazzina da 8 unità." },
  { id: "me08", tipo: "offerta", categoria: "appartamenti", nome: "Gruppo internazionale cerca condomini", moltiplicatore: 1.3,
    testo: "Offre il 130% del costo per ogni condominio posseduto." },
  { id: "me09", tipo: "offerta", categoria: "terreno", nome: "Il comune riclassifica i terreni", prezzo: 50000,
    testo: "Il piano regolatore cambia: i terreni agricoli diventano edificabili." },
  { id: "me10", tipo: "offerta", categoria: "terreno", nome: "Cercasi terreno per un centro commerciale", prezzo: 30000,
    testo: "Una catena di distribuzione cerca lotti fuori città." },
  { id: "me11", tipo: "offerta", categoria: "attivita", nome: "Un concorrente vuole comprarti", moltiplicatore: 1.5,
    testo: "Offre il 150% del costo per una qualsiasi delle tue attività." },
  { id: "me12", tipo: "offerta", categoria: "attivita", nome: "Fondo di private equity", moltiplicatore: 1.25,
    testo: "Offerta di uscita al 125% del costo per una tua attività." },

  // Movimenti dei titoli (tutti possono vendere a questo prezzo)
  { id: "me13", tipo: "prezzo", simbolo: "FARMIA", prezzo: 30, nome: "FARMIA vola in borsa",
    testo: "Approvato un nuovo farmaco: il titolo tocca il massimo di fascia. Tutti possono vendere a $30." },
  { id: "me14", tipo: "prezzo", simbolo: "FARMIA", prezzo: 5, nome: "FARMIA crolla",
    testo: "Effetti collaterali inattesi: il titolo scivola al minimo di fascia." },
  { id: "me15", tipo: "prezzo", simbolo: "VOLTIA", prezzo: 40, nome: "VOLTIA: offerta pubblica d'acquisto",
    testo: "Un colosso lancia un'OPA. Tutti possono vendere a $40." },
  { id: "me16", tipo: "prezzo", simbolo: "VOLTIA", prezzo: 10, nome: "VOLTIA delude le attese",
    testo: "Trimestrale sotto le stime, il titolo torna ai minimi." },
  { id: "me17", tipo: "prezzo", simbolo: "ENERGA", prezzo: 40, nome: "ENERGA acquisita",
    testo: "Fusione nel settore energetico. Tutti possono vendere a $40." },
  { id: "me18", tipo: "prezzo", simbolo: "ALTURA", prezzo: 30, nome: "ALTURA ai massimi",
    testo: "Il mercato azionario corre e il fondo con lui." },
  { id: "me19", tipo: "prezzo", simbolo: "DIMORA", prezzo: 30, nome: "DIMORA si rivaluta",
    testo: "Boom degli affitti: il fondo immobiliare tocca il massimo di fascia." },

  // Eventi economici
  { id: "me20", tipo: "evento", effetto: "spesaPerImmobile", importo: 300, nome: "Aumento dell'imposta sugli immobili",
    testo: "Ogni giocatore paga $300 per ciascun immobile residenziale posseduto." },
  { id: "me21", tipo: "evento", effetto: "incassoPerAttivita", importo: 500, nome: "Boom dei consumi",
    testo: "Ogni giocatore incassa $500 per ciascuna attività posseduta." },
  { id: "me22", tipo: "evento", effetto: "nessuno", nome: "Nuova linea metropolitana",
    testo: "Il quartiere si rivaluta. Nessun effetto immediato, ma i prossimi compratori pagheranno di più." },
];

/* ═══════════════════ SPESE EXTRA (SPESE NON NECESSARIE) ═══════════════════ */
export const EXTRA = [
  { id: "ex01", nome: "Nuovo telefono di ultima generazione", importo: 1200, testo: "Il vecchio funzionava ancora benissimo." },
  { id: "ex02", nome: "Weekend last minute", importo: 800, testo: "L'offerta scadeva tra due ore. Almeno così ti hanno detto." },
  { id: "ex03", nome: "Multa e ritiro dei punti", importo: 300, testo: "Autovelox in un tratto che conoscevi benissimo." },
  { id: "ex04", nome: "Il cane dal veterinario", importo: 500, testo: "Ha mangiato qualcosa che non doveva. Di nuovo." },
  { id: "ex05", nome: "Lavatrice da sostituire", importo: 700, testo: "Si è rotta con il bucato dentro." },
  { id: "ex06", nome: "Cena importante e regalo", importo: 400, testo: "Anniversario dimenticato, recupero costoso." },
  { id: "ex07", nome: "Bicicletta elettrica", importo: 1500, testo: "La userai tutti i giorni. Promesso." },
  { id: "ex08", nome: "Gomme nuove per l'auto", importo: 900, testo: "Il gommista è stato chiaro: non si rimanda." },
  { id: "ex09", nome: "Attrezzatura da palestra in casa", importo: 1100, testo: "Diventerà un appendiabiti entro marzo." },
  { id: "ex10", nome: "Impianto audio", importo: 2000, testo: "Il negoziante è stato molto convincente." },
  { id: "ex11", nome: "Vacanza in famiglia", importo: 2500, testo: "Prenotata prima di guardare il conto corrente." },
  { id: "ex12", nome: "Televisore nuovo", importo: 1000, testo: "Quello vecchio aveva solo cinque anni." },
  { id: "ex13", nome: "Riparazione dell'auto", importo: 600, testo: "Frizione andata. Nessun preavviso." },
  { id: "ex14", nome: "Dentista", importo: 450, testo: "Una carie che sembrava innocua." },
  { id: "ex15", nome: "Scarpe e vestiti per i figli", importo: 200, perFiglio: true, testo: "Crescono più in fretta del previsto. $200 per ogni figlio." },
  { id: "ex16", nome: "Campo estivo dei figli", importo: 350, perFiglio: true, testo: "Due settimane di serenità, a caro prezzo. $350 per ogni figlio." },
  { id: "ex17", nome: "Festa di compleanno dei figli", importo: 250, perFiglio: true, testo: "Animatore, torta e venti invitati. $250 per ogni figlio." },
  { id: "ex18", nome: "Abbonamenti in streaming dimenticati", importo: 150, testo: "Sette servizi attivi, due davvero usati." },
  { id: "ex19", nome: "Regalo di matrimonio", importo: 500, testo: "Lista nozze in un negozio molto costoso." },
  { id: "ex20", nome: "Corso online mai finito", importo: 250, testo: "Sei arrivato alla lezione due." },
  { id: "ex21", nome: "Console e videogiochi", importo: 700, testo: "Per i figli, ovviamente." },
  { id: "ex22", nome: "Idraulico d'urgenza", importo: 550, testo: "Domenica sera, tariffa maggiorata." },
  { id: "ex23", nome: "Occhiali nuovi", importo: 400, testo: "Montatura firmata, lenti progressive." },
  { id: "ex24", nome: "Barca usata", importo: 3000, testo: "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende." },
];

export const MAZZI = {
  piccoli: PICCOLI_AFFARI,
  grandi: GRANDI_AFFARI,
  mercato: MERCATO,
  extra: EXTRA,
};
