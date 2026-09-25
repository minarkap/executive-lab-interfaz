---
type: verification
title: Verificación — todo-cuadra, F3 (frenos y enganches)
description: La batería de F3, criterio por criterio, con lo observado, las treinta mutaciones, lo que queda por medir en un VS Code de verdad, y lo que encontró la revisión y cómo se arregló.
timestamp: 2026-09-25T22:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F3
veredicto: pasa, con dos medidas pendientes con Jose
---

# Verificación — F3

Rama `todo-cuadra`, sobre F2 con su revisión (`828c67b`). Tareas T032–T038 del
[plan](../plans/todo-cuadra.md#f3--frenos-y-enganches).

## La batería

| Comprobación | Después de F2 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 231 | **242** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 236 | **247** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 10 | **12** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| C1 | En una carpeta de operaciones (`codeHooks: false`, sin el freno de RSC), los raíles enganchan el nuestro en PreToolUse(Bash): `node "${CLAUDE_PROJECT_DIR}/.claude/skills/executive-lab/freno.mjs" "${CLAUDE_PROJECT_DIR}"`, sin `.rsc/` en la orden. Corrido como lo corre Claude Code (`sh -c`), deniega las seis órdenes de la lista (`rm -rf` de una carpeta, `git push --force`, `git reset --hard`, `DROP TABLE`, un `DELETE` sin `WHERE` y `curl … \| bash`), y un `ls -la` pasa. Con el de RSC puesto, el nuestro calla y deniega el suyo. Con `.rsc/.no-danger-guard`, pasa. La copia fijada es la del paquete (`cmp`: 0, en `skills/` y en `media/railes/`), con la MIT de RSC al lado, y la prueba de P7 la exige por su versión. Un `sync` de RSC de verdad no lo quita. «Las reglas» lo lista armado, con «Lo pone Executive Lab: el arnés no lo trae en esta clase de proyecto.», o «Lo pone el arnés.» con el de RSC. El primer mensaje dice que hay freno. En una carpeta cuyo historial no creó la barra, reponer los raíles no lo engancha: «Qué falta por montar» ofrece «Freno ante órdenes peligrosas · Todavía no: toca los ajustes de Claude de esta carpeta · Ponerlo ahora», y el botón lo pone (C-4). No se ofrece si frena el de RSC |
| C2 | Sin un `node` en el PATH, la barra deja un relevo en su almacén (un guion `sh`, y `node.cmd` en Windows) que llama al Node de VS Code con `ELECTRON_RUN_AS_NODE=1`, y antepone su carpeta al PATH del anfitrión. Un enganche corrido con `sh -c 'node …'` funciona. `ELECTRON_RUN_AS_NODE` no se pone en el entorno de todos. Con un `node` de verdad no se toca nada. Si no se puede, la pieza «Lo que el arnés hace solo» dice «No arranca en este ordenador» con «Arreglarlo», que vuelve a ponerlo y pide cerrar y abrir la conversación. Sin enganches (Codex), la pieza no sale |
| C3 | Tras montar con el Node del instalador delante (`EXECUTIVE_LAB_HOME` de mentira), `.claude/settings.json` en disco es igual que en HEAD, lleva `node` a secas y no tiene la marca (`git ls-files -v` da `H`). Lo que escribió una barra de antes se deshace: las órdenes del arnés y las nuestras vuelven a `node` desde cualquier ruta, en las demás solo la del Node de Executive Lab, y lo que no es node no se toca. La marca `--skip-worktree` se quita cuando no queda ninguna ruta nuestra, y solo con un git que se pueda usar. **En este repositorio**: catorce órdenes con la ruta de la app de Jose y la marca puesta; deshecho, igual a HEAD byte a byte y con `H` |
| C4 | El `session-start.mjs` del paquete, tal cual, con `RSC_LATEST=9.9.9`: sin la barra avisa de la versión nueva (la prueba puede fallar); con el entorno que deja la barra al abrirse (`RSC_NO_UPDATE_CHECK=1`), calla |
| C5 | Con los `optOuts` como los escribe RSC (uno por cada `.no-*`), lo apagado sale cada vez una vez y en español: «La puerta antes de construir» y «Recogida de copias de trabajo», ya no «Feature gate» ni «Worktree cleanup». Con `memory: false`, la memoria sale apagada, en «Las reglas» y en «Lo que tiene apagado». Con Codex, la recogida se nombra si está, porque es de git; los guardianes, no |
| C6 | Medido con el paquete: en una carpeta de operaciones con algo roto, `repair --yes` engancha los cuatro frenos de RSC y `sync` los quita. Ahora `arreglar` y `arreglarSolo` corren `sync` detrás, y tras el paso `arreglarLoRoto` no queda ninguno |
| F5 | El punto de partida de una carpeta nueva lleva `node` a secas: la prueba de C3 mira `git show HEAD:.claude/settings.json` |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` (o `contrato`, donde se dice) y se restaura. El
guion restaura el fichero pase lo que pase; `git status` y `git diff` quedaron igual.

| Mutación | Se pone roja |
|---|---|
| E1 · las órdenes del arnés no vuelven a `node` | los enganches vuelven a `node` |
| E2 · se devuelve cualquier ruta, también la de la persona | los enganches vuelven a `node` |
| E3 · la marca no se quita | la marca que escondía la ruta |
| E4 · sin git, se lanza `git` a secas | la marca que escondía la ruta |
| E5 · la marca se quita con la ruta dentro | la marca que escondía la ruta |
| E6 · el montaje vuelve a escribir la ruta, sin deshacerla | tras montar, el ajuste versionado |
| E7 · la pieza dice «Listo» siempre | sin node y sin relevo posible |
| E8 · la pieza sale sin enganches | sin node y sin relevo posible |
| E9 · el botón no sabe dónde va el relevo | Arreglarlo pone el relevo |
| E10 · el botón dice que está arreglado cuando no | Arreglarlo pone el relevo |
| V1 · al activar no se apaga el aviso de versión | el arranque no ofrece actualizar |
| V2 · el interruptor se pone vacío | el arranque no ofrece actualizar |
| F1 · los raíles no enganchan el freno | las seis órdenes · con `.no-danger-guard` · y las otras dos |
| F2 · el nuestro no se aparta con el de RSC | con el freno de RSC puesto |
| F3 · la orden lleva `.rsc/` | las seis órdenes |
| F4 · `--ajena` no deja nada pendiente | historial ajeno · con el de RSC puesto |
| F5 · reponer no dice que el historial es de alguien | historial ajeno |
| F6 · la pieza pendiente no sale | historial ajeno |
| F7 · la pieza sale aunque frene el de RSC | con el freno de RSC puesto |
| F8 · el botón no dice que sí | historial ajeno |
| F9 · la copia deja de ser la del paquete | la versión fijada en todos sus sitios |
| F10 · el envoltorio carga otra copia | la versión fijada · las seis órdenes |
| F11 · «al día» mirando solo SKILL.md | unos raíles de la semana pasada |
| G1 · el freno, siempre «del arnés» | Las reglas lo lista armado y dice su origen |
| G2 · «Las reglas», solo con lo de `.rsc/` | Las reglas lo lista armado |
| G3 · la pantalla, sin el origen | Las reglas lo lista armado |
| H1 · solo se traduce el interruptor de gitmoji | lo apagado sin repetir |
| H2 · la memoria no se lee de la declaración | lo apagado sin repetir |
| H3 · lo que es de todos, solo con Claude | lo apagado sin repetir |
| S1 · `repair` sin `sync` detrás (`contrato`) | tras arreglar no quedan frenos de RSC |

E6 sobrevivía en la primera pasada: el mutante escribía la ruta y la función nueva la quitaba acto
seguido, así que se curaba solo. Rehecho como el comportamiento de antes (escribir sin deshacer),
muere.

## Pruebas que se reescribieron porque daban por bueno el fallo

- «Un enganche que apunta al ordenador de otro se arregla» escribía nuestra ruta en el ajuste; ahora
  mira que se deshaga.
- «El arreglo de cada máquina deja de contar como un cambio suyo» exigía la marca `--skip-worktree`;
  ahora mira que se quite.
- «Unos raíles de la semana pasada» ponían solo `SKILL.md` como «la de hoy»; ahora la habilidad
  entera, y una sin el freno cuenta como de antes.
- «Lo que el arnés hace solo se nombra…» usaba unos `optOuts` inventados; la nueva de C5 usa los que
  escribe RSC.

## Lo que no se puede comprobar aquí

Quedan con Jose, con su orden, y no bloquean:

- **T032 (2).** `npm run probar-en-vscode` baja unos 900 MB de VS Code a
  `~/.cache/executive-lab-vscode-test`, fuera del proyecto. Mide que, en un VS Code de verdad, el PATH
  del anfitrión empieza por la carpeta del relevo y que un proceso hijo lo hereda.
- **T032 (3).** En una sesión de Claude abierta desde la barra, en un Mac sin `node`: `which node` da
  el relevo, el freno deniega un `rm -rf` y no sale ningún aviso de error de los enganches. Es la
  misma medida que decide si el aviso de versión (C4) llega apagado.
- **Si Claude ya estaba abierto antes que la barra**, su proceso no ve el relevo hasta que se abre la
  conversación otra vez. La barra lo dice al pulsar «Arreglarlo»; si también hay que decirlo al
  arrancar, lo dirá la medida de T032 (3).
- **Windows**: el relevo en Git Bash y en PowerShell (`node.cmd`), y el freno corrido allí.
- **Tres nombres sin aprobar (P2)**: `.no-git`, `.no-harness` y el aviso de versión nueva, que C5
  pedía nombrar en la lista. Propuesta para el informe: «El aviso de que falta git», «El arnés,
  apagado en esta carpeta» y «El aviso de versión nueva».

## Lo que encontró la revisión con ojos frescos

La primera vez se colgó en una orden larga y no entregó nada. La segunda corrió sobre una exportación
del commit, sin tocar el repositorio: `humo` 242, `contrato` 12, el diccionario, PowerShell y las tres
empresas, igual que lo dicho; `cmp` de las dos copias del freno, 0; el ajuste de este repositorio, con
`H` e igual a HEAD. No corrió `humo+`, porque creía que usa la red. Veredicto: *changes-needed*, con 0
críticos, 3 importantes y 5 menores.

Cada hallazgo se comprobó antes de aceptarlo, y se aceptaron todos. Como F4 ya estaba encima, los
arreglos van en un commit propio, con el trabajo de F5 apartado.

| Hallazgo | Qué se hizo |
|---|---|
| **Importante, I1 (P4).** Al poner el freno se quitaba el grupo entero de PreToolUse donde estaba el nuestro; un enganche de la persona en ese mismo grupo desaparecía, también con `--ajena`, en cada reposición | Se mira orden a orden: se quitan solo las nuestras, un grupo se deja si le queda algo, y el nuestro va en el suyo. Prueba nueva, «enganchar el freno no se lleva lo de la persona que comparte su grupo», con y sin `--ajena` |
| **Importante, I2.** Cinco mutaciones sobrevivían: el envoltorio apartándose con solo el fichero de RSC o con solo su enganche; la activación sin poner el relevo; el `sync` que falla después de arreglar, callado; y toda carpeta tratada como de alguien | Una prueba por cada una: «el freno de RSC solo manda si está puesto de verdad: fichero y enganche» (con el enganche y sin el fichero, que es un clon, el arranque de RSC no deniega); la de los comandos del manifiesto mira que al abrirse la barra se apague el aviso de versión; «si el sync de después de arreglar falla, se dice»; y la del montaje mira que una carpeta nueva quede con su freno. Mueren las cinco |
| **Importante, I3.** Si Claude arranca antes que la barra —una conversación que se restaura al abrir—, su proceso no ve el relevo ni el aviso apagado, y la pieza decía «Listo» | Al abrirse, la barra mira si la extensión de Claude ya estaba activa; si lo estaba y hizo falta el relevo, la pieza dice «Cierra la conversación con Claude y ábrela otra vez para que lo coja.» con «Arreglarlo». Prueba nueva. Adelantar la activación de la barra (`*` en vez de `onStartupFinished`) cambiaría cómo arranca todo y no se puede medir aquí: queda como propuesta con la medida de T032 (3) |
| Menor, M1 (P3). «Ponerlo ahora» decía «Ya está» aunque los raíles no pudieran leer los ajustes, porque salen con 0 | El botón mira que el freno haya quedado enganchado, y el del bloque de `CLAUDE.md` igual. Prueba nueva, con unos ajustes rotos |
| Menor, M2 (P3). Con el módulo de un instalador de antes, deshacer las rutas fallaba sin apuntar nada | Se apunta para «Algo va mal». Prueba nueva, con una app de mentira. Arreglarlo del todo es G2, en F7 |
| Menor, M3. La pieza del freno pendiente se ofrecía con el freno apagado por la persona o con un perfil técnico, y «Las reglas» ponía «pendiente» por delante de «apagado» | No se ofrece en esos dos casos, y apagado va primero. Prueba nueva |
| Menor, M4. Tres definiciones de «el freno de RSC está puesto»: «Las reglas» pedía solo el fichero | Las tres piden fichero y enganche, como el envoltorio. Prueba nueva. La prueba de T036 ponía solo el fichero para «con el de RSC puesto»; ahora pone los dos |
| Menor, M5. El relevo se reescribía en cada apertura, a trozos: un enganche de otra ventana podía correr un guion vacío y dejar pasar la orden | Se escribe solo si cambia, y de golpe (a un fichero aparte que después ocupa su sitio). Prueba nueva |

Y lo que el revisor señaló del informe, que se corrige aquí:

- **T032 (2) no se hizo**, y la elección del relevo se tomó con (1) sola. Es verdad: (2) baja unos
  900 MB fuera del proyecto y espera el sí de Jose. T032 queda bloqueada en (2) y (3), no hecha.
- **C2 y C4** están probados dándole un entorno a la función, no en un VS Code de verdad: que el proceso
  del asistente herede el PATH y `RSC_NO_UPDATE_CHECK` es justo lo que mide T032 (2) y (3).
- **C3**, en un ordenador con un instalador de los de antes, no se deshace: manda su `enganches.js`
  viejo (G2), y ahora al menos se apunta. Lo arregla F7.
- **C5**, a medias: `.no-git` y `.no-harness` siguen saliendo por su identificador, a la espera de los
  nombres de Jose.
- Sin contar, lo que dicen `instalador/mac/instalar.js` y `probar.sh` de las rutas absolutas: son del
  instalador, que no se toca sin Jose.

### Mutación de los arreglos

| Mutación | Se pone roja |
|---|---|
| R1 · el freno se quita por grupos | lo de la persona que comparte su grupo |
| R2 · el botón no mira si quedó puesto | Ponerlo ahora no dice que está puesto |
| R3 · apagado, se ofrece igual | el freno apagado o con un perfil técnico |
| R4 · pendiente antes que apagado | el freno apagado o con un perfil técnico |
| R5 · el de RSC, solo por su fichero | Las reglas, sin su enganche |
| R6 · el `sync` que falla, callado | si el sync de después de arreglar falla |
| R7 · el relevo, siempre reescrito | el relevo no se reescribe si ya está bien |
| R8 · el asistente de antes, sin decir | con Claude abierto antes que la barra |
| R9 · al abrirse, sin relevo | los comandos del manifiesto |
| R10 · el nuestro se aparta con solo el fichero | fichero y enganche |
| R11 · el nuestro se aparta con solo el enganche | fichero y enganche |
| R12 · toda carpeta, como si fuera de alguien | tras montar, el ajuste versionado |

Mueren las doce, y entre ellas las cinco que sobrevivían al revisor (R6, R9, R10, R11 y R12).

La batería, con los arreglos y sobre F4: `humo` 262, `humo+` 267, `contrato` 12, las tres empresas,
y el diccionario y PowerShell limpios.
