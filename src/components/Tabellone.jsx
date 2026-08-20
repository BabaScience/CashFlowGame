import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PERCORSO_RUOTA, PERCORSO_LARGO, CASELLE_RUOTA, CASELLE_LARGO,
  N_RUOTA, N_LARGO,
} from "../game/data/tabellone.js";

/* ── geometria ─────────────────────────────────────────────── */
const L = 400, CX = L / 2, CY = L / 2;
const R_EST = 170, SP_EST = 24;   // Largo
const R_INT = 116, SP_INT = 28;   // Ruota

const ang = (i, n, frazione = 0.5) => ((i + frazione) / n) * Math.PI * 2 - Math.PI / 2;
const punto = (a, r) => [CX + Math.cos(a) * r, CY + Math.sin(a) * r];

/** Settore di corona circolare: una casella del tabellone. */
function settore(i, n, r, spessore, vuoto = 0.16) {
  const a0 = ang(i, n, 0) + (vuoto / n) * Math.PI;
  const a1 = ang(i, n, 1) - (vuoto / n) * Math.PI;
  const re = r + spessore / 2, ri = r - spessore / 2;
  const [x0e, y0e] = punto(a0, re), [x1e, y1e] = punto(a1, re);
  const [x1i, y1i] = punto(a1, ri), [x0i, y0i] = punto(a0, ri);
  return `M ${x0e} ${y0e} A ${re} ${re} 0 0 1 ${x1e} ${y1e} L ${x1i} ${y1i} A ${ri} ${ri} 0 0 0 ${x0i} ${y0i} Z`;
}

/** Posizione del gettone, con scostamento quando più giocatori condividono la casella. */
function posGettone(indice, n, r, ordine, totale) {
  const a = ang(indice, n);
  const scarto = totale > 1 ? (ordine - (totale - 1) / 2) * 7.5 : 0;
  return punto(a, r + scarto);
}

