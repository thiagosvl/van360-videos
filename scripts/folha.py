# Junta stills inteiros lado a lado (para conferir). Uso: python3 scripts/folha.py saida.png a.png b.png ...
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).resize((360, 640)) for f in files]
W = Image.new("RGB", (370 * len(ims) - 10, 640), "white")
for i, im in enumerate(ims):
    W.paste(im, (i * 370, 0))
W.save(out)
