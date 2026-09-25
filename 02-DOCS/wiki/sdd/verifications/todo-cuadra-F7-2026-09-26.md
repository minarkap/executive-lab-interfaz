---
type: verification
title: Verificación — todo-cuadra, F7 (los mapeos)
description: La batería de F7, criterio por criterio, con lo observado y las veintiuna mutaciones.
timestamp: 2026-09-26T07:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F7
veredicto: pasa
---

# Verificación — F7

Rama `todo-cuadra`, sobre la revisión de F6 (`7248cea`). Tareas T059–T065 del
[plan](../plans/todo-cuadra.md#f7--mapeos). Se empezó sobre F6, se apartó en un `stash` para arreglar
lo que encontró la revisión de F6, y se siguió encima.

## La batería

| Comprobación | Después de la revisión de F6 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 290 | **297** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 297 | **304** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **13** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| G1 | Se despachan los setenta tipos que manda el panel, con lo que tiene efectos de verdad fingido, y ninguno deja un fallo de programa en el registro. Antes de arreglarlo salía uno: `[resolverIncidencia] ReferenceError: encargos is not defined`. Todo tipo del panel tiene su ruta (I2) |
| G2 | Con una app de antes que lleva la 1.4.1 y su propio `historial.js`, corren el arnés y el módulo del `.vsix`. Sin el del `.vsix`, el de la app solo si es de la misma versión. El informe de «Algo va mal» dice qué arnés corre. Con el `enganches.js` de un instalador de antes, se usa el del paquete y la ruta de este ordenador vuelve a `node` |
| G3 | Con las formas que escribe `doctor.js` de la 2.0.5 (habilidades como `id:ruta`, también de Windows, y agentes y comandos como objetos), lo que falta sale como «Tono humano», «Explicación desde cero», «Desarrollador», sin rutas ni `[object Object]`. «Algo va mal» dice que está mal con cosas que faltan o con los enganches sin poder correr, y bien sin ellas |
| G4 | Una habilidad declarada y no en disco no sale en ningún montón, y la cuenta cuadra. Un «Añadir» que la declara sin ponerla no se da por hecho. Con el arnés de verdad, añadir una desde la barra la pone en disco y deja la carpeta en la 2.0.5 |
| G5 | Con los dos sufijos que lee de `targets/commands.js`, `fastapi-review` sale como «Revisar el código de FastAPI» y `go-build` como «Arreglar la compilación de Go», entre los del arnés. Uno del alumno que acaba igual sigue siendo suyo; uno que el arnés apunta y nadie nombra, del arnés |
| G6 | Con dos preguntas abiertas y una `[FILLED]` en bloques de RSC, salen dos. Las carpetas de trabajo de RSC no son temas, y lo que el índice marca `[Archived]` no es un artículo |
| G7 | Con la plantilla de conexiones entera, el suelo está; sin su `test_connection.sh`, no, y la pieza no dice «Listo» |

## Prueba de mutación

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T059 | sin importar `encargos` | la de todos los tipos del panel (es su rojo) |
| T060 | el de la app primero · de cualquier versión · los módulos de la app primero · el informe sin decir cuál | las cuatro |
| T061 | la habilidad con su ruta · el agente como objeto · repetidas · la pieza con los ids · sano por el código de `doctor` · sin mirar los enganches | las seis |
| T062 | añadida si está declarada · instalada si está declarada | las dos |
| T063 | sin la regla de los comandos · la regla para todos · del arnés sin mirar su estado | las tres, la última tras añadir su caso |
| T064 | solo viñetas · las contestadas también · el andamio como conocimiento · lo archivado como conocimiento | las cuatro |
| T065 | el suelo, solo la carpeta | la una |

Veintiuna, y mueren todas.

## Pruebas que cambiaron

- La de «con el módulo de un instalador de antes» contaba con que mandara el módulo de la app: ahora
  mira que se use el del paquete y que la ruta se devuelva.
- La de los cuatro montones de habilidades las daba por instaladas solo declarándolas: ahora las pone
  en disco.
- Los fixtures con la plantilla de conexiones a medias ponen la plantilla entera, y la empresa de
  mentira escribe las preguntas como RSC y lleva el `.env.example` de la plantilla.

## Lo que no se puede comprobar aquí

- Un ordenador con un instalador de los de antes de la decisión 27, como el Windows de prueba de Jose.

## Lo que encontró la revisión con ojos frescos

Corre sobre el commit de F7.
