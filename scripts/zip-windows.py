"""Zip no formato nativo do Windows (o Explorer às vezes recusa zip gerado no Linux).
Uso: python3 scripts/zip-windows.py <saida.zip> <pasta-base> [subpasta ...]"""
import os, sys, time, zipfile
out, base, *subs = sys.argv[1:]
subs = subs or sorted(os.listdir(base))
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for d in subs:
        for root, _, files in os.walk(os.path.join(base, d)):
            for f in sorted(files):
                p = os.path.join(root, f)
                arc = os.path.relpath(p, base).replace(os.sep, "/")
                zi = zipfile.ZipInfo(arc, date_time=time.localtime(os.path.getmtime(p))[:6])
                zi.create_system = 0; zi.external_attr = 0x20; zi.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(zi, open(p, "rb").read())
print(out)
