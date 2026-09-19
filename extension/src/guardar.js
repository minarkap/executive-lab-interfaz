// "Guardar copia de seguridad" y "Volver a como estaba el martes".
//
// Por debajo es git. Por delante, la palabra commit no aparece nunca: el
// diccionario (docs/diccionario.md) la tiene en la lista de prohibidas.
//
// El trabajo sucio lo hace instalador/comun/historial.js, que es el mismo
// módulo que usa el instalador al montar la carpeta. Aquí solo queda lo que
// esto tiene de propio: las palabras.
//
// Y lo hace con el git del sistema, que es obligatorio y está instalado
// (instalador/comun/git.js dice por qué). Durante un tiempo lo hizo una
// biblioteca de JavaScript que viajaba dentro, para un Mac sin las
// herramientas de Xcode; esa biblioteca sigue ahí de resto, pero ya no es el
// camino.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const entorno = require('./entorno');
const git = require('./git');
const github = require('./github');
const conexiones = require('./conexiones');

// Se busca una vez y se recuerda, aunque no esté: si no hay módulo no lo va a
// haber más tarde, y no tiene sentido tocar el disco en cada pulsación.
let modulo;
let yaBuscado = false;

function historial() {
  if (!yaBuscado) {
    yaBuscado = true;
    const ruta = entorno.moduloComun('historial');
    try {
      modulo = ruta ? require(ruta) : null;
    } catch {
      modulo = null;
    }
  }
  return modulo;
}

// Se pide el motor binario a propósito: git es obligatorio y está instalado
// (git.js dice por qué), así que las copias las hace el git de verdad, el
// mismo que usa el arnés. La biblioteca de JavaScript se queda dentro de
// historial.js como resto, para el instalador que todavía la lleve.
const comoLlamar = () => ({ git: entorno.git(), preferirBinario: true });

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
const SIN_PIEZA = 'Falta una pieza para poder guardar. Puedo ponerla yo.';

// Esto volvió a preguntar lo que preguntaba al principio: si hay git. Durante
// un tiempo preguntó algo más amplio —"¿se pueden guardar copias?"— porque la
// biblioteca de JavaScript viajaba con nosotros y la respuesta era que sí
// siempre. Ya no: git es obligatorio, está instalado, y es el que hace el
// trabajo. Una respuesta que siempre era que sí escondía que el arnés se
// quedaba a medias por su cuenta.
let sabemosSiHayGit = null;

async function hayGit() {
  if (sabemosSiHayGit === null) sabemosSiHayGit = await git.hay();
  return sabemosSiHayGit;
}

// Después de instalarlo hay que volver a preguntar, o la barra seguiría
// diciendo que falta.
const olvidarSiHayGit = () => { sabemosSiHayGit = null; };

async function guardar(mensaje) {
  const h = historial();
  if (!h || !(await hayGit())) return { ok: false, faltaGit: true, mensaje: SIN_PIEZA };

  const donde = proyecto.raiz();
  if (!donde) return { ok: false, mensaje: NO_PUEDO };

  const hecho = await h.guardar(donde, mensaje || `Copia de seguridad — ${fechaLarga()}`, comoLlamar());
  if (!hecho.ok) return { ok: false, mensaje: NO_PUEDO };
  if (hecho.sinCambios) {
    return { ok: true, sinCambios: true, mensaje: 'No ha cambiado nada desde la última copia. No hace falta guardar.' };
  }

  return {
    ok: true,
    mensaje: hecho.cuantos === 1 ? 'Copia guardada. Había un cambio.' : `Copia guardada. Había ${hecho.cuantos} cambios.`,
  };
}

async function copias(cuantas = 10) {
  const h = historial();
  const donde = proyecto.raiz();
  if (!h || !donde) return [];

  const { copias: lista } = await h.historial(donde, cuantas, comoLlamar());
  return lista.map((c) => ({ ...c, etiqueta: `Como estaba ${haceCuanto(c.cuando)}` }));
}

// Deja la carpeta exactamente como estaba en esa copia — también quita lo que
// se creó después — sin destruir nada: antes se guarda lo de ahora, y la
// vuelta atrás queda registrada como una copia más, así que también se puede
// deshacer.
async function volverA(id) {
  const h = historial();
  const donde = proyecto.raiz();
  if (!h || !donde) return { ok: false, mensaje: NO_PUEDO };

  const previa = await guardar(`Copia de seguridad antes de volver atrás — ${fechaLarga()}`);
  if (!previa.ok) return previa;

  const movido = await h.volverA(donde, id, comoLlamar());
  if (!movido.ok) {
    return movido.error === 'identificador con mala pinta'
      ? { ok: false, mensaje: 'Esa copia no existe.' }
      : { ok: false, mensaje: 'No he podido volver atrás. Prueba con "Algo va mal".' };
  }

  const etiqueta = movido.cuando ? haceCuanto(movido.cuando) : 'entonces';
  await h.guardar(donde, `Vuelta a como estaba ${etiqueta}`, comoLlamar());

  // ── Decir lo que le acaba de pasar a lo que tenía sin guardar ──────────
  //
  // Volver atrás hace justo lo que promete: la carpeta vuelve a como estaba.
  // Lo que no decía es que el trabajo de después **desaparece de la carpeta**.
  // Está a salvo —la copia de arriba se hace antes precisamente para eso— pero
  // el mensaje era «Listo. Tu empresa ha vuelto a como estaba entonces» y nada
  // más.
  //
  // Probado con un documento sin guardar: desaparece de la vista sin una
  // palabra. Quien lo estuviera escribiendo hace diez minutos no tiene forma de
  // saber que sigue existiendo, y el susto es de los que hacen llamar al tutor
  // creyendo que se ha perdido algo. Se dice, y solo cuando de verdad había
  // algo que salvar.
  const habiaTrabajoSinGuardar = previa.ok && !previa.sinCambios;
  return {
    ok: true,
    mensaje: habiaTrabajoSinGuardar
      ? `Listo. Tu empresa ha vuelto a como estaba ${etiqueta}. Lo que tenías hecho después ya no está en las carpetas, pero no se ha perdido: lo guardé justo antes, y aquí abajo lo tienes para volver.`
      : `Listo. Tu empresa ha vuelto a como estaba ${etiqueta}.`,
  };
}

