#!/usr/bin/env bash
# Gera os posts do feed em out/posts/<post>/<slide>.png (1080x1350)
# Uso: bash scripts/render-posts.sh                (todos)
#      bash scripts/render-posts.sh 01-cobranca    (um ou mais posts)
set -e
cd "$(dirname "$0")/.."
EXTRA=${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
npx remotion bundle --out-dir=out/bundle-posts --log=error >/dev/null
IDS=$(npx remotion compositions out/bundle-posts --quiet $EXTRA 2>/dev/null | tr ' ' '\n' | grep -E '^post-' || true)
for id in $IDS; do
  rest=${id#post-}; post=${rest%-*}; n=${rest##*-}
  if [ -n "$1" ] && ! [[ " $* " == *" $post "* ]]; then continue; fi
  npx remotion still out/bundle-posts "$id" "out/posts/$post/$n.png" $EXTRA --log=error
done
echo "ok: out/posts"
