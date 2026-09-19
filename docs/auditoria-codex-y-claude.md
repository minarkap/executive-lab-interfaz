# Auditoría del arnés para Codex y para Claude — 18 de septiembre de 2026

Revisión de una sola pregunta, mirada entera: **cuando una carpeta se monta para Codex en vez de
para Claude, ¿sigue funcionando todo?** Conexiones y credenciales, habilidades, ayudantes, memorias,
reglas, botones, documentos y el empaquetado.

Método: se leyó la tabla de rutas del propio RSC 1.4.1 —el que viaja dentro del .vsix, en
`extension/media/harness/`— y se contrastó contra lo que hace la barra, montando carpetas de las dos
clases y ejecutando el código de verdad sobre ellas. Nada de esto sale de leer el código y suponer.

**Resultado en una línea:** el mapeo estaba bien pensado y a medio aplicar. Veintinueve hallazgos, uno
de ellos de fondo: con Codex, los raíles de Executive Lab —la habilidad que fija el español y el
vocabulario— se escribían en una carpeta que Codex no lee jamás.

**Veintisiete corregidos y con prueba que los sujeta.** De los otros dos: **A17** está corregido a medias
—se callan tres de los avisos que mandan al alumno a una terminal, y queda dicho el que necesita
probarse en Windows— y **A16** se deja señalado entero, porque es una decisión tuya y no un arreglo.

---

## Lo que ya estaba bien

No todo estaba roto, y conviene decir qué se sostiene, porque es lo que no hay que volver a tocar.

| Pieza | Veredicto |
|---|---|
| `donde.js`, la tabla de rutas | **Correcta.** Contrastada fila a fila contra `targets/index.js`, `targets/commands.js` y `targets/agents.js` de RSC 1.4.1. Codex no tiene carpeta de botones, y eso es de RSC, no nuestro |
| Habilidades con Codex | **Funcionan.** Se leen de `.codex/rsc/`, con su nombre y su frase, incluidas las que no están en nuestro catálogo |
| Reglas | **Bien mapeadas.** Con Codex manda `AGENTS.md` y no se enseña el `CLAUDE.md`, que ahí no lo lee nadie |
| Conexiones y credenciales | **Bien, y no dependen del asistente.** Viven en `01-TOOLS/`, se leen del `.env.example`, se escriben con permisos `600`, y nunca se devuelve una clave entera a la pantalla: solo los cuatro últimos caracteres |
| Cuenta de GitHub | **Bien.** Se usa la sesión del editor antes que pedir una clave a mano, y con reloj, porque `getSession` puede no resolver nunca |
| Conocimiento y documentos | **Bien.** `02-DOCS/` es igual para los dos asistentes |
| Ajustes de permisos | **Bien.** Solo Claude los tiene, y con Codex no se inventa un fichero que nadie lee |

---

## Hallazgos

Severidad: **crítico** = una pieza del producto no hace nada y no lo dice · **alto** = falla en un
caso habitual · **medio** = calidad o una afirmación que dejó de ser verdad.

Los veintinueve, de un vistazo:

| | Qué pasaba | Dónde |
|---|---|---|
| A1 | Los raíles iban siempre a `.claude/`, montara para quien montara | `skills/aplicar.js` |
| A2 | Los ayudantes de Codex se leían a medias (vienen en TOML) | `agentes.js` |
| A3 | El vigilante solo miraba los botones, y solo los de Claude | `extension.js` |
| A4 | Cambiar de asistente vaciaba la barra sin explicarlo | `asistentes.js`, `panel.js` |
| A5 | La radiografía no decía con quién habla la carpeta | `terreno.js`, `soporte.js` |
| A6 | Y reprochaba con Codex unos botones que no puede tener | `terreno.js` |
| A7 | Un asistente desconocido se trataba como Claude | `donde.js` |
| A8 | Se perdían las lecciones guardadas en el tercer sitio de RSC | `lecciones.js` |
| A9 | La brújula callaba en cuanto la wiki estaba guardada en git | `brujula.js` |
| A10 | El buscador no encontraba habilidades ni ayudantes | `buscar.js` |
| A11 | El catálogo se vaciaba para toda la sesión por una llamada temprana | `consejos.js` |
| A12 | La prueba de Windows comprobaba un flujo que se había quitado | `probar.ps1` |
| A13 | El perfil de pruebas resucitaba el ajuste del editor gigante | `perfil/` |
| A14 | La versión «fijada» del arnés no estaba fijada (`^1.4.1`) | `media/harness/` |
| A15 | El comprobador del diccionario no miraba el manifiesto | `comprobar-diccionario.js` |
| A16 | El arnés sigue planificado para un proyecto de 14 ficheros que ya no existe | `.rsc.json` |
| A17 | Cinco avisos del arnés mandan al alumno a una terminal; uno rompe la versión fijada | `session-start.mjs` (de RSC) |
| A18 | Publicar sobrescribía una versión ya publicada, sin avisar | `publicar.sh` |
| A19 | La salida de emergencia del disfraz ya no sabía quitar el ajuste que la hizo falta | `quitar-disfraz.js` |
| A20 | Una conexión a medio hacer se disfrazaba de conexión, con casillas que no se podían rellenar | `conexiones.js` |
| A21 | Se avisaba de las claves fuera de sitio, pero no de que ya estaban en el historial | `sueltas.js` |
| A22 | Una conexión con acento, eñe o espacio en el nombre salía en la lista y no se podía abrir | `conexiones.js` |
| A23 | `export CLAVE=` salía duplicada y un comentario al final contaba como valor | `conexiones.js` |
| A24 | «Seguir donde lo dejé» salía dos veces el primer día | `acciones.js` |
| A25 | Todo fallo de conexión culpaba a la clave, también quedarse sin internet | `conexiones.js` |
| A26 | Una credencial de varias líneas se aplastaba, se decía «Guardado» y quedaba rota | `conexiones.js` |
| A27 | Si el `.env` no se podía escribir, el botón «Guardar» se quedaba mudo | `conexiones.js` |
| A28 | El reloj de los procesos no cortaba: la barra esperaba a los nietos | `procesos.js` |
| A29 | «Las decisiones» enseñaba la fontanería del arnés, en inglés y con un hash | `diario.js` |

Los cuatro de abajo —A1, A9, A11, A14— comparten forma: **no fallan, enseñan cero**. Es la manera de
romperse que tiene este producto, y la que no salta en ninguna pantalla de error.

