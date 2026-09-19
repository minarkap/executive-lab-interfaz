# Harness decisions

- Accepted plan `434ebdda2d12e72195a3b0a9ba0e57e6171e56ae1f19bc4f89d93223d9ae36a3`.
- Project kind: software.
- SDD: deferred.

## Auditoría del arnés para Codex y para Claude — 18 de septiembre de 2026

Informe entero en `docs/auditoria-codex-y-claude.md`. Lo que cambió de fondo:

- **La tabla de dónde mira cada asistente es una sola**, en `skills/sitios.js`, sin dependencias, y la
  leen los dos que la necesitan: la barra y el instalador de raíles. Antes cada uno tenía la suya y se
  separaron.
- **Los raíles se ponen donde mire el asistente de esa carpeta**, no siempre en `.claude/`. Con Codex
  van a `.codex/rsc/`, no se escriben comandos —RSC no le escribe ninguno— y se le apunta a la
  habilidad desde `AGENTS.md`. Con un asistente desconocido, no se escribe nada.
- **Los avisos del arnés que mandan al alumno a una terminal se callan desde los raíles**: `.no-audit`,
  `.no-worktree-cleanup` y `.no-scope-check`. Se dejan los que valen la pena (que avise si falta git,
  la higiene del `CLAUDE.md`). Queda abierto el aviso de versión nueva, que necesita
  `RSC_NO_UPDATE_CHECK` y probarse en Windows.
- **La versión del arnés se fija exacta**, sin rango: `^1.4.1` permitía que un `npm install`
  empaquetara otro catálogo. Una prueba compara los cinco sitios donde se escribe.
- **Publicar no pisa una versión ya publicada.** `publicar.sh` se para y pide subir el número.
- **Pendiente de decidir:** los cuatro aplazamientos del plan (`base-agents`, `code-hooks`, `sdd`,
  `gitmoji-guard`) se decidieron sobre un proyecto de 14 ficheros y hoy hay 41 módulos y dos ayudantes
  escritos a mano. Reconsiderarlos cambia cómo el arnés gobierna esto, así que lo decide Jose.
