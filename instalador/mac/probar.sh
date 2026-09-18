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

comprobar 'la carga lleva el arnés preinstalado' bash -c '
  r="'"$AQUI"'/carga/harness/node_modules/@ericrisco/rsc/package.json"
  [ -f "$r" ] || { echo "falta el arnés"; exit 1; }
  grep -o "\"version\": *\"[^\"]*\"" "$r" | head -1 | cut -d\" -f4'

comprobar 'la carga lleva el historial en JavaScript' bash -c '
  [ -d "'"$AQUI"'/carga/harness/node_modules/isomorphic-git" ] || { echo "falta; en un Mac sin Xcode no habría copias de seguridad"; exit 1; }
  echo "sin depender de git del sistema"'

comprobar 'la carga lleva los raíles y la extensión' bash -c '
  [ -f "'"$AQUI"'/carga/skills/executive-lab/SKILL.md" ] || { echo "faltan los raíles"; exit 1; }
  [ -f "'"$AQUI"'/carga/executive-lab.vsix" ] || { echo "falta la extensión"; exit 1; }
  echo "los dos"'

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

comprobar 'el acceso directo abre el editor con su carpeta' bash -c '
  [ -d "'"$ACCESO"'" ] || { echo "SALTADA"; exit 0; }
  abre="'"$ACCESO"'/Contents/MacOS/abrir"
  [ -x "$abre" ] || { echo "no tiene permiso de ejecución"; exit 1; }
  grep -q "open -a" "$abre" || { echo "no abre nada"; exit 1; }
  carpeta="$(grep -o "\"[^\"]*Mi trabajo[^\"]*\"" "$abre" | tail -1 | tr -d "\"")"
  [ -d "$carpeta" ] || { echo "apunta a una carpeta que no existe"; exit 1; }
  basename "$carpeta"'

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

comprobar 'el informe de la instalación no tiene errores' bash -c '
  log=/tmp/executive-lab-instalacion.log
  [ -f "$log" ] || { echo "SALTADA"; exit 0; }
  malas="$(grep -c "^ERROR\|ERROR " "$log" || true)"
  [ "$malas" = "0" ] || { echo "$malas líneas con error"; exit 1; }
  echo "limpio"'

# ────────────────────────────────────────────── la carpeta de trabajo, si la hay

echo
echo "La carpeta de trabajo"

TRABAJO=""
for documentos in "$CASA/Documentos" "$CASA/Documents"; do
  [ -d "$documentos" ] || continue
  for carpeta in "$documentos"/*/; do
    [ -f "${carpeta}.rsc.json" ] && TRABAJO="$carpeta" && break 2
  done
done

comprobar 'hay una carpeta con el arnés montado' bash -c '
  [ -n "'"$TRABAJO"'" ] || { echo "SALTADA"; exit 0; }
  basename "'"$TRABAJO"'"'

comprobar 'los raíles están puestos y los diales en su sitio' bash -c '
  [ -n "'"$TRABAJO"'" ] || { echo "SALTADA"; exit 0; }
  [ -f "'"$TRABAJO"'.claude/skills/executive-lab/SKILL.md" ] || { echo "falta la habilidad"; exit 1; }
  perfil="'"$TRABAJO"'02-DOCS/wiki/harness/user-profile.md"
  grep -q "technical_level: non-technical" "$perfil" || { echo "el dial técnico no es el que toca"; exit 1; }
  grep -q "accompaniment: L3" "$perfil" || { echo "el dial de acompañamiento no es el que toca"; exit 1; }
  echo "no-técnico · L3"'

comprobar 'los enganches apuntan a un Node que existe' enganchesConRutaCompleta

comprobar 'hay un punto de partida al que volver' bash -c '
  [ -n "'"$TRABAJO"'" ] || { echo "SALTADA"; exit 0; }
  n="'"$APP"'/runtime/bin/node"
  [ -x "$n" ] || n="$(command -v node)"
  [ -n "$n" ] || { echo "no hay con qué mirarlo"; exit 1; }
  "$n" -e "
    const h = require(\"'"$APP"'/historial.js\");
    h.historial(process.argv[1], 5).then((r) => {
      if (!r.copias.length) { console.error(\"no hay ninguna copia\"); process.exit(1); }
      console.log(r.copias.length + \" copia(s), la primera: \" + r.copias[r.copias.length - 1].asunto.slice(0, 40));
    });
  " "'"$TRABAJO"'"'

comprobar 'el arnés responde' bash -c '
  [ -n "'"$TRABAJO"'" ] || { echo "SALTADA"; exit 0; }
  n="'"$APP"'/runtime/bin/node"
  rsc="'"$APP"'/harness/node_modules/@ericrisco/rsc/scripts/rsc.js"
  [ -x "$n" ] && [ -f "$rsc" ] || { echo "SALTADA"; exit 0; }
  cd "'"$TRABAJO"'" && "$n" "$rsc" doctor >/dev/null 2>&1 || { echo "doctor se queja; mira Algo va mal"; exit 1; }
  echo "sano"'

# ────────────────────────────────────────────────────────────────── resumen

echo
printf '\033[1m%s bien · %s mal · %s sin venir a cuento\033[0m\n' "$BIEN" "$MAL" "$SALTADAS"
echo "Informe: $INFORME"
{ echo; echo "$BIEN bien · $MAL mal · $SALTADAS saltadas"; } >> "$INFORME"

[ "$MAL" = "0" ]
