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
| una credencial que es un fichero entero y no una línea (`.json` de cuenta de servicio, `.pem`, `.p12`, `.key`) | Un fichero de acceso |
| un `*-service-account.json` / `credentials.json` de Google | Una cuenta de servicio de Google (en la (i); el rótulo dice «fichero de acceso») |
| un `.pem`, `.p12`, `.key` | Un certificado digital (nunca «clave privada»: es jerga y choca con «clave de acceso») |
| `01-TOOLS/<X>/keys/` | (no se nombra la carpeta: se dice «en su sitio» o «fuera de sitio») |
| una herramienta que se autentica con un fichero y no con claves | Con su fichero de acceso |
| una clave exportada en el entorno del ordenador | Puesta en tu ordenador, fuera de esta carpeta |
| un proveedor que se deduce de las claves sueltas y no tiene carpeta | Por montar |
| decir que la barra se equivocó al repartir las claves, o que están bien donde están | Esto no está bien · «Esto lo saco del nombre de cada una, así que puedo equivocarme» |
| una lista larga que no cabe | · Y 114 más. Las ordena todas de una vez (nunca esconderlas sin decir cuántas son) |
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
| lo que el arnés hace solo sin parar nada (`session-start`, `worklog-checkpoint`, `userprompt-gate`, `worktree-reaper`, la memoria, `context7`, y los avisos del arranque) | Lo que hace solo, sin parar nada (dentro de Lo que se comprueba solo) |
| `session-start.mjs` | La brújula al empezar |
| `worklog-checkpoint.mjs` | El aviso del diario |
| `userprompt-gate.mjs` (`.no-feature-gate`) | La puerta antes de construir |
| `worktree-reaper.mjs` (`.no-worktree-cleanup`) | Recogida de copias de trabajo |
| `session-memory.mjs` | La memoria entre conversaciones |
| el MCP `context7` (`.no-context7`) | Documentación al día (context7) |
| el aviso de `rsc audit` (`.no-audit`) | La revisión periódica de habilidades |
| el aviso de dos arneses (`.no-scope-check`) | El aviso de arnés duplicado |
| el aviso de `CLAUDE.md` largo (`.no-claudemd-check`) | El aviso de reglas demasiado largas |
| el aviso de carpeta sin git (`.no-git`, que el asistente crea cuando alguien le dice que no); se nombra solo apagado | El aviso de carpeta sin copias |
| el aviso de preparar el arnés (`.no-harness`: sin perfil, que arranque `init`; en un clon, que ofrezca montarlo). No apaga el arnés; se nombra solo apagado | El aviso de preparar el arnés |
| el aviso de versión nueva del arnés (`RSC_NO_UPDATE_CHECK`, que pone la barra al abrirse, C4) | El aviso de versión nueva · apagado: Apagado a propósito: aquí va la versión de tu clase |
| un asistente al que RSC no le engancha ninguno (todo lo que no es Claude) | Tu asistente no trae frenos: solo se le enganchan a Claude (en Lo que se comprueba solo, y al cambiar de asistente) |
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
| con qué asistente se habla en esta carpeta (se elige en la barra, y va aparte de los `targets` de `.rsc.json`, E1) | Tu asistente |
| el subapartado de personalización | Cómo quieres que trabaje |
| `permissions.defaultMode` de Claude | Qué puede hacer sin preguntarte |
| `plan` / `default` / `acceptEdits` | Que me lo proponga antes · Que me pregunte al cambiar algo · Que cambie ficheros sin preguntar |
| guardar en git con un reloj | Cada cuánto guarda solo |
| `Goals` y `Constraints` del perfil | Para qué es esto · Los límites que pusiste |
| borrar un documento sin leer | Quitar |
| borrar uno ya leído, con lo que aprendió de él | Quitar algo que ya ha leído |
| los scripts de una herramienta | Consultas (dentro de cada programa) |
| `.claude/commands/` con `boton:` | Comandos (los que llevan botón salen arriba) |
| un asistente sin carpeta de comandos (Codex) | Tu asistente no trabaja con comandos (en Comandos) · Tu asistente no trabaja con botones (en Acciones rápidas) |
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
| `02-DOCS/audits/audit-*.html` (lo que escribe `rsc audit`) | La última revisión del asistente · Abrir la revisión |
| `02-DOCS/wiki/sdd/verifications/` | Qué se ha comprobado |
| `02-DOCS/wiki/sdd/decisions.md` | (se enseña junto a las otras, en Decisiones) |
| `rsc onboard` en una carpeta nueva | Preparar esta carpeta |
| `--project-kind`, al preparar la carpeta | ¿De qué va esto? · Llevar el día a día · Crear cosas · Construir algo · Estudiar un tema a fondo · Un poco de todo |
| qué abarca la carpeta (`alcance:` del perfil; no se le manda al arnés) | ¿Qué vas a llevar en esta carpeta? · Una tarea concreta («Preparar un informe, ordenar unos papeles, una web de una página») · Un proyecto («Algo con principio y fin: un lanzamiento, una web con reservas, un estudio») · Un departamento o un área («Lo de todos los días de un equipo: facturación, personal, marketing») · La empresa entera («Todas las áreas a la vez: ventas, facturas, personal, clientes») |
| cuánta gente hay detrás (`personas:` del perfil; no se le manda al arnés) | ¿Cuántas personas están metidas en esto? · Solo yo · De 2 a 10 · De 11 a 50 · Más de 50 |
| `--software-scope` (`small` · `growing` · `complex`), con «Construir algo» y con «Un poco de todo» | ¿Qué vas a construir? · Una cosa concreta («Una landing, una web de una página, un aviso por correo») · Algo que irá sumando piezas («Una web con reservas, automatizaciones que se hablan entre sí») · Una plataforma completa («Con usuarios, varios idiomas y panel de administración») · No lo sé todavía («Empiezo sencillo, y si crece ya se ajusta») · y, solo con «Un poco de todo», la primera: Nada, o casi nada («Aquí no voy a hacer webs ni automatizaciones») |
| `--technical-level`, al preparar la carpeta | ¿Qué tal te manejas con el ordenador? · Lo justo · Me defiendo · Programo, o he programado |
| `--accompaniment`, al preparar la carpeta | ¿Cuánto quieres que te explique? · los cuatro escalones de Cómo te habla, con sus mismas frases: Al grano · Corto · Te explica por qué · De la mano (un dial, un nombre) |
| el nombre, según lo que lleve la carpeta | ¿Cómo llamamos a esta tarea? · ¿Cómo se llama el proyecto? · ¿Cómo se llama el departamento o el área? · con «La empresa entera», una sola caja: ¿Cómo se llama tu empresa? |
| lo que lleva la carpeta y cuánta gente hay, en el primer mensaje al asistente | En esta carpeta llevo un departamento o un área, y somos de 11 a 50 personas. · …y solo estoy yo. |
| el resto del primer mensaje al asistente (se ve en la caja antes de mandarlo) | en una carpeta de alguien: «La carpeta ya tenía cosas de antes: mira qué hay antes de tocar nada.» · a todos: «Completa conmigo el perfil: a qué me dedico, qué herramientas uso y qué no se puede tocar.» · «En esta carpeta hay freno ante órdenes peligrosas.» o «En esta carpeta no hay freno ante órdenes peligrosas: antes de una orden que borre o deshaga algo, pregúntame.» · «Pregúntame de una en una.» |
| la constitución que el plan pide y todavía no está (`floorPaths` del recibo) | Innegociables · «Faltan, y el arnés los pide para lo que vas a construir» · Que termine de prepararlo |
| el aviso al terminar de montar, con el suelo a medias (nunca «listo»: eso es cuando el arnés también lo da por listo) | {nombre} ya está montado. Al terminar te enseño lo que falta. |
| «El asistente, montado aquí», en Qué falta por montar | Listo, desde el 18 de septiembre · y con los innegociables por escribir: Montado, desde el 18 de septiembre |
| la carpeta personal abierta como carpeta de trabajo (no se prepara) | Esta es tu carpeta personal · «Esta es tu carpeta personal: si la preparo, el asistente tendría a mano todo tu ordenador. Crea una carpeta aquí dentro y trabaja en ella.» · Crear una carpeta aquí dentro |
| la raíz del disco, una carpeta del sistema o una que contiene la personal (no se prepara) | Esta carpeta es del sistema · «Esta carpeta es del sistema: aquí no preparo nada. Crea una carpeta en tu carpeta personal y trabaja en ella.» · Crear una carpeta en tu carpeta personal |
| Escritorio, Documentos o Descargas enteras (se pregunta antes) | «Vas a preparar tu carpeta de {Documentos} entera. Mejor una carpeta dentro, solo para esto.» · Crear una carpeta aquí dentro · Prepararla entera |
| montado sin git porque eligió seguir sin copias, en Qué falta por montar | Copias de seguridad aquí · Sin copias, porque lo elegiste · Ponerlas ahora · con git en el ordenador y sin historial en la carpeta: Todavía sin copias · al ponerlas: «Ya hay copias. La primera es el punto de partida.» · si no se puede: «No he podido preparar las copias. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| lo que RSC va a tocar de una carpeta que ya era de alguien (sus «Managed paths» que ya existen) | «Aquí ya hay cosas tuyas. Para montar el arnés voy a tocar esto: {lista}. No borro nada tuyo.» · sin nada suyo que tocar: «Aquí ya hay cosas tuyas. Para montar el arnés solo añado cosas: no toco nada tuyo.» · con solo algo que se llama igual, eso es lo que se toca: «… voy a tocar esto: la habilidad «review». No borro nada tuyo.» · la lista: la lista de lo que no entra en git · los ajustes de Claude de esta carpeta · Cómo se trabaja aquí · el perfil y las decisiones del arnés · el fichero {nombre} · Sí, móntalo encima · No, déjalo |
| una habilidad, un comando o un agente suyo con el mismo nombre que uno del arnés | en el resumen: «Y hay {N} cosas tuyas que se llaman igual que unas del arnés: la habilidad «review» y el comando «checkpoint». Ahora te pregunto qué hago con ellas.» (con una: «Y hay una cosa tuya que se llama igual que una del arnés: … Ahora te pregunto qué hago con ella.») · con varias: «Tienes {N} cosas tuyas que se llaman igual que unas del arnés: {lista}.» · Cambiarles el nombre a todas · Elegir una a una · No montar nada |
| el choque de una habilidad (RSC pone la suya encima y guarda la de la persona) | «Ya tienes una habilidad que se llama «{id}», igual que una del arnés.» · «Si le cambias el nombre, la tuya pasa a llamarse {id}-propia. Si la del arnés ocupa su sitio, la tuya queda en las copias que guarda el arnés.» · Cambiarle el nombre a la mía · Que la del arnés ocupe su sitio · No montar nada |
| el choque de un comando o un agente (RSC deja el de la persona y no pone el suyo) | «Ya tienes un comando que se llama «{id}», igual que uno del arnés.» (o «un agente») · «Si le cambias el nombre, el tuyo pasa a llamarse {id}-propio y se pone también el del arnés. Si lo dejas, el tuyo se queda como está y el del arnés no se pone.» · Cambiarle el nombre al mío · Dejar el mío · No montar nada |
| lo que se renombró, al terminar | «Tu habilidad «review» ahora se llama «review-propia».» · si no se pudo: «No he podido cambiarle el nombre a «{id}», así que no he montado nada. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| lo que se promete antes de montar sobre lo de alguien | «Antes de tocar nada te enseño qué cambia, y no se monta sin tu sí.» · «Tu historial lo dejo como está.» |
| una carpeta dentro de otro proyecto (un `.git` o un `.rsc.json` más arriba) | «Esta carpeta está dentro de otro proyecto, «{nombre}». Si la preparo, sus copias irán aparte.» · Prepararla igual · Elegir otra carpeta |
| varias carpetas abiertas en la misma ventana | «Trabajo con «{nombre}», la primera de las carpetas abiertas.» |
| en una carpeta empezada, lo que se sugiere al preparar | en «¿De qué va esto?», la que parece va primera: «Lo que parece que hay aquí · …» · en «¿Qué te gustaría resolver primero?», la primera: Seguir con lo que ya hay |
| ningún asistente instalado en el ordenador, al preparar | «No tienes ningún asistente en este ordenador. ¿Cuál pongo?» · Poner Claude · Poner Codex · si no se puede: «No he podido poner {Claude}. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| el punto de partida que no se pudo guardar | «No he podido guardar el punto de partida. Lo demás está listo. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| volver a montar con un plan que cambia lo que se instala (decisión 95: aceptar un plan es una firma) | «El arnés quiere cambiar lo que tiene montado: {lista}. ¿Lo acepto?» · la lista: añadir …, quitar … · Sí, acéptalo · No, déjalo como está · lo que se nombra: trabajar por pasos (especificar, planificar y hacer) · las comprobaciones antes de cada orden · los agentes que revisan · Formato al guardar en git · La memoria entre conversaciones · el perfil y las decisiones del arnés · cada habilidad y cada agente por su nombre, juntos: las habilidades «Depurar» y «Revisar» · los agentes «Desarrollador» y «Revisor de corrección» |
| el nombre de la carpeta nueva | Crear una carpeta · «¿Cómo se llama la carpeta nueva? Es donde vas a trabajar.» · Contabilidad · Marketing · el proyecto que sea · si no vale: «Ese nombre no vale para una carpeta: sin barras ni símbolos.» · si no se puede: «No he podido crear la carpeta. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| los enganches del arnés y el `node` que los arranca (el relevo), en Qué falta por montar (nunca se dice *Node*) | Lo que el arnés hace solo · Listo · No arranca en este ordenador · Arreglarlo · al arreglarlo: «Cierra la conversación con Claude y ábrela otra vez para que lo coja.» · si no se puede: «No he podido arreglarlo. Pulsa «Algo va mal» y pásale el código a tu tutor.» · el paso del montaje: dejando listo lo que el arnés hace solo… |
| el freno propio sin enganchar, en una carpeta cuyo historial no creó la barra (C-4: toca sus ajustes y se pide antes), en Qué falta por montar | Freno ante órdenes peligrosas · «Todavía no: toca los ajustes de Claude de esta carpeta» · Ponerlo ahora · al ponerlo: «Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.» · si no se puede: «No he podido ponerlo. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| de quién es el freno ante órdenes peligrosas, en Las reglas (C1: RSC solo lo pone con la cadena SDD, y si no lo ponen los raíles) | Freno ante órdenes peligrosas · detrás de lo que hace: «Lo pone Executive Lab: el arnés no lo trae en esta clase de proyecto.» o «Lo pone el arnés.» · sin enganchar todavía: «Todavía no: toca los ajustes de Claude de esta carpeta» |
| los raíles de la barra en la carpeta, en Qué falta por montar (ya salían; además, lo que carga `siempre.md` en cada conversación —con Claude, el bloque de `CLAUDE.md`; con los demás, el trozo de su fichero de siempre—, que en una carpeta de alguien espera a su sí) | Lo que pone la barra · Puesto · Puesto, pero de una versión anterior de la barra · Falta ajustarlo a esta carpeta · Ponerlo al día · Ajustarlo ahora · al pulsarlo, sin el bloque: «Aquí ya hay cosas tuyas. Voy a tocar esto: Cómo se trabaja aquí. No borro nada tuyo.» · Ajustarlo ahora · No, déjalo · con el no: «No he tocado nada. Cuando quieras, el botón sigue aquí.» · con el sí, con Claude: «Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.» · con otro: «Ya está.» |
| una carpeta montada con una versión del arnés más nueva que la de la clase (B5, C-10), en Qué falta por montar | La versión del arnés · «Esta carpeta se montó con una versión del arnés más nueva que la de tu clase.» · Ponerla como la de la clase · antes, si las hay: «Se quitarán estas habilidades, que la versión de tu clase no trae: {lista}.» · mientras: «Poniéndola como la de la clase…» · con el no: «No he tocado nada. Cuando quieras, el botón sigue aquí.» · si no se puede: «No he podido ponerla como la de la clase. Pulsa «Algo va mal» y pásale el código a tu tutor.» · con lo que sobra en el plan, lo de volver a montar: «El arnés quiere cambiar lo que tiene montado: {lista}. ¿Lo acepto?» · al terminar, con Claude: «Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.» · con otro: «Ya está.» · al pulsar una de Sugerencias del catálogo en esa carpeta: «Esta carpeta se montó con una versión del arnés más nueva que la de tu clase. Antes de añadir nada, pulsa «Ponerla como la de la clase» en Qué falta por montar.» |
| cambiar de asistente a uno para el que la carpeta no está montada (E1: se prepara también para él, y lo del otro se queda donde estaba), en Tu asistente | antes de pulsar: «Esta carpeta no se montó para él: al cambiar, la preparo también para él.» · mientras: «Preparando esta carpeta para {Codex}…» · al terminar: «Hecho. A partir de ahora los botones hablan con {Codex}.», y lo de los frenos · si no se pudo: «No he podido prepararla para {Codex}. Pulsa «Algo va mal» y pásale el código a tu tutor.» · si toca algo de alguien, antes, lo de montar sobre lo suyo («Aquí ya hay cosas tuyas. Para montar el arnés voy a tocar esto: {lista}. No borro nada tuyo.», y cada cosa que se llama igual) · con el no: «No he tocado nada. Cuando quieras, el botón sigue aquí.» · con otro nombre, al terminar: «Tu habilidad «{id}» ahora se llama «{id}-propia».» · en una carpeta más nueva que la de la clase: «Esta carpeta se montó con una versión del arnés más nueva que la de tu clase. Antes de cambiar de asistente, pulsa «Ponerla como la de la clase» en Qué falta por montar.» · sin dónde guardarlo: «No he podido guardarlo. Pulsa «Algo va mal» y pásale el código a tu tutor.» · con el de ahora sin montar, en una carpeta montada para otro: «Esta carpeta no se montó para él.» · Prepararla también para {Claude} |
| guardar en git con una credencial suelta que git no seguía (F1: se deja fuera de la copia), al terminar de guardar | «Copia guardada. Había {N} cambios. No he metido «{.env}» en la copia: es un fichero de claves de acceso y no debe salir de este ordenador.» · con otros ficheros: «…es un fichero de acceso…» · con varios: «No he metido «{a}», «{b}» y «{c}» en la copia: son ficheros de acceso y no deben salir de este ordenador.» · botón Ponerlo en su sitio · con varios: Ponerlos en su sitio |
| la prueba de una conexión falla porque una clave se escribió sin comillas y la prueba la lee mal (F3; las que guarda la barra ya van bien) | «Una clave de esta conexión tiene caracteres que la prueba lee mal. Pégala otra vez y guárdala: ahora la guardo bien.» |
| una consulta o la prueba de una conexión que necesita Python, y en el ordenador no hay (F4) | «Esta consulta necesita Python, y en este ordenador no está.» · la prueba: «Esta prueba necesita Python, y en este ordenador no está.» · botón Pedírselo al asistente |
| los comandos por lenguaje que monta el arnés, `<habilidad>-review` y `<habilidad>-build` (G5), entre los del arnés; delante va la habilidad, y lo hace el ayudante que RSC nombra en su descripción | Revisar el código de {FastAPI} · Arreglar la compilación de {Go} · la frase: «Le pasa al revisor de {React} los cambios, para que señale fallos sin tocar nada.» · las habilidades, por su nombre: Next.js · Spring Boot · Kotlin para Android · Swift para iOS · Vue y Nuxt · C# y .NET · Laravel · PostgreSQL · aprendizaje automático |
| lo que dice «Algo va mal» al terminar de revisar (nunca «tu empresa»: puede ser un departamento) | «He mirado y está todo bien.» · con algo roto: «He encontrado algo y puedo intentar arreglarlo.» · si el diagnóstico del arnés no se puede leer: «No he podido revisarlo entero.», sin botón de arreglar si no hay nada que arreglar |
| una carpeta sin arnés, en la pantalla principal (A8: cuántas preguntas, contadas por `rumbo`) | «Puedo preparar esta carpeta. Tarda unos minutos, y antes te hago entre {9} y {12} preguntas, de una en una.» |
| algo falla y se manda a «Algo va mal» (H4: antes «Prueba con "Algo va mal"», que no decía qué hacer con el código), en cualquier aviso | «No he podido {guardarlo}. Pulsa «Algo va mal» y pásale el código a tu tutor.» |
| la marca de su web no se puede usar porque encima no se lee nada, en Tu marca | «No he podido usar lo que hay: con ese fondo no se lee nada encima. Pídele al asistente uno más claro o más oscuro.» |
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
6. **Nada de plurales con paréntesis.** «3 cosa(s)» suena a formulario: se escribe la frase de uno y la de
   varios, «1 cosa declarada que no está» y «3 cosas declaradas que no están». Lo vigila una prueba.

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
