# Decisiones

Por qué esto está construido así. Sirve para no volver a discutir lo ya discutido, y para que quien
llegue nuevo entienda qué se descartó y con qué pruebas.

---

## 1. El motor es Claude Code oficial, interactivo, dentro de VS Code

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

### Qué se descartó

Un cliente propio (ventana Electron con interfaz web) que condujera el agente con
`@anthropic-ai/claude-agent-sdk` o envolviera `claude -p`. Era la primera propuesta y era mejor por
control del UX: pantalla 100% nuestra, en español, sin nada de programador a la vista.

### Por qué se descartó

**Facturación.** El artículo de soporte de Anthropic separa los usos en dos cubos. Consumen el crédito
mensual del Agent SDK (Pro 20 $ / Max 5x 100 $ / Max 20x 200 $):

> *"Claude Agent SDK usage in your own projects"*, *"the `claude -p` command in Claude Code
> (non-interactive mode)"*, *"third-party apps that authenticate with your Claude subscription through
> the Agent SDK"*

No lo consumen:

> *"Interactive Claude Code in the terminal or IDE"*

Fuentes secundarias sostienen que ese cambio quedó pausado el 15 de junio de 2026 y que hoy todo tira
aún de los límites normales de la suscripción. **Esa es justamente la razón de la decisión, no un
argumento en contra**: Anthropic ya intentó mover esa línea una vez. Un cliente propio deja a cada
alumno colgando de una política que puede volver; el uso interactivo en el IDE, no.

**Términos.** La documentación del Agent SDK:

> *"Unless previously approved, Anthropic does not allow third party developers to offer claude.ai
> login or rate limits for their products, including agents built on the Claude Agent SDK."*

Repartir a una cohorte una aplicación que hace login con la cuenta Claude del alumno entra en zona
gris. Que el alumno se loguee en la extensión oficial de Anthropic no entra en ninguna.

**Y ya existía.** La extensión `anthropic.claude-code` es *"a native graphical interface for Claude
Code"*: chat gráfico (`claudeCode.useTerminal` viene desactivado), revisión de planes, historial.
Login con suscripción Pro/Max/Team, sin clave de API. Y trae **Focus view**, que
*"hides tool calls, tool results, and thinking behind expandable rows, leaving your prompts and
Claude's responses"* — la vista para no técnicos, ya construida y mantenida por ellos.

### Consecuencia

Nuestro producto no es el chat. Es el instalador, el disfraz y los raíles. Sale más barato y se puede
tener listo para la próxima cohorte.

### Cuándo habría que revisarlo

Si Anthropic aprueba expresamente a Executive Lab para ofrecer login con suscripción, o si publica un
modo de distribución pensado para formación. Entonces el cliente propio vuelve a la mesa, porque el
techo de UX es más alto.

---

## 2. La brújula se deriva del disco, no de la conversación

**Estado:** decidido

Se vería mejor leyendo el bloque que `orient` escribe al final de cada turno y convirtiendo sus
opciones en botones. Pero eso ata nuestra barra lateral a la interfaz de Anthropic, que cambia rápido:
el día que rediseñen el panel, nuestros botones dejan de significar nada.

Así que el estado sale del checkpoint de RSC (`rsc memory resume`), de la última copia de seguridad y
de lo que haya en `02-DOCS/`. Es menos rico y se desacopla del todo.

`orient` sigue haciendo su trabajo *dentro* de la conversación. La barra lateral lo repite *fuera*, en
forma de pantalla — porque leer un párrafo y ver un botón no cuestan lo mismo cuando no sabes qué
estás haciendo.

---

## 3. El vocabulario está cerrado

**Estado:** decidido

[diccionario.md](diccionario.md) manda sobre todos los textos: la interfaz, los raíles y los mensajes
del instalador.

No es purismo. Si cada uno escribe con sus palabras, el alumno acaba encontrando tres nombres
distintos para lo mismo y deja de fiarse de los dos que no reconoce. Y quien deja de fiarse de la
pantalla, deja de tocarla.

Hay un comprobador: `node docs/comprobar-diccionario.js`.

---

## 4. Instalación por usuario, sin administrador

**Estado:** decidido

Todo en `%LOCALAPPDATA%` en Windows. Node va portable dentro de la propia carpeta en vez de instalarse
en el sistema.

Es más trabajo y ocupa más. A cambio, entra en portátiles gestionados por el IT de la empresa, que en
pyme es más gente de la que parece — y ese alumno, si no entra, no entra de ninguna manera.

Lo que esto **no** resuelve: SmartScreen y Gatekeeper. Eso solo lo arregla firmar.

---

## 5. El disfraz lo pone la extensión, no un perfil de VS Code

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido (cambia el plan original)

El plan decía "perfil `.code-profile` importado por el instalador". Al auditar cayó por tres sitios,
cada uno suficiente:

1. **No hay forma de importar un `.code-profile` sin interfaz.** VS Code no tiene orden de línea de
   comandos para ello y su formato interno ha cambiado entre versiones.
2. **`code --install-extension` instala en el perfil por defecto.** Un perfil nuevo creado con
   `--profile` arranca vacío: el alumno habría abierto el editor sin Claude y sin nuestra barra.
3. **Hay ajustes de ámbito de aplicación** (`update.mode`, `security.workspace.trust.enabled`,
   `telemetry.telemetryLevel`) que ni un perfil ni un workspace pueden fijar.

Ahora la extensión aplica `media/disfraz.json` en su primer arranque por la API de configuración,
sobre los ajustes de usuario, y propone reabrir. Un comando lo quita (*modo avanzado*) y otro lo
repone. Regalo añadido: VS Code rechaza las claves que nadie ha registrado, así que la propia
extensión nos dice qué claves del disfraz no existen — lo que antes era una pregunta del spike.

Y en modo desarrollo no se aplica solo: quien prueba la extensión desde el código no quiere que le
desaparezca su editor.

---

## 6. Todo va dentro: Node, git y el arnés. Nada de `npx` ni de `.cmd`

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido (cambia el plan original)

El plan asumía `npx @ericrisco/rsc@X` en tiempo de uso. Al auditar, cuatro cosas:

- **Node rechaza lanzar un `.cmd` sin shell** (`EINVAL`, desde 18.20 / 20.12). En Windows `npx` y
  `code` son `.cmd`. Habría fallado en el primer botón, en la plataforma mayoritaria.
- **Una máquina Windows limpia no tiene git.** Y sin git no hay copias de seguridad, que es la mitad
  del valor de la barra lateral. macOS lo tiene, pero pide instalar las herramientas de Xcode con un
  diálogo la primera vez.
- **Los `test_connection.sh` de RSC piden bash**, no `sh`.
- **Los hooks de RSC llaman a `node` por nombre** desde el editor. Si Node no está en el PATH del
  usuario, cada sesión arranca con errores de hook delante del alumno.

Así que el instalador lleva Node portable, MinGit (que trae bash) y el arnés ya instalado con la
versión fijada en `harness/`, y añade Node y git al PATH del usuario. `src/entorno.js` los localiza
por ruta; `src/procesos.js` solo lanza ejecutables de verdad, y cuando no hay más remedio (una máquina
de desarrollo sin la app) pasa por `cmd.exe` a propósito.

Efecto secundario bueno: la instalación no necesita red hacia npm. Solo hacia el marketplace de
extensiones y hacia el login de Claude.

---

## 7. El panel no trae nada predefinido: refleja el arnés

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Con las palabras de Jose: *no predefinido, porque a lo mejor el arnés no es de facturas sino de
contratos y recursos humanos*. De ahí sale la regla que gobierna toda la fase 2: **en el código no hay
ni una herramienta, ni una tarea, ni un tema**. Todo lo que el alumno ve sale de leer lo que RSC tenga
montado en esa carpeta:

| Lo que lee el panel | De dónde |
|---|---|
| Las conexiones y sus claves | `01-TOOLS/<X>/.env.example`, `.env`, `CREDENTIALS.md` |
| Lo que se puede hacer con cada una | La tabla de scripts del `README.md` de esa carpeta |
| Los botones de "Qué quieres hacer" | `.claude/commands/*.md` con `boton:` en el frontmatter |
| Los temas y lo que sabe | `02-DOCS/wiki/index.md` |
| Qué aprendió y qué le falta | `02-DOCS/wiki/log.md`, `gaps.md` |

Y la otra mitad de la decisión: **los botones crecen con el uso**. La habilidad `executive-lab` le
dice a Claude que, cuando una tarea se repite, ofrezca crear un comando con `boton:`. Así una gestoría
acaba con botones de facturación y una empresa de contratos con botones de contratos, sin que nadie
toque el código.

**Consecuencia incómoda, y asumida:** si Claude no rellena la tabla de scripts del README, esa
conexión no tiene botones. La calidad del panel depende de lo que el asistente deje escrito. Por eso
las tres reglas nuevas de la habilidad son tan concretas.

## 8. Los scripts de una herramienta: modo mixto

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Un script que solo mira (`listar_`, `ver_`, `consultar_`, `comprobar_`, `mostrar_`) y cuyo ejemplo no
lleva argumentos se ejecuta desde el botón y se enseña su salida. Cualquier otro se le pide al
asistente, que pregunta lo que falte y pide permiso antes de tocar nada.

Esperar a que el asistente te lea una lista es fricción que sobra; dejar que un botón cree una factura
sin preguntar es un accidente esperando. **El verbo del nombre del fichero decide**, así que la
habilidad le dice a Claude que los nombre con cuidado.

## 9. El disfraz se apaga por ventana, no por instalación

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Jose lo pidió así: poder activarlo y desactivarlo en cada ventana. Se resuelve con los dos ámbitos de
configuración de VS Code: la **base** vive en los ajustes de usuario, y *Ver el editor completo*
escribe en el `.vscode/settings.json` de la carpeta abierta los **valores de fábrica** de lo que se ve
—barra de actividad, barra de estado, pestañas, menú, ficheros ocultos, colores—. Volver al modo
sencillo los borra.

Los valores de fábrica no se copian a mano: se leen de `inspect(clave).defaultValue`, así que no
envejecen cuando VS Code cambie alguno.

**Lo que no se puede por ventana**, porque VS Code los declara de ámbito de programa: el zoom, la
confianza del workspace, las actualizaciones y la telemetría. Se quedan en la base. El zoom es el
único que se nota, y se nota poco.

Como en modo avanzado nuestra barra puede no estar a la vista, la vuelta vive también en la barra de
estado, que sí se ve.

## 10. La marca de executivelab.ai, con una corrección de contraste

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Tipografías (Lato y DM Serif Display, ambas OFL) empaquetadas dentro de la extensión: la interfaz no
pide nada a la red, así que funciona igual sin conexión o con el IT de la empresa bloqueando dominios.
Paleta y radios tomados de la hoja de estilos de la web; el logotipo, recoloreado de blanco a tinta
para fondo claro, y su asterisco final sirve de marca cuadrada para el icono.

**La corrección:** blanco sobre el rojo de marca `#EC4429` da **3,87:1**, que pasa AA solo en texto
grande. La web lo usa así en sus botones de 15 px. Para este público —gente que puede tener poca
vista— no vale: el relleno de botón usa `#e03014`, un 12 % más oscuro, que da 4,56:1. El rojo de marca
se queda en todo lo demás (bordes, foco, la marca, el hover del botón).

También se marca la ventana entera con `workbench.colorCustomizations`, porque el marco del panel de
Claude saca sus colores del tema: sin eso, la barra quedaba color Executive Lab y el resto gris de
fábrica.

