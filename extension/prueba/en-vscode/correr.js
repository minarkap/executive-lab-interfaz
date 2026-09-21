// Arranca un VS Code de verdad y le pasa la suite de dentro.
//
// `@vscode/test-electron` se trae con `npx` en vez de declararlo como
// dependencia: este proyecto no lleva ninguna, y una que solo hace falta para
// probar no va a ser la primera. Es lo mismo que ya se hace con `vsce`.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runTests } = require('@vscode/test-electron');

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

  const datos = fs.mkdtempSync(path.join(os.tmpdir(), 'vsc-'));

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
      // La carpeta de mentira, como URI y no como ruta suelta: pasada a pelo,
      // el proceso de pruebas se la queda como si fuera su punto de entrada e
      // intenta ejecutarla. `--folder-uri` no deja lugar a dudas.
      //
      // Y sin `--disable-extensions`: eso apaga también la nuestra, que es la
      // que se viene a probar.
      launchArgs: [
        `--folder-uri=${new URL(`file://${empresa}`).href}`,
        // Sus datos, en una ruta corta. VS Code abre un socket dentro de esa
        // carpeta y el sistema no admite rutas de más de 103 caracteres para
        // eso; la de este proyecto ya se come casi todas ella sola.
        `--user-data-dir=${datos}`,
        `--extensions-dir=${path.join(datos, 'extensiones')}`,
        '--disable-gpu',
      ],
    });
  } catch (error) {
    console.error('La prueba en VS Code ha fallado:', error && error.message);
    process.exit(1);
  }
}

main();
