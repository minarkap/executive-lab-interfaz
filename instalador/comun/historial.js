// El historial de la carpeta del alumno: iniciarlo, guardar copias, volver
// atrás y subirlas a GitHub. Por debajo es git; por delante, ni una palabra de
// git (docs/diccionario.md).
//
// Un solo motor: el git de verdad
// --------------------------------
// Hubo dos. Al principio git no era obligatorio —en macOS, el `/usr/bin/git`
// que parece haber abre el diálogo de instalar las herramientas de Apple—, y
// las copias las hacía `isomorphic-git`, git escrito en JavaScript. Desde que
// git se instala siempre (`git.js` dice por qué, decisión 26), la barra pedía
// el binario, el mismo que usa el arnés, y el de JavaScript quedó de resto:
// sin probar, porque nada de este repositorio trae ya esa biblioteca, y
// elegido solo si un instalador de antes la había dejado en el disco. Se
// retiró el 28-09-2026.
//
// Quién lo usa: `extension/src/guardar.js` (guardar, el guardado solo, volver a
// como estaba y subir a GitHub). Vive aquí, en comun/, porque viaja dentro de la
// extensión (`media/comun/`, que copia `preparar-paquete.js`); en desarrollo se
// resuelve desde el propio repo.

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const QUIEN = { name: 'Executive Lab', email: 'alumno@executivelab.local' };

// Cómo se queja git cuando no sabe quién eres. Lo dice en el idioma del
// sistema, así que se reconoce por lo que no se traduce: los nombres de las
// dos claves de configuración que pide, y su plantilla de ejemplo.
const SIN_IDENTIDAD = /user\.email|user\.name|unable to auto-detect email|tell me who you are/i;
const RAMA = 'main';

// ───────────────────────────── el motor binario ───────────────────────────────

