// Lo que solo se puede probar en Windows.
//
//   node extension/prueba/windows.js
//
// Corre en la máquina Windows de GitHub (`.github/workflows/windows.yml`), que
// para un repositorio público no cuesta nada. En cualquier otro sistema sale
// sin hacer nada: lo de aquí son justo las preguntas que un Mac no responde.
//
//   · el relevo de Node (C2) en Git Bash, que es con lo que Claude Code corre
//     los enganches en Windows, y en PowerShell y cmd;
//   · el freno de los raíles, enganchado como lo deja `aplicar.js` y pasado por
//     Git Bash, que deniega un `rm -rf` con el relevo como único `node`;
//   · qué Python elige la barra para los guiones de una herramienta (F4): `py
//     -3` primero, porque `python` puede ser el atajo que abre la Tienda.

const assert = require('node:assert');
const cp = require('node:child_process');
const fs = require('node:fs');
const Module = require('node:module');
const os = require('node:os');
const path = require('node:path');

if (process.platform !== 'win32') {
  console.log('SALTADA: esto es lo que solo se puede probar en Windows.');
  process.exit(0);
}

const RAIZ = path.join(__dirname, '..');
const resolver = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  if (pedido === 'vscode') return require.resolve('./vscode-falso.js');
  return resolver.call(this, pedido, ...resto);
};
const cargar = (m) => require(path.join(RAIZ, 'src', m));

const fallos = [];
async function comprobar(que, hacer) {
  try {
    const nota = await hacer();
    console.log(`  ✓ ${que}${nota ? ` — ${nota}` : ''}`);
  } catch (error) {
    fallos.push(que);
    console.log(`  ✗ ${que}\n    ${String(error && error.message).split('\n').join('\n    ')}`);
  }
}

// Un PATH sin ningún `node` de verdad, con el relevo delante: el ordenador de un
// alumno que solo instaló la extensión.
const relevo = cargar('relevo');
const entorno = cargar('entorno');
const carpetaDelRelevo = fs.mkdtempSync(path.join(os.tmpdir(), 'relevo-'));
relevo.escribirElRelevo(carpetaDelRelevo, process.execPath, 'win32');
const clavePath = Object.keys(process.env).find((k) => k.toLowerCase() === 'path') || 'Path';
const tieneNode = (dir) => ['node.exe', 'node.cmd', 'node'].some((n) => fs.existsSync(path.join(dir, n)));
const sinNode = String(process.env[clavePath] || '').split(path.delimiter).filter((d) => d && !tieneNode(d));
const conRelevo = { ...process.env, [clavePath]: [carpetaDelRelevo, ...sinNode].join(path.delimiter) };
const mismo = (a, b) => path.resolve(String(a).trim()).toLowerCase() === path.resolve(String(b).trim()).toLowerCase();

