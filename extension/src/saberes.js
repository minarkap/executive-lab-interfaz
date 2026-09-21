// Qué sabe hacer tu asistente, y qué más podría aprender.
//
// Las piezas estaban todas y sin conectar: el catálogo curado de 25
// capacidades en español (`media/capacidades.json`), la lista de lo que hay
// puesto (`rsc.habilidadesPuestas`) y la instalación (`rsc.anadir`). Lo único
// que faltaba era una pantalla, porque hasta ahora el consejero ofrecía **una**
// capacidad cuando encajaba con lo que ya tenías escrito, y no había forma de
// ver el resto. "¿Esto qué sabe hacer?" es de las primeras preguntas que se
// hace alguien delante de una herramienta nueva, y no tenía respuesta.
//
// ── Lo que NO se enseña ──────────────────────────────────────────────────
//
// Un arnés recién montado trae nueve habilidades, y cuatro son fontanería:
// `orient`, `suggest`, `harness`, `init`. Esas son de la máquina, no del
// alumno — `harness` es justo el tipo de palabra que el diccionario prohíbe —
// así que no se listan una por una: se cuentan en una línea y se acabó.
//
// La regla es la misma de siempre: lo que no está en el catálogo curado no se
// nombra. Aquí eso vale para los dos lados, para lo que se ofrece y para lo
// que se enseña como puesto.

const path = require('node:path');
const consejos = require('./consejos');
const nombres = require('./nombres');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');
const rsc = require('./rsc');

// Las que ha escrito esta empresa para sí misma. RSC las apunta aparte en
// `.rsc.json` (`ownSkills`), separadas de las del catálogo, y hace bien:
// no son de nadie más.
function lasSuyas() {
  const declaracion = proyecto.declaracion() || {};
  return Array.isArray(declaracion.ownSkills) ? declaracion.ownSkills : [];
}

// De cada una, su nombre y para qué sirve, sacados de su propia cabecera.
function comoSeLlama(id, raizDeHabilidades) {
  const humano = id.replace(/[-_]+/g, ' ');
  if (!raizDeHabilidades) return { id, nombre: humano, frase: '' };

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

  // Y si lo que hay escrito no está en español, mejor solo el nombre: media
  // barra en cristiano y una línea en inglés queda peor que no decir nada. Las
  // habilidades del catálogo de RSC vienen en inglés.
  const enEspanol = /\b(el|la|los|las|un|una|de|del|que|para|con|por|cuando|siempre|tu|tus)\b/i.test(primera);

  return {
    id,
    nombre: humano,
    frase: enEspanol ? primera.charAt(0).toUpperCase() + primera.slice(1) : '',
  };
}

// ── Lo que se le puede enseñar, ordenado por esta carpeta ────────────────
//
// Jose, mirando la lista: *«no crees que esto depende del arnés?»*. Y tenía
// razón: eran veinticinco capacidades en el mismo orden en todas las carpetas.
// A una gestoría se le ofrecía «revisar contratos» con el mismo peso que
// «llevar las cuentas», que es justo lo contrario del principio de esta barra.
//
// El criterio ya existía y no se usaba aquí: `consejos.loQuePodriaAprender`
// puntúa cada capacidad contra lo que esa carpeta tiene escrito —sus conceptos,
// sus botones, sus conexiones— y devuelve las que encajan, ordenadas.
//
// Las que no encajan **no se esconden**: van detrás, porque una carpeta recién
// montada no tiene corpus todavía y ahí el orden no lo puede saber nadie.
// Para qué se montó esta carpeta. Lo decidió quien la montó, respondiendo a
// «¿De qué va esto?», y RSC lo dejó firmado dentro del plan aceptado. No se
// adivina mirando ficheros: está escrito.
function paraQueEs() {
  const declaracion = require('./proyecto').declaracion();
  const tipo = declaracion && declaracion.onboarding
    && declaracion.onboarding.plan && declaracion.onboarding.plan.record
    && declaracion.onboarding.plan.record.projectKind;
  return typeof tipo === 'string' && tipo ? tipo : null;
}

