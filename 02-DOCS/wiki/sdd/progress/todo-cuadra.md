---
type: progress
title: Progreso — todo-cuadra
description: Registro de solo añadir, una línea por tarea, con su evidencia observada. Sobrevive a una compactación.
timestamp: 2026-09-24T16:50:00Z
topic: sdd
slug: todo-cuadra
---

# Progreso — todo-cuadra

Rama `todo-cuadra`, desde `main` (2b139bc). Plan: [../plans/todo-cuadra.md](../plans/todo-cuadra.md).
Solo se añade.

## F0

- **T001 ✓** 24-09 · `ListAgents` sin sesiones de `interfaz-arnes` (las dos de hoy, `-0a` y `-5c`,
  ya habían terminado) · `git switch -c todo-cuadra` desde `main` = `origin/main` = 2b139bc ·
  `git status --short` vacío.
- **T002 ✓** 24-09 · Línea base:
  - `node extension/prueba/humo.js --con-arnes` → **198 comprobaciones pasadas**, código 0.
    Salen dos «SALTADA»: «el motor de JavaScript sigue sirviendo de resto» y «cada capacidad que
    ofrecemos existe en el catálogo de verdad». La segunda es la prueba muerta de H2: mira un
    manifiesto que no existe.
  - `node extension/prueba/empresas-distintas.js` → «las tres empresas, enteras».
  - `node docs/comprobar-diccionario.js` → «27 palabras prohibidas · 47 ficheros y 45 rótulos
    revisados · Todo el texto de pantalla respeta el diccionario».
  - `node herramientas/revisar-powershell.js` → «4 ficheros revisados, sin pegas».
  - `git log 2b139bc..` vacío: ningún hallazgo arreglado por otra sesión desde la auditoría. C3
    queda mitigado por 2b139bc (`--skip-worktree`).
- **T003 ✓** 24-09 · Escritas la propuesta, la spec, `clarify`, el plan y las tareas:
  - `spec-gate.js specs/todo-cuadra.md` → PASS, con 10 puntos tipados;
  - la revisión con ojos frescos encontró diez cosas, y se arreglaron todas (C-13 a C-20);
  - P4 enmendada en la constitución (decisión 3 de Jose).
- **T004 ✓** 24-09 · `analyze`:
  - primera pasada BLOCKED, con 1 alto contra P4, 8 medios y 6 bajos;
  - todo se resolvió en `tasks`: T076 y T077 son nuevas, y hay catorce comprobaciones afinadas;
  - segunda pasada **GATE: PASS**, en `analysis/todo-cuadra.md`.
- **T005 ⏸** 24-09 · Parada de vocabulario: la lista está en la spec («Vocabulario propuesto»), a la
  espera del sí de Jose.
- **T005 ✓** 25-09 · Jose contestó en cuatro rondas:
  - gitmoji apagado en las carpetas de alumno;
  - la puerta SDD se queda;
  - tres preguntas fáciles en vez del tamaño (C-21), con el recorrido entero a decisión del
    programa;
  - los demás textos con su criterio, y las pantallas se le enseñan al cerrar cada fase (C-22).

  La spec, el plan (§3, §4, T008, T010) y `sdd/decisions.md`, al día. Se añade el criterio A13.
- **T006 ✓** 25-09 · Commit b49735c, «Todo cuadra: la auditoría entera, y el plan para arreglarla»:
  - decisión 116 en `docs/decisiones.md`, su resumen en `harness/decisions.md` y el worklog
    `2026-09-25-todo-cuadra-la-auditoria.md`;
  - toca once ficheros, todos de `02-DOCS/` y `docs/`, y ningún código.

  **Corrección:** el mensaje del commit dice «spec con 58 criterios» y son **61** (`grep -cE
  "^- \*\*[A-I][0-9]+\.\*\*"` sobre la spec). El commit no se enmienda: la cuenta buena queda aquí.

## F1

- **T007 ✓** 25-09 · Nueve filas nuevas en `docs/diccionario.md`, junto a «Preparar esta carpeta»:
  - las tres preguntas nuevas, con sus respuestas y sus ejemplos;
  - las tres que ya se hacían y no estaban (de qué va, cómo te manejas, cuánto te explico), y esta
    última con los cuatro escalones de «Cómo te habla»;
  - el nombre según lo que lleve la carpeta, la frase del primer mensaje y la pieza de los
    Innegociables que falten.

  `dicc` → «27 palabras prohibidas · 47 ficheros y 45 rótulos revisados · Todo el texto de pantalla
  respeta el diccionario».
- **T008 ✓** 25-09 · `extension/prueba/contrato.js`, nuevo. Juega el arranque de verdad
  (`entrevistar()` con el `vscode` falso), saca los flags con `arrancar.flagsDelMontaje()` —la misma
  función del montaje, extraída sin cambiar nada: `humo` siguió en 196— y le pide el plan en seco al
  RSC de dentro, en carpetas temporales. La carpeta personal, la configuración de git y el aviso de
  versión se desvían antes de cargar nada.
  - **Rojo**, código 1, en 2,8 s: «large no es un tamaño de RSC, que acepta small | growing |
    complex», «mixed sin tamaño: RSC lo exige y el arranque no lo pregunta» y «7 de 24 jugadas no
    dan plan» (las cinco de «Un poco de todo» con `RSC_ONBOARDING_REQUIRED`, y las dos de «Va para
    largo» con `RSC_ONBOARDING_INVALID`).
- **T009 ✓** 25-09 · Tres comprobaciones más en `contrato`, aplicando de verdad (0,4 s por montaje):
  - «sin la cadena SDD, el montaje queda listo»: rojo, «se ha leído como «undefined»»;
  - «un plan que practica SDD queda montado, aunque RSC diga que falta el suelo»: rojo en los tres
    casos, «RSC lo ha aplicado y la barra lo da por fallo»;
  - «si RSC deshace el montaje, la barra dice que no se ha podido»: la trampa es un fichero
    `.claude` donde van las habilidades, y RSC contesta de verdad con código 4 y
    `RSC_ONBOARDING_INCOMPLETE:` por la salida de errores. Rojo, «se ha leído como «undefined»».
