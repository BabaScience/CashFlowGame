import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Recupero from "./components/Recupero.jsx";
import "./styles/globale.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Recupero>
      <App />
    </Recupero>
  </React.StrictMode>
);
