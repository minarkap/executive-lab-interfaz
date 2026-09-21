// Claves que viven fuera de sitio — y a dónde va cada una.
//
// ── El sitio de una clave lo define RSC ──────────────────────────────────
//
// `skills/harness` y su plantilla `_TEMPLATE`: **una carpeta por proveedor en
// `01-TOOLS/`**, con su `.env` (los valores reales, que RSC nunca escribe), su
// `.env.example` (los nombres), `CREDENTIALS.md` (dónde se saca cada una) y
// `test_connection`. Y las variables se llaman `<HERRAMIENTA>_<NOMBRE>`. Ese
// es el sitio. Todo lo demás está fuera de sitio.
//
// ── Lo que pasaba ────────────────────────────────────────────────────────
//
// Jose, 21-09-2026, con una captura de un proyecto suyo: las claves estaban en
// un `.env.local` de la raíz —Replicate, Pexels, Buffer, Drive y Telegram, todas
// juntas— y en un `.env.local` dentro de la carpeta de una herramienta. Esto
// solo contaba ficheros en la raíz, así que la barra enseñaba herramientas «sin
// conectar» que funcionaban, y proveedores enteros que no salían por ningún
// lado. *«Hay que conseguir un mapeo muy bueno con las posibilidades de RSC»*.
//
// ── Lo que hace ahora: inventariar y repartir ────────────────────────────
//
// 1. Encuentra todos los ficheros de claves: los `.env*` de la raíz, los de
//    las carpetas de primer nivel, los de `config/`, `credentials/`…, y dentro
//    de cada herramienta los que NO son su `.env` (un `.env.local` ahí también
//    está fuera de sitio: la barra y la prueba de conexión leen `.env`).
// 2. Lee los NOMBRES de las claves, nunca los valores. Los valores no salen de
//    su fichero ni para el asistente.
// 3. Reparte: a qué herramienta va cada clave. Primero, porque una herramienta
//    ya la espera en su `.env.example`; si no, por el prefijo `<HERRAMIENTA>_`
//    —que es la convención de RSC—, saltando los prefijos del framework
//    (`NEXT_PUBLIC_`, `VITE_`…). Lo que no tiene dueño claro (`TOKEN`, `PORT`)
//    se le pregunta al asistente, no se adivina.
// 4. El encargo al asistente lleva ese plan hecho, clave por clave. Mover
//    credenciales sin romper lo que las leía sigue siendo cosa suya.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');

const HERRAMIENTAS = '01-TOOLS';

// Ficheros de claves. Los de ejemplo no llevan valores y no cuentan.
const ES_DE_CLAVES = /^(\.env(\..+)?|env|\.envrc)$/;
const ES_EJEMPLO = /\.(example|sample|template|dist)$/i;
const CARPETAS = ['config', 'credentials', 'secrets', 'env'];
const NO_SE_MIRA = new Set(['node_modules', '.git', '.venv', 'venv', 'dist', 'build', '.next', '02-DOCS', '.rsc', '.claude', '.codex', '.vscode', HERRAMIENTAS]);

// Una línea con pinta de credencial: MAYUSCULAS_CON_GUION = algo.
const PARECE_CLAVE = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]{2,})\s*=\s*\S/;
// Lo mismo, sin exigir valor: es como se escriben los `.env.example`.
const PARECE_NOMBRE = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]{2,})\s*=/;
const SUENA_A_SECRETO = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|API)/;

// Prefijos que no nombran a nadie: son del framework, y el proveedor va detrás.
const PREFIJOS_HUECOS = new Set(['NEXT', 'NEXT_PUBLIC', 'VITE', 'REACT_APP', 'PUBLIC', 'EXPO_PUBLIC', 'NUXT', 'NUXT_PUBLIC', 'APP', 'MY']);
// Nombres que no dicen de quién son. Se le preguntan al asistente.
const SIN_DUENO = /^(API_KEY|API_SECRET|API_URL|API_TOKEN|TOKEN|SECRET|SECRET_KEY|KEY|PASSWORD|DATABASE_URL|DB_[A-Z_]*|PORT|PUERTO|NODE_ENV|ENV|DEBUG|HOST|URL|BASE_URL|LOG_LEVEL|TZ|LANG)$/;

