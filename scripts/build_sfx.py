"""Gera a biblioteca de efeitos sonoros em public/sfx (usada por todos os tutoriais).

Fontes: Kenney Interface Sounds (CC0, uso comercial livre) + sons sintetizados
(whoosh, notificação, vibração, sino do logo).

Rodar uma vez:
  git clone --depth 1 --filter=blob:none --sparse https://github.com/kapishdima/soundcn.git /tmp/soundcn
  (cd /tmp/soundcn && git sparse-checkout set assets)
  python3 scripts/build_sfx.py /tmp/soundcn/assets
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
KENNEY = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/soundcn/assets") / "kenney_interface-sounds"
rng = np.random.default_rng(7)


def write(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    x = x / (np.max(np.abs(x)) or 1) * peak
    f = int(0.004 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    wavfile.write(OUT / f"{name}.wav", SR, (x * 32767).astype(np.int16))


def kenney(name, src):
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(KENNEY / src), "-ac", "1", "-ar", str(SR), str(OUT / f"{name}.wav")],
        check=True,
    )


def t(dur):
    return np.arange(int(dur * SR)) / SR


def whoosh(dur, f0, f1):
    """Ruído passando por um filtro que varre de f0 a f1 (o 'swipe' de tela)."""
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    fs = np.geomspace(f0, f1, n // blk + 1)
    zi = None
    for i in range(0, n, blk):
        fc = fs[i // blk]
        sos = butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 - 100)], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = sosfilt(sos, noise[i : i + blk], zi=zi)
        out[i : i + blk] = y
    x = np.linspace(0, 1, n)
    return out * np.sin(np.pi * x) ** 1.5


def bell(f, dur, decay):
    tt = t(dur)
    s = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 2.01 * tt) + 0.12 * np.sin(2 * np.pi * f * 3.02 * tt)
    return s * np.exp(-tt / decay) * np.minimum(tt / 0.003, 1)


# --- Kenney ---
kenney("tap", "click_001.ogg")
kenney("open", "maximize_006.ogg")
kenney("close", "minimize_006.ogg")
kenney("success", "confirmation_002.ogg")
kenney("scroll", "scroll_002.ogg")
kenney("pop", "drop_002.ogg")
kenney("select", "select_002.ogg")

# --- sintetizados ---
write("whoosh", whoosh(0.42, 300, 3800), 0.8)
write("whoosh-soft", whoosh(0.55, 180, 1400), 0.7)

# notificação do celular: dois toques curtos e limpos
n1 = bell(1318.5, 0.5, 0.12)
n2 = bell(1760.0, 0.7, 0.18)
gap = int(0.11 * SR)
notif = np.zeros(gap + len(n2))
notif[: len(n1)] += n1
notif[gap : gap + len(n2)] += n2
write("notif", notif, 0.75)

# vibração: zumbido grave em dois pulsos
tt = t(0.42)
buzz = np.sign(np.sin(2 * np.pi * 165 * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))
buzz = sosfilt(butter(2, 900, fs=SR, output="sos"), buzz)
pulse = ((tt % 0.21) < 0.15).astype(float)
write("vibra", buzz * pulse, 0.5)

# sino suave do logo
chime = np.zeros(int(1.4 * SR))
for i, f in enumerate([1046.5, 1318.5, 1568.0]):
    b = bell(f, 1.2, 0.35)
    o = int(i * 0.07 * SR)
    chime[o : o + len(b)] += b * (1 - i * 0.15)
write("chime", chime, 0.7)

(OUT / "LICENSE-KENNEY.txt").write_text(
    "Sons tap/open/close/success/scroll/pop/select: Kenney Interface Sounds (www.kenney.nl), licença CC0.\n"
    "Demais sons: sintetizados por scripts/build_sfx.py.\n"
)
print(sorted(p.name for p in OUT.glob("*.wav")))
