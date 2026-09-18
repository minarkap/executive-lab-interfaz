#!/usr/bin/env node
// El instalador de macOS, por dentro.
//
// Lo llama la app que el alumno abre con doble clic (instalar.applescript, que
// es quien enseña la ventana). Aquí no hay interfaz: se escriben los pasos en
// un fichero de progreso y la app los va leyendo.
//
//   node instalar.js --progreso /tmp/loquesea.txt
//   node instalar.js --progreso ... --seco     (no escribe nada; para probar)
//
// Qué hace, y qué NO hace
// -----------------------
// Deja las herramientas, el editor y el acceso directo. **No monta el arnés**:
// eso lo hace el panel la primera vez que se abre, con el wizard que ya existe
// (extension/src/arrancar.js), porque ahí las preguntas salen con nuestra
// tipografía y nuestros colores en vez de con las de Apple.
//
// Y nada de esto pide contraseña de administrador: todo vive dentro de la
// carpeta del alumno. Es la diferencia entre poder instalarlo en un portátil
// gestionado por el IT de su empresa y no poder.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Dentro del paquete, los módulos comunes viajan en la carga. En el repo
// todavía no hay carga, así que se cae a comun/ y esto se puede probar en seco.
const { escribirAjustes } = (() => {
  for (const donde of ['./carga/ajustes', '../comun/ajustes']) {
    try { return require(donde); } catch { /* el siguiente */ }
  }
  throw new Error('no encuentro ajustes.js');
})();

const AQUI = __dirname;
const CARGA = path.join(AQUI, 'carga');
const CASA = os.homedir();
const APP = path.join(CASA, 'Library', 'Application Support', 'ExecutiveLab');
const APLICACIONES = path.join(CASA, 'Applications');
const EDITOR = 'Visual Studio Code.app';
const DENTRO_DEL_EDITOR = path.join('Contents', 'Resources', 'app', 'bin', 'code');
const NOMBRE_DEL_ACCESO = 'Mi Empresa';
const NOMBRE_DE_LA_CARPETA = 'Mi trabajo';
const DESCARGA_DEL_EDITOR = 'https://update.code.visualstudio.com/latest/darwin-universal/stable';

const SECO = process.argv.includes('--seco');
// El Dock no vive en la carpeta personal, así que al probar contra una de
// mentira hay que decirle que no lo toque.
const SIN_DOCK = process.argv.includes('--sin-dock');

// ------------------------------------------------------------------ recado

const registro = [];
const anotar = (linea) => registro.push(`[${new Date().toISOString()}] ${linea}`);

const PASOS = 6;
let paso = 0;

// La app lee este fichero cada medio segundo. Una línea por paso, y la última
// dice cómo ha acabado.
function contar(texto) {
  paso += 1;
  anotar(`PASO ${paso}/${PASOS} ${texto}`);
  const fichero = argumento('progreso');
  if (!fichero) return;
  try {
    fs.appendFileSync(fichero, `PASO\t${paso}\t${PASOS}\t${texto}\n`);
  } catch { /* si no se puede escribir el progreso, la instalación sigue */ }
}

// Lo que pasa dentro de un paso y tarda: no avanza la barra, cambia el texto.
function detalle(texto) {
  anotar(`  ${texto}`);
  const fichero = argumento('progreso');
  if (!fichero) return;
  try {
    fs.appendFileSync(fichero, `DETALLE\t${texto}\n`);
  } catch { /* igual que arriba */ }
}

function terminar(bien, mensaje) {
  const fichero = argumento('progreso');
  if (fichero) {
    try {
      fs.appendFileSync(fichero, `FIN\t${bien ? 'ok' : 'error'}\t${mensaje || ''}\n`);
    } catch { /* igual que arriba */ }
  }

  const donde = path.join(os.tmpdir(), 'executive-lab-instalacion.log');
  try {
    fs.writeFileSync(donde, `${registro.join('\n')}\n`);
  } catch { /* nada que hacer */ }
  process.exit(bien ? 0 : 1);
}

