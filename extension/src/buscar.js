// Buscar por su nombre lo que haya en la carpeta: lo que sabe, lo que puede
// hacer y lo que tiene conectado.
//
// Por qué se busca aquí y no se le pregunta al asistente: porque buscar es
// mirar, no conversar. Preguntárselo cuesta una conversación nueva y unos
// segundos de espera para algo que está en el disco y se resuelve en
// milisegundos (docs/friccion.md §4: "los botones que solo consultan no
// deberían hablar con el asistente"). Cuando no hay resultados, entonces sí:
// el último botón de la pantalla se lo pregunta a él.
//
// Sin dependencias, como todo lo demás de esta extensión. El índice se arma
// entero la primera vez que alguien busca —no al arrancar, que ahí no hace
// falta— y se tira cuando el vigía ve que el arnés ha escrito algo.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const { acciones } = require('./acciones');
const papeles = require('./papeles');
const diario = require('./diario');

// Topes para que una carpeta rara no congele el panel. Una wiki de empresa
// anda por los cientos de documentos; 2.000 es mucho más de lo que se espera.
const MAXIMO_FICHEROS = 2000;
const MAXIMO_POR_FICHERO = 1024 * 1024;

// Ni la carpeta del arnés ni la de la marca son "lo que sabe de tu empresa":
// son fontanería nuestra.
const FUERA_DE_LA_WIKI = ['harness', 'brand'];

// Quitar tildes y mayúsculas: quien busca "facturacion" tiene que encontrar
// "Facturación", y al revés.
const pelar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const palabras = (texto) => pelar(texto).split(/[^a-z0-9ñ]+/).filter((p) => p.length > 1);

// ------------------------------------------------------------- el índice

let indiceEnMemoria = null;

const olvidar = () => { indiceEnMemoria = null; };

function leerSiCabe(completa) {
  try {
    if (fs.statSync(completa).size > MAXIMO_POR_FICHERO) return null;
    return fs.readFileSync(completa, 'utf8');
  } catch {
    return null;
  }
}

function recorrer(carpeta, alEncontrar, cuantosVan = { n: 0 }) {
  let entradas;
  try {
    entradas = fs.readdirSync(carpeta, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entrada of entradas) {
    if (cuantosVan.n >= MAXIMO_FICHEROS) return;
    if (entrada.name.startsWith('.')) continue;
    const completa = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) recorrer(completa, alEncontrar, cuantosVan);
    else {
      cuantosVan.n += 1;
      alEncontrar(completa);
    }
  }
}

// Una cosa buscable: de dónde sale, cómo se llama, qué texto tiene y qué hay
// que hacer al pulsarla.
const cosa = (tipo, titulo, texto, accion, extra = {}) => ({ tipo, titulo, texto: texto || '', accion, ...extra });

