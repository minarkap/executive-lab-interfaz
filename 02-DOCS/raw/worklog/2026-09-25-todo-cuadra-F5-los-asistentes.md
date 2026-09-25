---
type: worklog
title: Todo cuadra, F5 — cambiar de asistente lo deja montado
description: Una sola respuesta a «qué asistente», la elección guardada aparte, cambiar a uno sin montar lo prepara para él, raíles para todos los declarados y en el formato de cada uno. Decisión 121.
timestamp: 2026-09-26T01:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F5 del programa `todo-cuadra`: T047–T051, cada una con su prueba en rojo primero.
Lo que más pesa:
- **Cambiar de asistente ya no se deshace solo.** Se reordenaba `targets`, que RSC vuelve a ordenar
  en cada escritura; ahora la elección va aparte.
- **Cambiar a uno sin montar lo prepara para él**, con el arnés de dentro. Probado con el paquete de
  verdad: de Claude a Codex quedan las 32 del arnés y la nuestra en `.codex/rsc/`, y lo de Claude
  donde estaba.
- **Raíles para cada asistente declarado**, y en su formato: `.prompt.md` para Copilot y un `.mdc`
  que se aplica siempre para Cursor.

## Lo que salió por el camino

- Con un arnés montado fuera solo para Cursor, la función nueva de T047 caía en Claude, y la barra
  miraba en `.claude/`. Lo encontró la prueba de T051.
- Dos mutaciones sobrevivían a la primera prueba de T049: un arnés que termina bien sin declarar al
  asistente, y un `sync` que falla con los raíles puestos igual. Se añadieron los dos casos.
- Una pasada con el arnés de verdad coincidió con las mutaciones, que tocaban los mismos ficheros:
  no valía, y se repitió sola.

## Lo que queda

- La revisión con ojos frescos de F5.
- Los cuatro importantes y doce menores de la revisión de F4, en su propio commit.
