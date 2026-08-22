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
  const { etichetteSpese, etichettePassivita, debitiEstinguibili, trovaProfessione,
    trovaSogno, trovaAffare, obiettivo, obiettivoLargo, professionisti } = useMercato();
  const alLargo = g.tracciato === "veloce";
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
            <div className="maiusc tenue">{t("scheda.contanti")}</div>
            <div className="numeri f22 grassetto">{soldi(g.contanti)}</div>
          </div>
        </div>

        <div className="flex tra f13 mb4">
          <span className="tenue">{t("scheda.redditoVersoSpese")}</span>
          <span className="numeri grassetto">
            {soldi(r.redditoPassivo)} / {soldi(r.soglia)}
          </span>
        </div>
        <Barra valore={r.progresso} />
        <p className="f12 tenue mt8" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
          {r.libero
            ? t("scheda.puoiUscire")
            : t("scheda.tiManca", { importo: soldi(r.soglia - r.redditoPassivo) })}
        </p>

        <div className="flex tra mt12" style={{ gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">{t("scheda.giornoDiPaga")}</div>
            <div className="numeri f18 grassetto"><Denaro v={r.flussoMensile} segno /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">{t("scheda.passivo")}</div>
            <div className="numeri f18 grassetto pos">{soldi(r.redditoPassivo)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="maiusc tenue">{t("scheda.sogno")}</div>
            <div className="f13 grassetto" style={{ lineHeight: 1.2 }}>{sogno.emoji}</div>
          </div>
        </div>
      </div>

      {/* ═══ IL CAPPELLO DEL LARGO ═══
       *
       * Chi ha lasciato il lavoro vedeva una scheda ridotta a quattro righe:
       * niente uscite, niente mutui, niente prestito bancario, nessun
       * pannello Banca. Con la vecchia economia aveva un senso — sul Largo
       * non esistevano né spese né debiti — ma adesso esistono eccome, e
       * nasconderli lasciava il giocatore senza la metà dei suoi conti e
       * senza il modo di chiedere credito, che il motore invece consente.
       *
       * Ora il Largo aggiunge un cappello e tiene tutto il resto. */}
      {alLargo && (() => {
        const traguardo = obiettivoLargo
          ? Math.round(g.redditoInizialeVeloce * obiettivoLargo)
          : g.redditoInizialeVeloce + obiettivo;
        const daFare = Math.max(1, traguardo - g.redditoInizialeVeloce);
        const fatto = Math.max(0, r.redditoPassivo - g.redditoInizialeVeloce);
        return (
          <div className="carta" style={{ background: "linear-gradient(165deg,#FBF4E4,#F1E3BE)" }}>
            <div className="maiusc tenue mb4">{t("scheda.largo")}</div>
            <div className="titolo f22 mb12">{g.nome}</div>
            <KV k={t("scheda.redditoRendita")} v={soldi(r.redditoPassivo)} forte />
            <KV k={t("scheda.redditoIniziale")} v={soldi(g.redditoInizialeVeloce)} />
            <KV k={t("scheda.obiettivoVincere")} v={soldi(traguardo)} />
            <div className="mt12">
              <div className="flex tra f12 mb4">
                <span className="tenue">{t("scheda.progressoVerso", { importo: soldi(traguardo) })}</span>
                <span className="numeri grassetto">{soldi(fatto)}</span>
              </div>
              <Barra valore={fatto / daFare} />
            </div>
            <p className="f12 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
              {t("scheda.largoSpiegazione")}
            </p>
          </div>
        );
      })()}

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
      {sezione("conto", t("scheda.contoEconomico"), (
        <>
          <div className="sezione-tit">{t("scheda.entrate")}</div>
          <KV k={t("scheda.stipendio")} v={soldi(g.stipendio)} />
          <KV k={t("scheda.dividendi")} v={soldi(r.dividendi)} colore={r.dividendi ? "pos" : ""} />
          <KV k={t("scheda.immobili")} v={soldi(r.flussoImmobili)} colore={r.flussoImmobili ? "pos" : ""} />
          <KV k={t("scheda.attivita")} v={soldi(r.flussoAttivita)} colore={r.flussoAttivita ? "pos" : ""} />
          <KV k={t("scheda.redditoPassivo")} v={soldi(r.redditoPassivo)} forte colore="pos" />
          <KV k={t("scheda.redditoTotale")} v={soldi(r.redditoTotale)} forte />

          <div className="sezione-tit mt16">{t("scheda.uscite")}</div>
          {Object.entries(etichetteSpese).map(([k, et]) => (
            <KV key={k} k={et} v={soldi(g.spese[k])} />
          ))}
          <KV k={t("scheda.speseFigli", { n: g.figli })} v={soldi(r.speseFigli)} />
          <KV k={t("scheda.rataPrestito")} v={soldi(r.ratePrestito)} />
          <KV k={t("scheda.speseTotali")} v={soldi(r.speseTotali)} forte />

          <div className="carta mt16" style={{ background: "#EEF4EA", borderColor: "#C6DCBB" }}>
            <KV k={t("scheda.flussoMensile")} v={<Denaro v={r.flussoMensile} segno />} forte />
          </div>
        </>
      ))}

      {/* Stato patrimoniale */}
      {sezione("patrimonio", t("scheda.statoPatrimoniale"), (
        <>
          <div className="sezione-tit">{t("scheda.attivi")}</div>
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
          <KV k={t("scheda.valoreAttivi")} v={soldi(r.valoreAttivi)} forte />

          <div className="sezione-tit mt16">{t("scheda.passivita")}</div>
          {/* Dalle etichette del mercato, non da un elenco scritto a mano:
              quello era quello del mercato classico, e a Roma mostrava
              "Debiti negozi" — una categoria che a Roma non esiste — fissa
              a zero per tutta la partita. */}
          {Object.entries(etichettePassivita || {}).map(([k, et]) => (
            <KV key={k} k={et} v={soldi(g.passivita[k] || 0)} />
          ))}
          {g.immobili.map((i) => <KV key={i.rid} k={`Mutuo — ${i.nome}`} v={soldi(i.mutuo)} />)}
          {g.attivita.filter((a) => a.passivita > 0).map((a) => (
            <KV key={a.rid} k={`Debito — ${a.nome}`} v={soldi(a.passivita)} />
          ))}
          <KV k={t("scheda.passivitaTotali")} v={soldi(r.passivitaTotali)} forte />

          <div className="carta mt16" style={{ background: "#F2F0E6" }}>
            <KV k={t("scheda.patrimonioNetto")} v={soldi(g.contanti + r.valoreAttivi - r.passivitaTotali)} forte />
          </div>
        </>
      ))}

      {/* Banca — solo per la propria scheda */}
      {alLargo && (
        <>
          <div className="carta">
            <div className="sezione-tit">{t("scheda.ilTuoSogno")}</div>
            <div className="flex cen g12">
              <span style={{ fontSize: 30 }}>{sogno.emoji}</span>
              <div>
                <div className="grassetto f16">{sogno.nome}</div>
                <div className="f13 tenue numeri">
                  {soldi(sogno.costo * (1 + g.segnaliniSogno))}
                  {g.segnaliniSogno > 0 && " " + t("scheda.rincarato", { n: g.segnaliniSogno })}
                </div>
              </div>
            </div>
            <p className="f12 tenue mt12" style={{ margin: "12px 0 0", lineHeight: 1.5 }}>
              {t("scheda.sognoSpiegazione")}
            </p>
          </div>

          <div className="carta">
            <div className="sezione-tit">{t("scheda.affariAcquistati", { n: g.affariVeloci.length })}</div>
            {g.affariVeloci.length === 0 && (
              <p className="f13 tenue" style={{ margin: 0 }}>{t("scheda.nessunAffare")}</p>
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
      )}

      {mio && professionisti.length > 0 && sezione("professionisti", t("scheda.professionisti"), (
        <>
          <p className="f12 tenue" style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
            {t("scheda.professionistiSpiegazione")}
          </p>
          {professionisti.map((p) => {
            const assunto = (g.professionisti || []).some((x) => x.id === p.id);
            return (
              <div key={p.id} style={{ padding: "10px 0", borderTop: "1px dashed var(--linea)" }}>
                <div className="flex tra cen">
                  <div>
                    <div className="f14 grassetto">{p.nome}</div>
                    <div className="f12 tenue numeri">{soldi(p.costoMensile)}/{t("scheda.alMese")}</div>
                  </div>
                  <Bottone variante={assunto ? "btn-fantasma btn-piccolo" : "btn-blu btn-piccolo"}
                    style={{ width: "auto" }} disabled={inAzione}
                    onClick={() => fai({ tipo: "professionista", id: p.id })}>
                    {t(assunto ? "scheda.congeda" : "scheda.assumi")}
                  </Bottone>
                </div>
                <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
                  {t(`scheda.cosaFa_${p.id}`)}
                </p>
              </div>
            );
          })}
          {r.professionisti.costo > 0 && (
            <div className="carta mt12" style={{ background: "#F2F0E6", padding: 12 }}>
              <KV k={t("scheda.professionistiCosto")} v={soldi(r.professionisti.costo)} />
              <KV k={t("scheda.professionistiRisparmio")} v={soldi(r.professionisti.risparmio)} />
              <div className="flex tra f13 grassetto" style={{ borderTop: "1px dashed var(--linea)", paddingTop: 6, marginTop: 6 }}>
                <span>{t("scheda.professionistiNetto")}</span>
                {/* Il segno è quello del tuo flusso: meno se ti costano,
                    più se ti fanno guadagnare. */}
                <span className={`numeri ${r.professionisti.netto <= 0 ? "pos" : "neg"}`}>
                  {r.professionisti.netto <= 0 ? "+" : "−"}{soldi(Math.abs(r.professionisti.netto))}
                </span>
              </div>
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {t(r.professionisti.netto <= 0 ? "scheda.siRipagano" : "scheda.nonSiRipagano")}
              </p>
            </div>
          )}
        </>
      ))}

      {mio && sezione("banca", t("scheda.banca"), (
        <>
          <p className="f13 tenue" style={{ margin: "0 0 12px", lineHeight: 1.5 }}>
            {t("scheda.prestitoSpiegazione", {
              taglio: soldi(1000), rata: soldi(Math.round(1000 * (g.tassoPrestito ?? 0.1))),
            })}
            {t("scheda.quandoVuoi")}
          </p>
          <label className="etichetta">{t("scheda.importoPrestito")}</label>
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
            {t("scheda.costoPrestito", {
              rata: soldi(Math.round(prestito * (g.tassoPrestito ?? TASSO_PRESTITO))),
              flusso: soldi(r.flussoMensile - Math.round(prestito * (g.tassoPrestito ?? TASSO_PRESTITO))),
            })}
          </p>
          <Bottone variante="btn-blu" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: prestito })}>
            {t("scheda.chiedi", { importo: soldi(prestito) })}
          </Bottone>

          {g.passivita.prestitoBanca > 0 && (
            <Bottone variante="btn-fantasma mt8" disabled={inAzione || g.contanti < 1000}
              onClick={() => fai({
                tipo: "estingui", chiave: "prestitoBanca",
                importo: Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000),
              })}>
              {t("debito.rimborsa", { importo: soldi(Math.min(g.passivita.prestitoBanca, Math.floor(g.contanti / 1000) * 1000)) })}
            </Bottone>
          )}

          <div className="sezione-tit mt16">{t("scheda.estinguiUnDebito")}</div>
          <p className="f12 tenue" style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
            {t("scheda.estinguiSpiegazione")}
          </p>
          {debitiEstinguibili.filter((d) => g.passivita[d.chiave] > 0).map((d) => {
            const puoi = g.contanti >= g.passivita[d.chiave];
            return (
              <div key={d.chiave} className="flex tra cen" style={{ padding: "9px 0", borderTop: "1px dashed var(--linea)" }}>
                <div>
                  <div className="f14 grassetto">{d.nome}</div>
                  <div className="f12 tenue numeri">
                    {t("scheda.rataAlMese", { importo: soldi(g.passivita[d.chiave]), rata: soldi(g.spese[d.spesa]) })}
                  </div>
                </div>
                <Bottone variante="btn-fantasma btn-piccolo" disabled={inAzione || !puoi}
                  style={{ width: "auto" }}
                  onClick={() => fai({ tipo: "estingui", chiave: d.chiave })}>
                  {puoi ? t("scheda.estingui") : t("scheda.nonBasta")}
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