function argumento(nombre, porDefecto = null) {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : porDefecto;
}

function correr(programa, args, opciones = {}) {
  anotar(`> ${path.basename(programa)} ${args.join(' ').slice(0, 300)}`);
  if (SECO) return { codigo: 0, salida: '(en seco)' };
  const r = spawnSync(programa, args, { encoding: 'utf8', ...opciones });
  const salida = `${r.stdout || ''}${r.stderr || ''}`;
  anotar(r.error ? `ERROR ${r.error.message}` : salida.trim().slice(0, 500) || '(sin salida)');
  return { codigo: r.error ? -1 : r.status, salida };
}

// -------------------------------------------------------------------- pasos

// 1. Las herramientas: Node, el arnés, los raíles y la extensión, dentro de la
// carpeta del alumno. Se sobrescribe sin preguntar: es nuestro, no suyo.
function copiarLasHerramientas() {
  contar('Dejando las herramientas en su sitio');
  if (SECO) return;
  if (!fs.existsSync(CARGA)) throw new Error('el paquete viene sin carga');

  fs.mkdirSync(APP, { recursive: true });
  for (const pieza of fs.readdirSync(CARGA)) {
    fs.cpSync(path.join(CARGA, pieza), path.join(APP, pieza), { recursive: true, force: true });
  }
  // cpSync respeta los permisos, pero el bit de ejecución del Node portable es
  // lo único que no se puede perder sin que todo lo demás falle.
  for (const binario of [path.join(APP, 'runtime', 'bin', 'node'), path.join(APP, 'runtime', 'bin', 'npm')]) {
    if (fs.existsSync(binario)) fs.chmodSync(binario, 0o755);
  }
  anotar(`Herramientas en ${APP}`);
}

// 2. El editor. Si ya lo tiene, no se descargan 250 MB para nada.
function elEditor() {
  const suyo = [path.join(APLICACIONES, EDITOR), path.join('/Applications', EDITOR)].find((d) => fs.existsSync(d));
  if (suyo) {
    contar('El editor ya está puesto');
    anotar(`Editor encontrado en ${suyo}`);
    return suyo;
  }

  contar('Descargando el editor (esto es lo que más tarda)');
  const zip = path.join(os.tmpdir(), 'executive-lab-editor.zip');

  let bajado = false;
  for (let intento = 1; intento <= 3 && !bajado; intento += 1) {
    // curl viene de serie en macOS. --fail para que un 500 no deje un zip de
    // mentira, y --retry para los cortes de red de una oficina.
    const r = correr('/usr/bin/curl', ['-fL', '--retry', '2', '--retry-delay', '2', '-o', zip, DESCARGA_DEL_EDITOR], { timeout: 900000 });
    bajado = r.codigo === 0 && (SECO || (fs.existsSync(zip) && fs.statSync(zip).size > 50 * 1024 * 1024));
    if (!bajado) detalle(`La descarga se ha cortado; probando otra vez (${intento} de 3)`);
  }
  if (!bajado) throw new Error('no he podido descargar el editor');

  detalle('Descomprimiendo el editor');
  fs.mkdirSync(APLICACIONES, { recursive: true });
  // ditto y no unzip: es lo que respeta la firma de la app de Microsoft.
  if (correr('/usr/bin/ditto', ['-x', '-k', zip, APLICACIONES]).codigo !== 0) {
    throw new Error('el editor no se ha podido descomprimir');
  }
  try { fs.rmSync(zip, { force: true }); } catch { /* da igual */ }

  const destino = path.join(APLICACIONES, EDITOR);
  if (!SECO && !fs.existsSync(destino)) throw new Error('el editor no ha quedado donde debía');
  return destino;
}

