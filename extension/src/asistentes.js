// Con qué asistente hablamos: Claude o Codex.
//
// El arnés lo sabe —`.rsc.json` guarda a qué asistentes se instaló— así que no
// se adivina: se lee. Si hay varios, manda el que esté instalado en el editor.
//
// Lo que cada uno permite hoy (comprobado leyendo sus extensiones el 17 de
// septiembre de 2026, no adivinado):
//
//   CLAUDE (anthropic.claude-code 2.1.276, leído y PROBADO el 19-09-2026)
//     Se le habla por su enlace: `vscode://anthropic.claude-code/open?prompt=`.
//     Es lo único que entrega el texto de verdad — probado en la máquina de
//     Jose. Los dos comandos que lo aceptan abren una conversación vacía, y
//     eso que el manejador del enlace llama a uno de ellos: lo que se pierde
//     se pierde dentro de su ventana. El porqué completo, en `puente.js`.
//
//     De repuesto quedan `claude-vscode.editor.open(sesion, prompt, …)` —que
//     respeta si esa persona tiene Claude en la barra lateral o en un panel— y
//     `claude-vscode.primaryEditor.open(sesion, prompt)`, que abre siempre una
//     pestaña grande nueva.
//
//     En los dos casos el texto se deja escrito en la caja —`setInputText`—,
//     NO se envía. Lo tiene que mandar la persona. La barra lo dice así.
//
//     Y `claude-vscode.focus` NO es «pon el cursor en la caja», aunque se
//     llame así: coge lo que haya seleccionado en el editor, lo convierte en
//     una mención y se la entrega a una conversación; si ninguna puede
//     cogerla, abre otra. Llamarlo justo después de mandar el texto era lo que
//     le dejaba a Jose una conversación vacía encima de la buena.
//
//   CODEX (openai.chatgpt 26.5908.31748)
//     No expone NINGÚN comando que acepte texto. `chatgpt.addToThread` manda la
//     selección del editor, no lo que le pases, y `chatgpt.implementTodo`
//     llega enmarcado como "implementa este TODO". Así que con Codex los
//     botones abren su barra y dejan el texto en el portapapeles, avisando.
//     El día que añadan uno, se pone en `envio` y todo lo demás ya funciona.

const vscode = require('vscode');
const proyecto = require('./proyecto');

const ASISTENTES = [
  {
    id: 'claude',
    nombre: 'Claude',
    extension: 'anthropic.claude-code',
    // Comandos que aceptan (sesión, texto). Se prueban por orden, y el orden
    // importa: ver arriba.
    envio: ['claude-vscode.editor.open', 'claude-vscode.primaryEditor.open'],
    enlace: 'vscode://anthropic.claude-code/open',
    // Cómo se le pasa el texto por el enlace.
    parametro: 'prompt',
    abrir: ['claude-vscode.editor.openLast', 'claude-vscode.sidebar.open'],
    foco: ['claude-vscode.focus'],
  },
  {
    id: 'codex',
    nombre: 'Codex',
    extension: 'openai.chatgpt',
    envio: [],
    enlace: null,
    parametro: null,
    abrir: ['chatgpt.openSidebar'],
    foco: ['chatgpt.openSidebar'],
  },
];

const porId = (id) => ASISTENTES.find((a) => a.id === id) || null;

const estaInstalado = (a) => Boolean(vscode.extensions.getExtension(a.extension));

// A cuáles se instaló el arnés. RSC lo guarda en `.rsc.json`.
function losDelArnes() {
  const declaracion = proyecto.declaracion();
  const targets = declaracion && Array.isArray(declaracion.targets) ? declaracion.targets : [];
  return targets.map(porId).filter(Boolean);
}

