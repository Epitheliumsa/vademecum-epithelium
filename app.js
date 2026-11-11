// CONFIGURACIÓN
// Versión publicada: al cambiar, la app ofrece actualizarse (se genera junto con version.txt)
const APP_VERSION = '202611061541';

// Usuarios internos de Epithelium. Los que tienen "zona" son comerciales y solo
// ven el portafolio de los clientes de esa zona; los que no tienen zona ven el
// portafolio de clientes completo. El médico no ve portafolio de clientes.
const USUARIOS_INTERNOS = [
    { clave: 'EPITHE-000', tipo: 'equipo', zona: null },   // General equipo (usuario vacío)
    { clave: 'EPITHE-001', tipo: 'medico', zona: null },   // Médico (usuario vacío)
    // nombre, cargo y detalle: el saludo del inicio, igual que en Ruta Comercial
    { usuario: 'M.Castro',    clave: 'MC17',    tipo: 'comercial', zona: 'Zona Desarrollo', nombre: 'Maryi Castro', detalle: 'Visitador Médico Comercial · Zona Desarrollo' },
    { usuario: 'H.Reyes',     clave: 'HR75',     tipo: 'equipo', zona: null, nombre: 'Hernán Reyes', detalle: 'Gerente General' },
    { usuario: 'L.Ramos',     clave: 'LR73',     tipo: 'comercial', zona: 'Zona Norte', nombre: 'Lizeth Ramos', detalle: 'Visitador Médico Comercial · Zona Norte' },
    { usuario: 'Y.Caballero', clave: 'YC11', tipo: 'comercial', zona: 'Zona Sur', nombre: 'Yunelis Caballero', detalle: 'Visitador Médico Comercial · Zona Sur' },
    { usuario: 'J.Herrera',   clave: 'JH38',   tipo: 'equipo', zona: null, nombre: 'Jennifer Herrera', detalle: 'Coordinadora Comercial · Clientes Especiales' },   // Jefe comercial: ve todas las zonas
    // Logística: entran solo desde Ruta Comercial. Se guarda únicamente el código de acceso (SHA-256), no su clave
    { usuario: 'J.Arjona',  acceso: '87c883cb1dc60eeeb1f44b8cd783395d72f7c390593a9a97dfed9cff029711b0', tipo: 'equipo', zona: null, nombre: 'Javier Arjona', detalle: 'Coordinador Logístico' },
    { usuario: 'E.Ovalle',  acceso: 'ce7f5ae557bb5d72633b63e7366573b914d1967646bfdeb3b22e851d1cc060ad', tipo: 'equipo', zona: null, nombre: 'Eric Ovalle', detalle: 'Auxiliar de Domicilios y Mensajería' },
    { usuario: 'D.Barrero', acceso: '0db57b165dd9406abd8a3740e969fe9a0a4baa8651d8d290966003f0ff131349', tipo: 'equipo', zona: null, nombre: 'Deelan Barrero', detalle: 'Auxiliar de Domicilios y Mensajería' },
    // Mercadeo: entra desde Ruta Comercial y ve todos los portafolios
    { usuario: 'E.Rodriguez', acceso: 'fad82eabb9c7b42312c3345b6a0cd8f26022e5d82c0af2db36013c9169efce98', tipo: 'equipo', zona: null, nombre: 'Erika Elena Rodriguez', detalle: 'Jefe de RRHH y Mercadeo' }
];
// Invitados: clientes externos con acceso al perfil Médico, con vencimiento y marca de agua con su nombre.
// El repositorio es público: aquí solo va la huella (PBKDF2-SHA256 lento y con sal de "usuario:clave"), nunca la clave.
// La clave es aleatoria de 8 caracteres (se escribe sin importar mayúsculas). Para retirar un acceso, se borra su fila.
// `solo`: lista de lo único que ve en el inicio (lo-nuevo, epithelium, producto-terminado, materias-primas); sin `solo` ve todo.
// Si el invitado también es cliente, `portafolio` es la huella de su vademécum de cliente (portafolios/<huella>.json).
const INVITADOS = [
    { usuario: 'dermaplast', sal: '1684fd48ba2a42c2d5b5a13bab8b3443', iter: 300000, huella: 'ccd8c24740608f439a9c2ea40642d3195fbacf34e45c62e0589c81fbcdceabb3', tipo: 'medico', zona: null,
      nombre: 'Centro Medico de Especialistas Dermaplast S.A.S.', detalle: 'Acceso personal' },
    { usuario: 'scerquera', sal: '1fd166bba7c7cd33cad1e75a661c8b3e', iter: 300000, huella: 'b7734fb7e12138e5804883a695e1bdd690643948e243b5f2297bb03b18479314', tipo: 'medico', zona: null,
      nombre: 'Sandra Janeth Cerquera', detalle: 'Acceso personal', portafolio: '0adc1cc18e15aa88522b6480' },
    { usuario: 'ecossio', sal: '7994d53cb2a7f19d18796b058b0d238f', iter: 300000, huella: '0c6030d0b6622cc20d2c7d2eaeea3ba7d22248872cd18cae5794fa982713e515', tipo: 'medico', zona: null,
      nombre: 'Edgar Yarleyson Cossio Contrera', detalle: 'Acceso personal', portafolio: 'd1121d754bb41f832b564089' },
    { usuario: 'farmaciainst', sal: '3a87b7d54c2e7b1f36ca5b647c15de0c', iter: 300000, huella: 'ac89560ae2638db01e6bdb30b7d3819072b1a9aca253e5717d36b102c9fe1b58', tipo: 'medico', zona: null,
      nombre: 'Farmacia Institucional', detalle: 'Acceso institucional' },
    { usuario: 'npena', sal: '54cc522c7b7c1609366c16da9588d09a', iter: 300000, huella: '1ef1ccfb2eb8debb9bef4012b16404dc9ffe052bee26b3e6aaaf7bf3ee439bea', tipo: 'medico', zona: null,
      nombre: 'Dr. Néstor Peña Rodriguez', detalle: 'Acceso personal', portafolio: 'b37fbc991b082c7467ed88b8' },
    // Con varias tiendas: `portafolios` (lista de huellas); en el inicio entra por la lista de sus clientes
    { usuario: 'nhernandez', sal: '4476cddd0ef4e67e3e4c58e8c62f6199', iter: 300000, huella: '24ecb8b15617d05cdf84c772197599eaed88dd6c2c6789ee80b7a90e175f4736', tipo: 'medico', zona: null,
      nombre: 'Dra. Natalia Hernandez Mantilla', detalle: 'Acceso personal', portafolios: ['ebf1dcc8f814705f9180970c', 'e4d0056914bd30e3ac9916fe'] },
    { usuario: 'cdfll', sal: '8630c1f626146e35e5053cc26add4463', iter: 300000, huella: '3685037290cda41ba11f1e19ecd01e080711bfa4288c7fb312f434aff7fbad67', tipo: 'medico', zona: null,
      nombre: 'Centro Dermatológico Federico Lleras Acosta (CDFLL)', detalle: 'Acceso institucional', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'alejandrosolano', sal: '9818acca2ea0518a8f99a6197bb9fad6', iter: 300000, huella: '8d9b00d4db92c72be4a1b778a12e96b68ada42efc2cc33b64e850e0dd54ba73f', tipo: 'medico', zona: null,
      nombre: 'Alejandro Cacasbuenas Solano', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'anasegura', sal: '408400162210529586968f296b7f9011', iter: 300000, huella: 'b94e71be60ddbe3b5da2ff72fec44be86788e162e781e3899d0bec9b2dbe4c9f', tipo: 'medico', zona: null,
      nombre: 'Ana Maria Jimenez Segura', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'carolinagiraldo', sal: '595bfc40e1a4bcd9f5dc8e1599f9aef1', iter: 300000, huella: '593c5c8260fab7e2f9614e98558c77cb16a8c588810dfa45c2cd770f1426951a', tipo: 'medico', zona: null,
      nombre: 'Carolina Hernandez Giraldo', detalle: 'Acceso personal', portafolio: '2c42a4dc251349de04082b09' },
    { usuario: 'dianavelasco', sal: '2d4410f9aa1da91082ad51b3c0d846ab', iter: 300000, huella: 'efd183b6415b26e5582b51e6d2b80ff16380fcce244504a734377b38f7b2f766', tipo: 'medico', zona: null,
      nombre: 'Diana Marcela Méndez Velasco', detalle: 'Acceso personal' },
    { usuario: 'dianahernandez', sal: '2eb9f3c99316aba6bfb87a221d7e2296', iter: 300000, huella: 'f907eb3f2669cefbd85da13ea91073bbe63a319a52b690a5850923d07b8a52de', tipo: 'medico', zona: null,
      nombre: 'Diana Marcera Espitia Hernandez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'dianadiaz', sal: '182e30f7b3d4faa1a3a940e527f73853', iter: 300000, huella: 'aed5c4f1566a635e50f69f3046c25cab636b7aa586be8006bd0675913038ca6c', tipo: 'medico', zona: null,
      nombre: 'Diana Patricia Crison Diaz', detalle: 'Acceso personal' },
    { usuario: 'gabrielanavarrete', sal: 'd1a36c7316f6b187b782e963fd77c7f1', iter: 300000, huella: '409691bcf1a852439a8d2970a6ab43f197ccb4ae4e013ef1da3c91c6ed861f6e', tipo: 'medico', zona: null,
      nombre: 'Gabriela Fuentes Navarrete', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'gabriellafranco', sal: '4477b4b2629f05fefc5769b5aa7a9552', iter: 300000, huella: '06cbc3a4949acded3057f52218f6e978f007a3a52728dafd6e4046cd1be7266d', tipo: 'medico', zona: null,
      nombre: 'Gabriella Gonzalez Franco', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'isabeladorado', sal: '3586bbc5a937c323042dad8784f1f2d9', iter: 300000, huella: '53afc561933724fe99005caf9f93d24b395eda25e575bbe668e80ef04f239702', tipo: 'medico', zona: null,
      nombre: 'Isabela Dorado', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'juanaristizabal', sal: '6c4c643a012cebbbf8e361c52be649d1', iter: 300000, huella: 'fa555a8dd5c1c724266a17e2bb6c34a20e155f19c6abbaad5a5565f1f158a8c2', tipo: 'medico', zona: null,
      nombre: 'Juan Aristizábal', detalle: 'Acceso personal' },
    { usuario: 'juancausland', sal: 'de2799915ba7c24ec585f7cf01dc1389', iter: 300000, huella: '26b3dc99227c881772ea081bc9a5c373c004c3c2f98d9bdee942e533984abc38', tipo: 'medico', zona: null,
      nombre: 'Juan Camilo Parra Mc Causland', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'juanbermudez', sal: '8d89e22fca423194da445614f5887404', iter: 300000, huella: '547b655824c15f9388ffd374013a3d05852eb8b1341700f5f9fc14a7bdc8da53', tipo: 'medico', zona: null,
      nombre: 'Juan Felipe Ochoa Bermudez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'juanitamontero', sal: '71ff9921464df42ad0296b399192b4ab', iter: 300000, huella: '90d3d02e3b1040c8b5fdc5765e789d4e88bfaeddccaff6be55afbad1f56c9575', tipo: 'medico', zona: null,
      nombre: 'Juanita Valentina Montealegre Montero', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'julianagutierrez', sal: '19e795a9081d7eaf31fd54905cfebde0', iter: 300000, huella: 'b3915ca182407629e2a56048f1b85c2c9cb2a542214f5082b56d4738dfa57717', tipo: 'medico', zona: null,
      nombre: 'Juliana Silva Gutierrez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'juliodiaz', sal: '1a86108c559ed9cd5443dfa399851567', iter: 300000, huella: '2683492da7637415d08987b543762b30482eacafbf179b4b260851ec6ea62ecd', tipo: 'medico', zona: null,
      nombre: 'Julio Alberto Arias Diaz', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'karenmendez', sal: '5a56922f8a0a88ccd95e269aa5ba9fbc', iter: 300000, huella: '058d18fd5f8ade5677a503cdcb57001b78cc39829f3998173afb5abebda98be0', tipo: 'medico', zona: null,
      nombre: 'Karen Viviana Arevalo Mendez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'laurasuarez', sal: '9b055132279f1bf69c6ebf2644dcb1e1', iter: 300000, huella: '8d672ec884d25e0a57448e82e1407f08f077ecf5d173e0aa710c34a4baa1afeb', tipo: 'medico', zona: null,
      nombre: 'Laura Rodriguez Suarez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'luissuarez', sal: 'c207231ddb5b9b373c3e35cf7a5b81fd', iter: 300000, huella: '83388ca2fad4600920ca7ed69ae988a3a7967443663b1fb4dc52fa0675babec0', tipo: 'medico', zona: null,
      nombre: 'Luis Arturo Gamboa Suarez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'luisalonso', sal: '62435d3cf0360890323ae002e7cf51f4', iter: 300000, huella: '1cbb7ace935ee046c316b17708c0eac4d5bcb51d2d73a683cd03145edb516a15', tipo: 'medico', zona: null,
      nombre: 'Luis Carlos Garcia Alonso', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'luiscaceres', sal: '8ae4de3c0a70c28d8595dbb08aaa1849', iter: 300000, huella: '9651ba3e4959bc60ebb0ef69104765c41bc048107824f320695a199b3731b1be', tipo: 'medico', zona: null,
      nombre: 'Luis Daniel Perez Caceres', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'mabymunoz', sal: '8039bbfbc3a33fe23757dd784d1de103', iter: 300000, huella: '138fd66dce4fb257e946ec38655aa05d83c64808925398f6eaaec979437bdb4f', tipo: 'medico', zona: null,
      nombre: 'Maby Andrea Alvear Muñoz', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'mariacadavid', sal: '564ae09cf58d63001d05034367ae7b37', iter: 300000, huella: '0bb52ed897044b613afa683cbf2c779e7e11fa3ac1c0fde82a8f6c4a5f920ede', tipo: 'medico', zona: null,
      nombre: 'Maria Adelaida Restrepo Cadavid', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariacausland', sal: 'd3ba0ea45737ba63590d9fda3d9fd840', iter: 300000, huella: '5d25f28d8dfd45fa0523e25111b016d4977e035bd9bdcaf1abd5ee08bd5c18a4', tipo: 'medico', zona: null,
      nombre: 'Maria Paula Muñoz Mc Causland', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'mariahernandez', sal: '0963a276c69e92a58c5cdc33643b51cb', iter: 300000, huella: 'aa0e071ec9c006b4c01656c2012978deeaaa9ac865e70f239114e5c53594b617', tipo: 'medico', zona: null,
      nombre: 'Maria Valentina Oliver Hernandez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'marlygomez', sal: 'c48b6fdafc24d4b27399f5783d76944c', iter: 300000, huella: '51959510bb9160e36c4bb2c769a404842745bdbe3b3d490e22de5f8cd333fe10', tipo: 'medico', zona: null,
      nombre: 'Marly Milena Martínez Gómez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'marthamesa', sal: '6a0fc02b7c8e2003cb307022e8506255', iter: 300000, huella: '73c7e29dafd9a40b9bdfc8bd71a8fdf0fb372c8ceb6b4d1831fec5575e87aae8', tipo: 'medico', zona: null,
      nombre: 'Martha Cecilia Valbuena Mesa', detalle: 'Acceso personal' },
    { usuario: 'nataliaarteaga', sal: 'cb033924737a24629e2ba219790890e8', iter: 300000, huella: 'a3e3913f969f5ae45b89963fd5bbf0932fe1c9dacfa533ab03fcd269435f4341', tipo: 'medico', zona: null,
      nombre: 'Natalia Elena Plaza Arteaga', detalle: 'Acceso personal' },
    { usuario: 'nicolaspardo', sal: 'e6b9f1b8cb04c87af61920cf015ebda5', iter: 300000, huella: '0e0b4594f601bb0e2c64c9c415eb1cd7b72ead195f1e03d3a699bd8431a67c7c', tipo: 'medico', zona: null,
      nombre: 'Nicolas Donato Pardo', detalle: 'Acceso personal' },
    { usuario: 'paolahernandez', sal: '7762cc9928d49c38e5a54f3aefefc909', iter: 300000, huella: 'aa48ffa60dfa866e65cba9963f64272b1ba192f46b4b01a8c69017b34923ce20', tipo: 'medico', zona: null,
      nombre: 'Paola Estefania Falla Hernandez', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'piedadguavita', sal: '80c1581b227d3bdcd884b9a40b0afa22', iter: 300000, huella: '3f8d833b83de0ac66a2908c7c5e1583ff9320e83afa2917c63d761e4314460d0', tipo: 'medico', zona: null,
      nombre: 'Piedad Marcela Guavita', detalle: 'Acceso personal' },
    { usuario: 'raquelbravo', sal: '8c597fa6f0beb3762ee444d5d2c3e7da', iter: 300000, huella: '6d781a250badce2924e42b8a36c09836ea0436a06c28f5215cbd89ead66edbb4', tipo: 'medico', zona: null,
      nombre: 'Raquel Rebeca Erazo Bravo', detalle: 'Acceso personal' },
    { usuario: 'vanessachicre', sal: 'f90717f7edd4934059acbc00ad0e0102', iter: 300000, huella: 'e58ba25a2ef2cc522cad0cb474c35b23b7e77cc6f7540a5da2762cd9ff3580ce', tipo: 'medico', zona: null,
      nombre: 'Vanessa Alexandra Gomez Chicre', detalle: 'Acceso personal', solo: ['producto-terminado', 'materias-primas'] },
    { usuario: 'ximenamejia', sal: 'dad37cdd76f9394fa9152ee8faad7ae4', iter: 300000, huella: 'c51831854981d0a8134a258e44c3fc889f0d899157e302e9c761f87407c573a4', tipo: 'medico', zona: null,
      nombre: 'Ximena Paola Berreneche Mejía', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'edinsonpreciado', sal: '042da37d15eb651392ae7d8a94aa9d33', iter: 300000, huella: 'daf32f368974a0660a9f90b9916ba289a3289eacbc6a56f1feb86a18c29e3de3', tipo: 'medico', zona: null,
      nombre: 'Edinson Andres Sanchez Preciado', detalle: 'Acceso personal' },
    { usuario: 'edgarcontrera', sal: 'd755c0d9860391dfd0cb8f1266083f5f', iter: 300000, huella: '6e430e4a3cbfc1d008b1e39f6e91bc0f81de137ce47624c6b76c2c1412fe918a', tipo: 'medico', zona: null,
      nombre: 'Edgar Yarleyson Cossio Contrera', detalle: 'Acceso personal' },
    { usuario: 'floryate', sal: '01556a5d76765520ac10caca90b9a8d7', iter: 300000, huella: 'd6b94350c5f49f39f50b8e09805a6fd8932bb38213002d828260ffc812abae4c', tipo: 'medico', zona: null,
      nombre: 'Flor Marina Camargo Yate', detalle: 'Acceso personal' },
    { usuario: 'yelencazamora', sal: 'b793ae22eec3c176af5163c1b3d55b59', iter: 300000, huella: '53e4226a30baa82b147dcfe1315a23871150565c21f56da9005109b50dff9db1', tipo: 'medico', zona: null,
      nombre: 'Yelenca Ortega Zamora', detalle: 'Acceso personal' },
    { usuario: 'adrianamotta', sal: '9a3580a38430a28c22c97e14dda40fed', iter: 300000, huella: 'f17099a9eb0c7c1612d0f5b31c04b234a3153ebedff5c0b5c7c71bc444fa785d', tipo: 'medico', zona: null,
      nombre: 'Adriana Motta', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'alejandraarboleda', sal: '313463e0c7aa568b8174cac9fe2c121b', iter: 300000, huella: '26ad56ad4b4defe0afd1cfd784059d391eb6809c1d49749a9d720145fbc7a0c7', tipo: 'medico', zona: null,
      nombre: 'Alejandra Jaramillo Arboleda', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'alejandracardona', sal: 'b45a9bd173a92061c04d8c9456ec655e', iter: 300000, huella: '7a1d92471e93e201a3d2a650ad23ced697846745fc195321d89eac55e789217d', tipo: 'medico', zona: null,
      nombre: 'Alejandra Zuluaga Cardona', detalle: 'Acceso personal', portafolio: '9ae6334cba820118b54d0ecf' },
    { usuario: 'anabravo', sal: 'b01a529e7a6cb0743fa38b1a4d534e7d', iter: 300000, huella: '011d75997882a0842f883a5c80dbb960e11a666c8fb45e8e3f2a1a45f7e2cace', tipo: 'medico', zona: null,
      nombre: 'Ana Maria Bravo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'anaguerra', sal: '43e705074ae09568f255c9235ad85aa3', iter: 300000, huella: '1f275c7b909adcf7931d5b798e7aaf8f2372a4526fbbbd2d1124732b62e853d1', tipo: 'medico', zona: null,
      nombre: 'Ana Maria Guerra', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'anaolivares', sal: 'adc889895555758209e23ea15457978f', iter: 300000, huella: '6af0caef844bc866daa666a8987fc927a8fd134eb980e38376d96c85508b028e', tipo: 'medico', zona: null,
      nombre: 'Ana Maria Ortiz Olivares', detalle: 'Acceso personal', portafolio: 'a6c0bba94c86764fb8c0e6bd' },
    { usuario: 'anaruiz', sal: '4f2467bc5ef32a2d8dd38eca6f6385d9', iter: 300000, huella: '76c6a5c68c36cb5a6b707f6907150e1148d7fd5e1353bea535d0cbc6228bb005', tipo: 'medico', zona: null,
      nombre: 'Ana Maria Sarmiento Ruiz', detalle: 'Acceso personal' },
    { usuario: 'andreamendez', sal: 'ae55ecea4d87b4fffd5fc2373f2c35d5', iter: 300000, huella: '1ce18fcfd7401c92e792c9f52323b9695d3c06f13df17a28a0efd714fc3fc60e', tipo: 'medico', zona: null,
      nombre: 'Andrea Brigitte Diaz Mendez', detalle: 'Acceso personal' },
    { usuario: 'andreijimenez', sal: '037a6aa495dce37d5052e11e23985ce7', iter: 300000, huella: '07dab5af9a9b72397b74227ed676e759ef3828696e5544819d95bac004066b5e', tipo: 'medico', zona: null,
      nombre: 'Andrei Julian Enciso Jimenez', detalle: 'Acceso personal' },
    { usuario: 'andresgrueso', sal: '79eaeb8c6a848fa777bf026a364fd1d5', iter: 300000, huella: '9eb14ac9968605fcbca67e9336a44d074658d7282e264c9d708cab9d6c482574', tipo: 'medico', zona: null,
      nombre: 'Andres Grueso', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'angelicaduarte', sal: 'a603ba96ae25907b25ab6fc65a99a76e', iter: 300000, huella: '1e97bd6fbe9ebd0ee688b89f61951e29835241d39e14435b14d7b311de3b1d27', tipo: 'medico', zona: null,
      nombre: 'Angelica Maria Dominguez Duarte', detalle: 'Acceso personal', portafolio: '0d8d66a916a048ea4d6e85f8' },
    { usuario: 'beatrizgomez', sal: '857210f1824e5dff43e9416f8d0fbe0c', iter: 300000, huella: 'b686ed8918002cfb6de15e2184aa7c9ffb920df6e6a555f7eaffbfbf90e13a6b', tipo: 'medico', zona: null,
      nombre: 'Beatriz Eugenia Tobon Gomez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'beatrizrodriguez', sal: 'ceb59bfe6af40a866e2806c8ebc6298b', iter: 300000, huella: 'a6cc4217166f2920fdd00d52e1ef6c2f9d47d35c21d2b0d43b1754d0a6ff1844', tipo: 'medico', zona: null,
      nombre: 'Beatriz Ofelia Armand Rodriguez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'carlosrodriguez', sal: 'de9137f4b8b7eb30f70d23f48e2ec851', iter: 300000, huella: '47f92e6bdee2aa0f75b95bb13042dccca88752a148f165c9ff8c676517cec980', tipo: 'medico', zona: null,
      nombre: 'Carlos Mauricio Rodriguez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'carolinavalencia', sal: 'aaaf1342108ff60b47607b14faa352e9', iter: 300000, huella: 'c6b027992c2fcac3cf929623ef03132b1075693307cfd91babc90fec332215f7', tipo: 'medico', zona: null,
      nombre: 'Carolina Alejandra Palacio Valencia', detalle: 'Acceso personal', portafolio: '58a6646b45d040b5c95f9c04' },
    { usuario: 'carolinafigueredo', sal: '4eabbced414e5dea6f3389850ec0606d', iter: 300000, huella: 'bd8172e24608da40fbe29bfe91560c11e4d3d4267653712d58aa1c23bf10f19d', tipo: 'medico', zona: null,
      nombre: 'Carolina Campos Figueredo', detalle: 'Acceso personal' },
    { usuario: 'carolinasolorzano', sal: 'c76604178af3066b495b0fbd18f33695', iter: 300000, huella: '0ebfa858248ed102252eb57fd4bbf3d72e1cdcf102c400591941c45e9dd1303c', tipo: 'medico', zona: null,
      nombre: 'Carolina Solorzano', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'claudiarochel', sal: 'e55dca7491e64442271dca52570f6833', iter: 300000, huella: '33fd0a19cb2a66214b853d7da837195a4a55b7d1a26434e796fc8ac297c1415b', tipo: 'medico', zona: null,
      nombre: 'Claudia Rochel', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'carolvelandia', sal: '91fda439f926c673847b7d034aba8d98', iter: 300000, huella: '23e54a89184d9b9c53e16301bd6381e776e8c58b325f0666b406a7667c4cf6c4', tipo: 'medico', zona: null,
      nombre: 'Carol Vanessa Messa Velandia', detalle: 'Acceso personal', portafolio: 'bbea6c4b3b9f4166f45b0f9a' },
    { usuario: 'bettyflorez', sal: 'a76bc6d9e7ce8e9664ad743419a2154f', iter: 300000, huella: 'cf6052089a16187c11233f94d6c52ceec2eb81559b363087838edcd83d7f46b9', tipo: 'medico', zona: null,
      nombre: 'Betty Carolina Riaño Florez', detalle: 'Acceso personal' },
    { usuario: 'constanzafigueroa', sal: '0d78d843093d917c63e3d8f6589f7499', iter: 300000, huella: '524f0609d4cd232d15008671d48de93be41c72a2b8090e2324ee9b0c08d9470e', tipo: 'medico', zona: null,
      nombre: 'Constanza Eugenia Tejada Figueroa', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'constanzaospina', sal: '9a71ca130f79c013587d36d7700e3575', iter: 300000, huella: '6227182e3612e8c6ccd3cbde1e55d776584951e956f4d9d4b80c5cdec14b8b47', tipo: 'medico', zona: null,
      nombre: 'Constanza Ofelia Mancera Ospina', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'danielalozada', sal: '9d253e6e75527fcbdb6eac1fa3ad082c', iter: 300000, huella: 'a7ca3301022cec0f56decc1b3a1ef193cb1d2561a21c8b383e37911776d11e09', tipo: 'medico', zona: null,
      nombre: 'Daniela Perez Lozada', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'darioguillen', sal: 'ad53c1ec1dca5c19f918986d8fd2467b', iter: 300000, huella: '047f745c8aecf178dfa21559bca0dc71d3f478780499d1b174ec5d18d1fae545', tipo: 'medico', zona: null,
      nombre: 'Dario Alberto Burbano Guillen', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'deladiethrincon', sal: '548da458ce0f9f464d88045bdd3224c6', iter: 300000, huella: '2f09a3446f231005f8e6323d092e61e0d39e34d4e701124c8e7370ed8d8ce3cc', tipo: 'medico', zona: null,
      nombre: 'Deladieth Serrano Rincon', detalle: 'Acceso personal', portafolio: 'a5c8efb0c158d9f68e3b4c50' },
    { usuario: 'dianacruz', sal: '7f57e61bdc3bf8c94562420de8085dbf', iter: 300000, huella: 'db832f08e00ad74196ab4e99912c862128380ae4fb8a3f9b19524444816ebfae', tipo: 'medico', zona: null,
      nombre: 'Diana De La Cruz', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'dianabocanegra', sal: 'aa28080156e5148f6485c0c272e30933', iter: 300000, huella: 'aeb1cdc5ce9af270d437476bb095021176529da667296afca7008b4663ed40dc', tipo: 'medico', zona: null,
      nombre: 'Diana Elizabeth Reyes Bocanegra', detalle: 'Acceso personal', portafolio: '3b0b1b56164f497ede259bf2' },
    { usuario: 'dianainfante', sal: '7415875443c20ff755aa98ab21b44908', iter: 300000, huella: '63e04df8a6103e95b3eb4f053eca917b74fd4781e68e3a4debbdc3e5236a8ff9', tipo: 'medico', zona: null,
      nombre: 'Diana Infante', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'dianaserrano', sal: '84ab9cdd8c8707cf65ffa61ee73825f4', iter: 300000, huella: 'bb26e3f985b5b102693ce11ab16a9691c652df895bdb3f684957bea62d4ff35c', tipo: 'medico', zona: null,
      nombre: 'Diana Margarita Amaya Serrano', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'dianacuadrado', sal: '639280dd0a00b3d5604eba52cb752ff4', iter: 300000, huella: '956c0f3120c65c9620f5ab250d9a49be4067daf0ed4dde5b66bd728e8ce1f61e', tipo: 'medico', zona: null,
      nombre: 'Diana Maria Lastra Cuadrado', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'doraosorio', sal: '0e3f2caeb5c14ade6eb9d2730504b6fb', iter: 300000, huella: 'f5bdecfd04eb4dedf565ac402d6f060f6121c4bbf2136759ab9534372ecd8cf0', tipo: 'medico', zona: null,
      nombre: 'Dora Luz Fonseca Osorio', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'eduarlechtig', sal: '181f2645c459bc7ce7998a1b2a206657', iter: 300000, huella: 'e58e7f3628e6368556bc602a3668e35d54e341dd1035c4743832005edc8f929d', tipo: 'medico', zona: null,
      nombre: 'Eduar Bladimir Rodriguez Lechtig', detalle: 'Acceso personal' },
    { usuario: 'edwinmartinez', sal: 'a050b6cd8175adbe256b7fa42672debd', iter: 300000, huella: 'da11aa40cb335723c7213debb85a0e906f50cd92b4fab2118c9b52228e442976', tipo: 'medico', zona: null,
      nombre: 'Edwin Bendek Martinez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'elianamerlo', sal: '681466d869184a72268839f440c994e1', iter: 300000, huella: 'e9f2d7b9c1f0e6bbef98b0153f8d5f66ad9768c2e9d4d61deae04b7497a7f501', tipo: 'medico', zona: null,
      nombre: 'Eliana Andrea Merlo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'elviamartinez', sal: '2c505f2986c4f0b8531c1aa54501d6ab', iter: 300000, huella: 'f40f5a67b89d7b0d74c42a492b5cefe5bb76e21fabc44823a10865a1e177b4b1', tipo: 'medico', zona: null,
      nombre: 'Elvia Zenaida Quevedo Martinez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'erikajaime', sal: '6a3f5550aed099ae2021952cd12ca8fc', iter: 300000, huella: 'ee3182d46fa319609327e1d407b095e04ab6bc3e5319b4b1ad34a1ded74dd019', tipo: 'medico', zona: null,
      nombre: 'Erika Johanna Molina Jaime', detalle: 'Acceso personal', portafolio: 'a5c8efb0c158d9f68e3b4c50' },
    { usuario: 'evelyneziskiend', sal: '06f6769d8112a9081a80452c4d6a7560', iter: 300000, huella: '73f0fdbaf995b01d8a4fdfe9e16a80a1da1adec48c7081460967b0325d709f4e', tipo: 'medico', zona: null,
      nombre: 'Evelyne Halpert Ziskiend', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'felixgonzalez', sal: 'f2c5cd0c586c0a207623029b177bc2f2', iter: 300000, huella: '0aa87f245480d932bd4ff43dc690ad06245212cc0487aa9136087737e7f23293', tipo: 'medico', zona: null,
      nombre: 'Felix Duran Gonzalez', detalle: 'Acceso personal' },
    { usuario: 'francyjimenez', sal: 'eea4e49f2ecfd208078cb572a0beefe1', iter: 300000, huella: 'b63e36be201c3600c710b729f3749107707aea3ac47444bedf5e93715f53ecc0', tipo: 'medico', zona: null,
      nombre: 'Francy Milena Quiceno Jimenez', detalle: 'Acceso personal' },
    { usuario: 'giovannyjimenez', sal: '495080221b8de6923be9ff5def2061f9', iter: 300000, huella: '4c3f7c1d19a1656ab90844cdac0c95df1803ac32c19a5a63c96779556b159484', tipo: 'medico', zona: null,
      nombre: 'Giovanny Antonio Guerra Jimenez', detalle: 'Acceso personal', portafolio: '7d820ca4203a4fc3f429cb40' },
    { usuario: 'giovannycruz', sal: '211d307fe65726e42ced58466306b77e', iter: 300000, huella: 'd1f0d06c37c5c703b79bb7af4b5093e32c4592aab3938420808163c901df7d67', tipo: 'medico', zona: null,
      nombre: 'Giovanny Mera Cruz', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'gonzalogarcia', sal: 'a62b067506751a19e9875a36713e5c5e', iter: 300000, huella: 'c1f1e01b603445a3613df103b44b47bed2ba0f969f71056ac52de1ceb6ea7106', tipo: 'medico', zona: null,
      nombre: 'Gonzalo Garcia', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'hugoherrera', sal: '7fd3f51c880717d4f4443129fa951186', iter: 300000, huella: '951dee13e6b946895f00611af3bdd0e97430aa2bc346d26cb738a4f3b7cab50f', tipo: 'medico', zona: null,
      nombre: 'Hugo Eduardo Herrera', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'ibetcuevas', sal: '6d535ddcf95c65728d258fbbd890ceef', iter: 300000, huella: '7bafc8de860836bb0b4ee02fe40415f8a76564ba7530664a7f672674853206ed', tipo: 'medico', zona: null,
      nombre: 'Ibet Paola Morales Cuevas', detalle: 'Acceso personal', portafolio: '51c47de59d1d3d2167eceee0' },
    { usuario: 'karenussa', sal: '0bf575b12f9f0a47bcb0c2c7d68711dd', iter: 300000, huella: 'eaf741def021d46a11f64acc58a808908197f2cf9c289d0009e71147da436b27', tipo: 'medico', zona: null,
      nombre: 'Karen Lorena Acosta Ussa', detalle: 'Acceso personal', portafolio: '342bb3c130dd1dd24e102016' },
    { usuario: 'jenniferduarte', sal: '4f7c31a036a924aa37cd0b59eee58491', iter: 300000, huella: 'b31459274379585555b9c18d1e36d88ec5045bd0c4ef06ecff656b497a50889b', tipo: 'medico', zona: null,
      nombre: 'Jennifer Duarte', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'jessicacalle', sal: '9d3956d3a06bde75b4f7067af75f6db3', iter: 300000, huella: '3aee5b77668b50ec02c90400974368a2e6991b96ba5879d6d570bd6bf96d0447', tipo: 'medico', zona: null,
      nombre: 'Jessica Vallejo Calle', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'jesusfajardo', sal: 'f92a3a059f0a91edebd2a8b3d3e2a461', iter: 300000, huella: '359d150d367740382cc077d70e328bfaa52c328732f9d1799311a80594150e0f', tipo: 'medico', zona: null,
      nombre: 'Jesus Orlando Dueñas Fajardo', detalle: 'Acceso personal', portafolio: '4cfab82968ef71e41b0e4d6b' },
    { usuario: 'johanguerrero', sal: '148be5db75fa78ecda4f9f6145bce33b', iter: 300000, huella: 'e4a896ccda80bbf167759f1e2fda3933e215176944070fbf7eda9ca7fad7d485', tipo: 'medico', zona: null,
      nombre: 'Johan David Guerrero Guerrero', detalle: 'Acceso personal' },
    { usuario: 'johnmejia', sal: '0e7f032760adeee0159ba5f49ef2cbad', iter: 300000, huella: '54807e2bde4fdc8aa178497fe34ff61cae38a2458d9464581c97a246e23f19ba', tipo: 'medico', zona: null,
      nombre: 'John Alexander Alarcon Mejia', detalle: 'Acceso personal' },
    { usuario: 'juanarango', sal: '9d3107964f60410103e3f2c2307bcefb', iter: 300000, huella: '582d1a489800f12b44e390089882e212e5719f96ecaeeb5f2c1c6e907233319f', tipo: 'medico', zona: null,
      nombre: 'Juan Sebastian Suarez Arango', detalle: 'Acceso personal', portafolio: '42b0bfd98ef84038fac0a404' },
    { usuario: 'julianaluna', sal: '10783609a9ccc699b3eee432d6d815fd', iter: 300000, huella: 'd9615fb1760d5a2555e36bdf720c83e83a6be3d98717dd0e9d52f0227e2397f7', tipo: 'medico', zona: null,
      nombre: 'Juliana Pinzon Luna', detalle: 'Acceso personal' },
    { usuario: 'julygamboa', sal: 'f29420d4e1f4c3e045e9de82a637cd8d', iter: 300000, huella: '3b112e5095ae03513a0a1f0cefa9ae385f311706f505b85494a6fa48dbadf1d2', tipo: 'medico', zona: null,
      nombre: 'July Paola Jimenez Gamboa', detalle: 'Acceso personal' },
    { usuario: 'karenchavez', sal: '1849ba72e3c130c54356a83d62bd46ba', iter: 300000, huella: '7d11b7fbb2452a7dda55be661dd96d970729af9774874d6f0d0890ceee97e414', tipo: 'medico', zona: null,
      nombre: 'Karen Chavez', detalle: 'Acceso personal' },
    { usuario: 'laurasanchez', sal: '2c848ee807e0115253276d0792ef54fc', iter: 300000, huella: 'ee68ca5857b7e16b908133497266cbe6888eab974d87b1905a37e6b362eeff36', tipo: 'medico', zona: null,
      nombre: 'Laura Cristina Avila Sanchez', detalle: 'Acceso personal' },
    { usuario: 'laurahabbit', sal: 'e84283e72811d8e7c7d3515347c86a18', iter: 300000, huella: '7d9fa8901bd236e3752beb6e589f51de4e448f90417c2430d1bf3eec9ae2fc0c', tipo: 'medico', zona: null,
      nombre: 'Laura Habbit', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lauralopez', sal: '253e4bf54cabb7a5baca86e2f55253ed', iter: 300000, huella: '53adf598943ef9aa2c248221733632df9c6a0dd2c4bf12d260f396fc8ca7fcd9', tipo: 'medico', zona: null,
      nombre: 'Laura Tatiana Ortega Lopez', detalle: 'Acceso personal', portafolio: 'a6c0bba94c86764fb8c0e6bd' },
    { usuario: 'leidyvesga', sal: '165b0b14ab7532c157b3ba57c3105057', iter: 300000, huella: 'baca08796a649ce57ea7429d51cbae93d810e00887fd172faa37ad4668c85201', tipo: 'medico', zona: null,
      nombre: 'Leidy Maria Duarte Vesga', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lilianavelasco', sal: '4b82c411439b9fc5a29d865f600ff196', iter: 300000, huella: '5c00c6d091381d9fedc20ca00aaaa2fb8deb948bd67b898e20bb76a9bc17b709', tipo: 'medico', zona: null,
      nombre: 'Liliana Isabel Gonzalez Velasco', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lilianacastaneda', sal: '94c2ec2a7af67caec1fd14f6d251612a', iter: 300000, huella: '357529205caa762a413a26439aa48bd952baa470dd3969e7e36f1067ec851a5f', tipo: 'medico', zona: null,
      nombre: 'Liliana Teresa Mouzo Castañeda', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'linachinchilla', sal: '5f7489637bc2425023856d75f26a8540', iter: 300000, huella: 'fcbfbf70e7f72862805b9f82dea847644e55a41200110ca59cb7748b9b942ca2', tipo: 'medico', zona: null,
      nombre: 'Lina Maria Chinchilla', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'linallanos', sal: 'f27c6fa83aaa634c2bffd50df9d3d6bb', iter: 300000, huella: 'e03f4defc7764bab72299469cd262ce14dfd3baa462279674704a688969de6e7', tipo: 'medico', zona: null,
      nombre: 'Lina Maria Llanos', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lizethsuarez', sal: 'fd40a60c4edabcb5fd02f63fa3ca04fc', iter: 300000, huella: 'a72f9dac42d892328e35e29ae718818602fc17396517cd293084b54dac7ce73c', tipo: 'medico', zona: null,
      nombre: 'Lizeth Daniela Caro Suarez', detalle: 'Acceso personal' },
    { usuario: 'luispenaloza', sal: '52693ea6fd3ab7e525fa7831c0546bdd', iter: 300000, huella: 'd6c80fc71b07b888ea4945d6460378463bd2b81eeb630237602cdec151fc74bd', tipo: 'medico', zona: null,
      nombre: 'Luis Carlos Posada Peñaloza', detalle: 'Acceso personal' },
    { usuario: 'luzospina', sal: 'fdd0a5fe354d284500062c6478d3cd55', iter: 300000, huella: '358f9232d7f0400dc12a0d78544da6d5f43318e37b4f7dd35af4222d845047a0', tipo: 'medico', zona: null,
      nombre: 'Luz Helena Pabon Ospina', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mabelcamacho', sal: 'c3d151bf81b8b647c965676f9e41ac88', iter: 300000, huella: '5eb34fff3a68e86b09dad3646c6bd1a571f5512ef45e183b6b6bcf1e4672f816', tipo: 'medico', zona: null,
      nombre: 'Mabel Yaneth Avila Camacho', detalle: 'Acceso personal', portafolio: 'b5037d0aa5137f8b46d3c086' },
    { usuario: 'manuelfranco', sal: '4b8356eb9b01f5137ecff1ff93079b5b', iter: 300000, huella: '601cc12654f54ca35c36acb6dc5415aeba590dc5b21ba46fffb03665025afd51', tipo: 'medico', zona: null,
      nombre: 'Manuel Dario Franco Franco', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'margaritabarrios', sal: '2d76a3db541a04e00efd005400ec8244', iter: 300000, huella: '90d90885c214afc8a39eb0cd42c4f08357164b8f17d1485ae3c33d04f306d9a7', tipo: 'medico', zona: null,
      nombre: 'Margarita Barrios', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'margaritavargas', sal: 'd5abb5153f8a9c87090451735ca1278b', iter: 300000, huella: '8c67e56f9772b146fff2e79ead3f96b746071f04c8c3452a27f377c947238f8a', tipo: 'medico', zona: null,
      nombre: 'Margarita Vargas', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariachacon', sal: '36dbd13341505404777304aa42bc17e8', iter: 300000, huella: '860110f14403565243b5a0979fa28cf7b75edee3194d9e7d084f7b09a91ec115', tipo: 'medico', zona: null,
      nombre: 'Maria Camila Castillo Chacon', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'marianieto', sal: '4f476ce1a15f9b957ba77d60c9de7407', iter: 300000, huella: '40e921d3f9cb7a2692ebbc537bdf08a6a2b50bbd5e9982347f4e34bdcc9b2a00', tipo: 'medico', zona: null,
      nombre: 'Maria Del Pilar Avellaneda Nieto', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariaarbelaez', sal: '8e51c5a52d48fce0f058b3358f6a9875', iter: 300000, huella: 'ce7a6fa4421a658dc17cfe4e39c4c0789b16f9f40aeb5cd82fb7f076960ae83d', tipo: 'medico', zona: null,
      nombre: 'Maria Isabel Serna Arbelaez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariaparra', sal: 'fdc3fb92a0dd1ebafa95025b272e6794', iter: 300000, huella: '232dea2ccfc0b7388619805eb7be29b94c3092111045ec228765741b51e8eedd', tipo: 'medico', zona: null,
      nombre: 'Maria Jose Giraldo Parra', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariafarias', sal: 'bcd40383ce03049a4fc49654aa4c2819', iter: 300000, huella: 'ac182fa2a9e20f97bd351d0bb080e30c97f12eb3745751a445aab977aa3188dd', tipo: 'medico', zona: null,
      nombre: 'Maria Juliana Farias', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariazapata', sal: 'c50665e1ef6320f91703f9db10c967e3', iter: 300000, huella: 'f391f7b6dc8383fbcda933d6333f4acfa2aaa3b51889960f1297b71626765085', tipo: 'medico', zona: null,
      nombre: 'Maria Juliana Sanchez Zapata', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariamrolon', sal: 'dff2a1dc9358b09397660ece53b86437', iter: 300000, huella: 'e4a947e8653522fe28e314fb23bb2fe30f947047aeba03232d4f4f2ba3c77764', tipo: 'medico', zona: null,
      nombre: 'Mariam Rolon', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'marianavillamizar', sal: '0fdde75321701983a05297c5a4f56acb', iter: 300000, huella: 'a04fcf86c91feb5496c298c289221163c4cae364626d14dfa16dd171a882b08b', tipo: 'medico', zona: null,
      nombre: 'Mariana Natalia Estrada Villamizar', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'marianarobledo', sal: 'c57d9356620a98177f35714b03f13a10', iter: 300000, huella: 'ea4db2e36e05decf677de941cf40a9b02eafd0e1a800209937401c18d939feb1', tipo: 'medico', zona: null,
      nombre: 'Mariana Orduz Robledo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'martharangel', sal: '53c0dd0670e997041f18d0801b70507a', iter: 300000, huella: '2b0ec3b7b60a95c15d3552e92411bf6fc42784c49b6b9c7f2174f44e75499252', tipo: 'medico', zona: null,
      nombre: 'Martha Bibiana Rangel', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'milenaabdala', sal: 'f9fda91db892faed00f58dd344a15ae1', iter: 300000, huella: 'da2f66e9bc9a7256a3a20fa23f8ac5f3e87e0e5b9676697048d2610498e8eaf4', tipo: 'medico', zona: null,
      nombre: 'Milena Osorio Abdala', detalle: 'Acceso personal' },
    { usuario: 'miltonquiroga', sal: 'eef2f8ef2c605ddf7e017da43c22fd1f', iter: 300000, huella: 'bde0eef4e31884b73b2f51d7b85acf0093d21eef119c5c2f701acdb60b525283', tipo: 'medico', zona: null,
      nombre: 'Milton Javier Gonzalez Quiroga', detalle: 'Acceso personal', portafolio: '4cfab82968ef71e41b0e4d6b' },
    { usuario: 'monicabulla', sal: 'c7dceeb9c213d1ae8aa2e56c050a82f6', iter: 300000, huella: 'b058531ab6efc12cd8a1b3e8eb6fad6e919c5076c636f1d04d0c27d35d7a9f7e', tipo: 'medico', zona: null,
      nombre: 'Monica Hernandez Bulla', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'monicaparedes', sal: '86e5a2e49db2c92fc6c4b6d4ab6096a8', iter: 300000, huella: '9bff5df52cdbaf5c46cccebfc11b45e00c2468f3087c87f755449f1566008d3d', tipo: 'medico', zona: null,
      nombre: 'Monica Rocio Paredes', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nataliagil', sal: 'e56f1074e1a02b2292f920b55a3474fe', iter: 300000, huella: '0541164d1f1fa92c39fd92b69fac99aa007d877b56fdea37542f10a3e2e9cf01', tipo: 'medico', zona: null,
      nombre: 'Natalia Gil', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nataliadaza', sal: '043ca48f733146c831a92872fb4d79cd', iter: 300000, huella: '1afffa308a3607ea6dd523a5ccc3ab0e0d1553ffe4620cc2dc415c873b781213', tipo: 'medico', zona: null,
      nombre: 'Natalia Ospina Daza', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nilsaarias', sal: '784dd135223421917933ec69436a9d07', iter: 300000, huella: 'b10f9cae614f105067131ec4bf128829d5dfbc2c32fff19710447e8ed62bd0aa', tipo: 'medico', zona: null,
      nombre: 'Nilsa Arias', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'olgamosquera', sal: '943303e2ad1fdd0b8e09d770f85107ef', iter: 300000, huella: '3007b5820e9c8b4244dcd5cabe265fb6a356085efdfd81fe23b9325378c1843c', tipo: 'medico', zona: null,
      nombre: 'Olga del Carmen Parra Mosquera', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'oscarpabon', sal: 'a64498a54df3229376c9a0f45e82f9e5', iter: 300000, huella: 'd44771f2185d3f4e13f4971de6a075dce61ea4e9b05c2981745e22f120c77116', tipo: 'medico', zona: null,
      nombre: 'Oscar Javier Hernandez Pabon', detalle: 'Acceso personal', portafolio: 'dbbc3f099f4f4a874a338c75' },
    { usuario: 'oscarmedina', sal: 'cc0702abe7c37977685f8f392fe33dc3', iter: 300000, huella: 'e55d9a937599bb04e003da9efa9847c877c16f37da3a3fd00e768159728f72b9', tipo: 'medico', zona: null,
      nombre: 'Oscar Medina', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'paholaprince', sal: 'b87f4df65b728b966e0f8b8fce3a3773', iter: 300000, huella: '358bc65446dfa968b017c630c80292e8162fbb61e32908a62807067830171868', tipo: 'medico', zona: null,
      nombre: 'Pahola Eugenia Plata Prince', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'paolacobo', sal: 'f3b1decf9ea933487f465c51c28b0117', iter: 300000, huella: '4dc9e33905c2427e4b46cc3ef900e3d41b36b0722b3afab6680166a5ec741e81', tipo: 'medico', zona: null,
      nombre: 'Paola Cobo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'pedrorodriguez', sal: '777fa1dd244ddf13a233f876cde65ece', iter: 300000, huella: '6a81de66a4e0100b35ae20be615ca1362dc982f719b5897609c49dfbb84a4b03', tipo: 'medico', zona: null,
      nombre: 'Pedro Jose Castro Rodriguez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'perlarzonzew', sal: 'e93ba293766451df6f24e94b86d0c84b', iter: 300000, huella: '3873ab0231404c142bfc49da15fec086eab8b67dd72cce4db4a21fb773c1347e', tipo: 'medico', zona: null,
      nombre: 'Perla Furman Rzonzew', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'piedadariza', sal: 'bc47a8cc0ca44b6a123e120970a250c3', iter: 300000, huella: '14d4b021f3540408c0bbfec4f864e4371c703bf88cee4874b87a9179f7a6c19a', tipo: 'medico', zona: null,
      nombre: 'Piedad Almario Ariza', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'rosamedina', sal: '2feea097768a3bbb81252ea891d72f02', iter: 300000, huella: '44df5fd1ec28ef4e107016568e411fa772a2bbf13a77bca80d87a45a3cc5bd00', tipo: 'medico', zona: null,
      nombre: 'Rosa Yaneth Torres Medina', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'sandraferrer', sal: '9fb40b75aaac9ebb39c66a647e60f6fe', iter: 300000, huella: '88bb51c3850c449e50e9ca37f3428dc683729c289903bf98aa87d7af683def0b', tipo: 'medico', zona: null,
      nombre: 'Sandra Carolina Moreno Ferrer', detalle: 'Acceso personal', portafolio: 'be61d39a7f42917773b50a6a' },
    { usuario: 'sandravera', sal: '94dc31ebaae97a014d3d32971aa1b4f4', iter: 300000, huella: 'cf38ab839049ddc25d543a39d16560719def903388ba786f2a6fe704956a20bf', tipo: 'medico', zona: null,
      nombre: 'Sandra Liliana Cortes Vera', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'sandrasierra', sal: '2d65503aabf28cd41da2b612981b3db9', iter: 300000, huella: 'bb80a44f3c9cc649306370e9d2d18a3482ae92cedfd153475d5b7cc2c3919708', tipo: 'medico', zona: null,
      nombre: 'Sandra Patricia Angel Sierra', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'stephanylinthon', sal: 'c7bb9df2ac98627de9def01b1ed623b3', iter: 300000, huella: 'e92af46716290a7545e3686d084ed7b66146ec33328dedb00562700f3cfaf782', tipo: 'medico', zona: null,
      nombre: 'Stephany Arias Linthon', detalle: 'Acceso personal' },
    { usuario: 'suadalcove', sal: '96717752174e227bb20c489b3a0c886e', iter: 300000, huella: '798a6da7ae5161396db8a4c4b3ab12a32b1ca9c496068539ee6597036ba597fa', tipo: 'medico', zona: null,
      nombre: 'Suad Helena Quessep Alcove', detalle: 'Acceso personal', portafolio: '3b382193b065195325f53187' },
    { usuario: 'tatianasandoval', sal: '68bc0674e3aeb7e09256adc4d6575a7e', iter: 300000, huella: '07f010a1e5f1da61e91515e9277a1e216fb083c17b9a709a7f24e8b05e0bd262', tipo: 'medico', zona: null,
      nombre: 'Tatiana Alexandra Leal Sandoval', detalle: 'Acceso personal', portafolio: '4105bb62c6c1c7f172be5193' },
    { usuario: 'tatianasolano', sal: '2fb0f9e172de7cab45d72d9681f46c91', iter: 300000, huella: '914c44932b4e2cf3067e1c80fb805a317a14e1a93f0ca3b449536b8ca5b543b8', tipo: 'medico', zona: null,
      nombre: 'Tatiana Carolina Sanchez Solano', detalle: 'Acceso personal' },
    { usuario: 'tianylopez', sal: 'cf6823f3e9ff6e0d120c7a86f1c82662', iter: 300000, huella: 'eb8953128a8c44d7546618c6bb8171a70aff3409602123133cc6652914966bc5', tipo: 'medico', zona: null,
      nombre: 'Tiany Saray Molina Lopez', detalle: 'Acceso personal' },
    { usuario: 'veracueto', sal: '627255823a5a0c7c6af5545c85adde2a', iter: 300000, huella: '1a52af734d14fb1299b4679a9053184de2e960aa56a6e7fd62ad6453ffb1df79', tipo: 'medico', zona: null,
      nombre: 'Vera Cueto', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'yadiraoliveros', sal: 'acc2558c054cc05b835abb6da55b1a15', iter: 300000, huella: 'aae7e23bc594598fc504f5103c72fd77c3c9a25a6ea87646bbc7a01a668ccf7f', tipo: 'medico', zona: null,
      nombre: 'Yadira del Carmen Maza Oliveros', detalle: 'Acceso personal' },
    { usuario: 'yenifergarcia', sal: '434054964fc5d8915eb3374752595331', iter: 300000, huella: '30ec2b8599b9604605d2a372cef51a65696ac6268d684a1dde5c4eb52a5cfda4', tipo: 'medico', zona: null,
      nombre: 'Yenifer Alejandra Arias Garcia', detalle: 'Acceso personal', portafolio: '00e2021a78b58b63a78e91d3' },
    { usuario: 'yesicahuertas', sal: '093fe9569c00b6b7d74c91513fc9e448', iter: 300000, huella: '50665726f42330a588cd7947ef21eb72a07c797573c9d50c8daba8ba85fc376c', tipo: 'medico', zona: null,
      nombre: 'Yesica Mireya Ayala Huertas', detalle: 'Acceso personal', portafolio: '3d34773517337a7c301fbfb4' },
    { usuario: 'yudipinzon', sal: 'b4c872bafe7e0a915dd5d1a0e498f829', iter: 300000, huella: '71adaea22eeae44e70e4b8ffdb18c7d29ebc45fd8df2d7fa57aa021d83584f47', tipo: 'medico', zona: null,
      nombre: 'Yudi Pinzon', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'yurigiraldo', sal: 'ba3de16d54b3ae5ecd1b64292653e1cf', iter: 300000, huella: '4069fe0183ab738c2d2cb3c62b206c24328d47a42235bc693ae286f709f9b745', tipo: 'medico', zona: null,
      nombre: 'Yuri Nahidu Pardo Giraldo', detalle: 'Acceso personal', portafolio: 'af8916493ed1f9ba54e2a3b6' },
    { usuario: 'adrianamunoz', sal: '4463d8f6eb392ef675849aa37d88ae19', iter: 300000, huella: 'dc676fe79abb6c914e1ee7691dece221df86510148a5356caf7e78d3bb402aa6', tipo: 'medico', zona: null,
      nombre: 'Adriana Elizabeth Taquez Muñoz', detalle: 'Acceso personal', portafolio: '39d67dc85d24e516e4503bbb' },
    { usuario: 'adrianallamas', sal: 'd412d08f61cb6260446f889831c7a206', iter: 300000, huella: 'fd13e43772845fdcc54e695422d2a5a2e1acfac90cfcf2542d961847a453dab7', tipo: 'medico', zona: null,
      nombre: 'Adriana Llamas', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'adrianacruz', sal: '3e997368ca19749d0cc9e6c8cf7adf81', iter: 300000, huella: '426734a777ead9aef882f622b70acfe8d89e1c986de1ffbc4121fba4326fe6b7', tipo: 'medico', zona: null,
      nombre: 'Adriana Patricia Cruz', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'alejandraalcantara', sal: '436a5630616e6bf2e0f0696afccd60d1', iter: 300000, huella: '82f6ebc3c5e6f297e2bb3bd8c7ec4605e2e0888ba170122399b3a57f9c4558da', tipo: 'medico', zona: null,
      nombre: 'Alejandra Alcantara', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'amparojimenez', sal: '63b6a02548bedf6b71d83ca297c4a165', iter: 300000, huella: 'f87cbc74b73d396c836243a756567300e0ef409750716352e4af8d975d4fe190', tipo: 'medico', zona: null,
      nombre: 'Amparo Jimenez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'andreapiarpuzan', sal: '04a6fbff26eebddc03acf72b5d0108c2', iter: 300000, huella: 'fa6936f48c4ea4d69704786ae0fc5954fb0d1bcfa2fbbb71e011b597b2e6fa68', tipo: 'medico', zona: null,
      nombre: 'Andrea Paola Bojaca Piarpuzan', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'andresmendez', sal: '3e7df600808ed5b541e4bac568522de3', iter: 300000, huella: '95de2471f6cde0612e4f43f022241a247005a9055c49e550ec0367ee50594cb4', tipo: 'medico', zona: null,
      nombre: 'Andres Felipe Chamorro Mendez', detalle: 'Acceso personal' },
    { usuario: 'andrescastro', sal: '147da72dbbd575e6e0b1f99e4bda9396', iter: 300000, huella: '321ec637047982e762085e2d6b1db32470592adec67cde4eb7eb6c03208207ac', tipo: 'medico', zona: null,
      nombre: 'Andres Joaquin Campo Castro', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'andresrojas', sal: 'fccadff4af5879ef3f1a25fd1f53a64b', iter: 300000, huella: 'acde616583a71f8e9bccdde5c66df414f31999cf4f237dd9806d9db9d128154c', tipo: 'medico', zona: null,
      nombre: 'Andres Mauricio Ardila Rojas', detalle: 'Acceso personal', portafolio: 'cc620287db5bc42e79e818e0' },
    { usuario: 'angelapena', sal: '803f4ddf746be1bac44b244b6daac6ae', iter: 300000, huella: 'ce7b687518b43359b31d6ebd737f5ef9417d44d871e45c8b934b2c801de26ee8', tipo: 'medico', zona: null,
      nombre: 'Angela Peña', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'angelaparra', sal: 'e0ba3144173cf7ec43071bba7a91b78c', iter: 300000, huella: 'fb8a3f3d0175a954799f9a5571bfb283e7645147df7ac1df4bfffe41c4da7653', tipo: 'medico', zona: null,
      nombre: 'Angela Patricia Galeano Parra', detalle: 'Acceso personal', portafolio: 'f4717a211ad102d419946dac' },
    { usuario: 'angelicamartin', sal: '9a8e7888875e3380c430a919fabfafcf', iter: 300000, huella: '31906946d39a92fbd89fdb87eb0c0920f242e27667b7a845ac34139e47df7fa0', tipo: 'medico', zona: null,
      nombre: 'Angelica Johana Leon Martin', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'camilogarcia', sal: '04303ef34581ce654d78be871a509061', iter: 300000, huella: '3f22c999bb6ca9c06a0cb93b05908cd36a9d290eda4ff6ee4ae6863faffffc35', tipo: 'medico', zona: null,
      nombre: 'Camilo Adolfo Garcia', detalle: 'Acceso personal' },
    { usuario: 'carlosarteaga', sal: '309166a0a5283c786cc73c881a0cbd96', iter: 300000, huella: 'd85b374ddea5ca11a1062806dad447bc1a26f353e08d300daf562a3ea1139b2f', tipo: 'medico', zona: null,
      nombre: 'Carlos Andres Toledo Arteaga', detalle: 'Acceso personal', portafolio: '6121db2d1c77c670f0c72bd8' },
    { usuario: 'carlosgonzalez', sal: '3108278cbc22fcf4de0a259c21bb55b1', iter: 300000, huella: 'a841f7ec535bc752cc022c758b37d06d69d5ee9665a172c0ae7dda0f975567c6', tipo: 'medico', zona: null,
      nombre: 'Carlos Eduardo Bonilla Gonzalez', detalle: 'Acceso personal' },
    { usuario: 'carlosbaute', sal: '4fa597e53916c40732304ffafe7e50e8', iter: 300000, huella: '7829f496972f7f9f5199a7dca08491bb21b61411a110e7ac908a5e525bca2e5b', tipo: 'medico', zona: null,
      nombre: 'Carlos Fernando Quintero Baute', detalle: 'Acceso personal', portafolio: '343f18984000c406717961cd' },
    { usuario: 'carolinaarteaga', sal: '8de87b06beb1b229ee93a8dc430d79ce', iter: 300000, huella: '7788b1d64da2fd0beedc9633c86c24637e627585cb54c3e7513919b3d197a38e', tipo: 'medico', zona: null,
      nombre: 'Carolina Alba Arteaga', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'carolinarodriguez', sal: 'db122197e6e268f242221eb929991205', iter: 300000, huella: '7c76d6a936e1eb4d04f08281cf85289f8264de6557bb698a7ced6833746a7812', tipo: 'medico', zona: null,
      nombre: 'Carolina Rodríguez', detalle: 'Acceso personal', portafolio: '39d67dc85d24e516e4503bbb' },
    { usuario: 'claudiasoto', sal: '3344ba1332d3393026115afdac932638', iter: 300000, huella: '53b0147ff90e913564844765de817fa712be7cdee1d14bfc449aff567b5b0970', tipo: 'medico', zona: null,
      nombre: 'Claudia Marcela Arenas Soto', detalle: 'Acceso personal' },
    { usuario: 'claudiacruz', sal: 'a261a964b7d14993a9242330223a35f3', iter: 300000, huella: 'd781c795b48e91bb14fa7f3904cca1cd30c27f63fc360fa5ce9626006a09171d', tipo: 'medico', zona: null,
      nombre: 'Claudia Marcela Cruz', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'claudiaatehortua', sal: '0e7653c952fd0b45a1136e0ddf6a00ff', iter: 300000, huella: '38a2c9db2af502705d95d6cb488d98fefd1f1fe73bcb86ac4d272bc5c3d14ae9', tipo: 'medico', zona: null,
      nombre: 'Claudia Milena Arango Atehortua', detalle: 'Acceso personal', portafolio: 'dc9c7f5454840faf44f4ca4d' },
    { usuario: 'claudiahernandez', sal: '38cb9ffb19c9f50aed805069bcac4d34', iter: 300000, huella: 'df6303b366cd2a4ce72062745eff7e05316c823cdfe64504e4b74357c4c4019e', tipo: 'medico', zona: null,
      nombre: 'Claudia Paola Botero Hernandez', detalle: 'Acceso personal' },
    { usuario: 'claudiamontoya', sal: '3c7e22288da7ffedd1b1baad4855ab8e', iter: 300000, huella: 'c3bdaa3916c3beb450d76ef50930f41ffa84401e788fd8d97f8f3c6caf7bfd06', tipo: 'medico', zona: null,
      nombre: 'Claudia Ximena Carvajal Montoya', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'danielburbano', sal: '1c49e3dff5ca65a6b881b326a33b5e3b', iter: 300000, huella: '7afd3a641e3a6d5cb75cd9bd8d70ec3143f47ad943a56abf11c8a487f4fb6461', tipo: 'medico', zona: null,
      nombre: 'Daniel Burbano', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'danielamurcia', sal: '2b49ef7378bea5a03d043a28cf931b81', iter: 300000, huella: '432190db062e911fa5bb83b06d36b50964d3fc0d423f2bb3d102200cee8139b7', tipo: 'medico', zona: null,
      nombre: 'Daniela Maria Gutierrez Murcia', detalle: 'Acceso personal' },
    { usuario: 'darwinsanchez', sal: 'e119855ef2abf185ab663632682a5d0a', iter: 300000, huella: '64f6306d2946c73498dc977894a1e433377d11d11345d89db44a46fb1cb0818a', tipo: 'medico', zona: null,
      nombre: 'Darwin Alejandro Lazo Sanchez', detalle: 'Acceso personal', portafolio: '9f980e6e20c508e643b3a32e' },
    { usuario: 'claudiamurcia', sal: '55cecdb5d9a7f7ac74a93e97339704fe', iter: 300000, huella: '8c4835a4736dba2000fe7ad9ee91d8e4a7c2ba2a8557ae1756379558e3b3473d', tipo: 'medico', zona: null,
      nombre: 'Claudia Elena Figueroa Murcia', detalle: 'Acceso personal', portafolio: '771aa884c4f4233914fe44e1' },
    { usuario: 'dianamondragon', sal: '7a7558e1fc3e521aec733a8c52ae99a6', iter: 300000, huella: '950fd93f16b106e7f4ee05d8e0c04fc19289dc1efcfd431f0f039564723677cd', tipo: 'medico', zona: null,
      nombre: 'Diana Sofia Chavez Mondragon', detalle: 'Acceso personal' },
    { usuario: 'edithruiz', sal: '2154c8f78566f3764b85f7809bb92582', iter: 300000, huella: '345e62f46c551df503b7c880e04d80785037c3aba9d806823c5a76947f343029', tipo: 'medico', zona: null,
      nombre: 'Edith Giselle Ruiz', detalle: 'Acceso personal' },
    { usuario: 'edwinvega', sal: '8e6d04eb0691d5bd11b554e641b30c60', iter: 300000, huella: 'c9e6bcba59924ddcfa92cff1d89c57c4fa200365861c1cb84cec42ee3d2a7835', tipo: 'medico', zona: null,
      nombre: 'Edwin Vega', detalle: 'Acceso personal', portafolio: '90914185da5df7f3b089e75b' },
    { usuario: 'elenavoica', sal: '25e602cb7890c4dba959ef43278f65b4', iter: 300000, huella: 'fbd8e477ae4c52cee1c01588884b49f6871aa00bf83b70baca225e57d8714c8e', tipo: 'medico', zona: null,
      nombre: 'Elena Voica', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'felipeestupinan', sal: 'cc670745fd065477acc229775505bc52', iter: 300000, huella: '276218f943bd627f3d0f251c82adfe5370de5abe000a4e4657b3608a60e5ac17', tipo: 'medico', zona: null,
      nombre: 'Felipe Estupiñan', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'fernandovargas', sal: 'f878b0b019a6e7815cd33d8cad0aaca2', iter: 300000, huella: '860f30c3ebeb672accf10f9e513c073a65bb2c213d8f62d5216619812d00dc6b', tipo: 'medico', zona: null,
      nombre: 'Fernando Vargas', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'franciscoflechas', sal: 'faf874f768818e7127f42f44131dcbab', iter: 300000, huella: 'afcfce36fd831a2e72284f73963e8dbd16e94d72cc5499e378f8d2e2356f5b19', tipo: 'medico', zona: null,
      nombre: 'Francisco Sebastian Carvajal Flechas', detalle: 'Acceso personal' },
    { usuario: 'francyvega', sal: 'd700f435ae63b9241164d553291d8ed4', iter: 300000, huella: '7705e2cbf2c09fca1d2c1fda26c2ff452452bd2d7d2936818a04fff556a26b6e', tipo: 'medico', zona: null,
      nombre: 'Francy Carolina Aponte Vega', detalle: 'Acceso personal' },
    { usuario: 'freddypolo', sal: 'a4e51668c37850f4a509068a6d12a68e', iter: 300000, huella: '27629b6706522030c81f91c34e2b417a03d8a71ea9f45f4ac03bdab722a1f875', tipo: 'medico', zona: null,
      nombre: 'Freddy Polo', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'freddyjimenez', sal: 'a9b9bced12539577981cc0135458282e', iter: 300000, huella: '139362648dbc2314679e6e8bb0bbf39c2c71d53f49228e6f068201ad6c033330', tipo: 'medico', zona: null,
      nombre: 'Freddy Alejandro Suarez Jimenez', detalle: 'Acceso personal', portafolio: '2c42a4dc251349de04082b09' },
    { usuario: 'gloriavallejo', sal: 'bb1a6c0a61f7d0c4a092d02036348aa6', iter: 300000, huella: '2df5eb01fa4a6c65db827e9efeed35afc848c47a5673898a0506aeaf19a1055c', tipo: 'medico', zona: null,
      nombre: 'Gloria Esperanza Vallejo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'guidogranados', sal: '6f145fcfe2b62e01faa599de9628b8cf', iter: 300000, huella: '125d0522f6f9b7f750b53aa687a6114798fed7dadc5e809361806d83739afae5', tipo: 'medico', zona: null,
      nombre: 'Guido Carmen Diaz Granados', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'guillermomendoza', sal: '285fed3ce2ddeafb29ca159a30f43e10', iter: 300000, huella: 'd50e2e6e58aec27ff00ae19f5f8b1c52cac2107f99aaec8da564396d0ab61652', tipo: 'medico', zona: null,
      nombre: 'Guillermo Cohen Mendoza', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'guillermogonzalez', sal: '9677b023ce975b2ce7c23528697b238c', iter: 300000, huella: '0006ca42d82bce28aaece9359950855a107d1053da9a2c02e26c176a1e216c24', tipo: 'medico', zona: null,
      nombre: 'Guillermo Gonzalez', detalle: 'Acceso personal', portafolio: '90914185da5df7f3b089e75b' },
    { usuario: 'gustavoruiz', sal: '8397526dcd745e44c4592a73486cfd0f', iter: 300000, huella: '65ced6ab8253d79d38e9d500b7bcb6fef08691f171e3e3797a0877ea00c44f8c', tipo: 'medico', zona: null,
      nombre: 'Gustavo Adolfo Perez Ruiz', detalle: 'Acceso personal', portafolio: '27f84ee9e3e7996c8398c962' },
    { usuario: 'gustavoespinosa', sal: '7f68cfb930b5ccb03a9e9182e8ba8eb4', iter: 300000, huella: '8833c2668058de3cce797cee768b92f4398f249559df879682ef7921b985f2ce', tipo: 'medico', zona: null,
      nombre: 'Gustavo Espinosa', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'hectorprieto', sal: 'a9d0da0db054f8ad349a83f70acf62fd', iter: 300000, huella: 'a7429e7c7b12530a8f7f4de66b19b9db2757bb286277a1a79157f1803de52bc3', tipo: 'medico', zona: null,
      nombre: 'Hector Dario Prieto', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'isabellasanz', sal: 'e56bab6a527a4aecf45806438d7c1aff', iter: 300000, huella: 'dcdbf9d5eec64a1f12bc6325c44f7c122ac6fe1b362559c9bbc37ad0822ad525', tipo: 'medico', zona: null,
      nombre: 'Isabella Palacino Sanz', detalle: 'Acceso personal' },
    { usuario: 'jacquelinehelo', sal: '8a7c39cbe1cb7cba338e9d85673b4bfb', iter: 300000, huella: 'edef8395f2cd27c1a4c9782090d79fa9054349fdee4f42f92e113626e2f5704b', tipo: 'medico', zona: null,
      nombre: 'Jacqueline Helo Helo', detalle: 'Acceso personal' },
    { usuario: 'jaimeavella', sal: '8542d126fe3faf65e0bbf310b95e5d70', iter: 300000, huella: 'c0c7fccabbcb9cec8a326cee554bdab5982132735869d07f253d5035d4736b82', tipo: 'medico', zona: null,
      nombre: 'Jaime Arturo Guio Avella', detalle: 'Acceso personal' },
    { usuario: 'jeanesuarez', sal: '9dbf801f8dc1342fe985f05cdfd3a073', iter: 300000, huella: 'd273057e1fb16e6a00fbb182501af3044d14c04c78247eff2ef2048a60a2aa7f', tipo: 'medico', zona: null,
      nombre: 'Jeane Alice Acosta Suarez', detalle: 'Acceso personal' },
    { usuario: 'jenniferalvarez', sal: 'a0e2474a9b088af2d5c102e5aa5467ca', iter: 300000, huella: 'ebbffe0424816be1b3a169c26a6a284e463c50a50bc4a50b0a8d37e8a1a3ca1f', tipo: 'medico', zona: null,
      nombre: 'Jennifer Paula Garcia Alvarez', detalle: 'Acceso personal' },
    { usuario: 'jennyhormaza', sal: '9df75432167789d7997c724027211120', iter: 300000, huella: '532ac0d81e852e07c5b3eaca8a6771d1abcb0ed53efe0a6bcee0306b30ea2342', tipo: 'medico', zona: null,
      nombre: 'Jenny Hormaza', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'jesusmontero', sal: '490e02e11d5ac8348a9166beb709c516', iter: 300000, huella: 'fcdf62cf921753b38319124f36c88b578bfba72600919e674cbfc97852baf8f6', tipo: 'medico', zona: null,
      nombre: 'Jesus Enrique Vasquez Montero', detalle: 'Acceso personal', portafolio: 'feb0389ddadc2792cc1885ac' },
    { usuario: 'jesuspantoja', sal: '3946a34b95f0f02f56a3b2b1fc2a8ddc', iter: 300000, huella: '93e2ebb48675f3e50026050831f00fdc3b2ca506fac89190254f21db47dad36a', tipo: 'medico', zona: null,
      nombre: 'Jesus Hernan Pantoja', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'joaquincastro', sal: '8ebb780c22ed1c1f2ca42c0173ed8b1c', iter: 300000, huella: 'a20a73c32d5d2d8ec6378f5ba82a50bd7c8412e13b0cce53e72643930c21ac76', tipo: 'medico', zona: null,
      nombre: 'Joaquin Andres Campo Castro', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'joaquinhurtado', sal: 'a3a55c3655a29f1dd84605593289c13c', iter: 300000, huella: '72a3acf3bf1908c77192674b5d5cb12b81f1b3baf3d0bf88caed322b20c155bb', tipo: 'medico', zona: null,
      nombre: 'Joaquin Benavidez Hurtado', detalle: 'Acceso personal' },
    { usuario: 'johnarciniegas', sal: '97e102f889c99d38f851a6fc7ac0818d', iter: 300000, huella: '103d6a7460943c2795e6a5ff845f180ce3f0a9bd92eb3deacf89b2cb1934a6a8', tipo: 'medico', zona: null,
      nombre: 'John Bernardo Arcos Arciniegas', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'johngaitan', sal: '575d09ca10fca361e8f45bd7beda0b39', iter: 300000, huella: 'ea99c4992eee3f9b9dd0a43a7d353ae6475cd8cd83b69494bfaf5af94e906adb', tipo: 'medico', zona: null,
      nombre: 'John Stiven Montoya Gaitan', detalle: 'Acceso personal' },
    { usuario: 'josuejojoa', sal: '5710f8f76c4b0e27ee061bce19046798', iter: 300000, huella: '85bbb1f86095b0a29fbfd4f2b0543c9119ed3d794a680d05eb077283605a0514', tipo: 'medico', zona: null,
      nombre: 'Josue Muñoz Jojoa', detalle: 'Acceso personal' },
    { usuario: 'jovanalozano', sal: '1c1b32f84d363b55396136f93779aee4', iter: 300000, huella: 'e742b846228373a73a24322da1ebe53984ef1a5f820ec6903e9298dbb0b0badc', tipo: 'medico', zona: null,
      nombre: 'Jovana Terront Lozano', detalle: 'Acceso personal' },
    { usuario: 'juanalvarez', sal: '57d3c31fc9b23d1ebcbb447535b64f66', iter: 300000, huella: '6a689c71b68ebc5a89d11dff2eeac6279ab41403de6c058a3d1119caae37b27a', tipo: 'medico', zona: null,
      nombre: 'Juan Alvarez', detalle: 'Acceso personal' },
    { usuario: 'juancalderon', sal: '108d34bfc5608edc9ce68c5e0079bd79', iter: 300000, huella: '2d3381cd79c82ca573c2b6de1b86ea1117333c4bc5f2497c9114e5c11894a4d4', tipo: 'medico', zona: null,
      nombre: 'Juan Camilo Calderon', detalle: 'Acceso personal' },
    { usuario: 'juanlopez', sal: 'c15285067b95e61d70d30b7a7ed11ac5', iter: 300000, huella: 'c54e581559bb43254c1c5de882f4b885f59a40e5b65f9a8ada872abd4a60f066', tipo: 'medico', zona: null,
      nombre: 'Juan Mauricio Betancur Lopez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'julianazapata', sal: '8e824f8e3859440f75d3904f5b22a9c8', iter: 300000, huella: '5ae4d39200b21c80db90d141627d043ae5c1e02968e334df06654d04f71fa006', tipo: 'medico', zona: null,
      nombre: 'Juliana Zapata', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'karenvelasco', sal: 'c7e8ca9f9135823481ff30d72370baf9', iter: 300000, huella: '0d8e694bea61457ee080b7760004edc2a51488152a8b917084ee550c34c23cdb', tipo: 'medico', zona: null,
      nombre: 'Karen Viviana Pinzon Velasco', detalle: 'Acceso personal' },
    { usuario: 'lauravalverde', sal: 'eba942c34be69932922a2bbe93eb19a0', iter: 300000, huella: '22f5075c998c4bae43c76c89ff0772406d84c3ec6aea234302aeef58a7888652', tipo: 'medico', zona: null,
      nombre: 'Laura Agüero Valverde', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lauracortes', sal: 'ed8e638eccc7e6d976ff53e0d0b463d0', iter: 300000, huella: '0abbb7c60bfc9bc4f9c2e845f4c3e9a64ab91817ea1ebc1e07920381620c1ed3', tipo: 'medico', zona: null,
      nombre: 'Laura Forero Cortes', detalle: 'Acceso personal' },
    { usuario: 'lauramoreno', sal: 'adcb2d47fd83b4bc5b55b42e94378b23', iter: 300000, huella: '9d3c50a84dfd6d1a7d5b41b1e6faefedf15550107576405eebb5c8972bc4c7bc', tipo: 'medico', zona: null,
      nombre: 'Laura Patricia Moreno', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'lauraumana', sal: '6deb734b64657886be379ec960f4918c', iter: 300000, huella: '8ef8f38f2d9c65d4fccc9ac4a52ed822048d01afdadfbd72acc012eb4634ca56', tipo: 'medico', zona: null,
      nombre: 'Laura Umaña', detalle: 'Acceso personal' },
    { usuario: 'libardocabrera', sal: 'd6c09e496a8d9bf58b50705dd8d6e14b', iter: 300000, huella: '07bdde04dd1ea75027ea6febba8dd0587f264b8876a14f7a938b3f4657580173', tipo: 'medico', zona: null,
      nombre: 'Libardo Cabrera', detalle: 'Acceso personal' },
    { usuario: 'linalopez', sal: '6a39c521b67766a4ccfdd5d19d30b6bf', iter: 300000, huella: '368a9381ac2a562bfc75ee01da8adc7567eac03e81fbeb2fa5b3a7857130594f', tipo: 'medico', zona: null,
      nombre: 'Lina Marcela Lopez', detalle: 'Acceso personal' },
    { usuario: 'luisasarmiento', sal: '4de6316a3c269ef38501f883b2ec69a7', iter: 300000, huella: '8e0e754f7acf5368484bfd2b8c49a91acd7d33cbc80ca07be8cf05293b8c75b9', tipo: 'medico', zona: null,
      nombre: 'Luisa Fernanda Diaz Sarmiento', detalle: 'Acceso personal' },
    { usuario: 'manuelavargas', sal: 'cf757ef1a59e3c0dc72a0cd64199d314', iter: 300000, huella: '990d63cc85b46d013b1eda069dfbacb7149d6f0d70c6367e34949dc6f119de7f', tipo: 'medico', zona: null,
      nombre: 'Manuela Vargas', detalle: 'Acceso personal' },
    { usuario: 'mariaquimbaya', sal: 'c965e80c1c842a0212bfa09c25c377fa', iter: 300000, huella: 'ec121d57cac491a50303c572fa4f34beee717c7f37962f8a5f23027a33400448', tipo: 'medico', zona: null,
      nombre: 'Maria Antonieta Quimbaya', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariatoscano', sal: '996449acfe7d0b52df5a9f0ac16dbc08', iter: 300000, huella: 'd0f7fb322933aa25f6dee5420f1080c0d562cebfc73a9b1027d4690660c74e8d', tipo: 'medico', zona: null,
      nombre: 'Maria Camila Toscano', detalle: 'Acceso personal', portafolios: ['4902bfc6b5c59641c3503d51', 'e4d0056914bd30e3ac9916fe'] },
    { usuario: 'mariagalvis', sal: 'fbbc97b5dd49d88590cd57685d6a1f85', iter: 300000, huella: '652276012337871155091ef9b9ff32f22fbb257c741bc1264f77af4d21225da3', tipo: 'medico', zona: null,
      nombre: 'Maria Claudia Rodriguez Galvis', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariaribero', sal: '347f225067d0e0a0d1784b89c3a8d55c', iter: 300000, huella: '9690aff917ff87401fcd7773241e022e422dc578db9eb513718a73f321580c3a', tipo: 'medico', zona: null,
      nombre: 'Maria Daniela Serrano Ribero', detalle: 'Acceso personal' },
    { usuario: 'mariahenao', sal: '62572418295ce77b1821f828b0268238', iter: 300000, huella: 'dffc3539f8d3363819b3e00161b2e7844333ceb5f77080bb07fe4bdb66aa47d6', tipo: 'medico', zona: null,
      nombre: 'Maria Del Carmen Aguirre Henao', detalle: 'Acceso personal' },
    { usuario: 'mariaacosta', sal: 'e82bbf19bd8d5483a45105d3c9479110', iter: 300000, huella: 'e831abcda4093cc8c0bd4dbc49bd9c435c0aeb3863c90c92af25af17ac6a2920', tipo: 'medico', zona: null,
      nombre: 'Maria del Carmen Diaz Acosta', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariajaramillo', sal: '0fff520f013fc0effd09dafcadd667fb', iter: 300000, huella: '730d4151ecd5f90bf9ffc335c543de35d3daefbf98e9317f9aaebaba22233448', tipo: 'medico', zona: null,
      nombre: 'Maria Eugenia Jaramillo', detalle: 'Acceso personal' },
    { usuario: 'mariaalvarez', sal: '15335cdda2f08cf7ab8b857557e417a0', iter: 300000, huella: 'f1a2b8314188876d753043503caef22a19e5716e9b26e6dd03858364135ffb50', tipo: 'medico', zona: null,
      nombre: 'Maria Jose Cabana Alvarez', detalle: 'Acceso personal' },
    { usuario: 'mariamaza', sal: '433eadcc2fd121e7996756c50b203b82', iter: 300000, huella: '25b5f026d08a51909b97dacca101f00f827d2c373e2504aff23933357f4ad393', tipo: 'medico', zona: null,
      nombre: 'Maria Maza', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mariapineda', sal: '32b9a9edc50223ea277e07485adf1ad2', iter: 300000, huella: 'f5183850f5974496d158933ae7050c76cc88bf23a768dfbe97a433e079884778', tipo: 'medico', zona: null,
      nombre: 'Maria Pineda', detalle: 'Acceso personal' },
    { usuario: 'marianatamayo', sal: '66b520cae9a346e85830689a48b8bf53', iter: 300000, huella: '53c40fb4e2d90c5bcdb064ff8b458aa84eb630ef0b15ed3fa7a4fb2bfecc7adb', tipo: 'medico', zona: null,
      nombre: 'Mariana Tamayo', detalle: 'Acceso personal' },
    { usuario: 'marilyncruz', sal: '16e6f5f29ee7608491d972c145a2aff8', iter: 300000, huella: '5e99c3b64a4f26152c5fee08ea2b4c4a666aa34b168c423d94773430d8636313', tipo: 'medico', zona: null,
      nombre: 'Marilyn Stanley Sanabria Cruz', detalle: 'Acceso personal' },
    { usuario: 'marlonbautista', sal: '198d4f60ed91676aeecfc65be4e7b526', iter: 300000, huella: 'bb7255398171ac03c0d1ee83ccdcc2c658c8503582ea38f0a33d1a9703e0d37c', tipo: 'medico', zona: null,
      nombre: 'Marlon Julian Perea Bautista', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'mauriciobeltran', sal: '70ffd70239eae524bb9d4a0e90846943', iter: 300000, huella: '9c56f0feabd1022a51531abed306594c3f3217984f469e012ec873a10d92f321', tipo: 'medico', zona: null,
      nombre: 'Mauricio Canal Beltran', detalle: 'Acceso personal' },
    { usuario: 'mauriciomoreno', sal: '5d8d679ec5bc31ed295b0da12d77e29a', iter: 300000, huella: '8b6bbf63d43d0f0e62e58d808651eddb22b51c25e066b5f347c82e2ea8f084bf', tipo: 'medico', zona: null,
      nombre: 'Mauricio Moreno', detalle: 'Acceso personal' },
    { usuario: 'melissaalvarez', sal: '70445ac5fc7d4b66131ab287f6194e85', iter: 300000, huella: '11df1b03d8e7ff4ede7eea0c3ccca4be68bdb1f0b83927c8dabb1d148a2f09dc', tipo: 'medico', zona: null,
      nombre: 'Melissa Garcia Alvarez', detalle: 'Acceso personal' },
    { usuario: 'mildredalvarez', sal: '1d26b90160d468fca2711309d7196c69', iter: 300000, huella: '404fa7ded96881577924cc4c86c2c5fe9bc6a812dea6fcb7e907186b26b6f72c', tipo: 'medico', zona: null,
      nombre: 'Mildred Paez alvarez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'miriamcasas', sal: '58e0dfd04b2e0b875f5af5f54b007c08', iter: 300000, huella: '3ff399217efb5583f36e3f2003a2feb943331395b68019d41357542e5cb694bc', tipo: 'medico', zona: null,
      nombre: 'Miriam Casas', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'monicasiachoque', sal: '5f7e8c428ce9c578fef305a755a9e2f4', iter: 300000, huella: '03c81092b4b9c964b1922c6bf8cd48d9a866634a49d2e4c440ee50627b04d6d5', tipo: 'medico', zona: null,
      nombre: 'Monica Patricia Carrera Siachoque', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nataliaperez', sal: '9d119c7e1257ee5c84fb8f2d82793360', iter: 300000, huella: '77d375848712eb82a111944c65aaccc9c33059d4488112e5ffad5278394a05ba', tipo: 'medico', zona: null,
      nombre: 'Natalia Perez', detalle: 'Acceso personal' },
    { usuario: 'nataliasuarez', sal: '08487bbcc02fb124b01b83f20d000eae', iter: 300000, huella: '579868425db90eb4fe8a7390ac30acbb468eac937910939fa04b669f561f6370', tipo: 'medico', zona: null,
      nombre: 'Natalia Suarez', detalle: 'Acceso personal' },
    { usuario: 'nayibealvarado', sal: 'a34083057b50640aec0c702590ec4a08', iter: 300000, huella: '1df766a20f3b3b325a484d7af71fe2d472be113168e5ab14135bb583dfb02669', tipo: 'medico', zona: null,
      nombre: 'Nayibe Alvarado', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nayibemartinez', sal: 'c241aeab5f5b8e5daba8c2ba9756bd3c', iter: 300000, huella: '8e608b717f4b3a81549f57fde75d23376e8e137daed73643d2ac4aaf53b9daf5', tipo: 'medico', zona: null,
      nombre: 'Nayibe Victoria Solano Martinez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'nelsondiaz', sal: 'd6b7cd56bcd45db67f054c27f290c204', iter: 300000, huella: '3101dc9cdd52ec5f10aac7f1e2ffb1a3bcce220f649468b4008fce6bcdc557bd', tipo: 'medico', zona: null,
      nombre: 'Nelson Augusto Campos Diaz', detalle: 'Acceso personal' },
    { usuario: 'olgaherrera', sal: '442e19948f3b3dd2417a6f1af2a27ce9', iter: 300000, huella: '6689b52ffd3d42218117e68990eefb21e276730191ccb31739a02c9b68645ff4', tipo: 'medico', zona: null,
      nombre: 'Olga Lucia Pardo Herrera', detalle: 'Acceso personal', portafolio: '4902bfc6b5c59641c3503d51' },
    { usuario: 'onerfuentes', sal: '71754c1645368f085dc55143b325a742', iter: 300000, huella: '6b427d7a60cdc9d049359eb586fe40e0968dca8074a01e3ddb06be7fb8df188a', tipo: 'medico', zona: null,
      nombre: 'Oner Daniel Dorado Fuentes', detalle: 'Acceso personal', portafolio: '123c815ad086d8fa96aab623' },
    { usuario: 'oswaldomartinez', sal: 'e4cb6c1b3a69b9552a1044c1c0206778', iter: 300000, huella: '828042e6e54c6758a005fe5bac9476da7d5c6e4909e8b3c57b2b415d2ba8d306', tipo: 'medico', zona: null,
      nombre: 'Oswaldo Martinez', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'paolaescobar', sal: '135367674ead57b4198144aa59660bbf', iter: 300000, huella: '58d7e78814c0efe48f3f553b44b9021849a55b78867c202edddaa898991888a4', tipo: 'medico', zona: null,
      nombre: 'Paola Andrea Alvarez Escobar', detalle: 'Acceso personal', portafolio: '5f5fb0330f480658c9d5c115' },
    { usuario: 'paolaurquijo', sal: '5549c0d8a951e337b98da4f4e21d3d1e', iter: 300000, huella: '29ae9c4c1e0ccf8d5a308df4091b6505b7a14863034a86000839f05ee87118b3', tipo: 'medico', zona: null,
      nombre: 'Paola Urquijo', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'paulapinilla', sal: '26667e54d8e7ffec7c78546909ebaed6', iter: 300000, huella: 'c50963e313ef747fdda2fc29784bca3c3a1c6b85e5ee91f5532457b39268cc88', tipo: 'medico', zona: null,
      nombre: 'Paula Alejandra Becerra Pinilla', detalle: 'Acceso personal' },
    { usuario: 'paulatorres', sal: 'e71ca421238c0f8e691253a70cb1c0f9', iter: 300000, huella: 'a4a6086704cad0446792ae3d33868d5e8cc50b67ad26504d91cfc62a3ab338d1', tipo: 'medico', zona: null,
      nombre: 'Paula Andrea Torres', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'paulamunoz', sal: '94e211a29fbac980cb21150c4190bb02', iter: 300000, huella: '61e3fdcb54082e4893aa17e2fd878688c86c8aec450f5fd56ed97bbfb384ba7a', tipo: 'medico', zona: null,
      nombre: 'Paula Muñoz', detalle: 'Acceso personal' },
    { usuario: 'paulafreyre', sal: '9240cb72f2e5a01222b84d0e73455cf3', iter: 300000, huella: '2723a5f9f7c608afe2a2839b92a236759b705c8d593129bcddb81db427617d8f', tipo: 'medico', zona: null,
      nombre: 'Paula Natalia Muñoz Freyre', detalle: 'Acceso personal', portafolio: 'def562e1c8d8b60db8ba9502' },
    { usuario: 'paularuiz', sal: 'f81397a30e7b3fd1bc461b4f7ef50475', iter: 300000, huella: '56c96df35d71cd433b1c041f26d73d9678fdb66a995965e582810b0bbb443eab', tipo: 'medico', zona: null,
      nombre: 'Paula Ruiz', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'paularamirez', sal: '6e8220bdd6ad4ce99c5aa756c6b479fa', iter: 300000, huella: '0f8a5036b75ed0e554ea18578366165e8187bf8380ae786f887b469dba544958', tipo: 'medico', zona: null,
      nombre: 'Paula Villareal Ramirez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'pedroflorez', sal: 'd238394a3960e15c28d7dd223a8f8aa7', iter: 300000, huella: '91dec47302815128b971cd04043c02853eca72b972a7e190f03586c1fc366b41', tipo: 'medico', zona: null,
      nombre: 'Pedro Florez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'piedadpenaranda', sal: 'e6b0ea4458c5882f44d713d2b8006237', iter: 300000, huella: '1995dba83698efe30d415a545e872714b3d4bdf22dac032ca98fb6c2e820b73e', tipo: 'medico', zona: null,
      nombre: 'Piedad Peñaranda', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'rafaelvillamil', sal: '73d773620f5e7bdc6dba8afd0d77660c', iter: 300000, huella: '482d200fa584a7e35d6115feaa2ef8409e3ef036a0775c75c7860aef7c7858d7', tipo: 'medico', zona: null,
      nombre: 'Rafael Humberto Rivera Villamil', detalle: 'Acceso personal', portafolio: 'fa69814410786a1da4f4fc8d' },
    { usuario: 'ricardosanabria', sal: 'ab7fadea9c94c3a9ce7ff28f07b57c46', iter: 300000, huella: '92e3824b1ded27581315d473b2fe621ee85e15786c3f8915ec397960e0bbbdd0', tipo: 'medico', zona: null,
      nombre: 'Ricardo Sanabria', detalle: 'Acceso personal' },
    { usuario: 'rigobertochavez', sal: '793da9066d936238318873d1b94899a2', iter: 300000, huella: '848c6763fd873b2dcd5f8173dffe60d135cc810eb57da6c40d34583960ab4d06', tipo: 'medico', zona: null,
      nombre: 'Rigoberto Castro Chavez', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'rocioparedes', sal: '4443ba930320929d82385d8f3e61fde7', iter: 300000, huella: '5281366de4a560744ccee19b7b3087bb9c7af1a7a10c98ebc21a22ab14997f1e', tipo: 'medico', zona: null,
      nombre: 'Rocio Del Pilar Marin Paredes', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'sandraespinosa', sal: 'e5cd078641dc0c449062ea1cf3ae75e6', iter: 300000, huella: 'e60dd6a0545e214c938f2171efd111828951ba3fec991fb38532126042e8ee70', tipo: 'medico', zona: null,
      nombre: 'Sandra Espinosa', detalle: 'Acceso personal', portafolios: ['fa69814410786a1da4f4fc8d', 'e4d0056914bd30e3ac9916fe'] },
    { usuario: 'sandraarenas', sal: '9682cbdcb366f22de5e0b0f712190e47', iter: 300000, huella: 'ee2914e7357d000a2dacd8dce6c3514a0db7a8a3145d408f7cff97763b05b108', tipo: 'medico', zona: null,
      nombre: 'Sandra Helena Muvdi Arenas', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'sugeyrico', sal: '7373e184fdf1dc0f91c2d6912f5e7209', iter: 300000, huella: '5a88391e44ffeea8c191d8eb414b0046af831be838b91ecec3cea42c66dbb70e', tipo: 'medico', zona: null,
      nombre: 'Sugey Rico', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'valentinataborda', sal: 'b695a69e2937a16b4432c03fd04025fb', iter: 300000, huella: '13ad2b154120c79ab8d9f7429fa3877e784c2d63a697edcf677db01f48c62a46', tipo: 'medico', zona: null,
      nombre: 'Valentina Perez Taborda', detalle: 'Acceso personal' },
    { usuario: 'valerialopez', sal: 'eda91fa63042600dc2c4685b574c9c27', iter: 300000, huella: '344a015d85ac7bebff24141ec994bec6628e83e982c7cac2b83bdab65e326734', tipo: 'medico', zona: null,
      nombre: 'Valeria Vela Lopez', detalle: 'Acceso personal' },
    { usuario: 'veronicaaragon', sal: 'c9f215d3d63b2f9025a363adaa2cb8f8', iter: 300000, huella: '7c78455095087dc46ee75f12d9d5cc116acffedabc0c20902832f329e50eea5e', tipo: 'medico', zona: null,
      nombre: 'Veronica Palacio Aragon', detalle: 'Acceso personal' },
    { usuario: 'victorbenitez', sal: '8b9ff337bc546ba3fdfb7a55be9e4fe4', iter: 300000, huella: '290460a228029348eed3408e395a8cce6e72526216d87203bb82c2265e9478e8', tipo: 'medico', zona: null,
      nombre: 'Victor Benitez', detalle: 'Acceso personal', portafolio: 'dfb58366b171ad65249c9c3a' },
    { usuario: 'wilmerbuitrago', sal: '4dba216745f2debfa21b8082f5da622e', iter: 300000, huella: 'c9a9c1b67d5d67622353c3fe58f693bf971b2b84bb009f5e6c9db5c0af3e0521', tipo: 'medico', zona: null,
      nombre: 'Wilmer Buitrago', detalle: 'Acceso personal' },
    { usuario: 'ximenaangarita', sal: '2cef5fdb38c0de751c7a6f43931eef75', iter: 300000, huella: 'cbdaf79de9e802e3f6cab8275ad39675fd819b2bc6613b2ed52b76b4fa1607d9', tipo: 'medico', zona: null,
      nombre: 'Ximena Sanchez Angarita', detalle: 'Acceso personal', portafolio: 'e4d0056914bd30e3ac9916fe' },
    { usuario: 'yaniraguerrero', sal: '492de2802aae58637b6f288caeed8e6d', iter: 300000, huella: '4820234d1ecf7ef9812d994afa56535bdbaa3434e87d6d952d5f18ed9045e87e', tipo: 'medico', zona: null,
      nombre: 'Yanira Guerrero', detalle: 'Acceso personal' },
    { usuario: 'yleanagavidia', sal: '329799f3b831851902c5144ed61b0ca0', iter: 300000, huella: 'e214928cd1113b10b6f6430c1c34d3c541e60f8b3d8b47e0464c7e172b19e77e', tipo: 'medico', zona: null,
      nombre: 'Yleana del Valle Alford Gavidia', detalle: 'Acceso personal', portafolio: '8ee100a576bf68936ef4d349' },
    { usuario: 'yolexyvalencia', sal: '81a2b5508d888d1110f92af3c406d07b', iter: 300000, huella: '2b106d448d032adc2afdb26b2be6d11d6deb87658024a70a241002ef6b0de1d5', tipo: 'medico', zona: null,
      nombre: 'Yolexy Del Carmen Castilla Valencia', detalle: 'Acceso personal' },
    { usuario: 'yuranipineda', sal: '0ecb2cde3ae34e6461519b33bf28c61c', iter: 300000, huella: '9fb29a26b37889a6d3516f85bc4f9cf222b95149edc83bb33b924576818085d9', tipo: 'medico', zona: null,
      nombre: 'Yurani Pineda', detalle: 'Acceso personal' },
    { usuario: 'epitheliumsa', sal: 'e29401b8366599bf95b0978acd85c7fd', iter: 300000, huella: '955dfaac3e33711c3d5d3198eb2d3268f0e0630876d341d6259ffcb76effc7b2', tipo: 'medico', zona: null,
      nombre: 'Acceso general Epithelium', detalle: 'Vademécum Epithelium' }
];
let usuarioInterno = null;   // usuario interno con nombre (para el saludo)
let avisoLogin = '';         // mensaje que se muestra en el login (p. ej. acceso vencido)

