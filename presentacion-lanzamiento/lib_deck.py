# Arma "202609Presentacion Lanzamiento Apps.pptx" sobre la plantilla de la Junta (base.pptx = junta + 3 portadas con video).
import copy, random, json, os
from lxml import etree
from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.util import Emu, Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.oxml.ns import qn

S = os.path.dirname(os.path.abspath(__file__))
CAP = S + '/cap/'
OUT = S + '/202609Presentacion Lanzamiento Aplicaciones Epithelium.pptx'
CAJAS = json.load(open(CAP + 'cajas.json'))
random.seed(21)

VERDE, VERDE_OSC, DORADO, KPI_BG, GRIS = '79A02F', '3B5B1A', 'FFC000', 'F2F7E8', '404040'
FECHA = 'Octubre 1 de 2026'
XMAX = 11.35   # borde derecho del contenido mientras esté a la altura del logo (y < 2.6")
URL_RUTA = 'https://epitheliumsa.github.io/ruta-comercial/'
URL_VADE = 'https://epitheliumsa.github.io/vademecum-epithelium/'
rgb = lambda h: RGBColor.from_string(h)
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

prs = Presentation(S + '/build/base.pptx')
slides = list(prs.slides)
# Transiciones que ya usa Nano en su presentación (se reparten al azar)
TRANS = []
for s in slides:
    el = s._element
    for ch in el:
        if ch.tag.endswith('AlternateContent') and b'transition' in etree.tostring(ch) or ch.tag == qn('p:transition'):
            x = etree.tostring(ch)
            if x not in TRANS: TRANS.append(x)
PORTADA, ORDEN, VID1, FIN_SRC = slides[0], slides[2], slides[3], slides[33]
VID2, VID3, VID4 = slides[34], slides[35], slides[36]
LAYOUT_CONT = ORDEN.slide_layout

# ---------------------------------------------------------------- utilidades
def poner_transicion(slide, i=None):
    el = slide._element
    for ch in list(el):
        if ch.tag.endswith('AlternateContent') or ch.tag == qn('p:transition'): el.remove(ch)
    x = etree.fromstring(TRANS[i] if i is not None else random.choice(TRANS))
    # Algunas transiciones de la plantilla traen "no avanzar con clic": aquí todas avanzan con clic (salvo bloquear_avance)
    for t in x.iter(qn('p:transition')):
        t.attrib.pop('advClick', None)
    # la transición va después de clrMapOvr y antes de timing
    clr = el.find(qn('p:clrMapOvr'))
    clr.addnext(x)

