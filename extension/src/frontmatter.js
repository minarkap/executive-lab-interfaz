// Leer el frontmatter YAML de un fichero markdown.
//
// No es un analizador de YAML: es lo justo para `clave: valor` con listas
// entre corchetes, que es todo lo que hay en las cabeceras que leemos —
// comandos de Claude, artículos de la wiki, el perfil de usuario. Un YAML de
// verdad sería una dependencia para nada.

const fs = require('node:fs');

function analizar(texto) {
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!bloque) return {};

  const campos = {};
  for (const linea of bloque[1].split('\n')) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const corte = limpia.indexOf(':');
    if (corte <= 0) continue;

    const clave = limpia.slice(0, corte).trim();
    let valor = limpia.slice(corte + 1).trim().replace(/^["']|["']$/g, '');
    if (valor.startsWith('[') && valor.endsWith(']')) {
      valor = valor.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    campos[clave] = valor;
  }
  return campos;
}

function leer(fichero) {
  try {
    return analizar(fs.readFileSync(fichero, 'utf8'));
  } catch {
    return {};
  }
}

module.exports = { analizar, leer };
