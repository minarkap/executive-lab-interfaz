#!/usr/bin/env node
// Envuelve los ajustes del disfraz en un .code-profile importable a mano.
//
// La fuente de la verdad es extension/media/disfraz.json: es la extensión
// quien aplica el disfraz en el primer arranque, por la API de configuración.
// Este fichero solo sirve para probar el disfraz a mano en una máquina de
// desarrollo (paleta → Profiles: Import Profile…), no lo usa el instalador.

const fs = require('node:fs');
const path = require('node:path');

const NOMBRE = 'Executive Lab';
const EXTENSIONES = [
  { id: 'anthropic.claude-code', nombre: 'Claude Code' },
  { id: 'executivelab.panel', nombre: 'Executive Lab' },
];

const fuente = path.join(__dirname, '..', 'extension', 'media', 'disfraz.json');
const ajustes = JSON.parse(fs.readFileSync(fuente, 'utf8'));

const perfil = {
  name: NOMBRE,
  settings: JSON.stringify({ settings: JSON.stringify(ajustes, null, 2) }),
  extensions: JSON.stringify(EXTENSIONES.map(({ id, nombre }) => ({ identifier: { id }, displayName: nombre }))),
};

const destino = path.join(__dirname, 'executive-lab.code-profile');
fs.writeFileSync(destino, JSON.stringify(perfil, null, 2));
console.log(`Perfil escrito en ${destino}`);
console.log(`${Object.keys(ajustes).length} ajustes · ${EXTENSIONES.length} extensiones`);
