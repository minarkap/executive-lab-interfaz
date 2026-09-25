---
type: progress
title: Progreso — todo-cuadra
description: Registro de solo añadir, una línea por tarea, con su evidencia observada. Sobrevive a una compactación.
timestamp: 2026-09-24T16:50:00Z
topic: sdd
slug: todo-cuadra
---

# Progreso — todo-cuadra

Rama `todo-cuadra`, desde `main` (2b139bc). Plan: [../plans/todo-cuadra.md](../plans/todo-cuadra.md).
Solo se añade.

## F0

- **T001 ✓** 24-09 · `ListAgents` sin sesiones de `interfaz-arnes` (las dos de hoy, `-0a` y `-5c`,
  ya habían terminado) · `git switch -c todo-cuadra` desde `main` = `origin/main` = 2b139bc ·
  `git status --short` vacío.
- **T002 ✓** 24-09 · Línea base:
  - `node extension/prueba/humo.js --con-arnes` → **198 comprobaciones pasadas**, código 0.
    Salen dos «SALTADA»: «el motor de JavaScript sigue sirviendo de resto» y «cada capacidad que
    ofrecemos existe en el catálogo de verdad». La segunda es la prueba muerta de H2: mira un
    manifiesto que no existe.
  - `node extension/prueba/empresas-distintas.js` → «las tres empresas, enteras».
  - `node docs/comprobar-diccionario.js` → «27 palabras prohibidas · 47 ficheros y 45 rótulos
    revisados · Todo el texto de pantalla respeta el diccionario».
  - `node herramientas/revisar-powershell.js` → «4 ficheros revisados, sin pegas».
  - `git log 2b139bc..` vacío: ningún hallazgo arreglado por otra sesión desde la auditoría. C3
    queda mitigado por 2b139bc (`--skip-worktree`).
- **T003 ✓** 24-09 · Escritas la propuesta, la spec, `clarify`, el plan y las tareas:
  - `spec-gate.js specs/todo-cuadra.md` → PASS, con 10 puntos tipados;
  - la revisión con ojos frescos encontró diez cosas, y se arreglaron todas (C-13 a C-20);
  - P4 enmendada en la constitución (decisión 3 de Jose).
- **T004 ✓** 24-09 · `analyze`:
  - primera pasada BLOCKED, con 1 alto contra P4, 8 medios y 6 bajos;
  - todo se resolvió en `tasks`: T076 y T077 son nuevas, y hay catorce comprobaciones afinadas;
  - segunda pasada **GATE: PASS**, en `analysis/todo-cuadra.md`.
- **T005 ⏸** 24-09 · Parada de vocabulario: la lista está en la spec («Vocabulario propuesto»), a la
  espera del sí de Jose.
- **T005 ✓** 25-09 · Jose contestó en cuatro rondas:
  - gitmoji apagado en las carpetas de alumno;
  - la puerta SDD se queda;
  - tres preguntas fáciles en vez del tamaño (C-21), con el recorrido entero a decisión del
    programa;
  - los demás textos con su criterio, y las pantallas se le enseñan al cerrar cada fase (C-22).

  La spec, el plan (§3, §4, T008, T010) y `sdd/decisions.md`, al día. Se añade el criterio A13.
