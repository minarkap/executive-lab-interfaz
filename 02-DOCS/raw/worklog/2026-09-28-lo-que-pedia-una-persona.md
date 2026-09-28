---
type: worklog
title: Lo que pedía una persona delante
description: Con «sigamos», tres de las cuatro cosas que parecían pedir una persona se comprobaron sin ella. El .exe se compila, se instala en silencio y pasa 14 de 14 en una máquina Windows de GitHub. La barra pasa 7 de 7 en un VS Code de Windows. Y en una conversación de verdad con Claude, sin node, el freno para un rm -rf. Decisión 129.
timestamp: 2026-09-28T17:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Lo que se hizo

- **El `.exe`, en la máquina Windows de GitHub**: se compila, se instala en silencio y `probar.ps1` da 14
  de 14. Era lo que más bloqueaba sentar alumnos, y nunca se había ejecutado.
- **La barra en un VS Code de Windows**: 7 de 7, con el relevo lanzando el `Code.exe` del editor.
- **Una conversación de verdad con Claude**, en una carpeta montada como la deja la barra y sin node:
  - `which node` da el relevo;
  - el freno para un `rm -rf`;
  - las reglas de `siempre.md` están cargadas.

## Lo que salió por el camino

- **`probar.ps1` nunca había podido correr en Windows**:
  - Las rayas «—» le cerraban las cadenas en el PowerShell 5.1, que lee un UTF-8 sin BOM como
    Windows-1252.
  - Con un solo fallo salía con 0, porque el `.Count` de un objeto suelto es nulo.
  - Tomaba por un error el «errors» de un aviso de Node.

  El revisor de PowerShell vigila ahora las dos primeras.
- **El relevo no se reconocía a sí mismo en Windows** cuando la unidad llegaba en otra caja.
- **Al volver a `main`, git borró `.rsc/.no-gitmoji` de esta carpeta**, y el guardián de gitmoji paró el
  siguiente commit. Es el caso que la decisión 127 dejaba para «otra copia», y pasa también al cambiar de
  rama.
- **En zsh, una variable sin comillas no se parte en palabras**: el primer montaje de la carpeta de
  prueba mandó a `onboard` todas las opciones como una sola.
- **El Codex de este Mac es demasiado viejo** para los modelos de una cuenta de ChatGPT. No se actualiza
  sin Jose.

## Pruebas

- Windows (GitHub, run 36438957469):
  - `el-exe`, 14 de 14;
  - `vscode-de-verdad`, 7 de 7;
  - `windows`: `windows.js` todo bien, `humo.js` 327 y `contrato.js` 14.
- Mac: `humo.js` 327, `npm run probar-en-vscode` 7 de 7, y el revisor de PowerShell limpio.
- Una conversación de Claude Code 2.1.276: cuatro turnos, 0,35 $, los enganches de arranque con 0.

## Lo que queda

- Codex hablando, con su CLI actualizada.
- El corte de la URL del puente a 2.048 caracteres, SmartScreen y un usuario sin administrador.
