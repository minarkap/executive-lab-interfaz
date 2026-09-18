#!/bin/bash
# Construye el instalador de macOS: una app dentro de un .dmg.
#
#   ./construir.sh                # usa la versión del package.json de la extensión
#   ./construir.sh 0.1.0
#   ./construir.sh --sin-descargas  # no vuelve a bajar Node si ya está la carga
#
# Lo que sale: instalador/mac/Executive Lab <version>.dmg, SIN FIRMAR. Para
# poder dárselo a alguien hay que pasarlo después por ./firmar.sh, porque un
# .dmg sin firmar lo bloquea Gatekeeper y desde macOS 15 ya no vale el clic
# derecho: hay que ir a Ajustes del sistema.
#
# Por qué una app y no un .pkg: instalador/mac/instalar.applescript lo explica.

set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$AQUI/../.." && pwd)"
CARGA="$AQUI/carga"

NODE_VERSION="v24.21.0"          # la misma que lleva el instalador de Windows
# El arnés ya no se instala aquí: viaja dentro del .vsix, con su versión fijada
# en extension/media/harness/package.json.

SIN_DESCARGAS=0
VERSION=""
for arg in "$@"; do
  case "$arg" in
    --sin-descargas) SIN_DESCARGAS=1 ;;
    *) VERSION="$arg" ;;
  esac
done
if [ -z "$VERSION" ]; then
  VERSION="$(node -p "require('$RAIZ/extension/package.json').version" 2>/dev/null || echo 0.1.0)"
fi

paso() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }

# ─────────────────────────────────────────────────────────── 1. la carga

paso "La carga (Node, el arnés, los raíles, la extensión)"
mkdir -p "$CARGA"

# --- Node universal: el binario de Apple Silicon y el de Intel, en uno solo.
if [ ! -x "$CARGA/runtime/bin/node" ] || [ "$SIN_DESCARGAS" = "0" ]; then
  if [ -x "$CARGA/runtime/bin/node" ] && [ "$SIN_DESCARGAS" = "1" ]; then
    echo "  El Node de la carga ya está."
  else
    TMP="$(mktemp -d)"
    trap 'rm -rf "$TMP"' EXIT
    for arco in arm64 x64; do
      echo "  Bajando Node $NODE_VERSION para ${arco}…"
      curl -fL --retry 3 -o "$TMP/node-$arco.tar.gz" \
        "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-darwin-$arco.tar.gz"
      tar -xzf "$TMP/node-$arco.tar.gz" -C "$TMP"
    done

    rm -rf "$CARGA/runtime"
    mkdir -p "$CARGA/runtime"
    # De base, el árbol de Apple Silicon: npm y las bibliotecas son JavaScript
    # y valen para los dos. Solo el binario de node es de una arquitectura.
    cp -R "$TMP/node-$NODE_VERSION-darwin-arm64/bin" "$CARGA/runtime/"
    cp -R "$TMP/node-$NODE_VERSION-darwin-arm64/lib" "$CARGA/runtime/"
    cp "$TMP/node-$NODE_VERSION-darwin-arm64/LICENSE" "$CARGA/runtime/" 2>/dev/null || true

    # Lo bonito es un solo binario para las dos arquitecturas. lipo pasa por
    # xcrun, y xcrun se niega mientras no se haya aceptado la licencia de
    # Xcode (sudo xcodebuild -license accept). Si no se puede, se llevan los
    # dos binarios y un elector de tres líneas: pesa 50 MB más y funciona igual.
    if lipo -create \
      "$TMP/node-$NODE_VERSION-darwin-arm64/bin/node" \
      "$TMP/node-$NODE_VERSION-darwin-x64/bin/node" \
      -output "$CARGA/runtime/bin/node" 2>/dev/null; then
      chmod 755 "$CARGA/runtime/bin/node"
      echo "  Node universal: $(lipo -archs "$CARGA/runtime/bin/node")"
    else
      echo "  AVISO: lipo no está disponible (¿licencia de Xcode sin aceptar?)."
      echo "         Se llevan los dos binarios y un elector."
      cp "$TMP/node-$NODE_VERSION-darwin-arm64/bin/node" "$CARGA/runtime/bin/node-arm64"
      cp "$TMP/node-$NODE_VERSION-darwin-x64/bin/node" "$CARGA/runtime/bin/node-x64"
      cat > "$CARGA/runtime/bin/node" <<'ELECTOR'
#!/bin/sh
# Elige el Node de esta máquina. Lo escribe instalador/mac/construir.sh cuando
# no ha podido dejar un binario universal.
AQUI="$(cd "$(dirname "$0")" && pwd)"
case "$(uname -m)" in
  arm64) exec "$AQUI/node-arm64" "$@" ;;
  *) exec "$AQUI/node-x64" "$@" ;;
esac
ELECTOR
      chmod 755 "$CARGA/runtime/bin/node" "$CARGA/runtime/bin/node-arm64" "$CARGA/runtime/bin/node-x64"
    fi
  fi
fi

