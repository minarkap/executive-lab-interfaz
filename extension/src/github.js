// GitHub: si esta persona ya está conectada, y a dónde va su copia de fuera.
//
// Por qué existe: "Guardar una copia fuera de este ordenador" pedía una clave
// escrita a mano en `01-TOOLS/github/.env`. Para alguien que no programa, sacar
// un token de GitHub es de las cosas más difíciles que se le pueden pedir: hay
// que entrar en ajustes de desarrollador, elegir permisos y copiar una cadena
// que solo se ve una vez.
//
// Y no hacía falta: **VS Code ya sabe iniciar sesión en GitHub**. Trae su
// proveedor de autenticación dentro, con el botón de siempre y el navegador. Si
// esa persona ya ha entrado alguna vez —para sincronizar sus ajustes, para
// Copilot, para lo que sea— ya está conectada y aquí no hay nada que pedir.
//
// Así que el orden es: primero la sesión del editor, y solo si no la hay, la
// clave a mano. Y si no hay ninguna de las dos, una guía en vez de un error.

const vscode = require('vscode');
const procesos = require('./procesos');

// `repo` es el permiso mínimo para crear un sitio privado y subir ahí. No se
// piden más: los permisos de una sesión se le enseñan a esa persona y una
// lista larga asusta con razón.
const PERMISOS = ['repo'];

// Mirar sin molestar. `silent` quiere decir que si no hay sesión NO se abre
// ningún diálogo: devuelve nada y ya. Es lo que se llama al pintar el panel,
// que no puede ponerse a pedir cosas solo.
async function sesion() {
  try {
    return await vscode.authentication.getSession('github', PERMISOS, { silent: true });
  } catch {
    return null;
  }
}

// Pedirla, con el diálogo del editor. Solo cuando alguien ha pulsado un botón.
async function conectar() {
  try {
    const cual = await vscode.authentication.getSession('github', PERMISOS, { createIfNone: true });
    return cual ? { ok: true, usuario: cual.account && cual.account.label } : { ok: false };
  } catch (error) {
    // Cancelar el diálogo llega aquí como excepción, y cancelar no es un fallo.
    return { ok: false, cancelado: true, detalle: error && error.message };
  }
}

// A dónde apunta hoy esta carpeta, si es que apunta a algún sitio.
async function remoto() {
  const { codigo, salida } = await procesos.git('remote', 'get-url', 'origin');
  if (codigo !== 0) return null;

  const url = salida.trim();
  if (!url) return null;

  // Solo para enseñarlo: "minarkap/lo-mio" se lee, una URL entera no.
  const corto = url.replace(/^git@github\.com:/, '').replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
  return { url, corto, esGitHub: /github\.com/.test(url) };
}

// Todo junto, que es lo que el panel necesita para decidir qué enseñar.
async function estado() {
  const [cual, donde] = await Promise.all([sesion(), remoto()]);
  return {
    conectado: Boolean(cual),
    usuario: cual && cual.account ? cual.account.label : null,
    remoto: donde,
  };
}

module.exports = { estado, sesion, conectar, remoto, PERMISOS };
