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
const rumbo = require('./rumbo');
const conexiones = require('./conexiones');
const cerebro = require('./cerebro');
const asistentes = require('./asistentes');

// Nombres del diccionario para las dos carpetas del arnés.
const ZONAS = { '02-DOCS': 'Conocimiento', '01-TOOLS': 'Conexiones' };

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').trim().toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

// RSC manda las rutas tal y como se las da git, y git las marca: `M `, `A `,
// `D `, `?? `… Una ruta marcada no empieza por `02-DOCS`, empieza por
// `M 02-DOCS`, así que dejaba de reconocerse como zona.
//
// Eso vaciaba la brújula justo en el caso normal: en cuanto la wiki está
// guardada en git —o sea, en todo alumno a partir del primer guardado— todas
// llegan con `M ` delante y no salía ninguna zona. La pantalla principal dejaba
// de decir dónde se había trabajado, sin que nada fallara.
//
// Quitar la marca es seguro: abajo solo se reconocen `02-DOCS` y `01-TOOLS`, así
// que esto no puede devolver la basura de antes («M 01 tools»), solo recuperar
// las dos que sí valen. Un renombrado viene como `old -> new`: vale la nueva.
function sinLaMarcaDeGit(ruta) {
  return String(ruta)
    .replace(/^\s*[MADRCU?!]{1,2}\s+/, '')
    .replace(/^.*\s->\s/, '')
    .trim();
}

// Las rutas que tocó la última sesión, traducidas a zonas del diccionario. Una
// ruta en crudo no aparece nunca en pantalla.
function zonasTocadas(rutas) {
  const zonas = new Set();
  for (const cruda of rutas) {
    const ruta = sinLaMarcaDeGit(cruda);
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

  // ── A medio preparar: se manda a terminarlo, no a "Algo va mal" ────────
  //
  // Esto decía «Pulsa "Algo va mal" y lo dejo listo». Se probó con una carpeta
  // a medias de verdad —como queda si se cierra el editor a mitad del montaje—
  // y ese botón **no lo arregla**: hace `repair`, que repara lo que el arnés
  // gobierna (habilidades, enganches) y no el suelo que crea el montaje. La
  // respuesta era «this harness is healthy» con `01-TOOLS` y `02-DOCS` sin
  // estar.
  //
  // O sea que el alumno pulsaba lo que se le decía, le contestaban que todo
  // estaba bien, y su espacio seguía a medias. Un callejón, y encima con un
  // mensaje tranquilizador.
  //
  // Lo que sí lo restaura es volver a pasar el montaje, que es lo que hace
  // «Preparar esta carpeta» — comprobado: vuelve a dejar el suelo entero.
  if (!proyecto.arnesCompleto()) {
    return {
      listo: false,
      sinArnes: true,
      aMedioPreparar: true,
      donde: 'Tu espacio está a medio preparar',
      hiciste: null,
      aviso: 'Se quedó algo sin montar, seguramente porque se cerró antes de tiempo. Se termina en un momento y no se pierde nada de lo que ya haya.',
      faltaGit: !(await guardar.hayGit()),
      comoSeInstalaGit: git.comoSeInstala(),
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

  // ── Montado, pero sin ajustar ─────────────────────────────────────────
  //
  // Un arnés puede estar entero para RSC y no tener nada de la barra: le falta
  // la habilidad que fija el español y el vocabulario, o los nombres del
  // perfil, o se montó con una versión anterior a la que la barra lleva dentro.
  // Pasa en cuanto alguien monta el arnés por su cuenta con `npx rsc`, o cuando
  // el repositorio viene de otro sitio, o —esto le va a pasar a todo el
  // mundo— cuando la barra sube de versión mayor.
  //
  // Hasta ahora esto solo se veía entrando en «Qué falta por montar», que es
  // justo donde no entra quien no sabe que le falta algo. La pantalla decía
  // «listo» y los botones hablaban con un arnés a medio ajustar.
  //
  // Quién decide es `rumbo`, el mismo que decide el arranque: una sola verdad.
  // Y sale gratis, porque `mirarYClasificar()` no lanza ni un proceso.
  const rama = rumbo.elegirRama({ ...terreno.mirarYClasificar(), git: { hay: conGit } }).rama;
  const sinAjustar = rama === 'adoptar' || rama === 'ponerAlDia' ? rama : null;

  return {
    listo: true,
    sinAjustar,
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
