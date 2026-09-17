# Fase 0 — Spike de riesgo

Preguntas que pueden cambiar el plan. **Se responden antes de construir encima**, porque las
respuestas mueven semanas de trabajo. Una línea por pregunta: sí/no y la prueba que lo demuestra.

Estado: ⬜ sin responder · ✅ sí · ❌ no · ⚠️ sí con condiciones

Dos ya no hacen falta, y se dice por qué al final.

---

## 1. ✅ ¿Puede nuestra extensión meter un prompt en el panel de Claude?

**Por qué importa:** es lo que convierte los botones en botones. Si no se puede, "Seguir donde lo
dejé" deja de ejecutar algo y pasa a ser un cartel que dice "escribe esto", que es justo la fricción
que queremos matar.

**Cómo se comprueba:** con las dos extensiones instaladas, paleta de comandos →
**Executive Lab: Qué comandos de Claude hay disponibles**. El canal de salida lista todo lo que la
extensión de Claude expone y dice qué puente ha elegido. No hace falta leer código.

**Plan B si es que no** (ya implementado): el comando documentado *Claude Code: Focus input* existe. El
botón deja el texto en el portapapeles, enfoca la caja de Claude y muestra un "pega aquí" de un solo
paso. Peor, pero viable, y es lo que hace hoy.

**Respuesta (17-09-2026):** Sí, por dos vías no documentadas, comprobadas en el código de la extensión 2.1.273: `claude-vscode.editor.open(sessionId, initialPrompt, …)` acepta el texto como segundo argumento, y la extensión registra el enlace `vscode://anthropic.claude-code/open?prompt=…` (parámetros `session` y `prompt`). Ningún comando documentado acepta texto. El puente usa el primero, cae al segundo y al portapapeles al final. El comando real de foco es `claude-vscode.focus` (el que yo había supuesto no existía; corregido). Falta verlo en pantalla: demo en `.demo/`.

---

## 2. ✅ ¿Focus view se puede activar por defecto?

**Por qué importa:** Focus view *"hides tool calls, tool results, and thinking behind expandable rows"*.
Es la diferencia entre una pantalla que un no técnico entiende y una que le asusta. La documentación
dice que se activa desde el menú, con atajo o desde la paleta, y que **persiste entre sesiones** —
pero no dice si hay una clave de ajuste que podamos escribir.

**Cómo se comprueba:** activarlo a mano, cerrar VS Code y mirar qué cambió en el almacenamiento de la
extensión de Claude. Si es una clave de ajuste, va a `extension/media/disfraz.json` y listo. Si es
estado interno, hay que activarlo en el primer arranque desde nuestra extensión (si hay comando) o
dejarlo en el vídeo de bienvenida como único paso manual.

**Respuesta (17-09-2026):** Es un ajuste: `claudeCode.focusView` (boolean, por defecto `false`), declarado en `contributes.configuration` de la 2.1.273. Ya está en `extension/media/disfraz.json`. De paso quedan confirmadas `claudeCode.hideOnboarding`, `useTerminal`, `disableLoginPrompt` y `preferredLocation` (`sidebar` | `panel`).

---

> **Las preguntas 3, 4 y 6 se comprueban solas.** Copia `instalador/windows/` con el `.exe` a la
> máquina de pruebas y ejecuta `powershell -ExecutionPolicy Bypass -File probar.ps1`. Detalle y dónde
> conseguir un Windows: [instalador/windows/COMO-PROBARLO.md](../instalador/windows/COMO-PROBARLO.md).

## 3. ⚠️ ¿`rsc onboard` no interactivo corre limpio en Windows sobre carpeta vacía?

**Por qué importa:** es el paso central de `preparar.js`. Si falla ahí, el alumno se queda con una
carpeta a medias y sin forma de saberlo.

**Cómo se comprueba**, en una VM de Windows limpia, con el Node portable y MinGit del instalador:

```bat
node harness\node_modules\@ericrisco\rsc\scripts\rsc.js onboard --technical-level non-technical ^
  --accompaniment L3 --project-kind operations --goal "organizar mis facturas" --target claude
```

Imprime `Plan id: <sha>` y una línea `Accept exactly this plan: …`. Se ejecuta esa misma línea (con
nuestra invocación en vez de `npx`) y tiene que terminar en `RSC_ONBOARDING_READY`, con `.rsc.json`,
`01-TOOLS/_TEMPLATE/` y `02-DOCS/wiki/harness/` creados.

