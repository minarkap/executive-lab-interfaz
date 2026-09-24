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

# Un número de versión ya publicado no se vuelve a usar.
#
# Esto copiaba encima sin decir nada. Y el momento en que muerde es justo el más
# fácil de que pase: acabas de arreglar cosas, se te olvida subir el número, y
# publicas. A partir de ahí hay dos compilaciones distintas llamándose igual —
# quien instaló ayer y quien instale mañana creen tener lo mismo y no lo tienen,
# y ya no hay forma de saber cuál corre cada alumno.
#
# Se comprueba antes de las pruebas: si hay que subir el número, mejor saberlo
# ahora que después de varios minutos montando un arnés de verdad.
if [ -f "$DESTINO/executive-lab-$VERSION.vsix" ]; then
  echo "Ya hay publicada una $VERSION, y no se pisa:"
  echo "  $DESTINO/executive-lab-$VERSION.vsix"
  echo ""
  echo "Sube el número en extension/package.json y vuelve a lanzarlo."
  echo "Si de verdad quieres rehacer esa misma versión, borra ese fichero a mano."
  exit 1
fi

echo "Comprobando antes de empaquetar…"

# Con el arnés de verdad, no solo con el de mentira. Tarda minutos y por eso no
# estaba aquí — y por eso la prueba del wizard estuvo rota tres semanas sin que
# nadie lo viera (auditoría, F26). Una release es exactamente el momento en que
# esos minutos salen baratos.
#
# `--rapido` se los salta, para cuando solo quieres el .vsix a mano.
#
# Y eso se recuerda al final, porque el .vsix que sale es idéntico mire quien lo
# mire: mismo nombre, mismo tamaño, misma carpeta. En un solo día se publicaron
# tres versiones con `--rapido` creyendo que estaban verificadas. Un atajo que no
# se nota es un atajo que se toma sin querer.
COMPLETO=1
if [ "${1:-}" = "--rapido" ]; then
  COMPLETO=0
  echo "  (con --rapido: sin montar un arnés de verdad)"
  npm run probar --silent | grep -E 'comprobaciones|empresas'
else
  node "$R/extension/prueba/humo.js" --con-arnes | tail -1
  node "$R/extension/prueba/empresas-distintas.js" | tail -1
fi

node "$R/docs/comprobar-diccionario.js" | tail -1
node "$R/herramientas/revisar-powershell.js" | tail -1
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

- VS Code 1.98 o más nuevo, y Claude Code o Codex con cuenta de pago.
- git. Si no está, el panel lo instala con un botón.

No hace falta Node: VS Code ya lo lleva dentro y el arnés viaja en la extensión.

## Después

Abre la carpeta con la que quieras trabajar y pulsa **Preparar esta carpeta**.
Te hace cinco preguntas en lenguaje llano y monta el arnés con tus respuestas.
NOTAS

echo
echo "Listo en publicacion/:"
ls -la "$DESTINO" | tail -n +2 | awk '{printf "  %-34s %s\n", $9, int($5/1048576)" MB"}'
echo
if [ "$COMPLETO" = "1" ]; then
  echo "Comprobado entero, incluido el wizard con un arnés de verdad."
  echo
  echo "Qué hacer con esto:"
  echo "  1. Subirlo como release en GitHub, con NOTAS.md de descripción."
  echo "  2. Para el Marketplace: npx @vscode/vsce publish  (hace falta cuenta de editor)."
  echo "  3. Para Open VSX:      npx ovsx publish executive-lab-$VERSION.vsix -p <token>"
else
  echo "⚠️  ESTE NO ESTÁ COMPROBADO ENTERO."
  echo
  echo "Con --rapido no se ha montado un arnés de verdad, así que el camino que"
  echo "usa un alumno el primer día —el wizard, de punta a punta— no se ha tocado."
  echo "Estuvo roto tres semanas sin que nadie lo viera (auditoría, F26)."
  echo
  echo "Vale para probarlo tú en local. Antes de publicarlo para alguien más:"
  echo "  ./publicar.sh        (sin --rapido: tarda unos minutos y lo comprueba entero)"
fi
