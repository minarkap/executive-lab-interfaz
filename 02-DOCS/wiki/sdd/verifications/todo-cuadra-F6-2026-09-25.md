---
type: verification
title: Verificación — todo-cuadra, F6 (credenciales, conexiones y copias)
description: La batería de F6, criterio por criterio, con lo observado y las treinta y cuatro mutaciones.
timestamp: 2026-09-26T04:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F6
veredicto: pasa
---

# Verificación — F6

Rama `todo-cuadra`, sobre la revisión de F5 (`db27530`). Tareas T053–T057 y T076 del
[plan](../plans/todo-cuadra.md#f6--credenciales-conexiones-y-copias).

## La batería

| Comprobación | Después de F5 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 280 | **287** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 287 | **294** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **12** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| F1 | Con git de verdad en un temporal, guardar deja fuera `.env`, `credentials.json` y `x.pem` de la raíz y lo dice («No he metido … en la copia: son ficheros de acceso y no deben salir de este ordenador.»), con «Ponerlos en su sitio». Una presentación `.key` entra. Si solo cambió lo que se queda fuera, no hay copia que hacer. Una que ya estaba en git sigue en git, con sus cambios. El bloque de los raíles en el `.gitignore` de la raíz deja fuera once formas de credencial y deja pasar `.env.example`; se pone una vez, no saca de git lo que ya estaba, y en una carpeta de alguien espera a su sí con el botón de siempre. El asistente, por el raíl `guardar.md` y por el bloque |
| F2 | Una consulta que imprime la clave de su herramienta la enseña como `••••5678`, y lo que no es una clave se queda como estaba. El informe de «Algo va mal» no lleva ningún valor del `.env` de las herramientas ni de los sueltos. Un `push` que falla no deja el token ni en la orden ni en el error ni en el informe, en ninguna de sus tres formas, con un git de mentira que repite su URL y sus cabeceras |
| F3 | Doce claves, entre ellas `#`, `$`, espacio, comillas, comillas invertidas, `;`, `$(touch …)`: con `bash -c 'set -a; source .env'` llegan exactamente como se pegaron, la barra las lee igual, y no se ejecuta nada. Una sin nada raro se queda sin comillas. Una de antes, sin comillas, que rompe la prueba, se dice como lo que es |
| F4 | Con un PATH sin Python, un `.py` no se lanza: «Esta consulta necesita Python, y en este ordenador no está.», con «Pedírselo al asistente». La habilidad pide los guiones en bash o en node |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` y se restaura, también en las copias de los raíles y
de lo común. Desde T055, una batería que se cae se cuenta aparte: la primera pasada de T055 se cayó
entera y el guion la contó como «sigue verde».

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T053 | sin el bloque · el bloque cada vez · en la de alguien sin esperar · con `*.key` · sin `!.env.example` · la barra no ve que falta · el botón siempre con lo de siempre · uno de otro día al día · sin `credentials.json` | las nueve |
| T054 | el binario sin dejar fuera · contar cambios en vez de lo que entra · una `.key` siempre clave · sin decirlo · sin el botón · el aviso sin su botón · sin los ficheros de acceso · lo que ya sigue git fuera también | las ocho, y una más que sobrevivía porque el filtro estaba en dos sitios: queda en uno |
| T076 | la consulta sin tapar · el informe sin tapar · todo tapado · sin las sueltas · sin las de las herramientas | las cinco |
| T055 | el token en la URL · el error sin limpiar | las dos |
| T056 | sin comillas · sin escapar la comilla · siempre con comillas · el lector sin los tramos · culpar al guion | las cinco |
| T057 | a ciegas · sin el botón · la consulta sin mirar · la habilidad sin pedirlo | las cuatro |

Treinta y cuatro, y mueren todas.

## Pruebas que cambiaron

- La de los raíles de otro día monta «la de hoy» con el bloque del `.gitignore` también.
- La del motor de JavaScript suma dejar fuera una clave; aquí sale «SALTADA», porque su biblioteca no
  está en esta copia.

## Lo que no se puede comprobar aquí

- Una subida de verdad a GitHub con el token en una cabecera.
- El Python de Windows (`py -3`, el atajo de la Tienda), y el motor de JavaScript de git.

## Lo que encontró la revisión con ojos frescos

Corre sobre el commit de F6.
