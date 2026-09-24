// Dónde deja RSC cada cosa, según el asistente para el que se montó el arnés.
//
// ── Por qué está aquí, al lado de los raíles ─────────────────────────────
//
// Esta tabla la necesitan dos sitios que no se pueden hablar: la barra
// (`extension/src/donde.js`, que vive dentro del editor y puede preguntar por
// la carpeta abierta) y el instalador de los raíles (`aplicar.js`, que es un
// script suelto que se lanza con `node` y no sabe nada de VS Code).
//
// Mientras la tabla estuvo solo en `donde.js`, `aplicar.js` escribía los
// raíles en `.claude/` pasara lo que pasara. Con un arnés de Codex eso ponía
// la habilidad que fija el español y el vocabulario, y los cuatro comandos, en
// una carpeta que Codex no lee jamás: sin error, sin aviso, y sin raíles. La
// peor forma de fallar que tiene este proyecto.
//
// Vive junto a los raíles y no en `extension/src/` porque `aplicar.js` se
// ejecuta desde dos carpetas —`skills/` en el repositorio y `media/railes/`
// dentro del .vsix— y desde las dos tiene que encontrarla al lado. La barra la
// lee desde donde esté (`../media/railes/sitios`). Una sola copia viva: la de
// `skills/` es la fuente, y la prueba de humo comprueba que no se separen.
//
// ── De dónde sale ────────────────────────────────────────────────────────
//
// Es copia de la de RSC (`targets/index.js`, `targets/commands.js` y
// `targets/agents.js`). Se copia y no se importa a propósito: ni la barra ni
// los raíles pueden depender de los interiores de un paquete que se instala
// aparte y que puede no estar.
//
// Copiada de la 1.4.1 el 18 de septiembre de 2026 y **contrastada contra la
// 2.0.5 el 21**: los tres ficheros son idénticos byte a byte, así que el salto
// de versión mayor no tocó ni una fila de esta tabla. La prueba de humo compara
// las dos tablas contra el arnés que viaja dentro, así que si algún día cambian
// se sabrá aquí antes que en la barra de nadie.

