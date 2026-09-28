---
type: verification
title: Verificación — todo-cuadra, el cierre
description: La batería entera sobre el estado final de la rama, con el veredicto de cada uno de los 61 criterios de la spec, la prueba que lo sostiene y lo que queda para una máquina Windows.
timestamp: 2026-09-28T10:00:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F9
veredicto: pasa, con C2 a medias hasta medir en Windows
---

# Verificación — el cierre de todo-cuadra

Rama `todo-cuadra`, sobre la revisión de F8 (`939adf2`). Es la verificación de T073: la batería entera sobre el estado final,
y cada criterio de la [spec](../specs/todo-cuadra.md) con la prueba que lo sostiene hoy. Cada fase
tiene su propia verificación, con lo observado y las mutaciones; aquí se enlazan.

## La batería

| Comprobación | Resultado |
|---|---|
| `node extension/prueba/humo.js` | 322 pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 330 pasadas, código 0 |
| `node extension/prueba/contrato.js` | 13 pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras |
| `node docs/comprobar-diccionario.js` | limpio: 27 palabras, 57 ficheros y 712 rótulos |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas |
| `git ls-files -ci --exclude-standard` | vacío |

## Criterio por criterio

Estado: **cumple** (la prueba está en verde en la batería de arriba), **a medias** (cumple donde se
puede medir, y lo que falta se dice).

### A · Las preguntas del arranque — [F1](todo-cuadra-F1-2026-09-25.md), [F2](todo-cuadra-F2-2026-09-25.md), [F8](todo-cuadra-F8-2026-09-26.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| A1 | «Un poco de todo» monta | `contrato`: cada respuesta da un plan de RSC; `humo+`: «con «Un poco de todo» queda montado de verdad, como mixed y con su tamaño» | cumple |
| A2 | «Construir algo» monta con cualquier combinación | `contrato`: los 24 planes, y todo lo que RSC acepta se puede elegir; `humo+`: «irá sumando piezas» montado | cumple |
| A3 | Aplicado con el suelo a medias es un arnés montado | `contrato`: tres montajes con el suelo a medias; `humo`: «aplicado con el suelo a medias pone los raíles y ofrece levantarlo» | cumple |
| A4 | Los cuatro niveles de explicación | `contrato`: cada valor que la barra da por bueno, RSC lo acepta, y al revés | cumple |
| A5 | En una carpeta empezada, seguir con lo que hay | `humo`: «con package.json se sugiere seguir con lo que hay y construir algo» | cumple |
| A6 | El primer mensaje pide el perfil, dice si hay freno y pregunta de una en una | `humo`: «el primer mensaje dice de quién es la carpeta, pide el perfil y dice si hay freno» | cumple |
| A7 | Ningún encargo se queda en el registro | `humo`: «ningún encargo se queda solo en el registro» | cumple |
| A8 | El número de preguntas que se anuncia es el que se hace | `humo`: «el recuento es el de la entrevista de verdad: la más corta y la más larga» (de 8 a 12) y «en Documentos entera o dentro de otro proyecto, la cuenta suma su aviso» | cumple |
| A9 | Sin asistente, se ofrece ponerlo | `humo`: «sin asistente se ofrece ponerlo» | cumple |
| A10 | Un objetivo con cualquier carácter llega entero | `contrato` y `humo`: «un objetivo con & \| ^ % " llega entero» | cumple |
| A11 | Guardar en español con «irá creciendo» no se deniega | `humo+`: el guardián de gitmoji deja pasar «Primera versión»; `humo`: los raíles lo apagan con su porqué | cumple |
| A12 | Un plan distinto no se acepta sin el sí | `humo`: «un plan que enciende SDD no se acepta sin el sí»; `contrato`: lo que cambia se dice en español | cumple |
| A13 | Tres preguntas nuevas | `humo`: «alcance y personas se preguntan a todos», y la de qué construir | cumple |

