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
    'conexiones', 'acciones', 'cerebro', 'brujula', 'puente', 'soporte', 'disfraz', 'arrancar', 'extension'];
  await comprobar('todos los módulos cargan', () => {
    modulos.forEach(cargar);
    return `${modulos.length} módulos`;
  });

  const acciones = cargar('acciones');
  const conexiones = cargar('conexiones');
  const cerebro = cargar('cerebro');
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

  await comprobar('la guía para conectarla sale de su propio README', () => {
    const { proveedor } = conexiones.claves('HOLDED');
    assert.equal(proveedor.pasos.length, 5, 'cinco pasos, y ninguno técnico');
    assert.match(proveedor.pasos[0], /^Entra en app\.holded\.com/);
    assert.ok(!proveedor.pasos.some((p) => /cp |chmod|\.env/.test(p)), 'los pasos de fichero no se enseñan');
    return `${proveedor.pasos.length} pasos`;
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

  await comprobar('un artículo se abre en vista previa, nunca en el editor', async () => {
    vscode.registrado.ejecutados.length = 0;
    const hecho = await cerebro.abrirArticulo('facturacion/ciclo.md');
    assert.equal(hecho.ok, true);
    assert.equal(vscode.registrado.ejecutados.at(-1).id, 'markdown.showPreview');
    return 'markdown.showPreview';
  });

  await comprobar('una ruta que se sale de la wiki se rechaza', async () => {
    const hecho = await cerebro.abrirArticulo('../../.rsc.json');
    assert.equal(hecho.ok, false);
    return hecho.mensaje;
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
    const envio = vscode.registrado.ejecutados.find((e) => e.id === 'claude-vscode.editor.open');
    assert.deepEqual(envio.args, [undefined, 'hola'], 'sin sesión y con el texto como initialPrompt');
    return 'claude-vscode.editor.open';
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
    vscode.guion.comandosDeClaude = ['claude-vscode.editor.open', 'claude-vscode.focus', 'claude-vscode.editor.openLast'];
    return 'portapapeles + foco';
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

  await comprobar('el disfraz base escribe en los ajustes de usuario', async () => {
    const salida = vscode.window.createOutputChannel();
    // Las claves de Claude no existen hasta que su extensión se activa.
    vscode.guion.rechazaAjuste = (clave) => clave.startsWith('claudeCode.');
    const { aplicadas, pendientes } = await disfraz.aplicar(contexto, salida);
    const total = Object.keys(JSON.parse(fs.readFileSync(path.join(RAIZ, 'media/disfraz.json'), 'utf8'))).length;
    assert.equal(aplicadas + pendientes.length, total);
    assert.ok(pendientes.every((k) => k.startsWith('claudeCode.')));
    assert.ok(vscode.registrado.ajustes.global['workbench.colorCustomizations'], 'los colores de la marca entran');
    return `${aplicadas} escritos, ${pendientes.length} pendientes`;
  });

  await comprobar('el interruptor cambia solo esta ventana', async () => {
    const salida = vscode.window.createOutputChannel();
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

    const { global, workspace } = vscode.registrado.ajustes;
    assert.equal(workspace['workbench.activityBar.location'], 'FÁBRICA:workbench.activityBar.location',
      'el valor de fábrica lo dice VS Code, no lo inventamos');
    assert.equal(global['workbench.activityBar.location'], 'hidden', 'la base no se toca');
    assert.ok(!('security.workspace.trust.enabled' in workspace), 'lo de ámbito de programa no se intenta por ventana');

    await disfraz.volverAModoSencillo(salida);
    assert.equal(disfraz.modoDeEstaVentana(), 'sencillo');
    assert.equal(Object.keys(workspace).length, 0, 'volver al modo sencillo borra las anulaciones');
    return `${disfraz.CLAVES_VISIBLES.length} claves visibles`;
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
    for (const trozo of ['.rsc.json', '.claude/commands', '01-TOOLS', '02-DOCS/wiki/index.md', '02-DOCS/inbox', 'brand']) {
      assert.ok(vigia.patron.includes(trozo), `no se vigila ${trozo}`);
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

  await comprobar('en modo sencillo la barra de estado no molesta', () => {
    const boton = vscode.registrado.barraEstado.at(-1);
    assert.equal(boton.visible, false, 'solo se ve cuando la ventana está en modo avanzado');
    assert.equal(boton.command, 'executiveLab.modoSencillo');
    return 'oculta';
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
