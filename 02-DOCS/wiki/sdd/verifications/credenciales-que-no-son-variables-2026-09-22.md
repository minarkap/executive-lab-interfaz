---
type: verification
title: Verificación — credenciales que no son variables
description: La batería entera, criterio por criterio, con lo que se observó. Incluye la prueba de mutación y los tres defectos que encontraron verify y review.
timestamp: 2026-09-22T03:10:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/credenciales-que-no-son-variables.md
veredicto: pasa
---

# Verificación

## La batería

| Comprobación | Resultado |
|---|---|
| `node extension/prueba/humo.js` | **186 comprobaciones pasadas** (una nueva) |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras |
| `node docs/comprobar-diccionario.js` | 27 palabras prohibidas · 47 ficheros · limpio |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas |

## Criterio por criterio

| # | Observado |
|---|---|
| A1 | `credentials.json` con `type: service_account` en la raíz sale como **«Una cuenta de servicio de Google»**. |
| A2 | `auto/publicar.pem` sale; `package.json` y `auto/tsconfig.json` **no**. |
| A3 | El de dentro de `01-TOOLS/DRIVE/` → DRIVE («está en su carpeta»); el de la raíz → DRIVE por su `client_email` (`mi-drive`, «lo dice la cuenta»); `ajena.json` (proyecto `contabilidad-nube`) → sin dueño, se pregunta. |
| A4 | El encargo dice `01-TOOLS/DRIVE/keys/` y «No abras ni me pegues el contenido». Ni `esto_es_secreto` ni `BEGIN` aparecen en el encargo ni en el inventario. |
| A5 | `SHEETS` (solo fichero) → `conFichero: 1`, `faltan: 0`, rótulo **«con su fichero de acceso»**. `MAGNIFIC` (fichero + una clave que falta) → rótulo «falta una clave»: manda lo que bloquea (C5). |
| A6 | Con `credentials.json` añadido al índice de git: `subidas: 1` y el encargo trae `AVISO IMPORTANTE`. |
| A7 | El HTML sin los `data-accion` no contiene `.json`, `.pem`, `clave privada` ni `keys/`; sí «certificado digital» (C6). |

## Prueba de mutación

Con `ficherosDeAcceso()` devolviendo `[]` a la fuerza: **185 pasadas y una falla** — la nueva.
Restaurado: **186**. La comprobación sabe ponerse roja.

## Lo que encontraron los gates (y no yo)

1. **`analyze`** — A6 no lo cubría ninguna tarea: un `credentials.json` en el historial no habría
   disparado aviso, y es la credencial que más daño hace ahí. Se añadió T4b.
2. **`verify`** — el emparejamiento herramienta↔fichero usaba `includes`, así que un proyecto
   `mi-drive-viejo` casaba con DRIVE y una herramienta llamada `API` habría casado con casi todo.
   Ahora se parte por trozos y se exige el identificador entero.
3. **`verify`** — el rótulo decía «Una clave privada o un certificado»: jerga, y choca con *clave
   de acceso*. Se corrigió a **«Un certificado digital»**, y con ello el criterio A7 (C6).
4. **`review`** — sin ninguna clave suelta, el encargo abría con *«hay 0 claves guardadas fuera de
   su sitio, en: .»* y se lo mandaba al asistente. Y el diagnóstico de incidencias escribía lo
   mismo. Los dos arreglados, con aserción que lo vigila.
5. **`review`** — el recorrido de `.json` no tenía tope y esto se pide en cada repintado. Ahora:
   300 entradas por carpeta y 60 lecturas en total; los que se resuelven por el nombre no gastan.

## Veredicto

**Pasa.** Nada pendiente de la spec. Fuera quedó lo que la spec dejó fuera a propósito: leer
credenciales de fuera de la carpeta, y mover los ficheros nosotros.
