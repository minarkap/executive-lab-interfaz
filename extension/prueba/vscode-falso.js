// Un `vscode` de mentira: lo justo para cargar los módulos de la extensión y
// ejercitarlos fuera del editor. Apunta todo lo que le piden en `registrado`,
// para poder afirmar sobre ello.

const registrado = {
  comandos: [],
  vistas: [],
  ejecutados: [],
  ajustes: { global: {}, workspace: {} },
  mensajes: [],
  abiertos: [],
  barraEstado: [],
  portapapeles: null,
};

// Lo que las pruebas pueden cambiar antes de llamar.
const guion = {
  comandosDeClaude: ['claude-vscode.editor.open', 'claude-vscode.focus', 'claude-vscode.editor.openLast'],
  eleccion: undefined,      // qué devuelve showQuickPick / showWarningMessage
  escrito: undefined,       // qué devuelve showInputBox
  ficheros: [],             // qué devuelve showOpenDialog
  rechazaAjuste: () => false,
  extensionesInstaladas: ['anthropic.claude-code'],
  raiz: null,
};

const uri = (p) => ({ fsPath: p, path: p, toString: () => p });

const OBJETIVO = { 1: 'global', 2: 'workspace' };

module.exports = {
  registrado,
  guion,

  Uri: { joinPath: (base, ...p) => uri([base.fsPath, ...p].join('/')), parse: uri, file: uri },
  ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
  ExtensionMode: { Production: 1, Development: 2, Test: 3 },
  StatusBarAlignment: { Left: 1, Right: 2 },
  ProgressLocation: { Notification: 15 },
  ThemeColor: class { constructor(id) { this.id = id; } },

  window: {
    createOutputChannel: () => ({
      appendLine: (l) => registrado.mensajes.push(l), clear() {}, show() {}, dispose() {},
    }),
    registerWebviewViewProvider: (id, proveedor) => {
      registrado.vistas.push(id);
      registrado.proveedor = proveedor;
      return { dispose() {} };
    },
    createStatusBarItem: () => {
      const item = { text: '', tooltip: '', command: '', visible: false, show() { this.visible = true; }, hide() { this.visible = false; }, dispose() {} };
      registrado.barraEstado.push(item);
      return item;
    },
    showInformationMessage: async (m) => { registrado.mensajes.push(`INFO ${m}`); return guion.eleccion; },
    showWarningMessage: async (m) => { registrado.mensajes.push(`WARN ${m}`); return guion.eleccion; },
    showErrorMessage: async (m) => { registrado.mensajes.push(`ERROR ${m}`); return undefined; },
    showQuickPick: async (opciones) => { registrado.quickPick = opciones; return guion.eleccion; },
    showInputBox: async () => guion.escrito,
    showOpenDialog: async () => (guion.ficheros.length ? guion.ficheros.map(uri) : undefined),
    withProgress: async (_opciones, tarea) => tarea({ report() {} }),
  },

  commands: {
    registerCommand: (id, fn) => { registrado.comandos.push(id); registrado[id] = fn; return { dispose() {} }; },
    executeCommand: async (id, ...args) => { registrado.ejecutados.push({ id, args }); },
    getCommands: async () => ['workbench.action.reloadWindow', ...guion.comandosDeClaude],
  },

  RelativePattern: class { constructor(base, patron) { this.base = base; this.pattern = patron; registrado.vigilado = patron; } },

  workspace: {
    get workspaceFolders() { return guion.raiz ? [{ uri: uri(guion.raiz) }] : undefined; },
    onDidChangeConfiguration: () => ({ dispose() {} }),
    createFileSystemWatcher: (patron) => {
      const oyentes = { crear: null, cambiar: null, borrar: null };
      registrado.vigia = {
        patron: patron.pattern,
        // Para poder disparar un cambio desde la prueba.
        disparar: (ruta) => oyentes.cambiar && oyentes.cambiar(uri(ruta)),
      };
      return {
        onDidCreate: (f) => { oyentes.crear = f; },
        onDidChange: (f) => { oyentes.cambiar = f; },
        onDidDelete: (f) => { oyentes.borrar = f; },
        dispose() {},
      };
    },
    getConfiguration: () => ({
      get: (clave) => (clave in registrado.ajustes.workspace
        ? registrado.ajustes.workspace[clave]
        : registrado.ajustes.global[clave]),
      inspect: (clave) => ({
        globalValue: registrado.ajustes.global[clave],
        workspaceValue: registrado.ajustes.workspace[clave],
        // Un valor de fábrica cualquiera pero distinguible: lo que importa es
        // que la extensión lo lea de aquí y no se lo invente.
        defaultValue: `FÁBRICA:${clave}`,
      }),
      update: async (clave, valor, objetivo) => {
        if (guion.rechazaAjuste(clave, objetivo)) throw new Error(`${clave} no admite ese ámbito`);
        const donde = registrado.ajustes[OBJETIVO[objetivo] || 'global'];
        if (valor === undefined) delete donde[clave];
        else donde[clave] = valor;
      },
    }),
  },

  extensions: {
    getExtension: (id) => (guion.extensionesInstaladas.includes(id) ? { id, isActive: true } : undefined),
  },

  env: {
    clipboard: { writeText: async (t) => { registrado.portapapeles = t; } },
    openExternal: async (u) => { registrado.abiertos.push(u.fsPath || u.toString()); return true; },
  },
};
