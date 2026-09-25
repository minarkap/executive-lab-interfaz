// Una carpeta que ya era de alguien: qué va a tocar el arnés de lo suyo, y qué
// se hace con lo que se llama igual que algo del arnés.
//
// ── Por qué existe ──────────────────────────────────────────────────────
//
// Se montaba sin enseñar nada. RSC dice en su plan lo que va a gestionar
// («Managed paths»), y en una carpeta de alguien eso incluye ficheros suyos: su
// `.gitignore`, los ajustes de Claude de la carpeta. Y una habilidad suya que
// se llame como una del arnés —`review`, `plan`, `debug`— la cambia por la del
// arnés y guarda la suya en sus copias (B4). Mientras, la pantalla prometía
// «No voy a tocar nada de esto».
//
// Jose, decisión 3: se pide el sí, y por cada nombre que choque se pregunta si
// sobrescribir o cambiarle el nombre al suyo. P4, enmendada, pide lo mismo:
// sí explícito, copia recuperable, y sin respuesta no se monta.
//
// ── Lo que hace RSC con cada cosa, medido con el paquete ─────────────────
//
//   habilidad  pone la suya encima (un enlace) y guarda la de la persona en
//              `.rsc/backups/`
//   comando    si ya hay uno de la persona con ese nombre, lo deja y no pone el
//   agente     suyo (`targets/commands.js` y `targets/agents.js`, «collisions»)
//
// Así que «sobrescribir» solo existe con las habilidades. Con un comando o un
// agente, lo que se elige es dejar el suyo o cambiarle el nombre para que
// entre también el del arnés.

const fs = require('node:fs');
const path = require('node:path');
const sitios = require('../media/railes/sitios');

// Lo de RSC y de cada máquina: en una carpeta de alguien todavía no existe, y
// si existiera no sería de esa persona.
const DE_RSC = /^(\.rsc\.json$|\.rsc\/|\.claude\/rsc-bootstrap\.mjs$|.*\/\.rsc-state\.json$)/;

// Lo que se toca, dicho como se dice. Lo que no está aquí se nombra por su
// fichero, que es mejor que callarlo.
function comoSeDice(rel) {
  if (rel === '.gitignore') return 'la lista de lo que no entra en git';
  if (/^\.claude\/settings(\.local)?\.json$/.test(rel)) return 'los ajustes de Claude de esta carpeta';
  if (/^(AGENTS|CLAUDE|GEMINI|CONVENTIONS)\.md$/.test(rel)) return 'Cómo se trabaja aquí';
  if (rel.startsWith('02-DOCS/wiki/harness/')) return 'el perfil y las decisiones del arnés';
  return `el fichero ${rel}`;
}

// Si lo que va a gestionar RSC es una habilidad, un comando o un agente que ya
// es de esta persona. Un enlace no cuenta: lo pone RSC, no quien trabaja aquí.
function queChoca(rel, info) {
  for (const suyo of Object.values(sitios.SITIOS)) {
    const carpeta = (partes) => (partes ? partes.join('/') : null);
    const habilidades = carpeta(suyo.habilidades);
    const comandos = carpeta(suyo.comandos);
    const agentes = carpeta(suyo.agentes);

    if (habilidades && path.posix.dirname(rel) === habilidades && info.isDirectory() && !info.isSymbolicLink()) {
      return { que: 'habilidad', id: path.posix.basename(rel) };
    }
    if (comandos && path.posix.dirname(rel) === comandos && rel.endsWith('.md') && info.isFile()) {
      return { que: 'comando', id: path.posix.basename(rel, '.md') };
    }
    if (agentes && path.posix.dirname(rel) === agentes && rel.endsWith('.md') && info.isFile()) {
      return { que: 'agente', id: path.posix.basename(rel, '.md') };
    }
  }
  return null;
}

// El nombre que se le propone: `<id>-propia` para una habilidad y `-propio`
// para un comando o un agente, y con un número si ese también está cogido.
function nombreLibre(raiz, rel, que, id) {
  const carpeta = path.posix.dirname(rel);
  const final = que === 'habilidad' ? 'propia' : 'propio';
  const extension = que === 'habilidad' ? '' : '.md';
  for (let n = 1; n < 100; n += 1) {
    const candidato = n === 1 ? `${id}-${final}` : `${id}-${final}-${n}`;
    if (!fs.existsSync(path.join(raiz, ...carpeta.split('/'), `${candidato}${extension}`))) return candidato;
  }
  return `${id}-${final}-${Date.now()}`;
}

