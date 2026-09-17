// "Guardar copia de seguridad" y "Volver a como estaba el martes".
//
// Por debajo es git. Por delante, la palabra commit no aparece nunca: el
// diccionario (docs/diccionario.md) la tiene en la lista de prohibidas.

const { git } = require('./procesos');

function fechaLarga(cuando = new Date()) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeStyle: 'short' }).format(cuando);
}

// Cuánto hace, en palabras y por días de calendario: a las 00:10, lo de las
// 23:50 es "ayer", no "hoy". El "el martes" del nombre del botón sale de aquí.
function haceCuanto(iso) {
  const entonces = new Date(iso);
  const dia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((dia(new Date()) - dia(entonces)) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `el ${new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(entonces)}`;
  return `el ${new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(entonces)}`;
}

const NO_PUEDO = 'No puedo guardar copias en este ordenador. Pulsa "Algo va mal".';

// git se niega a guardar sin saber quién eres. En el ordenador de un alumno
// nadie lo ha configurado nunca, así que se pone una identidad local y ya.
async function asegurarIdentidad() {
  const nombre = await git('config', 'user.name');
  if (nombre.codigo === 0 && nombre.salida.trim()) return;
  await git('config', 'user.name', 'Executive Lab');
  await git('config', 'user.email', 'alumno@executivelab.local');
}

async function guardar(mensaje) {
  const cambios = await git('status', '--porcelain');
  if (cambios.codigo !== 0) return { ok: false, mensaje: NO_PUEDO };
  if (!cambios.salida.trim()) {
    return { ok: true, sinCambios: true, mensaje: 'No ha cambiado nada desde la última copia. No hace falta guardar.' };
  }

  await asegurarIdentidad();
  await git('add', '-A');
  const hecho = await git('commit', '-q', '-m', mensaje || `Copia de seguridad — ${fechaLarga()}`);
  if (hecho.codigo !== 0) return { ok: false, mensaje: 'No he podido guardar la copia. Prueba con "Algo va mal".' };

  const cuantos = cambios.salida.trim().split('\n').length;
  return {
    ok: true,
    mensaje: cuantos === 1 ? 'Copia guardada. Había un cambio.' : `Copia guardada. Había ${cuantos} cambios.`,
  };
}

async function copias(cuantas = 10) {
  // %x09 es un tabulador: separador seguro porque nuestros textos no lo llevan.
  const { codigo, salida } = await git('log', `-n${cuantas}`, '--pretty=format:%H%x09%cI%x09%s');
  if (codigo !== 0 || !salida.trim()) return [];

  return salida.trim().split('\n').map((linea) => {
    const [id, cuando, asunto] = linea.split('\t');
    return { id, cuando, asunto, etiqueta: `Como estaba ${haceCuanto(cuando)}` };
  });
}

// Deja la carpeta exactamente como estaba en esa copia — también quita lo que
// se creó después — sin destruir nada: antes se guarda lo de ahora, y la
// vuelta atrás queda registrada como una copia más, así que también se puede
// deshacer.
async function volverA(id) {
  if (!/^[0-9a-f]{7,64}$/i.test(id)) return { ok: false, mensaje: 'Esa copia no existe.' };

  const previa = await guardar(`Copia de seguridad antes de volver atrás — ${fechaLarga()}`);
  if (!previa.ok) return previa;

  const cuando = await git('show', '-s', '--format=%cI', id);
  const movido = await git('read-tree', '-m', '-u', '--reset', id);
  if (movido.codigo !== 0) return { ok: false, mensaje: 'No he podido volver atrás. Prueba con "Algo va mal".' };

  await asegurarIdentidad();
  const etiqueta = cuando.codigo === 0 ? haceCuanto(cuando.salida.trim()) : 'entonces';
  await git('commit', '-q', '--allow-empty', '-m', `Vuelta a como estaba ${etiqueta}`);

  return { ok: true, mensaje: 'Listo. Tu empresa ha vuelto a como estaba entonces.' };
}

module.exports = { guardar, copias, volverA, fechaLarga, haceCuanto };
