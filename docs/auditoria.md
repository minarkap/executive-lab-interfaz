# Auditoría — 17 de septiembre de 2026

Revisión completa del prototipo, desde las decisiones de arquitectura hasta cada fichero. Método: se
instaló RSC 1.4.1 en este mismo repo en modo desarrollador y se contrastó **cada suposición** contra
lo que el CLI acepta, lo que escribe en disco y lo que hay en el código del paquete. Lo que no cuadró
se corrigió aquí mismo; lo que no se pudo corregir sin una máquina limpia queda abierto y dicho.

**Resultado en una línea:** las decisiones de fondo se sostienen; la implementación tenía siete
defectos que la habrían tumbado en Windows (la plataforma mayoritaria) en el primer uso, y dos
decisiones del plan original no sobrevivieron al contacto con la realidad. Todo eso está corregido y
verificado en la medida en que un Mac permite verificarlo.

---

## Las decisiones de arquitectura

| # | Decisión | Veredicto |
|---|---|---|
| 1 | Motor = Claude Code oficial, interactivo, en VS Code. Nada de cliente propio | **Se sostiene.** Recontrastado con las tres fuentes: el artículo de soporte separa los usos en dos cubos y solo el interactivo en IDE queda fuera del crédito del SDK; la doc del SDK prohíbe ofrecer login de claude.ai a terceros sin aprobación; la extensión oficial es una GUI nativa con Focus view y login sin clave de API. El riesgo residual (la política del crédito quedó pausada en junio y puede volver) es justamente la razón de la decisión |
| 2 | La brújula se deriva del disco, no de la conversación | **Se sostiene**, y ahora con el formato real de `rsc memory resume` (líneas `clave: valor`; `files:` traducido a zonas del diccionario, nunca rutas) |
| 3 | Vocabulario cerrado | **Se sostiene.** El comprobador automático pilló dos incumplimientos reales en la primera pasada |
| 4 | Instalación por usuario, sin administrador | **Se sostiene** y se amplía: no solo sin admin, sino sin depender de nada del sistema (ver 6) |
| 5 | El disfraz vía perfil `.code-profile` importado por el instalador | **Cayó.** No se puede importar sin interfaz; `code --install-extension` va al perfil por defecto; hay ajustes de ámbito de aplicación. Ahora lo aplica la extensión por la API de configuración |
| 6 | `npx @ericrisco/rsc@X` en tiempo de uso | **Cayó.** Node rechaza lanzar `.cmd` sin shell; Windows limpio no tiene git ni bash; los hooks de RSC llaman a `node` por nombre. Ahora el instalador lleva Node, MinGit y el arnés dentro y los pone en el PATH |

Las dos que cayeron están razonadas en [decisiones.md](decisiones.md) (§5 y §6).

---

## Hallazgos

Severidad: **crítico** = el alumno no puede usar el producto · **alto** = funciona mal en un caso
habitual · **medio** = calidad, mantenimiento o afirmación falsa · **abierto** = no se pudo cerrar
desde un Mac.

### Críticos — todos corregidos

| | Dónde | Qué pasaba | Qué se hizo |
|---|---|---|---|
| C1 | `preparar.js`, `spike.md` | `--project-kind ops` no existe. RSC acepta `software\|operations\|research\|content\|mixed`. El instalador habría fallado en el primer paso | `operations` |
| C2 | `procesos.js`, `preparar.js` | `spawn('npx.cmd')` y `spawnSync('code.cmd')` sin shell. Node ≥ 18.20 / 20.12 lo rechaza con `EINVAL`. Habría roto cada botón de la barra y la instalación entera, en Windows | Nuevo `entorno.js` localiza ejecutables de verdad; `procesos.delPath` pasa por `cmd.exe /d /s /c` con la línea citada cuando no hay otra |
| C3 | `preparar.js`, `guardar.js` | Un Windows limpio no tiene git. Y aunque lo tuviera, sin identidad configurada `commit` falla | MinGit en el instalador; `prepararHistorial` falla en alto si no hay git; `asegurarIdentidad()` antes de cada copia |
| C4 | `.iss`, `perfil/` | El acceso directo abría con `--profile "Executive Lab"`: un perfil **vacío**, sin Claude ni nuestra barra, y sin los ajustes (nadie los importaba) | Sin perfil. `disfraz.js` aplica `media/disfraz.json` en el primer arranque; comandos *modo avanzado* / *modo sencillo* |
| C5 | `.iss`, `postinstall` | `.claude/settings.json` de RSC lanza `node …/rsc-bootstrap.mjs` por nombre. Sin Node en el PATH del usuario, cada sesión arranca con errores de hook delante del alumno | Inno escribe `runtime` y `git\cmd` en el PATH de usuario (`ChangesEnvironment=yes`) y `EXECUTIVE_LAB_HOME`; macOS enlaza en `/usr/local/bin` |
| C6 | `conexiones.js` | Leía un `.env` en la raíz. RSC guarda credenciales **por proveedor** en `01-TOOLS/<id>/.env`, con las claves esperadas en `.env.example`, y su `test_connection.sh` exige **bash** | Reescrito: lista de proveedores con claves que faltan, formulario por proveedor desde `.env.example`, escritura con `chmod 600`, prueba con bash, enlace "¿dónde consigo la clave?" desde `CREDENTIALS.md` |
| C7 | `skills/aplicar.js`, `perfil-de-usuario.md`, `SKILL.md` | RSC **siempre** crea `user-profile.md` en el onboarding, y `aplicar.js` lo saltaba si existía: los diales nunca se habrían aplicado a un alumno real. Además usaba `accompaniment_level`; RSC escribe `accompaniment` en frontmatter | Ajusta los diales dentro del frontmatter real, respeta el objetivo, marca con `executive_lab_rails` y no vuelve a tocarlos sin `--forzar` (el alumno puede haber bajado el dial a propósito) |

