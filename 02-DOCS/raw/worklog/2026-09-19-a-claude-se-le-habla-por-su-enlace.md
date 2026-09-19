---
type: worklog
title: A Claude se le habla por su enlace, no por sus comandos
description: Los botones abrían una conversación vacía. Con permiso de Jose se leyó la extensión de Claude Code 2.1.276 y se probó el enlace documentado en su máquina: el enlace entrega el texto y los comandos no, aunque el manejador del enlace llame a uno de ellos. Arreglado en la 0.15.3, y de paso dos defectos nuestros en la 0.15.2.
timestamp: 2026-09-19T16:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose pulsó "Revisar la barra" y se le abrió una conversación de Claude Code **vacía**, sin el texto.
Tres intentos hasta dar con ello, y los dos primeros arreglaron defectos reales que no eran *ese*.

Para llegar al fondo hizo falta leer la extensión instalada de Claude Code (`anthropic.claude-code
2.1.276`), que vive fuera del directorio de trabajo. Se pidió permiso y Jose lo dio; se leyó solo eso
y solo de lectura.

## Los dos defectos nuestros (0.15.2)

**`claude-vscode.focus` no pone el cursor en la caja.** Su código es:

    async function X(J){
      if (Q.deliverAtMention(J)) return;
      if (Q.revealAndDeliverAtMention(J)) return;
      Q.stashAtMentionForNextChatSurface(J);
      await executeCommand("claude-vscode.editor.openLast");   // ← abre OTRA
    }

Coge lo seleccionado en el editor, lo convierte en una mención y se la entrega a una conversación; si
ninguna puede cogerla, abre otra. Lo llamábamos medio segundo después de crear la conversación que
acababa de recibir el texto. Se deja de llamar.

**Usábamos el comando que abre siempre una pestaña grande.** `primaryEditor.open` fuerza panel nuevo;
`claude-vscode.editor.open` mira dónde tiene cada uno puesto Claude Code —barra lateral o panel— y
deja el texto ahí.

**Y la barra mentía.** Decía «Se lo he pedido. Mira la conversación.», pero los dos comandos dejan el
texto escrito (`data-initial-prompt` → `setInputText`) y no lo envían. Ahora dice «Te lo he dejado
escrito en la conversación. Dale a enviar.».

## El de verdad (0.15.3)

Con las dos cosas arregladas **seguía saliendo vacía**. Lo zanjó una prueba de una línea en la
máquina de Jose:

    open "vscode://anthropic.claude-code/open?prompt=PRUEBA%20DEL%20ENLACE%20DIRECTO"

El texto apareció. O sea:

- enlace → el texto aparece;
- `claude-vscode.editor.open(undefined, texto)` → conversación vacía;
- `claude-vscode.primaryEditor.open(undefined, texto)` → conversación vacía.

Y eso que el manejador del enlace hace exactamente `primaryEditor.open(sesión, texto)`. La diferencia
está dentro de su ventana: al arrancar, la conversación decide qué hacer y hay caminos que se quedan
con la sesión y **descartan el texto** antes de llegar a `fresh_with_prompt`:

    if (Z !== undefined) return { kind: "keep_opened", session: Z, ... };   // sin prompt
    if (Q !== undefined) return { kind: "teleport", remoteSessionId: Q };   // sin prompt
    ...
    if ($.initialPrompt) return { kind: "fresh_with_prompt", prompt: ... }; // aquí sí

`teleport` es el control remoto, que Jose tiene encendido. Por el enlace no se pasa por ahí, que es
por donde ellos lo prueban.

Así que el orden se invierte: **enlace primero, comandos de repuesto, portapapeles al final**.

## Ficheros tocados

- `extension/src/puente.js` — el orden, medido, con fecha y versión
- `extension/src/asistentes.js` — la tabla de lo que permite cada asistente, corregida
- `extension/src/extension.js` — el aviso deja de prometer que se ha enviado
- `extension/prueba/vscode-falso.js` — `enlaceFalla`, para probar el repuesto
- `extension/prueba/humo.js` — dos comprobaciones nuevas
- `docs/decisiones.md` — decisiones 77 y 78

## Cómo quedó

146 comprobaciones, las tres empresas enteras, diccionario limpio. Publicadas e instaladas la 0.15.2
y la 0.15.3.

## Lo siguiente

Está pendiente de que Jose confirme que el botón ya deja el texto puesto. Y sigue abierto el montaje
fallido en una carpeta suya: la 0.15.1 ya trae el informe con el motivo dentro, falta que lo mire.
