// Llevarte un archivo: lo que el asistente ha producido y tú te quieres quedar.
//
// ── De dónde sale, y por qué generaliza ──────────────────────────────────
//
// De `01-TOOLS/<herramienta>/out/`, que **es convención de RSC**, no nuestra:
// su propia plantilla escribe un `.gitignore` con `.env`, `keys/` y `out/`, y
// su SKILL.md lo manda. O sea que RSC ya define esa carpeta como el sitio
// donde cae lo que una herramienta produce, y la deja fuera de las copias a
// propósito, porque es resultado y no fuente.
//
// Así que esto vale en cualquier arnés montado con RSC. Donde no haya
// herramientas, o donde `out/` esté vacío, no aparece nada.
//
// ── Solo `out/` ─────────────────────────────────────────────────────────
//
// No la carpeta de la herramienta entera: ahí al lado viven el `.env` con las
// claves y los scripts, y eso no son "archivos para llevarse". Se mira una
// carpeta y solo una, y no se baja a subcarpetas.

const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');

const proyecto = require('./proyecto');
const papeles = require('./papeles');

const CARPETA = '01-TOOLS';
const SALIDA = 'out';

// En una herramienta que lleve meses trabajando esto crece sin parar. Se
// enseñan los más nuevos, que es lo que alguien viene a buscar, y el resto
// queda a un clic de abrir la carpeta.
const TOPE = 20;

const carpetaDeSalida = (herramienta) => proyecto.ruta(CARPETA, herramienta, SALIDA);

// Un nombre de fichero, y solo eso: nada de subcarpetas ni de subir por el
// árbol. Lo que llega del panel no se usa nunca para construir una ruta sin
// pasar por aquí.
function esNombreLimpio(nombre) {
  return Boolean(nombre) && nombre === path.basename(nombre) && nombre !== '.' && nombre !== '..';
}

function donde(herramienta, fichero) {
  if (!esNombreLimpio(herramienta) || !esNombreLimpio(fichero)) return null;
  const carpeta = carpetaDeSalida(herramienta);
  if (!carpeta) return null;

  const completa = path.join(carpeta, fichero);
  // Cinturón: después de resolver, tiene que seguir colgando de esa carpeta.
  if (path.dirname(path.resolve(completa)) !== path.resolve(carpeta)) return null;
  return fs.existsSync(completa) ? completa : null;
}

function tamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function deUnaHerramienta(herramienta) {
  const carpeta = carpetaDeSalida(herramienta);
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  let dentro;
  try {
    dentro = fs.readdirSync(carpeta, { withFileTypes: true });
  } catch {
    return [];
  }

  return dentro
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => {
      const datos = fs.statSync(path.join(carpeta, e.name));
      return { fichero: e.name, cuando: datos.mtime.toISOString(), tamano: tamano(datos.size), orden: datos.mtimeMs };
    })
    .sort((a, b) => b.orden - a.orden);
}

// Todo lo producido, por herramienta. Mismo trato que "Mirar de un vistazo":
// agrupado, y las herramientas sin nada no salen.
function loQueHaProducido() {
  const conexiones = require('./conexiones');

  return conexiones.proveedores()
    .map((p) => {
      const todos = deUnaHerramienta(p.id);
      return {
        id: p.id,
        etiqueta: p.etiqueta,
        cuantos: todos.length,
        archivos: todos.slice(0, TOPE).map(({ orden, ...resto }) => resto),
        hayMas: Math.max(0, todos.length - TOPE),
      };
    })
    .filter((p) => p.cuantos);
}

// Abrirlo con el programa de siempre: un PDF en el visor, una hoja en su
// programa de hojas. Es lo que se quiere el 90% de las veces, y no enseña
// ninguna ruta por el camino.
async function abrir(herramienta, fichero) {
  const completa = donde(herramienta, fichero);
  if (!completa) return { ok: false, mensaje: 'Ese archivo ya no está.' };

  // Al lado y dentro de la misma ventana cuando el editor sepa enseñarlo; con
  // el programa de siempre cuando no. Lo decide `papeles.js`, que es donde está
  // escrito el porqué.
  return papeles.abrirFichero(completa);
}

// Guardarlo donde esa persona diga, con el diálogo del sistema: acaba en el
// Escritorio o en Descargas, que es donde la gente sabe encontrar las cosas.
async function guardarCopia(herramienta, fichero) {
  const completa = donde(herramienta, fichero);
  if (!completa) return { ok: false, mensaje: 'Ese archivo ya no está.' };

  const elegido = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(path.join(require('node:os').homedir(), 'Desktop', fichero)),
    saveLabel: 'Guardar aquí',
    title: 'Dónde quieres guardarlo',
  });
  if (!elegido) return { ok: true, cancelado: true };

  try {
    fs.copyFileSync(completa, elegido.fsPath);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo ahí. Prueba en otra carpeta.' };
  }
  return { ok: true, mensaje: `Guardado: ${path.basename(elegido.fsPath)}` };
}

// "Ver todos": se abre la carpeta en el explorador del sistema. Es la única
// salida honesta cuando hay más de los que caben.
async function abrirLaCarpeta(herramienta) {
  const carpeta = carpetaDeSalida(herramienta);
  if (!carpeta || !fs.existsSync(carpeta)) return { ok: false, mensaje: 'Ahí ya no hay nada.' };

  await vscode.env.openExternal(vscode.Uri.file(carpeta));
  return { ok: true };
}

module.exports = { loQueHaProducido, abrir, guardarCopia, abrirLaCarpeta, TOPE };
