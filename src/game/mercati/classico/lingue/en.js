/**
 * The classic market, in English.
 * Only the words change: the figures stay in dollars, as they are.
 */
export default {
  professioni: {
    medico: { nome: "Doctor" }, pilota: { nome: "Airline pilot" },
    avvocato: { nome: "Lawyer" }, ingegnere: { nome: "Engineer" },
    manager: { nome: "Company manager" }, insegnante: { nome: "Teacher" },
    infermiere: { nome: "Nurse" }, poliziotto: { nome: "Police officer" },
    camionista: { nome: "Lorry driver" }, segretario: { nome: "Secretary" },
    meccanico: { nome: "Mechanic" }, custode: { nome: "Caretaker" },
  },
  sogni: {
    sg01: { nome: "Travel the world in first class" },
    sg02: { nome: "Build a school in your home town" },
    sg03: { nome: "A beach house in the Caribbean" },
    sg04: { nome: "Dine with a head of state" },
    sg05: { nome: "Found a non-profit organisation" },
    sg06: { nome: "Climb Everest with a private expedition" },
    sg07: { nome: "A 30-metre yacht" },
    sg08: { nome: "A sabbatical year for the whole family" },
    sg09: { nome: "Back ten young businesses" },
    sg10: { nome: "Race the 24 Hours of Le Mans" },
    sg11: { nome: "A suborbital spaceflight" },
    sg12: { nome: "A private refuge in the Alps" },
  },
  etichetteSpese: {
    tasse: "Taxes", mutuo: "Mortgage / rent", prestitoStudio: "Student loan",
    auto: "Car payment", cartaCredito: "Credit card",
    rate: "Store credit", altre: "Other expenses",
  },
  etichettePassivita: {
    mutuo: "Home mortgage", prestitoStudio: "Student loan", auto: "Car loan",
    cartaCredito: "Credit cards", rate: "Store debt", prestitoBanca: "Bank loan",
  },
  /**
   * Le carte, chiave per chiave.
   *
   * La chiave è la frase italiana, il valore la stessa frase in inglese.
   * Il mercato classico parla in dollari e in tagli americani: una
   * *bifamiliare* è un duplex, una *quadrifamiliare* un 4-plex, una
   * *palazzina 8 unità* un 8-unit block. I numeri non si toccano.
   */
  carte: {
    // ── Carta ──
    "Azioni Farmia": "Farmia shares",
    "Il titolo è ai minimi storici dopo una causa legale. Solo tu puoi comprare a questo prezzo; tutti possono vendere.":
      "The share is at an all-time low after a lawsuit. Only you may buy at this price; anyone may sell.",
    "Un nuovo farmaco supera la fase 2. Fascia di oscillazione $5 - $30.":
      "A new drug clears phase 2. Trading range $5 - $30.",
    "La forza del mercato spinge in alto le quotazioni di questo storico produttore di medicinali.":
      "A strong market lifts the price of this long-established drug maker.",
    "Azioni Voltia": "Voltia shares",
    "Azienda di elettronica di consumo. Nessun dividendo, forte crescita attesa.":
      "A consumer electronics company. No dividend, strong growth expected.",
    "Il nuovo modello va a ruba nei negozi. Fascia di oscillazione $10 - $40.":
      "The new model is flying off the shelves. Trading range $10 - $40.",
    "Gli analisti alzano il target. Sei ancora in tempo o è già tardi?":
      "Analysts raise their target. Are you still in time, or already too late?",
    "Azioni Energa": "Energa shares",
    "Azienda di servizi energetici: paga $1 di dividendo per azione al mese.":
      "An energy utility: it pays a $1 dividend a share each month.",
    "Tariffe approvate dall'autorità: il dividendo resta $1 per azione al mese.":
      "The regulator has approved the tariffs: the dividend stays at $1 a share each month.",
    "Fondo comune Altura": "Altura mutual fund",
    "Fondo azionario a forte crescita. Nessuna cedola, si guadagna sulla rivendita.":
      "A high-growth equity fund. No dividend; you make money when you sell.",
    "Il fondo ha battuto l'indice per il terzo anno consecutivo.":
      "The fund has beaten the index for the third year running.",
    "Il fondo è caro. Gli analisti consigliano prudenza.":
      "The fund is expensive. Analysts advise caution.",
    "Fondo immobiliare Dimora": "Dimora property fund",
    "Fondo immobiliare quotato: distribuisce $0,50 per azione al mese.":
      "A listed property fund: it pays $0.50 a share each month.",
    "Gli affitti salgono e il fondo si rivaluta. Cedola invariata a $0,50.":
      "Rents are rising and the fund with them. The dividend holds at $0.50.",
    "Certificato di deposito": "Certificate of deposit",
    "Deposito vincolato: $1.000 che rendono $5 al mese. Sicuro, ma lento.":
      "A fixed-term deposit: $1,000 earning $5 a month. Safe, but slow.",
    "Massimo storico. Chi ha comprato a $5 sorride.":
      "An all-time high. Whoever bought at $5 is smiling.",

    // ── Immobili piccoli ──
    "Casa 2 locali in vendita": "One-bedroom house for sale",
    "Il proprietario si trasferisce e vende in fretta. Zona tranquilla, inquilino già presente.":
      "The owner is moving and selling quickly. Quiet area, tenant already in place.",
    "Casa 2 locali all'asta": "One-bedroom house at auction",
    "Immobile pignorato, venduto all'asta giudiziaria sotto il valore di mercato.":
      "A repossessed house, sold at judicial auction below market value.",
    "Casa 3 locali, quartiere in crescita": "Two-bedroom house in an up-and-coming area",
    "Vicino alla nuova fermata della metropolitana. Lista d'attesa per gli affitti.":
      "Next to the new underground station. There is a waiting list to rent here.",
    "Casa 3 locali da ristrutturare": "Two-bedroom house in need of work",
    "Serve lavoro, ma il prezzo lo rispecchia. Buon potenziale di rivalutazione.":
      "It needs work, but the price says so. Good scope to gain value.",
    "Casa 4 locali con giardino": "Three-bedroom house with a garden",
    "Famiglia numerosa in affitto da tre anni, pagamenti sempre puntuali.":
      "A large family that has rented for three years and has never once paid late.",
    "Bifamiliare": "Duplex",
    "Due unità, entrambe affittate. Il venditore accetta un acconto minimo.":
      "Two units, both let. The seller will accept a minimal deposit.",
    "Casa 2 locali, vendita del proprietario": "One-bedroom house, sold by the owner",
    "Venduta direttamente dal proprietario, senza agenzia. Nessuna provvigione.":
      "Sold directly by the owner, no agency. No commission to pay.",
    "10 ettari di terreno agricolo": "10 hectares of farmland",
    "Nessun affitto: guadagni solo quando il terreno viene rivalutato e rivenduto.":
      "No rent: you only make money when the land gains value and is sold on.",
    "20 ettari ai margini della città": "20 hectares on the edge of town",
    "Il piano regolatore potrebbe cambiare. Scommessa pura sul futuro.":
      "The zoning plan may change. A pure bet on the future.",
    "Casa 3 locali, affare del mese": "Two-bedroom house, deal of the month",
    "Gli eredi vogliono liquidare in fretta. Acconto ridotto concordato.":
      "The heirs want a quick sale. A reduced deposit has been agreed.",
    "Casa 2 locali, zona universitaria": "One-bedroom house near the university",
    "Studenti in affitto tutto l'anno accademico.":
      "Students renting for the whole academic year.",
    "Casa 4 locali pignorata": "Repossessed three-bedroom house",
    "La banca vuole chiudere la pratica. Acconto sorprendentemente basso.":
      "The bank wants the file closed. A surprisingly small deposit.",
    "Bifamiliare da ristrutturare": "Duplex in need of work",
    "Una unità è già affittata, l'altra da sistemare.":
      "One unit is already let, the other needs doing up.",
    "Tre monolocali su affitto breve": "Three studio flats on short lets",
    "Sublocazione autorizzata dal proprietario. Gestione affidata a terzi.":
      "Subletting authorised by the owner. Management contracted out.",

    // ── Piccole attività ──
    "Distributori automatici": "Vending machines",
    "Otto distributori in palestre e uffici. Rifornimento una volta a settimana.":
      "Eight machines in gyms and offices. Restocked once a week.",
    "Autolavaggio self-service": "Self-service car wash",
    "Due piazzole automatiche in una zona di passaggio.":
      "Two automated bays in a busy spot.",
    "Lavanderia a gettoni": "Launderette",
    "Vicino a un campus universitario. Incassi stabili tutto l'anno.":
      "Near a university campus. Steady takings all year.",
    "Chiosco di street food": "Street food stall",
    "Licenza già ottenuta, posizione assegnata nel mercato coperto.":
      "Licence already granted, pitch assigned in the covered market.",
    "Corso online già registrato": "An online course, already recorded",
    "Il corso è girato e pubblicato: incassa senza il tuo tempo.":
      "Filmed and published: it earns without costing you time.",
    "Micro-società di software": "A micro software company",
    "Un piccolo gestionale con 40 clienti in abbonamento. Margini alti.":
      "A small business tool with 40 subscribers. High margins.",

    // ── Imprevisti ──
    "Il tetto perde": "The roof is leaking",
    "Uno dei tuoi immobili ha bisogno di un tetto nuovo. Paghi solo se possiedi almeno un immobile.":
      "One of your properties needs a new roof. You pay only if you own at least one property.",
    "Caldaia da sostituire": "The boiler has to be replaced",
    "L'inquilino chiama a novembre. Non puoi rimandare.":
      "The tenant rings in November. You cannot put this off.",
    "Un amico chiede un prestito": "A friend asks you for a loan",
    "Un vecchio amico ti chiede $1.000. Puoi rifiutare senza alcuna penalità.":
      "An old friend asks you for $1,000. You can say no at no cost.",
    "Inquilino moroso": "A tenant in arrears",
    "Un mese di affitto non incassato, più le spese legali.":
      "A month's rent never collected, plus the legal fees.",
    "Multa edilizia": "Planning fine",
    "Una difformità catastale su un tuo immobile: sanzione da pagare.":
      "A discrepancy in the land registry on one of your properties: a fine to pay.",

    // ── Grandi affari ──
    "Quadrifamiliare in vendita": "4-plex for sale",
    "Quattro unità, tutte affittate. Il proprietario va in pensione e vende.":
      "Four units, all let. The owner is retiring and selling.",
    "Quadrifamiliare ristrutturata": "Refurbished 4-plex",
    "Impianti rifatti l'anno scorso. Nessuna manutenzione prevista a breve.":
      "Wiring and plumbing redone last year. No maintenance expected for a while.",
    "Palazzina 8 unità": "8-unit apartment block",
    "Occupazione al 100% da due anni. Zona con forte domanda di affitti.":
      "Fully let for two years. An area with strong rental demand.",
    "Condominio 12 appartamenti": "12-flat apartment building",
    "Offerto dagli eredi fuori regione del vecchio proprietario. Lunga lista d'attesa. ROI 58%.":
      "Offered by the late owner's out-of-town heirs. A long waiting list. 58% return on cash.",
    "Condominio 20 appartamenti": "20-flat apartment building",
    "Grande complesso residenziale con gestione già avviata.":
      "A large residential complex with management already running.",
    "Palazzina 8 unità, occasione": "8-unit block, a bargain",
    "Il venditore ha bisogno di liquidità entro fine mese.":
      "The seller needs cash before the end of the month.",
    "Quadrifamiliare vicino all'ospedale": "4-plex near the hospital",
    "Affittata a personale sanitario in trasferta.":
      "Let to health staff on temporary postings.",
    "Palazzina 8 unità, asta giudiziaria": "8-unit block, judicial auction",
    "Prezzo sotto mercato: due unità sono da liberare.":
      "Below market: two units have to be vacated.",
    "Quadrifamiliare in periferia": "4-plex on the outskirts",
    "Acconto contenuto perché il venditore finanzia parte del prezzo.":
      "A small deposit, because the seller is financing part of the price.",
    "Residence 30 unità": "30-unit residential complex",
    "Un affare da investitore esperto. Il flusso di cassa parla da solo.":
      "A deal for an experienced investor. The cash flow speaks for itself.",
    "40 ettari con permesso edificatorio": "40 hectares with planning permission",
    "Il comune ha appena approvato la variante. Nessun affitto, ma forte potenziale.":
      "The council has just approved the rezoning. No rent, but real potential.",
    "Pizzeria avviata": "An established pizzeria",
    "Locale storico con clientela fissa. Il cuoco resta in azienda.":
      "A long-standing place with regular customers. The chef is staying on.",
    "Autolavaggio in franchising": "A car-wash franchise",
    "Tre impianti automatici su strade ad alto traffico.":
      "Three automated sites on high-traffic roads.",
    "Sale giochi e biliardi": "Arcades and pool halls",
    "Macchine già installate in dieci locali. Contratti pluriennali firmati.":
      "Machines already installed in ten venues. Multi-year contracts signed.",
    "Deposito self-storage": "Self-storage depot",
    "Occupazione stabile all'88%. Gestione quasi interamente automatizzata.":
      "Steadily 88% full. Management almost entirely automated.",
    "Piattaforma software B2B": "A B2B software platform",
    "Ricavi ricorrenti da 60 aziende clienti. Richiede un direttore tecnico.":
      "Recurring revenue from 60 corporate customers. It needs a technical director.",
    "Catena di lavanderie": "A chain of launderettes",
    "Sei punti vendita in città, tutti con contratti di locazione lunghi.":
      "Six sites across the city, all on long leases.",
    "Impianto fotovoltaico in affitto": "A solar array on a lease",
    "Incentivo ventennale già assegnato. Manutenzione a carico del gestore.":
      "A twenty-year subsidy already awarded. The operator pays for maintenance.",
    "Franchising di caffetterie": "A coffee-bar franchise",
    "Tre locali già aperti, marchio riconosciuto a livello nazionale.":
      "Three sites already open, under a name known nationwide.",
    "Cliniche veterinarie": "Veterinary clinics",
    "Due ambulatori con veterinari dipendenti già assunti.":
      "Two surgeries with salaried vets already on the payroll.",
    "Capannone logistico affittato": "A let logistics warehouse",
    "Contratto di locazione decennale con un corriere nazionale.":
      "A ten-year lease with a national courier.",
    "Causa legale da un inquilino": "A tenant is suing you",
    "Un inquilino fa causa per un infortunio nelle parti comuni. Transazione immediata.":
      "A tenant sues over an injury in the common parts. Settled on the spot.",

    // ── Il mercato ──
    "Cercasi casa 2 locali": "Wanted: one-bedroom house",
    "Una giovane coppia cerca la prima casa. Chiunque possieda una casa 2 locali può vendere a questo prezzo.":
      "A young couple are after their first home. Anyone who owns a one-bedroom house may sell at this price.",
    "Investitore compra case piccole": "An investor is buying small houses",
    "Offerta rapida in contanti, ma sotto le aspettative del mercato.":
      "A quick cash offer, but below what the market would give.",
    "Famiglia cerca casa 3 locali": "A family is looking for a two-bedroom house",
    "Trasferimento di lavoro: devono comprare entro il mese.":
      "A job transfer: they have to buy within the month.",
    "Cercasi casa 4 locali": "Wanted: three-bedroom house",
    "Il quartiere è diventato di moda e i prezzi sono saliti.":
      "The neighbourhood has become fashionable and prices have followed.",
    "Compratore per bifamiliari": "A buyer for duplexes",
    "Un piccolo fondo immobiliare sta rastrellando bifamiliari in città.":
      "A small property fund is hoovering up duplexes across the city.",
    "Compratore per quadrifamiliari": "A buyer for 4-plexes",
    "Offre il 140% del costo di acquisto per ogni quadrifamiliare posseduta.":
      "They offer 140% of purchase cost for every 4-plex you own.",
    "Fondo compra palazzine": "A fund is buying apartment blocks",
    "Offre il 135% del costo per ogni palazzina da 8 unità.":
      "They offer 135% of cost for every 8-unit block.",
    "Gruppo internazionale cerca condomini": "An international group is after apartment buildings",
    "Offre il 130% del costo per ogni condominio posseduto.":
      "They offer 130% of cost for every apartment building you own.",
    "Il comune riclassifica i terreni": "The council rezones the land",
    "Il piano regolatore cambia: i terreni agricoli diventano edificabili.":
      "The zoning plan changes: farmland becomes building land.",
    "Cercasi terreno per un centro commerciale": "Wanted: a site for a shopping centre",
    "Una catena di distribuzione cerca lotti fuori città.":
      "A retail chain is looking for plots outside town.",
    "Un concorrente vuole comprarti": "A competitor wants to buy you out",
    "Offre il 150% del costo per una qualsiasi delle tue attività.":
      "They offer 150% of cost for any one of your businesses.",
    "Fondo di private equity": "A private equity fund",
    "Offerta di uscita al 125% del costo per una tua attività.":
      "An exit offer at 125% of cost for one of your businesses.",
    "FARMIA vola in borsa": "FARMIA soars",
    "Approvato un nuovo farmaco: il titolo tocca il massimo di fascia. Tutti possono vendere a $30.":
      "A new drug is approved: the share touches the top of its range. Everyone may sell at $30.",
    "FARMIA crolla": "FARMIA collapses",
    "Effetti collaterali inattesi: il titolo scivola al minimo di fascia.":
      "Unexpected side effects: the share slides to the bottom of its range.",
    "VOLTIA: offerta pubblica d'acquisto": "VOLTIA: takeover bid",
    "Un colosso lancia un'OPA. Tutti possono vendere a $40.":
      "A giant launches a bid. Everyone may sell at $40.",
    "VOLTIA delude le attese": "VOLTIA falls short",
    "Trimestrale sotto le stime, il titolo torna ai minimi.":
      "Quarterly results below forecast; the share falls back to its lows.",
    "ENERGA acquisita": "ENERGA is acquired",
    "Fusione nel settore energetico. Tutti possono vendere a $40.":
      "A merger in the energy sector. Everyone may sell at $40.",
    "ALTURA ai massimi": "ALTURA at its high",
    "Il mercato azionario corre e il fondo con lui.":
      "The stock market is running and the fund with it.",
    "DIMORA si rivaluta": "DIMORA gains ground",
    "Boom degli affitti: il fondo immobiliare tocca il massimo di fascia.":
      "A rental boom: the property fund touches the top of its range.",
    "Aumento dell'imposta sugli immobili": "Property tax goes up",
    "Ogni giocatore paga $300 per ciascun immobile residenziale posseduto.":
      "Every player pays $300 for each residential property they own.",
    "Boom dei consumi": "A consumer boom",
    "Ogni giocatore incassa $500 per ciascuna attività posseduta.":
      "Every player collects $500 for each business they own.",
    "Nuova linea metropolitana": "A new underground line",
    "Il quartiere si rivaluta. Nessun effetto immediato, ma i prossimi compratori pagheranno di più.":
      "The neighbourhood gains value. Nothing happens today, but the next buyers will pay more.",

    // ── Spese di tutti i giorni ──
    "Nuovo telefono di ultima generazione": "The latest phone",
    "Il vecchio funzionava ancora benissimo.":
      "The old one was still working perfectly well.",
    "Weekend last minute": "A last-minute weekend away",
    "L'offerta scadeva tra due ore. Almeno così ti hanno detto.":
      "The offer expired in two hours. Or so they told you.",
    "Multa e ritiro dei punti": "A fine and points on your licence",
    "Autovelox in un tratto che conoscevi benissimo.":
      "A speed camera on a stretch you knew perfectly well.",
    "Il cane dal veterinario": "The dog at the vet",
    "Ha mangiato qualcosa che non doveva. Di nuovo.":
      "It ate something it should not have. Again.",
    "Lavatrice da sostituire": "The washing machine has to go",
    "Si è rotta con il bucato dentro.":
      "It broke down with the washing still inside.",
    "Cena importante e regalo": "An important dinner and a present",
    "Anniversario dimenticato, recupero costoso.":
      "An anniversary forgotten, and expensively made up for.",
    "Bicicletta elettrica": "An electric bike",
    "La userai tutti i giorni. Promesso.":
      "You will use it every day. Promise.",
    "Gomme nuove per l'auto": "New tyres for the car",
    "Il gommista è stato chiaro: non si rimanda.":
      "The tyre fitter was clear: this cannot wait.",
    "Attrezzatura da palestra in casa": "Home gym equipment",
    "Diventerà un appendiabiti entro marzo.":
      "It will be a coat rack by March.",
    "Impianto audio": "A sound system",
    "Il negoziante è stato molto convincente.":
      "The shop assistant was very persuasive.",
    "Vacanza in famiglia": "A family holiday",
    "Prenotata prima di guardare il conto corrente.":
      "Booked before anyone looked at the bank balance.",
    "Televisore nuovo": "A new television",
    "Quello vecchio aveva solo cinque anni.":
      "The old one was only five years old.",
    "Riparazione dell'auto": "Car repairs",
    "Frizione andata. Nessun preavviso.":
      "The clutch has gone. No warning.",
    "Dentista": "The dentist",
    "Una carie che sembrava innocua.":
      "A cavity that looked harmless.",
    "Scarpe e vestiti per i figli": "Shoes and clothes for the children",
    "Crescono più in fretta del previsto. $200 per ogni figlio.":
      "They grow faster than anyone planned for. $200 per child.",
    "Campo estivo dei figli": "Summer camp for the children",
    "Due settimane di serenità, a caro prezzo. $350 per ogni figlio.":
      "Two weeks of peace, dearly bought. $350 per child.",
    "Festa di compleanno dei figli": "A children's birthday party",
    "Animatore, torta e venti invitati. $250 per ogni figlio.":
      "An entertainer, a cake and twenty guests. $250 per child.",
    "Abbonamenti in streaming dimenticati": "Forgotten streaming subscriptions",
    "Sette servizi attivi, due davvero usati.":
      "Seven services running, two actually watched.",
    "Regalo di matrimonio": "A wedding present",
    "Lista nozze in un negozio molto costoso.":
      "The gift list is at a very expensive shop.",
    "Corso online mai finito": "An online course you never finished",
    "Sei arrivato alla lezione due.":
      "You got as far as lesson two.",
    "Console e videogiochi": "A console and games",
    "Per i figli, ovviamente.":
      "For the children, obviously.",
    "Idraulico d'urgenza": "Emergency plumber",
    "Domenica sera, tariffa maggiorata.":
      "Sunday evening, at the out-of-hours rate.",
    "Occhiali nuovi": "New glasses",
    "Montatura firmata, lenti progressive.":
      "Designer frames, varifocal lenses.",
    "Barca usata": "A second-hand boat",
    "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende.":
      "The two best days in a boat owner's life: the day they buy it and the day they sell it.",

    // ── Gli affari del Largo ──
    "Piantagione di caffè in Brasile": "A coffee plantation in Brazil",
    "600 ettari già produttivi, con contratti di fornitura pluriennali.":
      "600 hectares already in production, under multi-year supply contracts.",
    "Compagnia di navigazione": "A shipping company",
    "Quattro navi cargo su rotte asiatiche consolidate.":
      "Four cargo ships on established Asian routes.",
    "Centro commerciale": "A shopping centre",
    "Quaranta negozi, occupazione al 95%, gestione esternalizzata.":
      "Forty shops, 95% let, management contracted out.",
    "Miniera d'oro": "A gold mine",
    "Giacimento certificato, concessione ventennale.":
      "A certified deposit and a twenty-year concession.",
    "Catena di alberghi": "A hotel chain",
    "Otto strutture in località turistiche di primo livello.":
      "Eight hotels in first-rate holiday destinations.",
    "Squadra sportiva professionistica": "A professional sports club",
    "Diritti televisivi e merchandising inclusi nell'operazione.":
      "Broadcasting rights and merchandising are part of the deal.",
    "Rete di data center": "A network of data centres",
    "Tre poli in Europa affittati a operatori cloud.":
      "Three European sites let to cloud operators.",
    "Studio cinematografico": "A film studio",
    "Catalogo di 90 titoli con ricavi ricorrenti da licenze.":
      "A catalogue of 90 titles with recurring licensing income.",
    "Parco eolico": "A wind farm",
    "Quaranta turbine con incentivi garantiti per vent'anni.":
      "Forty turbines with subsidies guaranteed for twenty years.",
    "Compagnia aerea regionale": "A regional airline",
    "Dodici aeromobili e slot aeroportuali di valore.":
      "Twelve aircraft and valuable airport slots.",
    "Rete di cliniche private": "A network of private clinics",
    "Sei poliambulatori con convenzioni assicurative.":
      "Six outpatient centres with insurance contracts.",
    "Fondo immobiliare urbano": "An urban property fund",
    "Portafoglio di 200 appartamenti in tre capitali europee.":
      "A portfolio of 200 flats in three European capitals.",
    "Catena di ristoranti": "A restaurant chain",
    "Quindici locali con format collaudato e cucina centralizzata.":
      "Fifteen restaurants on a proven format with a central kitchen.",
    "Società di software gestionale": "A business software company",
    "Abbonamenti annuali da 400 aziende clienti.":
      "Annual subscriptions from 400 corporate customers.",
    "Porto turistico": "A marina",
    "300 posti barca con lista d'attesa.":
      "300 berths, with a waiting list.",
    "Rete di torri per telecomunicazioni": "A network of telecoms masts",
    "Affittate a tre operatori con contratti ventennali.":
      "Let to three operators on twenty-year contracts.",
    "Fabbrica di batterie": "A battery factory",
    "Impianto automatizzato con ordini già in portafoglio.":
      "An automated plant with orders already on the books.",
    "Catena di palestre": "A chain of gyms",
    "Venti club urbani in abbonamento mensile.":
      "Twenty city clubs on monthly membership.",
    "Vigneto e cantina": "A vineyard and winery",
    "Etichetta premiata, export in trenta paesi.":
      "An award-winning label exporting to thirty countries.",
    "Piattaforma logistica dell'ultimo miglio": "A last-mile logistics platform",
    "Magazzini automatizzati in sei città.":
      "Automated warehouses in six cities.",
  },
};
