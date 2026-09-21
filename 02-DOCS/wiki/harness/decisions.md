# Harness decisions

- Accepted plan `434ebdda2d12e72195a3b0a9ba0e57e6171e56ae1f19bc4f89d93223d9ae36a3`.
- Project kind: software.
- SDD: deferred.

## Auditoría del arnés para Codex y para Claude — 18 de septiembre de 2026

Informe entero en `docs/auditoria-codex-y-claude.md`. Lo que cambió de fondo:

- **La tabla de dónde mira cada asistente es una sola**, en `skills/sitios.js`, sin dependencias, y la
  leen los dos que la necesitan: la barra y el instalador de raíles. Antes cada uno tenía la suya y se
  separaron.
- **Los raíles se ponen donde mire el asistente de esa carpeta**, no siempre en `.claude/`. Con Codex
  van a `.codex/rsc/`, no se escriben comandos —RSC no le escribe ninguno— y se le apunta a la
  habilidad desde `AGENTS.md`. Con un asistente desconocido, no se escribe nada.
- **Los avisos del arnés que mandan al alumno a una terminal se callan desde los raíles**: `.no-audit`,
  `.no-worktree-cleanup` y `.no-scope-check`. Se dejan los que valen la pena (que avise si falta git,
  la higiene del `CLAUDE.md`). Queda abierto el aviso de versión nueva, que necesita
  `RSC_NO_UPDATE_CHECK` y probarse en Windows.
- **La versión del arnés se fija exacta**, sin rango: `^1.4.1` permitía que un `npm install`
  empaquetara otro catálogo. Una prueba compara los cinco sitios donde se escribe.
- **Publicar no pisa una versión ya publicada.** `publicar.sh` se para y pide subir el número.
- **Pendiente de decidir:** los cuatro aplazamientos del plan (`base-agents`, `code-hooks`, `sdd`,
  `gitmoji-guard`) se decidieron sobre un proyecto de 14 ficheros y hoy hay 41 módulos y dos ayudantes
  escritos a mano. Reconsiderarlos cambia cómo el arnés gobierna esto, así que lo decide Jose.

## Cuando algo falla, el alumno tiene que poder contarlo — 19 de septiembre de 2026

Montar el arnés falló en una carpeta ya empezada y salieron dos defectos encadenados, los dos en el
camino que existe precisamente para cuando algo va mal. Worklog:
`02-DOCS/raw/worklog/2026-09-19-el-socorro-no-estaba-donde-se-le-llamaba.md`.

- **El aviso que nombra un botón lo trae consigo.** "Algo va mal" cuelga de Ayuda, y Ayuda solo sale
  cuando ya hay arnés — o sea, nunca en la pantalla donde el aviso de un montaje fallido aparece. Se
  arregla en `bloqueAviso()`, no en esa pantalla: quien lo nombra, lo ofrece.
- **El informe de incidencia lleva dentro el motivo.** El detalle del fallo se escribía en el panel de
  salida de VS Code y se quedaba ahí; el código de seis letras que el alumno le dicta a su tutor no lo
  llevaba. El canal se envuelve (`extension/src/rastro.js`) y el informe pega las últimas 300 líneas.
- **Diagnosticar una carpeta sin arnés no le fabrica medio arnés.** El informe creaba
  `02-DOCS/raw/incidencias/`, que es una de las piezas del suelo que estaba diagnosticando. Sin suelo,
  se escribe fuera del proyecto.
- **Un parte de fallo va entero**: código de salida y las dos salidas. Antes era `error || salida` y se
  quedaba con el canal vacío cuando el arnés escribía el motivo en la salida normal.

Queda abierto: `claude-vscode.primaryEditor.open` no da error pero no mete el texto, así que los
botones abren una sesión vacía. Confirmar la firma real necesita leer la extensión instalada, que está
fuera del directorio de trabajo.

## A Claude se le habla por su enlace — 19 de septiembre de 2026

Los botones de la barra abrían una conversación vacía. Worklog:
`02-DOCS/raw/worklog/2026-09-19-a-claude-se-le-habla-por-su-enlace.md`.

- **El enlace es el único camino que entrega el texto.** Probado con Claude Code 2.1.276: el enlace
  `vscode://anthropic.claude-code/open?prompt=…` lo deja en la caja; `editor.open` y
  `primaryEditor.open` abren una conversación vacía, aunque el manejador del enlace llame a uno de
  ellos. Lo que se pierde se pierde dentro de su ventana: `keep_opened` y `teleport` —el control
  remoto— se quedan con la sesión y descartan el texto. Orden nuevo: enlace, comandos, portapapeles.
