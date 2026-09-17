#!/usr/bin/env node
// Prepara el espacio de trabajo del alumno. Lo llaman el instalador de Windows
// y el de macOS; aquí está toda la lógica para que solo haya una versión.
//
//   node preparar.js --destino "<carpeta>" --objetivo "organizar mis facturas" --asistente claude
//
// Lo ejecuta el Node portable que deja el instalador en la misma carpeta que
// este fichero, y a su lado están git (MinGit en Windows) y el arnés ya
// instalado con la versión fijada. Así no hace falta npx, ni red hacia npm,
// ni que el alumno tenga nada en el sistema.
//
// No imprime nada para que lo lea el alumno: escribe un registro en un fichero
// y devuelve 0 o 1. Quien enseña la barra de progreso es el instalador.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const VERSION_DEL_CATALOGO = '1.4.1'; // fijada a propósito: toda la cohorte igual
// Si el alumno no da nombre. Un arnés puede ser la contabilidad, el personal o
// un proyecto, así que el nombre por defecto no presupone ninguna de las tres.
const NOMBRE_POR_DEFECTO = 'Mi trabajo';
const APP = __dirname;
const ES_WINDOWS = process.platform === 'win32';

// ------------------------------------------------------------ herramientas

const existe = (...partes) => fs.existsSync(path.join(...partes));
const primero = (rutas, respaldo) => rutas.find((r) => r && fs.existsSync(r)) || respaldo;

const NODE = process.execPath;
const GIT = primero([path.join(APP, 'git', 'cmd', 'git.exe'), path.join(APP, 'git', 'bin', 'git')], ES_WINDOWS ? 'git.exe' : 'git');
const ARNES = primero([path.join(APP, 'harness', 'node_modules', '@ericrisco', 'rsc', 'scripts', 'rsc.js')], null);
const NPX_CLI = primero([
  path.join(path.dirname(NODE), 'node_modules', 'npm', 'bin', 'npx-cli.js'),
  path.join(path.dirname(NODE), '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
], null);

// PATH con nuestras carpetas delante: los scripts del arnés llaman a git y a
// node por nombre.
function entorno() {
  const env = { ...process.env };
  const clave = Object.keys(env).find((k) => k.toLowerCase() === 'path') || 'PATH';
  const delante = [path.dirname(NODE), path.join(APP, 'git', 'cmd'), path.join(APP, 'git', 'usr', 'bin')].filter((d) => fs.existsSync(d));
  env[clave] = [...delante, env[clave] || ''].join(path.delimiter);
  return env;
}

// ------------------------------------------------------------------ ayudas

function argumento(nombre, porDefecto = null) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto;
}

const registro = [];
const anotar = (linea) => registro.push(`[${new Date().toISOString()}] ${linea}`);

function correr(programa, args, opciones = {}) {
  anotar(`> ${path.basename(programa)} ${args.join(' ').slice(0, 300)}`);
  const r = spawnSync(programa, args, { encoding: 'utf8', windowsHide: true, env: entorno(), ...opciones });
  const salida = `${r.stdout || ''}${r.stderr || ''}`;
  anotar(r.error ? `ERROR ${r.error.message}` : salida.trim() || '(sin salida)');
  return { codigo: r.error ? -1 : r.status, salida };
}

// En Windows un .cmd nunca se lanza directo — Node lo rechaza con EINVAL —,
// pasa por cmd.exe con la línea ya citada.
const citar = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);
function correrCmd(programa, args) {
  if (!ES_WINDOWS) return correr(programa, args);
  const linea = [programa, ...args].map(citar).join(' ');
  return correr('cmd.exe', ['/d', '/s', '/c', `"${linea}"`], { windowsVerbatimArguments: true });
}

function arnes(args, opciones) {
  if (ARNES) return correr(NODE, [ARNES, ...args], opciones);
  if (NPX_CLI) return correr(NODE, [NPX_CLI, '--yes', `@ericrisco/rsc@${VERSION_DEL_CATALOGO}`, ...args], opciones);
  anotar('ERROR: no hay arnés preinstalado ni npx junto a este node.');
  return { codigo: -1, salida: '' };
}

// Documentos en español o en inglés, según cómo esté el sistema.
function carpetaDeDocumentos() {
  const casa = os.homedir();
  return primero([path.join(casa, 'Documentos'), path.join(casa, 'Documents')], casa);
}

