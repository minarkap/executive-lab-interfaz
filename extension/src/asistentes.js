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

// Con cuál se habla en esta ventana. Manda el arnés; entre varios, el que esté
// instalado; si ninguno lo está, el primero que declaró, para poder decirle al
// alumno qué le falta en vez de callarnos.
function elDeAhora() {
  const delArnes = losDelArnes();
  return delArnes.find(estaInstalado) || ASISTENTES.find(estaInstalado) || delArnes[0] || ASISTENTES[0];
}

// Lo que hay que enseñar para poder elegir: cuál manda ahora, cuáles están
// puestos en este ordenador y cuáles declaró el arnés.
function comoEstamos() {
  const ahora = elDeAhora();
  const delArnes = losDelArnes().map((a) => a.id);
  return {
    ahora: ahora ? ahora.id : null,
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

// Cambiar con cuál se habla. Se escribe en `.rsc.json`, que es donde el arnés
// lo guarda, respetando todo lo demás del fichero.
//
// Ojo con lo que esto NO hace: no reinstala el arnés para el otro asistente.
// Las habilidades, los ayudantes y los raíles se quedan en la carpeta del
// anterior, y cada asistente solo mira la suya. O sea que al cambiar, la barra
// se queda a cero de todo eso hasta que alguien lo vuelva a montar.
//
// Aquí decía «por eso la pantalla lo dice» y la pantalla no lo decía: el
// mensaje era «Hecho. A partir de ahora los botones hablan con X» y punto. Un
// alumno que pulsa y ve desaparecer sus habilidades cree que ha roto algo.
function elegir(id) {
  const cual = porId(id);
  if (!cual) return { ok: false, mensaje: 'Ese no es uno de los dos.' };
  if (!estaInstalado(cual)) return { ok: false, mensaje: `${cual.nombre} no está en este ordenador. Díselo a tu tutor.` };

  const ruta = proyecto.ruta('.rsc.json');
  const declaracion = proyecto.declaracion();
  if (!ruta || !declaracion) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  const antes = Array.isArray(declaracion.targets) ? declaracion.targets : [];
  const targets = [id, ...antes.filter((t) => t !== id)];

  // Lo que se queda atrás, contado antes de cambiar nada: si esta carpeta tenía
  // habilidades o ayudantes montados para el otro, dejan de verse. No se
  // pierden —siguen en su carpeta— pero desaparecen de la barra, y eso hay que
  // decirlo con el nombre de lo que desaparece.
  const donde = require('./donde');
  const fs = require('node:fs');
  const cuantasHay = (carpeta) => {
    try {
      return carpeta && fs.existsSync(carpeta)
        ? fs.readdirSync(carpeta).filter((n) => !n.startsWith('.')).length
        : 0;
    } catch {
      return 0;
    }
  };
  const seQuedan = [
    [cuantasHay(donde.carpetaDeHabilidades()), 'habilidades'],
    [cuantasHay(donde.carpetaDeAgentes()), 'ayudantes'],
  ].filter(([cuantas]) => cuantas > 0);

  try {
    fs.writeFileSync(ruta, `${JSON.stringify({ ...declaracion, targets }, null, 2)}\n`);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo. Prueba con "Algo va mal".' };
  }

  const aviso = seQuedan.length
    ? ` Lo que tenías montado para el otro (${seQuedan.map(([c, q]) => `${c} ${q}`).join(' y ')}) deja de verse: no se ha borrado, pero ${cual.nombre} no mira en esa carpeta. Pídeselo y te lo vuelve a montar.`
    : '';

  // Y lo que se pierde sin estar en ninguna carpeta: los frenos. RSC solo se los
  // engancha a Claude, así que al pasar a otro asistente desaparece el que para
  // una orden peligrosa — y ese es el que protege a quien no es técnico. No se
  // puede arreglar desde aquí, pero callarlo es peor: esto se pulsa una vez y
  // nadie vuelve a mirar Las reglas para enterarse.
  const sinFrenos = (donde.SITIOS[id] || {}).frenos
    ? ''
    : ` Y ${cual.nombre} no trae frenos: el que para una orden peligrosa solo se le engancha a Claude.`;

  return { ok: true, mensaje: `Hecho. A partir de ahora los botones hablan con ${cual.nombre}.${aviso}${sinFrenos}` };
}

module.exports = { ASISTENTES, elDeAhora, losDelArnes, estaInstalado, porId, comoEstamos, elegir };
