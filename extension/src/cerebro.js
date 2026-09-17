// "Lo que sabe de tu empresa": el cerebro de 02-DOCS.
//
// RSC monta ahí un motor de caos→conocimiento con una estructura fija
// (`.rsc/skills/harness/references/wiki-protocol.md`): `inbox/` es la zona
// donde se sueltan documentos en crudo, `raw/` guarda los originales, y
// `wiki/` los artículos ya destilados, catalogados en `index.md`, con su
// historial en `log.md` y lo que aún no sabe en `gaps.md`.
//
// Aquí no se inventa ninguna estructura: se lee la suya. Y no se edita nada —
// el alumno lee, sube documentos y pide cambios; escribir en la wiki es
// trabajo del asistente, que sabe mantener el índice, los enlaces y las
// puntuaciones a la vez.

const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const proyecto = require('./proyecto');

const WIKI = ['02-DOCS', 'wiki'];
const INBOX = ['02-DOCS', 'inbox'];

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function leer(...partes) {
  const ruta = proyecto.ruta(...partes);
  try {
    return ruta ? fs.readFileSync(ruta, 'utf8') : null;
  } catch {
    return null;
  }
}

// Las plantillas de RSC traen filas de ejemplo con marcadores entre llaves o
// ángulos. No son artículos: no se enseñan.
const ES_PLANTILLA = (texto) => /[{<]/.test(texto);

// ------------------------------------------------------------ el índice

// `wiki/index.md` agrupa por tema con `## <tema>` y una tabla por tema:
// | [Título](tema/fichero.md) | Resumen | AAAA-MM-DD | Puntuación |
function catalogo() {
  const texto = leer(...WIKI, 'index.md');
  if (!texto) return [];

  const temas = [];
  let actual = null;

  for (const linea of texto.split('\n')) {
    const cabecera = linea.match(/^##\s+(.+?)\s*$/);
    if (cabecera) {
      if (ES_PLANTILLA(cabecera[1])) { actual = null; continue; }
      actual = { id: cabecera[1], etiqueta: humanizar(cabecera[1]), articulos: [] };
      temas.push(actual);
      continue;
    }
    if (!actual) continue;

    const fila = linea.match(/^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|([^|]*)\|([^|]*)\|/);
    if (!fila) continue;
    const [, titulo, ruta, resumen, fecha] = fila;
    if (ES_PLANTILLA(titulo) || ES_PLANTILLA(ruta)) continue;

    actual.articulos.push({
      titulo: titulo.replace(/^\[Archivado\]\s*/i, '').trim(),
      ruta: ruta.trim(),
      resumen: resumen.trim(),
      fecha: fecha.trim(),
    });
  }

  return temas.filter((t) => t.articulos.length);
}

function articulos(temaId) {
  return (catalogo().find((t) => t.id === temaId) || {}).articulos || [];
}

function cuantoSabe() {
  return catalogo().reduce((total, tema) => total + tema.articulos.length, 0);
}

// Se abre en vista previa, nunca en el editor: el alumno lee el artículo, no
// su markdown ni su frontmatter.
async function abrirArticulo(rutaRelativa) {
  // La ruta viene del índice, que escribe el asistente: se comprueba que no se
  // sale de la wiki antes de abrir nada.
  const wiki = proyecto.ruta(...WIKI);
  const completa = path.resolve(wiki, rutaRelativa);
  if (!wiki || !completa.startsWith(wiki + path.sep) || !fs.existsSync(completa)) {
    return { ok: false, mensaje: 'Ese documento ya no está donde decía el índice.' };
  }

  const uri = vscode.Uri.file(completa);
  if (completa.endsWith('.md')) await vscode.commands.executeCommand('markdown.showPreview', uri);
  else await vscode.env.openExternal(uri);
  return { ok: true };
}

// ------------------------------------------------- historial y huecos

// `log.md` va del más nuevo al más viejo: `## [AAAA-MM-DD] tipo | título`.
function aprendidoUltimamente(cuantas = 5) {
  const texto = leer(...WIKI, 'log.md');
  if (!texto) return [];

  const entradas = [];
  for (const linea of texto.split('\n')) {
    const m = linea.match(/^##\s*\[(\d{4}-\d{2}-\d{2})\]\s*([a-zA-Z-]+)\s*\|\s*(.+?)\s*$/);
    if (!m) continue;
    const [, fecha, tipo, titulo] = m;
    if (ES_PLANTILLA(titulo)) continue;
    entradas.push({ fecha, tipo, titulo });
    if (entradas.length >= cuantas) break;
  }
  return entradas;
}

function loQueAunNoSabe(cuantos = 5) {
  const texto = leer(...WIKI, 'gaps.md');
  if (!texto) return [];

  return texto.split('\n')
    .map((l) => l.match(/^[-*]\s+(.+?)\s*$/))
    .filter((m) => m && !ES_PLANTILLA(m[1]))
    .slice(0, cuantos)
    .map((m) => m[1]);
}

// El panel humano que RSC regenera solo en cada pasada de mantenimiento.
function hayPanel() {
  const ruta = proyecto.ruta(...WIKI, 'dashboard.html');
  return Boolean(ruta && fs.existsSync(ruta));
}

const abrirPanel = () => vscode.env.openExternal(vscode.Uri.file(proyecto.ruta(...WIKI, 'dashboard.html')));

// -------------------------------------------------- darle documentos

function contar(...partes) {
  const carpeta = proyecto.ruta(...partes);
  if (!carpeta || !fs.existsSync(carpeta)) return 0;

  let cuenta = 0;
  const recorrer = (donde) => {
    for (const entrada of fs.readdirSync(donde, { withFileTypes: true })) {
      if (entrada.name.startsWith('.') || entrada.name === 'README.md') continue;
      if (entrada.isDirectory()) recorrer(path.join(donde, entrada.name));
      else cuenta += 1;
    }
  };
  try { recorrer(carpeta); } catch { /* si no se puede leer, cero */ }
  return cuenta;
}

const esperandoLectura = () => {
  const inbox = proyecto.ruta(...INBOX);
  if (!inbox || !fs.existsSync(inbox)) return 0;
  return fs.readdirSync(inbox, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.') && e.name !== 'README.md').length;
};

const yaLeidos = () => contar(...INBOX, '_processed');
const originales = () => contar('02-DOCS', 'raw');

// Copia lo que elija el alumno a `inbox/`. No se procesa aquí: el barrido de
// la bandeja lo hace el asistente, que sabe extraer, clasificar y enlazar.
async function anadirDocumentos() {
  const elegidos = await vscode.window.showOpenDialog({
    canSelectMany: true,
    openLabel: 'Dárselos',
    title: 'Elige los documentos que quieres que lea',
  });
  if (!elegidos || !elegidos.length) return { ok: true, cuantos: 0 };

  const inbox = proyecto.ruta(...INBOX);
  if (!inbox) return { ok: false, mensaje: 'No hay carpeta de trabajo abierta.' };
  fs.mkdirSync(inbox, { recursive: true });

  let cuantos = 0;
  for (const origen of elegidos) {
    // Si ya hay uno con ese nombre, se numera: nunca se pisa nada.
    const nombre = path.basename(origen.fsPath);
    const extension = path.extname(nombre);
    const base = nombre.slice(0, nombre.length - extension.length);
    let destino = path.join(inbox, nombre);
    for (let n = 2; fs.existsSync(destino); n += 1) destino = path.join(inbox, `${base} (${n})${extension}`);

    try {
      fs.copyFileSync(origen.fsPath, destino);
      cuantos += 1;
    } catch {
      /* uno que falle no tumba los demás */
    }
  }

  if (!cuantos) return { ok: false, mensaje: 'No he podido copiar ninguno. Prueba con "Algo va mal".' };
  return {
    ok: true,
    cuantos,
    mensaje: cuantos === 1 ? 'Documento añadido. Se lo paso.' : `${cuantos} documentos añadidos. Se los paso.`,
  };
}

module.exports = {
  catalogo,
  articulos,
  cuantoSabe,
  abrirArticulo,
  aprendidoUltimamente,
  loQueAunNoSabe,
  hayPanel,
  abrirPanel,
  esperandoLectura,
  yaLeidos,
  originales,
  anadirDocumentos,
};
