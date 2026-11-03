#!/usr/bin/env python3
"""Crea (o cambia la clave de) un acceso de INVITADO y arma lo que se le entrega: instructivo en PDF y enlace con mensaje.

Uso:
    python3 herramientas/nuevo_invitado.py USUARIO "Nombre para el sello y el saludo" \
        [--detalle "Acceso personal"] [--vence 2026-11-30] [--portafolio HUELLA ...] [--clave XXXXXXXX] \
        [--salida CARPETA] [--sin-instructivo] [--app RUTA_APP_JS]

- Agrega la fila a `INVITADOS` de app.js (o reemplaza la del mismo USUARIO). Solo se guarda la huella PBKDF2-SHA256
  (sal propia, 300.000 iteraciones) de "usuario:clave"; la clave en claro NUNCA va al repositorio.
- La clave es aleatoria de 8 caracteres (sin 0/O/1/I). Con --clave se conserva una ya entregada (se recalcula la huella).
- --portafolio: huella(s) del vademécum de cliente (portafolios-index.json). Una sola -> `portafolio`; varias -> `portafolios`
  (entra directo a un portafolio con todas las tiendas, cada producto con su tienda). El instructivo lo menciona.
- Entrega, en --salida (por defecto ~/entregas): Instructivo_Vademecum_<usuario>.pdf (con sello, sin fecha de vencimiento) y
  Enlace_acceso_<usuario>.txt (enlace, usuario, clave y mensaje de WhatsApp).
- Después: `sh actualizar-version.sh`, probar, y publicar en main solo con el "sí" del usuario (ver CLAUDE.md).
Requisitos: playwright con Chromium, PyMuPDF (ver marca_externos.py).
"""
import argparse
import base64
import hashlib
import json
import re
import secrets
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
ITER = 300000
URL = 'https://epitheliumsa.github.io/vademecum-epithelium/'


def huella(usuario, clave, sal):
    return hashlib.pbkdf2_hmac('sha256', f'{usuario}:{clave.lower()}'.encode(), bytes.fromhex(sal), ITER).hex()


def fila_js(usuario, sal, h, nombre, detalle, vence, portafolios):
    extra = ''
    if len(portafolios) == 1:
        extra = f", portafolio: '{portafolios[0]}'"
    elif portafolios:
        extra = ', portafolios: [' + ', '.join(f"'{x}'" for x in portafolios) + ']'
    esc = lambda t: t.replace("\\", "\\\\").replace("'", "\\'")
    return (f"    {{ usuario: '{usuario}', sal: '{sal}', iter: {ITER}, huella: '{h}', tipo: 'medico', zona: null,\n"
            f"      nombre: '{esc(nombre)}', detalle: '{esc(detalle)}', vence: '{vence}'{extra} }}")


def guardar_en_app(app, usuario, fila):
    s = app.read_text(encoding='utf-8')
    ini = s.index('const INVITADOS = [')
    fin = s.index('\n];', ini)
    bloque = s[ini:fin]
    patron = re.compile(r"    \{ usuario: '%s',.*?\}(?=,\n|\Z)" % re.escape(usuario), re.S)
    if patron.search(bloque):
        bloque = patron.sub(lambda m: fila, bloque, count=1)
    else:
        bloque = bloque + ',\n' + fila
    app.write_text(s[:ini] + bloque + s[fin:], encoding='utf-8')


def tiendas_de(portafolios):
    indice = {c['huella']: c['cliente'] for c in json.loads((RAIZ / 'portafolios-index.json').read_text(encoding='utf-8'))}
    return [indice.get(h, h) for h in portafolios]


def html_instructivo(usuario, clave, nombre, tiendas):
    logo = base64.b64encode((RAIZ / 'logo.png').read_bytes()).decode()
    enlace = f'{URL}#invitado={usuario}:{clave.lower()}'
    if len(tiendas) == 1:
        extra = f'<p>Además, en el inicio encontrarás el botón <b>Vademécum Cliente</b>, con el vademécum de <b>{tiendas[0]}</b>.</p>'
    elif tiendas:
        extra = ('<p>Además, en el inicio encontrarás el botón <b>Vademécum Cliente</b>: ahí están los productos de tus tiendas ('
                 + ', '.join(f'<b>{t}</b>' for t in tiendas) + '), cada uno con el nombre de la tienda que lo maneja.</p>')
    else:
        extra = ''
    return f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
