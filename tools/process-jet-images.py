"""Clean and normalise the generated side-view jet PNGs into WebP for the app.
Usage: python3 tools/process-jet-images.py <folder-with-*-side.png>
- removes cutout residue: faint halos and the grey shadow boxes left under the gear
- crops to the aircraft, scales every jet onto the same 1560x600 canvas, wheels on one baseline
- writes img/jets/<id>-side-780.webp and -1560.webp"""
import sys, glob, os
from PIL import Image, ImageFilter

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'img', 'jets')
W, H = 1560, 600
os.makedirs(OUT, exist_ok=True)

for f in sorted(glob.glob(os.path.join(SRC, '*-side.png'))):
    jid = os.path.basename(f).replace('-side.png', '')
    im = Image.open(f).convert('RGBA')
    r, g, b, a = im.split()
    # 1) drop faint fringe and translucent shadow boxes (real aircraft pixels are opaque)
    a = a.point(lambda v: 0 if v < 170 else (255 if v > 235 else v))
    # 2) remove isolated specks: erode then dilate the mask once
    mask = a.point(lambda v: 255 if v > 0 else 0).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    a = Image.composite(a, Image.new('L', a.size, 0), mask)
    im = Image.merge('RGBA', (r, g, b, a))
    bb = a.getbbox()
    jet = im.crop(bb)
    # 3) fit onto the common canvas: 94% width or 88% height, bottom-aligned on a shared ground line
    s = min(W * 0.94 / jet.width, H * 0.88 / jet.height)
    jet = jet.resize((round(jet.width * s), round(jet.height * s)), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(jet, ((W - jet.width) // 2, H - jet.height - int(H * 0.06)))
    for w, q in ((1560, 80), (780, 78)):
        out = canvas if w == W else canvas.resize((w, round(H * w / W)), Image.LANCZOS)
        p = os.path.join(OUT, f'{jid}-side-{w}.webp')
        out.save(p, 'WEBP', quality=q, method=6)
    print(jid, 'ok', os.path.getsize(os.path.join(OUT, f'{jid}-side-780.webp')) // 1024, 'KB /', os.path.getsize(os.path.join(OUT, f'{jid}-side-1560.webp')) // 1024, 'KB')
