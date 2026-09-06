import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bottone } from "../components/Base.jsx";
import Scelta from "../components/Scelta.jsx";
import Logo from "../components/Logo.jsx";
import Icona from "../components/Icona.jsx";
import { MercatoProvider, useMercato } from "../Mercato.jsx";
import { MERCATI, MERCATO_PREDEFINITO, getPacchetto } from "../game/mercati/indice.js";
import { LIVELLI, LIVELLO_PREDEFINITO } from "../game/regole/livelli.js";
import { soldi } from "../game/finanze.js";
import { MAX_GIOCATORI } from "../game/tabellone.js";
import { TURNI_LAMPO } from "../game/motore.js";
import * as api from "../lib/api.js";
import { traccia } from "../lib/traccia.js";
import { partiteAperte, dimenticaPartita, daQuanto } from "../lib/partite.js";
import { useLingua } from "../Lingua.jsx";

/**
 * Schermata iniziale.
 *
 * Il mercato si sceglie qui e prima di tutto il resto, perché è il mercato
 * a decidere quali professioni esistono e quanto costano le cose: scegliere
 * "Roma" dopo aver scelto la professione significherebbe cambiarla sotto i
 * piedi a chi l'ha appena letta. Chi entra con un codice non sceglie nulla:
 * il mercato è quello della stanza, uno per tavolo.
 */
export default function Ingresso({ suEntrato, avvisa, suSfida, suArena, suImpara, vistaIniziale, modoIniziale, stanzaIniziale }) {
  const [mercatoId, setMercato] = useState(
    () => localStorage.getItem("quotazero:mercato") || MERCATO_PREDEFINITO
  );
  return (
    <MercatoProvider mercatoId={mercatoId}>
      <Modulo suEntrato={suEntrato} avvisa={avvisa} suSfida={suSfida} suArena={suArena} suImpara={suImpara}
        mercatoId={mercatoId} setMercato={setMercato} vistaIniziale={vistaIniziale} modoIniziale={modoIniziale} stanzaIniziale={stanzaIniziale} />
    </MercatoProvider>
  );
}

/**
 * Il secondo passo di chi entra: la stanza è stata trovata, quindi si sa
 * finalmente su quale mercato si gioca e si possono offrire professioni che
 * esistono davvero lì dentro.
 *
 * Sta in un componente suo perché deve leggere il mercato DELLA STANZA, e
 * un componente non può consumare un contesto che apre lui stesso.
 */
function SceltaDIngresso({ stanza, professioneId, setProfessione, sognoId, setSogno, suCambiaCodice }) {
  const { t } = useLingua();
  const { professioni, sogni, soldi: money } = useMercato();
  const prof = professioni.find((p) => p.id === professioneId) || professioni[0];
  const speseProf = Object.values(prof.spese).reduce((a, b) => a + b, 0);
  const liv = LIVELLI.find((l) => l.id === stanza.livello);

  return (
    <>
      <div className="stanza-trovata">
        <div className="flex tra cen">
          <span className="etichetta" style={{ margin: 0 }}>{t("ingresso.stanzaTrovata")}</span>
          <button className="cambia-codice" onClick={suCambiaCodice}>
            <Icona nome="frecciaSinistra" dim={13} /> {t("ingresso.altroCodice")}
          </button>
        </div>
        <div className="numeri grassetto f22" style={{ letterSpacing: 3, margin: "4px 0 6px" }}>
          {stanza.codice}
        </div>
        <p className="f12 tenue" style={{ margin: 0, lineHeight: 1.45 }}>
          {t(`mercati.${stanza.mercatoId}.nome`)}
          {liv ? ` · ${liv.nome}` : ""}
          {" · "}
          {stanza.giocatori.length === 1
            ? t("ingresso.giaDentroUno", { nomi: stanza.giocatori[0] })
            : t("ingresso.giaDentro", { nomi: stanza.giocatori.join(", ") })}
        </p>
      </div>

      <div className="gruppo-campo">
        <Scelta
          id="campo-professione"
          etichetta={t("ingresso.professione")}
          valore={professioneId}
          onCambia={setProfessione}
          opzioni={professioni.map((p) => ({
            valore: p.id, emoji: p.emoji, etichetta: p.nome,
            dettaglio: t("ingresso.alMese", { importo: money(p.stipendio) }),
          }))}
        />
        <div className="carta mt8" style={{ background: "#F2F0E6", padding: 12 }}>
          <div className="flex tra f13">
            <span className="tenue">{t("ingresso.stipendio")}</span>
            <span className="numeri">{money(prof.stipendio)}</span>
          </div>
          <div className="flex tra f13">
            <span className="tenue">{t("ingresso.speseTotali")}</span>
            <span className="numeri">{money(speseProf)}</span>
          </div>
          <div className="flex tra f13 grassetto" style={{ borderTop: "1px dashed var(--linea)", paddingTop: 6, marginTop: 6 }}>
            <span>{t("ingresso.giornoDiPaga")}</span>
            <span className="numeri pos">{money(prof.stipendio - speseProf)}</span>
          </div>
        </div>
      </div>

      <div className="gruppo-campo">
        <Scelta
          id="campo-sogno"
          etichetta={t("ingresso.sogno")}
          valore={sognoId}
          onCambia={setSogno}
          opzioni={sogni.map((x) => ({
            valore: x.id, emoji: x.emoji, etichetta: x.nome, dettaglio: money(x.costo),
          }))}
        />
      </div>
    </>
  );
}

