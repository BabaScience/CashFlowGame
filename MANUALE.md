# Quota Zero — Manuale di gioco

Simulatore finanziario multigiocatore.
Da 2 a 6 giocatori. Una partita dura in media 60–120 minuti.

> Non serve un banchiere: il conto economico e lo stato patrimoniale di ogni
> giocatore sono calcolati dal server a ogni mossa. Nessuno può sbagliare una
> somma, e tutti vedono gli stessi numeri.

---

## Indice

1. [L'idea del gioco](#1-lidea-del-gioco)
2. [Come si vince](#2-come-si-vince)
3. [Preparazione](#3-preparazione)
4. [La tua scheda finanziaria](#4-la-tua-scheda-finanziaria)
5. [Parte I — La Ruota](#5-parte-i--la-corsa-dei-topi)
6. [Le caselle della Ruota](#6-le-caselle-della-corsa-dei-topi)
7. [La banca: prestiti e debiti](#7-la-banca-prestiti-e-debiti)
8. [La bancarotta](#8-la-bancarotta)
9. [Uscire dalla Ruota](#9-uscire-dalla-corsa-dei-topi)
10. [Parte II — La Largo](#10-parte-ii--la-corsia-veloce)
11. [Le caselle del Largo](#11-le-caselle-della-corsia-veloce)
12. [Fine partita](#12-fine-partita)
13. [Strategia: cosa insegna davvero](#13-strategia-cosa-insegna-davvero)
14. [Giocare contro sconosciuti](#14-giocare-contro-sconosciuti)
15. [Note sulla versione online](#15-note-sulla-versione-online)

---

## 1. L'idea del gioco

La maggior parte delle persone vive in quella che il gioco chiama **Ruota**:
si lavora, arriva lo stipendio, si pagano le spese, e il mese dopo si ricomincia.
Più si guadagna, più si spende. La ruota gira e non si arriva mai da nessuna parte.

L'unico modo di uscirne è comprare **attivi**: cose che mettono soldi in tasca
ogni mese senza che tu debba lavorarci. Immobili affittati, attività avviate,
titoli che pagano dividendi. Quel denaro si chiama **reddito passivo**.

Quando il tuo reddito passivo supera le tue spese totali, non hai più bisogno
dello stipendio: sei libero. In quel momento esci dalla Ruota ed entri
nella **Largo**, dove si gioca per i sogni.

> **Attivo**: qualcosa che ti mette soldi in tasca.
> **Passività**: qualcosa che ti toglie soldi di tasca.
> Tutta la partita si gioca su questa distinzione.

---

## 2. Come si vince

Ci sono **due modi**, entrambi validi solo dopo essere arrivati al Largo:

**1. Compra il tuo sogno.**
A inizio partita scegli un sogno fra i dodici del Largo. Quando ci
atterri sopra e hai i contanti per pagarlo, lo compri e vinci all'istante.

**2. Aumenta di $50.000 il tuo flusso mensile.**
Entrando al Largo ricevi un Reddito del Giorno di Rendita iniziale.
Comprando gli affari verdi lo fai crescere. Quando supera il valore iniziale
di **$50.000**, vinci.

La partita finisce nel momento in cui qualcuno raggiunge uno dei due obiettivi.

---

## 3. Preparazione

1. Uno dei giocatori **crea la stanza** e riceve un codice di 4 lettere.
2. Gli altri **entrano col codice**. Massimo 6 giocatori.
3. Ognuno sceglie:
   - una **professione** fra le dodici disponibili (dal Custode al Medico);
   - un **sogno** fra i dodici del Largo (due giocatori possono
     scegliere lo stesso sogno — pensaci bene, è un rischio).
4. Chi ha creato la stanza avvia la partita quando sono tutti pronti.
5. All'avvio ogni giocatore riceve in contanti:
   **il proprio Giorno di Paga + i propri Risparmi iniziali**.
   I risparmi vengono versati una volta sola.
6. L'ordine di gioco è deciso da un tiro di dado: chi fa il numero più alto comincia.

### Le professioni

Lo stipendio alto non è un vantaggio. Il Medico guadagna $13.200 al mese ma ha
$9.650 di spese e $381.000 di debiti; il Custode guadagna $1.600 e ne spende $950.
Il Custode ha bisogno di molto meno reddito passivo per essere libero.

| Professione | Stipendio | Spese totali | Giorno di paga |
|---|---:|---:|---:|
| Medico | $13.200 | $9.650 | $3.550 |
| Pilota di linea | $9.500 | $6.530 | $2.970 |
| Avvocato | $7.500 | $5.560 | $1.940 |
| Ingegnere | $4.900 | $3.500 | $1.400 |
| Manager d'azienda | $4.600 | $3.370 | $1.230 |
| Insegnante | $3.300 | $2.210 | $1.090 |
| Agente di polizia | $3.000 | $2.180 | $820 |
| Infermiere | $3.100 | $2.380 | $720 |
| Camionista | $2.500 | $1.830 | $670 |
| Segretario/a | $2.500 | $1.830 | $670 |
| Meccanico | $2.000 | $1.300 | $700 |
| Custode | $1.600 | $950 | $650 |

#### Su Roma: una persona sola, con numeri veri

Il mercato di Roma simula **una persona sola**: il suo stipendio e le sue
spese. Gli importi sono **netti mensili reali**, rilevati sulle retribuzioni
italiane del 2026 — un insegnante porta a casa circa 1.650 € al mese, un
infermiere 1.750, un ingegnere 2.250, un pilota 4.200.

Anche le spese sono di una persona sola, e la casa viene dalle stesse
quotazioni che alimentano le carte: un monolocale di 40 m² costa da 520 € a
Tor Bella Monaca a 960 € a Prati, una stanza in condivisione poco più della
metà. Chi guadagna meno condivide o sta in periferia, chi guadagna di più ha
un bilocale suo e più centrale — che è quello che succede davvero.

*Coniuge e figli come modello completo — due redditi che possono sparire uno
per volta, l'assegno unico, il costo vero di un bambino — arriveranno in una
versione successiva. Fino ad allora è meglio simulare bene una vita che
simularne male due.*

**Le schede sono al netto.** L'IRPEF e i contributi sono già stati tolti: è per
questo che la voce *Imposte* parte da zero. Ricompare quando cominci a incassare
affitti, perché quello è reddito nuovo — vedi §6, e la lezione «RAL, lordo,
netto» nella sezione Impara.

---

## 4. La tua scheda finanziaria

Sono i due prospetti che nel gioco da tavolo si compilano a matita.

### Conto economico

**Entrate**
- Stipendio
- Dividendi e interessi
- Flusso dagli immobili
- Flusso dalle attività

Le ultime tre voci sommate sono il tuo **Reddito passivo**.
Tutte e quattro insieme sono il **Reddito totale**.

**Uscite**
- Tasse, rata mutuo, rata prestito studio, rata auto, carta di credito,
  rate negozi, altre spese
- Spese figli (numero di figli × spesa per figlio)
- Rata del prestito bancario

**Flusso mensile = Reddito totale − Spese totali.**
È il tuo Giorno di Paga: quello che incassi ogni volta che passi sulla casella.

### Stato patrimoniale

- **Attivi**: titoli, immobili, attività — con acconto versato e costo totale.
- **Passività**: mutuo casa, prestito studio, auto, carte, debiti negozi,
  prestito bancario, più i mutui sugli immobili e i debiti delle attività.

---

## 5. Parte I — La Ruota

L'anello interno del tabellone, 24 caselle.

- Si tira **1 dado** e ci si muove in senso orario.
- Atterrare sulla stessa casella di un altro giocatore non ha alcun effetto.
- Ogni carta pescata viene mostrata a tutti i giocatori.
- **Le opportunità scadono quando il turno passa**: decidi adesso.

---

## 6. Le caselle della Ruota

### 💵 Giorno di Paga (3 caselle)
Ogni volta che **atterri sopra o ci passi**, incassi il tuo Flusso mensile.
Se il flusso è negativo, sei tu a pagare la banca.
Nella versione online l'incasso è automatico: non puoi dimenticartelo.

### ◆ Opportunità (12 caselle)
Scegli tu se guardare un **Piccolo Affare** o un **Grande Affare**.

- **Piccoli Affari** — entrata massima $5.000: titoli, case singole, terreni,
  piccole attività. Sono il modo in cui si comincia quando si hanno pochi soldi.
- **Grandi Affari** — da $6.000 in su: palazzine, condomini, aziende avviate.
  Flussi molto più grandi, ma serve capitale.

Puoi comprare solo se hai i contanti per l'**acconto**. Il resto è finanziato
dal mutuo, che diventa una tua passività ma non una rata mensile a parte:
il flusso indicato sulla carta è già al netto di tutto.

Sulla carta trovi il **rendimento annuo sull'acconto**: flusso × 12 ÷ acconto.
È il numero che conta davvero quando confronti due affari.

### 📈 Il Mercato (3 caselle)
Si pesca una carta che può essere:
- un **compratore** per una categoria di immobili o per un'attività;
- un **nuovo prezzo** per un titolo;
- un **evento economico** che colpisce tutti.

**Tutti i giocatori che possiedono l'attivo indicato possono vendere**, non solo
chi ha pescato la carta. Vendendo un immobile perdi il relativo flusso mensile
e incassi il prezzo **meno il mutuo residuo, meno i costi di vendita**.

Sul mercato di Roma i costi di vendita ci sono per davvero:

| Voce | Quanto | Quando |
|---|---|---|
| Provvigione d'agenzia | 3% del prezzo | sempre |
| Imposta sulla plusvalenza | 26% sul guadagno | solo entro **5 anni** dall'acquisto |

Il guadagno tassato è *prezzo di vendita − prezzo d'acquisto*: il mutuo non
c'entra, era solo il modo in cui avevi pagato. **Dopo cinque anni la plusvalenza
non si tassa più**: è la regola che separa l'investimento dalla speculazione, e
può cambiare il risultato di una compravendita di venti punti percentuali.

Il registro della partita elenca ogni voce, così i conti si possono rifare.

Il turno riprende quando tutti i giocatori interessati hanno risposto. Chi ha
pescato la carta può chiudere la fase se qualcuno tarda troppo.

### 🛍️ Spesa Extra (3 caselle)
Spese impreviste e spesso inutili. **Sono obbligatorie**: se non hai i contanti,
devi chiedere un prestito. Alcune si moltiplicano per il numero di figli.

### ❤️ Beneficenza (1 casella)
Facoltativa. Donando il **10% del tuo reddito totale** puoi tirare **2 dadi
invece di uno per i 3 turni successivi**. Muoverti di più significa incontrare
più caselle Opportunità: spesso conviene.

### 👶 Un figlio (1 casella)
Le tue spese mensili aumentano della "spesa per figlio" della tua professione.
**Massimo 3 figli** per giocatore.

### 📉 Licenziamento (1 casella)
Paghi subito l'importo delle tue **spese totali** e **salti 2 turni**.
Annulla anche l'effetto della Beneficenza.

---

## 7. La banca: prestiti e debiti

### Chiedere un prestito
Puoi farlo in qualsiasi momento del tuo turno, tranne quando sei in bancarotta.

- Solo a **multipli di $1.000**.
- L'interesse dipende dal mercato: sul mercato classico è il **10% al mese**;
  su Roma è l'**1,2% al mese** (14,4% l'anno), che è quanto costa davvero un
  fido di conto corrente.
- **La banca guarda quanto puoi restituire.** Non presta a chiunque e non
  presta quanto vuoi: la rata — sommata a quelle che paghi già — non può
  superare **un terzo del tuo reddito netto mensile**, e c'è comunque un
  tetto (su Roma, 75.000 €). È la regola vera degli istituti italiani.
  Il canone di casa resta fuori dal conto: non è un finanziamento e non
  compare nelle centrali rischi, anche se la banca lo considera.

Se chiedi più di quanto il tuo reddito regge, il gioco te lo dice e ti indica
la cifra massima. Non è un ostacolo inventato: è quello che ti risponderebbero
allo sportello.

Un prestito ha senso solo se l'affare che ci compri rende **più di quanto il
prestito costa**. E attenzione: dove serve un margine per uscire (vedi §9),
ogni euro di rata alza il traguardo di due. Il debito accorcia la strada molto
meno spesso di quanto sembri.

### Estinguere un debito
In qualsiasi momento del tuo turno puoi estinguere un debito per **ridurre le
spese** e alzare il flusso mensile.

- I debiti vanno estinti **per intero**, tranne il prestito bancario che si
  rimborsa a scaglioni di $1.000 (ogni $1.000 toglie $100 di spese).
- **Non si possono estinguere**: Tasse, Altre spese, Spese figli.
  Sono permanenti.

---

## 8. La bancarotta

Sei in bancarotta se, **passando dal Giorno di Paga**, il tuo flusso mensile è
negativo e non hai i contanti per coprirlo.

Cosa succede:

1. **Svendi i tuoi attivi alla banca a metà dell'acconto versato.**
   Puoi anche estinguere debiti coi contanti che ricavi.
2. Usa il ricavato per far tornare positivo il flusso mensile.
3. **Perdi 3 turni.**

Se dopo aver venduto tutto il flusso resta negativo, **metà** dei tuoi debiti
di prestito auto, carte di credito e rate negozi viene cancellata, insieme a
metà delle relative rate. Mutuo casa e prestito studio restano intatti.

Se anche così il flusso resta negativo, **sei fuori dalla partita**.

---

## 9. Uscire dalla Ruota

Puoi uscire **all'inizio di un tuo turno**, non appena il tuo reddito passivo
supera la soglia del mercato in cui giochi:

| Mercato | Soglia |
|---|---|
| Classico | **reddito passivo > spese totali** (1×) |
| Roma | **reddito passivo > 1,5 × spese totali** |

Perché una volta e mezza, e non il pareggio? Perché le rendite non sono ferme: un
inquilino se ne va, una caldaia si rompe, un'attività ha un'annata storta. Chi
lascia il lavoro nel mese esatto in cui i conti si toccano è un imprevisto
lontano dal doverlo cercare di nuovo. Quel margine non è prudenza esagerata: è
il costo di poter dire di no.

Uscire vuol dire **una cosa sola: smetti di lavorare.**

1. Lo **stipendio va a zero**. Hai lasciato il lavoro.
2. **Tutto il resto resta com'è**: le case, le attività, i debiti, l'affitto,
   la spesa. Non c'è nessuna liquidazione e nessun premio.
3. Il **Giorno di Rendita** incassa quello che il tuo portafoglio produce
   davvero, meno quello che ti costa vivere — lo stesso conto del Giorno di
   Paga, senza la busta paga.
4. Il tuo obiettivo diventa **raddoppiare la rendita** con cui sei uscito.
5. **La banca continua a prestarti**, con le stesse regole di prima: la rata
   non può superare un terzo di quello che entra. Solo che adesso quello che
   entra è la rendita, non lo stipendio — ed è esattamente come funziona
   nella realtà, dove un proprietario con affitti documentati viene valutato
   su quelli. La sezione **Banca** della scheda resta dov'era.

La scheda non cambia forma: conto economico, stato patrimoniale, mutui,
debiti e banca sono tutti ancora lì. Cambia solo che la riga *Stipendio* è a
zero. In cima si aggiunge il quadro del Largo, con il traguardo e quanta
strada hai fatto.

> **Perché non c'è un premio.** Nelle prime versioni uscire moltiplicava tutto
> per cento: chi lasciava il lavoro con 1.739 € di rendita riceveva 173.900 €
> in contanti e incassava la stessa cifra a ogni Giorno di Rendita. È la regola
> del gioco da tavolo originale, ma spezzava la partita in due: il portafoglio
> costruito in tutta la prima metà smetteva di contare, le spese sparivano, e
> la seconda metà era un altro gioco. Qui la seconda metà è la stessa
> economia, senza più la busta paga.

Chi esce prima ha un vantaggio. Chi esce con una rendita più alta ha un
traguardo più alto: la domanda è la stessa per tutti — sai raddoppiare quello
che ti sei costruito?

---

## 10. Parte II — La Largo

L'anello esterno, 48 caselle. Si tirano **2 dadi**.

Le carte Opportunità, Mercato e Spese Extra non ti riguardano più.
Qui si gioca solo per due cose: il tuo sogno e il tuo flusso mensile.

---

## 11. Le caselle del Largo

### 💰 Giorno di Rendita (8 caselle)
Atterrando o passando incassi il tuo flusso mensile: quello che rendono le tue
cose, meno quello che ti costa vivere.

### ◆ Affare (20 caselle)
Ogni casella verde è un investimento unico: una piantagione di caffè, un parco
eolico, una squadra sportiva. Paghi l'**acconto** indicato ed
entra nel tuo portafoglio come qualunque altra attività, aumentando il tuo
reddito passivo.

**Una volta comprato, quell'affare non è più disponibile per gli altri.**
Sul tabellone appare sbiadito.

### ★ Sogno (14 caselle)
- Se è **il sogno che hai scelto tu** e hai i contanti: compralo e **vinci**.
- Se è il sogno **di un altro giocatore**: non puoi comprarlo, ma atterrandoci
  sopra ne **aumenti il costo del 100%** per lui. Un sogno da $200.000 gliene
  costerà $400.000; se ci atterra un secondo giocatore, $600.000.

È l'unico modo che hai per rallentare chi sta per vincere col sogno.

### ❤️ Beneficenza (2 caselle)
Facoltativa. Donando il **10% del tuo reddito** puoi scegliere se tirare
**1, 2 o 3 dadi** per il resto della partita, cambiando idea a ogni turno.
Serve a fermarti esattamente sulla casella che ti interessa.

### 🧾 Verifica fiscale (2 caselle) · ⚖️ Causa legale (1 casella)
Costano **due o tre mesi di rendita**. Sono cifre, non quote del patrimonio:
prima costavano metà dei contanti, e punivano esattamente chi stava
risparmiando per il primo affare.

### 💔 Divorzio (1 casella)
La casella peggiore del tabellone: **sei mesi di rendita**. Nella realtà un
divorzio divide un patrimonio, non lo brucia.


---

## 12. Fine partita

Appena un giocatore compra il proprio sogno o raggiunge +$50.000 di flusso,
la partita si chiude e appare il riepilogo finale con, per ogni giocatore:

- contanti finali e patrimonio netto;
- reddito passivo e spese totali (o flusso del Largo);
- valore degli attivi e totale delle passività;
- turno in cui è uscito dalla Ruota;
- numero di figli e di affari acquistati.

Serve a capire *perché* qualcuno ha vinto — che è la parte più utile.

---

## 13. Strategia: cosa insegna davvero

**Lo stipendio alto non è un vantaggio.**
Il Medico ha $3.550 di flusso mensile ma $9.650 di spese: gli servono $9.650 al
mese di reddito passivo per essere libero. Al Custode ne bastano $950.

**Il rendimento conta più del prezzo.**
Un immobile da $45.000 con $5.000 di acconto e $140 al mese rende il 33,6%
all'anno sull'acconto. Uno da $90.000 con $9.000 di acconto e $300 al mese rende
il 40%. Il secondo costa il doppio ed è l'affare migliore.

**Il debito buono esiste.**
Prendere $5.000 in prestito costa $500 al mese. Se ci compri un affare che rende
$800 al mese, hai guadagnato $300 al mese partendo da zero. Se ne rende $300,
ti sei impoverito.

**Le Spese Extra sono il vero nemico.**
Non ti rovinano in un colpo solo: ti impediscono di accumulare il capitale
necessario a cogliere l'occasione buona quando arriva.

**Estinguere i debiti piccoli è spesso la mossa migliore.**
Togliere $270 al mese di carta di credito equivale a comprare un immobile che
rende $270 al mese — ma senza rischio e senza acconto.

---

## 14. Giocare contro sconosciuti

Fino a poco fa per giocare con qualcuno bisognava conoscerlo: si apriva una
stanza e gli si mandava un codice di quattro lettere. Va benissimo fra amici,
e non basta perché il gioco diventi un posto dove si torna.

### Gioca ora

Dalla prima pagina, **Gioca ora** ti mette in coda. Il primo che arriva con
la stessa scelta — stesso mercato, stesso formato — viene appaiato con te e
la partita comincia da sola, senza sala d'attesa: siete già tutti e due lì.

Se dopo tre quarti di minuto non è arrivato nessuno, il gioco propone una
partita contro il computer. Non è un ripiego travestito: con pochi giocatori
la coda è quasi sempre vuota, e una partita subito vale più di un'attesa.

### I due formati

| | Durata | Come finisce |
|---|---|---|
| **Lampo** | 40 turni a testa, una decina di minuti | Vince chi è arrivato più vicino a uscire dalla Ruota |
| **Lunga** | mezz'ora e oltre | Vince chi esce dalla Ruota e raddoppia, come sempre |

Il Lampo non è un gioco diverso: è la stessa partita con un cronometro. Il
contatore dei turni si vede accanto al tempo lavorato, perché sapere quanti
ne restano cambia le scelte — negli ultimi cinque turni un affare che si
ripaga in un anno non si ripaga più.

Il numero quaranta è misurato, non scelto a naso: sotto, la partita la vince
chi ha pescato meglio nei primi turni; a quaranta un giocatore che non compra
mai niente perde il 98% delle volte, e fra due giocatori di pari livello
l'esito resta una moneta.

### La valutazione

Chiunque finisca una partita **contro almeno un'altra persona** entra in
classifica. Si parte da 1000. Chi vince sale, chi perde scende, e battere
qualcuno più forte vale più che battere qualcuno più debole — è l'Elo, lo
stesso sistema degli scacchi, esteso alle partite a più giocatori
confrontando ogni coppia di giocatori.

Nelle prime dieci partite il punteggio si muove al doppio della velocità: chi
comincia arriva in fretta al proprio livello invece di passare due settimane
a scalare da 1000.

**In classifica si compare dalla terza partita.** Prima il punteggio c'è ed è
tuo — lo vedi in prima pagina e a fine partita — ma non finisce nell'elenco
pubblico: con una partita sola chi vince per fortuna si ritroverebbe primo, e
una classifica dove il primo posto si prende col caso non la guarda nessuno
una seconda volta.

**Le partite contro il computer non contano.** Se contassero, la classifica
la vincerebbe chi ha più pazienza di battere un bot, e smetterebbe di dire
qualcosa su come si gioca.

Attenzione a non confonderla con la **valutazione della sfida del giorno**,
che è un'altra cosa: quella misura te contro un riferimento che gioca la tua
identica partita, vive sul tuo dispositivo e non riguarda nessun altro.

### La rivincita

A fine partita, **Rivincita** apre una stanza nuova con gli stessi giocatori
già seduti e la partita già avviata. Se la chiede anche l'avversario, entrate
nella stessa: non se ne aprono due. Chi tira per primo lo decidono i dadi,
come in qualunque altra partita.

---

## 15. Note sulla versione online

**I numeri.** Ogni scheda professione è verificata aritmeticamente: la somma
delle voci di spesa deve dare le spese totali, e stipendio meno spese deve dare
il flusso indicato. Le carte sono scritte per questa versione. Un test di
bilanciamento (`npm run test:bilancia`) gioca centinaia di partite automatiche e
verifica che da ognuna delle dodici professioni si possa davvero prendere il
largo: se un cambio di dati rendesse una professione senza via d'uscita, la
pubblicazione si ferma.

**Il tabellone.** 24 caselle sulla Ruota e 48 al Largo.

**Il dado.** Un generatore casuale uniforme, tirato sul server: nessun
giocatore può influenzarlo. Sulil Largo si tirano due dadi separati,
quindi il 7 esce sei volte più spesso del 2, come coi dadi veri.

**Cosa è stato semplificato.** Tre regole del gioco da tavolo non sono state
riportate, ed è giusto saperlo:

- **Rivendere una carta Opportunità a un altro giocatore.** Al tavolo,
  quando la carta lo consente, puoi cedere a un altro giocatore il diritto di
  fare quell'affare, a un prezzo che contrattate fra voi. Qui la carta la
  gioca solo chi l'ha pescata: la contrattazione libera richiederebbe una
  trattativa che il turno online non gestisce.
- **I prestiti per le spese obbligatorie sono automatici.** Il regolamento
  dice che *puoi* chiedere un prestito per pagare una Spesa Extra; qui, se non
  hai contanti, il prestito viene acceso da solo (a multipli di $1.000, con la
  sua rata). Serve a non lasciare mai i contanti sotto zero, che sul tabellone
  vero non può succedere perché i soldi sono fisici.
- **Gli affari del Largo che richiedono un tiro di dado.** Alcune
  caselle verdi originali si conquistano solo riuscendo un tiro, e restano
  disponibili finché qualcuno non ci riesce. Qui si comprano direttamente
  pagando l'acconto.

Tutto il resto — Giorno di Paga, Opportunità, Mercato, Spese Extra,
Beneficenza, Figli, Licenziamento, prestiti, estinzione debiti, bancarotta,
uscita dalla corsa e le due vittorie — segue il regolamento alla lettera.

**Il banchiere.** Nel gioco da tavolo serve una persona che tenga la cassa.
Qui i conti li fa il server: nessuno può sbagliare una somma o barare.

**Sincronizzazione.** Tutti vedono lo stesso tavolo. Le carte pescate compaiono
a schermo per tutti, e il registro tiene traccia di ogni mossa.

**Durata dei dati.** Una stanza inattiva viene cancellata dopo 48 ore; una
partita conclusa dopo 6 ore; una stanza mai avviata dopo 6 ore. Chi ha creato
la stanza può cancellarla subito a fine partita.

---

*Quota Zero è un marchio registrato di Quota Zero Technologies, Inc.
Questo progetto è una realizzazione personale a scopo didattico, senza fini
commerciali e senza alcun rapporto con i titolari del marchio.*
