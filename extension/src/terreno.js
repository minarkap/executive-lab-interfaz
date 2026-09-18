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
  for (const [fichero, dicho] of PISTAS) {
    if (fs.existsSync(path.join(raiz, fichero))) return dicho;
  }
  return null;
}

// El estado de la carpeta, en una palabra, y con lo que haga falta para
// contarlo. Los cinco casos son excluyentes y cubren todo.
//
//   sinCarpeta    no hay ninguna abierta
//   conArnes      ya tiene arnés y está entero
//   aMedias       tiene .rsc.json pero le falta suelo
//   vacia         no hay nada: se puede preparar sin pensar
//   empezada      ya es de alguien; hay que decir qué hay antes de tocar
async function queHay() {
  const raiz = proyecto.raiz();
  if (!raiz) return { tipo: 'sinCarpeta' };

  if (proyecto.existe('.rsc.json')) {
    return { tipo: proyecto.arnesCompleto() ? 'conArnes' : 'aMedias' };
  }

  const dentro = loQueHayDentro(raiz);
  if (!dentro.length) return { tipo: 'vacia' };

  const [ajeno, sinGuardar] = await Promise.all([historialAjeno(raiz), cambiosSinGuardar(raiz)]);

  return {
    tipo: 'empezada',
    cuantos: dentro.length,
    parece: deQueParece(raiz),
    conHistorial: ajeno,
    sinGuardar,
    // Claves sueltas en ficheros que ya estaban: no se tocan, se cuentan, y el
    // asistente ya sabe qué hacer con ellas cuando el arnés esté montado.
    claves: sueltas.resumen(),
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

  const hay = await queHay();
  if (hay.tipo === 'sinCarpeta') return { tipo: hay.tipo, piezas: [] };

  const conArnes = hay.tipo === 'conArnes' || hay.tipo === 'aMedias';
  const proveedores = conArnes ? conexiones.proveedores() : [];
  const aMedias = proveedores.filter((p) => p.faltan > 0).length;
  const fuera = sueltas.resumen();
  const temas = conArnes ? cerebro.catalogo().length : 0;
  const botones = conArnes ? acciones.acciones().length : 0;
  const cuenta = await github.estado();

  // Cada pieza: si está, cuánto hay, y qué se puede hacer si falta. `estado` es
  // 'si' | 'no' | 'aMedias', y de ahí sale cómo se pinta.
  const piezas = [
    {
      nombre: 'El asistente, montado aquí',
      estado: hay.tipo === 'conArnes' ? 'si' : hay.tipo === 'aMedias' ? 'aMedias' : 'no',
      detalle: hay.tipo === 'conArnes' ? 'Listo' : hay.tipo === 'aMedias' ? 'Se quedó a medias' : 'Todavía no',
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
      nombre: 'Lo que sabe de tu trabajo',
      estado: temas ? 'si' : 'no',
      detalle: temas ? `${temas} tema(s)` : 'Todavía no ha aprendido nada',
    },
    {
      nombre: 'Botones que ha aprendido',
      estado: botones ? 'si' : 'no',
      detalle: botones ? `${botones}` : 'Ninguno todavía',
    },
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

  return { tipo: hay.tipo, piezas };
}

module.exports = { queHay, podemosGuardarElPuntoDePartida, radiografia };
