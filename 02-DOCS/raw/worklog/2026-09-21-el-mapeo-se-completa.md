---
type: worklog
title: El mapeo se completa — todo lo que RSC puede montar tiene nombre y sitio
description: Jose pidió revisar y mapear todo. Se inventarió el paquete RSC 2.0.5 entero y se cruzó con lo que la barra lee. Faltaban 183 habilidades del catálogo, los nombres de lenguaje de los agentes, todo lo que el arnés hace solo sin parar nada, los interruptores en disco, el plan de montaje y las ideas de automatización. Decisión 102, 0.23.0.
timestamp: 2026-09-21T23:59:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«Qué? quiero que revises todo y mapees todo bien»*. Se leyó el paquete `@ericrisco/rsc` 2.0.5
que viaja dentro de la barra —`manifest.json`, `targets/`, `scripts/lib/`, lo que escribe en la
carpeta y lo que engancha en la configuración del asistente— y se cruzó pieza a pieza con lo que la
barra lee y nombra. Salieron seis huecos.

## 1 · El catálogo entero, no una selección

RSC trae **273 habilidades**; la barra nombraba **90**. Las otras 183 salían, si alguien las
instalaba, con el identificador humanizado («Youtube thumbnails») y sin frase, porque la suya está
en inglés y el diccionario la filtra. El comentario de `capacidades.json` lo decía como regla: *«lo
que no esté en esta lista no se le ofrece al alumno»*.

Se revoca: las 273 tienen fila con nombre, frase, palabras y `para`. El diccionario se cumple igual
escribiéndolas en español, y lo que no pega con la clase de carpeta ya tenía dónde caer: plegado, en
*Resto del catálogo*. Una prueba lee el manifiesto del paquete y exige que no quede ninguna sin
nombre.

Las pruebas que ya existían pillaron dos cosas que yo no: 18 nombres empezaban por verbo
(«Escribir una habilidad» → *Habilidad a medida*) y cinco por minúscula («htmx», «n8n», «vLLM»,
«fal.ai», «iOS con Swift»). Ese es exactamente el trabajo de la cuarta regla del diccionario.

## 2 · Los agentes, con el lenguaje por su nombre

Los patrones daban «Revisor de Cpp», «Revisor de Csharp», «Revisor de Mle». Una tabla
`patrones.lenguajes` pone C++, C#, ML en producción, PostgreSQL, PyTorch…; lo que no está se
humaniza como antes. Y `spec-miner`, el único agente fuera de las dos familias, es **Extractor de
especificación**.

## 3 · Lo que hace solo, sin parar nada

Los guardianes eran lo único enganchado que se nombraba, pero el arnés hace más cosas por su cuenta
y ninguna para a nadie: la brújula al abrir, el aviso del diario al cerrar, la puerta antes de
construir, la recogida de copias de trabajo, la memoria entre conversaciones, `context7` y las tres
comprobaciones de arranque. Nueve, en el mismo desplegable que los guardianes, con su estado leído
del disco igual que ellos.

## 4 · Lo apagado, junto y en español

La radiografía leía `optOuts` de `.rsc.json` y lo enseñaba en clave. Lo que cada pieza mira de
verdad son los interruptores `.rsc/.no-*`, y aquí hay cinco. *Lo que tiene apagado* une las dos
fuentes sin repetir: «Formato al guardar en git · Recogida de copias de trabajo · La revisión
periódica de habilidades · El aviso de arnés duplicado · Documentación al día (context7)».

## 5 · El plan de montaje se puede abrir

`installation-plan.md` y `onboarding.acceptedAt` no se leían. Ahora *El asistente, montado aquí*
dice «Listo, desde el 21 de septiembre» y una pieza abre el plan al lado.

## 6 · Las ideas que el asistente apunta y nadie leía

`skill-scout` escribe en `.rsc/automation-gaps.md`; los `proposed-` son propuestas pendientes.
Sugerencias las cuenta y ofrece leerlas.

## Qué quedó tocado

`extension/media/capacidades.json` (59 → 242 filas) · `extension/media/nombres.json` (automatismos,
lenguajes, `spec-miner`) · `extension/src/{nombres,reglas,terreno,consejos,extension,saberes}.js` ·
`extension/media/panel.js` · `extension/prueba/humo.js` (dos comprobaciones nuevas, tres ajustadas) ·
`docs/diccionario.md` (17 filas) · `docs/decisiones.md` (102).

## Cómo quedó

0.23.0. `humo.js` **181 comprobaciones**, `empresas-distintas.js` las tres enteras,
`comprobar-diccionario.js` limpio, `revisar-powershell.js` sin pegas.

## Lo que se deja sin cara, y por qué

El sello de revisión (`.rsc/sello*`) es opcional y aquí no está activado; `eval-sandbox/`,
`.base-versions.json` y los adaptadores de memoria son fontanería sin decisión que enseñar. Quedan
anotados en el diccionario como «no se nombran», que es distinto de olvidarlos.
