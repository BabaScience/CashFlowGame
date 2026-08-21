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
npx esbuild scripts/prova-schermate.mjs \
  --bundle --platform=node --format=esm --jsx=automatic --log-level=warning \
  --external:react --external:react-dom --external:react/jsx-runtime \
  --external:framer-motion \
  --loader:.md=text \
  --outfile="$USCITA"
node "$USCITA"