## 11. La marca es la de la empresa del alumno, no la nuestra

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Petición de Jose: que el aspecto vaya acorde a la web de la empresa que se pregunta al principio. El
wizard pregunta por ella, y el asistente la mira y deja el récord en `02-DOCS/wiki/brand/marca.md`
—la carpeta donde RSC ya guarda la identidad visual de un proyecto, la que leen `design`,
`design-dna` y `brand-voice`—. El panel lo lee y se pinta con sus colores y su logotipo.

**Quién extrae la marca: el asistente, no la extensión.** Meter un extractor de webs en la extensión
sería frágil, lento y otra cosa más que mantener. Claude ya sabe mirar una web, y así la marca es un
dato del arnés como cualquier otro — igual que las conexiones o los botones (§7).

**Cuatro colores, y nada de tipografía.** Fondo, superficie, texto y acento. Los colores de una web se
pueden adoptar sin romper nada; una tipografía ajena, no, y este público no puede permitirse una
interfaz que de pronto no se lee.

**El contraste se comprueba aquí, no allí.** La web de una pyme casi nunca cumple: el acento se
oscurece solo hasta que el texto de encima se lea (AA, 4,5:1), y si el texto no se lee sobre el fondo
se descarta la marca entera y se queda la de Executive Lab. Mejor la nuestra que una ilegible.

**El default correcto es la nuestra**: durante el curso, hasta que el alumno cuente de qué va su
empresa, el panel lleva Executive Lab.

## 12. El panel se ajusta al arnés conforme se monta

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Petición de Jose: *tiene que ajustarse al arnés que se vaya montando*. Un `FileSystemWatcher` sobre
exactamente lo que el panel lee —`.rsc.json`, `.claude/commands/`, `01-TOOLS/`, el índice, el
historial y los huecos de la wiki, la bandeja de documentos y la carpeta de marca— repinta la barra
sola, con medio segundo de espera para que una tanda de escrituras de RSC sea un repintado y no
veinte.

Sin esto, el alumno le pedía al asistente que conectara su facturación, el asistente lo hacía, y la
barra seguía igual hasta cerrar y abrir. Que la cosa que acabas de pedir aparezca sola es la mitad de
la sensación de que esto funciona.

Un cambio de marca rehace la página entera (cambian colores y logotipo); lo demás va por mensaje.

## 13. Conectar una herramienta es un formulario guiado, no un fichero

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Petición de Jose: para las herramientas, etiquetas y campos por variable en vez de un fichero, y
guías de cómo conectarlas y sacar las claves, escritas por el arnés cuando investiga la herramienta.

El panel ya enseñaba campos; lo que faltaba era **lo que hay que saber para rellenarlos**. Ahora saca
tres cosas de los propios ficheros de la herramienta, que es donde `harness` dice que vivan:

| Qué se enseña | De dónde sale |
|---|---|
| Los pasos numerados, arriba | `README.md` → `## Cómo conectarla` |
| De dónde se saca **cada** clave, pegado a su campo | `CREDENTIALS.md` → tercera columna de `## Variables` |
| El botón a la página del proveedor | `CREDENTIALS.md` → `## Provider dashboard → URL:` |

**La pista va pegada a su campo, no al principio de la pantalla.** Una guía que se lee arriba ya se ha
olvidado cuando llegas al tercer campo, y esta gente va a estar alternando entre esta ventana y la del
proveedor.

**Los pasos solo se enseñan mientras falte alguna clave.** Cuando está todo puesto, estorban.

**Y si el asistente no los ha escrito**, el panel ofrece un botón para pedírselos, que además le dice
que los deje escritos para la próxima. Mejor eso que una pantalla muda.

Lo que el panel no enseña nunca son los pasos técnicos de la plantilla de RSC —copiar el `.env`, dar
permisos—: eso lo hace el panel o el asistente, no el alumno.

## 14. La wiki se lee dentro del panel, no en la vista previa de VS Code

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Al enseñarle a Jose cómo quedaba `02-DOCS` salió un fallo de los gordos: *Leerlo* abría la vista
previa de markdown de VS Code, y lo primero que veía el alumno era el frontmatter del artículo —
`type: article`, `status: draft`, `score: 7.0`—. Es exactamente lo que este proyecto existe para no
enseñar, y estaba en la pantalla que más promete de todas.

Ahora el artículo se lee **dentro del panel**, sin cabecera y sin repetir el título (ya va de rótulo),
con un markdown mínimo escrito a mano: títulos, párrafos, listas, tablas, citas, negrita, código y
enlaces. Se escapa todo primero y después se aplican los patrones, así que nada de lo que escriba el
asistente puede convertirse en etiquetas.

**No es un analizador completo a propósito.** Cubre lo que hay en un artículo de wiki y nada más; una
biblioteca entera sería una dependencia que mantener para esto.

De paso, tres cosas que estaban pobres:

- **Los temas llevan la descripción** que RSC escribe bajo su título en `index.md`, en vez del nombre
  de la carpeta. «Cómo se factura en esta empresa» en vez de «Facturacion», sin tilde.
- **El historial lleva su fecha** en palabras: *hoy*, *ayer*, *hace 3 días*.
- **Los huecos se pulsan.** Cada uno es algo que le falta y que el alumno puede contarle ahora mismo.
  Una lista de carencias que no se puede tocar solo sirve para quedarse mal.

Lo que no es markdown —un archivado en HTML, un original— sigue abriéndose fuera.

## 15. Nada se disfraza solo: hay un interruptor por carpeta

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido (corrige §9)

Jose instaló la extensión en el VS Code donde trabaja y se le cambiaron **todas** las ventanas. El
fallo era de diseño: la base iba a los ajustes de usuario. En la máquina de un alumno da igual —solo
hay una carpeta— pero en cualquier otra es un desastre.

Tres intentos hasta dar con lo que pedía, y la tercera es la buena:

1. Base global + interruptor por ventana → le cambió todo el editor.
2. Disfrazar solo las carpetas con `.rsc.json` → *«No, debe disfrazar solo los arneses que tú
   quieras»*. Tampoco: tener un arnés no significa querer verlo así.
3. **Un ajuste de la carpeta, `executiveLab.vistaSencilla`.** Apagado, no se toca nada. Lo enciende
   el instalador en la carpeta que crea, el wizard preguntando al terminar, o el alumno desde la
   barra.

Lo de ámbito de programa (zoom, confianza del workspace, actualizaciones, telemetría) solo lo escribe
el instalador, que es donde tiene sentido. Y la salida de emergencia apaga también el interruptor: si
no, volvía en el siguiente arranque.

**Lo que esto compra:** tienes VS Code, y aparte esto, y lo enciendes sobre la carpeta que quieras.

## 16. No se llama "empresa"

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Con sus palabras: *«puede ser un arnés para llevar contabilidad, o solo rrhh, o solo un proyecto, o
solo el dpto de marketing»*. Y una empresa puede tener cuatro.

Ahora el alumno pone **dos nombres** cuando dice para qué va a ser: cómo se llama esto (*Contabilidad*)
y cómo se llama su empresa (*Nexus Consulting*). Viven en el frontmatter de
`02-DOCS/wiki/harness/user-profile.md`, junto a los diales, y de ahí salen el rótulo de la ventana
—«Contabilidad · Nexus Consulting»—, el nombre de la carpeta que crea el instalador y los textos del
panel —«Lo que sabe de Contabilidad»—.

Sin nombre puesto se tira del de la carpeta; sin eso, la interfaz funciona sin nombrar nada. Es
preferible a llamarle «tu empresa» al departamento de marketing.

## 17. Claves fuera de sitio: se avisa, no se adivina

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

El caso brownfield, que él vio antes que yo: *«si pones la interfaz en brownfield no detecta»*. El
panel lee `01-TOOLS/<herramienta>/.env`, que es la convención de RSC. Sobre un proyecto que ya
existía, las claves están donde estuvieran — un `.env` en la raíz, un `config/.env.local`— y el
alumno ve «no hay conexiones» teniendo seis.

**No se leen esos ficheros ni se inventa una convención paralela**: solo se detecta que están —cuántos
sitios y cuántas claves— y se ofrece un botón para que el asistente los ordene con el protocolo de
`harness`. Mover credenciales es cosa suya: sabe hacerlo sin romper lo que ese proyecto ya estuviera
usando, y de hecho se le pide expresamente que avise antes de mover nada.

Ni los valores ni las rutas salen por pantalla: las rutas van en el mensaje al asistente, que es quien
las necesita.

## 18. El wizard pregunta lo que pregunta RSC, y los raíles dejan de imponerlo

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido (corrige §7 y los raíles)

Hasta hoy dábamos por supuestas tres de las cinco preguntas del onboarding de RSC: siempre
`operations`, siempre `non-technical`, siempre `L3`. Y por si acaso, `aplicar.js` las volvía a
escribir después, por si RSC había respondido otra cosa.

Eso está mal por dos motivos. Uno práctico: **un arnés puede ser para llevar facturas o para montar
una web**, y quien lo usa puede ser el de administración o alguien que programó hace diez años. Otro
de fondo: si RSC pregunta algo, la respuesta es del alumno, no nuestra.

Ahora los dos wizards —el del editor y el del instalador— preguntan las cinco, en cristiano:

| RSC pregunta | El alumno lee |
|---|---|
| `--project-kind` | ¿De qué va esto? Llevar el día a día · Crear cosas · Construir algo · Estudiar un tema · Un poco de todo |
| `--technical-level` | ¿Qué tal te manejas con el ordenador? Lo justo · Me defiendo · Programo |
| `--accompaniment` | ¿Cuánto quieres que te explique? Todo paso a paso · Lo normal · Poco |
| `--goal` | ¿Qué te gustaría resolver primero? — y las sugerencias cambian según de qué vaya |
| `--target` | ¿Con quién vas a trabajar? — solo si hay más de uno instalado |

Y `aplicar.js` **ya no toca** `technical_level` ni `accompaniment`: solo pone el idioma y la marca de
los raíles. La habilidad dice lo mismo al asistente: esos dos los eligió el alumno, no se cambian por
iniciativa propia.

## 19. La cuenta es el primer paso, no una sorpresa a mitad

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Sin cuenta de pago el chat no responde, y el alumno se queda mirando una caja muda sin saber por qué.

**No se puede detectar si ha iniciado sesión**: la credencial vive en el llavero del sistema, y
mirarla desde la extensión pediría permisos y sería distinto en cada sistema. Así que no se adivina:
cuando el arnés está recién montado y no ha pasado nada —ni conexiones, ni cosas aprendidas, ni
copias, ni sesión anterior— la barra pone arriba del todo **Empieza por aquí: abre Claude y entra con
tu cuenta**, con el aviso de que hace falta una de pago. Desaparece en cuanto hay cualquier rastro de
trabajo.

Si la extensión del asistente ni siquiera está instalada, lo dice y manda al tutor: eso no lo arregla
el alumno.

## 20. No hace falta instalador: VS Code ya lleva Node dentro

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido — y deja el instalador como camino secundario

Idea de Jose: *«¿y si lo publicamos como extensión y ya está?»*. La objeción que yo tenía era que RSC
necesita Node y un alumno no lo tiene. Resulta que sí lo tiene:

**VS Code lleva Node dentro** —su anfitrión de extensiones *es* Node— y su binario lo ejecuta si se
le pone `ELECTRON_RUN_AS_NODE=1`. Comprobado: v24.18.1, y corre `rsc.js` sin tocar nada del sistema.

Comprobado también de punta a punta: con **solo** el Node de VS Code y una copia de RSC dentro de la
extensión, el arnés se monta entero — `RSC_ONBOARDING_READY`, con `.rsc.json`, `01-TOOLS/_TEMPLATE`,
`02-DOCS/wiki/harness`, `settings.json` y el hook de arranque.

**Lo que eso se lleva por delante:**

