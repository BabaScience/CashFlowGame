import React, { useState } from "react";
import { motion } from "framer-motion";
import { KV, Bottone, Barra, Denaro } from "./Base.jsx";
import { soldi, riepilogo } from "../game/finanze.js";
import { useMercato } from "../Mercato.jsx";
import { useLingua } from "../Lingua.jsx";

/**
 * La scheda finanziaria: Conto Economico e Stato Patrimoniale,
 * i due prospetti che chiunque abbia un mutuo dovrebbe saper leggere.
 */
export default function Scheda({ giocatore: g, invia, inAzione, mio }) {
  const { t } = useLingua();
  const { etichetteSpese, etichettePassivita, debitiEstinguibili, trovaProfessione, trovaSogno, trovaAffare, obiettivo } = useMercato();
  const [apri, setApri] = useState("conto");
  const [prestito, setPrestito] = useState(5000);
  const [errore, setErrore] = useState("");
  const r = riepilogo(g);
  const prof = trovaProfessione(g.professioneId);
  const sogno = trovaSogno(g.sognoId);

  const fai = async (az) => {
    setErrore("");
    const res = await invia(az);
    if (res.errore) setErrore(res.errore);
  };

  if (g.tracciato === "veloce") return <SchedaVeloce giocatore={g} />;

  const sezione = (id, titolo, corpo) => (
    <div className="carta">
      <button className="flex tra cen pieno p0" onClick={() => setApri(apri === id ? "" : id)}
        style={{ background: "none", textAlign: "left" }}>
        <span className="titolo f14">{titolo}</span>
        <motion.span animate={{ rotate: apri === id ? 180 : 0 }} className="tenue">▾</motion.span>
      </button>
      {apri === id && <div className="mt12">{corpo}</div>}
    </div>
  );

  return (
    <>
      {/* Riepilogo sempre visibile */}
      <div className="carta">
        <div className="flex tra cen mb12">
          <div>
            <div className="maiusc tenue">{prof.emoji} {prof.nome}</div>
            <div className="titolo f22" style={{ marginTop: 2 }}>{g.nome}</div>
          </div>
          <div className="ta-r">
            <div className="maiusc tenue">Contanti</div>
            <div className="numeri f22 grassetto">{soldi(g.contanti)}</div>
          </div>
        </div>

        <div className="flex tra f13 mb4">
          <span className="tenue">Reddito passivo verso le spese</span>
          <span className="numeri grassetto">
            {soldi(r.redditoPassivo)} / {soldi(r.speseTotali)}
          </span>
        </div>
        <Barra valore={r.progresso} />
        <p className="f12 tenue mt8" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
          {r.libero
            ? "Il tuo reddito passivo supera le spese: puoi uscire dalla Ruota!"
            : `Ti manca ancora ${soldi(r.speseTotali - r.redditoPassivo)} al mese di reddito passivo per uscire dalla Ruota.`}
        </p>

        <div className="flex tra mt12" style={{ gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">Giorno di paga</div>
            <div className="numeri f18 grassetto"><Denaro v={r.flussoMensile} segno /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">Passivo</div>
            <div className="numeri f18 grassetto pos">{soldi(r.redditoPassivo)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">Sogno</div>
            <div className="f13 grassetto" style={{ lineHeight: 1.2 }}>{sogno.emoji}</div>
          </div>
        </div>
      </div>

      {/* Il debito con la banca, se c'è.
          Stava soltanto dentro due pannelli chiusi — una riga nello stato
          patrimoniale e un pulsante in fondo alla Banca — quindi il
          prestito che la banca concede d'ufficio arrivava senza che si
          vedesse cambiare niente. È l'unica voce che nasce da sé, senza
          che nessuno l'abbia scelta: è quella che va vista di più. */}
      {mio && g.passivita.prestitoBanca > 0 && (
        <div className="carta carta-debito">
          <div className="flex tra cen">
            <span className="etichetta" style={{ margin: 0 }}>{t("debito.titolo")}</span>
            <span className="numeri f18 grassetto neg">{soldi(g.passivita.prestitoBanca)}</span>
          </div>
          <p className="f13" style={{ margin: "8px 0 0", lineHeight: 1.5 }}>
            {etichettePassivita?.prestitoBanca ? etichettePassivita.prestitoBanca + " · " : ""}
            {t("debito.costo", { importo: soldi(r.ratePrestito) })}
          </p>
          <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.5 }}>
            {t("debito.comeNasce")} {t("debito.effetto")}
          </p>
          {(() => {
            const passo = 1000;
            const puo = Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / passo) * passo);
            if (puo < passo) {
              return (
                <p className="f12 neg" style={{ margin: "10px 0 0" }}>
                  {t("debito.servonoContanti", { importo: soldi(passo) })}
                </p>
              );
            }
            const tutto = puo >= g.passivita.prestitoBanca;
            return (
              <Bottone variante="btn-fantasma mt12" disabled={inAzione}
                onClick={() => fai({ tipo: "estingui", chiave: "prestitoBanca", importo: puo })}>
                {t(tutto ? "debito.rimborsaTutto" : "debito.rimborsa", { importo: soldi(puo) })}
              </Bottone>
            );
          })()}
        </div>
      )}

      {/* Conto economico */}
      {sezione("conto", "Conto economico", (
        <>
          <div className="sezione-tit">Entrate</div>
          <KV k="Stipendio" v={soldi(g.stipendio)} />
          <KV k="Dividendi e interessi" v={soldi(r.dividendi)} colore={r.dividendi ? "pos" : ""} />
          <KV k="Immobili" v={soldi(r.flussoImmobili)} colore={r.flussoImmobili ? "pos" : ""} />
          <KV k="Attività" v={soldi(r.flussoAttivita)} colore={r.flussoAttivita ? "pos" : ""} />
          <KV k="Reddito passivo" v={soldi(r.redditoPassivo)} forte colore="pos" />
          <KV k="Reddito totale" v={soldi(r.redditoTotale)} forte />

          <div className="sezione-tit mt16">Uscite</div>
          {Object.entries(etichetteSpese).map(([k, et]) => (
            <KV key={k} k={et} v={soldi(g.spese[k])} />
          ))}
          <KV k={`Spese figli (${g.figli})`} v={soldi(r.speseFigli)} />
          <KV k="Rata prestito bancario" v={soldi(r.ratePrestito)} />
          <KV k="Spese totali" v={soldi(r.speseTotali)} forte />

          <div className="carta mt16" style={{ background: "#EEF4EA", borderColor: "#C6DCBB" }}>
            <KV k="FLUSSO MENSILE (giorno di paga)" v={<Denaro v={r.flussoMensile} segno />} forte />
          </div>
        </>
      ))}

      {/* Stato patrimoniale */}
      {sezione("patrimonio", "Stato patrimoniale", (
        <>
          <div className="sezione-tit">Attivi</div>
          {g.azioni.length === 0 && g.immobili.length === 0 && g.attivita.length === 0 && (
            <p className="f13 tenue" style={{ margin: "4px 0 12px" }}>
              Nessun attivo. Compra sulle caselle Opportunità per costruire reddito passivo.
            </p>
          )}
          {g.azioni.map((a) => (
            <KV key={a.simbolo} k={`${a.simbolo} — ${a.quantita} azioni a ${soldi(a.prezzoAcquisto)}`}
              v={a.dividendo ? `+${soldi(a.quantita * a.dividendo)}/mese` : soldi(a.quantita * a.prezzoAcquisto)} />
          ))}
          {g.immobili.map((i) => (
            <KV key={i.rid} k={`${i.nome} (acconto ${soldi(i.acconto)})`} v={`+${soldi(i.flusso)}/mese`} />
          ))}
          {g.attivita.map((a) => (
            <KV key={a.rid} k={`${a.nome} (acconto ${soldi(a.acconto)})`} v={`+${soldi(a.flusso)}/mese`} />
          ))}
          <KV k="Valore degli attivi" v={soldi(r.valoreAttivi)} forte />

          <div className="sezione-tit mt16">Passività</div>
          <KV k="Mutuo casa" v={soldi(g.passivita.mutuo)} />
          <KV k="Prestito studio" v={soldi(g.passivita.prestitoStudio)} />
          <KV k="Prestito auto" v={soldi(g.passivita.auto)} />
          <KV k="Carte di credito" v={soldi(g.passivita.cartaCredito)} />
          <KV k="Debiti negozi" v={soldi(g.passivita.rate)} />
          <KV k="Prestito bancario" v={soldi(g.passivita.prestitoBanca)} />
          {g.immobili.map((i) => <KV key={i.rid} k={`Mutuo — ${i.nome}`} v={soldi(i.mutuo)} />)}
          {g.attivita.filter((a) => a.passivita > 0).map((a) => (
            <KV key={a.rid} k={`Debito — ${a.nome}`} v={soldi(a.passivita)} />
          ))}
          <KV k="Passività totali" v={soldi(r.passivitaTotali)} forte />

          <div className="carta mt16" style={{ background: "#F2F0E6" }}>
            <KV k="Patrimonio netto" v={soldi(g.contanti + r.valoreAttivi - r.passivitaTotali)} forte />
          </div>
        </>
      ))}

      {/* Banca — solo per la propria scheda */}
      {mio && sezione("banca", "Banca", (
        <>
          <p className="f13 tenue" style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
            {t("scheda.prestitoSpiegazione", {
              taglio: soldi(1000), rata: soldi(Math.round(1000 * (g.tassoPrestito ?? 0.1))),
            })}
            Puoi farlo in qualunque momento del tuo turno.
          </p>
          <label className="etichetta">Importo del prestito</label>
          <div className="flex g8 mb12">
            <Bottone variante="btn-fantasma btn-piccolo" style={{ width: 52, height: 50 }}
              onClick={() => setPrestito((v) => Math.max(1000, v - 1000))}>−</Bottone>
            <div className="campo flex cen" style={{ justifyContent: "center", flex: 1 }}>
              <span className="numeri grassetto">{soldi(prestito)}</span>
            </div>
            <Bottone variante="btn-fantasma btn-piccolo" style={{ width: 52, height: 50 }}
              onClick={() => setPrestito((v) => v + 1000)}>+</Bottone>
          </div>
          <p className="f12 tenue mb12" style={{ margin: "0 0 12px" }}>
            Costo: <strong className="numeri">{soldi(Math.round(prestito * (g.tassoPrestito ?? TASSO_PRESTITO)))}</strong> al mese ·
            il tuo flusso passerebbe a <strong className="numeri">{soldi(r.flussoMensile - Math.round(prestito * (g.tassoPrestito ?? TASSO_PRESTITO)))}</strong>.
          </p>
          <Bottone variante="btn-blu" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: prestito })}>
            Chiedi {soldi(prestito)}
          </Bottone>

          {g.passivita.prestitoBanca > 0 && (
            <Bottone variante="btn-fantasma mt8" disabled={inAzione || g.contanti < 1000}
              onClick={() => fai({
                tipo: "estingui", chiave: "prestitoBanca",
                importo: Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000),
              })}>
              Rimborsa {soldi(Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000))}
            </Bottone>
          )}

          <div className="sezione-tit mt16">Estingui un debito</div>
          <p className="f12 tenue" style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
            Estinguere un debito azzera la rata e alza il flusso mensile.
            Va pagato per intero. Tasse, Altre spese e Spese figli non si possono estinguere.
          </p>
          {debitiEstinguibili.filter((d) => g.passivita[d.chiave] > 0).map((d) => {
            const puoi = g.contanti >= g.passivita[d.chiave];
            return (
              <div key={d.chiave} className="flex tra cen" style={{ padding: "9px 0", borderTop: "1px dashed var(--linea)" }}>
                <div>
                  <div className="f14 grassetto">{d.nome}</div>
                  <div className="f12 tenue numeri">
                    {soldi(g.passivita[d.chiave])} · rata {soldi(g.spese[d.spesa])}/mese
                  </div>
                </div>
                <Bottone variante="btn-fantasma btn-piccolo" disabled={inAzione || !puoi}
                  style={{ width: "auto" }}
                  onClick={() => fai({ tipo: "estingui", chiave: d.chiave })}>
                  {puoi ? "Estingui" : "Non basta"}
                </Bottone>
              </div>
            );
          })}
          {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
        </>
      ))}
    </>
  );
}

