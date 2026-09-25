---
type: proposal
title: Propuesta — Todo cuadra, la auditoría de la barra sobre RSC 2.0.5
description: La auditoría entera de la barra contra RSC 2.0.5, con fichero y línea, las alternativas que se pesaron y la recomendación. Es la entrada de investigación de la spec todo-cuadra.
timestamp: 2026-09-24T15:30:00Z
topic: sdd
slug: todo-cuadra
status: aprobada en autopilot
---

# Propuesta — todo-cuadra

## Problem

La barra promete leer lo que RSC monta y enseñarlo sin mentir. La auditoría del 24-09-2026
encontró que, en tres casos habituales, no se cumple:

- dos respuestas del arranque impiden montar el arnés;
- la mayoría de las carpetas de alumno no tienen freno ante órdenes peligrosas, y la barra dice
  que sí;
- con Claude, las reglas de los raíles no se cargan seguro en cada sesión.

En total, 56 hallazgos: 3 críticos, 14 altos, 29 medios y 10 bajos. D5 bajó de medio a bajo en
`clarify`.

## Intent

Jose, 24-09-2026: *«audites y revises todo y redactes un plan para arreglar todo aquello que no esté
perfectamente hecho, por ejemplo, todos los mapeos con las credenciales, con las skills, con las
tools, las preguntas al inicio, cuando se implementa en brownfield versus greenfield el init, todo
[…] Hazlo para un plan de SDD de tipo de este arnés y en autopilot»*. Y después: *«dale en
autopilot»*.

## Scope / Non-scope

**Dentro:** todo lo que la barra, los raíles y los módulos comunes hacen con lo que RSC monta:
- el arranque en carpeta vacía, empezada, clonada, rara o ajena;
- los frenos y enganches;
- los raíles y los asistentes;
- las credenciales y las copias;
- los mapeos de habilidades, comandos, agentes, reglas y conocimiento;
- la documentación y las pruebas que habrían cazado lo gordo.

**Fuera:**
- cambiar RSC: lo que es suyo va a `docs/para-rsc.md`;
- publicar el `.vsix`, hacer push o merge: son decisiones de Jose;
- probar en Windows: queda en su lista, con la prueba concreta;
- firmar los instaladores.

## Research input

- **RSC 2.0.5**, leído desde la copia que viaja en el proyecto:
  `extension/media/harness/node_modules/@ericrisco/rsc/` (`scripts/`, `scripts/lib/`, `targets/`,
  `skills/`, `manifest.json`).
- **La barra**: `extension/src/*`, `extension/media/panel.js`, `nombres.json` y `capacidades.json`;
  los raíles de `skills/`; los módulos de `instalador/comun/`; y las pruebas de `extension/prueba/`.
- **La documentación del proyecto**: `docs/decisiones.md` (1–115), `docs/auditoria.md`,
  `docs/auditoria-codex-y-claude.md`, `docs/friccion.md`, `docs/para-rsc.md` y la constitución.
- **La documentación oficial de Claude Code**, sobre los enganches y `CLAUDE.md`:
  - un enganche que falla no bloquea la orden (*hooks-guide*);
  - los enganches corren en `sh -c` en macOS y en Git Bash en Windows (*hooks*);
  - `CLAUDE.md` importa `@ruta`, que se carga al empezar cada sesión (*memory*).
- **Método**:
  - tres exploraciones en paralelo (RSC por dentro, los mapeos contra RSC, el arranque);
  - lectura propia de cada hallazgo de peso;
  - una revisión adversarial que intentó tumbarlos: confirmó 14, matizó 2 y añadió 8.
- **Línea base**, en la rama `todo-cuadra` desde `main` (2b139bc): 198 comprobaciones pasadas con
  `--con-arnes`, con dos que salen «SALTADA».

## Hallazgos

Severidad:
- **CRÍTICO**: un caso habitual no funciona, o deja al alumno sin protección.
- **ALTO**: falla en un caso frecuente, o miente sobre lo que hay.
- **MEDIO**: caso menos frecuente, calidad o texto falso.
- **BAJO**: cosmético o raro.

Las rutas de RSC son relativas a `extension/media/harness/node_modules/@ericrisco/rsc/`.

