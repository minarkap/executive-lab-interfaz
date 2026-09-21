---
type: worklog
title: Lo que el asistente escribe en 02-DOCS también se abre
description: Auditada la otra mitad de la carpeta. Dos huecos del mismo tipo: la revisión en HTML de rsc audit y la mitad de la cadena SDD se escribían y no los podía abrir nadie. Decisión 106, 0.26.1.
timestamp: 2026-09-22T04:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«sigue con otras cosas, mapea todo»*. Cerrado ya el mapeo de habilidades, comandos, agentes,
guardianes y credenciales, quedaba la otra mitad de la carpeta: `02-DOCS`. Se cruzó lo que RSC y la
cadena escriben ahí con lo que la barra lee.

Salieron dos huecos, y los dos son la misma forma de fallar: **cosas que se escriben y que nadie
puede abrir**.

## 1 · La revisión del asistente

`rsc audit` deja un informe entero en HTML en `02-DOCS/audits/`. La barra ni sabía que existía. Lo
irónico es que el aviso que la pide ya se nombraba en Las reglas desde la 102 —«La revisión
periódica de habilidades»—: se veía la petición y no el resultado.

Ahora sale en *Qué falta por montar*, con la fecha de la más reciente, y se abre fuera como el
panel de conocimiento.

## 2 · La mitad de la cadena SDD

«En qué estamos» leía tres montones de los seis. Faltaba justo el que contesta la pregunta que le
importa a quien no va a leer un plan: **«¿esto funciona?»**. Entra `verifications/` como *Qué se ha
comprobado*. Y el `decisions.md` de la cadena se junta con el del arnés: una decisión es una
decisión.

Fuera a propósito: `progress/`, `sessions/` y `archive/`, que son andamio.

## De paso, confirmado

Lo de `.json` y `.pem` que Jose volvió a pedir ya estaba hecho (decisión 105, `25e4d5e`). Se
comprobó corriéndolo sobre una carpeta de mentira: un `credentials.json` de la raíz sale como «Una
cuenta de servicio de Google» y se le asigna DRIVE por su `client_email`; un `.pem` sale como «Un
certificado digital»; la herramienta con su fichero en `keys/` figura conectada; y el secreto no
aparece en ninguna parte del encargo.

## Qué quedó tocado

`extension/src/{terreno,proyectos,diario,extension}.js` · `extension/prueba/humo.js` (una nueva) ·
`docs/diccionario.md` (3 filas) · `docs/decisiones.md` (106).

## Cómo quedó

0.26.1. `humo.js` **187 comprobaciones**, la nueva verificada por mutación. Empresas, diccionario y
PowerShell en verde.
