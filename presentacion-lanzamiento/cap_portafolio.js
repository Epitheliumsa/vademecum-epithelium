// Capturas del Portafolio del cliente en la Maestra (Visita Comercial)
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const CJ = OUT + 'cajas.json';
const cajas = fs.existsSync(CJ) ? JSON.parse(fs.readFileSync(CJ)) : {};
const CONT = JSON.parse(fs.readFileSync('/home/user/ruta-comercial/contactos.json'));
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro',
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
  p.on('pageerror', e => console.log('ERROR pagina:', e.message));
  await p.goto('http://localhost:8802/');
  await p.evaluate(() => localStorage.setItem('rc_sesion', JSON.stringify({ id: 'hreyes', clave: 'x' })));
  await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(() => abrirMaestra()); await p.waitForTimeout(700);
  await p.fill('#mcBusca', BUSCA); await p.locator('#mcBusca').dispatchEvent('input'); await p.waitForTimeout(500);
  await p.evaluate(() => { const f = document.querySelector('.mc-portafolio'); f.scrollIntoView({ block: 'center' }); });
  await foto(p, 'vc_maestra_portafolio', { enlace: '.mc-portafolio', fila: '.mc-fila:has(.mc-portafolio)' });
  await p.locator('.mc-portafolio').first().click(); await p.waitForTimeout(500);
  await foto(p, 'vc_portafolio', { titulo: '#modalContenido h2', sub: '#modalContenido .sub', buscar: '#modalContenido .sel-busca', prod: '.pf-prod summary' });
  await p.locator('.pf-prod summary').first().click(); await p.waitForTimeout(300);
  await foto(p, 'vc_portafolio_ficha', { codigo: '.pf-prod[open] summary b', comp: '.pf-prod[open] .pf-ficha strong >> nth=0', ind: '.pf-prod[open] .pf-ficha strong >> nth=1', dosis: '.pf-prod[open] .pf-ficha strong >> nth=2' }, { alto: 1300 });
  fs.writeFileSync(CJ, JSON.stringify(cajas, null, 1));
  await browser.close();
})().catch(e => { console.error('FALLO', e.message); process.exit(1); });
