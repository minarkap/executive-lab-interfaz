---
type: worklog
title: Lo que quedaba de «Todo cuadra»
description: Con «Hazlo tú lo que queda», lo que se hace dentro del proyecto. Los tres avisos del arranque que se apagan, con nombre. El motor de JavaScript de las copias, retirado. Los instaladores de Windows, al día. Y la prueba en un VS Code de verdad y sin node, que midió el relevo y cazó un fallo que los dobles no veían. Decisión 126.
timestamp: 2026-09-28T11:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

«Todo cuadra» cerró con diez cosas para Jose, y Jose respondió «Hazlo tú lo que queda». Esta es la
parte que se hace dentro del proyecto, por la vía rápida (`02-DOCS/wiki/ftd/lo-que-queda.md`):
- **Tres avisos del arranque de RSC, por su nombre**: el de carpeta sin copias (`.no-git`), el de
  preparar el arnés (`.no-harness`) y el de versión nueva (`RSC_NO_UPDATE_CHECK`). Salían «Git ·
  Harness», o no salían. El nombre que se propuso en F3 para `.no-harness`, «El arnés, apagado en esta
  carpeta», no era verdad: leído el código de RSC, ese interruptor calla la oferta de prepararlo, no
  apaga el arnés.
- **El motor de JavaScript de las copias, retirado.** La barra no lo pedía, pero `historial.js` lo
  elegía si encontraba su biblioteca, también junto a la app de un instalador de antes.
- **Los instaladores de Windows, al día**:
  - el `.iss`, con la versión de la barra;
  - `probar.ps1`, sin buscar dentro de la app lo que ya no viaja ahí;
  - las dos guías, con las comprobaciones que hay de verdad.
- **La prueba en un VS Code de verdad**, sin node en el PATH y sin la app del instalador: el relevo va
  el primero, los hijos lo heredan y lanzan el Node de VS Code, y el freno de los raíles deniega un
  `rm -rf`.

## Lo que salió por el camino

- **El editor de verdad cazó un fallo a la primera**: «Diagnóstico del puente» reventaba con
  `salida.clear is not a function`. El canal de la barra va envuelto (`rastro.envolver`) y el
  envoltorio no tenía `clear`. Los dobles no lo veían porque nadie lanzaba ese comando con el canal
  envuelto.
- **Mi comprobación del relevo se equivocó dos veces**, y las dos por lo que estaba bien:
  - Primero exigí el Node de VS Code, y en este Mac hay una app de prueba instalada, así que el relevo
    lanzaba el suyo, que es lo que debe hacer.
  - Después comparé rutas, y el `node` de la app es un guion que lanza `node-arm64`.
  - Ahora se compara lo que corre de verdad, y la prueba arranca sin app, que es el caso en que más
    importa el relevo.
- **Esta sesión corre dentro del anfitrión de extensiones de VS Code** y trae sus variables
  (`ELECTRON_RUN_AS_NODE`, `VSCODE_IPC_HOOK`, `VSCODE_ESM_ENTRYPOINT`…). `correr.js` solo quitaba la
  primera. Y en macOS el editor lee el PATH del arranque del shell, que le devolvía el `node` de
  Homebrew: `--force-disable-user-env` lo impide.
- **`probar.ps1` daba por bueno que el arnés arrancara con `--version`**, y en la 2.0.5 eso abre el
  menú de instalar y sale con 0. Salió al buscar una orden que no preguntara nada: `catalog`.
- **La prueba del motor de JavaScript salía saltada siempre**, y en su lugar hay una que falla si ese
  motor vuelve: deja la biblioteca de un instalador de antes al lado y exige git.

## Pruebas

- `humo.js` → **325 comprobaciones**. Hay cuatro nuevas (los tres avisos; el motor; el `.iss` y
  `probar.ps1`; el canal de salida) y una menos: la del motor de JavaScript, que salía saltada.
- `humo.js --con-arnes` → **333**, en 34 s.
- `contrato.js` → 13 · `empresas-distintas.js` → las tres enteras · diccionario → limpio, 718
  rótulos · PowerShell → sin pegas.
- `npm run probar-en-vscode` → **7 en verde** en un VS Code de verdad.
- Mutaciones:
  - Seis sobre los avisos, y mueren las seis.
  - Una sobre el relevo en el editor de verdad, que muere.
  - Las del motor, el `.iss` y `probar.ps1` se vieron rojas antes del arreglo, cada una por lo suyo.

## Lo que queda

- La versión del arnés: la 2.0.15 está leída contra la 2.0.5, y va en su propia rama.
- Subir, fusionar y publicar, y las issues de RSC.
- Windows y una sesión de Claude hablando: no se pueden hacer desde aquí.