def texto(slide, x, y, w, h, parrafos, size=13, color=GRIS, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, espacio=4, nombre=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if nombre: tb.name = nombre
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for m in ('margin_left', 'margin_right'): setattr(tf, m, Inches(0.08))
    tf.margin_top = tf.margin_bottom = Inches(0.04)
    for k, par in enumerate(parrafos if isinstance(parrafos, list) else [parrafos]):
        p = tf.paragraphs[0] if k == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(espacio)
        for seg in (par if isinstance(par, list) else [par]):
            t, b = (seg, bold) if isinstance(seg, str) else seg
            r = p.add_run(); r.text = t
            r.font.size = Pt(size); r.font.bold = b; r.font.color.rgb = rgb(color)
    return tb

def titulo(slide, t):
    ph = slide.shapes.title
    ph.left, ph.top, ph.width, ph.height = Emu(700000), Emu(150000), Emu(9700000), Emu(800000)
    ph.text_frame.text = t
    r = ph.text_frame.paragraphs[0].runs[0]; r.font.size = Pt(26); r.font.bold = True
    return ph

def nueva(t):
    s = prs.slides.add_slide(LAYOUT_CONT)
    for ph in list(s.placeholders):
        if ph.placeholder_format.type != 1 and ph.placeholder_format.idx != 0:   # deja solo el título
            ph._element.getparent().remove(ph._element)
    titulo(s, t)
    return s

def kpi(slide, x, y, w, h, valor, desc, nombre):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.name = nombre
    sh.adjustments[0] = 0.06
    sh.fill.solid(); sh.fill.fore_color.rgb = rgb(KPI_BG)
    sh.line.color.rgb = rgb(VERDE); sh.line.width = Pt(1)
    sh.shadow.inherit = False
    tf = sh.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = valor; r.font.size = Pt(20); r.font.bold = True; r.font.color.rgb = rgb(VERDE_OSC)
    p = tf.add_paragraph(); p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = desc; r.font.size = Pt(11); r.font.color.rgb = rgb(GRIS)
    return sh

def tabla(slide, x, y, w, anchos, filas, alto_fila=0.34, size=11, centrar=(0,), nombre='Tabla'):
    n, m = len(filas), len(filas[0])
    gf = slide.shapes.add_table(n, m, Inches(x), Inches(y), Inches(w), Inches(alto_fila * n))
    gf.name = nombre
    t = gf.table
    tot = sum(anchos)
    for j, a in enumerate(anchos): t.columns[j].width = Inches(w * a / tot)
    for i, fila in enumerate(filas):
        t.rows[i].height = Inches(alto_fila)
        for j, val in enumerate(fila):
            c = t.cell(i, j)
            c.margin_left = c.margin_right = Emu(60000); c.margin_top = c.margin_bottom = Emu(20000)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            c.fill.solid()
            c.fill.fore_color.rgb = rgb(VERDE if i == 0 else ('FFFFFF' if i % 2 else KPI_BG))
            tf = c.text_frame; tf.word_wrap = True
            p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER if j in centrar else PP_ALIGN.LEFT
            segs = val if isinstance(val, list) else [val]
            for seg in segs:
                tx, b = (seg, i == 0) if isinstance(seg, str) else seg
                r = p.add_run(); r.text = tx
                r.font.size = Pt(size); r.font.bold = b or (i > 0 and j == 0)
                r.font.color.rgb = rgb('FFFFFF' if i == 0 else (VERDE_OSC if j == 0 else GRIS))
    # sin estilo de bandas del tema
    tblPr = t._tbl.tblPr
    for a in ('bandRow', 'firstRow'): tblPr.set(a, '0')
    return gf

def alfa(shape, pct):
    """Transparencia de relleno (pct = % de opacidad)."""
    sf = shape.fill._xPr.find(qn('a:solidFill'))
    clr = sf[0]
    for a in clr.findall(qn('a:alpha')): clr.remove(a)
    e = etree.SubElement(clr, qn('a:alpha')); e.set('val', str(int(pct * 1000)))

def resaltar_filas(slide, gf, filas_idx, nombre='RowHighlight'):
    """Rectángulos dorados semitransparentes sobre filas de la tabla (para el patrón de clic)."""
    t = gf.table; y = gf.top; hs = []
    alturas = [r.height for r in t.rows]
    for i in filas_idx:
        yy = y + sum(alturas[:i])
        r = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, gf.left, yy, gf.width, alturas[i])
        r.name = f'{nombre}{i}'
        r.fill.solid(); r.fill.fore_color.rgb = rgb(DORADO); alfa(r, 35)
        r.line.color.rgb = rgb(DORADO); r.line.width = Pt(1.5); r.shadow.inherit = False
        hs.append(r)
    return hs

# ---- celulares con marco
BISEL = 30   # px del marco (imagen a 3x)
def celular(src, recorte=None, nombre=None):
    im = Image.open(CAP + src + '.png').convert('RGB')
    if recorte:   # (y0, y1) en px CSS
        im = im.crop((0, recorte[0] * 3, im.width, recorte[1] * 3))
    W, H = im.width + 2 * BISEL, im.height + 2 * BISEL
    lienzo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lienzo)
    d.rounded_rectangle([0, 0, W - 1, H - 1], radius=110, fill=(28, 28, 30, 255))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=80, fill=255)
    lienzo.paste(im, (BISEL, BISEL), mask)
    out = S + '/build/tel_' + (nombre or src) + ('_%d_%d' % recorte if recorte else '') + '.png'
    lienzo = lienzo.resize((W // 2, H // 2), Image.LANCZOS)
    lienzo.save(out, optimize=True)
    return out, W, H

def poner_celular(slide, src, x, y, alto, recorte=None, nombre='Celular'):
    path, W, H = celular(src, recorte)
    ancho = alto * W / H
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y), Inches(ancho), Inches(alto))
    pic.name = nombre
    esc = alto / H   # pulgadas por px (3x)
    y0 = recorte[0] if recorte else 0
    def mapa(caja):   # caja CSS -> pulgadas en la diapositiva
        cx, cy, cw, ch = caja
        return (x + (BISEL + cx * 3) * esc, y + (BISEL + (cy - y0) * 3) * esc, cw * 3 * esc, ch * 3 * esc)
    return pic, mapa, ancho

