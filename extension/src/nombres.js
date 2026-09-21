// Cómo se llama en español lo que viene de fuera.
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
// ── Qué es un nombre ─────────────────────────────────────────────────────
//
// Jose, 21 de septiembre de 2026: *«que no haya "simplificaciones" excesivas
// como llamar a las skills "Lo que sabe hacer" y esas tonterías»*. El nombre de
// una cosa es el nombre de la cosa —«Facturación», «Revisor de seguridad»,
// «Planificar»—, no una frase sobre lo que el asistente sabe hacer con ella.
// Lo que hace va aparte, en `queHace`, y el identificador de verdad va en la
// (i): `/unslop`, `/resume-session`. Así lo que se oye en clase y lo que se lee
// en la barra son la misma cosa.
//
// ── El orden de quién manda ──────────────────────────────────────────────
//
// Es el mismo para comandos, habilidades y agentes, y es este:
//
//   1. **Lo que haya escrito alguien de esta casa.** El `boton:` de un comando,
//      el `name:` de un agente. Es una decisión de esa carpeta: manda.
//   2. **La tabla.** Traduce lo que trae el arnés, que viene con el nombre en
//      clave y la descripción en inglés. No la escribimos nosotros, así que se
//      traduce fuera del fichero de origen — y así una actualización de RSC no
//      se lleva por delante la traducción.
//   3. **Un patrón**, para las familias que RSC genera con molde —los agentes
//      `<lenguaje>-reviewer` y `<lenguaje>-build-resolver`—: hay más de veinte
//      y salen nuevos con cada versión, así que una fila por cada uno se
//      quedaría corta a la primera.
//   4. **El nombre del fichero, humanizado.** `mi-proceso` → «Mi proceso». Nunca
//      se enseña un identificador en clave como si fuera un rótulo.
//
// Lo que NO se hace en ningún caso es esconder el identificador de verdad: sale
// en la (i) de cada fila. Quien tenga que escribirlo en una conversación tiene
// que poder saber cuál es.

const fs = require('node:fs');
const path = require('node:path');

// Junto a `capacidades.json`, que es lo mismo pero para lo que se puede
// añadir. `media/` y `src/` viajan como hermanos dentro del .vsix, así que
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
      guardianes: leida.guardianes || {},
      // Lo que el arnés hace solo sin parar nada (la brújula al empezar, el
      // aviso del diario…): misma clase de decisión que los guardianes.
      automatismos: leida.automatismos || {},
      patrones: leida.patrones || {},
      fontaneria: leida.fontaneria || [],
    };
  } catch {
    // Sin tabla la barra sigue funcionando: se cae al nombre humanizado. Un
    // fichero de datos roto no puede dejar sin comandos a nadie.
    tablaEnMemoria = {
      comandos: {}, habilidades: {}, ayudantes: {}, guardianes: {}, automatismos: {}, patrones: {}, fontaneria: [],
    };
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

// Qué dice un patrón, si alguno casa. `react-reviewer` → «Revisor de React».
//
// El resto es el lenguaje, y humanizarlo a secas daba «Cpp», «Csharp», «Mle»:
// un rótulo que no reconoce ni quien programa en él. Si la tabla `lenguajes`
// lo conoce, se usa su nombre de verdad; si no, se humaniza como antes.
function dePatron(montón, id) {
  const reglas = (tabla().patrones || {})[montón] || [];
  const lenguajes = (tabla().patrones || {}).lenguajes || {};
  for (const regla of reglas) {
    if (typeof regla.sufijo !== 'string' || !String(id).endsWith(regla.sufijo)) continue;
    const base = String(id).slice(0, -regla.sufijo.length);
    const resto = lenguajes[base] || humanizar(base);
    if (!resto) continue;
    const rellenar = (t) => String(t || '').replace(/\{resto\}/g, resto);
    return { nombre: rellenar(regla.nombre), queHace: rellenar(regla.queHace) };
  }
  return null;
}

// El nombre y la frase de una cosa, resueltos con el orden de arriba.
//
//   montón   'comandos' | 'habilidades' | 'ayudantes'
//   id       el identificador de verdad: `revisar-la-barra`, `bro`
//   suyo     lo que diga su propio fichero: { nombre, queHace }
function comoSeLlama(montón, id, suyo = {}) {
  const fila = deLaTabla(montón, id) || dePatron(montón, id);
  const nombrePropio = typeof suyo.nombre === 'string' ? suyo.nombre.trim() : '';
  const frasePropia = typeof suyo.queHace === 'string' ? suyo.queHace.trim() : '';

  return {
    id,
    nombre: nombrePropio || (fila && fila.nombre) || humanizar(id),
    queHace: frasePropia || (fila && fila.queHace) || '',
    // Si la tabla lo nombra es que viene de fuera: no lo escribió nadie de esta
    // carpeta. La barra lo usa para ponerlo aparte, bajo "Los del arnés".
    deFuera: Boolean(fila),
  };
}

const loQueTraduce = (montón) => Object.keys(tabla()[montón] || {});

// Lo que el arnés monta para funcionar por dentro. Está en el mismo fichero de
// datos que las traducciones porque es la misma clase de decisión: cómo se le
// enseña a alguien lo que hay montado. Ya no decide si algo se ve —todo lo
// instalado se ve— sino dónde: plegado, bajo «Las del arnés».
const esFontaneria = (id) => tabla().fontaneria.includes(id);

// Una frase escrita para el asistente y en inglés no se le enseña a quien usa
// la barra: media pantalla en español y una línea en inglés queda peor que no
// decir nada. La comprobación es de andar por casa —palabras funcionales del
// español— y es la misma para comandos, habilidades y agentes, que antes cada
// uno la hacía a su manera y los agentes ni la hacían.
const enEspanol = (frase) => /\b(el|la|los|las|un|una|de|del|que|para|con|por|cuando|siempre|tu|tus|se|y)\b/i.test(String(frase || ''));

module.exports = { comoSeLlama, humanizar, loQueTraduce, esFontaneria, enEspanol, FICHERO };
