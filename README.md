# CASHFLOW online

Versione web e multigiocatore del gioco da tavolo **CASHFLOW®** di Robert Kiyosaki.
Da 2 a 6 giocatori, ognuno dal proprio telefono, con un codice stanza di 4 lettere.

- **Corsa dei Topi** (24 caselle) e **Corsia Veloce** (48 caselle), entrambe complete
- Le 12 professioni originali, con i numeri delle schede vere
- Mazzi Piccoli Affari, Grandi Affari, Mercato e Spese Extra
- Conto economico e stato patrimoniale calcolati dal server: nessuno può sbagliare i conti
- Le carte pescate le vedono tutti; il registro tiene traccia di ogni mossa
- Entrambe le condizioni di vittoria: comprare il proprio sogno, o +$50.000 di flusso
- Interfaccia pensata per il telefono, con animazioni di dadi, carte e pedine
- Manuale completo delle regole dentro l'app → [MANUALE.md](MANUALE.md)
- Installabile sul telefono, con icone e anteprima del link già pronte

---

## Provalo in locale

```bash
npm install
npm run dev
```

Apri <http://localhost:5173>. **Non serve alcun database**: in sviluppo le stanze
vivono in memoria dentro il server Vite (`scripts/api-locale.js`). Per giocare in
due sullo stesso computer apri una finestra normale e una in incognito — servono
due `localStorage` diversi, altrimenti sei sempre lo stesso giocatore.

### Verificare le regole

```bash
npm test
```

Esegue 17 verifiche sulla stringa di connessione, 30 verifiche puntuali sul
regolamento (ognuna cita la pagina del manuale ufficiale) e simula 60 partite
complete con giocatori automatici, controllando che il motore non si blocchi
mai e che nessuno finisca coi contanti negativi.

Singolarmente: `npm run test:uri`, `npm run test:regole`, `npm run test:simula`.

---

## Metterlo online

### 1. Il database (MongoDB Atlas, piano gratuito)

