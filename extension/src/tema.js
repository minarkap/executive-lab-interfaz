// Ponerle a la barra la cara de tu empresa, desde la barra.
//
// ── Por qué existe ───────────────────────────────────────────────────────
//
// `marca.js` sabe LEER el récord y repintar con él. Escribirlo era cosa del
// asistente: se le daba la web y él miraba y redactaba el fichero. Jose lo
// probó y no se pintó nada, y el motivo es que ese camino tiene tres formas de
// fallar en silencio — que no escriba, que escriba con otros nombres de campo,
// o que elija unos colores que no pasan el contraste y se descarten enteros.
// En las tres, la barra se queda igual y nadie se entera.
//
// Así que la barra también sabe escribirlo. La web sigue valiendo —es lo cómodo
// cuando la hay— pero ya no es el único camino: se puede subir un logotipo y
// elegir los colores a mano, que es lo que necesita una pyme sin web decente.
//
// ── Las tipografías, que antes no se tocaban ─────────────────────────────
//
// `marca.js` decía que la tipografía no se cambia nunca, y el motivo era bueno:
// una tipografía ajena puede dejar la interfaz ilegible para quien ve poco.
// Jose quiere poder cambiarla, así que se cambia — pero **de una lista corta**,
// no libre. Nada de traerse una fuente de una web: el panel no pide nada a la
// red a propósito, y una fuente que no carga deja la barra en lo que el sistema
// decida. Las de la lista o viajan dentro o las tiene cualquier ordenador.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const color = require('./color');
const marca = require('./marca');

const CARPETA = marca.CARPETA;
const FICHERO = marca.FICHERO;

// Las que se pueden elegir. `dentro` son las que viajan con la extensión; el
// resto las tiene cualquier ordenador desde hace veinte años.
const TIPOGRAFIAS = [
  {
    id: 'executive',
    nombre: 'La de siempre',
    frase: 'La de Executive Lab. Titulares con gracia y texto que se lee bien.',
    sans: "'Lato EL', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    serif: "'DM Serif EL', Georgia, 'Times New Roman', serif",
  },
  {
    id: 'sistema',
    nombre: 'La de tu ordenador',
    frase: 'La que usa tu ordenador para todo lo demás. La más neutra.',
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    id: 'clasica',
    nombre: 'Clásica',
    frase: 'Con remates, como un documento impreso. Seria.',
    sans: "Georgia, 'Times New Roman', serif",
    serif: "Georgia, 'Times New Roman', serif",
  },
  {
    id: 'grande',
    nombre: 'Fácil de leer',
    frase: 'Más gruesa y más abierta. Si te cuesta leer la pantalla, esta.',
    sans: "Verdana, Tahoma, -apple-system, sans-serif",
    serif: "Verdana, Tahoma, Georgia, serif",
  },
];

const porId = (id) => TIPOGRAFIAS.find((t) => t.id === id) || null;

// Lo que se puede subir como logotipo. Lo mismo que `marca.js` sabe leer.
const LOGOS = /\.(svg|png|jpe?g|webp)$/i;
const CABE = 4 * 1024 * 1024;

function carpeta() {
  const donde = proyecto.ruta(...CARPETA);
  if (!donde) return null;
  fs.mkdirSync(donde, { recursive: true });
  return donde;
}

function registro() {
  const donde = carpeta();
  return donde ? path.join(donde, FICHERO) : null;
}

// Se escribe campo a campo respetando lo que ya haya: en ese fichero puede
// estar el trabajo del asistente mirando la web, y cambiar un color a mano no
// puede llevarse por delante el logotipo que encontró él.
function ponerCampos(campos) {
  const ruta = registro();
  if (!ruta) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  let texto = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  if (!/^---\r?\n[\s\S]*?\r?\n---/.test(texto)) {
    texto = `---\ntype: concept\ntitle: Marca\n---\n\n# Marca\n\n${texto}`.trimEnd() + '\n';
  }

  for (const [clave, valor] of Object.entries(campos)) {
    if (valor === null || valor === undefined) continue;
    const linea = `${clave}: ${valor}`;
    const patron = new RegExp(`^${clave}\\s*:.*$`, 'mi');
    texto = patron.test(texto)
      ? texto.replace(patron, linea)
      : texto.replace(/^---\r?\n/, `---\n${linea}\n`);
  }

  try {
    fs.writeFileSync(ruta, texto);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo. Prueba con "Algo va mal".' };
  }
  return { ok: true };
}

