# Monta o áudio editado de um depoimento e as falas (legendas) já no tempo do vídeo.
#
# Uso: python3 scripts/depoimento-audio.py scripts/depoimentos/<nome>.json
#
# O JSON tem:
#   origem:  caminho do áudio original
#   saida:   public/depoimentos/<nome>.mp3
#   ts:      src/depoimentos/<nome>-falas.ts (gerado)
#   trechos: [[inicio, fim], ...] em segundos do áudio original, na ordem do vídeo
#   falas:   [[texto, inicio, fim], ...] com os tempos do áudio ORIGINAL
#            (tirados da transcrição com tempo por palavra). **palavra** = destaque.
#   filtros: (opcional) filtros extras do ffmpeg antes da normalização, ex.: "afftdn=nf=-25"
#
# Cada fala é levada para o tempo do vídeo pelo trecho que a contém. Se a fala
# atravessa um corte (começa num trecho e termina noutro), usa o início e o fim
# de cada lado.
import json, subprocess, sys

FPS = 30
FADE = 0.03

spec = json.load(open(sys.argv[1]))
trechos = spec["trechos"]

# posição de cada trecho no áudio novo
offsets, t = [], 0.0
for a, b in trechos:
    offsets.append(t)
    t += b - a
total = t


def novo_tempo(x, lado):
    """Tempo no áudio novo de um instante x do original. lado = 'ini' ou 'fim' (desempate nas bordas)."""
    for (a, b), off in zip(trechos, offsets):
        if a - 0.08 <= x <= b + 0.08:
            return off + min(max(x, a), b) - a
    raise SystemExit(f"instante {x}s fora dos trechos ({lado})")


partes, labels = [], []
for i, (a, b) in enumerate(trechos):
    d = b - a
    partes.append(f"[0]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},afade=t=out:st={d - FADE:.3f}:d={FADE}[s{i}]")
    labels.append(f"[s{i}]")
extra = (spec.get("filtros") + ",") if spec.get("filtros") else ""
grafo = ";".join(partes) + ";" + "".join(labels) + f"concat=n={len(trechos)}:v=0:a=1,highpass=f=80,{extra}loudnorm=I=-15:TP=-1.5[o]"
subprocess.run(
    ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", spec["origem"], "-filter_complex", grafo,
     "-map", "[o]", "-ar", "48000", "-b:a", "192k", spec["saida"]],
    check=True,
)

linhas = []
for texto, ini, fim in spec["falas"]:
    a = round(novo_tempo(ini, "ini") * FPS)
    b = round(novo_tempo(fim, "fim") * FPS)
    linhas.append(f"  {{ text: {json.dumps(texto, ensure_ascii=False)}, from: {a}, to: {b} }},")

fim_audio = round(total * FPS)
nome = spec["nome"]
ts = f"""// GERADO por scripts/depoimento-audio.py a partir de scripts/depoimentos/{nome}.json. Não editar à mão.
import type {{ Fala }} from "./base";

/** Áudio editado: public/depoimentos/{nome}.mp3 ({total:.1f}s). */
export const FIM_AUDIO = {fim_audio};
export const SEGUNDOS_AUDIO = {int(total)};

export const FALAS: Fala[] = [
{chr(10).join(linhas)}
];
"""
open(spec["ts"], "w").write(ts)
print(f"{spec['saida']}: {total:.2f}s ({fim_audio} frames), {len(spec['falas'])} falas -> {spec['ts']}")
