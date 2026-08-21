/**
 * COPIARE NEGLI APPUNTI, DOVUNQUE.
 *
 * `navigator.clipboard` vive solo in contesto sicuro: HTTPS o localhost.
 * Aprendo il gioco dal telefono sulla rete di casa — http://192.168.x.x:5173,
 * che è il modo in cui lo si prova davvero prima di pubblicarlo — non
 * esiste proprio, e ogni pulsante "copia" diventa un pulsante che non fa
 * niente.
 *
 * Il ripiego è la vecchia `execCommand("copy")`: deprecata, ma funziona
 * anche in chiaro ed è l'unica cosa che c'è. Se falliscono entrambe si
 * restituisce `false` — a chi chiama il compito di dirlo, perché un
 * pulsante che non fa niente e non lo dice fa sembrare rotto il gioco.
 */
export async function copiaTesto(testo) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(testo);
      return true;
    }
  } catch { /* permesso negato: si prova l'altra strada */ }

  try {
    const zona = document.createElement("textarea");
    zona.value = testo;
    /* Fuori dallo schermo ma non `display:none`: un campo nascosto non si
       può selezionare, e senza selezione non si copia niente. */
    zona.setAttribute("readonly", "");
    zona.style.position = "fixed";
    zona.style.top = "-1000px";
    zona.style.opacity = "0";
    document.body.appendChild(zona);
    zona.select();
    zona.setSelectionRange(0, testo.length);
    const fatto = document.execCommand("copy");
    document.body.removeChild(zona);
    return fatto;
  } catch {
    return false;
  }
}