| Fricción | Con instalador | Con extensión |
|---|---|---|
| Tamaño | 277 MB | **6 MB** |
| SmartScreen | El peor problema de todos | **No existe**: no es un `.exe` |
| Permisos | Por confirmar | **No hace falta** |
| Node, npm | Empaquetados | **Los pone VS Code** |
| Firmar código | Cientos de euros al año | **No hace falta** |

Las tres cosas contra las que llevábamos toda la tarde peleando eran fricción **que nos habíamos
fabricado nosotros** al empaquetarlo todo. VS Code y Claude Code tienen sus propios instaladores
oficiales y firmados: por ahí no hay aviso de SmartScreen que valga.

**Lo que sigue necesitando el instalador de escritorio:** quien no tiene *nada* — ni VS Code ni el
asistente. Pasa a ser el camino secundario, para el alumno que llega con el portátil virgen.

**Lo que la extensión no puede traer: git.** Se usa para «Guardar copia de seguridad». macOS lo trae o
lo ofrece; Windows a menudo no. Sin él, todo lo demás funciona y ese botón avisa de que no puede. Es
el único hueco de este camino.

---

## 21. En Mac, un .dmg con app propia — no el .pkg de Apple

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

### Qué se descartó

El `.pkg`, que es lo que había empezado. Dos motivos, y los dos se ven en el primer minuto:

- **Instalando en `/usr/local` pide contraseña de administrador.** Eso deja fuera a cualquiera con el
  portátil gestionado por el IT de su empresa, que en pyme es más gente de la que parece. El
  instalador de Windows lleva `PrivilegesRequired=lowest` desde el principio: no había paridad.
- **Instalando en la carpeta del usuario, macOS 26 enseña un aviso de privacidad del propio
  Instalador** — *«quiere acceder a datos de otras apps»*— nada más pasar la portada, porque el
  elemento `<domains>` hace que sondee `current-user-home`. Un aviso de permisos del sistema en el
  minuto uno es exactamente lo que este proyecto existe para no tener.

### Qué se hace

Un `.dmg` con una app instaladora nuestra (`instalador/mac/instalar.applescript` para la cara,
`instalar.js` para el trabajo). Escribe solo dentro de la carpeta del alumno: ni contraseña, ni aviso
de privacidad, y las frases son nuestras y están en el diccionario.

**Lo que costó:** la app hay que firmarla y notarizarla igual que el `.pkg` — eso no cambia.

## 22. Las preguntas se hacen en el panel, no en el instalador

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

El instalador de Windows tiene tres páginas de preguntas (objetivo, nombres, asistente). El de macOS
no tiene ninguna, y **no hace falta que la tenga**: el wizard ya existe dentro del producto
(`extension/src/arrancar.js`), pregunta exactamente lo mismo y sale con nuestra tipografía y nuestros
colores en vez de con las de Apple.

Así que en Mac el instalador deja las herramientas, el editor y el acceso directo, crea la carpeta
**vacía**, y el panel abre con *«Aquí todavía no hay nada» → «Preparar esta carpeta»*.

De paso quita una duplicación: las seis opciones de objetivo estaban copiadas en el `.iss` y en
`arrancar.js`. Unificar Windows por este mismo camino es la mejora obvia, pero no se ha hecho: el
`.exe` ya está compilado y probado, y tocarlo ahora es arriesgar lo que funciona.

## 23. El historial es git escrito en JavaScript, no el git del sistema

**Fecha:** 17 de septiembre de 2026 · **Estado:** ~~decidido~~ **revisada por la decisión 26**

> git pasó a ser obligatorio y lo instala el instalador oficial de cada sistema. Lo que sigue
> vigente de aquí: que en un Mac limpio no hay git y que `/usr/bin/git` es un señuelo. Lo que
> cambió: la respuesta.

### El problema

En macOS **no hay git**. El `/usr/bin/git` que parece haber es un señuelo: al invocarlo abre el
diálogo de instalar las herramientas de Xcode —uno o dos gigas y contraseña de administrador— y ahí
se acaba la clase. Y no se puede renunciar al historial: de ahí salen *Guardar copia de seguridad*,
*Volver a como estaba antes* y subir el arnés a GitHub.

### Qué se hace

`isomorphic-git` (4,8 MB, JavaScript puro) sobre el Node que ya llevamos dentro, en
`instalador/comun/historial.js`, con el binario de git como red de seguridad para quien lo tenga.
Para GitHub es incluso mejor que el git de verdad: se autentica con una clave por HTTPS, sin
llaveros, sin claves SSH y sin el gestor de credenciales de Windows.

**Dos fallos que salieron al probarlo, y que estaban antes:**

- `read-tree -m -u --reset` —lo que hacía *Volver a como estaba antes*— lo **rechaza git desde la
  2.4x** con un solo árbol: *"Which one? -m, --reset, or --prefix?"*. O sea que ese botón nunca
  funcionó por el camino del binario. Ahora es `--reset -u`.
- `statusMatrix` de isomorphic-git dice que un fichero no ha cambiado si se reescribe **en el mismo
  segundo y con el mismo tamaño** (se fía de la fecha para no leerlo). Escribiendo documentos a
  máquina eso pasa, y una copia se habría dejado el cambio dentro sin avisar. Por eso `guardar` no
  usa esa columna: mete todo en el índice, que sí lee el contenido, y compara resúmenes.

**Lo que abre:** el camino sin instalador (decisión 20) decía que su único hueco era git. Ya no lo
es: la biblioteca cabe dentro del `.vsix`. Falta decidir si se mete, porque son 5 MB sobre 6.

## 24. Buscar lo resuelve la barra, no el asistente

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

Buscar es mirar, no conversar. Preguntárselo al asistente cuesta una conversación nueva y unos
segundos de espera para algo que está en el disco y se resuelve en milisegundos. `buscar.js` indexa
la wiki entera, los botones y las conexiones, sin dependencias, y solo cuando no hay resultados
aparece el botón que se lo pregunta a él.

Es el primer trozo de `docs/friccion.md` §4 —*"los botones que solo consultan no deberían hablar con
el asistente"*— que está hecho.

## 25. Sugerir, sí; dar la lata, no

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

`consejos.js` puede avisar de seis cosas (documentos sin leer, una conexión a medias, días sin copia,
una tarea repetida tres veces, una habilidad del catálogo que encaja, un hueco de la wiki). Tres
reglas para que eso no acabe siendo ruido:

1. **Una tarjeta como mucho**, la que más desatasca.
2. **Siempre "Ahora no"**, y entonces no vuelve en dos semanas.
3. **Nada que no se resuelva ahí mismo con un botón.**

Y sobre ofrecer habilidades de RSC: el catálogo trae 272, todas descritas en inglés y en jerga.
`rsc consult` rankea solo en inglés —probado: la misma consulta en español devuelve
*(no recommendations)*—. Así que no se usa: hay un catálogo curado de 25 en
`extension/media/capacidades.json`, dichas en español de negocio, y **lo que no está ahí no se
ofrece nunca**. Hay una comprobación que falla si alguna deja de existir en el catálogo de verdad.

---

## 26. git es obligatorio, y lo instala el instalador oficial de cada sistema

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido — **revisa la decisión 23**

Idea de Jose: *«puede ser el git del sistema. La idea es que haya un instalador de git en el
instalador, no traer git. Yo lo que quiero es que sí o sí se trabaje con git, es necesario»*.

### Lo que estaba mal

git se trataba como opcional: si faltaba, las copias de seguridad las hacía `isomorphic-git`, que
viajaba dentro, y el botón avisaba de que faltaba *«una pieza; díselo a tu tutor»*. Era mentira por
tres sitios, y los tres se ven en el código:

- **Montar la carpeta ya exigía git.** `arrancar.js` hace `git init` con el binario del sistema antes
  que nada, y si falla aborta. O sea que era obligatorio de hecho; lo que faltaba era decirlo.
- **El arnés usa git por su cuenta**, y ahí la biblioteca no llega: `git check-ignore` al instalar,
  los `verify.sh` de varias habilidades, y el registro de continuación, que se indexa por rama y por
  HEAD. Sin git el arnés funcionaba a medias y sin avisar.
- **El aviso era un callejón.** «Díselo a tu tutor» no es una salida para quien está solo delante de
  la pantalla.

Y en la extensión instalada desde el `.vsix` no había ni biblioteca: `historial.js` no viajaba
dentro, así que las copias quedaban apagadas en silencio.

### Qué se hace

**git es un requisito, se comprueba antes de preguntar nada, y el panel lo instala.** No lo
distribuimos: se lanza el instalador oficial de cada sistema, que además está firmado por quien lo
hace y no por nosotros.

| | Cómo se instala | Qué cuesta |
|---|---|---|
| macOS | `xcode-select --install`, el diálogo de Apple | 1-2 GB una vez, en un Mac limpio |
| Windows | El `.exe` oficial de Git para Windows, descargado y lanzado en silencio | Un par de minutos |

Un git empaquetado no habría servido: solo lo ve quien lo invoque por su sitio exacto, y los scripts
del arnés lo llaman por nombre. Hace falta uno instalado de verdad.

### Lo que eso cambia

- `instalador/comun/git.js`: el mecanismo, compartido entre el instalador y la barra.
- El motor de las copias pasa a ser **el binario** (`preferirBinario`). `isomorphic-git` se queda
  dentro de `historial.js` como resto, para el instalador que todavía la lleve.
- `historial.js`, `git.js` y `enganches.js` **viajan dentro del `.vsix`** (`preparar-paquete.js`).
  Son catorce kilobytes cada uno; la biblioteca de cinco megas ya no hace falta.
- En macOS, comprobar **nunca ejecuta `/usr/bin/git`**: existe siempre aunque git no esté, y al
  invocarlo abre el diálogo de Apple. Se mira el disco y se pregunta `xcode-select -p`.

### Lo que la decisión 23 sigue teniendo razón

Que en un Mac limpio no hay git y que `/usr/bin/git` es un señuelo. Lo que cambia es la respuesta:
entonces fue esquivarlo con una biblioteca, ahora es instalarlo de verdad. La biblioteca resolvía las
copias, pero no el arnés — y el arnés es el producto.

### Lo que falta por confirmar

- Si `xcode-select --install` pide **contraseña de administrador** en una cuenta gestionada. En una
  de administrador no debería. Solo se ve en un Mac limpio.
- Si el instalador de Git para Windows, **lanzado sin elevar**, instala para el usuario sin pedir
  administrador. Es el único paso de todo esto que no se puede probar desde un Mac.

---

## 27. El instalador pone las piezas; el panel hace el onboarding

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido — **cierra la decisión 22**

Jose, describiendo el recorrido entero: *«cuando el usuario instale la app, se instale vscode, git,
node, etc. Luego, cuando seleccione carpeta y le dé a empezar, se empiece el proceso de pedir
información, documentación, contexto, empresa, qué se quiere hacer, web. Y luego se instala e
implementa RSC y se empieza a trabajar»*.

### El reparto

| | Qué hace |
|---|---|
| **Instalador** | El editor, Node, git y las dos extensiones. Un acceso directo que abre el editor. **Se acaba ahí.** |
| **Panel** | Elegir carpeta → las preguntas → montar RSC → raíles, nombres, enganches, primera copia → trabajar |

### Qué estaba mal

La decisión 22 ya decía que las preguntas las hace el panel, pero solo se aplicó en macOS. El
instalador de Windows seguía preguntando seis cosas y montando un arnés en
`Documentos/Mi Empresa IA`. Eso dejaba dos problemas:

- **Dos versiones del mismo onboarding.** `preparar.js` y `arrancar.js` hacían el mismo trabajo con
  el mismo orden de pasos, y la cabecera de `arrancar.js` lo decía: *«si cambias los pasos aquí,
  míralo también allí»*. Eso no se sostiene: lo de Windows se quedó atrás y nadie lo vio.