// ── Una sola respuesta a «con qué asistente» (E2) ────────────────────────
//
// La barra contestaba de dos formas: dónde mira —el primero declarado, en
// `donde`, `saberes.comoSePide` y `rsc.anadir`— y con quién habla —el primero
// instalado, aquí—. Con los dos declarados y solo Codex en el ordenador,
// buscaba las habilidades en la carpeta de Claude y le hablaba a Codex. Ahora
// todo tira de esta función, por este orden:
//
//   1. el que se eligió en esta carpeta, si el arnés está montado para él;
//   2. el primero declarado que esté instalado;
//   3. el primero declarado, aunque no esté, para poder decir qué falta;
//   4. sin nada declarado, el que esté instalado, y si no, Claude.
//
// Hablar con uno para el que no está montado el arnés sería hablar sin sus
// habilidades, así que lo declarado va antes que lo instalado.
//
// La elección va en el estado del espacio de trabajo, que es de esta carpeta y
// de este ordenador, y no en el orden de `targets`: RSC los ordena en cada
// escritura, así que un `sync` o un `add` la deshacían (E1).
const CLAVE_DE_LA_ELECCION = 'executiveLab.conQuien';
let estado = null;
const saberDondeGuardar = (workspaceState) => { estado = workspaceState || null; };

function laEleccion() {
  try {
    return estado ? estado.get(CLAVE_DE_LA_ELECCION) || null : null;
  } catch {
    return null;
  }
}

function conQuien() {
  const declarados = losDelArnes();
  const elegido = porId(laEleccion());
  // Y si sigue en el ordenador: si no, los botones acababan en «pégalo en su
  // caja» para una caja que no hay (revisión de F5, m1).
  if (elegido && declarados.some((a) => a.id === elegido.id) && estaInstalado(elegido)) return elegido;
  return declarados.find(estaInstalado) || declarados[0] || ASISTENTES.find(estaInstalado) || ASISTENTES[0];
}

const elDeAhora = () => conQuien();

// Lo que hay que enseñar para poder elegir: cuál manda ahora, cuáles están
// puestos en este ordenador y cuáles declaró el arnés.
function comoEstamos() {
  const ahora = elDeAhora();
  const delArnes = losDelArnes().map((a) => a.id);
  const targets = (proyecto.declaracion() || {}).targets;
  return {
    ahora: ahora ? ahora.id : null,
    // Si la carpeta está montada, aunque sea para uno que la barra no ofrece: ahí
    // el de ahora no tiene nada, y se dice (revisión de F5, m4).
    montada: Array.isArray(targets) && targets.length > 0,
    cuales: ASISTENTES.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      instalado: estaInstalado(a),
      // Si el arnés se montó para él. Se puede hablar con uno no declarado,
      // pero conviene decirlo.
      delArnes: delArnes.includes(a.id),
      // Con Codex los botones no pueden mandar texto: abren su barra y lo
      // dejan copiado. Se dice aquí y no en una nota al pie.
      mandaTexto: a.envio.length > 0,
    })),
  };
}

