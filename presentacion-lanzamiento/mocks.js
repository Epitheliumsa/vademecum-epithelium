// Pantallas ilustrativas de la instalación (Android / iPhone): los menús del sistema no se pueden capturar,
// así que se dibujan en HTML con la pantalla real de la app adentro.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/cap/';
const b64 = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const APP = process.argv[2] || 'r';   // r = Visita Comercial, v = Vademécum
const LOGIN = b64(OUT + (APP === 'v' ? 'v_login.png' : 'r_login.png'));
const QR = b64(__dirname + (APP === 'v' ? '/202609QR Vademecum.png' : '/202609QR RutaComercial.png'));
const ICO_R = b64('/home/user/ruta-comercial/icons/icon-192.png');
const ICO_V = b64('/tmp/vade_main/icons/icon-192.png');
const ICO = APP === 'v' ? ICO_V : ICO_R;
const NOMBRE_APP = APP === 'v' ? 'Vademécum' : 'Visita Comercial';
const URL = APP === 'v' ? 'epitheliumsa.github.io/vademecum-epithelium' : 'epitheliumsa.github.io/ruta-comercial';

const base = `*{box-sizing:border-box;margin:0;padding:0} body{width:390px;height:844px;overflow:hidden;font-family:Roboto,'Segoe UI',Arial,sans-serif;background:#fff;position:relative}
.foco{outline:4px solid #FFC000;outline-offset:2px;border-radius:10px;box-shadow:0 0 0 9px rgba(255,192,0,.35)}
.estado{height:28px;display:flex;justify-content:space-between;align-items:center;padding:0 18px;font-size:13px;font-weight:600;color:#222}
.dim{position:absolute;inset:0;background:rgba(0,0,0,.45)}`;

// Barra de Chrome (Android) arriba
const chromeBar = (focoMenu) => `<div class="estado"><span>9:41</span><span>▂▄▆ 🔋</span></div>
<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:#fff;border-bottom:1px solid #ddd">
 <span style="font-size:20px;color:#555">⌂</span>
 <div style="flex:1;background:#f1f3f4;border-radius:22px;padding:9px 14px;font-size:14px;color:#333;white-space:nowrap;overflow:hidden">🔒 ${URL}</div>
 <span style="font-size:15px;border:2px solid #555;border-radius:4px;padding:0 5px;color:#555">1</span>
 <span class="${focoMenu ? 'foco' : ''}" style="font-size:24px;color:#333;padding:0 6px;font-weight:700">⋮</span>
</div>`;
const pagina = (top) => `<div style="position:absolute;top:${top}px;left:0;right:0;bottom:0;background:url(${LOGIN}) top/390px auto no-repeat"></div>`;

// Barra de Safari (iPhone) abajo
const safariBar = (focoShare) => `<div style="position:absolute;left:0;right:0;bottom:0;background:#f7f7f7;border-top:1px solid #ccc;padding:8px 14px 26px">
 <div style="background:#e9e9eb;border-radius:12px;padding:10px;text-align:center;font-size:15px;color:#111">AA &nbsp; 🔒 epitheliumsa.github.io &nbsp; ↻</div>
 <div style="display:flex;justify-content:space-around;align-items:center;margin-top:10px;font-size:24px;color:#0a7aff">
  <span>‹</span><span style="color:#b9c9e6">›</span>
  <span class="${focoShare ? 'foco' : ''}" style="padding:2px 8px"><svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="#0a7aff" stroke-width="2.2"><path d="M13 2v17M7 8l6-6 6 6"/><path d="M8 12H4v16h18V12h-4"/></svg></span>
  <span>▭</span><span>⧉</span></div></div>`;

const icono = (src, nombre, foco) => `<div style="width:80px;text-align:center"><img src="${src}" class="${foco ? 'foco' : ''}" style="width:62px;height:62px;border-radius:15px;box-shadow:0 2px 6px rgba(0,0,0,.3)"><div style="color:#fff;font-size:12px;margin-top:5px;text-shadow:0 1px 2px #000">${nombre}</div></div>`;
const otros = ['#4285f4', '#ea4335', '#fbbc05', '#34a853', '#7e57c2', '#26a69a', '#ef6c00', '#5c6bc0'].map(c => `<div style="width:80px;text-align:center"><div style="width:62px;height:62px;border-radius:15px;background:${c};opacity:.85;margin:auto"></div><div style="color:#fff;font-size:12px;margin-top:5px;opacity:.8">·····</div></div>`);
const inicio = (android, solo) => `<div style="position:absolute;inset:0;background:linear-gradient(160deg,#1f5f3a,#79A02F 60%,#c6d97c)"></div>
 <div class="estado" style="position:relative;color:#fff"><span>9:41</span><span>▂▄▆ 🔋</span></div>
 <div style="position:relative;display:flex;flex-wrap:wrap;gap:22px 10px;justify-content:space-around;padding:40px 12px">
  ${otros.join('')}${solo ? icono(ICO_V, 'Vademécum', true) : icono(ICO_R, 'Visita Comercial', true) + icono(ICO_V, 'Vademécum', true)}</div>
 ${android ? '' : '<div style="position:absolute;left:14px;right:14px;bottom:26px;height:92px;border-radius:30px;background:rgba(255,255,255,.3)"></div>'}`;