- **Se elegía la carpeta por adelantado**, a ciegas, antes de que esa persona hubiera abierto el
  programa. Si al final trabajaba en otra, la primera quedaba ahí montada y vacía.

### Qué se lleva por delante

- `preparar.js` pasa de 342 líneas a dos pasos: asegurar git e instalar las extensiones.
- El `.exe` pierde MinGit y baja de 291 a **268 MB**. El `.dmg`, de 122 a **103 MB**: ya no lleva el
  arnés ni los raíles, que viajan dentro del `.vsix`, que es quien los usa.
- El acceso directo abre el editor **sin carpeta**.
- Del instalador de Windows quedan **seis páginas menos**: solo se pregunta con qué asistente va a
  trabajar, porque de eso depende qué extensión se instala.
- `instalador/windows/preparar-carga.sh`: la carga de Windows se montaba a mano y por eso se quedó
  atrás tres horas con la extensión 0.1.0 dentro. Ahora la monta un script, como en macOS.

### Lo que sigue sin probarse

El `.exe` y el `.dmg` nuevos, ejecutados en una máquina limpia. Lo que sí pasa: las 19
comprobaciones de `mac/probar.sh` —reescritas para el contrato nuevo— dan 7 bien y 1 mal, y el mal
es la firma, que está marcada como mala a propósito hasta que existan los certificados.

---

## 28. En una carpeta que ya es de alguien, se mira antes de tocar

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, al ver el botón: *«si es sobre brownfield, simplemente revisa lo que ya hay y no hace nada o
solo mira si hay algo que ajustar de RSC? porque debe hacer eso, si no joderás los proyectos ya
empezados»*. Y después: *«la extensión debe detectar todo de base»*.

### Qué estaba mal

El único guardarraíl era `.rsc.json`. Si no estaba, "Preparar esta carpeta" montaba el arnés sin
mirar qué había debajo — daba igual que fuera una carpeta vacía o un proyecto de tres años.

Y el último paso era el peor: `guardar.guardar('Punto de partida')`, que por debajo es `git add -A`
y un commit. En un proyecto con trabajo sin guardar, eso **mete todo lo de esa persona en un commit
nuestro, dentro de su historial**. No se pierde nada —es un commit, no un reset— pero no se hace.

### Qué se hace

`extension/src/terreno.js` clasifica la carpeta antes de ofrecer nada, en cinco casos excluyentes:

| | Qué es | Qué ofrece el panel |
|---|---|---|
| `sinCarpeta` | No hay ninguna abierta | Elegir una |
| `conArnes` | Ya tiene arnés, entero | El panel normal |
| `aMedias` | Hay `.rsc.json` pero falta suelo | "Algo va mal" |
| `vacia` | No hay nada | **Preparar esta carpeta** |
| `empezada` | Ya es de alguien | **Añadir el asistente a esto**, y antes, qué se ha visto |

En el caso `empezada` el panel dice lo que ha encontrado antes de que nadie pulse nada: de qué parece
que va, cuántas cosas hay, si tiene historial propio, cuántos cambios sin guardar y cuántas claves
sueltas. Y promete lo que el código cumple.

**La regla que lo sostiene:** el punto de partida solo se escribe si el historial es nuestro. Se mira
por el autor de los commits — si hay alguno que no sea `Executive Lab`, es de alguien y no se toca.
Se monta el arnés, se deja todo en el disco, y esa persona lo guardará cuando quiera y con su
mensaje.

### Lo que NO cambia

Que se pueda añadir el arnés a un proyecto que ya existe. RSC está pensado para eso, y `sueltas.js`
lleva desde el principio detectando credenciales fuera de sitio en carpetas que ya tenían cosas. Lo
que cambia es que ahora se dice en voz alta antes, en vez de hacerlo callando.

### Cómo se sabe que no se rompe

Dos comprobaciones nuevas. Una monta un proyecto de mentira con su `package.json`, su historial
firmado por otro y un cambio sin guardar, y exige que salga `empezada`, que la brújula lo avise y que
`podemosGuardarElPuntoDePartida()` diga que **no**. La otra exige que una carpeta vacía siga
preparándose sin preguntar nada.

---

## 29. La cuenta de GitHub la pone el editor, no una clave a mano

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«tenemos que ver cómo lo de la copia de seguridad interactúa con git y GitHub, y se tiene que
detectar si VS Code está conectado a GitHub y si no ofrecer una guía muuuy muy didáctica»*.

### Qué estaba mal

"Guardar una copia fuera de este ordenador" solo aparecía si había una clave escrita a mano en
`01-TOOLS/github/.env`. Para alguien que no programa, sacar un token de GitHub es de las cosas más
difíciles que se le pueden pedir: ajustes de desarrollador, elegir permisos, y copiar una cadena que
solo se ve una vez. Y si no la tenía, el botón **no existía** — así que ni siquiera sabía que eso se
podía hacer.

### Qué se hace

**VS Code ya sabe iniciar sesión en GitHub.** Trae su proveedor dentro, con su botón y su navegador.
`vscode.authentication.getSession('github', ['repo'], { silent: true })` dice si esa persona ya está
dentro **sin abrir ningún diálogo**, que es lo que hace falta para pintar un panel.

- Si ya entró alguna vez —por sus ajustes, por Copilot, por lo que sea—, no hay nada que pedir.
- Si no, el botón sigue estando y lleva a una guía, no a un error.
- La clave a mano sigue valiendo para quien ya la tuviera puesta.

### La guía

Una pantalla que separa las tres cosas que hoy se confunden entre sí, y dice en cuál estás:

1. **Entrar en tu cuenta** — lo hace el editor; aquí no se escribe ninguna contraseña.
2. **El sitio donde se guarda** — se crea solo, privado, con el nombre de la carpeta.
3. **Guardar** — primero aquí, después fuera.

Se enseña entera aunque no haga falta: quien no sabe qué es esto necesita entender qué va a pasar
antes de pulsar, y quien ya lo sabe la ignora de un vistazo.

---

## 30. "Qué hay en esta carpeta": hasta qué punto está montada

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, con la extensión ya instalada en sus ventanas: *«no las detecta en otros repos las conexiones.
Si es posible debe detectar todo, o debe haber una forma de ver si la carpeta ya está inicializada y
hasta qué punto»*.

### El malentendido, que era culpa nuestra

No estaba roto: en esas carpetas no hay conexiones que leer. Pero **el panel no sabía decir la
diferencia** entre "no tienes ninguna" y "no encuentro ninguna", y son cosas muy distintas cuando
estás mirando una barra que no entiendes.

La pantalla principal solo sabía dos estados: hay arnés o no lo hay. Y entre medias hay mucho — un
arnés montado sin conexiones, conexiones a medias, claves que están pero fuera de sitio, una wiki
vacía, copias sin cuenta donde subirlas.

### Qué se hace

`terreno.radiografia()` y una pantalla que lo enseña pieza por pieza, sin esconder lo que falta:

| Pieza | Qué dice |
|---|---|
| El asistente, montado aquí | Listo · a medias · todavía no |
| Conexiones con tus herramientas | Cuántas, y cuántas sin terminar |
| Claves que ya tenías, fuera de sitio | Cuántas y en cuántos sitios (`sueltas.js`) |
| Lo que sabe de tu trabajo | Cuántos temas |
| Botones que ha aprendido | Cuántos |
| Copias de seguridad aquí | Y si el historial ya era tuyo, que no se toca |
| Copias fuera de este ordenador | Si has entrado en tu cuenta, y a dónde van |

Cada pieza lleva una marca —`✓`, `!`, `·`— que se lee igual en blanco y negro y con daltonismo: el
color solo acompaña.

---

## 31. La pantalla principal son cinco filas plegadas, no doce botones seguidos

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, después de la última tanda: *«vemos de mejorar también la barra porque ahora me parece un poco
desordenada»*.

Tenía razón y el código ya lo confesaba: había un comentario que decía «esta pantalla se diseñó con
seis botones y ya van doce». La respuesta de entonces fue hacerlos pequeños. Eso arregla el alto,
no el desorden.

### Qué estaba mal

Cuatro rótulos —*Tu trabajo*, *Guardar*, *Si algo no cuadra*— y debajo de cada uno una tira de
botones del mismo tamaño, más cuatro botones sueltos al final sin rótulo ninguno. Todo pesaba lo
mismo, así que para llegar a lo de siempre había que repasarlo todo. Y *Tu trabajo* no quiere decir
nada: es donde caía lo que no cabía en otro sitio.

### Qué se hace

Arriba se queda **lo que se pulsa a diario y sin desplegar nada**: lo que el asistente ha ido
creando como botón, y lo que se mira de un vistazo de cada herramienta. Eso no se toca.

Lo demás baja a cinco filas plegadas, con el mismo `<details>` nativo que ya usaban las
herramientas:

| Fila | Qué guarda |
|---|---|
| Lo que sabe de *<nombre>* | Ver los temas · Darle documentos · Llevarte un archivo |
| Mis conexiones | Verlas y cambiarlas · Conectar algo nuevo |
| Guardar | Guardar en git · Subir a GitHub · Volver a como estaba antes |
| Qué se ha hecho | El diario y las decisiones · Apuntar lo de hoy |
| Ajustes y ayuda | Qué sabe hacer · Cómo te habla · Qué hay en esta carpeta · Algo va mal · Cambiar de carpeta · Ponerle la cara · Ver el editor completo |

No se esconde nada: **cada fila dice qué guarda y cuánto hay dentro** —las conexiones que tienes, las
cosas que sabe— y lo que se abre se queda abierto mientras dure la sesión, porque el vigía repinta
la pantalla cada vez que el asistente toca un fichero.

Los dos números que antes salían en la brújula (*2 conexiones · 7 cosas aprendidas*) se han ido a la
fila de cada uno. Ahí el número es accionable; en la brújula era decoración.

### Lo que esto cuesta, y por qué se acepta

Un clic más para llegar a *Guardar en git*. A cambio, la pantalla entera cabe de un vistazo, que es
la condición para que alguien encuentre algo sin conocerlo de antes. Y lo que se usa a diario no ha
perdido ningún clic: sigue arriba y desplegado.

Hay una prueba que se asegura de que ninguna acción se ha quedado fuera al agrupar, porque un botón
que desaparece al reordenar no da ningún error: simplemente deja de existir.

---

## 32. El diario del arnés se ve: qué se hizo y qué se decidió

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

RSC escribe dos cosas que no miraba nadie, y la segunda es probablemente lo más valioso que hay en
la carpeta:

- **`02-DOCS/raw/worklog/AAAA-MM-DD-loquesea.md`** — una ficha por cada rato de trabajo de verdad,
  escrita sola al cerrar la conversación: qué se hizo, por qué, qué se tocó y cómo quedó. El
  protocolo la llama *evidencia*: se escribe una vez y no se corrige nunca.
- **`02-DOCS/wiki/harness/decisions.md`** — el registro de decisiones, que solo crece. Cada entrada
  dice qué se eligió, entre qué opciones y **por qué**. Si algo se cambia de idea, se añade otra que
  anula la anterior.

«¿Por qué hicimos esto así?» a los tres meses no se contesta mirando los archivos. Se contesta ahí,
y ahí estaba enterrado.

### Los dos formatos, los dos se leen

Las decisiones se escriben de dos maneras según quién las escriba:

- la larga, del protocolo: `## D-0001 — Título` y debajo `- date:`, `- decision:`, `- why:`;
- la corta, la que deja el montaje inicial: una línea por decisión y nada más.

