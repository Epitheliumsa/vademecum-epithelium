# "Lanzamiento aplicaciones Epithelium": 1. Vademécum · 2. Visita Comercial · 3. Cotizador Epithelium
from lib_deck import *

VID_V, VID_R, VID_E, VID_C = VID1, VID2, VID3, VID4
URL_R, URL_V = URL_RUTA, URL_VADE

# ---------------------------------------------------------------- marco de computador
def computador(src, nombre):
    im = Image.open(CAP + src + '.png').convert('RGB')
    B = 36
    W, H = im.width + 2 * B, im.height + 2 * B
    lienzo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lienzo).rounded_rectangle([0, 0, W - 1, H - 1], radius=40, fill=(28, 28, 30, 255))
    lienzo.paste(im, (B, B))
    lienzo = lienzo.resize((W // 2, H // 2), Image.LANCZOS)
    out = S + '/build/pc_' + nombre + '.png'; lienzo.save(out, optimize=True)
    return out, W, H, B

def poner_pc(slide, src, x, y, ancho, nombre='Computador'):
    path, W, H, B = computador(src, src)
    alto = ancho * H / W
    pic = slide.shapes.add_picture(path, Inches(x), Inches(y), Inches(ancho), Inches(alto)); pic.name = nombre
    esc = ancho / W
    def mapa(c):
        cx, cy, cw, ch = c
        return (x + (B + cx * 3) * esc, y + (B + cy * 3) * esc, cw * 3 * esc, ch * 3 * esc)
    return pic, mapa, ancho, alto

# ---------------------------------------------------------------- diapositiva genérica: pantallas + tabla referenciada
def diapo(titulo_t, pantallas, filas, encabezado=('#', 'Elemento', 'Qué haces'), anchos=(0.3, 1.25, 3.1), nota=None,
          fila_h=0.5, size=11, regreso=False, y0=1.1, tabla_y=None, tabla_x=None, tabla_w=None, gap=0.3):
    s = nueva(titulo_t); nuevas.append(s); an = Anim(s)
    x = 0.7; pics = []; refs = []
    for pz in pantallas:
        if pz.get('pc'):
            pic, mapa, w, h = poner_pc(s, pz['img'], pz.get('x', x), pz.get('y', y0), pz['ancho'])
        else:
            alto = pz.get('alto', 5.5)
            rec = pz.get('recorte')
            if rec: alto = pz.get('alto', 5.5)
            pic, mapa, w = poner_celular(s, pz['img'], pz.get('x', x), pz.get('y', y0), alto, recorte=rec, nombre='Cel_' + pz['img'])
        pics.append(pic)
        cj = CAJAS.get(pz['img'], {}).get('items', {})
        for r in pz.get('refs', []):
            clave, lado = (r, 'der') if isinstance(r, str) or (isinstance(r, list) and len(r) == 4) else r
            if isinstance(clave, (list, tuple)): caja = clave   # caja manual en px CSS
            else: caja = cj.get(clave)
            if caja and not pz.get('pc'):
                lo, hi = (pz['recorte'] if pz.get('recorte') else (0, CAJAS.get(pz['img'], {}).get('h', 844)))
                y1, y2 = max(caja[1], lo + 4), min(caja[1] + caja[3], hi - 4)
                caja = [caja[0], y1, caja[2], max(12, y2 - y1)] if y2 > lo + 4 else None
            refs.append((caja, lado, mapa))
        x = pz.get('x', x) + w + gap
    # tabla: a la derecha; si queda angosta, se baja por debajo del logo y llega hasta 12.45"
    tx = tabla_x if tabla_x is not None else x + 0.25
    ty = tabla_y if tabla_y is not None else (y0 if XMAX - tx >= 3.9 else 2.65)
    tw = tabla_w if tabla_w is not None else ((XMAX if ty < 2.6 else 12.45) - tx)
    datos = [list(encabezado)] + [[str(i + 1)] + list(f) for i, f in enumerate(filas)]
    gf = tabla(s, tx, ty, tw, list(anchos), datos, alto_fila=fila_h, size=size, centrar=(0,))
    hs = resaltar_filas(s, gf, range(1, len(filas) + 1))
    extra = []
    if nota:
        ny = ty + fila_h * (len(filas) + 1) + 0.15
        extra.append(texto(s, tx, ny, 12.45 - tx, max(0.5, 7.2 - ny), nota, size=11.5, espacio=3))
    an.auto = pics + [gf] + extra
    nref = 0
    for i, h in enumerate(hs):
        formas = []
        if i < len(refs) and refs[i][0]:
            caja, lado, mapa = refs[i]
            formas = llamada(s, i + 1, mapa(caja), lado=lado)
        an.clics.append({'entra': formas + [h], 'sale': [hs[i - 1]] if i else []})
    an.construir()
    if regreso: icono_regreso(s)
    return s

def b(t): return (t, True)

# ================================================================ PORTADA Y ORDEN
ph = PORTADA.shapes.title; tf = ph.text_frame
tf.paragraphs[0].runs[0].text = 'LANZAMIENTO APLICACIONES'
for r in tf.paragraphs[0].runs[1:]: r.text = ''
tf.paragraphs[0].runs[-1].text = 'EPITHELIUM'
for r in tf.paragraphs[0].runs: r.font.size = Pt(44)
sub = [x for x in PORTADA.placeholders if x.placeholder_format.idx == 1][0]
sub.text_frame.paragraphs[0].runs[0].text = 'Vademécum · Visita Comercial · Cotizador'
for r in sub.text_frame.paragraphs[0].runs[1:]: r.text = ''
sub.text_frame.paragraphs[0].runs[0].font.size = Pt(22)
p2 = sub.text_frame.add_paragraph(); r = p2.add_run(); r.text = f'Capacitación fuerza de ventas y jefes · {FECHA}'; r.font.size = Pt(18)
sub.left, sub.width = Inches(0.9), Inches(7.7)

cont = [x for x in ORDEN.placeholders if x.placeholder_format.idx == 1][0]
cont._element.getparent().remove(cont._element)
puntos = ['Vademécum Epithelium.', 'Visita Comercial.', 'Guía de etiquetas de producto.', 'Cotizador Epithelium.']
PASO_ORDEN, Y_ORDEN = 0.95, 2.1
items_orden = [texto(ORDEN, 1.55, Y_ORDEN + i * PASO_ORDEN, 10.2, 0.6, [[(f'{i + 1}.  ', True), (t, False)]], size=30, color='000000',
                     anchor=MSO_ANCHOR.MIDDLE, espacio=0, nombre=f'Punto{i + 1}') for i, t in enumerate(puntos)]
iconos = sorted([sh for sh in ORDEN.shapes if sh.shape_type == 13], key=lambda x: x.top)
while len(iconos) < 4:
    el = copy.deepcopy(iconos[-1]._element)
    el.find('.//' + qn('p:cNvPr')).set('id', str(20 + len(iconos)))
    ORDEN.shapes._spTree.append(el)
    iconos = sorted([sh for sh in ORDEN.shapes if sh.shape_type == 13], key=lambda x: x.top)
for extra_ic in iconos[4:]: extra_ic._element.getparent().remove(extra_ic._element)
iconos = iconos[:4]
for k, ic in enumerate(iconos):
    ic.left = Inches(0.86); ic.top = Inches(Y_ORDEN + k * PASO_ORDEN + 0.3) - ic.height // 2
for ic, dest in zip(iconos, [VID_V, VID_R, VID_E, VID_C]): enlazar(ic, dest)
ao = Anim(ORDEN)
for i, tb in enumerate(items_orden): ao.clics.append({'entra': [tb, iconos[i]]})
ao.construir()

for s_, t, sub_t in [(VID_V, 'Vademécum Epithelium', f'Fecha: {FECHA}'), (VID_R, 'Visita Comercial', f'Fecha: {FECHA}'),
                     (VID_E, 'Guía de etiquetas de producto', f'Fecha: {FECHA}'), (VID_C, 'Cotizador Epithelium', 'Próximamente')]:
    s_.shapes.title.text_frame.paragraphs[0].runs[0].text = t
    sp = [x for x in s_.placeholders if x.placeholder_format.idx == 1][0]
    sp.text_frame.paragraphs[0].runs[0].text = sub_t; sp.width = Inches(4.4)
    for sh in (s_.shapes.title, sp):
        for r in sh.text_frame.paragraphs[0].runs: r.font.color.rgb = rgb('FFFFFF')

nuevas = []

# ---------------------------------------------------------------- Antes de empezar
s = nueva('Antes de empezar'); nuevas.append(s); an = Anim(s)
ks = [kpi(s, 0.77 + k * 2.69, 1.09, 2.53, 0.98, v, d, f'KPI{k}') for k, (v, d) in enumerate([
    ('2 apps hoy', 'Vademécum y Visita Comercial'), ('1 usuario', 'La misma clave para las dos'),
    ('5 min', 'Para instalar cada app'), ('0 descargas', 'No van por Play Store ni App Store')])]
gf = tabla(s, 0.77, 2.35, 6.4, [1.4, 3.6], [
    ['Qué necesitas', 'Detalle'], ['Celular', 'Android con Chrome, o iPhone con Safari'], ['Cámara', 'Para escanear los códigos QR'],
    ['Internet', 'Wi-Fi o datos para instalar y para sincronizar'], ['Usuario y clave', 'Los tuyos, personales (sirven en las dos apps)']], alto_fila=0.46, size=12.5)
ic_v = s.shapes.add_picture('/tmp/vade_main/icons/icon-512.png', Inches(8.15), Inches(2.45), Inches(1.25), Inches(1.25))
ic_r = s.shapes.add_picture('/home/user/ruta-comercial/icons/icon-512.png', Inches(10.35), Inches(2.45), Inches(1.25), Inches(1.25))
t1 = texto(s, 7.65, 3.75, 2.25, 0.6, [[('Vademécum', True)], 'Punto 1'], size=12, align=PP_ALIGN.CENTER, color=VERDE_OSC, espacio=0)
t2 = texto(s, 9.85, 3.75, 2.25, 0.6, [[('Visita Comercial', True)], 'Punto 2'], size=12, align=PP_ALIGN.CENTER, color=VERDE_OSC, espacio=0)
tb = viñetas(s, 0.77, 4.95, 11.4, 1.9, [
    'Son aplicaciones web: se abren desde el navegador y quedan como un ícono en la pantalla de inicio, igual que una app.',
    'Vamos app por app: cada uno la instala en su celular mientras avanzamos y hace los ejercicios en vivo.',
    'Tu usuario es personal: no lo compartas. Todo lo que registres en Visita Comercial queda a tu nombre.'], size=15)
an.auto = ks + [gf, ic_v, ic_r, t1, t2]; clics_viñetas(an, tb, 3); an.construir()

# ---------------------------------------------------------------- bloques de instalación (QR + Android + iPhone)
def diapo_qr(titulo_t, qr, icono, nombre_app, desc, url, extra):
    s = nueva(titulo_t); nuevas.append(s); an = Anim(s)
    marco = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.77), Inches(1.1), Inches(5.0), Inches(5.55))
    marco.adjustments[0] = 0.04; marco.fill.solid(); marco.fill.fore_color.rgb = rgb('FFFFFF')
    marco.line.color.rgb = rgb(VERDE); marco.line.width = Pt(2); marco.name = 'MarcoQR'
    q = s.shapes.add_picture(S + '/' + qr, Inches(1.02), Inches(1.25), Inches(4.5), Inches(4.5)); q.name = 'QR'
    u = texto(s, 0.87, 5.8, 4.8, 0.7, [[('Escanéalo con la cámara', True)], url], size=12, align=PP_ALIGN.CENTER, color=VERDE_OSC, espacio=2)
    u.text_frame.paragraphs[1].runs[0].hyperlink.address = url
    ic = s.shapes.add_picture(icono, Inches(6.1), Inches(1.15), Inches(1.0), Inches(1.0))
    tt = texto(s, 7.25, 1.12, XMAX - 7.25, 1.2, [[(nombre_app, True)], desc], size=13, color=GRIS, espacio=2)
    tt.text_frame.paragraphs[0].runs[0].font.size = Pt(18); tt.text_frame.paragraphs[0].runs[0].font.color.rgb = rgb(VERDE_OSC)
    gf = tabla(s, 6.1, 2.55, XMAX - 6.1, [0.5, 4.2], [['Paso', 'Qué haces'],
        ['1', 'Abre la cámara del celular (o Google Lens).'], ['2', 'Apunta al código QR hasta que aparezca el enlace.'],
        ['3', 'Toca el enlace: se abre en Chrome (Android) o Safari (iPhone).'], ['4', 'Instálala siguiendo los pasos de tu celular (siguientes diapositivas).']],
        alto_fila=0.46, size=12, centrar=(0,))
    hs = resaltar_filas(s, gf, [1, 2, 3, 4])
    ex = texto(s, 6.1, 5.2, 12.4 - 6.1, 1.2, extra, size=12, color=GRIS, espacio=3)
    an.auto = [marco, q, u, ic, tt, gf, ex]
    for i, h in enumerate(hs): an.clics.append({'entra': [h], 'sale': [hs[i - 1]] if i else []})
    an.construir()

