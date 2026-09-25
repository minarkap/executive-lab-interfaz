---
type: worklog
title: Todo cuadra, F7 — lo que se enseña es lo que hay
description: Todo mensaje del panel despachado, el arnés del .vsix primero, la salud por doctor --json, lo instalado en disco, los comandos por lenguaje con nombre, las preguntas de RSC y el suelo con la plantilla entera. Decisión 123.
timestamp: 2026-09-26T07:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F7 del programa `todo-cuadra`: T059–T065, cada una con su prueba en rojo primero.
Lo que más pesa:
- **«Resolver una incidencia» ya no revienta**, y una prueba despacha todo lo que manda el panel.
- **Corre el arnés de la barra**, aunque en el ordenador quede el de un instalador de antes.
- **La barra solo dice «Listo» cuando el arnés también**, y lo que falta sale por su nombre.

## Lo que salió por el camino

- La revisión de seguridad de F6 llegó a mitad de F7 con un crítico (una clave ya en el índice entraba
  en la copia): F7 se apartó en un `stash`, se arregló en su propio commit, y se siguió.
- La plantilla de RSC trae cinco ficheros y uno está oculto (`.env.example`). La empresa de mentira no
  lo tenía, y el suelo nuevo lo vio.
- Una mutación sobrevivía en T063 porque la regla por familia ya ponía los comandos entre los del
  arnés: faltaba el caso de uno que solo el estado del arnés conoce.

## Lo que queda

- La revisión con ojos frescos de F7.
- F8 (documentación y diccionario) y F9 (cierre).
