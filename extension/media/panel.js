// La interfaz de la barra lateral.
//
// Sin frameworks a propósito: son cinco pantallas y tienen que seguir
// funcionando dentro de cinco años sin que nadie actualice nada.

const vscode = acquireVsCodeApi();
const app = document.getElementById('app');

let estado = null;
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

function boton({ etiqueta, icono = '', accion, principal = false }) {
  return `<button class="${principal ? 'principal' : ''}" data-accion="${atributo(JSON.stringify(accion))}">
    ${icono ? `<span class="icono" aria-hidden="true">${icono}</span>` : ''}
    <span>${texto(etiqueta)}</span>
  </button>`;
}

function bloqueAviso(cual = aviso) {
  if (!cual) return '';
  return `<div class="aviso ${cual.malo ? 'malo' : ''}">${texto(cual.texto)}</div>`;
}

const botonVolver = (accion = { tipo: 'volver' }) => boton({ etiqueta: 'Volver', icono: '←', accion });

// ---------------------------------------------------------------- pantallas

function pantallaCargando(que = 'Un momento…') {
  return `<p class="cargando">${texto(que)}</p>`;
}

function pantallaPrincipal() {
  if (!estado) return pantallaCargando();

  const detalle = [];
  if (estado.conectados) detalle.push(`${estado.conectados} ${estado.conectados === 1 ? 'conexión' : 'conexiones'}`);
  if (estado.sabe) detalle.push(`${estado.sabe} ${estado.sabe === 1 ? 'cosa aprendida' : 'cosas aprendidas'} de tu empresa`);

  const sugerencias = (estado.siguiente || [])
    .map((s, i) => boton({ etiqueta: s.etiqueta, icono: '▸', principal: i === 0, accion: { tipo: 'pedir', prompt: s.prompt } }))
    .join('');

  return `
    ${bloqueAviso()}
    <div class="brujula">
      <h2>Dónde estás</h2>
      <p class="donde">${texto(estado.donde)}</p>
      ${estado.hiciste ? `<p class="hiciste">${texto(estado.hiciste)}</p>` : ''}
      ${estado.aviso ? `<p class="hiciste">${texto(estado.aviso)}</p>` : ''}
      ${detalle.length ? `<p class="detalle">${texto(detalle.join(' · '))}</p>` : ''}
    </div>

    ${estado.listo ? `<h2>Qué quieres hacer</h2>${sugerencias}<hr class="separador">` : ''}

    ${boton({ etiqueta: 'Mis conexiones', icono: '🔌', accion: { tipo: 'verConexiones' } })}
    ${boton({ etiqueta: 'Guardar copia de seguridad', icono: '💾', accion: { tipo: 'guardarCopia' } })}
    ${boton({ etiqueta: 'Volver a como estaba antes', icono: '↩️', accion: { tipo: 'verCopias' } })}
    ${boton({ etiqueta: 'Algo va mal', icono: '🆘', accion: { tipo: 'algoVaMal' } })}
  `;
}

// La lista de proveedores. Cada uno dice cuántas claves le faltan.
function pantallaConexiones({ proveedores }) {
  if (!proveedores.length) {
    return `
      <h2>Mis conexiones</h2>
      <p class="cargando">Todavía no hay ninguna conexión. Cuando le pidas al asistente que conecte tu correo, tu facturación o tu tienda, aparecerán aquí.</p>
      ${boton({ etiqueta: 'Conectar algo nuevo', icono: '▸', principal: true, accion: { tipo: 'pedir', prompt: 'Quiero conectar una herramienta que uso en mi empresa. Pregúntame cuál y guíame paso a paso.' } })}
      ${botonVolver()}`;
  }

  return `
    ${bloqueAviso()}
    <h2>Mis conexiones</h2>
    ${proveedores.map((p) => boton({
      etiqueta: p.faltan ? `${p.etiqueta} — ${p.faltan === 1 ? 'falta una clave' : `faltan ${p.faltan} claves`}` : p.etiqueta,
      icono: p.faltan ? '○' : '●',
      accion: { tipo: 'verConexion', proveedor: p.id },
    })).join('')}
    <hr class="separador">
    ${botonVolver()}
  `;
}