### B · Las carpetas que no son la de siempre — [F2](todo-cuadra-F2-2026-09-25.md), [F4](todo-cuadra-F4-2026-09-25.md), [F8](todo-cuadra-F8-2026-09-26.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| B1 | La carpeta personal, la raíz y las del sistema no se preparan | `humo`: «la carpeta personal, la raíz del disco y las del sistema no se preparan», y la de con restos del arnés | cumple |
| B2 | Un clon se reconoce y se trae | `humo`: «un clon como lo deja git clone cae en traer»; `humo+`: «un clon de verdad se reconoce y se trae» | cumple |
| B3 | «Seguir sin copias» se respeta | `humo`: «con seguir sin copias, preparar monta sin copias y ofrece ponerlas» | cumple |
| B4 | En una carpeta ajena se enseña lo que se toca y se pregunta por cada choque | `humo`: «una carpeta ajena enseña qué se toca y no monta sin el sí»; `humo+`: «sobre un proyecto de alguien, lo suyo no cambia y su review se queda con otro nombre» | cumple |
| B5 | Una versión más nueva se dice y no se baja sin pulsar | `humo`: «1.4.1 se pone al día, 2.0.13 no se baja sin pulsar» y «añadir en una carpeta más nueva que la clase no le baja la versión»; `humo+`: «una carpeta de una versión más nueva, con lo suyo en el plan, se pone como la de la clase» | cumple |
| B6 | Con identidad global, el historial sigue siendo nuestro | `humo`: «con identidad global, el guardado solo sigue funcionando» | cumple |
| B7 | Toda rama que monta deja historial | `humo`: «toda rama que monta deja historial» | cumple |
| B8 | Un montaje nuestro a medias se termina | `humo`: «estado de RSC sin .rsc.json va a completar» | cumple |
| B9 | Dentro de otro proyecto, se dice | `humo`: «dentro de otro proyecto se dice antes» | cumple |
| B10 | Un punto de partida que falla se dice | `humo`: «un punto de partida que falla se dice» | cumple |
| B11 | Volver a montar conserva el dial, los asistentes y lo apuntado en el perfil | `humo`: «completar conserva el dial cambiado y los asistentes añadidos», «volver a montar no borra lo que el asistente apuntó en el perfil» y «lo devuelto al perfil lleva el dial que se acaba de elegir» | cumple |
| B12 | Lo escrito junto a la sombra de RSC cuenta como suyo | `humo`: «lo escrito debajo de la sombra cuenta como suyo» y «lo que escribe el propio arnés no cuenta como otro asistente» | cumple |

### C · Frenos y enganches — [F3](todo-cuadra-F3-2026-09-25.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| C1 | Freno ante órdenes peligrosas en cualquier clase de proyecto | `humo`: «el freno deniega en operations las seis órdenes de C1», «con el freno de RSC puesto, el nuestro deja pasar», «el freno de RSC cuenta solo si está enganchado antes de cada orden de Bash» y «con codeHooks false y el freno propio, Las reglas lo lista armado y dice su origen»; `contrato`: «un sync de RSC no quita el freno propio» | cumple |
| C2 | Sin Node, los enganches corren | Medido en Mac en F3 (el relevo), y `humo`: la pieza «Lo que el arnés hace solo» y su botón | a medias: falta la prueba en Windows (Git Bash y PowerShell), apuntada en F3 |
| C3 | El fichero de ajustes que viaja en git queda como en el repositorio | `humo`: «los enganches vuelven a llamar a node, y solo los del arnés o con nuestra ruta» | cumple |
| C4 | El asistente no ofrece actualizar el arnés | `humo`: «con una versión más nueva publicada, el arranque no ofrece actualizar» | cumple |
| C5 | «Lo que tiene apagado», en español y sin repetir | `humo`: «lo apagado se nombra sin repetir, y la memoria apagada sale apagada» | cumple |
| C6 | Que haya freno no depende de la última orden | `contrato`: «tras arreglar en una carpeta operations no quedan frenos de RSC»; `humo`: si el `sync` de después falla, se dice | cumple |

### D · Raíles que se leen siempre — [F4](todo-cuadra-F4-2026-09-25.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| D1 | Las reglas en el contexto desde el principio, con Claude | `humo`: «aplicar.js escribe una vez el bloque de CLAUDE.md» y «SKILL.md no copia las innegociables de siempre.md». Que Claude Code importe `@…` al empezar lo dice su documentación | cumple |
| D2 | Las órdenes del arnés, con la versión de la clase | `humo`: «todo npx @ericrisco/rsc de las habilidades core queda cubierto por la regla 7»; `contrato`: instalar desde la barra deja la 2.0.5 | cumple |
| D3 | La habilidad trae la lista entera y no remite a lo que no hay | `humo`: «la lista de la habilidad es la del diccionario» | cumple |
| D4 | Con Codex, habilidad propia y no comando | `humo`: «en Codex la habilidad no manda crear comandos» | cumple |
| D5 | Un solo dial | `humo`: «accompaniment y accompaniment_level dan el mismo dial» | cumple |
| D6 | Raíles viejos, por cualquiera de sus piezas | `humo`: «unos comandos o un bloque viejos cuentan como raíles de antes» | cumple |

