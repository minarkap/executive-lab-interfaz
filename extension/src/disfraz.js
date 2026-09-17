// El disfraz: los ajustes que hacen que VS Code deje de parecer VS Code.
//
// Los aplica la extensión, no el instalador. Importar un perfil sin interfaz
// no es posible, y las extensiones instaladas desde la línea de comandos van
// al perfil por defecto; la API de configuración escribe cualquier ámbito en
// los ajustes de usuario y funciona igual en todos los sistemas.
//
// Regalo añadido: si una clave no la ha registrado ninguna extensión, VS Code
// la rechaza. Así sabemos qué claves del disfraz no existen sin probarlas a
// mano — quedan anotadas en el canal de salida y se reintentan, porque las de
// Claude solo existen cuando su extensión ya se ha activado.

const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');

const CLAVE_ESTADO = 'disfraz';
const VERSION = 1;

function ajustes(contexto) {
  return JSON.parse(fs.readFileSync(path.join(contexto.extensionPath, 'media', 'disfraz.json'), 'utf8'));
}

function estado(contexto) {
  return contexto.globalState.get(CLAVE_ESTADO) || { version: 0, pendientes: null, quitado: false };
}

// Aplica lo que falte. Devuelve cuántas claves entraron y cuáles no pudieron.
async function aplicar(contexto, salida, { forzar = false } = {}) {
  const antes = estado(contexto);
  if (antes.quitado && !forzar) return { primeraVez: false, aplicadas: 0, pendientes: [] };

  const todos = ajustes(contexto);
  const primeraVez = antes.version !== VERSION || forzar;
  const claves = primeraVez ? Object.keys(todos) : (antes.pendientes || []);
  if (!claves.length) return { primeraVez: false, aplicadas: 0, pendientes: [] };

  const configuracion = vscode.workspace.getConfiguration();
  const pendientes = [];
  for (const clave of claves) {
    try {
      await configuracion.update(clave, todos[clave], vscode.ConfigurationTarget.Global);
    } catch (error) {
      pendientes.push(clave);
      salida.appendLine(`[disfraz] no he podido escribir ${clave}: ${error.message}`);
    }
  }

  await contexto.globalState.update(CLAVE_ESTADO, { version: VERSION, pendientes, quitado: false });
  return { primeraVez, aplicadas: claves.length - pendientes.length, pendientes };
}

// Modo avanzado: devuelve cada ajuste a su valor de fábrica.
async function quitar(contexto, salida) {
  const configuracion = vscode.workspace.getConfiguration();
  for (const clave of Object.keys(ajustes(contexto))) {
    try {
      await configuracion.update(clave, undefined, vscode.ConfigurationTarget.Global);
    } catch (error) {
      salida.appendLine(`[disfraz] no he podido quitar ${clave}: ${error.message}`);
    }
  }
  await contexto.globalState.update(CLAVE_ESTADO, { version: VERSION, pendientes: [], quitado: true });
}

// Algunos ajustes (menú, centro de comandos) solo se ven tras reabrir.
async function proponerReabrir(mensaje) {
  const eleccion = await vscode.window.showInformationMessage(mensaje, 'Hacerlo ahora', 'Más tarde');
  if (eleccion === 'Hacerlo ahora') await vscode.commands.executeCommand('workbench.action.reloadWindow');
}

module.exports = { aplicar, quitar, proponerReabrir, estado };
