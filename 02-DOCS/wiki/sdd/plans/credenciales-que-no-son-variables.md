---
type: plan
title: Plan — las credenciales que no son variables
description: Un segundo inventario junto al de claves, con las mismas reglas: leer del disco, no adivinar, no sacar el contenido. Dónde toca cada módulo y en qué orden.
timestamp: 2026-09-22T02:20:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/credenciales-que-no-son-variables.md
status: approved
---

# Plan

## Forma

Un **segundo inventario hermano** del de claves, en el mismo módulo (`sueltas.js`), porque comparte
todo lo que importa: dónde se busca, cómo se reparte por herramienta, cómo se mira si está en git,
y el mismo encargo. Un módulo nuevo partiría en dos una sola pregunta —«¿dónde están mis
credenciales?»— y obligaría a recorrer la carpeta dos veces.

`sueltas.resumen()` pasa a devolver, además de lo de hoy, `ficherosDeAcceso` y su reparto. Las
pantallas y `conexiones.js` leen de ahí. Nada más cambia de forma.

## Qué toca cada módulo

| Módulo | Qué se le añade | Por qué ahí |
|---|---|---|
| `extension/src/sueltas.js` | `ficherosDeAcceso()`: los encuentra, los clasifica y dice de quién son. Entra en `resumen()` y en el encargo. | Es quien ya recorre la carpeta y quien ya reparte por prefijo. Un recorrido, no dos. |
| `extension/src/conexiones.js` | `proveedores()` y `claves()` miran `keys/`: `conFichero`. | Es quien dice si una conexión está completa; hoy solo mira `.env`. |
| `extension/media/panel.js` | Rótulo «con su fichero de acceso»; el bloque de desorden cuenta las dos cosas. | Pinta, no decide (P6). |
| `docs/diccionario.md` | «fichero de acceso», «cuenta de servicio», «con su fichero de acceso». | P2: la palabra entra en la tabla antes de usarse. |
| `skills/executive-lab/SKILL.md` (+ copia en `media/railes/`) | Una línea: los ficheros de acceso van a `keys/`. | Ya dice dónde va una clave; le falta la otra mitad. |
| `extension/prueba/humo.js` | Una comprobación nueva con carpeta de mentira. | Es donde se prueba todo lo demás. |

## Cómo se decide qué es un fichero de acceso

Dos listas y una lectura, en este orden (C2):

1. **Por nombre, sin abrirlo**: `*.pem`, `*.p8`, `*.p12`, `*.key`, `*.keystore`, `*.jks`,
   `id_rsa`, `id_ed25519`.
2. **Por nombre inequívoco, siendo `.json`**: `credentials.json`, `client_secret*.json`,
   `*service-account*.json`, `token.json`.
3. **Por contenido, siendo cualquier otro `.json`**: se leen como mucho 64 KB y cuenta solo si
   trae `"type": "service_account"`, `"private_key"` o `"client_secret"`.

De un `.json` que cuente se sacan **`type` y `client_email`**, y nada más (C4). El resto del
contenido no sale de la función: ni al encargo, ni a la pantalla, ni al registro interno.

## Dónde se busca

El mismo alcance que el inventario de claves, y por la misma razón (esto se pide en cada
repintado): la raíz, las carpetas de primer nivel que no son de sistema, las carpetas de
credenciales al uso (`config/`, `credentials/`, `secrets/`, `keys/`), y dentro de cada herramienta
lo que esté **fuera** de su `keys/`. Nunca recursivo hondo. Un fichero dentro de
`01-TOOLS/<X>/keys/` **no** está fuera de sitio: está en su casa, y eso es lo que alimenta a C5.

## Reparto (C3)

```
dentro de 01-TOOLS/<X>/  →  X
nombre contiene el id de una herramienta montada  →  esa
cuenta de servicio cuyo client_email casa con una herramienta  →  esa
resto  →  sin dueño claro (se pregunta)
```

## Testing

Una comprobación en `humo.js`, sobre una carpeta temporal con: un `credentials.json` de cuenta de
servicio en la raíz, un `clave.pem` en una carpeta de primer nivel, un `package.json` y un
`tsconfig.json` (que no pueden salir), un fichero suelto dentro de una herramienta y otro ya bien
puesto en su `keys/`. Se comprueba cada criterio de aceptación, que ningún valor viaja, y que la
pantalla no escribe «.json» ni «.pem».

## Riesgos y cómo se cierran

| Riesgo | Cierre |
|---|---|
| Leer de más y ralentizar el repintado | Tope de 64 KB por fichero y solo para los `.json` que no se resolvieron por nombre. Mismo alcance que el inventario de claves. |
| Un secreto se escapa al clasificar | Los dos campos que salen (`type`, `client_email`) se extraen con una expresión, no se devuelve el objeto. Hay una aserción que lo comprueba. |
| Falso positivo en un `.json` de configuración | Tres señales, todas inequívocas de una credencial. `package.json` y `tsconfig.json` están en la prueba. |
| El rótulo nuevo no gusta | Es una línea del diccionario y una del panel: se cambia en un minuto. Queda anotado para Jose. |

## Tareas

| # | Tarea | Hecho cuando |
|---|---|---|
| T1 | Diccionario: «fichero de acceso», «cuenta de servicio», «con su fichero de acceso», «keys/». | Las filas están y `comprobar-diccionario.js` pasa. |
| T2 | `sueltas.js`: detección y clasificación (`esFicheroDeAcceso`, `queEs`). | La prueba distingue los seis casos del plan. |
| T3 | `sueltas.js`: reparto por herramienta y entrada en `resumen()`. | `resumen().ficherosDeAcceso` trae dueño o «sin dueño claro». |
| T4 | `sueltas.js`: el encargo nombra `keys/` y no lleva contenido. | La prueba busca el destino y la ausencia de cualquier valor. |
| T4b | `estanSubidas()` mira también los ficheros de acceso, y el aviso los nombra. | Un `credentials.json` en el historial dispara el mismo aviso. **Añadida en `analyze`: A6 no la cubría nadie.** |
| T5 | `conexiones.js`: `conFichero` en `proveedores()` y `claves()`. | Una herramienta con `keys/` lleno lo dice. |
| T6 | `panel.js`: rótulo y bloque de desorden con las dos cuentas. | Pintado con datos de verdad, sin jerga a la vista. |
| T7 | Raíl `executive-lab` en `skills/` **y** su copia. | La prueba de raíles pasa. |
| T8 | Comprobación en `humo.js` que recorre A1–A7. | Verde, y roja si se quita el código. |
| T9 | Decisión 105, worklog, entrada en la wiki, versión 0.26.0. | Escritos. |
