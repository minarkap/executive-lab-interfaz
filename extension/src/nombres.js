// Cómo se llama en cristiano lo que viene de fuera.
//
// ── Por qué esto es un fichero y no código ───────────────────────────────
//
// Jose: *«¿Cómo creas los nombres de las skills en lenguaje humano? […] Lo digo
// para hacer un mapeo flexible a largo plazo»*. Y tenía razón en que no lo
// había: la traducción estaba escrita a mano en dos objetos, en dos módulos
// distintos —`LOS_DE_RSC` en `acciones.js` y `LAS_DE_RSC` en `saberes.js`— que
// no se conocían entre ellos. Mismo problema, mismos datos, dos sitios, y para
// renombrar una cosa había que tocar código.
//
// Ahora la tabla vive en `media/nombres.json` y esto solo la lee. Renombrar es
// cambiar una línea de un fichero de datos.
//
// ── El orden de quién manda ──────────────────────────────────────────────
//
// Es el mismo para comandos, habilidades y ayudantes, y es este:
//
//   1. **Lo que haya escrito alguien de esta casa.** El `boton:` de un comando,
//      el `name:` de un ayudante. Es una decisión de esa carpeta: manda.
//   2. **La tabla.** Traduce lo que trae el arnés, que viene con el nombre en
//      clave y la descripción en inglés. No la escribimos nosotros, así que se
//      traduce fuera del fichero de origen — y así una actualización de RSC no
//      se lleva por delante la traducción.
//   3. **El nombre del fichero, humanizado.** `mi-proceso` → «Mi proceso». Nunca
//      se enseña un identificador en clave como si fuera un rótulo.
//
// Lo que NO se hace en ningún caso es esconder el identificador de verdad: sale
// en la (i) de cada fila. Quien tenga que escribirlo en una conversación tiene
// que poder saber cuál es.

const fs = require('node:fs');
const path = require('node:path');

// Junto a `capacidades.json`, que es lo mismo pero para lo que se puede
// instalar. `media/` y `src/` viajan como hermanos dentro del .vsix, así que
// esta ruta vale igual aquí que instalado.
const FICHERO = path.join(__dirname, '..', 'media', 'nombres.json');

let tablaEnMemoria = null;

function tabla() {
  if (tablaEnMemoria) return tablaEnMemoria;
  try {
    const leida = JSON.parse(fs.readFileSync(FICHERO, 'utf8'));
    tablaEnMemoria = {
      comandos: leida.comandos || {},
      habilidades: leida.habilidades || {},
      ayudantes: leida.ayudantes || {},
      fontaneria: leida.fontaneria || [],
    };
  } catch {
    // Sin tabla la barra sigue funcionando: se cae al nombre humanizado. Un
    // fichero de datos roto no puede dejar sin comandos a nadie.
    tablaEnMemoria = { comandos: {}, habilidades: {}, ayudantes: {}, fontaneria: [] };
  }
  return tablaEnMemoria;
}

// `mi-proceso` → «Mi proceso». El último recurso, y el que hace que nunca se
// enseñe un guion en pantalla.
function humanizar(id) {
  const limpio = String(id || '').replace(/[-_]+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

// Qué dice la tabla de esta cosa, si dice algo.
function deLaTabla(montón, id) {
  const fila = tabla()[montón] && tabla()[montón][id];
  return fila && typeof fila.nombre === 'string' ? fila : null;
}

// El nombre y la frase de una cosa, resueltos con el orden de arriba.
//
//   montón   'comandos' | 'habilidades' | 'ayudantes'
//   id       el identificador de verdad: `revisar-la-barra`, `bro`
//   suyo     lo que diga su propio fichero: { nombre, queHace }
function comoSeLlama(montón, id, suyo = {}) {
  const fila = deLaTabla(montón, id);
  const nombrePropio = typeof suyo.nombre === 'string' ? suyo.nombre.trim() : '';
  const frasePropia = typeof suyo.queHace === 'string' ? suyo.queHace.trim() : '';

  return {
    id,
    nombre: nombrePropio || (fila && fila.nombre) || humanizar(id),
    queHace: frasePropia || (fila && fila.queHace) || '',
    // Si la tabla lo nombra es que viene de fuera: no lo escribió nadie de esta
    // carpeta. La barra lo usa para ponerlo aparte, bajo "Los que trae de serie".
    deFuera: Boolean(fila),
  };
}

const loQueTraduce = (montón) => Object.keys(tabla()[montón] || {});

// Lo que el arnés monta para funcionar por dentro. Está en el mismo fichero de
// datos que las traducciones porque es la misma clase de decisión: cómo se le
// enseña a alguien lo que hay montado. Eran cuatro hasta la 1.4.1 y son
// veintisiete desde la 2.0, que monta un arnés entero para todos.
const esFontaneria = (id) => tabla().fontaneria.includes(id);

module.exports = { comoSeLlama, humanizar, loQueTraduce, esFontaneria, FICHERO };
