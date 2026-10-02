// Capturas de los ajustes del 1 de octubre en Visita Comercial (datos de ejemplo, servidor falso en memoria)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const CJ = OUT + 'cajas.json';
const cajas = fs.existsSync(CJ) ? JSON.parse(fs.readFileSync(CJ)) : {};
const CONT = JSON.parse(fs.readFileSync('/home/user/ruta-comercial/contactos.json'));
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro', 'Maryi Castro',
  ...Object.values(CONT).flat().map(c => c.n), ...Object.values(CONT).flat().map(c => c.n.split(',')[0])].filter(n => n && n.length > 3).sort((a, b) => b.length - a.length);
global.window = {}; eval(fs.readFileSync('/home/user/ruta-comercial/portafolios.js', 'utf8'));
NOMBRES.push(...Object.keys(window.PORTAFOLIOS.portafolios)); NOMBRES.sort((a, b) => b.length - a.length);
async function tapar(p) {
  await p.evaluate((NOMBRES) => {
    if (!document.getElementById('tapar-css')) { const css = document.createElement('style'); css.id = 'tapar-css'; css.textContent = '.tapado{filter:blur(4.5px);} input.tapado{filter:blur(4px);} .toast{display:none!important}'; document.head.appendChild(css); }
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(' + [...new Set(NOMBRES)].map(esc).join('|') + ')', 'g');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodos = [];
    while (walker.nextNode()) { const n = walker.currentNode; if (n.parentElement && n.parentElement.closest('.tapado, script, style, datalist, option')) continue; re.lastIndex = 0; if (re.test(n.nodeValue)) nodos.push(n); }
    nodos.forEach(n => { const span = document.createElement('span'); span.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(re, '<span class="tapado">$1</span>'); n.replaceWith(...span.childNodes); });
    document.querySelectorAll('input').forEach(i => { re.lastIndex = 0; if (i.value && re.test(i.value)) i.classList.add('tapado'); });
  }, NOMBRES);
}
async function foto(p, nombre, sels = {}, { alto = 0 } = {}) {
  const vp0 = p.viewportSize();
  if (alto) await p.setViewportSize({ width: vp0.width, height: alto });
  await p.waitForTimeout(450); await tapar(p);
  await p.screenshot({ path: OUT + nombre + '.png' });
  const vp = p.viewportSize(); cajas[nombre] = { w: vp.width, h: vp.height, items: {} };
  for (const [k, s] of Object.entries(sels)) { try { const b = await p.locator(s).first().boundingBox({ timeout: 1500 }); if (b) cajas[nombre].items[k] = [b.x, b.y, b.width, b.height]; else console.log('sin caja', nombre, k); } catch (e) { console.log('sin caja', nombre, k); } }
  if (alto) await p.setViewportSize(vp0);
  console.log('foto', nombre);
}

