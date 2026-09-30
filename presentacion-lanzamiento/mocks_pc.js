// Computador (Chrome/Edge): instalar la app o guardarla en favoritos. Y Samsung: quitar el modo oscuro.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const b64 = (f, t = 'image/png') => `data:${t};base64,` + fs.readFileSync(f).toString('base64');

const base = `*{box-sizing:border-box;margin:0;padding:0} body{font-family:'Segoe UI',Roboto,Arial,sans-serif;overflow:hidden;position:relative}
.foco{outline:4px solid #FFC000;outline-offset:3px;border-radius:8px;box-shadow:0 0 0 10px rgba(255,192,0,.35)}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.35)}`;

// Ventana de Chrome en el computador
const ventana = (app, pagina, url, { focoInstalar, focoEstrella } = {}) => `
<div style="position:absolute;inset:0;background:#dee1e6">
 <div style="height:40px;display:flex;align-items:flex-end;padding-left:12px;gap:8px">
  <div style="background:#fff;border-radius:10px 10px 0 0;padding:9px 16px;width:260px;font-size:13px;display:flex;gap:8px;align-items:center">
   <img src="${app.ico}" style="width:16px;height:16px;border-radius:4px">${app.titulo}<span style="margin-left:auto;color:#666">✕</span></div>
  <span style="font-size:20px;color:#555;padding-bottom:8px">+</span></div>
 <div style="background:#fff;height:48px;display:flex;align-items:center;gap:12px;padding:0 12px;border-bottom:1px solid #ddd">
  <span style="color:#555;font-size:18px">←</span><span style="color:#bbb;font-size:18px">→</span><span style="color:#555;font-size:18px">↻</span>
  <div style="flex:1;background:#f1f3f4;border-radius:20px;height:34px;display:flex;align-items:center;padding:0 14px;font-size:14px;color:#222;gap:10px">
   <span>🔒</span><span style="flex:1">${url}</span>
   <span class="${focoInstalar ? 'foco' : ''}" title="Instalar" style="display:inline-flex;padding:2px 4px"><svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="#444" stroke-width="1.8"><rect x="1" y="1" width="20" height="14" rx="2"/><path d="M11 4v7M8 8l3 3 3-3M7 19h8"/></svg></span>
   <span class="${focoEstrella ? 'foco' : ''}" style="font-size:20px;color:#444;padding:0 4px">☆</span></div>
  <span style="font-size:20px;color:#444">⋮</span></div>
 <div style="position:absolute;top:88px;left:0;right:0;bottom:0;background:url(${pagina}) center top/cover no-repeat"></div>
</div>`;

const APPS = {
  v: { nombre: 'Vademécum', titulo: 'Vademécum Epithelium', url: 'epitheliumsa.github.io/vademecum-epithelium', ico: b64('/tmp/vade_main/icons/icon-192.png'), pagina: b64(OUT + 'pcl_v.png') },
  r: { nombre: 'Visita Comercial', titulo: 'Visita Comercial', url: 'epitheliumsa.github.io/ruta-comercial', ico: b64('/home/user/ruta-comercial/icons/icon-192.png'), pagina: b64(OUT + 'pcl_r.png') }
};