1. Crea un account su [mongodb.com/atlas](https://www.mongodb.com/atlas) e un
   cluster **M0** (gratuito, 512 MB).
2. *Database Access* → **Add New Database User**: scegli un nome utente e una
   password. Sono questi che andranno in `MONGODB_USERNAME` e
   `MONGODB_PASSWORD` — **non** l'account con cui entri nel sito di Atlas.
3. *Network Access* → **Add IP Address** → `0.0.0.0/0`.
   Serve perché le funzioni di Vercel non hanno indirizzi IP fissi.
4. *Database* → **Connect** → **Drivers** → copia la stringa.
   Puoi lasciarci dentro i segnaposto `<db_username>` e `<db_password>`:
   vengono sostituiti in automatico.

Prova le credenziali **prima** di mettere online:

```bash
cp .env.example .env    # poi riempi .env
npm run db:prova
```

Lo script si connette, crea gli indici, scrive e cancella un documento di
prova e ti dice quanto spazio stai occupando. Se qualcosa non va, spiega cosa
controllare (password sbagliata, cluster irraggiungibile, IP non ammesso).

### 2. Il repository

```bash
git remote add origin https://github.com/TUO-UTENTE/cashflow-online.git
git push -u origin main
```

### 3. Vercel

1. Su [vercel.com](https://vercel.com) → **Add New** → **Project** → importa il repository.
2. Il framework viene riconosciuto da solo (Vite). Non toccare i comandi di build.
3. In **Settings → Environment Variables** aggiungi:

   | Variabile | Obbligatoria | Cos'è |
   |---|:---:|---|
   | `MONGODB_URI` | sì | La stringa copiata da Atlas. I segnaposto `<db_username>` / `<db_password>` possono restare. |
   | `MONGODB_USERNAME` | sì | Utente del database (Atlas → Database Access). |
   | `MONGODB_PASSWORD` | sì | La sua password. Può contenere `@ / : # %`: viene codificata da sola. |
   | `MONGODB_DB` | no | Nome del database. Predefinito: `cashflow`. |
   | `CRON_SECRET` | consigliata | Stringa a caso che protegge `/api/cleanup`. |
   | `VITE_SITE_URL` | no | Solo con un dominio tuo, per l'anteprima dei link. Su `.vercel.app` si ricava da sola. |

4. **Deploy**.

Il file [vercel.json](vercel.json) registra già il *cron* giornaliero di pulizia,
le intestazioni di cache e l'instradamento.

> **Perché utente e password separati dalla URI?** Perché così la password
> viene codificata correttamente. Le password Atlas contengono spesso `@`, `/`
> o `#`, caratteri che dentro una URI hanno un significato loro: incollate a
> mano producono un errore di schema oppure un'autenticazione che fallisce
> senza dire perché. Inoltre la password finisce meno facilmente in un log o in
> uno screenshot. La composizione è in [api/_lib/uri.js](api/_lib/uri.js) e ha
> 17 test dedicati (`npm run test:uri`).

---

## Come appare quando condividi il link

In `public/` ci sono tutte le immagini del progetto:

| File | A cosa serve |
|---|---|
| `og-banner.png` | L'immagine 1200×630 che appare su WhatsApp, Telegram, Facebook, Slack, iMessage, X |
| `favicon.svg` | Icona della scheda del browser, nitida a ogni dimensione |
| `favicon.ico`, `favicon-16/32.png` | Ripiego per i browser più vecchi |
| `apple-touch-icon.png` | Icona quando si aggiunge alla schermata Home su iPhone |
| `icona-192/512.png` | Icone per l'installazione su Android |
| `icona-maskable-512.png` | Versione con margini, per il ritaglio circolare di Android |
| `manifest.webmanifest` | Fa sì che l'app si possa installare e si apra a schermo intero |

Le immagini sono generate da uno script, così restano rigenerabili identiche se
un giorno cambi colori o scritte:

```bash
pip install pillow
python3 scripts/genera-immagini.py
```

Disegna il tabellone vero — gli stessi 24 e 48 settori, con i colori presi da
`globale.css` — e usa gli stessi caratteri dell'applicazione (Archivo Black e
Barlow, in licenza SIL Open Font, in `scripts/font/`).

L'anteprima ha bisogno di un indirizzo **assoluto**: un percorso relativo viene
ignorato da quasi tutti i servizi e l'immagine non compare. L'indirizzo viene
calcolato in fase di compilazione da `VITE_SITE_URL`, oppure dalle variabili
che Vercel imposta da sé.

---

## Consumare poco (e restare nel piano gratuito)

Il progetto è pensato per non riempire mai i 512 MB di Atlas né bruciare le
invocazioni di Vercel.

**Le stanze si cancellano da sole.** Su `scadeIl` c'è un *indice TTL*: è MongoDB
stesso a rimuovere i documenti scaduti, senza che il codice debba fare nulla.
Ogni mossa sposta avanti la scadenza:

| Situazione | Durata |
|---|---|
| Partita in corso | 48 ore dall'ultima mossa |
| Stanza creata ma mai avviata | 6 ore |
| Partita conclusa | 6 ore (il tempo di guardare la classifica) |
| Stanza chiusa dall'host | cancellata subito |

**Il polling è quasi gratis.** Il client passa la versione che già possiede a
`GET /api/state?codice=…&v=N`. Se nessuno ha mosso, il server legge dal database
il solo campo `versione` e risponde `204` senza corpo. Lo stato completo viaggia
solo quando è davvero cambiato qualcosa.

**Il ritmo si adatta.** Si interroga il server ogni 1,4 s mentre aspetti gli
altri, 2,5 s quando la mossa è tua, 8 s con la scheda in secondo piano e 15 s a
partita finita.

**I documenti restano piccoli.** Il registro è tagliato a 120 righe dal motore,
quindi una stanza pesa qualche decina di KB: con 512 MB ci stanno migliaia di
partite in contemporanea.

**Rete di sicurezza.** `GET /api/cleanup`, eseguito una volta al giorno dal cron
di Vercel, rimuove quello che l'indice TTL non avesse ancora preso.

---

## Com'è fatto

```
api/                  funzioni serverless (Vercel)
  _lib/db.js          connessione MongoDB riusata fra invocazioni + indice TTL
  _lib/http.js        aiuti condivisi
  room.js             POST: crea stanza, applica mosse, chiudi stanza
  state.js            GET: polling leggero, 204 quando non è cambiato nulla
  cleanup.js          cron giornaliero di pulizia

src/game/             il gioco, senza una riga di interfaccia
  data/professioni.js le 12 professioni
  data/mazzi.js       Piccoli Affari, Grandi Affari, Mercato, Spese Extra
  data/corsiaVeloce.js affari e sogni della Corsia Veloce
  data/tabellone.js   i due tracciati
  finanze.js          conto economico e stato patrimoniale
  motore.js           applicaAzione(stato, azione) -> nuovo stato

src/components/       tabellone SVG, dadi, carte, scheda, registro, manuale
src/screens/          ingresso, sala d'attesa, partita
src/hooks/useStanza.js sincronizzazione col server

public/               icone, banner per le anteprime, manifest

scripts/
  prova-uri.mjs       verifiche sulla stringa di connessione
  prova-regole.mjs    verifiche sul regolamento
  prova-connessione.mjs prova le credenziali contro Atlas vero
  simula.mjs          simulatore di partite complete
  genera-immagini.py  rigenera icone e banner
  api-locale.js       API in memoria per lo sviluppo
```

**Il server è l'unica autorità.** `applicaAzione` è una funzione pura che gira
solo sul server: il client non calcola mai lo stato di gioco, lo chiede e lo
mostra. Le scritture concorrenti sono gestite con un controllo di versione
ottimistico — si riscrive il documento solo se nel frattempo nessun altro l'ha
toccato, altrimenti si rilegge e si riprova. Così due giocatori che premono
insieme non possono corrompere la partita.

---

## Fedeltà al regolamento

Le regole seguono *CASHFLOW® Rules of the Game* (edizione 1996-2000). In
particolare: il Giorno di Paga si incassa anche solo passandoci sopra; i prestiti
sono a multipli di $1.000 al 10% mensile; tasse, altre spese e spese figli non
sono estinguibili; la bancarotta svende gli attivi a metà dell'acconto; l'uscita
dalla Corsa dei Topi paga 100 volte il reddito passivo; atterrare sul sogno di un
altro glielo rincara del 100%.

La scheda del **Medico** è trascritta alla lettera dal manuale ufficiale
($13.200 di stipendio, $9.650 di spese, $3.550 di flusso). Le altre undici
professioni sono ricostruite sullo stesso schema e verificate aritmeticamente.
I mazzi di carte sono scritti per questa versione, rispettando fasce di prezzo e
rendimenti del gioco originale.

---

*CASHFLOW® è un marchio registrato di CASHFLOW® Technologies, Inc.
Questo è un progetto personale a scopo didattico, senza fini commerciali e senza
alcun rapporto con i titolari del marchio.*
