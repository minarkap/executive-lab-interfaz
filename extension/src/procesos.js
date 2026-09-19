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
    let contestado = false;

    // Una sola respuesta, venga de donde venga. Hace falta porque el reloj ya
    // no espera al proceso: ver abajo.
    const contestar = (respuesta) => {
      if (contestado) return;
      contestado = true;
      resolve(respuesta);
    };

    // ── Por qué el reloj contesta sin esperar a que el proceso muera ───────
    //
    // Esto hacía `kill()` y se quedaba esperando al evento `close`. Y `close`
    // no llega cuando muere el hijo, sino cuando se cierran sus tuberías — o
    // sea, cuando han muerto también sus nietos. Un `test_connection.sh` que
    // llama a `curl` o a `sleep` deja al bash muerto y al nieto vivo, con la
    // tubería abierta.
    //
    // Medido con un script de 120 s y un reloj de 45: la barra tardaba los 120.
    // El alumno ve la pantalla parada el doble de lo que le hemos prometido y
    // piensa que se ha colgado.
    //
    // Así que al saltar el reloj se contesta ya, con lo que haya llegado. Al
    // proceso se le pide que se vaya por las buenas y, si no se va, se le
    // insiste: lo que no se hace es tener a alguien mirando una pantalla
    // quieta por un proceso que ya hemos dado por perdido.
    const reloj = setTimeout(() => {
      cortado = true;
      try { proceso.kill(); } catch { /* ya no está */ }
      setTimeout(() => { try { proceso.kill('SIGKILL'); } catch { /* ya no está */ } }, 2000).unref?.();
      contestar({ codigo: -1, salida, error: 'Ha tardado demasiado y lo he parado.' });
    }, tiempoMaximo);

    proceso.stdout.on('data', (d) => { salida += d.toString(); });
    proceso.stderr.on('data', (d) => { error += d.toString(); });

    proceso.on('error', (e) => {
      clearTimeout(reloj);
      contestar({ codigo: -1, salida, error: e.message });
    });

    proceso.on('close', (codigo) => {
      clearTimeout(reloj);
      contestar({ codigo, salida, error: cortado ? 'Ha tardado demasiado y lo he parado.' : error });
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