def diapo_instalar(titulo_t, mocks, pies, nota):
    s = nueva(titulo_t); nuevas.append(s); an = Anim(s)
    alto = 3.95; grupos = []
    for k, (m, pie) in enumerate(zip(mocks, pies)):
        x = 0.65 + k * 2.15
        pic, mapa, ancho = poner_celular(s, m, x, 1.2, alto, nombre=f'Paso{k + 1}Cel')
        c = circulo_num(s, k + 1, x - 0.12, 1.08)
        tp = texto(s, x - 0.14, 1.2 + alto + 0.1, ancho + 0.28, 1.0, pie, size=11.5, color=GRIS, align=PP_ALIGN.CENTER, espacio=0)
        grupos.append([pic, c, tp])
    nt = texto(s, 0.65, 6.25, 11.8, 0.5, nota, size=11.5, color=GRIS)
    an.auto = grupos[0] + [nt]
    for g in grupos[1:]: an.clics.append({'entra': g})
    an.construir()

def diapo_pc(app, nombre):
    s = nueva(f'Paso 2 · {nombre.replace("el ", "")} en el computador'); nuevas.append(s); an = Anim(s)
    grupos = []
    for k, (img, tit, pasos) in enumerate([
        ('pc_instalar_' + app, 'Opción 1 · Instalarla como app (Chrome o Edge)',
         [[b('1. '), 'Abre el enlace en Chrome o Edge.'], [b('2. '), 'Toca el ícono de instalar, al lado derecho de la barra de direcciones.'],
          [b('3. '), 'Toca "Instalar": queda en el escritorio y en el menú Inicio.']]),
        ('pc_favorito_' + app, 'Opción 2 · Guardarla en favoritos',
         [[b('1. '), 'Abre el enlace y toca la estrella ☆ (o Ctrl + D).'], [b('2. '), 'En Carpeta elige "Barra de favoritos".'],
          [b('3. '), 'Toca "Listo": queda en la barra, debajo de la dirección.']])]):
        x = 0.7 + k * 5.35
        t = texto(s, x, 1.1, 5.2, 0.4, [[b(tit)]], size=14, color=VERDE_OSC)
        pic, mapa, w, h = poner_pc(s, img, x, 1.55, 5.2, nombre=f'PC{k + 1}')
        c = circulo_num(s, k + 1, x - 0.15, 1.45)
        tp = texto(s, x, 1.55 + h + 0.12, 5.2, 1.5, pasos, size=12.5, espacio=4)
        grupos.append([t, pic, c, tp])
    an.auto = grupos[0]; an.clics.append({'entra': grupos[1]}); an.construir()

