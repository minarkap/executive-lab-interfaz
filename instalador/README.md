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
| `git/` | **Solo Windows**, y ya no hace falta: MinGit (`MinGit-*-64-bit.zip`). El historial lo lleva `isomorphic-git`, que `construir.sh` instala junto al arnés |
| `harness/` | `npm install --prefix carga/harness @ericrisco/rsc@1.4.1` en la máquina que construye |
| `executive-lab.vsix` | `cd extension && npm run empaquetar` |
| `executivelab.ico` | El icono. Solo Windows |
| `preparar.js`, `skills/`, `disfraz.json` | De este repo: `instalador/comun/`, `skills/` y `extension/media/` (`construir.sh` los copia; en Windows, copiarlos a `carga/`) |
| `VSCodeUserSetup-x64.exe` | Solo Windows, de code.visualstudio.com |

```bash
# El instalador de Windows, desde el Mac, con Inno Setup bajo Wine (Docker/OrbStack).
# Probado el 17-09-2026: 5 min 40 s, 291 MB → windows/Output/ExecutiveLab-Setup.exe
docker run --rm --platform linux/amd64 -v "$PWD/instalador/windows:/work" amake/innosetup ExecutiveLab.iss

# O en un Windows con Inno Setup 6.3+ (el .iss lleva acentos: guardarlo como UTF-8)
iscc windows\ExecutiveLab.iss

# El de macOS (ver más abajo)
./mac/construir.sh
```

## Lo que todavía no está probado

**El `.exe` está compilado pero nunca se ha ejecutado en un Windows limpio.** `preparar.js` sí se
ha probado de punta a punta en macOS (`--sin-editor`). Lo que falta es copiar
`windows/Output/ExecutiveLab-Setup.exe` a una VM de Windows limpia con un usuario sin administrador,
hacer doble clic y grabar la pantalla: preguntas 3, 4, 5 y 6 de [docs/spike.md](../docs/spike.md).

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

## macOS

Lo que sale es un **`.dmg` con una app instaladora**, no un `.pkg`: el `.pkg` pide contraseña de
administrador si instala fuera de la carpeta del alumno, y si instala dentro, macOS 26 enseña un
aviso de privacidad del propio Instalador nada más empezar (decisión 21 en
[docs/decisiones.md](../docs/decisiones.md)).

```bash
./mac/construir.sh                  # carga + app + .dmg  (~122 MB)
./mac/firmar.sh                     # firma, notariza y grapa
./mac/probar.sh                     # 19 comprobaciones
./mac/desinstalar.command           # lo quita todo y deja el Mac como estaba
```

| Pieza | Qué es |
|---|---|
| `instalar.applescript` | Lo único que ve el alumno: el diálogo, la barra de progreso y el final |
| `instalar.js` | El trabajo: copia la carga, baja el editor, pone las dos piezas, crea el acceso directo |
| `node.entitlements` | Los dos permisos que Node necesita para arrancar bajo el "hardened runtime" |

Diferencias con Windows, y por qué:

- **No pregunta nada.** Las preguntas las hace el panel en el primer arranque, con el wizard que ya
  existe (decisión 22).
- **No lleva el editor dentro.** Se descarga al instalar, y si el alumno ya lo tiene no se descarga
  nada: 122 MB en vez de 380.
- **No lleva git.** No hace falta en ningún sistema desde que el historial es JavaScript
  (decisión 23). En Windows sigue viajando MinGit porque el `.exe` ya está compilado con él.
- **No toca nada fuera de la carpeta del alumno**, así que no pide administrador.

Cómo probarlo, con y sin Mac limpio: [mac/COMO-PROBARLO.md](mac/COMO-PROBARLO.md).

## Firma

Sin firmar, Windows enseña *"Windows protegió tu PC"* y macOS lo bloquea con Gatekeeper. Para un
alumno no técnico eso es el final del recorrido, no un obstáculo. Y en macOS es **peor** que en
Windows: desde macOS 15 ya no vale el clic derecho para saltárselo, hay que entrar en Ajustes del
sistema → Privacidad y seguridad → *Abrir igualmente*.

### macOS — qué falta exactamente (17-09-2026)

La cuenta de Apple Developer está, pero **los certificados que hacen falta no**. Lo que hay en este
Mac son dos *Apple Development*, que sirven para probar en tus propios aparatos y que Gatekeeper
rechaza igual que si no hubiera nada:

```
security find-identity -v -p codesigning
  1) … "Apple Development: José María Sanchis Llopis (…)"
  2) … "Apple Development: apple@strattonapps.com (…)"
```

Tres cosas, y las tres las tiene que hacer el titular de la cuenta:

1. **Aceptar la licencia de Xcode.** Hasta que no se acepte, `notarytool` y `lipo` se niegan a
   funcionar (`lipo` es lo que junta los dos Node en un binario universal; sin él el paquete engorda
   50 MB y sigue funcionando).
   ```bash
   sudo xcodebuild -license accept
   ```
2. **Crear un certificado *Developer ID Application*** en developer.apple.com → Certificates → `+`.
   Solo lo puede crear el titular de la cuenta, y el `.cer` se descarga y se abre para que entre en
   el llavero.
3. **Guardar el perfil de notarización**, con una clave de app de appleid.apple.com (no la del
   Apple ID):
   ```bash
   xcrun notarytool store-credentials executivelab \
     --apple-id <correo> --team-id <equipo> --password <clave de app>
   ```

Con eso, `./mac/firmar.sh` hace el resto y `./mac/probar.sh` lo confirma. Mientras tanto, el
comprobador da ese punto por malo a propósito.

### Windows

Sigue abierto: certificado OV (~300 €/año, con reputación diferida) o EV (~600 €/año, desde el
primer día). Está discutido en [docs/friccion.md](../docs/friccion.md) §2.