### Altos — todos corregidos

| | Dónde | Qué pasaba | Qué se hizo |
|---|---|---|---|
| A1 | `rsc.js`, `brujula.js` | `memory resume` sin sesión devuelve `(no local continuation for this branch/worktree)` **con código 0**: la brújula lo habría enseñado en inglés como "dónde estás" | Se filtra; la continuación real se interpreta por campos y las rutas se traducen a zonas |
| A2 | `guardar.js` | `git restore --source` no quita lo creado después de la copia: "volver a como estaba" no era verdad | `read-tree -m -u --reset` tras una copia previa, y la vuelta atrás queda registrada como copia: también se puede deshacer |
| A3 | `extension.js` | El disfraz se habría aplicado sobre el VS Code real de quien desarrolla (barra de actividad, menú, zoom…) | No se aplica en `ExtensionMode.Development`; ahí se pone a mano |
| A4 | `.iss` | Constante `array[0..5] of String` en Pascal Script, que no la admite: no habría compilado | Función `Objetivo(i)` con `case` |
| A5 | `.iss`, `preparar.js` | Inno crea los accesos directos **antes** del `[Run]`, y cada lado adivinaba la carpeta de Documentos por su cuenta | Ya corregido en la primera pasada: `--destino` explícito |
| A6 | `preparar.js` | `code` no está en el PATH del proceso recién instalado VS Code | Ruta completa (`…\Microsoft VS Code\bin\code.cmd`, `…/app/bin/code`) |

### Medios — corregidos

| | Dónde | Qué pasaba | Qué se hizo |
|---|---|---|---|
| M1 | `puente.js` | Caché de comandos llenada una vez: si Claude aún no estaba activa, quedaba vacía para siempre | Sin caché |
| M2 | `guardar.js` | "hoy/ayer" por milisegundos: a las 00:10 lo de las 23:50 era "hoy" | Por día de calendario |
| M3 | `brujula.js` | Un `npx` (segundos) en cada parpadeo de la barra | Memo de 20 s, y ya sin `npx` |
| M4 | `skills/README.md` | Afirmaba que `rsc doctor` avisa de `ownSkills` ausentes. En 1.4.1 no hay rastro de ello en `scripts/doctor.js` | Texto corregido; la declaración es constancia |
| M5 | `preparar.js` | Aceptaba el plan re-pasando `--goal` en texto; RSC imprime la aceptación con `--goal-base64` | Reutiliza literalmente la línea `Accept exactly this plan:` |
| M6 | `extension/` | `vsce` rechazaba el README por enlaces relativos sin repositorio | Sin enlaces; `npm run empaquetar` con los flags |
| M7 | `.gitignore` | RSC no pudo añadir sus ignores (no era repo git) | Añadidos a mano |

### Abiertos — dichos, no cerrados

| | Qué | Por qué queda abierto |
|---|---|---|
| B1 | `soporte.js` decide "hay que tocar algo" con una regex sobre la salida de `repair --dry-run` | `doctor` emite JSON con `missing` y `hookWired`; parsearlo sería más fiable. No bloquea |
| B2 | `probar()` con `test_connection.py` usa `python3` / `python` | Un Windows limpio no tiene Python. La plantilla de RSC prioriza `.sh`, que sí cubrimos con bash |
| B3 | macOS: el `.pkg` no pregunta objetivo, y sin `carga/git` depende de las herramientas de Xcode | Documentado en `instalador/README.md` |
| B4 | El desinstalador no limpia el PATH | Prototipo |
| B5 | Tres claves del disfraz dudosas | Ahora la propia extensión dice cuáles rechaza VS Code |
| B6 | **Este repo no es git.** La memoria de RSC no ancla a rama/HEAD y RSC no pudo tocar `.gitignore` | Recomiendo `git init`; no lo hice porque es una decisión de proyecto |
| B7 | **Focus view por defecto** | Sigue siendo la pregunta 2 del spike y la que más importa |
| B8 | Los hooks de RSC no han anotado esta sesión | Se cargan al arrancar; empezarán en la siguiente |

