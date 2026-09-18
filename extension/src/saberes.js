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

function queSabe(carpetaDeLaExtension) {
  const catalogo = consejos.capacidades(carpetaDeLaExtension);
  const puestas = rsc.habilidadesPuestas();
  const propias = lasSuyas();

  // Las del catálogo que ya están puestas, y las que no. El orden del catálogo
  // se respeta: está pensado, no es alfabético.
  const sabe = catalogo.filter((c) => puestas.includes(c.id));
  const puedeAprender = catalogo.filter((c) => !puestas.includes(c.id));

  // Lo que hay puesto y no está en el catálogo NI lo ha escrito esta empresa:
  // la fontanería del arnés. Se cuenta, no se lista.
  //
  // Lo de excluir las propias es un arreglo: una habilidad escrita aquí acababa
  // contada como fontanería, así que la más pertinente de todas —la que alguien
  // se molestó en escribir para esta carpeta— era justo la que no se veía.
  const deSerie = puestas.filter((id) => !catalogo.some((c) => c.id === id) && !propias.includes(id)).length;

  const raiz = require('./donde').carpetaDeHabilidades();

  return {
    sabe: sabe.map((c) => ({ id: c.id, nombre: c.nombre, frase: c.frase })),
    puedeAprender: puedeAprender.map((c) => ({ id: c.id, nombre: c.nombre, frase: c.frase })),
    suyas: propias.map((id) => comoSeLlama(id, raiz)),
    deSerie,
  };
}

module.exports = { queSabe };
