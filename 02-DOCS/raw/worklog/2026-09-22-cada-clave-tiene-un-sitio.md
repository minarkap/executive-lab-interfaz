---
type: worklog
title: Cada clave tiene un sitio, y la barra sabe cuál
description: Las claves de Jose vivían en un .env.local de la raíz y dentro de una herramienta, y la barra no las veía: decía «faltan claves» de lo que funcionaba y no enseñaba proveedores enteros. Ahora las inventaría, sabe de quién es cada una por su prefijo, y le da el plan hecho al asistente. Más un botón de Resolver una incidencia. Decisión 104, 0.25.0.
timestamp: 2026-09-22T01:10:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose, con una captura de un proyecto suyo: *«las claves no están en el `.env` de las tools sino en
un `.env.local`, ya sea de las tools o en global»* · *«hay que conseguir un mapeo muy bueno con las
posibilidades de RSC»* · *«debería haber un botón donde ponga resolver incidencias […] y el
asistente audita todo»*.

## 1 · El sitio lo define RSC, y el prefijo dice de quién es

`skills/harness` y su `_TEMPLATE`: una carpeta por proveedor en `01-TOOLS/`, con `.env`,
`.env.example`, `CREDENTIALS.md`, `README.md` y `test_connection`; variables
`<HERRAMIENTA>_<NOMBRE>`. Eso es lo que hace útil el desorden: `PEXELS_API_KEY` dice a dónde va.

## 2 · De contar a inventariar

`sueltas.js` contaba ficheros de la raíz. Ahora encuentra todos los `.env*` —raíz, carpetas de
primer nivel, `config/`… y dentro de cada herramienta los que no son su `.env`, que también son
invisibles—, lee solo los nombres, y reparte: por el `.env.example` que ya la espera, o por el
prefijo, saltando los del framework (`NEXT_PUBLIC_`, `VITE_`). Lo que no dice de quién es se
pregunta. El encargo al asistente lleva el plan hecho y la orden de mirar qué las lee antes de
mover.

## 3 · «Puesta, pero fuera de su sitio» y «Por montar»

Una clave que la herramienta espera y está en otro fichero —o exportada en el ordenador— no falta:
está mal guardada, y ahora se dice así. Y los proveedores que existen por sus claves y no tienen
carpeta (Pexels, Drive) salen como **Por montar**, con el botón que se los pide al asistente. Al
montar el arnés, si la carpeta ya traía claves, el plan viaja en el primer mensaje.

## 4 · Resolver una incidencia

En Ayuda, con opciones hechas. El alumno pone el síntoma; la barra, el diagnóstico —piezas que
faltan, conexiones a medias, claves fuera de sitio con su reparto, frenos apagados—. Van juntos, y
el encargo manda repasar la carpeta entera y contar antes de tocar.

## Qué quedó tocado

`extension/src/{sueltas,conexiones,encargos,extension}.js` · `extension/media/panel.js` ·
`skills/executive-lab/SKILL.md` y su copia en `media/railes/` · `extension/prueba/humo.js` (dos
nuevas) · `docs/diccionario.md` · `docs/decisiones.md` (104).

## Cómo quedó

0.25.0. `humo.js` **185 comprobaciones**, las tres empresas, diccionario limpio. La suite pilló tres
fallos: el raíl editado en la copia y no en la fuente, y dos aserciones mías mal puestas.

## Pendiente, a petición de Jose

Las credenciales que no son variables: cuentas de servicio `.json`, `.pem`, `.p12` → a
`01-TOOLS/<X>/keys/`. Escrito en el documento de feature con cómo se haría.
