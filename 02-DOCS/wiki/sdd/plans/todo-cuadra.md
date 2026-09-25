---
type: plan
title: Plan — Todo cuadra
description: Cómo se cierran los 56 hallazgos de la auditoría. Contratos, flujos, pruebas, orden y riesgos, a la altura de estructura. Las tareas van dentro.
tags: [sdd, plan]
timestamp: 2026-09-24T16:10:00Z
topic: sdd
slug: todo-cuadra
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
status: aprobado en autopilot, no punto por punto
---

# Plan — Todo cuadra

> Spec: [../specs/todo-cuadra.md](../specs/todo-cuadra.md) · Propuesta con la evidencia:
> [../proposals/todo-cuadra.md](../proposals/todo-cuadra.md) · Constitución:
> [../constitution.md](../constitution.md) · Rama: `todo-cuadra`, desde `main` (2b139bc)
> Última actualización: 24-09-2026

## 0. Restricciones globales

Las cumple cada tarea sin que se le diga, y son lo primero que mira quien revisa.

- **Vocabulario (P2):**
  - todo texto de pantalla va en español y está en `docs/diccionario.md` **antes** de usarse;
  - lo que lee el asistente y no el alumno lleva `// diccionario: interno`;
  - palabras prohibidas: terminal · consola · shell · CLI · repositorio · commit · branch · push ·
    pull · merge · directorio · ruta · path · archivo de configuración · JSON · variable de entorno ·
    dependencia · instalar paquete · npm · Node · symlink · hook · VS Code · extensión · Claude Code ·
    token · API.
- **Versión del arnés (P7):** RSC **2.0.5** exacta, sin rangos. Dice lo mismo en los cinco sitios de
  hoy, y en uno más: la copia del freno (`freno-rsc-2.0.5.mjs`).
- **Cero dependencias:** la extensión no tiene dependencias ni de las de desarrollo (`config.yaml`).
  Las pruebas son guiones de Node con `node:assert`, sin jest ni mocha.
- **Nada descargado dentro del proyecto (P8).** El relevo de Node vive en el almacén de la
  extensión, fuera de la carpeta del alumno. Las pruebas escriben solo en `os.tmpdir()`.
- **Al desarrollar, nada fuera del directorio de trabajo** (regla dura de Jose). Las carpetas
  temporales del sistema son la única excepción, y solo en las pruebas.
- **Nunca un fallo silencioso (P3):** todo lo interno acaba en el informe de «Algo va mal»
  (`rastro.js`).
- **Ninguna pantalla sin salida (P1):** toda pieza que falta trae su
  `arreglo: { como: solo | agente | persona, … }`.
- **Lo de la persona no se toca (P4):**
  - nada suyo se borra, se mueve ni se renombra sin su sí;
  - su historial no se escribe;
  - en sus ficheros solo entran bloques aditivos entre marcas nuestras (`<!-- executive-lab:start -->` …
    `<!-- executive-lab:end -->` en markdown, `# executive-lab:inicio` … `# executive-lab:fin` en
    `.gitignore`), dichos antes.
- **Determinista lo que se lee del disco (P5).** Lo que hay que entender se delega con un encargo de
  cuatro partes y `comprobar()` (decisión 89).
- **La acción de un botón se coge tal cual viene (P6).**
- **Lo que es de RSC no se reescribe.** Sus órdenes con `node`, el orden de `targets`,
  `catalogVersion` y sus ficheros enteros: cada `sync` los deja como estaban. Lo nuestro va en piezas
  y bloques propios.
- **TDD.** Primero la prueba roja que reproduce el hallazgo, luego el arreglo. La verificación anota
  la mutación: la prueba se pone roja si se quita el código.
- **Raíles.** `skills/` es la fuente y `extension/media/railes/` la copia, idénticas byte a byte,
  con prueba.
- **Commits.**
  - Uno por fase, en español y en frase, con
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Nada de push, merge ni publicación.
  - Decisiones numeradas a partir de la 116.

## 1. Contexto y restricciones

- **Criterios que más pesan en el diseño:**
  - A1–A3, que deciden el contrato con `onboard`;
  - B4 y C-2, que deciden la confirmación en carpetas ajenas;
  - C1, C2 y C6, que deciden los frenos y el relevo;
  - D1, que decide dónde se cargan los raíles;
  - E1, que decide dónde se guarda con quién se habla;
  - F1 y F3, que deciden las copias y las claves.
- **Constitución.** Están en juego todas; las que más fuerzan el diseño son P4, P5 y P7.
- **Fuera de alcance** (spec): cambiar RSC, publicar, Windows, firmar, asistentes nuevos, frenos
  para Codex y replicar los otros guardianes.
- **Lo que no se puede probar aquí** va a pendientes con su prueba concreta: el relevo en Git Bash y
  PowerShell, el corte de URL a 2.048 caracteres y el `.exe`.

## 2. Arquitectura

```text
                         ┌──────────────────────────────────────────┐
  panel (webview) ─msg──►│ extension.js (manejadores de mensajes)    │
                         └───────┬───────────────────────┬──────────┘
                                 │                       │
            ┌────────────────────▼───┐           ┌───────▼───────────────────┐
            │ terreno.reconocer()    │  parte    │ rumbo.elegirRama() (pura) │
            │ (lee disco, sin procesos│──────────►│ rama · preguntas · pasos │
            │  salvo a fondo)        │           └───────┬───────────────────┘
            └────────────────────────┘                   │ plan
                                                ┌────────▼─────────────────────────┐
                                                │ arrancar (ejecuta pasos)          │
                                                │  entrevista · plan en seco ·      │
                                                │  confirmación ajena · aplicar     │
                                                └──┬──────────┬─────────┬───────────┘
                         rsc.correr (node + rsc.js)│          │         │
          ┌──────────────────────────────────────▼─┐  ┌─────▼─────┐ ┌─▼──────────────┐
          │ RSC 2.0.5 empaquetado (EXTERNO, solo    │  │ raíles     │ │ relevo de Node │
          │ lectura): onboard · sync · repair ·     │  │ (aplicar.js│ │ (almacén de la │
          │ doctor --json · reassess · add          │  │  por asist.)│ │  extensión)    │
          └─────────────────────────────────────────┘  └─────┬─────┘ └──────┬─────────┘
                                                                      │ bloques y     │ PATH del
                                                                      │ piezas propias│ anfitrión
                                                                ┌─────▼──────────────▼─────┐
                                                                │ Claude Code (EXTERNO):     │
                                                                │ importa CLAUDE.md, corre   │
                                                                │ los enganches en sh/Git Bash│
                                                                └────────────────────────────┘
```

