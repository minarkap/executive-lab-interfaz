---
type: worklog
title: Cierre de la tanda: la documentación al día y dos cosas apuntadas para RSC
description: Los README decían 1.4.1, la excepción del guardián de commits no viajaba por git, y había dos hallazgos de RSC que merecía la pena contarle a Eric. Todo escrito y cerrado.
timestamp: 2026-09-21T20:00:00Z
topic: harness
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«documenta todo y cerremos»*, y *«dime el problema de git qué es, por si se lo digo a Eric»*.

## El problema de git, contado exacto

RSC guarda los interruptores de sus once guardianes en ficheros locales bajo `.rsc/`, y `.rsc/` es
justo lo que él mismo añade al `.gitignore` (`install-apply.js:301`). La decisión de un equipo no
viaja: en cada clon vuelve el guardián.

Con `gitmoji-guard` duele más que con los otros, porque bloquea `git commit -m` —la orden más
frecuente que hay— y porque el mensaje de recuperación le dice al recién llegado que cree un fichero
que su equipo ya creó.

Y lo que lo convierte en un fallo limpio y no en una decisión de diseño: **el campo para esto ya
existe y ya se rellena solo**. `install-apply.js:135` recorre los `.rsc/.no-*` y escribe sus nombres
en `.rsc.json → optOuts`, que sí se comitea. Pero `optOuts` aparece nueve veces en todo el paquete y
**las nueve son escrituras o valores por defecto**. Ningún guardián lo lee: todos hacen
`existsSync(join(root, '.rsc', '.no-X'))`.

Se comprobó en este repositorio: `.rsc.json` dice `optOuts: ["context7","gitmoji"]` y el guardián
seguiría bloqueando en un clon.

Rodeo puesto, en el `.gitignore`: `.rsc/*` más `!.rsc/.no-gitmoji`. Verificado que solo viaja esa
línea y el resto de `.rsc/` sigue ignorado.

## Lo demás del cierre

- Los dos README y `docs/spike.md` decían 1.4.1 en órdenes de ejemplo que alguien copiaría. Al día.
  La nota de «RSC 2.x está publicado y aquí va fijada la 1.4.1» se sustituye por lo que se hizo y
  cómo se contrastó.
- `docs/para-rsc.md`: los dos hallazgos para Eric, con fichero y línea, cada uno con lo que se ve,
  el rodeo que hemos puesto y lo que parece que falta. Y un tercer apartado con lo que sí funcionó,
  que también es información útil: el salto de mayor no rompió ninguna de las tres tablas que
  copiamos ni ninguno de los marcadores que parseamos.

## Ficheros tocados

- `.gitignore` — la excepción del interruptor
- `docs/para-rsc.md` — nuevo
- `README.md` · `extension/README.md` · `docs/spike.md` — versiones al día
- `docs/decisiones.md` — decisión 96

## Cómo quedó

168 comprobaciones, diccionario limpio. Sin cambios de código: esta tanda es documentación y una
línea de `.gitignore`.

## Lo siguiente

Lo mismo que había, y no ha cambiado:

- El montaje que le falló a Jose en una carpeta suya. Es lo único roto para un alumno.
- Windows en máquina real, con las otras dos de la auditoría del 18 que van con ella.
- Las tiendas, bloqueado en crear el editor y el token.
- Y una que entró hoy: la rama `ponerAlDia` está probada con carpetas de mentira, no con un arnés
  1.4.1 de verdad puesto al día a 2.0.5. Es el único riesgo que introdujo la subida de versión.
