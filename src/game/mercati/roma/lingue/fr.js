/**
 * Rome, en français.
 *
 * Seuls les mots changent. Les prix, les loyers, les salaires et les taux
 * restent romains et restent en euros : un marché est son marché, quelle
 * que soit la langue dans laquelle on le lit.
 *
 * Les noms de lieux ne se traduisent pas — Prati reste Prati, Trastevere
 * reste Trastevere — parce que c'est ainsi qu'on les dit, et qu'« un
 * deux-pièces aux Prés » ne voudrait rien dire. Ce qui se traduit, c'est la
 * nature de la chose : un *bilocale* est un deux-pièces, un *box auto* est
 * un garage fermé, un *stabile* est un immeuble de rapport.
 */
export default {
  professioni: {
    "dirigente-medico": { nome: "Médecin hospitalier" },
    pilota: { nome: "Pilote de ligne" },
    quadro: { nome: "Cadre d'entreprise" },
    avvocato: { nome: "Avocat" },
    ingegnere: { nome: "Ingénieur" },
    architetto: { nome: "Architecte" },
    autotrasportatore: { nome: "Routier" },
    infermiere: { nome: "Infirmier" },
    agente: { nome: "Policier" },
    meccanico: { nome: "Mécanicien" },
    insegnante: { nome: "Enseignant" },
    impiegato: { nome: "Employé de bureau" },
    operatore: { nome: "Éboueur" },
  },

  sogni: {
    sg01: { nome: "Faire le tour du monde, sans se presser" },
    sg02: { nome: "Construire une école au village de vos parents" },
    sg03: { nome: "Une maison face à la mer en Sardaigne" },
    sg04: { nome: "Ouvrir le restaurant dont vous rêvez depuis des années" },
    sg05: { nome: "Créer une association et la financer dix ans" },
    sg06: { nome: "Une expédition dans l'Himalaya" },
    sg07: { nome: "Un voilier de quinze mètres" },
    sg08: { nome: "Une année sabbatique pour toute la famille" },
    sg09: { nome: "Financer dix jeunes entreprises" },
    sg10: { nome: "Acheter et restaurer une ferme en Ombrie" },
    sg11: { nome: "Payer les études de tous vos petits-enfants" },
    sg12: { nome: "Un refuge en montagne, rien qu'à vous" },
  },

  etichetteSpese: {
    casa: "Prêt ou loyer",
    tasse: "Impôt sur les loyers",
    prestitoStudio: "Prêt étudiant",
    auto: "Voiture et transports",
    cartaCredito: "Carte de crédit",
    utenze: "Charges et téléphone",
    vita: "Courses, santé, loisirs",
  },

  etichettePassivita: {
    mutuo: "Prêt immobilier",
    prestitoStudio: "Prêt étudiant",
    auto: "Crédit auto",
    cartaCredito: "Carte de crédit",
    prestitoBanca: "Découvert bancaire",
  },

  /**
   * Les cartes, une par une.
   *
   * La clé est la phrase italienne, la valeur la même phrase en français.
   * Les noms de quartier ne bougent pas — Prati reste Prati — et les
   * chiffres non plus : ce qui change, c'est le type de chose. Un
   * *bilocale* est un deux-pièces, un *box auto* est un box fermé, un
   * *stabile* est un immeuble.
   */
  carte: {
    // ── Places et box ──
    "Posto auto a Tuscolano": "Place de parking à Tuscolano",
    "Scoperto, in un cortile condominiale. Nessuna manutenzione, nessun inquilino da inseguire.":
      "En plein air, dans une cour de copropriété. Aucun entretien, aucun locataire à relancer.",
    "Box auto a Montesacro": "Box fermé à Montesacro",
    "Chiuso, con serranda elettrica. In zona i box si affittano prima delle case.":
      "Fermé, rideau électrique. Dans le quartier, les box se louent avant les appartements.",
    "Box auto a Prati": "Box fermé à Prati",
    "Dove parcheggiare è impossibile, un box vale quanto una stanza.":
      "Là où se garer est impossible, un box vaut une pièce.",
    "Due posti auto a Ostia": "Deux places de parking à Ostia",
    "Affittati entrambi a residenti. D'estate si potrebbero rivalutare.":
      "Louées toutes les deux à des résidents. L'été, elles pourraient valoir davantage.",

    // ── Deux-pièces ──
    "Bilocale a Tor Bella Monaca": "Deux-pièces à Tor Bella Monaca",
    "Il rendimento lordo più alto della città. Il quartiere spaventa, i numeri no.":
      "Le rendement brut le plus élevé de la ville. Le quartier fait peur, les chiffres non.",
    "Bilocale a Ostia": "Deux-pièces à Ostia",
    "A dieci minuti dal mare. Affitti stabili tutto l'anno, non solo d'estate.":
      "À dix minutes de la mer. Des locations stables toute l'année, pas seulement l'été.",
    "Bilocale a Primavalle": "Deux-pièces à Primavalle",
    "Palazzina anni Sessanta, ristrutturata di recente. Inquilino già dentro.":
      "Immeuble des années soixante, rénové récemment. Locataire déjà en place.",
    "Bilocale a Torpignattara": "Deux-pièces à Torpignattara",
    "Quartiere che cambia in fretta. Chi è arrivato prima ha pagato la metà.":
      "Un quartier qui change vite. Ceux qui sont arrivés les premiers ont payé moitié moins.",
    "Bilocale a Cinecittà": "Deux-pièces à Cinecittà",
    "Vicino alla metro A. Chi lavora in centro e non vuole pagare il centro.":
      "Près de la ligne A du métro. Pour qui travaille au centre sans vouloir payer le centre.",
    "Bilocale a Portuense": "Deux-pièces à Portuense",
    "Vicino all'ospedale: personale sanitario in cerca di casa tutto l'anno.":
      "À côté de l'hôpital : du personnel soignant cherche à se loger toute l'année.",

    // ── Enchères et crédit vendeur ──
    "Trilocale all'asta a Torpignattara": "Trois-pièces aux enchères à Torpignattara",
    "Asta giudiziaria: sotto mercato, ma l'immobile va liberato. Anticipo ridotto.":
      "Vente aux enchères judiciaire : sous le marché, mais le logement doit être libéré. Apport réduit.",
    "Trilocale all'asta a Ostia": "Trois-pièces aux enchères à Ostia",
    "Gli eredi vogliono chiudere la pratica entro l'anno.":
      "Les héritiers veulent solder le dossier avant la fin de l'année.",
    "Trilocale a Primavalle, il venditore finanzia": "Trois-pièces à Primavalle, crédit vendeur",
    "Il proprietario accetta di essere pagato a rate: entri con molto meno.":
      "Le propriétaire accepte d'être payé par mensualités : vous entrez pour bien moins cher.",

    // ── Trois-pièces et centre ──
    "Trilocale a Tuscolano": "Trois-pièces à Tuscolano",
    "Famiglia in affitto da quattro anni, pagamenti sempre puntuali.":
      "Une famille locataire depuis quatre ans, qui n'a jamais payé en retard.",
    "Trilocale a Montesacro": "Trois-pièces à Montesacro",
    "Zona tranquilla e ben servita. Si affitta in una settimana.":
      "Quartier calme et bien desservi. Il se loue en une semaine.",
    "Trilocale a Cinecittà": "Trois-pièces à Cinecittà",
    "Da rinfrescare, ma strutturalmente a posto. Il prezzo lo rispecchia.":
      "À rafraîchir, mais sain sur le fond. Le prix le dit.",
    "Trilocale a Prati": "Trois-pièces à Prati",
    "L'indirizzo che tutti vogliono. Guarda il flusso mensile prima di innamorarti.":
      "L'adresse que tout le monde veut. Regardez le flux mensuel avant de tomber amoureux.",
    "Bilocale a Trastevere": "Deux-pièces à Trastevere",
    "Affascinante, turistico, carissimo. Il canone non tiene il passo del prezzo.":
      "Charmant, touristique, hors de prix. Le loyer ne suit pas le prix.",
    "Bilocale in Centro Storico": "Deux-pièces dans le centre historique",
    "Nove metri quadri di storia per ogni metro di utile. Il conto è impietoso.":
      "Neuf mètres carrés d'histoire pour chaque mètre de bénéfice. Le calcul est sans pitié.",

    // ── Terrains ──
    "Terreno agricolo sulla Tiberina": "Terrain agricole le long de la Tiberina",
    "Nessun affitto. Si guadagna solo se il piano regolatore cambia idea.":
      "Aucun loyer. On ne gagne que si le plan d'urbanisme change d'avis.",
    "Lotto ai margini di Ostia": "Un lot en bordure d'Ostia",
    "Scommessa pura. Potrebbe non succedere mai nulla.":
      "Un pari pur et simple. Il pourrait ne jamais rien se passer.",

    // ── Petites activités ──
    "Distributori automatici": "Distributeurs automatiques",
    "Dodici macchine fra palestre e uffici. Rifornimento una volta a settimana.":
      "Douze machines réparties entre salles de sport et bureaux. Réapprovisionnées une fois par semaine.",
    "Lavanderia a gettoni a San Lorenzo": "Laverie automatique à San Lorenzo",
    "Zona universitaria: incassi stabili da ottobre a luglio.":
      "Quartier étudiant : des recettes stables d'octobre à juillet.",
    "Chiosco al mercato rionale": "Kiosque au marché de quartier",
    "Licenza e posteggio già assegnati. Si lavora la mattina.":
      "Licence et emplacement déjà attribués. On travaille le matin.",
    "Autolavaggio self-service": "Station de lavage en libre-service",
    "Due piazzole su una strada di scorrimento. Quasi tutto automatico.":
      "Deux pistes sur un axe passant. Presque tout est automatique.",
    "Corso online già registrato": "Un cours en ligne déjà enregistré",
    "Girato e pubblicato: incassa senza chiederti altro tempo.":
      "Tourné et publié : il rapporte sans vous demander plus de temps.",
    "Tre appartamenti in sublocazione": "Trois appartements en sous-location",
    "Sublocazione autorizzata per iscritto. Gestione affidata a un'agenzia.":
      "Sous-location autorisée par écrit. La gestion est confiée à une agence.",
    "Piccolo e-commerce avviato": "Une petite boutique en ligne déjà lancée",
    "Nicchia stretta, margini alti, magazzino esternalizzato.":
      "Niche étroite, marges élevées, stockage externalisé.",

    // ── Papier ──
    "Quote Farmia": "Actions Farmia",
    "Azienda farmaceutica di fantasia, ai minimi dopo una causa. Fascia 6 – 34.":
      "Laboratoire pharmaceutique imaginaire, au plus bas après un procès. Fourchette 6 – 34.",
    "Un farmaco supera la fase due e il titolo si riprende.":
      "Un médicament passe la phase deux et le titre se redresse.",
    "Quote Voltia": "Actions Voltia",
    "Elettronica di consumo. Nessuna cedola, si guadagna solo rivendendo.":
      "Électronique grand public. Aucun coupon : on ne gagne qu'à la revente.",
    "Quote Energa": "Actions Energa",
    "Servizi energetici regolati: distribuisce 1,20 per quota al mese.":
      "Services énergétiques régulés : versent 1,20 par action et par mois.",
    "Tariffe approvate dall'autorità: la cedola resta.":
      "Les tarifs sont approuvés par le régulateur : le coupon tient.",
    "Fondo Dimora": "Fonds Dimora",
    "Fondo immobiliare di fantasia: distribuisce 0,60 per quota al mese.":
      "Fonds immobilier imaginaire : verse 0,60 par part et par mois.",
    "Fondo Altura": "Fonds Altura",
    "Fondo a forte crescita, nessuna cedola. Si scommette sul prezzo.":
      "Fonds de forte croissance, sans coupon. On parie sur le cours.",
    "Conto deposito vincolato": "Compte à terme",
    "1.000 vincolati che rendono 2,40 al mese. Sicuro, lentissimo, onesto.":
      "1 000 bloqués qui rapportent 2,40 par mois. Sûr, très lent, honnête.",

    // ── Imprévus ──
    "Rifacimento della facciata": "Ravalement de façade",
    "Delibera condominiale: la tua quota va versata entro due mesi.":
      "L'assemblée de copropriété a voté : votre quote-part est due sous deux mois.",
    "Caldaia da sostituire": "La chaudière est à remplacer",
    "L'inquilino chiama a novembre. Non si rimanda.":
      "Le locataire appelle en novembre. Cela ne se reporte pas.",
    "Inquilino moroso": "Locataire en impayé",
    "Tre mensilità non incassate e le spese dell'avvocato.":
      "Trois mois de loyer jamais encaissés, plus les frais d'avocat.",
    "Un amico chiede un prestito": "Un ami vous demande un prêt",
    "Puoi rifiutare senza alcuna penalità. Puoi anche dire di sì.":
      "Vous pouvez refuser sans aucune pénalité. Vous pouvez aussi dire oui.",

    // ── Grandes affaires : immobilier ──
    "Quattro bilocali a Tor Bella Monaca": "Quatre deux-pièces à Tor Bella Monaca",
    "Un'unica proprietà, quattro inquilini. Il rischio si divide per quattro.":
      "Un seul titre de propriété, quatre locataires. Le risque est divisé par quatre.",
    "Palazzina di sei unità a Ostia": "Immeuble de six logements à Ostia",
    "Occupazione piena da tre anni. Gestione già affidata a un'agenzia.":
      "Entièrement loué depuis trois ans. Une agence s'en occupe déjà.",
    "Cinque unità a Primavalle": "Cinq logements à Primavalle",
    "Il proprietario va in pensione e vende tutto insieme.":
      "Le propriétaire part à la retraite et vend le tout en bloc.",
    "Palazzina all'asta a Torpignattara": "Immeuble aux enchères à Torpignattara",
    "Sotto mercato: due unità sono da liberare, e ci vorrà tempo.":
      "Sous le marché : deux logements sont à libérer, et cela prendra du temps.",
    "Stabile di otto unità a Cinecittà": "Immeuble de huit logements à Cinecittà",
    "Vicino alla metro. Lista d'attesa per gli affitti.":
      "Près du métro. Il y a une liste d'attente pour louer.",
    "Stabile di dieci unità a Portuense": "Immeuble de dix logements à Portuense",
    "Grande, impegnativo, redditizio. Serve qualcuno che lo gestisca.":
      "Grand, exigeant, rentable. Il faut quelqu'un pour le gérer.",
    "Cinque unità a Tuscolano": "Cinq logements à Tuscolano",
    "Impianti rifatti l'anno scorso: nessuna sorpresa a breve.":
      "Électricité et plomberie refaites l'an dernier : pas de surprise avant longtemps.",
    "Quattro unità a Montesacro": "Quatre logements à Montesacro",
    "Affittate a personale sanitario dell'ospedale vicino.":
      "Loués au personnel soignant de l'hôpital voisin.",
    "Stabile a Ostiense": "Immeuble à Ostiense",
    "Zona in piena rivalutazione. Il rendimento oggi è modesto, domani si vedrà.":
      "Un quartier en pleine montée. Le rendement est modeste aujourd'hui ; demain, on verra.",
    "Palazzina a Garbatella": "Petit immeuble à Garbatella",
    "Quartiere amatissimo. Si compra col cuore, si tiene con i conti.":
      "Un quartier très aimé. On l'achète avec le cœur et on le garde avec les comptes.",
    "Terreno edificabile sulla Cassia": "Terrain constructible sur la Cassia",
    "Permesso a costruire già rilasciato. Nessuna rendita finché non si costruisce.":
      "Permis de construire déjà délivré. Aucun revenu tant que rien n'est bâti.",

    // ── Grandes affaires : activités ──
    "Pizzeria avviata a San Lorenzo": "Une pizzeria établie à San Lorenzo",
    "Locale storico, clientela fissa, il pizzaiolo resta.":
      "Une adresse ancienne, une clientèle fidèle, et le pizzaïolo reste.",
    "Bed and breakfast a Trastevere": "Chambres d'hôtes à Trastevere",
    "Sei camere, licenza in regola. Dipende dal turismo, e il turismo va e viene.":
      "Six chambres, licence en règle. Cela vit du tourisme, et le tourisme va et vient.",
    "Deposito self-storage al Prenestino": "Centre de self-stockage au Prenestino",
    "Occupazione stabile all'88%. Quasi nessun personale.":
      "Taux d'occupation stable à 88 %. Presque aucun personnel.",
    "Catena di tre lavanderie": "Une chaîne de trois laveries",
    "Tre punti in quartieri diversi, tutti con contratti lunghi.":
      "Trois adresses dans des quartiers différents, toutes sous baux longs.",
    "Palestra di quartiere": "Une salle de sport de quartier",
    "Seicento abbonati. Il modello regge finché non apre una catena vicino.":
      "Six cents abonnés. Le modèle tient tant qu'une chaîne n'ouvre pas à côté.",
    "Software gestionale per studi medici": "Un logiciel de gestion pour cabinets médicaux",
    "Abbonamenti annuali da settanta studi. Margini alti, serve un tecnico.":
      "Des abonnements annuels de soixante-dix cabinets. Marges élevées, il faut un technicien.",
    "Impianto fotovoltaico in locazione": "Une centrale photovoltaïque en location",
    "Incentivo ventennale già assegnato. Manutenzione a carico del gestore.":
      "Un tarif garanti sur vingt ans déjà attribué. L'entretien est à la charge de l'exploitant.",
    "Rete di sei distributori automatici h24": "Six points de distribution ouverts jour et nuit",
    "Postazioni h24 in zone di passaggio. Rifornimento esternalizzato.":
      "Ouverts en continu dans des lieux de passage. Réapprovisionnement externalisé.",
    "Autolavaggio in franchising": "Une franchise de stations de lavage",
    "Tre impianti su strade ad alto traffico. Marchio riconosciuto.":
      "Trois sites sur des axes très passants. Une enseigne connue.",
    "Studio dentistico associato": "Un cabinet dentaire de groupe",
    "Due poltrone, convenzioni assicurative, professionisti già dentro.":
      "Deux fauteuils, des conventions avec les assurances, et les praticiens restent.",
    "Causa da un inquilino": "Un locataire vous attaque en justice",
    "Infortunio nelle parti comuni. L'assicurazione copre solo una parte.":
      "Un accident dans les parties communes. L'assurance n'en couvre qu'une partie.",

    // ── Le marché ──
    "Giovane coppia cerca il primo bilocale": "Un jeune couple cherche son premier deux-pièces",
    "Offre il 122% del costo per un bilocale. I mutui agevolati per gli under 36 muovono il mercato.":
      "Ils offrent 122 % du coût pour un deux-pièces. Les prêts aidés aux moins de 36 ans font bouger le marché.",
    "Investitore rastrella bilocali in periferia": "Un investisseur rachète les deux-pièces de périphérie",
    "Offerta rapida, sotto le aspettative, ma in contanti.":
      "Une offre rapide, en dessous de vos attentes, mais comptant.",
    "Famiglia cerca un trilocale": "Une famille cherche un trois-pièces",
    "Trasferimento di lavoro: devono chiudere entro il mese.":
      "Une mutation professionnelle : ils doivent signer dans le mois.",
    "Cercasi quadrilocale con terrazzo": "Recherché : quatre-pièces avec terrasse",
    "Il quartiere è diventato di moda e i prezzi sono saliti.":
      "Le quartier est devenu à la mode et les prix ont suivi.",
    "Il condominio compra i posti auto": "La copropriété rachète les places de parking",
    "Vogliono chiudere il cortile. Offrono il 135% del costo.":
      "Ils veulent fermer la cour. Ils offrent 135 % du coût.",
    "Fondo immobiliare compra palazzine": "Un fonds immobilier achète des petits immeubles",
    "Un fondo sta costruendo un portafoglio residenziale a Roma sud.":
      "Un fonds constitue un portefeuille résidentiel dans le sud de Rome.",
    "Gruppo internazionale cerca stabili": "Un groupe international cherche des immeubles entiers",
    "Vogliono interi stabili da riconvertire in affitti brevi.":
      "Ils veulent des immeubles entiers à reconvertir en location courte durée.",
    "Variante urbanistica approvata": "Modification du plan d'urbanisme approuvée",
    "Il terreno agricolo diventa edificabile. Succede di rado, e cambia tutto.":
      "Le terrain agricole devient constructible. Cela arrive rarement, et cela change tout.",
    "Cercasi lotto per un supermercato": "Recherché : un terrain pour un supermarché",
    "Una catena della distribuzione cerca terreni fuori dal Raccordo.":
      "Une enseigne de la grande distribution cherche des terrains hors du périphérique.",
    "Un concorrente vuole comprarti": "Un concurrent veut vous racheter",
    "Offre il 155% del costo per una qualsiasi delle tue attività.":
      "Il offre 155 % du coût pour n'importe laquelle de vos activités.",
    "Fondo di private equity": "Un fonds de capital-investissement",
    "Offerta di uscita al 130% del costo per una tua attività.":
      "Une offre de sortie à 130 % du coût pour une de vos activités.",
    "Farmia ai massimi": "Farmia au plus haut",
    "Approvato un nuovo farmaco. Tutti possono vendere a 34.":
      "Un nouveau médicament est approuvé. Tout le monde peut vendre à 34.",
    "Farmia crolla": "Farmia s'effondre",
    "Effetti collaterali inattesi: il titolo torna al minimo di fascia.":
      "Des effets secondaires inattendus : le titre retombe au bas de sa fourchette.",
    "Offerta pubblica su Voltia": "OPA sur Voltia",
    "Un gruppo estero lancia un'OPA. Tutti possono vendere a 44.":
      "Un groupe étranger lance une offre publique d'achat. Tout le monde peut vendre à 44.",
    "Voltia delude": "Voltia déçoit",
    "Trimestrale sotto le attese, il titolo torna ai minimi.":
      "Résultats trimestriels sous les attentes : le titre retombe au plus bas.",
    "Energa acquisita": "Energa est rachetée",
    "Fusione nel settore energetico. Tutti possono vendere a 44.":
      "Fusion dans le secteur de l'énergie. Tout le monde peut vendre à 44.",
    "Altura ai massimi": "Altura au plus haut",
    "Il mercato corre e il fondo con lui.":
      "Le marché s'envole et le fonds avec lui.",
    "Dimora si rivaluta": "Dimora se revalorise",
    "Gli affitti salgono e il fondo immobiliare con loro.":
      "Les loyers montent et le fonds immobilier avec eux.",
    "Acconto IMU": "Acompte d'IMU, la taxe foncière italienne",
    "Ogni giocatore paga 420 per ciascun immobile che non sia la propria abitazione.":
      "Chaque joueur paie 420 pour chaque bien qui n'est pas sa résidence principale.",
    "Estate romana": "L'été romain",
    "Turismo record: ogni giocatore incassa 900 per ciascuna attività.":
      "Tourisme record : chaque joueur encaisse 900 pour chaque activité.",
    "Aumento delle spese condominiali": "Les charges de copropriété augmentent",
    "Assicurazione e manutenzione salgono per tutti: 260 per immobile.":
      "Assurance et entretien montent pour tout le monde : 260 par bien.",
    "Il mercato degli affitti si raffredda": "Le marché locatif se refroidit",
    "Nuove regole sugli affitti brevi e più offerta in città: i canoni calano del 15% per tutti.":
      "Nouvelles règles sur la location courte durée et plus d'offre en ville : les loyers baissent de 15 % pour tout le monde.",
    "Corsa agli affitti": "La ruée sur les locations",
    "Domanda in crescita e poca offerta: i canoni salgono del 12% per tutti.":
      "Demande en hausse et offre rare : les loyers montent de 12 % pour tout le monde.",
    "La BCE alza i tassi": "La BCE relève ses taux",
    "Chi ha un mutuo a tasso variabile vede salire la rata. Chi non ha debiti non se ne accorge.":
      "Qui a un prêt à taux variable voit sa mensualité monter. Qui n'a pas de dettes ne s'en aperçoit pas.",
    "Nuova fermata della metro C": "Une nouvelle station sur la ligne C du métro",
    "Il quartiere si rivaluta. Nessun effetto immediato: i prossimi compratori pagheranno di più.":
      "Le quartier prend de la valeur. Rien ne change aujourd'hui : les prochains acheteurs paieront plus cher.",

    // ── Les dépenses de tous les jours ──
    "Bollo e revisione dell'auto": "Taxe sur le véhicule et contrôle technique",
    "Arrivano sempre insieme, e sempre a gennaio.":
      "Ils tombent toujours ensemble, et toujours en janvier.",
    "Telefono nuovo": "Un téléphone neuf",
    "Il vecchio funzionava ancora benissimo.":
      "L'ancien marchait encore très bien.",
    "Multa dell'autovelox": "Amende de radar",
    "Sulla Colombo, in un tratto che conoscevi benissimo.":
      "Sur la Colombo, sur une portion que vous connaissiez par cœur.",
    "Dentista": "Le dentiste",
    "Una carie che sembrava innocua.":
      "Une carie qui semblait sans gravité.",
    "Il cane dal veterinario": "Le chien chez le vétérinaire",
    "Ha mangiato qualcosa che non doveva. Di nuovo.":
      "Il a mangé quelque chose qu'il ne devait pas. Encore.",
    "Lavatrice da sostituire": "Le lave-linge est à remplacer",
    "Si è rotta con il bucato dentro.":
      "Il est tombé en panne avec le linge dedans.",
    "Cena e regalo di anniversario": "Dîner et cadeau d'anniversaire de mariage",
    "Dimenticato, poi recuperato a caro prezzo.":
      "Oublié, puis rattrapé à prix fort.",
    "Weekend last minute": "Un week-end de dernière minute",
    "L'offerta scadeva tra due ore. Almeno così ti hanno detto.":
      "L'offre expirait dans deux heures. C'est du moins ce qu'on vous a dit.",
    "Gomme nuove": "Des pneus neufs",
    "Il gommista è stato chiaro: non si rimanda.":
      "Le garagiste a été clair : cela ne se reporte pas.",
    "Abbonamento in palestra annuale": "Un abonnement annuel à la salle de sport",
    "Da marzo diventerà un appendiabiti.":
      "À partir de mars, ce sera un porte-manteau.",
    "Televisore nuovo": "Une télévision neuve",
    "Quello vecchio aveva solo sei anni.":
      "L'ancienne n'avait que six ans.",
    "Idraulico d'urgenza": "Plombier en urgence",
    "Domenica sera, tariffa maggiorata.":
      "Dimanche soir, au tarif majoré.",
    "Vacanza in famiglia": "Des vacances en famille",
    "Prenotata prima di guardare il conto corrente.":
      "Réservées avant d'avoir regardé le compte en banque.",
    "Riparazione della frizione": "L'embrayage est à refaire",
    "Nessun preavviso, come sempre.":
      "Sans prévenir, comme toujours.",
    "Occhiali nuovi": "Des lunettes neuves",
    "Montatura firmata, lenti progressive.":
      "Monture de marque, verres progressifs.",
    "Regalo di matrimonio": "Un cadeau de mariage",
    "Lista nozze in un negozio molto costoso.":
      "La liste est déposée dans une boutique très chère.",
    "Abbonamenti in streaming dimenticati": "Des abonnements en streaming oubliés",
    "Sette servizi attivi, due davvero usati.":
      "Sept services actifs, deux réellement regardés.",
    "Corso online mai finito": "Un cours en ligne jamais terminé",
    "Sei arrivato alla lezione due.":
      "Vous en êtes à la leçon deux.",
    "Bicicletta elettrica": "Un vélo électrique",
    "La userai tutti i giorni. Promesso.":
      "Vous l'utiliserez tous les jours. Promis.",
    "Scarpe e vestiti per i figli": "Chaussures et vêtements pour les enfants",
    "Crescono più in fretta del previsto. 160 per figlio.":
      "Ils grandissent plus vite que prévu. 160 par enfant.",
    "Centro estivo": "Centre aéré",
    "Due settimane di serenità, a caro prezzo. 380 per figlio.":
      "Deux semaines de tranquillité, chèrement payées. 380 par enfant.",
    "Libri e materiale scolastico": "Livres et fournitures scolaires",
    "Ogni settembre, puntuale. 300 per figlio.":
      "Chaque septembre, sans faute. 300 par enfant.",
    "Impianto audio": "Une chaîne hi-fi",
    "Il negoziante è stato molto convincente.":
      "Le vendeur a été très convaincant.",
    "Quota in una barca con gli amici": "Une part de bateau entre amis",
    "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende.":
      "Les deux plus beaux jours de la vie d'un propriétaire de bateau : le jour où il l'achète et le jour où il le revend.",

    // ── Les affaires du Large ──
    "Portafoglio di quaranta appartamenti a Roma": "Un portefeuille de quarante appartements à Rome",
    "Quaranta unità in quattro quartieri, gestione già strutturata.":
      "Quarante logements dans quatre quartiers, avec une gestion déjà en place.",
    "Residenza universitaria a San Lorenzo": "Une résidence étudiante à San Lorenzo",
    "Centoventi posti letto, lista d'attesa da settembre a luglio.":
      "Cent vingt lits, avec une liste d'attente de septembre à juillet.",
    "Centro commerciale di quartiere": "Un centre commercial de quartier",
    "Trentadue esercizi, occupazione al 94%, gestione esternalizzata.":
      "Trente-deux commerces, 94 % d'occupation, gestion externalisée.",
    "Catena di sei hotel sul litorale": "Six hôtels sur le littoral",
    "Stagionali ma con margini alti. Il rischio è il meteo, e non è poco.":
      "Saisonniers mais à fortes marges. Le risque, c'est la météo, et ce n'est pas rien.",
    "Parco fotovoltaico in Tuscia": "Un parc photovoltaïque en Tuscia",
    "Incentivo ventennale già assegnato, terreno di proprietà.":
      "Un tarif garanti sur vingt ans déjà attribué, et le terrain vous appartient.",
    "Rete di data center in Europa": "Un réseau de centres de données en Europe",
    "Tre poli affittati a operatori cloud con contratti decennali.":
      "Trois sites loués à des opérateurs cloud sous contrats de dix ans.",
    "Cantina e vigneto nel Lazio": "Un vignoble et sa cave dans le Latium",
    "Etichetta premiata, export in venti paesi. Anche il vino è un'azienda.":
      "Une étiquette primée, exportée dans vingt pays. Le vin aussi est une entreprise.",
    "Catena di venti caffetterie": "Vingt cafés en chaîne",
    "Format collaudato, tostatura centralizzata, personale formato.":
      "Un format éprouvé, une torréfaction centralisée, du personnel formé.",
    "Flotta di logistica dell'ultimo miglio": "Une flotte de livraison du dernier kilomètre",
    "Magazzini automatizzati in sei città, contratti con due corrieri.":
      "Des entrepôts automatisés dans six villes, sous contrat avec deux transporteurs.",
    "Rete di cliniche private": "Un réseau de cliniques privées",
    "Sei poliambulatori con convenzioni assicurative.":
      "Six centres de consultation conventionnés avec les assurances.",
    "Porto turistico a Fiumicino": "Un port de plaisance à Fiumicino",
    "Trecento posti barca, lista d'attesa, concessione lunga.":
      "Trois cents anneaux, une liste d'attente, une concession longue.",
    "Società di software gestionale": "Un éditeur de logiciels de gestion",
    "Abbonamenti annuali da quattrocento aziende clienti.":
      "Des abonnements annuels souscrits par quatre cents entreprises.",
    "Fondo immobiliare urbano europeo": "Un fonds immobilier urbain européen",
    "Duecento appartamenti in tre capitali. Rendimento modesto, rischio diviso.":
      "Deux cents appartements dans trois capitales. Rendement modeste, risque dilué.",
    "Catena di palestre urbane": "Une chaîne de salles de sport urbaines",
    "Venti club in abbonamento mensile, personale in franchising.":
      "Vingt clubs en abonnement mensuel, tenus par des franchisés.",
    "Parco eolico in Appennino": "Un parc éolien dans les Apennins",
    "Ventotto turbine, incentivi garantiti per vent'anni.":
      "Vingt-huit éoliennes, avec des tarifs garantis pendant vingt ans.",
    "Torri per telecomunicazioni": "Des pylônes de télécommunications",
    "Affittate a tre operatori con contratti ventennali. Nessun inquilino umano.":
      "Loués à trois opérateurs sous contrats de vingt ans. Pas un locataire humain.",
    "Studio di produzione a Cinecittà": "Un studio de production à Cinecittà",
    "Teatri di posa e catalogo di licenze. Ricavi ricorrenti da archivio.":
      "Des plateaux de tournage et un catalogue de licences. Des revenus récurrents venus des archives.",
    "Rete di case di riposo": "Un groupe de maisons de retraite",
    "Quattro strutture accreditate. Domanda in crescita strutturale.":
      "Quatre établissements agréés. Une demande qui monte et continuera de monter.",
    "Stabilimenti balneari sul litorale": "Des établissements de plage sur le littoral",
    "Tre concessioni. Stagionali, ma il flusso estivo è enorme.":
      "Trois concessions. Saisonniers, mais les recettes d'été sont énormes.",
    "Impianto di riciclo industriale": "Une usine de recyclage industriel",
    "Contratti pluriennali con consorzi di filiera.":
      "Des contrats pluriannuels avec des consortiums de filière.",
  },
};
