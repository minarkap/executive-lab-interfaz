// Un navegador de mentira para `media/panel.js`.
//
// Por qué existe: el panel es un fichero de navegador y hasta ahora no lo
// probaba nadie. `humo.js` comprueba el lado de la extensión —que los datos
// salgan bien— pero si la pantalla revienta al pintarlos, o si el mensaje llega
// con un nombre que el panel no conoce, **no pasa nada visible**: se queda la
// pantalla anterior puesta y el alumno mira una barra congelada.
//
// Eso ha pasado dos veces seguidas:
//
//   · Un campo `tipo` en los datos pisaba el `tipo` del mensaje, así que el
//     panel no encontraba qué pintar y se quedaba en "Mirando qué hay aquí…".
//   · Antes, un cuelgue esperando a GitHub dejaba la misma pantalla para
//     siempre, sin salida.
//
// Las dos las encontró Jose mirando la barra. Con esto, las encuentra la
// prueba: se le manda al panel cada mensaje que la extensión sabe mandar y se
// exige que pinte algo con sentido.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Lo mínimo del navegador que el panel usa. No es un DOM: es lo justo para que
// el fichero cargue y pinte, y para poder leer lo que ha pintado.
function montarPanel(fichero = path.join(__dirname, '..', 'media', 'panel.js')) {
  const oyentes = {};
  const enviados = [];
  let pintado = '';

  const elemento = () => ({
    set innerHTML(v) { pintado = v; },
    get innerHTML() { return pintado; },
    addEventListener() {},
    querySelectorAll: () => [],
    querySelector: () => null,
    classList: { add() {}, remove() {} },
    dataset: {},
    focus() {},
  });

  const contexto = {
    acquireVsCodeApi: () => ({
      postMessage: (m) => enviados.push(m),
      getState: () => undefined,
      setState() {},
    }),
    document: {
      getElementById: elemento,
      createElement: elemento,
      addEventListener(que, fn) { oyentes[que] = fn; },
      querySelector: () => null,
      querySelectorAll: () => [],
      scrollingElement: { scrollTop: 0 },
      body: { classList: { add() {}, remove() {} } },
    },
    window: { addEventListener(que, fn) { oyentes[que] = fn; } },
    FileReader: class { readAsDataURL() {} },
    setInterval: () => 0,
    clearInterval() {},
    setTimeout: () => 0,
    console,
  };
  contexto.globalThis = contexto;

  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(fichero, 'utf8'), contexto, { filename: 'panel.js' });

  return {
    // Le manda un mensaje como se lo manda la extensión, y devuelve lo pintado.
    mandar(mensaje) {
      pintado = '';
      if (!oyentes.message) throw new Error('el panel no escucha mensajes');
      oyentes.message({ data: mensaje });
      return pintado;
    },
    enviados,
  };
}

module.exports = { montarPanel };