// --------------------------------------- la copia que no está en este Mac
//
// Una copia en el ordenador no salva de que el ordenador se rompa o se pierda.
// Por eso, si el alumno tiene puesta esa conexión, se le ofrece además
// guardarla fuera.
//
// El nombre del sitio NO se escribe en la interfaz: sale de la carpeta que el
// alumno tenga en sus conexiones, como todo lo demás (docs/diccionario.md, "no
// hay ninguna herramienta escrita en el código"). Aquí solo se sabe leer la
// clave y empujar.
const CONEXION = 'github';

function laClave() {
  const carpeta = proyecto.ruta('01-TOOLS', CONEXION);
  if (!carpeta || !fs.existsSync(carpeta)) return null;

  const env = conexiones.leerEnv(path.join(carpeta, '.env'));
  const clave = env.get('GITHUB_TOKEN') || env.get('GH_TOKEN');
  return clave ? { clave, donde: env.get('GITHUB_REPO') || null, usuario: env.get('GITHUB_USER') || null } : null;
}

// ¿Se puede guardar fuera? Con la sesión de GitHub del editor basta; la clave
// escrita a mano sigue valiendo para quien ya la tuviera puesta.
//
// La sesión se mira en silencio: si no la hay no se abre ningún diálogo, que
// esto se llama al pintar el panel y un panel no puede ponerse a pedir cosas
// por su cuenta.
async function comoEntrar() {
  const sesion = await github.sesion();
  if (sesion) {
    return { clave: sesion.accessToken, usuario: sesion.account ? sesion.account.label : null, delEditor: true };
  }
  return laClave();
}

const puedeSubir = async () => Boolean(await comoEntrar());

// Crea el sitio la primera vez, privado, y devuelve a dónde hay que empujar.
async function dondeSubir({ clave, donde, usuario }) {
  if (donde) return `https://github.com/${donde}.git`;

  const nombre = (proyecto.raiz() || 'mi-trabajo').split(/[\\/]/).pop()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'mi-trabajo';

  const respuesta = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clave}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    // Privado siempre: son los papeles de su empresa.
    body: JSON.stringify({ name: nombre, private: true, auto_init: false }),
  });

  if (respuesta.ok) {
    const creado = await respuesta.json();
    return `${creado.clone_url}`;
  }
  // 422 es "ya existe uno con ese nombre", que es exactamente lo que queremos.
  if (respuesta.status === 422 && usuario) return `https://github.com/${usuario}/${nombre}.git`;
  return null;
}

async function subirCopia() {
  const credenciales = await comoEntrar();
  if (!credenciales) return { ok: false, faltaGitHub: true, mensaje: 'Todavía no has entrado en tu cuenta para guardar fuera.' };

  const h = historial();
  const donde = proyecto.raiz();
  if (!h || !donde) return { ok: false, mensaje: NO_PUEDO };

  // Primero lo de aquí: no tendría sentido subir una foto vieja.
  const antes = await guardar();
  if (!antes.ok) return antes;

  let url;
  try {
    url = await dondeSubir(credenciales);
  } catch {
    url = null;
  }
  if (!url) {
    return {
      ok: false,
      mensaje: credenciales.delEditor
        ? 'No he podido preparar el sitio donde guardarla. Prueba a entrar otra vez en tu cuenta.'
        : 'No he podido preparar el sitio donde guardarla. Revisa la clave en Conexiones.',
    };
  }

  await h.enlazar(donde, url, comoLlamar());
  const subida = await h.subir(donde, { url, token: credenciales.clave }, comoLlamar());
  if (subida.ok) return { ok: true, mensaje: 'Copia guardada fuera de este ordenador.' };
  return {
    ok: false,
    mensaje: credenciales.delEditor
      ? 'No he podido guardarla fuera. Prueba a entrar otra vez en tu cuenta.'
      : 'No he podido guardarla fuera. Revisa la clave en Conexiones.',
  };
}

// Cuánto ha cambiado desde la última copia. Es para avisar, no para decidir:
// si no se puede saber, se dice que cero y no se avisa de nada.
async function cambiosSinGuardar() {
  const h = historial();
  const donde = proyecto.raiz();
  if (!h || !donde) return 0;
  return h.cuantosCambios(donde, comoLlamar());
}

module.exports = { guardar, copias, volverA, cambiosSinGuardar, subirCopia, puedeSubir, fechaLarga, haceCuanto, hayGit, olvidarSiHayGit };
