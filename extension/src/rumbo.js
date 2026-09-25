// Qué hay que hacer en esta carpeta, dado lo que se ha encontrado en ella.
//
// ── Por qué esto es una función pura ─────────────────────────────────────
//
// Es la única pieza del arranque que se puede probar de verdad. Entra un parte
// de `terreno.reconocer()`, sale un plan: qué rama, qué hay que preguntar y qué
// pasos hay que dar. **No toca disco, no lanza procesos, no pregunta nada.**
// Así se pueden probar las nueve ramas con partes inventados, en milisegundos,
// sin montar un arnés de verdad.
//
// Antes esto estaba mezclado dentro de `arrancar()`, en línea recta, y por eso
// había cuatro callejones: la decisión de qué hacer se tomaba a la vez que se
// hacía, y no se podía mirar sin ejecutarla.
//
// ── Lo que no se vuelve a preguntar ──────────────────────────────────────
//
// `porQue` es para el canal de salida y para el informe de incidencia: lo lee
// quien arregla, no quien usa la barra. Lo que se le dice al alumno lo escribe
// la pantalla, con las palabras del diccionario.
//
// `preguntar` se calcula RESTANDO lo que el recibo de RSC ya contesta. Cuando
// hay arnés, `.rsc.json → onboarding.plan.record` guarda seis de las nueve
// respuestas —todas las que se le mandan a RSC—, y se volvían a preguntar
// igual. Un clon tiene que preguntar una —los nombres, si no están—, no nueve.

// Lo que RSC acepta en cada campo. Un valor fuera de estos conjuntos hace que
// rechace los flags, así que lo que no valide se vuelve a preguntar en vez de
// arrastrar un arnés roto.
//
// La prueba de contrato (`prueba/contrato.js`) compara estos conjuntos con los
// del paquete de RSC. Aquí estuvo un cuarto tamaño que RSC no acepta, y quien
// elegía «Va para largo» no llegaba a tener arnés.
const VALORES = {
  nivel: ['non-technical', 'mixed', 'technical'],
  dial: ['L0', 'L1', 'L2', 'L3'],
  deQueVa: ['software', 'operations', 'research', 'content', 'mixed'],
  tamano: ['small', 'growing', 'complex'],
};

// Los tipos de proyecto para los que RSC exige el tamaño del software: los que
// son construir algo, del todo o en parte (`normalizeOnboarding`, `needsScope`).
// Solo se preguntaba con `software`, y «Un poco de todo» no montaba nunca.
const CON_TAMANO = ['software', 'mixed'];

// Las preguntas, y de dónde sale ya contestada cada una.
//
// `alcance` y `personas` no las pide RSC: qué lleva la carpeta y cuánta gente
// hay detrás van al perfil, al nombre que se sugiere y al primer mensaje. Por
// eso solo se preguntan al montar de cero (`soloAlMontar`): un clon o un
// montaje a medias no las vuelven a pedir.
//
// `queConstruir` es el tamaño que se le manda a RSC, preguntado por lo que se
// va a construir y no por «grande o pequeño», que para quien empieza es difícil
// de decidir (C-21, decisión de Jose del 25-09-2026).
const PREGUNTAS = [
  { id: 'asistente', delRecibo: (r) => (r.targets || [])[0] },
  { id: 'deQueVa', delRecibo: (r) => r.projectKind, valores: VALORES.deQueVa },
  { id: 'alcance', soloAlMontar: true },
  { id: 'personas', soloAlMontar: true },
  {
    id: 'queConstruir',
    delRecibo: (r) => r.softwareScope,
    valores: VALORES.tamano,
    soloSi: (resp) => CON_TAMANO.includes(resp.deQueVa),
  },
  { id: 'objetivo', delRecibo: (r) => r.goal },
  { id: 'nivel', delRecibo: (r) => r.technicalLevel, valores: VALORES.nivel },
  { id: 'dial', delRecibo: (r) => r.accompaniment, valores: VALORES.dial },
];