@page{{size:A4;margin:0}}*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#223;font-size:12.5px;line-height:1.5}}
.page{{width:210mm;min-height:297mm;padding:11mm 15mm}}
.top{{display:flex;align-items:center;gap:16px;border-bottom:3px solid #006b4f;padding-bottom:12px;margin-bottom:14px}}
.top img{{height:50px}}.top h1{{color:#006b4f;font-size:20px;line-height:1.15}}.top .sub{{color:#5a7a70;font-size:12.5px;margin-top:2px}}
h2{{color:#006b4f;font-size:14.5px;margin:14px 0 7px;display:flex;align-items:center;gap:8px}}
h2 .n{{background:#006b4f;color:#fff;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12.5px;flex:none}}
p{{margin-bottom:5px}}.box{{background:#eef7f3;border-left:4px solid #009460;border-radius:6px;padding:9px 13px;margin-top:5px}}
.warn{{background:#fff6e9;border-left:4px solid #e0982a;border-radius:6px;padding:9px 13px;margin-top:7px}}
.cols{{display:flex;gap:11px;margin-top:5px}}.card{{flex:1;border:1.5px solid #d7e5e0;border-radius:10px;padding:10px 12px;background:#f7fbf9}}
.card h3{{font-size:13px;color:#00543e;margin-bottom:6px}}ol{{margin:0 0 0 17px}}ol li{{margin-bottom:4px}}ul{{margin:2px 0 0 17px}}ul li{{margin-bottom:3px}}
.cred{{display:flex;gap:10px;margin-top:6px}}.cred div{{flex:1;background:#fff;border:1.5px solid #009460;border-radius:8px;padding:7px 11px}}
.cred small{{display:block;color:#6a7f78;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px}}.cred b{{font-size:15px;color:#00543e;letter-spacing:.5px}}
.key{{background:#eef2f1;border:1px solid #d2ddd9;border-radius:5px;padding:1px 6px;font-weight:600}}
.link{{word-break:break-all;font-weight:600;color:#006b4f}}.muted{{color:#6a7f78}}
.foot{{margin-top:16px;border-top:1px solid #dbe7e2;padding-top:8px;font-size:11px;color:#6a7f78}}
</style></head><body><div class="page">
<div class="top"><img src="data:image/png;base64,{logo}"><div><h1>Instructivo: Vademécum Epithelium</h1><div class="sub">{nombre}</div></div></div>
<h2><span class="n">1</span> Tu acceso</h2>
<p>Este es tu acceso personal al <b>Vademécum Epithelium</b>, al <b>Vademécum Producto Terminado</b> y a las <b>Materias Primas</b>.</p>
{extra}
<div class="box"><p><b>Entra con un toque</b> abriendo este enlace:</p><p class="link">{enlace}</p></div>
<p style="margin-top:7px">Si te pide datos, escribe:</p>
<div class="cred"><div><small>Usuario</small><b>{usuario}</b></div><div><small>Clave</small><b>{clave}</b></div></div>
<p class="muted" style="margin-top:4px">La clave puedes escribirla en mayúsculas o minúsculas.</p>
<h2><span class="n">2</span> Dejar la app en tu pantalla de inicio</h2>
<p>Así queda con su ícono, como una app normal.</p>
<div class="cols">
 <div class="card"><h3>🤖 Android (Chrome)</h3><ol><li>Abre el enlace en <b>Chrome</b>.</li><li>Toca el menú <span class="key">⋮</span> (arriba a la derecha).</li><li>Elige <b>“Instalar aplicación”</b> o <b>“Agregar a pantalla de inicio”</b>.</li><li>Confirma. Listo.</li></ol></div>
 <div class="card"><h3>🍎 iPhone (Safari)</h3><ol><li>Abre el enlace en <b>Safari</b>.</li><li>Toca <b>Compartir</b> <span class="key">⬆️</span> (abajo).</li><li>Elige <b>“Agregar a inicio”</b> y toca <b>Agregar</b>.</li><li>Abre la app desde el ícono y, si te lo pide, escribe tu usuario y clave (solo la primera vez).</li></ol></div>
 <div class="card"><h3>💻 Computador</h3><ol><li>Abre el enlace en <b>Chrome</b> o <b>Edge</b>.</li><li>En la barra de direcciones, toca el ícono <b>“Instalar”</b> <span class="key">⊕</span>.</li><li>Confirma. Se abre como una aplicación.</li></ol></div>
</div>
<h2><span class="n">3</span> Usar sin internet</h2>
<div class="box"><p><b>Paso clave:</b> abre la app <u>una vez con internet</u>. Así se guarda en tu equipo.</p></div>
<ul style="margin-top:6px"><li>✅ <b>Vademécum Epithelium</b>, ✅ <b>Producto Terminado</b> y ✅ <b>Materias Primas</b> se consultan sin señal.{' Tu Vademécum Cliente necesita internet.' if tiendas else ''}</li><li>Cuando vuelvas a tener internet se actualiza sola. Si aparece <b>“Hay una versión nueva”</b>, toca <b>Actualizar</b>.</li></ul>
<h2><span class="n">4</span> Qué debes saber</h2>
<ul><li>El acceso es <b>personal e intransferible</b>. Las pantallas muestran una marca de agua con tu nombre.</li>
<li>Si la app te indica que tu acceso finalizó, o necesitas cambiar tu clave, comunícate con tu proveedor Epithelium.</li>
<li>No compartas el enlace ni la clave con otras personas.</li></ul>
<div class="warn" style="text-align:justify;font-size:10.5px;line-height:1.4"><p style="margin-bottom:0"><b>© {__import__('datetime').date.today().year} Epithelium S.A. Todos los derechos reservados.</b> La presente aplicación, sus contenidos, bases de datos, código fuente y material gráfico son propiedad exclusiva de Epithelium S.A. Queda estrictamente prohibida su reproducción, adaptación, distribución, comercialización, transmisión o divulgación, total o parcial, por cualquier medio, sin la autorización previa, expresa y por escrito de Epithelium S.A. Información confidencial y de uso exclusivo para usuarios autorizados.</p></div>
<div class="foot">Epithelium S.A. · Si tienes problemas para ingresar, comunícate con tu proveedor Epithelium.</div>
</div></body></html>"""


def pdf_instructivo(html, destino, nombre):
    from playwright.sync_api import sync_playwright
    from marca_externos import aplicar_a_pdf
    with tempfile.TemporaryDirectory() as tmp:
        ruta_html, base = Path(tmp) / 'instr.html', Path(tmp) / 'base.pdf'
        ruta_html.write_text(html, encoding='utf-8')
        with sync_playwright() as p:
            try:
                nav = p.chromium.launch()
            except Exception:
                nav = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
            pag = nav.new_page()
            pag.goto(ruta_html.as_uri(), wait_until='networkidle')
            pag.pdf(path=str(base), format='A4', print_background=True)
            alto = pag.evaluate("document.querySelector('.page').scrollHeight")
            nav.close()
        if alto > 1130:
            print(f'AVISO: el instructivo pasa de una página ({alto}px); acorta el texto', file=sys.stderr)
        aplicar_a_pdf(str(base), str(destino), nombre, pie=False)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('usuario')
    ap.add_argument('nombre')
    ap.add_argument('--detalle', default='Acceso personal')
    ap.add_argument('--vence', default='2026-11-30')
    ap.add_argument('--portafolio', action='append', default=[], metavar='HUELLA')
    ap.add_argument('--clave')
    ap.add_argument('--salida', default=str(Path.home() / 'entregas'))
    ap.add_argument('--sin-instructivo', action='store_true')
    ap.add_argument('--app', default=str(RAIZ / 'app.js'))
    a = ap.parse_args()
    usuario = a.usuario.strip().lower()
    clave = (a.clave or ''.join(secrets.choice(ALFABETO) for _ in range(8))).upper()
    sal = secrets.token_hex(16)
    guardar_en_app(Path(a.app), usuario, fila_js(usuario, sal, huella(usuario, clave, sal), a.nombre, a.detalle, a.vence, a.portafolio))
    print(f'Acceso "{usuario}" guardado en {a.app} (solo la huella). Falta: sh actualizar-version.sh, probar y publicar con el sí del usuario.')
    salida = Path(a.salida)
    salida.mkdir(parents=True, exist_ok=True)
    enlace = f'{URL}#invitado={usuario}:{clave.lower()}'
    (salida / f'Enlace_acceso_{usuario}.txt').write_text(
        f'ENLACE DE ACCESO ({a.nombre})\n{enlace}\n\nUSUARIO: {usuario}\nCLAVE: {clave}\n\n---- MENSAJE PARA WHATSAPP ----\n'
        f'Hola, te comparto tu acceso personal al Vademécum Epithelium. Entra con este enlace:\n{enlace}\n\n'
        f'Si te pide datos, usuario: {usuario} / clave: {clave}\nAdjunto el instructivo para instalarlo en tu celular o computador.\n'
        'El acceso es personal e intransferible; la información es de uso exclusivo y confidencial de Epithelium S.A.\n', encoding='utf-8')
    if not a.sin_instructivo:
        pdf_instructivo(html_instructivo(usuario, clave, a.nombre, tiendas_de(a.portafolio)), salida / f'Instructivo_Vademecum_{usuario}.pdf', a.nombre)
    print(f'Entregables en {salida}: Enlace_acceso_{usuario}.txt' + ('' if a.sin_instructivo else f' y Instructivo_Vademecum_{usuario}.pdf'))
    print(f'CLAVE: {clave}  (solo para el usuario; no se guarda en el repositorio)')


if __name__ == '__main__':
    main()
