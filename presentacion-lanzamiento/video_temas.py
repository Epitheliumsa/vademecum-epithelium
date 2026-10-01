# Videos de fondo por tema para las portadas (10 s en bucle, 1280x720): mismo degradado verde Epithelium,
# y un motivo que hace referencia a cada punto. Uso: python3 video_temas.py [tema ...]
import math, random, subprocess, sys, imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
W, H, FPS, SEG = 1280, 720, 24, 10
S = __file__.rsplit('/', 1)[0]
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BLANCO = (255, 255, 255)
AMARILLO = (255, 192, 0)

def grad(c1=(8, 110, 70), c2=(121, 160, 47)):
    g = Image.new('RGB', (W, H)); px = g.load()
    for y in range(H):
        for x in range(W):
            t = (x / W) * 0.55 + (y / H) * 0.45
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return g
BG = grad()
# Máscara: el motivo se atenúa en la franja del título (arriba) y del subtítulo (abajo a la izquierda) para que se lean
MASK = Image.new('L', (W, H), 255); _m = MASK.load()
for y in range(H):
    for x in range(W):
        v = 255
        if y < 170: v = int(40 + 215 * max(0, (y - 110) / 60))
        if x < 600 and y > 600: v = min(v, int(40 + 215 * max(0, (600 - y + 0) / 1 if False else 0)))
        _m[x, y] = v
MASK = MASK.filter(ImageFilter.GaussianBlur(25))
def pegar(im, c):
    c.putalpha(ImageChops.multiply(c.getchannel('A'), MASK)); im.paste(c, (0, 0), c)

def bokeh(rnd):
    return [dict(x=rnd.uniform(0, W), y=rnd.uniform(0, H), r=rnd.uniform(40, 130), ph=rnd.uniform(0, 6.28)) for _ in range(8)]
def capa_bokeh(bs, t):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    for b in bs:
        a = int(16 + 12 * math.sin(t + b['ph']))
        d.ellipse([b['x'] - b['r'], b['y'] - b['r'], b['x'] + b['r'], b['y'] + b['r']], fill=(255, 255, 255, a))
    return c.filter(ImageFilter.GaussianBlur(18))

