---
type: ftd
title: La Ayuda de la barra sencilla
date: 2026-10-07
status: en curso
---

# La Ayuda de la barra sencilla

## Intent

F3 de [simplificar-la-barra](../sdd/proposals/simplificar-la-barra.md): Ayuda con sus cinco. Jose, sobre el
foro: *«Es mejor que solo sea copiar el mensaje y decir que hay que ir a Resolver dudas en Circle»*.
Decisión 139.

## Scope

**Dentro**
- Seguir donde lo dejé, Conversación nueva, Dime qué hago ahora, Pedir ayuda en el foro y Sugerencias; y
  «Más ayuda», pequeño, a la Ayuda de siempre.
- Conversación nueva con Claude por su comando; con Codex, su barra y el «+».
- El foro sin enlace: el asistente escribe el mensaje y la barra dice dónde pegarlo.

**Fuera**
- Sugerencias con las copias, GitHub y la cara de la empresa para quien no los tenga.
- Comprobar en un ordenador de verdad, con una conversación de Claude ya abierta, que «Conversación nueva»
  abre otra y no enseña la misma: el código de Claude se leyó el 17-09-2026, pero sin texto no se ha
  medido con una persona delante.

## Checklist

- [x] 1. Los cinco botones, cada uno a su sitio — la prueba de la principal sencilla mira a dónde lleva
  cada uno.
- [x] 2. Conversación nueva — Claude con `claude-vscode.primaryEditor.open` sin nada (siempre una pestaña
  nueva) y, sin él, `editor.open`; sin ninguno, o con Codex, su ventana y el «+»; sin poder abrir nada,
  «Algo va mal».
- [x] 3. El foro — el encargo llega al asistente, pide no sacar nada privado, no abre ninguna página, y
  con Codex queda en el portapapeles con el mismo «dónde pegarlo».
- [x] 4. Mutaciones a mano — 5, las 5 tumbadas.
- [x] 5. Revisión adversaria — sin asistente instalado, las dos acciones decían algo falso (abrir un «+»
  que no existe; esperar una respuesta que no llega): ahora dicen «Claude no está en este ordenador.
  Díselo a tu tutor.» y no tocan nada. `editor.open` sin sesión no está medido: pasa detrás. 5 mutantes
  más, los 5 tumbados.
- [ ] 6. Todas las baterías, el VS Code de verdad y las máquinas de GitHub.

## Evidence

- `humo.js`: «Ayuda: una conversación nueva, y el mensaje para el foro con dónde pegarlo». 357.

## Next

- Publicar la barra sencilla (F8), con un «Qué trae» que lo cuente y diga cómo volver a la de antes.
- F4 y F5: Conexiones paso a paso.