- **T010 ✓** 25-09 · Las tres preguntas y el suelo a medias, juntos:
  - `rumbo`: fuera el cuarto tamaño; `CON_TAMANO = ['software', 'mixed']`; `alcance` y `personas`
    solo al montar de cero; `queConstruir` con `soloSi`.
  - `arrancar`: las tres tablas, el nombre según lo que lleva la carpeta (con «La empresa entera»,
    una caja y los dos nombres iguales), `alcance:` y `personas:` al perfil, y `primerMensaje()`
    extraído de `extension.js` con la frase nueva.
  - `rsc.comoAcaboElMontaje()`: las seis formas de `onboard --accept-plan`. El «a medias» exige la
    huella aceptada y la del recibo.
  - La pieza «Innegociables» en «Qué falta por montar», con el encargo, que nombra la fase
    `constitution`.
  - **Verde:** `contrato` 7/7, con 24 planes pedidos. `humo` 200, con las cuatro nuevas.
  - Dos pruebas de `humo` se reescriben porque exigían lo de antes: la lista de preguntas (ahora
    son nueve) y el RSC fingido que contestaba `RSC_ONBOARDING_READY abc`, que no es lo que escribe
    RSC.
  - `grep large` en `arrancar.js` y `rumbo.js`: nada.
- **T011 ✓** 25-09 · `humo` «un objetivo con & | ^ % " llega entero»: **rojo** («el objetivo viaja en
  claro») → verde. `flagsDelMontaje` manda `--goal-base64` en base64url, como lo escribe RSC. La
  prueba exige, además, que ningún flag lleve nada que cmd.exe interprete. En `contrato`, «un
  objetivo con cualquier carácter llega entero a RSC»: RSC lo devuelve igual en su línea de
  aceptación.
- **T012 ✓** 25-09 · Los cuatro escalones:
  - **rojo** en `contrato` («L0 (accompaniment): RSC lo ofrece y el arranque no») y en `humo` («no
    ofrece «Al grano»: Todo, paso a paso · Lo normal · Poco»);
  - `CUANTO_TE_EXPLICO` sale de `trato.ESCALONES`, del más acompañado al que menos;
  - la habilidad dice `L0 | L1 | L2 | L3` y nombra los cuatro escalones; las dos copias, iguales.

  Verde: `contrato` 9/9 y `humo` 202.
- **T013 ✓** 25-09 · `humo` «los raíles apagan el guardián de gitmoji con su porqué»:
  - **rojo** («los raíles no lo apagan») → verde;
  - la prueba le pasa al guardián del paquete un `git commit -m "Primera versión"` y mira que no
    deniegue; sin interruptor, el mismo commit se deniega, que es el control.

  En `humo+`, «con «irá sumando piezas» queda montado, y guardar en español no se deniega» monta de
  verdad y pasa por el guardián que RSC dejó en `.rsc/`. `humo+`: **206**, código 0, en 8 s.
  - *Desviación del plan (§4, paso 7):* `.no-gitmoji` se escribe siempre, no solo si el plan trae el
    guardián, porque `repair` lo monta aunque el plan no lo pida (C6).
- **T014 ✓** 25-09 · Verificación de F1, en `verifications/todo-cuadra-F1-2026-09-25.md`:
  - la batería entera y `humo+`, en verde: `humo` 204, `humo+` 207, `contrato` 9, las tres empresas,
    el diccionario y PowerShell;
  - quince mutaciones, y todas matan su prueba;
  - `contrato.js` entra en `config.yaml`, `npm run probar`, `publicar.sh` y `/revisar-la-barra`.

  Decisión 117, su resumen en `harness/decisions.md` y el worklog
  `2026-09-25-todo-cuadra-F1-el-arranque-monta.md`. La barra, a 0.33.0. Las pantallas pintadas,
  publicadas para Jose (C-22): https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre.
  - Al pintarlas salieron cuatro textos que ninguna prueba veía: «facturas.Después», dos «empresa»
    por defecto, «falta los innegociables» y «ya está listo» con el suelo a medias. Arreglados.
  - La revisión con ojos frescos corre sobre el commit; lo que encuentre, antes de F2.
  - **Queda para F8:** el título del comando en la paleta sigue siendo «Executive Lab: Empezar una
    empresa aquí».
- **Revisión de F1 ✓** 25-09 · *changes-needed*, 1 importante y 3 menores, todos comprobados en el
  código y aceptados:
  - alcance y personas se perdían al volver a montar, porque RSC reescribe el perfil entero;
  - «Listo» en la primera fila con los innegociables por escribir;
  - el nombre no lo sugiere cuánta gente hay;
  - el contrato del plan no era el publicado;
  - y, fuera de cuenta, `$&` en un nombre rompía el perfil.

  Tres pruebas en rojo primero y tres mutaciones (M16–M18). `humo` 205 y `humo+` 208. Lo de F2
  que ya estaba empezado (T015) se apartó en un *stash* para arreglar esto sobre F1.

## F2

- **T015 ✓** 25-09 · La guarda de carpeta (B1, C-5):
  - **rojo** primero con la función puesta como hoy, que no prohíbe nada: «/ (darwin): null !==
    'raiz'» y «Documentos» sin reconocer;
  - `terreno.queCarpetaEs()`, pura, con la lista cerrada de macOS, Linux y Windows, iCloud y
    OneDrive, y el sitio real resuelto; `mirar()` la añade a `carpeta`;
  - `rumbo`: rama `noSePrepara`, solo si no hay nada montado, antes incluso de preguntar por git;
  - `arrancar`: se explica y se ofrece «Crear una carpeta aquí dentro» (o «en tu carpeta personal»);
    con Documentos, el Escritorio o las Descargas enteras, se pregunta antes de escribir nada;
  - la pantalla principal lo dice antes de pulsar, con su botón (`crearCarpeta`).

  Verde: `humo` 206, con «la carpeta personal, la raíz del disco y las del sistema no se preparan» (12
  rutas que no, 4 que sí, y una carpeta personal de mentira) y «Documentos entera se pregunta». Un
  nombre como `../fuera` no crea nada.
