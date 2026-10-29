#!/usr/bin/env bash
# Gera as imagens das lojas em out/loja/{ios,android}/
# Uso: bash scripts/render-loja.sh               (todas)
#      bash scripts/render-loja.sh 01-cobranca   (uma ou mais, separadas por espaço)
set -e
cd "$(dirname "$0")/.."
EXTRA=${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
npx remotion bundle --out-dir=out/bundle-loja --log=error >/dev/null
IDS=$(npx remotion compositions out/bundle-loja --quiet $EXTRA 2>/dev/null | tr ' ' '\n' | grep -E '^(ios|android)-' || true)
for id in $IDS; do
  slide=${id#*-}
  if [ -n "$1" ] && ! [[ " $* " == *" $slide "* ]]; then continue; fi
  npx remotion still out/bundle-loja "$id" "out/loja/${id%%-*}/$slide.png" $EXTRA --log=error
done
echo "ok: out/loja"