**Ya sabemos** (probado en macOS el 17 de septiembre): los valores válidos son
`--project-kind software|operations|research|content|mixed`, el formato de la huella y de la línea de
aceptación son los que espera `preparar.js`, y `RSC_ONBOARDING_READY` sale al final. Lo que falta es
Windows: RSC usa symlinks y cae a copias reales cuando el sistema no los admite, y hubo bugs de hooks
en Windows arreglados en septiembre de 2026.

**Respuesta (17-09-2026):** En macOS, sí: `preparar.js` de punta a punta con el arnés preinstalado (sin `npx`) termina en `RSC_ONBOARDING_READY` en 0,6 s, con los diales `non-technical` + `L3` + `operations`, los raíles puestos y RSC añadiendo sus ignores al `.gitignore` al haber git. **Windows sigue pendiente**: symlinks → copias, y los hooks arreglados en septiembre.

---

## 4. ⚠️ ¿Node portable, MinGit y el arnés funcionan desde `%LOCALAPPDATA%` sin administrador?

**Por qué importa:** si hace falta administrador, perdemos a todo el que tenga el portátil gestionado
por el IT de su empresa — que en pyme es más gente de la que parece.

**Cómo se comprueba:** con una cuenta **sin** privilegios, descomprimir en
`%LOCALAPPDATA%\ExecutiveLab\` el zip de Node en `runtime\`, MinGit en `git\` y hacer
`npm install --prefix harness @ericrisco/rsc@1.4.1`. Después:

- `runtime\node.exe -v`
- `git\cmd\git.exe --version`
- **`git\usr\bin\bash.exe --version`** — los `test_connection.sh` de RSC piden bash. MinGit debería
  traerlo; hay que confirmarlo con el zip concreto.
- Un `rsc onboard` real (pregunta 3).

**Respuesta (17-09-2026):** La carga está montada (455 MB): Node 24.21 portable, MinGit 2.55, arnés 1.4.1 preinstalado, `.vsix`, icono y el instalador de VS Code. **MinGit no trae `bash.exe`**, pero su `usr/bin/sh.exe` es GNU bash (comprobado en el binario): la extensión lo usa como último candidato. Tampoco trae `curl`; Windows 10+ lo lleva de serie. **El `.exe` ya está compilado** (`instalador/windows/Output/ExecutiveLab-Setup.exe`, 291 MB, con Inno bajo Wine desde el Mac). **Sin administrador sigue pendiente**: hay que ejecutarlo en Windows.

---

## 5. ⬜ ¿Qué hace SmartScreen con nuestro `.exe` sin firmar?

**Por qué importa:** "Windows protegió tu PC" con un botón *No ejecutar* bien visible y el *Más
información → Ejecutar de todas formas* escondido. Ahí se pierde media clase, y es el primer minuto
del curso.

**Cómo se comprueba:** compilar el instalador, subirlo a un sitio real, descargarlo con Edge en una VM
limpia y **grabar la pantalla**. Lo que veamos es lo que verá el alumno.

**Respuesta:**

---

## 6. ⬜ ¿Los hooks del arnés encuentran `node` desde el editor?

**Por qué importa:** `.claude/settings.json` lanza `node .claude/rsc-bootstrap.mjs` por nombre en cada
arranque de sesión, y el alumno no tiene Node en el sistema. El instalador añade
`%LOCALAPPDATA%\ExecutiveLab\runtime` al PATH del usuario y avisa al sistema; si el editor no lo ve,
cada sesión arranca con un error de hook delante del alumno.

**Cómo se comprueba:** tras instalar, abrir el acceso directo y mirar si Claude muestra algún aviso de
hook. Y desde la paleta, *Executive Lab: Algo va mal*: el informe dice qué `node` y qué `git` ha
encontrado.

**Respuesta:**

---

## En paralelo, y gratis

Probar la **app de escritorio de Claude Code** con un alumno de perfil puramente operativo. Lee el
mismo `.claude/`, las mismas habilidades y los mismos hooks, así que el arnés RSC funciona igual, y
trae menos ruido en pantalla que VS Code. Si a ese perfil le basta, nos ahorramos el disfraz entero
para media clase.

**Lo que hay que mirar:** que el selector de carpeta del primer arranque no sea una pared, y que la
terminal integrada (menú *Views*, o `Ctrl+\``) no aparezca sola.

**Respuesta:**

---

## Ya no hacen falta

- **¿Se puede importar el `.code-profile` sin interfaz?** No, y da igual: el disfraz lo aplica la
  extensión por la API de configuración (decisión 5 en `decisiones.md`).
- **¿Existen las claves dudosas del disfraz?** Lo dice la propia extensión: las que VS Code rechaza
  quedan anotadas en el canal de salida *Executive Lab* tras el primer arranque.
