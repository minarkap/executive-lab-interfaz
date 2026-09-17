// El disfraz: los ajustes que hacen que VS Code deje de parecer VS Code.
//
// Dos capas, y la distinción importa:
//
//   · La BASE va a los ajustes de usuario. La escribe el instalador antes del
//     primer arranque y la extensión la repasa. Ahí viven las cosas que solo
//     se pueden fijar para todo el programa: la confianza del workspace, las
//     actualizaciones, la telemetría, el zoom.
//
//   · El INTERRUPTOR es por ventana. "Ver el editor completo" escribe, en el
//     .vscode/settings.json de la carpeta abierta, los valores de fábrica de
//     lo que se ve — barra de actividad, barra de estado, pestañas, menú,
//     ficheros ocultos, colores— y así esa ventana deja de estar disfrazada
//     sin tocar las demás. "Modo sencillo" los borra.
//
// Regalo añadido: si una clave no la ha registrado ninguna extensión, o no
// admite el ámbito que le pedimos, VS Code la rechaza. Lo anotamos en el canal
// de salida en vez de suponer.

const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');

const CLAVE_ESTADO = 'disfraz';
const VERSION = 2;

// Estas no admiten ámbito de carpeta: VS Code las declara de ámbito de
// programa, así que valen para todas las ventanas a la vez. **Las pone el
// instalador**, una vez, en la máquina del alumno, donde solo hay una empresa
// y eso es lo correcto.
//
// La extensión no las toca nunca. En la máquina de quien desarrolla —o de
// cualquiera que use VS Code para otras cosas— cambiarlas le altera todas las
// ventanas, que es justo lo que no queremos.
const SOLO_DEL_INSTALADOR = [
  'security.workspace.trust.enabled',
  'update.mode',
  'update.showReleaseNotes',
  'telemetry.telemetryLevel',
  'extensions.ignoreRecommendations',
  'window.zoomLevel',
];

// Lo que el interruptor devuelve a fábrica: lo que se ve. El resto de la base
// (confianza, actualizaciones, telemetría, zoom) es de ámbito de programa y
// ninguna ventana puede cambiarlo por su cuenta.
// Pendiente de mirar con dos ventanas abiertas: si VS Code también fusiona
// `workbench.colorCustomizations` entre ámbitos, los colores de la marca se
// quedarían puestos en modo avanzado. Se ve a simple vista (barra lateral color
// crema con el editor completo) y se arregla igual que las listas de exclusión.
const CLAVES_VISIBLES = [
  'window.title',
  'window.commandCenter',
  'window.menuBarVisibility',
  'workbench.activityBar.location',
  'workbench.statusBar.visible',
  'workbench.editor.showTabs',
  'workbench.layoutControl.enabled',
  'workbench.colorTheme',
  'workbench.colorCustomizations',
  'breadcrumbs.enabled',
  'editor.minimap.enabled',
  'editor.lineNumbers',
  'files.exclude',
  'search.exclude',
  'git.decorations.enabled',
  'scm.diffDecorations',
];

function ajustes(contexto) {
  return JSON.parse(fs.readFileSync(path.join(contexto.extensionPath, 'media', 'disfraz.json'), 'utf8'));
}

function estado(contexto) {
  return contexto.globalState.get(CLAVE_ESTADO) || { version: 0, pendientes: null, quitado: false };
}

// ------------------------------------------------------------------- la base

// Aplica lo que falte. Devuelve cuántas claves cambiaron y cuáles no pudieron.
async function aplicar(contexto, salida, { forzar = false } = {}) {
  const antes = estado(contexto);
  if (antes.quitado && !forzar) return { primeraVez: false, aplicadas: 0, pendientes: [] };

  const todos = ajustes(contexto);
  const primeraVez = antes.version !== VERSION || forzar;
  const claves = primeraVez ? Object.keys(todos) : (antes.pendientes || []);
  if (!claves.length) return { primeraVez: false, aplicadas: 0, pendientes: [] };

  // El disfraz va a los ajustes de ESTA carpeta, no a los de VS Code entero:
  // así una ventana con la empresa del alumno está disfrazada y otra con
  // cualquier otra cosa no se entera. Sin carpeta abierta no hay dónde
  // escribirlo, y se deja estar.
  if (!hayCarpeta()) return { primeraVez: false, aplicadas: 0, pendientes: [] };

  const configuracion = vscode.workspace.getConfiguration();
  const pendientes = [];
  let cambiadas = 0;
  for (const clave of claves) {
    if (SOLO_DEL_INSTALADOR.includes(clave)) continue;

    // Si ya está escrito —por el instalador o por una sesión anterior— no hay
    // nada que cambiar ni que reabrir.
    const visto = configuracion.inspect(clave);
    const puesto = visto?.workspaceValue !== undefined ? visto.workspaceValue : visto?.globalValue;
    if (JSON.stringify(puesto) === JSON.stringify(todos[clave])) continue;

    try {
      await configuracion.update(clave, todos[clave], vscode.ConfigurationTarget.Workspace);
      cambiadas += 1;
    } catch (error) {
      pendientes.push(clave);
      salida.appendLine(`[disfraz] ${clave} no admite ámbito de carpeta: ${error.message}`);
    }
  }

  await contexto.globalState.update(CLAVE_ESTADO, { version: VERSION, pendientes, quitado: false });
  return { primeraVez, aplicadas: cambiadas, pendientes };
}

