# Perché uno dovrebbe giocarci novemila volte

File di lavoro. Si aggiorna man mano: ogni voce si chiude solo quando
`npm test` passa, la cosa è verificata nel browser e sta in produzione.

Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto e in produzione

---

## La domanda

In due anni sono state giocate novemila partite a scacchi su chess.com. Non
perché gli scacchi siano cambiati: perché la piattaforma ha reso banale la
frase *«ancora una»*. Questo file elenca cosa manca a Quota Zero per poterla
dire, e in che ordine va costruito.

Vincolo che non si tocca: **costo di infrastruttura zero**. MongoDB M0
(512 MB) e Vercel Hobby, come adesso. Niente servizi nuovi, niente variabili
d'ambiente nuove — altrimenti la produzione si rompe al primo deploy.

---

## Cosa fa tornare la gente: il giro, smontato

Guardando come funziona chess.com (e Board Game Arena, che è il caso più
vicino al nostro perché i suoi giochi durano), il giro è fatto di sei pezzi.
Ne abbiamo due.

| | pezzo | ce l'abbiamo? |
|---|---|---|
| 1 | **Premi Gioca e in pochi secondi hai un avversario** | ❌ serve conoscere qualcuno e passargli un codice |
| 2 | **Una partita sta in una pausa caffè** | ❌ 130 turni a testa, tre quarti d'ora |
| 3 | **Un numero che si muove dopo ogni partita** | ⚠️ esiste, ma solo per la sfida in solitaria |
| 4 | **Sapere dove stai rispetto agli altri** | ❌ nessuna classifica |
| 5 | **Rigiocare con un clic** | ❌ si ricomincia dal codice |
| 6 | **Una cosa quotidiana da 60 secondi** | ✅ la sfida del giorno |

Il punto 2 viene prima di tutti. Non si dice *«ancora una»* di una cosa che
dura quaranta minuti: una partita blitz sta sotto i sei minuti, ed è per
quello che due terzi delle sessioni ne contengono più di una. Finché la
partita dura quanto dura oggi, il matchmaking non serve a niente — perché
nessuno tornerebbe comunque.

Il punto 1 viene subito dopo, ed è quello che ci separa da un gioco che si
gioca fra amici che si conoscono già. Oggi Quota Zero è un gioco da tavolo
con il tabellone su internet. Perché diventi un posto dove si va, deve
esserci qualcuno dall'altra parte anche quando non hai invitato nessuno.

---

## Il piano

### A — Formato Lampo *(sblocca tutto il resto)*
- [x] **A.1** Un limite di turni per stanza, scelto alla creazione:
      **Lampo** (40 turni a testa) e **Lunga** (come adesso). Il motore ha
      già il finale a tempo con la classifica per progresso: si riusa quello,
      che è provato e testato, invece di inventare un finale nuovo.
- [x] **A.2** Il limite si vede mentre si gioca: *turni 12 / 40*, non solo
      alla fine.
- [x] **A.3** `bilancia.mjs` verifica anche il formato Lampo: ogni partita
      deve finire entro il tetto, e chi compra deve battere chi non compra
      almeno nell'85% dei casi. Misurato: 100%.

### B — Trovare un avversario senza conoscerlo
- [x] **B.1** `/api/coda`: entri in coda, il primo che arriva con lo stesso
      formato e lo stesso mercato ti viene appaiato e la stanza nasce da
      sola. Una collezione minuscola con indice TTL a 3 minuti: costo zero,
      e si svuota da sola se nessuno arriva.
- [x] **B.2** Appaiamento atomico con `findOneAndDelete`: due persone che
      premono nello stesso istante non possono prendersi lo stesso avversario.
- [x] **B.3** Il bottone in prima pagina: **Gioca ora**. Attesa con un
      contatore, e dopo 20 secondi si propone il computer — meglio una
      partita subito che una sala d'attesa vuota.

### C — Un numero che significa qualcosa, anche contro le persone
- [x] **C.1** Identità leggera: l'identificativo casuale che il dispositivo
      già genera, più un nome scelto da chi gioca. Nessuna email, nessuna
      password, nessun dato che non sia stato scritto apposta.
