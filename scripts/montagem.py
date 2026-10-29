# Junta stills lado a lado (metade do tamanho) para conferir de uma vez.
# Uso: python3 scripts/montagem.py saida.png a.png b.png ...
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).crop((200, 440, 880, 1820)).resize((340, 690)) for f in files]
W = Image.new("RGB", (340 * len(ims), 690), "white")
for i, im in enumerate(ims):
    W.paste(im, (340 * i, 0))
W.save(out)