// Quita el disfraz de TODO VS Code: de esta carpeta y de los ajustes de
// usuario. Es la salida de emergencia — la que hace falta cuando alguien
// instala esto en el editor donde trabaja y se le cambian todas las ventanas.
async function quitar(contexto, salida) {
  const configuracion = vscode.workspace.getConfiguration();
  let quitadas = 0;

  for (const clave of Object.keys(ajustes(contexto))) {
    for (const ambito of [vscode.ConfigurationTarget.Workspace, vscode.ConfigurationTarget.Global]) {
      try {
        const visto = configuracion.inspect(clave);
        const hay = ambito === vscode.ConfigurationTarget.Workspace
          ? visto?.workspaceValue !== undefined
          : visto?.globalValue !== undefined;
        if (!hay) continue;
        await configuracion.update(clave, undefined, ambito);
        quitadas += 1;
      } catch (error) {
        salida.appendLine(`[disfraz] no he podido quitar ${clave}: ${error.message}`);
      }
    }
  }

  await contexto.globalState.update(CLAVE_ESTADO, { version: VERSION, pendientes: [], quitado: true });
  return { quitadas };
}

// ------------------------------------------------ el interruptor, por ventana

function hayCarpeta() {
  const carpetas = vscode.workspace.workspaceFolders;
  return Boolean(carpetas && carpetas.length);
}

// Esta ventana está en modo avanzado si alguna clave visible lleva una
// anulación propia de la carpeta.
function modoDeEstaVentana() {
  const configuracion = vscode.workspace.getConfiguration();
  const anulada = CLAVES_VISIBLES.some((clave) => {
    const info = configuracion.inspect(clave);
    return info?.workspaceValue !== undefined || info?.workspaceFolderValue !== undefined;
  });
  return anulada ? 'avanzado' : 'sencillo';
}

// Las listas de exclusión no se sustituyen entre ámbitos: VS Code fusiona el
// valor de la carpeta con el del usuario. Escribir el de fábrica (vacío) no
// desocultaría nada, así que hay que apagar una por una las que esconde la
// base, poniéndolas a `false`.
const SE_FUSIONAN = ['files.exclude', 'search.exclude'];

function valorParaDestapar(contexto, clave, configuracion) {
  if (!SE_FUSIONAN.includes(clave)) return configuracion.inspect(clave)?.defaultValue;

  const base = ajustes(contexto)[clave] || {};
  return Object.fromEntries(Object.keys(base).map((patron) => [patron, false]));
}

// Devuelve a fábrica lo que se ve, solo en esta ventana.
async function verEditorCompleto(contexto, salida) {
  if (!hayCarpeta()) {
    return { ok: false, mensaje: 'Primero abre tu empresa; sin carpeta no puedo cambiar solo esta ventana.' };
  }

  const configuracion = vscode.workspace.getConfiguration();
  const rechazadas = [];
  for (const clave of CLAVES_VISIBLES) {
    // El valor de fábrica lo dice VS Code; no lo adivinamos ni lo copiamos.
    try {
      await configuracion.update(clave, valorParaDestapar(contexto, clave, configuracion), vscode.ConfigurationTarget.Workspace);
    } catch (error) {
      rechazadas.push(clave);
      salida.appendLine(`[disfraz] ${clave} no admite ámbito de carpeta: ${error.message}`);
    }
  }

  if (rechazadas.length === CLAVES_VISIBLES.length) {
    return { ok: false, mensaje: 'No he podido cambiar solo esta ventana. Prueba con "Algo va mal".' };
  }
  return { ok: true, rechazadas, mensaje: 'Ya ves el editor completo en esta ventana. Las demás siguen igual.' };
}

// Borra esas anulaciones: la ventana vuelve a la base.
async function volverAModoSencillo(salida) {
  const configuracion = vscode.workspace.getConfiguration();
  for (const clave of CLAVES_VISIBLES) {
    try {
      await configuracion.update(clave, undefined, vscode.ConfigurationTarget.Workspace);
    } catch (error) {
      salida.appendLine(`[disfraz] no he podido devolver ${clave}: ${error.message}`);
    }
  }
  return { ok: true, mensaje: 'Vuelves al modo sencillo en esta ventana.' };
}

// Algunos ajustes (menú, centro de comandos) solo se ven tras reabrir.
async function proponerReabrir(mensaje) {
  const eleccion = await vscode.window.showInformationMessage(mensaje, 'Hacerlo ahora', 'Más tarde');
  if (eleccion === 'Hacerlo ahora') await vscode.commands.executeCommand('workbench.action.reloadWindow');
}

module.exports = {
  aplicar,
  quitar,
  verEditorCompleto,
  volverAModoSencillo,
  modoDeEstaVentana,
  proponerReabrir,
  estado,
  CLAVES_VISIBLES,
};
