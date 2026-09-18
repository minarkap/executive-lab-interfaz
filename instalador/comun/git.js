// Comprobar si hay git, y ponerlo cuando no lo hay.
//
// Vive aquí, en comun/, porque lo usan los dos: `preparar.js` al montar la
// carpeta desde el instalador, y la barra lateral cuando alguien instaló solo
// la extensión. Mismo sitio y misma razón que historial.js.
//
// ── Por qué git es obligatorio ───────────────────────────────────────────
//
// Durante un tiempo se trató como opcional: si no estaba, las copias de
// seguridad se hacían con una biblioteca de JavaScript que viajaba dentro. Era
// mentira por dos sitios. Primero, montar la carpeta hace `git init` antes que
// nada y aborta si falla. Y segundo, el arnés usa git por su cuenta —
// `git check-ignore` al instalar, los verify.sh de varias habilidades, y el
// registro de continuación, que se indexa por rama y por HEAD—. Sin git el
// arnés funcionaba a medias y sin decirlo.
//
// ── Por qué no lo llevamos dentro ────────────────────────────────────────
//
// Un git empaquetado solo lo ve quien lo invoque por su sitio exacto, y los
// scripts del arnés lo llaman por nombre. Hace falta un git instalado de
// verdad. Así que no distribuimos ninguno: se lanza el instalador oficial de
// cada sistema, que además está firmado por quien lo hace y no por nosotros.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');

const ES_WINDOWS = process.platform === 'win32';
const ES_MAC = process.platform === 'darwin';

// Dónde vive un git de verdad en un Mac. `/usr/bin/git` NO está en la lista a
// propósito: existe SIEMPRE, también donde git no está instalado, y al
// invocarlo abre el diálogo de las herramientas de línea de comandos de Apple.
// Para comprobar no se ejecuta nunca; se mira el disco y se le pregunta a
// `xcode-select -p`, que responde sin abrir nada.
const GITS_DE_MAC = [
  '/Library/Developer/CommandLineTools/usr/bin/git',
  '/opt/homebrew/bin/git',
  '/usr/local/bin/git',
  '/usr/local/git/bin/git',
];

// La última versión estable de Git para Windows, preguntada a su propio
// proyecto. Aquí la versión no va clavada como la del arnés: git no cambia lo
// que el alumno ve, y fijarla significaría repartir uno viejo durante meses.
const ULTIMO_DE_WINDOWS = 'https://api.github.com/repos/git-for-windows/git/releases/latest';

// Solo el instalador de 64 bits. `PortableGit-…7z.exe` y `MinGit-…zip` quedan
// fuera: son copias que se descomprimen, y una copia es justo lo que no sirve.
const ES_EL_INSTALADOR = /^Git-[\d.]+-64-bit\.exe$/;

// Sin ruido y sin preguntas. Al no elevar, Inno instala para este usuario y no
// pide administrador. PENDIENTE de confirmar en un Windows limpio con una
// cuenta sin permisos: es el único paso de todo esto que no se puede probar
// desde un Mac.
const EN_SILENCIO = ['/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/SUPPRESSMSGBOXES'];

const CADA = 5000;
const ESPERA_MAC = 45 * 60 * 1000;
const ESPERA_WINDOWS = 20 * 60 * 1000;

function correr(programa, args, tiempoMaximo = 20000) {
  return new Promise((resolver) => {
    const proceso = execFile(programa, args, { encoding: 'utf8', timeout: tiempoMaximo, windowsHide: true },
      (error, salida) => resolver({ ok: !error, salida: (salida || '').trim() }));
    proceso.on('error', () => resolver({ ok: false, salida: '' }));
  });
}

// ------------------------------------------------------------ comprobar

async function hayEnMac(opciones = {}) {
  const suyo = opciones.git && path.isAbsolute(opciones.git) ? [opciones.git] : [];
  if ([...suyo, ...GITS_DE_MAC].some((donde) => fs.existsSync(donde))) return true;

  const dev = await correr('/usr/bin/xcode-select', ['-p']);
  return Boolean(dev.ok && dev.salida && fs.existsSync(path.join(dev.salida, 'usr', 'bin', 'git')));
}

