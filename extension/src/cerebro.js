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
      actual = { id: cabecera[1], etiqueta: humanizar(cabecera[1]), descripcion: null, articulos: [] };
      temas.push(actual);
      continue;
    }
    if (!actual) continue;

    // Bajo el título de cada tema, RSC deja una línea que lo describe. Es
    // mejor rótulo que el nombre de la carpeta, que viene sin tildes.
    const suelta = linea.trim();
    if (suelta && !suelta.startsWith('|') && !suelta.startsWith('>') && !actual.descripcion && !actual.articulos.length) {
      if (!ES_PLANTILLA(suelta)) actual.descripcion = suelta;
      continue;
    }

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

// La ruta viene del índice, que escribe el asistente: se comprueba que no se
// salga de la wiki antes de abrir nada.
function dentroDeLaWiki(rutaRelativa) {
  const wiki = proyecto.ruta(...WIKI);
  if (!wiki) return null;
  const completa = path.resolve(wiki, rutaRelativa);
  return completa.startsWith(wiki + path.sep) && fs.existsSync(completa) ? completa : null;
}

// Los enlaces que un artículo hace a otros. Se resuelven aquí, con la misma
// guarda que todo lo demás, y el panel solo pinta como clicables los que
// existen de verdad: antes se pintaban todos como texto muerto, y un artículo
// que remitía a otro era un callejón sin salida.
function enlacesDe(cuerpo, rutaRelativa) {
  const carpeta = path.dirname(rutaRelativa);
  const encontrados = {};

  for (const [, destino] of cuerpo.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    if (/^https?:|^mailto:|^#/.test(destino) || encontrados[destino]) continue;
    // El ancla de dentro del fichero no lleva a otro documento.
    const limpio = destino.split('#')[0];
    if (!limpio) continue;

    const relativa = path.posix.normalize(path.posix.join(carpeta === '.' ? '' : carpeta, limpio));
    if (dentroDeLaWiki(relativa)) encontrados[destino] = relativa;
  }
  return encontrados;
}

// El artículo se lee DENTRO del panel, no en la vista previa de VS Code: esa
// enseña el frontmatter —`type: article`, `score: 7.0`— antes que el texto, y
// eso es exactamente lo que este proyecto existe para no enseñar.
function leerArticulo(rutaRelativa) {
  const completa = dentroDeLaWiki(rutaRelativa);
  if (!completa) return { ok: false, mensaje: 'Ese documento ya no está donde decía el índice.' };

  let texto;
  try {
    texto = fs.readFileSync(completa, 'utf8');
  } catch {
    return { ok: false, mensaje: 'No he podido abrirlo. Prueba con "Algo va mal".' };
  }

  // Fuera la cabecera técnica, y fuera el título repetido: ya va de rótulo.
  const cuerpo = texto.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trimStart();
  const titulo = (cuerpo.match(/^#\s+(.+)$/m) || [])[1] || path.basename(completa, '.md');

  const sinTitulo = cuerpo.replace(/^#\s+.+\r?\n/, '').trimStart();
  return {
    ok: true,
    titulo: titulo.trim(),
    cuerpo: sinTitulo,
    enlaces: enlacesDe(sinTitulo, rutaRelativa),
  };
}

// Todo lo que hay escrito en la wiki, lo mencione el índice o no.
function todosLosDocumentos() {
  const wiki = proyecto.ruta(...WIKI);
  if (!wiki || !fs.existsSync(wiki)) return [];

  const fuera = ['harness', 'brand'];
  const raiz = ['index.md', 'log.md', 'gaps.md'];
  const encontrados = [];

  const recorrer = (carpeta) => {
    let entradas;
    try {
      entradas = fs.readdirSync(carpeta, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      if (entrada.name.startsWith('.')) continue;
      const completa = path.join(carpeta, entrada.name);
      const relativa = path.relative(wiki, completa);
      if (entrada.isDirectory()) {
        if (!fuera.includes(entrada.name)) recorrer(completa);
      } else if (entrada.name.endsWith('.md') && !raiz.includes(relativa)) {
        encontrados.push(relativa);
      }
    }
  };
  recorrer(wiki);
  return encontrados;
}

// Lo que está escrito pero el índice no menciona. Hasta ahora era invisible
// desde el panel: existía en el disco y no había forma de llegar a ello.
function sinOrdenar() {
  const indexados = new Set(catalogo().flatMap((t) => t.articulos.map((a) => a.ruta.replace(/^\.\//, ''))));
  return todosLosDocumentos()
    .filter((r) => !indexados.has(r))
    .map((ruta) => ({
      ruta,
      titulo: (leer(...WIKI, ruta) || '')
        .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
        .match(/^#\s+(.+)$/m)?.[1]?.trim()
        || humanizar(path.basename(ruta, '.md')),
    }));
}

// Lo que no es markdown (un archivado en HTML, un original) se abre fuera.
async function abrirFuera(rutaRelativa) {
  const completa = dentroDeLaWiki(rutaRelativa);
  if (!completa) return { ok: false, mensaje: 'Ese documento ya no está donde decía el índice.' };
  await vscode.env.openExternal(vscode.Uri.file(completa));
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

// Cuántos días lleva esperando el documento más viejo de la bandeja. Sirve
// para no dar la lata el mismo día que se dejan, y sí a los tres días.
function esperandoDesdeHace() {
  const inbox = proyecto.ruta(...INBOX);
  if (!inbox || !fs.existsSync(inbox)) return null;

  let masViejo = null;
  for (const entrada of fs.readdirSync(inbox, { withFileTypes: true })) {
    if (!entrada.isFile() || entrada.name.startsWith('.') || entrada.name === 'README.md') continue;
    try {
      const cuando = fs.statSync(path.join(inbox, entrada.name)).mtimeMs;
      if (masViejo === null || cuando < masViejo) masViejo = cuando;
    } catch { /* uno que no se pueda mirar no tumba el resto */ }
  }
  return masViejo === null ? null : Math.floor((Date.now() - masViejo) / 86400000);
}

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
  sinOrdenar,
  todosLosDocumentos,
  cuantoSabe,
  leerArticulo,
  abrirFuera,
  aprendidoUltimamente,
  loQueAunNoSabe,
  hayPanel,
  abrirPanel,
  esperandoLectura,
  esperandoDesdeHace,
  yaLeidos,
  originales,
  anadirDocumentos,
};
