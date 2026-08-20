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

- [~] **3.1 Livelli di realismo**
      Livello 1 **fatto**, ma come dato e non come meccanica: imposte, IMU,
      condominio, manutenzione e sfitto sono una trattenuta unica del 28% sul
      canone, applicata quando si costruisce la carta (`derivazione.js`).
      Restano da fare il Livello 2 (ogni voce separata e visibile, cedolare
      secca al 21% o al 10% col canone concordato) e il Livello 3 (IRPEF,
      plusvalenze, forfettario). Quelli sì richiedono agganci nel motore.

- [x] **3.2 Pacchetto Roma 2026**
      Professioni su fasce ISTAT/JobPricing al netto, immobili su quotazioni
      OMI per zona, credito su Banca d'Italia, fisco reale. Ogni valore porta
      `{ valore, fonte, url, aggiornato }`: è ciò che separa un gioco da uno
      strumento didattico che una scuola compra.
      Fatto. Da sistemare ancora due cose emerse dal cancello:
      il 30% delle partite romane finisce **a tempo** invece che con una
      vittoria vera (il Largo è troppo lento), e la bancarotta è allo 0%
      (il fido all'1,2% mensile è troppo mite, non c'è tensione).

- [ ] **3.3 Raccolta dati automatica**
      Progetto separato: legge le fonti ufficiali aperte e propone un pacchetto
      nuovo come richiesta di modifica, con la fonte per ogni campo. Mai una
      scrittura diretta. Il cancello di bilanciamento decide se si pubblica.

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
- [ ] **4.3 Punteggio** — un numero visibile che si muove, misurato sulla
      qualità delle decisioni contro il gioco ottimo, che sappiamo calcolare.
- [ ] **4.4 Turni asincroni** — togliere il vincolo che sei persone siano
      libere nello stesso momento, che è il motivo per cui muoiono i giochi da
      tavolo online.

## 5 · Imparare

- [ ] **5.1 Lezioni e quesiti** — spiegare che cosa sono le cose e che cosa
      significano: un ETF, la cedolare secca, l'ammortamento. Il meccanismo,
      mai il consiglio su uno strumento preciso: in Italia è attività riservata
      (art. 166 TUF). Avvertenza fissa su ogni lezione.

## 6 · Prima di incassare un euro

- [x] **6.1 Licenza e proprietà** — `LICENSE` con dichiarazione di opera
      indipendente, fonti dei dati e avvertenza sull'art. 166 TUF.
- [~] **6.2 Informativa privacy e minori** — `PRIVACY.md` scritta. Restano
      da riempire i segnaposto prima della pubblicazione: contatto del
      titolare e nomi dei fornitori. Manca il testo dell'accordo sul
      trattamento da far firmare a una scuola.
- [~] **6.3 Accessibilità** — fatte le sagome sulle pedine (non solo colore)
      e i nomi accessibili sui pulsanti senza testo. Restano da verificare
      aree di tocco, percorso completo da tastiera e contrasti.
- [ ] **6.4 Deposito del marchio** — ricerca di anteriorità formale, poi UIBM o
      EUIPO.

## 6bis · Emerso costruendo

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
- [ ] **Zero bancarotte a Roma** — con margini di nucleo gli imprevisti si
      assorbono e manca la tensione. Non è un errore, ma il gioco ci guadagna
      se qualcosa può andare male: valutare un tetto al credito concedibile.
- [ ] **I contenuti dei mercati non sono tradotti** — con l'interfaccia in
      inglese, professioni, sogni e testi delle carte restano in italiano.
      Difendibile per Roma (il mercato è romano, il suo lessico anche), ma
      diventa un problema col terzo mercato. La soluzione giusta è che il
      pacchetto porti i nomi per lingua; sono circa 150 stringhe per mercato
      e vanno tradotte da qualcuno che conosca il posto, non a macchina.
- [ ] **Il registro della partita è sempre in italiano** — il motore scrive
      frasi già fatte in `s.registro`, e il client le mostra così come sono.
      Per tradurlo, `nota()` deve salvare chiave e valori invece del testo:
      una sessantina di punti di chiamata, meccanico ma da fare con calma.
- [ ] **Il tabellone del Largo cita gli affari per id** (`av01`..`av20`):
      aggiungere una voce al mazzo senza aggiungere una casella la rende
      irraggiungibile. Documentato a caro prezzo.

## 7 · Quando funzionerà

- [-] **7.1 Costo del polling** — sei giocatori a 1,4 s fanno ~15.400 chiamate
      l'ora per stanza. A 100 stanze in contemporanea sono 1,5 milioni l'ora.
      Rimandato di proposito: con pochi giocatori non costa nulla, e si risolve
      passando agli eventi dal server. Da riprendere prima di spingere sul
      traffico, non adesso.
