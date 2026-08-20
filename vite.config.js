import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import apiLocale from "./scripts/api-locale.js";

/**
 * Indirizzo pubblico del sito.
 *
 * Le anteprime dei link (WhatsApp, Telegram, Facebook, Slack, iMessage…)
 * vogliono un indirizzo assoluto per og:image: un percorso relativo viene
 * ignorato dalla maggior parte dei servizi e l'anteprima esce senza immagine.
 * Su Vercel l'indirizzo si ricava da solo dalle variabili di sistema; basta
 * impostare VITE_SITE_URL soltanto se si usa un dominio proprio.
 */
function indirizzoSito() {
  const esplicito = process.env.VITE_SITE_URL;
  if (esplicito) return esplicito.replace(/\/+$/, "");
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "";
}

/** Sostituisce %SITE_URL% dentro index.html al momento della compilazione. */
function urlAssoluti() {
  const base = indirizzoSito();
  return {
    name: "quotazero-url-assoluti",
    transformIndexHtml(html) {
      if (!base) {
        console.warn(
          "\n  Nessun VITE_SITE_URL né variabile Vercel: le anteprime dei link\n" +
          "  useranno percorsi relativi e alcune app potrebbero non mostrare\n" +
          "  l'immagine. Su Vercel viene impostata da sola.\n"
        );
      }
      return html.replaceAll("%SITE_URL%", base);
    },
  };
}

export default defineConfig({
  // apiLocale fa girare le API in memoria durante `npm run dev`:
  // si gioca subito, senza dover configurare MongoDB.
  plugins: [react(), apiLocale(), urlAssoluti()],
  server: { port: 5173, host: true },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
