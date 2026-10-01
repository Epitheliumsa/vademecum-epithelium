// Capturas de Visita Comercial con datos de ejemplo. El servidor de Google se reemplaza por uno falso en memoria.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const CJ = OUT + 'cajas.json';
const cajas = fs.existsSync(CJ) ? JSON.parse(fs.readFileSync(CJ)) : {};
const CONT = JSON.parse(fs.readFileSync('/home/user/ruta-comercial/contactos.json'));
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro', 'Maryi Castro',
  ...Object.values(CONT).flat().map(c => c.n)].filter(n => n && n.length > 3).sort((a, b) => b.length - a.length);
const STORE = {};   // servidor falso

const norte = CONT['Zona Norte'];
const doctor = norte.find(c => c.cl === '22');
const cliente = norte.find(c => c.e === 'Cliente' && c.f);
const pdv = norte.find(c => /punto/i.test(c.e)) || norte.filter(c => c.e === 'Cliente')[3];
const cliente2 = norte.filter(c => c.e === 'Cliente' && c.f)[4];

async function tapar(p) {
  await p.evaluate((NOMBRES) => {
    if (!document.getElementById('tapar-css')) {
      const css = document.createElement('style'); css.id = 'tapar-css';
      css.textContent = '.tapado{filter:blur(4.5px);} input.tapado{filter:blur(4px);} .toast{display:none!important}';
      document.head.appendChild(css);
    }
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(' + NOMBRES.map(esc).join('|') + ')', 'g');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.parentElement && n.parentElement.closest('.tapado, script, style, datalist, option')) continue;
      re.lastIndex = 0;
      if (re.test(n.nodeValue)) nodos.push(n);
    }
    nodos.forEach(n => {
      const span = document.createElement('span');
      span.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(re, '<span class="tapado">$1</span>');
      n.replaceWith(...span.childNodes);
    });
    document.querySelectorAll('input, textarea').forEach(i => { re.lastIndex = 0; if (i.value && re.test(i.value)) i.classList.add('tapado'); });
  }, NOMBRES);
}

async function foto(p, nombre, sels = {}, { sinTapar = false, completo = false, alto = 0 } = {}) {
  const vp0 = p.viewportSize();
  if (alto) { await p.setViewportSize({ width: vp0.width, height: alto }); await p.evaluate(() => { const m = document.querySelector('.modal.active .modal-content, .modal.visible .modal-content, #modal .modal-content'); if (m) m.scrollTop = 0; }); }
  await p.waitForTimeout(450);
  if (!sinTapar) await tapar(p);
  await p.screenshot({ path: OUT + nombre + '.png', fullPage: completo });
  const vp = p.viewportSize();
  cajas[nombre] = { w: vp.width, h: vp.height, items: {} };
  for (const [k, s] of Object.entries(sels)) {
    try {
      const b = await p.locator(s).first().boundingBox({ timeout: 1500 });
      if (b) cajas[nombre].items[k] = [b.x, b.y, b.width, b.height]; else console.log('sin caja', nombre, k);
    } catch (e) { console.log('sin caja', nombre, k); }
  }
  if (alto) await p.setViewportSize(vp0);
  console.log('foto', nombre);
}

async function nuevoContexto(browser, vp = { width: 390, height: 844 }, hora = '2026-09-29T07:05:00-05:00') {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route(/script\.google\.com/, async r => {
    let body = {};
    try { body = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (body.accion === 'guardar') (body.registros || []).forEach(x => { STORE[x.id] = x; });
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, registros: Object.values(STORE) }) });
  });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(hora) });
  p.on('pageerror', e => console.log('ERROR pagina:', e.message));
  return { ctx, p };
}

async function entrar(p, id) {
  await p.goto('http://localhost:8802/');
  await p.evaluate(id => localStorage.setItem('rc_sesion', JSON.stringify({ id, clave: 'x' })), id);
  await p.reload(); await p.waitForTimeout(1500);
}

let nDialogo = 0;
async function cerrarDialogo(p, texto) {
  if (!(await p.locator('#dialogo.visible').count())) return;
  await p.screenshot({ path: OUT + 'dlg_' + (++nDialogo) + '.png' });
  console.log('dialogo', nDialogo, (await p.locator('#dialogo.visible').innerText()).slice(0, 150).replace(/\n/g, ' | '));
  const b = p.locator('#dialogo.visible button').last();
  if (await b.count()) { await b.click(); await p.waitForTimeout(300); }
}