function resumen(plan, raiz) {
  const tocados = [];
  const choques = [];
  for (const gestionado of plan.gestionados || []) {
    const rel = gestionado.replace(/\/+$/, '');
    if (!rel || DE_RSC.test(rel)) continue;

    let info;
    try {
      info = fs.lstatSync(path.join(raiz, ...rel.split('/')));
    } catch {
      continue; // no existe: no es de nadie, se añade
    }

    const choque = queChoca(rel, info);
    if (choque) {
      choques.push({ ...choque, fichero: rel, sugerido: nombreLibre(raiz, rel, choque.que, choque.id) });
      continue;
    }
    // Una carpeta que RSC gestiona entera y que ya existía, como la del perfil,
    // se cuenta una vez por lo que es.
    const dicho = comoSeDice(rel);
    if (!tocados.some((t) => t.enCristiano === dicho)) tocados.push({ fichero: rel, enCristiano: dicho });
  }
  // Y lo que tocan los raíles, que no sale en el plan de RSC: con Claude, un
  // bloque en su `CLAUDE.md` para que lo que vale siempre se cargue en cada
  // conversación (D1, C-4).
  const conClaude = (plan.gestionados || []).some((g) => g.startsWith('.claude/'));
  if (conClaude && require('./terreno').tieneTexto(path.join(raiz, 'CLAUDE.md'))) {
    const dicho = comoSeDice('CLAUDE.md');
    if (!tocados.some((t) => t.enCristiano === dicho)) tocados.push({ fichero: 'CLAUDE.md', enCristiano: dicho });
  }
  return { tocados, choques };
}

// Cambia `name:` en la cabecera, si la hay. Con función y no con texto: un
// nombre con `$&` no se interpreta.
function cambiarElNombreDentro(fichero, nuevo) {
  if (!fs.existsSync(fichero)) return;
  const texto = fs.readFileSync(fichero, 'utf8');
  const cabecera = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!cabecera || !/^name:.*$/m.test(cabecera[1])) return;
  const nueva = cabecera[0].replace(/^name:.*$/m, () => `name: ${nuevo}`);
  fs.writeFileSync(fichero, texto.replace(cabecera[0], () => nueva));
}

// `elecciones[fichero]` es 'renombrar' o 'dejar'. Dejar no hace nada: con una
// habilidad, RSC pone la suya y guarda la de la persona; con un comando o un
// agente, RSC deja el de la persona. Si algo no se puede renombrar, se para
// ahí y se dice cuál (C-9): no se monta a medias sobre lo de alguien.
const esUnEnlace = (fichero) => {
  try {
    return fs.lstatSync(fichero).isSymbolicLink();
  } catch {
    return false;
  }
};

// Si se puede renombrar sin tocar nada de fuera, o por qué no.
function porQueNoSeRenombra(choque, raiz) {
  const desde = path.join(raiz, ...choque.fichero.split('/'));
  const hacia = path.join(path.dirname(desde), `${choque.sugerido}${choque.que === 'habilidad' ? '' : '.md'}`);
  const conNombre = choque.que === 'habilidad' ? path.join(desde, 'SKILL.md') : desde;
  if (fs.existsSync(hacia)) return `ya existe ${path.basename(hacia)}`; // diccionario: interno
  // Cambiar el `name:` de un enlace escribe en el fichero al que apunta, fuera
  // de esta carpeta y quizá de otros proyectos (revisión de F2, I4).
  if (esUnEnlace(conNombre)) return `${path.basename(conNombre)} es un enlace a otro sitio`; // diccionario: interno
  return null;
}

function resolver(choques, elecciones, raiz) {
  const renombrados = [];
  // Todo se mira antes de mover nada: parar a medias dejaría unas renombradas y
  // otras no.
  for (const choque of choques) {
    if (elecciones[choque.fichero] !== 'renombrar') continue;
    const motivo = porQueNoSeRenombra(choque, raiz);
    if (motivo) return { ok: false, fallo: choque, error: motivo, renombrados };
  }
  for (const choque of choques) {
    if (elecciones[choque.fichero] !== 'renombrar') continue;
    const desde = path.join(raiz, ...choque.fichero.split('/'));
    const extension = choque.que === 'habilidad' ? '' : '.md';
    const hacia = path.join(path.dirname(desde), `${choque.sugerido}${extension}`);
    try {
      fs.renameSync(desde, hacia);
      cambiarElNombreDentro(choque.que === 'habilidad' ? path.join(hacia, 'SKILL.md') : hacia, choque.sugerido);
    } catch (error) {
      return { ok: false, fallo: choque, error: error.message, renombrados };
    }
    renombrados.push({ que: choque.que, id: choque.id, ahora: choque.sugerido });
  }
  return { ok: true, renombrados };
}

module.exports = { resumen, resolver, comoSeDice };
