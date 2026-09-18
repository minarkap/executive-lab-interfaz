#!/bin/sh
# Lo primero que corre al instalar en un Mac: consigue un Node y le pasa el
# trabajo a instalar.js.
#
# ── Por qué existe ───────────────────────────────────────────────────────
#
# El .dmg pesaba 93 MB y **236 de los 242 de la carga eran el Node**. Se
# llevaba dentro porque macOS no trae ninguno, y `instalar.js` está escrito en
# JavaScript, así que sin Node no arranca ni el instalador.
#
# El editor ya se descarga durante la instalación desde el principio. Esto hace
# lo mismo con Node, y deja el .dmg en unos 10 MB. La pega del huevo y la
# gallina —que quien descarga el Node no puede estar escrito en Node— se
# resuelve aquí: esto es `sh`, que lo trae macOS desde siempre.
#
# Si la carga trae un Node dentro (build hecho con --con-node, para repartir
# sin depender de la red), se usa ese y no se descarga nada.

set -eu

AQUI="$(cd "$(dirname "$0")" && pwd)"
NODE_VERSION="v24.21.0"        # la misma que fija construir.sh

# El fichero de progreso que lee la app, si nos lo han pasado. Se escribe con
# el mismo protocolo que instalar.js: CLASE, tabulador, datos.
PROGRESO=""
siguiente=""
for arg in "$@"; do
  if [ "$siguiente" = "si" ]; then PROGRESO="$arg"; siguiente=""; fi
  if [ "$arg" = "--progreso" ]; then siguiente="si"; fi
done

contar() {
  [ -n "$PROGRESO" ] || return 0
  printf 'DETALLE\t%s\n' "$1" >> "$PROGRESO" 2>/dev/null || true
}

# 1. ¿Viene uno dentro? Entonces no hay nada que pensar.
DENTRO="$AQUI/carga/runtime/bin/node"
if [ -x "$DENTRO" ]; then
  exec "$DENTRO" "$AQUI/instalar.js" "$@"
fi

# 2. ¿Tiene ya uno el sistema? Vale cualquiera moderno: lo único que se le pide
#    es correr instalar.js, que no usa nada exótico.
DELSISTEMA="$(command -v node 2>/dev/null || true)"
if [ -n "$DELSISTEMA" ]; then
  contar "Usando el Node que ya tienes"
  exec "$DELSISTEMA" "$AQUI/instalar.js" "$@"
fi

# 3. A descargarlo. Solo la arquitectura de este Mac: no tiene sentido bajar
#    las dos y quedarse con una.
case "$(uname -m)" in
  arm64) SABOR="darwin-arm64" ;;
  *)     SABOR="darwin-x64" ;;
esac

CARPETA="$(mktemp -d /tmp/executive-lab-node.XXXXXX)"
URL="https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-$SABOR.tar.gz"

contar "Descargando lo que hace falta (unos 40 MB)…"
if ! curl -fL --retry 3 --retry-delay 2 -o "$CARPETA/node.tar.gz" "$URL" 2>/dev/null; then
  printf 'FIN\tmal\t%s\n' "No he podido descargar una pieza. Mira que haya conexión y vuelve a intentarlo." >> "${PROGRESO:-/dev/null}" 2>/dev/null || true
  echo "No he podido descargar Node desde $URL" >&2
  exit 1
fi

contar "Ya casi…"
tar -xzf "$CARPETA/node.tar.gz" -C "$CARPETA"

BAJADO="$CARPETA/node-$NODE_VERSION-$SABOR/bin/node"
if [ ! -x "$BAJADO" ]; then
  printf 'FIN\tmal\t%s\n' "Lo que he descargado no sirve. Vuelve a intentarlo." >> "${PROGRESO:-/dev/null}" 2>/dev/null || true
  echo "El Node descargado no está donde debía: $BAJADO" >&2
  exit 1
fi

# Se le dice dónde ha quedado, para que lo copie a la carpeta de la app: los
# enganches del arnés llaman a `node` por su nombre y tiene que seguir ahí
# cuando esta carpeta temporal desaparezca.
EXECUTIVE_LAB_NODE_BAJADO="$CARPETA/node-$NODE_VERSION-$SABOR"
export EXECUTIVE_LAB_NODE_BAJADO

exec "$BAJADO" "$AQUI/instalar.js" "$@"
