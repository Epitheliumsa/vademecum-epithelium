#!/usr/bin/env python3
"""Accesos de invitado en LOTE a partir del Excel "Acceso médicos a Vademécums cliente" que devuelve la fuerza de ventas.

Dos pasos (la clave en claro solo queda en el plan y en los entregables; a app.js solo va la huella):

  1) python3 herramientas/accesos_lote.py plan EXCEL.xlsx [--vence AAAA-MM-DD] [--plan RUTA.json]
     - Quita de la hoja "Vademécums cliente" los que dicen "Retirar" en Observaciones (y de la lista de cada médico).
     - Por cada médico de la hoja "Médicos 20-21-22" crea un acceso (usuario, clave de 8 caracteres, huella) en INVITADOS:
         * sin Vademécum cliente  -> ve Lo Nuevo, Vademécum Epithelium, Producto Terminado y Materias Primas
         * con Vademécum(s) de cliente -> lo anterior + "Vademécum Cliente" (una tienda: `portafolio`; varias: `portafolios`)
         * con "Vademecum CDFLL" -> menú limitado: solo Producto Terminado y Materias Primas (`solo`)
     - Los accesos que ya existen (EXISTENTES) se conservan intactos.
     - Guarda el plan (con las claves) en --plan (por defecto ~/lote/plan.json) y el Excel final sin claves.
  2) python3 herramientas/accesos_lote.py docs [--plan RUTA.json] [--zona "Zona Sur"] [--salida CARPETA]
     - Instructivo PDF (con sello, sin fecha de vencimiento) y enlace por médico, en carpetas por zona; más el maestro de claves.
Después: `sh actualizar-version.sh`, probar y publicar solo con el "sí" del usuario (ver CLAUDE.md).
"""
import argparse
import base64
import json
import re
import secrets
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import nuevo_invitado as ni   # noqa: E402

EXISTENTES = {'Nestor Humberto Peña Bocanegra': 'npena', 'Natalia Hernandez Mantilla': 'nhernandez'}
CDFLL = 'Vademecum CDFLL'
TITULOS = {'dr', 'dra', 'doctor', 'doctora', 'cm'}
HOME = Path.home() / 'lote'


def sin_tildes(t):
    return ''.join(c for c in unicodedata.normalize('NFD', t) if not unicodedata.combining(c))


def nombre_limpio(n):
    n = re.sub(r'\s+', ' ', str(n)).strip()
    if ',' in n:
        n = n.split(',')[-1].strip()
    return n


def usuario_de(nombre, usados):
    t = [re.sub(r'[^a-z]', '', sin_tildes(x).lower()) for x in nombre.split()]
    t = [x for x in t if x and x not in TITULOS]
    base = (t[0] + (t[-1] if len(t) > 1 else '')) or 'medico'
    u, k = base, 2
    while u in usados:
        u, k = f'{base}{k}', k + 1
    return u


