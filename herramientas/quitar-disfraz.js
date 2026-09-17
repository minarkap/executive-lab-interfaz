#!/usr/bin/env node
// Quita el disfraz de un VS Code de verdad y deja el resto como estaba.
//
//   node herramientas/quitar-disfraz.js              # solo mira y cuenta
//   node herramientas/quitar-disfraz.js --hazlo      # lo quita, con copia antes
//   node herramientas/quitar-disfraz.js --hazlo --ajustes <ruta>
//
// Solo borra una clave si su valor es EXACTAMENTE el que pone el disfraz. Si
// la habías tocado tú, se queda como la tengas. Y antes de escribir hace una
// copia con la fecha al lado del original.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const hazlo = process.argv.includes('--hazlo');
const iAjustes = process.argv.indexOf('--ajustes');
const dado = iAjustes === -1 ? null : process.argv[iAjustes + 1];

function ajustesDeVsCode() {
  if (dado) return path.resolve(dado);
  const casa = os.homedir();
  if (process.platform === 'darwin') return path.join(casa, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  if (process.platform === 'win32') return path.join(process.env.APPDATA || '', 'Code', 'User', 'settings.json');
  return path.join(casa, '.config', 'Code', 'User', 'settings.json');
}

const disfraz = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'extension', 'media', 'disfraz.json'), 'utf8'));
const fichero = ajustesDeVsCode();

if (!fs.existsSync(fichero)) {
  console.log(`No hay ajustes en ${fichero}. Nada que quitar.`);
  process.exit(0);
}

let actuales;
const crudo = fs.readFileSync(fichero, 'utf8');
try {
  actuales = JSON.parse(crudo);
} catch {
  console.error(`No puedo leer ${fichero}: tiene comentarios o no es JSON válido.`);
  console.error('Ábrelo a mano y borra las claves del disfraz; no lo toco para no estropearlo.');
  process.exit(1);
}

const mismo = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const delDisfraz = Object.keys(disfraz).filter((k) => k in actuales && mismo(actuales[k], disfraz[k]));
const tuyas = Object.keys(disfraz).filter((k) => k in actuales && !mismo(actuales[k], disfraz[k]));

console.log(`Ajustes: ${fichero}`);
console.log(`  ${Object.keys(actuales).length} claves en total`);
console.log(`  ${delDisfraz.length} puestas por el disfraz — se quitarían`);
if (tuyas.length) console.log(`  ${tuyas.length} con un valor distinto al del disfraz — NO se tocan: ${tuyas.join(', ')}`);

if (!delDisfraz.length) {
  console.log('\nNo hay nada del disfraz en estos ajustes.');
  process.exit(0);
}

if (!hazlo) {
  console.log('\nEsto es solo una mirada. Para quitarlas de verdad:');
  console.log('  node herramientas/quitar-disfraz.js --hazlo');
  process.exit(0);
}

const copia = `${fichero}.antes-de-executive-lab-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}`;
fs.copyFileSync(fichero, copia);

const limpios = { ...actuales };
for (const clave of delDisfraz) delete limpios[clave];
fs.writeFileSync(fichero, `${JSON.stringify(limpios, null, 2)}\n`);

console.log(`\nQuitadas ${delDisfraz.length} claves.`);
console.log(`Copia de lo que había: ${copia}`);
console.log('Cierra y abre VS Code para verlo.');
