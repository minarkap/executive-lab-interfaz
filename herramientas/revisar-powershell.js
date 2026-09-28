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
// Se queda con lo que sí ha pillado fallos de verdad: una coma colgando en un
// array (nos costó un viaje a Windows), cualquier cosa que no sea ASCII, que
// PowerShell 5.1 destroza al leer UTF-8 sin BOM, y un .Count sin @(), que con un
// solo resultado es nulo. Las dos últimas las cazó la máquina Windows de GitHub.

const fs = require('node:fs');
const path = require('node:path');

const CARPETA = path.join(__dirname, '..', 'instalador', 'windows');

// Un `.Count` sobre lo que devuelve una tubería o un cmdlet, sin `@()`. Con un solo
// resultado, PowerShell 5.1 da un objeto suelto, y su `.Count` es nulo: probar.ps1
// decía «13 bien,  mal», y con una comprobación mal salía con 0, porque
// `$null -gt 0` es falso (máquina Windows de GitHub, 28-09-2026).
//
// No basta con mirar el Where-Object más simple (revisión de lo que pedía una
// persona): se busca el paréntesis que abre cada «).Count», contando los de
// dentro, y se marca si no va detrás de una @ y lo de dentro es una tubería o un
// cmdlet (Verbo-Nombre: Select-String, Get-ChildItem…).
function countSinArray(linea) {
  const cierres = /\)\.Count\b/g;
  for (let m = cierres.exec(linea); m; m = cierres.exec(linea)) {
    let profundidad = 0;
    let i = m.index;
    for (; i >= 0; i -= 1) {
      if (linea[i] === ')') profundidad += 1;
      else if (linea[i] === '(' && (profundidad -= 1) === 0) break;
    }
    if (i < 0 || linea[i - 1] === '@') continue;
    const dentro = linea.slice(i + 1, m.index);
    if (dentro.includes('|') || /^\s*[A-Z][a-z]+-[A-Z][A-Za-z]+/.test(dentro)) return true;
  }
  return false;
}

// Lo que se revisa de un texto de PowerShell: la lista de lo que falla, con su línea.
function revisar(texto) {
  const problemas = [];
  const mal = (linea, que) => problemas.push({ linea, que });
  const lineas = String(texto).split('\n');

  // Una coma al final de la última entrada de un array: PowerShell la rechaza
  // con "Falta una expresión después de ','".
  lineas.forEach((linea, i) => {
    if (!/,\s*$/.test(linea)) return;
    const siguiente = (lineas[i + 1] || '').trim();
    if (siguiente.startsWith(')')) mal(i + 1, 'coma colgando antes de cerrar el array');
  });

  lineas.forEach((linea, i) => {
    if (countSinArray(linea)) mal(i + 1, 'un .Count de una tubería o un cmdlet sin @(): con un solo resultado, PowerShell 5.1 lo da nulo');
    // No solo las tildes: cualquier cosa que no sea ASCII. PowerShell 5.1 lee un
    // UTF-8 sin BOM como Windows-1252, y la raya «—» (E2 80 94) acaba en 0x94, que
    // ahí es la comilla «”», y PowerShell acepta las comillas tipográficas como
    // final de cadena: probar.ps1 no llegaba ni a leerse («MissingEndCurlyBrace»,
    // en la máquina Windows de GitHub, 28-09-2026).
    if (/[áéíóúÁÉÍÓÚñÑ¿¡]/.test(linea)) mal(i + 1, 'lleva tildes: PowerShell 5.1 las destroza');
    else if (/[^\x20-\x7e\t\r]/.test(linea)) mal(i + 1, 'lleva algo que no es ASCII: PowerShell 5.1 lo lee como Windows-1252, y una raya «—» le cierra la cadena');
  });
  return problemas;
}

module.exports = { revisar };

if (require.main === module) {
  const ficheros = fs.readdirSync(CARPETA).filter((f) => f.endsWith('.ps1'));
  let fallos = 0;
  for (const fichero of ficheros) {
    const problemas = revisar(fs.readFileSync(path.join(CARPETA, fichero), 'utf8'));
    for (const p of problemas) console.error(`  ✗ ${fichero}:${p.linea}  ${p.que}`);
    if (!problemas.length) console.log(`  ✓ ${fichero}`);
    fallos += problemas.length;
  }
  console.log(fallos ? `\n${fallos} cosas que arreglar antes de llevarlo a Windows.` : `\n${ficheros.length} ficheros revisados, sin pegas.`);
  process.exit(fallos ? 1 : 0);
}
