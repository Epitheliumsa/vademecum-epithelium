// Capturas del Vademécum a fondo (perfil comercial Zona Norte y perfil equipo)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const CJ = OUT + 'cajas.json';
const cajas = fs.existsSync(CJ) ? JSON.parse(fs.readFileSync(CJ)) : {};
const IDX = JSON.parse(fs.readFileSync('/tmp/vade_main/portafolios-index.json'));
const CONT = JSON.parse(fs.readFileSync('/home/user/ruta-comercial/contactos.json'));
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro', 'Maryi Castro',
  ...IDX.map(c => c.cliente), ...Object.values(CONT).flat().map(c => c.n)].filter(n => n && n.length > 3).sort((a, b) => b.length - a.length);

async function tapar(p, extra = []) {
  await p.evaluate(({ NOMBRES, extra }) => {
    if (!document.getElementById('tapar-css')) {
      const css = document.createElement('style'); css.id = 'tapar-css';
      css.textContent = '.tapado{filter:blur(4.5px);} ' + extra.map(s => s + '{filter:blur(4.5px);}').join(' ');
      document.head.appendChild(css);
    }
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(' + NOMBRES.map(esc).join('|') + ')', 'g');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n.parentElement && n.parentElement.closest('.tapado, script, style, datalist, option')) continue;
      re.lastIndex = 0; if (re.test(n.nodeValue)) nodos.push(n);
    }
    nodos.forEach(n => {
      const span = document.createElement('span');
      span.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(re, '<span class="tapado">$1</span>');
      n.replaceWith(...span.childNodes);
    });
  }, { NOMBRES, extra });
}
async function foto(p, nombre, sels = {}, { alto = 0, extra = [] } = {}) {
  const vp0 = p.viewportSize();
  if (alto) await p.setViewportSize({ width: vp0.width, height: alto });
  await p.waitForTimeout(450);
  await tapar(p, extra);
  await p.screenshot({ path: OUT + nombre + '.png' });
  const vp = p.viewportSize();
  cajas[nombre] = { w: vp.width, h: vp.height, items: {} };
  for (const [k, s] of Object.entries(sels)) {
    try { const b = await p.locator(s).first().boundingBox({ timeout: 1500 }); if (b) cajas[nombre].items[k] = [b.x, b.y, b.width, b.height]; else console.log('sin caja', nombre, k); }
    catch (e) { console.log('sin caja', nombre, k); }
  }
  if (alto) await p.setViewportSize(vp0);
  console.log('foto', nombre);
}
const sel = (t) => `#detailContent strong:text-is("${t}")`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERROR', e.message));
  await p.goto('http://localhost:8801/'); await p.waitForTimeout(800);
  await p.fill('#accessUser', 'L.Ramos'); await p.fill('#accessCode', 'LRamos');
  await p.click('#loginScreen button'); await p.waitForTimeout(1500);
  // ---- Vademécum Epithelium (productos)
  await p.evaluate(() => abrirProductos()); await p.waitForTimeout(500);
  await foto(p, 'v_prod', { nombre: '#searchName', comp: '#searchComponents', cat: '#filterCategory', forma: '#filterFormula', nuevo: '#btnNuevo', card: '#resultados .producto-card', volver: '#mainScreen .logout-btn' });
  await p.fill('#searchComponents', 'Niacinamida'); await p.evaluate(() => filtrar()); await p.waitForTimeout(300);
  const cats = await p.$$eval('#filterCategory option', os => os.map(o => o.value).filter(Boolean));
  const cat = cats.find(c => /Acne/i.test(c)) || cats[0];
  await p.selectOption('#filterCategory', cat); await p.evaluate(() => filtrar()); await p.waitForTimeout(300);
  let n = await p.locator('#resultados .producto-card').count();
  if (!n) { await p.selectOption('#filterCategory', ''); await p.evaluate(() => filtrar()); }
  await foto(p, 'v_prod_filtro', { comp: '#searchComponents', cat: '#filterCategory', card: '#resultados .producto-card' });
  await p.locator('#resultados .producto-card').first().click(); await p.waitForTimeout(500);
  await foto(p, 'v_detalle', { titulo: '#detailContent h2', comp: sel('Componentes'), esp: sel('Especificaciones'), ind: sel('Indicación'), dosis: sel('Dosis Recomendada'), ref: sel('Referencia Interna'), cerrar: '#modalDetail .close' }, { alto: 1800 });
  await p.evaluate(() => cerrarModal());
  // ---- Lo nuevo
  await p.evaluate(() => abrirLoNuevo()); await p.waitForTimeout(500);
  await foto(p, 'v_lonuevo', { aviso: '#resultados .aviso-nuevo', boton: '#btnNuevo', card: '#resultados .producto-card', badge: '#resultados .badge-nuevo' });
  await p.locator('#resultados .producto-card').first().click(); await p.waitForTimeout(500);
  await foto(p, 'v_lonuevo_detalle', { titulo: '#detailContent h2' }, { alto: 1200 });
  await p.evaluate(() => cerrarModal());
  // ---- Vademécum Cliente
  await p.evaluate(() => abrirListaClientes()); await p.waitForTimeout(500);
  await foto(p, 'v_clientes', { zona: '#clSubtitulo', buscar: '#clSearchName', card: '#clResultados .cliente-card' });
  await p.locator('#clResultados .cliente-card').nth(2).click(); await p.waitForTimeout(1200);
  await foto(p, 'v_portafolio', { titulo: '#portTitulo', volver: '#portBackBtn', nombre: '#pfSearchName', comp: '#pfSearchComponents', cat: '#pfFilterCategory', nuevo: '#pfBtnNuevo', card: '#pfResultados .producto-card', epi: '#pfResultados .nombre-epithelium' }, { extra: ['#portTitulo'] });
  // separador de nuevos Epithelium
  const tieneSep = await p.locator('#pfResultados .separador-nuevos').count();
  if (tieneSep) {
    await p.locator('#pfResultados .separador-nuevos').scrollIntoViewIfNeeded();
    await p.evaluate(() => { const s = document.querySelector('#pfResultados .separador-nuevos'); s.scrollIntoView({ block: 'start' }); window.scrollBy(0, -150); });
    await foto(p, 'v_portafolio_nuevos', { sep: '#pfResultados .separador-nuevos', badge: '#pfResultados .badge-nuevo' }, { extra: ['#portTitulo'] });
  } else console.log('sin separador de nuevos');
  await p.locator('#pfResultados .producto-card').first().click(); await p.waitForTimeout(500);
  await foto(p, 'v_portafolio_detalle', { titulo: '#detailContent h2', epi: '#detailContent .nombre-epithelium' }, { alto: 1200, extra: ['#portTitulo'] });
  await p.evaluate(() => cerrarModal());
  // ---- Materias primas
  await p.evaluate(() => abrirMateriasPrimas()); await p.waitForTimeout(500);
  await foto(p, 'v_mp', { nombre: '#mpSearchName', uso: '#mpSearchUso', cat: '#mpFilterEtiqueta', card: '#mpResultados .producto-card', chip: '#mpResultados .mp-chip', barra: '#mpResultados .mp-barra' });
  await p.fill('#mpSearchUso', 'acné'); await p.evaluate(() => filtrarMP()); await p.waitForTimeout(300);
  await foto(p, 'v_mp_filtro', { uso: '#mpSearchUso', card: '#mpResultados .producto-card' });
  await p.locator('#mpResultados .producto-card').first().click(); await p.waitForTimeout(500);
  await p.locator('#detailContent .mp-chip-btn').first().click(); await p.waitForTimeout(300);
  await foto(p, 'v_mp_detalle', { titulo: '#detailContent h2', chips: '#detailContent .mp-cats', desc: '#mpDescBox', ident: sel('Identificación Técnica'), uso: sel('Uso Terapéutico y Cosmético'), conc: sel('Concentración de Uso'), ref: sel('Referencia Interna') }, { alto: 1800 });
  await p.evaluate(() => cerrarModal());
  // aviso de versión
  await p.evaluate(() => { irInicio(); document.getElementById('avisoVersion').classList.add('visible'); });
  await foto(p, 'v_version', { aviso: '#avisoVersion', actualizar: '#avisoVersion button' });
  await ctx.close();
  // ---- Perfil equipo (ve todas las zonas)
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO' });
  const q = await c2.newPage();
  await q.goto('http://localhost:8801/'); await q.waitForTimeout(800);
  await q.fill('#accessUser', 'H.Reyes'); await q.fill('#accessCode', 'HReyes');
  await q.click('#loginScreen button'); await q.waitForTimeout(1500);
  await q.evaluate(() => abrirListaClientes()); await q.waitForTimeout(500);
  await foto(q, 'v_clientes_equipo', { zona: '#clZona', buscar: '#clSearchName', chipZona: '#clResultados .cliente-zona' });
  await c2.close();
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