// ------------------------------------------------------------- los colores

function ponerColores({ fondo, texto, acento }) {
  for (const [nombre, valor] of Object.entries({ fondo, texto, acento })) {
    if (!color.esColor(valor)) return { ok: false, mensaje: `Ese ${nombre} no es un color.` };
  }

  // Se avisa ANTES de escribir, no después de que la barra no cambie. Este es
  // justo el fallo silencioso que hacía que "poner el tema" pareciera roto.
  if (color.contraste(texto, fondo) < 4.5) {
    return {
      ok: false,
      mensaje: 'Con ese fondo y ese color de letra no se lee. Elige un par con más diferencia.',
    };
  }

  return ponerCampos({ fondo, texto, acento });
}

const ponerTipografia = (id) => (porId(id)
  ? ponerCampos({ tipografia: id })
  : { ok: false, mensaje: 'Esa no es una de las opciones.' });

// ------------------------------------------------------------- el logotipo

// Llega leído por el panel, como los documentos que se sueltan: la extensión
// solo escribe. Se guarda junto al récord, que es donde `marca.js` lo busca.
function ponerLogo({ nombre, datos }) {
  const donde = carpeta();
  if (!donde) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };
  if (typeof nombre !== 'string' || !LOGOS.test(nombre)) {
    return { ok: false, mensaje: 'Eso no es una imagen que sepa poner. Vale png, jpg, webp o svg.' };
  }

  let bytes;
  try {
    bytes = Buffer.from(String(datos || ''), 'base64');
  } catch {
    bytes = null;
  }
  if (!bytes || !bytes.length) return { ok: false, mensaje: 'No he podido leer esa imagen.' };
  if (bytes.length > CABE) return { ok: false, mensaje: 'Esa imagen pesa demasiado. Prueba con una más pequeña.' };

  // Nombre fijo, con su extensión: así cambiar de logotipo no deja los viejos
  // criando polvo en la carpeta de la marca.
  const comoSeLlama = `logo${path.extname(nombre).toLowerCase()}`;
  try {
    for (const viejo of fs.readdirSync(donde)) {
      if (/^logo\./i.test(viejo) && viejo !== comoSeLlama) fs.unlinkSync(path.join(donde, viejo));
    }
    fs.writeFileSync(path.join(donde, comoSeLlama), bytes);
  } catch {
    return { ok: false, mensaje: 'No he podido guardar la imagen.' };
  }

  return ponerCampos({ logo: comoSeLlama });
}

function quitarLogo() {
  const donde = carpeta();
  if (!donde) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };
  try {
    for (const viejo of fs.readdirSync(donde)) {
      if (/^logo\./i.test(viejo)) fs.unlinkSync(path.join(donde, viejo));
    }
  } catch { /* si no estaba, mejor */ }
  return ponerCampos({ logo: '' });
}

// Volver a la de Executive Lab: se borra el récord entero. Media marca —los
// colores suyos con nuestro logotipo— es peor que cualquiera de las dos.
function quitarla() {
  const ruta = registro();
  if (ruta && fs.existsSync(ruta)) {
    try {
      fs.unlinkSync(ruta);
    } catch {
      return { ok: false, mensaje: 'No he podido quitarla.' };
    }
  }
  quitarLogo();
  return { ok: true, mensaje: 'Vuelta a la cara de siempre.' };
}

// Lo que ve la pantalla: qué hay puesto, y si algo se ha descartado, por qué.
function comoEstamos() {
  const suya = marca.leer();
  return {
    tipografias: TIPOGRAFIAS,
    puesta: Boolean(suya && suya.tokens),
    descartada: suya && suya.descartada ? suya.descartada : null,
    nombre: suya ? suya.nombre : null,
    web: suya ? suya.web : null,
    hayLogo: Boolean(suya && suya.logo),
    tipografia: (suya && suya.tipografia) || 'executive',
    colores: suya && suya.tokens
      ? { fondo: suya.tokens['--crema'], texto: suya.tokens['--tinta'], acento: suya.tokens['--rojo'] }
      : { fondo: '#f4eee6', texto: '#0a0a0a', acento: '#ec4429' },
  };
}

module.exports = {
  comoEstamos, ponerColores, ponerTipografia, ponerLogo, quitarLogo, quitarla, TIPOGRAFIAS, porId,
};
