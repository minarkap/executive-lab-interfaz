#!/bin/bash
# Comprueba el instalador de macOS: lo que se ha construido y, si ya se ha
# instalado, cómo ha quedado la máquina. Es el espejo de windows/probar.ps1.
#
#   ./probar.sh                       # sobre esta máquina
#   ./probar.sh --casa /tmp/casa-falsa   # sobre una carpeta personal de mentira
#
# Deja un informe de texto al lado. Las comprobaciones que no vienen a cuento
# (por ejemplo, las de "ya instalado" cuando todavía no lo está) salen como "·"
# y no cuentan como fallo.

set -uo pipefail

AQUI="$(cd "$(dirname "$0")" && pwd)"
CASA="$HOME"
[ "${1:-}" = "--casa" ] && CASA="$2"

APP="$CASA/Library/Application Support/ExecutiveLab"
ACCESO="$CASA/Applications/Mi Empresa.app"
AJUSTES="$CASA/Library/Application Support/Code/User/settings.json"
INFORME="$AQUI/informe-$(date +%Y%m%d-%H%M%S).txt"

BIEN=0; MAL=0; SALTADAS=0

comprobar() {
  local titulo="$1"; shift
  local salida
  if salida="$("$@" 2>&1)"; then
    if [ "$salida" = "SALTADA" ]; then
      printf '  \033[90m·\033[0m %s\n' "$titulo"
      echo "·  $titulo" >> "$INFORME"
      SALTADAS=$((SALTADAS + 1))
    else
      printf '  \033[32m✓\033[0m %s \033[90m— %s\033[0m\n' "$titulo" "$salida"
      echo "OK $titulo — $salida" >> "$INFORME"
      BIEN=$((BIEN + 1))
    fi
  else
    printf '  \033[31m✗\033[0m %s \033[31m— %s\033[0m\n' "$titulo" "$salida"
    echo "MAL $titulo — $salida" >> "$INFORME"
    MAL=$((MAL + 1))
  fi
}

morir() { echo "$1"; return 1; }
saltar() { echo "SALTADA"; return 0; }

# La ruta del programa que corre el primer enganche del arnés. El valor de
# "command" empieza por ella, entre comillas escapadas si lleva espacios — y
# los lleva, que la carpeta del alumno pasa por "Application Support".
rutaDelPrimerEnganche() {
  sed -n 's/.*"command": "\\\{0,1\}"\{0,1\}\([^"\\]*\).*/\1/p' "$1" | head -1
}

