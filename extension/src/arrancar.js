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
const trato = require('./trato');

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

// Las tres que se preguntan en vez de «¿es algo pequeño o va para largo?», que
// para quien empieza es difícil de decidir (C-21, decisión de Jose del
// 25-09-2026). Cada una contesta una sola cosa, y con un dato, no con una
// opinión:
//
//   · qué lleva la carpeta — de una tarea suelta a la empresa entera;
//   · cuánta gente hay detrás — no es lo mismo un departamento de tres que
//     uno de cincuenta;
//   · qué se va a construir — una landing no es una plataforma con usuarios.
//
// Solo la tercera va a RSC, como el tamaño del software: una empresa entera
// puede querer una landing. Las otras dos van al perfil, al nombre que se
// sugiere y al primer mensaje.
const QUE_LLEVA = [
  { etiqueta: 'Una tarea concreta', detalle: 'Preparar un informe, ordenar unos papeles, una web de una página', alcance: 'tarea' },
  { etiqueta: 'Un proyecto', detalle: 'Algo con principio y fin: un lanzamiento, una web con reservas, un estudio', alcance: 'proyecto' },
  { etiqueta: 'Un departamento o un área', detalle: 'Lo de todos los días de un equipo: facturación, personal, marketing', alcance: 'departamento' },
  { etiqueta: 'La empresa entera', detalle: 'Todas las áreas a la vez: ventas, facturas, personal, clientes', alcance: 'empresa' },
];

const CUANTAS_PERSONAS = [
  { etiqueta: 'Solo yo', personas: 'solo-yo' },
  { etiqueta: 'De 2 a 10', personas: '2-10' },
  { etiqueta: 'De 11 a 50', personas: '11-50' },
  { etiqueta: 'Más de 50', personas: 'mas-de-50' },
];

// Cada respuesta, con el tamaño que le toca en RSC. RSC solo distingue pequeño
// de no pequeño, y sube solo si el objetivo habla de pagos, cobros, bases de
// datos o integraciones: «No lo sé» empieza pequeño sin atar nada. «Nada, o casi
// nada» solo sale con «Un poco de todo»: con «Construir algo», algo se
// construye.
const QUE_VAS_A_CONSTRUIR = [
  { etiqueta: 'Nada, o casi nada', detalle: 'Aquí no voy a hacer webs ni automatizaciones', tamano: 'small', soloCon: 'mixed' },
  { etiqueta: 'Una cosa concreta', detalle: 'Una landing, una web de una página, un aviso por correo', tamano: 'small' },
  { etiqueta: 'Algo que irá sumando piezas', detalle: 'Una web con reservas, automatizaciones que se hablan entre sí', tamano: 'growing' },
  { etiqueta: 'Una plataforma completa', detalle: 'Con usuarios, varios idiomas y panel de administración', tamano: 'complex' },
  { etiqueta: 'No lo sé todavía', detalle: 'Empiezo sencillo, y si crece ya se ajusta', tamano: 'small' },
];

const COMO_TE_MANEJAS = [
  { etiqueta: 'Lo justo', detalle: 'El correo, Word y poco más', nivel: 'non-technical' },
  { etiqueta: 'Me defiendo', detalle: 'Me apaño con casi todo, pero no programo', nivel: 'mixed' },
  { etiqueta: 'Programo, o he programado', detalle: 'He escrito código alguna vez', nivel: 'technical' },
];

