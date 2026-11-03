#!/usr/bin/env python3
"""Arma la VISTA PREVIA del Vademécum: una copia de lo que hay en una rama, en la carpeta pruebas/ del sitio, para verla antes de publicar.

Uso (desde la raíz del repositorio): python3 herramientas/vista_previa.py [rama o commit] [--servidor]   (por defecto, la rama actual)
- Se abre en https://epitheliumsa.github.io/vademecum-epithelium/pruebas/  (la app oficial, en la raíz, no se toca).
- Franja naranja "VISTA PREVIA" arriba; sin service worker ni instalación; las sesiones de la vista previa son aparte de las de la app oficial.
- Por defecto usa los datos (data.json, portafolios/, etc.) de esa rama, no los del servidor de Ruta Comercial: así se ven los cambios de datos.
  Con --servidor lee los datos reales del servidor, como la app oficial.
- En la pantalla de ingreso salen botones para entrar sin clave como Equipo, Médico y Comercial (los códigos internos ya están en app.js).
  Los accesos de invitado y de cliente se prueban con su enlace o usuario y clave.
- Para subirla se hace un commit que toque SOLO pruebas/ (y esta herramienta, sw.js si cambió); lo demás de la raíz no se publica hasta el "sí" del usuario.
"""
import io
import re
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
REF = args[0] if args else 'HEAD'
CON_SERVIDOR = '--servidor' in sys.argv
ARCHIVOS = ['index.html', 'app.js', 'styles.css', 'version.txt', 'data.json', 'materias-primas.json', 'producto-terminado.json',
            'categorias.json', 'categorias-productos.json', 'portafolios-index.json', 'portafolios',
            'logo.png', 'logo-blanco.png', 'logo-simbolo.png', 'icons']
SALIDA = RAIZ / 'pruebas'

if SALIDA.exists():
    shutil.rmtree(SALIDA)
SALIDA.mkdir()
existentes = subprocess.run(['git', '-C', str(RAIZ), 'ls-tree', '--name-only', REF], check=True, capture_output=True, text=True).stdout.split()
tar = subprocess.run(['git', '-C', str(RAIZ), 'archive', REF, *[a for a in ARCHIVOS if a in existentes]], check=True, capture_output=True).stdout
tarfile.open(fileobj=io.BytesIO(tar)).extractall(SALIDA)

h = (SALIDA / 'index.html').read_text(encoding='utf-8')
h = re.sub(r'<link rel="manifest"[^>]*>\s*', '', h)
h = h.replace('<title>Vademecum Epithelium</title>', '<title>VISTA PREVIA · Vademecum Epithelium</title>')
h = h.replace('</head>', '<style>body { padding-top: 24px; } #vpFranja { position: fixed; top: 0; left: 0; right: 0; z-index: 2000; background: #b45309; color: #fff; '
              'font: 700 12px Arial, sans-serif; text-align: center; padding: 4px 8px; letter-spacing: .3px; } '
              '#vpEntrar { display: grid; gap: 8px; margin-top: 14px; } #vpEntrar p { margin: 0; font-size: 13px; color: #475569; } '
              '#vpEntrar button { background: #fff; color: #006b4f; border: 1.5px solid #006b4f; }</style></head>', 1)
h = h.replace('<body>', '<body>\n    <div id="vpFranja">🧪 VISTA PREVIA · aún no está publicado' + ('' if CON_SERVIDOR else ' · datos de la rama') + '</div>', 1)
h = h.replace('<p id="errorMsg" class="error"></p>', '<p id="errorMsg" class="error"></p>\n                <div id="vpEntrar"></div>', 1)
(SALIDA / 'index.html').write_text(h, encoding='utf-8')

a = (SALIDA / 'app.js').read_text(encoding='utf-8')
a = a.replace("'vademecum_", "'vp_vademecum_")                                          # sesión aparte de la app oficial
a = a.replace("if ('serviceWorker' in navigator) {", "if (false && 'serviceWorker' in navigator) {")   # sin service worker
if not CON_SERVIDOR:
    a = a.replace("async function desdeServidor(cuerpo, campo, esValido) {", "async function desdeServidor(cuerpo, campo, esValido) {\n    return null;   // vista previa: datos de la rama", 1)
com = re.search(r"usuario: '([^']+)',\s*clave: '([^']+)',\s*tipo: 'comercial'", a)
botones = [('Equipo', '', 'EPITHE-000'), ('Médico', '', 'EPITHE-001')] + ([('Comercial', com.group(1), com.group(2))] if com else [])
a += """
// VISTA PREVIA: entrar sin escribir la clave
(function () {
    const caja = document.getElementById('vpEntrar');
    if (!caja) return;
    caja.innerHTML = '<p>Vista previa: entrar como</p>' + %s.map(([n, u, c]) => `<button type="button" data-u="${u}" data-c="${c}">${n}</button>`).join('');
    caja.addEventListener('click', e => {
        const b = e.target.closest('button[data-c]');
        if (!b) return;
        document.getElementById('accessUser').value = b.dataset.u;
        document.getElementById('accessCode').value = b.dataset.c;
        verificarCodigo();
    });
})();
""" % repr([list(b) for b in botones]).replace("'", '"')
(SALIDA / 'app.js').write_text(a, encoding='utf-8')
print('Vista previa de', REF, 'en', SALIDA, '· versión', (SALIDA / 'version.txt').read_text().strip())
print('Se verá en https://epitheliumsa.github.io/vademecum-epithelium/pruebas/ cuando se suba pruebas/ a main (con el "sí" del usuario).')
