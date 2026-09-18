#!/bin/bash
# Monta instalador/windows/carga/ antes de compilar el .exe.
#
#   ./preparar-carga.sh
#
# Por qué existe: esta carga se montaba a mano, y por eso se quedó atrás. El
# .exe compilado el 17-09 llevaba la extensión 0.1.0 y un preparar.js anterior
# al refactor, tres horas más viejo que el repositorio, y nadie se enteró
# porque no había nada que lo comprobara. El de macOS nunca tuvo ese problema
# porque lo monta construir.sh.
#
# Lo que NO monta esto, porque son binarios de terceros que no se versionan:
#
#   runtime/                   Node LTS portable para Windows (el .zip de nodejs.org)
#   VSCodeUserSetup-x64.exe    de code.visualstudio.com
#   executivelab.ico           el icono
#
# Esos tres se dejan a mano una vez y se quedan. Si falta alguno, esto lo dice
# y no compila nada.

set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
CARGA="$AQUI/carga"

mkdir -p "$CARGA"

echo "▸ Lo que ya no va dentro"
# git lo instala ahora su propio instalador (decisión 26); el arnés y los
# raíles viajan en el .vsix, que es quien los usa.
for sobra in git harness skills; do
  if [ -d "$CARGA/$sobra" ]; then
    rm -rf "$CARGA/$sobra"
    echo "  fuera carga/$sobra"
  fi
done

echo "▸ Lo nuestro"
for modulo in preparar.js git.js ajustes.js; do
  cp "$RAIZ/instalador/comun/$modulo" "$CARGA/$modulo"
  echo "  carga/$modulo"
done
cp "$RAIZ/extension/media/disfraz.json" "$CARGA/disfraz.json"
echo "  carga/disfraz.json"

echo "▸ La extensión"
if [ ! -f "$RAIZ/extension/executive-lab.vsix" ]; then
  echo "  Empaquetándola…"
  (cd "$RAIZ/extension" && npm run --silent empaquetar >/dev/null)
fi
cp "$RAIZ/extension/executive-lab.vsix" "$CARGA/executive-lab.vsix"
VERSION="$(node -p "require('$RAIZ/extension/package.json').version")"
echo "  carga/executive-lab.vsix  ($VERSION)"

echo "▸ Los binarios de terceros"
FALTA=0
for pieza in runtime VSCodeUserSetup-x64.exe executivelab.ico; do
  if [ -e "$CARGA/$pieza" ]; then
    echo "  carga/$pieza"
  else
    echo "  FALTA carga/$pieza"
    FALTA=1
  fi
done

if [ "$FALTA" = "1" ]; then
  echo
  echo "Faltan binarios de terceros. Están en instalador/README.md, y sin ellos"
  echo "el .exe saldría a medias. No compiles todavía."
  exit 1
fi

# La versión del .iss tiene que ir con la del panel, o el .exe sale rotulado
# con una que no es. Se avisa en vez de corregirlo a la callada: subir de
# versión es una decisión.
EN_ISS="$(grep -o '#define Version "[^"]*"' "$AQUI/ExecutiveLab.iss" | cut -d'"' -f2)"
if [ "$EN_ISS" != "$VERSION" ]; then
  echo
  echo "AVISO: ExecutiveLab.iss dice $EN_ISS y el panel va por la $VERSION."
  echo "       Cámbialo antes de compilar, o el .exe saldrá con la versión que no es."
fi

# Y lo que me ha mordido tres veces en una tarde: reempaquetar la extensión y
# olvidar recompilar el .exe, que se queda con la versión anterior dentro.
#
# Se compara con el .vsix de extension/, no con la copia de carga/: esa la
# acabamos de escribir nosotros dos líneas más arriba, y siempre sería la más
# nueva. El de extension/ solo cambia cuando alguien reempaqueta, que es
# justamente el momento en que el .exe se queda viejo.
COMPILADO="$AQUI/Output/ExecutiveLab-Setup.exe"
if [ -f "$COMPILADO" ] && [ "$RAIZ/extension/executive-lab.vsix" -nt "$COMPILADO" ]; then
  echo
  echo "AVISO: el .exe que hay compilado es MÁS VIEJO que esta carga."
  echo "       Lleva dentro una versión anterior del panel. Recompílalo."
fi

echo
echo "Carga lista. Para compilar el .exe desde este Mac, con Inno bajo Wine:"
echo "  docker run --rm --platform linux/amd64 -v \"$AQUI:/work\" amake/innosetup ExecutiveLab.iss"