async function programar(p, { tipo, contacto, hora, objs = 2, texto, fotoAntes, fotoDespues, tipoNuevo, nuevo }) {
  await p.evaluate(() => abrirProgramar()); await p.waitForTimeout(500);
  if (fotoAntes) await foto(p, fotoAntes, { fecha: '#fFecha', hora: '#fHora', que: '#fTipo' });
  await p.selectOption('#fTipo', tipo); await p.waitForTimeout(200);
  if (tipoNuevo) { await p.selectOption('#fTipoNuevo', tipoNuevo); await p.waitForTimeout(200); }
  if (contacto) {
    await p.fill('#fContacto', contacto);
    await p.locator('#fContacto').dispatchEvent('input');
    await p.locator('#fContacto').dispatchEvent('change'); await p.waitForTimeout(300);
  }
  if (nuevo) { await p.fill('#pCiudad', await ciudadValida(p, '#pCiudad')); await p.fill('#pTel', '300 555 1234'); await p.fill('#pPersona', 'Asistente'); }
  if (hora) await p.fill('#fHora', hora);
  const nObj = await p.locator('#fObjetivos input.obj').count();
  for (let i = 0; i < Math.min(objs, nObj); i++) { try { await p.locator('#fObjetivos input.obj').nth(i).check({ timeout: 1500 }); } catch (e) { console.log('obj', i, e.message.split('\n')[0]); } await p.waitForTimeout(150); }
  // una subcategoría del primer objetivo, si tiene
  const sub = p.locator('#fObjetivos .obj-item.abierto .subs input');
  if (await sub.count()) { try { await sub.first().check({ timeout: 1500 }); } catch (e) {} }
  if (texto) { await p.fill('#fObjetivo', texto); await p.locator('#fObjetivo').dispatchEvent('input'); }
  if (fotoDespues) await foto(p, fotoDespues, { fecha: '#fFecha', hora: '#fHora', que: '#fTipo', contacto: '#fContacto', clasif: '#fClasif', modalidad: '#cajaModalidad', objetivos: '#cajaObjetivos', notas: '#fObjetivo', boton: '#modalContenido .btn-primario' }, { alto: 1700 });
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500);
  await cerrarDialogo(p, /Programar|Aceptar|Sí|Continuar/);
  await p.waitForTimeout(300);
}

const ciudadValida = (p, sel) => p.evaluate(() => (typeof CIUDADES !== 'undefined' && (CIUDADES.find(c => /^Bogot/i.test(c)) || CIUDADES[0])) || 'Bogotá');
// Cierre completo: objetivos que pidan (regex), pedido, muestras y productos por etiqueta
async function cierreCompleto(p, re) {
  await p.evaluate(re => {
    const R = new RegExp(re);
    document.querySelectorAll('#rCumplidos input.obj').forEach(i => { if (R.test(i.value) && !i.checked) { i.checked = true; abrirSubs(i); } });
    document.querySelectorAll('#rCumplidos .obj-item').forEach(it => { const o = it.querySelector('input.obj'); if (o && o.checked) { const s = it.querySelector('.subs input'); if (s && !s.checked) s.checked = true; } });
    actualizarCierreVisita();
    const fila = document.querySelector('#cajaPedido .fila-pedido'); if (fila && !document.getElementById('cajaPedido').hidden) { const c = fila.querySelector('.p-cat'); c.checked = true; c.dataset.tocada = 1; }
    actualizarCierreVisita();
    document.querySelectorAll('#cajaPedido .p-nums:not([hidden])').forEach((f, k) => { f.querySelector('.n-pedido').value = ['000860', '002555', '000003'][k] || '000100'; });
    document.querySelectorAll('#cajaMuestras .bloque-muestra:not([hidden]) .fila-muestra').forEach(f => { f.querySelector('.m-prod').value = nombreProducto(CATALOGO.productos.find(x => x.e.includes('Foco')).c); f.querySelector('.m-cant').value = 2; });
    ['rProdPresentados', 'rProdPedidos'].forEach(id => { const caja = document.getElementById(id); if (!caja || caja.closest('[hidden]')) return;
      caja.querySelectorAll('.dd-panel').forEach(panel => { [...panel.querySelectorAll('.sel-ops input')].slice(0, 1).forEach(i => { i.checked = true; }); });
      caja.querySelectorAll('input.cat').forEach((i, k) => { if (k === 0) i.checked = true; });
      pintarSelProductos(caja); });
    actualizarCierreVisita();
  }, re);
  await p.waitForTimeout(300);
}
const idDe = (p, contacto) => p.evaluate(c => Object.values(registros).find(r => r.clase === 'visita' && r.contacto === c && r.estado === 'pendiente')?.id, contacto);