// `habilidades` es la carpeta donde quedan las habilidades; `comandos` la de
// los botones, o null si ese asistente no tiene; `ajustes` el fichero de
// permisos; `agentes` la carpeta de los ayudantes.
//
// `siempre` es el fichero que ese asistente se lee antes de cada cosa que
// hace. `compartido` dice si ese fichero es un documento de la casa —donde RSC
// mete su trozo entre marcas y deja el resto en paz, y donde nosotros podemos
// meter el nuestro igual— o un fichero propio de RSC, que reescribe entero en
// cada `sync` y donde escribir sería escribir en agua.
//
// `frenos` dice si RSC le engancha a ese asistente las piezas que se ejecutan
// solas: los tres guardianes y la familia de `session-start`. **Solo a Claude**
// — su instalador lo dice en una línea (`scripts/install-apply.js`):
//
//     export function generatedHookFiles({ target, cwd, policy }) {
//       if (target !== 'claude') return [];
//
// Importa más de lo que parece: con Codex no existe el freno ante órdenes
// peligrosas, que es justo el que protege a un alumno que no es técnico. Eso no
// se puede arreglar desde aquí, pero sí decirlo en vez de enseñar un cero. La
// memoria entre conversaciones es la excepción y no sale de aquí: esa sí la
// monta para Codex, por su propio camino (`targets/memory.js`), y la barra la
// ve como ve las demás — porque su fichero está en `.rsc/`.
const SITIOS = {
  claude: {
    habilidades: ['.claude', 'skills'],
    comandos: ['.claude', 'commands'],
    ajustes: ['.claude', 'settings.json'],
    agentes: ['.claude', 'agents'],
    // Claude encuentra sus habilidades solo: lee `.claude/skills/*/SKILL.md`.
    // No hay que apuntarle a ninguna.
    siempre: null,
    frenos: true,
  },
  codex: {
    habilidades: ['.codex', 'rsc'],
    comandos: null,
    ajustes: null,
    agentes: ['.codex', 'agents'],
    siempre: { fichero: ['AGENTS.md'], compartido: true },
  },
  cursor: {
    habilidades: ['.cursor', 'rules'],
    comandos: ['.cursor', 'commands'],
    ajustes: null,
    agentes: ['.cursor', 'agents'],
    siempre: { fichero: ['.cursor', 'rules', 'rsc-suggest.mdc'], compartido: false },
  },
  opencode: {
    habilidades: ['.opencode', 'rsc'],
    comandos: ['.opencode', 'commands'],
    ajustes: null,
    agentes: ['.opencode', 'agents'],
    siempre: { fichero: ['AGENTS.md'], compartido: true },
  },
  copilot: {
    habilidades: ['.github', 'rsc'],
    comandos: ['.github', 'prompts'],
    ajustes: null,
    agentes: ['.github', 'agents'],
    siempre: { fichero: ['.github', 'copilot-instructions.md'], compartido: true },
  },
  windsurf: {
    habilidades: ['.windsurf', 'rsc'],
    comandos: ['.windsurf', 'workflows'],
    ajustes: null,
    agentes: null,
    siempre: { fichero: ['.windsurf', 'rules', 'rsc-suggest.md'], compartido: false },
  },
  cline: {
    habilidades: ['.clinerules', 'rsc'],
    comandos: ['.clinerules', 'workflows'],
    ajustes: null,
    agentes: null,
    siempre: { fichero: ['.clinerules', 'rsc-suggest.md'], compartido: false },
  },
  roo: {
    habilidades: ['.roo', 'rsc'],
    comandos: ['.roo', 'commands'],
    ajustes: null,
    agentes: null,
    siempre: { fichero: ['.roo', 'rules', 'rsc-suggest.md'], compartido: false },
  },
  // Gemini escribe sus botones en TOML, que no es lo que sabemos leer. Se
  // declara para no tratarlo como desconocido, pero sin carpeta de botones.
  //
  // `noLeemos` dice que ese hueco es nuestro y a sabiendas, no un descuadre con
  // la tabla de RSC: la carpeta existe (`.gemini/commands`), lo que no hay es
  // quien la lea. La prueba que compara las dos tablas necesita saber la
  // diferencia, o cada vez que alguien la mire pensará que se ha roto algo.
  gemini: {
    habilidades: ['.gemini', 'rsc'],
    comandos: null,
    ajustes: null,
    agentes: ['.gemini', 'agents'],
    siempre: { fichero: ['GEMINI.md'], compartido: true },
    noLeemos: ['comandos'],
  },
  amp: {
    habilidades: ['.amp', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['AGENTS.md'], compartido: true },
  },
  jules: {
    habilidades: ['.jules', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['AGENTS.md'], compartido: true },
  },
  zed: {
    habilidades: ['.zed', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['AGENTS.md'], compartido: true },
  },
  // Los que RSC sabe montar y nosotros todavía no ofrecemos. Están para que un
  // arnés montado fuera de aquí no caiga en la tabla de Claude y acabe
  // enseñando —o escribiendo— cosas de otro asistente.
  antigravity: {
    habilidades: ['.antigravity', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['.antigravity', 'AGENTS.md'], compartido: true },
  },
  continue: {
    habilidades: ['.continue', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['.continue', 'rules', 'rsc-suggest.md'], compartido: false },
  },
  junie: {
    habilidades: ['.junie', 'rsc'], comandos: null, ajustes: null, agentes: ['.junie', 'agents'],
    siempre: { fichero: ['.junie', 'guidelines.md'], compartido: true },
  },
  kiro: {
    habilidades: ['.kiro', 'rsc'], comandos: null, ajustes: null, agentes: ['.kiro', 'agents'],
    siempre: { fichero: ['.kiro', 'steering', 'rsc-suggest.md'], compartido: false },
  },
  aider: {
    habilidades: ['.aider', 'rsc'], comandos: null, ajustes: null, agentes: null,
    siempre: { fichero: ['CONVENTIONS.md'], compartido: true },
  },
};

// Para cuál se montó una carpeta, a partir de lo que diga su `.rsc.json`.
//
// Sin declaración, Claude: es lo que monta nuestro instalador. Pero con una
// declaración que nombra un asistente que no está en la tabla **no se cae a
// Claude**: se devuelve tal cual, y quien pregunte por una carpeta se quedará
// sin ninguna. Preferimos no encontrar nada a encontrar lo ajeno — que era
// justo el fallo que esta tabla vino a arreglar.
function paraQuien(declaracion) {
  const targets = (declaracion || {}).targets;
  return Array.isArray(targets) && targets.length ? targets[0] : 'claude';
}

const sitiosDe = (quien) => SITIOS[quien] || null;

module.exports = { SITIOS, paraQuien, sitiosDe };