- **T016 ✓** 25-09 · El clon real (B2, I3):
  - la prueba vieja, con un `.claude/skills` vacío que ningún `git clone` deja, se reescribe como
    «un clon como lo deja git clone cae en traer»: con `executive-lab`, los ajustes, el arranque de
    RSC y un comando, y sin `.rsc/` ni las habilidades de RSC. **Rojo**: «un clon se ve como
    «conArnes»»;
  - `terreno`: es clon si falta `.rsc/` (como lo llama RSC) o si no está en disco ninguna de las que
    RSC declara, descontando las propias;
  - tres fixtures de «arnés montado» no tenían `.rsc/`, que uno de verdad siempre tiene: se les
    pone;
  - en `humo+`, «un clon de verdad se reconoce y se trae»: se monta, se hace `git clone` sin red, y
    el clon cae en `traer`, no pregunta nada y queda montado.

  Verde: `humo` 207, `humo+` 211.
- **T017 ✓** 25-09 · «Seguir sin copias» se respeta (B3, y la parte de B7 que toca a la pieza):
  - **rojo**: «con la respuesta guardada se vuelve a parar»;
  - `rumbo`: con la respuesta guardada no hay rama `sinGit`; se monta sin `ponerGit` ni
    `puntoDePartida`;
  - `terreno`: con el arnés puesto y sin historial, la pieza de las copias dice «Sin copias, porque lo
    elegiste» (o «Todavía sin copias» si hay git) y ofrece «Ponerlas ahora»;
  - `arrancar.ponerLasCopias()`, y en la extensión `ponerCopias`, que pone git antes si falta.

  Verde: `humo` 208, con «con seguir sin copias, preparar monta sin copias y ofrece ponerlas», que
  además pulsa el botón con git y mira el punto de partida. La prueba vieja decía «y no se vuelve a
  preguntar» sin mirarlo; ahora lo mira la nueva.
- **T018 ✓** 25-09 · La carpeta de alguien (B4, C-2, C-3, C-9; decisión 3 de Jose; P4 enmendada):
  - medido antes con el paquete: RSC pone su habilidad encima de la de la persona (un enlace) y guarda
    la suya en `.rsc/backups/`; con los comandos y los agentes, si ya hay uno de la persona, lo deja y
    no pone el suyo. Así que «sobrescribir» solo existe con las habilidades;
  - **rojo**: «ha montado sin el sí» y «ha montado sin contestar al choque»;
  - `rsc.leerElPlanEnSeco()` lee la huella, la línea de aceptación, «Managed paths», «Selected» y el
    aviso de otro arnés;
  - `ajena.js`, nuevo: `resumen()` (lo suyo que se toca, en cristiano, y los choques) y
    `resolver()` (renombrar a `<id>-propia` o `-propio`, con su `name:`, y parar si no se puede);
  - `arrancar`: el sí con el resumen; con varios choques, «Cambiarles el nombre a todas» o «Elegir
    una a una»; con renombrados, el plan se vuelve a pedir; al terminar se dice cómo se llama ahora;
  - la pantalla y el permiso ya no prometen «No voy a tocar nada de esto» ni «se quedan donde están».

  Verde: `humo` 210, con «una carpeta ajena enseña qué se toca y no monta sin el sí» y «un nombre que
  choca se renombra o se sobrescribe, y sin respuesta no se monta». En `humo+` (215), sobre un
  proyecto con historial ajeno y su `review`: cuatro ficheros suyos iguales byte a byte, ningún commit
  nuestro, y `review-propia` intacta salvo el nombre.
  - Una aserción mía esperaba la huella «2…» y la buena era la «3…»: el RSC fingido seguía contando
    de la vuelta anterior. Se corrigió la aserción, no el código.
- **T020 ✓** 25-09 · De quién es el historial (B6, C-16; revisa la decisión 28):
  - **rojo**, con una identidad global de mentira («Ana García») por `GIT_CONFIG_GLOBAL`: «el
    historial que creó la barra se toma por ajeno (autor: Ana García)» y «el clon se toma por
    ajeno». La tercera, «en un historial ajeno la barra no guarda sola, y el botón sí guarda», ya
    pasaba: queda como guarda de C-16;
  - `terreno.historialAjeno()`: ya no mira los autores. Mira la marca local que deja la barra al
    crearlo (`executivelab.historial`) y, si no la hay, la raíz: si el primer commit es uno de los que
    escribe la barra (punto de partida o copia), nació aquí;
  - `prepararHistorial()` crea el historial con `guardar.iniciar()` (rama `main` e identidad de la
    barra solo en la carpeta) y deja la marca.

  Verde: `humo` 213. El `~/.gitconfig` de quien corre la prueba no se toca.
- **T021 ✓** 25-09 · Toda rama que monta deja historial (B7):
  - **rojo**: «otroArnes monta sin dejar historial»;
  - `rumbo.elegirRama()` antepone `ponerGit` a toda rama que escribe sobre una carpeta sin `.git`,
    salvo con «Seguir sin copias»; el punto de partida sigue solo en la carpeta vacía (decisión 28);
  - «la radiografía no dice copias sin .git» pasó a la primera: su arreglo entró con T017.

  Verde: `humo` 215, con las ocho ramas que montan (`desdeCero`, `encimaDeLoQueHay`, `otroArnes`,
  `traer`, `completar`, `sinRecibo`, `ponerAlDia`, `adoptar`).
- **T022 ✓** 25-09 · Un montaje nuestro a medias va a completar (B8):
  - **rojo**: «se ve como «otroArnes»»;
  - `terreno`: sin `.rsc.json`, si lo que hay lo dejó RSC y nada más, es `aMedias`, no `otroArnes`;
  - la pantalla principal ofrece «Terminar de prepararla» también sin `.rsc.json`.

  Verde: `humo` 216. Con un `CLAUDE.md` escrito por alguien al lado, sigue siendo de otro.
