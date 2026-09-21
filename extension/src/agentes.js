// Los agentes: cada uno con un encargo fijo, que hace por su cuenta.
//
// ── Por qué esto no sale hasta que hay uno ───────────────────────────────
//
// Jose, sobre esto y sobre SDD: *«tiene que estar sin aparecer en el menú hasta
// que se acepte la sugerencia y haya el primer agente»*. Y es la regla de
// siempre en esta barra, solo que dicha para dos casos nuevos: **no hay nada
// predefinido**. Un apartado de agentes en una carpeta sin agentes es un hueco
// con rótulo, y un hueco con rótulo es peor que no tener el rótulo.
//
// ── Cómo se llaman ───────────────────────────────────────────────────────
//
// Se llaman **agentes**, que es como se llaman en RSC y en clase. En pantalla
// se llamaron «ayudantes» durante tres días, y Jose lo paró: *«que no haya
// "simplificaciones" excesivas»*. Un agente es un agente; lo que hay que hacer
// es explicar en una frase qué es, no cambiarle el nombre.
//
// RSC los escribe en la carpeta del asistente para el que se montó el arnés
// (`targets/agents.js`): `.claude/agents/*.md`, `.codex/agents/*.toml`… La
// tabla está en `donde.js`, copiada de la suya. Y los que trae RSC vienen con
// nombre en clave y descripción en inglés: su nombre en español está en
// `media/nombres.json`, igual que el de los comandos y las habilidades, y
// hasta hoy los agentes eran los únicos que no pasaban por ahí.

const fs = require('node:fs');
const path = require('node:path');
const donde = require('./donde');
const frontmatter = require('./frontmatter');
const nombres = require('./nombres');

const TOPE = 20;

// Las plantillas del arnés traen ejemplos entre llaves.
const ES_PLANTILLA = (t) => /[{}]/.test(t || '');

// ── Cada asistente escribe a sus ayudantes en un formato distinto ────────
//
// Y esto no es un detalle: RSC escribe `name` y `description` en los tres, pero
// **en tres sintaxis**. Markdown con cabecera para Claude, TOML para Codex,
// JSON para Kiro (`targets/agents.js`, `renderMd` / `renderToml` / `renderJson`).
//
// Aquí se leían los tres con el lector de cabeceras YAML, que solo entiende la
// primera. Con Codex eso salía así: el ayudante aparecía en la lista —el
// fichero existe— pero con el nombre del fichero en vez del suyo y **sin una
// palabra de lo que hace**. Un ayudante sin explicación es un botón a ciegas, y
// esa es exactamente la forma de fallar que esta barra no se permite: no da
// error, se ve lleno, y no sirve.
//
// Son dos formatos más y quince líneas. Lo que se saca es lo mismo en los tres:
// cómo se llama y para qué sirve.

// TOML de RSC: `clave = "valor"` en las primeras líneas, y el cuerpo después en
// una cadena literal `'''…'''` que aquí no se mira. No es un analizador de TOML:
// es lo justo para las dos claves que se leen, igual que `frontmatter.js` es lo
// justo para YAML.
function deToml(texto) {
  const campos = {};
  for (const linea of (texto || '').split('\n')) {
    const fila = linea.match(/^\s*([A-Za-z_][\w-]*)\s*=\s*"((?:[^"\\]|\\.)*)"\s*$/);
    if (fila) campos[fila[1]] = fila[2].replace(/\\(["\\])/g, '$1');
    // El cuerpo llega después y puede traer cualquier cosa: se para al verlo.
    if (/^\s*[A-Za-z_][\w-]*\s*=\s*'''/.test(linea)) break;
  }
  return campos;
}

function deJson(texto) {
  try {
    const leido = JSON.parse(texto);
    return leido && typeof leido === 'object' ? leido : {};
  } catch {
    return {};
  }
}

function camposDe(fichero, crudo) {
  if (/\.toml$/i.test(fichero)) return deToml(crudo);
  if (/\.json$/i.test(fichero)) return deJson(crudo);
  return frontmatter.analizar(crudo);
}

function queHay() {
  const carpeta = donde.carpetaDeAgentes();
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  let ficheros;
  try {
    ficheros = fs.readdirSync(carpeta).filter((n) => /\.(md|toml|json)$/i.test(n) && !n.startsWith('.'));
  } catch {
    return [];
  }

  return ficheros.sort().slice(0, TOPE).map((nombre) => {
    let crudo = '';
    try {
      crudo = fs.readFileSync(path.join(carpeta, nombre), 'utf8');
    } catch { /* se queda con el nombre */ }

    const campos = camposDe(nombre, crudo);
    const humano = (v) => (typeof v === 'string' && v.trim() && !ES_PLANTILLA(v) ? v.trim() : '');
    const id = nombre.replace(/\.[^.]+$/, '');

    // Lo que diga su fichero manda, con una condición: que esté en español.
    // Los agentes de RSC traen `name` en clave (`refuter-security`) y
    // `description` en inglés, y los dos salían tal cual — el único sitio de
    // la barra donde se colaba una línea en inglés. Ahora, si lo suyo no
    // está en español, manda la tabla; y si la tabla no lo tiene, el nombre
    // del fichero humanizado y sin frase.
    const nombreSuyo = humano(campos.name);
    const fraseSuya = humano(campos.description);
    // Un `name` que es el propio identificador en clave (`refuter-security`)
    // no es un nombre: es lo que RSC escribe siempre, y se traduce.
    const nombrePropio = nombreSuyo && nombreSuyo !== id && !/^[a-z0-9-]+$/.test(nombreSuyo) ? nombreSuyo : '';
    const dicho = nombres.comoSeLlama('ayudantes', id, {
      nombre: nombrePropio,
      queHace: nombres.enEspanol(fraseSuya) ? fraseSuya : '',
    });

    return {
      fichero: nombre,
      id,
      nombre: dicho.nombre,
      queHace: dicho.queHace,
      delArnes: dicho.deFuera,
      // Cómo se le pide al asistente que lo lance: por su identificador, que
      // es lo que él tiene en su carpeta. «Quiero que cobros atrasados haga lo
      // suyo» no nombraba nada que el asistente pudiera buscar.
      prompt: `Usa el agente «${id}» para esto y déjale hacer su encargo. Pregúntame lo que te falte.`,
    };
  });
}

const hayAlguno = () => queHay().length > 0;

// Abrir uno para leerlo. Solo de esa carpeta.
function dondeVive(fichero) {
  const carpeta = donde.carpetaDeAgentes();
  if (!carpeta || typeof fichero !== 'string') return null;

  const completa = path.resolve(carpeta, fichero);
  const dentro = path.resolve(carpeta) + path.sep;
  if (!completa.startsWith(dentro)) return null;
  return fs.existsSync(completa) ? completa : null;
}

module.exports = { queHay, hayAlguno, dondeVive };
