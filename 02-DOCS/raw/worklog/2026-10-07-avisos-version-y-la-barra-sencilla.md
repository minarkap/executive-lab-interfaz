---
type: worklog
title: Avisos a GitHub, la barra que se pone al día sola, la licencia y la barra sencilla
description: Del aviso con consentimiento (131) a la barra sencilla (138), pasando por la versión con botón, las pruebas de verdad, «Qué trae», la 0.45.0 que se pone al día sola y la licencia MIT.
timestamp: 2026-10-07T12:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

- **Lo que dicen los alumnos** (decisión 131, PR #5). La barra, el asistente o el alumno detectan un fallo
  y, con el clic del alumno y nunca sin él, sale una incidencia al repositorio. Un flujo de GitHub le pone
  sus etiquetas para que Jose las revise.
- **La barra se pone al día** (132, PR #6): avisa de la versión nueva y la pone con un clic. Comprueba
  el tamaño y el sha256, y que la publique la dueña.
- **Pruebas de verdad** (133, PR #8): un aviso real que sale a GitHub y se cierra solo
  (`prueba/aviso-de-verdad.js`, a mano), y la batería del VS Code de verdad.
- **El alumno se entera** (134, PR #9): le avisa cuando se arregla lo que contó, le enseña «Qué trae» la
  versión y le deja «Probar las versiones nuevas antes».
- **0.43.0, 0.44.0 y 0.45.0**, publicadas. La 0.45.0 incluye la PR #10 de la otra sesión: las claves
  de una aplicación están en su sitio (135).
- **Se pone al día sola** (136, PR #12), con un interruptor para quien prefiera el botón.
- **Licencia MIT** (137, PR #13). El repositorio ya era público.
- **La barra sencilla** (138, rama `la-barra-sencilla`): F0, F1 y F2 del plan
  `02-DOCS/wiki/sdd/proposals/simplificar-la-barra.md`. Tiene una tarjeta, Documentos, Acciones, Ayuda,
  la línea de las copias y un pie. Nada se borra: lo demás se apaga en `media/piezas.json`, y
  `executiveLab.barraCompleta` devuelve la barra de antes.

## Lo que salió por el camino

- **GitHub bloqueó un push** por una clave de Stripe falsa en una prueba. Las claves falsas se arman
  ahora al correr la prueba (`deMentira`), nunca escritas enteras.
- **Las pruebas viejas pintaban la principal y les salía la sencilla**, porque ya es la de fábrica. En
  `humo.js` se enciende `barraCompleta` al empezar. Una prueba de disfraz borra los ajustes globales, así
  que se vuelve a encender antes del último bloque.
- **El fallo de los dos «Recargar ahora»** tras actualizar, que el plan atribuía a la 0.43.0, seguía
  ahí. En la sencilla, si la tarjeta ya lo dice, el aviso no sale.

## Lo que queda

- F3, Ayuda con sus cinco: falta la dirección del foro para «Pedir ayuda en el foro», y ver cómo se abre
  una conversación nueva del asistente.
- F4 y F5, Conexiones paso a paso, que es donde está la fricción.
- F8, publicar la barra sencilla con un «Qué trae» que diga cómo volver a la de antes.