def diapo_samsung():
    diapo('Opcional · Si la app se ve con fondo negro (Samsung)', [
            {'img': 'sam_oscuro', 'alto': 5.2, 'refs': [[12, 110, 366, 330]]},
            {'img': 'sam_internet', 'alto': 5.2, 'refs': [[18, 728, 178, 64]]},
            {'img': 'sam_ajustes', 'alto': 5.2, 'refs': [[88, 90, 112, 220]]}],
        [('Modo oscuro', 'Algunos Samsung pintan la app de negro: se ve distinto, pero funciona igual.'),
         ('Samsung Internet', 'Menú ≡ (abajo a la derecha) › desactiva "Modo oscuro".'),
         ('Ajustes del teléfono', 'Pantalla › Claro, si todo el celular está en modo oscuro.')],
        anchos=(0.3, 1.2, 2.3), fila_h=0.75, size=11,
        nota=[[b('En Chrome: '), 'menú ⋮ › Configuración › Tema › Claro. Los nombres cambian un poco según el modelo.']])

def bloque_instalacion(app, nombre, nombre_instalada):
    sufijo = '_' + app
    diapo_instalar(f'Paso 2 · Instala {nombre} en Android (Chrome)',
        [m + sufijo for m in ['m_camara_android', 'm_chrome', 'm_chrome_menu', 'm_chrome_instalar', 'm_inicio_android']],
        [[[b('Escanea el QR')], 'y toca el enlace para abrirlo en Chrome.'], [[b('Toca el menú ⋮')], 'arriba a la derecha.'],
         [[b('"Agregar a la pantalla principal"')], '(o "Instalar app").'], [[b('Toca "Instalar"')], 'para confirmar.'],
         [[b('¡Listo!')], f'Abre "{nombre_instalada}" desde su ícono.']],
        [[b('Nota: '), 'los nombres del menú cambian un poco según el celular y la versión de Chrome. Si no ves la opción, actualiza Chrome desde Play Store.']])
    diapo_instalar(f'Paso 2 · Instala {nombre} en iPhone (Safari)',
        [m + sufijo for m in ['m_camara_iphone', 'm_safari', 'm_safari_compartir', 'm_safari_agregar', 'm_inicio_iphone']],
        [[[b('Escanea el QR')], 'y toca "Abrir en Safari".'], [[b('Toca Compartir')], '(cuadro con flecha hacia arriba).'],
         [[b('"Agregar a pantalla de inicio"')], '(desliza hacia abajo si no la ves).'], [[b('Toca "Agregar"')], 'arriba a la derecha.'],
         [[b('¡Listo!')], f'Abre "{nombre_instalada}" desde su ícono.']],
        [[b('Nota: '), 'en iPhone la instalación funciona desde Safari. En las versiones más nuevas de iOS, Compartir puede estar dentro del botón "···" de la barra.']])
    diapo_pc(app, nombre)
    if app == 'v': diapo_samsung()

# ================================================================ PUNTO 1 · VADEMÉCUM
PUNTO1_INI = len(nuevas)
diapo_qr('Paso 1 · Descarga el Vademécum', '202609QR Vademecum.png', '/tmp/vade_main/icons/icon-512.png', 'Vademécum',
         'Vademécum Epithelium: productos, portafolio por cliente, materias primas y lo nuevo.', URL_V,
         [[b('Tip: '), 'si el QR no abre, escribe el enlace en Chrome o Safari. No lo abras desde WhatsApp ni desde el navegador de Facebook: ahí no aparece la opción de instalar.']])