Con la larga sola, el primer día la pantalla sale vacía. Con la corta sola, se pierde el porqué. Se
leen las dos, y las plantillas del arnés —lo que viene entre llaves— se descartan: enseñar un
ejemplo de la plantilla como si fuera trabajo de esa empresa es mentir.

### Lo que se apunta, no se cuenta como documento

`raw/worklog/` cuelga de `raw/`, que es donde se guardan los documentos originales que alguien ha
entregado. Contar el diario ahí le diría al alumno que ha entregado papeles que no ha entregado, así
que `cerebro.originales()` lo salta.

### Y se puede apuntar a mano

El barrido lo dispara el arnés al cerrar la conversación. Quien se va a comer y vuelve se queda sin
anotación, así que hay un botón que pide el mismo barrido cuando se quiera.

---

## 33. "Cómo te habla" se toca desde la barra, no escribiéndolo en la conversación

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Es el ajuste que más cambia el día a día del alumno y no había forma de tocarlo.

RSC lo guarda en `02-DOCS/wiki/harness/user-profile.md` y **todas** sus habilidades lo leen antes de
abrir la boca. La habilidad `orient` lo dice con todas las letras: `L0` es casi mudo, `L3` explica
cada paso y pregunta mucho. Y en paralelo, `technical_level` decide el vocabulario.

Hasta ahora eso solo se cambiaba diciéndoselo al asistente por escrito. Quien no sabe que existe no
lo dice nunca: alguien que se siente perdido no tiene forma de pedir más mano, y alguien que ya va
suelto se come párrafos que no quiere.

### Cómo se enseña

Cuatro escalones y tres vocabularios, dichos como se dicen —*Al grano*, *Corto*, *Te explica por
qué*, *De la mano*; *En cristiano*, *A medias*, *Sin rodeos*— y el que está puesto, marcado. Los
identificadores `L0`..`L3` son de RSC y no se ven.

### Los dos sitios donde vive, y por qué importa

El mismo dato aparece de dos formas según quién escribiera el fichero: en la cabecera
(`accompaniment: L1`) o en el cuerpo (`- accompaniment_level: L3`). Las dos son legítimas —la
primera la deja el montaje, la segunda es la de la plantilla del arnés— así que se leen las dos y se
escribe **donde ya estaba**. Escribir donde no estaba dejaría el valor viejo debajo y el asistente
leería el que no toca.

Por lo mismo, mirar y escribir son dos pasos separados: si se mirara comparando el texto de antes y
el de después, volver a elegir lo que ya estaba puesto parecería que la clave no existe, y se
escribiría una segunda línea debajo.

En ese fichero viven también el nombre del arnés y el de la empresa, que son el rótulo de la barra.
Hay una prueba que se asegura de que siguen ahí después de tocar el dial.

---

## 34. Un símbolo suelto no dice de quién es esto, así que se le escribe el nombre al lado

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, con la barra de Nexus Consulting delante: *«hay alguna forma de ajustar también los colores a
la web, y que el logo si no es logo que incluya el título se ponga el título?»*.

Y tenía delante la prueba: arriba del todo, una ene de puntos preciosa que no dice de quién es eso.
En su web esa ene nunca va sola — va con «NEXUS CONSULTING» al lado. Nosotros la habíamos recortado.

### Cómo se sabe si el logotipo lleva el nombre dentro

Dos maneras, en este orden:

1. **Que lo diga el récord.** Quien miró la web vio la imagen y lo sabe. El campo es
   `logo_lleva_el_nombre`, y se aceptan cuatro formas de escribirlo porque el récord lo redacta el
   asistente, no un formulario.
2. **La proporción.** Un logotipo con el nombre es una tira de letras y sale ancho; un símbolo es
   más o menos cuadrado. Desde tres veces más ancho que alto se da por hecho que el nombre va
   dentro. `medidas.js` lo saca de la cabecera del fichero —SVG, PNG, JPEG y WebP— sin
   descodificar la imagen y sin traer nada de fuera.

**Y si no se puede saber, se escribe el nombre.** Repetirlo queda redundante; no ponerlo deja un
dibujo anónimo, que es peor. El default va al lado seguro.

---

## 35. Una marca oscura se queda oscura, aunque el editor también lo esté

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

`panel.css` tenía una regla que, con un tema oscuro del editor, le quitaba a la marca el fondo y se
quedaba solo con los acentos. La razón era buena: una isla color crema dentro de un editor negro
queda fatal.

Pero esa razón **no vale cuando la marca ya es oscura**. La de Nexus Consulting es azul marino con
cian: ahí la regla estaba tirando a la basura justo los colores que encajaban. Así que si el fondo
de la empresa es oscuro, manda su fondo también con tema oscuro.

El alto contraste se queda fuera a propósito: quien lo usa lo usa porque lo necesita, y ninguna
marca vale eso.

---

## 36. Lo que se le pide al asistente para la marca se dice entero

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Antes se le decía: *«mira la web y ponle a esto la cara de mi empresa: sus colores y su logotipo»*.
Sin decirle dónde escribirlo ni con qué nombres. Si acertaba, era por suerte.

Y cuando no acertaba, **no fallaba nada**: el récord quedaba escrito, el panel no encontraba los
campos que sabe leer, y la barra se quedaba con los colores de Executive Lab. Nadie se enteraba de
que había pasado algo. Es el peor tipo de fallo que hay en este proyecto —el que no se ve— y ya ha
salido tres veces en la auditoría.

Ahora el contrato se dice entero, en `marca.queLePedimos()`, y lo usan los dos sitios que lo piden:
el botón de la cara y el montaje de una carpeta nueva. Las tres cosas que importan: dónde va, cómo
se llaman los campos, y **que los colores sean los de verdad de la web** — si es oscura, oscuros,
porque desde la decisión 35 la barra sabe pintarse oscura y no hay que aclararlos «para que
encajen».

---

## 37. Los rótulos dejan de ser preguntas y pasan a ser nombres de cosas

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«se nos está yendo el orden y los nombres abstractos. Eso de "Lo que sabe a medias" de
descriptivo tiene cero»*.

El inventario le daba la razón con números. **Once de los veintitrés rótulos de la interfaz
empezaban igual:** *Qué quieres hacer · Qué sabe hacer · Qué hay en esta carpeta · Qué se ha hecho ·
Qué ha aprendido últimamente · Qué decidisteis · Qué puedes hacer con esto · Qué hay aquí · Lo que
sabe de X · Lo que aún no sabe · Lo que sabe a medias.*

Ese era el problema, más que lo abstracto: **eran preguntas sobre lo que sabe la máquina, no nombres
de cosas.** Cuando once rótulos arrancan con "Qué…", ninguno destaca y hay que leer la frase entera
para distinguirlos. Y un contador al lado no salva nada: "Lo que sabe de Nexus · 7" — ¿siete qué?

### La regla

**Las cosas se llaman con sustantivos que la persona ya usa. Los verbos se guardan para las
acciones.** Una lista de nombres se barre con la vista; una lista de preguntas hay que leerla.

Queda **una sola pregunta** en toda la barra, *Qué quieres hacer*, que es la llamada principal.
Siendo la única, destaca.

### Qué se llamó cómo

| Antes | Ahora |
|---|---|
| Mis conexiones | Tus programas |
| Guardar | Copias de seguridad |
| Qué se ha hecho | El diario |
| Qué sabe hacer | Habilidades · Todo lo que sabe hacer |
| Qué hay en esta carpeta | Qué falta por montar |
| Mirar de un vistazo · Qué puedes hacer con esto | Consultar · Consultas |
| Lo que aún no sabe | Preguntas sin contestar |
| Qué decidisteis, y por qué | Decisiones |
| Ajustes y ayuda | Ajustes · Si algo falla |
| Cambiar de carpeta | Cambiar de proyecto |
| Ponerle la cara de tu empresa | Poner el tema de mi empresa |

Los dos últimos los dijo Jose con sus palabras, y se cogen tal cual. Lo de *tema* dejó de chocar con
los temas de la wiki en cuanto los artículos pasaron a llamarse **conceptos**.

*Elegir una carpeta* se queda como está en la pantalla de arranque: ahí todavía no hay proyecto
ninguno y lo que se elige es literalmente una carpeta del ordenador.

---

## 38. El archivador y lo que el arnés ha entendido son dos cosas distintas

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«lo que peor entiendo es lo de ver los temas […] aquí hay que separar entre el archivador o
los documentos y los conceptos que, entre comillas, sabe el arnés»*.

Estaban en el mismo grupo, y no son lo mismo:

- **Documentos** — el archivador. Los ficheros que entran (`02-DOCS/inbox/`) y los que salen
  (`01-TOOLS/<lo que sea>/out/`). Papeles.
- **Lo que sabe** — lo que el arnés ha entendido de todo eso: los conceptos de la wiki, ordenados
  por asunto, y las preguntas que sabe que no tiene contestadas.

Juntas, *Ver los temas* aparecía en medio de unos documentos sin que se supiera qué iba a salir al
pulsarlo. Separadas, cada grupo dice lo que trae.

**Las preguntas sin contestar salen a su propia pantalla.** Estaban al final de la de conceptos,
detrás de todo lo demás, que es donde no las ve nadie — y es de lo más accionable que hay aquí:
cada línea se pulsa y se le cuenta lo que falta.

**Y las habilidades suben.** Jose: *«no están las skills»*. Estaban, enterradas en *Ajustes*. Ahora
van pegadas a los botones que el asistente ha creado, que es exactamente donde surge la pregunta:
vale, ¿y qué más sabe hacer?

---

## 39. Una anotación del diario se abre al lado, no dentro de la barra

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose lo probó y mandó la captura: *«al darle a ver "Días de trabajo" sale que no se lee bien. Mejor
que se abra el archivo markdown compilado al lado»*.

Tenía toda la razón. Una anotación de trabajo es media página de texto con nombres de fichero
dentro; en una columna de 300 píxeles se lee a cuatro palabras por línea y los nombres largos se
salen por el lado. La barra es para orientarse y para pulsar cosas, no para leer documentos.

Así que se abre con `markdown.showPreviewToSide`: **compuesto, no en crudo**, porque quien lo lee no
tiene por qué ver los asteriscos y las almohadillas. Si esa vista no estuviera disponible, se abre
el documento a secas al lado.

La pantalla que lo pintaba dentro se ha borrado.

### Y de paso, dos cosas que enseñaba la misma captura

**«…y sale a la luz el diario del arnéshoy».** La fecha iba detrás del título, dentro del mismo
párrafo, y ese párrafo no es una fila flexible: se quedaban pegadas. Ahora la fecha va en su línea,
encima. Hay una prueba que lo vigila.

**El texto apagado se apagaba dos veces.** `--apagado` ya viene calculado para cumplir contraste
sobre el fondo; encima llevaba una opacidad del 0,65 al 0,85 según el sitio. Sobre fondo claro
molestaba; con tema oscuro acababa en gris sobre gris, que es lo que se veía en la captura. Se han
quitado todas y ahora se pinta con el color, que es el que está comprobado. Otra prueba lo vigila.

---

## 40. Seis apartados, y el criterio es de qué van

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

La propuso Jose entera, y es mejor que lo que había. Lo anterior eran cajones —*Tu trabajo*,
*Ajustes y ayuda*— y se notaba en que las habilidades acabaron flotando arriba sin casa y *Tus
programas* estaba suelto porque no cabía en otro lado. Esto no es una recolocación, es un criterio:

| Apartado | De qué va |
|---|---|
| **Documentos** | Los papeles. Ver los que han entrado, darle más, llevarte uno |
| **Lo que sabe** | Lo que ha entendido de esos papeles: conceptos, preguntas sin contestar, cómo te habla |
| **Histórico** | Lo que ha pasado y cómo volver: copias, GitHub, el diario, las decisiones |
| **Acciones** | Todo lo que es actuar: programas, conectar algo, habilidades, crear un botón |
| **Ayuda** | Cuando te atascas: qué hacer ahora, ideas, algo va mal, qué falta, guías |
| **Ajustes** | Configurar: el tema, el proyecto, el modo sencillo o completo |

Con esto, cada cosa nueva que aparezca tiene un sitio obvio. Que era el problema de fondo.

### Cuatro cosas que se apartaron de la propuesta, y por qué

**Las habilidades van solo en Acciones.** Jose las había puesto en *Conocimiento* («qué sabe hacer»)
y en *Acciones* («skills»), y son lo mismo. Una habilidad es la capacidad de **hacer** algo. En los
dos sitios volvíamos al par que confunde: lo que sabe contra lo que sabe hacer.

**Un buscador, no dos.** Pedía uno de documentos y otro de conceptos. Dos cajas obligan a elegir
cuál **antes** de saber qué buscas, que es la peor pregunta que se le puede hacer a alguien que no
sabe dónde está algo. El que hay agrupa por tipo, así que se le añadieron los papeles y el diario y
cubre los dos casos. Sube a la pantalla principal, que es donde se busca.

**Lo de diario se queda arriba y desplegado.** Los botones que el asistente ha creado y el
*Consultar* de cada programa son lo que se pulsa todos los días. Meterlos dentro de *Acciones* les
añadiría un clic y desharía la decisión 31.

**«Cómo te habla» se quedó en Lo que sabe**, no en Ajustes. Yo defendía Ajustes —es una perilla de
comportamiento— y Jose lo puso en conocimiento, que es donde vive: el mismo fichero que guarda quién
es esta persona y qué quiere. Manda él.

---

## 41. "Volver a como estaba antes" pasa a "Volver a un punto anterior"

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose preguntó qué hacía exactamente ese botón, *«porque si es un revert o rollback de github
tendríamos que ver a qué antes»*. La pregunta destapó que el nombre mentía por omisión.

**Lo que hace, y no tiene nada que ver con GitHub:**

1. Enseña las **diez últimas copias** con su etiqueta en cristiano: *Como estaba ayer*, *Como estaba
   el martes*. Se elige una.
2. Antes de mover nada, **guarda una copia del estado actual**.
3. Deja la carpeta como estaba en esa copia — también quita lo que se creó después.
4. Y **apunta la vuelta atrás como una copia más**, así que también se puede deshacer.

No se borra nada y no se reescribe la historia. Pero «volver a como estaba antes» suena a que hay un
único *antes*, y lo que hay es una lista donde eliges. El nombre nuevo lo dice.

---

## 42. Los papeles se ven, no se cuentan

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

De los tres montones por los que pasa un documento en RSC solo se veía un número: «Tienes 3
documentos sin leer», y ni forma de saber cuáles son.

Ahora se ven los tres, que son los tres estados del protocolo: `inbox/` (entregado, sin leer),
`inbox/_processed/` (ya leído) y `raw/` (el original, que no se borra nunca). Cada uno se abre con
el programa de siempre — un PDF con el lector de PDF — porque la barra no se pone a enseñar
documentos que no sabe pintar.

`raw/worklog/` se queda fuera: cuelga de `raw/` pero no es un papel que haya entregado nadie, es el
diario que el arnés se escribe solo, y se ve en el histórico.

**Lo que NO se ha hecho todavía: eliminar documentos.** Jose lo pidió y está pendiente de una
decisión suya, porque tiene trampa: borrar el fichero **no borra lo que el arnés aprendió de él**.
Un botón que solo borra el papel miente. O borra las dos cosas, o dice claramente cuál de las dos
hace.

Igual que *principios y constitución*: eso no existe en RSC. Lo más parecido son la sección
*Working rules* del `CLAUDE.md`, el objetivo y los límites del perfil, y el registro de decisiones.
Se puede montar, pero sería inventarlo juntando tres sitios, no enseñar algo que ya está.

---

## 43. Dos buscadores, y me equivoqué defendiendo uno

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Yo defendí uno solo con los resultados agrupados por tipo, con el argumento de que dos cajas obligan
a elegir cuál antes de saber qué buscas. Jose decidió dos, y su argumento es mejor: **que se sepa
por el nombre qué va a salir.**

Buscar un contrato firmado y buscar cómo se factura aquí son dos preguntas distintas. Mezclar las
respuestas no ahorra la elección: la aplaza, y encima obliga a leerlas todas para descartar la mitad.

- **Buscar un documento** (en Documentos) — nombres de fichero, los tres montones.
- **Buscar un concepto** (en Lo que sabe) — lo que ha entendido, lo que sabe hacer, los programas y
  el diario.

Cada caja vuelve a su propia pantalla al vaciarse. La caja sin nombre que había en la principal se
ha quitado: con dos buscadores con nombre, una tercera anónima devuelve justo la duda que estos dos
quitan.

---

## 44. Las reglas existían y no las veía nadie. Me equivoqué al decir que no

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Le dije a Jose que lo de «principios y constitución» no existía en RSC y que habría que inventarlo.
Él insistió — *«míralo bien porque creo que depende»* — y tenía razón.

**`02-DOCS/wiki/sdd/constitution.md` existe**, y no es un fichero cualquiera. El `CLAUDE.md` que
escribe el arnés lo pone en su mapa bajo el rótulo *Read first, always*, junto al perfil de usuario
**y nada más**. De todos los ficheros de una carpeta, esos dos son los que se leen antes de cada
cosa que se hace. Uno ya se veía en la barra desde la decisión 33; el otro no se veía en absoluto.

Tres sitios, y se enseñan los tres:

| Sitio | En pantalla |
|---|---|
| `02-DOCS/wiki/sdd/constitution.md` | Innegociables |
| `CLAUDE.md` § Working rules | Cómo se trabaja aquí |
| `AGENTS.md` § Working rules | Lo mismo, para lo que no es Claude |

La constitución solo aparece si el arnés se montó con SDD, y los otros dos van siempre, así que no
se exige ninguno: se enseña lo que haya. Se leen sus dos formatos —lista de guiones y prosa con
encabezados— porque con uno solo media pantalla sale vacía.

Y dos botones que es lo que le faltaba a esto para servir de algo: **Añadir una regla** y **Decirle
qué NO quiero que haga**.

**Efecto colateral que convenía arreglar:** `sdd/` pasa a contar como andamio de la wiki, con
`harness/` y `brand/`. Sin eso, a quien monte el arnés con SDD le saldría «Sdd» en la lista de lo
que el asistente sabe de su empresa, que no significa nada.

---

## 45. Con quién hablas se elige desde la barra

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Faltaba, y lo pidió Jose. El arnés ya sabía con cuál hablar —lo lee de `targets` en `.rsc.json`—
pero no había forma de cambiarlo ni de ver por qué con Codex algunas cosas van distinto.

La pantalla dice de cada uno si está en este ordenador y, lo que importa, **qué cambia**: con Claude
los botones le mandan el texto; con Codex abren su barra y lo dejan copiado, porque su extensión no
admite que se lo pasen (comprobado leyéndola, no adivinado).

Elegir escribe `targets` respetando el resto del fichero. **Lo que no hace, y la pantalla lo dice:**
no reinstala el arnés para el otro asistente. Las habilidades se quedan donde estaban.

---

## 46. "Ver las copias guardadas": un botón que da miedo no se pulsa

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Tercer nombre para el mismo botón. Era *Volver a como estaba antes*, lo cambié a *Volver a un punto
anterior* (decisión 41) y Jose señaló que seguía sonando a que al pulsarlo ya no hay marcha atrás.

Tiene razón, y el nombre era el problema entero: **ese botón no deshace nada**. Enseña una lista de
diez copias. Deshacer es lo que viene después, eligiendo una, y ni eso es irreversible.

Nombrar la lista en vez de la acción quita el miedo. Un botón que da miedo no se pulsa, y alguien
que no se atreve ni a mirar sus copias de seguridad no tiene copias de seguridad.

---

## 47. La cuenta de GitHub se ofrece al montar la carpeta

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Lo pidió Jose y es evidente en cuanto lo dice: la cuenta solo salía el día que alguien pulsaba
*Subir a GitHub*, que es **el peor momento posible**. Esa persona ya quiere guardar algo y se
encuentra con que antes le toca crearse una cuenta en un sitio del que no ha oído hablar.

Montar la carpeta es cuando se está montando todo, y es la única vez que alguien espera trámites.
Ahí se pregunta, con el motivo por delante —«si se rompe el portátil, lo recuperas»— y se puede
decir que más tarde: la carpeta funciona igual sin ello y el botón sigue en Histórico para siempre.

---

## 48. Quitar un documento: solo del que no ha aprendido nada todavía

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose preguntó qué haría yo. Esto, y el motivo es que **borrar el fichero no borra lo que el arnés
aprendió de él**. Si alguien entrega un contrato, el asistente saca de ahí las condiciones y las
escribe en un concepto, y después borramos el PDF: el papel desaparece y lo aprendido se queda. Un
botón que solo hace lo primero y se llama «eliminar» miente justo en lo que esa persona quería
evitar.

Así que se separa por estado, que es lo único honesto:

- **Sin leer todavía** — nadie ha sacado nada de él. Se borra, con una pregunta que lleva el nombre
  del documento dentro, porque un «¿seguro?» a secas no dice qué se va a perder. Es el caso
  frecuente de verdad: te equivocas de fichero al arrastrarlo.
- **Ya leído, o el original guardado** — aquí no borramos nosotros. Se le pide al asistente, que es
  el único que sabe qué conceptos salieron de ese papel y puede quitarlos con él. Además `raw/` es
  la prueba de lo que entró: el protocolo del arnés dice que no se borra, y hacerlo a sus espaldas
  le rompería la contabilidad de lo ingerido.

---

## 49. "Cómo quieres que trabaje": la personalización, junta y en su subapartado

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«hazlo, sí! pero igual todo eso si es tantas cosas debería ir en subapartado»*. Tiene razón:
cuatro cosas más sueltas en Ajustes lo convertían en el cajón del que veníamos huyendo.

Dentro van las cuatro que cambian el día a día:

**Qué puede hacer sin preguntarte.** Es el ajuste que más miedo da a alguien no técnico —«¿y si me
borra algo?»— y vivía en un fichero de configuración que no se enseña. Se escribe en
`.claude/settings.json` como `permissions.defaultMode`, con tres opciones dichas por lo que le pasa
a quien lo usa. El cuarto modo que existe —saltarse los permisos— **no se ofrece**: no es un ajuste,
es quitarle el freno de mano a alguien que no sabe que lo tiene. Y se escribe respetando el resto
del fichero, porque ahí viven los enganches del arnés y perderlos dejaría la carpeta a medias sin
que se note.

**Cada cuánto guarda solo.** No existía: guardar era siempre a mano, y quien no se acuerda de pulsar
el botón no tiene copias — que es exactamente el público de esto, alguien que está pensando en sus
facturas y no en su historial. Tres opciones, y por defecto sigue siendo a mano.

Las tres cosas que el guardado automático **no** hace, que son lo importante:

- **No toca el historial de otra persona.** La decisión 28 lo exigía para el primer guardado; aquí
  vale con más razón, porque no hay nadie mirando.
- **No guarda si no hay nada nuevo.** Una copia idéntica a la anterior es ruido en una lista que
  alguien tiene que poder leer.
- **No avisa.** Una barra que interrumpe cada hora para decir que todo va bien acaba cerrada.

**Para qué es esto, y los límites.** Se escriben el día que se monta la carpeta y no se vuelven a
ver nunca. Están en el perfil, que es lo que el asistente lee antes de contestar: si el objetivo ya
no es el de entonces, está trabajando para el de entonces.

