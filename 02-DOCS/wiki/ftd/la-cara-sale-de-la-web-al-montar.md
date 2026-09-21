---
type: ftd
title: La cara sale de la web al montar, y la radiografía tiene un solo nombre también sin arnés
date: 2026-09-21
status: hecho
---

# La cara sale de la web al montar

## Intent

Jose, con una captura: *«cuando dices la web […] en el init […] no te adapta la interfaz a los
colores y el logo de la empresa. Y eso debería ejecutarse en el init porque ya tienes la web»*. Y:
*«me dice que ha habido un error, que pulse lo de que hay un problema, pero no está el botón»*.

Hoy la web que el alumno da al montar solo viaja dentro del primer mensaje al asistente: es él quien
tiene que mirarla y escribir `02-DOCS/wiki/brand/marca.md`, y hasta que eso pasa —si pasa— la barra
sigue con la cara de Executive Lab. La barra ya tiene la web en la mano; puede sacar ella misma un
primer intento de colores y logotipo, al momento, y dejar que el asistente lo afine después.

## Scope

**Dentro**

- `web.js`: descargar la portada de la web (con límite de tamaño y tiempo, siguiendo redirecciones),
  sacar nombre, `theme-color` o el color de marca de su CSS, el fondo, y el icono grande
  (`apple-touch-icon` o `icon` en svg/png), y escribir `marca.md` marcado como provisional. Sin red
  no pasa nada: se queda la cara de siempre y el encargo al asistente sigue igual.
- Se llama al terminar de montar (si hubo web) y al pulsar «Poner el tema de mi empresa». Después se
  le pide al asistente que lo revise, no que lo haga desde cero.
- «Ver qué hay aquí» en la pantalla sin arnés pasa a decir «Qué falta por montar»: era el cuarto
  nombre de la misma pantalla, y la decisión 101 dejó uno.

**Fuera**

- El botón «Algo va mal» que falta en la captura: **ya está en el código desde el 19-09**
  (`99dfa57`); la captura viene de una barra instalada anterior. Se publica, no se reescribe.
- Por qué falló el montaje en esa carpeta: hace falta el informe de «Algo va mal» de esa máquina.

## Checklist

- [x] De un HTML de prueba salen nombre, acento, fondo y logotipo — prueba con HTML fijo.
- [x] Un `theme-color` blanco o gris no se toma como acento — prueba (`#ffffff` y `#777` descartados).
- [x] Sin red, o con la web caída, no se escribe nada y no revienta — prueba con descarga falsa que falla.
- [x] `marca.md` escrito lo lee `marca.leer()` y sale una paleta — prueba, con `provisional` y el logotipo al lado.
- [x] Una cara puesta a mano no se pisa — prueba: quitado `provisional`, el segundo intento se niega.
- [x] Al montar con web se escribe la cara antes de hablar con el asistente — `extension.js`: `sacarLaCara` va antes de componer el primer mensaje, y el mensaje pide revisar, no hacer.
- [x] «Qué falta por montar» también sin arnés, y el botón «Algo va mal» en esa pantalla — prueba que pinta la pantalla de la captura.
- [x] Diccionario, `humo.js`, `empresas-distintas.js` en verde.

## Evidence

Observado el 21-09-2026 sobre la rama `los-apartados-se-ordenan-y-el-mapeo-se-cierra`.

- `✓ la cara sale de la web al momento, y no pisa la puesta a mano — colores, nombre y logotipo de
  la portada; sin pisar lo puesto a mano`. Del HTML fijo: nombre «Ferretería Soler», acento
  `#d84315` (el `theme-color` blanco se descartó y mandó `--color-primary`), fondo `#ffffff`,
  texto `#222222`, logotipo `icons/logo-180.png` (no el `.ico`). Escrito en carpeta temporal:
  `marca.leer()` devuelve paleta, nombre, web y `provisional: true`; `logo.png` guardado.
- `✓ el socorro sale también en la pantalla sin arnés — botón donde se le nombra`: la pantalla de la
  captura pintada con aviso malo trae «Algo va mal» dos veces (texto y botón) y «Qué falta por
  montar»; «Ver qué hay aquí» ya no aparece.
- Dos fallos míos que pilló la suite antes que nadie: `color.aRgb` no está exportado (lo tomé por
  dado), y `esGris('#000')` no normalizaba el hex corto. Arreglados y cubiertos.
- `node extension/prueba/humo.js` → **183 comprobaciones pasadas** (dos nuevas; 34 módulos cargan).
  `empresas-distintas.js` → `las tres empresas, enteras`. `comprobar-diccionario.js` → `Todo el
  texto de pantalla respeta el diccionario` (47 ficheros).
- El botón que faltaba en la captura: `git log -S"manda = cual.malo"` → `99dfa57 2026-09-19`; el
  botón de la radiografía en esa pantalla → `24e294f 2026-09-20`. La captura no tiene ninguno de
  los dos: barra instalada anterior a ambos.

## Next

Publicar la 0.24.0 (decisión de Jose) e instalarla: hasta entonces la barra que corre no tiene
ni esto ni el botón de socorro en esa pantalla.
