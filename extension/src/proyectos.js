// En qué estamos: lo que RSC escribe cuando se construye algo con SDD.
//
// ── Qué es esto ──────────────────────────────────────────────────────────
//
// SDD es la forma de RSC de construir: antes de escribir nada se acuerda **qué**
// se quiere y **por qué** (la spec), después **cómo** se va a hacer (el plan) y
// la lista de tareas que salen de él. Todo eso queda escrito bajo
// `02-DOCS/wiki/sdd/` y la barra no enseñaba nada, salvo la constitución.
//
// Lo interesante para quien no es técnico: **una spec no es un documento
// técnico**. El propio protocolo lo dice — «what & why, no how». Es literalmente
// lo que cualquiera querría leer para saber en qué anda su proyecto.
//
// ── Por qué esto aparece y desaparece ────────────────────────────────────
//
// Un arnés de contabilidad no tiene specs y no las va a tener nunca, así que en
// esa carpeta este apartado no existe. Uno donde se esté construyendo algo, sí.
// Es la misma regla que el resto de la barra: nada está predefinido, sale lo
// que esa carpeta tenga.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');

const SDD = ['02-DOCS', 'wiki', 'sdd'];

// Las cuatro cosas que se leen, en el orden en que se escriben.
//
// `verifications/` entró al auditar el mapeo el 22-09-2026: la cadena la
// escribe al terminar —qué se comprobó y con qué resultado— y no se veía por
// ningún lado. Es la única de las cuatro que contesta «¿esto funciona?», que
// es justo lo que quiere saber quien no va a leer un plan.
//
// Lo que sigue sin salir, a propósito: `progress/`, `sessions/` y `archive/`
// son andamio de la cadena —dónde se quedó una sesión, el registro de aplicar
// tarea por tarea—, no algo que alguien abra para enterarse de su proyecto.
const MONTONES = [
  { id: 'proposals', etiqueta: 'Antes de empezar', pista: 'Lo que se miró antes de decidir.' },
  { id: 'specs', etiqueta: 'Qué queremos', pista: 'Qué se quiere y por qué. Sin nada técnico.' },
  { id: 'plans', etiqueta: 'Cómo se va a hacer', pista: 'El plan, con su lista de tareas.' },
  { id: 'verifications', etiqueta: 'Qué se ha comprobado', pista: 'Lo que se probó al terminar, y si salió bien.' },
];

const TOPE = 20;

// Las tareas van en una tabla con identificadores `T001`, `T002`… No llevan
// marca de hecho o pendiente, así que se cuentan y no se dice cuántas van:
// inventarse un progreso que el fichero no dice sería mentir.
const CUENTA_TAREAS = /^\|\s*T\d{3}\s*\|/gm;

function titulo(crudo, nombre) {
  const campos = frontmatter.analizar(crudo);
  if (typeof campos.title === 'string' && campos.title.trim()) return campos.title.trim();
  const del = crudo.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').match(/^#\s+(.+)$/m);
  return (del && del[1].trim()) || nombre.replace(/[-_]+/g, ' ').replace(/\.md$/, '');
}

function leerMonton(cual) {
  const carpeta = proyecto.ruta(...SDD, cual);
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  let nombres;
  try {
    nombres = fs.readdirSync(carpeta).filter((n) => n.endsWith('.md') && !n.startsWith('.'));
  } catch {
    return [];
  }

  return nombres.sort().slice(0, TOPE).map((nombre) => {
    let crudo = '';
    try {
      crudo = fs.readFileSync(path.join(carpeta, nombre), 'utf8');
    } catch { /* se queda con el nombre */ }

    const campos = frontmatter.analizar(crudo);
    const tareas = (crudo.match(CUENTA_TAREAS) || []).length;
    return {
      fichero: `${cual}/${nombre}`,
      titulo: titulo(crudo, nombre),
      // `status` lo escribe SDD; si no está, no se inventa.
      estado: typeof campos.status === 'string' ? campos.status.trim() : '',
      tareas,
    };
  });
}

function queHay() {
  return MONTONES
    .map((m) => ({ ...m, cosas: leerMonton(m.id) }))
    .filter((m) => m.cosas.length);
}

const hayAlgo = () => queHay().length > 0;

// Abrir uno. El nombre viene de un mensaje del panel, así que se comprueba que
// sigue siendo de ahí dentro y que es un `.md`.
function dondeVive(fichero) {
  const raiz = proyecto.ruta(...SDD);
  if (!raiz || typeof fichero !== 'string') return null;

  const completa = path.resolve(raiz, fichero);
  const dentro = path.resolve(raiz) + path.sep;
  if (!completa.startsWith(dentro) || !completa.endsWith('.md')) return null;
  return fs.existsSync(completa) ? completa : null;
}

module.exports = { queHay, hayAlgo, dondeVive, MONTONES };
