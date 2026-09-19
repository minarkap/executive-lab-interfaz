---
type: worklog
title: El socorro no estaba donde se le llamaba, y el informe no decía por qué
description: Montar el arnés falló en una carpeta de Jose. El aviso mandaba a un botón que en esa pantalla no existía, y el informe que ese botón genera no llevaba dentro el motivo del fallo. Las dos cosas arregladas, con prueba, en la 0.15.1.
timestamp: 2026-09-19T12:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose instaló la extensión en una carpeta suya que ya tenía trabajo dentro y le salió «No he podido
montar el arnés. Pulsa "Algo va mal" y pásale el código a tu tutor». Dos mensajes después: «y no hay
ni botón para decir que va mal».

Tenía razón, y detrás había una segunda avería peor que la primera.

## Las dos averías

**El botón no estaba.** "Algo va mal" cuelga de **Ayuda**, y Ayuda solo aparece en la pantalla
principal, o sea cuando ya hay arnés. El aviso de un montaje fallido solo puede salir en la pantalla
de "carpeta sin arnés", que no tiene Ayuda. Justo en el único sitio donde ese texto aparece, el botón
al que mandaba no existía. Se arregla en `bloqueAviso()` y no en esa pantalla: si el aviso es malo y
nombra "Algo va mal", el botón va pegado debajo, en la pantalla que sea.

**El informe no llevaba el motivo.** `arrancar.js` escribía el detalle del fallo con
`salida.appendLine`, que va al panel de salida de VS Code y se queda ahí. `soporte.js` componía el
informe de incidencia con el `doctor`, la reparación en seco y el estado de las piezas — pero nunca
con eso. Es decir: le pedíamos al alumno que le dictara a su tutor un código de seis letras que por
dentro no llevaba la única línea que importaba.

Se envuelve el canal de salida (`extension/src/rastro.js`). Todo lo que se apunta sigue yendo al
panel igual que antes y además se guarda: las últimas 300 líneas, más las de la sesión anterior, por
si VS Code se recarga entre el fallo y el "Algo va mal". El informe las pega al final bajo «lo que
fue pasando», y él mismo se escribe con `sinGuardar` para no meterse dentro del informe siguiente.

## Dos cosas más que aparecieron por el camino

El parte de un montaje fallido guardaba `error || salida`, así que se quedaba con el canal vacío
cuando el arnés escribía el motivo en la salida normal — que es lo que hace, por ejemplo, cuando el
suelo se queda a medias. Y nunca llevaba el código de salida. Ahora van las dos salidas y el código,
siempre, con `loQuePaso()`.

Y `soporte.js` creaba `02-DOCS/raw/incidencias/` con `mkdir -p` para dejar el informe. En el caso que
más importa —montar ha fallado, no hay arnés— eso fabricaba una de las piezas del suelo que estaba
diagnosticando, y el informe siguiente ya decía que `02-DOCS` existía. Sin suelo, el informe se
escribe ahora fuera del proyecto, en la carpeta de la extensión, y la pantalla ofrece "Enseñar el
informe" para abrirlo al lado.

## Qué no es

Se reprodujo el caso en una carpeta de mentira con la misma pinta que la suya (Python, historial
propio, `.env` sueltos, un `package.json`) y **el arnés monta bien**: las dos fases del `onboard` de
RSC 1.4.1 terminan en `RSC_ONBOARDING_READY`. Así que el fallo es de esa carpeta en concreto, y esa
carpeta es otro proyecto: no se entra. Lo que se ha hecho es que la barra sepa contarlo.

## Ficheros tocados

- `extension/src/rastro.js` — nuevo; envuelve el canal de salida
- `extension/src/soporte.js` — el informe lleva el rastro; y no fabrica `02-DOCS`
- `extension/src/arrancar.js` — `loQuePaso()`: código de salida y las dos salidas
- `extension/src/extension.js` — canal envuelto, y `verElInforme`
- `extension/media/panel.js` — `bloqueAviso()` trae su botón; "Enseñar el informe"
- `extension/prueba/humo.js` — cuatro comprobaciones nuevas
- `docs/decisiones.md` — decisiones 74, 75 y 76

## Cómo quedó

143 comprobaciones pasadas, las tres empresas de prueba enteras, el diccionario limpio. Publicada e
instalada la 0.15.1.

## Lo siguiente

Queda abierto lo de **"Revisar la barra"**: el botón abre una sesión de Claude Code vacía.
`claude-vscode.primaryEditor.open` no da error pero no mete el texto, así que la firma
`open(sesión, prompt)` —verificada contra la versión del 17-09— ha cambiado en la que Jose tiene hoy.
Para confirmarlo hay que leer la extensión instalada, que está fuera del directorio de trabajo: se le
ha pedido permiso y se espera respuesta. El atajo sin permiso es el comando
«Executive Lab: Qué comandos hay para hablar con tu asistente», que vuelca la lista real.
