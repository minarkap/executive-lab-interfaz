// La barra lateral Executive Lab.
//
// Una sola vista, seis acciones. Todo lo que se enseña aquí está en
// docs/diccionario.md; si hace falta una palabra que no esté, se añade allí
// primero.

const vscode = require('vscode');
const crypto = require('node:crypto');

const brujula = require('./brujula');
const puente = require('./puente');
const conexiones = require('./conexiones');
const copias = require('./guardar');
const soporte = require('./soporte');
const disfraz = require('./disfraz');

class Panel {
  constructor(contexto, salida) {
    this.contexto = contexto;
    this.salida = salida;
    this.vista = null;
  }

  resolveWebviewView(vista) {
    this.vista = vista;
    const medios = vscode.Uri.joinPath(this.contexto.extensionUri, 'media');

    vista.webview.options = { enableScripts: true, localResourceRoots: [medios] };
    vista.webview.html = this.html(vista.webview, medios);
    vista.webview.onDidReceiveMessage((m) => this.manejar(m));

    // Al volver a mirar la barra lateral, la brújula se pone al día sola.
    vista.onDidChangeVisibility(() => { if (vista.visible) this.refrescar(); });
  }

  html(webview, medios) {
    const nonce = crypto.randomBytes(16).toString('base64');
    const css = webview.asWebviewUri(vscode.Uri.joinPath(medios, 'panel.css'));
    const js = webview.asWebviewUri(vscode.Uri.joinPath(medios, 'panel.js'));
    const csp = ["default-src 'none'", `style-src ${webview.cspSource}`, `script-src 'nonce-${nonce}'`].join('; ');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<link rel="stylesheet" href="${css}">
</head>
<body>
<div id="app" aria-live="polite"></div>
<script nonce="${nonce}" src="${js}"></script>
</body>
</html>`;
  }

  enviar(mensaje) {
    if (this.vista) this.vista.webview.postMessage(mensaje);
  }

  async refrescar(fresco = false) {
    this.enviar({ tipo: 'cargando' });
    this.enviar({ tipo: 'estado', estado: await brujula.estado({ fresco }) });
  }

  async manejar(mensaje) {
    const acciones = {
      listo: () => this.refrescar(),
      refrescar: () => this.refrescar(true),
      volver: () => this.refrescar(),
      pedir: () => this.pedir(mensaje.prompt),
      abrir: () => vscode.env.openExternal(vscode.Uri.parse(mensaje.url)),
      verConexiones: () => this.verConexiones(),
      verConexion: () => this.verConexion(mensaje.proveedor),
      guardarClave: () => this.guardarClave(mensaje.proveedor, mensaje.clave, mensaje.valor),
      probar: () => this.probar(mensaje.proveedor),
      verCopias: () => this.verCopias(),
      guardarCopia: () => this.guardarCopia(),
      volverA: () => this.volverA(mensaje.id),
      algoVaMal: () => this.algoVaMal(),
      arreglar: () => this.arreglar(),
    };

    const accion = acciones[mensaje.tipo];
    if (!accion) return;

    try {
      await accion();
    } catch (error) {
      // Nada de excepciones en crudo: el alumno ve una frase y una salida.
      this.salida.appendLine(`[${mensaje.tipo}] ${error.stack || error.message}`);
      this.enviar({ tipo: 'aviso', texto: 'Algo no ha ido bien. Prueba con "Algo va mal".', malo: true });
    }
  }

  async pedir(prompt) {
    const como = await puente.enviar(prompt);
    if (como === 'directo') this.enviar({ tipo: 'aviso', texto: 'Se lo he pedido. Mira la conversación.' });
  }

  verConexiones() {
    this.enviar({ tipo: 'conexiones', proveedores: conexiones.proveedores() });
  }

  verConexion(proveedor, aviso = null) {
    const datos = conexiones.claves(proveedor);
    if (!datos) return this.verConexiones();
    return this.enviar({ tipo: 'conexion', ...datos, aviso });
  }

  async guardarClave(proveedor, clave, valor) {
    const { ok, mensaje } = conexiones.escribir(proveedor, clave, valor);
    this.verConexion(proveedor, { texto: mensaje, malo: !ok });
  }

  async probar(proveedor) {
    this.enviar({ tipo: 'probando' });
    const { ok, mensaje } = await conexiones.probar(proveedor);
    this.verConexion(proveedor, { texto: mensaje, malo: !ok });
  }

  async verCopias() {
    this.enviar({ tipo: 'copias', copias: await copias.copias(8) });
  }

  async guardarCopia() {
    const { ok, mensaje } = await copias.guardar();
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    if (ok) brujula.estado({ fresco: true }).catch(() => {});
  }

  async volverA(id) {
    const eleccion = await vscode.window.showWarningMessage(
      'Voy a dejar tu empresa como estaba entonces. Guardo antes una copia de lo de ahora, por si acaso.',
      { modal: true },
      'Sí, vuelve atrás',
    );
    if (eleccion !== 'Sí, vuelve atrás') return;

    const { ok, mensaje } = await copias.volverA(id);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    await this.refrescar(true);
  }

  async algoVaMal() {
    this.enviar({ tipo: 'revisando' });
    const informe = await soporte.revisar();
    this.salida.appendLine(informe.informe);
    this.enviar({ tipo: 'incidencia', codigo: informe.codigo, sano: informe.sano, hayQueTocarAlgo: informe.hayQueTocarAlgo });
  }

  async arreglar() {
    this.enviar({ tipo: 'revisando' });
    const { ok, mensaje, detalle } = await soporte.arreglar();
    if (detalle) this.salida.appendLine(detalle);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    await this.refrescar(true);
  }
}

// El disfraz se pone en el primer arranque. Las claves de Claude solo existen
// cuando su extensión ya está activa, así que lo que no entre se reintenta.
async function vestir(contexto, salida) {
  const { primeraVez, aplicadas, pendientes } = await disfraz.aplicar(contexto, salida);
  if (pendientes.length) {
    setTimeout(() => disfraz.aplicar(contexto, salida).catch(() => {}), 8000);
  }
  if (primeraVez && aplicadas) {
    await disfraz.proponerReabrir('Ya está todo preparado. Para que se vea bien, hay que cerrar y abrir de nuevo.');
  }
}

function activate(contexto) {
  const salida = vscode.window.createOutputChannel('Executive Lab');
  const panel = new Panel(contexto, salida);
  const comando = (id, fn) => vscode.commands.registerCommand(id, fn);

  contexto.subscriptions.push(
    salida,
    vscode.window.registerWebviewViewProvider('executiveLab.panel', panel),
    comando('executiveLab.refrescar', () => panel.refrescar(true)),
    comando('executiveLab.guardar', () => panel.guardarCopia()),
    comando('executiveLab.conexiones', () => panel.verConexiones()),
    comando('executiveLab.algoVaMal', () => panel.algoVaMal()),
    comando('executiveLab.seguir', () => panel.pedir('Recuérdame en qué estábamos y sigamos por donde lo dejamos.')),
    comando('executiveLab.empezar', () => panel.pedir('Quiero empezar algo nuevo en mi empresa. Pregúntame qué necesito.')),
    comando('executiveLab.diagnosticoPuente', () => puente.diagnostico(salida)),
    comando('executiveLab.modoAvanzado', async () => {
      await disfraz.quitar(contexto, salida);
      await disfraz.proponerReabrir('Ahora verás el editor completo. Para que se aplique, hay que cerrar y abrir de nuevo.');
    }),
    comando('executiveLab.modoSencillo', async () => {
      await disfraz.aplicar(contexto, salida, { forzar: true });
      await disfraz.proponerReabrir('Vuelves al modo sencillo. Para que se aplique, hay que cerrar y abrir de nuevo.');
    }),
  );

  // La barra de actividad está oculta por el disfraz, así que si no forzamos
  // nuestra vista el alumno se encuentra el explorador de ficheros delante.
  vscode.commands.executeCommand('executiveLab.panel.focus');

  // Y el chat de Claude ya abierto en el centro: el alumno no tiene que
  // buscarlo. Su extensión puede tardar en activarse; se le da un momento.
  setTimeout(() => puente.abrirConversacion().catch(() => {}), 1500);

  // El disfraz se pone solo en una instalación de verdad. Quien prueba la
  // extensión desde el código no quiere que le desaparezca su editor: ahí se
  // pone a mano con "Volver al modo sencillo".
  if (contexto.extensionMode !== vscode.ExtensionMode.Development) {
    vestir(contexto, salida).catch((e) => salida.appendLine(`[disfraz] ${e.message}`));
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
