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

## 4 · Perché tornarci ogni giorno

- [x] **4.1 Sfida del giorno** — stesso seme, stessa professione, stesso
      mazzo per tutti quelli che giocano oggi; un tentativo; punteggio,
      serie e risultato condivisibile in stile Wordle. Manca la
      **classifica**: richiede di conservare un identificativo, e sarebbe la
      prima cosa che ci fa raccogliere dati su qualcuno. Da progettare con
      cura, non da aggiungere di corsa.
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

- [x] **5.1 Lezioni e quesiti** — dieci lezioni e dieci quesiti, con gli
      esempi calcolati sui dati veri del mercato (la lezione sul centro
      contro la periferia dimostra il 3,4% del Centro Storico contro l'8,1%
      di Tor Bella Monaca usando le quotazioni vere). Avvertenza fissa e non
      chiudibile. **Sedici verifiche presidiano il confine dell'art. 166
      TUF**: nessuna esortazione a comprare, nessuno strumento reale
      nominato, e dove si parla di ETF si spiega il meccanismo e ci si ferma
      dichiarando perché.

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
- [ ] **I contenuti dei mercati non sono tradotti** — con l'interfaccia in
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
- [ ] **Due stringhe italiane nella sala d'attesa** — `Attesa.jsx:140`
      ("Partirai con … in contanti") e `Attesa.jsx:161` ("Esci dalla
      stanza") non passano da `t()`: con l'interfaccia in inglese restano
      in italiano. Viste aprendo la sala d'attesa in inglese. Sono due
      chiavi, non è un lavoro di traduzione.

## 7 · Quando funzionerà

- [-] **7.1 Costo del polling** — sei giocatori a 1,4 s fanno ~15.400 chiamate
      l'ora per stanza. A 100 stanze in contemporanea sono 1,5 milioni l'ora.
      Rimandato di proposito: con pochi giocatori non costa nulla, e si risolve
      passando agli eventi dal server. Da riprendere prima di spingere sul
      traffico, non adesso.