function Modulo({ suEntrato, avvisa, suSfida, suArena, suImpara, mercatoId, setMercato, vistaIniziale = "casa", modoIniziale = "crea", stanzaIniziale = null }) {
  /* Le partite lasciate a metà. Il gioco a turni distanziati serve a poco
     se poi non si ritrova la strada per tornarci. */
  const [aperte, setAperte] = useState(() => partiteAperte());
  /* Sei partite salvate spingevano sotto la piega il pulsante per cui si è
     qui. Se ne mostrano tre, che sono le ultime toccate; le altre restano
     raggiungibili ma non in mezzo ai piedi. */
  const [tutteLePartite, setTutteLePartite] = useState(false);
  const VISIBILI = 3;
  /* Il livello di realismo esiste solo dove esiste un fisco da mostrare:
     "classico" è un'economia astratta e non ha imposte da aprire. */
  const [livello, setLivello] = useState(LIVELLO_PREDEFINITO);
  const haFisco = Boolean(getPacchetto(mercatoId).fisco);
  const { t, lingua, cambiaLingua, lingue } = useLingua();
  const { professioni, sogni } = useMercato();
  const [nome, setNome] = useState(localStorage.getItem("quotazero:nome") || "");
  const [professioneId, setProfessione] = useState(professioni[0].id);
  const [sognoId, setSogno] = useState(sogni[0].id);

  /* Cambiando mercato le professioni cambiano: si riporta la scelta su una
     che esiste, altrimenti la scheda mostrata non è quella che si gioca. */
  useEffect(() => {
    if (!professioni.some((p) => p.id === professioneId)) setProfessione(professioni[0].id);
    if (!sogni.some((x) => x.id === sognoId)) setSogno(sogni[0].id);
  }, [professioni, sogni, professioneId, sognoId]);
  const [codice, setCodice] = useState("");
  const [occupato, setOccupato] = useState(false);
  const [modo, setModo] = useState(modoIniziale);
  /* "casa" mostra le destinazioni, "modulo" la configurazione della
     partita. Prima erano la stessa cosa: chi arrivava trovava un modulo di
     otto campi prima di sapere che gioco fosse, e chi voleva solo i
     quesiti doveva scorrere oltre tutto. */
  const [vista, setVista] = useState(vistaIniziale);
  /* Quanti avversari automatici. Zero = si gioca con gli amici. */
  const [avversari, setAvversari] = useState(0);
  /* Quanto dura. Vedi arena: senza un formato corto non esiste "ancora una". */
  const [formato, setFormato] = useState("lunga");
  /* Entrare è in due passi. Il primo trova la stanza, il secondo fa
     scegliere professione e sogno — ma del mercato GIUSTO, che è quello
     della stanza e si conosce solo dopo averla trovata. Prima il modulo
     offriva le professioni del mercato scelto in locale e il motore le
     sostituiva in silenzio; poi non le ho più chieste affatto, e chi
     entrava si trovava assegnata una professione senza averla scelta. */
  /* La propria riga di classifica. Una lettura sola all'apertura: è la
     cosa che si guarda per prima ogni volta che si torna, e deve essere
     lì prima ancora di decidere cosa fare. */
  const [io, setIo] = useState(null);
  useEffect(() => {
    let vivo = true;
    api.classifica().then((d) => { if (vivo) setIo(d.io); }).catch(() => { /* offline */ });
    return () => { vivo = false; };
  }, []);

  const [stanza, setStanza] = useState(stanzaIniziale);
  const [cercando, setCercando] = useState(false);

  /* Il ripiego non è pigrizia: cambiando mercato, `professioneId` resta per
     un attimo quello del mercato precedente. L'effetto che lo corregge gira
     DOPO il primo disegno, e in quel disegno `find` restituiva undefined.
     La schermata si rompeva a metà del cambio, e nessun test la coglieva
     perché nessuno cambiava mercato. */
  const prof = professioni.find((p) => p.id === professioneId) || professioni[0];
  const speseProf = Object.values(prof.spese).reduce((a, b) => a + b, 0);
  const margine = getPacchetto(mercatoId).margineUscita ?? 1;
  const flussoProf = prof.stipendio - speseProf;

  const ricorda = () => localStorage.setItem("quotazero:nome", nome.trim());

  const crea = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    setOccupato(true);
    try {
      ricorda();
      const r = await api.creaStanza(nome.trim(), professioneId, sognoId, mercatoId, haFisco ? livello : 1, avversari, formato);
      traccia("stanzaCreata", { mercato: mercatoId, formato });
      suEntrato(r.stato.codice);
    } catch (e) { avvisa(e.message); }
    finally { setOccupato(false); }
  };

  const trovaStanza = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    const c = codice.trim().toUpperCase();
    if (c.length < 4) return avvisa(t("ingresso.codiceCorto"));
    setCercando(true);
    try {
      const { stato } = await api.leggiStato(c);
      if (stato.fase !== "attesa") return avvisa(t("ingresso.giaIniziata"));
      if (stato.giocatori.length >= MAX_GIOCATORI) return avvisa(t("ingresso.stanzaPiena"));
      /* La professione scelta finora è di un altro mercato: si riparte da
         quelle che esistono davvero in questa stanza. */
      const pac = getPacchetto(stato.mercatoId, stato.versioneDati);
      setProfessione(pac.professioni[0].id);
      setSogno(pac.sogni[0].id);
      setStanza({
        codice: c,
        mercatoId: stato.mercatoId,
        livello: stato.livello,
        giocatori: stato.giocatori.map((g) => g.nome),
      });
    } catch (e) { avvisa(e.message); }
    finally { setCercando(false); }
  };

  const entra = async () => {
    if (!nome.trim()) return avvisa(t("ingresso.scriviNome"));
    const c = codice.trim().toUpperCase();
    if (c.length < 4) return avvisa(t("ingresso.codiceCorto"));
    setOccupato(true);
    try {
      ricorda();
      /* Professione e sogno vengono dal mercato della stanza, non da
         quello scelto in locale: è il secondo passo che li ha raccolti,
         dopo aver saputo su che mercato si gioca. */
      await api.azione(c, { tipo: "entra", nome: nome.trim(), professioneId, sognoId });
      traccia("stanzaRaggiunta");
      suEntrato(c);
    } catch (e) { avvisa(e.message); }
    finally { setOccupato(false); }
  };

  return (
    <div className="contenuto">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
        {/* La lingua è un'impostazione, non una destinazione: sta in un
            angolo, non in mezzo alla pagina come prima. */}
        <div className="scelta-lingua scelta-lingua-angolo">
          {lingue.map((l) => (
            <button key={l.id} onClick={() => cambiaLingua(l.id)}
              data-attiva={lingua === l.id} aria-pressed={lingua === l.id}
              aria-label={l.nome}>
              <span aria-hidden="true">{l.bandiera}</span> {l.nome}
            </button>
          ))}
        </div>

        <div className="ta-c cappello">
          {/* Dal modulo il logo riporta alle destinazioni; dalla casa non
              porta da nessuna parte, e allora non finge di essere un
              pulsante. */}
          <Logo grande suCasa={vista === "modulo" ? () => setVista("casa") : undefined} />
          <p className="f14" style={{ margin: "8px 0 0", color: "rgba(244,241,230,.72)", lineHeight: 1.5 }}>
            {t("app.motto")}<br />
            {t("app.sottotitolo")}
          </p>
        </div>

        {vista === "casa" ? (
          <>
            {/* Chi ha una partita a metà ha una sola intenzione: tornarci.
                Sta prima di tutto il resto. */}
            {io && (
              <div className="carta profilo-arena">
                <div>
                  <div className="etichetta" style={{ margin: 0 }}>{t("arena.laTuaValutazione")}</div>
                  <div className="titolo numeri f28" style={{ lineHeight: 1.1 }}>{io.valutazione}</div>
                </div>
                <div className="ta-r f12 tenue" style={{ lineHeight: 1.5 }}>
                  <div>{io.posizione
                    ? t("arena.posizioneSu", { n: io.posizione })
                    : t("arena.provvisoria")}</div>
                  <div>{t(io.partite === 1 ? "arena.unaPartita" : "arena.partiteVinte",
                    { n: io.partite, v: io.vittorie })}</div>
                </div>
              </div>
            )}

            {aperte.length > 0 && (
              <div className="carta partite-aperte">
                <div className="etichetta">{t("ingresso.partiteAperte")}</div>
                {(tutteLePartite ? aperte : aperte.slice(0, VISIBILI)).map((p) => (
                  <div key={p.codice} className="partita-aperta">
                    <button onClick={() => suEntrato(p.codice)} className="riprendi">
                      <span className="numeri grassetto">{p.codice}</span>
                      <span className="f12 tenue">
                        {t(`mercati.${p.mercatoId || "classico"}.nome`)}
                        {p.giocatori ? ` · ${t("ingresso.nGiocatori", { n: p.giocatori })}` : ""}
                        {" · "}{daQuanto(p.vista, t)}
                      </span>
                    </button>
                    <button className="scarta" aria-label={t("ingresso.dimentica")}
                      onClick={() => { dimenticaPartita(p.codice); setAperte(partiteAperte()); }}>×</button>
                  </div>
                ))}
                {aperte.length > VISIBILI && (
                  <button className="mostra-tutte" onClick={() => setTutteLePartite(!tutteLePartite)}>
                    {tutteLePartite
                      ? t("ingresso.mostraMeno")
                      : t("ingresso.mostraTutte", { n: aperte.length })}
                  </button>
                )}
              </div>
            )}

            {/* Le destinazioni. Ognuna dice cosa succede se la scegli e
                quanto dura: sono le due cose che si vogliono sapere prima
                di cliccare. */}
            <div className="destinazioni">
              {/* Prima di tutto il resto: qui non serve conoscere nessuno.
                  È la differenza fra un gioco che si gioca fra amici e un
                  posto dove si va. */}
              {suArena && (
                <button className="destinazione destinazione-prima" onClick={suArena}>
                  <span className="dest-icona"><Icona nome="fulmine" dim={24} /></span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.arena")}</span>
                    <span className="dest-nota">{t("casa.arenaNota")}</span>
                  </span>
                  <span className="dest-freccia"><Icona nome="frecciaDestra" dim={18} /></span>
                </button>
              )}

              <button className={suArena ? "destinazione" : "destinazione destinazione-prima"}
                onClick={() => setVista("modulo")}>
                <span className="dest-icona"><Icona nome="dado" dim={24} /></span>
                <span className="dest-testo">
                  <span className="dest-titolo">{t("casa.tavolo")}</span>
                  <span className="dest-nota">{t("casa.tavoloNota")}</span>
                </span>
                <span className="dest-freccia"><Icona nome="frecciaDestra" dim={18} /></span>
              </button>

              {suSfida && (
                <button className="destinazione" onClick={suSfida}>
                  <span className="dest-icona"><Icona nome="fulmine" dim={24} /></span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.sfida")}</span>
                    <span className="dest-nota">{t("casa.sfidaNota")}</span>
                  </span>
                  <span className="dest-freccia"><Icona nome="frecciaDestra" dim={18} /></span>
                </button>
              )}

              {suImpara && (
                <button className="destinazione" onClick={() => suImpara("lezioni")}>
                  <span className="dest-icona"><Icona nome="libro" dim={24} /></span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.lezioni")}</span>
                    <span className="dest-nota">{t("casa.lezioniNota")}</span>
                  </span>
                  <span className="dest-freccia"><Icona nome="frecciaDestra" dim={18} /></span>
                </button>
              )}

              {suImpara && (
                <button className="destinazione" onClick={() => suImpara("quesiti")}>
                  <span className="dest-icona"><Icona nome="quesito" dim={24} /></span>
                  <span className="dest-testo">
                    <span className="dest-titolo">{t("casa.quesiti")}</span>
                    <span className="dest-nota">{t("casa.quesitiNota")}</span>
                  </span>
                  <span className="dest-freccia"><Icona nome="frecciaDestra" dim={18} /></span>
                </button>
              )}
            </div>

            {/* Cos'è, per chi non l'ha mai visto. Prima non lo diceva
                nessuno: si arrivava su un modulo e basta. */}
            <div className="carta spiegazione">
              <div className="etichetta">{t("casa.comeFunziona")}</div>
              <ol>
                <li>{t("casa.passo1")}</li>
                <li>{t("casa.passo2")}</li>
                <li>{t("casa.passo3")}</li>
              </ol>
            </div>
          </>
        ) : (
        <>
        <div className="carta">
          <button className="torna" onClick={() => setVista("casa")}>
            <Icona nome="frecciaSinistra" dim={14} /> {t("casa.torna")}
          </button>

          {/* La scelta stava in fondo, dopo i campi che decide: si
              compilavano mercato, livello, professione e sogno, e solo
              allora si scopriva che entrando con un codice non servivano.
              Nessuno dei quattro vale per chi entra — il mercato lo decide
              la stanza, e professione e sogno si scelgono nella sala
              d'attesa, dove l'elenco è finalmente quello giusto. */}
          <div className="scelta-modo" role="group" aria-label={t("ingresso.cosaVuoiFare")}>
            <button data-attivo={modo === "crea"} onClick={() => setModo("crea")}>
              <Icona nome="dado" dim={17} />
              <span>
                <strong>{t("ingresso.creaStanza")}</strong>
                <span className="modo-nota">{t("ingresso.creaNota")}</span>
              </span>
            </button>
            <button data-attivo={modo === "entra"} onClick={() => { setModo("entra"); setStanza(null); }}>
              <Icona nome="frecciaDestra" dim={17} />
              <span>
                <strong>{t("ingresso.entraConCodice")}</strong>
                <span className="modo-nota">{t("ingresso.entraNota")}</span>
              </span>
            </button>
          </div>

          <div className="gruppo-campo">
            <label className="etichetta" htmlFor="campo-nome">{t("ingresso.nome")}</label>
            <input id="campo-nome" className="campo" value={nome} maxLength={18}
              onChange={(e) => setNome(e.target.value)} placeholder={t("ingresso.nomeSegnaposto")} />
          </div>

          {/* Chi entra ha bisogno solo del codice: lo mette qui, accanto al
              nome, invece che in fondo dopo quattro campi che non lo
              riguardano. */}
          {modo === "entra" && !stanza && (
            <div className="gruppo-campo">
              <label className="etichetta" htmlFor="campo-codice">{t("ingresso.codice")}</label>
              <input
                id="campo-codice"
                className="campo campo-codice"
                value={codice}
                onChange={(e) => setCodice(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter" && codice.trim().length === 4) trovaStanza(); }}
                placeholder="····"
                maxLength={4}
                autoComplete="off"
                autoCapitalize="characters"
              />
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {t("ingresso.codiceNota")}
              </p>
            </div>
          )}

          {/* Trovata la stanza si sa su che mercato si gioca, e solo allora
              si possono offrire professioni che esistono davvero. */}
          {modo === "entra" && stanza && (
            <MercatoProvider mercatoId={stanza.mercatoId}>
              <SceltaDIngresso
                stanza={stanza}
                professioneId={professioneId} setProfessione={setProfessione}
                sognoId={sognoId} setSogno={setSogno}
                suCambiaCodice={() => setStanza(null)}
              />
            </MercatoProvider>
          )}

          {modo === "crea" && (
            <div className="gruppo-campo">
              <label className="etichetta">{t("ingresso.conChi")}</label>
              <div className="scelta-avversari" role="group" aria-label={t("ingresso.conChi")}>
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} data-attivo={avversari === n} onClick={() => setAvversari(n)}>
                    {n === 0 ? t("ingresso.conAmici") : t("ingresso.controIlComputer", { n })}
                  </button>
                ))}
              </div>
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {t(avversari === 0 ? "ingresso.conAmiciNota" : "ingresso.controIlComputerNota")}
              </p>
            </div>
          )}

          {modo === "crea" && (
            <div className="gruppo-campo">
              <label className="etichetta">{t("arena.formato")}</label>
              <div className="scelta-avversari" role="group" aria-label={t("arena.formato")}>
                <button data-attivo={formato === "lampo"} onClick={() => setFormato("lampo")}>
                  {t("arena.lampo")}
                </button>
                <button data-attivo={formato === "lunga"} onClick={() => setFormato("lunga")}>
                  {t("arena.lunga")}
                </button>
              </div>
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {t(formato === "lampo" ? "arena.lampoNota" : "arena.lungaNota", { n: TURNI_LAMPO })}
              </p>
            </div>
          )}

          {modo === "crea" && (<>
          {/* Prima scelta di tutte: decide professioni, prezzi e valuta. */}
          <div className="gruppo-campo">
            <Scelta
              id="campo-mercato"
              etichetta={t("ingresso.dovegiochi")}
              valore={mercatoId}
              onCambia={(v) => {
                setMercato(v);
                localStorage.setItem("quotazero:mercato", v);
              }}
              opzioni={MERCATI.map((m) => ({
                valore: m.id,
                etichetta: t(`mercati.${m.id}.nome`),
                nota: t(`mercati.${m.id}.descrizione`),
              }))}
            />
            <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
              {t("ingresso.mercatoNota")}
            </p>
          </div>

          {haFisco && (
            <div className="gruppo-campo">
              <Scelta
                id="campo-livello"
                etichetta={t("ingresso.livello")}
                valore={livello}
                onCambia={(v) => setLivello(Number(v))}
                opzioni={LIVELLI.map((l) => ({ valore: l.id, etichetta: l.nome, nota: l.sommario }))}
              />
              <p className="f12 tenue" style={{ margin: "6px 0 0", lineHeight: 1.45 }}>
                {LIVELLI.find((l) => l.id === livello)?.descrizione}
              </p>
            </div>
          )}

          <div className="gruppo-campo">
            <Scelta
              id="campo-professione"
              etichetta={t("ingresso.professione")}
              valore={professioneId}
              onCambia={setProfessione}
              opzioni={professioni.map((p) => ({
                valore: p.id, emoji: p.emoji, etichetta: p.nome,
                dettaglio: t("ingresso.alMese", { importo: soldi(p.stipendio) }),
              }))}
            />
            <div className="carta mt8" style={{ background: "#F2F0E6", padding: 12 }}>
              <div className="flex tra f13">
                <span className="tenue">{t("ingresso.stipendio")}</span><span className="numeri">{soldi(prof.stipendio)}</span>
              </div>
              <div className="flex tra f13">
                <span className="tenue">{t("ingresso.speseTotali")}</span><span className="numeri">{soldi(speseProf)}</span>
              </div>
              <div className="flex tra f13 grassetto" style={{ borderTop: "1px dashed var(--linea)", paddingTop: 6, marginTop: 6 }}>
                <span>{t("ingresso.giornoDiPaga")}</span><span className="numeri pos">{soldi(flussoProf)}</span>
              </div>
              <p className="f12 tenue" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
                {/* La soglia, non le spese. Su Roma il margine è 1,5×:
                    mostrare le spese nude annunciava un traguardo di un
                    terzo più basso di quello vero — e da oggi quel numero
                    è la condizione di vittoria. */}
                {t("ingresso.perUscire", { importo: soldi(Math.round(speseProf * margine)) })}
              </p>
            </div>
          </div>

          <div className="gruppo-campo">
            <Scelta
              id="campo-sogno"
              etichetta={t("ingresso.sogno")}
              valore={sognoId}
              onCambia={setSogno}
              opzioni={sogni.map((s) => ({
                valore: s.id, emoji: s.emoji, etichetta: s.nome, dettaglio: soldi(s.costo),
              }))}
            />
            <p className="f12 tenue mt8" style={{ margin: "8px 0 0", lineHeight: 1.45 }}>
              {t("ingresso.sognoNota")}
            </p>
          </div>
          </>)}
        </div>

        <div className="mt16 mb12">
          {modo === "crea" ? (
            <Bottone variante="btn-verde" disabled={occupato} onClick={crea}>
              {occupato ? t("ingresso.creando") : t("ingresso.creaEInvita")}
            </Bottone>
          ) : stanza ? (
            <Bottone variante="btn-verde" disabled={occupato} onClick={entra}>
              {occupato ? t("ingresso.entrando") : t("ingresso.entraNellaPartita")}
            </Bottone>
          ) : (
            <Bottone variante="btn-oro" disabled={cercando || codice.trim().length < 4}
              onClick={trovaStanza}>
              {cercando ? t("ingresso.cerco") : t("ingresso.trovaStanza")}
            </Bottone>
          )}
        </div>

        </>
        )}

        <p className="f12 ta-c mt16" style={{ color: "rgba(244,241,230,.4)", lineHeight: 1.55 }}>
          {t("app.nessunaRegistrazione")}
        </p>
      </motion.div>
    </div>
  );
}
