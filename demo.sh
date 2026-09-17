#!/bin/bash
# Ver la interfaz tal cual la verá un alumno, aquí en el Mac, sin tocar tu
# VS Code: un VS Code aislado (sus propios ajustes y extensiones, dentro de
# .demo/) con la extensión de Claude y la nuestra instaladas de verdad, no en
# modo desarrollo, sobre una empresa de mentira ya preparada con el arnés.
#
#   ./demo.sh            monta lo que falte y abre la demo
#   rm -rf .demo         para empezar de cero
#
# Cuando cambies la extensión: cd extension && npm run empaquetar, y después
#   ./demo.sh --reinstalar

set -euo pipefail

R="$(cd "$(dirname "$0")" && pwd)"
D="$R/.demo"
CODE="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
[ -x "$CODE" ] || { echo "No encuentro VS Code en /Applications." >&2; exit 1; }

aislado=(--user-data-dir "$D/datos" --extensions-dir "$D/extensiones")

# 1. La empresa de mentira, preparada como lo haría el instalador (sin editor).
if [ ! -f "$D/empresa/.rsc.json" ]; then
  echo "Preparando la empresa de la demo…"
  mkdir -p "$D/app"
  cp "$R/instalador/comun/preparar.js" "$D/app/"
  rm -rf "$D/app/skills" && cp -R "$R/skills" "$D/app/skills"
  cp "$R/extension/media/disfraz.json" "$D/app/"
  if [ -d "$R/instalador/windows/carga/harness" ]; then
    rm -rf "$D/app/harness" && cp -R "$R/instalador/windows/carga/harness" "$D/app/harness"
  else
    npm install --prefix "$D/app/harness" @ericrisco/rsc@1.4.1 --silent --no-audit --no-fund
  fi
  node "$D/app/preparar.js" --destino "$D/empresa" --objetivo "organizar mis facturas" --asistente claude --sin-editor \
    || { echo "preparar.js ha fallado; mira $D/empresa/instalacion.log" >&2; exit 1; }
fi

# 2. El disfraz, escrito antes del primer arranque, como hará el instalador.
mkdir -p "$D/datos/User"
[ -f "$D/datos/User/settings.json" ] || cp "$R/extension/media/disfraz.json" "$D/datos/User/settings.json"

# 3. Las dos extensiones.
if [ ! -d "$D/extensiones" ] || ! ls -d "$D/extensiones"/anthropic.claude-code-* >/dev/null 2>&1 || [ "${1:-}" = "--reinstalar" ]; then
  [ -f "$R/extension/executive-lab.vsix" ] || (cd "$R/extension" && npm run empaquetar --silent)
  echo "Instalando las extensiones en el VS Code aislado…"
  "$CODE" "${aislado[@]}" --install-extension anthropic.claude-code --install-extension "$R/extension/executive-lab.vsix" --force
fi

exec "$CODE" "${aislado[@]}" "$D/empresa"
