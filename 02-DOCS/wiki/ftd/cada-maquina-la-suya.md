---
type: ftd
title: Cada máquina la suya, y git en silencio
date: 2026-09-24
status: hecho
---

# Cada máquina la suya, y git en silencio

## Intent

Jose: *«cómo solucionamos lo de higiene? hazlo para que funcione bien, en todas las máquinas cada
uno en la suya»*.

Lo que quedaba abierto de la decisión 111: `.claude/settings.json` está versionado —RSC lo quiere
así y el `.gitignore` lo dice— y dentro van los enganches, que empiezan llamando a `node`. En el
ordenador de un alumno no hay ningún `node` en el PATH, así que `enganches.js` los reescribe con la
ruta completa del nuestro. Resultado: un fichero que viaja a todas las máquinas queda con una ruta
que solo existe en una, y **sale siempre como modificado, en todas**.

Lo peligroso ya se arregló (decisión 111: quien clona se lo repara su propia instalación). Lo que
quedaba muerde de otra manera: el botón *Guardar en git* de la barra hace `add -A`
(`historial.js:213`), así que tarde o temprano alguien sube la ruta de su casa y el siguiente que
clone se la lleva.

La solución que se descartó por insuficiente: marcarlo a mano en el ordenador de Jose. Eso arregla
una máquina, y el problema lo tienen todas.

## Scope

**Dentro**

- `instalador/comun/enganches.js`: después de dejar el enganche apuntando al node de esta máquina,
  decirle a git **de este clon** que ese fichero ya está como tiene que estar (`--skip-worktree`).
  Corre en cada instalación y en cada wizard, así que lo hace cada máquina por su cuenta.
- Solo si hay git, la carpeta es un repositorio, el fichero está versionado y **difiere** del
  repositorio. Si no difiere no se marca: esconder por adelantado un fichero que está bien es
  esconder el próximo cambio de verdad.
- La copia que viaja en el paquete, regenerada.
- Prueba con un repositorio de verdad en temporal.

**Fuera, a propósito**

- Sacar `settings.json` de git, o partir los enganches en `settings.local.json`: ya se descartó en
  la decisión 111 con su motivo —RSC lo quiere versionado, y dos ficheros que Claude Code fusiona
  pueden acabar ejecutando los enganches dos veces—.
- Buscar «una ruta mejor». No la hay: el node bueno está en un sitio distinto en cada ordenador, y
  esa es la razón de que este módulo exista.

## Checklist

- [x] Arreglado el enganche, git deja de contar ese fichero como un cambio — prueba con repositorio de verdad.
- [x] En el disco queda la ruta de esta máquina y en el repositorio la forma portable — la misma prueba.
- [x] Sin git, sin repositorio o sin versionar, no se cae y el enganche se arregla igual — la misma prueba.
- [x] No se marca un fichero que no difiere del repositorio — condición explícita en el código.
- [x] La prueba sirve: mutada la línea, falla — verificado por mutación.
- [x] La copia empaquetada, al día — `preparar-paquete.js`, y la prueba que lo exige en verde.
- [x] Aplicado a esta carpeta: `settings.json` deja de salir modificado sin perder la ruta de Jose.
- [x] Las cuatro suites en verde.

## Evidence

Observado el 24-09-2026 sobre la rama `cada-maquina-la-suya`.

- La prueba nueva: `✓ el arreglo de cada máquina deja de contar como un cambio suyo — el disco con
  su ruta, git en silencio, y el repositorio portable`. Monta un repositorio en temporal, comete la
  forma portable, arregla el enganche y exige `git status` limpio, la marca puesta (`git ls-files
  -v` devuelve `S`), y que `HEAD` conserve `"command": "node `.
- **Verificada por mutación**: comentada la línea que marca, la prueba falla con
  `+ 'M .claude/settings.json'`. Restaurada, vuelve a pasar.
- Aplicado a esta carpeta con el node de la aplicación:
  `Enganches apuntando a …/ExecutiveLab/runtime/bin/node: 0 fichero(s); 1 ya no lo cuenta git como
  cambio tuyo`. Cero ficheros tocados —la ruta de Jose ya estaba bien y se respeta—, y
  `git status` deja de sacar `.claude/settings.json` por primera vez en semanas. En el disco siguen
  sus 7 enganches con su ruta; en `HEAD`, los 7 con `node` a secas.
- Suites: `humo.js` → **196 comprobaciones pasadas** · `empresas-distintas.js` → las tres enteras ·
  `comprobar-diccionario.js` → limpio · `revisar-powershell.js` → sin pegas.

## Next

Nada pendiente. El precio, dicho en el código y aquí: mientras la marca está puesta, un `git pull`
que traiga un cambio de ese fichero se para y hay que quitarla a mano
(`git update-index --no-skip-worktree .claude/settings.json`). Se para ruidosamente, que es como
este proyecto prefiere fallar.
