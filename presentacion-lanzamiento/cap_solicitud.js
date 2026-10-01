// Capturas de Leads y Solicitudes de creación (vendedor -> Coordinadora Comercial -> Gerencia)
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
const BUSCA = process.argv[2] || 'Carolina Palacio';
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
const FORMATO_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial;margin:0;background:#fff;font-size:11px}
 h3{background:#006b4f;color:#fff;margin:0;padding:8px;font-size:12px} table{border-collapse:collapse;width:100%} td{border:1px solid #bbb;padding:5px}
 td.k{background:#eef5f2;font-weight:bold;width:42%}</style></head><body><h3>FTO-CME-002-1 · Formato de vinculación de clientes</h3><table>
 <tr><td class="k">Razón social</td><td>Centro Dermatológico Demo S.A.S.</td></tr><tr><td class="k">NIT</td><td>900.000.000-0</td></tr>
 <tr><td class="k">Clasificación</td><td>20</td></tr><tr><td class="k">Ciudad</td><td>Bogotá</td></tr><tr><td class="k">Contacto</td><td>Coordinadora de compras</td></tr>
 <tr><td class="k">Plazo solicitado</td><td>30 días</td></tr><tr><td class="k">Coordinador Comercial</td><td></td></tr><tr><td class="k">Gerencia</td><td></td></tr></table></body></html>`;
async function contexto(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route(/script\.google\.com/, async r => {
    let b = {}; try { b = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
    if (b.accion === 'guardar') (b.registros || []).forEach(x => { STORE[x.id] = x; });
    const extra = b.accion === 'subirArchivo' ? { url: 'https://drive.google.com/file/d/FORMATO1234567890/view', id: 'FORMATO1234567890' }
      : b.accion === 'firmarFormato' ? { hojaId: 'HOJA1', pdf: b.pdf ? 'https://drive.google.com/file/d/PDF12345678901/view' : '' } : {};
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, registros: Object.values(STORE), ...extra }) });
  });
  await ctx.route(/drive\.google\.com/, r => r.fulfill({ status: 200, contentType: 'text/html', body: FORMATO_HTML }));
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-10-01T09:05:00-05:00') });
  p.on('pageerror', e => console.log('ERROR pagina:', e.message));
  return { ctx, p };
}
async function entrar(p, id) {
  await p.goto('http://localhost:8802/');
  await p.evaluate(id => localStorage.setItem('rc_sesion', JSON.stringify({ id, clave: 'x' })), id);
  await p.reload(); await p.waitForTimeout(1500);
}
async function aceptar(p, texto) {
  await p.locator('#dialogo.visible button', { hasText: texto }).click(); await p.waitForTimeout(1200);
}
(async () => {
  const browser = await chromium.launch();
  // ---- Vendedora: crea la Lead, la ve con filtros y envía la solicitud de creación
  let { ctx, p } = await contexto(browser);
  await entrar(p, 'lramos');
  await p.evaluate(() => crearLead()); await p.waitForTimeout(400);
  await p.fill('#lNombre', 'Centro Dermatologico Demo'); await p.selectOption('#lTipo', 'Cliente');
  await p.fill('#lCiudad', await p.evaluate(() => CIUDADES.find(c => /^Bogot/i.test(c)))); await p.fill('#lPersona', 'Coordinadora de compras'); await p.fill('#lTel', '300 555 9876');
  await p.fill('#lDir', 'Calle 100 # 15-20');
  await p.click('#modalContenido .btn-primario'); await p.waitForTimeout(800);
  await p.evaluate(() => abrirProyectos()); await p.waitForTimeout(500);
  await foto(p, 'vc_leads2', { buscar: '#lBusca', estado: '.leads-filtros select >> nth=0', tipo: '.leads-filtros select >> nth=1', tarjeta: '.solicitud.proyecto', programar: '.btn-programar-lead', perdida: '.solicitud.proyecto .btn-peligro', solicitud: '.solicitud.proyecto button:has-text("Solicitud de creación")', crear: '.leads-cab .btn-primario' });
  await p.locator('.solicitud.proyecto button:has-text("Solicitud de creación")').first().click(); await p.waitForTimeout(500);
  await p.selectOption('#sClasif', '20');
  await p.setInputFiles('#sFormato', { name: 'Formato vinculacion Centro Dermatologico Demo.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from('demo') });
  await p.fill('#sNota', 'Plazo de 30 días acordado');
  await foto(p, 'vc_sol_form', { clasif: '#sClasif', quien: '#sQuien', descargar: '.caja-formato a', formato: '#sFormato', enviar: '#sEnviar' }, { alto: 1250 });
  await p.click('#sEnviar'); await p.waitForTimeout(1500);
  await ctx.close();
  // ---- Coordinadora Comercial: bandeja, ve el formato y aprueba
  ({ ctx, p } = await contexto(browser));
  await entrar(p, 'jherrera');
  await foto(p, 'vc_sol_inicio', { boton: '#btnCreacion', leads: '.home-btn-proy' }, { alto: 1200 });
  await p.evaluate(() => abrirProyectos('solicitud')); await p.waitForTimeout(800);
  await foto(p, 'vc_sol_bandeja', { tarjeta: '.solicitud.proyecto', formato: '.ver-formato', firmas: '.firmas', rechazar: '.solicitud .btn-peligro', aprobar: '.solicitud .btn-primario:has-text("Aprobar")' }, { alto: 1220 });
  await p.locator('.solicitud .btn-primario:has-text("Aprobar")').click(); await p.waitForTimeout(400);
  await foto(p, 'vc_sol_dialogo', { dialogo: '#dialogo.visible' });
  await aceptar(p, 'Sí, aprobar');
  await p.evaluate(() => abrirProyectos('solicitud')); await p.waitForTimeout(500);
  await foto(p, 'vc_sol_firmada', { firmas: '.firmas' }, { alto: 1150 });
  await ctx.close();
  // ---- Gerencia: aprueba; con todas las firmas se genera el PDF
  ({ ctx, p } = await contexto(browser));
  await entrar(p, 'hreyes');
  await p.evaluate(() => abrirProyectos('solicitud')); await p.waitForTimeout(800);
  await p.locator('.solicitud .btn-primario:has-text("Aprobar")').click(); await p.waitForTimeout(400);
  await aceptar(p, 'Sí, aprobar');
  await ctx.close();
  // ---- Vendedora: le llega el PDF aprobado
  ({ ctx, p } = await contexto(browser));
  await entrar(p, 'lramos');
  await p.evaluate(() => abrirProyectos()); await p.waitForTimeout(600);
  await foto(p, 'vc_sol_pdf', { tarjeta: '.solicitud.proyecto', pdf: '.formato-final', firmas: '.firmas', transicion: '.nota-sol.transicion' }, { alto: 1000 });
  await ctx.close();
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
