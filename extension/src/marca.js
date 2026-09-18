// La marca de la empresa del alumno, no la nuestra.
//
// Cuando el alumno dice cuál es la web de su empresa, el asistente la mira y
// deja el récord en `02-DOCS/wiki/brand/marca.md` — que es donde RSC guarda la
// identidad visual de un proyecto (la misma carpeta que usan `design`,
// `design-dna` y `brand-voice`). El panel lo lee y se pinta con sus colores y
// su logotipo.
//
// Mientras no exista ese fichero, la marca es la de Executive Lab. Es el
// default correcto: durante el curso, hasta que cuente de qué va su empresa.
//
// Aquí no se cambia la tipografía ni los tamaños. Los colores de una web se
// pueden adoptar sin romper nada; una tipografía ajena, no — y el público de
// esto no puede permitirse una interfaz que de pronto no se lee.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');
const color = require('./color');
const medidas = require('./medidas');

const CARPETA = ['02-DOCS', 'wiki', 'brand'];
const FICHERO = 'marca.md';
const LOGOS = /\.(svg|png|jpe?g|webp)$/i;

function carpeta() {
  return proyecto.ruta(...CARPETA);
}

// El logotipo vive junto al récord. Se comprueba que no se salga de ahí: el
// nombre viene de un fichero que escribe el asistente.
//
// Y si no hay logotipo utilizable no pasa nada: el panel escribe el nombre de
// la empresa con la tipografía y los colores de la marca. Es la salida buena
// para el caso más común — un logotipo blanco sobre transparente, que sobre
// fondo claro desaparece— y para las muchas pymes que no tienen logotipo
// en un fichero a mano.
function logoDe(campos, donde) {
  if (typeof campos.logo !== 'string' || !LOGOS.test(campos.logo)) return null;
  const completa = path.resolve(donde, campos.logo);
  if (!completa.startsWith(donde + path.sep) || !fs.existsSync(completa)) return null;
  return completa;
}

// ¿El logotipo lleva el nombre de la empresa dentro, o es solo el símbolo?
//
// Importa porque un símbolo suelto en lo alto de la barra no dice de quién es
// esto. El de Nexus Consulting es una ene de puntos: preciosa, y no se sabe de
// quién es. Si el logotipo no trae el nombre, el nombre se escribe al lado.
//
// Dos maneras de saberlo, en este orden:
//
//   1. **Que lo diga el récord.** Quien miró la web vio la imagen y lo sabe.
//      Se aceptan varias formas de escribirlo porque el récord lo redacta el
//      asistente, no un formulario.
//   2. **La proporción.** Un logotipo con el nombre es una tira de letras, y
//      sale ancho; un símbolo es más o menos cuadrado. Desde tres veces más
//      ancho que alto se da por hecho que el nombre va dentro.
//
// Y si no se puede saber, se escribe el nombre. Repetirlo queda redundante;
// no ponerlo deja un dibujo anónimo, que es peor.
const SI = /^(s[ií]|yes|true|1)$/i;
const NO = /^(no|false|0)$/i;
const DICEN_QUE_SI = ['logo_lleva_el_nombre', 'logo_con_nombre', 'logotipo_con_nombre', 'logo_incluye_el_nombre'];
const DE_TIRA_PARA_ARRIBA = 3;

function llevaElNombre(campos, fichero) {
  for (const clave of DICEN_QUE_SI) {
    const dicho = campos[clave];
    if (typeof dicho !== 'string') continue;
    if (SI.test(dicho.trim())) return true;
    if (NO.test(dicho.trim())) return false;
  }

  const medida = medidas.medir(fichero);
  if (!medida) return false;
  return medida.ancho / medida.alto >= DE_TIRA_PARA_ARRIBA;
}

