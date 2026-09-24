---
type: worklog
title: Un nombre sacado de una web ajena entra en una línea o no entra
description: Barrido de la cara sacada de la web con páginas hostiles. Todo aguantaba menos un fallo mío: un título partido en varias líneas rompía la cabecera del récord de marca. Y de camino, buscar y el interruptor del disfraz quedaron verificados. Decisión 113, 0.31.1.
timestamp: 2026-09-24T14:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Seguimos barriendo en autopilot lo que quedaba sin tocar.

## El fallo, y era mío

La barra saca la cara de la empresa de su web (decisión 103). Se probó contra páginas hostiles: una
de 5 MB, un PDF disfrazado de página, un HTML vacío, uno que es solo `<html>`, un título con emoji
y comillas. Todo aguantaba.

Menos esto: el nombre sale del `<title>` y acaba en la cabecera de `marca.md`, **donde cada línea es
un campo**. Un `<title>` partido en varias líneas es HTML de todos los días —lo escribe cualquier
formateador— y llegaba con el salto dentro: el nombre se quedaba en la primera palabra («Casa» de
«Casa\n  Pepe») y lo de después aterrizaba como si fuera otro campo.

Dos cinturones, porque el texto viene de fuera y acaba en un fichero nuestro: los espacios se
aplastan al leer la página y otra vez justo antes de escribir. Comprobado quitando los dos: la
comprobación se pone roja.

## Lo que se barrió y está sólido

- **Buscar**: 300 artículos en 41 ms, y consultas hostiles —vacía, solo espacios, `.*`, `((((`, 500
  caracteres— devuelven cero sin reventar.
- **La cara desde la web**, en todo lo demás.

## Una pregunta abierta, contestada sin escribir código

La auditoría dejaba para «mirarlo a simple vista» si los colores de la marca se quedan puestos al
volver al editor completo. **No se quedan**: se escriben solo en el ámbito de la carpeta, el
instalador nunca los toca, y el interruptor limpia justo eso. Y ya estaba vigilado sin que nadie lo
hubiera dicho — la prueba del interruptor exige que la carpeta se quede solo con el interruptor.

## Cómo quedó

0.31.1. `humo.js` **194 comprobaciones**.
