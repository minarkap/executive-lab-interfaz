---
type: worklog
title: Todo cuadra, F4 — los raíles que se leen siempre
description: siempre.md importado desde CLAUDE.md, la regla 7 completa, la lista entera de palabras prohibidas, Codex con habilidades propias, el dial con sus dos nombres, raíles viejos por cualquier pieza y la versión más nueva que la de la clase. Decisión 120.
timestamp: 2026-09-25T23:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F4 del programa `todo-cuadra`: T040–T045, T077 y T019, cada una con su prueba en rojo primero.
Lo que más pesa:
- **Con Claude, las innegociables están en la conversación desde el primer mensaje**: un
  `siempre.md` corto, que `CLAUDE.md` importa. Antes solo llegaban si el asistente abría la
  habilidad.
- **La regla 7 cubre todo lo que el arnés manda correr sin versión**: catorce verbos, sacados del
  paquete por una prueba que falla si se quita uno.
- **Una carpeta con una versión del arnés más nueva que la de la clase se dice**, y no se baja sin
  pulsar.

## Lo que salió por el camino

- Crear el primer `CLAUDE.md` de una carpeta haría que Claude dejara de leer su `AGENTS.md`: el
  bloque lo importa cuando es de alguien.
- La prueba del dial encontró un fallo de verdad: al cambiarlo, la barra se comía los espacios de
  delante del comentario de la plantilla.
- Una prueba fingía `rsc.correr` pero no `rsc.sincronizar`, y corrió el `sync` de verdad en su
  carpeta temporal. Ahora finge los dos.
- Al pintar las pantallas de F3 salió que la fila del freno sin enganchar decía «Está puesto». Va
  aquí, arreglada, con su prueba.

## Números

`humo` 253 (eran 242), `humo+` 258 (eran 247), `contrato` 12. Veintidós mutaciones, y todas matan
su prueba.

## Lo que sigue

La revisión con ojos frescos de F3 y de F4. Después, F5: los asistentes.
