// CONFIGURACIÓN
// Versión publicada: al cambiar, la app ofrece actualizarse (se genera junto con version.txt)
const APP_VERSION = '202609281445';

// Usuarios internos de Epithelium. Los que tienen "zona" son comerciales y solo
// ven el portafolio de los clientes de esa zona; los que no tienen zona ven el
// portafolio de clientes completo. El médico no ve portafolio de clientes.
const USUARIOS_INTERNOS = [
    { clave: 'EPITHE-000', tipo: 'equipo', zona: null },   // General equipo (usuario vacío)
    { clave: 'EPITHE-001', tipo: 'medico', zona: null },   // Médico (usuario vacío)
    { usuario: 'M.Castro',    clave: 'MCastro',    tipo: 'equipo', zona: null },
    { usuario: 'H.Reyes',     clave: 'HReyes',     tipo: 'equipo', zona: null },
    { usuario: 'L.Ramos',     clave: 'LRamos',     tipo: 'comercial', zona: 'Zona Norte' },
    { usuario: 'Y.Caballero', clave: 'YCaballero', tipo: 'comercial', zona: 'Zona Sur' },
    { usuario: 'J.Herrera',   clave: 'JHerrera',   tipo: 'equipo', zona: null }   // Jefe comercial: ve todas las zonas
];

const URL_DATOS = 'https://raw.githubusercontent.com/nanorsf/vademecum-epithelium/main/';

let productos = [];
let materiasPrimas = [];
let categorias = {};
let coloresProducto = {};
let materiasPrimasFiltradas = [];
let portafolio = [];
let portafolioPropio = [];
let clienteNombre = '';
let indiceClientes = [];
let clientesFiltrados = [];
let modoAdmin = false;
let modoUsuario = 'cliente';   // 'cliente' | 'medico' | 'equipo' | 'comercial'
let zonaUsuario = null;        // zona del comercial (null = ve todas)

// Vademécum de productos: el general de Epithelium y el portafolio propio de cada cliente
const CATALOGOS = {
    prod: {
        pantalla: 'mainScreen', tema: '',
        ids: { nombre: 'searchName', componentes: 'searchComponents', categoria: 'filterCategory', forma: 'filterFormula', nuevo: 'btnNuevo', resultados: 'resultados' },
        datos: () => productos, filtrados: [], soloNuevos: false
    },
    port: {
        pantalla: 'portScreen', tema: 'theme-port',
        ids: { nombre: 'pfSearchName', componentes: 'pfSearchComponents', categoria: 'pfFilterCategory', forma: 'pfFilterFormula', nuevo: 'pfBtnNuevo', resultados: 'pfResultados' },
        datos: () => portafolio, filtrados: [], soloNuevos: false
    }
};

// Inicializar app
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
    verificarAcceso();
});

// CARGAR DATOS
// Primero se busca el archivo en el mismo sitio de la app; si falla, en GitHub
async function descargarJSON(archivo, esValido = d => Array.isArray(d) && d.length > 0) {
    const fuentes = [archivo, URL_DATOS + archivo];
    for (const url of fuentes) {
        try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const datos = await response.json();
            if (esValido(datos)) return datos;
        } catch (error) {
            console.warn(`No se pudo cargar ${url}:`, error);
        }
    }
    return null;
}

async function cargarDatos() {
    productos = await descargarJSON('data.json') || [];
    productos.forEach(p => {
        p['Categoría del Producto'] = (p['Categoría del Producto'] || '').replace(/^Magistral de Pedido\s*\/\s*/, '');
    });
    productos.sort(compararProductos);
    console.log(`✅ ${productos.length} productos cargados`);
    materiasPrimas = await descargarJSON('materias-primas.json') || [];
    console.log(`✅ ${materiasPrimas.length} materias primas cargadas`);
    categorias = await descargarJSON('categorias.json', d => d && typeof d === 'object') || {};
    indiceClientes = await descargarJSON('portafolios-index.json') || [];
    coloresProducto = await descargarJSON('categorias-productos.json', d => d && typeof d === 'object') || {};
}

// Color de la categoría de un producto (una sola categoría por producto)
function colorProductoCat(categoria) {
    const c = (categoria || '').replace(/^Magistral de Pedido\s*\/\s*/, '').trim();
    return coloresProducto[c] || null;
}
function rgbaHex(hex, alfa) {
    const [r, g, b] = hexRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}
