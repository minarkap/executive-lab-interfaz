---
type: verification
title: Verificación — todo-cuadra, F5 (los asistentes)
description: La batería de F5, criterio por criterio, con lo observado y las treinta mutaciones.
timestamp: 2026-09-26T01:30:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F5
veredicto: pasa
---

# Verificación — F5

Rama `todo-cuadra`, sobre la revisión de F3 (`9919af6`). Tareas T047–T051 del
[plan](../plans/todo-cuadra.md#f5--asistentes). Lleva también una corrección a T047 que salió en T051.
Lo que encontró la revisión de F4 va en un commit aparte, detrás de este.

## La batería

| Comprobación | Después de F4 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 253 | **267** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 258 | **273** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **12** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

La cuenta de F4 sube también por los once arreglos de la revisión de F3 (`9919af6`).

## Criterio por criterio

| # | Observado |
|---|---|
| E1 | Cambiar de asistente **sustituye** con quién se habla y **suma** lo montado. La elección va en el estado del espacio de trabajo, y un `sync` que reordena `targets` no la deshace. Con uno ya montado, solo se apunta. Con uno sin montar, se prepara con el `sync --target` del arnés de dentro y sus raíles; con el paquete de verdad, de Claude a Codex, la declaración queda `claude, codex`, `catalogVersion` sigue en la 2.0.5, `.codex/rsc/` tiene las mismas 32 que Claude y la nuestra con `siempre.md`, `AGENTS.md` la nombra, y lo de Claude y su `CLAUDE.md` siguen igual. Si el arnés falla, o termina sin declararlo, no se cambia nada y se dice. El aviso de que Codex no trae frenos sigue |
| E2 | Con dos declarados y uno instalado, todo coincide: con quién se habla, dónde se mira, cómo se pide una habilidad y a quién se añade. Los raíles se ponen para cada declarado; lo de la carpeta, una vez |
| E3 | `compartido` y los formatos salen del paquete y se comparan por prueba. Una carpeta montada fuera para Cursor ve sus habilidades `.mdc` y no parece un clon; con Copilot, un comando `informe.prompt.md` se pide como `/informe`; con Cline, como `/informe.md`. El buscador y la cabecera de una habilidad leen en el mismo formato. Los raíles ponen los comandos de Copilot como `.prompt.md` y se dan por al día; con Cursor dejan `.cursor/rules/executive-lab.mdc`, que se aplica siempre; con Windsurf, el trozo que nombra la habilidad va en su fichero de siempre |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` y se restaura. El guion restaura el fichero pase lo
que pase; las copias de los raíles se mutan a la vez que su fuente, y siguieron iguales al terminar.

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T047 | dónde, por el primero declarado · con quién, por cualquiera instalado | las dos (la segunda, tras añadir el caso de solo Codex declarado y solo Claude instalado) |
| T048 | la elección no se lee · elegir reescribe `targets` | las dos |
| T050 | raíles solo para el primero | la una |
| T049 | sin preparar se cambia igual · sin mirar lo declarado · sin el `sync` · sin los raíles · un `sync` que falla se da por bueno · sin el aviso de los frenos · con uno ya montado se vuelve a montar | las siete; dos sobrevivían a la primera versión de la prueba, y se añadieron sus casos |
| T051 | `compartido` de Windsurf · y de Kiro · Cursor sin `.mdc` · Copilot sin `.prompt.md` · Cline sin su `.md` · mirar en lo de Claude · el fichero de siempre de RSC como habilidad · el sufijo al pedir · la cabecera · el buscador · el «al día» · el nombre de los comandos · el `.mdc` de Cursor · su `alwaysApply` | las catorce |

## Pruebas que cambiaron

- «cambiar de asistente dice qué deja de verse» consagraba el fallo: pasa a ser «cambiar a un
  asistente sin montar lo prepara para él, con sus raíles».
- La de «cambiar de asistente» espera a `elegir`, que ahora es asíncrona.

## Lo que no se puede comprobar aquí

- Que Codex lea de verdad `siempre.md` porque su `AGENTS.md` se lo pide, con la prueba de Codex que
  ya estaba pendiente.
- Que Cursor, Copilot o Cline carguen los raíles: la barra no los ofrece, y aquí no hay ninguno.

## Lo que encontró la revisión con ojos frescos

Corre sobre el commit de F5.
