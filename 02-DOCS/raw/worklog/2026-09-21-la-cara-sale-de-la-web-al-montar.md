---
type: worklog
title: La cara sale de la web al montar, y el socorro está donde se le nombra
description: Jose trajo una captura con dos fallos. La web dada al montar no cambiaba la cara de la barra; ahora la saca la propia barra al momento y el asistente la afina. El botón «Algo va mal» que faltaba estaba en el código desde el 19-09 y la barra instalada era anterior; queda una prueba en esa pantalla exacta. Decisión 103, 0.24.0.
timestamp: 2026-09-22T00:20:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose, con una captura de una carpeta con trabajo suyo (13 cosas, 12 claves sueltas) donde el
montaje falló: *«cuando dices la web […] en el init […] no te adapta la interfaz a los colores y el
logo de la empresa. Y eso debería ejecutarse en el init porque ya tienes la web»*; y *«me dice que
pulse lo de que hay un problema pero no está el botón»*.

## 1 · La cara la saca la barra, al momento

La web solo viajaba dentro del primer mensaje al asistente. Para que la barra cambiara de cara
tenían que pasar cuatro cosas seguidas —que el alumno enviara, que el asistente mirara la web, que
escribiera `marca.md` bien, que el vigía repintara— y cualquiera que fallara dejaba la cara de
Executive Lab sin explicación.

`web.js` descarga la portada y lee lo que la web declara: nombre (`og:site_name` o `<title>` sin
coletilla), acento (`theme-color` si no es blanco/negro/gris; si no, variable CSS de marca en la
portada o en su primera hoja; si no, el color saturado más repetido), fondo y texto (`body` o sus
variables), y el icono grande (`apple-touch-icon` → `icon` svg/png). Escribe `marca.md` con
`provisional: si` y el logotipo al lado. Se llama al terminar de montar y al dar la web a mano. Al
asistente se le pide que **revise** ese intento. La pantalla del tema lo dice: «sacada de su web de
forma automática; el asistente la afina».

No pisa una cara puesta a mano, no inventa sin red ni sin color de marca, y no toma un gris por
acento.

## 2 · El botón que faltaba

Está en el código desde el 19-09 (`99dfa57`). La captura tampoco tiene el botón de la radiografía
(20-09): la barra instalada es anterior a los dos. No se reescribe: se publica. Queda una prueba que
pinta esa pantalla exacta y exige el botón. Y ese botón decía «Ver qué hay aquí» —el cuarto nombre
de la radiografía—; ahora, «Qué falta por montar».

## Qué quedó tocado

`extension/src/web.js` (nuevo) · `extension/src/{marca,tema,extension}.js` · `extension/media/panel.js` ·
`extension/prueba/humo.js` (dos comprobaciones nuevas) · `docs/diccionario.md` · `docs/decisiones.md` (103).

## Cómo quedó

0.24.0. `humo.js` **183 comprobaciones**, las tres empresas, diccionario limpio. La suite pilló dos
fallos míos antes que nadie (`color.aRgb` sin exportar; `esGris` sin normalizar el hex corto).

## Lo que no se ha podido saber

Por qué falló el montaje en esa carpeta. Hace falta el informe de «Algo va mal» de esa máquina —que
es justo el botón que la barra instalada no tenía.