const URL_DATOS = 'https://raw.githubusercontent.com/nanorsf/vademecum-epithelium/main/';

// Los productos y los portafolios los sube el administrador desde "Bases de datos" de Ruta Comercial (servidor de Google).
// Se piden primero allá; si no responde o no hay nada subido, se usan los archivos publicados con la app.
const URL_SERVIDOR = 'https://script.google.com/macros/s/AKfycbwji7WhPpF2VhCRQETWXNFhF2PTAL8JP8z9SW-stsKdnjbyBa-KVucGCvm6seoTFLfl3Q/exec';

let productos = [];
let materiasPrimas = [];
let productosTerminados = [];
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
// Las muestras (etiqueta "Muestras") solo las ven el equipo y los comerciales: ni clientes, ni médicos, ni invitados
const productosVisibles = () => (modoUsuario === 'equipo' || modoUsuario === 'comercial') ? productos
    : productos.filter(p => p['Etiquetas de producto'] !== 'Muestras');
const CATALOGOS = {
    prod: {
        pantalla: 'mainScreen', tema: '',
        ids: { nombre: 'searchName', componentes: 'searchComponents', categoria: 'filterCategory', forma: 'filterFormula', etiqueta: 'filterEtiqueta', nuevo: 'btnNuevo', resultados: 'resultados' },
        datos: () => productosVisibles(), filtrados: [], soloNuevos: false
    },
    pt: {
        pantalla: 'ptScreen', tema: '',
        ids: { nombre: 'ptSearchName', componentes: 'ptSearchComponents', categoria: 'ptFilterCategory', forma: 'ptFilterFormula', etiqueta: 'ptFilterEtiqueta', nuevo: 'ptBtnNuevo', resultados: 'ptResultados' },
        datos: () => productosTerminados, filtrados: [], soloNuevos: false
    },
    port: {
        pantalla: 'portScreen', tema: 'theme-port',
        ids: { nombre: 'pfSearchName', componentes: 'pfSearchComponents', categoria: 'pfFilterCategory', forma: 'pfFilterFormula', etiqueta: 'pfFilterEtiqueta', nuevo: 'pfBtnNuevo', resultados: 'pfResultados' },
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

async function desdeServidor(cuerpo, campo, esValido) {
    const corte = new AbortController(), reloj = setTimeout(() => corte.abort(), 12000);
    try {
        const resp = await fetch(URL_SERVIDOR, { method: 'POST', signal: corte.signal, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(cuerpo) });
        const r = await resp.json();
        if (r.ok && esValido(r[campo])) return r[campo];
    } catch (error) {
        console.warn('No se pudo traer del servidor:', error);
    } finally { clearTimeout(reloj); }
    return null;
}
const esPortafolio = d => d && Array.isArray(d.productos) && d.productos.length > 0;
// La categoría va limpia, sin el prefijo de Odoo ("Magistral de Pedido / Capilares" → "Capilares")
const limpiarCategoria = c => String(c || '').replace(/^(Magistral de Pedido|Producto Terminado)\s*\/\s*/, '').trim();
const datosPortafolio = async huella => {
    const d = await desdeServidor({ accion: 'vademecumPortafolio', huella }, 'portafolio', esPortafolio)
        || await descargarJSON(`portafolios/${huella}.json`, d => d && Array.isArray(d.productos));
    if (d && Array.isArray(d.productos)) d.productos.forEach(p => { p['Categoría del Producto'] = limpiarCategoria(p['Categoría del Producto']); });
    return d;
};

async function cargarDatos() {
    productos = await desdeServidor({ accion: 'vademecumMaestro' }, 'productos', d => Array.isArray(d) && d.length > 100) || await descargarJSON('data.json') || [];
    productos.forEach(p => {
        p['Categoría del Producto'] = limpiarCategoria(p['Categoría del Producto']);
    });
    productos.sort(compararProductos);
    console.log(`✅ ${productos.length} productos cargados`);
    productosTerminados = await desdeServidor({ accion: 'vademecumProductoTerminado' }, 'productoterminado', d => Array.isArray(d) && d.length > 0) || await descargarJSON('producto-terminado.json') || [];
    productosTerminados.forEach(p => { p['Categoría del Producto'] = limpiarCategoria(p['Categoría del Producto']); });
    productosTerminados.sort(compararProductos);
    materiasPrimas = await desdeServidor({ accion: 'vademecumMateriasPrimas' }, 'materiasprimas', d => Array.isArray(d) && d.length > 50) || await descargarJSON('materias-primas.json') || [];
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
    const datos = await datosPortafolio(huella);
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
        if (!x.clave) continue;   // los que tienen solo "acceso" entran desde Ruta Comercial
        if (x.usuario) {
            if (u === x.usuario.toLowerCase() && c.toLowerCase() === x.clave.toLowerCase()) return x;
        } else {
            const codigo = (c || u).toUpperCase();
            if (codigo === x.clave.toUpperCase() && (!u || !c)) return x;
        }
    }
    return null;
}

// Huella lenta (PBKDF2-SHA256 con sal): hace inviable adivinar la clave a partir de la huella publicada
async function derivarClave(texto, salHex, iteraciones) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(texto), 'PBKDF2', false, ['deriveBits']);
    const sal = new Uint8Array(salHex.match(/../g).map(h => parseInt(h, 16)));
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iteraciones }, base, 256);
    return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}
