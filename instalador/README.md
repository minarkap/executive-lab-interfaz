# El instalador

Es el producto de verdad. Todo lo demás de este repo sirve de poco si el alumno no llega hasta aquí.

**Objetivo medible: de doble clic a primer resultado útil en menos de 10 minutos, sin ayuda.**

## Qué hace, en orden

1. Pregunta **una sola cosa**, con seis opciones y sin campo de texto: qué quiere resolver primero.
2. Instala VS Code en silencio, por usuario, **sin pedir administrador**.
3. Deja Node, git y el arnés dentro de su carpeta, y pone Node y git en el PATH del usuario: los
   hooks del arnés los llaman por nombre desde el editor, y el alumno no tiene nada en el sistema.
4. Ejecuta `comun/preparar.js`, que es donde está toda la lógica:
   - crea `Documentos/Mi Empresa IA`
   - la prepara para guardar copias de seguridad (y falla en alto si no hay git)
   - monta el arnés con `rsc onboard` en los dos pasos que exige, reutilizando la línea de
     aceptación tal cual la imprime RSC para que la huella no pueda dejar de coincidir
   - comprueba el suelo del arnés y falla si quedó a medias
   - pone los raíles de `skills/`
   - instala la extensión de Claude y la nuestra
5. Deja un acceso directo **Executive Lab** con icono propio que abre la carpeta. El disfraz lo pone
   la extensión en su primer arranque (ver [perfil/](../perfil/)).

No imprime nada para el alumno: escribe `instalacion.log` dentro de su carpeta. Quien enseña la barra
de progreso es el instalador.

## Construirlo

Los dos necesitan una carpeta `carga/` que **no está versionada** porque son binarios de terceros:

| Fichero | De dónde sale |
|---|---|
| `runtime/` | Node LTS portable: el `.zip` de nodejs.org para Windows, el `.tar.gz` para macOS |
| `git/` | **Windows:** MinGit (`MinGit-*-64-bit.zip` de las releases de Git for Windows) · **macOS:** un git portable, o se depende de las herramientas de Xcode |
| `harness/` | `npm install --prefix carga/harness @ericrisco/rsc@1.4.1` en la máquina que construye |
| `executive-lab.vsix` | `cd extension && npm run empaquetar` |
| `executivelab.ico` | El icono. Solo Windows |
| `preparar.js`, `skills/`, `disfraz.json` | De este repo: `instalador/comun/`, `skills/` y `extension/media/` (`construir.sh` los copia; en Windows, copiarlos a `carga/`) |
| `VSCodeUserSetup-x64.exe` | Solo Windows, de code.visualstudio.com |

```bash
# Windows, con Inno Setup 6.3+ (el .iss lleva acentos: guardarlo como UTF-8)
iscc windows\ExecutiveLab.iss

# macOS
./mac/construir.sh 0.1.0
```

## Lo que todavía no está probado

**Nada de esto se ha ejecutado en una máquina limpia.** Se escribió en un Mac, y las dos rutas
necesitan una máquina limpia de verdad antes de ponerlas delante de un alumno. Las preguntas 3, 4 y 5
de [docs/spike.md](../docs/spike.md) son exactamente eso.

Dónde espero que falle primero:

- **`rsc onboard` en Windows.** Usa symlinks y cae a copias reales cuando el sistema no los admite.
  Es el paso más largo y el que deja la carpeta a medias si se tuerce.
- **bash en Windows.** Los `test_connection.sh` de RSC piden bash. MinGit debería traerlo en
  `usr\bin\bash.exe`; hay que confirmarlo con el zip concreto que se empaquete.
- **El PATH recién escrito.** Inno lo pone en el registro y avisa al sistema, pero un VS Code que ya
  estuviera abierto no lo ve hasta reiniciarse. En una máquina limpia no hay ninguno abierto.

Dos cosas que ya fallaron en el papel y están arregladas: Node rechaza lanzar un `.cmd` sin shell
(por eso ni `preparar.js` ni la extensión tocan `npx.cmd` ni `code.cmd` directamente), y el orden de
Inno crea los accesos directos **antes** de ejecutar nada, así que la ruta de trabajo se le pasa ya
resuelta a `preparar.js` con `--destino`.

## macOS: dos huecos

- El `.pkg` no tiene pantalla para elegir objetivo. Se monta con uno genérico y el asistente lo
  afina en la primera conversación.
- Si `carga/git` no existe, el git del sistema pide instalar las herramientas de Xcode con un
  diálogo. `postinstall` lo avisa; no lo resuelve.

## Firma

Sin firmar, Windows enseña *"Windows protegió tu PC"* y macOS lo bloquea con Gatekeeper. Para un
alumno no técnico eso es el final del recorrido, no un obstáculo.

Para el prototipo se puede convivir con ello acompañándolo de un vídeo de 30 segundos. Para la
cohorte hace falta certificado de firma de código en Windows, y Developer ID + notarización en macOS.
