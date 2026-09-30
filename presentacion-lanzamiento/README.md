# Presentación "Lanzamiento aplicaciones Epithelium"

Scripts con los que se arma `AAAAMMPresentacion Lanzamiento Aplicaciones Epithelium.pptx`
(1. Vademécum · 2. Visita Comercial · 3. Cotizador). No es parte de la app.

Para regenerarla (en una carpeta de trabajo con estos archivos):
1. Plantilla: la presentación de Junta de Nano como `junta.pptx` (pedirla; no se guarda aquí por tamaño).
2. `serv.sh` sirve el Vademécum (8801) y Visita Comercial (8802) en local; el servidor de Google se reemplaza por uno falso (no toca datos reales).
3. Capturas: `cap2.js`, `cap_vade.js`, `cap_visita.js`, `cap_pc.js`; pantallas de instalación: `mocks.js v|r`, `mocks_pc.js`. Nombres reales de clientes y vendedores se difuminan.
4. `video.py` (portadas), `qr.py` (códigos QR), luego `build2.py` arma la presentación y `render.py` da una vista previa.