**Componentes internos:**
- `terreno` dice qué es la carpeta.
- `rumbo` decide qué hacer, y es una función pura.
- `arrancar` hace lo decidido y nada más.
- `rsc.js` es lo único que habla con RSC y lee sus salidas.
- `aplicar.js` pone lo nuestro, para cada asistente declarado.
- `enganches.js` y el relevo hacen que los enganches encuentren `node` sin rutas en ficheros
  versionados.
- `historial.js` guarda en git sin credenciales.
- `conexiones.js` y `sueltas.js` escriben y leen claves.
- `reglas`, `saberes`, `acciones`, `cerebro` y `soporte` enseñan lo que hay.
- `contrato.js` es la prueba nueva, contra el RSC empaquetado.

**Componentes externos:** RSC 2.0.5, que no se modifica, y Claude Code o Codex.

**La decisión de arquitectura que manda.** La barra deja los ficheros de RSC como RSC los deja, y
pone lo suyo en piezas y bloques propios. *Por qué:* cada `sync` reescribe lo de RSC:
- las órdenes de sus enganches (`claude.js:134-145`);
- el orden de `targets` y `catalogVersion` (`install-apply.js:146-161`);
- y quita cualquier enganche con `.rsc/` en la orden (`claude.js:66-70`).

Todo lo que la barra escribe dentro de lo de RSC es escribir en agua, y además choca con P4 y P7.

De aquí sale el resto:
- el relevo va por el PATH, no por rutas absolutas;
- con quién se habla se guarda aparte, no en el orden de `targets`;
- el freno es un enganche propio, sin agujas de RSC;
- los raíles se cargan con un bloque propio en `CLAUDE.md`;
- el `.gitignore` lleva un bloque propio.

**La segunda decisión, abierta hasta medirla** (T3.1): cómo encuentran `node` los enganches.
- **(a) Recomendado:** un relevo del Node de VS Code en el PATH del anfitrión, puesto antes de
  abrir el chat.
- **(b) Plan B:** el Node oficial, descargado en la carpeta del usuario sin administrador.

Lo decide la medida del experimento; lo eligió Jose con esa condición (decisión 4).

## 3. Interfaces y contratos

```text
terreno.reconocer({ profundo }) -> Parte
  Parte añade:
    carpeta.prohibida : null | 'personal' | 'raiz' | 'sistema' | 'contieneLaPersonal'
    carpeta.delicada  : null | 'escritorio' | 'documentos' | 'descargas'
      (por su sitio real, con enlaces, iCloud y OneDrive resueltos; C-5)
    clonado           : .rsc.json sin .rsc/, o ninguna habilidad de RSC declarada en disco
                        (descontando las propias)
    version           : { declarada, clase, relacion: 'igual' | 'vieja' | 'nueva' }   (semver)
    historial.nuestro : el commit raíz es el Punto de partida de la barra
                        (y no «los 20 últimos por autor»)
    dentroDeOtro      : null | { nombre }   (otro git o .rsc.json por encima)
    deRsc             : estado de RSC sin .rsc.json → rama completar, no otroArnes
  - invariante: mirar() no lanza ningún proceso (lo exige una prueba ya existente)

rumbo.elegirRama(parte) -> { rama, preguntar[], pasos[], porQue }
  - ramas nuevas: 'noSePrepara' (B1) · 'versionNueva' (B5)
  - 'sinGit' respeta git.sigueSinCopias: se monta sin ponerGit ni puntoDePartida (B3)
  - 'ponerAlDia' solo si version.relacion === 'vieja'
  - ponerGit en toda rama que monte sobre una carpeta sin .git, salvo sigueSinCopias (B7)
  - preguntar: 'alcance' y 'personas' siempre; 'queConstruir' cuando deQueVa ∈ {software, mixed} (A1, A13)
    · queConstruir → --software-scope: concreta | noLoSe | nada → small · sumando → growing ·
      plataforma → complex ('nada' solo se ofrece con mixed)
    · alcance ∈ {tarea, proyecto, departamento, empresa} y personas ∈ {solo, 2a10, 11a50, masDe50}
      no van a RSC: van al perfil (alcance:, personas:), al nombre sugerido y al primer mensaje
  - pura: ni disco ni procesos (prueba ya existente)

rsc.planEnSeco(flags) -> { planId, gestionados[], seleccionados[{kind,id}], avisos[], politica }
  - lee la vista previa de onboard: «Plan id:», «Managed paths:», «Selected:»,
    «Parent harness detected», «Accept exactly this plan»
  - flags siempre con --goal-base64 (A10)

rsc.aplicarPlan(lineaDeAceptacion) -> Listo{planId}
                                     | SueloAMedias{planId, faltan[]}   stdout
                                                                        ^RSC_ONBOARDING_INCOMPLETE <64hex>$,
                                                                        código 0, id == acceptedPlanId
                                     | Deshecho{motivo}                 stderr RSC_ONBOARDING_INCOMPLETE:, código 4
                                     | PlanCambiado | Invalido{campo} | Fallo{codigo, salida, error}

carpetaAjena.resumen(planEnSeco, disco) -> { tocados[{fichero, enCristiano}], choques[{que, id, sugerido}] }
carpetaAjena.resolver(choques, elecciones) -> Ok | Fallo{fichero}
  - 'renombrar': mueve la carpeta o el fichero a <id>-propia y cambia su name:
  - 'sobrescribir': no hace nada (RSC lo deja en .rsc/backups y se dice)
  - con renombrados, se vuelve a pedir el plan en seco antes de aceptar
  - un Fallo aborta el montaje (C-9)

railes.aplicar(destino, { asistentes: todos los declarados, ajena }) -> { hechos[], pendientes[] }
  - idempotente; en `ajena`, las piezas nuevas que tocan ficheros suyos van a pendientes (C-4)
  - Claude: bloque en CLAUDE.md con @.claude/skills/executive-lab/siempre.md
  - Codex: bloque en AGENTS.md (ya existe)
  - interruptores .rsc/.no-audit, .no-worktree-cleanup, .no-scope-check y, nuevo, .no-gitmoji (A11)
  - bloque de credenciales en el .gitignore de la raíz (F1)
  - freno: enganche PreToolUse(Bash) propio (C1)

relevo.asegurar(contexto) -> { modo: 'nodeDelSistema' | 'relevoVSCode' | 'nodeDescargado' | 'ninguno', carpeta }
  - antepone al PATH solo si no hay ya un node; nunca pone ELECTRON_RUN_AS_NODE en el anfitrión
  - se llama antes de abrir el chat del asistente

freno.mjs (enganche PreToolUse, stdin = JSON del enganche, argv[2] = raíz)
  - si el freno de RSC está en .rsc/ y enganchado en .claude/settings.json → sale 0 sin decir nada
  - si no, carga freno-rsc-2.0.5.mjs, idéntico byte a byte al danger-guard.mjs del paquete

historial.guardar(dir, mensaje) -> { ok, cuantos, excluidos[] }
  - excluye del add las credenciales que reconoce sueltas y que git todavía no seguía (F1)

conexiones.escribir(herramienta, clave, valor) -> Ok | Fallo
  - fuera de [A-Za-z0-9_./:@+=-], el valor va entre comillas simples, con la comilla escapada;
    el lector lo devuelve igual (F3)

asistentes.conQuien() -> id
  - una sola respuesta, de la que tiran donde, saberes.comoSePide, rsc.anadir y los raíles (E2)
  - la elección de esta máquina va en el estado del espacio de trabajo; targets queda para RSC (E1)

rsc.salud(json de doctor) -> { sano, faltan[{id, que}] }
  - entiende 'id:/ruta', {id, action} y {id, path, action}; nunca enseña rutas (G3)

cerebro.huecos() -> [{ fecha, concepto }]
  - bloques «## [fecha] gap | concepto» abiertos; fuera los [FILLED …] (G6)
```

