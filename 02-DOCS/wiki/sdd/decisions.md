---
type: decisions
title: Decisiones tomadas construyendo (cadena SDD)
description: Registro de solo añadir de las decisiones que se toman mientras la cadena SDD construye. Las de fondo, numeradas, viven en docs/decisiones.md.
timestamp: 2026-09-24T15:52:00Z
topic: sdd
---

# Decisiones de la cadena SDD

Solo se añade. Cada entrada lleva fecha, feature y quién decidió.

## 2026-09-24 · todo-cuadra · specify

- **Una spec paraguas, no siete.** El programa entero tiene una sola spec, `specs/todo-cuadra.md`,
  y cada frente es una fase con su verificación, su decisión y su commit. La aprobó Jose en el plan.
  Si un frente crece, se saca a su propia spec.
- **La auditoría va como propuesta** (`proposals/todo-cuadra.md`), porque lleva fichero y línea y la
  spec se queda en qué y por qué.
- **Aprobada en autopilot, no punto por punto** (*«dale en autopilot»*, 24-09-2026). La spec se
  revisa después.
- **Las cuatro decisiones de Jose en la fase de plan:** freno propio donde RSC no pone el suyo; rama
  propia (`todo-cuadra`) esperando a las sesiones paralelas; confirmación en carpetas ajenas, y por
  cada nombre que choque se pregunta si sobrescribir o renombrar; y el Node de VS Code como relevo,
  con el oficial como plan B.
- **Suposiciones tomadas que Jose puede vetar en la parada de vocabulario:** `.no-gitmoji` en las
  carpetas de alumno (A11), y la puerta SDD que se queda para quien elige «irá creciendo».

## 2026-09-24 · todo-cuadra · clarify y revisión con ojos frescos

- **P4 se enmienda en la constitución.** P4 decía «no se renombra» sin excepción, y la decisión 3 de
  Jose pide renombrar o sobrescribir, con su sí, lo que choque. La enmienda deja las dos cosas solo
  con sí explícito y copia recuperable; sin respuesta, no se monta. La encontró la revisión con ojos
  frescos: es mejor enmendar que saltarse la regla.
- **D5 baja de medio a bajo.** `trato.js` ya lee las dos formas del dial y escribe donde estén
  (decisión 33).
- **A4 reutiliza** los cuatro escalones de «Cómo te habla»: un dial, un nombre.
- **El comportamiento con las credenciales dice «nunca entero»**, porque la barra enseña a propósito
  los cuatro últimos caracteres. La primera versión de la spec decía «ni en parte» y contradecía lo
  que ya hay.

## 2026-09-25 · todo-cuadra · parada de vocabulario (primera parte)

- **Jose: «Apagarlo».** Los raíles dejan `.rsc/.no-gitmoji` en las carpetas de alumno, con su
  motivo, igual que la decisión 94 hizo aquí (A11, T013).
- **Jose: «Dejarla».** La puerta SDD de cada turno se queda para quien elige «irá creciendo».
- **Vocabulario:** Jose pidió que se le explicara qué es. Queda pendiente de su sí.

## 2026-09-25 · todo-cuadra · parada de vocabulario (cerrada)

- **Tres preguntas fáciles en vez de «¿es algo pequeño o va para largo?».** Jose: *«grande y pequeño
  puede ser difícil de decidir para el alumno»*, *«no es lo mismo un departamento de 3 personas que
  de 50»* y *«una landing no es lo mismo que una plataforma completa SAAS multiidioma con
  backoffice»*. Queda así:
  - a todo el mundo, qué lleva la carpeta y cuántas personas están metidas;
  - con «Construir algo» o «Un poco de todo», qué va a construir. Solo esta decide el tamaño que se
    le manda a RSC.

  Jose, sobre el recorrido entero: *«Lo que consideres»*.
- **Los demás textos los decide el programa con su criterio**: *«gente no técnica que va a gestionar
  proyectos variados […] desde un departamento hasta un proyecto suelto, hasta una tarea puntual y
  hasta una empresa entera»*. Entran en el diccionario al usarse, y al cerrar cada fase Jose ve las
  pantallas pintadas.

## 2026-09-25 · todo-cuadra · implement, F1 (T008–T010)