(async () => {
  console.log('\nLo que solo se puede probar en Windows\n');

  await comprobar('fuera del relevo no queda ningún node', () => {
    const r = cp.spawnSync('where', ['node'], { env: { ...process.env, [clavePath]: sinNode.join(path.delimiter) }, encoding: 'utf8' });
    assert.notEqual(r.status, 0, `sigue habiendo un node: ${r.stdout.trim()}`);
    return `${sinNode.length} carpetas en el PATH, ninguna con node`;
  });

  const bash = entorno.bash();
  await comprobar('la barra encuentra Git Bash', () => {
    assert.ok(bash && fs.existsSync(bash), `no hay bash donde lo busca la barra: ${bash}`);
    return bash;
  });

  await comprobar('el relevo, en Git Bash: command -v node es el relevo y lanza el Node de la barra', () => {
    const r = cp.spawnSync(bash, ['-c', 'command -v node; node -p process.execPath'], { env: conRelevo, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const [donde, cual] = r.stdout.trim().split(/\r?\n/);
    assert.match(donde, /relevo-/, `Git Bash encuentra otro node: ${donde}`);
    assert.ok(mismo(cual, process.execPath), `el relevo lanza otro Node: ${cual}`);
    return donde;
  });

  await comprobar('el relevo, en PowerShell', () => {
    const r = cp.spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'node -p process.execPath'], { env: conRelevo, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(mismo(r.stdout, process.execPath), `PowerShell lanza otro Node: ${r.stdout.trim()}`);
    return 'node.cmd';
  });

  await comprobar('el relevo, en cmd', () => {
    const r = cp.spawnSync('cmd.exe', ['/d', '/s', '/c', 'node -p process.execPath'], { env: conRelevo, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(mismo(r.stdout, process.execPath), `cmd lanza otro Node: ${r.stdout.trim()}`);
    return 'node.cmd';
  });

  await comprobar('el freno de los raíles deniega un rm -rf en Git Bash, con el relevo', () => {
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'freno-'));
    fs.mkdirSync(path.join(carpeta, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(carpeta, '.rsc.json'), JSON.stringify({ version: 1, targets: ['claude'] }));
    fs.writeFileSync(path.join(carpeta, '.claude', 'settings.json'), '{}\n');
    const puestos = cp.spawnSync(process.execPath, [path.join(RAIZ, 'media', 'railes', 'aplicar.js'), carpeta], { encoding: 'utf8' });
    assert.equal(puestos.status, 0, puestos.stderr);
    const ajustes = JSON.parse(fs.readFileSync(path.join(carpeta, '.claude', 'settings.json'), 'utf8'));
    const freno = (ajustes.hooks.PreToolUse || []).flatMap((e) => e.hooks || []).map((h) => h.command).find((o) => o.includes('/executive-lab/freno.mjs'));
    assert.ok(freno, 'los raíles no enganchan el freno');
    // Como lo corre Claude Code en Windows: Git Bash, y la carpeta en
    // CLAUDE_PROJECT_DIR con su ruta de Windows.
    const pasar = (orden) => cp.spawnSync(bash, ['-c', freno], {
      input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: orden } }),
      encoding: 'utf8',
      env: { ...conRelevo, CLAUDE_PROJECT_DIR: carpeta },
    });
    const peligrosa = pasar('rm -rf ./informes');
    assert.equal(peligrosa.status, 0, peligrosa.stderr);
    assert.match(peligrosa.stdout, /"permissionDecision":\s*"deny"/, `deja pasar un rm -rf: ${peligrosa.stdout}${peligrosa.stderr}`);
    assert.doesNotMatch(pasar('ls -la').stdout, /"deny"/, 'y frena también lo que no es peligroso');
    return 'deniega, y deja pasar lo demás';
  });

  await comprobar('el relevo se reconoce aunque la unidad llegue en otra caja', () => {
    // El almacén de la extensión llega a veces con la unidad en minúscula (`c:\\…`)
    // y otras en mayúscula. En Windows las rutas no distinguen: comparadas a pelo,
    // el relevo no se reconocía a sí mismo y la barra decía que ya había un node
    // (lo cazó la barra en un VS Code de Windows, 28-09-2026).
    const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'relevo-caja-'));
    relevo.escribirElRelevo(carpeta, process.execPath, 'win32');
    const otraCaja = carpeta.replace(/^([a-zA-Z]):/, (_, u) => `${u === u.toUpperCase() ? u.toLowerCase() : u.toUpperCase()}:`);
    const env = { [clavePath]: [otraCaja, ...sinNode].join(path.delimiter) };
    const puesto = relevo.asegurar({ carpeta, ejecutable: process.execPath, env, plataforma: 'win32' });
    assert.equal(puesto.modo, 'relevoVSCode', `toma su propio relevo por un node del sistema: ${JSON.stringify(puesto)}`);
    const veces = env[clavePath].split(path.delimiter).filter((d) => d.toLowerCase() === carpeta.toLowerCase()).length;
    assert.equal(veces, 1, `el relevo sale ${veces} veces en el PATH`);
    return `${otraCaja.slice(0, 2)} y ${carpeta.slice(0, 2)}, la misma carpeta`;
  });

  await comprobar('para los guiones en Python, la barra elige py -3', async () => {
    const conexiones = cargar('conexiones');
    const elegido = await conexiones.quePython();
    assert.ok(elegido, 'no encuentra ningún Python, y en esta máquina hay');
    assert.deepEqual([elegido.programa, ...elegido.antes], ['py', '-3'], `elige ${elegido.programa} ${elegido.antes.join(' ')}`);
    const r = cp.spawnSync(elegido.programa, [...elegido.antes, '-c', 'import sys; print(sys.version_info[0])'], { encoding: 'utf8' });
    assert.equal(r.stdout.trim(), '3');
    return 'py -3';
  });

  console.log(`\n${fallos.length ? `${fallos.length} fallos` : 'todo bien'}\n`);
  process.exit(fallos.length ? 1 : 0);
})();