(async () => {
  const browser = await chromium.launch();
  // ===================== COMERCIAL (Zona Norte) =====================
  let { ctx, p } = await nuevoContexto(browser);
  await entrar(p, 'lramos');
  await p.evaluate(() => abrirAgenda()); await p.waitForTimeout(500);
  await foto(p, 'vc_agenda_vacia', { nav: '.nav-fecha', semana: '#agSemana', hoy: '.fila-botones .btn-nuevo', mes: 'button[aria-label="Ver el mes"]', programar: '.btn-programar', buscar: '#agBuscar' });
  await programar(p, { tipo: 'Visita Médica', contacto: doctor.n, hora: '09:00', objs: 2, texto: 'Presentar productos nuevos y dejar muestras', fotoAntes: 'vc_prog_vacio', fotoDespues: 'vc_prog_lleno' });
  await programar(p, { tipo: 'Visita Cliente', contacto: cliente.n, objs: 2, texto: 'Revisar exhibición y tomar pedido' });
  await programar(p, { tipo: 'Visita Cliente', contacto: cliente2.n, objs: 1, texto: 'Cobro de cartera vencida' });
  await programar(p, { tipo: 'Trabajo Administrativo Oficina', objs: 1, texto: 'Informe de cartera y cotizaciones' });
  await p.evaluate(() => { pintarAgenda(); }); await p.waitForTimeout(300);
  await foto(p, 'vc_agenda_dia', { anillo: '#agAnillo', resumen: '#agResumen', tarjeta1: '#agLista .producto-card >> nth=0', tarjeta2: '#agLista .producto-card >> nth=1' });
  await foto(p, 'vc_agenda_dia_alto', {}, { completo: true });
  // Contacto nuevo (lead) para mañana
  await p.evaluate(() => elegirFecha(sumarDias(hoy(), 1))); await p.waitForTimeout(300);
  await programar(p, { tipo: 'nuevo', tipoNuevo: 'Visita Médica', contacto: 'Consultorio Dermatológico Demo', objs: 1, texto: 'Primera visita de presentación', nuevo: true, fotoDespues: 'vc_prog_nuevo' });
  await programar(p, { tipo: 'Visita Cliente', contacto: cliente.n, objs: 1, texto: 'Seguimiento al pedido' });
  // Novedad: vacaciones
  await p.evaluate(() => abrirProgramar()); await p.waitForTimeout(400);
  await p.selectOption('#fTipo', 'Vacaciones'); await p.waitForTimeout(200);
  await p.fill('#fFecha', '2026-10-13'); await p.fill('#fHasta', '2026-10-16');
  await foto(p, 'vc_novedad', { que: '#fTipo', desde: '#fFecha', hasta: '#fHasta' });
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(400); await cerrarDialogo(p, /Aceptar|Guardar|Sí/);
  // Calendario del mes
  await p.evaluate(() => elegirFecha(hoy())); await p.waitForTimeout(200);
  await p.evaluate(() => abrirCalendario()); await p.waitForTimeout(500);
  await foto(p, 'vc_calendario');
  await p.evaluate(() => cerrarModal());

  // ---- Cierre de visitas (misma fecha, en la tarde)
  await p.clock.setFixedTime(new Date('2026-09-29T16:20:00-05:00'));
  await p.evaluate(() => pintarAgenda());
  const v1 = await idDe(p, doctor.n);
  await p.evaluate(id => abrirRegistro(id, 'ok'), v1); await p.waitForTimeout(500);
  await foto(p, 'vc_cierre_vacio', { plazo: '#modalContenido .aviso-hora', atendio: '#rAtendio', modalidad: '#modalContenido .modalidad', cumplidos: '#rCumplidos' });
  await p.fill('#rAtendio', 'Dra. — Dermatóloga');
  for (let i = 0; i < 2; i++) { try { await p.locator('#rCumplidos input.obj').nth(i).check({ timeout: 1500 }); } catch (e) {} await p.waitForTimeout(150); }
  for (let i = 0; i < 2; i++) { try { await p.locator('#rCumplidos .obj-item.abierto .subs input').nth(i).check({ timeout: 1500 }); } catch (e) {} await p.waitForTimeout(150); }
  await p.evaluate(() => actualizarCierreVisita());
  // Cierre completo como en la vida real: colocación con pedido, muestras y productos presentados/pedidos por etiqueta
  await p.evaluate(() => {
    document.querySelectorAll('#rCumplidos input.obj').forEach(i => { if (/^(Colocación|Entrega de Muestras|Productos Nuevos)$/.test(i.value) && !i.checked) { i.checked = true; abrirSubs(i); } });
    document.querySelectorAll('#rCumplidos .obj-item').forEach(it => { const o = it.querySelector('input.obj'); if (o && /^(Colocación|Entrega de Muestras|Productos Nuevos)$/.test(o.value)) { const s = it.querySelector('.subs input'); if (s && !s.checked) s.checked = true; } });
    actualizarCierreVisita();
  });
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const fila = document.querySelector('#cajaPedido .fila-pedido'); if (fila) { const c = fila.querySelector('.p-cat'); c.checked = true; c.dataset.tocada = 1; }
    actualizarCierreVisita();
    document.querySelectorAll('#cajaPedido .p-nums:not([hidden]) .n-pedido').forEach((i, k) => { i.value = k ? '' : '000860'; });
    document.querySelectorAll('#cajaMuestras .bloque-muestra:not([hidden]) .fila-muestra').forEach(f => { f.querySelector('.m-prod').value = nombreProducto(CATALOGO.productos.find(x => x.e.includes('Foco')).c); f.querySelector('.m-cant').value = 2; });
    ['rProdPresentados', 'rProdPedidos'].forEach(id => { const caja = document.getElementById(id); if (!caja) return;
      caja.querySelectorAll('.dd-panel').forEach(panel => { [...panel.querySelectorAll('.sel-ops input')].slice(0, 1).forEach(i => { i.checked = true; }); });
      caja.querySelectorAll('input.cat').forEach((i, k) => { if (k === 0) i.checked = true; });
      pintarSelProductos(caja); });
    actualizarCierreVisita();
  });
  await p.waitForTimeout(300);
  // guía de la etiqueta (ⓘ) abierta sobre "Foco"
  const info = p.locator('#rProdPresentados .con-guia .info-etq').nth(1);
  if (await info.count()) {
    await info.scrollIntoViewIfNeeded(); await info.click(); await p.waitForTimeout(300);
    await p.evaluate(() => { const g = document.querySelector('#rProdPresentados .con-guia.ver'); g && g.scrollIntoView({ block: 'center' }); });
    await foto(p, 'vc_guia_etiqueta', { etiquetas: '#rProdPresentados .sel-etqs', info: '#rProdPresentados .con-guia.ver .info-etq', guia: '#rProdPresentados .con-guia.ver .guia-etq', elegidos: '#rProdPresentados .dd-elegidos' });
    await info.click(); await p.waitForTimeout(200);
  } else console.log('sin ⓘ de etiquetas');
  await p.fill('#rCompromisos', 'Volver en 15 días con la lista de precios'); await p.locator('#rCompromisos').dispatchEvent('input');
  await p.fill('#rProxima', '2026-10-21');
  await foto(p, 'vc_cierre_lleno', { plazo: '#modalContenido .aviso-hora', atendio: '#rAtendio', modalidad: '#modalContenido .modalidad', cumplidos: '#rCumplidos', presentados: '#cajaProdPresentados', compromisos: '#rCompromisos', proxima: '#rProxima', boton: '#modalContenido .btn-primario' }, { alto: 2000 });
  await foto(p, 'vc_cierre_lleno_alto', {}, { completo: true });
  // guardar (si pide muestras, se llenan)
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500); await cerrarDialogo(p);
  let quedo = await p.evaluate(id => registros[id].estado, v1);
  if (quedo === 'pendiente') {   // faltaron datos: se desmarcan muestras/pedido y se reintenta
    await p.evaluate(() => { document.querySelectorAll('#rCumplidos input').forEach(i => { if (/Muestra|Colocaci/.test(i.value)) i.checked = false; }); actualizarCierreVisita(); });
    await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500);
    quedo = await p.evaluate(id => registros[id].estado, v1);
  }
  console.log('v1 quedó', quedo);
  // Cliente: cierre con colocación y pedido (para el historial)
  const vc = await idDe(p, cliente.n);
  if (vc) {
    await p.evaluate(id => abrirRegistro(id, 'ok'), vc); await p.waitForTimeout(400);
    await p.fill('#rAtendio', 'Administradora del punto');
    await cierreCompleto(p, '^(Colocación|Exhibición|Productos Nuevos|Entrega de Muestras|Administración de Cartera)$');
    await foto(p, 'vc_cierre_pedido', { pedido: '#cajaPedido', pedidos: '#cajaProdPedidos' }, { alto: 2400 });
    await p.fill('#rCompromisos', 'Seguimiento a la rotación del pedido'); await p.locator('#rCompromisos').dispatchEvent('input');
    await p.fill('#rProxima', '2026-10-21');
    await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500); await cerrarDialogo(p);
    console.log('cliente quedó', await p.evaluate(id => registros[id].estado, vc));
  }
  // No visitado
  const v2 = await idDe(p, cliente2.n);
  await p.evaluate(id => abrirRegistro(id, 'no'), v2); await p.waitForTimeout(400);
  await p.selectOption('#nMotivo', 'Cerrado');
  await p.fill('#nRepro', '2026-10-02'); await p.fill('#nObs', 'El local estaba cerrado por inventario');
  await foto(p, 'vc_no_visitado', { motivo: '#nMotivo', repro: '#nRepro', obs: '#nObs', boton: '#modalContenido .btn-primario' });
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500);
  // trabajo interno realizado
  const v4 = await p.evaluate(() => Object.values(registros).find(r => r.interno && r.estado === 'pendiente')?.id);
  if (v4) { await p.evaluate(id => abrirRegistro(id, 'ok'), v4); await p.waitForTimeout(300);
    try { await p.locator('#rCumplidos input.obj').first().check({ timeout: 1500 }); } catch (e) {}
    await p.fill('#rObs', 'Informe de cartera enviado'); await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(400); }
  await p.evaluate(() => pintarAgenda()); await p.waitForTimeout(300);
  await foto(p, 'vc_agenda_cerrada', { resumen: '#agResumen', tarjeta1: '#agLista .producto-card >> nth=0' });
  await foto(p, 'vc_agenda_cerrada_alto', {}, { completo: true });

  // ---- Visiplan (octubre)
  await p.clock.setFixedTime(new Date('2026-09-30T10:00:00-05:00'));
  await p.evaluate(() => abrirVisiplan()); await p.waitForTimeout(700);
  await p.evaluate(() => moverMesPlan(1)); await p.waitForTimeout(700);
  const filas = p.locator('#vpTabla tbody tr');
  console.log('filas vp', await filas.count());
  for (const [r, cols] of [[4, [1, 8]], [5, [2, 9]], [6, [0, 7]], [7, [3]], [8, [1, 15]], [9, [4]], [10, [2, 12]]]) {
    for (const c of cols) { try { await filas.nth(r).locator('.vp-x').nth(c).click({ timeout: 1000 }); } catch (e) { console.log('vp', r, c); } await p.waitForTimeout(100); }
  }
  await p.waitForTimeout(1500);
  await foto(p, 'vc_visiplan', { vends: '#vpVendedores', mes: '#vpMesTxt', periodo: '#vpPeriodo', buscar: '#vpBusca', kpis: '#vpKpis', tabla: '#vpTabla', excel: '.vp-excel' });
  // ---- Actividades y circulares
  await p.evaluate(() => abrirActividades()); await p.waitForTimeout(600);
  await foto(p, 'vc_circulares', { vistas: '.act-vistas', filtro: '#circFiltro', buscar: '#circBuscar', orden: '#circOrden', lista: '#actLista' });
  await p.evaluate(() => verActividades('tareas')); await p.waitForTimeout(500);
  await foto(p, 'vc_tareas', { mes: '#actMesTxt', progreso: '.progreso', nueva: '#actTareasCtrl .btn-nuevo' });
  await p.evaluate(() => abrirActividad()); await p.waitForTimeout(400);
  await foto(p, 'vc_actividad_form');
  await p.evaluate(() => cerrarModal());
  // ---- Maestra
  await p.evaluate(() => abrirMaestra()); await p.waitForTimeout(700);
  await foto(p, 'vc_maestra', { buscar: '#mcBusca', filtros: '#mcFiltrosMulti', grafica: '.mc-grafica', dims: '#mcDims', lista: '#mcLista' });
  await foto(p, 'vc_maestra_alto', {}, { completo: true });
  await p.evaluate(n => verCliente(n), cliente.n); await p.waitForTimeout(500);
  await foto(p, 'vc_historial', { cab: '#modalContenido h2', filtros: '#histMeses', resumen: '.hist-resumen', pendiente: '#modalContenido .historial .reporte >> nth=0', visita: '#modalContenido .historial .reporte >> nth=1' }, { alto: 1700 });
  await p.evaluate(() => cerrarModal());
  // ---- Leads
  await p.evaluate(() => crearLead()); await p.waitForTimeout(400);
  await p.fill('#lNombre', 'Centro Dermatológico Demo'); await p.selectOption('#lTipo', 'Cliente');
  await p.fill('#lCiudad', await ciudadValida(p, '#lCiudad')); await p.fill('#lPersona', 'Coordinadora de compras'); await p.fill('#lTel', '300 555 9876');
  await foto(p, 'vc_lead_form', { nombre: '#lNombre', tipo: '#lTipo', ciudad: '#lCiudad', clasif: '#lClasif', persona: '#lPersona', tel: '#lTel', boton: '#modalContenido .btn-primario' }, { alto: 1000 });
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(500);
  await p.evaluate(() => abrirProyectos()); await p.waitForTimeout(500);
  await foto(p, 'vc_leads');
  await p.evaluate(() => cerrarModal());
  // ---- Descargar informe
  await p.evaluate(() => abrirDescarga()); await p.waitForTimeout(500);
  await foto(p, 'vc_descarga');
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => irInicio()); await p.waitForTimeout(300);
  await foto(p, 'vc_inicio', {}, {});
  await ctx.close();

  // Copia de las visitas para otra vendedora (así el panel del jefe tiene equipo)
  const sur = CONT['Zona Sur'];
  let k = 0;
  for (const r of Object.values(JSON.parse(JSON.stringify(STORE)))) {
    if (r.clase !== 'visita') continue;
    const c = sur[(k++ * 7) % sur.length];
    STORE[r.id + 'y'] = { ...r, id: r.id + 'y', vendedor: 'ycaballero', contacto: r.interno ? r.contacto : c.n, estado: k % 3 === 0 ? 'no_visitado' : r.estado, motivo: k % 3 === 0 ? 'Cliente no estaba' : r.motivo };
  }

  // ===================== JEFE =====================
  ({ ctx, p } = await nuevoContexto(browser, { width: 390, height: 844 }, '2026-09-30T10:00:00-05:00'));
  await entrar(p, 'hreyes'); await p.waitForTimeout(800);
  await foto(p, 'vc_inicio_jefe', { panel: '#btnPanel' });
  await p.evaluate(() => abrirPanel()); await p.waitForTimeout(900);
  await foto(p, 'vc_panel', { mes: '#panMesTxt', filtros: '.filtros-panel', kpis: '#panKpis', dias: '#grafDias' });
  await p.setViewportSize({ width: 390, height: 2600 }); await p.waitForTimeout(500);
  await foto(p, 'vc_panel_largo', { tipos: '#grafTipos', objetivos: '#grafObjetivos', hoy: '#panHoy', tabla: '#panTabla', motivos: '#panMotivos', detalle: '#panDetalle' });
  await ctx.close();
  // Panel y Visiplan en computador
  ({ ctx, p } = await nuevoContexto(browser, { width: 1366, height: 800 }, '2026-09-30T10:00:00-05:00'));
  await entrar(p, 'hreyes'); await p.waitForTimeout(800);
  await p.evaluate(() => abrirPanel()); await p.waitForTimeout(900);
  await foto(p, 'pc_panel');
  await p.evaluate(() => abrirVisiplan()); await p.waitForTimeout(900);
  await p.evaluate(() => moverMesPlan(1)); await p.waitForTimeout(900);
  await foto(p, 'pc_visiplan');
  await p.evaluate(() => abrirAgenda()); await p.waitForTimeout(700);
  await foto(p, 'pc_agenda');
  await ctx.close();

  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  fs.writeFileSync(OUT + 'store.json', JSON.stringify(STORE));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