function queSabe(carpetaDeLaExtension, corpus = '') {
  const catalogo = consejos.capacidades(carpetaDeLaExtension);
  const puestas = rsc.habilidadesPuestas();
  const propias = lasSuyas();

  // Las del catálogo que ya están puestas, y las que no. El orden del catálogo
  // se respeta: está pensado, no es alfabético.
  const sabe = catalogo.filter((c) => puestas.includes(c.id));

  // ── Lo que se ofrece va con este arnés, no con todos ──────────────────
  //
  // Jose: *«¿estos "puede aprender" son fijos? deberían hacerse en el init del
  // arnés ajustado al arnés, no?»*. Lo eran: se cogían las que encajaban por
  // palabras y detrás **se pegaba el catálogo entero**. En un arnés de código
  // eso ofrecía facturas, gestoría y proveedores — veinticinco cosas de las
  // que veintiuna no venían a cuento.
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
  const puedeAprender = [
    ...encajan.map((c) => ({ ...c, porQue: c.porQue })),
    ...restantes.filter(sirveAqui),
  ];
  const lasDemas = restantes.filter((c) => !sirveAqui(c));

  const raiz = require('./donde').carpetaDeHabilidades();

  // ── Todo lo que hay puesto, no solo lo del catálogo ───────────────────
  //
  // Jose: *«se deben detectar todas las skills del proyecto»*. Y hacía falta:
  // nuestro catálogo cura veinticinco capacidades en español, pero RSC tiene
  // cientos. Una habilidad instalada fuera de esa lista —`nextjs`, `design`,
  // cualquiera— se contaba como fontanería y no se veía por ningún lado.
  //
  // Qué es fontanería está en `media/nombres.json`, no aquí: es un dato, y
  // cambia con la versión del arnés. Con la 1.4.1 eran cuatro; la 2.0 monta un
  // arnés entero para todos —32 habilidades, la cadena de trabajo incluida— y
  // sin esa lista esta pantalla pasaba de cuatro líneas a veintisiete, en
  // inglés. Lo que no esté en la lista y no esté en el catálogo **sí sale**:
  // una habilidad útil instalada más tarde no desaparece en silencio.

  // Cómo se llaman en cristiano las que trae el arnés: en `media/nombres.json`.
  // Vienen con el nombre en clave —«Bro», «Eli5», «Show me»— y la descripción
  // en inglés, y eso no significa nada para quien usa la barra. La tabla está
  // fuera del código a propósito: renombrar una es cambiar una línea de datos.

  const otras = puestas
    .filter((id) => !catalogo.some((c) => c.id === id))
    .filter((id) => !propias.includes(id))
    .filter((id) => !nombres.esFontaneria(id))
    .map((id) => {
      const suyo = comoSeLlama(id, raiz);
      const dicho = nombres.comoSeLlama('habilidades', id, { nombre: '', queHace: '' });
      // La tabla manda sobre la cabecera: la cabecera de una habilidad del
      // arnés está en inglés y escrita para el asistente, no para quien mira.
      return dicho.deFuera ? { id, nombre: dicho.nombre, frase: dicho.queHace } : suyo;
    });

  const deSerie = puestas.filter((id) => nombres.esFontaneria(id)).length;

  return {
    sabe: sabe.map((c) => ({ id: c.id, nombre: c.nombre, frase: c.frase })),
    puedeAprender: puedeAprender.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      frase: c.frase,
      // Por qué encaja con esta carpeta, si es que encaja. Son las palabras que
      // se han encontrado escritas aquí.
      porQue: c.porQue || [],
    })),
    // Cuántas de las de arriba encajan con lo que hay montado, para poder
    // separarlas en pantalla de las que salen porque sí.
    encajan: encajan.length,
    // Las que no pegan con este arnés. No se tiran: se pliegan.
    lasDemas: lasDemas.map((c) => ({ id: c.id, nombre: c.nombre, frase: c.frase, porQue: [] })),
    // Para qué se montó esta carpeta, dicho por RSC. La pantalla lo necesita
    // para explicar por qué la lista es corta.
    deQueVa,
    suyas: propias.map((id) => comoSeLlama(id, raiz)),
    // Las instaladas que no están en nuestro catálogo: se nombran con lo que
    // diga su propia cabecera, que para eso la traen.
    otras,
    deSerie,
  };
}

module.exports = { queSabe };
