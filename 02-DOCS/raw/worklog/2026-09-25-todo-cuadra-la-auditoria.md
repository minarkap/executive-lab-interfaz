---
type: worklog
title: Todo cuadra — la auditoría entera y su plan
description: Auditoría de la barra contra RSC 2.0.5, con 56 hallazgos, siete decisiones de Jose y la cadena SDD hasta analyze en verde. Decisión 116.
timestamp: 2026-09-25T08:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se pidió

Jose: revisar todo el proyecto y RSC, auditarlo y dejar un plan para arreglar lo que no esté
perfecto. Pedía expresamente los mapeos de credenciales, habilidades y herramientas, las preguntas
del arranque y el brownfield frente al greenfield, como plan SDD de este arnés y en autopilot.

## Cómo se hizo

- **RSC 2.0.5, leído desde la copia que viaja dentro de la barra**, así que no hubo que salir del
  proyecto.
- **Tres exploraciones en paralelo**: RSC por dentro, los mapeos contra RSC y el arranque.
- **Lectura propia** de cada hallazgo de peso.
- **La documentación de Claude Code**, para saber cómo corren los enganches y qué importa `CLAUDE.md`.
- **Una revisión adversarial** que confirmó 14 hallazgos, matizó 2 y añadió 8.

La línea base, en la rama `todo-cuadra`: 198 comprobaciones con el arnés de verdad.

## Lo que salió

- **56 hallazgos**, en `02-DOCS/wiki/sdd/proposals/todo-cuadra.md`, con fichero y línea.
- **Los tres críticos:**
  - «Un poco de todo» no monta;
  - «Va para largo» no monta;
  - la mayoría de las carpetas de alumno no tienen el freno de órdenes peligrosas, y la barra decía
    que sí.

## Lo que decidió Jose

Siete cosas, en la decisión 116. La que más cambió el plan fue la de las preguntas. «Grande o
pequeño» es difícil de decidir, y se sustituye por tres datos fáciles: qué lleva la carpeta, cuántas
personas están metidas y qué se va a construir. RSC solo distingue pequeño de no pequeño, así que
solo la última decide lo que se le manda.

## Lo que pagaron los gates

- **La revisión con ojos frescos de la spec** vio que la decisión 3 de Jose chocaba con P4. Se
  enmienda P4 en vez de saltársela.
- **`analyze`** vio que, al reponerse los raíles solos, el bloque de `CLAUDE.md` y el freno entrarían
  en ficheros de otra persona sin su sí. Se arregló en las tareas antes de escribir código.

## Lo que sigue

F1: que el arranque monte con cualquier respuesta. Primero, la comprobación de contrato contra el
RSC empaquetado, en rojo.