### Crítico

**A1 · Los raíles se ponían siempre en `.claude/`, montara para quien montara.**
`skills/aplicar.js` escribía la habilidad `executive-lab` y los cuatro comandos en `.claude/`, con la
ruta escrita a mano. Pero el wizard deja elegir Codex y le pasa `--target codex` a RSC, que monta el
arnés entero en `.codex/`. En esas carpetas, la habilidad que fija el español, impone el vocabulario
del diccionario y prohíbe mandar al alumno a una terminal quedaba en una carpeta que Codex no abre
nunca. Sin error, sin aviso, y con la pantalla diciendo «raíles puestos».

Corregido: la tabla de rutas se sacó a `skills/sitios.js`, que no depende de VS Code, y la leen los
dos que la necesitan —la barra y el instalador de raíles—, así que no hay dos versiones de la misma
verdad. Además:

- Con Codex la habilidad va a `.codex/rsc/executive-lab/`.
- Los cuatro comandos **no se escriben**: Codex no tiene dónde guardarlos y no se los inventamos en
  una carpeta muerta. Se dice en la salida. La barra ya sabía explicar ese hueco.
- Codex no descubre las habilidades solo —lee su `AGENTS.md`— así que se le apunta a ella con un
  trozo entre marcas nuestras, igual que hace RSC con el suyo, sin tocar lo que hubiera escrito ni
  duplicarse al repetir.
- Un asistente que no sabemos dónde mira **para la instalación** en vez de caer en la de Claude: unos
  raíles en la carpeta equivocada se ven, desde fuera, igual que unos puestos.

### Altos

**A2 · Los ayudantes de Codex se leían a medias.**
RSC escribe los ayudantes en tres sintaxis según el asistente: markdown con cabecera para Claude,
TOML para Codex, JSON para Kiro. La barra leía los tres con el lector de cabeceras YAML, que solo
entiende la primera. Con Codex el ayudante salía en la lista —el fichero está— pero con el nombre del
fichero en vez del suyo y **sin una palabra de lo que hace**. Un ayudante sin explicación es un botón
a ciegas. Corregido: se lee el formato que toque.

**A3 · El vigilante solo miraba los botones de Claude.**
El `FileSystemWatcher` tenía `.claude/commands/*.md` escrito a mano y nada más del asistente, cuando
la barra lee además sus habilidades y sus ayudantes. Dos huecos silenciosos: una habilidad recién
puesta no aparecía hasta cerrar y abrir, y en un arnés de Codex no se vigilaba nada suyo. Corregido:
las tres carpetas se preguntan, y el vigilante se rearma cuando se cambia de asistente, que es cuando
cambia dónde vive todo.

**A4 · Cambiar de asistente vaciaba la barra sin explicarlo.**
Cambiar con quién hablas reescribe `.rsc.json`, pero **no remonta el arnés**: las habilidades, los
ayudantes y los raíles se quedan en la carpeta del anterior, y cada asistente solo mira la suya. El
mensaje era «Hecho. A partir de ahora los botones hablan con Codex» y nada más, así que el alumno
pulsaba, veía desaparecer todo lo que tenía y creía que lo había roto. El código afirmaba en un
comentario que «la pantalla lo dice»; la pantalla no lo decía. Corregido en los dos momentos: se
avisa **antes** de pulsar, en la ficha del asistente con el que no se montó la carpeta, y **después**
se dice con nombres qué deja de verse y que no se ha borrado nada.

**A5 · La radiografía no decía con quién habla la carpeta.**
Una carpeta montada para un asistente que no está instalado se comporta como si estuviera rota —los
botones no hacen nada— y eso no salía por ningún lado, teniéndolo a mano. Es la primera causa de «no
me hace nada». Corregido, en la radiografía y en el informe de incidencia, que ahora dice además en
qué carpetas mira.

**A9 · La brújula dejaba de decir dónde se había trabajado, en el caso normal.**
Apareció al final, tirando del hilo de las memorias: se guardó un punto con el arnés y se miró qué
devuelve. RSC manda las rutas **tal y como se las da git**, y git las marca — `M `, `A `, `D `, `??`.
Una ruta marcada no empieza por `02-DOCS`, empieza por `M 02-DOCS`, así que dejaba de reconocerse como
zona. En cuanto la wiki está guardada en git —o sea, en todo alumno a partir del primer guardado—
llegaban todas marcadas y la pantalla principal no decía ninguna zona. Sin fallar nada.

Se quita la marca antes de traducir. Es seguro: solo se reconocen `02-DOCS` y `01-TOOLS`, así que esto
no puede devolver la basura que Jose llegó a ver en su barra («M 01 tools»), solo recuperar las dos
zonas que sí valen. Hay prueba de las dos cosas: que las marcadas vuelven a salir, y que una carpeta
cualquiera sigue sin ser una zona.

**A17 · El arnés le ofrece al alumno actualizarse solo, y con `npx`.**
`targets/session-start.mjs` va cableado como enganche `SessionStart` en `.claude/settings.json`, o sea
que **corre en cada arranque de sesión en la carpeta de cada alumno**. Y entre lo que hace:

1. Llama a `registry.npmjs.org` por red, con 1,5 s de espera.
2. Si hay una versión más nueva, le dice al asistente, literalmente: *«tell the user a new version is
   available and, if they say yes, run: `npx @ericrisco/rsc@latest`»*.

**No es hipotético: ese aviso salió al arrancar esta misma sesión**, porque la 2.0.4 está publicada y
aquí corre la 1.4.1.

Dos cosas chocan de frente con este proyecto:

- **Se salta la versión fijada.** Toda la política —la de A14, la que dice que la cohorte corre el
  mismo catálogo y que subir es una decisión— queda a merced de que un alumno conteste «sí» a una
  oferta que le hace su propio asistente. Y `@latest` ni siquiera respeta el número fijado.
- **Es un comando de terminal.** La habilidad `executive-lab` prohíbe mandar al alumno a una terminal,
  y la decisión 6 quitó `npx` a propósito (en Windows es un `.cmd`, y tarda).

Se apaga con la variable `RSC_NO_UPDATE_CHECK`, y **no se fija en ningún sitio**: ni el instalador, ni
el wizard, ni `enganches.js` —que existe justamente para dejar los enganches de RSC usables en la
máquina de un alumno— la ponen.