---

## Verificación ejecutada

| Prueba | Resultado |
|---|---|
| `rsc onboard` real en este repo (preview → huella → aceptación) | `RSC_ONBOARDING_READY`; confirma flags, formato de huella y de línea de aceptación |
| `rsc doctor` tras todos los cambios | 8 skills, `missing: []`, `hookWired: true`, memoria `ready/full` |
| Extensión cargada y `activate()` ejercitado contra un `vscode` de mentira | 11 módulos cargan; 9 comandos registrados = manifiesto; vista forzada; disfraz escribe 29 ajustes y deja pendientes exactamente las 3 de Claude; brújula traduce `02-DOCS/wiki/facturacion/…, 01-TOOLS/holded/…` → "Lo que sabe de tu empresa (Facturacion) · Conexiones (Holded)"; puente sin comando → portapapeles + foco |
| `npm run empaquetar` (`vsce`) | `executive-lab.vsix`, 19 ficheros, 29 KB, `src/` y `media/` completos |
| `node docs/comprobar-diccionario.js` | 28 palabras prohibidas, 12 ficheros, sin incumplimientos |
| `skills/aplicar.js` contra un perfil con el formato real de RSC | 1ª pasada pone los diales y respeta el objetivo; 2ª respeta el dial que bajó el alumno; `--forzar` lo repone; `ownSkills` sin duplicar |
| `node --check` sobre todo el `.js`, `bash -n` sobre los `.sh`, JSON validado | Todo compila |

## Lo que sigue sin probar

La extensión dentro de un VS Code real; el `.iss` compilado; `preparar.js` de principio a fin; MinGit
con bash; el PATH visto desde el editor. Es exactamente [spike.md](spike.md). **Orden recomendado:**
pregunta 4 (el bundle sin administrador) → 3 (`rsc onboard` en Windows) → 6 (los hooks ven `node`)
→ 1 y 2 (el puente y Focus view) → 5 (SmartScreen). Las tres primeras se responden en una tarde con
una VM; si alguna es "no", el plan cambia antes de gastar más.

---

## Addendum — misma tarde, con la extensión de Claude a mano

Leyendo el `package.json` y el código compilado de `anthropic.claude-code` 2.1.273 instalada en el Mac de Jose:

- **B5 cerrado a medias.** `claudeCode.hideOnboarding`, `useTerminal`, `disableLoginPrompt` y `focusView` existen. Siguen sin confirmar dos
  claves de VS Code, `workbench.secondarySideBar.defaultVisibility` y `problems.visibility`; la propia extensión dirá si las rechaza.
- **B7 cerrado.** Focus view es el ajuste `claudeCode.focusView`. Está en el disfraz.
- **Nuevo, y grave si no se hubiera visto:** el comando de foco que había supuesto (`claude-code.focusInput`) no existe; el real es
  `claude-vscode.focus`. El plan B del puente no habría enfocado nada. Corregido, y con dos puentes directos delante (§ spike 1).
- **Nuevo:** MinGit no trae `bash.exe`; su `sh.exe` es GNU bash. `entorno.bash()` lo usa como último candidato.
- **Nuevo:** `preparar.js` dejaba la carpeta sin ninguna copia inicial, así que *Volver a como estaba antes* no tenía a dónde. Ahora hace
  una primera copia, *Punto de partida*.
- **Nuevo:** el chat de Claude no se abría solo al arrancar; el alumno se encontraba el centro vacío. La extensión lo abre 1,5 s después
  de activarse.
- **Verificado además:** `preparar.js` de punta a punta en macOS (`--sin-editor`), 0,6 s, `RSC_ONBOARDING_READY`, diales y raíles correctos.

### Cierre de la tarde

- **Instalador de Windows compilado** con Inno Setup bajo Wine (Docker, `amake/innosetup`): 336 s, 291 MB. Valida el `.iss` entero —
  Pascal Script, `[Registry]`, `CurStepChanged`, `Spanish.isl`, UTF-8—. Falta ejecutarlo en Windows.
- **Demo en el Mac** (`./demo.sh`): VS Code aislado con las dos extensiones instaladas de verdad y una empresa preparada por `preparar.js`.
  El log del extension host confirma la activación de `executivelab.panel` y el canal de salida no registra ningún ajuste rechazado.
  Dos trampas encontradas al montarla, ya blindadas en el script: el entorno del extension host lleva `ELECTRON_RUN_AS_NODE=1` (el binario
  de VS Code arranca como Node y muere con `bad option`), y la ruta del directorio de datos dentro del repo supera los ~104 caracteres que
  admite un socket Unix en macOS (se usa un enlace corto en `/tmp/executive-lab-demo`).
- **B5 matiz:** con el disfraz pre-escrito, la extensión no vuelve a escribir las claves, así que las dos de VS Code que quedaban
  dudosas siguen sin confirmar por esa vía. Se confirman mirando la interfaz de la demo: sin barra de estado, sin barra de actividad,
  título propio.
