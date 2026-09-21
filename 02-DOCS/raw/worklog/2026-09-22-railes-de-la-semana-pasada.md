---
type: worklog
title: Unos raíles de la semana pasada se ven, y se reponen solos
description: La auditoría encontró que los raíles se copian al montar, así que toda carpeta anterior corre reglas viejas. Con el protocolo de credenciales recién escrito, ninguna carpeta lo conocía. Decisión 108, 0.28.0.
timestamp: 2026-09-22T05:20:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

De la auditoría que pidió Jose salió esto como lo que más pesaba, y se atacó.

Los raíles —la habilidad que fija el español y el vocabulario, y los cuatro comandos— los copia el
wizard **al montar**, con los que llevara la barra ese día. Cuando la barra sube de versión, las
carpetas montadas antes se quedan con las reglas de entonces.

Es la fricción **F13**, ya escrita en la auditoría. Lo que la vuelve grave hoy: las reglas nuevas
son las de credenciales (104 y 105), así que **toda carpeta montada antes le está dando al
asistente un protocolo que no las menciona**. Y esta misma carpeta era una: se comprobó y lo era.

## Lo que fallaba de la comprobación

`comoEstanLosRailes()` solo miraba si el fichero **existe**. «Puesto» quería decir «hay algo ahí»,
no «es lo de ahora». Ahora compara el contenido —no una fecha ni un número, que es lo único que no
miente si alguien lo edita a mano— y hay un tercer estado: **«Puesto, pero de una versión anterior
de la barra»**, con su botón *Ponerlo al día*.

## Y se reponen solos

Al abrir, si no son los de ahora, se reponen sin preguntar y en silencio. **Reponer no es
decidir**: es dejar la carpeta con lo que ya declaró tener. Es lo mismo que hace `repair`, y los
raíles son nuestros —`aplicar.js` ya los sobrescribe enteros en cada montaje—, así que no se pisa
nada de nadie.

Callado a propósito: si sale bien no hay nada que contarle a quien no sabe qué es un raíl; si sale
mal, la lista de piezas lo dice con su botón. Queda apuntado en el registro interno, que acaba en
el informe de «Algo va mal» (P3).

## Qué quedó tocado

`extension/src/{terreno,arrancar,extension}.js` · `extension/prueba/humo.js` (una nueva) ·
`docs/decisiones.md` (108).

## Cómo quedó

0.28.0. `humo.js` **189 comprobaciones**, la nueva verificada por mutación. Empresas, diccionario y
PowerShell en verde. Y comprobado contra esta carpeta de verdad: decía «al día: false» y la pieza
salía con su botón.