- **`claude-vscode.focus` no enfoca.** Entrega una mención y, si nadie puede cogerla, abre otra
  conversación. No se llama después de mandar un texto.
- **El texto se deja escrito, no se envía.** La barra dejó de prometer lo contrario.

Lo que la barra dice de cada asistente está medido, con versión y fecha, en `asistentes.js`. Cuando
Claude Code cambie de versión, esa tabla es lo primero que hay que volver a probar.

## Y el fallo estaba en casa — 19 de septiembre de 2026

Cierre del anterior. Lo que Jose veía no lo causaba nada de Claude Code: la pantalla principal
rehacía la acción de cada botón de Acciones rápidas leyendo `a.prompt`, y `fijadas.js` la manda
dentro de `a.accion`. Todos mandaban un texto vacío. **La acción se coge tal cual viene.**

Lo de las decisiones 77 y 78 sigue siendo cierto y sigue puesto —el enlace es el único camino que
entrega el texto, y `claude-vscode.focus` no enfoca— pero no era el fallo de Jose.

Lección: **antes de leer el código de otro, comprobar qué se le está mandando.**

## Una cosa es un botón — 19 de septiembre de 2026

Las tres listas de la barra —comandos, habilidades y ayudantes— pintaban cada cosa en tres bloques
con un botón que ponía "Hacerlo". Worklog: `02-DOCS/raw/worklog/2026-09-19-una-cosa-es-un-boton.md`.

- **Una cosa es el botón, con su nombre.** Lo que hace se despliega desde una (i) pegada, sin
  repintar — repintar tira el scroll, y en una lista de veinticinco eso es perder el sitio.
- **Los ayudantes dejan su apartado propio** y se meten en Acciones, con comandos y habilidades. Un
  desplegable entero para un solo botón no es un apartado.
- **Las habilidades pasan a tener botón.** Eran una lista que no se podía usar.
- **"Hacerlo" no es un rótulo**: nombra el acto, no la cosa. El mismo fallo que ya está escrito en
  la habilidad `texto-de-la-barra`, colado en tres pantallas.

## El arranque sabe llegar desde donde sea — 20 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-20-el-arranque-sabe-llegar-desde-donde-sea.md`.

Cuatro momentos: **reconocer → decidir → aplicar → comprobar**. Nueve estados de carpeta donde había
cinco, un despachador que es una función pura, seis caminos nuevos, y una lista final en la que toda
pieza que falta trae su salida.

- **Determinista**: clasificar, decidir la rama, calcular qué preguntar, correr `onboard`/`sync`/
  `repair`/`doctor`, poner los raíles, escribir los nombres, decidir si se escribe en el historial, y
  **comprobar si un encargo quedó hecho**.
- **Del agente**: ordenar claves fuera de sitio, enterarse de qué hay en una carpeta que ya era de
  alguien, levantar el suelo que `repair` no sabe levantar. Siempre con contrato de cuatro partes y
  con una función que mira el disco después.

Dos cosas de RSC que cambian cómo se le habla: `repair` **no** levanta un suelo ausente (eso solo lo
hace `onboard`), y `repair --yes` a ciegas puede mover el arnés a otro asistente.

- Accepted plan `e44b265806af20e835ac620ad14c4f291696db61373776ef6bb894a3d5fc1d9b`.
- Project kind: software.
- SDD: selected.

- Accepted plan `e7a924dd80dd5d0199f76da6c571384d664c5899e6f941477c789c3817182dfb`.
- Project kind: software.
- SDD: selected.

## El arnés sube a la 2.0.5 — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-el-arnes-sube-a-la-2-y-el-plan-deja-de-mentir.md`.

- **Lo que no cambió, que es lo que importa**: las tres tablas de `targets/` son idénticas byte a
  byte entre 1.4.1 y 2.0.5, el esquema del manifiesto también, y ningún marcador que la barra lee.
- **La 2.0 instala un solo arnés para todos**: 32 habilidades en vez de 8. Qué es fontanería pasa a
  ser un dato en `nombres.json`.
- **El plan de este repositorio estaba construido sobre 1,6 GB de editores descargados** que viven
  dentro de la carpeta. `scanProject` no lee el `.gitignore`. Fuera, y la evidencia pasa a ser real.
  Regla nueva en la constitución (P8): lo que se descarga no entra en el proyecto.
