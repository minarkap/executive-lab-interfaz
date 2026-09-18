// Cuánto te explica el asistente, y con qué palabras.
//
// ── Qué es esto ──────────────────────────────────────────────────────────
//
// Es el ajuste más importante del arnés y no había manera de tocarlo. RSC lo
// guarda en `02-DOCS/wiki/harness/user-profile.md` y **todas** sus habilidades
// lo leen antes de abrir la boca: cuánto se explica, cuántas preguntas hace y
// con qué vocabulario. La habilidad `orient` lo dice con todas las letras: L0
// es casi mudo, L3 explica cada paso.
//
// Hasta ahora eso solo se cambiaba diciéndoselo al asistente por escrito, y
// quien no sabe que existe no lo dice nunca. Alguien que se siente perdido no
// tiene forma de pedir más mano; alguien que ya va suelto se come párrafos que
// no quiere. Dos botones lo arreglan.
//
// ── Dónde vive, y por qué hay dos sitios ─────────────────────────────────
//
// El mismo dato aparece de dos formas según quién escribiera el fichero:
//
//   · en la cabecera:      accompaniment: L1
//   · en el cuerpo:        - accompaniment_level: L3   <!-- L0 | L1 | L2 | L3 -->
//
// Las dos son legítimas —la primera la deja el montaje, la segunda es la de la
// plantilla del arnés— así que se leen las dos y se escribe donde ya estaba.
// Escribir donde no estaba dejaría el valor viejo debajo, y el asistente leería
// el que no toca.

const fs = require('node:fs');
const proyecto = require('./proyecto');
const identidad = require('./identidad');

// Los cuatro escalones, dichos como se dicen. El identificador es de RSC; la
// frase es lo único que se ve.
const ESCALONES = [
  { id: 'L0', nombre: 'Al grano', frase: 'Hace lo que le pides y calla. Para cuando ya te manejas.' },
  { id: 'L1', nombre: 'Corto', frase: 'Te dice dónde estás y qué sigue, en dos líneas.' },
  { id: 'L2', nombre: 'Te explica por qué', frase: 'Además te cuenta por qué ha hecho las cosas así y te da a elegir.' },
  { id: 'L3', nombre: 'De la mano', frase: 'Te lo explica todo, paso a paso, y te pregunta mucho. Para empezar.' },
];

const VOCABULARIOS = [
  { id: 'non-technical', nombre: 'En cristiano', frase: 'Nada de palabras raras. Comparaciones con cosas de siempre.' },
  { id: 'mixed', nombre: 'A medias', frase: 'Alguna palabra del oficio, y te la explica la primera vez.' },
  { id: 'technical', nombre: 'Sin rodeos', frase: 'Da por sabido lo básico y no se para a explicarlo.' },
];

const CLAVES_TRATO = ['accompaniment_level', 'accompaniment'];
const CLAVES_PALABRAS = ['technical_level'];

function rutaDelPerfil() {
  return proyecto.ruta(...identidad.PERFIL);
}

function crudo() {
  const ruta = rutaDelPerfil();
  if (!ruta) return null;
  try {
    return fs.readFileSync(ruta, 'utf8');
  } catch {
    return null;
  }
}

// Busca `clave: valor` en cualquiera de las dos formas, con o sin guion
// delante, en la cabecera o en el cuerpo.
function buscar(texto, claves) {
  for (const clave of claves) {
    const m = texto.match(new RegExp(`^\\s*-?\\s*${clave}\\s*:\\s*([^<\\n]+)`, 'mi'));
    if (m && m[1].trim()) return { clave, valor: m[1].trim() };
  }
  return null;
}

function leer() {
  const texto = crudo();
  if (texto === null) return { hay: false, trato: null, palabras: null };

  const trato = buscar(texto, CLAVES_TRATO);
  const palabras = buscar(texto, CLAVES_PALABRAS);

  const valido = (cual, lista) => (cual && lista.some((e) => e.id === cual.valor) ? cual.valor : null);

  return {
    hay: true,
    trato: valido(trato, ESCALONES),
    palabras: valido(palabras, VOCABULARIOS),
  };
}

// Cambia una de las dos cosas dejando el resto del fichero como estaba. Si la
// clave ya está, se reescribe en su sitio; si no, entra en la cabecera, que es
// donde el resto de la interfaz ya lee (el nombre del arnés y el de la empresa
// viven ahí).
function escribir(claves, valor) {
  const ruta = rutaDelPerfil();
  const texto = crudo();
  if (!ruta || texto === null) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  let nuevo = texto;
  let puesta = false;

  for (const clave of claves) {
    const donde = `^(\\s*-?\\s*${clave}\\s*:\\s*)([^<\\n]*)`;
    // Mirar y escribir son dos pasos a propósito: si se mira comparando el
    // texto de antes y el de después, volver a elegir lo que ya estaba puesto
    // parecería que la clave no existe, y se escribiría una segunda debajo.
    if (!new RegExp(donde, 'mi').test(nuevo)) continue;
    nuevo = nuevo.replace(new RegExp(donde, 'gmi'), (_, delante) => `${delante}${valor}`);
    puesta = true;
  }

  if (!puesta) {
    const cabecera = nuevo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    nuevo = cabecera
      ? nuevo.replace(/^---\r?\n/, `---\n${claves[0]}: ${valor}\n`)
      : `---\n${claves[0]}: ${valor}\n---\n\n${nuevo}`;
  }

  try {
    fs.writeFileSync(ruta, nuevo);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo. Prueba con "Algo va mal".' };
  }
  return { ok: true };
}

function ponerTrato(cual) {
  if (!ESCALONES.some((e) => e.id === cual)) return { ok: false, mensaje: 'Eso no es una de las opciones.' };
  return escribir(CLAVES_TRATO, cual);
}

function ponerPalabras(cual) {
  if (!VOCABULARIOS.some((v) => v.id === cual)) return { ok: false, mensaje: 'Eso no es una de las opciones.' };
  return escribir(CLAVES_PALABRAS, cual);
}

// Lo que se le manda al panel: las opciones y cuál está puesta.
function comoEstamos() {
  const { hay, trato, palabras } = leer();
  return {
    hay,
    escalones: ESCALONES,
    vocabularios: VOCABULARIOS,
    // Sin perfil escrito, RSC da por hecho lo más acompañado. Se enseña eso
    // mismo: no se inventa nada, es lo que va a pasar de verdad.
    trato: trato || 'L3',
    palabras: palabras || 'non-technical',
    // Para decirlo en pantalla cuando aún nadie lo ha elegido.
    elegido: Boolean(trato),
  };
}

module.exports = { comoEstamos, ponerTrato, ponerPalabras, ESCALONES, VOCABULARIOS };