function motorBinario(ejecutable) {
  function correr(dir, args, entorno = null) {
    return new Promise((resolver) => {
      execFile(ejecutable, ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, ...(entorno ? { env: { ...process.env, ...entorno } } : {}) },
        (error, salida, err) => resolver({ codigo: error ? (error.code ?? 1) : 0, salida: salida || '', error: err || '' }));
    });
  }

  const exigir = async (dir, args, entorno = null) => {
    const r = await correr(dir, args, entorno);
    if (r.codigo !== 0) throw new Error(`git ${args[0]}: ${r.error.trim() || r.codigo}`);
    return r.salida;
  };

  const contarCambios = async (dir) => {
    const salida = await exigir(dir, ['status', '--porcelain']);
    return salida.trim() ? salida.trim().split('\n').length : 0;
  };

  return {
    nombre: 'binario',
    ejecutable,

    async iniciar(dir) {
      await exigir(dir, ['init', '-q', '-b', RAMA]);
      await exigir(dir, ['config', 'user.name', QUIEN.name]);
      await exigir(dir, ['config', 'user.email', QUIEN.email]);
    },

    cuantosCambios: contarCambios,

    async guardar(dir, mensaje, { excluir = [] } = {}) {
      if (!(await contarCambios(dir))) return { ok: true, sinCambios: true, cuantos: 0, excluidos: [] };

      // Lo que no entra en la copia (F1): lo que quien llama reconoce como una
      // credencial y git no seguía. Con un pathspec que lo excluye, sin tocar el
      // `.gitignore` de nadie; una que ya estaba en git sigue, y eso lo decide
      // la persona.
      //
      // «Ya en git» es lo que está en la última copia, no en el índice (revisión
      // de F6): un `.env` añadido con `git add` y sin copia todavía no lo está. Y
      // el pathspec solo decide lo que se añade ahora: lo que ya estaba en el
      // índice se saca de él, sin tocar el disco.
      const enLaCopia = await correr(dir, ['ls-tree', '-r', '-z', '--name-only', 'HEAD']);
      const seguidos = new Set(enLaCopia.codigo === 0 ? enLaCopia.salida.split('\0').filter(Boolean) : []);
      const fuera = excluir.filter((rel) => fs.existsSync(path.join(dir, rel)) && !seguidos.has(rel));
      if (fuera.length) await exigir(dir, ['rm', '--cached', '-q', '--ignore-unmatch', '--', ...fuera]);
      await exigir(dir, ['add', '-A', '--', '.', ...fuera.map((rel) => `:(exclude,literal)${rel}`)]);

      // Se cuenta lo que va a entrar, no lo que cambió: si solo cambió lo que se
      // queda fuera, no hay copia que hacer.
      const preparados = (await exigir(dir, ['diff', '--cached', '--name-only'])).trim();
      const cuantos = preparados ? preparados.split('\n').length : 0;
      if (!cuantos) return { ok: true, sinCambios: true, cuantos: 0, excluidos: fuera };

      // ── Un git recién instalado no sabe quién eres ────────────────────
      //
      // `iniciar()` pone el nombre y el correo, pero solo cuando somos
      // nosotros los que creamos el historial. En una carpeta que ya tenía
      // git —o en un ordenador recién estrenado, donde nadie ha configurado
      // nada— el `commit` se cae con «Please tell me who you are», y el
      // alumno recibía «No puedo guardar copias en este ordenador. Pulsa
      // Algo va mal»: un callejón por algo que se arregla con una orden.
      //
      // Se pone **solo en esta carpeta**, nunca en todo el ordenador: lo de
      // esa persona no se toca, y un git suyo con su nombre sigue igual.
      try {
        await exigir(dir, ['commit', '-q', '-m', mensaje]);
      } catch (error) {
        if (!SIN_IDENTIDAD.test(String(error && error.message))) throw error;
        await exigir(dir, ['config', '--local', 'user.name', QUIEN.name]);
        await exigir(dir, ['config', '--local', 'user.email', QUIEN.email]);
        await exigir(dir, ['commit', '-q', '-m', mensaje]);
      }
      return { ok: true, cuantos, excluidos: fuera };
    },

    async historial(dir, cuantas) {
      // %x09 es un tabulador: separador seguro porque nuestros textos no lo llevan.
      const salida = await exigir(dir, ['log', `-n${cuantas}`, '--pretty=format:%H%x09%cI%x09%s']);
      if (!salida.trim()) return [];
      return salida.trim().split('\n').map((linea) => {
        const [id, cuando, asunto] = linea.split('\t');
        return { id, cuando, asunto };
      });
    },

    // `--reset -u`, sin `-m`: con un solo árbol, git 2.4x en adelante rechaza
    // la combinación con "Which one? -m, --reset, or --prefix?". Es como
    // estaba escrito en guardar.js desde el principio, así que "Volver a como
    // estaba antes" nunca llegó a funcionar por el camino del binario.
    volverA: (dir, id) => exigir(dir, ['read-tree', '--reset', '-u', id]),
    enlazar: async (dir, url) => {
      await correr(dir, ['remote', 'remove', 'origin']);
      await exigir(dir, ['remote', 'add', 'origin', url]);
    },

    async subir(dir, { url, token, rama }) {
      // El token no va en la orden, que se ve en la lista de procesos mientras
      // corre y que un git de antes repetía entera en su error (F2). Va en una
      // cabecera, por el entorno de esta sola invocación: ni en el disco ni en
      // la configuración del repositorio. Se suma a lo que ya hubiera en el
      // entorno con `GIT_CONFIG_COUNT`, sin pisarlo.
      //
      // Y esa es la única clave. Con una que no vale, git pide un usuario: el
      // llavero de macOS probaría la cuenta que tenga guardada quien sea, y el
      // gestor de credenciales de Git para Windows abriría una ventana para
      // entrar en GitHub. Un `credential.helper` vacío deja la lista de
      // ayudantes vacía, y sin terminal no hay a quién preguntar: si la clave no
      // vale, lo dice la barra. Lo enseñó la subida de verdad (28-09-2026).
      const cuantas = Number.parseInt(process.env.GIT_CONFIG_COUNT || '0', 10) || 0;
      const pares = [
        ['http.extraHeader', `Authorization: Basic ${Buffer.from(`${token}:x-oauth-basic`).toString('base64')}`],
        ['credential.helper', ''],
      ];
      const entorno = { GIT_CONFIG_COUNT: String(cuantas + pares.length), GIT_TERMINAL_PROMPT: '0' };
      pares.forEach(([clave, valor], i) => {
        entorno[`GIT_CONFIG_KEY_${cuantas + i}`] = clave;
        entorno[`GIT_CONFIG_VALUE_${cuantas + i}`] = valor;
      });
      await exigir(dir, ['push', url, `${rama}:${rama}`], entorno);
    },

    async rama(dir) {
      const salida = await exigir(dir, ['rev-parse', '--abbrev-ref', 'HEAD']);
      return salida.trim() || RAMA;
    },

    async fechaDe(dir, id) {
      const salida = await exigir(dir, ['show', '-s', '--format=%cI', id]);
      return salida.trim() || null;
    },
  };
}

