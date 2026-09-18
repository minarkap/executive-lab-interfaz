// Cuánto mide una imagen, sin abrirla del todo y sin depender de nada.
//
// ── Para qué ─────────────────────────────────────────────────────────────
//
// Para saber si el logotipo de una empresa **lleva el nombre dentro** o es solo
// el símbolo. Un logotipo con el nombre es ancho y bajo —una tira de letras—;
// un símbolo suelto es más o menos cuadrado. No es una regla perfecta, pero es
// la única señal que hay en el propio fichero, y se usa solo cuando el récord
// de marca no lo dice.
//
// Se leen los primeros bytes de la cabecera, que es donde todos los formatos
// guardan el tamaño. Nada de descodificar la imagen: eso sería traer una
// dependencia para responder a una pregunta de dos números.

const fs = require('node:fs');

// Lo justo para llegar a la cabecera del formato más hablador (JPEG, que
// guarda el tamaño detrás de metadatos que pueden ser largos).
const ASOMARSE = 64 * 1024;

function primeros(fichero) {
  try {
    const mango = fs.openSync(fichero, 'r');
    try {
      const trozo = Buffer.alloc(ASOMARSE);
      const leidos = fs.readSync(mango, trozo, 0, ASOMARSE, 0);
      return trozo.subarray(0, leidos);
    } finally {
      fs.closeSync(mango);
    }
  } catch {
    return null;
  }
}

// SVG: manda el viewBox, que es lo que de verdad define la proporción. Las
// medidas sueltas valen de reserva, y pueden traer unidades (`120px`, `4rem`).
function deSvg(texto) {
  const caja = texto.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (caja) return { ancho: parseFloat(caja[1]), alto: parseFloat(caja[2]) };

  const medida = (cual) => {
    const m = texto.match(new RegExp(`\\s${cual}\\s*=\\s*["']\\s*([\\d.]+)`, 'i'));
    return m ? parseFloat(m[1]) : 0;
  };
  const ancho = medida('width');
  const alto = medida('height');
  return ancho && alto ? { ancho, alto } : null;
}

function dePng(b) {
  // Firma de 8 bytes, después la longitud y el rótulo `IHDR`, y ahí el tamaño.
  if (b.length < 24 || b.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
}

function deJpeg(b) {
  // Se van saltando segmentos hasta dar con el que declara el tamaño (SOF).
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }
    const marca = b[i + 1];
    if (marca === 0xd8 || marca === 0x01 || (marca >= 0xd0 && marca <= 0xd7)) { i += 2; continue; }

    const largo = b.readUInt16BE(i + 2);
    // Los SOF llevan el tamaño; los tres huecos son otras cosas que se parecen.
    const esTamano = (marca >= 0xc0 && marca <= 0xcf)
      && marca !== 0xc4 && marca !== 0xc8 && marca !== 0xcc;
    if (esTamano) return { ancho: b.readUInt16BE(i + 7), alto: b.readUInt16BE(i + 5) };

    if (largo < 2) return null;
    i += 2 + largo;
  }
  return null;
}

function deWebp(b) {
  if (b.length < 30 || b.toString('latin1', 8, 12) !== 'WEBP') return null;
  const clase = b.toString('latin1', 12, 16);

  if (clase === 'VP8X') return { ancho: b.readUIntLE(24, 3) + 1, alto: b.readUIntLE(27, 3) + 1 };
  if (clase === 'VP8 ') return { ancho: b.readUInt16LE(26) & 0x3fff, alto: b.readUInt16LE(28) & 0x3fff };
  if (clase === 'VP8L') {
    const n = b.readUInt32LE(21);
    return { ancho: (n & 0x3fff) + 1, alto: ((n >> 14) & 0x3fff) + 1 };
  }
  return null;
}

// Devuelve `{ ancho, alto }` o null si no se puede saber. Nunca lanza: esto
// solo decide si además del dibujo se escribe el nombre, y no saberlo tiene
// una salida buena.
function medir(fichero) {
  const b = primeros(fichero);
  if (!b || b.length < 16) return null;

  let medida = null;
  if (b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG') medida = dePng(b);
  else if (b[0] === 0xff && b[1] === 0xd8) medida = deJpeg(b);
  else if (b.toString('latin1', 0, 4) === 'RIFF') medida = deWebp(b);
  else medida = deSvg(b.toString('utf8'));

  if (!medida || !(medida.ancho > 0) || !(medida.alto > 0)) return null;
  return medida;
}

module.exports = { medir };
