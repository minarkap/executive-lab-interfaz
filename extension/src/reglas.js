// Las reglas de esta carpeta: lo que el asistente tiene que respetar siempre.
//
// ── Dónde vive, que son tres sitios y ninguno se veía ─────────────────────
//
// Me equivoqué al decirle a Jose que esto no existía en RSC. Existe, y es de
// lo primero que se lee:
//
//   · `02-DOCS/wiki/sdd/constitution.md` — los **innegociables** del proyecto.
//     El `CLAUDE.md` que escribe el arnés lo pone en su mapa bajo el rótulo
//     "Read first, always", junto al perfil de usuario y nada más. O sea: de
//     los cientos de ficheros de una carpeta, estos dos son los que se leen
//     antes de cada cosa que se hace.
//   · `CLAUDE.md`, sección "Working rules" — las reglas de la casa para
//     Claude: qué no se toca, qué no se publica, qué se mira antes.
//   · `AGENTS.md` — lo mismo para todo lo que no es Claude (Codex, Cursor).
//     El propio arnés dice que los dos van alineados.
//
// La constitución solo aparece cuando el arnés se monta con SDD; los otros dos
// los escribe siempre. Por eso aquí no se exige ninguno: se enseña lo que haya
// y se dice con todas las letras lo que falta, que es lo que permite ponerlo.

const fs = require('node:fs');
const proyecto = require('./proyecto');
const asistentes = require('./asistentes');

const CONSTITUCION = ['02-DOCS', 'wiki', 'sdd', 'constitution.md'];
const DE_CLAUDE = ['CLAUDE.md'];
const DE_LOS_DEMAS = ['AGENTS.md'];

// Una regla ocupa una línea. Un fichero entero no cabe en la barra, y para
// leerlo entero está el botón que lo abre al lado.
const TOPE = 25;

function leer(...partes) {
  const ruta = proyecto.ruta(...partes);
  if (!ruta) return null;
  try {
    return fs.readFileSync(ruta, 'utf8');
  } catch {
    return null;
  }
}

// Las plantillas del arnés traen ejemplos entre llaves y encabezados de
// muestra. Enseñarlos como si fueran las reglas de esta empresa es mentir.
const ES_PLANTILLA = (t) => /[{}]|^(Template|Añade|Add)\b/i.test(t || '');

// Los puntos de una sección concreta. `## Working rules` en el de Claude,
// cualquier lista en la constitución.
function puntosDe(texto, seccion = null) {
  if (!texto) return [];

  let trozo = texto;
  if (seccion) {
    const desde = texto.search(new RegExp(`^##\\s+${seccion}\\s*$`, 'mi'));
    if (desde === -1) return [];
    const resto = texto.slice(desde).split('\n').slice(1).join('\n');
    const hasta = resto.search(/^##\s+/m);
    trozo = hasta === -1 ? resto : resto.slice(0, hasta);
  }

  return trozo.split('\n')
    .map((l) => l.match(/^\s*[-*]\s+(.{4,})$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((t) => !ES_PLANTILLA(t))
    .slice(0, TOPE);
}

// La constitución no siempre lleva guiones: puede ser prosa con encabezados.
// Se cogen los encabezados como títulos de principio, que es lo que son.
function principios(texto) {
  if (!texto) return [];
  const conGuion = puntosDe(texto);
  if (conGuion.length) return conGuion;

  return texto.split('\n')
    .map((l) => l.match(/^#{2,4}\s+(.{4,})$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((t) => !ES_PLANTILLA(t))
    .slice(0, TOPE);
}

function queHay() {
  const constitucion = leer(...CONSTITUCION);
  const deClaude = leer(...DE_CLAUDE);
  const deLosDemas = leer(...DE_LOS_DEMAS);

  // `AGENTS.md` repite las de `CLAUDE.md` por diseño, así que se enseña una
  // sola lista: dos listas iguales seguidas solo hacen dudar de si son
  // distintas. Manda la del asistente con el que se está hablando — con Codex,
  // `CLAUDE.md` no lo lee nadie, así que enseñarlo sería enseñar reglas que no
  // se están aplicando.
  const conCodex = asistentes.elDeAhora().id !== 'claude';
  const primero = conCodex ? deLosDemas : deClaude;
  const segundo = conCodex ? deClaude : deLosDemas;

  return {
    innegociables: principios(constitucion),
    deLaCasa: puntosDe(primero, 'Working rules').length
      ? puntosDe(primero, 'Working rules')
      : puntosDe(segundo, 'Working rules'),
    // Cuál se está leyendo, para que el botón de "verlas enteras" abra ese.
    cual: conCodex ? 'otros' : 'claude',
    hay: {
      constitucion: Boolean(constitucion),
      claude: Boolean(deClaude),
      otros: Boolean(deLosDemas),
    },
  };
}

// Para el botón que las abre enteras, al lado. Solo estos tres ficheros.
function dondeVive(cual) {
  const sitios = { constitucion: CONSTITUCION, claude: DE_CLAUDE, otros: DE_LOS_DEMAS };
  const partes = sitios[cual];
  if (!partes) return null;
  const ruta = proyecto.ruta(...partes);
  return ruta && fs.existsSync(ruta) ? ruta : null;
}

module.exports = { queHay, dondeVive };