// En Windows y en Linux preguntar es gratis: no hay ningún señuelo que disparar.
async function hayEnElResto(opciones = {}) {
  const cual = opciones.git || (ES_WINDOWS ? 'git.exe' : 'git');
  return (await correr(cual, ['--version'])).ok;
}

const hay = (opciones) => (ES_MAC ? hayEnMac(opciones) : hayEnElResto(opciones));

// ------------------------------------------------------------- instalar

const NO_SE_PUDO = 'No he podido descargarla. Mira que haya conexión y vuelve a intentarlo.';
const TARDA_DEMASIADO = 'Se está haciendo muy largo. Déjalo terminar y vuelve a abrir esto dentro de un rato.';

async function esperarA(cuanto, opciones, avisar) {
  const hasta = Date.now() + cuanto;
  while (Date.now() < hasta) {
    await new Promise((sigue) => { setTimeout(sigue, CADA); });
    if (await hay(opciones)) return { ok: true };
  }
  avisar(TARDA_DEMASIADO);
  return { ok: false, mensaje: TARDA_DEMASIADO };
}

// macOS. `xcode-select --install` vuelve enseguida: el diálogo es de Apple y va
// por su cuenta, así que lo único que se puede hacer es esperar a que aparezca
// el git. Devuelve error cuando ya estaba, caso que aquí no puede darse.
async function instalarEnMac(opciones, avisar) {
  avisar('Tu ordenador te va a pedir permiso para instalarla. Dile que sí y espera: puede tardar un buen rato.');
  await correr('/usr/bin/xcode-select', ['--install'], 30000);
  return esperarA(ESPERA_MAC, opciones, avisar);
}

async function bajarElInstalador() {
  const respuesta = await fetch(ULTIMO_DE_WINDOWS, { headers: { Accept: 'application/vnd.github+json' } });
  if (!respuesta.ok) return null;

  const cual = ((await respuesta.json()).assets || []).find((a) => ES_EL_INSTALADOR.test(a.name));
  if (!cual) return null;

  const datos = await fetch(cual.browser_download_url);
  if (!datos.ok) return null;

  const fichero = path.join(os.tmpdir(), cual.name);
  fs.writeFileSync(fichero, Buffer.from(await datos.arrayBuffer()));
  return fichero;
}

async function instalarEnWindows(opciones, avisar) {
  avisar('Descargando la pieza que falta…');

  let instalador = null;
  try {
    instalador = await bajarElInstalador();
  } catch { /* sin red, o GitHub caído: se trata igual que no encontrarlo */ }

  if (!instalador) {
    avisar(NO_SE_PUDO);
    return { ok: false, mensaje: NO_SE_PUDO };
  }

  avisar('Instalándola. Esto tarda un par de minutos.');
  await correr(instalador, EN_SILENCIO, ESPERA_WINDOWS);

  // No se mira el código de salida del instalador: lo que importa es si el git
  // aparece, y en Windows tarda un momento en quedar visible.
  if (await hay(opciones)) return { ok: true };
  return esperarA(60000, opciones, avisar);
}

async function instalar(opciones = {}, avisar = () => {}) {
  if (await hay(opciones)) return { ok: true, yaEstaba: true };
  if (ES_WINDOWS) return instalarEnWindows(opciones, avisar);
  if (ES_MAC) return instalarEnMac(opciones, avisar);

  const aMano = 'Pídesela a tu tutor: se llama git.';
  avisar(aMano);
  return { ok: false, mensaje: aMano };
}

// Lo que se enseña antes de pulsar. Cambia con el sistema porque lo que va a
// pasar al pulsar también cambia.
function comoSeInstala() {
  if (ES_WINDOWS) return 'La descargo y la instalo yo. Tarda un par de minutos y no te va a pedir nada.';
  if (ES_MAC) return 'Tu ordenador te la instala. Te pedirá permiso y tarda un buen rato la primera vez.';
  return 'Pídesela a tu tutor: se llama git.';
}

const sePuedeInstalarSolo = () => ES_WINDOWS || ES_MAC;

module.exports = { hay, instalar, comoSeInstala, sePuedeInstalarSolo, GITS_DE_MAC };