- **T023 ✓** 25-09 · Dentro de otro proyecto, y varias carpetas (B9):
  - **rojo**: «no se ve el proyecto de encima» y «no dice con cuál trabaja»;
  - `terreno`: `dentroDeOtro`, un `.git` o un `.rsc.json` más arriba, sin mirar la carpeta personal
    ni lo de encima de ella (hay quien versiona ahí su configuración);
  - `arrancar`: antes de escribir nada, «Esta carpeta está dentro de otro proyecto, «X». Si la
    preparo, sus copias irán aparte.», con «Prepararla igual» y «Elegir otra carpeta»;
  - con varias carpetas abiertas, las pantallas principales dicen «Trabajo con «X», la primera de las
    carpetas abiertas.» El `vscode` falso aprende a tener varias (`guion.otrasRaices`).

  Verde: `humo` 218. **No se ha tocado** lo del disfraz que escribe en el `.code-workspace` con
  varias carpetas: queda apuntado para F8.
- **T024 ✓** 25-09 · Volver a montar con lo de hoy (B11; D5 queda para T044):
  - **rojo**: «el dial vuelve al del primer día» (`L3` en vez de `L1`), y la segunda enseñó otro
    fallo: con recibo, `completar` no preguntaba nada aunque el recibo trajera un valor que RSC no
    acepta, y mandaba `L9`;
  - `entrevistar()`: con recibo, el dial y las palabras del perfil de hoy (`trato.leer()`, que ahora
    se exporta) y los asistentes declarados hoy mandan sobre el recibo; lo que se conteste en ese
    montaje manda sobre todo;
  - `rumbo`: `completar` pregunta lo que en el recibo no vale, y nada más (los nombres, no).

  Verde: `humo` 220, con «completar conserva el dial cambiado y los asistentes añadidos» y «si en ese
  montaje se cambia el dial, gana el nuevo».
- **T025 ✓** 25-09 · Lo que se sugiere en una carpeta empezada (A5):
  - **rojo**: «sale primero «Llevar el día a día»»;
  - las preguntas reciben lo que se ve de la carpeta: si parece un proyecto de software, «Construir
    algo» va primero («Lo que parece que hay aquí · …»); en una carpeta de alguien, el primer objetivo
    es «Seguir con lo que ya hay». En una vacía, lo de siempre.

  Verde: `humo` 221.
- **T026 ✓** 25-09 · El primer mensaje y los encargos (A6, A7):
  - **rojo**: el mensaje era el de antes, y no había por dónde llegar cada encargo;
  - `primerMensaje()`: en una carpeta de alguien, «La carpeta ya tenía cosas de antes: mira qué hay
    antes de tocar nada.»; a todos, «Completa conmigo el perfil: a qué me dedico, qué herramientas uso
    y qué no se puede tocar.», si hay freno o no, y «Pregúntame de una en una.»;
  - `COMO_SE_ENTREGA`: `ordenarLaCarpeta` y `ordenarLasClaves` van en el primer mensaje, con su
    contrato, calculado al montar (`paraElMensaje`); `levantarElSuelo`, como pieza con su botón;
  - `hayFreno()` lee el freno como «Las reglas»; la extensión ya no arma aparte el párrafo de las
    claves.

  Verde: `humo` 223. `grep` de «de una pregunta en una pregunta» en `extension/`, `skills/` y los
  README: nada.
- **T027 ✓** 25-09 · Sin ningún asistente, ofrecer ponerlo (A9):
  - **rojo**: «no se pregunta cuál poner»;
  - `preguntarAsistente()`: sin ninguno instalado, «No tienes ningún asistente en este ordenador. ¿Cuál
    pongo?», con «Poner Claude» y «Poner Codex», que lanzan `workbench.extensions.installExtension`;
    sin contestar, no se sigue preparando.

  Verde: `humo` 224.
- **T028 ✓** 25-09 · Un punto de partida que falla se dice (B10):
  - **rojo**: «un punto de partida que no se guarda se da por bueno»;
  - `puntoDePartida` mira el resultado; si falla, el paso devuelve su `pega` y el montaje sigue;
    `hacerLosPasos` las junta en `pegas`, y la extensión las enseña con su «Algo va mal»;
  - «Ponerlas ahora» (T017) también lo dice si el punto de partida falla.

  Verde: `humo` 225.
- **T029 ✓** 25-09 · Volver a montar no firma por nadie (A12, decisión 95):
  - **rojo**: «se ha aceptado sin el sí»;
  - `rsc.cambiosDePolitica()` compara lo que entra y sale de «Selected» con las decisiones del recibo;
    si solo cambió la huella, no hay nada que preguntar. Un recibo sin decisiones no se compara;
  - `arrancar`: «El arnés quiere cambiar lo que tiene montado: añadir …; quitar …. ¿Lo acepto?», con
    cada pieza en cristiano (la cadena SDD es «trabajar por pasos», cada habilidad por su nombre), y
    sin el sí no se acepta.

  Verde: `humo` 226.
- **T030 ✓** 25-09 · La sombra se descuenta de principio a fin (B12):
  - **rojo**: «lo escrito debajo no cuenta como suyo», con la sombra de verdad sacada del paquete
    (`SHADOW_BODY`);
  - `terreno`: se descuenta la plantilla de la sombra (marca, título, las dos frases fijas y su
    comentario), no hasta el final del fichero;
  - la prueba vieja usaba una sombra inventada; ahora usa la de RSC.

  Verde: `humo` 227. Lo mismo con el bloque nuestro de `CLAUDE.md` queda para F4 (T040), que es
  donde nace.
- **T031 ✓** 25-09 · Verificación de F2, en `verifications/todo-cuadra-F2-2026-09-25.md`:
  - la batería entera y `humo+`, en verde: `humo` 227, `humo+` 232, `contrato` 9, las tres empresas,
    el diccionario y PowerShell;
  - veintidós mutaciones. La N4 sobrevivía, porque la regla «sin `.rsc/`» no la miraba nada por sí
    sola; se añadió el caso de los enlaces colgando, y ahora muere.

  Decisión 118 (revisa la 28), su resumen, el worklog `2026-09-25-todo-cuadra-F2-las-carpetas.md`
  y la barra a 0.34.0.
