#!/usr/bin/env node
// Deja las piezas puestas. Nada más.
//
//   node preparar.js --asistente claude
//   node preparar.js --sin-editor        (para probar sin tocar el VS Code de quien prueba)
//
// ── El reparto ───────────────────────────────────────────────────────────
//
// El instalador pone las **piezas**: el editor, git, Node y las dos
// extensiones. Se acabó ahí.
//
// Todo lo demás —elegir carpeta, preguntar de qué va esto, el objetivo, los
// nombres, la web, montar el arnés, los raíles, la primera copia— lo hace el
// **panel**, cuando esa persona abre una carpeta y pulsa "Preparar esta
// carpeta". Y lo hace ya, entero, en `extension/src/arrancar.js`.
//
// Antes esto montaba también un arnés en `Documentos/Mi Empresa IA`, con seis
// preguntas dentro del instalador. Eso significaba dos cosas malas: que había
// dos versiones del mismo onboarding —esta y la del panel— que había que
// mantener a la par, y que el instalador decidía por adelantado en qué carpeta
// iba a trabajar alguien que todavía no había abierto el programa.
//
// El Node portable que ejecuta esto vive en la misma carpeta que este fichero.
// No imprime nada para que lo lea el alumno: escribe un registro y devuelve 0
// o 1. Quien enseña la barra de progreso es el instalador.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const git = require('./git');
const { escribirAjustes } = require('./ajustes');

const APP = __dirname;
const ES_WINDOWS = process.platform === 'win32';
const NODE = process.execPath;

const primero = (rutas, respaldo) => rutas.find((r) => r && fs.existsSync(r)) || respaldo;

// ------------------------------------------------------------------ ayudas

function argumento(nombre, porDefecto = null) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto;
}

const registro = [];
const anotar = (linea) => registro.push(`[${new Date().toISOString()}] ${linea}`);

// PATH con nuestro Node delante: los enganches del arnés lo llaman por nombre.
function entorno() {
  const env = { ...process.env };
  const clave = Object.keys(env).find((k) => k.toLowerCase() === 'path') || 'PATH';
  env[clave] = [path.dirname(NODE), env[clave] || ''].join(path.delimiter);
  return env;
}

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

// ------------------------------------------------------------------- pasos

// git es obligatorio y no lo llevamos dentro: se lanza el instalador oficial
// del sistema. El porqué de las dos cosas está en comun/git.js y en la
// decisión 26.
//
// Aquí se falla en alto si no aparece: sin git, el panel no puede preparar
// ninguna carpeta, y es mejor saberlo ahora —con la barra de progreso del
// instalador delante— que la primera vez que alguien pulse el botón.
async function asegurarGit() {
  if (await git.hay()) {
    anotar('git: ya estaba.');
    return true;
  }

  anotar('git: no está; lanzando el instalador oficial del sistema.');
  const hecho = await git.instalar({}, (que) => anotar(`git: ${que}`));
  if (!hecho.ok) {
    anotar(`ERROR: no he podido dejar git puesto (${hecho.mensaje}).`);
    return false;
  }
  anotar('git: instalado.');
  return true;
}

