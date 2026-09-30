// Capturas para el primer bloque de la presentación (ingreso, inicio, aviso de versión).
// Guarda cada imagen en cap/ y las cajas de los elementos a referenciar en cap/cajas.json (px CSS).
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
fs.mkdirSync(OUT, { recursive: true });
const cajas = fs.existsSync(OUT + 'cajas.json') ? JSON.parse(fs.readFileSync(OUT + 'cajas.json')) : {};

// Nombres reales que se tapan (vendedores y jefes)
const NOMBRES = ['Lizeth Ramos', 'Yunelis Caballero', 'Jennifer Herrera', 'Hernán Reyes', 'M. Castro'];

async function tapar(p, extraSel = []) {
  await p.evaluate(({ NOMBRES, extraSel }) => {
    const css = document.getElementById('tapar-css') || Object.assign(document.createElement('style'), { id: 'tapar-css' });
    css.textContent = `.tapado{filter:blur(5px);} ${extraSel.map(s => s + '{filter:blur(5px);}').join('')}`;
    document.head.appendChild(css);
    const re = new RegExp('(' + NOMBRES.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (walker.nextNode()) if (re.test(walker.currentNode.nodeValue)) nodos.push(walker.currentNode);
    nodos.forEach(n => {
      const span = document.createElement('span');
      span.innerHTML = n.nodeValue.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(re, '<span class="tapado">$1</span>');
      n.replaceWith(...span.childNodes);
    });
  }, { NOMBRES, extraSel });
}

async function foto(p, nombre, sels, opts = {}) {
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + nombre + '.png', ...opts });
  const vp = p.viewportSize();
  cajas[nombre] = { w: vp.width, h: opts.fullPage ? await p.evaluate(() => document.documentElement.scrollHeight) : vp.height, items: {} };
  for (const [k, s] of Object.entries(sels)) {
    const b = await p.locator(s).first().boundingBox();
    if (b) cajas[nombre].items[k] = [b.x, b.y, b.width, b.height];
    else console.log('sin caja', nombre, k, s);
  }
}

(async () => {
  const browser = await chromium.launch();
  const mk = async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'es-CO', timezoneId: 'America/Bogota' });
    await ctx.route(/script\.google\.com/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, registros: [] }) }));
    return ctx;
  };

  // ---------- RUTA COMERCIAL ----------
  let ctx = await mk();
  let p = await ctx.newPage();
  await p.goto('http://localhost:8802/'); await p.waitForTimeout(800);
  await foto(p, 'r_login', { usuario: '#accessUser', clave: '#accessCode', acceder: '#loginScreen button' });
  // comercial
  await p.evaluate(() => localStorage.setItem('rc_sesion', JSON.stringify({ id: 'lramos', clave: 'x' })));
  await p.reload(); await p.waitForTimeout(1500);
  await tapar(p);
  await foto(p, 'r_home', {
    saludo: '#homeIntro', plan: '.home-btn-plan', visiplan: '.home-btn-visiplan', act: '.home-btn-act',
    maestra: '.home-btn-maestra', vade: '.home-btn-vade', proy: '.home-btn-proy', desc: '.home-btn-desc', salir: '#homeScreen .logout-btn', sync: '#estadoSync', version: '#homeScreen .version-app'
  }, { fullPage: true });
  // versión alta del inicio (para mostrar los módulos de abajo y el estado de sincronización)
  await p.setViewportSize({ width: 390, height: 1060 }); await p.waitForTimeout(400);
  await foto(p, 'r_home_alto', { desc: '.home-btn-desc', proy: '.home-btn-proy', sync: '#estadoSync', version: '#homeScreen .version-app', vade: '.home-btn-vade' });
  await p.setViewportSize({ width: 390, height: 844 });
  // aviso de versión nueva
  await p.evaluate(() => { document.getElementById('avisoVersion').classList.add('visible'); });
  await foto(p, 'r_version', { aviso: '#avisoVersion', actualizar: '#avisoVersion button' });
  await ctx.close();
  // jefe (panel visible)
  ctx = await mk(); p = await ctx.newPage();
  await p.goto('http://localhost:8802/');
  await p.evaluate(() => localStorage.setItem('rc_sesion', JSON.stringify({ id: 'hreyes', clave: 'x' })));
  await p.reload(); await p.waitForTimeout(1500);
  await tapar(p);
  await foto(p, 'r_home_jefe', { saludo: '#homeIntro', panel: '#btnPanel' }, { fullPage: true });
  await ctx.close();

  // ---------- VADEMÉCUM ----------
  ctx = await mk(); p = await ctx.newPage();
  await p.goto('http://localhost:8801/'); await p.waitForTimeout(800);
  await foto(p, 'v_login', { usuario: '#accessUser', clave: '#accessCode', acceder: '#loginScreen button' });
  await p.fill('#accessUser', 'L.Ramos'); await p.fill('#accessCode', 'LRamos');
  await p.click('#loginScreen button'); await p.waitForTimeout(1500);
  await tapar(p);
  const btns = await p.$$eval('#homeScreen .home-btn', bs => bs.map((b, i) => ({ i, vis: b.offsetParent !== null, t: b.innerText.split('\n')[0] })));
  console.log(btns);
  const sels = { saludo: '#homeIntro', salir: '#homeScreen .logout-btn' };
  btns.filter(b => b.vis).forEach((b, k) => sels['b' + (k + 1)] = `#homeScreen .home-btn:visible >> nth=${k}`);
  await foto(p, 'v_home', sels);
  await ctx.close();

  fs.writeFileSync(OUT + 'cajas.json', JSON.stringify(cajas, null, 1));
  await browser.close();
})();