- **Revisión de F2 ✓** 25-09 · *changes-needed*, con 2 críticos, 4 importantes y 18 menores. Los
  críticos y los importantes se comprobaron en el código y se aceptaron todos:
  - **C1**: la carpeta personal con restos de un montaje, a medias y sin `.rsc.json`, se completaba;
  - **C2**: la pantalla del plan que cambia salía en inglés con las claves de verdad de RSC;
  - **I1**: en una carpeta de alguien, el `git init` iba antes del sí;
  - **I2**: `/etc`, `/var` y `/tmp` de macOS pasaban por no resolver la lista del sistema;
  - **I3**: la prueba de T029 fingía una clave que RSC no da;
  - **I4**: renombrar escribía a través de un SKILL.md enlazado.

  Y tres menores: m10, «no toco nada tuyo» con un choque; m12, «porque lo elegiste» sin elegirlo; y m7,
  dos frases sin diccionario. Los otros quince, anotados para F9.

  Siete pruebas nuevas o reescritas, en rojo primero, y una comprobación nueva en `contrato.js` contra
  el paquete. Once mutaciones: dos sobrevivían (R3 y R5b) y se afinaron las pruebas; R6 contra
  `contrato` sobrevive con razón. `humo` 231, `humo+` 236 y `contrato` 10. El trabajo de F3 (T032–T034)
  se apartó en un *stash* para arreglar esto sobre F2.

## F3

- **T032 ✓ (1) · ⏸ (2) y (3), con Jose** 25-09 · El experimento del relevo (C2, decisión 4 de Jose):
  - **(1) rojo** con el módulo puesto como hoy, sin relevo («ninguno»), y **verde**: `relevo.js`,
    nuevo. Si no hay un `node` en el PATH, deja en el almacén de la barra un `node` (un guion `sh`,
    y un `node.cmd` en Windows) que llama al Node de VS Code con `ELECTRON_RUN_AS_NODE=1`, y antepone
    su carpeta al PATH. `ELECTRON_RUN_AS_NODE` va dentro del relevo, nunca en el entorno del
    anfitrión. Con un PATH sin `node`, un enganche corrido como los corre Claude Code (`sh -c 'node
    …'`) funciona. Con un `node` de verdad, no se toca nada. `humo` 228.
  - Se pone al activar la barra (`relevo.ponerAlActivar()`), antes de que se abra el chat.
  - **(2) no se ha corrido:** `npm run probar-en-vscode` baja unos 900 MB de VS Code a
    `~/.cache/executive-lab-vscode-test`, fuera del proyecto, y eso no se hace sin el sí de Jose.
    Queda en pendientes con su orden, junto a (3): en una sesión de Claude abierta desde la barra,
    que `which node` dé el relevo y que se deniegue un `rm -rf`.
  - **Decisión (a), el relevo, y no el plan B.** Con (1) en verde, lo que queda por medir es si el
    proceso del asistente hereda el PATH del anfitrión, y eso es cómo se comporta Node con
    `process.env`, no una suposición sobre el relevo. El plan B —bajar el Node oficial— también
    escribe fuera del proyecto y necesita red. Si (2) o (3) salen mal, se pasa al plan B.
- **T033 ✓** 25-09 · Sin rutas en el ajuste que viaja en git, y la pieza de lo que el arnés hace
  solo (C2, C3, F5):
  - **rojo**, cinco. Dos reescriben las que daban por bueno el fallo: «un enganche que apunta al
    ordenador de otro se arregla» (escribía nuestra ruta) y «el arreglo de cada máquina deja de
    contar como un cambio suyo» (exigía la marca). Las nuevas: «tras montar, el ajuste versionado es
    igual que en HEAD y sin marca», con un instalador de mentira delante (`EXECUTIVE_LAB_HOME`),
    que es el caso en que se escribía la ruta, y roja porque entraba en el punto de partida; «sin
    node y sin relevo posible, la pieza Lo que el arnés hace solo dice No arranca en este ordenador,
    con su botón»; y «Arreglarlo pone el relevo y pide abrir otra vez la conversación».
  - **verde**: `enganches.js` ya no escribe rutas. `devolverElNodeASecas()` devuelve a `node` las
    órdenes del arnés (`.rsc/`, `rsc-bootstrap.mjs`) y las nuestras con cualquier ruta, y en las
    demás solo la del Node de Executive Lab. La marca `--skip-worktree` se quita cuando no queda
    ninguna ruta nuestra, y solo con un git que se pueda usar: en un Mac sin las herramientas de
    Apple, `git` a secas abre su diálogo. Si queda una ruta en una orden que no se sabe leer, la
    marca se queda. Se quitan `fijarElNodeDeLosEnganches` y `queGitNoLoVea`, que ya no usaba nadie
    más: los instaladores no los llaman.
  - Se deshace en el paso del montaje y al abrir la barra, como los raíles (decisión 108): es
    nuestro, y deshacerlo no es decidir.
  - La pieza sale solo si hay enganches que arrancan con `node` (Claude; con Codex no hay). Su botón
    vuelve a poner el relevo y dice «Cierra la conversación con Claude y ábrela otra vez para que lo
    coja.». Las frases, en el diccionario, con las aprobadas en la parada.
  - **En este repositorio**, `.claude/settings.json` tenía la ruta del Node de la app de Jose en
    catorce órdenes y la marca puesta. Deshecho con la función nueva: queda igual que en HEAD, byte a
    byte, y `git ls-files -v .claude/settings.json` da `H`. El `node` del PATH (Homebrew) está.
  - Mutación: diez, y mueren todas. La E6 sobrevivió la primera vez porque el mutante se curaba
    solo (escribía la ruta y la función nueva la quitaba); rehecha como el comportamiento de antes,
    muere.

  Verde: `humo` 231, `contrato` 9, diccionario limpio.
- **T034 ✓** 25-09 · El aviso de versión nueva del arnés, apagado (C4):
  - **rojo**: «con una versión más nueva publicada, el arranque no ofrece actualizar». Corre el
    `session-start.mjs` del paquete tal cual, con `RSC_LATEST=9.9.9` y una casa vacía (el guion
    mira también la del usuario). Primero sin la barra, y sale el aviso: la prueba puede fallar.
    Después, con el entorno que deja la barra al abrirse, y seguía saliendo.
  - **verde**: `relevo.ponerAlActivar()` pone `RSC_NO_UPDATE_CHECK=1` en el entorno del anfitrión,
    que es lo que heredan el proceso del asistente y sus enganches, como el PATH. Si ya venía
    puesto, se respeta. Solo lo lee RSC. No va solo dentro del relevo: con un `node` del sistema no
    hay relevo, y el aviso seguiría.
  - Mutación: dos (no se llama al activar; se pone vacío), y mueren las dos.
  - Queda con la misma prueba de T032 (2) y (3): que el proceso del asistente herede el entorno del
    anfitrión en un VS Code de verdad.

  Verde: `humo` 232.
