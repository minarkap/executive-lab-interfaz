// La interfaz de la barra lateral.
//
// Sin frameworks a propósito: son unas pocas pantallas y tienen que seguir
// funcionando dentro de cinco años sin que nadie actualice nada.

const vscode = acquireVsCodeApi();
const app = document.getElementById('app');

let estado = null;
let accionesDescubiertas = [];
let modo = 'sencillo';
let marcaPuesta = true;
let comoSeLlama = 'tu trabajo';
let aviso = null;
// Lo último que se buscó: desde un artículo abierto desde el buscador, el
// "Volver" tiene que devolver a los resultados, no a la lista de temas.
let ultimaBusqueda = '';
// Lo último que se pintó, para saber si un repintado es de la misma pantalla.
let ultimoPintado = '';

const pedir = (tipo, extra = {}) => vscode.postMessage({ tipo, ...extra });

// Todo lo que venga de fuera se escapa antes de pintarse. `texto` vale para el
// contenido; `atributo` escapa además las comillas, porque ahí sí rompen.
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapar(valor, patron) {
  return valor == null ? '' : String(valor).replace(patron, (c) => ESCAPES[c]);
}

const texto = (valor) => escapar(valor, /[&<>]/g);
const atributo = (valor) => escapar(valor, /[&<>"']/g);

function boton({ etiqueta, icono = '', accion, principal = false, discreto = false }) {
  const clases = [principal ? 'principal' : '', discreto ? 'discreto' : ''].filter(Boolean).join(' ');
  return `<button class="${clases}" data-accion="${atributo(JSON.stringify(accion))}">
    ${icono ? `<span class="icono" aria-hidden="true">${icono}</span>` : ''}
    <span class="texto">${texto(etiqueta)}</span>
  </button>`;
}

function bloqueAviso(cual = aviso) {
  if (!cual) return '';
  return `<div class="aviso ${cual.malo ? 'malo' : ''}">${texto(cual.texto)}</div>`;
}

const volver = (accion = { tipo: 'volver' }) => boton({ etiqueta: 'Volver', icono: '←', accion });

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
function cajaDeBusqueda(valor = '') {
  return `<input class="buscar" type="search" data-buscar value="${atributo(valor)}"
    placeholder="Busca lo que quieras: un cliente, una factura, una norma…"
    aria-label="Buscar">`;
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

    <div class="brujula">
      <h2>Qué hay en esta carpeta</h2>
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

    ${volver()}
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

    <div class="brujula">
      <h2>Una copia fuera de este ordenador</h2>
      <p class="hiciste">Las copias que guardas viven en este ordenador. Si se rompe o se pierde, se pierden con él. Una copia fuera es la misma copia, guardada además en internet, en un sitio privado que solo tú ves.</p>
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
      ? boton({ etiqueta: 'Guardar una copia fuera ahora', icono: '☁️', principal: true, accion: { tipo: 'subirCopia' } })
      : boton({ etiqueta: 'Entrar en mi cuenta', icono: '🔑', principal: true, accion: { tipo: 'conectarGitHub' } })}
    ${dentro ? '' : `<p class="detalle">¿No tienes cuenta? Se hace en dos minutos en github.com y es gratis.</p>`}
    ${volver()}
  `;
}

// ---------------------------------------------------------------- pantallas

function pantallaEsperando(que = 'Un momento…') {
  return nada(que);
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
      <h2>Dónde estás</h2>
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

  const detalle = [];
  if (estado.conectados) detalle.push(plural(estado.conectados, '1 conexión', '{n} conexiones'));
  if (estado.sabe) detalle.push(plural(estado.sabe, '1 cosa aprendida', '{n} cosas aprendidas'));

  // Los botones no están predefinidos: son los comandos que tenga esta
  // empresa, y el asistente va creando más conforme se repiten tareas.
  const descubiertos = accionesDescubiertas
    .map((a, i) => boton({ etiqueta: a.etiqueta, icono: a.icono, principal: i === 0, accion: { tipo: 'pedir', prompt: a.prompt } }))
    .join('');

  // Recién montado: lo primero es tener cuenta y sesión. Sin eso, el chat no
  // responde y el alumno se queda mirando una caja muda sin saber por qué.
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
    ${bloqueAviso()}
    <div class="brujula">
      <h2>Dónde estás</h2>
      <p class="donde">${texto(estado.donde)}</p>
      ${estado.hiciste ? `<p class="hiciste">${texto(estado.hiciste)}</p>` : ''}
      ${estado.aviso ? `<p class="hiciste">${texto(estado.aviso)}</p>` : ''}
      ${detalle.length ? `<p class="detalle">${texto(detalle.join(' · '))}</p>` : ''}
    </div>

    ${primerPaso}
    ${elConsejo}
    ${documentos}
    ${descubiertos ? `<h2>Qué quieres hacer</h2>${descubiertos}<hr class="separador">` : ''}

    ${boton({ etiqueta: `Lo que sabe de ${comoSeLlama}`, icono: '📚', accion: { tipo: 'verCerebro' } })}
    ${boton({ etiqueta: 'Mis conexiones', icono: '🔌', accion: { tipo: 'verConexiones' } })}
    ${estado.faltaGit ? '' : boton({ etiqueta: 'Guardar copia de seguridad', icono: '💾', accion: { tipo: 'guardarCopia' } })}
    ${estado.faltaGit ? '' : boton({ etiqueta: 'Volver a como estaba antes', icono: '↩️', accion: { tipo: 'verCopias' } })}
    ${estado.faltaGit ? '' : boton({ etiqueta: 'Guardar una copia fuera de este ordenador', icono: '☁️', accion: { tipo: 'verCopiaFuera' } })}
    ${estado.faltaGit ? bloqueFaltaGit() : ''}
    ${boton({ etiqueta: 'Qué hay en esta carpeta', icono: '🔎', accion: { tipo: 'verRadiografia' } })}
    ${boton({ etiqueta: 'Algo va mal', icono: '🆘', accion: { tipo: 'algoVaMal' } })}

    <hr class="separador">
    ${boton({ etiqueta: 'Cambiar de carpeta', icono: '📂', discreto: true, accion: { tipo: 'elegirCarpeta' } })}
    ${marcaPuesta ? '' : boton({
      etiqueta: 'Ponerle la cara de tu empresa',
      icono: '🎨',
      discreto: true,
      accion: { tipo: 'ponerLaCara' },
    })}
    ${modo === 'avanzado'
      ? boton({ etiqueta: 'Volver al modo sencillo', icono: '◂', discreto: true, accion: { tipo: 'modoSencillo' } })
      : boton({ etiqueta: 'Ver el editor completo', icono: '▸', discreto: true, accion: { tipo: 'verEditorCompleto' } })}
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
      ${boton({ etiqueta: 'Que las ordene', icono: '🧹', principal: true, accion: { tipo: 'pedir', prompt: sueltas.prompt } })}
    </div>` : '';

  if (!proveedores.length) {
    return `
      <p class="titulo">Mis conexiones</p>
      ${desordenadas}
      ${nada('Todavía no hay ninguna puesta en su sitio. Cuando le pidas al asistente que conecte tu correo, tu facturación o lo que uses, aparecerán aquí.')}
      ${boton({ etiqueta: 'Conectar algo', icono: '▸', principal: !sueltas, accion: { tipo: 'pedir', prompt: 'Quiero conectar una herramienta que uso. Pregúntame cuál y guíame paso a paso.' } })}
      ${volver()}`;
  }

  return `
    ${bloqueAviso()}
    <p class="titulo">Mis conexiones</p>
    ${desordenadas}
    ${proveedores.map((p) => boton({
      etiqueta: p.faltan
        ? `${p.etiqueta} — ${plural(p.faltan, 'falta una clave', 'faltan {n} claves')}`
        : p.etiqueta,
      icono: p.faltan ? '○' : '●',
      accion: { tipo: 'verConexion', proveedor: p.id },
    })).join('')}
    <hr class="separador">
    ${volver()}
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
    : nada('Esta conexión no pide ninguna clave.');

  const lasCositas = cositas.length
    ? `<hr class="separador"><h2>Qué puedes hacer con esto</h2>` +
      cositas.map((c) => boton({
        etiqueta: c.etiqueta,
        icono: c.pideDatos ? '✎' : '▸',
        accion: { tipo: 'hacerCosita', proveedor: proveedor.id, fichero: c.fichero, etiqueta: c.etiqueta, pideDatos: c.pideDatos },
      })).join('')
    : '';

  return `
    ${bloqueAviso(avisoLocal)}
    <p class="titulo">${texto(proveedor.etiqueta)}</p>
    ${guia ? `<h2>Cómo conectarla</h2>${guia}` : ''}
    ${proveedor.ayuda && faltaAlguna ? boton({ etiqueta: 'Abrir su página para sacar la clave', icono: '↗', principal: true, accion: { tipo: 'abrir', url: proveedor.ayuda } }) : ''}
    ${faltaAlguna ? '<hr class="separador">' : ''}
    <p class="detalle">Pega la clave entera. Los espacios y las comillas los quito yo.</p>
    ${formularios}
    ${proveedor.ayuda && !faltaAlguna ? boton({ etiqueta: '¿Dónde consigo la clave?', icono: '❓', accion: { tipo: 'abrir', url: proveedor.ayuda } }) : ''}
    ${!proveedor.pasos.length ? boton({ etiqueta: 'Explícame cómo conectarla', icono: '💬', accion: { tipo: 'pedir', prompt: `Explícame paso a paso cómo conectar ${proveedor.etiqueta}: dónde entro, dónde saco cada clave y qué pego dónde. Y deja los pasos escritos para la próxima vez.` } }) : ''}
    ${boton({ etiqueta: 'Probar la conexión', icono: '🔎', accion: { tipo: 'probar', proveedor: proveedor.id } })}
    ${lasCositas}
    <hr class="separador">
    ${volver({ tipo: 'verConexiones' })}
  `;
}

function pantallaResultado({ titulo, texto: salida, proveedor }) {
  return `
    <p class="titulo">${texto(titulo)}</p>
    <pre class="salida">${texto(salida)}</pre>
    ${boton({ etiqueta: 'Pregúntale por esto', icono: '💬', principal: true, accion: { tipo: 'pedir', prompt: `Acabo de ver el resultado de "${titulo}". Explícamelo y dime si hay algo que deba hacer.` } })}
    ${volver({ tipo: 'verConexion', proveedor })}
  `;
}

// ---------------------------------------------------------------- cerebro

function pantallaCerebro({ temas, sinOrdenar = [], aprendido, huecos, esperando, yaLeidos, hayPanel, aviso: avisoLocal }) {
  const porTemas = temas.length
    ? temas.map((t) => `
        <div class="conexion">
          <p class="nombre">${texto(t.descripcion || t.etiqueta)}</p>
          <p class="pista">${texto(plural(t.articulos.length, '1 cosa que sabe', '{n} cosas que sabe'))}</p>
          ${boton({ etiqueta: 'Verlo', icono: '▸', accion: { tipo: 'verTema', tema: t.id } })}
        </div>`).join('')
    : nada('Todavía no sabe nada. Dale documentos o cuéntaselo en la conversación.');

  const ultimo = aprendido.length
    ? `<hr class="separador"><h2>Qué ha aprendido últimamente</h2><ul class="lista">` +
      aprendido.map((a) => `<li>${texto(a.titulo)}<span class="cuando">${texto(cuando(a.fecha))}</span></li>`).join('') +
      '</ul>'
    : '';

  // Los huecos se pulsan: cada uno es algo que le falta y que el alumno puede
  // contarle ahora mismo. Una lista de carencias que no se puede tocar solo
  // sirve para quedarse mal.
  const pendiente = huecos.length
    ? `<hr class="separador"><h2>Lo que aún no sabe</h2>` +
      `<p class="detalle">Pulsa cualquiera para contárselo.</p>` +
      huecos.map((h) => boton({
        etiqueta: h,
        icono: '?',
        accion: { tipo: 'pedir', prompt: `Quiero contarte lo que te falta saber: ${h}. Pregúntame lo que necesites y guárdalo.` },
      })).join('')
    : '';

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
    <p class="titulo">Lo que sabe de ${texto(comoSeLlama)}</p>
    ${cajaDeBusqueda()}
    ${porTemas}

    <hr class="separador">
    ${boton({ etiqueta: 'Darle documentos', icono: '📎', principal: true, accion: { tipo: 'anadirDocumentos' } })}
    ${esperando ? `<p class="detalle">${texto(plural(esperando, 'Hay 1 documento esperando a que lo lea.', 'Hay {n} documentos esperando a que los lea.'))}</p>` : ''}
    ${yaLeidos ? `<p class="detalle">${texto(plural(yaLeidos, 'Ya ha leído 1 documento.', 'Ya ha leído {n} documentos.'))}</p>` : ''}
    ${hayPanel ? boton({ etiqueta: 'Ver el panel completo', icono: '🗂️', accion: { tipo: 'abrirPanelCompleto' } }) : ''}
    ${sueltos}
    ${ultimo}
    ${pendiente}

    <hr class="separador">
    ${volver()}
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
    ${cajaDeBusqueda(consulta)}
    <p class="detalle">${texto(cuantos ? plural(cuantos, '1 resultado', '{n} resultados') : '')}</p>
    ${cuantos ? listas : vacio}
    <hr class="separador">
    ${volver({ tipo: 'verCerebro' })}
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
      { etiqueta: `Lo que sabe de ${comoSeLlama}`, accion: { tipo: 'verCerebro' } },
      { etiqueta: tema.etiqueta },
    ])}
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
    <hr class="separador">
    ${volver({ tipo: 'verCerebro' })}
  `;
}

// El artículo, dentro del panel. La vista previa de VS Code enseñaría primero
// su cabecera técnica, que es justo lo que aquí no se enseña nunca.
function pantallaArticulo({ titulo, cuerpo, tema, enlaces, hermanos, desde }) {
  const atras = desde === 'buscar'
    ? { tipo: 'buscar', texto: ultimaBusqueda }
    : (tema ? { tipo: 'verTema', tema } : { tipo: 'verCerebro' });

  const rastro = migas([
    { etiqueta: `Lo que sabe de ${comoSeLlama}`, accion: { tipo: 'verCerebro' } },
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
    <p class="titulo">${texto(titulo)}</p>
    <div class="articulo">${comoMarkdown(cuerpo, enlaces)}</div>
    ${seguir}
    <hr class="separador">
    ${boton({ etiqueta: 'Pídele que lo cambie', icono: '✎', accion: { tipo: 'cambiarArticulo', titulo } })}
    ${volver(atras)}
  `;
}

// ----------------------------------------------------------------- resto

function pantallaCopias({ copias }) {
  if (!copias.length) {
    return `<p class="titulo">Volver atrás</p>${nada('Todavía no has guardado ninguna copia.')}${volver()}`;
  }

  return `
    <p class="titulo">Volver atrás</p>
    <p class="detalle">Antes de mover nada guardo una copia de lo de ahora, así que esto también se puede deshacer.</p>
    ${copias.map((c) => boton({ etiqueta: c.etiqueta, icono: '↩️', accion: { tipo: 'volverA', id: c.id } })).join('')}
    <hr class="separador">
    ${volver()}
  `;
}

function pantallaIncidencia({ codigo, sano, hayQueTocarAlgo }) {
  return `
    <p class="titulo">Algo va mal</p>
    <p>${texto(sano ? 'He mirado y tu empresa está bien.' : 'He encontrado algo y puedo intentar arreglarlo.')}</p>
    <p class="detalle">Si hablas con tu tutor, dale este código:</p>
    <span class="codigo">${texto(codigo)}</span>
    ${!sano || hayQueTocarAlgo ? boton({ etiqueta: 'Arreglarlo ahora', icono: '🛠️', principal: true, accion: { tipo: 'arreglar' } }) : ''}
    ${volver()}
  `;
}

// ------------------------------------------------------------------ pintado

function pintar(html) {
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

  let reloj = null;
  caja.addEventListener('input', () => {
    clearTimeout(reloj);
    const loEscrito = caja.value;
    // Un cuarto de segundo: lo justo para no buscar a cada tecla y que siga
    // pareciendo instantáneo.
    reloj = setTimeout(() => {
      ultimaBusqueda = loEscrito;
      aviso = null;
      if (loEscrito.trim()) pedir('buscar', { texto: loEscrito });
      else pedir('verCerebro');
    }, 250);
  });

  caja.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') return;
    clearTimeout(reloj);
    ultimaBusqueda = '';
    pedir('verCerebro');
  });
}

window.addEventListener('message', ({ data }) => {
  switch (data.tipo) {
    case 'cargando': return pintar(pantallaEsperando());
    case 'esperando': return pintar(pantallaEsperando(data.que));
    case 'estado':
      estado = data.estado;
      accionesDescubiertas = data.acciones || [];
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
    case 'incidencia': return pintar(pantallaIncidencia(data));
    case 'aviso':
      aviso = { texto: data.texto, malo: data.malo };
      return pintar(pantallaPrincipal());
    default:
  }
});

pedir('listo');