// Los cuatro escalones de «Cómo te habla», con sus mismos nombres y frases: un
// dial, un nombre (C-6, decisión 98). Antes eran tres, con otros nombres, y
// faltaba «Al grano», que RSC también ofrece (A4). Van del más acompañado al
// que menos, que es por donde empieza a leer quien empieza.
const CUANTO_TE_EXPLICO = [...trato.ESCALONES].reverse()
  .map((escalon) => ({ etiqueta: escalon.nombre, detalle: escalon.frase, dial: escalon.id }));

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
//
// La pregunta sale de lo que lleva la carpeta: una tarea se llama como la
// tarea, y un departamento, como el departamento. Con «La empresa entera» los
// dos nombres son el mismo, así que se pregunta una vez.
const COMO_SE_LLAMA = {
  tarea: { prompt: '¿Cómo llamamos a esta tarea?', placeHolder: 'El informe de ventas · La mudanza de la oficina' },
  proyecto: { prompt: '¿Cómo se llama el proyecto?', placeHolder: 'Lanzamiento de otoño · Web nueva' },
  departamento: { prompt: '¿Cómo se llama el departamento o el área?', placeHolder: 'Contabilidad · Personal · Marketing · Clientes' },
};
const COMO_SE_LLAMA_SIN_ALCANCE = { prompt: '¿Cómo llamamos a esto?', placeHolder: 'Contabilidad · Personal · Marketing · Clientes · el proyecto que sea' };

