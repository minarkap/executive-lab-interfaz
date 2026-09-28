// ¿Hay una versión nueva de esto? Y si la hay, ponerla.
//
// Por qué existe: la barra no está en la tienda del editor —va a ser cerrada—,
// así que el editor no la actualiza solo. Se reparte como un `.vsix` en cada
// release de GitHub, y sin esto **nadie se entera de que hay algo mejor**: cada
// uno se queda con la versión que le tocó el día que se la dieron, para
// siempre, y los arreglos no le llegan nunca.
//
// Lo mira una vez al día. Y la pone, pero **solo cuando la persona pulsa
// «Actualizar ahora»**: se baja el `.vsix` de esa release, se comprueba que es
// el de nuestro sitio y el de esa versión, y que ha llegado entero —la huella
// `sha256` que publica GitHub con cada fichero—, y se le pasa al editor para que
// lo instale. Una extensión que se cambia sola a espaldas de quien la usa es
// exactamente el tipo de cosa que este proyecto no hace.
//
// Antes esto solo abría la página de la release (decisión 132). Bajar un
// `.vsix` e instalarlo a mano es de lo más difícil que se le puede pedir a
// alguien que no programa, así que en la práctica no actualizaba nadie. La
// página se queda de repuesto, para cuando no se pueda ponerla sola.

const vscode = require('vscode');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const github = require('./github');

const REPO = 'minarkap/executive-lab-interfaz';
const ULTIMA = `https://api.github.com/repos/${REPO}/releases/latest`;

// Una vez al día basta y sobra. La respuesta se recuerda en el almacén global
// del editor, así que abrir cinco ventanas no son cinco preguntas.
const CADA = 24 * 60 * 60 * 1000;
const CLAVE = 'executiveLab.ultimoMiradoVersion';

// Lo que tarda en bajarse un `.vsix` de 6 MB con una conexión mala.
const ESPERA_AL_BAJAR = 3 * 60 * 1000;

// El `.vsix` ocupa 6 MB. Uno de más de 64 no es nuestro, o es un error al
// publicar, y bajarlo entero a memoria podría tumbar el editor de todos los que
// pulsen a la vez (revisión de seguridad).
const TAMANO_MAXIMO = 64 * 1024 * 1024;

// "0.9.0" → [0, 9, 0]. Lo que no sean números se ignora: una etiqueta como
// "0.9.0-beta" cuenta como 0.9.0, que para avisar es suficiente.
const enNumeros = (version) => String(version || '').split('.').map((t) => parseInt(t, 10) || 0);

function esMasNueva(candidata, actual) {
  const a = enNumeros(candidata);
  const b = enNumeros(actual);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

// El nombre que le pone `publicar.sh`, y nada más: una release con otro fichero
// dentro no se instala.
const nombreDelPaquete = (version) => `executive-lab-${version}.vsix`;

// De una release, lo que hace falta para ponerla: su versión y su `.vsix`, con
// dónde está, cuánto ocupa y su huella. Sin un `.vsix` que cuadre, `paquete` es
// null y solo se puede avisar.
function deUnaRelease(release) {
  const version = String((release && release.tag_name) || '').replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+$/.test(version)) return null;
  const nombre = nombreDelPaquete(version);
  const suyo = ((release && release.assets) || []).find((a) => a && a.name === nombre);
  const candidato = suyo ? { nombre, url: suyo.browser_download_url, tamano: suyo.size, huella: suyo.digest } : null;
  return { version, paquete: paqueteDeFiar(candidato, version) ? candidato : null };
}

// Solo de nuestro sitio, de esa versión, y con huella. Lo que no cumpla las
// tres no se baja: se ofrece la página.
function paqueteDeFiar(paquete, version) {
  return Boolean(paquete)
    && paquete.nombre === nombreDelPaquete(version)
    && paquete.url === `https://github.com/${REPO}/releases/download/v${version}/${nombreDelPaquete(version)}`
    && /^sha256:[0-9a-f]{64}$/.test(String(paquete.huella || ''))
    && Number.isInteger(paquete.tamano) && paquete.tamano > 0 && paquete.tamano <= TAMANO_MAXIMO;
}

