// "Qué quieres hacer": los botones que la barra descubre, no los que trae.
//
// Un botón por comando del asistente para el que se montó el arnés, cuyo
// frontmatter lleve
// `boton:`. Nada está predefinido a propósito: el arnés de una gestoría no se
// parece al de una empresa de contratos, así que los botones los va creando
// Claude conforme el alumno repite tareas (la habilidad `executive-lab` le
// dice cuándo y cómo). Los comandos internos de RSC —checkpoint, learn,
// resume-session, save-session— no llevan `boton:` y por eso no salen.

const fs = require('node:fs');
const path = require('node:path');
const donde = require('./donde');
const frontmatter = require('./frontmatter');

// Orden: primero lo que el alumno hace a diario, luego lo que aprendió a
// hacer. Dentro de cada grupo, por orden alfabético de etiqueta.
const ORDEN_DE_GRUPOS = ['diario', 'aprendido'];

function acciones() {
  // Cada asistente los guarda en su sitio, y Codex no los guarda en ninguno:
  // RSC no le escribe comandos. Leer la carpeta de Claude en un arnés de Codex
  // daría cero botones sin decir por qué.
  const carpeta = donde.carpetaDeComandos();
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  const encontradas = [];
  for (const fichero of fs.readdirSync(carpeta)) {
    if (!fichero.endsWith('.md')) continue;

    const campos = frontmatter.leer(path.join(carpeta, fichero));
    const etiqueta = typeof campos.boton === 'string' ? campos.boton.trim() : '';
    if (!etiqueta) continue;

    const nombre = fichero.replace(/\.md$/, '');
    encontradas.push({
      nombre,
      etiqueta,
      icono: typeof campos.icono === 'string' ? campos.icono : '▸',
      grupo: ORDEN_DE_GRUPOS.includes(campos.grupo) ? campos.grupo : 'aprendido',
      prompt: `/${nombre}`,
    });
  }

  return encontradas.sort((a, b) => {
    const ga = ORDEN_DE_GRUPOS.indexOf(a.grupo);
    const gb = ORDEN_DE_GRUPOS.indexOf(b.grupo);
    return ga - gb || a.etiqueta.localeCompare(b.etiqueta, 'es');
  });
}

// ── Todos los comandos, no solo los que llevan botón ────────────────────
//
// Jose: *«se deben detectar todas las skills del proyecto, y todos los comandos
// y agentes»*. `acciones()` solo devuelve los que alguien marcó con `boton:`,
// que son los que salen arriba. Pero hay más, y hasta ahora no se veían:
//
//   · Los que el asistente ha escrito y nadie ha marcado todavía.
//   · Los que trae RSC de serie — `checkpoint`, `learn`, `resume-session`,
//     `save-session` — que se pueden usar igual.
//
// Los de RSC se marcan como suyos para poder ponerlos aparte: no los escribió
// nadie de esta empresa y no se explican igual.
// Los que trae el arnés, dichos en cristiano. Salen en crudo —«Resume
// session»— y así no significan nada: son cuatro y se sabe cuáles son, así que
// se nombran a mano. Lo que no esté aquí se humaniza y punto.
const LOS_DE_RSC = {
  'resume-session': { etiqueta: 'Seguir donde lo dejé', queHace: 'Retoma lo que estabais haciendo la última vez.' },
  'save-session': { etiqueta: 'Guardar dónde vamos', queHace: 'Deja apuntado en qué punto estáis, para poder retomarlo.' },
  learn: { etiqueta: 'Que aprenda algo de ti', queHace: 'Guarda una cosa sobre cómo trabajas, si tú la apruebas.' },
  checkpoint: { etiqueta: 'Congelar esto para revisarlo', queHace: 'Deja lo hecho a la espera de que alguien lo dé por bueno.' },
};

function humanizar(nombre) {
  const limpio = nombre.replace(/[-_]+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function todos() {
  const carpeta = donde.carpetaDeComandos();
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  const encontrados = [];
  for (const fichero of fs.readdirSync(carpeta)) {
    if (!fichero.endsWith('.md')) continue;

    const nombre = fichero.replace(/\.md$/, '');
    const campos = frontmatter.leer(path.join(carpeta, fichero));
    const etiqueta = typeof campos.boton === 'string' ? campos.boton.trim() : '';
    const delArnes = LOS_DE_RSC[nombre];

    // La descripción de un comando está escrita para el asistente y en inglés
    // los del arnés. Media barra en cristiano y una línea en inglés queda peor
    // que no decir nada.
    const suya = typeof campos.description === 'string' ? campos.description.replace(/^["']|["']$/g, '').trim() : '';
    const enEspanol = /\b(el|la|los|las|un|una|de|del|que|para|con|por|tu|tus)\b/i.test(suya);

    encontrados.push({
      nombre,
      etiqueta: (delArnes && delArnes.etiqueta) || etiqueta || humanizar(nombre),
      queHace: (delArnes && delArnes.queHace) || (enEspanol ? suya : ''),
      icono: typeof campos.icono === 'string' ? campos.icono : '▸',
      esBoton: Boolean(etiqueta),
      delArnes: Boolean(delArnes),
      prompt: `/${nombre}`,
    });
  }

  // Primero los que ya son botón, después los tuyos sin marcar, y al final los
  // que trae el arnés.
  const ordenados = encontrados.sort((a, b) => Number(b.esBoton) - Number(a.esBoton)
    || Number(a.delArnes) - Number(b.delArnes)
    || a.etiqueta.localeCompare(b.etiqueta, 'es'));

  // ── Y ninguno repetido ─────────────────────────────────────────────────
  //
  // Se vio el primer día de un arnés nuevo: «Seguir donde lo dejé» salía dos
  // veces. Arriba el nuestro —el raíl `seguir.md`, con su `boton:`— y abajo el
  // `resume-session` del arnés, al que aquí se le pone ese mismo nombre en
  // cristiano. Hacen lo mismo, así que el alumno veía dos botones idénticos sin
  // forma de saber cuál pulsar.
  //
  // Manda el de arriba: el nuestro está escrito para él, en su idioma, y el
  // orden ya lo pone delante. Se compara por el rótulo porque es lo que ve, no
  // por el nombre del fichero, que no ve nunca.
  const vistos = new Set();
  return ordenados.filter((uno) => {
    const rotulo = uno.etiqueta.toLowerCase();
    if (vistos.has(rotulo)) return false;
    vistos.add(rotulo);
    return true;
  });
}

module.exports = { acciones, todos };