// El acceso es válido hasta el final del día de vencimiento
// Un invitado es el que tiene huella con sal (INVITADOS); `vence` es opcional: sin vencimiento el acceso no caduca
const esInvitadoUsuario = x => !!(x && x.sal && x.huella);
const invitadoVigente = x => !x.vence || Date.now() <= new Date(x.vence + 'T23:59:59').getTime();
const TEXTO_ACCESO_FINALIZADO = 'Tu acceso ha finalizado. Para renovar o cambiar tu clave, comunícate con tu proveedor Epithelium.';
const textoVencido = () => TEXTO_ACCESO_FINALIZADO;

// Invitado por usuario + clave (la clave se compara sin guiones, espacios ni mayúsculas)
async function buscarInvitado(usuario, clave) {
    const u = String(usuario || '').trim().toLowerCase();
    const c = String(clave || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!u || !c) return null;
    const x = INVITADOS.find(i => i.usuario === u);
    if (!x) return null;
    return (await derivarClave(`${u}:${c}`, x.sal, x.iter)) === x.huella ? x : null;
}

// Invitado que además es cliente: se carga su vademécum de cliente para mostrarle ese botón en el inicio
// Con varias tiendas (`portafolios`) se juntan todos los productos en un solo portafolio y cada tarjeta dice a qué tienda pertenece
async function cargarPortafolioInvitado(x) {
    if (x.portafolios && x.portafolios.length) {
        const todos = [];
        for (const huella of x.portafolios) {
            const datos = await datosPortafolio(huella);
            if (datos) datos.productos.forEach(p => todos.push({ ...p, tienda: datos.cliente }));
        }
        clienteNombre = '';
        portafolioPropio = todos;
    } else if (x.portafolio && await cargarPortafolio(x.portafolio)) {
        // Un solo vademécum: también dice a qué tienda pertenece
        const tienda = clienteNombre;
        portafolioPropio = portafolioPropio.map(p => ({ ...p, tienda }));
    }
}