def llamada(slide, n, caja_in, lado='der', nombre=''):
    """Recuadro dorado sobre el elemento + círculo numerado. Devuelve las dos formas."""
    x, y, w, h = caja_in
    rec = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x - 0.03), Inches(y - 0.03), Inches(w + 0.06), Inches(h + 0.06))
    rec.name = f'Resalte{nombre}{n}'
    rec.adjustments[0] = 0.18
    rec.fill.background(); rec.line.color.rgb = rgb(DORADO); rec.line.width = Pt(2.5); rec.shadow.inherit = False
    d = 0.34
    cx = x + w - d * 0.55 if lado == 'der' else x - d * 0.45
    cy = y + h / 2 - d / 2
    if lado == 'arriba': cx, cy = x + w * 0.45, y - d * 0.85
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(cx), Inches(cy), Inches(d), Inches(d))
    c.name = f'Numero{nombre}{n}'
    c.fill.solid(); c.fill.fore_color.rgb = rgb(DORADO)
    c.line.color.rgb = rgb('FFFFFF'); c.line.width = Pt(1.5); c.shadow.inherit = False
    tf = c.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = str(n); r.font.size = Pt(12); r.font.bold = True; r.font.color.rgb = rgb(VERDE_OSC)
    return [rec, c]

def circulo_num(slide, n, x, y, d=0.36):
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    c.name = f'Paso{n}'
    c.fill.solid(); c.fill.fore_color.rgb = rgb(DORADO); c.line.color.rgb = rgb('FFFFFF'); c.line.width = Pt(1.5); c.shadow.inherit = False
    tf = c.text_frame; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = str(n); r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = rgb(VERDE_OSC)
    return c

def fuente(slide, t, y=7.0):
    return texto(slide, 0.77, y, 10.6, 0.36, t, size=10, color='7F7F7F')

# ---- regreso al índice: logo de Epithelium en negro abajo a la derecha (donde estaba la mano de la Junta).
# Esas diapositivas no avanzan con clic: solo se sale tocando el logo (ver bloquear_avance).
LOGO_NEGRO = S + '/logo_negro.png'
REGRESOS = []
def icono_regreso(slide):
    from PIL import Image as _Im
    w0, h0 = _Im.open(LOGO_NEGRO).size
    ancho = 0.7; alto = ancho * h0 / w0
    cx, cy = 12.88, 7.0   # donde estaba la mano de la Junta, sin salirse del borde
    pic = slide.shapes.add_picture(LOGO_NEGRO, Inches(cx - ancho / 2), Inches(cy - alto / 2), Inches(ancho), Inches(alto))
    pic.name = 'Regresar al orden del día'
    pic.click_action.target_slide = ORDEN
    REGRESOS.append(slide)

def bloquear_avance(slide):
    """Quita "Al hacer clic con el mouse" de la transición: la diapositiva solo se deja con el hipervínculo."""
    for t in slide._element.iter(qn('p:transition')):
        t.set('advClick', '0')

def enlazar(shape, destino):
    shape.click_action.target_slide = destino

