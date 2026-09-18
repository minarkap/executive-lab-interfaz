// Cómo quieres que trabaje: lo que se puede ajustar del comportamiento.
//
// Tres cosas que hasta ahora se decidían solas o no se decidían:
//
//   1. **Qué puede hacer sin preguntarte.** Es el ajuste que más miedo da a
//      alguien no técnico —"¿y si me borra algo?"— y vivía en un fichero de
//      configuración que no se enseña. Se escribe en `.claude/settings.json`,
//      que es de Claude; Codex lo lleva por su cuenta y eso se dice en pantalla
//      en vez de fingir que lo controlamos.
//   2. **Cada cuánto guarda solo.** No existía: guardar era siempre a mano, y
//      quien no se acuerda de pulsar el botón no tiene copias. Justo el público
//      de esto.
//   3. **El objetivo y los límites**, que se escriben el día que se monta la
//      carpeta y no se vuelven a ver nunca.

const fs = require('node:fs');
const path = require('node:path');
const vscode = require('vscode');
const proyecto = require('./proyecto');
const identidad = require('./identidad');

// ------------------------------------------- qué puede hacer sin preguntar

// Los modos de Claude Code, dichos por lo que le pasa a quien lo usa. El
// cuarto que existe —saltarse los permisos— no se ofrece: no es un ajuste, es
// quitarle el freno de mano a alguien que no sabe que lo tiene.
const PERMISOS = [
  { id: 'plan', nombre: 'Que me lo proponga antes', frase: 'Te cuenta lo que va a hacer y espera a que digas que sí. Lo más prudente.' },
  { id: 'default', nombre: 'Que me pregunte al cambiar algo', frase: 'Lee y mira por su cuenta, pero te pide permiso antes de tocar nada. Lo normal.' },
  { id: 'acceptEdits', nombre: 'Que cambie ficheros sin preguntar', frase: 'Va más rápido y te interrumpe menos. Ten copias al día.' },
];

const AJUSTES_DE_CLAUDE = ['.claude', 'settings.json'];

function leerJson(...partes) {
  const ruta = proyecto.ruta(...partes);
  if (!ruta || !fs.existsSync(ruta)) return null;
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch {
    return null;
  }
}

function permisoDeAhora() {
  const ajustes = leerJson(...AJUSTES_DE_CLAUDE) || {};
  const cual = ajustes.permissions && ajustes.permissions.defaultMode;
  return PERMISOS.some((p) => p.id === cual) ? cual : 'default';
}

// Se escribe respetando todo lo demás del fichero: ahí viven los enganches del
// arnés, y perderlos dejaría la carpeta a medias sin que se note.
function ponerPermiso(cual) {
  if (!PERMISOS.some((p) => p.id === cual)) return { ok: false, mensaje: 'Eso no es una de las opciones.' };

  const ruta = proyecto.ruta(...AJUSTES_DE_CLAUDE);
  if (!ruta) return { ok: false, mensaje: 'Esta carpeta todavía no está preparada.' };

  const ajustes = leerJson(...AJUSTES_DE_CLAUDE) || {};
  const nuevo = { ...ajustes, permissions: { ...(ajustes.permissions || {}), defaultMode: cual } };

  try {
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, `${JSON.stringify(nuevo, null, 2)}\n`);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo. Prueba con "Algo va mal".' };
  }
  return { ok: true, mensaje: 'Hecho. Se nota en la próxima conversación que abras.' };
}

// ---------------------------------------------------- cada cuánto guarda

// En horas. El cero es "no lo hagas".
const CADA_CUANTO = [
  { id: 0, nombre: 'Solo cuando yo lo diga', frase: 'Como hasta ahora: se guarda cuando pulsas el botón.' },
  { id: 1, nombre: 'Cada hora', frase: 'Mientras tengas esto abierto y haya algo nuevo que guardar.' },
  { id: 8, nombre: 'Un par de veces al día', frase: 'Suficiente para no perder una mañana de trabajo.' },
];

const CLAVE_GUARDADO = 'executiveLab.guardarSolo';

const cadaCuantoGuarda = () => {
  const puesto = vscode.workspace.getConfiguration().get(CLAVE_GUARDADO);
  return CADA_CUANTO.some((c) => c.id === puesto) ? puesto : 0;
};

async function ponerCadaCuanto(horas) {
  const cual = Number(horas);
  if (!CADA_CUANTO.some((c) => c.id === cual)) return { ok: false, mensaje: 'Eso no es una de las opciones.' };
  try {
    // Por carpeta, no global: cada arnés lleva su ritmo.
    await vscode.workspace.getConfiguration().update(CLAVE_GUARDADO, cual, vscode.ConfigurationTarget.Workspace);
  } catch {
    return { ok: false, mensaje: 'No he podido guardarlo. Prueba con "Algo va mal".' };
  }
  return { ok: true, mensaje: cual ? 'Hecho. A partir de ahora guarda solo.' : 'Hecho. Solo guardará cuando lo pidas.' };
}

// -------------------------------------------------- el objetivo y los límites

// Se escriben el día que se monta la carpeta y no se vuelven a ver nunca. Están
// en el perfil, que es lo que el asistente lee antes de contestar: si el
// objetivo ya no es el de entonces, está trabajando para el de entonces.
function seccionDelPerfil(nombres) {
  const ruta = proyecto.ruta(...identidad.PERFIL);
  if (!ruta) return [];
  let texto;
  try {
    texto = fs.readFileSync(ruta, 'utf8');
  } catch {
    return [];
  }

  for (const nombre of nombres) {
    const desde = texto.search(new RegExp(`^##\\s+${nombre}\\s*$`, 'mi'));
    if (desde === -1) continue;
    const resto = texto.slice(desde).split('\n').slice(1).join('\n');
    const hasta = resto.search(/^##\s+/m);
    const trozo = hasta === -1 ? resto : resto.slice(0, hasta);

    const puntos = trozo.split('\n')
      .map((l) => l.match(/^\s*[-*]\s+(.{3,})$/))
      .filter(Boolean)
      .map((m) => m[1].trim())
      .filter((t) => !/[{}]/.test(t));
    if (puntos.length) return puntos;
  }
  return [];
}

function comoEstamos() {
  return {
    permisos: PERMISOS,
    permiso: permisoDeAhora(),
    cadaCuanto: CADA_CUANTO,
    guarda: cadaCuantoGuarda(),
    objetivo: identidad.objetivo(),
    metas: seccionDelPerfil(['Goals', 'Objetivos']),
    limites: seccionDelPerfil(['Constraints', 'Límites', 'Limites']),
  };
}

module.exports = {
  comoEstamos, ponerPermiso, ponerCadaCuanto, cadaCuantoGuarda, PERMISOS, CADA_CUANTO, CLAVE_GUARDADO,
};