// ------------------------------------------------------------------- pasos

// El instalador de Windows pasa la ruta ya resuelta con --destino, porque él
// conoce la carpeta real de Documentos y aquí solo podríamos adivinarla por el
// nombre. Si nadie la pasa (macOS), se calcula.
function crearCarpeta(nombre) {
  const destino = argumento('destino') || path.join(carpetaDeDocumentos(), nombre);
  fs.mkdirSync(destino, { recursive: true });
  anotar(`Carpeta de trabajo: ${destino}`);
  return destino;
}

// Hace falta para que "Guardar copia de seguridad" tenga dónde guardar. Sin
// git no hay producto, así que aquí sí se falla en alto.
function prepararHistorial(destino) {
  if (existe(destino, '.git')) return true;
  if (correr(GIT, ['init', '-q'], { cwd: destino }).codigo !== 0) {
    anotar('ERROR: no hay git. Las copias de seguridad no funcionarían.');
    return false;
  }
  correr(GIT, ['config', 'user.name', 'Executive Lab'], { cwd: destino });
  correr(GIT, ['config', 'user.email', 'alumno@executivelab.local'], { cwd: destino });
  // El registro de esta instalación no es trabajo del alumno.
  fs.appendFileSync(path.join(destino, '.gitignore'), 'instalacion.log\n');
  return true;
}

// El arnés, en los dos pasos que RSC exige: primero enseña el plan y su
// huella, y solo escribe cuando se le devuelve esa misma huella. La línea de
// aceptación se reutiliza tal cual la imprime RSC — con el objetivo en base64
// y los mismos flags — para que la huella no pueda dejar de coincidir.
function montarElArnes(destino, objetivo, asistente) {
  const flags = [
    '--technical-level', 'non-technical',
    '--accompaniment', 'L3',
    '--project-kind', 'operations',
    '--goal', objetivo,
    '--target', asistente,
  ];

  const previo = arnes(['onboard', ...flags], { cwd: destino, timeout: 600000 });
  const huella = (previo.salida.match(/Plan id:\s*([0-9a-f]{64})/i) || [])[1];
  if (!huella) {
    anotar('ERROR: el arnés no ha devuelto una huella de plan.');
    return false;
  }

  const lineaDeAceptacion = (previo.salida.match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
  const aceptar = lineaDeAceptacion ? lineaDeAceptacion.trim().split(/\s+/) : [...flags, '--accept-plan', huella];

  const aplicado = arnes(['onboard', ...aceptar], { cwd: destino, timeout: 900000 });
  if (/RSC_ONBOARDING_INCOMPLETE|RSC_PLAN_CHANGED/.test(aplicado.salida)) {
    anotar('ERROR: el arnés no se ha aplicado entero.');
    return false;
  }
  return aplicado.codigo === 0 && /RSC_ONBOARDING_READY/.test(aplicado.salida);
}

// El suelo que RSC exige para dar por bueno un arnés. Si falta algo, el alumno
// se quedaría con una carpeta a medias sin forma de saberlo.
function comprobarElSuelo(destino) {
  const faltan = ['.rsc.json', path.join('01-TOOLS', '_TEMPLATE'), path.join('02-DOCS', 'wiki', 'harness')]
    .filter((pieza) => !existe(destino, pieza));
  if (faltan.length) anotar(`ERROR: falta el suelo del arnés: ${faltan.join(', ')}`);
  return faltan.length === 0;
}

function ponerLosRailes(destino) {
  const aplicar = path.join(APP, 'skills', 'aplicar.js');
  if (!fs.existsSync(aplicar)) {
    anotar(`AVISO: no encuentro los raíles en ${aplicar}`);
    return false;
  }
  return correr(NODE, [aplicar, destino]).codigo === 0;
}

// La primera copia de seguridad. Sin ella, "Volver a como estaba antes" no
// tendría a dónde volver hasta que el alumno guardara la primera.
function primeraCopia(destino) {
  correr(GIT, ['add', '-A'], { cwd: destino });
  const fecha = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  return correr(GIT, ['commit', '-q', '-m', `Punto de partida — ${fecha}`], { cwd: destino }).codigo === 0;
}

// Los dos nombres, al frontmatter del perfil del arnés: de ahí salen el rótulo
// de la ventana y los textos del panel. Es el mismo sitio que usa el wizard
// cuando se monta un arnés desde dentro del editor.
function ponerLosNombres(destino, arnes, empresa) {
  const perfil = path.join(destino, '02-DOCS', 'wiki', 'harness', 'user-profile.md');
  if (!fs.existsSync(perfil)) return;

  const texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloque) return;

  let cabecera = bloque[1];
  for (const [clave, valor] of [['arnes', arnes], ['empresa', empresa]]) {
    if (!valor) continue;
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    cabecera = linea.test(cabecera) ? cabecera.replace(linea, `${clave}: ${valor}`) : `${cabecera}\n${clave}: ${valor}`;
  }
  fs.writeFileSync(perfil, texto.replace(bloque[0], `---\n${cabecera}\n---`));
  anotar(`Nombres: ${arnes}${empresa ? ` · ${empresa}` : ''}`);
}

