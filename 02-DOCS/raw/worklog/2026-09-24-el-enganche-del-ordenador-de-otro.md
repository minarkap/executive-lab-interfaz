---
type: worklog
title: Un enganche que apunta al ordenador de otro se arregla
description: Mirando por qué settings.json sale siempre modificado salió un fallo de verdad: los enganches quedan con una ruta absoluta, ese fichero viaja en git, y quien clonaba se llevaba los enganches apuntando al Mac de otro. En silencio. Decisión 109, 0.29.0.
timestamp: 2026-09-24T10:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Venía de la auditoría: `.claude/settings.json` aparece siempre como modificado en esta carpeta,
porque la barra le escribe la ruta absoluta del node que traemos. Al mirar por qué, salió un fallo
que no era el que buscaba.

## El fallo

Los enganches del arnés llaman a `node` por su nombre, y en el ordenador de un alumno puede no
haber ninguno en el PATH. Por eso `enganches.js` los reescribe con la ruta completa del nuestro.

Pero **`settings.json` viaja en git** —es la costura del arnés y RSC la quiere versionada—, así que
en cuanto se arregla una vez queda con una ruta absoluta de esa máquina. Y esto **solo reescribía
las órdenes que empiezan por `node` a secas**.

Resultado: quien clonaba el proyecto de un compañero se llevaba los enganches apuntando al Mac de
ese compañero, a una ruta que en su ordenador no existe. Y no volvían a tocarse nunca, porque ya no
empezaban por `node`. El arnés se quedaba **sin cuerpo siempre-activo, sin brújula y sin frenos**, y
nada lo decía. Es justo lo que P3 prohíbe.

## Qué hace ahora

Mira qué hay delante de la orden y arregla dos casos: `node` a secas, y una ruta a un node **que no
existe en este ordenador**. Reconoce las tres formas de escribirla: a secas, entre comillas, y sin
comillas.

Lo que no toca: una ruta que sí existe aquí —puede ser el node bueno de esa máquina, puesto a mano,
y pisarlo sería decidir por alguien— y lo que no es node.

## Y un verde que podía no probar nada

`extension/media/comun/` la genera `preparar-paquete.js` al empaquetar, y está ignorada a propósito
para no duplicar ficheros en el repositorio. Eso ya estaba bien pensado — me equivoqué al leerlo
como dos copias que pueden separarse.

Lo que sí faltaba: **las pruebas importan la copia generada**. Si alguien toca `instalador/comun/` y
no vuelve a empaquetar, la suite da verde sobre código que ya no existe, y el `.vsix` llevaría el
nuevo. Ahora se comprueba que la copia esté al día.

## Lo que NO se hizo, y por qué

No se ha sacado `settings.json` de git ni se ha movido la ruta a `settings.local.json`. Las dos
cosas suenan mejor de lo que son: RSC quiere ese fichero versionado, y partir los enganches en dos
ficheros que Claude Code fusiona puede acabar ejecutándolos dos veces. El fallo que muerde —la ruta
heredada— queda arreglado sin tocar esa decisión.

## Qué quedó tocado

`instalador/comun/enganches.js` y su copia en `extension/media/comun/` · `extension/prueba/humo.js`
(dos nuevas) · `docs/decisiones.md` (109).

## Cómo quedó

0.29.0. `humo.js` **193 comprobaciones**, la nueva verificada por mutación. Empresas, diccionario y
PowerShell en verde.