- [x] **C.2** Valutazione Elo aggiornata a fine partita, sul server, una
      volta sola (guardia sul documento della stanza).
- [x] **C.3** `/api/classifica`: i primi cinquanta, più la tua posizione. In
      classifica si entra dalla terza partita; la propria riga si vede
      sempre, con scritto quante ne mancano.
- [x] **C.4** PRIVACY.md aggiornato: dalla classifica in poi conserviamo un
      identificativo, e va detto prima, non dopo.

### C-bis — Le partite devono finire
- [x] **C.5** Dopo tre minuti senza mosse, chi resta può andare avanti
      senza chi è sparito. Senza questo il matchmaking produce stanze
      morte: si perde il primo tiro, si chiude la scheda, e la partita
      resta appesa fino alla scadenza — con la valutazione che non si
      muove mai.
- [x] **C.6** Chi abbandona in due fa vincere l'altro. Il controllo
      "è rimasto uno solo" stava dentro il ramo della bancarotta: chi
      premeva *esci* lasciava l'avversario in una partita senza fine.
      C'era da prima; con gli sconosciuti sarebbe diventato la norma.

### D — Rigiocare, e sapere com'è andata
- [x] **D.1** **Rivincita** a fine partita: una stanza nuova con gli stessi
      giocatori, un clic per chi accetta.
- [x] **D.2** Profilo in prima pagina: valutazione, posizione, partite e
      vittorie. E la variazione a fine partita, scritta dal server sulla
      stanza così la vedono tutti e non solo chi ha fatto l'ultima mossa.
- [ ] **D.3** Storico delle ultime partite. *(rimandato: serve una
      collezione in più, e con pochi utenti non dice ancora niente)*

---

## Trovato costruendo

**Due partite di fila rompevano il polling.** Passando da una stanza a
un'altra — che è esattamente quello che fa la rivincita — la richiesta della
stanza vecchia restava in volo e, tornando, scriveva la sua versione nel
riferimento condiviso. Da lì in poi giravano due cicli intrecciati: uno
chiedeva la stanza nuova con la versione della vecchia, l'altro il contrario,
e la schermata restava su quella sbagliata. C'era già prima — bastava
riprendere una partita dall'elenco — e nessuno l'aveva mai visto perché
nessuno cambiava stanza senza passare dalla prima pagina. Risolto numerando
i giri e buttando le risposte del giro precedente.

**In classifica si entra dalla terza partita.** Ci sono arrivato da un
inciampo: le due partite di prova che ho giocato in produzione per verificare
il deploy si sono piazzate prime e seconde in una classifica vuota, e non
avevo modo di cancellarle. La soluzione giusta non era cancellarle: era la
regola che serviva comunque. Con una partita sola chi vince per fortuna è
primo, e nessuno guarda due volte una classifica così. Le righe di prova sono
sparite da sole, e il difetto vero era coperto.

**Due schede dello stesso browser sono la stessa persona.** Lo spazio di
memoria del sito è per origine, non per scheda: l'identificativo è lo stesso,
e la coda giustamente si rifiuta di appaiarti con te stesso. Per provare in
due servono due origini diverse (`localhost` e `127.0.0.1`). Non è un
difetto, ma è la prima cosa che confonde chi prova.

---

## Il secondo tempo è spento

Domanda di partenza: *le righe del registro al Largo non sono ben
distribuite, e chi esce dalla Ruota — gli conviene davvero?*

Misurato, su trenta partite a tre giocatori, la risposta alla seconda è no,
e non di poco.

| | |
|---|---|
| partite vinte davvero al Largo | **2 su 30** |
| partite finite perché scadeva il tempo | **28 su 30** |
| giocatori che uscendo peggioravano il proprio flusso | **52 su 52** |
| flusso mensile mediano, prima → dopo | 4.049 € → 1.449 € |
| contanti all'uscita, contro l'affare più economico | 6.904 € contro 25.000 € |
| affari del Largo comprati, a testa | 0,85 |
| turni fra l'uscita e il primo affare | 40 |

