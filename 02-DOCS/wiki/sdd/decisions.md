---
type: decisions
title: Decisiones tomadas construyendo (cadena SDD)
description: Registro de solo añadir de las decisiones que se toman mientras la cadena SDD construye. Las de fondo, numeradas, viven en docs/decisiones.md.
timestamp: 2026-09-24T15:52:00Z
topic: sdd
---

# Decisiones de la cadena SDD

Solo se añade. Cada entrada lleva fecha, feature y quién decidió.

## 2026-09-24 · todo-cuadra · specify

- **Una spec paraguas, no siete.** El programa entero tiene una sola spec, `specs/todo-cuadra.md`,
  y cada frente es una fase con su verificación, su decisión y su commit. La aprobó Jose en el plan.
  Si un frente crece, se saca a su propia spec.
- **La auditoría va como propuesta** (`proposals/todo-cuadra.md`), porque lleva fichero y línea y la
  spec se queda en qué y por qué.
- **Aprobada en autopilot, no punto por punto** (*«dale en autopilot»*, 24-09-2026). La spec se
  revisa después.
- **Las cuatro decisiones de Jose en la fase de plan:** freno propio donde RSC no pone el suyo; rama
  propia (`todo-cuadra`) esperando a las sesiones paralelas; confirmación en carpetas ajenas, y por
  cada nombre que choque se pregunta si sobrescribir o renombrar; y el Node de VS Code como relevo,
  con el oficial como plan B.
- **Suposiciones tomadas que Jose puede vetar en la parada de vocabulario:** `.no-gitmoji` en las
  carpetas de alumno (A11), y la puerta SDD que se queda para quien elige «irá creciendo».

## 2026-09-24 · todo-cuadra · clarify y revisión con ojos frescos

- **P4 se enmienda en la constitución.** P4 decía «no se renombra» sin excepción, y la decisión 3 de
  Jose pide renombrar o sobrescribir, con su sí, lo que choque. La enmienda deja las dos cosas solo
  con sí explícito y copia recuperable; sin respuesta, no se monta. La encontró la revisión con ojos
  frescos: es mejor enmendar que saltarse la regla.
- **D5 baja de medio a bajo.** `trato.js` ya lee las dos formas del dial y escribe donde estén
  (decisión 33).
- **A4 reutiliza** los cuatro escalones de «Cómo te habla»: un dial, un nombre.
- **El comportamiento con las credenciales dice «nunca entero»**, porque la barra enseña a propósito
  los cuatro últimos caracteres. La primera versión de la spec decía «ni en parte» y contradecía lo
  que ya hay.

## 2026-09-25 · todo-cuadra · parada de vocabulario (primera parte)

- **Jose: «Apagarlo».** Los raíles dejan `.rsc/.no-gitmoji` en las carpetas de alumno, con su
  motivo, igual que la decisión 94 hizo aquí (A11, T013).
- **Jose: «Dejarla».** La puerta SDD de cada turno se queda para quien elige «irá creciendo».
- **Vocabulario:** Jose pidió que se le explicara qué es. Queda pendiente de su sí.

## 2026-09-25 · todo-cuadra · parada de vocabulario (cerrada)

- **Tres preguntas fáciles en vez de «¿es algo pequeño o va para largo?».** Jose: *«grande y pequeño
  puede ser difícil de decidir para el alumno»*, *«no es lo mismo un departamento de 3 personas que
  de 50»* y *«una landing no es lo mismo que una plataforma completa SAAS multiidioma con
  backoffice»*. Queda así:
  - a todo el mundo, qué lleva la carpeta y cuántas personas están metidas;
  - con «Construir algo» o «Un poco de todo», qué va a construir. Solo esta decide el tamaño que se
    le manda a RSC.

  Jose, sobre el recorrido entero: *«Lo que consideres»*.
- **Los demás textos los decide el programa con su criterio**: *«gente no técnica que va a gestionar
  proyectos variados […] desde un departamento hasta un proyecto suelto, hasta una tarea puntual y
  hasta una empresa entera»*. Entran en el diccionario al usarse, y al cerrar cada fase Jose ve las
  pantallas pintadas.

## 2026-09-25 · todo-cuadra · implement, F1 (T008–T010)

- **El `rsc.aplicarPlan` del plan (§3) queda en un lector puro, `rsc.comoAcaboElMontaje()`, y
  `montarElArnes` sigue llamando a `rsc.correr`.** *Por qué:* un `aplicarPlan` dentro de `rsc.js`
  llamaba a `correr` por dentro, y el RSC fingido de `humo` no lo veía: la prueba habría montado con
  el RSC de verdad sin decirlo. Un solo punto de paso para fingir, y el contrato de las seis formas
  se prueba contra el RSC de verdad en `contrato.js`.
- **El botón de A3 es una pieza nueva, «Innegociables», en «Qué falta por montar».** Sale cuando el
  recibo pide la constitución (`floorPaths`) y no está. Es la parte de G7 que A3 necesita ya; lo
  demás de G7 (los ficheros de la plantilla) sigue en T7.7. *Por qué va aparte de
  `sueloDelArnes()`:* esas tres piezas las levanta volver a montar, y los innegociables no. Metidos
  allí, la carpeta se vería «a medias» y el arranque volvería a montar para nada.
- **`alcance` y `personas` solo se preguntan al montar de cero.** RSC no las pide, así que un clon o
  un montaje a medias no las vuelven a preguntar: el clon sigue preguntando una sola cosa.
- **Los valores en el perfil:** `alcance: tarea | proyecto | departamento | empresa` y
  `personas: solo-yo | 2-10 | 11-50 | mas-de-50`. Se entienden sin tabla, para el asistente y para
  quien abra el fichero.
- **Con «La empresa entera», el nombre se pregunta una vez**, y el arnés y la empresa se llaman
  igual. `identidad.titulo()` no lo repite, y el primer mensaje no dice «Es para» con el mismo
  nombre.
- **`.rsc/.no-gitmoji` se escribe siempre**, no solo cuando el plan trae el guardián (el plan decía
  «si el plan trae el guardián», §4, paso 7). *Por qué:* `repair` engancha los frenos aunque el plan
  no los pida (C6), y entonces el interruptor ya tiene que estar. En «Lo que tiene apagado» sale
  como lo que es: una decisión tomada.
- **El objetivo va en base64url**, que es el que usa RSC (`encodeGoal`); con el base64 de siempre,
  `decodeGoal` no lo acepta porque al recodificar no sale igual.
- **A13 se afina tras la revisión de F1:** el nombre lo sugiere lo que lleva la carpeta, no cuánta
  gente hay, que no dice nada de cómo se llama. Y alcance y personas se releen del perfil al volver a
  montar, porque RSC lo reescribe entero en cada plan aceptado. La spec y el plan, al día.
- **Una comprobación más de las que pedía el plan**, «lo que contesta el montaje se lee en sus seis
  formas, y nada más», con las líneas literales de RSC. Faltaba antes de mutar: ninguna otra prueba
  miraba un «a medias» o un «listo» de otra huella. La mutación M5, quitar la comparación con el
  recibo, solo la caza esta.
