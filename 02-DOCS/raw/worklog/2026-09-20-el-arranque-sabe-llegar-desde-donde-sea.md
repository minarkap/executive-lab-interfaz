---
type: worklog
title: El arranque reconoce antes de preguntar, y sabe llegar desde donde sea
description: El arranque solo sabía montar en una carpeta vacía; todo lo demás era callejón. Ahora reconoce nueve estados, decide en una función pura, ejecuta seis caminos nuevos y termina comprobando que todo quedó mapeado. Cinco fases, 166 comprobaciones, 0.18.0.
timestamp: 2026-09-20T12:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«primero, antes de lanzar las preguntas, debería escanear la carpeta […] si no está RSC,
potencialmente ni GIT, eso ya es una bifurcación aparte […] si ya está RSC, la idea es adaptarlo y
luego ya preguntar lo que falte»*. Y antes: *«lo que se pueda de forma determinista, y lo que no,
que lo haga el agente»*.

El arranque solo sabía hacer una cosa: montar en una carpeta que no tenía nada. Todo lo demás era
callejón, y eran cinco. El peor: con `.rsc.json` presente, `arrancar()` cortaba con «Aquí ya hay una
empresa montada» — así que el botón «Terminar de prepararla» de un arnés a medias llamaba a una
función que se negaba a hacer nada, y el aviso ni siquiera traía el botón de socorro porque no
contenía la cadena «Algo va mal».

## Cómo quedó

Cuatro momentos: **reconocer → decidir → aplicar → comprobar**. Reconocer no escribe. Decidir no toca
disco. Aplicar solo ejecuta lo que decidir le dio. Comprobar vuelve a mirar y ofrece salida.

**`terreno.reconocer()`** distingue nueve estados donde había cinco, en tres niveles según lo que
cuesta calcularlos — la pantalla principal se repinta sola y no puede pagar dos subprocesos cada vez.
`queHay()` pasa a ser una proyección, así que la brújula, el informe de soporte y la lista de piezas
siguen leyendo las cinco palabras de siempre.

**`rumbo.js`** es una función pura: entra un parte, sale un plan. Ahí está el grueso de las
comprobaciones nuevas, porque las nueve ramas se prueban con partes inventados en milisegundos.

**`arrancar.js`** ejecuta ese plan. Seis caminos nuevos: traer un clon con `sync`, completar un suelo
con el recibo y sin preguntar nada, poner al día un arnés sin plan firmado, adoptar uno al que le
faltan nuestros raíles, pedir permiso cuando ya había otro montaje, y no tocar nada cuando está bien.

## Los tres estados que no se distinguían

- **Un repositorio clonado** se veía igual que uno montado, porque `habilidadesPuestas()` hacía la
  unión de disco y declaración y lo declarado tapaba lo que falta. La barra pintaba botones que no
  respondían.
- **Un `.rsc.json` ilegible** no se distinguía de uno ausente. Ahora se para y no se toca nada.
- **Una carpeta con otro montaje de asistente** se trataba como una carpeta cualquiera. Ahora se
  enseña lo que tiene y se pide permiso; si dice que no, no se instala nada.

## Lo que se descubrió leyendo RSC

- **`repair` no levanta un suelo ausente**: `ensureHarnessSkeleton()` solo corre al final de
  `onboard`. Por eso «completar» vuelve a pasar el montaje con los flags del recibo.
- **`repair --yes` a ciegas es peligroso**: aplica también los hallazgos que preguntan, y uno de
  ellos —`wrong-target`— mueve el arnés a otro asistente.
- **`sync` es la única orden que funciona en un clon**: `add` e `install` mueren con exit 2 porque
  `hasDeclaredHarness()` es falso hasta que hay algo instalado en la máquina.

## El riesgo que se cumplió tal cual

El plan lo puso el primero: el fixture declaraba `executive-lab` en `.rsc.json` y **no la escribía en
disco**. En cuanto la barra aprendió a mirar el disco, la empresa de mentira pasó a clasificarse como
**clon** — y media suite habría tomado la rama equivocada sin que fallara ni una comprobación.
Arreglado en el mismo commit, y con guardarraíl.

## Ficheros tocados

- `extension/src/terreno.js` — `reconocer()`, `mirar()`, `queHay()` como proyección, piezas con arreglo
- `extension/src/rumbo.js` — nuevo, puro
- `extension/src/encargos.js` — nuevo: el contrato de cuatro partes y `comprobar()`
- `extension/src/arrancar.js` — enrutador, entrevista por tabla, pasos por catálogo, pestillo
- `extension/src/rsc.js` — `habilidadesEnDisco`, `sincronizar`, `reevaluar`, `salud`, `arreglarSolo`
- `extension/src/proyecto.js` — `comoEstaLaDeclaracion()`, `recibo()`
- `extension/src/donde.js` — `ficheroDeEstado()`, `carpetaDeOtro()`
- `extension/src/extension.js` — ramas nuevas, documento guardable, final condicional
- `extension/media/panel.js` · `panel.css` — botones en la lista, alcance, `noAplica`
- `extension/prueba/` — el fixture y once comprobaciones nuevas
- `docs/decisiones.md` — decisiones 85 a 90

## Cómo quedó

166 comprobaciones (incluida la que monta un arnés de verdad), las tres empresas enteras, diccionario
limpio. Publicada e instalada la 0.18.0. Se recorrieron a mano las siete clases de carpeta y ninguna
deja una pantalla sin salida.

## Lo siguiente

- La rama `adoptar` no tiene botón propio en la pantalla principal: se llega desde «Qué falta por
  montar». Habría que ver si hace falta uno más visible.
- `reassess` está cableado (`rsc.reevaluar()`) y no lo llama nadie todavía: sería el aviso de «esto ha
  crecido, igual toca revisar el plan».
- Sigue abierto el montaje que le falló a Jose en una carpeta suya.