- **T035 ✓** 25-09 · El freno propio (C1, decisión 1 de Jose, C-4):
  - **rojo**, cuatro nuevas y dos más: «el freno deniega en operations las seis órdenes de C1», «con
    el freno de RSC puesto, el nuestro deja pasar», «con .no-danger-guard deja pasar» y «en una
    carpeta con historial ajeno, reponer los raíles no engancha el freno sin su sí». La de P7 pide
    la copia fijada en `skills/` y en `media/railes/`, igual a la del paquete. En `contrato.js`, «un
    sync de RSC no quita el freno propio», con un montaje de operaciones de verdad.
  - **verde**: en `skills/executive-lab/`, `freno.mjs` (el envoltorio: si el de RSC está en `.rsc/`
    y enganchado, sale sin decir nada; si no, carga la copia), `freno-rsc-2.0.5.mjs` (`cmp` con el
    `danger-guard.mjs` del paquete: 0, en las dos copias) y `LICENCIA-RSC.txt`, con la MIT de Eric
    tal cual. `aplicar.js` lo engancha en PreToolUse(Bash) como `node
    "${CLAUDE_PROJECT_DIR}/.claude/skills/executive-lab/freno.mjs" "${CLAUDE_PROJECT_DIR}"`, sin
    `.rsc/` en la orden. Una sola vez, sin tocar lo demás, y solo con Claude.
  - **C-4**: con `--ajena` queda pendiente, y con `--poner-freno`, que es el botón, se pone. Al
    montar encima de lo que había no es ajena, porque el sí ya se dio con el resumen. Al reponer
    los raíles solos, lo es si el historial no lo creó la barra. «Qué falta por montar» ofrece
    «Freno ante órdenes peligrosas · Todavía no: toca los ajustes de Claude de esta carpeta ·
    Ponerlo ahora», y no lo ofrece si frena el de RSC.
  - Los raíles «al día» miran todos los ficheros de la habilidad y no solo `SKILL.md`: si no, el
    freno no llegaba nunca a las carpetas que ya estaban montadas. Es la parte de D6 que esto
    necesitaba; los comandos y los bloques siguen en T045.
  - Mutación: once, y mueren todas.

  Verde: `humo` 240, `contrato` 11, diccionario limpio (con la fila de la pieza pendiente, hecha de
  frases que ya existían).
- **T036 ✓** 25-09 · «Las reglas» dice qué freno hay y de quién es (C1):
  - **rojo**: «con codeHooks false y el freno propio, Las reglas lo lista armado y dice su origen».
    Primero, porque `nombres.json` seguía diciendo que RSC activa el freno «con todos los alumnos».
  - **verde**: `reglas.losGuardianes()` cuenta el nuestro cuando está en la habilidad, y dice de
    quién es el que frena: «Lo pone Executive Lab: el arnés no lo trae en esta clase de proyecto.» o
    «Lo pone el arnés.». Si están los dos, manda el de RSC. Sin enganchar todavía (C-4), sale como
    pendiente con «Todavía no: toca los ajustes de Claude de esta carpeta». La pantalla lo pone
    detrás de lo que hace. `arrancar.hayFreno()` tira de ahí, así que el primer mensaje dice que hay
    freno cuando frena el nuestro. El comentario de `nombres.json`, reescrito.
  - Mutación: tres (siempre del arnés; solo lo de `.rsc/`; la pantalla sin el origen), y mueren las
    tres.

  Verde: `humo` 241, diccionario limpio.
- **T037 ✓ (con tres nombres para Jose)** 25-09 · Los interruptores y los automatismos de «Las
  reglas» (C5):
  - **rojo**: «lo apagado se nombra sin repetir, y la memoria apagada sale apagada», con los
    `optOuts` como los escribe RSC: uno por cada `.no-*`, sin el prefijo (`localDecisions`). Salía
    «Feature gate» y «Worktree cleanup», además de sus nombres, y la memoria no.
  - **verde**: `OPT_OUT_A_PIEZA` sale de las tablas de guardianes y automatismos, por su
    interruptor. La memoria se da por apagada con `memory: false` en `.rsc.json`, como la lee RSC
    (`memoryEnabledForProject`), en «Las reglas» y en «Lo que tiene apagado». La recogida de copias
    de trabajo y la memoria las monta RSC para cualquier asistente, y cuentan con Codex si están.
  - La prueba de antes usaba unos `optOuts` inventados (dos de cinco), y por eso no lo veía. Sigue
    ahí, y la nueva va con los de verdad.
  - **Sin pintar, a la espera de Jose (P2):** `.no-git`, `.no-harness` y el aviso de versión nueva,
    que el plan pedía nombrar en la lista, no tienen nombre aprobado en el diccionario. Van al informe
    con su propuesta: «El aviso de que falta git», «El arnés, apagado en esta carpeta» y «El aviso de
    versión nueva». Hasta entonces, un interruptor que no se conoce se sigue nombrando por su
    identificador, como antes.
  - Mutación: tres, y mueren las tres.

  Verde: `humo` 242.
- **T038 ✓** 25-09 · `repair` ya no decide los frenos (C6):
  - **medido** con el paquete, en el scratchpad: una carpeta de operaciones montada no tiene
    frenos de RSC; con una habilidad borrada, `repair --yes` engancha los cuatro (`danger-guard`,
    `gitmoji-guard`, `ship-guard` y `userprompt-gate`), y `sync` los quita.
  - **rojo**: en `contrato.js`, «tras arreglar en una carpeta operations no quedan frenos de RSC»,
    con ese mismo caso: montaje de verdad, una habilidad borrada y el paso `arreglarLoRoto` de la
    barra. Quedaban los cuatro.
  - **verde**: `rsc.arreglar()` y `rsc.arreglarSolo()` corren `sync` detrás de cada `repair` que
    sale bien, así que manda el plan aceptado. Si el `sync` falla, se dice ese fallo. El freno propio
    sobrevive a los dos: T035 lo mide.
  - Mutación: quitar el `sync` es el rojo de arriba.

  Verde: `contrato` 12, `humo` 242.
