# El disfraz

Los ajustes que hacen que VS Code deje de parecer VS Code viven en
[extension/media/disfraz.json](../extension/media/disfraz.json). **Los aplica la extensión** en su
primer arranque, por la API de configuración, sobre los ajustes de usuario. Y un botón los quita
(*modo avanzado*) o los vuelve a poner (*modo sencillo*).

Esta carpeta solo genera un `.code-profile` para probar el disfraz **a mano** en una máquina de
desarrollo:

```bash
node construir-perfil.js      # → executive-lab.code-profile
```

Paleta de comandos → *Profiles: Import Profile…* → elegir el fichero.

## Por qué no lo aplica el instalador con un perfil

Fue la primera idea y se descartó al auditar. Tres razones, cada una suficiente:

1. **No hay forma de importar un `.code-profile` sin interfaz.** VS Code no tiene una orden de línea
   de comandos para ello, y su formato interno ha cambiado entre versiones.
2. **`code --install-extension` instala en el perfil por defecto.** Un perfil nuevo creado con
   `--profile` arranca vacío: el alumno abriría el editor sin Claude y sin nuestra barra.
3. **Hay ajustes de ámbito de aplicación** (`update.mode`, `security.workspace.trust.enabled`,
   `telemetry.telemetryLevel`) que un perfil ni un workspace pueden fijar.

La API de configuración escribe cualquier ámbito en los ajustes de usuario, funciona igual en Windows y
macOS, y además **nos dice qué claves no existen**: si una clave no la ha registrado nadie, VS Code la
rechaza y la extensión lo anota en su canal de salida. Es el comprobador de las claves dudosas que
antes había que hacer a mano.

## Qué hace cada bloque

**Identidad.** `window.title` pone *Mi Empresa — Executive Lab* en la barra de la ventana. Se quitan el
centro de comandos y la barra de menús. `window.zoomLevel: 1` agranda todo un punto, también el panel
de Claude: el público de este proyecto no tiene la vista de un programador de 25 años.

**Quitar superficie.** Barra de actividad, barra de estado, pestañas, control de disposición y editor de
bienvenida. Solo quedan dos zonas: nuestra barra a la izquierda y el chat de Claude a la derecha.

**Quitar ruido de programador.** Minimapa, números de línea, migas de pan, panel de problemas y la
terminal al arrancar.

**Quitar interrupciones.** El prompt de confianza del workspace es el peor: aparece antes de que hayan
hecho nada y pregunta si confían en los autores de unos ficheros que acaban de crear ellos mismos.
También recomendaciones de extensiones, avisos de actualización y notas de versión.

**Quitar git de la vista.** Sigue funcionando por debajo; deja de verse.

**Claude Code.** `useTerminal: false` da el chat gráfico. `hideOnboarding` quita la lista "Learn Claude
Code", escrita para programadores.

**Esconder ficheros.** Aunque no haya explorador, `files.exclude` gobierna el buscador y el "ir a
fichero".

## Claves por verificar

Tres que hay que confirmar contra la versión que fijemos. Ahora basta con mirar el canal de salida
*Executive Lab* tras el primer arranque: si una no existe, ahí lo dice.

- `workbench.secondarySideBar.defaultVisibility`
- `claudeCode.hideOnboarding` (deducida del texto de la documentación)
- `problems.visibility`

**Focus view no está aquí.** Es el ajuste que más importa y la documentación no da clave para él: se
activa desde el menú, con `Ctrl+Alt+F` / `Ctrl+Option+F` o desde la paleta, y persiste. Pregunta 2 de
[docs/spike.md](../docs/spike.md).
