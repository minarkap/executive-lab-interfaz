# El diccionario

**Regla dura: nada aparece en pantalla si no está en esta tabla.**

Si al construir algo hace falta una palabra que no está aquí, no se inventa sobre la marcha: se
añade a esta tabla primero, y entonces se usa. Es lo que evita que la interfaz se vaya llenando de
jerga por goteo.

## Traducciones

| Lo técnico | Lo que ve el alumno |
|---|---|
| carpeta del proyecto / repo / workspace | Mi Empresa |
| `git commit` | Guardar copia de seguridad |
| `git log` / `git restore` / checkout | Volver a como estaba el martes |
| `.env` / variables de entorno / secretos | Mis conexiones |
| API key / token / credencial | Clave de acceso |
| `rsc doctor` / `rsc repair` | Revisar y arreglar |
| `rsc add <skill>` | Enseñarle a hacer algo nuevo |
| skill | Habilidad |
| `02-DOCS/wiki/` | Lo que sabe de tu empresa |
| `01-TOOLS/` | Conexiones |
| `rsc memory resume` | Seguir donde lo dejé |
| sesión / contexto / conversación del agente | Conversación |
| prompt | Lo que le pides |
| agente / modelo / LLM | El asistente |
| error / excepción / stack trace | Algo va mal |
| log / diagnóstico | Informe para tu tutor |

## Palabras prohibidas

Estas no aparecen nunca en la interfaz, ni en un tooltip, ni en un mensaje de error:

terminal · consola · shell · comando · CLI · repositorio · commit · branch · push · pull · merge ·
directorio · ruta · path · archivo de configuración · JSON · variable de entorno · dependencia ·
instalar paquete · npm · Node · symlink · hook · VS Code · extensión · Claude Code · token · API

Dos matices:

- **"Claude"** sí se puede nombrar (es el asistente con el que hablan). **"Claude Code"** no: Anthropic
  prohíbe expresamente que un producto de terceros se presente con ese nombre.
- **"Archivo"** y **"carpeta"** sí se pueden usar. Son vocabulario de ofimática, no de programación:
  cualquiera que haya usado Windows los entiende.

## Cómo se escriben los mensajes

1. **Segunda persona y verbo primero.** "Guarda una copia", no "Guardado de copia de seguridad".
2. **Un mensaje, una idea.** Si hacen falta dos frases, probablemente hacen falta dos pantallas.
3. **Los errores dicen qué hacer, no qué falló.** Mal: "ENOENT: no such file or directory". Bien:
   "No encuentro tu carpeta de trabajo. Pulsa *Revisar y arreglar* y lo dejo como estaba."
4. **Nunca se le pide al alumno que copie algo rojo.** Se le da un código de incidencia de seis
   caracteres que pueda dictar por teléfono.
5. **Ninguna pregunta sin opciones.** Un campo de texto vacío ante alguien que no sabe qué escribir es
   una pared. Siempre hay ejemplos clicables.