async function preguntarNombres(objetivo, alcance) {
  if (alcance === 'empresa') {
    const suya = await vscode.window.showInputBox({
      title: 'Ponle nombre',
      prompt: '¿Cómo se llama tu empresa? Es el nombre que verás arriba cada vez que lo abras.',
      placeHolder: 'Nexus Consulting',
      ignoreFocusOut: true,
    });
    if (!suya || !suya.trim()) return null;
    return { arnes: suya.trim(), empresa: suya.trim() };
  }

  const como = COMO_SE_LLAMA[alcance] || COMO_SE_LLAMA_SIN_ALCANCE;
  const arnes = await vscode.window.showInputBox({
    title: 'Ponle nombre',
    prompt: `${como.prompt} Es el nombre que verás arriba cada vez que lo abras.`,
    placeHolder: como.placeHolder,
    // Lo que sale del objetivo son nombres de área —Facturación, Clientes—. A
    // una tarea o a un proyecto no les valen, y una caja vacía es mejor que un
    // nombre equivocado.
    value: !alcance || alcance === 'departamento' ? sugerirNombre(objetivo) : '',
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
    title: 'Para empezar',
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

// Lo que se le manda a RSC, sacado de las respuestas. Va aparte para que la
// prueba de contrato le pase a RSC exactamente lo mismo que le pasa el montaje.
//
// El objetivo va en base64, como lo escribe el propio RSC en su línea de
// aceptación. Escrito a mano puede llevar cualquier cosa, y en el camino de
// reserva de Windows pasa por cmd.exe, donde `& | ^ %` significan algo (A10).
function flagsDelMontaje(respuestas) {
  const flags = [
    '--technical-level', respuestas.nivel,
    '--accompaniment', respuestas.dial,
    '--project-kind', respuestas.kind,
    '--goal-base64', Buffer.from(String(respuestas.objetivo || ''), 'utf8').toString('base64url'),
    '--target', respuestas.asistente,
  ];
  // RSC pide el tamaño cuando se trata de construir algo, del todo o en parte.
  if (rumbo.CON_TAMANO.includes(respuestas.kind)) flags.push('--software-scope', respuestas.tamano || 'small');
  return flags;
}

// Lo que se cuenta en el parte según cómo acabó. `Listo` y `SueloAMedias` no
// llegan aquí: los dos son un arnés montado.
const CUANDO_FALLO = {
  Deshecho: 'el arnés falló a mitad y lo deshizo',
  PlanCambiado: 'el plan cambió entre que se vio y se aceptó',
  Invalido: 'el arnés no aceptó lo que se le mandó',
};

async function montarElArnes(respuestas) {
  const flags = flagsDelMontaje(respuestas);

  const previo = await rsc.correr(['onboard', ...flags], { tiempoMaximo: 600000 });
  const huella = (previo.salida.match(/Plan id:\s*([0-9a-f]{64})/i) || [])[1];
  if (!huella) return { ok: false, forma: 'SinPlan', detalle: loQuePaso('al pedir el plan', previo) };

  // Se reutiliza la línea de aceptación tal cual la imprime RSC —con el
  // objetivo en base64 y los mismos flags— para que la huella no pueda dejar
  // de coincidir.
  const linea = (previo.salida.match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
  const aceptar = linea ? linea.trim().split(/\s+/) : [...flags, '--accept-plan', huella];

  const aplicado = await rsc.correr(['onboard', ...aceptar], { tiempoMaximo: 900000 });

  // Montado es montado aunque falte el suelo: con la cadena SDD siempre faltan
  // los innegociables, que no escribe RSC sino el asistente. Lo que falta se
  // devuelve para levantarlo después, sin dejar de poner lo nuestro. La huella
  // tiene que ser la que se enseñó y la que RSC dejó en el recibo.
  const recibo = (proyecto.declaracion() || {}).onboarding || {};
  const como = rsc.comoAcaboElMontaje(aplicado, { planId: huella, aceptado: recibo.acceptedPlanId });
  if (como.forma === 'Listo') return { ok: true, forma: 'Listo' };
  if (como.forma === 'SueloAMedias') return { ok: true, forma: 'SueloAMedias', faltan: como.faltan };
  return { ok: false, forma: como.forma, detalle: loQuePaso(CUANDO_FALLO[como.forma] || 'al aplicar el plan', aplicado) };
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
// barra lateral. Con ellos, qué lleva la carpeta y cuánta gente hay detrás,
// que no los pide RSC y el asistente sí necesita saber.
function ponerEnElPerfil(campos) {
  const perfil = proyecto.ruta(...identidad.PERFIL);
  if (!perfil || !fs.existsSync(perfil)) return false;

  let texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloque) return false;

  // Los reemplazos van con función y no con texto: en un texto de reemplazo,
  // `$&` o `$'` quieren decir «lo encontrado» o «lo que viene detrás», y un
  // nombre como «Soler $& Hijos» rompía la cabecera del perfil.
  let cabecera = bloque[1];
  for (const [clave, valor] of Object.entries(campos)) {
    if (!valor) continue;
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    const puesta = `${clave}: ${valor}`;
    cabecera = linea.test(cabecera) ? cabecera.replace(linea, () => puesta) : `${cabecera}\n${puesta}`;
  }

  fs.writeFileSync(perfil, texto.replace(bloque[0], () => `---\n${cabecera}\n---`));
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
// arnés, seis de las nueve ya están escritas en `.rsc.json` y hasta ahora se
// volvían a preguntar igual.

const COMO_SE_PREGUNTA = {
  asistente: () => preguntarAsistente(),
  deQueVa: () => elegir('Para empezar', '¿De qué va esto?', DE_QUE_VA),
  alcance: () => elegir('Para empezar', '¿Qué vas a llevar en esta carpeta?', QUE_LLEVA),
  personas: () => elegir('Para empezar', '¿Cuántas personas están metidas en esto?', CUANTAS_PERSONAS),
  queConstruir: (yaDicho) => elegir('Para empezar', '¿Qué vas a construir?',
    QUE_VAS_A_CONSTRUIR.filter((o) => !o.soloCon || o.soloCon === yaDicho.kind)),
  objetivo: (yaDicho) => preguntarObjetivo(yaDicho.kind),
  nivel: () => elegir('Sobre ti', '¿Qué tal te manejas con el ordenador?', COMO_TE_MANEJAS),
  dial: () => elegir('Sobre ti', '¿Cuánto quieres que te explique?', CUANTO_TE_EXPLICO),
  nombres: (yaDicho) => preguntarNombres(yaDicho.objetivo, yaDicho.alcance),
};

// Dónde se guarda cada respuesta, en la forma que espera `montarElArnes`.
const LO_QUE_SE_GUARDA = {
  deQueVa: (r, o) => { r.kind = o.kind; },
  alcance: (r, o) => { r.alcance = o.alcance; },
  personas: (r, o) => { r.personas = o.personas; },
  queConstruir: (r, o) => { r.tamano = o.tamano; },
  nivel: (r, o) => { r.nivel = o.nivel; },
  dial: (r, o) => { r.dial = o.dial; },
  nombres: (r, o) => { r.nombres = o; },
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

    // Lo que solo se pregunta en ciertos casos: qué va a construir, solo si hay
    // algo que construir. Sin recibo no se sabe el tipo hasta que se contesta
    // la anterior, así que se mira aquí y no al calcular la lista.
    const pregunta = rumbo.PREGUNTAS.find((p) => p.id === que);
    if (pregunta && pregunta.soloSi && !pregunta.soloSi({ deQueVa: respuestas.kind })) continue;

    const contestada = await COMO_SE_PREGUNTA[que](respuestas);
    if (!contestada) return null;

    if (LO_QUE_SE_GUARDA[que]) LO_QUE_SE_GUARDA[que](respuestas, contestada);
    else respuestas[que] = contestada;
  }

  // La web no se pregunta nunca dos veces ni bloquea: es opcional.
  const web = plan.pasos.some((p) => p.id === 'montarElArnes') && !parte.recibo ? await preguntarWeb() : null;

  // Lo que ya estaba en el perfil vuelve a él: RSC lo reescribe entero en cada
  // plan aceptado, y alcance y personas no se vuelven a preguntar.
  return {
    ...respuestas,
    nombres: respuestas.nombres || nombres,
    alcance: respuestas.alcance || parte.railes.alcance || null,
    personas: respuestas.personas || parte.railes.personas || null,
    web,
  };
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

  montarElArnes: async ({ respuestas }) => ({ ...(await montarElArnes(respuestas)), imprescindible: true }),

  // Traer a esta máquina lo que el repositorio ya declaraba. No se vuelve a
  // montar nada: `sync` reconstruye desde el plan que alguien ya aceptó.
  traerLasHabilidades: async () => {
    const hecho = await rsc.sincronizar();
    return { ok: hecho.codigo === 0, detalle: (hecho.salida || '').trim().split('\n').pop(), imprescindible: true };
  },

  arreglarLoRoto: ({ salida }) => arreglarLoQueSePuedaSolo(salida),
  ponerLosRailes: async ({ contexto }) => ({ ok: await ponerLosRailes(contexto) }),
  ponerLosNombres: ({ respuestas }) => {
    const campos = { ...(respuestas.nombres || {}), alcance: respuestas.alcance, personas: respuestas.personas };
    return { ok: Object.values(campos).some(Boolean) ? ponerEnElPerfil(campos) : true };
  },
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
    { location: vscode.ProgressLocation.Notification, title: 'Preparando esta carpeta', cancellable: false },
    async (progreso) => {
      const avisos = [];
      const encargos = [];
      // Lo que RSC dijo que falta del suelo al aplicar: con la cadena SDD, los
      // innegociables. El arnés está montado y lo nuestro se sigue poniendo.
      const dijoRsc = [];

      for (const paso of plan.pasos) {
        if (paso.escribe) progreso.report({ message: `${paso.etiqueta}…` });

        const hecho = await COMO_SE_HACE[paso.id]({ respuestas, parte, contexto, salida, progreso });
        if (hecho.encargo) encargos.push(hecho.encargo);
        if (hecho.faltan) dijoRsc.push(...hecho.faltan);
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

      // El suelo, después de montar, desde dos sitios: lo que RSC dijo que
      // falta y lo que ve la barra, que son sus tres piezas. RSC puede decir
      // que terminó y dejarlo a medias, o decir que está a medias con el plan
      // aplicado. En los dos casos lo que falta lo levanta el asistente.
      const montado = plan.pasos.some((p) => p.id === 'montarElArnes');
      const veLaBarra = montado ? Object.entries(proyecto.sueloDelArnes()).filter(([, hay]) => !hay).map(([que]) => que) : [];
      const faltan = [...new Set([...dijoRsc, ...veLaBarra])];
      const sueloAMedias = faltan.length > 0;
      if (sueloAMedias) {
        salida.appendLine(`[arrancar] el arnés quedó montado y falta el suelo: ${faltan.join(', ')}`); // diccionario: interno
        encargos.push('levantarElSuelo');
      }

      return {
        ok: true,
        rama: plan.rama,
        avisos,
        encargos,
        sueloAMedias,
        faltan,
        objetivo: respuestas.objetivo,
        alcance: respuestas.alcance || null,
        personas: respuestas.personas || null,
        web: respuestas.web,
        nombres: respuestas.nombres || { arnes: null, empresa: null },
        // «Listo» solo cuando el arnés también lo daría por listo (G7). Con el
        // suelo a medias está montado, y lo que falta sale al terminar.
        mensaje: sueloAMedias
          ? `${(respuestas.nombres && respuestas.nombres.arnes) || 'Tu arnés'} ya está montado. Al terminar te enseño lo que falta.`
          : `${(respuestas.nombres && respuestas.nombres.arnes) || 'Tu arnés'} ya está listo.`,
      };
    },
  );
}

// Lo que lleva la carpeta y cuánta gente hay detrás, dicho para el asistente
// en el primer mensaje. Es lo que el `init` de RSC pregunta en su
// descubrimiento, y aquí ya se sabe.
const EN_EL_MENSAJE = {
  alcance: { tarea: 'una tarea concreta', proyecto: 'un proyecto', departamento: 'un departamento o un área', empresa: 'la empresa entera' },
  personas: { 'solo-yo': 'solo estoy yo', '2-10': 'somos de 2 a 10 personas', '11-50': 'somos de 11 a 50 personas', 'mas-de-50': 'somos más de 50 personas' },
};

function loQueLlevaLaCarpeta({ alcance, personas } = {}) {
  const que = EN_EL_MENSAJE.alcance[alcance];
  const quienes = EN_EL_MENSAJE.personas[personas];
  if (que && quienes) return `En esta carpeta llevo ${que}, y ${quienes}.`;
  if (que) return `En esta carpeta llevo ${que}.`;
  if (quienes) return `${quienes.charAt(0).toUpperCase()}${quienes.slice(1)}.`;
  return '';
}

// El primer mensaje al asistente, al terminar de montar. Sale en la caja del
// chat antes de mandarse, así que es texto de pantalla como cualquier otro.
function primerMensaje(hecho, { comoSeLlama, conWeb = '', conClaves = '' }) {
  const { empresa } = hecho.nombres || {};
  const deQuien = empresa && empresa !== comoSeLlama ? ` Es para ${empresa}.` : '';
  const queLleva = loQueLlevaLaCarpeta(hecho);
  // Lo de la web y lo de las claves van en párrafo aparte; sin ellos, un
  // espacio. Antes salía «facturas.Después» pegado.
  const enMedio = conWeb || conClaves ? `${conWeb}${conClaves}` : ' ';
  return `Acabo de montar aquí un arnés que he llamado "${comoSeLlama}".${deQuien}${queLleva ? ` ${queLleva}` : ''}`
    + ` Lo primero que quiero resolver: ${hecho.objetivo}.${enMedio}`
    + 'Después empieza preguntándome lo que necesites saber, de una pregunta en una pregunta.';
}

module.exports = {
  arrancar, entrevistar, ponerLosRailes, flagsDelMontaje, loQueLlevaLaCarpeta, primerMensaje,
  COMO_SE_HACE, COMO_SE_PREGUNTA, DE_QUE_VA, QUE_LLEVA, CUANTAS_PERSONAS, QUE_VAS_A_CONSTRUIR,
  COMO_TE_MANEJAS, CUANTO_TE_EXPLICO, OBJETIVOS_POR_TIPO,
};
