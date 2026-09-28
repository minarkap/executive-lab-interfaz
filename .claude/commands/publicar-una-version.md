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
5. Commit, push y `gh release create`, con el `.vsix` subido a la release: de ahí lo baja la barra de
   cada alumno con «Actualizar ahora».
   Si la versión no se ha probado en un ordenador de verdad, pregúntame si va como `--prerelease`: así
   no se le ofrece a nadie hasta que la marque como la última (`gh release edit v<version>
   --prerelease=false --latest`). La barra solo ofrece la última, y una prerelease nunca lo es
   (decisión 132).

Si alguna comprobación falla, **para** y dímelo. No publiques nada a medias.
