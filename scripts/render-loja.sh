#!/usr/bin/env bash
# Gera as imagens das lojas em out/loja/{ios,android}/
# Uso: bash scripts/render-loja.sh            (todas)
#      bash scripts/render-loja.sh 1-cobranca (uma)
set -e
cd "$(dirname "$0")/.."
SLIDES=${1:-"1-cobranca 2-financeiro 3-cadastro 4-recibo 5-organizacao 6-marca"}
EXTRA=${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
npx remotion bundle --out-dir=out/bundle-loja >/dev/null
for s in $SLIDES; do
  for p in ios android; do
    npx remotion still out/bundle-loja "$p-$s" "out/loja/$p/$s.png" $EXTRA --log=error
  done
done
echo "ok: out/loja"
