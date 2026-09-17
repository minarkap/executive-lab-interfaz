// Dónde están las herramientas que necesitamos: node, git, bash y el arnés.
//
// En la máquina de un alumno nada de esto está en el PATH: el instalador lo
// deja todo dentro de la carpeta de la app, y aquí se busca primero ahí. Solo
// si no está, se cae a lo que haya en el sistema (que es el caso del portátil
// de quien desarrolla esto).
//
// Y en Windows hay una regla más: nunca se ejecuta un .cmd o un .bat
// directamente. Node (desde 18.20 / 20.12) lo rechaza con EINVAL si no hay
// shell por medio. Así que todo lo que se lanza desde aquí es un .exe de
// verdad — node.exe, git.exe, bash.exe — o pasa por cmd.exe a propósito.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ES_WINDOWS = process.platform === 'win32';

// La carpeta de la app que deja el instalador, si existe.
function carpetaDeLaApp() {
  const declarada = process.env.EXECUTIVE_LAB_HOME;
  if (declarada && fs.existsSync(declarada)) return declarada;

  const candidata = ES_WINDOWS
    ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'ExecutiveLab')
    : '/usr/local/executive-lab';
  return fs.existsSync(candidata) ? candidata : null;
}

// Solo se consideran ejecutables del sistema en el que estamos. Sin esto, un
// Mac con la carga de Windows delante (al construir el instalador, o al
// probar) elegiría un `.exe` y fallaría con un error indescifrable.
function primeroQueExista(rutas, respaldo) {
  const delSistema = rutas.filter((r) => r && (r.endsWith('.exe') === ES_WINDOWS));
  return delSistema.find((r) => fs.existsSync(r)) || respaldo;
}

function node() {
  const app = carpetaDeLaApp();
  return primeroQueExista(
    app ? [path.join(app, 'runtime', 'node.exe'), path.join(app, 'runtime', 'bin', 'node'), path.join(app, 'runtime', 'node')] : [],
    ES_WINDOWS ? 'node.exe' : 'node',
  );
}

function git() {
  const app = carpetaDeLaApp();
  return primeroQueExista(
    app ? [path.join(app, 'git', 'cmd', 'git.exe'), path.join(app, 'git', 'bin', 'git'), path.join(app, 'git', 'usr', 'bin', 'git')] : [],
    ES_WINDOWS ? 'git.exe' : 'git',
  );
}

// Los test_connection.sh de RSC piden bash. MinGit no trae bash.exe, pero su
// usr/bin/sh.exe es el mismo bash en modo POSIX (comprobado con la 2.55):
// entiende BASH_SOURCE y pipefail, que es lo que esos scripts usan.
function bash() {
  const app = carpetaDeLaApp();
  return primeroQueExista(
    app ? [
      path.join(app, 'git', 'usr', 'bin', 'bash.exe'),
      path.join(app, 'git', 'bin', 'bash.exe'),
      path.join(app, 'git', 'usr', 'bin', 'sh.exe'),
    ] : [],
    ES_WINDOWS ? 'bash.exe' : 'bash',
  );
}

// El punto de entrada del arnés: el instalador lo deja preinstalado con la
// versión fijada, así que no hace falta npx (lento y frágil en Windows). Para
// una máquina de desarrollo, se admite también el node_modules del proyecto.
function entradaDelArnes(raizDelProyecto) {
  const app = carpetaDeLaApp();
  const relativa = path.join('node_modules', '@ericrisco', 'rsc', 'scripts', 'rsc.js');
  return primeroQueExista(
    [
      app && path.join(app, 'harness', relativa),
      raizDelProyecto && path.join(raizDelProyecto, relativa),
    ],
    null,
  );
}

// El npx-cli.js que acompaña al node que vayamos a usar. Es el último recurso
// cuando el arnés no está preinstalado, y sigue evitando el .cmd.
function npxCli() {
  const ejecutable = node();
  if (!path.isAbsolute(ejecutable)) return null; // node del PATH: no sabemos dónde vive
  const base = path.dirname(ejecutable);
  return primeroQueExista(
    [
      path.join(base, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
      path.join(base, '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js'),
    ],
    null,
  );
}

// PATH con nuestras carpetas delante, para los scripts de RSC que invocan
// git o node por nombre.
function entornoConHerramientas(base = process.env) {
  const app = carpetaDeLaApp();
  if (!app) return { ...base };
  const delante = [
    path.join(app, 'runtime'),
    path.join(app, 'runtime', 'bin'),
    path.join(app, 'git', 'cmd'),
    path.join(app, 'git', 'usr', 'bin'),
  ].filter((d) => fs.existsSync(d));
  const clave = Object.keys(base).find((k) => k.toLowerCase() === 'path') || 'PATH';
  return { ...base, [clave]: [...delante, base[clave] || ''].join(path.delimiter) };
}

module.exports = { ES_WINDOWS, carpetaDeLaApp, node, git, bash, entradaDelArnes, npxCli, entornoConHerramientas };
