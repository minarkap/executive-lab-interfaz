// El puente hasta el asistente, sea cual sea.
//
// Qué asistente es y qué permite cada uno está en `asistentes.js`. Aquí solo
// está el orden en que se intenta hablarle:
//
//   1. Su enlace profundo, si la extensión que lo recoge está instalada.
//   2. Un comando suyo que acepte texto.
//   3. El portapapeles, avisando de que ha hecho falta.
//
// El orden de los dos primeros está medido, no supuesto: ver `enviar`.
//
// El paso 3 no es un fallo silencioso: si se llega ahí, el alumno lo sabe y
// queda anotado en el canal de salida, porque significa que algo ha cambiado
// en la extensión del asistente.

const vscode = require('vscode');
const asistentes = require('./asistentes');

async function comandosDisponibles() {
  return vscode.commands.getCommands(true);
}

async function primeroDisponible(candidatos) {
  if (!candidatos || !candidatos.length) return null;
  const hay = await comandosDisponibles();
  return candidatos.find((c) => hay.includes(c)) || null;
}

async function ejecutarSiExiste(candidatos) {
  const comando = await primeroDisponible(candidatos);
  if (!comando) return false;
  try {
    await vscode.commands.executeCommand(comando);
    return true;
  } catch {
    return false;
  }
}

// OJO con esto: en Claude, `claude-vscode.focus` no pone el cursor en la caja.
// Coge lo seleccionado en el editor, lo convierte en una mención y se la
// entrega a una conversación — y si ninguna puede cogerla, ABRE OTRA. Así que
// no se llama después de mandar un texto: ver `enviar`.
const darFoco = () => ejecutarSiExiste(asistentes.elDeAhora().foco);

// Abre su chat sin texto: al arrancar, para que el alumno lo tenga delante.
const abrirConversacion = () => ejecutarSiExiste(asistentes.elDeAhora().abrir);

// Manda un texto. Devuelve 'directo' si ha llegado, 'copiado' si hubo que
// dejarlo en el portapapeles.
//
// «Directo» quiere decir que el texto está escrito en su caja, no que se haya
// enviado: Claude lo deja puesto y ya (`setInputText`). Lo manda la persona.
// Quien lea esto y se sienta tentado de prometer más, que mire cómo lo cuenta
// la barra.
//
// ── Por qué el enlace va PRIMERO y los comandos de repuesto ──────────────
//
// Al revés no funciona, y costó tres intentos averiguarlo. Medido en la
// máquina de Jose el 19 de septiembre de 2026, con Claude Code 2.1.276:
//
//   · `vscode://anthropic.claude-code/open?prompt=…`  →  el texto aparece.
//   · `claude-vscode.editor.open(undefined, texto)`   →  conversación vacía.
//   · `claude-vscode.primaryEditor.open(íd.)`         →  conversación vacía.
//
// Y eso que el propio manejador del enlace hace `primaryEditor.open(sesión,
// texto)`, o sea lo mismo que hacíamos nosotros. La diferencia está dentro de
// su ventana: al arrancar decide qué hacer y hay caminos —una conversación ya
// abierta, o el control remoto— que se quedan con la sesión y **tiran el texto
// por el camino**. El enlace entra por donde ellos lo prueban, así que es el
// que se usa.
//
// Los comandos se quedan detrás por si un día el enlace deja de recogerse, y
// porque en una máquina sin su extensión no hay ni una cosa ni la otra.
//
// Y nada de enfocar después. Ver `darFoco`: eso abría una conversación nueva
// vacía encima de la que acababa de recibir el texto.
async function enviar(texto, salida) {
  const quien = asistentes.elDeAhora();

  // openExternal dice que sí en cuanto entrega la URI, sin mirar si alguien la
  // recoge: por eso se comprueba antes que su extensión está instalada.
  if (quien.enlace && asistentes.estaInstalado(quien)) {
    try {
      const uri = `${quien.enlace}?${quien.parametro}=${encodeURIComponent(texto)}`;
      if (await vscode.env.openExternal(vscode.Uri.parse(uri))) return 'directo';
    } catch (error) {
      if (salida) salida.appendLine(`[puente] el enlace ha fallado: ${error.message}`); // diccionario: interno
    }
  }

  const hay = await comandosDisponibles();
  for (const comando of quien.envio) {
    if (!hay.includes(comando)) continue;
    try {
      await vscode.commands.executeCommand(comando, undefined, texto);
      return 'directo';
    } catch (error) {
      if (salida) salida.appendLine(`[puente] ${comando} ha fallado: ${error.message}`); // diccionario: interno
    }
  }

  await vscode.env.clipboard.writeText(texto);
  await abrirConversacion();

  if (salida) salida.appendLine(`[puente] sin canal directo con ${quien.nombre}: al portapapeles`); // diccionario: interno
  vscode.window.showWarningMessage(
    `Con ${quien.nombre} no puedo escribirle yo. Te lo he copiado: pégalo con Ctrl+V en su caja y dale a enviar.`,
  );
  return 'copiado';
}

// Vuelca lo que hay. Sirve para saber qué expone cada asistente sin leer código.
async function diagnostico(salida) {
  const hay = await comandosDisponibles();
  salida.clear();

  for (const quien of asistentes.ASISTENTES) {
    const suyos = hay.filter((c) => c.startsWith(`${quien.id === 'claude' ? 'claude-vscode' : 'chatgpt'}.`)).sort();
    salida.appendLine(`=== ${quien.nombre} (${quien.extension}) ===`);
    salida.appendLine(`  instalado: ${asistentes.estaInstalado(quien) ? 'sí' : 'no'}`);
    salida.appendLine(`  envío:     ${(await primeroDisponible(quien.envio)) || 'NINGUNO — irá al portapapeles'}`);
    salida.appendLine(`  abrir:     ${(await primeroDisponible(quien.abrir)) || 'ninguno'}`);
    salida.appendLine(`  foco:      ${(await primeroDisponible(quien.foco)) || 'ninguno'}`);
    salida.appendLine(`  comandos que expone (${suyos.length}):`);
    suyos.forEach((c) => salida.appendLine(`    ${c}`));
    salida.appendLine('');
  }

  const ahora = asistentes.elDeAhora();
  salida.appendLine(`El arnés de esta carpeta habla con: ${ahora.nombre}`);
  salida.show(true);
}

module.exports = { enviar, darFoco, abrirConversacion, diagnostico, primeroDisponible };
