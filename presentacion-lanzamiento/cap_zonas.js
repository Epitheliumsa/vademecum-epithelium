// Captura de la Maestra por zona (jefe) para la reestructuración de zonas
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
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO', timezoneId: 'America/Bogota' });
  await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, registros: [] }) }));
  const p = await ctx.newPage();
  await p.goto('http://localhost:8802/');
  await p.evaluate(() => localStorage.setItem('rc_sesion', JSON.stringify({ id: 'hreyes', clave: 'x' })));
  await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(() => { abrirMaestra(); maestra.dim = 'z'; pintarMaestra(); }); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('.mc-grafica').scrollIntoView({ block: 'start' }));
  await foto(p, 'vc_maestra_zonas', { zonas: '#mcZonas', grafica: '.mc-grafica', barras: '#mcBarras', dims: '#mcDims' }, { alto: 1000 });
  await p.evaluate(() => window.scrollTo(0, 0));
  await foto(p, 'vc_maestra_zonas_top', { zonas: '#mcZonas', dims: '#mcDims', barras: '#mcBarras' }, { alto: 1400 });
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); process.exit(1); });
