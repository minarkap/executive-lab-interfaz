// Las habilidades (skills): las que hay instaladas y las que se pueden añadir.
//
// Las piezas estaban todas y sin conectar: el catálogo curado en español
// (`media/capacidades.json`), la lista de lo que hay puesto
// (`rsc.habilidadesPuestas`) y la instalación (`rsc.anadir`). Lo único que
// faltaba era una pantalla, porque hasta ahora el consejero ofrecía **una**
// capacidad cuando encajaba con lo que ya tenías escrito, y no había forma de
// ver el resto.
//
// ── Todo lo instalado se ve ──────────────────────────────────────────────
//
// Jose, 21 de septiembre de 2026: *«que haya un mapeo correcto entre RSC y la
// extensión»*. Hasta hoy, 27 de las 32 habilidades que monta la 2.0 no salían
// por ningún lado: se llamaban «fontanería» y se descontaban en silencio. Eso
// no es un mapeo, es un agujero. Ahora cada habilidad instalada cae en **uno**
// de cuatro montones, y una comprobación exige que la suma cuadre:
//
//   suyas     las escritas para esta carpeta (`ownSkills` de `.rsc.json`)
//   sabe      las de nuestro catálogo curado que están puestas
//   otras     las instaladas que no están en el catálogo ni son del arnés
//   deSerie   las que el arnés monta para funcionar por dentro (plegadas)
//
// Y cada una trae `prompt`: lo que hay que mandarle al asistente para
// invocarla. Antes se mandaba «Quiero <frase>», que ni nombraba la habilidad
// ni la disparaba. Ver `comoSePide`.

const path = require('node:path');
const consejos = require('./consejos');
const nombres = require('./nombres');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');
const rsc = require('./rsc');
const donde = require('./donde');

// Las que ha escrito esta empresa para sí misma. RSC las apunta aparte en
// `.rsc.json` (`ownSkills`), separadas de las del catálogo, y hace bien:
// no son de nadie más.
function lasSuyas() {
  const declaracion = proyecto.declaracion() || {};
  return Array.isArray(declaracion.ownSkills) ? declaracion.ownSkills : [];
}

// ── Cómo se invoca una habilidad ─────────────────────────────────────────
//
// Leído en RSC (`targets/commands.js`): para Claude, `skillsAreCommands: true`
// — las habilidades **son** comandos, `/unslop` la dispara, y por eso RSC no le
// escribe un comando por habilidad como hace con Cursor o Copilot. Así que con
// Claude el botón manda exactamente lo que se escribiría a mano.
//
// Con los demás asistentes no hay barra: se le pide con palabras, nombrando la
// habilidad por su identificador, que es lo que él tiene en su carpeta.
function comoSePide(id) {
  if (donde.paraQuien() === 'claude') return `/${id}`;
  return `Usa la habilidad «${id}» (skill). Pregúntame lo que necesites.`;
}

// De una habilidad escrita aquí, su nombre y para qué sirve, sacados de su
// propia cabecera.
function loQueDiceSuCabecera(id, raizDeHabilidades) {
  if (!raizDeHabilidades) return { nombre: '', queHace: '' };

  const campos = frontmatter.leer(path.join(raizDeHabilidades, id, 'SKILL.md'));
  const frase = typeof campos.description === 'string' ? campos.description.trim() : '';

  // La descripción de una habilidad está escrita **para el asistente**: empieza
  // por «úsala cuando…» y es larga. Al alumno eso le suena a instrucciones de
  // otro. Se le quita esa entradilla y se corta por la primera frase, que es la
  // que dice de verdad para qué sirve.
  //
  // Y hay que quitar las dos mitades. «Úsala siempre que quieras revisar el
  // texto» sin la segunda salía como «Quieras revisar el texto»: castellano
  // roto, en mayúscula y en pantalla. La entradilla es la subordinada entera
  // —«siempre que <verbo>»— y lo que sirve empieza en el infinitivo.
  const sinEntradilla = frase
    .replace(/^(úsala|usala|use|used?|utilízala|utilizala)\s+(siempre\s+que|cuando|whenever|when|for)\s+/i, '')
    .replace(/^(vayas?\s+a|quieras|necesites|tengas\s+que|haya\s+que|te\s+toque|you want to|the user)\s+/i, '');
  const primera = sinEntradilla.split(/(?<=\.)\s/)[0] || sinEntradilla;

  return {
    nombre: '',
    queHace: nombres.enEspanol(primera) ? primera.charAt(0).toUpperCase() + primera.slice(1) : '',
  };
}

