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

## F5

- **T047 ✓** 25-09 · Una sola respuesta a «qué asistente» (E2):
  - **rojo**, con la función puesta como hoy: «con dos declarados y uno instalado, todas las
    pantallas coinciden». Con Claude y Codex declarados y solo Codex en el ordenador, la barra miraba
    en `.claude/` y le hablaba a Codex.
  - **verde**: `asistentes.conQuien()`, y de ella tiran `elDeAhora` (el puente, la brújula, la
    radiografía, «Las reglas»), `donde.paraQuien` (dónde se mira, y con ello `saberes.comoSePide`) y
    `rsc.anadir`. El orden: el elegido en esta carpeta si el arnés está montado para él (llega con
    T048), el primero declarado que esté instalado, el primero declarado, y sin nada declarado, el
    instalado o Claude. Lo declarado va antes que lo instalado: hablar con uno sin su arnés es hablar
    sin sus habilidades.
  - Mutación: dos (dónde, por el primero declarado; con quién, por cualquiera instalado), y mueren
    las dos.

  Verde: `humo` 254.
- **Corrección a T047** 25-09 · La segunda mutación sobrevivía a la prueba de T047 (la mataban
  otras cinco): no tenía el caso que separa lo declarado de lo instalado. Añadido (solo Codex
  declarado, solo Claude instalado: manda Codex), y ahora también la mata esta.
- **T048 ✓** 25-09 · Con quién se habla, guardado aparte de `targets` (E1):
  - **rojo**: «tras un sync que ordena, la elección sigue»: elegir reescribía el orden de `targets`
    en `.rsc.json`, que RSC vuelve a ordenar en cada escritura.
  - **verde**: la elección va en el estado del espacio de trabajo (`executiveLab.conQuien`), que la
    barra le da a `asistentes` al abrirse. `conQuien()` la usa si el arnés está montado para ese
    asistente. Con uno ya declarado, `elegir` apunta la elección y no toca la declaración; ahora es
    asíncrona, y el botón la espera. Con uno sin montar, sigue como antes hasta T049.
  - La prueba de «cambiar de asistente» espera ahora a `elegir`: sin eso fallaba a medias y dejaba la
    declaración cambiada para la siguiente.
  - Mutación: dos (la elección no se lee; elegir reescribe `targets`), y mueren las dos.

  Verde: `humo` 264.
- **T050 ✓** 25-09 · Raíles para todos los asistentes declarados (E2):
  - **rojo**: «con claude y codex declarados, los dos tienen raíles»: Codex se quedaba sin ellos.
  - **verde**: `aplicar.js` pone lo de cada asistente para cada declarado —la habilidad, los
    comandos, el trozo que la nombra, el bloque de `CLAUDE.md` y el freno— y lo de la carpeta una vez:
    los avisos callados, el perfil y `ownSkills`. Un asistente que no está en la tabla no recibe nada
    y se dice; si no queda ninguno conocido, se para, como antes.
  - Con varios de la familia de `AGENTS.md` a la vez, el último nombraría su copia en el bloque: la
    barra solo ofrece Claude y Codex, que no lo comparten. Queda para T051.
  - Mutación: solo para el primero, y muere.

  Verde: `humo` 265.
- **T049 ✓** 25-09 · Cambiar a un asistente sin montar lo prepara para él (E1):
  - **rojo**: «cambiar a un asistente sin montar lo prepara para él, con sus raíles» (reescrita: la
    de antes, «cambiar de asistente dice qué deja de verse», consagraba el fallo). Con Codex sin
    montar, se daba por cambiado sin preparar nada.
  - **verde**: `asistentes.elegir(id, { montar })`. Con uno sin montar corre `montar`, que es
    `arrancar.prepararTambienPara`: el `sync --target` del arnés de dentro, que suma y no quita, y
    después los raíles, que ya se ponen para todos (T050). Solo si sale bien **y** el asistente queda
    declarado se apunta la elección; si no, «No he podido prepararla para {nombre}. Pulsa «Algo va
    mal» y pásale el código a tu tutor.», y no se cambia nada. Fuera el camino que reescribía
    `targets` y decía que algo «deja de verse». El botón enseña «Preparando esta carpeta para
    {nombre}…» mientras tanto, y la pista de antes de pulsar dice que la prepara. Frases compuestas
    con las del diccionario, apuntadas en su fila.
  - **humo+** nuevo: «de Claude a Codex deja .codex/rsc con las 32 y la nuestra», con el paquete: la
    declaración suma a Codex sin quitar a Claude, `catalogVersion` sigue en la de la clase, Codex tiene
    las mismas 32 que Claude y la nuestra con `siempre.md`, `AGENTS.md` la nombra, y lo de Claude y su
    `CLAUDE.md` siguen igual.
  - Mutación: siete (sin preparar se cambia igual; sin mirar lo declarado; sin el `sync`; sin los
    raíles; un `sync` que falla se da por bueno; sin el aviso de los frenos; con uno ya montado se
    vuelve a montar). Dos sobrevivían a la primera versión de la prueba: faltaban el caso de un arnés
    que termina bien sin declararlo y el de `prepararTambienPara` con un `sync` que falla. Añadidos, y
    mueren las siete.

  Verde: `humo` 265.
