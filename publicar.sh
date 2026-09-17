#!/bin/bash
# Prepara lo que hay que publicar. No publica nada: deja los ficheros listos y
# dice qué hacer con cada uno.
#
#   ./publicar.sh
#
# Salen en publicacion/:
#   executive-lab-<version>.vsix   la extensión, 6 MB — el camino principal
#   NOTAS.md                        lo que va en la release de GitHub
#
# El instalador de escritorio (instalador/windows/Output) no se toca: es el
# camino secundario, para quien llega sin VS Code ni asistente.

set -euo pipefail
R="$(cd "$(dirname "$0")" && pwd)"
DESTINO="$R/publicacion"

cd "$R/extension"
VERSION=$(node -p "require('./package.json').version")

echo "Comprobando antes de empaquetar…"
npm run probar --silent | tail -1
node "$R/docs/comprobar-diccionario.js" | tail -1
npm run empaquetar --silent | grep DONE

mkdir -p "$DESTINO"
cp executive-lab.vsix "$DESTINO/executive-lab-$VERSION.vsix"

cat > "$DESTINO/NOTAS.md" <<NOTAS
# Executive Lab $VERSION

Una sola pantalla sencilla sobre VS Code para trabajar con un arnés de IA.

## Instalar

Descarga \`executive-lab-$VERSION.vsix\` y arrástralo a VS Code. O:

\`\`\`bash
code --install-extension executive-lab-$VERSION.vsix
\`\`\`

## Hace falta

- VS Code, y Claude Code o Codex con cuenta de pago.
- git, solo para las copias de seguridad. Sin él, lo demás funciona.

No hace falta Node: VS Code ya lo lleva dentro y el arnés viaja en la extensión.

## Después

Abre la carpeta con la que quieras trabajar y pulsa **Preparar esta carpeta**.
NOTAS

echo
echo "Listo en publicacion/:"
ls -la "$DESTINO" | tail -n +2 | awk '{printf "  %-34s %s\n", $9, int($5/1048576)" MB"}'
echo
echo "Qué hacer con esto:"
echo "  1. Subirlo como release en GitHub, con NOTAS.md de descripción."
echo "  2. Para el Marketplace: npx @vscode/vsce publish  (hace falta cuenta de editor)."
echo "  3. Para Open VSX:      npx ovsx publish executive-lab-$VERSION.vsix -p <token>"
