#!/bin/bash
# Ver la interfaz tal cual la verá un alumno, aquí en el Mac, sin tocar tu
# VS Code: un VS Code aislado (sus propios ajustes y extensiones, dentro de
# .demo/) con la extensión de Claude y la nuestra instaladas de verdad, no en
# modo desarrollo, sobre una empresa de mentira ya preparada con el arnés.
#
#   ./demo.sh                monta lo que falte y abre la demo
#   ./demo.sh --con-datos    además siembra una herramienta, una wiki y
#                            documentos, para ver las pantallas con contenido
#   ./demo.sh --reinstalar   vuelve a instalar las extensiones
#   rm -rf .demo             para empezar de cero
#
# Cuando cambies la extensión: cd extension && npm run empaquetar, y después
#   ./demo.sh --reinstalar

set -euo pipefail

# Si esto se ejecuta desde dentro de VS Code (una terminal integrada, un
# agente), el entorno lleva ELECTRON_RUN_AS_NODE=1 y el binario de VS Code
# arrancaría como Node a secas y moriría con "bad option". Fuera con todo eso.
for v in $(env | grep -oE '^(ELECTRON|VSCODE)_[A-Z0-9_]+'); do unset "$v"; done

R="$(cd "$(dirname "$0")" && pwd)"
D="$R/.demo"
CODE="/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
[ -x "$CODE" ] || { echo "No encuentro VS Code en /Applications." >&2; exit 1; }

# El directorio de datos va por un enlace corto: VS Code abre ahí un socket
# Unix, y macOS limita su ruta a ~104 caracteres. La del repo ya los agota.
ln -sfn "$D/datos" /tmp/executive-lab-demo
aislado=(--user-data-dir /tmp/executive-lab-demo --extensions-dir "$D/extensiones")

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

# 1b. Con --con-datos, una herramienta conectada, una wiki y documentos sin
#     leer. No pisa nada de lo que escribió el arnés.
if [ "${1:-}" = "--con-datos" ]; then
  echo "Sembrando datos de mentira…"
  node "$R/extension/prueba/empresa-falsa.js" "$D/empresa" >/dev/null
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

# La ventana se abre con el binario de la app, suelto (nohup + &), no con el
# `code` de línea de comandos: ese la lanza como hija del shell y muere cuando
# el shell termina, que es lo que pasa desde un script o desde un agente.
nohup "/Applications/Visual Studio Code.app/Contents/MacOS/Code" "${aislado[@]}" "$D/empresa" >/dev/null 2>&1 &
disown
echo "Demo abierta. Si ves un aviso de confianza o de login, es de la extensión de Claude, no nuestro."