def cmd_plan(a):
    from openpyxl import load_workbook
    wb = load_workbook(a.excel)
    indice = {c['cliente']: c['huella'] for c in json.loads((RAIZ / 'portafolios-index.json').read_text(encoding='utf-8'))}
    hv = wb['Vademécums cliente']
    retirar = {r[0] for r in hv.iter_rows(min_row=2, values_only=True) if str(r[6] or '').strip().lower() == 'retirar'}
    app = (RAIZ / 'app.js').read_text(encoding='utf-8')
    usados = set(re.findall(r"usuario: '([^']+)', sal:", app))
    medicos, plan = [], []
    for r in wb['Médicos 20-21-22'].iter_rows(min_row=2, values_only=True):
        if not r[2]:
            continue
        zona, vend, nombre = r[0], r[1], str(r[2]).strip()
        lista = [x for x in r[6:11] if x and x not in retirar]
        quitados = [x for x in r[6:11] if x in retirar]
        fila = {'zona': zona, 'vendedor': vend, 'medico': nombre, 'clasificacion': r[3], 'ciudad': r[5], 'vademecums': lista, 'retirados': quitados}
        if nombre in EXISTENTES:
            fila.update(usuario=EXISTENTES[nombre], tipo='Existente (se conserva)')
            plan.append(fila)
            continue
        if CDFLL in lista:
            fila.update(tipo='CDFLL: solo Producto Terminado y Materias Primas', solo=['producto-terminado', 'materias-primas'], portafolios=[])
        else:
            huellas = [indice[x] for x in lista]
            fila.update(tipo='Completo' + (f' + Vademécum Cliente ({len(huellas)})' if huellas else ''), solo=[], portafolios=huellas)
        nom = nombre_limpio(nombre)
        fila['nombre'] = nom
        fila['usuario'] = usuario_de(nom, usados)
        usados.add(fila['usuario'])
        fila['clave'] = ''.join(secrets.choice(ni.ALFABETO) for _ in range(8))
        fila['sal'] = secrets.token_hex(16)
        fila['huella'] = ni.huella(fila['usuario'], fila['clave'], fila['sal'])
        plan.append(fila)
    nuevas = [p for p in plan if p.get('clave')]
    bloque = ',\n'.join(ni.fila_js(p['usuario'], p['sal'], p['huella'], p['nombre'], 'Acceso personal', a.vence, p['portafolios'], p['solo']) for p in nuevas)
    ini = app.index('const INVITADOS = [')
    fin = app.index('\n];', ini)
    app = app[:fin].rstrip().rstrip(',') + ',\n' + bloque + app[fin:]
    (RAIZ / 'app.js').write_text(app, encoding='utf-8')
    Path(a.plan).parent.mkdir(parents=True, exist_ok=True)
    Path(a.plan).write_text(json.dumps({'vence': a.vence, 'retirar': sorted(retirar), 'plan': plan}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(nuevas)} accesos nuevos en app.js; {len(plan) - len(nuevas)} existentes conservados; vademécums retirados: {len(retirar)}')
    print('Plan (con claves) en', a.plan)


def excel_final(a, datos):
    """Excel de la fuerza de ventas, sin los "Retirar" y con el usuario y tipo de acceso de cada médico (sin claves)."""
    from openpyxl import load_workbook
    from openpyxl.styles import Alignment
    from openpyxl.worksheet.table import Table, TableStyleInfo
    wb = load_workbook(a.excel)
    hv = wb['Vademécums cliente']
    quitar = [i for i, r in enumerate(hv.iter_rows(min_row=1, values_only=True), 1) if i > 1 and r[0] in set(datos['retirar'])]
    for i in reversed(quitar):
        hv.delete_rows(i)
    n = hv.max_row
    for t in list(hv.tables.values()):
        t.ref = f'A1:{hv.cell(1, hv.max_column).column_letter}{n}'
        if t.autoFilter:
            t.autoFilter.ref = t.ref
    lst = wb['Listas']
    nombres = [r[0] for r in hv.iter_rows(min_row=2, values_only=True) if r[0]]
    lst.delete_rows(1, lst.max_row)
    for i, v in enumerate(nombres, 1):
        lst.cell(i, 1, v)
    hm = wb['Médicos 20-21-22']
    por = {p['medico']: p for p in datos['plan']}
    cols = {c.value: i for i, c in enumerate(hm[1], 1)}
    hm.cell(1, 13, 'Usuario')
    hm.cell(1, 14, 'Tipo de acceso')
    for i, r in enumerate(hm.iter_rows(min_row=2), 2):
        p = por.get(str(r[2].value or '').strip())
        for k in range(7, 12):
            hm.cell(i, k).value = None
        if p:
            for k, v in enumerate(p['vademecums'][:5]):
                hm.cell(i, 7 + k).value = v
            hm.cell(i, 13, p['usuario'])
            hm.cell(i, 14, p['tipo'])
        for k in (13, 14):
            hm.cell(i, k).alignment = Alignment(vertical='top', wrap_text=True)
    for t in hm.tables.values():
        t.ref = f'A1:N{hm.max_row}'
        if t.autoFilter:
            t.autoFilter.ref = t.ref
    hm.column_dimensions['M'].width = 20
    hm.column_dimensions['N'].width = 46
    for ws in wb:
        ws.sheet_view.showGridLines = False
    return wb


def logo_pequeno(nav):
    """Logo reducido (300 px) como data URI: el PDF pesa mucho menos."""
    pag = nav.new_page()
    b64 = base64.b64encode((RAIZ / 'logo.png').read_bytes()).decode()
    uri = pag.evaluate("""async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
        const c = document.createElement('canvas'); c.width = 300; c.height = Math.round(im.naturalHeight * 300 / im.naturalWidth);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/png'); }""", b64)
    pag.close()
    return uri


def cmd_docs(a):
    import io
    import pymupdf
    from playwright.sync_api import sync_playwright
    import marca_externos as me
    datos = json.loads(Path(a.plan).read_text(encoding='utf-8'))
    salida = Path(a.salida)
    indice = {c['huella']: c['cliente'] for c in json.loads((RAIZ / 'portafolios-index.json').read_text(encoding='utf-8'))}
    nuevos = [p for p in datos['plan'] if p.get('clave') and (not a.zona or p['zona'] == a.zona)]
    with sync_playwright() as pw:
        try:
            nav = pw.chromium.launch()
        except Exception:
            nav = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium')
        logo = logo_pequeno(nav)
        pag = nav.new_page()
        titulo, cuerpo = me.texto_legal()
        for i, p in enumerate(nuevos, 1):
            carpeta = salida / re.sub(r'[^A-Za-z0-9]+', '_', sin_tildes(p['zona']))
            carpeta.mkdir(parents=True, exist_ok=True)
            tiendas = [indice[h] for h in p['portafolios']]
            html = ni.html_instructivo(p['usuario'], p['clave'], p['nombre'], tiendas, p['solo'])
            html = re.sub(r'data:image/png;base64,[A-Za-z0-9+/=]+', logo, html, count=1)
            pag.set_content(html, wait_until='networkidle')
            base = pag.pdf(format='A4', print_background=True)
            lado = round(595 * 0.42)
            capa_html = (f'<!DOCTYPE html><html><meta charset="utf-8"><style>@page {{ size: 595pt 842pt; margin: 0 }} html, body {{ margin: 0; background: transparent }} '
                         f'.sello {{ position: fixed; inset: 0; background: url("data:image/svg+xml,{__import__("urllib.parse").parse.quote(me.svg_sello(p["nombre"], 0.07))}") repeat; '
                         f'background-size: {lado}pt {lado}pt }}</style><div class="sello"></div>')
            pag.set_content(capa_html)
            capa = pag.pdf(width=f'{595 / 72}in', height=f'{842 / 72}in', print_background=True, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
            doc, ov = pymupdf.open(stream=base, filetype='pdf'), pymupdf.open(stream=capa, filetype='pdf')
            for pg in doc:
                pg.show_pdf_page(pg.rect, ov, 0, overlay=True)
            doc.set_metadata({**doc.metadata, 'subject': f'Uso exclusivo de {p["nombre"]}', 'keywords': 'Epithelium S.A. · Confidencial'})
            doc.save(carpeta / f'Instructivo_{p["usuario"]}.pdf', garbage=4, deflate=True)
            enlace = f'{ni.URL}#invitado={p["usuario"]}:{p["clave"].lower()}'
            (carpeta / f'Enlace_{p["usuario"]}.txt').write_text(
                f'ENLACE DE ACCESO ({p["nombre"]})\n{enlace}\n\nUSUARIO: {p["usuario"]}\nCLAVE: {p["clave"]}\n\n---- MENSAJE PARA WHATSAPP ----\n'
                f'Hola, te comparto tu acceso personal al Vademécum Epithelium. Entra con este enlace:\n{enlace}\n\n'
                f'Si te pide datos, usuario: {p["usuario"]} / clave: {p["clave"]}\nAdjunto el instructivo para instalarlo en tu celular o computador.\n'
                'El acceso es personal e intransferible; la información es de uso exclusivo y confidencial de Epithelium S.A.\n', encoding='utf-8')
            if i % 20 == 0:
                print(f'{i}/{len(nuevos)}', flush=True)
        nav.close()
    print(f'{len(nuevos)} instructivos y enlaces en {salida}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p1 = sub.add_parser('plan')
    p1.add_argument('excel')
    p1.add_argument('--vence', default='2026-11-30')
    p1.add_argument('--plan', default=str(HOME / 'plan.json'))
    p2 = sub.add_parser('docs')
    p2.add_argument('--plan', default=str(HOME / 'plan.json'))
    p2.add_argument('--zona')
    p2.add_argument('--salida', default=str(HOME / 'entregables'))
    p3 = sub.add_parser('excel')
    p3.add_argument('excel')
    p3.add_argument('--plan', default=str(HOME / 'plan.json'))
    p3.add_argument('--salida', default=str(HOME / 'Acceso_medicos_a_Vademecums_cliente_FINAL.xlsx'))
    a = ap.parse_args()
    if a.cmd == 'plan':
        cmd_plan(a)
    elif a.cmd == 'docs':
        cmd_docs(a)
    else:
        wb = excel_final(a, json.loads(Path(a.plan).read_text(encoding='utf-8')))
        wb.save(a.salida)
        print('Excel final en', a.salida)


if __name__ == '__main__':
    main()
