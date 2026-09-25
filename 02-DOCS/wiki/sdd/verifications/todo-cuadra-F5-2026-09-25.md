---
type: verification
title: Verificación — todo-cuadra, F5 (los asistentes)
description: La batería de F5, criterio por criterio, con lo observado y las veintiséis mutaciones.
timestamp: 2026-09-26T01:30:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F5
veredicto: pasa
---

# Verificación — F5

Rama `todo-cuadra`, sobre la revisión de F3 (`9919af6`). Tareas T047–T051 del
[plan](../plans/todo-cuadra.md#f5--asistentes). Lleva también una corrección a T047 que salió en T051.
Lo que encontró la revisión de F4 va en un commit aparte, detrás de este.

## La batería

| Comprobación | Después de F4 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 253 | **267** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 258 | **273** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 12 | **12** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

La cuenta de F4 sube también por los once arreglos de la revisión de F3 (`9919af6`).

## Criterio por criterio

| # | Observado |
|---|---|
| E1 | Cambiar de asistente **sustituye** con quién se habla y **suma** lo montado. La elección va en el estado del espacio de trabajo, y un `sync` que reordena `targets` no la deshace. Con uno ya montado, solo se apunta. Con uno sin montar, se prepara con el `sync --target` del arnés de dentro y sus raíles; con el paquete de verdad, de Claude a Codex, la declaración queda `claude, codex`, `catalogVersion` sigue en la 2.0.5, `.codex/rsc/` tiene las mismas 32 que Claude y la nuestra con `siempre.md`, `AGENTS.md` la nombra, y lo de Claude y su `CLAUDE.md` siguen igual. Si el arnés falla, o termina sin declararlo, no se cambia nada y se dice. El aviso de que Codex no trae frenos sigue |
| E2 | Con dos declarados y uno instalado, todo coincide: con quién se habla, dónde se mira, cómo se pide una habilidad y a quién se añade. Los raíles se ponen para cada declarado; lo de la carpeta, una vez |
| E3 | `compartido` y los formatos salen del paquete y se comparan por prueba. Una carpeta montada fuera para Cursor ve sus habilidades `.mdc` y no parece un clon; con Copilot, un comando `informe.prompt.md` se pide como `/informe`; con Cline, como `/informe.md`. El buscador y la cabecera de una habilidad leen en el mismo formato. Los raíles ponen los comandos de Copilot como `.prompt.md` y se dan por al día; con Cursor dejan `.cursor/rules/executive-lab.mdc`, que se aplica siempre; con Windsurf, el trozo que nombra la habilidad va en su fichero de siempre |

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa `humo` y se restaura. El guion restaura el fichero pase lo
que pase; las copias de los raíles se mutan a la vez que su fuente, y siguieron iguales al terminar.

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T047 | dónde, por el primero declarado · con quién, por cualquiera instalado | las dos (la segunda, tras añadir el caso de solo Codex declarado y solo Claude instalado) |
| T048 | la elección no se lee · elegir reescribe `targets` | las dos |
| T050 | raíles solo para el primero | la una |
| T049 | sin preparar se cambia igual · sin mirar lo declarado · sin el `sync` · sin los raíles · un `sync` que falla se da por bueno · sin el aviso de los frenos · con uno ya montado se vuelve a montar | las siete; dos sobrevivían a la primera versión de la prueba, y se añadieron sus casos |
| T051 | `compartido` de Windsurf · y de Kiro · Cursor sin `.mdc` · Copilot sin `.prompt.md` · Cline sin su `.md` · mirar en lo de Claude · el fichero de siempre de RSC como habilidad · el sufijo al pedir · la cabecera · el buscador · el «al día» · el nombre de los comandos · el `.mdc` de Cursor · su `alwaysApply` | las catorce |

## Pruebas que cambiaron

- «cambiar de asistente dice qué deja de verse» consagraba el fallo: pasa a ser «cambiar a un
  asistente sin montar lo prepara para él, con sus raíles».
- La de «cambiar de asistente» espera a `elegir`, que ahora es asíncrona.

## Lo que no se puede comprobar aquí

- Que Codex lea de verdad `siempre.md` porque su `AGENTS.md` se lo pide, con la prueba de Codex que
  ya estaba pendiente.
- Que Cursor, Copilot o Cline carguen los raíles: la barra no los ofrece, y aquí no hay ninguno.

## Lo que encontró la revisión con ojos frescos

Corrió sobre una exportación de `6df50f3`, sin tocar el repositorio: la batería entera, igual que lo
dicho (`humo` 267, `humo+` 273, `contrato` 12), el paso de Claude a Codex con el RSC de dentro, y
sondas y mutantes suyos. Veredicto: *changes-needed*, con 0 críticos, 8 importantes y 10 menores.

Cada hallazgo se comprobó antes de aceptarlo, y se aceptaron todos. I7 ya estaba arreglado en
`62d6419` (era el m6 de la revisión de F4). Los demás van en un commit propio, detrás de ese.

| Hallazgo | Qué se hizo |
|---|---|
| **Importante, I1 (P4).** Cambiar a uno sin montar corría su `sync` sin mirar: en una carpeta de Codex, una habilidad `debug` suya en `.claude/` se cambiaba por la de RSC | Antes, en seco (`sync --target X --dry-run`, que lista lo que tocaría: medido con el paquete). Lo que choca se pregunta como al montar, con cambiarle el nombre o dejar que ocupe su sitio, y en una carpeta de alguien se enseña además lo suyo que se toca. Sin el sí, nada |
| **Importante, I2.** En una carpeta montada con una versión más nueva que la de la clase, cambiar le bajaba la versión | No se prepara nada, y se dice que antes se pulse «Ponerla como la de la clase» |
| **Importante, I3.** Un cambio que fallaba no dejaba nada para el tutor | Lo que dijo el arnés va al registro, con `[asistente]` |
| **Importante, I4.** Tras cambiar, se seguían vigilando las carpetas del de antes | El vigía se vuelve a armar al cambiar |
| **Importante, I5.** El aviso de que Codex no trae frenos se borraba al repintar | Primero el repintado y después lo dicho |
| **Importante, I6.** De Codex a Claude, las normas del equipo en `AGENTS.md` dejaban de llegarle a Claude: la sombra de `CLAUDE.md` que deja RSC se tomaba por un `CLAUDE.md` suyo | La sombra no cuenta. Y con lo de RSC dentro de ese `AGENTS.md`, en vez de importarlo, que duplicaría lo de RSC, se le pide a Claude que lo lea |
| **Importante, I7.** En una carpeta de alguien, los raíles escribían en sus ficheros de instrucciones sin su sí | Ya arreglado en `62d6419` (m6 de la revisión de F4), para todo fichero de siempre compartido |
| **Importante, I8.** Cinco mutantes pasaban la batería | Cada uno con su prueba: al abrirse, la elección se guarda en el estado de la carpeta (M2); «Añadir» va para todos los declarados (M3, con m5); el cambio se prueba por el botón de la barra, con su contexto (M4, M5); y la elección cuenta mientras esté declarado (M1) |
| Menor, m1. Una elección valía aunque ese asistente ya no estuviera en el ordenador | Vale mientras esté declarado e instalado |
| Menor, m2. Un cambio a medias decía «Hecho» sin raíles en el segundo intento | Declarado sin sus raíles se termina de preparar |
| Menor, m3. En una carpeta de Cursor montada de verdad, `rsc-memory.mdc` salía como una habilidad | Lo de RSC (`rsc-*.mdc`) no cuenta |
| Menor, m4. En una carpeta montada solo para Cursor o Copilot, «Tu asistente» no decía nada | Dice «Esta carpeta no se montó para él.» y ofrece «Prepararla también para Claude» |
| Menor, m5. Con dos declarados, una habilidad nueva iba a uno solo | `add` con `--target claude,codex` (medido: instala para los dos; sin `--target`, RSC no adivina) |
| Menor, m6. Con dos que leen el mismo `AGENTS.md`, el trozo nombraba al último | Nombra al primero declarado, y cada uno tiene su copia |
| Menor, m7. Uno conocido y otro desconocido a la vez, sin prueba | Con prueba |
| Menor, m8. La verificación decía treinta mutaciones, y fueron veintiséis; la decisión 121 decía más de lo que había | Corregido, y la 121 lleva una nota |
| Menor, m9. Restos: dos comentarios viejos, una fila del diccionario, una función duplicada y el `.mdc` de Cursor sin comprobar entero | Arreglados; el `.mdc` que no se aplica siempre es de antes |
| Menor, m10. Sin pantallas pintadas para Jose | Van en la página de pantallas, con las de F4 |

### Mutación de los arreglos

Diecinueve, una por arreglo:
- sin preguntar nunca, o lo que choca solo en la de alguien;
- se prepara aunque sea más nueva;
- sin apuntar lo que pasó;
- sin rearmar el vigía;
- lo dicho antes del repintado;
- con lo de RSC se importa, o la sombra de RSC como suya;
- la elección aunque no esté declarado o instalado;
- sin dónde guardarla, al abrirse o al elegir;
- declarado sin raíles;
- `rsc-memory` como habilidad;
- sin decir que no se montó para él, o sin saber que está montada;
- se añade para uno;
- el último que pase;
- el `.mdc` aunque no se aplique siempre.

Mueren todas.

La batería, con los arreglos y sobre la revisión de F4: `humo` 280, `humo+` 287, `contrato` 12, las
tres empresas, y el diccionario y PowerShell limpios.
