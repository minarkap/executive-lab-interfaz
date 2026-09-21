// Hablar con el arnés RSC.
//
// Siempre con la versión fijada, nunca con @latest: toda la cohorte tiene que
// correr exactamente el mismo catálogo, o dejan de servir las instrucciones de
// clase. Y siempre a través de node + el punto de entrada del paquete: sin npx
// por medio, que en Windows es un .cmd y en cualquier sitio tarda segundos.

const fs = require('node:fs');
const procesos = require('./procesos');
const proyecto = require('./proyecto');
const entorno = require('./entorno');

// Último recurso si .rsc.json no dice versión. Se actualiza a mano, a
// propósito: subir de versión es una decisión, no un efecto secundario.
const VERSION_DE_RESPALDO = '2.0.5';

function paquete() {
  return `@ericrisco/rsc@${proyecto.versionDelCatalogo() || VERSION_DE_RESPALDO}`;
}

// Cómo se invoca, por orden de preferencia:
//   1. el arnés preinstalado por el instalador (o el del proyecto) → node rsc.js
//   2. npx-cli.js del node que tengamos → node npx-cli.js --yes @ericrisco/rsc@X
//   3. npx del PATH (máquina de desarrollo), pasando por cmd.exe en Windows
// La carpeta de la extensión la pone extension.js al arrancar: desde aquí no
// hay forma de saberla, y es donde puede viajar el arnés.
let carpetaDeLaExtension = null;
const saberDondeEstamos = (ruta) => { carpetaDeLaExtension = ruta; };

async function correr(args, opciones) {
  const entrada = entorno.entradaDelArnes(proyecto.raiz(), carpetaDeLaExtension);
  if (entrada) return procesos.node([entrada, ...args], opciones);

  const npx = entorno.npxCli();
  if (npx) return procesos.node([npx, '--yes', paquete(), ...args], opciones);

  return procesos.delPath('npx', ['--yes', paquete(), ...args], opciones);
}

