// "Empezar una empresa aquí": el wizard, dentro del editor.
//
// Es el mismo trabajo que hace `instalador/comun/preparar.js` en la máquina
// del alumno la primera vez, pero para la segunda carpeta y las siguientes:
// el instalador solo prepara una. Si cambias los pasos aquí, míralo también
// allí — y al revés.
//
// Las opciones son las mismas que las del instalador de Windows
// (`instalador/windows/ExecutiveLab.iss`, función `Objetivo`). El diccionario
// manda que ninguna pregunta se haga sin opciones: un campo de texto vacío
// delante de quien no sabe qué escribir es una pared.

const vscode = require('vscode');
const path = require('node:path');
const fs = require('node:fs');

const proyecto = require('./proyecto');
const procesos = require('./procesos');
const rsc = require('./rsc');
const guardar = require('./guardar');
const identidad = require('./identidad');
const asistentes = require('./asistentes');

const OBJETIVOS = [
  'Poner orden en mis facturas',
  'Atender mejor a mis clientes',
  'Organizar los documentos de la empresa',
  'Vender más y hacer seguimiento',
  'Quitarme tareas repetitivas de encima',
  'Llevar los contratos y el papeleo de la gente',
];

const OTRA_COSA = 'Otra cosa — te lo cuento yo';

async function preguntarObjetivo() {
  const elegido = await vscode.window.showQuickPick([...OBJETIVOS, OTRA_COSA], {
    title: 'Empezar una empresa aquí',
    placeHolder: '¿Qué te gustaría resolver primero?',
    ignoreFocusOut: true,
  });
  if (!elegido) return null;
  if (elegido !== OTRA_COSA) return elegido;

  const escrito = await vscode.window.showInputBox({
    title: 'Empezar una empresa aquí',
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
async function montarElArnes(objetivo, asistente) {
  const flags = [
    '--technical-level', 'non-technical',
    '--accompaniment', 'L3',
    '--project-kind', 'operations',
    '--goal', objetivo,
    '--target', asistente,
  ];

  const previo = await rsc.correr(['onboard', ...flags], { tiempoMaximo: 600000 });
  const huella = (previo.salida.match(/Plan id:\s*([0-9a-f]{64})/i) || [])[1];
  if (!huella) return { ok: false, detalle: previo.error || previo.salida };

  const linea = (previo.salida.match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
  const aceptar = linea ? linea.trim().split(/\s+/) : [...flags, '--accept-plan', huella];

  const aplicado = await rsc.correr(['onboard', ...aceptar], { tiempoMaximo: 900000 });
  if (/RSC_PLAN_CHANGED/.test(aplicado.salida)) {
    return { ok: false, detalle: 'El plan cambió entre que se vio y se aceptó.' };
  }
  if (!/RSC_ONBOARDING_READY/.test(aplicado.salida)) {
    return { ok: false, detalle: aplicado.error || aplicado.salida };
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

  const objetivo = await preguntarObjetivo();
  if (!objetivo) return { ok: false, cancelado: true };

  const asistente = await preguntarAsistente();
  if (!asistente) return { ok: false, cancelado: true };

  const nombres = await preguntarNombres(objetivo);
  if (!nombres) return { ok: false, cancelado: true };

  const web = await preguntarWeb();

  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Preparando tu empresa', cancellable: false },
    async (progreso) => {
      progreso.report({ message: 'preparando dónde guardar las copias…' });
      if (!(await prepararHistorial())) {
        salida.appendLine('[arrancar] git init falló');
        return { ok: false, mensaje: 'No puedo guardar copias en esta carpeta. Prueba con "Algo va mal".' };
      }

      progreso.report({ message: 'montando el arnés, esto tarda unos minutos…' });
      const montado = await montarElArnes(objetivo, asistente);
      if (!montado.ok) {
        salida.appendLine(`[arrancar] ${montado.detalle}`);
        return { ok: false, mensaje: 'No he podido montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor.' };
      }

      if (!proyecto.arnesCompleto()) {
        salida.appendLine('[arrancar] falta el suelo del arnés tras un onboarding que dijo estar listo');
        return { ok: false, mensaje: 'El arnés se ha montado a medias. Pulsa "Algo va mal".' };
      }

      progreso.report({ message: 'poniendo los raíles…' });
      if (!(await ponerLosRailes(contexto))) salida.appendLine('[arrancar] no he podido poner los raíles');

      ponerLosNombres(nombres);

      progreso.report({ message: 'guardando el punto de partida…' });
      await guardar.guardar(`Punto de partida — ${guardar.fechaLarga()}`);

      return { ok: true, objetivo, web, nombres, mensaje: `${nombres.arnes} ya está listo.` };
    },
  );
}

module.exports = { arrancar, OBJETIVOS };
