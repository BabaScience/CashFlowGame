import { eur, pct, esempioRata, esempioZone } from "../esempi.js";
import { CREDITO } from "../../game/mercati/roma/fonti.js";
import { QUOTA_COSTI_L1 } from "../../game/mercati/roma/derivazione.js";

/**
 * Leçons et questions, en français.
 *
 * Même forme que l'original italien — un titre, un résumé, et un `corpo()`
 * qui est une fonction — parce que les exemples se calculent à partir des
 * données du marché et doivent continuer à se calculer une fois traduits.
 * Une leçon citant un « 1 000 € » écrit à la main mentirait dès la
 * première mise à jour des prix.
 *
 * Les montants restent en euros, au format romain : un marché reste son
 * marché, quelle que soit la langue dans laquelle on le lit.
 *
 * Les règles fiscales décrites sont italiennes, et le texte le dit : le
 * jeu se passe à Rome. Les traduire en équivalents français serait
 * inventer un pays qui n'est pas celui du plateau.
 */
export default {
  avvertenza:
    "Ceci est du matériel pédagogique : il explique comment les choses " +
    "fonctionnent. Ce n'est pas un conseil financier et il ne suggère pas " +
    "quoi acheter ou vendre.",

  lezioni: {
    rendita: {
      titolo: "Ce qu'est vraiment une rente",
      sommario: "La différence entre gagner et posséder quelque chose qui gagne.",
      corpo: () => [
        "Un salaire s'arrête quand vous vous arrêtez. Une rente non : elle continue " +
        "d'arriver même les mois où vous ne faites rien, parce que ce qui la produit est " +
        "une chose que vous possédez, pas votre temps.",
        "Toute la question du jeu est là, et c'est une question comptable avant d'être " +
        "philosophique : quelle part de vos dépenses est couverte par de l'argent qui ne " +
        "dépend pas de votre travail ? Si la réponse est « la totalité », travailler " +
        "devient un choix.",
        "Ne confondez pas rente et plus-value. Vendre un logement avec bénéfice, c'est un " +
        "encaissement unique ; le louer, c'est une rente. Le jeu ne mesure que la seconde, " +
        "parce que c'est elle qui change la vie de quelqu'un.",
      ],
    },

    "attivo-passivo": {
      titolo: "Actif et passif, pour de vrai",
      sommario: "Ce n'est pas ce que vous possédez qui compte, c'est le sens dans lequel l'argent va.",
      corpo: () => [
        "La distinction utile n'est pas entre les belles choses et les moches, mais entre " +
        "les choses qui vous mettent de l'argent en poche chaque mois et celles qui vous " +
        "en retirent.",
        "Le logement où vous habitez, selon cette définition, n'est pas un actif : vous " +
        "payez la mensualité, les charges, l'entretien et les impôts, et vous n'encaissez " +
        "rien. Cela ne veut pas dire que l'acheter était une erreur — cela veut dire que " +
        "dans le compte de résultat il est à gauche, parmi les sorties.",
        "Le même logement, loué à quelqu'un d'autre, peut être un actif, ou pas. Cela " +
        "dépend d'un calcul, pas d'une étiquette : loyer moins mensualité, moins impôts, " +
        "moins charges, moins les mois où il reste vide. Dans le jeu ce calcul est déjà " +
        "fait et s'appelle le flux.",
      ],
    },

    rata: {
      titolo: "De quoi est faite une mensualité de prêt",
      sommario: "Pourquoi les premières années semblent à peine entamer la dette.",
      corpo: () => {
        const e = esempioRata();
        return [
          "Une mensualité est faite de deux morceaux : l'un rembourse le capital, l'autre " +
          "paie les intérêts. Dans un prêt amortissable classique la mensualité reste la " +
          "même, mais la proportion change : au début presque tout est intérêts, à la fin " +
          "presque tout est capital.",
          `Avec les chiffres d'aujourd'hui : ${eur(e.capitale)} à ${pct(CREDITO.taeg)} sur ` +
          `${CREDITO.anni} ans font une mensualité d'environ ${eur(e.rata)}.`,
          `Au bout du compte vous aurez versé ${eur(e.totale)}, dont ${eur(e.interessi)} ` +
          "d'intérêts seuls. C'est pourquoi un dixième de point sur le taux, sur vingt " +
          "ans, n'est pas un détail.",
          "La conséquence pratique : les premières années, la dette baisse très lentement. " +
          "Qui revend au bout de cinq ans découvre qu'il doit à la banque presque autant " +
          "qu'au départ.",
        ];
      },
    },

    "lordo-netto": {
      titolo: "Rendement brut et rendement net",
      sommario: "Pourquoi un 7 % annoncé devient un 4 % encaissé.",
      corpo: () => [
        "Le rendement brut est le calcul le plus simple : loyer annuel divisé par le prix. " +
        "C'est aussi celui qu'on trouve écrit partout, parce que c'est le plus élevé.",
        "Entre ce chiffre et ce qui arrive sur le compte il y a au moins cinq postes : " +
        "l'impôt sur le loyer, l'impôt sur le bien, les charges de copropriété et " +
        "l'entretien, les mois où le logement reste vide, et les locataires qui ne paient " +
        "pas.",
        `Dans le jeu, au premier niveau, tous ces postes sont réunis en un prélèvement ` +
        `unique de ${pct(QUOTA_COSTI_L1)} sur le loyer. C'est une simplification ` +
        "assumée : on apprend d'abord qu'un loyer n'est pas tout à vous, on apprend " +
        "ensuite pourquoi.",
        "La seule règle à retenir : quand quelqu'un vous annonce un rendement, la première " +
        "question est de savoir s'il est brut ou net. Il est presque toujours brut.",
      ],
    },

    cedolare: {
      titolo: "L'impôt forfaitaire italien sur les loyers : 21 % ou 10 %",
      sommario: "Ce que c'est, et ce que change un loyer encadré.",
      corpo: () => [
        "En Italie, qui loue un bien peut choisir de payer un impôt forfaitaire sur le " +
        "loyer au lieu de l'ajouter à ses autres revenus. Cela s'appelle *cedolare secca* " +
        "et le taux ordinaire est de 21 %.",
        "Il existe cependant un taux réduit à 10 % pour les contrats à loyer encadré " +
        "(*canone concordato*) : vous louez en suivant les paramètres fixés par les " +
        "accords locaux de la commune, qui sont normalement sous le prix libre du marché, " +
        "et en échange vous payez la moitié des impôts.",
        "C'est un échange, pas un cadeau : on encaisse moins de loyer et on paie moins " +
        "d'impôts. Laquelle des deux voies laisse le plus d'argent en poche dépend des " +
        "chiffres de ce contrat et de cette commune — c'est un calcul, et il est à refaire " +
        "à chaque fois.",
        "Qui choisit le forfait renonce aussi à indexer le loyer sur l'inflation pendant " +
        "toute la durée du contrat. Cela vaut la peine de le savoir avant, pas après.",
      ],
    },

    "costi-acquisto": {
      titolo: "Ce que coûte l'achat, en plus du prix",
      sommario: "L'argent qui ne revient jamais.",
      corpo: () => [
        "Le prix d'un bien n'est pas ce qu'il faut pour l'acheter. Par-dessus il y a les " +
        "droits d'enregistrement, le notaire et, presque toujours, la commission de " +
        "l'agence.",
        "Les droits d'enregistrement sont de 2 % de la valeur cadastrale pour une " +
        "résidence principale et de 9 % pour les autres. La valeur cadastrale est " +
        "normalement bien inférieure au prix payé, donc le pourcentage effraie moins qu'il " +
        "n'y paraît — mais sur un second bien il reste le poste le plus lourd.",
        "Cet argent ne revient pas. Il ne devient pas une part de la valeur du bien : " +
        "revendez le lendemain au même prix et vous l'avez perdu. C'est la raison pour " +
        "laquelle acheter et revendre vite est rarement rentable.",
        "Dans le jeu, tout cela est compris dans l'apport de chaque carte immobilière, et " +
        "c'est pourquoi l'apport est plus élevé que la simple différence entre le prix et " +
        "le prêt.",
      ],
    },

    leva: {
      titolo: "Le levier fonctionne dans les deux sens",
      sommario: "Pourquoi s'endetter multiplie les gains et les pertes de la même façon.",
      corpo: () => [
        "Acheter avec un prêt, c'est contrôler une grande chose en mettant une petite " +
        "somme. Si cette chose rapporte plus que la dette ne coûte, la différence est pour " +
        "vous, et rapportée au capital que vous avez mis elle devient un pourcentage " +
        "élevé.",
        "Le même mécanisme, retourné : si elle rapporte moins que la dette ne coûte, c'est " +
        "vous qui mettez la différence, chaque mois, et rapportée au capital engagé elle " +
        "devient un pourcentage tout aussi élevé, avec un moins devant.",
        "Il n'y a rien de magique ni de louche dans le levier : c'est de l'arithmétique. " +
        "Il amplifie ce qui est là. Sur une affaire qui marche il la rend excellente ; sur " +
        "une qui ne marche pas, il en fait un problème mensuel qui dure vingt ans.",
        "Le signal à regarder n'est pas le rendement, c'est la marge entre le rendement et " +
        "le coût de la dette. Quand cette marge est mince, le levier cesse d'être un outil " +
        "et devient un pari sur le fait que rien n'ira de travers.",
      ],
    },

    "centro-periferia": {
      titolo: "Pourquoi le centre rapporte moins que la périphérie",
      sommario: "Le calcul que presque personne ne fait avant de tomber amoureux d'une adresse.",
      corpo: () => {
        const e = esempioZone();
        return [
          "Les loyers montent à mesure qu'on approche du centre. Les prix d'achat montent " +
          "bien davantage. Comme le rendement est le rapport entre les deux, le rendement " +
          "baisse.",
          `Avec les valeurs de Rome : ${e.centro.nome} tourne autour de ` +
          `${eur(e.centro.euroMq)} le mètre carré avec des loyers de ${e.centro.canoneMq} €, ` +
          `soit un brut de ${pct(e.resaCentro)}. ${e.periferia.nome} est à ` +
          `${eur(e.periferia.euroMq)} le mètre avec des loyers de ${e.periferia.canoneMq} € : ` +
          `un brut de ${pct(e.resaPeriferia)}.`,
          "Près du triple, pour la même opération. Et l'écart subsiste même en retirant " +
          "impôts et charges, qui pèsent à peu près pareil des deux côtés.",
          "Cela ne veut pas dire qu'acheter dans le centre soit une erreur : ceux qui le " +
          "font parient souvent sur la prise de valeur, sur la facilité de revente ou sur " +
          "l'usage personnel, qui sont des raisons différentes du rendement. Cela veut " +
          "dire que ce sont deux opérations différentes, et que les confondre coûte cher.",
        ];
      },
    },

    "che-cose-un-etf": {
      titolo: "Ce qu'est un fonds, et ce qu'est un ETF",
      sommario: "Le mécanisme, en mots simples. Aucun nom, aucun conseil.",
      corpo: () => [
        "Un fonds commun est un contenant : beaucoup de gens y mettent de l'argent, " +
        "quelqu'un l'investit en suivant une règle annoncée, et chacun possède une part du " +
        "contenant proportionnelle à ce qu'il a mis.",
        "Un ETF est un fonds avec deux caractéristiques de plus. La première : il s'achète " +
        "et se vend en bourse comme une action, en cours de journée. La seconde : il ne " +
        "cherche normalement pas à battre le marché, il se contente de répliquer un " +
        "indice, c'est-à-dire une liste prédéfinie de titres avec des poids.",
        "De là découle la différence qu'on entend citer le plus souvent : répliquer une " +
        "liste coûte moins cher que payer quelqu'un pour choisir, donc les frais de " +
        "gestion sont en général plus bas. Les frais comptent parce qu'on les paie chaque " +
        "année, y compris les années où la valeur baisse.",
        "Deux choses qu'un ETF n'est pas. Ce n'est pas une garantie : il réplique l'indice " +
        "aussi quand l'indice perd. Et ce n'est pas une chose unique : il existe des ETF " +
        "sur n'importe quoi, avec des risques très différents, et « c'est un ETF » ne dit " +
        "presque rien sur ce qu'il y a dedans.",
        "On s'arrête ici, et ce n'est pas un choix : dire lequel acheter serait du conseil " +
        "en investissement, ce qui en Italie exige une inscription à un ordre.",
      ],
    },

    "conto-economico": {
      titolo: "Lire son propre compte de résultat",
      sommario: "Quatre lignes qui disent presque tout.",
      corpo: () => [
        "Revenus du travail. Revenus de ce qu'on possède. Dépenses. La différence. Quatre " +
        "chiffres, et presque personne ne les a écrits quelque part.",
        "La quatrième ligne dit si ce mois vous a fait avancer ou reculer. Les trois " +
        "premières disent pourquoi, et surtout quel levier vous pouvez actionner : gagner " +
        "plus par le travail, bâtir de la rente, ou dépenser moins.",
        "Ce qui n'est pas évident, c'est que les trois leviers ne se valent pas. Gagner " +
        "plus par le travail s'accompagne souvent de dépenses plus élevées — logement plus " +
        "grand, voiture neuve — et le solde bouge moins qu'on ne s'y attend. Le jeu le " +
        "montre tout de suite : la fiche au revenu le plus élevé n'est pas celle qui sort " +
        "la première.",
        "C'est aussi pourquoi le jeu vous fait remplir ces lignes à chaque tour au lieu de " +
        "vous montrer seulement le solde.",
      ],
    },

    "banca-presta": {
      titolo: "Pourquoi une banque vous prête (et combien)",
      sommario: "La règle du tiers, et pourquoi personne ne donne un demi-million sur parole.",
      corpo: () => [
        "Une banque ne prête pas en regardant ce dont vous avez besoin : elle regarde ce " +
        "que vous pouvez rembourser. La mesure qu'elle utilise presque toujours est le " +
        "rapport entre la mensualité et le revenu net mensuel, et le seuil courant en " +
        "Italie se situe entre 30 et 35 pour cent. Un tiers, en pratique.",
        "Le calcul se fait sur TOUTES les mensualités ensemble, pas seulement la nouvelle : " +
        "si vous remboursez déjà une voiture et des études, cette place est prise. C'est " +
        "pourquoi deux personnes au même salaire obtiennent des montants différents.",
        "Le loyer n'entre en général pas dans ce calcul — ce n'est pas une dette et il " +
        "n'apparaît pas dans les fichiers de crédit — mais la banque le voit quand même, " +
        "parce qu'il réduit ce qui vous reste.",
        "Puis il y a le type de crédit. Un prêt immobilier est garanti par le logement, " +
        "donc il coûte peu (autour de 4 % par an) et va jusqu'à 80 % de la valeur du bien. " +
        "Un prêt personnel n'est garanti par rien, coûte deux ou trois fois plus, et les " +
        "organismes s'arrêtent entre 30 000 et 60 000 euros. Un découvert coûte encore " +
        "davantage.",
        "Dans le jeu, cela marche exactement ainsi : demandez plus que votre revenu ne " +
        "supporte et la banque dit non, en expliquant pourquoi. Ce n'est pas un obstacle " +
        "posé là pour vous ralentir : c'est ce qui vous arrivera vraiment au guichet.",
      ],
    },

    "vendere-costa": {
      titolo: "Ce que coûte la vente d'un logement",
      sommario: "L'agence, la plus-value, et la règle des cinq ans.",
      corpo: () => [
        "Acheter coûte plus que le prix — droits d'enregistrement, notaire, agence — et " +
        "presque tout le monde le sait. Que VENDRE coûte aussi, on le découvre en général " +
        "la première fois qu'on vend.",
        "Deux postes. La commission de l'agence, normalement autour de 3 % plus TVA, est " +
        "payée par le vendeur également. Et si vous vendez dans les cinq ans suivant " +
        "l'achat, vous payez sur le gain un impôt de substitution de 26 pour cent, que le " +
        "notaire retient à l'acte et verse directement à l'État.",
        "Le gain taxé est la différence entre ce que vous encaissez et ce que vous aviez " +
        "payé. Le prêt n'a rien à voir : ce n'était que la façon dont vous aviez payé " +
        "l'achat.",
        "Après cinq ans cet impôt ne s'applique plus. C'est une règle écrite précisément " +
        "pour distinguer celui qui investit de celui qui spécule, et elle change les " +
        "comptes brutalement : la même transaction peut rapporter 29 % si vous la bouclez " +
        "tout de suite et plus de 50 % si vous attendez. La résidence principale où vous " +
        "avez vraiment habité est exonérée de toute façon.",
        "Dans le jeu c'est exactement cela, et cela se voit dans le journal : chaque vente " +
        "énumère le prêt soldé, l'agence et l'impôt, avant de vous dire ce qu'il vous " +
        "reste en main.",
      ],
    },

    margine: {
      titolo: "Pourquoi l'équilibre ne suffit pas",
      sommario: "Sortir de la Roue à l'équilibre, c'est y rentrer au premier imprévu.",
      corpo: () => [
        "Le calcul évident est : quand les rentes couvrent les dépenses, le travail devient " +
        "facultatif. C'est vrai en arithmétique et faux dans la vie.",
        "Les rentes ne sont pas immobiles. Un locataire s'en va et le logement reste vide " +
        "deux mois ; une chaudière casse ; une activité fait une mauvaise année ; la " +
        "copropriété vote des travaux. Pendant ce temps les dépenses bougent aussi — et " +
        "presque toujours vers le haut.",
        "Qui quitte son travail le mois exact où les comptes se touchent est à un imprévu " +
        "de devoir en rechercher un. C'est pourquoi le marché de Rome demande une fois et " +
        "demie les dépenses et non l'équilibre : cette marge n'est pas une prudence " +
        "excessive, c'est le prix de pouvoir dire non.",
        "C'est aussi pourquoi emprunter pour sortir plus tôt fonctionne rarement. Chaque " +
        "euro de mensualité augmente vos dépenses, et donc relève l'objectif d'une fois et " +
        "demie. La dette raccourcit le chemin seulement si ce que vous achetez rapporte " +
        "bien plus qu'elle ne coûte — et dans la réalité cet écart est mince, pas énorme.",
      ],
    },

    "ral-netto": {
      titolo: "Brut annuel, brut, net : trois chiffres différents",
      sommario: "Pourquoi le salaire dont on parle n'est pas celui qui arrive.",
      corpo: () => [
        "Quand quelqu'un dit « je gagne 35 000 euros », il pense presque toujours au brut " +
        "annuel : ce que coûte son contrat avant tout prélèvement. Ce n'est pas ce qui " +
        "vous arrive.",
        "Du brut on retire les cotisations sociales (environ 9-10 % à la charge du " +
        "salarié) puis l'impôt sur le revenu, qui est par tranches : plus vous gagnez, " +
        "plus le taux sur la tranche haute est élevé, et plus l'écart entre brut et net se " +
        "creuse.",
        "Dans le jeu les fiches sont déjà NETTES, parce que c'est ce qui se dépense. Pour " +
        "la même raison la ligne « Impôts » reste à zéro sur le salaire : vous les avez " +
        "déjà payés. Elle apparaît en revanche quand vous commencez à encaisser des " +
        "loyers, parce que c'est un revenu nouveau, et un revenu nouveau se taxe à " +
        "nouveau.",
        "Les fiches de Rome sont celles d'une personne seule : son salaire et ses " +
        "dépenses. C'est pourquoi le loyer est celui d'un studio ou d'une chambre " +
        "partagée, et non celui d'un logement familial. Comparer les dépenses d'une " +
        "famille au salaire d'une personne donnerait une image fausse, et pendant un temps " +
        "ce jeu l'a fait.",
      ],
    },

    "dopo-la-liberta": {
      titolo: "Ce qui se passe le lendemain",
      sommario: "Arrêter de travailler n'est pas une ligne d'arrivée : c'est un changement de revenu.",
      corpo: () => [
        "Dans l'imaginaire, atteindre l'indépendance financière est une ligne que l'on " +
        "franchit : avant d'un côté, après de l'autre. Dans les comptes cela ne marche pas " +
        "ainsi. Le lendemain, vous avez exactement les mêmes logements, les mêmes " +
        "activités, les mêmes dettes et les mêmes dépenses que la veille. La seule ligne " +
        "qui change est le salaire, qui tombe à zéro.",
        "C'est pour cela que la marge compte. Tant que vous travaillez, un mois vide ou " +
        "une chaudière cassée sont absorbés par la fiche de paie. Ensuite, ils sont " +
        "absorbés par ce que vous possédez — et si cela couvrait les dépenses et rien de " +
        "plus, il n'y a rien pour les absorber.",
        "La façon dont une banque vous regarde change aussi. Le revenu à prouver n'est " +
        "plus la fiche de paie mais la rente, et les règles restent les mêmes : la " +
        "mensualité ne peut pas dépasser un tiers de ce qui rentre. Qui a cessé de " +
        "travailler n'a pas cessé d'être évalué.",
        "Dans le jeu c'est pareil : sortir de la Roue ne donne rien et n'efface rien. " +
        "L'écran final montre ce que vos choses produisent vraiment, moins ce qu'il vous " +
        "coûte de vivre — et en combien de mois vous y êtes arrivé.",
      ],
    },
  },

  /* LES QUESTIONS.
     Même règle que les leçons : on apprend à faire un CALCUL, jamais à
     acheter quelque chose. Les identifiants des options (a, b, c) ne
     bougent pas — `giusta` en désigne un, et une traduction qui les
     renommerait changerait la bonne réponse. */
  quesiti: {
    q1: {
      titolo: "Deux deux-pièces",
      domanda:
        "Deux appartements, même loyer de 700 € par mois. Le premier coûte 140.000 €, " +
        "le second 210.000 €. Lequel a le rendement brut le plus élevé ?",
      opzioni: {
        a: "Celui à 140.000 €",
        b: "Celui à 210.000 €",
        c: "Pareil : le loyer est le même",
      },
      spiegazione:
        "Le rendement, c'est le loyer annuel divisé par le prix. 8.400 € sur " +
        "140.000 € font 6,0 % ; les mêmes 8.400 € sur 210.000 € font 4,0 %. À loyer " +
        "égal, celui qui paie moins rend plus — c'est pour cela que le prix d'achat " +
        "compte autant que le loyer.",
    },
    q2: {
      titolo: "Le loyer n'est pas le flux",
      domanda:
        "Un appartement rapporte 900 € de loyer par mois. La mensualité du prêt est " +
        "de 620 €, et les impôts et les charges mangent 28 % du loyer. Combien " +
        "reste-t-il chaque mois ?",
      opzioni: {
        a: "280 €",
        b: "28 €",
        c: "900 € : la mensualité, c'est le locataire qui la paie",
      },
      spiegazione:
        "900 moins 28 % font 648. Moins la mensualité de 620, il reste 28 € par mois. " +
        "C'est l'erreur la plus courante d'un premier achat : soustraire la mensualité " +
        "du loyer et s'arrêter là, en oubliant les impôts, les charges de copropriété " +
        "et la vacance. La marge réelle était dix fois plus mince que celle imaginée.",
    },
    q3: {
      titolo: "Ce qu'il faut vraiment",
      domanda:
        "Un bien à 180.000 €, prêt à 80 %. En comptant les droits d'enregistrement, " +
        "le notaire et l'agence, combien faut-il avoir en liquide, à peu près ?",
      opzioni: {
        a: "36.000 € : les 20 %, et c'est tout",
        b: "Environ 55.000 €",
        c: "180.000 €",
      },
      spiegazione:
        "Les 20 % font 36.000 €, mais par-dessus viennent les droits d'enregistrement " +
        "sur une résidence secondaire, le notaire et la commission de l'agence : entre " +
        "quinze et vingt mille euros de plus. Cet argent ne revient pas et ne devient " +
        "pas de la valeur du bien. Qui ne calcule que l'apport découvre la différence " +
        "chez le notaire.",
    },
    q4: {
      titolo: "La première année de mensualités",
      /* Calculé, comme l'original italien : le taux et la durée viennent des
         données du marché, la question ne peut donc pas se périmer. */
      domanda: () => {
        const { rata } = esempioRata();
        return `Un prêt de ${eur(160000)} à ${pct(CREDITO.taeg)} sur ` +
          `${CREDITO.anni} ans : la mensualité est d'environ ${eur(rata)}. Après la ` +
          "première année, de combien la dette a-t-elle baissé ?";
      },
      opzioni: {
        a: "D'environ 10.000 €",
        b: "D'environ 4.000 €",
        c: "D'environ 800 €",
      },
      spiegazione: () => {
        const { rata } = esempioRata();
        const versato = rata * 12;
        const interessi = 160000 * CREDITO.taeg;
        return `La première année vous versez environ ${eur(versato)}, mais près de ` +
          `${eur(interessi)} sont des intérêts : la dette ne baisse que d'un peu plus ` +
          `de ${eur(versato - interessi)}. Dans un prêt, la part de capital augmente ` +
          "avec le temps, donc au début on paie surtout pour le privilège d'avoir " +
          "l'argent. C'est pour cela que revendre au bout de quelques années laisse " +
          "presque toute la dette debout.";
      },
    },
    q5: {
      titolo: "Le levier sur une marge mince",
      domanda:
        "Une affaire rapporte 5 % brut par an. La dette qui sert à l'acheter coûte " +
        "4,5 %. Que se passe-t-il si le loyer baisse de 10 % ?",
      opzioni: {
        a: "La marge se réduit un peu, elle reste positive",
        b: "La marge devient négative : vous remettez de l'argent tous les mois",
        c: "Rien ne change : la mensualité est fixe",
      },
      spiegazione:
        "Une baisse de 10 % fait passer le rendement de 5,0 % à 4,5 %, c'est-à-dire " +
        "exactement au coût de la dette — et par-dessus il y a encore les impôts et " +
        "les charges, donc le solde passe sous zéro. Quand la marge entre le rendement " +
        "et le coût de la dette est d'un demi-point, une petite secousse suffit à en " +
        "retourner le signe. Le levier ne crée pas le problème : il le multiplie.",
    },
    q6: {
      titolo: "Loyer encadré ou loyer libre",
      domanda:
        "Loyer libre : 800 € par mois, impôt forfaitaire à 21 %. Loyer encadré : " +
        "680 € par mois, impôt forfaitaire à 10 %. Lequel laisse le plus d'argent " +
        "en poche ?",
      opzioni: {
        a: "Le libre : 632 € contre 612 €",
        b: "L'encadré : toujours, à cause du taux",
        c: "Ils sont identiques",
      },
      spiegazione:
        "800 moins 21 % font 632. 680 moins 10 % font 612. Ici le libre l'emporte de " +
        "vingt euros. Mais il suffit que le loyer encadré de cette commune soit un peu " +
        "plus haut, ou le libre un peu plus bas, et cela s'inverse. La leçon n'est pas " +
        "lequel choisir : c'est qu'il faut le calculer à chaque fois, avec les chiffres " +
        "de ce contrat-là, au lieu de tenir la réponse pour acquise.",
    },
    q7: {
      titolo: "Le logement où vous habitez",
      domanda:
        "Vous achetez le logement où vous allez habiter. Dans le compte de résultat " +
        "de ce jeu, qu'est-ce que c'est ?",
      opzioni: {
        a: "Un actif : il vaut cher et il prend de la valeur",
        b: "Une dépense : chaque mois il sort de l'argent et n'en rapporte pas",
        c: "Ni l'un ni l'autre : c'est neutre",
      },
      spiegazione:
        "Mensualité, charges, entretien et impôts sortent tous les mois ; rien " +
        "n'entre. Selon la définition employée ici — ce qui compte est le sens dans " +
        "lequel l'argent se déplace — c'est une dépense. Ce qui ne veut pas dire que " +
        "l'acheter soit une erreur : cela veut seulement dire savoir dans quelle " +
        "colonne cela se range, et ne pas le compter parmi les choses qui vous " +
        "feront sortir de la Roue.",
    },
    q8: {
      titolo: "Le garage et l'appartement",
      domanda:
        "Un garage à 32.000 € se loue 230 € par mois. Un deux-pièces à 160.000 € se " +
        "loue 800 €. Lequel rapporte le plus en pourcentage ?",
      opzioni: {
        a: "Le deux-pièces",
        b: "Le garage",
        c: "Autant l'un que l'autre",
      },
      spiegazione:
        "Le garage fait 2.760 € par an sur 32.000 €, soit 8,6 %. Le deux-pièces fait " +
        "9.600 € sur 160.000 €, soit 6,0 %. Les garages rendent plus que les " +
        "appartements presque partout, ils n'ont ni locataires à courir après ni " +
        "chaudières qui tombent en panne — et presque personne n'y pense, parce " +
        "qu'ils se racontent mal à table.",
    },
    q9: {
      titolo: "Salaire élevé, sortie lente",
      domanda:
        "Deux joueurs : l'un gagne 5.700 € par mois avec 2.780 € de dépenses, " +
        "l'autre 2.250 € avec 1.240 €. Lequel a besoin de moins de rente pour " +
        "sortir de la Roue ?",
      opzioni: {
        a: "Celui qui gagne 5.700 €",
        b: "Celui qui gagne 2.250 €",
        c: "Il leur faut la même rente",
      },
      spiegazione:
        "Pour sortir, il faut une rente qui couvre les DÉPENSES, pas une rente qui " +
        "égale le salaire. Au premier il faut 2.780 € par mois, au second 1.240 € : " +
        "moins de la moitié. C'est pour cela que dans ce jeu la fiche au revenu le " +
        "plus élevé n'est pas celle qui sort la première — un revenu élevé " +
        "s'accompagne de dépenses élevées, et relève la barre à franchir.",
    },
    q10: {
      titolo: "Rente ou plus-value",
      domanda:
        "Vous achetez un terrain à 22.000 € et le revendez à 50.000 €. Dans le jeu, " +
        "qu'est-ce que cela change à votre rente mensuelle ?",
      opzioni: {
        a: "Elle monte de 28.000 € une fois",
        b: "Rien ne change : la rente reste celle d'avant",
        c: "Elle monte d'environ 230 € par mois",
      },
      spiegazione:
        "Vingt-huit mille euros de plus-value sont un encaissement, pas une rente : " +
        "ils augmentent les liquidités, pas le flux mensuel. Ils servent à acheter " +
        "quelque chose qui produira ensuite une rente, mais à eux seuls ils ne vous " +
        "rapprochent pas d'un centimètre de la sortie. C'est la même distinction " +
        "qu'entre vendre une maison et la louer.",
    },
  },
};