// 3. Las dos extensiones: la del asistente y la nuestra.
function lasPiezasDelAsistente(editor) {
  contar('Poniendo el asistente');
  const cli = path.join(editor, DENTRO_DEL_EDITOR);
  if (!SECO && !fs.existsSync(cli)) throw new Error('el editor no trae su línea de comandos');

  let bien = correr(cli, ['--install-extension', 'anthropic.claude-code', '--force'], { timeout: 300000 }).codigo === 0;

  const vsix = path.join(APP, 'executive-lab.vsix');
  if (fs.existsSync(vsix) || SECO) {
    bien = correr(cli, ['--install-extension', vsix, '--force'], { timeout: 300000 }).codigo === 0 && bien;
  } else {
    anotar('AVISO: no encuentro executive-lab.vsix en la carga.');
    bien = false;
  }
  if (!bien) throw new Error('no se han podido poner las piezas del asistente');
}

// 4. Su carpeta, vacía, y las cinco claves de ámbito de programa. El resto del
// disfraz va en la carpeta y lo pone el panel.
function suSitio() {
  contar('Preparando tu carpeta');
  const documentos = [path.join(CASA, 'Documentos'), path.join(CASA, 'Documents')].find((d) => fs.existsSync(d)) || CASA;
  const carpeta = path.join(documentos, NOMBRE_DE_LA_CARPETA);
  if (!SECO) fs.mkdirSync(carpeta, { recursive: true });
  anotar(`Carpeta de trabajo: ${carpeta}`);

  const plantilla = path.join(CARGA, 'disfraz.json');
  if (fs.existsSync(plantilla) && !SECO) {
    const disfraz = JSON.parse(fs.readFileSync(plantilla, 'utf8'));
    const soloDelEditor = [
      'security.workspace.trust.enabled',
      'update.mode',
      'update.showReleaseNotes',
      'telemetry.telemetryLevel',
      'extensions.ignoreRecommendations',
    ];
    const claves = {};
    for (const clave of soloDelEditor) if (clave in disfraz) claves[clave] = disfraz[clave];
    escribirAjustes(path.join(CASA, 'Library', 'Application Support', 'Code', 'User', 'settings.json'),
      claves, 'los ajustes del editor', anotar);
  }

  ponerloEnElArranqueDelShell();
  return carpeta;
}

// El otro cinturón de lo de siempre: que los enganches del arnés encuentren
// nuestro Node. El primero es la ruta completa escrita en los enganches, pero
// un `sync` del arnés puede volver a dejar "node" a secas, y entonces manda el
// PATH. macOS resuelve el shell de login al arrancar el editor, así que una
// línea aquí llega hasta donde hace falta.
//
// Bloque delimitado y comentado: el desinstalador lo quita entero.
const MARCA_INICIO = '# >>> Executive Lab >>>';
const MARCA_FIN = '# <<< Executive Lab <<<';

function ponerloEnElArranqueDelShell() {
  const bloque = [
    MARCA_INICIO,
    '# Lo pone el instalador de Executive Lab. Se quita solo al desinstalar.',
    `export EXECUTIVE_LAB_HOME="${APP}"`,
    'export PATH="$EXECUTIVE_LAB_HOME/runtime/bin:$PATH"',
    MARCA_FIN,
    '',
  ].join('\n');

  for (const nombre of ['.zprofile', '.bash_profile']) {
    const fichero = path.join(CASA, nombre);
    let texto = '';
    try {
      texto = fs.existsSync(fichero) ? fs.readFileSync(fichero, 'utf8') : '';
    } catch {
      continue;
    }

    const limpio = texto.includes(MARCA_INICIO)
      ? texto.replace(new RegExp(`${MARCA_INICIO}[\\s\\S]*?${MARCA_FIN}\\n?`), '')
      : texto;
    const nuevo = `${limpio.replace(/\s*$/, '')}\n\n${bloque}`;
    if (!SECO) fs.writeFileSync(fichero, nuevo.replace(/^\n+/, ''));
    anotar(`Arranque del shell: ${nombre}`);
  }
}

