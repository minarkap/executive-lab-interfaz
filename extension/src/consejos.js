// Que la barra avise cuando algo puede ayudar, y solo entonces.
//
// Tres reglas de la casa, y las tres son para que esto no se convierta en
// ruido —que es como acaban todos los asistentes que "sugieren":
//
//   1. Una tarjeta como mucho, nunca dos. La lista está ordenada por lo que
//      más desatasca, y solo sale la primera.
//   2. Siempre se puede decir "ahora no", y entonces no vuelve a salir en dos
//      semanas. Eso se recuerda en el almacén de la ventana, que no se ve ni
//      se versiona.
//   3. Nada que el alumno no pueda resolver ahí mismo con un botón. Un aviso
//      que solo informa de un problema es un aviso que estorba.
//
// `consejos(contexto)` es una función pura: se le da lo que se sabe y devuelve
// la lista ordenada. Así se puede probar entera sin tocar el disco.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');

// Cuántas ideas de automatización dejó el asistente sin mirar. `skill-scout`
// escribe una línea por veredicto en `.rsc/automation-gaps.md`; las que empiezan
// por `proposed-` son propuestas y las `covered-` ya estaban cubiertas. Se lee
// del disco y gratis, como todo lo que alimenta a los consejos.
function huecosDeAutomatizacion() {
  const ruta = proyecto.ruta('.rsc', 'automation-gaps.md');
  if (!ruta || !fs.existsSync(ruta)) return 0;
  try {
    return fs.readFileSync(ruta, 'utf8').split('\n').filter((l) => /\bproposed-/.test(l)).length;
  } catch {
    return 0;
  }
}

// ------------------------------------------------------------- capacidades

// El catálogo curado en español. Lo que no esté ahí no se ofrece nunca.
let catalogoEnMemoria = null;

// Solo se recuerda lo que se ha leído de verdad. Recordar el fallo era una
// trampa esperando: la primera llamada que llegara sin saber dónde está la
// extensión dejaba el catálogo vacío **para el resto de la sesión**, y a partir
// de ahí la barra no ofrecía ninguna capacidad, no enseñaba ninguna de las
// puestas por su nombre en español, y nada fallaba. Un intento que no sale no
// es una respuesta: es un intento.
function capacidades(carpetaDeLaExtension) {
  if (catalogoEnMemoria) return catalogoEnMemoria;
  if (!carpetaDeLaExtension) return [];
  try {
    const fichero = path.join(carpetaDeLaExtension, 'media', 'capacidades.json');
    const leido = JSON.parse(fs.readFileSync(fichero, 'utf8')).capacidades || [];
    if (leido.length) catalogoEnMemoria = leido;
    return leido;
  } catch {
    return [];
  }
}

const pelar = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Qué capacidad le vendría bien, mirando lo que ya tiene escrito: su objetivo,
// los temas de los que sabe, sus botones y sus conexiones.
//
// Hacen falta dos palabras distintas, no una: con una sola, cualquier empresa
// que nombre "cliente" de pasada recibiría la misma oferta, y eso es ruido.
function loQuePodriaAprender({ corpus = '', yaInstaladas = [], catalogo = [] }) {
  const texto = pelar(corpus);
  if (!texto) return [];

  return catalogo
    .filter((c) => !yaInstaladas.includes(c.id))
    .map((c) => {
      const aciertos = c.palabras.filter((p) => texto.includes(pelar(p)));
      return { ...c, aciertos: aciertos.length, porQue: aciertos.slice(0, 3) };
    })
    .filter((c) => c.aciertos >= 2)
    .sort((a, b) => b.aciertos - a.aciertos);
}

// -------------------------------------------------------------- repetición

// Dos peticiones se parecen si comparten la mayoría de sus palabras largas.
// No es semántica: es contar, y para "prepárame el resumen del mes" pedido
// tres veces basta y sobra.
function seParecen(una, otra, umbral = 0.6) {
  const palabras = (t) => new Set(pelar(t).split(/[^a-z0-9ñ]+/).filter((p) => p.length > 3));
  const a = palabras(una);
  const b = palabras(otra);
  if (!a.size || !b.size) return false;

  let comunes = 0;
  for (const palabra of a) if (b.has(palabra)) comunes += 1;
  return comunes / Math.min(a.size, b.size) >= umbral;
}

// El grupo de peticiones parecidas más repetido, si llega a tres.
function loQueRepite(peticiones = [], cuantasHacenFalta = 3) {
  const grupos = [];
  for (const peticion of peticiones) {
    const suyo = grupos.find((g) => seParecen(g.muestra, peticion));
    if (suyo) suyo.veces += 1;
    else grupos.push({ muestra: peticion, veces: 1 });
  }
  const masRepetido = grupos.sort((a, b) => b.veces - a.veces)[0];
  return masRepetido && masRepetido.veces >= cuantasHacenFalta ? masRepetido : null;
}

// ----------------------------------------------------------- los consejos

const DIAS = 86400000;

