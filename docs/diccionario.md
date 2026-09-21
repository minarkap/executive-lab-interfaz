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
| `.env` / variables de entorno / secretos | Conexiones (tools) |
| API key / token / credencial | Clave de acceso |
| `rsc doctor` / `rsc repair` | Revisar y arreglar |
| el consejero y el «¿y ahora qué?» | Estoy atascado · Dime por dónde seguir |
| pedirle ideas | Pensemos ideas juntos |
| la radiografía de la carpeta (botón, título y miga: los tres iguales; nunca «Qué hay aquí») | Qué falta por montar |
| los datos de hoy, en una línea | 2 copias hoy · cambios sin guardar · 1 documento sin leer |
| la tipografía de la marca | La de siempre · La de tu ordenador · Clásica · Fácil de leer |
| `rsc add <skill>` | Añadir (una habilidad del catálogo) |
| skill | Habilidad |
| `02-DOCS/wiki/` | Conocimiento (wiki) (dentro, «Conocimiento de <nombre>») |
| `01-TOOLS/` | Conexiones (tools) |
| `rsc memory resume` | Seguir donde lo dejé |
| sesión / contexto / conversación del agente | Conversación |
| prompt | Lo que le pides |
| el asistente principal (Claude, Codex) / modelo / LLM | El asistente |
| error / excepción / stack trace | Algo va mal |
| log / diagnóstico | Informe para tu tutor |
| una carpeta de `01-TOOLS/` | Una conexión |
| una clave que existe pero no en `01-TOOLS/<X>/.env` | Puesta, pero fuera de su sitio · «Ya la tienes, en la carpeta principal» |
| una clave exportada en el entorno del ordenador | Puesta en tu ordenador, fuera de esta carpeta |
| un proveedor que se deduce de las claves sueltas y no tiene carpeta | Por montar |
| pedirle al asistente que audite la carpeta por un problema concreto | Resolver una incidencia |
| el catálogo de habilidades de RSC | Habilidades (skills) · Sugerencias del catálogo (las que pegan con esta carpeta) · Resto del catálogo (plegado) |
| una habilidad, por su nombre | El nombre de la cosa: Facturación, Contratos, Tono humano. Nunca una frase sobre lo que sabe hacer |
| una habilidad instalada / `rsc list` | Instaladas (las propias, las del catálogo y las de fuera, juntas; el origen va en la (i)) |
| las que el arnés monta para funcionar (`orient`, `suggest`, la cadena SDD…) | Las del arnés (plegadas, al final) |
| `ownSkills` de `.rsc.json` | Tuya: escrita para esta carpeta (en la (i), dentro de Instaladas) |
| una del catálogo que está puesta | Del catálogo (en la (i), dentro de Instaladas) |
| `.claude/agents/` (y su equivalente en cada asistente) | Agentes |
| un agente (subagente con encargo fijo) | Un agente |
| lo que el consejero y el asistente proponen | Sugerencias · Qué le vendría bien a esto |
| pedirle que mire si hace falta un agente (cuando no hay ninguno) | Ver si te vendría bien un agente |
| `02-DOCS/wiki/sdd/constitution.md` | Innegociables |
| los guardianes de RSC (`danger-guard`, `gitmoji-guard`, `ship-guard`) | Lo que se comprueba solo (plegado, al final de Las reglas) |
| `optOuts` de `.rsc.json` y los interruptores `.rsc/.no-*` (lo que aquí se decidió no usar) | Lo que tiene apagado (en Qué falta por montar), cada uno por su nombre de guardián o de automatismo |
| lo que el arnés hace solo sin parar nada (`session-start`, `worklog-checkpoint`, `userprompt-gate`, `worktree-reaper`, la memoria, `context7`, y las tres comprobaciones de arranque) | Lo que hace solo, sin parar nada (dentro de Lo que se comprueba solo) |
| `session-start.mjs` | La brújula al empezar |
| `worklog-checkpoint.mjs` | El aviso del diario |
| `userprompt-gate.mjs` (`.no-feature-gate`) | La puerta antes de construir |
| `worktree-reaper.mjs` (`.no-worktree-cleanup`) | Recogida de copias de trabajo |
| `session-memory.mjs` | La memoria entre conversaciones |
| el MCP `context7` (`.no-context7`) | Documentación al día (context7) |
| el aviso de `rsc audit` (`.no-audit`) | La revisión periódica de habilidades |
| el aviso de dos arneses (`.no-scope-check`) | El aviso de arnés duplicado |
| el aviso de `CLAUDE.md` largo (`.no-claudemd-check`) | El aviso de reglas demasiado largas |
| `02-DOCS/wiki/harness/installation-plan.md` y `onboarding.acceptedAt` | El plan de montaje · Ver el plan de montaje · Aceptado el 18 de septiembre |
| `.rsc/automation-gaps.md` (lo que `skill-scout` apunta tras trabajar) | ideas de automatización (un consejo en Sugerencias) |
| `spec-miner` | Extractor de especificación |
| `<lenguaje>-reviewer` / `<lenguaje>-build-resolver` | Revisor de C++ · Arreglador de compilación de PyTorch (el lenguaje por su nombre, en `patrones.lenguajes`) |
| las 273 habilidades del catálogo | cada una por su nombre en `capacidades.json`; el catálogo entero, no una selección |
| el sello de revisión (`.rsc/sello*`), `eval-sandbox/`, `.base-versions.json` | (no se nombran: fontanería sin cara; el sello aquí no está activado) |
| `danger-guard` | Freno ante órdenes peligrosas |
| `gitmoji-guard` | Formato al guardar en git |
| `ship-guard` | Aviso de trabajo a medias |
| `.rsc/backups/` | Copias que guarda el arnés |
| `CLAUDE.md` / `AGENTS.md`, sección Working rules | Cómo se trabaja aquí |
| los dos juntos | Las reglas |
| `targets` de `.rsc.json` (Claude o Codex) | Tu asistente |
| el subapartado de personalización | Cómo quieres que trabaje |
| `permissions.defaultMode` de Claude | Qué puede hacer sin preguntarte |
| `plan` / `default` / `acceptEdits` | Que me lo proponga antes · Que me pregunte al cambiar algo · Que cambie ficheros sin preguntar |
| guardar en git con un reloj | Cada cuánto guarda solo |
| `Goals` y `Constraints` del perfil | Para qué es esto · Los límites que pusiste |
| borrar un documento sin leer | Quitar |
| borrar uno ya leído, con lo que aprendió de él | Quitar algo que ya ha leído |
| los scripts de una herramienta | Consultas (dentro de cada programa) |
| `.claude/commands/` con `boton:` | Comandos (los que llevan botón salen arriba) |
| lo que se fija arriba del todo | Acciones rápidas · Elegir cuáles |
| `02-DOCS/wiki/` | Conocimiento (wiki) (dentro, «Conocimiento de <nombre>») |
| un tema de la wiki | Un tema |
| un artículo de la wiki | Un concepto |
| `02-DOCS/wiki/log.md` | Lo último que ha anotado (dentro de El diario) |
| `02-DOCS/wiki/gaps.md` | Preguntas sin contestar |
| `02-DOCS/inbox/` | Darle documentos (inbox) · Sin leer todavía |
| `02-DOCS/raw/` | Originales guardados |
| `01-TOOLS/<lo que sea>/out/` | Resultados (out) |
| sacar uno de ahí | Llevarte un archivo |
| los tres montones juntos (inbox, procesados, raw) | Documentos entregados |
| un documento tirado en la carpeta, sin colocar | Sin colocar todavía |
| `.claude/commands/` entero | Comandos |
| una habilidad instalada fuera del catálogo curado | Instalada aquí, fuera del catálogo (en la (i), dentro de Instaladas); se nombra con lo que diga su propia cabecera, y solo si está en español |
| `bro` | Escribirlo como lo diría una persona |
| `eli5` | Explicártelo desde cero |
| `show-me` | Enseñártelo con un dibujo |
| `unslop` | Repasar un texto antes de mandarlo |
| `resume-session` | Seguir donde lo dejé |
| `save-session` | Guardar dónde vamos |
| `learn` | Que aprenda algo de ti |
| la memoria de RSC: las lecciones aprobadas una a una con `learn` | Lo que ha aprendido de ti (dentro de Cómo te habla) |
| `checkpoint` | Congelar esto para revisarlo |
| escribir una habilidad nueva a medida | Proponme habilidades para lo mío · Quiero enseñarle algo concreto |
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
| cuántas cosas ha encontrado la búsqueda | 3 coincidencias (nunca «resultados»: Resultados (out) es otra pantalla) |
| un `.md` de la wiki que no está en `index.md` | Sin ordenar todavía |
| pedirle que actualice `index.md` | Que los ordene |
| el rastro de navegación (migas) | Conocimiento › Tema › Título |
| `git push` a un remoto | Subir a GitHub |
| una sugerencia de la barra | (no se nombra: se enseña la frase y su botón) |
| apartar una sugerencia | Ahora no |
| `rsc add <skill>` desde la barra | Añadir · Añadirla |
| crear un `.claude/commands/` nuevo por repetición | Que se quede como botón |
| la web de la empresa del alumno | Tu web |
| la cara que la barra saca sola de la web al montar (`marca.md` con `provisional: si`) | Ya lleva la cara de <empresa> · «sacada de su web de forma automática; el asistente la afina» |
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
| los apartados de la pantalla principal | Documentos · Conocimiento · Histórico · En qué estamos · Acciones · Ayuda · Ajustes |
| `02-DOCS/wiki/sdd/specs/` | Qué queremos |
| `02-DOCS/wiki/sdd/plans/` | Cómo se va a hacer |
| `02-DOCS/wiki/sdd/proposals/` | Antes de empezar |
| los tres juntos | En qué estamos |

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

