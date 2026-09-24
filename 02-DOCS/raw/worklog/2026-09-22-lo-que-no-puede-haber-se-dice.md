---
type: worklog
title: Lo que no puede haber se dice, y cuatro habilidades vuelven a su sitio
description: Revisión del mapeo entero contra Codex y del tema. Tres agujeros, los tres de la misma clase: un cero donde no puede haber otra cosa. Y cuatro habilidades que trae todo arnés salían como escritas a mano. Decisión 109, 0.28.0.
timestamp: 2026-09-22T18:40:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué se miró

Jose pidió dos cosas: que el mapeo entero funcione con Codex, y que el tema se coja bien —logotipo
y colores—. Se montó en temporal una carpeta de Codex como la deja RSC más nuestros raíles
(habilidades en `.codex/rsc`, ayudantes en TOML, `AGENTS.md`, la memoria enganchada, los
interruptores que ponen los raíles, marca con logotipo) y se pasaron por encima los módulos y las
catorce pantallas.

Casi todo estaba bien: el mapa de sitios, las habilidades leídas de `.codex/rsc` y pedidas sin
barra, los ayudantes en TOML leídos enteros, `AGENTS.md` mandando sobre `CLAUDE.md`, los permisos
(«lo lleva tu asistente por su cuenta»), la radiografía sin la línea de Comandos, y el tema idéntico
con los dos asistentes: seis casos, incluido el fondo gris medio que se descarta diciendo por qué.

## Los tres agujeros

Los tres eran lo mismo con tres caras: **la barra enseñaba un cero donde no puede haber otra cosa,
y no lo decía**.

1. La pantalla de Comandos decía «Todavía no hay ninguno. Se van creando conforme repites tareas» y
   ofrecía *Crear un comando*. Con Codex no puede haber ninguno nunca. La principal ya lo explicaba
   —«no trabaja con botones»— y la pantalla a la que se llega desde ella, no.
2. Con Codex no hay frenos. RSC solo se los engancha a Claude: `if (target !== 'claude') return []`
   en su instalador. Así que **no existe el freno ante órdenes peligrosas**, que es el que protege a
   quien no es técnico, y la sección salía con un cero al lado como si faltara algo. Además «Lo que
   tiene apagado» nombraba cuatro piezas que ahí ni se instalan — las apagan nuestros propios
   raíles, que dejan sus interruptores sea cual sea el asistente.
3. `bro`, `eli5`, `show-me` y `unslop` están en el perfil mínimo de RSC —las trae **todo** arnés— y
   no estaban ni en el catálogo de la barra ni en la fontanería. Salían como «instalada aquí, fuera
   del catálogo», que es lo que se le dice a algo escrito a mano en esa carpeta. En esta misma:
   34 instaladas = 27 de serie + 1 del catálogo + 2 propias + esas 4 mal colocadas.

## Qué se hizo

- La pantalla de Comandos dice por qué no puede haber ninguno, y no ofrece crear uno.
- La tabla de asistentes gana una columna, `frenos`, copiada de su instalador. Las reglas lo
  explican en vez de enseñar el cero, el contador cuenta lo que hay dentro, y «Lo que tiene apagado»
  solo nombra lo que en esa carpeta podría estar puesto.
- Y **al cambiar de asistente se dice**: es el momento en que alguien decide quedarse sin frenos.
- Las cuatro habilidades entran en el catálogo con nombre, frase, palabras y `para`.
- La invariante que faltaba, con su prueba: toda habilidad del catálogo cae en un montón y en uno
  solo. 273 = 246 en el catálogo + 27 de fontanería.

## Cómo quedó comprobado

`humo.js` 190 (una nueva, y la de la empresa de Codex ampliada con lo de arriba) ·
`empresas-distintas.js` las tres enteras · `comprobar-diccionario.js` limpio ·
`revisar-powershell.js` sin pegas.