**Cómo te habla**, que ya estaba, con un acceso desde aquí además del suyo.

### Un fallo que encontró la prueba

El reloj del guardado automático dejaba el proceso vivo para siempre: las pruebas se quedaban
colgadas al arrancar la extensión. Se arregla con `unref()`. En el editor daba igual —la ventana
sigue abierta de todos modos— pero es la clase de cosa que solo se ve cuando algo la ejercita.

---

## 50. Codex: lo que se ha podido adaptar, y lo que no se ha podido comprobar

**Fecha:** 18 de septiembre de 2026 · **Estado:** parcial, a propósito

Jose pidió revisar que todo esté bien adaptado para Codex. Lo que se ha hecho:

**Las reglas de quien lee.** `CLAUDE.md` y `AGENTS.md` llevan las mismas reglas por diseño del
arnés, así que se enseña una sola lista — pero la del asistente con el que se está hablando. Con
Codex, `CLAUDE.md` no lo lee nadie: enseñar sus reglas sería enseñar reglas que no se están
aplicando, que es peor que no enseñar ninguna.

**Lo que ya estaba bien:** la pantalla *Con quién hablas* dice qué cambia con cada uno, y lo dice
donde se lee en vez de en una nota al pie — con Codex los botones abren su barra y dejan el texto
copiado, porque su extensión no admite que se lo pasen (comprobado leyéndola el 17 de septiembre, no
adivinado). Y *Qué puede hacer sin preguntarte* avisa de que es cosa de Claude.

**Lo que NO se ha podido comprobar, y hay que decirlo:** tres sitios de la barra leen rutas de
Claude — los botones (`.claude/commands/`), las habilidades (`.claude/skills/`) y los permisos.
Si RSC, al montar un arnés para Codex, escribe esas cosas en otro sitio, en esa carpeta la barra
enseñaría cero botones y cero habilidades **sin dar ningún error**, que es la peor forma de fallar
que tiene este proyecto.

Para saberlo hay que leer el paquete de RSC, y el que está instalado en esta máquina es un enlace a
**otro proyecto de Jose** (`dashboard-formacion/rsc-harness`). Eso queda fuera del límite de ámbito,
así que no se ha mirado. Pendiente de que él lo autorice o lo confirme de memoria.

---

## 51. La marca de la empresa se construye con Material Design

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«haz que la marca sea con guidelines de material design. Es decir, adaptas los colores pero
que se vea bien»*. Y antes, con su barra delante: *«falta ajustar colores dark light y contrastes»*.

### Lo que estaba mal

Cada color se sacaba mezclando a mano, y cada caso raro había que arreglarlo por separado. Con su
marca de Nexus Consulting salían dos cosas feas a la vez:

- **Las tarjetas se hundían en la página.** Con fondo claro se acercaban al blanco, bien; con fondo
  oscuro se hacía lo simétrico —acercarlas al negro— y ahí lo simétrico es lo contrario de lo
  correcto: la página salía `#0d1117` y las tarjetas `#06080a`, más oscuras.
- **El texto apagado se comprobaba solo contra la página**, nunca contra las tarjetas.

### Qué se hace ahora

Una **paleta tonal** de Material 3: del color de marca se saca una escala de trece tonos del mismo
matiz, y cada sitio de la interfaz usa un tono fijo de esa escala. Como las distancias entre esos
tonos están elegidas para cumplir contraste, sale bien con cualquier marca sin ir corrigiendo color
por color.

Los tonos se calculan en OKLab, con la escala L\* de CIELAB para numerarlos, que es la que usa
Material. Cabe en cincuenta líneas y no trae ninguna dependencia.

**Una desviación de Material, y conviene saber cuál:** Material fija el fondo en el tono 98 en claro
y el 6 en oscuro, vengas de donde vengas. Aquí el fondo es **el que eligió la empresa**, y el resto
se coloca a las distancias de Material contando desde él. Con el suyo, el azul marino de Nexus salía
negro — cumpliría contraste y no sería la marca de nadie.

### Un fondo que no admite texto se descarta, y se dice

Un gris medio da 3,9:1 con blanco y 4,4:1 con negro. No hay letra que se lea encima; no es un fallo
del cálculo, es el color. Antes se descartaba en silencio y la barra se quedaba igual, que es lo que
hacía que «poner el tema» pareciera roto. Ahora se dice, y se dice qué hacer.

### El fallo que vio Jose en su captura

El nombre de su empresa salía casi negro sobre fondo azul marino. La causa: media docena de reglas
de `panel.css` pintaban con los colores **crudos** de la paleta de Executive Lab (`--tinta`,
`--papel`, `--rojo`) en vez de con los que tienen significado (`--texto-fuerte`, `--superficie`,
`--acento`). Ni el tema oscuro del editor ni la marca de nadie saben cambiar los crudos: solo saben
cambiar los otros.

Ahora ninguna regla nombra un color crudo, y hay una prueba que lo vigila — porque este fallo no da
ningún error, solo se ve.

### Y la marca manda también con tema oscuro

Antes se le cedía el fondo al editor salvo que la marca fuera oscura, para no dejar una isla color
crema dentro de un editor negro. Con la paleta de Material ese problema desaparece: sea clara u
oscura, la de la empresa es una paleta completa y coherente, no tres colores sueltos. El alto
contraste sigue fuera: quien lo usa lo necesita.

### La tipografía sí se cambia, de una lista corta

`marca.js` decía que no se tocaba nunca, por un motivo bueno: una tipografía ajena puede dejar la
barra ilegible. Jose quiere poder cambiarla, así que se cambia **de cuatro opciones** —la de
siempre, la del ordenador, una clásica y una fácil de leer— y ninguna se baja de la red, porque el
panel no pide nada fuera a propósito.

---

## 52. "Mi Empresa" pasa a "Mi trabajo", y "Dónde estás" a "Lo último"

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«lo de "Mi empresa" lo cambiamos a "Mi arnés"? porque al final esto es un arnés, no una
empresa»*. Tiene razón en el diagnóstico y el nombre que propone no vale: «arnés» es nuestra
palabra, no la suya, y la decisión 16 ya dijo que un arnés puede ser el departamento de marketing,
un proyecto o un equipo.

**«Mi trabajo»** vale para los cuatro casos, no es jerga, y no promete que esto sea una empresa
entera. El nombre que el alumno le puso sigue saliendo debajo, que es lo que de verdad identifica la
carpeta.

**«Dónde estás»** tampoco decía lo que hay: no es dónde estás, es **qué pasó lo último**. Se llama
así ahora.

Y de paso, el fallo que enseñaba esa misma captura: la brújula escribía «Tus programas (Odoo) · M 01
tools». Cualquier carpeta de primer nivel se convertía en una «zona» con su nombre humanizado, y un
nombre de carpeta cualquiera no le dice nada a nadie. Ahora solo son zonas las dos del arnés.

---

## 53. Un desplegable abierto, y solo uno, y solo al principio

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose preguntó si metería alguno abierto por defecto. Uno: **Documentos**, y solo en una carpeta
recién montada — sin nada aprendido y sin conexiones.

El motivo es que ahí lo primero que hay que hacer es darle documentos, y con todo plegado eso no se
ve. En cuanto la carpeta tiene algo, se pliega como los demás: a partir de ese momento lo que se usa
a diario ya está arriba y desplegado, y abrir uno por nuestra cuenta sería decidir por esa persona.

En cuanto alguien abre o cierra cualquiera, manda lo suyo y esto no vuelve a actuar.

---

## 54. Acciones rápidas: lo de arriba lo elige quien usa la barra

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Lo más alto de la barra lo ocupaban las consultas de cada programa, desplegadas. Jose: *«no son ni
comandos, ni skills, ni acciones… creo que casi que molestan»*. Tenía razón: son los scripts que RSC
mete dentro de cada herramienta, así que su sitio es la herramienta, no la portada.

Pero el hueco que dejaban es el mejor de la pantalla. Y lo que esa persona use de verdad **no lo
sabemos nosotros**, así que lo elige ella: hasta **cinco**, de entre las tres cosas que esta carpeta
tenga —sus botones, las consultas de sus programas y sus habilidades.

Sin elegir nada, arriba salen los botones que el asistente ha ido creando, que es lo que hacía la
barra antes. Es un default, no una elección: por eso ninguno sale marcado con la estrella.

Cinco y no más: con más deja de ser «lo de siempre» y vuelve a ser una lista que hay que leer, que
es justo lo que se venía a quitar. Se guarda por carpeta y no en el arnés — es de esta persona y de
esta máquina, no una decisión del proyecto que deba viajar en las copias.

Y de paso, el fallo que señaló: al volver de una consulta aterrizabas en la pantalla de las claves
del programa, que es lo último que quiere ver quien acaba de mirar sus facturas.

---

## 55. El modo sencillo se pone la cara de la empresa, no la nuestra

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, con su carpeta de Nexus Consulting: *«he vuelto al modo sencillo y me carga los putos colores
de executivelab»*.

Y era literal. El disfraz traía dos cosas escritas a fuego:

- `"workbench.colorTheme": "Default Light Modern"` — un tema **claro**, fijo. Su marca es azul
  marino, así que el modo sencillo le encendía un editor blanco detrás de una barra oscura.
- `"window.title": "Mi Empresa — Executive Lab"` — nuestro nombre en la ventana de su empresa.

La barra ya se pintaba con su marca desde hacía tres versiones. Lo que faltaba es que **el resto de
la ventana hiciera lo mismo**, porque si no la barra es una isla de su empresa dentro de una ventana
de la nuestra.

Ahora el disfraz lee la marca y, si la hay, pone el tema del lado que sea, el rótulo con el nombre
que ella le dio, y `workbench.colorCustomizations` con sus colores en la barra lateral, la de
actividad, la de estado y el título. Sin marca, se queda lo de siempre.

---

## 56. Tres arreglos que salieron de mirar la barra

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

**Los números no decían de qué eran.** Al lado de *Lo que sabe* un «4» eran conceptos; al lado de
*Acciones*, un «1» eran programas. El mismo sitio, dos significados, y ninguno de los dos era «lo
que hay dentro de esta fila», que es lo que parecía. Ahora llevan su palabra: «4 conceptos», «1
programa».

**El «Volver» estaba al final de cada pantalla.** En una barra estrecha el final está a dos
pantallazos, así que salir de un sitio costaba más que entrar. Sube arriba en las veintiuna
pantallas, y va pequeño porque justo debajo está el rótulo que dice dónde estás.

**Los documentos se abren dentro del editor**, al lado, siempre que sepa enseñarlos —texto,
markdown compuesto, imágenes—. Sacar a alguien a otro programa para leer tres líneas rompe lo único
que este proyecto intenta, que es que todo pase en un sitio. Un PDF, un Word o una hoja de cálculo
siguen abriéndose con su programa, porque enseñarlos como texto sería enseñar basura.

**Y los tres tipos de documento dejan de llamarse parecido.** Jose: *«llevarte un archivo y ver
documentos puede dar confusión porque no son los mismos documentos»*. Estaban nombrados por el verbo;
ahora por de quién son: **Darle documentos** (entra) · **Lo que le has dado** (su archivo) · **Lo
que ha hecho** (sale).

---

## 57. Dos variables que no existían, y por eso los botones salían marrones

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, con la barra de Nexus Consulting a medio pintar: *«sigue sin cargar bien algunas cosas de la
marca. Botones marrones y rojos»*.

Tres causas, y la tercera es la que da miedo:

1. **Colores escritos a fuego en las reglas.** El halo del botón principal era
   `rgba(236, 68, 41, .28)` — el rojo de Executive Lab, debajo de un botón cian. Lo resaltado al
   buscar, `#ffe9c7`, una mancha crema sobre fondo oscuro. El borde del aviso, `#2e7d32`.
