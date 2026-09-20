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

// Lo que dice `.rsc.json`, o null. Se traga cualquier error a propósito: casi
// toda la barra solo quiere saber qué hay, y un fichero ilegible es, para eso,
// lo mismo que no tenerlo.
function declaracion() {
  try {
    return JSON.parse(fs.readFileSync(ruta('.rsc.json'), 'utf8'));
  } catch {
    return null;
  }
}

// Pero para arrancar NO es lo mismo, y por eso esto existe aparte.
//
// `.rsc.json` es un fichero comiteado, y el propio RSC avisa de que es propenso
// a conflictos de merge. Con `declaracion()` a secas, un fichero con marcas de
// conflicto se ve igual que una carpeta sin arnés — y el arranque montaría uno
// encima, pisando el que ya había. Son dos cosas distintas y hay que poder
// distinguirlas:
//
//   'no'    no hay `.rsc.json`
//   'rota'  lo hay y no se puede leer: no se toca nada
//   'ok'    lo hay y se lee
function comoEstaLaDeclaracion() {
  if (!existe('.rsc.json')) return 'no';
  return declaracion() ? 'ok' : 'rota';
}

// El recibo del onboarding: lo que RSC firmó cuando alguien aceptó el plan.
// Dentro está `record`, que ya contiene cinco de las siete preguntas del
// asistente —nivel, dial, de qué va, objetivo y tamaño— y los targets. Es lo
// que permite no volver a preguntar lo que ya está contestado.
function recibo() {
  const declarado = declaracion();
  const plan = declarado && declarado.onboarding && declarado.onboarding.plan;
  return plan && plan.record ? plan : null;
}

function versionDelCatalogo() {
  return (declaracion() || {}).catalogVersion || null;
}

module.exports = {
  raiz, ruta, existe, declaracion, comoEstaLaDeclaracion, recibo, sueloDelArnes, arnesCompleto, versionDelCatalogo,
};