# --- npm fuera. Son 17 MB que no se usan: desde que el arnés viaja en el
#     .vsix, `preparar.js` solo necesita el node a secas. Se poda aquí para que
#     no vuelva al descargar otro Node.
if [ -d "$CARGA/runtime/lib/node_modules" ]; then
  rm -rf "$CARGA/runtime/lib/node_modules"
  rm -f "$CARGA/runtime/bin/npm" "$CARGA/runtime/bin/npx" "$CARGA/runtime/bin/corepack"
  rm -f "$CARGA/runtime/CHANGELOG.md" "$CARGA/runtime/README.md"
  echo "  Fuera npm: runtime $(du -sm "$CARGA/runtime" | cut -f1)M"
fi

# --- El arnés YA NO viaja en la carga: va dentro del .vsix, que es quien lo
#     usa. Los raíles, igual (extension/media/railes). Y la biblioteca del
#     historial tampoco hace falta, porque git es obligatorio y lo instala el
#     de Apple (decisión 26). Se limpia lo que dejaran las versiones viejas.
rm -rf "$CARGA/harness" "$CARGA/skills" "$CARGA/git"

# --- Lo nuestro. Solo lo que el instalador usa de verdad.
for modulo in preparar.js git.js ajustes.js; do
  cp "$RAIZ/instalador/comun/$modulo" "$CARGA/$modulo"
done
cp "$RAIZ/extension/media/disfraz.json" "$CARGA/disfraz.json"

if [ ! -f "$RAIZ/extension/executive-lab.vsix" ]; then
  echo "  Empaquetando la extensión…"
  (cd "$RAIZ/extension" && npm run --silent empaquetar >/dev/null)
fi
cp "$RAIZ/extension/executive-lab.vsix" "$CARGA/executive-lab.vsix"

# --- El icono. Da igual de dónde salga mientras acabe siendo un .icns.
if [ ! -f "$CARGA/executivelab.icns" ]; then
  ORIGEN=""
  [ -f "$RAIZ/instalador/windows/carga/executivelab.ico" ] && ORIGEN="$RAIZ/instalador/windows/carga/executivelab.ico"
  if [ -n "$ORIGEN" ]; then
    echo "  Icono…"
    TMPI="$(mktemp -d)"
    if sips -s format png "$ORIGEN" --out "$TMPI/base.png" >/dev/null 2>&1; then
      mkdir -p "$TMPI/icono.iconset"
      for tam in 16 32 64 128 256 512; do
        sips -z $tam $tam "$TMPI/base.png" --out "$TMPI/icono.iconset/icon_${tam}x${tam}.png" >/dev/null 2>&1 || true
        sips -z $((tam * 2)) $((tam * 2)) "$TMPI/base.png" --out "$TMPI/icono.iconset/icon_${tam}x${tam}@2x.png" >/dev/null 2>&1 || true
      done
      iconutil -c icns "$TMPI/icono.iconset" -o "$CARGA/executivelab.icns" 2>/dev/null \
        || echo "  AVISO: no he podido armar el icono; la app saldrá con el genérico."
    fi
    rm -rf "$TMPI"
  else
    echo "  AVISO: sin icono de origen; la app saldrá con el genérico."
  fi
fi

echo "  Carga: $(du -sh "$CARGA" | cut -f1)"

# ─────────────────────────────────────────────────────── 2. la app instaladora

paso "La app"
ESCENARIO="$AQUI/escenario"
APP="$ESCENARIO/Instalar Executive Lab.app"
rm -rf "$ESCENARIO"
mkdir -p "$ESCENARIO"

osacompile -o "$APP" "$AQUI/instalar.applescript"

cp "$AQUI/instalar.js" "$APP/Contents/Resources/instalar.js"
cp -R "$CARGA" "$APP/Contents/Resources/carga"
[ -f "$CARGA/executivelab.icns" ] && cp "$CARGA/executivelab.icns" "$APP/Contents/Resources/applet.icns"

# El Info.plist que deja osacompile es el de un applet cualquiera.
PLIST="$APP/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Set :CFBundleName Instalar Executive Lab" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string Instalar Executive Lab" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Instalar Executive Lab" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string ai.executivelab.instalador" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ai.executivelab.instalador" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string $VERSION" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleVersion string $VERSION" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $VERSION" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :LSMinimumSystemVersion string 12.0" "$PLIST" 2>/dev/null || true
# Sin esto, el applet enseña en el Dock el nombre del script.
/usr/libexec/PlistBuddy -c "Add :NSHumanReadableCopyright string Executive Lab" "$PLIST" 2>/dev/null || true

echo "  App: $(du -sh "$APP" | cut -f1)"

# ─────────────────────────────────────────────────────────────── 3. el .dmg

paso "El .dmg"
DMG="$AQUI/Executive Lab $VERSION.dmg"
rm -f "$DMG"
hdiutil create -volname "Executive Lab" -srcfolder "$ESCENARIO" -ov -format UDZO -quiet "$DMG"

echo
echo "Hecho: $DMG  ($(du -sh "$DMG" | cut -f1))"
echo
echo "Sin firmar. Antes de dárselo a nadie:"
echo "  ./firmar.sh \"$DMG\""
