// Dónde deja RSC cada cosa según el asistente para el que se montó el arnés.
//
// ── Por qué existe ───────────────────────────────────────────────────────
//
// Tres sitios de la barra leían rutas de Claude a pelo: las habilidades
// (`.claude/skills`), los botones (`.claude/commands`) y los ajustes. En un
// arnés montado para Codex esas carpetas no existen, así que la barra enseñaba
// **cero botones y cero habilidades sin dar ningún error** — la peor forma de
// fallar que tiene este proyecto, y la que ya nos ha mordido tres veces.
//
// Esta tabla es copia de la de RSC (`targets/index.js` y `targets/commands.js`,
// versión 1.4.1, leída con permiso de Jose el 18 de septiembre de 2026). Se
// copia y no se importa a propósito: la barra no puede depender de los
// interiores de un paquete que se instala aparte y que puede no estar.
//
// ── Lo que se descubrió al leerla ────────────────────────────────────────
//
// **Codex no tiene carpeta de comandos.** No es que esté en otro sitio: RSC
// solo escribe comandos para claude, cursor, gemini, opencode, copilot,
// windsurf, cline y roo. Con Codex no hay ninguno que leer, nunca. Eso no es un
// fallo nuestro, pero sí hay que decirlo en vez de enseñar un hueco.

const proyecto = require('./proyecto');

// `habilidades` es la carpeta donde quedan; `comandos` la de los botones, o
// null si ese asistente no tiene. `ajustes` es el fichero de permisos, que solo
// tiene Claude.
const SITIOS = {
  claude: { habilidades: ['.claude', 'skills'], comandos: ['.claude', 'commands'], ajustes: ['.claude', 'settings.json'], agentes: ['.claude', 'agents'] },
  codex: { habilidades: ['.codex', 'rsc'], comandos: null, ajustes: null, agentes: ['.codex', 'agents'] },
  cursor: { habilidades: ['.cursor', 'rules'], comandos: ['.cursor', 'commands'], ajustes: null, agentes: ['.cursor', 'agents'] },
  opencode: { habilidades: ['.opencode', 'rsc'], comandos: ['.opencode', 'commands'], ajustes: null, agentes: ['.opencode', 'agents'] },
  copilot: { habilidades: ['.github', 'rsc'], comandos: ['.github', 'prompts'], ajustes: null, agentes: ['.github', 'agents'] },
  windsurf: { habilidades: ['.windsurf', 'rsc'], comandos: ['.windsurf', 'workflows'], ajustes: null },
  cline: { habilidades: ['.clinerules', 'rsc'], comandos: ['.clinerules', 'workflows'], ajustes: null },
  roo: { habilidades: ['.roo', 'rsc'], comandos: ['.roo', 'commands'], ajustes: null },
  // Gemini los escribe en TOML, que no es lo que sabemos leer. Se declara para
  // no tratarlo como desconocido, pero sin carpeta de botones.
  gemini: { habilidades: ['.gemini', 'rsc'], comandos: null, ajustes: null, agentes: ['.gemini', 'agents'] },
  amp: { habilidades: ['.amp', 'rsc'], comandos: null, ajustes: null },
  jules: { habilidades: ['.jules', 'rsc'], comandos: null, ajustes: null },
  zed: { habilidades: ['.zed', 'rsc'], comandos: null, ajustes: null },
};

// Para cuál se montó esta carpeta. Lo dice `.rsc.json`; sin él, Claude, que es
// lo que monta nuestro instalador.
function paraQuien() {
  const targets = (proyecto.declaracion() || {}).targets;
  const primero = Array.isArray(targets) && targets.length ? targets[0] : 'claude';
  return SITIOS[primero] ? primero : 'claude';
}

const sitios = (quien = paraQuien()) => SITIOS[quien] || SITIOS.claude;

// La carpeta de verdad, o null. Nunca se devuelve una ruta de Claude para un
// arnés que no es de Claude: preferimos no encontrar nada a encontrar lo ajeno.
const carpetaDeHabilidades = () => {
  const partes = sitios().habilidades;
  return partes ? proyecto.ruta(...partes) : null;
};

const carpetaDeComandos = () => {
  const partes = sitios().comandos;
  return partes ? proyecto.ruta(...partes) : null;
};

const carpetaDeAgentes = () => {
  const partes = sitios().agentes;
  return partes ? proyecto.ruta(...partes) : null;
};

const ficheroDeAjustes = () => {
  const partes = sitios().ajustes;
  return partes ? proyecto.ruta(...partes) : null;
};

// ¿Este asistente llega a tener botones? Sirve para poder decir "aquí no hay
// botones porque este asistente no los tiene" en vez de dejar el hueco.
const puedeTenerBotones = () => Boolean(sitios().comandos);
const puedeTenerAjustes = () => Boolean(sitios().ajustes);

module.exports = {
  SITIOS, paraQuien, carpetaDeHabilidades, carpetaDeComandos, carpetaDeAgentes, ficheroDeAjustes, puedeTenerBotones, puedeTenerAjustes,
};