2. **Tokens que la marca no calculaba.** Aunque las reglas usaran nombres con significado, si la
   marca no ponía ese color, la regla se quedaba con el de Executive Lab.
3. **Dos variables que NO se declaraban en ninguna parte:** `--el-acento` y `--el-borde`. Trece
   reglas las usaban con valor de reserva, así que **siempre** pintaban la reserva: `#d84315`, un
   marrón que no es de ninguna marca, y unos bordes negros translúcidos que sobre fondo oscuro no se
   ven. Nadie las declaró nunca; llevaban ahí desde que se escribieron esas pantallas.

La tercera es la que enseña el problema de fondo: **nada avisaba**. Una variable inexistente en CSS
no da error, se traga el valor de reserva y sigue. Por eso ahora hay dos pruebas:

- ninguna regla lleva un color literal (salvo un negro puro de sombra, que no es un color) ni usa
  una variable que nadie declara;
- y la marca **calcula todos** los colores que las reglas piden — si mañana alguien añade una regla
  con un color nuevo, la prueba lo dice antes de que salga un botón rojo en una empresa cian.

El verde de «bien» y el rojo de «mal» se quedan: un aviso tiene que parecer un aviso aunque la
empresa sea verde lima. Pero se llevan al tono que se ve sobre **su** fondo, en vez de quedarse en
verde oscuro sobre azul marino.

---

## 58. El tema lo hace el asistente; la barra recoge el material

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

La primera versión de `tema.js` tenía selectores de color dentro de la barra. Jose lo corrigió:
*«la idea es que lo haga el agente de IA. La cuestión es qué material le pasas»*.

Y tiene razón: elegir tres colores que peguen entre sí no es algo que se le pueda pedir a alguien que
no sabe lo que es un color de acento. El asistente sí sabe mirar una web y sacarlos.

Así que la pantalla *El tema de mi empresa* es una puerta de entrada de material, no un editor:

- **la web**, como hasta ahora;
- **subirle el logotipo, su manual de marca, una captura de su página** — o arrastrarlo encima, que
  en esa pantalla cae en `02-DOCS/wiki/brand/` y no en la bandeja de documentos;
- o **contárselo con palabras**, para quien no tenga ni web ni logotipo a mano, que son muchas.

Todo se le pasa con el contrato de campos que ya estaba escrito, y se le dice qué material hay para
mirar. Lo que **no** es suyo sino nuestro: que lo que elija se pueda leer. De eso se encarga la
escala tonal, y por eso aquí no se valida ningún color — se valida al pintar, y si no cumple se
descarta diciendo por qué.

*Volver a la cara de siempre* borra el récord y **deja el material**: lo dio esa persona y no es
nuestro para borrarlo.

Y una aclaración que conviene dejar escrita, porque se prestaba a confusión: lo de Material Design
nunca fue un estilo. Jose: *«a la hora de aplicar el diseño de marca quiero que se cumpla, que no
haya contrastes raros, que no se ponga un color claro sobre un color claro»*. Eso es exactamente lo
que hace la escala tonal, y lo comprueban dos pruebas con seis marcas distintas.

---

## 59. Una prueba en un VS Code de verdad

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Todo lo demás usa dobles: un `vscode` de mentira y un navegador de mentira. Cogen mucho, y hay una
clase de fallo que no pueden coger por definición — que el editor de verdad no haga lo que el doble
dice que hace.

`npm run probar-en-vscode` arranca un VS Code de verdad, le abre una empresa de mentira y ejecuta
todos los comandos de la barra, uno a uno. No mira cómo se ve: de eso se encargan las comprobaciones
de contraste, que pueden calcularlo sin pintar nada.

**Lo que encontró nada más funcionar**, y es justo lo que se buscaba:

- Tres comandos se quedaban esperando una respuesta que nadie iba a dar. Hacen bien en preguntar
  —cambian el aspecto de **todas** las ventanas— pero ahora está escrito cuáles son.
- Y algo que yo daba por sentado: **`markdown.showPreviewToSide` puede no estar registrado**. Lo
  trae una extensión de serie que el editor no despierta hasta que hace falta, así que comprobar si
  el comando existe no dice nada. El respaldo que ya tenía la barra resultó no ser una precaución
  teórica.

Tres cosas del montaje que costaron más que la prueba, y quedan escritas para el siguiente:

- Hay entornos que traen `ELECTRON_RUN_AS_NODE` puesto. Con eso, el binario de VS Code se comporta
  como un Node pelado y rechaza todos sus propios argumentos, con un error que no se parece en nada
  a la causa.
- La carpeta de datos no puede estar dentro del proyecto: VS Code abre ahí un socket y el sistema no
  admite rutas de más de 103 caracteres.
- La carpeta de trabajo se pasa como `--folder-uri`; suelta, el proceso de pruebas se la queda como
  si fuera su punto de entrada.

No va dentro de `probar` porque tarda y pide red: la primera vez se descarga un VS Code de 300 MB.

---

## 60. "En qué estamos": las specs de SDD, y solo donde las haya

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«lo de sdd hazlo pero que no salga si no hay nada. Seguramente los alumnos sí la usen porque
en la clase 2 vamos a montar una web con sdd»*.

RSC escribe bajo `02-DOCS/wiki/sdd/` todo lo que se acuerda antes de construir algo, y la barra no
enseñaba nada salvo la constitución:

| Fichero | En pantalla |
|---|---|
| `proposals/` | Antes de empezar |
| `specs/` | Qué queremos |
| `plans/` | Cómo se va a hacer |

Lo que hace esto valioso para quien no es técnico: **una spec no es un documento técnico**. El
propio protocolo lo dice — *«what & why, no how»*. Es literalmente lo que cualquiera querría leer
para saber en qué anda su proyecto.

**Aparece solo si esa carpeta lo tiene.** Un arnés de contabilidad no tendrá specs nunca; uno donde
se monte una web, sí. Es la misma regla que el resto de la barra: nada está predefinido.

Dos detalles de honestidad:

- Las tareas se cuentan de la tabla del plan (`T001`, `T002`…), pero **no se dice cuántas van
  hechas**: esa tabla no lleva marca de hecho o pendiente, y un progreso inventado es peor que
  ningún progreso.
- El estado (`draft`, `accepted`) se traduce, pero si el fichero no lo trae no se rellena.

---

## 61. Tercera excepción del diccionario: tools, skills y comandos

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose: *«"Tus programas" cámbialo por "Conexiones (tools)". Y todo lo que sabe hacer, si son skills
pon (skills)»*. Y después, *«ídem con comandos»*.

El motivo es el mismo que el de git y GitHub, y esta vez con más razón: **en clase se explican con
esas palabras**. El alumno va a oír «skill» en la segunda sesión y va a leerla en cualquier tutorial
y en la documentación de RSC. Que la barra la llame solo «habilidad» le deja sin poder atar una cosa
con otra justo cuando está aprendiendo las dos a la vez.

El paréntesis es la forma de tener las dos cosas: manda la palabra en cristiano y detrás va la que
va a oír fuera. No al revés.

---

## 62. Lo que NO se ha hecho, y por qué

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

**La puntuación de los conceptos (`wiki/scores.json`), no.** Yo la propuse como «fichas a medias» y
me equivoqué dos veces: llamándolas fichas —una tercera palabra para los conceptos, justo lo que
este diccionario existe para evitar— y sobre todo en lo que mide. La fórmula es:

```
puntuación = enlaces_entrantes×2 + veces_consultada×0,5 + frescura − 5_si_está_huérfana
```

No mide si un concepto está completo ni bien escrito: mide **si está enlazado y si es reciente**. En
una carpeta joven casi todo está huérfano, así que la pantalla diría «todo está mal» y no serviría
para nada. Si algún día se enseñara, su sitio sería junto a *Preguntas sin contestar*, que es lo que
apuntó Jose — pero no es lo mismo: los huecos son cosas que el asistente sabe que no sabe, y la
puntuación es un número sobre lo que ya escribió.

**El repaso del arnés (`rsc audit`), tampoco.** Se ejecutó aquí para decidirlo con datos: tarda
cinco segundos y contesta *«8 skills installed — nothing to flag»*. Un botón para eso enseñaría
«todo bien» casi siempre.

Lo que sí queda pendiente de ese aviso es la **versión de RSC** (2.0.4 frente a la 1.4.1 que se fija
a propósito), que nadie ve y sería una línea en *Qué falta por montar*.

---

## 63. Un logotipo se ve siempre: el nuestro se tiñe, el ajeno lleva plaquita

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose, con la captura: el nombre de Executive Lab en negro sobre fondo negro. Y después, la regla
general: *«con todos los logos tiene que ser así. O pon un fondo o algo pero tiene que quedar bien»*.

Son dos problemas distintos con dos soluciones distintas:

**El nuestro se tiñe.** Va escrito en negro y como imagen no hay forma de repintarlo desde la hoja de
estilo. Así que el dibujo se mete dentro de la página y sus dos colores pasan a ser los de la barra:
el nombre toma el color del texto —blanco en oscuro, negro en claro— y el asterisco el del acento.

**El de una empresa no se toca.** Es su marca; teñirlo sería cambiársela. Lo que se hace es lo que
haría cualquiera al meter una marca ajena en un fondo que no es el suyo: ponerle una plaquita
detrás. Y solo cuando hace falta:

| El logotipo | Qué se hace |
|---|---|
| Es un SVG y alguno de sus colores se distingue del fondo | Nada. Es el caso de la ene de Nexus sobre su azul marino |
| Es un SVG y ninguno se distingue | Plaquita, del lado contrario al logotipo: clara si es oscuro, oscura si es claro |
| No se puede medir (PNG, JPG) | Plaquita solo sobre fondo oscuro |

Ese último caso es una apuesta y conviene saberlo: un logotipo se diseña para papel y para webs
blancas, así que sobre oscuro es donde desaparece y sobre claro casi siempre se ve. Es la que falla
menos, no la que nunca falla. Medir un PNG exigiría descodificarlo, y eso es traer una biblioteca
para una pregunta que tiene una salida razonable sin ella.

**Y el color de la plaquita es un token más**, no un blanco escrito a fuego — lo cazó la prueba de
la decisión 57 en cuanto lo escribí así.

---

## 64. El fallo que nadie podía coger: la página del panel no la probaba nadie

**Fecha:** 18 de septiembre de 2026 · **Estado:** decidido

Jose abrió la barra y vio: *«An error occurred while loading view: executiveLab.panel»*. Sin traza,
sin nada.

La causa era una palabra: llamé a `nuestroLogo(medios)` sin `this.` en un método de clase. Un
`ReferenceError` en cuanto se arma la página.

**Lo que importa no es el fallo, es que 113 comprobaciones no lo cogieron.** Había un agujero con la
forma exacta de este fallo:

- `panel-falso.js` prueba el lado del navegador — las pantallas, los mensajes.
- `humo.js` prueba los módulos — lo que leen del disco, lo que devuelven.
- Y **entre los dos** está `html()`, la función que junta la hoja de estilo, los colores de la marca
  y la cabecera. No la miraba nadie.

Es el peor sitio donde tener un agujero, porque cuando esa función falla **no falla una pantalla:
no carga la barra entera**, y el editor solo dice que algo ha ido mal.

Ahora se arma la página con las cuatro cabeceras posibles —la nuestra teñida, el logotipo de la
empresa, el símbolo con el nombre al lado, y solo el nombre— y se comprueba que cada una produce una
página con su seguridad y su guion. La prueba se validó del único modo que vale: volviendo a meter
el fallo y viendo que salta.
