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

// Con varias carpetas abiertas en la misma ventana se trabaja con la primera,
// y hay que decirlo (B9): el nombre de esa, o null si solo hay una.
function conVarias() {
  const carpetas = vscode.workspace.workspaceFolders;
  if (!carpetas || carpetas.length < 2) return null;
  return carpetas[0].name || path.basename(carpetas[0].uri.fsPath);
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
//
// La de conexiones no es solo la carpeta de la plantilla: son sus ficheros, como
// los pide RSC (`missingHarnessFloor`, en `onboarding-apply.js`). Con uno de
// menos, la barra decía «Listo» y RSC «incompleto» (G7). Se leen de la
// plantilla del arnés que viaja dentro, como hace RSC con la suya; `gitignore`
// viaja sin punto, porque npm no empaqueta un `.gitignore`.
//
// Si la del paquete no se puede leer, se exige esta, que es la de la versión de la
// clase (P7): la 2.0.5 y la 2.0.15 traen la misma. Un error ahí daba una lista vacía, y el suelo se conformaba con la
// carpeta sin decir nada; RSC no se lo come (`templateAssets`). Una prueba
// compara esta lista con la del paquete (revisión de F7, m5).
const PLANTILLA_DE_LA_CLASE = Object.freeze(['.env.example', '.gitignore', 'CREDENTIALS.md', 'README.md', 'test_connection.sh']);
const LA_DEL_PAQUETE = path.join(__dirname, '..', 'media', 'harness', 'node_modules', '@ericrisco', 'rsc', 'skills', 'harness', 'assets', '_TEMPLATE');

function ficherosDeLaPlantilla(donde = LA_DEL_PAQUETE) {
  try {
    return fs.readdirSync(donde).map((asset) => (asset === 'gitignore' ? '.gitignore' : asset));
  } catch {
    return [...PLANTILLA_DE_LA_CLASE];
  }
}

// Y la plantilla entera, solo si el recibo la pide: RSC saca el suelo del plan
// aceptado (`missingHarnessFloor`), y un recibo de antes, sin `floorPaths`, queda
// exento, con la plantilla a medias de las versiones que copiaban cuatro de sus
// cinco ficheros. Sin recibo, la carpeta (revisión de F7, m6).
function pideLaPlantillaEntera() {
  const plan = ((declaracion() || {}).onboarding || {}).plan || {};
  return Array.isArray(plan.floorPaths) && plan.floorPaths.some((p) => String(p).replace(/\/+$/, '') === '01-TOOLS/_TEMPLATE');
}

function sueloDelArnes() {
  return {
    declaracion: existe('.rsc.json'),
    conexiones: existe('01-TOOLS', '_TEMPLATE')
      && (!pideLaPlantillaEntera() || ficherosDeLaPlantilla().every((fichero) => existe('01-TOOLS', '_TEMPLATE', fichero))),
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
// Dentro está `record`, que ya contiene cinco de las nueve preguntas del
// arranque —nivel, dial, de qué va, objetivo y tamaño— y los targets. Es lo
// que permite no volver a preguntar lo que ya está contestado.
function recibo() {
  const declarado = declaracion();
  const plan = declarado && declarado.onboarding && declarado.onboarding.plan;
  return plan && plan.record ? plan : null;
}

// Lo que el plan aceptado pide además de las tres piezas de siempre. RSC lo
// guarda en el recibo (`floorPaths`), y con la cadena SDD incluye los
// innegociables, que `onboard` no escribe: los escribe la fase `constitution`
// con quien lleva el proyecto. Sin mirarlo, la barra decía «Listo» y RSC,
// «incompleto».
//
// Va aparte de `sueloDelArnes()` a propósito: esas tres las levanta volver a
// montar, y esta no. Metida allí, la carpeta se vería «a medias» y el arranque
// volvería a montar para nada.
const INNEGOCIABLES = ['02-DOCS', 'wiki', 'sdd', 'constitution.md'];

function faltanLosInnegociables() {
  const plan = recibo();
  const losPide = Boolean(plan) && Array.isArray(plan.floorPaths) && plan.floorPaths.includes(INNEGOCIABLES.join('/'));
  return losPide && !existe(...INNEGOCIABLES);
}

function versionDelCatalogo() {
  return (declaracion() || {}).catalogVersion || null;
}

module.exports = {
  raiz, ruta, existe, declaracion, comoEstaLaDeclaracion, recibo, sueloDelArnes, arnesCompleto, versionDelCatalogo,
  faltanLosInnegociables, INNEGOCIABLES, conVarias, ficherosDeLaPlantilla, PLANTILLA_DE_LA_CLASE,
};