const MOCKS = {
  // Cámara leyendo el QR
  m_camara_android: `<div style="position:absolute;inset:0;background:#2b2b2b"></div>
   <div style="position:absolute;top:190px;left:75px;width:240px;height:240px;background:url(${QR}) center/cover;border-radius:6px"></div>
   <div style="position:absolute;top:175px;left:60px;width:270px;height:270px;border:4px solid #fff;border-radius:18px"></div>
   <div class="foco" style="position:absolute;top:480px;left:30px;right:30px;background:#fff;border-radius:14px;padding:14px 16px;font-size:14px;color:#222">
     <div style="font-weight:700;margin-bottom:4px">🌐 ${URL}</div><div style="color:#1a73e8;font-weight:600">Toca para abrir en Chrome</div></div>
   <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;color:#fff;font-size:15px">Apunta la cámara al código QR</div>`,
  m_chrome: chromeBar(true) + pagina(90),
  m_chrome_menu: chromeBar(false) + pagina(90) + `<div class="dim"></div>
   <div style="position:absolute;top:36px;right:8px;width:275px;background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.35);padding:8px 0;font-size:15px;color:#202124">
    ${['Nueva pestaña', 'Nueva pestaña de incógnito', 'Historial', 'Descargas', 'Favoritos', 'Pestañas recientes', 'Compartir…', 'Buscar en la página', 'Traducir…'].map(t => `<div style="padding:12px 18px">${t}</div>`).join('')}
    <div class="foco" style="padding:12px 18px;font-weight:700;background:#fff8e0;margin:0 6px">📲 Agregar a la pantalla principal</div>
    <div style="padding:12px 18px">Sitio de escritorio</div><div style="padding:12px 18px">Configuración</div></div>`,
  m_chrome_instalar: chromeBar(false) + pagina(90) + `<div class="dim"></div>
   <div style="position:absolute;top:300px;left:28px;right:28px;background:#fff;border-radius:22px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.4)">
    <div style="font-size:20px;color:#202124;margin-bottom:18px">Agregar a la pantalla principal</div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px"><img src="${ICO}" style="width:48px;height:48px;border-radius:12px">
     <div><div style="font-size:16px;font-weight:600">${NOMBRE_APP}</div><div style="font-size:13px;color:#5f6368">epitheliumsa.github.io</div></div></div>
    <div style="display:flex;justify-content:flex-end;gap:28px;font-size:15px;font-weight:600;color:#1a73e8"><span>Cancelar</span><span class="foco" style="padding:4px 10px">Instalar</span></div></div>`,
  m_inicio_android: inicio(true),

  m_camara_iphone: `<div style="position:absolute;inset:0;background:#2b2b2b"></div>
   <div style="position:absolute;top:220px;left:75px;width:240px;height:240px;background:url(${QR}) center/cover;border-radius:6px"></div>
   <div class="foco" style="position:absolute;top:150px;left:60px;right:60px;background:rgba(255,255,255,.92);border-radius:14px;padding:10px 14px;font-size:14px;color:#111;text-align:center">
     🧭 <b>Abrir en Safari</b><br><span style="font-size:12px;color:#555">epitheliumsa.github.io</span></div>
   <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center;color:#fff;font-size:15px">Cámara del iPhone</div>`,
  m_safari: `<div class="estado"><span>9:41</span><span>▂▄▆ 🔋</span></div>` + pagina(28) + safariBar(true),
  m_safari_compartir: `<div class="estado"><span>9:41</span><span>▂▄▆ 🔋</span></div>` + pagina(28) + safariBar(false) + `<div class="dim"></div>
   <div style="position:absolute;left:0;right:0;bottom:0;height:560px;background:#f2f2f7;border-radius:14px 14px 0 0;padding:16px 14px;font-size:16px;color:#111">
    <div style="display:flex;gap:12px;align-items:center;background:#fff;border-radius:12px;padding:10px;margin-bottom:14px"><img src="${ICO}" style="width:40px;height:40px;border-radius:9px"><div><b>${NOMBRE_APP}</b><div style="font-size:12px;color:#888">epitheliumsa.github.io</div></div></div>
    <div style="background:#fff;border-radius:12px">${['Copiar', 'Agregar a la lista de lectura', 'Agregar marcador', 'Agregar a favoritos'].map(t => `<div style="padding:13px 14px;border-bottom:1px solid #e5e5ea">${t}</div>`).join('')}
     <div class="foco" style="padding:13px 14px;font-weight:700;background:#fff8e0">Agregar a pantalla de inicio &nbsp;⊞</div>
     ${['Buscar en la página', 'Imprimir'].map(t => `<div style="padding:13px 14px;border-top:1px solid #e5e5ea">${t}</div>`).join('')}</div></div>`,
  m_safari_agregar: `<div style="position:absolute;inset:0;background:#f2f2f7"></div>
   <div style="position:relative;display:flex;justify-content:space-between;align-items:center;padding:44px 16px 14px;font-size:16px;color:#0a7aff;border-bottom:1px solid #d1d1d6;background:#f9f9f9">
    <span>Cancelar</span><b style="color:#111">Agregar a inicio</b><span class="foco" style="font-weight:700;padding:3px 8px">Agregar</span></div>
   <div style="position:relative;margin:24px 16px;background:#fff;border-radius:12px;padding:14px;display:flex;gap:14px;align-items:center">
    <img src="${ICO}" style="width:60px;height:60px;border-radius:14px"><div style="flex:1"><div style="font-size:17px;border-bottom:1px solid #e5e5ea;padding-bottom:8px">${NOMBRE_APP}</div>
    <div style="font-size:13px;color:#888;padding-top:8px">https://${URL}/</div></div></div>
   <div style="position:relative;margin:0 20px;font-size:13px;color:#6d6d72">Se agregará un ícono a tu pantalla de inicio para acceder rápidamente a este sitio web.</div>`,
  m_inicio_iphone: inicio(false),
  m_inicio_android_solo: inicio(true, true),
  m_inicio_iphone_solo: inicio(false, true)
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  for (const [n, html] of Object.entries(MOCKS)) {
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${base}</style></head><body>${html}</body></html>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: OUT + n + '_' + APP + '.png' });
  }
  await browser.close();
})();
