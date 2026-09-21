// "Empezar una empresa aquí": el wizard, dentro del editor.
//
// Este es **el único** onboarding que hay. El instalador ya no monta nada: deja
// las piezas —editor, Node, git y las dos extensiones— y se acaba ahí. Antes
// montaba también un arnés en `Documentos/Mi Empresa IA`, con las mismas seis
// preguntas hechas dos veces, y había que mantener las dos a la par.
//
// El diccionario manda que ninguna pregunta se haga sin opciones: un campo de
// texto vacío delante de quien no sabe qué escribir es una pared.

const vscode = require('vscode');
const path = require('node:path');
const fs = require('node:fs');

const proyecto = require('./proyecto');
const procesos = require('./procesos');
const entorno = require('./entorno');
const git = require('./git');
const terreno = require('./terreno');
const rsc = require('./rsc');
const guardar = require('./guardar');
const identidad = require('./identidad');
const asistentes = require('./asistentes');
const rumbo = require('./rumbo');

// Las preguntas que hace RSC, en cristiano. Antes se daban por supuestas tres
// —siempre operaciones, siempre no técnico, siempre L3— y eso está mal: un
// arnés puede ser para llevar facturas o para montar una web, y quien lo usa
// puede ser el de administración o alguien que programó hace años.
//
// El orden importa: primero de qué va, porque de ahí sale todo lo demás.

const DE_QUE_VA = [
  { etiqueta: 'Llevar el día a día', detalle: 'Facturas, clientes, papeleo, proveedores', kind: 'operations' },
  { etiqueta: 'Crear cosas', detalle: 'Textos, vídeos, redes, presentaciones', kind: 'content' },
  { etiqueta: 'Construir algo', detalle: 'Una web, una automatización, una herramienta', kind: 'software' },
  { etiqueta: 'Estudiar un tema a fondo', detalle: 'Un sector, una competencia, una normativa', kind: 'research' },
  { etiqueta: 'Un poco de todo', detalle: 'Todavía no lo tengo claro', kind: 'mixed' },
];

const COMO_TE_MANEJAS = [
  { etiqueta: 'Lo justo', detalle: 'El correo, Word y poco más', nivel: 'non-technical' },
  { etiqueta: 'Me defiendo', detalle: 'Me apaño con casi todo, pero no programo', nivel: 'mixed' },
  { etiqueta: 'Programo, o he programado', detalle: 'He escrito código alguna vez', nivel: 'technical' },
];

const CUANTO_TE_EXPLICO = [
  { etiqueta: 'Todo, paso a paso', detalle: 'Prefiero que me lleve de la mano', dial: 'L3' },
  { etiqueta: 'Lo normal', detalle: 'Explícame lo importante y sigue', dial: 'L2' },
  { etiqueta: 'Poco', detalle: 'Ya preguntaré yo si hace falta', dial: 'L1' },
];

const OBJETIVOS_POR_TIPO = {
  operations: ['Poner orden en mis facturas', 'Atender mejor a mis clientes', 'Organizar el papeleo', 'Vender más y hacer seguimiento', 'Quitarme tareas repetitivas'],
  content: ['Escribir para mi web o mi blog', 'Llevar las redes sociales', 'Preparar presentaciones', 'Hacer vídeos'],
  software: ['Montar una web sencilla', 'Automatizar algo que hago a mano', 'Conectar dos herramientas que ya uso'],
  research: ['Entender a mi competencia', 'Estudiar una normativa que me afecta', 'Buscar oportunidades en mi sector'],
  mixed: ['Poner orden en mis facturas', 'Atender mejor a mis clientes', 'Escribir para mi web', 'Automatizar algo que hago a mano'],
};

// Un elegir con descripción debajo de cada opción: en una lista pelada, la
// mitad de las opciones no se entienden sin un ejemplo.
async function elegir(titulo, pregunta, opciones, extra = []) {
  const elegida = await vscode.window.showQuickPick(
    [...opciones.map((o) => ({ label: o.etiqueta, detail: o.detalle, valor: o })), ...extra],
    { title: titulo, placeHolder: pregunta, ignoreFocusOut: true, matchOnDetail: true },
  );
  return elegida ? (elegida.valor !== undefined ? elegida.valor : elegida) : null;
}

