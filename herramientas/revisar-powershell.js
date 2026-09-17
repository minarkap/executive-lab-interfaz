#!/usr/bin/env node
// Un repaso barato a los .ps1 antes de llevarlos a una máquina Windows.
//
//   node herramientas/revisar-powershell.js
//
// No es un analizador de PowerShell —para eso haría falta `pwsh`, que no está
// en este Mac— pero pilla lo que de verdad se rompe al escribirlos desde aquí:
// una coma colgando en un array (que ya nos costó un viaje), llaves o comillas
// descuadradas, y tildes, que PowerShell 5.1 destroza al leer UTF-8 sin BOM.

const fs = require('node:fs');
const path = require('node:path');

const CARPETA = path.join(__dirname, '..', 'instalador', 'windows');
const ficheros = fs.readdirSync(CARPETA).filter((f) => f.endsWith('.ps1'));

let fallos = 0;
const mal = (fichero, linea, que) => {
  console.error(`  ✗ ${fichero}${linea ? `:${linea}` : ''}  ${que}`);
  fallos += 1;
};

for (const fichero of ficheros) {
  const texto = fs.readFileSync(path.join(CARPETA, fichero), 'utf8');
  const lineas = texto.split('\n');

  // Una coma al final de la última entrada de un array: PowerShell la rechaza
  // con "Falta una expresión después de ','".
  lineas.forEach((linea, i) => {
    if (!/,\s*$/.test(linea)) return;
    const siguiente = (lineas[i + 1] || '').trim();
    if (siguiente.startsWith(')')) mal(fichero, i + 1, 'coma colgando antes de cerrar el array');
  });

  for (const [abre, cierra, nombre] of [['{', '}', 'llaves'], ['(', ')', 'paréntesis']]) {
    const a = (texto.match(new RegExp(`\\${abre}`, 'g')) || []).length;
    const c = (texto.match(new RegExp(`\\${cierra}`, 'g')) || []).length;
    if (a !== c) mal(fichero, null, `${nombre} descuadradas: ${a} abren, ${c} cierran`);
  }

  if ((texto.match(/"/g) || []).length % 2 !== 0) mal(fichero, null, 'comillas dobles impares');

  lineas.forEach((linea, i) => {
    if (/[áéíóúÁÉÍÓÚñÑ¿¡]/.test(linea)) mal(fichero, i + 1, 'lleva tildes: PowerShell 5.1 las destroza');
  });

  if (!fallos) console.log(`  ✓ ${fichero}`);
}

console.log(fallos ? `\n${fallos} cosas que arreglar antes de llevarlo a Windows.` : `\n${ficheros.length} ficheros revisados, sin pegas.`);
process.exit(fallos ? 1 : 0);
