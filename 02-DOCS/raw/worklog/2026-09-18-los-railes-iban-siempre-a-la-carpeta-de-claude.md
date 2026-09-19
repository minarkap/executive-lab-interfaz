---
type: worklog
title: Los raíles iban siempre a la carpeta de Claude, y con Codex no encarrilaban nada
description: Auditoría del arnés para los dos asistentes. Nueve defectos, uno de fondo - la habilidad que fija el español y el vocabulario se escribía en `.claude/` aunque el arnés se hubiera montado para Codex, en una carpeta que Codex no abre nunca. Todos corregidos y con prueba.
timestamp: 2026-09-18T23:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Auditoría entera del arnés contra una sola pregunta: cuando una carpeta se monta para Codex en vez de
para Claude, ¿sigue funcionando todo? Se leyó la tabla de rutas del propio RSC 1.4.1 —el que viaja
dentro del .vsix— y se contrastó contra lo que hace la barra, montando carpetas de las dos clases y
ejecutando el código de verdad sobre ellas.

El informe completo está en [docs/auditoria-codex-y-claude.md](../../../docs/auditoria-codex-y-claude.md).

## El de fondo

`skills/aplicar.js` escribía la habilidad `executive-lab` y los cuatro comandos en `.claude/`, con la
ruta a mano. Pero el wizard deja elegir Codex y le pasa `--target codex` a RSC, que monta el arnés
entero en `.codex/`. Así que en esas carpetas, lo que fija el español, impone el vocabulario del
diccionario y prohíbe mandar al alumno a una terminal quedaba donde Codex no mira nunca. Sin error,
sin aviso, y con la pantalla diciendo «raíles puestos».

La tabla de rutas estaba bien —`donde.js` la copió de RSC y es correcta fila a fila— pero solo la
tenía la barra. `aplicar.js` es un script suelto que se lanza con `node` y no sabe nada de VS Code,
así que tenía la suya escrita a mano, y las dos se separaron.

Ahora la tabla es una, en `skills/sitios.js`, sin dependencias, y la leen los dos. Vive al lado de
los raíles porque `aplicar.js` se ejecuta desde dos carpetas —`skills/` en el repositorio y
`media/railes/` dentro del .vsix— y desde las dos tiene que encontrarla.

## Los otros siete

- **Los ayudantes de Codex se leían a medias.** RSC los escribe en TOML para Codex y en markdown para
  Claude; se leían los dos con el lector de cabeceras YAML. El ayudante salía en la lista con el
  nombre del fichero y sin decir qué hace.
- **El vigilante solo miraba los botones de Claude.** Ni habilidades, ni ayudantes, ni nada de Codex:
  una habilidad recién puesta no aparecía hasta cerrar y abrir.
- **Cambiar de asistente vaciaba la barra sin explicarlo.** No remonta el arnés, así que todo lo
  montado deja de verse. El código decía en un comentario que «la pantalla lo dice»; no lo decía.
- **La radiografía no decía con quién habla la carpeta**, que es la primera causa de «no me hace
  nada»: el asistente para el que se montó no está instalado.
- **Y reprochaba con Codex algo que no se puede arreglar:** «Botones: ninguno todavía», cuando con
  Codex no puede haberlos nunca.
- **Un asistente desconocido se trataba como Claude**, justo lo contrario de lo que decía el
  comentario de `donde.js`.
- **Se perdían las lecciones** cuando RSC las guarda en su tercer sitio, que la barra no miraba.

## Lo que queda dicho y no hecho

Nada de esto se ha visto con Codex de verdad delante. Que su lector de `AGENTS.md` cargue una
habilidad a la que se le apunta es lo que hace RSC con las suyas, así que es razonable — pero es una
suposición, no un hecho comprobado. Hace falta un ordenador con Codex puesto.

## Y uno más, que salió al guardar el punto

Al hacer por fin el checkpoint del arnés y mirar qué devuelve `memory resume`, apareció el noveno: RSC
manda las rutas tal y como se las da git, **marcadas** (`M `, `A `, `D `, `??`). Una ruta marcada no
empieza por `02-DOCS`, empieza por `M 02-DOCS`, así que la brújula dejaba de reconocerla como zona.

En cuanto la wiki está guardada en git —o sea, en todo alumno a partir del primer guardado— llegaban
todas marcadas y la pantalla principal no decía dónde se había trabajado. Sin fallar nada.

Se quita la marca antes de traducir. No puede volver la basura de antes («M 01 tools»), porque solo se
reconocen `02-DOCS` y `01-TOOLS`; hay prueba de las dos cosas.

## Los cuatro niveles, pasados

Prueba de humo (121), las tres empresas, el VS Code de verdad (33 comandos registrados, 26
ejecutados), el diccionario y PowerShell. Y a mano: las credenciales de punta a punta, las memorias en
sus tres sitios, la barra cargada desde el .vsix descomprimido y los raíles ejecutados desde ese mismo
paquete.