# ---- animaciones
class Anim:
    """Arma <p:timing>: 'auto' entra solo al abrir; cada clic = lista de entradas/salidas y párrafos."""
    def __init__(self, slide):
        self.s, self.auto, self.clics, self.n = slide, [], [], 2
    def id(self):
        self.n += 1; return self.n
    def _tgt(self, spid, par=None):
        t = f'<p:spTgt spid="{spid}">' + (f'<p:txEl><p:pRg st="{par}" end="{par}"/></p:txEl>' if par is not None else '') + '</p:spTgt>'
        return f'<p:tgtEl>{t}</p:tgtEl>'
    def entra(self, spid, nodo, delay=0, par=None, filtro='fade', grp=0, atenuar=False):
        efecto = f'<p:animEffect transition="in" filter="{filtro}"><p:cBhvr><p:cTn id="{self.id()}" dur="500"/>{self._tgt(spid, par)}</p:cBhvr></p:animEffect>'
        pid, sub = ('10', '0') if filtro == 'fade' else ('22', '1')
        # "Después de la animación": al siguiente clic el texto ya visto cambia a accent2 (igual que en la presentación de la Junta)
        sub_tn = (f'<p:subTnLst><p:animClr clrSpc="rgb" dir="cw"><p:cBhvr override="childStyle"><p:cTn dur="1" fill="hold" display="0" masterRel="nextClick" afterEffect="1"/>'
                  f'{self._tgt(spid, par)}<p:attrNameLst><p:attrName>ppt_c</p:attrName></p:attrNameLst></p:cBhvr><p:to><a:schemeClr val="accent2"/></p:to></p:animClr></p:subTnLst>') if atenuar else ''
        return (f'<p:par><p:cTn id="{self.id()}" presetID="{pid}" presetClass="entr" presetSubtype="{sub}" fill="hold" grpId="{grp}" nodeType="{nodo}">'
                f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{self.id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>{self._tgt(spid, par)}'
                f'<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
                f'{efecto}</p:childTnLst>{sub_tn}</p:cTn></p:par>')
    def sale(self, spid, nodo, grp=1):
        return (f'<p:par><p:cTn id="{self.id()}" presetID="10" presetClass="exit" presetSubtype="0" fill="hold" grpId="{grp}" nodeType="{nodo}">'
                f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="{self.id()}" dur="400"/>{self._tgt(spid)}</p:cBhvr></p:animEffect>'
                f'<p:set><p:cBhvr><p:cTn id="{self.id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="399"/></p:stCondLst></p:cTn>{self._tgt(spid)}'
                f'<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="hidden"/></p:to></p:set>'
                f'</p:childTnLst></p:cTn></p:par>')
    def color(self, spid, par, nodo):
        return (f'<p:par><p:cTn id="{self.id()}" presetID="3" presetClass="emph" presetSubtype="2" grpId="0" fill="hold" nodeType="{nodo}">'
                f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:animClr clrSpc="rgb" dir="cw"><p:cBhvr override="childStyle"><p:cTn id="{self.id()}" dur="500" fill="hold"/>{self._tgt(spid, par)}'
                f'<p:attrNameLst><p:attrName>style.color</p:attrName></p:attrNameLst></p:cBhvr><p:to><a:schemeClr val="accent2"/></p:to></p:animClr>'
                f'</p:childTnLst></p:cTn></p:par>')
    def construir(self):
        """auto: lista de shapes; clics: lista de dicts {entra:[shapes], sale:[shapes], par:(shape, i), color:(shape, i)}"""
        grupos = []
        bld = {}
        if self.auto:
            efs = ''.join(self.entra(sh.shape_id, 'withEffect' if k == 0 else 'withEffect', delay=k * 250) for k, sh in enumerate(self.auto))
            for sh in self.auto: bld.setdefault(sh.shape_id, set()).add(0)
            grupos.append(('<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>', efs))
        for c in self.clics:
            efs, primero = '', True
            def nodo():
                nonlocal primero
                n = 'clickEffect' if primero else 'withEffect'; primero = False; return n
            for spid, i in c.get('colores', []):
                efs += self.color(spid.shape_id, i, nodo())
            for sh in c.get('entra', []):
                efs += self.entra(sh.shape_id, nodo()); bld.setdefault(sh.shape_id, set()).add(0)
            for spid, i in c.get('pars', []):
                efs += self.entra(spid.shape_id, nodo(), par=i, filtro='wipe(down)', atenuar=True); bld.setdefault(spid.shape_id, set()).add('p')
            for sh in c.get('sale', []):
                efs += self.sale(sh.shape_id, nodo()); bld.setdefault(sh.shape_id, set()).add(1)
            grupos.append(('<p:cond delay="indefinite"/>', efs))
        if not grupos: return
        cuerpo = ''
        for cond, efs in grupos:
            cuerpo += (f'<p:par><p:cTn id="{self.id()}" fill="hold"><p:stCondLst>{cond}</p:stCondLst><p:childTnLst>'
                       f'<p:par><p:cTn id="{self.id()}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{efs}</p:childTnLst></p:cTn></p:par>'
                       f'</p:childTnLst></p:cTn></p:par>')
        # bldLst: solo formas (sp); las imágenes y tablas no llevan bldP
        sps = {int(sp.find(qn('p:nvSpPr')).find(qn('p:cNvPr')).get('id')) for sp in self.s.shapes._spTree.iter(qn('p:sp'))}
        blds = ''
        for spid, gs in bld.items():
            if spid not in sps: continue
            if 'p' in gs: blds += f'<p:bldP spid="{spid}" grpId="0" build="p"/>'
            else:
                for g in sorted(gs): blds += f'<p:bldP spid="{spid}" grpId="{g}" animBg="1"/>'
        xml = (f'<p:timing xmlns:p="{NS["p"]}" xmlns:a="{NS["a"]}"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
               f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>{cuerpo}</p:childTnLst></p:cTn>'
               f'<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
               f'<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
               f'</p:childTnLst></p:cTn></p:par></p:tnLst>' + (f'<p:bldLst>{blds}</p:bldLst>' if blds else '') + '</p:timing>')
        el = self.s._element
        for old in el.findall(qn('p:timing')): el.remove(old)
        t = etree.fromstring(xml)
        # timing va después de la transición
        ultimo = [ch for ch in el if ch.tag.endswith('AlternateContent') or ch.tag == qn('p:transition')]
        (ultimo[-1] if ultimo else el.find(qn('p:clrMapOvr'))).addnext(t)

def viñetas(slide, x, y, w, h, items, size=13):
    tb = texto(slide, x, y, w, h, [f'• {t}' if isinstance(t, str) else [('• ', False)] + t for t in items], size=size, espacio=5, nombre='Viñetas')
    return tb

def clics_viñetas(anim, tb, n):
    """Párrafo por clic; el anterior cambia de color al mostrar el siguiente."""
    for i in range(n):
        anim.clics.append({'pars': [(tb, i)]})

