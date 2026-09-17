// "Algo va mal".
//
// La regla del diccionario: nunca se le pide al alumno que copie algo rojo. Se
// recoge todo por detrás, se guarda en un fichero, y se le da un código de seis
// caracteres que pueda dictar por teléfono a su tutor.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const rsc = require('./rsc');

// Sin O ni 0, sin I ni 1: el código se dicta en voz alta y por teléfono.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function codigoDeIncidencia() {
  let codigo = '';
  for (let i = 0; i < 6; i += 1) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

function carpetaDeIncidencias() {
  const carpeta = proyecto.ruta('02-DOCS', 'raw', 'incidencias');
  if (carpeta) fs.mkdirSync(carpeta, { recursive: true });
  return carpeta;
}

// Revisa, intenta entender qué pasa y deja el informe escrito.
async function revisar() {
  const codigo = codigoDeIncidencia();
  const suelo = proyecto.sueloDelArnes();

  const doctor = await rsc.revisar();
  const reparacion = await rsc.arreglarEnSeco();

  const informe = [
    `Incidencia ${codigo}`,
    `Fecha: ${new Date().toISOString()}`,
    `Sistema: ${process.platform} ${process.arch}`,
    `Catálogo: ${rsc.paquete()}`,
    '',
    'Suelo del arnés:',
    `  declaración (.rsc.json): ${suelo.declaracion ? 'sí' : 'NO'}`, // diccionario: interno
    `  conexiones (01-TOOLS):   ${suelo.conexiones ? 'sí' : 'NO'}`,
    `  conocimiento (02-DOCS):  ${suelo.conocimiento ? 'sí' : 'NO'}`,
    '',
    '--- revisión ---',
    doctor.salida || '(sin salida)',
    doctor.error || '',
    '',
    '--- reparación en seco ---',
    reparacion.salida || '(sin salida)',
    reparacion.error || '',
  ].join('\n');

  const carpeta = carpetaDeIncidencias();
  const fichero = carpeta ? path.join(carpeta, `${codigo}.txt`) : null;
  if (fichero) fs.writeFileSync(fichero, informe);

  // Que el diagnóstico falle no es un problema del alumno: si no podemos
  // arreglarlo solos, lo que importa es que el tutor reciba el código.
  const sano = doctor.codigo === 0 && proyecto.arnesCompleto();
  const hayQueTocarAlgo = /repair|fix|missing|dangling/i.test(reparacion.salida || '');

  return { codigo, fichero, sano, hayQueTocarAlgo, informe };
}

// Solo se llama cuando el alumno ha dicho que sí. `rsc repair` guarda una copia
// recuperable por su cuenta y no toca lo que el alumno haya escrito a mano.
async function arreglar() {
  const { codigo, salida, error } = await rsc.arreglar();
  return codigo === 0
    ? { ok: true, mensaje: 'Arreglado. Vuelve a probar lo que estabas haciendo.' }
    : { ok: false, mensaje: 'No he podido arreglarlo yo solo.', detalle: error || salida };
}

module.exports = { revisar, arreglar, codigoDeIncidencia };
