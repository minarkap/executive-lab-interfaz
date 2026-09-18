#!/bin/bash
# Publica la extensión en las dos tiendas.
#
#   ./publicar-tiendas.sh            comprueba que todo está a punto y dice qué falta
#   ./publicar-tiendas.sh --va       publica de verdad
#
# ── Por qué importa ──────────────────────────────────────────────────────
#
# Mientras esto se reparta como `.vsix`, cada persona se queda **congelada en
# la versión que le tocó**: los arreglos no le llegan nunca, y hoy ya van nueve
# versiones en un día. Publicado, el editor actualiza solo y ese problema
# desaparece de raíz.
#
# Dos tiendas, no una:
#
#   · Marketplace de VS Code — el sitio de siempre.
#   · Open VSX              — la que usan Cursor, Windsurf y VSCodium. Si alguien
#                             llega con uno de esos, el Marketplace no le sirve.
#
# ── Lo que hace falta, y solo lo puedes dar tú ──────────────────────────
#
#   1. Una cuenta de editor con el nombre `executivelab`, en
#      https://marketplace.visualstudio.com/manage (entra con la cuenta de
#      Microsoft y crea el publisher).
#   2. Un token de Azure DevOps con permiso "Marketplace → Manage", en
#      https://dev.azure.com/<tu-organizacion>/_usersSettings/tokens
#      Se guarda una vez:  npx @vscode/vsce login executivelab
#   3. Para Open VSX, una cuenta en https://open-vsx.org y su token:
#      export OVSX_PAT=<token>
#
# OJO, y es lo único irreversible: al publicar se congela el identificador
# `executivelab.arnes-ui`. Cambiarlo después no es renombrar, es una extensión
# nueva con cero instalaciones y la vieja huérfana.

set -euo pipefail
R="$(cd "$(dirname "$0")" && pwd)"
VA=0
[ "${1:-}" = "--va" ] && VA=1

cd "$R/extension"
VERSION="$(node -p "require('./package.json').version")"
ID="$(node -p "const d=require('./package.json'); d.publisher + '.' + d.name")"
VSIX="$R/publicacion/executive-lab-$VERSION.vsix"

echo "▸ Qué se va a publicar"
echo "  $ID @ $VERSION"
[ -f "$VSIX" ] || { echo "  FALTA el paquete. Pasa antes ./publicar.sh"; exit 1; }
echo "  $VSIX"

echo
echo "▸ Qué hay a punto"
FALTA=0

if npx --yes @vscode/vsce ls-publishers 2>/dev/null | grep -q .; then
  echo "  ✓ hay una cuenta de editor guardada"
else
  echo "  ✗ no hay cuenta de editor. Créala y luego:  npx @vscode/vsce login executivelab"
  FALTA=1
fi

if [ -n "${OVSX_PAT:-}" ]; then
  echo "  ✓ hay token de Open VSX"
else
  echo "  ✗ falta OVSX_PAT (https://open-vsx.org, en tu perfil)"
  FALTA=1
fi

if [ "$VA" = "0" ]; then
  echo
  echo "Esto no ha publicado nada. Cuando esté todo a punto:  ./publicar-tiendas.sh --va"
  exit 0
fi

[ "$FALTA" = "0" ] || { echo; echo "Falta algo de lo de arriba. No publico a medias."; exit 1; }

echo
echo "▸ Marketplace"
npx --yes @vscode/vsce publish --packagePath "$VSIX"

echo
echo "▸ Open VSX"
npx --yes ovsx publish "$VSIX" -p "$OVSX_PAT"

echo
echo "Publicado. A partir de ahora el editor actualiza solo, y el aviso de"
echo "versión nueva de la barra sobra: quítalo de src/version.js cuando quieras."
