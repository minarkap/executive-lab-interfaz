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
   cada alumno con «Actualizar ahora». Y en las notas (`publicacion/NOTAS.md`), rellena **«## Qué trae»**:
   una frase por punto, pensando en el alumno, porque es lo que le enseña la barra al ponerla (decisión
   134). Lo que empiece por paréntesis no lo enseña.
   Si la versión no se ha probado en un ordenador de verdad, pregúntame si va como `--prerelease`: así
   solo les llega a quienes tengan puesto «Probar las versiones nuevas antes», hasta que la marque como
   la última (`gh release edit v<version> --prerelease=false --latest`). A los demás, la barra solo les
   ofrece la última, y una prerelease nunca lo es (decisiones 132 y 134).
   La release tiene que publicarla la cuenta dueña del repositorio (`minarkap`): la barra no ofrece las de
   nadie más.

Si alguna comprobación falla, **para** y dímelo. No publiques nada a medias.