bloque_instalacion('v', 'el Vademécum', 'Vademécum')
diapo('Paso 3 · Ingresa al Vademécum', [
        {'img': 'v_login', 'alto': 5.4, 'refs': ['usuario', 'clave', 'acceder']},
        {'img': 'v_home', 'alto': 5.4, 'refs': ['saludo', 'b1', 'b2', 'b3', 'b4', ('salir', 'izq')]}],
    [('Usuario', 'Tu usuario (ej.: N.Apellido). No importan mayúsculas.'), ('Clave', 'Tu clave personal.'), ('Acceder', 'Entras a la pantalla de inicio.'),
     ('Saludo', 'Tu nombre, cargo y zona.'), ('Vademécum Epithelium', 'Fórmulas, componentes e indicaciones.'),
     ('Vademécum Cliente', 'Portafolio de cada cliente de tu zona.'), ('Materias Primas', 'Activos, usos y concentraciones.'),
     ('Lo Nuevo', 'Productos nuevos de Epithelium.'), ('Salir', 'Cierra la sesión (solo si prestas el celular).')],
    fila_h=0.44, size=10.5, nota=[[b('Sin internet también funciona: '), 'después del primer ingreso, los productos quedan guardados en el celular.']])
diapo('Vademécum Epithelium: buscar productos', [
        {'img': 'v_prod', 'alto': 5.5, 'refs': ['nombre', 'comp', 'cat', 'forma', 'nuevo', 'card', ('volver', 'izq')]},
        {'img': 'v_prod_filtro', 'alto': 5.5, 'refs': []}],
    [('Buscar por nombre', 'Escribe parte del nombre del producto.'), ('Componente', 'Escribe o elige un activo de la lista (ej.: Niacinamida).'),
     ('Categoría', 'Acné, despigmentantes, capilares, corticoides…'), ('Forma', 'Crema, gel, loción, sérum, emulsión…'),
     ('Lo nuevo', 'Muestra solo los productos nuevos.'), ('Tarjeta', 'Nombre, componentes, forma y categoría. Tócala para ver la ficha.'),
     ('Inicio', 'Vuelve a la pantalla de inicio.')],
    fila_h=0.5, size=10.5, nota=[[b('Los filtros se combinan: '), 'a la derecha, búsqueda por componente "Niacinamida". El color del borde de la tarjeta indica la categoría.']])
diapo('Ficha del producto', [
        {'img': 'v_detalle', 'alto': 5.6, 'recorte': (0, 690), 'refs': ['titulo', 'comp', 'esp', 'ind']},
        {'img': 'v_detalle', 'alto': 5.6, 'recorte': (640, 1380), 'refs': ['dosis', 'ref']}],
    [('Nombre', 'Nombre comercial y presentación.'), ('Componentes', 'Activos y concentraciones.'),
     ('Especificaciones', 'Categoría, forma, presentación y tamaño.'), ('Indicación', 'Para qué sirve y a qué paciente va dirigido.'),
     ('Dosis recomendada', 'Aplicación, cantidad, frecuencia y duración.'), ('Referencia interna', 'Código para pedidos y cotizaciones.')],
    fila_h=0.55, size=11, nota=[[b('Para cerrar la ficha '), 'toca la X o fuera del recuadro.']])
diapo('Lo Nuevo', [
        {'img': 'v_lonuevo', 'alto': 5.5, 'refs': ['boton', 'aviso', 'badge', 'card']},
        {'img': 'v_lonuevo_detalle', 'alto': 5.5, 'recorte': (0, 844), 'refs': ['titulo']}],
    [('Botón Lo nuevo', 'Activa o quita el filtro de productos nuevos.'), ('Aviso', 'Cuántos productos nuevos estás viendo.'),
     ('Etiqueta NUEVO', 'Marca cada producto nuevo, en morado.'), ('Tarjeta', 'Tócala para ver la ficha completa.'),
     ('Ficha', 'Misma información que cualquier producto.')],
    fila_h=0.55, size=11, nota=[[b('Úsalo en la visita: '), 'es la forma más rápida de presentar lo nuevo al médico o al cliente.']])
diapo('Vademécum Cliente: tus clientes', [
        {'img': 'v_clientes', 'alto': 5.5, 'refs': ['zona', 'buscar', 'card']},
        {'img': 'v_clientes_equipo', 'alto': 5.5, 'refs': ['zona', ('chipZona', 'izq')]}],
    [('Tu zona', 'El comercial ve solo los clientes de su zona.'), ('Buscar cliente', 'Escribe parte del nombre.'),
     ('Cliente', 'Tócalo para abrir su portafolio.'), ('Todas las zonas', 'Jefes y equipo: filtra por zona.'), ('Zona del cliente', 'Jefes y equipo ven la zona de cada cliente.')],
    fila_h=0.55, size=11, nota=[[b('Nombres tapados '), 'en esta presentación para proteger la información de los clientes.']])
diapo('Portafolio del cliente', [
        {'img': 'v_portafolio', 'alto': 5.5, 'refs': ['titulo', 'volver', 'nombre', 'cat', 'nuevo', 'card', 'epi']}],
    [('Cliente', 'Nombre del cliente del portafolio.'), ('← Clientes', 'Vuelve a la lista de clientes.'),
     ('Buscar', 'Por nombre o componente, igual que en el Vademécum.'), ('Categoría y forma', 'Filtros del portafolio.'),
     ('Lo nuevo', 'Productos nuevos para ese cliente.'), ('Producto del cliente', 'Con el nombre que el cliente le da.'),
     ('Nombre Epithelium', 'Con el símbolo del logo: el producto equivalente de Epithelium.')],
    fila_h=0.52, size=11, nota=[[b('Úsalo para preparar la visita: '), 'revisa qué compra el cliente antes de llegar.']])
diapo('Portafolio: oportunidades con productos nuevos', [
        {'img': 'v_portafolio_nuevos', 'alto': 5.5, 'refs': ['sep', 'badge']},
        {'img': 'v_portafolio_detalle', 'alto': 5.5, 'recorte': (0, 844), 'refs': ['titulo', 'epi']}],
    [('Productos Nuevos Epithelium', 'Al final del portafolio: lo nuevo que el cliente todavía no tiene.'),
     ('NUEVO EPITHELIUM', 'Etiqueta de cada producto nuevo que puedes ofrecerle.'),
     ('Ficha', 'Tócala para ver componentes, indicación y dosis.'), ('Nombre Epithelium', 'Equivalencia entre el producto del cliente y el de Epithelium.')],
    fila_h=0.6, size=11.5, nota=[[b('Idea para la visita: '), 'los productos de esta sección son oportunidades concretas de venta para ese cliente.']])
