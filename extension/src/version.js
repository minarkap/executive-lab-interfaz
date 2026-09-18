// ¿Hay una versión nueva de esto?
//
// Por qué existe: mientras la extensión se reparta a mano —un `.vsix` que
// alguien arrastra— **nadie se entera de que hay algo mejor**. Se queda con la
// versión que le tocó el día que se la dieron, para siempre, y los arreglos no
// le llegan nunca. Publicarla en el Marketplace resuelve esto de raíz, porque
// el editor actualiza solo; hasta entonces, lo mira la barra.
//
// Lo mira, y ya. No descarga ni instala nada por su cuenta: enseña un aviso con
// un botón que abre la página de la descarga. Una extensión que se actualiza
// sola a espaldas de quien la usa es exactamente el tipo de cosa que este
// proyecto no hace.

const vscode = require('vscode');
const github = require('./github');

const ULTIMA = 'https://api.github.com/repos/minarkap/executive-lab-interfaz/releases/latest';

// Una vez al día basta y sobra. La respuesta se recuerda en el almacén global
// del editor, así que abrir cinco ventanas no son cinco preguntas.
const CADA = 24 * 60 * 60 * 1000;
const CLAVE = 'executiveLab.ultimoMiradoVersion';

// "0.9.0" → [0, 9, 0]. Lo que no sean números se ignora: una etiqueta como
// "0.9.0-beta" cuenta como 0.9.0, que para avisar es suficiente.
const enNumeros = (version) => String(version || '').split('.').map((t) => parseInt(t, 10) || 0);

function esMasNueva(candidata, actual) {
  const a = enNumeros(candidata);
  const b = enNumeros(actual);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

// Devuelve la versión nueva, o null. Nunca lanza: que esto falle no puede
// estropearle la pantalla a nadie, y sin red simplemente no se avisa.
async function hayUnaNueva(contexto, actual) {
  try {
    const almacen = contexto.globalState;
    const mirado = almacen.get(CLAVE) || { cuando: 0, version: null };

    if (Date.now() - mirado.cuando < CADA) {
      return esMasNueva(mirado.version, actual) ? mirado.version : null;
    }

    // Con reloj, como todo lo que sale a la red desde aquí: la barra no puede
    // quedarse esperando a GitHub para pintarse.
    const respuesta = await github.conReloj(fetch(ULTIMA, { headers: { Accept: 'application/vnd.github+json' } }), null, 5000);
    if (!respuesta || !respuesta.ok) return null;

    const version = String((await respuesta.json()).tag_name || '').replace(/^v/, '');
    await almacen.update(CLAVE, { cuando: Date.now(), version });

    return esMasNueva(version, actual) ? version : null;
  } catch {
    return null;
  }
}

// La página de la última versión, para el botón del aviso.
const dondeBajarla = () => vscode.Uri.parse('https://github.com/minarkap/executive-lab-interfaz/releases/latest');

module.exports = { hayUnaNueva, esMasNueva, dondeBajarla };
