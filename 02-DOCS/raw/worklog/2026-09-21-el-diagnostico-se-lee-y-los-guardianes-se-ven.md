---
type: worklog
title: El diagnóstico del arnés se lee, y los guardianes se ven
description: «Qué falta por montar» pedía tres diagnósticos a RSC y leía uno, así que podía decir que no faltaba nada con el arnés roto. Y los guardianes, lo único que puede bloquear a un alumno, no se nombraban en ningún sitio. 0.21.0.
timestamp: 2026-09-21T23:59:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose preguntó si dejaría «Seguir donde lo dejé» como está, y qué más se podía hacer. Contestar eso
obligó a mirar de cerca tres sitios, y en dos había algo peor que un rótulo mal puesto.

## 1 · La pantalla que podía decir que todo estaba bien

`terreno.radiografia()` recibe `aFondo`, que viene de `reconocer({profundo: true})`. Ese reconocer
lanza **tres procesos** en paralelo: `doctor --json`, `repair --dry-run` y `reassess`. La pantalla
leía **uno**, el de `reassess`. Los otros dos se calculaban, se congelaban en el objeto y no los
miraba nadie.

No es solo gasto. Es que la única fuente capaz de decir «este arnés está roto» era una de las dos
que se tiraban. Una pantalla llamada «Qué falta por montar» podía responder que no faltaba nada con
habilidades declaradas y ausentes del disco, que es justo el estado en el que la barra pinta botones
que no responden.

Tres piezas nuevas, todas con su salida:

| Pieza | De dónde sale | Qué ofrece |
|---|---|---|
| Lo que debería estar puesto | `missing`, `missingAgents`, `missingCommands` | Traerlas de un clic |
| Cosas del arnés fuera de sitio | `repair --dry-run` | Un clic si son `[fix]`; si hay un `[ask]`, no |
| Copias que guarda el arnés | `backups` | Solo informa: son ocho aquí y no se veían |

Lo de separar `[fix]` de `[ask]` no es cosmético y ya estaba escrito en el plan: `repair --yes` a
ciegas aplicaría también los `[ask]`, y uno de ellos mueve el arnés a otro asistente.

## 2 · Los guardianes, que son lo único que puede decir que no

RSC engancha tres comprobaciones antes de cada orden, y pueden denegarla. No se nombraban en ningún
sitio de la barra. Quien recibía un bloqueo veía un mensaje en inglés que empieza por `BLOCKED`, sin
ningún sitio donde mirar qué había pasado.

- **Freno ante órdenes peligrosas** (`danger-guard`). El que más importa aquí: RSC lo activa **solo
  si el perfil dice que no eres técnico**, o sea con todos los alumnos de esta barra y con nadie
  más. Está escrito exactamente para este público y este público no sabía que existía.
- **Formato al guardar en git** (`gitmoji-guard`). El que apagamos aquí, y el de la issue 258.
- **Aviso de trabajo a medias** (`ship-guard`).

Van en «Las reglas», junto a las que el asistente respeta: son lo mismo, solo que estas las aplica
una máquina. Y se leen **del disco sin lanzar nada**: cada guardián mira su propio `.rsc/.no-X` para
saber si está apagado, así que mirar ese fichero es leer exactamente lo que él leerá. El informe del
doctor también lo sabe, pero cuesta un proceso, y esta pantalla se abre para leer.

**Tres estados, no dos.** Armado, apagado a propósito, y «contigo no actúa» para el perfil técnico.
Sin el tercero, un guardián que no actúa parece una avería y es una decisión. El sufijo del
interruptor no es uniforme —el de gitmoji es `.no-gitmoji`, no `.no-gitmoji-guard`— así que va
escrito uno por uno, y una prueba lo contrasta contra el código del propio guardián.

## 3 · El raíl que describía en vez de delegar

`seguir.md` decía «mira el checkpoint local del arnés» en prosa y, dos líneas más abajo, que una
vuelta inventada es peor que una corta. Le pedía que no se la inventara sin darle el mecanismo para
no hacerlo. RSC tiene el patrón resuelto en sus propios comandos: delegan y no reproducen el método
del otro. Ahora delega en `/resume-session`, con `rsc memory resume` como respaldo, y se queda con lo
único nuestro: el idioma y la forma de contarlo.

**El rótulo no cambia.** «Seguir donde lo dejé» es una acción y el diccionario pide verbo primero.
No es el caso de «Lo que sabe hacer», que nombraba una cosa con una frase sobre el asistente.

## Lo que dije que estaba mal y no lo estaba

Conté como cuarto hallazgo que `guardar.md` era un raíl muerto por no llevar `boton:`. Al abrirlo,
el propio fichero ya explicaba por qué: la barra tiene un botón fijo de guardar y saldría dos veces.
Estaba decidido y escrito donde tocaba. Solo le ajusté el vocabulario a «Guardar en git».

## Ficheros tocados

- `extension/src/rsc.js` — `queGuardianes`, `queCopiasDelArnes`, `queFaltaEnDisco`.
- `extension/src/terreno.js` — tres piezas nuevas en la radiografía.
- `extension/src/reglas.js` — `losGuardianes()`, leído del disco.
- `extension/src/nombres.js` + `media/nombres.json` — el montón `guardianes`.
- `extension/media/panel.js` — «Lo que se comprueba solo» en Las reglas.
- `skills/comandos/seguir.md` y `guardar.md`, con sus copias en `media/railes/`.
- `docs/diccionario.md`, `docs/decisiones.md` (99), `02-DOCS/wiki/harness/decisions.md`.

## Cómo quedó

177 comprobaciones y las tres empresas enteras, diccionario limpio. Las tres pruebas nuevas se
comprobaron **reinsertando el fallo** una por una: tirar lo que dice `repair`, pintar un guardián
apagado como armado, y devolver el raíl a la prosa. Las tres rompieron. 0.21.0 empaquetada e
instalada.

## Siguiente

Sin cambios: el montaje fallido en la carpeta de Jose, Windows, las tiendas, y la rama de poner al
día con un arnés 1.4.1 real.
