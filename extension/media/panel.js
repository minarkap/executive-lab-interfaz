// La interfaz de la barra lateral.
//
// Sin frameworks a propósito: son unas pocas pantallas y tienen que seguir
// funcionando dentro de cinco años sin que nadie actualice nada.

const vscode = acquireVsCodeApi();
const app = document.getElementById('app');

let estado = null;
let accionesDescubiertas = [];
// Si el asistente de esta carpeta llega a tener botones: Codex no tiene.
let puedeTenerBotones = true;
// Los cuatro datos de hoy, en una línea. Vacío si no hay nada que contar.
let pulso = [];
// Qué herramientas tiene abiertas en el acordeón. Vive aquí y no en el estado
// del arnés porque es de esta persona y de este rato: el vigía repinta la
// pantalla cada vez que el asistente toca un fichero, y sin esto se le cerraría
// el acordeón en las narices a media lectura.
const abiertas = new Set();
let modo = 'sencillo';
let marcaPuesta = true;
let comoSeLlama = 'tu trabajo';
let aviso = null;
// Lo último que se buscó: desde un artículo abierto desde el buscador, el
// "Volver" tiene que devolver a los resultados, no a la lista de temas.
let ultimaBusqueda = '';
// En cuál de los dos buscadores se escribió lo último, para volver al suyo.
let ultimoBuscado = 'conceptos';
// Lo último que se pintó, para saber si un repintado es de la misma pantalla.
let ultimoPintado = '';

const pedir = (tipo, extra = {}) => vscode.postMessage({ tipo, ...extra });

// Dónde cae lo que se arrastra encima: la bandeja de documentos, salvo cuando
// se está mirando la cara de la empresa, que va a su carpeta.
let dondeCaeLoQueSueltas = 'documentos';

// -------------------------------------------------- soltar documentos encima
//
// El editor NO le da a la barra la ruta de lo que se suelta, y hace bien: eso
// sería dejarle leer cualquier cosa del disco. Pero sí deja leer el contenido
// de lo que esa persona ha soltado a propósito, que es justo lo que hace falta.
// Así que el fichero viaja leído y la extensión solo escribe.
//
// Límite por fichero: un documento de trabajo no ocupa 40 MB, y si los ocupa,
// mejor el botón de siempre que atascar el canal de mensajes.
const LIMITE = 40 * 1024 * 1024;

function leer(fichero) {
  return new Promise((resolver) => {
    if (fichero.size > LIMITE) return resolver(null);
    const lector = new FileReader();
    lector.onerror = () => resolver(null);
    lector.onload = () => {
      // El resultado viene como "data:<tipo>;base64,<datos>".
      const coma = String(lector.result).indexOf(',');
      resolver(coma === -1 ? null : { nombre: fichero.name, datos: String(lector.result).slice(coma + 1) });
    };
    lector.readAsDataURL(fichero);
    return undefined;
  });
}

// Abrir o cerrar una herramienta se recuerda mientras dure esta sesión, para
// que un repintado del vigía no la cierre a media lectura.
document.addEventListener('toggle', (e) => {
  const quien = e.target && e.target.dataset ? e.target.dataset.abrir : null;
  if (!quien) return;
  if (e.target.open) abiertas.add(quien);
  else abiertas.delete(quien);
}, true);

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  document.body.classList.add('soltando');
});
document.addEventListener('dragleave', (e) => {
  if (e.relatedTarget) return;
  document.body.classList.remove('soltando');
});
document.addEventListener('drop', async (e) => {
  e.preventDefault();
  document.body.classList.remove('soltando');

  const sueltos = [...(e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : [])];
  if (!sueltos.length) return;

  const leidos = (await Promise.all(sueltos.map(leer))).filter(Boolean);
  if (!leidos.length) {
    pedir('soltarDocumentos', { ficheros: [], para: dondeCaeLoQueSueltas });
    return;
  }
  pedir('soltarDocumentos', { ficheros: leidos, para: dondeCaeLoQueSueltas });
});

// Todo lo que venga de fuera se escapa antes de pintarse. `texto` vale para el
// contenido; `atributo` escapa además las comillas, porque ahí sí rompen.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapar(valor, patron) {
  return valor == null ? '' : String(valor).replace(patron, (c) => ESCAPES[c]);
}

