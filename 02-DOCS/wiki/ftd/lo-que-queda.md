---
type: ftd
title: Lo que quedaba de «Todo cuadra»
date: 2026-09-28
status: en-curso
---

# Lo que quedaba de «Todo cuadra»

## Intent

El programa «Todo cuadra» (F0–F9) cerró con 60 de 61 criterios cumplidos y una lista de diez cosas que
quedaban para Jose, porque salían fuera del proyecto o pedían su decisión: publicar, subir, tocar los
instaladores, los tres nombres que faltaban en el diccionario, las issues de RSC y la versión del arnés.
Jose respondió el 28-09-2026: **«HAz tu lo que queda»**. Este documento es esa lista, hecha.

## Scope

**Dentro**

1. Tres nombres para el diccionario: los avisos del arranque de RSC que se apagan (`.no-git`,
   `.no-harness` y el de versión nueva) salían en clave o no salían.
2. Retirar el motor de JavaScript de las copias: la barra no lo usa, nada lo trae y su prueba salía
   siempre saltada.
3. Los instaladores: la versión del `.iss` y lo que esperan `probar.ps1` y los dos `COMO-PROBARLO.md`.
4. La prueba en un VS Code de verdad (T032 (2)), con el relevo de Node medido dentro del editor.
5. Una subida de verdad a GitHub con el token en la cabecera.
6. Push de `todo-cuadra`, PR, fusión y publicar la versión de la barra.
7. La versión del arnés: leer la 2.0.15 contra la 2.0.5 y decidir con lo que diga.
8. Las issues de RSC que sigan vivas en la versión que se quede.

**Fuera, y por qué**

- Lo que solo se comprueba con Windows delante: el relevo en Git Bash y en PowerShell, `py -3`, el
  `.exe` y el corte de la URL a 2.048 caracteres. En este Mac no se puede; se deja dicho con su prueba.
- Que Codex, hablando, cargue la habilidad: pide a Codex delante.

## Checklist

- [x] 1. Los tres avisos, por su nombre — prueba roja («Git · Harness») y verde; seis mutaciones, mueren las seis.
- [x] 2. El motor de JavaScript, retirado — roja con la biblioteca al lado (`'js' !== 'binario'`) y verde.
- [x] 3. Los instaladores al día — roja por la versión (0.9.0) y, después, por lo que buscaba `probar.ps1` (git, harness); verde.
- [x] 4. `npm run probar-en-vscode` en verde, con el relevo — 7 de 7; la mutación del PATH lo tumba. Cazó «Diagnóstico del puente».
- [ ] 5. Subida de verdad con el token en la cabecera.
- [ ] 6. Rama subida, PR fusionada y versión publicada.
- [ ] 7. La 2.0.15 leída, y la decisión escrita.
- [ ] 8. Las issues, abiertas o descartadas con su motivo.

## Evidence

Observado el 28-09-2026 en la rama `todo-cuadra`, sobre 9b34437.

- `humo.js` → 325 · `--con-arnes` → 333 · `contrato.js` → 13 · las tres empresas enteras ·
  diccionario limpio (718 rótulos) · PowerShell sin pegas.
- `npm run probar-en-vscode`, en un VS Code descargado a `~/.cache/executive-lab-vscode-test`, sin node en
  el PATH y sin la app: «✓ sin node en el ordenador, el relevo va el primero y los hijos lo heredan — el
  relevo lanza el de VS Code, y el freno deniega». La primera vuelta falló en «ninguno revienta al
  ejecutarlo»: `executiveLab.diagnosticoPuente (salida.clear is not a function)`. Arreglado, con prueba.
- Pantallas: la sección «Lo que quedaba» en https://claude.ai/artifact/JRBxy4Mcbz7MMQ2uY8drre (v6).
- Decisión 126 en `docs/decisiones.md`; diario en `02-DOCS/raw/worklog/2026-09-28-lo-que-queda.md`.

## Next

(al cerrar)
