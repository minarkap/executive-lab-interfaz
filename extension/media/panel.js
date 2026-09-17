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
function enLinea(t) {
  return texto(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    // Los enlaces a otros artículos navegan por dentro; los de fuera, fuera.
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, rotulo, destino) => (
      /^https?:/.test(destino)
        ? `<a href="${atributo(destino)}">${rotulo}</a>`
        : `<span class="enlace-interno">${rotulo}</span>`
    ));
}

function comoMarkdown(fuente) {
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

// ---------------------------------------------------------------- pantallas

function pantallaEsperando(que = 'Un momento…') {
  return nada(que);
}

// Carpeta sin arnés: no está rota, es que aún no se ha montado.
function pantallaSinArnes() {
  return `
    ${bloqueAviso()}
    <div class="brujula">
      <h2>Dónde estás</h2>
      <p class="donde">${texto(estado.donde)}</p>
      <p class="hiciste">${texto(estado.aviso)}</p>
    </div>
    ${boton({ etiqueta: 'Preparar esta carpeta', icono: '✳', principal: true, accion: { tipo: 'arrancar' } })}
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

    ${documentos}
    ${descubiertos ? `<h2>Qué quieres hacer</h2>${descubiertos}<hr class="separador">` : ''}

    ${boton({ etiqueta: `Lo que sabe de ${comoSeLlama}`, icono: '📚', accion: { tipo: 'verCerebro' } })}
    ${boton({ etiqueta: 'Mis conexiones', icono: '🔌', accion: { tipo: 'verConexiones' } })}
    ${boton({ etiqueta: 'Guardar copia de seguridad', icono: '💾', accion: { tipo: 'guardarCopia' } })}
    ${boton({ etiqueta: 'Volver a como estaba antes', icono: '↩️', accion: { tipo: 'verCopias' } })}
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

function pantallaCerebro({ temas, aprendido, huecos, esperando, yaLeidos, hayPanel, aviso: avisoLocal }) {
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

  return `
    ${bloqueAviso(avisoLocal)}
    <p class="titulo">Lo que sabe de ${texto(comoSeLlama)}</p>
    ${porTemas}

    <hr class="separador">
    ${boton({ etiqueta: 'Darle documentos', icono: '📎', principal: true, accion: { tipo: 'anadirDocumentos' } })}
    ${esperando ? `<p class="detalle">${texto(plural(esperando, 'Hay 1 documento esperando a que lo lea.', 'Hay {n} documentos esperando a que los lea.'))}</p>` : ''}
    ${yaLeidos ? `<p class="detalle">${texto(plural(yaLeidos, 'Ya ha leído 1 documento.', 'Ya ha leído {n} documentos.'))}</p>` : ''}
    ${hayPanel ? boton({ etiqueta: 'Ver el panel completo', icono: '🗂️', accion: { tipo: 'abrirPanelCompleto' } }) : ''}
    ${ultimo}
    ${pendiente}

    <hr class="separador">
    ${volver()}
  `;
}

function pantallaTema({ tema }) {
  return `
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
function pantallaArticulo({ titulo, cuerpo, tema }) {
  return `
    <p class="titulo">${texto(titulo)}</p>
    <div class="articulo">${comoMarkdown(cuerpo)}</div>
    <hr class="separador">
    ${boton({ etiqueta: 'Pídele que lo cambie', icono: '✎', accion: { tipo: 'cambiarArticulo', titulo } })}
    ${volver(tema ? { tipo: 'verTema', tema } : { tipo: 'verCerebro' })}
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
  app.innerHTML = html;
  app.querySelectorAll('button[data-accion]').forEach((b) => {
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
    case 'cerebro': return pintar(pantallaCerebro(data));
    case 'tema': return pintar(pantallaTema(data));
    case 'articulo': return pintar(pantallaArticulo(data));
    case 'copias': return pintar(pantallaCopias(data));
    case 'incidencia': return pintar(pantallaIncidencia(data));
    case 'aviso':
      aviso = { texto: data.texto, malo: data.malo };
      return pintar(pantallaPrincipal());
    default:
  }
});

pedir('listo');
