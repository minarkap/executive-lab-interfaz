---
type: worklog
title: Los apartados se ordenan por lo que pesa, y el mapeo se cierra
description: Jose repasó el mapeo arnés → barra y pidió segmentar Habilidades y Comandos por lo que importa, bajar los guardianes sin quitarlos, abrir la puerta a un agente desde Sugerencias, acompañar inbox y out, y cerrar los dos huecos (lecciones y optOuts). Decisión 101.
timestamp: 2026-09-21T23:55:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose, después de ver el mapeo completo: *«Las del catálogo y fuera del catálogo y creadas ad hoc las
metería como "Instaladas" y ya. Luego […] "Sugerencias del catálogo" y luego otro apartado de "Resto
del catálogo" al final junto al de "Las del arnés" (porque es poco importante). Con los comandos lo
mismo básicamente. Sigo sin entender qué son los guardianes»*. Y: *«Arregla todo adecuadamente»*.

Rama `los-apartados-se-ordenan-y-el-mapeo-se-cierra`, un documento de feature en
`02-DOCS/wiki/ftd/los-apartados-se-ordenan.md`, y esto:

## 1 · Habilidades: cuatro bloques, por peso

Lo instalado iba en tres cabeceras partidas por una frontera que no cambia nada al usarlas —y
frágil: «propia» solo quiere decir declarada en `ownSkills`—. Ahora: **Instaladas** (todo junto,
con el origen en la (i)) · **Sugerencias del catálogo** · **Resto del catálogo** (plegado) · **Las
del arnés** (plegado, al final). `saberes.js` no cambia: la pantalla junta los montones. Los dos
desplegables de oferta —*Ver las demás* y *Para otra clase de carpeta*— se funden en uno.

Se contestó de paso lo que preguntaba Jose: «fuera del catálogo» **no** son habilidades de usuario.
La barra no mira nunca la carpeta personal; todo lo instalado es de esta carpeta
(`rsc.habilidadesPuestas()` = disco ∪ `skills` ∪ `ownSkills`).

## 2 · Comandos: los del arnés, plegados

Ya iban al final; solo faltaba plegarlos, como a sus hermanas.

## 3 · Los guardianes bajan al final de Las reglas, plegados, y no se quitan

Jose proponía dejarlo estar. La razón para no quitarlos es una: cuando el freno actúa, al alumno le
sale en la conversación un `BLOCKED` en inglés y la barra no puede interceptarlo. Un desplegable
cerrado con *«Si alguna vez te sale un aviso en inglés que no te deja seguir, es esto»* cubre el
único caso en que importa.

## 4 · Sugerencias abre la puerta a un agente

Sin agentes no hay apartado de Agentes, y con él se iba *Crear un agente*. La única puerta era una
línea que decía «aparecen solos». Ahora, sin agentes, Sugerencias enseña **Ver si te vendría bien un
agente**, con un encargo solo de agentes. No se decide aquí si «la carpeta merece uno»: eso no se
lee del disco.

## 5 · `inbox` sí, `outbox` no

*Darle documentos (inbox)* y *Resultados (out)*: lo que existe en disco. `outbox` no está en ningún
sitio (RSC usa `out/` por herramienta). Y se arregló la colisión de «Resultados» con el contador de
la búsqueda, que pasa a decir **coincidencias**.

## 6 · Un nombre por pantalla

La miga de la radiografía decía *Qué hay aquí*; ahora dice *Qué falta por montar*, como el botón.

## 7 · Los dos huecos del mapeo

- **Lecciones** de la memoria de RSC (`lecciones.js` se leía y nadie lo enseñaba): dentro de *Cómo te
  habla*, como *Lo que ha aprendido de ti*, con el botón *Que aprenda algo de ti* (`/learn` con
  Claude; con palabras en los demás).
- **`optOuts`** de `.rsc.json`: pieza *Lo que tiene apagado* en la radiografía, sin arreglo, porque
  es una decisión y no un fallo.

## Qué quedó tocado

`extension/media/panel.js` · `extension/src/extension.js` · `extension/src/terreno.js` ·
`extension/prueba/humo.js` (una comprobación nueva y tres ampliadas) · `extension/prueba/empresa-falsa.js`
(la empresa de mentira declara un `optOut`) · `docs/diccionario.md` (nueve filas) ·
`docs/decisiones.md` (101).

## Cómo quedó

0.22.0. `humo.js` (179 comprobaciones), `empresas-distintas.js`, `comprobar-diccionario.js` y
`revisar-powershell.js` en verde. La evidencia por tarea está en el documento de feature.

## Fuera, a propósito

Un disparo determinista que sugiera un agente solo (heurística no acordada). Y los cambios sueltos
que ya había en el árbol al empezar —los raíles que la barra aplica a la carpeta abierta:
`.claude/commands/{ayuda,empezar,guardar,seguir}.md`, `.claude/skills/executive-lab/`,
`.claude/settings.json`, `.rsc.json`, `user-profile.md`—: no son de esta feature.
