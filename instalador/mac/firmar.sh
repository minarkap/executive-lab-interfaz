#!/bin/bash
# Firma y notariza el instalador de macOS. Sin esto no se le puede dar a nadie.
#
#   ./construir.sh && ./firmar.sh
#   ./firmar.sh --sin-notarizar     # solo firma (para mirar por dentro)
#
# Qué hace falta tener antes, una sola vez:
#
#   1. La licencia de Xcode aceptada. Sin esto ni notarytool ni lipo funcionan:
#        sudo xcodebuild -license accept
#
#   2. Un certificado "Developer ID Application" en el llavero. OJO: los
#      "Apple Development" que salen por defecto NO valen — son para probar en
#      tus propios aparatos, y Gatekeeper los rechaza igual que si no hubiera
#      nada. El de Developer ID se crea en developer.apple.com (Certificates →
#      +) y solo lo puede crear el titular de la cuenta.
#
#   3. Un perfil de notarización guardado en el llavero, para no andar con la
#      contraseña por en medio:
#        xcrun notarytool store-credentials executivelab \
#          --apple-id <el correo> --team-id <el equipo> --password <clave de app>
#      (La "clave de app" se saca en appleid.apple.com, no es la del Apple ID.)
#
# Qué pasa si no está firmado: macOS 26 lo bloquea, y desde macOS 15 ya no vale
# el clic derecho para saltárselo — hay que ir a Ajustes del sistema →
# Privacidad y seguridad → Abrir igualmente. Ahí se pierde media clase.

set -euo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
APP="$AQUI/escenario/Instalar Executive Lab.app"
PERFIL="${EXECUTIVE_LAB_PERFIL_NOTARIZACION:-executivelab}"
SIN_NOTARIZAR=0
[ "${1:-}" = "--sin-notarizar" ] && SIN_NOTARIZAR=1

paso() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
morir() { printf '\n\033[31m%s\033[0m\n' "$1" >&2; exit 1; }

[ -d "$APP" ] || morir "No encuentro la app. Pasa antes por ./construir.sh."

# ────────────────────────────────────────────────── 0. ¿está todo lo que hace falta?

paso "Comprobando el equipaje"

IDENTIDAD="$(security find-identity -v -p codesigning 2>/dev/null | grep 'Developer ID Application' | head -1 | sed 's/.*"\(.*\)".*/\1/' || true)"
if [ -z "$IDENTIDAD" ]; then
  echo "Certificados que hay ahora mismo:" >&2
  security find-identity -v -p codesigning 2>/dev/null | sed 's/[0-9A-F]\{40\}/…/' >&2 || true
  morir "Falta un certificado 'Developer ID Application'. Lee la cabecera de este fichero."
fi
echo "  Firmando con: $IDENTIDAD"

if [ "$SIN_NOTARIZAR" = "0" ]; then
  xcrun notarytool history --keychain-profile "$PERFIL" >/dev/null 2>&1 \
    || morir "No puedo usar el perfil de notarización '$PERFIL'. Lee la cabecera de este fichero."
fi

VERSION="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$APP/Contents/Info.plist" 2>/dev/null || echo 0.0.0)"

# ──────────────────────────────────────────────────────────── 1. firmar por dentro

paso "Firmando lo de dentro"

# Todo binario de verdad que viaje dentro de la app tiene que ir firmado, o la
# notarización lo rechaza entero. Se firman de dentro hacia fuera.
FIRMADOS=0
while IFS= read -r binario; do
  case "$(file -b "$binario")" in
    *Mach-O*)
      codesign --force --timestamp --options runtime \
        --entitlements "$AQUI/node.entitlements" \
        --sign "$IDENTIDAD" "$binario"
      FIRMADOS=$((FIRMADOS + 1))
      ;;
  esac
done < <(find "$APP/Contents/Resources" -type f -perm -u+x)
echo "  $FIRMADOS binarios firmados (Node y lo que traiga el arnés)"

paso "Firmando la app"
codesign --force --timestamp --options runtime --sign "$IDENTIDAD" "$APP"
codesign --verify --deep --strict --verbose=2 "$APP" 2>&1 | sed 's/^/  /'

# ─────────────────────────────────────────────────────────────── 2. el .dmg

paso "Armando el .dmg firmado"
DMG="$AQUI/Executive Lab $VERSION.dmg"
rm -f "$DMG"
hdiutil create -volname "Executive Lab" -srcfolder "$AQUI/escenario" -ov -format UDZO -quiet "$DMG"
codesign --force --timestamp --sign "$IDENTIDAD" "$DMG"

if [ "$SIN_NOTARIZAR" = "1" ]; then
  echo
  echo "Firmado, sin notarizar: $DMG"
  echo "Así todavía sale el aviso. Quita --sin-notarizar cuando vayas a repartirlo."
  exit 0
fi

# ──────────────────────────────────────────────────────── 3. notarizar y grapar

paso "Mandándoselo a Apple (tarda entre 2 y 15 minutos)"
xcrun notarytool submit "$DMG" --keychain-profile "$PERFIL" --wait | sed 's/^/  /'

paso "Grapando el permiso al fichero"
# Sin esto, un Mac sin internet en ese momento vuelve a enseñar el aviso.
xcrun stapler staple "$DMG" | sed 's/^/  /'

paso "La prueba de verdad"
spctl -a -t open --context context:primary-signature -vv "$DMG" 2>&1 | sed 's/^/  /'

echo
echo "Listo para repartir: $DMG"
echo
echo "Última comprobación, y esta no la hace ningún script: descárgalo con"
echo "Safari en un Mac limpio. Si no sale ni un aviso, está bien."