// Mezcla un color con blanco o negro (frac 0-1) y devuelve un rgb OPACO
function mezclar(hex, hacia, frac) {
    const [r, g, b] = hexRgb(hex);
    const t = hacia === 'blanco' ? 255 : 0;
    const m = v => Math.round(v + (t - v) * frac);
    return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}
// Versión clara opaca del color (para fondos que deben taparse) y oscura (para texto legible)
const lavado = hex => mezclar(hex, 'blanco', 0.88);
function textoLegible(hex) {
    const [r, g, b] = hexRgb(hex);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;   // qué tan claro es el color
    return mezclar(hex, 'negro', lum > 150 ? 0.55 : 0.3);
}
// Fondo tenive OPACO para el detalle (claro arriba, blanco abajo)
const fondoCategoria = hex => `linear-gradient(180deg, ${lavado(hex)} 0%, #ffffff 240px)`;

// Color de cada categoría de materia prima (para las barras y el fondo tenue)
function hexRgb(hex) {
    hex = String(hex || '').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex || '0', 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function colorCategoria(nombre) {
    return categorias[nombre] && categorias[nombre].color ? categorias[nombre].color : '#c9c9c9';
}
function rgbaCategoria(nombre, alfa) {
    const [r, g, b] = hexRgb(colorCategoria(nombre));
    return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}
// Barra lateral: 70% categoría principal y 30% secundaria (si tiene), en tono tenue
function barraCategorias(m) {
    const p = rgbaCategoria(m['Categoria Principal'], 0.55);
    const s = m['Categoria Secundaria'];
    if (s && categorias[s]) {
        return `linear-gradient(to bottom, ${p} 0 70%, ${rgbaCategoria(s, 0.55)} 70% 100%)`;
    }
    return p;
}
function categoriasDe(m) {
    return [m['Categoria Principal'], m['Categoria Secundaria']].filter(c => c && categorias[c]);
}

async function reintentarCarga() {
    await cargarDatos();
    entrarApp();
}

// ACCESO
// Cada cliente entra con usuario + clave; su portafolio está en portafolios/<huella>.json
async function huellaCliente(usuario, clave) {
    const bytes = new TextEncoder().encode(`${usuario}:${clave}`);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 24);
}

async function cargarPortafolio(huella) {
    const datos = await descargarJSON(`portafolios/${huella}.json`, d => d && Array.isArray(d.productos));
    if (!datos) return false;
    clienteNombre = datos.cliente;
    portafolioPropio = datos.productos;
    return true;
}

// Encuentra un usuario interno por usuario + clave (o por código, con el usuario vacío)
function buscarUsuarioInterno(usuario, clave) {
    const u = usuario.trim().toLowerCase();
    const c = clave.trim();
    for (const x of USUARIOS_INTERNOS) {
        if (x.usuario) {
            if (u === x.usuario.toLowerCase() && c.toLowerCase() === x.clave.toLowerCase()) return x;
        } else {
            const codigo = (c || u).toUpperCase();
            if (codigo === x.clave.toUpperCase() && (!u || !c)) return x;
        }
    }
    return null;
}

// Acceso directo desde Ruta Comercial para el equipo interno: el enlace trae #acceso=<código>, que es
// SHA-256 de "vademecum:usuario:clave" (en minúsculas). Solo sirve para los usuarios internos con nombre.
async function accesoDesdeRutaComercial() {
    const m = location.hash.match(/acceso=([0-9a-f]{64})/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);   // el código no queda a la vista
    for (const x of USUARIOS_INTERNOS.filter(u => u.usuario)) {
        const bytes = new TextEncoder().encode(`vademecum:${x.usuario}:${x.clave}`.toLowerCase());
        const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
        if (hash === m[1]) {
            localStorage.setItem('vademecum_interno', JSON.stringify({ tipo: x.tipo, zona: x.zona || null }));
            localStorage.removeItem('vademecum_cliente');
            localStorage.setItem('vademecum_timestamp', new Date().toISOString());
            return;
        }
    }
}