- **El `rsc.aplicarPlan` del plan (§3) queda en un lector puro, `rsc.comoAcaboElMontaje()`, y
  `montarElArnes` sigue llamando a `rsc.correr`.** *Por qué:* un `aplicarPlan` dentro de `rsc.js`
  llamaba a `correr` por dentro, y el RSC fingido de `humo` no lo veía: la prueba habría montado con
  el RSC de verdad sin decirlo. Un solo punto de paso para fingir, y el contrato de las seis formas
  se prueba contra el RSC de verdad en `contrato.js`.
- **El botón de A3 es una pieza nueva, «Innegociables», en «Qué falta por montar».** Sale cuando el
  recibo pide la constitución (`floorPaths`) y no está. Es la parte de G7 que A3 necesita ya; lo
  demás de G7 (los ficheros de la plantilla) sigue en T7.7. *Por qué va aparte de
  `sueloDelArnes()`:* esas tres piezas las levanta volver a montar, y los innegociables no. Metidos
  allí, la carpeta se vería «a medias» y el arranque volvería a montar para nada.
- **`alcance` y `personas` solo se preguntan al montar de cero.** RSC no las pide, así que un clon o
  un montaje a medias no las vuelven a preguntar: el clon sigue preguntando una sola cosa.
- **Los valores en el perfil:** `alcance: tarea | proyecto | departamento | empresa` y
  `personas: solo-yo | 2-10 | 11-50 | mas-de-50`. Se entienden sin tabla, para el asistente y para
  quien abra el fichero.
- **Con «La empresa entera», el nombre se pregunta una vez**, y el arnés y la empresa se llaman
  igual. `identidad.titulo()` no lo repite, y el primer mensaje no dice «Es para» con el mismo
  nombre.
- **`.rsc/.no-gitmoji` se escribe siempre**, no solo cuando el plan trae el guardián (el plan decía
  «si el plan trae el guardián», §4, paso 7). *Por qué:* `repair` engancha los frenos aunque el plan
  no los pida (C6), y entonces el interruptor ya tiene que estar. En «Lo que tiene apagado» sale
  como lo que es: una decisión tomada.
- **El objetivo va en base64url**, que es el que usa RSC (`encodeGoal`); con el base64 de siempre,
  `decodeGoal` no lo acepta porque al recodificar no sale igual.
- **A13 se afina tras la revisión de F1:** el nombre lo sugiere lo que lleva la carpeta, no cuánta
  gente hay, que no dice nada de cómo se llama. Y alcance y personas se releen del perfil al volver a
  montar, porque RSC lo reescribe entero en cada plan aceptado. La spec y el plan, al día.
- **Una comprobación más de las que pedía el plan**, «lo que contesta el montaje se lee en sus seis
  formas, y nada más», con las líneas literales de RSC. Faltaba antes de mutar: ninguna otra prueba
  miraba un «a medias» o un «listo» de otra huella. La mutación M5, quitar la comparación con el
  recibo, solo la caza esta.

## 2026-09-25 · todo-cuadra · implement, F2 (T015–T030)

- **Las carpetas del sistema se comparan enteras, no lo de dentro** (T015): las carpetas temporales
  viven debajo de `/var`, y ahí se prueba todo. Lo mismo al buscar un proyecto por encima (T023): no
  se mira la carpeta personal ni lo de encima de ella, porque hay quien versiona ahí su
  configuración.
- **«Sobrescribir» solo existe con las habilidades** (T018). Medido con el paquete: con los comandos y
  los agentes, RSC deja el de la persona. Así que para ellos se elige entre renombrar el suyo y
  dejarlo. «Lo mismo para todas» es renombrarlas todas; lo demás, una a una.
- **El historial es nuestro por una marca y por su raíz** (T020): la marca local no viaja en un clon,
  la raíz sí. Los asuntos de la barra (punto de partida y copias) cuentan como raíz nuestra.
- **La pieza de las copias sin historial entró con T017**, que la necesitaba para su botón. T021 la
  deja probada por su lado.
- **`completar` pregunta lo que en el recibo no vale** (T024). No estaba en el plan: salió al probar
  B11, porque con un valor que RSC no acepta mandaba el montaje igual.
- **Los encargos que van en el primer mensaje se calculan al montar** (T026), porque después la
  carpeta ya no es «empezada». El párrafo de las claves, que armaba la extensión aparte, va con ellos.
