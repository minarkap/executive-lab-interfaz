// Escribir en un settings.json de VS Code sin pisar lo que ya hubiera.
//
// Vive aquí, en comun/, porque lo usan los dos instaladores: el de Windows por
// medio de preparar.js y el de macOS directamente, antes incluso de que exista
// una carpeta de trabajo.
//
// Quien llama pasa `anotar` para que la explicación acabe en su registro: aquí
// no se imprime nada, que esto corre mientras el alumno mira una barra.

const fs = require('node:fs');
const path = require('node:path');

// Donde acaba el codigo de una linea: en el primer // que no este dentro de
// una cadena. Sin esto, una linea como  "url": "https://x"  se cortaria por
// la mitad, y una coma puesta despues de un comentario queda comentada.
function finDelCodigo(linea) {
  let dentro = false;
  for (let i = 0; i < linea.length; i += 1) {
    const c = linea[i];
    if (c === '"' && linea[i - 1] !== '\\') dentro = !dentro;
    else if (!dentro && c === '/' && linea[i + 1] === '/') return i;
  }
  return linea.length;
}

// Pone una coma al final de la ultima linea con contenido, antes de su
// comentario si lo tiene. Si lo ultimo es la llave de apertura, no hace falta.
function ponerComaAlFinal(texto) {
  const lineas = texto.split('\n');
  for (let i = lineas.length - 1; i >= 0; i -= 1) {
    const codigo = lineas[i].slice(0, finDelCodigo(lineas[i])).replace(/\s+$/, '');
    if (!codigo.trim()) continue;                 // linea vacia o solo comentario
    if (codigo.trim().endsWith('{')) return texto; // el objeto estaba vacio
    if (codigo.trim().endsWith(',')) return texto; // ya la tiene
    lineas[i] = codigo + ',' + lineas[i].slice(finDelCodigo(lineas[i]));
    return lineas.join('\n');
  }
  return texto;
}

// Escribe sin pisar lo que ya hubiera.
//
// El settings.json de VS Code admite comentarios, y mucha gente los tiene. Si
// se reparsea y se reescribe, se los cargamos. Asi que cuando no es JSON puro
// se insertan las claves como texto, justo antes de la llave de cierre: entra
// lo nuestro y lo suyo queda intacto, comentarios incluidos.
function escribirAjustes(fichero, nuevos, donde, anotar = () => {}) {
  fs.mkdirSync(path.dirname(fichero), { recursive: true });

  const claves = Object.keys(nuevos);
  if (!claves.length) return;

  if (!fs.existsSync(fichero)) {
    fs.writeFileSync(fichero, `${JSON.stringify(nuevos, null, 2)}\n`);
    anotar(`${claves.length} ajustes en ${donde} (nuevo)`);
    return;
  }

  const crudo = fs.readFileSync(fichero, 'utf8');

  // Camino limpio: JSON de verdad.
  try {
    const actuales = JSON.parse(crudo);
    fs.writeFileSync(fichero, `${JSON.stringify({ ...actuales, ...nuevos }, null, 2)}\n`);
    anotar(`${claves.length} ajustes en ${donde}`);
    return;
  } catch {
    /* tiene comentarios: se inserta a mano */
  }

  const cierre = crudo.lastIndexOf('}');
  if (cierre === -1) {
    anotar(`AVISO: no entiendo ${donde}; no lo toco.`);
    return;
  }

  // Las que ya estan escritas no se tocan: no vamos a duplicar una clave ni a
  // pisar lo que esa persona haya puesto a proposito.
  const faltan = claves.filter((c) => !new RegExp(`"${c.replace(/\./g, '\\.')}"\\s*:`).test(crudo));
  if (!faltan.length) {
    anotar(`${donde}: ya estaban puestas`);
    return;
  }

  fs.copyFileSync(fichero, `${fichero}.antes-de-executive-lab`);

  const lineas = faltan.map((c) => `  ${JSON.stringify(c)}: ${JSON.stringify(nuevos[c])}`).join(',\n');
  const antes = ponerComaAlFinal(crudo.slice(0, cierre).replace(/\s*$/, ''));

  fs.writeFileSync(fichero, `${antes}\n${lineas}\n${crudo.slice(cierre)}`);
  anotar(`${faltan.length} ajustes insertados en ${donde} (tiene comentarios: copia al lado)`);
}

module.exports = { escribirAjustes };