// Ordenados por lo que más desatasca. El primero que valga es el que sale.
function consejos(contexto = {}) {
  const {
    esperandoDesdeHace = null,   // días que llevan los documentos sin leer
    esperando = 0,
    conexionesAMedias = [],      // [{ id, etiqueta, faltan }]
    diasSinCopia = null,
    cambiosSinGuardar = 0,
    peticiones = [],
    corpus = '',
    yaInstaladas = [],
    catalogo = [],
    huecos = [],
    silenciados = {},            // { id: fecha en la que se dijo "ahora no" }
    huecosDeAutomatizacion = 0,  // ideas que el asistente apuntó tras trabajar (`.rsc/automation-gaps.md`)
    ahora = Date.now(),
  } = contexto;

  const lista = [];

  if (esperando && esperandoDesdeHace !== null && esperandoDesdeHace >= 2) {
    lista.push({
      id: 'documentos-esperando',
      texto: esperando === 1
        ? `Tienes 1 documento esperando desde hace ${esperandoDesdeHace} días.`
        : `Tienes ${esperando} documentos esperando desde hace ${esperandoDesdeHace} días.`,
      boton: 'Que los lea ahora',
      accion: { tipo: 'pedir', prompt: 'Lee los documentos que hay esperando, guarda lo que aprendas donde toque y cuéntame en dos líneas qué has sacado.' },
    });
  }

  const aMedias = conexionesAMedias[0];
  if (aMedias) {
    lista.push({
      id: `conexion-${aMedias.id}`,
      texto: aMedias.faltan === 1
        ? `A ${aMedias.etiqueta} le falta una clave por poner.`
        : `A ${aMedias.etiqueta} le faltan ${aMedias.faltan} claves por poner.`,
      boton: 'Terminar de conectarla',
      accion: { tipo: 'verConexion', proveedor: aMedias.id },
    });
  }

  // Lo que el propio asistente apuntó después de trabajar: `skill-scout` deja
  // en `.rsc/automation-gaps.md` un veredicto por tarea, y los que empiezan por
  // `proposed-` son ideas que nadie ha mirado. Se escribían y no se leían.
  if (huecosDeAutomatizacion > 0) {
    lista.push({
      id: 'huecos-de-automatizacion',
      texto: huecosDeAutomatizacion === 1
        ? 'El asistente apuntó 1 idea de automatización después de trabajar.'
        : `El asistente apuntó ${huecosDeAutomatizacion} ideas de automatización después de trabajar.`,
      boton: 'Ver cuáles',
      accion: { tipo: 'pedir', prompt: 'Léeme las ideas de automatización que apuntaste después de trabajar, en tu registro de huecos de automatización. Dime en dos líneas cada una que siga pendiente, qué me ahorraría, y pregúntame cuál quieres que monte antes de tocar nada.' },
    });
  }

  if (diasSinCopia !== null && diasSinCopia >= 5 && cambiosSinGuardar > 0) {
    lista.push({
      id: 'sin-copia',
      texto: `Llevas ${diasSinCopia} días sin guardar una copia, y desde entonces han cambiado cosas.`,
      boton: 'Guardar una copia ahora',
      accion: { tipo: 'guardarCopia' },
    });
  }

  const repetida = loQueRepite(peticiones);
  if (repetida) {
    lista.push({
      id: `repetida-${pelar(repetida.muestra).slice(0, 40)}`,
      texto: `Esto ya se lo has pedido ${repetida.veces} veces: «${repetida.muestra.slice(0, 70)}».`,
      boton: 'Que se quede como botón',
      // Los raíles ya le dicen al asistente cómo crear un botón (la habilidad
      // executive-lab). Aquí solo se le da el empujón, y el vigía hace que
      // aparezca solo, sin cerrar nada.
      accion: {
        tipo: 'pedir',
        prompt: `Esta tarea la repito a menudo: "${repetida.muestra}". Déjala como botón fijo en mi barra, con un nombre corto que yo entienda.`,
      },
    });
  }

  const [puede] = loQuePodriaAprender({ corpus, yaInstaladas, catalogo });
  if (puede) {
    lista.push({
      id: `capacidad-${puede.id}`,
      // La habilidad se nombra por su nombre —«Facturación»— y no por una
      // frase sobre lo que sabría hacer. Lo que hace va detrás.
      texto: `Hay una habilidad (skill) que pega con esto: ${puede.nombre}. ${puede.frase}`,
      boton: 'Añadirla',
      accion: { tipo: 'aprenderCapacidad', capacidad: puede.id, nombre: puede.nombre },
      porQue: puede.porQue,
    });
  }

  if (huecos.length) {
    lista.push({
      id: `hueco-${pelar(huecos[0]).slice(0, 40)}`,
      texto: `Le falta saber esto: ${huecos[0]}`,
      boton: 'Contárselo',
      accion: { tipo: 'pedir', prompt: `Quiero contarte lo que te falta saber: ${huecos[0]}. Pregúntame lo que necesites y guárdalo.` },
    });
  }

  // Lo que se apartó hace menos de dos semanas no vuelve a salir.
  return lista.filter((c) => !silenciados[c.id] || ahora - silenciados[c.id] > 14 * DIAS);
}

// El que toca enseñar, que es como mucho uno.
const elQueToca = (contexto) => consejos(contexto)[0] || null;

module.exports = {
  consejos, elQueToca, loQuePodriaAprender, loQueRepite, seParecen, capacidades, huecosDeAutomatizacion,
};
