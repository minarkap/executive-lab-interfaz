// Dónde deja RSC cada cosa según el asistente para el que se montó el arnés,
// dicho para la barra: rutas de verdad de la carpeta que hay abierta.
//
// ── Por qué existe ───────────────────────────────────────────────────────
//
// Tres sitios de la barra leían rutas de Claude a pelo: las habilidades
// (`.claude/skills`), los botones (`.claude/commands`) y los ajustes. En un
// arnés montado para Codex esas carpetas no existen, así que la barra enseñaba
// **cero botones y cero habilidades sin dar ningún error** — la peor forma de
// fallar que tiene este proyecto, y la que ya nos ha mordido tres veces.
//
// ── Dónde está la tabla ──────────────────────────────────────────────────
//
// En `media/railes/sitios.js`, que no depende de VS Code. La necesitan dos
// sitios: esto y el instalador de los raíles, que es un script suelto que se
// ejecuta desde su propia carpeta. Mientras cada uno tuvo la suya, los raíles
// se escribían en `.claude/` aunque el arnés fuera de Codex.
//
// ── Lo que se descubrió al leer la de RSC ────────────────────────────────
//
// **Codex no tiene carpeta de comandos.** No es que esté en otro sitio: RSC
// solo escribe comandos para claude, cursor, gemini, opencode, copilot,
// windsurf, cline y roo. Con Codex no hay ninguno que leer, nunca. Eso no es un
// fallo nuestro, pero sí hay que decirlo en vez de enseñar un hueco.

const path = require('node:path');
const proyecto = require('./proyecto');
const sitios = require('../media/railes/sitios');

const SITIOS = sitios.SITIOS;

// De quién son las carpetas en que se mira: del asistente con el que se habla,
// que decide una sola función (E2). Se carga tarde: `asistentes` también usa esto.
//
// Salvo en un arnés montado fuera para asistentes que la barra no ofrece (E3):
// con uno solo para Cursor, la barra habla con Claude, pero lo montado está en
// lo de Cursor. Ahí se mira en lo del primero declarado; en lo de Claude, nunca.
const paraQuien = () => {
  const conQuien = require('./asistentes').conQuien().id;
  const declarados = (proyecto.declaracion() || {}).targets;
  return Array.isArray(declarados) && declarados.length && !declarados.includes(conQuien)
    ? declarados[0]
    : conQuien;
};

// Un asistente que RSC sabe montar y que no está en la tabla no se trata como
// Claude: se queda sin carpetas. Nunca se devuelve una ruta de Claude para un
// arnés que no es de Claude — preferimos no encontrar nada a encontrar lo ajeno.
const susSitios = () => sitios.sitiosDe(paraQuien()) || {};

// La carpeta de verdad, o null.
const carpetaDe = (cual) => {
  const partes = susSitios()[cual];
  return partes ? proyecto.ruta(...partes) : null;
};

// Lo mismo, pero para un asistente cualquiera y no para el de esta carpeta.
// Hace falta para mirar si aquí ya había montado otro antes de que llegáramos.
const carpetaDeOtro = (quien, cual) => {
  const partes = (sitios.sitiosDe(quien) || {})[cual];
  return partes ? proyecto.ruta(...partes) : null;
};

// Dónde apunta RSC lo que ha instalado **en esta máquina**. No viaja por git: es
// la diferencia entre «este repositorio declara un arnés» y «este ordenador lo
// tiene montado». Sin mirar esto, un repositorio clonado se ve idéntico a uno
// montado, y la barra pinta botones que no responden.
const ficheroDeEstadoDe = (quien) => {
  const carpeta = carpetaDeOtro(quien, 'habilidades');
  return carpeta ? path.join(carpeta, '.rsc-state.json') : null;
};
const ficheroDeEstado = () => ficheroDeEstadoDe(paraQuien());

const carpetaDeHabilidades = () => carpetaDe('habilidades');
const carpetaDeComandos = () => carpetaDe('comandos');
const carpetaDeAgentes = () => carpetaDe('agentes');
const ficheroDeAjustes = () => carpetaDe('ajustes');

// Cada asistente escribe las cosas a su manera (E3). Una habilidad es una
// carpeta con su SKILL.md, o un fichero suelto (Cursor: `<id>.mdc`); un comando
// es `<nombre>.md`, o `<nombre>.prompt.md` (Copilot), y se pide con `/nombre`, o
// con `/nombre.md` (Cline). Leerlas todas como las de Claude no veía ninguna
// habilidad de Cursor y pedía mal los comandos de los otros dos.
const habilidadEnUnFichero = () => susSitios().habilidadEnUnFichero || null;
const ficheroDeLaHabilidad = (id) => {
  const carpeta = carpetaDeHabilidades();
  if (!carpeta) return null;
  const ext = habilidadEnUnFichero();
  return ext ? path.join(carpeta, `${id}${ext}`) : path.join(carpeta, id, 'SKILL.md');
};
const acabaUnComando = () => susSitios().comandoAcabaEn || '.md';
// De un fichero de la carpeta de comandos, el comando y cómo se pide; o null si
// no es uno de este asistente.
const elComando = (fichero) => {
  const ext = acabaUnComando();
  if (!fichero.endsWith(ext) || fichero.length === ext.length) return null;
  const nombre = fichero.slice(0, -ext.length);
  return { nombre, prompt: `/${nombre}${susSitios().comandoSePideCon || ''}` };
};
const ficheroDelComando = (nombre) => {
  const carpeta = carpetaDeComandos();
  return carpeta ? path.join(carpeta, `${nombre}${acabaUnComando()}`) : null;
};

// ¿Este asistente llega a tener botones? Sirve para poder decir "aquí no hay
// botones porque este asistente no los tiene" en vez de dejar el hueco.
const puedeTenerBotones = () => Boolean(susSitios().comandos);
const puedeTenerAjustes = () => Boolean(susSitios().ajustes);

// ¿Y este asistente llega a tener frenos? RSC solo se los engancha a Claude, así
// que en un arnés de Codex no hay guardianes ni brújula al empezar: no es que
// estén apagados, es que no se montan. Sirve para poder decirlo en Las reglas en
// vez de enseñar la sección con un cero dentro.
const puedeTenerFrenos = () => Boolean(susSitios().frenos);

module.exports = {
  SITIOS, paraQuien, carpetaDeHabilidades, carpetaDeComandos, carpetaDeAgentes, ficheroDeAjustes,
  carpetaDeOtro, ficheroDeEstado, ficheroDeEstadoDe, puedeTenerBotones, puedeTenerAjustes,
  puedeTenerFrenos, habilidadEnUnFichero, ficheroDeLaHabilidad, acabaUnComando, elComando, ficheroDelComando,
};