/** Scheda ridotta per chi è già al Largo. */
function SchedaVeloce({ giocatore: g }) {
  /* `obiettivo` arriva dal mercato. La rinomina da OBIETTIVO_RENDITA aveva
     prodotto `const obiettivo = ... + obiettivo`, cioè una costante che
     citava sé stessa: la scheda esplodeva per chiunque avesse preso il
     largo, e nessun test la disegnava in quello stato. */
  const { obiettivo, trovaSogno, trovaAffare } = useMercato();
  const traguardo = g.redditoInizialeVeloce + obiettivo;
  const fatto = g.redditoRendita - g.redditoInizialeVeloce;
  const sogno = trovaSogno(g.sognoId);
  return (
    <>
      <div className="carta" style={{ background: "linear-gradient(165deg,#FBF4E4,#F1E3BE)" }}>
        <div className="maiusc tenue mb4">Largo</div>
        <div className="titolo f22 mb12">{g.nome}</div>
        <KV k="Contanti" v={soldi(g.contanti)} forte />
        <KV k="Reddito del Giorno di Rendita" v={soldi(g.redditoRendita)} forte />
        <KV k="Reddito iniziale" v={soldi(g.redditoInizialeVeloce)} />
        <KV k="Obiettivo per vincere" v={soldi(traguardo)} />
        <div className="mt12">
          <div className="flex tra f12 mb4">
            <span className="tenue">Progresso verso +{soldi(traguardo)}</span>
            <span className="numeri grassetto">{soldi(fatto)}</span>
          </div>
          <Barra valore={fatto / obiettivo} />
        </div>
      </div>

      <div className="carta">
        <div className="sezione-tit">Il tuo sogno</div>
        <div className="flex cen g12">
          <span style={{ fontSize: 30 }}>{sogno.emoji}</span>
          <div>
            <div className="grassetto f16">{sogno.nome}</div>
            <div className="f13 tenue numeri">
              {soldi(sogno.costo * (1 + g.segnaliniSogno))}
              {g.segnaliniSogno > 0 && ` (rincarato ${g.segnaliniSogno}×)`}
            </div>
          </div>
        </div>
        <p className="f12 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
          Comprarlo fa vincere all'istante. Ogni volta che un altro giocatore
          atterra sulla sua casella, il prezzo per te sale del 100%.
        </p>
      </div>

      <div className="carta">
        <div className="sezione-tit">Affari acquistati ({g.affariVeloci.length})</div>
        {g.affariVeloci.length === 0 && (
          <p className="f13 tenue" style={{ margin: 0 }}>
            Nessuno ancora. Ogni affare verde aumenta il tuo reddito mensile.
          </p>
        )}
        {g.affariVeloci.map((id) => {
          const a = trovaAffare(id);
          return (
            <div key={id} className="flex tra cen" style={{ padding: "7px 0", borderTop: "1px dashed var(--linea)" }}>
              <span className="f14">◆ {a?.nome || id}</span>
              <span className="numeri f13 pos">+{soldi(a?.flusso || 0)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
