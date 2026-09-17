#!/usr/bin/env node
// Comprueba que ningún texto de la pantalla usa una palabra prohibida.
//
//   node docs/comprobar-diccionario.js
//
// La lista sale de diccionario.md, así que solo hay una fuente de la verdad.
// Se revisan los ficheros que pintan cosas para el alumno. Una línea que hable
// de cosas internas (el canal de salida, un identificador) se exime marcándola
// con:  // diccionario: interno

const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const REVISAR = ['extension/media/panel.js', 'extension/src'];
const EXENCION = 'diccionario: interno';

// ------------------------------------------------- la lista, de diccionario.md

function palabrasProhibidas() {
  const texto = fs.readFileSync(path.join(__dirname, 'diccionario.md'), 'utf8');
  const seccion = texto.split('## Palabras prohibidas')[1] || '';
  const parrafo = seccion.split('\n\n').find((p) => p.includes('·')) || '';
  return parrafo
    .split('·')
    .map((p) => p.replace(/[\n\r]/g, ' ').trim().toLowerCase())
    .filter((p) => p && p.length > 2);
}

// ------------------------------------------- qué cuenta como texto de pantalla

// Una cadena es prosa si tiene un espacio y alguna palabra funcional española.
// Así se dejan fuera identificadores, rutas y nombres de comandos.
const FUNCIONALES = /\b(el|la|los|las|un|una|tu|te|de|del|que|no|se|y|con|para|en|lo|ya|he|ha|si|al|es|su)\b/i;
const CADENAS = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;

function ficheros(entrada) {
  const completa = path.join(raiz, entrada);
  if (!fs.existsSync(completa)) return [];
  if (fs.statSync(completa).isFile()) return [completa];
  return fs.readdirSync(completa)
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(completa, f));
}

function revisar(fichero, prohibidas) {
  const fallos = [];

  fs.readFileSync(fichero, 'utf8').split('\n').forEach((linea, i) => {
    if (linea.includes(EXENCION)) return;
    // Los comentarios son para quien mantiene esto, no para el alumno.
    if (linea.trim().startsWith('//') || linea.trim().startsWith('*')) return;

    for (const coincidencia of linea.matchAll(CADENAS)) {
      const cadena = coincidencia[1] ?? coincidencia[2] ?? coincidencia[3] ?? '';
      if (!cadena.includes(' ') || !FUNCIONALES.test(cadena)) continue;

      for (const mala of prohibidas) {
        if (new RegExp(`\\b${mala.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(cadena)) {
          fallos.push({ fichero, linea: i + 1, mala, cadena: cadena.slice(0, 70) });
        }
      }
    }
  });

  return fallos;
}

// ------------------------------------------------------------------------ ir

const prohibidas = palabrasProhibidas();
const todos = REVISAR.flatMap(ficheros);
const fallos = todos.flatMap((f) => revisar(f, prohibidas));

console.log(`${prohibidas.length} palabras prohibidas · ${todos.length} ficheros revisados\n`);

if (!fallos.length) {
  console.log('Todo el texto de pantalla respeta el diccionario.');
  process.exit(0);
}

for (const f of fallos) {
  console.log(`${path.relative(raiz, f.fichero)}:${f.linea}  "${f.mala}"`);
  console.log(`   ${f.cadena}\n`);
}
console.log(`${fallos.length} ${fallos.length === 1 ? 'texto incumple' : 'textos incumplen'} el diccionario.`);
console.log('Cámbialo, o márcalo con "// diccionario: interno" si no lo ve el alumno.');
process.exit(1);