diapo('Materias Primas: buscar activos', [
        {'img': 'v_mp', 'alto': 5.5, 'refs': ['nombre', 'uso', 'cat', 'chip', 'card', ('barra', 'izq')]},
        {'img': 'v_mp_filtro', 'alto': 5.5, 'refs': []}],
    [('Buscar por nombre', 'Nombre de la materia prima.'), ('Uso / indicación', 'Escribe o elige un uso (ej.: acné).'),
     ('Categoría', 'Filtra por categoría terapéutica.'), ('Etiquetas', 'Categorías de la materia prima, con su color.'),
     ('Tarjeta', 'Concentración de uso y resumen. Tócala para ver la ficha.'), ('Color del borde', 'Indica la categoría principal.')],
    fila_h=0.55, size=11, nota=[[b('A la derecha: '), 'búsqueda por uso "acné".']])
diapo('Ficha de la materia prima', [
        {'img': 'v_mp_detalle', 'alto': 5.7, 'recorte': (0, 895), 'refs': ['titulo', 'chips', 'desc', 'ident', 'uso', 'ref']}],
    [('Nombre', 'Nombre de la materia prima.'), ('Categorías', 'Toca una etiqueta para ver su descripción.'),
     ('Descripción', 'Qué agrupa esa categoría y cómo actúa.'), ('Identificación técnica', 'Qué es y cómo funciona.'),
     ('Uso terapéutico', 'Para qué se usa.'), ('Referencia interna', 'Código de la materia prima (visible para el equipo y los comerciales).')],
    fila_h=0.55, size=11)
diapo('Mantén el Vademécum al día', [
        {'img': 'v_version', 'alto': 5.5, 'refs': [('aviso', 'arriba')]}],
    [('"Hay una versión nueva"', 'Toca Actualizar: la app se recarga con los últimos productos y cambios.'),
     ('Sin internet', 'Puedes consultar lo que ya está guardado en el celular.'),
     ('Si algo no carga', 'Conéctate a internet y toca "Reintentar".')],
    fila_h=0.75, size=12, regreso=True)

# ================================================================ PUNTO 2 · VISITA COMERCIAL
PUNTO2_INI = len(nuevas)
diapo_qr('Paso 1 · Descarga Visita Comercial', '202609QR RutaComercial.png', '/home/user/ruta-comercial/icons/icon-512.png', 'Visita Comercial',
         'Plan de trabajo, Visiplan, actividades y circulares, maestra de clientes, leads e informes.', URL_R,
         [[b('Tip: '), 'desde el botón "Vademécum Epithelium" de esta app entras al Vademécum sin volver a escribir la clave.']])
bloque_instalacion('r', 'Visita Comercial', 'Visita Comercial')
diapo('Paso 3 · Ingresa a Visita Comercial', [
        {'img': 'r_login', 'alto': 5.4, 'refs': ['usuario', 'clave', 'acceder']},
        {'img': 'r_home', 'alto': 5.4, 'refs': ['saludo', ('salir', 'izq')]}],
    [('Usuario', 'Tu usuario (el mismo del Vademécum).'), ('Clave', 'Tu clave personal.'), ('Acceder', 'Entras a la pantalla de inicio.'),
     ('Saludo', 'Tu nombre, cargo y zona: confirma que entraste con tu usuario.'), ('Salir', 'Cierra la sesión. Úsalo solo si vas a prestar el celular.')],
    fila_h=0.6, size=11.5, nota=[[b('La sesión queda guardada: '), 'la próxima vez que abras la app entras directo.']])
diapo('Pantalla de inicio: los módulos', [
        {'img': 'r_home', 'alto': 5.4, 'refs': ['plan', 'visiplan', 'act', 'maestra']},
        {'img': 'r_home_alto', 'alto': 5.4 * (1060 - 258) / 844, 'recorte': (258, 1060), 'refs': ['vade', 'proy', 'desc', 'sync']}],
    [('Plan de Trabajo', 'Programar y cerrar las visitas del día.'), ('Visiplan del mes', 'Marcar qué días visitas a cada cliente.'),
     ('Actividades-Circulares', 'Circulares vigentes y tareas del mes.'), ('Maestra Clientes', 'Tus clientes, su historial y su portafolio.'),
     ('Vademécum Epithelium', 'Abre el Vademécum sin clave.'), ('Leads', 'Contactos nuevos y su seguimiento.'),
     ('Descargar informe', 'Excel del mes.'), ('Sincronización', 'Hora de la última actualización y cambios por subir.')],
    anchos=(0.3, 1.45, 2.9), fila_h=0.5, size=10.5,
    nota=[[b('Jefes: '), 'además ven "Panel del equipo" y las solicitudes de creación y eliminación.']])
# ---- Plan de Trabajo
diapo('Plan de Trabajo: tu día', [
        {'img': 'vc_agenda_vacia', 'alto': 5.4, 'refs': ['nav', 'semana', 'hoy', 'mes', 'programar', 'buscar']},
        {'img': 'vc_agenda_dia', 'alto': 5.4, 'refs': ['anillo', 'tarjeta1']}],
    [('Fecha', 'Flechas para ir al día anterior o siguiente.'), ('Semana', 'Toca un día; los puntos indican visitas.'),
     ('Hoy', 'Vuelve al día de hoy.'), ('Mes', 'Calendario del mes con las visitas de cada día.'),
     ('+ Programar', 'Agrega una visita, trabajo interno, contacto nuevo o novedad.'), ('Buscar', 'Busca un cliente en el día.'),
     ('Indicadores', 'Visitadas, pendientes y no visitadas del día, semana y mes.'), ('Tarjeta de visita', 'Cada visita programada con su estado.')],
    fila_h=0.5, size=10.5, nota=[[b('Regla: '), 'lo que se programa antes de las 8:00 a. m. del día cuenta como programado; después queda como NO programado.']])
diapo('Plan de Trabajo: indicadores del día, la semana y el mes', [
        {'pc': True, 'img': 'pc_agenda', 'ancho': 8.6, 'y': 1.2, 'refs': ['dia', 'semanaA', 'mesA', 'resumen']}],
    [('Día', 'Visitas del día: visitadas (verde), pendientes (naranja) y no visitadas (rojo), con su %.'),
     ('Semana', 'Acumulado de lunes a hoy.'), ('Mes', 'Acumulado del mes hasta hoy.'),
     ('No programadas', 'Visitas creadas después de las 8:00 a. m. del día. Tócalo para verlas.')],
    anchos=(0.3, 1.0, 2.1), tabla_x=9.45, tabla_y=2.65, tabla_w=3.0, fila_h=0.75, size=10,
    nota=[[b('El centro del anillo '), 'es el total de visitas; el % se calcula sobre ese total. En el celular se cambia con Día · Semana · Mes.']])
