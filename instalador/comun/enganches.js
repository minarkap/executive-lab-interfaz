// Que los enganches del arnés encuentren nuestro Node.
//
// Lo usan preparar.js (instalación de Windows) y el wizard de la extensión
// (macOS, donde las preguntas se hacen dentro del panel). Está aquí para que
// haya una sola versión de la misma costura.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Los enganches del arnés llaman a `node` por su nombre, y en el ordenador de
// un alumno no hay ningún node en el PATH: el nuestro vive dentro de la carpeta
// de la app. En Windows el instalador lo añade al PATH del usuario, pero en
// macOS ya no hay symlinks en /usr/local/bin que valgan —eso pedía contraseña
// de administrador— así que aquí se deja escrita la ruta completa.
//
// Es un cinturón. El otro (una línea en el arranque del shell) lo pone el
// instalador, y hace falta porque un `sync` o un `repair` del arnés pueden
// volver a escribir estos ficheros con "node" a secas.
// ── Y la ruta de OTRO ordenador también hay que arreglarla ───────────────
//
// Esto solo reescribía los enganches que empiezan por `node` a secas. Pero en
// cuanto uno se arregla, el fichero queda con una ruta absoluta — y
// `.claude/settings.json` viaja en git, porque es la costura del arnés y RSC
// la quiere versionada.
//
// Consecuencia: quien clonaba el proyecto de un compañero se llevaba los
// enganches apuntando al Mac de ese compañero, a una ruta que en su ordenador
// no existe. Y esto no volvía a tocarlos nunca, porque ya no empezaban por
// `node`. El arnés se quedaba sin su cuerpo siempre-activo, sin brújula y sin
// frenos, y nada lo decía: la forma de fallar que este proyecto no se permite
// (P3).
//
// Así que se mira qué hay delante y se arregla en dos casos: `node` a secas, y
// una ruta a un node **que no existe en este ordenador**. Una ruta que sí
// existe se respeta: puede ser el node bueno de esa máquina, puesto a mano.
const ENTRECOMILLADO = /^"([^"]+)"\s/;
const RUTA_SUELTA = /^(\S*node(?:\.exe)?)\s/i;

function elNodeDeLaOrden(orden) {
  if (/^node\s/.test(orden)) return { ruta: 'node', largo: 'node'.length, aSecas: true };
  const conComillas = orden.match(ENTRECOMILLADO);
  if (conComillas && /node(\.exe)?$/i.test(conComillas[1])) {
    return { ruta: conComillas[1], largo: conComillas[0].length - 1, aSecas: false };
  }
  const sinComillas = orden.match(RUTA_SUELTA);
  if (sinComillas && sinComillas[1].includes(path.sep)) {
    return { ruta: sinComillas[1], largo: sinComillas[1].length, aSecas: false };
  }
  return null;
}

// ── Y que git deje de contar como cambio lo que es de esta máquina ───────
//
// Arreglar la ruta deja el fichero distinto del que hay en el repositorio, y
// `.claude/settings.json` está versionado. Así que en cada ordenador sale
// **siempre como modificado**, para siempre, y el botón de guardar de la barra
// hace `add -A`: tarde o temprano alguien sube la ruta de su casa y se la lleva
// el siguiente.
//
// No se arregla eligiendo una ruta mejor: no la hay. El node bueno está en un
// sitio distinto en cada ordenador, y por eso este módulo existe. Lo que se
// puede es decirle a git, **en cada clon y solo ahí**, que ese fichero ya está
// como tiene que estar: `--skip-worktree`. El repositorio conserva la forma
// portable (`node` a secas), cada máquina conserva la suya, y nadie pisa a
// nadie.
//
// Es una marca local: no viaja, no se hereda al clonar, y la pone aquí cada
// instalación por su cuenta — que es justo lo que pedía el problema.
//
// Tres cosas que NO se hacen a propósito:
//
//   · Si no hay git, o la carpeta no es un repositorio, o el fichero no está
//     versionado (el caso de casi todos los alumnos): no hay nada que esconder.
//   · Si el fichero **no difiere** del repositorio, tampoco se marca. Esconder
//     por adelantado un fichero que está bien es esconder el próximo cambio de
//     verdad.
//   · No se toca `.gitignore` ni se saca el fichero del repositorio: RSC lo
//     quiere versionado, y un clon sin él se queda sin enganches.
//
// El precio, dicho: mientras la marca está puesta, un `git pull` que traiga un
// cambio de ese fichero se para y hay que quitarla a mano
// (`git update-index --no-skip-worktree .claude/settings.json`). Se para
// ruidosamente, que es como este proyecto prefiere fallar.
function queGitNoLoVea(destino, fichero, anotar = () => {}) {
  const rel = path.relative(destino, fichero).split(path.sep).join('/');
  const git = (...args) => execFileSync('git', ['-C', destino, ...args], {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
  });

  try {
    git('rev-parse', '--is-inside-work-tree');
    git('ls-files', '--error-unmatch', '--', rel);
  } catch {
    return false;
  }

  try {
    // Sale bien = no difiere del repositorio. Nada que esconder.
    git('diff', '--quiet', 'HEAD', '--', rel);
    return false;
  } catch { /* difiere: lleva la ruta de este ordenador */ }

  try {
    git('update-index', '--skip-worktree', '--', rel);
  } catch {
    return false;
  }
  anotar(`git deja de contar ${rel} como un cambio tuyo: lleva la ruta de este ordenador.`);
  return true;
}

function fijarElNodeDeLosEnganches(destino, node = process.execPath, anotar = () => {}) {
  const citado = /\s/.test(node) ? `"${node}"` : node;
  let tocados = 0;
  let heredados = 0;
  let escondidos = 0;

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
      if (typeof nodo.command === 'string') {
        const suyo = elNodeDeLaOrden(nodo.command);
        // Una ruta que existe en este ordenador se respeta, sea la nuestra o
        // la que alguien puso a mano. Lo que se arregla es `node` a secas —que
        // aquí puede no existir— y la ruta heredada de otra máquina.
        const hayQueTocarlo = suyo && (suyo.aSecas || !fs.existsSync(suyo.ruta));
        if (hayQueTocarlo) {
          if (!suyo.aSecas) heredados += 1;
          nodo.command = `${citado}${nodo.command.slice(suyo.largo)}`;
          cambiado = true;
        }
      }
      return Object.values(nodo).forEach(recorrer);
    };
    recorrer(datos);

    if (cambiado) {
      fs.writeFileSync(fichero, `${JSON.stringify(datos, null, 2)}\n`);
      tocados += 1;
    }

    // Arreglado el fichero, queda que git no lo cuente como un cambio de nadie.
    if (queGitNoLoVea(destino, fichero, anotar)) escondidos += 1;
  }

  anotar(`Enganches apuntando a ${node}: ${tocados} fichero(s)`
    + (heredados ? `; ${heredados} venían de otro ordenador y no habrían funcionado aquí` : '')
    + (escondidos ? `; ${escondidos} ya no lo cuenta git como cambio tuyo` : ''));
  return tocados;
}

module.exports = { fijarElNodeDeLosEnganches, queGitNoLoVea };