- **Del guardián de commits nos salimos** con `.rsc/.no-gitmoji`: aceptar un plan no es aceptar que
  un instalador decida cómo se escribe aquí.
- **Se escribe la constitución**: ocho reglas, todas comprobables.

## Cierre: la excepción del guardián tiene que viajar — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-cierre-lo-que-queda-escrito.md`.

RSC guarda los interruptores de sus guardianes bajo `.rsc/`, que él mismo añade al `.gitignore`: la
decisión de un equipo no viaja y el guardián vuelve en cada clon. El campo `optOuts` de `.rsc.json`
ya existe, ya se rellena solo y sí se comitea — pero **nadie lo lee**: nueve apariciones en el
paquete, las nueve escrituras.

Rodeo en el `.gitignore` (`.rsc/*` + `!.rsc/.no-gitmoji`), y las dos cosas contadas para Eric en
`docs/para-rsc.md` con fichero y línea.

## Un arnés sin ajustar lo dice arriba — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-la-rama-adoptar-se-ve-y-lo-del-gitmoji-va-a-issue.md`.

La rama `adoptar` existía desde la 0.18 y solo se llegaba a ella entrando en «Qué falta por montar»,
que es donde no entra quien no sabe que le falta algo. Ahora sale en la pantalla principal, con su
botón, decidido por `rumbo` — el mismo que decide el arranque, y sin lanzar ni un proceso.

