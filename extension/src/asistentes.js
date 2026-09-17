// Con qué asistente hablamos: Claude o Codex.
//
// El arnés lo sabe —`.rsc.json` guarda a qué asistentes se instaló— así que no
// se adivina: se lee. Si hay varios, manda el que esté instalado en el editor.
//
// Lo que cada uno permite hoy (comprobado leyendo sus extensiones el 17 de
// septiembre de 2026, no adivinado):
//
//   CLAUDE (anthropic.claude-code 2.1.273)
//     `claude-vscode.primaryEditor.open(sesion, prompt)` abre una conversación
//     con el texto ya puesto. Es el comando al que llama su propio manejador
//     de enlaces, así que es el camino de la casa.
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
    // Comandos que aceptan (sesión, texto). Se prueban por orden.
    envio: ['claude-vscode.primaryEditor.open', 'claude-vscode.editor.open'],
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

module.exports = { ASISTENTES, elDeAhora, losDelArnes, estaInstalado, porId };
