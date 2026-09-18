# El instalador

Es el producto de verdad. Todo lo demás de este repo sirve de poco si el alumno no llega hasta aquí.

**Objetivo medible: de doble clic a primer resultado útil en menos de 10 minutos, sin ayuda.**

## El reparto: esto pone las piezas, el panel hace el resto

Desde la decisión 27, el instalador **no monta ningún arnés y no crea ninguna carpeta**.

| | Qué hace |
|---|---|
| **El instalador** | El editor, Node, git y las dos extensiones. Un acceso directo que abre el editor. Se acaba ahí |
| **El panel** | Elegir carpeta → las preguntas → montar RSC → raíles, nombres, enganches, primera copia |

### Qué hace, en orden

1. Pregunta **una sola cosa**, con opciones: con qué asistente va a trabajar. Es lo único que el
   instalador necesita saber, porque de eso depende qué extensión se instala.
2. Instala VS Code en silencio, por usuario, **sin pedir administrador**.
3. Deja Node dentro de su carpeta y lo pone en el PATH del usuario: los enganches del arnés lo
   llaman por nombre desde el editor, y esa persona no tiene nada en el sistema.
4. Ejecuta `comun/preparar.js`, que ahora son dos pasos:
   - **asegurar git**, con el instalador oficial del sistema si no está (decisión 26)
   - instalar la extensión del asistente y la nuestra
   - y los cinco ajustes de ámbito de programa, que son los únicos que VS Code no admite por carpeta
5. Deja un acceso directo **Executive Lab** con icono propio que **abre el editor, sin carpeta**.

No imprime nada para quien lo instala: escribe `instalacion.log` junto a la app. Quien enseña la
barra de progreso es el instalador.

Antes esto montaba también un arnés en `Documentos/Mi Empresa IA`, con seis preguntas dentro del
instalador. Eran las mismas seis que hace el panel, mantenidas por duplicado —y las de Windows se
quedaron atrás sin que nadie lo viera—, y elegían la carpeta de trabajo a ciegas, antes de que esa
persona hubiera abierto el programa.

## Construirlo

Los dos necesitan una carpeta `carga/` que **no está versionada**. Cada sistema tiene su script que
la monta; lo único que hay que dejar a mano son los binarios de terceros:

| Fichero | De dónde sale |
|---|---|
| `runtime/` | Node LTS portable: el `.zip` de nodejs.org para Windows, el `.tar.gz` para macOS (`mac/construir.sh` lo descarga solo) |
| `executivelab.ico` | El icono. Solo Windows |
| `VSCodeUserSetup-x64.exe` | Solo Windows, de code.visualstudio.com |

El resto lo montan los scripts: `preparar.js`, `git.js`, `ajustes.js`, `disfraz.json` y el `.vsix`
(que empaquetan si hace falta). **Ya no viajan** el arnés, los raíles ni MinGit: los dos primeros van
dentro del `.vsix`, que es quien los usa, y git lo instala su propio instalador (decisión 26).

```bash
# Windows: montar la carga y compilar el .exe desde el Mac, con Inno bajo Wine
./windows/preparar-carga.sh
docker run --rm --platform linux/amd64 -v "$PWD/instalador/windows:/work" amake/innosetup ExecutiveLab.iss
# Probado el 18-09-2026: 3 min 56 s, 268 MB → windows/Output/ExecutiveLab-Setup.exe

# O en un Windows con Inno Setup 6.3+ (el .iss lleva acentos: guardarlo como UTF-8)
iscc windows\ExecutiveLab.iss

# macOS: la carga, la app y el .dmg de una vez
./mac/construir.sh          # 103 MB
```

`windows/preparar-carga.sh` existe porque esa carga se montaba a mano, y por eso se quedó atrás: el
`.exe` del 17-09 llevaba dentro la extensión 0.1.0 y un `preparar.js` tres horas más viejo que el
repositorio. El de macOS nunca tuvo ese problema porque lo monta `construir.sh`.

## Lo que todavía no está probado

**El `.exe` está compilado pero nunca se ha ejecutado en un Windows limpio.** `preparar.js` sí se
ha probado en macOS (`--sin-editor`). Lo que falta es copiar
`windows/Output/ExecutiveLab-Setup.exe` a una VM de Windows limpia con un usuario sin administrador,
hacer doble clic y grabar la pantalla.

Dónde espero que falle primero:

- **El instalador de Git, lanzado sin elevar.** Debería instalar para el usuario y no pedir
  administrador, pero es justo lo que no se puede comprobar desde un Mac. Si pidiera UAC, se acabó el
  «sin administrador» (decisión 26).
- **bash en Windows.** Los `test_connection.sh` de RSC piden bash. Antes lo traía MinGit; ahora lo
  trae el Git para Windows de verdad, en `usr\bin\bash.exe`. Hay que confirmarlo.
- **El PATH recién escrito.** Inno lo pone en el registro y avisa al sistema, pero un VS Code que ya
  estuviera abierto no lo ve hasta reiniciarse. En una máquina limpia no hay ninguno abierto.
- **`rsc onboard` en Windows**, que ahora corre desde el panel y no desde el instalador. Usa symlinks
  y cae a copias reales cuando el sistema no los admite.

Una cosa que ya falló en el papel y está arreglada: Node rechaza lanzar un `.cmd` sin shell, por eso
ni `preparar.js` ni la extensión tocan `npx.cmd` ni `code.cmd` directamente. La otra —que el orden de
Inno creaba el acceso directo antes de ejecutar nada, y había que pasarle la carpeta ya resuelta— ha
dejado de existir: el acceso directo abre el editor y ya no apunta a ninguna carpeta.

## macOS

Lo que sale es un **`.dmg` con una app instaladora**, no un `.pkg`: el `.pkg` pide contraseña de
administrador si instala fuera de la carpeta del alumno, y si instala dentro, macOS 26 enseña un
aviso de privacidad del propio Instalador nada más empezar (decisión 21 en
[docs/decisiones.md](../docs/decisiones.md)).

```bash
./mac/construir.sh                  # carga + app + .dmg  (103 MB)
./mac/firmar.sh                     # firma, notariza y grapa
./mac/probar.sh                     # 14 comprobaciones
./mac/desinstalar.command           # lo quita todo y deja el Mac como estaba
```

| Pieza | Qué es |
|---|---|
| `instalar.applescript` | Lo único que ve el alumno: el diálogo, la barra de progreso y el final |
| `instalar.js` | El trabajo: copia la carga, baja el editor, asegura git, pone las dos piezas, crea el acceso directo |
| `node.entitlements` | Los dos permisos que Node necesita para arrancar bajo el "hardened runtime" |

Diferencias con Windows, y por qué:

- **No pregunta nada, ni siquiera el asistente.** En Windows se pregunta porque el `.exe` tiene que
  elegir qué extensión instalar antes de ejecutar nada; aquí `instalar.js` puede mirarlo.
- **No lleva el editor dentro.** Se descarga al instalar, y si esa persona ya lo tiene no se descarga
  nada: 103 MB en vez de 380.
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
  1) … "Apple Development: <titular de la cuenta> (…)"
  2) … "Apple Development: <correo de la cuenta> (…)"
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