async function verificarAcceso() {
    await accesoDesdeRutaComercial();
    const interno = localStorage.getItem('vademecum_interno');
    const clienteGuardado = localStorage.getItem('vademecum_cliente');
    if (interno) {
        try {
            const s = JSON.parse(interno);
            modoUsuario = s.tipo;
            zonaUsuario = s.zona || null;
            return entrarApp();
        } catch (e) { localStorage.removeItem('vademecum_interno'); }
    }
    if (clienteGuardado && await cargarPortafolio(clienteGuardado)) {
        modoUsuario = 'cliente';
        return entrarApp();
    }
    mostrarPantalla('loginScreen');
    localStorage.removeItem('vademecum_interno');
    localStorage.removeItem('vademecum_cliente');
}

async function verificarCodigo() {
    const usuario = document.getElementById('accessUser').value.trim();
    const clave = document.getElementById('accessCode').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    if (!usuario && !clave) {
        errorMsg.textContent = 'Ingresa tu usuario y clave';
        return;
    }
    // Usuarios internos: equipo, comerciales y médico
    const interno = buscarUsuarioInterno(usuario, clave);
    if (interno) {
        modoUsuario = interno.tipo;
        zonaUsuario = interno.zona || null;
        localStorage.setItem('vademecum_interno', JSON.stringify({ tipo: interno.tipo, zona: interno.zona || null }));
        localStorage.removeItem('vademecum_cliente');
        localStorage.setItem('vademecum_timestamp', new Date().toISOString());
        errorMsg.textContent = '';
        return entrarApp();
    }
    // Clientes: usuario + clave de dos dígitos
    if (usuario && /^\d{2}$/.test(clave)) {
        errorMsg.textContent = 'Verificando...';
        const huella = await huellaCliente(usuario.toLowerCase(), clave);
        if (await cargarPortafolio(huella)) {
            modoUsuario = 'cliente';
            localStorage.setItem('vademecum_cliente', huella);
            localStorage.removeItem('vademecum_interno');
            localStorage.setItem('vademecum_timestamp', new Date().toISOString());
            errorMsg.textContent = '';
            return entrarApp();
        }
    }
    errorMsg.textContent = '❌ Usuario o clave incorrectos';
    document.getElementById('accessCode').value = '';
}

function cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('vademecum_interno');
        localStorage.removeItem('vademecum_cliente');
        localStorage.removeItem('vademecum_timestamp');
        modoUsuario = 'cliente';
        zonaUsuario = null;
        portafolio = [];
        portafolioPropio = [];
        clienteNombre = '';
        mostrarPantalla('loginScreen');
        document.getElementById('accessUser').value = '';
        document.getElementById('accessCode').value = '';
        document.getElementById('errorMsg').textContent = '';
    }
}

// Búsqueda sin distinguir mayúsculas ni tildes
const normalizar = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Opciones únicas (sin repetir por mayúsculas/tildes) y en orden alfabético
function opcionesUnicas(textos) {
    const mapa = new Map();
    textos.forEach(t => {
        const limpio = t.replace(/\s+/g, ' ').trim();
        if (limpio.length > 1 && !mapa.has(normalizar(limpio))) mapa.set(normalizar(limpio), limpio);
    });
    return [...mapa.values()].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function llenarDatalist(id, valores) {
    const lista = document.getElementById(id);
    lista.innerHTML = '';
    valores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        lista.appendChild(option);
    });
}

// "Acido Glicolico 12%" -> "Acido Glicolico"
const componentesDe = p => String(p['Componentes'] || '').split(/\+|\n/)
    .map(c => c.replace(/\s+\d[\d.,]*\s*(%|mg|ui)?(\s.*)?$/i, '').trim());

