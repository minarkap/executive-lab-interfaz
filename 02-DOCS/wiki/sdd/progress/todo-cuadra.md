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