- **T039 ✓** 25-09 · Verificación de F3, en `verifications/todo-cuadra-F3-2026-09-25.md`:
  - la batería entera y `humo+`, en verde: `humo` 242, `humo+` 247, `contrato` 12, las tres
    empresas, el diccionario y PowerShell;
  - treinta mutaciones, y mueren todas (la E6, rehecha);
  - pendientes con Jose, con su orden: T032 (2) y (3), el relevo en Windows y tres nombres del
    diccionario.

  Decisión 119, su resumen, el worklog `2026-09-25-todo-cuadra-F3-los-frenos.md`, la barra a 0.35.0
  y el final de la 118 al día con su revisión.
- **Corrección a T036** 25-09 · Al pintar las pantallas de F3 salió que la fila del freno sin
  enganchar decía debajo «Está puesto porque no eres técnico», que no es verdad; con un perfil
  técnico, tampoco. **Rojo**: en la misma prueba de T036, sin enganchar, no dice que está puesto ni
  de quién es, y el primer mensaje no dice que hay freno. **Verde**: la segunda frase de lo que hace
  sale de `nombres.json` (el porqué ya lo dice el estado), y sin enganchar no se dice de quién es.
  `humo` 242. Va con los arreglos de la revisión de F3.

## F4

- **T040 ✓** 25-09 · Lo que vale siempre, en cada conversación de Claude (D1, C-11, C-4):
  - **rojo**, cinco: «aplicar.js escribe una vez el bloque de CLAUDE.md», «otroMontaje no lo
    cuenta», «SKILL.md no copia las innegociables de siempre.md», «en una carpeta con historial
    ajeno, reponer no toca su CLAUDE.md sin su sí» y «al montar sobre una carpeta de alguien, el
    resumen dice que se toca su CLAUDE.md».
  - **verde**: `siempre.md`, nuevo, con las siete innegociables movidas tal cual desde `SKILL.md`,
    que ahora dice dónde están sin copiarlas. `aplicar.js`, con Claude, deja en el `CLAUDE.md` de la
    raíz un bloque entre marcas con `@.claude/skills/executive-lab/siempre.md`: se crea si no hay
    fichero, y si hay uno se añade al final sin tocar lo demás, una sola vez. Con Codex, el bloque de
    `AGENTS.md` nombra también `siempre.md`. `sitios.js` no se toca.
  - **Lo que el plan no decía**: sin ningún `CLAUDE.md`, Claude lee el `AGENTS.md` de la carpeta, y
    creárselo le haría dejar de leerlo. Si ese `AGENTS.md` es de alguien, el bloque lo importa
    también (`@AGENTS.md`); si solo lleva lo de RSC, no, porque saldría dos veces.
  - `terreno` descuenta el bloque en `CLAUDE.md` y en `AGENTS.md`, como la sombra de RSC.
  - **C-4**: al montar sobre lo de alguien, el resumen dice «Cómo se trabaja aquí» si tiene
    `CLAUDE.md`, y con ese sí se pone. Al reponer los raíles solos en una carpeta cuyo historial no
    creó la barra, queda pendiente: «Lo que pone la barra» dice «Falta ajustarlo a esta carpeta» con
    «Ajustarlo ahora», y el botón pregunta con la frase del resumen antes de tocar nada.
  - Dos pruebas de antes cambian por la mudanza: la de la regla 7 lee `siempre.md`, y la de raíles
    viejos pone el bloque en «la de hoy».
  - Mutación: nueve, y mueren todas.

  Verde: `humo` 247, `contrato` 12, diccionario limpio (con la fila de «Lo que pone la barra», cuyas
  frases ya salían en pantalla sin estar).
- **T077 ✓** 25-09 · El comprobador del diccionario, también como módulo (parte de 8.2):
  - **rojo**: `require('./docs/comprobar-diccionario.js').palabrasProhibidas()` no devolvía nada,
    porque requerirlo lo ejecutaba entero y salía del proceso.
  - **verde**: lo del guion va dentro de `require.main === module`, y el módulo exporta
    `palabrasProhibidas()`. Da 27. Como guion dice lo mismo que antes, byte a byte; sale con 0 limpio
    y con 1 al sembrar una palabra prohibida en `extension/src/` (sembrada y quitada).
- **T041 ✓** 25-09 · La regla 7, completa (D2):
  - **barrido** del paquete: las 32 habilidades `core`, sus referencias y los comandos que escribe
    RSC (`targets/commands.js`) mandan correr `npx @ericrisco/rsc` sin versión, o con `@latest`, con
    catorce verbos. El plan nombraba once; faltaban `registry` (en `implement` y `sdd-init`), `sello`
    (en `review`, `ship` y un comando) y `memory` (en los comandos).
  - **rojo**: «todo npx @ericrisco/rsc de las habilidades core queda cubierto por la regla 7»: no
    nombraba ninguno de los catorce.
  - **verde**: la regla 7 de `siempre.md` los nombra todos, dice que nunca `@latest`, y ordena: lo
    instalado en la carpeta; para añadir una habilidad, el botón de la barra; y solo si hace falta, el
    paquete con la versión de `catalogVersion`, con un ejemplo.
  - La prueba de siempre, la que barre los raíles línea a línea, tomaba por orden la regla que prohíbe
    `@latest`, porque nombraba `npx` y `@latest` en la misma línea. Se repartieron las frases.
  - Mutación: quitar `registry` o `sync` de la regla, y muere.

  Verde: `humo` 248.
