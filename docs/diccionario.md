# El diccionario

**Regla dura: nada aparece en pantalla si no está en esta tabla.**

Si al construir algo hace falta una palabra que no está aquí, no se inventa sobre la marcha: se
añade a esta tabla primero, y entonces se usa. Es lo que evita que la interfaz se vaya llenando de
jerga por goteo.

## Traducciones

| Lo técnico | Lo que ve el alumno |
|---|---|
| carpeta del proyecto / repo / workspace | Mi trabajo |
| los números al lado de cada apartado | 4 conceptos · 1 programa (nunca un número a secas) |
| `git commit` | Guardar en git |
| `git log` / `git restore` / checkout | Ver las copias guardadas |
| una copia concreta de la lista | Como estaba ayer · Como estaba el martes |
| `.env` / variables de entorno / secretos | Tus programas |
| API key / token / credencial | Clave de acceso |
| `rsc doctor` / `rsc repair` | Revisar y arreglar |
| el consejero y el «¿y ahora qué?» | Estoy atascado · Dime por dónde seguir |
| pedirle ideas | Pensemos ideas juntos |
| la radiografía de la carpeta | Qué falta por montar |
| los datos de hoy, en una línea | 2 copias hoy · cambios sin guardar · 1 documento sin leer |
| la tipografía de la marca | La de siempre · La de tu ordenador · Clásica · Fácil de leer |
| `rsc add <skill>` | Que lo aprenda |
| skill | Habilidad |
| `02-DOCS/wiki/` | Lo que sabe de <nombre del arnés> |
| `01-TOOLS/` | Tus programas |
| `rsc memory resume` | Seguir donde lo dejé |
| sesión / contexto / conversación del agente | Conversación |
| prompt | Lo que le pides |
| agente / modelo / LLM | El asistente |
| error / excepción / stack trace | Algo va mal |
| log / diagnóstico | Informe para tu tutor |
| una carpeta de `01-TOOLS/` | Un programa |
| el catálogo de habilidades de RSC | Habilidades · Todo lo que sabe hacer |
| `02-DOCS/wiki/sdd/constitution.md` | Innegociables |
| `CLAUDE.md` / `AGENTS.md`, sección Working rules | Cómo se trabaja aquí |
| los dos juntos | Las reglas |
| `targets` de `.rsc.json` (Claude o Codex) | Con quién hablas |
| el subapartado de personalización | Cómo quieres que trabaje |
| `permissions.defaultMode` de Claude | Qué puede hacer sin preguntarte |
| `plan` / `default` / `acceptEdits` | Que me lo proponga antes · Que me pregunte al cambiar algo · Que cambie ficheros sin preguntar |
| guardar en git con un reloj | Cada cuánto guarda solo |
| `Goals` y `Constraints` del perfil | Para qué es esto · Los límites que pusiste |
| borrar un documento sin leer | Quitar |
| borrar uno ya leído, con lo que aprendió de él | Quitar algo que ya ha leído |
| los scripts de una herramienta | Consultas (dentro de cada programa) |
| `.claude/commands/` con `boton:` | Tus botones |
| lo que se fija arriba del todo | Acciones rápidas · Elegir cuáles |
| `02-DOCS/wiki/` | Lo que sabe de <nombre del arnés> |
| un tema de la wiki | Un tema |
| un artículo de la wiki | Un concepto |
| `02-DOCS/wiki/log.md` | Lo último que ha anotado (dentro de El diario) |
| `02-DOCS/wiki/gaps.md` | Preguntas sin contestar |
| `02-DOCS/inbox/` | Darle documentos · Sin leer todavía |
| `02-DOCS/raw/` | Originales guardados |
| `01-TOOLS/<lo que sea>/out/` | Lo que ha hecho |
| sacar uno de ahí | Llevarte un archivo |
| los tres montones juntos | Lo que le has dado |
| `02-DOCS/inbox/_processed/` | Documentos que ya ha leído |
| `02-DOCS/wiki/dashboard.html` | El panel completo |
| `rsc onboard` en una carpeta nueva | Preparar esta carpeta |
| abrir otra carpeta | Elegir una carpeta (la primera vez) · Cambiar de proyecto |
| quitar el disfraz en esta ventana | Ver el editor completo |
| poner el disfraz en esta ventana | Volver al modo sencillo |
| `02-DOCS/wiki/brand/marca.md` | La marca de tu empresa |
| buscar entre los ficheros | Buscar un documento |
| buscar en la wiki, los comandos y `01-TOOLS/` | Buscar un concepto |
| los resultados, por dónde salen | Cosas que sabe · Cosas que puedes hacer · Conexiones |
| un `.md` de la wiki que no está en `index.md` | Sin ordenar todavía |
| pedirle que actualice `index.md` | Que los ordene |
| el rastro de navegación (migas) | Lo que sabe de <nombre> › Tema › Título |
| `git push` a un remoto | Subir a GitHub |
| una sugerencia de la barra | (no se nombra: se enseña la frase y su botón) |
| apartar una sugerencia | Ahora no |
| `rsc add <skill>` desde la barra | Que lo aprenda |
| crear un `.claude/commands/` nuevo por repetición | Que se quede como botón |
| la web de la empresa del alumno | Tu web |
| escribir el récord de marca | El tema de mi empresa |
| el material que se le da para la marca | Dale material · Subirle el logotipo o lo que tengas |
| borrar el récord de marca | Volver a la cara de siempre |
| un logotipo que es solo el símbolo | (se pinta el símbolo y, al lado, el nombre de la empresa) |
| `02-DOCS/raw/worklog/` | Días de trabajo (se abren al lado, no en la barra) |
| una ficha de `raw/worklog/` | Una anotación |
| `02-DOCS/wiki/harness/decisions.md` | Decisiones |
| las dos cosas juntas, en la barra | El diario |
| `accompaniment_level` y `technical_level` del perfil | Cómo te habla |
| `accompaniment_level` | Cuánto te explica |
| `technical_level` | Con qué palabras |
| elegir uno de esos escalones | Ponme así |
| los seis apartados de la pantalla principal | Documentos · Lo que sabe · Histórico · Acciones · Ayuda · Ajustes |

## Dos excepciones: git y GitHub

**Decisión de Jose, 18 de septiembre de 2026.** Los dos botones del historial se llamaban «Guardar
copia de seguridad» y «Guardar una copia fuera de este ordenador». Ahora se llaman **«Guardar en
git»** y **«Subir a GitHub»**.

Va contra el espíritu del resto de esta tabla, y conviene saber por qué se acepta:

- **No son jerga, son nombres propios.** «git» y «GitHub» son dos sitios concretos, como «Holded» o
  «Odoo», que esta misma tabla nunca ha traducido. El alumno va a oír esos nombres igual —en clase,
  en cualquier tutorial, de cualquiera que le ayude—, y que la barra los llame de otra manera le
  deja sin poder relacionar una cosa con otra.
- **La perífrasis escondía la diferencia.** «Guardar copia» y «Guardar una copia fuera de este
  ordenador» se parecen demasiado escritas seguidas; «en git» y «a GitHub» se distinguen de un
  vistazo, que es lo que importa cuando hay dos botones juntos.

Lo que **no** cambia: sigue prohibido `commit`, `push`, `repositorio` y `branch`. Nombrar la
herramienta vale; explicar sus tripas, no.

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
