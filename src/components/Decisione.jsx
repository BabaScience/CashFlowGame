import React, { useMemo, useState } from "react";
import { Foglio, Bottone, Denaro } from "./Base.jsx";
import CartaGioco, { CorpoAffare, Voce } from "./CartaGioco.jsx";
import { soldi, flussoMensile, riepilogo } from "../game/finanze.js";
import { useMercato } from "../Mercato.jsx";
import { useLingua } from "../Lingua.jsx";
import { nomiCaselle } from "../i18n/index.js";
import { TASSO_PRESTITO } from "../game/finanze.js";

/**
 * Tutte le decisioni del gioco passano da qui.
 * Il pannello si apre solo per chi deve davvero decidere: gli altri
 * vedono la stessa carta nel riquadro "sul tavolo" della schermata di gioco.
 */
export default function Decisione({ stato, mioId, invia, inAzione }) {
  const { t, lingua } = useLingua();
  /* "Verifica fiscale" arriva dal motore, che parla italiano: il titolo
     della carta è l'unica cosa che il giocatore legge, e restava lì. */
  const nomeCasella = (n) => nomiCaselle(lingua)[n] || n;
  /* Il tasso del fido viaggia col giocatore, come lo stipendio: scriverlo a
     mano significava mostrare il tasso di un altro mercato. */
  const rataDi = (importo) => Math.round(importo * (io?.tassoPrestito ?? TASSO_PRESTITO));
  const { categorie, debitiEstinguibili, pacchetto, flussoDi, traduciCarta, trovaSogno } = useMercato();
  /* Le due taglie non sono separate da una soglia netta: su Roma i mazzi
     si sovrappongono nei prezzi e si distinguono per tipo, non per cifra.
     Annunciare una soglia produceva una frase falsa ("i piccoli costano al
     massimo 137.500, i grandi partono da 34.000"). Si mostra invece
     l'anticipo tipico, che è la cosa che serve a decidere. */
  const mediana = (a) => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
  const tipicoPiccoli = mediana(pacchetto.mazzi.piccoli.filter((c) => c.acconto).map((c) => c.acconto));
  const tipicoGrandi = mediana(pacchetto.mazzi.grandi.filter((c) => c.acconto).map((c) => c.acconto));
  const p = stato.pending;
  const io = stato.giocatori.find((g) => g.id === mioId);
  const [quantita, setQuantita] = useState("");
  const [errore, setErrore] = useState("");

  const chiave = p ? `${p.tipo}-${stato.versione}` : "vuoto";

  const tocca = useMemo(() => {
    if (!p || !io) return false;
    if (p.tipo === "mercato") {
      return p.idonei.includes(mioId) && !p.risposto.includes(mioId);
    }
    return p.giocatoreId === mioId;
  }, [p, io, mioId]);

  if (!p || !io || !tocca) return null;

  const fai = async (az) => {
    setErrore("");
    const r = await invia(az);
    if (r.errore) setErrore(r.errore);
    else setQuantita("");
  };

  /* ── Opportunità: scelta della taglia ── */
  if (p.tipo === "sceltaTaglia") {
    return (
      <Foglio aperto>
        <div className="maiusc tenue mb8">{t("decisione.opportunita")}</div>
        <h3 className="titolo f22 mb12" style={{ margin: "0 0 12px" }}>{t("decisione.cheAffare")}</h3>
        <p className="f14 tenue mb16" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
          {/* Le soglie sono in valuta del mercato: scritte a mano restavano
              in dollari dentro una partita in euro. */}
          {t("decisione.taglieSpiegazione", {
            piccolo: soldi(tipicoPiccoli), grande: soldi(tipicoGrandi),
          })}
        </p>
        <div className="riga-btn">
          <Bottone variante="btn-verde" disabled={inAzione}
            onClick={() => fai({ tipo: "scegliTaglia", taglia: "piccoli" })}>
            {t("decisione.piccoloAffare")}
          </Bottone>
          <Bottone variante="btn-blu" disabled={inAzione}
            onClick={() => fai({ tipo: "scegliTaglia", taglia: "grandi" })}>
            {t("decisione.grandeAffare")}
          </Bottone>
        </div>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Carta Opportunità pescata ── */
  if (p.tipo === "carta") {
    const c = traduciCarta(p.carta);
    const azione = c.tipo === "azione";
    const q = Math.max(0, Math.floor(Number(quantita) || 0));
    const costo = azione ? q * c.prezzo : (c.acconto ?? c.importo ?? 0);
    const maxQ = azione ? Math.floor(io.contanti / c.prezzo) : 0;
    const puoi = azione ? q > 0 && costo <= io.contanti : io.contanti >= (c.acconto ?? 0);
    const mancano = Math.max(0, (c.acconto ?? 0) - io.contanti);
    const prestitoUtile = Math.ceil(mancano / 1000) * 1000;

    return (
      <Foglio aperto>
        <CartaGioco
          chiave={chiave}
          classe={p.taglia === "grandi" ? "c-grandi" : "c-piccoli"}
          etichetta={t(p.taglia === "grandi" ? "decisione.grandeAffare" : "decisione.piccoloAffare")}
          titolo={c.nome}
        >
          <CorpoAffare carta={c} />
        </CartaGioco>

        <div className="flex tra f13 mb12">
          <span className="tenue">{t("decisione.iTuoiContanti")}</span>
          <span className="numeri grassetto">{soldi(io.contanti)}</span>
        </div>

        {azione && (
          <div className="mb12">
            <label className="etichetta" htmlFor="campo-quantita">{t("decisione.quanteAzioni")}</label>
            <div className="flex g8">
              <input
                id="campo-quantita"
                className="campo" type="number" inputMode="numeric" min="0" max={maxQ}
                value={quantita} onChange={(e) => setQuantita(e.target.value)}
                placeholder="0" style={{ flex: 1 }}
              />
              <Bottone variante="btn-fantasma btn-piccolo" style={{ height: 50, width: "auto" }}
                onClick={() => setQuantita(String(maxQ))}>
                {t("decisione.max", { n: maxQ })}
              </Bottone>
            </div>
            {q > 0 && (
              <p className="f13 tenue mt8" style={{ margin: "8px 0 0" }}>
                {t("decisione.costoRiga", { importo: soldi(costo) })}
                {c.dividendo > 0 && <> · {t("decisione.dividendoAlMese", { importo: `+${soldi(q * c.dividendo)}` })}</>}
              </p>
            )}
          </div>
        )}

        {!azione && c.tipo !== "spesa" && mancano > 0 && prestitoUtile <= 200000 && (
          <div className="carta mb12" style={{ background: "#FBF4E4", borderColor: "#E4CE8F" }}>
            <p className="f13" style={{ margin: 0, lineHeight: 1.5 }}>
              {t("decisione.tiMancanoPrestito", {
                importo: soldi(mancano), prestito: soldi(prestitoUtile), rata: soldi(rataDi(prestitoUtile)),
              })}
              {flussoDi(c) > 0 && (
                <> {t("decisione.controUnFlusso")} <strong className="numeri">+{soldi(flussoDi(c))}</strong>
                  {t(flussoDi(c) > rataDi(prestitoUtile) ? "decisione.conviene" : "decisione.nonConviene")}</>
              )}
            </p>
            <Bottone variante="btn-fantasma btn-piccolo pieno mt12" disabled={inAzione}
              onClick={() => fai({ tipo: "prestito", importo: prestitoUtile })}>
              {t("decisione.chiediAllaBanca", { importo: soldi(prestitoUtile) })}
            </Bottone>
          </div>
        )}

        {c.tipo === "spesa" ? (
          <Bottone variante={c.opzionale ? "btn-fantasma" : "btn-rosso"} disabled={inAzione}
            onClick={() => fai({ tipo: c.opzionale ? "passaCarta" : "compraCarta" })}>
            {c.opzionale ? t("decisione.rifiuta") : t("decisione.paga", { importo: soldi(c.importo) })}
          </Bottone>
        ) : (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "passaCarta" })}>
              {t("decisione.lasciaPerdere")}
            </Bottone>
            <Bottone variante="btn-verde" disabled={inAzione || !puoi}
              onClick={() => fai({ tipo: "compraCarta", quantita: q })}>
              {puoi ? t("decisione.compra", { importo: soldi(costo) }) : t("decisione.contantiInsufficienti")}
            </Bottone>
          </div>
        )}
        {c.opzionale && c.tipo === "spesa" && (
          <Bottone variante="btn-fantasma mt8" disabled={inAzione}
            onClick={() => fai({ tipo: "compraCarta" })}>
            {t("decisione.prestaComunque", { importo: soldi(c.importo) })}
          </Bottone>
        )}
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Il Mercato: possono rispondere più giocatori ── */
  if (p.tipo === "mercato") {
    const c = traduciCarta(p.carta);
    let vendibili = [];
    if (c.tipo === "offerta") {
      vendibili = c.categoria === "attivita"
        ? io.attivita.map((a) => ({
            rid: a.rid, nome: a.nome,
            prezzo: c.moltiplicatore ? Math.round(a.costo * c.moltiplicatore) : c.prezzo,
            debito: a.passivita || 0, flusso: a.flusso,
          }))
        : io.immobili.filter((i) => i.categoria === c.categoria).map((i) => ({
            rid: i.rid, nome: i.nome,
            prezzo: c.moltiplicatore ? Math.round(i.costo * c.moltiplicatore) : c.prezzo,
            debito: i.mutuo, flusso: i.flusso,
          }));
    }
    const titolo = c.tipo === "prezzo" ? io.azioni.find((a) => a.simbolo === c.simbolo) : null;

    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-mercato" etichetta={t("decisione.ilMercato")} titolo={c.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{c.testo}</p>
          {c.tipo === "offerta" && (
            <div className="mt12">
              <Voce k={t("decisione.cercano")} v={categorie[c.categoria] || c.categoria} />
              <Voce k={t("decisione.offerta")} v={c.moltiplicatore
                ? t("decisione.percentualeDelCosto", { n: Math.round(c.moltiplicatore * 100) })
                : soldi(c.prezzo)} />
            </div>
          )}
          {c.tipo === "prezzo" && (
            <div className="mt12">
              <Voce k={t("decisione.titoloAzionario")} v={c.simbolo} />
              <Voce k={t("decisione.prezzoDiVendita")} v={soldi(c.prezzo)} forte />
            </div>
          )}
        </CartaGioco>

        {c.tipo === "offerta" && vendibili.length > 0 && (
          <>
            <div className="sezione-tit">{t("decisione.puoiVendere")}</div>
            {vendibili.map((v) => (
              <div key={v.rid} className="carta mb8" style={{ padding: 12 }}>
                <div className="grassetto f14 mb4">{v.nome}</div>
                <div className="f12 tenue mb8">
                  {t("decisione.prezzoMenoDebito", {
                    prezzo: soldi(v.prezzo), debito: soldi(v.debito),
                    netto: soldi(v.prezzo - v.debito), flusso: soldi(v.flusso),
                  })}
                </div>
                <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
                  onClick={() => fai({ tipo: "vendiAlMercato", rid: v.rid, ultima: true })}>
                  {t("decisione.vendi", { importo: soldi(v.prezzo - v.debito) })}
                </Bottone>
              </div>
            ))}
          </>
        )}

        {c.tipo === "prezzo" && titolo && (
          <div className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{titolo.quantita} × {titolo.simbolo}</div>
            <div className="f12 tenue mb8">
              {t("decisione.azioniRiepilogo", {
                prezzo: soldi(titolo.prezzoAcquisto), oggi: soldi(c.prezzo),
                totale: soldi(titolo.quantita * c.prezzo),
              })}
              {" "}({t(titolo.quantita * (c.prezzo - titolo.prezzoAcquisto) >= 0 ? "decisione.guadagno" : "decisione.perdita")}
              {" "}<Denaro v={titolo.quantita * (c.prezzo - titolo.prezzoAcquisto)} segno />).
            </div>
            <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiAlMercato", quantita: titolo.quantita, ultima: true })}>
              {t("decisione.vendiTutto", { importo: soldi(titolo.quantita * c.prezzo) })}
            </Bottone>
          </div>
        )}

        <Bottone variante="btn-fantasma mt8" disabled={inAzione}
          onClick={() => fai({ tipo: "passaMercato" })}>
          {t(vendibili.length || titolo ? "decisione.nonVendoNiente" : "decisione.hoCapito")}
        </Bottone>

        <p className="f12 tenue ta-c mt12" style={{ margin: "12px 0 0" }}>
          {p.idonei.length - p.risposto.length === 1
            ? t("decisione.inAttesaUno")
            : t("decisione.inAttesaMolti", { n: p.idonei.length - p.risposto.length })}
        </p>
        {errore && <p className="f13 neg mt8" style={{ margin: "8px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Spesa Extra ── */
  if (p.tipo === "extra") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-extra" etichetta={t("decisione.spesaExtra")} titolo={traduciCarta(p.carta).nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{traduciCarta(p.carta).testo}</p>
          <div className="mt12">
            <Voce k={t("decisione.daPagare")} v={soldi(p.importo)} forte />
          </div>
          {p.importo === 0 && (
            <p className="f12 tenue mt8" style={{ margin: "8px 0 0" }}>
              {t("decisione.nonHaiFigli")}
            </p>
          )}
        </CartaGioco>
        <p className="f13 tenue mb12" style={{ margin: "0 0 12px" }}>
          {t("decisione.extraObbligatorie")}
        </p>
        {p.importo > io.contanti && (
          <Bottone variante="btn-fantasma mb8" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: Math.ceil((p.importo - io.contanti) / 1000) * 1000 })}>
            {t("decisione.chiediAllaBanca", { importo: soldi(Math.ceil((p.importo - io.contanti) / 1000) * 1000) })}
          </Bottone>
        )}
        <Bottone variante="btn-rosso" disabled={inAzione} onClick={() => fai({ tipo: "confermaExtra" })}>
          {p.importo > 0 ? t("decisione.paga", { importo: soldi(p.importo) }) : t("comune.avanti")}
        </Bottone>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Beneficenza (Ruota) ── */
  if (p.tipo === "beneficenza") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-benef" etichetta={t("decisione.beneficenza")} titolo={t("decisione.vuoiDonare")}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {t("decisione.beneficenzaSpiegazione")}
          </p>
          <div className="mt12"><Voce k={t("decisione.costoDonazione")} v={soldi(p.costo)} forte /></div>
        </CartaGioco>
        <div className="riga-btn">
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "beneficenza", accetta: false })}>
            {t("decisione.noGrazie")}
          </Bottone>
          <Bottone variante="btn-oro" disabled={inAzione || io.contanti < p.costo}
            onClick={() => fai({ tipo: "beneficenza", accetta: true })}>
            {t("decisione.dona", { importo: soldi(p.costo) })}
          </Bottone>
        </div>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Un figlio ── */
  if (p.tipo === "figlio") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-figlio" etichetta={t("decisione.famiglia")}
          titolo={t(p.nuovo ? "decisione.eNatoUnFiglio" : "decisione.giaTreFigli")}>
          {p.nuovo ? (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                {t("decisione.figlioSpiegazione")}
              </p>
              <div className="mt12">
                <Voce k={t("decisione.spesaPerFiglio")}
                  v={t("decisione.perFiglioAlMese", { importo: soldi(io.perFiglio) })} forte />
                <Voce k={t("decisione.figliDopoQuesto")} v={String(io.figli + 1)} />
              </div>
            </>
          ) : (
            <p className="f14" style={{ margin: 0 }}>{t("decisione.fermaATreFigli")}</p>
          )}
        </CartaGioco>
        <Bottone variante="btn-verde" disabled={inAzione} onClick={() => fai({ tipo: "confermaFiglio" })}>
          {t("comune.avanti")}
        </Bottone>
      </Foglio>
    );
  }

  /* ── Licenziamento ── */
  if (p.tipo === "licenziamento") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-licenz" etichetta={t("decisione.imprevisto")} titolo={t("decisione.seiLicenziato")}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {t("decisione.licenziamentoSpiegazione")}
          </p>
          <div className="mt12">
            <Voce k={t("decisione.daPagareSubito")} v={soldi(p.costo)} forte />
            <Voce k={t("decisione.turniPersi")} v="2" />
          </div>
        </CartaGioco>
        {p.costo > io.contanti && (
          <Bottone variante="btn-fantasma mb8" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: Math.ceil((p.costo - io.contanti) / 1000) * 1000 })}>
            {t("decisione.chiediAllaBanca", { importo: soldi(Math.ceil((p.costo - io.contanti) / 1000) * 1000) })}
          </Bottone>
        )}
        <Bottone variante="btn-rosso" disabled={inAzione} onClick={() => fai({ tipo: "confermaLicenziamento" })}>
          {t("decisione.paga", { importo: soldi(p.costo) })}
        </Bottone>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Bancarotta ── */
  if (p.tipo === "bancarotta") {
    const r = riepilogo(io);
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-banca" etichetta={t("decisione.bancarotta")} titolo={t("decisione.flussoNegativo")}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>{p.testo}</p>
          <div className="mt12">
            <Voce k={t("scheda.flussoMensileBreve")} v={soldi(r.flussoMensile)} forte />
            <Voce k={t("scheda.contanti")} v={soldi(io.contanti)} />
          </div>
        </CartaGioco>

        {io.passivita.prestitoBanca >= 1000 && io.contanti >= 1000 && (
          <div className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{t("decisione.rimborsaPrestito")}</div>
            <div className="f12 tenue mb8">
              {t("decisione.rimborsoSpiegazione", {
                debito: soldi(io.passivita.prestitoBanca),
                taglio: soldi(1000),
                rata: soldi(Math.round(1000 * (io.tassoPrestito ?? 0.1))),
              })}
            </div>
            <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({
                tipo: "vendiPerBancarotta", categoria: "prestito",
                importo: Math.min(io.passivita.prestitoBanca, Math.floor(io.contanti / 1000) * 1000),
              })}>
              {t("decisione.rimborsa", { importo: soldi(Math.min(io.passivita.prestitoBanca, Math.floor(io.contanti / 1000) * 1000)) })}
            </Bottone>
          </div>
        )}

        {[...io.immobili.map((i) => ({ ...i, cat: "immobile" })),
          ...io.attivita.map((a) => ({ ...a, cat: "attivita" }))].map((a) => (
          <div key={a.rid} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{a.nome}</div>
            <div className="f12 tenue mb8">
              {t("decisione.svenditaAllaBanca", {
                importo: soldi(Math.floor(a.acconto / 2)), flusso: soldi(a.flusso),
              })}
            </div>
            <Bottone variante="btn-rosso btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: a.cat, rid: a.rid })}>
              {t("decisione.svendi", { importo: soldi(Math.floor(a.acconto / 2)) })}
            </Bottone>
          </div>
        ))}

        {io.azioni.map((a) => (
          <div key={a.simbolo} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{a.quantita} × {a.simbolo}</div>
            <Bottone variante="btn-rosso btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: "azione", simbolo: a.simbolo })}>
              {t("decisione.liquida", { importo: soldi(Math.floor((a.quantita * a.prezzoAcquisto) / 2)) })}
            </Bottone>
          </div>
        ))}

        {debitiEstinguibili.filter((d) => io.passivita[d.chiave] > 0 && io.contanti >= io.passivita[d.chiave]).map((d) => (
          <div key={d.chiave} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{t("decisione.estinguiNome", { nome: d.nome })}</div>
            <div className="f12 tenue mb8">
              {t("decisione.estinguiSpesa", {
                importo: soldi(io.passivita[d.chiave]), rata: soldi(io.spese[d.spesa]),
              })}
            </div>
            <Bottone variante="btn-verde btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: "debito", chiave: d.chiave })}>
              {t("decisione.estingui")}
            </Bottone>
          </div>
        ))}

        <Bottone variante={r.flussoMensile >= 0 ? "btn-verde" : "btn-rosso"} className="mt8" disabled={inAzione}
          onClick={() => fai({ tipo: "concludiBancarotta" })}>
          {t(r.flussoMensile >= 0 ? "decisione.hoRisanato" : "decisione.nonPossoFareAltro")}
        </Bottone>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Largo: affare ── */
  if (p.tipo === "affareVeloce") {
    const a = traduciCarta(p.affare);
    const nuovo = io.redditoRendita + a.flusso;
    const obiettivo = io.redditoInizialeVeloce + 50000;
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-veloce" etichetta={t("decisione.affareLargo")} titolo={a.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{a.testo}</p>
          <div className="mt12">
            <Voce k={t("decisione.acconto")} v={soldi(a.acconto)} />
            <Voce k={t("scheda.flussoMensileBreve")} v={`+${soldi(a.flusso)}`} forte />
            <Voce k={t("decisione.flussoDiventerebbe")} v={soldi(nuovo)} />
            <Voce k={t("scheda.obiettivoVincere")} v={soldi(obiettivo)} />
          </div>
          {nuovo >= obiettivo && (
            <p className="f13 grassetto mt12" style={{ margin: "12px 0 0", color: "var(--verde)" }}>
              {t("decisione.vinciComprando")}
            </p>
          )}
        </CartaGioco>
        <div className="flex tra f13 mb12">
          <span className="tenue">{t("decisione.iTuoiContanti")}</span>
          <span className="numeri grassetto">{soldi(io.contanti)}</span>
        </div>
        <div className="riga-btn">
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "passaAffareVeloce" })}>{t("decisione.lasciaPerdere")}</Bottone>
          <Bottone variante="btn-oro" disabled={inAzione || io.contanti < a.acconto}
            onClick={() => fai({ tipo: "compraAffareVeloce" })}>
            {io.contanti >= a.acconto ? t("decisione.compra", { importo: soldi(a.acconto) }) : t("decisione.contantiInsufficienti")}
          </Bottone>
        </div>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Largo: sogno ── */
  if (p.tipo === "sogno") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-sogno"
          etichetta={t(p.mio ? "decisione.ilTuoSogno" : "decisione.sognoDiUnAltro")}
          titolo={`${p.sogno.emoji || "★"} ${(trovaSogno(p.sogno.id) || p.sogno).nome}`}>
          {p.mio ? (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                {t("decisione.sognoMioSpiegazione")}
              </p>
              <div className="mt12">
                <Voce k={t("decisione.costoDiListino")} v={soldi(p.sogno.costo)} />
                {io.segnaliniSogno > 0 && (
                  <Voce k={io.segnaliniSogno === 1
                    ? t("decisione.rincaroUno")
                    : t("decisione.rincaroMolti", { n: io.segnaliniSogno })}
                    v={`+${soldi(p.sogno.costo * io.segnaliniSogno)}`} />
                )}
                <Voce k={t("decisione.daPagare")} v={soldi(p.costo)} forte />
              </div>
            </>
          ) : (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                {t("decisione.sognoAltruiSpiegazione")}
                {p.vittime?.length > 0 && t("decisione.sognoRaddoppiato", { nomi: p.vittime.join(", ") })}
              </p>
            </>
          )}
        </CartaGioco>
        {p.mio ? (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "passaSogno" })}>{t("decisione.nonOra")}</Bottone>
            <Bottone variante="btn-oro" disabled={inAzione || io.contanti < p.costo}
              onClick={() => fai({ tipo: "compraSogno" })}>
              {io.contanti >= p.costo
                ? t("decisione.realizzaSogno", { importo: soldi(p.costo) })
                : t("decisione.tiMancanoImporto", { importo: soldi(p.costo - io.contanti) })}
            </Bottone>
          </div>
        ) : (
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "passaSogno" })}>{t("comune.avanti")}</Bottone>
        )}
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Largo: beneficenza ── */
  if (p.tipo === "beneficenzaVeloce") {
    const costo = Math.round(io.redditoRendita * 0.1);
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-benef" etichetta={t("decisione.beneficenzaLargo")}
          titolo={t(p.gia ? "decisione.haiGiaDonato" : "decisione.vuoiDonare")}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {t(p.gia ? "decisione.beneficenzaVeloceGia" : "decisione.beneficenzaVeloceSpiegazione")}
          </p>
          {!p.gia && <div className="mt12"><Voce k={t("decisione.costo")} v={soldi(costo)} forte /></div>}
        </CartaGioco>
        {p.gia ? (
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: false })}>{t("comune.avanti")}</Bottone>
        ) : (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: false })}>{t("decisione.noGrazie")}</Bottone>
            <Bottone variante="btn-oro" disabled={inAzione || io.contanti < costo}
              onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: true })}>{t("decisione.dona", { importo: soldi(costo) })}</Bottone>
          </div>
        )}
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Largo: penalità ── */
  if (p.tipo === "penalitaVeloce") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-extra" etichetta={t("decisione.imprevisto")} titolo={nomeCasella(p.nome)}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {t(p.nome === "Divorzio" ? "decisione.divorzioTesto" : "decisione.penalitaTesto")}
          </p>
          <div className="mt12">
            <Voce k={t("decisione.perso")} v={soldi(p.perso)} forte />
            <Voce k={t("decisione.tiRestano")} v={soldi(io.contanti)} />
          </div>
        </CartaGioco>
        <Bottone variante="btn-fantasma" disabled={inAzione} onClick={() => fai({ tipo: "confermaPenalita" })}>
          {t("comune.avanti")}
        </Bottone>
      </Foglio>
    );
  }

  return null;
}
