// Lo que ha aprendido de ti: las lecciones de la memoria de RSC.
//
// ── Qué son, y por qué no son la wiki ────────────────────────────────────
//
// La wiki es lo que el asistente sabe **de tu negocio**: cómo se factura aquí,
// quién paga a sesenta días. Esto es otra cosa: lo que ha aprendido **sobre
// cómo trabajar contigo**. «Prefiere que le pregunte antes de tocar precios.»
// «Los viernes no quiere que le mande nada.»
//
// Son dos cosas distintas y la barra solo enseñaba la primera.
//
// ── Cómo se guardan, que importa ─────────────────────────────────────────
//
// Una lección solo se escribe **con tu aprobación explícita**, una a una: es lo
// que hace el comando `learn` del arnés. No se acumulan solas. Por eso aquí
// casi siempre habrá pocas, y por eso enseñarlas vale la pena — cada una la
// aprobó alguien.
//
// Cada una trae su `confidence` (0 a 1) y su `evidence`, que es en qué se basa.
// Lo que se enseña es el texto y la prueba; el número no sale, porque un 0,7
// no le dice nada a nadie.

const fs = require('node:fs');
const path = require('node:path');
const proyecto = require('./proyecto');

// RSC guarda su memoria en uno de dos sitios según si el diario va en git o no
// (`chooseMemoryRoot`). Se miran los dos, que es más barato que adivinar.
const SITIOS = [
  ['.rsc', 'memory', 'lessons'],
  ['02-DOCS', 'raw', 'worklog', '.rsc-memory', 'lessons'],
];

const TOPE = 30;

function carpeta() {
  for (const partes of SITIOS) {
    const donde = proyecto.ruta(...partes);
    if (donde && fs.existsSync(donde)) return donde;
  }
  return null;
}

function queHaAprendido(cuantas = TOPE) {
  const donde = carpeta();
  if (!donde) return [];

  let nombres;
  try {
    nombres = fs.readdirSync(donde).filter((n) => n.endsWith('.json'));
  } catch {
    return [];
  }

  const leidas = [];
  for (const nombre of nombres) {
    try {
      const cruda = JSON.parse(fs.readFileSync(path.join(donde, nombre), 'utf8'));
      const texto = typeof cruda.text === 'string' ? cruda.text.trim() : '';
      if (!texto) continue;
      leidas.push({
        id: String(cruda.id || nombre),
        texto,
        porque: typeof cruda.evidence === 'string' ? cruda.evidence.trim() : '',
        cuando: typeof cruda.approvedAt === 'string' ? cruda.approvedAt.slice(0, 10) : '',
        // `global` o esta carpeta: cambia si vale para todo o solo para aquí.
        donde: cruda.scope === 'global' ? 'todo' : 'aqui',
      });
    } catch { /* una rota no tumba las demás */ }
  }

  return leidas
    .sort((a, b) => String(b.cuando).localeCompare(String(a.cuando)))
    .slice(0, cuantas);
}

const cuantas = () => queHaAprendido(TOPE).length;

module.exports = { queHaAprendido, cuantas };