// La última publicada, recordada un día. Nunca lanza: sin red no se avisa, y
// que esto falle no puede estropearle la pantalla a nadie.
async function laUltima(contexto, { fresca = false } = {}) {
  try {
    const almacen = contexto.globalState;
    const mirado = almacen.get(CLAVE) || { cuando: 0, version: null };
    if (!fresca && Date.now() - mirado.cuando < CADA) return mirado.version ? { version: mirado.version, paquete: mirado.paquete || null } : null;

    // Con reloj, como todo lo que sale a la red desde aquí: la barra no puede
    // quedarse esperando a GitHub para pintarse.
    const respuesta = await github.conReloj(fetch(ULTIMA, { headers: { Accept: 'application/vnd.github+json' } }), null, 5000);
    if (!respuesta || !respuesta.ok) return null;

    const ultima = deUnaRelease(await respuesta.json());
    await almacen.update(CLAVE, { cuando: Date.now(), version: ultima ? ultima.version : null, paquete: ultima ? ultima.paquete : null });
    return ultima;
  } catch {
    return null;
  }
}

// Devuelve la versión nueva, o null.
async function hayUnaNueva(contexto, actual) {
  const ultima = await laUltima(contexto);
  return ultima && esMasNueva(ultima.version, actual) ? ultima.version : null;
}

// ── Ponerla ──────────────────────────────────────────────────────────────
//
// Solo desde el botón. Se vuelve a preguntar a GitHub en ese momento: lo que se
// recordó ayer puede no ser ya la última. Devuelve qué pasó; quien llama lo dice
// y lo apunta.
async function ponerLaNueva(contexto, actual, { esperar = ESPERA_AL_BAJAR } = {}) {
  const ultima = await laUltima(contexto, { fresca: true });
  if (!ultima) return { ok: false, motivo: 'sinRespuesta' };
  if (!esMasNueva(ultima.version, actual)) return { ok: false, motivo: 'yaEstaAlDia', version: ultima.version };
  const { paquete } = ultima;
  if (!paqueteDeFiar(paquete, ultima.version)) return { ok: false, motivo: 'sinPaquete', version: ultima.version };

  const carpeta = contexto.globalStorageUri ? path.join(contexto.globalStorageUri.fsPath, 'versiones') : null;
  if (!carpeta) return { ok: false, motivo: 'sinSitio', version: ultima.version };

  // Con un corte de verdad, no solo dejando de esperar: si no, una descarga
  // colgada seguiría bajando por detrás (revisión de seguridad).
  const cortar = new AbortController();
  const reloj = setTimeout(() => cortar.abort(), esperar);
  let bytes;
  try {
    const respuesta = await fetch(paquete.url, { signal: cortar.signal });
    if (!respuesta || !respuesta.ok) return { ok: false, motivo: 'sinRespuesta', version: ultima.version };
    // Si dice de antemano que no mide lo que tiene que medir, ni se baja.
    const anunciado = Number(respuesta.headers && respuesta.headers.get ? respuesta.headers.get('content-length') : NaN);
    if (Number.isFinite(anunciado) && anunciado !== paquete.tamano) {
      cortar.abort();
      return { ok: false, motivo: 'aMedias', version: ultima.version };
    }
    bytes = Buffer.from(await respuesta.arrayBuffer());
  } catch {
    return { ok: false, motivo: 'sinRespuesta', version: ultima.version };
  } finally {
    clearTimeout(reloj);
  }
  // Entero y el mismo: un corte a medias o un fichero cambiado no se instala.
  if (bytes.length !== paquete.tamano) return { ok: false, motivo: 'aMedias', version: ultima.version };
  const huella = `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
  if (huella !== paquete.huella) return { ok: false, motivo: 'noCoincide', version: ultima.version };

  const fichero = path.join(carpeta, paquete.nombre);
  try {
    // Solo se guarda la que se va a poner: las de antes no sirven para nada.
    fs.rmSync(carpeta, { recursive: true, force: true });
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(fichero, bytes);
    await vscode.commands.executeCommand('workbench.extensions.installExtension', vscode.Uri.file(fichero));
  } catch (error) {
    return { ok: false, motivo: 'noSeInstala', version: ultima.version, detalle: error && error.message };
  }
  return { ok: true, version: ultima.version };
}

// La página de la última versión, para cuando no se puede ponerla sola.
const dondeBajarla = () => vscode.Uri.parse(`https://github.com/${REPO}/releases/latest`);

module.exports = { hayUnaNueva, laUltima, ponerLaNueva, esMasNueva, deUnaRelease, paqueteDeFiar, dondeBajarla, REPO, CLAVE, TAMANO_MAXIMO };