// 5. El acceso directo. Es una app de las de siempre: un Info.plist y un
// script de dos líneas. Al crearse aquí no lleva cuarentena, así que se abre
// sin que Gatekeeper diga nada aunque no esté firmada.
function elAccesoDirecto(editor, carpeta) {
  contar('Dejándote el acceso directo');
  const app = path.join(APLICACIONES, `${NOMBRE_DEL_ACCESO}.app`);
  if (SECO) return app;

  fs.rmSync(app, { recursive: true, force: true });
  fs.mkdirSync(path.join(app, 'Contents', 'MacOS'), { recursive: true });
  fs.mkdirSync(path.join(app, 'Contents', 'Resources'), { recursive: true });

  const icono = path.join(CARGA, 'executivelab.icns');
  const tieneIcono = fs.existsSync(icono);
  if (tieneIcono) fs.copyFileSync(icono, path.join(app, 'Contents', 'Resources', 'executivelab.icns'));

  fs.writeFileSync(path.join(app, 'Contents', 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>${NOMBRE_DEL_ACCESO}</string>
  <key>CFBundleDisplayName</key><string>${NOMBRE_DEL_ACCESO}</string>
  <key>CFBundleIdentifier</key><string>ai.executivelab.abrir</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>abrir</string>
  ${tieneIcono ? '<key>CFBundleIconFile</key><string>executivelab</string>' : ''}
  <key>LSMinimumSystemVersion</key><string>12.0</string>
</dict>
</plist>
`);

  const abrir = path.join(app, 'Contents', 'MacOS', 'abrir');
  fs.writeFileSync(abrir, `#!/bin/bash
# Abre el espacio de trabajo. Lo escribió el instalador de Executive Lab.
export EXECUTIVE_LAB_HOME=${JSON.stringify(APP)}
exec /usr/bin/open -a ${JSON.stringify(editor)} ${JSON.stringify(carpeta)}
`);
  fs.chmodSync(abrir, 0o755);

  // Sin esto, el Finder puede seguir enseñando el icono genérico de la app
  // anterior con el mismo nombre.
  correr('/usr/bin/touch', [app]);
  return app;
}

// 6. Al Dock, que es donde lo va a buscar. Si el Dock no se deja, no pasa
// nada: la app está en Aplicaciones y se abre igual.
function alDock(app) {
  contar('Dejándolo a mano en el Dock');
  if (SECO || SIN_DOCK) return;

  const entrada = `<dict><key>tile-data</key><dict><key>file-data</key><dict>`
    + `<key>_CFURLString</key><string>${app}</string><key>_CFURLStringType</key><integer>0</integer>`
    + `</dict></dict></dict>`;

  const yaEsta = correr('/usr/bin/defaults', ['read', 'com.apple.dock', 'persistent-apps']).salida.includes(app);
  if (yaEsta) {
    anotar('Ya estaba en el Dock.');
    return;
  }
  if (correr('/usr/bin/defaults', ['write', 'com.apple.dock', 'persistent-apps', '-array-add', entrada]).codigo === 0) {
    correr('/usr/bin/killall', ['Dock']);
  }
}

// --------------------------------------------------------------------- main

function main() {
  anotar(`Executive Lab · macOS ${os.release()} · ${process.arch} · node ${process.version}`);

  copiarLasHerramientas();
  const editor = elEditor();
  lasPiezasDelAsistente(editor);
  const carpeta = suSitio();
  const acceso = elAccesoDirecto(editor, carpeta);
  alDock(acceso);

  anotar('Instalación terminada.');
  terminar(true, acceso);
}

try {
  main();
} catch (error) {
  anotar(`ERROR ${error && error.stack ? error.stack : error}`);
  terminar(false, error && error.message ? error.message : String(error));
}