async function preguntarObjetivo(kind) {
  const OTRA = { label: 'Otra cosa — te la cuento yo', otra: true };
  const sugeridos = (OBJETIVOS_POR_TIPO[kind] || OBJETIVOS_POR_TIPO.mixed).map((e) => ({ etiqueta: e }));

  const elegido = await elegir('Para empezar', '¿Qué te gustaría resolver primero?', sugeridos, [OTRA]);
  if (!elegido) return null;
  if (!elegido.otra) return elegido.etiqueta;

  const escrito = await vscode.window.showInputBox({
    title: 'Para empezar',
    prompt: 'Cuéntamelo con tus palabras. Da igual si luego cambias de idea.',
    placeHolder: 'Por ejemplo: llevar los contratos de mis proveedores',
    ignoreFocusOut: true,
  });
  return escrito && escrito.trim() ? escrito.trim() : null;
}

// Con qué asistente va a trabajar. Solo se pregunta si hay más de uno
// instalado: si solo tiene uno, preguntarlo es una pantalla de más.
async function preguntarAsistente() {
  const puestos = asistentes.ASISTENTES.filter(asistentes.estaInstalado);
  if (puestos.length === 1) return puestos[0].id;
  if (!puestos.length) return 'claude';

  const elegido = await vscode.window.showQuickPick(
    puestos.map((a) => ({ label: a.nombre, id: a.id })),
    { title: 'Con quién vas a trabajar', placeHolder: 'Tienes los dos instalados: elige uno', ignoreFocusOut: true },
  );
  return elegido ? elegido.id : null;
}

// Cómo se llama esto. Dos nombres, y los pone el alumno: para qué es esta
// carpeta, y de quién es. Un arnés no es "una empresa" — una empresa puede
// tener cuatro, uno para contabilidad, otro para el personal, otro para
// marketing.
async function preguntarNombres(objetivo) {
  const arnes = await vscode.window.showInputBox({
    title: 'Ponle nombre',
    prompt: '¿Cómo llamamos a esto? Es el nombre que verás arriba cada vez que lo abras.',
    placeHolder: 'Contabilidad · Personal · Marketing · Clientes · el proyecto que sea',
    value: sugerirNombre(objetivo),
    ignoreFocusOut: true,
  });
  if (!arnes || !arnes.trim()) return null;

  const empresa = await vscode.window.showInputBox({
    title: 'Ponle nombre',
    prompt: '¿Y cómo se llama tu empresa? Para saber de quién es todo esto.',
    placeHolder: 'Nexus Consulting — o déjalo en blanco',
    ignoreFocusOut: true,
  });

  return { arnes: arnes.trim(), empresa: (empresa || '').trim() || null };
}

// Del objetivo elegido sale un nombre razonable, para no dejar la caja vacía.
function sugerirNombre(objetivo) {
  const porObjetivo = [
    [/factur|cobr/i, 'Facturación'],
    [/client/i, 'Clientes'],
    [/document/i, 'Documentos'],
    [/vender|venta|seguimiento/i, 'Ventas'],
    [/repetitiv|tarea/i, 'Operativa'],
    [/contrat|papeleo|gente|personal/i, 'Personal'],
  ];
  const [, nombre] = porObjetivo.find(([patron]) => patron.test(objetivo)) || [];
  return nombre || '';
}

// La web de la empresa. Es opcional y se puede dejar en blanco: de ella salen
// los colores y el logotipo del panel, y lo primero que el asistente sabrá de
// a qué se dedica. Quien no tenga web, sigue sin ella.
async function preguntarWeb() {
  const escrito = await vscode.window.showInputBox({
    title: 'Empezar una empresa aquí',
    prompt: '¿Tiene web tu empresa? Así cojo sus colores y su logotipo, y me entero de a qué os dedicáis.',
    placeHolder: 'ferreteriasoler.es — o déjalo en blanco si no tenéis',
    ignoreFocusOut: true,
  });

  const limpio = (escrito || '').trim();
  if (!limpio) return null;
  return /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
}

