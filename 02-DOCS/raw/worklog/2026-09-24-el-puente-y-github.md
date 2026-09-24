---
type: worklog
title: El puente no abre una conversación en blanco, y GitHub aguanta lo que le echen
description: Barridos los dos que quedaban. GitHub no se cuelga ni con promesas que nunca contestan. El puente mandaba texto vacío y abría el chat en blanco: arreglado. Y queda medido, sin tocar, el riesgo de que un encargo largo se corte en Windows. Decisión 114, 0.32.0.
timestamp: 2026-09-24T15:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Los dos que faltaban por barrer: GitHub y el puente con el asistente.

## GitHub aguanta

Todo lo suyo sale con reloj, y el reloj funciona: una promesa que **nunca** contesta devuelve lo que
toca en 152 ms sin colgar la barra; una que revienta devuelve «sin sesión»; y una que contesta
**después** del reloj no pisa la decisión ya tomada. Sin sesión ni remoto, el estado es el correcto.
Nada que tocar.

## El puente sí tenía algo

Con textos hostiles —vacío, solo espacios, con saltos, con comillas, de 20.000 caracteres, con
emoji— todo pasa bien menos lo primero: **un texto vacío se mandaba igual**, y abría una
conversación con la caja en blanco.

Ya hay una prueba que vigila que ningún botón mande texto vacío, y viene del fallo que costó tres
versiones —un botón mandaba `undefined` y esa palabra acabó escrita en la caja de Claude—. Pero eso
cuida el lado de quien llama. Ahora se comprueba también donde se sabe de verdad: se devuelve
`vacio`, se apunta por dentro, y no se abre nada.

## Lo que NO se ha tocado, y con números

El puente manda el texto metiéndolo en una URL. Medido: el encargo de ordenar las claves de una
carpeta con 120 ocupa 5.654 caracteres, que codificados dan una **URL de 8.448**. En macOS pasa. En
Windows, `ShellExecute` corta sobre los 2.048 — y `openExternal` devuelve que sí aunque nadie la
recoja, que es el fallo F1 de la auditoría. Ahí el alumno recibiría medio encargo sin que nada lo
diga.

No se arregla a ciegas: poner un tope adivinado mandaría al portapapeles casos que en macOS
funcionan. Queda escrito en la auditoría y en lo pendiente de Windows como una prueba concreta —
pulsar *Que las ordene* en una carpeta con muchas claves y mirar si llega entero—, con la salida ya
identificada por si falla: el portapapeles, que no tiene límite.

## Cómo quedó

0.32.0. `humo.js` **195 comprobaciones**.
