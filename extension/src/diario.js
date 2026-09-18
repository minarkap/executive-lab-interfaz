// Qué se ha hecho aquí, y qué se decidió por el camino.
//
// ── De dónde sale ────────────────────────────────────────────────────────
//
// RSC ya lo escribe todo, y hasta ahora no lo veía nadie. Son dos sitios del
// protocolo del arnés (`.rsc/skills/harness/references/wiki-protocol.md`):
//
//   · `02-DOCS/raw/worklog/AAAA-MM-DD-loquesea.md` — una ficha por cada rato
//     de trabajo de verdad, escrita sola al cerrar la conversación: qué se
//     hizo, por qué, qué se tocó y cómo quedó. El arnés la llama "evidencia":
//     se escribe una vez y no se corrige nunca.
//   · `02-DOCS/wiki/harness/decisions.md` — el registro de decisiones, que
//     solo crece: cada entrada dice qué se eligió, entre qué opciones y por
//     qué. Si algo se cambia de idea, se añade otra que anula a la anterior.
//
// Para quien lleva una empresa, ese segundo fichero es lo más valioso que hay
// en la carpeta y estaba enterrado. "¿Por qué hicimos esto así?" a los tres
// meses no se contesta mirando los archivos; se contesta aquí.
//
// ── Los dos formatos ─────────────────────────────────────────────────────
//
// Las decisiones se escriben de dos maneras según quién las escriba, y las
// dos hay que leerlas o media carpeta se ve vacía:
//
//   · La larga, del protocolo: `## D-0001 — Título` y debajo `- date:`,
//     `- decision:`, `- why:`.
//   · La corta, la que deja el montaje inicial: una línea por decisión,
//     sin más.

const fs = require('node:fs');
const path = require('node:path');

const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');

const SESIONES = ['02-DOCS', 'raw', 'worklog'];
const DECISIONES = ['02-DOCS', 'wiki', 'harness', 'decisions.md'];

// Suficientes para hacerse una idea, pocas para leerlas de un vistazo.
const TOPE = 20;

// Las plantillas del arnés traen ejemplos entre llaves y encabezados de
// muestra. Enseñarlos como si fueran trabajo de esta empresa es mentir.
// Dentro de una entrada larga hay líneas con guion que no son decisiones sino
// sus campos. Se nombran una a una: descartarlas por la forma («algo: algo»)
// se llevaba por delante decisiones de verdad escritas así, como «SDD: no».
const ES_UN_CAMPO = /^(date|decision|why|options?( considered)?|supersed(es|ed by)|context|status|type|title)\s*:/i;

const ES_PLANTILLA = (t) => /[{<]|^(Decision|Decisions? Log|D-000[1-9] —? ?…?$)/i.test(t || '');

function leerTexto(...partes) {
  const ruta = proyecto.ruta(...partes);
  if (!ruta) return null;
  try {
    return fs.readFileSync(ruta, 'utf8');
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- las sesiones

// La fecha va en el nombre del fichero y también en el frontmatter. Se prefiere
// el nombre: es lo que ordena la carpeta, y si un día no cuadran, manda el que
// se ve.
function laFecha(nombre, campos) {
  const delNombre = (nombre.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1];
  if (delNombre) return delNombre;
  return String(campos.timestamp || '').slice(0, 10) || '';
}

function sesiones(cuantas = TOPE) {
  const carpeta = proyecto.ruta(...SESIONES);
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  let nombres;
  try {
    nombres = fs.readdirSync(carpeta).filter((n) => n.endsWith('.md') && !n.startsWith('.'));
  } catch {
    return [];
  }

  return nombres
    .sort()
    .reverse()
    .slice(0, cuantas)
    .map((nombre) => {
      const campos = frontmatter.leer(path.join(carpeta, nombre));
      const titulo = String(campos.title || '').trim();
      return {
        fichero: nombre,
        fecha: laFecha(nombre, campos),
        titulo: ES_PLANTILLA(titulo) ? '' : titulo,
        resumen: ES_PLANTILLA(campos.description) ? '' : String(campos.description || '').trim(),
        // `unprocessed` quiere decir que aún no se ha destilado a la wiki.
        pendiente: String(campos.status || '').trim() === 'unprocessed',
      };
    })
    .filter((s) => s.titulo || s.resumen)
    .map((s) => ({ ...s, titulo: s.titulo || s.resumen }));
}

// Dónde está una anotación, comprobando que es de esta carpeta y que es un
// `.md` de ahí dentro. El nombre viene de un mensaje del panel, así que se
// comprueba igual que si viniera de fuera.
function dondeVive(fichero) {
  const carpeta = proyecto.ruta(...SESIONES);
  if (!carpeta) return null;

  const completa = path.resolve(carpeta, fichero);
  const dentro = path.resolve(carpeta) + path.sep;
  if (!completa.startsWith(dentro) || !completa.endsWith('.md')) return null;
  return fs.existsSync(completa) ? completa : null;
}

// ----------------------------------------------------------- las decisiones

// La larga: `## D-0001 — Título`, y debajo las líneas que la explican.
function laLarga(texto) {
  const salida = [];
  const trozos = texto.split(/^##\s+/m).slice(1);

  for (const trozo of trozos) {
    const lineas = trozo.split('\n');
    const encabezado = lineas.shift().trim();
    const titulo = encabezado.replace(/^D-\d+\s*[—–-]\s*/, '').trim();
    if (!titulo || ES_PLANTILLA(titulo)) continue;

    const campo = (cual) => {
      const m = trozo.match(new RegExp(`^\\s*[-*]\\s*${cual}\\s*:\\s*(.+)$`, 'mi'));
      return m && !ES_PLANTILLA(m[1]) ? m[1].trim() : '';
    };

    salida.push({
      titulo,
      fecha: campo('date'),
      eleccion: campo('decision'),
      porque: campo('why'),
    });
  }
  return salida;
}

// La corta: una línea con un guion delante y nada más. Es lo que deja el
// montaje inicial, y sin esto la pantalla sale vacía el primer día.
function laCorta(texto) {
  return texto
    .split('\n')
    .map((l) => l.match(/^[-*]\s+(.{4,})$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((t) => !ES_PLANTILLA(t) && !ES_UN_CAMPO.test(t))
    .map((titulo) => ({ titulo, fecha: '', eleccion: '', porque: '' }));
}

function decisiones(cuantas = TOPE) {
  const texto = leerTexto(...DECISIONES);
  if (!texto) return [];

  const largas = laLarga(texto);
  // Las sueltas de arriba del todo, antes de la primera con encabezado: si hay
  // encabezados, lo de después ya está contado y volver a leerlo lo duplica.
  const antes = texto.split(/^##\s+/m)[0];
  const cortas = laCorta(largas.length ? antes : texto);

  // Lo más nuevo primero: el fichero solo crece por abajo.
  return [...largas.reverse(), ...cortas].slice(0, cuantas);
}

function hayDiario() {
  return sesiones(1).length > 0 || decisiones(1).length > 0;
}

module.exports = { sesiones, dondeVive, decisiones, hayDiario };
