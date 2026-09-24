// Las reglas de esta carpeta: lo que el asistente tiene que respetar siempre.
//
// ── Dónde vive, que son tres sitios y ninguno se veía ─────────────────────
//
// Me equivoqué al decirle a Jose que esto no existía en RSC. Existe, y es de
// lo primero que se lee:
//
//   · `02-DOCS/wiki/sdd/constitution.md` — los **innegociables** del proyecto.
//     El `CLAUDE.md` que escribe el arnés lo pone en su mapa bajo el rótulo
//     "Read first, always", junto al perfil de usuario y nada más. O sea: de
//     los cientos de ficheros de una carpeta, estos dos son los que se leen
//     antes de cada cosa que se hace.
//   · `CLAUDE.md`, sección "Working rules" — las reglas de la casa para
//     Claude: qué no se toca, qué no se publica, qué se mira antes.
//   · `AGENTS.md` — lo mismo para todo lo que no es Claude (Codex, Cursor).
//     El propio arnés dice que los dos van alineados.
//
// La constitución solo aparece cuando el arnés se monta con SDD; los otros dos
// los escribe siempre. Por eso aquí no se exige ninguno: se enseña lo que haya
// y se dice con todas las letras lo que falta, que es lo que permite ponerlo.

const fs = require('node:fs');
const proyecto = require('./proyecto');
const asistentes = require('./asistentes');
const donde = require('./donde');
const nombres = require('./nombres');
const trato = require('./trato');

const CONSTITUCION = ['02-DOCS', 'wiki', 'sdd', 'constitution.md'];
const DE_CLAUDE = ['CLAUDE.md'];
const DE_LOS_DEMAS = ['AGENTS.md'];

// ── Las reglas que no se piden por favor: se aplican solas ───────────────
//
// Los guardianes son lo único del arnés que puede **decirle que no** a
// alguien: se enganchan antes de cada orden y la paran si no cumple. Y no se
// nombraban en ningún sitio de la barra, así que quien recibía un bloqueo veía
// un mensaje en inglés que empieza por `BLOCKED` y no tenía dónde mirar.
//
// Se leen **del disco y gratis**, sin lanzar el arnés: cada uno mira su propio
// fichero para saber si está apagado (lo comprobé en su código,
// `targets/*-guard.mjs`), así que mirar ese mismo fichero es leer exactamente
// lo que él va a leer. El informe del doctor también lo sabe, pero cuesta un
// proceso, y esta pantalla se abre para leer, no para esperar.
//
// El sufijo del interruptor NO es uniforme —el de gitmoji es `.no-gitmoji`, no
// `.no-gitmoji-guard`— así que va escrito uno por uno y no calculado.
const GUARDIANES = [
  { id: 'danger-guard', fichero: 'danger-guard.mjs', interruptor: '.no-danger-guard', soloSiNoEsTecnico: true },
  { id: 'gitmoji-guard', fichero: 'gitmoji-guard.mjs', interruptor: '.no-gitmoji' },
  { id: 'ship-guard', fichero: 'ship-guard.mjs', interruptor: '.no-ship-guard' },
];

const hayEnRsc = (nombre) => {
  const ruta = proyecto.ruta('.rsc', nombre);
  return Boolean(ruta && fs.existsSync(ruta));
};

// ── Lo que hace solo, sin parar nada ─────────────────────────────────────
//
// Además de los tres frenos, el arnés engancha piezas que no le dicen que no
// a nadie: recuerdan, guardan, recogen. No se nombraban, y son la mitad de lo
// que un alumno ve pasar sin saber qué es —la brújula que aparece al abrir,
// el aviso de apuntar el diario al cerrar— (decisión 102). Se leen del disco
// como los guardianes: existe su fichero en `.rsc/`, y su interruptor `.no-*`
// es el que mira el propio código de RSC (`targets/session-start.mjs`,
// `userprompt-gate.mjs`, `worktree-reaper.mjs`, `scripts/install-apply.js`).
//
// Las tres comprobaciones de arranque —revisión periódica, arnés duplicado,
// reglas largas— viven dentro de `session-start.mjs`: están si está él.
// `context7` no deja fichero propio: RSC escribe el interruptor cuando el plan
// lo apaga, y si lo enciende lo apunta en la configuración del asistente. Se
// nombra cuando hay interruptor, que es cuando hay algo que explicar.
const AUTOMATISMOS = [
  { id: 'session-start', fichero: 'session-start.mjs' },
  { id: 'worklog-checkpoint', fichero: 'worklog-checkpoint.mjs' },
  { id: 'userprompt-gate', fichero: 'userprompt-gate.mjs', interruptor: '.no-feature-gate' },
  { id: 'worktree-reaper', fichero: 'worktree-reaper.mjs', interruptor: '.no-worktree-cleanup' },
  { id: 'session-memory', fichero: 'session-memory.mjs' },
  { id: 'audit', fichero: 'session-start.mjs', interruptor: '.no-audit' },
  { id: 'scope-check', fichero: 'session-start.mjs', interruptor: '.no-scope-check' },
  { id: 'claudemd-check', fichero: 'session-start.mjs', interruptor: '.no-claudemd-check' },
  { id: 'context7', interruptor: '.no-context7' },
];