## Tercera excepción: tools, skills y comandos

**Decisión de Jose, 18 de septiembre de 2026.** Tres rótulos llevan el término en inglés entre
paréntesis: **Conexiones (tools)**, **Habilidades (skills)** y **Comandos**.

El motivo es el mismo que el de git y GitHub, y esta vez con más razón todavía: **en clase se
explican con esas palabras**. El alumno va a oír «skill» en la segunda sesión, y va a leerla en
cualquier tutorial y en la propia documentación de RSC. Que la barra la llame solo «habilidad» le
deja sin poder atar una cosa con otra justo cuando está aprendiendo las dos a la vez.

El paréntesis es la forma de tener las dos: manda la palabra en cristiano, y detrás va la que va a
oír fuera. No al revés.

## Cuarta regla: las cosas se llaman por lo que son, no por lo que el asistente sabe hacer

**Decisión de Jose, 21 de septiembre de 2026:** *«que no haya "simplificaciones" excesivas como
llamar a las skills "Lo que sabe hacer" y esas tonterías»*.

La tabla de arriba había ido derivando hacia perífrasis sobre el asistente: *Lo que sabe hacer*,
*Lo que le has dado*, *Lo que ha hecho*, *Puede aprender*, *Ya sabe*, *Ayudantes*, *Procesos con un
clic*, *Con quién hablas*. Cada una parecía más amable que la palabra de verdad, y juntas hacían
imposible atar lo que se oye en clase —skill, comando, agente— con lo que se lee en la barra.

