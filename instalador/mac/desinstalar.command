#!/bin/bash
# Quita Executive Lab de este Mac y deja el resto como estaba.
#
# Doble clic, o desde donde prefieras:
#   ./desinstalar.command              # pregunta antes de cada cosa gorda
#   ./desinstalar.command --todo       # no pregunta y también borra el editor
#   ./desinstalar.command --deja-claude   # no toca la extensión del asistente
#
# Es el espejo de instalador/windows/desinstalar.ps1. La regla es la misma: de
# los ajustes del editor solo se quita una clave si tiene EXACTAMENTE el valor
# que puso el disfraz. Si esa persona la había tocado, se queda como la tenga.

set -uo pipefail

CASA="$HOME"
APP="$CASA/Library/Application Support/ExecutiveLab"
ACCESO="$CASA/Applications/Mi Empresa.app"
AJUSTES="$CASA/Library/Application Support/Code/User/settings.json"
EDITOR_PROPIO="$CASA/Applications/Visual Studio Code.app"

TODO=0
DEJA_CLAUDE=0
for arg in "$@"; do
  case "$arg" in
    --todo) TODO=1 ;;
    --deja-claude) DEJA_CLAUDE=1 ;;
  esac
done

paso() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
bien() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
nada() { printf '  · %s\n' "$1"; }

preguntar() {
  [ "$TODO" = "1" ] && return 0
  printf '  %s [s/N] ' "$1"
  read -r respuesta
  [ "$respuesta" = "s" ] || [ "$respuesta" = "S" ]
}

# El node que sirva: el nuestro mientras esté, y si no el del sistema.
elNode() {
  if [ -x "$APP/runtime/bin/node" ]; then echo "$APP/runtime/bin/node"; return; fi
  command -v node 2>/dev/null || true
}

echo "Desinstalar Executive Lab"
echo "========================="

# ───────────────────────────────────────────────── 1. las piezas del editor

paso "Las piezas del editor"
CLI=""
for candidato in "$EDITOR_PROPIO" "/Applications/Visual Studio Code.app"; do
  [ -x "$candidato/Contents/Resources/app/bin/code" ] && CLI="$candidato/Contents/Resources/app/bin/code" && break
done

if [ -n "$CLI" ]; then
  "$CLI" --uninstall-extension executivelab.panel >/dev/null 2>&1 && bien "quitada la nuestra" || nada "la nuestra no estaba"
  if [ "$DEJA_CLAUDE" = "0" ]; then
    if preguntar "¿Quito también la del asistente?"; then
      "$CLI" --uninstall-extension anthropic.claude-code >/dev/null 2>&1 && bien "quitada la del asistente" || nada "la del asistente no estaba"
    fi
  fi
else
  nada "no encuentro el editor; me salto sus piezas"
fi

# ───────────────────────────────────────────── 2. el disfraz de los ajustes

paso "El aspecto del editor"
NODE="$(elNode)"
if [ -z "$NODE" ] || [ ! -f "$AJUSTES" ]; then
  nada "sin ajustes que limpiar"
else
  DISFRAZ="$APP/disfraz.json"
  [ -f "$DISFRAZ" ] || DISFRAZ="$(cd "$(dirname "$0")" && pwd)/carga/disfraz.json"
  if [ ! -f "$DISFRAZ" ]; then
    nada "no encuentro la lista de lo que puso el disfraz; no toco nada"
  else
    "$NODE" -e '
      const fs = require("node:fs");
      const [ajustes, disfraz] = process.argv.slice(1);
      let actuales;
      const crudo = fs.readFileSync(ajustes, "utf8");
      try { actuales = JSON.parse(crudo); }
      catch { console.log("  · los ajustes llevan comentarios: no los toco"); process.exit(0); }
      const puestas = JSON.parse(fs.readFileSync(disfraz, "utf8"));
      const fuera = [];
      for (const [clave, valor] of Object.entries(puestas)) {
        if (clave in actuales && JSON.stringify(actuales[clave]) === JSON.stringify(valor)) {
          delete actuales[clave];
          fuera.push(clave);
        }
      }
      if (!fuera.length) { console.log("  · no quedaba nada del disfraz"); process.exit(0); }
      fs.copyFileSync(ajustes, ajustes + ".antes-de-desinstalar");
      fs.writeFileSync(ajustes, JSON.stringify(actuales, null, 2) + "\n");
      console.log(`  [32m✓[0m ${fuera.length} ajustes quitados (copia al lado)`);
    ' "$AJUSTES" "$DISFRAZ"
  fi
