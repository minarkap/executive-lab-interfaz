# Cómo probar el `.exe`

El instalador (`Output/ExecutiveLab-Setup.exe`, unos 30 MB: el editor se descarga al instalar) se
compila, se instala en silencio y se comprueba solo, en cada cambio, en una máquina Windows de GitHub
(abajo, y decisión 129). Lo que sigue pidiendo una persona es lo que se ve con los ojos: SmartScreen,
un usuario sin administrador y la ventana.

## Lo que se comprueba solo

Copia a la máquina de pruebas **esta carpeta** con el `.exe` dentro y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File probar.ps1
```

Catorce comprobaciones en unos minutos:
- que el instalador termina sin administrador y todo queda en la carpeta del usuario;
- que lleva Node dentro y lo deja en el PATH;
- que git está instalado de verdad, con el instalador oficial (decisión 26), y bash a su lado;
- que no se ha inventado una carpeta de trabajo;
- que el registro de la instalación está limpio;
- que el editor y las dos extensiones están, y el arnés dentro de la nuestra, y que arranca con nuestro
  Node;
- que hay acceso directo.

Deja un `informe-*.txt` al lado. Montar el arnés en una carpeta ya no es cosa del instalador: lo hace la
barra al pulsar «Preparar esta carpeta», y se comprueba ahí.

Responde las preguntas **3, 4 (a medias) y 6** de [docs/spike.md](../../docs/spike.md).

## Lo que hay que mirar con los ojos

Tres cosas que ningún script puede responder:

| Qué | Cómo |
|---|---|
| **SmartScreen** | Sube el `.exe` a algún sitio, descárgalo con Edge en la máquina limpia y **graba la pantalla**. Lo que salga es lo que verá el alumno en el primer minuto del curso |
| **Sin administrador** | Repite `probar.ps1` con un usuario que **no** sea administrador. Si el script dice `Admin: True`, esa pregunta no está respondida |
| **La ventana** | Abre el acceso directo, inicia sesión en Claude y mira: ¿sale la barra?, ¿se ve el disfraz?, ¿aparece algún aviso raro? |

## Dónde conseguir un Windows

Este Mac es arm64 y no tiene virtualización instalada. Por orden de fidelidad:

1. **Un portátil Windows de verdad.** Es lo que tienen los alumnos, y es lo único que prueba
   SmartScreen tal cual lo verán. Si hay uno a mano, esta es la respuesta.
2. **Una máquina Windows x64 en la nube por horas** (Azure, AWS). Céntimos la hora, arquitectura
   correcta, y se entra por escritorio remoto. Lo mejor si no hay portátil.
3. **UTM en el Mac** (gratis) con Windows 11 ARM. Vale para la mayor parte, pero nuestro `.exe` es x64
   y correría emulado: si algo falla, no sabrás si es culpa nuestra o de la emulación.

## Y para que no haya que repetirlo a mano

Ya corre solo. En cada cambio, `.github/workflows/windows.yml` hace esto en una máquina Windows de GitHub,
gratis para un repositorio público:
- **el `.exe`**: baja el Node portable, arma la carga, lo compila con Inno, lo instala en silencio y corre
  `probar.ps1` con el PowerShell de Windows. El informe y el registro quedan como artefacto. La
  primera vez, el 28-09-2026, fueron 14 de 14 (decisión 129);
- **la barra en un VS Code de Windows**, sin node, con el relevo lanzando el binario del editor;
- `extension/prueba/windows.js`, con el relevo en Git Bash, PowerShell y cmd, el freno pasado por Git
  Bash y el Python que se elige (`py -3`);
- la batería de siempre y el contrato.

Lo que un *runner* **no** puede responder sigue siendo lo mismo: SmartScreen y el usuario sin
administrador.
