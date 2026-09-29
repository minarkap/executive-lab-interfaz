// Un panel falso que además deja pulsar: lee los data-accion de lo pintado,
// guarda los manejadores de clic y deja escribir en la caja y en el título.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const deshacer = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function montarPanelConClics(fichero = path.join(__dirname, '..', 'media', 'panel.js')) {
  const oyentes = {};
  const enviados = [];
  let pintado = '';
  let clics = [];
  let escrito = {};

  const campo = (selector) => {
    if (selector === 'textarea[data-aviso]') {
      const m = pintado.match(/<textarea([^>]*\bdata-aviso(?=[\s>])[^>]*)>([\s\S]*?)<\/textarea>/);
      if (!m) return null;
      return {
        get value() { return selector in escrito ? escrito[selector] : deshacer(m[2]); },
        hasAttribute: (a) => new RegExp(`(^|\\s)${a}(?=[\\s=>]|$)`).test(m[1]),
        focus() {},
      };
    }
    if (selector === 'input[data-aviso-titulo]') {
      const m = pintado.match(/<input([^>]*\bdata-aviso-titulo\b[^>]*)>/);
      if (!m) return null;
      const valor = (m[1].match(/value="([^"]*)"/) || [])[1] || '';
      return { get value() { return selector in escrito ? escrito[selector] : deshacer(valor); } };
    }
    return null;
  };
  const otro = () => ({ set innerHTML(v) {}, addEventListener() {}, querySelectorAll: () => [], querySelector: () => null, classList: { add() {}, remove() {} }, dataset: {}, focus() {} });
  const app = {
    set innerHTML(v) { pintado = v; clics = []; escrito = {}; },
    get innerHTML() { return pintado; },
    addEventListener() {},
    querySelectorAll: (sel) => (sel === '[data-accion]'
      ? [...pintado.matchAll(/data-accion="([^"]*)"/g)].map((m) => ({
        dataset: { accion: deshacer(m[1]) },
        addEventListener: (ev, fn) => { if (ev === 'click') clics.push({ accion: JSON.parse(deshacer(m[1])), fn }); },
        closest: () => otro(),
      }))
      : []),
    querySelector: campo,
    classList: { add() {}, remove() {} },
    dataset: {},
    focus() {},
  };
  const contexto = {
    acquireVsCodeApi: () => ({ postMessage: (m) => enviados.push(m), getState: () => undefined, setState() {} }),
    document: {
      getElementById: (id) => (id === 'app' ? app : otro()),
      createElement: otro,
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
    mandar(mensaje) { oyentes.message({ data: mensaje }); return pintado; },
    escribir(selector, valor) { escrito[selector] = valor; },
    pulsar(tipo) {
      const b = clics.find((c) => c.accion.tipo === tipo);
      if (!b) throw new Error(`no hay botón ${tipo}`);
      b.fn();
    },
    enviados,
  };
}

module.exports = { montarPanelConClics };