Y no es un aviso suelto: ese enganche admite **siete interruptores** y **cinco de sus avisos llevan
`npx @ericrisco/rsc …` dentro** — actualizar, revisar habilidades, retirar worktrees, y dos más. En la
carpeta de un alumno no había ninguno puesto salvo el de Context7, que escribe el propio RSC.

**Corregido en parte, y dicho lo que queda.** Los raíles ponen ahora tres interruptores, igual que
RSC pone el suyo: `.no-audit` (la revisión de habilidades es herramienta de quien mantiene esto),
`.no-worktree-cleanup` (un alumno no tiene worktrees, y ese aviso lleva dos comandos) y
`.no-scope-check` (hablarle de «scopes» a quien lleva las facturas no significa nada). Los que sí
valen la pena se dejan: que avise si falta git, y la higiene del `CLAUDE.md`, que no lleva comandos.

Se revisaron **los otros dos enganches cableados**, que corren igual en la carpeta de cada alumno:

- **`worklog-checkpoint.mjs`** (PreCompact y SessionEnd) — limpio. Solo le recuerda al asistente que
  escriba el diario en `02-DOCS/raw/worklog/`, que es justo lo que la barra lee en «El diario». Ningún
  comando.
- **`.claude/rsc-bootstrap.mjs`** (los tres eventos, y va **versionado** en el repositorio del alumno)
  — es un caso menor del mismo asunto: compone `npx @ericrisco/rsc@<versión> sync`. Dos cosas lo
  salvan: usa **la versión fijada**, no `@latest`, así que no rompería el catálogo de la clase; y solo
  dispara cuando lo instalado diverge del manifiesto, que en el flujo de un alumno —carpeta propia,
  sin `git pull`— no pasa. No se toca: su único interruptor es `.no-harness`, que apagaría el
  onboarding entero. Y para eso la barra ya tiene su botón, «Algo va mal», que hace `repair` con
  nuestro Node y sin `npx`.

**Lo que queda abierto es el aviso de versión nueva**, que no se apaga con un fichero sino con la
variable `RSC_NO_UPDATE_CHECK`. El sitio natural es el bloque `env` de `.claude/settings.json` o el
propio `enganches.js`, y eso hay que probarlo en Windows —que es justamente donde `enganches.js`
existe para que las cosas no se rompan—. Recomendarlo a ciegas desde un Mac sería el tipo de arreglo
que esta auditoría ha estado corrigiendo.

Comprobado de paso y **sin problema**: el otro aviso que imprime ese enganche —el de Context7, que
también lleva un comando— no le llega nunca a un alumno. RSC excluye Context7 **siempre**
(`onboarding.js` lo marca como `excluded` sin condiciones) y escribe el marcador `.rsc/.no-context7`
que lo silencia.

**A19 · La herramienta de quitar el disfraz olvidó la clave que la hizo necesaria.**
`herramientas/quitar-disfraz.js` es la salida de emergencia: quita del VS Code de alguien lo que le
puso el disfraz. Está bien hecha —solo mira si no le dices `--hazlo`, borra una clave solo si su valor
es **exactamente** el que escribimos nosotros, y hace copia antes—, pero leía `disfraz.json`, o sea
**lo que el disfraz pone hoy**.

Y una clave que se quita del disfraz sigue puesta en el ordenador de quien instaló antes de quitarla.
El caso que lo destapó es el peor posible: `window.zoomLevel: 1` es la que le dejó a Jose el editor
gigante el 18 de septiembre, hubo que quitársela **a mano**, y se sacó del disfraz justamente por eso.
Desde entonces, cualquiera que la tuviera podía pasar la herramienta de limpiar y **seguir con el
editor gigante**. La herramienta que existe para limpiar dejaba sin limpiar lo único que ya se había
decidido que sobraba.

Corregido con una lista de las que el disfraz escribió alguna vez y ya no escribe, y con la misma
regla de seguridad: si esa persona puso su propio zoom, es suyo y no se toca. Comprobado en los tres
casos —el nuestro se limpia, el suyo no, y lo que nunca fue nuestro ni se menciona—. Volverá a pasar
cada vez que se saque una clave del disfraz, de ahí la prueba.

**A18 · Publicar pisaba una versión ya publicada, en silencio.**
Salió al final, mirando cómo llegan estos arreglos a los alumnos. `publicar.sh` saca la versión de
`extension/package.json` y copia a `publicacion/executive-lab-<versión>.vsix` **sin comprobar si ya
está**. Y muerde justo en el momento más fácil de que ocurra: acabas de arreglar cosas, se te olvida
subir el número, y publicas. A partir de ahí hay dos compilaciones distintas llamándose igual, quien
instaló ayer y quien instale mañana creen tener lo mismo, y ya no hay forma de saber cuál corre cada
alumno.

No es hipotético hoy: el manifiesto sigue en **0.15.0** y `publicacion/executive-lab-0.15.0.vsix` ya
existe, así que publicar ahora habría pisado una versión que ya está fuera — con quince arreglos
dentro y el mismo número.

Corregido: `publicar.sh` se para si esa versión ya está publicada y dice que subas el número. La
comprobación va **antes** de las pruebas, porque montar un arnés de verdad tarda minutos y más vale
enterarse al principio. Rehacer la misma versión sigue siendo posible borrando el fichero a mano, que
es un gesto deliberado y no un descuido.

**A16 · El arnés sigue planificado para un proyecto que ya no existe.**
Esto no salió mirando la extensión, sino el arnés en sí, que es la otra mitad del encargo. `.rsc.json`
guarda el plan con el que se montó, y ese plan describe un proyecto de **14 ficheros fuente**,
`softwareScope: small`, sin ninguna señal de complejidad. Hoy hay **41 módulos solo en
`extension/src`**, más instaladores, raíles y una extensión publicada, con 130 comprobaciones.

Sobre esa foto vieja se aplazaron cuatro decisiones, y tres llevan disparadores que hoy se cumplen sin
discusión —`source-growth atLeast 5` (ha crecido en 27) y `manifest-with-implementation`—:

| Aplazada | Se aplazó porque | Hoy |
|---|---|---|
| `base-agents` | «No substantial software implementation is planned» | Hay **dos ayudantes escritos a mano** en `.claude/agents/` |
| `code-hooks` | «Code-only gates would add unrelated behavior» | Hay cuatro comprobadores propios y 130 comprobaciones |
| `sdd` | «The software scope is small» | Deja de serlo hace tiempo |
| `gitmoji-guard` | «No selected target and project policy justify it» | Claude sí está seleccionado; lo demás es política |