### E · Asistentes — [F5](todo-cuadra-F5-2026-09-25.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| E1 | Cambiar de asistente lo deja montado, y la elección sobrevive | `humo`: «cambiar a un asistente sin montar lo prepara para él, con sus raíles», «tras un sync que ordena, la elección sigue»; `humo+`: «de Claude a Codex deja .codex/rsc con las 32 y la nuestra» | cumple |
| E2 | Dos declarados: raíles para los dos y todas las pantallas iguales | `humo`: «con dos declarados y uno instalado, todas las pantallas coinciden», y «Algo va mal» pregunta por el de ahora | cumple |
| E3 | Montada fuera para otro: se lee, o se dice qué no | `humo`: «una carpeta montada fuera se lee en el formato de su asistente»; `humo+`: el arnés de Codex se lee entero | cumple |

### F · Credenciales y copias — [F6](todo-cuadra-F6-2026-09-25.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| F1 | Una credencial suelta no entra en la copia | `humo`: «guardar en git deja fuera .env, credentials.json y x.pem de la raíz, y lo dice» y «una credencial que ya estaba en el índice tampoco entra en la copia» | cumple |
| F2 | Ningún valor entero de una credencial en pantalla ni en informes | `humo`: «una consulta que imprime una clave la enseña tapada», «una consulta que imprime un fichero de acceso lo enseña tapado», «el informe no lleva ningún valor de los .env de la carpeta» y «un push fallido no deja el token en el informe». Y el informe de «Algo va mal», con las rutas de este ordenador, no entra en la copia de git | cumple |
| F3 | Una clave con cualquier carácter llega entera a su prueba | `humo`: «una clave con # $ espacio ' \` ; llega entera a la prueba y no se ejecuta» y «un .env con finales de Windows se guarda y se diagnostica bien» | cumple |
| F4 | Los guiones corren donde está el alumno | `humo`: «sin Python, un .py no se lanza a ciegas y se dice qué falta» | cumple |
| F5 | La primera copia no lleva rutas de este ordenador | `humo`: «tras montar, el ajuste versionado es igual que en HEAD y sin marca», que mira también el punto de partida | cumple |

### G · Mapeos — [F7](todo-cuadra-F7-2026-09-26.md), con su revisión

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| G1 | «Resolver una incidencia» no revienta | `humo`: «todo tipo que manda el panel se despacha sin excepción», con las 83 rutas y cualquier excepción, sea del tipo que sea | cumple |
| G2 | El arnés y los módulos del `.vsix`, primero | `humo`: «con una app antigua con la 1.4.1, gana la del .vsix», que mira también qué dice el informe | cumple |
| G3 | «Algo va mal» dice que está mal cuando el arnés lo dice | `humo`: «con un informe real de doctor, faltan nombres y no rutas», «sin poder leer el diagnóstico, no se dice que está bien» y la del asistente de ahora | cumple |
| G4 | Lo que no está en disco no sale como instalado | `humo`: «declarada y no en disco no sale como instalada», y la del enlace a nada | cumple |
| G5 | Los comandos del arnés, con nombre y entre los suyos | `humo`: los de por lenguaje, los 33 del paquete con su ayudante, y uno del alumno con nombre de la tabla | cumple |
| G6 | Las preguntas sin contestar, y nada del andamio | `humo`: «dos abiertas y una FILLED dan dos», sus variantes, y el andamio con índice | cumple |
| G7 | «Listo» solo cuando el arnés también | `humo`: «falta un fichero de la plantilla y no se dice Listo», y el suelo que sale del recibo | cumple |

### H · Documentación, diccionario y repositorio — [F8](todo-cuadra-F8-2026-09-26.md)

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| H1 | La documentación dice lo que hay | `humo`: «el recuento de preguntas sale de rumbo», que mira también los tres documentos | cumple |
| H2 | Una sola lista, que vigila todo texto de pantalla | `humo`: «el comprobador del diccionario vigila también los nombres, el catálogo y los instaladores», con palabras sueltas, frases sin artículos, las vistas, la confianza y los módulos comunes; `dicc` limpio | cumple |
| H3 | Nada guardado e ignorado a la vez; la confianza, bien descrita | `humo`: «nada de lo que está en git está a la vez ignorado» | cumple |
| H4 | Quien manda a «Algo va mal» dice qué hacer con el código | `humo`: «quien manda a «Algo va mal» dice también qué hacer después» | cumple |
| H5 | Lo de RSC, escrito con fichero y línea | `docs/para-rsc.md`: nueve, con sus líneas comprobadas en el paquete, y un borrador de issue para cada una de las seis nuevas | cumple (se comprueba leyendo) |
| H6 | Las decisiones, desde la 116 | `docs/decisiones.md`: de la 116 a la 124, una vez cada una | cumple |

