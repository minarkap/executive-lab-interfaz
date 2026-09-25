---
type: worklog
title: Todo cuadra, F2 — las carpetas que no son la de siempre
description: La carpeta personal y las del sistema, el clon real, seguir sin copias, la carpeta de alguien con su sí, el historial nuestro, volver a montar con lo de hoy y el primer mensaje. Decisión 118, que revisa la 28.
timestamp: 2026-09-25T18:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F2 del programa `todo-cuadra`, T015–T030 (T019 va en F4), cada una con su prueba en rojo
primero. Quince arreglos, y los que más pesan:
- **La carpeta personal no se prepara.** Antes se montaba en ella igual que en una vacía, y RSC
  escribía en la configuración de Claude de todo el ordenador.
- **En una carpeta de alguien, se enseña qué se toca y se pide el sí**, y cada nombre que choca se
  pregunta. Medido antes con el paquete: RSC cambia la habilidad suya por la del arnés, y a los
  comandos y los agentes suyos los deja.
- **El historial es nuestro si nació en la barra.** Por los autores fallaba en cuanto la persona
  tenía su identidad puesta, que es casi siempre.

## Lo que salió por el camino

- Con recibo, «completar» no preguntaba nada aunque el recibo trajera un valor que RSC no acepta.
  Salió al probar el dial.
- La primera pasada de mutaciones dejó viva una: la regla «sin `.rsc/` es un clon» no la miraba
  ninguna prueba por sí sola. Ahora sí, con los enlaces de RSC colgando.
- Cuatro pruebas daban por bueno el fallo (el clon vacío, los arneses sin `.rsc/`, la sombra
  inventada y «no se vuelve a preguntar» sin mirarlo), y se reescribieron.

## Lo que encontró la revisión

Dos críticos. La carpeta personal con restos de un montaje, a medias y sin `.rsc.json`, se
completaba: la guarda no miraba ese estado. Y la pantalla que pide el sí para un plan distinto salía en
inglés, porque las claves que la barra traducía no eran las que da RSC; la prueba fingía una de ellas.

Cuatro importantes: el `git init` iba antes del sí en una carpeta de alguien; `/etc`, `/var` y
`/tmp` de macOS pasaban la guarda; la prueba que fingía la clave; y renombrar una habilidad escribía a
través de un SKILL.md enlazado fuera de la carpeta. Arreglados, con tres menores más y una
comprobación nueva contra el paquete en `contrato.js`. Los otros quince menores quedan anotados para
el cierre.

## Números

`humo` 227 (eran 205), `humo+` 232 (eran 208), `contrato` 9. Veintidós mutaciones, y todas matan su
prueba. Con la revisión: `humo` 231, `humo+` 236, `contrato` 10, y once mutaciones más.

## Lo que sigue

F3, los frenos: primero el experimento del relevo de Node, porque sin `node` no corre ningún enganche
y el freno propio tampoco.