// El arnés, en los dos pasos que RSC exige: primero enseña el plan y su
// huella, y solo escribe cuando se le devuelve esa misma huella. La línea de
// aceptación se reutiliza tal cual la imprime RSC —con el objetivo en base64 y
// los mismos flags— para que la huella no pueda dejar de coincidir.
// El parte de un intento fallido, entero y en un solo sitio.
//
// Antes se guardaba `error || salida`: cuando el arnés escribía el motivo en
// la salida normal y dejaba el canal de errores vacío —que es lo que hace, por
// ejemplo, cuando el suelo se queda a medias— el parte se quedaba con lo que
// no servía. Y nunca llevaba el código de salida, que es lo primero que mira
// quien lo lee. Van las dos cosas y las dos salidas, siempre.
function loQuePaso(cuando, intento) {
  return [
    `${cuando}: el arnés terminó con el código ${intento.codigo}`,
    `  lo que escribió:  ${(intento.salida || '(nada)').trim() || '(nada)'}`,
    `  y como error:     ${(intento.error || '(nada)').trim() || '(nada)'}`,
  ].join('\n');
}

async function montarElArnes(respuestas) {
  const flags = [
    '--technical-level', respuestas.nivel,
    '--accompaniment', respuestas.dial,
    '--project-kind', respuestas.kind,
    '--goal', respuestas.objetivo,
    '--target', respuestas.asistente,
  ];
  // RSC pide el tamaño cuando se trata de construir algo.
  if (respuestas.kind === 'software') flags.push('--software-scope', respuestas.tamano || 'small');

  const previo = await rsc.correr(['onboard', ...flags], { tiempoMaximo: 600000 });
  const huella = (previo.salida.match(/Plan id:\s*([0-9a-f]{64})/i) || [])[1];
  if (!huella) return { ok: false, detalle: loQuePaso('al pedir el plan', previo) };

  // Se reutiliza la línea de aceptación tal cual la imprime RSC —con el
  // objetivo en base64 y los mismos flags— para que la huella no pueda dejar
  // de coincidir.
  const linea = (previo.salida.match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
  const aceptar = linea ? linea.trim().split(/\s+/) : [...flags, '--accept-plan', huella];

  const aplicado = await rsc.correr(['onboard', ...aceptar], { tiempoMaximo: 900000 });
  if (/RSC_PLAN_CHANGED/.test(aplicado.salida) || /RSC_PLAN_CHANGED/.test(aplicado.error || '')) {
    return { ok: false, detalle: loQuePaso('el plan cambió entre que se vio y se aceptó', aplicado) };
  }
  if (!/RSC_ONBOARDING_READY/.test(aplicado.salida)) {
    return { ok: false, detalle: loQuePaso('al aplicar el plan', aplicado) };
  }
  return { ok: true };
}

// Los raíles viajan dentro de la extensión: mismo `aplicar.js` que usa el
// instalador, así que no hay dos versiones de lo que significa "poner los
// raíles".
async function ponerLosRailes(contexto) {
  const aplicar = path.join(contexto.extensionPath, 'media', 'railes', 'aplicar.js');
  if (!fs.existsSync(aplicar)) return false;
  const { codigo } = await procesos.node([aplicar, proyecto.raiz()], { tiempoMaximo: 60000 });
  return codigo === 0;
}

// Los nombres van al frontmatter del perfil del arnés, junto a los diales:
// es el fichero que RSC ya usa para el perfil y el que leen `orient` y la
// barra lateral.
function ponerLosNombres({ arnes, empresa }) {
  const perfil = proyecto.ruta(...identidad.PERFIL);
  if (!perfil || !fs.existsSync(perfil)) return false;

  let texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloque) return false;

  let cabecera = bloque[1];
  for (const [clave, valor] of [['arnes', arnes], ['empresa', empresa]]) {
    if (!valor) continue;
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    const puesta = `${clave}: ${valor}`;
    cabecera = linea.test(cabecera) ? cabecera.replace(linea, puesta) : `${cabecera}\n${puesta}`;
  }

  fs.writeFileSync(perfil, texto.replace(bloque[0], `---\n${cabecera}\n---`));
  return true;
}

