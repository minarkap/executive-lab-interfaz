---
type: worklog
title: Once carpetas raras, tres fallos, y una barra que se deja corregir
description: Jose pidió asegurar que no hay casos límite y que todo se pueda corregir sin fricción. Se ejecutó el inventario contra once carpetas raras. Ocho bien; 120 claves pintaban 104 KB, la barra afirmaba sin dar salida, y no se podía decir «están bien donde están». Decisión 107, 0.27.0.
timestamp: 2026-09-22T04:40:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«asegúrate de que no hay edge cases y todo se mapea bien y hay formas de que el usuario
pueda corregirlo y de que sea fácil y sin fricción todo»*.

Se **ejecutó** el inventario de credenciales contra once carpetas raras, no se leyó el código
buscando fallos imaginarios.

## Las ocho que ya iban bien

Sin `01-TOOLS` siquiera · la misma clave en dos ficheros (se agrupa y dice los dos sitios) · un
`keys/` en la raíz, que sí es desorden a diferencia del de una herramienta · una herramienta con
acentos y espacios en el nombre · un `.env` vacío o solo con comentarios · uno ilegible por
permisos · un `.json` roto o que es un array · un enlace simbólico que no apunta a nada. Ninguna
revienta y ninguna miente.

## Las tres que no

**1 · Ciento veinte claves.** Un `.env` así existe. La barra pintaba **121 líneas, 123 botones y
104 KB**, con un encargo de **22.576 caracteres**. Nadie lee eso. Ahora: seis líneas y se dice
cuántas quedan, ocho botones de «Por montar» y el resto contado, y el encargo nombra veinticinco y
resume. Mismo caso: **19 KB y 12 botones**, encargo de 5.654. Nada se esconde sin decir cuántas
son, y el botón las ordena todas igual.

**2 · La barra deduce, y deducir es equivocarse a veces.** El reparto sale del nombre de cada
clave. Afirmarlo sin dar salida incumple P1. Ahora lo dice —«Esto lo saco del nombre de cada una,
así que puedo equivocarme»— y trae botón.

**3 · Y a veces no está mal: está bien donde está.** Un proyecto puede leer sus claves de la raíz a
propósito —Next.js lo hace— y la barra se lo diría cada semana sin poder rebatirlo. El mismo botón
cubre las dos correcciones, y si es este caso el encargo manda no mover nada y **dejarlo escrito**,
para no repetir la conversación.

## Qué quedó tocado

`extension/src/sueltas.js` · `extension/media/panel.js` · `extension/prueba/humo.js` (una nueva) ·
`docs/diccionario.md` (2 filas) · `docs/decisiones.md` (107).

## Cómo quedó

0.27.0. `humo.js` **188 comprobaciones**. Empresas, diccionario y PowerShell en verde.
