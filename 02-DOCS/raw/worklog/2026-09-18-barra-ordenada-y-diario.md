---
type: worklog
title: La pantalla principal pasa a cinco filas plegadas, y sale a la luz el diario del arnés
description: Reordenada la barra por grupos plegables y expuestos dos sitios que RSC ya escribía y no veía nadie — el diario de trabajo y el dial de acompañamiento.
timestamp: 2026-09-18T12:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

- La pantalla principal deja los cuatro rótulos y los doce botones sueltos y pasa a cinco filas
  plegables: *Lo que sabe de <nombre>*, *Mis conexiones*, *Guardar*, *Qué se ha hecho* y
  *Ajustes y ayuda*. Arriba y desplegado se queda solo lo de diario: los botones que el asistente ha
  ido creando y lo que se mira de un vistazo de cada herramienta.
- Los dos contadores que salían en la brújula se mueven a la fila de cada uno, donde el número lleva
  a algún sitio.
- `extension/src/diario.js`: lee `02-DOCS/raw/worklog/` y `02-DOCS/wiki/harness/decisions.md`, con
  los dos formatos de decisión que RSC admite, y descarta las plantillas.
- `extension/src/trato.js`: lee y escribe `accompaniment_level` y `technical_level` del perfil, esté
  en la cabecera o en el cuerpo, sin tocar el resto del fichero.
- Dos botones nuevos que no existían y son RSC puro: *Conectar algo nuevo* y *Apuntar lo de hoy*.
- `cerebro.originales()` deja de contar el diario como documentos entregados.

## Por qué

Jose: «vemos de mejorar también la barra porque ahora me parece un poco desordenada». El código ya
lo confesaba —había un comentario que decía «se diseñó con seis botones y ya van doce»— y la
respuesta de entonces fue hacerlos pequeños, que arregla el alto y no el desorden.

Y al repasar el arnés aparecieron dos sitios que RSC escribe solo y que la barra no enseñaba: el
diario de trabajo con su registro de decisiones, y el dial que decide cuánto te explica el
asistente. El segundo es el ajuste que más cambia el día a día y solo se podía tocar escribiéndolo
en la conversación, cosa que no hace quien no sabe que existe.

Las tres decisiones, con su porqué, en `docs/decisiones.md` 31, 32 y 33.

## Files touched

- `extension/media/panel.js` — `grupo()`, `pantallaDiario`, `pantallaSesion`, `pantallaTrato`.
- `extension/media/panel.css` — el estilo de las filas.
- `extension/src/diario.js`, `extension/src/trato.js` — nuevos.
- `extension/src/extension.js` — las acciones y los dos comandos nuevos.
- `extension/src/cerebro.js` — `contar()` acepta qué saltarse.
- `extension/prueba/humo.js`, `extension/prueba/empresa-falsa.js` — cuatro comprobaciones nuevas.
- `docs/decisiones.md`, `docs/diccionario.md`.

## Outcome

Entregado. 84 comprobaciones pasadas, diccionario limpio, PowerShell limpio. `0.9.2` empaquetada e
instalada en el Mac de Jose.

La comprobación que más importa es la que vigila que ninguna acción se haya perdido al agrupar: un
botón que desaparece al reordenar no da ningún error, simplemente deja de existir.

## Open questions / next

- Quedan sin tocar cosas del arnés que se podrían enseñar: los informes de `02-DOCS/audits/`, las
  puntuaciones de `wiki/scores.json` y los subagentes, que Jose dejó aparcados a propósito.
- Sigue pendiente de Jose: la cuenta de editor del Marketplace, el token de Open VSX y el
  certificado para firmar el `.dmg`.