# ---------------------------------------------------------------- 1. Guía de etiquetas: etiquetas que suben flotando
def etiquetas():
    rnd = random.Random(11); bs = bokeh(rnd)
    nombres = ['Nuevo', 'Foco', 'Transición-Impulso', 'Portafolio', 'Cliente', 'Consultorio', 'Nuevo', 'Foco', 'Portafolio', 'Cliente']
    tags = [dict(n=n, x=rnd.uniform(380, W - 120), y0=rnd.uniform(0, H + 200), v=rnd.choice([1, 2]), s=rnd.choice([22, 26, 30]),
                 ph=rnd.uniform(0, 6.28), dor=rnd.random() < 0.3) for n in nombres * 2]
    fuentes = {s: ImageFont.truetype(FB, s) for s in (22, 26, 30)}
    def cuadro(t):
        im = BG.copy(); c = capa_bokeh(bs, t); im.paste(c, (0, 0), c)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
        for g in tags:
            y = (g['y0'] - g['v'] * (H + 260) * t / (2 * math.pi)) % (H + 260) - 130
            x = g['x'] + 25 * math.sin(t + g['ph'])
            f = fuentes[g['s']]; tw = d.textlength(g['n'], font=f); hh = g['s'] + 18
            col = (*AMARILLO, 200) if g['dor'] else (255, 255, 255, 165)
            d.rounded_rectangle([x, y, x + tw + 52, y + hh], radius=hh // 2, outline=col, width=3, fill=(255, 255, 255, 28))
            d.ellipse([x + 14, y + hh / 2 - 6, x + 26, y + hh / 2 + 6], fill=col)
            d.text((x + 36, y + 8), g['n'], font=f, fill=col)
        pegar(im, c); return im
    return cuadro

# ---------------------------------------------------------------- 2. Reestructuración zonas: pines por zona y contactos que pasan de una zona a otra
def zonas():
    rnd = random.Random(23); bs = bokeh(rnd)
    centros = [(600, 290), (930, 250), (760, 520), (1090, 500)]   # 4 zonas
    pines = [dict(z=k, x=cx + rnd.gauss(0, 70), y=cy + rnd.gauss(0, 55), ph=rnd.uniform(0, 6.28)) for k, (cx, cy) in enumerate(centros) for _ in range(9)]
    viajes = [dict(a=rnd.randrange(4), b=rnd.randrange(4), ph=rnd.uniform(0, 1)) for _ in range(10)]
    def pin(d, x, y, col, esc=1.0):
        r = 11 * esc
        d.ellipse([x - r, y - 2.2 * r, x + r, y - 0.2 * r], fill=col)
        d.polygon([(x - r * 0.8, y - 1.0 * r), (x + r * 0.8, y - 1.0 * r), (x, y + 0.6 * r)], fill=col)
        d.ellipse([x - r * 0.4, y - 1.6 * r, x + r * 0.4, y - 0.8 * r], fill=(20, 110, 70, 255))
    def cuadro(t):
        im = BG.copy(); c = capa_bokeh(bs, t); im.paste(c, (0, 0), c)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
        for k, (cx, cy) in enumerate(centros):   # zona: halo que respira
            r = 150 + 10 * math.sin(t + k)
            d.ellipse([cx - r, cy - r * 0.8, cx + r, cy + r * 0.8], outline=(255, 255, 255, 60), width=3)
        for i, p in enumerate(pines):   # rutas punteadas dentro de cada zona
            for q in pines[i + 1:]:
                if q['z'] == p['z'] and math.hypot(q['x'] - p['x'], q['y'] - p['y']) < 110:
                    n = 8
                    for s in range(n):
                        if s % 2: continue
                        a, b = s / n, (s + 1) / n
                        d.line([p['x'] + (q['x'] - p['x']) * a, p['y'] + (q['y'] - p['y']) * a, p['x'] + (q['x'] - p['x']) * b, p['y'] + (q['y'] - p['y']) * b], fill=(255, 255, 255, 70), width=2)
        for p in pines:
            puls = (t / (2 * math.pi) + p['ph'] / 6.28) % 1
            d.ellipse([p['x'] - 30 * puls, p['y'] - 12 * puls, p['x'] + 30 * puls, p['y'] + 12 * puls], outline=(255, 255, 255, int(120 * (1 - puls))), width=2)
            pin(d, p['x'], p['y'], (255, 255, 255, 190), 0.9)
        for v in viajes:   # contactos que cambian de zona
            if v['a'] == v['b']: continue
            u = (t / (2 * math.pi) * 2 + v['ph']) % 1
            (ax, ay), (bx, by) = centros[v['a']], centros[v['b']]
            mx, my = (ax + bx) / 2, min(ay, by) - 120
            x = (1 - u) ** 2 * ax + 2 * (1 - u) * u * mx + u ** 2 * bx; y = (1 - u) ** 2 * ay + 2 * (1 - u) * u * my + u ** 2 * by
            pin(d, x, y, (*AMARILLO, int(230 * math.sin(math.pi * u))), 1.2)
        pegar(im, c); return im
    return cuadro

# ---------------------------------------------------------------- 3. Vademécum: moléculas (anillos hexagonales) y cápsulas
def vademecum():
    rnd = random.Random(31); bs = bokeh(rnd)
    mols = [dict(x=rnd.uniform(420, W - 60), y=rnd.uniform(60, H - 60), r=rnd.uniform(26, 48), rot=rnd.uniform(0, 6.28), w=rnd.choice([-1, 1]),
                 n=rnd.choice([1, 2, 2, 3]), ph=rnd.uniform(0, 6.28)) for _ in range(9)]
    caps = [dict(x=rnd.uniform(380, W - 80), y0=rnd.uniform(0, H), a=rnd.uniform(0, 3.14), ph=rnd.uniform(0, 6.28), dor=rnd.random() < 0.4) for _ in range(9)]
    def hexa(d, cx, cy, r, ang, col):
        pts = [(cx + r * math.cos(ang + k * math.pi / 3), cy + r * math.sin(ang + k * math.pi / 3)) for k in range(6)]
        d.line(pts + [pts[0]], fill=col, width=3)
        for x, y in pts: d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=col)
        return pts
    def cuadro(t):
        im = BG.copy(); c = capa_bokeh(bs, t); im.paste(c, (0, 0), c)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
        for m in mols:
            ang = m['rot'] + m['w'] * t / 2; cx = m['x'] + 18 * math.sin(t + m['ph']); cy = m['y'] + 14 * math.cos(t + m['ph'])
            col = (255, 255, 255, 150)
            for k in range(m['n']):   # anillos fusionados
                ox = k * m['r'] * math.sqrt(3) * math.cos(ang + math.pi / 6); oy = k * m['r'] * math.sqrt(3) * math.sin(ang + math.pi / 6)
                pts = hexa(d, cx + ox, cy + oy, m['r'], ang, col)
            x, y = pts[0]; ex, ey = x + 30 * math.cos(ang), y + 30 * math.sin(ang)
            d.line([x, y, ex, ey], fill=col, width=3); d.ellipse([ex - 7, ey - 7, ex + 7, ey + 7], fill=(*AMARILLO, 210))
        for p in caps:   # cápsulas que flotan y giran
            y = (p['y0'] - 60 * t) % (H + 120) - 60; x = p['x'] + 20 * math.sin(t + p['ph']); a = p['a'] + t / 3
            L, R = 34, 13; dx, dy = L * math.cos(a), L * math.sin(a)
            col1 = (*AMARILLO, 190) if p['dor'] else (255, 255, 255, 170)
            d.line([x - dx, y - dy, x, y], fill=col1, width=2 * R); d.ellipse([x - dx - R, y - dy - R, x - dx + R, y - dy + R], fill=col1)
            d.line([x, y, x + dx, y + dy], fill=(255, 255, 255, 110), width=2 * R); d.ellipse([x + dx - R, y + dy - R, x + dx + R, y + dy + R], fill=(255, 255, 255, 110))
        pegar(im, c); return im
    return cuadro

