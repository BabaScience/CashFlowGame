import React, { useMemo } from "react";
import testoManuale from "../../MANUALE.md?raw";

/**
 * Il manuale in-app è lo stesso file MANUALE.md del repository:
 * una sola fonte di verità, nessun rischio che le due versioni divergano.
 * Qui sotto un renderer Markdown minimo, giusto quello che serve al manuale.
 */

/** Grassetto, corsivo, codice e collegamenti dentro una riga di testo. */
function inline(t, chiave) {
  const pezzi = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let ultimo = 0, m, i = 0;
  while ((m = re.exec(t))) {
    if (m.index > ultimo) pezzi.push(t.slice(ultimo, m.index));
    const s = m[0];
    if (s.startsWith("**")) pezzi.push(<strong key={`${chiave}-${i++}`}>{s.slice(2, -2)}</strong>);
    else if (s.startsWith("`")) pezzi.push(
      <code key={`${chiave}-${i++}`} className="numeri"
        style={{ background: "rgba(0,0,0,.07)", padding: "1px 5px", borderRadius: 4, fontSize: ".92em" }}>
        {s.slice(1, -1)}
      </code>
    );
    else if (s.startsWith("[")) {
      const [, testo] = s.match(/\[([^\]]+)\]/);
      pezzi.push(<span key={`${chiave}-${i++}`}>{testo}</span>);
    }
    else pezzi.push(<em key={`${chiave}-${i++}`}>{s.slice(1, -1)}</em>);
    ultimo = m.index + s.length;
  }
  if (ultimo < t.length) pezzi.push(t.slice(ultimo));
  return pezzi;
}

const celle = (riga) => riga.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

function analizza(md) {
  const righe = md.split("\n");
  const out = [];
  let i = 0;

  while (i < righe.length) {
    const r = righe[i];

    // Tabella
    if (/^\|/.test(r) && /^\|[\s:|-]+\|$/.test(righe[i + 1] || "")) {
      const intest = celle(r);
      const allin = celle(righe[i + 1]).map((c) => (c.endsWith(":") ? "right" : "left"));
      i += 2;
      const corpo = [];
      while (i < righe.length && /^\|/.test(righe[i])) { corpo.push(celle(righe[i])); i++; }
      out.push({ t: "tabella", intest, allin, corpo });
      continue;
    }

    if (/^#{1,4}\s/.test(r)) {
      const liv = r.match(/^#+/)[0].length;
      out.push({ t: "h", liv, testo: r.replace(/^#+\s*/, "") });
      i++; continue;
    }
    if (/^---+$/.test(r.trim())) { out.push({ t: "hr" }); i++; continue; }
    if (/^>\s?/.test(r)) {
      const blocco = [];
      while (i < righe.length && /^>\s?/.test(righe[i])) { blocco.push(righe[i].replace(/^>\s?/, "")); i++; }
      out.push({ t: "cit", testo: blocco.join(" ") });
      continue;
    }
    if (/^\s*[-*]\s/.test(r)) {
      const voci = [];
      while (i < righe.length && /^\s*[-*]\s/.test(righe[i])) { voci.push(righe[i].replace(/^\s*[-*]\s/, "")); i++; }
      out.push({ t: "ul", voci });
      continue;
    }
    if (/^\s*\d+\.\s/.test(r)) {
      const voci = [];
      while (i < righe.length && /^\s*\d+\.\s/.test(righe[i])) { voci.push(righe[i].replace(/^\s*\d+\.\s*/, "")); i++; }
      out.push({ t: "ol", voci });
      continue;
    }
    if (r.trim() === "") { i++; continue; }

    const par = [];
    while (i < righe.length && righe[i].trim() !== "" &&
      !/^[#>|-]/.test(righe[i]) && !/^\s*\d+\.\s/.test(righe[i]) && !/^\s*[-*]\s/.test(righe[i])) {
      par.push(righe[i]); i++;
    }
    if (par.length) out.push({ t: "p", testo: par.join(" ") });
    else i++;
  }
  return out;
}

const DIM_H = { 1: 26, 2: 20, 3: 16, 4: 14 };

export default function Manuale() {
  const blocchi = useMemo(() => analizza(testoManuale), []);
  // L'indice del file .md non serve a schermo: si scorre e basta.
  const utili = useMemo(() => {
    const iIndice = blocchi.findIndex((b) => b.t === "h" && b.testo === "Indice");
    if (iIndice === -1) return blocchi;
    const dopo = blocchi.findIndex((b, k) => k > iIndice && b.t === "hr");
    return [...blocchi.slice(0, iIndice), ...blocchi.slice(dopo + 1)];
  }, [blocchi]);

  return (
    <div className="carta" style={{ lineHeight: 1.6 }}>
      {utili.map((b, k) => {
        if (b.t === "h") {
          return (
            <div key={k} className="titolo"
              style={{
                fontSize: DIM_H[b.liv], marginTop: b.liv <= 2 ? 26 : 18, marginBottom: 8,
                color: b.liv <= 2 ? "var(--inchiostro)" : "#3A4741",
              }}>
              {b.testo}
            </div>
          );
        }
        if (b.t === "hr") return <hr key={k} style={{ border: 0, borderTop: "1px solid var(--linea)", margin: "22px 0" }} />;
        if (b.t === "cit") {
          return (
            <div key={k} style={{
              borderLeft: "3px solid var(--oro)", background: "rgba(201,162,39,.09)",
              padding: "11px 14px", borderRadius: "0 8px 8px 0", margin: "14px 0", fontSize: 14,
            }}>
              {inline(b.testo, k)}
            </div>
          );
        }
        if (b.t === "ul" || b.t === "ol") {
          const Tag = b.t === "ul" ? "ul" : "ol";
          return (
            <Tag key={k} style={{ paddingLeft: 20, margin: "10px 0", fontSize: 14.5 }}>
              {b.voci.map((v, j) => <li key={j} style={{ marginBottom: 5 }}>{inline(v, `${k}-${j}`)}</li>)}
            </Tag>
          );
        }
        if (b.t === "tabella") {
          return (
            <div key={k} style={{ overflowX: "auto", margin: "14px 0" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5 }}>
                <thead>
                  <tr>
                    {b.intest.map((c, j) => (
                      <th key={j} style={{
                        textAlign: b.allin[j], padding: "8px 10px",
                        borderBottom: "2px solid var(--linea)", whiteSpace: "nowrap",
                        fontSize: 11, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--tenue)",
                      }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.corpo.map((riga, j) => (
                    <tr key={j}>
                      {riga.map((c, l) => (
                        <td key={l} style={{
                          textAlign: b.allin[l], padding: "7px 10px",
                          borderBottom: "1px solid rgba(0,0,0,.06)",
                          fontFamily: b.allin[l] === "right" ? "var(--f-numeri)" : "inherit",
                          whiteSpace: "nowrap",
                        }}>{inline(c, `${k}-${j}-${l}`)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <p key={k} style={{ fontSize: 14.5, margin: "10px 0" }}>{inline(b.testo, k)}</p>;
      })}
    </div>
  );
}
