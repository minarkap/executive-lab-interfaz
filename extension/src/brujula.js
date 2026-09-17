// La brújula: dónde estás, qué acabas de hacer, qué puedes hacer ahora.
//
// Decisión importante: esto NO se lee de la conversación de Claude. Se deriva
// del disco — el checkpoint de RSC, la última copia de seguridad y lo que haya
// en 02-DOCS. Así la barra lateral no depende de la interfaz de Anthropic y
// sigue funcionando cuando ellos cambien su panel.
//
// La skill `orient` de RSC hace lo mismo dentro de la conversación. Aquí se
// repite fuera, en forma de pantalla, porque leer un párrafo y ver un botón no
// cuestan lo mismo cuando no sabes qué estás haciendo.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const rsc = require('./rsc');
const guardar = require('./guardar');
const conexiones = require('./conexiones');

// Nombres del diccionario para las dos carpetas del arnés.
const ZONAS = { '02-DOCS': 'Lo que sabe de tu empresa', '01-TOOLS': 'Conexiones' };

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').trim().toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function cuantoSabeDeTuEmpresa() {
  const wiki = proyecto.ruta('02-DOCS', 'wiki');
  if (!wiki || !fs.existsSync(wiki)) return 0;

  let cuenta = 0;
  const recorrer = (carpeta) => {
    for (const entrada of fs.readdirSync(carpeta, { withFileTypes: true })) {
      if (entrada.name.startsWith('.') || entrada.name === 'harness') continue;
      const completa = path.join(carpeta, entrada.name);
      if (entrada.isDirectory()) recorrer(completa);
      else if (entrada.name.endsWith('.md') && entrada.name !== 'index.md') cuenta += 1;
    }
  };
  try { recorrer(wiki); } catch { /* si no se puede leer, cero y a otra cosa */ }
  return cuenta;
}

// Las rutas que tocó la última sesión, traducidas a zonas del diccionario.
// Una ruta cruda no aparece nunca en pantalla.
function zonasTocadas(rutas) {
  const zonas = new Set();
  for (const ruta of rutas) {
    const partes = ruta.split('/').filter(Boolean);
    if (!partes.length || partes[0].startsWith('.')) continue;

    if (partes[0] === '02-DOCS') {
      const tema = partes[1] === 'wiki' && partes[2] && !partes[2].includes('.') && partes[2] !== 'harness';
      zonas.add(tema ? `${ZONAS['02-DOCS']} (${humanizar(partes[2])})` : ZONAS['02-DOCS']);
    } else if (partes[0] === '01-TOOLS') {
      const proveedor = partes[1] && !partes[1].startsWith('_');
      zonas.add(proveedor ? `${ZONAS['01-TOOLS']} (${humanizar(partes[1])})` : ZONAS['01-TOOLS']);
    } else if (partes.length > 1) {
      zonas.add(humanizar(partes[0]));
    }
  }
  return [...zonas];
}

// La continuación de RSC llega como líneas "clave: valor". Solo nos interesa
// por dónde andaba la persona.
function interpretar(continuacion) {
  if (!continuacion) return null;
  const campos = {};
  for (const linea of continuacion.split('\n')) {
    const corte = linea.indexOf(': ');
    if (corte > 0) campos[linea.slice(0, corte).trim()] = linea.slice(corte + 2).trim();
  }
  const rutas = campos.files && campos.files !== 'none' ? campos.files.split(', ') : [];
  const zonas = zonasTocadas(rutas);
  return zonas.length ? zonas.slice(0, 2).join(' · ') : null;
}

const SUGERENCIAS_DE_ARRANQUE = [
  { etiqueta: 'Cuéntale a qué se dedica tu empresa', prompt: 'Quiero que sepas a qué se dedica mi empresa. Pregúntame lo que necesites, de una pregunta en una pregunta.' },
  { etiqueta: 'Conectar el correo', prompt: 'Quiero conectar mi correo para que puedas trabajar con él. Guíame paso a paso.' },
  { etiqueta: 'Organizar mis facturas', prompt: 'Quiero organizar las facturas de mi empresa. Empieza preguntándome cómo las llevo ahora.' },
];

const SUGERENCIAS_HABITUALES = [
  { etiqueta: 'Seguir donde lo dejé', prompt: 'Recuérdame en qué estábamos y sigamos por donde lo dejamos.' },
  { etiqueta: 'Enseñarle algo nuevo', prompt: 'Quiero que aprendas a hacer algo nuevo para mi empresa. Pregúntame qué necesito y propón cómo hacerlo.' },
];

// Calcular el estado lanza procesos; no hace falta repetirlo cada vez que la
// barra parpadea. Veinte segundos de memoria bastan.
let ultimo = { cuando: 0, estado: null };

async function estado({ fresco = false } = {}) {
  if (!fresco && ultimo.estado && Date.now() - ultimo.cuando < 20000) return ultimo.estado;
  const calculado = await calcular();
  ultimo = { cuando: Date.now(), estado: calculado };
  return calculado;
}

async function calcular() {
  if (!proyecto.raiz()) {
    return { listo: false, donde: 'No encuentro tu empresa', hiciste: null, aviso: 'No hay ninguna carpeta de trabajo abierta.', siguiente: [] };
  }

  if (!proyecto.arnesCompleto()) {
    return {
      listo: false,
      donde: 'Tu espacio está a medio preparar',
      hiciste: null,
      aviso: 'Falta parte de la preparación inicial. Pulsa "Algo va mal" y lo dejo listo.',
      siguiente: [],
    };
  }

  const [continuacion, copias] = await Promise.all([rsc.retomar(), guardar.copias(1)]);
  const sabe = cuantoSabeDeTuEmpresa();
  const conectados = conexiones.proveedores().length;
  const arrancando = conectados === 0 && sabe === 0;

  return {
    listo: true,
    donde: interpretar(continuacion) || (arrancando ? 'Acabas de empezar' : 'Tu empresa'),
    hiciste: copias.length ? `Guardaste una copia ${guardar.haceCuanto(copias[0].cuando)}` : null,
    sabe,
    conectados,
    siguiente: arrancando ? SUGERENCIAS_DE_ARRANQUE : SUGERENCIAS_HABITUALES,
  };
}

module.exports = { estado, interpretar, zonasTocadas };
