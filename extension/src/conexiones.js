// "Mis conexiones": las credenciales de 01-TOOLS con cara de formulario.
//
// RSC guarda las credenciales por proveedor: cada carpeta de 01-TOOLS/ lleva
// su .env.example (qué claves espera), su .env (los valores reales, fuera de
// git) y su test_connection.sh. Aquí se leen las esperadas, se rellenan sin
// que el alumno abra un fichero oculto, y se prueban con el script que trae la
// propia carpeta: no inventamos cómo se comprueba nada.
//
// Aquí muere la mayor parte del soporte del curso. Pedirle a alguien que abra
// un fichero oculto y escriba CLAVE=valor sin comillas ni espacios falla más de
// lo que parece: sobra un espacio, sobran unas comillas, se pega con un salto
// de línea. Un campo de texto y un botón que dice sí o no lo arregla.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const procesos = require('./procesos');
const entorno = require('./entorno');

const CARPETA = '01-TOOLS';

// Nombres humanos para proveedores que reconocemos por el nombre de carpeta.
const PROVEEDORES = {
  anthropic: 'Claude', openai: 'OpenAI', stripe: 'Stripe', google: 'Google',
  gmail: 'Gmail', notion: 'Notion', slack: 'Slack', hubspot: 'HubSpot',
  shopify: 'Shopify', holded: 'Holded', twilio: 'Twilio', sendgrid: 'SendGrid',
  supabase: 'Supabase', airtable: 'Airtable', whatsapp: 'WhatsApp', telegram: 'Telegram',
};

// Qué es cada clave, por su sufijo. Lo que no esté aquí se muestra en crudo,
// pero mejor añadirlo que dejar que salga MAILCHIMP_API_KEY.
const SUFIJOS = [
  [/_(API_)?KEY$/, 'Clave de acceso'],
  [/_(API_)?SECRET$/, 'Clave secreta'],
  [/_(ACCESS_|AUTH_)?TOKEN$/, 'Clave de acceso'],
  [/_PASSWORD$/, 'Contraseña'],
  [/_(USER|USERNAME)$/, 'Usuario'],
  [/_(EMAIL|MAIL)$/, 'Correo'],
  [/_(ACCOUNT|ACCOUNT_ID|ACCOUNT_SID)$/, 'Cuenta'],
  [/_(URL|BASE_URL|ENDPOINT)$/, 'Dirección'],
  [/_DOMAIN$/, 'Dominio'],
  [/_REGION$/, 'Región'],
  [/_ENV$/, 'Entorno (test o production)'],
];

const ES_SECRETA = /(KEY|SECRET|TOKEN|PASSWORD)$/;

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').trim().toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function etiquetaDeClave(clave) {
  const mayus = clave.toUpperCase();
  const [, etiqueta] = SUFIJOS.find(([patron]) => patron.test(mayus)) || [];
  if (etiqueta) return etiqueta;
  const sinPrefijo = mayus.split('_').slice(1).join('_') || mayus;
  return humanizar(sinPrefijo);
}

// Nunca se devuelve una clave entera a la interfaz: solo los últimos cuatro
// caracteres, lo justo para que reconozcan cuál es.
function enmascarar(valor) {
  if (!valor) return '';
  return valor.length <= 4 ? '••••' : `••••${valor.slice(-4)}`;
}

function carpetaDe(proveedorId) {
  // Sin barras ni puntos: el id viene de la interfaz y nombra una carpeta.
  if (!/^[\w.-]+$/.test(proveedorId) || proveedorId.startsWith('_') || proveedorId.startsWith('.')) return null;
  const carpeta = proyecto.ruta(CARPETA, proveedorId);
  return carpeta && fs.existsSync(carpeta) ? carpeta : null;
}

