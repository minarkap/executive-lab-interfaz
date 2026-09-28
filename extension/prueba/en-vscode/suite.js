// Lo que corre DENTRO del VS Code de verdad.
//
// No comprueba cómo se ve: eso lo hacen las comprobaciones de contraste de
// `humo.js`, que pueden calcularlo sin pintar nada. Aquí se comprueba lo que
// solo se puede saber con un editor delante — que la extensión arranca, que
// todos sus comandos existen y que ninguno revienta al ejecutarlo.

const assert = require('node:assert');
const path = require('node:path');
const vscode = require('vscode');

const ID = 'executivelab.arnes-ui';

// Los que abren un diálogo del sistema y se quedarían esperando a que alguien
// pulse algo. Se comprueba que existen, pero no se ejecutan: un diálogo modal
// en una prueba sin nadie delante no se cierra nunca.
//
// Esta lista se comprobó a base de que la prueba se colgara. `ponerLaCara` abre
// una caja de texto y fue la primera en hacerlo.
const PIDEN_ALGO = new Set([
  'executiveLab.elegirCarpeta',
  'executiveLab.documentos',
  'executiveLab.empezarEmpresa',
  'executiveLab.ponerLaCara',
  // Estos tres preguntan antes de tocar la ventana entera, y hacen bien:
  // cambiar el aspecto de todas las ventanas de alguien no se hace a la
  // callada. Los encontró esta misma prueba, colgada esperando una respuesta.
  'executiveLab.verEditorCompleto',
  'executiveLab.modoSencillo',
  'executiveLab.quitarDeTodo',
]);

// Y por si aparece otro: ninguno puede tardar más de esto. Mejor un fallo que
// dice "este se queda colgado" que una prueba que no termina nunca.
const PACIENCIA = 8000;

const conReloj = (promesa, comando) => Promise.race([
  Promise.resolve(promesa),
  new Promise((_, mal) => setTimeout(() => mal(new Error(`${comando} se queda esperando a alguien`)), PACIENCIA)),
]);

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

