---
type: progress
title: Progreso — todo-cuadra
description: Registro de solo añadir, una línea por tarea, con su evidencia observada. Sobrevive a una compactación.
timestamp: 2026-09-24T16:50:00Z
topic: sdd
slug: todo-cuadra
---

# Progreso — todo-cuadra

Rama `todo-cuadra`, desde `main` (2b139bc). Plan: [../plans/todo-cuadra.md](../plans/todo-cuadra.md).
Solo se añade.

## F0

- **T001 ✓** 24-09 · `ListAgents` sin sesiones de `interfaz-arnes` (las dos de hoy, `-0a` y `-5c`,
  ya habían terminado) · `git switch -c todo-cuadra` desde `main` = `origin/main` = 2b139bc ·
  `git status --short` vacío.
- **T002 ✓** 24-09 · Línea base:
  - `node extension/prueba/humo.js --con-arnes` → **198 comprobaciones pasadas**, código 0.
    Salen dos «SALTADA»: «el motor de JavaScript sigue sirviendo de resto» y «cada capacidad que
    ofrecemos existe en el catálogo de verdad». La segunda es la prueba muerta de H2: mira un
    manifiesto que no existe.
  - `node extension/prueba/empresas-distintas.js` → «las tres empresas, enteras».
  - `node docs/comprobar-diccionario.js` → «27 palabras prohibidas · 47 ficheros y 45 rótulos
    revisados · Todo el texto de pantalla respeta el diccionario».
  - `node herramientas/revisar-powershell.js` → «4 ficheros revisados, sin pegas».
  - `git log 2b139bc..` vacío: ningún hallazgo arreglado por otra sesión desde la auditoría. C3
    queda mitigado por 2b139bc (`--skip-worktree`).
- **T003 ✓** 24-09 · Escritas la propuesta, la spec, `clarify`, el plan y las tareas:
  - `spec-gate.js specs/todo-cuadra.md` → PASS, con 10 puntos tipados;
  - la revisión con ojos frescos encontró diez cosas, y se arreglaron todas (C-13 a C-20);
  - P4 enmendada en la constitución (decisión 3 de Jose).
- **T004 ✓** 24-09 · `analyze`:
  - primera pasada BLOCKED, con 1 alto contra P4, 8 medios y 6 bajos;
  - todo se resolvió en `tasks`: T076 y T077 son nuevas, y hay catorce comprobaciones afinadas;
  - segunda pasada **GATE: PASS**, en `analysis/todo-cuadra.md`.
- **T005 ⏸** 24-09 · Parada de vocabulario: la lista está en la spec («Vocabulario propuesto»), a la
  espera del sí de Jose.
- **T005 ✓** 25-09 · Jose contestó en cuatro rondas:
  - gitmoji apagado en las carpetas de alumno;
  - la puerta SDD se queda;
  - tres preguntas fáciles en vez del tamaño (C-21), con el recorrido entero a decisión del
    programa;
  - los demás textos con su criterio, y las pantallas se le enseñan al cerrar cada fase (C-22).

  La spec, el plan (§3, §4, T008, T010) y `sdd/decisions.md`, al día. Se añade el criterio A13.
- **T006 ✓** 25-09 · Commit b49735c, «Todo cuadra: la auditoría entera, y el plan para arreglarla»:
  - decisión 116 en `docs/decisiones.md`, su resumen en `harness/decisions.md` y el worklog
    `2026-09-25-todo-cuadra-la-auditoria.md`;
  - toca once ficheros, todos de `02-DOCS/` y `docs/`, y ningún código.

  **Corrección:** el mensaje del commit dice «spec con 58 criterios» y son **61** (`grep -cE
  "^- \*\*[A-I][0-9]+\.\*\*"` sobre la spec). El commit no se enmienda: la cuenta buena queda aquí.

## F1

- **T007 ✓** 25-09 · Nueve filas nuevas en `docs/diccionario.md`, junto a «Preparar esta carpeta»:
  - las tres preguntas nuevas, con sus respuestas y sus ejemplos;
  - las tres que ya se hacían y no estaban (de qué va, cómo te manejas, cuánto te explico), y esta
    última con los cuatro escalones de «Cómo te habla»;
  - el nombre según lo que lleve la carpeta, la frase del primer mensaje y la pieza de los
    Innegociables que falten.

  `dicc` → «27 palabras prohibidas · 47 ficheros y 45 rótulos revisados · Todo el texto de pantalla
  respeta el diccionario».
- **T008 ✓** 25-09 · `extension/prueba/contrato.js`, nuevo. Juega el arranque de verdad
  (`entrevistar()` con el `vscode` falso), saca los flags con `arrancar.flagsDelMontaje()` —la misma
  función del montaje, extraída sin cambiar nada: `humo` siguió en 196— y le pide el plan en seco al
  RSC de dentro, en carpetas temporales. La carpeta personal, la configuración de git y el aviso de
  versión se desvían antes de cargar nada.
  - **Rojo**, código 1, en 2,8 s: «large no es un tamaño de RSC, que acepta small | growing |
    complex», «mixed sin tamaño: RSC lo exige y el arranque no lo pregunta» y «7 de 24 jugadas no
    dan plan» (las cinco de «Un poco de todo» con `RSC_ONBOARDING_REQUIRED`, y las dos de «Va para
    largo» con `RSC_ONBOARDING_INVALID`).
