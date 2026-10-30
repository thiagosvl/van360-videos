#!/usr/bin/env bash
# Confere vários quadros de uma vez, empacotando o projeto só uma vez.
# Uso: bash scripts/stills.sh <Composição> <frame> [frame...]   -> out/st/<Composição>-<frame>.png
set -e
comp=$1; shift
npx remotion bundle --out-dir out/.bundle >/dev/null 2>&1
mkdir -p out/st
for f in "$@"; do
  npx remotion still out/.bundle ${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER} "$comp" "out/st/$comp-$f.png" --frame="$f" >/dev/null 2>&1 && echo "out/st/$comp-$f.png"
done