// La línea de comandos de VS Code, por su ruta completa: recién instalado, el
// PATH de este proceso todavía no la tiene.
function code() {
  if (ES_WINDOWS) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return primero([path.join(local, 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd')], 'code.cmd');
  }
  // El instalador de macOS lo pone en ~/Applications, que no pide
  // administrador. Si esa persona ya lo tenía en /Applications, se usa el suyo.
  const dentroDeLaApp = path.join('Visual Studio Code.app', 'Contents', 'Resources', 'app', 'bin', 'code');
  return primero([
    path.join(os.homedir(), 'Applications', dentroDeLaApp),
    path.join('/Applications', dentroDeLaApp),
  ], 'code');
}

const EXTENSION_DEL_ASISTENTE = { claude: 'anthropic.claude-code', codex: 'openai.chatgpt' };

function vestirElEditor(asistente) {
  const cli = code();
  const suya = EXTENSION_DEL_ASISTENTE[asistente] || EXTENSION_DEL_ASISTENTE.claude;
  let bien = correrCmd(cli, ['--install-extension', suya, '--force']).codigo === 0;

  const vsix = path.join(APP, 'executive-lab.vsix');
  if (fs.existsSync(vsix)) bien = correrCmd(cli, ['--install-extension', vsix, '--force']).codigo === 0 && bien;
  else anotar('AVISO: no encuentro executive-lab.vsix junto a este script.');

  if (!bien) anotar('ERROR: no se han podido instalar las extensiones del editor.');
  return bien;
}

// Las que VS Code declara de ámbito de programa: no admiten vivir en una
// carpeta, así que van a los ajustes del editor. Son pocas y no cambian el
// aspecto de nada: confianza del workspace, actualizaciones, telemetría.
//
// El resto del disfraz —todo lo que se ve— lo escribe la extensión en el
// .vscode/settings.json de cada carpeta, cuando esa persona lo enciende. Aquí
// no se escribe porque aquí todavía no hay ninguna carpeta.
const SOLO_DEL_EDITOR = [
  'security.workspace.trust.enabled',
  'update.mode',
  'update.showReleaseNotes',
  'telemetry.telemetryLevel',
  'extensions.ignoreRecommendations',
];

function ajustesDelEditor() {
  const plantilla = path.join(APP, 'disfraz.json');
  if (!fs.existsSync(plantilla)) {
    anotar('AVISO: no encuentro disfraz.json; los ajustes de programa se quedan como estaban.');
    return;
  }

  // --sin-editor también se los salta: si no, "probar sin tocar el VS Code de
  // quien prueba" le apagaba las actualizaciones y la telemetría de verdad.
  if (process.argv.includes('--sin-editor')) {
    anotar('Ajustes del editor: omitidos (--sin-editor).');
    return;
  }

  const disfraz = JSON.parse(fs.readFileSync(plantilla, 'utf8'));
  const usuario = ES_WINDOWS
    ? path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Code', 'User')
    : process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User')
      : path.join(os.homedir(), '.config', 'Code', 'User');

  const delEditor = {};
  for (const clave of SOLO_DEL_EDITOR) {
    if (clave in disfraz) delEditor[clave] = disfraz[clave];
  }
  escribirAjustes(path.join(usuario, 'settings.json'), delEditor, 'los ajustes del editor', anotar);
}

// -------------------------------------------------------------------- main

async function main() {
  const asistente = argumento('asistente', 'claude');
  anotar(`Executive Lab · ${process.platform} · node ${process.version} · asistente: ${asistente}`);

  let bien = await asegurarGit();

  if (process.argv.includes('--sin-editor')) anotar('Extensiones: omitidas (--sin-editor).');
  else bien = vestirElEditor(asistente) && bien;

  ajustesDelEditor();

  anotar(bien
    ? 'Listo. El resto lo hace el panel cuando se abra una carpeta.'
    : 'Ha quedado algo sin poner; mira las líneas de ERROR de arriba.');

  // No hay carpeta de trabajo todavía, así que el registro se queda junto a la
  // app; si ni eso se puede, en la carpeta temporal del sistema.
  const texto = `${registro.join('\n')}\n`;
  try {
    fs.writeFileSync(path.join(APP, 'instalacion.log'), texto);
  } catch {
    fs.writeFileSync(path.join(os.tmpdir(), 'executive-lab-instalacion.log'), texto);
  }

  process.exit(bien ? 0 : 1);
}

main().catch((error) => {
  anotar(`ERROR sin recoger: ${error && error.stack ? error.stack : error}`);
  try {
    fs.writeFileSync(path.join(os.tmpdir(), 'executive-lab-instalacion.log'), `${registro.join('\n')}\n`);
  } catch { /* si ni eso se puede, queda el código de salida */ }
  process.exit(1);
});
