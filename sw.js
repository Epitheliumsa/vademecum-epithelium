// Service Worker del Vademécum Epithelium — permite usar la app sin conexión.
// Guarda la app y el vademécum de productos y materias primas; los portafolios de
// cliente NO se guardan (siempre piden internet por privacidad). version.txt tampoco
// se guarda, para que el aviso de "versión nueva" siga siendo exacto.
// La VERSION la actualiza actualizar-version.sh en cada publicación: al cambiar, se
// borra la caché vieja y la app nunca se queda pegada en una versión anterior.
const VERSION = '202610021349';
const CACHE = 'vademecum-' + VERSION;

// Archivos de la app (se guardan al instalar)
const APP_SHELL = [
    './',
    './index.html',
    './app.js?v=' + VERSION,
    './styles.css?v=' + VERSION,
    './manifest.json',
    './logo.png',
    './logo-blanco.png',
    './logo-simbolo.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-192-maskable.png',
    './icons/icon-512-maskable.png',
    './icons/favicon-32.png',
    './icons/favicon-16.png',
    './icons/apple-touch-icon.png'
];

// Datos que sí se guardan (se actualizan cuando hay conexión)
const DATOS = ['data.json', 'materias-primas.json', 'categorias.json', 'categorias-productos.json', 'portafolios-index.json'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.addAll(APP_SHELL);
        // Los datos se guardan con mejor esfuerzo (si falla alguno, no bloquea la instalación)
        await Promise.allSettled(DATOS.map(d => cache.add(d)));
        self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        // Borra cachés de versiones anteriores
        const nombres = await caches.keys();
        await Promise.all(nombres.filter(n => n !== CACHE).map(n => caches.delete(n)));
        await self.clients.claim();
    })());
});

// ¿La petición es a un portafolio de cliente? Esos nunca se guardan.
const esPortafolio = url => url.pathname.includes('/portafolios/');
// ¿Es el archivo de versión? Siempre a la red, sin caché.
const esVersion = url => url.pathname.endsWith('version.txt');
// ¿Es un archivo de datos que sí guardamos?
const esDato = url => DATOS.some(d => url.pathname.endsWith('/' + d) || url.pathname.endsWith(d));

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // Solo gestionamos lo del mismo sitio; lo externo (p. ej. GitHub raw) pasa directo.
    if (url.origin !== self.location.origin) return;

    // version.txt y portafolios de cliente: siempre a la red, nunca desde caché.
    if (esVersion(url) || esPortafolio(url)) return;

    // Navegación (abrir la app) y datos: primero la red, y si no hay señal, lo guardado.
    if (req.mode === 'navigate' || esDato(url)) {
        event.respondWith((async () => {
            try {
                const resp = await fetch(req);
                const cache = await caches.open(CACHE);
                cache.put(req.mode === 'navigate' ? './index.html' : req, resp.clone());
                return resp;
            } catch (e) {
                const cache = await caches.open(CACHE);
                const guardado = await cache.match(req.mode === 'navigate' ? './index.html' : req);
                if (guardado) return guardado;
                throw e;
            }
        })());
        return;
    }

    // Resto de la app (app.js, estilos, imágenes, íconos): primero lo guardado, si no, la red.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const guardado = await cache.match(req);
        if (guardado) return guardado;
        const resp = await fetch(req);
        cache.put(req, resp.clone());
        return resp;
    })());
});
