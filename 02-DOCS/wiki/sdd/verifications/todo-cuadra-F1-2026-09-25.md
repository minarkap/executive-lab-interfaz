---
type: verification
title: Verificación — todo-cuadra, F1 (el arranque monta con cualquier respuesta)
description: La batería de F1, criterio por criterio, con lo observado, las dieciocho mutaciones, lo que salió al pintar las pantallas y lo que encontró la revisión.
timestamp: 2026-09-25T13:30:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F1
veredicto: pasa
---

# Verificación — F1

Rama `todo-cuadra`, sobre b49735c. Tareas T007–T013 del
[plan](../plans/todo-cuadra.md#f1--el-arranque-monta-con-cualquier-respuesta).

## La batería

| Comprobación | Antes (T002) | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 196 | **205** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 198 | **208** pasadas, código 0, en 8 s |
| `node extension/prueba/contrato.js` | — (nuevo) | **9** pasadas, código 0, en 5 s; con dos controles para que no pasen en vacío |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio: 27 palabras prohibidas, 47 ficheros, 45 rótulos |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |

`contrato.js` entra en `config.yaml` (`verificar` y `rapida`), en `npm run probar`, en
`publicar.sh` y en `/revisar-la-barra`.

## Criterio por criterio

| # | Observado |
|---|---|
| A1 | «Un poco de todo» pregunta qué se va a construir y manda `--software-scope`. `contrato`: con cada una de sus cinco respuestas, RSC da `Plan id:`. Antes: `RSC_ONBOARDING_REQUIRED`, `missing: ["software-scope"]`. |
| A2 | «Construir algo», con cada combinación que sale, da plan: 24 jugadas en total, con todas sus respuestas. `rumbo.VALORES.tamano` es `small | growing | complex`, igual que el paquete, y `grep large` en `arrancar.js` y `rumbo.js` no encuentra nada. |
| A13 | Alcance y personas se preguntan con los cinco tipos, y van al perfil (`alcance: departamento`, `personas: 11-50`) y al primer mensaje («En esta carpeta llevo un departamento o un área, y somos de 11 a 50 personas.»). «¿Qué vas a construir?» sale con `software` y `mixed` y con ningún otro; «Nada, o casi nada», solo con `mixed`. Cada respuesta manda el tamaño de C-21. |
| A3 | Con `software/growing`, `software/complex` y `small` con «pagos», RSC aplica de verdad y contesta `RSC_ONBOARDING_INCOMPLETE <huella>` con código 0: la barra lo lee como `SueloAMedias`, con `02-DOCS/wiki/sdd/constitution.md` en lo que falta. Pone raíles y nombres, deja el encargo `levantarElSuelo` y la pieza «Innegociables», con su botón, en «Qué falta por montar». Escritos, la pieza se va. Con un fichero `.claude` donde van las habilidades, RSC falla a mitad y contesta con código 4: `Deshecho`, y el parte dice «el arnés terminó con el código 4». |
| A4 | Las cuatro opciones del arranque son los escalones de `trato.js`, con sus nombres y frases: *Al grano · Corto · Te explica por qué · De la mano*. «Al grano» manda `L0`. La habilidad dice `L0 | L1 | L2 | L3`. |
| A10 | El objetivo va con `--goal-base64`, en base64url. Ningún flag lleva espacios, comillas ni `& | ^ % < > ( ) !`. `contrato`: RSC devuelve en su línea de aceptación el mismo objetivo, con comillas, `&`, `%`, `|`, `^`, raya y signos de interrogación. |
| A11 | Los raíles dejan `.rsc/.no-gitmoji` con su motivo. En `humo+`, con «Algo que irá sumando piezas» RSC monta el guardián de verdad (`.rsc/gitmoji-guard.mjs`, enganchado en `.claude/settings.json`), y `git commit -m "Primera versión"` no se deniega. Sin el interruptor, el mismo commit se deniega. |
| I1 | `contrato.js` existe y es rojo con el código de antes (ver *Rojo antes del arreglo*). |

### Rojo antes del arreglo

Visto al escribir cada prueba (`progress/todo-cuadra.md`, T008–T013):
- `contrato`: «large no es un tamaño de RSC», «mixed sin tamaño», «7 de 24 jugadas no dan plan» y
  los tres montajes con SDD «RSC lo ha aplicado y la barra lo da por fallo».
- `humo`: «el objetivo viaja en claro», «no ofrece «Al grano»» y «los raíles no lo apagan».

## Prueba de mutación

Cada arreglo se quita, uno a uno, se pasa su prueba y se restaura. El guion restaura el fichero
pase lo que pase; `git status` quedó igual.

| Mutación | Se pone roja |
|---|---|
| M1 · A1: `CON_TAMANO` solo con `software` | `contrato` (2): el tipo que pide tamaño, las jugadas · `humo` (2): qué va a construir, el tamaño que le toca |
| M2 · A2: vuelve el cuarto tamaño a `VALORES` | `contrato`: cada valor que la barra da por bueno |
| M3 · A2: «sumando piezas» manda un tamaño que RSC no acepta | `contrato` (2): lo que RSC acepta se puede elegir, las jugadas · `humo`: el tamaño que le toca |
| M4 · A3: el «a medias» no se reconoce | `contrato`: el plan con SDD queda montado · `humo` (2): las seis formas, el suelo a medias |
| M5 · A3: el «a medias» no mira el recibo | `humo`: las seis formas |
| M6 · A3: el «deshecho» no se reconoce | `contrato`: si RSC deshace · `humo`: las seis formas |
| M7 · A3: sin la pieza de los innegociables | `humo`: el suelo a medias |
| M8 · A3: los pasos no recogen lo que dijo RSC | `humo`: el suelo a medias |
| M9 · A13: sin alcance ni personas | `humo` (2): lo que ya está en el recibo, alcance y personas |
| M10 · A13: el primer mensaje sin lo que lleva la carpeta | `humo`: alcance y personas |
| M11 · A13: «Nada, o casi nada» también con «Construir algo» | `humo`: qué va a construir |
| M12 · A10: el objetivo en claro | `humo`: el objetivo llega entero |
| M13 · A4: sin «Al grano» | `contrato`: lo que RSC acepta se puede elegir · `humo`: los cuatro escalones |
| M14 · A11: los raíles no apagan gitmoji | `humo` (2): los raíles del paquete son los del repositorio, gitmoji con su porqué |
| M15 · A13: el primer mensaje pega el objetivo con lo que sigue | `humo`: alcance y personas («el objetivo y lo que sigue salen pegados») |
| M16 · revisión: volver a montar no lee alcance y personas | `humo`: volver a montar conserva lo que lleva la carpeta |
| M17 · revisión: la primera fila dice «Listo» siempre | `humo`: el suelo a medias |
| M18 · revisión: el perfil se escribe con texto de reemplazo | `humo`: alcance y personas (un nombre con `$&`) |

Las dieciocho matan al menos una prueba.

## Lo que no se puede comprobar aquí

- **A10 en Windows.** Lo que se prueba es que de la barra no sale nada que cmd.exe interprete. El
  camino de reserva por cmd.exe (`procesos.delPath`) solo existe en Windows: va a las pruebas
  pendientes de una máquina Windows, con esta misma orden.

## Desviaciones del plan, con su porqué

Están en `sdd/decisions.md` (25-09, F1):
- el `rsc.aplicarPlan` de §3 queda en un lector puro, `rsc.comoAcaboElMontaje()`;
- la pieza «Innegociables» adelanta de G7 la parte que A3 necesita;
- `.no-gitmoji` se escribe siempre, no solo con el guardián montado.

## Lo que salió al pintar las pantallas, y no lo cazaba ninguna prueba

Al sacar del código los textos para enseñárselos a Jose
([Pantallas de Todo cuadra](https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre)):
- el primer mensaje pegaba el objetivo con lo que sigue, «facturas.Después», cuando no hay web ni
  claves. Venía de antes; ahora tiene su comprobación (M15);
- dos textos llamaban «empresa» a la carpeta por defecto: el título de la caja de la web y el aviso
  de progreso;
- el encargo decía «falta los innegociables»;
- con el suelo a medias, el aviso final decía «ya está listo».

## Lo que encontró la revisión con ojos frescos

Un revisor con el contexto limpio, sobre el diff de F1, con las comprobaciones de cada tarea, el
contrato de T010 y las restricciones del plan. Pasó la batería entera (`contrato` 9, `humo` 204,
`humo+` 207) y cotejó con el paquete de RSC las formas que la barra lee. Veredicto: *changes-needed*,
con 1 importante y 3 menores. Cada hallazgo se comprobó en el código antes de aceptarlo, y se
aceptaron todos:

| Hallazgo | Qué se hizo |
|---|---|
| **Importante.** Qué lleva la carpeta y cuánta gente hay se pierden al volver a montar: RSC reescribe `user-profile.md` entero al aceptar un plan (`onboarding-apply.js:80`), los nombres se salvan porque la barra los relee, y estos dos no | `identidad.leer()` y `terreno` los leen del perfil, y `entrevistar()` los vuelve a escribir. Prueba nueva, «volver a montar conserva lo que lleva la carpeta y cuánta gente hay», con un RSC fingido que reescribe el perfil como el de verdad; roja antes del arreglo (M16) |
| Menor. Con los innegociables por escribir, la primera fila dice «Listo, desde el…», contra G7 | Dice «Montado, desde el…». La prueba del suelo a medias lo mira (M17) |
| Menor. Cuántas personas no sugiere el nombre, y A13 y T010 decían que sí | Se alinea el texto: el nombre lo decide lo que lleva la carpeta, que es lo que dice de cómo se llama. Spec (A13, *Revisiones*) y plan (§3, T010) |
| Menor. El contrato publicado es `rsc.comoAcaboElMontaje()`, con `Fallo{codigo}`, y el plan seguía diciendo `rsc.aplicarPlan()` | El plan (§3, §4 paso 6 e *Interfaces* de T010) dice el de verdad |
| Fuera de cuenta. `ponerEnElPerfil` reemplazaba con texto: un nombre con `$&` o `$'` rompía la cabecera del perfil | Reemplazos con función. La prueba de alcance y personas escribe «Soler $& Hijos» (M18) |

Lo que el revisor dejó dicho de la honestidad de las pruebas: el RSC fingido de `humo` está
respaldado por `contrato.js` contra el paquete, la de gitmoji tiene su control, y cada mutación
anotada pone roja una prueba. Faltaba una que volviera a montar después de montar con los campos
nuevos, que es por lo que no se vio el importante.
