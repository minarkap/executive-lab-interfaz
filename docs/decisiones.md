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

**Fecha:** 17 de septiembre de 2026 · **Estado:** decidido

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
