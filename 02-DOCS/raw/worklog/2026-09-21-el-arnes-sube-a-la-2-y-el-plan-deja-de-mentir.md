---
type: worklog
title: El arnés sube a la 2.0.5, y por el camino se descubre que el plan estaba construido sobre un editor descargado
description: Leída la 2.0.5 contra la 1.4.1 fichero a fichero. Las tablas que copia la barra no cambian; lo que cambia es que ahora se instalan 32 habilidades en vez de 8. Y al mirar la evidencia del plan salió que 1,6 GB de editores descargados dentro de la carpeta contaban como evidencia de este proyecto. 0.19.0.
timestamp: 2026-09-21T18:00:00Z
topic: harness
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«Haz todo, revisa las nuevas versiones de RSC y adapta la extensión a RSC también»*.

## Lo primero: qué NO cambia

Leída la 2.0.5 contra la 1.4.1, fichero a fichero. Un salto de versión mayor y **no tocó ni una fila
de lo que la barra depende**:

- `targets/index.js`, `targets/commands.js` y `targets/agents.js` —las tres tablas que copia
  `sitios.js`— son **idénticas byte a byte**.
- El esquema de `.rsc.json` (`manifest-file.js`), idéntico.
- Ninguno de los marcadores que la barra lee ha cambiado: `Plan id:`, `Accept exactly this plan`,
  `RSC_ONBOARDING_READY`, `RSC_ONBOARDING_INCOMPLETE`, `RSC_PLAN_CHANGED`, `RSC_REASSESSMENT_*`,
  `Nothing to repair`, `[fix]`/`[ask]`, `no local continuation`.
- La lista de comandos, igual.

Eso se ha dejado escrito en las dos copias de `sitios.js`, con la fecha del contraste.

## Lo que sí cambia

**Un solo arnés para todos.** La 2.0 instala el perfil `core` siempre: 32 habilidades en vez de 8,
con la cadena de trabajo entera. La pantalla de habilidades pasaba de cuatro líneas a veintisiete, en
inglés. Qué es fontanería pasa a ser un **dato** en `nombres.json` — eran cuatro y son veintisiete—,
y lo que no esté en esa lista sigue saliendo.

**RSC escribe un `CLAUDE.md` propio** desde la 2.0, para que Claude Code no se lea su capa
siempre-activa dos veces desde que lee `AGENTS.md`. Sin restarlo, nuestro detector de «otro
asistente montado a mano» le pediría permiso a alguien para respetar un fichero nuestro.

## Y lo que salió al mirar la evidencia

`reassess` recomendaba las cuatro cosas aplazadas, con la explicación «the project added
**authentication, external-integrations, persistence** evidence». Este proyecto no tiene nada de eso.

La causa: **1,6 GB de editores descargados dentro de la carpeta** — el VS Code de
`extension/.vscode-test/` (901 MB) y el de `.demo/` (729 MB). `scanProject` **no lee el
`.gitignore`**: tiene su propia lista de ignorados, y `.vscode-test` no está en ella. Contaba como
evidencia de este proyecto un VS Code entero con sus extensiones, y entre las dependencias de la de
Copilot hay `react`. De ahí `skill/react`, dos ayudantes de React y tres comandos de React en el plan
de una barra lateral escrita en JavaScript plano.

Los dos se van fuera de la carpeta: `cachePath` en las pruebas y `$HOME/.cache` en la demo. La
evidencia pasa de un invento a **81 ficheros y `node`, sin señales de complejidad**.

## Lo que se aceptó, y lo que no

Sobre esa evidencia limpia se acepta el plan nuevo: 33 habilidades, 6 ayudantes, las puertas de
código. Lo nuestro sobrevive —`texto-de-la-barra` y los dos ayudantes siguen ahí— porque RSC solo
gobierna sus propias rutas.

Lo que **no** se acepta: `guard/gitmoji-guard`, que bloquea cualquier `git commit -m` sin emoji y
gramática de Conventional Commits. Los commits de aquí se escriben en español y en frase. Se pone el
interruptor que el propio RSC deja, `.rsc/.no-gitmoji`, con el motivo dentro.

Y se escribe la constitución que el suelo pedía: ocho reglas, todas comprobables, todas escritas
después de romperlas al menos una vez.

## Los tres pendientes que quedaban

- **`reassess`** estaba cableado y no lo llamaba nadie. Ahora sale como pieza cuando alguien pide ver
  qué falta —nunca en la pantalla principal, que se repinta sola—. Su arreglo no aplica nada:
  explica, propone y prohíbe aceptar un plan sin firma.
- **Rama `ponerAlDia`**: una carpeta montada con un arnés más viejo que el que trae la barra se
  reconstruye con `sync`, sin preguntar, porque el plan ya estaba aceptado.
- **El fixture** pasa a leer la versión que la barra lleva dentro en vez de escribirla a mano. Es el
  mismo fallo que ya mordió con el fichero de estado.

## Cómo quedó

169 comprobaciones, las tres empresas, diccionario limpio. `repair --dry-run` dice que el arnés está
sano y `reassess` no tiene nada que recomendar. Publicada e instalada la 0.19.0.

## Lo siguiente

- Sigue abierto el montaje que le falló a Jose en una carpeta suya.
- Windows no se ha probado en máquina real desde la reestructura.
- Publicar en las tiendas, bloqueado en crear el editor y el token.