## 4. Datos y flujo

**Entidades** (todas en disco; nada nuevo en la base de nada):
- **El parte**: lo que `terreno` ve.
- **El plan en seco**: lo que RSC propone, sin aplicar.
- **El recibo**: `.rsc.json → onboarding`.
- **El perfil**: `user-profile.md`. RSC escribe `technical_level`, `accompaniment` y `project_kind`.
  Nosotros escribimos `language`, `executive_lab_rails`, `arnes`, `empresa`, y el dial, donde esté
  (`trato.js`).
- **Los raíles**: la habilidad, `siempre.md`, los comandos, los bloques propios, los interruptores y
  el freno.
- **El relevo**: un fichero fuera del proyecto.

**Flujo principal: una carpeta vacía, con «Un poco de todo».**
1. `terreno.reconocer()` → `vacia`.
2. `rumbo` → `desdeCero`.
3. La entrevista:
   - de qué va, qué lleva la carpeta, cuántas personas y, como es «Un poco de todo», qué va a
     construir;
   - después, el objetivo, el nivel y el dial con los escalones de «Cómo te habla»;
   - los nombres, sugeridos por el alcance;
   - y la web.
4. `ponerGit`, con la identidad local puesta.
5. `rsc.planEnSeco()`, con `--goal-base64` y `--software-scope`.
6. `rsc.aplicarPlan()` → `Listo` o `SueloAMedias`. Las dos siguen adelante.
7. Los raíles, para todos los asistentes; `.no-gitmoji` si el plan trae el guardián.
8. Los nombres.
9. El relevo.
10. El punto de partida (se mira su resultado).
11. El primer mensaje.
12. «Qué falta por montar» solo si falta algo, con cada pieza y su botón.

**Flujo secundario: una carpeta ajena, con una habilidad `review` propia.**
1. `terreno` → `empezada` u `otroArnes`.
2. `rumbo` → `encimaDeLoQueHay` / `otroArnes`, ya con `ponerGit` si falta.
3. La entrevista.
4. El plan en seco.
5. `carpetaAjena.resumen()` → la lista de ficheros tocados y un choque (`review`).
6. La pantalla de confirmación y la elección.
7. `carpetaAjena.resolver()`, y otro plan en seco si se renombró.
8. Aplicar.
9. Los raíles en modo ajena: las piezas nuevas que tocan lo suyo van a pendientes.
10. Nada escrito en su historial.

**Qué cambia en las carpetas que ya existen:**
- las que montó la barra reciben las piezas nuevas al abrir, en silencio (decisión 108);
- en las ajenas, esas piezas salen como pendientes, cada una con su botón (C-4);
- `enganches.js` devuelve `node` donde escribió una ruta nuestra y quita `--skip-worktree`
  (2b139bc) si ya no queda ninguna ruta.

Nada destructivo: ningún fichero de la persona se borra.

## 5. Estrategia de pruebas

| Criterios | Nivel | Qué afirma | Qué se finge |
| --- | --- | --- | --- |
| A1, A2, A10, I1 | contrato, contra el RSC empaquetado y en carpetas temporales | cada respuesta del arranque da `Plan id:`; `rumbo.VALORES` ⊆ `ONBOARDING_VALUES`; cada tipo que exige tamaño lo pregunta | nada: RSC de verdad, en seco |
| A3 | contrato, aplicando en temporal | `growing`, `complex` y `small` con «pagos» → `SueloAMedias` con raíles puestos; la forma de código 4 → `Deshecho` | nada |
| A4–A9, A11, A12, B1–B12 | unitaria (`rumbo`, puro, con partes inventados) e integración (`humo.js` con `vscode-falso` y el guion de respuestas) | la rama, las preguntas, los pasos y el texto pintado | `vscode`, el panel y los procesos donde ya se fingen |
| B2, B4, I3 | montaje de verdad (`--con-arnes`) | clon real → `traer`; ajena con choque → nada suyo cambia sin su sí, mismos hashes, ningún commit nuevo | nada |
| C1, C6 | contrato del freno | el envoltorio deniega `rm -rf` en `operations`, deja pasar con el de RSC puesto y con `.no-danger-guard`, y la copia es igual a la del paquete | la entrada del enganche (JSON a mano) |
| C2 | experimento medido (T3.1) y prueba del relevo | con PATH sin node se crea el relevo, se antepone y corre un guion `.mjs` | un PATH sin node |
| C3, F5 | integración | tras montar, el ajuste versionado queda igual que en HEAD y sin marca | nada |
| C4, C5 | unitaria | `RSC_NO_UPDATE_CHECK` puesto; `loApagado()` y los automatismos | el disco (carpeta temporal) |
| D1–D6 | integración de raíles (`aplicar.js` en temporal) | el bloque de `CLAUDE.md`, la idempotencia, la regla 7 contra los verbos de las habilidades `core` del paquete y la lista de palabras contra el diccionario | nada |
| E1–E3 | integración y montaje de verdad de Claude a Codex | la elección sobrevive a un `sync`; hay raíles para los dos; los formatos se leen | `sync` simulado donde basta |
| F1, F3, F4 | integración con git de verdad en temporal | `git ls-files` sin credenciales; `bash -c 'set -a; source .env'` devuelve lo pegado; sin Python, se dice | nada |
| G1, I2 | integración | cada `tipo` del panel se despacha sin excepción | `vscode` |
| G2–G7 | unitaria e integración | orden del arnés y de los módulos, formas de `doctor`, disco antes que declaración, nombres, formato de huecos, suelo | carpeta de app simulada, informe real de `doctor` guardado |
| H1–H6 | comprobaciones de texto | `grep` limpio y comprobador del diccionario rojo al sembrar | nada |

