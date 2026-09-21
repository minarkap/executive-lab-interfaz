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
  [/_(URL|BASE_URL|ENDPOINT|HOST)$/, 'Dirección'],
  [/_(DB|DATABASE)$/, 'Base de datos'],
  [/_PORT$/, 'Puerto'],
  [/_DOMAIN$/, 'Dominio'],
  [/_REGION$/, 'Región'],
  [/_(WORKSPACE|TEAM|ORG|COMPANY)(_ID)?$/, 'Espacio de trabajo'],
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
  // Una sigla corta se queda como está: "Db" no es una palabra, "DB" sí se
  // reconoce. Lo demás se humaniza.
  return sinPrefijo.length <= 3 ? sinPrefijo : humanizar(sinPrefijo);
}

// Nunca se devuelve una clave entera a la interfaz: solo los últimos cuatro
// caracteres, lo justo para que reconozcan cuál es.
function enmascarar(valor) {
  if (!valor) return '';
  return valor.length <= 4 ? '••••' : `••••${valor.slice(-4)}`;
}

// ── Qué nombre de carpeta vale ───────────────────────────────────────────
//
// Esto exigía `/^[\w.-]+$/`, y `\w` es `[A-Za-z0-9_]`: ni acentos, ni eñes, ni
// espacios. En un producto para alumnos **españoles**, con un asistente al que
// le imponemos escribir en español, eso significaba que `01-TOOLS/Señal/` o
// `01-TOOLS/Correo-Electrónico/` salían en la lista —`proveedores()` lista
// cualquier carpeta— y al abrirlas no había nada. Al intentar guardar una
// clave la barra contestaba «Esa conexión ya no está», que además de falso
// hace pensar que se ha borrado sola.
//
// La comprobación estaba para una cosa buena: que un id venido de la interfaz
// no se salga de `01-TOOLS`. Pero una lista blanca de letras no es la forma de
// pedir eso — se mira dónde cae la ruta de verdad, que es más seguro y no deja
// fuera media lengua.
function carpetaDe(proveedorId) {
  if (typeof proveedorId !== 'string' || !proveedorId.trim()) return null;
  // Un nombre de carpeta, no una ruta: nada de barras ni de subir por el árbol.
  if (/[\\/]/.test(proveedorId) || proveedorId === '..') return null;
  // `_TEMPLATE` es la plantilla y lo que empieza por punto no se enseña, igual
  // que en `proveedores()`.
  if (proveedorId.startsWith('_') || proveedorId.startsWith('.')) return null;

  const base = proyecto.ruta(CARPETA);
  if (!base) return null;

  // Y el cinturón: caiga donde caiga, tiene que quedar dentro de 01-TOOLS.
  const completa = path.resolve(base, proveedorId);
  if (!completa.startsWith(path.resolve(base) + path.sep)) return null;

  return fs.existsSync(completa) ? completa : null;
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

// ── Cómo se escriben los `.env` de verdad ────────────────────────────────
//
// Probando con arneses nuevos salieron dos formas que esto leía mal, y las dos
// hacían que la barra se creyera cosas que no son:
//
//   `export CLAVE=valor`  — la gente lo escribe, y `sueltas.js` ya lo daba por
//     supuesto. Aquí la clave salía llamándose «export CLAVE», así que la
//     pantalla enseñaba la misma dos veces: una diciendo que faltaba y otra
//     con su valor puesto.
//
//   `CLAVE=   # una nota`  — el comentario se tomaba como el valor, así que una
//     clave vacía contaba como puesta, la cuenta de las que faltan mentía, y
//     «Probar la conexión» se lanzaba creyendo que estaba todo.
//
// El comentario solo se quita cuando lleva un espacio delante, que es la regla
// de siempre: una contraseña puede ser `abc#123` y ahí el `#` es suyo. Y si el
// valor va entre comillas, dentro no se toca nada.
function leerEnv(fichero) {
  if (!fs.existsSync(fichero)) return new Map();
  const valores = new Map();
  for (const linea of fs.readFileSync(fichero, 'utf8').split('\n')) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#') || !limpia.includes('=')) continue;

    const corte = limpia.indexOf('=');
    const clave = limpia.slice(0, corte).trim().replace(/^export\s+/, '');
    // Sin recortar todavía: el espacio de antes del `#` es lo que distingue un
    // comentario de una contraseña que empiece por almohadilla.
    const crudo = limpia.slice(corte + 1);
    let valor;

    const entreComillas = crudo.trim().match(/^(["'])([\s\S]*?)\1/);
    if (entreComillas) valor = entreComillas[2];
    else valor = crudo.replace(/\s#.*$/, '').trim();

    valores.set(clave, valor);
  }
  return valores;
}

// Qué es cada clave y dónde se saca, según la tabla de CREDENTIALS.md que
// rellena el asistente:
//
//   | Variable | Tipo | Dónde se saca | Rotación |
//   | `HOLDED_API_KEY` | secreta | Ajustes → Desarrolladores → API | ... |
//
// La tercera columna es lo que el alumno necesita leer justo encima del campo.
function dondeSeSacaCadaClave(carpeta) {
  const donde = new Map();
  let texto;
  try {
    texto = fs.readFileSync(path.join(carpeta, 'CREDENTIALS.md'), 'utf8');
  } catch {
    return donde;
  }

  for (const linea of texto.split('\n')) {
    const fila = linea.match(/^\|\s*`([A-Z][A-Z0-9_]*)`\s*\|[^|]*\|([^|]*)\|/);
    if (!fila) continue;
    const pista = fila[2].replace(/`/g, '').trim();
    // Las plantillas de RSC traen filas de ejemplo con marcadores.
    if (!pista || /[{<]/.test(pista)) continue;
    donde.set(fila[1], pista);
  }
  return donde;
}

// Los pasos para conectarla, en cristiano. El asistente los escribe en una
// sección "Cómo conectarla" del README de la herramienta cuando la investiga.
// Los pasos técnicos de la plantilla de RSC (copiar el .env, dar permisos) no
// se enseñan: eso lo hace el panel o el asistente, no el alumno.
function comoSeConecta(carpeta) {
  let texto;
  try {
    texto = fs.readFileSync(path.join(carpeta, 'README.md'), 'utf8');
  } catch {
    return [];
  }

  // El asistente no siempre titula igual: le decimos "Cómo conectarla" pero
  // escribe "Qué hace falta" o "Antes de empezar" y el contenido es el bueno.
  // Se aceptan los títulos naturales antes que quedarnos sin guía.
  const TITULOS = /^(c[oó]mo\s+(se\s+)?conect|qu[eé]\s+(hace\s+falta|necesitas)|antes\s+de\s+empezar|pasos|puesta\s+en\s+marcha)/i;
  const seccion = texto.split(/^##\s+/m).find((t) => TITULOS.test(t));
  if (!seccion) return [];

  const util = (linea) => linea && !/[{<]/.test(linea) && !/\bcp\b|chmod|\.env\b/.test(linea);

  const pasos = seccion.split('\n')
    .map((l) => l.match(/^\s*(?:\d+[.)]|[-*])\s+(.*\S)\s*$/))
    .filter(Boolean)
    .map((m) => m[1].replace(/[`*]/g, '').trim())
    .filter(util);
  if (pasos.length) return pasos.slice(0, 8);

  // Sin lista, los párrafos de esa sección. Son menos cómodos de seguir, pero
  // dicen lo mismo y es mejor que una pantalla muda.
  return seccion.split(/\n\s*\n/).slice(1)
    .map((t) => t.replace(/\s*\n\s*/g, ' ').replace(/[`*]/g, '').trim())
    .filter((t) => util(t) && t.length > 20 && t.length < 400 && !t.startsWith('#') && !t.startsWith('|'))
    .slice(0, 4);
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

// ── Una conexión a medio hacer no es una conexión ────────────────────────
//
// El asistente crea una herramienta copiando `01-TOOLS/_TEMPLATE/`, y esa
// plantilla trae sus claves con marcadores dentro: `<TOOL>_API_KEY`,
// `<TOOL>_API_SECRET`. Rellenarlas es el paso siguiente, y entre un paso y el
// otro la barra se repinta —el vigía mira `01-TOOLS/**`— así que el alumno ve
// esa carpeta a medias.
//
// Y lo que veía era una conexión normal: «Sinhacer», con su casilla «Clave de
// acceso» esperando a que escribiera algo. Si escribía, la barra le contestaba
// **«Esa clave no tiene un nombre válido»**, porque `escribir` rechaza los
// marcadores con razón. Un callejón sin salida, en la pantalla donde muere la
// mayor parte del soporte del curso.
//
// Así que se reconoce y se dice. Es la regla de siempre de esta barra: decir
// lo que pasa en vez de enseñar un hueco con rótulo.
const ES_MARCADOR = (clave) => /[<{]/.test(clave);

// ── Una clave que está, pero en otro sitio ───────────────────────────────
//
// Jose, 21-09-2026, con una captura: sus claves vivían en un `.env.local` de
// la raíz, no en `01-TOOLS/<X>/.env`. La barra decía «faltan 2 claves» de una
// herramienta que funcionaba perfectamente, porque solo miraba su `.env`.
//
// No le falta nada: le falta orden, que es otra cosa y se arregla de otra
// manera. `sueltas.js` sabe dónde están y de quién son; aquí se le pregunta.
// Y también se mira el entorno del propio ordenador —lo que Jose llama «las
// globales»—: una clave exportada en el perfil del sistema funciona hoy y no
// viaja con la carpeta, así que se dice, no se cuenta como que falta.
function dondeMasEstan(proveedorId, nombres) {
  if (!nombres.length) return new Map();
  const donde = new Map();
  try {
    const sueltas = require('./sueltas');
    for (const sitio of sueltas.buscar()) {
      for (const nombre of sitio.nombres) {
        if (nombres.includes(nombre) && !donde.has(nombre)) donde.set(nombre, sueltas.enCristiano(sitio.donde));
      }
    }
    for (const nombre of sueltas.enElOrdenador(nombres)) {
      if (!donde.has(nombre)) donde.set(nombre, 'puesta en tu ordenador, fuera de esta carpeta');
    }
  } catch { /* sin inventario, se sigue como antes */ }
  return donde;
}

// Cuántos ficheros de acceso tiene puestos en su sitio (`keys/`). Se pregunta
// a `sueltas.js`, que es quien sabe reconocer uno.
function conFicheroDeAcceso(proveedorId) {
  try {
    return require('./sueltas').tieneSuFichero(proveedorId);
  } catch {
    return 0;
  }
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
      // Los marcadores no son claves que falten: son la plantilla sin rellenar.
      // Contarlos daría «faltan 3» en algo que todavía no pide nada.
      const deVerdad = [...esperadas.keys()].filter((k) => !ES_MARCADOR(k));
      const sinPoner = deVerdad.filter((k) => !puestas.get(k));
      const enOtroSitio = dondeMasEstan(e.name, sinPoner);
      return {
        id: e.name,
        etiqueta: etiquetaDeProveedor(e.name, carpeta),
        // Las que no están en ningún sitio. Las que están fuera se cuentan aparte.
        faltan: sinPoner.filter((k) => !enOtroSitio.has(k)).length,
        fueraDeSitio: enOtroSitio.size,
        // Hay credenciales que no son una línea: una cuenta de servicio, un
        // certificado. Viven en `keys/` y autentican igual, así que una
        // herramienta con eso puesto no está «sin conectar» aunque su `.env`
        // esté vacío (decisión 105).
        conFichero: conFicheroDeAcceso(e.name),
        // Sigue siendo la plantilla: el asistente la creó y no la ha terminado.
        aMedioHacer: [...esperadas.keys()].some(ES_MARCADOR),
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
  const sacadaDe = dondeSeSacaCadaClave(carpeta);

  // Las claves con marcador no se enseñan: son la plantilla sin rellenar, y
  // `escribir` las rechaza, así que una casilla para ellas es una casilla que
  // no lleva a ninguna parte. Se dice que está a medio hacer y se acabó.
  const nombres = [...new Set([...esperadas.keys(), ...puestas.keys()])].filter((k) => !ES_MARCADOR(k));
  const enOtroSitio = dondeMasEstan(proveedorId, nombres.filter((k) => !puestas.get(k)));

  return {
    proveedor: {
      id: proveedorId,
      etiqueta: etiquetaDeProveedor(proveedorId, carpeta),
      ayuda: dondeSeConsigue(carpeta),
      pasos: comoSeConecta(carpeta),
      aMedioHacer: [...esperadas.keys()].some(ES_MARCADOR),
      conFichero: conFicheroDeAcceso(proveedorId),
    },
    claves: nombres.map((clave) => ({
      clave,
      etiqueta: etiquetaDeClave(clave),
      // De dónde se saca esta clave en concreto, tal y como lo escribió el
      // asistente al investigar la herramienta.
      donde: sacadaDe.get(clave) || null,
      secreta: ES_SECRETA.test(clave.toUpperCase()),
      puesta: Boolean(puestas.get(clave)),
      // Está, pero en otro fichero o en el entorno del ordenador. Dicho en
      // cristiano por `sueltas.enCristiano`: «en la carpeta principal».
      fuera: enOtroSitio.get(clave) || null,
      pista: enmascarar(puestas.get(clave)),
    })),
  };
}

// Escribe en 01-TOOLS/<proveedor>/.env, creándolo desde el .env.example si
// hace falta y respetando comentarios y orden. Limpia por su cuenta lo que el
// alumno pegue de más: espacios, comillas y el salto del final.
//
// ── Lo que NO cabe aquí, y por qué se dice en vez de aplastarlo ──────────
//
// Un `.env` es una línea por clave. Pero hay credenciales muy corrientes que
// ocupan varias: una clave privada PEM, el JSON de una cuenta de servicio de
// Google. Esto las aceptaba, les quitaba los saltos, decía **«Guardado»** y
// dejaba una clave **rota** — un PEM sin sus saltos no lo acepta ninguna
// herramienta.
//
// Y el alumno no tenía forma de saberlo: la barra le había dicho que sí. Luego
// «Probar la conexión» fallaba y se ponía a revisar una clave que había pegado
// bien. Es exactamente el agujero de soporte que este fichero existe para
// tapar, y estaba aquí dentro.
//
// No se inventa una forma de meterlas: se dice que ahí no caben y se manda al
// asistente, que sabe dónde van. RSC ya lo tiene previsto — el `.gitignore` de
// cada herramienta ignora `keys/`, `*.p8`, `*.p12` y `*.json` justo para esto.
function escribir(proveedorId, clave, valorBruto) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return { ok: false, mensaje: 'Esa conexión ya no está.' };
  if (!/^[A-Z][A-Z0-9_]*$/i.test(clave)) return { ok: false, mensaje: 'Esa clave no tiene un nombre válido.' };

  // El salto del final es de pegar y se quita. Uno en medio significa que esto
  // no es una clave de una línea, y aplastarlo la estropearía en silencio.
  const sinBordes = String(valorBruto).trim();
  if (/[\r\n]/.test(sinBordes)) {
    return {
      ok: false,
      mensaje: 'Esto ocupa varias líneas y aquí solo cabe una. Si lo aplastara te lo estropearía sin que te enteraras. Pídeselo al asistente: sabe dónde guardarlo.',
    };
  }

  const valor = sinBordes.replace(/^["']|["']$/g, '');
  const destino = path.join(carpeta, '.env');
  const base = fs.existsSync(destino) ? destino : path.join(carpeta, '.env.example');

  // Leer y escribir pueden fallar —un `.env` que quedó de solo lectura, un
  // disco lleno, un antivirus que lo tiene cogido— y esto no lo miraba.
  // `guardarClave` llama sin red: la excepción subía y el alumno pulsaba
  // «Guardar» y **no pasaba nada**, ni confirmación ni error. El silencio más
  // caro posible, y justo en la pantalla de las credenciales.
  try {
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
  } catch (fallo) {
    return {
      ok: false,
      mensaje: fallo && fallo.code === 'EACCES'
        ? 'No tengo permiso para guardar aquí. Pídeselo al asistente, que puede mirar por qué.'
        : 'No he podido guardarlo. Prueba otra vez, y si sigue igual pídeselo al asistente.',
    };
  }

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

// ── Por qué no conecta, y no siempre es la clave ─────────────────────────
//
// Esto contestaba lo mismo a todo lo que no fuera un `.env` a medias: «revisa
// que la clave esté bien pegada». Probando fallos de verdad se vio que dos de
// los tres casos corrientes son otra cosa —no hay internet, o el script de la
// herramienta está roto— y en los dos el alumno se pone a revisar una clave
// que está perfecta. Puede tirarse la tarde con eso y acabar llamando al tutor.
//
// La regla de la casa es que un error diga qué hacer. Decirlo mal es peor que
// no decirlo: manda a mirar donde no es.
//
// Se mira en el orden en que importa, y lo que no se reconoce no culpa a nadie.
const PORQUE_FALLA = [
  [/getaddrinfo|could not resolve|name or service not known|enotfound|network is unreachable|no route to host|econnrefused|connection refused/i,
    'No he podido salir a internet. Mira que tengas conexión y vuelve a probar.'],
  [/\b(401|403)\b|unauthorized|forbidden|invalid.{0,15}(key|token|credential)|authentication failed|bad credentials/i,
    'La clave no vale. Sácala otra vez donde te la dieron y pégala entera.'],
  [/\b(429)\b|rate limit|too many requests/i,
    'La herramienta dice que le has pedido demasiadas cosas seguidas. Espera un rato y prueba otra vez.'],
  [/traceback|syntaxerror|modulenotfounderror|command not found|no such file or directory|cannot find module|referenceerror/i,
    'La prueba de esta conexión está rota, y eso no es cosa tuya. Pídeselo al asistente.'],
];

async function probar(proveedorId) {
  const carpeta = carpetaDe(proveedorId);
  if (!carpeta) return { ok: false, mensaje: 'Esa conexión ya no está.' };

  const prueba = fs.readdirSync(carpeta).find((f) => /^test_connection\.(sh|py|js|mjs)$/.test(f));
  if (!prueba) return { ok: false, mensaje: 'Esta conexión no trae forma de comprobarse. Pregúntaselo al asistente.' };

  const resultado = await lanzar(carpeta, prueba);
  const error = `${resultado.error || ''}\n${resultado.salida || ''}`;

  if (resultado.codigo === 0) return { ok: true, mensaje: 'Conectado. Funciona.' };

  // Si la clave existe pero en otro sitio, decir «falta» manda a rellenar algo
  // que esa persona ya tiene. Se dice lo que pasa de verdad (decisión 104).
  const fuera = [...dondeMasEstan(proveedorId, [...leerEnv(path.join(carpeta, '.env.example')).keys()]).values()];
  if (fuera.length && /missing .*\.env|not set/i.test(error)) {
    return { ok: false, mensaje: `Tus claves de esta conexión están ${fuera[0]}, y la prueba las busca aquí. Pulsa "Que las ordene" y vuelve a probar.` };
  }
  if (/missing .*\.env/i.test(error)) return { ok: false, mensaje: 'Todavía no has puesto ninguna clave para esta conexión.' };
  if (/not set/i.test(error)) return { ok: false, mensaje: 'Falta alguna clave por rellenar.' };
  // Lo paró el reloj: `procesos.js` lo dice con estas palabras.
  if (/tardado demasiado/i.test(error)) return { ok: false, mensaje: 'La herramienta no contesta. Prueba dentro de un rato.' };

  const porque = PORQUE_FALLA.find(([senal]) => senal.test(error));
  if (porque) return { ok: false, mensaje: porque[1] };

  // Y si no se reconoce, no se señala a la clave: se dice lo que se sabe.
  return { ok: false, mensaje: 'No conecta, y no sé decirte por qué. Pídeselo al asistente, que puede mirar el detalle.' };
}

// Lo que se puede hacer de un vistazo, sin abrir conversación: los scripts de
// cada herramienta que **solo miran**. Ya se ejecutaban así desde el principio
// (decisión 8), pero estaban enterrados en Mis conexiones → la herramienta;
// esto los saca a la pantalla principal, agrupados por herramienta.
//
// Solo salen los que solo miran. Los que piden datos o cambian algo siguen
// pasando por el asistente, que pregunta lo que falte y pide permiso — esa
// regla no se toca, que es la que hace que pulsar sea seguro.
//
// En un arnés sin herramientas, o con herramientas sin scripts, esto devuelve
// una lista vacía y la pantalla se queda como estaba. Como todo lo demás: sale
// de leer la carpeta, no de estar escrito en el código.
function loQueSePuedeMirar() {
  return proveedores()
    .map((p) => ({
      id: p.id,
      etiqueta: p.etiqueta,
      scripts: scripts(p.id)
        .filter((s) => !s.pideDatos)
        .map((s) => ({
          fichero: s.fichero,
          // Para el botón, el nombre del fichero en cristiano: la columna del
          // README es una frase entera —"Lo facturado y lo gastado este mes,
          // lo pendiente de cobro…"— y en una barra estrecha no cabe. Esa
          // frase se queda debajo, de pista.
          etiqueta: humanizar(s.fichero.replace(EJECUTABLES, '')),
          queHace: s.etiqueta,
        })),
    }))
    .filter((p) => p.scripts.length);
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

module.exports = { proveedores, claves, escribir, probar, scripts, loQueSePuedeMirar, ejecutar, etiquetaDeClave, enmascarar, leerEnv };