- **Un recibo sin decisiones no se compara** (T029): es de una versión anterior, y no se sabe qué se
  firmó. RSC comprueba el plan igual al aceptarlo.
- **La sombra de RSC se descuenta por su plantilla** (T030): marca, título, las dos frases fijas y el
  comentario. Si RSC cambia la plantilla, la sombra contará como de alguien y se pedirá permiso de
  más, que es el lado seguro.

## 2026-09-25 · todo-cuadra · revisión de F2

- **En una carpeta de alguien, el historial va detrás del montaje** (I1), porque el sí se pide dentro
  del montaje. Antes del sí no se escribe nada, tampoco un `git init`. Medido con el paquete: RSC
  monta igual sin historial. Lo único que se salta es la línea de rescate del `.gitignore` cuando
  alguien ignora `.claude/` entera, que en una carpeta sin git es raro. *Alternativa descartada:*
  poner el historial dentro del montaje, entre el sí y la firma. Cambia la huella del plan, y habría
  que volver a pedirlo.
- **Lo que cambia entre dos planes se nombra con las claves que da RSC 2.0.5** (C2), medidas con el
  paquete. Las siete que entran de verdad al pasar de algo pequeño a algo que crece son `skill/sdd`,
  cuatro `agent/<id>`, `hook/code-hooks` y `guard/gitmoji-guard`. Las habilidades y los agentes van
  juntos y cada uno por su nombre (decisión 98), y los agentes se buscan en su tabla. «Formato al
  guardar en git» se nombra aunque los raíles lo apaguen: la firma es sobre lo que monta RSC, y lo
  apagado ya sale en «Lo que tiene apagado».
- **Renombrar se decide entero antes de mover nada** (I4). Un SKILL.md que es un enlace no se renombra:
  cambiarle el `name:` escribiría fuera de la carpeta. Se para y se dice cuál, como pide C-9.
- **La guarda de la carpeta personal cuenta como «sin declarar» un montaje a medias sin `.rsc.json`**
  (C1). Uno con su `.rsc.json` sigue funcionando, como antes de la guarda.
- **Quince menores quedan anotados para el cierre** (F9), con su sitio en la verificación de F2. No
  cambian lo que se promete, o tocan cosas que otras fases rehacen.

## 2026-09-25 · todo-cuadra · implement, F3 (T032–T038)

- **El relevo, y no el plan B** (T032): con la prueba del relevo en verde, lo que queda por medir es
  si el proceso del asistente hereda el PATH del anfitrión. El plan B, bajar el Node oficial, escribe
  fuera igual y necesita red. Si la medida en un VS Code de verdad sale mal, se pasa al plan B.
- **Ninguna ruta, en vez de una ruta mejor** (T033). Lo que se deshace se decide por lo que corre la
  orden (`.rsc/`, el arranque de RSC, lo nuestro) o por la ruta del Node de Executive Lab. Una ruta
  que alguien puso a mano en una orden suya se respeta. La marca `--skip-worktree` se quita solo con
  un git que no abra el diálogo de Apple, y se queda si queda una ruta nuestra que no se sabe leer.
- **`RSC_NO_UPDATE_CHECK`, en el entorno del anfitrión y no dentro del relevo** (T034): con un
  `node` del sistema no hay relevo, y el aviso seguiría. Solo lo lee RSC.
- **El freno, siempre enganchado, y decide al ejecutarse** (T035). Si hay dos, manda el de RSC. En
  una carpeta de alguien no se engancha al reponer los raíles solos (C-4), pero sí al montar encima de
  lo que había, porque el sí ya se dio con el resumen. La pieza pendiente se dice con frases que ya
  estaban en el diccionario.
- **Los raíles «al día» miran todos los ficheros de la habilidad** (T035), no solo `SKILL.md`. Es la
  parte de D6 que el freno necesitaba; los comandos y los bloques siguen en T045.
- **`sync` detrás de cada `repair`** (T038), en `rsc.js`, que es por donde pasan los dos que lo
  corren (el montaje y «Algo va mal»).
- **Tres interruptores sin nombre esperan a Jose** (T037): `.no-git`, `.no-harness` y el aviso de
  versión. P2 no deja pintar un nombre que no está en el diccionario.

