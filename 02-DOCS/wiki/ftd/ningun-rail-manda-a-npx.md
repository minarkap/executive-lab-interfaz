---
type: ftd
title: Ningún raíl manda correr npx sin versión
date: 2026-09-24
status: hecho
---

# Ningún raíl manda correr npx sin versión

## Intent

Salió mirando otra cosa: el comando `/save-session` le dice al asistente que corra el paquete del
arnés con `npx` y **sin número de versión**. Sin versión se trae la última publicada —hoy la 2.0.13,
cuando esta clase corre la 2.0.5 fijada—, así que basta con que alguien pulse ese comando para que
su carpeta deje de correr el mismo catálogo que el resto. Y choca de frente con la decisión 6, que
quitó `npx` a propósito: en Windows es un `.cmd`, tarda, y necesita red.

Cuatro comandos lo dicen (`/save-session`, `/resume-session`, `/learn`, `/checkpoint`) y **los cuatro
son de RSC**: los reescribe entero en cada actualización, así que editarlos es escribir en agua. El
quinto sí era nuestro: el raíl `seguir`.

## Scope

**Dentro**

- El raíl `seguir`: la vuelta se lee con lo que ya está instalado en la carpeta
  (`node .rsc/session-memory.mjs resume`), que es local y no baja nada.
- La habilidad `executive-lab`, regla 7: prohibido `npx` sin versión, con qué usar en su lugar y en
  qué orden. Vive ahí porque es lo único de esto que RSC no reescribe.
- Una prueba que barre todos los raíles y falla si alguno vuelve a mandar correr el paquete sin
  versión, o la última publicada.

**Fuera, a propósito**

- Editar los cuatro comandos de RSC: se pierden en la siguiente actualización.
- Cambiar la versión fijada del arnés. Sigue siendo decisión de Jose.

## Checklist

- [x] El raíl `seguir` no nombra `npx` y dice el mecanismo local — prueba, y las dos copias iguales.
- [x] La habilidad lleva la regla y dice qué usar en su lugar — prueba.
- [x] Ningún `.md` de `skills/` manda correr el paquete sin versión ni la última publicada — prueba nueva.
- [x] El mecanismo local existe y responde — comprobado en esta carpeta.
- [x] Los raíles instalados aquí, repuestos con la versión de hoy — `aplicar.js` sobre esta carpeta.
- [x] Las cuatro suites en verde.

## Evidence

Observado el 24-09-2026 sobre la rama `lo-que-no-puede-haber-se-dice`.

- `node .rsc/session-memory.mjs resume` responde con el registro exacto de esta rama
  (`match: exact`, la rama, el head y los ficheros tocados). O sea que el mecanismo que ahora manda
  el raíl no es una suposición.
- La prueba nueva, `✓ ningún raíl manda correr npx sin versión — sin npx suelto, y la regla escrita
  donde el arnés no la pisa`. Antes de arreglar el raíl, la misma prueba lo cazaba.
- `aplicar.js` sobre esta carpeta: `.claude/skills/executive-lab/` y `.claude/commands/` repuestos,
  y `diff` contra `skills/` sin diferencias.
- Suites: `humo.js` → **191 comprobaciones pasadas** · `empresas-distintas.js` → las tres enteras ·
  `comprobar-diccionario.js` → limpio · `revisar-powershell.js` → sin pegas.

## Next

Queda vivo, y no es de esta feature: `.claude/settings.json` está versionado y el instalador le
reescribe los enganches con la **ruta absoluta del Node de esta máquina**
(`/Users/…/ExecutiveLab/runtime/bin/node`). Es lo correcto en el ordenador de un alumno y lo
incorrecto en un repositorio compartido: al guardarlo, un clon se lleva una ruta que ahí no existe.
Por eso ese fichero se ha dejado fuera de la copia. Decidir Jose: excluirlo de git, o que el
instalador escriba algo que no dependa de la máquina.
