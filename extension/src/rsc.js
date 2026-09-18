// Hablar con el arnés RSC.
//
// Siempre con la versión fijada, nunca con @latest: toda la cohorte tiene que
// correr exactamente el mismo catálogo, o dejan de servir las instrucciones de
// clase. Y siempre a través de node + el punto de entrada del paquete: sin npx
// por medio, que en Windows es un .cmd y en cualquier sitio tarda segundos.

const fs = require('node:fs');
const procesos = require('./procesos');
const proyecto = require('./proyecto');
const entorno = require('./entorno');

// Último recurso si .rsc.json no dice versión. Se actualiza a mano, a
// propósito: subir de versión es una decisión, no un efecto secundario.
const VERSION_DE_RESPALDO = '1.4.1';

function paquete() {
  return `@ericrisco/rsc@${proyecto.versionDelCatalogo() || VERSION_DE_RESPALDO}`;
}

// Cómo se invoca, por orden de preferencia:
//   1. el arnés preinstalado por el instalador (o el del proyecto) → node rsc.js
//   2. npx-cli.js del node que tengamos → node npx-cli.js --yes @ericrisco/rsc@X
//   3. npx del PATH (máquina de desarrollo), pasando por cmd.exe en Windows
// La carpeta de la extensión la pone extension.js al arrancar: desde aquí no
// hay forma de saberla, y es donde puede viajar el arnés.
let carpetaDeLaExtension = null;
const saberDondeEstamos = (ruta) => { carpetaDeLaExtension = ruta; };

async function correr(args, opciones) {
  const entrada = entorno.entradaDelArnes(proyecto.raiz(), carpetaDeLaExtension);
  if (entrada) return procesos.node([entrada, ...args], opciones);

  const npx = entorno.npxCli();
  if (npx) return procesos.node([npx, '--yes', paquete(), ...args], opciones);

  return procesos.delPath('npx', ['--yes', paquete(), ...args], opciones);
}

// Dónde se quedó la última sesión, según el checkpoint local de RSC. Devuelve
// null cuando no hay nada: RSC responde con éxito y un aviso entre paréntesis.
async function retomar() {
  const { codigo, salida } = await correr(['memory', 'resume'], { tiempoMaximo: 20000 });
  if (codigo !== 0) return null;
  const texto = salida.trim();
  if (!texto || /^\(no local continuation/i.test(texto)) return null;
  return texto;
}

// Enseñarle algo nuevo del catálogo. El catálogo viaja dentro del paquete,
// así que esto no necesita red.
//
// OJO: `rsc add` de la 1.4.1 dice "Installed" pase lo que pase, incluso con un
// identificador que no existe (comprobado el 17-09-2026 con `add --help`). Por
// eso no se cree a su código de salida: se mira si la habilidad ha aparecido
// de verdad en el disco.
async function anadir(id) {
  if (!/^[a-z0-9-]{2,40}$/.test(id)) return { ok: false };

  const quien = ((proyecto.declaracion() || {}).targets || ['claude'])[0];
  await correr(['add', id, '--target', quien], { tiempoMaximo: 180000 });
  return { ok: habilidadesPuestas().includes(id) };
}

// Las habilidades que esta carpeta ya tiene puestas.
function habilidadesPuestas() {
  const carpeta = proyecto.ruta('.claude', 'skills');
  const enDisco = carpeta && fs.existsSync(carpeta)
    ? fs.readdirSync(carpeta, { withFileTypes: true })
      .filter((e) => (e.isDirectory() || e.isSymbolicLink()) && !e.name.startsWith('.'))
      .map((e) => e.name)
    : [];
  const declaracion = proyecto.declaracion() || {};
  return [...new Set([...enDisco, ...(declaracion.skills || []), ...(declaracion.ownSkills || [])])];
}

const revisar = () => correr(['doctor'], { tiempoMaximo: 120000 });
const arreglarEnSeco = () => correr(['repair', '--dry-run'], { tiempoMaximo: 120000 });
const arreglar = () => correr(['repair'], { tiempoMaximo: 180000 });

module.exports = { correr, retomar, revisar, arreglarEnSeco, arreglar, paquete, saberDondeEstamos };
