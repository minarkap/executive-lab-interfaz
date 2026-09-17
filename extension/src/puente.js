// El puente hasta la caja de texto de Claude.
//
// Anthropic no documenta qué comandos expone su extensión, y no queremos
// depender de un identificador adivinado que desaparezca en una actualización.
// Así que el puente se descubre en tiempo de ejecución: se mira qué comandos
// hay, se prueba el mejor, y si no hay ninguno se cae al plan B.
//
// Este módulo es también la respuesta a la pregunta 1 del spike: el comando
// "Qué comandos de Claude hay disponibles" imprime lo que encuentre.

const vscode = require('vscode');

// Ordenados por preferencia. Los nombres son conjeturas razonables sobre
// convenciones de VS Code, no API documentada.
// Comprobado leyendo el código de la extensión 2.1.273 (17-09-2026).
//
// Ninguno de sus comandos documentados acepta texto, pero su propio manejador
// de enlaces (`vscode://anthropic.claude-code/open?prompt=…`) llama a
// `claude-vscode.primaryEditor.open(sesion, prompt)`. Ese es el camino que usa
// Anthropic, así que es el que usamos: si algún día cambia, cambiará para
// todos a la vez y no solo para nosotros.
//
// Lo que NO se puede: escribir en la conversación que ya tienes abierta. Su
// API no lo expone. Cada envío abre una conversación nueva con el texto ya
// puesto, y es lo máximo que permite hoy.
const ENVIO = [
  'claude-vscode.primaryEditor.open',
  'claude-vscode.editor.open',
];

const ENLACE_ABRIR = 'vscode://anthropic.claude-code/open';
const EXTENSION_DE_CLAUDE = 'anthropic.claude-code';

// Estos sí están documentados. Abrir el chat, y enfocar su caja de texto.
const CANDIDATOS_ABRIR = ['claude-vscode.editor.openLast', 'claude-vscode.sidebar.open'];
const CANDIDATOS_FOCO = ['claude-vscode.focus', 'claude-code.focusInput'];

// Sin caché a propósito: cuando arrancamos, la extensión de Claude puede no
// haberse activado todavía y su lista estar vacía. Preguntar es barato.
async function comandosDeClaude() {
  const todos = await vscode.commands.getCommands(true);
  return todos.filter((c) => /claude/i.test(c)).sort();
}

async function primeroDisponible(candidatos) {
  const hay = await comandosDeClaude();
  return candidatos.find((c) => hay.includes(c)) || null;
}

async function ejecutarSiExiste(candidatos) {
  const comando = await primeroDisponible(candidatos);
  if (!comando) return false;
  try {
    await vscode.commands.executeCommand(comando);
    return true;
  } catch {
    return false; // el foco es una cortesía, no un requisito
  }
}

async function darFoco() {
  await ejecutarSiExiste(CANDIDATOS_ABRIR);
  return ejecutarSiExiste(CANDIDATOS_FOCO);
}

// Manda un texto a Claude. Devuelve 'directo' si ha llegado, o 'copiado' si
// hubo que dejarlo en el portapapeles.
async function enviar(texto) {
  const hay = await comandosDeClaude();

  for (const comando of ENVIO) {
    if (!hay.includes(comando)) continue;
    try {
      await vscode.commands.executeCommand(comando, undefined, texto);
      await ejecutarSiExiste(CANDIDATOS_FOCO);
      return 'directo';
    } catch {
      /* siguiente */
    }
  }

  // openExternal dice que sí en cuanto entrega la URI, sin comprobar si
  // alguien la recoge. Así que primero se mira que la extensión que la
  // registra esté instalada.
  if (vscode.extensions.getExtension(EXTENSION_DE_CLAUDE)) {
    try {
      if (await vscode.env.openExternal(vscode.Uri.parse(`${ENLACE_ABRIR}?prompt=${encodeURIComponent(texto)}`))) return 'directo';
    } catch {
      /* plan B */
    }
  }

  // Plan B. Si se llega aquí es que algo ha cambiado en su extensión: queda
  // anotado para poder arreglarlo, en vez de dejar al alumno con un párrafo
  // en el portapapeles y ninguna explicación.
  await vscode.env.clipboard.writeText(texto);
  await darFoco();
  vscode.window.showWarningMessage(
    'No he podido hablarle directamente. Te lo he copiado: pégalo con Ctrl+V en la caja de abajo.',
  );
  return 'copiado';
}

// Vuelca lo que hay. Sirve para responder al spike sin leer código.
async function diagnostico(salida) {
  const hay = await comandosDeClaude();
  salida.clear();
  salida.appendLine('Comandos de Claude detectados en esta instalación:');
  salida.appendLine('');
  if (!hay.length) {
    salida.appendLine('  (ninguno — ¿está instalada y activada la extensión de Claude Code?)'); // diccionario: interno
  } else {
    hay.forEach((c) => salida.appendLine(`  ${c}`));
  }
  salida.appendLine('');
  salida.appendLine(`Puente de envío: ${(await primeroDisponible(ENVIO)) || 'NINGUNO — se usará el portapapeles'}`);
  salida.appendLine(`Puente de foco:  ${(await primeroDisponible(CANDIDATOS_FOCO)) || 'NINGUNO'}`);
  salida.appendLine(`Puente de abrir: ${(await primeroDisponible(CANDIDATOS_ABRIR)) || 'NINGUNO'}`);
  salida.appendLine(`Enlace profundo: ${vscode.extensions.getExtension(EXTENSION_DE_CLAUDE) ? ENLACE_ABRIR : 'NO (la extensión de Claude no está instalada)'}`); // diccionario: interno
  salida.show(true);
}

// Abre el chat de Claude sin texto: al arrancar, para que el alumno lo tenga
// delante sin buscarlo.
const abrirConversacion = () => ejecutarSiExiste(CANDIDATOS_ABRIR);

module.exports = { enviar, darFoco, abrirConversacion, comandosDeClaude, diagnostico };
