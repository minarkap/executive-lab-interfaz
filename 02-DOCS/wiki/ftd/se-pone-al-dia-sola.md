---
type: ftd
title: La barra se pone al día sola
date: 2026-10-06
status: hecho
---

# La barra se pone al día sola

## Intent

Jose, 06-10-2026: *«haremos el proyecto opensource y en github público, así que podemos hacer que se
actualice solo o con un botón. De hecho, si quieres, hazlo ya»*. Con el botón (decisión 132), quien no lo
pulsa se queda atrás.

## Scope

**Dentro**
- `executiveLab.actualizarSola`, encendido de fábrica. Al pintar la principal, si hay una más nueva, se
  baja, se comprueba y se pone sin esperar a nadie y sin pantalla de espera. Al terminar, la tarjeta dice
  «Ya está puesta… Recargar ahora».
- Si no se puede, se queda el botón de siempre, y no se vuelve a intentar sola hasta la próxima vez que se
  abra el editor.
- En Ayuda › Esta barra: «Que me pregunte antes» y «Que se ponga al día sola».

**Fuera**
- Recargar la ventana sola: cortaría lo que esté haciendo. Se pone y se usa al recargar o al volver a abrir.
- La licencia: el repositorio ya es público, pero sin licencia no es abierto. Es de Jose.

## Checklist

- [x] 1. El ajuste, ponerla sola al pintar, y no insistir si falla — 5 mutaciones, las 5 tumbadas.
- [x] 2. El interruptor en Ayuda, en el diccionario.
- [x] 3. Decisión 136 y todas las comprobaciones en verde — 352.

## Evidence

- `humo.js`: «se pone al día sola, sin pantalla de espera; si no puede, queda el botón y no insiste». 352
  comprobaciones.

## Next

- Quien tenga la 0.44.0 la recibe con «Actualizar ahora»; desde la 0.45.0, sola.
- Publicar primero como prerelease lo que no se haya probado en un ordenador de verdad: ahora llega a todos
  sin un clic.