// El README de cada proveedor empieza con "# Nombre". Si sigue siendo el
// marcador de la plantilla, se usa el nombre de la carpeta.
function etiquetaDeProveedor(id, carpeta) {
  try {
    const primera = fs.readFileSync(path.join(carpeta, 'README.md'), 'utf8').split('\n')[0] || '';
    const titulo = primera.replace(/^#\s*/, '').trim();
    if (titulo && !titulo.includes('<')) return titulo;
  } catch { /* sin README: caemos al nombre de la carpeta */ }
  return PROVEEDORES[id.toLowerCase()] || humanizar(id);
}

function leerEnv(fichero) {
  if (!fs.existsSync(fichero)) return new Map();
  const valores = new Map();
  for (const linea of fs.readFileSync(fichero, 'utf8').split('\n')) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#') || !limpia.includes('=')) continue;
    const corte = limpia.indexOf('=');
    valores.set(limpia.slice(0, corte).trim(), limpia.slice(corte + 1).trim().replace(/^["']|["']$/g, ''));
  }
  return valores;
}

// Dónde se consigue la clave, si la carpeta lo dice. CREDENTIALS.md trae la
// URL del panel del proveedor; .env.example, un "Generate at:".
function dondeSeConsigue(carpeta) {
  for (const [fichero, patron] of [
    ['CREDENTIALS.md', /^-?\s*URL:\s*(https?:\/\/\S+)/m],
    ['.env.example', /Generate at:\s*(https?:\/\/\S+)/],
  ]) {
    try {
      const url = (fs.readFileSync(path.join(carpeta, fichero), 'utf8').match(patron) || [])[1];
      if (url && !url.includes('...')) return url;
    } catch { /* siguiente */ }
  }
  return null;
}

function proveedores() {
  const base = proyecto.ruta(CARPETA);
  if (!base || !fs.existsSync(base)) return [];

  return fs.readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
    .map((e) => {
      const carpeta = path.join(base, e.name);
      const esperadas = leerEnv(path.join(carpeta, '.env.example'));
      const puestas = leerEnv(path.join(carpeta, '.env'));
      const faltan = [...esperadas.keys()].filter((k) => !puestas.get(k)).length;
      return {
        id: e.name,
        etiqueta: etiquetaDeProveedor(e.name, carpeta),
        faltan,
        tienePrueba: fs.readdirSync(carpeta).some((f) => f.startsWith('test_connection')),
        cositas: scripts(e.name).length,
      };
    })
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

// Las claves de un proveedor: las que espera (.env.example) más las que ya
// tenga puestas (.env), sin enseñar nunca el valor entero.
function claves(proveedorId) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return null;

  const esperadas = leerEnv(path.join(carpeta, '.env.example'));
  const puestas = leerEnv(path.join(carpeta, '.env'));
  const nombres = [...new Set([...esperadas.keys(), ...puestas.keys()])];

  return {
    proveedor: { id: proveedorId, etiqueta: etiquetaDeProveedor(proveedorId, carpeta), ayuda: dondeSeConsigue(carpeta) },
    claves: nombres.map((clave) => ({
      clave,
      etiqueta: etiquetaDeClave(clave),
      secreta: ES_SECRETA.test(clave.toUpperCase()),
      puesta: Boolean(puestas.get(clave)),
      pista: enmascarar(puestas.get(clave)),
    })),
  };
}

// Escribe en 01-TOOLS/<proveedor>/.env, creándolo desde el .env.example si
// hace falta y respetando comentarios y orden. Limpia por su cuenta lo que el
// alumno pegue de más: espacios, comillas y saltos de línea.
function escribir(proveedorId, clave, valorBruto) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return { ok: false, mensaje: 'Esa conexión ya no está.' };
  if (!/^[A-Z][A-Z0-9_]*$/i.test(clave)) return { ok: false, mensaje: 'Esa clave no tiene un nombre válido.' };

  const valor = String(valorBruto).trim().replace(/^["']|["']$/g, '').replace(/[\r\n]/g, '');
  const destino = path.join(carpeta, '.env');
  const base = fs.existsSync(destino) ? destino : path.join(carpeta, '.env.example');
  const lineas = fs.existsSync(base) ? fs.readFileSync(base, 'utf8').split('\n') : [];

  let encontrada = false;
  const nuevas = lineas.map((linea) => {
    if (linea.trim().startsWith(`${clave}=`)) {
      encontrada = true;
      return `${clave}=${valor}`;
    }
    return linea;
  });
  if (!encontrada) nuevas.push(`${clave}=${valor}`);

  fs.writeFileSync(destino, nuevas.join('\n').replace(/\n{3,}/g, '\n\n'));
  try { fs.chmodSync(destino, 0o600); } catch { /* Windows no lo admite; el 01-TOOLS/.gitignore ya lo protege de git */ }
  return { ok: true, mensaje: 'Guardado.' };
}

// Cada carpeta trae su propia prueba. Se ejecuta la que haya, con el
// intérprete que le toque, y solo se traduce el resultado.
// Cada script trae su intérprete. Los .sh de RSC piden bash —usan BASH_SOURCE
// y pipefail—, no sh.
async function lanzar(carpeta, fichero) {
  const ruta = path.join(carpeta, fichero);
  const opciones = { cwd: carpeta, tiempoMaximo: 45000 };
  if (fichero.endsWith('.sh')) return procesos.bash(ruta, opciones);
  if (fichero.endsWith('.py')) return procesos.ejecutar(entorno.ES_WINDOWS ? 'python' : 'python3', [ruta], opciones);
  return procesos.node([ruta], opciones);
}

async function probar(proveedorId) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return { ok: false, mensaje: 'Esa conexión ya no está.' };

  const prueba = fs.readdirSync(carpeta).find((f) => /^test_connection\.(sh|py|js|mjs)$/.test(f));
  if (!prueba) return { ok: false, mensaje: 'Esta conexión no trae forma de comprobarse. Pregúntaselo al asistente.' };

  const resultado = await lanzar(carpeta, prueba);

  if (resultado.codigo === 0) return { ok: true, mensaje: 'Conectado. Funciona.' };
  if (/missing .*\.env/i.test(resultado.error)) return { ok: false, mensaje: 'Todavía no has puesto ninguna clave para esta conexión.' };
  if (/not set/i.test(resultado.error)) return { ok: false, mensaje: 'Falta alguna clave por rellenar.' };
  return { ok: false, mensaje: 'No conecta. Revisa que la clave esté bien pegada, entera y sin espacios.' };
}

// ------------------------------------------------------ las cositas

// Verbos que solo miran. Se ejecutan directos porque no pueden romper nada, y
// porque esperar a que el asistente te lea una lista es justo la fricción que
// sobra. Se admiten en español y en inglés: la tabla la escribe el asistente,
// pero la plantilla de RSC viene en inglés.
const SOLO_MIRAN = /^(listar|ver|consultar|comprobar|mostrar|leer|test|list|show|check|get)[_-]/i;
const EJECUTABLES = /\.(sh|py|js|mjs)$/;

// El README de cada herramienta trae una tabla de scripts. No se busca por el
// título de la sección —nuestros raíles hacen que Claude la escriba en
// español— sino por las filas: primera celda con un nombre de fichero entre
// comillas invertidas que además existe en la carpeta.
function scripts(proveedorId) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return [];

  let readme;
  try {
    readme = fs.readFileSync(path.join(carpeta, 'README.md'), 'utf8');
  } catch {
    return [];
  }
  const hay = new Set(fs.readdirSync(carpeta));

  const encontrados = [];
  for (const linea of readme.split('\n')) {
    const fila = linea.match(/^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|/);
    if (!fila) continue;

    const fichero = fila[1].trim();
    // Las plantillas de RSC traen filas de ejemplo con marcadores.
    if (!EJECUTABLES.test(fichero) || /[{<]/.test(fichero) || !hay.has(fichero)) continue;
    if (fichero.startsWith('test_connection')) continue; // ese ya es "Probar la conexión"

    const queHace = fila[2].replace(/`/g, '').trim();
    const ejemplo = fila[3].replace(/`/g, '').trim();

    encontrados.push({
      fichero,
      // Sin descripción usable en el README, el nombre del fichero ya dice bastante.
      etiqueta: queHace && !/[{<]/.test(queHace) ? queHace : humanizar(fichero.replace(EJECUTABLES, '')),
      // Pide datos si el ejemplo lleva marcadores de argumento, o si el verbo
      // no es de los que solo miran.
      pideDatos: /[<{[]/.test(ejemplo) || !SOLO_MIRAN.test(fichero),
    });
  }
  return encontrados;
}

// Ejecuta uno de los que solo miran y devuelve su salida, recortada. Los que
// piden datos o tocan cosas no pasan por aquí: los pide el asistente, que
// pregunta lo que falte y pide permiso antes de cambiar nada.
async function ejecutar(proveedorId, fichero) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return { ok: false, mensaje: 'Esa conexión ya no está.' };

  const permitido = scripts(proveedorId).find((s) => s.fichero === fichero && !s.pideDatos);
  if (!permitido) return { ok: false, mensaje: 'Esto se lo tengo que pedir al asistente.' };

  const { codigo, salida, error } = await lanzar(carpeta, fichero);
  if (codigo !== 0) {
    if (/missing .*\.env/i.test(error)) return { ok: false, mensaje: 'Primero pon las claves de esta conexión.' };
    if (/not set/i.test(error)) return { ok: false, mensaje: 'Falta alguna clave por rellenar.' };
    return { ok: false, mensaje: 'No ha salido bien. Prueba a comprobar la conexión.' };
  }

  const texto = salida.trim();
  const lineas = texto.split('\n');
  return {
    ok: true,
    titulo: permitido.etiqueta,
    texto: lineas.length > 40 ? `${lineas.slice(0, 40).join('\n')}\n…` : texto,
    mensaje: texto ? null : 'Hecho, pero no ha devuelto nada.',
  };
}

module.exports = { proveedores, claves, escribir, probar, scripts, ejecutar, etiquetaDeClave, enmascarar };
