---
type: analysis
title: Gate de consistencia — todo-cuadra
description: Cruce de la constitución (con la enmienda de P4), la spec, el plan y sus tareas antes de escribir código. La primera pasada salió bloqueada por un alto contra P4; la segunda pasa.
timestamp: 2026-09-24T16:40:00Z
topic: sdd
slug: todo-cuadra
---

# Gate de consistencia — todo-cuadra

**GATE: PASS** en la segunda pasada: 0 críticos · 0 altos · 0 medios. Queda un bajo aceptado a
conciencia (#13).

La primera pasada salió **BLOCKED**: 1 alto, 8 medios y 6 bajos, todos resueltos en `tasks` sin
tocar el alcance ni un criterio. La tabla de resolución está al final.

Artefactos leídos:
- [la constitución](../constitution.md), P1–P8 con la enmienda de P4 del 24-09-2026;
- [la spec](../specs/todo-cuadra.md), con los criterios A1–I3 y las aclaraciones C-1 a C-20;
- [el plan](../plans/todo-cuadra.md), §0–§7 y las tareas T001–T075.

## Mapa de cobertura

| Criterio | Qué pide (corto) | Plan | Tareas | Estado |
|---|---|---|---|---|
| A1 | «Un poco de todo» monta | §3 `rumbo`, §5 | T008, T010 | cubierto |
| A2 | Todo tamaño de «Construir algo» monta | §3, §5 | T008, T010 | cubierto |
| A3 | Suelo a medias: raíles y botón; deshecho, fallo | §3 `aplicarPlan` | T009, T010 | cubierto |
| A4 | Cuatro escalones, como en «Cómo te habla» | §4 | T012 | cubierto |
| A5 | Objetivos de carpeta empezada | §4 | T025 | cubierto |
| A6 | Primer mensaje: perfil, freno, una pregunta cada vez, de quién es la carpeta | §4 | T026 | cubierto |
| A7 | Ningún encargo solo en el registro | §4 | T026 | cubierto |
| A8 | Recuento de preguntas verdadero | §3 `rumbo` | T067 | cubierto |
| A9 | Sin asistente: botón para ponerlo | — | T027 | cubierto |
| A10 | Objetivo entero con cualquier carácter | §3 `planEnSeco` | T011 | cubierto |
| A11 | En «irá creciendo», guardar en español no se deniega | §3 `railes` | T013 | cubierto (depende del veto de T005) |
| A12 | Plan distinto al volver a montar, con su sí | §4 | T029 | cubierto |
| B1 | No se prepara la carpeta personal ni las del sistema; la nueva, dentro de la personal | §3 `terreno` | T015 | cubierto |
| B2 | Clon reconocido y traído | §3 `terreno` | T016 | cubierto; el montaje de verdad, ver #9 |
| B3 | Seguir sin copias monta | §3 `rumbo` | T017 | cubierto |
| B4 | Carpeta ajena: resumen, sí, choques | §3 `carpetaAjena` | T018 | cubierto |
| B5 | Versión más nueva: se dice, no se baja | §3 `rumbo` | T019 | cubierto |
| B6 | Historial: la barra no escribe por su cuenta; lo que pide la persona es suyo; un clon cuenta como de la barra | §3 `terreno` | T020 | AMBIGUO (#5) |
| B7 | Toda rama deja historial; la radiografía no miente | §3 `rumbo` | T017, T021 | cubierto |
| B8 | Montaje nuestro a medias va a completar | §3 `terreno` | T022 | cubierto |
| B9 | Carpeta anidada y varias raíces | §3 `terreno` | T023 | cubierto |
| B10 | Punto de partida que falla | §4 | T028 | cubierto |
| B11 | Dial y asistentes de hoy, salvo que se cambien en ese montaje | §4 | T024 | cubierto (#15) |
| B12 | Lo escrito bajo la sombra de RSC es suyo | — | T030 | cubierto |
| C1 | Freno con la lista cerrada; Codex y perfil técnico dichos | §3 `freno.mjs` | T035, T036 | AMBIGUO (#4) |
| C2 | Sin Node corren las piezas; si no, se dice con botón; fuera del proyecto | §2, §3 `relevo` | T032, T033 | HUECO parcial (#3) |
| C3 | El ajuste versionado queda como en el repositorio | §4 | T033 | cubierto |
| C4 | No se ofrece actualizar el arnés | — | T034 | cubierto |
| C5 | Lo apagado, sin repetir; la memoria apagada | — | T037 | cubierto |
| C6 | Los frenos no dependen de la última orden | §3 | T038 | cubierto |
| D1 | Raíles en contexto: Claude por importación, Codex por su fichero | §2, §3 `railes` | T040 | cubierto |
| D2 | Órdenes del arnés con la versión de la clase; instalar no cambia la versión | §0, §3 | T041 | HUECO parcial (#2) |
| D3 | Sin ficheros ausentes; la lista completa de palabras | — | T042 | cubierto (orden, #6) |
| D4 | Codex: habilidad propia, no comando | — | T043 | cubierto |
| D5 | El mismo dial para la barra y el asistente | — | T044 | cubierto |
| D6 | Raíles viejos, por cualquiera de sus piezas | — | T045 | cubierto |
| E1 | Cambiar sustituye con quién se habla y suma lo montado | §3 `conQuien` | T048, T049 | cubierto |
| E2 | Dos asistentes, dos raíles, una respuesta | §3 `conQuien` | T047, T050 | cubierto |
| E3 | Formatos de otros asistentes | — | T051 | cubierto |
| F1 | Sin credenciales en la copia, por los tres caminos | §3 `historial` | T053, T054 | cubierto (#14) |
| F2 | Ninguna pantalla ni informe enseña una credencial entera | — | T055 | HUECO parcial (#1) |
| F3 | Clave con cualquier carácter, entera y sin ejecutarse | §3 `conexiones` | T056 | cubierto |
| F4 | Guiones que corren; si falta un programa, se dice | — | T057 | cubierto |
| F5 | Primera copia sin rutas de este ordenador | §4 | T033 | cubierto |
| G1 | «Resolver una incidencia» abre el encargo | — | T059 | cubierto |
| G2 | El arnés y los módulos que lleva la barra | — | T060 | cubierto |
| G3 | La salud, por el diagnóstico; nombres, no rutas | §3 `salud` | T061 | cubierto (#12) |
| G4 | No instalada si no está en disco | — | T062 | cubierto |
| G5 | Comandos del arnés con nombre y en su montón | — | T063 | cubierto |
| G6 | Preguntas sin contestar del arnés; el andamio fuera | §3 `huecos` | T064 | cubierto (#12) |
| G7 | «Listo» como lo daría el arnés | — | T065 | cubierto |
| H1–H6 | Documentación, diccionario, repositorio | — | T067–T071, T006 | cubierto |
| I1 | Contrato de respuestas; los casos SDD se montan | §5 | T008, T009 | cubierto |
| I2 | Todos los mensajes del panel | §5 | T059 | cubierto |
| I3 | Montajes de verdad por clase de carpeta | §5 | T009, T018, T073 | HUECO parcial (#9) |

**Deriva**: ninguna. Cada tarea responde a un criterio o a una decisión de Jose, y ninguna sección
del plan construye algo que la spec no pida.

## Hallazgos

| # | Sev | Tipo | A (dónde) | B (dónde) | Qué choca | Se resuelve en |
|---|---|---|---|---|---|---|
| 1 | MEDIO | Hueco | spec F2 («ninguna pantalla ni informe») | T055 (solo el token al subir) | F2 se amplió en `clarify` y ninguna tarea comprueba lo demás. La barra pinta la salida de las consultas de cada herramienta, y un guion que imprima una clave la enseñaría entera. No hay prueba de que hoy pase, porque la salida de los guiones no va al informe | `tasks`: una tarea que tape los valores de las claves conocidas en lo que se pinta y en el informe, con prueba |
| 2 | MEDIO | Hueco | spec D2 («instalar una habilidad no cambia la versión») | T041 (solo el texto de los raíles) | Nadie comprueba que instalar desde la barra deje `catalogVersion` en la versión de la clase | `tasks`: añadirlo a la comprobación de T041 o T062 |
| 3 | MEDIO | Hueco | spec C2 («si no se consigue, la pieza lo dice, con botón») | T032, T033 | Las comprobaciones solo cubren el caso bueno. La pieza de la radiografía que dice si los enganches encuentran `node` aparece en el texto de T033, pero no en su «Hecho cuando» | `tasks` |
| 4 | MEDIO | Ambiguo | spec C1 (lista cerrada de seis órdenes) | T035 (solo `rm -rf`) | La comprobación no recorre la lista que la spec fija para `verify` | `tasks` |
| 5 | MEDIO | Ambiguo | spec B6 (lo que pide la persona es suyo; un clon es de la barra) | T020 (solo la identidad global) | Dos de los tres casos de B6 no tienen comprobación | `tasks` |
| 6 | MEDIO | Orden | T042 (F4) | T068 (F8) | T042 depende de una tarea que va cuatro fases después | `tasks`: adelantar la parte de T068 que exporta `palabrasProhibidas()` |
| 7 | **ALTO** | Constitución (P4) | spec C-4 (en carpetas con historial ajeno, lo nuevo que toca sus ficheros se ofrece, no se pone en silencio) | T040 («si hay uno ajeno, se añade») y T035 (el enganche del freno) | Los raíles se reponen solos al abrir (decisión 108). Tal como están escritas, las dos tareas meterían el bloque de `CLAUDE.md` y el enganche del freno en los ficheros de alguien sin su sí. Solo T053 recoge C-4 | `tasks`: C-4 en el texto y en la comprobación de T035 y T040 |
| 8 | MEDIO | Ambiguo | autopilot (se para en la parada de vocabulario y en cuatro casos más) | T032 (3) («a mano, con Jose») | Hay un paso con Jose dentro del autopilot que no está entre las paradas | `tasks` o `plan`: decidir con (1) y (2), y pasar (3) a pendientes con Jose, sin bloquear |
| 9 | MEDIO | Hueco | spec I3 («un clon real», montaje de verdad) | T016 (fixture) | El clon se prueba con un fixture y no con un `git clone` de un montaje de verdad | `tasks`: en T016 o T073, montar con `humo+`, clonar y abrir |
| 10 | BAJO | Contradicción | T004 (`verifications/todo-cuadra-analyze.md`) | `analyze` (canónico: `analysis/<slug>.md`) | El informe va donde dice la fase | `tasks`: corregir el «Hecho cuando» de T004 |
| 11 | BAJO | Duplicación | T005 (lo aprobado entra en el diccionario) | T007 (las palabras del tamaño y los escalones) | Las dos meten palabras en el diccionario | `tasks`: T007 solo comprueba que las de F1 están |
| 12 | BAJO | Portador | plan §3 (`rsc.salud`, `cerebro.huecos`) | T061, T064 | Dependen de formatos de RSC y no llevan su bloque de Interfaces | `tasks` |
| 13 | BAJO | Contradicción | plan §0 (Co-Authored-By) | habilidad `ship` de RSC (autoría de Eric, sin firma de IA) | La convención de RSC no es la de esta casa. Aquí `ship` no corre: el programa se para antes | Anotado; nada que resolver |
| 14 | BAJO | Ambiguo | spec F1 (tres caminos) | T054 (prueba el botón) | El guardado automático usa la misma función; el asistente queda cubierto por T053. Basta con decirlo | `tasks` (una línea) |
| 15 | BAJO | Ambiguo | spec B11 («salvo que los cambie en ese montaje») | T024 | No se prueba la excepción | `tasks` (una línea) |

**Del hallazgo #7.** Es el único que va contra la constitución. Sin él, el arreglo de D1 metería
un bloque en el `CLAUDE.md` de un proyecto ajeno la primera vez que la barra abriera la carpeta.

## Lo que se miró y está bien

- **P1**: toda pantalla nueva trae su botón. Codex sin freno se dice sin botón, igual que hoy
  (decisión 109), y P1 se comprueba sobre las piezas de la radiografía. Se deja como está.
- **P2**: la parada T005 va antes de pintar nada, y la lista reutiliza lo que ya existía.
- **P3, P5 y P6**: sin choques.
- **P7**: la copia del freno entra como un sitio más donde está escrita la versión.
- **P8**: el relevo y el Node descargado viven fuera de la carpeta del alumno. Las pruebas escriben
  solo en temporales.
- **§0**: los valores literales están.
- **Interfaces**: los portadores de T010, T018, T035, T047 y T054 están.

## A quién va cada arreglo

- **`tasks`**: los hallazgos #1 a #12, #14 y #15, todos en la tabla de tareas del plan. Ninguno
  cambia el alcance ni un criterio.
- **`constitution`**: nada. La enmienda de P4 ya está hecha y el #7 la aplica.
- **`clarify` / `specify`**: nada.

Arreglado lo de `tasks`, se vuelve a pasar el gate.

## Segunda pasada (24-09-2026)

Se volvió a cruzar el plan corregido con la spec y la constitución. Cada hallazgo, con su
resolución:

| # | Resolución en el plan | Queda |
|---|---|---|
| 1 | **T076** nueva: tapar los valores de las claves conocidas en lo que se pinta de una consulta y en el informe, con dos pruebas | cerrado |
| 2 | **T062** comprueba además, en `contrato`, que instalar desde la barra deja `catalogVersion` en 2.0.5 | cerrado |
| 3 | **T033** comprueba además la pieza «No arranca en este ordenador» con su botón | cerrado |
| 4 | **T035** recorre las seis órdenes de C1 | cerrado |
| 5 | **T020** tiene tres comprobaciones: la identidad global, el botón en un historial ajeno y el clon | cerrado |
| 6 | **T077** nueva, en F4: exporta `palabrasProhibidas()`. T042 y T068 dependen de ella | cerrado |
| 7 | **T035 y T040** llevan C-4 en el texto y en la comprobación: al reponer en un historial ajeno, nada sin su sí | cerrado |
| 8 | **T032**: se decide con las medidas (1) y (2); la (3) pasa a pendientes con Jose y no bloquea | cerrado |
| 9 | **T016** monta de verdad, clona y abre | cerrado |
| 10 | **T004** apunta a `analysis/todo-cuadra.md` | cerrado |
| 11 | **T007** solo comprueba las palabras que ya aprobó T005 | cerrado |
| 12 | **T061 y T064** llevan su bloque de Interfaces con las formas de RSC | cerrado |
| 13 | La autoría de `ship` frente al Co-Authored-By: `ship` no corre en este programa | aceptado a conciencia |
| 14 | **T054** dice que el guardado automático pasa por la misma función, y que el asistente queda cubierto por T053 | cerrado |
| 15 | **T024** prueba también la excepción | cerrado |

Ni deriva nueva ni contradicción nueva: T076 y T077 responden a F2 y a D3/H2.

```json result-envelope
{
  "status": "complete",
  "executive_summary": "GATE: PASS en la segunda pasada. La primera dio 1 alto contra P4, 8 medios y 6 bajos, todos resueltos en tasks (T076 y T077 nuevas y catorce comprobaciones afinadas). Queda un bajo aceptado.",
  "artifact": "02-DOCS/wiki/sdd/analysis/todo-cuadra.md",
  "next_recommended": "implement",
  "risk": "medium",
  "skill_resolution": {
    "used": ["analyze"],
    "missing": [],
    "fallback": [],
    "compact_rules": ["Leer cruzando artefactos, no dentro de uno.", "Un hallazgo sin dónde es una opinión."]
  },
  "evidence": ["informe escrito", "mapa de cobertura de A1–I3", "el alto señalado con los dos sitios"]
}
```
