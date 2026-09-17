// Ejecutar cosas sin que el alumno vea una terminal.
//
// Nada de vscode.Terminal: eso abre un panel negro con texto corriendo, que es
// exactamente lo que este proyecto existe para evitar. Todo va por spawn, con
// ejecutables reales (ver entorno.js), y lo que devuelve se traduce antes de
// enseñarlo.

const { spawn } = require('node:child_process');
const proyecto = require('./proyecto');
const entorno = require('./entorno');

function ejecutar(programa, args, opciones = {}) {
  const { cwd = proyecto.raiz(), tiempoMaximo = 180000, env, verbatim = false } = opciones;

  return new Promise((resolve) => {
    if (!cwd) {
      resolve({ codigo: -1, salida: '', error: 'No hay carpeta de trabajo abierta.' });
      return;
    }

    let proceso;
    try {
      proceso = spawn(programa, args, {
        cwd,
        env: entorno.entornoConHerramientas(env || process.env),
        windowsHide: true,
        windowsVerbatimArguments: verbatim,
      });
    } catch (e) {
      resolve({ codigo: -1, salida: '', error: e.message });
      return;
    }

    let salida = '';
    let error = '';
    let cortado = false;

    const reloj = setTimeout(() => {
      cortado = true;
      proceso.kill();
    }, tiempoMaximo);

    proceso.stdout.on('data', (d) => { salida += d.toString(); });
    proceso.stderr.on('data', (d) => { error += d.toString(); });

    proceso.on('error', (e) => {
      clearTimeout(reloj);
      resolve({ codigo: -1, salida, error: e.message });
    });

    proceso.on('close', (codigo) => {
      clearTimeout(reloj);
      resolve({ codigo, salida, error: cortado ? 'Ha tardado demasiado y lo he parado.' : error });
    });
  });
}

const git = (...args) => ejecutar(entorno.git(), args);
const node = (args, opciones) => ejecutar(entorno.node(), args, opciones);
const bash = (script, opciones) => ejecutar(entorno.bash(), [script], opciones);

// Un programa del PATH que en Windows sería un .cmd (npx, code): nunca se
// lanza directo — Node lo rechaza con EINVAL —, pasa por cmd.exe con la línea
// ya citada. En los demás sistemas es un ejecutable normal.
const citar = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);
function delPath(programa, args, opciones) {
  if (!entorno.ES_WINDOWS) return ejecutar(programa, args, opciones);
  const linea = [programa, ...args].map(citar).join(' ');
  return ejecutar('cmd.exe', ['/d', '/s', '/c', `"${linea}"`], { ...opciones, verbatim: true });
}

module.exports = { ejecutar, git, node, bash, delPath };
