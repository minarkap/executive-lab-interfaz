// Los enganches del arnés, como los escribe el arnés: llamando a `node` por su
// nombre.
//
// Lo usa la extensión, al montar y al abrir una carpeta. Vive en comun/ porque
// también lo usaba el instalador, y es la misma costura.
//
// ── Lo que se hacía antes, y por qué se deshace ──────────────────────────
//
// RSC escribe sus enganches como `node …`, y en el ordenador de un alumno puede
// no haber ningún `node` en el PATH. Hasta la decisión 119, este módulo los
// reescribía con la ruta completa del Node de la app en `.claude/settings.json`.
// Ese fichero viaja en git, porque es la costura del arnés, y de ahí salía todo:
//
//   · cada clon heredaba la ruta del ordenador de otro, que en el suyo no
//     existe, y el arnés se quedaba sin enganches sin que nada lo dijera;
//   · la ruta entraba en el punto de partida, que se guarda justo después;
//   · el siguiente `sync` de RSC la devolvía a `node`, y el siguiente montaje
//     volvía a escribirla: iba y venía;
//   · se reescribían también órdenes `node` que no eran del arnés;
//   · y para que git no la contara como un cambio se le puso una marca
//     (`--skip-worktree`, 2b139bc). Con ella, un `git pull` que trajera cambios
//     de ese fichero se paraba, y lo que el arnés cambiara ahí no entraba en
//     ninguna copia.
//
// Ahora a `node` lo encuentra el relevo de la barra (`extension/src/relevo.js`),
// por el PATH, y no hace falta escribir ninguna ruta en ningún fichero. Lo que
// queda es deshacer lo que se escribió.
//
// ── Qué vuelve a `node`, y qué no ────────────────────────────────────────
//
//   · En las órdenes del arnés (las que corren algo de `.rsc/` o su arranque,
//     `.claude/rsc-bootstrap.mjs`) y en las nuestras
//     (`.claude/skills/executive-lab/`), cualquier ruta a un node: el arnés las
//     escribe con `node` a secas, y su próximo `sync` haría lo mismo.
//   · En cualquier otra orden, solo la ruta del Node de Executive Lab, que solo
//     pudo ponerla la barra. La que alguien puso a mano en una orden suya se
//     respeta.
//   · Lo que no es node no se toca nunca.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// El programa con que empieza la orden: `node` a secas, una ruta entre
// comillas, o una ruta sin ellas.
const ENTRECOMILLADO = /^"([^"]+)"\s/;
const RUTA_SUELTA = /^(\S*node(?:\.exe)?)\s/i;

function elNodeDeLaOrden(orden) {
  if (/^node\s/.test(orden)) return { ruta: 'node', largo: 'node'.length, aSecas: true };
  const conComillas = orden.match(ENTRECOMILLADO);
  if (conComillas && /node(\.exe)?$/i.test(conComillas[1])) {
    return { ruta: conComillas[1], largo: conComillas[0].length - 1, aSecas: false };
  }
  const sinComillas = orden.match(RUTA_SUELTA);
  if (sinComillas && /[\\/]/.test(sinComillas[1])) {
    return { ruta: sinComillas[1], largo: sinComillas[1].length, aSecas: false };
  }
  return null;
}

// Las órdenes del arnés y las nuestras, por lo que corren.
const DEL_ARNES = /\/\.rsc\/|\.claude\/rsc-bootstrap\.mjs|\.claude\/skills\/executive-lab\//;

// La ruta del Node que trae Executive Lab, en cualquier ordenador: la de su app
// (`…/ExecutiveLab/runtime/`, en Mac y en Windows), la antigua de /usr/local, y
// la que declara quien lo prueba (`EXECUTIVE_LAB_HOME`).
function esElNuestro(texto) {
  const normal = String(texto).replace(/\\/g, '/').toLowerCase();
  if (/\/executivelab\/runtime\//.test(normal) || /\/executive-lab\/runtime\//.test(normal)) return true;
  const declarada = process.env.EXECUTIVE_LAB_HOME;
  return Boolean(declarada) && normal.includes(`${path.join(declarada, 'runtime').replace(/\\/g, '/').toLowerCase()}/`);
}

// Todas las órdenes del fichero, estén donde estén.
function lasOrdenes(nodo, cada) {
  if (Array.isArray(nodo)) return nodo.forEach((n) => lasOrdenes(n, cada));
  if (!nodo || typeof nodo !== 'object') return undefined;
  if (typeof nodo.command === 'string') cada(nodo);
  return Object.values(nodo).forEach((n) => lasOrdenes(n, cada));
}

// La marca de 2b139bc, fuera. Solo con un git que se pueda usar: en un Mac sin
// las herramientas de Apple, `git` a secas abre su diálogo, así que quien llama
// dice cuál, o ninguno.
function quitarLaMarca(destino, fichero, git, anotar) {
  const rel = path.relative(destino, fichero).split(path.sep).join('/');
  const correr = (...args) => execFileSync(git, ['-C', destino, ...args], {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true,
  });
  try {
    // `S` es la marca; en minúscula, la misma con otra encima que no es nuestra.
    if (!/^[Ss] /.test(correr('ls-files', '-v', '--', rel))) return false;
    correr('update-index', '--no-skip-worktree', '--', rel);
  } catch {
    return false; // sin repositorio, o con el fichero fuera de él
  }
  anotar(`git vuelve a ver ${rel}: ya no lleva la ruta de este ordenador.`);
  return true;
}

// `git`: el git con el que quitar la marca, o null para no tocar git.
function devolverElNodeASecas(destino, { git = null, anotar = () => {} } = {}) {
  let devueltos = 0;
  let desmarcados = 0;

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

    let aqui = 0;
    lasOrdenes(datos, (enganche) => {
      const suyo = elNodeDeLaOrden(enganche.command);
      if (!suyo || suyo.aSecas) return;
      if (!DEL_ARNES.test(enganche.command) && !esElNuestro(suyo.ruta)) return;
      enganche.command = `node${enganche.command.slice(suyo.largo)}`;
      aqui += 1;
    });
    if (aqui) {
      fs.writeFileSync(fichero, `${JSON.stringify(datos, null, 2)}\n`);
      devueltos += aqui;
    }

    // Sin ninguna ruta nuestra, la marca que la escondía sobra. Si queda una
    // en una orden que no se sabe leer, la marca se queda: quitarla la subiría.
    let quedan = 0;
    lasOrdenes(datos, (enganche) => { if (esElNuestro(enganche.command)) quedan += 1; });
    if (quedan) {
      anotar(`AVISO: en ${nombre} queda ${quedan} orden(es) con la ruta de este ordenador que no sé devolver.`);
    } else if (git && quitarLaMarca(destino, fichero, git, anotar)) {
      desmarcados += 1;
    }
  }

  if (devueltos) anotar(`Enganches devueltos a node: ${devueltos}. Los encuentra el relevo de la barra.`);
  return { devueltos, desmarcados };
}

module.exports = { devolverElNodeASecas, elNodeDeLaOrden };
