// Qué sabe hacer tu asistente, y qué más podría aprender.
//
// Las piezas estaban todas y sin conectar: el catálogo curado de 25
// capacidades en español (`media/capacidades.json`), la lista de lo que hay
// puesto (`rsc.habilidadesPuestas`) y la instalación (`rsc.anadir`). Lo único
// que faltaba era una pantalla, porque hasta ahora el consejero ofrecía **una**
// capacidad cuando encajaba con lo que ya tenías escrito, y no había forma de
// ver el resto. "¿Esto qué sabe hacer?" es de las primeras preguntas que se
// hace alguien delante de una herramienta nueva, y no tenía respuesta.
//
// ── Lo que NO se enseña ──────────────────────────────────────────────────
//
// Un arnés recién montado trae nueve habilidades, y cuatro son fontanería:
// `orient`, `suggest`, `harness`, `init`. Esas son de la máquina, no del
// alumno — `harness` es justo el tipo de palabra que el diccionario prohíbe —
// así que no se listan una por una: se cuentan en una línea y se acabó.
//
// La regla es la misma de siempre: lo que no está en el catálogo curado no se
// nombra. Aquí eso vale para los dos lados, para lo que se ofrece y para lo
// que se enseña como puesto.

const path = require('node:path');
const consejos = require('./consejos');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');
const rsc = require('./rsc');

// Las que ha escrito esta empresa para sí misma. RSC las apunta aparte en
// `.rsc.json` (`ownSkills`), separadas de las del catálogo, y hace bien:
// no son de nadie más.
function lasSuyas() {
  const declaracion = proyecto.declaracion() || {};
  return Array.isArray(declaracion.ownSkills) ? declaracion.ownSkills : [];
}

// De cada una, su nombre y para qué sirve, sacados de su propia cabecera.
function comoSeLlama(id, raizDeHabilidades) {
  const humano = id.replace(/[-_]+/g, ' ');
  if (!raizDeHabilidades) return { id, nombre: humano, frase: '' };

  const campos = frontmatter.leer(path.join(raizDeHabilidades, id, 'SKILL.md'));
  const frase = typeof campos.description === 'string' ? campos.description.trim() : '';
  return {
    id,
    nombre: humano,
    // La descripción de una habilidad está escrita para el asistente —«úsala
    // cuando…»— y es larga. Se corta por la primera frase, que es la que dice
    // para qué sirve.
    frase: frase.split(/(?<=\.)\s/)[0] || frase,
  };
}

// ── Lo que se le puede enseñar, ordenado por esta carpeta ────────────────
//
// Jose, mirando la lista: *«no crees que esto depende del arnés?»*. Y tenía
// razón: eran veinticinco capacidades en el mismo orden en todas las carpetas.
// A una gestoría se le ofrecía «revisar contratos» con el mismo peso que
// «llevar las cuentas», que es justo lo contrario del principio de esta barra.
//
// El criterio ya existía y no se usaba aquí: `consejos.loQuePodriaAprender`
// puntúa cada capacidad contra lo que esa carpeta tiene escrito —sus conceptos,
// sus botones, sus conexiones— y devuelve las que encajan, ordenadas.
//
// Las que no encajan **no se esconden**: van detrás, porque una carpeta recién
// montada no tiene corpus todavía y ahí el orden no lo puede saber nadie.
function queSabe(carpetaDeLaExtension, corpus = '') {
  const catalogo = consejos.capacidades(carpetaDeLaExtension);
  const puestas = rsc.habilidadesPuestas();
  const propias = lasSuyas();

  // Las del catálogo que ya están puestas, y las que no. El orden del catálogo
  // se respeta: está pensado, no es alfabético.
  const sabe = catalogo.filter((c) => puestas.includes(c.id));

  const sinPoner = catalogo.filter((c) => !puestas.includes(c.id));
  const encajan = consejos.loQuePodriaAprender({ corpus, yaInstaladas: puestas, catalogo });
  const pegan = new Set(encajan.map((c) => c.id));
  const puedeAprender = [
    ...encajan.map((c) => ({ ...c, porQue: c.porQue })),
    ...sinPoner.filter((c) => !pegan.has(c.id)),
  ];

  const raiz = require('./donde').carpetaDeHabilidades();

  // ── Todo lo que hay puesto, no solo lo del catálogo ───────────────────
  //
  // Jose: *«se deben detectar todas las skills del proyecto»*. Y hacía falta:
  // nuestro catálogo cura veinticinco capacidades en español, pero RSC tiene
  // cientos. Una habilidad instalada fuera de esa lista —`nextjs`, `design`,
  // cualquiera— se contaba como fontanería y no se veía por ningún lado.
  //
  // Fontanería de verdad son cuatro, y esas sí se cuentan sin nombrarlas: son
  // de la máquina, no del alumno, y `harness` es justo el tipo de palabra que
  // el diccionario prohíbe.
  const laFontaneria = ['orient', 'suggest', 'harness', 'init'];

  const otras = puestas
    .filter((id) => !catalogo.some((c) => c.id === id))
    .filter((id) => !propias.includes(id))
    .filter((id) => !laFontaneria.includes(id))
    .map((id) => comoSeLlama(id, raiz));

  const deSerie = puestas.filter((id) => laFontaneria.includes(id)).length;

  return {
    sabe: sabe.map((c) => ({ id: c.id, nombre: c.nombre, frase: c.frase })),
    puedeAprender: puedeAprender.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      frase: c.frase,
      // Por qué encaja con esta carpeta, si es que encaja. Son las palabras que
      // se han encontrado escritas aquí.
      porQue: c.porQue || [],
    })),
    // Cuántas de las de arriba encajan con lo que hay montado, para poder
    // separarlas en pantalla de las que salen porque sí.
    encajan: encajan.length,
    suyas: propias.map((id) => comoSeLlama(id, raiz)),
    // Las instaladas que no están en nuestro catálogo: se nombran con lo que
    // diga su propia cabecera, que para eso la traen.
    otras,
    deSerie,
  };
}

module.exports = { queSabe };
