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

const CARPETA = ['02-DOCS', 'wiki', 'brand'];
const FICHERO = 'marca.md';
const LOGOS = /\.(svg|png|jpe?g|webp)$/i;

function carpeta() {
  return proyecto.ruta(...CARPETA);
}

// El logotipo vive junto al récord. Se comprueba que no se salga de ahí: el
// nombre viene de un fichero que escribe el asistente.
function logoDe(campos, donde) {
  if (typeof campos.logo !== 'string' || !LOGOS.test(campos.logo)) return null;
  const completa = path.resolve(donde, campos.logo);
  if (!completa.startsWith(donde + path.sep) || !fs.existsSync(completa)) return null;
  return completa;
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

  return {
    nombre: campos.title || null,
    web: typeof campos.resource === 'string' ? campos.resource : null,
    logo: logoDe(campos, donde),
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
function estilo(marca) {
  if (!marca || !marca.tokens) return '';
  const lineas = Object.entries(marca.tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `<style>\n:root {\n${lineas}\n}\n</style>`;
}

module.exports = { leer, estilo, CARPETA, FICHERO };
