---
type: ftd
title: Un encargo largo, entero; y el instalador de Mac, en una máquina macOS
date: 2026-09-28
status: hecho
---

# Un encargo largo, entero; y el instalador de Mac, en una máquina macOS

## Intent

De lo que quedaba después de la decisión 129, Jose dijo «dale» a dos cosas que no necesitan a nadie:

1. **El encargo largo en Windows.** El puente mete el texto en la URL del enlace, y en Windows
   `ShellExecute` corta las URL sobre los 2.048 caracteres. No se pudo medir si VS Code manda allí su
   propia URL por el sistema, así que se va a lo seguro sin medirlo.
2. **El instalador de Mac en una máquina macOS de GitHub**, igual que el `.exe` en la de Windows.

## Scope

**Dentro**

- En Windows, un encargo cuya URL no cabe va por el portapapeles, que ya era el camino de repuesto, y se
  dice por qué.
- Un trabajo `el-dmg` en el flujo. Construye el `.dmg`, lo instala en una carpeta personal de mentira,
  como dice `COMO-PROBARLO.md`, y lo comprueba con `probar.sh`.

**Fuera, y por qué**

- Firmar los instaladores: pide los certificados, y es de Jose. Sin ellos, `probar.sh --sin-firma` anota
  la firma en vez de darla por mala.

## Checklist

- [x] 1. En Windows, un encargo largo por el portapapeles: prueba roja, verde, y en las dos máquinas — en la Windows de GitHub, «copiado entero y dicho»; y, tras la revisión, un texto que solo no cabe codificado.
- [x] 2. El `.dmg` construido, instalado en falso y comprobado en la máquina macOS — 14 bien, 0 mal, en macOS 26.6 arm64.

## Evidence

- Prueba nueva, roja antes del arreglo (`puente.cabeEnElEnlace is not a function`), y verde después. En
  el Mac va por el enlace, y en la Windows de GitHub, por el portapapeles. Una mutación que deja pasar
  cualquier URL la tumba.
- Máquinas de GitHub (run 36454257992): `el-dmg` 14 de 14; `windows` todo bien, 330 y 14; `el-exe` 14 de 14; `vscode-de-verdad` todo bien.
- Revisión: dos importantes y un menor, de las pruebas; arreglados, con tres mutaciones (decisión 130).

## Next

- Firmar el `.exe` y el `.dmg`: pide los certificados, y es de Jose.
