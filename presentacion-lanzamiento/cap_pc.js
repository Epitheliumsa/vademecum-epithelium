// Capturas de Visita Comercial con datos de ejemplo. El servidor de Google se reemplaza por uno falso en memoria.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const CJ = OUT + 'cajas.json';
const cajas = fs.existsSync(CJ) ? JSON.parse(fs.readFileSync(CJ)) : {};
const CONT = JSON.parse(fs.readFileSync('/home/user/ruta-comercial/contactos.json'));
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro', 'Maryi Castro',
  ...Object.values(CONT).flat().map(c => c.n)].filter(n => n && n.length > 3).sort((a, b) => b.length - a.length);
const STORE = JSON.parse(fs.readFileSync(OUT + 'store.json'));

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
  if (nuevo) { await p.fill('#pCiudad', 'Bogotá'); await p.fill('#pTel', '300 555 1234'); await p.fill('#pPersona', 'Asistente'); }
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

const idDe = (p, contacto) => p.evaluate(c => Object.values(registros).find(r => r.clase === 'visita' && r.contacto === c && r.estado === 'pendiente')?.id, contacto);

(async () => {
  const browser = await chromium.launch();
  let { ctx, p } = await nuevoContexto(browser, { width: 1366, height: 800 }, '2026-09-30T10:00:00-05:00');
  await entrar(p, 'hreyes'); await p.waitForTimeout(800);
  await p.evaluate(() => abrirPanel()); await p.waitForTimeout(900);
  await foto(p, 'pc_panel', { mes: '#panMesTxt', filtros: '.filtros-panel', kpis: '#panKpis', dias: '#grafDias', tipos: '#grafTipos', objetivos: '#grafObjetivos' });
  await p.evaluate(() => abrirVisiplan()); await p.waitForTimeout(900);
  await p.evaluate(() => moverMesPlan(1)); await p.waitForTimeout(900);
  await foto(p, 'pc_visiplan', { vends: '#vpVendedores', mes: '.vp-banner .nav-fecha', periodo: '#vpPeriodo', filtros: '.vp-filtros', conv: '.vp-conv', excel: '.vp-excel', kpis: '#vpKpis', tabla: '#vpTabla thead', celda: '#vpTabla tbody .vp-x.on' });
  await p.evaluate(() => abrirAgenda()); await p.waitForTimeout(700);
  console.log(await p.evaluate(() => [...document.querySelectorAll('#agAnillo > *, #agAnillo > * > *')].map(e => e.tagName + '.' + e.className).join(' | ')));
  console.log(await p.evaluate(() => document.getElementById('agResumen').innerHTML.slice(0, 300)));
  await foto(p, 'pc_agenda', { vends: '#agVendedores', nav: '#agendaScreen .nav-fecha', semana: '#agSemana', botones: '#agendaScreen .fila-botones', anillo: '#agAnillo', lista: '#agLista .producto-card',
    dia: '#agAnillo .anillo-dia >> nth=0', semanaA: '#agAnillo .anillo-dia >> nth=1', mesA: '#agAnillo .anillo-dia >> nth=2', resumen: '#agResumen .chip >> nth=0' });
  await ctx.close();
  ({ ctx, p } = await nuevoContexto(browser, { width: 390, height: 844 }, '2026-09-30T10:00:00-05:00'));
  await entrar(p, 'lramos'); await p.waitForTimeout(800);
  await p.evaluate(() => abrirAgenda()); await p.evaluate(() => elegirFecha('2026-09-29')); await p.waitForTimeout(400);
  await p.evaluate(() => abrirCalendario()); await p.waitForTimeout(500);
  await foto(p, 'vc_calendario', { titulo: '#modalContenido h2, .cal-mes, #modalContenido .nav-fecha', dia: '#modalContenido .hoy, #modalContenido [class*=sel]', festivo: '#modalContenido [class*=fest], #modalContenido [class*=dom]' });
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => abrirActividades()); await p.evaluate(() => verActividades('tareas')); await p.evaluate(() => abrirActividad()); await p.waitForTimeout(400);
  await foto(p, 'vc_actividad_form', { act: '#aTitulo', tipo: '#modalContenido select', fecha: '#aFecha', meta: '#modalContenido textarea', boton: '#modalContenido .btn-primario' });
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => abrirMaestra()); await p.waitForTimeout(500);
  await p.evaluate(() => abrirProyectos()); await p.waitForTimeout(500);
  await foto(p, 'vc_leads', { tarjeta: '#modalContenido .solicitud.proyecto', chip: '#modalContenido .solicitud .chip', seguimiento: '#modalContenido .solicitud .sub', programar: '#modalContenido .btn-programar-lead', solicitud: '#modalContenido .solicitud .btn-secundario' });
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => abrirDescarga()); await p.waitForTimeout(500);
  await foto(p, 'vc_descarga', { mes: '#modalContenido input', boton: '#modalContenido .btn-primario' });
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => abrirMaestra()); await p.waitForTimeout(500);
  await foto(p, 'vc_maestra', { buscar: '#mcBusca', filtros: '.mc-filtros', resumen: '#mcResumen', grafica: '.mc-grafica-cab', dims: '#mcDims', barras: '#mcBarras' });
  await p.evaluate(() => { abrirActividades(); verActividades('circulares'); }); await p.waitForTimeout(500);
  await foto(p, 'vc_circulares', { vistas: '.act-vistas', filtro: '#circFiltro', buscar: '#circBuscar', orden: '#circOrden', multis: '#circMultis', tarjeta: '#actLista > *:first-child' });
  await ctx.close();
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
