// Qué hay en esta carpeta, antes de tocar nada.
//
// Por qué existe: "Preparar esta carpeta" daba por hecho que la carpeta estaba
// vacía. El único guardarraíl era `.rsc.json` — si no estaba, se montaba el
// arnés y punto. En una carpeta con un proyecto ya empezado eso hacía dos
// cosas feas:
//
//   1. Montar un arnés encima sin decir qué había debajo.
//   2. Terminar con `git add -A` y una copia de seguridad llamada "Punto de
//      partida". No se pierde nada —es un commit, no un reset— pero te mete
//      todo el trabajo sin guardar en un commit nuestro, dentro de TU
//      historial. Eso no se hace en la carpeta de otro.
//
// Así que primero se mira, y de lo que se ve sale lo que el panel ofrece. La
// regla: en una carpeta que ya es de alguien, no se toca nada sin decirlo.

const fs = require('node:fs');
const path = require('node:path');

const proyecto = require('./proyecto');
const procesos = require('./procesos');
const sueltas = require('./sueltas');
const git = require('./git');

// Lo que no cuenta como "algo de alguien": lo pone el sistema o lo ponemos
// nosotros, y su presencia no convierte una carpeta vacía en un proyecto.
const NO_CUENTA = new Set(['.git', '.DS_Store', '.vscode', 'Thumbs.db', '.localized']);

function loQueHayDentro(raiz) {
  try {
    return fs.readdirSync(raiz).filter((n) => !NO_CUENTA.has(n));
  } catch {
    return [];
  }
}

// ¿Este historial es nuestro o de alguien? Nuestro quiere decir: lo creó el
// botón de preparar y no hay nada más dentro. Con un solo dato basta — si hay
// commits que no hemos escrito nosotros, es de alguien.
async function historialAjeno(raiz) {
  if (!fs.existsSync(path.join(raiz, '.git'))) return false;

  const { codigo, salida } = await procesos.git('log', '--format=%an', '-n', '20');
  if (codigo !== 0) return false; // repositorio recién creado, sin commits

  const autores = salida.split('\n').map((a) => a.trim()).filter(Boolean);
  return autores.some((quien) => quien !== 'Executive Lab');
}

async function cambiosSinGuardar(raiz) {
  if (!fs.existsSync(path.join(raiz, '.git'))) return 0;
  const { codigo, salida } = await procesos.git('status', '--porcelain');
  if (codigo !== 0) return 0;
  return salida.trim() ? salida.trim().split('\n').length : 0;
}

// De qué va el proyecto que ya hay, dicho en cristiano y solo si se sabe. No es
// una lista de tecnologías: es para que quien lo lee reconozca su carpeta.
const PISTAS = [
  ['package.json', 'una aplicación'],
  ['requirements.txt', 'algo en Python'],
  ['pyproject.toml', 'algo en Python'],
  ['Gemfile', 'algo en Ruby'],
  ['go.mod', 'algo en Go'],
  ['pom.xml', 'algo en Java'],
  ['Cargo.toml', 'algo en Rust'],
  ['composer.json', 'algo en PHP'],
  ['index.html', 'una web'],
  ['docker-compose.yml', 'varios servicios'],
];