// ───────────────────────────── elegir motor ───────────────────────────────────

let elegido;

// `opciones.git` es la ruta al binario, si quien llama ya la sabe (la extensión
// la tiene en entorno.js). `opciones.recalcular` es para las pruebas.
function motor(opciones = {}) {
  if (elegido && !opciones.recalcular) return elegido;

  const ejecutable = opciones.git || (process.platform === 'win32' ? 'git.exe' : 'git');
  elegido = motorBinario(ejecutable);
  return elegido;
}

// ───────────────────────────── la puerta de casa ──────────────────────────────
//
// Seis verbos, todos con el mismo contrato: { ok, ... } y nunca una excepción
// hacia fuera. El texto para el alumno lo pone quien llama, que es el que sabe
// en qué pantalla está.

const fallo = (error) => ({ ok: false, error: error instanceof Error ? error.message : String(error) });

async function iniciar(carpeta, opciones) {
  try {
    if (fs.existsSync(path.join(carpeta, '.git'))) return { ok: true, yaEstaba: true };
    await motor(opciones).iniciar(carpeta);
    return { ok: true };
  } catch (error) { return fallo(error); }
}

// `opciones.excluir`: rutas relativas que no entran en la copia, si git no las
// seguía ya (F1). Las reconoce quien llama; aquí no se sabe qué es una credencial.
async function guardar(carpeta, mensaje, opciones) {
  try {
    return await motor(opciones).guardar(carpeta, mensaje, { excluir: (opciones && opciones.excluir) || [] });
  } catch (error) { return fallo(error); }
}

async function historial(carpeta, cuantas = 10, opciones) {
  try {
    return { ok: true, copias: await motor(opciones).historial(carpeta, cuantas) };
  } catch (error) { return { ...fallo(error), copias: [] }; }
}

async function volverA(carpeta, id, opciones) {
  if (!/^[0-9a-f]{7,64}$/i.test(id)) return { ok: false, error: 'identificador con mala pinta' };
  try {
    const m = motor(opciones);
    const cuando = await m.fechaDe(carpeta, id).catch(() => null);
    await m.volverA(carpeta, id);
    return { ok: true, cuando };
  } catch (error) { return fallo(error); }
}

async function enlazar(carpeta, url, opciones) {
  try {
    await motor(opciones).enlazar(carpeta, url);
    return { ok: true };
  } catch (error) { return fallo(error); }
}

// Lo que diga git al fallar se limpia del token, en todas las formas en que
// puede ir, por si algún camino lo repite: ese texto acaba en el informe de
// «Algo va mal» (F2).
function sinElToken(texto, token) {
  if (!token) return texto;
  let limpio = String(texto);
  for (const forma of [token, encodeURIComponent(token), Buffer.from(`${token}:x-oauth-basic`).toString('base64')]) {
    limpio = limpio.split(forma).join(`••••${token.slice(-4)}`);
  }
  return limpio;
}

async function subir(carpeta, { url, token }, opciones) {
  try {
    const m = motor(opciones);
    const rama = await m.rama(carpeta);
    await m.subir(carpeta, { url, token, rama });
    return { ok: true, rama };
  } catch (error) {
    const dicho = fallo(error);
    return { ...dicho, error: sinElToken(dicho.error, token) };
  }
}

async function cuantosCambios(carpeta, opciones) {
  try {
    return await motor(opciones).cuantosCambios(carpeta);
  } catch { return 0; }
}

// ¿Se pueden guardar copias en este ordenador? Con el motor de JavaScript la
// respuesta es que sí siempre: viaja con nosotros. Solo hay algo que preguntar
// cuando hemos caído al binario, que puede no estar.
function disponible(opciones) {
  const m = motor(opciones);
  if (m.nombre === 'js') return Promise.resolve(true);
  return new Promise((resolver) => {
    execFile(m.ejecutable, ['--version'], (error) => resolver(!error));
  });
}

// Para el informe de "Algo va mal" y para las pruebas.
const queMotor = (opciones) => motor(opciones).nombre;

module.exports = { iniciar, guardar, historial, volverA, enlazar, subir, cuantosCambios, disponible, queMotor, RAMA };