// Usos cortos a partir del texto de "Uso Terapéutico y Cosmético"
const usosDe = m => String(m['Uso Terapéutico y Cosmético'] || '').split(/[,;\n]|\s\/\s/)
    .map(u => u.replace(/\(.*$/, '').replace(/^Función cosmética:\s*/i, '').replace(/[.:]+$/, '').trim())
    .filter(u => u.length > 2 && u.length <= 45)
    .map(u => u.charAt(0).toUpperCase() + u.slice(1));

// Orden alfabético; si el nombre es el mismo (sin el "x 30 ml"), primero el menor volumen
const nombreBase = p => p['Nombre'].replace(/\s+x\s+[\d.,]+\s*[a-zA-Z]*/i, '').trim();
const volumen = p => parseFloat(String(p['Tamaño']).replace(',', '.')) || 0;
function compararProductos(a, b) {
    return nombreBase(a).localeCompare(nombreBase(b), 'es', { sensitivity: 'base', numeric: true })
        || volumen(a) - volumen(b)
        || a['Nombre'].localeCompare(b['Nombre'], 'es', { sensitivity: 'base' });
}

// Mi Portafolio = productos propios del cliente + los nuevos de Epithelium (si ya tiene uno con el mismo nombre, no se repite)
function armarPortafolio(incluirNuevos = true) {
    const nombre = p => p['Nombre'].trim().toLowerCase();
    // Nombre del mismo producto (misma referencia) en el vademécum de Epithelium
    const nombreGeneral = new Map(productos.map(p => [p['Referencia Interna'], p['Nombre']]));
    portafolioPropio.forEach(p => {
        const general = nombreGeneral.get(p['Referencia Interna']);
        p.nombreEpithelium = general && general.trim().toLowerCase() !== nombre(p) ? general : '';
    });
    const propios = new Set(portafolioPropio.map(nombre));
    // Los nuevos de Epithelium se suman al final (al cliente y a la fuerza de ventas)
    const nuevosEpithelium = incluirNuevos ? productos
        .filter(p => p['Etiquetas de producto'] === 'Nuevo' && !propios.has(nombre(p)))
        .map(p => ({ ...p, nuevoEpithelium: true })) : [];
    // Primero los productos propios del cliente y al final los nuevos de Epithelium, cada grupo en orden
    portafolio = [...[...portafolioPropio].sort(compararProductos), ...nuevosEpithelium.sort(compararProductos)];
}

function entrarApp() {
    armarPortafolio();
    Object.keys(CATALOGOS).forEach(k => {
        const cat = CATALOGOS[k];
        cat.soloNuevos = false;
        document.getElementById(cat.ids.nuevo).classList.remove('active');
        document.getElementById(cat.pantalla).classList.remove('modo-nuevo');
        inicializarFiltros(k);
        filtrar(k);
    });
    inicializarFiltrosMP();
    filtrarMP();
    const esCliente = modoUsuario === 'cliente';
    const veClientes = (modoUsuario === 'equipo' || modoUsuario === 'comercial') && indiceClientes.length > 0;
    document.getElementById('btnPortafolioClientes').style.display = veClientes ? '' : 'none';
    const totalNuevos = productos.filter(p => p['Etiquetas de producto'] === 'Nuevo').length;
    document.getElementById('loNuevoTexto').textContent = `${totalNuevos} productos nuevos de Epithelium`;
    document.getElementById('btnPortafolio').style.display = esCliente ? '' : 'none';
    const intro = document.getElementById('homeIntro');
    intro.textContent = '¿Qué quieres consultar?';
    let saludoTexto = '';
    if (esCliente) saludoTexto = `Hola, ${clienteNombre}`;
    else if (modoUsuario === 'comercial') saludoTexto = `Comercial · ${zonaUsuario}`;
    else if (modoUsuario === 'equipo') saludoTexto = 'Equipo Epithelium';
    if (saludoTexto) {
        const saludo = document.createElement('span');
        saludo.className = 'home-saludo';
        saludo.textContent = saludoTexto;
        intro.prepend(saludo);
    }
    irInicio();
}

function irInicio() {
    mostrarPantalla('homeScreen');
}

function abrirProductos() {
    limpiarFiltros('prod');
    ponerNuevo('prod', false);
    mostrarPantalla('mainScreen');
}

function abrirLoNuevo() {
    limpiarFiltros('prod');
    ponerNuevo('prod', true);
    mostrarPantalla('mainScreen');
}

function abrirPortafolio() {
    modoAdmin = false;
    limpiarFiltros('port');
    ponerNuevo('port', false);
    document.getElementById('pfBtnNuevo').style.display = '';
    document.getElementById('portTitulo').textContent = 'Mi Portafolio';
    document.getElementById('portBackBtn').innerHTML = '&larr; Inicio';
    document.getElementById('portBackBtn').onclick = irInicio;
    mostrarPantalla('portScreen');
}

// Clientes que puede ver el usuario: el comercial solo los de su zona; el equipo, todos
function clientesVisibles() {
    return modoUsuario === 'comercial'
        ? indiceClientes.filter(c => c.zona === zonaUsuario)
        : indiceClientes;
}

function abrirListaClientes() {
    clientesFiltrados = clientesVisibles();
    document.getElementById('clSearchName').value = '';
    const subtitulo = document.getElementById('clSubtitulo');
    subtitulo.textContent = modoUsuario === 'comercial' ? zonaUsuario : '';
    subtitulo.style.display = modoUsuario === 'comercial' ? '' : 'none';
    // Quien ve todas las zonas puede filtrar por una
    const selZona = document.getElementById('clZona');
    selZona.style.display = modoUsuario === 'comercial' ? 'none' : '';
    const zonas = [...new Set(indiceClientes.map(c => c.zona).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    selZona.innerHTML = '<option value="">Todas las zonas</option>' + zonas.map(z => `<option>${z}</option>`).join('');
    mostrarListaClientes();
    mostrarPantalla('clientsListScreen');
}

function filtrarListaClientes() {
    const q = normalizar(document.getElementById('clSearchName').value);
    const zona = document.getElementById('clZona').value;
    clientesFiltrados = clientesVisibles().filter(c => normalizar(c.cliente).includes(q) && (!zona || c.zona === zona));
    mostrarListaClientes();
}

function mostrarListaClientes() {
    const container = document.getElementById('clResultados');
    container.innerHTML = '';
    if (clientesFiltrados.length === 0) {
        container.innerHTML = '<div class="no-results">No se encontraron clientes</div>';
        return;
    }
    clientesFiltrados.forEach(c => {
        const card = document.createElement('div');
        card.className = 'producto-card cliente-card';
        card.onclick = () => abrirPortafolioDeCliente(c.huella, c.cliente);
        // El equipo ve la zona de cada cliente; el comercial ya está dentro de su zona
        const zona = (modoUsuario === 'equipo' && c.zona) ? `<span class="cliente-zona">${c.zona}</span>` : '';
        card.innerHTML = `<h3>${c.cliente}${zona}</h3>`;
        container.appendChild(card);
    });
}

// Deja en blanco la búsqueda y los filtros de un catálogo
function limpiarFiltros(k) {
    const ids = CATALOGOS[k].ids;
    ['nombre', 'componentes', 'categoria', 'forma'].forEach(campo => {
        document.getElementById(ids[campo]).value = '';
    });
}

async function abrirPortafolioDeCliente(huella, nombre) {
    const datos = await descargarJSON(`portafolios/${huella}.json`, d => d && Array.isArray(d.productos));
    if (!datos) {
        alert('No se pudo cargar el portafolio de este cliente. Revisa tu conexión e intenta de nuevo.');
        return;
    }
    clienteNombre = datos.cliente;
    portafolioPropio = datos.productos;
    armarPortafolio();
    inicializarFiltros('port');
    limpiarFiltros('port');
    ponerNuevo('port', false);
    document.getElementById('pfBtnNuevo').style.display = '';
    modoAdmin = true;
    document.getElementById('portTitulo').textContent = nombre;
    document.getElementById('portBackBtn').innerHTML = '&larr; Clientes';
    document.getElementById('portBackBtn').onclick = abrirListaClientes;
    mostrarPantalla('portScreen');
}

function abrirMateriasPrimas() {
    limpiarFiltrosMP();
    mostrarPantalla('mpScreen');
}

function mostrarPantalla(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function llenarSelect(select, valores) {
    select.length = 1;
    valores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
    });
}

function inicializarFiltros(k = 'prod') {
    const cat = CATALOGOS[k];
    const datos = cat.datos();
    // En el portafolio de cliente se ofrecen todas las categorías y formas que maneja la compañía
    const fuente = k === 'port' ? [...productos, ...datos] : datos;
    const categorias = [...new Set(fuente.map(p => p['Categoría del Producto']).filter(p => p))];
    const formas = [...new Set(fuente.map(p => p['Forma Farmacéutica']).filter(p => p))];
    if (k === 'port') {
        categorias.sort();
        formas.sort();
    }
    llenarSelect(document.getElementById(cat.ids.categoria), categorias);
    llenarDatalist(k === 'port' ? 'pfDlComponentes' : 'dlComponentes', opcionesUnicas(datos.flatMap(componentesDe)));
    llenarSelect(document.getElementById(cat.ids.forma), formas);
}

function ponerNuevo(k, activo) {
    const cat = CATALOGOS[k];
    cat.soloNuevos = activo;
    document.getElementById(cat.ids.nuevo).classList.toggle('active', activo);
    document.getElementById(cat.pantalla).classList.toggle('modo-nuevo', activo);
    filtrar(k);
}

function toggleNuevo(k = 'prod') {
    ponerNuevo(k, !CATALOGOS[k].soloNuevos);
}

function filtrar(k = 'prod') {
    const cat = CATALOGOS[k];
    const valor = campo => document.getElementById(cat.ids[campo]).value;
    const searchName = normalizar(valor('nombre'));
    const searchComponents = normalizar(valor('componentes'));
    const filterCategory = valor('categoria');
    const filterFormula = valor('forma');
    cat.filtrados = cat.datos().filter(p => {
        const matchName = normalizar(p['Nombre']).includes(searchName) || normalizar(p.nombreEpithelium).includes(searchName);
        const matchComponents = !searchComponents || normalizar(p['Componentes']).includes(searchComponents);
        const matchCategory = !filterCategory || p['Categoría del Producto'] === filterCategory;
        const matchFormula = !filterFormula || p['Forma Farmacéutica'] === filterFormula;
        const matchNuevo = !cat.soloNuevos || p['Etiquetas de producto'] === 'Nuevo';
        return matchName && matchComponents && matchCategory && matchFormula && matchNuevo;
    });
    mostrarResultados(k);
}

// Nombre del mismo producto en Epithelium, marcado con el símbolo del logo
const lineaEpithelium = nombre => `<p class="nombre-epithelium" title="Nombre Epithelium"><img src="logo-simbolo.png" alt="Epithelium"><span>${nombre}</span></p>`;

function mostrarResultados(k = 'prod') {
    const cat = CATALOGOS[k];
    const lista = cat.filtrados;
    const container = document.getElementById(cat.ids.resultados);
    container.innerHTML = '';
    if (cat.datos().length === 0) {
        container.innerHTML = '<div class="no-results">No se pudieron cargar los datos. Revisa tu conexión a internet.<br><button class="btn-nuevo" style="margin-top:15px" onclick="reintentarCarga()">Reintentar</button></div>';
        return;
    }
    if (lista.length === 0) {
        container.innerHTML = '<div class="no-results">No se encontraron productos</div>';
        return;
    }
    if (cat.soloNuevos) {
        container.innerHTML = `<div class="aviso-nuevo">✨ Estás viendo lo nuevo · ${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}</div>`;
    }
    let separadorPuesto = false;
    lista.forEach(p => {
        // En Mi Portafolio, separar los nuevos de Epithelium (que el cliente no tiene) con un encabezado
        if (p.nuevoEpithelium && !separadorPuesto && !cat.soloNuevos) {
            const sep = document.createElement('div');
            sep.className = 'separador-nuevos';
            sep.textContent = 'Productos Nuevos Epithelium';
            container.appendChild(sep);
            separadorPuesto = true;
        }
        const esNuevo = p['Etiquetas de producto'] === 'Nuevo';
        const color = colorProductoCat(p['Categoría del Producto']);
        const card = document.createElement('div');
        card.className = (esNuevo ? 'producto-card es-nuevo' : 'producto-card') + (color ? ' mp-card' : '');
        card.onclick = () => mostrarDetalle(p, cat.tema);
        const badge = p.nuevoEpithelium ? '<span class="badge-nuevo">NUEVO EPITHELIUM</span>' : (esNuevo ? '<span class="badge-nuevo">NUEVO</span>' : '');
        const barra = color ? `<span class="mp-barra" style="background:${rgbaHex(color, 0.55)}"></span>` : '';
        card.innerHTML = `${barra}<h3>${p['Nombre']}${badge}</h3>${p.nombreEpithelium ? lineaEpithelium(p.nombreEpithelium) : ''}<p><strong>Componentes:</strong> ${p['Componentes']}</p><p><strong>Forma:</strong> ${p['Forma Farmacéutica']}</p>${p['Categoría del Producto'] ? `<p><strong>Categoría:</strong> ${p['Categoría del Producto']}</p>` : ''}${p['Indicación'] ? `<p style="font-size: 12px; color: #999; margin-top: 8px;">${p['Indicación'].substring(0, 100)}...</p>` : ''}`;
        container.appendChild(card);
    });
}

function temaModal(tema) {
    const box = document.querySelector('#modalDetail .modal-content');
    box.classList.remove('theme-mp', 'theme-nuevo', 'theme-port');
    box.style.background = '';
    if (tema) box.classList.add(tema);
}

function mostrarDetalle(producto, tema = '') {
    temaModal(producto['Etiquetas de producto'] === 'Nuevo' ? 'theme-nuevo' : tema);
    const modal = document.getElementById('modalDetail');
    const content = document.getElementById('detailContent');
    // Fondo tenue con el color de la categoría del producto
    const color = colorProductoCat(producto['Categoría del Producto']);
    if (color) {
        document.querySelector('#modalDetail .modal-content').style.background = fondoCategoria(color);
    }
    content.innerHTML = `<h2>${producto['Nombre']}</h2>${producto.nombreEpithelium ? lineaEpithelium(producto.nombreEpithelium) : ''}${producto['Componentes'] ? `<strong>Componentes</strong><p>${producto['Componentes'].replace(/\n/g, '<br>')}</p>` : ''}<strong>Especificaciones</strong><p>${producto['Categoría del Producto'] ? `<strong>Categoría:</strong> ${producto['Categoría del Producto']}<br>` : ''}<strong>Forma:</strong> ${producto['Forma Farmacéutica']}<br><strong>Presentación:</strong> ${producto['Presentación Farmacéutica']}<br><strong>Tamaño:</strong> ${producto['Tamaño']} ${producto['Masa']}</p>${producto['Indicación'] ? `<strong>Indicación</strong><p>${producto['Indicación'].replace(/\n/g, '<br>')}</p>` : ''}${producto['Dosis Recomendada'] ? `<strong>Dosis Recomendada</strong><p>${producto['Dosis Recomendada'].replace(/\n/g, '<br>')}</p>` : ''}<strong>Referencia Interna</strong><p>${producto['Referencia Interna']}</p>${producto['Etiquetas de producto'] ? `<strong>Categorías</strong><p><span class="producto-label">${producto.nuevoEpithelium ? 'Nuevo Epithelium' : producto['Etiquetas de producto']}</span></p>` : ''}`;
    modal.classList.add('active');
}

// MATERIAS PRIMAS
function limpiarFiltrosMP() {
    document.getElementById('mpSearchName').value = '';
    document.getElementById('mpSearchUso').value = '';
    document.getElementById('mpFilterEtiqueta').value = '';
    filtrarMP();
}

function inicializarFiltrosMP() {
    const select = document.getElementById('mpFilterEtiqueta');
    select.length = 1;
    // Categorías presentes en las materias primas (principal o secundaria), en orden alfabético
    const cats = [...new Set(materiasPrimas.flatMap(m => [m['Categoria Principal'], m['Categoria Secundaria']]).filter(c => c && categorias[c]))]
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    llenarDatalist('dlUsos', opcionesUnicas(materiasPrimas.flatMap(usosDe)));
    cats.forEach(e => {
        const option = document.createElement('option');
        option.value = e;
        option.textContent = e;
        select.appendChild(option);
    });
}

function filtrarMP() {
    const searchName = normalizar(document.getElementById('mpSearchName').value);
    const searchUso = normalizar(document.getElementById('mpSearchUso').value);
    const filterCategoria = document.getElementById('mpFilterEtiqueta').value;
    materiasPrimasFiltradas = materiasPrimas.filter(m => {
        const matchName = normalizar(m['Nombre']).includes(searchName);
        const textoUso = normalizar(m['Uso Terapéutico y Cosmético'] + ' ' + m['Identificación Técnica']);
        const matchUso = !searchUso || textoUso.includes(searchUso);
        const matchCategoria = !filterCategoria || m['Categoria Principal'] === filterCategoria || m['Categoria Secundaria'] === filterCategoria;
        return matchName && matchUso && matchCategoria;
    });
    mostrarResultadosMP();
}

function mostrarResultadosMP() {
    const container = document.getElementById('mpResultados');
    container.innerHTML = '';
    if (materiasPrimas.length === 0) {
        container.innerHTML = '<div class="no-results">No se pudieron cargar los datos. Revisa tu conexión a internet.<br><button class="btn-nuevo" style="margin-top:15px" onclick="reintentarCarga()">Reintentar</button></div>';
        return;
    }
    if (materiasPrimasFiltradas.length === 0) {
        container.innerHTML = '<div class="no-results">No se encontraron materias primas</div>';
        return;
    }
    materiasPrimasFiltradas.forEach(m => {
        const card = document.createElement('div');
        card.className = 'producto-card mp-card';
        card.onclick = () => mostrarDetalleMP(m);
        const uso = m['Uso Terapéutico y Cosmético'];
        const cats = categoriasDe(m).map(c => `<span class="mp-chip" style="background:${rgbaCategoria(c, 0.2)};color:${textoLegible(colorCategoria(c))}">${c}</span>`).join('');
        card.innerHTML = `<span class="mp-barra" style="background:${barraCategorias(m)}"></span><h3>${m['Nombre']}</h3>${cats ? `<p class="mp-chips">${cats}</p>` : ''}${m['Concentración de Uso'] ? `<p><strong>Concentración:</strong> ${m['Concentración de Uso'].split('\n')[0]}</p>` : ''}${uso ? `<p style="font-size: 12px; color: #999; margin-top: 8px;">${uso.length > 100 ? uso.substring(0, 100) + '...' : uso}</p>` : ''}`;
        container.appendChild(card);
    });
}

function mostrarDetalleMP(m) {
    temaModal('theme-mp');
    const modal = document.getElementById('modalDetail');
    const content = document.getElementById('detailContent');
    // Fondo tenue con el color de la categoría principal
    const box = document.querySelector('#modalDetail .modal-content');
    box.style.background = fondoCategoria(colorCategoria(m['Categoria Principal']));
    const bloque = (titulo, texto) => texto ? `<strong>${titulo}</strong><p>${texto.replace(/\n/g, '<br>')}</p>` : '';
    const cats = categoriasDe(m);
    const verRef = modoUsuario === 'equipo' || modoUsuario === 'comercial';
    // Categorías como etiquetas: al tocarlas se muestra su descripción
    const chips = cats.map(c => `<button type="button" class="mp-chip mp-chip-btn" style="background:${rgbaCategoria(c, 0.2)};color:${textoLegible(colorCategoria(c))};border-color:${rgbaCategoria(c, 0.5)}" onclick="mostrarCatDesc('${c.replace(/'/g, "\\'")}')">${c}</button>`).join('');
    content.innerHTML = `<h2>${m['Nombre']}</h2>${cats.length ? `<div class="mp-cats">${chips}</div><div id="mpDescBox" class="mp-desc" hidden></div>` : ''}${bloque('Identificación Técnica', m['Identificación Técnica'])}${bloque('Uso Terapéutico y Cosmético', m['Uso Terapéutico y Cosmético'])}${bloque('Concentración de Uso', m['Concentración de Uso'])}${verRef ? bloque('Referencia Interna', m['Referencia Interna']) : ''}`;
    modal.classList.add('active');
}

// Muestra la descripción de una categoría al tocar su etiqueta en el detalle
function mostrarCatDesc(nombre) {
    const box = document.getElementById('mpDescBox');
    if (!box) return;
    const cat = categorias[nombre];
    const texto = cat && cat.descripcion ? cat.descripcion : '';
    if (box.dataset.cat === nombre && !box.hidden) {
        box.hidden = true;
        box.dataset.cat = '';
        return;
    }
    box.innerHTML = `<strong style="color:${textoLegible(colorCategoria(nombre))}">${nombre}</strong><p>${texto}</p>`;
    box.style.borderColor = rgbaCategoria(nombre, 0.5);
    box.dataset.cat = nombre;
    box.hidden = false;
}

function cerrarModal() {
    document.getElementById('modalDetail').classList.remove('active');
}

window.onclick = function(event) {
    const modal = document.getElementById('modalDetail');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
}

// ACTUALIZACIÓN DE LA APP
// Revisa si hay una versión nueva publicada y ofrece recargar (evita quedarse con la versión guardada en el celular)
async function revisarVersion() {
    try {
        const resp = await fetch('version.txt?t=' + Date.now(), { cache: 'no-store' });
        if (!resp.ok) return;
        const publicada = (await resp.text()).trim();
        if (publicada && publicada !== APP_VERSION) document.getElementById('avisoVersion').classList.add('visible');
    } catch (e) { /* sin conexión: se revisa después */ }
}

function actualizarApp() {
    location.replace(location.pathname + '?v=' + Date.now());
}

document.addEventListener('DOMContentLoaded', revisarVersion);
document.addEventListener('visibilitychange', () => { if (!document.hidden) revisarVersion(); });
