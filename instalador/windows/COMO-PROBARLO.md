# Cómo probar el `.exe`

El instalador está compilado (`Output/ExecutiveLab-Setup.exe`, 291 MB) pero **nunca se ha ejecutado
en Windows**. Esto es lo que falta, y es lo único que impide sentar a un alumno delante.

## Lo que se comprueba solo

Copia a la máquina de pruebas **esta carpeta** con el `.exe` dentro y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File probar.ps1
```

Dieciocho comprobaciones en unos minutos: que el instalador termina, que todo queda en la carpeta del
usuario, que Node, git, bash y el arnés están dentro, que el PATH queda puesto, que el arnés se montó
entero con sus diales y su punto de partida, que `rsc doctor` dice que los hooks están cableados, que
las dos extensiones se instalaron y que hay acceso directo. Deja un `informe-*.txt` al lado.

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

Si el repo llega a tener remoto en GitHub, esto mismo cabe en un *workflow* sobre `windows-latest`:
compilar con Inno, ejecutar el instalador en silencio y correr `probar.ps1`. Quedaría comprobado en
cada cambio. No lo he montado porque hoy el repo es solo local y subirlo es decisión tuya.

Lo que un *runner* **no** puede responder sigue siendo lo mismo: SmartScreen y el usuario sin
administrador.
