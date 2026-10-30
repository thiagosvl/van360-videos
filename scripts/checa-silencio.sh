#!/usr/bin/env bash
# Confere buracos de voz no vídeo final (obrigatório antes de entregar).
# Uso: bash scripts/checa-silencio.sh out/<video>.mp4
# Falha se houver qualquer silêncio >= 0,9s antes do último segundo e meio (o fim com o logo é livre).
set -e
f=$1
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
fim=$(echo "$dur - 1.5" | bc)
buracos=$(ffmpeg -i "$f" -vn -af silencedetect=n=-40dB:d=0.9 -f null - 2>&1 \
  | grep -oE "silence_(start|end): [0-9.]+" | awk '{print $2}' | paste - - \
  | awk -v fim="$fim" '$1 < fim { printf "  %.2fs a %.2fs (%.2fs)\n", $1, $2, $2-$1 }')
if [ -n "$buracos" ]; then
  echo "BURACOS DE VOZ em $f:"
  echo "$buracos"
  exit 1
fi
echo "ok: nenhum silêncio >= 0,9s em $f"