- **La línea de lo real.** Las pruebas de `contrato.js` y `--con-arnes` usan el RSC de verdad y git
  de verdad. Fingirlos es lo que dejó pasar A1 y A2.
- **Lo que tiene que ser real para que la prueba signifique algo:**
  - el RSC empaquetado (no una tabla copiada);
  - git en las copias;
  - `bash` en las claves.
- **Pruebas que hoy dan por bueno el fallo, y se reescriben en su tarea:**
  - el fixture de clon con `.claude/skills` vacío;
  - «Seguir sin copias», que solo mira que se guarda;
  - el orden de `entradaDelArnes`;
  - las viñetas de `gaps.md` en `empresa-falsa.js`;
  - «cada capacidad que ofrecemos existe», que sale siempre «SALTADA».

## 6. Orden y dependencias

1. **F0 · Línea base, cadena y vocabulario.** Va en serie y antes que nada. La parada T0.4 va antes
   de F1.
2. **F1 · El arranque monta con cualquier respuesta.** Depende de F0. En serie: 1.6 → 1.1 → (1.2 +
   1.4 en el mismo commit) → 1.3 → 1.5 → 1.7.
3. **F2 · Las carpetas.** Depende de F1, porque comparte `arrancar`, `rumbo` y `terreno`. En serie.
4. **F3 · Frenos y piezas automáticas.** 3.1, el experimento, va primero; de él dependen 3.2, 3.3 y
   3.4.
5. **F4 · Los raíles.** Depende de 3.4, porque el freno viaja en la carpeta de la habilidad.
   4.2 va antes que 2.5: primero se corta la causa de la versión más nueva y luego se trata el
   efecto. Si F2 va antes, 2.5 se hace al final de F4.
6. **F5 · Asistentes.** Depende de 2.10 y de F4.
7. **F6 · Credenciales y conexiones.** No depende de F1–F5.
8. **F7 · Mapeos.** No depende de F1–F5. 7.1 es un arreglo de una línea y puede ir primero.
9. **F8 · Documentación.** Va al final.
10. **F9 · Cierre.** Va el último.

- **Nada va en paralelo.** F6 y F7 se podrían adelantar, pero todas las fases comparten `humo.js`
  y el árbol es uno solo.
- **Orden obligado:**
  - 1.2 con 1.4: arreglar el tamaño sin arreglar el suelo solo mueve el fallo.
  - 3.1 antes de 3.4: el freno sin `node` no corre.
  - 2.10 antes de F5: volver a montar no puede dejar huérfano un asistente añadido.

## 7. Riesgos y decisiones abiertas

**Riesgos**, de más a menos probable e impactante

| Riesgo | Disparador | Impacto | Cómo se retira |
| --- | --- | --- | --- |
| Arreglar el tamaño enciende SDD, frenos y gitmoji para quien elige «irá creciendo» | 1.2 | Cada copia recibe un BLOCKED, y «No he podido montar» | 1.4 con 1.2; 1.7; contrato (b) monta esos casos |
| El relevo no llega a los enganches: Claude ya estaba abierto, o su proceso no hereda el PATH | 3.1 | C2 sin cumplir | Experimento medido; se dice «ábrela otra vez»; plan B, el oficial |
| Sesiones paralelas en el mismo árbol | Otra sesión escribe | Commits cruzados | Rama propia; comprobar al empezar cada fase (T0.1) |
| El freno propio se desvía del de RSC en otra versión | Subir RSC | Un freno viejo | Prueba de igualdad (P7) |
| Un bloque en `CLAUDE.md` cambia la evidencia de RSC | `reassess` | Recomendaciones raras | `terreno` lo descuenta; `reassess` no aplica nada (decisión 95) |
| El resumen de una carpeta ajena se hace pesado | Una carpeta con muchos choques | Fricción | Una pantalla con «lo mismo para todas» (C-3) |
| Pruebas que dan por bueno el fallo | Reescribir tarde | Verde falso | Se reescriben en su tarea (§5) |

**Decisiones abiertas**
- **El vocabulario (P2).** *Cerrada el 25-09-2026* (spec C-21 y C-22): tres preguntas fáciles en vez
  del tamaño, y los demás textos con el criterio de Jose. Cada texto entra en el diccionario al
  usarse, con el comprobador en verde. **Al cerrar cada fase se le enseñan a Jose las pantallas
  pintadas**; en eso se convierte la parada de vocabulario de cada fase, y no bloquea.
- **(a) o plan B para el relevo.** Se cierra con la medida de T3.1.
- **Windows.** Se cierra en una máquina Windows, con las pruebas ya escritas en pendientes.