### A. Las preguntas del arranque

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| A1 | CRÍTICO | **«Un poco de todo» no monta nunca.** RSC exige tamaño para `software` **y** `mixed`; la barra solo lo pregunta y lo manda con `software`. RSC responde `RSC_ONBOARDING_REQUIRED`, no hay `Plan id:`, y el alumno ve «No he podido montar el arnés» | `scripts/lib/onboarding.js:45-47,379` · `arrancar.js:184,319` · `rumbo.js:39-41` |
| A2 | CRÍTICO | **«Construir algo» con «Va para largo» no monta.** La barra manda `large`, y RSC solo acepta `small\|growing\|complex` → `RSC_ONBOARDING_INVALID`. `rumbo.VALORES.tamano` incluye `large`, que no existe | `onboarding.js:15` · `arrancar.js:286` · `rumbo.js:33` |
| A3 | ALTO | RSC tiene **dos** `RSC_ONBOARDING_INCOMPLETE`. Por la salida normal, con código 0 y la huella, quiere decir «aplicado, falta el suelo»: la constitución, cuando el plan practica SDD. Por la de errores, con código 4 y «Recover with», quiere decir «deshecho». La barra trata el primero como un fallo: no pone raíles, ni nombres, ni enganches. Ya pasa hoy con software pequeño y un objetivo que diga «pagos» o «clientes»; con A1 y A2 arreglados, todo «va para largo» caería aquí | `rsc.js:204-205,223-228` · `onboarding-apply.js:205` · `onboarding.js:179-183,201,297-301` · `arrancar.js:200,531,540-547` |
| A4 | MEDIO | No se ofrece L0 (RSC ofrece de L0 a L3); la habilidad dice `L1 \| L2 \| L3` | `rsc.js:154-159` · `arrancar.js:47-51` · `skills/executive-lab/SKILL.md:68` |
| A5 | MEDIO | En una carpeta empezada, los objetivos sugeridos son los de una vacía, y «¿De qué va esto?» no aprovecha lo que ya se ve | `arrancar.js:53-59` · `terreno.js:59-78` |
| A6 | MEDIO | **El primer mensaje al asistente se queda corto en cuatro cosas:** no dice que la carpeta ya era de alguien, no pide el descubrimiento que `init` espera en el perfil, no dice si hay freno, y pone «de una pregunta en una pregunta» | `extension.js:1297` · `skills/init/references/discovery.md:88-90` |
| A7 | MEDIO | Los encargos `ordenarLaCarpeta` y `levantarElSuelo` solo se apuntan en el registro. La pieza que ofrecería el primero exige el estado `empezada`, y después de montar ya no se da | `extension.js:1233-1235` · `terreno.js:591` |
| A8 | BAJO | El recuento miente en pantalla: «te pregunto una sola cosa». El README y las notas dicen cinco; son entre seis y diez | `brujula.js:158` · `README.md:64,166` · `publicar.sh` |
| A9 | MEDIO | Sin ningún asistente instalado se monta para Claude en silencio, y después «díselo a tu tutor»: un callejón sin salida (P1) | `arrancar.js:93` · `asistentes.js:120` |
| A10 | BAJO | **El objetivo que escribe el alumno viaja en claro.** En el camino de reserva de Windows pasa por `cmd.exe`, donde `citar()` no escapa `& \| ^ %` | `procesos.js:92-96` · `rsc.js:68` |
| A11 | ALTO | **Arreglar A2 enciende el guardián de gitmoji y la puerta SDD** para quien elija «irá creciendo». El raíl `guardar.md` hace que el asistente guarde en español, así que cada copia de ese alumno recibiría un «BLOCKED» en inglés | `onboarding.js:229-232` · `aplicar.js:162-166` · `skills/comandos/guardar.md` |
| A12 | MEDIO | **Volver a montar acepta un plan distinto sin decirlo**, y ese plan puede encender SDD, frenos o agentes (decisión 95) | `arrancar.js:186-196` · `rumbo.js:181-187` |