const TOPE = 128 * 1024;

function lineasDe(fichero) {
  try {
    // Un .env de verdad no ocupa medio mega: si lo ocupa, no es un .env.
    if (fs.statSync(fichero).size > TOPE) return [];
    return fs.readFileSync(fichero, 'utf8').split('\n').filter((l) => !l.trim().startsWith('#'));
  } catch {
    return [];
  }
}

// Los nombres de las claves con valor de un fichero. Los valores se quedan en él.
function nombresDeClaves(fichero) {
  return [...new Set(lineasDe(fichero).map((l) => (l.match(PARECE_CLAVE) || [])[1]).filter(Boolean))];
}

// Los nombres que un `.env.example` espera, con valor o sin él.
function nombresEsperados(fichero) {
  return [...new Set(lineasDe(fichero).map((l) => (l.match(PARECE_NOMBRE) || [])[1]).filter(Boolean))]
    .filter((n) => !/[<{]/.test(n));
}

function mirar(rutaRelativa, encontradas) {
  if (encontradas.some((e) => e.donde === rutaRelativa)) return;
  const completa = proyecto.ruta(rutaRelativa);
  if (!completa || !fs.existsSync(completa) || !fs.statSync(completa).isFile()) return;

  const nombres = nombresDeClaves(completa);
  if (!nombres.length) return;

  encontradas.push({
    donde: rutaRelativa,
    cuantas: nombres.length,
    secretos: nombres.some((n) => SUENA_A_SECRETO.test(n)),
    nombres,
  });
}

// Los ficheros de claves que hay en una carpeta, salvo los que se le digan.
function ficherosDeClavesEn(carpetaRelativa, salvo = []) {
  const completa = carpetaRelativa ? proyecto.ruta(carpetaRelativa) : proyecto.raiz();
  if (!completa || !fs.existsSync(completa)) return [];
  try {
    return fs.readdirSync(completa)
      .filter((n) => ES_DE_CLAVES.test(n) && !ES_EJEMPLO.test(n) && !salvo.includes(n))
      .map((n) => (carpetaRelativa ? path.join(carpetaRelativa, n) : n));
  } catch {
    return [];
  }
}

// Las herramientas que hay montadas y qué claves espera cada una.
function herramientas() {
  const base = proyecto.ruta(HERRAMIENTAS);
  if (!base || !fs.existsSync(base)) return [];
  try {
    return fs.readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map((e) => ({ id: e.name, esperadas: nombresEsperados(path.join(base, e.name, '.env.example')) }));
  } catch {
    return [];
  }
}

// Devuelve los sitios con claves que están fuera de su sitio. Vacío si el
// proyecto ya está ordenado, que es el caso normal cuando el arnés se montó
// desde cero.
function buscar() {
  const raiz = proyecto.raiz();
  if (!raiz) return [];

  const encontradas = [];
  for (const fichero of ficherosDeClavesEn('')) mirar(fichero, encontradas);

  // Carpetas de primer nivel: `auto/.env`, `publicar/.env.local`… Sin bajar
  // más: lo que está más hondo es de un subproyecto y no se toca.
  let primerNivel = [];
  try {
    primerNivel = fs.readdirSync(raiz, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !NO_SE_MIRA.has(e.name))
      .map((e) => e.name);
  } catch { /* sin permiso para leer la raíz: se mira lo demás */ }
  for (const carpeta of [...new Set([...primerNivel, ...CARPETAS])]) {
    for (const fichero of ficherosDeClavesEn(carpeta)) mirar(fichero, encontradas);
  }

  // Dentro de cada herramienta, todo lo que no sea su `.env`: un `.env.local`
  // ahí también está fuera de sitio, porque ni la barra ni la prueba de
  // conexión lo leen.
  for (const h of herramientas()) {
    for (const fichero of ficherosDeClavesEn(path.join(HERRAMIENTAS, h.id), ['.env'])) mirar(fichero, encontradas);
  }

  return encontradas;
}

// ── A quién pertenece cada clave ─────────────────────────────────────────

const normal = (t) => String(t || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// El prefijo que nombra al proveedor: `PEXELS_API_KEY` → PEXELS,
// `NEXT_PUBLIC_BUFFER_API_KEY` → BUFFER. Null si el nombre no dice de quién es.
function prefijoDe(nombre) {
  const partes = String(nombre).split('_');
  let i = 0;
  while (i < partes.length - 1) {
    if (PREFIJOS_HUECOS.has(partes.slice(i, i + 2).join('_'))) { i += 2; continue; }
    if (PREFIJOS_HUECOS.has(partes[i])) { i += 1; continue; }
    break;
  }
  const resto = partes.slice(i).join('_');
  if (partes.length - i < 2 || SIN_DUENO.test(resto)) return null;
  return partes[i];
}

function aQuien(nombre, lasHerramientas = herramientas()) {
  const duena = lasHerramientas.find((h) => h.esperadas.includes(nombre));
  if (duena) return { herramienta: duena.id, existe: true, por: 'la espera' };
  const prefijo = prefijoDe(nombre);
  if (!prefijo) return { herramienta: null, existe: false, por: 'sin dueño' };
  const misma = lasHerramientas.find((h) => normal(h.id) === normal(prefijo));
  return { herramienta: misma ? misma.id : prefijo, existe: Boolean(misma), por: 'prefijo' };
}

// Las claves sueltas, agrupadas por la herramienta a la que van. Las que ya
// existen primero; luego las que habría que montar; lo sin dueño, aparte.
function reparto(sitios = buscar(), lasHerramientas = herramientas()) {
  const grupos = new Map();
  const sinDueno = [];
  for (const sitio of sitios) {
    for (const nombre of sitio.nombres) {
      const a = aQuien(nombre, lasHerramientas);
      if (!a.herramienta) {
        if (!sinDueno.some((x) => x.nombre === nombre)) sinDueno.push({ nombre, donde: sitio.donde });
        continue;
      }
      const grupo = grupos.get(a.herramienta) || { herramienta: a.herramienta, existe: a.existe, claves: [], donde: [] };
      if (!grupo.claves.includes(nombre)) grupo.claves.push(nombre);
      if (!grupo.donde.includes(sitio.donde)) grupo.donde.push(sitio.donde);
      grupos.set(a.herramienta, grupo);
    }
  }
  const lista = [...grupos.values()].sort((x, y) => Number(y.existe) - Number(x.existe) || x.herramienta.localeCompare(y.herramienta));
  return { grupos: lista, sinDueno };
}

// Dónde está un fichero, dicho para quien no va a abrirlo.
function enCristiano(donde) {
  if (!donde.includes('/') && !donde.includes(path.sep)) return 'en la carpeta principal';
  if (donde.startsWith(`${HERRAMIENTAS}/`) || donde.startsWith(`${HERRAMIENTAS}${path.sep}`)) return 'en su carpeta, con otro nombre';
  return `en la carpeta ${donde.split(/[/\\]/)[0]}`;
}

// Cuáles de estos nombres están puestos en el propio ordenador (el entorno
// del sistema), que es «global» y no viaja con la carpeta.
const enElOrdenador = (nombres) => nombres.filter((n) => typeof process.env[n] === 'string' && process.env[n] !== '');

// ── Y si además están subidas ────────────────────────────────────────────
//
// Montar esto sobre un proyecto que ya existía se encontró, en la prueba con
// un arnés nuevo de verdad, con el caso que importa: el `.env` de esa persona
// **ya estaba en su historial de git**, porque lo guardó el día que empezó.
// Moverlas no las saca de ahí. Sacarlas es otra cosa y la decide esa persona,
// así que aquí solo se mira y se dice.
function estanSubidas(sitios) {
  const raiz = proyecto.raiz();
  if (!raiz || !sitios.length) return [];
  try {
    const { execFileSync } = require('node:child_process');
    const salida = execFileSync('git', ['ls-files', '--', ...sitios.map((s) => s.donde)], {
      cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000,
    });
    return salida.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// El encargo al asistente, con el plan hecho. Las rutas y los nombres de las
// claves van aquí porque esto se lo lee él; los valores, nunca.
function encargo(sitios, { grupos, sinDueno }, subidas) {
  const lineas = [
    `En esta carpeta hay ${sitios.reduce((t, s) => t + s.cuantas, 0)} claves guardadas fuera de su sitio, en: ${sitios.map((s) => s.donde).join(', ')}. `
      + `El sitio de una clave es 01-TOOLS/<HERRAMIENTA>/.env, por el protocolo de harness: una carpeta por proveedor, con su .env, su .env.example, su CREDENTIALS.md y su prueba de conexión.`,
    '',
    'Reparto que sale por el nombre de cada clave:',
    ...grupos.map((g) => (g.existe
      ? `- ${g.claves.join(', ')} (${g.donde.join(', ')}) → 01-TOOLS/${g.herramienta}/.env, que ya existe${g.claves.length === 1 ? ' y la espera' : ''}.`
      : `- ${g.claves.join(', ')} (${g.donde.join(', ')}) → 01-TOOLS/${g.herramienta}/, que no existe: créala desde 01-TOOLS/_TEMPLATE, con su .env.example, su CREDENTIALS.md (dónde se saca cada una) y su prueba de conexión.`)),
    ...(sinDueno.length
      ? [`- Sin dueño claro: ${sinDueno.map((x) => `${x.nombre} (${x.donde})`).join(', ')}. Pregúntame de qué herramienta son antes de moverlas.`]
      : []),
    '',
    'Qué tiene que quedar: cada clave en el .env de su herramienta y solo ahí, los .env.example con los nombres, y cada herramienta con su prueba de conexión pasando.',
    '',
    'Qué no se toca: no imprimas ni me pegues ningún valor de clave. No borres el fichero viejo si algo del proyecto lo lee todavía: mira primero qué lo carga (scripts, dotenv, docker-compose) y adapta eso, o deja el fichero viejo cargando desde el nuevo. No reescribas el historial de git.',
    '',
    'Antes de mover nada, enséñame el reparto en una línea por herramienta y espera mi OK.',
  ];
  if (subidas.length) {
    lineas.push('', `AVISO IMPORTANTE: estos ficheros ya están guardados en el historial de git (${subidas.join(', ')}), `
      + 'así que moverlos NO saca esas claves de ahí: siguen en el historial y viajarían con cualquier copia que se suba. '
      + 'Explícaselo en cristiano antes de tocar nada y dile que lo prudente es cambiar esas claves en el proveedor, '
      + 'que es lo único que las deja inservibles. No reescribas el historial sin que te lo pida.');
  }
  return lineas.join('\n');
}

// Un resumen para la pantalla, sin nombrar ficheros ni valores.
function resumen() {
  const sitios = buscar();
  if (!sitios.length) return null;

  const subidas = estanSubidas(sitios);
  const { grupos, sinDueno } = reparto(sitios);
  return {
    sitios: sitios.length,
    ficheros: sitios.map((s) => s.donde),
    claves: sitios.reduce((total, s) => total + s.cuantas, 0),
    // Cuántos de esos ficheros están ya guardados en el historial. Cero es el
    // caso normal; más de cero cambia lo que hay que hacer.
    subidas: subidas.length,
    // A qué herramienta va cada clave, para que la pantalla lo diga en
    // cristiano y el asistente lo tenga hecho.
    reparto: grupos,
    sinDueno,
    // Proveedores que existen por sus claves y todavía no tienen carpeta.
    porMontar: grupos.filter((g) => !g.existe).map((g) => ({ herramienta: g.herramienta, claves: g.claves.length })),
    prompt: encargo(sitios, { grupos, sinDueno }, subidas),
  };
}

module.exports = {
  buscar, resumen, reparto, aQuien, prefijoDe, herramientas, enCristiano, enElOrdenador, nombresDeClaves, nombresEsperados,
};