function losAutomatismos() {
  return AUTOMATISMOS
    .filter((a) => hayEnRsc(a.fichero || a.interruptor))
    .map((a) => {
      const dicho = nombres.comoSeLlama('automatismos', a.id, {});
      const apagado = Boolean(a.interruptor && hayEnRsc(a.interruptor));
      return {
        id: a.id,
        nombre: dicho.nombre,
        queHace: dicho.queHace,
        estado: apagado ? 'apagado' : 'activo',
        porQue: apagado ? 'Apagado aquí, a propósito' : '',
      };
    });
}

// ── Lo que aquí se decidió no usar, junto y en español ───────────────────
//
// Dos fuentes que decían lo mismo a medias: `optOuts` de `.rsc.json` (lo que
// el plan aceptado apagó) y los interruptores `.rsc/.no-*` (lo que de verdad
// mira cada pieza al arrancar). La radiografía leía solo la primera y la
// enseñaba con el identificador en clave. Ahora se unen, sin repetir, y cada
// uno se nombra por su fila de guardián o de automatismo.
const OPT_OUT_A_PIEZA = { gitmoji: 'gitmoji-guard' };

// ── Y lo que aquí no puede estar puesto tampoco está apagado ─────────────
//
// Apagado es una decisión sobre algo que podría estar. Con Codex, RSC no
// engancha ninguna de estas piezas —lo dice su instalador en una línea, y
// `sitios.js` lo copia en la columna `frenos`—, así que nombrarlas aquí es
// contar una decisión que nadie tomó.
//
// Y pasaba: nuestros propios raíles dejan `.no-audit`, `.no-worktree-cleanup` y
// `.no-scope-check` en `.rsc/` sea cual sea el asistente, así que una carpeta de
// Codex decía tener apagada «La revisión periódica de habilidades» cuando ahí esa
// revisión no existe. La memoria entre conversaciones no se ve afectada: esa sí
// la monta RSC para Codex, y no tiene interruptor.
//
// Se mira por la clase de pieza y no por si está su fichero en `.rsc/`, porque
// `.rsc/` es de esta máquina y no viaja: en un clon no habría ni un interruptor,
// y lo que la declaración dice que se apagó sí tiene que seguir contándose.
const puedeEstarAqui = (pieza) => donde.puedeTenerFrenos() || !pieza || !pieza.fichero;

function loApagado() {
  const nombrar = (monton, id) => nombres.comoSeLlama(monton, id, {}).nombre;
  const lista = [];
  const meter = (id, nombre) => {
    if (!lista.some((x) => x.nombre === nombre)) lista.push({ id, nombre });
  };
  for (const g of GUARDIANES) if (hayEnRsc(g.interruptor) && puedeEstarAqui(g)) meter(g.id, nombrar('guardianes', g.id));
  for (const a of AUTOMATISMOS) {
    if (a.interruptor && hayEnRsc(a.interruptor) && puedeEstarAqui(a)) meter(a.id, nombrar('automatismos', a.id));
  }

  const declarados = (proyecto.declaracion() || {}).optOuts;
  for (const id of Array.isArray(declarados) ? declarados : []) {
    const pieza = OPT_OUT_A_PIEZA[id] || id;
    const esGuardian = GUARDIANES.find((g) => g.id === pieza);
    // Uno que no conocemos se nombra igual: no saber qué es no da derecho a
    // tragárselo. Lo que sí se calla es lo que sabemos que ahí no se monta.
    if (!puedeEstarAqui(esGuardian || AUTOMATISMOS.find((a) => a.id === pieza))) continue;
    meter(pieza, nombrar(esGuardian ? 'guardianes' : 'automatismos', pieza));
  }
  return lista;
}

// Qué guardianes hay montados y cuáles están actuando ahora mismo.
//
// Tres estados, y los tres significan cosas distintas para quien mira:
//   'armado'   está y te puede parar
//   'apagado'  está, y alguien decidió aquí que no actúe
//   'noAplica' está, pero contigo no actúa (el de órdenes peligrosas solo
//              actúa con quien no es técnico, y eso lo dice tu perfil)
function losGuardianes() {
  const eresTecnico = trato.comoEstamos().palabras === 'technical';

  return GUARDIANES
    .filter((g) => hayEnRsc(g.fichero))
    .map((g) => {
      const dicho = nombres.comoSeLlama('guardianes', g.id, {});
      const apagado = hayEnRsc(g.interruptor);
      const contigoNo = Boolean(g.soloSiNoEsTecnico && eresTecnico);
      return {
        id: g.id,
        nombre: dicho.nombre,
        queHace: dicho.queHace,
        estado: apagado ? 'apagado' : (contigoNo ? 'noAplica' : 'armado'),
        // Por qué no actúa, cuando no actúa. Sin esto, «no actúa» parece una
        // avería y es una decisión.
        porQue: apagado
          ? 'Apagado aquí, a propósito'
          : (contigoNo ? 'Contigo no actúa: tu perfil dice que eres técnico' : ''),
      };
    });
}

