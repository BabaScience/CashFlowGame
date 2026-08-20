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

- [ ] **2.3 Lingua separata dal mercato**
      Sono due assi diversi: un francese deve poter giocare *Roma* in francese.
      Estrarre le stringhe in `src/i18n/it.json`. Sblocca anche l'inglese sopra
      al mercato di Roma, che è la copertura più economica che esista.

- [ ] **2.4 Scelta del mercato alla creazione della stanza**
      Prima scelta in `Ingresso.jsx`, prima di professione e sogno: è il mercato
      a decidere quali professioni esistono. Un mercato solo per tavolo.

## 3 · Roma su dati veri

- [ ] **3.1 Livelli di realismo** (`regole/livelli.js`)
      Livello 1 base (prezzi e tassi veri, imposta unica), Livello 2 reale
      (cedolare secca, IMU, spese d'acquisto, sfitto), Livello 3 esperto
      (IRPEF, plusvalenze, forfettario). Agganci riempiti dal pacchetto, non
      una scala di `if` sparsa nel motore.

- [ ] **3.2 Pacchetto Roma 2026**
      Professioni su fasce ISTAT/JobPricing al netto, immobili su quotazioni
      OMI per zona, credito su Banca d'Italia, fisco reale. Ogni valore porta
      `{ valore, fonte, url, aggiornato }`: è ciò che separa un gioco da uno
      strumento didattico che una scuola compra.
      Ribilanciare la scheda *Infermiere*, oggi la peggiore (21% di uscite,
      38% di fallimenti) perché porta un mutuo da 75.000 su 3.100 di reddito.

- [ ] **3.3 Raccolta dati automatica**
      Progetto separato: legge le fonti ufficiali aperte e propone un pacchetto
      nuovo come richiesta di modifica, con la fonte per ogni campo. Mai una
      scrittura diretta. Il cancello di bilanciamento decide se si pubblica.

## 4 · Perché tornarci ogni giorno

- [ ] **4.1 Sfida del giorno** — stesso seme per tutti, un tentativo,
      classifica, risultato condivisibile. Il testo da condividere è il budget
      pubblicitario.
- [ ] **4.2 Modalità in solitaria da cinque minuti** — la partita da 60-120
      minuti non si gioca dieci volte al giorno. Questa sì.
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

- [ ] **6.1 Licenza e proprietà** — `LICENSE`, nota di copyright.
- [ ] **6.2 Informativa privacy e minori** — età del consenso digitale a 14
      anni, nessun dato non necessario, conservazione dichiarata (i TTL ci sono
      già), accordo sul trattamento firmabile da una scuola.
- [ ] **6.3 Accessibilità** — non solo colore (fatto sulle pedine), aree di
      tocco, percorso da tastiera, contrasto.
- [ ] **6.4 Deposito del marchio** — ricerca di anteriorità formale, poi UIBM o
      EUIPO.

## 7 · Quando funzionerà

- [-] **7.1 Costo del polling** — sei giocatori a 1,4 s fanno ~15.400 chiamate
      l'ora per stanza. A 100 stanze in contemporanea sono 1,5 milioni l'ora.
      Rimandato di proposito: con pochi giocatori non costa nulla, e si risolve
      passando agli eventi dal server. Da riprendere prima di spingere sul
      traffico, non adesso.