const STORE = {};
const norte = CONT['Zona Norte'];
const medicos = norte.filter(c => /medico/i.test(c.e) && !/cliente/i.test(c.e));
async function contexto(browser, hora, alto = 844) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: alto }, deviceScaleFactor: 3, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route(/script\.google\.com/, async r => {
    let b = {}; try { b = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (b.accion === 'guardar') (b.registros || []).forEach(x => { STORE[x.id] = x; });
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
  await cerrarDialogo(p);
}
async function cerrarDialogo(p) {
  if (await p.locator('#dialogo.visible').count()) { await p.locator('#dialogo.visible button').last().click(); await p.waitForTimeout(300); }
}
const dlg = { dialogo: '#dialogo.visible .dialogo-caja' };
(async () => {
  const browser = await chromium.launch();
  let { ctx, p } = await contexto(browser, '2026-10-02T07:20:00-05:00');
  await entrar(p, 'lramos');
  // ---- datos de ejemplo: 3 visitas hoy + trabajo administrativo, una reportada ayer, una vieja y una futura
  const ids = await p.evaluate(({ m }) => {
    const obj = t => { const o = (TIPOS_VISITA[t] || [])[0]; return o ? [typeof o === 'string' ? o : (o.n || o.nombre || o.objetivo)] : []; };
    const base = (c, fecha, extra = {}) => { const t = tipoDeCliente(c); return { id: nuevoId(), clase: 'visita', vendedor: 'lramos', estado: 'pendiente', fecha,
      contacto: c.n, tipoContacto: c.e, ciudad: c.c, hora: '', objetivo: 'Presentar productos nuevos y dejar muestras', modalidad: 'Presencial',
      tipoVisita: t, tiposVisita: [], objetivos: obj(t), subobjetivos: {}, programada: true, creado: '2026-10-01T15:00:00-05:00', creadoPor: 'lramos', ...extra }; };
    const r = {};
    [r.a, r.b, r.c] = [base(m[0], '2026-10-02', { ordenPlan: 1, hora: '09:00' }), base(m[1], '2026-10-02', { ordenPlan: 2 }), base(m[2], '2026-10-02', { ordenPlan: 4 })];
    r.adm = { id: nuevoId(), clase: 'visita', vendedor: 'lramos', estado: 'pendiente', fecha: '2026-10-02', interno: true, contacto: 'Trabajo Administrativo Oficina',
      tipoContacto: '', ciudad: '', objetivo: 'Informe de cartera y cotizaciones', diaCompleto: false, horaInicio: '14:00', horaFin: '17:00', modalidad: '',
      tipoVisita: '', tiposVisita: [], objetivos: [], subobjetivos: {}, programada: true, ordenPlan: 3, creado: '2026-10-01T15:00:00-05:00', creadoPor: 'lramos' };
    r.ayer = base(m[3], '2026-10-01', { ordenPlan: 1, estado: 'visitado', registrada: '2026-10-01T10:30:00-05:00', observaciones: 'Se presentó el portafolio y quedó pedido para la próxima semana', objetivosCumplidos: obj(tipoDeCliente(m[3])) });
    r.vieja = base(m[4], '2026-09-29', { ordenPlan: 1, estado: 'no_visitado', motivo: 'Cliente no estaba', observaciones: 'La doctora estaba en cirugía; se reprograma', registrada: '2026-09-29T16:00:00-05:00' });
    r.fut = base(m[5], '2026-10-05', { ordenPlan: 1 });
    Object.values(r).forEach(guardarRegistro);
    agenda.fecha = '2026-10-02'; pintarAgenda();
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.id]));
  }, { m: medicos.slice(0, 6) });
  await p.evaluate(() => abrirAgenda()); await p.waitForTimeout(800);
  await foto(p, 'aj_orden', { mover: '.mover-orden', subir: '.mover-orden button >> nth=0', bajar: '.mover-orden button >> nth=1', insignia: '.ordenes .ord.prog', admin: '.producto-card:has-text("Trabajo Administrativo")' }, { alto: 1700 });
  // acompañamiento
  const bAc = p.locator('button:has-text("acompañamiento")').first();
  if (await bAc.count()) { await foto(p, 'aj_acomp_boton', { boton: 'button:has-text("acompañamiento")' }, { alto: 1700 }); await bAc.click(); await p.waitForTimeout(400);
    await p.locator('#modalContenido .checks input').first().check();
    await foto(p, 'aj_acomp_form', { jefes: '#acJefes', comp: '#acComp', enviar: '#modalContenido .btn-primario' }); await p.evaluate(() => cerrarModal()); }
  else console.log('sin botón de acompañamiento');
  // no visitado con observaciones obligatorias
  await p.evaluate(id => abrirRegistro(id, 'no'), ids.b); await p.waitForTimeout(500);
  await foto(p, 'aj_novisitado', { obs: '#nObs', cuenta: '#nObsCuenta' }, { alto: 1100 }); await p.evaluate(() => cerrarModal());
  // programar: trabajo administrativo con horario y clasificación al buscar cliente
  await p.evaluate(() => abrirProgramar()); await p.waitForTimeout(500); await cerrarDialogo(p);
  await p.selectOption('#fTipo', 'Trabajo Administrativo Fuera de la Oficina'); await p.waitForTimeout(300);
  if (await p.locator('#fDiaCompleto').isChecked()) await p.locator('#fDiaCompleto').uncheck();
  await p.waitForTimeout(200);
  await foto(p, 'aj_admin', { que: '#fTipo', dia: '#fDiaCompleto', horas: '#cajaHorasPermiso' }, { alto: 1000 });
  await p.selectOption('#fTipo', 'Visita Médica'); await p.waitForTimeout(300);
  await p.fill('#fContacto', medicos[7].n); await p.locator('#fContacto').dispatchEvent('input'); await p.locator('#fContacto').dispatchEvent('change'); await p.waitForTimeout(400);
  await foto(p, 'aj_clasif', { contacto: '#fContacto', clasif: '#fClasif' }, { alto: 1000 });
  await p.evaluate(() => cerrarModal());
  // domingo
  await p.evaluate(() => { agenda.fecha = '2026-10-04'; pintarAgenda(); }); await p.waitForTimeout(300);
  p.evaluate(() => abrirProgramar()); await p.waitForTimeout(700);
  await foto(p, 'aj_domingo', dlg); await cerrarDialogo(p); await p.evaluate(() => cerrarModal());
  // visita futura: eliminar y huella
  await p.evaluate(() => { agenda.fecha = '2026-10-05'; pintarAgenda(); }); await p.waitForTimeout(300);
  p.evaluate(id => eliminarFutura(id), ids.fut); await p.waitForTimeout(600);
  await foto(p, 'aj_eliminar_dlg', dlg);
  await p.locator('#dialogo.visible button', { hasText: 'Sí, eliminar' }).click(); await p.waitForTimeout(600);
  await foto(p, 'aj_huella', { huella: '.huella-eliminada' });
  // corrección dentro del plazo (ayer) y fuera de plazo (29 sep)
  await p.evaluate(() => { agenda.fecha = '2026-10-01'; pintarAgenda(); }); await p.waitForTimeout(400);
  await foto(p, 'aj_corregir', { corregir: '.corregir', tarjeta: '.producto-card:has(.corregir)' }, { alto: 1100 });
  await p.evaluate(() => { agenda.fecha = '2026-09-29'; pintarAgenda(); }); await p.waitForTimeout(400);
  await foto(p, 'aj_bloqueada', { nota: '.nota-cierre', pedir: 'button:has-text("Solicitar corrección")' }, { alto: 1100 });
  await p.locator('button:has-text("Solicitar corrección")').first().click(); await p.waitForTimeout(400);
  await p.fill('#cMotivo', 'La marqué como no visitada y sí la visité'); await p.locator('#cMotivo').dispatchEvent('input');
  await foto(p, 'aj_corr_form', { ayuda: '#modalContenido .ayuda', motivo: '#cMotivo', enviar: '#modalContenido .btn-primario' });
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(800);
  // leads y maestra
  await p.evaluate(() => abrirProyectos()); await p.waitForTimeout(500);
  await foto(p, 'aj_leads', { crear: '.leads-cab .btn-primario', cerrar: '#modal .close' });
  await p.evaluate(() => cerrarModal());
  await p.evaluate(() => abrirMaestra()); await p.waitForTimeout(600);
  await foto(p, 'aj_maestra', { periodo: '[onclick^="abrirPeriodoMaestra"]' });
  await p.evaluate(() => abrirPeriodoMaestra()); await p.waitForTimeout(500);
  await foto(p, 'aj_maestra_periodo', { modal: '#modalContenido' });
  await ctx.close();
  // ---- Gerente General: autoriza la corrección
  ({ ctx, p } = await contexto(browser, '2026-10-02T09:10:00-05:00'));
  await entrar(p, 'hreyes');
  await foto(p, 'aj_inicio_jefe', { sol: '#btnSolicitudes' }, { alto: 1300 });
  await p.evaluate(() => abrirSolicitudes()); await p.waitForTimeout(600);
  await foto(p, 'aj_corr_aprobar', { tarjeta: '#modalContenido .solicitud', autorizar: '#modalContenido button:has-text("Autorizar")', rechazar: '#modalContenido button:has-text("Rechazar")' }, { alto: 1100 });
  await ctx.close();
  // ---- Cumpleaños
  ({ ctx, p } = await contexto(browser, '2027-02-16T07:10:00-05:00'));
  await p.goto('http://localhost:8802/');
  await p.evaluate(() => localStorage.setItem('rc_sesion', JSON.stringify({ id: 'lramos', clave: 'x' })));
  await p.reload(); await p.waitForTimeout(1800);
  await foto(p, 'aj_cumple_saludo', dlg);
  await cerrarDialogo(p);
  await p.evaluate(() => { abrirAgenda(); }); await p.waitForTimeout(600);
  await foto(p, 'aj_cumple_agenda', { semana: '#agSemana' });
  await p.evaluate(() => abrirCalendario()); await p.waitForTimeout(600);
  await foto(p, 'aj_cumple_cal', { modal: '#modalContenido' }, { alto: 1000 });
  await ctx.close();
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
