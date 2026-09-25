// Hablar con el arnés RSC.
//
// Siempre con la versión fijada, nunca con @latest: toda la cohorte tiene que
// correr exactamente el mismo catálogo, o dejan de servir las instrucciones de
// clase. Y siempre a través de node + el punto de entrada del paquete: sin npx
// por medio, que en Windows es un .cmd y en cualquier sitio tarda segundos.

const fs = require('node:fs');
const procesos = require('./procesos');
const proyecto = require('./proyecto');
const entorno = require('./entorno');

// Último recurso si .rsc.json no dice versión. Se actualiza a mano, a
// propósito: subir de versión es una decisión, no un efecto secundario.
const VERSION_DE_RESPALDO = '2.0.5';

function paquete() {
  return `@ericrisco/rsc@${proyecto.versionDelCatalogo() || VERSION_DE_RESPALDO}`;
}

// Cómo se invoca, por orden de preferencia:
//   1. el arnés preinstalado por el instalador (o el del proyecto) → node rsc.js
//   2. npx-cli.js del node que tengamos → node npx-cli.js --yes @ericrisco/rsc@X
//   3. npx del PATH (máquina de desarrollo), pasando por cmd.exe en Windows
// La carpeta de la extensión la pone extension.js al arrancar: desde aquí no
// hay forma de saberla, y es donde puede viajar el arnés.
let carpetaDeLaExtension = null;
const saberDondeEstamos = (ruta) => { carpetaDeLaExtension = ruta; };

async function correr(args, opciones) {
  const entrada = entorno.entradaDelArnes(proyecto.raiz(), carpetaDeLaExtension);
  if (entrada) return procesos.node([entrada, ...args], opciones);

  const npx = entorno.npxCli();
  if (npx) return procesos.node([npx, '--yes', paquete(), ...args], opciones);

  return procesos.delPath('npx', ['--yes', paquete(), ...args], opciones);
}

// Dónde se quedó la última sesión, según el checkpoint local de RSC. Devuelve
// null cuando no hay nada: RSC responde con éxito y un aviso entre paréntesis.
//
// ── Por qué esto tiene su propio recuerdo ────────────────────────────────
//
// Cuesta un proceso de Node entero, y se pedía en cada repintado. La brújula
// guarda su estado veinte segundos, pero **el camino del vigía se salta ese
// recuerdo**: repinta con `fresco`, y hace bien —si el asistente acaba de
// escribir un concepto, el número de conceptos tiene que subir ya—.
//
// El problema es meter esto en el mismo saco. Lo que sabe la brújula cambia
// cuando se toca un fichero; el registro de continuación **no**: solo cambia
// cuando se guarda un punto de sesión. Así que mientras el asistente trabaja
// —una tanda de cambios cada 600 ms— se arrancaba un proceso por tanda para
// releer algo que no se había movido.
//
// Un minuto, entonces, y aparte: el dato se usa para un rótulo de zona, no
// para nada que necesite estar al segundo. Y `olvidar()` para cuando se cambia
// de carpeta, que ahí sí es otro registro.
const CUANTO_DURA = 60000;
let recordado = { cuando: 0, texto: null, raiz: null };

const olvidarLaContinuacion = () => { recordado = { cuando: 0, texto: null, raiz: null }; };

