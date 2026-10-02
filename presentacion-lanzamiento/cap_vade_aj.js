// Capturas de los ajustes del Vademécum (filtro de Etiqueta y uso sin internet)
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
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO', serviceWorkers: 'allow' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERROR', e.message));
  await p.goto('http://localhost:8801/'); await p.waitForTimeout(1500);
  const U = require('fs').readFileSync('/tmp/vade_main/app.js', 'utf8').match(/usuario: 'L\.Ramos',\s*clave: '([^']+)'/)[1];
  await p.fill('#accessUser', 'L.Ramos'); await p.fill('#accessCode', U);
  await p.click('#loginScreen button'); await p.waitForTimeout(1800);
  await p.evaluate(() => abrirProductos()); await p.waitForTimeout(500);
  await p.selectOption('#filterEtiqueta', { label: 'Foco' }).catch(async () => { const o = await p.$$eval('#filterEtiqueta option', os => os.map(o => o.value)); console.log('opciones', o); await p.selectOption('#filterEtiqueta', o[2]); });
  await p.evaluate(() => filtrar()); await p.waitForTimeout(400);
  await foto(p, 'aj_v_etiqueta', { etiqueta: '#filterEtiqueta', cat: '#filterCategory', card: '#resultados .producto-card' });
  await p.locator('#resultados .producto-card').first().click(); await p.waitForTimeout(500);
  await p.evaluate(() => { const m = document.querySelector('#modalDetail .modal-content') || document.querySelector('#detailContent').parentElement; m.scrollTop = m.scrollHeight; });
  await foto(p, 'aj_v_detalle', { etq: sel('Etiqueta'), ref: sel('Referencia Interna') });
  await p.evaluate(() => cerrarModal());
  // sin internet: la app ya quedó guardada; se apaga la red y se vuelve a abrir
  await p.reload(); await p.waitForTimeout(2500);
  await ctx.setOffline(true);
  await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(() => typeof abrirProductos === 'function' && abrirProductos()).catch(() => {}); await p.waitForTimeout(600);
  await foto(p, 'aj_v_offline', { card: '#resultados .producto-card' });
  await p.evaluate(() => typeof abrirMateriasPrimas === 'function' && abrirMateriasPrimas()).catch(() => {}); await p.waitForTimeout(600);
  await foto(p, 'aj_v_offline_mp', { card: '#mpResultados .producto-card' });
  await ctx.setOffline(false);
  await ctx.close();
  // médico: no ve la etiqueta
  const c2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO' });
  const q = await c2.newPage();
  await q.goto('http://localhost:8801/'); await q.waitForTimeout(1200);
  await q.fill('#accessCode', 'EPITHE-001'); await q.click('#loginScreen button'); await q.waitForTimeout(1800);
  await q.evaluate(() => abrirProductos()); await q.waitForTimeout(500);
  await foto(q, 'aj_v_medico_lista', { cat: '#filterCategory' });
  await q.locator('#resultados .producto-card').first().click(); await q.waitForTimeout(500);
  await q.evaluate(() => { const m = document.querySelector('#modalDetail .modal-content') || document.querySelector('#detailContent').parentElement; m.scrollTop = m.scrollHeight; });
  await foto(q, 'aj_v_medico', { ref: sel('Referencia Interna') });
  await c2.close();
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1)); process.exit(1); });
