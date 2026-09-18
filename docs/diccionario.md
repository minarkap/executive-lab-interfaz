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
| `02-DOCS/wiki/` | Lo que sabe de <nombre del arnés> |
| `01-TOOLS/` | Conexiones |
| `rsc memory resume` | Seguir donde lo dejé |
| sesión / contexto / conversación del agente | Conversación |
| prompt | Lo que le pides |
| agente / modelo / LLM | El asistente |
| error / excepción / stack trace | Algo va mal |
| log / diagnóstico | Informe para tu tutor |
| `01-TOOLS/` | Mis conexiones |
| una carpeta de `01-TOOLS/` | Una conexión |
| los scripts de una herramienta | Qué puedes hacer con esto |
| `.claude/commands/` con `boton:` | Qué quieres hacer |
| `02-DOCS/wiki/` | Lo que sabe de <nombre del arnés> |
| un tema de la wiki | Un tema |
| un artículo de la wiki | Una cosa que sabe |
| `02-DOCS/wiki/log.md` | Qué ha aprendido últimamente |
| `02-DOCS/wiki/gaps.md` | Lo que aún no sabe |
| `02-DOCS/inbox/` | Darle documentos |
| `02-DOCS/inbox/_processed/` | Documentos que ya ha leído |
| `02-DOCS/wiki/dashboard.html` | El panel completo |
| `rsc onboard` en una carpeta nueva | Preparar esta carpeta |
| abrir otra carpeta | Elegir una carpeta · Cambiar de carpeta |
| quitar el disfraz en esta ventana | Ver el editor completo |
| poner el disfraz en esta ventana | Volver al modo sencillo |
| `02-DOCS/wiki/brand/marca.md` | La marca de tu empresa |
| buscar en la wiki, los comandos y `01-TOOLS/` | Busca lo que quieras: un cliente, una factura, una norma… |
| los resultados, por dónde salen | Cosas que sabe · Cosas que puedes hacer · Conexiones |
| un `.md` de la wiki que no está en `index.md` | Sin ordenar todavía |
| pedirle que actualice `index.md` | Que los ordene |
| el rastro de navegación (migas) | Lo que sabe de <nombre> › Tema › Título |
| `git push` a un remoto | Guardar una copia fuera de este ordenador |
| una sugerencia de la barra | (no se nombra: se enseña la frase y su botón) |
| apartar una sugerencia | Ahora no |
| `rsc add <skill>` desde la barra | Que lo aprenda |
| crear un `.claude/commands/` nuevo por repetición | Que se quede como botón |
| la web de la empresa del alumno | Tu web |
| escribir el récord de marca | Ponerle la cara de tu empresa |

## Palabras prohibidas

Estas no aparecen nunca en la interfaz, ni en un tooltip, ni en un mensaje de error:

terminal · consola · shell · comando · CLI · repositorio · commit · branch · push · pull · merge ·
directorio · ruta · path · archivo de configuración · JSON · variable de entorno · dependencia ·
instalar paquete · npm · Node · symlink · hook · VS Code · extensión · Claude Code · token · API

Dos matices:

- **"Claude"** sí se puede nombrar (es el asistente con el que hablan). **"Claude Code"** no: Anthropic
  prohíbe expresamente que un producto de terceros se presente con ese nombre.
- **"Archivo"**, **"documento"** y **"carpeta"** sí se pueden usar. Son vocabulario de ofimática, no
  de programación: cualquiera que haya usado Windows los entiende.
- **"El editor"** se puede nombrar en los dos botones del interruptor, porque hay que decir de algún
  modo qué aparece y qué desaparece. **"VS Code"** no.

## Cómo se escriben los mensajes

1. **Segunda persona y verbo primero.** "Guarda una copia", no "Guardado de copia de seguridad".
2. **Un mensaje, una idea.** Si hacen falta dos frases, probablemente hacen falta dos pantallas.
3. **Los errores dicen qué hacer, no qué falló.** Mal: "ENOENT: no such file or directory". Bien:
   "No encuentro tu carpeta de trabajo. Pulsa *Revisar y arreglar* y lo dejo como estaba."
4. **Nunca se le pide al alumno que copie algo rojo.** Se le da un código de incidencia de seis
   caracteres que pueda dictar por teléfono.
5. **Ninguna pregunta sin opciones.** Un campo de texto vacío ante alguien que no sabe qué escribir es
   una pared. Siempre hay ejemplos clicables.

## Nada predefinido

Las palabras de arriba nombran **sitios**, no contenidos. Lo que se enseña dentro de cada sitio sale
de lo que el arnés tenga montado en esa empresa: sus conexiones, sus botones, sus temas.

No hay una lista de herramientas ni de tareas en el código. Una gestoría verá facturación y bancos;
una empresa de contratos verá plantillas y firmas. Si alguna vez hace falta escribir en la interfaz
el nombre de una herramienta concreta, es que algo se ha hecho mal.

## No se llama "empresa"

Un arnés no es una empresa: puede ser la contabilidad, el personal, el marketing o un proyecto
suelto, y **una empresa puede tener cuatro**. Por eso el alumno pone dos nombres cuando dice para qué
va a ser: cómo se llama **esto** (Contabilidad) y cómo se llama **su empresa** (Nexus Consulting).

Los dos viven en el frontmatter de `02-DOCS/wiki/harness/user-profile.md`, junto a los diales, y de
ahí salen el rótulo de la ventana —«Contabilidad · Nexus Consulting»— y los textos del panel —«Lo que
sabe de Contabilidad»—.

Si no los ha puesto todavía, se tira del nombre de la carpeta. Si tampoco, la interfaz funciona igual
sin nombrar nada: es preferible a llamarlo «tu empresa» cuando resulta que es el departamento de
marketing.
