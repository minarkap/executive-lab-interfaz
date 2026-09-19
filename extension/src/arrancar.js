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

async function arrancar(contexto, salida) {
  if (!proyecto.raiz()) {
    return { ok: false, mensaje: 'Abre primero la carpeta donde quieres montar tu empresa.' };
  }
  if (proyecto.existe('.rsc.json')) {
    return { ok: false, mensaje: 'Aquí ya hay una empresa montada.' };
  }

  // git es obligatorio, y por qué lo es está en git.js. Se comprueba ANTES de
  // preguntar nada: enterarse a mitad, después de cinco respuestas y con la
  // barra de progreso en marcha, era la peor forma posible de descubrirlo.
  if (!(await git.hay())) {
    return { ok: false, faltaGit: true, mensaje: 'Falta una pieza para poder guardar tu trabajo.' };
  }

  const asistente = await preguntarAsistente();
  if (!asistente) return { ok: false, cancelado: true };

  const deQueVa = await elegir('Para empezar', '¿De qué va esto?', DE_QUE_VA);
  if (!deQueVa) return { ok: false, cancelado: true };

  const objetivo = await preguntarObjetivo(deQueVa.kind);
  if (!objetivo) return { ok: false, cancelado: true };

  const tamano = deQueVa.kind === 'software'
    ? await elegir('Para empezar', '¿Es algo pequeño o va para largo?', [
      { etiqueta: 'Algo pequeño', detalle: 'Una cosa concreta, para salir del paso', valor: 'small' },
      { etiqueta: 'Va para largo', detalle: 'Le voy a dedicar tiempo y va a crecer', valor: 'large' },
    ])
    : null;
  if (deQueVa.kind === 'software' && !tamano) return { ok: false, cancelado: true };

  const manejo = await elegir('Sobre ti', '¿Qué tal te manejas con el ordenador?', COMO_TE_MANEJAS);
  if (!manejo) return { ok: false, cancelado: true };

  const explico = await elegir('Sobre ti', '¿Cuánto quieres que te explique?', CUANTO_TE_EXPLICO);
  if (!explico) return { ok: false, cancelado: true };

  const nombres = await preguntarNombres(objetivo);
  if (!nombres) return { ok: false, cancelado: true };

  const web = await preguntarWeb();

  const respuestas = {
    asistente,
    kind: deQueVa.kind,
    objetivo,
    tamano: tamano ? (tamano.valor || tamano) : null,
    nivel: manejo.nivel,
    dial: explico.dial,
  };

  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Preparando tu empresa', cancellable: false },
    async (progreso) => {
      progreso.report({ message: 'preparando dónde guardar las copias…' });
      if (!(await prepararHistorial())) {
        salida.appendLine('[arrancar] git init falló');
        return { ok: false, mensaje: 'No puedo guardar copias en esta carpeta. Prueba con "Algo va mal".' };
      }

      progreso.report({ message: 'montando el arnés, esto tarda unos minutos…' });
      const montado = await montarElArnes(respuestas);
      if (!montado.ok) {
        salida.appendLine(`[arrancar] ${montado.detalle}`);
        return { ok: false, mensaje: 'No he podido montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor.' };
      }

      if (!proyecto.arnesCompleto()) {
        const suelo = proyecto.sueloDelArnes();
        const faltan = Object.entries(suelo).filter(([, hay]) => !hay).map(([que]) => que);
        salida.appendLine(`[arrancar] el arnés dijo estar listo y falta el suelo: ${faltan.join(', ') || '(nada, pero arnesCompleto() dice que no)'}`);
        return { ok: false, mensaje: 'El arnés se ha montado a medias. Pulsa "Algo va mal".' };
      }

      progreso.report({ message: 'poniendo los raíles…' });
      if (!(await ponerLosRailes(contexto))) salida.appendLine('[arrancar] no he podido poner los raíles');

      ponerLosNombres(nombres);
      apuntarLosEnganches(salida);

      // El punto de partida solo se escribe si el historial es nuestro. En un
      // proyecto que ya existía, `git add -A` metería el trabajo sin guardar de
      // esa persona en un commit nuestro, dentro de SU historial. No se pierde
      // nada, pero no se hace: se monta el arnés, se deja todo en el disco y
      // que lo guarde cuando quiera, con su mensaje.
      if (await terreno.podemosGuardarElPuntoDePartida()) {
        progreso.report({ message: 'guardando el punto de partida…' });
        await guardar.guardar(`Punto de partida — ${guardar.fechaLarga()}`);
      } else {
        salida.appendLine('[arrancar] historial de alguien: no se guarda punto de partida');
      }

      return { ok: true, objetivo, web, nombres, mensaje: `${nombres.arnes} ya está listo.` };
    },
  );
}

module.exports = { arrancar, DE_QUE_VA, COMO_TE_MANEJAS, CUANTO_TE_EXPLICO, OBJETIVOS_POR_TIPO };
