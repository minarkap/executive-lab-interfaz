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