function iniciarSesionInvitado(x) {
    modoUsuario = x.tipo;
    zonaUsuario = null;
    usuarioInterno = x;
    localStorage.setItem('vademecum_interno', JSON.stringify({ tipo: x.tipo, zona: null, usuario: x.usuario, invitado: true }));
    localStorage.removeItem('vademecum_cliente');
    localStorage.setItem('vademecum_timestamp', new Date().toISOString());
}

// Enlace directo para invitados: #invitado=usuario:clave (se borra de la barra de direcciones al entrar)
async function accesoInvitadoPorEnlace() {
    const m = location.hash.match(/invitado=([A-Za-z0-9_.-]+):([A-Za-z0-9-]+)/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);
    const x = await buscarInvitado(m[1], m[2]);
    if (!x) { avisoLogin = '❌ Enlace no válido. Comunícate con tu proveedor Epithelium.'; return; }
    if (!invitadoVigente(x)) { avisoLogin = textoVencido(x); return; }
    iniciarSesionInvitado(x);
}

// Marca de agua tipo sello redondo, muy tenue, con el nombre del invitado (disuade copias y permite rastrear capturas)
function lineasSello(nombre) {
    // Reparte el nombre en líneas; si es muy largo, usa letra más pequeña y recorta con "…"
    const partir = max => {
        const out = [];
        let actual = '';
        nombre.split(/\s+/).forEach(p => {
            if (actual && (actual + ' ' + p).length > max) { out.push(actual); actual = p; }
            else actual = actual ? actual + ' ' + p : p;
        });
        if (actual) out.push(actual);
        return out;
    };
    let lineas = partir(18), tam = 9.5, paso = 13;
    if (lineas.length > 4) { lineas = partir(25); tam = 7.6; paso = 10.5; }
    if (lineas.length > 5) { lineas = lineas.slice(0, 5); lineas[4] = lineas[4].replace(/.{0,3}$/, '') + '…'; }
    return { lineas, tam, paso };
}
function ponerMarcaAgua(x) {
    let el = document.getElementById('marcaAgua');
    if (!x) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'marcaAgua'; document.body.appendChild(el); }
    const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const A = 0.07;   // intensidad del sello
    const { lineas, tam, paso } = lineasSello(x.nombre);
    const y0 = 171 - (lineas.length - 1) * paso / 2;
    const texto = lineas.map((l, k) => `<text x="170" y="${y0 + k * paso}" font-size="${tam}" font-weight="bold">${esc(l)}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="340" height="340" viewBox="0 0 340 340"><g transform="rotate(-18 170 170)" fill="rgba(0,107,79,${A})" stroke="rgba(0,107,79,${A})" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><defs><path id="c" d="M170,170 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs><circle cx="170" cy="170" r="108" fill="none" stroke-width="3.2"/><circle cx="170" cy="170" r="102" fill="none" stroke-width="1"/><circle cx="170" cy="170" r="56" fill="none" stroke-width="1.6"/><g stroke="none"><text font-size="12" font-weight="bold" letter-spacing="1.2" word-spacing="3"><textPath href="#c" startOffset="50%">EPITHELIUM S.A. • USO EXCLUSIVO • CONFIDENCIAL •</textPath></text>${texto}<text x="170" y="${y0 + lineas.length * paso + 4}" font-size="7" letter-spacing="0.4">© Epithelium S.A.</text></g></g></svg>`;
    el.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    ajustarMarca();
}
// Sello de seguridad: solo los usuarios externos (invitado, cliente y médico general) lo llevan, en todas las pantallas.
// El equipo y los comerciales (internos) nunca lo llevan, ni siquiera al abrir el portafolio de un cliente.
function actualizarMarca(pantalla) {
    if (pantalla === 'loginScreen') return ponerMarcaAgua(null);
    if (esInvitadoUsuario(usuarioInterno)) return ponerMarcaAgua(usuarioInterno);          // invitado
    if (modoUsuario === 'cliente' && clienteNombre) return ponerMarcaAgua({ nombre: clienteNombre });
    if (modoUsuario === 'medico') return ponerMarcaAgua({ nombre: 'Acceso médico autorizado' });
    ponerMarcaAgua(null);
}
// Sellos más espaciados: más grandes en pantallas amplias, más pequeños en celulares
function ajustarMarca() {
    const el = document.getElementById('marcaAgua');
    if (!el) return;
    const lado = window.innerWidth >= 700 ? 400 : 300;
    el.style.backgroundSize = `${lado}px ${lado}px`;
}
window.addEventListener('resize', ajustarMarca);