- **T051 ✓** 25-09 · `compartido` y los formatos de los demás asistentes (E3):
  - **rojo**, tres pruebas: la de la tabla, que ahora compara también `compartido` (sale del
    adaptador de RSC: el de markdown mete su trozo entre marcas, el de Cursor reescribe su fichero) y
    los formatos (`skillExt`, `ext` e `invocationSuffix` del paquete); «una carpeta montada fuera se
    lee en el formato de su asistente»; y «los raíles se ponen en el formato de cada asistente».
  - **verde**: en `sitios.js`, `compartido: true` para Windsurf, Cline, Roo, Continue y Kiro, y tres
    campos nuevos, copiados de los suyos: `habilidadEnUnFichero` (Cursor, `.mdc`), `comandoAcabaEn`
    (Copilot, `.prompt.md`) y `comandoSePideCon` (Cline, `.md`). La barra los lee con cuatro
    funciones de `donde`, y de ellas tiran `rsc.habilidadesEnDisco` (con Cursor, los `.mdc` menos el
    fichero de siempre de RSC; la carpeta ya no parece un clon), `acciones`, el buscador, la cabecera
    de una habilidad y el «al día» de los comandos. Los raíles ponen los comandos con el nombre de
    cada asistente, y con Cursor dejan `.cursor/rules/executive-lab.mdc`, que es donde RSC busca la
    propia, que se aplica siempre y apunta a la habilidad con la misma frase que el bloque de Codex.
  - **Corrección a T047**: con un arnés montado fuera solo para asistentes que la barra no ofrece,
    `conQuien()` caía en Claude y la barra miraba en `.claude/`. `donde.paraQuien` mira entonces en
    lo del primero declarado, como antes de T047, y nunca en lo de Claude.
  - Mutación: catorce (cada campo de la tabla, `compartido` de Windsurf y de Kiro, mirar en lo de
    Claude, el fichero de siempre de RSC como habilidad, el sufijo al pedir, la cabecera, el
    buscador, el «al día», el nombre de los comandos, el `.mdc` de Cursor y su `alwaysApply`), y
    mueren las catorce.

  Verde: `humo` 267.
- **T052 ✓** 25-09 · Verificación de F5 ([verificación](../verifications/todo-cuadra-F5-2026-09-25.md)):
  `humo` 267, `humo+` 273, `contrato` 12, las tres empresas enteras, diccionario limpio y PowerShell
  sin pegas. Treinta mutaciones, y mueren todas. Decisión 121, worklog, 0.37.0 y commit. La revisión
  con ojos frescos de F5 corre sobre ese commit; la de F4, que ya llegó, se arregla detrás.
