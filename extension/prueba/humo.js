#!/usr/bin/env node
// Prueba de humo: carga la extensión con un `vscode` de mentira sobre una
// empresa de mentira y comprueba lo que se puede comprobar sin abrir el
// editor. No sustituye a mirar la pantalla, pero pilla lo que se rompe en
// silencio: un comando que no se registra, un README que deja de parsearse, un
// botón que aparece cuando no debe.
//
//   node prueba/humo.js

const Module = require('node:module');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const assert = require('node:assert/strict');

// `require('vscode')` solo existe dentro del editor: aquí se desvía al falso.
const resolver = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  if (pedido === 'vscode') return require.resolve('./vscode-falso.js');
  return resolver.call(this, pedido, ...resto);
};

const vscode = require('./vscode-falso');
const { montar, montarMarca } = require('./empresa-falsa');

const RAIZ = path.join(__dirname, '..');
const cargar = (m) => require(path.join(RAIZ, 'src', m));

let pasadas = 0;

// Espera siempre: media prueba es asíncrona, y si no se espera se solapan unas
// con otras y los fallos aparecen en la comprobación equivocada.
const comprobar = async (titulo, fn) => {
  try {
    const detalle = await fn();
    pasadas += 1;
    console.log(`  ✓ ${titulo}${detalle ? ` — ${detalle}` : ''}`);
  } catch (error) {
    console.error(`  ✗ ${titulo}\n    ${error.message}`);
    process.exitCode = 1;
  }
};

