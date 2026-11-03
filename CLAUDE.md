# Instrucciones para Claude

## Publicación: siempre pedir confirmación
- **Nunca publicar sin confirmación del usuario.** Publicar es llevar cambios a `main`, porque GitHub Pages
  (https://epitheliumsa.github.io/vademecum-epithelium/) sirve esa rama y los usuarios lo ven de inmediato.
- Flujo: trabajar en una rama aparte → mostrar al usuario qué cambió (con capturas cuando aplique) →
  preguntar antes de crear o actualizar un pull request → nunca hacer merge a `main` sin un "sí" explícito.

## Proyecto
- Vademécum de productos, materias primas y portafolios de clientes de Epithelium (app web estática).
- La agenda de visitas de la fuerza de ventas vive en otro repositorio: Epitheliumsa/ruta-comercial.
- Responder en español, con tono sencillo, claro y conciso, tuteando.
- Los archivos de Excel que se entreguen van sin líneas de cuadrícula.

## Sincronizar el maestro con todos los vademécums
- El maestro de productos es `data.json`. Cuando se actualice (etiquetas, categorías, componentes,
  indicación, dosis, etc.), **propagar el cambio a TODOS los vademécums derivados en la misma tarea**:
  los portafolios de la app (`portafolios/*.json`) y el Vademécum Clientes (skill `vademecum-clientes`).
- Cómo propagar a los portafolios: cruzar cada producto por `Referencia Interna` contra `data.json` y
  copiar el valor vigente del maestro. **Conservar intactos** los productos propios del cliente
  (etiqueta `Cliente`), que no están en el maestro.
- Etiquetas vigentes = las que existan en `data.json`. La etiqueta `Estrategico` quedó **obsoleta**
  (se reemplazó por Transición-Impulso / Foco / Portafolio según el maestro); no debe reaparecer.
- Objetivo: evitar que los portafolios queden con datos viejos (desfase) respecto al maestro.

## Accesos de invitado (clientes externos con vencimiento)
- Viven en `INVITADOS` de `app.js`: perfil Médico, con fecha de vencimiento (`vence`) y marca de agua tipo sello redondo (muy tenue, con su nombre) (el invitado lo lleva en todas las pantallas).
- El pie fijo de protección de datos (© Epithelium S.A.) se muestra a **todos** los usuarios en todos los vademécums.
- Sello de seguridad: solo los **externos** (invitado, cliente y médico general) lo llevan, en **todas** las pantallas (nombre del
  invitado, nombre del cliente, o "Acceso médico autorizado"). El equipo y los comerciales **nunca** lo llevan, tampoco al abrir
  el portafolio de un cliente.
- En el inicio, "Lo Nuevo" va siempre de primero, para todos los tipos de usuario.
- El repositorio es público: **solo se guarda la huella** PBKDF2-SHA256 (lenta, con sal e iteraciones propias de cada
  fila) de `usuario:clave`. La clave es aleatoria de 8 caracteres y se compara sin importar mayúsculas. El cifrado lento es
  lo que protege una clave corta. **Nunca** escribir la clave ni un código que funcione como llave en el código.
- Entran por enlace `#invitado=usuario:clave` o escribiendo usuario y clave. Para retirar un acceso, se borra su fila.
- La clave en claro solo se entrega al cliente y se anota en el maestro de accesos que recibe el usuario.
- Límites conocidos: no hay control de equipos ni de cuántas veces se usa (la app es estática); el vencimiento usa el reloj del dispositivo.
- **Crear un acceso (o cambiar su clave)**: `python3 herramientas/nuevo_invitado.py USUARIO "Nombre" [--portafolio HUELLA ...] [--vence AAAA-MM-DD] [--clave X]`.
  Agrega o reemplaza la fila en `INVITADOS`, genera la clave y arma el instructivo PDF (con sello, sin fecha de vencimiento) y el
  enlace con el mensaje de WhatsApp en `~/entregas`. Después: `sh actualizar-version.sh`, probar (enlace, usuario+clave, clave mala, vencido)
  y publicar solo con el "sí" del usuario. Si ya se entregó una clave, usar `--clave` para conservarla (en `main` solo queda la huella).
- Vademécum de cliente del invitado: `portafolio` (una tienda) o `portafolios` (varias). En ambos casos "Vademécum Cliente" entra **directo** al
  portafolio (con varias, junta los productos de todas) y cada producto muestra **arriba a la derecha la tienda** a la que pertenece
  (tarjeta y detalle); los nuevos de Epithelium no llevan etiqueta. Los clientes con usuario y clave propios no llevan esa etiqueta.
- Accesos de invitado creados (todos vencen 2026-11-30, perfil Médico): dermaplast, scerquera (+ portafolio propio), ecossio (+ propio),
  farmaciainst, npena (MD Support Ltda), nhernandez (Natalia Hernandez Mantilla + Bella Piel S.A.S.). Las claves en claro solo las tiene
  el usuario y su archivo de enlace; el entorno de la sesión se reinicia y `~/entregas` se pierde: entregar los archivos con SendUserFile.

## Archivos para externos (PDF y Excel): sello y aviso de derechos
- Todo **PDF o Excel que se entregue a un usuario externo** (cliente, médico o invitado) pasa antes por
  `python3 herramientas/marca_externos.py ARCHIVO "Nombre del cliente" [--salida RUTA] [--sin-pie]`.
  Los internos (equipo y comerciales) no llevan sello.
- PDF: sello redondo tenue (el mismo de la app, con el nombre del cliente) en todas las páginas y el aviso de derechos al pie
  (`--sin-pie` si el documento ya trae el aviso escrito). Excel: hoja "Aviso legal" al inicio, franja con el nombre del cliente sobre la
  tabla de cada hoja, encabezado y pie de impresión con el aviso, y propiedades del archivo. Sin líneas de cuadrícula.
- Requisitos: `pip install pymupdf` (no usar `pypdf`: en este entorno choca con una librería del sistema), openpyxl y playwright con Chromium.
- Límites: el sello del PDF es una capa visual (se puede recortar de una captura parcial, pero no se quita con "copiar texto");
  en Excel la franja y el aviso se pueden borrar a mano, quedan como disuasivo y rastro del nombre del cliente.

## Origen de los datos (servidor de Ruta Comercial)
- El administrador sube Producto Terminado y Magistrales (juntos) y, aparte, las Materias primas desde **Bases de datos** en Ruta Comercial. El Vademécum pide primero
  ahí los productos y el portafolio de cada cliente (`desdeServidor` en `app.js`) y, si no responde o no hay nada subido, usa
  `data.json` y `portafolios/<huella>.json` publicados (materias primas: `materias-primas.json`). Los clientes nuevos siguen necesitando su huella en `portafolios-index.json`.

## Textos visibles al cliente (Indicación y Dosis Recomendada)
- No deben llevar notas internas: "verificar con desarrollo", "no se especificaron los porcentajes", "posible error de captura" ni
  comparaciones con la concentración comercial ("está por encima de su concentración comercial estándar…"). Si una oración mezcla la
  comparación con una advertencia de seguridad, se deja solo la advertencia. Decisiones ya tomadas: el encabezado "SEGÚN CRITERIO MÉDICO por
  concentración…" y "Su uso en este porcentaje depende de la valoración médica…" se dejan; MP0005, MP0009 y MP0999 quedan con sus notas.
- Al cambiar productos: propagar al maestro y a los portafolios (regla de arriba) y regenerar los Excel de carga.

## Muestras (etiqueta "Muestras")
- Productos con etiqueta `Muestras` (ej. MU0048 Minobit Z Cap): los ven **solo el equipo y los comerciales** (no médicos, clientes ni invitados),
  van solo en el maestro (nunca en portafolios de clientes), con color amarillo propio y marca de agua oblicua "MUESTRA MÉDICA".
  En Ruta Comercial salen en Entrega de Muestras > Muestra Médica (`EXTRAS` de `herramientas/productos.py` de ese repositorio).

## Búsquedas con varios valores
- Productos (nombre/código, solo equipo y comerciales): varios separados por coma (o por espacio si son códigos): "MP1107, MP1108".
- Componente: varios separados por coma = productos que tienen **todos**. Materias primas: varios nombres por coma (cualquiera) y varios usos
  por coma (todos). Tras la coma, la lista de sugerencias vuelve a salir.

## Cargas a Odoo y al servidor
- Plantilla de actualización de Odoo: columnas `id`, `default_code`, `name`, `indication`, `recommended_dosage`. El `id` se exporta de Odoo
  (`__export__.product_template_…`); **nunca** importar con el id vacío (crea duplicados).
- Los Excel `Vademecum_Epithelium.xlsx` (12 columnas) y `Vademecum_clientes.xlsx` (Cliente + 12 + Zona de Vendedor) se suben en Ruta Comercial >
  Bases de datos: el servidor manda sobre `data.json`/`portafolios/`, así que un cambio de datos solo se ve cuando se sube el Excel.

## Vista previa antes de publicar (carpeta `pruebas/`)
- Para que el usuario vea un cambio **antes** de publicarlo: `python3 herramientas/vista_previa.py [rama] [--servidor]` copia esa rama a `pruebas/` (franja naranja
  "VISTA PREVIA", sin service worker, sesiones aparte `vp_vademecum_*`, botones para entrar como Equipo, Médico y Comercial). Se ve en
  https://epitheliumsa.github.io/vademecum-epithelium/pruebas/ cuando `pruebas/` se sube a `main`.
- Por defecto usa los datos de la rama (no los del servidor de Ruta Comercial); con `--servidor` lee los reales.
- Subir `pruebas/` a `main` toca **solo `pruebas/`** (y la herramienta): la app oficial de la raíz no cambia hasta el "sí, publica". Pedir confirmación como siempre.
- `sw.js` ignora `/pruebas/` (no cachea ni mezcla la vista previa con la app oficial).
- Flujo: trabajar en una rama → `vista_previa.py` → (con su confirmación) subir **solo** `pruebas/` → el usuario revisa → ajustes (se repite) → con su "sí, publica" se publica la rama.
