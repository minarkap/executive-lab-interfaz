---
type: worklog
title: Las cosas se llaman por lo que son, y todo lo instalado se ve
description: Jose paró las perífrasis («Lo que sabe hacer», «Ayudantes», «Procesos con un clic»). Se revisó el mapeo RSC ↔ barra entero, se encontró un agujero de 27 habilidades y un botón que no invocaba nada, y el arnés propio deja de arrastrar react. 0.20.0.
timestamp: 2026-09-21T23:30:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose: *«revisa todo bien, que haya un mapeo correcto entre RSC y la extensión y que funcione
correctamente. También que no haya "simplificaciones" excesivas como llamar a las skills "Lo que sabe
hacer" y esas tonterías»*.

Se leyó el paquete RSC 2.0.5 que viaja dentro (`targets/commands.js`, `targets/agent-catalog.js`,
`scripts/lib/default-skill-floor.js`, `scripts/lib/onboarding.js`, el manifiesto) y se cotejó, cosa
por cosa, con lo que la barra lee y enseña. Salieron cuatro fallos y una regla.

## 1 · Los nombres

La barra había ido sustituyendo los nombres de RSC por perífrasis sobre el asistente: *Lo que sabe
hacer*, *Puede aprender*, *Ya sabe*, *Ayudantes*, *Procesos con un clic*, *Tus botones*, *Con quién
hablas*, *Lo que le has dado*, *Lo que ha hecho*, *Lo que sabe de*. Y las habilidades del catálogo se
llamaban por una frase: `invoicing` era «llevar tus facturas de principio a fin».

Ahora:

| Antes | Ahora |
|---|---|
| Procesos con un clic (comandos) · Tus botones | **Comandos** |
| Ayudantes (agentes) | **Agentes** |
| Lo que le has dado | **Documentos entregados** |
| Lo que ha hecho | **Resultados** |
| Con quién hablas | **Tu asistente** |
| Lo que sabe de X | **Conocimiento de X** (grupo: Conocimiento (wiki)) |
| Ya sabe · Puede aprender · Las tuyas · Puestas por el camino | **Instaladas · Del catálogo · Propias de esta carpeta · Instaladas fuera del catálogo** |
| Que lo aprenda | **Añadir** (que es lo que hace: `rsc add`) |
| «llevar tus facturas de principio a fin» | **Facturación** (y `invoicing` en la (i)) |

Es la **cuarta regla del diccionario**: una clase de cosa se llama por su nombre, en español, con el
término de clase entre paréntesis cuando en clase se dice en inglés; una cosa concreta por el suyo,
nunca por una frase. Una prueba nueva vigila que las perífrasis no vuelvan a `panel.js`, `src/` ni al
manifiesto.

## 2 · El mapeo tenía un agujero de 27 habilidades

La 2.0 monta 32 habilidades. La barra enseñaba cinco y descontaba 27 como «fontanería» sin nombrar
ninguna: el comentario decía «se resume en una línea» y la línea no existía. Eso no es simplificar.

Ahora `saberes.queSabe()` reparte **todo** lo instalado en cuatro montones —propias, del catálogo,
fuera del catálogo, del arnés— y devuelve `instaladas`; una prueba exige que la suma cuadre con
`rsc.habilidadesPuestas()`. Las del arnés van plegadas bajo *Las del arnés*, con su nombre en
español (`orient` → Brújula, `specify` → Especificar…) y su identificador en la (i). El buscador las
encuentra también por el identificador: quien oyó «orient» en clase da con «Brújula».

## 3 · El botón de una habilidad no la invocaba

Mandaba «Quiero <frase>. Pregúntame lo que necesites»: gramática rota («Quiero busca las marcas…»)
y, peor, ni nombraba la habilidad ni la disparaba. En `targets/commands.js` RSC lo dice:
`claude: { skillsAreCommands: true }` — para Claude las habilidades **son** comandos, y por eso no
le escribe un comando por habilidad como a Cursor. Así que el botón manda `/unslop`, exactamente lo
que se escribiría a mano, y la (i) lo enseña como *Se escribe `/unslop`*. Con Codex y los demás, con
palabras y nombrando la habilidad. Lo mismo para los agentes: se lanzan por su identificador
(`Usa el agente «cobros-atrasados»…`), no por su rótulo. Las fijadas arriba mandan lo mismo que su
pantalla.