- **Revisión de F4** 25-09 · Cuatro importantes y doce menores, comprobados uno a uno y aceptados
  todos ([verificación de F4](../verifications/todo-cuadra-F4-2026-09-25.md#lo-que-encontró-la-revisión-con-ojos-frescos)).
  En un commit propio, detrás del de F5:
  - I1: con lo que la clase no trae en el plan aceptado, «Ponerla como la de la clase» vuelve a montar
    con la de la clase (`rumbo.comoLaDeLaClase`); si solo está en lo declarado, `sync`, y si falla,
    todo como estaba. Medido con el paquete: la 2.0.5, sin la nueva y con la añadida después.
  - I2: en una carpeta más nueva no se añade nada hasta ponerla como la de la clase.
  - I3 y m6: lo de siempre se mira y se pone donde lo lee cada asistente declarado
    (`sitios.dondeVaLoDeSiempre`), y en una carpeta de alguien espera a su sí con cualquiera.
  - I4 y m7: el import de `@AGENTS.md`, con pruebas, y se quita si ese `AGENTS.md` lleva lo de RSC.
  - m1 (bloque sin final), m2 (versiones raras), m3 (diccionario), m4 y m12 (regla 7), m5 (botón del
    bloque), m8 (un comando suyo no se pisa), m9 y m10 (sin catálogo y el error de RSC), m11 (C-23).
  - Diez pruebas nuevas, en rojo primero, y una del arnés de verdad; veintidós mutaciones, y mueren
    todas. Dos sobrevivían a la primera versión de las pruebas, y se añadieron sus casos.

  Verde: `humo` 275, `humo+` 282, `contrato` 12.
- **Corrección a T052** 25-09 · Las mutaciones de F5 fueron veintiséis, no treinta: 2 + 2 + 1 + 7 + 14.
  Lo encontró la revisión de F5.
- **Revisión de F5** 25-09 · Ocho importantes y diez menores, comprobados y aceptados
  ([verificación de F5](../verifications/todo-cuadra-F5-2026-09-25.md#lo-que-encontró-la-revisión-con-ojos-frescos)).
  I7 ya estaba arreglado en `62d6419`. En un commit propio, con F6 (T053) apartado en un `stash`:
  - I1: cambiar a uno sin montar mira antes, en seco, qué tocaría, y lo que es de alguien se pregunta
    como al montar. I2: no en una carpeta más nueva que la clase. I3, I4 e I5: el fallo al registro,
    el vigía rearmado y el aviso de los frenos, lo último que se ve.
  - I6: la sombra de `CLAUDE.md` de RSC no cuenta como suya, y un `AGENTS.md` con normas y con lo de
    RSC se le apunta a Claude en vez de importarse.
  - I8 y los menores: la elección, guardada al abrirse y válida mientras esté declarado e instalado;
    un cambio a medias se termina; `add` para todos los declarados; lo de RSC en Cursor no son
    habilidades; «Tu asistente» dice cuándo el de ahora no está montado; un trozo para dos en un
    `AGENTS.md`; y los restos.
  - Once pruebas nuevas o ampliadas, en rojo primero; diecinueve mutaciones, y mueren todas.

  Verde: `humo` 280, `humo+` 287, `contrato` 12.
- **T053 ✓** 25-09 · El bloque de lo que no entra en git (F1):
  - **rojo**: «el bloque se pone una vez y no saca de git lo que ya estaba».
  - **verde**: un módulo nuevo de los raíles, `no-entra-en-git.js`, con la lista y el bloque, que usan
    los raíles para ponerlo y la barra para mirarlo. Los raíles lo ponen una vez por carpeta, entre
    marcas de comentario (`# executive-lab:start`), en el `.gitignore` de la raíz, o lo crean. Lo que
    ya estaba en git sigue en git. En una carpeta de alguien, su `.gitignore` espera a su sí (C-4):
    «Lo que pone la barra» lo ofrece, y el botón dice «la lista de lo que no entra en git». Uno de otro
    día se da por viejo y se pone al día.
  - Sin `*.key`: en un Mac, las presentaciones de Keynote acaban así (decisión SDD de hoy). La prueba
    mira que una `presentacion.key` entra en la copia.
  - Una prueba de antes montaba «los raíles de hoy» a mano: ahora con el bloque también.
  - Mutación: nueve, y mueren todas.

  Verde: `humo` 281.
- **T054 ✓** 25-09 · Guardar en git sin credenciales, y decirlo (F1):
  - **rojo**: «guardar en git deja fuera .env, credentials.json y x.pem de la raíz, y lo dice», con git
    de verdad en un temporal.
  - **verde**: `historial.guardar(dir, mensaje, { excluir })` deja fuera, en los dos motores, lo que
    git todavía no seguía (con un pathspec `:(exclude,literal)` en el binario, y sacándolo del índice
    en el de JavaScript), cuenta lo que entra y no lo que cambió, y devuelve `excluidos`. La barra le
    pasa lo que reconoce el inventario (`sueltas.buscar` y `ficherosDeAcceso`), dice qué se ha quedado
    fuera, con las frases del diccionario, y el aviso trae su botón, «Ponerlo en su sitio», que es el
    encargo de ordenar las claves. El guardado solo pasa por lo mismo, y lo apunta en el registro. Una
    que ya estaba en git sigue en git, con sus cambios: sacarla lo decide la persona. El raíl
    `guardar.md` pide lo mismo al asistente.
  - Una `.key` es una clave solo si lo dice lo que lleva dentro (`-----BEGIN`): en un Mac, las
    presentaciones de Keynote acaban así.
  - El motor de JavaScript solo se prueba donde está su biblioteca, y aquí no: su caso, escrito.
  - Mutación: nueve (el binario sin dejar fuera, contar cambios en vez de lo que entra, lo que ya
    sigue git fuera también, una `.key` siempre clave, sin decirlo, sin el botón, el aviso sin su
    botón, sin los ficheros de acceso), y mueren todas. Una sobrevivía, porque lo que ya seguía git se
    filtraba en dos sitios: queda en uno, `historial`.

  Verde: `humo` 282.
- **T076 ✓** 25-09 · Tapar las claves en lo que se enseña (F2):
  - **rojo**, dos: «una consulta que imprime una clave la enseña tapada» y «el informe no lleva ningún
    valor de los .env de la carpeta».
  - **verde**: `conexiones.taparClaves` cambia cada valor de las claves de la carpeta —el `.env` de
    cada herramienta y los sueltos que ve el inventario— por sus cuatro últimos caracteres, como el
    resto de la barra (C-18). Solo los de seis o más: un «test» o un «true» no se tapan. Lo usan la
    salida de una consulta, antes de pintarla, y el informe de «Algo va mal», antes de escribirlo.
  - La prueba del informe usa la clave que haya en ese momento: otras pruebas la cambian.
  - Mutación: cinco (la consulta sin tapar, el informe sin tapar, todo tapado, sin las sueltas, sin
    las de las herramientas), y mueren todas.

  Verde: `humo` 284.
- **T055 ✓** 25-09 · El token de GitHub, fuera de la orden y de los errores (F2):
  - **medido**: el git de este Mac (2.46) ya no repite la clave de la URL en «unable to access», pero
    el token iba en la línea de órdenes, que se ve mientras corre, y uno de antes sí la repite.
  - **rojo**: «un push fallido no deja el token en el informe», con un git de mentira que apunta con
    qué se le llamó y repite la URL y sus cabeceras al fallar.
  - **verde**: el motor binario manda el token en una cabecera por el entorno de esa sola invocación
    (`GIT_CONFIG_COUNT`, sumado a lo que ya hubiera), y lo que diga git al fallar se limpia del token
    en sus tres formas. La barra apunta, ya limpio, por qué no subió, para «Algo va mal» (P3).
  - Pendiente, con Jose: una subida de verdad a GitHub con la cabecera, que aquí no se puede hacer.
  - Mutación: dos (el token en la URL, el error sin limpiar), y mueren las dos. La primera pasada se
    cayó entera por un `${…}` de sh sin escapar en la prueba, y el guion de mutaciones lo contó como
    «sigue verde»: desde ahora, una batería que se cae se dice aparte.

  Verde: `humo` 285.
- **T056 ✓** 25-09 · Las claves, con comillas que aguantan `source` (F3):
  - **rojo**: «una clave con # $ espacio ' ` ; llega entera a la prueba y no se ejecuta», con
    `bash -c 'set -a; source .env; printf %s "$X"'`: «con espacio» le llegaba vacía.
  - **verde**: con algo fuera de `[A-Za-z0-9_./:@+=-]`, la clave va entre comillas simples y con la
    comilla escapada (`'it'\''s'`); sin nada raro, como estaba. El lector de la barra junta los tramos
    igual que bash. Doce valores, entre ellos `$(touch …)` y comillas invertidas: todos llegan enteros,
    y no se ejecuta nada.
  - Y una clave de antes, escrita sin comillas, que rompe el `source`: la prueba ya no dice que el
    guion está roto, sino que se vuelva a pegar la clave (frase nueva, en el diccionario, C-22).
  - Mutación: cinco (sin comillas, sin escapar la comilla, siempre con comillas, el lector sin los
    tramos, culpar al guion), y mueren todas.

  Verde: `humo` 286.
- **T057 ✓** 25-09 · Ver si hay Python antes de lanzar un `.py` (F4):
  - **rojo**: «sin Python, un .py no se lanza a ciegas y se dice qué falta», con un PATH sin Python.
  - **verde**: la barra pregunta antes por la versión (`python3`, `python`, y en Windows `py -3`
    primero) y se acuerda para cada PATH. Sin uno de verdad, la consulta o la prueba dicen «Esta
    consulta necesita Python, y en este ordenador no está.», con «Pedírselo al asistente», que le
    pide rehacerla con lo que ya hay. La habilidad pide los guiones de cada herramienta en bash o en
    node, y en Python solo si ya hay uno que funcione.
  - El texto para el asistente se ve en su caja: el comprobador del diccionario cazó «node» y
    «terminal», y se reescribió sin ellas.
  - Mutación: cuatro (a ciegas, sin el botón, la consulta sin mirar, la habilidad sin pedirlo), y
    mueren todas.

  Verde: `humo` 287.
- **T058 ✓** 25-09 · Verificación de F6 ([verificación](../verifications/todo-cuadra-F6-2026-09-25.md)):
  `humo` 287, `humo+` 294, `contrato` 12, las tres empresas enteras, diccionario limpio y PowerShell
  sin pegas. Treinta y cuatro mutaciones, y mueren todas. Decisión 122, worklog, 0.38.0 y commit. La
  revisión con ojos frescos de F6 corre sobre ese commit.
- **T059 ✓** 26-09 · Cada mensaje del panel se despacha (G1, I2):
  - **rojo**: «todo tipo que manda el panel se despacha sin excepción» despacha los setenta tipos que
    manda el panel, con lo que tiene efectos de verdad fingido, y mira que no se apunte un fallo de
    programa: salía `[resolverIncidencia] ReferenceError: encargos is not defined`, y solo ese.
  - **verde**: `extension.js` importa `encargos`. La parte estática ya cuadraba: todo tipo del panel
    tiene su ruta.
  - Mutación: quitar el import es el rojo de arriba.

  Verde: `humo` 288.
- **T060 ✓** 26-09 · El arnés y los módulos del `.vsix`, primero (G2):
  - **rojo**: «con una app antigua con la 1.4.1, gana la del .vsix».
  - **verde**: `entradaDelArnes` pone primero el que viaja dentro de la extensión; el de la carpeta de
    la app, solo si es de la misma versión, que se lee del `package.json` del arnés de dentro (sin
    escribirla en un sitio más, P7). `moduloComun` deja el de la app el último. El informe de «Algo va
    mal» dice qué arnés y qué módulos corren.
  - Se reescribió la prueba de la revisión de F3 que contaba con que mandara el módulo de un instalador
    de antes: ahora mira que se use el del paquete y que la ruta se devuelva a `node`.
  - Mutación: cuatro, y mueren todas.

  Verde: `humo` 289.
- **T061 ✓** 26-09 · La salud por `doctor --json`, y lo que falta por su nombre (G3):
  - **rojo**: «con un informe real de doctor, faltan nombres y no rutas», con las formas que escribe
    `scripts/doctor.js` de la 2.0.5.
  - **verde**: `queFaltaEnDisco` lee las habilidades como `id:ruta` (también con los dos puntos de una
    ruta de Windows) y los agentes y comandos como objetos, sin repetir. La radiografía dice sus
    nombres, y «Algo va mal» decide la salud con `rsc.estaEntero` (nada falta y los enganches pueden
    correr), no por el código de `doctor`, que es 0 siempre.
  - Mutación: seis, y mueren todas.

  Verde: `humo` 290.
- **T062 ✓** 26-09 · Lo instalado es lo que hay en disco (G4):
  - **rojo**: «declarada y no en disco no sale como instalada».
  - **verde**: `queSabe` y el contador de la pantalla principal cuentan lo que hay en disco, y
    `anadir` se da por hecho si la habilidad está en disco, no si está declarada. Las sugerencias
    siguen sin ofrecer lo declarado. La prueba de los cuatro montones montaba «instaladas» solo
    declarándolas: ahora las pone en disco.
  - **contrato** nuevo: «instalar una habilidad desde la barra deja catalogVersion en 2.0.5», con el
    arnés de dentro.
  - Mutación: dos, y mueren las dos.

  Verde: `humo` 291, `contrato` 13.
- **Revisión de F6** 26-09 · Un crítico, dos importantes y dos menores, comprobados y aceptados
  ([verificación de F6](../verifications/todo-cuadra-F6-2026-09-25.md#lo-que-encontró-la-revisión-con-ojos-frescos)).
  En un commit propio, con F7 (T059–T062 hechos, T063 en rojo) apartado en un `stash`:
  - el crítico: «ya en git» por la última copia y no por el índice, y lo que se deja fuera, sacado del
    índice;
  - los ficheros de acceso, tapados también;
  - un `.env` con finales de Windows, arreglado al guardar y dicho al probar;
  - el plan, con las marcas de verdad.
  - Tres pruebas nuevas, en rojo primero; ocho mutaciones, y mueren todas.

  Verde: `humo` 290, `humo+` 297, `contrato` 12.
- **T063 ✓** 26-09 · Los comandos por lenguaje, con nombre y del arnés (G5):
  - **rojo**: «los comandos por lenguaje del paquete tienen nombre y son del arnés», que lee de
    `targets/commands.js` los dos sufijos (`-review`, `-build`).
  - **verde**: una regla por familia en `nombres.json`, como la de los agentes («Revisar el código de
    {Lenguaje}», «Arreglar la compilación de {Lenguaje}», las del vocabulario aprobado). Del arnés es
    lo que el arnés apunta en su estado (`commands` de `.rsc-state.json`), y la regla solo se usa con
    esos: uno del alumno que acabe igual sigue siendo suyo.
  - Mutación: tres; una sobrevivía, porque la regla ya ponía entre los del arnés los de por lenguaje:
    se añadió uno que el arnés apunta y que nadie nombra. Mueren las tres.

  Verde: `humo` 295.
- **T064 ✓** 26-09 · Las preguntas sin contestar, como las apunta RSC (G6):
  - **rojo**: «dos abiertas y una FILLED dan dos», con bloques `## [fecha] gap | concepto` y su
    `Status:`; y con el andamio de RSC y un artículo archivado.
  - **verde**: la barra lee los bloques abiertos y deja fuera los `[FILLED …]` (y sigue leyendo
    viñetas escritas a mano). No son conocimiento de la empresa las carpetas de trabajo de RSC (`ftd`,
    `decisions`, `design`, `stack`, `reports`) ni lo que el índice marca `[Archived]`. El fixture de la
    empresa de mentira escribe las preguntas como RSC.
  - Mutación: cuatro, y mueren todas.

  Verde: `humo` 296.
- **T065 ✓** 26-09 · El suelo, como lo pide RSC (G7):
  - **rojo**: «falta un fichero de la plantilla y no se dice Listo».
  - **verde**: el suelo de conexiones pide la carpeta de la plantilla y sus ficheros, leídos de la
    plantilla del arnés que viaja dentro, como hace RSC (`gitignore` viaja sin punto). Son cinco, y uno
    es `.env.example`, oculto: la empresa de mentira no lo tenía, y se le puso. Los fixtures que
    montaban la plantilla con su `README.md` y nada más ponen ahora la plantilla entera. La
    constitución ya la miraba `faltanLosInnegociables` (T1.4).
  - Mutación: una (el suelo, solo la carpeta), y muere.

  Verde: `humo` 297.
- **T066 ✓** 26-09 · Verificación de F7 ([verificación](../verifications/todo-cuadra-F7-2026-09-26.md)):
  `humo` 297, `humo+` 304, `contrato` 13, las tres empresas enteras, diccionario limpio y PowerShell
  sin pegas. Veintiuna mutaciones, y mueren todas. Decisión 123, worklog, 0.39.0 y commit. La revisión
  con ojos frescos de F7 corre sobre ese commit.
- **T067 ✓** 26-09 · La documentación, al día (H1, A8):
  - **rojo**: «el recuento de preguntas sale de rumbo», que mira también que el README, las notas de
    `publicar.sh` y el README de la extensión no digan «cinco preguntas» ni «0.9.1».
  - **verde**: `rumbo.cuantasPreguntas` cuenta cuántas veces se pregunta algo al preparar (de nueve a
    doce en una carpeta vacía, según las respuestas), y la brújula lo dice en vez de «una sola cosa».
    Los documentos ya no llevan ni el número de preguntas ni el de la release; dicen que no hace falta
    instalar Node, con el relevo, y ya no mandan borrar `.rsc.json`. La prueba que esperaba «Puedo
    montar tu empresa» (que además chocaba con la regla de no llamarlo empresa) espera la frase nueva.
  - **Sin tocar, para Jose**: la versión del `.iss` y del `Info.plist` del instalador de Mac, y lo que
    dicen `probar.ps1` y `COMO-PROBARLO.md` de MinGit y del arnés preinstalado. Son del instalador,
    que se firma, y lo de Windows se mide allí.

  Verde: `humo` 298.
- **T068 ✓** 26-09 · Una sola lista de palabras prohibidas, y la prueba que salía siempre «SALTADA» (H2):
  - **rojo**: «el comprobador del diccionario vigila también los nombres, el catálogo y los
    instaladores». Siembra palabras en una copia: en `nombres.json`, `capacidades.json`, la ventana
    de Mac, `instalar.js` y el asistente de Windows. Y siembra también lo que no es pantalla: una
    nota `_…` de la tabla, el registro (`anotar`) y los comentarios de cada lenguaje. La prueba del
    catálogo deja su lista propia de diez palabras.
  - **verde**:
    - El comprobador revisa también las dos tablas: solo los campos que se pintan, y los nombres de
      los lenguajes.
    - Revisa los pasos de `instalar.js`, sin lo que va al registro.
    - Lee entera la ventana de Mac, porque un diálogo ocupa varias líneas.
    - Revisa el asistente de Windows: `[Messages]`, `[CustomMessages]` y lo que va entre comillas.
    - «Node.js» pasa como nombre propio, como dice la decisión; «node» a secas, no.
    - Exporta `revisarTodo(base)` y `tieneUnaProhibida(texto)`, y la prueba del catálogo usa esa lista.
    - La prueba de las capacidades mira el catálogo que viaja dentro del `.vsix`, y no el del
      instalador, que solo existe al construirlo: ya no sale «SALTADA» (246 capacidades, todas reales).
  - Como guion: «27 palabras prohibidas · 54 ficheros y 700 rótulos revisados», limpio.
  - Mutación: quince, y mueren todas. Tres se repitieron: la primera vez las cortó el reposo del Mac
    de madrugada, no la prueba (37 s de CPU en una hora y media de reloj).
  - Sigue saltando, a propósito, la del motor de JavaScript de las copias: salta donde hay git.

  Verde: `humo` 299.
- **T071 ✓** 26-09 · Seis cosas más para Eric (H5):
  - `docs/para-rsc.md` pasa de tres a nueve. Cada una va contra el paquete 2.0.5, con fichero y línea,
    qué se ve, el rodeo que hemos puesto y lo que parece que falta:
    - el freno que `init` promete y solo se engancha con SDD (C1);
    - `repair` sin la política del plan (C6);
    - `onboard`, que sustituye la habilidad del usuario con el mismo nombre (B4);
    - el dial con dos nombres (D5);
    - `doctor`, que sale siempre con 0 (G3);
    - el perfil reescrito entero (B11).
  - Al final, un borrador de issue por cada una, en inglés como el repositorio, para que Jose las abra.
    No están miradas contra la 2.0.15.
  - Al escribir la novena salió un hueco nuestro. Al volver a montar, la barra repone el dial, los
    asistentes y lo suyo del perfil, pero no el cuerpo que va escribiendo `init`, que se pierde al
    subir de versión. Va como T078.
- **T069 ✓** 26-09 · Nada en git que esté a la vez ignorado, y la descripción de la confianza, verdadera (H3):
  - **rojo**: «nada de lo que está en git está a la vez ignorado», que pasa `git ls-files -ci
    --exclude-standard` en el repositorio. Salían cuatro comandos de RSC (`checkpoint`, `learn`,
    `resume-session` y `save-session`): estaban en git desde antes de que el `.gitignore` los nombrara.
  - **verde**: `git rm --cached` de los cuatro, que siguen en disco. `git ls-files -ci` sale vacío.
  - La descripción de `untrustedWorkspaces` decía que el disfraz apagaba la confianza y que la barra
    solo hace cosas al pulsar un botón. Las dos cosas eran falsas. La confianza la apaga el instalador;
    la extensión no la toca, porque es un ajuste de todo el programa. Y al abrirse, la barra repone
    sus raíles y sus enganches, y guarda sola si está puesto. La descripción lo dice así.
  - Mutación: volver a meter uno de los cuatro en git, y la prueba se pone roja.

  Verde: `humo` 300.
- **T070 ✓** 26-09 · Quien manda a «Algo va mal» dice qué hacer con el código (H4):
  - **rojo**: «quien manda a «Algo va mal» dice también qué hacer después». Salían trece «Prueba con
    "Algo va mal"» y dos «Pulsa "Algo va mal"» sin el paso siguiente (`arrancar.js` y `guardar.js`).
  - **verde**: los quince dicen «Pulsa «Algo va mal» y pásale el código a tu tutor.», la frase del
    diccionario. Y la marca descartada ya no dice «Prueba con uno más claro»: dice «Hace falta uno más
    claro o más oscuro», así que `grep -rn "Prueba con" extension/src extension/media/panel.js` sale
    vacío. Las dos frases entran en el diccionario.
  - Mutación: devolver un mensaje a «Prueba con» y otro a «Pulsa» sin el paso siguiente, y la prueba
    se pone roja con los dos.

  Verde: `humo` 301.
- **Revisión de F7** 26-09 · Tres importantes y nueve menores, comprobados y aceptados
  ([verificación de F7](../verifications/todo-cuadra-F7-2026-09-26.md#lo-que-encontró-la-revisión-con-ojos-frescos)).
  El revisor se cortó tres veces por la red, con el Mac dormido de madrugada, y se retomó donde estaba.
  El arreglo va en un commit propio, con F8 (T067–T071 y T078, a medias) apartado en un `stash`:
  - el andamio de RSC y lo archivado, fuera del conocimiento también con índice;
  - los comandos por lenguaje, con el nombre de su habilidad y la frase de su ayudante;
  - `doctor` con el asistente de ahora, y «no se sabe» como tercer estado de «Algo va mal», que ya no
    dice «tu empresa»;
  - el suelo, sacado del recibo, y la plantilla de la 2.0.5 fijada para cuando no se pueda leer;
  - un enlace a nada, que no es una habilidad; un comando del alumno con nombre de la tabla, que sigue
    siendo suyo; las variantes de las preguntas; los tres módulos en el informe;
  - la prueba de despacho, con las 83 rutas; y la batería, que ya no revienta sin el paquete.
  - Once pruebas nuevas, en rojo primero. Treinta mutaciones: mueren veintisiete, y de las otras tres,
    dos eran equivalentes (una deja fuera un filtro que sobraba) y la tercera pedía una prueba, que se
    añadió y la mata.

  Verde: `humo` 308, `humo+` 315, `contrato` 13.
- **T078 ✓** 26-09 · Volver a montar ya no borra lo que el asistente apuntó en el perfil (B11):
  - Salió al escribir T071. RSC reescribe el perfil entero al aceptar un plan: tres campos en la
    cabecera, «# User profile» y «Goal:». Lo que `init` va apuntando ahí se perdía al subir de versión.
  - **rojo**: «volver a montar no borra lo que el asistente apuntó en el perfil» y «lo devuelto al
    perfil lleva el dial que se acaba de elegir». Van con un RSC fingido que reescribe el perfil como el
    de verdad, y acaban una en «listo» y otra en «suelo a medias».
  - **verde**: se lee el perfil antes de montar y se devuelve después. Vuelven los campos de la
    cabecera que RSC ya no escribe y el cuerpo, sin el título ni el objetivo, que son del plan nuevo. El
    dial y las palabras de lo devuelto quedan como los acaba de escribir RSC, porque el asistente y
    «Cómo te habla» leen primero `accompaniment_level`.
  - Por el camino, dos correcciones:
    - la guarda contra duplicados comparaba lo devuelto ya con el dial nuevo, y un RSC que conserve el
      cuerpo lo traería con el de antes: se compara tal cual estaba;
    - la prueba miraba `language: es`, que escriben también los raíles, y por eso la mutación «sin la
      cabecera» seguía verde: ahora mira `sector`, que no escribe nadie más.
  - Mutación: ocho, y mueren todas.

  Verde: `humo` 314.
- **T067, mutación** 26-09 · Cuatro: el recuento fijo, sin la web en la cuenta, la brújula con la frase
  de antes y el README con el número. La de la web sobrevivía, porque la prueba solo miraba que la
  pantalla y `rumbo` dijeran lo mismo. Se fijó el recuento de una carpeta vacía (de 9 a 12), y mueren
  las cuatro.
- **T072 ✓** 26-09 · Verificación de F8 ([verificación](../verifications/todo-cuadra-F8-2026-09-26.md)):
  `humo` 314, `humo+` 321, `contrato` 13, las tres empresas enteras, diccionario limpio (54 ficheros y
  709 rótulos) y PowerShell sin pegas. Treinta mutaciones, y mueren todas. Decisión 124, worklog, 0.40.0
  y commit. La revisión con ojos frescos de F8 corre sobre ese commit.
- **Corrección a T067** 26-09 · El motivo de dejar para Jose el `.iss`, el `Info.plist`, `probar.ps1` y
  `COMO-PROBARLO.md` no era «que se firma»: editarlos no firma nada. Es la regla del plan para el
  autopilot, que para antes de tocar los instaladores firmados.
- **Corrección a T068** 26-09 · «El motor de JavaScript sigue sirviendo de resto» no salta «donde hay
  git»: salta porque ese motor solo existe con `isomorphic-git`, que ya no trae nada de este
  repositorio y solo queda en instaladores de antes. La prueba lo dice así, y la decisión queda para
  Jose.
- **Revisión de F8** 26-09 · Cinco importantes y siete menores, comprobados y aceptados, salvo lo que el
  plan deja para Jose
  ([verificación de F8](../verifications/todo-cuadra-F8-2026-09-26.md#lo-que-encontró-la-revisión-con-ojos-frescos)).
  En un commit propio, con lo de F9 (los plurales y el montaje de «Un poco de todo») apartado en un
  `stash`:
  - la cuenta de preguntas, la de la entrevista (de 8 a 12), con los avisos de antes de preparar;
  - las órdenes para agentes, con el tamaño que RSC exige;
  - la cabecera del perfil, devuelta con sus listas, sus bloques y sus tildes;
  - el comprobador, mirando las vistas, la confianza y los módulos comunes;
  - «Algo va mal» con su paso siguiente también en los raíles y en la pieza del recibo roto;
  - ningún texto que llame «tu empresa» a la carpeta; la marca, con qué hacer; el README, al día.
  - Seis pruebas nuevas, en rojo primero. Quince mutaciones, y mueren todas.

  Verde: `humo` 320, `humo+` 327, `contrato` 13.
- **T073 ✓** 28-09 · Verificar el cierre
  ([verificación](../verifications/todo-cuadra-2026-09-28.md)): la batería entera sobre el estado
  final, y cada uno de los 61 criterios con la prueba que lo sostiene. Cumplen 60, y C2 cumple en Mac y
  espera a medirse en Windows. Por el camino:
  - **I3**: ningún montaje de verdad pasaba por «Un poco de todo». Prueba nueva en `humo+`: montado
    como `mixed`, con su tamaño y con raíles.
  - **Los plurales con paréntesis**: diecisiete textos de antes de este programa («3 cosa(s)»,
    «necesita(n)»). Van con la frase de uno y la de varios, con una regla en el diccionario y una prueba
    en rojo primero.
- **T074 ✓** 28-09 · La revisión final, con tres refutadores (corrección, seguridad y pruebas) sobre la
  rama entera. Un crítico, dos importantes, un menor y una observación, comprobados y aceptados:
  - el freno cuenta solo si está enganchado de verdad antes de cada orden de Bash, el de RSC y el
    nuestro (crítico);
  - el comprobador del diccionario ve palabras sueltas y frases sin artículos;
  - la prueba de despacho ve cualquier excepción;
  - el informe de «Algo va mal» no entra en la copia de git;
  - la cabecera de `historial.js`, al día.
  - Cinco pruebas nuevas o ampliadas, en rojo primero. Trece mutaciones, y mueren todas.

  Verde, sobre el estado final: `humo` 322, `humo+` 330, `contrato` 13, las tres empresas, el
  diccionario (57 ficheros y 712 rótulos) y PowerShell limpios, y `git ls-files -ci` vacío.
- **T075 ✓** 28-09 · El informe para Jose, en la conversación, y la página de pantallas al día
  (https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre, de F1 al cierre). Se para aquí: sin merge, sin
  push y sin publicar nada.
