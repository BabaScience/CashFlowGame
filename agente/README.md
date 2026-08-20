# L'agente dei dati

Guarda le fonti ufficiali, misura quanto si sono spostate rispetto ai dati
in uso, e **propone**. Non pubblica niente.

```bash
node agente/proponi.mjs roma            # legge e riferisce
node agente/proponi.mjs roma --scrivi   # salva il rapporto in agente/proposte/
```

## La regola

Questo programma non tocca i dati di gioco. Mai.

Non è prudenza generica. Le stanze salvano gli indici dei mazzi già
mescolati e vivono fino a 48 ore: un errore di lettura in un solo campo si
trasformerebbe in un'economia rotta per tutti i tavoli aperti, e nessuno se
ne accorgerebbe finché qualcuno non perde una partita per colpa nostra.

Il percorso è sempre lo stesso:

1. l'agente legge le fonti e calcola la deriva;
2. se supera il 3%, propone di rifare i conti;
3. una persona scarica i dati che una macchina non può scaricare e scrive
   un **file di versione nuovo** — mai una modifica a uno esistente;
4. `npm run test:bilancia` decide se quel pacchetto è giocabile;
5. una persona legge il rapporto e pubblica.

Il passo 4 è quello che rende sicuro tutto il resto. Cambiare i numeri di
un gioco è una modifica di bilanciamento, non un aggiornamento di contenuti:
può rendere una professione impossibile senza che nulla vada in errore.

## Le fonti

| Fonte | Che cosa dà | Come |
|---|---|---|
| **BCE** (MIR) | Tasso sui nuovi mutui alle famiglie | API aperta, automatica |
| **Eurostat** | Indice dei prezzi delle abitazioni | API aperta, automatica |
| **OMI** — Agenzia delle Entrate | Quotazioni per zona | Area riservata, **a mano**, semestrale |
| **ISTAT / JobPricing** | Fasce retributive | Rapporto annuale, **a mano** |

Due precisazioni che è facile sbagliare:

- la BCE pubblica il **tasso**, non il TAEG. Il TAEG comprende i costi
  accessori ed è più alto di qualche decimo. L'agente aggiunge una stima e
  lo dichiara, invece di confrontare due cose diverse;
- l'indice Eurostat misura **quanto** si è mosso il mercato, non **dove**
  sono i prezzi. Serve a decidere se vale la pena riscaricare l'OMI, non a
  fissare il prezzo di un bilocale a Torpignattara.

## Che cosa non si fa

Non si estraggono dati dai portali di annunci. Le loro condizioni d'uso non
lo consentono per un prodotto commerciale, e comunque pubblicano prezzi
**richiesti**, non prezzi di compravendita. Un gioco che dichiara "dati
reali" e li prende dalle inserzioni mentirebbe due volte.

## Perché due volte l'anno

L'OMI pubblica per semestri e le retribuzioni si muovono una volta l'anno.
Interrogare le fonti ogni mese produce rumore, non informazione. I tassi
sono l'eccezione — sono un numero solo e si possono guardare più spesso.
