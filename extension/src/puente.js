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
// Comprobado contra la extensión 2.1.273 (17-09-2026). No hay ningún comando
// documentado que acepte un texto, pero en su código `claude-vscode.editor.open`
// recibe (sessionId, initialPrompt, …): sin sessionId abre una conversación
// nueva con el texto ya puesto. Es interno y puede cambiar; por eso está aquí,
// aislado, con el portapapeles detrás.
const ENVIO_INTERNO = 'claude-vscode.editor.open';

// Y el enlace profundo que la propia extensión registra (handleUri → /open,
// parámetros session y prompt). Tampoco documentado; segundo intento.
const ENLACE_ABRIR = 'vscode://anthropic.claude-code/open';
const EXTENSION_DE_CLAUDE = 'anthropic.claude-code';

// Estos sí están documentados. Primero se abre el chat, luego se enfoca la caja.
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

// Manda un texto a Claude. Devuelve 'directo' si abrió una conversación con
// el texto puesto, o 'copiado' si hubo que dejarlo en el portapapeles.
async function enviar(texto) {
  if (await primeroDisponible([ENVIO_INTERNO])) {
    try {
      await vscode.commands.executeCommand(ENVIO_INTERNO, undefined, texto);
      await ejecutarSiExiste(CANDIDATOS_FOCO);
      return 'directo';
    } catch {
      /* la firma interna ha cambiado: siguiente intento */
    }
  }

  // openExternal dice que sí en cuanto entrega la URI, sin comprobar si alguien
  // la recoge. Así que primero se mira que la extensión que la registra esté
  // instalada; si no, el enlace se tragaría el mensaje en silencio.
  if (vscode.extensions.getExtension(EXTENSION_DE_CLAUDE)) {
    try {
      const abierto = await vscode.env.openExternal(vscode.Uri.parse(`${ENLACE_ABRIR}?prompt=${encodeURIComponent(texto)}`));
      if (abierto) return 'directo';
    } catch {
      /* sin enlace: plan B */
    }
  }

  await vscode.env.clipboard.writeText(texto);
  await darFoco();
  vscode.window.showInformationMessage(
    'Te he copiado lo que hay que pedirle. Pégalo en la caja de abajo con Ctrl+V y dale a enviar.',
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
  salida.appendLine(`Puente de envío: ${(await primeroDisponible([ENVIO_INTERNO])) ? `${ENVIO_INTERNO} (argumento interno initialPrompt)` : 'NINGUNO — se usará el portapapeles'}`);
  salida.appendLine(`Puente de foco:  ${(await primeroDisponible(CANDIDATOS_FOCO)) || 'NINGUNO'}`);
  salida.appendLine(`Puente de abrir: ${(await primeroDisponible(CANDIDATOS_ABRIR)) || 'NINGUNO'}`);
  salida.appendLine(`Enlace profundo: ${vscode.extensions.getExtension(EXTENSION_DE_CLAUDE) ? ENLACE_ABRIR : 'NO (la extensión de Claude no está instalada)'}`); // diccionario: interno
  salida.show(true);
}

// Abre el chat de Claude sin texto: al arrancar, para que el alumno lo tenga
// delante sin buscarlo.
const abrirConversacion = () => ejecutarSiExiste(CANDIDATOS_ABRIR);

module.exports = { enviar, darFoco, abrirConversacion, comandosDeClaude, diagnostico };
