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

Corre sobre el commit de F4, cuando termine la de F3.
