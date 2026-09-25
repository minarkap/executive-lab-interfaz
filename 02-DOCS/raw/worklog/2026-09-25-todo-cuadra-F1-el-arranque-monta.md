---
type: worklog
title: Todo cuadra, F1 — el arranque monta con cualquier respuesta
description: Tres preguntas nuevas en vez del tamaño, el suelo a medias leído como montado, el objetivo en base64, los cuatro escalones y el guardián de gitmoji apagado. La comprobación de contrato, nueva, contra el RSC de dentro. Decisión 117.
timestamp: 2026-09-25T14:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

La fase F1 del programa `todo-cuadra`, T007–T014, con la prueba en rojo primero:
- **La comprobación de contrato**, `extension/prueba/contrato.js`, nueva. Juega el arranque de
  verdad y le pide el plan al RSC que viaja dentro de la barra, en seco y en carpetas temporales. En
  los casos con SDD, además, lo aplica. Salió roja por lo que debía: «large no es un tamaño de
  RSC», «mixed sin tamaño» y 7 de 24 jugadas sin plan.
- **Tres preguntas** en vez de «¿es algo pequeño o va para largo?»: qué lleva la carpeta, cuántas
  personas y, si hay algo que construir, qué es. Solo la última va a RSC.
- **El suelo a medias**: RSC aplica el plan y dice `RSC_ONBOARDING_INCOMPLETE` por la salida normal
  cuando faltan los innegociables. La barra lo leía como fallo. Ahora sigue, y ofrece escribirlos
  con un botón.
- **El objetivo en base64**, los **cuatro escalones** y el **guardián de gitmoji apagado**.

## Lo que salió al pintar las pantallas

Al sacar los textos del código para enseñárselos a Jose salieron tres cosas que no había cazado
ninguna prueba:
- el primer mensaje decía «facturas.Después», pegado, cuando no hay web ni claves (venía de antes);
- dos textos llamaban «empresa» a la carpeta por defecto;
- el encargo decía «falta los innegociables».

Arregladas, y la primera con su comprobación. Y al repasar el diff, una cuarta: con el suelo a
medias el aviso final decía «ya está listo», y «listo» es cuando el arnés también lo da por listo.
Ahora dice «ya está montado».

Las pantallas, para Jose: https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre

## Lo que encontró la revisión

Qué lleva la carpeta y cuánta gente hay se perdían al volver a montar: RSC reescribe el perfil
entero en cada plan aceptado. Ninguna prueba volvía a montar después de montar con los campos
nuevos. Ahora se releen, con su prueba, y tres cosas menores más.

## Números

`humo` 205 (eran 196), `humo+` 208 (eran 198) en 8 s, `contrato` 9 en 5 s. Dieciocho mutaciones, y
todas matan su prueba.

## Lo que sigue

F2, las carpetas: la carpeta personal y las del sistema, el clon real, «seguir sin copias», la
carpeta de alguien con su confirmación, la versión más nueva y el historial nuestro.
