import React, { useMemo, useState } from "react";
import { Foglio, Bottone, Denaro } from "./Base.jsx";
import CartaGioco, { CorpoAffare, Voce } from "./CartaGioco.jsx";
import { soldi, flussoMensile, riepilogo } from "../game/finanze.js";
import { useMercato } from "../Mercato.jsx";

/**
 * Tutte le decisioni del gioco passano da qui.
 * Il pannello si apre solo per chi deve davvero decidere: gli altri
 * vedono la stessa carta nel riquadro "sul tavolo" della schermata di gioco.
 */
export default function Decisione({ stato, mioId, invia, inAzione }) {
  const { categorie, debitiEstinguibili } = useMercato();
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
        <div className="maiusc tenue mb8">Opportunità</div>
        <h3 className="titolo f22 mb12" style={{ margin: "0 0 12px" }}>Che affare vuoi guardare?</h3>
        <p className="f14 tenue mb16" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
          I Piccoli Affari costano al massimo $5.000 di entrata: titoli, case singole,
          piccole attività. I Grandi Affari partono da $6.000 e comprendono palazzine
          e aziende avviate.
        </p>
        <div className="riga-btn">
          <Bottone variante="btn-verde" disabled={inAzione}
            onClick={() => fai({ tipo: "scegliTaglia", taglia: "piccoli" })}>
            Piccolo affare
          </Bottone>
          <Bottone variante="btn-blu" disabled={inAzione}
            onClick={() => fai({ tipo: "scegliTaglia", taglia: "grandi" })}>
            Grande affare
          </Bottone>
        </div>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Carta Opportunità pescata ── */
  if (p.tipo === "carta") {
    const c = p.carta;
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
          etichetta={p.taglia === "grandi" ? "Grande affare" : "Piccolo affare"}
          titolo={c.nome}
        >
          <CorpoAffare carta={c} />
        </CartaGioco>

        <div className="flex tra f13 mb12">
          <span className="tenue">I tuoi contanti</span>
          <span className="numeri grassetto">{soldi(io.contanti)}</span>
        </div>

        {azione && (
          <div className="mb12">
            <label className="etichetta" htmlFor="campo-quantita">Quante azioni?</label>
            <div className="flex g8">
              <input
                id="campo-quantita"
                className="campo" type="number" inputMode="numeric" min="0" max={maxQ}
                value={quantita} onChange={(e) => setQuantita(e.target.value)}
                placeholder="0" style={{ flex: 1 }}
              />
              <Bottone variante="btn-fantasma btn-piccolo" style={{ height: 50, width: "auto" }}
                onClick={() => setQuantita(String(maxQ))}>
                Max {maxQ}
              </Bottone>
            </div>
            {q > 0 && (
              <p className="f13 tenue mt8" style={{ margin: "8px 0 0" }}>
                Costo: <strong className="numeri">{soldi(costo)}</strong>
                {c.dividendo > 0 && <> · dividendo <strong className="numeri">+{soldi(q * c.dividendo)}</strong>/mese</>}
              </p>
            )}
          </div>
        )}

        {!azione && c.tipo !== "spesa" && mancano > 0 && prestitoUtile <= 200000 && (
          <div className="carta mb12" style={{ background: "#FBF4E4", borderColor: "#E4CE8F" }}>
            <p className="f13" style={{ margin: 0, lineHeight: 1.5 }}>
              Ti mancano <strong className="numeri">{soldi(mancano)}</strong>.
              Puoi chiedere un prestito di <strong className="numeri">{soldi(prestitoUtile)}</strong>:
              costerebbe <strong className="numeri">{soldi(prestitoUtile / 10)}</strong> al mese
              {c.flusso > 0 && (
                <> contro un flusso di <strong className="numeri">+{soldi(c.flusso)}</strong>
                  {c.flusso > prestitoUtile / 10 ? " — conviene." : " — non conviene."}</>
              )}
            </p>
            <Bottone variante="btn-fantasma btn-piccolo pieno mt12" disabled={inAzione}
              onClick={() => fai({ tipo: "prestito", importo: prestitoUtile })}>
              Chiedi {soldi(prestitoUtile)} alla banca
            </Bottone>
          </div>
        )}

        {c.tipo === "spesa" ? (
          <Bottone variante={c.opzionale ? "btn-fantasma" : "btn-rosso"} disabled={inAzione}
            onClick={() => fai({ tipo: c.opzionale ? "passaCarta" : "compraCarta" })}>
            {c.opzionale ? "Rifiuta" : `Paga ${soldi(c.importo)}`}
          </Bottone>
        ) : (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "passaCarta" })}>
              Lascia perdere
            </Bottone>
            <Bottone variante="btn-verde" disabled={inAzione || !puoi}
              onClick={() => fai({ tipo: "compraCarta", quantita: q })}>
              {puoi ? `Compra · ${soldi(costo)}` : "Contanti insufficienti"}
            </Bottone>
          </div>
        )}
        {c.opzionale && c.tipo === "spesa" && (
          <Bottone variante="btn-fantasma mt8" disabled={inAzione}
            onClick={() => fai({ tipo: "compraCarta" })}>
            Presta comunque {soldi(c.importo)}
          </Bottone>
        )}
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Il Mercato: possono rispondere più giocatori ── */
  if (p.tipo === "mercato") {
    const c = p.carta;
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
        <CartaGioco chiave={chiave} classe="c-mercato" etichetta="Il Mercato" titolo={c.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{c.testo}</p>
          {c.tipo === "offerta" && (
            <div className="mt12">
              <Voce k="Cercano" v={categorie[c.categoria] || c.categoria} />
              <Voce k="Offerta" v={c.moltiplicatore ? `${Math.round(c.moltiplicatore * 100)}% del costo` : soldi(c.prezzo)} />
            </div>
          )}
          {c.tipo === "prezzo" && (
            <div className="mt12">
              <Voce k="Titolo" v={c.simbolo} />
              <Voce k="Prezzo di vendita" v={soldi(c.prezzo)} forte />
            </div>
          )}
        </CartaGioco>

        {c.tipo === "offerta" && vendibili.length > 0 && (
          <>
            <div className="sezione-tit">Puoi vendere</div>
            {vendibili.map((v) => (
              <div key={v.rid} className="carta mb8" style={{ padding: 12 }}>
                <div className="grassetto f14 mb4">{v.nome}</div>
                <div className="f12 tenue mb8">
                  Prezzo {soldi(v.prezzo)} − debito {soldi(v.debito)} =
                  <strong className="numeri"> {soldi(v.prezzo - v.debito)}</strong> in contanti,
                  perdi {soldi(v.flusso)}/mese di flusso.
                </div>
                <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
                  onClick={() => fai({ tipo: "vendiAlMercato", rid: v.rid, ultima: true })}>
                  Vendi · +{soldi(v.prezzo - v.debito)}
                </Bottone>
              </div>
            ))}
          </>
        )}

        {c.tipo === "prezzo" && titolo && (
          <div className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{titolo.quantita} × {titolo.simbolo}</div>
            <div className="f12 tenue mb8">
              Comprate a {soldi(titolo.prezzoAcquisto)} · oggi valgono {soldi(c.prezzo)} ciascuna.
              Vendendo tutto incassi <strong className="numeri">{soldi(titolo.quantita * c.prezzo)}</strong>
              {" "}({titolo.quantita * (c.prezzo - titolo.prezzoAcquisto) >= 0 ? "guadagno" : "perdita"}
              {" "}<Denaro v={titolo.quantita * (c.prezzo - titolo.prezzoAcquisto)} segno />).
            </div>
            <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiAlMercato", quantita: titolo.quantita, ultima: true })}>
              Vendi tutto · +{soldi(titolo.quantita * c.prezzo)}
            </Bottone>
          </div>
        )}

        <Bottone variante="btn-fantasma mt8" disabled={inAzione}
          onClick={() => fai({ tipo: "passaMercato" })}>
          {vendibili.length || titolo ? "Non vendo niente" : "Ho capito"}
        </Bottone>

        <p className="f12 tenue ta-c mt12" style={{ margin: "12px 0 0" }}>
          In attesa di {p.idonei.length - p.risposto.length} giocator
          {p.idonei.length - p.risposto.length === 1 ? "e" : "i"}.
        </p>
        {errore && <p className="f13 neg mt8" style={{ margin: "8px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Spesa Extra ── */
  if (p.tipo === "extra") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-extra" etichetta="Spesa Extra" titolo={p.carta.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{p.carta.testo}</p>
          <div className="mt12">
            <Voce k="Da pagare" v={soldi(p.importo)} forte />
          </div>
          {p.importo === 0 && (
            <p className="f12 tenue mt8" style={{ margin: "8px 0 0" }}>
              Non hai figli: questa spesa non ti tocca.
            </p>
          )}
        </CartaGioco>
        <p className="f13 tenue mb12" style={{ margin: "0 0 12px" }}>
          Le Spese Extra sono obbligatorie. Se non hai contanti puoi chiedere un prestito.
        </p>
        {p.importo > io.contanti && (
          <Bottone variante="btn-fantasma mb8" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: Math.ceil((p.importo - io.contanti) / 1000) * 1000 })}>
            Chiedi {soldi(Math.ceil((p.importo - io.contanti) / 1000) * 1000)} alla banca
          </Bottone>
        )}
        <Bottone variante="btn-rosso" disabled={inAzione} onClick={() => fai({ tipo: "confermaExtra" })}>
          {p.importo > 0 ? `Paga ${soldi(p.importo)}` : "Avanti"}
        </Bottone>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Beneficenza (Ruota) ── */
  if (p.tipo === "beneficenza") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-benef" etichetta="Beneficenza" titolo="Vuoi donare?">
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            Donando il 10% del tuo reddito totale potrai tirare <strong>2 dadi</strong> invece
            di uno per i prossimi <strong>3 turni</strong>: ti muovi di più e incontri più opportunità.
          </p>
          <div className="mt12"><Voce k="Costo della donazione" v={soldi(p.costo)} forte /></div>
        </CartaGioco>
        <div className="riga-btn">
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "beneficenza", accetta: false })}>
            No, grazie
          </Bottone>
          <Bottone variante="btn-oro" disabled={inAzione || io.contanti < p.costo}
            onClick={() => fai({ tipo: "beneficenza", accetta: true })}>
            Dona {soldi(p.costo)}
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
        <CartaGioco chiave={chiave} classe="c-figlio" etichetta="Famiglia"
          titolo={p.nuovo ? "È nato un figlio!" : "Hai già tre figli"}>
          {p.nuovo ? (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                Le spese mensili aumentano. Non è una punizione: è la vita che continua
                mentre costruisci il tuo reddito passivo.
              </p>
              <div className="mt12">
                <Voce k="Spesa per figlio" v={`+${soldi(io.perFiglio)} / mese`} forte />
                <Voce k="Figli dopo questo" v={String(io.figli + 1)} />
              </div>
            </>
          ) : (
            <p className="f14" style={{ margin: 0 }}>Il regolamento ferma a tre figli. Nessun cambiamento.</p>
          )}
        </CartaGioco>
        <Bottone variante="btn-verde" disabled={inAzione} onClick={() => fai({ tipo: "confermaFiglio" })}>
          Avanti
        </Bottone>
      </Foglio>
    );
  }

  /* ── Licenziamento ── */
  if (p.tipo === "licenziamento") {
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-licenz" etichetta="Imprevisto" titolo="Sei stato licenziato">
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            Hai perso temporaneamente il lavoro. Le spese però continuano: paghi
            l'equivalente di un mese intero e salti due turni.
          </p>
          <div className="mt12">
            <Voce k="Da pagare subito" v={soldi(p.costo)} forte />
            <Voce k="Turni persi" v="2" />
          </div>
        </CartaGioco>
        {p.costo > io.contanti && (
          <Bottone variante="btn-fantasma mb8" disabled={inAzione}
            onClick={() => fai({ tipo: "prestito", importo: Math.ceil((p.costo - io.contanti) / 1000) * 1000 })}>
            Chiedi {soldi(Math.ceil((p.costo - io.contanti) / 1000) * 1000)} alla banca
          </Bottone>
        )}
        <Bottone variante="btn-rosso" disabled={inAzione} onClick={() => fai({ tipo: "confermaLicenziamento" })}>
          Paga {soldi(p.costo)}
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
        <CartaGioco chiave={chiave} classe="c-banca" etichetta="Bancarotta" titolo="Il flusso è negativo">
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>{p.testo}</p>
          <div className="mt12">
            <Voce k="Flusso mensile" v={soldi(r.flussoMensile)} forte />
            <Voce k="Contanti" v={soldi(io.contanti)} />
          </div>
        </CartaGioco>

        {io.passivita.prestitoBanca >= 1000 && io.contanti >= 1000 && (
          <div className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">Rimborsa il prestito bancario</div>
            <div className="f12 tenue mb8">
              Debito {soldi(io.passivita.prestitoBanca)} · ogni $1.000 rimborsati tolgono $100 di spese.
            </div>
            <Bottone variante="btn-blu btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({
                tipo: "vendiPerBancarotta", categoria: "prestito",
                importo: Math.min(io.passivita.prestitoBanca, Math.floor(io.contanti / 1000) * 1000),
              })}>
              Rimborsa {soldi(Math.min(io.passivita.prestitoBanca, Math.floor(io.contanti / 1000) * 1000))}
            </Bottone>
          </div>
        )}

        {[...io.immobili.map((i) => ({ ...i, cat: "immobile" })),
          ...io.attivita.map((a) => ({ ...a, cat: "attivita" }))].map((a) => (
          <div key={a.rid} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{a.nome}</div>
            <div className="f12 tenue mb8">
              Svendita alla banca: metà dell'acconto = <strong className="numeri">{soldi(Math.floor(a.acconto / 2))}</strong>.
              Perdi {soldi(a.flusso)}/mese.
            </div>
            <Bottone variante="btn-rosso btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: a.cat, rid: a.rid })}>
              Svendi · +{soldi(Math.floor(a.acconto / 2))}
            </Bottone>
          </div>
        ))}

        {io.azioni.map((a) => (
          <div key={a.simbolo} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">{a.quantita} × {a.simbolo}</div>
            <Bottone variante="btn-rosso btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: "azione", simbolo: a.simbolo })}>
              Liquida · +{soldi(Math.floor((a.quantita * a.prezzoAcquisto) / 2))}
            </Bottone>
          </div>
        ))}

        {debitiEstinguibili.filter((d) => io.passivita[d.chiave] > 0 && io.contanti >= io.passivita[d.chiave]).map((d) => (
          <div key={d.chiave} className="carta mb8" style={{ padding: 12 }}>
            <div className="grassetto f14 mb4">Estingui: {d.nome}</div>
            <div className="f12 tenue mb8">
              {soldi(io.passivita[d.chiave])} per togliere {soldi(io.spese[d.spesa])}/mese di spese.
            </div>
            <Bottone variante="btn-verde btn-piccolo pieno" disabled={inAzione}
              onClick={() => fai({ tipo: "vendiPerBancarotta", categoria: "debito", chiave: d.chiave })}>
              Estingui
            </Bottone>
          </div>
        ))}

        <Bottone variante={r.flussoMensile >= 0 ? "btn-verde" : "btn-rosso"} className="mt8" disabled={inAzione}
          onClick={() => fai({ tipo: "concludiBancarotta" })}>
          {r.flussoMensile >= 0 ? "Ho risanato: salta 3 turni" : "Non posso fare altro"}
        </Bottone>
        {errore && <p className="f13 neg mt12" style={{ margin: "12px 0 0" }}>{errore}</p>}
      </Foglio>
    );
  }

  /* ── Largo: affare ── */
  if (p.tipo === "affareVeloce") {
    const a = p.affare;
    const nuovo = io.redditoRendita + a.flusso;
    const obiettivo = io.redditoInizialeVeloce + 50000;
    return (
      <Foglio aperto>
        <CartaGioco chiave={chiave} classe="c-veloce" etichetta="Affare · Largo" titolo={a.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.45 }}>{a.testo}</p>
          <div className="mt12">
            <Voce k="Acconto" v={soldi(a.acconto)} />
            <Voce k="Flusso mensile" v={`+${soldi(a.flusso)}`} forte />
            <Voce k="Il tuo flusso diventerebbe" v={soldi(nuovo)} />
            <Voce k="Obiettivo per vincere" v={soldi(obiettivo)} />
          </div>
          {nuovo >= obiettivo && (
            <p className="f13 grassetto mt12" style={{ margin: "12px 0 0", color: "var(--verde)" }}>
              Comprando questo affare vinci la partita.
            </p>
          )}
        </CartaGioco>
        <div className="flex tra f13 mb12">
          <span className="tenue">I tuoi contanti</span>
          <span className="numeri grassetto">{soldi(io.contanti)}</span>
        </div>
        <div className="riga-btn">
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "passaAffareVeloce" })}>Lascia perdere</Bottone>
          <Bottone variante="btn-oro" disabled={inAzione || io.contanti < a.acconto}
            onClick={() => fai({ tipo: "compraAffareVeloce" })}>
            {io.contanti >= a.acconto ? `Compra · ${soldi(a.acconto)}` : "Contanti insufficienti"}
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
          etichetta={p.mio ? "Il tuo sogno" : "Sogno di un altro giocatore"}
          titolo={`${p.sogno.emoji || "★"} ${p.sogno.nome}`}>
          {p.mio ? (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                È il sogno che hai scelto a inizio partita. Comprarlo significa vincere.
              </p>
              <div className="mt12">
                <Voce k="Costo di listino" v={soldi(p.sogno.costo)} />
                {io.segnaliniSogno > 0 && (
                  <Voce k={`Rincaro (${io.segnaliniSogno} segnalin${io.segnaliniSogno === 1 ? "o" : "i"})`}
                    v={`+${soldi(p.sogno.costo * io.segnaliniSogno)}`} />
                )}
                <Voce k="Da pagare" v={soldi(p.costo)} forte />
              </div>
            </>
          ) : (
            <>
              <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
                Non è il tuo sogno, quindi non puoi comprarlo.
                {p.vittime?.length > 0 && (
                  <> Ma essendoci atterrato sopra, hai raddoppiato il costo
                    a {p.vittime.join(", ")}.</>
                )}
              </p>
            </>
          )}
        </CartaGioco>
        {p.mio ? (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "passaSogno" })}>Non ora</Bottone>
            <Bottone variante="btn-oro" disabled={inAzione || io.contanti < p.costo}
              onClick={() => fai({ tipo: "compraSogno" })}>
              {io.contanti >= p.costo ? `Realizza il sogno · ${soldi(p.costo)}` : `Ti mancano ${soldi(p.costo - io.contanti)}`}
            </Bottone>
          </div>
        ) : (
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "passaSogno" })}>Avanti</Bottone>
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
        <CartaGioco chiave={chiave} classe="c-benef" etichetta="Beneficenza · Largo"
          titolo={p.gia ? "Hai già donato" : "Vuoi donare?"}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {p.gia
              ? "Puoi già scegliere quanti dadi tirare a ogni turno."
              : "Donando il 10% del tuo reddito potrai scegliere se tirare 1, 2 o 3 dadi per il resto della partita: molto utile per arrivare sulla casella giusta."}
          </p>
          {!p.gia && <div className="mt12"><Voce k="Costo" v={soldi(costo)} forte /></div>}
        </CartaGioco>
        {p.gia ? (
          <Bottone variante="btn-fantasma" disabled={inAzione}
            onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: false })}>Avanti</Bottone>
        ) : (
          <div className="riga-btn">
            <Bottone variante="btn-fantasma" disabled={inAzione}
              onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: false })}>No, grazie</Bottone>
            <Bottone variante="btn-oro" disabled={inAzione || io.contanti < costo}
              onClick={() => fai({ tipo: "beneficenzaVeloce", accetta: true })}>Dona {soldi(costo)}</Bottone>
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
        <CartaGioco chiave={chiave} classe="c-extra" etichetta="Imprevisto" titolo={p.nome}>
          <p className="f14" style={{ margin: 0, lineHeight: 1.5 }}>
            {p.nome === "Divorzio"
              ? "Perdi tutti i contanti che avevi da parte. Il tuo flusso mensile resta intatto: gli affari continuano a produrre."
              : "Perdi metà dei contanti. Il flusso mensile non cambia: è il capitale liquido a farne le spese."}
          </p>
          <div className="mt12">
            <Voce k="Perso" v={soldi(p.perso)} forte />
            <Voce k="Ti restano" v={soldi(io.contanti)} />
          </div>
        </CartaGioco>
        <Bottone variante="btn-fantasma" disabled={inAzione} onClick={() => fai({ tipo: "confermaPenalita" })}>
          Avanti
        </Bottone>
      </Foglio>
    );
  }

  return null;
}
