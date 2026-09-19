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

// El manifiesto también pinta cosas para el alumno y estaba fuera: los títulos
// de comando salen en la paleta del editor y los rótulos de los ajustes, en su
// pantalla. Así se coló «Qué comandos de Claude hay disponibles» en un producto
// que también habla con Codex, y un «VS Code» que el diccionario prohíbe.
//
// Se miran esos campos y no el fichero entero: los `scripts` son órdenes de
// construcción que no ve nadie, y en JSON no se puede marcar una línea como
// interna. Lo de la tienda —`displayName` y `description`— se deja fuera a
// propósito: es texto para quien decide instalar, no para quien ya está dentro,
// y esa es una decisión de Jose, no de este comprobador.
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

// Los rótulos de los raíles. Cada comando que enviamos trae un `boton:`, y ese
// rótulo se convierte en un botón de la barra tal cual: es texto de pantalla
// como el que más, y estaba fuera. Los que escriba el asistente en la carpeta
// del alumno no se pueden comprobar aquí —son de después—, pero de esos se
// encarga la habilidad `texto-de-la-barra`. De los nuestros, nadie.
function rotulosDeLosRailes() {
  const carpeta = path.join(raiz, 'skills', 'comandos');
  if (!fs.existsSync(carpeta)) return [];

  return fs.readdirSync(carpeta).filter((f) => f.endsWith('.md')).flatMap((fichero) => {
    const texto = fs.readFileSync(path.join(carpeta, fichero), 'utf8');
    const cabecera = (texto.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    return ['boton', 'description']
      .map((clave) => (cabecera.match(new RegExp(`^${clave}:\\s*(.+)$`, 'm')) || [])[1])
      .filter(Boolean)
      .map((valor) => ({ donde: fichero, texto: valor.trim().replace(/^["']|["']$/g, '') }));
  });
}

// Los rótulos del manifiesto, cada uno con dónde vive, para poder señalarlo.
function rotulosDelManifiesto() {
  const fichero = path.join(raiz, 'extension', 'package.json');
  if (!fs.existsSync(fichero)) return [];

  const manifiesto = JSON.parse(fs.readFileSync(fichero, 'utf8'));
  const aporta = manifiesto.contributes || {};
  const rotulos = [];

  for (const orden of aporta.commands || []) {
    if (orden.title) rotulos.push({ donde: orden.command, texto: orden.title });
  }
  for (const [clave, ajuste] of Object.entries((aporta.configuration || {}).properties || {})) {
    if (ajuste.description) rotulos.push({ donde: clave, texto: ajuste.description });
    for (const suya of ajuste.enumDescriptions || []) rotulos.push({ donde: clave, texto: suya });
  }
  return rotulos;
}

function revisarRotulos(rotulos, fichero, prohibidas) {
  return rotulos.flatMap(({ donde, texto }) => prohibidas
    .filter((mala) => new RegExp(`\\b${mala.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(texto))
    .map((mala) => ({ fichero, linea: donde, mala, cadena: texto.slice(0, 70) })));
}

const prohibidas = palabrasProhibidas();
const todos = REVISAR.flatMap(ficheros);
const delManifiesto = rotulosDelManifiesto();
const deLosRailes = rotulosDeLosRailes();
const fallos = [
  ...todos.flatMap((f) => revisar(f, prohibidas)),
  ...revisarRotulos(delManifiesto, 'extension/package.json', prohibidas),
  ...revisarRotulos(deLosRailes, 'skills/comandos', prohibidas),
];

console.log(`${prohibidas.length} palabras prohibidas · ${todos.length} ficheros y ${delManifiesto.length + deLosRailes.length} rótulos revisados\n`);

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
