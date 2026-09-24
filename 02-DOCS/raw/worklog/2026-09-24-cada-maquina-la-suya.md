---
type: worklog
title: Cada máquina la suya, y git en silencio
description: settings.json está versionado y cada ordenador le mete la ruta de su propio node, así que salía siempre como modificado en todas las máquinas. Ahora cada instalación le dice a git de su clon que ese fichero ya está bien. Decisión 115, 0.32.0.
timestamp: 2026-09-24T19:10:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que quedaba

La decisión 111 arregló lo que mordía: quien clonaba el proyecto de un compañero se llevaba los
enganches apuntando al Mac de ese compañero, y ahora cada instalación se los repara. Pero dejó vivo
lo otro: `.claude/settings.json` está versionado, cada máquina le mete la ruta de **su** node, y por
tanto sale siempre como modificado. En todas.

No es solo ruido. El botón *Guardar en git* de la barra hace `add -A`, así que tarde o temprano
alguien pulsa y sube la ruta de su casa.

Jose lo pidió con la condición puesta: *«que funcione bien en todas las máquinas, cada uno en la
suya»*. Eso descartó lo que yo había propuesto antes —marcarlo a mano en su ordenador—, que arregla
una máquina de las que tienen el problema.

## Por qué no hay «una ruta mejor»

Es lo primero que uno intenta. No la hay: el node bueno está en un sitio distinto en cada
ordenador, y esa es exactamente la razón de que `enganches.js` exista. Tampoco vale dejar `node` a
secas, que es de donde venimos: en el ordenador de un alumno no hay ninguno en el PATH.

Y las otras dos salidas ya estaban descartadas con su motivo en la 111: sacar el fichero de git
choca con lo que RSC quiere, y partir los enganches en `settings.local.json` puede acabar
ejecutándolos dos veces, porque Claude Code fusiona los dos ficheros.

## Lo que se hizo

Si no se puede tener un contenido igual para todos, que cada clon sepa que el suyo ya está bien.
Después de arreglar el enganche, `enganches.js` le dice a git **de ese clon**: este fichero no lo
mires (`--skip-worktree`). El repositorio conserva la forma portable, cada máquina conserva la
suya, y la marca no viaja al clonar — la pone cada instalación por su cuenta, que es lo que pedía
la condición.

Con tres frenos: no toca nada si no hay git, si la carpeta no es un repositorio o si el fichero no
está versionado —el caso de casi todos los alumnos—; y **no marca un fichero que no difiere**,
porque esconder por adelantado algo que está bien es esconder el próximo cambio de verdad.

## Comprobado

Una prueba que monta un repositorio de verdad en temporal: comete la forma portable, arregla el
enganche, y exige tres cosas — el disco con la ruta de esta máquina, `git status` limpio, y `HEAD`
con `node` a secas. Verificada por mutación: comentada la línea que marca, falla con
`M .claude/settings.json`.

Y aplicada a esta carpeta: cero ficheros tocados —la ruta de Jose ya estaba bien y se respeta— y
`git status` deja de sacar `settings.json` por primera vez en semanas.

`humo.js` 196 · `empresas-distintas.js` las tres · diccionario limpio · PowerShell sin pegas.

## El precio, dicho

Mientras la marca está puesta, un `git pull` que traiga un cambio de ese fichero se para y hay que
quitarla a mano. Se para ruidosamente, que es como este proyecto prefiere fallar.