### I · Las comprobaciones que habrían cazado lo gordo

| # | Lo que pide | Lo sostiene | Estado |
|---|---|---|---|
| I1 | Cada respuesta del arranque, contra el arnés empaquetado | `contrato`: los 24 planes, y los valores en los dos sentidos | cumple |
| I2 | Cada mensaje del panel, despachado | `humo`: las 83 rutas, y todo tipo del panel con la suya | cumple |
| I3 | Montajes de verdad por clase de carpeta | `humo+`: vacía para operaciones, para «un poco de todo» y para software que crece; con historial ajeno y choque de nombres; un clon real | cumple |

## Lo que se añadió en esta verificación

- **El montaje de verdad de «Un poco de todo»** (I3): ninguno pasaba por ahí. La prueba de «irá sumando
  piezas» usa «Construir algo», y el contrato solo pide ese plan en seco.
- **Los plurales con paréntesis**: «3 cosa(s)», «necesita(n)», en diecisiete textos de la barra, de
  antes de este programa. Van con la frase de uno y la de varios, una regla nueva en el diccionario y
  una prueba que los busca.

## La revisión final (T074)

Tres refutadores a la vez, con ojos frescos, sobre una exportación de la rama entera (95 ficheros,
unas 15 800 líneas de diff frente a `2b139bc`): corrección, seguridad y pruebas. Cada uno reprodujo la
batería y atacó con guiones propios. Se comprobó cada hallazgo contra el código, y se aceptaron todos.

| Hallazgo | Qué se hizo |
|---|---|
| **Crítico (seguridad).** El envoltorio del freno, «Las reglas» y la radiografía daban por puesto el freno de RSC con su fichero y su nombre en cualquier sitio de los ajustes. Con su nombre en una nota, o enganchado a otra herramienta que no es Bash, el nuestro se apartaba sin que frenara nadie, y «Las reglas» decía que lo ponía el arnés | Puesto es enganchado de verdad: una entrada de `hooks.PreToolUse` cuyo `matcher` alcanza a Bash, con una orden que lleva el guion. Lo mismo para el nuestro. Una sola regla en la barra (`reglas.enganchadoAntesDeBash`) y su gemela en el envoltorio. Prueba nueva con la nota, con `Read`, con `Bash\|Edit` y con el nuestro solo en una nota |
| **Importante (corrección y pruebas).** El comprobador del diccionario solo miraba cadenas con espacio y alguna palabra funcional: una palabra suelta («Ruta») o una frase sin artículos («devueltos a node») se colaban | Es pantalla lo que no parece código y es una frase, o un rótulo de una palabra con mayúscula. En el código Pascal del instalador de Windows, una palabra suelta es un nombre (`Path`), no pantalla. «devueltos a node» va al canal de salida y se marca como interno. Sembrado en la prueba |
| **Importante (pruebas).** La prueba de despacho solo reconocía unos tipos de error: un `throw new Error(…)` en un manejador pasaba | Mira la señal del propio producto: el «Algo no ha ido bien» que manda la extensión al panel cuando un manejador revienta, y el error que apunta, del tipo que sea |
| Menor (pruebas). La prueba del motor de JavaScript de las copias sale siempre saltada | Es así por lo que dice su motivo, ya corregido: ese motor solo existe con `isomorphic-git`, que nada de este repositorio trae. La cabecera de `historial.js`, que decía otra cosa, está al día. Retirarlo o probarlo queda para Jose |
| Observación (seguridad). El informe de «Algo va mal» se escribe en `02-DOCS/raw/incidencias/`, dentro de la carpeta, y entraba en la copia de git con las rutas de este ordenador | Entra en la lista de lo que no entra en git, y lo demás de `02-DOCS/raw/` sigue entrando. Prueba ampliada |

### Mutación de los arreglos

Trece, y mueren todas: las reglas, el envoltorio y la radiografía por el texto; el `matcher` que no
cuenta; el nuestro por el texto; la regla de antes para la pantalla; la palabra suelta también en
Pascal; sin mirar si parece código; un manejador que lanza un `Error` corriente; los informes dentro de
la copia; y un plural con paréntesis otra vez.

## Lo que no se puede comprobar aquí

- C2 en Windows: el relevo de `node` en Git Bash y en PowerShell, con la prueba que dejó escrita F3.
- La subida de verdad a GitHub con el token en una cabecera (F6).
- Abrir las issues de RSC, que lo hace Jose.
- El motor de JavaScript de las copias, que solo existe con una biblioteca que ya nada trae.
