// Lo que no puede hacer la barra y sí el asistente.
//
// ── Qué entra aquí y qué no ──────────────────────────────────────────────
//
// Jose lo dejó dicho: *«lo que se pueda de forma determinista, y lo que no, que
// lo haga el agente»*. La línea es esta: si se puede saber leyendo el disco, lo
// hace la barra. Si hace falta **leer contenido y decidir a qué pertenece cada
// cosa**, eso no se adivina con un `existsSync` y se delega.
//
// Son cuatro, y ninguna es requisito para que la barra funcione: se pide cuando
// ya está todo lo determinista puesto, no antes.
//
// ── Las cuatro partes de un encargo ──────────────────────────────────────
//
// En esta barra había un solo prompt bien hecho —el de `sueltas.js`— y estaba
// bien hecho porque tenía cuatro partes. Aquí son obligatorias:
//
//   1. QUÉ HAY        hechos sacados de leer el disco, nunca adivinados
//   2. QUÉ TIENE QUE QUEDAR   en términos del arnés, no «arréglalo»
//   3. QUÉ NO SE TOCA         lo que esa persona ya tenía
//   4. QUÉ HAY QUE AVISAR     lo que no se hace sin decirlo antes
//
// ── Y la quinta cosa, que es la que faltaba ──────────────────────────────
//
// `comprobar()`: una función determinista que mira el disco y dice si el
// encargo quedó hecho. La pieza pasa a estar bien **porque el disco lo dice**,
// no porque el asistente haya afirmado que sí. Eso es lo que convierte esto en
// un contrato y no en un deseo.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const sueltas = require('./sueltas');
const cerebro = require('./cerebro');

// Un encargo bien formado, o nada. Nunca se devuelve uno a medias: un prompt
// sin la parte de «qué no se toca» es peor que no pedir nada.
function armar({ etiqueta, queHay, queTieneQueQuedar, queNoSeToca, queHayQueAvisar = '', comprobar }) {
  return {
    etiqueta,
    comprobar,
    prompt: [
      queHay,
      '',
      queTieneQueQuedar,
      '',
      queNoSeToca,
      ...(queHayQueAvisar ? ['', queHayQueAvisar] : []),
    ].join('\n'),
  };
}

// ── 1. El suelo que RSC no levanta ───────────────────────────────────────
//
// `ensureHarnessSkeleton()` solo corre al final de `onboard`, y `repair` no lo
// toca. Cuando falta, el propio RSC dice qué hacer: «invoke the `harness` skill
// to scaffold». Eso se repite, no se reinventa — así no se desincroniza con la
// versión siguiente.
function levantarElSuelo(faltan = []) {
  // Lo que va dentro de un encargo lo lee el asistente, no el alumno: ahí sí
  // hacen falta las rutas exactas, o no sabría qué levantar.
  const QUE_ES = {
    declaracion: 'el fichero que dice cómo está montado esto (.rsc.json)', // diccionario: interno
    conexiones: 'la carpeta de conexiones con la plantilla dentro (01-TOOLS/_TEMPLATE/)',
    conocimiento: 'la carpeta del perfil y las decisiones (02-DOCS/wiki/harness/)',
  };

  return armar({
    etiqueta: 'Que termine de prepararlo',
    queHay: `El arnés de esta carpeta se quedó a medias: falta ${faltan.map((f) => QUE_ES[f] || f).join(', ')}.`,
    queTieneQueQuedar: 'Usa la habilidad `harness` para levantar el suelo que falta, exactamente esas rutas y ninguna más.',
    queNoSeToca: 'No toques nada de lo que ya hay dentro de 01-TOOLS ni de 02-DOCS: puede haber claves y documentos de esta persona.',
    comprobar: () => proyecto.arnesCompleto(),
  });
}

// ── 2. Las claves que viven fuera de sitio ───────────────────────────────
//
// El prompt lleva semanas escrito en `sueltas.js` y **solo se podía lanzar
// desde la pantalla de conexiones, que exige el arnés montado**. O sea: en el
// momento en que se avisa de que hay claves sueltas, no había nada que pulsar.
function ordenarLasClaves() {
  const hay = sueltas.resumen();
  if (!hay) return null;

  return {
    etiqueta: 'Que ordene las claves',
    prompt: hay.prompt,
    comprobar: () => !sueltas.resumen(),
  };
}

// ── 3. Una carpeta que ya era de alguien ─────────────────────────────────
//
// Qué es `src/legacy/` no lo sabe un `find`. Se le da el inventario que sí
// tenemos y se le pide que lo cuente, no que lo mueva.
function ordenarLaCarpeta(parte) {
  const dentro = [];
  if (parte.carpeta.parece) dentro.push(parte.carpeta.parece);
  dentro.push(`${parte.carpeta.cuantos} cosas en la raíz`);
  if (parte.otroMontaje.asistentes.length) {
    dentro.push(`ya había un asistente montado a mano (${parte.otroMontaje.asistentes.map((a) => a.quien).join(', ')})`);
  }

  return armar({
    etiqueta: 'Que se entere de qué hay',
    queHay: `Esta carpeta ya tenía trabajo dentro antes de montar el arnés: ${dentro.join(' · ')}.`,
    queTieneQueQuedar: 'Míralo y deja escrito en 02-DOCS/wiki/ un artículo por cada área que encuentres, y el mapa de la raíz. '
      + 'Cuéntame en dos líneas de qué va esto, con mis palabras.',
    queNoSeToca: 'No muevas, no renombres y no borres nada. Solo leer y dejar escrito lo que has entendido.',
    queHayQueAvisar: 'Si encuentras algo que parezca sensible —claves, datos de clientes, nóminas— dímelo antes de escribirlo en ningún sitio.',
    comprobar: () => cerebro.catalogo().length > 0,
  });
}

// ── 4. Una herramienta a la que le faltan claves ─────────────────────────
function conectarUnaHerramienta(proveedor) {
  return armar({
    etiqueta: `Terminar de conectar ${proveedor.etiqueta}`,
    queHay: `A la conexión con ${proveedor.etiqueta} le faltan ${proveedor.faltan} clave(s).`,
    queTieneQueQuedar: `Dime qué claves son, dónde se sacan en ${proveedor.etiqueta}, y guárdalas en 01-TOOLS/${proveedor.id}/.env cuando te las dé. `
      + 'Después prueba la conexión y dime si funciona.',
    queNoSeToca: 'No inventes valores ni pongas claves de ejemplo: si no las tengo, dímelo y lo dejamos.',
    comprobar: () => {
      const env = proyecto.ruta('01-TOOLS', proveedor.id, '.env');
      return Boolean(env && fs.existsSync(env) && fs.readFileSync(env, 'utf8').split('\n').some((l) => /^[A-Z0-9_]+=\S/.test(l.trim())));
    },
  });
}

// Por identificador, que es como los nombra `rumbo.js`.
const POR_NOMBRE = {
  levantarElSuelo: (parte) => levantarElSuelo(parte.suelo.faltan),
  ordenarLasClaves: () => ordenarLasClaves(),
  ordenarLaCarpeta: (parte) => ordenarLaCarpeta(parte),
};

const traer = (nombre, parte) => (POR_NOMBRE[nombre] ? POR_NOMBRE[nombre](parte) : null);

module.exports = {
  traer, levantarElSuelo, ordenarLasClaves, ordenarLaCarpeta, conectarUnaHerramienta, LOS_QUE_HAY: Object.keys(POR_NOMBRE),
};