// Devuelve los colores ya comprobados, o null si no hay marca utilizable.
function leer() {
  const donde = carpeta();
  if (!donde) return null;

  const registro = path.join(donde, FICHERO);
  if (!fs.existsSync(registro)) return null;

  const campos = frontmatter.leer(registro);
  const fondo = color.esColor(campos.fondo) ? campos.fondo.trim() : null;
  const texto = color.esColor(campos.texto) ? campos.texto.trim() : null;
  const acento = color.esColor(campos.acento) ? campos.acento.trim() : null;
  if (!fondo || !texto || !acento) return null;

  // Si el texto no se lee sobre el fondo, la marca no sirve y se descarta
  // entera: mejor la nuestra que una interfaz ilegible.
  if (color.contraste(texto, fondo) < 4.5) {
    return { descartada: 'el texto no se lee sobre el fondo', nombre: campos.title || null };
  }

  const superficie = color.esColor(campos.superficie)
    ? campos.superficie.trim()
    : color.mezclar(fondo, color.luz(fondo) > 0.5 ? '#ffffff' : '#000000', 0.55);

  // El acento se oscurece (o aclara) hasta que se lea el texto de encima. Si
  // no se consigue, el acento se queda para bordes y foco, y el relleno de
  // botón usa el color de texto, que sí se lee.
  const acentoFuerte = color.hastaQueSeLea(acento, '#ffffff') || texto;

  // El nombre a secas, para poder escribirlo cuando no haya logotipo usable.
  // El título del artículo suele ser "Marca de X", que como rótulo no sirve.
  const nombre = (typeof campos.empresa === 'string' && campos.empresa.trim())
    || (typeof campos.title === 'string' ? campos.title.replace(/^marca de\s+/i, '').trim() : null);

  const logo = logoDe(campos, donde);

  return {
    nombre: nombre || null,
    web: typeof campos.resource === 'string' ? campos.resource : null,
    logo,
    // Solo tiene sentido preguntárselo si hay logotipo y hay nombre que poner.
    logoSinNombre: Boolean(logo && nombre && !llevaElNombre(campos, logo)),
    carpeta: donde,
    ajustado: acentoFuerte !== acento,
    tokens: {
      '--crema': fondo,
      '--crema-2': color.mezclar(fondo, texto, 0.07),
      '--papel': superficie,
      '--tinta': texto,
      '--tinta-texto': texto,
      '--gris': color.apagadoSobre(texto, fondo),
      '--linea': color.mezclar(fondo, texto, 0.14),
      '--rojo': acento,
      '--rojo-fuerte': acentoFuerte,
    },
  };
}

// El bloque que se cuela en la página para que mande sobre los valores por
// defecto de panel.css.
//
// ── Y el caso del tema oscuro ────────────────────────────────────────────
//
// `panel.css` tiene una regla que, con un tema oscuro del editor, le quita a la
// marca el fondo y se queda solo con los acentos. Se puso por una razón buena:
// una isla color crema dentro de un editor negro queda fatal.
//
// Pero esa razón no vale cuando **la marca ya es oscura**. La de Nexus
// Consulting es azul marino con cian: ahí la regla estaba tirando a la basura
// justo los colores que encajaban. Así que si el fondo de la empresa es oscuro,
// manda su fondo también con tema oscuro.
//
// El alto contraste se queda fuera a propósito: quien lo usa lo usa porque lo
// necesita, y ninguna marca vale eso.
function estilo(marca) {
  if (!marca || !marca.tokens) return '';
  const lineas = Object.entries(marca.tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');

  const suyoEsOscuro = color.luz(marca.tokens['--crema']) <= 0.5;
  const conTemaOscuro = suyoEsOscuro ? `
body.vscode-dark {
  --fondo: ${marca.tokens['--crema']};
  --superficie: ${marca.tokens['--papel']};
  --texto: ${marca.tokens['--tinta-texto']};
  --texto-fuerte: ${marca.tokens['--tinta']};
  --apagado: ${marca.tokens['--gris']};
  --borde: ${marca.tokens['--linea']};
}` : '';

  return `<style>\n:root {\n${lineas}\n}${conTemaOscuro}\n</style>`;
}

// Lo que se le pide al asistente cuando el alumno da su web.
//
// ── Por qué está escrito con este detalle ────────────────────────────────
//
// Antes se le decía «mira la web y ponle a esto la cara de mi empresa: sus
// colores y su logotipo», sin decirle dónde escribirlo ni con qué nombres. Si
// acertaba era por suerte, y cuando no acertaba **no fallaba nada**: el récord
// quedaba escrito, el panel no encontraba los campos que sabe leer y la barra
// se quedaba con los colores de Executive Lab. Nadie se enteraba de que había
// pasado algo.
//
// Así que el contrato se dice entero. Las tres cosas que importan: dónde va,
// cómo se llaman los campos, y que los colores sean los de verdad de la web
// —si es oscura, oscuros— porque la barra sabe pintarse oscura.
function queLePedimos(web) {
  return [
    `Mira ${web} y ponle a esto la cara de mi empresa.`,
    '',
    `Déjalo en \`${CARPETA.join('/')}/${FICHERO}\`, con estos campos en la cabecera y escritos así:`,
    '',
    '- `empresa:` cómo se llama.',
    '- `fondo:`, `texto:` y `acento:` los tres colores de su web, en formato `#rrggbb`.',
    '  Cógelos de verdad de la web: si la web es oscura, el fondo va oscuro. Esto se pinta igual de bien claro que oscuro, así que no los aclares para que "encajen".',
    '- `superficie:` opcional, el color de sus tarjetas o cajas si lo tiene.',
    '- `logo:` el nombre del fichero del logotipo, que tiene que quedar guardado en esa misma carpeta.',
    '- `logo_lleva_el_nombre:` `si` si el logotipo trae dentro el nombre escrito, `no` si es solo el símbolo.',
    '- `resource:` la web.',
    '',
    'Si el texto no se lee sobre el fondo que elijas, se descarta todo y se queda la cara de siempre, así que elige un par que se lea.',
  ].join('\n');
}

module.exports = { leer, estilo, queLePedimos, CARPETA, FICHERO };