## 2026-09-25 · todo-cuadra · implement, F4 (T040–T045, T077 y T019)

- **`siempre.md` importado desde `CLAUDE.md`, y no la habilidad entera** (T040): cargar sus 276
  líneas en cada sesión cuesta contexto sin necesidad.
- **El bloque importa el `AGENTS.md` de alguien cuando se crea el primer `CLAUDE.md`** (T040). No lo
  decía el plan: sin eso, Claude habría dejado de leer las instrucciones que esa persona ya tenía.
  Con lo de RSC en ese `AGENTS.md`, no, porque se leería dos veces.
- **En una carpeta de alguien, el bloque pendiente pregunta con la frase del resumen de B4** (T040),
  en vez de con una pieza nueva: son palabras que ya estaban aprobadas.
- **La regla 7 nombra catorce verbos y no once** (T041): el barrido del paquete encontró `registry`,
  `sello` y `memory`, que el plan no tenía.
- **«Ponerla como la de la clase» quita de la declaración lo que la de la clase no trae antes de
  sincronizar** (T019): con ello dentro, el `sync` de la 2.0.5 falla a medias. Se nombra antes y solo
  se hace con el sí (C-10).

## 2026-09-25 · todo-cuadra · revisión de F3

- **Los arreglos de la revisión de F3 van en un commit propio**, y no enmendando el de F3: F4 ya estaba
  encima, y enmendar pedía reescribir la historia de la rama.
- **El freno se engancha y se quita orden a orden**, nunca por grupos (I1): un grupo de PreToolUse puede
  llevar órdenes de la persona.
- **El freno de RSC cuenta como puesto con su fichero y su enganche**, en los tres sitios que lo miran
  (M4). Con uno solo, frena el nuestro.
- **No se adelanta la activación de la barra a `*`** (I3): cambiaría cómo arranca todo y no se puede
  medir aquí. En su lugar, se apunta si Claude ya estaba en marcha, y la pieza lo dice. Se propone con
  la medida de T032 (3).

## 2026-09-25 · todo-cuadra · revisión de F4

- **Una carpeta más nueva que la clase, con lo suyo en el plan aceptado, se vuelve a montar con la de
  la clase** (I1), y no se toca el plan del recibo, que va con su huella. Es el mismo camino que el
  arranque, con la firma de siempre (A12). Medido con el paquete: RSC conserva lo añadido después que
  la clase trae, así que no hay que devolverlo a mano.
- **En esa carpeta, «Añadir» no añade** hasta ponerla como la de la clase (I2): el `add` de la clase
  le bajaría la versión sin decirlo.
- **Lo que el asistente lee siempre se decide en una sola función de la tabla** (`dondeVaLoDeSiempre`),
  que usan los raíles para ponerlo y la barra para mirarlo (I3, m6): así los dos miran lo mismo.
- **El import de `@AGENTS.md` se decide la primera vez por si existe un `CLAUDE.md`**, aunque esté
  vacío, y después se mantiene, salvo que ese `AGENTS.md` lleve lo de RSC (I4, m7). Decidirlo por su
  contenido no veía un `CLAUDE.md` suyo vacío.
- **Un comando es nuestro si su `description` es la nuestra** (m8): es lo que conserva uno nuestro de
  otro día, y lo que no tiene uno suyo con el mismo nombre.

## 2026-09-25 · todo-cuadra · revisión de F5

- **Cambiar a un asistente sin montar pasa por lo mismo que montar**: primero en seco, y lo que es
  de alguien se pregunta con las mismas pantallas (I1). `sync --dry-run` lista lo que tocaría, con la
  ruta entera (medido con el paquete).
- **Un `AGENTS.md` con normas del equipo y con lo de RSC se le apunta a Claude, no se importa** (I6):
  importarlo traería dos veces lo de RSC, como dice `agents-md-shadow.js`, y no apuntarlo callaba las
  normas del equipo. La sombra de `CLAUDE.md` que deja RSC no es de nadie.
- **«Añadir» va para todos los declarados a la vez**, con `--target claude,codex` (m5): RSC sin
  `--target` y con dos instalados no adivina, y con uno solo el otro se quedaba sin ella.
- **La elección vale mientras ese asistente esté declarado e instalado** (M1, m1), y sin dónde
  guardarla no se dice «Hecho» (M2).