### B. Greenfield, brownfield, clon y carpetas raras

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| B1 | ALTO | **Nada impide preparar la carpeta personal o la raíz del disco.** Haría `git init` en `~` y escanearía el disco entero. RSC escribiría enganches y habilidades en `~/.claude/`, que es la configuración global de Claude de esa persona | no hay comprobación en `terreno.js`, `arrancar.js` ni `proyecto.js` |
| B2 | ALTO | **Un clon de una carpeta preparada por la barra se da por sano.** `executive-lab` viaja en git, así que nunca se llega a `clonado`: la barra dice «Esto ya estaba montado y entero» y faltan 32 habilidades. La prueba del clon usa un `.claude/skills` vacío | `install-apply.js:301-316` · `terreno.js:317` · `humo.js` («un clon se ve…») |
| B3 | ALTO | **«Seguir sin copias» es un callejón**: se guarda, `rumbo` no lo lee, y el aviso sale para siempre | `arrancar.js:484` · `rumbo.js:124` |
| B4 | ALTO | **En una carpeta ajena no se enseña ni se confirma lo que RSC va a tocar**, mientras la pantalla promete «No voy a tocar nada de esto». Además, una habilidad suya con el nombre de una de RSC se borra y se enlaza encima | `panel.js:1499` · `arrancar.js:186-196,504` · `targets/index.js:20-23` · `rsc.js:545-557` |
| B5 | MEDIO | **Una carpeta montada con un RSC más nuevo se llama «versión anterior» y se baja.** `sync` reescribe `catalogVersion` y falla a medias si hay habilidades que solo existen en la versión nueva | `terreno.js:235` · `rumbo.js:140-146` · `install-apply.js:53-63,146-161` |
| B6 | MEDIO | **«El historial es nuestro» mira el nombre del autor en los 20 últimos commits.** `ponerGit` hace `git init` sin identidad | `terreno.js:40-48` · `arrancar.js:265-269` |
| B7 | MEDIO | Varias ramas no llevan `ponerGit`, y la radiografía dice «Copias… Listas» sin mirar `.git` | `rumbo.js:144-199` · `terreno.js:560-566` |
| B8 | MEDIO | **Un montaje nuestro a medias sale como «montado a mano».** `deRsc` se calcula y no se usa, y el README manda borrar `.rsc.json` | `terreno.js:169,310-311` · `README.md:222` |
| B9 | MEDIO | **Carpetas anidadas y de varias raíces.** Una carpeta dentro de otro repositorio crea un repositorio anidado, y se pierde el aviso de arnés padre. Con varias raíces se usa la primera sin decirlo | `rsc.js:130` · `proyecto.js:10-13` · `disfraz.js:164,238,271` |
| B10 | BAJO | El Punto de partida no mira si guardar salió bien | `arrancar.js:391` |
| B11 | MEDIO | **Volver a montar reescribe el perfil desde el recibo.** El dial vuelve atrás, y los asistentes añadidos después se caen del plan | `onboarding-apply.js:69-80,173-175,193-199` · `arrancar.js:294-305` |
| B12 | BAJO | La marca de la sombra de RSC se descuenta con una expresión voraz, que llega hasta el final del fichero | `terreno.js:134` · `agents-md-shadow.js:61-62` |

### C. Frenos y enganches

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| C1 | CRÍTICO | **Con Claude, RSC solo engancha los frenos cuando el plan practica SDD**; si no, los quita. «Llevar el día a día», «Crear cosas», «Estudiar un tema» y el software pequeño no tienen freno ante órdenes peligrosas. La barra, la decisión 99 y el README dicen lo contrario, y «Las reglas» enseña la sección vacía. La habilidad `init` de RSC promete el freno según el nivel técnico: la contradicción es de RSC | `onboarding.js:201,229-232,277` · `targets/claude.js:164,227-241` · `nombres.json:343-349` · `reglas.js` (`losGuardianes`) · `skills/init/SKILL.md:167-172` |
| C2 | ALTO | **Sin Node instalado no corre ningún enganche en el camino de la extensión.** Un enganche que no encuentra `node` no bloquea la orden: no hay freno, ni brújula al empezar, ni memoria, y aparece un aviso de error en cada orden | `claude.js:92-110` · `arrancar.js:249-250` · documentación de Claude Code |
| C3 | MEDIO | **La ruta absoluta del Node de esta máquina acaba en `.claude/settings.json`**, que viaja en git, y se reescriben órdenes `node` que no son de RSC. Hoy lo mitiga en git la marca `--skip-worktree` (2b139bc), a costa de que un `git pull` se pare | `enganches.js:69-86` · `claude.js:134-145` · 2b139bc |
| C4 | MEDIO | El aviso de versión nueva del arnés sigue vivo, y le dice al asistente que corra `@latest` | `session-start.mjs:269,285` |
| C5 | MEDIO | **«Las reglas» tiene tres fallos:** `feature-gate` y `worktree-cleanup` salen sin traducir; la memoria sale activa cuando está apagada; y faltan los interruptores `.no-git` y `.no-harness` y el aviso de versión | `reglas.js:109,118-134` · `install-apply.js:252-273` · `memory.js:33-35` |
| C6 | MEDIO | **`repair` pone los frenos aunque el plan no los pida, y el siguiente `sync` los quita.** Que haya frenos o no depende de la última orden que corrió | `repair.js:141-142` · `claude.js:112,227-241` |

