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
    'conexiones', 'acciones', 'cerebro', 'brujula', 'puente', 'soporte', 'disfraz', 'arrancar', 'git', 'terreno', 'github', 'saberes', 'salidas', 'papeles', 'reglas', 'asistentes', 'ajustes', 'tema', 'fijadas', 'proyectos', 'lecciones', 'agentes', 'rastro', 'nombres', 'rumbo', 'encargos', 'web', 'extension'];
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
    assert.equal(hay.subidas, 0, 'aquí están sueltas, pero no guardadas en el historial');

    // ── Y si además están dentro de las copias de seguridad ──────────────
    //
    // Es el caso que apareció montando un arnés encima de un proyecto de
    // verdad: esa persona guardó su `.env` el día que empezó. Decir solo «hay
    // claves fuera de sitio» ahí es avisar a medias — ordenarlas las saca de
    // la vista y las deja en el historial para siempre.
    const cp = require('node:child_process');
    const git = (...args) => cp.spawnSync('git', args, { cwd: empresa, encoding: 'utf8' });
    if (git('rev-parse', '--is-inside-work-tree').status === 0) {
      git('add', '-f', '.env', 'config/.env.local');
      const guardadas = sueltas.resumen();
      assert.equal(guardadas.subidas, 2, 'se ve que ya están dentro de las copias');
      assert.match(guardadas.prompt, /AVISO IMPORTANTE/, 'y al asistente se le dice con todas las letras');
      assert.match(guardadas.prompt, /cambiar esas claves en el proveedor/, 'con lo único que de verdad las inutiliza');
      assert.ok(!guardadas.prompt.includes('sk_test_123'), 'y sigue sin salir ningún valor');
      git('rm', '-q', '--cached', '.env', 'config/.env.local');
    }

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

  await comprobar('solo se ejecuta lo que la propia herramienta declara', async () => {
    // Esto corre scripts de verdad, sin pasar por el asistente y sin preguntar,
    // y vive en la carpeta de las credenciales. La lista blanca no sale del
    // nombre del fichero: sale de la tabla del README **cruzada con** el verbo,
    // y `ejecutar` comprueba contra esa lista, no contra lo que le pasen. Por
    // eso una ruta inventada no llega a ninguna parte — pero conviene que esté
    // escrito, porque es la clase de guardián que alguien relaja sin querer.
    const fs2 = require('node:fs');
    fs2.writeFileSync(path.join(empresa, '01-TOOLS/HOLDED/oculto.sh'), '#!/bin/sh\necho no deberia correr\n', { mode: 0o755 });

    for (const [queEs, cual] of [
      ['uno que no está en el README', 'oculto.sh'],
      ['una travesía hacia arriba', '../../secreto.sh'],
      ['una ruta absoluta', '/bin/echo'],
      ['la propia carpeta', '.'],
    ]) {
      const hecho = await conexiones.ejecutar('HOLDED', cual);
      assert.equal(hecho.ok, false, `${queEs} NO puede ejecutarse`);
      assert.match(hecho.mensaje, /asistente/, `${queEs} se manda al asistente`);
    }

    fs2.rmSync(path.join(empresa, '01-TOOLS/HOLDED/oculto.sh'));
    return '4 intentos, ninguno pasa';
  });

  await comprobar('una carpeta a medio montar se manda a terminarla, no a "Algo va mal"', async () => {
    // Esto decía «Pulsa "Algo va mal" y lo dejo listo». Probado con una carpeta
    // a medias de verdad, ese botón **no lo arregla**: hace `repair`, que repara
    // lo que el arnés gobierna y no el suelo que crea el montaje. Contestaba
    // «this harness is healthy» con `01-TOOLS` y `02-DOCS` sin estar.
    //
    // O sea: el alumno pulsaba lo que se le decía, le respondían que todo iba
    // bien, y su espacio seguía a medias. Lo que sí lo restaura es volver a
    // pasar el montaje.
    const fs2 = require('node:fs');
    const aMedias = fs2.mkdtempSync(path.join(os.tmpdir(), 'a-medias-'));
    fs2.writeFileSync(path.join(aMedias, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    // Falta el suelo: `01-TOOLS/_TEMPLATE` y `02-DOCS/wiki/harness`.

    vscode.guion.raiz = aMedias;
    const estado = await cargar('brujula').estado({ fresco: true });
    vscode.guion.raiz = empresa;

    assert.equal(estado.listo, false);
    assert.equal(estado.aMedioPreparar, true, 'se distingue de una carpeta vacía');
    assert.ok(!/Algo va mal/i.test(estado.aviso), 'no se manda a un botón que no lo arregla');

    const pintada = require('./panel-falso').montarPanel().mandar({ tipo: 'estado', estado });
    assert.match(pintada, /Terminar de prepararla/, 'se ofrece lo que sí lo termina');
    assert.match(pintada, /arrancar/, 'que es volver a pasar el montaje');
    return 'se ofrece terminarla';
  });

  await comprobar('lo que el arnés se apunta a sí mismo no sale como decisión tuya', () => {
    // RSC deja tres líneas en `decisions.md` al montarse: el identificador del
    // plan —un churro de 64 caracteres—, el tipo de proyecto y si SDD quedó
    // aplazado. Probando con un arnés recién montado se vio que el primer día
    // «El diario → las decisiones» enseñaba **solo** esas tres: fontanería en
    // inglés con un hash, en la pantalla donde alguien busca por qué se hacen
    // las cosas aquí. El comprobador del diccionario no lo pilla porque no es
    // texto del código, es contenido de un fichero.
    const fs2 = require('node:fs');
    const fichero = path.join(empresa, '02-DOCS', 'wiki', 'harness', 'decisions.md');
    const antes = fs2.readFileSync(fichero, 'utf8');
    // Arriba del todo, que es donde las deja el montaje: lo de después del
    // primer encabezado ya lo lee el otro camino.
    fs2.writeFileSync(fichero, antes.replace('- SDD: deferred.',
      '- SDD: deferred.\n'
      + '- Accepted plan `e612b926bad10e7ec07371951498eb7956b62e7a1496a0e0df352e3d244e44af`.\n'
      + '- Las facturas se revisan el día 5, no el 1: los bancos tardan.'));

    const suyas = cargar('diario').decisiones().map((d) => d.titulo);
    assert.ok(!suyas.some((t) => /Accepted plan/i.test(t)), 'el identificador del plan no es una decisión tuya');
    assert.ok(!suyas.some((t) => /Project kind/i.test(t)), 'ni el tipo de proyecto');
    assert.ok(!suyas.some((t) => /^SDD: deferred/i.test(t)), 'ni que SDD quedara aplazado');
    assert.ok(suyas.some((t) => /los bancos tardan/.test(t)), 'pero las del negocio sí salen');
    // Y una decisión de verdad escrita con esa misma forma no se pierde: el
    // filtro nombra los estados del arnés, no descarta por el aspecto.
    assert.ok(suyas.some((t) => /SDD: no, aquí no construimos/.test(t)), 'ni las que se le parecen');

    fs2.writeFileSync(fichero, antes);
    return `${suyas.length} decisiones, ninguna de fontanería`;
  });

  await comprobar('el reloj corta de verdad, sin esperar a los nietos del proceso', async () => {
    // Esto hacía `kill()` y se quedaba esperando al evento `close`. Y `close`
    // no llega cuando muere el hijo, sino cuando se cierran sus tuberías — o
    // sea, cuando han muerto también sus nietos. Un script que llama a `curl` o
    // a `sleep` deja al bash muerto y al nieto vivo, con la tubería abierta.
    //
    // Medido con un script de 120 s y un reloj de 45: la barra tardaba 120. El
    // alumno ve la pantalla parada el doble de lo prometido y la da por colgada.
    const procesos = cargar('procesos');
    const arranque = Date.now();
    const r = await procesos.ejecutar(process.execPath, ['-e', 'setTimeout(()=>{}, 60000)'], { tiempoMaximo: 900 });
    const tardo = Date.now() - arranque;

    assert.equal(r.codigo, -1, 'se da por perdido');
    assert.match(r.error, /tardado demasiado/, 'y se dice que lo hemos parado');
    assert.ok(tardo < 5000, `contesta al saltar el reloj, no cuando acabe el proceso (tardó ${tardo} ms)`);
    return `cortado en ${tardo} ms`;
  });

  await comprobar('si no se puede guardar la clave, se dice en vez de romperse', () => {
    // `guardarClave` llama a esto sin red, así que una excepción subía y el
    // alumno pulsaba «Guardar» y no pasaba nada: ni confirmación ni error. El
    // silencio más caro posible, y en la pantalla de las credenciales.
    const fs2 = require('node:fs');
    const carpeta = path.join(empresa, '01-TOOLS', 'BLOQUEADA');
    fs2.mkdirSync(carpeta, { recursive: true });
    const env = path.join(carpeta, '.env');
    fs2.writeFileSync(env, 'B_API_KEY=antigua\n');
    fs2.chmodSync(env, 0o444);

    let respuesta;
    assert.doesNotThrow(() => { respuesta = conexiones.escribir('BLOQUEADA', 'B_API_KEY', 'nueva'); },
      'no puede lanzar: se lo come el panel y el botón se queda mudo');
    assert.equal(respuesta.ok, false);
    assert.match(respuesta.mensaje, /permiso/, 'se dice qué ha pasado');
    assert.match(respuesta.mensaje, /asistente/, 'y a quién pedírselo');

    fs2.chmodSync(env, 0o600);
    assert.equal(conexiones.escribir('BLOQUEADA', 'B_API_KEY', 'nueva').ok, true, 'y desbloqueada vuelve a guardar');
    fs2.rmSync(carpeta, { recursive: true, force: true });
    return 'sin excepción y con qué hacer';
  });

  await comprobar('una credencial de varias líneas no se aplasta en silencio', () => {
    // Hay credenciales muy corrientes que no caben en una línea: una clave
    // privada PEM, el JSON de una cuenta de servicio de Google. Esto las
    // aceptaba, les quitaba los saltos, decía «Guardado» y dejaba una clave
    // **rota** — un PEM sin saltos no lo acepta ninguna herramienta.
    //
    // Y el alumno no podía saberlo: la barra le había dicho que sí. Luego
    // «Probar la conexión» fallaba y se ponía a revisar una clave bien pegada.
    const pem = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq\n-----END PRIVATE KEY-----';
    const roto = conexiones.escribir('HOLDED', 'HOLDED_API_KEY', pem);
    assert.equal(roto.ok, false, 'no se guarda algo que quedaría estropeado');
    assert.match(roto.mensaje, /varias líneas/, 'y se dice por qué');
    assert.match(roto.mensaje, /asistente/, 'y a quién pedírselo');

    // Lo que sí cabe sigue cabiendo, incluido el salto que deja el pegar.
    assert.equal(conexiones.escribir('HOLDED', 'HOLDED_API_KEY', '  "abc-456"  \n').ok, true,
      'una clave de una línea se guarda, con su salto del final y sus comillas');
    return 'lo que rompería, se dice';
  });

  await comprobar('cuando una conexión falla se dice por qué, y no siempre es la clave', async () => {
    // Esto contestaba lo mismo a todo: «revisa que la clave esté bien pegada».
    // Probando fallos de verdad se vio que dos de los tres casos corrientes son
    // otra cosa —no hay internet, o el script está roto— y en los dos el alumno
    // se pone a revisar una clave que está perfecta. La regla de la casa es que
    // un error diga qué hacer; decirlo mal manda a mirar donde no es.
    const fs2 = require('node:fs');
    const carpeta = path.join(empresa, '01-TOOLS', 'FALLOS');
    fs2.mkdirSync(carpeta, { recursive: true });
    fs2.writeFileSync(path.join(carpeta, '.env'), 'F_API_KEY=algo\n');

    const conQueFalla = async (salida, codigo) => {
      fs2.writeFileSync(path.join(carpeta, 'test_connection.sh'),
        `#!/usr/bin/env bash\necho ${JSON.stringify(salida)} >&2\nexit ${codigo}\n`, { mode: 0o755 });
      return (await conexiones.probar('FALLOS')).mensaje;
    };

    assert.match(await conQueFalla('curl: (6) Could not resolve host: api.x.com', 6), /internet/,
      'sin red se dice que es la red');
    assert.match(await conQueFalla('HTTP 401 Unauthorized: invalid api key', 1), /clave no vale/,
      'y una clave rechazada sí es la clave');
    assert.match(await conQueFalla('Traceback (most recent call last): KeyError', 2), /no es cosa tuya/,
      'un script roto no es culpa del alumno');
    assert.match(await conQueFalla('HTTP 429 Too Many Requests', 1), /demasiadas cosas seguidas/,
      'y estar saturado se espera, no se arregla');

    // Lo que importa de verdad: lo que no se reconoce NO señala a la clave.
    const raro = await conQueFalla('algo pasó y nadie sabe qué', 7);
    assert.ok(!/clave/i.test(raro), 'un fallo desconocido no manda a mirar la clave');
    assert.match(raro, /asistente/, 'se manda a quien puede mirar el detalle');

    fs2.rmSync(carpeta, { recursive: true, force: true });
    return '5 fallos, 5 respuestas distintas';
  });

  await comprobar('ningún botón sale dos veces con el mismo rótulo', () => {
    // Se vio el primer día de un arnés nuevo de verdad: «Seguir donde lo dejé»
    // salía dos veces. Arriba el nuestro —el raíl `seguir.md`— y abajo el
    // `resume-session` del arnés, al que aquí se le pone ese mismo nombre en
    // cristiano. Hacen lo mismo, así que el alumno veía dos botones idénticos.
    const fs2 = require('node:fs');
    const comandos = path.join(empresa, '.claude', 'commands');
    fs2.mkdirSync(comandos, { recursive: true });
    // La empresa de mentira ya trae su `seguir.md`: se le añade el del arnés
    // que acaba llamándose igual, y no se toca nada de lo que ya había — que
    // las pruebas de después cuentan con ello.
    const puesto = path.join(comandos, 'resume-session.md');
    fs2.writeFileSync(puesto, '---\ndescription: "Read the bounded local continuation record."\n---\n\nResume.\n');

    const todos = cargar('acciones').todos();
    const cuantos = todos.filter((x) => x.etiqueta === 'Seguir donde lo dejé').length;
    assert.equal(cuantos, 1, 'una sola vez, no dos');
    assert.equal(todos.find((x) => x.etiqueta === 'Seguir donde lo dejé').delArnes, false,
      'y manda el nuestro, que está escrito para el alumno');

    const rotulos = todos.map((x) => x.etiqueta.toLowerCase());
    assert.equal(new Set(rotulos).size, rotulos.length, 'ninguno repetido en toda la lista');

    fs2.rmSync(puesto);
    return `${todos.length} botones, ninguno repetido`;
  });

  await comprobar('un .env se lee como lo escribe la gente, no como debería escribirlo', () => {
    // Salió probando con arneses nuevos. Dos formas se leían mal, y las dos
    // hacían que la barra se creyera cosas que no son:
    //
    //   `export CLAVE=valor` salía como una clave llamada «export CLAVE», así
    //   que la pantalla enseñaba la misma dos veces: una «falta» y otra puesta.
    //
    //   `CLAVE=   # una nota` tomaba el comentario como valor, así que una
    //   clave vacía contaba como puesta y la cuenta de las que faltan mentía.
    const fs2 = require('node:fs');
    const carpeta = path.join(empresa, '01-TOOLS', 'FORMAS');
    fs2.mkdirSync(carpeta, { recursive: true });
    fs2.writeFileSync(path.join(carpeta, '.env'), [
      'SIMPLE=abc123',
      'CON_COMILLAS="entre-comillas"',
      'CON_ESPACIOS = con-espacios',
      'CON_IGUAL=clave=con=iguales',
      'export EXPORTADA=viene-con-export',
      'VACIA_CON_COMENTARIO=   # una nota',
      // Y lo que NO hay que tocar: una almohadilla que es parte del valor.
      'CON_ALMOHADILLA=abc#123',
      'ENTRE_COMILLAS="abc # dentro"',
      'EMPIEZA_POR_ALMOHADILLA=#esto-es-la-clave',
      '',
    ].join('\n'));

    const leido = conexiones.leerEnv(path.join(carpeta, '.env'));
    assert.equal(leido.get('EXPORTADA'), 'viene-con-export', 'el export no forma parte del nombre');
    assert.equal(leido.has('export EXPORTADA'), false, 'y no aparece una clave fantasma');
    assert.equal(leido.get('VACIA_CON_COMENTARIO'), '', 'un comentario al final no es el valor');
    assert.equal(leido.get('CON_ALMOHADILLA'), 'abc#123', 'pero una almohadilla pegada sí lo es');
    assert.equal(leido.get('ENTRE_COMILLAS'), 'abc # dentro', 'y entre comillas no se toca nada');
    assert.equal(leido.get('EMPIEZA_POR_ALMOHADILLA'), '#esto-es-la-clave', 'ni cuando el valor empieza por ella');
    assert.equal(leido.get('CON_IGUAL'), 'clave=con=iguales', 'el valor puede llevar igualdades');
    assert.equal(leido.get('CON_ESPACIOS'), 'con-espacios', 'y espacios alrededor del igual');

    fs2.rmSync(carpeta, { recursive: true, force: true });
    return `${leido.size} formas, todas bien`;
  });

  await comprobar('una conexión con acentos o espacios en el nombre se puede abrir', () => {
    // Esto exigía `/^[\w.-]+$/` para el nombre de la carpeta, y `\w` no lleva
    // acentos, ni eñes, ni espacios. En un producto para alumnos españoles, con
    // un asistente al que le imponemos escribir en español, `01-TOOLS/Señal/`
    // salía en la lista y al abrirla no había nada; al guardar una clave decía
    // «Esa conexión ya no está», que encima hace pensar que se ha borrado sola.
    const fs2 = require('node:fs');
    const nombres = ['Señal', 'Correo-Electrónico', 'Mi Facturación'];
    for (const nombre of nombres) {
      const carpeta = path.join(empresa, '01-TOOLS', nombre);
      fs2.mkdirSync(carpeta, { recursive: true });
      fs2.writeFileSync(path.join(carpeta, '.env.example'), 'CORREO_API_KEY=\n');
    }

    for (const nombre of nombres) {
      assert.ok(conexiones.claves(nombre), `${nombre} tiene que abrirse`);
      assert.equal(conexiones.escribir(nombre, 'CORREO_API_KEY', 'x').ok, true, `y poder guardar en ${nombre}`);
    }

    // Y lo que la comprobación vieja protegía de verdad sigue protegido: que un
    // id venido de la interfaz no se salga de 01-TOOLS.
    for (const malo of ['..', '../..', 'HOLDED/../../..', '/etc', '_TEMPLATE', '.oculta', '']) {
      assert.equal(conexiones.claves(malo), null, `${JSON.stringify(malo)} no puede abrirse`);
    }
    assert.equal(conexiones.escribir('../../fuera', 'X', 'y').ok, false, 'ni escribirse fuera');

    for (const nombre of nombres) fs2.rmSync(path.join(empresa, '01-TOOLS', nombre), { recursive: true, force: true });
    return `${nombres.length} en español, y la travesía bloqueada`;
  });

  await comprobar('una conexión que el asistente dejó a medias se dice, no se disfraza', () => {
    // El asistente crea una herramienta copiando `01-TOOLS/_TEMPLATE/`, y esa
    // plantilla trae sus claves con marcadores: `<TOOL>_API_KEY`. Rellenarlas
    // es el paso siguiente, y entre un paso y otro la barra se repinta.
    //
    // Lo que se veía era una conexión normal, con su casilla «Clave de acceso»
    // esperando. Si el alumno escribía, la barra contestaba «Esa clave no tiene
    // un nombre válido» — un callejón sin salida en la pantalla donde muere la
    // mayor parte del soporte del curso. Salió montando un arnés de verdad.
    const fs2 = require('node:fs');
    const carpeta = path.join(empresa, '01-TOOLS', 'A_MEDIAS');
    fs2.mkdirSync(carpeta, { recursive: true });
    // Tal cual la deja RSC, marcadores incluidos.
    fs2.writeFileSync(path.join(carpeta, '.env.example'),
      '# <TOOL_NAME> — operational credentials\n\n<TOOL>_ENV=test\n<TOOL>_API_KEY=\n<TOOL>_API_SECRET=\n');

    const suya = conexiones.proveedores().find((p) => p.id === 'A_MEDIAS');
    assert.equal(suya.aMedioHacer, true, 'se reconoce que sigue siendo la plantilla');
    assert.equal(suya.faltan, 0, 'y sus marcadores no se cuentan como claves que falten');

    const dentro = conexiones.claves('A_MEDIAS');
    assert.deepEqual(dentro.claves, [], 'no se enseña ninguna casilla que no se pueda rellenar');
    assert.equal(dentro.proveedor.aMedioHacer, true, 'la pantalla recibe con qué explicarlo');
    // Y que no se haya roto lo de siempre: una terminada sigue saliendo entera.
    assert.equal(conexiones.proveedores().find((p) => p.id === 'HOLDED').aMedioHacer, false);

    fs2.rmSync(carpeta, { recursive: true, force: true });
    return 'sin casillas imposibles';
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
    const sabe = conTilde.grupos.find((g) => g.titulo === 'Conocimiento');
    assert.equal(sabe.aciertos[0].titulo, 'Ciclo de facturación', 'lo que se llama así, primero');
    return `${conTilde.cuantos} resultados`;
  });

  await comprobar('buscar mira también los botones y las conexiones', () => {
    const botones = buscador.buscar('resumen del mes').grupos.find((g) => g.titulo === 'Comandos');
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
    assert.equal(dos, 'Conocimiento (Facturacion)', 'dos zonas no caben: se queda la primera');
    const donde = brujula.interpretar('files: 01-TOOLS/HOLDED/.env, 01-TOOLS/GMAIL/.env');
    assert.equal(donde, 'Conexiones (Holded, Gmail)', 'dos del mismo sitio no repiten el rótulo');
    assert.equal(brujula.interpretar('(no local continuation for this branch/worktree)'), null);

    // RSC manda las rutas tal y como se las da git, y git las marca. Una ruta
    // marcada no empieza por `02-DOCS`, empieza por `M 02-DOCS`, así que dejaba
    // de reconocerse: en cuanto la wiki está guardada —o sea, en todo alumno a
    // partir del primer guardado— la brújula no decía dónde se había trabajado.
    assert.equal(
      brujula.interpretar('files: M 02-DOCS/wiki/facturacion/ciclo.md, M 01-TOOLS/HOLDED/.env'),
      'Conocimiento (Facturacion)',
      'una ruta marcada por git sigue siendo su zona',
    );
    assert.equal(
      brujula.interpretar('files: A 01-TOOLS/STRIPE/.env, ?? 02-DOCS/inbox/x.pdf, D 02-DOCS/wiki/viejo.md'),
      'Conexiones (Stripe) · Conocimiento',
      'y las recién puestas y las borradas, también',
    );
    // Pero la basura de antes no vuelve: Jose llegó a ver «M 01 tools» en su
    // barra. Una carpeta cualquiera no es una zona, lleve marca o no.
    assert.equal(brujula.interpretar('files: M extension/src/brujula.js, M publicar.sh'), null,
      'lo que no es zona no sale, ni siquiera humanizado');
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
  await comprobar('el texto va por el enlace, que es el único que lo entrega', async () => {
    vscode.registrado.ejecutados.length = 0;
    vscode.registrado.abiertos.length = 0;
    const como = await puente.enviar('hola');
    assert.equal(como, 'directo');

    // Medido en la máquina de Jose con Claude Code 2.1.276: el enlace deja el
    // texto en la caja; los dos comandos abren una conversación vacía. Y eso
    // que el manejador del enlace llama a uno de esos comandos — la diferencia
    // está dentro de su ventana, no en cómo se le llama.
    assert.match(vscode.registrado.abiertos.at(-1), /^vscode:\/\/anthropic\.claude-code\/open\?prompt=hola$/);
    assert.deepEqual(vscode.registrado.ejecutados.map((e) => e.id), [],
      'con el enlace basta: ni comandos ni enfocar');
    return 'vscode://anthropic.claude-code/open';
  });

  await comprobar('si el enlace no se recoge, quedan los comandos', async () => {
    // Que el enlace falle no puede dejar la barra muda: los comandos siguen
    // detrás, y la firma es (sesión, texto), leída de su código.
    vscode.registrado.ejecutados.length = 0;
    vscode.guion.enlaceFalla = true;

    const como = await puente.enviar('por comando');
    assert.equal(como, 'directo');
    const envio = vscode.registrado.ejecutados.find((e) => e.id === 'claude-vscode.editor.open');
    assert.deepEqual(envio.args, [undefined, 'por comando']);

    // Y NO se enfoca después. `claude-vscode.focus` no pone el cursor en la
    // caja: convierte lo seleccionado en una mención y, si nadie puede
    // cogerla, abre otra conversación. Eso dejaba una sesión vacía encima.
    assert.ok(!vscode.registrado.ejecutados.some((e) => e.id === 'claude-vscode.focus'),
      'enfocar después abría una conversación vacía encima');

    vscode.guion.enlaceFalla = false;
    return 'claude-vscode.editor.open, de repuesto';
  });

  await comprobar('sin la extensión de Claude, al portapapeles', async () => {
    // Sin la extensión puesta no hay ni comandos suyos ni nadie que recoja el
    // enlace: es el único caso en el que el texto acaba en el portapapeles.
    vscode.guion.comandosDeClaude = [];
    vscode.guion.extensionesInstaladas = [];
    vscode.registrado.ejecutados.length = 0;

    const como = await puente.enviar('adiós');
    assert.equal(como, 'copiado', 'no se manda a un enlace que nadie recoge');
    assert.equal(vscode.registrado.portapapeles, 'adiós');
    assert.deepEqual(vscode.registrado.ejecutados.map((e) => e.id), [],
      'y no se llama a nada suyo: ni enfocar, que abre una conversación vacía');

    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    vscode.guion.comandosDeClaude = ['claude-vscode.editor.open', 'claude-vscode.primaryEditor.open', 'claude-vscode.focus', 'claude-vscode.editor.openLast'];
    return 'solo al portapapeles';
  });

  // ------------------------------------------------- cuando algo falla de verdad
  //
  // Las tres piezas de la misma avería: el arranque fallaba, el aviso mandaba a
  // un botón que en esa pantalla no existía, y el informe que el tutor recibía
  // no llevaba dentro el motivo. Cada una con su comprobación.

  await comprobar('lo que la barra se apunta acaba en el informe del tutor', () => {
    const rastro = cargar('rastro');
    const escrito = [];
    const canal = rastro.envolver({ appendLine: (t) => escrito.push(t), dispose() {} }, null);

    canal.appendLine('[arrancar] el arnés terminó con el código 2');
    canal.sinGuardar('esto es el informe, no se guarda');

    assert.equal(escrito.length, 2, 'las dos cosas se ven en el panel de salida');
    const guardado = canal.ultimas();
    assert.equal(guardado.length, 1, 'pero solo una se guarda');
    assert.match(guardado[0], /el arnés terminó con el código 2/);
    assert.ok(!guardado.join('\n').includes('esto es el informe'), 'un informe no se mete dentro del siguiente');
    return 'se guarda lo de dentro, no el informe';
  });

  await comprobar('el informe de incidencia dice por qué falló, no solo que falló', async () => {
    const soporte = cargar('soporte');
    const aparte = fs.mkdtempSync(path.join(os.tmpdir(), 'incidencias-'));
    const { informe, fichero, codigo } = await soporte.revisar({
      lineas: ['10:11:12 [arrancar] al pedir el plan: el arnés terminó con el código 2'],
      carpetaAparte: aparte,
    });
    assert.match(informe, /--- lo que fue pasando ---/);
    assert.match(informe, /al pedir el plan: el arnés terminó con el código 2/,
      'sin esto, el código que el alumno dicta no lleva dentro el motivo');
    assert.match(codigo, /^[A-Z2-9]{6}$/);
    assert.ok(fs.existsSync(fichero), 'y queda escrito para poder leerlo entero');
    return 'el motivo viaja con el código';
  });

  await comprobar('diagnosticar una carpeta sin arnés no le fabrica medio arnés', async () => {
    const soporte = cargar('soporte');
    const pelada = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-arnes-'));
    const aparte = fs.mkdtempSync(path.join(os.tmpdir(), 'incidencias-'));
    vscode.guion.raiz = pelada;

    const { fichero } = await soporte.revisar({ carpetaAparte: aparte });
    assert.ok(!fs.existsSync(path.join(pelada, '02-DOCS')),
      'el informe creaba 02-DOCS y con eso el informe siguiente ya decía que el suelo estaba');
    assert.ok(fichero.startsWith(aparte), 'se guarda fuera del proyecto');

    vscode.guion.raiz = empresa;
    return 'el informe se queda fuera';
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

  await comprobar('el aviso de cambiar de asistente sale antes de pulsar, y solo donde toca', () => {
    // El aviso de después (el mensaje) no basta: cuando llega, el alumno ya ha
    // pulsado y ya ha visto desaparecer sus cosas. Así que la ficha del
    // asistente con el que NO se montó la carpeta lo dice antes.
    //
    // Y solo esa: en la del asistente de ahora sobra, y en una que sí es del
    // arnés sería mentira. Se comprueba sobre el panel de verdad, porque esto
    // es una línea de pantalla y lo que importa es dónde sale.
    const { montarPanel } = require('./panel-falso');
    const panel = montarPanel();
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code', 'openai.chatgpt'];

    const pintada = panel.mandar({ tipo: 'asistente', ...cargar('asistentes').comoEstamos(), aviso: null });
    const texto = pintada.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const AVISO = /Esta carpeta no se montó para él/;

    // La empresa de mentira es de Claude, así que el aviso va en la ficha de Codex.
    const [deClaude, deCodex] = pintada.split('Codex');
    assert.ok(!AVISO.test(deClaude), 'en el asistente del arnés no sale');
    assert.ok(AVISO.test(deCodex), 'y en el otro sí, antes de pulsar');
    assert.match(texto, /no admite que se lo pasen/, 'y se dice que a Codex hay que pegarle el texto');

    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    return 'el aviso, solo en el que no es del arnés';
  });

  await comprobar('cambiar de asistente dice qué deja de verse', () => {
    // Cambiar de asistente no remonta el arnés: las habilidades y los ayudantes
    // se quedan en la carpeta del anterior, y cada uno mira solo la suya. El
    // mensaje era «Hecho, a partir de ahora los botones hablan con X» y punto,
    // así que el alumno pulsaba, veía desaparecer sus habilidades y creía que
    // había roto algo. No se ha borrado nada: hay que decir eso.
    const asistentes = cargar('asistentes');
    const fs2 = require('node:fs');
    const declaracion = path.join(empresa, '.rsc.json');
    const antes = fs2.readFileSync(declaracion, 'utf8');
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code', 'openai.chatgpt'];

    const { ok, mensaje } = asistentes.elegir('codex');
    assert.equal(ok, true);
    assert.match(mensaje, /habla[n]? con Codex/, 'dice a quién le habla ahora');
    assert.match(mensaje, /deja de verse/, 'y qué deja de verse al cambiar');
    assert.match(mensaje, /no se ha borrado/i, 'sin dar a entender que se pierde');
    // Y lo que se pierde sin estar en ninguna carpeta: los frenos. Es el único
    // momento en que alguien decide quedarse sin el que para una orden peligrosa,
    // así que es el único momento en que se puede decir y que sirva de algo.
    assert.match(mensaje, /no trae frenos/, 'y que ahí se queda sin frenos');

    fs2.writeFileSync(declaracion, antes);
    vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    return mensaje.slice(0, 60);
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

    // El editor completo no escribe nada encima: borra lo nuestro de la
    // carpeta. Antes dejaba escritos "los valores de fábrica" —tema, minimapa,
    // pestañas, rótulo— y eso pisaba las preferencias de quien abriera la
    // carpeta en su propio proyecto.
    const { workspace } = vscode.registrado.ajustes;
    const nuestras = disfraz.clavesDeLaCarpeta(contexto).filter((c) => c in workspace);
    assert.deepEqual(nuestras, [], `la carpeta se queda con ${nuestras.join(', ')}`);
    assert.ok(!('workbench.colorTheme' in workspace), 'el tema lo elige quien abre la carpeta, no nosotros');
    assert.ok(!('files.exclude' in workspace), 'ni las listas de exclusión');
    assert.deepEqual(Object.keys(workspace), [disfraz.CLAVE_INTERRUPTOR], 'solo queda el interruptor, apagado');

    assert.equal(disfraz.modoDeEstaVentana(), 'avanzado', 'apagado el interruptor, se ve el editor entero');
    return `${disfraz.clavesDeLaCarpeta(contexto).length} claves fuera de la carpeta`;
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

  await comprobar('volver atrás dice qué pasa con lo que tenías sin guardar', async () => {
    // Volver atrás hace lo que promete y guarda una copia de lo actual antes,
    // así que no se pierde nada. Pero el mensaje era «Listo. Tu empresa ha
    // vuelto a como estaba entonces» y ya: probado con un documento sin
    // guardar, desaparece de la vista sin una palabra. Quien lo estuviera
    // escribiendo hace diez minutos no tiene forma de saber que sigue ahí, y
    // ese susto es de los que hacen llamar al tutor creyendo que se ha perdido.
    const guardar = cargar('guardar');
    if (!(await guardar.hayGit())) return 'SALTADA: sin git';

    const donde = fs.mkdtempSync(path.join(os.tmpdir(), 'volver-'));
    const historial = require(path.join(RAIZ, '..', 'instalador', 'comun', 'historial.js'));
    assert.ok((await historial.iniciar(donde)).ok, 'la carpeta necesita su historial, como al prepararla');
    vscode.guion.raiz = donde;
    try {
      fs.writeFileSync(path.join(donde, 'factura.txt'), 'uno');
      await guardar.guardar('Punto de partida');
      fs.writeFileSync(path.join(donde, 'factura.txt'), 'dos');
      await guardar.guardar('Otra copia');

      const hay = await guardar.copias(5);
      assert.equal(hay.length, 2);

      // Con trabajo sin guardar encima.
      fs.writeFileSync(path.join(donde, 'contrato.txt'), 'lo que no quiero perder');
      const conTrabajo = await guardar.volverA(hay[1].id);
      assert.equal(conTrabajo.ok, true);
      assert.match(conTrabajo.mensaje, /no se ha perdido/, 'se dice que lo de después sigue estando');
      assert.ok(!fs.existsSync(path.join(donde, 'contrato.txt')), 'y de la carpeta sí se ha ido');
      assert.ok((await guardar.copias(9)).some((c) => /antes de volver atrás/i.test(c.asunto)),
        'porque hay una copia de justo antes');

      // Y sin nada pendiente, no se le cuenta un susto que no ha pasado.
      const limpio = await guardar.volverA((await guardar.copias(9))[2].id);
      assert.ok(!/no se ha perdido/.test(limpio.mensaje), 'sin trabajo suelto, no sobra el aviso');
      return 'se dice, y solo cuando toca';
    } finally {
      vscode.guion.raiz = empresa;
      fs.rmSync(donde, { recursive: true, force: true });
    }
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

  await comprobar('la página del panel se arma entera, con y sin marca', () => {
    // El agujero que dejó pasar un `this.` que faltaba: NADIE probaba el HTML
    // que arma la extensión. Las pruebas del panel miran el lado del navegador
    // y las demás miran los módulos, pero entre los dos hay una función que
    // junta la hoja de estilo, los colores y la cabecera — y si revienta, la
    // barra no carga y lo único que se ve es "An error occurred while loading
    // view". Sin traza, sin nada.
    const proveedor = vscode.registrado.proveedor;
    assert.ok(proveedor, 'la vista tiene que estar registrada');

    const medios = vscode.Uri.joinPath(contexto.extensionUri, 'media');
    const webview = {
      cspSource: 'vscode-resource:',
      asWebviewUri: (u) => ({ toString: () => `vscode-resource:${u.fsPath || u.path}` }),
    };

    const cabeceras = [
      ['la nuestra', () => { cargar('tema').quitarla(); return marca.leer(); }, /marca--nuestra/],
      ['con logotipo', () => { montarMarca(empresa); return marca.leer(); }, /<img class="marca"/],
      ['solo el símbolo', () => { montarMarca(empresa, { simbolo: true }); return marca.leer(); }, /marca--simbolo/],
      ['sin logotipo, el nombre', () => { montarMarca(empresa, { logo: false }); return marca.leer(); }, /marca--nombre/],
    ];

    for (const [que, preparar, espera] of cabeceras) {
      let pagina;
      try {
        pagina = proveedor.html(webview, medios, preparar());
      } catch (error) {
        throw new Error(`"${que}" revienta al armar la página: ${error.message}`);
      }
      assert.match(pagina, /^<!DOCTYPE html>/, `"${que}" no arma una página`);
      assert.match(pagina, espera, `"${que}" no pinta su cabecera`);
      assert.match(pagina, /Content-Security-Policy/, `"${que}" se deja la seguridad`);
      assert.match(pagina, /panel\.js/, `"${que}" se deja el guion`);
    }

    // Y el nuestro, teñido: sin colores propios dentro.
    cargar('tema').quitarla();
    const nuestra = proveedor.html(webview, medios, marca.leer());
    assert.ok(!/fill="#0a0a0a"/i.test(nuestra), 'el negro del logotipo tiene que haberse ido');
    assert.match(nuestra, /fill="currentColor"/, 'y en su sitio, el color del logotipo');

    // Y ese color es blanco puro o negro puro, NO el del texto: en tema oscuro
    // el texto es el gris de VS Code y el logotipo salía gris apagado. Lo vio
    // Jose y tenía razón.
    const css = fs.readFileSync(path.join(RAIZ, 'media', 'panel.css'), 'utf8');
    assert.match(css, /\.marca--nuestra\s*\{[^}]*color:\s*var\(--logo\)/, 'el logotipo usa su propio color');
    const claro = css.slice(css.indexOf(':root'), css.indexOf('body.vscode-dark'));
    const oscuro = css.slice(css.indexOf('body.vscode-dark'), css.indexOf('* { box-sizing'));
    assert.match(claro, /--logo:\s*#0a0a0a/, 'negro sobre claro');
    assert.match(oscuro, /--logo:\s*#ffffff/, 'blanco sobre oscuro');

    // Y con la marca de una empresa, lo mismo pero según sea la suya.
    montarMarca(empresa, { fondo: '#0d1117', texto: '#e6edf3', acento: '#22d3ee', logo: false });
    assert.equal(marca.leer().tokens['--logo'], '#ffffff', 'marca oscura, logotipo blanco');
    montarMarca(empresa, { logo: false });
    assert.equal(marca.leer().tokens['--logo'], '#0a0a0a', 'marca clara, logotipo negro');

    montarMarca(empresa);
    return `${cabeceras.length} cabeceras, todas se arman`;
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
    // Las carpetas del asistente entran las tres. Aquí solo estaban los
    // comandos, así que una habilidad recién puesta o un ayudante nuevo no
    // aparecían hasta cerrar y abrir — y en un arnés de Codex no se vigilaba
    // nada suyo, porque sus cosas no viven en `.claude/`.
    for (const trozo of ['.rsc.json', '.claude/commands/lo-que-sea.md', '01-TOOLS/holded/.env',
      '02-DOCS/wiki/index.md', '02-DOCS/wiki/facturacion/iva.md', '02-DOCS/inbox/factura.pdf',
      '02-DOCS/wiki/brand/marca.md', '.claude/skills/la-que-sea/SKILL.md', '.claude/agents/quien-sea.md']) {
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
    assert.ok(por.Conocimiento, 'la wiki también se cuenta');

    // Con quién habla la carpeta era la primera pregunta y no salía. Una
    // montada para un asistente que no está puesto se comporta como si
    // estuviera rota —los botones no hacen nada— y no lo decía nadie.
    assert.ok(por['Tu asistente'], 'se dice cuál es el asistente');
    assert.ok(por['Comandos'], 'con Claude sí puede haberlos');

    // Y con Codex no puede haberlos nunca: RSC no le escribe comandos. Una cruz
    // permanente ahí no informa, reprocha algo que no se puede arreglar.
    const fs2 = require('node:fs');
    const conCodex = fs2.mkdtempSync(path.join(os.tmpdir(), 'radio-codex-'));
    fs2.writeFileSync(path.join(conCodex, '.rsc.json'), JSON.stringify({ version: 1, targets: ['codex'] }));
    fs2.mkdirSync(path.join(conCodex, '01-TOOLS', '_TEMPLATE'), { recursive: true });
    fs2.mkdirSync(path.join(conCodex, '02-DOCS', 'wiki', 'harness'), { recursive: true });
    vscode.guion.raiz = conCodex;
    const suya = await cargar('terreno').radiografia();
    vscode.guion.raiz = empresa;

    const nombres = suya.piezas.map((p) => p.nombre);
    assert.ok(!nombres.includes('Comandos'), 'con Codex esa línea no sale');
    assert.ok(nombres.includes('Tu asistente'), 'pero sí cuál es el asistente');
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

  await comprobar('se buscan también las habilidades y los agentes', () => {
    // Esta caja dice buscar "lo que puede hacer" y solo traía los botones. Una
    // habilidad instalada no aparecía escribiendo su nombre, ni un ayudante:
    // estaban, pero solo entrando en su pantalla. Quien busca no sabe en qué
    // apartado vive cada cosa — para eso busca.
    const buscar = cargar('buscar');
    buscar.saberDondeEstamos(RAIZ);
    buscar.olvidar();

    const habilidad = buscar.buscar('executive').grupos
      .flatMap((g) => g.aciertos).find((r) => r.tipo === 'habilidad');
    assert.ok(habilidad, 'una habilidad se encuentra por su nombre');
    assert.deepEqual(habilidad.accion, { tipo: 'verSaberes' }, 'y lleva a su pantalla');

    const agente = buscar.buscar('cobros').grupos
      .flatMap((g) => g.aciertos).find((r) => r.tipo === 'agente');
    assert.ok(agente, 'un agente también');
    assert.equal(agente.accion.tipo, 'verAgente', 'y lleva al suyo');

    buscar.olvidar();
    return `${habilidad.titulo} · ${agente.titulo}`;
  });

  await comprobar('el catálogo no se queda vacío para siempre por una llamada temprana', () => {
    // `capacidades()` recordaba también el fallo, así que la primera llamada que
    // llegara sin saber dónde está la extensión dejaba el catálogo vacío para el
    // resto de la sesión: ni capacidades que ofrecer, ni las puestas por su
    // nombre en español. Y nada fallaba. Un intento que no sale no es respuesta.
    // Con el módulo recién cargado, que es donde vive el recuerdo.
    const suyo = path.join(RAIZ, 'src', 'consejos.js');
    delete require.cache[require.resolve(suyo)];
    const consejos = require(suyo);

    assert.deepEqual(consejos.capacidades(null), [], 'sin ruta no hay catálogo');
    assert.deepEqual(consejos.capacidades('/no/existe/esta/carpeta'), [], 'ni con una que no está');
    assert.ok(consejos.capacidades(RAIZ).length, 'y después sí, cuando ya se sabe dónde mirar');
    return `${consejos.capacidades(RAIZ).length} capacidades`;
  });

  await comprobar('la continuación no se relee en cada repintado, y se olvida al cambiar de carpeta', async () => {
    // Cuesta un proceso de Node y se pedía en cada repintado. La brújula
    // guarda su estado 20 segundos, pero el camino del vigía se salta ese
    // recuerdo: repinta con `fresco`, y hace bien. Lo que no puede es
    // arrastrar a esto, que solo cambia cuando se guarda un punto de sesión.
    const rsc = cargar('rsc');
    const procesos = cargar('procesos');

    let veces = 0;
    const deVerdad = procesos.node;
    procesos.node = async (args) => {
      if (args.some((a) => a === 'resume')) { veces += 1; return { codigo: 0, salida: 'Seguíamos con 02-DOCS/wiki', error: '' }; }
      return { codigo: 0, salida: '', error: '' };
    };

    try {
      rsc.olvidarLaContinuacion();
      const primera = await rsc.retomar();
      assert.equal(primera, 'Seguíamos con 02-DOCS/wiki');
      assert.equal(veces, 1, 'la primera vez sí se pregunta');

      for (let i = 0; i < 5; i += 1) await rsc.retomar();
      assert.equal(veces, 1, 'cinco repintados seguidos no son cinco procesos');

      // Cambiar de carpeta es otro registro: ahí no vale el de antes.
      cargar('brujula').olvidar();
      await rsc.retomar();
      assert.equal(veces, 2, 'al olvidar, se vuelve a preguntar');

      // Y un fallo no se recuerda: recordarlo dejaría la barra sin
      // continuación un minuto entero por un tropiezo de una vez. Es la
      // trampa que ya mordió con el catálogo de capacidades.
      rsc.olvidarLaContinuacion();
      procesos.node = async () => ({ codigo: 1, salida: '', error: 'reventó' });
      assert.equal(await rsc.retomar(), null, 'un fallo devuelve null');
      procesos.node = async (args) => {
        if (args.some((a) => a === 'resume')) { veces += 1; return { codigo: 0, salida: 'ya va', error: '' }; }
        return { codigo: 0, salida: '', error: '' };
      };
      assert.equal(await rsc.retomar(), 'ya va', 'y el siguiente intento sí pregunta');
      assert.equal(veces, 3, 'porque el fallo no se guardó');
    } finally {
      procesos.node = deVerdad;
      rsc.olvidarLaContinuacion();
      cargar('brujula').olvidar();
    }
    return `${veces} procesos para 8 llamadas`;
  });

  await comprobar('lo que el arnés dice de sí mismo llega a la pantalla, no se tira', async () => {
    // `reconocer({profundo:true})` lanza TRES procesos —doctor, repair y
    // reassess— y la radiografía leía UNO. Los otros dos se calculaban y no los
    // miraba nadie, así que esta pantalla podía decir «no falta nada» teniendo
    // el arnés roto: la única fuente que lo sabía se estaba tirando.
    const terreno = cargar('terreno');

    const sano = await terreno.radiografia({
      aFondo: {
        salud: { missing: [], missingAgents: [], missingCommands: [], backups: { exists: true, count: 8, latest: '20260921-111921-onboard-claude' } },
        reparaciones: { sabemos: true, sano: true, solas: [], aDecidir: [] },
        recomendaciones: [],
      },
    });
    const nombresSanos = sano.piezas.map((p) => p.nombre);
    assert.ok(nombresSanos.includes('Copias que guarda el arnés'), 'las copias del arnés se ven');
    assert.ok(!nombresSanos.includes('Cosas del arnés fuera de sitio'), 'y con el arnés sano no se inventa un problema');

    // Y lo que aquí se decidió no usar (`optOuts` de `.rsc.json`) se dice: es
    // lo que explica que un guardián figure como apagado en Las reglas. No es
    // un fallo, así que no pide arreglo (decisión 101).
    const apagado = sano.piezas.find((p) => p.nombre === 'Lo que tiene apagado');
    assert.ok(apagado, 'lo apagado a propósito se ve en la radiografía');
    assert.equal(apagado.estado, 'noAplica', 'sin marcarlo como un fallo');
    assert.match(apagado.detalle, /Formato al guardar en git/, 'y nombrándolo en español, no con el identificador');
    assert.ok(!/gitmoji/.test(apagado.detalle), 'el identificador en clave no sale');
    assert.ok(!apagado.arreglo, 'ni ofrecer arreglar una decisión');

    const roto = await terreno.radiografia({
      aFondo: {
        salud: { missing: ['bro'], missingAgents: ['developer'], missingCommands: [], backups: { exists: false, count: 0 } },
        reparaciones: { sabemos: true, sano: false, solas: ['[fix] dangling link'], aDecidir: [] },
        recomendaciones: [],
      },
    });
    const porNombre = Object.fromEntries(roto.piezas.map((p) => [p.nombre, p]));
    assert.ok(porNombre['Lo que debería estar puesto'], 'lo declarado que no está en disco se dice');
    assert.equal(porNombre['Lo que debería estar puesto'].estado, 'no');
    assert.match(porNombre['Lo que debería estar puesto'].detalle, /2 cosa/);
    assert.ok(porNombre['Cosas del arnés fuera de sitio'], 'y lo que repair encuentra, también');

    // Lo que solo sabe arreglar `repair` se arregla de un clic; lo que necesita
    // que alguien decida, NO — `repair --yes` a ciegas movería el arnés de
    // asistente, que es de lo que avisa el plan.
    assert.equal(porNombre['Cosas del arnés fuera de sitio'].arreglo.como, 'solo');
    const aDecidir = await terreno.radiografia({
      aFondo: {
        salud: { missing: [], missingAgents: [], missingCommands: [], backups: { exists: true, count: 1 } },
        reparaciones: { sabemos: true, sano: false, solas: [], aDecidir: ['[ask] wrong-target'] },
        recomendaciones: [],
      },
    });
    const suya = aDecidir.piezas.find((p) => p.nombre === 'Cosas del arnés fuera de sitio');
    assert.equal(suya.arreglo.como, 'persona', 'lo que hay que decidir no se aplica de un clic');

    // Y sin informe no se inventa nada: callar es correcto, mentir no.
    const aCiegas = await terreno.radiografia();
    assert.ok(!aCiegas.piezas.some((p) => p.nombre === 'Cosas del arnés fuera de sitio'));
    return `${roto.piezas.length} piezas con el arnés roto`;
  });

  await comprobar('los guardianes se ven, y se leen del disco sin lanzar el arnés', () => {
    // Son lo único del arnés que puede decir que NO, y no se nombraban en
    // ningún sitio: quien recibía un bloqueo veía un «BLOCKED» en inglés y no
    // tenía dónde mirar. Se leen del mismo fichero que mira cada guardián,
    // así que lo que dice la barra es lo que va a pasar de verdad.
    const reglas = cargar('reglas');
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'guardianes-'));
    fs2.mkdirSync(path.join(carpeta, '.rsc'), { recursive: true });
    fs2.mkdirSync(path.join(carpeta, '02-DOCS', 'wiki', 'harness'), { recursive: true });
    fs2.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    for (const g of ['danger-guard.mjs', 'gitmoji-guard.mjs', 'ship-guard.mjs']) {
      fs2.writeFileSync(path.join(carpeta, '.rsc', g), '// guardián');
    }
    // Apagado a propósito, como está el de gitmoji en este mismo repositorio.
    fs2.writeFileSync(path.join(carpeta, '.rsc', '.no-gitmoji'), '');

    vscode.guion.raiz = carpeta;
    try {
      fs2.writeFileSync(path.join(carpeta, '02-DOCS', 'wiki', 'harness', 'user-profile.md'),
        '---\ntechnical_level: non-technical\naccompaniment: L3\n---\n\n# Perfil\n');
      const paraUnAlumno = Object.fromEntries(reglas.losGuardianes().map((g) => [g.id, g]));
      assert.equal(Object.keys(paraUnAlumno).length, 3, 'los tres que hay montados');
      assert.equal(paraUnAlumno['danger-guard'].nombre, 'Freno ante órdenes peligrosas', 'con su nombre en español');
      assert.equal(paraUnAlumno['danger-guard'].estado, 'armado', 'a un alumno sí le frena');
      assert.equal(paraUnAlumno['gitmoji-guard'].estado, 'apagado', 'y el que se apagó, apagado');
      assert.match(paraUnAlumno['gitmoji-guard'].porQue, /a propósito/, 'apagado no es lo mismo que roto');
      assert.equal(paraUnAlumno['ship-guard'].estado, 'armado');

      // Y el de órdenes peligrosas NO actúa con quien es técnico: lo decide el
      // perfil, no nosotros (`danger-guard.mjs`, línea 36).
      fs2.writeFileSync(path.join(carpeta, '02-DOCS', 'wiki', 'harness', 'user-profile.md'),
        '---\ntechnical_level: technical\naccompaniment: L1\n---\n\n# Perfil\n');
      delete require.cache[require.resolve(path.join(RAIZ, 'src', 'trato.js'))];
      const paraUnTecnico = Object.fromEntries(cargar('reglas').losGuardianes().map((g) => [g.id, g]));
      assert.equal(paraUnTecnico['danger-guard'].estado, 'noAplica', 'a un técnico no le frena');
      assert.match(paraUnTecnico['danger-guard'].porQue, /técnico/, 'y se dice por qué, que si no parece una avería');
      assert.equal(paraUnTecnico['ship-guard'].estado, 'armado', 'los otros dos no dependen del perfil');

      // Sin guardianes montados no se nombra ninguno: un rótulo con nada
      // detrás es peor que no tenerlo.
      fs2.rmSync(path.join(carpeta, '.rsc', 'danger-guard.mjs'));
      fs2.rmSync(path.join(carpeta, '.rsc', 'gitmoji-guard.mjs'));
      fs2.rmSync(path.join(carpeta, '.rsc', 'ship-guard.mjs'));
      assert.deepEqual(cargar('reglas').losGuardianes(), [], 'sin ninguno montado, ninguno se nombra');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'tres guardianes, y el perfil decide si el primero actúa';
  });

  await comprobar('los tres guardianes de RSC tienen nombre, y su interruptor es el de verdad', () => {
    // Si RSC añade un guardián, esto lo dice antes que la pantalla de nadie. Y
    // el sufijo del interruptor NO es uniforme: el de gitmoji es `.no-gitmoji`,
    // no `.no-gitmoji-guard`. Se comprueba contra el código del guardián, que
    // es quien lo mira de verdad.
    const reglas = cargar('reglas');
    const nombres = cargar('nombres');
    const targets = path.join(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc', 'targets');
    if (!fs.existsSync(targets)) return 'SALTADA';

    const suyos = fs.readdirSync(targets).filter((f) => /-guard\.mjs$/.test(f)).map((f) => f.replace(/\.mjs$/, ''));
    assert.deepEqual(suyos.sort(), reglas.GUARDIANES.map((g) => g.id).sort(), 'los que hay en RSC son los que nombramos');

    for (const g of reglas.GUARDIANES) {
      assert.ok(nombres.comoSeLlama('guardianes', g.id).deFuera, `${g.id} sin nombre en español`);
      const suyo = fs.readFileSync(path.join(targets, g.fichero), 'utf8');
      assert.ok(suyo.includes(`'${g.interruptor}'`), `${g.id}: su interruptor real no es ${g.interruptor}`);
    }
    return `${suyos.length} guardianes, cada uno con su interruptor comprobado`;
  });

  await comprobar('el raíl de seguir delega en el mecanismo del arnés, no lo describe', () => {
    // Decía «mira el checkpoint local del arnés» en prosa y, en la línea
    // siguiente, que una vuelta inventada es peor que una corta — sin darle el
    // mecanismo para no inventársela. RSC ya tiene el patrón: sus comandos
    // delegan y no reproducen el método del otro.
    const suyo = fs.readFileSync(path.join(RAIZ, '..', 'skills', 'comandos', 'seguir.md'), 'utf8');
    assert.match(suyo, /\/resume-session/, 'nombra el comando del arnés que saca el dato');
    // Y el mecanismo por si ese comando no está puesto: el que ya está instalado
    // en la carpeta, no `npx` — que sin versión se trae la última publicada.
    assert.match(suyo, /node \.rsc\/session-memory\.mjs resume/, 'y el mecanismo local por si ese comando no está puesto');

    // Y las dos copias no se separan: la de `skills/` es la fuente y la de
    // `media/railes/` es la que viaja dentro del .vsix.
    const viaja = fs.readFileSync(path.join(RAIZ, 'media', 'railes', 'comandos', 'seguir.md'), 'utf8');
    assert.equal(viaja, suyo, 'la copia que viaja dentro es la misma');
    return 'delega en /resume-session';
  });

  await comprobar('ningún raíl manda correr npx sin versión', () => {
    // La decisión 6 quitó `npx` a propósito: en Windows es un `.cmd`, tarda, y
    // sin versión se trae la última publicada — con lo que la clase dejaría de
    // correr el mismo catálogo. Los comandos que escribe RSC lo dicen igual
    // (`/save-session`, `/learn`…), y esos no son nuestros: la regla que los
    // cubre vive en la habilidad `executive-lab`, que RSC no toca.
    const recorrer = (base, dentro = '') => fs.readdirSync(path.join(base, dentro), { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? recorrer(base, path.join(dentro, e.name)) : [path.join(dentro, e.name)]));

    const raiz = path.join(RAIZ, '..', 'skills');
    const sueltos = [];
    for (const fichero of recorrer(raiz).filter((f) => f.endsWith('.md'))) {
      const texto = fs.readFileSync(path.join(raiz, fichero), 'utf8');
      // Con versión fijada sí vale: `npx @ericrisco/rsc@2.0.5 …`.
      for (const linea of texto.split('\n')) {
        if (/npx\s+@ericrisco\/rsc(?!@)/.test(linea)) sueltos.push(`${fichero}: ${linea.trim().slice(0, 70)}`);
        if (/npx[^\n]*@latest/.test(linea)) sueltos.push(`${fichero}: @latest — ${linea.trim().slice(0, 60)}`);
      }
    }
    assert.deepEqual(sueltos, [], `un raíl manda correr npx sin versión:\n    ${sueltos.join('\n    ')}`);

    // Y la habilidad lleva la regla escrita, que es lo que cubre los comandos
    // del arnés, que se reescriben solos en cada actualización.
    const habilidad = fs.readFileSync(path.join(raiz, 'executive-lab', 'SKILL.md'), 'utf8');
    assert.match(habilidad, /Nada de `npx` sin versión/, 'la habilidad lo prohíbe');
    assert.match(habilidad, /node \.rsc\/session-memory\.mjs/, 'y dice qué usar en su lugar');
    return 'sin npx suelto, y la regla escrita donde el arnés no la pisa';
  });

  await comprobar('cada habilidad instalada cae en un montón, y ninguna se esconde', () => {
    // Jose, 21-09-2026: «que haya un mapeo correcto entre RSC y la extensión».
    // Hasta hoy, 27 de las 32 habilidades que monta la 2.0 no salían por ningún
    // lado: se llamaban «fontanería» y se descontaban en silencio. Ahora todo
    // lo instalado cae en uno de cuatro montones, y la suma tiene que cuadrar.
    const saberes = cargar('saberes');
    const rsc = cargar('rsc');
    const queSabe = saberes.queSabe(RAIZ);

    const montones = [...queSabe.suyas, ...queSabe.sabe, ...queSabe.otras, ...queSabe.deSerie].map((c) => c.id);
    assert.deepEqual(montones.sort(), [...rsc.habilidadesPuestas()].sort(), 'lo instalado, entero y sin repetir');
    assert.equal(montones.length, queSabe.instaladas);

    // Y lo del catálogo cae en un lado o en el otro, nunca en los dos ni en ninguno.
    const catalogo = require(path.join(RAIZ, 'media', 'capacidades.json')).capacidades.length;
    assert.equal(queSabe.sabe.length + queSabe.puedeAprender.length + queSabe.lasDemas.length, catalogo);
    assert.ok(queSabe.puedeAprender.length, 'tiene que haber algo que ofrecer');

    // Las del arnés se ven —plegadas— con su nombre en español, no en clave.
    const fs2 = require('node:fs');
    const conArnes = fs2.mkdtempSync(path.join(os.tmpdir(), 'con-fontaneria-'));
    fs2.writeFileSync(path.join(conArnes, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'], skills: ['orient', 'bro', 'react', 'mi-cosa-rara'] }));
    vscode.guion.raiz = conArnes;
    try {
      const alli = saberes.queSabe(RAIZ);
      const orient = alli.deSerie.find((c) => c.id === 'orient');
      assert.ok(orient, 'orient está instalada y por tanto se ve');
      assert.equal(orient.nombre, 'Brújula', 'con su nombre en español');
      assert.ok(!alli.sabe.some((c) => c.id === 'orient') && !alli.otras.some((c) => c.id === 'orient'), 'y solo en su montón');
      // `bro` la trae TODO arnés (perfil mínimo de RSC) y no es fontanería: se
      // pide por su nombre. Hasta el 22-09-2026 caía en «otras» —«instalada
      // aquí, fuera del catálogo»—, que es la etiqueta de algo escrito a mano en
      // esa carpeta. Ahora tiene su fila en el catálogo, como lo que es.
      const bro = alli.sabe.find((c) => c.id === 'bro');
      assert.equal(bro && bro.nombre, 'Tono humano', 'una del catálogo que además viene de serie');
      assert.ok(!alli.otras.some((c) => c.id === 'bro'), 'y ya no pasa por una de la casa');
      // Desde la decisión 102 el catálogo entero tiene nombre, así que `react`
      // ya no es «una fuera de la tabla»: cae en las del catálogo, con su fila.
      const react = alli.sabe.find((c) => c.id === 'react');
      assert.equal(react && react.nombre, 'React', 'una del catálogo completo, con el nombre de su fila');
      assert.ok(react.frase && /\bcon\b|\bde\b/.test(react.frase), 'y con frase en español');
      // Lo que de verdad está fuera de toda tabla se humaniza y no dice nada en inglés.
      const rara = alli.otras.find((c) => c.id === 'mi-cosa-rara');
      assert.equal(rara && rara.nombre, 'Mi cosa rara', 'una fuera de la tabla, con el nombre del fichero humanizado');
      assert.equal(rara.frase, '', 'y sin frase en inglés');

      // Y se encuentra buscando su identificador: quien oyó «orient» en clase
      // tiene que dar con «Brújula» escribiendo eso.
      const buscar = cargar('buscar');
      buscar.saberDondeEstamos(RAIZ);
      buscar.olvidar();
      const porId = buscar.buscar('orient').grupos.flatMap((g) => g.aciertos).find((r) => r.tipo === 'habilidad');
      buscar.olvidar();
      assert.ok(porId && porId.titulo === 'Brújula', 'una habilidad del arnés se encuentra por su identificador');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return `${queSabe.instaladas} instaladas en ${[queSabe.suyas, queSabe.sabe, queSabe.otras, queSabe.deSerie].filter((m) => m.length).length} montones · ${queSabe.puedeAprender.length} del catálogo`;
  });

  await comprobar('una habilidad se invoca por su identificador, como en clase', () => {
    // Antes el botón mandaba «Quiero <frase>. Pregúntame lo que necesites»: ni
    // nombraba la habilidad ni la disparaba. RSC dice (`targets/commands.js`,
    // `skillsAreCommands: true`) que para Claude las habilidades SON comandos,
    // así que el botón manda exactamente lo que se escribiría a mano.
    const saberes = cargar('saberes');
    assert.equal(saberes.comoSePide('unslop'), '/unslop');
    const queSabe = saberes.queSabe(RAIZ);
    for (const c of [...queSabe.suyas, ...queSabe.sabe, ...queSabe.otras, ...queSabe.deSerie]) {
      assert.equal(c.prompt, `/${c.id}`, `${c.id} se pide por su nombre`);
    }
    for (const c of queSabe.puedeAprender) assert.equal(c.prompt, `/${c.id}`);

    // Con un asistente sin barra, se le pide con palabras, nombrando la habilidad.
    const fs2 = require('node:fs');
    const conCodex = fs2.mkdtempSync(path.join(os.tmpdir(), 'codex-pide-'));
    fs2.writeFileSync(path.join(conCodex, '.rsc.json'), JSON.stringify({ version: 1, targets: ['codex'] }));
    vscode.guion.raiz = conCodex;
    try {
      assert.match(saberes.comoSePide('unslop'), /«unslop»/, 'nombrada por su identificador');
      assert.ok(!saberes.comoSePide('unslop').startsWith('/'), 'y sin la barra, que Codex no lee');
    } finally {
      vscode.guion.raiz = empresa;
    }

    // Y las fijadas arriba mandan lo mismo que su pantalla, no otra frase.
    const fijadas = cargar('fijadas');
    const fijada = fijadas.candidatos(RAIZ).flatMap((g) => g.cosas).find((c) => c.id === 'habilidad:executive-lab');
    assert.ok(fijada, 'una habilidad propia se puede fijar');
    assert.equal(fijada.accion.prompt, '/executive-lab');
    return `/${queSabe.suyas[0].id} · Codex con palabras`;
  });

  await comprobar('todo lo que RSC 2.0.5 puede montar tiene nombre en español', () => {
    // El mapeo entre el arnés y la barra es una tabla (`media/nombres.json`), y
    // esta prueba es lo que la mantiene completa: cada comando fijo de RSC, cada
    // habilidad del suelo y cada agente base tienen que estar. Si una versión
    // nueva trae uno más, esto lo dice antes que la pantalla de nadie.
    const nombres = cargar('nombres');
    const paquete = path.join(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc');
    if (!fs.existsSync(paquete)) return 'SALTADA';

    const comandosDeRsc = fs.readFileSync(path.join(paquete, 'targets', 'commands.js'), 'utf8');
    const fijos = new Set([
      ...[...comandosDeRsc.matchAll(/skillCommand\('([a-z-]+)'/g)].map((m) => m[1]),
      ...[...comandosDeRsc.matchAll(/name: '([a-z-]+)', kind:/g)].map((m) => m[1]),
      ...(comandosDeRsc.match(/\.\.\.\[([^\]]+)\]\.map\(\(name\) => skillCommand\(name\)\)/) || ['', ''])[1].split(',').map((x) => x.trim().replace(/'/g, '')).filter(Boolean),
    ]);
    const sinNombre = [...fijos].filter((id) => !nombres.loQueTraduce('comandos').includes(id));
    assert.deepEqual(sinNombre, [], 'un comando de RSC sin nombre en español');

    const suelo = fs.readFileSync(path.join(paquete, 'scripts', 'lib', 'default-skill-floor.js'), 'utf8');
    for (const id of [...suelo.matchAll(/'([a-z-]+)'/g)].map((m) => m[1])) {
      assert.ok(nombres.loQueTraduce('habilidades').includes(id), `${id} está en el suelo de RSC y no tiene nombre`);
    }
    for (const id of require(path.join(RAIZ, 'media', 'nombres.json')).fontaneria) {
      assert.ok(nombres.loQueTraduce('habilidades').includes(id), `${id} es fontanería y no tiene nombre`);
    }

    // Los agentes: los cuatro base con fila, los de lenguaje con patrón.
    for (const id of ['developer', 'refuter-correctness', 'refuter-security', 'refuter-tests']) {
      assert.ok(nombres.comoSeLlama('ayudantes', id).deFuera, `${id} sin nombre`);
    }
    const revisor = nombres.comoSeLlama('ayudantes', 'react-reviewer');
    assert.equal(revisor.nombre, 'Revisor de React');
    assert.ok(revisor.deFuera && /React/.test(revisor.queHace));
    assert.equal(nombres.comoSeLlama('ayudantes', 'flutter-build-resolver').nombre, 'Arreglador de compilación de Flutter');
    assert.equal(nombres.comoSeLlama('ayudantes', 'cobros-atrasados').deFuera, false, 'uno de la casa no casa con ningún patrón');

    // Y ningún nombre es una frase sobre lo que sabe hacer: empieza en mayúscula
    // y no empieza por un verbo en infinitivo seguido de complemento largo.
    const tabla = require(path.join(RAIZ, 'media', 'nombres.json'));
    for (const monton of ['comandos', 'habilidades', 'ayudantes']) {
      for (const [id, fila] of Object.entries(tabla[monton])) {
        assert.match(fila.nombre, /^[A-ZÁÉÍÓÚÑ]/, `${monton}/${id}: el nombre empieza en mayúscula`);
        assert.ok(fila.nombre.length <= 40, `${monton}/${id}: un nombre, no una frase`);
      }
    }
    for (const c of require(path.join(RAIZ, 'media', 'capacidades.json')).capacidades) {
      assert.match(c.nombre, /^[A-ZÁÉÍÓÚÑ]/, `${c.id}: el nombre empieza en mayúscula`);
      assert.ok(!/^(llevar|saber|seguir|escribir|revisar|dejar|decidir|mandar|trabajar|manejar|dar|hablar|comprar|poner|contratar|cumplir|recibir|elegir|mantener|contar) /i.test(c.nombre), `${c.id}: «${c.nombre}» es una frase, no un nombre`);
    }
    return `${fijos.size} comandos · ${nombres.loQueTraduce('habilidades').length} habilidades · 4 agentes + 2 patrones`;
  });

  await comprobar('un agente del arnés se nombra en español, y uno de la casa con lo suyo', () => {
    // Los agentes eran el único sitio de la barra donde se colaba una línea en
    // inglés: RSC escribe `name` en clave y `description` en inglés, y los dos
    // salían tal cual.
    const fs2 = require('node:fs');
    const conRsc = fs2.mkdtempSync(path.join(os.tmpdir(), 'agentes-rsc-'));
    fs2.writeFileSync(path.join(conRsc, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    fs2.mkdirSync(path.join(conRsc, '.claude', 'agents'), { recursive: true });
    fs2.writeFileSync(path.join(conRsc, '.claude', 'agents', 'refuter-security.md'),
      '---\nname: refuter-security\ndescription: "Adversarial reviewer, security and privacy lens."\nmodel: sonnet\n---\nBody.\n');
    fs2.writeFileSync(path.join(conRsc, '.claude', 'agents', 'react-reviewer.md'),
      '---\nname: react-reviewer\ndescription: "React and Next.js reviewer."\n---\nBody.\n');
    fs2.writeFileSync(path.join(conRsc, '.claude', 'agents', 'cobros.md'),
      '---\nname: cobros atrasados\ndescription: "Reclama las facturas que se han pasado de plazo."\n---\nBody.\n');

    vscode.guion.raiz = conRsc;
    try {
      const todos = cargar('agentes').queHay();
      const por = Object.fromEntries(todos.map((a) => [a.id, a]));
      assert.equal(por['refuter-security'].nombre, 'Revisor de seguridad');
      assert.ok(!/Adversarial/.test(por['refuter-security'].queHace), 'la frase en inglés no se enseña');
      assert.ok(por['refuter-security'].delArnes, 'y se sabe que es del arnés');
      assert.equal(por['react-reviewer'].nombre, 'Revisor de React', 'por patrón');
      assert.equal(por.cobros.nombre, 'cobros atrasados', 'el de la casa, con su nombre');
      assert.match(por.cobros.queHace, /pasado de plazo/, 'y su frase, que está en español');
      assert.equal(por.cobros.delArnes, false);
      assert.match(por.cobros.prompt, /«cobros»/, 'y se lanza por su identificador, no por su rótulo');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'Revisor de seguridad · Revisor de React · cobros atrasados';
  });

  await comprobar('ningún rótulo de la barra es una perífrasis sobre lo que el asistente sabe hacer', () => {
    // Jose, 21-09-2026: «que no haya "simplificaciones" excesivas como llamar a
    // las skills "Lo que sabe hacer" y esas tonterías». Las cosas se llaman por
    // lo que son. Esta lista es lo que se quitó; si vuelve, esto lo dice.
    const perifrasis = [
      'Lo que sabe hacer', 'sabe hacer (skills)', 'Ayudantes', 'Procesos con un clic', 'Tus botones',
      'Puede aprender', 'Que lo aprenda', 'Ya sabe', 'Con quién hablas', 'Lo que le has dado', 'Lo que ha hecho',
      'Lo que sabe de',
    ];
    const ficheros = [
      path.join(RAIZ, 'media', 'panel.js'),
      path.join(RAIZ, 'package.json'),
      ...fs.readdirSync(path.join(RAIZ, 'src')).filter((f) => f.endsWith('.js')).map((f) => path.join(RAIZ, 'src', f)),
    ];
    const coladas = [];
    for (const fichero of ficheros) {
      fs.readFileSync(fichero, 'utf8').split('\n').forEach((linea, i) => {
        const sinComentario = linea.trim().startsWith('//') || linea.trim().startsWith('*') || linea.trim().startsWith('/*') ? '' : linea;
        for (const p of perifrasis) {
          if (new RegExp(`['"\`>]${p}`).test(sinComentario)) coladas.push(`${path.basename(fichero)}:${i + 1} «${p}»`);
        }
      });
    }
    assert.deepEqual(coladas, [], 'una perífrasis ha vuelto a la pantalla');
    return `${perifrasis.length} perífrasis vigiladas en ${ficheros.length} ficheros`;
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
    assert.ok(cortas.length >= 2, 'y las sueltas que escribió alguien');
    // Esta comprobación daba por bueno que salieran «las sueltas que deja el
    // montaje» — o sea, la fontanería que RSC se apunta a sí mismo. Se vio en
    // un arnés recién montado: eran las únicas que había, así que el primer día
    // «las decisiones» enseñaba tres líneas en inglés con un hash dentro.
    const rotulos = decisiones.map((d) => d.titulo);
    assert.ok(!rotulos.some((t) => /^(Project kind|Accepted plan|SDD: deferred)/i.test(t)),
      'lo que el arnés se apunta a sí mismo no es una decisión de esta empresa');
    assert.ok(rotulos.some((t) => /viernes/.test(t)), 'pero una suelta de verdad sí sale');
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

  await comprobar('los agentes no salen hasta que hay alguno', () => {
    // Jose: "tiene que estar sin aparecer en el menú hasta que se acepte la
    // sugerencia y haya el primer agente". Es la regla de siempre —nada
    // predefinido— dicha para un caso nuevo.
    const agentes = cargar('agentes');
    assert.ok(agentes.hayAlguno(), 'la empresa de mentira tiene uno');
    const [uno] = agentes.queHay();
    assert.equal(uno.nombre, 'cobros atrasados', 'el nombre de su cabecera, no el del fichero');
    assert.match(uno.queHace, /facturas que se han pasado de plazo/, 'y para qué sirve');

    const sinAgentes = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-agentes-'));
    vscode.guion.raiz = sinAgentes;
    assert.equal(cargar('agentes').hayAlguno(), false, 'sin ninguno, el apartado no existe');
    vscode.guion.raiz = empresa;

    // Y cada asistente los guarda en su sitio: Codex en `.codex/agents`.
    const donde = cargar('donde');
    assert.deepEqual(donde.SITIOS.claude.agentes, ['.claude', 'agents']);
    assert.deepEqual(donde.SITIOS.codex.agentes, ['.codex', 'agents']);

    assert.equal(agentes.dondeVive('../../../etc/passwd'), null, 'no se abre nada de fuera');
    return `${agentes.queHay().length} agente`;
  });

  await comprobar('un agente de Codex se lee entero, aunque venga en otro formato', () => {
    // RSC escribe los ayudantes en tres sintaxis según el asistente: markdown
    // con cabecera para Claude, TOML para Codex, JSON para Kiro. Aquí se leían
    // los tres con el lector de cabeceras YAML, que solo entiende la primera.
    //
    // Con Codex eso salía así: el ayudante aparecía en la lista —el fichero
    // está— pero con el nombre del fichero en vez del suyo y sin una palabra de
    // lo que hace. Un ayudante sin explicación es un botón a ciegas.
    const fs2 = require('node:fs');
    const conCodex = fs2.mkdtempSync(path.join(os.tmpdir(), 'codex-ayudantes-'));
    fs2.writeFileSync(path.join(conCodex, '.rsc.json'), JSON.stringify({ version: 1, targets: ['codex'] }));
    fs2.mkdirSync(path.join(conCodex, '.codex', 'agents'), { recursive: true });
    fs2.writeFileSync(
      path.join(conCodex, '.codex', 'agents', 'plazos.toml'),
      'name = "vigilante de plazos"\ndescription = "Avisa del contrato que se acerca a su fecha."\nmodel = "gpt-5"\ndeveloper_instructions = \'\'\'\nname = "esto es el cuerpo, no un campo"\n\'\'\'\n',
    );

    vscode.guion.raiz = conCodex;
    const [suyo] = cargar('agentes').queHay();
    vscode.guion.raiz = empresa;

    assert.equal(suyo.nombre, 'vigilante de plazos', 'su nombre, no el del fichero');
    assert.match(suyo.queHace, /contrato que se acerca/, 'y para qué sirve');
    return suyo.nombre;
  });

  await comprobar('lo que ha aprendido de ti se encuentra en los tres sitios de RSC', () => {
    // RSC guarda su memoria en uno de tres sitios según qué esté fuera de git
    // (`chooseMemoryRoot`), y la barra miraba dos. El tercero pasa cuando
    // `.rsc/` acaba versionado: ahí la barra decía «no ha aprendido nada de ti»
    // con las lecciones guardadas y aprobadas una a una.
    //
    // Y una lección solo se escribe con aprobación explícita, de una en una, así
    // que perderlas de vista es perder justo lo que alguien se molestó en dar.
    const fs2 = require('node:fs');
    const SITIOS = [
      ['.rsc', 'memory', 'lessons'],
      ['02-DOCS', 'raw', 'worklog', '.rsc-memory', 'lessons'],
      ['.git', 'rsc-memory', 'lessons'],
    ];

    for (const sitio of SITIOS) {
      const casa = fs2.mkdtempSync(path.join(os.tmpdir(), 'lecciones-'));
      fs2.mkdirSync(path.join(casa, ...sitio), { recursive: true });
      fs2.writeFileSync(path.join(casa, ...sitio, 'l1.json'), JSON.stringify({
        id: 'l1',
        text: `guardada en ${sitio.join('/')}`,
        evidence: 'lo pidió tres veces',
        approvedAt: '2026-09-18T10:00:00Z',
        scope: 'project',
        confidence: 0.8,
      }));
      // Una rota no puede tumbar a las demás.
      fs2.writeFileSync(path.join(casa, ...sitio, 'rota.json'), '{esto no es json');

      vscode.guion.raiz = casa;
      const suyas = cargar('lecciones').queHaAprendido();
      vscode.guion.raiz = empresa;

      assert.equal(suyas.length, 1, `se encuentra la de ${sitio.join('/')}, y la rota no cuenta`);
      assert.match(suyas[0].texto, /guardada en/, 'con su texto');
      assert.equal(suyas[0].porque, 'lo pidió tres veces', 'y en qué se basa');
      assert.equal(suyas[0].donde, 'aqui', 'y si vale solo aquí o para todo');
      // El número de confianza no sale: un 0,7 no le dice nada a nadie.
      assert.ok(!('confianza' in suyas[0]), 'sin el número de confianza');
    }
    return `${SITIOS.length} sitios, los tres`;
  });

  await comprobar('una empresa de Codex se ve entera y bien, no solo sin reventar', async () => {
    // `empresas-distintas.js` comprueba que ninguna pantalla revienta con Codex.
    // Eso es la red de seguridad, no un aprobado: nada decía que lo que se
    // enseña sea **lo correcto**. Aquí se monta una carpeta de Codex como la
    // monta RSC más nuestros raíles, y se mira lo que saldría en cada sitio.
    const fs2 = require('node:fs');
    const cp = require('node:child_process');
    const casa = fs2.mkdtempSync(path.join(os.tmpdir(), 'codex-entera-'));
    const poner = (rel, texto) => {
      const f = path.join(casa, rel);
      fs2.mkdirSync(path.dirname(f), { recursive: true });
      fs2.writeFileSync(f, texto);
    };

    poner('.rsc.json', JSON.stringify({ version: 1, targets: ['codex'], skills: ['bro'], ownSkills: [], catalogVersion: '1.4.1' }));
    poner('01-TOOLS/_TEMPLATE/.env.example', 'X=\n');
    poner('02-DOCS/wiki/harness/user-profile.md', '---\narnes: Contratos\n---\n\n# User profile\n');
    poner('.codex/rsc/bro/SKILL.md', '---\nname: bro\ndescription: Rewrites text.\n---\n');
    poner('.codex/agents/plazos.toml', 'name = "vigilante de plazos"\ndescription = "Avisa del contrato que se acerca a su fecha."\n');
    poner('AGENTS.md', '# AGENTS.md\n\n## Working rules\n\n- Nada sale sin que lo lea un abogado.\n');
    poner('CLAUDE.md', '# CLAUDE.md\n\n## Working rules\n\n- Esta no la lee Codex y no debe salir.\n');
    // Los raíles, con el mismo script que lanza la extensión.
    cp.spawnSync(process.execPath, [path.join(RAIZ, 'media', 'railes', 'aplicar.js'), casa], { encoding: 'utf8' });

    vscode.guion.raiz = casa;
    vscode.guion.extensionesInstaladas = ['openai.chatgpt'];
    try {
      const quien = cargar('asistentes').comoEstamos();
      assert.equal(quien.ahora, 'codex', 'habla con Codex, que es para quien se montó');
      assert.equal(quien.cuales.find((c) => c.id === 'codex').mandaTexto, false, 'y se dice que no admite que le escribamos');

      const suyo = cargar('saberes').queSabe(RAIZ, 'contratos');
      assert.ok(suyo.sabe.some((c) => c.id === 'bro'), 'sus habilidades salen de .codex/rsc/');
      assert.ok(suyo.suyas.some((c) => c.id === 'executive-lab'), 'y el raíl queda declarado como suyo');

      const [ayudante] = cargar('agentes').queHay();
      assert.match(ayudante.queHace, /contrato que se acerca/, 'el ayudante en TOML se lee entero');

      const donde = cargar('donde');
      assert.equal(donde.puedeTenerBotones(), false, 'Codex no tiene botones, y la barra lo sabe');
      assert.equal(donde.puedeTenerAjustes(), false, 'ni fichero de permisos');
      assert.equal(cargar('acciones').todos().length, 0, 'así que no se enseña ninguno');

      const reglas = cargar('reglas').queHay();
      assert.equal(reglas.cual, 'otros', 'manda AGENTS.md');
      assert.ok(reglas.deLaCasa.some((x) => /abogado/.test(x)), 'y se enseñan las suyas');
      assert.ok(!reglas.deLaCasa.some((x) => /no debe salir/.test(x)), 'nunca las de CLAUDE.md, que ahí no las lee nadie');

      // ── Y lo que no puede haber aquí, dicho ──────────────────────────
      //
      // Con Codex no hay frenos: RSC no le engancha ninguno —su instalador hace
      // `if (target !== 'claude') return []`— así que el que para una orden
      // peligrosa, que es el que protege a quien no es técnico, no existe. La
      // sección salía con un cero al lado, como si a esta carpeta le faltara algo.
      assert.equal(reglas.puedeTenerFrenos, false, 'con Codex no se engancha ningún freno');
      assert.deepEqual(reglas.guardianes, [], 'así que no hay ninguno que enseñar');

      // Y nuestros propios raíles dejan tres interruptores en `.rsc/` sea cual
      // sea el asistente (`aplicar.js`, paso 4). Con Codex apagan piezas que ahí
      // no se instalan: decirlas apagadas es contar una decisión que nadie tomó.
      assert.deepEqual(cargar('reglas').loApagado(), [], 'no se da por apagado lo que ahí ni se monta');

      const panel = require('./panel-falso').montarPanel();
      const enPantalla = panel.mandar({ tipo: 'reglas', ...reglas });
      assert.match(enPantalla, /no trae frenos/, 'y la pantalla lo dice en vez de enseñar el cero');

      const susComandos = panel.mandar({
        tipo: 'comandos',
        comandos: cargar('acciones').todos(),
        puedeTenerBotones: donde.puedeTenerBotones(),
      });
      assert.match(susComandos, /no trabaja con comandos/, 'la pantalla de comandos dice por qué no hay ninguno');
      assert.ok(!/Se van creando/.test(susComandos), 'y no promete que se vayan creando solos');
      assert.ok(!/Crear un comando/.test(susComandos), 'ni ofrece crear uno que no tendría dónde vivir');

      const radio = await cargar('terreno').radiografia();
      const nombres = radio.piezas.map((p) => p.nombre);
      assert.ok(nombres.includes('Tu asistente'), 'se dice cuál es el asistente');
      assert.ok(!nombres.includes('Comandos'), 'y no se reprocha lo que no puede tener');
      assert.ok(!nombres.includes('Lo que tiene apagado'), 'ni se cuenta apagado lo que no puede estar');
      return `${suyo.sabe.length + suyo.suyas.length} habilidades · 1 ayudante · 0 botones y 0 frenos, y se sabe por qué`;
    } finally {
      vscode.guion.raiz = empresa;
      vscode.guion.extensionesInstaladas = ['anthropic.claude-code'];
    }
  });

  await comprobar('la versión del arnés está fijada, y dice lo mismo en los cinco sitios', () => {
    // La política está escrita en `rsc.js`: toda la cohorte corre el mismo
    // catálogo, y subir de versión es una decisión, no un efecto secundario.
    // Pero `media/harness/package.json` declaraba `^1.4.1` — un rango. Bastaba
    // con que saliera una 1.5 para que un `npm install` empaquetara el .vsix
    // con otro catálogo sin que nadie lo pidiera. Una versión fijada con
    // acento circunflejo no está fijada.
    //
    // Y está escrita en cinco sitios. Mientras nada los compare, el día que
    // alguien suba uno se quedan tres mintiendo. Esto dice cuáles tocar.
    const fs2 = require('node:fs');
    const leer = (...p) => JSON.parse(fs2.readFileSync(path.join(...p), 'utf8'));

    const pedida = leer(RAIZ, 'media', 'harness', 'package.json').dependencies['@ericrisco/rsc'];
    assert.match(pedida, /^\d+\.\d+\.\d+$/, 'exacta, sin ^ ni ~: si no, no está fijada');

    const puesta = leer(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc', 'package.json').version;
    assert.equal(puesta, pedida, 'el arnés que viaja dentro es el que se pide');

    const declarada = leer(RAIZ, '..', '.rsc.json').catalogVersion;
    assert.equal(declarada, pedida, '.rsc.json dice la misma');

    const fuente = fs2.readFileSync(path.join(RAIZ, 'src', 'rsc.js'), 'utf8');
    const respaldo = (fuente.match(/VERSION_DE_RESPALDO = '([^']+)'/) || [])[1];
    assert.equal(respaldo, pedida, 'el respaldo de rsc.js, también');

    const empaquetar = fs2.readFileSync(path.join(RAIZ, 'preparar-paquete.js'), 'utf8');
    assert.ok(empaquetar.includes(`@ericrisco/rsc@${pedida}`), 'y lo que se le dice a quien empaqueta');

    // Y la demo, que monta su propio arnés y por eso también la fija. Se escapó
    // de la primera versión de esta comprobación: cinco sitios, no cuatro.
    const demo = path.join(RAIZ, '..', 'demo.sh');
    if (fs2.existsSync(demo)) {
      const texto = fs2.readFileSync(demo, 'utf8');
      const suya = (texto.match(/@ericrisco\/rsc@([\d.]+)/) || [])[1];
      if (suya) assert.equal(suya, pedida, 'la demo monta el mismo catálogo que todo lo demás');
    }
    return pedida;
  });

  await comprobar('quitar el disfraz también limpia lo que el disfraz ya no pone', () => {
    // La herramienta leía `disfraz.json`, o sea **lo que el disfraz pone hoy**.
    // Una clave que se quita del disfraz sigue puesta en el ordenador de quien
    // instaló antes, así que la herramienta que existe para limpiar dejaba sin
    // limpiar justo lo que se había decidido que sobraba.
    //
    // El caso que lo destapó es el peor: `window.zoomLevel` es la que dejó el
    // editor gigante, hubo que quitarla a mano, y se sacó del disfraz por eso.
    // Desde entonces, quien la tuviera podía pasar esta herramienta y seguir
    // igual. Volverá a pasar cada vez que se saque una clave, de ahí la prueba.
    const fs2 = require('node:fs');
    const cp = require('node:child_process');
    const util = path.join(RAIZ, '..', 'herramientas', 'quitar-disfraz.js');
    const mirar = (ajustes) => {
      const f = path.join(os.tmpdir(), `disfraz-${Math.random().toString(36).slice(2)}.json`);
      fs2.writeFileSync(f, JSON.stringify(ajustes));
      const { stdout } = cp.spawnSync(process.execPath, [util, '--ajustes', f], { encoding: 'utf8' });
      fs2.rmSync(f, { force: true });
      return stdout;
    };

    assert.match(mirar({ 'window.zoomLevel': 1 }), /1 puestas por el disfraz/,
      'el zoom que poníamos nosotros se limpia aunque ya no esté en el disfraz');
    assert.match(mirar({ 'window.zoomLevel': 3 }), /NO se tocan: window\.zoomLevel/,
      'pero si esa persona puso el suyo, es suyo');
    assert.match(mirar({ 'editor.fontSize': 18 }), /No hay nada del disfraz/,
      'y lo que nunca fue nuestro, ni se menciona');
    return 'lo de antes se limpia, lo tuyo no se toca';
  });

  await comprobar('el perfil de pruebas no resucita ajustes que se quitaron', () => {
    // `perfil/executive-lab.code-profile` está generado y versionado, y nada
    // comprobaba que siguiera cuadrando con `disfraz.json`. Se separó: seguía
    // llevando `window.zoomLevel`, **el ajuste que le puso a Jose el editor
    // gigante** y que por eso se quitó del disfraz. Quien lo importara para
    // probar el disfraz a mano se lo volvía a poner.
    const fs2 = require('node:fs');
    const disfraz = JSON.parse(fs2.readFileSync(path.join(RAIZ, 'media', 'disfraz.json'), 'utf8'));
    const fichero = path.join(RAIZ, '..', 'perfil', 'executive-lab.code-profile');
    if (!fs2.existsSync(fichero)) return 'no está el perfil de pruebas';

    const dentro = JSON.parse(JSON.parse(JSON.parse(fs2.readFileSync(fichero, 'utf8')).settings).settings);
    assert.deepEqual(Object.keys(dentro).sort(), Object.keys(disfraz).sort(),
      'el perfil lleva exactamente los ajustes del disfraz; vuelve a generarlo con perfil/construir-perfil.js');
    assert.ok(!('window.zoomLevel' in dentro), 'y nunca el zoom, que no es nuestro');
    return `${Object.keys(dentro).length} ajustes, los mismos`;
  });

  await comprobar('la tabla de cada asistente cuadra con el arnés que viaja dentro', () => {
    // Esta tabla es copia de la de RSC, y de ella cuelga ya casi toda la barra:
    // dónde están las habilidades, los botones, los ayudantes y los permisos, y
    // dónde se ponen los raíles. Copiada a mano y sin comprobar, el día que
    // alguien suba el arnés de versión la tabla se vuelve una suposición —y
    // falla como falla siempre esto: sin error, enseñando cero.
    //
    // Así que se lee la suya, de verdad, del paquete que viaja dentro del
    // .vsix, y se compara. No se comprueba la versión: se comprueban las rutas,
    // que es lo que de verdad importa y lo que puede cambiar sin avisar.
    const fs2 = require('node:fs');
    const suyo = path.join(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc', 'targets');
    if (!fs2.existsSync(suyo)) return 'el arnés no está aquí: no se puede comparar';

    // Sus tablas son objetos literales en el código. Se leen sus filas.
    const filas = (fichero, desde, clave) => {
      const texto = fs2.readFileSync(path.join(suyo, fichero), 'utf8');
      const bloque = texto.slice(texto.indexOf(desde));
      const salida = {};
      for (const linea of bloque.slice(0, bloque.indexOf('\n};')).split('\n')) {
        const fila = linea.match(new RegExp(`^\\s*(\\w+):\\s*\\{.*\\b${clave}:\\s*'([^']+)'`));
        if (fila) salida[fila[1]] = fila[2];
      }
      return salida;
    };

    const habilidades = filas('index.js', 'const SPEC = {', 'root');
    const enganches = filas('index.js', 'const SPEC = {', 'hook');
    const comandos = filas('commands.js', 'const COMMAND_TARGETS = Object.freeze({', 'dir');
    const ayudantes = filas('agents.js', 'const AGENT_TARGETS = {', 'dir');
    assert.ok(Object.keys(habilidades).length > 10, 'se han leído sus filas de verdad');

    const nuestra = cargar('donde').SITIOS;
    const comoEscribimos = (partes) => (partes ? partes.join('/') : null);

    for (const [quien, fila] of Object.entries(nuestra)) {
      assert.ok(habilidades[quien], `declaramos ${quien} y RSC no lo conoce`);
      // Un hueco puede ser nuestro y a sabiendas —Gemini escribe sus botones en
      // TOML y no sabemos leerlos— y eso lo dice la propia fila. Lo que no puede
      // es aparecer sin que nadie lo haya decidido.
      const aSabiendas = (cual) => (fila.noLeemos || []).includes(cual);
      assert.equal(comoEscribimos(fila.habilidades), habilidades[quien], `habilidades de ${quien}`);
      if (!aSabiendas('comandos')) assert.equal(comoEscribimos(fila.comandos), comandos[quien] || null, `botones de ${quien}`);
      if (!aSabiendas('agentes')) assert.equal(comoEscribimos(fila.agentes), ayudantes[quien] || null, `ayudantes de ${quien}`);
      // Claude es el único cuyo fichero de siempre no sirve para apuntarle a una
      // habilidad: es JSON de enganches, y además las encuentra solo.
      if (fila.siempre) assert.equal(comoEscribimos(fila.siempre.fichero), enganches[quien], `lo que lee siempre ${quien}`);
    }

    // Y lo de Codex, que es de lo que vive media auditoría, dicho aparte.
    assert.equal(comandos.codex, undefined, 'RSC no le escribe botones a Codex');
    assert.equal(habilidades.codex, '.codex/rsc');
    assert.equal(ayudantes.codex, '.codex/agents');
    return `${Object.keys(nuestra).length} asistentes, todos cuadran con los suyos`;
  });

  await comprobar('los raíles se ponen donde mira el asistente de esa carpeta', () => {
    // Esto escribía en `.claude/` pasara lo que pasara, y el wizard deja elegir
    // Codex: le pasa `--target codex` a RSC, que monta el arnés entero en
    // `.codex/`. En esas carpetas la habilidad que fija el español y el
    // vocabulario, y los cuatro comandos, caían donde Codex no mira jamás.
    // Sin error y sin aviso: raíles puestos que no encarrilan nada.
    const fs2 = require('node:fs');
    const cp = require('node:child_process');
    const aplicar = path.join(RAIZ, 'media', 'railes', 'aplicar.js');

    const poner = (targets, antes = {}) => {
      const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'railes-'));
      fs2.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets }));
      for (const [fichero, texto] of Object.entries(antes)) fs2.writeFileSync(path.join(carpeta, fichero), texto);
      const { status } = cp.spawnSync(process.execPath, [aplicar, carpeta], { encoding: 'utf8' });
      return { carpeta, status, hay: (...p) => fs2.existsSync(path.join(carpeta, ...p)) };
    };

    const claude = poner(['claude']);
    assert.ok(claude.hay('.claude', 'skills', 'executive-lab', 'SKILL.md'), 'con Claude, donde siempre');
    assert.ok(claude.hay('.claude', 'commands', 'seguir.md'), 'y sus cuatro comandos');

    const codex = poner(['codex'], { 'AGENTS.md': '# AGENTS.md\n\nLo que ya había aquí.\n' });
    assert.ok(codex.hay('.codex', 'rsc', 'executive-lab', 'SKILL.md'), 'con Codex, en la suya');
    assert.ok(!codex.hay('.claude'), 'y ni se toca la de Claude');
    // Codex no tiene carpeta de comandos: RSC no le escribe ninguno, nunca. No
    // se los inventamos en una carpeta muerta.
    assert.ok(!codex.hay('.codex', 'commands'), 'sin comandos, porque no hay dónde');

    // Y Codex no descubre las habilidades solo: lee su AGENTS.md. Una habilidad
    // que nadie nombra es una habilidad que no se carga.
    const agents = fs2.readFileSync(path.join(codex.carpeta, 'AGENTS.md'), 'utf8');
    assert.match(agents, /Lo que ya había aquí/, 'lo que hubiera escrito se respeta');
    assert.match(agents, /\.codex\/rsc\/executive-lab\/SKILL\.md/, 'y se le apunta a la habilidad');

    // Dos veces no son dos trozos: RSC pone el suyo entre marcas por lo mismo.
    cp.spawnSync(process.execPath, [aplicar, codex.carpeta], { encoding: 'utf8' });
    const otraVez = fs2.readFileSync(path.join(codex.carpeta, 'AGENTS.md'), 'utf8');
    assert.equal(otraVez.match(/executive-lab:start/g).length, 1, 'y no se duplica al repetir');

    // Y se callan los avisos del arnés que mandarían al alumno a una terminal.
    //
    // El enganche de arranque de RSC corre en cada sesión y puede imprimir cinco
    // avisos con `npx @ericrisco/rsc …`, diciéndole al asistente que se lo
    // ofrezca al alumno. Uno de ellos ofrece `@latest`, que se saltaría la
    // versión fijada de la que depende que toda la clase corra lo mismo.
    for (const interruptor of ['.no-audit', '.no-worktree-cleanup', '.no-scope-check']) {
      assert.ok(claude.hay('.rsc', interruptor), `se calla ${interruptor}`);
    }
    // Y los que sí valen la pena no se tocan: que avise si falta git, y la
    // higiene del CLAUDE.md, que no lleva ningún comando.
    assert.ok(!claude.hay('.rsc', '.no-git'), 'que avise si falta git está bien');
    assert.ok(!claude.hay('.rsc', '.no-claudemd-check'), 'y la higiene del CLAUDE.md también');

    // Un asistente que no sabemos dónde mira se para. Unos raíles en la carpeta
    // equivocada se ven, desde fuera, igual que unos puestos.
    const raro = poner(['un-asistente-que-no-conocemos']);
    assert.equal(raro.status, 1, 'con un asistente desconocido no se escribe nada');
    assert.ok(!raro.hay('.claude'), 'y desde luego no se cae en la de Claude');

    return 'Claude en la suya · Codex en la suya · desconocido, ninguna';
  });

  await comprobar('una habilidad escrita aquí no se cuenta como fontanería', () => {
    // Era justo al revés: la más pertinente de todas —la que alguien se molestó
    // en escribir para esta carpeta— acababa contada como "cosas que trae de
    // serie" y no se veía por ningún lado.
    const saberes = cargar('saberes');
    vscode.guion.raiz = RAIZ.replace(/\/extension$/, '');
    const suyo = saberes.queSabe(RAIZ);
    vscode.guion.raiz = empresa;

    assert.ok(suyo.suyas.some((c) => c.id === 'texto-de-la-barra'), 'la de este repositorio sale por su nombre');
    assert.ok(suyo.suyas.every((c) => c.frase), 'y con para qué sirve, de su propia cabecera');
    return suyo.suyas.map((c) => c.nombre).join(' · ');
  });

  await comprobar('un documento dejado en la carpeta cuenta como dado', () => {
    // Jose dejó un fichero ahí y la barra dijo que no le había dado nada.
    // Desde su lado LO HABÍA DADO; que nosotros solo miráramos `inbox/` es un
    // detalle nuestro que a él no le importa. Y el protocolo de RSC ya lo
    // contempla: su barrido se da una vuelta por la carpeta buscando lo que
    // nadie ha colocado.
    const papeles = cargar('papeles');
    const suelto = path.join(empresa, 'contrato-firmado.pdf');
    fs.writeFileSync(suelto, 'un contrato de mentira');

    const hay = papeles.queHay();
    assert.ok(hay.sueltos.some((d) => d.nombre === 'contrato-firmado.pdf'), 'sale como sin colocar');
    assert.ok(papeles.donde('contrato-firmado.pdf'), 'y se puede abrir');

    // Lo del propio proyecto no cuenta como documento que haya dado nadie.
    fs.writeFileSync(path.join(empresa, 'README.md'), '# esto es el andamio');
    assert.ok(!papeles.queHay().sueltos.some((d) => d.nombre === 'README.md'), 'el andamio no es un documento');

    // Y no se cuela nada de fuera por esta puerta.
    assert.equal(papeles.donde('../fuera.pdf'), null);

    fs.unlinkSync(suelto);
    fs.unlinkSync(path.join(empresa, 'README.md'));
    return `${hay.sueltos.length} sin colocar`;
  });

  await comprobar('renombrar algo es cambiar una línea de datos, no de código', () => {
    // Jose: «¿cómo creas los nombres en lenguaje humano? […] lo digo para hacer
    // un mapeo flexible a largo plazo». Antes estaba escrito a mano en dos
    // objetos, en dos módulos que no se conocían entre ellos.
    const nombres = cargar('nombres');
    const tabla = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'nombres.json'), 'utf8'));

    // 1. Lo que escribe alguien de esta casa manda sobre la tabla.
    const mio = nombres.comoSeLlama('comandos', 'checkpoint', { nombre: 'Mi nombre', queHace: 'Lo mío.' });
    assert.equal(mio.nombre, 'Mi nombre');

    // 2. Sin nada suyo, traduce la tabla — y deja dicho que viene de fuera.
    const delArnes = nombres.comoSeLlama('comandos', 'checkpoint');
    assert.equal(delArnes.nombre, tabla.comandos.checkpoint.nombre);
    assert.equal(delArnes.deFuera, true, 'lo que traduce la tabla es lo que trae el arnés');

    // 3. Y lo que no conoce nadie, humanizado: nunca un identificador en crudo.
    assert.equal(nombres.comoSeLlama('comandos', 'cerrar_el-mes').nombre, 'Cerrar el mes');

    // Y lo que sale en la barra es lo que dice la tabla, no otra cosa.
    const todos = cargar('acciones').todos();
    const puesto = todos.find((c) => c.nombre === 'checkpoint');
    assert.equal(puesto.etiqueta, tabla.comandos.checkpoint.nombre, 'la tabla no llega hasta la pantalla');
    assert.equal(puesto.queHace, tabla.comandos.checkpoint.queHace);
    assert.equal(puesto.delArnes, true);

    // Un comando de la casa con su `boton:` no lo toca nadie.
    const suyo = todos.find((c) => c.nombre === 'resumen-mes');
    assert.equal(suyo.etiqueta, 'Preparar el resumen del mes');
    assert.equal(suyo.delArnes, false);

    return `${Object.keys(tabla.comandos).length} comandos y ${Object.keys(tabla.habilidades).length} habilidades, en un fichero`;
  });

  await comprobar('la (i) dice cómo se llama de verdad', () => {
    // El rótulo está en cristiano para poder leerlo, pero quien vaya a escribir
    // "/checkpoint" en una conversación tiene que poder saber cuál es.
    const p = require('./panel-falso').montarPanel();
    const pintada = p.mandar({ tipo: 'comandos', comandos: cargar('acciones').todos() });
    assert.match(pintada, /Se escribe <code>\/checkpoint<\/code>/);
    assert.match(pintada, /Se escribe <code>\/resumen-mes<\/code>/);

    // Y va DENTRO del plegado: en el botón sería ruido.
    const conCodigo = pintada.slice(0, pintada.indexOf('<code>/checkpoint</code>'));
    assert.match(conCodigo.slice(-400), /<div class="loQueHace"/, 'el identificador se enseña fuera de la (i)');
    return 'el nombre de verdad, en la (i)';
  });

  await comprobar('lo que se ofrece aprender va con este arnés, no con todos', () => {
    // Jose: «¿estos "puede aprender" son fijos? deberían hacerse en el init del
    // arnés ajustado al arnés». Lo eran: detrás de las que encajaban se pegaba
    // el catálogo entero, así que una carpeta de código ofrecía facturas.
    const catalogo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'capacidades.json'), 'utf8')).capacidades;
    for (const c of catalogo) {
      assert.ok(Array.isArray(c.para) && c.para.length, `"${c.id}" no dice para qué arnés sirve`);
    }

    const s = cargar('saberes').queSabe(RAIZ);
    assert.equal(s.deQueVa, 'operations', 'la empresa de mentira se montó para llevar el día a día');

    // Nada se pierde por el camino: lo ofrecido más lo plegado es todo lo que
    // falta por poner.
    assert.equal(s.puedeAprender.length + s.lasDemas.length, catalogo.length - s.sabe.length,
      'alguna capacidad se ha quedado sin salir por ningún lado');

    // Y en un arnés de otra clase, lo que no pega se pliega de verdad.
    const deCodigo = fs.mkdtempSync(path.join(os.tmpdir(), 'arnes-de-codigo-'));
    fs.writeFileSync(path.join(deCodigo, '.rsc.json'), JSON.stringify({
      version: 1, targets: ['claude'], skills: [], ownSkills: [],
      onboarding: { plan: { record: { projectKind: 'software' } } },
    }));
    vscode.guion.raiz = deCodigo;
    const codigo = cargar('saberes').queSabe(RAIZ);
    vscode.guion.raiz = empresa;

    assert.equal(codigo.deQueVa, 'software');
    assert.ok(codigo.lasDemas.length > 10, `en un arnés de código se plegaban ${codigo.lasDemas.length}`);
    for (const c of codigo.puedeAprender) {
      const ficha = catalogo.find((x) => x.id === c.id);
      if (!ficha || (c.porQue || []).length) continue; // las que encajan por palabras sí pasan
      assert.ok(ficha.para.includes('software'), `"${c.id}" se ofrece en un arnés de código y no pega`);
    }
    return `${s.puedeAprender.length} ofrecidas aquí · ${codigo.lasDemas.length} plegadas en uno de código`;
  });

  await comprobar('una cosa es un botón, y lo que hace está detrás de la (i)', () => {
    // Jose: «quiero que sea con botones, no tanta cosa. Si quieres saber qué
    // hace puedes meter una (i) de info». Antes cada cosa eran tres bloques
    // —nombre, párrafo y un botón que ponía "Hacerlo"— y con veinticinco
    // habilidades la pantalla era ilegible.
    const p = require('./panel-falso').montarPanel();
    const sabe = cargar('saberes').queSabe(RAIZ);

    const pantallas = [
      ['comandos', { tipo: 'comandos', comandos: cargar('acciones').todos() }],
      ['agentes', { tipo: 'agentes', agentes: cargar('agentes').queHay() }],
      ['saberes', { tipo: 'saberes', sabe: sabe.sabe, suyas: sabe.suyas, otras: sabe.otras, puedeAprender: sabe.puedeAprender }],
    ];

    let filas = 0;
    for (const [nombre, mensaje] of pantallas) {
      const pintada = p.mandar(mensaje);

      // Ni una sola cosa de estas listas se pinta ya como un bloque con
      // párrafo: eso era lo que ocupaba la pantalla entera.
      assert.ok(!/<div class="entrada">/.test(pintada), `${nombre} sigue pintando bloques`);
      assert.ok(!/<div class="capacidad">/.test(pintada), `${nombre} sigue pintando bloques`);

      // Cada (i) tiene su explicación, y viene plegada.
      for (const trozo of pintada.matchAll(/data-info="(q\d+)"/g)) {
        filas += 1;
        const id = trozo[1];
        const bloque = new RegExp(`<div class="loQueHace" id="${id}" hidden>`);
        assert.match(pintada, bloque, `en ${nombre}, la (i) de ${id} no abre nada`);
      }

      // Y lo que se ve sin desplegar nada son botones, no prosa: fuera de los
      // bloques plegados no puede quedar ninguna explicación suelta.
      const sinPlegados = pintada.replace(/<div class="loQueHace"[\s\S]*?<\/div>/g, '');
      assert.ok(!/class="pista"/.test(sinPlegados), `${nombre} deja una explicación a la vista`);
    }

    assert.ok(filas >= 8, `se esperaban al menos 8 filas con (i) y han salido ${filas}`);
    return `${filas} filas, todas plegadas`;
  });

  await comprobar('los agentes viven con sus hermanos, dentro de Acciones', () => {
    // Tenían un apartado entero para ellos solos, arriba, con un botón dentro.
    // Son lo mismo que los comandos y las habilidades —algo que esta carpeta
    // sabe hacer—, así que van donde están esos dos.
    const p = require('./panel-falso').montarPanel();
    // `hayAgentes` viaja DENTRO de `estado`, que es de donde lo lee la
    // pantalla: si se pone al lado, la prueba pasaría sin probar nada.
    const comun = (hayAgentes) => ({
      tipo: 'estado',
      estado: { listo: true, sabe: 1, conectados: 1, hayAgentes },
      acciones: [],
      modo: 'sencillo',
      marcaPuesta: true,
      comoSeLlama: 'tu trabajo',
      pulso: [],
    });

    const con = p.mandar(comun(true));
    assert.ok(!/grupo:agentes/.test(con), 'ya no hay un apartado suyo');
    const dentroDeAcciones = con.split('grupo:acciones')[1] || '';
    assert.match(dentroDeAcciones, />Agentes</, 'y están dentro de Acciones');

    // Y sin ninguno montado, no se nombran.
    const sin = p.mandar(comun(false));
    assert.ok(!/>Agentes</.test(sin), 'un rótulo con nada detrás es peor que no tenerlo');
    return 'dentro de Acciones, y solo si hay';
  });

  await comprobar('los apartados de habilidades, comandos y reglas van en el orden acordado', () => {
    // Jose, 21-09-2026 (decisión 101): lo instalado junto bajo un titular, con
    // el origen en la (i); las sugerencias del catálogo; y al final, plegado,
    // lo que pesa poco. Los guardianes bajan al final de Las reglas, plegados;
    // Sugerencias abre la puerta a un agente cuando no hay ninguno; y la
    // radiografía tiene un solo nombre. Los datos son de mentira y con todos
    // los montones llenos, para que cada bloque tenga que salir.
    const p = require('./panel-falso').montarPanel();
    const puesta = (id, nombre) => ({ id, nombre, frase: 'Sirve para algo.', prompt: `/${id}` });
    const delCatalogo = (id, nombre) => ({ id, nombre, frase: 'Sirve para algo.', porQue: [] });

    const habilidades = p.mandar({
      tipo: 'saberes',
      suyas: [puesta('mi-proceso', 'Mi proceso')],
      sabe: [puesta('invoicing', 'Facturación')],
      otras: [puesta('react', 'React')],
      deSerie: [puesta('orient', 'Brújula')],
      puedeAprender: [delCatalogo('a', 'Aaa'), delCatalogo('b', 'Bbb')],
      encajan: 1,
      lasDemas: [delCatalogo('c', 'Ccc')],
      deQueVa: 'software',
      instaladas: 4,
    });
    const bloques = ['<h2>Instaladas</h2>', '<h2>Sugerencias del catálogo</h2>', '<summary>Resto del catálogo', '<summary>Las del arnés'];
    const posiciones = bloques.map((b) => habilidades.indexOf(b));
    assert.ok(posiciones.every((i) => i >= 0), `falta un bloque: ${bloques.filter((b, i) => posiciones[i] < 0).join(', ')}`);
    assert.deepEqual(posiciones, [...posiciones].sort((a, b) => a - b), 'y en ese orden');
    assert.ok(!/Propias de esta carpeta|Instaladas fuera del catálogo|Para otra clase de carpeta|Ver las demás|<h2>Del catálogo<\/h2>/.test(habilidades), 'sin los titulares viejos');
    const instaladas = habilidades.split('<h2>Instaladas</h2>')[1].split('<h2>Sugerencias del catálogo</h2>')[0];
    for (const nombre of ['Mi proceso', 'Facturación', 'React']) assert.ok(instaladas.includes(nombre), `${nombre} está bajo Instaladas`);
    assert.match(instaladas, /Tuya: escrita para esta carpeta/, 'el origen va en la (i)');
    assert.match(instaladas, /Del catálogo\./);
    assert.match(instaladas, /Instalada aquí, fuera del catálogo/);
    assert.ok(!instaladas.includes('Brújula'), 'y las del arnés no están ahí: van abajo');
    const resto = habilidades.split('<summary>Resto del catálogo')[1];
    assert.ok(resto.includes('Ccc'), 'lo que no pega con esta carpeta cae en el resto');
    assert.ok(!habilidades.split('<summary>Resto del catálogo')[0].includes('Ccc'), 'y solo ahí');

    const comandos = p.mandar({ tipo: 'comandos', comandos: [
      { etiqueta: 'Revisar la barra', queHace: '', icono: '▸', esBoton: true, delArnes: false, prompt: '/revisar-la-barra' },
      { etiqueta: 'Guardar dónde vamos', queHace: '', icono: '▸', esBoton: false, delArnes: true, prompt: '/save-session' },
    ] });
    assert.match(comandos, /<details[^>]*>\s*<summary>Los del arnés/, 'los comandos del arnés, plegados');
    assert.ok(comandos.indexOf('Revisar la barra') < comandos.indexOf('<summary>Los del arnés'), 'y después de los tuyos');

    const guardian = { id: 'danger-guard', nombre: 'Freno ante órdenes peligrosas', queHace: 'Para una orden peligrosa.', estado: 'armado', porQue: '' };
    const reglas = p.mandar({ tipo: 'reglas', innegociables: ['Nada de precios sin preguntar'], deLaCasa: ['Se habla en español'], guardianes: [guardian], hay: {}, cual: 'claude' });
    const donde = reglas.indexOf('Lo que se comprueba solo');
    assert.ok(donde > reglas.indexOf('Cómo se trabaja aquí'), 'los guardianes, después de las reglas de la casa');
    assert.ok(donde > reglas.indexOf('Decirle qué NO quiero que haga'), 'y después de los botones: al final');
    assert.match(reglas, /<details[^>]*>\s*<summary>Lo que se comprueba solo/, 'plegados');
    assert.match(reglas, /aviso en inglés que no te deja seguir/, 'y con la frase que ata el bloqueo con esta pantalla');
    assert.ok(reglas.includes('Freno ante órdenes peligrosas'), 'sin dejar de nombrarlos: lo instalado se ve');

    const sinAgentes = p.mandar({ tipo: 'sugerencias', ahora: [], hayAgentes: false, hayProyectos: false });
    assert.match(sinAgentes, /Ver si te vendría bien un agente/, 'sin agentes, la puerta a uno');
    assert.ok(!/aparecen solos/.test(sinAgentes), 'y no el cartel de antes');
    const conAgentes = p.mandar({ tipo: 'sugerencias', ahora: [], hayAgentes: true, hayProyectos: false });
    assert.ok(!/Ver si te vendría bien un agente/.test(conAgentes), 'con agentes, no hace falta');

    const radio = p.mandar({ tipo: 'radiografia', queEs: 'conArnes', piezas: [] });
    assert.ok(!/Qué hay aquí/.test(radio), 'la radiografía ya no tiene un tercer nombre');
    assert.ok((radio.match(/Qué falta por montar/g) || []).length >= 2, 'miga y título dicen lo mismo');

    return 'instaladas · sugerencias · resto · arnés, y los guardianes al final';
  });

  await comprobar('todo lo que RSC puede montar tiene nombre en la barra', () => {
    // Jose, 21-09-2026: «quiero que revises todo y mapees todo bien». El paquete
    // trae 273 habilidades y la barra nombraba 90: las otras 183 habrían salido
    // con el identificador humanizado y sin frase. Se lee el manifiesto del
    // paquete que viaja dentro y se exige que no quede ninguna sin nombre, ni
    // ningún agente por lenguaje con el lenguaje en clave (decisión 102).
    const paquete = path.join(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc');
    if (!fs.existsSync(path.join(paquete, 'manifest.json'))) return 'SALTADA';
    const manifiesto = JSON.parse(fs.readFileSync(path.join(paquete, 'manifest.json'), 'utf8'));
    const tabla = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'nombres.json'), 'utf8'));
    const catalogo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'capacidades.json'), 'utf8')).capacidades;

    const conNombre = new Set([...Object.keys(tabla.habilidades), ...catalogo.map((c) => c.id)]);
    const sinNombre = manifiesto.skills.map((s) => s.id).filter((id) => !conNombre.has(id));
    assert.deepEqual(sinNombre, [], `habilidades del catálogo sin nombre en español: ${sinNombre.join(', ')}`);
    const suyas = new Set(manifiesto.skills.map((s) => s.id));
    const fantasmas = catalogo.map((c) => c.id).filter((id) => !suyas.has(id));
    assert.deepEqual(fantasmas, [], `en capacidades.json y ya no en el catálogo: ${fantasmas.join(', ')}`);

    // Cada fila del catálogo trae lo que la pantalla necesita, y en las palabras
    // del diccionario: ni identificadores ni jerga prohibida en lo que se ve.
    const PARA = new Set(['operations', 'content', 'software', 'research']);
    const PROHIBIDAS = /\b(API|token|JSON|hook|repositorio|commit|branch|extensión|terminal|consola)\b/;
    for (const c of catalogo) {
      assert.ok(c.nombre && c.frase, `${c.id} sin nombre o sin frase`);
      assert.ok(Array.isArray(c.palabras) && c.palabras.length >= 2, `${c.id} con menos de dos palabras`);
      assert.ok(Array.isArray(c.para) && c.para.length && c.para.every((p) => PARA.has(p)), `${c.id} con un "para" que no existe: ${c.para}`);
      assert.ok(!PROHIBIDAS.test(`${c.nombre} ${c.frase}`), `${c.id} usa una palabra prohibida en pantalla: ${c.nombre} — ${c.frase}`);
    }

    // Los agentes por lenguaje se nombran con el lenguaje, no con su clave.
    const nombres = cargar('nombres');
    assert.equal(nombres.comoSeLlama('ayudantes', 'cpp-reviewer').nombre, 'Revisor de C++');
    assert.equal(nombres.comoSeLlama('ayudantes', 'csharp-reviewer').nombre, 'Revisor de C#');
    assert.equal(nombres.comoSeLlama('ayudantes', 'mle-reviewer').nombre, 'Revisor de ML en producción');
    assert.equal(nombres.comoSeLlama('ayudantes', 'pytorch-build-resolver').nombre, 'Arreglador de compilación de PyTorch');
    assert.equal(nombres.comoSeLlama('ayudantes', 'elixir-reviewer').nombre, 'Revisor de Elixir', 'uno que no está en la tabla se humaniza como antes');
    assert.ok(nombres.comoSeLlama('ayudantes', 'spec-miner').deFuera, 'spec-miner tiene nombre en la tabla');
    const catalogoAgentes = require(path.join(paquete, 'targets', 'agent-catalog.js'));
    for (const n of catalogoAgentes.stackAgentNames()) {
      const dicho = nombres.comoSeLlama('ayudantes', n);
      assert.ok(dicho.deFuera, `${n} sin nombre en español`);
      assert.ok(!/\b(Cpp|Csharp|Php|Mle|Rag|Fastapi|Postgres|Pytorch)\b/.test(dicho.nombre), `${n} sale con el lenguaje en clave: ${dicho.nombre}`);
    }
    return `${manifiesto.skills.length} habilidades y ${catalogoAgentes.stackAgentNames().length} agentes, todos con nombre`;
  });

  await comprobar('y además cae en un montón: ninguna del catálogo queda sin sitio', () => {
    // Tener nombre no bastaba, y eso costó cuatro habilidades. `bro`, `eli5`,
    // `show-me` y `unslop` están en el perfil mínimo de RSC —las trae TODO
    // arnés— y estaban nombradas en `nombres.json` pero no en ningún montón: ni
    // en el catálogo ni en la fontanería. La barra las enseñaba como «instalada
    // aquí, fuera del catálogo», que es lo que se le dice a algo que escribió a
    // mano quien usa esa carpeta. La prueba de al lado pasaba tan contenta.
    //
    // Los dos montones no se solapan a propósito: la fontanería va plegada bajo
    // «Las del arnés» y el catálogo se ofrece y se busca.
    const paquete = path.join(RAIZ, 'media', 'harness', 'node_modules', '@ericrisco', 'rsc');
    if (!fs.existsSync(path.join(paquete, 'manifest.json'))) return 'SALTADA';
    const manifiesto = JSON.parse(fs.readFileSync(path.join(paquete, 'manifest.json'), 'utf8'));
    const tabla = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'nombres.json'), 'utf8'));
    const catalogo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'capacidades.json'), 'utf8')).capacidades;

    const enElCatalogo = new Set(catalogo.map((c) => c.id));
    const fontaneria = new Set(tabla.fontaneria);
    const sinMonton = manifiesto.skills.map((s) => s.id).filter((id) => !enElCatalogo.has(id) && !fontaneria.has(id));
    assert.deepEqual(sinMonton, [], `ni en el catálogo ni en la fontanería: ${sinMonton.join(', ')}`);

    const enLosDos = [...fontaneria].filter((id) => enElCatalogo.has(id));
    assert.deepEqual(enLosDos, [], `en los dos montones a la vez: ${enLosDos.join(', ')}`);

    // Y las cuatro que lo destaparon, cada una donde le toca: se piden por su
    // nombre, así que van al catálogo y no a la fontanería.
    for (const id of ['bro', 'eli5', 'show-me', 'unslop']) {
      assert.ok(enElCatalogo.has(id), `${id} viene con todo arnés y no está en el catálogo`);
    }
    return `${manifiesto.skills.length} habilidades: ${catalogo.length} en el catálogo y ${fontaneria.size} de fontanería`;
  });

  await comprobar('lo que el arnés hace solo se nombra, y lo apagado se dice en español', () => {
    // Además de los tres frenos, el arnés engancha piezas que no paran nada:
    // la brújula al empezar, el aviso del diario, la memoria… No se nombraban.
    // Y lo apagado se leía solo de .rsc.json y con el identificador en clave.
    const reglas = cargar('reglas');
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'automatismos-'));
    fs2.mkdirSync(path.join(carpeta, '.rsc'), { recursive: true });
    fs2.mkdirSync(path.join(carpeta, '02-DOCS', 'wiki', 'harness'), { recursive: true });
    fs2.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'], optOuts: ['context7', 'gitmoji'] }));
    for (const f of ['session-start.mjs', 'worklog-checkpoint.mjs', 'userprompt-gate.mjs', 'worktree-reaper.mjs', 'session-memory.mjs', 'gitmoji-guard.mjs']) {
      fs2.writeFileSync(path.join(carpeta, '.rsc', f), '// pieza del arnés');
    }
    for (const s of ['.no-gitmoji', '.no-context7', '.no-worktree-cleanup', '.no-audit']) fs2.writeFileSync(path.join(carpeta, '.rsc', s), '');
    fs2.writeFileSync(path.join(carpeta, '02-DOCS', 'wiki', 'harness', 'installation-plan.md'), '# Plan\n');

    vscode.guion.raiz = carpeta;
    try {
      const auto = Object.fromEntries(reglas.losAutomatismos().map((a) => [a.id, a]));
      assert.equal(Object.keys(auto).length, 9, 'los ocho de fichero más context7, que aquí tiene interruptor');
      assert.equal(auto['session-start'].nombre, 'La brújula al empezar');
      assert.equal(auto['session-start'].estado, 'activo');
      assert.equal(auto['worktree-reaper'].estado, 'apagado', 'su interruptor está en disco');
      assert.equal(auto['audit'].estado, 'apagado');
      assert.equal(auto['scope-check'].estado, 'activo', 'sin interruptor, activo');
      assert.equal(auto['context7'].estado, 'apagado', 'context7 se nombra cuando hay algo que explicar');
      for (const a of Object.values(auto)) assert.ok(a.nombre && a.queHace && !/[a-z]-[a-z]/.test(a.nombre), `${a.id} sin nombre en español`);

      const apagado = reglas.loApagado().map((a) => a.nombre);
      assert.ok(apagado.includes('Formato al guardar en git'), 'gitmoji, por su nombre de guardián');
      assert.ok(apagado.includes('Documentación al día (context7)'));
      assert.ok(apagado.includes('Recogida de copias de trabajo'));
      assert.ok(apagado.includes('La revisión periódica de habilidades'));
      assert.equal(new Set(apagado).size, apagado.length, 'sin repetir lo que está en .rsc.json y en disco a la vez');
      assert.ok(!apagado.includes('gitmoji') && !apagado.includes('context7'), 'ninguno con el identificador a secas');

      assert.ok(reglas.dondeVive('plan'), 'el plan de montaje se puede abrir');

      // Sin fichero, context7 no se menciona: no hay nada que explicar.
      fs2.rmSync(path.join(carpeta, '.rsc', '.no-context7'));
      assert.ok(!reglas.losAutomatismos().some((a) => a.id === 'context7'));
    } finally {
      vscode.guion.raiz = empresa;
    }

    // Y las ideas de automatización que el asistente apunta y nadie leía.
    const consejos = cargar('consejos');
    const idea = consejos.consejos({ huecosDeAutomatizacion: 2 }).find((c) => c.id === 'huecos-de-automatizacion');
    assert.ok(idea, 'con propuestas apuntadas hay consejo');
    assert.match(idea.texto, /2 ideas de automatización/);
    assert.ok(!consejos.consejos({ huecosDeAutomatizacion: 0 }).some((c) => c.id === 'huecos-de-automatizacion'), 'y sin ellas, nada');
    return 'nueve automatismos con nombre, cuatro apagados dichos en español';
  });

  await comprobar('la cara sale de la web al momento, y no pisa la puesta a mano', async () => {
    // Jose, 21-09-2026: «cuando dices la web en el init no te adapta la
    // interfaz […] debería ejecutarse en el init porque ya tienes la web». La
    // barra saca un primer intento ella misma; el asistente lo afina después.
    const web = cargar('web');
    const html = `<!doctype html><html><head>
      <title>Inicio | Ferretería Soler</title>
      <meta property="og:site_name" content="Ferretería Soler">
      <meta name="theme-color" content="#ffffff">
      <link rel="stylesheet" href="/css/main.css">
      <link rel="icon" href="/favicon.ico">
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/logo-180.png">
      <style>:root{--color-primary:#d84315;--background:#fff} body{color:#222}</style>
      </head><body></body></html>`;
    const leido = web.extraer(html, 'https://ferreteriasoler.es/');
    assert.equal(leido.nombre, 'Ferretería Soler', 'og:site_name manda');
    assert.equal(leido.acento, '#d84315', 'el theme-color blanco no vale; manda la variable de marca');
    assert.equal(leido.fondo, '#ffffff', '#fff se expande');
    assert.equal(leido.texto, '#222222');
    assert.equal(leido.logo && leido.logo.url, 'https://ferreteriasoler.es/icons/logo-180.png', 'el icono grande, no el .ico');
    assert.deepEqual(leido.hojas, ['https://ferreteriasoler.es/css/main.css']);
    assert.equal(web.nombreDelTitulo('Inicio | Ferretería Soler'), 'Ferretería Soler', 'la coletilla de menú se cae');
    assert.equal(web.normalizar('rgb(216, 67, 21)'), '#d84315');
    assert.ok(web.esGris('#777777') && web.esGris('#000') && !web.esGris('#d84315'));

    // Escribirla en una carpeta de mentira, con una red de mentira.
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'cara-'));
    fs2.mkdirSync(path.join(carpeta, '02-DOCS', 'wiki'), { recursive: true });
    const png = Buffer.from('89504e470d0a1a0a', 'hex');
    const bajar = async (url) => {
      if (url.endsWith('.png')) return { cuerpo: png, tipo: 'image/png', url };
      if (url.endsWith('.css')) return { cuerpo: Buffer.from(''), tipo: 'text/css', url };
      return { cuerpo: Buffer.from(html), tipo: 'text/html; charset=utf-8', url };
    };
    const registro = path.join(carpeta, '02-DOCS', 'wiki', 'brand', 'marca.md');
    vscode.guion.raiz = carpeta;
    try {
      const cara = await web.sacarLaCara('https://ferreteriasoler.es', { bajar });
      assert.ok(cara.ok, cara.motivo);
      assert.equal(cara.nombre, 'Ferretería Soler');
      const suya = cargar('marca').leer();
      assert.ok(suya && suya.tokens, 'marca.leer la entiende y saca paleta');
      assert.equal(suya.nombre, 'Ferretería Soler');
      assert.equal(suya.web, 'https://ferreteriasoler.es');
      assert.ok(suya.provisional, 'y sabe que es un primer intento');

      assert.ok(fs2.existsSync(path.join(carpeta, '02-DOCS', 'wiki', 'brand', 'logo.png')), 'el logotipo se guarda al lado');

      // Un segundo intento reescribe el provisional; una cara a mano, no.
      assert.ok((await web.sacarLaCara('https://ferreteriasoler.es', { bajar })).ok, 'lo provisional se puede rehacer');
      fs2.writeFileSync(registro, fs2.readFileSync(registro, 'utf8').replace('provisional: si\n', ''));
      const otra = await web.sacarLaCara('https://ferreteriasoler.es', { bajar });
      assert.ok(!otra.ok && /a mano/.test(otra.motivo), 'la puesta a mano no se pisa');

      // Sin red no pasa nada, y una web sin color de marca tampoco escribe.
      fs2.rmSync(path.join(carpeta, '02-DOCS', 'wiki', 'brand'), { recursive: true });
      const sinRed = await web.sacarLaCara('https://ferreteriasoler.es', { bajar: async () => { throw new Error('sin red'); } });
      assert.ok(!sinRed.ok && /sin red/.test(sinRed.motivo));
      const gris = '<html><head><meta name="theme-color" content="#777"><title>Gris</title></head><body></body></html>';
      const sinColor = await web.sacarLaCara('https://gris.es', { bajar: async (url) => ({ cuerpo: Buffer.from(gris), tipo: 'text/html', url }) });
      assert.ok(!sinColor.ok, 'un gris no es un color de marca');
      assert.ok(!fs2.existsSync(registro), 'y no se escribió nada');

      // Y el nombre sale de una web ajena, que acaba en una cabecera donde
      // cada línea es un campo: un `<title>` partido —HTML normal, lo escribe
      // cualquier formateador— dejaba el nombre en la primera palabra y lo de
      // después se colaba como si fuera otro campo.
      const conSalto = '<!doctype html><html><head><title>Casa\n  Pepe\nlogo: /etc/passwd</title>'
        + '<meta name="theme-color" content="#d84315"></head><body></body></html>';
      await web.sacarLaCara('https://otra.es', { bajar: async (url) => ({ cuerpo: Buffer.from(conSalto), tipo: 'text/html', url }) });
      const rara = cargar('marca').leer();
      assert.equal(rara.nombre, 'Casa Pepe logo: /etc/passwd', 'todo en una línea, y como nombre, no como campo');
      assert.equal(rara.logo, null, 'lo que parecía otro campo no se ha colado');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'colores, nombre y logotipo de la portada; sin pisar lo puesto a mano';
  });

  await comprobar('el socorro sale también en la pantalla sin arnés', () => {
    // La captura de Jose: «No he podido montar el arnés. Pulsa "Algo va mal"»
    // y sin el botón. Venía de una barra anterior al 19-09 (99dfa57); esto lo
    // deja vigilado en la pantalla exacta donde pasó. Y esa pantalla llama a la
    // radiografía por su único nombre, no por un cuarto.
    const p = require('./panel-falso').montarPanel();
    p.mandar({
      tipo: 'estado',
      estado: { sinArnes: true, donde: 'Aquí ya hay trabajo tuyo', aviso: 'Puedo añadir el asistente', yaEmpezada: { cuantos: 13, claves: 12 } },
      acciones: [], modo: 'sencillo', marcaPuesta: true, comoSeLlama: 'tu trabajo', pulso: [],
    });
    const pintado = p.mandar({ tipo: 'aviso', texto: 'No he podido montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor.', malo: true });
    assert.match(pintado, /aviso malo/, 'el aviso se pinta como malo');
    assert.ok((pintado.match(/Algo va mal/g) || []).length >= 2, 'y trae el botón que nombra, no solo el texto');
    assert.ok(!/Ver qué hay aquí/.test(pintado), 'la radiografía ya no tiene un cuarto nombre');
    assert.match(pintado, /Qué falta por montar/);
    return 'botón donde se le nombra';
  });

  await comprobar('cada clave suelta sabe a qué herramienta va', async () => {
    // Jose, 21-09-2026, con una captura: sus claves vivían en un `.env.local`
    // de la raíz —Replicate, Pexels, Buffer, Drive, Telegram juntas— y la
    // barra decía «faltan claves» de una herramienta que funcionaba, y no
    // enseñaba a Pexels por ningún lado (decisión 104).
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'claves-'));
    const escribir = (relativa, texto) => {
      fs2.mkdirSync(path.dirname(path.join(carpeta, relativa)), { recursive: true });
      fs2.writeFileSync(path.join(carpeta, relativa), texto);
    };
    escribir('.rsc.json', JSON.stringify({ version: 1, targets: ['claude'] }));
    escribir('.env.local', [
      'PEXELS_API_KEY=eWsecreto',
      'NEXT_PUBLIC_BUFFER_API_KEY=-jota',
      'TELEGRAM_TOKEN=87secreto',
      'PORT=3000',
    ].join('\n'));
    // Una herramienta montada, con su clave guardada dentro de su propia
    // carpeta pero con otro nombre de fichero: ni la barra ni su prueba de
    // conexión leen un `.env.local`, así que también está fuera de sitio.
    escribir('01-TOOLS/REPLICATE/.env.example', 'REPLICATE_API_KEY=\n');
    escribir('01-TOOLS/REPLICATE/.env.local', 'REPLICATE_API_KEY=r8_secretodeverdad\n');
    escribir('01-TOOLS/MAGNIFIC/.env.example', 'MAGNIFIC_API_KEY=\n');
    escribir('01-TOOLS/MAGNIFIC/.env', 'MAGNIFIC_API_KEY=puesta\n');
    escribir('auto/.env', 'DRIVE_FOLDER_ID=1abc\n');

    vscode.guion.raiz = carpeta;
    try {
      const sueltasM = cargar('sueltas');
      const hay = sueltasM.resumen();
      assert.ok(hay, 'con claves fuera de sitio hay resumen');
      assert.deepEqual(hay.ficheros.sort(), ['.env.local', '01-TOOLS/REPLICATE/.env.local', 'auto/.env'].sort(),
        'raíz, carpeta de primer nivel y dentro de una herramienta');
      assert.ok(!hay.prompt.includes('r8_secretodeverdad') && !hay.prompt.includes('eWsecreto'), 'ningún valor viaja al asistente');

      const porNombre = Object.fromEntries(hay.reparto.map((g) => [g.herramienta, g]));
      assert.ok(porNombre.REPLICATE.existe, 'REPLICATE ya tiene carpeta');
      assert.ok(porNombre.REPLICATE.claves.includes('REPLICATE_API_KEY'));
      assert.ok(!porNombre.PEXELS.existe, 'PEXELS no la tiene: por montar');
      assert.ok(porNombre.BUFFER, 'el prefijo del framework no tapa al proveedor');
      assert.ok(porNombre.TELEGRAM && porNombre.DRIVE, 'y los demás salen por su prefijo');
      assert.ok(hay.sinDueno.some((x) => x.nombre === 'PORT'), 'lo que no dice de quién es se pregunta');
      assert.ok(!Object.keys(porNombre).includes('PORT'));
      assert.deepEqual(hay.porMontar.map((p) => p.herramienta).sort(), ['BUFFER', 'DRIVE', 'PEXELS', 'TELEGRAM'],
        'las que existen por sus claves y no tienen carpeta');
      assert.match(hay.prompt, /01-TOOLS\/REPLICATE\/\.env, que ya existe/);
      assert.match(hay.prompt, /01-TOOLS\/PEXELS\/, que no existe/);
      assert.match(hay.prompt, /_TEMPLATE/);

      // El prefijo, por separado: es lo que decide el reparto.
      assert.equal(sueltasM.prefijoDe('NEXT_PUBLIC_BUFFER_API_KEY'), 'BUFFER');
      assert.equal(sueltasM.prefijoDe('PEXELS_API_KEY'), 'PEXELS');
      assert.equal(sueltasM.prefijoDe('DATABASE_URL'), null, 'no dice de quién es');
      assert.equal(sueltasM.prefijoDe('TOKEN'), null);

      // Y la herramienta no dice «falta»: dice que está, pero en otro sitio.
      const conexionesM = cargar('conexiones');
      const replicate = conexionesM.proveedores().find((p) => p.id === 'REPLICATE');
      assert.equal(replicate.faltan, 0, 'no le falta nada: la tiene, mal guardada');
      assert.equal(replicate.fueraDeSitio, 1);
      const clave = conexionesM.claves('REPLICATE').claves.find((c) => c.clave === 'REPLICATE_API_KEY');
      assert.ok(!clave.puesta && /en su carpeta, con otro nombre/.test(clave.fuera), `dice dónde está: ${clave.fuera}`);
      const magnific = conexionesM.proveedores().find((p) => p.id === 'MAGNIFIC');
      assert.equal(magnific.fueraDeSitio, 0, 'una bien puesta no se marca');

      // Una clave del entorno del ordenador («las globales») cuenta igual.
      process.env.MAGNIFIC_OTRA = 'x';
      escribir('01-TOOLS/MAGNIFIC/.env.example', 'MAGNIFIC_API_KEY=\nMAGNIFIC_OTRA=\n');
      try {
        const otra = cargar('conexiones').claves('MAGNIFIC').claves.find((c) => c.clave === 'MAGNIFIC_OTRA');
        assert.match(otra.fuera || '', /en tu ordenador/, 'una global se dice, no se cuenta como que falta');
      } finally {
        delete process.env.MAGNIFIC_OTRA;
      }

      // Y la pantalla lo pinta sin escribir jerga.
      const p = require('./panel-falso').montarPanel();
      const pintado = p.mandar({ tipo: 'conexiones', proveedores: cargar('conexiones').proveedores(), sueltas: hay });
      assert.match(pintado, /Por montar/);
      assert.match(pintado, /PEXELS/);
      assert.match(pintado, /puesta, pero fuera de su sitio/i);
      // Lo que el alumno VE, que es el HTML sin los encargos: esos viajan
      // dentro de `data-accion` y están escritos para el asistente, que sí
      // necesita leer «.env» y las rutas.
      const aLaVista = pintado.replace(/data-accion="[^"]*"/g, '');
      assert.ok(!/\.env/.test(aLaVista), 'sin nombrar ficheros de configuración en pantalla');
      assert.ok(/\.env/.test(pintado), 'pero el encargo al asistente sí los nombra');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'raíz, carpeta y herramienta · 4 por montar · 1 puesta fuera de su sitio';
  });

  await comprobar('una credencial que es un fichero entero también tiene sitio', async () => {
    // La otra mitad de la 104: una cuenta de servicio de Google o un .pem no
    // es una línea `CLAVE=valor`, es un fichero. Sin esto, un Drive conectado
    // con cuenta de servicio salía «sin conectar» y el fichero que lo
    // autentica no aparecía en ningún sitio (decisión 105, spec
    // 02-DOCS/wiki/sdd/specs/credenciales-que-no-son-variables.md).
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'ficheros-'));
    const escribir = (relativa, texto) => {
      fs2.mkdirSync(path.dirname(path.join(carpeta, relativa)), { recursive: true });
      fs2.writeFileSync(path.join(carpeta, relativa), texto);
    };
    const SECRETO = '-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANB_esto_es_secreto\\n-----END PRIVATE KEY-----\\n';
    escribir('.rsc.json', JSON.stringify({ version: 1, targets: ['claude'] }));
    // A1: una cuenta de servicio en la raíz.
    escribir('credentials.json', JSON.stringify({
      type: 'service_account', project_id: 'mi-drive', private_key: SECRETO,
      client_email: 'robot@mi-drive.iam.gserviceaccount.com',
    }, null, 2));
    // Y una cuenta de un proyecto que no es de nadie de aquí: se pregunta.
    escribir('ajena.json', JSON.stringify({
      type: 'service_account', private_key: SECRETO,
      client_email: 'bot@contabilidad-nube.iam.gserviceaccount.com',
    }));
    // A2: un .pem en una carpeta de primer nivel, y dos .json que NO cuentan.
    escribir('auto/publicar.pem', '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----\n');
    escribir('package.json', JSON.stringify({ name: 'lo-mio', version: '1.0.0', private: true }));
    escribir('auto/tsconfig.json', JSON.stringify({ compilerOptions: { strict: true } }));
    // Uno suelto dentro de una herramienta, y otro ya en su sitio.
    escribir('01-TOOLS/DRIVE/.env.example', 'DRIVE_FOLDER_ID=\n');
    escribir('01-TOOLS/DRIVE/serviceAccountKey.json', JSON.stringify({ type: 'service_account', private_key: SECRETO, client_email: 'x@otro.iam.gserviceaccount.com' }));
    // El caso puro de A5: se autentica SOLO con el fichero, su .env no pide nada.
    escribir('01-TOOLS/SHEETS/.env.example', '# SHEETS se autentica con la cuenta de servicio de keys/\n');
    escribir('01-TOOLS/SHEETS/keys/cuenta.json', JSON.stringify({ type: 'service_account', private_key: SECRETO, client_email: 'y@sheets.iam.gserviceaccount.com' }));
    // Y el caso mixto: tiene su fichero y además le falta una clave de verdad.
    escribir('01-TOOLS/MAGNIFIC/.env.example', 'MAGNIFIC_API_KEY=\n');
    escribir('01-TOOLS/MAGNIFIC/keys/cuenta.json', JSON.stringify({ type: 'service_account', private_key: SECRETO, client_email: 'y@magnific.iam.gserviceaccount.com' }));

    vscode.guion.raiz = carpeta;
    try {
      const sueltasM = cargar('sueltas');
      const encontrados = sueltasM.ficherosDeAcceso();
      const porDonde = Object.fromEntries(encontrados.map((f) => [f.donde, f]));

      // A1 · dicha por lo que es, no por su extensión.
      assert.ok(porDonde['credentials.json'], 'la cuenta de servicio de la raíz se encuentra');
      assert.equal(porDonde['credentials.json'].queEs, 'Una cuenta de servicio de Google');
      // A2 · el .pem sí; package.json y tsconfig.json no.
      assert.ok(porDonde['auto/publicar.pem'], 'un .pem cuenta por su nombre');
      assert.ok(!porDonde['package.json'] && !porDonde['auto/tsconfig.json'], 'un .json cualquiera no es una credencial');
      // A3 · de quién es cada uno, y el emparejamiento es por trozos enteros:
      // `mi-drive` casa con DRIVE, `mi-drive-viejo` también (lleva el trozo),
      // pero `midrive` no, porque entonces `API` casaría con cualquier cosa.
      assert.equal(porDonde['01-TOOLS/DRIVE/serviceAccountKey.json'].herramienta, 'DRIVE', 'está en su carpeta, pero fuera de keys/');
      assert.equal(porDonde['credentials.json'].herramienta, 'DRIVE', 'la cuenta dice el proyecto: mi-drive');
      assert.equal(porDonde['credentials.json'].por, 'lo dice la cuenta');
      assert.equal(porDonde['ajena.json'].herramienta, null, 'una cuenta de otro proyecto no se le cuelga a nadie: se pregunta');
      // A5 · lo que ya está en su sitio no se cuenta como desorden.
      assert.ok(!porDonde['01-TOOLS/SHEETS/keys/cuenta.json'] && !porDonde['01-TOOLS/MAGNIFIC/keys/cuenta.json'],
        'lo que está en keys/ está en su casa, no es desorden');
      assert.equal(sueltasM.tieneSuFichero('SHEETS'), 1);
      assert.equal(sueltasM.tieneSuFichero('DRIVE'), 0);

      // C4 · lo que se lee de dentro no sale de la función.
      const hay = sueltasM.resumen();
      assert.ok(hay, 'con ficheros de acceso fuera de sitio hay resumen aunque no haya claves sueltas');
      assert.ok(!hay.prompt.includes('esto_es_secreto') && !hay.prompt.includes('BEGIN'), 'ningún contenido viaja al asistente');
      assert.ok(!JSON.stringify(encontrados).includes('esto_es_secreto'), 'ni sale del inventario');
      // A4 · el encargo dice el destino.
      assert.match(hay.prompt, /01-TOOLS\/DRIVE\/keys\//);
      assert.match(hay.prompt, /No abras ni me pegues el contenido/);
      assert.match(hay.prompt, /pregúntamelo antes de moverlo/, 'y pregunta por el que no sabe de quién es');
      // Sin ni una clave suelta, el encargo no puede abrir con «hay 0 claves
      // guardadas fuera de su sitio, en: .» — lo pilló `review`.
      assert.ok(!/hay 0 claves/i.test(hay.prompt) && !/en: \./.test(hay.prompt), 'y no abre con una frase vacía');
      assert.equal(hay.claves, 0, 'aquí no hay ninguna clave suelta: solo ficheros');

      // A5 · la conexión con su fichero no está «sin conectar». Y si además le
      // falta una clave de verdad, manda lo que falta: es lo que bloquea (C5).
      const conexionesM = cargar('conexiones');
      const deProveedor = Object.fromEntries(conexionesM.proveedores().map((x) => [x.id, x]));
      assert.equal(deProveedor.SHEETS.conFichero, 1, 'SHEETS se autentica con su fichero');
      assert.equal(deProveedor.SHEETS.faltan, 0, 'y no le falta ninguna clave');
      assert.equal(deProveedor.MAGNIFIC.conFichero, 1);
      assert.equal(deProveedor.MAGNIFIC.faltan, 1, 'a MAGNIFIC le falta una de verdad');
      const p = require('./panel-falso').montarPanel();
      const pintado = p.mandar({ tipo: 'conexiones', proveedores: conexionesM.proveedores(), sueltas: hay });
      // El rótulo lleva el nombre humanizado de la herramienta («Sheets»), no
      // su identificador: es lo que ya hacía `etiquetaDeProveedor`.
      assert.match(pintado, /Sheets — con su fichero de acceso/i);
      assert.match(pintado, /Magnific — falta una clave/i, 'lo que bloquea manda sobre lo que ya está');
      assert.match(pintado, /ficheros de acceso fuera de sitio/);
      assert.match(pintado, /cuenta de servicio de Google/i);
      // A7 · nada de jerga en lo que se ve.
      // A7 · nada de jerga a la vista. «Certificado digital» sí: un gestor
      // español tiene uno de la FNMT y lo usa para Hacienda (C6). «Clave
      // privada» no, que además choca con «clave de acceso».
      const aLaVista = pintado.replace(/data-accion="[^"]*"/g, '');
      assert.ok(!/\.json|\.pem|clave privada|keys\//i.test(aLaVista), 'sin extensiones, carpetas ni jerga en pantalla');
      assert.match(aLaVista, /certificado digital/i, 'y el .pem se dice como lo que es');

      // A6 · si están en el historial, el mismo aviso (hueco que encontró `analyze`).
      const cp = require('node:child_process');
      const git = (...args) => cp.spawnSync('git', args, { cwd: carpeta, encoding: 'utf8' });
      if (git('init', '-q').status === 0) {
        git('add', '-f', 'credentials.json');
        const guardadas = cargar('sueltas').resumen();
        assert.equal(guardadas.subidas, 1, 'una cuenta de servicio en el historial se ve');
        assert.match(guardadas.prompt, /AVISO IMPORTANTE/);
      }
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'cuenta de servicio · .pem · lo que está en su sitio no molesta · nada del contenido sale';
  });

  await comprobar('las pruebas no corren contra una copia vieja de lo común', () => {
    // `instalador/comun/` es la fuente; `extension/media/comun/` la genera
    // `preparar-paquete.js` al empaquetar, y está ignorada a propósito para no
    // tener dos copias en el repositorio. Eso ya está bien pensado.
    //
    // Lo que no cubría nadie: **las pruebas importan la copia generada**, no la
    // fuente. Si alguien toca `instalador/comun/` y no vuelve a empaquetar, la
    // suite da por bueno código que ya no existe — y el empaquetado sí llevaría
    // el nuevo. Un verde que no prueba lo que se publica es peor que un rojo.
    const fs2 = require('node:fs');
    const fuente = path.join(RAIZ, '..', 'instalador', 'comun');
    const copia = path.join(RAIZ, 'media', 'comun');
    if (!fs2.existsSync(fuente) || !fs2.existsSync(copia)) return 'SALTADA';

    const suyos = fs2.readdirSync(copia).filter((f) => f.endsWith('.js'));
    assert.ok(suyos.length, 'la barra lleva alguno');
    for (const fichero of suyos) {
      const alla = path.join(fuente, fichero);
      assert.ok(fs2.existsSync(alla), `${fichero} está en la copia y ya no en instalador/comun/`);
      assert.equal(
        fs2.readFileSync(path.join(copia, fichero), 'utf8'),
        fs2.readFileSync(alla, 'utf8'),
        `${fichero}: la copia que prueban las pruebas está vieja. Vuelve a empaquetar.`,
      );
    }
    return `${suyos.length} ficheros comunes, y la copia probada es la de ahora`;
  });

  await comprobar('el puente no abre una conversación en blanco', async () => {
    // Ya pasó y costó tres versiones: un botón mandaba `undefined` y esa
    // palabra acabó escrita en la caja de Claude. Hay una prueba que vigila el
    // lado de quien llama; esta vigila el otro, que es donde se sabe de verdad.
    const puente = cargar('puente');
    const callar = { appendLine() {} };
    for (const nada of ['', '   ', '\n\t ', undefined, null]) {
      assert.equal(await puente.enviar(nada, callar), 'vacio', `manda ${JSON.stringify(nada)} a la conversación`);
    }
    assert.notEqual(await puente.enviar('esto sí', callar), 'vacio', 'y lo que tiene texto sí va');
    return 'cinco formas de no decir nada, y ninguna abre el chat';
  });

  await comprobar('un git que no sabe quién eres no es un callejón', async () => {
    // Un Mac recién estrenado trae git pero sin nombre ni correo puestos, y
    // `iniciar()` solo los pone cuando el historial lo creamos nosotros. En una
    // carpeta que ya tenía git, el primer «Guardar en git» se caía con «Please
    // tell me who you are» y el alumno recibía «No puedo guardar copias en este
    // ordenador. Pulsa Algo va mal»: un callejón por algo que se arregla con
    // una orden (decisión 112, y la misma regla que git en la decisión 26).
    const fs2 = require('node:fs');
    const cp = require('node:child_process');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'sin-identidad-'));
    const git = (...args) => cp.spawnSync('git', args, { cwd: carpeta, encoding: 'utf8' });
    if (git('init', '-q', '.').status !== 0) return 'SALTADA';
    // Vaciarlas es lo más parecido a no tenerlas que se puede montar aquí sin
    // tocar el git de quien corre esto.
    git('config', 'user.email', '');
    git('config', 'user.name', '');
    fs2.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    fs2.writeFileSync(path.join(carpeta, 'algo.md'), 'hola');

    const globalAntes = cp.spawnSync('git', ['config', '--global', 'user.name'], { encoding: 'utf8' }).stdout;
    vscode.guion.raiz = carpeta;
    try {
      const hecho = await cargar('guardar').guardar('mi primera copia');
      assert.equal(hecho.ok, true, `se queda en un callejón: ${hecho.mensaje}`);
      assert.ok(!/Algo va mal/.test(hecho.mensaje || ''), 'y no manda al tutor por esto');

      const log = git('log', '--pretty=%an <%ae> — %s').stdout.trim();
      assert.match(log, /Executive Lab <alumno@executivelab\.local>/, 'firma con la identidad del arnés');
      assert.match(log, /mi primera copia/);

      // Y solo en esta carpeta: el git de quien esté delante no se toca (P4).
      const globalDespues = cp.spawnSync('git', ['config', '--global', 'user.name'], { encoding: 'utf8' }).stdout;
      assert.equal(globalDespues, globalAntes, 'el nombre de git de esa persona se queda como estaba');
      assert.equal(git('config', '--local', 'user.name').stdout.trim(), 'Executive Lab', 'se puso solo aquí');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'guarda, firma con el arnés y no toca el git de nadie';
  });

  await comprobar('un enganche que apunta al ordenador de otro se arregla', () => {
    // `.claude/settings.json` viaja en git —es la costura del arnés— y dentro
    // van los enganches, que en cuanto se arreglan una vez llevan una ruta
    // absoluta. Quien clonaba el proyecto de un compañero se llevaba los
    // enganches apuntando al Mac de ese compañero, y esto no volvía a tocarlos
    // porque solo miraba los que empiezan por `node` a secas. El arnés se
    // quedaba sin cuerpo siempre-activo, sin brújula y sin frenos, callado.
    const fs2 = require('node:fs');
    const { fijarElNodeDeLosEnganches } = require(path.join(RAIZ, 'media', 'comun', 'enganches.js'));
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'enganches-'));
    fs2.mkdirSync(path.join(carpeta, '.claude'), { recursive: true });
    const fichero = path.join(carpeta, '.claude', 'settings.json');
    const elNuestro = process.execPath;
    const deOtroMac = '/Users/otra-persona/Library/Application Support/ExecutiveLab/runtime/bin/node';

    const escribir = (ordenes) => fs2.writeFileSync(fichero, JSON.stringify({
      hooks: { SessionStart: [{ hooks: ordenes.map((command) => ({ type: 'command', command })) }] },
    }, null, 2));
    const leer = () => JSON.parse(fs2.readFileSync(fichero, 'utf8')).hooks.SessionStart[0].hooks.map((h) => h.command);

    // 1. `node` a secas: se fija, como siempre.
    escribir(['node "${CLAUDE_PROJECT_DIR}/.rsc/session-start.mjs"']);
    fijarElNodeDeLosEnganches(carpeta, elNuestro);
    assert.ok(leer()[0].startsWith(`"${elNuestro}"`) || leer()[0].startsWith(elNuestro), 'node a secas se fija');
    assert.match(leer()[0], /session-start\.mjs/, 'y el resto de la orden no se toca');

    // 2. La ruta de otro ordenador, que antes se quedaba para siempre.
    escribir([`"${deOtroMac}" "\${CLAUDE_PROJECT_DIR}/.rsc/session-start.mjs"`]);
    fijarElNodeDeLosEnganches(carpeta, elNuestro);
    assert.ok(!leer()[0].includes('otra-persona'), 'la ruta heredada se sustituye');
    assert.match(leer()[0], /session-start\.mjs/);

    // 3. Sin comillas, que también se escribe así.
    escribir([`/opt/nodejs/bin/node "\${CLAUDE_PROJECT_DIR}/.rsc/worklog-checkpoint.mjs"`]);
    fijarElNodeDeLosEnganches(carpeta, elNuestro);
    assert.ok(!leer()[0].includes('/opt/nodejs'), 'sin comillas también');

    // 4. Una ruta que SÍ existe en este ordenador no se toca: puede ser el
    //    node bueno de esa máquina, puesto a mano.
    escribir([`"${elNuestro}" "\${CLAUDE_PROJECT_DIR}/.rsc/session-start.mjs"`]);
    const antes = leer()[0];
    fijarElNodeDeLosEnganches(carpeta, '/otro/node/cualquiera');
    assert.equal(leer()[0], antes, 'lo que funciona aquí se respeta');

    // 5. Y lo que no es un enganche de node no se toca jamás.
    escribir(['npm run algo', 'python3 loquesea.py']);
    fijarElNodeDeLosEnganches(carpeta, elNuestro);
    assert.deepEqual(leer(), ['npm run algo', 'python3 loquesea.py'], 'lo que no es node se deja en paz');

    return 'node a secas · ruta heredada · sin comillas · la que vale se respeta';
  });

  await comprobar('el arreglo de cada máquina deja de contar como un cambio suyo', () => {
    // Arreglar la ruta deja `.claude/settings.json` distinto del que hay en el
    // repositorio, y ese fichero está versionado. Así que salía SIEMPRE como
    // modificado, en todas las máquinas y para siempre — y el botón de guardar
    // de la barra hace `add -A`: tarde o temprano alguien sube la ruta de su
    // casa y se la lleva el siguiente al clonar.
    //
    // No hay una ruta mejor que elegir: el node bueno está en un sitio distinto
    // en cada ordenador, que es la razón de que este módulo exista. Lo que se
    // hace es marcarlo como visto en ESE clon, que es una marca local y no viaja.
    const fs2 = require('node:fs');
    const cp = require('node:child_process');
    const { fijarElNodeDeLosEnganches } = require(path.join(RAIZ, 'media', 'comun', 'enganches.js'));

    const casa = fs2.mkdtempSync(path.join(os.tmpdir(), 'enganches-git-'));
    const git = (...args) => cp.execFileSync('git', ['-C', casa, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    git('init', '-q');
    git('config', 'user.email', 'prueba@executivelab.ai');
    git('config', 'user.name', 'Prueba');

    const fichero = path.join(casa, '.claude', 'settings.json');
    fs2.mkdirSync(path.dirname(fichero), { recursive: true });
    const conOrden = (orden) => JSON.stringify({
      hooks: { SessionStart: [{ hooks: [{ type: 'command', command: orden }] }] },
    }, null, 2);

    // El repositorio guarda la forma portable, que es la que escribe RSC.
    fs2.writeFileSync(fichero, conOrden('node "${CLAUDE_PROJECT_DIR}/.rsc/session-start.mjs"'));
    git('add', '-A');
    git('commit', '-q', '-m', 'la costura del arnés, como la deja RSC');
    assert.equal(git('status', '--porcelain').trim(), '', 'se parte de un árbol limpio');

    // Y esta máquina se arregla la suya.
    const elNuestro = process.execPath;
    fijarElNodeDeLosEnganches(casa, elNuestro);

    const enDisco = JSON.parse(fs2.readFileSync(fichero, 'utf8')).hooks.SessionStart[0].hooks[0].command;
    assert.ok(enDisco.includes(elNuestro), 'en el disco queda el node de esta máquina');
    assert.equal(git('status', '--porcelain').trim(), '', 'y git ya no lo cuenta como un cambio tuyo');
    assert.match(git('ls-files', '-v', '.claude/settings.json'), /^S/, 'está marcado, no borrado ni ignorado');

    // Lo que ve quien clone sigue siendo la forma portable: la marca es de
    // este clon y no viaja.
    assert.match(git('show', 'HEAD:.claude/settings.json'), /"command": "node /, 'el repositorio conserva lo portable');

    // Y un fichero que no está en git no se toca: es el caso de casi todos los
    // alumnos, cuya carpeta todavía no es un repositorio.
    const suelta = fs2.mkdtempSync(path.join(os.tmpdir(), 'enganches-sin-git-'));
    fs2.mkdirSync(path.join(suelta, '.claude'), { recursive: true });
    fs2.writeFileSync(path.join(suelta, '.claude', 'settings.json'), conOrden('node "${CLAUDE_PROJECT_DIR}/.rsc/session-start.mjs"'));
    assert.doesNotThrow(() => fijarElNodeDeLosEnganches(suelta, elNuestro), 'sin repositorio no se cae');
    assert.ok(
      JSON.parse(fs2.readFileSync(path.join(suelta, '.claude', 'settings.json'), 'utf8'))
        .hooks.SessionStart[0].hooks[0].command.includes(elNuestro),
      'y el enganche se arregla igual',
    );

    return 'el disco con su ruta, git en silencio, y el repositorio portable';
  });

  await comprobar('unos raíles de la semana pasada se ven, y se reponen', async () => {
    // F13 de la auditoría, y hoy muerde de verdad: los raíles los copia el
    // wizard al montar, con los que llevara la barra ese día. Al subir de
    // versión, las carpetas de antes se quedan con las reglas viejas y la
    // barra decía «Puesto» — el asistente leyendo lo de la semana pasada sin
    // que nada lo dijera (decisión 108).
    const fs2 = require('node:fs');
    const terrenoM = cargar('terreno');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'railes-'));
    const escribir = (relativa, texto) => {
      fs2.mkdirSync(path.dirname(path.join(carpeta, relativa)), { recursive: true });
      fs2.writeFileSync(path.join(carpeta, relativa), texto);
    };
    escribir('.rsc.json', JSON.stringify({ version: 1, targets: ['claude'] }));
    escribir('02-DOCS/wiki/harness/user-profile.md', '---\narnes: Contabilidad\nempresa: Nexus\ntechnical_level: non-technical\n---\n');

    const laDeHoy = fs2.readFileSync(path.join(RAIZ, 'media', 'railes', 'executive-lab', 'SKILL.md'), 'utf8');
    vscode.guion.raiz = carpeta;
    try {
      terrenoM.saberDondeEstamos(RAIZ);

      // Con la de hoy puesta: al día.
      escribir('.claude/skills/executive-lab/SKILL.md', laDeHoy);
      assert.ok(terrenoM.comoEstanLosRailes().alDia, 'la de hoy está al día');
      let pieza = (await terrenoM.radiografia()).piezas.find((p) => p.nombre === 'Lo que pone la barra');
      assert.equal(pieza.estado, 'si');
      assert.equal(pieza.detalle, 'Puesto');

      // Con una de antes: se ve, y trae su salida (P1).
      escribir('.claude/skills/executive-lab/SKILL.md', `${laDeHoy}\n<!-- lo de la semana pasada -->\n`);
      assert.ok(!terrenoM.comoEstanLosRailes().alDia, 'una distinta se detecta');
      pieza = (await terrenoM.radiografia()).piezas.find((p) => p.nombre === 'Lo que pone la barra');
      assert.equal(pieza.estado, 'aMedias', 'no puede decir «Puesto» como si nada');
      assert.match(pieza.detalle, /de una versión anterior/);
      assert.ok(pieza.arreglo, 'y trae botón');
      assert.equal(pieza.arreglo.accion.tipo, 'ponerLosRailesAlDia');
      assert.equal(pieza.arreglo.etiqueta, 'Ponerlo al día');

      // Reponerlos es lo que hace `aplicar.js`, el mismo que usa el wizard.
      const cp = require('node:child_process');
      const hecho = cp.spawnSync(process.execPath, [path.join(RAIZ, 'media', 'railes', 'aplicar.js'), carpeta], { encoding: 'utf8' });
      assert.equal(hecho.status, 0, `aplicar.js falla: ${hecho.stderr}`);
      assert.ok(terrenoM.comoEstanLosRailes().alDia, 'después de reponerlos, al día');

      // Sin raíles puestos no se dice que estén viejos: se dice que faltan.
      fs2.rmSync(path.join(carpeta, '.claude', 'skills', 'executive-lab'), { recursive: true });
      assert.ok(terrenoM.comoEstanLosRailes().alDia, 'lo que no está no está viejo');
      pieza = (await terrenoM.radiografia()).piezas.find((p) => p.nombre === 'Lo que pone la barra');
      assert.equal(pieza.arreglo.accion.tipo, 'arrancar', 'ahí lo que toca es montarlos, no reponerlos');
    } finally {
      terrenoM.saberDondeEstamos(null);
      vscode.guion.raiz = empresa;
    }
    return 'puesto · viejo con su botón · repuesto · y lo que falta no está viejo';
  });

  await comprobar('un desorden enorme no se convierte en una pared', () => {
    // Jose, 22-09-2026: «asegúrate de que no hay edge cases […] y que sea
    // fácil y sin fricción». Un `.env` de 120 claves existe, y pintaba 121
    // líneas, 123 botones y 104 KB de pantalla, con un encargo de 22.576
    // caracteres. Nadie lee eso: ni el alumno ni el asistente (decisión 107).
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'muchas-'));
    fs2.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    fs2.writeFileSync(path.join(carpeta, '.env'), Array.from({ length: 120 }, (_, i) => `PROV${i}_API_KEY=x`).join('\n'));

    vscode.guion.raiz = carpeta;
    try {
      const hay = cargar('sueltas').resumen();
      assert.equal(hay.claves, 120, 'se cuentan todas: no se pierde ninguna');
      assert.equal(hay.reparto.length, 120, 'y el reparto las tiene todas');
      assert.ok(hay.prompt.length < 8000, `el encargo no es una parrafada: ${hay.prompt.length}`);
      assert.match(hay.prompt, /más, en esos mismos ficheros/, 'y dice cuántas se deja por nombrar');

      const p = require('./panel-falso').montarPanel();
      const pintado = p.mandar({ tipo: 'conexiones', proveedores: cargar('conexiones').proveedores(), sueltas: hay });
      assert.ok(pintado.length < 30000, `la pantalla no es un muro: ${Math.round(pintado.length / 1024)} KB`);
      assert.ok((pintado.match(/<button/g) || []).length < 20, 'ni una lista infinita de botones');
      assert.match(pintado, /Y 114 más/, 'se dice cuántas quedan, no se esconden');
      assert.match(pintado, /se montan todas de una vez/, 'y que el botón las coge todas');

      // Y que el alumno pueda decir que la barra se equivoca. Esto lo deduce
      // del nombre de cada clave: acertar siempre es imposible, así que la
      // salida tiene que estar (P1).
      assert.match(pintado, /Esto no está bien/, 'hay forma de corregir el reparto');
      assert.match(pintado, /puedo equivocarme/, 'y se dice que puede estar mal');
      assert.match(hay.prompt, /manda lo que yo diga/, 'y el encargo le hace caso al alumno por encima del reparto');
      // Y la corrección cubre las dos formas de equivocarse: el dueño, y que
      // estén bien donde están porque el proyecto las lee de ahí.
      const corregir = (pintado.match(/prompt&quot;:&quot;La barra dice que tengo credenciales[^&]*/) || [])[0] || '';
      assert.ok(/otra herramienta distinta/.test(corregir), 'se puede decir que es de otra');
      assert.ok(/bien donde están/.test(corregir), 'y que están bien donde están');
      assert.ok(/registro de decisiones/.test(corregir), 'y entonces se apunta, para no repetir la conversación');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return '120 claves: 19 KB y 12 botones, con salida para corregir';
  });

  await comprobar('lo que el asistente escribe en 02-DOCS se puede abrir', async () => {
    // Auditoría del mapeo, 22-09-2026: dos cosas que RSC y la cadena escriben
    // y que la barra no leía. La revisión de `rsc audit` es una página entera
    // en `02-DOCS/audits/` —se escribía y no la abría nadie— y de
    // `02-DOCS/wiki/sdd/` solo salían tres de los montones: faltaban las
    // verificaciones y el registro de decisiones de la cadena.
    const fs2 = require('node:fs');
    const carpeta = fs2.mkdtempSync(path.join(os.tmpdir(), 'mapeo-'));
    const escribir = (relativa, texto) => {
      fs2.mkdirSync(path.dirname(path.join(carpeta, relativa)), { recursive: true });
      fs2.writeFileSync(path.join(carpeta, relativa), texto);
    };
    escribir('.rsc.json', JSON.stringify({ version: 1, targets: ['claude'] }));
    escribir('02-DOCS/wiki/harness/user-profile.md', '---\ntechnical_level: non-technical\n---\n');
    escribir('02-DOCS/audits/audit-2026-09-20-1130.html', '<html><body>vieja</body></html>');
    escribir('02-DOCS/audits/audit-2026-09-22-0900.html', '<html><body>la buena</body></html>');
    escribir('02-DOCS/wiki/sdd/verifications/lo-mio-2026-09-22.md', '---\ntitle: Verificación de lo mío\nstatus: done\n---\n\n# Verificación\n');
    escribir('02-DOCS/wiki/sdd/decisions.md', '## Se eligió guardar en un solo sitio\n\nPorque dos registros se desincronizan.\n');
    escribir('02-DOCS/wiki/harness/decisions.md', '## Lo del arnés se queda como está\n\nPorque ya funciona.\n');

    vscode.guion.raiz = carpeta;
    try {
      // La revisión: se coge la más nueva, se dice su fecha y se puede abrir.
      const terrenoM = cargar('terreno');
      const ultima = terrenoM.laUltimaRevision();
      assert.equal(ultima.fichero, 'audit-2026-09-22-0900.html', 'la más nueva, no la primera');
      assert.match(ultima.cuando, /22 de septiembre/, 'con su fecha en cristiano');
      assert.ok(terrenoM.dondeViveLaRevision(ultima.fichero), 'y se puede abrir');
      assert.equal(terrenoM.dondeViveLaRevision('../../../etc/passwd'), null, 'y solo de ahí dentro');
      assert.equal(terrenoM.dondeViveLaRevision('audit.md'), null, 'y solo una página');

      const radio = await terrenoM.radiografia();
      const pieza = radio.piezas.find((p) => p.nombre === 'La última revisión del asistente');
      assert.ok(pieza && pieza.arreglo, 'sale en la lista de piezas, con su botón (P1)');
      assert.equal(pieza.arreglo.accion.tipo, 'abrirRevision');

      // Las verificaciones de la cadena, con las otras.
      const montones = Object.fromEntries(cargar('proyectos').queHay().map((m) => [m.id, m]));
      assert.ok(montones.verifications, 'las verificaciones salen');
      assert.equal(montones.verifications.etiqueta, 'Qué se ha comprobado');
      assert.equal(montones.verifications.cosas[0].titulo, 'Verificación de lo mío');

      // Y los dos registros de decisiones, en una sola lista.
      const dichas = cargar('diario').decisiones().map((d) => d.titulo);
      assert.ok(dichas.some((t) => /un solo sitio/.test(t)), 'la de la cadena');
      assert.ok(dichas.some((t) => /se queda como está/.test(t)), 'y la del arnés');
    } finally {
      vscode.guion.raiz = empresa;
    }
    return 'la revisión se abre · verificaciones y decisiones de la cadena, a la vista';
  });

  await comprobar('una incidencia se resuelve con el diagnóstico de la barra delante', () => {
    // Jose: «debería haber un botón donde ponga resolver incidencias […] y el
    // asistente audita todo». El síntoma lo pone el alumno, el diagnóstico la
    // barra, y van juntos en el mismo encargo.
    const encargo = cargar('encargos').resolverUnaIncidencia({
      sintoma: 'No encuentro mis conexiones.',
      queVe: ['Hay 5 claves fuera de sitio en: .env.local', 'A Replicate le faltan 0 claves'],
    });
    assert.match(encargo.prompt, /No encuentro mis conexiones/);
    assert.match(encargo.prompt, /lo que ve la barra/i);
    assert.match(encargo.prompt, /5 claves fuera de sitio/);
    assert.match(encargo.prompt, /No toques nada todavía/);
    assert.match(encargo.prompt, /no imprimas ni me pegues el valor de ninguna clave/i);

    const p = require('./panel-falso').montarPanel();
    const ayuda = p.mandar({ tipo: 'ayuda', github: { conectado: false } });
    assert.match(ayuda, /Resolver una incidencia/);
    assert.match(ayuda, /No encuentro mis conexiones/);
    assert.match(ayuda, /Dice que faltan claves y las tengo/);
    return 'síntoma del alumno + diagnóstico de la barra';
  });

  await comprobar('ningún botón manda un texto vacío', () => {
    // El fallo que tuvo a Jose tres versiones viendo conversaciones vacías, y
    // que las tres veces se buscó en el sitio equivocado. Lo que pasaba era
    // esto: `fijadas.js` manda la acción dentro de `a.accion`, y la pantalla
    // principal la rehacía leyendo `a.prompt`, que no existe. Cada botón de
    // Acciones rápidas mandaba `undefined` — y por el enlace, que sí entrega,
    // acabó escrita la palabra "undefined" en su caja de Claude.
    //
    // Se comprueba sobre TODA la pantalla y no solo sobre esos botones: la
    // regla es que ningún botón de la barra puede pedir algo sin texto.
    const p = require('./panel-falso').montarPanel();
    const fijadasM = cargar('fijadas');
    const almacen = { get: () => undefined, update: async () => {} };

    const puestas = fijadasM.puestas(almacen, RAIZ);
    assert.ok(puestas.length, 'la empresa de mentira tiene algo que fijar, o esto no prueba nada');

    const pintada = p.mandar({
      tipo: 'estado',
      estado: { listo: true, sabe: 1, conectados: 1 },
      acciones: puestas,
      modo: 'sencillo',
      marcaPuesta: true,
      comoSeLlama: 'tu trabajo',
      pulso: [],
    });

    const desescapar = (v) => v.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    let mirados = 0;
    for (const trozo of pintada.matchAll(/data-accion="([^"]*)"/g)) {
      const accion = JSON.parse(desescapar(trozo[1]));
      if (accion.tipo !== 'pedir') continue;
      mirados += 1;
      assert.equal(typeof accion.prompt, 'string', `"${accion.tipo}" sin texto: ${JSON.stringify(accion)}`);
      assert.ok(accion.prompt.trim(), `un botón pide algo vacío: ${JSON.stringify(accion)}`);
    }
    assert.ok(mirados >= puestas.length, `se esperaban al menos ${puestas.length} botones y se han mirado ${mirados}`);

    // Y el texto es el del comando, no uno inventado por la pantalla.
    const primero = JSON.parse(desescapar(pintada.match(/data-accion="([^"]*)"/)[1]));
    assert.equal(primero.prompt, puestas[0].accion.prompt, 'la acción se coge tal cual viene');
    return `${mirados} botones, todos con texto`;
  });

  await comprobar('el aviso que manda a un botón trae el botón consigo', () => {
    // Montar el arnés falla y el aviso dice «Pulsa "Algo va mal"». Ese botón
    // vive dentro de Ayuda, y Ayuda solo sale cuando YA hay arnés: o sea, en la
    // única pantalla donde el aviso puede aparecer, el botón no estaba. Jose lo
    // vio en su primera instalación: «y no hay ni botón para decir que va mal».
    const p = require('./panel-falso').montarPanel();
    p.mandar({ tipo: 'estado', estado: { listo: false }, sinArnes: true, donde: 'Aquí ya hay trabajo tuyo', aviso: '', yaEmpezada: { cuantos: 29, conHistorial: true } });
    const pintada = p.mandar({
      tipo: 'aviso',
      texto: 'No he podido montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor.',
      malo: true,
    });
    assert.match(pintada, /algoVaMal/, 'el aviso nombra un botón que hay que poder pulsar');

    // Y un aviso normal no lo arrastra: solo el que lo nombra.
    const buena = p.mandar({ tipo: 'aviso', texto: 'Guardado.', malo: false });
    assert.ok(!/algoVaMal/.test(buena), 'un aviso bueno no ofrece socorro');
    return 'quien lo nombra, lo ofrece';
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
      }, /Conocimiento.*Histórico.*Ajustes/s],
      ['radiografia', { tipo: 'radiografia', ...radio }, /Qué falta por montar/],
      ['saberes', { tipo: 'saberes', sabe: sabe.sabe, puedeAprender: sabe.puedeAprender, deSerie: sabe.deSerie }, /Habilidades \(skills\)/],
      ['salidas', { tipo: 'salidas', herramientas: cargar('salidas').loQueHaProducido() }, /Resultados/],
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
      ['comandos', { tipo: 'comandos', comandos: cargar('acciones').todos() }, /<h2>Comandos<\/h2>/],
      // Sin ninguno escrito todavía, y con un asistente que sí puede tenerlos.
      ['comandos sin ninguno', { tipo: 'comandos', comandos: [], puedeTenerBotones: true }, /Se van creando conforme repites tareas/],
      // Y con uno que no puede tenerlos nunca: se dice, y no se ofrece crear uno
      // que no tendría dónde vivir.
      ['comandos con un asistente sin comandos', { tipo: 'comandos', comandos: [], puedeTenerBotones: false }, /no trabaja con comandos/],
      ['ayuda', { tipo: 'ayuda', github: { conectado: false } }, /Estoy atascado|por dónde seguir/],
      ['reglas', { tipo: 'reglas', ...cargar('reglas').queHay() }, /albarán firmado/],
      ['reglas con guardianes', { tipo: 'reglas', ...cargar('reglas').queHay(), guardianes: [{ id: 'danger-guard', nombre: 'Freno ante órdenes peligrosas', queHace: 'Para una orden peligrosa.', estado: 'armado', porQue: '' }] }, /Lo que se comprueba solo/],
      // Y lo que hace solo sin parar nada, en el mismo desplegable (decisión 102).
      ['reglas con automatismos', { tipo: 'reglas', ...cargar('reglas').queHay(), guardianes: [], automatismos: [{ id: 'session-start', nombre: 'La brújula al empezar', queHace: 'Recuerda cómo se trabaja aquí.', estado: 'activo', porQue: '' }, { id: 'worktree-reaper', nombre: 'Recogida de copias de trabajo', queHace: 'Recoge lo ya guardado.', estado: 'apagado', porQue: 'Apagado aquí, a propósito' }] }, /Y lo que hace solo, sin parar nada[\s\S]*La brújula al empezar[\s\S]*Activo[\s\S]*Recogida de copias de trabajo[\s\S]*Apagado aquí/],
      ['asistente', { tipo: 'asistente', ...cargar('asistentes').comoEstamos(), aviso: null }, /Claude|Codex/],
      ['comoTrabaja', { tipo: 'comoTrabaja', ...cargar('ajustes').comoEstamos(), aviso: null }, /Cada cuánto guarda solo/],
      ['laCara', { tipo: 'laCara', ...cargar('tema').comoEstamos(), aviso: null }, /Dale material/],
      ['proyectos', { tipo: 'proyectos', montones: cargar('proyectos').queHay() }, /Vender recambios/],
      ['agentes', { tipo: 'agentes', agentes: cargar('agentes').queHay() }, /cobros atrasados/i],
      ['sugerencias', { tipo: 'sugerencias', ahora: [], hayAgentes: true, hayProyectos: true }, /Pedirle que revise la carpeta/],
      ['trato', { tipo: 'trato', ...tratoM.comoEstamos(), aviso: null }, /Cuánto te explica/],
      // Con una lección de la memoria de RSC: lo que ha aprendido de ti vive
      // en esta pantalla, y era el último hueco del mapeo (decisión 101).
      ['trato con lecciones', {
        tipo: 'trato',
        ...tratoM.comoEstamos(),
        aprendido: [{ id: '1', texto: 'Prefiere que le pregunte antes de tocar precios', porque: 'lo pidió tres veces', cuando: '2026-09-20', donde: 'aqui' }],
        comoAprende: '/learn',
        aviso: null,
      }, /Lo que ha aprendido de ti[\s\S]*tocar precios[\s\S]*lo pidió tres veces · 2026-09-20 · Solo aquí[\s\S]*Que aprenda algo de ti/],
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

  // ------------------------------------------- reconocer antes de preguntar
  //
  // Jose: «primero, antes de lanzar las preguntas, debería escanear la carpeta».
  // De lo que se encuentre depende la rama y, sobre todo, qué NO hay que volver
  // a preguntar. Nueve estados, y cada uno con su carpeta de mentira.

  await comprobar('los nueve estados de una carpeta se distinguen', async () => {
    const poner = (raiz, rel, txt) => {
      const f = path.join(raiz, rel);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, txt);
    };
    const conSuelo = (r) => {
      poner(r, '01-TOOLS/_TEMPLATE/README.md', '#');
      poner(r, '02-DOCS/wiki/harness/user-profile.md', '---\narnes: X\n---\n');
    };
    const conHabilidades = (r) => {
      poner(r, '.claude/skills/bro/SKILL.md', '#');
      poner(r, '.claude/skills/orient/SKILL.md', '#');
    };
    const RECIBO = { onboarding: { plan: { record: { projectKind: 'software', technicalLevel: 'mixed', accompaniment: 'L2', goal: 'x', targets: ['claude'] } } } };
    const manifiesto = (extra = {}) => JSON.stringify({ version: 1, targets: ['claude'], skills: ['bro', 'orient'], ownSkills: [], ...extra });

    const CASOS = {
      vacia: () => {},
      empezada: (r) => { poner(r, 'src/app.py', 'print(1)'); },
      // Sin `.rsc.json` pero con carpetas de asistente puestas a mano.
      otroArnes: (r) => { poner(r, 'src/app.py', 'x'); poner(r, '.claude/skills/mia/SKILL.md', '# mia'); poner(r, 'CLAUDE.md', 'Mis reglas'); },
      // Lo declarado está y en disco no hay nada: un repositorio clonado.
      clonado: (r) => { poner(r, '.rsc.json', manifiesto(RECIBO)); conSuelo(r); },
      aMedias: (r) => { poner(r, '.rsc.json', manifiesto(RECIBO)); conHabilidades(r); },
      sinRecibo: (r) => { poner(r, '.rsc.json', manifiesto()); conSuelo(r); conHabilidades(r); },
      conArnes: (r) => { poner(r, '.rsc.json', manifiesto(RECIBO)); conSuelo(r); conHabilidades(r); },
      // Marcas de conflicto de merge: `.rsc.json` es un fichero comiteado y el
      // propio RSC avisa de que esto pasa. No se toca nada.
      reciboRoto: (r) => { poner(r, '.rsc.json', '<<<<<<< HEAD\n{"version":1}\n=======\n'); conSuelo(r); },
    };

    // Y lo que ya funcionaba tiene que seguir viéndose igual: `queHay()` es
    // ahora una proyección, y la brújula, el informe y la radiografía llevan
    // meses leyendo sus cinco palabras.
    const COMO_SE_VEIA = {
      vacia: 'vacia', empezada: 'empezada', otroArnes: 'empezada', clonado: 'conArnes',
      aMedias: 'aMedias', sinRecibo: 'conArnes', conArnes: 'conArnes', reciboRoto: 'conArnes',
    };

    for (const [esperado, montar] of Object.entries(CASOS)) {
      const raiz = fs.mkdtempSync(path.join(os.tmpdir(), `estado-${esperado}-`));
      montar(raiz);
      vscode.guion.raiz = raiz;

      assert.equal(cargar('terreno').mirarYClasificar().estado, esperado, `"${esperado}" no se reconoce`);
      assert.equal((await cargar('terreno').queHay()).tipo, COMO_SE_VEIA[esperado],
        `"${esperado}" cambia lo que veía la brújula`);
    }

    // Sin carpeta abierta no se mira nada, y sobre todo no revienta.
    vscode.guion.raiz = null;
    assert.equal(cargar('terreno').mirarYClasificar().estado, 'sinCarpeta');
    assert.equal((await cargar('terreno').queHay()).tipo, 'sinCarpeta');

    vscode.guion.raiz = empresa;
    return `${Object.keys(CASOS).length + 1} estados, y la proyección intacta`;
  });

  await comprobar('un clon se ve porque lo declarado no está en disco', () => {
    // La unión de `habilidadesPuestas()` tapaba esto: lo declarado hacía de
    // pantalla sobre lo que falta, y un clon era indistinguible de un arnés
    // montado. La barra pintaba botones que no respondían.
    const rscM = cargar('rsc');
    const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'clon-'));
    fs.mkdirSync(path.join(raiz, '.claude/skills'), { recursive: true });
    fs.writeFileSync(path.join(raiz, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'], skills: ['bro', 'eli5'] }));
    vscode.guion.raiz = raiz;

    assert.deepEqual(rscM.habilidadesEnDisco(), [], 'en disco no hay ninguna');
    assert.deepEqual(rscM.habilidadesPuestas().sort(), ['bro', 'eli5'], 'y declaradas sí: esa es la diferencia');

    vscode.guion.raiz = empresa;
    return 'lo declarado ya no tapa lo que falta';
  });

  await comprobar('lo que se encuentra de otro asistente se puede contar', () => {
    // Para poder pedirle permiso hay que saber QUÉ tiene, no solo que tiene
    // algo: «mantenemos lo que ya tenía».
    const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'otro-'));
    const poner = (rel, txt) => {
      fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
      fs.writeFileSync(path.join(raiz, rel), txt);
    };
    poner('.claude/skills/la-mia/SKILL.md', '# mía');
    poner('.claude/agents/el-mio.md', '# mío');
    poner('AGENTS.md', 'Lo que quiero que haga');
    vscode.guion.raiz = raiz;

    const { otroMontaje, estado } = cargar('terreno').mirarYClasificar();
    assert.equal(estado, 'otroArnes');
    const suyo = otroMontaje.asistentes.find((a) => a.quien === 'claude');
    assert.equal(suyo.habilidades, 1);
    assert.equal(suyo.agentes, 1);
    assert.equal(suyo.deRsc, false, 'esto no lo montó RSC');
    assert.ok(otroMontaje.ficheros.includes('AGENTS.md'));

    vscode.guion.raiz = empresa;
    return '1 habilidad · 1 ayudante · AGENTS.md';
  });

  // ------------------------------------------------ decidir qué hay que hacer
  //
  // `rumbo.js` es una función pura: entra un parte, sale un plan. Es la única
  // pieza del arranque que se puede probar entera sin montar nada, así que aquí
  // va el grueso. Los partes se inventan a mano: eso es lo que permite cubrir
  // las nueve ramas en milisegundos.

  await comprobar('cada estado de carpeta tiene su rama, y solo una', () => {
    const rumbo = cargar('rumbo');
    const RECORD = {
      projectKind: 'software', goal: 'lo mío', softwareScope: 'small',
      technicalLevel: 'mixed', accompaniment: 'L2', targets: ['claude'],
    };
    const parte = (estado, mas = {}) => ({
      estado,
      git: { hay: true },
      carpeta: { vacia: estado === 'vacia', cuantos: estado === 'vacia' ? 0 : 3, parece: null },
      suelo: { faltan: estado === 'aMedias' ? ['conocimiento'] : [] },
      habilidades: { declaradas: [], enDisco: [], colgando: [] },
      recibo: { record: RECORD },
      railes: { habilidadPropia: true, perfil: true, nombres: { arnes: 'X', empresa: 'Y' } },
      claves: null,
      ...mas,
    });

    const ESPERADAS = {
      sinCarpeta: 'sinCarpeta',
      vacia: 'desdeCero',
      empezada: 'encimaDeLoQueHay',
      otroArnes: 'otroArnes',
      clonado: 'traer',
      aMedias: 'completar',
      sinRecibo: 'sinRecibo',
      conArnes: 'yaEstaba',
      reciboRoto: 'reciboRoto',
    };

    for (const [estado, esperada] of Object.entries(ESPERADAS)) {
      const plan = rumbo.elegirRama(parte(estado));
      assert.equal(plan.rama, esperada, `"${estado}" debería ir a "${esperada}"`);
      assert.ok(plan.porQue, `"${estado}" no dice por qué`);
      for (const paso of plan.pasos) {
        assert.ok(rumbo.PASOS[paso.id], `"${paso.id}" no está en el catálogo de pasos`);
      }
    }

    // Un arnés entero de RSC al que le faltan NUESTROS raíles no es «ya
    // estaba»: hay que adaptarlo. Es lo que pidió Jose y lo que pasa en un
    // arnés montado por otra vía.
    const sinRailes = rumbo.elegirRama(parte('conArnes', { railes: { habilidadPropia: false, perfil: true, nombres: null } }));
    assert.equal(sinRailes.rama, 'adoptar');
    assert.deepEqual(sinRailes.pasos.map((p) => p.id), ['ponerLosRailes', 'ponerLosNombres', 'apuntarLosEnganches']);
    assert.deepEqual(sinRailes.preguntar, ['nombres'], 'y se pregunta solo lo que falta');

    // Y decidir dos veces sobre lo mismo da lo mismo: es una función, no un
    // proceso.
    assert.deepEqual(rumbo.elegirRama(parte('clonado')), rumbo.elegirRama(parte('clonado')));
    return `${Object.keys(ESPERADAS).length} estados, ${new Set(Object.values(ESPERADAS)).size} ramas`;
  });

  await comprobar('un arnés montado y sin ajustar lo dice en la pantalla principal', async () => {
    // Se llegaba a esto solo entrando en «Qué falta por montar», que es justo
    // donde no entra quien no sabe que le falta algo. La pantalla decía «listo»
    // y los botones hablaban con un arnés a medio ajustar.
    const poner = (raiz, rel, txt) => {
      fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
      fs.writeFileSync(path.join(raiz, rel), txt);
    };
    const laQueTraemos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'media', 'harness', 'package.json'), 'utf8')).dependencies['@ericrisco/rsc'];
    const RECORD = { projectKind: 'operations', goal: 'x', technicalLevel: 'non-technical', accompaniment: 'L3', targets: ['claude'] };

    // Un arnés entero de RSC, montado por otra vía: sin nuestra habilidad y sin
    // los nombres en el perfil.
    const ajeno = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-ajustar-'));
    poner(ajeno, '.rsc.json', JSON.stringify({ version: 1, catalogVersion: laQueTraemos, targets: ['claude'], skills: ['bro'], ownSkills: [], onboarding: { plan: { record: RECORD } } }));
    poner(ajeno, '01-TOOLS/_TEMPLATE/README.md', '#');
    poner(ajeno, '02-DOCS/wiki/harness/user-profile.md', '---\ntechnical_level: mixed\n---\n');
    poner(ajeno, '.claude/skills/bro/SKILL.md', '#');

    vscode.guion.raiz = ajeno;
    cargar('brujula').olvidar();
    const estado = await cargar('brujula').estado({ fresco: true });
    assert.equal(estado.listo, true, 'el arnés está entero: no es una carpeta rota');
    assert.equal(estado.sinAjustar, 'adoptar', 'y aun así le falta lo nuestro');

    const p = require('./panel-falso').montarPanel();
    const pintada = p.mandar({
      tipo: 'estado', estado, acciones: [], modo: 'sencillo', marcaPuesta: true, comoSeLlama: 'tu trabajo', pulso: [],
    });
    assert.match(pintada, /no está ajustado a esta barra/, 'y no se dice en la pantalla');
    assert.match(pintada, /Ajustarlo ahora/, 'ni se puede pulsar nada');
    assert.match(pintada, /arrancar/, 'el botón tiene que llevar al arranque');

    // Y la empresa de mentira, que sí está ajustada, no lo enseña.
    vscode.guion.raiz = empresa;
    cargar('brujula').olvidar();
    const sano = await cargar('brujula').estado({ fresco: true });
    assert.equal(sano.sinAjustar, null, 'un arnés ajustado no pide que lo ajusten');
    return 'lo dice arriba, no escondido';
  });

  await comprobar('una carpeta montada con un arnés viejo se pone al día sola', () => {
    // La barra lleva un arnés dentro y lo ejecuta sea cual sea el que diga la
    // carpeta. Al subir de versión mayor, TODAS las carpetas montadas antes
    // pasan a correr un arnés nuevo contra una instalación vieja. RSC sabe
    // reconciliarlo con `sync`, pero no lo hace solo.
    const rumbo = cargar('rumbo');
    const base = {
      estado: 'conArnes', git: { hay: true },
      carpeta: { vacia: false, cuantos: 9, parece: null },
      suelo: { faltan: [] }, habilidades: { declaradas: [], enDisco: [], colgando: [] },
      recibo: { record: { projectKind: 'software', goal: 'x', softwareScope: 'small', technicalLevel: 'mixed', accompaniment: 'L2', targets: ['claude'] } },
      railes: { habilidadPropia: true, perfil: true, nombres: { arnes: 'X' } },
      claves: null,
    };

    const atrasada = rumbo.elegirRama({ ...base, versionAtrasada: true });
    assert.equal(atrasada.rama, 'ponerAlDia');
    assert.ok(atrasada.pasos.some((p) => p.id === 'traerLasHabilidades'), 'se reconstruye con sync');
    assert.ok(!atrasada.pasos.some((p) => p.id === 'montarElArnes'), 'y no se vuelve a montar');
    assert.deepEqual(atrasada.preguntar, [], 'ni se pregunta nada: el plan ya estaba aceptado');

    assert.equal(rumbo.elegirRama({ ...base, versionAtrasada: false }).rama, 'yaEstaba');
    return 'sync, sin preguntar';
  });

  await comprobar('lo que reassess recomienda se lee, y no se aplica solo', () => {
    // `reassess` es de solo lectura a propósito: aceptar un plan es una firma.
    // Así que el arreglo que se ofrece explica y propone — no aplica.
    const rscM = cargar('rsc');
    const encargos = cargar('encargos');

    assert.deepEqual(rscM.queRecomienda({ codigo: 0, salida: 'RSC_REASSESSMENT_NO_CHANGE' }), []);

    const leidas = rscM.queRecomienda({
      codigo: 0,
      salida: 'RSC_REASSESSMENT_RECOMMENDED\n  agent/base-agents: El proyecto ha crecido.\n  workflow/sdd: Y tiene persistencia.\nReview a new plan; nothing has been installed:',
    });
    assert.equal(leidas.length, 2);
    assert.deepEqual(leidas[0], { tipo: 'agent', id: 'base-agents', porQue: 'El proyecto ha crecido.' });

    const encargo = encargos.reajustar(leidas);
    assert.match(encargo.prompt, /agent\/base-agents/, 'no dice cuáles son');
    assert.match(encargo.prompt, /pídeme que lo acepte/, 'no deja claro quién firma');
    assert.match(encargo.prompt, /No aceptes ningún plan por tu cuenta/, 'no prohíbe aplicarlo solo');
    assert.equal(encargos.reajustar([]), null, 'sin recomendaciones no se pide nada');
    return '2 leídas, ninguna aplicada';
  });

  await comprobar('lo que ya está en el recibo no se vuelve a preguntar', () => {
    // Cinco de las siete preguntas viven en `.rsc.json` desde que alguien
    // aceptó el plan. Se preguntaban igual, las siete, cada vez.
    const rumbo = cargar('rumbo');
    const entero = {
      projectKind: 'operations', goal: 'llevar las facturas', softwareScope: null,
      technicalLevel: 'non-technical', accompaniment: 'L3', targets: ['claude'],
    };
    const base = {
      estado: 'clonado', git: { hay: true },
      carpeta: { vacia: false, cuantos: 9, parece: null },
      suelo: { faltan: [] }, habilidades: { declaradas: [], enDisco: [], colgando: [] },
      claves: null,
    };

    const conNombres = rumbo.elegirRama({ ...base, recibo: { record: entero }, railes: { nombres: { arnes: 'X' } } });
    assert.deepEqual(conNombres.preguntar, [], 'con recibo y nombres no queda nada que preguntar');

    const sinNombres = rumbo.elegirRama({ ...base, recibo: { record: entero }, railes: { nombres: null } });
    assert.deepEqual(sinNombres.preguntar, ['nombres'], 'un clon pregunta una, no siete');

    // Sin recibo se preguntan las siete. El tamaño solo se llega a preguntar
    // si el proyecto resulta ser software, y eso se decide al contestar.
    const aPelo = rumbo.elegirRama({ ...base, estado: 'empezada', recibo: null, railes: { nombres: null } });
    assert.deepEqual(aPelo.preguntar, ['asistente', 'deQueVa', 'objetivo', 'tamano', 'nivel', 'dial', 'nombres']);

    // Y un valor que RSC no aceptaría se pregunta igual, aunque esté escrito.
    const torcido = rumbo.elegirRama({
      ...base,
      recibo: { record: { ...entero, technicalLevel: 'experto', accompaniment: 'L9' } },
      railes: { nombres: { arnes: 'X' } },
    });
    assert.deepEqual(torcido.preguntar.sort(), ['dial', 'nivel'], 'lo que no vale se vuelve a preguntar');
    return '0 · 1 · 7 · 2';
  });

  await comprobar('un arnés que ya está no se toca, y el historial de alguien tampoco', () => {
    const rumbo = cargar('rumbo');
    const base = {
      git: { hay: true }, carpeta: { vacia: false, cuantos: 4, parece: null },
      suelo: { faltan: [] }, habilidades: { declaradas: [], enDisco: [], colgando: [] },
      recibo: { record: { projectKind: 'software', goal: 'x', softwareScope: 'small', technicalLevel: 'mixed', accompaniment: 'L2', targets: ['claude'] } },
      railes: { habilidadPropia: true, perfil: true, nombres: { arnes: 'X' } }, claves: null,
    };

    // La que existe para no hacer nada: ni un paso que escriba.
    const sano = rumbo.elegirRama({ ...base, estado: 'conArnes' });
    assert.ok(sano.pasos.every((p) => !p.escribe), 'un arnés sano no se toca');

    // El punto de partida mete `git add -A` en el historial. Solo en una
    // carpeta vacía, nunca sobre el trabajo de alguien. Es la decisión 28, y
    // hasta ahora solo se podía comprobar leyendo el código fuente.
    for (const estado of ['empezada', 'otroArnes', 'clonado', 'aMedias', 'sinRecibo', 'conArnes']) {
      const plan = rumbo.elegirRama({ ...base, estado, railes: { habilidadPropia: false, perfil: true, nombres: null } });
      assert.ok(!plan.pasos.some((p) => p.id === 'puntoDePartida'),
        `"${estado}" escribiría en el historial de alguien`);
    }
    const vacia = rumbo.elegirRama({ ...base, estado: 'vacia', carpeta: { vacia: true, cuantos: 0, parece: null } });
    assert.ok(vacia.pasos.some((p) => p.id === 'puntoDePartida'), 'una carpeta vacía sí lo deja');
    return 'solo desde cero';
  });

  await comprobar('sin git no se escribe nada hasta que se decida', () => {
    // Enterarse a mitad, después de cinco respuestas y con la barra en marcha,
    // era la peor forma de descubrirlo.
    const rumbo = cargar('rumbo');
    const base = {
      carpeta: { vacia: true, cuantos: 0, parece: null }, suelo: { faltan: [] },
      habilidades: { declaradas: [], enDisco: [], colgando: [] }, recibo: null,
      railes: { nombres: null }, claves: null,
    };
    for (const estado of ['vacia', 'empezada', 'otroArnes', 'clonado', 'aMedias']) {
      const plan = rumbo.elegirRama({ ...base, estado, git: { hay: false } });
      assert.equal(plan.rama, 'sinGit', `"${estado}" sin git no se para`);
      assert.deepEqual(plan.preguntar, [], 'y no pregunta nada antes');
    }
    return 'se para antes de preguntar';
  });

  await comprobar('la empresa de mentira es un arnés montado, no un clon', () => {
    // Guardarraíl del fixture, y de los caros. Declaraba `executive-lab` en
    // `.rsc.json` y no la escribía en disco: en cuanto la barra aprendió a
    // mirar el disco, la empresa entera pasó a verse como un repositorio
    // clonado — y media suite habría tomado la rama equivocada sin que fallara
    // ni una comprobación.
    const p = cargar('terreno').mirarYClasificar();
    assert.equal(p.estado, 'conArnes', `la empresa de mentira se ve como "${p.estado}"`);
    assert.deepEqual(p.habilidades.colgando, [], 'declara algo que no tiene en disco');
    assert.equal(p.conEstadoDeRsc, true, 'le falta el fichero de estado que deja RSC');
    return 'montada, como debe ser';
  });

  await comprobar('lo que escribe el propio arnés no cuenta como otro asistente', () => {
    // Desde la 2.0, RSC escribe un `CLAUDE.md` suyo para que Claude Code no se
    // lea su capa siempre-activa dos veces. Sin restarlo, le pediríamos permiso
    // a alguien para respetar un fichero que hemos escrito nosotros.
    const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'sombra-'));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '<!-- rsc:claude-md-shadow -->\nlo que escribe RSC\n');
    fs.writeFileSync(path.join(raiz, 'AGENTS.md'), '<!-- rsc-suggest:start -->\ncapa siempre activa\n<!-- rsc-suggest:end -->\n');
    fs.mkdirSync(path.join(raiz, 'src'), { recursive: true });
    fs.writeFileSync(path.join(raiz, 'src/a.py'), 'x');
    vscode.guion.raiz = raiz;

    const soloDeRsc = cargar('terreno').mirarYClasificar();
    assert.equal(soloDeRsc.estado, 'empezada', `se ha visto como "${soloDeRsc.estado}"`);
    assert.deepEqual(soloDeRsc.otroMontaje.ficheros, [], 'lo nuestro no es de nadie');

    // Pero lo que esa persona escriba alrededor sí cuenta, y por eso RSC
    // escribe entre marcas en vez de sobrescribir el fichero.
    fs.appendFileSync(path.join(raiz, 'AGENTS.md'), '\nY estas son MIS reglas.\n');
    const conLoSuyo = cargar('terreno').mirarYClasificar();
    assert.equal(conLoSuyo.estado, 'otroArnes');
    assert.deepEqual(conLoSuyo.otroMontaje.ficheros, ['AGENTS.md']);

    vscode.guion.raiz = empresa;
    return 'la resta que hace RSC, hecha también aquí';
  });

  await comprobar('mirar la carpeta no lanza ni un proceso', () => {
    // La pantalla principal se repinta sola. Si reconocer costara dos
    // subprocesos, cada repintado los pagaría.
    const antes = vscode.registrado.ejecutados.length;
    cargar('terreno').mirarYClasificar();
    assert.equal(vscode.registrado.ejecutados.length, antes, 'mirar ha lanzado algo');
    return 'gratis';
  });

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

  await comprobar('sin git se pregunta qué hacer, y no se escribe nada', async () => {
    // Antes esto era un callejón: sin git la barra no ofrecía nada y se
    // quedaba muerta. Jose: «preguntárselo a la persona». Lo que no cambia es
    // que no se escribe ni se pregunta nada más hasta que conteste.
    const vacia = fs.mkdtempSync(path.join(os.tmpdir(), 'sin-git-'));
    vscode.guion.raiz = vacia;
    vscode.registrado.quickPick = null;
    vscode.registrado.mensajes.length = 0;

    const memoria = new Map();
    const contexto = {
      extensionPath: RAIZ,
      workspaceState: { get: (k) => memoria.get(k), update: async (k, v) => memoria.set(k, v) },
    };

    // Si elige ponerlo, se devuelve `faltaGit` y la pantalla enseña el botón.
    vscode.guion.eleccion = 'Ponerlo primero';
    const poner = await sinGit(() => cargar('arrancar').arrancar(contexto, { appendLine() {} }));
    assert.equal(poner.faltaGit, true);
    assert.equal(poner.cancelado, undefined);
    assert.equal(vscode.registrado.quickPick, null, 'no se pregunta nada más antes');
    assert.ok(vscode.registrado.mensajes.some((m) => /WARN .*copias/.test(m)), 'se explica qué se pierde');

    // Y si elige seguir sin copias, se apunta y se dice, sin montar nada.
    vscode.guion.eleccion = 'Seguir sin copias';
    const seguir = await sinGit(() => cargar('arrancar').arrancar(contexto, { appendLine() {} }));
    assert.equal(seguir.sigueSinCopias, true);
    assert.equal(seguir.faltaGit, undefined);
    assert.equal(memoria.get('executiveLab.sigueSinCopias'), true, 'y no se vuelve a preguntar');

    vscode.guion.eleccion = undefined;
    vscode.guion.raiz = empresa;
    return 'se para y se pregunta';
  });

  await comprobar('cada clase de carpeta toma su camino, y ninguna se queda muda', async () => {
    // El callejón que esto viene a matar: con `.rsc.json` puesto, `arrancar()`
    // cortaba con «Aquí ya hay una empresa montada» pasara lo que pasara. Un
    // arnés a medias tenía un botón que llamaba a esa función y no hacía nada.
    const rscM = cargar('rsc');
    const arrancarM = cargar('arrancar');
    const antes = { sincronizar: rscM.sincronizar, correr: rscM.correr, arreglarEnSeco: rscM.arreglarEnSeco };
    const llamadas = [];

    rscM.sincronizar = async () => { llamadas.push('sync'); return { codigo: 0, salida: 'Synced claude: bro' }; };
    rscM.arreglarEnSeco = async () => { llamadas.push('repair --dry-run'); return { codigo: 0, salida: 'Nothing to repair — this harness is healthy.' }; };
    rscM.correr = async (args) => {
      llamadas.push(args[0]);
      if (args[0] !== 'onboard') return { codigo: 0, salida: '' };
      // Primera pasada: el plan. Segunda: listo.
      return args.includes('--accept-plan')
        ? { codigo: 0, salida: 'RSC_ONBOARDING_READY abc' }
        : { codigo: 0, salida: `Plan id: ${'a'.repeat(64)}\nAccept exactly this plan: npx @ericrisco/rsc@1.4.1 onboard --accept-plan ${'a'.repeat(64)}` };
    };

    const poner = (raiz, rel, txt) => {
      fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
      fs.writeFileSync(path.join(raiz, rel), txt);
    };
    const RECORD = { projectKind: 'operations', goal: 'x', technicalLevel: 'non-technical', accompaniment: 'L3', targets: ['claude'] };
    const manifiesto = JSON.stringify({ version: 1, targets: ['claude'], skills: ['bro'], ownSkills: [], onboarding: { plan: { record: RECORD } } });
    const contexto = { extensionPath: RAIZ, workspaceState: { get: () => undefined, update: async () => {} } };
    const callar = { appendLine() {} };

    try {
      // Un clon: se trae lo declarado con `sync`. Nunca se vuelve a montar.
      const clon = fs.mkdtempSync(path.join(os.tmpdir(), 'rama-clon-'));
      poner(clon, '.rsc.json', manifiesto);
      poner(clon, '01-TOOLS/_TEMPLATE/README.md', '#');
      poner(clon, '02-DOCS/wiki/harness/user-profile.md', '---\narnes: Clonado\n---\n');
      vscode.guion.raiz = clon;
      llamadas.length = 0;
      const traido = await arrancarM.arrancar(contexto, callar);
      assert.equal(traido.ok, true, `el clon contestó: ${traido.mensaje}`);
      assert.equal(traido.rama, 'traer');
      assert.ok(llamadas.includes('sync'), 'un clon se trae con sync');
      assert.ok(!llamadas.includes('onboard'), 'y no se vuelve a montar');

      // A medias: se completa con el recibo y SIN preguntar nada.
      const medias = fs.mkdtempSync(path.join(os.tmpdir(), 'rama-medias-'));
      poner(medias, '.rsc.json', manifiesto);
      poner(medias, '.claude/skills/bro/SKILL.md', '#');
      vscode.guion.raiz = medias;
      llamadas.length = 0;
      vscode.registrado.quickPick = null;
      const completado = await arrancarM.arrancar(contexto, callar);
      assert.equal(completado.rama, 'completar');
      assert.ok(llamadas.includes('onboard'), 'el suelo lo levanta onboard: repair no sabe');
      assert.equal(vscode.registrado.quickPick, null, 'y no se pregunta ni una cosa');

      // Entero y con raíles: no se toca nada.
      vscode.guion.raiz = empresa;
      llamadas.length = 0;
      const sano = await arrancarM.arrancar(contexto, callar);
      assert.equal(sano.yaEstaba, true);
      assert.deepEqual(llamadas, [], 'un arnés sano no lanza ni un comando');

      // Y en ningún caso se contesta lo de antes.
      for (const r of [traido, completado, sano]) {
        assert.ok(!/ya hay una empresa montada/.test(r.mensaje || ''), 'sigue el callejón');
      }
      return 'traer · completar · no tocar';
    } finally {
      Object.assign(rscM, antes);
      vscode.guion.raiz = empresa;
    }
  });

  await comprobar('un encargo al asistente trae su contrato y su forma de comprobarlo', () => {
    // Lo que no se puede calcular se delega, pero no a ciegas. Cada encargo
    // dice qué hay, qué tiene que quedar y qué no se toca — y trae una función
    // que mira el DISCO para saber si quedó hecho. Sin eso es un deseo, no un
    // contrato: el asistente diría que sí y nadie lo comprobaría.
    const encargos = cargar('encargos');

    // 1. El suelo que `repair` no levanta.
    const suelo = encargos.levantarElSuelo(['conexiones', 'conocimiento']);
    assert.match(suelo.prompt, /01-TOOLS\/_TEMPLATE/, 'no dice qué falta');
    assert.match(suelo.prompt, /harness/, 'no dice con qué se arregla');
    assert.match(suelo.prompt, /No toques/, 'no dice qué no se toca');
    assert.equal(typeof suelo.comprobar, 'function');

    // 2. Una carpeta que ya era de alguien.
    const carpeta = encargos.ordenarLaCarpeta({
      carpeta: { parece: 'algo en Python', cuantos: 29 },
      otroMontaje: { asistentes: [{ quien: 'claude' }], ficheros: [] },
    });
    assert.match(carpeta.prompt, /29 cosas/, 'no le pasa lo que ya sabemos');
    assert.match(carpeta.prompt, /algo en Python/);
    assert.match(carpeta.prompt, /No muevas/, 'no dice qué no se toca');
    assert.match(carpeta.prompt, /sensible/, 'no dice qué hay que avisar antes');

    // 3. Y el que comprueba de verdad: falso antes, verdadero después.
    const conClaves = fs.mkdtempSync(path.join(os.tmpdir(), 'encargo-claves-'));
    fs.writeFileSync(path.join(conClaves, '.env'), 'STRIPE_KEY=sk_test_123\n');
    vscode.guion.raiz = conClaves;

    const claves = encargos.ordenarLasClaves();
    assert.ok(claves, 'con claves sueltas tiene que haber encargo');
    assert.equal(claves.comprobar(), false, 'todavía no está hecho');
    assert.match(claves.prompt, /01-TOOLS/, 'no dice dónde tienen que acabar');

    fs.unlinkSync(path.join(conClaves, '.env'));
    assert.equal(claves.comprobar(), true, 'y ahora sí: lo dice el disco, no el asistente');
    assert.equal(encargos.ordenarLasClaves(), null, 'sin claves sueltas no se pide nada');

    vscode.guion.raiz = empresa;
    return `${encargos.LOS_QUE_HAY.length} encargos, los tres con contrato`;
  });

  await comprobar('toda pieza que falta trae su salida', async () => {
    // El invariante que mata el callejón. Esta pantalla listaba ocho cosas —«se
    // quedó a medias», «no lo tienes puesto», «N sin terminar»— y no tenía ni
    // un botón. Si alguien añade una fila sin salida, esto falla.
    const terrenoM = cargar('terreno');
    const COMO = ['solo', 'agente', 'persona'];
    const rutas = fs.readFileSync(path.join(RAIZ, 'src', 'extension.js'), 'utf8');

    const carpetas = {
      'la empresa de mentira': empresa,
      'una carpeta a medias': (() => {
        const r = fs.mkdtempSync(path.join(os.tmpdir(), 'revision-medias-'));
        fs.writeFileSync(path.join(r, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'], skills: [] }));
        return r;
      })(),
      'una carpeta de alguien': (() => {
        const r = fs.mkdtempSync(path.join(os.tmpdir(), 'revision-ajena-'));
        fs.mkdirSync(path.join(r, 'src'), { recursive: true });
        fs.writeFileSync(path.join(r, 'src/app.py'), 'x');
        return r;
      })(),
    };

    let miradas = 0;
    for (const [comoEs, raiz] of Object.entries(carpetas)) {
      vscode.guion.raiz = raiz;
      const { piezas } = await terrenoM.radiografia();
      assert.ok(piezas.length, `${comoEs} no enseña ninguna pieza`);

      for (const pieza of piezas) {
        miradas += 1;
        if (pieza.estado === 'si' || pieza.estado === 'noAplica') {
          assert.ok(!pieza.arreglo, `"${pieza.nombre}" está bien y ofrece arreglarla`);
          continue;
        }
        assert.ok(pieza.arreglo, `en ${comoEs}, "${pieza.nombre}" no ofrece salida`);
        assert.ok(COMO.includes(pieza.arreglo.como), `"${pieza.nombre}": no se sabe quién lo hace`);
        assert.ok(pieza.arreglo.etiqueta, `"${pieza.nombre}": el botón no dice nada`);
        // Y la acción tiene que existir de verdad en la extensión, o el botón
        // se pulsa y no pasa nada.
        assert.match(rutas, new RegExp(`\\b${pieza.arreglo.accion.tipo}:`), `"${pieza.arreglo.accion.tipo}" no existe`);
      }
    }

    vscode.guion.raiz = empresa;
    return `${miradas} piezas en 3 carpetas, todas con salida`;
  });

  await comprobar('a la lista de piezas se llega sin arnés, que es cuando hace falta', () => {
    // Sus dos entradas vivían en pantallas que exigen `listo: true`: en una
    // carpeta rota solo se llegaba por la paleta de comandos, que el modo
    // sencillo esconde.
    const p = require('./panel-falso').montarPanel();
    const sinArnes = p.mandar({
      tipo: 'estado',
      estado: { listo: false },
      sinArnes: true,
      donde: 'Aquí todavía no hay nada',
      aviso: '',
    });
    assert.match(sinArnes, /verRadiografia/, 'desde una carpeta sin arnés no se llega');

    // Y al terminar de montar, la pantalla cambia de cabecera y tiene salida.
    const alFinal = p.mandar({
      tipo: 'radiografia',
      origen: 'init',
      queEs: 'conArnes',
      piezas: [{ nombre: 'Conocimiento', estado: 'no', detalle: 'Nada todavía', arreglo: { como: 'solo', etiqueta: 'Darle documentos', accion: { tipo: 'verPapeles' } } }],
    });
    assert.match(alFinal, /ha quedado montado/);
    assert.match(alFinal, /Empezar a trabajar/, 'del final del arranque se tiene que poder salir');
    assert.match(alFinal, /verPapeles/, 'y la pieza que falta trae su botón');
    return 'alcanzable y con salida';
  });

  await comprobar('un .rsc.json que no se puede leer no se pisa', async () => {
    // Es un fichero que viaja por git, y el propio RSC avisa de que es propenso
    // a conflictos de merge. Antes se veía como arnés montado y el arranque
    // cortaba; lo grave sería montar encima y borrar el que había.
    const roto = fs.mkdtempSync(path.join(os.tmpdir(), 'rama-roto-'));
    fs.writeFileSync(path.join(roto, '.rsc.json'), '<<<<<<< HEAD\n{"version":1}\n=======\n');
    vscode.guion.raiz = roto;
    vscode.registrado.quickPick = null;

    const dicho = await cargar('arrancar').arrancar(
      { extensionPath: RAIZ, workspaceState: { get: () => undefined, update: async () => {} } },
      { appendLine() {} },
    );

    assert.equal(dicho.ok, false);
    assert.match(dicho.mensaje, /Algo va mal/, 'y hay salida: el aviso trae su botón');
    assert.equal(vscode.registrado.quickPick, null, 'no se pregunta nada');
    assert.equal(fs.readFileSync(path.join(roto, '.rsc.json'), 'utf8').slice(0, 7), '<<<<<<<', 'no se ha tocado');

    vscode.guion.raiz = empresa;
    return 'no se toca nada';
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

    await comprobar('un arnés de Codex de verdad se lee entero, y se dice lo que ahí no hay', async () => {
      // «Ver Codex de verdad» llevaba semanas pendiente: lo de Codex estaba
      // probado **simulado** —cambiando `targets` en un `.rsc.json` a mano— y
      // nunca contra un arnés montado por RSC con `--target codex`. Que la
      // tabla de `sitios.js` diga la verdad solo se sabe montándolo.
      const rscM = cargar('rsc');
      const codex = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-real-'));
      const cp = require('node:child_process');
      cp.spawnSync('git', ['init', '-q', '.'], { cwd: codex });

      const flags = ['--technical-level', 'non-technical', '--accompaniment', 'L3',
        '--project-kind', 'operations', '--goal', 'Organizar el papeleo', '--target', 'codex'];
      // El arnés se monta donde diga la raíz, no donde esté el proceso:
      // `procesos.js` usa `proyecto.raiz()` como cwd. Con un `chdir` esto
      // montaba un Codex encima de la empresa de mentira sin decir nada.
      let montado = false;
      vscode.guion.raiz = codex;
      try {
        const plan = await rscM.correr(['onboard', ...flags], { tiempoMaximo: 600000 });
        const linea = (plan.salida.match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
        if (linea) {
          const hecho = await rscM.correr(['onboard', ...linea.trim().split(/\s+/)], { tiempoMaximo: 900000 });
          montado = /RSC_ONBOARDING_READY/.test(hecho.salida);
        }
      } finally {
        vscode.guion.raiz = empresa;
      }
      assert.ok(fs.existsSync(path.join(codex, '.rsc.json')), 'el arnés tiene que caer en la carpeta de Codex, no en otra');
      if (!montado) return 'SALTADA';

      // Los raíles, sobre un Codex de verdad: es el camino que nunca se probó.
      cp.spawnSync(process.execPath, [path.join(RAIZ, 'media', 'railes', 'aplicar.js'), codex], { encoding: 'utf8' });

      vscode.guion.raiz = codex;
      try {
        const dondeM = cargar('donde');
        assert.equal(dondeM.paraQuien(), 'codex');
        // Lo que RSC escribe de verdad para Codex, y que `sitios.js` promete.
        assert.ok(fs.existsSync(path.join(codex, '.codex', 'rsc')), 'sus habilidades van en .codex/rsc');
        assert.ok(fs.existsSync(path.join(codex, 'AGENTS.md')), 'y lo que lee siempre es AGENTS.md');
        assert.equal(dondeM.puedeTenerBotones(), false, 'a Codex RSC no le escribe comandos');

        // El raíl, en su sitio y nombrado donde Codex lo lee: no los encuentra
        // solo, como Claude.
        assert.ok(fs.existsSync(path.join(codex, '.codex', 'rsc', 'executive-lab', 'SKILL.md')), 'falta la habilidad propia');
        assert.match(fs.readFileSync(path.join(codex, 'AGENTS.md'), 'utf8'), /executive-lab\/SKILL\.md/, 'y AGENTS.md la nombra');

        // Y las habilidades se leen: 32 del arnés más la nuestra.
        const s = cargar('saberes').queSabe(RAIZ);
        assert.ok(s.instaladas > 30, `se leen sus habilidades: ${s.instaladas}`);
        assert.equal(cargar('saberes').comoSePide('bro').startsWith('/'), false, 'con Codex se pide con palabras, no con barra');

        // Lo que ahí NO hay, dicho y no callado: RSC engancha los frenos solo
        // para Claude (`targets/claude.js` y ningún otro), así que un alumno
        // con Codex no tiene ninguno — y tiene que enterarse.
        assert.equal(dondeM.puedeTenerFrenos(), false);
        const q = cargar('reglas').queHay();
        assert.equal(q.guardianes.length, 0, 'no hay ni uno, y es verdad');
        const pintado = require('./panel-falso').montarPanel().mandar({ tipo: 'reglas', ...q });
        assert.match(pintado, /no trae frenos/, 'y la pantalla lo dice en vez de omitir la sección');

        // Y no se le cuenta como «apagado» algo que ahí ni existe, aunque
        // nuestros raíles dejen su interruptor puesto.
        const apagado = cargar('reglas').loApagado().map((a) => a.nombre);
        assert.ok(!apagado.includes('La revisión periódica de habilidades'),
          `en Codex esa revisión no existe, así que no está «apagada»: ${apagado.join(', ')}`);
      } finally {
        vscode.guion.raiz = empresa;
      }
      return 'montado con RSC, raíles puestos, y lo que no hay se dice';
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