Lo más claro es el primero: el arnés declara `"agents": []` y «no hay implementación sustancial» a la
vez que la carpeta tiene dos ayudantes en uso, que la barra lee y enseña. El aplazamiento no está solo
caducado en teoría — lo contradice lo que hay en disco. Y `rsc doctor` no lo ve: informa
`automationGaps: 0` y `gitmojiGuard: deferred` como hechos, no como algo que haya que revisar.

El desfase está escrito en tres sitios y dicen lo mismo, así que es **un solo problema con tres
registros**, no tres: `.rsc.json`, `02-DOCS/wiki/harness/decisions.md` («SDD: deferred») y
`02-DOCS/wiki/harness/installation-plan.md`, que lleva la tabla entera de aplazamientos con sus
motivos. Los tres los escribe RSC, así que se actualizan solos cuando se reconsidere; no hay que
tocarlos a mano.

**Esto se deja señalado y sin tocar, a propósito.** Reconsiderar esas cuatro cambia cómo el arnés
gobierna el proyecto —mete agentes, enganches de código, un flujo de especificación— y eso lo decide
Jose, no una auditoría. El CLI las vuelve a plantear de forma interactiva.

**A29 · «Las decisiones» enseñaba la fontanería del arnés, y el primer día solo eso.**
RSC deja tres líneas en `02-DOCS/wiki/harness/decisions.md` en cuanto monta: el identificador del
plan aceptado —un churro de sesenta y cuatro caracteres—, el tipo de proyecto y si SDD quedó
aplazado. Son suyas, están en inglés y no las decidió nadie de esta empresa.

En un arnés recién montado son **las únicas que hay**. Así que el primer día, «El diario → las
decisiones» —una pantalla que alguien abre para ver por qué se hacen las cosas aquí— enseñaba tres
líneas en inglés con un hash dentro y nada más.

El comprobador del diccionario no lo pilla, y no es culpa suya: no es texto del código, es contenido
leído de un fichero. Es un punto ciego de clase distinta a los de A15.

**Y había una prueba que lo daba por bueno.** `el diario lee los dos formatos` afirmaba
`cortas.length >= 2` con el comentario «y las sueltas **que deja el montaje**»: consagraba
exactamente el comportamiento equivocado. Corregidas las dos cosas —el filtro y la prueba— y añadido
al terreno de pruebas una decisión suelta de verdad, para poder distinguirlas.

Se nombran una a una, como ya se hacía con los campos de una entrada larga: descartar por la forma se
llevaría por delante decisiones de verdad escritas igual, y de hecho el propio fichero avisaba de ese
tropiezo. Comprobado que «SDD: no, aquí no construimos nada» —una decisión de verdad— sigue saliendo.

**A28 · El reloj que corta los procesos no cortaba.**
Salió midiendo, no leyendo. Una conexión cuya prueba tarda mucho tiene un reloj de 45 segundos… y con
un script de 120 la barra tardó **los 120**.

La causa es fina: se hacía `kill()` y se esperaba al evento `close`. Pero `close` no llega cuando
muere el hijo, sino cuando se cierran sus tuberías — o sea, cuando han muerto también sus nietos. Un
`test_connection.sh` que llama a `curl` o a `sleep` deja al bash muerto y al nieto vivo, sujetando la
tubería. El alumno ve la pantalla parada el doble de lo prometido y la da por colgada.

Corregido: al saltar el reloj se contesta ya, con lo que haya llegado, y al proceso se le pide que se
vaya por las buenas y se le insiste dos segundos después. Lo que no se hace es tener a alguien
mirando una pantalla quieta por un proceso que ya hemos dado por perdido. Medido otra vez: 45
segundos en vez de 120.

Esto lo usa **todo** lo que la barra ejecuta —el arnés, git, las pruebas de conexión, las consultas
de cada herramienta— así que el arreglo vale para todos.

**A27 · Si no se podía guardar la clave, el botón se quedaba mudo.**
Escribir en el `.env` puede fallar —quedó de solo lectura, el disco lleno, algo lo tiene cogido— y eso
no se miraba: `fs.writeFileSync` lanzaba y la excepción subía hasta el manejador de mensajes, porque
`guardarClave` llama sin red. Resultado: el alumno pulsa «Guardar» y **no pasa nada**. Ni
confirmación, ni error, ni pista. El silencio más caro posible, en la pantalla de las credenciales.

Corregido donde toca —`escribir` ya devuelve `{ok, mensaje}` para todo lo demás—: se distingue el
caso de permisos del resto y los dos dicen qué hacer.

**A26 · Una credencial de varias líneas se guardaba rota, diciendo «Guardado».**
El peor de toda la auditoría, y estaba en el fichero cuya propia cabecera dice que ahí *«muere la
mayor parte del soporte del curso»*.

Un `.env` es una línea por clave, pero hay credenciales corrientísimas que ocupan varias: una clave
privada PEM, el JSON de una cuenta de servicio de Google. La barra las aceptaba, les quitaba los
saltos, contestaba **«Guardado»** y dejaba una clave **inservible** — un PEM sin sus saltos no lo
acepta ninguna herramienta.

Y el alumno no tenía forma de enterarse: le habían dicho que sí. Después «Probar la conexión»
fallaba, y —antes de A25— se le decía que revisara una clave que había pegado perfectamente. Dos
fallos encadenados que llevan directos a una llamada al tutor.

Corregido: no se inventa una forma de meterlas ahí. Se dice que no caben y por qué —«si lo aplastara
te lo estropearía sin que te enteraras»— y se manda al asistente, que sabe dónde van. RSC ya lo tenía
previsto: el `.gitignore` de cada herramienta ignora `keys/`, `*.p8`, `*.p12` y `*.json` justo para
estas. Lo que sí cabe sigue cabiendo, incluido el salto de línea que deja el pegar.

**A25 · Cuando una conexión fallaba, siempre se culpaba a la clave.**
«Probar la conexión» contestaba lo mismo a todo lo que no fuera un `.env` a medias: *«No conecta.
Revisa que la clave esté bien pegada, entera y sin espacios.»* Provocando fallos de verdad se vio que
de los casos corrientes **dos no son la clave**:

| Lo que pasa de verdad | Lo que se le decía |
|---|---|
| No hay internet | revisa tu clave |
| El script de la herramienta está roto | revisa tu clave |
| La clave está mal | revisa tu clave ✓ |

En los dos primeros el alumno se pone a revisar una clave que está perfecta, y puede tirarse la tarde
así antes de llamar al tutor. La regla de la casa —decisión del diccionario— es que un error diga qué
hacer; decirlo mal manda a mirar donde no es, que es peor que no decir nada.

Corregido: se distinguen la red, la clave rechazada, el límite de peticiones y el script roto, cada
uno con lo que toca hacer. Y lo importante: **lo que no se reconoce ya no señala a la clave** — dice
que no se sabe y manda al asistente, que sí puede mirar el detalle.

**A24 · El primer día salían dos botones con el mismo rótulo.**
Mirando lo que ve un alumno el primer día en un arnés recién montado, «Qué quieres hacer» enseñaba
**«Seguir donde lo dejé» dos veces**: arriba el nuestro —el raíl `seguir.md`, con su `boton:`— y abajo
el `resume-session` del arnés, al que la propia barra rebautiza con ese mismo nombre en cristiano
(`LOS_DE_RSC`). Hacen lo mismo, así que el alumno veía dos botones idénticos sin forma de elegir.

Corregido: no se repite un rótulo. Manda el de arriba, que es el nuestro y está escrito para él. Se
compara por el rótulo y no por el nombre del fichero, porque el rótulo es lo que ve.

**A22 · Una conexión en español no se podía abrir.**
`carpetaDe` exigía `/^[\w.-]+$/` para el nombre de la carpeta, y `\w` es `[A-Za-z0-9_]`: ni acentos,
ni eñes, ni espacios. En un producto **para alumnos españoles**, con un asistente al que le imponemos
escribir en español, `01-TOOLS/Señal/`, `01-TOOLS/Correo-Electrónico/` o `01-TOOLS/Mi Facturación/`
salían en la lista —`proveedores()` lista cualquier carpeta— y al abrirlas no había nada. Al guardar
una clave la barra contestaba **«Esa conexión ya no está»**, que además de falso hace pensar que se
ha borrado sola.

La comprobación existía por algo bueno: que un id venido de la interfaz no se salga de `01-TOOLS`.
Pero una lista blanca de letras no es la forma de pedir eso. Ahora se mira dónde cae la ruta de
verdad —más seguro, y sin dejar fuera media lengua—. Comprobado que `..`, `../..`,
`HOLDED/../../..`, `/etc`, `_TEMPLATE`, `.oculta` y la cadena vacía siguen bloqueados.

**A23 · Un `.env` se leía como debería escribirse, no como se escribe.**
Dos formas corrientes se leían mal, y las dos hacían que la barra se creyera cosas que no son:

- **`export CLAVE=valor`.** La clave salía llamándose «export CLAVE», así que la pantalla enseñaba la
  misma dos veces: una diciendo que faltaba y otra con su valor. Y `sueltas.js` ya daba por supuesto
  que la gente escribe `export` — o sea que el proyecto lo sabía en un sitio y no en el otro.
- **`CLAVE=   # una nota`.** El comentario se tomaba como el valor, así que una clave vacía contaba
  como puesta, la cuenta de las que faltan mentía, y «Probar la conexión» se lanzaba creyendo que
  estaba todo.

Corregido, con cuidado de no romper lo que sí es valor: una almohadilla pegada (`abc#123`), una
dentro de comillas (`"abc # dentro"`) y una al principio (`#esto-es-la-clave`) se respetan. El
comentario solo se quita cuando lleva un espacio delante, que es la regla de siempre.

**A20 · Una conexión a medio hacer se disfrazaba de conexión.**
Salió montando arneses nuevos de verdad. El asistente crea una herramienta copiando
`01-TOOLS/_TEMPLATE/`, y esa plantilla trae sus claves con marcadores dentro: `<TOOL>_API_KEY`,
`<TOOL>_API_SECRET`. Rellenarlas es el paso siguiente, y entre un paso y otro la barra se repinta —el
vigía mira `01-TOOLS/**`— así que el alumno ve esa carpeta a medias.

Y lo que veía era una conexión normal, con su nombre y su casilla «Clave de acceso» esperando. Si
escribía algo, la barra le contestaba **«Esa clave no tiene un nombre válido»**, porque `escribir`
rechaza los marcadores, y con razón. Un callejón sin salida en la pantalla donde —según el propio
código— muere la mayor parte del soporte del curso. Además contaba «faltan 3 claves» de algo que
todavía no pide ninguna.

Corregido: se reconoce que sigue siendo la plantilla, no se enseña ninguna casilla imposible, los
marcadores no se cuentan como claves que falten, y la pantalla lo dice —«sin preparar»— con un botón
que se lo pide al asistente. Se usa «sin preparar» y no «sin terminar» a propósito: la radiografía ya
usaba «sin terminar» para *faltan claves*, que es cosa del alumno, y esto es cosa del asistente.

**A21 · Se avisaba de las claves fuera de sitio, pero no de lo que de verdad importaba.**
Montando un arnés **encima de un proyecto que ya existía** —el caso de quien llega con trabajo hecho—
apareció lo peor: el `.env` de esa persona **ya estaba guardado en su historial**, desde el día que
empezó. La barra decía «hay 5 claves guardadas fuera de sitio» y ofrecía ordenarlas.

Ordenarlas las mueve a `01-TOOLS/`, donde sí están protegidas… y las deja en el historial para
siempre, camino de GitHub en cuanto suba una copia. El alumno ve las claves aparecer en su sitio y se
queda tranquilo. Avisar a medias es peor que no avisar, y la decisión 17 de este proyecto ya había
asumido la responsabilidad de avisar.

Corregido: se mira si esos ficheros están dentro del historial y se dice. Al alumno, en su idioma —
«están dentro de tus copias de seguridad, así que ponerlas en su sitio no las saca de ahí; si alguna
es importante, lo seguro es cambiarla donde la sacaste»—. Y al asistente, con el detalle técnico y una
instrucción clara: explicarlo antes de mover nada y **no reescribir el historial** sin que se lo pidan.

### Medios