diapo('Programar una visita', [
        {'img': 'vc_prog_lleno', 'alto': 5.6, 'recorte': (0, 700), 'refs': ['fecha', ('hora', 'izq'), 'que', 'contacto', 'modalidad', 'objetivos']},
        {'img': 'vc_prog_lleno', 'alto': 5.6, 'recorte': (690, 1370), 'refs': ['notas', 'boton']}],
    [('Fecha', 'Día de la visita.'), ('Cita fija', 'Opcional: la app avisa 15 minutos antes.'),
     ('¿Qué vas a programar?', 'Visita Médica, Visita Cliente, Punto de Venta, trabajo interno, Lead o novedad.'),
     ('Cliente', 'Búscalo en la Maestra. Debajo sale su clasificación.'), ('Modalidad', 'Presencial, virtual o WhatsApp/llamada.'),
     ('Objetivos', 'Marca uno o varios; al marcar se abren sus subcategorías (circulares, productos…).'),
     ('¿Qué vas a hacer?', 'Obligatorio, máximo 100 caracteres.'), ('Programar', 'Guarda la visita en tu plan.')],
    fila_h=0.5, size=10.5)
diapo('Lead (contacto nuevo) y novedades', [
        {'img': 'vc_prog_nuevo', 'alto': 5.0, 'recorte': (0, 780), 'refs': ['que', 'contacto']},
        {'img': 'vc_novedad', 'alto': 4.9, 'refs': ['que', 'desde', 'hasta']},
        {'img': 'dlg_1', 'alto': 4.9, 'refs': []}],
    [('Lead', 'Médico o cliente que no está en la Maestra.'), ('Datos', 'Tipo, ciudad (de la lista), clasificación, contacto y teléfono.'),
     ('Novedad', 'Vacaciones, incapacidad, permiso, cita médica o cumpleaños.'), ('Desde', 'Primer día.'), ('Hasta', 'Último día.')],
    anchos=(0.3, 1.1, 2.3), fila_h=0.55, size=10.5,
    nota=[[b('Festivos: '), 'salen en gris en el calendario; la app pide confirmar antes de programar en festivo o con novedad.']])
diapo('Cierre de visita: Visitado', [
        {'img': 'vc_cierre_lleno', 'alto': 5.6, 'recorte': (0, 700), 'refs': ['plazo', 'atendio', 'modalidad', 'cumplidos']},
        {'img': 'vc_cierre_lleno', 'alto': 5.6, 'recorte': (690, 1380), 'refs': ['compromisos', 'proxima', 'boton']}],
    [('Plazo', 'Hasta las 11:59 a. m. del siguiente día hábil.'), ('¿Quién atendió?', 'Nombre y cargo. Obligatorio.'),
     ('Modalidad', 'Cómo se hizo la visita.'), ('Objetivos cumplidos', 'En negrita lo programado: marca lo que lograste. Colocación pide el número de pedido; muestras piden producto y cantidad.'),
     ('Compromisos', 'Próximos pasos u observaciones. Obligatorio.'), ('Próxima visita', 'Opcional: queda programada en ese día y en el Visiplan.'),
     ('Guardar visita', 'Después de guardar, el reporte no se puede modificar.')],
    fila_h=0.55, size=10.5)
diapo('Cierre: pedido, productos por etiqueta y guía', [
        {'img': 'vc_cierre_pedido', 'alto': 5.6, 'recorte': (1560, 2240), 'refs': ['pedido', 'pedidos']},
        {'img': 'vc_guia_etiqueta', 'alto': 5.4, 'refs': ['etiquetas', ('info', 'izq'), ('guia', 'izq'), 'elegidos']}],
    [('Pedido', 'Con Colocación: marca la categoría y escribe el número de 6 cifras (OV / OVI).'),
     ('Productos pedidos', 'Se eligen por etiqueta de producto.'),
     ('Etiquetas', 'Nuevo, Foco y Transición-Impulso se despliegan para elegir productos; Portafolio, Cliente y Consultorio se marcan con un toque.'),
     ('ⓘ', 'Abre la guía de esa etiqueta.'), ('Guía', 'Concepto estratégico y mensaje comercial (punto 3).'),
     ('Elegidos', 'Productos marcados, con su código.')],
    fila_h=0.6, size=10.5)
diapo('Cierre de visita: No visitado', [
        {'img': 'vc_no_visitado', 'alto': 5.4, 'refs': ['motivo', 'repro', 'obs', 'boton']},
        {'img': 'vc_agenda_cerrada', 'alto': 5.4, 'refs': ['resumen', 'tarjeta1']}],
    [('Motivo', 'Cliente no estaba, cerrado, canceló la cita, sin tiempo en la ruta…'), ('Reprogramar', 'Opcional: la visita pasa a esa fecha como reprogramada.'),
     ('Observaciones', 'Qué pasó.'), ('Guardar', 'Cierra la visita como no visitada.'),
     ('Resumen del día', 'Se actualizan visitadas, no visitadas y pendientes.'), ('Tarjeta cerrada', 'Muestra el estado y los objetivos cumplidos con ✓.')],
    fila_h=0.55, size=10.5,
    nota=[[b('Si no se reporta a tiempo '), '(11:59 a. m. del siguiente día hábil), la visita queda como NO visitada. Eliminar una visita requiere autorización del administrador.']])
diapo('Calendario del mes', [
        {'img': 'vc_calendario', 'alto': 5.4, 'refs': [[30, 34, 330, 42], [78, 352, 44, 58], [317, 113, 44, 58]]}],
    [('Mes', 'Cambia de mes con las flechas.'), ('Día con visitas', 'Muestra cuántas visitas tiene; tócalo para ir a ese día.'),
     ('Domingos y festivos', 'En rojo o gris, con el nombre del festivo.')],
    fila_h=0.65, size=12, nota=[[b('Novedades: '), 'las vacaciones, incapacidades y permisos también quedan marcados en los días del calendario.']])
