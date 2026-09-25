---
type: verification
title: Verificación — todo-cuadra, F2 (las carpetas)
description: La batería de F2, criterio por criterio, con lo observado, las veintidós mutaciones, y lo que encontró la revisión y cómo se arregló.
timestamp: 2026-09-25T18:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F2
veredicto: pasa
---

# Verificación — F2

Rama `todo-cuadra`, sobre F1 (1b53d22). Tareas T015–T018 y T020–T030 del
[plan](../plans/todo-cuadra.md#f2--las-carpetas). T019, la versión más nueva que la de la clase, va
en F4 detrás de la regla 7 (T041), como dice el plan.

## La batería

| Comprobación | Después de F1 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 205 | **227** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 208 | **232** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 9 | **9** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| B1 | `terreno.queCarpetaEs()`, con doce rutas de macOS y Windows que no se preparan (raíz, carpeta personal, la que la contiene, las del sistema) y cuatro que sí. Con una carpeta personal de mentira (`HOME` desviado): la rama es `noSePrepara`, la pantalla principal lo dice con «Crear una carpeta aquí dentro», pulsar «Preparar» no escribe nada, y el botón crea `Contabilidad` dentro y la abre. Documentos entera se pregunta antes de escribir nada, también en iCloud y OneDrive; un nombre como `../fuera` no crea nada. |
| B2 | El clon como lo deja `git clone` (con lo nuestro, sin `.rsc/` ni las habilidades de RSC, y también con sus enlaces colgando) se ve como `clonado` y va a `traer`. En `humo+`: se monta de verdad, se clona sin red, y el clon se reconoce, no pregunta nada y queda montado. |
| B3 | Con «Seguir sin copias» guardado, «Preparar» monta sin volver a sacar el aviso, sin `ponerGit` ni punto de partida. «Qué falta por montar» dice «Sin copias, porque lo elegiste» y «Ponerlas ahora», que, ya con git, deja historial, punto de partida y la respuesta olvidada. |
| B4 | En una carpeta de alguien, antes de firmar el plan: «Aquí ya hay cosas tuyas. Para montar el arnés voy a tocar esto: la lista de lo que no entra en git y los ajustes de Claude de esta carpeta. No borro nada tuyo.», con lo que choca en el detalle, y sin el sí no se acepta nada. Cada choque se pregunta: renombrar a `review-propia` (con su `name:`, y el plan se vuelve a pedir), que la del arnés ocupe su sitio (se dice dónde queda la suya), o, con un comando, dejar el suyo. Con varios, «Cambiarles el nombre a todas» o «Elegir una a una». Sin respuesta, no se monta. En `humo+`, con RSC de verdad sobre un proyecto con historial ajeno: sus cuatro ficheros, iguales byte a byte; ningún commit nuestro; `review-propia` intacta salvo el nombre. |
| B6 | Con una identidad global de mentira («Ana García»): el historial que crea la barra sigue siendo suyo, y un clon de él también. En un historial ajeno la barra no guarda sola, y el botón sí guarda (C-16). |
| B7 | Las ocho ramas que montan dejan historial (`desdeCero`, `encimaDeLoQueHay`, `otroArnes`, `traer`, `completar`, `sinRecibo`, `ponerAlDia`, `adoptar`). La pieza de las copias dice «Todavía sin copias» sin `.git`. |
| B8 | Sin `.rsc.json` y con lo que deja RSC y nada más: `aMedias`, rama `completar`, sin pedir permiso, y la pantalla ofrece terminarlo. |
| B9 | Dentro de otro proyecto se dice antes de escribir nada, con «Prepararla igual» y «Elegir otra carpeta». Con varias carpetas, «Trabajo con «X», la primera de las carpetas abiertas.» |
| B10 | Si el punto de partida no se guarda, el montaje sigue y se dice, con su «Algo va mal». |
| B11 | `completar` lleva el dial y las palabras del perfil de hoy y los asistentes declarados hoy; lo que se contesta en ese montaje gana. Y pregunta lo que en el recibo no vale (antes mandaba `L9`). |
| B12 | La sombra de RSC tal cual no cuenta; con texto debajo, es de alguien. |
| A5 | Con `package.json`, «Construir algo» va primero y el primer objetivo es «Seguir con lo que ya hay». En una vacía, lo de siempre. |
| A6 | El primer mensaje pide el perfil, dice si hay freno (leído como «Las reglas»), pide preguntar de una en una y, en una carpeta de alguien, que mire antes de tocar. «de una pregunta en una pregunta» ya no está. |
| A7 | Cada encargo tiene por dónde llegar: el de mirar lo que había y el de las claves, en el primer mensaje; el suelo, como pieza con su botón. El valor de la clave no sale en el mensaje. |
| A9 | Sin ningún asistente, se pregunta cuál poner y se pone con `workbench.extensions.installExtension`; sin contestar, no se sigue. |
| A12 | Volver a montar con un plan que enciende la cadena SDD y las comprobaciones: «El arnés quiere cambiar lo que tiene montado: añadir …», en cristiano, y sin el sí no se firma. Si solo cambia la huella, no se pregunta. |
| I3 | En `humo+`: vacía con operaciones y con software que crece (F1), clon real y proyecto de alguien con choque. La vacía con «un poco de todo» la monta `contrato.js`. |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` y se restaura. El guion restaura el fichero pase lo
que pase; `git status` quedó igual.

| Mutación | Se pone roja |
|---|---|
| N1 · ninguna carpeta se deja de preparar | carpeta personal y sistema · Documentos |
| N2 · `rumbo` no para la carpeta personal | carpeta personal y sistema |
| N3 · Documentos no se pregunta | Documentos |
| N4 · el clon, sin la regla de `.rsc/` | el clon como lo deja git clone (con los enlaces colgando) |
| N5 · la respuesta de seguir sin copias no se lee | seguir sin copias |
| N6 · la pieza de las copias dice «Listas» sin historial | seguir sin copias · la radiografía sin `.git` |
| N7 · una carpeta de alguien no se confirma | la carpeta ajena · el nombre que choca |
| N8 · renombrar no cambia nada | el nombre que choca |
| N9 · el historial, por los autores | el clon de un historial de la barra |
| N10 · las ramas no ponen historial | toda rama que monta deja historial |
| N11 · lo nuestro a medias se ve como de otro | estado de RSC sin `.rsc.json` |
| N12 · no se mira lo de encima | dentro de otro proyecto |
| N13 · con varias carpetas no se dice cuál | varias carpetas |
| N14 · volver a montar con el recibo | completar conserva el dial y los asistentes |
| N15 · `completar` no pregunta lo que no vale | si se cambia el dial, gana el nuevo |
| N16 · no se mira lo que se ve | con `package.json` |
| N17 · el mensaje no dice que la carpeta era de alguien | el primer mensaje |
| N18 · el encargo de mirar la carpeta no llega | ningún encargo se queda en el registro |
| N19 · sin asistente, se monta para Claude | sin asistente se ofrece ponerlo |
| N20 · el punto de partida no se mira | el punto de partida que falla |
| N21 · el plan nuevo se firma sin mirar | el plan que enciende SDD |
| N22 · la sombra, hasta el final del fichero | lo escrito debajo de la sombra |

N4 sobrevivía en la primera pasada: el clon de la prueba cumplía también la otra regla, así que la
de «sin `.rsc/` es un clon» no la miraba nada por sí sola. Se añadió el caso que solo esa regla caza,
los enlaces de RSC que viajaron en git apuntando a un `.rsc/` que no está, y ahora muere.

## Pruebas que se reescribieron porque daban por bueno el fallo

- El clon con `.claude/skills` vacío, que ningún `git clone` deja.
- Tres fixtures de «arnés montado» sin `.rsc/`, que uno de verdad siempre tiene.
- La sombra de RSC inventada («lo que escribe RSC»), que ahora es la del paquete.
- «Seguir sin copias» decía «y no se vuelve a preguntar» sin mirarlo.

## Lo que no se puede comprobar aquí

- Crear la carpeta nueva y abrirla se prueba con el editor fingido: que `vscode.openFolder` se lanza
  con la ruta buena. Que el editor de verdad la abra en la misma ventana queda para
  `npm run probar-en-vscode`.
- `workbench.extensions.installExtension` se prueba fingido: que se lanza con el identificador
  bueno. Que instale de verdad necesita red, y queda para la prueba a mano.

## Lo que encontró la revisión con ojos frescos

Un revisor con el contexto limpio, sobre el diff de F2 (`1b53d22` y el commit de F2), con las
comprobaciones de cada tarea y las restricciones del plan. Pasó la batería (`humo` 228, `contrato` 9
y `humo+` 231, con dos rojas que eran pruebas de F3 a medio escribir en el árbol). Cotejó con el
paquete de RSC cada forma que la barra lee, y probó cada fallo con llamadas puras que no escriben
nada. Veredicto: *changes-needed*, con 2 críticos, 4 importantes y 18 menores.

Cada crítico y cada importante se comprobó en el código antes de aceptarlo, y se aceptaron todos. El
trabajo de F3 que ya estaba empezado se apartó en un *stash* para arreglar esto sobre F2.

| Hallazgo | Qué se hizo |
|---|---|
| **Crítico, C1.** La guarda de la carpeta personal no miraba el estado `aMedias`, que T022 da a una carpeta con lo que deja RSC y sin `.rsc.json`. Una carpeta personal con restos de un montaje se completaba: `git init` en ella y RSC sobre `~/.claude/`. La pantalla principal lo paraba; el comando de la paleta, no | `rumbo`: un montaje a medias sin su `.rsc.json` tampoco está declarado. Prueba nueva, «la carpeta personal con restos del arnés tampoco se prepara», con la casa de mentira, una habilidad de RSC y su estado (R1) |
| **Crítico, C2.** Con RSC 2.0.5 de verdad, encender la cadena SDD llega como `skill/sdd` y un `agent/<id>` por agente; `workflow/sdd` y `agent/base-agents` solo salen aplazadas. La tabla no casaba, y los agentes se buscaban entre las habilidades: la pantalla del sí salía en inglés («Developer, Refuter correctness…») | `PIEZAS_DEL_PLAN` con las claves de verdad. Los agentes, en su tabla, juntos y cada uno por su nombre («los agentes «Desarrollador», «Revisor de corrección»…»), y las habilidades igual. En `contrato.js`, «lo que cambia entre dos planes de RSC se dice en español»: pide tres pares de planes al paquete (21 piezas) y mira que cada una salga en pantalla con su frase o con su nombre (R5b) |
| **Importante, I1.** En una carpeta de alguien sin historial, el `git init` y la marca de que el historial es de la barra iban antes de pedir el sí. Con «No, déjalo», se quedaban | `rumbo`: en una carpeta de alguien, el historial va detrás del montaje, que es donde se pide el sí. RSC monta igual sin historial: lo único que se salta es la línea de rescate del `.gitignore` cuando alguien ignora `.claude/` entera, que en una carpeta sin git es raro. La prueba de la carpeta de alguien mira que sin el sí no haya `.git`, también en una empezada sin asistente (R2, R3) |
| **Importante, I2.** La carpeta se resolvía a su sitio real y la lista del sistema no. En macOS, `/etc`, `/var` y `/tmp`, que son enlaces a `/private/…`, pasaban como preparables; en Linux con `/usr` unido, igual con `/bin`, `/sbin` y `/lib` | La lista, también por su sitio real. Prueba nueva, «las del sistema se reconocen también por su sitio real», con los enlaces de macOS y de Linux. Lo de dentro de `/private/var` sigue pasando, que es donde viven las carpetas temporales (R4) |
| **Importante, I3.** La prueba de T029 daba por seleccionado `workflow/sdd`, que RSC nunca da, y por eso no veía C2 | Reescrita con lo que dice el paquete (medido el 25-09): las cuatro que aplaza con «Una cosa concreta» y las siete que entran con «Algo que irá sumando piezas» (R5, R6) |
| **Importante, I4.** Renombrar una habilidad cambiaba el `name:` de su SKILL.md con `writeFileSync`, que sigue los enlaces. Con un SKILL.md enlazado a un fichero compartido, se escribía fuera de la carpeta | `ajena.resolver` mira todo antes de mover nada, y un SKILL.md que es un enlace no se renombra: se para y se dice cuál (C-9). Prueba nueva, «una habilidad con su SKILL.md enlazado fuera no se renombra, y no se monta». Mira el fichero de fuera y que el comando no se renombró antes de parar (R7) |
| Menor, m10. Con solo un choque, la frase decía «no toco nada tuyo» | Lo que choca es lo que se toca. Prueba nueva, «con solo un choque, el resumen no promete no tocar nada» (R8) |
| Menor, m12. «Sin copias, porque lo elegiste» salía siempre que faltaba git | Solo a quien lo eligió; si no, «Todavía sin copias». La barra le pasa a la radiografía lo que se eligió, y la radiografía ya no pregunta por git (R9) |
| Menor, m7. Dos frases sin fila en el diccionario | Añadidas, con la del resumen con un solo choque y la lista de lo que cambia |

### Mutación de los arreglos

| Mutación | Se pone roja |
|---|---|
| R1 · la guarda no mira lo que está a medias sin declarar | la carpeta personal con restos del arnés |
| R2 · el historial, delante del sí (la regla de `rumbo`) | la carpeta ajena · toda rama que monta deja historial |
| R3 · el historial, delante del sí (la rama de una empezada) | la carpeta ajena, con la empezada · toda rama que monta deja historial |
| R4 · la lista del sistema sin su sitio real | las del sistema por su sitio real |
| R5 · los agentes, buscados entre las habilidades | el plan que enciende SDD |
| R5b · lo mismo, contra el RSC de verdad | `contrato`: lo que cambia entre dos planes |
| R6 · sin `skill/sdd` en la tabla | el plan que enciende SDD |
| R7 · un SKILL.md enlazado se renombra | el SKILL.md enlazado fuera |
| R8 · con solo un choque, «no toco nada tuyo» | con solo un choque |
| R9 · «porque lo elegiste» a todos | seguir sin copias · la radiografía sin `.git` |

Dos sobrevivían la primera vez, y cambiaron las pruebas, no el código:

- **R3.** La prueba de la carpeta de alguien usaba una con otro montaje (`otroArnes`), así que el orden
  de la rama `encimaDeLoQueHay` solo lo miraba la prueba de `rumbo`. Se añadió la empezada sin
  asistente.
- **R5b.** La comprobación de `contrato` miraba que las tablas tuvieran los nombres, no que la pantalla
  los usara. Ahora compara con lo que sale.

R6 contra `contrato` sobrevive, y está bien que sobreviva: sin la frase, `sdd` sale con su nombre en
español de la tabla («Desarrollo por especificación (SDD)»), que es lo que `contrato` exige. La frase
aprobada la guarda `humo` (R6).

### Lo que queda anotado, sin arreglar en F2

Son menores que no cambian lo que se promete, o que tocan cosas que otras fases rehacen. Van a la
lista del cierre (F9):

- **m1.** Los agentes de Codex son `.toml`, y no se miran como choque. Va con F5 (E3).
- **m2.** Un arnés en la carpeta personal no se dice como «otro proyecto encima». Y en Windows, la
  comparación con la carpeta personal distingue mayúsculas.
- **m3.** `soloDeRsc` mira el fichero de estado, pero no lo que hay al lado.
- **m4.** Un recibo sin `decisions` se acepta sin preguntar.
- **m5.** Si fallan el segundo plan en seco o el montaje después de renombrar, lo renombrado no se
  deshace. Lo que se puede saber antes ya se mira antes (I4).
- **m6.** El fallo al poner un asistente no se apunta en el informe: la entrevista no lleva el canal.
- **m8.** El aviso de Documentos y el de «dentro de otro proyecto» vuelven en cada montaje que escribe.
- **m9.** «Crear una carpeta» con un nombre que ya existe abre esa carpeta sin decirlo.
- **m11.** Un repositorio de alguien sin commits y sin marca cuenta como de la barra.
- **m13.** `rev-list --max-parents=0` recorre el historial entero en cada repintado de una carpeta
  ajena.
- **m14.** OneDrive de empresa («OneDrive - Empresa») y la raíz de un disco externo en macOS.
- **m15.** Ninguna prueba mira que `git init` ponga la identidad local de la barra.

Y las tres desviaciones que señaló el revisor:

- con un comando o un agente se ofrece «Dejar el mío» en vez de sobrescribir, porque RSC no los
  sobrescribe (decisión apuntada en F2);
- los choques salen en ventanas seguidas y no en una pantalla con una elección por fila (C-3), porque el
  editor no tiene esa ventana;
- `leerElPlanEnSeco` no devuelve `politica`, y la política se compara por «Selected».

La batería, con los arreglos: `humo` 231, `humo+` 236, `contrato` 10, las tres empresas, y el
diccionario y PowerShell limpios.