const vale = (pregunta, valor) => typeof valor === 'string' && valor.trim()
  && (!pregunta.valores || pregunta.valores.includes(valor));

// Qué queda por preguntar. `nombres` va aparte porque no sale del recibo sino
// del perfil, que lo escribe la barra.
function loQueFaltaPorPreguntar(parte) {
  const record = parte.recibo ? parte.recibo.record : null;
  if (!record) return [...PREGUNTAS.map((p) => p.id), 'nombres'];

  const sabidas = {};
  const faltan = [];
  for (const pregunta of PREGUNTAS) {
    if (pregunta.soloAlMontar) continue;
    const valor = pregunta.delRecibo(record);
    if (vale(pregunta, valor)) sabidas[pregunta.id] = valor;
    else faltan.push(pregunta.id);
  }

  // Lo que solo se pregunta en ciertos casos, y el caso no se da. Si el tipo
  // de proyecto también está por preguntar, se decide al contestarlo.
  const filtradas = faltan.filter((id) => {
    const pregunta = PREGUNTAS.find((p) => p.id === id);
    return !pregunta.soloSi || !('deQueVa' in sabidas) || pregunta.soloSi(sabidas);
  });

  if (!parte.railes || !parte.railes.nombres) filtradas.push('nombres');
  return filtradas;
}

// Los pasos que sabe dar el arranque. Catálogo cerrado: quien los ejecuta es
// `arrancar.js`, y si aquí aparece uno que allí no existe, la prueba lo caza.
//
// `escribe` dice si ese paso toca el disco. Sirve para poder afirmar en una
// prueba que una rama no escribe nada, que es lo que hace segura la de «ya
// estaba».
const PASOS = {
  ponerGit: { etiqueta: 'preparando dónde guardar las copias', escribe: true },
  montarElArnes: { etiqueta: 'montando el arnés, esto tarda unos minutos', escribe: true },
  traerLasHabilidades: { etiqueta: 'trayendo lo que este proyecto ya tenía', escribe: true },
  arreglarLoRoto: { etiqueta: 'arreglando lo que se quedó a medias', escribe: true },
  ponerLosRailes: { etiqueta: 'poniendo los raíles', escribe: true },
  ponerLosNombres: { etiqueta: 'guardando los nombres', escribe: true },
  apuntarLosEnganches: { etiqueta: 'dejando listo lo que el arnés hace solo', escribe: true },
  puntoDePartida: { etiqueta: 'guardando el punto de partida', escribe: true },
  ordenarLasClaves: { etiqueta: 'ordenando las claves que ya tenías', escribe: false },
  ordenarLaCarpeta: { etiqueta: 'poniendo en orden lo que ya hay', escribe: false },
};

const pasos = (...ids) => ids.filter(Boolean).map((id) => ({ id, ...PASOS[id] }));

// La cola común: lo nuestro, que va después de lo que haga RSC.
const loNuestro = ['ponerLosRailes', 'ponerLosNombres', 'apuntarLosEnganches'];

// Lo nuestro puesto o no. Un arnés puede estar entero para RSC y no tener nada
// de la barra: son dos capas distintas.
const faltanLosRailes = (parte) => !parte.railes || !parte.railes.habilidadPropia || !parte.railes.nombres;

// Los encargos que solo tienen sentido sobre una carpeta que ya era de alguien.
const loQueHayQueOrdenar = (parte) => [
  parte.claves ? 'ordenarLasClaves' : null,
  parte.carpeta.cuantos > 0 ? 'ordenarLaCarpeta' : null,
];

// Lo que no se puede hacer sin git, y que se quita del plan cuando alguien
// eligió seguir sin copias.
const CON_GIT = ['ponerGit', 'puntoDePartida'];

// Las carpetas de alguien: en ellas el sí se pide dentro del montaje (B4), y
// antes de ese sí no se escribe nada.
const DE_ALGUIEN = ['empezada', 'otroArnes'];