diapo('Historial del cliente', [
        {'img': 'vc_historial', 'alto': 5.6, 'recorte': (0, 700), 'refs': ['cab', 'filtros', 'resumen', [30, 282, 330, 160]]},
        {'img': 'vc_historial', 'alto': 5.6, 'recorte': (430, 1010), 'refs': [[30, 452, 330, 520]]}],
    [('Cliente', 'Nombre, tipo, ciudad y clasificación.'), ('Fechas', 'Filtro en cascada: año › semestre › trimestre › mes.'),
     ('Resumen', 'Visitas, efectivas, última y próxima. Toca uno para filtrar.'), ('Programadas', 'Visitas pendientes con su plan.'),
     ('Visita realizada', 'Atendió, objetivos, pedido, productos por etiqueta, muestras y compromisos.')],
    fila_h=0.68, size=11,
    nota=[[b('Dónde se abre: '), 'en Maestra Clientes tocando el cliente, o desde la tarjeta de la visita.']])
# ---- Visiplan
diapo('Visiplan del mes', [
        {'pc': True, 'img': 'pc_visiplan', 'ancho': 8.6, 'y': 1.2, 'refs': ['vends', 'mes', 'periodo', 'filtros', 'conv', 'excel', 'celda']}],
    [('Vendedores', 'Jefes: eligen a quién ver.'), ('Mes', 'Editable hasta la fecha que indica.'), ('Periodo', 'Hoy, semana o mes.'),
     ('Filtros', 'Cliente, tipo y etiqueta.'), ('Convenciones', 'Qué significa cada color.'),
     ('Descargar Excel', 'El Visiplan en Excel.'), ('Casilla P', 'Pon o quita la X. La R se marca sola al reportar.')],
    anchos=(0.3, 1.05, 2.0), tabla_x=9.45, tabla_y=2.65, tabla_w=3.0, fila_h=0.56, size=10)
# ---- Actividades
diapo('Actividades-Circulares', [
        {'img': 'vc_circulares', 'alto': 4.9, 'refs': ['vistas', 'filtro', 'buscar', 'orden', 'tarjeta']},
        {'img': 'vc_tareas', 'alto': 4.9, 'refs': ['nueva']},
        {'img': 'vc_actividad_form', 'alto': 4.9, 'refs': ['act']}],
    [('Circulares / Tareas', 'Cambia de vista.'), ('Estado', 'Vigentes, vencidas o todas.'),
     ('Buscar', 'Circular, producto o cliente.'), ('Ordenar', 'Por circular o por fechas.'),
     ('Circular', 'Vigencia, dirigida a, producto y objetivo. "Ver PDF" se abre dentro de la app.'), ('+ Nueva actividad', 'Programa una tarea del mes.'),
     ('Actividad', 'Nombre, tipo, fecha y meta.')],
    anchos=(0.3, 1.2, 2.2), fila_h=0.5, size=10.5)
# ---- Maestra
diapo('Maestra Clientes', [
        {'img': 'vc_maestra', 'alto': 5.4, 'refs': ['buscar', 'filtros', 'dims', 'barras']},
        {'img': 'vc_historial', 'alto': 5.4, 'refs': ['resumen']}],
    [('Buscar', 'Busca un cliente por nombre.'), ('Filtros', 'Etiqueta, clasificación, departamento, ciudad, plazo, facturación y visitados.'),
     ('Agrupar por', 'Cambia la gráfica: etiqueta, clasificación, ciudad…'), ('Barras', 'Toca una o varias para filtrar la lista.'),
     ('Historial', 'Toca un cliente: visitas, efectivas, última y próxima, con el detalle de cada una.')],
    fila_h=0.62, size=11)
# ---- Portafolio del cliente
diapo('Maestra: Portafolio del cliente', [
        {'img': 'vc_maestra_portafolio', 'alto': 4.9, 'refs': ['fila', 'enlace']},
        {'img': 'vc_portafolio', 'alto': 4.9, 'refs': ['sub', 'buscar', 'prod']},
        {'img': 'vc_portafolio_ficha', 'alto': 4.9 * 800 / 844, 'recorte': (150, 950), 'refs': ['comp', 'ind', 'dosis']}],
    [('Cliente', 'Solo los clientes con portafolio exclusivo.'), ('Portafolio del cliente', 'Tócalo: el número es cuántos productos tiene.'),
     ('Cliente y total', 'Nombre del cliente y sus productos exclusivos.'), ('Buscar', 'Por código, nombre o componente.'),
     ('Producto', 'Código y nombre. Tócalo para desplegar la ficha.'),
     ('Componentes', 'Fórmula del producto.'), ('Indicación', 'Para qué se usa.'), ('Dosis', 'Cómo se aplica (del Vademécum).')],
    anchos=(0.3, 1.1, 2.3), fila_h=0.44, size=9.5,
    nota=[[b('Portafolio exclusivo: '), 'productos con etiqueta Cliente y categoría con el nombre del cliente.']])
# ---- Leads e informe
diapo('Leads e informe del mes', [
        {'img': 'vc_lead_form', 'alto': 4.9, 'refs': ['nombre', 'ciudad', 'clasif']},
        {'img': 'vc_leads', 'alto': 4.9, 'refs': [[232, 30, 128, 34], 'tarjeta', 'programar']},
        {'img': 'vc_descarga', 'alto': 4.9, 'refs': ['mes', 'boton']}],
    [('Crear Lead', 'Nombre, tipo, ciudad y teléfono.'), ('Ciudad', 'Se escoge de la lista.'), ('Clasificación', 'Del cliente, si ya se sabe.'),
     ('+ Crear Lead', 'Desde la lista de Leads.'), ('Lead', 'Seguimiento: días, visitas y próxima.'),
     ('Programar visita', 'Agenda su visita. Luego: Editar o Solicitud de creación.'),
     ('Mes', 'Mes del informe.'), ('Descargar Excel', 'Visitas y actividades del mes.')],
    anchos=(0.3, 1.1, 2.3), fila_h=0.5, size=10)
# ---- Jefes
diapo('Jefes: Panel del equipo', [
        {'pc': True, 'img': 'pc_panel', 'ancho': 8.6, 'y': 1.2, 'refs': ['mes', 'filtros', 'kpis', 'dias', 'tipos', 'objetivos']}],
    [('Mes', 'Cambia de mes.'), ('Filtros', 'Vendedor, tipo y estado.'), ('Indicadores', 'Programadas, visitadas, cumplimiento…'),
     ('Visitas por día', 'Visitadas, no visitadas y pendientes.'), ('Por tipo', 'Programadas por tipo.'), ('Objetivos', 'Cumplidos frente a programados.'),
     ('Más abajo', 'Indicador del día, por vendedor, motivos y detalle.')],
    anchos=(0.3, 1.05, 2.0), tabla_x=9.45, tabla_y=2.65, tabla_w=3.0, fila_h=0.56, size=10)
