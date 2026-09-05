/**
 * Rome, in English.
 *
 * Only the words change. Prices, rents, salaries and rates stay Roman and
 * stay in euros: a market is its market, whatever language you read it in.
 *
 * Place names are left alone — Prati is Prati, Trastevere is Trastevere —
 * because that is how anyone would say them, and because a "two-room flat
 * in the Meadows" would be nonsense. What gets translated is the type of
 * thing: *bilocale* is a one-bedroom flat, *box auto* is a lock-up garage,
 * *stabile* is an apartment block.
 */
export default {
  professioni: {
    "dirigente-medico": { nome: "Senior hospital doctor" },
    pilota: { nome: "Airline pilot" },
    quadro: { nome: "Middle manager" },
    avvocato: { nome: "Lawyer" },
    ingegnere: { nome: "Engineer" },
    architetto: { nome: "Architect" },
    autotrasportatore: { nome: "Lorry driver" },
    infermiere: { nome: "Nurse" },
    agente: { nome: "Police officer" },
    meccanico: { nome: "Mechanic" },
    insegnante: { nome: "Teacher" },
    impiegato: { nome: "Office clerk" },
    operatore: { nome: "Refuse collector" },
  },

  sogni: {
    sg01: { nome: "Travel the world, taking your time" },
    sg02: { nome: "Build a school in your family's village" },
    sg03: { nome: "A house facing the sea in Sardinia" },
    sg04: { nome: "Open the restaurant you have had in mind for years" },
    sg05: { nome: "Start a charity and fund it for ten years" },
    sg06: { nome: "An expedition to the Himalayas" },
    sg07: { nome: "A fifteen-metre sailing boat" },
    sg08: { nome: "A sabbatical year for the whole family" },
    sg09: { nome: "Back ten young businesses" },
    sg10: { nome: "Buy and restore a farmhouse in Umbria" },
    sg11: { nome: "Pay for every grandchild's education" },
    sg12: { nome: "A mountain refuge, all your own" },
  },

  etichetteSpese: {
    casa: "Mortgage or rent",
    tasse: "Tax on rental income",
    prestitoStudio: "Student loan",
    auto: "Car and transport",
    cartaCredito: "Credit card",
    utenze: "Utilities and phone",
    vita: "Food, health, leisure",
  },

  etichettePassivita: {
    mutuo: "Home mortgage",
    prestitoStudio: "Student loan",
    auto: "Car finance",
    cartaCredito: "Credit card",
    prestitoBanca: "Bank overdraft",
  },

  /**
   * Le carte, chiave per chiave.
   *
   * La chiave è la frase italiana, il valore la stessa frase in inglese.
   * I nomi dei quartieri non si toccano — Prati è Prati — e i numeri
   * nemmeno: quello che cambia è il tipo di cosa. *Bilocale* è un
   * one-bedroom flat, *box auto* è un lock-up garage, *stabile* è un
   * apartment block.
   */
  carte: {
    // ── Posti e box auto ──
    "Posto auto a Tuscolano": "Parking space in Tuscolano",
    "Scoperto, in un cortile condominiale. Nessuna manutenzione, nessun inquilino da inseguire.":
      "Open-air, in a shared courtyard. No upkeep, no tenant to chase.",
    "Box auto a Montesacro": "Lock-up garage in Montesacro",
    "Chiuso, con serranda elettrica. In zona i box si affittano prima delle case.":
      "Enclosed, with an electric shutter. Around here garages let faster than flats.",
    "Box auto a Prati": "Lock-up garage in Prati",
    "Dove parcheggiare è impossibile, un box vale quanto una stanza.":
      "Where parking is impossible, a garage is worth as much as a room.",
    "Due posti auto a Ostia": "Two parking spaces in Ostia",
    "Affittati entrambi a residenti. D'estate si potrebbero rivalutare.":
      "Both let to residents. In summer they could be worth more.",

    // ── Bilocali ──
    "Bilocale a Tor Bella Monaca": "One-bedroom flat in Tor Bella Monaca",
    "Il rendimento lordo più alto della città. Il quartiere spaventa, i numeri no.":
      "The highest gross yield in the city. The neighbourhood puts people off; the numbers do not.",
    "Bilocale a Ostia": "One-bedroom flat in Ostia",
    "A dieci minuti dal mare. Affitti stabili tutto l'anno, non solo d'estate.":
      "Ten minutes from the sea. Steady lettings all year, not just in summer.",
    "Bilocale a Primavalle": "One-bedroom flat in Primavalle",
    "Palazzina anni Sessanta, ristrutturata di recente. Inquilino già dentro.":
      "A 1960s block, recently done up. Tenant already in place.",
    "Bilocale a Torpignattara": "One-bedroom flat in Torpignattara",
    "Quartiere che cambia in fretta. Chi è arrivato prima ha pagato la metà.":
      "A neighbourhood changing fast. Whoever got there first paid half as much.",
    "Bilocale a Cinecittà": "One-bedroom flat in Cinecittà",
    "Vicino alla metro A. Chi lavora in centro e non vuole pagare il centro.":
      "Near metro line A. For people who work in the centre and will not pay centre prices.",
    "Bilocale a Portuense": "One-bedroom flat in Portuense",
    "Vicino all'ospedale: personale sanitario in cerca di casa tutto l'anno.":
      "Next to the hospital: health staff looking for somewhere to live all year round.",

    // ── Aste e finanziamento del venditore ──
    "Trilocale all'asta a Torpignattara": "Two-bedroom flat at auction in Torpignattara",
    "Asta giudiziaria: sotto mercato, ma l'immobile va liberato. Anticipo ridotto.":
      "Judicial auction: below market, but the flat has to be vacated. Small deposit.",
    "Trilocale all'asta a Ostia": "Two-bedroom flat at auction in Ostia",
    "Gli eredi vogliono chiudere la pratica entro l'anno.":
      "The heirs want the whole thing settled within the year.",
    "Trilocale a Primavalle, il venditore finanzia": "Two-bedroom flat in Primavalle, seller finance",
    "Il proprietario accetta di essere pagato a rate: entri con molto meno.":
      "The owner agrees to be paid in instalments: you get in for far less.",

    // ── Trilocali e centro ──
    "Trilocale a Tuscolano": "Two-bedroom flat in Tuscolano",
    "Famiglia in affitto da quattro anni, pagamenti sempre puntuali.":
      "A family that has rented for four years and has never once paid late.",
    "Trilocale a Montesacro": "Two-bedroom flat in Montesacro",
    "Zona tranquilla e ben servita. Si affitta in una settimana.":
      "Quiet, well served by transport. It lets within a week.",
    "Trilocale a Cinecittà": "Two-bedroom flat in Cinecittà",
    "Da rinfrescare, ma strutturalmente a posto. Il prezzo lo rispecchia.":
      "Needs freshening up, but sound underneath. The price says so.",
    "Trilocale a Prati": "Two-bedroom flat in Prati",
    "L'indirizzo che tutti vogliono. Guarda il flusso mensile prima di innamorarti.":
      "The address everybody wants. Look at the monthly cash flow before you fall in love.",
    "Bilocale a Trastevere": "One-bedroom flat in Trastevere",
    "Affascinante, turistico, carissimo. Il canone non tiene il passo del prezzo.":
      "Charming, touristy, terribly dear. The rent does not keep up with the price.",
    "Bilocale in Centro Storico": "One-bedroom flat in the historic centre",
    "Nove metri quadri di storia per ogni metro di utile. Il conto è impietoso.":
      "Nine square metres of history for every square metre of profit. The sums are merciless.",

    // ── Terreni ──
    "Terreno agricolo sulla Tiberina": "Farmland along the Via Tiberina",
    "Nessun affitto. Si guadagna solo se il piano regolatore cambia idea.":
      "No rent. You only make money if the zoning plan changes its mind.",
    "Lotto ai margini di Ostia": "A plot on the edge of Ostia",
    "Scommessa pura. Potrebbe non succedere mai nulla.":
      "A pure bet. Nothing may ever come of it.",

    // ── Piccole attività ──
    "Distributori automatici": "Vending machines",
    "Dodici macchine fra palestre e uffici. Rifornimento una volta a settimana.":
      "Twelve machines across gyms and offices. Restocked once a week.",
    "Lavanderia a gettoni a San Lorenzo": "Launderette in San Lorenzo",
    "Zona universitaria: incassi stabili da ottobre a luglio.":
      "University quarter: steady takings from October to July.",
    "Chiosco al mercato rionale": "Stall at the local market",
    "Licenza e posteggio già assegnati. Si lavora la mattina.":
      "Licence and pitch already granted. The work is done in the morning.",
    "Autolavaggio self-service": "Self-service car wash",
    "Due piazzole su una strada di scorrimento. Quasi tutto automatico.":
      "Two bays on a busy through road. Almost entirely automated.",
    "Corso online già registrato": "An online course, already recorded",
    "Girato e pubblicato: incassa senza chiederti altro tempo.":
      "Filmed and published: it earns without asking for more of your time.",
    "Tre appartamenti in sublocazione": "Three flats sublet",
    "Sublocazione autorizzata per iscritto. Gestione affidata a un'agenzia.":
      "Subletting authorised in writing. An agency handles it.",
    "Piccolo e-commerce avviato": "A small online shop, up and running",
    "Nicchia stretta, margini alti, magazzino esternalizzato.":
      "Narrow niche, high margins, warehousing outsourced.",

    // ── Carta ──
    "Quote Farmia": "Farmia shares",
    "Azienda farmaceutica di fantasia, ai minimi dopo una causa. Fascia 6 – 34.":
      "An invented drug company, at its floor after a lawsuit. Range 6 – 34.",
    "Un farmaco supera la fase due e il titolo si riprende.":
      "A drug clears phase two and the share price recovers.",
    "Quote Voltia": "Voltia shares",
    "Elettronica di consumo. Nessuna cedola, si guadagna solo rivendendo.":
      "Consumer electronics. No dividend; you only make money by selling on.",
    "Quote Energa": "Energa shares",
    "Servizi energetici regolati: distribuisce 1,20 per quota al mese.":
      "Regulated energy utility: it pays 1.20 a share each month.",
    "Tariffe approvate dall'autorità: la cedola resta.":
      "The regulator has approved the tariffs: the dividend holds.",
    "Fondo Dimora": "Dimora fund",
    "Fondo immobiliare di fantasia: distribuisce 0,60 per quota al mese.":
      "An invented property fund: it pays 0.60 a unit each month.",
    "Fondo Altura": "Altura fund",
    "Fondo a forte crescita, nessuna cedola. Si scommette sul prezzo.":
      "A high-growth fund, no dividend. You are betting on the price.",
    "Conto deposito vincolato": "Fixed-term deposit account",
    "1.000 vincolati che rendono 2,40 al mese. Sicuro, lentissimo, onesto.":
      "1,000 locked away, earning 2.40 a month. Safe, painfully slow, honest.",

    // ── Imprevisti ──
    "Rifacimento della facciata": "The building's façade is being redone",
    "Delibera condominiale: la tua quota va versata entro due mesi.":
      "The owners' meeting has voted: your share is due within two months.",
    "Caldaia da sostituire": "The boiler has to be replaced",
    "L'inquilino chiama a novembre. Non si rimanda.":
      "The tenant rings in November. This one cannot wait.",
    "Inquilino moroso": "A tenant in arrears",
    "Tre mensilità non incassate e le spese dell'avvocato.":
      "Three months' rent never collected, plus the legal fees.",
    "Un amico chiede un prestito": "A friend asks you for a loan",
    "Puoi rifiutare senza alcuna penalità. Puoi anche dire di sì.":
      "You can say no at no cost. You can also say yes.",

    // ── Grandi affari: immobili ──
    "Quattro bilocali a Tor Bella Monaca": "Four one-bedroom flats in Tor Bella Monaca",
    "Un'unica proprietà, quattro inquilini. Il rischio si divide per quattro.":
      "One title, four tenants. The risk is divided by four.",
    "Palazzina di sei unità a Ostia": "Six-unit block in Ostia",
    "Occupazione piena da tre anni. Gestione già affidata a un'agenzia.":
      "Fully let for three years. An agency already runs it.",
    "Cinque unità a Primavalle": "Five units in Primavalle",
    "Il proprietario va in pensione e vende tutto insieme.":
      "The owner is retiring and selling the lot in one go.",
    "Palazzina all'asta a Torpignattara": "Block at auction in Torpignattara",
    "Sotto mercato: due unità sono da liberare, e ci vorrà tempo.":
      "Below market: two units have to be vacated, and that will take time.",
    "Stabile di otto unità a Cinecittà": "Eight-unit apartment block in Cinecittà",
    "Vicino alla metro. Lista d'attesa per gli affitti.":
      "Near the metro. There is a waiting list to rent here.",
    "Stabile di dieci unità a Portuense": "Ten-unit apartment block in Portuense",
    "Grande, impegnativo, redditizio. Serve qualcuno che lo gestisca.":
      "Big, demanding, profitable. It needs someone to manage it.",
    "Cinque unità a Tuscolano": "Five units in Tuscolano",
    "Impianti rifatti l'anno scorso: nessuna sorpresa a breve.":
      "Wiring and plumbing redone last year: no surprises for a while.",
    "Quattro unità a Montesacro": "Four units in Montesacro",
    "Affittate a personale sanitario dell'ospedale vicino.":
      "Let to staff from the hospital nearby.",
    "Stabile a Ostiense": "Apartment block in Ostiense",
    "Zona in piena rivalutazione. Il rendimento oggi è modesto, domani si vedrà.":
      "An area on the way up. The yield is modest today; tomorrow is another matter.",
    "Palazzina a Garbatella": "Small block in Garbatella",
    "Quartiere amatissimo. Si compra col cuore, si tiene con i conti.":
      "A much-loved neighbourhood. You buy with your heart and keep it with the numbers.",
    "Terreno edificabile sulla Cassia": "Building land on the Via Cassia",
    "Permesso a costruire già rilasciato. Nessuna rendita finché non si costruisce.":
      "Planning permission already granted. No income until something is built.",

    // ── Grandi affari: attività ──
    "Pizzeria avviata a San Lorenzo": "An established pizzeria in San Lorenzo",
    "Locale storico, clientela fissa, il pizzaiolo resta.":
      "A long-standing place, regular customers, and the pizza chef is staying.",
    "Bed and breakfast a Trastevere": "Bed and breakfast in Trastevere",
    "Sei camere, licenza in regola. Dipende dal turismo, e il turismo va e viene.":
      "Six rooms, licence in order. It lives on tourism, and tourism comes and goes.",
    "Deposito self-storage al Prenestino": "Self-storage depot in Prenestino",
    "Occupazione stabile all'88%. Quasi nessun personale.":
      "Steadily 88% full. Almost no staff.",
    "Catena di tre lavanderie": "A chain of three launderettes",
    "Tre punti in quartieri diversi, tutti con contratti lunghi.":
      "Three sites in different neighbourhoods, all on long leases.",
    "Palestra di quartiere": "A neighbourhood gym",
    "Seicento abbonati. Il modello regge finché non apre una catena vicino.":
      "Six hundred members. The model holds until a chain opens nearby.",
    "Software gestionale per studi medici": "Practice-management software for doctors",
    "Abbonamenti annuali da settanta studi. Margini alti, serve un tecnico.":
      "Annual subscriptions from seventy practices. High margins; you need an engineer.",
    "Impianto fotovoltaico in locazione": "A solar array on a lease",
    "Incentivo ventennale già assegnato. Manutenzione a carico del gestore.":
      "A twenty-year subsidy already awarded. The operator pays for maintenance.",
    "Rete di sei distributori automatici h24": "Six round-the-clock vending sites",
    "Postazioni h24 in zone di passaggio. Rifornimento esternalizzato.":
      "Open all hours in busy spots. Restocking is contracted out.",
    "Autolavaggio in franchising": "A car-wash franchise",
    "Tre impianti su strade ad alto traffico. Marchio riconosciuto.":
      "Three sites on high-traffic roads. A name people know.",
    "Studio dentistico associato": "A dental practice partnership",
    "Due poltrone, convenzioni assicurative, professionisti già dentro.":
      "Two chairs, insurance contracts, and the dentists are staying on.",
    "Causa da un inquilino": "A tenant is suing you",
    "Infortunio nelle parti comuni. L'assicurazione copre solo una parte.":
      "An injury in the common parts. Insurance covers only some of it.",

    // ── Il mercato ──
    "Giovane coppia cerca il primo bilocale": "A young couple want their first flat",
    "Offre il 122% del costo per un bilocale. I mutui agevolati per gli under 36 muovono il mercato.":
      "They offer 122% of cost for a one-bedroom flat. Subsidised mortgages for under-36s are moving the market.",
    "Investitore rastrella bilocali in periferia": "An investor is hoovering up outer-city flats",
    "Offerta rapida, sotto le aspettative, ma in contanti.":
      "A quick offer, below what you hoped, but in cash.",
    "Famiglia cerca un trilocale": "A family is looking for a two-bedroom flat",
    "Trasferimento di lavoro: devono chiudere entro il mese.":
      "A job transfer: they have to complete within the month.",
    "Cercasi quadrilocale con terrazzo": "Wanted: three-bedroom flat with a terrace",
    "Il quartiere è diventato di moda e i prezzi sono saliti.":
      "The neighbourhood has become fashionable and prices have followed.",
    "Il condominio compra i posti auto": "The residents' association is buying the parking spaces",
    "Vogliono chiudere il cortile. Offrono il 135% del costo.":
      "They want to gate the courtyard. They offer 135% of cost.",
    "Fondo immobiliare compra palazzine": "A property fund is buying small blocks",
    "Un fondo sta costruendo un portafoglio residenziale a Roma sud.":
      "A fund is assembling a residential portfolio in southern Rome.",
    "Gruppo internazionale cerca stabili": "An international group is after whole blocks",
    "Vogliono interi stabili da riconvertire in affitti brevi.":
      "They want entire blocks to convert into short lets.",
    "Variante urbanistica approvata": "Rezoning approved",
    "Il terreno agricolo diventa edificabile. Succede di rado, e cambia tutto.":
      "Farmland becomes building land. It rarely happens, and it changes everything.",
    "Cercasi lotto per un supermercato": "Wanted: a site for a supermarket",
    "Una catena della distribuzione cerca terreni fuori dal Raccordo.":
      "A retail chain is looking for land outside the ring road.",
    "Un concorrente vuole comprarti": "A competitor wants to buy you out",
    "Offre il 155% del costo per una qualsiasi delle tue attività.":
      "They offer 155% of cost for any one of your businesses.",
    "Fondo di private equity": "A private equity fund",
    "Offerta di uscita al 130% del costo per una tua attività.":
      "An exit offer at 130% of cost for one of your businesses.",
    "Farmia ai massimi": "Farmia at its high",
    "Approvato un nuovo farmaco. Tutti possono vendere a 34.":
      "A new drug is approved. Everyone may sell at 34.",
    "Farmia crolla": "Farmia collapses",
    "Effetti collaterali inattesi: il titolo torna al minimo di fascia.":
      "Unexpected side effects: the share falls back to the bottom of its range.",
    "Offerta pubblica su Voltia": "Takeover bid for Voltia",
    "Un gruppo estero lancia un'OPA. Tutti possono vendere a 44.":
      "A foreign group launches a bid. Everyone may sell at 44.",
    "Voltia delude": "Voltia disappoints",
    "Trimestrale sotto le attese, il titolo torna ai minimi.":
      "Quarterly results below forecast; the share falls back to its lows.",
    "Energa acquisita": "Energa is acquired",
    "Fusione nel settore energetico. Tutti possono vendere a 44.":
      "A merger in the energy sector. Everyone may sell at 44.",
    "Altura ai massimi": "Altura at its high",
    "Il mercato corre e il fondo con lui.":
      "The market is running and the fund with it.",
    "Dimora si rivaluta": "Dimora gains ground",
    "Gli affitti salgono e il fondo immobiliare con loro.":
      "Rents are rising and the property fund with them.",
    "Acconto IMU": "IMU property tax instalment",
    "Ogni giocatore paga 420 per ciascun immobile che non sia la propria abitazione.":
      "Every player pays 420 for each property that is not their own home.",
    "Estate romana": "The Roman summer",
    "Turismo record: ogni giocatore incassa 900 per ciascuna attività.":
      "Record tourism: every player collects 900 for each business.",
    "Aumento delle spese condominiali": "Service charges go up",
    "Assicurazione e manutenzione salgono per tutti: 260 per immobile.":
      "Insurance and maintenance rise for everyone: 260 per property.",
    "Il mercato degli affitti si raffredda": "The rental market cools",
    "Nuove regole sugli affitti brevi e più offerta in città: i canoni calano del 15% per tutti.":
      "New rules on short lets and more supply in the city: rents fall 15% for everyone.",
    "Corsa agli affitti": "A scramble to rent",
    "Domanda in crescita e poca offerta: i canoni salgono del 12% per tutti.":
      "Demand up and supply short: rents rise 12% for everyone.",
    "La BCE alza i tassi": "The ECB raises rates",
    "Chi ha un mutuo a tasso variabile vede salire la rata. Chi non ha debiti non se ne accorge.":
      "Anyone on a variable-rate mortgage sees the payment go up. Anyone without debt does not notice.",
    "Nuova fermata della metro C": "A new stop on metro line C",
    "Il quartiere si rivaluta. Nessun effetto immediato: i prossimi compratori pagheranno di più.":
      "The neighbourhood gains value. Nothing happens today: the next buyers will pay more.",

    // ── Spese di tutti i giorni ──
    "Bollo e revisione dell'auto": "Road tax and the MOT",
    "Arrivano sempre insieme, e sempre a gennaio.":
      "They always come together, and always in January.",
    "Telefono nuovo": "A new phone",
    "Il vecchio funzionava ancora benissimo.":
      "The old one was still working perfectly well.",
    "Multa dell'autovelox": "Speed camera fine",
    "Sulla Colombo, in un tratto che conoscevi benissimo.":
      "On the Colombo, on a stretch you knew perfectly well.",
    "Dentista": "The dentist",
    "Una carie che sembrava innocua.":
      "A cavity that looked harmless.",
    "Il cane dal veterinario": "The dog at the vet",
    "Ha mangiato qualcosa che non doveva. Di nuovo.":
      "It ate something it should not have. Again.",
    "Lavatrice da sostituire": "The washing machine has to go",
    "Si è rotta con il bucato dentro.":
      "It broke down with the washing still inside.",
    "Cena e regalo di anniversario": "Anniversary dinner and present",
    "Dimenticato, poi recuperato a caro prezzo.":
      "Forgotten, then made up for at some expense.",
    "Weekend last minute": "A last-minute weekend away",
    "L'offerta scadeva tra due ore. Almeno così ti hanno detto.":
      "The offer expired in two hours. Or so they told you.",
    "Gomme nuove": "New tyres",
    "Il gommista è stato chiaro: non si rimanda.":
      "The tyre fitter was clear: this cannot wait.",
    "Abbonamento in palestra annuale": "A year's gym membership",
    "Da marzo diventerà un appendiabiti.":
      "From March it will be a coat rack.",
    "Televisore nuovo": "A new television",
    "Quello vecchio aveva solo sei anni.":
      "The old one was only six years old.",
    "Idraulico d'urgenza": "Emergency plumber",
    "Domenica sera, tariffa maggiorata.":
      "Sunday evening, at the out-of-hours rate.",
    "Vacanza in famiglia": "A family holiday",
    "Prenotata prima di guardare il conto corrente.":
      "Booked before anyone looked at the bank balance.",
    "Riparazione della frizione": "The clutch needs replacing",
    "Nessun preavviso, come sempre.":
      "No warning, as usual.",
    "Occhiali nuovi": "New glasses",
    "Montatura firmata, lenti progressive.":
      "Designer frames, varifocal lenses.",
    "Regalo di matrimonio": "A wedding present",
    "Lista nozze in un negozio molto costoso.":
      "The gift list is at a very expensive shop.",
    "Abbonamenti in streaming dimenticati": "Forgotten streaming subscriptions",
    "Sette servizi attivi, due davvero usati.":
      "Seven services running, two actually watched.",
    "Corso online mai finito": "An online course you never finished",
    "Sei arrivato alla lezione due.":
      "You got as far as lesson two.",
    "Bicicletta elettrica": "An electric bike",
    "La userai tutti i giorni. Promesso.":
      "You will use it every day. Promise.",
    "Scarpe e vestiti per i figli": "Shoes and clothes for the children",
    "Crescono più in fretta del previsto. 160 per figlio.":
      "They grow faster than anyone planned for. 160 per child.",
    "Centro estivo": "Summer camp",
    "Due settimane di serenità, a caro prezzo. 380 per figlio.":
      "Two weeks of peace, dearly bought. 380 per child.",
    "Libri e materiale scolastico": "School books and supplies",
    "Ogni settembre, puntuale. 300 per figlio.":
      "Every September, without fail. 300 per child.",
    "Impianto audio": "A sound system",
    "Il negoziante è stato molto convincente.":
      "The shop assistant was very persuasive.",
    "Quota in una barca con gli amici": "A share in a boat with friends",
    "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende.":
      "The two best days in a boat owner's life: the day they buy it and the day they sell it.",

    // ── Gli affari del Largo ──
    "Portafoglio di quaranta appartamenti a Roma": "A forty-flat portfolio in Rome",
    "Quaranta unità in quattro quartieri, gestione già strutturata.":
      "Forty units across four neighbourhoods, with management already in place.",
    "Residenza universitaria a San Lorenzo": "Student halls in San Lorenzo",
    "Centoventi posti letto, lista d'attesa da settembre a luglio.":
      "A hundred and twenty beds, with a waiting list from September to July.",
    "Centro commerciale di quartiere": "A neighbourhood shopping centre",
    "Trentadue esercizi, occupazione al 94%, gestione esternalizzata.":
      "Thirty-two shops, 94% let, management contracted out.",
    "Catena di sei hotel sul litorale": "Six hotels along the coast",
    "Stagionali ma con margini alti. Il rischio è il meteo, e non è poco.":
      "Seasonal, but with high margins. The risk is the weather, and that is no small thing.",
    "Parco fotovoltaico in Tuscia": "A solar farm in the Tuscia",
    "Incentivo ventennale già assegnato, terreno di proprietà.":
      "A twenty-year subsidy already awarded, and the land is freehold.",
    "Rete di data center in Europa": "A network of European data centres",
    "Tre poli affittati a operatori cloud con contratti decennali.":
      "Three sites let to cloud operators on ten-year contracts.",
    "Cantina e vigneto nel Lazio": "A vineyard and winery in Lazio",
    "Etichetta premiata, export in venti paesi. Anche il vino è un'azienda.":
      "An award-winning label exporting to twenty countries. Wine is a business too.",
    "Catena di venti caffetterie": "Twenty coffee bars",
    "Format collaudato, tostatura centralizzata, personale formato.":
      "A proven format, central roasting, trained staff.",
    "Flotta di logistica dell'ultimo miglio": "A last-mile delivery fleet",
    "Magazzini automatizzati in sei città, contratti con due corrieri.":
      "Automated warehouses in six cities, under contract to two carriers.",
    "Rete di cliniche private": "A network of private clinics",
    "Sei poliambulatori con convenzioni assicurative.":
      "Six outpatient centres with insurance contracts.",
    "Porto turistico a Fiumicino": "A marina at Fiumicino",
    "Trecento posti barca, lista d'attesa, concessione lunga.":
      "Three hundred berths, a waiting list, a long concession.",
    "Società di software gestionale": "A business software company",
    "Abbonamenti annuali da quattrocento aziende clienti.":
      "Annual subscriptions from four hundred corporate customers.",
    "Fondo immobiliare urbano europeo": "A European urban property fund",
    "Duecento appartamenti in tre capitali. Rendimento modesto, rischio diviso.":
      "Two hundred flats in three capitals. Modest yield, risk spread thin.",
    "Catena di palestre urbane": "A chain of city gyms",
    "Venti club in abbonamento mensile, personale in franchising.":
      "Twenty clubs on monthly membership, staffed by franchisees.",
    "Parco eolico in Appennino": "A wind farm in the Apennines",
    "Ventotto turbine, incentivi garantiti per vent'anni.":
      "Twenty-eight turbines, with subsidies guaranteed for twenty years.",
    "Torri per telecomunicazioni": "Telecoms masts",
    "Affittate a tre operatori con contratti ventennali. Nessun inquilino umano.":
      "Let to three operators on twenty-year contracts. Not a human tenant in sight.",
    "Studio di produzione a Cinecittà": "A production studio at Cinecittà",
    "Teatri di posa e catalogo di licenze. Ricavi ricorrenti da archivio.":
      "Sound stages and a licensing catalogue. Recurring income from the archive.",
    "Rete di case di riposo": "A group of care homes",
    "Quattro strutture accreditate. Domanda in crescita strutturale.":
      "Four accredited homes. Demand is rising and will keep rising.",
    "Stabilimenti balneari sul litorale": "Beach clubs along the coast",
    "Tre concessioni. Stagionali, ma il flusso estivo è enorme.":
      "Three concessions. Seasonal, but the summer takings are enormous.",
    "Impianto di riciclo industriale": "An industrial recycling plant",
    "Contratti pluriennali con consorzi di filiera.":
      "Multi-year contracts with industry consortia.",
  },
};