## Tareas
<!-- generado por tasks el 24-09-2026; los identificadores son estables, no se renumeran.
     T076 y T077 se añadieron tras la primera pasada de analyze (hallazgos #1 y #6). -->


**Cómo se lee.** Entre paréntesis, junto a cada tarea, va el número que tenía en el plan que aprobó
Jose. `[P]` marca lo que va en paralelo; en este programa no hay ninguna, porque todo comparte
`humo.js` y un solo árbol.

**Qué quiere decir «rojo → verde».** La comprobación se escribe antes que el código y falla. Después
pasa. Y la verificación anota que se pone roja otra vez si se quita el código.

**Atajos de las órdenes:**
- `humo` = `node extension/prueba/humo.js`
- `humo+` = `node extension/prueba/humo.js --con-arnes`
- `contrato` = `node extension/prueba/contrato.js`
- `dicc` = `node docs/comprobar-diccionario.js`
- `batería` = `humo`, `contrato`, `node extension/prueba/empresas-distintas.js`, `dicc` y
  `node herramientas/revisar-powershell.js`

### F0 · Línea base, cadena y vocabulario

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T001 |  | Comprobar que no hay sesiones paralelas y crear la rama (0.1) | `ListAgents` sin sesiones de `interfaz-arnes`; `git branch --show-current` → `todo-cuadra`; `git status --short` vacío | — | Decisión 2 de Jose |
| T002 |  | Pasar la línea base (0.2) | `humo+`: «198 comprobaciones pasadas», código 0. `empresas-distintas`: «las tres empresas, enteras». `dicc`: limpio. `revisar-powershell`: sin pegas. `git log 2b139bc..` vacío. Todo anotado en `progress/todo-cuadra.md` | T001 | Línea base |
| T003 |  | Escribir la propuesta, la spec, `clarify`, el plan y estas tareas (0.3) | `spec-gate.js specs/todo-cuadra.md` → PASS; el plan tiene §0–§7 y esta tabla; el índice los nombra | T002 | Todos |
| T004 |  | Pasar el gate `analyze` (0.3) | `analysis/todo-cuadra.md` con `GATE: PASS` | T003 | Todos |
| T005 |  | Hacer la parada de vocabulario con Jose (0.4) | Su respuesta queda en «Aclaraciones» de la spec, y lo aprobado entra en `docs/diccionario.md`; `dicc` limpio | T004 | P2 · punto abierto «vocabulario» |
| T006 |  | Escribir la decisión 116, el worklog y la entrada en `harness/decisions.md`, y hacer el commit de F0 | Las tres entradas existen; `git log -1` en español y en frase, con el Co-Authored-By; el commit toca solo `02-DOCS/` y `docs/` | T005 | H6 |

### F1 · El arranque monta con cualquier respuesta

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T007 |  | Comprobar que están en el diccionario las palabras de F1 que Jose aprobó en T005 (1.6) | Las filas del tamaño y de los escalones están; `dicc` limpio | T005 | A2, A4 · P2 |
| T008 |  | Escribir `contrato.js` en rojo: todas las respuestas del arranque contra el RSC empaquetado (1.1 a, c, d) | `contrato` sale con código 1 y nombra «mixed sin tamaño» y «large no es un tamaño de RSC». Cuando T010 esté, recorre además cada respuesta de «¿Qué vas a construir?» con los dos tipos que la hacen | T002 | A1, A2, A13, I1 |
| T009 |  | Escribir en rojo la comprobación del suelo a medias (1.1 b) | `contrato` monta en temporal `software/growing`, `software/complex` y `small` con «pagos», y sale rojo porque la barra lo da por fallo; la forma de código 4 se espera `Deshecho` | T008 | A3, I1 |
| T010 |  | Hacer las tres preguntas nuevas y tratar `SueloAMedias`, en el mismo commit (1.2 + 1.4). A todos, alcance y personas; con `software` y con `mixed`, qué va a construir, que se traduce a `small` / `growing` / `complex` (C-21). Alcance y personas van al perfil (`alcance:`, `personas:`), sugieren el nombre y entran en el primer mensaje | `contrato` en verde. `humo`, en verde con cuatro nuevas: «alcance y personas se preguntan a todos», «qué va a construir se pregunta con construir algo y con un poco de todo, y nada más», «cada respuesta da el tamaño de RSC que le toca» y «aplicado con el suelo a medias pone los raíles y ofrece levantarlo». `large` ya no aparece en `arrancar.js` ni en `rumbo.js` (`grep`) | T007, T009 | A1, A2, A3, A13 |
| T011 |  | Mandar el objetivo con `--goal-base64` en las dos llamadas (1.3) | `humo` «un objetivo con & \| ^ % " llega entero», rojo → verde | T010 | A10 |
| T012 |  | Usar en el arranque los cuatro escalones de «Cómo te habla» (1.5) | `humo` «el arranque ofrece los cuatro escalones con sus nombres» y `contrato` con L0 en verde; la habilidad dice L0–L3 | T010 | A4 |
| T013 |  | Dejar `.rsc/.no-gitmoji` con su motivo en las carpetas de alumno (1.7) | `humo` «los raíles apagan el guardián de gitmoji con su porqué» en verde; y en `humo+`, en `software/growing`, el guardián recibe un `git commit -m "Primera versión"` y sale 0 | T010, T005 (veto) | A11 |
| T014 |  | Verificar F1, y escribir la decisión 117, el worklog, la versión y el commit | `batería` y `humo+` en verde; mutación anotada en `verifications/todo-cuadra-F1-<fecha>.md` | T011, T012, T013 | A1–A4, A10, A11 |

**T010 — Interfaces**
- Consume `rsc.aplicarPlan(linea) -> Listo{planId} | SueloAMedias{planId, faltan[]} | Deshecho{motivo} | PlanCambiado | Invalido{campo} | Fallo{codigo, salida, error}`:
  - `SueloAMedias`: la línea de la salida normal `^RSC_ONBOARDING_INCOMPLETE [0-9a-f]{64}$`, con código 0 y la huella igual a `acceptedPlanId`.
  - `Deshecho`: `RSC_ONBOARDING_INCOMPLETE:` por la salida de errores, con código 4.
- Produce en `arrancar.hacerLosPasos`: `SueloAMedias` no es `imprescindible`. Se siguen `ponerLosRailes`, `ponerLosNombres` y `apuntarLosEnganches`, y se añade el encargo `levantarElSuelo`, que nombra `02-DOCS/wiki/sdd/constitution.md` si está en los `floorPaths` del recibo.

### F2 · Las carpetas

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T015 |  | Añadir la guarda de carpeta: la personal, la raíz y las del sistema no se preparan, y Escritorio, Documentos y Descargas enteras se preguntan (2.1) | `humo` en verde, antes rojo, con dos nuevas: «la carpeta personal, la raíz del disco y las del sistema no se preparan» (con la carpeta personal simulada y rutas de macOS y de Windows) y «Documentos entera se pregunta» | T014 | B1 · C-5 |
| T016 |  | Detectar el clon real y reescribir su fixture (2.2) | `humo` «un clon como lo deja git clone cae en traer» en verde; el fixture viejo, con `.claude/skills` vacío, reescrito. Y en `humo+`: se monta, se hace `git clone` a un temporal y se abre, y cae en `traer` | T014 | B2, I3 |
| T017 |  | Respetar «Seguir sin copias» y reescribir su prueba (2.3) | `humo` «con seguir sin copias, preparar monta sin copias y ofrece ponerlas» en verde | T014 | B3, B7 |
| T018 |  | En una carpeta ajena: resumen, confirmación, y sobrescribir o renombrar cada nombre que choque (2.4) | `humo` en verde con dos nuevas: «una carpeta ajena enseña qué se toca y no monta sin el sí» y «un nombre que choca se renombra o se sobrescribe, y sin respuesta no se monta». En `humo+`, sobre un proyecto con historial ajeno y una `.claude/skills/review/` propia: sus ficheros no gestionados tienen el mismo hash, no hay commits nuevos y `review-propia` está intacta | T014 | B4 · C-2, C-3, C-9 |
| T019 |  | Tratar la versión más nueva que la de la clase (2.5) | `humo` «1.4.1 se pone al día, 2.0.13 no se baja sin pulsar» en verde | T041 | B5 · C-10 |
| T020 |  | Decidir «el historial es nuestro» por el commit raíz, y poner la identidad local al hacer `git init` (2.6) | `humo` en verde con tres nuevas: «con identidad global, el guardado solo sigue funcionando», «en un historial ajeno la barra no guarda sola, y el botón sí guarda» y «un clon de un historial de la barra cuenta como suyo». Con `GIT_CONFIG_GLOBAL` apuntando a un temporal y el `~/.gitconfig` sin tocar | T014 | B6 |
| T021 |  | Hacer `ponerGit` en toda rama que monte sin `.git`, y que la radiografía mire `.git` (2.7) | `humo` «toda rama que monta deja historial» y «la radiografía no dice copias sin .git» en verde | T017 | B7 |
| T022 |  | Mandar un montaje nuestro a medias a completar (2.8) | `humo` «estado de RSC sin .rsc.json va a completar» en verde | T014 | B8 |
| T023 |  | Avisar de la carpeta dentro de otra y de las varias raíces (2.9) | `humo` «dentro de otro proyecto se dice antes» y «con varias carpetas se dice cuál» en verde | T015 | B9 |
| T024 |  | Volver a montar con el dial y los asistentes de hoy (2.10) | `humo` en verde con dos nuevas: «completar conserva el dial cambiado y los asistentes añadidos» y «si en ese montaje se cambia el dial, gana el nuevo» | T014 | B11, D5 |
| T025 |  | Poner objetivos propios de una carpeta empezada, y sugerir el tipo por lo que se ve (2.11) | `humo` «con package.json se sugiere seguir con lo que hay y construir algo» en verde | T014 | A5 |
| T026 |  | Primer mensaje y encargos entregados (2.12) | `humo` en verde con dos nuevas: «el primer mensaje dice de quién es la carpeta, pide el perfil y dice si hay freno» y «ningún encargo se queda solo en el registro». `grep` no encuentra «de una pregunta en una pregunta» | T018, T024 | A6, A7 |
| T027 |  | Sin ningún asistente, ofrecer instalarlo con un botón (2.13) | `humo` «sin asistente se ofrece ponerlo» en verde, con `workbench.extensions.installExtension` simulado | T014 | A9 |
| T028 |  | Mirar si el Punto de partida se guardó (2.14) | `humo` «un punto de partida que falla se dice» en verde | T020 | B10 |
| T029 |  | Al volver a montar, comparar la política del plan con la del recibo (2.15) | `humo` «un plan que enciende SDD no se acepta sin el sí» en verde | T024 | A12 |
| T030 |  | Descontar las marcas de principio a fin, no hasta el final del fichero (2.16) | `humo` «lo escrito debajo de la sombra cuenta como suyo» en verde | T014 | B12 |
| T031 |  | Verificar F2, y escribir la decisión 118, que revisa la 28, el worklog, la versión y el commit | `batería` y `humo+` en verde; mutación anotada | T015–T018, T020–T030 | B1–B12, A5–A9, A12 |

**T018 — Interfaces**
- Consume `rsc.planEnSeco(flags) -> { planId, gestionados[], seleccionados[{kind,id}], avisos[], politica }`.
- Produce `carpetaAjena.resumen(planEnSeco, disco) -> { tocados[{fichero, enCristiano}], choques[{que, id, sugerido}] }` y `carpetaAjena.resolver(choques, elecciones) -> Ok | Fallo{fichero}`.
  - Renombrar mueve la carpeta o el fichero a `<id>-propia` y cambia su `name:`.
  - Con renombrados, se vuelve a pedir el plan en seco.

### F3 · Frenos y piezas automáticas

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T032 |  | Experimentar con el relevo de Node y medirlo (3.1) | (1) `humo` «el relevo lanza un guion con el Node de VS Code» en verde, con PATH sin node. (2) En un VS Code de verdad (`npm run probar-en-vscode`), el PATH del anfitrión empieza por la carpeta del relevo y un proceso hijo lo hereda. Con (1) y (2) se escribe en `progress` la decisión entre (a) y el plan B. (3), en una sesión de Claude abierta desde la barra, que `which node` dé el relevo y que se deniegue un `rm -rf`, **pasa a pendientes con Jose y no bloquea** | T031 | C2 · decisión 4 |
| T033 |  | Quitar las rutas absolutas del ajuste versionado, deshacer las nuestras, retirar `--skip-worktree` y decir si los enganches encuentran `node` (3.2) | `humo` en verde con dos nuevas: «tras montar, el ajuste versionado es igual que en HEAD y sin marca» y «sin node y sin relevo posible, la pieza Lo que el arnés hace solo dice No arranca en este ordenador, con su botón». `git ls-files -v .claude/settings.json` sin `S` | T032 | C2, C3, F5 |
| T034 |  | Apagar el aviso de versión del arnés (3.3) | `humo` «con una versión más nueva publicada, el arranque no ofrece actualizar» en verde, con `RSC_LATEST=9.9.9` simulado | T032 | C4 |
| T035 |  | Poner el freno propio: envoltorio, copia fijada y licencia (3.4). **En una carpeta con historial ajeno no se engancha en silencio** (C-4): al montar entra en el resumen de T018, y al reponerse los raíles sale como pieza pendiente con su botón | `humo` en verde con cuatro nuevas. (1) «el freno deniega en operations las seis órdenes de C1»: `rm -rf` de una carpeta, `git push --force`, `git reset --hard`, `DROP TABLE`, `DELETE` sin `WHERE` y `curl … \| bash`. (2) «con el freno de RSC puesto, el nuestro deja pasar». (3) «con .no-danger-guard deja pasar». (4) «en una carpeta con historial ajeno, reponer los raíles no engancha el freno sin su sí». Además, la prueba de P7 incluye la copia, y `cmp` entre la copia y el `danger-guard.mjs` del paquete da 0 | T032 | C1 · decisión 1 · P4 |
| T036 |  | Hacer que «Las reglas» diga qué freno hay y de quién es (3.5) | `humo` «con codeHooks false y el freno propio, Las reglas lo lista armado y dice su origen» en verde; `nombres.json` ya no dice «con todos los alumnos» | T035 | C1 |
| T037 |  | Arreglar los interruptores y automatismos de «Las reglas» (3.6) | `humo` «lo apagado se nombra sin repetir, y la memoria apagada sale apagada» en verde | T014 | C5 |
| T038 |  | Correr `sync` después de `repair` (3.7) | `contrato` «tras arreglar en una carpeta operations no quedan frenos de RSC» en verde | T032 | C6 |
| T039 |  | Verificar F3, y escribir la decisión 119, el worklog, la versión y el commit | `batería` y `humo+` en verde; mutación anotada; pendientes de Windows escritos | T033–T038 | C1–C6, F5 |

**T035 — Interfaces**
- `freno.mjs`: recibe por stdin el JSON de PreToolUse y en `argv[2]` la raíz.
  - Si `.rsc/danger-guard.mjs` existe y `.claude/settings.json` lo engancha → `exit 0` sin decir nada.
  - Si no → `await import('./freno-rsc-2.0.5.mjs')`.
- Enganche: `node "${CLAUDE_PROJECT_DIR}/.claude/skills/executive-lab/freno.mjs" "${CLAUDE_PROJECT_DIR}"` en `PreToolUse`, con `matcher: "Bash"`, sin `.rsc/` en el texto.

### F4 · Los raíles

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T040 |  | Poner `siempre.md` y el bloque de `CLAUDE.md` que lo importa, y descontarlo en `terreno` (4.1). **En una carpeta con historial ajeno, el bloque no se añade en silencio** (C-4): al montar entra en el resumen de T018, y al reponerse los raíles sale como pieza pendiente con su botón. En una carpeta que creó la barra, se pone como hoy | `humo` en verde con cuatro nuevas: «aplicar.js escribe una vez el bloque de CLAUDE.md», «otroMontaje no lo cuenta», «SKILL.md no copia las innegociables de siempre.md» y «en una carpeta con historial ajeno, reponer no toca su CLAUDE.md sin su sí». La prueba de la tabla de asistentes sigue en verde | T035 | D1 · C-11 · P4 |
| T077 |  | Hacer que el comprobador del diccionario exporte `palabrasProhibidas()` y siga funcionando como guion (parte de 8.2, adelantada) | `node -e "require('./docs/comprobar-diccionario.js').palabrasProhibidas().length"` da un número mayor que 20; `dicc` sale igual que antes | T014 | D3, H2 |
| T041 |  | Completar la regla 7 y barrer los verbos de RSC (4.2) | `humo` «todo npx @ericrisco/rsc de las habilidades core queda cubierto por la regla 7» en verde, y rojo si se quita un verbo | T040 | D2 |
| T042 |  | Poner en la habilidad la lista completa de palabras prohibidas (4.3) | `humo` «la lista de la habilidad es la del diccionario» en verde | T040, T077 | D3 |
| T043 |  | Con Codex, habilidad propia en vez de comando (4.4) | `humo` «en Codex la habilidad no manda crear comandos» en verde | T040 | D4 |
| T044 |  | Dejar como prueba que el dial se lee igual escrito de cualquiera de las dos formas (4.5) | `humo` «accompaniment y accompaniment_level dan el mismo dial» en verde | T024 | D5 · C-7 |
| T045 |  | Detectar raíles caducados por cualquiera de sus piezas (4.6) | `humo` «unos comandos o un bloque viejos cuentan como raíles de antes» en verde | T040 | D6 |
| T046 |  | Verificar F4, y escribir la decisión 120, el worklog, la versión y el commit (T019 va aquí, tras T041) | `batería` y `humo+` en verde; mutación anotada | T019, T041–T045, T077 | D1–D6, B5 |

### F5 · Asistentes

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T047 |  | Dar una sola respuesta a «qué asistente» (5.0) | `humo` «con dos declarados y uno instalado, todas las pantallas coinciden» en verde | T024, T046 | E2 |
| T048 |  | Guardar con quién se habla aparte de `targets` (5.1) | `humo` «tras un sync que ordena, la elección sigue» en verde | T047 | E1 |
| T049 |  | Cambiar de asistente con `sync --target` y sus raíles (5.2) | `humo+` «de Claude a Codex deja .codex/rsc con las 32 y la nuestra» en verde | T048, T050 | E1 |
| T050 |  | Poner raíles para todos los asistentes declarados (5.3) | `humo` «con claude y codex declarados, los dos tienen raíles» en verde | T047 | E2 |
| T051 |  | Corregir `compartido` y los formatos de los demás asistentes (5.4) | La prueba de la tabla compara también `compartido` y el formato, y está en verde | T050 | E3 |
| T052 |  | Verificar F5, y escribir la decisión 121, el worklog, la versión y el commit | `batería` y `humo+` en verde | T048–T051 | E1–E3 |

**T047 — Interfaces**
- `asistentes.conQuien() -> id`: una sola función, de la que tiran `donde.paraQuien`, `saberes.comoSePide`, `rsc.anadir` y `aplicar.js`.
- La elección de esta máquina vive en el estado del espacio de trabajo; `.rsc.json → targets` queda para RSC.

### F6 · Credenciales, conexiones y copias

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T053 |  | Poner el bloque de credenciales en el `.gitignore` de la raíz (6.1) | `humo` «el bloque se pone una vez y no saca de git lo que ya estaba» en verde; en las ajenas va a pendientes (C-4) | T014 | F1 |
| T054 |  | No meter credenciales en una copia, y decirlo; el raíl `guardar.md` igual (6.2) | `humo` «guardar en git deja fuera .env, credentials.json y x.pem de la raíz, y lo dice» en verde, con git de verdad en un temporal: `git ls-files` no los tiene. El guardado automático pasa por la misma función y queda cubierto por esta prueba; el asistente, por el bloque de T053 | T053 | F1 |
| T076 |  | Tapar los valores de las claves conocidas en lo que se pinta de una consulta y en el informe de «Algo va mal» (F2) | `humo` en verde con dos nuevas: «una consulta que imprime una clave la enseña tapada» y «el informe no lleva ningún valor de los .env de la carpeta». Las dos se ponen rojas si se quita el tapado | T054 | F2 |
| T055 |  | Mirar qué imprime `git push` cuando falla, y limpiar el token si hace falta (6.3) | `humo` «un push fallido no deja el token en el informe» en verde, con un remoto simulado que falla | T014 | F2 |
| T056 |  | Guardar las claves con comillas que aguanten `source` (6.4) | `humo` «una clave con # $ espacio ' ` ; llega entera a la prueba y no se ejecuta» en verde, con `bash -c 'set -a; source .env; printf %s "$X"'` | T014 | F3 |
| T057 |  | Ver si hay Python antes de lanzar un `.py`, y pedir en los raíles guiones en bash o node (6.5) | `humo` «sin Python, un .py no se lanza a ciegas y se dice qué falta» en verde | T014 | F4 |
| T058 |  | Verificar F6, y escribir la decisión 122, el worklog, la versión y el commit | `batería` y `humo+` en verde; mutación anotada | T053–T057, T076 | F1–F4 |

**T054 — Interfaces**
- `historial.guardar(dir, mensaje) -> { ok, cuantos, excluidos[] }`.
- `excluidos` son las credenciales que ya reconocen `sueltas.buscar()` y `sueltas.ficherosDeAcceso()`, y que git todavía no sigue. Se excluyen con pathspec.

### F7 · Mapeos

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T059 |  | Importar `encargos` y mandar a la extensión cada mensaje del panel (7.1) | `humo` «todo tipo que manda el panel se despacha sin excepción», rojo hoy → verde | T014 | G1, I2 |
| T060 |  | Poner primero el arnés y los módulos del `.vsix`, y reescribir su prueba (7.2) | `humo` «con una app antigua con la 1.4.1, gana la del .vsix» en verde, con la prueba vieja del orden reescrita | T014 | G2 |
| T061 |  | Decidir la salud en «Algo va mal» por `doctor --json`, y leer bien sus formas (7.3) | `humo` «con un informe real de doctor, faltan nombres y no rutas» en verde | T014 | G3 |
| T062 |  | Mirar el disco en `anadir()` y `queSabe()` (7.4) | `humo` «declarada y no en disco no sale como instalada» en verde; y `contrato` «instalar una habilidad desde la barra deja catalogVersion en 2.0.5» en verde, con el RSC empaquetado | T014 | G4, D2 |
| T063 |  | Poner nombre a los comandos por lenguaje, y clasificarlos por `state.commands` (7.5) | `humo` «los comandos por lenguaje del paquete tienen nombre y son del arnés» en verde, leyendo `commands.js` del paquete | T005 | G5 |
| T064 |  | Leer las preguntas en el formato de RSC, dejar fuera el andamio y reescribir el fixture (7.6) | `humo` «dos abiertas y una FILLED dan dos» en verde; `empresa-falsa.js` escribe bloques y no viñetas | T014 | G6 |
| T065 |  | Mirar el suelo como RSC (7.7) | `humo` «falta un fichero de la plantilla y no se dice Listo» en verde | T014 | G7 |
| T066 |  | Verificar F7, y escribir la decisión 123, el worklog, la versión y el commit | `batería` y `humo+` en verde; mutación anotada | T059–T065 | G1–G7 |

**T061 — Interfaces**
- Consume la salida de RSC `doctor --json` (`scripts/doctor.js:186-193,235-237`), que trae tres
  formas:
  - `missing: ["<id>:<ruta absoluta>"]`;
  - `missingAgents: [{ id, action }]`;
  - `missingCommands: [{ id, path, action }]`.
- Produce `rsc.salud(json) -> { sano, faltan[{ id, que: 'habilidad' | 'agente' | 'comando' }] }`, sin
  ninguna ruta.

**T064 — Interfaces**
- Consume `02-DOCS/wiki/gaps.md` en el formato de RSC (`skills/harness/references/wiki-gaps-template.md`):
  - bloques `## [YYYY-MM-DD] gap | {concepto}`;
  - con una línea `Status: open`;
  - con `[FILLED YYYY-MM-DD]` cuando ya se contestó.
- Produce `cerebro.huecos() -> [{ fecha, concepto }]`: solo los abiertos.

### F8 · Documentación, diccionario y repositorio

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T067 |  | Poner al día los README, las notas, el `.iss` y `probar.ps1`, y calcular el recuento de preguntas con `rumbo` (8.1) | `grep -rn "cinco preguntas\|0\.9\.1" README.md publicar.sh extension/README.md` vacío; `humo` «el recuento de preguntas sale de rumbo» en verde | T031 | H1, A8 |
| T068 |  | Dejar una sola lista de palabras prohibidas, y arreglar la prueba que salía siempre «SALTADA» (8.2) | `dicc` revisa también `nombres.json`, `capacidades.json` y los instaladores; se pone rojo al sembrar una palabra; ya no queda la «SALTADA» de las capacidades | T077 | H2 |
| T069 |  | Sacar de git los cuatro comandos de RSC, y decir la verdad en `untrustedWorkspaces` (8.3) | `git ls-files -ci --exclude-standard` vacío | T014 | H3 |
| T070 |  | Reescribir los doce «Prueba con "Algo va mal"» (8.4) | `grep -rn "Prueba con" extension/src extension/media/panel.js` vacío | T005 | H4 |
| T071 |  | Contarle a Eric las seis cosas de RSC (8.5) | `docs/para-rsc.md` las tiene con fichero y línea; la issue queda preparada para que la abra Jose | T039 | H5 |
| T072 |  | Verificar F8, y escribir la decisión 124, el worklog, la versión y el commit | `batería` en verde | T067–T071 | H1–H6 |

### F9 · Cierre

| ID | [P] | Tarea | Hecho cuando | Depende de | Traza |
| --- | --- | --- | --- | --- | --- |
| T073 |  | Pasar `verify`: la batería, `humo+`, I3 y la mutación de cada prueba nueva (9.1) | `verifications/todo-cuadra-<fecha>.md` con el veredicto de cada criterio de la spec | T072 | Todos · I3 |
| T074 |  | Pasar `review` con los tres refutadores (correctness, security, tests) sobre el diff entero (9.2) | Cada comentario verificado; lo que se acepta queda arreglado o apuntado | T073 | Todos |
| T075 |  | Entregar el informe a Jose y parar antes de merge, push y publicación (9.3) | Informe entregado; `git log main..todo-cuadra` = un commit por fase | T074 | — |

## Previsión de carga de revisión

| Dimensión | Previsión | Por qué |
| --- | --- | --- |
| Líneas cambiadas | 3.000–4.500 | 77 tareas; unas 45 comprobaciones nuevas; `contrato.js` nuevo; la documentación |
| Ficheros y zonas | unos 35: el arranque, los raíles, las pantallas, los módulos comunes, las pruebas y los documentos | Ver «Ficheros que se tocan» en el plan aprobado |
| Riesgo de revisión | alto | El arranque, la seguridad de las credenciales, el freno y el entorno del anfitrión |
| Entrega | por fases, un commit por fase | Cada fase se revisa sola, en unas 300–700 líneas (el tope por defecto es 400). F3 y F6, de seguridad, llevan una pasada del refutador de seguridad al cerrar la fase, además de la de F9 |
