---
type: worklog
title: Codex de verdad, montado y probado
description: Codex estaba instalado en el Mac y nadie lo había usado. Se montó un arnés real con --target codex, se le pusieron los raíles y se comprobó la barra entera contra él. La tabla acierta; y lo de «aquí no hay frenos» que arregló la sesión paralela, verificado contra un Codex de verdad. Decisión 111, 0.30.0.
timestamp: 2026-09-24T12:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Trabajando en autopilot, mirando qué de lo pendiente se podía cerrar solo: **Codex está instalado
en este Mac** (0.137.0). Uno de los tres pendientes de la auditoría era «ver Codex de verdad», y
resulta que se podía.

Todo lo de Codex estaba probado **simulado**: cambiando `targets` en un `.rsc.json` a mano. Que la
tabla de `sitios.js` diga la verdad solo se sabe montándolo con RSC.

## Lo que se confirmó

La tabla acierta en todo: habilidades en `.codex/rsc/`, `AGENTS.md` como lo que se lee siempre, y
**ningún comando** — RSC no le escribe ninguno a Codex, no es que estén en otro sitio. La barra lo
lee entero: 32 habilidades, y ninguna se invoca con barra («Usa la habilidad "bro"», que es como se
le pide a Codex).

Y los **raíles sobre un Codex real**, que no se habían probado nunca: la habilidad propia cae en
`.codex/rsc/executive-lab/` y queda nombrada entre marcas en `AGENTS.md`, porque Codex no las
encuentra solo como Claude.

## Lo que se aprendió

En un arnés de Codex **no hay ni un guardián**: RSC los engancha solo para Claude. Un alumno con
Codex no tiene el freno de órdenes peligrosas.

La sesión paralela ya lo había resuelto el mismo día, y mejor de lo que yo iba a hacerlo: además de
decirlo en pantalla, corrige que una carpeta de Codex dijera tener **apagada** una pieza que ahí ni
existe. Empecé a escribir mi versión, vi que ya estaba, y la revertí. Lo que sí aporto: comprobarlo
contra un Codex de verdad, que era justo lo que no se podía.

## Un fallo de mi propia prueba

La primera versión hacía `process.chdir()` para montar el arnés en la carpeta de Codex. Pero
`procesos.js` usa `proyecto.raiz()` como cwd, no el directorio del proceso: montó un arnés de Codex
**encima de la empresa de mentira**. Sin daño —esa carpeta es temporal y se rehace en cada pasada—
pero la prueba decía «Codex» mirando otra cosa. Ahora fija la raíz y exige que el `.rsc.json` caiga
donde toca.

## Lo que sigue abierto

Que Codex, al arrancar, **lea** el bloque de `AGENTS.md` y cargue la habilidad. Eso solo se ve con
Codex delante, hablando. Todo el lado de escritura ya está cubierto por la comprobación.

## Cómo quedó

0.30.0. `humo.js --con-arnes` **195 comprobaciones**, con una nueva que monta un Codex de verdad.
