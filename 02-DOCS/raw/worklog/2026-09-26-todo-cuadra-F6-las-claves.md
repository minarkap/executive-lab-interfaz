---
type: worklog
title: Todo cuadra, F6 — las claves no salen de este ordenador
description: El bloque de credenciales en el .gitignore, guardar sin credenciales, claves tapadas en consultas e informes, el token de GitHub fuera de la orden, claves con comillas que aguantan source y Python mirado antes de lanzar. Decisión 122.
timestamp: 2026-09-26T04:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F6 del programa `todo-cuadra`: T053–T057 y T076, cada una con su prueba en rojo primero.
Lo que más pesa:
- **Una credencial suelta ya no entra en la copia ni sube a GitHub**, y se dice, con un botón para
  ponerla en su sitio.
- **Ningún valor de una clave se enseña**: ni en una consulta, ni en el informe de «Algo va mal», ni
  el token al subir.
- **Una contraseña con cualquier carácter llega entera a su prueba**, y no se ejecuta nada.

## Lo que salió por el camino

- `*.key` se quedó fuera del bloque: en un Mac, las presentaciones de Keynote acaban así. Y el
  inventario ya las tomaba por claves; ahora mira lo que llevan dentro.
- El git de este Mac ya no repite la clave de la URL, pero la orden se ve mientras corre: el token va
  por el entorno.
- Una prueba se cayó entera por un `${…}` de sh sin escapar, y el guion de mutaciones lo contó como
  «sigue verde». Ahora lo dice.
- La revisión de F5 llegó a mitad de F6: T053 se apartó en un `stash`, se arreglaron sus dieciocho
  hallazgos en su propio commit, y se siguió.

## Lo que queda

- La revisión con ojos frescos de F6.
- Con Jose: una subida de verdad a GitHub, y Python en Windows.
