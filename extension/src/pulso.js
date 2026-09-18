// Cuatro datos de hoy, en una línea y en letra pequeña.
//
// ── Qué sustituye ────────────────────────────────────────────────────────
//
// Arriba de la barra había una tarjeta que contaba dónde estabas y qué hiciste
// lo último. Ocupaba lo más alto de la pantalla para decir cosas como «Tus
// programas (Odoo) · M 01 tools», que además de ocupar no significaba nada.
//
// Y sobraba por otro motivo: `orient`, la habilidad que RSC trae siempre
// puesta, ES esa brújula, y vive en la conversación, donde encima puede
// contestar preguntas. La barra no tiene que competir con ella contando lo
// mismo peor.
//
// Lo que la barra sí puede decir mejor que nadie es el **estado**: cuántas
// copias llevas hoy, si tienes cambios sin guardar, cuántos documentos
// esperan. Eso no es narración, son números, y caben en una línea.
//
// Si no hay nada que contar no se escribe nada. Una línea que pone "0 copias ·
// 0 documentos" es peor que no tener línea.

const cerebro = require('./cerebro');
const copias = require('./guardar');
const diario = require('./diario');

const hoy = () => new Date().toISOString().slice(0, 10);

const esDeHoy = (cuando) => typeof cuando === 'string' && cuando.slice(0, 10) === hoy();

async function deHoy() {
  const datos = [];

  try {
    const anotadas = diario.sesiones(10).filter((s) => esDeHoy(s.fecha)).length;
    if (anotadas) datos.push(anotadas === 1 ? '1 cosa anotada hoy' : `${anotadas} cosas anotadas hoy`);
  } catch { /* el diario es un extra */ }

  try {
    const guardadas = (await copias.copias(20)).filter((c) => esDeHoy(c.cuando)).length;
    if (guardadas) datos.push(guardadas === 1 ? '1 copia hoy' : `${guardadas} copias hoy`);
  } catch { /* sin git, sin copias */ }

  try {
    if (await copias.cambiosSinGuardar()) datos.push('cambios sin guardar');
  } catch { /* idem */ }

  try {
    const esperando = cerebro.esperandoLectura();
    if (esperando) datos.push(esperando === 1 ? '1 documento sin leer' : `${esperando} documentos sin leer`);
  } catch { /* idem */ }

  return datos;
}

module.exports = { deHoy };
