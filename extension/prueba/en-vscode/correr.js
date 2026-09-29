// Arranca un VS Code de verdad y le pasa la suite de dentro.
//
// `@vscode/test-electron` se trae con `npx` en vez de declararlo como
// dependencia: este proyecto no lleva ninguna, y una que solo hace falta para
// probar no va a ser la primera. Es lo mismo que ya se hace con `vsce`.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const cp = require('node:child_process');
const { runTests } = require('@vscode/test-electron');

// ── Un paquete de verdad para «Actualizar ahora» (decisión 133) ─────────
//
// Instalar lo que baja la barra solo se había fingido: en `humo.js`, el editor
// es de mentira y dice que sí a todo. Aquí se hace un `.vsix` de verdad, con
// `vsce` como el de la barra, de una extensión de prueba que no hace nada, y
// el editor de verdad lo tiene que instalar. Se llama como los de las
// releases (`executive-lab-<versión>.vsix`), que es lo único que mira la barra
// del nombre.
function unPaqueteDePrueba(datos) {
  const carpeta = path.join(datos, 'paquete-de-prueba');
  fs.mkdirSync(carpeta, { recursive: true });
  fs.writeFileSync(path.join(carpeta, 'package.json'), JSON.stringify({
    name: 'prueba-de-actualizar',
    displayName: 'Prueba de actualizar',
    description: 'La instala la prueba de «Actualizar ahora» en un VS Code de prueba.',
    publisher: 'executivelab',
    version: '99.0.0',
    engines: { vscode: '^1.98.0' },
  }, null, 2));
  fs.writeFileSync(path.join(carpeta, 'README.md'), '# Prueba de actualizar\n\nLa instala una prueba y no hace nada.\n');
  const fuera = path.join(datos, 'executive-lab-99.0.0.vsix');
  // En Windows, `npx` es un `.cmd`, y un `.cmd` solo se lanza con consola.
  const enWindows = process.platform === 'win32';
  cp.execFileSync(enWindows ? 'npx.cmd' : 'npx',
    ['--yes', '@vscode/vsce', 'package', '--out', fuera, '--allow-missing-repository', '--skip-license'],
    { cwd: carpeta, stdio: 'pipe', shell: enWindows });
  return fuera;
}

async function main() {
  const extension = path.resolve(__dirname, '..', '..');
  const empresa = require('../empresa-falsa').montar();

  // Hay entornos —el de un agente, sin ir más lejos— que traen puesto
  // `ELECTRON_RUN_AS_NODE`. Con eso, el binario de VS Code deja de ser VS Code
  // y se comporta como un Node pelado: se traga el primer argumento como si
  // fuera un fichero que ejecutar y rechaza todos los demás. Se ve raro de
  // narices —«bad option: --extensionTestsPath»— y no tiene nada que ver con
  // la prueba, así que se quita antes de arrancar.
  delete process.env.ELECTRON_RUN_AS_NODE;
  // Y lo mismo con lo que deja el anfitrión de extensiones en sus hijos
  // (`VSCODE_IPC_HOOK`, `VSCODE_ESM_ENTRYPOINT`, `VSCODE_PID`…): lanzada desde
  // un agente que vive dentro de un VS Code, esta prueba se los pasaba al
  // editor de prueba, que los tomaba por suyos.
  for (const clave of Object.keys(process.env)) if (clave.startsWith('VSCODE_')) delete process.env[clave];

  // ── Sin Node, como en el ordenador de un alumno (T032 (2)) ────────────
  //
  // Los enganches del arnés se escriben como `node …`, y un alumno no suele
  // tener Node. La barra pone entonces su relevo (`relevo.js`) el primero del
  // PATH. Para medirlo en un editor de verdad, el editor arranca con un PATH
  // sin ningún `node`, y `--force-disable-user-env` le impide ir a buscar
  // otro al arranque del shell, que es lo que hace en macOS cuando no se abre
  // desde una terminal.
  const tieneNode = (dir) => ['node', 'node.exe'].some((n) => fs.existsSync(path.join(dir, n)));
  const sinNode = (process.env.PATH || '').split(path.delimiter).filter((dir) => dir && !tieneNode(dir)).join(path.delimiter);

  const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'vsc-'));

  // Y sin la app del instalador, como quien solo instaló la extensión, que es
  // quien de verdad necesita el relevo: con la app, el Node va dentro. Una
  // carpeta vacía en `EXECUTIVE_LAB_HOME` le dice a la barra que no hay app,
  // y así la prueba no depende de lo que haya instalado en el ordenador de
  // quien la corre (la primera vez, el relevo lanzaba el Node de una app de
  // prueba que había en este Mac).
  const sinApp = path.join(datos, 'sin-app');
  fs.mkdirSync(sinApp);
  const extensiones = path.join(datos, 'extensiones');
  const paquete = unPaqueteDePrueba(datos);

  // ── El editor descargado NO vive dentro del proyecto ──────────────────
  //
  // Por defecto `@vscode/test-electron` lo deja en `.vscode-test/` al lado del
  // código: 900 MB de un VS Code entero, dentro de la carpeta que el arnés
  // escanea para decidir qué es este proyecto. `scanProject` de RSC no lee el
  // `.gitignore` —tiene su propia lista— así que se leía todo: y entre las
  // dependencias de la extensión de Copilot que viene dentro hay `react`.
  //
  // Resultado, comprobado el 21-09-2026: el plan que RSC propuso para este
  // repositorio traía `skill/react`, dos ayudantes de React y tres comandos de
  // React, y las señales de complejidad «authentication, external-integrations,
  // persistence» salían de las rutas del propio editor. Un plan construido
  // sobre evidencia que no es de este proyecto.
  const cacheFueraDelProyecto = path.join(os.homedir(), '.cache', 'executive-lab-vscode-test');
  fs.mkdirSync(cacheFueraDelProyecto, { recursive: true });

  try {
    await runTests({
      cachePath: cacheFueraDelProyecto,
      extensionDevelopmentPath: extension,
      extensionTestsPath: path.resolve(__dirname, 'suite.js'),
      extensionTestsEnv: {
        PATH: sinNode,
        EXECUTIVE_LAB_HOME: sinApp,
        EXECUTIVE_LAB_PRUEBA_SIN_NODE: '1',
        EXECUTIVE_LAB_PRUEBA_PAQUETE: paquete,
        EXECUTIVE_LAB_PRUEBA_EXTENSIONES: extensiones,
      },
      // La carpeta de mentira, como URI y no como ruta suelta: pasada a pelo,
      // el proceso de pruebas se la queda como si fuera su punto de entrada e
      // intenta ejecutarla. `--folder-uri` no deja lugar a dudas.
      //
      // Y sin `--disable-extensions`: eso apaga también la nuestra, que es la
      // que se viene a probar.
      launchArgs: [
        // Con `pathToFileURL`: escrita a mano, en Windows salía `file://C:\\…`, que no
        // es una URI.
        `--folder-uri=${pathToFileURL(empresa).href}`,
        // Sus datos, en una ruta corta. VS Code abre un socket dentro de esa
        // carpeta y el sistema no admite rutas de más de 103 caracteres para
        // eso; la de este proyecto ya se come casi todas ella sola.
        `--user-data-dir=${datos}`,
        `--extensions-dir=${extensiones}`,
        '--disable-gpu',
        '--force-disable-user-env',
      ],
    });
  } catch (error) {
    console.error('La prueba en VS Code ha fallado:', error && error.message);
    process.exit(1);
  }
}

main();