**A12 · La prueba de aceptación de Windows comprobaba un flujo que se había quitado.**
No salió mirando la extensión, sino el último camino que faltaba: el instalador. Está limpio —ya no
monta el arnés, lo delega entero en el panel, que es el camino ya auditado— pero **su prueba no se
enteró**. `instalador/windows/probar.ps1` seguía exigiendo una carpeta `Documentos\Mi Empresa IA` que
no crea nadie, los raíles dentro de ella, el `instalacion.log` en un sitio donde no está, y unos
diales `non-technical` + `L3` que la decisión 18 revirtió por arrogantes. O no se pasaba nunca —y
entonces daba confianza falsa— o se pasaba y fallaba y alguien la ignoraba. Las dos cosas son malas.

Puesta al día con lo que el instalador hace hoy, y con una comprobación nueva que afirma lo
contrario de lo que afirmaba: que **no** se invente ninguna carpeta de trabajo, porque eso lo decide
el alumno. La de macOS ya se saltaba ese trozo cuando no hay carpeta: solo se quedó atrás la de
Windows.

**A15 · El comprobador del diccionario no miraba el manifiesto.**
La regla del vocabulario está enforzada por `docs/comprobar-diccionario.js`, y tenía un punto ciego:
revisaba `panel.js` y `extension/src`, pero no `extension/package.json` — donde viven los **33 títulos
de comando que salen en la paleta del editor** y los rótulos de los ajustes. Es de lo más visible del
producto y nadie lo comprobaba. Por ahí se habían colado dos:

- «Executive Lab: Qué comandos **de Claude** hay disponibles», en un producto que también habla con
  Codex — y encima falso, porque ese comando vuelca los de los dos asistentes.
- «Executive Lab: Quitar el aspecto de todo **VS Code**», y el diccionario dice, con esas palabras,
  que «VS Code» no se nombra y que «el editor» sí.

Corregidos los dos, y el comprobador mira ahora esos 38 rótulos, **más los siete de los raíles**: cada
comando que enviamos trae un `boton:`, y ese rótulo se convierte en un botón de la barra tal cual.
Esos estaban limpios —no había nada que arreglar— pero tampoco los miraba nadie. Los que escriba el
asistente en la carpeta del alumno no se pueden comprobar aquí, que son de después; de esos se
encarga la habilidad `texto-de-la-barra`. De los nuestros, no se encargaba nadie.

Se comprobó que la red salta: metiendo «repositorio» a mano en un rótulo de raíl, lo señala. Se leen del JSON por campo, no por
líneas: los `scripts` son órdenes de construcción que no ve nadie, y en JSON no se puede marcar una
línea como interna. El texto de la tienda —`displayName` y `description`— se deja fuera a propósito:
va dirigido a quien decide instalar, no a quien ya está dentro, y cambiarlo es decisión de Jose.

**A14 · La versión «fijada» del arnés no estaba fijada.**
La política está escrita en `src/rsc.js` y es explícita: toda la cohorte corre el mismo catálogo, y
subir de versión es una decisión, no un efecto secundario. Pero `extension/media/harness/package.json`
declaraba `^1.4.1` — un rango. Bastaba con que saliera una 1.5 para que un `npm install` empaquetara
el .vsix con otro catálogo sin que nadie lo pidiera. Una versión fijada con acento circunflejo no
está fijada. (El `package-lock.json` lo sujetaba de hecho, pero el lock protege de un accidente, no
de un `npm update`, y la política no se declara en el sitio donde se lee.)

Fijada exacta, y con una comprobación que compara **los cinco sitios** donde se escribe la versión: el
manifiesto del arnés empaquetado, el arnés instalado, `catalogVersion` en `.rsc.json`, el respaldo de
`rsc.js`, el mensaje de `preparar-paquete.js` y el `demo.sh`, que monta su propio arnés. Ese último se
escapó de la primera versión de la comprobación — el punto ciego de la red contra puntos ciegos— y se
vio revisando `demo.sh`, que es el cuarto camino por el que se monta un arnés en este repositorio. Esa prueba es justamente la que dirá qué tocar
el día que se suba a la 2.0.4, en vez de dejar tres sitios mintiendo.

**A13 · El perfil de pruebas resucitaba el ajuste que dejó el editor gigante.**
`perfil/executive-lab.code-profile` está generado y versionado, y nada comprobaba que siguiera
cuadrando con `disfraz.json`. Se había separado: le faltaban dos ajustes nuevos y **seguía llevando
`window.zoomLevel`**, que es justo el que se quitó del disfraz después de dejarle a Jose el editor
gigante el 18 de septiembre. Quien lo importara para probar el disfraz a mano se lo volvía a poner.

Regenerado, y con una comprobación que lo sujeta: el perfil lleva exactamente los ajustes del
disfraz, y nunca el zoom. Es la misma red que la de los raíles, por la misma razón: dos copias de lo
mismo sin nada que las compare son dos verdades esperando a separarse.

**No se ha podido ejecutar.** Es PowerShell sobre Windows y esto se ha hecho desde un Mac; pasa el
revisor de PowerShell del proyecto, que mira la forma, no que el instalador se comporte así. Hace
falta una máquina con Windows para darla por buena.

**A6 · La radiografía reprochaba con Codex algo que no se puede arreglar.**
Enseñaba «Botones que ha aprendido: ninguno todavía» también con Codex, que no puede tenerlos nunca.
Una cruz permanente por algo que no depende de ti no es información. Corregido: con un asistente sin
botones, esa línea no sale.

**A7 · Un asistente desconocido se trataba como Claude.**
`donde.js` decía, en su propio comentario, que nunca devuelve una ruta de Claude para un arnés que no
es de Claude — y luego lo hacía, para cualquier asistente que RSC sepa montar y nosotros no tuviéramos
en la tabla. Corregido por los dos lados: se añadieron los cinco que faltaban (`antigravity`,
`continue`, `junie`, `kiro`, `aider`) y el que no esté se queda sin carpetas, que es lo que decía el
comentario.

**A8 · Se perdían las lecciones aprendidas en un caso.**
RSC guarda su memoria en uno de tres sitios y la barra miraba dos. El tercero pasa cuando `.rsc/`
acaba versionado: nuestro `.gitignore` lo evita, pero el de un alumno que empezó su carpeta a su
manera puede no hacerlo. Ahí la barra decía «no ha aprendido nada de ti» con las lecciones guardadas
y aprobadas una a una. Corregido.

