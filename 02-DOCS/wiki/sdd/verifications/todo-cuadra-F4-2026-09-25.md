---
type: verification
title: Verificación — todo-cuadra, F4 (los raíles)
description: La batería de F4, criterio por criterio, con lo observado y las veintidós mutaciones.
timestamp: 2026-09-25T23:30:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F4
veredicto: pasa
---

# Verificación — F4

Rama `todo-cuadra`, sobre F3 (`288ffe9`). Tareas T040–T045, T077 y T019 del
[plan](../plans/todo-cuadra.md#f4--los-raíles). T019, la versión más nueva que la de la clase, va
aquí detrás de la regla 7, como decía el plan. Lleva además una corrección a T036 que salió al pintar
las pantallas de F3.

## La batería

| Comprobación | Después de F3 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 242 | **253** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 247 | **258** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **12** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio, y además exporta su lista |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

## Criterio por criterio

| # | Observado |
|---|---|
| D1 | Con Claude, los raíles dejan en el `CLAUDE.md` de la raíz un bloque entre marcas con `@.claude/skills/executive-lab/siempre.md`, que Claude Code importa al empezar cada conversación. Una sola vez, y en un `CLAUDE.md` de alguien, al final y sin tocar lo demás. `siempre.md` trae las siete innegociables, movidas tal cual; `SKILL.md` dice dónde están sin copiarlas. Si no había ningún `CLAUDE.md` y el `AGENTS.md` es de alguien, el bloque lo importa también, porque crearle un `CLAUDE.md` haría que Claude dejara de leerlo. Con Codex, el bloque de `AGENTS.md` nombra `siempre.md` y `SKILL.md`. `terreno` descuenta el bloque en los dos ficheros. En una carpeta de alguien (C-4): al montar, el resumen dice «Cómo se trabaja aquí»; al reponer solo, espera, y «Lo que pone la barra» lo ofrece con un botón que pregunta antes |
| D2 | La regla 7 nombra los catorce verbos con que las habilidades `core` y los comandos del paquete mandan correr `npx @ericrisco/rsc` sin versión: `add`, `audit`, `capabilities`, `catalog`, `consult`, `doctor`, `list`, `memory`, `reassess`, `registry`, `repair`, `sello`, `sync` y `worktrees`. Dice que nunca `@latest`, y ordena: lo instalado, el botón de la barra para añadir una habilidad (que usa el arnés de la clase y no cambia la versión de la carpeta) y, solo si hace falta, el paquete con `catalogVersion`. La prueba barre el paquete |
| D3 | La regla 3 trae las veintisiete palabras prohibidas y no remite a `docs/diccionario.md`, que en la carpeta del alumno no está. La prueba las compara con la lista del comprobador, que la lee del diccionario (T077) |
| D4 | La sección de lo que se repite distingue: con Claude, un comando; con Codex, que no tiene comandos, una habilidad propia en `.codex/rsc/<verbo-objeto>/SKILL.md`, apuntada en `ownSkills` |
| D5 | Las dos formas del dial (`accompaniment` en la cabecera, `accompaniment_level` en el cuerpo) se leen igual, y al cambiarlo quedan las dos con el mismo valor. La prueba encontró que la barra se comía los espacios de delante del comentario de la plantilla (`L0<!-- …`); arreglado |
| D6 | Unos raíles se dan por de antes también con un comando de otro día, con uno que falta, y con un bloque de `CLAUDE.md` o de `AGENTS.md` que no nombra `siempre.md` |
| B5 | Las versiones se comparan por sus números. La 1.4.1 se pone al día; la 2.0.13 no se baja al preparar: «La versión del arnés» dice «Esta carpeta se montó con una versión del arnés más nueva que la de tu clase.», y «Ponerla como la de la clase» nombra antes las habilidades que la de la clase no trae y solo con el sí las quita y sincroniza |
| C-11 | Las reglas de español, del vocabulario y de la terminal están cargadas desde el primer mensaje con Claude (D1), y el mensaje del freno ya pide explicar el riesgo en palabras llanas |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` y se restaura. El guion restaura el fichero pase lo
que pase; `git status` y `git diff` quedaron igual.

| Mutación | Se pone roja |
|---|---|
| M1 · los raíles no escriben el bloque | el bloque de CLAUDE.md · reponer en una carpeta de alguien |
| M2 · el bloque se añade cada vez | el bloque de CLAUDE.md · los raíles donde mira el asistente |
| M3 · sin su `AGENTS.md` | el bloque de CLAUDE.md |
| M4 · el bloque cuenta como de alguien | otroMontaje no lo cuenta |
| M5 · con `--ajena` se pone igual | reponer en una carpeta de alguien |
| M6 · el botón no pregunta | reponer en una carpeta de alguien |
| M7 · el resumen no dice que toca su `CLAUDE.md` | el resumen al montar sobre lo de alguien |
| M8 · `SKILL.md` copia una innegociable | SKILL.md no copia las de siempre.md |
| M9 · la pieza no ve que falta el bloque | reponer en una carpeta de alguien |
| M10 · la regla 7 sin `registry` | todo npx de las core, cubierto |
| M11 · la regla 7 sin `sync` | todo npx de las core, cubierto |
| M12 · la regla 3 sin «symlink» | la lista de la habilidad es la del diccionario |
| M13 · sin el párrafo de Codex | en Codex, no manda crear comandos |
| M14 · el dial, solo por la cabecera | los dos nombres dan el mismo dial |
| M15 · el dial, solo por el cuerpo | los dos nombres · y dos pruebas del dial de antes |
| M16 · el dial, sin los espacios | los dos nombres dan el mismo dial |
| M17 · «al día» sin los comandos | unos comandos o un bloque viejos |
| M18 · «al día» sin los bloques | unos comandos o un bloque viejos |
| M19 · la versión, como texto | 1.4.1 al día, 2.0.13 no se baja |
| M20 · la más nueva, con «Ponerlo al día» | 1.4.1 al día, 2.0.13 no se baja |
| M21 · el botón no nombra lo que se quita | 1.4.1 al día, 2.0.13 no se baja |
| M22 · lo que sobra no se quita | 1.4.1 al día, 2.0.13 no se baja |

Y T077 no es un arreglo que se pueda quitar: se comprobó que el comprobador, como guion, dice lo mismo
que antes, byte a byte, sale con 0 limpio y con 1 con una palabra prohibida sembrada y quitada.

## Pruebas que cambiaron

- La de la regla 7 lee `siempre.md`, donde está ahora la regla.
- La de raíles viejos pone «la de hoy» entera: la habilidad, el bloque de `CLAUDE.md` y los cuatro
  comandos.
- La de siempre que barre los raíles línea a línea tomaba por orden la regla que prohíbe `@latest`,
  porque nombraba `npx` y `@latest` en la misma línea: se repartieron las frases de la regla, no se
  tocó la prueba.

## Lo que no se puede comprobar aquí

- Que Claude Code importe `siempre.md` al empezar la conversación se sabe por su documentación
  (`@ruta` en `CLAUDE.md`); verlo en una conversación de verdad va con las medidas de T032 (3), con
  Jose.
- Que Codex lea `siempre.md` porque su `AGENTS.md` se lo pide, con la prueba de Codex de verdad que ya
  estaba pendiente.

## Lo que encontró la revisión con ojos frescos

Corrió sobre una exportación de `befb045`, sin tocar el repositorio: `humo` 253, `humo+` 258,
`contrato` 12, las tres empresas, el diccionario (su salida, igual byte a byte que en `288ffe9`) y
PowerShell, igual que lo dicho. Montó carpetas con el RSC de dentro, hizo cuatro experimentos con él y
probó tres mutantes suyos, que sobrevivieron los tres. Veredicto: *changes-needed*, con 0 críticos,
4 importantes y 12 menores.

Cada hallazgo se comprobó antes de aceptarlo, leyendo el código de RSC o repitiendo su experimento, y
se aceptaron todos. Van en un commit propio, detrás del de F5.

| Hallazgo | Qué se hizo |
|---|---|
| **Importante, I1.** «Ponerla como la de la clase» fallaba en el caso principal: con lo que la clase no trae en el plan aceptado, el `sync` de la clase lo vuelve a pedir a su catálogo, sale con 1 y deja la versión nueva, después de borrar la base de esa habilidad. La declaración, cambiada, no volvía atrás | Lo que sobra se busca en lo declarado y en el plan aceptado. Si está en el plan, se vuelve a montar con la de la clase por el mismo camino que el arranque (`rumbo.comoLaDeLaClase`), y lo que cambia en el plan se enseña antes de firmarlo. Medido con el paquete: queda la 2.0.5, se va lo que solo trae la nueva y lo añadido después se conserva. Si está solo en lo declarado, `sync`, y si falla, la declaración vuelve a como estaba. Los agentes no cuentan: uno que la clase no conoce no rompe su `sync` (medido, sale con 0). Pruebas nuevas: «ponerla como la de la clase no se queda a medias» y, con el arnés de verdad, «una carpeta de una versión más nueva, con lo suyo en el plan, se pone como la de la clase» |
| **Importante, I2.** «Añadir» bajaba sin decirlo la versión de una carpeta más nueva: el `add` de la clase deja su versión, y con una habilidad que solo trae la nueva, fallaba y borraba su base. La decisión 120 decía lo contrario | En esa carpeta no se añade: se dice que se montó con una versión más nueva y que antes se pulse «Ponerla como la de la clase». Prueba nueva |
| **Importante, I3.** Con Claude, un bloque de Codex de antes en `AGENTS.md` dejaba los raíles «de una versión anterior» para siempre: se miraban `CLAUDE.md` y `AGENTS.md` fuera quien fuera el asistente, y con Claude los raíles no reescriben `AGENTS.md` | Se mira lo de cada asistente declarado y en ningún otro sitio, con una sola función de la tabla (`dondeVaLoDeSiempre`) que usan los raíles y la barra. Prueba nueva |
| **Importante, I4.** Lo de importar `@AGENTS.md` no tenía pruebas: tres mutantes pasaban la batería entera | Una prueba con cuatro casos: dos pasadas, un `AGENTS.md` con solo lo de RSC, un `CLAUDE.md` suyo (en la raíz, en `.claude/` y vacío) y Codex enganchado después (m7). Al mutar, un `CLAUDE.md` suyo vacío también tiene que contar, porque Claude Code no lee `AGENTS.md` si hay uno: la primera vez se decide por si existe |
| Menor, m1. Con la marca de inicio y sin la de final, el bloque no se ponía y se decía que sí | Lo nuestro llega hasta el final de ese párrafo, y lo de detrás no se toca. Prueba nueva |
| Menor, m2. `comoEsLaVersion` no era de verdad por números: «2.0» salía más nueva y «latest», más vieja | Tres números o «rara», que se pone como la de la clase igual que una vieja |
| Menor, m3. El diccionario no tenía los mensajes del final del botón de la versión | Apuntados, con los de I1 e I2 |
| Menor, m4. La regla 7.2 mandaba pulsar *Añadir*, y en *Habilidades* no hay ningún botón así | Dice *Sugerencias del catálogo* o *Resto del catálogo*, que se pulsan. En la prueba de la regla 7 |
| Menor, m5. El botón del bloque se pasaba siempre como carpeta de alguien, y preguntaba con la frase de montar el arnés | Como de alguien solo si lo es, y con «Aquí ya hay cosas tuyas. Voy a tocar esto: Cómo se trabaja aquí. No borro nada tuyo.» y el botón «Ajustarlo ahora». Con otro asistente que no es Claude, «Ya está.». Prueba nueva, y la de C-4 con las palabras nuevas |
| Menor, m6. Con Codex, C-4 no se aplicaba: su `AGENTS.md` se tocaba sin su sí, y sin el trozo, «Lo que pone la barra» decía «Puesto» | Su fichero de siempre espera a su sí como el `CLAUDE.md`, y la pieza lo ofrece para cualquier asistente. Uno que solo lleva lo de RSC no es suyo. Prueba nueva |
| Menor, m7. El import de `@AGENTS.md` se quedaba para siempre, y con Codex enganchado después, RSC mete su trozo ahí y llegaría dos veces | Se quita si ese `AGENTS.md` lleva lo de RSC, como pide `agents-md-shadow.js` |
| Menor, m8. Un `guardar.md` suyo se pisaba en cada pasada y dejaba los raíles viejos para siempre | Un comando es nuestro si su `description` es la nuestra; el suyo no se pisa ni cuenta como viejo, y se dice. Prueba nueva |
| Menor, m9. Sin poder leer el catálogo de la clase, el botón sincronizaba sin nombrar nada | No se toca nada, y se dice que no se ha podido |
| Menor, m10. El error de RSC no llegaba al informe de «Algo va mal» | Va al registro |
| Menor, m11. D2 dice «la versión de la clase», y la regla 7.3 usa `catalogVersion` | Aclarado en la spec (C-23): son la misma mientras la carpeta está en la de la clase, y en una más nueva ninguna vía la cambia sin que alguien lo decida |
| Menor, m12. RSC manda en sus propios mensajes correr `onboard` con `@latest`, y la regla no lo nombraba | La prueba barre también sus `scripts/` y `targets/`, y la regla nombra `onboard` y `uninstall`: dieciséis verbos |

### Mutación de los arreglos

| Mutación | Se pone roja |
|---|---|
| siempre por el `sync` · sin volver a como estaba · sin mirar el plan aceptado · sin catálogo, nada que quitar · sin lo que dijo RSC | ponerla como la de la clase no se queda a medias |
| se añade igual | añadir en una carpeta más nueva |
| los bloques de todos | el bloque de Codex de antes, con Claude · y dos más |
| con lo de RSC dentro, se importa · sin mantener lo decidido · su `CLAUDE.md` no cuenta · uno suyo vacío no cuenta | el AGENTS.md de alguien se importa mientras… |
| lo de RSC cuenta como suyo | con Codex, su AGENTS.md espera a su sí |
| sin final, como antes | un bloque sin su final |
| sin «rara» | 1.4.1 al día, 2.0.13 no se baja |
| la regla con *Añadir* · sin `onboard` | todo npx de las core, cubierto |
| siempre como de alguien | el botón del bloque, en una carpeta nuestra |
| con la frase de montar | reponer en una carpeta de alguien |
| su AGENTS.md, sin esperar · el bloque, solo con Claude | con Codex, su AGENTS.md espera a su sí |
| se pisa el suyo · el suyo cuenta como viejo | un comando suyo no se pisa |

Veintidós. Mueren todas. Dos sobrevivían a la primera versión de las pruebas: un `CLAUDE.md` suyo
vacío y un `AGENTS.md` con solo lo de RSC en una carpeta de alguien. Tenían su caso por escribir.

La batería, con los arreglos y sobre F5: `humo` 275, `humo+` 282, `contrato` 12, las tres empresas,
y el diccionario y PowerShell limpios.