Il premio per aver vinto il primo tempo era una riduzione di stipendio,
seguita da quaranta turni in cui non si poteva comprare niente. Non era un
finale: era una pista di rullaggio che finiva prima del decollo.

**La distribuzione del registro era il sintomo, non la malattia.** I Giorni
di Rendita stavano a 0, 12, 24, 36, 40, 42, 44, 46 — distanze di 2, 12, 12,
12, 4, 2, 2, 2 — e le ultime otto caselle erano un blocco senza un solo
affare. Il 28% dei turni produceva soltanto il tiro dei dadi; il 36% di
quelli che pagavano scriveva da due a cinque righe identiche di fila.
Carestia, poi abbuffata.

### Cosa si è deciso

**Uscire dalla Ruota è la vittoria.** Ogni mercato pubblicato dichiara
`secondoTempo: false`. Risultato misurato: le partite finite con una
vittoria vera passano dal 7% al **100%**, e la mediana scende a 108 turni.

**Il Largo non è stato cancellato, è stato spento** — e sistemato prima di
spegnerlo, perché riaccenderlo com'era avrebbe riacceso anche il difetto.
Giorni di Rendita ogni sei caselle, nessun tratto di più di tre caselle
senza affari, e più incassi nello stesso tiro diventano una riga sola. Due
test lo tengono acceso apposta, così il codice resta sorvegliato mentre
dorme.

**Il sogno non si compra più: si misura.** Era l'unica altra vittoria, e
viveva solo al Largo. Prima di spostarlo nella Ruota l'ho misurato: costa da
70.000 a mezzo milione, e il picco di contanti dentro la Ruota sta sui
46.000 — solo il 13% dei giocatori arriva a permettersi anche solo il più
economico. Un pulsante che non si accende quasi mai è peggio di nessun
pulsante. Adesso la schermata finale dice a **quanti mesi di rendita** sta
il tuo sogno: *«il giro del mondo: a cinque anni e otto mesi»*. È l'unità
che il gioco usa per tutto il resto, è vera, e si confronta con quella
degli altri al tavolo.

**Il tabellone è un anello solo.** Disegnare l'anello esterno di un posto
dove non si può andare toglieva metà della superficie alla pista su cui si
gioca davvero.

### Trovato mentre lo facevo

**L'interfaccia prometteva una liquidazione che il motore non paga.** Il
riquadro «Sei libero» diceva *«uscendo ricevi 383.200 € di liquidazione»*:
era la vecchia regola del ×100, tolta dal motore mesi fa e rimasta scritta
nella schermata. Chi usciva riceveva zero. Ora un test vieta la parola.

**La soglia dichiarata era sbagliata.** La scheda diceva *«serve il doppio
delle spese»*; il margine è 1,5× da quando il 2× si è rivelato ingiocabile
con un reddito solo.

---

## Decisioni prese strada facendo

**Il Lampo finisce a punti, non per abbandono.** Un limite di turni che
dichiara pareggio sarebbe stato più semplice, ma toglie il motivo di giocare
gli ultimi cinque turni. Con la classifica per progresso — la stessa che usa
la sfida del giorno — ogni turno fino all'ultimo sposta qualcosa.

**Quaranta turni a testa, non trenta.** Il primo numero provato era trenta;
misurando, a trenta il vincitore arrivava al 22% del proprio traguardo contro
il 12% del perdente — uno scarto di dieci punti su numeri piccoli, cioè
rumore. A quaranta lo scarto raddoppia in proporzione (30% contro 15%), i
pareggi scendono a uno su venti, e la partita resta sotto i duecento
turni in tutto: una decina di minuti veri.

**La valutazione la calcola il server, non il browser.** Quella della sfida
in solitaria vive sul dispositivo perché non c'è niente da difendere: sei tu
contro un riferimento. Una classifica pubblica calcolata dal client è una
classifica che si scrive da sola.

**Nessuna variabile d'ambiente nuova.** Le collezioni nuove stanno nello
stesso database, con lo stesso indice TTL. Così `main` si può pubblicare
senza toccare la configurazione di Vercel.
