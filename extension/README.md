# La barra lateral Executive Lab

Una sola vista con la brújula y seis acciones. **No es un chat**: el chat es el panel oficial de
Claude, que vive a la derecha. Esto es lo que le dice al alumno dónde está y qué puede hacer ahora.

También es quien pone el disfraz: en su primer arranque aplica los ajustes de `media/disfraz.json`
sobre los ajustes de usuario, por la API de configuración, y propone reabrir. *Modo avanzado* los
quita; *Volver al modo sencillo* los repone.

## Cómo probarla

```bash
code --extensionDevelopmentPath=<esta carpeta> "~/Documentos/Mi Empresa IA"
```

Para empaquetarla e instalarla como lo hará el instalador:

```bash
npm run empaquetar
code --install-extension executive-lab.vsix
```

## Las decisiones de diseño que importan

**La brújula se deriva del disco, no de la conversación.** Sale del checkpoint de RSC
(`rsc memory resume`, cuyas rutas se traducen a zonas del diccionario), de la última copia de
seguridad y de lo que haya en `02-DOCS/`. Podría leerse de la conversación de Claude, y se vería mejor
— pero entonces dependeríamos de la interfaz de Anthropic, que cambia rápido.

**Nada se lanza como `.cmd`.** Node rechaza con `EINVAL` lanzar un `.cmd` o `.bat` sin shell, y en
Windows `npx` y `code` lo son. `src/entorno.js` localiza ejecutables de verdad — el Node, el git y el
arnés que deja el instalador — y solo cae a `cmd.exe` cuando no hay otra.

**Las credenciales van por proveedor**, como las guarda RSC: `01-TOOLS/<proveedor>/.env`, con las
claves esperadas en su `.env.example` y su propia prueba de conexión. No se inventa nada: se lee lo que
la carpeta dice y se ejecuta lo que la carpeta trae.

## El puente hasta Claude

`src/puente.js` es la pieza frágil y está aislada a propósito. Anthropic no documenta qué comandos
expone su extensión, así que el puente los descubre en tiempo de ejecución, prueba el mejor, y si no
encuentra ninguno cae al portapapeles.

Para ver qué hay en una instalación concreta: paleta de comandos →
**Executive Lab: Qué comandos de Claude hay disponibles**. Eso responde la pregunta 1 de
`docs/spike.md` sin leer código.

## Qué hay dentro

| Fichero | Qué hace |
|---|---|
| `src/extension.js` | Arranque, la vista, las acciones y el disfraz |
| `src/brujula.js` | Dónde estás / qué acabas de hacer, derivado del disco |
| `src/disfraz.js` | Aplica o quita los ajustes que esconden el editor |
| `src/puente.js` | Mandarle un texto a Claude, con plan B |
| `src/conexiones.js` | Las credenciales de `01-TOOLS/` como formulario + probar conexión |
| `src/guardar.js` | Copias de seguridad y volver atrás (git por debajo) |
| `src/soporte.js` | Revisar, arreglar y el código de incidencia |
| `src/rsc.js` | Llamadas al arnés, siempre con versión fijada |
| `src/procesos.js` | Ejecutar cosas sin abrir una terminal |
| `src/entorno.js` | Dónde están node, git, bash y el arnés en esta máquina |
| `media/disfraz.json` | Los ajustes del disfraz — la fuente de la verdad |
| `media/panel.*` | La interfaz del panel |

## Reglas al tocar esto

1. **Ninguna palabra nueva en pantalla sin pasar por `docs/diccionario.md`.**
   Lo comprueba `node docs/comprobar-diccionario.js`.
2. **Ninguna excepción en crudo delante del alumno.** Van al canal de salida; él ve una frase y una
   salida.
3. **Nada de `vscode.Terminal` y nada de `.cmd`.** Todo por `src/procesos.js`.