function armarElIndice() {
  const cosas = [];
  const raiz = proyecto.raiz();
  if (!raiz) return cosas;

  // 1. Lo que sabe: todos los documentos de la wiki, estén o no en el índice.
  const wiki = proyecto.ruta('02-DOCS', 'wiki');
  if (wiki && fs.existsSync(wiki)) {
    for (const entrada of fs.readdirSync(wiki, { withFileTypes: true })) {
      if (entrada.name.startsWith('.')) continue;
      if (entrada.isDirectory() && FUERA_DE_LA_WIKI.includes(entrada.name)) continue;

      const dentro = path.join(wiki, entrada.name);
      const mirar = (completa) => {
        if (!completa.endsWith('.md')) return;
        const crudo = leerSiCabe(completa);
        if (crudo === null) return;

        const cuerpo = crudo.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
        const titulo = (cuerpo.match(/^#\s+(.+)$/m) || [])[1] || path.basename(completa, '.md').replace(/[-_]+/g, ' ');
        const relativa = path.relative(wiki, completa);
        // index.md, log.md y gaps.md son el andamio de la wiki, no cosas que
        // sepa: si salieran, cualquier búsqueda los sacaría todos.
        if (['index.md', 'log.md', 'gaps.md'].includes(relativa)) return;

        cosas.push(cosa('sabe', titulo.trim(), cuerpo, { tipo: 'leerArticulo', ruta: relativa }));
      };

      if (entrada.isDirectory()) recorrer(dentro, mirar);
      else mirar(dentro);
    }
  }

  // 2. Lo que puede hacer: los mismos botones que enseña la pantalla
  // principal, descubiertos por acciones.js para no tener dos criterios.
  const comandos = proyecto.ruta('.claude', 'commands');
  for (const accion of acciones()) {
    const crudo = comandos ? leerSiCabe(path.join(comandos, `${accion.nombre}.md`)) : null;
    cosas.push(cosa('hacer', accion.etiqueta, (crudo || '').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, ''),
      { tipo: 'pedir', prompt: accion.prompt }, { icono: accion.icono }));
  }

  // 3. Lo que tiene conectado.
  const herramientas = proyecto.ruta('01-TOOLS');
  if (herramientas && fs.existsSync(herramientas)) {
    for (const entrada of fs.readdirSync(herramientas, { withFileTypes: true })) {
      if (!entrada.isDirectory() || entrada.name.startsWith('.') || entrada.name === '_TEMPLATE') continue;
      const textos = ['README.md', 'CREDENTIALS.md']
        .map((f) => leerSiCabe(path.join(herramientas, entrada.name, f)))
        .filter(Boolean)
        .join('\n');
      cosas.push(cosa('conexion', entrada.name.replace(/[-_]+/g, ' '), textos,
        { tipo: 'verConexion', proveedor: entrada.name }));
    }
  }

  // 4. Los papeles: los tres montones del archivador. Solo el nombre — el
  // contenido de un PDF o de una hoja de cálculo no lo lee esto, y el de los
  // que ya destiló el asistente sale por la wiki, en el punto 1.
  //
  // Antes solo entraban los que esperaban sin leer, y al pulsarlos llevaban a
  // la pantalla de conceptos, que no es donde están.
  const { esperando, leidos, originales } = papeles.queHay();
  for (const papel of [...esperando, ...leidos, ...originales]) {
    cosas.push(cosa('papel', papel.nombre, '', { tipo: 'abrirPapel', ruta: papel.ruta }));
  }

  // 5. El diario: lo que se hizo cada día. Buscar "Talleres Ruiz" tiene que
  // encontrar también el día que se les reclamó el pago, no solo la ficha.
  for (const sesion of diario.sesiones()) {
    cosas.push(cosa('diario', sesion.titulo, sesion.resumen || '', { tipo: 'verSesion', fichero: sesion.fichero }));
  }

  // Se prepara una vez lo que se va a comparar mil veces.
  for (const c of cosas) {
    c.tituloPelado = pelar(c.titulo);
    c.textoPelado = pelar(c.texto);
    c.encabezadosPelados = pelar((c.texto.match(/^#{1,6}\s+.+$/gm) || []).join(' '));
  }
  return cosas;
}

const indice = () => {
  if (!indiceEnMemoria) indiceEnMemoria = armarElIndice();
  return indiceEnMemoria;
};

// ------------------------------------------------------------- la frase

// El trozo donde aparece lo buscado, con algo de contexto por los lados y
// cortado por espacios, no por la mitad de una palabra.
function fraseCon(texto, termino) {
  const donde = pelar(texto).indexOf(termino);
  if (donde === -1) {
    const limpio = texto.replace(/\s+/g, ' ').trim();
    return limpio.slice(0, 120);
  }

  const desde = Math.max(0, donde - 60);
  const hasta = Math.min(texto.length, donde + termino.length + 80);
  let trozo = texto.slice(desde, hasta).replace(/\s+/g, ' ').trim();
  if (desde > 0) trozo = `…${trozo.replace(/^\S*\s/, '')}`;
  if (hasta < texto.length) trozo = `${trozo.replace(/\s\S*$/, '')}…`;
  return trozo;
}

// ------------------------------------------------------------- la busca

const GRUPOS = [
  { tipo: 'sabe', titulo: 'Lo que sabe' },
  { tipo: 'hacer', titulo: 'Cosas que puedes hacer' },
  { tipo: 'papel', titulo: 'Documentos' },
  { tipo: 'conexion', titulo: 'Tus programas' },
  { tipo: 'diario', titulo: 'El diario' },
];

// Cuánto vale encontrarlo en cada sitio. El título manda: quien busca
// "facturas" quiere el documento que se llama así, no los doce que la nombran.
const VALE = { titulo: 5, encabezado: 3, cuerpo: 1 };

function puntuar(cosa, terminos, frase) {
  let puntos = 0;
  let donde = null;

  for (const termino of terminos) {
    if (cosa.tituloPelado.includes(termino)) { puntos += VALE.titulo; donde = donde || 'titulo'; }
    if (cosa.encabezadosPelados.includes(termino)) { puntos += VALE.encabezado; donde = donde || 'encabezado'; }
    const veces = cosa.textoPelado.split(termino).length - 1;
    if (veces) { puntos += Math.min(veces, 5) * VALE.cuerpo; donde = donde || 'cuerpo'; }
  }

  // Haber escrito la frase entera vale más que haber acertado las palabras
  // sueltas cada una por su lado.
  if (terminos.length > 1 && (cosa.tituloPelado.includes(frase) || cosa.textoPelado.includes(frase))) {
    puntos += VALE.titulo;
  }
  return { puntos, donde };
}

function buscar(texto, cuantos = 15) {
  const frase = pelar(texto || '').trim();
  const terminos = palabras(texto || '');
  if (!terminos.length) return { texto: texto || '', cuantos: 0, grupos: [] };

  const aciertos = [];
  for (const cosa of indice()) {
    const { puntos, donde } = puntuar(cosa, terminos, frase);
    if (!puntos) continue;

    const primero = terminos.find((t) => cosa.textoPelado.includes(t)) || terminos[0];
    aciertos.push({
      tipo: cosa.tipo,
      titulo: cosa.titulo,
      icono: cosa.icono,
      accion: cosa.accion,
      puntos,
      donde,
      frase: donde === 'titulo' && !cosa.textoPelado.includes(primero)
        ? cosa.texto.replace(/^#\s+.+$/m, '').replace(/\s+/g, ' ').trim().slice(0, 120)
        : fraseCon(cosa.texto, primero),
      resaltar: terminos,
    });
  }

  aciertos.sort((a, b) => b.puntos - a.puntos || a.titulo.localeCompare(b.titulo, 'es'));
  const elegidos = aciertos.slice(0, cuantos);

  return {
    texto: texto || '',
    cuantos: elegidos.length,
    grupos: GRUPOS
      .map((g) => ({ titulo: g.titulo, aciertos: elegidos.filter((a) => a.tipo === g.tipo) }))
      .filter((g) => g.aciertos.length),
  };
}

module.exports = { buscar, olvidar, pelar };
