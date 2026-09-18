// git, que es obligatorio — visto desde la barra lateral.
//
// El mecanismo (cómo se comprueba, cómo se instala en cada sistema, y por qué
// no lo llevamos dentro) está en instalador/comun/git.js, que es el mismo
// fichero que usa el instalador. Aquí solo queda lo que esto tiene de propio:
// saber dónde puede vivir un git que dejó el instalador, y qué hacer si el
// módulo compartido no aparece.

const entorno = require('./entorno');

// Se busca una vez y se recuerda, como historial.js: si no está, no va a estar
// más tarde.
let modulo;
let yaBuscado = false;

function compartido() {
  if (!yaBuscado) {
    yaBuscado = true;
    const donde = entorno.moduloComun('git');
    try {
      modulo = donde ? require(donde) : null;
    } catch {
      modulo = null;
    }
  }
  return modulo;
}

// Se le pasa el git que sepamos, que en una máquina con instalador es el suyo.
const comoLlamar = () => ({ git: entorno.git() });

// Sin módulo no se puede comprobar nada. Se responde que NO hay git, que es la
// respuesta prudente: enseña el botón de ponerlo en vez de dejar que la
// preparación aborte a mitad. El empaquetado comprueba que el módulo va dentro
// (extension/preparar-paquete.js) y una prueba lo verifica.
async function hay() {
  const m = compartido();
  return m ? m.hay(comoLlamar()) : false;
}

async function instalar(avisar = () => {}) {
  const m = compartido();
  if (!m) {
    const aMano = 'Pídesela a tu tutor: se llama git.';
    return { ok: false, mensaje: aMano };
  }
  return m.instalar(comoLlamar(), avisar);
}

function comoSeInstala() {
  const m = compartido();
  return m ? m.comoSeInstala() : 'Pídesela a tu tutor: se llama git.';
}

function sePuedeInstalarSolo() {
  const m = compartido();
  return Boolean(m && m.sePuedeInstalarSolo());
}

module.exports = { hay, instalar, comoSeInstala, sePuedeInstalarSolo };
