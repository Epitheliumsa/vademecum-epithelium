# Íconos de Visita Comercial, opción D: fondo blanco, borde y texto verde Epithelium, esquinas redondeadas (igual que el Vademécum)
import math, subprocess, io
from PIL import Image, ImageDraw
exec(open('icono.py').read().split("if __name__")[0])
def redondear(im, rad=112 / 512):
    im = im.convert('RGBA'); W = im.width
    m = Image.new('L', (W * 4, W * 4), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, W * 4 - 1, W * 4 - 1], radius=int(rad * W * 4), fill=255)
    im.putalpha(m.resize((W, W), Image.LANCZOS)); return im
D = '/home/user/ruta-comercial/icons/'
VERDE = (0, 148, 96, 255)
BLANCO = (255, 255, 255, 255)
def con_borde(im, rad=112 / 512, grosor=0.022, redondo=True):
    W = im.width; big = im.resize((W * 4, W * 4), Image.LANCZOS)
    g = max(2, int(grosor * W * 4)); r = int(rad * W * 4)
    ImageDraw.Draw(big).rounded_rectangle([g // 2, g // 2, W * 4 - 1 - g // 2, W * 4 - 1 - g // 2], radius=r - g // 2, outline=VERDE, width=g)
    out = big.resize((W, W), Image.LANCZOS)
    return redondear(out, rad) if redondo else out
con_borde(icono(512, BLANCO, VERDE[:3])).save(D + 'icon-512.png', optimize=True)
con_borde(icono(192, BLANCO, VERDE[:3])).save(D + 'icon-192.png', optimize=True)
con_borde(icono(180, BLANCO, VERDE[:3]), redondo=False).convert('RGB').save(D + 'apple-touch-icon.png', optimize=True)
# Sin texto (maskable y favicon): se parte del original (fondo verde + círculo blanco + logo) y se invierte:
# fondo blanco y un aro verde alrededor del círculo del logo
for nombre in ['icon-512-maskable.png', 'icon-192-maskable.png', 'favicon-32.png', 'favicon-16.png']:
    orig = Image.open(io.BytesIO(subprocess.check_output(['git', '-C', '/home/user/ruta-comercial', 'show', 'main~1:icons/' + nombre]))).convert('RGBA')
    W, H = orig.size; px = orig.load()
    blancos = [(x, y) for y in range(H) for x in range(W) if min(px[x, y][:3]) > 245]
    cx = sum(p[0] for p in blancos) / len(blancos); cy = sum(p[1] for p in blancos) / len(blancos)
    r = max(math.hypot(x - cx, y - cy) for x, y in blancos)
    nuevo = orig.copy(); q = nuevo.load()
    for y in range(H):
        for x in range(W):
            if math.hypot(x - cx, y - cy) < r - max(1, W / 64): continue
            q[x, y] = (255, 255, 255, px[x, y][3])
    S = 4; big = nuevo.resize((W * S, H * S), Image.LANCZOS)
    g = max(S, int(W * S * 0.035))
    ImageDraw.Draw(big).ellipse([cx * S - r * S - g / 2, cy * S - r * S - g / 2, cx * S + r * S + g / 2, cy * S + r * S + g / 2], outline=VERDE, width=g)
    big.resize((W, H), Image.LANCZOS).save(D + nombre, optimize=True)
print('ok')