async function run() {
  const fallos = [];
  const bien = (que) => console.log(`  ✓ ${que}`);
  const comprobar = async (que, hacer) => {
    try {
      const nota = await hacer();
      bien(nota ? `${que} — ${nota}` : que);
    } catch (error) {
      fallos.push(`${que}: ${error && error.message}`);
      console.log(`  ✗ ${que}\n    ${error && error.message}`);
    }
  };

  console.log('\nLa barra, en un VS Code de verdad\n');

  await comprobar('la extensión está y arranca', async () => {
    const suya = vscode.extensions.getExtension(ID);
    assert.ok(suya, `no se encuentra ${ID}`);
    await suya.activate();
    assert.equal(suya.isActive, true);
    return suya.packageJSON.version;
  });

  await comprobar('hay una carpeta abierta', () => {
    const carpetas = vscode.workspace.workspaceFolders;
    assert.ok(carpetas && carpetas.length, 'sin carpeta la barra no tiene nada que enseñar');
    return path.basename(carpetas[0].uri.fsPath);
  });

  const delManifiesto = vscode.extensions.getExtension(ID).packageJSON.contributes.commands.map((c) => c.command);

  await comprobar('todos los comandos del manifiesto están registrados de verdad', async () => {
    const registrados = new Set(await vscode.commands.getCommands(true));
    const faltan = delManifiesto.filter((c) => !registrados.has(c));
    assert.deepEqual(faltan, [], `el editor no conoce: ${faltan.join(', ')}`);
    return `${delManifiesto.length} comandos`;
  });

  await comprobar('ninguno revienta al ejecutarlo', async () => {
    const rotos = [];
    for (const comando of delManifiesto) {
      if (PIDEN_ALGO.has(comando)) continue;
      try {
        await conReloj(vscode.commands.executeCommand(comando), comando);
        await esperar(60);
      } catch (error) {
        rotos.push(`${comando} (${error && error.message})`);
      }
    }
    assert.deepEqual(rotos, [], `revientan: ${rotos.join(' · ')}`);
    return `${delManifiesto.length - PIDEN_ALGO.size} ejecutados`;
  });

  // Abrir un documento al lado. Es el caso que los dobles no pueden coger,
  // porque el doble siempre dice que sí.
  //
  // Y lo que enseñó esta prueba: `markdown.showPreviewToSide` **puede no estar
  // registrado todavía**. Lo trae una extensión de serie que el editor no
  // despierta hasta que hace falta, así que comprobar si el comando existe no
  // dice nada. Lo que sí dice algo es abrirlo de verdad y ver que aparece algo.
  await comprobar('un documento se abre al lado de verdad', async () => {
    const carpetas = vscode.workspace.workspaceFolders;
    const uri = vscode.Uri.joinPath(carpetas[0].uri, '02-DOCS', 'wiki', 'facturacion', 'ciclo.md');
    await vscode.workspace.fs.stat(uri);

    let como = 'compuesto';
    try {
      await conReloj(vscode.commands.executeCommand('markdown.showPreviewToSide', uri), 'la vista de markdown');
    } catch {
      // El mismo respaldo que usa la barra cuando esa vista no está.
      await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.Beside, preview: true });
      como = 'en crudo, con el respaldo';
    }
    await esperar(400);
    assert.ok(vscode.window.tabGroups.all.some((g) => g.tabs.length), 'no se ha abierto nada');
    return como;
  });

  await comprobar('los ajustes se escriben en el ámbito que toca', async () => {
    const config = vscode.workspace.getConfiguration();
    await config.update('executiveLab.guardarSolo', 1, vscode.ConfigurationTarget.Workspace);
    assert.equal(vscode.workspace.getConfiguration().get('executiveLab.guardarSolo'), 1);
    await config.update('executiveLab.guardarSolo', undefined, vscode.ConfigurationTarget.Workspace);
    return 'por carpeta, no global';
  });

  // El relevo de Node (C2, T032 (2)). `correr.js` arranca el editor con un
  // PATH sin ningún `node`, como el ordenador de un alumno. Lo que solo se
  // puede medir aquí: que el relevo que pone la barra al abrirse va el primero
  // del PATH del anfitrión de extensiones —el que comparten todas, también la
  // del asistente—, que un proceso hijo lo hereda y encuentra con él un Node, y
  // que un enganche escrito como `node …` corre con él y frena de verdad.
  await comprobar('sin node en el ordenador, el relevo va el primero y los hijos lo heredan', async () => {
    if (process.env.EXECUTIVE_LAB_PRUEBA_SIN_NODE !== '1') return 'SALTADA: el editor no se arrancó sin node';
    const cp = require('node:child_process');
    const fs = require('node:fs');
    const os = require('node:os');
    const raiz = vscode.extensions.getExtension(ID).extensionPath;
    const relevo = require(path.join(raiz, 'src', 'relevo.js'));

    const puesto = relevo.comoEsta();
    assert.equal(puesto.modo, 'relevoVSCode', `sin node, la barra no pone el relevo: ${JSON.stringify(puesto)}`);
    assert.equal(process.env.PATH.split(path.delimiter)[0], puesto.carpeta, 'el relevo no va el primero del PATH');

    // Un hijo que no dice nada de su entorno hereda el del anfitrión: es como
    // lanza el asistente su proceso, y como ese proceso lanza los enganches.
    // Y el relevo lanza el mismo Node con el que la barra corre RSC
    // (`entorno.node()`): el de la app, si un instalador la dejó, y si no el
    // de VS Code. La primera vez se exigió aquí el de VS Code, y en un Mac con
    // una app de prueba instalada la comprobación falló por lo que está bien.
    // Y no se comparan rutas: el `node` de la app es un guion que elige la
    // arquitectura y lanza `node-arm64`. Se compara lo que corre de verdad por
    // los dos caminos.
    const entorno = require(path.join(raiz, 'src', 'entorno.js'));
    const [donde, cual] = cp.execFileSync('/bin/sh', ['-c', 'command -v node; node -p process.execPath'], { encoding: 'utf8' }).trim().split('\n');
    assert.equal(path.dirname(donde), puesto.carpeta, `el hijo encuentra otro node: ${donde}`);
    const directo = cp.execFileSync(entorno.node(), ['-p', 'process.execPath'], { encoding: 'utf8', env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } }).trim();
    assert.equal(cual, directo, `el relevo lanza otro Node: ${cual}, y la barra usa ${directo}`);
    const deQuien = entorno.node() === process.execPath ? 'el de VS Code' : 'el de la app';

    // Y el freno, como lo engancha `aplicar.js` —corriendo también con el
    // relevo— y como lo corre Claude Code: con `sh -c` y la carpeta en
    // CLAUDE_PROJECT_DIR.
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'relevo-'));
    fs.mkdirSync(path.join(carpeta, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    fs.writeFileSync(path.join(carpeta, '.claude', 'settings.json'), '{}\n');
    cp.execFileSync('/bin/sh', ['-c', 'node "$1" "$2"', 'sh', path.join(raiz, 'media', 'railes', 'aplicar.js'), carpeta], { encoding: 'utf8' });
    const ajustes = JSON.parse(fs.readFileSync(path.join(carpeta, '.claude', 'settings.json'), 'utf8'));
    const freno = (ajustes.hooks.PreToolUse || []).flatMap((e) => e.hooks || []).map((h) => h.command).find((o) => o.includes('/executive-lab/freno.mjs'));
    assert.ok(freno, 'los raíles no enganchan el freno');
    const pasar = (orden) => cp.spawnSync('/bin/sh', ['-c', freno], {
      input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: orden } }),
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: carpeta },
    });
    const peligrosa = pasar('rm -rf ./informes');
    assert.equal(peligrosa.status, 0, peligrosa.stderr);
    assert.match(peligrosa.stdout, /"permissionDecision":\s*"deny"/, 'con el relevo, el freno deja pasar un rm -rf');
    assert.doesNotMatch(pasar('ls -la').stdout, /"deny"/, 'y frena también lo que no es peligroso');
    fs.rmSync(carpeta, { recursive: true, force: true });
    return `el relevo lanza ${deQuien}, y el freno deniega`;
  });

  console.log(`\n${fallos.length ? `${fallos.length} fallos` : 'todo bien'}\n`);
  if (fallos.length) throw new Error(fallos.join(' | '));
}

module.exports = { run };