Y uno de texto, de propina: la habilidad propia de este repositorio se enseñaba como «Quieras revisar
el texto de la barra…». El recortador de entradillas quitaba «Úsala siempre que» y dejaba el verbo
suelto, en mayúscula y en pantalla.

---

## El barrido, módulo a módulo

Para poder decir «todo» hay que haber mirado todo, así que se pasaron los cuarenta y un módulos de
`extension/src/` con una sola pregunta: **¿esto lee alguna ruta que cambie según el asistente?**

- **Pasan por `donde.js`, como deben:** `acciones` (botones), `saberes` y `rsc` (habilidades),
  `agentes` (ayudantes), `ajustes` (permisos), `buscar` (indexa los botones del asistente que toque),
  `fijadas` (se apoya en los tres anteriores) y `terreno`.
- **`reglas` y `asistentes`** eligen a mano y bien: con Codex mandan `AGENTS.md` y su extensión.
- **Los treinta y tantos restantes leen solo rutas que no dependen del asistente** —`02-DOCS/`,
  `01-TOOLS/`, `.rsc.json`, `.rsc/`— así que funcionan igual con los dos: `cerebro`, `papeles`,
  `diario`, `lecciones`, `proyectos`, `marca`, `identidad`, `trato`, `sueltas`, `salidas`, `guardar`,
  `github`, `conexiones`, `brujula` y compañía.

Después del barrido no queda ninguna ruta de Claude escrita a mano fuera de la tabla, ni en la barra,
ni en el panel, ni en los raíles.

**A10 · El buscador no encontraba las habilidades ni los ayudantes.** El buscador indexaba la wiki, los
botones, las conexiones y los papeles, pero no las habilidades ni los ayudantes. Releyendo el encargo
—«skills, habilidades, todo se mapee bien»— no era una decisión de producto: esa caja dice buscar «lo
que puede hacer» y solo traía los botones. Quien busca no sabe en qué apartado vive cada cosa; para
eso busca. Ya entran los dos, con los nombres que usa el resto de la barra y llevando a su pantalla.

**A11 · El catálogo se quedaba vacío para siempre por una llamada temprana.** Salió al arreglar A10, y
llevaba ahí escondido. `consejos.capacidades()` recordaba también el
fallo: la primera llamada que llegara sin saber dónde está la extensión dejaba el catálogo vacío **para
el resto de la sesión**. A partir de ahí la barra no ofrecía ninguna capacidad ni nombraba en español
ninguna de las puestas, y nada fallaba. Lo destapó el buscador al pedir el catálogo antes que nadie.
Ahora solo se recuerda lo que se ha leído de verdad: un intento que no sale no es una respuesta.

---

## La red que faltaba: que la tabla no se descuadre sola

La tabla de `sitios.js` es copia de la de RSC, hecha a mano, y de ella cuelga ya casi toda la barra.
Copiada y sin comprobar, el día que alguien suba el arnés de versión se convierte en una suposición —
y falla como falla siempre esto: sin error, enseñando cero.

Ahora hay una comprobación que **lee las tablas del propio RSC que viaja dentro del .vsix** —las de
`targets/index.js`, `targets/commands.js` y `targets/agents.js`— y las compara fila a fila con la
nuestra. Los diecisiete asistentes cuadran. Se comprueban las rutas, no el número de versión, que es
lo que de verdad importa y lo que puede cambiar sin avisar.

Al escribirla saltó a la primera con Gemini, y tenía razón a medias: declaramos `comandos: null`
porque escribe los suyos en TOML y no sabemos leerlos, pero la carpeta existe. Eso ahora se dice en la
propia fila (`noLeemos`), para que un hueco decidido no se confunda nunca con un descuadre.

## El estado del arnés de este repositorio

Esta es la otra mitad del encargo, y merece su propia comprobación: no la extensión que lee el arnés,
sino el arnés. Tres cosas, todas ejecutadas:

- **`rsc doctor`:** las ocho habilidades instaladas, ninguna que falte, enganches puestos, y ni
  ayudantes que falten, ni colisiones, ni botones huérfanos.
- **`rsc repair --dry-run`:** *«Nothing to repair — this harness is healthy.»*
- **Las huellas de `.rsc.json`.** RSC guarda un `sha256` de cada fichero que gobierna, así que se
  puede comprobar si alguno se ha desviado de lo que instaló. **Veintiuno de veintiuno cuadran.** El
  único distinto es `.claude/settings.local.json`, y es benigno: ese fichero existe precisamente para
  guardar decisiones locales —lleva un permiso aprobado aquí— así que su huella está condenada a
  quedarse vieja y no sirve como señal. Se comprobó lo que de verdad importaba, que es si una
  reparación las pisaría: no las toca.

Lo que sí está desfasado no son los ficheros, sino el plan (ver **A16**).

**Pero el catálogo está fijado en la 1.4.1 y ya hay una 2.0.4 publicada.** Es deliberado —toda la
cohorte tiene que correr el mismo catálogo, o dejan de servir las instrucciones de clase— y está
fijado en cinco sitios que coinciden (`.rsc.json`, `rsc.js`, el arnés empaquetado, el mensaje de
`preparar-paquete.js` y `demo.sh`). Subir de versión mayor es una decisión, no un mantenimiento: lo
primero que habría que mirar es la tabla de rutas, y hay dos pruebas que avisan — una compara nuestra
tabla con la del RSC empaquetado, y la otra, que los cinco sitios digan lo mismo (ver A14).

---

## Lo que se miró y estaba bien

Vale la pena dejarlo escrito para que nadie lo vuelva a mirar sin motivo:

- **El instalador**, en sí mismo. Ya no monta el arnés: pone las piezas y delega en el panel, y elige
  bien la extensión del asistente (`claude` → `anthropic.claude-code`, `codex` → `openai.chatgpt`).
  Lo que estaba mal era su prueba, no él.
- **`perfil/`.** Es una ayuda para probar el disfraz a mano, declarada como tal, y lee de la única
  fuente de verdad. Lo que estaba mal era el fichero generado, no el generador.
- **Las copias de `instalador/comun/` en `extension/media/comun/`:** los tres módulos cuadran.
- **La documentación:** veintidós enlaces a ficheros y carpetas del repositorio, ninguno roto, y
  ningún listado de módulos desfasado.
- **`publicar-tiendas.sh`.** No publica si no se lo pides (`--va`), comprueba las dos credenciales
  antes, exige que el paquete exista y avisa de lo único irreversible: al publicar se congela el
  identificador `executivelab.arnes-ui`. Bien.
