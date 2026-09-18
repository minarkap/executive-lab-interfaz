// La brújula: dónde estás, qué acabas de hacer, qué sabe ya de tu empresa.
//
// Decisión importante: esto NO se lee de la conversación de Claude. Se deriva
// del disco — el checkpoint de RSC, el historial de la wiki, la última copia
// de seguridad y lo que haya montado en el arnés. Así la barra lateral no
// depende de la interfaz de Anthropic y sigue funcionando cuando ellos cambien
// su panel.
//
// La skill `orient` de RSC hace lo mismo dentro de la conversación. Aquí se
// repite fuera, en forma de pantalla, porque leer un párrafo y ver un botón no
// cuestan lo mismo cuando no sabes qué estás haciendo.
//
// Los botones ya no están aquí: los descubre `acciones.js` de los comandos del
// proyecto, porque el arnés de una gestoría no lleva los mismos que el de una
// empresa de contratos.

const proyecto = require('./proyecto');
const rsc = require('./rsc');
const guardar = require('./guardar');
const git = require('./git');
const terreno = require('./terreno');
const conexiones = require('./conexiones');
const cerebro = require('./cerebro');
const asistentes = require('./asistentes');

// Nombres del diccionario para las dos carpetas del arnés.
const ZONAS = { '02-DOCS': 'Lo que sabe', '01-TOOLS': 'Conexiones' };

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').trim().toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

// Las rutas que tocó la última sesión, traducidas a zonas del diccionario. Una
// ruta en crudo no aparece nunca en pantalla.
function zonasTocadas(rutas) {
  const zonas = new Set();
  for (const ruta of rutas) {
    const partes = ruta.split('/').filter(Boolean);
    if (!partes.length || partes[0].startsWith('.')) continue;

    if (partes[0] === '02-DOCS') {
      const tema = partes[1] === 'wiki' && partes[2] && !partes[2].includes('.') && partes[2] !== 'harness';
      zonas.add(tema ? `${ZONAS['02-DOCS']} (${humanizar(partes[2])})` : ZONAS['02-DOCS']);
    } else if (partes[0] === '01-TOOLS') {
      // Un fichero suelto en 01-TOOLS no es una herramienta. Sin esto, tocar
      // `01-TOOLS/README.md` salía como "Conexiones (Readme.md)", que no
      // significa nada para nadie.
      const proveedor = partes[1] && !partes[1].startsWith('_') && !partes[1].includes('.');
      zonas.add(proveedor ? `${ZONAS['01-TOOLS']} (${humanizar(partes[1])})` : ZONAS['01-TOOLS']);
    }
    // Cualquier otra carpeta NO es una zona. Antes lo era, y salían rótulos sin
    // sentido: Jose vio "Tus programas (Odoo) · M 01 tools" en su barra. Un
    // nombre de carpeta cualquiera humanizado no le dice nada a nadie, y la
    // brújula es justo el sitio donde no se puede escribir ruido.
  }
  return [...zonas];
}

// La continuación de RSC llega como líneas "clave: valor". Solo nos interesa
// por dónde andaba la persona.
function interpretar(continuacion) {
  if (!continuacion) return null;
  const campos = {};
  for (const linea of continuacion.split('\n')) {
    const corte = linea.indexOf(': ');
    if (corte > 0) campos[linea.slice(0, corte).trim()] = linea.slice(corte + 2).trim();
  }
  const rutas = campos.files && campos.files !== 'none' ? campos.files.split(', ') : [];
  const zonas = zonasTocadas(rutas);
  if (!zonas.length) return null;

  // Dos zonas informan más, pero en una barra estrecha y en serif grande se
  // comen tres líneas y dejan de leerse. Si no cabe, una.
  const dos = juntarLasIguales(zonas.slice(0, 2));
  return dos.length <= 42 ? dos : zonas[0];
}

// "Tus programas (Holded) · Tus programas (Gmail)" repite el rótulo dos veces
// y se sale de la línea. Dicho como lo diría una persona —"Tus programas
// (Holded, Gmail)"— cabe, y se lee mejor.
function juntarLasIguales(zonas) {
  const porRotulo = new Map();
  for (const zona of zonas) {
    const parte = zona.match(/^(.*?) \((.+)\)$/);
    const rotulo = parte ? parte[1] : zona;
    const detalle = parte ? parte[2] : null;
    if (!porRotulo.has(rotulo)) porRotulo.set(rotulo, []);
    if (detalle) porRotulo.get(rotulo).push(detalle);
  }
  return [...porRotulo]
    .map(([rotulo, detalles]) => (detalles.length ? `${rotulo} (${detalles.join(', ')})` : rotulo))
    .join(' · ');
}