const MOCKS = {};
for (const [k, a] of Object.entries(APPS)) {
  MOCKS['pc_instalar_' + k] = ventana(a, a.pagina, a.url, { focoInstalar: true }) + `
   <div style="position:absolute;top:92px;right:90px;width:360px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);padding:22px">
    <div style="font-size:18px;margin-bottom:16px">¿Instalar app?</div>
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:22px"><img src="${a.ico}" style="width:40px;height:40px;border-radius:9px">
     <div><b style="font-size:15px">${a.nombre}</b><div style="font-size:12px;color:#666">epitheliumsa.github.io</div></div></div>
    <div style="display:flex;justify-content:flex-end;gap:10px"><span style="padding:8px 16px;border:1px solid #ccc;border-radius:18px;font-size:14px;color:#1a73e8">Cancelar</span>
     <span class="foco" style="padding:8px 18px;background:#1a73e8;color:#fff;border-radius:18px;font-size:14px">Instalar</span></div></div>`;
  MOCKS['pc_favorito_' + k] = ventana(a, a.pagina, a.url, { focoEstrella: true }) + `
   <div style="position:absolute;top:92px;right:40px;width:360px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.35);padding:20px;font-size:14px">
    <div style="font-size:17px;margin-bottom:14px">Marcador agregado</div>
    <div style="color:#666;font-size:12px;margin-bottom:4px">Nombre</div><div style="border:1px solid #ccc;border-radius:6px;padding:8px;margin-bottom:12px">${a.nombre}</div>
    <div style="color:#666;font-size:12px;margin-bottom:4px">Carpeta</div><div class="foco" style="border:1px solid #ccc;border-radius:6px;padding:8px;margin-bottom:16px">Barra de favoritos ▾</div>
    <div style="display:flex;justify-content:flex-end;gap:10px"><span style="padding:8px 16px;border:1px solid #ccc;border-radius:18px;color:#1a73e8">Quitar</span><span style="padding:8px 18px;background:#1a73e8;color:#fff;border-radius:18px">Listo</span></div></div>`;
}

// ---- Samsung: celular en modo oscuro
const cel = (html) => `<div style="position:absolute;inset:0;background:#fff">${html}</div>`;
const OSC = b64(__dirname + '/cap/samsung_oscuro.png');
MOCKS['sam_oscuro'] = cel(`<div style="position:absolute;inset:0;background:#121212 url(${OSC}) top/390px auto no-repeat"></div>`);
MOCKS['sam_internet'] = cel(`<div style="position:absolute;inset:0;background:#121212"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:#fff;border-radius:22px 22px 0 0;padding:20px 18px 30px;font-size:14px;color:#111">
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px 6px;text-align:center">
    ${['Marcadores', 'Páginas guardadas', 'Historial', 'Descargas', 'Agregar página a', 'Bloqueadores', 'Privado', 'Configuración'].map(t => `<div><div style="width:38px;height:38px;border-radius:50%;background:#e8eef9;margin:0 auto 6px"></div><span style="font-size:11px">${t}</span></div>`).join('')}
    <div class="foco" style="grid-column:span 2"><div style="width:38px;height:38px;border-radius:50%;background:#1f2937;margin:0 auto 6px;color:#fff;line-height:38px">☾</div><b style="font-size:12px">Modo oscuro · desactívalo</b></div>
   </div></div>
  <div style="position:absolute;top:30px;left:18px;right:18px;color:#ddd;font-size:15px">Samsung Internet · menú ≡ (abajo a la derecha)</div>`);
MOCKS['sam_ajustes'] = cel(`<div style="padding:40px 18px;font-size:15px;color:#111">
   <div style="font-size:24px;font-weight:600;margin-bottom:22px">Pantalla</div>
   <div style="display:flex;gap:16px;justify-content:center;margin-bottom:26px">
    <div class="foco" style="text-align:center;padding:10px"><div style="width:80px;height:140px;border-radius:12px;background:#f5f5f5;border:1px solid #ccc"></div><div style="margin-top:8px;font-weight:700">Claro</div><div style="font-size:18px;color:#1a73e8">◉</div></div>
    <div style="text-align:center;padding:10px"><div style="width:80px;height:140px;border-radius:12px;background:#222"></div><div style="margin-top:8px">Oscuro</div><div style="font-size:18px;color:#999">○</div></div></div>
   ${['Configuración del modo oscuro', 'Brillo', 'Fluidez de movimientos', 'Protector de visión'].map(t => `<div style="padding:14px 0;border-bottom:1px solid #eee">${t}</div>`).join('')}
   <div style="margin-top:18px;font-size:13px;color:#555">Ajustes del teléfono › Pantalla › Claro</div></div>`);

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1366, height: 800 }, deviceScaleFactor: 3 });
  for (const [n, html] of Object.entries(MOCKS)) {
    const esCel = n.startsWith('sam_');
    await p.setViewportSize(esCel ? { width: 390, height: 844 } : { width: 1366, height: 800 });
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${base} body{width:${esCel ? 390 : 1366}px;height:${esCel ? 844 : 800}px}</style></head><body>${html}</body></html>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: OUT + n + '.png' });
    console.log(n);
  }
  await browser.close();
})();