// Una regla ocupa una línea. Un fichero entero no cabe en la barra, y para
// leerlo entero está el botón que lo abre al lado.
const TOPE = 25;

function leer(...partes) {
  const ruta = proyecto.ruta(...partes);
  if (!ruta) return null;
  try {
    return fs.readFileSync(ruta, 'utf8');
  } catch {
    return null;
  }
}

// Las plantillas del arnés traen ejemplos entre llaves y encabezados de
// muestra. Enseñarlos como si fueran las reglas de esta empresa es mentir.
const ES_PLANTILLA = (t) => /[{}]|^(Template|Añade|Add)\b/i.test(t || '');

// Los puntos de una sección concreta. `## Working rules` en el de Claude,
// cualquier lista en la constitución.
function puntosDe(texto, seccion = null) {
  if (!texto) return [];

  let trozo = texto;
  if (seccion) {
    const desde = texto.search(new RegExp(`^##\\s+${seccion}\\s*$`, 'mi'));
    if (desde === -1) return [];
    const resto = texto.slice(desde).split('\n').slice(1).join('\n');
    const hasta = resto.search(/^##\s+/m);
    trozo = hasta === -1 ? resto : resto.slice(0, hasta);
  }

  return trozo.split('\n')
    .map((l) => l.match(/^\s*[-*]\s+(.{4,})$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((t) => !ES_PLANTILLA(t))
    .slice(0, TOPE);
}

// La constitución no siempre lleva guiones: puede ser prosa con encabezados.
// Se cogen los encabezados como títulos de principio, que es lo que son.
function principios(texto) {
  if (!texto) return [];
  const conGuion = puntosDe(texto);
  if (conGuion.length) return conGuion;

  return texto.split('\n')
    .map((l) => l.match(/^#{2,4}\s+(.{4,})$/))
    .filter(Boolean)
    .map((m) => m[1].trim())
    .filter((t) => !ES_PLANTILLA(t))
    .slice(0, TOPE);
}

function queHay() {
  const constitucion = leer(...CONSTITUCION);
  const deClaude = leer(...DE_CLAUDE);
  const deLosDemas = leer(...DE_LOS_DEMAS);

  // `AGENTS.md` repite las de `CLAUDE.md` por diseño, así que se enseña una
  // sola lista: dos listas iguales seguidas solo hacen dudar de si son
  // distintas. Manda la del asistente con el que se está hablando — con Codex,
  // `CLAUDE.md` no lo lee nadie, así que enseñarlo sería enseñar reglas que no
  // se están aplicando.
  const conCodex = asistentes.elDeAhora().id !== 'claude';
  const primero = conCodex ? deLosDemas : deClaude;
  const segundo = conCodex ? deClaude : deLosDemas;

  return {
    innegociables: principios(constitucion),
    // Lo que se comprueba solo, sin que nadie lo pida. Va aquí y no en otra
    // pantalla porque es lo mismo que lo de arriba —reglas de esta carpeta—
    // con la diferencia de que estas las aplica una máquina.
    guardianes: losGuardianes(),
    // Y lo que hace solo sin parar nada: va en el mismo desplegable, porque
    // es la misma pregunta —«¿qué hace esto por su cuenta?»— con otra respuesta.
    automatismos: losAutomatismos(),
    // Si este asistente llega a tener frenos. Con Codex no: RSC no le engancha
    // ninguno, así que la lista vacía no es un descuido de quien montó esto y la
    // pantalla lo tiene que decir en vez de enseñar un cero.
    puedeTenerFrenos: donde.puedeTenerFrenos(),
    deLaCasa: puntosDe(primero, 'Working rules').length
      ? puntosDe(primero, 'Working rules')
      : puntosDe(segundo, 'Working rules'),
    // Cuál se está leyendo, para que el botón de "verlas enteras" abra ese.
    cual: conCodex ? 'otros' : 'claude',
    hay: {
      constitucion: Boolean(constitucion),
      claude: Boolean(deClaude),
      otros: Boolean(deLosDemas),
    },
  };
}

// Para el botón que las abre enteras, al lado. Solo estos cuatro ficheros: los
// tres de reglas y el plan con el que RSC montó esto, que también es una
// decisión escrita de esta carpeta y no se podía abrir desde ningún sitio.
const PLAN_DE_MONTAJE = ['02-DOCS', 'wiki', 'harness', 'installation-plan.md'];

function dondeVive(cual) {
  const sitios = {
    constitucion: CONSTITUCION, claude: DE_CLAUDE, otros: DE_LOS_DEMAS, plan: PLAN_DE_MONTAJE,
  };
  const partes = sitios[cual];
  if (!partes) return null;
  const ruta = proyecto.ruta(...partes);
  return ruta && fs.existsSync(ruta) ? ruta : null;
}

module.exports = {
  queHay, dondeVive, losGuardianes, losAutomatismos, loApagado, GUARDIANES, AUTOMATISMOS,
};
