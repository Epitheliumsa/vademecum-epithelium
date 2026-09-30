# Video de fondo para las portadas: degradado verde Epithelium con "nodos" que flotan y se conectan (motivo del logo)
import math, random, subprocess, imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter
W, H, FPS, SEG = 1280, 720, 24, 10
random.seed(7)
S = __file__.rsplit('/', 1)[0]
def grad():
    g = Image.new('RGB', (W, H))
    px = g.load()
    for y in range(H):
        for x in range(0, W):
            t = (x / W) * 0.55 + (y / H) * 0.45
            c1, c2 = (8, 110, 70), (121, 160, 47)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return g
BG = grad()
nodos = [dict(x=random.uniform(0, W), y=random.uniform(0, H), r=random.uniform(3, 9), ax=random.uniform(20, 60), ay=random.uniform(15, 45),
              fx=random.choice([1, 2]), fy=random.choice([1, 2]), ph=random.uniform(0, 6.28)) for _ in range(38)]
bokeh = [dict(x=random.uniform(0, W), y=random.uniform(0, H), r=random.uniform(40, 130), ph=random.uniform(0, 6.28)) for _ in range(9)]
n = FPS * SEG
for f in range(n):
    t = f / n * 2 * math.pi
    im = BG.copy()
    capa = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(capa)
    for b in bokeh:
        a = int(18 + 14 * math.sin(t + b['ph']))
        d.ellipse([b['x'] - b['r'], b['y'] - b['r'], b['x'] + b['r'], b['y'] + b['r']], fill=(255, 255, 255, a))
    capa = capa.filter(ImageFilter.GaussianBlur(18))
    im.paste(capa, (0, 0), capa)
    capa = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(capa)
    pts = [(o['x'] + o['ax'] * math.sin(o['fx'] * t + o['ph']), o['y'] + o['ay'] * math.cos(o['fy'] * t + o['ph']), o['r']) for o in nodos]
    for i, (x1, y1, _) in enumerate(pts):
        for x2, y2, _ in pts[i + 1:]:
            dist = math.hypot(x2 - x1, y2 - y1)
            if dist < 190:
                d.line([x1, y1, x2, y2], fill=(255, 255, 255, int(70 * (1 - dist / 190))), width=2)
    for x, y, r in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 150))
        d.ellipse([x - r * 0.45, y - r * 0.45, x + r * 0.45, y + r * 0.45], fill=(255, 192, 0, 200))
    im.paste(capa, (0, 0), capa)
    im.save(f'{S}/vid/f{f:04d}.png')
    if f == 0: im.save(f'{S}/vid/poster.png')
ff = imageio_ffmpeg.get_ffmpeg_exe()
subprocess.run([ff, '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', f'{S}/vid/f%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                '-profile:v', 'main', '-crf', '26', '-movflags', '+faststart', f'{S}/portada.mp4'], check=True)
print('ok')
