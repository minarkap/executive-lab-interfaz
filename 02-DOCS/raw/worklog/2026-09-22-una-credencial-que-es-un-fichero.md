---
type: worklog
title: Una credencial que es un fichero entero también tiene sitio
description: La mitad que faltaba de la 104, hecha con la cadena SDD completa. Una cuenta de servicio de Google no es una línea CLAVE=valor, y por eso un Drive conectado salía «sin conectar». Los gates encontraron cinco defectos que yo no vi. Decisión 105, 0.26.0.
timestamp: 2026-09-22T03:20:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«implementa todo en autopilot por fases en SDD y no pares hasta que termine»*. Lo pendiente
era lo que él mismo había apuntado: las credenciales que no son variables.

Se hizo con la cadena entera, y por primera vez en este repositorio: `sdd-init` (no había
`config.yaml`) → `specify` → `clarify` → `plan` → `tasks` → `analyze` → `implement` → `verify` →
`review`. Los artefactos están en `02-DOCS/wiki/sdd/`.

## El problema

Una cuenta de servicio de Google o un certificado es un **fichero entero**, no una línea. La 104
solo inventariaba líneas, así que un Drive conectado con cuenta de servicio salía «sin conectar»
—su `.env` está vacío— y el fichero que lo autentica no aparecía en ningún sitio. Es además la
credencial más peligrosa: no caduca, y suele abrir un Drive entero.

## Lo que hace ahora

Se reconocen por extensión, por nombre inequívoco o **por lo que declaran dentro** (un
`package.json` no cuela). Se sabe de quién es cada uno por dónde está, por su nombre o por el
proyecto de su `client_email` —siempre por trozos enteros—. De dentro salen dos campos y ninguno es
secreto. Su sitio es `01-TOOLS/<X>/keys/`, y lo que ya está ahí no es desorden: está en su casa.
Una conexión con su fichero dice **«con su fichero de acceso»** en vez de parecer vacía.

## Las palabras

**Fichero de acceso** para la clase, **cuenta de servicio de Google** en la (i). Y una decisión de
vocabulario: *certificado digital* se queda (un gestor tiene el de la FNMT y lo usa para Hacienda),
*clave privada* se va (es jerga y choca con *clave de acceso*).

## Lo que encontraron los gates, y no yo

Esto es lo que se pagó con la ceremonia, y salió a cuenta:

1. **`analyze`** — ninguna tarea cubría el aviso de git. Una cuenta de servicio habría viajado a
   GitHub sin decir nada.
2. **`verify`** — emparejar con `includes`: `mi-drive-viejo` casaba con DRIVE y `API` con todo.
3. **`verify`** — «clave privada» en un rótulo.
4. **`review`** — el encargo abría con «hay 0 claves guardadas fuera de su sitio, en: .» cuando
   solo había ficheros. Se lo estaba mandando al asistente.
5. **`review`** — el recorrido de `.json` sin tope, en algo que se pide en cada repintado.

## Qué quedó tocado

`extension/src/{sueltas,conexiones,extension}.js` · `extension/media/panel.js` ·
`skills/executive-lab/SKILL.md` y su copia · `extension/prueba/humo.js` (una nueva) ·
`docs/diccionario.md` (2 filas) · `docs/decisiones.md` (105) · y en `02-DOCS/wiki/sdd/`:
`config.yaml`, la spec, el plan, el informe de `analyze` y la verificación.

## Cómo quedó

0.26.0. `humo.js` **186 comprobaciones**, y la nueva comprobada por mutación: con la función
devolviendo vacío, se pone roja. Las tres empresas, el diccionario y PowerShell, en verde.
