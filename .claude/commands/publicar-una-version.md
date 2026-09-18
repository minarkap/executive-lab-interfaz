---
description: "Empaqueta, instala y publica una versión nueva de la barra."
boton: "Publicar una versión"
icono: "🚀"
grupo: aprendido
argument-hint: "[arguments]"
---
Quiero sacar una versión nueva: $ARGUMENTS

Antes de nada, pregúntame **qué ha cambiado** y con eso decide si el número sube de parche o de
menor. No lo decidas tú solo.

Después:

1. Sube la versión en `extension/package.json`.
2. `./publicar.sh --rapido`, que pasa las comprobaciones y empaqueta.
3. Instálala aquí: `code --install-extension publicacion/executive-lab-<version>.vsix --force`.
4. Escribe la decisión en `docs/decisiones.md` si el cambio la merece.
5. Commit, push y `gh release create`.

Si alguna comprobación falla, **para** y dímelo. No publiques nada a medias.