enganchesConRutaCompleta() {
  [ -n "$TRABAJO" ] || { saltar; return 0; }
  local fichero="$TRABAJO.claude/settings.json"
  [ -f "$fichero" ] || morir "no hay enganches"

  local ruta
  ruta="$(rutaDelPrimerEnganche "$fichero")"
  case "$ruta" in
    /*) [ -x "$ruta" ] || morir "apuntan a $ruta, que no existe"; echo "a la ruta completa, y está" ;;
    "") morir "no he sabido leer los enganches" ;;
    *) morir "llaman a node por su nombre: dependen del PATH" ;;
  esac
}

echo "Comprobando Executive Lab para macOS" | tee "$INFORME"
echo "sobre $CASA · $(sw_vers -productName) $(sw_vers -productVersion) · $(uname -m)" | tee -a "$INFORME"

# ───────────────────────────────────────────────────── lo que se ha construido

echo
echo "Lo que se ha construido"

comprobar 'el .dmg está hecho' bash -c '
  dmg="$(ls -t "'"$AQUI"'"/*.dmg 2>/dev/null | head -1)"
  [ -n "$dmg" ] || { echo "no hay ningún .dmg; pasa por ./construir.sh"; exit 1; }
  echo "$(basename "$dmg") · $(du -h "$dmg" | cut -f1)"'

comprobar 'la app instaladora está dentro' bash -c '
  app="'"$AQUI"'/escenario/Instalar Executive Lab.app"
  [ -d "$app" ] || { echo "no está"; exit 1; }
  /usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$app/Contents/Info.plist"'

comprobar 'el Node de la carga arranca' bash -c '
  n="'"$AQUI"'/carga/runtime/bin/node"
  [ -x "$n" ] || { echo "no está"; exit 1; }
  echo "$("$n" -v)"'

comprobar 'ese Node vale para los dos tipos de Mac' bash -c '
  n="'"$AQUI"'/carga/runtime/bin/node"
  [ -x "$n" ] || { echo "no está"; exit 1; }
  if head -c 2 "$n" | grep -q "#!"; then
    [ -x "$(dirname "$n")/node-arm64" ] && [ -x "$(dirname "$n")/node-x64" ] || { echo "el elector no tiene los dos binarios"; exit 1; }
    echo "elector + los dos binarios"
  else
    arcos="$(lipo -archs "$n" 2>/dev/null)" || { echo "no puedo mirarlo (¿licencia de Xcode?)"; exit 1; }
    echo "$arcos" | grep -q arm64 && echo "$arcos" | grep -q x86_64 || { echo "solo $arcos"; exit 1; }
    echo "universal: $arcos"
  fi'

# El instalador pone las piezas y nada más (decisión 26 y el reparto nuevo):
# el arnés y los raíles viajan dentro del .vsix, que es quien los usa.
comprobar 'la carga NO lleva el arnés ni los raíles' bash -c '
  [ -d "'"$AQUI"'/carga/harness" ] && { echo "sigue llevando el arnés: eso ahora va en el .vsix"; exit 1; }
  [ -d "'"$AQUI"'/carga/skills" ] && { echo "sigue llevando los raíles: eso ahora va en el .vsix"; exit 1; }
  [ -d "'"$AQUI"'/carga/git" ] && { echo "sigue llevando git: ahora lo instala el de Apple"; exit 1; }
  echo "solo las piezas"'

comprobar 'la extensión viaja, y lleva el arnés dentro' bash -c '
  v="'"$AQUI"'/carga/executive-lab.vsix"
  [ -f "$v" ] || { echo "falta la extensión"; exit 1; }
  unzip -l "$v" | grep -q "media/harness/node_modules/@ericrisco/rsc/scripts/rsc.js" \
    || { echo "el .vsix no lleva el arnés dentro; vuelve a empaquetar"; exit 1; }
  unzip -l "$v" | grep -q "media/comun/historial.js" \
    || { echo "el .vsix no lleva historial.js; las copias quedarían apagadas"; exit 1; }
  echo "arnés e historial dentro"'

comprobar 'preparar.js tiene al lado lo que necesita' bash -c '
  for m in preparar.js git.js ajustes.js; do
    [ -f "'"$AQUI"'/carga/$m" ] || { echo "falta $m"; exit 1; }
  done
  echo "los tres módulos"'

comprobar 'la app va firmada' bash -c '
  app="'"$AQUI"'/escenario/Instalar Executive Lab.app"
  [ -d "$app" ] || { echo "SALTADA"; exit 0; }
  quien="$(codesign -dv "$app" 2>&1 | grep "^Authority=" | head -1 | cut -d= -f2)"
  case "$quien" in
    "Developer ID"*) echo "$quien" ;;
    "") echo "sin firmar: Gatekeeper la bloqueará. Pasa por ./firmar.sh"; exit 1 ;;
    *) echo "firmada con $quien, que NO vale para repartir. Hace falta Developer ID"; exit 1 ;;
  esac'

# ─────────────────────────────────────────────────────────── ya instalado

echo
echo "Cómo ha quedado la máquina"

comprobar 'las herramientas están en la carpeta del alumno, sin administrador' bash -c '
  [ -d "'"$APP"'" ] || { echo "SALTADA"; exit 0; }
  [ -w "'"$APP"'" ] || { echo "la carpeta no es suya"; exit 1; }
  echo "'"$APP"'"'

comprobar 'nada se ha colado en /usr/local' bash -c '
  [ -d "'"$APP"'" ] || { echo "SALTADA"; exit 0; }
  [ -e /usr/local/executive-lab ] && { echo "hay restos de la versión vieja en /usr/local"; exit 1; }
  echo "limpio"'

# Sin carpeta: la elige esa persona y la prepara el panel. Si el acceso directo
# vuelve a llevar una, es que alguien ha devuelto el montaje al instalador.
comprobar 'el acceso directo abre el editor, sin carpeta' bash -c '
  [ -d "'"$ACCESO"'" ] || { echo "SALTADA"; exit 0; }
  abre="'"$ACCESO"'/Contents/MacOS/abrir"
  [ -x "$abre" ] || { echo "no tiene permiso de ejecución"; exit 1; }
  grep -q "open -a" "$abre" || { echo "no abre nada"; exit 1; }
  grep -q "Mi trabajo" "$abre" && { echo "sigue apuntando a una carpeta creada a ciegas"; exit 1; }
  echo "abre el editor y ya"'

comprobar 'el arranque del shell lleva nuestro Node' bash -c '
  [ -d "'"$APP"'" ] || { echo "SALTADA"; exit 0; }
  grep -q ">>> Executive Lab >>>" "'"$CASA"'/.zprofile" 2>/dev/null || { echo "falta el bloque en .zprofile"; exit 1; }
  echo "en .zprofile"'

comprobar 'los cinco ajustes de programa están puestos' bash -c '
  [ -d "'"$APP"'" ] && [ -f "'"$AJUSTES"'" ] || { echo "SALTADA"; exit 0; }
  n=0
  for clave in security.workspace.trust.enabled update.mode telemetry.telemetryLevel; do
    grep -q "\"$clave\"" "'"$AJUSTES"'" && n=$((n + 1))
  done
  [ "$n" -ge 3 ] || { echo "solo $n de 3 de muestra"; exit 1; }
  echo "los de muestra, puestos"'

comprobar 'las dos piezas del editor están instaladas' bash -c '
  ext="'"$CASA"'/.vscode/extensions"
  [ -d "'"$APP"'" ] && [ -d "$ext" ] || { echo "SALTADA"; exit 0; }
  ls "$ext" | grep -q "^executivelab.panel" || { echo "falta la nuestra"; exit 1; }
  ls "$ext" | grep -q "^anthropic.claude-code" || { echo "falta la del asistente"; exit 1; }
  echo "la nuestra y la del asistente"'

# El instalador escribe en os.tmpdir(), que en macOS NO es /tmp: es el $TMPDIR
# privado de cada usuario. Mirar solo en /tmp hacía que esto se saltara siempre,
# y una comprobación que nunca se ejecuta no comprueba nada.
comprobar 'el informe de la instalación no tiene errores' bash -c '
  log=""
  for donde in "${TMPDIR:-/tmp}/executive-lab-instalacion.log" /tmp/executive-lab-instalacion.log; do
    [ -f "$donde" ] && log="$donde" && break
  done
  [ -n "$log" ] || { echo "SALTADA"; exit 0; }
  malas="$(grep -c "^ERROR\|ERROR " "$log" || true)"
  [ "$malas" = "0" ] || { echo "$malas líneas con error"; exit 1; }
  echo "limpio"'

# ────────────────────────────────────────────── la carpeta de trabajo, si la hay

echo
echo "La carpeta de trabajo"
echo
printf '  \033[90m·\033[0m ya no la hace el instalador: la elige quien va a trabajar en ella\n'
printf '  \033[90m·\033[0m y la prepara el panel, con el wizard de extension/src/arrancar.js\n'
printf '  \033[90m·\033[0m eso no se puede comprobar sin abrir el editor (demo.sh lo enseña)\n' 
echo

# ────────────────────────────────────────────────────────────────── resumen

echo
printf '\033[1m%s bien · %s mal · %s sin venir a cuento\033[0m\n' "$BIEN" "$MAL" "$SALTADAS"
echo "Informe: $INFORME"
{ echo; echo "$BIEN bien · $MAL mal · $SALTADAS saltadas"; } >> "$INFORME"

[ "$MAL" = "0" ]
