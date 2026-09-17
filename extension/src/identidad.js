// Cómo se llama esto y de quién es.
//
// Dos nombres, y los pone el alumno cuando dice para qué va a ser:
//
//   · el ARNÉS  — para qué es esta carpeta: Contabilidad, Personal, Marketing,
//                 Clientes, el proyecto que sea. Un arnés no es "una empresa":
//                 una empresa puede tener cuatro, cada uno para lo suyo.
//   · la EMPRESA — de quién es todo esto: Nexus Consulting.
//
// Viven en el frontmatter de `02-DOCS/wiki/harness/user-profile.md`, que es el
// fichero donde RSC guarda el perfil del arnés y donde ya escribimos los
// diales. Sin ellos se tira del nombre de la carpeta, que casi siempre dice
// algo, y si no, de nada: la interfaz funciona igual.

const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');

const PERFIL = ['02-DOCS', 'wiki', 'harness', 'user-profile.md'];

function humanizar(texto) {
  const limpio = texto.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

function leer() {
  const ruta = proyecto.ruta(...PERFIL);
  const campos = ruta ? frontmatter.leer(ruta) : {};

  const texto = (valor) => (typeof valor === 'string' && valor.trim() ? valor.trim() : null);
  const raiz = proyecto.raiz();
  const porLaCarpeta = raiz ? humanizar(raiz.split(/[\\/]/).filter(Boolean).pop() || '') : null;

  return {
    arnes: texto(campos.arnes) || porLaCarpeta,
    empresa: texto(campos.empresa),
    // Lo puso el alumno, o lo hemos deducido de la carpeta.
    puesto: Boolean(texto(campos.arnes)),
  };
}

// El rótulo de la ventana: "Contabilidad · Nexus Consulting", o lo que haya.
function titulo() {
  const { arnes, empresa } = leer();
  if (arnes && empresa) return `${arnes} · ${empresa}`;
  return arnes || empresa || 'Executive Lab';
}

// De quién se habla cuando el panel dice "lo que sabe de…".
const deQuien = () => leer().arnes || 'tu trabajo';

module.exports = { leer, titulo, deQuien, PERFIL };