// Los enganches que RSC deja escritos llaman a `node` por su nombre, y en el
// ordenador de un alumno puede no haber ninguno en el PATH. `enganches.js` decía
// que esto lo hacía el wizard de la extensión; no era verdad, solo lo hacía el
// instalador, así que en el camino sin instalador los enganches se quedaban
// apuntando a un node que podía no existir.
//
// Solo se reescribe cuando tenemos un node de verdad. Si el que hay es el de
// VS Code, su binario necesita que se le diga que haga de Node y escribir su
// ruta a secas rompería el enganche en vez de arreglarlo: en ese caso se deja
// `node`, que funciona si esa persona tiene uno instalado.
function apuntarLosEnganches(salida) {
  if (entorno.usaElNodeDeVsCode()) return false;

  const donde = entorno.moduloComun('enganches');
  if (!donde) return false;

  try {
    const { fijarElNodeDeLosEnganches } = require(donde);
    return fijarElNodeDeLosEnganches(proyecto.raiz(), entorno.node(), (que) => salida.appendLine(`[arrancar] ${que}`)) > 0;
  } catch {
    return false;
  }
}

// Hace falta para que "Guardar copia de seguridad" tenga dónde guardar, y para
// que la memoria del arnés se ancle a una rama.
async function prepararHistorial() {
  if (proyecto.existe('.git')) return true;
  const hecho = await procesos.git('init', '-q');
  return hecho.codigo === 0;
}

// ─────────────────────────────────────────────────────────────────────────
//                              LAS PREGUNTAS
// ─────────────────────────────────────────────────────────────────────────
//
// Se hacen de una en una y **solo las que hagan falta**. Cuál hace falta lo
// decide `rumbo.js` restando lo que el recibo de RSC ya contesta: cuando hay
// arnés, cinco de las siete ya están escritas en `.rsc.json` y hasta ahora se
// volvían a preguntar igual.

const COMO_SE_PREGUNTA = {
  asistente: () => preguntarAsistente(),
  deQueVa: () => elegir('Para empezar', '¿De qué va esto?', DE_QUE_VA),
  objetivo: (yaDicho) => preguntarObjetivo(yaDicho.kind),
  tamano: () => elegir('Para empezar', '¿Es algo pequeño o va para largo?', [
    { etiqueta: 'Algo pequeño', detalle: 'Una cosa concreta, para salir del paso', valor: 'small' },
    { etiqueta: 'Va para largo', detalle: 'Le voy a dedicar tiempo y va a crecer', valor: 'large' },
  ]),
  nivel: () => elegir('Sobre ti', '¿Qué tal te manejas con el ordenador?', COMO_TE_MANEJAS),
  dial: () => elegir('Sobre ti', '¿Cuánto quieres que te explique?', CUANTO_TE_EXPLICO),
  nombres: (yaDicho) => preguntarNombres(yaDicho.objetivo),
};

// Lo que el recibo ya contesta, en la forma que espera `montarElArnes`.
function loQueYaSeSabe(recibo) {
  const r = recibo ? recibo.record : null;
  if (!r) return {};
  return {
    asistente: (r.targets || [])[0],
    kind: r.projectKind,
    objetivo: r.goal,
    tamano: r.softwareScope,
    nivel: r.technicalLevel,
    dial: r.accompaniment,
  };
}