// Un proveedor: sus claves como formulario, y su prueba.
function pantallaConexion({ proveedor, claves, aviso: avisoLocal }) {
  const formularios = claves.length
    ? claves.map((c) => `
        <div class="conexion" data-proveedor="${atributo(proveedor.id)}">
          <p class="nombre">${texto(c.etiqueta)}</p>
          <p class="pista">${c.puesta ? `Puesta: ${texto(c.pista)}` : 'Todavía sin poner'}</p>
          <input type="${c.secreta ? 'password' : 'text'}" placeholder="${c.secreta ? 'Pega aquí la clave entera' : 'Escribe aquí el valor'}" data-clave="${atributo(c.clave)}">
          <div class="fila">
            ${boton({ etiqueta: 'Guardar', principal: true, accion: { tipo: 'guardarClave', proveedor: proveedor.id, clave: c.clave } })}
          </div>
        </div>`).join('')
    : '<p class="cargando">Esta conexión no pide ninguna clave.</p>';

  return `
    ${bloqueAviso(avisoLocal)}
    <h2>${texto(proveedor.etiqueta)}</h2>
    <p class="detalle">Pega la clave entera. Los espacios y las comillas los quito yo.</p>
    ${formularios}
    ${proveedor.ayuda ? boton({ etiqueta: '¿Dónde consigo la clave?', icono: '❓', accion: { tipo: 'abrir', url: proveedor.ayuda } }) : ''}
    ${boton({ etiqueta: 'Probar la conexión', icono: '🔎', accion: { tipo: 'probar', proveedor: proveedor.id } })}
    <hr class="separador">
    ${botonVolver({ tipo: 'verConexiones' })}
  `;
}

function pantallaCopias({ copias }) {
  if (!copias.length) {
    return `
      <h2>Volver atrás</h2>
      <p class="cargando">Todavía no has guardado ninguna copia.</p>
      ${botonVolver()}`;
  }

  return `
    <h2>Volver atrás</h2>
    <p class="detalle">Antes de mover nada guardo una copia de lo de ahora, así que esto también se puede deshacer.</p>
    ${copias.map((c) => boton({ etiqueta: c.etiqueta, icono: '↩️', accion: { tipo: 'volverA', id: c.id } })).join('')}
    <hr class="separador">
    ${botonVolver()}
  `;
}

function pantallaIncidencia({ codigo, sano, hayQueTocarAlgo }) {
  const titular = sano ? 'He mirado y tu empresa está bien.' : 'He encontrado algo y puedo intentar arreglarlo.';

  return `
    <h2>Algo va mal</h2>
    <p>${texto(titular)}</p>
    <p class="detalle">Si hablas con tu tutor, dale este código:</p>
    <span class="codigo">${texto(codigo)}</span>
    ${!sano || hayQueTocarAlgo ? boton({ etiqueta: 'Arreglarlo ahora', icono: '🛠️', principal: true, accion: { tipo: 'arreglar' } }) : ''}
    ${botonVolver()}
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
    case 'cargando': return pintar(pantallaCargando());
    case 'revisando': return pintar(pantallaCargando('Estoy mirando qué pasa. Tarda un poco.'));
    case 'probando': return pintar(pantallaCargando('Probando la conexión…'));
    case 'estado':
      estado = data.estado;
      return pintar(pantallaPrincipal());
    case 'conexiones': return pintar(pantallaConexiones(data));
    case 'conexion': return pintar(pantallaConexion(data));
    case 'copias': return pintar(pantallaCopias(data));
    case 'incidencia': return pintar(pantallaIncidencia(data));
    case 'aviso':
      aviso = { texto: data.texto, malo: data.malo };
      return pintar(pantallaPrincipal());
    default:
  }
});

pedir('listo');
