#!/bin/bash
# Construye ExecutiveLab.pkg para macOS.
#
#   ./construir.sh 0.1.0
#
# Antes hay que dejar en carga/ lo mismo que lleva el instalador de Windows:
# el Node portable, el arnés preinstalado, el .vsix y, si se puede, git.

set -euo pipefail

VERSION="${1:-0.1.0}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
CARGA="$AQUI/carga"
RAIZ="$AQUI/../.."

for pieza in runtime harness; do
  [ -d "$CARGA/$pieza" ] || { echo "Falta $CARGA/$pieza — mira instalador/README.md." >&2; exit 1; }
done
[ -d "$CARGA/git" ] || echo "AVISO: sin carga/git el alumno necesitará las herramientas de Xcode." >&2

# Se arma el payload tal y como quedará en el disco del alumno.
ESTANCIA="$(mktemp -d)"
trap 'rm -rf "$ESTANCIA"' EXIT

DESTINO="$ESTANCIA/usr/local/executive-lab"
mkdir -p "$DESTINO"
cp -R "$CARGA/runtime" "$DESTINO/"
cp -R "$CARGA/harness" "$DESTINO/"
[ -d "$CARGA/git" ] && cp -R "$CARGA/git" "$DESTINO/"
cp "$RAIZ/instalador/comun/preparar.js" "$DESTINO/"
cp -R "$RAIZ/skills" "$DESTINO/"
cp "$RAIZ/extension/media/disfraz.json" "$DESTINO/"
[ -f "$CARGA/executive-lab.vsix" ] && cp "$CARGA/executive-lab.vsix" "$DESTINO/"

pkgbuild \
  --root "$ESTANCIA" \
  --scripts "$AQUI/scripts" \
  --identifier ai.executivelab.arnes \
  --version "$VERSION" \
  --install-location / \
  "$AQUI/ExecutiveLab-$VERSION.pkg"

echo
echo "Hecho: $AQUI/ExecutiveLab-$VERSION.pkg"
echo
echo "Sin firmar, Gatekeeper lo bloqueará. Para la cohorte hace falta:"
echo "  productsign --sign \"Developer ID Installer: ...\" entrada.pkg salida.pkg"
echo "  xcrun notarytool submit salida.pkg --wait"
