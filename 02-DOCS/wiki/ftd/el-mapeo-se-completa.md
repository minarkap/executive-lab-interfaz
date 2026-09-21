---
type: ftd
title: El mapeo se completa — todo lo que RSC puede montar tiene nombre y sitio
date: 2026-09-21
status: hecho
---

# El mapeo se completa

## Intent

Jose: *«quiero que revises todo y mapees todo bien»*. Se inventarió el paquete RSC 2.0.5 que viaja
dentro de la barra —catálogo, comandos, agentes, guardianes, interruptores, ficheros que escribe en
la carpeta, hooks que engancha— y se cruzó pieza a pieza con lo que la barra lee y nombra. Lo que
no tenía nombre o sitio, lo tiene al terminar esto.

## Lo encontrado (auditoría)

| Pieza de RSC | Estado antes | Qué se hace |
|---|---|---|
| 273 habilidades del catálogo | 90 con nombre en la barra; **183 sin nombre** (saldrían con el identificador humanizado y sin frase) | Las 183 entran en `capacidades.json` con nombre, frase, palabras y para qué carpeta |
| 29 agentes por lenguaje + `spec-miner` | Patrones cubren `-reviewer`/`-build-resolver`, pero `cpp`→«Cpp», `csharp`→«Csharp», `mle`→«Mle», `rag`→«Rag»; `spec-miner` sin nombre | Tabla de nombres de lenguaje para los patrones; `spec-miner` con nombre |
| Comandos (`checkpoint`, `learn`, `save-session`, `resume-session` + SDD en otros asistentes) | Todos en `nombres.json` | Nada |
| 3 guardianes | Nombrados y con estado | Nada |
| Lo que el arnés hace solo sin parar nada: `session-start`, `worklog-checkpoint`, `userprompt-gate`, `worktree-reaper`, memoria entre conversaciones, `context7`, revisión periódica, aviso de ámbito, aviso de CLAUDE.md | **Ninguno se nombraba** | Lista «Lo que hace solo, sin parar nada» dentro del mismo desplegable que los guardianes, con su estado |
| Interruptores en disco `.rsc/.no-*` (aquí: `.no-audit`, `.no-context7`, `.no-gitmoji`, `.no-scope-check`, `.no-worktree-cleanup`) | La radiografía solo leía `optOuts` de `.rsc.json` | «Lo que tiene apagado» une los dos y nombra cada uno en español |
| `02-DOCS/wiki/harness/installation-plan.md` y `onboarding.acceptedAt` | No se leían | Pieza «El plan de montaje» en la radiografía, con la fecha y un botón que lo abre |
| `.rsc/automation-gaps.md` (lo que `skill-scout` apunta tras cada trabajo) | No se leía | Se mira si tiene propuestas; si las hay, Sugerencias lo dice |
| `.rsc/memory/lessons`, `backups/`, `01-TOOLS/_TEMPLATE`, `02-DOCS/*`, `.rsc.json` (versión, tier, plan) | Ya mapeados | Nada |
| `sello*` (recibos de revisión, opcional y aquí sin activar), `eval-sandbox/`, `.base-versions.json` | Fontanería interna sin cara de usuario | Se deja constancia en el diccionario como «no se nombra» |

## Scope

**Dentro**: lo de la tabla. **Fuera**: cambiar qué instala RSC, el sello (no está activado aquí) y
publicar la versión.

## Checklist

- [x] Toda habilidad del catálogo de RSC tiene nombre en la barra — prueba que lee el manifiesto del paquete y exige 0 sin nombre.
- [x] Cada entrada nueva de `capacidades.json` trae nombre, frase, ≥2 palabras y un `para` válido, sin palabras prohibidas y con el nombre en mayúscula y sin verbo delante — prueba.
- [x] `cpp-reviewer` → «Revisor de C++», `mle-reviewer` → «Revisor de ML en producción», `spec-miner` con nombre — prueba.
- [x] Lo que hace solo se lista con estado, y los interruptores en disco lo apagan — prueba en carpeta temporal.
- [x] «Lo que tiene apagado» une `optOuts` y `.no-*`, en español y sin repetir — prueba.
- [x] «El plan de montaje» sale con fecha y abre el fichero — `dondeVive('plan')` en la prueba; en esta carpeta, «Aceptado el 21 de septiembre».
- [x] `automation-gaps.md` con propuestas → consejo en Sugerencias — prueba.
- [x] Diccionario al día, `comprobar-diccionario.js` limpio, `humo.js` y `empresas-distintas.js` en verde.

## Evidence

Observado el 21-09-2026 sobre la rama `los-apartados-se-ordenan-y-el-mapeo-se-cierra`.

- Catálogo: la fusión comprobó que las 183 entradas nuevas son exactamente las 183 sin nombre
  (`faltan: - · sobran: -`) → `capacidades: 242 (183 nuevas)`. Dos rondas de arreglo que pillaron
  las pruebas existentes, no yo: 18 nombres empezaban por verbo («Escribir una habilidad») y cinco
  por minúscula («fal.ai», «htmx», «n8n», «vLLM», «iOS con Swift»); renombrados.
- `✓ todo lo que RSC puede montar tiene nombre en la barra — 273 habilidades y 29 agentes, todos
  con nombre`.
- `✓ lo que el arnés hace solo se nombra, y lo apagado se dice en español — nueve automatismos con
  nombre, cuatro apagados dichos en español`.
- `✓ lo que el arnés dice de sí mismo llega a la pantalla, no se tira — 14 piezas` (ahora exige
  «Formato al guardar en git» en vez de «gitmoji»).
- `✓ cada habilidad instalada cae en un montón` — `react` pasa a ser «una del catálogo completo» y
  la que se humaniza es `mi-cosa-rara`.
- Lectura real de esta carpeta: 9 automatismos (5 activos, 4 apagados: recogida de copias,
  revisión periódica, arnés duplicado, context7); *Lo que tiene apagado* = «Formato al guardar en
  git · Recogida de copias de trabajo · La revisión periódica de habilidades · El aviso de arnés
  duplicado · Documentación al día (context7)»; plan de montaje abrible; `cpp-reviewer → Revisor de
  C++`, `spec-miner → Extractor de especificación`, `elixir-reviewer → Revisor de Elixir`.
- `node extension/prueba/humo.js` → **181 comprobaciones pasadas** (dos nuevas). `empresas-distintas.js`
  → `las tres empresas, enteras`. `comprobar-diccionario.js` → `Todo el texto de pantalla respeta el
  diccionario`. `revisar-powershell.js` → `4 ficheros revisados, sin pegas`.

## Next

Nada pendiente. Publicar la 0.23.0 sigue siendo decisión de Jose (`/publicar-una-version`).
