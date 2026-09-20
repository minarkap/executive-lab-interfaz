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

// Para cuál se montó esta carpeta. Lo dice `.rsc.json`; sin él, Claude, que es
// lo que monta nuestro instalador.
const paraQuien = () => sitios.paraQuien(proyecto.declaracion());

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

// ¿Este asistente llega a tener botones? Sirve para poder decir "aquí no hay
// botones porque este asistente no los tiene" en vez de dejar el hueco.
const puedeTenerBotones = () => Boolean(susSitios().comandos);
const puedeTenerAjustes = () => Boolean(susSitios().ajustes);

module.exports = {
  SITIOS, paraQuien, carpetaDeHabilidades, carpetaDeComandos, carpetaDeAgentes, ficheroDeAjustes,
  carpetaDeOtro, ficheroDeEstado, ficheroDeEstadoDe, puedeTenerBotones, puedeTenerAjustes,
};
