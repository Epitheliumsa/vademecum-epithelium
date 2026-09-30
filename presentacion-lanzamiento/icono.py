# Ícono propio de Ruta Comercial: mismo estilo del Vademécum, con "VISITA COMERCIAL"
from PIL import Image, ImageDraw, ImageFont
base = Image.open('/home/user/epitheliumsa/ruta-comercial/icons/icon-512.png').convert('RGBA')
VERDE = (0, 148, 96, 255)
circ = base.crop((84, 32, 429, 377))            # círculo blanco con el logo
m = Image.new('L', circ.size, 0); ImageDraw.Draw(m).ellipse([0, 0, circ.width - 1, circ.height - 1], fill=255)
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def icono(S=512, fondo=VERDE, texto='white'):
    im = Image.new('RGBA', (512 * 4, 512 * 4), fondo)   # se dibuja a 4x y se reduce (bordes suaves)
    d = ImageDraw.Draw(im)
    r = 140 * 4; cx, cy = 256 * 4, 180 * 4
    c = circ.resize((2 * r, 2 * r), Image.LANCZOS); mm = m.resize((2 * r, 2 * r), Image.LANCZOS)
    im.paste(c, (cx - r, cy - r), mm)
    for t, y, tam in (('VISITA', 342, 54), ('COMERCIAL', 404, 50)):
        f = ImageFont.truetype(F, tam * 4)
        w = d.textlength(t, font=f)
        d.text(((512 * 4 - w) / 2, y * 4), t, font=f, fill=texto)
    return im.resize((S, S), Image.LANCZOS)

OPCIONES = {'A': ((121, 160, 47, 255), 'white'), 'B': ((59, 91, 26, 255), 'white'), 'C': ((255, 192, 0, 255), (59, 91, 26))}
if __name__ == '__main__':
    import sys
    op = sys.argv[1] if len(sys.argv) > 1 else None
    if op:
        f, t = OPCIONES[op]
        icono(512, f, t).save('icono_visita/icon-512.png', optimize=True)
        icono(192, f, t).save('icono_visita/icon-192.png', optimize=True)
        icono(180, f, t).convert('RGB').save('icono_visita/apple-touch-icon.png', optimize=True)
