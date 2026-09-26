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

// Los nombres propios de programas se quedan: «React, Docker, Stripe, Node.js:
// son nombres, no jerga, como git y GitHub» (docs/decisiones.md). Choca uno
// solo con la lista: «Node.js» es un nombre, y «node» a secas, la orden.
const NOMBRES_PROPIOS = [/\bnode\.js\b/gi];

// Las tablas que la barra lee y pinta tal cual (H2). Son lo que más se ve —el
// nombre y lo que hace cada habilidad, comando o ayudante, y el catálogo que se
// ofrece— y no pasaban por aquí. De cada una, solo los campos que salen en
// pantalla: los ids, las palabras de búsqueda y la lista de fontanería, no. Las
// claves que empiezan por «_» son notas para quien las mantiene.
const TABLAS = [
  { fichero: 'extension/media/nombres.json', campos: ['nombre', 'queHace'], listas: ['lenguajes'] },
  { fichero: 'extension/media/capacidades.json', campos: ['nombre', 'frase'], listas: [] },
];

// Lo que enseñan los instaladores (H2): los pasos que corre `instalar.js` y que
// la ventana de Mac va pintando, esa ventana, y el asistente de Windows. Se
// leen y no se tocan, que van firmados. De `instalar.js` se deja fuera lo que
// va al registro (`anotar`): es el informe para el tutor, no la pantalla.
const INSTALADORES = [
  { fichero: 'instalador/mac/instalar.js', como: 'js', saltar: /\banotar\(/ },
  { fichero: 'instalador/mac/instalar.applescript', como: 'applescript' },
  { fichero: 'instalador/windows/ExecutiveLab.iss', como: 'inno' },
];

// ------------------------------------------------- la lista, de diccionario.md

function palabrasProhibidas(base = raiz) {
  const texto = fs.readFileSync(path.join(base, 'docs', 'diccionario.md'), 'utf8');
  const seccion = texto.split('## Palabras prohibidas')[1] || '';
  const parrafo = seccion.split('\n\n').find((p) => p.includes('·')) || '';
  return parrafo
    .split('·')
    .map((p) => p.replace(/[\n\r]/g, ' ').trim().toLowerCase())
    .filter((p) => p && p.length > 2);
}

// Las de la lista que salen en un texto. Una sola manera de mirarlo, para el
// código, los rótulos, las tablas y los instaladores.
function lasQueSalen(texto, prohibidas) {
  const limpio = NOMBRES_PROPIOS.reduce((t, nombre) => t.replace(nombre, ' '), texto);
  return prohibidas.filter((mala) => new RegExp(`\\b${mala.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(limpio));
}

// La primera palabra prohibida de un texto, o null. La usan las pruebas de la
// barra, para no tener otra lista que se separe de esta (H2).
function tieneUnaProhibida(texto, prohibidas = palabrasProhibidas()) {
  return lasQueSalen(texto, prohibidas)[0] || null;
}

// ------------------------------------------- qué cuenta como texto de pantalla

// Una cadena es prosa si tiene un espacio y alguna palabra funcional española.
// Así se dejan fuera identificadores, rutas y nombres de comandos.
const FUNCIONALES = /\b(el|la|los|las|un|una|tu|te|de|del|que|no|se|y|con|para|en|lo|ya|he|ha|si|al|es|su)\b/i;
const CADENAS = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;

function ficheros(base, entrada) {
  const completa = path.join(base, entrada);
  if (!fs.existsSync(completa)) return [];
  if (fs.statSync(completa).isFile()) return [completa];
  return fs.readdirSync(completa)
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(completa, f));
}

const esProsa = (cadena) => cadena.includes(' ') && FUNCIONALES.test(cadena);

function revisar(fichero, prohibidas, { saltar = null, comentario = null } = {}) {
  const fallos = [];

  fs.readFileSync(fichero, 'utf8').split('\n').forEach((linea, i) => {
    if (linea.includes(EXENCION)) return;
    // Los comentarios son para quien mantiene esto, no para el alumno.
    if (linea.trim().startsWith('//') || linea.trim().startsWith('*')) return;
    if (comentario && comentario.test(linea)) return;
    if (saltar && saltar.test(linea)) return;

    for (const coincidencia of linea.matchAll(CADENAS)) {
      const cadena = coincidencia[1] ?? coincidencia[2] ?? coincidencia[3] ?? '';
      if (!esProsa(cadena)) continue;

      for (const mala of lasQueSalen(cadena, prohibidas)) {
        fallos.push({ fichero, linea: i + 1, mala, cadena: cadena.slice(0, 70) });
      }
    }
  });

  return fallos;
}

// Las cadenas de un AppleScript, con la línea donde empiezan. Se lee entero y
// no por líneas porque un diálogo ocupa varias, y lo que está entre comillas
// en un comentario (`--`, `#` o `(* … *)`) no cuenta.
function cadenasDeAppleScript(texto) {
  const cadenas = [];
  let linea = 1;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '\n') { linea++; continue; }
    if (c === '"') {
      const desde = linea;
      let valor = '';
      for (i++; i < texto.length && texto[i] !== '"'; i++) {
        if (texto[i] === '\\') i++;
        if (texto[i] === '\n') linea++;
        valor += texto[i] || '';
      }
      cadenas.push({ linea: desde, cadena: valor });
    } else if ((c === '-' && texto[i + 1] === '-') || c === '#') {
      while (i + 1 < texto.length && texto[i + 1] !== '\n') i++;
    } else if (c === '(' && texto[i + 1] === '*') {
      const fin = texto.indexOf('*)', i + 2);
      const hasta = fin < 0 ? texto.length : fin + 2;
      linea += (texto.slice(i, hasta).match(/\n/g) || []).length;
      i = hasta - 1;
    }
  }
  return cadenas;
}

// El asistente de Windows. En `[Messages]` y `[CustomMessages]` cada línea es
// `Clave=Texto`, sin comillas, y todo es pantalla; en lo demás, lo que va
// entre comillas y parece una frase. `;` abre un comentario de Inno.
function revisarInno(fichero, prohibidas) {
  const fallos = [];
  let seccion = '';
  fs.readFileSync(fichero, 'utf8').split('\n').forEach((linea, i) => {
    const limpia = linea.trim();
    const cabecera = limpia.match(/^\[([A-Za-z]+)\]$/);
    if (cabecera) { seccion = cabecera[1].toLowerCase(); return; }
    if (!/^(messages|custommessages)$/.test(seccion) || limpia.startsWith(';')) return;
    const texto = (limpia.match(/^[^=]+=(.*)$/) || [])[1];
    if (!texto) return;
    for (const mala of lasQueSalen(texto, prohibidas)) {
      fallos.push({ fichero, linea: i + 1, mala, cadena: texto.slice(0, 70) });
    }
  });
  return [...fallos, ...revisar(fichero, prohibidas, { comentario: /^\s*;/ })];
}

function revisarInstalador(base, { fichero, como, saltar }, prohibidas) {
  const completo = path.join(base, fichero);
  if (!fs.existsSync(completo)) return [];
  if (como === 'inno') return revisarInno(completo, prohibidas);
  if (como === 'js') return revisar(completo, prohibidas, { saltar });
  return cadenasDeAppleScript(fs.readFileSync(completo, 'utf8'))
    .filter(({ cadena }) => esProsa(cadena))
    .flatMap(({ linea, cadena }) => lasQueSalen(cadena, prohibidas)
      .map((mala) => ({ fichero: completo, linea, mala, cadena: cadena.replace(/\s+/g, ' ').slice(0, 70) })));
}

// Los textos de una tabla, cada uno con dónde vive: los campos que se pintan y,
// en `listas`, los valores de esa lista (los nombres de los lenguajes).
function textosDeUnaTabla(valor, { campos, listas }, donde = '') {
  if (Array.isArray(valor)) {
    return valor.flatMap((v, i) => textosDeUnaTabla(v, { campos, listas }, `${donde}[${(v && v.id) || i}]`));
  }
  if (!valor || typeof valor !== 'object') return [];
  return Object.entries(valor).flatMap(([clave, v]) => {
    if (clave.startsWith('_')) return [];
    const aqui = donde ? `${donde}.${clave}` : clave;
    if (listas.includes(clave) && v && typeof v === 'object') {
      return Object.entries(v).filter(([, x]) => typeof x === 'string').map(([k, x]) => ({ donde: `${aqui}.${k}`, texto: x }));
    }
    if (typeof v === 'string') return campos.includes(clave) ? [{ donde: aqui, texto: v }] : [];
    return textosDeUnaTabla(v, { campos, listas }, aqui);
  });
}

function rotulosDeUnaTabla(base, tabla) {
  const completo = path.join(base, tabla.fichero);
  if (!fs.existsSync(completo)) return [];
  return textosDeUnaTabla(JSON.parse(fs.readFileSync(completo, 'utf8')), tabla);
}

// ------------------------------------------------------------------------ ir

// Los rótulos de los raíles. Cada comando que enviamos trae un `boton:`, y ese
// rótulo se convierte en un botón de la barra tal cual: es texto de pantalla
// como el que más, y estaba fuera. Los que escriba el asistente en la carpeta
// del alumno no se pueden comprobar aquí —son de después—, pero de esos se
// encarga la habilidad `texto-de-la-barra`. De los nuestros, nadie.
function rotulosDeLosRailes(base = raiz) {
  const carpeta = path.join(base, 'skills', 'comandos');
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
function rotulosDelManifiesto(base = raiz) {
  const fichero = path.join(base, 'extension', 'package.json');
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
  return rotulos.flatMap(({ donde, texto }) => lasQueSalen(texto, prohibidas)
    .map((mala) => ({ fichero, linea: donde, mala, cadena: texto.slice(0, 70) })));
}

// Todo lo que sale en pantalla, en un árbol cualquiera: el proyecto, o una copia
// donde una prueba ha sembrado palabras. Los ficheros van relativos a `base`.
function revisarLoDe(base = raiz) {
  const prohibidas = palabrasProhibidas(base);
  const codigo = REVISAR.flatMap((entrada) => ficheros(base, entrada));
  const instaladores = INSTALADORES.filter((i) => fs.existsSync(path.join(base, i.fichero)));
  const tablas = TABLAS.filter((t) => fs.existsSync(path.join(base, t.fichero)));
  const delManifiesto = rotulosDelManifiesto(base);
  const deLosRailes = rotulosDeLosRailes(base);
  const deLasTablas = tablas.map((tabla) => ({ tabla, rotulos: rotulosDeUnaTabla(base, tabla) }));
  const fallos = [
    ...codigo.flatMap((f) => revisar(f, prohibidas)),
    ...revisarRotulos(delManifiesto, path.join(base, 'extension', 'package.json'), prohibidas),
    ...revisarRotulos(deLosRailes, path.join(base, 'skills', 'comandos'), prohibidas),
    ...deLasTablas.flatMap(({ tabla, rotulos }) => revisarRotulos(rotulos, path.join(base, tabla.fichero), prohibidas)),
    ...instaladores.flatMap((instalador) => revisarInstalador(base, instalador, prohibidas)),
  ].map((fallo) => ({ ...fallo, fichero: path.relative(base, fallo.fichero).split(path.sep).join('/') }));
  const rotulos = delManifiesto.length + deLosRailes.length + deLasTablas.reduce((n, { rotulos: r }) => n + r.length, 0);
  return { prohibidas, ficheros: codigo.length + instaladores.length + tablas.length, rotulos, fallos };
}

const revisarTodo = (base = raiz) => revisarLoDe(base).fallos;

// Como guion, revisa y sale con 0 o 1. Como módulo, da la lista y la revisión
// entera: las usan las pruebas de la barra, para no tener dos listas que se
// separen (H2).
if (require.main === module) {
  const { prohibidas, ficheros: cuantos, rotulos, fallos } = revisarLoDe();

  console.log(`${prohibidas.length} palabras prohibidas · ${cuantos} ficheros y ${rotulos} rótulos revisados\n`);

  if (!fallos.length) {
    console.log('Todo el texto de pantalla respeta el diccionario.');
    process.exit(0);
  }

  for (const f of fallos) {
    console.log(`${f.fichero}:${f.linea}  "${f.mala}"`);
    console.log(`   ${f.cadena}\n`);
  }
  console.log(`${fallos.length} ${fallos.length === 1 ? 'texto incumple' : 'textos incumplen'} el diccionario.`);
  console.log('Cámbialo, o márcalo con "// diccionario: interno" si no lo ve el alumno.');
  process.exit(1);
}

module.exports = { palabrasProhibidas, tieneUnaProhibida, revisarTodo };
