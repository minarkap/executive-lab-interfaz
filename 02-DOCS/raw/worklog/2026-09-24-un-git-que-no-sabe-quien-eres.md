---
type: worklog
title: Un git que no sabe quién eres no es un callejón
description: Un ordenador recién estrenado trae git sin nombre ni correo. En una carpeta que ya tenía git, el primer «Guardar en git» acababa en «Pulsa Algo va mal». Ahora se resuelve solo, y sin tocar el git de nadie. Decisión 112, 0.31.0.
timestamp: 2026-09-24T13:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Siguiendo en autopilot, buscando fallos en lo que un alumno usa **a diario**. Primero se probó
guardar contra casos raros —sin nada que guardar, nombres con comillas y acentos, mensaje vacío,
mensaje de 3.000 caracteres— y todo aguantó.

Y se probó una interacción que podía ser grave: la barra escribe el mensaje de la copia, y el
guardián de gitmoji exige un formato. No se cruzan nunca: ese guardián es un enganche de Claude
sobre **Bash**, y la barra llama a git directamente. Verificado, no supuesto.

## El fallo

Un Mac recién estrenado trae git **sin nombre ni correo**. Eso lo configura cada uno la primera vez
que usa git, y alguien que no es técnico no lo ha hecho nunca.

`historial.iniciar()` los pone, pero **solo cuando el historial lo creamos nosotros**. En una
carpeta que ya tenía git —el caso brownfield, que es medio proyecto— nadie los ponía. El primer
«Guardar en git» se caía con *«Please tell me who you are»*, y el alumno recibía:

> No puedo guardar copias en este ordenador. Pulsa "Algo va mal".

Un callejón, por algo que se arregla con una orden. Justo lo que ya se decidió con git en la
decisión 26: *«díselo a tu tutor» no es una salida para quien está solo delante de la pantalla*.

## Qué hace ahora

Si el guardado se cae por falta de identidad, se pone la del arnés —la misma que ya usa el
instalador, para que haya una sola verdad— y se reintenta. Transparente: se ve «Copia guardada».

**Solo en esa carpeta**, nunca en todo el ordenador. Quien sí tenga su git configurado no se entera
de nada y el suyo se queda igual (P4). Hay comprobación que lo exige, y se verificó a mano que el
git de Jose no se movió.

## Cómo quedó

0.31.0. `humo.js` **194 comprobaciones**, la nueva verificada por mutación.
