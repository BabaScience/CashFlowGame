# Accordo sul trattamento dei dati personali

**Nomina a responsabile del trattamento ai sensi dell'art. 28 del
Regolamento (UE) 2016/679.**

> **Bozza da far verificare a un legale prima dell'uso.** È scritta per
> essere corta e vera, non per essere impressionante: un responsabile
> protezione dati deve poterla leggere in dieci minuti e capire esattamente
> che cosa succede. I campi fra parentesi quadre vanno compilati.

---

## Fra

**Il Titolare del trattamento**
[Denominazione dell'istituto scolastico]
[Indirizzo] · C.F. [—] · PEC [—]
Nella persona del Dirigente scolastico [—]

**e il Responsabile del trattamento**
[Denominazione dell'entità che pubblica Quota Zero]
[Indirizzo] · P.IVA [—] · PEC [—]

---

## 1. Che cosa fa questo servizio

Quota Zero è un simulatore finanziario multigiocatore usato come strumento
didattico. Gli studenti entrano in una stanza con un codice di quattro
lettere, scelgono un nome e giocano.

Non esiste registrazione. Non esistono account, password o indirizzi di
posta elettronica. Non c'è nulla da recuperare, perché non c'è nulla da
proteggere con una password.

## 2. Quali dati vengono trattati

| Dato | Natura | Perché |
|---|---|---|
| Nome scelto dallo studente | Testo libero, **può essere di fantasia** | Distinguere i giocatori al tavolo |
| Identificativo casuale del dispositivo | Generato in locale, non collegabile a una persona | Riconoscere lo stesso giocatore fra un turno e l'altro |
| Mosse di gioco e prospetto economico | Dati di gioco | È la partita |
| Messaggi in chat | Testo libero | Solo se la chat è attiva (vedi §5) |

**Non si trattano:** cognomi, date di nascita, indirizzi, numeri di
telefono, indirizzi di posta elettronica, dati di geolocalizzazione,
fotografie, dati relativi al rendimento scolastico, né alcuna categoria
particolare di dati ai sensi dell'art. 9 GDPR.

Il Titolare istruisce gli studenti a usare **nomi di fantasia**. Il gioco
funziona identicamente: nessuna funzione dipende dal nome vero.

## 3. Per quanto tempo

La cancellazione è automatica e non richiede alcuna richiesta:

- **48 ore** dall'ultima mossa, per una partita in corso;
- **6 ore** dalla fine della partita, o per una stanza mai avviata.

Alla scadenza viene eliminato l'intero documento della stanza: nomi, mosse
e messaggi insieme. Il meccanismo è un indice a scadenza del database, non
una procedura che qualcuno deve ricordarsi di eseguire.

Il docente che ha creato la stanza può chiuderla in qualunque momento, e la
cancellazione è immediata.

## 4. Misure di sicurezza (art. 32)

- Trasmissione cifrata (TLS) fra dispositivo e server.
- Database gestito, con accesso limitato alle credenziali di servizio.
- **Minimizzazione per progetto**: il servizio non chiede dati che non gli
  servono, e quindi non può perderli.
- Nessun identificativo lato server per le statistiche d'uso: il dispositivo
  comunica soltanto una fascia di giorni («entro 7», «entro 30»), mai una
  data né un identificativo.
- Nessun cookie di profilazione, nessuno strumento di analisi di terze parti,
  nessun pixel pubblicitario.

## 5. Chat

La chat è **disattivabile con un tocco** da chi crea la stanza, e
disattivandola i messaggi già scritti vengono cancellati.

Per l'uso in classe se ne raccomanda la disattivazione, salvo diversa
valutazione del Titolare. Le stanze sono raggiungibili solo con il codice
condiviso dal docente: non esiste una ricerca di partite pubbliche, quindi
nessuno di esterno può entrare in una stanza scolastica.

## 6. Minori

Il servizio è destinato a persone **dai 14 anni in su**, età del consenso
digitale in Italia ai sensi dell'art. 8 GDPR e dell'art. 2-quinquies del
Codice privacy.

Per l'uso in classe con studenti di età inferiore, il trattamento si fonda
sull'esecuzione di un compito di interesse pubblico del Titolare (art. 6.1.e
GDPR), e resta responsabilità del Titolare l'informativa alle famiglie.

## 7. Sub-responsabili

| Fornitore | Ruolo | Dove |
|---|---|---|
| [Fornitore di hosting] | Esecuzione dell'applicazione | [—] |
| [Fornitore del database] | Conservazione delle stanze | [—] |

Il Responsabile comunica al Titolare qualunque variazione con almeno 30
giorni di preavviso. Con ciascun sub-responsabile sono in essere garanzie
conformi agli artt. 28 e 44 e seguenti del GDPR.

## 8. Obblighi del Responsabile

Il Responsabile:

a) tratta i dati solo su istruzione documentata del Titolare;
b) garantisce la riservatezza di chi è autorizzato al trattamento;
c) adotta le misure dell'art. 32 elencate al §4;
d) assiste il Titolare nel rispondere agli interessati — segnalando che, non
   conservando identificativi, il Responsabile **non è in grado di collegare
   i dati di una partita a una persona**, e che la cancellazione avviene
   comunque per scadenza automatica;
e) notifica al Titolare ogni violazione **senza ingiustificato ritardo e
   comunque entro 24 ore** dalla conoscenza del fatto;
f) alla cessazione, cancella i dati — cosa che avviene comunque da sé entro
   48 ore, non esistendo archivi di lungo periodo;
g) mette a disposizione del Titolare le informazioni necessarie a dimostrare
   il rispetto dell'art. 28 e consente le verifiche.

## 9. Durata

Il presente accordo ha efficacia per la durata del servizio e cessa con
esso. Non sopravvive alcuna conservazione di dati, per la ragione detta al §3.

---

**Luogo e data** [—]

Il Titolare del trattamento [—]  ·  Il Responsabile del trattamento [—]

---

### Nota per chi lo legge dalla parte della scuola

La parte più insolita di questo accordo è quanto è corto, e il motivo è che
il servizio raccoglie pochissimo. Le domande che di solito occupano una
riunione — dove finiscono i dati, per quanto tempo, chi vi accede, come si
cancellano — qui hanno risposte di una riga, perché non c'è quasi nulla da
custodire. Se serve una verifica, il codice che stabilisce i tempi di
conservazione è in `api/_lib/db.js` e sono tre costanti.
