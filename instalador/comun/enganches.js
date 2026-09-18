// Que los enganches del arnés encuentren nuestro Node.
//
// Lo usan preparar.js (instalación de Windows) y el wizard de la extensión
// (macOS, donde las preguntas se hacen dentro del panel). Está aquí para que
// haya una sola versión de la misma costura.

const fs = require('node:fs');
const path = require('node:path');

// Los enganches del arnés llaman a `node` por su nombre, y en el ordenador de
// un alumno no hay ningún node en el PATH: el nuestro vive dentro de la carpeta
// de la app. En Windows el instalador lo añade al PATH del usuario, pero en
// macOS ya no hay symlinks en /usr/local/bin que valgan —eso pedía contraseña
// de administrador— así que aquí se deja escrita la ruta completa.
//
// Es un cinturón. El otro (una línea en el arranque del shell) lo pone el
// instalador, y hace falta porque un `sync` o un `repair` del arnés pueden
// volver a escribir estos ficheros con "node" a secas.
function fijarElNodeDeLosEnganches(destino, node = process.execPath, anotar = () => {}) {
  const citado = /\s/.test(node) ? `"${node}"` : node;
  let tocados = 0;

  for (const nombre of ['settings.json', 'settings.local.json']) {
    const fichero = path.join(destino, '.claude', nombre);
    if (!fs.existsSync(fichero)) continue;

    let datos;
    try {
      datos = JSON.parse(fs.readFileSync(fichero, 'utf8'));
    } catch {
      anotar(`AVISO: ${nombre} no es JSON; dejo los enganches como están.`);
      continue;
    }

    let cambiado = false;
    const recorrer = (nodo) => {
      if (Array.isArray(nodo)) return nodo.forEach(recorrer);
      if (!nodo || typeof nodo !== 'object') return;
      if (typeof nodo.command === 'string' && /^node\s/.test(nodo.command)) {
        nodo.command = nodo.command.replace(/^node\s/, `${citado} `);
        cambiado = true;
      }
      return Object.values(nodo).forEach(recorrer);
    };
    recorrer(datos);

    if (cambiado) {
      fs.writeFileSync(fichero, `${JSON.stringify(datos, null, 2)}\n`);
      tocados += 1;
    }
  }

  anotar(`Enganches apuntando a ${node}: ${tocados} fichero(s)`);
  return tocados;
}

module.exports = { fijarElNodeDeLosEnganches };