- **T009 ✓** 25-09 · Tres comprobaciones más en `contrato`, aplicando de verdad (0,4 s por montaje):
  - «sin la cadena SDD, el montaje queda listo»: rojo, «se ha leído como «undefined»»;
  - «un plan que practica SDD queda montado, aunque RSC diga que falta el suelo»: rojo en los tres
    casos, «RSC lo ha aplicado y la barra lo da por fallo»;
  - «si RSC deshace el montaje, la barra dice que no se ha podido»: la trampa es un fichero
    `.claude` donde van las habilidades, y RSC contesta de verdad con código 4 y
    `RSC_ONBOARDING_INCOMPLETE:` por la salida de errores. Rojo, «se ha leído como «undefined»».
- **T010 ✓** 25-09 · Las tres preguntas y el suelo a medias, juntos:
  - `rumbo`: fuera el cuarto tamaño; `CON_TAMANO = ['software', 'mixed']`; `alcance` y `personas`
    solo al montar de cero; `queConstruir` con `soloSi`.
  - `arrancar`: las tres tablas, el nombre según lo que lleva la carpeta (con «La empresa entera»,
    una caja y los dos nombres iguales), `alcance:` y `personas:` al perfil, y `primerMensaje()`
    extraído de `extension.js` con la frase nueva.
  - `rsc.comoAcaboElMontaje()`: las seis formas de `onboard --accept-plan`. El «a medias» exige la
    huella aceptada y la del recibo.
  - La pieza «Innegociables» en «Qué falta por montar», con el encargo, que nombra la fase
    `constitution`.
  - **Verde:** `contrato` 7/7, con 24 planes pedidos. `humo` 200, con las cuatro nuevas.
  - Dos pruebas de `humo` se reescriben porque exigían lo de antes: la lista de preguntas (ahora
    son nueve) y el RSC fingido que contestaba `RSC_ONBOARDING_READY abc`, que no es lo que escribe
    RSC.
  - `grep large` en `arrancar.js` y `rumbo.js`: nada.
- **T011 ✓** 25-09 · `humo` «un objetivo con & | ^ % " llega entero»: **rojo** («el objetivo viaja en
  claro») → verde. `flagsDelMontaje` manda `--goal-base64` en base64url, como lo escribe RSC. La
  prueba exige, además, que ningún flag lleve nada que cmd.exe interprete. En `contrato`, «un
  objetivo con cualquier carácter llega entero a RSC»: RSC lo devuelve igual en su línea de
  aceptación.
- **T012 ✓** 25-09 · Los cuatro escalones:
  - **rojo** en `contrato` («L0 (accompaniment): RSC lo ofrece y el arranque no») y en `humo` («no
    ofrece «Al grano»: Todo, paso a paso · Lo normal · Poco»);
  - `CUANTO_TE_EXPLICO` sale de `trato.ESCALONES`, del más acompañado al que menos;
  - la habilidad dice `L0 | L1 | L2 | L3` y nombra los cuatro escalones; las dos copias, iguales.

  Verde: `contrato` 9/9 y `humo` 202.
- **T013 ✓** 25-09 · `humo` «los raíles apagan el guardián de gitmoji con su porqué»:
  - **rojo** («los raíles no lo apagan») → verde;
  - la prueba le pasa al guardián del paquete un `git commit -m "Primera versión"` y mira que no
    deniegue; sin interruptor, el mismo commit se deniega, que es el control.

  En `humo+`, «con «irá sumando piezas» queda montado, y guardar en español no se deniega» monta de
  verdad y pasa por el guardián que RSC dejó en `.rsc/`. `humo+`: **206**, código 0, en 8 s.
  - *Desviación del plan (§4, paso 7):* `.no-gitmoji` se escribe siempre, no solo si el plan trae el
    guardián, porque `repair` lo monta aunque el plan no lo pida (C6).
- **T014 ✓** 25-09 · Verificación de F1, en `verifications/todo-cuadra-F1-2026-09-25.md`:
  - la batería entera y `humo+`, en verde: `humo` 204, `humo+` 207, `contrato` 9, las tres empresas,
    el diccionario y PowerShell;
  - quince mutaciones, y todas matan su prueba;
  - `contrato.js` entra en `config.yaml`, `npm run probar`, `publicar.sh` y `/revisar-la-barra`.

  Decisión 117, su resumen en `harness/decisions.md` y el worklog
  `2026-09-25-todo-cuadra-F1-el-arranque-monta.md`. La barra, a 0.33.0. Las pantallas pintadas,
  publicadas para Jose (C-22): https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre.
  - Al pintarlas salieron cuatro textos que ninguna prueba veía: «facturas.Después», dos «empresa»
    por defecto, «falta los innegociables» y «ya está listo» con el suelo a medias. Arreglados.
  - La revisión con ojos frescos corre sobre el commit; lo que encuentre, antes de F2.
  - **Queda para F8:** el título del comando en la paleta sigue siendo «Executive Lab: Empezar una
    empresa aquí».
- **Revisión de F1 ✓** 25-09 · *changes-needed*, 1 importante y 3 menores, todos comprobados en el
  código y aceptados:
  - alcance y personas se perdían al volver a montar, porque RSC reescribe el perfil entero;
  - «Listo» en la primera fila con los innegociables por escribir;
  - el nombre no lo sugiere cuánta gente hay;
  - el contrato del plan no era el publicado;
  - y, fuera de cuenta, `$&` en un nombre rompía el perfil.

  Tres pruebas en rojo primero y tres mutaciones (M16–M18). `humo` 205 y `humo+` 208. Lo de F2
  que ya estaba empezado (T015) se apartó en un *stash* para arreglar esto sobre F1.