// Devuelve las respuestas completas, o null si alguien canceló.
async function entrevistar(plan, parte) {
  const sabido = loQueYaSeSabe(parte.recibo);
  const respuestas = { ...sabido };
  const nombres = parte.railes.nombres || null;

  for (const que of plan.preguntar) {
    if (que === 'permiso') continue; // se pide aparte, antes de todo

    // El tamaño solo lo pide RSC cuando se va a construir algo. Sin recibo no
    // se sabe el tipo hasta que se contesta la anterior, así que se mira aquí y
    // no al calcular la lista.
    if (que === 'tamano' && respuestas.kind !== 'software') continue;

    const contestada = await COMO_SE_PREGUNTA[que](respuestas);
    if (!contestada) return null;

    if (que === 'deQueVa') respuestas.kind = contestada.kind;
    else if (que === 'nivel') respuestas.nivel = contestada.nivel;
    else if (que === 'dial') respuestas.dial = contestada.dial;
    else if (que === 'tamano') respuestas.tamano = contestada.valor || contestada;
    else if (que === 'nombres') Object.assign(respuestas, { nombres: contestada });
    else respuestas[que] = contestada;
  }

  // La web no se pregunta nunca dos veces ni bloquea: es opcional.
  const web = plan.pasos.some((p) => p.id === 'montarElArnes') && !parte.recibo ? await preguntarWeb() : null;

  return { ...respuestas, nombres: respuestas.nombres || nombres, web };
}

// ─────────────────────────────────────────────────────────────────────────
//                               LOS PASOS
// ─────────────────────────────────────────────────────────────────────────
//
// Uno por identificador del catálogo de `rumbo.js`. Si allí aparece uno que
// aquí no está, la prueba lo caza antes que nadie.
//
// Cada uno devuelve `{ ok, detalle }`. Un paso que falla NO para el arranque
// salvo que sea el montaje: es mejor un arnés con los raíles a medias, y
// decirlo, que ninguno.

async function arreglarLoQueSePuedaSolo(salida) {
  const queHay = rsc.queHayQueArreglar(await rsc.arreglarEnSeco());

  if (!queHay.sabemos) return { ok: true, detalle: 'no se ha podido revisar' };
  if (queHay.sano) return { ok: true, detalle: 'nada que arreglar' };

  // Lo que el arnés pregunta antes de tocar no se contesta por nadie: uno de
  // esos hallazgos mueve el arnés a otro asistente.
  if (queHay.aDecidir.length) {
    return { ok: true, detalle: `${queHay.aDecidir.length} cosa(s) que tiene que decidir una persona`, aDecidir: queHay.aDecidir };
  }

  const hecho = await rsc.arreglarSolo();
  return { ok: hecho.codigo === 0, detalle: `${queHay.solas.length} arreglada(s)` };
}

const COMO_SE_HACE = {
  ponerGit: async () => ({ ok: await prepararHistorial() }),

  montarElArnes: async ({ respuestas }) => {
    const hecho = await montarElArnes(respuestas);
    return { ok: hecho.ok, detalle: hecho.detalle, imprescindible: true };
  },

  // Traer a esta máquina lo que el repositorio ya declaraba. No se vuelve a
  // montar nada: `sync` reconstruye desde el plan que alguien ya aceptó.
  traerLasHabilidades: async () => {
    const hecho = await rsc.sincronizar();
    return { ok: hecho.codigo === 0, detalle: (hecho.salida || '').trim().split('\n').pop(), imprescindible: true };
  },

  arreglarLoRoto: ({ salida }) => arreglarLoQueSePuedaSolo(salida),
  ponerLosRailes: async ({ contexto }) => ({ ok: await ponerLosRailes(contexto) }),
  ponerLosNombres: ({ respuestas }) => ({ ok: respuestas.nombres ? ponerLosNombres(respuestas.nombres) : true }),
  apuntarLosEnganches: ({ salida }) => ({ ok: true, detalle: apuntarLosEnganches(salida) ? 'apuntados' : 'no hacía falta' }),

  puntoDePartida: async () => {
    // El historial de alguien no se escribe. Se comprueba aquí y no solo en
    // `rumbo`, porque una carpeta «vacía» puede tener un `.git` con commits.
    if (!(await terreno.podemosGuardarElPuntoDePartida())) {
      return { ok: true, detalle: 'historial de alguien: no se toca' };
    }
    await guardar.guardar(`Punto de partida — ${guardar.fechaLarga()}`);
    return { ok: true };
  },

  // Los dos encargos no los hace la barra: los hace el asistente. Aquí solo se
  // anotan para que quien llama sepa qué pedirle al terminar.
  ordenarLasClaves: () => ({ ok: true, encargo: 'ordenarLasClaves' }),
  ordenarLaCarpeta: () => ({ ok: true, encargo: 'ordenarLaCarpeta' }),
};

