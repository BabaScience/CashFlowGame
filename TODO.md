# Quota Zero — lavori

Ordine di esecuzione, dall'alto in basso. Ogni voce si chiude solo quando
`npm test` passa e la modifica è verificata nel browser, non solo compilata.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `[-]` rimandato

---

## Fatto prima di questa lista

- [x] **Rinomina e ripulitura** — nome proprio *Quota Zero* isolato in
      `src/marchio.js`, verificato su TMview (classi 9, 28, 41). Rimosso ogni
      riferimento al prodotto altrui: lessico, titoli azionari, rivendicazioni
      di derivazione, citazioni di pagina, prototipo originale.
- [x] **Caso deterministico** (`src/game/caso.js`) — il caso è funzione pura di
      `(seme, passi)`, ricostruibile dopo ogni lettura dal database.
- [x] **Cancello di bilanciamento** (`scripts/bilancia.mjs`) — dimostra che da
      ogni professione si può uscire e vincere. Fallisce la pubblicazione se un
      cambio di dati rende il gioco ingiocabile.
- [x] **Le tre correzioni d'uso** — il tiro visibile a tutti, la propria pedina
      riconoscibile, il tavolo che non scorre più via.

---

## 1 · Completare l'esperienza di gioco

- [x] **1.1 Chat di stanza**
      Dentro il documento della stanza, tetto di 80 messaggi, muore col TTL
      esistente: nessuna infrastruttura nuova, nessun costo. Endpoint separato
      con `$push` + `$slice` + `$inc`, fuori dal motore, altrimenti ogni
      messaggio litiga col controllo di versione delle mosse.
      Serve anche: limite di frequenza per giocatore, e un interruttore per
      spegnerla (obbligatorio per l'uso in classe).

- [x] **1.2 Suoni**
      Dado, carta, incasso, esborso, tocca-a-te, vittoria. Sbloccare il contesto
      audio al primo tocco, interruttore persistente, rispettare
      `prefers-reduced-motion`. Solo campioni CC0, con un file di licenze nel
      repo: un ufficio acquisti scolastico lo chiederà.

- [x] **1.3 Analisi d'uso**
      Oggi non sappiamo rispondere a "la gente torna?", che è la sola domanda
      che conta. Strumento senza cookie e conforme al GDPR. Eventi minimi:
      stanze create, partite finite, ritorno a 1/7/30 giorni, durata del turno,
      punto di abbandono.

## 2 · Un mercato è un pacchetto

- [x] **2.1 Registro dei mercati e pacchetti immutabili**
      `src/game/mercati/<citta>/v<AAAA.MM>.js`. La stanza salva
      `{ mercatoId, versioneDati }` e li rilegge a ogni azione. Un aggiornamento
      pubblica un file nuovo, non ne modifica uno vecchio: la stanza conserva
      indici dentro i mazzi, e cambiare i dati sotto una partita in corso la
      rompe. Le stanze vivono fino a 48 ore, quindi prima o poi capiterebbe.

- [x] **2.2 La valuta esce dal pacchetto**
      `finanze.js` scrive `$` a mano sopra a cifre raggruppate all'italiana.
      Deve prendere simbolo, posizione e lingua dal mercato.

- [x] **2.3 Lingua separata dal mercato**
      Fatta per l'interfaccia: italiano e inglese, lingua rilevata dal
      browser e ricordata, e un test verifica che nessuna chiave manchi e
      che cambiare lingua non tocchi un prezzo. Roma in inglese resta Roma,
      in euro.

- [x] **2.4 Scelta del mercato alla creazione della stanza**
      Prima scelta in `Ingresso.jsx`, prima di professione e sogno: è il mercato
      a decidere quali professioni esistono. Un mercato solo per tavolo.

## 3 · Roma su dati veri

- [x] **3.1 Livelli di realismo** — Livello 1 e **Livello 2** fatti, come
      meccanica e non come dato. Al Livello 2 la trattenuta unica si apre in
      cedolare secca, IMU, condominio, manutenzione e sfitto, ognuna col suo
      nome; compare la scelta fra canone libero al 21% e concordato al 10%,
      e un test verifica che **nessuna delle due vinca sempre** — altrimenti
      non sarebbe una scelta. Lo stesso bilocale a Torpignattara rende
      **+113 € al mese al Livello 1 e −49 € al Livello 2**: è la lezione
      centrale del gioco, resa giocabile. Il cancello verifica ogni livello
      separatamente; entrambi reggono.
      **Trovato per strada:** box e posti auto non portavano un canone e al
      Livello 2 risultavano esenti da imposte. Un box si affitta e l'affitto
      si tassa.

- [ ] **3.1b Livello 3 (esperto)** — IRPEF a scaglioni, plusvalenze,
      regime forfettario per le attività. Serve anche a chiudere un buco
      del Livello 2: le **attività** non sono tassate, perché la
      tassazione d'impresa in Italia è un regime a parte e non si può
      liquidare con un'aliquota unica.

- [x] **3.2 Pacchetto Roma 2026**
      Professioni su fasce ISTAT/JobPricing al netto, immobili su quotazioni
      OMI per zona, credito su Banca d'Italia, fisco reale. Ogni valore porta
      `{ valore, fonte, url, aggiornato }`: è ciò che separa un gioco da uno
      strumento didattico che una scuola compra.
      Fatto. Da sistemare ancora due cose emerse dal cancello:
      il 30% delle partite romane finisce **a tempo** invece che con una
      vittoria vera (il Largo è troppo lento), e la bancarotta è allo 0%
      (il fido all'1,2% mensile è troppo mite, non c'è tensione).

- [x] **3.3 Raccolta dati automatica** — `agente/`, con due fonti che
      funzionano davvero (BCE per i tassi, Eurostat per la deriva dei
      prezzi) e due che richiedono una persona (OMI, retribuzioni). Propone
      e basta: non scrive mai nei dati di gioco, e un test lo verifica
      leggendo il sorgente. Da spostare in un repository suo quando avrà
      senso; per ora sta qui perché condivide il cancello di bilanciamento.
      **Nota utile trovata subito:** il tasso BCE più i costi accessori dà
      3,89% contro il 3,9% del pacchetto — conferma indipendente. I prezzi
      delle case in Italia sono a +4,0% annuo, sopra la soglia del 3%:
      quando si vuole aggiornare Roma, si riparte da lì.

## 3bis · Il secondo tempo, spento

- [x] **Uscire dalla Ruota è la vittoria.** Misurato: col Largo acceso due
      partite su trenta si vincevano e ventotto scadevano, e tutti e 52 i
      giocatori che uscivano si ritrovavano con meno soldi al mese di prima
      (4.049 € → 1.449 €). Ora le partite finite con una vittoria vera sono
      il 100%, e la mediana sta a 108 turni. Il Largo resta nel codice
      dietro `secondoTempo: false`, sistemato e sorvegliato dai test.
      Dettagli e numeri in [PIANO-COMPETIZIONE.md](PIANO-COMPETIZIONE.md).

- [ ] **Riaccendere il Largo, quando avrà senso.** Serve che chi esce non
      peggiori: o si arriva al secondo tempo con il capitale per comprare
      qualcosa, o gli affari del Largo devono costare quanto ci si può
      permettere. Finché uscire vuol dire perdere lo stipendio e aspettare
      quaranta turni, non è un finale.

## 4 · Perché tornarci ogni giorno

> **Da qui in poi il filo si è spostato in [PIANO-COMPETIZIONE.md](PIANO-COMPETIZIONE.md).**
> Quel file risponde a una domanda diversa e più grande: cosa manca perché
> uno ci giochi novemila volte, come si fa con gli scacchi. Ne sono uscite
> quattro cose che ora sono in produzione — il formato Lampo, la coda per
> trovare un avversario che non conosci, la valutazione Elo con la
> classifica, e la rivincita — più tre difetti che erano già lì e che
> nessuno vedeva perché nessuno giocava con sconosciuti.

- [x] **4.1 Sfida del giorno** — stesso seme, stessa professione, stesso
      mazzo per tutti quelli che giocano oggi; un tentativo; punteggio,
      serie e risultato condivisibile in stile Wordle.
      La **classifica** è arrivata dopo, e non per la sfida: per le partite
      fra persone, dove un identificativo serve comunque per sapere chi ha
      giocato con chi. La sfida in solitaria resta com'era — tutta sul
      dispositivo, niente sul server. Vedi PIANO-COMPETIZIONE.md.
- [x] **4.2 Modalità in solitaria** — la sfida gira **tutta nel browser**:
      nessuna stanza, nessuna scrittura sul database, nessun costo. La
      modalità che dovrebbe essere giocata più spesso è quella che non
      consuma niente.
- [x] **4.3 Valutazione** — un numero che sale e scende, ancorato a un
      **riferimento che gioca la tua stessa identica partita**: il mazzo
      della sfida è deterministico, quindi il confronto misura le scelte e
      non la fortuna. Vive sul dispositivo, quindi niente identificativi.
      La prima versione era rotta in silenzio — l'ancora sbagliata faceva
      salire chiunque, anche chi comprava a caso — ed è il motivo per cui i
      test ora insistono su una cosa sola: giocare peggio deve far scendere.
- [x] **4.4 Turni asincroni** — il motore era già pronto (lo stato vive sul
      server, la stanza dura 48 ore), mancavano le due cose che rendono la
      cosa usabile: sapere che è il tuo turno e ritrovare la strada per
      tornarci. Notifiche del browser quando la scheda è in secondo piano, e
      un elenco delle partite aperte sulla schermata d'ingresso. Entrambi sul
      dispositivo, nessun identificativo, nessun costo.
      **Limite dichiarato:** le notifiche funzionano a scheda aperta, anche
      in secondo piano, ma non ad applicazione chiusa. Vedi 4.5.

- [ ] **4.5 Notifiche vere (a app chiusa)** — servono service worker, VAPID
      e un servizio di push: è il primo pezzo di infrastruttura da mantenere
      e da pagare. Da fare quando ci saranno partite abbastanza lente da
      giustificarlo, non prima.

## 5 · Imparare

- [x] **5.0 Capire il gioco senza che nessuno lo spieghi** — il difetto più
      caro che avesse: amici messi davanti al gioco senza spiegazioni
      chiedevano «cos'è questo? non capisco niente». Il materiale per
      rispondere c'era già tutto — quindici lezioni, dieci quesiti — dietro
      un menù che nessuno apre *prima* di giocare.

      Risolto con tre cose, non con un giro di finestrelle:

      **Una prima partita vera** (`src/screens/PrimaPartita.jsx`), in
      solitaria, con seme fisso e venticinque turni, e una voce che dice una
      cosa sola nel momento in cui quella cosa succede. Gli otto passi sono
      funzioni pure (`src/game/guida.js`) con una condizione su `(prima,
      dopo)`: si provano senza disegnare niente, ed è l'unico modo di sapere
      che la guida parla quando serve. Tredici verifiche in
      `scripts/prova-guida.mjs`.

      **Le parole del gioco si possono chiedere** (`src/components/Glossa.jsx`):
      rendita, Giorno di Paga, acconto, flusso, conto economico, Ruota. Dove
      compaiono la prima volta si toccano e si aprono su una definizione.
      Meccanismi, mai consigli — la stessa linea delle lezioni.

      **Il mestiere si vede pescare** (`src/components/Roulette.jsx`): chi
      entra dalla coda o gioca contro il computer non sceglieva niente e si
      trovava sempre il pilota, cioè il primo dell'elenco. Adesso il server
      ne pesca uno **solo, per tutto il tavolo** (`professioneACaso` in
      `arena.js`) e il rullo lo mostra fermarsi. Stessa scheda per tutti:
      due schede diverse renderebbero il confronto un confronto fra
      professioni.

      Rimandato di proposito: le presentazioni una-tantum sulle linguette
      dei pannelli. La prima partita copre già la scheda, e una finestrella
      in più su una schermata che si è appena imparata a usare è rumore.

- [x] **5.2 Il tempo della carta** — il foglio di decisione compariva insieme
      al tiro, mentre la pedina stava ancora camminando: si leggeva l'affare
      prima di sapere dove si era finiti. Adesso aspetta l'arrivo. Il ritardo
      non è una pausa a occhio ma il tempo vero del cammino, e lo calcola un
      modulo solo (`src/lib/ritmo.js`) usato **sia dalla pedina sia dalla
      carta** — due copie dello stesso tempo in questo progetto avrebbero
      preso strade diverse, come è già successo tre volte. A scheda nascosta
      il ritardo salta.

- [x] **5.3 Lezioni e quesiti tradotti** — quindici lezioni e dieci quesiti
      in inglese e francese (`src/contenuti/lingue/`). I corpi restano
      **funzioni**, non stringhe: gli esempi si calcolano dai dati del
      mercato, e una lezione tradotta che citasse «1.000 €» scritti a mano
      comincerebbe a mentire al primo aggiornamento dei prezzi. Gli
      identificatori delle opzioni non si toccano — `giusta` ne indica uno.
      Rotto l'anello `lezioni.js` ↔ `lingue/*.js` estraendo gli aiuti in
      `src/contenuti/esempi.js`.

- [x] **5.4 Perché le traduzioni mancanti reggevano** — non perché nessuno
      traducesse: perché il controllo guardava **tre schermate su dieci, e
      solo in inglese**, e portava un ritaglio che si escludeva da solo i
      contenuti del mercato. Il ritaglio era giusto quando è stato scritto e
      poi è rimasto lì: le categorie («Bilocale», «Trilocale» — l'etichetta
      verde su ogni carta immobiliare, la stringa più vista del gioco) sono
      passate inosservate per questo.

      Adesso il controllo disegna **quindici schermate in ogni lingua** e
      cerca parole funzione italiane invece di una lista scelta a mano; e un
      secondo controllo legge lezioni e quesiti **alla fonte**, perché una
      lezione chiusa non mostra i suoi paragrafi e un quesito senza risposta
      non mostra la sua spiegazione — cioè la parte più lunga del materiale.
      Corretto anche il confronto, che cercava sottostringhe e trovava
      «nelle» dentro «proportionnelle»: un controllo che grida al lupo viene
      spento, e allora tanto vale non averlo.

      Non riprodotto: la segnalazione di «achetez» che appariva tagliato in
      «chetez». Cercato con una scansione del DOM a larghezza telefono su
      ingresso, modulo, foglio di decisione aperto e schermata Impara: non
      si è ripresentato. Resta annotato qui, non chiuso.

- [x] **5.5 Gli errori parlano la lingua di chi gioca** — trovato provando
      il gioco in francese: «Stanza non trovata o scaduta.» in mezzo a una
      schermata francese. Non era una stringa dimenticata, era **una classe
      intera**: cinquantacinque rifiuti del motore e una ventina del
      server, cioè tutta la parte che spiega perché non puoi fare una cosa.

      Reggeva perché il controllo sulle lingue disegna le schermate con
      dati finti e stato sano, e **in uno stato sano non ci sono errori**:
      la strada che porta un errore a schermo non passava di lì.

      Il server non conosce la lingua di chi gioca — la stessa stanza la
      guardano in tre lingue diverse — quindi manda due cose: la frase
      italiana e la chiave con cui tradurla (`errori.*`). Traduce il
      browser, in un punto solo (`src/lib/errori.js`); la frase italiana
      resta come ripiego, perché una chiave mancante deve dare un
      messaggio brutto ma leggibile, non il nome della chiave.

      Tre controlli nuovi, che guardano il **sorgente** invece di quello
      che appare: ogni `err()` del motore porta una chiave; ogni chiave
      usata esiste in tutte e tre le lingue; nessun `setErrore("…")` o
      `avvisa("…")` con una frase scritta a mano. Restano in italiano di
      proposito i messaggi che legge solo chi gestisce il servizio
      (`cleanup`, `eventi`, la variabile d'ambiente mancante).

- [x] **5.1 Lezioni e quesiti** — quindici lezioni e dieci quesiti, con gli
      esempi calcolati sui dati veri del mercato (la lezione sul centro
      contro la periferia dimostra il 3,4% del Centro Storico contro l'8,1%
      di Tor Bella Monaca usando le quotazioni vere). Avvertenza fissa e non
      chiudibile. **Sedici verifiche presidiano il confine dell'art. 166
      TUF**: nessuna esortazione a comprare, nessuno strumento reale
      nominato, e dove si parla di ETF si spiega il meccanismo e ci si ferma
      dichiarando perché.

## 5bis · Un mercato per paese

- [x] **5bis.1 Il mercato sta nell'indirizzo** — `/roma`, `/beirut`, e `/` che
      porta all'ultimo scelto. Serviva a tre cose che prima non si potevano
      fare: mandare a qualcuno il link di un mercato, tornarci col tasto
      indietro, e dare a ogni mercato una pagina vera invece di uno stato
      dentro al browser. `vercel.json` riscriveva già ogni percorso non-API
      su `index.html`, quindi non è servita nessuna configurazione nuova.

      **Nel percorso, non in un sottodominio.** `beirut.…` e `roma.…` sono
      due origini diverse e l'identità di chi gioca vive in `localStorage`
      (`quotazero:id`): due sottodomini avrebbero dato due identità alla
      stessa persona, azzerando punteggio e storico a ogni cambio di
      mercato. Per la stessa ragione niente deployment separati per paese:
      la coda, la classifica e l'Elo hanno bisogno di un archivio solo, e
      questo progetto ha già pagato tre volte il prezzo di due copie della
      stessa cosa.

      Nel farlo sono spariti **due stati indipendenti** che tenevano la
      stessa cosa — uno in `Ingresso`, uno in `ArenaConMercato` — che
      leggevano la stessa chiave di `localStorage` e la riscrivevano ognuno
      per conto suo, con ripieghi diversi (`classico` di qua, `roma` di là).
      Adesso c'è `useMercatoScelto`, e l'autorità è l'indirizzo.

- [-] **5bis.2 Caricare i pacchetti su richiesta** — rimandato di proposito,
      con una sveglia che suona da sola.

      Oggi `indice.js` importa staticamente ogni pacchetto: tutti i mercati
      viaggiano verso chiunque apra il sito. Con due mercati non si misura.
      Renderli asincroni costa invece parecchio: `getPacchetto` è sincrono
      perché il motore è una funzione pura, quindi il pacchetto va caricato
      **prima** di entrare nel motore in ventitré punti fra `api/`, gli
      script e le schermate, e `Ingresso` — che oggi chiama `getPacchetto`
      mentre disegna — dovrebbe imparare ad aspettare. Lavoro vero, un modo
      nuovo di rompersi (motore chiamato prima del caricamento), zero
      guadagno adesso.

      Quindi non è stato fatto, ed è stato messo un allarme al posto di un
      promemoria: `prova-mercati.mjs` fallisce all'ottavo mercato e dice
      cosa spostare. Verificato che suoni davvero, abbassando la soglia.

## 5ter · Deciso e rimandato

- [-] **Saldare la banca prima di vincere** — proposto, misurato, rimandato
      (decisione del 9 settembre 2026: per ora si lascia com'è).

      L'idea: non si esce dalla Ruota finché si deve qualcosa alla banca, e
      nelle partite a tempo si vendono immobili per saldare prima di
      stabilire chi ha vinto.

      **Misurato prima di scrivere una riga**, su tredici professioni, al
      momento in cui la rendita supera le spese:

      | Cosa si chiede di saldare | Ce l'ha | Debito medio | Può saldare |
      |---|---|---|---|
      | Solo il prestito banca | 97% | 6.972 € | 35% |
      | + carta e auto | 100% | 17.991 € | 10% |
      | + prestito studi | 100% | 25.286 € | 3% |
      | Tutto, mutuo casa incluso | 100% | ~200.000 € | **0 su 88** |

      Quindi la lettura larga **rende il gioco invincibile**: nessuno esce
      più, mai. La lettura stretta invece regge, e coincide con le parole:
      `prestitoBanca` è l'unico debito davvero verso *la banca* — gli altri
      sono un mutuo, un prestito studi, un finanziamento auto e una carta.

      Se un giorno si fa: la condizione va dentro `fuoriDallaCorsa()` in
      `finanze.js` e non nei chiamanti, perché quella funzione la
      consultano il motore, il bot, la valutazione e i pulsanti — e sono
      già stati trovati due punti che facevano il confronto a mano. Serve
      anche una riga che spieghi **perché** il pulsante per uscire non c'è,
      altrimenti chi ha la rendita che copre le spese non capisce.

## 5quater · Un obiettivo solo

- [x] **I sogni sono usciti dal gioco** — c'erano dall'inizio: si sceglieva
      un sogno prima del primo tiro e alla fine il gioco diceva a quanti
      mesi di rendita fosse. Erano una seconda cosa da spiegare, una
      seconda scelta da fare prima di sapere cosa si stesse scegliendo, e
      una seconda risposta alla domanda «ho vinto?». L'obiettivo adesso è
      uno solo: uscire dalla Ruota.

      Tolti da tutte e tre le parti, non solo dallo schermo: i dati (le
      dodici voci per mercato e le loro traduzioni), il motore (la casella,
      le azioni `compraSogno`/`passaSogno`, la vittoria comprando il sogno,
      i segnalini che ne raddoppiavano il costo) e l'interfaccia (i due
      selettori, la scheda, la sala d'attesa, la schermata finale).

      **Il tabellone del Largo si è accorciato**: quattordici delle
      quarantasei caselle erano sogni. Non potevano diventare affari — i
      venti affari hanno già una casella a testa — quindi sono sparite, e i
      Giorni di Rendita sono stati ridistribuiti perché restassero
      uniformi: adesso sono 34 caselle con le rendite a distanza quattro o
      cinque. Se ne è accorta la prova che pretende quell'uniformità, non
      io.

      Una regex troppo avida ha rotto una riga di `prova-regole.mjs`
      (`professioneId: pid + (i + 1)`): l'ha trovata la prova sui contanti
      iniziali. E il banco usciva con errore mentre `❌` non compariva da
      nessuna parte, perché `prova-arena.mjs` non compilava più: da lì in
      poi si guarda il codice d'uscita, non le faccine.

## 5quinquies · La prima partita è una partita vera

- [x] **Si impara al tavolo, non da soli** — la partita guidata era in
      solitaria e aveva un'impaginazione tutta sua (`TavoloSolitario`):
      si imparava a giocare a un gioco che poi non si ritrovava. Alla prima
      partita vera comparivano di colpo avversari, chat, registro e regole,
      cioè metà dell'interfaccia, e bisognava ricominciare a orientarsi.

      Adesso la prima partita **è** `Partita.jsx`, la schermata di sempre,
      con un avversario automatico (Bea, stessa professione: si confrontano
      le scelte, non le schede) mosso da `useAvversari` come in una partita
      vera. Quattro passi nuovi della guida indicano le sezioni quando
      servono: chi è l'avversario appena si muove, la chat dopo qualche suo
      turno, il registro quando ha di che leggere, le regole dal quarto mese.

      **La chat funziona davvero.** Qui la stanza non esiste da nessuna
      parte, ma una chat spenta alla prima partita insegna che la chat non
      serve: passa dalle stesse funzioni del server (`preparaMessaggio`,
      `accoda`), quindi valgono gli stessi limiti, e Bea saluta una volta.

      Tre cose che sarebbero passate inosservate, e che i test hanno preso:
      la guida spiegava la carta **dell'avversario** come se fosse la tua
      (ora ogni passo controlla di chi è il `pending`); il banco riscriveva
      ogni mossa come `giocatoreId: "io"`, e col bot al tavolo il motore la
      rifiutava fermando la partita al primo turno; e i venticinque turni
      erano contati sul tavolo invece che a testa, che avrebbe dimezzato le
      occasioni della guida — lo stesso inciampo del contatore del Lampo.

      La prima frase ora si calcola disegnando e non in un effetto: prima
      il primo fotogramma era senza voce, e sul server non compariva
      affatto. Via anche la guardia contro il doppio montaggio.

## 6 · Prima di incassare un euro

- [x] **6.1 Licenza e proprietà** — `LICENSE` con dichiarazione di opera
      indipendente, fonti dei dati e avvertenza sull'art. 166 TUF.
- [~] **6.2 Informativa privacy e minori** — `PRIVACY.md` e
      `ACCORDO-SCUOLE.md` (nomina a responsabile ex art. 28 GDPR) scritti.
      **Restano due cose che non posso fare io:** riempire i segnaposto
      (contatto del titolare, nomi dei fornitori effettivi) e far verificare
      entrambi i testi a un legale prima dell'uso.
- [x] **6.3 Accessibilità** — passata con controllo automatico
      (`scripts/prova-accessibilita.mjs`, 14 verifiche). Corretti: quattro
      campi con etichetta visibile ma **non associata** (un lettore di
      schermo annunciava solo "casella di testo"), un `outline: none` che
      lasciava chi naviga da tastiera senza sapere dov'è, il grigio tenue a
      3,9:1 sulla carta chiara e il verde degli importi a 3,6:1 — entrambi
      sotto il 4,5:1 richiesto. Il titolo della pagina ora segue la lingua.
      **Resta la parte che una macchina non può fare:** provare il gioco con
      un lettore di schermo vero, e verificare il percorso completo da
      tastiera sul tabellone.
- [ ] **6.4 Deposito del marchio** — ricerca di anteriorità formale, poi UIBM o
      EUIPO.

## 6bis · Emerso costruendo

- [x] **Nessun test disegnava un componente** — è il difetto che ha generato
      tutti gli altri di questa sezione. `vite build` compila un componente
      che usa un nome inesistente, e i test giravano sui moduli. Aggiunto
      `scripts/prova-schermate.sh`, che impacchetta le schermate con esbuild
      e le disegna davvero in Node. Ha trovato **sei difetti al primo colpo**,
      tutti invisibili alla compilazione e alcuni invisibili anche aprendo la
      pagina, perché comparivano solo in certi momenti della partita.

- [x] **`vite build` non vede i nomi non importati** — due volte di seguito,
      spostando pezzi di `Ingresso.jsx`, una modifica ha perso la riga di
      import: la compilazione passava e la schermata si rompeva solo aprendola.
      Aggiunto `scripts/prova-import.mjs`, che raccoglie i nomi esportati dai
      nostri moduli e pretende che chi li usa li importi. Verificato che morda:
      togliendo un import, fallisce.

- [x] **Un NaN azzerava le spese** — la bancarotta dimezzava un elenco di
      voci scritto a mano con le chiavi del mercato "classico". Su Roma, che
      non ha la voce `rate`, scriveva NaN nelle spese, e `arrotonda()`
      trasformava il NaN in zero **senza dire niente**: il giocatore si
      ritrovava spese pari a zero, usciva dalla Ruota con una rendita
      irrisoria e restava impantanato al Largo. Sembrava un problema di
      bilanciamento, era un baco. Ora l'elenco lo dichiara il pacchetto, il
      NaN non viene più inghiottito, e il cancello controlla l'integrità dei
      numeri a ogni mossa.
- [x] **Il Largo romano era lento** — era un sintomo del NaN. Risolto.
- [x] **Reddito individuale contro spese di nucleo** — le schede accostavano
      spese familiari (affitto, utenze, auto) a un reddito di una persona
      sola, lasciando margini da 145 € al mese. Incoerenza mia. Le schede
      ora dichiarano il reddito del nucleo.
- [x] **Zero bancarotte a Roma** — risolto cambiando idea su che cosa sia
      la tensione. Un nucleo romano con mille euro di margine **è** resiliente:
      forzare la bancarotta sarebbe meno realistico, non più. Il rischio vero
      di chi vive di affitti non è una spesa una tantum, è che cambi quanto
      entra ogni mese. Aggiunti tre eventi di mercato — canoni che calano del
      15%, canoni che salgono del 12%, tassi che salgono — che colpiscono il
      **flusso** invece dei contanti. Un rialzo dei tassi costa 414 € al mese
      a chi ha nove mutui e niente a chi non ne ha: la leva viene punita
      esattamente dove va punita. La bancarotta resta allo 0%, ed è giusto
      così; la tensione ora è strategica.
      Da fare in un secondo momento: una perdita del lavoro modellata sul
      serio (NASpI, durata, percentuale) è materia da Livello 2.
- [-] **I contenuti dei mercati** — lo strato c'è e le cose che si leggono
      prima di cominciare sono tradotte in inglese e in francese: professioni,
      sogni, voci del conto economico, professionisti. La traduzione passa dal
      contesto del mercato, una volta sola, così nessun componente deve
      ricordarsi di chiamare una funzione, e quattro prove verificano che non
      manchi niente e che tradurre non tocchi mai un numero.
      Restano i **nomi e i testi delle carte** — 308 fra i due mercati, circa
      600 stringhe per lingua. Si aggiungono a `lingue/<id>.js` sotto `carte`,
      chiave per chiave, senza toccare altro. Erano già annotate come lavoro
      da chi conosce il posto: — con l'interfaccia in
      inglese, professioni, sogni e testi delle carte restano in italiano.
      Difendibile per Roma (il mercato è romano, il suo lessico anche), ma
      diventa un problema col terzo mercato. La soluzione giusta è che il
      pacchetto porti i nomi per lingua; sono circa 150 stringhe per mercato
      e vanno tradotte da qualcuno che conosca il posto, non a macchina.
- [x] **Il registro della partita è sempre in italiano** — fatto. `nota()`
      salva ora **sia** il testo italiano già composto **sia** la chiave del
      messaggio con i suoi valori; il client mostra la traduzione se conosce
      la chiave, altrimenti il testo. La ridondanza è voluta: le stanze
      durano 48 ore, quindi al momento di un aggiornamento ci sono partite in
      corso con righe salvate nel formato vecchio.
      I 61 messaggi sono stati estratti a macchina, non a mano. Trovati per
      strada: un template annidato che l'estrazione avrebbe corrotto, due
      messaggi che scrivevano il simbolo del dollaro a mano, e due che
      passavano parole italiane come valori ("Piccolo", "sale") — restavano
      italiane in inglese, e sono diventate chiavi distinte.
- [ ] **Il tabellone del Largo cita gli affari per id** (`av01`..`av20`):
      aggiungere una voce al mazzo senza aggiungere una casella la rende
      irraggiungibile. Documentato a caro prezzo.

- [x] **Le tendine erano quelle di sistema** — fatto. `components/Scelta.jsx`
      sostituisce i sei `<select>` nativi. Il motivo non era l'aspetto ma il
      contenuto: dentro un `<option>` ci va solo testo, e le nostre scelte
      hanno emoji, nome e un importo che serve a confrontare. Ora l'importo
      sta in colonna e due professioni si confrontano guardandole.
      Rifatti a mano tastiera e accessibilità (modello WAI-ARIA
      "select-only combobox"): frecce, Home/Fine, Invio, Spazio, Esc, Tab e
      ricerca scrivendo. Su schermo stretto è un foglio dal basso.
      Trovati per strada: la stringa "/mese" era scritta a mano e restava
      italiana in inglese; l'etichetta "Professione" nella sala d'attesa era
      anch'essa fissa in italiano mentre il nome per il lettore di schermo
      era tradotto; e l'elenco non si ribaltava, quindi in fondo alla pagina
      usciva dalla finestra.
- [x] **Due stringhe italiane nella sala d'attesa** — fatto. — `Attesa.jsx:140`
      ("Partirai con … in contanti") e `Attesa.jsx:161` ("Esci dalla
      stanza") non passano da `t()`: con l'interfaccia in inglese restano
      in italiano. Viste aprendo la sala d'attesa in inglese. Sono due
      chiavi, non è un lavoro di traduzione.

- [x] **Il banner delle anteprime diceva ancora il nome vecchio** — fatto, e
      va raccontato perché è il difetto peggiore trovato finora. `public/og-banner.png`
      è l'immagine che compare quando qualcuno condivide un link su WhatsApp,
      Telegram, Slack o LinkedIn. Mostrava **"CASHFLOW"** a caratteri di
      scatola e **"Esci dalla Corsa dei Topi"**: le due espressioni che tutta
      la rinomina esisteva per togliere di mezzo, sull'asset più pubblico del
      progetto. La causa è che `scripts/genera-immagini.py` si scriveva il
      nome a mano, quindi la rinomina non l'ha toccato e nessun test guardava
      lì — perché lì non c'è codice, c'è un PNG. Ora il generatore legge
      `src/marchio.js` e `prova-marchio.mjs` sorveglia che nessun testo
      spedito porti i nomi vecchi.
- [x] **La scheda finanziaria è tutta in italiano** — fatto. — `components/Scheda.jsx`
      scrive a mano "Conto economico", "Entrate", "Uscite", "Attivi",
      "Passività", "Contanti", "Giorno di paga", "Estingui un debito" e una
      ventina d'altre. Con l'interfaccia in inglese restano in italiano, ed è
      il pannello che si guarda più di ogni altro. Circa 30 chiavi: è lavoro
      meccanico, non traduzione difficile.
- [x] **Lo stato patrimoniale elenca voci che a Roma non esistono** — fatto. —
      `Scheda.jsx` scrive a mano le righe delle passività, fra cui "Debiti
      negozi" (`rate`), che è una categoria del mercato classico. A Roma quel
      campo non c'è e la riga mostra zero. Le etichette per mercato esistono
      già (`etichettePassivita`): va usato quello, come fa ora il riquadro
      del debito.

- [x] **La scorciatoia del prestito** — fatto. Si prendevano 100.000 € dalla
      banca senza alcun controllo, si compravano due attività e si usciva
      dalla Ruota in cinque turni. Misurato prima: con il prestito 13 partite
      su 40 finivano in fuga (mediana 25 turni, minimo 5, quattro entro i 15);
      senza, 1 su 40. Non era una strategia, era **la** strategia.
      Corretti: il tetto del credito (rata totale ≤ ⅓ del netto, massimo
      75.000 €, canone di casa escluso perché non è una rata di
      finanziamento), i costi di vendita (agenzia 3% + imposta sostitutiva
      26% sulla plusvalenza entro cinque anni), e la soglia d'uscita, che su
      Roma è il doppio delle spese.
- [ ] **Le attività rendono il 32% l'anno, senza rischio** — è l'ultimo pezzo
      irrealistico rimasto, e non si risolve con una tabella. Come *prezzo*
      quei numeri reggono: 95.000 € per 31.800 € l'anno è circa 3× gli utili,
      che è un multiplo plausibile per una micro-impresa. Quello che non
      regge è la **certezza**: nel gioco un'attività non chiude, non ha
      bisogno di qualcuno che ci lavori, e non ha annate storte. Il 32% nella
      realtà è il prezzo di quel rischio.
      Le due strade: abbassare le rese (semplice, e rende Roma una
      passeggiata di soli immobili negativi), oppure lasciare i prezzi e
      aggiungere il rischio — variabilità degli utili e possibilità di
      chiusura. La seconda è più onesta e più interessante, ma è una scelta
      di progetto e cambia il ritmo della partita.
- [ ] **Il debito delle attività non costa niente** — comprando la Pizzeria a
      140.000 € con 45.000 € di acconto restano 95.000 € di debito che non
      ha rata. I mutui immobiliari ce l'hanno. Va dato un costo, ma va fatto
      insieme alla decisione sopra: da solo azzera quasi tutte le attività e
      Roma diventa invincibile.

- [x] **Il Largo era un altro gioco attaccato al primo** — fatto, come
      riprogettazione della seconda metà. Uscire dalla Ruota non moltiplica
      più per cento: significa smettere di lavorare, e basta. Lo stipendio va
      a zero, portafoglio, spese e debiti restano, il Giorno di Rendita paga
      il flusso vero, gli affari del Largo entrano fra le attività, e il
      traguardo è raddoppiare la rendita d'uscita invece di una cifra fissa.
      Rifatti insieme, perché ognuno da solo peggiorava il bilanciamento: il
      tabellone del Largo (8 caselle d'incasso invece di 4, 4 di penalità
      invece di 7), le penalità (2, 3 e 6 mesi di rendita invece di metà o
      tutti i contanti), il mazzo del Largo classico (era al 144% l'anno,
      ora al 40% come la sua Ruota) e la fascia del ritmo, che misurava
      l'uscita come se fosse la fine della partita.

- [-] **7.1 Costo del polling** — sei giocatori a 1,4 s fanno ~15.400 chiamate
      l'ora per stanza. A 100 stanze in contemporanea sono 1,5 milioni l'ora.
      Rimandato di proposito: con pochi giocatori non costa nulla, e si risolve
      passando agli eventi dal server. Da riprendere prima di spingere sul
      traffico, non adesso.

- [ ] **Chi lavora per te: costruito, misurato, tolto** — commercialista e
      avvocato erano assumibili a 120 e 90 € al mese, con uno sconto sulle
      imposte e sulle perdite da sfitto. Misurati dopo averli costruiti
      (Roma L2, quadro, 60 partite per scenario) peggioravano la partita e
      basta: si usciva dalla Ruota nell'83% delle partite senza nessuno, nel
      65% col commercialista, nel 60% con l'avvocato, nel 47% con entrambi;
      le vittorie dal 68% al 38%.

      La causa vera non è il compenso: è che **il risparmio era agganciato ai
      canoni d'affitto, mentre la partita si vince con le attività.** A Roma
      L2 gli immobili rendono fra il −1% e il −3% e le attività il 32%,
      quindi chi gioca bene compra attività — che non hanno canone e non sono
      tassate. Un giocatore che assumeva "solo quando si ripaga" non assumeva
      mai: in 60 partite, zero volte. Una decisione con una sola risposta
      giusta non è una decisione, e in più era una schermata in più da capire.

      Rimossi. Tornano quando ci sarà qualcosa da ottimizzare, cioè dopo aver
      **tassato le attività** — il buco già annotato del Livello 3. Il codice
      sta nella storia di git: `fonti.js` (PROFESSIONISTI), `finanze.js`
      (contoProfessionisti), l'azione `professionista` del motore e la
      sezione della scheda.

- [ ] **Gli altri professionisti che servirebbero** — restano fuori, in ordine
      di quanto contano: **assicurazione** sul fabbricato e responsabilità
      civile (150–400 € l'anno per immobile: la cosa che evita di perdere
      tutto una volta sola); **tecnico/geometra** per APE e conformità
      catastale (300–800 € per immobile, obbligatorio in compravendita);
      **consulente del lavoro**, se un'attività assume qualcuno. Notaio,
      agenzia e amministratore di condominio sono già dentro i costi
      d'acquisto e le quote sul canone.
