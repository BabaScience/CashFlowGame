/**
 * Le marché classique, en français.
 * Seuls les mots changent : les montants restent en dollars.
 */
export default {
  professioni: {
    medico: { nome: "Médecin" }, pilota: { nome: "Pilote de ligne" },
    avvocato: { nome: "Avocat" }, ingegnere: { nome: "Ingénieur" },
    manager: { nome: "Cadre d'entreprise" }, insegnante: { nome: "Enseignant" },
    infermiere: { nome: "Infirmier" }, poliziotto: { nome: "Policier" },
    camionista: { nome: "Routier" }, segretario: { nome: "Secrétaire" },
    meccanico: { nome: "Mécanicien" }, custode: { nome: "Gardien" },
  },
  sogni: {
    sg01: { nome: "Faire le tour du monde en première classe" },
    sg02: { nome: "Construire une école dans votre ville natale" },
    sg03: { nome: "Une maison sur la plage aux Caraïbes" },
    sg04: { nome: "Dîner avec un chef d'État" },
    sg05: { nome: "Fonder une organisation à but non lucratif" },
    sg06: { nome: "Gravir l'Everest en expédition privée" },
    sg07: { nome: "Un yacht de 30 mètres" },
    sg08: { nome: "Une année sabbatique pour toute la famille" },
    sg09: { nome: "Financer dix jeunes entreprises" },
    sg10: { nome: "Courir les 24 Heures du Mans" },
    sg11: { nome: "Un vol suborbital dans l'espace" },
    sg12: { nome: "Un refuge privé dans les Alpes" },
  },
  etichetteSpese: {
    tasse: "Impôts", mutuo: "Prêt / loyer", prestitoStudio: "Prêt étudiant",
    auto: "Crédit auto", cartaCredito: "Carte de crédit",
    rate: "Crédits magasin", altre: "Autres dépenses",
  },
  etichettePassivita: {
    mutuo: "Prêt immobilier", prestitoStudio: "Prêt étudiant", auto: "Crédit auto",
    cartaCredito: "Cartes de crédit", rate: "Dettes magasin", prestitoBanca: "Prêt bancaire",
  },
  /**
   * Les cartes, une par une.
   *
   * La clé est la phrase italienne, la valeur la même phrase en français.
   * Le marché classique parle en dollars : une *bifamiliare* est une
   * maison de deux logements, une *quadrifamiliare* un immeuble de
   * quatre. Les chiffres ne bougent pas.
   */
  carte: {
    // ── Papier ──
    "Azioni Farmia": "Actions Farmia",
    "Il titolo è ai minimi storici dopo una causa legale. Solo tu puoi comprare a questo prezzo; tutti possono vendere.":
      "Le titre est au plus bas historique après un procès. Vous seul pouvez acheter à ce prix ; tout le monde peut vendre.",
    "Un nuovo farmaco supera la fase 2. Fascia di oscillazione $5 - $30.":
      "Un nouveau médicament passe la phase 2. Fourchette de cours 5 $ - 30 $.",
    "La forza del mercato spinge in alto le quotazioni di questo storico produttore di medicinali.":
      "La vigueur du marché tire vers le haut le cours de ce laboratoire de longue date.",
    "Azioni Voltia": "Actions Voltia",
    "Azienda di elettronica di consumo. Nessun dividendo, forte crescita attesa.":
      "Entreprise d'électronique grand public. Aucun dividende, forte croissance attendue.",
    "Il nuovo modello va a ruba nei negozi. Fascia di oscillazione $10 - $40.":
      "Le nouveau modèle s'arrache en magasin. Fourchette de cours 10 $ - 40 $.",
    "Gli analisti alzano il target. Sei ancora in tempo o è già tardi?":
      "Les analystes relèvent leur objectif. Êtes-vous encore à temps, ou déjà trop tard ?",
    "Azioni Energa": "Actions Energa",
    "Azienda di servizi energetici: paga $1 di dividendo per azione al mese.":
      "Entreprise de services énergétiques : elle verse 1 $ de dividende par action et par mois.",
    "Tariffe approvate dall'autorità: il dividendo resta $1 per azione al mese.":
      "Les tarifs sont approuvés par le régulateur : le dividende reste à 1 $ par action et par mois.",
    "Fondo comune Altura": "Fonds commun Altura",
    "Fondo azionario a forte crescita. Nessuna cedola, si guadagna sulla rivendita.":
      "Fonds actions de forte croissance. Aucun coupon : on gagne à la revente.",
    "Il fondo ha battuto l'indice per il terzo anno consecutivo.":
      "Le fonds bat l'indice pour la troisième année consécutive.",
    "Il fondo è caro. Gli analisti consigliano prudenza.":
      "Le fonds est cher. Les analystes conseillent la prudence.",
    "Fondo immobiliare Dimora": "Fonds immobilier Dimora",
    "Fondo immobiliare quotato: distribuisce $0,50 per azione al mese.":
      "Fonds immobilier coté : il verse 0,50 $ par part et par mois.",
    "Gli affitti salgono e il fondo si rivaluta. Cedola invariata a $0,50.":
      "Les loyers montent et le fonds se revalorise. Coupon inchangé à 0,50 $.",
    "Certificato di deposito": "Certificat de dépôt",
    "Deposito vincolato: $1.000 che rendono $5 al mese. Sicuro, ma lento.":
      "Dépôt bloqué : 1 000 $ qui rapportent 5 $ par mois. Sûr, mais lent.",
    "Massimo storico. Chi ha comprato a $5 sorride.":
      "Plus haut historique. Qui a acheté à 5 $ sourit.",

    // ── Petits biens ──
    "Casa 2 locali in vendita": "Maison deux-pièces à vendre",
    "Il proprietario si trasferisce e vende in fretta. Zona tranquilla, inquilino già presente.":
      "Le propriétaire déménage et vend vite. Quartier calme, locataire déjà en place.",
    "Casa 2 locali all'asta": "Maison deux-pièces aux enchères",
    "Immobile pignorato, venduto all'asta giudiziaria sotto il valore di mercato.":
      "Bien saisi, vendu aux enchères judiciaires sous la valeur du marché.",
    "Casa 3 locali, quartiere in crescita": "Maison trois-pièces dans un quartier qui monte",
    "Vicino alla nuova fermata della metropolitana. Lista d'attesa per gli affitti.":
      "Près de la nouvelle station de métro. Il y a une liste d'attente pour louer.",
    "Casa 3 locali da ristrutturare": "Maison trois-pièces à rénover",
    "Serve lavoro, ma il prezzo lo rispecchia. Buon potenziale di rivalutazione.":
      "Il y a des travaux, mais le prix le dit. Beau potentiel de plus-value.",
    "Casa 4 locali con giardino": "Maison quatre-pièces avec jardin",
    "Famiglia numerosa in affitto da tre anni, pagamenti sempre puntuali.":
      "Une famille nombreuse locataire depuis trois ans, qui n'a jamais payé en retard.",
    "Bifamiliare": "Maison de deux logements",
    "Due unità, entrambe affittate. Il venditore accetta un acconto minimo.":
      "Deux logements, loués tous les deux. Le vendeur accepte un apport minimal.",
    "Casa 2 locali, vendita del proprietario": "Maison deux-pièces, vendue par le propriétaire",
    "Venduta direttamente dal proprietario, senza agenzia. Nessuna provvigione.":
      "Vendue directement par le propriétaire, sans agence. Aucune commission.",
    "10 ettari di terreno agricolo": "10 hectares de terres agricoles",
    "Nessun affitto: guadagni solo quando il terreno viene rivalutato e rivenduto.":
      "Aucun loyer : on ne gagne que lorsque le terrain prend de la valeur et se revend.",
    "20 ettari ai margini della città": "20 hectares en bordure de ville",
    "Il piano regolatore potrebbe cambiare. Scommessa pura sul futuro.":
      "Le plan d'urbanisme pourrait changer. Un pari pur et simple sur l'avenir.",
    "Casa 3 locali, affare del mese": "Maison trois-pièces, l'affaire du mois",
    "Gli eredi vogliono liquidare in fretta. Acconto ridotto concordato.":
      "Les héritiers veulent vendre vite. Un apport réduit a été négocié.",
    "Casa 2 locali, zona universitaria": "Maison deux-pièces près de l'université",
    "Studenti in affitto tutto l'anno accademico.":
      "Des étudiants locataires toute l'année universitaire.",
    "Casa 4 locali pignorata": "Maison quatre-pièces saisie",
    "La banca vuole chiudere la pratica. Acconto sorprendentemente basso.":
      "La banque veut solder le dossier. Un apport étonnamment faible.",
    "Bifamiliare da ristrutturare": "Maison de deux logements à rénover",
    "Una unità è già affittata, l'altra da sistemare.":
      "Un logement est déjà loué, l'autre est à remettre en état.",
    "Tre monolocali su affitto breve": "Trois studios en location courte durée",
    "Sublocazione autorizzata dal proprietario. Gestione affidata a terzi.":
      "Sous-location autorisée par le propriétaire. Gestion confiée à un tiers.",

    // ── Petites activités ──
    "Distributori automatici": "Distributeurs automatiques",
    "Otto distributori in palestre e uffici. Rifornimento una volta a settimana.":
      "Huit machines dans des salles de sport et des bureaux. Réapprovisionnées une fois par semaine.",
    "Autolavaggio self-service": "Station de lavage en libre-service",
    "Due piazzole automatiche in una zona di passaggio.":
      "Deux pistes automatiques dans un lieu de passage.",
    "Lavanderia a gettoni": "Laverie automatique",
    "Vicino a un campus universitario. Incassi stabili tutto l'anno.":
      "Près d'un campus universitaire. Des recettes stables toute l'année.",
    "Chiosco di street food": "Kiosque de cuisine de rue",
    "Licenza già ottenuta, posizione assegnata nel mercato coperto.":
      "Licence déjà obtenue, emplacement attribué dans le marché couvert.",
    "Corso online già registrato": "Un cours en ligne déjà enregistré",
    "Il corso è girato e pubblicato: incassa senza il tuo tempo.":
      "Le cours est tourné et publié : il rapporte sans prendre de votre temps.",
    "Micro-società di software": "Un micro-éditeur de logiciels",
    "Un piccolo gestionale con 40 clienti in abbonamento. Margini alti.":
      "Un petit logiciel de gestion avec 40 clients abonnés. Marges élevées.",

    // ── Imprévus ──
    "Il tetto perde": "Le toit fuit",
    "Uno dei tuoi immobili ha bisogno di un tetto nuovo. Paghi solo se possiedi almeno un immobile.":
      "Un de vos biens a besoin d'un toit neuf. Vous ne payez que si vous possédez au moins un bien.",
    "Caldaia da sostituire": "La chaudière est à remplacer",
    "L'inquilino chiama a novembre. Non puoi rimandare.":
      "Le locataire appelle en novembre. Vous ne pouvez pas reporter.",
    "Un amico chiede un prestito": "Un ami vous demande un prêt",
    "Un vecchio amico ti chiede $1.000. Puoi rifiutare senza alcuna penalità.":
      "Un vieil ami vous demande 1 000 $. Vous pouvez refuser sans aucune pénalité.",
    "Inquilino moroso": "Locataire en impayé",
    "Un mese di affitto non incassato, più le spese legali.":
      "Un mois de loyer jamais encaissé, plus les frais de justice.",
    "Multa edilizia": "Amende d'urbanisme",
    "Una difformità catastale su un tuo immobile: sanzione da pagare.":
      "Une irrégularité cadastrale sur un de vos biens : il y a une amende à payer.",

    // ── Grandes affaires ──
    "Quadrifamiliare in vendita": "Immeuble de quatre logements à vendre",
    "Quattro unità, tutte affittate. Il proprietario va in pensione e vende.":
      "Quatre logements, tous loués. Le propriétaire part à la retraite et vend.",
    "Quadrifamiliare ristrutturata": "Immeuble de quatre logements rénové",
    "Impianti rifatti l'anno scorso. Nessuna manutenzione prevista a breve.":
      "Électricité et plomberie refaites l'an dernier. Aucun entretien prévu avant longtemps.",
    "Palazzina 8 unità": "Immeuble de huit logements",
    "Occupazione al 100% da due anni. Zona con forte domanda di affitti.":
      "Entièrement loué depuis deux ans. Un quartier où la demande locative est forte.",
    "Condominio 12 appartamenti": "Immeuble de douze appartements",
    "Offerto dagli eredi fuori regione del vecchio proprietario. Lunga lista d'attesa. ROI 58%.":
      "Proposé par les héritiers, installés loin, de l'ancien propriétaire. Longue liste d'attente. 58 % de rendement sur les fonds engagés.",
    "Condominio 20 appartamenti": "Immeuble de vingt appartements",
    "Grande complesso residenziale con gestione già avviata.":
      "Un grand ensemble résidentiel dont la gestion tourne déjà.",
    "Palazzina 8 unità, occasione": "Immeuble de huit logements, une occasion",
    "Il venditore ha bisogno di liquidità entro fine mese.":
      "Le vendeur a besoin de liquidités avant la fin du mois.",
    "Quadrifamiliare vicino all'ospedale": "Immeuble de quatre logements près de l'hôpital",
    "Affittata a personale sanitario in trasferta.":
      "Loué à du personnel soignant en mission.",
    "Palazzina 8 unità, asta giudiziaria": "Immeuble de huit logements, vente aux enchères judiciaire",
    "Prezzo sotto mercato: due unità sono da liberare.":
      "Prix sous le marché : deux logements sont à libérer.",
    "Quadrifamiliare in periferia": "Immeuble de quatre logements en périphérie",
    "Acconto contenuto perché il venditore finanzia parte del prezzo.":
      "Apport modeste, parce que le vendeur finance une partie du prix.",
    "Residence 30 unità": "Résidence de trente logements",
    "Un affare da investitore esperto. Il flusso di cassa parla da solo.":
      "Une affaire d'investisseur aguerri. Le flux de trésorerie parle de lui-même.",
    "40 ettari con permesso edificatorio": "40 hectares avec permis de construire",
    "Il comune ha appena approvato la variante. Nessun affitto, ma forte potenziale.":
      "La commune vient d'approuver la modification du plan. Aucun loyer, mais un vrai potentiel.",
    "Pizzeria avviata": "Une pizzeria établie",
    "Locale storico con clientela fissa. Il cuoco resta in azienda.":
      "Une adresse ancienne avec une clientèle fidèle. Le cuisinier reste.",
    "Autolavaggio in franchising": "Une franchise de stations de lavage",
    "Tre impianti automatici su strade ad alto traffico.":
      "Trois sites automatiques sur des axes très passants.",
    "Sale giochi e biliardi": "Salles de jeux et billards",
    "Macchine già installate in dieci locali. Contratti pluriennali firmati.":
      "Des machines déjà installées dans dix établissements. Contrats pluriannuels signés.",
    "Deposito self-storage": "Centre de self-stockage",
    "Occupazione stabile all'88%. Gestione quasi interamente automatizzata.":
      "Taux d'occupation stable à 88 %. Gestion presque entièrement automatisée.",
    "Piattaforma software B2B": "Une plateforme logicielle B2B",
    "Ricavi ricorrenti da 60 aziende clienti. Richiede un direttore tecnico.":
      "Des revenus récurrents venus de 60 entreprises clientes. Il faut un directeur technique.",
    "Catena di lavanderie": "Une chaîne de laveries",
    "Sei punti vendita in città, tutti con contratti di locazione lunghi.":
      "Six points de vente en ville, tous sous baux longs.",
    "Impianto fotovoltaico in affitto": "Une centrale photovoltaïque en location",
    "Incentivo ventennale già assegnato. Manutenzione a carico del gestore.":
      "Un tarif garanti sur vingt ans déjà attribué. L'entretien est à la charge de l'exploitant.",
    "Franchising di caffetterie": "Une franchise de cafés",
    "Tre locali già aperti, marchio riconosciuto a livello nazionale.":
      "Trois établissements déjà ouverts, sous une enseigne connue dans tout le pays.",
    "Cliniche veterinarie": "Cliniques vétérinaires",
    "Due ambulatori con veterinari dipendenti già assunti.":
      "Deux cabinets avec des vétérinaires salariés déjà en poste.",
    "Capannone logistico affittato": "Un entrepôt logistique loué",
    "Contratto di locazione decennale con un corriere nazionale.":
      "Un bail de dix ans avec un transporteur national.",
    "Causa legale da un inquilino": "Un locataire vous attaque en justice",
    "Un inquilino fa causa per un infortunio nelle parti comuni. Transazione immediata.":
      "Un locataire porte plainte pour un accident dans les parties communes. Transaction immédiate.",

    // ── Le marché ──
    "Cercasi casa 2 locali": "Recherchée : maison deux-pièces",
    "Una giovane coppia cerca la prima casa. Chiunque possieda una casa 2 locali può vendere a questo prezzo.":
      "Un jeune couple cherche son premier logement. Quiconque possède une maison deux-pièces peut vendre à ce prix.",
    "Investitore compra case piccole": "Un investisseur achète les petites maisons",
    "Offerta rapida in contanti, ma sotto le aspettative del mercato.":
      "Une offre rapide et comptant, mais en dessous de ce que donnerait le marché.",
    "Famiglia cerca casa 3 locali": "Une famille cherche une maison trois-pièces",
    "Trasferimento di lavoro: devono comprare entro il mese.":
      "Une mutation professionnelle : ils doivent acheter dans le mois.",
    "Cercasi casa 4 locali": "Recherchée : maison quatre-pièces",
    "Il quartiere è diventato di moda e i prezzi sono saliti.":
      "Le quartier est devenu à la mode et les prix ont suivi.",
    "Compratore per bifamiliari": "Un acheteur pour les maisons de deux logements",
    "Un piccolo fondo immobiliare sta rastrellando bifamiliari in città.":
      "Un petit fonds immobilier rachète les maisons de deux logements dans toute la ville.",
    "Compratore per quadrifamiliari": "Un acheteur pour les immeubles de quatre logements",
    "Offre il 140% del costo di acquisto per ogni quadrifamiliare posseduta.":
      "Il offre 140 % du coût d'achat pour chaque immeuble de quatre logements que vous possédez.",
    "Fondo compra palazzine": "Un fonds achète des immeubles",
    "Offre il 135% del costo per ogni palazzina da 8 unità.":
      "Il offre 135 % du coût pour chaque immeuble de huit logements.",
    "Gruppo internazionale cerca condomini": "Un groupe international cherche des immeubles",
    "Offre il 130% del costo per ogni condominio posseduto.":
      "Il offre 130 % du coût pour chaque immeuble que vous possédez.",
    "Il comune riclassifica i terreni": "La commune reclasse les terrains",
    "Il piano regolatore cambia: i terreni agricoli diventano edificabili.":
      "Le plan d'urbanisme change : les terres agricoles deviennent constructibles.",
    "Cercasi terreno per un centro commerciale": "Recherché : un terrain pour un centre commercial",
    "Una catena di distribuzione cerca lotti fuori città.":
      "Une enseigne de la grande distribution cherche des terrains hors de la ville.",
    "Un concorrente vuole comprarti": "Un concurrent veut vous racheter",
    "Offre il 150% del costo per una qualsiasi delle tue attività.":
      "Il offre 150 % du coût pour n'importe laquelle de vos activités.",
    "Fondo di private equity": "Un fonds de capital-investissement",
    "Offerta di uscita al 125% del costo per una tua attività.":
      "Une offre de sortie à 125 % du coût pour une de vos activités.",
    "FARMIA vola in borsa": "FARMIA s'envole en bourse",
    "Approvato un nuovo farmaco: il titolo tocca il massimo di fascia. Tutti possono vendere a $30.":
      "Un nouveau médicament est approuvé : le titre touche le haut de sa fourchette. Tout le monde peut vendre à 30 $.",
    "FARMIA crolla": "FARMIA s'effondre",
    "Effetti collaterali inattesi: il titolo scivola al minimo di fascia.":
      "Des effets secondaires inattendus : le titre glisse au bas de sa fourchette.",
    "VOLTIA: offerta pubblica d'acquisto": "VOLTIA : offre publique d'achat",
    "Un colosso lancia un'OPA. Tutti possono vendere a $40.":
      "Un géant lance une OPA. Tout le monde peut vendre à 40 $.",
    "VOLTIA delude le attese": "VOLTIA déçoit les attentes",
    "Trimestrale sotto le stime, il titolo torna ai minimi.":
      "Résultats trimestriels sous les estimations : le titre retombe au plus bas.",
    "ENERGA acquisita": "ENERGA est rachetée",
    "Fusione nel settore energetico. Tutti possono vendere a $40.":
      "Fusion dans le secteur de l'énergie. Tout le monde peut vendre à 40 $.",
    "ALTURA ai massimi": "ALTURA au plus haut",
    "Il mercato azionario corre e il fondo con lui.":
      "Le marché actions s'envole et le fonds avec lui.",
    "DIMORA si rivaluta": "DIMORA se revalorise",
    "Boom degli affitti: il fondo immobiliare tocca il massimo di fascia.":
      "Envolée des loyers : le fonds immobilier touche le haut de sa fourchette.",
    "Aumento dell'imposta sugli immobili": "Hausse de la taxe foncière",
    "Ogni giocatore paga $300 per ciascun immobile residenziale posseduto.":
      "Chaque joueur paie 300 $ pour chaque bien résidentiel qu'il possède.",
    "Boom dei consumi": "Envolée de la consommation",
    "Ogni giocatore incassa $500 per ciascuna attività posseduta.":
      "Chaque joueur encaisse 500 $ pour chaque activité qu'il possède.",
    "Nuova linea metropolitana": "Une nouvelle ligne de métro",
    "Il quartiere si rivaluta. Nessun effetto immediato, ma i prossimi compratori pagheranno di più.":
      "Le quartier prend de la valeur. Rien ne change aujourd'hui, mais les prochains acheteurs paieront plus cher.",

    // ── Les dépenses de tous les jours ──
    "Nuovo telefono di ultima generazione": "Le tout dernier téléphone",
    "Il vecchio funzionava ancora benissimo.":
      "L'ancien marchait encore très bien.",
    "Weekend last minute": "Un week-end de dernière minute",
    "L'offerta scadeva tra due ore. Almeno così ti hanno detto.":
      "L'offre expirait dans deux heures. C'est du moins ce qu'on vous a dit.",
    "Multa e ritiro dei punti": "Une amende et un retrait de points",
    "Autovelox in un tratto che conoscevi benissimo.":
      "Un radar sur une portion que vous connaissiez par cœur.",
    "Il cane dal veterinario": "Le chien chez le vétérinaire",
    "Ha mangiato qualcosa che non doveva. Di nuovo.":
      "Il a mangé quelque chose qu'il ne devait pas. Encore.",
    "Lavatrice da sostituire": "Le lave-linge est à remplacer",
    "Si è rotta con il bucato dentro.":
      "Il est tombé en panne avec le linge dedans.",
    "Cena importante e regalo": "Un dîner important et un cadeau",
    "Anniversario dimenticato, recupero costoso.":
      "Un anniversaire oublié, rattrapé à prix fort.",
    "Bicicletta elettrica": "Un vélo électrique",
    "La userai tutti i giorni. Promesso.":
      "Vous l'utiliserez tous les jours. Promis.",
    "Gomme nuove per l'auto": "Des pneus neufs pour la voiture",
    "Il gommista è stato chiaro: non si rimanda.":
      "Le garagiste a été clair : cela ne se reporte pas.",
    "Attrezzatura da palestra in casa": "Du matériel de sport à la maison",
    "Diventerà un appendiabiti entro marzo.":
      "Ce sera un porte-manteau d'ici mars.",
    "Impianto audio": "Une chaîne hi-fi",
    "Il negoziante è stato molto convincente.":
      "Le vendeur a été très convaincant.",
    "Vacanza in famiglia": "Des vacances en famille",
    "Prenotata prima di guardare il conto corrente.":
      "Réservées avant d'avoir regardé le compte en banque.",
    "Televisore nuovo": "Une télévision neuve",
    "Quello vecchio aveva solo cinque anni.":
      "L'ancienne n'avait que cinq ans.",
    "Riparazione dell'auto": "Réparation de la voiture",
    "Frizione andata. Nessun preavviso.":
      "Embrayage mort. Sans prévenir.",
    "Dentista": "Le dentiste",
    "Una carie che sembrava innocua.":
      "Une carie qui semblait sans gravité.",
    "Scarpe e vestiti per i figli": "Chaussures et vêtements pour les enfants",
    "Crescono più in fretta del previsto. $200 per ogni figlio.":
      "Ils grandissent plus vite que prévu. 200 $ par enfant.",
    "Campo estivo dei figli": "La colonie de vacances des enfants",
    "Due settimane di serenità, a caro prezzo. $350 per ogni figlio.":
      "Deux semaines de tranquillité, chèrement payées. 350 $ par enfant.",
    "Festa di compleanno dei figli": "L'anniversaire des enfants",
    "Animatore, torta e venti invitati. $250 per ogni figlio.":
      "Un animateur, un gâteau et vingt invités. 250 $ par enfant.",
    "Abbonamenti in streaming dimenticati": "Des abonnements en streaming oubliés",
    "Sette servizi attivi, due davvero usati.":
      "Sept services actifs, deux réellement regardés.",
    "Regalo di matrimonio": "Un cadeau de mariage",
    "Lista nozze in un negozio molto costoso.":
      "La liste est déposée dans une boutique très chère.",
    "Corso online mai finito": "Un cours en ligne jamais terminé",
    "Sei arrivato alla lezione due.":
      "Vous en êtes à la leçon deux.",
    "Console e videogiochi": "Une console et des jeux vidéo",
    "Per i figli, ovviamente.":
      "Pour les enfants, bien sûr.",
    "Idraulico d'urgenza": "Plombier en urgence",
    "Domenica sera, tariffa maggiorata.":
      "Dimanche soir, au tarif majoré.",
    "Occhiali nuovi": "Des lunettes neuves",
    "Montatura firmata, lenti progressive.":
      "Monture de marque, verres progressifs.",
    "Barca usata": "Un bateau d'occasion",
    "I due giorni più belli della vita di un armatore: quando la compra e quando la rivende.":
      "Les deux plus beaux jours de la vie d'un propriétaire de bateau : le jour où il l'achète et le jour où il le revend.",

    // ── Les affaires du Large ──
    "Piantagione di caffè in Brasile": "Une plantation de café au Brésil",
    "600 ettari già produttivi, con contratti di fornitura pluriennali.":
      "600 hectares déjà en production, sous contrats d'approvisionnement pluriannuels.",
    "Compagnia di navigazione": "Une compagnie maritime",
    "Quattro navi cargo su rotte asiatiche consolidate.":
      "Quatre cargos sur des routes asiatiques bien établies.",
    "Centro commerciale": "Un centre commercial",
    "Quaranta negozi, occupazione al 95%, gestione esternalizzata.":
      "Quarante boutiques, 95 % d'occupation, gestion externalisée.",
    "Miniera d'oro": "Une mine d'or",
    "Giacimento certificato, concessione ventennale.":
      "Un gisement certifié et une concession de vingt ans.",
    "Catena di alberghi": "Une chaîne d'hôtels",
    "Otto strutture in località turistiche di primo livello.":
      "Huit établissements dans des destinations touristiques de premier plan.",
    "Squadra sportiva professionistica": "Un club sportif professionnel",
    "Diritti televisivi e merchandising inclusi nell'operazione.":
      "Droits télévisés et produits dérivés compris dans l'opération.",
    "Rete di data center": "Un réseau de centres de données",
    "Tre poli in Europa affittati a operatori cloud.":
      "Trois sites en Europe loués à des opérateurs cloud.",
    "Studio cinematografico": "Un studio de cinéma",
    "Catalogo di 90 titoli con ricavi ricorrenti da licenze.":
      "Un catalogue de 90 titres avec des revenus récurrents de licences.",
    "Parco eolico": "Un parc éolien",
    "Quaranta turbine con incentivi garantiti per vent'anni.":
      "Quarante éoliennes avec des tarifs garantis pendant vingt ans.",
    "Compagnia aerea regionale": "Une compagnie aérienne régionale",
    "Dodici aeromobili e slot aeroportuali di valore.":
      "Douze appareils et des créneaux aéroportuaires de valeur.",
    "Rete di cliniche private": "Un réseau de cliniques privées",
    "Sei poliambulatori con convenzioni assicurative.":
      "Six centres de consultation conventionnés avec les assurances.",
    "Fondo immobiliare urbano": "Un fonds immobilier urbain",
    "Portafoglio di 200 appartamenti in tre capitali europee.":
      "Un portefeuille de 200 appartements dans trois capitales européennes.",
    "Catena di ristoranti": "Une chaîne de restaurants",
    "Quindici locali con format collaudato e cucina centralizzata.":
      "Quinze établissements, format éprouvé et cuisine centralisée.",
    "Società di software gestionale": "Un éditeur de logiciels de gestion",
    "Abbonamenti annuali da 400 aziende clienti.":
      "Des abonnements annuels souscrits par 400 entreprises.",
    "Porto turistico": "Un port de plaisance",
    "300 posti barca con lista d'attesa.":
      "300 anneaux, avec une liste d'attente.",
    "Rete di torri per telecomunicazioni": "Un réseau de pylônes de télécommunications",
    "Affittate a tre operatori con contratti ventennali.":
      "Loués à trois opérateurs sous contrats de vingt ans.",
    "Fabbrica di batterie": "Une usine de batteries",
    "Impianto automatizzato con ordini già in portafoglio.":
      "Une usine automatisée avec des commandes déjà au carnet.",
    "Catena di palestre": "Une chaîne de salles de sport",
    "Venti club urbani in abbonamento mensile.":
      "Vingt clubs urbains en abonnement mensuel.",
    "Vigneto e cantina": "Un vignoble et sa cave",
    "Etichetta premiata, export in trenta paesi.":
      "Une étiquette primée, exportée dans trente pays.",
    "Piattaforma logistica dell'ultimo miglio": "Une plateforme logistique du dernier kilomètre",
    "Magazzini automatizzati in sei città.":
      "Des entrepôts automatisés dans six villes.",
  },
};