## 4 · Lo que trae RSC, con nombre en español, entero

`nombres.json` pasa de 8 filas a 55, y una prueba **lee el paquete de RSC** para exigir que nada se
quede sin nombre:

- los **20 comandos fijos** que RSC puede escribir (`FIXED_COMMANDS`): los cuatro de memoria con
  Claude, y los de la cadena SDD que escribe como comando para Cursor, Copilot, Windsurf…;
- las **31 habilidades** del arnés (las cuatro del suelo y la fontanería);
- los **4 agentes base** (`developer`, tres `refuter-*`) y **dos patrones** para las familias
  `<lenguaje>-reviewer` y `<lenguaje>-build-resolver`, que son más de veinte y crecen con cada
  versión: `react-reviewer` → «Revisor de React».

Los agentes eran el único sitio de la barra por donde se colaba inglés: RSC escribe `name` en clave y
`description` en inglés y los dos salían tal cual. Ahora pasan por la misma regla que comandos y
habilidades (`nombres.enEspanol`, ahora compartida).

Y el **catálogo curado pasa de 25 a 59**: las de negocio que la 2.0.5 trae y no estaban —atención al
cliente, actas de reuniones, firma electrónica, reseñas y reputación, previsión de ventas, envíos y
devoluciones, marca registrada, términos y condiciones, seguimiento de proyectos, estudio de
mercado…—, cada una con nombre, frase, palabras y para qué clase de carpeta. Todas existen en el
manifiesto 2.0.5. Con 59, la pantalla pliega las que no pegan con lo escrito.

## 5 · El arnés propio arrastraba `react`

El plan se reaceptó esta tarde con la evidencia limpia (decisión 93) y `react` seguía ahí, con
`react-reviewer`, `react-build-resolver`, `react-build`, `react-review` y `build-fix`. Leyendo
`onboarding.js:226`: RSC **conserva en cada plan nuevo las habilidades declaradas que ningún perfil
reparte**, porque las toma por pedidas a mano con `rsc add`. `react` no tiene perfiles, así que la
contaminación del editor descargado se había quedado fijada para siempre por esa regla.

Se quitó de `skills` en `.rsc.json`, se pidió el plan (`a552da0e…`, sin react en ningún sitio) y se
aceptó. En disco quedan los cuatro agentes base y los cuatro comandos de memoria; el `.rsc/.no-gitmoji`
sigue, y `optOuts` sigue diciendo `gitmoji`.

## Y una tercera cosa para Eric

Cada compactación imprime en rojo «Hook JSON output validation failed»: `session-memory-adapter.mjs`
contesta a `PreCompact` con `hookSpecificOutput`, y Claude Code no lo admite para ese evento. Es
cosmético y es de RSC; está en `docs/para-rsc.md` como punto 3. No se abre issue sin que Jose lo diga.

## Ficheros tocados

- `extension/media/nombres.json` · `capacidades.json` — las dos tablas.
- `extension/src/nombres.js` (patrones, `enEspanol` compartida) · `saberes.js` (cuatro montones,
  `comoSePide`) · `agentes.js` (tabla, español, `prompt`) · `fijadas.js` · `buscar.js` · `consejos.js`
  · `acciones.js` · `terreno.js` · `arrancar.js` · `extension.js`.
- `extension/media/panel.js` — pantalla de habilidades rehecha; rótulos.
- `extension/package.json` — 0.20.0 y cinco títulos.
- `extension/prueba/humo.js` — cinco pruebas nuevas, siete al día.
- `docs/diccionario.md` (cuarta regla, filas) · `docs/decisiones.md` (98) · `docs/para-rsc.md` (3)
  · `02-DOCS/wiki/harness/decisions.md`.
- `skills/executive-lab/SKILL.md` (+ copia en `media/railes/`) · `.claude/skills/texto-de-la-barra/SKILL.md`.
- `.rsc.json` y lo que RSC reescribe al aceptar el plan.

## Cómo quedó

173 comprobaciones y las tres empresas enteras; diccionario limpio. 0.20.0 empaquetada e instalada.

## Siguiente

Lo de siempre, que no depende de esto: el montaje fallido en la carpeta de Jose (hace falta el
informe de «Algo va mal»), Windows, las tiendas, y probar `ponerAlDia` con un arnés 1.4.1 real.
