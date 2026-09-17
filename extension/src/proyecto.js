// Dónde está "Mi Empresa" y qué hay dentro.
//
// Todo el resto de módulos pregunta aquí por rutas. Si algún día la carpeta de
// trabajo deja de ser la primera del workspace, se cambia en un solo sitio.

const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');

function raiz() {
  const carpetas = vscode.workspace.workspaceFolders;
  return carpetas && carpetas.length ? carpetas[0].uri.fsPath : null;
}

function ruta(...partes) {
  const base = raiz();
  return base ? path.join(base, ...partes) : null;
}

function existe(...partes) {
  const r = ruta(...partes);
  return Boolean(r) && fs.existsSync(r);
}

// El "suelo" que RSC exige para dar por bueno un arnés instalado. Si falta
// alguna de estas tres piezas, el onboarding se aplicó a medias.
function sueloDelArnes() {
  return {
    declaracion: existe('.rsc.json'),
    conexiones: existe('01-TOOLS', '_TEMPLATE'),
    conocimiento: existe('02-DOCS', 'wiki', 'harness'),
  };
}

function arnesCompleto() {
  return Object.values(sueloDelArnes()).every(Boolean);
}

// La versión del catálogo que fijó el instalador. Toda la cohorte tiene que
// correr exactamente la misma, así que nunca se usa @latest.
function versionDelCatalogo() {
  try {
    const declaracion = JSON.parse(fs.readFileSync(ruta('.rsc.json'), 'utf8'));
    return declaracion.catalogVersion || null;
  } catch {
    return null;
  }
}

module.exports = { raiz, ruta, existe, sueloDelArnes, arnesCompleto, versionDelCatalogo };