// Mide el pie de protección de datos para dejar espacio al final de las pantallas
function ajustarPie() {
    const pie = document.getElementById('avisoLegal');
    if (!pie.hidden) document.documentElement.style.setProperty('--pie-alto', pie.offsetHeight + 'px');
}
window.addEventListener('resize', ajustarPie);

// Cierra la sesión del invitado si su acceso venció mientras la app estaba abierta
function revisarVencimiento() {
    if (usuarioInterno && usuarioInterno.vence && !invitadoVigente(usuarioInterno)) {
        avisoLogin = textoVencido(usuarioInterno);
        limpiarSesion();
        document.getElementById('errorMsg').textContent = avisoLogin;
    }
}

// Acceso directo desde Ruta Comercial para el equipo interno: el enlace trae #acceso=<código>, que es
// SHA-256 de "vademecum:usuario:clave" (en minúsculas). Solo sirve para los usuarios internos con nombre.
async function accesoDesdeRutaComercial() {
    const m = location.hash.match(/acceso=([0-9a-f]{64})/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);   // el código no queda a la vista
    for (const x of USUARIOS_INTERNOS.filter(u => u.usuario)) {
        const bytes = new TextEncoder().encode(`vademecum:${x.usuario}:${x.clave}`.toLowerCase());
        const hash = x.acceso || [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
        if (hash === m[1]) {
            localStorage.setItem('vademecum_interno', JSON.stringify({ tipo: x.tipo, zona: x.zona || null, usuario: x.usuario }));
            localStorage.removeItem('vademecum_cliente');
            localStorage.setItem('vademecum_timestamp', new Date().toISOString());
            return;
        }
    }
}

async function verificarAcceso() {
    await accesoDesdeRutaComercial();
    await accesoInvitadoPorEnlace();
    const interno = localStorage.getItem('vademecum_interno');
    const clienteGuardado = localStorage.getItem('vademecum_cliente');
    if (interno) {
        try {
            const s = JSON.parse(interno);
            if (s.invitado) {
                const inv = INVITADOS.find(x => x.usuario === s.usuario);
                if (inv && invitadoVigente(inv)) {
                    modoUsuario = inv.tipo;
                    zonaUsuario = null;
                    usuarioInterno = inv;
                    await cargarPortafolioInvitado(inv);
                    return entrarApp();
                }
                avisoLogin = TEXTO_ACCESO_FINALIZADO;
            } else {
                modoUsuario = s.tipo;
                zonaUsuario = s.zona || null;
                usuarioInterno = USUARIOS_INTERNOS.find(x => x.usuario && x.usuario === s.usuario) || null;
                return entrarApp();
            }
        } catch (e) { localStorage.removeItem('vademecum_interno'); }
    }
    if (clienteGuardado && await cargarPortafolio(clienteGuardado)) {
        modoUsuario = 'cliente';
        return entrarApp();
    }
    mostrarPantalla('loginScreen');
    localStorage.removeItem('vademecum_interno');
    localStorage.removeItem('vademecum_cliente');
    if (avisoLogin) document.getElementById('errorMsg').textContent = avisoLogin;
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
        usuarioInterno = interno.usuario ? interno : null;
        localStorage.setItem('vademecum_interno', JSON.stringify({ tipo: interno.tipo, zona: interno.zona || null, usuario: interno.usuario || null }));
        localStorage.removeItem('vademecum_cliente');
        localStorage.setItem('vademecum_timestamp', new Date().toISOString());
        errorMsg.textContent = '';
        return entrarApp();
    }
    // Invitados: usuario + clave larga (con vencimiento)
    if (usuario && clave) {
        const inv = await buscarInvitado(usuario, clave);
        if (inv) {
            if (!invitadoVigente(inv)) {
                errorMsg.textContent = textoVencido(inv);
                document.getElementById('accessCode').value = '';
                return;
            }
            iniciarSesionInvitado(inv);
            await cargarPortafolioInvitado(inv);
            errorMsg.textContent = '';
            return entrarApp();
        }
    }
    // Clientes: usuario + clave (iniciales en mayúscula + dos números, ej: AO84; da igual si la escriben en minúscula)
    if (usuario && /^[A-Za-z]{2}\d{2}$/.test(clave)) {
        errorMsg.textContent = 'Verificando...';
        const huella = await huellaCliente(usuario.toLowerCase(), clave.toUpperCase());
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

function limpiarSesion() {
    localStorage.removeItem('vademecum_interno');
    localStorage.removeItem('vademecum_cliente');
    localStorage.removeItem('vademecum_timestamp');
    modoUsuario = 'cliente';
    zonaUsuario = null;
    usuarioInterno = null;
    portafolio = [];
    portafolioPropio = [];
    clienteNombre = '';
    ponerMarcaAgua(null);
    document.getElementById('avisoLegal').hidden = true;
    document.body.classList.remove('con-aviso-legal');
    document.getElementById('modalDetail').classList.remove('active');
    mostrarPantalla('loginScreen');
    document.getElementById('accessUser').value = '';
    document.getElementById('accessCode').value = '';
    document.getElementById('errorMsg').textContent = '';
}

function cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) limpiarSesion();
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

// Sugerencias de componentes (completas); al escribir una coma se ofrecen de nuevo para sumar otro componente
const sugerenciasBase = {};
function llenarDatalist(id, valores) {
    sugerenciasBase[id] = valores;
    const lista = document.getElementById(id);
    lista.innerHTML = '';
    valores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        lista.appendChild(option);
    });
}