// Calcular el estado lanza procesos; no hace falta repetirlo cada vez que la
// barra parpadea. Veinte segundos de memoria bastan.
let ultimo = { cuando: 0, estado: null };

async function estado({ fresco = false } = {}) {
  if (!fresco && ultimo.estado && Date.now() - ultimo.cuando < 20000) return ultimo.estado;
  const calculado = await calcular();
  ultimo = { cuando: Date.now(), estado: calculado };
  return calculado;
}

const olvidar = () => { ultimo = { cuando: 0, estado: null }; };

async function calcular() {
  if (!proyecto.raiz()) {
    return { listo: false, sinCarpeta: true, donde: 'Elige con qué quieres trabajar', hiciste: null };
  }

  // Sin arnés hay dos carpetas muy distintas, y antes se trataban igual: una
  // vacía, donde se puede montar sin pensar, y una que ya es de alguien. En la
  // segunda hay que decir qué se ha visto antes de ofrecer nada (terreno.js).
  if (!proyecto.existe('.rsc.json')) {
    const hay = await terreno.queHay();
    const comun = {
      listo: false,
      sinArnes: true,
      hiciste: null,
      faltaGit: !(await guardar.hayGit()),
      comoSeInstalaGit: git.comoSeInstala(),
    };

    if (hay.tipo !== 'empezada') {
      return {
        ...comun,
        donde: 'Aquí todavía no hay nada',
        aviso: 'Puedo montar tu empresa en esta carpeta. Tarda unos minutos y te pregunto una sola cosa.',
      };
    }

    return {
      ...comun,
      donde: 'Aquí ya hay trabajo tuyo',
      yaEmpezada: {
        cuantos: hay.cuantos,
        parece: hay.parece,
        conHistorial: hay.conHistorial,
        sinGuardar: hay.sinGuardar,
        claves: hay.claves ? hay.claves.claves : 0,
      },
      aviso: 'Puedo añadir el asistente a lo que ya tienes, sin tocar nada de lo que hay.',
    };
  }

  if (!proyecto.arnesCompleto()) {
    return {
      listo: false,
      donde: 'Tu espacio está a medio preparar',
      hiciste: null,
      aviso: 'Falta parte de la preparación inicial. Pulsa "Algo va mal" y lo dejo listo.',
    };
  }

  const [continuacion, copias] = await Promise.all([rsc.retomar(), guardar.copias(1)]);
  const [ultimoAprendido] = cerebro.aprendidoUltimamente(1);
  const sabe = cerebro.cuantoSabe();
  const conectados = conexiones.proveedores().length;
  const esperando = cerebro.esperandoLectura();

  const hiciste = ultimoAprendido
    ? `Aprendió sobre ${ultimoAprendido.titulo}`
    : (copias.length ? `Guardaste una copia ${guardar.haceCuanto(copias[0].cuando)}` : null);

  // Recién montado y sin nada hecho: lo primero es la cuenta. No se puede
  // saber desde aquí si ha iniciado sesión —la credencial vive en el llavero
  // del sistema— así que no se adivina: se convierte en el primer paso, y
  // desaparece en cuanto haya pasado algo.
  const quien = asistentes.elDeAhora();
  const sinEmpezar = !continuacion && !sabe && !conectados && !copias.length;

  // Que falte el asistente no es solo un problema del primer día: si alguien lo
  // desinstala, o abre esta carpeta en otro ordenador, la barra sigue pintando
  // botones que no van a contestar. Antes esto solo se decía cuando no se había
  // empezado nada, así que a partir del segundo día se callaba.
  const faltaElAsistente = !asistentes.estaInstalado(quien);
  const conGit = await guardar.hayGit();

  return {
    listo: true,
    donde: interpretar(continuacion) || (conectados === 0 && sabe === 0 ? 'Acabas de empezar' : 'Tu trabajo'),
    hiciste,
    sabe,
    conectados,
    esperando,
    faltaGit: !conGit,
    comoSeInstalaGit: git.comoSeInstala(),
    faltaElAsistente: faltaElAsistente ? quien.nombre : null,
    primerPaso: sinEmpezar ? {
      asistente: quien.nombre,
      instalado: asistentes.estaInstalado(quien),
    } : null,
  };
}

module.exports = { estado, olvidar, interpretar, zonasTocadas };