function elegirRama(parte) {
  const plan = laRama(parte);
  if (parte.git && !parte.git.hay && parte.git.sigueSinCopias) {
    return { ...plan, pasos: plan.pasos.filter((p) => !CON_GIT.includes(p.id)) };
  }
  // Toda rama que monta sobre una carpeta sin historial la deja con él (B7):
  // solo las dos de siempre lo ponían. El punto de partida, no: ese solo va en
  // una carpeta vacía (decisión 28).
  //
  // En una carpeta de alguien va detrás del montaje, que es donde se pide el sí:
  // delante, el `git init` y la marca de que el historial es de la barra
  // quedaban puestos aunque dijera que no (revisión de F2, I1).
  const escribe = plan.pasos.some((p) => p.escribe);
  const sinHistorial = parte.git && parte.git.repositorio === false;
  if (escribe && sinHistorial && !plan.pasos.some((p) => p.id === 'ponerGit')) {
    const detras = DE_ALGUIEN.includes(parte.estado) ? plan.pasos.findIndex((p) => p.id === 'montarElArnes') + 1 : 0;
    return { ...plan, pasos: [...plan.pasos.slice(0, detras), ...pasos('ponerGit'), ...plan.pasos.slice(detras)] };
  }
  return plan;
}

function laRama(parte) {
  const preguntar = loQueFaltaPorPreguntar(parte);

  // Sin carpeta no hay nada que decidir.
  if (parte.estado === 'sinCarpeta') {
    return { rama: 'sinCarpeta', preguntar: [], pasos: [], porQue: 'no hay ninguna carpeta abierta' };
  }

  // Un `.rsc.json` que no se puede leer no se pisa. Es un fichero comiteado y
  // esto suele ser un conflicto de merge: montar encima borraría el arnés que
  // esa persona ya tenía.
  if (parte.estado === 'reciboRoto') {
    return { rama: 'reciboRoto', preguntar: [], pasos: [], porQue: 'el .rsc.json de esta carpeta no se puede leer' }; // diccionario: interno
  }

  // La carpeta personal, la raíz del disco y las del sistema no se preparan
  // (B1): se explica y se ofrece una carpeta dentro de la personal. Solo cuando
  // aquí no hay nada montado todavía: una que se montó antes de esta guarda
  // sigue funcionando, y lo suyo no se toca. Un montaje a medias sin su
  // `.rsc.json` tampoco está declarado: completarlo es prepararla (revisión de
  // F2, C1).
  const sinDeclarar = ['vacia', 'empezada', 'otroArnes'].includes(parte.estado)
    || (parte.estado === 'aMedias' && parte.declarada === 'no');
  if (parte.carpeta && parte.carpeta.prohibida && sinDeclarar) {
    return { rama: 'noSePrepara', preguntar: [], pasos: [], porQue: `esta carpeta no se prepara: ${parte.carpeta.prohibida}` };
  }

  // Portón previo a todo lo que escriba: sin git no hay copias de seguridad, y
  // eso se decide antes de preguntar seis cosas más. Si ya eligió seguir sin
  // copias, no se le vuelve a preguntar (B3): se monta sin ellas, y la lista
  // de lo que falta ofrece ponerlas.
  if (!parte.git.hay && !parte.git.sigueSinCopias) {
    return { rama: 'sinGit', preguntar: [], pasos: pasos('ponerGit'), porQue: 'falta git en este ordenador' };
  }

  // Ya estaba. Dos casos, y la diferencia importa: RSC puede estar entero y
  // faltar lo NUESTRO —la habilidad que fija el español y el vocabulario, y los
  // dos nombres del perfil—, que es lo que pasa en un arnés montado por otra
  // vía o traído de otro ordenador.
  //
  // Jose: *«si ya está RSC, la idea es adaptarlo y luego ya preguntar lo que
  // falte»*. Adaptar es exactamente esto: poner lo nuestro encima, sin tocar
  // una línea de lo suyo.
  if (parte.estado === 'conArnes') {
    // Montado con un arnés más viejo que el que trae la barra. `sync`
    // reconstruye desde el plan que esa persona ya aceptó, así que no hay nada
    // que volver a preguntar ni ninguna decisión que tomar por ella.
    if (parte.versionAtrasada) {
      return {
        rama: 'ponerAlDia',
        preguntar: [],
        pasos: pasos('traerLasHabilidades', 'arreglarLoRoto', ...loNuestro),
        porQue: 'la carpeta declara un catálogo más viejo que el que trae la barra',
      };
    }
    if (faltanLosRailes(parte)) {
      return {
        rama: 'adoptar',
        preguntar: parte.railes.nombres ? [] : ['nombres'],
        pasos: pasos(...loNuestro),
        porQue: 'el arnés está entero pero le faltan los raíles de la barra',
      };
    }
    return { rama: 'yaEstaba', preguntar: [], pasos: [], porQue: 'el arnés ya está montado y entero' };
  }

  // Aquí había otro montaje. No se decide por esa persona: se le enseña lo que
  // tiene y se le pregunta. La rama solo dice que hay que preguntarlo.
  if (parte.estado === 'otroArnes') {
    return {
      rama: 'otroArnes',
      preguntar: ['permiso', ...preguntar],
      pasos: pasos('montarElArnes', ...loNuestro, ...loQueHayQueOrdenar(parte)),
      porQue: 'esta carpeta ya tiene un montaje de asistente hecho a mano',
    };
  }

  // Lo declarado no está en esta máquina: se trae, no se vuelve a montar.
  if (parte.estado === 'clonado') {
    return {
      rama: 'traer',
      preguntar,
      pasos: pasos('traerLasHabilidades', 'arreglarLoRoto', ...loNuestro),
      porQue: 'este proyecto declara un arnés que no está montado en este ordenador',
    };
  }

  // Falta suelo. Los flags salen del recibo, y solo se pregunta lo que en el
  // recibo no vale: preguntar nada con un valor que RSC no acepta era mandarlo
  // igual y no montar. Los nombres, no: se quedan los del perfil.
  if (parte.estado === 'aMedias') {
    return {
      rama: 'completar',
      preguntar: parte.recibo ? preguntar.filter((id) => id !== 'nombres') : preguntar,
      pasos: pasos('montarElArnes', ...loNuestro),
      porQue: `falta parte del suelo: ${parte.suelo.faltan.join(', ')}`,
    };
  }

  // Hay arnés pero nadie firmó un plan. Se trae lo declarado y se ponen los
  // raíles; ponerle plan es otra cosa y se ofrece aparte.
  if (parte.estado === 'sinRecibo') {
    return {
      rama: 'sinRecibo',
      preguntar: [],
      pasos: pasos('traerLasHabilidades', 'arreglarLoRoto', ...loNuestro),
      porQue: 'hay arnés pero nadie aceptó un plan',
    };
  }

  // Carpeta de alguien: se monta encima sin tocar nada de lo suyo, y **sin**
  // escribir en su historial.
  if (parte.estado === 'empezada') {
    return {
      rama: 'encimaDeLoQueHay',
      preguntar,
      pasos: pasos('montarElArnes', 'ponerGit', ...loNuestro, ...loQueHayQueOrdenar(parte)),
      porQue: 'hay trabajo de alguien y no se toca',
    };
  }

  // Carpeta vacía: el camino de siempre, y el único que deja punto de partida.
  return {
    rama: 'desdeCero',
    preguntar,
    pasos: pasos('ponerGit', 'montarElArnes', ...loNuestro, 'puntoDePartida'),
    porQue: 'la carpeta está vacía',
  };
}

module.exports = { elegirRama, loQueFaltaPorPreguntar, PASOS, PREGUNTAS, VALORES, CON_TAMANO };