diapo('Jefes: plan de trabajo del equipo', [
        {'pc': True, 'img': 'pc_agenda', 'ancho': 8.6, 'y': 1.2, 'refs': ['vends', 'nav', 'botones', 'anillo', 'lista']}],
    [('Vendedores', 'Uno o varios (Ctrl + clic).'), ('Fecha', 'Día que estás viendo.'),
     ('Botones', 'Hoy, fecha, buscar, mes y programar.'), ('Indicadores', 'Día, semana y mes.'), ('Tarjetas', 'Visitas del equipo y su estado.')],
    anchos=(0.3, 1.05, 2.0), tabla_x=9.45, tabla_y=2.65, tabla_w=3.0, fila_h=0.6, size=10)
diapo('Mantén Visita Comercial al día', [
        {'img': 'r_version', 'alto': 5.4, 'refs': [('aviso', 'arriba')]},
        {'img': 'r_home_alto', 'alto': 5.4 * (1060 - 258) / 844, 'recorte': (258, 1060), 'refs': ['sync', ('version', 'izq')]}],
    [('"Hay una versión nueva"', 'Toca Actualizar: la app se recarga con los últimos cambios.'),
     ('Sincronización', '"Actualizado hh:mm" = tus visitas ya subieron. Si dice "cambios por subir", conéctate y toca Actualizar.'),
     ('Versión', 'Fecha y hora de la versión instalada (útil para soporte).')],
    fila_h=0.75, size=11.5, regreso=True,
    nota=[[b('Sin señal también puedes registrar: '), 'se guarda en el celular y sube cuando vuelva la conexión. No borres los datos del navegador si hay cambios por subir.']])

# ================================================================ PUNTO 3 · GUÍA DE ETIQUETAS
import subprocess as _sp
GUIA = json.loads(_sp.check_output(['node', '-e', "global.window={}; require('/home/user/ruta-comercial/productos.js'); const c=window.CATALOGO; const n={}; c.productos.forEach(p=>p.e.forEach(e=>n[e]=(n[e]||0)+1)); console.log(JSON.stringify({guia:c.guia, n, total:c.productos.length}))"]).decode())
PUNTO3_INI = len(nuevas)
def diapo_etiquetas(titulo_t, campo, pie):
    s = nueva(titulo_t); nuevas.append(s); an = Anim(s)
    etqs = list(GUIA['guia'].keys())
    W, Hc, gx, gy = 2.55, 2.72, 0.15, 0.15
    tarjetas = []
    for k, e in enumerate(etqs):
        x = 0.7 + (k % 4) * (W + gx); y = 1.1 + (k // 4) * (Hc + gy)
        sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(W), Inches(Hc)); sh.name = f'Etiqueta{k + 1}'
        sh.adjustments[0] = 0.05; sh.fill.solid(); sh.fill.fore_color.rgb = rgb(KPI_BG); sh.line.color.rgb = rgb(VERDE); sh.line.width = Pt(1); sh.shadow.inherit = False
        tf = sh.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = tf.margin_right = Inches(0.1); tf.margin_top = Inches(0.08); tf.margin_bottom = Inches(0.05)
        n = GUIA['n'].get(e, 0)
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.LEFT; r = p.add_run(); r.text = e; r.font.size = Pt(14); r.font.bold = True; r.font.color.rgb = rgb(VERDE_OSC)
        p = tf.add_paragraph(); p.alignment = PP_ALIGN.LEFT; r = p.add_run(); r.text = f'{n} producto' + ('' if n == 1 else 's'); r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = rgb('B07F00')
        p.space_after = Pt(4)
        p = tf.add_paragraph(); p.alignment = PP_ALIGN.LEFT; r = p.add_run(); r.text = GUIA['guia'][e].get(campo, ''); r.font.size = Pt(10.5 if campo == 'concepto' else 10); r.font.color.rgb = rgb(GRIS)
        tarjetas.append(sh)
    pie_tb = fuente(s, pie, y=6.95)
    an.auto = tarjetas + [pie_tb]; an.construir()
    return s
diapo_etiquetas('Guía de etiquetas: concepto estratégico', 'concepto',
    f'Número de productos del catálogo de Visita Comercial ({GUIA["total"]} productos; uno puede tener varias etiquetas). En la app, el botón ⓘ junto a cada etiqueta muestra esta guía.')
diapo_etiquetas('Guía de etiquetas: mensaje comercial', 'mensaje',
    'Mensaje para usar con el médico o el cliente. Fuente: guía de etiquetas del catálogo de productos de Visita Comercial.')
s_ = nuevas[-1]; icono_regreso(s_)

# ================================================================ PUNTO 4 · COTIZADOR (solo portada)
# ================================================================ CIERRE
cierre = prs.slides.add_slide([l for l in prs.slide_layouts if l.part.partname.endswith('slideLayout3.xml')][0])
for ph_ in list(cierre.placeholders): ph_._element.getparent().remove(ph_._element)

orden = [PORTADA, ORDEN, nuevas[0], VID_V] + nuevas[1:PUNTO2_INI] + [VID_R] + nuevas[PUNTO2_INI:PUNTO3_INI] + [VID_E] + nuevas[PUNTO3_INI:] + [VID_C, cierre]
lst = prs.slides._sldIdLst
ids = {prs.part.related_part(e.rId): e for e in list(lst)}
conservar = {s_.part for s_ in orden}
for e in list(lst):
    if prs.part.related_part(e.rId) not in conservar: prs.part.drop_rel(e.rId)
    lst.remove(e)
for s_ in orden: lst.append(ids[s_.part])
for sl in orden:
    xml = etree.tostring(sl._element).decode()
    for rId, rel in list(sl.part.rels.items()):
        if rel.reltype in (RT.SLIDE_LAYOUT, RT.NOTES_SLIDE): continue
        if f'"{rId}"' not in xml: sl.part.rels.pop(rId)
for ext in prs.part._element.findall('.//' + qn('p:ext')):
    if b'sectionLst' in etree.tostring(ext): ext.getparent().remove(ext)
vp = prs.part.part_related_by(RT.VIEW_PROPS)
vx = etree.fromstring(vp.blob)
for sl in vx.iter('{%s}sldLst' % NS['p']): sl.getparent().remove(sl)
vp._blob = etree.tostring(vx, xml_declaration=True, encoding='UTF-8', standalone=True)
for rId, rel in list(vp.rels.items()):
    if rel.reltype == RT.SLIDE: vp.rels.pop(rId)
for sl in nuevas + [ORDEN, cierre]: poner_transicion(sl)
prs.save(OUT)
print('ok', len(orden), 'diapositivas')