const texto = (valor) => escapar(valor, /[&<>]/g);
const atributo = (valor) => escapar(valor, /[&<>"']/g);

function boton({ etiqueta, icono = '', accion, principal = false, discreto = false, pequeno = false, soloIcono = false }) {
  const clases = [principal ? 'principal' : '', discreto ? 'discreto' : '', pequeno ? 'pequeno' : '', soloIcono ? 'solo-icono' : ''].filter(Boolean).join(' ');

  // Un botón que es solo un dibujo sigue teniendo que decir su nombre: al
  // pasar por encima y para quien lo oye en vez de verlo. Un cuadrito mudo no
  // es un botón, es un acertijo.
  if (soloIcono) {
    return `<button class="${clases}" title="${atributo(etiqueta)}" aria-label="${atributo(etiqueta)}"
      data-accion="${atributo(JSON.stringify(accion))}"><span class="icono" aria-hidden="true">${icono}</span></button>`;
  }

  return `<button class="${clases}" data-accion="${atributo(JSON.stringify(accion))}">
    ${icono ? `<span class="icono" aria-hidden="true">${icono}</span>` : ''}
    <span class="texto">${texto(etiqueta)}</span>
  </button>`;
}

// Un grupo plegable de la pantalla principal.
//
// ── Por qué ──────────────────────────────────────────────────────────────
//
// Esta pantalla empezó con seis botones. Con doce y cuatro rótulos sueltos ya
// no se leía: todo pesaba lo mismo, así que para encontrar lo de siempre había
// que repasarlo todo. Lo de diario —lo que el asistente ha creado y lo que se
// mira de un vistazo— se queda arriba y a la vista; lo demás baja a cinco
// filas plegadas que se abren cuando hacen falta.
//
// No se esconde nada: cada fila dice qué guarda y cuánto hay dentro, y lo que
// se abre se queda abierto mientras dure la sesión (el vigía repinta la
// pantalla cada vez que el asistente toca un fichero).
function grupo({ id, etiqueta, cuantos = '', dentro, abiertoDeEntrada = false }) {
  if (!dentro) return '';
  const abierto = abiertas.has(id) || (abiertoDeEntrada && !abiertas.size);
  return `
    <details class="acordeon grupo" data-abrir="${atributo(id)}"${abierto ? ' open' : ''}>
      <summary>${texto(etiqueta)}${cuantos ? `<span class="cuantos">${texto(cuantos)}</span>` : ''}</summary>
      ${dentro}
    </details>`;
}

// Un aviso, y —si el aviso manda a "Algo va mal"— el botón que lo abre.
//
// Estaba roto de la forma más tonta: el aviso de un arranque fallido decía
// «Pulsa "Algo va mal"» en una pantalla que no tiene ese botón, porque vive
// dentro de Ayuda y Ayuda solo sale cuando ya hay arnés. O sea, justo cuando
// más falta hace, no estaba. Ahora lo trae el propio aviso: quien lo nombra,
// lo ofrece, esté en la pantalla que esté.
function bloqueAviso(cual = aviso) {
  if (!cual) return '';
  const manda = cual.malo && /Algo va mal/.test(cual.texto || '');
  return `<div class="aviso ${cual.malo ? 'malo' : ''}">${texto(cual.texto)}</div>`
    + (manda ? boton({ etiqueta: 'Algo va mal', icono: '🆘', accion: { tipo: 'algoVaMal' } }) : '');
}

// Arriba, y pequeño. Arriba porque en una barra estrecha el final de la
// pantalla está a dos pantallazos, y salir de un sitio no puede costar más que
// entrar. Pequeño porque justo debajo va el rótulo que dice dónde estás, y dos
// cosas grandes seguidas compiten entre ellas.
const volver = (accion = { tipo: 'volver' }) => boton({ etiqueta: 'Volver', icono: '←', pequeno: true, accion });

// --------------------------------------------------- leer un artículo

// Un markdown mínimo, para enseñar los artículos de la wiki dentro del panel.
// Se escapa todo primero y después se aplican los patrones, así que nada de lo
// que haya escrito el asistente puede convertirse en etiquetas.
//
// No es un analizador completo a propósito: cubre lo que hay en un artículo de
// la wiki —títulos, párrafos, listas, tablas, citas, negrita y enlaces— y nada
// más. Una biblioteca entera para esto sería una dependencia que mantener.
// Los enlaces del artículo que se está leyendo y que llevan a otro documento
// de verdad. Los resuelve la extensión (cerebro.enlacesDe), que es quien puede
// mirar el disco; aquí solo se pintan.
let enlacesDelArticulo = {};

function enLinea(t) {
  return texto(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    // Los de fuera se abren fuera; los de dentro navegan por dentro, y los que
    // no llevan a ningún sitio se quedan en texto: mejor eso que un clic roto.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, rotulo, destino) => {
      if (/^https?:/.test(destino)) return `<a href="${atributo(destino)}">${rotulo}</a>`;
      const dentro = enlacesDelArticulo[destino];
      return dentro
        ? `<a class="enlace-interno vivo" data-accion="${atributo(JSON.stringify({ tipo: 'leerArticulo', ruta: dentro }))}">${rotulo}</a>`
        : `<span class="enlace-interno">${rotulo}</span>`;
    });
}

function comoMarkdown(fuente, enlaces = {}) {
  enlacesDelArticulo = enlaces || {};
  const salida = [];
  let lista = null;
  let tabla = null;

  const cerrarLista = () => { if (lista) { salida.push(`</${lista}>`); lista = null; } };
  const cerrarTabla = () => { if (tabla) { salida.push('</tbody></table>'); tabla = null; } };
  const cerrar = () => { cerrarLista(); cerrarTabla(); };

  for (const cruda of String(fuente).split('\n')) {
    const linea = cruda.trimEnd();

    if (!linea.trim()) { cerrar(); continue; }

    const titulo = linea.match(/^(#{1,4})\s+(.*)$/);
    if (titulo) { cerrar(); salida.push(`<h${titulo[1].length + 2}>${enLinea(titulo[2])}</h${titulo[1].length + 2}>`); continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(linea.trim())) { cerrar(); salida.push('<hr class="separador">'); continue; }

    // Tablas: la fila de guiones se traga, las demás son filas.
    if (/^\s*\|/.test(linea)) {
      const celdas = linea.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (celdas.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!tabla) { cerrarLista(); salida.push('<table><tbody>'); tabla = true; }
      salida.push(`<tr>${celdas.map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`);
      continue;
    }
    cerrarTabla();

    const cita = linea.match(/^>\s?(.*)$/);
    if (cita) { cerrarLista(); salida.push(`<blockquote>${enLinea(cita[1])}</blockquote>`); continue; }

    const punto = linea.match(/^\s*[-*]\s+(.*)$/);
    const numero = linea.match(/^\s*\d+[.)]\s+(.*)$/);
    if (punto || numero) {
      const quiere = punto ? 'ul' : 'ol';
      if (lista !== quiere) { cerrarLista(); salida.push(`<${quiere}>`); lista = quiere; }
      salida.push(`<li>${enLinea((punto || numero)[1])}</li>`);
      continue;
    }
    cerrarLista();

    salida.push(`<p>${enLinea(linea.trim())}</p>`);
  }

  cerrar();
  return salida.join('\n');
}
const nada = (frase) => `<p class="cargando">${texto(frase)}</p>`;

// La fecha de una entrada del historial, en palabras y por días de calendario.
function cuando(iso) {
  const entonces = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(entonces.getTime())) return '';
  const dia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((dia(new Date()) - dia(entonces)) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' }).format(entonces);
}
const plural = (n, uno, varios) => (n === 1 ? uno : varios.replace('{n}', n));

// El rastro de por dónde se ha llegado, con cada tramo clicable menos el
// último. Antes cada pantalla tenía su "Volver" escrito a mano y desde un
// artículo no había forma de saber en qué tema estabas.
function migas(tramos) {
  const utiles = tramos.filter(Boolean);
  if (utiles.length < 2) return '';
  return `<nav class="migas">${utiles.map((tramo, i) => (
    i === utiles.length - 1
      ? `<span class="aqui">${texto(tramo.etiqueta)}</span>`
      : `<a data-accion="${atributo(JSON.stringify(tramo.accion))}">${texto(tramo.etiqueta)}</a><span class="separa">›</span>`
  )).join('')}</nav>`;
}

// Buscar es mirar: lo resuelve la barra sin abrir una conversación.
// Dos buscadores, cada uno en su sitio y con su nombre.
//
// Yo defendía uno solo con los resultados agrupados. Jose decidió dos, con su
// argumento: **que se sepa por el nombre qué va a salir**. Buscar un contrato
// firmado y buscar cómo se factura aquí son dos preguntas distintas, y
// mezclar las respuestas obliga a leerlas todas para descartar.
const BUSCADORES = {
  papeles: {
    rotulo: 'Buscar un documento',
    pista: 'Por su nombre: un contrato, una factura, un albarán…',
    vacio: { tipo: 'verPapeles' },
  },
  conceptos: {
    rotulo: 'Buscar un concepto',
    pista: 'Un cliente, una norma, cómo se hace algo aquí…',
    vacio: { tipo: 'verCerebro' },
  },
};

function cajaDeBusqueda(donde, valor = '') {
  const cual = BUSCADORES[donde] || BUSCADORES.conceptos;
  return `
    <h2>${texto(cual.rotulo)}</h2>
    <input class="buscar" type="search" data-buscar data-donde="${atributo(donde)}" value="${atributo(valor)}"
      placeholder="${atributo(cual.pista)}"
      aria-label="${atributo(cual.rotulo)}">`;
}

// ---------------------------------------------------- llevarte un archivo

// Lo que el asistente ha producido, sacado del `out/` que RSC define en cada
// herramienta. Dos formas de llevárselo y ninguna enseña una ruta: abrirlo con
// el programa de siempre, o guardarlo donde esa persona diga.
function pantallaSalidas(datos) {
  const herramientas = datos.herramientas || [];

  // El nombre manda, y las dos acciones son dos dibujos a la derecha: son
  // siempre las mismas para todos los ficheros, así que escribirlas enteras
  // una y otra vez solo quita sitio al nombre, que es lo único que cambia.
  const archivo = (h, a) => `
    <div class="archivo">
      <div class="archivo-que">
        <p class="nombre">${texto(a.fichero)}</p>
        <p class="pista">${texto(a.tamano)} · ${texto(cuando(a.cuando.slice(0, 10)))}</p>
      </div>
      <div class="archivo-acciones">
        ${boton({ etiqueta: `Abrir ${a.fichero}`, icono: '👁', pequeno: true, soloIcono: true, accion: { tipo: 'abrirSalida', herramienta: h.id, fichero: a.fichero } })}
        ${boton({ etiqueta: `Guardar ${a.fichero} donde yo diga`, icono: '⬇', pequeno: true, soloIcono: true, accion: { tipo: 'guardarSalida', herramienta: h.id, fichero: a.fichero } })}
      </div>
    </div>`;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Lo que ha hecho' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Lo que ha hecho</h2>
      <p class="hiciste">Lo que ha ido preparando para ti. Ábrelo para verlo, o guárdatelo donde quieras.</p>
    </div>

    ${herramientas.length ? herramientas.map((h) => `
      <details class="acordeon" data-abrir="salida:${atributo(h.id)}"${abiertas.has(`salida:${h.id}`) ? ' open' : ''}>
        <summary>${texto(h.etiqueta)} <span class="cuantos">${h.cuantos}</span></summary>
        ${h.archivos.map((a) => archivo(h, a)).join('')}
        ${h.hayMas ? boton({ etiqueta: plural(h.hayMas, 'Ver el que falta', 'Ver los {n} que faltan'), icono: '📂', discreto: true, pequeno: true, accion: { tipo: 'abrirCarpetaDeSalida', herramienta: h.id } }) : ''}
      </details>`).join('')
      : nada('Todavía no ha preparado nada para llevarse.')}

  `;
}

// ------------------------------------------------------ qué sabe hacer

// Lo que ya sabe y lo que podría aprender. La fontanería del arnés —orient,
// suggest, harness, init— no se lista: es de la máquina, no de quien lo usa, y
// se resume en una línea.
function pantallaSaberes(datos) {
  const sabe = datos.sabe || [];
  const otras = datos.otras || [];
  const puede = datos.puedeAprender || [];

  const capacidad = (c, conBoton) => `
    <div class="capacidad">
      <p class="nombre">${texto(c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1))}</p>
      <p class="pista">${texto(c.frase)}</p>
      ${conBoton ? boton({ etiqueta: 'Que lo aprenda', icono: '✨', accion: { tipo: 'aprenderCapacidad', capacidad: c.id, nombre: c.nombre } }) : ''}
    </div>`;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Habilidades (skills)' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Habilidades (skills)</h2>
      <p class="hiciste">Pídele cualquiera de estas con tus palabras. Y lo que no sepa todavía, puede aprenderlo aquí mismo.</p>
    </div>

    ${datos.suyas && datos.suyas.length ? `
      <h2>Las tuyas</h2>
      <p class="detalle">Escritas para esta carpeta, no vienen de ningún catálogo.</p>
      ${datos.suyas.map((c) => capacidad(c, false)).join('')}
      <hr class="separador">` : ''}

    ${/* "Ya sabe: todavía nada de esta lista" no le dice nada a nadie, y contar
          la fontanería del arnés menos todavía. Si no hay nada que enseñar en
          un montón, ese montón no sale. */''}
    ${sabe.length ? `<h2>Ya sabe</h2>${sabe.map((c) => capacidad(c, false)).join('')}` : ''}
    ${otras.length ? `
      <h2>Puestas por el camino</h2>
      ${otras.map((c) => capacidad(c, false)).join('')}` : ''}

    <hr class="separador">

    ${/* No todo sale de un catálogo. Lo que hace falta en una carpeta depende de
          para qué dijo esa persona que era, o —si ya venía con trabajo hecho— de
          lo que haya dentro. Eso no lo sabemos nosotros: lo sabe el asistente
          leyendo su perfil y su carpeta. */''}
    <h2>Hazle una a medida</h2>
    <p class="detalle">Si lo que necesitas no está en la lista, se le puede enseñar desde cero.</p>
    ${boton({
      etiqueta: 'Proponme habilidades para lo mío',
      icono: '🧠',
      principal: true,
      accion: {
        tipo: 'pedir',
        prompt: [
          'Mira para qué dije que era esta carpeta y lo que ya hay dentro, y proponme tres habilidades nuevas que me vendrían bien y que no existan ya.',
          '',
          'De cada una dime: cómo se llamaría en cristiano, qué me ahorraría, y con un ejemplo de algo concreto que yo le pediría.',
          'No me propongas cosas genéricas: tienen que salir de lo que hay en esta carpeta.',
          'Cuando elija una, escríbela y déjala puesta.',
        ].join('\n'),
      },
    })}
    ${boton({
      etiqueta: 'Quiero enseñarle algo concreto',
      icono: '✏️',
      accion: { tipo: 'pedir', prompt: 'Quiero enseñarle a hacer algo que hago yo y que todavía no sabe. Pregúntame qué es, cómo lo hago paso a paso y qué tiene que salir al final, y déjalo escrito como habilidad suya.' },
    })}

    <hr class="separador">

    <h2>Puede aprender</h2>
    ${puede.length
      ? puede.map((c) => capacidad(c, true)).join('')
      : nada('Ya sabe todo lo que tenemos.')}

  `;
}

// ------------------------------------------------------------- las reglas

// Lo que el asistente tiene que respetar siempre. Son tres sitios de RSC y
// ninguno se veía: la constitución (los innegociables, que el arnés pone en su
// mapa bajo "léete esto siempre"), y las reglas de la casa del CLAUDE.md y del
// AGENTS.md.
function pantallaReglas({ innegociables = [], deLaCasa = [], hay = {}, cual = 'claude' }) {
  const lista = (reglas, vacio, comoQuitar) => (reglas.length
    ? reglas.map((r) => `<div class="entrada"><p class="nombre">${enLinea(r)}</p></div>`).join('')
    : nada(vacio));

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Las reglas' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Las reglas</h2>
      <p class="hiciste">Lo que tiene que respetar siempre, pase lo que pase. Se las lee antes de cada cosa que hace.</p>
    </div>

    <h2>Innegociables</h2>
    ${lista(innegociables, 'Todavía no hay ninguno. Son las cosas que no se saltan nunca, pase lo que pase.')}
    ${hay.constitucion ? boton({ etiqueta: 'Verlas enteras', icono: '▸', pequeno: true, discreto: true, accion: { tipo: 'abrirReglas', cual: 'constitucion' } }) : ''}

    <hr class="separador">
    <h2>Cómo se trabaja aquí</h2>
    ${lista(deLaCasa, 'Todavía no hay ninguna.')}
    ${hay[cual] ? boton({ etiqueta: 'Verlas enteras', icono: '▸', pequeno: true, discreto: true, accion: { tipo: 'abrirReglas', cual } }) : ''}

    <hr class="separador">
    ${boton({
      etiqueta: 'Añadir una regla',
      icono: '➕',
      principal: true,
      accion: { tipo: 'pedir', prompt: 'Quiero añadir una regla que tengas que respetar siempre en esta carpeta. Pregúntame cuál es, dime dónde la vas a dejar y por qué ahí, y déjala escrita.' },
    })}
    ${boton({
      etiqueta: 'Decirle qué NO quiero que haga',
      icono: '🚫',
      accion: { tipo: 'pedir', prompt: 'Hay cosas que no quiero que hagas nunca en esta carpeta. Pregúntame cuáles son, una a una, y déjalas escritas donde te las leas siempre.' },
    })}

  `;
}

// ------------------------------------------------------------ en qué estamos

// Lo que RSC escribe cuando se construye algo con SDD: qué se quiere, por qué y
// cómo. Aparece solo si esa carpeta lo tiene — una de contabilidad no lo tendrá
// nunca, y una donde se monte una web, sí.
// ------------------------------------------------- procesos con un clic

// Todos los comandos de esta carpeta. Los que alguien marcó como botón salen
// arriba —son los mismos que se pueden fijar en Acciones rápidas— y detrás los
// que están escritos y nadie ha marcado, y los que trae el arnés.
function pantallaComandos({ comandos = [] }) {
  const fila = (c) => `
    <div class="entrada">
      <p class="nombre">${texto(c.etiqueta)}</p>
      ${c.queHace ? `<p class="pista">${texto(c.queHace)}</p>` : ''}
      ${boton({ etiqueta: 'Hacerlo', icono: c.icono || '▸', pequeno: true, accion: { tipo: 'pedir', prompt: c.prompt } })}
    </div>`;

  const mios = comandos.filter((c) => !c.delArnes);
  const delArnes = comandos.filter((c) => c.delArnes);

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Procesos con un clic' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Procesos con un clic</h2>
      <p class="hiciste">Cosas que haces a menudo, guardadas para pedirlas de una vez.</p>
    </div>

    ${mios.length ? mios.map(fila).join('') : nada('Todavía no hay ninguno. Se van creando conforme repites tareas.')}
    ${boton({
      etiqueta: 'Que se quede uno nuevo',
      icono: '➕',
      accion: { tipo: 'pedir', prompt: 'Quiero que algo que hago a menudo se quede guardado para pedirlo de una vez. Pregúntame cuál es, qué tiene que hacer exactamente, y déjalo montado.' },
    })}

    ${delArnes.length ? `
      <hr class="separador">
      <h2>Los que trae de serie</h2>
      <p class="detalle">No los ha escrito nadie de aquí: vienen con el arnés.</p>
      ${delArnes.map(fila).join('')}` : ''}

    <hr class="separador">
    ${boton({ etiqueta: 'Fijar alguno arriba', icono: '☆', pequeno: true, discreto: true, accion: { tipo: 'verFijadas' } })}
  `;
}

// ------------------------------------------------------------- sugerencias

// Dos mitades, y son distintas a propósito.
//
// **Lo que ve la barra** son hechos que se comprueban leyendo el disco: hay tres
// documentos sin leer desde el martes, a Odoo le falta una clave, llevas nueve
// días sin guardar. Salen al momento y cada uno trae su botón.
//
// **Lo que ve el asistente** es todo lo demás, y no lo podemos calcular
// nosotros: si lo que repites debería ser un botón, si te vendría bien una
// habilidad que no tienes, si algo que haces cada semana lo podría llevar un
// ayudante, si lo que quieres construir merece acordarse antes de empezar. Eso
// se le pregunta, porque es quien lee lo que hay escrito y lo que le pides.
function pantallaSugerencias({ ahora = [], hayAgentes, hayProyectos }) {
  const delDisco = ahora.length
    ? ahora.map((c) => `
      <div class="entrada">
        <p class="nombre">${texto(c.texto)}</p>
        ${boton({ etiqueta: c.boton, icono: '✨', pequeno: true, accion: c.accion })}
      </div>`).join('')
    : nada('Por aquí no veo nada que arreglar ahora mismo.');

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Sugerencias' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Sugerencias</h2>
      <p class="hiciste">Lo que le vendría bien a esto, mirado por los dos lados.</p>
    </div>

    <h2>Lo que veo yo</h2>
    ${delDisco}

    <hr class="separador">
    <h2>Lo que ve el asistente</h2>
    <p class="detalle">Mira lo que hay montado y lo que le pides, y propone. Tarda un poco.</p>
    ${boton({
      etiqueta: 'Que lo repase todo',
      icono: '🔍',
      principal: true,
      accion: {
        tipo: 'pedir',
        prompt: [
          'Repasa esta carpeta entera y dime qué le vendría bien. Mira lo que hay montado y lo que te vengo pidiendo, y propón como mucho cinco cosas, ordenadas por lo que más me ahorraría.',
          '',
          'Mira en concreto:',
          '- Algo que te pida a menudo y que debería quedarse como botón.',
          '- Alguna habilidad que no tenga puesta y que me haría falta.',
          '- Algo que repito cada semana o cada mes y que podría llevar un ayudante por su cuenta, sin que yo esté delante.',
          '- Algún programa mío que todavía no está conectado y debería estarlo.',
          '- Algo que esté a medias o mal montado y convenga arreglar.',
          '- Y si lo que quiero construir es lo bastante gordo como para acordarlo antes de empezar en vez de ir haciendo.',
          '',
          'De cada una dime qué es, qué me ahorra y qué hace falta para tenerla. Y pregúntame cuál quieres que monte antes de tocar nada.',
        ].join('\n'),
      },
    })}

    ${hayAgentes || hayProyectos ? '' : `
      <hr class="separador">
      <p class="detalle">Todavía no hay ayudantes montados ni nada acordado para construir. En cuanto los haya, aparecen solos en la pantalla principal.</p>`}
  `;
}

// ------------------------------------------------------------- los ayudantes

function pantallaAgentes({ agentes = [] }) {
  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Ayudantes' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Ayudantes</h2>
      <p class="hiciste">Cada uno tiene un encargo y lo hace por su cuenta.</p>
    </div>

    ${agentes.length
      ? agentes.map((a) => `
        <div class="entrada">
          <p class="nombre">${texto(a.nombre)}</p>
          ${a.queHace ? `<p class="pista">${texto(a.queHace)}</p>` : ''}
          ${boton({ etiqueta: 'Ponlo a trabajar', icono: '▸', pequeno: true, accion: { tipo: 'pedir', prompt: `Quiero que ${a.nombre} haga lo suyo ahora. Pregúntame lo que te falte.` } })}
          ${boton({ etiqueta: 'Ver su encargo', icono: '📄', pequeno: true, discreto: true, accion: { tipo: 'verAgente', fichero: a.fichero } })}
        </div>`).join('')
      : nada('Todavía no hay ninguno.')}

    <hr class="separador">
    ${boton({
      etiqueta: 'Montar otro',
      icono: '➕',
      accion: { tipo: 'pedir', prompt: 'Quiero un ayudante que se encargue de algo por su cuenta. Pregúntame de qué, cada cuánto y qué tiene que hacer exactamente, y móntalo.' },
    })}
  `;
}

function pantallaProyectos({ montones = [] }) {
  const ESTADOS = {
    draft: 'en borrador',
    accepted: 'acordado',
    approved: 'acordado',
    done: 'terminado',
    superseded: 'sustituido',
  };

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'En qué estamos' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>En qué estamos</h2>
      <p class="hiciste">Lo que se acordó construir, por qué, y cómo se va a hacer.</p>
    </div>

    ${montones.map((m) => `
      <h2>${texto(m.etiqueta)}</h2>
      <p class="detalle">${texto(m.pista)}</p>
      ${m.cosas.map((c) => `
        <div class="entrada">
          <p class="nombre">${texto(c.titulo)}</p>
          ${c.estado || c.tareas ? `<p class="pista">${texto([
            ESTADOS[c.estado] || c.estado,
            c.tareas ? plural(c.tareas, '1 tarea', '{n} tareas') : '',
          ].filter(Boolean).join(' · '))}</p>` : ''}
          ${boton({ etiqueta: 'Abrirlo', icono: '▸', pequeno: true, accion: { tipo: 'verProyecto', fichero: c.fichero } })}
        </div>`).join('')}`).join('<hr class="separador">')}
  `;
}

// ----------------------------------------------------- la cara de la empresa

// El diseño lo hace el asistente. Esto es la puerta por la que entra el
// material: la web, el logotipo, su manual de marca, una captura de su página,
// o nada de eso y contárselo con palabras.
function pantallaLaCara({
  puesta, descartada, nombre, web, hayLogo, material = [], aviso: avisoLocal,
}) {
  const estadoAhora = descartada
    ? `<div class="aviso malo"><p>No he podido usar lo que hay: ${texto(descartada)}.</p></div>`
    : (puesta
      ? `<p class="hiciste">Ahora mismo lleva la cara de ${texto(nombre || 'tu empresa')}${hayLogo ? ', con su logotipo' : ''}.</p>`
      : '<p class="hiciste">Ahora mismo lleva la de Executive Lab.</p>');

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'El tema de mi empresa' }])}
    ${bloqueAviso(avisoLocal)}
    ${volver()}

    <div class="brujula">
      <h2>El tema de mi empresa</h2>
      ${estadoAhora}
      <p class="detalle">Los colores los saca el asistente de lo que le des. Si lo que elige no se lee bien, no se aplica: prefiero dejar la cara de siempre antes que una pantalla ilegible.</p>
    </div>

    <h2>Dale material</h2>
    ${boton({ etiqueta: web ? `Cambiar la web (${web})` : 'Decirle cuál es tu web', icono: '🌐', principal: true, accion: { tipo: 'ponerLaCara' } })}
    ${boton({ etiqueta: 'Subirle el logotipo o lo que tengas', icono: '📎', accion: { tipo: 'materialDeMarca' } })}
    <p class="detalle">El logotipo, su manual de marca, una captura de la web… o arrástralo aquí encima.</p>
    ${boton({
      etiqueta: 'Contárselo con mis palabras',
      icono: '💬',
      accion: { tipo: 'pedir', prompt: 'Quiero ponerle a esto la cara de mi empresa y no tengo web ni logotipo a mano. Pregúntame cómo es: los colores, el nombre, el aire que tiene, y déjalo montado.' },
    })}

    ${material.length ? `
      <hr class="separador">
      <h2>Lo que ya le has dado</h2>
      ${material.map((m) => `<div class="archivo"><div class="archivo-que"><p class="nombre">${texto(m)}</p></div></div>`).join('')}` : ''}

    ${puesta || descartada ? `
      <hr class="separador">
      ${boton({ etiqueta: 'Volver a la cara de siempre', icono: '↩️', discreto: true, pequeno: true, accion: { tipo: 'quitarLaCara' } })}` : ''}
  `;
}

// ------------------------------------------------- cómo quieres que trabaje

// El subapartado de personalización. Son cuatro cosas y cada una cambia el día
// a día, así que van juntas y no repartidas por la barra.
function pantallaComoTrabaja({
  permisos = [], permiso, hayPermisos = true, cadaCuanto = [], guarda,
  objetivo, metas = [], limites = [], aviso: avisoLocal,
}) {
  const elegir = (opciones, puesto, accion) => opciones.map((o) => `
    <div class="capacidad${o.id === puesto ? ' puesta' : ''}">
      <p class="nombre">${texto(o.nombre)}${o.id === puesto ? ' <span class="cuantos">ahora mismo</span>' : ''}</p>
      <p class="pista">${texto(o.frase)}</p>
      ${o.id === puesto ? '' : boton({ etiqueta: 'Ponme así', icono: '▸', pequeno: true, accion: { ...accion, cual: o.id } })}
    </div>`).join('');

  const puntos = (lista) => `<ul class="lista">${lista.map((t) => `<li>${enLinea(t)}</li>`).join('')}</ul>`;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Cómo quieres que trabaje' }])}
    ${bloqueAviso(avisoLocal)}
    ${volver()}

    <div class="brujula">
      <h2>Cómo quieres que trabaje</h2>
      <p class="hiciste">Cuatro cosas que cambian el día a día.</p>
    </div>

    <h2>Qué puede hacer sin preguntarte</h2>
    ${hayPermisos
      ? elegir(permisos, permiso, { tipo: 'ponerPermiso' })
      : nada('Esto lo lleva tu asistente por su cuenta, en sus propios ajustes. Desde aquí no se toca.')}

    <hr class="separador">
    <h2>Cada cuánto guarda solo</h2>
    ${elegir(cadaCuanto, guarda, { tipo: 'ponerCadaCuanto' })}
    <p class="detalle">Solo mientras tengas esto abierto, y solo si hay algo nuevo. Nunca toca el historial de otra persona.</p>

    <hr class="separador">
    <h2>Para qué es esto</h2>
    ${objetivo ? `<p class="hiciste">${enLinea(objetivo)}</p>` : nada('No lo dijiste al montar la carpeta.')}
    ${metas.length ? puntos(metas) : ''}
    ${limites.length ? `<h2>Los límites que pusiste</h2>${puntos(limites)}` : ''}
    <p class="detalle">Se lo lee antes de contestarte. Si ya no es esto, díselo.</p>
    ${boton({
      etiqueta: 'Cambiar para qué es esto',
      icono: '✏️',
      accion: { tipo: 'pedir', prompt: 'Quiero repasar para qué es esta carpeta y qué límites tengo. Enséñame lo que tienes apuntado, pregúntame qué ha cambiado y déjalo al día en mi perfil.' },
    })}

    <hr class="separador">
    <h2>Cómo te habla</h2>
    ${boton({ etiqueta: 'Cuánto te explica y con qué palabras', icono: '🗣️', accion: { tipo: 'verTrato' } })}

  `;
}

// ------------------------------------------------------- con quién hablas

function pantallaAsistente({ ahora, cuales = [], aviso: avisoLocal }) {
  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Con quién hablas' }])}
    ${bloqueAviso(avisoLocal)}
    ${volver()}

    <div class="brujula">
      <h2>Con quién hablas</h2>
      <p class="hiciste">El asistente al que le hablan los botones de esta barra.</p>
    </div>

    ${cuales.map((a) => `
      <div class="capacidad${a.id === ahora ? ' puesta' : ''}">
        <p class="nombre">${texto(a.nombre)}${a.id === ahora ? ' <span class="cuantos">ahora mismo</span>' : ''}</p>
        <p class="pista">${texto(a.instalado
          ? (a.mandaTexto
            ? 'Puesto en este ordenador. Los botones le mandan el texto directamente.'
            : 'Puesto en este ordenador. Los botones abren su barra y te dejan el texto copiado, porque no admite que se lo pasen.')
          : 'No está en este ordenador. Díselo a tu tutor.')}</p>
        ${a.instalado && a.id !== ahora && !a.delArnes
          ? '<p class="pista">Esta carpeta no se montó para él: al cambiar, tus habilidades y tus ayudantes dejan de verse hasta que se los vuelvas a pedir.</p>'
          : ''}
        ${a.instalado && a.id !== ahora
          ? boton({ etiqueta: `Hablar con ${a.nombre}`, icono: '▸', pequeno: true, accion: { tipo: 'elegirAsistente', cual: a.id } })
          : ''}
      </div>`).join('')}

    <hr class="separador">
    ${boton({
      etiqueta: 'Configurarlo',
      icono: '⚙️',
      accion: { tipo: 'pedir', prompt: 'Quiero repasar cómo estás configurado en esta carpeta: qué lees antes de contestar, qué permisos tienes y qué se ejecuta solo. Explícamelo en cristiano y dime qué me conviene cambiar.' },
    })}

  `;
}

// ------------------------------------------------------- acciones rápidas

// Qué va arriba del todo. Hasta cinco, de entre todo lo que esta carpeta sepa
// hacer: los botones que el asistente ha creado, las consultas de cada programa
// y las habilidades puestas.
function pantallaFijadas({ grupos = [], elegidas = [], tope = 5, aviso: avisoLocal }) {
  const lleno = elegidas.length >= tope;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Acciones rápidas' }])}
    ${volver()}
    ${bloqueAviso(avisoLocal)}

    <div class="brujula">
      <h2>Acciones rápidas</h2>
      <p class="hiciste">Lo que quieras tener arriba del todo, hasta ${texto(tope)}.</p>
      <p class="detalle">${texto(elegidas.length
        ? `Llevas ${elegidas.length} de ${tope}.`
        : 'Sin elegir nada, arriba salen los botones que ha ido creando el asistente.')}</p>
    </div>

    ${grupos.length ? grupos.map((g) => `
      <h2>${texto(g.titulo)}</h2>
      ${g.cosas.map((c) => {
        const puesta = elegidas.includes(c.id);
        return `
          <div class="archivo">
            <div class="archivo-que">
              <p class="nombre">${texto(c.etiqueta)}</p>
              ${c.pista ? `<p class="pista">${texto(c.pista)}</p>` : ''}
            </div>
            <div class="archivo-acciones">
              ${puesta
                ? boton({ etiqueta: `Quitar ${c.etiqueta} de arriba`, icono: '★', pequeno: true, soloIcono: true, accion: { tipo: 'soltar', cual: c.id } })
                : boton({ etiqueta: `Poner ${c.etiqueta} arriba`, icono: '☆', pequeno: true, soloIcono: true, accion: { tipo: 'fijar', cual: c.id } })}
            </div>
          </div>`;
      }).join('')}`).join('')
      : nada('Todavía no hay nada que fijar. Según vaya habiendo botones, programas y habilidades, aparecerán aquí.')}

    ${lleno ? `<p class="detalle">${texto(`Ya tienes las ${tope}. Quita una para poner otra.`)}</p>` : ''}

  `;
}

// -------------------------------------------------------------- la ayuda

// Todo lo que sirve cuando alguien se atasca, en un sitio. Antes estaba
// repartido: el SOS en un grupo, la revisión de la carpeta en otro, y "¿y ahora
// qué hago?" en ningún sitio — que es la pregunta más frecuente de todas y no
// tenía botón.
function pantallaAyuda({ github }) {
  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Ayuda' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Ayuda</h2>
      <p class="hiciste">Si te has atascado, empieza por aquí.</p>
    </div>

    <h2>No sé qué hacer ahora</h2>
    ${boton({
      etiqueta: 'Dime por dónde seguir',
      icono: '🧭',
      principal: true,
      accion: { tipo: 'pedir', prompt: 'Mira cómo está esto y dime por dónde seguir: qué tengo a medias, qué sería lo siguiente y por qué. Dame dos o tres opciones concretas, no una lista larga.' },
    })}
    ${boton({ etiqueta: 'Qué le vendría bien a esto', icono: '✨', accion: { tipo: 'verSugerencias' } })}
    ${boton({
      etiqueta: 'Pensemos ideas juntos',
      icono: '💡',
      accion: { tipo: 'pedir', prompt: 'Quiero que pensemos ideas juntos sobre qué más podría hacer con esto. Mira lo que ya hay montado, pregúntame lo que necesites y propón cosas que encajen con mi trabajo, no cosas genéricas.' },
    })}

    <hr class="separador">
    <h2>Algo no funciona</h2>
    ${boton({ etiqueta: 'Algo va mal', icono: '🆘', accion: { tipo: 'algoVaMal' } })}
    ${boton({ etiqueta: 'Qué falta por montar', icono: '🔎', accion: { tipo: 'verRadiografia' } })}

    <hr class="separador">
    <h2>Guías</h2>
    ${boton({
      etiqueta: github && github.conectado ? 'Cómo funciona lo de GitHub' : 'Cómo entrar en GitHub',
      icono: '☁️',
      accion: { tipo: 'verCopiaFuera' },
    })}
    ${boton({
      etiqueta: 'Explícame cómo funciona esto',
      icono: '📖',
      accion: { tipo: 'pedir', prompt: 'Explícame de cero cómo funciona esto: qué es esta carpeta, qué haces tú, qué hago yo, y qué gano. Sin palabras técnicas y con ejemplos de mi trabajo.' },
    })}

  `;
}

// ------------------------------------------------------------- los papeles

// El archivador: los documentos que han entrado. NO es lo que el arnés ha
// entendido —eso son los conceptos— sino los ficheros, en los tres estados por
// los que pasan. Hasta ahora de los tres solo se veía un número.
function pantallaPapeles({
  sueltos = [], esperando = [], leidos = [], originales = [], aviso: avisoLocal,
}) {
  // Quitar solo se ofrece en los que todavía no ha leído nadie: de esos no ha
  // salido ningún concepto, así que borrar el papel lo borra de verdad. Con los
  // demás hay un botón distinto, abajo, que se lo pide al asistente.
  const monton = (papeles, vacio, seQuitan = false) => (papeles.length
    ? papeles.map((d) => `
      <div class="archivo">
        <div class="archivo-que">
          <p class="nombre">${texto(d.nombre)}</p>
          ${d.cuando ? `<p class="pista">${texto(cuando(String(d.cuando).slice(0, 10)))}</p>` : ''}
        </div>
        <div class="archivo-acciones">
          ${boton({ etiqueta: `Abrir ${d.nombre}`, icono: '↗', pequeno: true, soloIcono: true, accion: { tipo: 'abrirPapel', ruta: d.ruta } })}
          ${seQuitan ? boton({ etiqueta: `Quitar ${d.nombre}`, icono: '×', pequeno: true, soloIcono: true, accion: { tipo: 'quitarPapel', ruta: d.ruta, nombre: d.nombre } }) : ''}
        </div>
      </div>`).join('')
    : nada(vacio));

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Lo que le has dado' }])}
    ${bloqueAviso(avisoLocal)}
    ${volver()}

    <div class="brujula">
      <h2>Lo que le has dado</h2>
      <p class="hiciste">Los papeles que han entrado aquí. Lo que ha entendido de ellos está en Conocimiento, y lo que ha producido él, en Lo que ha hecho.</p>
    </div>

    ${cajaDeBusqueda('papeles')}

    ${boton({ etiqueta: 'Darle documentos', icono: '📎', principal: true, accion: { tipo: 'anadirDocumentos' } })}

    ${sueltos.length ? `
      <h2>Sin colocar todavía</h2>
      <p class="detalle">Los dejaste en la carpeta y siguen ahí fuera. Todavía no ha sacado nada de ellos.</p>
      ${monton(sueltos, '', true)}
      ${boton({
        etiqueta: 'Que los coloque y los lea',
        icono: '📥',
        accion: { tipo: 'pedir', prompt: 'Hay documentos sueltos en la carpeta, fuera de la bandeja. Míralos, ponlos donde toque y cuéntame en dos líneas qué has sacado de ellos.' },
      })}
      <hr class="separador">` : ''}

    <h2>Sin leer todavía</h2>
    ${monton(esperando, 'Ninguno esperando.', true)}

    <hr class="separador">
    <h2>Ya leídos</h2>
    ${monton(leidos, 'Todavía no ha leído ninguno.')}

    <hr class="separador">
    <h2>Originales guardados</h2>
    <p class="detalle">Tal y como llegaron. Esto no se borra nunca.</p>
    ${monton(originales, 'Ninguno guardado todavía.')}

    ${/* Aquí no borramos nosotros: de estos papeles ya salieron conceptos, y
          quitar el papel dejando lo aprendido es justo lo que quien lo quita
          quería evitar. El asistente sí sabe qué se llevó de cada uno. */''}
    <hr class="separador">
    ${boton({
      etiqueta: 'Quitar algo que ya ha leído',
      icono: '🗑️',
      discreto: true,
      accion: { tipo: 'pedir', prompt: 'Quiero quitar un documento que ya has leído. Pregúntame cuál, dime antes qué has aprendido de él y qué conceptos se quedarían cojos, y cuando te diga que sí, quita el documento y lo que salió solo de él.' },
    })}

  `;
}

// -------------------------------------------------- preguntas sin contestar

// Lo que el arnés sabe que no sabe: `gaps.md`. Estaba enterrado al final de la
// pantalla de conceptos, detrás de todo lo demás, que es donde no lo ve nadie.
// Y es de lo más accionable que hay aquí: cada línea se pulsa y se le cuenta.
function pantallaHuecos({ huecos = [] }) {
  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Preguntas sin contestar' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Preguntas sin contestar</h2>
      <p class="hiciste">Cosas que ha visto que le faltan. Pulsa cualquiera para contársela.</p>
    </div>

    ${huecos.length
      ? huecos.map((h) => boton({
        etiqueta: h,
        icono: '?',
        accion: { tipo: 'pedir', prompt: `Quiero contarte lo que te falta saber: ${h}. Pregúntame lo que necesites y guárdalo.` },
      })).join('')
      : nada('Ninguna por ahora. Según vaya leyendo cosas irán saliendo.')}

  `;
}

// ------------------------------------------------------ qué se ha hecho aquí

// El arnés lleva un diario y no lo veía nadie. Dos cosas, y la segunda es la
// que vale dinero: lo que se hizo cada día, y lo que se decidió y por qué.
function pantallaDiario({ sesiones = [], decisiones = [], aprendido = [] }) {
  const trabajo = sesiones.length
    ? sesiones.map((s) => `
        <div class="entrada">
          <p class="cuando">${texto(cuando(s.fecha))}</p>
          <p class="nombre">${enLinea(s.titulo)}</p>
          ${s.resumen && s.resumen !== s.titulo ? `<p class="pista">${enLinea(s.resumen)}</p>` : ''}
          ${boton({ etiqueta: 'Abrirlo', icono: '▸', pequeno: true, accion: { tipo: 'verSesion', fichero: s.fichero } })}
        </div>`).join('')
    : nada('Todavía no hay nada anotado. Se escribe solo cuando termináis de trabajar en algo.');

  // Una decisión sin el porqué es media decisión: a los tres meses, el porqué
  // es lo único que hace falta.
  const acordado = decisiones.length
    ? decisiones.map((d) => `
        <div class="entrada">
          ${d.fecha ? `<p class="cuando">${texto(cuando(d.fecha))}</p>` : ''}
          <p class="nombre">${enLinea(d.titulo)}</p>
          ${d.eleccion ? `<p class="pista">${enLinea(d.eleccion)}</p>` : ''}
          ${d.porque ? `<p class="detalle">Porque ${enLinea(d.porque.charAt(0).toLowerCase() + d.porque.slice(1))}</p>` : ''}
        </div>`).join('')
    : nada('Todavía no hay ninguna apuntada.');

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'El diario' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>El diario</h2>
      <p class="hiciste">Lo que fuisteis haciendo, y lo que decidisteis por el camino. Se apunta solo.</p>
    </div>

    <h2>Días de trabajo</h2>
    ${trabajo}

    <hr class="separador">
    <h2>Decisiones</h2>
    ${acordado}

    ${/* Sale de `log.md`, que es el registro de operaciones del arnés. Estaba
          en la pantalla de documentos, que no es su sitio: es diario. */''}
    ${aprendido.length ? `
      <hr class="separador">
      <h2>Lo último que ha anotado</h2>
      <ul class="lista">
        ${aprendido.map((a) => `<li>${texto(a.titulo)}<span class="cuando">${texto(cuando(a.fecha))}</span></li>`).join('')}
      </ul>` : ''}

  `;
}

// ------------------------------------------------- cuánto te quiere explicar

// El ajuste que más cambia el día a día y que solo se podía tocar escribiéndolo
// en la conversación, cosa que no hace quien no sabe que existe. Lo guarda el
// arnés en su perfil y lo lee **todo** lo demás antes de contestar.
function pantallaTrato({ escalones = [], vocabularios = [], trato, palabras, elegido, aviso: avisoLocal }) {
  const fila = (opcion, puesta, accion) => `
    <div class="capacidad${opcion.id === puesta ? ' puesta' : ''}">
      <p class="nombre">${texto(opcion.nombre)}${opcion.id === puesta ? ' <span class="cuantos">ahora mismo</span>' : ''}</p>
      <p class="pista">${texto(opcion.frase)}</p>
      ${opcion.id === puesta ? '' : boton({ etiqueta: 'Ponme así', icono: '▸', pequeno: true, accion: { ...accion, cual: opcion.id } })}
    </div>`;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Cómo te habla' }])}
    ${bloqueAviso(avisoLocal)}
    ${volver()}

    <div class="brujula">
      <h2>Cómo te habla</h2>
      <p class="hiciste">Se lo aplica a todo lo que te conteste, no solo aquí.</p>
      ${elegido ? '' : '<p class="detalle">Nadie lo ha elegido todavía, así que va por lo más acompañado.</p>'}
    </div>

    <h2>Cuánto te explica</h2>
    ${escalones.map((e) => fila(e, trato, { tipo: 'ponerTrato' })).join('')}

    <hr class="separador">
    <h2>Con qué palabras</h2>
    ${vocabularios.map((v) => fila(v, palabras, { tipo: 'ponerPalabras' })).join('')}

  `;
}

// -------------------------------------------------- qué hay en esta carpeta

// Pieza por pieza, y sin esconder lo que falta. Quien abre la barra y no ve
// conexiones no sabe si es que no tiene ninguna o es que no se encuentran; esto
// lo dice con todas las letras.
function pantallaRadiografia(datos) {
  const MARCA = { si: '✓', no: '·', aMedias: '!' };

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'Qué hay aquí' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Qué falta por montar</h2>
      <p class="hiciste">Todo lo que la barra enseña sale de leer esta carpeta. Esto es lo que ha encontrado.</p>
    </div>

    <div class="radiografia">
      ${(datos.piezas || []).map((pieza) => `
        <div class="pieza ${pieza.estado}">
          <span class="pieza-marca" aria-hidden="true">${MARCA[pieza.estado] || '·'}</span>
          <span class="pieza-nombre">${texto(pieza.nombre)}</span>
          <span class="pieza-detalle">${texto(pieza.detalle)}</span>
        </div>`).join('')}
    </div>

  `;
}

// ------------------------------------------------- la copia de fuera

// "Guardar una copia fuera" son tres cosas y se confunden entre sí: una cuenta
// donde guardar, un sitio dentro de esa cuenta, y el acto de subir. Esta
// pantalla las separa y dice en cuál estás.
//
// La guía se enseña ENTERA aunque no haga falta: quien no sabe qué es esto
// necesita entender qué va a pasar antes de pulsar, y quien ya lo sabe la
// ignora de un vistazo. Es más barato que un botón que abre un diálogo del que
// no sabes salir.
function pantallaCopiaFuera(datos) {
  const g = datos.github || {};
  const dentro = Boolean(g.conectado);
  const donde = g.remoto;

  const paso = (n, titulo, cuerpo, hecho) => `
    <div class="paso ${hecho ? 'hecho' : ''}">
      <p class="paso-titulo">${hecho ? '✓' : n} ${texto(titulo)}</p>
      <p class="paso-cuerpo">${texto(cuerpo)}</p>
    </div>`;

  return `
    ${migas([{ etiqueta: 'Principal', accion: { tipo: 'volver' } }, { etiqueta: 'La copia de fuera' }])}
    ${bloqueAviso()}
    ${volver()}

    <div class="brujula">
      <h2>Subir a GitHub</h2>
      <p class="hiciste">Lo que guardas en git vive en este ordenador. Si se rompe o se pierde, se pierde con él. Subirlo a GitHub es guardar lo mismo además en internet, en un sitio privado que solo tú ves.</p>
    </div>

    ${paso(1, 'Entrar en tu cuenta',
      dentro
        ? `Ya estás dentro${g.usuario ? ` como ${g.usuario}` : ''}. No hay que hacer nada más.`
        : 'Hace falta una cuenta gratuita en GitHub, que es donde se guardan. Al pulsar, el editor abre su ventana de siempre y tú entras ahí; aquí no se escribe ninguna contraseña.',
      dentro)}

    ${paso(2, 'El sitio donde se guarda',
      donde && donde.esGitHub
        ? `Ya tienes uno: ${donde.corto}. Las copias van ahí.`
        : 'Lo creo yo la primera vez, privado, con el nombre de tu carpeta. No tienes que preparar nada.',
      Boolean(donde && donde.esGitHub))}

    ${paso(3, 'Guardar',
      'Cada vez que pulses, se guarda primero aquí y después fuera. Puedes hacerlo tantas veces como quieras.',
      false)}

    ${dentro
      ? boton({ etiqueta: 'Subir a GitHub ahora', icono: '☁️', principal: true, accion: { tipo: 'subirCopia' } })
      : boton({ etiqueta: 'Entrar en mi cuenta', icono: '🔑', principal: true, accion: { tipo: 'conectarGitHub' } })}
    ${dentro ? '' : `<p class="detalle">¿No tienes cuenta? Se hace en dos minutos en github.com y es gratis.</p>`}
  `;
}

// ---------------------------------------------------------------- pantallas

// El arnés puede tardar minutos, y una pantalla que solo dice "Un momento…"
// no se distingue de una que se ha colgado. A partir de ocho segundos empieza a
// contar en voz alta: no acelera nada, pero se nota vivo, que es lo que hace
// falta cuando no sabes si aquello sigue trabajando.
let relojDeEspera = null;

function pararElReloj() {
  if (relojDeEspera) {
    clearInterval(relojDeEspera);
    relojDeEspera = null;
  }
}

// Con salida. Esperar sin poder volver es un callejón: si lo de detrás tarda
// más de la cuenta —o se cuelga, que ya ha pasado— quedarse mirando no es una
// opción que nadie elija. Volver no cancela lo de detrás; solo te deja salir.
function pantallaEsperando(que = 'Un momento…') {
  return `
    ${nada(que)}
    <p class="cargando cuanto" data-cuanto></p>
    ${boton({ etiqueta: 'Volver', icono: '←', discreto: true, accion: { tipo: 'volver' } })}
  `;
}

function arrancarElReloj() {
  pararElReloj();
  const desde = Date.now();
  relojDeEspera = setInterval(() => {
    const hueco = document.querySelector('[data-cuanto]');
    if (!hueco) return pararElReloj();

    const segundos = Math.round((Date.now() - desde) / 1000);
    if (segundos < 8) return undefined;
    hueco.textContent = segundos < 60
      ? `Llevo ${segundos} segundos. Sigo.`
      : `Llevo ${Math.floor(segundos / 60)} min ${segundos % 60} s. Sigo.`;
    return undefined;
  }, 1000);
}

// Falta git. No se enseña como un error —no lo es, es una pieza que no está—
// y sobre todo no se acaba en "díselo a tu tutor", que era un callejón: el
// botón la pone. Lo que pasará al pulsarlo cambia según el ordenador, así que
// el texto lo escribe la extensión (git.comoSeInstala) y aquí solo se pinta.
function bloqueFaltaGit() {
  return `
    <div class="aviso">
      <p>Falta una pieza para poder guardar tu trabajo.</p>
      <p>${texto(estado.comoSeInstalaGit || '')}</p>
    </div>
    ${boton({ etiqueta: 'Ponerla ahora', icono: '⬇️', principal: true, accion: { tipo: 'instalarGit' } })}
  `;
}

// Lo que se ha encontrado en una carpeta que ya es de alguien. Se enseña ANTES
// de ofrecer el botón, porque quien lo pulsa tiene derecho a saber sobre qué lo
// está pulsando. Y se promete lo que el código cumple: no se toca nada de lo
// que hay, y el historial de esa persona no se escribe (terreno.js).
function bloqueYaEmpezada() {
  const y = estado.yaEmpezada;
  const visto = [];
  if (y.parece) visto.push(`Parece ${y.parece}`);
  visto.push(plural(y.cuantos, '1 cosa dentro', '{n} cosas dentro'));
  if (y.conHistorial) visto.push('con su propio historial');
  if (y.sinGuardar) visto.push(plural(y.sinGuardar, '1 cambio sin guardar', '{n} cambios sin guardar'));
  if (y.claves) visto.push(plural(y.claves, '1 clave suelta', '{n} claves sueltas'));

  return `
    <div class="aviso">
      <p>${texto(visto.join(' · '))}</p>
      <p>No voy a tocar nada de esto. Solo añado lo que el asistente necesita para entenderlo${y.conHistorial ? ', y tu historial lo dejo como está' : ''}.</p>
    </div>
    ${boton({ etiqueta: 'Añadir el asistente a esto', icono: '✳', principal: true, accion: { tipo: 'arrancar' } })}
  `;
}

// Carpeta sin arnés: no está rota, es que aún no se ha montado. Si falta git no
// se ofrece prepararla: sin él la preparación aborta a mitad, y enseñar un
// botón que no puede funcionar es peor que no enseñarlo.
function pantallaSinArnes() {
  const ofrecer = estado.yaEmpezada
    ? bloqueYaEmpezada()
    : boton({ etiqueta: 'Preparar esta carpeta', icono: '✳', principal: true, accion: { tipo: 'arrancar' } });

  return `
    ${bloqueAviso()}
    <div class="brujula">
      <h2>Lo último</h2>
      <p class="donde">${texto(estado.donde)}</p>
      <p class="hiciste">${texto(estado.aviso)}</p>
    </div>
    ${estado.faltaGit ? bloqueFaltaGit() : ofrecer}
    ${boton({ etiqueta: 'Elegir otra carpeta', icono: '📂', discreto: true, accion: { tipo: 'elegirCarpeta' } })}
  `;
}

// Sin carpeta abierta no hay nada que enseñar salvo la puerta de entrada.
function pantallaSinCarpeta() {
  return `
    ${bloqueAviso()}
    <div class="brujula">
      <h2>Por dónde empezamos</h2>
      <p class="donde">Elige con qué quieres trabajar</p>
      <p class="hiciste">Una carpeta cualquiera: la contabilidad, el personal, un proyecto. Si está vacía, la preparo.</p>
    </div>
    ${boton({ etiqueta: 'Elegir una carpeta', icono: '📂', principal: true, accion: { tipo: 'elegirCarpeta' } })}
  `;
}

function pantallaPrincipal() {
  if (!estado) return pantallaEsperando();
  if (estado.sinCarpeta) return pantallaSinCarpeta();
  if (estado.sinArnes) return pantallaSinArnes();

  // Cuántas conexiones y cuántas cosas sabe ya no se cuentan aquí: van en la
  // fila plegada de cada uno, que es donde se puede hacer algo con ese número.

  // Los botones no están predefinidos: son los comandos que tenga esta
  // empresa, y el asistente va creando más conforme se repiten tareas.
  const descubiertos = accionesDescubiertas
    .map((a, i) => boton({ etiqueta: a.etiqueta, icono: a.icono, principal: i === 0, accion: { tipo: 'pedir', prompt: a.prompt } }))
    .join('');

  // Recién montado: lo primero es tener cuenta y sesión. Sin eso, el chat no
  // responde y el alumno se queda mirando una caja muda sin saber por qué.
  // Sin el asistente instalado, todo lo demás de esta pantalla es decorado: los
  // botones mandan texto a algo que no está. Se dice arriba del todo y en
  // cuanto pasa, no solo el primer día.
  // Hay algo mejor y quien lo usa no se ha enterado. Va discreto y abajo: no
  // es urgente, y una barra que te da la lata con actualizaciones es peor que
  // una barra desactualizada.
  const versionNueva = estado.hayVersionNueva ? `
    <p class="detalle">Hay una versión más nueva de esto (${texto(estado.hayVersionNueva)}).</p>
    ${boton({ etiqueta: 'Ir a por ella', icono: '⬆', discreto: true, pequeno: true, accion: { tipo: 'bajarLaNueva' } })}` : '';

  const sinAsistente = estado.faltaElAsistente && !estado.primerPaso ? `
    <div class="aviso malo">
      <p>Falta ${texto(estado.faltaElAsistente)} en este ordenador, y sin él no puedo hablar con nadie.</p>
      <p>Díselo a tu tutor: es lo único que falta.</p>
    </div>` : '';

  const primerPaso = estado.primerPaso ? `
    <h2>Empieza por aquí</h2>
    <div class="conexion">
      <p class="nombre">${texto(estado.primerPaso.instalado
        ? `Abre ${estado.primerPaso.asistente} y entra con tu cuenta`
        : `Falta instalar ${estado.primerPaso.asistente}`)}</p>
      <p class="pista">${texto(estado.primerPaso.instalado
        ? 'Hace falta una cuenta de pago. Sin ella no te va a contestar.'
        : 'Díselo a tu tutor: falta algo por instalar y sin eso no puede hablar con nadie.')}</p>
      ${estado.primerPaso.instalado
        ? boton({ etiqueta: `Abrir ${estado.primerPaso.asistente}`, icono: '▸', principal: true, accion: { tipo: 'abrirAsistente' } })
        : ''}
    </div>
    <hr class="separador">` : '';

  // Como mucho una, y siempre con un botón que la resuelve ahí mismo. Un
  // aviso que solo informa de un problema es un aviso que estorba.
  const elConsejo = estado.consejo ? `
    <div class="consejo">
      <p class="que">${texto(estado.consejo.texto)}</p>
      ${boton({ etiqueta: estado.consejo.boton, icono: '✨', principal: true, accion: estado.consejo.accion })}
      ${boton({ etiqueta: 'Ahora no', discreto: true, accion: { tipo: 'ahoraNo', id: estado.consejo.id } })}
    </div>` : '';

  const documentos = estado.esperando
    ? boton({
      etiqueta: plural(estado.esperando, 'Tienes 1 documento sin leer', 'Tienes {n} documentos sin leer'),
      icono: '📥',
      accion: { tipo: 'verCerebro' },
    })
    : '';

  return `
    ${/* Aquí había un bloque que contaba dónde estabas y qué hiciste lo último.
          Fuera: `orient`, la habilidad que RSC trae siempre puesta, es
          exactamente eso y vive en la conversación, donde además puede
          contestar preguntas. Repetirlo aquí era ocupar lo más alto de la barra
          con algo que se pregunta mejor hablando. Lo que se queda es lo que no
          es narración: los avisos y el consejo, que llevan botón. */''}
    ${bloqueAviso()}
    ${pulso.length ? `<p class="pulso">${texto(pulso.join(' · '))}</p>` : ''}

    ${sinAsistente}
    ${primerPaso}
    ${elConsejo}
    ${documentos}
    ${/* Lo más alto de la barra, para lo que esa persona use de verdad. Lo
          elige ella entre sus botones, las consultas de sus programas y sus
          habilidades: nosotros no sabemos cuáles son. */''}
    ${/* Solo lo que esa persona haya fijado. Antes, sin fijar nada, salían aquí
          los comandos — y entonces este apartado y el de comandos enseñaban lo
          mismo. Los comandos tienen su sitio; esto es para lo que se elige. */''}
    <h2>Acciones rápidas</h2>
    ${descubiertos || nada(puedeTenerBotones
      ? 'Elige hasta cinco cosas para tenerlas aquí arriba.'
      : 'Tu asistente no trabaja con botones. Pídele las cosas escribiéndolas en la conversación.')}
    ${boton({ etiqueta: 'Elegir cuáles', icono: '☆', pequeno: true, discreto: true, accion: { tipo: 'verFijadas' } })}
    ${/* Las consultas de cada programa estaban aquí arriba, desplegadas. No son
          botones que haya creado nadie ni habilidades: son los scripts que RSC
          mete dentro de cada herramienta, y aquí competían con lo que sí es un
          botón. Vuelven a su programa, que es donde se entienden. */''}
    ${descubiertos ? '<hr class="separador">' : ''}

    ${/* Seis apartados, y el criterio es de qué van, no dónde caían: papeles ·
          lo que ha entendido · lo que ha pasado · actuar · ayuda · configurar.
          Lo de antes eran cajones —"Tu trabajo", "Ajustes y ayuda"— y por eso
          las habilidades acabaron flotando arriba sin casa. */''}
    ${grupo({
      id: 'grupo:documentos',
      etiqueta: 'Documentos',
      // En una carpeta recién montada, lo primero que hay que hacer es darle
      // documentos. Si todo está plegado, eso no se ve. En cuanto ya sabe algo
      // o hay conexiones, se pliega como los demás.
      abiertoDeEntrada: !estado.sabe && !estado.conectados,
      dentro: `
        ${/* Tres cosas distintas que se llamaban casi igual: lo que entra, lo
              que guarda y lo que produce. Nombradas por el verbo —"ver los
              documentos", "llevarte un archivo"— no se distinguían. Nombradas
              por de quién son, sí. */''}
        ${boton({ etiqueta: 'Darle documentos', icono: '📎', pequeno: true, accion: { tipo: 'anadirDocumentos' } })}
        ${boton({ etiqueta: 'Lo que le has dado', icono: '📁', pequeno: true, accion: { tipo: 'verPapeles' } })}
        ${boton({ etiqueta: 'Lo que ha hecho', icono: '📤', pequeno: true, accion: { tipo: 'verSalidas' } })}`,
    })}

    ${grupo({
      id: 'grupo:saber',
      etiqueta: 'Conocimiento',
      // El número dice de qué es. Un "4" a secas al lado de un rótulo no se
      // sabe si son cuatro botones dentro, cuatro conceptos o cuatro de otra
      // cosa; y al lado de otro rótulo significaba algo distinto.
      cuantos: estado.sabe ? plural(estado.sabe, '1 concepto', '{n} conceptos') : '',
      dentro: `
        ${boton({ etiqueta: 'Ver los conceptos', icono: '📚', pequeno: true, accion: { tipo: 'verCerebro' } })}
        ${boton({ etiqueta: 'Preguntas sin contestar', icono: '❓', pequeno: true, accion: { tipo: 'verHuecos' } })}
        ${boton({ etiqueta: 'Cómo te habla', icono: '🗣️', pequeno: true, accion: { tipo: 'verTrato' } })}`,
    })}

    ${estado.faltaGit ? bloqueFaltaGit() : grupo({
      id: 'grupo:historico',
      etiqueta: 'Histórico',
      dentro: `
        ${boton({ etiqueta: 'Guardar en git', icono: '💾', pequeno: true, accion: { tipo: 'guardarCopia' } })}
        ${boton({ etiqueta: 'Subir a GitHub', icono: '☁️', pequeno: true, accion: { tipo: 'verCopiaFuera' } })}
        ${/* Este botón no deshace nada: enseña la lista de copias. Se llamó
              "Volver a como estaba antes" y luego "Volver a un punto anterior",
              y los dos sonaban a que al pulsarlos ya no hay marcha atrás.
              Nombrar la lista y no la acción quita ese miedo, que es lo que
              hace que alguien no se atreva ni a mirar. */''}
        ${boton({ etiqueta: 'Ver las copias guardadas', icono: '🕑', pequeno: true, accion: { tipo: 'verCopias' } })}
        ${boton({ etiqueta: 'El diario', icono: '🗓️', pequeno: true, accion: { tipo: 'verDiario' } })}
        ${boton({ etiqueta: 'Apuntar lo de hoy', icono: '✍️', pequeno: true, accion: { tipo: 'pedir', prompt: 'Apunta en el diario lo que hemos hecho hoy: qué hicimos, por qué, qué quedó tocado y cómo quedó. Y si hemos decidido algo que importe, déjalo también en el registro de decisiones con su porqué.' } })}`,
    })}

    ${/* Aparece solo si esa carpeta construye algo con SDD. Una de contabilidad
          no tendrá specs nunca; una donde se monte una web, sí. */''}
    ${/* Los ayudantes, como las specs: no salen hasta que hay al menos uno. Un
          apartado con rótulo y nada dentro es peor que no tener el rótulo. */''}
    ${estado.hayAgentes ? grupo({
      id: 'grupo:agentes',
      etiqueta: 'Ayudantes',
      dentro: boton({ etiqueta: 'Ver los ayudantes', icono: '🤖', pequeno: true, accion: { tipo: 'verAgentes' } }),
    }) : ''}

    ${estado.hayProyectos ? grupo({
      id: 'grupo:proyectos',
      etiqueta: 'En qué estamos',
      dentro: boton({ etiqueta: 'Qué queremos y cómo', icono: '🧩', pequeno: true, accion: { tipo: 'verProyectos' } }),
    }) : ''}

    ${grupo({
      id: 'grupo:acciones',
      etiqueta: 'Acciones',
      cuantos: estado.conectados ? plural(estado.conectados, '1 programa', '{n} programas') : '',
      dentro: `
        ${/* Todo lo que es actuar, junto: lo que ya está guardado para pedirlo
              de una vez, lo que sabe hacer, y con qué está conectado. */''}
        ${boton({ etiqueta: 'Procesos con un clic (comandos)', icono: '🔖', pequeno: true, accion: { tipo: 'verComandos' } })}
        ${boton({ etiqueta: 'Habilidades (skills)', icono: '✨', pequeno: true, accion: { tipo: 'verSaberes' } })}
        ${boton({ etiqueta: 'Conexiones (tools)', icono: '🔌', pequeno: true, accion: { tipo: 'verConexiones' } })}
        ${boton({
          etiqueta: 'Conectar algo nuevo',
          icono: '➕',
          pequeno: true,
          accion: { tipo: 'pedir', prompt: 'Quiero conectar un programa nuevo con el que ya trabajo. Pregúntame cuál es, móntame la conexión con lo que haga falta y comprueba que funciona antes de darla por buena.' },
        })}
`,
    })}

    ${grupo({
      id: 'grupo:ayuda',
      etiqueta: 'Ayuda',
      dentro: boton({ etiqueta: 'Estoy atascado', icono: '🆘', pequeno: true, accion: { tipo: 'verAyuda' } })
        + boton({ etiqueta: 'Qué falta por montar', icono: '🔎', pequeno: true, accion: { tipo: 'verRadiografia' } }),
    })}

    ${grupo({
      id: 'grupo:ajustes',
      etiqueta: 'Ajustes',
      dentro: `
        ${boton({ etiqueta: 'Cómo quieres que trabaje', icono: '🎛️', pequeno: true, accion: { tipo: 'verComoTrabaja' } })}
        ${boton({ etiqueta: 'Las reglas', icono: '📜', pequeno: true, accion: { tipo: 'verReglas' } })}
        ${boton({ etiqueta: 'Con quién hablas', icono: '💬', pequeno: true, accion: { tipo: 'verAsistente' } })}
        ${boton({
          etiqueta: marcaPuesta ? 'Cambiar el tema de mi empresa' : 'Poner el tema de mi empresa',
          icono: '🎨',
          pequeno: true,
          accion: { tipo: 'verLaCara' },
        })}
        ${boton({ etiqueta: 'Cambiar de proyecto', icono: '📂', pequeno: true, accion: { tipo: 'elegirCarpeta' } })}
        ${modo === 'avanzado'
          ? boton({ etiqueta: 'Volver al modo sencillo', icono: '◂', pequeno: true, accion: { tipo: 'modoSencillo' } })
          : boton({ etiqueta: 'Ver el editor completo', icono: '▸', pequeno: true, accion: { tipo: 'verEditorCompleto' } })}
        ${versionNueva}`,
    })}
  `;
}

// ------------------------------------------------------------- conexiones

function pantallaConexiones({ proveedores, sueltas }) {
  // Caso brownfield: el arnés se montó sobre algo que ya existía y las claves
  // están donde estuvieran. El alumno vería "no hay conexiones" teniendo seis.
  const desordenadas = sueltas ? `
    <div class="conexion">
      <p class="nombre">${texto(plural(sueltas.claves, 'Hay 1 clave guardada fuera de sitio', 'Hay {n} claves guardadas fuera de sitio'))}</p>
      <p class="pista">De cuando este trabajo se llevaba sin esto. Aquí no se ven, y por eso no salen abajo.</p>
      ${sueltas.subidas ? `<p class="pista malo">Y están dentro de tus copias de seguridad, así que ponerlas en su sitio no las saca de ahí. Si alguna es importante, lo seguro es cambiarla donde la sacaste. Pídeselo y te lo explica.</p>` : ''}
      ${boton({ etiqueta: 'Que las ordene', icono: '🧹', principal: true, accion: { tipo: 'pedir', prompt: sueltas.prompt } })}
    </div>` : '';

  if (!proveedores.length) {
    return `
      <p class="titulo">Conexiones (tools)</p>
      ${desordenadas}
      ${nada('Todavía no hay ninguna puesta en su sitio. Cuando le pidas al asistente que conecte tu correo, tu facturación o lo que uses, aparecerán aquí.')}
      ${boton({ etiqueta: 'Conectar algo', icono: '▸', principal: !sueltas, accion: { tipo: 'pedir', prompt: 'Quiero conectar una herramienta que uso. Pregúntame cuál y guíame paso a paso.' } })}
      ${volver()}`;
  }

  return `
    ${bloqueAviso()}
    ${volver()}
    <p class="titulo">Conexiones (tools)</p>
    ${desordenadas}
    ${proveedores.map((p) => boton({
      // Una que el asistente ha empezado y no ha terminado se dice, no se
      // disfraza de conexión con claves que no se pueden rellenar.
      etiqueta: p.aMedioHacer
        ? `${p.etiqueta} — sin preparar`
        : (p.faltan
          ? `${p.etiqueta} — ${plural(p.faltan, 'falta una clave', 'faltan {n} claves')}`
          : p.etiqueta),
      icono: p.aMedioHacer ? '◌' : (p.faltan ? '○' : '●'),
      accion: { tipo: 'verConexion', proveedor: p.id },
    })).join('')}
  `;
}

// Una herramienta: cómo se conecta, sus claves, su prueba y sus cositas.
function pantallaConexion({ proveedor, claves, cositas, aviso: avisoLocal }) {
  const faltaAlguna = claves.some((c) => !c.puesta);

  // Los pasos los escribe el asistente al investigar la herramienta. Se
  // enseñan mientras falte alguna clave: cuando ya está todo puesto, estorban.
  const guia = proveedor.pasos && proveedor.pasos.length && faltaAlguna
    ? `<ol class="guia">${proveedor.pasos.map((p) => `<li>${texto(p)}</li>`).join('')}</ol>`
    : '';

  const formularios = claves.length
    ? claves.map((c) => `
        <div class="conexion" data-proveedor="${atributo(proveedor.id)}">
          <p class="nombre">${texto(c.etiqueta)}</p>
          ${c.donde ? `<p class="donde">${texto(c.donde)}</p>` : ''}
          <p class="pista">${c.puesta ? `Puesta: ${texto(c.pista)}` : 'Todavía sin poner'}</p>
          <input type="${c.secreta ? 'password' : 'text'}" placeholder="${c.secreta ? 'Pega aquí la clave entera' : 'Escribe aquí el valor'}" data-clave="${atributo(c.clave)}">
          <div class="fila">
            ${boton({ etiqueta: 'Guardar', principal: true, accion: { tipo: 'guardarClave', proveedor: proveedor.id, clave: c.clave } })}
          </div>
        </div>`).join('')
    // Sin claves puede significar dos cosas muy distintas, y decir la que no es
    // manda al alumno a esperar algo que no va a pasar. Si el asistente copió
    // la plantilla y no la ha terminado, no hay nada que rellenar todavía: se
    // dice, y se le ofrece pedírselo, que es lo único que lo desbloquea.
    : (proveedor.aMedioHacer
      ? `${nada('El asistente ha empezado esta conexión y no la ha terminado: todavía no se sabe qué claves pide. Pídeselo y te las deja listas para rellenar.')}
         ${boton({ etiqueta: 'Que la termine', icono: '▸', principal: true, accion: { tipo: 'pedir', prompt: `Empezaste a conectar ${proveedor.etiqueta} y se quedó a medias: en 01-TOOLS/${proveedor.id}/ siguen los marcadores de la plantilla. Averigua qué claves pide de verdad esa herramienta, déjalas escritas y explícame de dónde saco cada una.` } })}`
      : nada('Esta conexión no pide ninguna clave.'));

  const lasCositas = cositas.length
    ? `<hr class="separador"><h2>Consultas</h2>` +
      cositas.map((c) => boton({
        etiqueta: c.etiqueta,
        icono: c.pideDatos ? '✎' : '▸',
        accion: { tipo: 'hacerCosita', proveedor: proveedor.id, fichero: c.fichero, etiqueta: c.etiqueta, pideDatos: c.pideDatos },
      })).join('')
    : '';

  return `
    ${bloqueAviso(avisoLocal)}
    ${volver({ tipo: 'verConexiones' })}
    <p class="titulo">${texto(proveedor.etiqueta)}</p>
    ${guia ? `<h2>Cómo conectarla</h2>${guia}` : ''}
    ${proveedor.ayuda && faltaAlguna ? boton({ etiqueta: 'Abrir su página para sacar la clave', icono: '↗', principal: true, accion: { tipo: 'abrir', url: proveedor.ayuda } }) : ''}
    ${faltaAlguna ? '<hr class="separador">' : ''}
    ${claves.length ? '<p class="detalle">Pega la clave entera. Los espacios y las comillas los quito yo.</p>' : ''}
    ${formularios}
    ${proveedor.ayuda && !faltaAlguna ? boton({ etiqueta: '¿Dónde consigo la clave?', icono: '❓', accion: { tipo: 'abrir', url: proveedor.ayuda } }) : ''}
    ${!proveedor.pasos.length ? boton({ etiqueta: 'Explícame cómo conectarla', icono: '💬', accion: { tipo: 'pedir', prompt: `Explícame paso a paso cómo conectar ${proveedor.etiqueta}: dónde entro, dónde saco cada clave y qué pego dónde. Y deja los pasos escritos para la próxima vez.` } }) : ''}
    ${boton({ etiqueta: 'Probar la conexión', icono: '🔎', accion: { tipo: 'probar', proveedor: proveedor.id } })}
    ${lasCositas}
  `;
}

function pantallaResultado({ titulo, texto: salida, proveedor }) {
  return `
    <p class="titulo">${texto(titulo)}</p>
    <pre class="salida">${texto(salida)}</pre>
    ${boton({ etiqueta: 'Pregúntale por esto', icono: '💬', principal: true, accion: { tipo: 'pedir', prompt: `Acabo de ver el resultado de "${titulo}". Explícamelo y dime si hay algo que deba hacer.` } })}
    ${/* Volver llevaba a la pantalla de las claves del programa, que es lo
          último que quiere ver quien acaba de mirar sus facturas. Se vuelve a
          la lista de programas, que es de donde se venía. */''}
    ${volver({ tipo: 'verConexiones' })}
    ${boton({ etiqueta: 'Otra consulta de este programa', icono: '▸', discreto: true, pequeno: true, accion: { tipo: 'verConexion', proveedor } })}
  `;
}

// ---------------------------------------------------------------- cerebro

function pantallaCerebro({ temas, sinOrdenar = [], esperando, yaLeidos, hayPanel, aviso: avisoLocal }) {
  const porTemas = temas.length
    ? temas.map((t) => `
        <div class="conexion">
          <p class="nombre">${texto(t.descripcion || t.etiqueta)}</p>
          <p class="pista">${texto(plural(t.articulos.length, '1 cosa que sabe', '{n} cosas que sabe'))}</p>
          ${boton({ etiqueta: 'Verlo', icono: '▸', accion: { tipo: 'verTema', tema: t.id } })}
        </div>`).join('')
    : nada('Todavía no sabe nada. Dale documentos o cuéntaselo en la conversación.');

  // Lo que está escrito pero el índice no menciona. Hasta ahora no había forma
  // de llegar a ello desde aquí: existía en el disco y punto.
  const sueltos = sinOrdenar.length
    ? `<hr class="separador"><h2>Sin ordenar todavía</h2>` +
      `<p class="detalle">${texto(plural(sinOrdenar.length,
        'Hay 1 documento escrito que aún no está en su tema.',
        'Hay {n} documentos escritos que aún no están en su tema.'))}</p>` +
      sinOrdenar.map((d) => boton({
        etiqueta: d.titulo,
        icono: '▸',
        accion: { tipo: 'leerArticulo', ruta: d.ruta },
      })).join('') +
      boton({
        etiqueta: 'Que los ordene',
        icono: '🗂️',
        discreto: true,
        accion: { tipo: 'pedir', prompt: 'Hay documentos en la wiki que no están en el índice. Ponlos en su tema, con su resumen y su fecha, y deja el índice al día.' },
      })
    : '';

  return `
    ${bloqueAviso(avisoLocal)}
    ${volver()}
    <p class="titulo">Lo que sabe de ${texto(comoSeLlama)}</p>
    ${cajaDeBusqueda('conceptos')}
    ${porTemas}

    <hr class="separador">
    ${boton({ etiqueta: 'Darle documentos', icono: '📎', principal: true, accion: { tipo: 'anadirDocumentos' } })}
    ${esperando ? `<p class="detalle">${texto(plural(esperando, 'Hay 1 documento esperando a que lo lea.', 'Hay {n} documentos esperando a que los lea.'))}</p>` : ''}
    ${yaLeidos ? `<p class="detalle">${texto(plural(yaLeidos, 'Ya ha leído 1 documento.', 'Ya ha leído {n} documentos.'))}</p>` : ''}
    ${hayPanel ? boton({ etiqueta: 'Ver el panel completo', icono: '🗂️', accion: { tipo: 'abrirPanelCompleto' } }) : ''}
    ${sueltos}

  `;
}

// Lo que ha salido de buscar. La caja se repinta con lo escrito dentro, así
// que se puede seguir tecleando y los resultados se van afinando solos.
function pantallaResultados({ texto: consulta, cuantos, grupos }) {
  const vacio = `
    ${nada(`No he encontrado nada con "${consulta}".`)}
    ${boton({
      etiqueta: 'Pregúntaselo al asistente',
      icono: '💬',
      principal: true,
      accion: { tipo: 'pedir', prompt: `He buscado "${consulta}" y no aparece nada. ¿Sabes algo de esto? Si no, dime qué necesitas para aprenderlo.` },
    })}`;

  const listas = grupos.map((g) => `
    <h2>${texto(g.titulo)}</h2>
    ${g.aciertos.map((a) => `
      <div class="conexion resultado">
        <p class="nombre">${resaltar(a.titulo, a.resaltar)}</p>
        ${a.frase ? `<p class="pista">${resaltar(a.frase, a.resaltar)}</p>` : ''}
        ${boton({ etiqueta: 'Verlo', icono: a.icono || '▸', accion: { ...a.accion, desde: 'buscar' } })}
      </div>`).join('')}`).join('');

  return `
    <p class="titulo">Lo que sabe de ${texto(comoSeLlama)}</p>
    ${volver({ tipo: 'verCerebro' })}
    ${cajaDeBusqueda(ultimoBuscado, consulta)}
    <p class="detalle">${texto(cuantos ? plural(cuantos, '1 resultado', '{n} resultados') : '')}</p>
    ${cuantos ? listas : vacio}
  `;
}

// Marcar lo buscado dentro de un texto, sin que marcarlo pueda convertirlo en
// etiquetas: se localiza sobre el texto crudo y se escapa cada trozo al
// pegarlo. Lo que se busca viene ya sin tildes y en minúsculas, así que hace
// falta un mapa de posiciones para saber a qué letra del original corresponde
// cada letra pelada (una "é" pelada ocupa una y en el original también, pero
// hay letras que al pelarse cambian de tamaño).
function pelarConMapa(valor) {
  let pelado = '';
  const mapa = [];
  for (let i = 0; i < valor.length; i += 1) {
    const trozo = valor[i].normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    for (const letra of trozo) { pelado += letra; mapa.push(i); }
  }
  mapa.push(valor.length);
  return { pelado, mapa };
}

function resaltar(valor, terminos = []) {
  const crudo = valor == null ? '' : String(valor);
  // Si llega una palabra suelta en vez de una lista, recorrerla daría letra a
  // letra y se marcaría medio texto.
  const lista = Array.isArray(terminos) ? terminos : [terminos];
  const { pelado, mapa } = pelarConMapa(crudo);

  const rangos = [];
  for (const termino of lista) {
    if (!termino) continue;
    let donde = pelado.indexOf(termino);
    while (donde !== -1) {
      rangos.push([mapa[donde], mapa[donde + termino.length]]);
      donde = pelado.indexOf(termino, donde + termino.length);
    }
  }
  if (!rangos.length) return texto(crudo);

  rangos.sort((a, b) => a[0] - b[0]);
  const limpios = [];
  for (const rango of rangos) {
    const ultimo = limpios[limpios.length - 1];
    if (ultimo && rango[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], rango[1]);
    else limpios.push([...rango]);
  }

  let salida = '';
  let cursor = 0;
  for (const [desde, hasta] of limpios) {
    salida += `${texto(crudo.slice(cursor, desde))}<mark>${texto(crudo.slice(desde, hasta))}</mark>`;
    cursor = hasta;
  }
  return salida + texto(crudo.slice(cursor));
}

function pantallaTema({ tema }) {
  return `
    ${migas([
      { etiqueta: 'Conocimiento', accion: { tipo: 'verCerebro' } },
      { etiqueta: tema.etiqueta },
    ])}
    ${volver({ tipo: 'verCerebro' })}
    <p class="titulo">${texto(tema.descripcion || tema.etiqueta)}</p>
    ${tema.articulos.map((a) => `
      <div class="conexion">
        <p class="nombre">${texto(a.titulo)}</p>
        ${a.resumen ? `<p class="pista">${texto(a.resumen)}</p>` : ''}
        ${boton({
          etiqueta: 'Leerlo',
          icono: '▸',
          accion: a.ruta.endsWith('.md')
            ? { tipo: 'leerArticulo', ruta: a.ruta, tema: tema.id }
            : { tipo: 'abrirFuera', ruta: a.ruta },
        })}
      </div>`).join('')}
  `;
}

// El artículo, dentro del panel. La vista previa de VS Code enseñaría primero
// su cabecera técnica, que es justo lo que aquí no se enseña nunca.
function pantallaArticulo({ titulo, cuerpo, tema, enlaces, hermanos, desde }) {
  const atras = desde === 'buscar'
    ? { tipo: 'buscar', texto: ultimaBusqueda }
    : (tema ? { tipo: 'verTema', tema } : { tipo: 'verCerebro' });

  const rastro = migas([
    { etiqueta: 'Conocimiento', accion: { tipo: 'verCerebro' } },
    desde === 'buscar' ? { etiqueta: `Buscando "${ultimaBusqueda}"`, accion: { tipo: 'buscar', texto: ultimaBusqueda } } : null,
    tema && desde !== 'buscar' ? { etiqueta: tema, accion: { tipo: 'verTema', tema } } : null,
    { etiqueta: titulo },
  ]);

  // Leer una cosa y tener que volver dos pantallas para leer la siguiente del
  // mismo tema era una tontería.
  const seguir = hermanos && (hermanos.anterior || hermanos.siguiente)
    ? `<div class="hermanos">
        ${hermanos.anterior ? boton({ etiqueta: hermanos.anterior.titulo, icono: '←', discreto: true, accion: { tipo: 'leerArticulo', ruta: hermanos.anterior.ruta, tema } }) : ''}
        ${hermanos.siguiente ? boton({ etiqueta: hermanos.siguiente.titulo, icono: '→', discreto: true, accion: { tipo: 'leerArticulo', ruta: hermanos.siguiente.ruta, tema } }) : ''}
      </div>`
    : '';

  return `
    ${rastro}
    ${volver(atras)}
    <p class="titulo">${texto(titulo)}</p>
    <div class="articulo">${comoMarkdown(cuerpo, enlaces)}</div>
    ${seguir}
    <hr class="separador">
    ${boton({ etiqueta: 'Pídele que lo cambie', icono: '✎', accion: { tipo: 'cambiarArticulo', titulo } })}
  `;
}

// ----------------------------------------------------------------- resto

function pantallaCopias({ copias }) {
  if (!copias.length) {
    return `<p class="titulo">Volver atrás</p>${nada('Todavía no has guardado ninguna copia.')}${volver()}`;
  }

  return `
    ${volver()}
    <p class="titulo">Volver atrás</p>
    <p class="detalle">Antes de mover nada guardo una copia de lo de ahora, así que esto también se puede deshacer.</p>
    ${copias.map((c) => boton({ etiqueta: c.etiqueta, icono: '↩️', accion: { tipo: 'volverA', id: c.id } })).join('')}
  `;
}

function pantallaIncidencia({ codigo, fichero, sano, hayQueTocarAlgo, faltaGit, comoSeInstalaGit }) {
  // Si lo que falta es git, arreglar el arnés no sirve de nada: la pieza no
  // está. Se dice eso y se ofrece ponerla, en vez de un botón que no puede.
  const queDigo = faltaGit
    ? 'Falta una pieza en este ordenador, y sin ella no puedo hacer casi nada.'
    : (sano ? 'He mirado y tu empresa está bien.' : 'He encontrado algo y puedo intentar arreglarlo.');

  return `
    <p class="titulo">Algo va mal</p>
    ${volver()}
    <p>${texto(queDigo)}</p>
    ${faltaGit ? `<p class="detalle">${texto(comoSeInstalaGit || '')}</p>` : ''}
    <p class="detalle">Si hablas con tu tutor, dale este código:</p>
    <span class="codigo">${texto(codigo)}</span>
    ${faltaGit
      ? boton({ etiqueta: 'Ponerla ahora', icono: '⬇️', principal: true, accion: { tipo: 'instalarGit' } })
      : (!sano || hayQueTocarAlgo ? boton({ etiqueta: 'Arreglarlo ahora', icono: '🛠️', principal: true, accion: { tipo: 'arreglar' } }) : '')}
    ${fichero ? boton({ etiqueta: 'Enseñar el informe', icono: '📄', accion: { tipo: 'verElInforme', fichero } }) : ''}
  `;
}

// ------------------------------------------------------------------ pintado

function pintar(html) {
  // Salvo la de la marca, que lo pone justo antes de pintar.
  if (!/El tema de mi empresa/.test(html)) dondeCaeLoQueSueltas = 'documentos';
  // Cualquier pantalla que no sea la de esperar para el reloj.
  if (!html.includes('data-cuanto')) pararElReloj();
  // Repintar tira el scroll al principio. Si se está en la misma pantalla —el
  // vigía repinta sola cuando el arnés escribe— se repone donde estaba.
  const desplazado = document.scrollingElement ? document.scrollingElement.scrollTop : 0;
  const mismaPantalla = html.slice(0, 200) === ultimoPintado.slice(0, 200);
  ultimoPintado = html;

  app.innerHTML = html;

  app.querySelectorAll('[data-accion]').forEach((b) => {
    b.addEventListener('click', () => {
      const accion = JSON.parse(b.dataset.accion);
      if (accion.tipo === 'guardarClave') {
        const campo = b.closest('.conexion').querySelector('input[data-clave]');
        if (!campo.value.trim()) return;
        accion.valor = campo.value;
      }
      aviso = null;
      pedir(accion.tipo, accion);
    });
  });

  engancharLaBusqueda();

  if (mismaPantalla && document.scrollingElement) document.scrollingElement.scrollTop = desplazado;
}

// La caja de buscar: se escribe y los resultados se van afinando solos, sin
// pulsar nada. Cada resultado repinta la pantalla entera —así es todo este
// panel— así que hay que devolver el cursor a donde estaba.
function engancharLaBusqueda() {
  const caja = app.querySelector('input[data-buscar]');
  if (!caja) return;

  if (caja.value) {
    caja.focus();
    caja.setSelectionRange(caja.value.length, caja.value.length);
  }

  // Cada caja busca en lo suyo y, al vaciarse, vuelve a su propia pantalla.
  const donde = caja.dataset.donde || 'conceptos';
  const aSuSitio = donde === 'papeles' ? 'verPapeles' : 'verCerebro';
  ultimoBuscado = donde;

  let reloj = null;
  caja.addEventListener('input', () => {
    clearTimeout(reloj);
    const loEscrito = caja.value;
    // Un cuarto de segundo: lo justo para no buscar a cada tecla y que siga
    // pareciendo instantáneo.
    reloj = setTimeout(() => {
      ultimaBusqueda = loEscrito;
      aviso = null;
      if (loEscrito.trim()) pedir('buscar', { texto: loEscrito, donde });
      else pedir(aSuSitio);
    }, 250);
  });

  caja.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    clearTimeout(reloj);
    ultimaBusqueda = '';
    pedir(aSuSitio);
  });
}

// Si pintar revienta, ANTES no pasaba nada visible: se quedaba la pantalla
// anterior puesta y la barra parecía colgada. Eso ha pasado dos veces y las dos
// hubo que descubrirlas mirando. Ahora un fallo se ve, y con salida.
function pintarElFallo(error) {
  pintar(`
    <p class="titulo">Algo no se ha podido pintar</p>
    <p>Se me ha atragantado esta pantalla. Lo de abajo es para tu tutor.</p>
    <p class="detalle">${texto(String((error && error.message) || error))}</p>
    ${boton({ etiqueta: 'Volver', icono: '←', principal: true, accion: { tipo: 'volver' } })}
  `);
}

window.addEventListener('message', ({ data }) => {
  try {
    return atender(data);
  } catch (error) {
    pintarElFallo(error);
    return undefined;
  }
});

function atender(data) {
  switch (data.tipo) {
    case 'cargando': return pintar(pantallaEsperando());
    case 'esperando':
      pintar(pantallaEsperando(data.que));
      return arrancarElReloj();
    case 'estado':
      estado = data.estado;
      accionesDescubiertas = data.acciones || [];
      puedeTenerBotones = data.puedeTenerBotones !== false;
      pulso = data.pulso || [];
      modo = data.modo || 'sencillo';
      marcaPuesta = data.marcaPuesta !== false;
      comoSeLlama = data.comoSeLlama || 'tu trabajo';
      return pintar(pantallaPrincipal());
    case 'conexiones': return pintar(pantallaConexiones(data));
    case 'conexion': return pintar(pantallaConexion(data));
    case 'resultado': return pintar(pantallaResultado(data));
    case 'cerebro':
      ultimaBusqueda = '';
      return pintar(pantallaCerebro(data));
    case 'resultados':
      ultimaBusqueda = data.texto;
      return pintar(pantallaResultados(data));
    case 'tema': return pintar(pantallaTema(data));
    case 'articulo': return pintar(pantallaArticulo(data));
    case 'copias': return pintar(pantallaCopias(data));
    case 'copiaFuera': return pintar(pantallaCopiaFuera(data));
    case 'radiografia': return pintar(pantallaRadiografia(data));
    case 'saberes': return pintar(pantallaSaberes(data));
    case 'salidas': return pintar(pantallaSalidas(data));
    case 'papeles': return pintar(pantallaPapeles(data));
    case 'fijadas': return pintar(pantallaFijadas(data));
    case 'ayuda': return pintar(pantallaAyuda(data));
    case 'reglas': return pintar(pantallaReglas(data));
    case 'asistente': return pintar(pantallaAsistente(data));
    case 'comoTrabaja': return pintar(pantallaComoTrabaja(data));
    case 'proyectos': return pintar(pantallaProyectos(data));
    case 'comandos': return pintar(pantallaComandos(data));
    case 'sugerencias': return pintar(pantallaSugerencias(data));
    case 'agentes': return pintar(pantallaAgentes(data));
    case 'laCara':
      dondeCaeLoQueSueltas = 'marca';
      return pintar(pantallaLaCara(data));
    case 'huecos': return pintar(pantallaHuecos(data));
    case 'diario': return pintar(pantallaDiario(data));
    case 'trato': return pintar(pantallaTrato(data));
    case 'incidencia': return pintar(pantallaIncidencia(data));
    case 'aviso':
      aviso = { texto: data.texto, malo: data.malo };
      return pintar(pantallaPrincipal());
    default:
      // Un mensaje que no conocemos no puede dejar la pantalla congelada: eso
      // fue exactamente lo que pasó cuando un campo `tipo` de los datos pisó el
      // del mensaje.
      return pintarElFallo(`No sé qué hacer con "${data.tipo}".`);
  }
}

pedir('listo');
