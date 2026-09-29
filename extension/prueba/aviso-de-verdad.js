#!/usr/bin/env node
// Un aviso de verdad: sale a GitHub con el código de la barra, le llegan sus
// etiquetas y se cierra.
//
//   GITHUB_TOKEN=$(gh auth token) node prueba/aviso-de-verdad.js
//
// ── A mano, y nunca en las máquinas de GitHub ───────────────────────────
//
// Abre una incidencia **pública**, con la cuenta de quien lo corre, cada vez
// que se lanza. En `humo.js` todo esto se prueba con un GitHub de mentira; esto
// es lo que no se puede fingir: que GitHub acepta lo que arma la barra, y que
// `.github/workflows/avisos.yml` reconoce su marca y le pone las etiquetas
// (decisión 133). La clave se lee del entorno y no se escribe en ningún sitio.

const Module = require('node:module');
const path = require('node:path');
const assert = require('node:assert/strict');

// `require('vscode')` solo existe dentro del editor: aquí se desvía al falso.
const resolver = Module._resolveFilename;
Module._resolveFilename = function (pedido, ...resto) {
  if (pedido === 'vscode') return require.resolve('./vscode-falso.js');
  return resolver.call(this, pedido, ...resto);
};

const avisos = require(path.join(__dirname, '..', 'src', 'avisos.js'));

const API = `https://api.github.com/repos/${avisos.REPO}/issues`;
const ESPERAR_ETIQUETAS = 3 * 60 * 1000;
const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

async function github(clave, url, { method = 'GET', cuerpo } = {}) {
  const respuesta = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${clave}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!respuesta.ok) throw new Error(`${method} ${url.replace(API, 'issues')}: ${respuesta.status}`);
  return respuesta.json();
}

async function main() {
  const clave = process.env.GITHUB_TOKEN;
  if (!clave) {
    console.error('Falta la clave: GITHUB_TOKEN=$(gh auth token) node prueba/aviso-de-verdad.js');
    process.exit(1);
  }
  const barra = require(path.join(__dirname, '..', 'package.json')).version;

  // Como lo arma la barra, con sus datos de verdad.
  const compuesto = avisos.componer({
    tipo: 'falla',
    origen: 'alumno',
    titulo: 'Prueba de la barra: un aviso de verdad, que se cierra solo',
    texto: 'Lo manda `prueba/aviso-de-verdad.js` para ver que un aviso llega entero y con sus etiquetas. Se cierra en cuanto las tiene.',
    datos: avisos.datos({ barra, editor: '(prueba)', tipo: 'falla', origen: 'alumno' }),
    barra,
  });

  const hecho = await avisos.mandar(compuesto, clave);
  assert.equal(hecho.ok, true, `GitHub no lo acepta: ${JSON.stringify(hecho)}`);
  console.log(`  ✓ sale: ${hecho.url}`);

  // El flujo tarda lo que tarda una máquina de GitHub en arrancar.
  const QUIERO = ['aviso de alumno', 'por revisar', 'falla'];
  const hasta = Date.now() + ESPERAR_ETIQUETAS;
  let tiene = [];
  while (Date.now() < hasta) {
    tiene = (await github(clave, `${API}/${hecho.numero}`)).labels.map((e) => e.name);
    if (QUIERO.every((e) => tiene.includes(e))) break;
    await esperar(5000);
  }

  await github(clave, `${API}/${hecho.numero}/comments`, {
    method: 'POST',
    cuerpo: { body: `Prueba de \`prueba/aviso-de-verdad.js\`: ${QUIERO.every((e) => tiene.includes(e)) ? 'ha llegado con sus etiquetas' : `le faltan etiquetas (tiene: ${tiene.join(', ') || 'ninguna'})`}. Se cierra sola.` },
  });
  await github(clave, `${API}/${hecho.numero}`, { method: 'PATCH', cuerpo: { state: 'closed', state_reason: 'not_planned' } });

  assert.deepEqual(QUIERO.filter((e) => !tiene.includes(e)), [], `el flujo no le ha puesto: ${QUIERO.filter((e) => !tiene.includes(e)).join(', ')}`);
  console.log(`  ✓ con sus etiquetas: ${tiene.join(' · ')}`);
  console.log(`  ✓ cerrada: #${hecho.numero}`);
}

main().catch((error) => {
  console.error(`  ✗ ${error.message}`);
  process.exit(1);
});