function deQueParece(raiz) {
  if (!raiz) return null;
  for (const [fichero, dicho] of PISTAS) {
    if (fs.existsSync(path.join(raiz, fichero))) return dicho;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
//                        EL PARTE DE RECONOCIMIENTO
// ─────────────────────────────────────────────────────────────────────────
//
// Se mira ANTES de preguntar nada. Jose: *«primero, antes de lanzar las
// preguntas, debería escanear la carpeta»*. Y no es un capricho de orden: de lo
// que se encuentre depende qué rama se toma y, sobre todo, **qué no hay que
// volver a preguntar**.
//
// `queHay()` sabía distinguir cinco casos y con eso se quedaba corto en tres
// sitios, los tres callejones sin salida de la barra:
//
//   · un repositorio **clonado** con arnés dentro se veía igual que uno
//     montado, porque lo declarado en `.rsc.json` tapaba lo que falta en disco;
//   · un `.rsc.json` **ilegible** —marcas de conflicto de merge, que el propio
//     RSC avisa de que pasan— se veía como una carpeta sin arnés, y se habría
//     montado uno encima;
//   · una carpeta con **otro montaje de asistente** hecho a mano se trataba
//     como una carpeta cualquiera y se le montaba RSC sin decir una palabra.
//
// El parte se calcula en tres niveles, separados por lo que cuesta sacarlos:
// así la brújula puede pedirlo cien veces sin lanzar un proceso, y el arranque
// lo pide una vez a fondo con barra de progreso.

const rsc = require('./rsc');
const donde = require('./donde');
const sitios = require('../media/railes/sitios');

// Los cuatro ficheros de raíz que se llevan la peor parte de un merge y que un
// asistente lee siempre. Si alguno tiene contenido, aquí había alguien.
const FICHEROS_DE_ASISTENTE = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', 'CONVENTIONS.md', '.cursorrules'];

const tieneAlgoDentro = (carpeta) => {
  if (!carpeta || !fs.existsSync(carpeta)) return 0;
  try {
    return fs.readdirSync(carpeta).filter((n) => !n.startsWith('.')).length;
  } catch {
    return 0;
  }
};

const tieneTexto = (fichero) => {
  if (!fichero || !fs.existsSync(fichero)) return false;
  try {
    return fs.readFileSync(fichero, 'utf8').trim().length > 0;
  } catch {
    return false;
  }
};

// ── Otro montaje de asistente, que no es el nuestro ──────────────────────
//
// Jose: *«si hay un arnés distinto al RSC hay que avisar al usuario y decirle
// si quiere implementar RSC […] adaptamos la estructura del proyecto a la
// estructura de RSC pero mantenemos lo que ya tenía»*.
//
// Para poder decírselo hay que saber QUÉ tiene, no solo que tiene algo. Se
// recorre la tabla de asistentes y se cuenta lo que hay en cada carpeta suya.
function otroMontaje() {
  const encontrados = [];

  for (const quien of Object.keys(sitios.SITIOS)) {
    const habilidades = tieneAlgoDentro(donde.carpetaDeOtro(quien, 'habilidades'));
    const comandos = tieneAlgoDentro(donde.carpetaDeOtro(quien, 'comandos'));
    const agentes = tieneAlgoDentro(donde.carpetaDeOtro(quien, 'agentes'));

    const suyo = sitios.sitiosDe(quien) || {};
    const siempre = suyo.siempre ? proyecto.ruta(...suyo.siempre.fichero) : null;

    // Que exista el fichero de estado de RSC dentro quiere decir que esto lo
    // montó RSC alguna vez, aunque ahora no haya `.rsc.json`. No es "otro
    // arnés": es el nuestro, roto. Se apunta para que la rama lo sepa.
    const deRsc = fs.existsSync(donde.ficheroDeEstadoDe(quien) || '');

    if (habilidades || comandos || agentes || (siempre && tieneTexto(siempre))) {
      encontrados.push({ quien, habilidades, comandos, agentes, deRsc });
    }
  }

  // Y los ficheros de raíz que no cuelgan de ninguna carpeta de asistente.
  const sueltos = FICHEROS_DE_ASISTENTE.filter((n) => tieneTexto(proyecto.ruta(n)));

  return { asistentes: encontrados, ficheros: sueltos };
}

// Lo que cuesta un `readdir` y un `JSON.parse`. Nada de procesos.
//
// Esto se puede llamar en cada repintado sin pensarlo. Lo que lanza git va
// aparte, abajo, porque la pantalla principal se repinta sola y no puede
// permitirse dos subprocesos cada vez.
function mirar() {
  const raiz = proyecto.raiz();

  // Sin carpeta abierta no hay nada que mirar, y varias de las piezas de abajo
  // dan por hecho que hay una ruta. Se corta aquí.
  if (!raiz) {
    return {
      raiz: null,
      carpeta: { vacia: true, cuantos: 0, parece: null },
      declarada: 'no',
      declaracion: null,
      recibo: null,
      suelo: { declaracion: false, conexiones: false, conocimiento: false, faltan: [] },
      habilidades: { declaradas: [], enDisco: [], colgando: [] },
      conEstadoDeRsc: false,
      otroMontaje: { asistentes: [], ficheros: [] },
      claves: null,
    };
  }

  const dentro = loQueHayDentro(raiz);
  const declarada = proyecto.comoEstaLaDeclaracion();
  const declaracion = declarada === 'ok' ? proyecto.declaracion() : null;

  const suelo = proyecto.sueloDelArnes();
  const declaradas = declaracion
    ? [...new Set([...(declaracion.skills || []), ...(declaracion.ownSkills || [])])]
    : [];
  const enDisco = rsc.habilidadesEnDisco();

  return {
    raiz,
    carpeta: { vacia: !dentro.length, cuantos: dentro.length, parece: deQueParece(raiz) },
    declarada,
    declaracion,
    recibo: proyecto.recibo(),
    suelo: { ...suelo, faltan: Object.entries(suelo).filter(([, hay]) => !hay).map(([que]) => que) },
    habilidades: {
      declaradas,
      enDisco,
      // Declaradas y no montadas aquí: lo que RSC llama «what a fresh clone
      // looks like». Se arregla con `sync`, no volviendo a montar.
      colgando: declaradas.filter((id) => !enDisco.includes(id)),
    },
    conEstadoDeRsc: fs.existsSync(donde.ficheroDeEstado() || ''),
    otroMontaje: otroMontaje(),
    claves: sueltas.resumen(),
  };
}

// Lo de arriba más el estado, todavía sin tocar git.
function mirarYClasificar() {
  const visto = mirar();
  return { ...visto, estado: queEstadoEs(visto) };
}

// El estado, derivado de lo de arriba. Nueve, excluyentes, y en este orden.
function queEstadoEs(visto) {
  if (!visto.raiz) return 'sinCarpeta';
  if (visto.declarada === 'rota') return 'reciboRoto';

  if (visto.declarada === 'no') {
    // Sin `.rsc.json` pero con carpetas de asistente puestas: aquí ya había un
    // montaje, nuestro o de otro. Si trae el fichero de estado de RSC es el
    // nuestro sin declaración; si no, es de alguien.
    const hayOtro = visto.otroMontaje.asistentes.length || visto.otroMontaje.ficheros.length;
    if (hayOtro) return 'otroArnes';
    return visto.carpeta.vacia ? 'vacia' : 'empezada';
  }

  // Con `.rsc.json`: primero lo que impide usarlo, después lo que falta.
  if (!visto.recibo) return 'sinRecibo';
  if (visto.habilidades.colgando.length && !visto.habilidades.enDisco.length) return 'clonado';
  if (visto.suelo.faltan.length) return 'aMedias';
  return 'conArnes';
}

// El parte entero. `profundo` añade lo que cuesta subprocesos de RSC, que solo
// hace falta al arrancar y al revisar — nunca en la pantalla principal.
async function reconocer({ profundo = false } = {}) {
  const visto = mirarYClasificar();

  if (visto.estado === 'sinCarpeta') {
    return Object.freeze({ ...visto, git: { hay: false, repositorio: false, ajeno: false, sinGuardar: 0 } });
  }

  const parte = { ...visto, git: await comoEstaElHistorial(visto.raiz) };

  if (!profundo) return Object.freeze(parte);

  // Lo caro, y solo cuando alguien está esperando delante de una barra.
  const [salud, reparaciones] = await Promise.all([rsc.salud(), rsc.arreglarEnSeco()]);
  return Object.freeze({
    ...parte,
    arnes: {
      salud: leerSalud(salud),
      reparaciones: leerReparaciones(reparaciones),
    },
  });
}

// Git: si está en el ordenador, si esta carpeta es un repositorio, si el
// historial es de alguien y cuánto hay sin guardar. Dos subprocesos, y por eso
// va aparte de `mirar()`.
async function comoEstaElHistorial(raiz) {
  const [hay, ajeno, sinGuardar] = await Promise.all([
    git.hay(),
    historialAjeno(raiz),
    cambiosSinGuardar(raiz),
  ]);
  return {
    hay,
    repositorio: fs.existsSync(path.join(raiz, '.git')),
    ajeno,
    sinGuardar,
    sePuedeInstalarSolo: git.sePuedeInstalarSolo(),
  };
}

// `doctor --json` sale entero por la salida normal. Si no se puede leer, se
// dice que no se sabe: inventarse un informe sano sería peor que no tenerlo.
function leerSalud({ codigo, salida }) {
  if (codigo !== 0) return null;
  try {
    return JSON.parse(salida);
  } catch {
    return null;
  }
}

// `repair --dry-run` imprime una línea por hallazgo, marcada `[fix]` si la sabe
// arreglar sola y `[ask]` si hace falta que alguien decida. La diferencia
// importa: `repair --yes` a ciegas aplicaría también los `[ask]`, y uno de
// ellos —`wrong-target`— **mueve el arnés a otro asistente**.
function leerReparaciones({ codigo, salida }) {
  if (codigo !== 0) return { solas: [], aDecidir: [], sano: false };
  const lineas = String(salida || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return {
    sano: /Nothing to repair/i.test(salida || ''),
    solas: lineas.filter((l) => l.includes('[fix]')),
    aDecidir: lineas.filter((l) => l.includes('[ask]')),
  };
}

// El estado de la carpeta, en una palabra, y con lo que haga falta para
// contarlo. Los cinco casos son excluyentes y cubren todo.
//
//   sinCarpeta    no hay ninguna abierta
//   conArnes      ya tiene arnés y está entero
//   aMedias       tiene .rsc.json pero le falta suelo
//   vacia         no hay nada: se puede preparar sin pensar
//   empezada      ya es de alguien; hay que decir qué hay antes de tocar
//
// ── Por qué esto es ahora una proyección ─────────────────────────────────
//
// `reconocer()` distingue nueve estados; esta función sigue devolviendo los
// cinco de siempre, colapsando los cuatro nuevos a lo que ya se veía. No es
// deuda: es lo que permite cambiar el reconocimiento sin tocar la brújula, el
// informe de soporte ni la radiografía, que llevan meses leyendo estas cinco
// palabras. Quien necesite el detalle —el arranque— pide `reconocer()`.
//
// El colapso, fila a fila:
//
//   reciboRoto  → lo que diga el suelo. Hoy `.rsc.json` ilegible ya se veía
//                 como arnés, porque solo se miraba que el fichero existiera.
//   clonado     → lo que diga el suelo, ídem.
//   sinRecibo   → lo que diga el suelo, ídem.
//   otroArnes   → 'empezada': sin `.rsc.json`, es una carpeta con cosas.
const COMO_SE_VEIA = {
  sinCarpeta: () => 'sinCarpeta',
  vacia: () => 'vacia',
  empezada: () => 'empezada',
  otroArnes: () => 'empezada',
  conArnes: () => 'conArnes',
  aMedias: () => 'aMedias',
  reciboRoto: (visto) => (visto.suelo.faltan.length ? 'aMedias' : 'conArnes'),
  clonado: (visto) => (visto.suelo.faltan.length ? 'aMedias' : 'conArnes'),
  sinRecibo: (visto) => (visto.suelo.faltan.length ? 'aMedias' : 'conArnes'),
};

async function queHay() {
  const visto = mirarYClasificar();
  const tipo = COMO_SE_VEIA[visto.estado](visto);

  if (tipo !== 'empezada') return { tipo };

  // Solo aquí se lanza git, igual que antes: es el único caso que necesita
  // saber de quién es el historial y cuánto hay sin guardar.
  const historial = await comoEstaElHistorial(visto.raiz);

  return {
    tipo,
    cuantos: visto.carpeta.cuantos,
    parece: visto.carpeta.parece,
    conHistorial: historial.ajeno,
    sinGuardar: historial.sinGuardar,
    // Claves sueltas en ficheros que ya estaban: no se tocan, se cuentan, y el
    // asistente ya sabe qué hacer con ellas cuando el arnés esté montado.
    claves: visto.claves,
  };
}

// ¿Podemos dejar un "Punto de partida" en el historial de esta carpeta?
//
// Solo si el historial es nuestro. En el de alguien no se escribe: se monta el
// arnés, se deja todo en el disco y que esa persona lo guarde cuando quiera,
// con su mensaje y en su momento.
const podemosGuardarElPuntoDePartida = async () => !(await historialAjeno(proyecto.raiz()));

// ---------------------------------------------------------- la radiografía

// "¿Hasta qué punto está montada esta carpeta?" — pieza por pieza, y sin
// esconder lo que falta.
//
// Existe porque la pantalla principal solo sabe decir dos cosas: o hay arnés o
// no. Y entre medias hay mucho: un arnés montado sin conexiones, conexiones a
// medias, claves que están pero fuera de sitio, una wiki vacía. Quien mira la
// barra y no ve conexiones no sabe si es que no hay o es que no las encuentra.
// Esto lo dice.
async function radiografia() {
  const conexiones = require('./conexiones');
  const cerebro = require('./cerebro');
  const acciones = require('./acciones');
  const github = require('./github');
  const asistentes = require('./asistentes');
  const donde = require('./donde');

  const hay = await queHay();
  if (hay.tipo === 'sinCarpeta') return { queEs: hay.tipo, piezas: [] };

  const conArnes = hay.tipo === 'conArnes' || hay.tipo === 'aMedias';
  const proveedores = conArnes ? conexiones.proveedores() : [];
  const aMedias = proveedores.filter((p) => p.faltan > 0).length;
  const fuera = sueltas.resumen();
  const temas = conArnes ? cerebro.catalogo().length : 0;
  const botones = conArnes ? acciones.acciones().length : 0;
  const cuenta = await github.estado();

  // Con quién habla esta carpeta, y si esa persona lo tiene puesto.
  //
  // Faltaba, y era la primera pregunta: una carpeta montada para un asistente
  // que no está instalado se comporta como si estuviera rota —los botones no
  // hacen nada— y aquí no salía por ningún lado. Lo sabíamos de sobra
  // (`asistentes.comoEstamos`) y no lo decíamos.
  const conQuien = asistentes.elDeAhora();
  const loTiene = conQuien ? asistentes.estaInstalado(conQuien) : false;

  // Cada pieza: si está, cuánto hay, y qué se puede hacer si falta. `estado` es
  // 'si' | 'no' | 'aMedias', y de ahí sale cómo se pinta.
  const piezas = [
    {
      nombre: 'El asistente, montado aquí',
      estado: hay.tipo === 'conArnes' ? 'si' : hay.tipo === 'aMedias' ? 'aMedias' : 'no',
      detalle: hay.tipo === 'conArnes' ? 'Listo' : hay.tipo === 'aMedias' ? 'Se quedó a medias' : 'Todavía no',
    },
    {
      nombre: 'Con quién hablas',
      estado: loTiene ? 'si' : 'no',
      detalle: loTiene
        ? conQuien.nombre
        : `${conQuien ? conQuien.nombre : 'Ninguno'}, y no lo tienes puesto en este ordenador`,
    },
    {
      nombre: 'Conexiones con tus herramientas',
      estado: !proveedores.length ? 'no' : (aMedias ? 'aMedias' : 'si'),
      detalle: !proveedores.length
        ? 'Ninguna todavía'
        : `${proveedores.length}${aMedias ? `, y ${aMedias} sin terminar` : ''}`,
    },
    {
      nombre: 'Claves que ya tenías, fuera de sitio',
      estado: fuera ? 'aMedias' : 'si',
      detalle: fuera
        ? `${fuera.claves} en ${fuera.sitios} sitio(s); el asistente puede ordenarlas`
        : 'Nada suelto',
    },
    {
      nombre: 'Conocimiento',
      estado: temas ? 'si' : 'no',
      detalle: temas ? `${temas} tema(s)` : 'Todavía no ha aprendido nada',
    },
    // Los botones solo son una pieza que falta si ese asistente llega a
    // tenerlos. Con Codex no los hay nunca —RSC no le escribe comandos— así que
    // una cruz permanente ahí no es información: es un reproche por algo que no
    // se puede arreglar. Cuando no puede haberlos, esta línea no sale.
    ...(donde.puedeTenerBotones() ? [{
      nombre: 'Botones que ha aprendido',
      estado: botones ? 'si' : 'no',
      detalle: botones ? `${botones}` : 'Ninguno todavía',
    }] : []),
    {
      nombre: 'Copias de seguridad aquí',
      estado: hay.tipo === 'empezada' && hay.conHistorial ? 'si' : (conArnes ? 'si' : 'no'),
      detalle: hay.tipo === 'empezada' && hay.conHistorial
        ? 'Ya tenías un historial tuyo; no lo toco'
        : (conArnes ? 'Listas' : 'Cuando prepares la carpeta'),
    },
    {
      nombre: 'Copias fuera de este ordenador',
      estado: cuenta.conectado ? 'si' : 'no',
      detalle: cuenta.conectado
        ? `Dentro${cuenta.usuario ? ` como ${cuenta.usuario}` : ''}${cuenta.remoto && cuenta.remoto.esGitHub ? ` · ${cuenta.remoto.corto}` : ''}`
        : 'Aún no has entrado en tu cuenta',
    },
  ];

  return { queEs: hay.tipo, piezas };
}

module.exports = { queHay, reconocer, mirarYClasificar, podemosGuardarElPuntoDePartida, radiografia };