Tres consecuencias, que valen para todo lo que se escriba a partir de ahora:

1. **Una clase de cosa se nombra por su nombre**, en español, con el término de RSC entre paréntesis
   cuando en clase se dice en inglés: **Habilidades (skills)** · **Comandos** · **Agentes** ·
   **Conexiones (tools)** · **Conocimiento (wiki)**. Ni «ayudantes», ni «botones», ni «procesos».
2. **Una cosa concreta se nombra por su nombre**, no por una frase sobre lo que hace: la habilidad
   `invoicing` es **Facturación**, no «llevar tus facturas de principio a fin»; el agente
   `refuter-security` es **Revisor de seguridad**. Lo que hace va en la (i), en una frase. Y el
   identificador de verdad también, porque es lo que se escribe para invocarla: *Se escribe
   `/unslop`*.
3. **Lo que está instalado se ve.** Las 27 habilidades que el arnés monta para funcionar estaban
   escondidas bajo la palabra «fontanería»; ahora salen plegadas bajo *Las del arnés*, con su nombre
   en español. Esconder no es simplificar: es mentir sobre lo que hay.

Los nombres de las habilidades, los comandos y los agentes que trae RSC viven en
`extension/media/nombres.json`; los del catálogo que se puede añadir, en `extension/media/capacidades.json`.
Son tablas: renombrar es cambiar una línea.

## Palabras prohibidas

Estas no aparecen nunca en la interfaz, ni en un tooltip, ni en un mensaje de error:

terminal · consola · shell · CLI · repositorio · commit · branch · push · pull · merge ·
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
