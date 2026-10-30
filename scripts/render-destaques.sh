#!/usr/bin/env bash
# Gera as capas dos destaques em out/destaques/<variante>/<id>.png (1080x1920)
set -e
cd "$(dirname "$0")/.."
EXTRA=${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
npx remotion bundle --out-dir=out/bundle-destaques --log=error >/dev/null
IDS=$(npx remotion compositions out/bundle-destaques --quiet $EXTRA 2>/dev/null | tr ' ' '\n' | grep -E '^destaque-' || true)
for id in $IDS; do
  rest=${id#destaque-}; v=${rest%%-*}; nome=${rest#*-}
  npx remotion still out/bundle-destaques "$id" "out/destaques/$v/$nome.png" $EXTRA --log=error
done
echo "ok: out/destaques"