async function retomar() {
  const aqui = proyecto.raiz();
  const vale = recordado.cuando
    && recordado.raiz === aqui
    && Date.now() - recordado.cuando < CUANTO_DURA;
  if (vale) return recordado.texto;

  const { codigo, salida } = await correr(['memory', 'resume'], { tiempoMaximo: 20000 });
  // Un fallo no se recuerda: recordar un intento que no salió deja la barra
  // sin continuación durante un minuto por un tropiezo de una vez. Es la misma
  // trampa que ya mordió en el catálogo de capacidades.
  if (codigo !== 0) return null;

  const texto = salida.trim();
  const limpio = !texto || /^\(no local continuation/i.test(texto) ? null : texto;
  recordado = { cuando: Date.now(), texto: limpio, raiz: aqui };
  return limpio;
}

// Enseñarle algo nuevo del catálogo. El catálogo viaja dentro del paquete,
// así que esto no necesita red.
//
// OJO: `rsc add` de la 1.4.1 dice "Installed" pase lo que pase, incluso con un
// identificador que no existe (comprobado el 17-09-2026 con `add --help`). Por
// eso no se cree a su código de salida: se mira si la habilidad ha aparecido
// de verdad en el disco.
async function anadir(id) {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return { ok: false };

  const quien = ((proyecto.declaracion() || {}).targets || ['claude'])[0];
  await correr(['add', id, '--target', quien], { tiempoMaximo: 180000 });
  return { ok: habilidadesPuestas().includes(id) };
}

// Las habilidades que están **en disco, en este ordenador**.
//
// Va aparte de `habilidadesPuestas()` por un motivo concreto: aquella hace la
// unión con lo declarado en `.rsc.json`, y con esa unión un repositorio clonado
// es indetectable — lo declarado tapa lo que falta. Para saber si hay que
// traerlas hay que mirar el disco a secas.
function habilidadesEnDisco() {
  const carpeta = require('./donde').carpetaDeHabilidades();
  if (!carpeta || !fs.existsSync(carpeta)) return [];
  try {
    return fs.readdirSync(carpeta, { withFileTypes: true })
      .filter((e) => (e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith('.'))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

// Las habilidades que esta carpeta tiene puestas: las de disco más las que
// declara el arnés. Es lo que la barra enseña.
function habilidadesPuestas() {
  const declaracion = proyecto.declaracion() || {};
  return [...new Set([...habilidadesEnDisco(), ...(declaracion.skills || []), ...(declaracion.ownSkills || [])])];
}

// ── Leer lo que contesta el arnés ────────────────────────────────────────

// `doctor --json` sale entero por la salida normal. Si no se puede leer, se
// dice que no se sabe: inventarse un informe sano sería peor que no tenerlo.
function comoEstaDeSalud({ codigo, salida }) {
  if (codigo !== 0) return null;
  try {
    return JSON.parse(salida);
  } catch {
    return null;
  }
}

// `repair --dry-run` imprime una línea por hallazgo, marcada `[fix]` si la sabe
// arreglar sola y `[ask]` si hace falta que alguien decida.
//
// La diferencia no es cosmética: `repair --yes` a ciegas aplicaría también los
// `[ask]`, y uno de ellos —`wrong-target`— **mueve el arnés a otro asistente**.
// Así que solo se deja arreglar solo lo que no pregunta nada.
function queHayQueArreglar({ codigo, salida }) {
  const texto = String(salida || '');
  if (codigo !== 0) return { sano: false, solas: [], aDecidir: [], sabemos: false };
  return {
    sabemos: true,
    sano: /Nothing to repair/i.test(texto),
    solas: texto.split('\n').map((l) => l.trim()).filter((l) => l.includes('[fix]')),
    aDecidir: texto.split('\n').map((l) => l.trim()).filter((l) => l.includes('[ask]')),
  };
}

// ── Lo que el doctor sabe y la barra no contaba ─────────────────────────
//
// `doctor --json` trae mucho más que «sano o no», y hasta hoy se pedía entero
// para no mirar dentro: la radiografía lanzaba tres procesos y leía uno. Lo
// que sigue son lectores de los campos que sí le importan a quien usa la
// barra. Cada uno devuelve `null` cuando el informe no se pudo leer, para que
// la pantalla pueda callar en vez de inventarse un «todo bien».

// Los guardianes: lo único del arnés que puede **decirle que no** a alguien.
//
// Son tres, se enganchan antes de cada orden y RSC los apunta en el recuento
// de enganches del informe (`contextBudget.scopes[].hookCounts.PreToolUse`).
// Que estén armados es lo normal y es bueno; lo que no puede ser es que nadie
// los nombre hasta que uno bloquea algo, que es justo cuando peor sienta.
//
// `gitmoji` tiene además su propio campo, porque se puede apagar y el informe
// dice si lo está. Los otros dos se apagan igual, con su fichero en `.rsc/`.
const LOS_GUARDIANES = ['danger-guard', 'gitmoji-guard', 'ship-guard'];

function queGuardianes(informe) {
  if (!informe) return null;

  const ambitos = (informe.contextBudget && informe.contextBudget.scopes) || [];
  const enganchados = new Set();
  for (const ambito of ambitos) {
    const antes = (ambito.hookCounts && ambito.hookCounts.PreToolUse) || {};
    for (const nombre of Object.keys(antes)) enganchados.add(nombre);
  }

  return LOS_GUARDIANES.map((id) => ({
    id,
    // El informe nombra el de gitmoji aparte, y ahí es donde dice si se apagó.
    apagado: id === 'gitmoji-guard' ? informe.gitmojiGuard === 'opted-out' : false,
    armado: enganchados.has(id),
  }));
}

// Las copias que guarda el propio arnés antes de tocar nada. No son las de
// git: RSC copia lo suyo antes de aplicar un plan, y eso es una red de
// seguridad que existe y que no se veía por ningún lado.
function queCopiasDelArnes(informe) {
  if (!informe || !informe.backups) return null;
  const { exists, count, latest } = informe.backups;
  return { hay: Boolean(exists), cuantas: count || 0, ultima: latest || null };
}

// Lo que el arnés declara y no está en disco. Con esto en rojo, la barra pinta
// botones que no responden — y era el caso que no se podía distinguir sin
// mirar aquí.
function queFaltaEnDisco(informe) {
  if (!informe) return null;
  const falta = [
    ...(informe.missing || []).map((id) => ({ id, que: 'habilidad' })),
    ...(informe.missingAgents || []).map((id) => ({ id, que: 'agente' })),
    ...(informe.missingCommands || []).map((id) => ({ id, que: 'comando' })),
  ];
  return falta;
}

// Lo que `reassess` recomienda, leído. Es de solo lectura, así que esto no
// puede cambiar nada: solo saber si hay algo que contar.
//
//   RSC_REASSESSMENT_NO_CHANGE      el plan sigue encajando
//   RSC_REASSESSMENT_RECOMMENDED    y detrás, una línea `tipo/id: por qué`
function queRecomienda({ codigo, salida }) {
  const texto = String(salida || '');
  if (codigo !== 0 || /RSC_REASSESSMENT_NO_CHANGE/.test(texto)) return [];

  return texto.split('\n')
    .map((l) => l.trim())
    .map((l) => l.match(/^(agent|guard|hook|workflow|skill|route|capability)\/([a-z0-9-]+):\s*(.+)$/))
    .filter(Boolean)
    .map(([, tipo, id, porQue]) => ({ tipo, id, porQue }));
}

// ── El plan, antes de aceptarlo ──────────────────────────────────────────
//
// `onboard` sin `--accept-plan` enseña el plan y no escribe nada. De ahí se lee
// lo que hace falta para decidir antes de firmar: la huella, la línea exacta de
// aceptación, lo que va a gestionar (`Managed paths:`, que en una carpeta de
// alguien incluye ficheros suyos), lo que ha elegido (`Selected:`) y si ha
// visto otro arnés por encima.
function leerElPlanEnSeco(salida = '') {
  const lineas = String(salida).split('\n');
  const seccion = (titulo) => {
    const desde = lineas.indexOf(titulo);
    if (desde < 0) return [];
    const hasta = lineas.findIndex((l, i) => i > desde && /^\S/.test(l));
    return lineas.slice(desde + 1, hasta < 0 ? undefined : hasta).map((l) => l.trim()).filter(Boolean);
  };
  const aceptar = (String(salida).match(/^Accept exactly this plan: npx @ericrisco\/rsc@\S+ onboard (.+)$/m) || [])[1];
  return {
    planId: (String(salida).match(/^Plan id: ([0-9a-f]{64})$/m) || [])[1] || null,
    aceptar: aceptar ? aceptar.trim().split(/\s+/) : [],
    gestionados: seccion('Managed paths:'),
    seleccionados: seccion('Selected:')
      .map((l) => l.match(/^\+ ([a-z-]+)\/(\S+) —/))
      .filter(Boolean)
      .map(([, kind, id]) => ({ kind, id })),
    avisos: lineas.filter((l) => /^Parent harness detected/.test(l)),
  };
}

// Lo que cambia entre lo que se aceptó y lo que propone un plan nuevo: lo que
// entra y lo que sale de «Selected». La huella puede cambiar solo porque cambió
// lo que hay en la carpeta, y eso no es una política nueva (decisión 95). Un
// recibo sin decisiones —de una versión anterior— no se puede comparar.
function cambiosDePolitica(seleccionados = [], decisiones) {
  if (!Array.isArray(decisiones)) return null;
  const clave = (d) => `${d.kind}/${d.id}`;
  const antes = new Set(decisiones.filter((d) => d && d.state === 'selected').map(clave));
  const ahora = new Set(seleccionados.map(clave));
  return {
    entran: [...ahora].filter((k) => !antes.has(k)).sort(),
    salen: [...antes].filter((k) => !ahora.has(k)).sort(),
  };
}

// ── Lo que contesta el montaje ───────────────────────────────────────────
//
// `onboard --accept-plan` termina de seis formas, y dos se llaman casi igual y
// no se parecen en nada (A3 de la auditoría todo-cuadra):
//
//   Listo          RSC_ONBOARDING_READY <huella>, por la salida normal
//   SueloAMedias   RSC_ONBOARDING_INCOMPLETE <huella>, por la salida normal y
//                  con código 0: el plan ESTÁ aplicado y falta parte del suelo.
//                  Pasa siempre que el plan practica SDD, porque entonces el
//                  suelo incluye los innegociables y `onboard` no los escribe
//   Deshecho       RSC_ONBOARDING_INCOMPLETE: …, por la de errores y con código
//                  4: falló a mitad y RSC lo ha deshecho
//   PlanCambiado   RSC_PLAN_CHANGED, con código 3
//   Invalido       RSC_ONBOARDING_INVALID o _REQUIRED, con código 2
//   Fallo          cualquier otra cosa
//
// La barra leía como un fallo todo lo que no fuera «listo», así que quien
// elegía algo que va a crecer se quedaba sin raíles, sin nombres y sin
// enganches, con el arnés montado debajo.
//
// Para dar un «a medias» por bueno, la huella tiene que ser la que se aceptó y
// la que RSC dejó escrita en el recibo: el de otro plan no es este montaje.
function comoAcaboElMontaje({ codigo, salida = '', error = '' }, { planId, aceptado } = {}) {
  const listo = salida.match(/^RSC_ONBOARDING_READY ([0-9a-f]{64})$/m);
  if (codigo === 0 && listo && (!planId || listo[1] === planId)) return { forma: 'Listo', planId: listo[1] };

  const aMedias = salida.match(/^RSC_ONBOARDING_INCOMPLETE ([0-9a-f]{64})$/m);
  if (codigo === 0 && aMedias && aMedias[1] === planId && aceptado === planId) {
    const faltan = [...salida.matchAll(/^\s+missing harness floor (.+)$/gm)].map((m) => m[1].trim());
    return { forma: 'SueloAMedias', planId, faltan };
  }

  if (codigo === 4 && /RSC_ONBOARDING_INCOMPLETE:/.test(error)) {
    const motivo = error.split('RSC_ONBOARDING_INCOMPLETE:')[1].split('. Recover with:')[0].trim();
    return { forma: 'Deshecho', motivo };
  }
  if (/RSC_PLAN_CHANGED/.test(`${salida}\n${error}`)) return { forma: 'PlanCambiado' };

  const invalido = error.match(/RSC_ONBOARDING_INVALID: invalid ([a-z-]+)/);
  if (invalido) return { forma: 'Invalido', campo: invalido[1] };
  const falta = error.match(/RSC_ONBOARDING_REQUIRED (\{.*\})/);
  if (falta) {
    try {
      return { forma: 'Invalido', campo: JSON.parse(falta[1]).missing.join(', ') };
    } catch {
      return { forma: 'Invalido', campo: null };
    }
  }
  return { forma: 'Fallo', codigo };
}

const revisar = () => correr(['doctor'], { tiempoMaximo: 120000 });

// El mismo doctor, pero para máquina. Sin `--json` la salida lleva delante el
// bloque de presupuesto de contexto, en texto, así que `JSON.parse` revienta.
// `revisar()` se queda como está: esa la lee una persona, en el informe.
const salud = () => correr(['doctor', '--json'], { tiempoMaximo: 120000 });

// Traer a esta máquina lo que el repositorio declara. Es la acción correcta
// para un clon: reconstruye desde el plan aceptado y —a diferencia de `add` y
// de `install`— no exige que ya haya un arnés instalado aquí, que en un clon
// es justo lo que no hay.
const sincronizar = () => correr(['sync'], { tiempoMaximo: 300000 });

// Si lo que se acordó al montar sigue encajando con lo que hay hoy. Es de
// **solo lectura**: recomienda y no escribe nada. Aceptar un plan nuevo lo
// tiene que hacer una persona, por su huella.
const reevaluar = () => correr(['reassess'], { tiempoMaximo: 60000 });
const arreglarEnSeco = () => correr(['repair', '--dry-run'], { tiempoMaximo: 120000 });

// `repair` vuelve a instalar sin la política del plan aceptado: medido con el
// paquete, en una carpeta de operaciones con algo roto engancha los cuatro frenos
// de RSC, que ese plan no pide, y el siguiente `sync` los quita (C6). Qué frenos
// había dependía de qué orden corrió la barra la última vez. Así que detrás de
// cada `repair` que sale bien va un `sync`, que aplica el plan que alguien
// aceptó. Si el `sync` falla, se dice ese fallo.
async function yDespuesElPlan(reparado) {
  if (reparado.codigo !== 0) return reparado;
  const sincronizado = await sincronizar();
  if (sincronizado.codigo === 0) return reparado;
  return { ...sincronizado, salida: [reparado.salida, sincronizado.salida].filter(Boolean).join('\n') };
}

const arreglar = async () => yDespuesElPlan(await correr(['repair'], { tiempoMaximo: 180000 }));

// Arreglar sin que nadie conteste. Solo se llama cuando `queHayQueArreglar()`
// ha dicho que no hay nada que preguntar: ver arriba por qué.
const arreglarSolo = async () => yDespuesElPlan(await correr(['repair', '--yes'], { tiempoMaximo: 180000 }));

module.exports = {
  correr, retomar, revisar, salud, sincronizar, reevaluar, arreglarEnSeco, arreglar, arreglarSolo,
  comoEstaDeSalud, queHayQueArreglar, queRecomienda, comoAcaboElMontaje, leerElPlanEnSeco, cambiosDePolitica,
  queGuardianes, queCopiasDelArnes, queFaltaEnDisco, LOS_GUARDIANES,
  olvidarLaContinuacion,
  paquete, VERSION_DE_RESPALDO, saberDondeEstamos, habilidadesPuestas, habilidadesEnDisco, anadir,
};
