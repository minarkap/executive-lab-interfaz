---
type: worklog
title: La rama adoptar se ve en la pantalla, y lo del gitmoji va a issue
description: Un arnés montado y sin ajustar decía «listo» y solo se descubría entrando donde no entra quien no sabe que le falta algo. Ahora sale arriba con su botón. Y el fallo de optOuts queda abierto en el repositorio de RSC. 0.19.1.
timestamp: 2026-09-21T22:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«Haz lo de la rama adoptar. Sobre el error de RSC de git emoji, documéntaselo a Eric en una
issue si lo ves bien»*.

## 1 · La rama `adoptar` se ve

Existía desde la 0.18 y **solo se llegaba a ella entrando en «Qué falta por montar»** — que es justo
donde no entra quien no sabe que le falta algo. La pantalla principal decía «listo» y los botones
hablaban con un arnés a medio ajustar.

Un arnés puede estar entero para RSC y no tener nada de la barra: sin la habilidad que fija el
español y el vocabulario, sin los nombres del perfil, o montado con una versión anterior a la que la
barra lleva dentro. Pasa cuando alguien lo monta por su cuenta con `npx rsc`, cuando el repositorio
viene de otro sitio, y —esto le va a pasar a todo el mundo— cuando la barra sube de versión mayor.

Ahora sale arriba del todo, en el mismo sitio que el aviso de «falta el asistente», con un botón que
lleva al arranque. Los dos casos —`adoptar` y `ponerAlDia`— comparten botón y cambian la frase: para
quien lo lee es lo mismo, y no hace falta saber cuál de los dos es.

Quién lo decide es **`rumbo`**, el mismo que decide el arranque: una sola verdad. Y sale gratis,
porque `mirarYClasificar()` no lanza ni un proceso — la pantalla principal se repinta sola y no
podía pagar nada más.

## 2 · La issue de RSC

Abierta: [ericrisco/rsc-harness#258](https://github.com/ericrisco/rsc-harness/issues/258).

Se comprobó antes que no hubiera duplicada y se escribió en el estilo del repositorio —español,
gitmoji en el título—. Cuenta, en este orden: qué pasa con fichero y línea, cómo reproducirlo en
cuatro pasos, por qué duele especialmente con este guardián, el arreglo de dos líneas, y el rodeo
del `.gitignore`.

El segundo hallazgo —`scanProject` no lee el `.gitignore`— **no** se abrió: respetar el `.gitignore`
cambiaría la identidad del plan de todo el mundo, así que es más discutible que un fallo. Queda
escrito en `docs/para-rsc.md` con lo que sí se propondría: añadir `.vscode-test` a la lista de
ignorados, y que el plan imprima sobre cuántos ficheros se ha decidido, porque nadie mira un
`sourceFileCount` dentro de un JSON de 300 líneas.

## Ficheros tocados

- `extension/src/brujula.js` — `sinAjustar`, decidido por `rumbo`
- `extension/media/panel.js` — el aviso y su botón
- `extension/prueba/humo.js` — una comprobación nueva
- `docs/decisiones.md` — decisión 97
- `docs/para-rsc.md` — el enlace a la issue

## Cómo quedó

170 comprobaciones, las tres empresas, diccionario limpio. Publicada e instalada la 0.19.1.

## Lo siguiente

Lo mismo que había, sin cambios:

- **El montaje que le falló a Jose** en una carpeta suya. Es lo único roto para un alumno, y lleva
  abierto desde el viernes. Desde la 0.15.1 el informe trae el motivo dentro.
- **Windows en máquina real**, con las otras dos de la auditoría del 18 que van con ella.
- **Las tiendas**, bloqueado en crear el editor y el token.
- **La rama `ponerAlDia` probada con un arnés 1.4.1 de verdad**, no con carpetas de mentira. Es el
  único riesgo que introdujo la subida de versión, y le va a tocar a todos los alumnos que ya tienen
  arnés.
