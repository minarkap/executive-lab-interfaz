// El puente hasta el asistente, sea cual sea.
//
// Qué asistente es y qué permite cada uno está en `asistentes.js`. Aquí solo
// está el orden en que se intenta hablarle:
//
//   1. Un comando suyo que acepte texto.
//   2. Su enlace profundo, si la extensión que lo recoge está instalada.
//   3. El portapapeles, avisando de que ha hecho falta.
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

const darFoco = () => ejecutarSiExiste(asistentes.elDeAhora().foco);

// Abre su chat sin texto: al arrancar, para que el alumno lo tenga delante.
const abrirConversacion = () => ejecutarSiExiste(asistentes.elDeAhora().abrir);

// Manda un texto. Devuelve 'directo' si ha llegado, 'copiado' si hubo que
// dejarlo en el portapapeles.
async function enviar(texto, salida) {
  const quien = asistentes.elDeAhora();
  const hay = await comandosDisponibles();

  for (const comando of quien.envio) {
    if (!hay.includes(comando)) continue;
    try {
      await vscode.commands.executeCommand(comando, undefined, texto);
      await darFoco();
      return 'directo';
    } catch (error) {
      if (salida) salida.appendLine(`[puente] ${comando} ha fallado: ${error.message}`); // diccionario: interno
    }
  }

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

  await vscode.env.clipboard.writeText(texto);
  await abrirConversacion();
  await darFoco();

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