// Una habilidad instalada, con su nombre resuelto por el orden de `nombres.js`:
// lo suyo, la tabla, el nombre del fichero.
function comoSeLlama(id, raiz) {
  const dicho = nombres.comoSeLlama('habilidades', id, loQueDiceSuCabecera(id, raiz));
  return { id, nombre: dicho.nombre, frase: dicho.queHace, prompt: comoSePide(id), delArnes: dicho.deFuera };
}

// Para qué se montó esta carpeta. Lo decidió quien la montó, respondiendo a
// «¿De qué va esto?», y RSC lo dejó firmado dentro del plan aceptado. No se
// adivina mirando ficheros: está escrito.
function paraQueEs() {
  const declaracion = proyecto.declaracion();
  const tipo = declaracion && declaracion.onboarding
    && declaracion.onboarding.plan && declaracion.onboarding.plan.record
    && declaracion.onboarding.plan.record.projectKind;
  return typeof tipo === 'string' && tipo ? tipo : null;
}

function queSabe(carpetaDeLaExtension, corpus = '') {
  const catalogo = consejos.capacidades(carpetaDeLaExtension);
  const puestas = rsc.habilidadesPuestas();
  const propias = lasSuyas();
  const raiz = donde.carpetaDeHabilidades();
  const enCatalogo = (id) => catalogo.some((c) => c.id === id);

  // ── Los cuatro montones de lo instalado ───────────────────────────────
  const suyas = puestas.filter((id) => propias.includes(id));
  const sabe = catalogo.filter((c) => puestas.includes(c.id) && !propias.includes(c.id));
  const deSerie = puestas.filter((id) => !propias.includes(id) && !enCatalogo(id) && nombres.esFontaneria(id));
  const otras = puestas.filter((id) => !propias.includes(id) && !enCatalogo(id) && !nombres.esFontaneria(id));

  // ── Lo que se ofrece va con este arnés, no con todos ──────────────────
  //
  // Jose: *«¿estos "puede aprender" son fijos? deberían hacerse en el init del
  // arnés ajustado al arnés, no?»*. Lo eran: se cogían las que encajaban por
  // palabras y detrás **se pegaba el catálogo entero**. En un arnés de código
  // eso ofrecía facturas, gestoría y proveedores.
  //
  // Ahora se ofrece en dos escalones, los dos deterministas:
  //
  //   1. las que encajan con lo que hay ESCRITO en esta carpeta (palabras),
  //   2. las que encajan con PARA QUÉ se montó, que es lo que RSC guardó en
  //      `.rsc.json` cuando se aceptó el plan.
  //
  // Y lo demás no desaparece: se queda detrás de un desplegable. Lo que no se
  // puede calcular —qué habilidad le vendría bien a ESTA empresa y no existe
  // todavía— no se adivina aquí: lo propone el asistente, que para eso tiene
  // delante el perfil y la carpeta.
  const sinPoner = catalogo.filter((c) => !puestas.includes(c.id));
  const encajan = consejos.loQuePodriaAprender({ corpus, yaInstaladas: puestas, catalogo });
  const pegan = new Set(encajan.map((c) => c.id));

  const deQueVa = paraQueEs();
  const sirveAqui = (c) => !deQueVa || deQueVa === 'mixed'
    || !Array.isArray(c.para) || !c.para.length || c.para.includes(deQueVa);

  const restantes = sinPoner.filter((c) => !pegan.has(c.id));
  const puedeAprender = [...encajan, ...restantes.filter(sirveAqui)];
  const lasDemas = restantes.filter((c) => !sirveAqui(c));

  const delCatalogo = (c) => ({
    id: c.id, nombre: c.nombre, frase: c.frase, prompt: comoSePide(c.id), delArnes: false, porQue: c.porQue || [],
  });

  return {
    suyas: suyas.map((id) => comoSeLlama(id, raiz)),
    sabe: sabe.map(delCatalogo),
    otras: otras.map((id) => comoSeLlama(id, raiz)),
    // Las que trae el arnés para funcionar. Se ven —plegadas— con su nombre en
    // español y su identificador, porque están instaladas y lo instalado se ve.
    deSerie: deSerie.map((id) => comoSeLlama(id, raiz)),
    puedeAprender: puedeAprender.map(delCatalogo),
    // Cuántas de las de arriba encajan con lo que hay escrito, para poder
    // separarlas en pantalla de las que salen porque sí.
    encajan: encajan.length,
    // Las que no pegan con este arnés. No se tiran: se pliegan.
    lasDemas: lasDemas.map(delCatalogo),
    // Para qué se montó esta carpeta, dicho por RSC. La pantalla lo necesita
    // para explicar por qué la lista es corta.
    deQueVa,
    // Cuántas hay instaladas en total. Tiene que ser la suma de los cuatro
    // montones: es la comprobación de que el mapeo no deja nada fuera.
    instaladas: puestas.length,
  };
}

module.exports = { queSabe, comoSePide };