// ─────────────────────────────────────────────────────────────────────────
//                              EL ENRUTADOR
// ─────────────────────────────────────────────────────────────────────────

// Un pestillo, porque ahora se llega aquí desde tres sitios y algunas ramas
// empiezan a escribir sin abrir ningún diálogo antes. Dos pulsaciones seguidas
// lanzarían dos montajes a la vez sobre la misma carpeta.
let enMarcha = false;

const CLAVE_SIN_GIT = 'executiveLab.sigueSinCopias';

// Dónde se recuerda lo que esa persona ya decidió. Se pide con cuidado: un
// contexto sin memoria —una prueba, o una versión de VS Code que cambie la
// forma— no puede tumbar el arranque entero.
const loQueDecidio = (contexto) => (contexto && contexto.workspaceState)
  || { get: () => undefined, update: async () => {} };

async function arrancar(contexto, salida) {
  if (enMarcha) return { ok: false, cancelado: true };
  enMarcha = true;
  try {
    return await elCamino(contexto, salida);
  } finally {
    enMarcha = false;
  }
}

async function elCamino(contexto, salida) {
  const visto = await terreno.reconocer();
  const parte = {
    ...visto,
    git: { ...visto.git, sigueSinCopias: Boolean(loQueDecidio(contexto).get(CLAVE_SIN_GIT)) },
  };
  const plan = rumbo.elegirRama(parte);
  salida.appendLine(`[arrancar] ${plan.rama}: ${plan.porQue}`); // diccionario: interno

  if (plan.rama === 'sinCarpeta') {
    return { ok: false, mensaje: 'Abre primero la carpeta donde quieres montar tu empresa.' };
  }

  // Un `.rsc.json` ilegible no se pisa. Es un fichero que viaja por git y esto
  // suele ser un conflicto sin resolver: montar encima borraría el arnés que
  // esa persona ya tenía.
  if (plan.rama === 'reciboRoto') {
    return {
      ok: false,
      mensaje: 'El fichero que dice cómo está montado esto no se puede leer. No voy a tocar nada. Pulsa "Algo va mal".',
    };
  }

  if (plan.rama === 'sinGit') return decidirSobreGit(contexto, parte);

  if (plan.rama === 'yaEstaba') {
    return { ok: true, yaEstaba: true, mensaje: 'Esto ya estaba montado y entero.' };
  }

  if (plan.rama === 'otroArnes' && !(await pedirPermiso(parte))) {
    // Jose: «si el usuario dice que no quiere implementarlo, entonces
    // directamente no se ejecuta la instalación ni de RSC ni de la extensión».
    return { ok: false, cancelado: true, sinPermiso: true };
  }

  const respuestas = await entrevistar(plan, parte);
  if (!respuestas) return { ok: false, cancelado: true };

  return hacerLosPasos(plan, parte, respuestas, contexto, salida);
}

// Sin git no hay copias de seguridad. Se explica qué se pierde y se deja
// elegir: Jose lo quiso así, y hasta ahora esto era un callejón — la pantalla
// se quedaba sin ofrecer nada.
async function decidirSobreGit(contexto, parte) {
  const ponerlo = 'Ponerlo primero';
  const seguir = 'Seguir sin copias';

  const elegido = await vscode.window.showWarningMessage(
    'Falta una pieza para poder guardar tu trabajo. Sin ella todo funciona, pero no podrás guardar copias ni volver atrás si algo sale mal.',
    { modal: true, detail: parte.git.sePuedeInstalarSolo ? 'Tu ordenador puede ponerla solo. Tarda un rato.' : git.comoSeInstala() },
    ponerlo,
    seguir,
  );

  if (elegido === seguir) {
    await loQueDecidio(contexto).update(CLAVE_SIN_GIT, true);
    return { ok: false, sigueSinCopias: true, mensaje: 'Sigo sin copias. Puedes ponerlo cuando quieras desde Histórico.' };
  }
  if (elegido === ponerlo) return { ok: false, faltaGit: true };
  return { ok: false, cancelado: true };
}

