// Los papeles: los documentos que han entrado en esta carpeta.
//
// ── Qué es esto y qué NO es ──────────────────────────────────────────────
//
// Esto es el archivador. Ficheros. Lo que alguien entregó y lo que el arnés
// guardó de ello. **No es lo que el arnés ha entendido** — eso son los
// conceptos de la wiki, y viven en `cerebro.js`. Las dos cosas estaban juntas
// en la barra y por eso no se entendía ninguna: "Ver los temas" salía en medio
// de unos documentos sin que se supiera qué iba a pasar al pulsarlo.
//
// Tres montones, que son los tres estados por los que pasa un papel en RSC:
//
//   · `02-DOCS/inbox/`            — entregado, sin leer todavía.
//   · `02-DOCS/inbox/_processed/` — ya leído: el asistente sacó lo suyo.
//   · `02-DOCS/raw/`              — el original guardado, que no se borra nunca.
//
// Hasta ahora de los tres solo se veía un número. "Tienes 3 documentos sin
// leer" y ni forma de saber cuáles son.

const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const proyecto = require('./proyecto');

const INBOX = ['02-DOCS', 'inbox'];
const CRUDO = ['02-DOCS', 'raw'];

// El diario que el arnés se escribe solo cuelga de `raw/` y no es un papel que
// haya entregado nadie. Se ve en su sitio, que es el histórico.
const NO_SON_PAPELES = ['worklog'];

// Suficientes para hacerse una idea. Quien tenga más de esto no los va a
// repasar en una barra lateral de todos modos.
const TOPE = 40;

function listar(partes, { saltar = [], hondo = true } = {}) {
  const carpeta = proyecto.ruta(...partes);
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  const encontrados = [];
  const recorrer = (donde) => {
    let entradas;
    try {
      entradas = fs.readdirSync(donde, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      if (entrada.name.startsWith('.') || entrada.name === 'README.md') continue;
      const completa = path.join(donde, entrada.name);
      if (entrada.isDirectory()) {
        if (saltar.includes(entrada.name)) continue;
        if (hondo) recorrer(completa);
        continue;
      }
      let cuando = null;
      try { cuando = fs.statSync(completa).mtime.toISOString(); } catch { /* da igual */ }
      encontrados.push({
        nombre: entrada.name,
        // Relativa a la carpeta de trabajo: es lo que viaja al panel y lo que
        // vuelve para abrirlo, y nunca se enseña en pantalla.
        ruta: path.relative(proyecto.raiz(), completa),
        cuando,
      });
    }
  };
  recorrer(carpeta);

  return encontrados
    .sort((a, b) => String(b.cuando).localeCompare(String(a.cuando)))
    .slice(0, TOPE);
}

// Los tres montones, cada uno con lo suyo.
function queHay() {
  return {
    // `_processed/` cuelga de la bandeja, así que al listar los que esperan hay
    // que quedarse en la superficie o salen los leídos mezclados.
    esperando: listar(INBOX, { hondo: false }),
    leidos: listar([...INBOX, '_processed']),
    originales: listar(CRUDO, { saltar: NO_SON_PAPELES }),
  };
}

// Abrir uno. Se comprueba que sigue siendo de los sitios de arriba: la ruta
// viene de un mensaje del panel, y se trata como si viniera de fuera.
function donde(rutaRelativa) {
  const raiz = proyecto.raiz();
  if (!raiz || typeof rutaRelativa !== 'string') return null;

  const completa = path.resolve(raiz, rutaRelativa);
  const permitidas = [proyecto.ruta(...INBOX), proyecto.ruta(...CRUDO)]
    .filter(Boolean)
    .map((c) => path.resolve(c) + path.sep);

  if (!permitidas.some((p) => completa.startsWith(p))) return null;
  if (path.relative(proyecto.ruta(...CRUDO), completa).split(path.sep)[0] === 'worklog') return null;
  return fs.existsSync(completa) ? completa : null;
}

// Con el programa de siempre: un PDF con el lector de PDF, una hoja con la
// hoja de cálculo. La barra no se pone a enseñar documentos que no sabe pintar.
async function abrir(rutaRelativa) {
  const completa = donde(rutaRelativa);
  if (!completa) return { ok: false, mensaje: 'Ese documento ya no está.' };
  await vscode.env.openExternal(vscode.Uri.file(completa));
  return { ok: true };
}

module.exports = { queHay, donde, abrir };