- **T042 ✓** 25-09 · La lista entera de palabras prohibidas, dentro de la regla 3 (D3):
  - **rojo**: «la lista de la habilidad es la del diccionario»: remitía a `docs/diccionario.md`, que
    en la carpeta del alumno no existe, y nombraba nueve de las veintisiete.
  - **verde**: la regla 3 de `siempre.md` trae las veintisiete, con los dos matices del diccionario
    («Claude» sí; «archivo», «documento» y «carpeta» también), y no remite a ningún fichero. La prueba
    la compara con `palabrasProhibidas()` del comprobador (T077): una sola lista.
  - Mutación: quitar «symlink» de la regla, y muere.

  Verde: `humo` 249.
- **T043 ✓** 25-09 · Con Codex, habilidad propia en vez de comando (D4):
  - **rojo**: «en Codex la habilidad no manda crear comandos»: la sección de lo que se repite mandaba
    crear `.claude/commands/` pasara lo que pasara.
  - **verde**: la sección se llama «Cuando algo se repite, ofrécele dejarlo escrito» y distingue.
    **Con Claude, un comando**, como antes. **Con Codex no hay comandos**: una habilidad propia en
    `.codex/rsc/<verbo-objeto>/SKILL.md`, apuntada en `ownSkills` para que la barra la enseñe como
    suya, y dicha como se pide con Codex («Usa la habilidad «…»», que es lo que ya dice la barra).
  - Mutación: quitar el párrafo de Codex, y muere.

  Verde: `humo` 250.
- **T044 ✓** 25-09 · El dial, con sus dos nombres (D5, C-7):
  - **rojo**, y no por lo esperado: «accompaniment y accompaniment_level dan el mismo dial». Leer
    las dos formas ya funcionaba; al cambiar el dial con las dos puestas, la barra escribía el valor
    nuevo en las dos, pero se comía los espacios de delante del comentario de la plantilla, y quedaba
    `accompaniment_level: L0<!-- L0 | L1 | L2 | L3 -->`. Quien lea hasta el primer espacio, y no hasta
    el `<`, se lleva otra cosa.
  - **verde**: `trato.escribir` guarda aparte esos espacios y los devuelve. Vale también para
    `technical_level`.
  - Mutación: tres (leer solo la cabecera, solo el cuerpo, y sin los espacios), y mueren las tres.

  Verde: `humo` 251.
- **T045 ✓** 25-09 · Raíles de antes, por cualquiera de sus piezas (D6):
  - **rojo**: «unos comandos o un bloque viejos cuentan como raíles de antes»: con la habilidad de
    hoy, un comando de otro día pasaba por al día.
  - **verde**: «al día» mira también los comandos de la barra (donde el asistente los tenga; con
    Codex no hay) y los bloques entre marcas de `CLAUDE.md` y `AGENTS.md`, que tienen que nombrar
    `siempre.md`. Un comando que falta cuenta como de antes; un bloque que falta, no, porque es lo que
    el reponer pone, o lo que espera al sí de alguien (C-4).
  - La prueba de raíles de la semana pasada pone ahora «la de hoy» con sus cuatro comandos.
  - Mutación: dos (sin los comandos, sin los bloques), y mueren las dos.

  Verde: `humo` 252.
- **T019 ✓** 25-09 · Una carpeta montada con una versión más nueva que la de la clase (B5, C-10),
  aquí detrás de la regla 7, como decía el plan:
  - **rojo**, con la comparación puesta como hoy (distinta es vieja): «1.4.1 se pone al día, 2.0.13
    no se baja sin pulsar». La 2.0.13 no salía más nueva que la 2.0.5.
  - **verde**: `rsc.comoEsLaVersion()` compara por sus números: 'igual', 'vieja' o 'nueva'.
    `versionAtrasada` es solo la vieja, que es la única que va a `ponerAlDia`. La más nueva se dice
    en «La versión del arnés» con las frases aprobadas y el botón «Ponerla como la de la clase».
    Antes de nada, el botón nombra las habilidades declaradas que la de la clase no trae (las mira en
    el paquete de dentro, `rsc.habilidadesDeLaClase()`). Solo con el sí las quita de la declaración
    y corre `sync` con el arnés de dentro; sin el sí, no toca nada.
  - La prueba fingía `rsc.correr` y no `rsc.sincronizar`, que llama a `correr` por dentro: la primera
    vez corrió el `sync` de verdad en la carpeta temporal. Ahora finge los dos.
  - Mutación: cuatro, y mueren todas.

  Verde: `humo` 253, diccionario limpio.
- **T046 ✓** 25-09 · Verificación de F4, en `verifications/todo-cuadra-F4-2026-09-25.md`:
  - la batería entera y `humo+`, en verde: `humo` 253, `humo+` 258, `contrato` 12, las tres
    empresas, el diccionario y PowerShell;
  - veintidós mutaciones, y mueren todas.

  Decisión 120, su resumen, el worklog `2026-09-25-todo-cuadra-F4-los-railes.md` y la barra a
  0.36.0. La revisión de F3 sigue corriendo; la de F4, después.
- **Revisión de F3 ✓** 25-09 · La primera se colgó sin entregar nada; la segunda, sobre una
  exportación del commit: *changes-needed*, con 0 críticos, 3 importantes y 5 menores. Todos
  comprobados y aceptados:
  - **I1**: poner el freno quitaba el grupo entero, con el enganche de la persona si iba en el mismo;
  - **I2**: cinco mutaciones vivas (el envoltorio con media mitad del de RSC, la activación sin relevo,
    el `sync` que falla callado, y toda carpeta tratada como de alguien);
  - **I3**: con Claude en marcha antes que la barra, la pieza decía «Listo»;
  - y M1 a M5: el botón que decía «Ya está» sin haberlo puesto, el módulo de un instalador de antes
    callado, el freno pendiente ofrecido estando apagado, tres definiciones del freno de RSC, y el
    relevo reescrito a trozos.

  Nueve pruebas nuevas y dos cambiadas, en rojo primero; doce mutaciones, y mueren todas. `humo` 262,
  `humo+` 267 y `contrato` 12. Y se corrige lo que decía el informe: T032 queda bloqueada en (2) y
  (3), no hecha; C2 y C4 están probados con un entorno que se le da a la función, y lo de verdad es lo
  que mide T032; C3 no se deshace con el módulo de un instalador de antes hasta F7. Van en un commit
  propio, porque F4 ya estaba encima; el trabajo de F5 se apartó en un *stash*.
