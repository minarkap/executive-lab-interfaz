---
type: worklog
title: Todo cuadra, F3 — frenos y enganches que no dependen de nada
description: El freno propio con la copia fijada del de RSC, el relevo de Node, ninguna ruta en el ajuste que viaja en git, el aviso de versión apagado, repair seguido de sync y lo apagado en español. Decisión 119.
timestamp: 2026-09-25T22:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F3 del programa `todo-cuadra`, T032–T038, cada una con su prueba en rojo primero. Lo que
más pesa:
- **El freno ante órdenes peligrosas, en todas las carpetas de Claude.** RSC solo engancha el suyo
  con la cadena SDD; ahora los raíles enganchan una copia byte a byte del suyo, que se aparta si está
  el de RSC. En una carpeta cuyo historial es de alguien, se ofrece con un botón.
- **Sin Node, un relevo del de VS Code**, en el almacén de la barra.
- **Ninguna ruta de este ordenador en `.claude/settings.json`**, y fuera la marca que paraba los
  `git pull`. En este mismo repositorio había catorce órdenes con la ruta de la app; ahora el
  ajuste es igual que en HEAD.

## Lo que salió por el camino

- Antes de F3 se cerró la revisión de F2: dos críticos y cuatro importantes, arreglados sobre F2 con
  el trabajo de F3 apartado en un *stash*.
- Medido con el paquete: con algo roto, `repair --yes` engancha los cuatro frenos de RSC en una
  carpeta de operaciones, y `sync` los quita. Ahora va un `sync` detrás de cada `repair`.
- Los raíles se daban por «al día» mirando solo `SKILL.md`, así que el freno no habría llegado a
  las carpetas que ya estaban montadas.
- Una mutación se curaba sola (escribía la ruta y la función nueva la quitaba) y hubo que rehacerla.
- Tres interruptores no tienen nombre en el diccionario, y esperan a Jose.

## Números

`humo` 242 (eran 231), `humo+` 247 (eran 236), `contrato` 12 (eran 10). Treinta mutaciones, y
todas matan su prueba.

## Lo que sigue

Medir el relevo en un VS Code de verdad, con Jose. Después, F4: los raíles que se leen siempre.