- **`version.js`**, el aviso de versión nueva de la barra. Es justo la forma correcta de hacer lo que
  el arnés hace mal en A17: mira una vez al día, con reloj, cacheado, nunca lanza, **no instala nada**
  y abre una página. El repositorio al que apunta coincide con el remoto de verdad, así que el aviso
  llega — comprobado, porque una URL escrita a mano que ya no existe es de las que fallan callando.
- **`demo.sh`.** No monta rutas de asistente a mano y fija la versión del arnés exacta.
- **Los dos desinstaladores.** Se miraron buscando lo mismo que falló en A19 —una herramienta que
  sabe lo de hoy y olvida lo de ayer— y los dos conocen el identificador viejo `executivelab.panel`,
  el de hasta la 0.8.4. Ni el de Windows ni el de macOS se han quedado atrás. A19 era la excepción.

---

## Lo que se probó, y lo que no

Diecisiete comprobaciones nuevas en la prueba de humo (130, o 131 con `--con-arnes`, todas pasan), la de la brújula
ampliada, y la de las tres empresas reforzada: la de Codex no tenía ninguna habilidad ni ayudante
legible, así que ese camino no lo probaba nadie. También pasan el comprobador del diccionario y el de
PowerShell.

- Los raíles aterrizan donde mira cada asistente, no se duplican al repetir, y con uno desconocido no
  se escribe nada.
- Un ayudante de Codex se lee entero aunque venga en TOML.
- Cambiar de asistente dice qué deja de verse, y que no se ha borrado.
- **El guardián de qué se puede ejecutar solo.** Los scripts de una herramienta corren sin pasar por el
  asistente y sin preguntar, y viven en la carpeta de las credenciales — o sea, es el sitio donde un
  guardián relajado sin querer duele más. Estaba bien: la lista blanca no sale del nombre del fichero,
  sale de la tabla del README **cruzada con** el verbo, y `ejecutar` comprueba contra esa lista, no
  contra lo que le pasen. Se comprobó ejecutando: pasa el que solo mira; se bloquean el que lleva
  argumentos, el que borra (aunque figure en el README), uno que no figura, y las travesías de ruta
  relativa y absoluta. Lo que faltaba era la prueba de los cuatro últimos, no el guardián.
- **Las lecciones, en los tres sitios.** `lecciones.js` no tenía ninguna prueba de comportamiento —solo
  se comprobaba que el módulo cargara— y el tercer sitio se había añadido en esta misma auditoría sin
  red. Ahora se comprueban los tres, que una lección rota no tumba a las demás, y que sale su texto y
  en qué se basa pero nunca el número de confianza, que no le dice nada a nadie.
- **Una empresa de Codex entera, y bien, no solo sin reventar.** Era el hueco que quedaba: las tres
  empresas comprueban que ninguna pantalla se cae, y eso es la red de seguridad, no un aprobado —
  nada decía que lo que se enseña sea *lo correcto*. Ahora se monta una carpeta de Codex como la
  monta RSC más nuestros raíles, y se comprueba lo que saldría en cada sitio: sus habilidades leídas
  de `.codex/rsc/`, el raíl declarado como suyo, el ayudante en TOML entero, cero botones **y que la
  barra sabe por qué**, `AGENTS.md` mandando, y la regla de `CLAUDE.md` que ahí no lee nadie sin
  aparecer por ningún lado.

Y se pasó **el wizard con un arnés de verdad** (`humo.js --con-arnes`), que es el nivel que esta
prueba se salta por defecto —tarda minutos— y que por eso no lo lanza casi nadie. Importaba: el wizard
llama a `aplicar.js`, o sea a los raíles que esta auditoría ha reescrito, y solo así se ejercen
pasando por el onboarding de RSC de verdad en vez de lanzados a mano. Monta una empresa en una carpeta
vacía y la deja con sus tres botones. **131 comprobaciones.**

Y se **miró el HTML que pinta la barra de verdad** con un arnés de Codex, no solo que pinte algo. Las
dos líneas nuevas salen donde deben: el aviso de «esta carpeta no se montó para él» aparece en la
ficha de Claude y **no** en la de Codex, que es el asistente del arnés; y la radiografía enseña «Con
quién hablas · Codex» sin ninguna fila de botones. Las dos quedaron con prueba sobre el panel real,
que es donde importa que una línea salga en su sitio y no en el de al lado.

Y se pasó **la prueba en un VS Code de verdad**, que es el único nivel que puede desmentir a los
dobles. Importaba aquí más que de costumbre: la tabla se movió de sitio y ahora la barra la carga
desde `../media/railes/sitios`, así que si esa ruta no resolviera en el editor real la extensión se
instalaría y no arrancaría nada. Arranca, con los 33 comandos del manifiesto registrados y 26
ejecutados sin que ninguno reviente.

Y cinco cosas se comprobaron a mano, ejecutándolas, porque leer el código no basta para afirmarlas:

- **Las credenciales, de punta a punta.** Se pegó una clave como la pega alguien de verdad —con
  espacios, comillas y un salto de línea— y salió limpia. El `.env` se siembra del `.env.example`
  respetando comentarios y orden, queda en `600`, la pantalla recibe `••••1234` y nunca la clave
  entera, y una ruta con `..` se rechaza.
- **Las memorias, en los tres sitios.** Una lección guardada en cada uno de los tres se encuentra.
- **La barra cargada desde el .vsix de verdad**, no desde el repositorio: se empaquetó, se
  descomprimió y se cargó `donde.js` desde ahí. La tabla se resuelve y devuelve las carpetas de Codex.
- **Los raíles ejecutados desde ese mismo paquete**, que es como los lanza la extensión: la habilidad
  cae en `.codex/rsc/`.
- El vigilante cubre habilidades y ayudantes, no solo botones.
- La radiografía dice con quién hablas, y con Codex no enseña la línea de los botones.

**Lo que no se ha probado:** nada de esto se ha visto con Codex de verdad delante. La extensión de
OpenAI no expone ningún comando que acepte texto, así que los botones siguen abriendo su barra y
dejando el texto copiado —eso ya estaba comprobado y documentado, no ha cambiado—, pero que su
lector de `AGENTS.md` cargue de verdad una habilidad a la que se le apunta es una suposición
razonable, no un hecho verificado. Es lo que hace RSC con las suyas.
