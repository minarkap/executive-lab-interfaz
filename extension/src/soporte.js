// "Algo va mal".
//
// La regla del diccionario: nunca se le pide al alumno que copie algo rojo. Se
// recoge todo por detrás, se guarda en un fichero, y se le da un código de seis
// caracteres que pueda dictar por teléfono a su tutor.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const rsc = require('./rsc');
const git = require('./git');
const github = require('./github');
const terreno = require('./terreno');
const asistentes = require('./asistentes');
const donde = require('./donde');

// Sin O ni 0, sin I ni 1: el código se dicta en voz alta y por teléfono.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function codigoDeIncidencia() {
  let codigo = '';
  for (let i = 0; i < 6; i += 1) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

// Dónde se deja el informe escrito.
//
// Si hay arnés, dentro de él: es donde el tutor va a mirar. Si no lo hay
// —justo el caso en el que montar ha fallado— se deja FUERA del proyecto, en
// la carpeta de la extensión. Antes se creaba `02-DOCS/raw/incidencias/` de
// todas formas, y con eso el diagnóstico fabricaba media pieza del suelo que
// estaba diagnosticando: el informe siguiente ya decía que 02-DOCS existía.
function carpetaDeIncidencias(carpetaAparte) {
  const carpeta = proyecto.sueloDelArnes().conocimiento
    ? proyecto.ruta('02-DOCS', 'raw', 'incidencias')
    : (carpetaAparte ? path.join(carpetaAparte, 'incidencias') : null);
  if (!carpeta) return null;
  try {
    fs.mkdirSync(carpeta, { recursive: true });
    return carpeta;
  } catch {
    return null;
  }
}

// Revisa, intenta entender qué pasa y deja el informe escrito.
async function revisar({ lineas = [], carpetaAparte = null } = {}) {
  const codigo = codigoDeIncidencia();
  const suelo = proyecto.sueloDelArnes();

  const doctor = await rsc.revisar();
  const reparacion = await rsc.arreglarEnSeco();

  // Las tres cosas por las que alguien se atasca hoy, y que el informe no
  // decía: que no haya git (sin él no funciona nada), que no haya entrado en su
  // cuenta (y por eso no puede guardar fuera), y en qué estado está la carpeta
  // (un proyecto ya empezado no se comporta como una vacía). Quien lea esto por
  // teléfono tiene que verlas de un vistazo, no deducirlas.
  const [hayGit, cuenta, hay] = await Promise.all([git.hay(), github.estado(), terreno.queHay()]);

  // Con quién habla esta carpeta y si esa persona lo tiene puesto.
  //
  // Faltaba, y es la primera causa de "no me hace nada": un arnés montado para
  // un asistente que no está instalado deja todos los botones mudos. El tutor
  // lo deducía preguntando por teléfono; aquí lo tiene escrito.
  const conQuien = asistentes.comoEstamos();
  const comoEsta = (a) => `${a.instalado ? 'puesto' : 'NO está puesto'}${a.delArnes ? ', y es para el que se montó' : ''}${a.mandaTexto ? '' : ' · no admite que le escribamos: va por el portapapeles'}`;

  const informe = [
    `Incidencia ${codigo}`,
    `Fecha: ${new Date().toISOString()}`,
    `Sistema: ${process.platform} ${process.arch}`,
    `Catálogo: ${rsc.paquete()}`,
    '',
    'Piezas del ordenador:',
    `  git:                     ${hayGit ? 'sí' : 'NO — sin esto no funciona nada'}`, // diccionario: interno
    `  cuenta de GitHub:        ${cuenta.conectado ? `sí (${cuenta.usuario || 'sin nombre'})` : 'no ha entrado'}`, // diccionario: interno
    `  copia fuera apunta a:    ${cuenta.remoto ? cuenta.remoto.corto : '(ninguna todavía)'}`, // diccionario: interno
    '',
    `Estado de la carpeta: ${hay.tipo}`, // diccionario: interno
    ...(hay.tipo === 'empezada' ? [
      `  ya tenía ${hay.cuantos} cosas dentro${hay.parece ? ` · ${hay.parece}` : ''}`, // diccionario: interno
      `  historial propio: ${hay.conHistorial ? 'sí — no lo tocamos' : 'no'}`, // diccionario: interno
    ] : []),
    '',
    `Habla con: ${conQuien.ahora || '(ninguno)'}`, // diccionario: interno
    ...conQuien.cuales.map((a) => `  ${a.nombre.padEnd(8)} ${comoEsta(a)}`), // diccionario: interno
    `  habilidades en: ${donde.carpetaDeHabilidades() || '(ese asistente no tiene carpeta conocida)'}`, // diccionario: interno
    `  botones en:     ${donde.carpetaDeComandos() || '(ese asistente no tiene botones)'}`, // diccionario: interno
    `  ayudantes en:   ${donde.carpetaDeAgentes() || '(ese asistente no tiene ayudantes)'}`, // diccionario: interno
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
    '',
    // Lo que la barra se apuntó por dentro mientras pasaba lo que pasara.
    // Aquí es donde aparece el motivo real de un arranque fallido, que antes
    // se quedaba en el panel de salida y no llegaba nunca al tutor.
    '--- lo que fue pasando ---',
    lineas.length ? lineas.join('\n') : '(nada apuntado)',
  ].join('\n');

  const carpeta = carpetaDeIncidencias(carpetaAparte);
  const fichero = carpeta ? path.join(carpeta, `${codigo}.txt`) : null;
  if (fichero) fs.writeFileSync(fichero, informe);

  // Que el diagnóstico falle no es un problema del alumno: si no podemos
  // arreglarlo solos, lo que importa es que el tutor reciba el código.
  // Sin git no está sano por mucho que el doctor del arnés diga que sí: es la
  // pieza de la que cuelga todo lo demás.
  const sano = doctor.codigo === 0 && proyecto.arnesCompleto() && hayGit;
  const hayQueTocarAlgo = /repair|fix|missing|dangling/i.test(reparacion.salida || '');

  return { codigo, fichero, sano, hayQueTocarAlgo, faltaGit: !hayGit, informe };
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