### D. Raíles

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| D1 | ALTO | **Con Claude, `executive-lab` solo se carga si el asistente decide invocarla.** RSC solo inyecta `suggest` o su resumen de tres líneas | `targets/session-start.mjs:47` · `claude.js:128-134` · `sitios.js:66` |
| D2 | ALTO | **La regla 7 no se aplica en la práctica.** Es general, pero solo manda si la habilidad está cargada. `suggest` manda correr `npx` sin versión y `@latest`. Y cada `add` o `sync` reescribe `catalogVersion` con la versión que corrió, así que la carpeta va y viene entre versiones | `.rsc/skills/suggest/SKILL.md:46,64` · `SKILL.md:48-60` · `install-apply.js:146,159` |
| D3 | MEDIO | La habilidad remite a `docs/diccionario.md`, que no está en la carpeta del alumno | `skills/executive-lab/SKILL.md:28-32` |
| D4 | MEDIO | Manda crear `.claude/commands/` también con Codex | `SKILL.md:99-118` |
| D5 | BAJO | **El dial tiene dos nombres**: RSC usa `accompaniment` y `orient` usa `accompaniment_level`. *Corregido en `clarify`*: la barra ya lee los dos (primero el de `orient`) y escribe donde estén (`trato.js:47,66-72,94-110`; decisión 33), así que no queda un dial que la barra no vea. Lo que sí falla es B11: volver a montar reescribe el dial con el del recibo | `.rsc/skills/orient/SKILL.md:41,55` · `trato.js` |
| D6 | BAJO | Los raíles caducados se detectan solo por `SKILL.md` | `terreno.js:259-270` |

### E. Asistentes

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| E1 | ALTO | **Cambiar de asistente solo reordena `targets`**, y RSC los ordena en cada escritura. No se monta nada para el asistente nuevo | `asistentes.js:117-169` · `install-apply.js:149,155` · `onboarding.js:40-41` |
| E2 | MEDIO | **Los raíles y la barra no se ponen de acuerdo en el asistente.** Los raíles se ponen solo para `targets[0]`. Y la barra responde de dos maneras a «qué asistente»: el primero declarado o el primero instalado | `aplicar.js` · `donde.js:34` · `asistentes.js:80-83` · `saberes.js:52` · `rsc.js:93` |
| E3 | MEDIO | **`compartido` y los formatos de otros asistentes están mal.** `compartido` falla en windsurf, cline, roo, continue y kiro. Y se leen mal los `.mdc` de Cursor, los `.prompt.md` de Copilot y los `/x.md` de Cline | `sitios.js:102-162` · `_md-block.js:21-36` · `index.js:43` · `acciones.js:30-100` |

### F. Credenciales, conexiones y copias

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| F1 | ALTO | **«Guardar en git» hace `git add -A`, y en la raíz RSC solo ignora `.rsc/`.** Un `.env`, un `credentials.json` o un `*.pem` sueltos entran en la copia y suben a GitHub | `historial.js:213` · `install-apply.js:301-316` · `_TEMPLATE/gitignore` |
| F2 | BAJO | **El token de GitHub va dentro de la URL de `git push`.** Si un error la repite, el token acabaría en el informe | `historial.js:257-261` |
| F3 | ALTO | **Las claves se guardan sin comillas, y `test_connection.sh` las carga con `source`.** Una contraseña con `#`, `$`, espacio o comilla invertida queda cortada o se ejecuta | `conexiones.js:402-418,470-471` · `_TEMPLATE/test_connection.sh:18-20` |
| F4 | MEDIO | **Los guiones en Python no corren donde están los alumnos.** La convención de RSC es Python 3.11 o más; en Windows no hay Python, y el de Apple es el 3.9 | `conexiones.js:446` · `skills/harness/references/tools-readme-template.md:41` |
| F5 | MEDIO | En una carpeta nueva, la ruta del Node de esta máquina entra en el primer commit | `rumbo.js:216` · `arrancar.js:383,391` · `enganches.js` |

### G. Mapeos de habilidades, comandos, diagnóstico y conocimiento

