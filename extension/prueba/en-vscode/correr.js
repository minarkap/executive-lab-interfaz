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

  try {
    await runTests({
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