// Aquí ya había un montaje de asistente. No se decide por nadie: se le enseña
// lo que tiene y se le pregunta, y lo suyo no se borra pase lo que pase.
async function pedirPermiso(parte) {
  const suyo = parte.otroMontaje.asistentes
    .map((a) => [a.habilidades && `${a.habilidades} habilidad(es)`, a.comandos && `${a.comandos} comando(s)`, a.agentes && `${a.agentes} agente(s)`].filter(Boolean).join(', '))
    .filter(Boolean);
  const ficheros = parte.otroMontaje.ficheros;

  const visto = [...suyo, ...(ficheros.length ? [ficheros.join(', ')] : [])].join(' · ');

  const si = 'Sí, móntalo encima';
  const elegido = await vscode.window.showInformationMessage(
    'Aquí ya tienes un asistente montado a mano. Puedo poner el arnés encima sin quitarte nada de lo que ya tienes.',
    { modal: true, detail: `He encontrado: ${visto}.\n\nTus habilidades (skills), tus comandos y tus agentes se quedan donde están. Lo que hago es ordenar la carpeta como el arnés espera.` },
    si,
  );
  return elegido === si;
}

// Ejecutar el plan, con barra de progreso y sin tragarse ningún fallo.
async function hacerLosPasos(plan, parte, respuestas, contexto, salida) {
  const queEscriben = plan.pasos.filter((paso) => paso.escribe);
  if (!queEscriben.length) return { ok: true, yaEstaba: true, mensaje: 'No hacía falta tocar nada.' };

  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Preparando tu empresa', cancellable: false },
    async (progreso) => {
      const avisos = [];
      const encargos = [];

      for (const paso of plan.pasos) {
        if (paso.escribe) progreso.report({ message: `${paso.etiqueta}…` });

        const hecho = await COMO_SE_HACE[paso.id]({ respuestas, parte, contexto, salida, progreso });
        if (hecho.encargo) encargos.push(hecho.encargo);
        if (hecho.detalle) salida.appendLine(`[arrancar] ${paso.id}: ${hecho.detalle}`); // diccionario: interno

        if (hecho.ok) continue;

        // Sin arnés no hay nada que hacer: se para y se cuenta.
        if (hecho.imprescindible) {
          return { ok: false, mensaje: 'No he podido montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor.' };
        }
        // Lo demás se apunta y se sigue: media cosa puesta y dicha vale más que
        // ninguna y callada. Antes estos fallos se tiraban sin mirarlos.
        salida.appendLine(`[arrancar] ${paso.id} no ha salido bien`); // diccionario: interno
        avisos.push(paso.id);
      }

      // El suelo, después de montar: RSC puede decir que terminó y dejarlo a
      // medias, y entonces lo que falta lo levanta el asistente.
      const sueloAMedias = plan.pasos.some((p) => p.id === 'montarElArnes') && !proyecto.arnesCompleto();
      if (sueloAMedias) {
        const faltan = Object.entries(proyecto.sueloDelArnes()).filter(([, hay]) => !hay).map(([que]) => que);
        salida.appendLine(`[arrancar] el arnés dijo estar listo y falta el suelo: ${faltan.join(', ')}`); // diccionario: interno
        encargos.push('levantarElSuelo');
      }

      return {
        ok: true,
        rama: plan.rama,
        avisos,
        encargos,
        sueloAMedias,
        objetivo: respuestas.objetivo,
        web: respuestas.web,
        nombres: respuestas.nombres || { arnes: null, empresa: null },
        mensaje: `${(respuestas.nombres && respuestas.nombres.arnes) || 'Tu arnés'} ya está listo.`,
      };
    },
  );
}

module.exports = {
  arrancar, entrevistar, ponerLosRailes,
  COMO_SE_HACE, DE_QUE_VA, COMO_TE_MANEJAS, CUANTO_TE_EXPLICO, OBJETIVOS_POR_TIPO,
};
