// Claves que viven fuera de sitio — el caso brownfield.
//
// El panel lee las credenciales de `01-TOOLS/<herramienta>/.env`, que es donde
// las pone RSC. Pero si sueltas esto sobre un proyecto que ya existía, las
// claves están donde estuvieran: un `.env` en la raíz, un `.env.local`, un
// `credentials/`. Ahí no las ve nadie, y el alumno ve "no hay conexiones"
// teniendo seis.
//
// Aquí no se inventa una convención paralela ni se leen esos ficheros: solo se
// detecta que están, para que el panel pueda ofrecer que el asistente los
// ordene con el protocolo de `harness`. Mover credenciales es cosa suya, que
// sabe hacerlo sin romper lo que ya usaba ese proyecto.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');

// Los sitios donde la gente guarda claves de verdad. No se recorre el proyecto
// entero: eso tardaría y encontraría cosas que no son.
const FICHEROS = ['.env', '.env.local', '.env.production', '.env.development', 'env', '.envrc'];
const CARPETAS = ['config', 'credentials', 'secrets', 'env'];

// Una línea con pinta de credencial: MAYUSCULAS_CON_GUION = algo.
const PARECE_CLAVE = /^\s*(?:export\s+)?[A-Z][A-Z0-9_]{2,}\s*=\s*\S/;
const SUENA_A_SECRETO = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|API)/;

function cuantasClavesTiene(fichero) {
  try {
    // Un .env de verdad no ocupa medio mega: si lo ocupa, no es un .env.
    if (fs.statSync(fichero).size > 128 * 1024) return 0;
    return fs.readFileSync(fichero, 'utf8')
      .split('\n')
      .filter((linea) => PARECE_CLAVE.test(linea) && !linea.trim().startsWith('#'))
      .length;
  } catch {
    return 0;
  }
}

function mirar(rutaRelativa, encontradas) {
  const completa = proyecto.ruta(rutaRelativa);
  if (!completa || !fs.existsSync(completa)) return;

  const cuantas = cuantasClavesTiene(completa);
  if (!cuantas) return;

  let secretos = false;
  try {
    secretos = SUENA_A_SECRETO.test(fs.readFileSync(completa, 'utf8'));
  } catch { /* si no se puede leer, se cuenta igual */ }

  encontradas.push({ donde: rutaRelativa, cuantas, secretos });
}

// Devuelve los sitios con claves que están fuera de 01-TOOLS. Vacío si el
// proyecto ya está ordenado, que es el caso normal cuando el arnés se montó
// desde cero.
function buscar() {
  if (!proyecto.raiz()) return [];

  const encontradas = [];
  for (const fichero of FICHEROS) mirar(fichero, encontradas);

  for (const carpeta of CARPETAS) {
    const completa = proyecto.ruta(carpeta);
    if (!completa || !fs.existsSync(completa)) continue;
    try {
      for (const dentro of fs.readdirSync(completa)) {
        if (/\.(env|envrc)$|^\.env/.test(dentro)) mirar(path.join(carpeta, dentro), encontradas);
      }
    } catch { /* carpeta que no se puede leer: siguiente */ }
  }

  return encontradas;
}

// ── Y si además están subidas ────────────────────────────────────────────
//
// Montar esto sobre un proyecto que ya existía se encontró, en la prueba con
// un arnés nuevo de verdad, con el caso que importa: el `.env` de esa persona
// **ya estaba en su historial de git**, porque lo guardó el día que empezó.
//
// Decir solo "hay claves fuera de sitio" ahí es avisar a medias, y avisar a
// medias es peor que no avisar: el alumno ordena las claves, las ve aparecer
// en su sitio, y se queda tranquilo — con las claves viejas dentro del
// historial para siempre, y camino de GitHub en cuanto suba una copia.
//
// Moverlas no las saca de ahí. Sacarlas es otra cosa y la decide esa persona,
// así que aquí solo se mira y se dice.
function estanSubidas(sitios) {
  const raiz = proyecto.raiz();
  if (!raiz || !sitios.length) return [];
  try {
    const { execFileSync } = require('node:child_process');
    const salida = execFileSync('git', ['ls-files', '--', ...sitios.map((s) => s.donde)], {
      cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000,
    });
    return salida.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    // Sin git, o un git que no contesta: no se afirma nada.
    return [];
  }
}

// Un resumen para la pantalla, sin nombrar ficheros ni rutas.
function resumen() {
  const sitios = buscar();
  if (!sitios.length) return null;

  const claves = sitios.reduce((total, s) => total + s.cuantas, 0);
  const subidas = estanSubidas(sitios);
  return {
    sitios: sitios.length,
    claves,
    // Cuántos de esos ficheros están ya guardados en el historial. Cero es el
    // caso normal; más de cero cambia lo que hay que hacer.
    subidas: subidas.length,
    // Lo que se le pide al asistente. Las rutas van aquí porque esto se lo
    // lee él, no el alumno.
    prompt: `En este proyecto hay claves guardadas fuera de 01-TOOLS: ${sitios.map((s) => s.donde).join(', ')}. `
      + 'Míralas, dime a qué herramienta pertenece cada una y ordénalas con el protocolo de harness '
      + '(una carpeta por proveedor en 01-TOOLS, con su .env, su CREDENTIALS.md y su prueba de conexión). '
      + 'No rompas lo que el proyecto ya estuviera usando: si algo las lee desde donde están, dímelo antes de mover nada.'
      + (subidas.length
        ? ` AVISO IMPORTANTE: estos ficheros ya están guardados en el historial de git (${subidas.join(', ')}), `
          + 'así que moverlos NO saca esas claves de ahí: siguen en el historial y viajarían con cualquier copia que se suba. '
          + 'Explícaselo en cristiano antes de tocar nada y dile que lo prudente es cambiar esas claves en el proveedor, '
          + 'que es lo único que las deja inservibles. No reescribas el historial sin que te lo pida.'
        : ''),
  };
}

module.exports = { buscar, resumen };
