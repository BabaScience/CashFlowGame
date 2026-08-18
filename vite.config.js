import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import apiLocale from "./scripts/api-locale.js";

export default defineConfig({
  // apiLocale fa girare le API in memoria durante `npm run dev`:
  // si gioca subito, senza dover configurare MongoDB.
  plugins: [react(), apiLocale()],
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