// Búsqueda de componentes: se pueden elegir varios, separados por coma ("minoxidil, finasteride": productos que tienen todos)
function sugerirComponentes(inputId, listaId) {
    const entrada = document.getElementById(inputId).value, i = entrada.lastIndexOf(',');
    const previo = i >= 0 ? entrada.slice(0, i + 1).trim() + ' ' : '';
    const yaElegidos = new Set(previo.split(',').map(t => normalizar(t)).filter(Boolean));
    const lista = document.getElementById(listaId);
    lista.innerHTML = '';
    (sugerenciasBase[listaId] || []).filter(v => !yaElegidos.has(normalizar(v))).forEach(v => {
        const option = document.createElement('option');
        option.value = previo + v;
        lista.appendChild(option);
    });
}
[['searchComponents', 'dlComponentes'], ['pfSearchComponents', 'pfDlComponentes'], ['mpSearchUso', 'dlUsos']].forEach(([inp, dl]) =>
    document.getElementById(inp).addEventListener('input', () => sugerirComponentes(inp, dl)));

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
    const esInvitado = esInvitadoUsuario(usuarioInterno);
    ponerMarcaAgua(esInvitado ? usuarioInterno : null);   // el sello solo lo lleva el invitado
    // Protección de datos: pie fijo para todos los usuarios, en todos los vademécums
    document.getElementById('avisoLegal').hidden = false;
    document.body.classList.add('con-aviso-legal');
    document.getElementById('anioLegal').textContent = new Date().getFullYear();
    ajustarPie();
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
    const varias = !!(usuarioInterno && usuarioInterno.portafolios && usuarioInterno.portafolios.length);
    const veClientes = (modoUsuario === 'equipo' || modoUsuario === 'comercial') && indiceClientes.length > 0;
    document.getElementById('btnPortafolioClientes').style.display = veClientes ? '' : 'none';
    document.getElementById('btnPortClientesTexto').textContent = varias ? 'Los vademécum de tus tiendas' : 'Consulta el portafolio de cualquier cliente';
    // El filtro de Etiqueta solo lo ven el equipo y los comerciales
    const verEtiqueta = modoUsuario === 'equipo' || modoUsuario === 'comercial';
    document.getElementById('filterEtiqueta').style.display = verEtiqueta ? '' : 'none';
    document.getElementById('pfFilterEtiqueta').style.display = verEtiqueta ? '' : 'none';
    document.getElementById('ptFilterEtiqueta').style.display = verEtiqueta ? '' : 'none';
    // Solo el personal interno puede buscar también por código (Referencia Interna)
    const textoBusqueda = verEtiqueta ? 'Buscar por nombre o código...' : 'Buscar por nombre...';
    document.getElementById('searchName').placeholder = textoBusqueda;
    document.getElementById('pfSearchName').placeholder = textoBusqueda;
    document.getElementById('ptSearchName').placeholder = textoBusqueda;
    const totalNuevos = productos.filter(p => p['Etiquetas de producto'] === 'Nuevo').length;
    document.getElementById('loNuevoTexto').textContent = `${totalNuevos} productos nuevos de Epithelium`;
    document.getElementById('btnPortafolio').style.display = (esCliente || (usuarioInterno && (usuarioInterno.portafolio || varias) && portafolioPropio.length)) ? '' : 'none';
    // Invitado con menú limitado (`solo`): en el inicio ve únicamente esos vademécums (claves: lo-nuevo, epithelium, producto-terminado, materias-primas)
    const solo = esInvitadoUsuario(usuarioInterno) && usuarioInterno.solo;
    [['btnLoNuevo', 'lo-nuevo'], ['btnEpithelium', 'epithelium'], ['btnProductoTerminado', 'producto-terminado'], ['btnMateriasPrimas', 'materias-primas']]
        .forEach(([id, k]) => { document.getElementById(id).style.display = !solo || solo.includes(k) ? '' : 'none'; });
    if (solo) ['btnPortafolio', 'btnPortafolioClientes'].forEach(id => { document.getElementById(id).style.display = 'none'; });
    const subPort = document.querySelector('#btnPortafolio small');
    if (subPort) subPort.textContent = varias ? 'Los productos de tus tiendas' : 'Los productos de tu vademécum propio';
    const intro = document.getElementById('homeIntro');
    // Comerciales e internos con nombre: "Hola, <nombre>" y debajo su cargo o zona, igual que en Ruta Comercial
    if (!esCliente && usuarioInterno) {
        intro.textContent = '';
        const saludo = document.createElement('span');
        saludo.className = 'home-saludo';
        saludo.innerHTML = `<span class="saludo-hora"></span><span class="saludo-nombre"></span>`;
        saludo.querySelector('.saludo-nombre').textContent = usuarioInterno.nombre;
        const detalle = document.createElement('small');
        detalle.textContent = usuarioInterno.detalle;
        saludo.appendChild(detalle);
        intro.appendChild(saludo);
        return irInicio();
    }
    intro.textContent = '¿Qué quieres consultar?';
    let saludoTexto = '';
    if (esCliente) saludoTexto = clienteNombre;
    else if (modoUsuario === 'comercial') saludoTexto = `Comercial · ${zonaUsuario}`;
    else if (modoUsuario === 'equipo') saludoTexto = 'Equipo Epithelium';
    if (saludoTexto) {
        const saludo = document.createElement('span');
        saludo.className = 'home-saludo';
        saludo.innerHTML = `<span class="saludo-hora"></span><span class="saludo-nombre"></span>`;
        saludo.querySelector('.saludo-nombre').textContent = saludoTexto;
        intro.prepend(saludo);
    }
    irInicio();
}