fi

# ─────────────────────────────────────────── 3. el acceso directo y el Dock

paso "El acceso directo"
if [ -d "$ACCESO" ]; then
  # Del Dock primero, que si no queda un hueco con interrogación.
  #
  # Con PlistBuddy y no con python3: en un Mac sin las herramientas de Xcode,
  # llamar a python3 abre el diálogo de instalarlas, que es exactamente lo que
  # este proyecto existe para evitar. PlistBuddy viene de serie.
  quitarDelDock() {
    local plist="/tmp/executive-lab-dock.plist"
    /usr/bin/defaults export com.apple.dock "$plist" 2>/dev/null || return 1

    local i=0 cual=-1 valor
    while true; do
      valor="$(/usr/libexec/PlistBuddy -c "Print :persistent-apps:$i:tile-data:file-data:_CFURLString" "$plist" 2>/dev/null)" || break
      case "$valor" in
        *"Mi Empresa.app"*|*"Mi%20Empresa.app"*) cual=$i; break ;;
      esac
      i=$((i + 1))
    done

    [ "$cual" -ge 0 ] || return 1
    /usr/libexec/PlistBuddy -c "Delete :persistent-apps:$cual" "$plist" >/dev/null || return 1
    /usr/bin/defaults import com.apple.dock "$plist" && /usr/bin/killall Dock >/dev/null 2>&1
    rm -f "$plist"
  }
  quitarDelDock || true

  rm -rf "$ACCESO" && bien "fuera de Aplicaciones y del Dock"
else
  nada "no estaba"
fi

# ──────────────────────────────────────────── 4. el arranque del shell

paso "El arranque"
for fichero in "$CASA/.zprofile" "$CASA/.bash_profile"; do
  if [ -f "$fichero" ] && grep -q ">>> Executive Lab >>>" "$fichero"; then
    /usr/bin/sed -i '' '/>>> Executive Lab >>>/,/<<< Executive Lab <<</d' "$fichero"
    bien "$(basename "$fichero") limpio"
  fi
done

# ─────────────────────────────────────────────────── 5. las herramientas

paso "Las herramientas"
if [ -d "$APP" ]; then
  rm -rf "$APP" && bien "fuera $(basename "$APP")"
else
  nada "no estaban"
fi

# ───────────────────────────────────────────── 6. las carpetas de trabajo

paso "Tus carpetas de trabajo"
ENCONTRADAS=0
for documentos in "$CASA/Documentos" "$CASA/Documents"; do
  [ -d "$documentos" ] || continue
  for carpeta in "$documentos"/*/; do
    [ -f "${carpeta}.rsc.json" ] || continue
    ENCONTRADAS=1
    echo "  $carpeta"
    [ -f "${carpeta}.vscode/settings.json" ] && rm -f "${carpeta}.vscode/settings.json" && nada "quitado su aspecto"
    if preguntar "  ¿Borro esta carpeta y todo lo que tiene dentro?"; then
      rm -rf "$carpeta" && bien "borrada"
    else
      nada "se queda"
    fi
  done
done
[ "$ENCONTRADAS" = "0" ] && nada "no he encontrado ninguna"

# ───────────────────────────────────────────────────────── 7. el editor

paso "El editor"
if [ -d "$EDITOR_PROPIO" ]; then
  if preguntar "¿Quito también el editor que puse yo?"; then
    rm -rf "$EDITOR_PROPIO" && bien "fuera"
  else
    nada "se queda"
  fi
else
  nada "el editor que hay no lo puse yo; ni lo toco"
fi

echo
echo "Hecho."
