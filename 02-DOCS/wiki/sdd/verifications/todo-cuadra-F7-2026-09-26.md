---
type: verification
title: Verificación — todo-cuadra, F7 (los mapeos)
description: La batería de F7, criterio por criterio, con lo observado y las veintiuna mutaciones.
timestamp: 2026-09-26T07:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F7
veredicto: pasa
---

# Verificación — F7

Rama `todo-cuadra`, sobre la revisión de F6 (`7248cea`). Tareas T059–T065 del
[plan](../plans/todo-cuadra.md#f7--mapeos). Se empezó sobre F6, se apartó en un `stash` para arreglar
lo que encontró la revisión de F6, y se siguió encima.

## La batería

| Comprobación | Después de la revisión de F6 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 290 | **297** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 297 | **304** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **13** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| G1 | Se despachan los setenta tipos que manda el panel, con lo que tiene efectos de verdad fingido, y ninguno deja un fallo de programa en el registro. Antes de arreglarlo salía uno: `[resolverIncidencia] ReferenceError: encargos is not defined`. Todo tipo del panel tiene su ruta (I2) |
| G2 | Con una app de antes que lleva la 1.4.1 y su propio `historial.js`, corren el arnés y el módulo del `.vsix`. Sin el del `.vsix`, el de la app solo si es de la misma versión. El informe de «Algo va mal» dice qué arnés corre. Con el `enganches.js` de un instalador de antes, se usa el del paquete y la ruta de este ordenador vuelve a `node` |
| G3 | Con las formas que escribe `doctor.js` de la 2.0.5 (habilidades como `id:ruta`, también de Windows, y agentes y comandos como objetos), lo que falta sale como «Tono humano», «Explicación desde cero», «Desarrollador», sin rutas ni `[object Object]`. «Algo va mal» dice que está mal con cosas que faltan o con los enganches sin poder correr, y bien sin ellas |
| G4 | Una habilidad declarada y no en disco no sale en ningún montón, y la cuenta cuadra. Un «Añadir» que la declara sin ponerla no se da por hecho. Con el arnés de verdad, añadir una desde la barra la pone en disco y deja la carpeta en la 2.0.5 |
| G5 | Con los dos sufijos que lee de `targets/commands.js`, `fastapi-review` sale como «Revisar el código de FastAPI» y `go-build` como «Arreglar la compilación de Go», entre los del arnés. Uno del alumno que acaba igual sigue siendo suyo; uno que el arnés apunta y nadie nombra, del arnés |
| G6 | Con dos preguntas abiertas y una `[FILLED]` en bloques de RSC, salen dos. Las carpetas de trabajo de RSC no son temas, y lo que el índice marca `[Archived]` no es un artículo |
| G7 | Con la plantilla de conexiones entera, el suelo está; sin su `test_connection.sh`, no, y la pieza no dice «Listo» |

## Prueba de mutación

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T059 | sin importar `encargos` | la de todos los tipos del panel (es su rojo) |
| T060 | el de la app primero · de cualquier versión · los módulos de la app primero · el informe sin decir cuál | las cuatro |
| T061 | la habilidad con su ruta · el agente como objeto · repetidas · la pieza con los ids · sano por el código de `doctor` · sin mirar los enganches | las seis |
| T062 | añadida si está declarada · instalada si está declarada | las dos |
| T063 | sin la regla de los comandos · la regla para todos · del arnés sin mirar su estado | las tres, la última tras añadir su caso |
| T064 | solo viñetas · las contestadas también · el andamio como conocimiento · lo archivado como conocimiento | las cuatro |
| T065 | el suelo, solo la carpeta | la una |

Veintiuna, y mueren todas.

## Pruebas que cambiaron

- La de «con el módulo de un instalador de antes» contaba con que mandara el módulo de la app: ahora
  mira que se use el del paquete y que la ruta se devuelva.
- La de los cuatro montones de habilidades las daba por instaladas solo declarándolas: ahora las pone
  en disco.
- Los fixtures con la plantilla de conexiones a medias ponen la plantilla entera, y la empresa de
  mentira escribe las preguntas como RSC y lleva el `.env.example` de la plantilla.

## Lo que no se puede comprobar aquí

- Un ordenador con un instalador de los de antes de la decisión 27, como el Windows de prueba de Jose.

## Lo que encontró la revisión con ojos frescos

La hizo un revisor aparte, sobre una exportación de `6eeea1a`, sin tocar el repositorio. Reprodujo la
batería (`humo` 297, `humo+` 304, `contrato` 13, las tres empresas, el diccionario y PowerShell) y
el `doctor --json` de verdad, y probó sus casos con guiones propios. Se cortó tres veces por la red
(el Mac se dormía de madrugada) y se retomó donde estaba. Veredicto: *hay que hacer cambios*, con 0
críticos, 3 importantes y 9 menores. Se comprobaron todos contra el código y el paquete, y se aceptaron.

| Hallazgo | Qué se hizo |
|---|---|
| **Importante 1 (G6).** El andamio de RSC solo se quitaba sin índice. Con índice, que es lo normal porque `specify`, `sdd` y `decision-records` le piden al asistente que indexe lo suyo, salía como tema. Y «sin ordenar» tenía su propia lista, la de antes, y entraba en `_archive/` | Un tema o una fila del andamio no cuentan tampoco con índice, y lo archivado (`<tema>/_archive/`, la convención de RSC) no cuenta en ningún sitio. «Sin ordenar» usa la misma lista. Prueba nueva con índice |
| **Importante 2 (G5).** Delante del sufijo va la habilidad, no el lenguaje: catorce de los 33 comandos por lenguaje salían con el identificador humanizado («Revisar el código de Csharp dotnet»), y la frase nombraba a un ayudante que no existe (`nextjs-review` lo hace `react-reviewer`) | La tabla nombra también esas nueve habilidades (Next.js, Spring Boot, Kotlin para Android, Swift para iOS, Vue y Nuxt, C# y .NET, Laravel, PostgreSQL, aprendizaje automático). La frase nombra al ayudante que RSC escribe en la descripción del comando. Prueba nueva que recorre los 33 del paquete |
| **Importante 3 (G3).** `doctor` iba sin `--target`: con dos asistentes, RSC contesta por el primero de su lista, y con Codex roto y Claude entero «Algo va mal» decía que todo estaba bien | `doctor` pregunta por el asistente de `donde.paraQuien()`, el mismo que usa la pieza «Lo que debería estar puesto». Prueba nueva |
| Menor 1 (G4). Un enlace que apunta a nada contaba como habilidad en disco | Un enlace cuenta si lleva a algo. Prueba nueva, con uno bueno y uno roto |
| Menor 2 (G6). Variantes de las preguntas: el estado en negrita o en viñeta, un «open» con una nota detrás, viñetas dentro de un bloque, y preguntas con «<» | Se leen todas. Las marcas de plantilla de RSC son solo `{…}`, y las viñetas se leen fuera de los bloques. Prueba nueva |
| Menor 3 (I2). La prueba de despacho no mandaba 7 de los tipos que envía el panel y fingía 24 manejadores | Despacha las 83 rutas de la tabla de `manejar`, mira que todo tipo del panel tenga la suya y trabaja en una copia de la empresa de mentira. Solo finge lo que sale fuera: la red, instalar, montar con RSC o escribir fuera de la carpeta (11). No revienta ninguno |
| Menor 4 (G3). Sin poder leer el diagnóstico, dos mutaciones volvían «sano»; y la pantalla decía «He encontrado algo» sin haber encontrado nada | «Algo va mal» distingue el «no se sabe»: dice «No he podido revisarlo entero.» y no ofrece arreglar lo que no ha visto. De paso, «He mirado y tu empresa está bien» pasa a «He mirado y está todo bien»: el diccionario no deja llamarlo «empresa». Prueba nueva |
| Menor 5 (G7). Sin poder leer la plantilla del paquete, el suelo se conformaba con la carpeta | Se exige la de la 2.0.5, fijada en el código y comparada con la del paquete en una prueba |
| Menor 6 (G7). La barra era más estricta que RSC con los recibos sin `floorPaths` | Como RSC: la plantilla entera solo si el recibo la declara. El fixture de la prueba de T065 lleva ahora el suelo en el recibo, como uno real de la 2.0.5 |
| Menor 7 (G2). El informe podía decir «Módulos comunes: .», y solo nombraba `historial` | Nombra los tres, `historial`, `enganches` y `git`, cada uno con su carpeta o con «(ninguno)» |
| Menor 8 (G5, de antes). Un comando de la tabla salía siempre como del arnés: un `review.md` del alumno, con el nombre de la tabla | Con el estado del arnés a mano, manda él. Sin estado, o con uno de antes, la tabla, como antes |
| Menor 9. La batería reventaba sin el paquete, y una comprobación del informe fallaría en Windows | Sin el paquete se usa la plantilla fijada, y las pruebas que lo necesitan lo dicen ellas. La del informe acepta los dos separadores |
| Observación. `entorno.node()` prefiere el Node de un instalador de antes | Sin cambios: todos los instaladores han llevado Node v24.21.0 (visto en su historia en git), y RSC 2.0.5 pide ≥18 |

### Mutación de los arreglos

Treinta, una o más por arreglo. Mueren veintisiete a la primera. De las otras tres:
- **El andamio, quitado por encabezado**, era equivalente: el filtro de cada fila ya deja vacíos esos
  temas, y un tema vacío no sale. Se quitó el de encabezado, que sobraba.
- **«Del arnés, por la tabla»** es equivalente: con la tabla apagada para lo que el estado no apunta,
  las dos formas dan lo mismo. Se deja dicho, sin fingir que una prueba la cubre.
- **Que la extensión no le mande al panel el «no se sabe»** sobrevivía de verdad. Se añadió la prueba
  (««Algo va mal» le dice al panel que no se ha podido saber»), y muere.

La batería, con los arreglos y sobre F7: `humo` 308, `humo+` 315, `contrato` 13, las tres
empresas, y el diccionario y PowerShell limpios.