# ---------------------------------------------------------------- 4. Visita Comercial: ruta con paradas que se marcan como visitadas
def visita():
    rnd = random.Random(41); bs = bokeh(rnd)
    pts = [(360, 600), (480, 470), (640, 520), (740, 360), (900, 420), (980, 250), (1140, 300), (1210, 140)]
    seg = [math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) for i in range(len(pts) - 1)]; tot = sum(seg)
    def en(u):
        d0 = u * tot
        for i, s in enumerate(seg):
            if d0 <= s: f = d0 / s; return pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f, i
            d0 -= s
        return pts[-1][0], pts[-1][1], len(seg)
    def cuadro(t):
        im = BG.copy(); c = capa_bokeh(bs, t); im.paste(c, (0, 0), c)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
        for gx in range(5):   # calendario tenue al fondo
            for gy in range(4):
                x, y = 760 + gx * 92, 470 + gy * 58
                d.rounded_rectangle([x, y, x + 80, y + 48], radius=8, outline=(255, 255, 255, 35), width=2)
        for i in range(len(pts) - 1):
            (x1, y1), (x2, y2) = pts[i], pts[i + 1]; n = int(seg[i] // 18)
            for s in range(0, n, 2):
                a, b = s / n, (s + 1) / n
                d.line([x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b], fill=(255, 255, 255, 120), width=4)
        u = (t / (2 * math.pi)) % 1; mx, my, k = en(u)
        for j, (x, y) in enumerate(pts):
            hecho = j <= k
            d.ellipse([x - 16, y - 16, x + 16, y + 16], fill=(255, 255, 255, 220) if hecho else (255, 255, 255, 70))
            if hecho: d.line([x - 7, y, x - 2, y + 6, x + 8, y - 6], fill=(10, 110, 70, 255), width=4)
        d.ellipse([mx - 13, my - 13, mx + 13, my + 13], fill=(*AMARILLO, 255)); d.ellipse([mx - 26, my - 26, mx + 26, my + 26], outline=(*AMARILLO, 140), width=3)
        pegar(im, c); return im
    return cuadro

# ---------------------------------------------------------------- 5. Cotizador: barras que crecen y cifras que suben
def cotizador():
    rnd = random.Random(53); bs = bokeh(rnd)
    barras = [dict(x=520 + k * 78, h=rnd.uniform(120, 380), ph=rnd.uniform(0, 6.28)) for k in range(9)]
    cifras = [dict(t=rnd.choice(['$', '%', '+', '$', '×', '=']), x=rnd.uniform(380, W - 40), y0=rnd.uniform(0, H), s=rnd.choice([28, 36, 44]), ph=rnd.uniform(0, 6.28)) for _ in range(22)]
    fuentes = {s: ImageFont.truetype(FB, s) for s in (28, 36, 44)}
    def cuadro(t):
        im = BG.copy(); c = capa_bokeh(bs, t); im.paste(c, (0, 0), c)
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
        base = 640
        for k, b in enumerate(barras):
            h = b['h'] * (0.65 + 0.35 * math.sin(t + b['ph']))
            d.rounded_rectangle([b['x'], base - h, b['x'] + 52, base], radius=6, fill=(255, 255, 255, 70 if k % 3 else 120), outline=(255, 255, 255, 150), width=2)
        tops = [(b['x'] + 26, base - b['h'] * (0.65 + 0.35 * math.sin(t + b['ph']))) for b in barras]
        d.line(tops, fill=(*AMARILLO, 220), width=4)
        for x, y in tops: d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(*AMARILLO, 255))
        d.line([480, base, W - 40, base], fill=(255, 255, 255, 120), width=3)
        for g in cifras:
            y = (g['y0'] - 50 * t) % (H + 80) - 40; x = g['x'] + 15 * math.sin(t + g['ph'])
            d.text((x, y), g['t'], font=fuentes[g['s']], fill=(255, 255, 255, 90))
        pegar(im, c); return im
    return cuadro

TEMAS = {'etiquetas': etiquetas, 'zonas': zonas, 'vademecum': vademecum, 'visita': visita, 'cotizador': cotizador}
ff = imageio_ffmpeg.get_ffmpeg_exe()
for nombre in (sys.argv[1:] or TEMAS):
    cuadro = TEMAS[nombre]()
    n = FPS * SEG
    proc = subprocess.Popen([ff, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-crf', '26', '-movflags', '+faststart', f'{S}/vid_{nombre}.mp4'], stdin=subprocess.PIPE)
    for f in range(n):
        im = cuadro(f / n * 2 * math.pi)
        if f == 0: im.save(f'{S}/vid_{nombre}.jpg', quality=90)
        proc.stdin.write(im.convert('RGB').tobytes())
    proc.stdin.close(); proc.wait()
    print('ok', nombre, flush=True)
