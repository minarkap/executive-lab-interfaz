---
type: worklog
title: Todo cuadra, F9 — el cierre
description: La verificación entera sobre el estado final, con los 61 criterios y su prueba; el montaje de verdad de «Un poco de todo»; los plurales sin paréntesis; y lo que encontraron los tres refutadores de la revisión final, empezando por un freno que se apartaba sin que frenara nadie. Decisión 125.
timestamp: 2026-09-28T10:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F9 del programa `todo-cuadra`: T073 (verificar) y T074 (revisar), con T075 (el informe) al final.
Lo que más pesa:
- **Los 61 criterios de la spec, cada uno con la prueba que lo sostiene.** Cumplen 60, y C2 espera a
  Windows.
- **El freno cuenta solo si está enganchado de verdad.** Con el nombre del de RSC en una nota, o
  enganchado a otra herramienta, el nuestro se apartaba sin que frenara nadie. Lo encontró el
  refutador de seguridad, y era el único crítico.
- **«Un poco de todo» se monta de verdad**, y la barra no hace plurales con paréntesis.

## Lo que salió por el camino

- La revisión de F8 llegó mientras se preparaba F9: F9 se apartó en un `stash`, la revisión se arregló
  en su propio commit (`939adf2`) y se siguió encima.
- Los tres refutadores se lanzaron mientras esperaba la revisión de F8, sobre una copia del árbol
  con lo de F9 a medias. Cada hallazgo se comprobó después contra el código final.
- Dos refutadores encontraron lo mismo por caminos distintos: el comprobador del diccionario no veía
  una palabra suelta.
- Un vigía de actividad miraba un fichero que no cambia nunca, y habría dado una falsa alarma. Se
  paró, y se puso otro sobre las carpetas donde el revisor escribía de verdad.

## Lo que queda

- Para Jose: merge, push y publicar; lo de Windows; lo que baja cosas fuera del proyecto; los
  instaladores firmados; tres nombres; la activación con `*`; el motor de JavaScript de las copias; las
  seis issues de RSC; y subir la versión del arnés.
