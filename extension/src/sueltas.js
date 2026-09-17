// Claves que viven fuera de sitio — el caso brownfield.
//
// El panel lee las credenciales de `01-TOOLS/<herramienta>/.env`, que es donde
// las pone RSC. Pero si sueltas esto sobre un proyecto que ya existía, las
// claves están donde estuvieran: un `.env` en la raíz, un `.env.local`, un
// `credentials/`. Ahí no las ve nadie, y el alumno ve "no hay conexiones"
// teniendo seis.
//
// Aquí no se inventa una convención paralela ni se leen esos ficheros: solo se
// detecta que están, para que el panel pueda ofrecer que el asistente los
// ordene con el protocolo de `harness`. Mover credenciales es cosa suya, que
// sabe hacerlo sin romper lo que ya usaba ese proyecto.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');

// Los sitios donde la gente guarda claves de verdad. No se recorre el proyecto
// entero: eso tardaría y encontraría cosas que no son.
const FICHEROS = ['.env', '.env.local', '.env.production', '.env.development', 'env', '.envrc'];
const CARPETAS = ['config', 'credentials', 'secrets', 'env'];

// Una línea con pinta de credencial: MAYUSCULAS_CON_GUION = algo.
const PARECE_CLAVE = /^\s*(?:export\s+)?[A-Z][A-Z0-9_]{2,}\s*=\s*\S/;
const SUENA_A_SECRETO = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|API)/;

function cuantasClavesTiene(fichero) {
  try {
    // Un .env de verdad no ocupa medio mega: si lo ocupa, no es un .env.
    if (fs.statSync(fichero).size > 128 * 1024) return 0;
    return fs.readFileSync(fichero, 'utf8')
      .split('\n')
      .filter((linea) => PARECE_CLAVE.test(linea) && !linea.trim().startsWith('#'))
      .length;
  } catch {
    return 0;
  }
}

function mirar(rutaRelativa, encontradas) {
  const completa = proyecto.ruta(rutaRelativa);
  if (!completa || !fs.existsSync(completa)) return;

  const cuantas = cuantasClavesTiene(completa);
  if (!cuantas) return;

  let secretos = false;
  try {
    secretos = SUENA_A_SECRETO.test(fs.readFileSync(completa, 'utf8'));
  } catch { /* si no se puede leer, se cuenta igual */ }

  encontradas.push({ donde: rutaRelativa, cuantas, secretos });
}

// Devuelve los sitios con claves que están fuera de 01-TOOLS. Vacío si el
// proyecto ya está ordenado, que es el caso normal cuando el arnés se montó
// desde cero.
function buscar() {
  if (!proyecto.raiz()) return [];

  const encontradas = [];
  for (const fichero of FICHEROS) mirar(fichero, encontradas);

  for (const carpeta of CARPETAS) {
    const completa = proyecto.ruta(carpeta);
    if (!completa || !fs.existsSync(completa)) continue;
    try {
      for (const dentro of fs.readdirSync(completa)) {
        if (/\.(env|envrc)$|^\.env/.test(dentro)) mirar(path.join(carpeta, dentro), encontradas);
      }
    } catch { /* carpeta que no se puede leer: siguiente */ }
  }

  return encontradas;
}

// Un resumen para la pantalla, sin nombrar ficheros ni rutas.
function resumen() {
  const sitios = buscar();
  if (!sitios.length) return null;

  const claves = sitios.reduce((total, s) => total + s.cuantas, 0);
  return {
    sitios: sitios.length,
    claves,
    // Lo que se le pide al asistente. Las rutas van aquí porque esto se lo
    // lee él, no el alumno.
    prompt: `En este proyecto hay claves guardadas fuera de 01-TOOLS: ${sitios.map((s) => s.donde).join(', ')}. `
      + 'Míralas, dime a qué herramienta pertenece cada una y ordénalas con el protocolo de harness '
      + '(una carpeta por proveedor en 01-TOOLS, con su .env, su CREDENTIALS.md y su prueba de conexión). '
      + 'No rompas lo que el proyecto ya estuviera usando: si algo las lee desde donde están, dímelo antes de mover nada.',
  };
}

module.exports = { buscar, resumen };
