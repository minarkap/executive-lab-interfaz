// Las cuentas de color, para no tener que fiarse de la web de nadie.
//
// La marca del alumno sale de su propia web, y la web de una pyme casi nunca
// cumple contraste. Como el público de esto puede tener poca vista, aquí se
// comprueba y se corrige antes de pintar nada: el acento se oscurece hasta que
// se pueda leer encima, y si el texto sobre el fondo no hay quien lo lea, se
// descarta la marca entera y se usa la de Executive Lab.

const HEX = /^#[0-9a-f]{6}$/i;

function aRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

const aHex = (rgb) => `#${rgb.map((c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('')}`;

// Luminancia relativa de la WCAG 2.1.
function luz(hex) {
  const lineal = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = aRgb(hex).map(lineal);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [alta, baja] = [luz(a), luz(b)].sort((x, y) => y - x);
  return (alta + 0.05) / (baja + 0.05);
}

// Mezcla dos colores. Sirve para sacar bordes y textos apagados del propio par
// fondo/texto de la empresa, en vez de fijarlos a ojo.
function mezclar(a, b, parte) {
  const [ra, rb] = [aRgb(a), aRgb(b)];
  return aHex(ra.map((c, i) => c * (1 - parte) + rb[i] * parte));
}

const esColor = (valor) => typeof valor === 'string' && HEX.test(valor.trim());

// Oscurece o aclara un color hasta que el texto de encima se lea. Devuelve
// null si no se consigue, que con un color válido no debería pasar.
function hastaQueSeLea(color, encima, minimo = 4.5) {
  if (contraste(color, encima) >= minimo) return color;

  const haciaNegro = luz(encima) > luz(color) ? '#000000' : '#ffffff';
  let candidato = color;
  for (let paso = 1; paso <= 20; paso += 1) {
    candidato = mezclar(color, haciaNegro, paso * 0.05);
    if (contraste(candidato, encima) >= minimo) return candidato;
  }
  return null;
}

// Un gris apagado que se lea sobre el fondo: se acerca al texto hasta cumplir.
function apagadoSobre(texto, fondo, minimo = 4.5) {
  for (let parte = 60; parte >= 0; parte -= 5) {
    const candidato = mezclar(texto, fondo, parte / 100);
    if (contraste(candidato, fondo) >= minimo) return candidato;
  }
  return texto;
}

module.exports = { esColor, luz, contraste, mezclar, hastaQueSeLea, apagadoSobre, aHex };