async function main() {
  const empresa = montar();
  vscode.guion.raiz = empresa;
  console.log(`Empresa de mentira en ${empresa}\n`);

  // ---------------------------------------------------- los módulos cargan
  const modulos = ['entorno', 'proyecto', 'frontmatter', 'procesos', 'rsc', 'guardar',
    'conexiones', 'acciones', 'cerebro', 'brujula', 'puente', 'soporte', 'disfraz', 'arrancar', 'git', 'extension'];
  await comprobar('todos los módulos cargan', () => {
    modulos.forEach(cargar);
    return `${modulos.length} módulos`;
  });

  const acciones = cargar('acciones');
  const conexiones = cargar('conexiones');
  const cerebro = cargar('cerebro');
  const buscador = cargar('buscar');
  const consejos = cargar('consejos');
  const brujula = cargar('brujula');
  const disfraz = cargar('disfraz');
  const puente = cargar('puente');

  // ------------------------------------------------- botones descubiertos
  await comprobar('los botones salen de los comandos, no del código', () => {
    const encontradas = acciones.acciones();
    const nombres = encontradas.map((a) => a.nombre);
    assert.ok(!nombres.includes('checkpoint'), 'un comando interno de RSC no debe salir');
    assert.ok(!nombres.includes('guardar'), 'un comando sin boton: no debe salir');
    assert.deepEqual(nombres, ['empezar', 'seguir', 'resumen-mes'], 'orden: lo diario antes que lo aprendido');
    assert.equal(encontradas[2].etiqueta, 'Preparar el resumen del mes');
    assert.equal(encontradas[0].prompt, '/empezar');
    return `${encontradas.length} botones`;
  });

  // ------------------------------------------------------------ conexiones
  await comprobar('las herramientas salen de 01-TOOLS', () => {
    const lista = conexiones.proveedores();
    assert.equal(lista.length, 1, '_TEMPLATE no es una herramienta');
    const [holded] = lista;
    assert.equal(holded.etiqueta, 'Holded', 'el nombre sale del título del README');
    assert.equal(holded.faltan, 0, 'las dos claves están puestas');
    assert.equal(holded.tienePrueba, true);
    assert.equal(holded.cositas, 2, 'test_connection no cuenta como cosita');
    return `${holded.etiqueta}: ${holded.cositas} cositas`;
  });

  await comprobar('las claves se leen del .env.example y se enmascaran', () => {
    const { proveedor, claves } = conexiones.claves('HOLDED');
    assert.equal(proveedor.ayuda, 'https://app.holded.com/api', 'la URL sale de CREDENTIALS.md');
    const api = claves.find((c) => c.clave === 'HOLDED_API_KEY');
    assert.equal(api.etiqueta, 'Clave de acceso');
    assert.equal(api.secreta, true);
    assert.equal(api.pista, '••••5678', 'nunca se devuelve la clave entera');
    const entorno = claves.find((c) => c.clave === 'HOLDED_ENV');
    assert.equal(entorno.secreta, false);
    return `${claves.length} claves`;
  });

  await comprobar('detecta claves fuera de sitio (brownfield)', () => {
    const sueltas = cargar('sueltas');
    assert.equal(sueltas.resumen(), null, 'un arnés montado desde cero está ordenado');

    // Como un proyecto que ya existía antes de poner el arnés encima.
    fs.writeFileSync(path.join(empresa, '.env'),
      '# el .env de toda la vida\nSTRIPE_SECRET_KEY=sk_test_123\nexport SENDGRID_API_KEY=SG.abc\nPUERTO=3000\n');
    fs.mkdirSync(path.join(empresa, 'config'), { recursive: true });
    fs.writeFileSync(path.join(empresa, 'config', '.env.local'), 'MAILJET_API_KEY=abc\n');

    const hay = sueltas.resumen();
    assert.equal(hay.sitios, 2);
    assert.equal(hay.claves, 4, 'PUERTO también cuenta: es una clave, aunque no sea secreta');
    assert.match(hay.prompt, /protocolo de harness/);
    assert.ok(!hay.prompt.includes('sk_test_123'), 'el valor de una clave no sale de su fichero');

    fs.rmSync(path.join(empresa, '.env'));
    fs.rmSync(path.join(empresa, 'config'), { recursive: true });
    return `${hay.sitios} sitios · ${hay.claves} claves`;
  });

  await comprobar('la guía para conectarla sale de su propio README', () => {
    const { proveedor } = conexiones.claves('HOLDED');
    assert.equal(proveedor.pasos.length, 5, 'cinco pasos, y ninguno técnico');
    assert.match(proveedor.pasos[0], /^Entra en app\.holded\.com/);
    assert.ok(!proveedor.pasos.some((p) => /cp |chmod|\.env/.test(p)), 'los pasos de fichero no se enseñan');
    return `${proveedor.pasos.length} pasos`;
  });

  await comprobar('la guía vale aunque el asistente titule la sección a su manera', () => {
    // Caso real: con "llevar la operativa con mi ERP", el asistente montó Odoo
    // y tituló la sección "Qué hace falta", en prosa. Decirle cómo titularla no
    // basta: hay que aceptar lo que escribe de verdad.
    const carpeta = path.join(empresa, '01-TOOLS', 'ERP');
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(path.join(carpeta, '.env.example'), 'ERP_URL=\nERP_DB=\nERP_API_KEY=\n');
    fs.writeFileSync(path.join(carpeta, 'README.md'), `# Nuestro ERP

## Qué hace falta

Tres datos, que se piden una sola vez: la dirección de vuestro ERP, el nombre de la base de datos y
una clave de acceso.

La clave se genera dentro del ERP, en Preferencias y luego Seguridad de la cuenta. No es la
contraseña de entrar: es una llave aparte que se puede anular sin tocar la cuenta.

## Scripts

| Script | Qué hace | Ejemplo |
|---|---|---|
| \`listar_clientes.sh\` | Lista los clientes dados de alta | \`./listar_clientes.sh\` |
`);
    fs.writeFileSync(path.join(carpeta, 'listar_clientes.sh'), '#!/usr/bin/env bash\necho ok\n', { mode: 0o755 });

    const { proveedor, claves } = conexiones.claves('ERP');
    assert.equal(proveedor.pasos.length, 2, 'los párrafos de esa sección sirven de guía');
    assert.match(proveedor.pasos[0], /^Tres datos/);
    assert.equal(claves.find((c) => c.clave === 'ERP_DB').etiqueta, 'Base de datos', 'y no "Db"');

    fs.rmSync(carpeta, { recursive: true, force: true });
    return `${proveedor.pasos.length} párrafos como guía`;
  });

  await comprobar('cada clave dice de dónde se saca', () => {
    const { claves } = conexiones.claves('HOLDED');
    const api = claves.find((c) => c.clave === 'HOLDED_API_KEY');
    assert.equal(api.donde, 'Configuración → Desarrolladores → API');
    const entorno = claves.find((c) => c.clave === 'HOLDED_ENV');
    assert.match(entorno.donde, /^Escribe test/);
    return api.donde;
  });

  await comprobar('el modo mixto decide bien qué se puede pulsar', () => {
    const cositas = conexiones.scripts('HOLDED');
    const listar = cositas.find((c) => c.fichero === 'listar_facturas.sh');
    const crear = cositas.find((c) => c.fichero === 'crear_factura.sh');
    assert.equal(listar.pideDatos, false, 'listar_ sin argumentos se ejecuta directo');
    assert.equal(listar.etiqueta, 'Lista las facturas del mes en curso');
    assert.equal(crear.pideDatos, true, 'crear_ con <argumentos> va por el asistente');
    return 'listar directo · crear por el asistente';
  });

  await comprobar('la conexión se prueba con su propio script', async () => {
    const hecho = await conexiones.probar('HOLDED');
    assert.equal(hecho.ok, true, hecho.mensaje);
    return hecho.mensaje;
  });

  await comprobar('una cosita de solo mirar se ejecuta y devuelve su salida', async () => {
    const hecho = await conexiones.ejecutar('HOLDED', 'listar_facturas.sh');
    assert.equal(hecho.ok, true, hecho.mensaje);
    assert.match(hecho.texto, /Ferretería Soler/);
    return `${hecho.texto.split('\n').length} líneas`;
  });

  await comprobar('una cosita que pide datos se niega a ejecutarse sola', async () => {
    const hecho = await conexiones.ejecutar('HOLDED', 'crear_factura.sh');
    assert.equal(hecho.ok, false);
    assert.match(hecho.mensaje, /asistente/);
    return hecho.mensaje;
  });

  await comprobar('una clave se guarda limpia de comillas y espacios', () => {
    conexiones.escribir('HOLDED', 'HOLDED_API_KEY', '  "nueva-clave-9999"  \n');
    const api = conexiones.claves('HOLDED').claves.find((c) => c.clave === 'HOLDED_API_KEY');
    assert.equal(api.pista, '••••9999');
    const crudo = fs.readFileSync(path.join(empresa, '01-TOOLS/HOLDED/.env'), 'utf8');
    assert.match(crudo, /^HOLDED_API_KEY=nueva-clave-9999$/m);
    assert.match(crudo, /^HOLDED_ENV=test$/m, 'no pisa las demás claves');
    return 'sin comillas ni saltos';
  });

  // --------------------------------------------------------------- cerebro
  await comprobar('la wiki se lee del índice de RSC', () => {
    const temas = cerebro.catalogo();
    assert.deepEqual(temas.map((t) => t.id), ['facturacion', 'clientes']);
    assert.equal(temas[0].etiqueta, 'Facturacion');
    assert.equal(temas[1].articulos.length, 1, 'las filas de plantilla no cuentan');
    assert.equal(cerebro.cuantoSabe(), 3);
    return `${temas.length} temas · ${cerebro.cuantoSabe()} cosas`;
  });

  await comprobar('el historial y los huecos salen de log.md y gaps.md', () => {
    const aprendido = cerebro.aprendidoUltimamente(5);
    assert.equal(aprendido.length, 2, 'la entrada de plantilla no cuenta');
    assert.equal(aprendido[0].titulo, 'Ciclo de facturación', 'lo más nuevo primero');
    const huecos = cerebro.loQueAunNoSabe();
    assert.equal(huecos.length, 2);
    assert.match(huecos[0], /recargos/);
    return `${aprendido.length} aprendidas · ${huecos.length} huecos`;
  });

  await comprobar('los documentos se cuentan bien', () => {
    assert.equal(cerebro.esperandoLectura(), 1, 'el README del inbox no es un documento');
    assert.equal(cerebro.yaLeidos(), 1);
    assert.equal(cerebro.originales(), 1);
    return '1 esperando · 1 leído';
  });

  await comprobar('un artículo se lee sin su cabecera técnica', () => {
    const leido = cerebro.leerArticulo('facturacion/ciclo.md');
    assert.equal(leido.ok, true);
    assert.equal(leido.titulo, 'Ciclo de facturación');
    assert.ok(!/type:\s*article|score:|status:/.test(leido.cuerpo), 'el frontmatter no llega al alumno');
    assert.ok(!leido.cuerpo.startsWith('# '), 'el título no se repite: ya va de rótulo');
    assert.match(leido.cuerpo, /Plazos de cobro/);
    return `${leido.cuerpo.split('\n').length} líneas de texto`;
  });

  await comprobar('cada tema trae la descripción que RSC escribe en el índice', () => {
    const [facturacion] = cerebro.catalogo();
    assert.equal(facturacion.descripcion, 'Cómo se factura en esta empresa.');
    assert.equal(facturacion.articulos.length, 2, 'la descripción no cuenta como artículo');
    return facturacion.descripcion;
  });

  // ------------------------------------------------- navegar y buscar

  await comprobar('los enlaces de un artículo a otro llevan a alguna parte', () => {
    const leido = cerebro.leerArticulo('facturacion/ciclo.md');
    assert.ok(leido.ok);
    assert.equal(leido.enlaces['../clientes/ferreteria-soler.md'], 'clientes/ferreteria-soler.md',
      'el que existe se resuelve');
    assert.equal(leido.enlaces['../contratos/marco.md'], undefined,
      'el que no existe no se pinta como clicable: mejor texto que un clic roto');
    return `${Object.keys(leido.enlaces).length} enlace vivo de 2`;
  });

  await comprobar('lo escrito que el índice no menciona también se ve', () => {
    const sueltos = cerebro.sinOrdenar();
    assert.deepEqual(sueltos.map((d) => d.ruta), ['clientes/talleres-ruiz.md']);
    assert.equal(sueltos[0].titulo, 'Talleres Ruiz', 'con su título de dentro, no el del fichero');
    return sueltos[0].titulo;
  });

  await comprobar('buscar encuentra por el título, con tildes o sin ellas', () => {
    buscador.olvidar();
    const conTilde = buscador.buscar('facturación');
    const sinTilde = buscador.buscar('facturacion');
    assert.equal(conTilde.cuantos, sinTilde.cuantos, 'la tilde no cambia nada');
    const sabe = conTilde.grupos.find((g) => g.titulo === 'Cosas que sabe');
    assert.equal(sabe.aciertos[0].titulo, 'Ciclo de facturación', 'lo que se llama así, primero');
    return `${conTilde.cuantos} resultados`;
  });

  await comprobar('buscar mira también los botones y las conexiones', () => {
    const botones = buscador.buscar('resumen del mes').grupos.find((g) => g.titulo === 'Cosas que puedes hacer');
    assert.ok(botones, 'los botones del arnés también se buscan');
    assert.equal(botones.aciertos[0].titulo, 'Preparar el resumen del mes');

    const conexiones = buscador.buscar('holded').grupos.find((g) => g.titulo === 'Conexiones');
    assert.ok(conexiones, 'las conexiones también');
    assert.equal(conexiones.aciertos[0].accion.tipo, 'verConexion');
    return 'botones y conexiones';
  });

  await comprobar('lo que no está da cero, y con una salida', () => {
    const nada = buscador.buscar('criptomonedas');
    assert.equal(nada.cuantos, 0);
    assert.deepEqual(nada.grupos, []);
    return 'cero, y la pantalla ofrece preguntárselo';
  });

  await comprobar('buscar enseña la frase donde aparece, no el documento entero', () => {
    const [acierto] = buscador.buscar('pagaré').grupos[0].aciertos;
    assert.ok(acierto.frase.toLowerCase().includes('pagar'), 'la frase lleva lo buscado');
    assert.ok(acierto.frase.length < 200, 'y es una frase, no el artículo');
    return acierto.frase.slice(0, 48);
  });

  await comprobar('una ruta que se sale de la wiki se rechaza', () => {
    assert.equal(cerebro.leerArticulo('../../.rsc.json').ok, false);
    return 'rechazada';
  });

  await comprobar('los documentos elegidos se copian sin pisar nada', async () => {
    const suelto = path.join(os.tmpdir(), `contrato-talleres-ruiz.txt`);
    fs.writeFileSync(suelto, 'otro contrato');
    vscode.guion.ficheros = [suelto];
    const hecho = await cerebro.anadirDocumentos();
    assert.equal(hecho.cuantos, 1);
    assert.equal(cerebro.esperandoLectura(), 2);
    assert.ok(fs.existsSync(path.join(empresa, '02-DOCS/inbox/contrato-talleres-ruiz (2).txt')), 'el que ya estaba se respeta');
    vscode.guion.ficheros = [];
    return 'se numera en vez de sobrescribir';
  });

  // --------------------------------------------------------------- brújula
  await comprobar('la brújula traduce rutas a zonas del diccionario', () => {
    const dos = brujula.interpretar('files: 02-DOCS/wiki/facturacion/ciclo.md, 01-TOOLS/HOLDED/.env, .rsc/x');
    assert.equal(dos, 'Lo que sabe de tu empresa (Facturacion)', 'dos zonas no caben: se queda la primera');
    const donde = brujula.interpretar('files: 01-TOOLS/HOLDED/.env, 01-TOOLS/GMAIL/.env');
    assert.equal(donde, 'Conexiones (Holded) · Conexiones (Gmail)', 'si caben, las dos');
    assert.equal(brujula.interpretar('(no local continuation for this branch/worktree)'), null);
    return donde;
  });

  await comprobar('la brújula dice lo último que aprendió', async () => {
    const estado = await brujula.estado({ fresco: true });
    assert.equal(estado.listo, true);
    assert.equal(estado.hiciste, 'Aprendió sobre Ciclo de facturación');
    assert.equal(estado.conectados, 1);
    assert.equal(estado.sabe, 3);
    assert.equal(estado.esperando, 2);
    return estado.hiciste;
  });

  // ----------------------------------------------------- el puente a Claude
  await comprobar('el puente manda el texto por el comando interno', async () => {
    vscode.registrado.ejecutados.length = 0;
    const como = await puente.enviar('hola');
    assert.equal(como, 'directo');
    const envio = vscode.registrado.ejecutados.find((e) => e.id === 'claude-vscode.primaryEditor.open');
    assert.deepEqual(envio.args, [undefined, 'hola'], 'el mismo camino que usa el enlace de Anthropic');
    return 'claude-vscode.primaryEditor.open';
  });

  await comprobar('sin el comando, el puente prueba el enlace profundo', async () => {
    vscode.guion.comandosDeClaude = ['claude-vscode.focus'];
    vscode.registrado.abiertos.length = 0;
    const como = await puente.enviar('por enlace');
    assert.equal(como, 'directo');
    assert.match(vscode.registrado.abiertos.at(-1), /^vscode:\/\/anthropic\.claude-code\/open\?prompt=por%20enlace$/);
    return 'vscode://anthropic.claude-code/open';
  });

  await comprobar('sin la extensión de Claude, al portapapeles', async () => {
    vscode.guion.extensionesInstaladas = [];
    const como = await puente.enviar('adiós');
    assert.equal(como, 'copiado', 'no se manda a un enlace que nadie recoge');
    assert.equal(vscode.registrado.portapapeles, 'adiós');
    assert.ok(vscode.registrado.ejecutados.some((e) => e.id === 'claude-vscode.focus'), 'y enfoca la caja');
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    vscode.guion.comandosDeClaude = ['claude-vscode.primaryEditor.open', 'claude-vscode.focus', 'claude-vscode.editor.openLast'];
    return 'portapapeles + foco';
  });

  await comprobar('esto se llama como lo llamó el alumno, no "empresa"', () => {
    const identidad = cargar('identidad');
    const { arnes, empresa, puesto } = identidad.leer();
    assert.equal(arnes, 'Facturación', 'un arnés puede ser contabilidad, personal o un proyecto');
    assert.equal(empresa, 'Ferretería Soler');
    assert.equal(puesto, true);
    assert.equal(identidad.titulo(), 'Facturación · Ferretería Soler');
    assert.equal(identidad.deQuien(), 'Facturación');
    return identidad.titulo();
  });

  await comprobar('sin nombre puesto, se tira del de la carpeta', () => {
    const identidad = cargar('identidad');
    const suelta = fs.mkdtempSync(path.join(os.tmpdir(), 'recursos-humanos-'));
    vscode.guion.raiz = suelta;
    const { arnes, puesto } = identidad.leer();
    assert.ok(arnes.startsWith('Recursos humanos'), `ha salido "${arnes}"`);
    assert.equal(puesto, false, 'pero se sabe que no lo puso nadie');
    vscode.guion.raiz = empresa;
    return arnes;
  });

  // ------------------------------------------- la marca de la empresa
  const marca = cargar('marca');

  await comprobar('sin récord de marca, manda la de Executive Lab', () => {
    assert.equal(marca.leer(), null, 'sin fichero no hay marca que aplicar');
    assert.equal(marca.estilo(null), '', 'y no se cuela ningún estilo');
    return 'la nuestra';
  });

  await comprobar('con récord, el panel se pinta con los colores de la empresa', () => {
    montarMarca(empresa);
    const suya = marca.leer();
    assert.equal(suya.nombre, 'Ferretería Soler', 'sin el "Marca de" del título del artículo');
    assert.equal(suya.web, 'https://ferreteriasoler.es');
    assert.ok(suya.logo && suya.logo.endsWith('logo.svg'), 'coge su logotipo');
    assert.equal(suya.tokens['--crema'], '#f7f5f2');
    assert.equal(suya.tokens['--rojo'], '#0057b8');
    assert.match(marca.estilo(suya), /--crema: #f7f5f2;/);
    return `${Object.keys(suya.tokens).length} colores`;
  });

  await comprobar('un acento flojo se oscurece hasta que se lee encima', () => {
    const color = cargar('color');
    montarMarca(empresa, { acento: '#7bb8ff' }); // azul claro: 1,9:1 con blanco
    const suya = marca.leer();
    assert.equal(suya.ajustado, true);
    assert.equal(suya.tokens['--rojo'], '#7bb8ff', 'el de la web se queda para bordes y foco');
    const relleno = suya.tokens['--rojo-fuerte'];
    assert.ok(color.contraste('#ffffff', relleno) >= 4.5, `relleno ${relleno} sigue sin leerse`);
    return `#7bb8ff → ${relleno}`;
  });

  await comprobar('si el texto no se lee sobre el fondo, se descarta la marca entera', () => {
    montarMarca(empresa, { texto: '#cccccc', fondo: '#ffffff' });
    const suya = marca.leer();
    assert.ok(suya.descartada, 'mejor la nuestra que una interfaz ilegible');
    assert.equal(marca.estilo(suya), '');
    return suya.descartada;
  });

  await comprobar('sin logotipo utilizable, el rótulo es el nombre de la empresa', () => {
    montarMarca(empresa, { logo: false });
    const suya = marca.leer();
    assert.equal(suya.logo, null);
    montarMarca(empresa);
    return suya.nombre;
  });

  await comprobar('un logotipo que apunta fuera de su carpeta se ignora', () => {
    montarMarca(empresa);
    const registro = path.join(empresa, '02-DOCS/wiki/brand/marca.md');
    fs.writeFileSync(registro, fs.readFileSync(registro, 'utf8').replace('logo: logo.svg', 'logo: ../../../.env.svg'));
    assert.equal(marca.leer().logo, null);
    montarMarca(empresa);
    return 'ignorado';
  });

  await comprobar('con Codex, los botones abren su barra y copian', async () => {
    const asistentes = cargar('asistentes');
    const fs2 = require('node:fs');
    const declaracion = path.join(empresa, '.rsc.json');
    const antes = fs2.readFileSync(declaracion, 'utf8');

    // Un arnés montado para Codex, con su extensión instalada y la de Claude no.
    fs2.writeFileSync(declaracion, JSON.stringify({ ...JSON.parse(antes), targets: ['codex'] }, null, 2));
    vscode.guion.extensionesInstaladas = ['openai.chatgpt'];
    assert.equal(asistentes.elDeAhora().id, 'codex', 'lo dice el arnés, no se adivina');

    vscode.registrado.ejecutados.length = 0;
    const como = await puente.enviar('hola Codex');
    assert.equal(como, 'copiado', 'su extensión no expone ningún comando que acepte texto');
    assert.equal(vscode.registrado.portapapeles, 'hola Codex');
    assert.ok(vscode.registrado.ejecutados.some((e) => e.id === 'chatgpt.openSidebar'), 'y le abre su barra');

    fs2.writeFileSync(declaracion, antes);
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    return 'barra + portapapeles';
  });

  await comprobar('el asistente sale de lo que declara el arnés', () => {
    const asistentes = cargar('asistentes');
    assert.equal(asistentes.elDeAhora().id, 'claude');
    assert.deepEqual(asistentes.losDelArnes().map((a) => a.id), ['claude']);
    return 'claude';
  });

  // ---------------------------------------------- el disfraz y su interruptor
  const contexto = {
    extensionUri: { fsPath: RAIZ },
    extensionPath: RAIZ,
    subscriptions: [],
    extensionMode: 1,
    globalState: new Map([['get', null]]),
  };
  contexto.globalState = {
    datos: new Map(),
    get(k) { return this.datos.get(k); },
    async update(k, v) { this.datos.set(k, v); },
  };

  await comprobar('una carpeta que no es una empresa no se toca', async () => {
    const otroProyecto = fs.mkdtempSync(path.join(os.tmpdir(), 'otro-proyecto-'));
    fs.writeFileSync(path.join(otroProyecto, 'package.json'), '{}');
    vscode.guion.raiz = otroProyecto;
    vscode.registrado.ajustes.global = {};
    vscode.registrado.ajustes.workspace = {};

    const { aplicadas } = await disfraz.aplicar(contexto, vscode.window.createOutputChannel());
    assert.equal(aplicadas, 0, 'el editor de quien abre otra cosa se queda como lo tiene');
    assert.equal(disfraz.quiereVistaSencilla(), false, 'y su interruptor sigue apagado');
    assert.equal(Object.keys(vscode.registrado.ajustes.workspace).length, 0);
    assert.equal(Object.keys(vscode.registrado.ajustes.global).length, 0);
    assert.equal(disfraz.esUnaEmpresa(), false);

    vscode.guion.raiz = empresa;
    return 'sin tocar';
  });

  await comprobar('con el arnés montado, tampoco: hasta que no se enciende', async () => {
    const salida = vscode.window.createOutputChannel();
    vscode.registrado.ajustes.workspace = {};
    const solo = await disfraz.aplicar(contexto, salida);
    assert.equal(solo.aplicadas, 0, 'ni un arnés se disfraza solo: lo decides tú, carpeta a carpeta');
    return 'apagado por defecto';
  });

  await comprobar('encendido el interruptor, se disfraza solo esa carpeta', async () => {
    const salida = vscode.window.createOutputChannel();
    // Las claves de Claude no existen hasta que su extensión se activa.
    vscode.guion.rechazaAjuste = (clave) => clave.startsWith('claudeCode.');
    await disfraz.volverAModoSencillo(contexto, salida);
    const { aplicadas, pendientes } = { aplicadas: Object.keys(vscode.registrado.ajustes.workspace).length, pendientes: [] };

    const { global, workspace } = vscode.registrado.ajustes;
    assert.ok(aplicadas > 20, `solo ha escrito ${aplicadas}`);
    assert.equal(workspace[disfraz.CLAVE_INTERRUPTOR], true, 'el interruptor queda encendido en la carpeta');
    assert.equal(Object.keys(global).length, 0, 'ni una sola clave en los ajustes de usuario');
    assert.ok(workspace['workbench.colorCustomizations'], 'los colores de la marca entran en la carpeta');

    // Lo de ámbito de programa lo pone el instalador, no la extensión: en la
    // máquina de quien desarrolla le cambiaría todas las ventanas.
    for (const clave of ['window.zoomLevel', 'security.workspace.trust.enabled', 'telemetry.telemetryLevel']) {
      assert.ok(!(clave in workspace) && !(clave in global), `${clave} no la debe tocar la extensión`);
    }
    return `${aplicadas} en la carpeta, 0 en VS Code entero`;
  });

  await comprobar('la salida de emergencia lo quita de los dos sitios', async () => {
    const salida = vscode.window.createOutputChannel();
    // Como si alguien lo hubiera instalado en el editor donde trabaja: el
    // disfraz puesto en la carpeta y algo suelto en los ajustes de usuario.
    await disfraz.volverAModoSencillo(contexto, salida);
    vscode.registrado.ajustes.global['workbench.activityBar.location'] = 'hidden';
    vscode.registrado.ajustes.global['workbench.statusBar.visible'] = false;
    // El zoom es del usuario: no lo ponemos nosotros, así que tampoco se
    // borra. Si alguien lo tenía a 1, se queda a 1.
    vscode.registrado.ajustes.global['window.zoomLevel'] = 1;

    const { quitadas } = await disfraz.quitar(contexto, salida);
    assert.deepEqual(Object.keys(vscode.registrado.ajustes.global), ['window.zoomLevel'],
      'se va lo nuestro y se queda lo suyo');
    assert.equal(Object.keys(vscode.registrado.ajustes.workspace).length, 0, 'y de los de la carpeta');
    assert.equal(disfraz.quiereVistaSencilla(), false, 'y deja el interruptor apagado, o volvería en el siguiente arranque');
    assert.ok(quitadas > 20, `solo ha quitado ${quitadas}`);
    return `${quitadas} ajustes fuera`;
  });

  await comprobar('el interruptor cambia solo esta ventana', async () => {
    const salida = vscode.window.createOutputChannel();
    await disfraz.volverAModoSencillo(contexto, salida);
    assert.equal(disfraz.modoDeEstaVentana(), 'sencillo');

    const hecho = await disfraz.verEditorCompleto(contexto, salida);
    assert.equal(hecho.ok, true, hecho.mensaje);
    assert.equal(disfraz.modoDeEstaVentana(), 'avanzado');

    // Las listas de exclusión no se sustituyen entre ámbitos, se fusionan: hay
    // que apagar cada patrón, no escribir una lista vacía.
    const exclusiones = vscode.registrado.ajustes.workspace['files.exclude'];
    assert.ok(Object.keys(exclusiones).length > 0, 'una lista vacía no destaparía nada');
    assert.ok(Object.values(exclusiones).every((v) => v === false), 'cada patrón apagado');
    assert.deepEqual(Object.keys(exclusiones).sort(),
      Object.keys(JSON.parse(fs.readFileSync(path.join(RAIZ, 'media/disfraz.json'), 'utf8'))['files.exclude']).sort(),
      'se apagan exactamente las que esconde la base');

    const { workspace } = vscode.registrado.ajustes;
    assert.equal(workspace['workbench.activityBar.location'], 'FÁBRICA:workbench.activityBar.location',
      'el valor de fábrica lo dice VS Code, no lo inventamos');
    assert.ok(!('security.workspace.trust.enabled' in workspace), 'lo de ámbito de programa no se intenta por ventana');

    assert.equal(disfraz.modoDeEstaVentana(), 'avanzado', 'apagado el interruptor, se ve el editor entero');
    return `${disfraz.CLAVES_VISIBLES.length} claves visibles`;
  });

  // ---------------------------------------------- que no se separen las copias

  await comprobar('los raíles del .vsix son los mismos que los del repositorio', () => {
    // skills/ es la fuente; extension/media/railes/ es la copia que viaja
    // dentro del .vsix, y las cargas de los instaladores son otras dos. Se han
    // separado ya una vez —el .exe de Windows salió con raíles viejos— así que
    // ahora se comprueba.
    const origen = path.join(RAIZ, '..', 'skills');
    const copias = [
      path.join(RAIZ, 'media', 'railes'),
      path.join(RAIZ, '..', 'instalador', 'windows', 'carga', 'skills'),
      path.join(RAIZ, '..', 'instalador', 'mac', 'carga', 'skills'),
    ].filter((c) => fs.existsSync(c));

    const recorrer = (base, dentro = '') => fs.readdirSync(path.join(base, dentro), { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? recorrer(base, path.join(dentro, e.name)) : [path.join(dentro, e.name)]));

    const suyos = recorrer(origen).filter((f) => f !== 'README.md');
    for (const copia of copias) {
      for (const fichero of suyos) {
        const alla = path.join(copia, fichero);
        assert.ok(fs.existsSync(alla), `a ${path.basename(copia)} le falta ${fichero}`);
        assert.equal(fs.readFileSync(alla, 'utf8'), fs.readFileSync(path.join(origen, fichero), 'utf8'),
          `${fichero} ha cambiado en skills/ y no en ${path.basename(copia)}`);
      }
    }
    return `${suyos.length} ficheros · ${copias.length} copias al día`;
  });

  await comprobar('el motor de JavaScript sigue sirviendo de resto', async () => {
    const historial = require(path.join(RAIZ, '..', 'instalador', 'comun', 'historial.js'));
    if (historial.queMotor({ recalcular: true }) !== 'js') return 'SALTADA';

    const donde = fs.mkdtempSync(path.join(os.tmpdir(), 'historial-'));
    assert.ok((await historial.iniciar(donde)).ok);

    fs.writeFileSync(path.join(donde, 'factura.txt'), 'uno');
    const primera = await historial.guardar(donde, 'Punto de partida');
    assert.equal(primera.cuantos, 1);

    // El mismo tamaño y el mismo segundo: isomorphic-git dice que no ha
    // cambiado si se le pregunta por la fecha. Por eso no se le pregunta.
    fs.writeFileSync(path.join(donde, 'factura.txt'), 'dos');
    const segunda = await historial.guardar(donde, 'Otra copia');
    assert.equal(segunda.cuantos, 1, 'un cambio del mismo tamaño en el mismo segundo también se guarda');

    const { copias: guardadas } = await historial.historial(donde, 5);
    assert.equal(guardadas.length, 2);

    await historial.volverA(donde, guardadas[1].id);
    assert.equal(fs.readFileSync(path.join(donde, 'factura.txt'), 'utf8'), 'uno', 'vuelve a como estaba');

    fs.rmSync(donde, { recursive: true, force: true });
    return 'guardar, listar y volver atrás';
  });

  // ------------------------------------------------ que avise cuando ayuda

  const CATALOGO = require(path.join(RAIZ, 'media', 'capacidades.json')).capacidades;

  await comprobar('cada capacidad que ofrecemos existe en el catálogo de verdad', () => {
    const manifiesto = path.join(RAIZ, '..', 'instalador', 'mac', 'carga', 'harness',
      'node_modules', '@ericrisco', 'rsc', 'manifest.json');
    if (!fs.existsSync(manifiesto)) return 'SALTADA';

    const catalogo = require(manifiesto);
    const existentes = new Set((Array.isArray(catalogo) ? catalogo : catalogo.skills || []).map((s) => s.name || s.id));
    const fantasmas = CATALOGO.map((c) => c.id).filter((id) => !existentes.has(id));
    assert.deepEqual(fantasmas, [], 'ofrecer algo que no se puede instalar es peor que no ofrecer nada');
    return `${CATALOGO.length} capacidades, todas reales`;
  });

  await comprobar('solo se ofrece lo que encaja con lo que ya tiene escrito', () => {
    const facturas = consejos.loQuePodriaAprender({
      corpus: 'Ciclo de facturación. Cuándo se factura y plazos de cobro. Clientes que pagan tarde.',
      yaInstaladas: [],
      catalogo: CATALOGO,
    });
    assert.equal(facturas[0].id, 'invoicing', 'una empresa que habla de facturas');

    const nada = consejos.loQuePodriaAprender({ corpus: 'Hola qué tal', yaInstaladas: [], catalogo: CATALOGO });
    assert.deepEqual(nada, [], 'con una palabra suelta no se ofrece nada: eso es ruido');

    const puesta = consejos.loQuePodriaAprender({
      corpus: 'facturas, facturación y cobros',
      yaInstaladas: ['invoicing'],
      catalogo: CATALOGO,
    });
    assert.ok(!puesta.some((c) => c.id === 'invoicing'), 'lo que ya sabe no se ofrece');
    return `${facturas[0].nombre}`;
  });

  await comprobar('lo que se pide tres veces se ofrece como botón', () => {
    const tres = [
      'Prepárame el resumen del mes con las facturas',
      'Hazme el resumen del mes de facturas, por favor',
      'quiero el resumen mensual de las facturas',
      'Busca el teléfono de Talleres Ruiz',
    ];
    const repetida = consejos.loQueRepite(tres);
    assert.ok(repetida, 'tres parecidas son un patrón');
    assert.equal(repetida.veces, 3);
    assert.equal(consejos.loQueRepite(tres.slice(0, 2)), null, 'con dos todavía no');
    return `${repetida.veces} veces`;
  });

  await comprobar('sale un consejo como mucho, y el que más desatasca', () => {
    const contexto = {
      esperando: 3,
      esperandoDesdeHace: 4,
      conexionesAMedias: [{ id: 'HOLDED', etiqueta: 'Holded', faltan: 1 }],
      diasSinCopia: 9,
      cambiosSinGuardar: 12,
      huecos: ['Cuánto se tarda en cobrar'],
      catalogo: CATALOGO,
    };
    const todos = consejos.consejos(contexto);
    assert.ok(todos.length > 1, 'hay varias cosas que decir');
    assert.equal(consejos.elQueToca(contexto).id, 'documentos-esperando', 'pero solo se enseña la primera');
    return `${todos.length} candidatos · sale 1`;
  });

  await comprobar('lo que se aparta con "ahora no" no vuelve en dos semanas', () => {
    const contexto = {
      esperando: 3,
      esperandoDesdeHace: 4,
      conexionesAMedias: [{ id: 'HOLDED', etiqueta: 'Holded', faltan: 2 }],
      silenciados: { 'documentos-esperando': Date.now() },
    };
    assert.equal(consejos.elQueToca(contexto).id, 'conexion-HOLDED', 'pasa el siguiente');

    const viejo = { ...contexto, silenciados: { 'documentos-esperando': Date.now() - 20 * 86400000 } };
    assert.equal(consejos.elQueToca(viejo).id, 'documentos-esperando', 'a las dos semanas vuelve');
    return 'apartado y de vuelta';
  });

  await comprobar('sin nada que decir, no se dice nada', () => {
    assert.equal(consejos.elQueToca({}), null);
    assert.equal(consejos.elQueToca({ esperando: 2, esperandoDesdeHace: 0 }), null, 'el mismo día no se da la lata');
    assert.equal(consejos.elQueToca({ diasSinCopia: 9, cambiosSinGuardar: 0 }), null, 'sin cambios no hay nada que guardar');
    return 'callado';
  });

  // ------------------------------------------------------------- el arranque
  await comprobar('los comandos registrados son los del manifiesto', () => {
    vscode.registrado.comandos.length = 0;
    cargar('extension').activate(contexto);
    const manifiesto = require(path.join(RAIZ, 'package.json')).contributes.commands.map((c) => c.command).sort();
    assert.deepEqual(vscode.registrado.comandos.sort(), manifiesto);
    assert.ok(vscode.registrado.vistas.includes('executiveLab.panel'));
    assert.ok(vscode.registrado.ejecutados.some((e) => e.id === 'executiveLab.panel.focus'), 'fuerza su vista');
    return `${manifiesto.length} comandos`;
  });

  await comprobar('el panel se ajusta al arnés conforme se monta', async () => {
    const vigia = vscode.registrado.vigia;
    assert.ok(vigia, 'hay que vigilar lo que el arnés escribe');
    // Se comprueba que el patrón cubra cada sitio, no que lo nombre: desde que
    // el buscador lee la wiki entera, un solo `02-DOCS/wiki/**` cubre el
    // índice, el historial, los huecos, la marca y los artículos.
    const cubre = (ruta) => {
      const partes = vigia.patron.replace(/^\{|\}$/g, '').split(',');
      return partes.some((p) => new RegExp(`^${p.replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*')}$`).test(ruta));
    };
    for (const trozo of ['.rsc.json', '.claude/commands/lo-que-sea.md', '01-TOOLS/holded/.env',
      '02-DOCS/wiki/index.md', '02-DOCS/wiki/facturacion/iva.md', '02-DOCS/inbox/factura.pdf',
      '02-DOCS/wiki/brand/marca.md']) {
      assert.ok(cubre(trozo), `no se vigila ${trozo}`);
    }

    // Un comando nuevo, como el que crea el asistente cuando algo se repite.
    fs.writeFileSync(path.join(empresa, '.claude/commands/cobrar.md'),
      '---\ndescription: Reclamar cobros\nboton: Reclamar lo que me deben\n---\n\nInstrucciones.\n');
    vigia.disparar(path.join(empresa, '.claude/commands/cobrar.md'));
    await new Promise((listo) => setTimeout(listo, 900));

    const etiquetas = cargar('acciones').acciones().map((a) => a.etiqueta);
    assert.ok(etiquetas.includes('Reclamar lo que me deben'), 'el botón nuevo tiene que salir solo');
    return `${etiquetas.length} botones, uno recién creado`;
  });

  await comprobar('la vuelta al modo sencillo vive en la barra de estado', () => {
    const boton = vscode.registrado.barraEstado.at(-1);
    assert.equal(boton.command, 'executiveLab.modoSencillo', 'en modo avanzado la barra puede no verse');
    return boton.text;
  });

  await comprobar('una carpeta sin arnés ofrece montarlo, no dice que esté rota', async () => {
    const vacia = fs.mkdtempSync(path.join(os.tmpdir(), 'carpeta-vacia-'));
    vscode.guion.raiz = vacia;
    const estado = await brujula.estado({ fresco: true });
    assert.equal(estado.sinArnes, true);
    assert.equal(estado.listo, false);
    assert.match(estado.aviso, /Puedo montar tu empresa/);
    vscode.guion.raiz = empresa;
    return estado.donde;
  });

  // ---------------------------------------------------------------- git
  //
  // git es obligatorio (extension/src/git.js dice por qué). Estas tres prueban
  // las tres formas en que eso puede volver a romperse sin que nadie lo note.

  await comprobar('en un Mac no se elige nunca el git señuelo', () => {
    const entorno = cargar('entorno');
    const sitios = entorno.GITS_DE_MAC();
    assert.ok(sitios.length, 'la lista sale del módulo compartido: vacía quiere decir que no lo encuentra');
    assert.ok(
      !sitios.includes('/usr/bin/git'),
      '/usr/bin/git existe siempre en macOS y abre el diálogo de Apple: no puede estar en la lista',
    );
    return `${sitios.length} sitios donde vive un git de verdad`;
  });

  await comprobar('el módulo del historial viaja dentro de la extensión', () => {
    const entorno = cargar('entorno');
    const donde = entorno.moduloComun('historial');
    assert.ok(donde, 'sin él, las copias de seguridad quedan apagadas y sin decirlo');

    const modulo = require(donde);
    for (const fn of ['iniciar', 'guardar', 'historial', 'volverA', 'disponible']) {
      assert.equal(typeof modulo[fn], 'function', `al módulo del historial le falta ${fn}`);
    }

    // La fuente vive fuera de extension/ y vsce solo empaqueta lo que cuelga de
    // ahí, así que `npm run empaquetar` deja una copia. Si se queda atrás, el
    // .vsix sale con un historial viejo y nadie se entera.
    const copia = path.join(RAIZ, 'media', 'comun', 'historial.js');
    const fuente = path.join(RAIZ, '..', 'instalador', 'comun', 'historial.js');
    if (fs.existsSync(copia)) {
      assert.equal(
        fs.readFileSync(copia, 'utf8'),
        fs.readFileSync(fuente, 'utf8'),
        'la copia que va dentro del .vsix se ha quedado atrás: vuelve a empaquetar',
      );
    }
    return path.basename(donde);
  });

  // Se falsea la respuesta en vez de desinstalar git: `guardar.hayGit` la
  // recuerda, así que hay que olvidarla antes y después o las pruebas que
  // vengan detrás heredan la mentira.
  const sinGit = async (hacer) => {
    const gitMod = cargar('git');
    const copias = cargar('guardar');
    const antes = gitMod.hay;
    gitMod.hay = async () => false;
    copias.olvidarSiHayGit();
    try {
      return await hacer();
    } finally {
      gitMod.hay = antes;
      copias.olvidarSiHayGit();
    }
  };

  await comprobar('sin git, la carpeta vacía no ofrece prepararse: ofrece ponerlo', async () => {
    const vacia = fs.mkdtempSync(path.join(os.tmpdir(), 'carpeta-sin-git-'));
    vscode.guion.raiz = vacia;
    const estado = await sinGit(() => brujula.estado({ fresco: true }));
    vscode.guion.raiz = empresa;

    assert.equal(estado.sinArnes, true);
    assert.equal(estado.faltaGit, true, 'sin git la carpeta vacía tiene que decirlo antes de ofrecer nada');
    assert.ok(estado.comoSeInstalaGit, 'y tiene que decir qué va a pasar al pulsar');
    return estado.comoSeInstalaGit.slice(0, 46);
  });

  await comprobar('sin git, preparar la carpeta se para antes de preguntar nada', async () => {
    const vacia = fs.mkdtempSync(path.join(os.tmpdir(), 'carpeta-sin-git-2-'));
    vscode.guion.raiz = vacia;
    const preguntaAntes = vscode.registrado.quickPick;

    const hecho = await sinGit(() => cargar('arrancar').arrancar({}, { appendLine() {} }));
    vscode.guion.raiz = empresa;

    assert.equal(hecho.ok, false);
    assert.equal(hecho.faltaGit, true, 'tiene que decir que lo que falta es git, no fallar a secas');
    assert.equal(hecho.cancelado, undefined, 'y no confundirse con que el alumno cerrara la pregunta');
    assert.equal(vscode.registrado.quickPick, preguntaAntes, 'no se pregunta nada si va a abortar igualmente');
    return hecho.mensaje;
  });

  await comprobar('no se elige un ejecutable de otro sistema', () => {
    const entorno = cargar('entorno');
    const carga = path.join(RAIZ, '..', 'instalador', 'windows', 'carga');
    if (!fs.existsSync(path.join(carga, 'git', 'cmd', 'git.exe'))) return 'sin carga de Windows a mano';

    const antes = process.env.EXECUTIVE_LAB_HOME;
    process.env.EXECUTIVE_LAB_HOME = carga;
    const elegido = { git: entorno.git(), node: entorno.node() };
    process.env.EXECUTIVE_LAB_HOME = antes;

    if (process.platform === 'win32') assert.match(elegido.git, /\.exe$/);
    else {
      assert.ok(!elegido.git.endsWith('.exe'), `en ${process.platform} no vale ${elegido.git}`);
      assert.ok(!elegido.node.endsWith('.exe'), `en ${process.platform} no vale ${elegido.node}`);
    }

    // Pero el filtro es solo para binarios: el punto de entrada del arnés es un
    // .js y no lleva .exe en ningún sistema. Si se filtrara, en Windows se
    // perdería el arnés preinstalado y caería a npx.
    process.env.EXECUTIVE_LAB_HOME = carga;
    const arnes = entorno.entradaDelArnes(null);
    process.env.EXECUTIVE_LAB_HOME = antes;
    assert.ok(arnes && arnes.endsWith('rsc.js'), 'el arnés preinstalado tiene que encontrarse');

    return `git → ${path.basename(elegido.git)} · arnés → rsc.js`;
  });

  // --------------------------------------------- el wizard, de verdad
  // Monta un arnés entero: tarda minutos y toca la red, así que no va en la
  // pasada normal. `node prueba/humo.js --con-arnes` lo incluye.
  if (process.argv.includes('--con-arnes')) {
    await comprobar('el wizard monta una empresa en una carpeta vacía', async () => {
      const vacia = fs.mkdtempSync(path.join(os.tmpdir(), 'empresa-nueva-'));
      vscode.guion.raiz = vacia;
      vscode.guion.eleccion = 'Llevar los contratos y el papeleo de la gente';

      // Como en la máquina de un alumno: el arnés ya instalado junto a la app.
      const carga = path.join(RAIZ, '..', 'instalador', 'windows', 'carga');
      if (fs.existsSync(path.join(carga, 'harness'))) process.env.EXECUTIVE_LAB_HOME = carga;

      const hecho = await cargar('arrancar').arrancar(contexto, vscode.window.createOutputChannel());
      assert.equal(hecho.ok, true, hecho.mensaje);

      // El suelo que RSC exige para dar un arnés por bueno.
      for (const pieza of ['.rsc.json', '01-TOOLS/_TEMPLATE', '02-DOCS/wiki/harness']) {
        assert.ok(fs.existsSync(path.join(vacia, pieza)), `falta ${pieza}`);
      }
      // Los raíles, con los diales puestos.
      const perfil = fs.readFileSync(path.join(vacia, '02-DOCS/wiki/harness/user-profile.md'), 'utf8');
      assert.match(perfil, /^technical_level: non-technical$/m);
      assert.match(perfil, /^accompaniment: L3$/m);
      assert.ok(fs.existsSync(path.join(vacia, '.claude/skills/executive-lab/SKILL.md')), 'falta la habilidad');

      // Y queda un punto de partida al que volver: sin esto, "Volver a como
      // estaba antes" no tendría a dónde hasta la primera copia del alumno.
      const { execFileSync } = require('node:child_process');
      const registro = execFileSync('git', ['log', '--oneline'], { cwd: vacia, encoding: 'utf8' });
      assert.match(registro, /Punto de partida/);

      // Y los botones ya salen, sin que nadie haya tocado el código.
      vscode.guion.raiz = vacia;
      const botones = cargar('acciones').acciones().map((a) => a.etiqueta);
      assert.deepEqual(botones.sort(), ['Empezar algo nuevo', 'No sé qué hacer ahora', 'Seguir donde lo dejé']);

      vscode.guion.raiz = empresa;
      vscode.guion.eleccion = undefined;
      return `${botones.length} botones desde cero`;
    });
  } else {
    console.log('  · el wizard no se ha probado (añade --con-arnes: tarda minutos)');
  }

  console.log(`\n${pasadas} comprobaciones pasadas${process.exitCode ? ' — y alguna ha fallado' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
