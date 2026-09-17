// "Qué quieres hacer": los botones que la barra descubre, no los que trae.
//
// Un botón por comando de `.claude/commands/` cuyo frontmatter lleve
// `boton:`. Nada está predefinido a propósito: el arnés de una gestoría no se
// parece al de una empresa de contratos, así que los botones los va creando
// Claude conforme el alumno repite tareas (la habilidad `executive-lab` le
// dice cuándo y cómo). Los comandos internos de RSC —checkpoint, learn,
// resume-session, save-session— no llevan `boton:` y por eso no salen.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');
const frontmatter = require('./frontmatter');

const CARPETA = ['.claude', 'commands'];

// Orden: primero lo que el alumno hace a diario, luego lo que aprendió a
// hacer. Dentro de cada grupo, por orden alfabético de etiqueta.
const ORDEN_DE_GRUPOS = ['diario', 'aprendido'];

function acciones() {
  const carpeta = proyecto.ruta(...CARPETA);
  if (!carpeta || !fs.existsSync(carpeta)) return [];

  const encontradas = [];
  for (const fichero of fs.readdirSync(carpeta)) {
    if (!fichero.endsWith('.md')) continue;

    const campos = frontmatter.leer(path.join(carpeta, fichero));
    const etiqueta = typeof campos.boton === 'string' ? campos.boton.trim() : '';
    if (!etiqueta) continue;

    const nombre = fichero.replace(/\.md$/, '');
    encontradas.push({
      nombre,
      etiqueta,
      icono: typeof campos.icono === 'string' ? campos.icono : '▸',
      grupo: ORDEN_DE_GRUPOS.includes(campos.grupo) ? campos.grupo : 'aprendido',
      prompt: `/${nombre}`,
    });
  }

  return encontradas.sort((a, b) => {
    const ga = ORDEN_DE_GRUPOS.indexOf(a.grupo);
    const gb = ORDEN_DE_GRUPOS.indexOf(b.grupo);
    return ga - gb || a.etiqueta.localeCompare(b.etiqueta, 'es');
  });
}

module.exports = { acciones };