// Los dos nombres, al frontmatter del perfil del arnés: de ahí salen el rótulo
// de la ventana y los textos del panel. Es el mismo sitio que usa el wizard
// cuando se monta un arnés desde dentro del editor.
function ponerLosNombres(destino, arnes, empresa) {
  const perfil = path.join(destino, '02-DOCS', 'wiki', 'harness', 'user-profile.md');
  if (!fs.existsSync(perfil)) return;

  const texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloque) return;

  let cabecera = bloque[1];
  for (const [clave, valor] of [['arnes', arnes], ['empresa', empresa]]) {
    if (!valor) continue;
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    cabecera = linea.test(cabecera) ? cabecera.replace(linea, `${clave}: ${valor}`) : `${cabecera}\n${clave}: ${valor}`;
  }
  fs.writeFileSync(perfil, texto.replace(bloque[0], `---\n${cabecera}\n---`));
  anotar(`Nombres: ${arnes}${empresa ? ` · ${empresa}` : ''}`);
}

// En la máquina de un alumno la vista sencilla va encendida desde el primer
// arranque: es la única carpeta que hay y no tiene por qué saber que existe un
// interruptor. En cualquier otra, se enciende a mano.
function encenderVistaSencilla(destino) {
  const carpeta = path.join(destino, '.vscode');
  fs.mkdirSync(carpeta, { recursive: true });
  const fichero = path.join(carpeta, 'settings.json');

  let ajustes = {};
  if (fs.existsSync(fichero)) {
    try {
      ajustes = JSON.parse(fs.readFileSync(fichero, 'utf8'));
    } catch {
      anotar('AVISO: el settings.json de la carpeta no es JSON; no lo toco.');
      return;
    }
  }
  ajustes['executiveLab.vistaSencilla'] = true;
  fs.writeFileSync(fichero, `${JSON.stringify(ajustes, null, 2)}\n`);
  anotar('Vista sencilla encendida en esta carpeta');
}

