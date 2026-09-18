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
    'conexiones', 'acciones', 'cerebro', 'brujula', 'puente', 'soporte', 'disfraz', 'arrancar', 'git', 'terreno', 'github', 'saberes', 'salidas', 'papeles', 'reglas', 'asistentes', 'ajustes', 'tema', 'fijadas', 'proyectos', 'lecciones', 'extension'];
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
    const sabe = conTilde.grupos.find((g) => g.titulo === 'Lo que sabe');
    assert.equal(sabe.aciertos[0].titulo, 'Ciclo de facturación', 'lo que se llama así, primero');
    return `${conTilde.cuantos} resultados`;
  });

  await comprobar('buscar mira también los botones y las conexiones', () => {
    const botones = buscador.buscar('resumen del mes').grupos.find((g) => g.titulo === 'Tus botones (comandos)');
    assert.ok(botones, 'los botones del arnés también se buscan');
    assert.equal(botones.aciertos[0].titulo, 'Preparar el resumen del mes');

    const conexiones = buscador.buscar('holded').grupos.find((g) => g.titulo === 'Conexiones (tools)');
    assert.ok(conexiones, 'las conexiones también');
    assert.equal(conexiones.aciertos[0].accion.tipo, 'verConexion');
    return 'botones y conexiones';
  });

  await comprobar('con una sola caja se encuentran también los papeles y el diario', () => {
    // Jose quería un buscador de documentos y otro de conceptos. Dos cajas
    // obligan a elegir cuál antes de saber qué buscas, que es la peor pregunta
    // que se le puede hacer a quien no sabe dónde está algo. Así que una, y que
    // cubra todo.
    const papel = buscador.buscar('contrato').grupos.find((g) => g.titulo === 'Documentos');
    assert.ok(papel && papel.aciertos.length, 'el papel que espera sin leer sale');
    assert.equal(papel.aciertos[0].accion.tipo, 'abrirPapel', 'y al pulsarlo se abre, no lleva a otra pantalla');

    const dia = buscador.buscar('Talleres Ruiz').grupos.find((g) => g.titulo === 'El diario');
    assert.ok(dia && dia.aciertos.length, 'y el día que se les reclamó el pago, también');
    assert.equal(dia.aciertos[0].accion.tipo, 'verSesion');

    return `${papel.aciertos.length} papeles · ${dia.aciertos.length} del diario`;
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
    assert.equal(dos, 'Lo que sabe (Facturacion)', 'dos zonas no caben: se queda la primera');
    const donde = brujula.interpretar('files: 01-TOOLS/HOLDED/.env, 01-TOOLS/GMAIL/.env');
    assert.equal(donde, 'Conexiones (Holded, Gmail)', 'dos del mismo sitio no repiten el rótulo');
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
    assert.equal(suya.tokens['--fondo'], '#f7f5f2', 'el fondo es el que eligió la empresa, no un tono inventado');
    assert.match(marca.estilo(suya), /--fondo: #f7f5f2;/);
    return `${Object.keys(suya.tokens).length} colores`;
  });

  await comprobar('la paleta de cualquier marca se lee, sea cual sea', () => {
    // Antes cada color se sacaba mezclando a mano y cada caso raro había que
    // arreglarlo por separado: el fondo oscuro hundía las tarjetas, el apagado
    // se comprobaba solo contra la página… Ahora se construye la paleta tonal
    // de Material 3 y cada sitio usa el tono que le toca, así que esto se puede
    // comprobar de golpe con marcas muy distintas.
    const color = cargar('color');
    const marcas = [
      ['azul marino', '#0d1117', '#e6edf3', '#22d3ee'],
      ['crema', '#f7f5f2', '#1a1a1a', '#0057b8'],
      ['blanco puro', '#ffffff', '#111111', '#2e7d32'],
      ['negro puro', '#000000', '#eeeeee', '#ff5722'],
      ['morado oscuro', '#1a0f2e', '#f0eaff', '#b388ff'],
      ['acento flojo', '#ffffff', '#222222', '#7bb8ff'],
    ];

    for (const [que, fondo, texto, acento] of marcas) {
      montarMarca(empresa, { fondo, texto, acento });
      const t = marca.leer().tokens;
      assert.ok(t, `${que}: tendría que valer`);

      const pares = [
        ['el texto sobre la página', t['--texto'], t['--fondo']],
        ['el texto sobre las tarjetas', t['--texto-fuerte'], t['--superficie']],
        ['el texto apagado sobre la página', t['--apagado'], t['--fondo']],
        ['el texto apagado sobre las tarjetas', t['--apagado'], t['--superficie']],
        ['la letra del botón sobre su relleno', t['--sobre-acento'], t['--acento-relleno']],
      ];
      for (const [donde, encima, debajo] of pares) {
        const cuanto = color.contraste(encima, debajo);
        assert.ok(cuanto >= 4.5, `${que}: ${donde} se queda en ${cuanto.toFixed(2)}:1`);
      }

      // Y las tarjetas tienen que distinguirse de la página, o no se ve dónde
      // empieza y acaba cada una. Con un fondo blanco se quedaban blancas.
      assert.notEqual(t['--superficie'], t['--fondo'], `${que}: las tarjetas se confunden con la página`);
    }

    montarMarca(empresa);
    return `${marcas.length} marcas, todas legibles`;
  });

  await comprobar('un fondo a media luz se descarta, porque encima no se lee nada', () => {
    // No es un fallo del cálculo: un gris medio da 3,9:1 con blanco y 4,4:1 con
    // negro. No hay letra que se lea encima, así que se descarta y se dice.
    montarMarca(empresa, { fondo: '#808080', texto: '#ffffff', acento: '#0057b8' });
    const suya = marca.leer();
    assert.ok(suya.descartada, 'mejor la nuestra que una interfaz ilegible');
    assert.match(suya.descartada, /más claro o más oscuro/, 'y se dice qué hacer, no solo que no vale');
    assert.equal(marca.estilo(suya), '');
    montarMarca(empresa);
    return suya.descartada;
  });

  await comprobar('ninguna regla del panel pinta con un color crudo', () => {
    // Este es el fallo que vio Jose: el nombre de su empresa salía casi negro
    // sobre fondo azul marino. La regla usaba `--tinta`, que es de la paleta de
    // Executive Lab, y ni el tema oscuro ni la marca de nadie saben cambiar
    // eso: solo saben cambiar los colores con significado.
    const css = fs.readFileSync(path.join(RAIZ, 'media', 'panel.css'), 'utf8');
    const cuerpo = css.slice(css.indexOf('* { box-sizing'));
    const crudos = ['--tinta', '--tinta-texto', '--papel', '--crema', '--crema-2', '--gris', '--linea', '--rojo', '--rojo-fuerte'];

    const culpables = cuerpo.split('\n')
      .map((l, i) => [i, l])
      .filter(([, l]) => crudos.some((c) => l.includes(`var(${c})`)));
    assert.deepEqual(culpables.map(([, l]) => l.trim()), [],
      'una regla que nombra un color crudo no cambia ni con tema oscuro ni con la marca de la empresa');

    // Y los de significado tienen que estar todos definidos.
    const declarados = new Set([...css.matchAll(/^\s*(--[a-z-]+):/gm)].map((m) => m[1]));
    for (const token of ['--fondo', '--superficie', '--texto', '--texto-fuerte', '--apagado', '--borde', '--acento', '--acento-relleno', '--sobre-acento']) {
      assert.ok(declarados.has(token), `falta declarar ${token}`);
    }
    return `${declarados.size} colores declarados, 0 crudos en las reglas`;
  });

  await comprobar('la marca manda también con el tema oscuro del editor', () => {
    // Con la paleta de Material la marca es completa y coherente, clara u
    // oscura, así que ya no hay razón para cederle el fondo al editor: la barra
    // se ve igual en las dos ventanas de al lado.
    montarMarca(empresa, { fondo: '#0d1117', texto: '#e6edf3', acento: '#22d3ee' });
    const oscura = marca.estilo(marca.leer());
    assert.match(oscura, /body\.vscode-dark\s*\{[^}]*--fondo: #0d1117/);
    assert.ok(!/vscode-high-contrast/.test(oscura), 'el alto contraste no se toca: quien lo usa lo necesita');

    montarMarca(empresa);
    const clara = marca.estilo(marca.leer());
    assert.match(clara, /body\.vscode-dark\s*\{[^}]*--fondo: #f7f5f2/, 'y la clara también manda');
    return 'manda en los dos';
  });

  await comprobar('la tipografía se cambia, pero solo de la lista', () => {
    // `marca.js` decía que la tipografía no se toca nunca, y el motivo era
    // bueno: una ajena puede dejar la barra ilegible. Jose quiere poder
    // cambiarla, así que se cambia de una lista corta — nada de traerse una
    // fuente de la red, que el panel no pide nada fuera a propósito.
    montarMarca(empresa, { tipografia: 'grande' });
    assert.match(marca.estilo(marca.leer()), /--sans: Verdana/);

    montarMarca(empresa, { tipografia: 'la-de-mi-primo' });
    assert.ok(!/--sans:/.test(marca.estilo(marca.leer())), 'una que no está en la lista no se pone');

    montarMarca(empresa);
    return Object.keys(marca.TIPOGRAFIAS).join(' · ');
  });

  await comprobar('sin logotipo utilizable, el rótulo es el nombre de la empresa', () => {
    montarMarca(empresa, { logo: false });
    const suya = marca.leer();
    assert.equal(suya.logo, null);
    montarMarca(empresa);
    return suya.nombre;
  });

  await comprobar('un logotipo que es solo el símbolo pide que se escriba el nombre al lado', () => {
    // Una marca sin nombre en lo alto de la barra es un dibujo anónimo: la ene
    // de puntos de Nexus Consulting es preciosa y no dice de quién es esto.
    montarMarca(empresa, { simbolo: true });
    assert.equal(marca.leer().logoSinNombre, true, 'cuadrado: el nombre no va dentro');

    montarMarca(empresa);
    assert.equal(marca.leer().logoSinNombre, false, 'una tira de letras ya lo lleva');

    // Y si el récord lo dice, manda el récord: quien miró la web vio la imagen.
    montarMarca(empresa, { simbolo: true, dice: 'si' });
    assert.equal(marca.leer().logoSinNombre, false, 'lo dicho gana a la proporción');
    montarMarca(empresa, { dice: 'no' });
    assert.equal(marca.leer().logoSinNombre, true, 'y también al revés');

    montarMarca(empresa);
    return 'medido y preguntado';
  });

  await comprobar('el tamaño de una imagen se saca de su cabecera, sea del formato que sea', () => {
    const medidas = cargar('medidas');
    const donde = fs.mkdtempSync(path.join(os.tmpdir(), 'logos-'));
    const poner = (nombre, datos) => {
      const f = path.join(donde, nombre);
      fs.writeFileSync(f, datos);
      return f;
    };

    // Cabeceras armadas a mano: es justo lo que el módulo tiene que saber leer,
    // y así la prueba no depende de traer imágenes de verdad al repositorio.
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from([0, 0, 0, 13]), Buffer.from('IHDR'),
      (() => { const b = Buffer.alloc(8); b.writeUInt32BE(320, 0); b.writeUInt32BE(64, 4); return b; })(),
      Buffer.alloc(8),
    ]);
    const jpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00]),
      Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08]),
      (() => { const b = Buffer.alloc(4); b.writeUInt16BE(50, 0); b.writeUInt16BE(200, 2); return b; })(),
      Buffer.alloc(16),
    ]);
    const webp = Buffer.concat([
      Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'),
      Buffer.from('VP8X'), Buffer.alloc(4), Buffer.alloc(4),
      (() => {
        const b = Buffer.alloc(6);
        b.writeUIntLE(119, 0, 3); // 120 - 1
        b.writeUIntLE(39, 3, 3);  // 40 - 1
        return b;
      })(),
      Buffer.alloc(8),
    ]);

    assert.deepEqual(medidas.medir(poner('a.png', png)), { ancho: 320, alto: 64 });
    assert.deepEqual(medidas.medir(poner('a.jpg', jpeg)), { ancho: 200, alto: 50 });
    assert.deepEqual(medidas.medir(poner('a.webp', webp)), { ancho: 120, alto: 40 });
    assert.deepEqual(
      medidas.medir(poner('a.svg', '<svg viewBox="0 0 64 64" width="4rem" height="4rem"></svg>')),
      { ancho: 64, alto: 64 },
      'manda el viewBox, que es lo que define la proporción',
    );
    assert.deepEqual(
      medidas.medir(poner('b.svg', '<svg width="300" height="50"></svg>')),
      { ancho: 300, alto: 50 },
      'y sin viewBox valen las medidas sueltas',
    );
    // Lo que no se puede medir no revienta: se devuelve el nombre al lado, que
    // es la salida segura.
    assert.equal(medidas.medir(poner('roto.png', Buffer.from('no soy una imagen'))), null);
    assert.equal(medidas.medir(path.join(donde, 'no-existe.png')), null);

    return '5 formatos medidos · 2 sin medir, sin reventar';
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

  await comprobar('la radiografía dice hasta qué punto está montada la carpeta', async () => {
    const radio = await cargar('terreno').radiografia();
    const por = Object.fromEntries(radio.piezas.map((p) => [p.nombre, p]));

    assert.equal(radio.queEs, 'conArnes');
    assert.equal(por['El asistente, montado aquí'].estado, 'si');
    assert.equal(por['Conexiones con tus herramientas'].detalle, '1', 'la empresa de mentira tiene una');
    assert.equal(por['Copias fuera de este ordenador'].estado, 'no', 'sin sesión, se dice que no');
    assert.ok(por['Lo que sabe'], 'la wiki también se cuenta');
    return `${radio.piezas.length} piezas`;
  });

  // --------------------------------------------------- la copia de fuera

  await comprobar('sin haber entrado en la cuenta, guardar fuera no es un error', async () => {
    vscode.guion.sesionGitHub = null;
    const gh = cargar('github');
    const copias = cargar('guardar');

    const estado = await gh.estado();
    assert.equal(estado.conectado, false);
    assert.equal(estado.usuario, null);

    const hecho = await copias.subirCopia();
    assert.equal(hecho.ok, false);
    assert.equal(hecho.faltaGitHub, true, 'tiene que pedir la guía, no soltar un fallo');
    return 'lleva a la guía';
  });

  await comprobar('si el editor no contesta, el panel no se queda colgado', async () => {
    // El fallo de verdad: `getSession` NO resuelve nunca si el proveedor de
    // GitHub no se ha activado, y la barra se quedaba en "Mirando qué hay
    // aquí…" para siempre. Aquí se simula esa promesa que nunca contesta.
    const gh = cargar('github');
    const nuncaContesta = new Promise(() => {});

    const empezo = Date.now();
    const respuesta = await gh.conReloj(nuncaContesta, 'me rendí', 300);
    const tardo = Date.now() - empezo;

    assert.equal(respuesta, 'me rendí', 'sin respuesta a tiempo hay que seguir, no esperar');
    assert.ok(tardo < 2000, `tardó ${tardo}ms: el reloj no está haciendo su trabajo`);
    return `se rinde en ${tardo}ms`;
  });

  await comprobar('con la sesión del editor no hace falta ninguna clave a mano', async () => {
    vscode.guion.sesionGitHub = {
      accessToken: 'de-mentira',
      account: { label: 'jose' },
    };
    const gh = cargar('github');
    const copias = cargar('guardar');

    const estado = await gh.estado();
    assert.equal(estado.conectado, true);
    assert.equal(estado.usuario, 'jose');
    assert.equal(await copias.puedeSubir(), true, 'con sesión se puede subir sin tocar 01-TOOLS');

    vscode.guion.sesionGitHub = null;
    return `dentro como ${estado.usuario}`;
  });

  await comprobar('el wiki se ve aunque no haya índice', () => {
    // El caso real: cuatro temas escritos, sin index.md, y el panel enseñaba
    // que no sabía nada. El índice lo mantiene el asistente y que esté al día
    // es una aspiración; las carpetas son un hecho.
    const sinIndice = fs.mkdtempSync(path.join(os.tmpdir(), 'wiki-sin-indice-'));
    const wiki = path.join(sinIndice, '02-DOCS', 'wiki');
    fs.mkdirSync(path.join(wiki, 'operaciones'), { recursive: true });
    fs.mkdirSync(path.join(wiki, 'harness'), { recursive: true });
    fs.writeFileSync(path.join(wiki, 'operaciones', 'como-facturamos.md'), '---\ntype: article\n---\n\n# Cómo facturamos\n\nTexto.\n');
    fs.writeFileSync(path.join(wiki, 'harness', 'user-profile.md'), '# Perfil\n');
    fs.writeFileSync(path.join(sinIndice, '.rsc.json'), '{}');

    vscode.guion.raiz = sinIndice;
    const temas = cargar('cerebro').catalogo();
    vscode.guion.raiz = empresa;

    assert.equal(temas.length, 1, 'un tema: harness es de la máquina y no cuenta');
    assert.equal(temas[0].etiqueta, 'Operaciones');
    assert.equal(temas[0].articulos[0].titulo, 'Cómo facturamos', 'el título sale de dentro del artículo');

    fs.rmSync(sinIndice, { recursive: true, force: true });
    return `${temas[0].etiqueta}: ${temas[0].articulos.length} artículo`;
  });

  await comprobar('ningún dato de pantalla trae un campo "tipo" que pise el del mensaje', async () => {
    // El fallo que dejó el panel colgado en "Mirando qué hay aquí…": el mensaje
    // se manda como { tipo: 'radiografia', ...datos } y los datos traían su
    // propio `tipo`, así que lo pisaban. El panel no encontraba qué pintar y se
    // quedaba en la pantalla de esperar para siempre.
    const radio = await cargar('terreno').radiografia();
    assert.ok(!('tipo' in radio), 'la radiografía no puede traer un campo llamado tipo');

    const sabe = cargar('saberes').queSabe(RAIZ);
    assert.ok(!('tipo' in sabe), 'lo que sabe hacer, tampoco');
    return 'ninguno lo pisa';
  });

  await comprobar('un fichero suelto en 01-TOOLS no es una herramienta', () => {
    // Salía "Conexiones (Readme.md)" en la brújula, que no significa nada.
    const zonas = brujula.zonasTocadas(['01-TOOLS/README.md', '01-TOOLS/ODOO/.env', '01-TOOLS/_TEMPLATE/x.sh']);
    assert.ok(!zonas.some((z) => /\./.test(z)), `ninguna zona lleva un nombre de fichero: ${zonas.join(' · ')}`);
    assert.ok(zonas.includes('Conexiones (Odoo)'), 'la herramienta de verdad sí sale');
    return zonas.join(' · ');
  });

  await comprobar('lo que hay para llevarse sale del out/ que define RSC', () => {
    const salidas = cargar('salidas');

    // Sin nada producido todavía, no se ofrece nada: como todo lo demás, sale
    // de leer la carpeta.
    assert.deepEqual(salidas.loQueHaProducido(), [], 'sin out/ no hay nada que llevarse');

    // Y con algo dentro, aparece. `out/` es la carpeta que RSC escribe en el
    // .gitignore de cada herramienta: es SU convención, no nuestra.
    const out = path.join(empresa, '01-TOOLS', 'HOLDED', 'out');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'Resumen de marzo.pdf'), 'no es un pdf de verdad');
    fs.writeFileSync(path.join(out, '.escondido'), 'esto no se enseña');

    const hay = salidas.loQueHaProducido();
    assert.equal(hay.length, 1);
    assert.equal(hay[0].cuantos, 1, 'los ficheros ocultos no se cuentan');
    assert.equal(hay[0].archivos[0].fichero, 'Resumen de marzo.pdf');
    assert.ok(hay[0].archivos[0].tamano, 'se dice cuánto ocupa');

    fs.rmSync(out, { recursive: true, force: true });
    return `${hay[0].etiqueta}: ${hay[0].cuantos} para llevarse`;
  });

  await comprobar('no se puede sacar un fichero de fuera de out/', async () => {
    // Lo que llega del panel no construye rutas a lo loco: si alguien pidiera
    // el .env de la herramienta, o algo de más arriba, no se abre ni se copia.
    const salidas = cargar('salidas');
    for (const intento of ['../.env', '../../../etc/passwd', 'sub/carpeta.txt', '..']) {
      const abierto = await salidas.abrir('HOLDED', intento);
      assert.equal(abierto.ok, false, `"${intento}" no debería resolverse a nada`);
    }
    return '4 intentos, ninguno pasa';
  });

  await comprobar('lo que se mira de un vistazo sale de la tabla del README, y solo lo que mira', () => {
    const vistazo = conexiones.loQueSePuedeMirar();

    // Sale de la convención de RSC: cada herramienta de 01-TOOLS lleva un
    // README con su tabla de scripts. No hay nada de ninguna herramienta
    // concreta escrito en el código.
    const holded = vistazo.find((h) => h.id === 'HOLDED');
    assert.ok(holded, 'la herramienta de la empresa de mentira tiene scripts que solo miran');

    // Y lo que importa: nada que pida datos o cambie algo se cuela aquí. Eso
    // sigue pasando por el asistente, que pregunta y pide permiso.
    const todosLosDeHolded = conexiones.scripts('HOLDED');
    const queMiran = todosLosDeHolded.filter((s) => !s.pideDatos).length;
    assert.equal(holded.scripts.length, queMiran, 'ni uno más ni uno menos de los que solo miran');
    assert.ok(holded.scripts.every((s) => s.etiqueta && !s.etiqueta.includes('_')), 'el botón lleva el nombre en cristiano, no el del fichero');

    return `${holded.etiqueta}: ${holded.scripts.length} de un vistazo`;
  });

  await comprobar('la lista de lo que sabe hacer separa lo suyo de la fontanería', () => {
    const saberes = cargar('saberes');
    const queSabe = saberes.queSabe(RAIZ);

    assert.ok(queSabe.puedeAprender.length, 'tiene que haber algo que ofrecer');
    assert.equal(
      queSabe.sabe.length + queSabe.puedeAprender.length,
      require(path.join(RAIZ, 'media', 'capacidades.json')).capacidades.length,
      'cada capacidad del catálogo cae en un lado o en el otro, nunca en los dos ni en ninguno',
    );

    // Lo que importa: la fontanería del arnés no se lista como capacidad. Si
    // "harness" u "orient" salieran por nombre, el diccionario se rompería.
    const nombres = [...queSabe.sabe, ...queSabe.puedeAprender].map((c) => c.id);
    for (const interna of ['harness', 'orient', 'suggest', 'init']) {
      assert.ok(!nombres.includes(interna), `${interna} es fontanería y no se enseña`);
    }
    return `${queSabe.sabe.length} sabe · ${queSabe.puedeAprender.length} puede aprender`;
  });

  await comprobar('el diario lee los dos formatos y no se traga las plantillas', () => {
    const diario = cargar('diario');

    const sesiones = diario.sesiones();
    assert.equal(sesiones.length, 2, 'las dos anotaciones de verdad, y la plantilla fuera');
    assert.equal(sesiones[0].fecha, '2026-09-16', 'lo más nuevo, primero');
    assert.ok(sesiones.every((s) => !/[{}]/.test(s.titulo)), 'una plantilla del arnés no es trabajo de nadie');

    // Las decisiones se escriben de dos maneras según quién las escriba, y las
    // dos hay que leerlas: con la larga sola, el primer día se ve vacío; con la
    // corta sola, se pierde el porqué, que es lo único que vale a los tres meses.
    const decisiones = diario.decisiones();
    const largas = decisiones.filter((d) => d.porque);
    const cortas = decisiones.filter((d) => !d.porque);
    assert.ok(largas.length >= 2, 'las del formato largo, con su porqué');
    assert.ok(cortas.length >= 2, 'y las sueltas que deja el montaje');
    assert.equal(decisiones[0].titulo, 'Plazo de cobro', 'lo más nuevo, primero');
    assert.ok(!decisiones.some((d) => /^(date|decision|why)\b/i.test(d.titulo)), 'un campo no es una decisión');

    return `${sesiones.length} anotaciones · ${decisiones.length} decisiones`;
  });

  await comprobar('no se abre nada de fuera del diario', () => {
    const diario = cargar('diario');
    for (const truco of ['../../../etc/passwd', '../../wiki/index.md', 'algo.txt']) {
      assert.equal(diario.dondeVive(truco), null, `${truco} no se abre desde aquí`);
    }
    // Y una de verdad sí, que si no la prueba pasaría con la función rota.
    assert.ok(diario.dondeVive(diario.sesiones()[0].fichero), 'la que existe sí');
    return '3 intentos fuera, ninguno pasa';
  });

  await comprobar('cambiar cómo te habla reescribe el perfil sin romper lo demás', () => {
    const trato = cargar('trato');
    const perfil = path.join(vscode.guion.raiz, '02-DOCS/wiki/harness/user-profile.md');
    const antes = fs.readFileSync(perfil, 'utf8');

    assert.equal(trato.comoEstamos().trato, 'L3', 'lo que dice el perfil de la empresa de mentira');
    assert.ok(trato.ponerTrato('L0').ok);
    assert.ok(trato.ponerPalabras('technical').ok);

    const despues = fs.readFileSync(perfil, 'utf8');
    assert.equal(trato.comoEstamos().trato, 'L0');
    assert.equal(trato.comoEstamos().palabras, 'technical');

    // Lo que no se puede perder: el nombre del arnés y el de la empresa viven
    // en ese mismo fichero, y el rótulo de la barra sale de ahí.
    assert.match(despues, /^arnes: Facturación$/m);
    assert.match(despues, /^empresa: Ferretería Soler$/m);
    assert.match(despues, /^Goal: organizar mis facturas$/m);

    // Y volver a elegir lo que ya estaba no puede dejar dos líneas: el
    // asistente leería la de arriba, que sería la vieja.
    trato.ponerTrato('L0');
    const veces = (fs.readFileSync(perfil, 'utf8').match(/^\s*-?\s*accompaniment/gmi) || []).length;
    assert.equal(veces, 1, 'una sola línea, siempre');

    assert.ok(!trato.ponerTrato('L9').ok, 'un escalón que no existe no se escribe');
    fs.writeFileSync(perfil, antes);
    return 'perfil reescrito y lo demás intacto';
  });

  await comprobar('la pantalla principal no ha perdido ninguna acción por el camino', () => {
    // Al agrupar la pantalla en filas plegables es fácil dejarse un botón fuera
    // sin que nadie se entere: el botón simplemente deja de existir y no hay
    // error que lo delate.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    const principal = panel.slice(panel.indexOf('function pantallaPrincipal'), panel.indexOf('function pantallaConexiones'));

    const imprescindibles = [
      'verPapeles', 'anadirDocumentos', 'verSalidas',
      'verCerebro', 'verHuecos', 'verTrato',
      'guardarCopia', 'verCopiaFuera', 'verCopias', 'verDiario',
      'verConexiones', 'verSaberes',
      'verAyuda', 'verRadiografia',
      'verLaCara', 'elegirCarpeta', 'verEditorCompleto', 'bajarLaNueva',
    ];
    const faltan = imprescindibles.filter((t) => !principal.includes(`tipo: '${t}'`));
    assert.deepEqual(faltan, [], `la pantalla principal ya no lleva a: ${faltan.join(', ')}`);

    // "Algo va mal" ya no cuelga de la principal: vive dentro de Ayuda, que es
    // donde se busca. Pero tiene que seguir llegándose a él.
    const ayuda = panel.slice(panel.indexOf('function pantallaAyuda'), panel.indexOf('function pantallaPapeles'));
    assert.match(ayuda, /tipo: 'algoVaMal'/, 'a "Algo va mal" se llega desde Ayuda');

    // Y el material de la marca se da desde su pantalla, no desde la principal:
    // el diseño lo hace el asistente, la barra solo recoge lo que mirar.
    const laCara = panel.slice(panel.indexOf('function pantallaLaCara'), panel.indexOf('function pantallaComoTrabaja'));
    for (const t of ['ponerLaCara', 'materialDeMarca', 'quitarLaCara']) {
      assert.ok(laCara.includes(`tipo: '${t}'`), `falta ${t} en la pantalla de la cara`);
    }

    // Y cada fila plegable tiene que tener nombre propio, o dos se pisarían el
    // recuerdo de abierta/cerrada.
    const ids = [...principal.matchAll(/id: '(grupo:[a-z]+)'/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'dos filas con el mismo nombre se pisan');
    assert.ok(ids.length >= 6, 'los seis apartados de siempre, y el de SDD si esa carpeta construye algo');

    return `${imprescindibles.length} acciones · ${ids.length} apartados`;
  });

  await comprobar('el texto apagado no se apaga dos veces', () => {
    // `--apagado` ya viene calculado para cumplir contraste sobre el fondo.
    // Ponerle encima una opacidad lo hunde otra vez, y con tema oscuro acaba
    // en gris sobre gris. Pasó con las pistas del diario.
    const css = fs.readFileSync(path.join(RAIZ, 'media', 'panel.css'), 'utf8');
    const culpables = css.split('\n')
      .filter((l) => /opacity/.test(l) && /\.(pista|detalle|cuando|cuantos|paso-cuerpo|pieza-detalle)\b/.test(l));
    assert.deepEqual(culpables, [], `texto apagado con opacidad encima: ${culpables.join(' | ')}`);
    return 'ninguno';
  });

  await comprobar('las reglas salen de los tres sitios de RSC, y las plantillas no', () => {
    const reglas = cargar('reglas');
    const hay = reglas.queHay();

    // La constitución es prosa con encabezados; el CLAUDE.md, una lista. Las
    // dos formas hay que leerlas o media pantalla sale vacía.
    assert.deepEqual(hay.innegociables, [
      'Nunca se factura sin albarán firmado',
      'Los precios no se cambian sin pasar por Marta',
    ]);
    assert.ok(hay.deLaCasa.includes('Los datos del banco no salen de esta carpeta.'));
    assert.ok(!hay.innegociables.concat(hay.deLaCasa).some((r) => /[{}]/.test(r)),
      'un ejemplo de la plantilla no es una regla de esta empresa');

    // Y solo se abren esos tres. El nombre viene de un mensaje del panel.
    assert.ok(reglas.dondeVive('constitucion'));
    assert.equal(reglas.dondeVive('../../.env'), null);
    assert.equal(reglas.dondeVive('cualquier-cosa'), null);

    return `${hay.innegociables.length} innegociables · ${hay.deLaCasa.length} de la casa`;
  });

  await comprobar('el andamio de la wiki no se cuenta como algo que sepa', () => {
    // `sdd/` guarda la constitución y tiene su propia pantalla. Si contara como
    // tema, al alumno le saldría "Sdd" en la lista de lo que sabe de su
    // empresa, que no significa nada — el mismo fallo que ya se arregló con
    // `harness/` y `brand/`.
    const temas = cargar('cerebro').catalogo().map((t) => t.id);
    for (const andamio of ['harness', 'brand', 'sdd']) {
      assert.ok(!temas.includes(andamio), `${andamio} es andamio, no un tema`);
    }
    return temas.join(' · ');
  });

  await comprobar('solo se quita el papel del que no ha aprendido nada', () => {
    // Borrar el fichero NO borra lo que sacó de él. Con los que ya ha leído no
    // borramos nosotros: se le pide al asistente, que sabe qué se llevó.
    const papeles = cargar('papeles');
    const { esperando, leidos, originales } = papeles.queHay();

    assert.ok(papeles.sinLeer(esperando[0].ruta), 'el de la bandeja todavía no lo ha leído nadie');
    assert.ok(!papeles.sinLeer(leidos[0].ruta), 'el que ya leyó, no');
    assert.ok(!papeles.sinLeer(originales[0].ruta), 'y el original guardado, tampoco');

    const negado = papeles.quitar(leidos[0].ruta);
    assert.equal(negado.ok, false);
    assert.equal(negado.alAsistente, true, 'se deriva al asistente, no se borra a medias');
    assert.ok(fs.existsSync(path.join(vscode.guion.raiz, leidos[0].ruta)), 'y sigue ahí');

    const quitado = papeles.quitar(esperando[0].ruta);
    assert.equal(quitado.ok, true);
    assert.ok(!fs.existsSync(path.join(vscode.guion.raiz, esperando[0].ruta)));

    // Se deja como estaba, que las pruebas de después cuentan documentos.
    fs.writeFileSync(path.join(vscode.guion.raiz, esperando[0].ruta), 'Contrato marco de mentira.\n');
    return 'uno quitado, dos protegidos';
  });

  await comprobar('cada buscador busca en lo suyo y se sabe por el nombre', () => {
    // Jose quiso dos con nombre en vez de uno agrupado: que se sepa qué va a
    // salir antes de escribir. Si los dos devuelven lo mismo, no sirve de nada.
    const soloPapeles = buscador.buscar('contrato', 15, 'papeles');
    const soloConceptos = buscador.buscar('contrato', 15, 'conceptos');

    assert.deepEqual(soloPapeles.grupos.map((g) => g.titulo), ['Documentos']);
    assert.ok(!soloConceptos.grupos.some((g) => g.titulo === 'Documentos'), 'el de conceptos no saca papeles');
    assert.ok(soloConceptos.grupos.length, 'pero saca lo suyo');

    // Y el panel tiene que pintar dos cajas distintas, con rótulos distintos.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    assert.match(panel, /cajaDeBusqueda\('papeles'\)/);
    assert.match(panel, /cajaDeBusqueda\('conceptos'\)/);
    assert.match(panel, /Buscar un documento/);
    assert.match(panel, /Buscar un concepto/);

    return 'dos cajas, dos resultados';
  });

  await comprobar('la cuenta de GitHub se ofrece al montar, no el día que hace falta', () => {
    // Antes solo salía al pulsar "Subir a GitHub", que es el peor momento: ya
    // quieres guardar y te toca crearte una cuenta.
    const fuente = fs.readFileSync(path.join(RAIZ, 'src', 'extension.js'), 'utf8');
    const wizard = fuente.slice(fuente.indexOf('async arrancar()'), fuente.indexOf('async ponerLaCara()'));
    assert.match(wizard, /github\.estado\(\)/, 'el wizard mira si hay cuenta');
    assert.match(wizard, /Más tarde/, 'y se puede decir que no');
    return 'se ofrece y se puede rechazar';
  });

  await comprobar('con Codex se enseñan las reglas de AGENTS.md, no las de Claude', () => {
    // Con Codex, `CLAUDE.md` no lo lee nadie. Enseñar sus reglas sería enseñar
    // reglas que no se están aplicando, que es peor que no enseñar ninguna.
    const reglas = cargar('reglas');
    const fs2 = require('node:fs');
    const declaracion = path.join(vscode.guion.raiz, '.rsc.json');
    const antes = fs2.readFileSync(declaracion, 'utf8');

    assert.equal(reglas.queHay().cual, 'claude');

    fs2.writeFileSync(declaracion, JSON.stringify({ ...JSON.parse(antes), targets: ['codex'] }, null, 2));
    vscode.guion.extensionesInstaladas = ['openai.chatgpt'];
    assert.equal(reglas.queHay().cual, 'otros', 'con Codex manda AGENTS.md');

    fs2.writeFileSync(declaracion, antes);
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    return 'cada uno lee las suyas';
  });

  await comprobar('lo que puede hacer solo se escribe sin perder los enganches', () => {
    // En `.claude/settings.json` viven los enganches del arnés. Escribir ahí
    // pisando el fichero dejaría la carpeta a medias sin que se note.
    const ajustes = cargar('ajustes');
    const fichero = path.join(vscode.guion.raiz, '.claude/settings.json');
    fs.mkdirSync(path.dirname(fichero), { recursive: true });
    fs.writeFileSync(fichero, JSON.stringify({ hooks: { SessionStart: ['algo'] } }, null, 2));

    assert.equal(ajustes.comoEstamos().permiso, 'default', 'sin nada escrito, lo prudente');
    assert.ok(ajustes.ponerPermiso('plan').ok);

    const despues = JSON.parse(fs.readFileSync(fichero, 'utf8'));
    assert.equal(despues.permissions.defaultMode, 'plan');
    assert.deepEqual(despues.hooks.SessionStart, ['algo'], 'los enganches siguen ahí');

    assert.ok(!ajustes.ponerPermiso('bypassPermissions').ok, 'quitarle el freno de mano no es un ajuste que ofrezcamos');
    return 'escrito sin pisar nada';
  });

  await comprobar('guardar solo no toca el historial de otra persona', () => {
    // Guardar a mano lo pulsa alguien que está mirando. Guardar solo, no: si
    // la carpeta ya venía con trabajo de otro, no se escribe nada.
    const fuente = fs.readFileSync(path.join(RAIZ, 'src', 'extension.js'), 'utf8');
    const trozo = fuente.slice(fuente.indexOf('function guardarSolo'), fuente.indexOf('function activate'));

    assert.match(trozo, /podemosGuardarElPuntoDePartida/, 'la guardia de la decisión 28 también aquí');
    assert.match(trozo, /cambiosSinGuardar/, 'y no guarda si no hay nada nuevo');
    assert.match(trozo, /unref/, 'y el reloj no mantiene vivo el proceso');
    assert.ok(!/showInformationMessage|showWarningMessage/.test(trozo), 'y no interrumpe para decir que todo va bien');
    return 'tres guardias';
  });

  await comprobar('un documento se abre dentro del editor si sabe enseñarlo', () => {
    // Sacar a alguien a otro programa para leer tres líneas rompe lo único que
    // este proyecto intenta: que todo pase en un sitio. Pero un `.xlsx` como
    // texto sería basura, así que esos sí salen fuera.
    const papeles = cargar('papeles');
    const dentro = ['informe.md', 'notas.txt', 'datos.csv', 'logo.png', 'cosas.json'];
    const fuera = ['contrato.pdf', 'cuentas.xlsx', 'carta.docx', 'presentacion.pptx'];

    for (const f of dentro) assert.ok(papeles.LAS_PINTA_EL_EDITOR.test(f), `${f} lo sabe enseñar el editor`);
    for (const f of fuera) assert.ok(!papeles.LAS_PINTA_EL_EDITOR.test(f), `${f} necesita su programa`);
    return `${dentro.length} dentro · ${fuera.length} fuera`;
  });

  await comprobar('los datos de hoy no se escriben cuando no hay nada que decir', () => {
    // Una línea que ponga "0 copias · 0 documentos" es peor que no tener línea.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    assert.match(panel, /pulso\.length \?/, 'la línea solo se pinta si trae algo');

    // Y la tarjeta que contaba dónde estabas ya no está en la principal: eso lo
    // hace `orient` en la conversación, y mejor.
    const principal = panel.slice(panel.indexOf('function pantallaPrincipal'), panel.indexOf('function pantallaConexiones'));
    assert.ok(!/Lo último|Dónde estás/.test(principal), 'la brújula sale de la principal');
    assert.ok(!/deUnVistazo/.test(principal), 'y las consultas vuelven a su programa');
    return 'sin tarjeta y sin consultas sueltas';
  });

  await comprobar('salir de una pantalla no cuesta más que entrar', () => {
    // En una barra estrecha el final de la pantalla está a dos pantallazos. Un
    // "Volver" ahí abajo obliga a recorrer todo para salir.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    const abajo = panel.match(/\n(?:    <hr class="separador">\n)?    \$\{volver\([^\n]*\)\}\n  `;/g) || [];
    assert.deepEqual(abajo, [], 'ningún "Volver" se queda al final de su pantalla');
    return 'todos arriba';
  });

  await comprobar('cada número dice de qué es', () => {
    // Un "4" a secas al lado de un rótulo no se sabe si son cuatro cosas dentro
    // o cuatro de otra cosa — y al lado del rótulo siguiente significaba algo
    // distinto. Lo vio Jose.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    const principal = panel.slice(panel.indexOf('function pantallaPrincipal'), panel.indexOf('function pantallaConexiones'));
    const sueltos = [...principal.matchAll(/cuantos: ([^\n,]+),/g)].map((m) => m[1].trim());
    for (const c of sueltos) {
      assert.ok(/plural\(/.test(c), `un número sin decir de qué es: ${c}`);
    }
    assert.ok(sueltos.length >= 2, 'los que haya, con su palabra');
    return `${sueltos.length} números, todos con su palabra`;
  });

  await comprobar('lo que se fija arriba lo elige quien usa la barra', () => {
    const fijadas = cargar('fijadas');
    const almacen = (() => {
      let dentro;
      return { get: () => dentro, update: async (_, v) => { dentro = v; } };
    })();

    // Sin elegir nada, los botones que ha creado el asistente: es lo que hacía
    // la barra antes de que esto existiera.
    const porDefecto = fijadas.puestas(almacen, RAIZ);
    assert.ok(porDefecto.length, 'algo tiene que salir arriba');
    assert.ok(porDefecto.every((c) => c.id.startsWith('boton:')), 'y son sus botones');
    assert.deepEqual(fijadas.elegidas(almacen), [], 'pero ninguno está "elegido": es un default');

    const hay = fijadas.candidatos(RAIZ).flatMap((g) => g.cosas);
    assert.ok(hay.some((c) => c.id.startsWith('consulta:')), 'las consultas de los programas también se pueden fijar');

    return `${hay.length} cosas se pueden fijar · tope ${fijadas.TOPE}`;
  });

  await comprobar('no caben más de cinco arriba', async () => {
    const fijadas = cargar('fijadas');
    let dentro;
    const almacen = { get: () => dentro, update: async (_, v) => { dentro = v; } };
    const hay = fijadas.candidatos(RAIZ).flatMap((g) => g.cosas);

    for (const c of hay.slice(0, fijadas.TOPE)) {
      assert.ok((await fijadas.fijar(almacen, c.id, RAIZ)).ok);
    }
    if (hay.length > fijadas.TOPE) {
      const sobra = await fijadas.fijar(almacen, hay[fijadas.TOPE].id, RAIZ);
      assert.equal(sobra.ok, false, 'la sexta no entra');
      assert.match(sobra.mensaje, /Quita una/, 'y se dice qué hacer');
    }
    assert.equal(fijadas.puestas(almacen, RAIZ).length, fijadas.TOPE);

    assert.ok(!(await fijadas.fijar(almacen, 'boton:que-no-existe', RAIZ)).ok, 'lo que no existe no se fija');
    return `${fijadas.TOPE} fijadas`;
  });

  await comprobar('ninguna regla del panel lleva un color escrito a fuego', () => {
    // Lo que vio Jose: botones marrones y un halo rojo bajo un botón cian. La
    // causa eran colores fijos en las reglas y —peor— dos variables que NO se
    // declaraban en ninguna parte, `--el-acento` y `--el-borde`, así que todas
    // sus reglas caían siempre en el valor de reserva: un marrón que no es de
    // nadie y unos bordes negros que sobre fondo oscuro no se ven.
    const css = fs.readFileSync(path.join(RAIZ, 'media', 'panel.css'), 'utf8');
    const cuerpo = css.slice(css.indexOf('* { box-sizing'));

    const declarados = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
    const usados = new Set([...cuerpo.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
    const fantasmas = [...usados].filter((v) => !declarados.has(v) && !v.startsWith('--vscode'));
    assert.deepEqual(fantasmas, [], `variables que nadie declara, así que siempre pintan su reserva: ${fantasmas.join(', ')}`);

    // Y ningún color literal, salvo un negro puro de sombra, que vale en
    // cualquier marca porque no es un color: es una sombra.
    const aFuego = cuerpo.split('\n')
      .filter((l) => /#[0-9a-fA-F]{3,8}\b/.test(l) || /rgba?\((?!0, 0, 0)/.test(l))
      .filter((l) => !l.includes('var(--vscode'))
      .map((l) => l.trim());
    assert.deepEqual(aFuego, [], `colores escritos a fuego: ${aFuego.join(' | ')}`);

    return `${declarados.size} colores declarados · 0 fantasmas · 0 a fuego`;
  });

  await comprobar('la marca trae todos los colores que las reglas piden', () => {
    // Si una regla usa un color que la marca no calcula, esa regla se queda con
    // el de Executive Lab y sale un botón rojo en una empresa cian.
    const css = fs.readFileSync(path.join(RAIZ, 'media', 'panel.css'), 'utf8');
    const cuerpo = css.slice(css.indexOf('* { box-sizing'));
    const usados = [...new Set([...cuerpo.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
      .filter((v) => !v.startsWith('--vscode') && !['--sans', '--serif', '--radio', '--radio-lg', '--hueco', '--sombra', '--alto-boton'].includes(v));

    montarMarca(empresa, { fondo: '#0d1117', texto: '#e6edf3', acento: '#22d3ee' });
    const tokens = marca.leer().tokens;
    const faltan = usados.filter((v) => !(v in tokens));
    assert.deepEqual(faltan, [], `la marca no calcula: ${faltan.join(', ')}`);

    montarMarca(empresa);
    return `${usados.length} colores, todos los pone la marca`;
  });

  await comprobar('el material de la marca va a su carpeta, no a la bandeja', () => {
    // Son dos sitios distintos y el asistente los lee para cosas distintas: en
    // la bandeja, el logotipo se mezclaría con las facturas.
    const tema = cargar('tema');
    const puesto = tema.guardarSoltado([
      { nombre: 'manual-de-marca.pdf', datos: Buffer.from('un pdf de mentira').toString('base64') },
    ]);
    assert.equal(puesto.ok, true);
    assert.ok(tema.material().includes('manual-de-marca.pdf'));
    assert.ok(fs.existsSync(path.join(vscode.guion.raiz, '02-DOCS/wiki/brand/manual-de-marca.pdf')));

    // Y no pisa lo que ya estaba: ahí puede estar el trabajo del asistente.
    tema.guardarSoltado([{ nombre: 'manual-de-marca.pdf', datos: Buffer.from('otro').toString('base64') }]);
    assert.ok(tema.material().includes('manual-de-marca (2).pdf'), 'se numera en vez de sobrescribir');

    // Volver a la cara de siempre borra el récord y deja el material: lo dio
    // esa persona y no es nuestro para borrarlo.
    assert.ok(tema.quitarla().ok);
    assert.ok(!fs.existsSync(path.join(vscode.guion.raiz, '02-DOCS/wiki/brand/marca.md')));
    assert.ok(tema.material().length, 'el material se queda');

    montarMarca(empresa);
    return `${tema.material().length} cosas de material`;
  });

  await comprobar('lo que se le pide lleva el material que se le ha dado', () => {
    const tema = cargar('tema');
    const conTodo = tema.queLePedimos({ web: 'https://nexus.example', puestos: ['logo.svg'], contado: 'somos azules' });
    assert.match(conTodo, /nexus\.example/);
    assert.match(conTodo, /logo\.svg/, 'se le dice qué mirar');
    assert.match(conTodo, /somos azules/);
    assert.match(conTodo, /brand\/marca\.md/, 'y dónde escribirlo');

    // Sin web también vale: hay pymes que no tienen.
    const sinWeb = tema.queLePedimos({ puestos: ['logo.svg'] });
    assert.ok(!/\(no te he dado web\)/.test(sinWeb), 'no se le cuela el hueco del ejemplo');
    assert.match(sinWeb, /brand\/marca\.md/);
    return 'con web y sin ella';
  });

  await comprobar('lo de SDD aparece solo si esa carpeta construye algo', () => {
    // Un arnés de contabilidad no tiene specs y no las va a tener nunca. Uno
    // donde se monte una web, sí. Misma regla que el resto de la barra: no hay
    // nada predefinido, sale lo que esa carpeta tenga.
    const proyectos = cargar('proyectos');
    const hay = proyectos.queHay();

    assert.ok(proyectos.hayAlgo(), 'la empresa de mentira sí construye algo');
    assert.deepEqual(hay.map((m) => m.id), ['specs', 'plans'], 'solo los montones que existen');

    const spec = hay[0].cosas[0];
    assert.equal(spec.titulo, 'Vender recambios por internet', 'el título, no el nombre del fichero');
    assert.equal(spec.estado, 'accepted');

    // Las tareas se cuentan de la tabla; no se dice cuántas van hechas, porque
    // el fichero no lo dice y no se inventa.
    const plan = hay[1].cosas[0];
    assert.equal(plan.tareas, 3);

    // Y en una carpeta sin SDD, el apartado no existe.
    const sinSdd = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-sdd-'));
    vscode.guion.raiz = sinSdd;
    assert.equal(cargar('proyectos').hayAlgo(), false);
    vscode.guion.raiz = empresa;

    return `${hay.length} montones · ${plan.tareas} tareas`;
  });

  await comprobar('no se abre nada de fuera de SDD', () => {
    const proyectos = cargar('proyectos');
    for (const truco of ['../../../etc/passwd', '../harness/user-profile.md', 'specs/algo.txt']) {
      assert.equal(proyectos.dondeVive(truco), null, `${truco} no se abre desde aquí`);
    }
    assert.ok(proyectos.dondeVive('specs/tienda-de-recambios.md'), 'la de verdad sí');
    return '3 intentos fuera, ninguno pasa';
  });

  await comprobar('un logotipo se ve siempre, tiña o no se pueda teñir', () => {
    // El nuestro se tiñe: va dentro de la página y sus colores son los de la
    // barra. El de una empresa NO se tiñe —es su marca— así que cuando no se
    // vería sobre su propio fondo se le pone una plaquita detrás.
    const fs2 = require('node:fs');
    const brand = path.join(empresa, '02-DOCS/wiki/brand');
    const ponerLogo = (svg) => {
      fs2.writeFileSync(path.join(brand, 'logo.svg'), svg);
      return marca.leer();
    };

    montarMarca(empresa, { fondo: '#0d1117', texto: '#e6edf3', acento: '#22d3ee' });
    assert.equal(ponerLogo('<svg viewBox="0 0 10 10"><path fill="#111111" d="M0 0h10v10H0z"/></svg>').placa,
      true, 'un logotipo negro sobre azul marino necesita plaquita');
    assert.equal(marca.leer().tokens['--placa'], '#ffffff', 'y la plaquita va clara');

    assert.equal(ponerLogo('<svg viewBox="0 0 10 10"><path fill="#ffffff" d="M0 0h10v10H0z"/></svg>').placa,
      false, 'uno blanco sobre azul marino ya se ve');

    montarMarca(empresa, { fondo: '#ffffff', texto: '#111111', acento: '#0057b8' });
    const claroSobreClaro = ponerLogo('<svg viewBox="0 0 10 10"><path fill="#fafafa" d="M0 0h10v10H0z"/></svg>');
    assert.equal(claroSobreClaro.placa, true, 'uno casi blanco sobre blanco no se ve');
    assert.ok(cargar('color').luz(marca.leer().tokens['--placa']) < 0.5, 'y ahí la plaquita va oscura');

    // Y el nuestro, el que sí se tiñe.
    const fuente = fs.readFileSync(path.join(RAIZ, 'src', 'extension.js'), 'utf8');
    const nuestro = fuente.slice(fuente.indexOf('nuestroLogo('), fuente.indexOf('html(webview'));
    assert.match(nuestro, /currentColor/, 'el nombre toma el color del texto');
    assert.match(nuestro, /var\(--acento\)/, 'y el asterisco el del acento');

    montarMarca(empresa);
    return 'tres casos, y el nuestro teñido';
  });

  await comprobar('esperar no es un callejón: siempre se puede volver', () => {
    // El fallo que lo hizo evidente: con el panel colgado esperando a GitHub no
    // había forma de salir de esa pantalla.
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');
    const cuerpo = panel.slice(panel.indexOf('function pantallaEsperando'));
    const hasta = cuerpo.slice(0, cuerpo.indexOf('function arrancarElReloj'));
    assert.match(hasta, /tipo: 'volver'/, 'la pantalla de espera tiene que llevar salida');
    return 'con botón de volver';
  });

  // ------------------------------------------------------- el panel pinta
  //
  // El panel es un fichero de navegador y hasta ahora no lo probaba nadie. Si
  // revienta al pintar, o si el mensaje llega con un nombre que no conoce, NO
  // PASA NADA VISIBLE: se queda la pantalla anterior y la barra parece
  // colgada. Ha pasado dos veces y las dos las encontró Jose mirando.

  const { montarPanel } = require('./panel-falso');

  await comprobar('todo mensaje que la extensión manda, el panel sabe pintarlo', () => {
    const fuente = fs.readFileSync(path.join(RAIZ, 'src', 'extension.js'), 'utf8');
    const panel = fs.readFileSync(path.join(RAIZ, 'media', 'panel.js'), 'utf8');

    const manda = new Set([...fuente.matchAll(/enviar\(\{\s*tipo:\s*'([a-zA-Z]+)'/g)].map((m) => m[1]));
    const sabe = new Set([...panel.matchAll(/case '([a-zA-Z]+)':/g)].map((m) => m[1]));

    const huerfanos = [...manda].filter((t) => !sabe.has(t));
    assert.deepEqual(huerfanos, [], `la extensión manda mensajes que el panel no sabe pintar: ${huerfanos.join(', ')}`);
    return `${manda.size} mensajes, todos con pantalla`;
  });

  await comprobar('cada pantalla pinta algo con los datos de verdad', () => {
    const p = montarPanel();
    const cerebroM = cargar('cerebro');
    const copiasM = cargar('guardar');
    const diarioM = cargar('diario');
    const tratoM = cargar('trato');

    // Los datos salen de los módulos de verdad sobre la empresa de mentira, no
    // de un objeto inventado a mano: así la prueba se entera si cambia la forma.
    const radio = { queEs: 'conArnes', piezas: [{ nombre: 'x', estado: 'si', detalle: 'y' }] };
    const sabe = cargar('saberes').queSabe(RAIZ);

    const pantallas = [
      ['esperando', { tipo: 'esperando', que: 'Un momento…' }, /Volver/],
      ['estado', {
        tipo: 'estado',
        estado: { listo: true, sabe: 1, conectados: 1 },
        acciones: [],
        modo: 'sencillo',
        marcaPuesta: true,
        comoSeLlama: 'tu trabajo',
        pulso: ['1 copia hoy', 'cambios sin guardar'],
      }, /Lo que sabe.*Histórico.*Ajustes/s],
      ['radiografia', { tipo: 'radiografia', ...radio }, /Qué falta por montar/],
      ['saberes', { tipo: 'saberes', sabe: sabe.sabe, puedeAprender: sabe.puedeAprender, deSerie: sabe.deSerie }, /Habilidades \(skills\)/],
      ['salidas', { tipo: 'salidas', herramientas: cargar('salidas').loQueHaProducido() }, /Lo que ha hecho/],
      // Con la forma exacta que manda la extensión: si a una pantalla le falta
      // un campo, revienta y antes eso no se veía.
      ['cerebro', {
        tipo: 'cerebro',
        temas: cerebroM.catalogo(),
        sinOrdenar: cerebroM.sinOrdenar().slice(0, 8),
        esperando: cerebroM.esperandoLectura(),
        yaLeidos: cerebroM.yaLeidos(),
        hayPanel: cerebroM.hayPanel(),
        aviso: null,
      }, /Facturacion|Lo que sabe|tema/i],
      ['conexiones', { tipo: 'conexiones', proveedores: conexiones.proveedores() }, /Holded/],
      ['copias', { tipo: 'copias', copias: [] }, /./],
      ['copiaFuera', { tipo: 'copiaFuera', github: { conectado: false, usuario: null, remoto: null } }, /Entrar en mi cuenta/],
      ['incidencia', { tipo: 'incidencia', codigo: 'ABC234', sano: true }, /ABC234/],
      ['diario', {
        tipo: 'diario',
        sesiones: diarioM.sesiones(),
        decisiones: diarioM.decisiones(),
        aprendido: cerebroM.aprendidoUltimamente(5),
      }, /Talleres Ruiz/],
      ['huecos', { tipo: 'huecos', huecos: cerebroM.loQueAunNoSabe(4) }, /Preguntas sin contestar/],
      ['papeles', { tipo: 'papeles', ...cargar('papeles').queHay() }, /contrato-talleres-ruiz/],
      ['ayuda', { tipo: 'ayuda', github: { conectado: false } }, /Estoy atascado|por dónde seguir/],
      ['reglas', { tipo: 'reglas', ...cargar('reglas').queHay() }, /albarán firmado/],
      ['asistente', { tipo: 'asistente', ...cargar('asistentes').comoEstamos(), aviso: null }, /Claude|Codex/],
      ['comoTrabaja', { tipo: 'comoTrabaja', ...cargar('ajustes').comoEstamos(), aviso: null }, /Cada cuánto guarda solo/],
      ['laCara', { tipo: 'laCara', ...cargar('tema').comoEstamos(), aviso: null }, /Dale material/],
      ['proyectos', { tipo: 'proyectos', montones: cargar('proyectos').queHay() }, /Vender recambios/],
      ['trato', { tipo: 'trato', ...tratoM.comoEstamos(), aviso: null }, /Cuánto te explica/],
      ['aviso', { tipo: 'aviso', texto: 'algo' }, /./],
    ];

    for (const [nombre, mensaje, espera] of pantallas) {
      let pintado;
      try {
        pintado = p.mandar(mensaje);
      } catch (error) {
        throw new Error(`"${nombre}" revienta al pintar: ${error.message}`);
      }
      assert.ok(pintado && pintado.length > 20, `"${nombre}" no pinta nada: la barra se quedaría como estaba`);
      // Y que no se haya salvado pintando la pantalla de "algo no se ha podido
      // pintar", que es la red de seguridad y no un aprobado.
      assert.ok(!/no se ha podido pintar/.test(pintado), `"${nombre}" cae en la pantalla de fallo`);
      assert.match(pintado, espera, `"${nombre}" pinta algo que no se parece a lo suyo`);
    }
    // Y la red de seguridad, que también tiene que funcionar: un mensaje que
    // el panel no conoce no puede dejar la barra congelada.
    const raro = p.mandar({ tipo: 'esto-no-existe' });
    assert.match(raro, /no se ha podido pintar/, 'un mensaje desconocido tiene que verse, no congelar la pantalla');

    return `${pantallas.length} pantallas, y los mensajes raros se ven`;
  });

  await comprobar('en el diario, la fecha no se pega al título', () => {
    // Salía "…y sale a la luz el diario del arnéshoy": la fecha iba detrás del
    // título dentro del mismo párrafo, y ese párrafo no es una fila flexible,
    // así que se quedaban pegadas. Lo vio Jose en la barra.
    const p = montarPanel();
    const diarioM = cargar('diario');
    const pintado = p.mandar({ tipo: 'diario', sesiones: diarioM.sesiones(), decisiones: diarioM.decisiones() });

    for (const s of diarioM.sesiones()) {
      const sinEspacio = new RegExp(`${s.titulo.slice(-6).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`);
      assert.ok(sinEspacio.test(pintado), 'el título tiene que cerrar su propio trozo');
    }
    assert.ok(!/<\/p><span class="cuando"/.test(pintado));
    assert.match(pintado, /<p class="cuando">/, 'la fecha va en su línea');
    return 'fecha arriba, título debajo';
  });

  // -------------------------------------------------- carpetas de alguien

  await comprobar('una carpeta con trabajo de alguien no se confunde con una vacía', async () => {
    const { execFileSync } = require('node:child_process');
    const suya = fs.mkdtempSync(path.join(os.tmpdir(), 'proyecto-de-alguien-'));
    fs.writeFileSync(path.join(suya, 'package.json'), '{"name":"lo-suyo"}\n');
    fs.writeFileSync(path.join(suya, 'index.js'), 'console.log(1)\n');
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: suya });
    execFileSync('git', ['-c', 'user.name=Alguien', '-c', 'user.email=a@b.c', 'add', '-A'], { cwd: suya });
    execFileSync('git', ['-c', 'user.name=Alguien', '-c', 'user.email=a@b.c', 'commit', '-qm', 'lo mío'], { cwd: suya });
    fs.writeFileSync(path.join(suya, 'index.js'), 'console.log(2)\n');

    vscode.guion.raiz = suya;
    const hay = await cargar('terreno').queHay();
    const estado = await brujula.estado({ fresco: true });
    const puede = await cargar('terreno').podemosGuardarElPuntoDePartida();
    vscode.guion.raiz = empresa;

    assert.equal(hay.tipo, 'empezada', 'una carpeta con cosas dentro no es una carpeta vacía');
    assert.equal(hay.conHistorial, true, 'el historial es de alguien, no nuestro');
    assert.equal(hay.sinGuardar, 1, 'y tiene un cambio sin guardar');
    assert.equal(hay.parece, 'una aplicación');
    assert.ok(estado.yaEmpezada, 'la brújula tiene que decirlo antes de ofrecer el botón');
    assert.equal(puede, false, 'NUNCA se escribe un commit nuestro en el historial de alguien');

    fs.rmSync(suya, { recursive: true, force: true });
    return `${hay.cuantos} cosas · ${hay.parece} · con historial`;
  });

  await comprobar('una carpeta vacía sí se puede preparar sin preguntar nada', async () => {
    const limpia = fs.mkdtempSync(path.join(os.tmpdir(), 'del-todo-vacia-'));
    vscode.guion.raiz = limpia;
    const hay = await cargar('terreno').queHay();
    const estado = await brujula.estado({ fresco: true });
    vscode.guion.raiz = empresa;

    assert.equal(hay.tipo, 'vacia');
    assert.equal(estado.yaEmpezada, undefined, 'en una vacía no hay nada que avisar');
    return 'vacía de verdad';
  });

  // ---------------------------------------------------------------- git
  //
  // git es obligatorio (extension/src/git.js dice por qué). Estas tres prueban
  // las tres formas en que eso puede volver a romperse sin que nadie lo note.

  await comprobar('bash se busca donde lo deja el Git oficial de Windows', () => {
    // Antes bash lo traía MinGit dentro de nuestra carpeta. Desde que lo
    // instala el Git oficial, vive en la suya — y su instalador pone `cmd/` en
    // el PATH, que lleva git.exe pero NO bash.exe. Sin ir a buscarlo, "Probar
    // la conexión" no funcionaría en Windows.
    const sitios = cargar('entorno').dondeViveBash();
    if (process.platform !== 'win32') {
      assert.deepEqual(sitios, [], 'fuera de Windows no hay nada que buscar: bash está en el PATH');
      return 'no es Windows: bash del sistema';
    }
    assert.ok(sitios.some((s) => /Programs..Git/.test(s)), 'la instalación por usuario, que es la que hacemos');
    assert.ok(sitios.some((s) => /Program Files..Git/.test(s)), 'y la de todo el sistema, por si ya lo tenía');
    return `${sitios.length} sitios donde mirar`;
  });

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

      // La entrevista entera, en el orden en que la hace arrancar(). El
      // asistente no se pregunta porque solo hay uno instalado en el guion.
      // Esta prueba estuvo rota desde que el wizard pasó de una pregunta a
      // seis: como solo corre con --con-arnes, nadie lo vio.
      vscode.guion.respuestas = [
        'Llevar el día a día',            // de qué va
        'Organizar el papeleo',           // qué quiere resolver
        'Lo justo',                       // cómo se maneja
        'Todo, paso a paso',              // cuánto se le explica
        'Contratos',                      // cómo se llama esto
        'Nexus Consulting',               // y su empresa
        '',                               // la web: en blanco, que es opcional
      ];

      const hecho = await cargar('arrancar').arrancar(contexto, vscode.window.createOutputChannel());
      assert.equal(hecho.ok, true, hecho.mensaje || 'se canceló a mitad: alguna pregunta se quedó sin respuesta');
      assert.equal(vscode.guion.respuestas.length, 0, 'han sobrado respuestas: el wizard pregunta menos de lo que cree esta prueba');

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

      // Y los nombres que puso, en el perfil: de ahí sale el rótulo.
      assert.match(perfil, /^arnes: Contratos$/m);
      assert.match(perfil, /^empresa: Nexus Consulting$/m);

      vscode.guion.raiz = empresa;
      vscode.guion.respuestas = null;
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
