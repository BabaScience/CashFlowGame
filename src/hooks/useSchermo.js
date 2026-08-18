import { useEffect, useState } from "react";

/**
 * Vero quando c'è spazio per la disposizione da scrivania.
 * Ascolta i cambi di dimensione: ruotare il telefono cambia davvero il layout.
 */
export function useSchermoLargo(soglia = 900) {
  const query = `(min-width: ${soglia}px)`;
  const [largo, setLargo] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mm = window.matchMedia(query);
    const suCambio = (e) => setLargo(e.matches);
    mm.addEventListener("change", suCambio);
    setLargo(mm.matches);
    return () => mm.removeEventListener("change", suCambio);
  }, [query]);
  return largo;
}
