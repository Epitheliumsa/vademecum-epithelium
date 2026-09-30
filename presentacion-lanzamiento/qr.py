import qrcode
from PIL import Image, ImageDraw, ImageFont
from qrcode.constants import ERROR_CORRECT_H
logo = Image.open('/home/user/vademecum-epithelium/logo-simbolo.png').convert('RGBA')
apps = [('Vademecum', 'Vademécum Epithelium', 'https://epitheliumsa.github.io/vademecum-epithelium/'),
        ('RutaComercial', 'Ruta Comercial (Visita)', 'https://epitheliumsa.github.io/ruta-comercial/')]
for nombre, titulo, url in apps:
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=20, border=4)
    q.add_data(url); q.make(fit=True)
    img = q.make_image(fill_color='#3B5B1A', back_color='white').convert('RGBA')
    w = img.size[0]; s = int(w * 0.18)
    lg = logo.copy(); lg.thumbnail((s, s))
    pad = 12
    box = Image.new('RGBA', (lg.size[0] + 2*pad, lg.size[1] + 2*pad), 'white')
    box.paste(lg, (pad, pad), lg)
    img.paste(box, ((w - box.size[0])//2, (w - box.size[1])//2))
    img.convert('RGB').save(f'202609QR {nombre}.png')
    print(nombre, img.size)
