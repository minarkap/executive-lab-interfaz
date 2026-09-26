---
type: worklog
title: Todo cuadra, F8 — los papeles dicen lo mismo que la barra
description: El número de preguntas contado por rumbo, una sola lista de palabras prohibidas que vigila también las tablas y los instaladores, nada en git que esté ignorado, «Algo va mal» con su paso siguiente, seis cosas más para Eric y el perfil que ya no se pierde al volver a montar. Decisión 124.
timestamp: 2026-09-26T10:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F8 del programa `todo-cuadra`: T067–T071 y T078. Cada una empezó con su prueba en rojo.
Lo que más pesa:
- **La pantalla principal dice cuántas preguntas hay**, contadas por `rumbo`, y los documentos ya no
  llevan números que se quedan viejos.
- **Una sola lista de palabras prohibidas**, que ahora vigila también los nombres, el catálogo y los
  textos de los instaladores.
- **Quien manda a «Algo va mal» dice qué hacer con el código**: pásaselo a tu tutor.
- **Volver a montar ya no borra lo que el asistente apuntó en el perfil**.

## Lo que salió por el camino

- Al escribir para Eric la novena cosa (RSC reescribe el perfil entero al aceptar un plan), se vio que
  nuestro rodeo solo cubría el dial, los asistentes y nuestros campos. El cuerpo que va escribiendo
  `init` se perdía al subir de versión. Entró como T078, con sus dos pruebas y ocho mutaciones.
- Lo devuelto al perfil tenía que llevar el dial que se acaba de elegir. El asistente y «Cómo te
  habla» leen primero `accompaniment_level`, y se habrían quedado con el de antes.
- De madrugada el Mac se durmió a ratos. La batería y tres mutaciones se cortaron a los 600 segundos,
  y el revisor de F7 perdió la conexión tres veces. La CPU gastó lo normal, así que no era la prueba.
  Se repitieron con el Mac despierto.
- La prueba del catálogo de capacidades salía siempre «SALTADA»: miraba el catálogo del instalador de
  Mac, que solo existe al construirlo. Ahora mira el que viaja dentro del `.vsix`.
- La revisión de F7 llegó a mitad de F8, con tres importantes y nueve menores. F8 se apartó en un
  `stash`, se arreglaron en su propio commit (`cbaa7c1`) y se siguió encima. Al volver, el registro de
  progreso y el diccionario chocaron, y se juntaron los dos lados.
- Dos mutaciones de F8 sobrevivían por la prueba, no por el código: una no fijaba el recuento de una
  carpeta vacía, y otra miraba un campo que los raíles vuelven a escribir.

## Lo que queda

- La revisión con ojos frescos de F8.
- F9: la verificación entera con el arnés de verdad, los tres refutadores y el informe para Jose.
- Para Jose: abrir las seis issues de `docs/para-rsc.md`, y lo del instalador que se firma (`.iss`,
  `Info.plist`, `probar.ps1`, `COMO-PROBARLO.md`).