Y el fallo de `optOuts` queda abierto en el repositorio de RSC:
[ericrisco/rsc-harness#258](https://github.com/ericrisco/rsc-harness/issues/258).

## Las cosas se llaman por lo que son — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-las-cosas-se-llaman-por-lo-que-son.md`.

Jose paró las perífrasis: *«que no haya "simplificaciones" excesivas como llamar a las skills "Lo
que sabe hacer"»*. Tres consecuencias, ahora comprobadas por pruebas:

- **Nombres**: Habilidades (skills) · Comandos · Agentes · Conexiones (tools) · Conocimiento (wiki).
  Una habilidad se llama por su nombre («Facturación»), no por una frase. Cuarta regla del diccionario.
- **Mapeo completo**: las 27 habilidades que la 2.0 monta para funcionar se ven, plegadas y en español.
  Todo lo que RSC puede escribir —20 comandos, 31 habilidades, agentes base y dos familias— tiene
  nombre en `nombres.json`, y una prueba lee el paquete para exigirlo.
- **Invocación real**: el botón de una habilidad manda `/su-identificador` (RSC: para Claude las
  habilidades son comandos). Los agentes se lanzan por su identificador.

Y el arnés propio deja de arrastrar `react`: RSC conserva las habilidades declaradas que ningún
perfil reparte (`onboarding.js:226`), así que la contaminación de la decisión 93 se había quedado
fijada. Fuera de la declaración y plan reaceptado.


- Accepted plan `a552da0e4feb441e5467371100801fad5bf508dbef767c6c1e7a925844254203`.
- Project kind: software.
- SDD: selected.

## El diagnóstico del arnés se lee, y los guardianes se ven — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-el-diagnostico-se-lee-y-los-guardianes-se-ven.md`.

- **«Qué falta por montar» podía mentir**: lanzaba `doctor`, `repair` y `reassess` y leía solo el
  último. Podía decir «no falta nada» con el arnés roto. Ahora lee los tres, y añade lo declarado
  que no está en disco, lo que `repair` encuentra y las copias del propio arnés.
- **Los guardianes se ven en «Las reglas»**, leídos del disco sin lanzar nada. `danger-guard` importa
  más que ninguno: RSC lo activa solo con usuarios no técnicos, o sea con todos los alumnos.
- **El raíl de seguir delega** en `/resume-session` en vez de describir su mecanismo en prosa.

0.21.0. 177 comprobaciones, y las tres nuevas comprobadas reinsertando el fallo.

## Un recuerdo por ritmo de cambio — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-el-diagnostico-se-lee-y-los-guardianes-se-ven.md`.

`rsc.retomar()` cuesta un proceso de Node y se pedía en cada repintado: el caché de 20 s de la
brújula no lo cubría, porque el vigía repinta con `fresco` y se lo salta. Y hace bien, pero el
registro de continuación no cambia porque alguien toque un fichero. Ahora tiene su propio recuerdo
de un minuto, un fallo nunca se recuerda, y `brujula.olvidar()` lo tira al cambiar de carpeta.

Regla: **un recuerdo por ritmo de cambio, no uno por pantalla.**


## Los apartados se ordenan por lo que pesa, y el mapeo se cierra — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-los-apartados-se-ordenan-y-el-mapeo-se-cierra.md`.
Decisión 101 en `docs/decisiones.md`.

- **Habilidades en cuatro bloques, por peso**: Instaladas (propias, del catálogo y de fuera, juntas;
  el origen va en la (i)) · Sugerencias del catálogo · Resto del catálogo (plegado) · Las del arnés
  (plegado, al final). Los datos de `saberes.js` no cambian; la pantalla junta los montones. Los
  comandos del arnés, plegados igual. Esconderlos, no: decisión 98.
- **Los guardianes bajan al final de «Las reglas», plegados, y no se quitan**: el `BLOCKED` sale en
  la conversación y la barra no puede interceptarlo; este es el único sitio donde pone qué es.
- **Sugerencias abre la puerta a un agente** cuando no hay ninguno. Decidir aquí si «la carpeta
  merece uno», no: no se lee del disco.
- **`(inbox)` y `(out)`**, que existen en disco; `outbox` no. Y «coincidencias» en la búsqueda, porque
  «Resultados» ya era otra pantalla. La radiografía se queda con un nombre.
- **Los dos huecos del mapeo cerrados**: las lecciones de RSC en «Cómo te habla», y `optOuts` en la
  radiografía.

0.22.0. 179 comprobaciones: una nueva que fija el orden de los bloques, y dos ampliadas.

## El mapeo se completa: todo lo que RSC puede montar tiene nombre — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-el-mapeo-se-completa.md`.
Decisión 102 en `docs/decisiones.md`.

- **El catálogo entero, no una selección**: RSC trae 273 habilidades y la barra nombraba 90. Las 183
  restantes salían con el identificador humanizado y sin frase. Ahora todas tienen fila en
  `capacidades.json`, y una prueba lee el manifiesto del paquete para que no vuelva a faltar ninguna.
- **Los agentes por lenguaje, con su nombre**: «Revisor de Cpp» → «Revisor de C++». Tabla
  `patrones.lenguajes`. Y `spec-miner` → «Extractor de especificación».
- **Lo que hace solo, sin parar nada**: nueve piezas que el arnés engancha y que no bloquean a nadie
  (la brújula al empezar, el aviso del diario, la memoria entre conversaciones…) se nombran en el
  mismo desplegable que los guardianes, con su estado leído del disco.
- **Lo apagado, junto y en español**: `optOuts` de `.rsc.json` más los interruptores `.rsc/.no-*`,
  sin repetir y cada uno por su nombre.
- **El plan de montaje** (`installation-plan.md` + `acceptedAt`) se ve y se abre desde la radiografía.
- **Las ideas de automatización** que `skill-scout` apunta en `.rsc/automation-gaps.md` se cuentan en
  Sugerencias.

0.23.0. 181 comprobaciones.

## La cara sale de la web al montar — 21 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-21-la-cara-sale-de-la-web-al-montar.md`.
Decisión 103 en `docs/decisiones.md`.

- **La barra saca un primer intento de la cara de la empresa desde su web**, al momento, en
  `web.js`: nombre, acento, fondo, texto y logotipo, con `provisional: si` en `marca.md`. El
  asistente lo afina después. Sin red o sin color de marca no se escribe nada; una cara puesta a
  mano no se pisa.
- **El botón «Algo va mal» que faltaba en la captura** está en el código desde el 19-09: la barra
  instalada era anterior. Queda una prueba en esa pantalla exacta, y su botón de radiografía deja
  de ser un cuarto nombre.

0.24.0. 183 comprobaciones.

## Cada clave tiene un sitio, y una incidencia se resuelve desde la barra — 22 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-22-cada-clave-tiene-un-sitio.md`.
Decisión 104 en `docs/decisiones.md`.

- **El sitio de una clave lo define RSC**: `01-TOOLS/<HERRAMIENTA>/.env`, variables
  `<HERRAMIENTA>_<NOMBRE>`. Eso hace útil el desorden: el prefijo dice a qué herramienta va cada
  clave suelta.
- **`sueltas.js` inventaría y reparte**: todos los `.env*` (raíz, carpetas de primer nivel, y dentro
  de cada herramienta los que no son su `.env`), solo los nombres, y a qué herramienta va cada uno.
  El encargo al asistente lleva el plan hecho.
- **«Puesta, pero fuera de su sitio»**, no «falta»: una clave que existe en otro fichero o en el
  entorno del ordenador no falta, está mal guardada. Y los proveedores que existen por sus claves y
  no tienen carpeta salen como **«Por montar»**.
- **Resolver una incidencia** en Ayuda: el síntoma lo pone el alumno, el diagnóstico la barra, y el
  asistente audita la carpeta entera antes de tocar nada.
- Pendiente apuntado: las credenciales que no son variables (`.json` de cuenta de servicio, `.pem`).

0.25.0. 185 comprobaciones.

## Una credencial que es un fichero entero también tiene sitio — 22 de septiembre de 2026

Worklog: `02-DOCS/raw/worklog/2026-09-22-una-credencial-que-es-un-fichero.md`.
Decisión 105 en `docs/decisiones.md`. Cadena SDD completa: spec, plan, `analyze` y verificación en
`02-DOCS/wiki/sdd/`.

- **La mitad que faltaba de la 104**: una cuenta de servicio de Google o un certificado es un
  fichero entero, no una línea `CLAVE=valor`. Un Drive conectado así salía «sin conectar».
- **Se reconocen** por extensión, por nombre inequívoco o por lo que declaran dentro; de dentro
  solo salen `type` y `client_email`, que no son secretos.
- **Su sitio es `01-TOOLS/<X>/keys/`**, y lo que ya está ahí no es desorden. Una conexión con su
  fichero dice «con su fichero de acceso».
- **Vocabulario**: «fichero de acceso» y «cuenta de servicio de Google» entran; «certificado
  digital» se queda y «clave privada» se prohíbe.
- **Primera vez con la cadena entera en este repositorio**, y `config.yaml` no existía: ahora sí.
  Los gates encontraron cinco defectos que la lectura a ojo no vio.

0.26.0. 186 comprobaciones.

## Lo que el asistente escribe en 02-DOCS también se abre — 22 de septiembre de 2026

Decisión 106 en `docs/decisiones.md`.

- **La revisión de `rsc audit`** (`02-DOCS/audits/*.html`) se escribía y no la abría nadie. Sale en
  «Qué falta por montar» con su fecha y un botón. El aviso que la pide ya se nombraba desde la 102:
  faltaba el resultado.
- **`02-DOCS/wiki/sdd/verifications/`** entra en «En qué estamos» como «Qué se ha comprobado»: es
  lo que contesta «¿esto funciona?».
- **`sdd/decisions.md`** se junta con el del arnés en Decisiones: una decisión es una decisión.
- Fuera a propósito: `progress/`, `sessions/` y `archive/`, que son andamio de la cadena.

0.26.1. 187 comprobaciones.

## Un desorden enorme no puede ser una pared — 22 de septiembre de 2026

Decisión 107 en `docs/decisiones.md`.

- Probadas once carpetas raras contra el inventario de credenciales. Ocho bien; tres fallos.
- **120 claves** pintaban 104 KB y 123 botones, con un encargo de 22.576 caracteres. Ahora 19 KB y
  12 botones: se enseñan las primeras y **se dice cuántas quedan**, nunca se esconden sin contar.
- **La barra deduce el dueño del nombre de cada clave**, así que puede equivocarse: lo dice, y trae
  el botón «Esto no está bien» (P1: nada que se afirme sin salida).
- Ese botón cubre las dos correcciones: que sea de otra herramienta, o que **estén bien donde
  están** —un proyecto puede leerlas de la raíz a propósito—. En ese caso no se mueve nada y se
  deja escrito, para no repetir la conversación cada semana.

0.27.0. 188 comprobaciones.

## Unos raíles de la semana pasada se ven, y se reponen solos — 22 de septiembre de 2026

Decisión 108 en `docs/decisiones.md`.

- Los raíles se copian **al montar**, así que una carpeta de antes corre las reglas de antes. Con
  las reglas nuevas de credenciales, eso significaba que ninguna carpeta montada antes de hoy las
  conocía. Esta misma carpeta era una de ellas.
- `comoEstanLosRailes()` solo miraba si el fichero existe: «Puesto» quería decir «hay algo ahí».
  Ahora **compara el contenido** y hay un tercer estado, «Puesto, pero de una versión anterior»,
  con su botón.
- **Se reponen solos al abrir**, en silencio: reponer no es decidir, es dejar la carpeta con lo que
  ya declaró tener. Si falla, la lista de piezas lo dice.

0.28.0. 189 comprobaciones.