// Saludo según la hora de Bogotá: 5:00-11:59 buenos días, 12:00-17:59 buenas tardes, el resto buenas noches
function saludoHora() {
    const h = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Bogota' }).format(new Date())) % 24;
    return h >= 5 && h < 12 ? 'Buenos días' : h >= 12 && h < 18 ? 'Buenas tardes' : 'Buenas noches';
}
function pintarSaludo() {
    const s = document.querySelector('#homeIntro .saludo-hora');
    if (s) s.textContent = `${saludoHora()},`;
}

function irInicio() {
    pintarSaludo();
    mostrarPantalla('homeScreen');
}

function abrirProductos() {
    limpiarFiltros('prod');
    ponerNuevo('prod', false);
    mostrarPantalla('mainScreen');
}

function abrirProductoTerminado() {
    limpiarFiltros('pt');
    filtrar('pt');
    mostrarPantalla('ptScreen');
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
    document.getElementById('portTitulo').textContent = 'Vademécum Cliente';
    document.getElementById('portBackBtn').innerHTML = '&larr; Inicio';
    document.getElementById('portBackBtn').onclick = irInicio;
    mostrarPantalla('portScreen');
}

// Clientes que puede ver el usuario: el comercial solo los de su zona; el equipo, todos
function clientesVisibles() {
    if (modoUsuario === 'medico' && usuarioInterno && usuarioInterno.portafolios) return indiceClientes.filter(c => usuarioInterno.portafolios.includes(c.huella));
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
    selZona.style.display = modoUsuario === 'equipo' ? '' : 'none';
    const zonas = [...new Set(indiceClientes.map(c => c.zona).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
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
    ['nombre', 'componentes', 'categoria', 'forma', 'etiqueta'].forEach(campo => {
        document.getElementById(ids[campo]).value = '';
    });
}

async function abrirPortafolioDeCliente(huella, nombre) {
    const datos = await datosPortafolio(huella);
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
    if (document.getElementById('app')) actualizarMarca(screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function llenarSelect(select, valores) {
    select.length = 1;
    // Siempre en orden alfabético (la opción "Todas..." queda de primera)
    [...valores].sort((x, y) => x.localeCompare(y, 'es', { sensitivity: 'base' })).forEach(v => {
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
    // Etiquetas (solo visibles para equipo y comerciales). En el portafolio se ofrecen todas
    // las etiquetas vigentes de la compañía (del maestro) más "Cliente", no solo las del cliente.
    const etiquetas = [...new Set(fuente.map(p => p['Etiquetas de producto']).filter(e => e))]
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    llenarSelect(document.getElementById(cat.ids.categoria), categorias);
    llenarSelect(document.getElementById(cat.ids.etiqueta), etiquetas);
    llenarDatalist(k === 'port' ? 'pfDlComponentes' : k === 'pt' ? 'ptDlComponentes' : 'dlComponentes', opcionesUnicas(datos.flatMap(componentesDe)));
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
    const esInterno = modoUsuario === 'equipo' || modoUsuario === 'comercial';
    // El personal interno puede buscar varios productos a la vez, separados por coma (o por espacio si son códigos): "MP1107, MP1108"
    const esCodigo = t => /^[a-z]{2}\d{3,}$/.test(t);
    const porEspacio = searchName.split(/\s+/).filter(Boolean);
    const terminos = !esInterno ? [searchName]
        : /[,;]/.test(searchName) ? searchName.split(/[,;]/).map(t => t.trim()).filter(Boolean)
        : porEspacio.length > 1 && porEspacio.every(esCodigo) ? porEspacio : [searchName];
    const terminosComponentes = normalizar(valor('componentes')).split(/[,;]/).map(t => t.trim()).filter(Boolean);
    const filterCategory = valor('categoria');
    const filterFormula = valor('forma');
    const filterEtiqueta = valor('etiqueta');
    cat.filtrados = cat.datos().filter(p => {
        // El personal interno (equipo y comerciales) también puede buscar por código (Referencia Interna)
        const matchName = terminos.some(t => normalizar(p['Nombre']).includes(t) || normalizar(p.nombreEpithelium).includes(t)
            || (esInterno && normalizar(p['Referencia Interna']).includes(t)));
        const compuestos = normalizar(p['Componentes']);
        const matchComponents = terminosComponentes.every(t => compuestos.includes(t));
        const matchCategory = !filterCategory || p['Categoría del Producto'] === filterCategory;
        const matchFormula = !filterFormula || p['Forma Farmacéutica'] === filterFormula;
        const matchEtiqueta = !filterEtiqueta || p['Etiquetas de producto'] === filterEtiqueta;
        const matchNuevo = !cat.soloNuevos || p['Etiquetas de producto'] === 'Nuevo';
        return matchName && matchComponents && matchCategory && matchFormula && matchEtiqueta && matchNuevo;
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
        const esMuestra = p['Etiquetas de producto'] === 'Muestras';
        const color = esMuestra ? null : colorProductoCat(p['Categoría del Producto']);   // las muestras llevan su propio color, sea cual sea su categoría
        const card = document.createElement('div');
        card.className = (esNuevo ? 'producto-card es-nuevo' : 'producto-card') + (esMuestra ? ' es-muestra' : '') + (color ? ' mp-card' : '');
        card.onclick = () => mostrarDetalle(p, cat.tema);
        const badge = p.nuevoEpithelium ? '<span class="badge-nuevo">NUEVO EPITHELIUM</span>' : (esNuevo ? '<span class="badge-nuevo">NUEVO</span>' : '');
        const barra = color ? `<span class="mp-barra" style="background:${rgbaHex(color, 0.55)}"></span>` : '';
        card.innerHTML = `${barra}${p.tienda ? `<div class="tienda-fila"><span class="tienda-tag">${p.tienda}</span></div>` : ''}<h3>${p['Nombre']}${badge}</h3>${p.nombreEpithelium ? lineaEpithelium(p.nombreEpithelium) : ''}${p['Componentes'] ? `<p><strong>Componentes:</strong> ${p['Componentes']}</p>` : ''}<p><strong>Forma:</strong> ${p['Forma Farmacéutica']}</p>${p['Categoría del Producto'] ? `<p><strong>Categoría:</strong> ${p['Categoría del Producto']}</p>` : ''}${p['Indicación'] ? `<p style="font-size: 12px; color: #999; margin-top: 8px;">${p['Indicación'].substring(0, 100)}...</p>` : ''}`;
        container.appendChild(card);
    });
}

function temaModal(tema) {
    const box = document.querySelector('#modalDetail .modal-content');
    box.classList.remove('theme-mp', 'theme-nuevo', 'theme-port', 'theme-muestra');
    box.style.background = '';
    box.style.borderTopColor = '';
    if (tema) box.classList.add(tema);
}

function mostrarDetalle(producto, tema = '') {
    const esMuestra = producto['Etiquetas de producto'] === 'Muestras';
    temaModal(esMuestra ? 'theme-muestra' : producto['Etiquetas de producto'] === 'Nuevo' ? 'theme-nuevo' : tema);
    const modal = document.getElementById('modalDetail');
    const content = document.getElementById('detailContent');
    // Fondo tenue con el color de la categoría del producto
    const verEtiqueta = modoUsuario === 'equipo' || modoUsuario === 'comercial';
    const color = esMuestra ? null : colorProductoCat(producto['Categoría del Producto']);
    if (color) {
        const mc = document.querySelector('#modalDetail .modal-content');
        mc.style.background = fondoCategoria(color);
        mc.style.borderTopColor = color;
    }
    content.innerHTML = `<h2>${producto['Nombre']}</h2>${producto.tienda ? `<div class="tienda-fila"><span class="tienda-tag">${producto.tienda}</span></div>` : ''}${producto.nombreEpithelium ? lineaEpithelium(producto.nombreEpithelium) : ''}${producto['Componentes'] ? `<strong>Componentes</strong><p>${producto['Componentes'].replace(/\n/g, '<br>')}</p>` : ''}<strong>Especificaciones</strong><p>${producto['Categoría del Producto'] ? `<strong>Categoría:</strong> ${producto['Categoría del Producto']}<br>` : ''}<strong>Forma:</strong> ${producto['Forma Farmacéutica']}<br><strong>Presentación:</strong> ${producto['Presentación Farmacéutica']}<br><strong>Tamaño:</strong> ${producto['Tamaño']} ${producto['Masa']}</p>${producto['Indicación'] ? `<strong>Indicación</strong><p>${producto['Indicación'].replace(/\n/g, '<br>')}</p>` : ''}${producto['Dosis Recomendada'] ? `<strong>Dosis Recomendada</strong><p>${producto['Dosis Recomendada'].replace(/\n/g, '<br>')}</p>` : ''}<strong>Referencia Interna</strong><p>${producto['Referencia Interna']}</p>${(verEtiqueta && producto['Etiquetas de producto']) ? `<strong>Etiqueta</strong><p><span class="producto-label">${producto.nuevoEpithelium ? 'Nuevo Epithelium' : producto['Etiquetas de producto']}</span></p>` : ''}`;
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
    // Varias materias primas a la vez separadas por coma (cualquiera de ellas); varios usos separados por coma (deben cumplirse todos)
    const terminosName = normalizar(document.getElementById('mpSearchName').value).split(/[,;]/).map(t => t.trim());
    const terminosUso = normalizar(document.getElementById('mpSearchUso').value).split(/[,;]/).map(t => t.trim()).filter(Boolean);
    if (terminosName.length > 1) terminosName.splice(0, terminosName.length, ...terminosName.filter(Boolean));
    const filterCategoria = document.getElementById('mpFilterEtiqueta').value;
    materiasPrimasFiltradas = materiasPrimas.filter(m => {
        const matchName = terminosName.some(t => normalizar(m['Nombre']).includes(t));
        const textoUso = normalizar(m['Uso Terapéutico y Cosmético'] + ' ' + m['Identificación Técnica']);
        const matchUso = terminosUso.every(t => textoUso.includes(t));
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
    box.style.borderTopColor = colorCategoria(m['Categoria Principal']);
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

async function actualizarApp() {
    // Fuerza a buscar el service worker nuevo antes de recargar, para no quedarse pegado en la versión vieja
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
        } catch (e) { /* sin conexión: recarga normal */ }
    }
    location.replace(location.pathname + '?v=' + Date.now());
}

// Registra el service worker para que la app funcione sin conexión (guarda app + datos; portafolios no)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

document.addEventListener('DOMContentLoaded', revisarVersion);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { revisarVersion(); revisarVencimiento(); } });
setInterval(revisarVencimiento, 5 * 60 * 1000);
