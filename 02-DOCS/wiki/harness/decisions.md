# Harness decisions

- Accepted plan `434ebdda2d12e72195a3b0a9ba0e57e6171e56ae1f19bc4f89d93223d9ae36a3`.
- Project kind: software.
- SDD: deferred.

## Auditoría del arnés para Codex y para Claude — 18 de septiembre de 2026

Informe entero en `docs/auditoria-codex-y-claude.md`. Lo que cambió de fondo:

- **La tabla de dónde mira cada asistente es una sola**, en `skills/sitios.js`, sin dependencias, y la
  leen los dos que la necesitan: la barra y el instalador de raíles. Antes cada uno tenía la suya y se
  separaron.
- **Los raíles se ponen donde mire el asistente de esa carpeta**, no siempre en `.claude/`. Con Codex
  van a `.codex/rsc/`, no se escriben comandos —RSC no le escribe ninguno— y se le apunta a la
  habilidad desde `AGENTS.md`. Con un asistente desconocido, no se escribe nada.
- **Los avisos del arnés que mandan al alumno a una terminal se callan desde los raíles**: `.no-audit`,
  `.no-worktree-cleanup` y `.no-scope-check`. Se dejan los que valen la pena (que avise si falta git,
  la higiene del `CLAUDE.md`). Queda abierto el aviso de versión nueva, que necesita
  `RSC_NO_UPDATE_CHECK` y probarse en Windows.
- **La versión del arnés se fija exacta**, sin rango: `^1.4.1` permitía que un `npm install`
  empaquetara otro catálogo. Una prueba compara los cinco sitios donde se escribe.
- **Publicar no pisa una versión ya publicada.** `publicar.sh` se para y pide subir el número.
- **Pendiente de decidir:** los cuatro aplazamientos del plan (`base-agents`, `code-hooks`, `sdd`,
  `gitmoji-guard`) se decidieron sobre un proyecto de 14 ficheros y hoy hay 41 módulos y dos ayudantes
  escritos a mano. Reconsiderarlos cambia cómo el arnés gobierna esto, así que lo decide Jose.

## Cuando algo falla, el alumno tiene que poder contarlo — 19 de septiembre de 2026

Montar el arnés falló en una carpeta ya empezada y salieron dos defectos encadenados, los dos en el
camino que existe precisamente para cuando algo va mal. Worklog:
`02-DOCS/raw/worklog/2026-09-19-el-socorro-no-estaba-donde-se-le-llamaba.md`.

- **El aviso que nombra un botón lo trae consigo.** "Algo va mal" cuelga de Ayuda, y Ayuda solo sale
  cuando ya hay arnés — o sea, nunca en la pantalla donde el aviso de un montaje fallido aparece. Se
  arregla en `bloqueAviso()`, no en esa pantalla: quien lo nombra, lo ofrece.
- **El informe de incidencia lleva dentro el motivo.** El detalle del fallo se escribía en el panel de
  salida de VS Code y se quedaba ahí; el código de seis letras que el alumno le dicta a su tutor no lo
  llevaba. El canal se envuelve (`extension/src/rastro.js`) y el informe pega las últimas 300 líneas.
- **Diagnosticar una carpeta sin arnés no le fabrica medio arnés.** El informe creaba
  `02-DOCS/raw/incidencias/`, que es una de las piezas del suelo que estaba diagnosticando. Sin suelo,
  se escribe fuera del proyecto.
- **Un parte de fallo va entero**: código de salida y las dos salidas. Antes era `error || salida` y se
  quedaba con el canal vacío cuando el arnés escribía el motivo en la salida normal.

Queda abierto: `claude-vscode.primaryEditor.open` no da error pero no mete el texto, así que los
botones abren una sesión vacía. Confirmar la firma real necesita leer la extensión instalada, que está
fuera del directorio de trabajo.

## A Claude se le habla por su enlace — 19 de septiembre de 2026

Los botones de la barra abrían una conversación vacía. Worklog:
`02-DOCS/raw/worklog/2026-09-19-a-claude-se-le-habla-por-su-enlace.md`.

- **El enlace es el único camino que entrega el texto.** Probado con Claude Code 2.1.276: el enlace
  `vscode://anthropic.claude-code/open?prompt=…` lo deja en la caja; `editor.open` y
  `primaryEditor.open` abren una conversación vacía, aunque el manejador del enlace llame a uno de
  ellos. Lo que se pierde se pierde dentro de su ventana: `keep_opened` y `teleport` —el control
  remoto— se quedan con la sesión y descartan el texto. Orden nuevo: enlace, comandos, portapapeles.
- **`claude-vscode.focus` no enfoca.** Entrega una mención y, si nadie puede cogerla, abre otra
  conversación. No se llama después de mandar un texto.
- **El texto se deja escrito, no se envía.** La barra dejó de prometer lo contrario.

Lo que la barra dice de cada asistente está medido, con versión y fecha, en `asistentes.js`. Cuando
Claude Code cambie de versión, esa tabla es lo primero que hay que volver a probar.

## Y el fallo estaba en casa — 19 de septiembre de 2026

Cierre del anterior. Lo que Jose veía no lo causaba nada de Claude Code: la pantalla principal
rehacía la acción de cada botón de Acciones rápidas leyendo `a.prompt`, y `fijadas.js` la manda
dentro de `a.accion`. Todos mandaban un texto vacío. **La acción se coge tal cual viene.**

Lo de las decisiones 77 y 78 sigue siendo cierto y sigue puesto —el enlace es el único camino que
entrega el texto, y `claude-vscode.focus` no enfoca— pero no era el fallo de Jose.

Lección: **antes de leer el código de otro, comprobar qué se le está mandando.**

## Una cosa es un botón — 19 de septiembre de 2026

Las tres listas de la barra —comandos, habilidades y ayudantes— pintaban cada cosa en tres bloques
con un botón que ponía "Hacerlo". Worklog: `02-DOCS/raw/worklog/2026-09-19-una-cosa-es-un-boton.md`.

- **Una cosa es el botón, con su nombre.** Lo que hace se despliega desde una (i) pegada, sin
  repintar — repintar tira el scroll, y en una lista de veinticinco eso es perder el sitio.
- **Los ayudantes dejan su apartado propio** y se meten en Acciones, con comandos y habilidades. Un
  desplegable entero para un solo botón no es un apartado.
- **Las habilidades pasan a tener botón.** Eran una lista que no se podía usar.
- **"Hacerlo" no es un rótulo**: nombra el acto, no la cosa. El mismo fallo que ya está escrito en
  la habilidad `texto-de-la-barra`, colado en tres pantallas.
