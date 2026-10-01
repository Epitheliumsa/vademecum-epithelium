// Instructivo de instalación del Vademécum para entregar a clientes y médicos (carta, 1 página) -> PDF y PNG
const { chromium } = require('playwright');
const fs = require('fs');
const C = __dirname + '/cap/';
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const QR = b64(__dirname + '/202609QR Vademecum.png'), LOGO = b64('/tmp/vade_main/logo.png'), ICO = b64('/tmp/vade_main/icons/icon-192.png');
const cel = (f) => `<img class="cel" src="${b64(C + f + '.png')}">`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 8.5in; height: 11in; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #1f2937; background: #fff; }
.hoja { padding: 0.45in 0.55in; height: 11in; display: flex; flex-direction: column; gap: 14px; }
.cab { display: flex; align-items: center; gap: 16px; border-bottom: 4px solid #79A02F; padding-bottom: 10px; }
.cab img.logo { height: 58px; }
.cab h1 { font-size: 27px; color: #006b4f; line-height: 1.1; }
.cab p { font-size: 14px; color: #555; margin-top: 3px; }
.cab .ico { margin-left: auto; width: 62px; height: 62px; border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.25); }
.top { display: flex; gap: 20px; align-items: stretch; }
.qr { width: 2.75in; border: 3px solid #79A02F; border-radius: 16px; padding: 10px; text-align: center; }
.qr img { width: 100%; display: block; }
.qr b { display: block; color: #006b4f; font-size: 15px; margin-top: 4px; }
.qr span { font-size: 11px; color: #444; word-break: break-all; }
.ingreso { flex: 1; background: #f3f8ec; border-radius: 16px; padding: 14px 16px; font-size: 13px; }
h2 { font-size: 16px; color: #006b4f; margin-bottom: 6px; }
.num { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: #79A02F; color: #fff; font-weight: 700; font-size: 13px; align-items: center; justify-content: center; margin-right: 6px; }
.ingreso ul { list-style: none; margin-top: 6px; }
.ingreso li { margin: 6px 0; line-height: 1.35; }
.campo { display: flex; gap: 10px; margin-top: 10px; }
.campo div { flex: 1; border: 1.5px solid #9bb873; border-radius: 8px; background: #fff; padding: 6px 10px; font-size: 12px; color: #666; height: 46px; }
.pasos { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.so { border: 1.5px solid #d6e4c4; border-radius: 16px; padding: 12px 14px; }
.so h2 { display: flex; align-items: center; gap: 8px; }
.so ol { list-style: none; font-size: 12.5px; }
.so li { margin: 5px 0; line-height: 1.3; }
.cels { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
.cel { width: 1.0in; border-radius: 10px; border: 3px solid #1f2937; }
.pie { display: grid; grid-template-columns: 1.15fr 1fr; gap: 16px; font-size: 12.5px; }
.pie > div { background: #f7f7f7; border-radius: 14px; padding: 12px 14px; line-height: 1.4; }
.pie ul { margin-left: 16px; }
.asesor { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #555; border-top: 1px solid #ddd; padding-top: 8px; }
.asesor .linea { border-bottom: 1.5px solid #9bb873; width: 3.2in; height: 22px; }
</style></head><body><div class="hoja">
 <div class="cab"><img class="logo" src="${LOGO}"><div><h1>Vademécum Epithelium</h1><p>Instálalo en tu celular: productos, fichas técnicas, lo nuevo y materias primas a la mano.</p></div><img class="ico" src="${ICO}"></div>
 <div class="top">
  <div class="qr"><img src="${QR}"><b>Escanéame con la cámara</b><span>epitheliumsa.github.io/vademecum-epithelium</span></div>
  <div class="ingreso">
   <h2>¿Cómo ingreso?</h2>
   <ul>
    <li><span class="num">1</span>Escanea el código con la cámara del celular y toca el enlace.</li>
    <li><span class="num">2</span>Instálalo (pasos de abajo) para tenerlo como una app más.</li>
    <li><span class="num">3</span>Escribe tu usuario y clave y toca <b>Acceder</b>. La sesión queda guardada.</li>
   </ul>
   <ul style="margin-top:10px">
    <li>👩‍⚕️ <b>Médico:</b> deja <b>Usuario</b> en blanco y escribe la <b>clave</b> que te entrega tu asesor.</li>
    <li>🏥 <b>Cliente:</b> usa tu <b>usuario y clave</b> personales: además verás <b>tu portafolio</b> de productos.</li>
   </ul>
   <div class="campo"><div>Usuario</div><div>Clave</div></div>
  </div>
 </div>
 <div class="pasos">
  <div class="so"><h2>🤖 Android · Chrome</h2><ol>
   <li><span class="num">1</span>Abre el enlace en <b>Chrome</b>.</li>
   <li><span class="num">2</span>Toca el menú <b>⋮</b> (arriba a la derecha) › <b>Agregar a la pantalla principal</b> o <b>Instalar app</b>.</li>
   <li><span class="num">3</span>Toca <b>Instalar</b>. Queda el ícono en tu celular.</li></ol>
   <div class="cels">${cel('m_chrome_menu_v')}${cel('m_chrome_instalar_v')}${cel('m_inicio_android_solo_v')}</div></div>
  <div class="so"><h2>🍎 iPhone · Safari</h2><ol>
   <li><span class="num">1</span>Abre el enlace en <b>Safari</b>.</li>
   <li><span class="num">2</span>Toca <b>Compartir</b> (cuadro con flecha) › <b>Agregar a pantalla de inicio</b>.</li>
   <li><span class="num">3</span>Toca <b>Agregar</b>. Queda el ícono en tu celular.</li></ol>
   <div class="cels">${cel('m_safari_compartir_v')}${cel('m_safari_agregar_v')}${cel('m_inicio_iphone_solo_v')}</div></div>
 </div>
 <div class="pie">
  <div><h2>💻 En el computador</h2>Abre el enlace en <b>Chrome</b> o <b>Edge</b> y toca el ícono <b>Instalar</b> de la barra de direcciones, o la <b>★</b> para guardarlo en favoritos.</div>
  <div><h2>💡 Ten en cuenta</h2><ul><li>Si sale "Hay una versión nueva", toca <b>Actualizar</b>.</li><li>Samsung con fondo negro: menú › desactiva <b>Modo oscuro</b>.</li></ul></div>
 </div>
 <div class="asesor"><div>Tu asesor comercial Epithelium<div class="linea"></div></div><div>Teléfono<div class="linea" style="width:2.2in"></div></div></div>
</div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 3 });
  await p.setContent(html); await p.waitForTimeout(400);
  const alto = await p.evaluate(() => document.querySelector('.hoja').scrollHeight);
  console.log('alto', alto);
  await p.pdf({ path: __dirname + '/202610Instructivo Vademecum Clientes y Medicos.pdf', format: 'Letter', printBackground: true });
  await p.screenshot({ path: __dirname + '/202610Instructivo Vademecum Clientes y Medicos.png' });
  await b.close();
})();