| # | Sev | Qué pasa | Evidencia |
|---|---|---|---|
| G1 | ALTO | «Resolver una incidencia» revienta siempre: `encargos` no se importa | `extension.js:16-52,739` |
| G2 | ALTO | **El arnés y los módulos de un instalador antiguo mandan sobre los del `.vsix`.** Pasa en los ordenadores anteriores a la decisión 27 | `entorno.js:143-156,172-181` · `instalar.js:124-149` |
| G3 | MEDIO | **`doctor` siempre sale con 0.** «Algo va mal» se fía de ese código, y la radiografía pinta `[object Object]` y rutas absolutas | `rsc.js:707-712` (RSC) · `soporte.js:122` · `doctor.js:186-193,235-237` · `extension/src/rsc.js:202-210` |
| G4 | MEDIO | `anadir()` y `queSabe()` dan por instalada una habilidad solo declarada | `extension/src/rsc.js:94-95,120-123` · `saberes.js:105` |
| G5 | MEDIO | Los 33 comandos por lenguaje no tienen nombre en español y se clasifican como del alumno | `targets/commands.js:104-133` · `acciones.js:88-108` · `install-apply.js:244-246` |
| G6 | MEDIO | **«Preguntas sin contestar» nunca sale.** Las carpetas de trabajo de RSC cuentan como conocimiento, y los `[Archived]` no se excluyen | `skills/harness/references/wiki-gaps-template.md` · `cerebro.js:59,94-139,288-297` |
| G7 | MEDIO | El suelo de la barra solo mira carpetas; RSC exige también ficheros y la constitución | `proyecto.js:27-33` · `onboarding-apply.js:311-344` |

### H. Documentación, diccionario y repositorio

| # | Sev | Qué pasa |
|---|---|---|
| H1 | MEDIO | **La documentación está desfasada:** README, notas de `publicar.sh`, `.iss`, `probar.ps1` y `COMO-PROBARLO.md` |
| H2 | MEDIO | **P2 tiene más de una lista.** La prueba del catálogo usa diez palabras propias, y `nombres.json` y los instaladores no se comprueban. La prueba «cada capacidad que ofrecemos existe» sale siempre «SALTADA» |
| H3 | BAJO | Cuatro comandos de RSC están en git y en el `.gitignore` a la vez, y `package.json` promete que el disfraz apaga la confianza |
| H4 | BAJO | Los doce «Prueba con "Algo va mal"» |
| H5 | — | Seis de RSC para `docs/para-rsc.md`: C1, C6, B4, D5, G3 y B11 |
| H6 | BAJO | La numeración de las decisiones repite la 71, la 109 y la 110; se sigue en la 116 |

### I. Pruebas que habrían cazado lo gordo

- **I1 · Contrato de respuestas.** Cada combinación de respuestas del arranque, contra el RSC empaquetado, tiene que dar un plan, y aplicarse en los casos SDD.
- **I2 · Mensajes del panel.** Todo mensaje que manda el panel se despacha sin excepción.
- **I3 · Montaje de verdad.** Un montaje real por cada clase de carpeta.

## Alternatives considered

1. **No construir: decirlo.** Documentar los fallos, avisar en la barra y seguir. Es barato, pero
   los dos críticos del arranque impiden montar, y lo que la barra dice de los frenos seguiría
   siendo falso: no arregla lo que importa.
2. **Solo los críticos y los altos.** Un tercio del trabajo con la mayor parte del valor. Los medios
   quedan vivos, y varios son la misma clase de fallo que los altos: un cero donde no puede haber
   otra cosa. Se volverían a descubrir uno a uno.
3. **Todo, en un programa por fases (recomendada).** Una spec paraguas y fases con su verificación,
   su decisión y su commit. Es lo que pidió Jose, y es la forma de no dejar clases de fallo a medias.

## Tradeoffs

- **Anchura contra riesgo.** Se tocan unos 25 módulos. Lo acotan tres cosas: una fase cada vez, el
  TDD, la línea base y un commit por fase que se puede revertir solo.
- **El freno propio se aparta de RSC**, por decisión de Jose. Se acota con una copia byte a byte, una
  prueba de igualdad contra el paquete y el aviso a Eric.
- **Un `node` de relevo toca el entorno del anfitrión de extensiones.** Se acota con un experimento
  medido antes de aplicarlo, y con un plan B.

## Risks

- **Sesiones paralelas en el mismo árbol.** Rama propia, y comprobación al empezar cada fase.
- **Pruebas que hoy dan por bueno el fallo.** Se reescriben en su tarea.
- **P2 frena el autopilot.** Una parada de vocabulario, una sola vez.

## Rollback

Cada fase es un commit en la rama `todo-cuadra`, que no se une a `main` sin Jose. Deshacer una fase
es `git revert` de ese commit. Nada se publica ni se sube.

## Success criteria

Los criterios de aceptación de `specs/todo-cuadra.md` en verde, cada uno con su prueba. A eso se
suman la batería entera, `--con-arnes`, las pruebas de contrato con RSC y una revisión adversarial
sin hallazgos abiertos.

## Recommendation

La alternativa 3, con las cuatro decisiones de Jose:
1. Freno propio donde RSC no pone el suyo.
2. Rama propia y esperar a las sesiones paralelas.
3. Confirmación en carpetas ajenas, con sobrescribir o renombrar cada habilidad que choque.
4. El Node de VS Code como relevo, y el oficial como plan B.
