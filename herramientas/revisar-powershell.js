#!/usr/bin/env node
// Un repaso barato a los .ps1 antes de llevarlos a una máquina Windows.
//
//   node herramientas/revisar-powershell.js
//
// No es un analizador de PowerShell —para eso haría falta `pwsh`, que no está
// en este Mac— y no lo intenta ser: contar llaves y paréntesis con expresiones
// regulares da falsas alarmas con cada `"1) La carpeta"` o cada `-replace '"'`,
// y un comprobador que grita en falso es peor que ninguno.
//
// Se queda con las dos cosas que sí han pillado fallos de verdad: una coma
// colgando en un array (nos costó un viaje a Windows) y las tildes, que
// PowerShell 5.1 destroza al leer UTF-8 sin BOM.

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

  lineas.forEach((linea, i) => {
    // No solo las tildes: cualquier cosa que no sea ASCII. PowerShell 5.1 lee un
    // UTF-8 sin BOM como Windows-1252, y la raya «—» (E2 80 94) acaba en 0x94, que
    // ahí es la comilla «”», y PowerShell acepta las comillas tipográficas como
    // final de cadena: probar.ps1 no llegaba ni a leerse («MissingEndCurlyBrace»,
    // en la máquina Windows de GitHub, 28-09-2026).
    if (/[áéíóúÁÉÍÓÚñÑ¿¡]/.test(linea)) mal(fichero, i + 1, 'lleva tildes: PowerShell 5.1 las destroza');
    else if (/[^\x20-\x7e\t\r]/.test(linea)) mal(fichero, i + 1, 'lleva algo que no es ASCII: PowerShell 5.1 lo lee como Windows-1252, y una raya «—» le cierra la cadena');
  });

  if (!fallos) console.log(`  ✓ ${fichero}`);
}

console.log(fallos ? `\n${fallos} cosas que arreglar antes de llevarlo a Windows.` : `\n${ficheros.length} ficheros revisados, sin pegas.`);
process.exit(fallos ? 1 : 0);
