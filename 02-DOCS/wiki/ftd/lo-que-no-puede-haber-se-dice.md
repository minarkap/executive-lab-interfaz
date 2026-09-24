---
type: ftd
title: Lo que no puede haber se dice, y cuatro habilidades vuelven a su sitio
date: 2026-09-22
status: hecho
---

# Lo que no puede haber se dice

## Intent

Jose pidió revisar que el mapeo entero funciona con Codex, y que el tema se coja bien. La revisión
(22-09-2026, sobre una carpeta de Codex montada entera en temporal) salió limpia en casi todo —el
mapa de sitios, las habilidades de `.codex/rsc`, los ayudantes en TOML, `AGENTS.md` mandando sobre
`CLAUDE.md`, los permisos, la radiografía, el tema con sus seis casos— y dejó tres agujeros. Los
tres son de la misma clase: **la barra enseña un cero donde no puede haber otra cosa, y no lo
dice**, que es la forma de fallar que este proyecto persigue desde el principio.

1. La pantalla de Comandos con Codex dice «Todavía no hay ninguno. Se van creando conforme repites
   tareas» y ofrece **Crear un comando**. Con Codex no puede haber ninguno nunca: RSC no le escribe
   comandos. La barra lo sabe (`donde.puedeTenerBotones()`), la principal sí lo explica, y esta
   pantalla no se enteraba.
2. Con Codex no hay guardianes. RSC no le engancha ninguno —`generatedHookFiles()` hace
   `if (target !== 'claude') return []`—, así que el freno ante órdenes peligrosas, que es el que
   protege a un alumno no técnico, no existe en un arnés de Codex. La barra no lo decía: la sección
   salía con un `0` al lado y solo la memoria dentro. Y «Lo que tiene apagado» seguía nombrando
   cuatro piezas que con Codex ni se instalan.
3. `bro`, `eli5`, `show-me` y `unslop` están en el perfil mínimo de RSC: las trae **todo** arnés.
   No estaban ni en `capacidades.json` (242 de 273) ni en la lista de fontanería (27), así que la
   barra las enseñaba como «Instalada aquí, fuera del catálogo» — la etiqueta de algo escrito a
   mano. En esta misma carpeta: 34 instaladas = 27 de serie + 1 del catálogo + 2 propias + esas 4.

## Scope

**Dentro**

- `pantallaComandos`: con un asistente sin comandos, se dice y no se ofrece crear uno.
- `sitios.js` (las dos copias): una columna nueva que diga si RSC le engancha frenos a ese
  asistente, sacada de su instalador y no adivinada. `donde.puedeTenerFrenos()`.
- `pantallaReglas`: el contador cuenta lo que hay dentro, y con un asistente sin frenos se explica
  en vez de enseñar un cero.
- `reglas.loApagado()`: solo nombra lo que en esta carpeta podría estar puesto.
- `capacidades.json`: las cuatro que faltaban, con nombre, frase, palabras y `para`.
- Una prueba que exija que **toda** habilidad del catálogo de RSC esté colocada: o en el catálogo de
  la barra o en la lista de fontanería. Es la que habría cazado la tercera.

**Fuera, a propósito**

- Quitar el botón «Comandos» de la principal con Codex: se queda, porque la pantalla ya explica por
  qué no hay ninguno, y esconderlo deja la pregunta sin sitio donde contestarse.
- Que la barra monte frenos donde RSC no los monta. No es nuestro.
- Los cambios sueltos que ya había en el árbol al empezar (`.claude/`, `.rsc.json`,
  `user-profile.md`): no son de esta feature.

## Checklist

- [x] Con Codex, la pantalla de Comandos dice que ese asistente no trabaja con comandos y no ofrece crear uno — pantalla pintada en la prueba.
- [x] Con Claude no cambia nada de esa pantalla — las dos entradas nuevas de la lista de pantallas.
- [x] `sitios.js` dice quién puede tener frenos, y las dos copias siguen siendo idénticas — prueba de las copias.
- [x] Con Codex, Las reglas explican que no hay frenos; el contador cuenta guardianes + automatismos — pantalla pintada.
- [x] «Lo que tiene apagado» no nombra con Codex piezas que allí no se instalan — `loApagado()` en la carpeta de Codex.
- [x] Las cuatro habilidades salen como del catálogo, no como de fuera — `queSabe()` sobre esta carpeta.
- [x] Toda habilidad del manifiesto de RSC está en el catálogo o en fontanería — prueba nueva.
- [x] `humo.js`, `empresas-distintas.js` y `comprobar-diccionario.js` en verde.
- [x] Añadido sobre lo previsto: al cambiar de asistente se dice que ahí se queda sin frenos — es el momento en que alguien lo decide.

## Evidence

Todo observado el 22-09-2026 sobre la rama `lo-que-no-puede-haber-se-dice`.

- **Comandos con Codex**, pantalla pintada después de la principal (que es la que fija la bandera):
  «Comandos · Peticiones guardadas con nombre… · **Tu asistente no trabaja con comandos. Pídele las
  cosas escribiéndolas en la conversación.** · ☆ Fijar alguno arriba». Sin *Crear un comando*.
  Con Claude, la misma pantalla sigue diciendo «Se van creando conforme repites tareas» y ofreciendo
  crearlo.
- **Las reglas con Codex**: «Lo que se comprueba solo **1** · Tu asistente no trae frenos: solo se le
  enganchan a Claude. Aquí nada te va a parar antes de hacer algo. · Y lo que hace solo, sin parar
  nada: ● La memoria entre conversaciones». `loApagado()` → `[]`, y la radiografía ya no saca la
  pieza «Lo que tiene apagado».
- **Las reglas con Claude** (esta carpeta, leída de verdad): `puedeTenerFrenos: true`, tres
  guardianes (`noAplica` · `apagado` · `armado`), nueve automatismos, y lo apagado sigue siendo
  «Formato al guardar en git · Recogida de copias de trabajo · La revisión periódica de habilidades ·
  El aviso de arnés duplicado · Documentación al día (context7)». El contador pasa de 3 a 12, que es
  lo que hay dentro.
- **Las cuatro habilidades**, `queSabe()` sobre esta carpeta: `fuera del catálogo → (ninguna)`;
  `del catálogo → automation-strategy · bro · eli5 · show-me · unslop`. Antes: las cuatro en «fuera
  del catálogo».
- **El tema**, seis casos, todos correctos: sin récord → la de Executive Lab; logotipo de tira →
  `<img class="marca">`; solo el símbolo → símbolo + nombre; sin logotipo → el nombre escrito; marca
  oscura → `#0d1117` / `#89d2e0` y manda también con tema oscuro; fondo gris medio → descartada
  diciendo por qué. 16 colores en la paleta.
- Suites: `node extension/prueba/humo.js` → **190 comprobaciones pasadas** (una nueva: «y además cae
  en un montón»; ampliadas la de la empresa de Codex, la de los montones, la de cambiar de asistente
  y la lista de pantallas, que pasa de 27 a 29). `empresas-distintas.js` → `las tres empresas,
  enteras`. `docs/comprobar-diccionario.js` → limpio. `herramientas/revisar-powershell.js` → sin
  pegas.

## Next

Nada pendiente de esta feature. Guardar en git y subir la versión de la barra siguen siendo decisión
de Jose. Lo que no se ha tocado, a propósito: que con Codex no haya frenos —eso es de RSC— y el
botón «Comandos» de la principal, que se queda porque ahora lleva a una pantalla que lo explica.
