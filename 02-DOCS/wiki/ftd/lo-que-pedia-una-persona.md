---
type: ftd
title: Lo que pedía una persona delante
date: 2026-09-28
status: en-curso
---

# Lo que pedía una persona delante

## Intent

«Lo que quedaba» cerró con una lista de cosas que, en principio, pedían una persona o una máquina de
alumno. La respuesta de Jose fue «sigamos». Esto es lo que de esa lista se puede comprobar sin persona:
con la máquina Windows de GitHub, que es gratis para un repositorio público, y con una conversación de
verdad lanzada desde aquí.

## Scope

**Dentro**

1. El `.exe` de Windows: compilarlo con Inno, instalarlo en silencio y correr `probar.ps1`, todo en la
   máquina de GitHub.
2. La barra en un VS Code de Windows de verdad, con el relevo lanzando el binario del editor.
3. Una conversación de verdad con Claude en una carpeta montada como la deja la barra, sin ningún `node`
   y con el relevo delante: que `which node` dé el relevo, que el freno pare un `rm -rf` y que las
   reglas de los raíles estén cargadas (T032 (3)).
4. Una conversación de verdad con Codex en una carpeta montada para él: que cargue la habilidad
   `executive-lab` desde el bloque de `AGENTS.md`.

**Fuera, y por qué**

- SmartScreen y un usuario sin administrador: la máquina de GitHub es un Windows Server con
  administrador, y SmartScreen se ve al descargar con Edge.
- El corte de la URL del puente a 2.048 caracteres: pide la extensión del asistente y una conversación
  en el editor.

## Checklist

- [ ] 1. El `.exe`, compilado, instalado en silencio y comprobado con `probar.ps1`.
- [ ] 2. La barra en un VS Code de Windows, 7 de 7.
- [x] 3. Una conversación de verdad con Claude, con el relevo — `which node` da el relevo, el freno para
  el `rm -rf` y las reglas de `siempre.md` están cargadas. Los enganches de arranque salen con 0.
- [ ] 4. Una conversación de verdad con Codex — **bloqueada**: el Codex de este Mac (0.137.0) no puede
  hablar con los modelos que admite una cuenta de ChatGPT. Hace falta actualizarlo, y eso toca la
  instalación del sistema y quizá `~/.codex`: es de Jose.

## Evidence

Observado el 28-09-2026 en la rama `lo-que-pedia-una-persona`.

- **Claude, de verdad**:
  - Claude Code 2.1.276, en una carpeta con un arnés de «operaciones» de la 2.0.15 y los raíles
    encima.
  - El PATH solo tenía el relevo y lo del sistema, y el relevo lanzaba el binario del VS Code
    descargado.
  - `which node` dio el relevo.
  - El `rm -rf ./informes` salió «BLOCKED for a non-technical user…», y `informes/uno.md` sigue en
    su sitio.
  - Las reglas cargadas: «las de `CLAUDE.md`, que a su vez carga `.claude/skills/executive-lab/siempre.md`
    — español siempre, vocabulario cerrado, nunca mandarte a escribir órdenes tú, una pregunta cada vez».
  - Los dos enganches de arranque, con 0 y sin errores. Cuatro turnos, 0,35 $.
- **Codex**: `codex exec` responde «The 'gpt-6-astra' model requires a newer version of Codex». Con
  `-m gpt-5` y `-m gpt-5-codex`, «not supported when using Codex with a ChatGPT account».
- **Windows**, en la máquina de GitHub:
  - el `.exe` se compila («Successful compile», 21 s);
  - `probar.ps1` no llegaba a leerse en el PowerShell de Windows, por las rayas «—», y ya está
    arreglado;
  - la barra en un VS Code de Windows pasó 6 de 7, y la séptima era de la propia prueba y del relevo,
    que no se reconocía con la unidad en otra caja; las dos cosas están arregladas.

## Next

(al cerrar)
