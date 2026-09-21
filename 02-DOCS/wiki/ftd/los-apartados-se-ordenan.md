---
type: ftd
title: Los apartados se ordenan y el mapeo se cierra
date: 2026-09-21
status: hecho
---

# Los apartados se ordenan y el mapeo se cierra

## Intent

Jose repasó el mapeo arnés → barra y pidió cinco cosas: que Habilidades y Comandos se
segmenten por lo que importa (lo instalado junto, lo del arnés plegado al final, el catálogo en
sugerencias y resto), que los guardianes bajen sin desaparecer, que Sugerencias ofrezca mirar si
hace falta un agente cuando no hay ninguno, que `inbox` y `out` acompañen a sus rótulos como hacen
`tools` y `skills`, y que se cierren los dos huecos del mapeo (lecciones y `optOuts`). Y una
incoherencia vista de paso: la radiografía tiene tres nombres.

## Scope

**Dentro**

- `pantallaSaberes`: Instaladas (propias + catálogo + fuera del catálogo, con el origen en la (i))
  · Sugerencias del catálogo · Resto del catálogo (plegado) · Las del arnés (plegado, al final).
  Los datos de `saberes.js` no cambian: es la pantalla la que junta los montones y pone el origen.
- `pantallaComandos`: *Los del arnés* plegados.
- `pantallaReglas`: *Lo que se comprueba solo* plegado y al final, con la frase que ata el aviso
  en inglés con esta pantalla.
- `pantallaSugerencias`: botón *Ver si te vendría bien un agente* cuando no hay agentes.
- Rótulos: *Darle documentos (inbox)*, *Resultados (out)*, «coincidencias» en la búsqueda, y la
  miga de la radiografía dice *Qué falta por montar*.
- Lecciones de RSC dentro de *Cómo te habla*; `optOuts` como pieza de la radiografía.
- Diccionario y decisión 101.

**Fuera, a propósito**

- Un disparo determinista que sugiera un agente solo (heurística no acordada).
- Esconder las del arnés: revocado por la decisión 98.
- Los cambios sueltos que ya había en el árbol al empezar (`.claude/settings.json`, `.rsc.json`,
  `user-profile.md`, `commands/ayuda.md`, `commands/empezar.md`): no son de esta feature.

## Checklist

- [x] Habilidades en cuatro bloques y en ese orden — `humo.js` pinta la pantalla y comprueba el orden.
- [x] Origen en la (i) de cada instalada — la pantalla pintada contiene «Tuya», «Del catálogo».
- [x] Comandos del arnés plegados — `<details>` con «Los del arnés» en lo pintado.
- [x] Guardianes plegados y al final de Las reglas — después de «Cómo se trabaja aquí» y de los botones.
- [x] Botón de agente en Sugerencias sin agentes — pintado con `hayAgentes: false`, ausente con `true`.
- [x] Rótulos con `(inbox)` y `(out)` en todos los sitios — `grep` sin restos del rótulo viejo.
- [x] «coincidencias» en la búsqueda — `grep` sin «resultados» en `pantallaResultados`.
- [x] Miga de la radiografía = «Qué falta por montar» — lo pintado no contiene «Qué hay aquí».
- [x] Lecciones dentro de Cómo te habla — la pantalla pinta «Lo que ha aprendido de ti» y una lección de prueba.
- [x] `optOuts` en la radiografía — pieza «Lo que tiene apagado», estado `noAplica`, sin arreglo.
- [x] Diccionario al día y `comprobar-diccionario.js` limpio.
- [x] `humo.js`, `empresas-distintas.js` y `revisar-powershell.js` en verde.

## Evidence

Todo observado el 21-09-2026 sobre la rama `los-apartados-se-ordenan-y-el-mapeo-se-cierra`.

- Bloques, origen, comandos, guardianes, agente y miga: una comprobación nueva en `humo.js` con
  datos de mentira y todos los montones llenos —
  `✓ los apartados de habilidades, comandos y reglas van en el orden acordado — instaladas ·
  sugerencias · resto · arnés, y los guardianes al final`.
- Lecciones: entrada `trato con lecciones` en `cada pantalla pinta algo con los datos de verdad` —
  `✓ … 26 pantallas, y los mensajes raros se ven` (antes eran 25).
- `optOuts`: la empresa de mentira declara `optOuts: ['gitmoji']` y el test de la radiografía exige la
  pieza — `✓ lo que el arnés dice de sí mismo llega a la pantalla, no se tira — 14 piezas con el
  arnés roto`.
- Rótulos: `grep -n "Qué hay aquí|etiqueta: 'Resultados'|>Resultados<|etiqueta: 'Darle
  documentos'|'{n} resultados'" extension/media/panel.js extension/src/*.js` → solo un comentario
  que cuenta el nombre viejo.
- Diccionario: `node docs/comprobar-diccionario.js` → `27 palabras prohibidas · 46 ficheros y 45
  rótulos revisados · Todo el texto de pantalla respeta el diccionario.`
- Suites: `node extension/prueba/humo.js` → `179 comprobaciones pasadas` (la nueva sustituye en
  número a ninguna: se añadió una y se ampliaron dos existentes). `node
  extension/prueba/empresas-distintas.js` → `las tres empresas, enteras`. `node
  herramientas/revisar-powershell.js` → `4 ficheros revisados, sin pegas`.

## Next

Nada pendiente de esta feature. Decide Jose si se guarda en git y si la versión de la barra sube.
Fuera quedó, a propósito, un disparo determinista que sugiera un agente solo.