// Cambiar con cuál se habla (E1).
//
// Se reordenaba `targets` en `.rsc.json`, y eso ni duraba —RSC los ordena en
// cada escritura— ni montaba nada: las habilidades y los agentes del otro
// «dejaban de verse», y lo declarado no cuadraba con lo instalado. Ahora:
//
//   · con uno para el que ya está montado, se apunta la elección y ya;
//   · con uno para el que no, se prepara también para él —`montar`, que es el
//     `sync --target` del arnés de dentro y sus raíles— y solo si sale bien se
//     apunta. Si no, no se cambia nada.
async function elegir(id, { montar } = {}) {
  const cual = porId(id);
  if (!cual) return { ok: false, mensaje: 'Ese no es uno de los dos.' };
  if (!estaInstalado(cual)) return { ok: false, mensaje: `${cual.nombre} no está en este ordenador. Díselo a tu tutor.` };

  const declaracion = proyecto.declaracion();
  if (!declaracion) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  const noSePudo = { ok: false, mensaje: `No he podido prepararla para ${cual.nombre}. Pulsa «Algo va mal» y pásale el código a tu tutor.` };
  const declarados = () => {
    const d = proyecto.declaracion() || {};
    return Array.isArray(d.targets) ? d.targets : [];
  };
  // Declarado y sin sus raíles es un cambio que se quedó a medias: el arnés lo
  // declaró y los raíles no se pudieron poner. Se termina, en vez de decir
  // «Hecho» sin ellos (revisión de F5, m2).
  const suyo = require('../media/railes/sitios').sitiosDe(id);
  const conSusRailes = () => Boolean(suyo) && require('node:fs').existsSync(proyecto.ruta(...suyo.habilidades, 'executive-lab', 'SKILL.md'));
  let renombrados = [];
  if (!declarados().includes(id) || !conSusRailes()) {
    if (typeof montar !== 'function') return noSePudo;
    let hecho;
    try {
      hecho = await montar(id);
    } catch (error) {
      hecho = { ok: false, detalle: error.message };
    }
    if (hecho === true) hecho = { ok: true };
    if (!hecho || typeof hecho !== 'object') hecho = { ok: false };
    // Con una versión del arnés más nueva que la de la clase no se prepara nada
    // (revisión de F5, I2), y sin su sí, nada se toca.
    if (hecho.masNueva) {
      return { ok: false, mensaje: 'Esta carpeta se montó con una versión del arnés más nueva que la de tu clase. Antes de cambiar de asistente, pulsa «Ponerla como la de la clase» en Qué falta por montar.' };
    }
    if (hecho.cancelado) return { ok: false, cancelado: true, mensaje: 'No he tocado nada. Cuando quieras, el botón sigue aquí.' };
    if (!hecho.ok) return { ...noSePudo, ...(hecho.mensaje ? { mensaje: hecho.mensaje } : {}), detalle: hecho.detalle };
    if (!declarados().includes(id)) return { ...noSePudo, detalle: 'el arnés terminó bien y no lo ha declarado' }; // diccionario: interno
    renombrados = hecho.renombrados || [];
  }

  // Sin dónde guardarlo no se dice «Hecho»: la elección no duraría ni hasta el
  // siguiente repintado (revisión de F5, M2).
  const noSeGuardo = { ok: false, mensaje: 'No he podido guardarlo. Pulsa «Algo va mal» y pásale el código a tu tutor.' };
  if (!estado) return { ...noSeGuardo, detalle: 'la barra no tiene dónde guardar la elección' }; // diccionario: interno
  try {
    await estado.update(CLAVE_DE_LA_ELECCION, id);
  } catch (error) {
    return { ...noSeGuardo, detalle: error.message };
  }

  // Lo que se pierde sin estar en ninguna carpeta: los frenos. RSC solo se los
  // engancha a Claude, y los raíles también, así que al pasar a otro asistente
  // desaparece el que para una orden peligrosa, y ese es el que protege a quien
  // no es técnico. No se puede arreglar desde aquí, pero callarlo es peor: esto
  // se pulsa una vez, y nadie vuelve a mirar Las reglas para enterarse.
  const donde = require('./donde');
  const sinFrenos = (donde.SITIOS[id] || {}).frenos
    ? ''
    : ` Y ${cual.nombre} no trae frenos: el que para una orden peligrosa solo se le engancha a Claude.`;
  const conOtroNombre = renombrados
    .map((r) => ` Tu ${r.que === 'habilidad' ? 'habilidad' : r.que} «${r.id}» ahora se llama «${r.ahora}».`)
    .join('');
  return { ok: true, mensaje: `Hecho. A partir de ahora los botones hablan con ${cual.nombre}.${conOtroNombre}${sinFrenos}` };
}

module.exports = { ASISTENTES, saberDondeGuardar, conQuien, elDeAhora, losDelArnes, estaInstalado, porId, comoEstamos, elegir };