/* ── gettone animato ───────────────────────────────────────── */
function Gettone({ giocatore, n, raggio, ordine, totale, èTurno }) {
  const [frames, setFrames] = useState(null);
  const precedente = useRef(giocatore.posizione);
  const [x, y] = posGettone(giocatore.posizione, n, raggio, ordine, totale);

  useEffect(() => {
    const da = precedente.current;
    const a = giocatore.posizione;
    if (da === a) return;
    precedente.current = a;
    // Niente animazione se la scheda è in secondo piano: resterebbe a metà strada.
    if (document.hidden) return;
    // Percorso a salti: una tappa per ogni casella attraversata.
    const passi = (a - da + n) % n || n;
    const xs = [], ys = [];
    for (let k = 0; k <= passi; k++) {
      const [px, py] = posGettone((da + k) % n, n, raggio, ordine, totale);
      xs.push(px); ys.push(py);
    }
    setFrames({ xs, ys, passi });
    const t = setTimeout(() => setFrames(null), passi * 130 + 300);
    return () => clearTimeout(t);
  }, [giocatore.posizione, n, raggio, ordine, totale]);

  // Si anima la trasformazione del gruppo, non cx/cy del cerchio: framer-motion
  // non sa interpolare gli attributi SVG a fotogrammi chiave e finirebbe per
  // scrivere "undefined" dentro l'attributo, rompendo il disegno.
  const anim = frames ? { x: frames.xs, y: frames.ys } : { x, y };
  const transizione = frames
    ? { duration: Math.max(0.35, frames.passi * 0.13), ease: "easeInOut" }
    : { type: "spring", stiffness: 260, damping: 26 };

  return (
    <motion.g animate={anim} initial={{ x, y }} transition={transizione}>
      {èTurno && (
        <motion.circle
          cx={0} cy={0} r={12}
          fill="none" stroke={giocatore.colore} strokeWidth="2"
          initial={{ opacity: 0.6, scale: 0.85 }}
          animate={{ opacity: [0.65, 0, 0.65], scale: [0.85, 1.45, 0.85] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <circle
        cx={0} cy={0} r={8.5}
        fill={giocatore.colore}
        stroke="#F4F1E6"
        strokeWidth="2.4"
        opacity={giocatore.eliminato ? 0.3 : 1}
      />
    </motion.g>
  );
}

/* ── tabellone ─────────────────────────────────────────────── */
export default function Tabellone({ stato, mioId }) {
  const giocatori = stato.giocatori || [];
  const inTopi = giocatori.filter((g) => g.tracciato === "topi");
  const inVeloce = giocatori.filter((g) => g.tracciato === "veloce");
  const diTurno = giocatori[stato.turno]?.id;

  // Quanti giocatori su ciascuna casella, per scostare i gettoni.
  const affollamento = (lista) => {
    const m = new Map();
    lista.forEach((g) => {
      const arr = m.get(g.posizione) || [];
      arr.push(g.id);
      m.set(g.posizione, arr);
    });
    return m;
  };
  const affTopi = affollamento(inTopi);
  const affVeloce = affollamento(inVeloce);

  const io = giocatori.find((g) => g.id === mioId);

  return (
    <svg className="tabellone" viewBox={`0 0 ${L} ${L}`} role="img" aria-label="Tabellone di gioco">
      <defs>
        <radialGradient id="feltro" cx="50%" cy="42%">
          <stop offset="0%" stopColor="#265244" />
          <stop offset="100%" stopColor="#12271f" />
        </radialGradient>
        <filter id="morbida" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.35" />
        </filter>
      </defs>

      <circle cx={CX} cy={CY} r={196} fill="url(#feltro)" stroke="rgba(201,162,39,.34)" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={R_EST + SP_EST / 2 + 5} fill="none" stroke="rgba(201,162,39,.2)" strokeWidth="1" />

      {/* ── Largo (anello esterno) ── */}
      <g filter="url(#morbida)">
        {PERCORSO_LARGO.map((c, i) => {
          const def = CASELLE_LARGO[c.tipo];
          const preso = c.tipo === "affare" && stato.affariVenduti?.[c.rif];
          return (
            <path
              key={"v" + i}
              d={settore(i, N_LARGO, R_EST, SP_EST)}
              fill={def.colore}
              opacity={preso ? 0.32 : 0.94}
              stroke="rgba(0,0,0,.22)"
              strokeWidth="0.6"
            />
          );
        })}
      </g>

      {/* ── Ruota (anello interno) ── */}
      <g filter="url(#morbida)">
        {PERCORSO_RUOTA.map((t, i) => (
          <path
            key={"t" + i}
            d={settore(i, N_RUOTA, R_INT, SP_INT)}
            fill={CASELLE_RUOTA[t].colore}
            opacity={0.95}
            stroke="rgba(0,0,0,.22)"
            strokeWidth="0.6"
          />
        ))}
      </g>

      {/* Etichette brevi sulla Ruota */}
      {PERCORSO_RUOTA.map((t, i) => {
        const a = ang(i, N_RUOTA);
        const [tx, ty] = punto(a, R_INT);
        const gradi = (a * 180) / Math.PI + 90;
        const capovolto = gradi > 90 && gradi < 270;
        return (
          <text
            key={"lt" + i}
            x={tx} y={ty}
            transform={`rotate(${capovolto ? gradi + 180 : gradi} ${tx} ${ty})`}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 7.2, fontWeight: 800, fill: "rgba(255,255,255,.92)", letterSpacing: .2 }}
          >
            {CASELLE_RUOTA[t].breve}
          </text>
        );
      })}

      {/* Simboli sulla Largo */}
      {PERCORSO_LARGO.map((c, i) => {
        const a = ang(i, N_LARGO);
        const [tx, ty] = punto(a, R_EST);
        const simbolo = { rendita: "€", affare: "◆", sogno: "★", beneficenza: "♥",
          verificaFiscale: "!", causa: "§", divorzio: "×" }[c.tipo];
        return (
          <text key={"lv" + i} x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 9, fontWeight: 800, fill: "rgba(255,255,255,.95)" }}>
            {simbolo}
          </text>
        );
      })}

      {/* ── Centro ── */}
      <circle cx={CX} cy={CY} r={R_INT - SP_INT / 2 - 6} fill="#132a22" stroke="rgba(201,162,39,.3)" strokeWidth="1.2" />
      <text x={CX} y={CY - 26} textAnchor="middle" className="tab-etichetta" style={{ fontSize: 17, fill: "#E3C55A" }}>Quota Zero</text>
      <text x={CX} y={CY - 8} textAnchor="middle" style={{ fontSize: 8.5, fill: "rgba(244,241,230,.55)", letterSpacing: 1.6, fontWeight: 700 }}>
        LA RUOTA
      </text>

      {io && (
        <>
          <text x={CX} y={CY + 16} textAnchor="middle"
            style={{ fontSize: 10.5, fill: "rgba(244,241,230,.85)", fontWeight: 700 }}>
            {io.tracciato === "topi"
              ? CASELLE_RUOTA[PERCORSO_RUOTA[io.posizione]].nome
              : CASELLE_LARGO[PERCORSO_LARGO[io.posizione].tipo].nome}
          </text>
          <text x={CX} y={CY + 31} textAnchor="middle"
            style={{ fontSize: 8, fill: "rgba(244,241,230,.45)", letterSpacing: .8 }}>
            {io.tracciato === "topi" ? "la tua casella" : "Largo"}
          </text>
        </>
      )}
      {stato.fase === "inCorso" && (
        <text x={CX} y={CY + 52} textAnchor="middle"
          style={{ fontSize: 8.5, fill: giocatori[stato.turno]?.colore || "#E3C55A", fontWeight: 800, letterSpacing: .6 }}>
          TURNO DI {(giocatori[stato.turno]?.nome || "").toUpperCase()}
        </text>
      )}

      {/* ── Gettoni ── */}
      {inTopi.map((g) => {
        const gruppo = affTopi.get(g.posizione) || [g.id];
        return (
          <Gettone key={g.id} giocatore={g} n={N_RUOTA} raggio={R_INT}
            ordine={gruppo.indexOf(g.id)} totale={gruppo.length} èTurno={g.id === diTurno} />
        );
      })}
      {inVeloce.map((g) => {
        const gruppo = affVeloce.get(g.posizione) || [g.id];
        return (
          <Gettone key={g.id} giocatore={g} n={N_LARGO} raggio={R_EST}
            ordine={gruppo.indexOf(g.id)} totale={gruppo.length} èTurno={g.id === diTurno} />
        );
      })}
    </svg>
  );
}

/** Legenda dei colori, mostrata sotto al tabellone. */
export function Legenda({ tracciato = "topi" }) {
  const voci = tracciato === "topi"
    ? Object.entries(CASELLE_RUOTA)
    : Object.entries(CASELLE_LARGO);
  return (
    <div className="flex g6 mt12" style={{ flexWrap: "wrap", justifyContent: "center" }}>
      {voci.map(([k, v]) => (
        <span key={k} className="tag tag-scuro" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: v.colore, display: "inline-block" }} />
          {v.nome}
        </span>
      ))}
    </div>
  );
}
