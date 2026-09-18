---
type: worklog
title: El disfraz deja de salirse de la carpeta, y el VS Code de Jose vuelve a ser suyo
description: Dos causas distintas detrás de "se me ha puesto por defecto en el VS Code" — el instalador probado en la máquina de desarrollo y el botón de editor completo escribiendo valores de fábrica en cada carpeta. La segunda era el fallo; ya no escribe, borra.
timestamp: 2026-09-18T16:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

**En la máquina de Jose** (lo urgente, ya hecho y verificado):

- Quitadas de sus ajustes de VS Code las seis claves que le había metido el instalador de macOS al
  probarlo: `window.zoomLevel: 1` —la que se lo ponía todo gigante—, `security.workspace.trust.enabled`,
  `update.mode`, `update.showReleaseNotes`, `telemetry.telemetryLevel` y `extensions.ignoreRecommendations`.
  Se compararon sus ajustes contra los de la víspera: seis de más, ninguna suya perdida ni cambiada.
  Copia en `settings.json.antes-de-executive-lab-20260918-1614`.
- Vaciado el `.vscode/settings.json` de este repositorio, que tenía veintitantas claves escritas por
  *ver el editor completo* —tema `Dark 2026`, minimapa encendido, pestañas, rótulo de ventana—
  pisando sus preferencias en su propio proyecto. Queda solo el interruptor, apagado.
- Desinstalada `executivelab.arnes-ui` de su VS Code de verdad y barridas treinta y tantas carpetas
  de versiones viejas en `~/.vscode/extensions`.
- La ventana en la que trabajaba **era la demo** (`demo.sh`, viva desde el jueves con su propio
  `--user-data-dir`): macOS activa la instancia que ya corre en vez de abrir la suya. Se le pasaron
  sus ajustes reales a la demo y se actualizó su extensión, que estaba en `executivelab.panel-0.2.0`,
  a `executivelab.arnes-ui-0.13.0` recién empaquetada.

**En el código** (el fallo de verdad):

- `verEditorCompleto` ya no escribe el valor de fábrica de cada clave visible en la carpeta: **borra**
  las claves del disfraz (`update(clave, undefined, Workspace)`) y deja que mande lo que tenga puesto
  quien abre esa carpeta.
- Fuera `CLAVES_VISIBLES`, `SE_FUSIONAN` y `valorParaDestapar`. En su lugar, `clavesDeLaCarpeta()`:
  las del disfraz menos las cinco de ámbito de programa, que la extensión no toca nunca.
- La comprobación de `humo.js` deja de exigir valores de fábrica y exige lo contrario: que la carpeta
  se quede **solo con el interruptor** y sin una sola clave nuestra.

## Por qué

Jose abrió con *«desinstálame la interfaz esta de Executive Lab, que se me ha puesto por defecto en
el VS Code»* y acabó en *«el diseño debe aplicarse SOLO a la extensión y al modo sencillo, NO a todo
el vscode»*.

Escribir los valores de fábrica venía de cuando la base del disfraz vivía en los ajustes de usuario:
entonces borrar la clave de la carpeta dejaba ver la global, disfrazada. Desde que `aplicar()` escribe
en ámbito de carpeta, eso sobra y hace daño — a cualquiera que tenga la extensión puesta y abra una
carpeta suya, no solo a quien desarrolla.

El porqué largo, con las dos causas separadas, en `docs/decisiones.md` 71.

## Files touched

- `extension/src/disfraz.js` — `clavesDeLaCarpeta()`, `verEditorCompleto`, `volverAModoSencillo`.
- `extension/prueba/humo.js` — la comprobación del interruptor, del revés.
- `.vscode/settings.json` — vaciado.
- `docs/decisiones.md` — entrada 71.

## Outcome

Entregado. **117 comprobaciones pasadas.** `0.13.0` empaquetada e instalada en la demo. Nada
commiteado: quedan tres ficheros modificados más la decisión y este diario.

## Open questions / next

- **Las cinco de ámbito de programa del instalador** siguen siendo lo único que toca VS Code entero.
  VS Code no las deja fijar por carpeta. Quitarlas devuelve el aviso de confianza al alumno nada más
  abrir. Vía por explorar: meter la carpeta de la empresa en la lista de carpetas de confianza en vez
  de apagar la confianza para todo el editor.
- **`herramientas/quitar-disfraz.js` no sirve como botón de pánico todavía.** Contra los ajustes
  reales de Jose no habría quitado `window.zoomLevel` (ya no está en `disfraz.json`: lo que el disfraz
  escribió en el pasado no lo cubre la lista de hoy) y habría borrado tres claves suyas que coinciden
  por casualidad con el disfraz — `editor.minimap.enabled`, `workbench.startupEditor`,
  `claudeCode.hideOnboarding`. Coincidir en el valor no prueba quién lo escribió: haría falta anotar
  qué se puso y dónde.
- **La demo se come el Dock.** Mientras `demo.sh` tenga una instancia viva, abrir VS Code desde el
  Dock lleva a la demo, no al editor de uno. Se arregla con una copia del `.app` con otro nombre, o
  avisando en la ventana.
