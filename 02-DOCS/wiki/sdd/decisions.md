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