// La línea de comandos de VS Code, por su ruta completa: recién instalado, el
// PATH de este proceso todavía no la tiene.
function code() {
  if (ES_WINDOWS) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return primero([path.join(local, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')], 'code.cmd');
  }
  return primero(['/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'], 'code');
}

function vestirElEditor() {
  const cli = code();
  let bien = correrCmd(cli, ['--install-extension', 'anthropic.claude-code', '--force']).codigo === 0;

  const vsix = path.join(APP, 'executive-lab.vsix');
  if (fs.existsSync(vsix)) bien = correrCmd(cli, ['--install-extension', vsix, '--force']).codigo === 0 && bien;
  else anotar('AVISO: no encuentro executive-lab.vsix junto a este script.');

  if (!bien) anotar('ERROR: no se han podido instalar las extensiones del editor.');
  return bien;
}

// Las que VS Code declara de ambito de programa: no admiten vivir en una
// carpeta, asi que van a los ajustes del editor. Son pocas y no cambian el
// aspecto de nada: confianza del workspace, actualizaciones, telemetria, zoom.
const SOLO_DEL_EDITOR = [
  'security.workspace.trust.enabled',
  'update.mode',
  'update.showReleaseNotes',
  'telemetry.telemetryLevel',
  'extensions.ignoreRecommendations',
];

// El disfraz, escrito antes del primer arranque para que la primera vez ya se
// vea bien — si no, VS Code pregunta si confia en los autores de una carpeta
// que acaba de crear el propio alumno.
//
// Casi todo va al .vscode/settings.json DE SU CARPETA, no a los del editor:
// asi, si esa persona abre cualquier otra cosa con el mismo VS Code, se la
// encuentra tal y como la tenia. Es el mismo reparto que hace la extension.
function vestirAntesDeAbrir(destino) {
  const plantilla = path.join(APP, 'disfraz.json');
  if (!fs.existsSync(plantilla)) {
    anotar('AVISO: no encuentro disfraz.json; el disfraz lo pondra la extension.');
    return;
  }
  const disfraz = JSON.parse(fs.readFileSync(plantilla, 'utf8'));

  // 1. Lo que se ve, en la carpeta. Con el interruptor encendido.
  const deLaCarpeta = { 'executiveLab.vistaSencilla': true };
  for (const [clave, valor] of Object.entries(disfraz)) {
    if (!SOLO_DEL_EDITOR.includes(clave)) deLaCarpeta[clave] = valor;
  }
  // El rotulo lleva los nombres que puso el alumno, no el de la plantilla.
  deLaCarpeta['window.title'] = argumento('arnes')
    ? [argumento('arnes'), argumento('empresa')].filter(Boolean).join(' \u00b7 ')
    : disfraz['window.title'];

  escribirAjustes(path.join(destino, '.vscode', 'settings.json'), deLaCarpeta, 'la carpeta de trabajo');

  // 2. Las cuatro de ambito de programa, en el editor.
  const usuario = ES_WINDOWS
    ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Code', 'User')
    : process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User')
      : path.join(os.homedir(), '.config', 'Code', 'User');

  const delEditor = {};
  for (const clave of SOLO_DEL_EDITOR) {
    if (clave in disfraz) delEditor[clave] = disfraz[clave];
  }
  escribirAjustes(path.join(usuario, 'settings.json'), delEditor, 'los ajustes del editor');
}

// Escribe sin pisar lo que ya hubiera. Si el fichero no es JSON valido (tiene
// comentarios), no se toca: mejor sin disfraz que romperle los ajustes.
function escribirAjustes(fichero, nuevos, donde) {
  fs.mkdirSync(path.dirname(fichero), { recursive: true });

  let actuales = {};
  if (fs.existsSync(fichero)) {
    try {
      actuales = JSON.parse(fs.readFileSync(fichero, 'utf8'));
    } catch {
      anotar(`AVISO: ${donde} no es JSON valido; no lo toco.`);
      return;
    }
  }
  fs.writeFileSync(fichero, `${JSON.stringify({ ...actuales, ...nuevos }, null, 2)}\n`);
  anotar(`${Object.keys(nuevos).length} ajustes en ${donde}`);
}

// -------------------------------------------------------------------- main

function main() {
  const objetivo = argumento('objetivo', 'llevar mi trabajo con ayuda de la IA');
  const asistente = argumento('asistente', 'claude');
  const arnes = (argumento('arnes') || NOMBRE_POR_DEFECTO).trim();
  const empresa = (argumento('empresa') || '').trim();

  anotar(`Executive Lab · ${process.platform} · node ${process.version} · objetivo: ${objetivo}`);
  anotar(`git: ${GIT} · arnés: ${ARNES || `npx (${NPX_CLI || 'no encontrado'})`}`);

  const destino = crearCarpeta(arnes);
  let bien = prepararHistorial(destino);
  if (bien) bien = montarElArnes(destino, objetivo, asistente);
  if (bien) bien = comprobarElSuelo(destino);
  if (bien) ponerLosRailes(destino);
  if (bien) ponerLosNombres(destino, arnes, empresa);
  if (bien) primeraCopia(destino);

  // El disfraz de la carpeta es un fichero suyo: se escribe siempre, no
  // depende de que haya editor.
  if (bien) vestirAntesDeAbrir(destino);

  // --sin-editor solo se salta instalar las extensiones, para poder probar
  // todo lo demás sin tocar el VS Code de quien prueba.
  if (process.argv.includes('--sin-editor')) anotar('Extensiones: omitidas (--sin-editor).');
  else bien = vestirElEditor() && bien;

  const donde = path.join(destino, 'instalacion.log');
  try {
    fs.writeFileSync(donde, `${registro.join('\n')}\n`);
  } catch {
    fs.writeFileSync(path.join(os.tmpdir(), 'executive-lab-instalacion.log'), `${registro.join('\n')}\n`);
  }

  process.exit(bien ? 0 : 1);
}

main();
