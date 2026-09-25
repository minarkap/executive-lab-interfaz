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

La hizo el revisor de seguridad, sobre una exportación de `f1dd1d6`, sin tocar el repositorio: la
batería rápida y el diccionario, igual que lo dicho, y experimentos suyos con git de verdad, con un
`.env` de Windows y con dos servidores locales para ver si la cabecera del token salía de su sitio (no
sale: git la quita al seguir una redirección a otro sitio). Veredicto: *changes-needed*, con 1 crítico,
2 importantes y 2 menores. Se comprobaron todos, y se aceptaron.

| Hallazgo | Qué se hizo |
|---|---|
| **Crítico (F1).** El motor binario tomaba por «ya en git» lo que estaba en el índice (`git ls-files`), no en la última copia: un `.env` añadido con `git add` y sin copia todavía entraba en la copia sin decir nada, y el pathspec que excluye no lo saca del índice. El asistente puede hacer ese `git add`, y el guardado solo corre cada rato | «Ya en git» es lo que está en la última copia (`git ls-tree HEAD`), como en el motor de JavaScript, y lo que se deja fuera se saca también del índice, sin tocar el disco. Prueba nueva, con copia de antes y sin ninguna |
| **Importante (F2).** El tapado sabía de los `.env` y no de los ficheros de acceso: un guion que hace `cat` de la cuenta de servicio de su herramienta la enseñaba entera | Se tapan también los campos secretos de los JSON de acceso y cada línea del cuerpo de una clave privada, en el `keys/` de cada herramienta y en los sueltos. Prueba nueva, con el JSON, la clave en claro y un `.pem` |
| **Importante (F3).** Un `.env` con finales de Windows: bash deja el `\r` en el valor, la barra lo quitaba al leer, y la prueba fallaba sin que se supiera por qué | Al guardar una clave, el fichero queda con finales de Unix, y uno con finales de Windows se dice como «tiene caracteres que la prueba lee mal», también cuando la herramienta contesta que la clave no vale. Prueba nueva |
| Menor. El plan decía `# executive-lab:inicio` y `fin`, y el código usa `start` y `end` | El plan, al día |
| Menor. Una clave de menos de seis caracteres no se tapa | Se deja así, a sabiendas: está dicho en el código y en la decisión |

### Mutación de los arreglos

«Ya en git» por el índice · sin sacarla del índice · sin los ficheros de acceso · sin el cuerpo de la
clave · sin los campos secretos · con los finales de Windows al guardar · sin verlos · un 401 tomado por
clave que no vale. Ocho, y mueren todas. Una, la del cuerpo de la clave, sobrevivía, porque ese cuerpo ya
salía por el campo `private_key`: se añadió un `.pem` a la prueba.

La batería, con los arreglos y sobre F6: `humo` 290, `humo+` 297, `contrato` 12, las tres
empresas, y el diccionario y PowerShell limpios.
