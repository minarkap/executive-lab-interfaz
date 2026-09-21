# Dos cosas para Eric

Salieron montando esta barra sobre RSC, y las dos son de RSC, no nuestras. Están
contra la **2.0.5** y comprobadas leyendo el paquete publicado, no deducidas.

Ninguna nos bloquea: las dos tienen rodeo y lo hemos puesto. Van por si sirven.

---

## 1. `optOuts` se escribe en `.rsc.json` y no lo lee nadie

**Qué pasa.** `install-apply.js:135` recorre `.rsc/` buscando ficheros `.no-*` y
guarda sus nombres en `.rsc.json → optOuts`:

```js
optOuts = readdirSync(dir).filter((f) => f.startsWith('.no-')).map((f) => f.slice(4)).sort();
```

`.rsc.json` se comitea, así que la decisión viaja con el repositorio. Pero
**ningún guardián la lee**. Los once deciden con el fichero local:

```js
// targets/gitmoji-guard.mjs:229
if (existsSync(join(root, '.rsc', '.no-gitmoji'))) allow();
```

Y `.rsc/` es exactamente lo que `install-apply.js:301` añade al `.gitignore`:

```js
const wanted = ['.rsc/'];
```

`optOuts` aparece nueve veces en todo el paquete —`scripts/install-apply.js`,
`scripts/rsc.js`, `scripts/lib/manifest-file.js`— y **las nueve son escrituras o
valores por defecto**. Cero lecturas.

**Qué se ve.** Un equipo decide que aquí no se escriben commits con gitmoji y
crea `.rsc/.no-gitmoji`. El siguiente `sync` lo recoge y `.rsc.json` pasa a decir
`optOuts: ["gitmoji"]`, comiteado. Alguien clona. `.rsc.json` sigue diciendo que
el equipo lo descartó, el fichero local no viajó, y **el primer `git commit -m`
del recién llegado sale denegado** por una convención que ya estaba decidida.

Con `gitmoji-guard` duele más que con los otros porque bloquea la orden más
frecuente que hay, y porque el mensaje de recuperación le dice que cree un
fichero que su equipo ya creó.

**Rodeo que hemos puesto.** Sacar esa línea del `.gitignore`:

```gitignore
.rsc/*
!.rsc/.no-gitmoji
```

Funciona, pero es una excepción a mano por cada interruptor, y hay once:
`.no-audit`, `.no-claudemd-check`, `.no-context7`, `.no-danger-guard`,
`.no-feature-gate`, `.no-git`, `.no-gitmoji`, `.no-harness`, `.no-scope-check`,
`.no-ship-guard`, `.no-worktree-cleanup`.

**Lo que parece que falta.** Que el guardián mire las dos: el fichero local
—que es la decisión de esta máquina— y `optOuts` del manifiesto —que es la del
equipo—.

```js
const apagado = existsSync(join(root, '.rsc', '.no-gitmoji'))
  || (readManifest(root)?.optOuts || []).includes('gitmoji');
```

El campo ya existe, ya se rellena solo y ya viaja. Solo falta leerlo.

---

## 2. `scanProject` no lee el `.gitignore`, y el plan se construye sobre lo que
   haya dentro

**Qué pasa.** `scanProject` (`scripts/lib/onboarding.js:64`) recorre la carpeta
entera para construir la evidencia del plan, saltando una lista fija:

```js
const ignored = new Set(['.git', '.rsc', 'node_modules', '.venv', '.next',
  'dist', 'build', 'coverage', '__pycache__', '.dart_tool', /* …los asistentes… */]);
```

Lo que no esté en esa lista cuenta, esté o no en el `.gitignore`.

**Qué se ve.** Este proyecto descargaba dos copias de VS Code para probar:
`extension/.vscode-test/` (901 MB, lo pone `@vscode/test-electron` por defecto)
y una carpeta de demo (729 MB). Las dos gitignoradas desde el primer día. RSC las
leyó enteras, y entre las dependencias de la extensión de Copilot que VS Code
trae dentro está `react`.

Resultado: el plan de una barra lateral escrita en JavaScript plano traía
`skill/react`, los ayudantes `react-build-resolver` y `react-reviewer`, y los
comandos `react-build` y `react-review`. Y `reassess` recomendaba las cuatro
cosas aplazadas con la explicación *«the project added authentication,
external-integrations, persistence evidence»* — señales que salen de
`scanProject:118-121`, que casa `auth`, `session`, `payment`, `migration` contra
**la ruta** de cada fichero. Las rutas eran las del propio editor.

La evidencia congelada decía `sourceFileCount: 14` cuando el plan se aceptó y el
proyecto tenía 14 ficheros de verdad; después el ruido la llevó por otro lado. Al
sacar las dos carpetas fuera quedó en **81 ficheros, `node`, sin señales de
complejidad**, que es lo que hay.

**Rodeo que hemos puesto.** Que no se descarguen dentro: `cachePath` en
`@vscode/test-electron` y `$HOME/.cache` para la demo. Lo hemos subido a regla
del proyecto, porque vale para cualquiera con arnés: *lo que se descarga no entra
en la carpeta*.

**Lo que parece que falta.** Respetar el `.gitignore` sería lo más fiel a lo que
alguien espera —lo que no versiono no me define— pero cambia la identidad del
plan de todo el mundo, así que entendemos que no sea gratis. Con dos cosas más
pequeñas se habría evitado esto:

- añadir `.vscode-test` a la lista de ignorados, que es tan estándar como
  `coverage` o `dist`;
- y, sobre todo, **decir en el plan sobre cuántos ficheros se ha decidido**.
  `renderPlan` imprime las decisiones pero no la evidencia; un
  `Evidence: 81 source files · node` habría cantado a la primera, porque nadie
  mira un `sourceFileCount` dentro de un JSON de 300 líneas.

---

## Lo que sí funcionó, por si vale como señal

El salto de la 1.4.1 a la 2.0.5 no nos rompió nada, y eso no es lo normal en un
mayor. Copiamos tres tablas vuestras (`targets/index.js`, `commands.js`,
`agents.js`) porque la barra no puede depender de los interiores de un paquete
que puede no estar — y las tres estaban **idénticas byte a byte**. El esquema de
`.rsc.json` también. Y ninguno de los marcadores que parseamos
(`Plan id:`, `Accept exactly this plan`, `RSC_ONBOARDING_READY`,
`RSC_PLAN_CHANGED`, `RSC_REASSESSMENT_*`, `Nothing to repair`, `[fix]`/`[ask]`)
había cambiado.

El protocolo de dos pasadas con huella es lo que nos deja montar sin terminal:
enseñamos el plan, lo acepta una persona, y si el árbol cambió entre medias
`RSC_PLAN_CHANGED` lo para. Y `RSC_ONBOARDING_INCOMPLETE` saliendo por la salida
normal con código 0 —instalado pero sin suelo— es exactamente la distinción que
necesitábamos para no llamar «error» a lo que no lo es.
