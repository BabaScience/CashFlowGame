#!/bin/sh
# Le schermate sono JSX e Node non lo legge: si impacchettano con esbuild
# (già presente fra le dipendenze) e si esegue il risultato.
#
# Il pacchetto finisce dentro node_modules/.cache e non altrove: da lì Node
# risolve react e react-dom, che restano esterni al pacchetto. Da una
# cartella temporanea fuori dal progetto non li troverebbe.
set -e
USCITA="node_modules/.cache/prova-schermate.mjs"
mkdir -p node_modules/.cache
trap 'rm -f "$USCITA"' EXIT
# Gli avvisi di esbuild diventano errori.
#
# Una chiave dichiarata due volte nello stesso oggetto è muta in JavaScript:
# vince la seconda e la prima sparisce. È già successo tre volte in questo
# progetto — due sezioni `scheda:` nei dizionari, e `obiettivoLargo` due
# volte nel contesto del mercato — e ogni volta qualcosa ha smesso di
# funzionare senza che niente lo dicesse. esbuild se ne accorge: basta non
# lasciarglielo dire di sfuggita.
AVVISI="node_modules/.cache/prova-schermate.avvisi"
trap 'rm -f "$USCITA" "$AVVISI"' EXIT
npx esbuild scripts/prova-schermate.mjs \
  --bundle --platform=node --format=esm --jsx=automatic --log-level=warning \
  --external:react --external:react-dom --external:react/jsx-runtime \
  --external:framer-motion \
  --loader:.md=text \
  --outfile="$USCITA" 2>"$AVVISI"
# Solo gli avvisi di esbuild: su stderr finisce anche il rumore di Node
# (ExperimentalWarning e simili), che non riguarda il codice del progetto.
if grep -q "\[WARNING\]" "$AVVISI"; then
  cat "$AVVISI"
  echo "❌ esbuild ha segnalato un problema: va corretto, non ignorato."
  exit 1
fi
node "$USCITA"
