---
type: worklog
title: Ningún raíl manda correr npx sin versión
description: El comando save-session del arnés manda correr su paquete sin versión fijada, y eso bajaría la 2.0.13 en una clase que corre la 2.0.5. Cuatro de los cinco sitios son suyos y se reescriben solos, así que la regla va a la habilidad. Decisión 110, 0.28.0.
timestamp: 2026-09-24T10:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## De dónde salió

Mirando otra cosa. El arnés fue avisando durante toda la sesión de que convenía compactar, se miró
qué pedía exactamente, y por el camino apareció que su comando `/save-session` le dice al asistente:
«corre el paquete del arnés con `npx`» — sin número de versión.

Eso hoy baja la **2.0.13**. Esta clase corre la **2.0.5 fijada**, y la razón de fijarla es que toda
la cohorte tenga el mismo catálogo. Basta con pulsar ese comando una vez.

Y choca con la decisión 6, que quitó `npx` a propósito: en Windows es un `.cmd`, tarda y necesita
red.

## Lo que se podía arreglar y lo que no

Cinco sitios. **Cuatro son comandos de RSC** —`/save-session`, `/resume-session`, `/learn`,
`/checkpoint`— y los reescribe entero en cada actualización: editarlos es escribir en agua, como ya
está dicho de sus ficheros de siempre.

Así que la regla va donde él no toca: la habilidad `executive-lab`, regla 7. Prohibido correr el
paquete sin versión, y en su lugar, por este orden: lo que ya está instalado en la carpeta
(`node .rsc/session-memory.mjs …`, local y sin red) o el paquete con la versión que declare
`.rsc.json`. Se comprobó que el mecanismo local responde de verdad antes de escribirlo.

El quinto sí era nuestro —el raíl `seguir`, que mandaba correr `memory resume` con `npx`— y se
arregló.

## Y un barrido, para que no vuelva

Una prueba recorre todos los `.md` de `skills/` y falla si alguno manda correr el paquete sin
versión o pide la última publicada. Cazó el raíl `seguir` antes de que lo arreglara, que es la
única manera de saber que una prueba sirve.

## Lo que queda vivo

`.claude/settings.json` está versionado, y el instalador le reescribe los enganches con la **ruta
absoluta del Node de esta máquina**. En el ordenador de un alumno es lo correcto —no hay ningún
`node` en el PATH—, pero en un repositorio compartido significa que al guardar se publica una ruta
que en otra máquina no existe. Ese fichero se dejó fuera de la copia, y la decisión es de Jose:
excluirlo de git o que el instalador escriba algo que no dependa de la máquina.