// Dónde se quedó la última sesión, según el checkpoint local de RSC. Devuelve
// null cuando no hay nada: RSC responde con éxito y un aviso entre paréntesis.
async function retomar() {
  const { codigo, salida } = await correr(['memory', 'resume'], { tiempoMaximo: 20000 });
  if (codigo !== 0) return null;
  const texto = salida.trim();
  if (!texto || /^\(no local continuation/i.test(texto)) return null;
  return texto;
}

// Enseñarle algo nuevo del catálogo. El catálogo viaja dentro del paquete,
// así que esto no necesita red.
//
// OJO: `rsc add` de la 1.4.1 dice "Installed" pase lo que pase, incluso con un
// identificador que no existe (comprobado el 17-09-2026 con `add --help`). Por
// eso no se cree a su código de salida: se mira si la habilidad ha aparecido
// de verdad en el disco.
async function anadir(id) {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return { ok: false };

  const quien = ((proyecto.declaracion() || {}).targets || ['claude'])[0];
  await correr(['add', id, '--target', quien], { tiempoMaximo: 180000 });
  return { ok: habilidadesPuestas().includes(id) };
}

// Las habilidades que están **en disco, en este ordenador**.
//
// Va aparte de `habilidadesPuestas()` por un motivo concreto: aquella hace la
// unión con lo declarado en `.rsc.json`, y con esa unión un repositorio clonado
// es indetectable — lo declarado tapa lo que falta. Para saber si hay que
// traerlas hay que mirar el disco a secas.
function habilidadesEnDisco() {
  const carpeta = require('./donde').carpetaDeHabilidades();
  if (!carpeta || !fs.existsSync(carpeta)) return [];
  try {
    return fs.readdirSync(carpeta, { withFileTypes: true })
      .filter((e) => (e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith('.'))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// Las habilidades que esta carpeta tiene puestas: las de disco más las que
// declara el arnés. Es lo que la barra enseña.
function habilidadesPuestas() {
  const declaracion = proyecto.declaracion() || {};
  return [...new Set([...habilidadesEnDisco(), ...(declaracion.skills || []), ...(declaracion.ownSkills || [])])];
}

// ── Leer lo que contesta el arnés ────────────────────────────────────────

// `doctor --json` sale entero por la salida normal. Si no se puede leer, se
// dice que no se sabe: inventarse un informe sano sería peor que no tenerlo.
function comoEstaDeSalud({ codigo, salida }) {
  if (codigo !== 0) return null;
  try {
    return JSON.parse(salida);
  } catch {
    return null;
  }
}

// `repair --dry-run` imprime una línea por hallazgo, marcada `[fix]` si la sabe
// arreglar sola y `[ask]` si hace falta que alguien decida.
//
// La diferencia no es cosmética: `repair --yes` a ciegas aplicaría también los
// `[ask]`, y uno de ellos —`wrong-target`— **mueve el arnés a otro asistente**.
// Así que solo se deja arreglar solo lo que no pregunta nada.
function queHayQueArreglar({ codigo, salida }) {
  const texto = String(salida || '');
  if (codigo !== 0) return { sano: false, solas: [], aDecidir: [], sabemos: false };
  return {
    sabemos: true,
    sano: /Nothing to repair/i.test(texto),
    solas: texto.split('\n').map((l) => l.trim()).filter((l) => l.includes('[fix]')),
    aDecidir: texto.split('\n').map((l) => l.trim()).filter((l) => l.includes('[ask]')),
  };
}

// ── Lo que el doctor sabe y la barra no contaba ─────────────────────────
//
// `doctor --json` trae mucho más que «sano o no», y hasta hoy se pedía entero
// para no mirar dentro: la radiografía lanzaba tres procesos y leía uno. Lo
// que sigue son lectores de los campos que sí le importan a quien usa la
// barra. Cada uno devuelve `null` cuando el informe no se pudo leer, para que
// la pantalla pueda callar en vez de inventarse un «todo bien».

// Los guardianes: lo único del arnés que puede **decirle que no** a alguien.
//
// Son tres, se enganchan antes de cada orden y RSC los apunta en el recuento
// de enganches del informe (`contextBudget.scopes[].hookCounts.PreToolUse`).
// Que estén armados es lo normal y es bueno; lo que no puede ser es que nadie
// los nombre hasta que uno bloquea algo, que es justo cuando peor sienta.
//
// `gitmoji` tiene además su propio campo, porque se puede apagar y el informe
// dice si lo está. Los otros dos se apagan igual, con su fichero en `.rsc/`.
const LOS_GUARDIANES = ['danger-guard', 'gitmoji-guard', 'ship-guard'];

function queGuardianes(informe) {
  if (!informe) return null;

  const ambitos = (informe.contextBudget && informe.contextBudget.scopes) || [];
  const enganchados = new Set();
  for (const ambito of ambitos) {
    const antes = (ambito.hookCounts && ambito.hookCounts.PreToolUse) || {};
    for (const nombre of Object.keys(antes)) enganchados.add(nombre);
  }

  return LOS_GUARDIANES.map((id) => ({
    id,
    // El informe nombra el de gitmoji aparte, y ahí es donde dice si se apagó.
    apagado: id === 'gitmoji-guard' ? informe.gitmojiGuard === 'opted-out' : false,
    armado: enganchados.has(id),
  }));
}

// Las copias que guarda el propio arnés antes de tocar nada. No son las de
// git: RSC copia lo suyo antes de aplicar un plan, y eso es una red de
// seguridad que existe y que no se veía por ningún lado.
function queCopiasDelArnes(informe) {
  if (!informe || !informe.backups) return null;
  const { exists, count, latest } = informe.backups;
  return { hay: Boolean(exists), cuantas: count || 0, ultima: latest || null };
}

// Lo que el arnés declara y no está en disco. Con esto en rojo, la barra pinta
// botones que no responden — y era el caso que no se podía distinguir sin
// mirar aquí.
function queFaltaEnDisco(informe) {
  if (!informe) return null;
  const falta = [
    ...(informe.missing || []).map((id) => ({ id, que: 'habilidad' })),
    ...(informe.missingAgents || []).map((id) => ({ id, que: 'agente' })),
    ...(informe.missingCommands || []).map((id) => ({ id, que: 'comando' })),
  ];
  return falta;
}

// Lo que `reassess` recomienda, leído. Es de solo lectura, así que esto no
// puede cambiar nada: solo saber si hay algo que contar.
//
//   RSC_REASSESSMENT_NO_CHANGE      el plan sigue encajando
//   RSC_REASSESSMENT_RECOMMENDED    y detrás, una línea `tipo/id: por qué`
function queRecomienda({ codigo, salida }) {
  const texto = String(salida || '');
  if (codigo !== 0 || /RSC_REASSESSMENT_NO_CHANGE/.test(texto)) return [];

  return texto.split('\n')
    .map((l) => l.trim())
    .map((l) => l.match(/^(agent|guard|hook|workflow|skill|route|capability)\/([a-z0-9-]+):\s*(.+)$/))
    .filter(Boolean)
    .map(([, tipo, id, porQue]) => ({ tipo, id, porQue }));
}

const revisar = () => correr(['doctor'], { tiempoMaximo: 120000 });

// El mismo doctor, pero para máquina. Sin `--json` la salida lleva delante el
// bloque de presupuesto de contexto, en texto, así que `JSON.parse` revienta.
// `revisar()` se queda como está: esa la lee una persona, en el informe.
const salud = () => correr(['doctor', '--json'], { tiempoMaximo: 120000 });

// Traer a esta máquina lo que el repositorio declara. Es la acción correcta
// para un clon: reconstruye desde el plan aceptado y —a diferencia de `add` y
// de `install`— no exige que ya haya un arnés instalado aquí, que en un clon
// es justo lo que no hay.
const sincronizar = () => correr(['sync'], { tiempoMaximo: 300000 });

// Si lo que se acordó al montar sigue encajando con lo que hay hoy. Es de
// **solo lectura**: recomienda y no escribe nada. Aceptar un plan nuevo lo
// tiene que hacer una persona, por su huella.
const reevaluar = () => correr(['reassess'], { tiempoMaximo: 60000 });
const arreglarEnSeco = () => correr(['repair', '--dry-run'], { tiempoMaximo: 120000 });
const arreglar = () => correr(['repair'], { tiempoMaximo: 180000 });

// Arreglar sin que nadie conteste. Solo se llama cuando `queHayQueArreglar()`
// ha dicho que no hay nada que preguntar: ver arriba por qué.
const arreglarSolo = () => correr(['repair', '--yes'], { tiempoMaximo: 180000 });

module.exports = {
  correr, retomar, revisar, salud, sincronizar, reevaluar, arreglarEnSeco, arreglar, arreglarSolo,
  comoEstaDeSalud, queHayQueArreglar, queRecomienda,
  queGuardianes, queCopiasDelArnes, queFaltaEnDisco, LOS_GUARDIANES,
  paquete, VERSION_DE_RESPALDO, saberDondeEstamos, habilidadesPuestas, habilidadesEnDisco, anadir,
};
