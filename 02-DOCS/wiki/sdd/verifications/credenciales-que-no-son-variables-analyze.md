---
type: analyze
title: Gate de consistencia — credenciales que no son variables
description: Cruce de la constitución, la spec, el plan y las tareas antes de escribir código. Un hueco real, una tensión y una exención razonada.
timestamp: 2026-09-22T02:30:00Z
topic: sdd
status: passed-with-fixes
---

# Gate de consistencia

## Constitución ↔ plan

| Regla | Veredicto |
|---|---|
| **P1** Ninguna pantalla sin salida | ✅ Lo que se añade sale en el bloque de desorden, que ya trae *Que las ordene*, y en filas de conexión que son botones. Nada nuevo sin pulsar. |
| **P2** Ni una palabra fuera del diccionario | ✅ T1 va **antes** que T6, que es el orden que pide la regla: la palabra entra en la tabla y luego se usa. |
| **P3** Nunca un fallo silencioso | ⚠️ **Exención razonada**, abajo. |
| **P4** Lo de esa persona no se toca | ✅ Solo se lee. Mover lo hace el asistente con permiso, y el encargo se lo exige. |
| **P5** Determinista lo que se lee, delegado lo que hay que entender | ✅ Encontrar y clasificar es determinista; «de quién es este fichero» cuando no se deduce se delega. Y el encargo hereda el `comprobar()` de `ordenarLasClaves`, que ya mira `!sueltas.resumen()`: como los ficheros de acceso entran **dentro** de `resumen()`, la comprobación pasa a cubrirlos sin escribir una línea. |
| **P6** La acción tal cual viene | ✅ El panel pinta lo que le llega. |
| **P7** Una versión del catálogo | ✅ No se toca. |
| **P8** Lo descargado fuera | ✅ No se toca. |

## Spec ↔ plan ↔ tareas

| Criterio | Cubierto por | Veredicto |
|---|---|---|
| A1 cuenta de servicio en la raíz, dicha como lo que es | T2, T3, T6 | ✅ |
| A2 un `.pem` sí, un `package.json` no | T2 | ✅ |
| A3 se deduce la herramienta, o «sin dueño claro» | T3 | ✅ |
| A4 el encargo dice `keys/` y no lleva contenido | T4 | ✅ |
| A5 con `keys/` lleno no es «sin conectar» | T5 | ✅ |
| A6 si está en git, el mismo aviso | — | ❌ **Hueco** |
| A7 nada de jerga en pantalla | T1, T6 | ✅ |

### El hueco (A6)

Ninguna tarea conecta los ficheros de acceso con `estanSubidas()`. Hoy esa función recibe los
sitios del inventario de **claves** y pregunta a git por ellos; si los ficheros de acceso no entran
en esa lista, un `credentials.json` guardado en el historial no dispara el aviso — y es
justamente la credencial que más daño hace ahí, porque una cuenta de servicio no caduca.

**Arreglo**: `estanSubidas()` recibe también los ficheros de acceso, y el aviso del encargo los
nombra. Se añade **T4b**.

### La tensión (dos carpetas llamadas igual)

El plan dice que `keys/` es una «carpeta de credenciales al uso» donde se busca, y a la vez que un
fichero dentro de `01-TOOLS/<X>/keys/` **no** está fuera de sitio. Las dos cosas son ciertas y se
contradicen si se leen a la ligera: un `keys/` en la raíz es desorden, y el `keys/` de una
herramienta es su casa. Queda dicho aquí y se escribe explícito en el código, que es donde se
puede equivocar alguien mañana.

### La exención (P3)

Un `.json` que no se puede leer —permisos, medio escrito— no se apunta en el registro interno. No
es un fallo de la barra: es un fichero que no se ha podido **clasificar**, y la respuesta correcta
es no afirmar que es una credencial. Apuntarlo llenaría el informe del tutor de ruido en cualquier
carpeta con un `.json` roto. P3 habla de fallos que dejan la pantalla llena sin decir nada; esto no
deja nada lleno: deja un fichero fuera de una lista de detección heurística.

## Veredicto

**Pasa, con T4b añadida.** Sin ella, A6 se habría quedado sin implementar y nadie lo habría notado
hasta que una cuenta de servicio viajara a GitHub.
