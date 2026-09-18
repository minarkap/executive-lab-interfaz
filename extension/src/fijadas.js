// Acciones rápidas: las cinco cosas que esa persona quiere tener a mano.
//
// ── Cómo se llegó aquí ───────────────────────────────────────────────────
//
// Lo más alto de la barra lo ocupaban las consultas de cada programa,
// desplegadas. Jose: *«no son ni comandos, ni skills, ni acciones… creo que
// casi que molestan»*. Y tenía razón: son los scripts que RSC mete dentro de
// cada herramienta, así que su sitio es la herramienta.
//
// Pero el hueco que dejaban es el mejor de la pantalla, y ahí va lo que esa
// persona use de verdad — que no lo sabemos nosotros. Así que lo elige ella:
// hasta cinco, de entre todo lo que esta carpeta sepa hacer.
//
// ── De dónde salen los candidatos ────────────────────────────────────────
//
// De los tres sitios donde hay algo que hacer, sin inventar ninguno:
//
//   · los **botones** que el asistente ha ido creando (`.claude/commands/`),
//   · las **habilidades** que el arnés tiene puestas,
//   · las **consultas** de cada programa (`01-TOOLS/<lo que sea>/`).
//
// Se guarda por carpeta y no en el arnés: es de esta persona y de esta máquina,
// no una decisión del proyecto que deba viajar en las copias.

const acciones = require('./acciones');
const conexiones = require('./conexiones');
const saberes = require('./saberes');

const CLAVE = 'executiveLab.fijadas';

// Cinco. Con más deja de ser "lo de siempre" y vuelve a ser una lista que hay
// que leer, que es justo lo que se venía a quitar.
const TOPE = 5;

// Un identificador estable por cosa. Tiene que sobrevivir a que se reordene la
// lista o se instale algo nuevo, o lo fijado se despegaría solo.
const idDeComando = (a) => `boton:${a.nombre}`;
const idDeHabilidad = (h) => `habilidad:${h.id}`;
const idDeConsulta = (p, s) => `consulta:${p.id}:${s.fichero}`;

// Todo lo que se puede fijar hoy en esta carpeta, agrupado por de dónde sale.
function candidatos(carpetaDeLaExtension) {
  const botones = acciones.acciones().map((a) => ({
    id: idDeComando(a),
    etiqueta: a.etiqueta,
    icono: a.icono || '▸',
    pista: '',
    accion: { tipo: 'pedir', prompt: a.prompt },
  }));

  const habilidades = saberes.queSabe(carpetaDeLaExtension).sabe.map((h) => ({
    id: idDeHabilidad(h),
    etiqueta: h.nombre.charAt(0).toUpperCase() + h.nombre.slice(1),
    icono: '✨',
    pista: h.frase,
    accion: { tipo: 'pedir', prompt: `Quiero ${h.frase ? h.frase.charAt(0).toLowerCase() + h.frase.slice(1) : h.nombre}. Pregúntame lo que necesites.` },
  }));

  const consultas = conexiones.loQueSePuedeMirar().flatMap((p) => p.scripts.map((s) => ({
    id: idDeConsulta(p, s),
    etiqueta: `${s.etiqueta} · ${p.etiqueta}`,
    icono: '▸',
    pista: s.queHace || '',
    accion: {
      tipo: 'hacerCosita', proveedor: p.id, fichero: s.fichero, etiqueta: s.etiqueta, pideDatos: false,
    },
  })));

  return [
    { titulo: 'Tus botones (comandos)', cosas: botones },
    { titulo: 'Consultas de tus conexiones', cosas: consultas },
    { titulo: 'Habilidades (skills)', cosas: habilidades },
  ].filter((g) => g.cosas.length);
}

const todos = (carpetaDeLaExtension) => candidatos(carpetaDeLaExtension).flatMap((g) => g.cosas);

// Lo fijado, resuelto contra lo que existe ahora mismo. Si algo se desinstaló o
// el asistente borró un botón, deja de salir en vez de dar un error al pulsarlo.
function puestas(almacen, carpetaDeLaExtension) {
  const guardadas = almacen.get(CLAVE);
  const hay = todos(carpetaDeLaExtension);

  // Sin elegir nada, los botones que el asistente ha creado: es lo que hacía la
  // barra antes de que esto existiera, y es un default que se entiende.
  if (!Array.isArray(guardadas)) {
    return hay.filter((c) => c.id.startsWith('boton:')).slice(0, TOPE);
  }

  return guardadas
    .map((id) => hay.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, TOPE);
}

// Qué ids están fijados de verdad, para pintar la estrella. Sin nada elegido no
// hay ninguno marcado: lo que sale arriba es un default, no una elección.
const elegidas = (almacen) => {
  const guardadas = almacen.get(CLAVE);
  return Array.isArray(guardadas) ? guardadas : [];
};

async function fijar(almacen, id, carpetaDeLaExtension) {
  const hay = todos(carpetaDeLaExtension);
  if (!hay.some((c) => c.id === id)) return { ok: false, mensaje: 'Eso ya no está.' };

  const antes = elegidas(almacen);
  if (antes.includes(id)) return { ok: true };
  if (antes.length >= TOPE) {
    return { ok: false, mensaje: `Solo caben ${TOPE}. Quita una y vuelve a probar.` };
  }

  await almacen.update(CLAVE, [...antes, id]);
  return { ok: true };
}

async function soltar(almacen, id) {
  await almacen.update(CLAVE, elegidas(almacen).filter((x) => x !== id));
  return { ok: true };
}

module.exports = { candidatos, puestas, elegidas, fijar, soltar, TOPE, CLAVE };
