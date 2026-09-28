---
type: ftd
title: La barra se pone al día con un clic
date: 2026-09-28
status: hecho
---

# La barra se pone al día con un clic

## Intent

Jose, 28-09-2026: *«si un alumno instala la extensión y la actualizamos en github […] tendrá que
enterarse el alumno y actualizarla […] tenemos que hacer que los alumnos puedan actualizar la extensión
también»*. La barra no va a estar en la tienda del editor, así que el editor no la actualiza solo.

Lo que había:

- Cada versión se publica como release en GitHub, con su `.vsix` (`/publicar-una-version`).
- `version.js` mira una vez al día si hay una más nueva.
- Pero el aviso **no salía nunca**: la pantalla lo buscaba dentro del estado y la extensión lo manda al
  lado. Se arregló en `lo-que-dicen-los-alumnos` (decisión 131).
- Y aunque saliera, iba al final del grupo plegado de Ajustes, y solo abría la página de GitHub:
  bajar un `.vsix` e instalarlo a mano no es algo que un alumno no técnico vaya a hacer.

## Scope

**Dentro**

- «Actualizar ahora»: baja el `.vsix` de la última release, comprueba que es el de ese sitio y esa
  versión y que ha llegado entero (la huella `sha256` que publica GitHub), lo instala en el editor y
  ofrece recargar. Con su clic, como hasta ahora: nada se instala solo.
- El aviso, arriba y a la vista, como el consejo, con «Ahora no»; y en Ayuda, qué versión es esta y el
  botón si hay otra.
- Si no se puede ponerla sola, se dice y se ofrece la página, y el motivo va al informe de «Algo va mal».
- Diccionario, decisión y pruebas.

**Fuera, y por qué**

- **Instalarla sin preguntar.** Una extensión que se cambia sola a espaldas de quien la usa es lo que
  este proyecto no hace (`version.js`).
- **La tienda del editor**: la barra va a ser cerrada. `publicar-tiendas.sh` sigue ahí si algún día sí.

## Checklist

- [x] 1. `version.js`: la última con su paquete, bajarla, comprobarla e instalarla.
- [x] 2. La barra: el aviso arriba, Ayuda, recargar, y el camino de repuesto.
- [x] 3. Diccionario, decisión 132 y todas las comprobaciones en verde.
- [x] 4. Revisión adversaria: esto baja e instala código.

## Evidence

- `humo.js`: **342 comprobaciones pasadas**, tres nuevas. Siete formas de no ser de fiar que no se
  bajan; lo cortado, lo cambiado, lo igual y lo viejo, que no se instalan; y el camino entero: arriba, un
  clic, recargar, la página de repuesto y los tres días apartada. Contrato, diccionario y PowerShell, en
  verde.
- **Nueve mutaciones, las nueve tumbadas**: sin huella, sin tamaño, de cualquier sitio, aunque no sea
  más nueva, sin huella también vale, puesta y ofreciendo actualizar, «Ahora no» sin apartar, sin la
  página de repuesto, y con lo recordado sin volver a mirar.
- **Revisión de seguridad**: nada de colar otro paquete ni de instalar sin clic. Dos importantes y un
  menor, arreglados: techo de 64 MB, un corte de verdad de la descarga (y no bajar la que anuncia otro
  tamaño), y una descarga a la vez. Cuatro mutaciones más, tumbadas. La del corte sobrevivía porque
  `humo.js` terminaba a medias con código 0: ahora la batería falla si no llega al final (probado con una
  colgada a propósito). **342 comprobaciones**, y contrato, diccionario y PowerShell en verde.

## Next

- **Publicar una versión** para que llegue. Ojo: quien tenga la 0.42.0 **no verá el aviso**, porque en
  esa versión no se pintaba (decisión 131). Esa vez hay que pasarles la nueva como siempre, a mano o con
  el instalador; a partir de ahí, se ponen al día solos.
- Lo que no se ha probado en un ordenador de verdad, como prerelease primero (decisión 132).
- Si el repositorio pasa a privado, esto y los avisos necesitan un sitio público (decisión 132).
