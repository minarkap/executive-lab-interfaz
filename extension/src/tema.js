// Darle material para que ponga la cara de la empresa.
//
// ── Quién hace qué ───────────────────────────────────────────────────────
//
// **El diseño lo hace el asistente, no la barra.** Esto es solo la puerta por
// la que entra el material: la web, el logotipo, un manual de marca en PDF, una
// captura de su página, o nada de eso y contárselo con palabras.
//
// La primera versión de este fichero tenía selectores de color dentro de la
// barra. Jose lo corrigió: *«la idea es que lo haga el agente de IA. La
// cuestión es qué material le pasas»*. Y tiene razón — elegir tres colores que
// peguen entre sí no es algo que se le pueda pedir a alguien que no sabe lo que
// es un color de acento, y el asistente sí sabe mirar una web y sacarlos.
//
// Lo que sí es nuestro y no suyo: **que lo que elija se pueda leer**. De eso se
// encarga `marca.js` con la escala tonal de Material Design, y por eso aquí no
// se valida ningún color: se valida más tarde, cuando se pinta, y si no cumple
// se descarta diciendo por qué.
//
// El material se guarda junto al récord, en `02-DOCS/wiki/brand/`, porque es
// donde el asistente va a escribirlo y donde `marca.js` busca el logotipo.

const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const proyecto = require('./proyecto');
const marca = require('./marca');

const CABE = 8 * 1024 * 1024;

function carpeta() {
  const donde = proyecto.ruta(...marca.CARPETA);
  if (!donde) return null;
  fs.mkdirSync(donde, { recursive: true });
  return donde;
}

// Sin pisar lo que ya esté: el asistente puede haber dejado ahí su trabajo.
function sitioLibre(donde, nombre) {
  const extension = path.extname(nombre);
  const base = path.basename(nombre, extension);
  let destino = path.join(donde, nombre);
  for (let n = 2; fs.existsSync(destino); n += 1) destino = path.join(donde, `${base} (${n})${extension}`);
  return destino;
}

// Lo que llega arrastrado, ya leído por el panel: la extensión solo escribe.
function guardarSoltado(ficheros) {
  const donde = carpeta();
  if (!donde) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  const puestos = [];
  for (const fichero of ficheros || []) {
    if (!fichero || typeof fichero.nombre !== 'string') continue;
    let bytes;
    try {
      bytes = Buffer.from(String(fichero.datos || ''), 'base64');
    } catch {
      bytes = null;
    }
    if (!bytes || !bytes.length || bytes.length > CABE) continue;
    const destino = sitioLibre(donde, path.basename(fichero.nombre));
    try {
      fs.writeFileSync(destino, bytes);
      puestos.push(path.basename(destino));
    } catch { /* uno que falle no tumba los demás */ }
  }

  return puestos.length
    ? { ok: true, puestos, mensaje: `Guardado${puestos.length === 1 ? '' : 's'} ${puestos.length}.` }
    : { ok: false, mensaje: 'No he podido guardar nada de eso.' };
}

// Y lo que se elige con el diálogo de siempre.
async function elegirMaterial() {
  const elegidos = await vscode.window.showOpenDialog({
    canSelectMany: true,
    openLabel: 'Usar esto',
    title: 'El logotipo, su manual de marca, una captura de su web…',
  });
  if (!elegidos || !elegidos.length) return { ok: true, puestos: [], cancelado: true };

  const donde = carpeta();
  if (!donde) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  const puestos = [];
  for (const uri of elegidos) {
    try {
      const destino = sitioLibre(donde, path.basename(uri.fsPath));
      fs.copyFileSync(uri.fsPath, destino);
      puestos.push(path.basename(destino));
    } catch { /* idem */ }
  }
  return puestos.length
    ? { ok: true, puestos, mensaje: `Guardado${puestos.length === 1 ? '' : 's'} ${puestos.length}.` }
    : { ok: false, mensaje: 'No he podido copiar eso.' };
}

// Lo que hay ahora mismo en esa carpeta, aparte del récord: es lo que el
// asistente tiene para mirar, y conviene que se vea qué le hemos dado.
function material() {
  const donde = proyecto.ruta(...marca.CARPETA);
  if (!donde || !fs.existsSync(donde)) return [];
  try {
    return fs.readdirSync(donde, { withFileTypes: true })
      .filter((e) => e.isFile() && !e.name.startsWith('.') && e.name !== marca.FICHERO)
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// Volver a la de Executive Lab: se borra el récord. El material se queda — lo
// dio esa persona y no es nuestro para borrarlo.
function quitarla() {
  const donde = proyecto.ruta(...marca.CARPETA);
  const registro = donde ? path.join(donde, marca.FICHERO) : null;
  if (registro && fs.existsSync(registro)) {
    try {
      fs.unlinkSync(registro);
    } catch {
      return { ok: false, mensaje: 'No he podido quitarla.' };
    }
  }
  return { ok: true, mensaje: 'Vuelta a la cara de siempre.' };
}

function comoEstamos() {
  const suya = marca.leer();
  return {
    puesta: Boolean(suya && suya.tokens),
    descartada: suya && suya.descartada ? suya.descartada : null,
    nombre: suya ? suya.nombre : null,
    web: suya ? suya.web : null,
    hayLogo: Boolean(suya && suya.logo),
    material: material(),
  };
}

// Lo que se le pide cuando ya tiene el material delante. El contrato de campos
// lo pone `marca.queLePedimos`, que es donde vive y no se duplica aquí.
function queLePedimos({ web, puestos = [], contado }) {
  const trozos = [marca.queLePedimos(web)];

  if (puestos.length) {
    trozos.push('', `Te he dejado en esa misma carpeta: ${puestos.join(', ')}. Míralos: de ahí salen los colores y el logotipo.`);
  }
  if (contado) trozos.push('', `Y esto es lo que te puedo contar yo: ${contado}`);

  return trozos.join('\n');
}

module.exports = { guardarSoltado, elegirMaterial, material, quitarla, comoEstamos, queLePedimos };
