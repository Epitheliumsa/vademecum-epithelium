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
- Los vademécums de cliente (portafolios) llevan el mismo sello con el **nombre del cliente**, tanto cuando el cliente entra a
  su vademécum como cuando el equipo o un comercial abre su portafolio; al salir de esa pantalla desaparece.
- En el inicio, "Lo Nuevo" va siempre de primero, para todos los tipos de usuario.
- El repositorio es público: **solo se guarda la huella** PBKDF2-SHA256 (lenta, con sal e iteraciones propias de cada
  fila) de `usuario:clave`. La clave es aleatoria de 8 caracteres y se compara sin importar mayúsculas. El cifrado lento es
  lo que protege una clave corta. **Nunca** escribir la clave ni un código que funcione como llave en el código.
- Entran por enlace `#invitado=usuario:clave` o escribiendo usuario y clave. Para retirar un acceso, se borra su fila.
- La clave en claro solo se entrega al cliente y se anota en el maestro de accesos que recibe el usuario.
- Límites conocidos: no hay control de equipos ni de cuántas veces se usa (la app es estática); el vencimiento usa el reloj del dispositivo.
