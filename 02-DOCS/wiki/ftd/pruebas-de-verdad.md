---
type: ftd
title: Lo que solo se había probado de mentira, probado de verdad
date: 2026-09-29
status: hecho
---

# Lo que solo se había probado de mentira, probado de verdad

## Intent

Jose, 29-09-2026, sobre las pruebas que quedaban: *«haz las pruebas»*. Tres cosas de la 0.43.0 no se
habían visto funcionar de verdad:

1. **Mandar un aviso** llega a GitHub y el flujo le pone sus etiquetas: se probó con un GitHub de
   mentira, para no abrir incidencias de prueba en un sitio público.
2. **«Actualizar ahora» instala** el paquete en un editor de verdad: `workbench.extensions.installExtension`
   solo se había fingido.
3. **`contrato.js` puede terminar a medias con código 0**, como le pasaba a `humo.js` (decisión 132).

## Scope

**Dentro**

- `prueba/aviso-de-verdad.js`: abre **un** aviso de verdad con el código de la barra y la cuenta de Jose,
  espera a que el flujo le ponga las etiquetas, lo comprueba y lo cierra. A mano, nunca en las máquinas
  de GitHub: abriría una incidencia pública en cada cambio.
- En la prueba del VS Code de verdad (`npm run probar-en-vscode`, también en la máquina Windows de
  GitHub): «Actualizar ahora» con un GitHub de mentira dentro del editor y un `.vsix` de verdad, que el
  editor tiene que instalar.
- El guardián de «batería a medias» en `contrato.js`.

**Fuera, y por qué**

- La firma de los instaladores: Jose, *«me la pela»*.
- `empresas-distintas.js`: va de un tirón, sin esperar a nada, así que no puede quedarse a medias.

## Checklist

- [x] 1. El guardián en `contrato.js`, probado con una colgada a propósito — «se ha parado a medias, después de 14», código 1; sin ella, 14 y código 0.
- [x] 2. «Actualizar ahora» instala de verdad — en el Mac, «instalada: executivelab.prueba-de-actualizar-99.0.0»; sin la orden de instalar, roja. En la máquina Windows de GitHub, en la PR.
- [x] 3. Un aviso de verdad: sale, le llegan sus etiquetas, y se cierra — la #7, con `aviso de alumno · por revisar · falla`, cerrada, sin carpetas de este ordenador en el cuerpo.

## Evidence

- `npm run probar-en-vscode` en este Mac: todo bien, 8 de 8, la nueva incluida.
- `prueba/aviso-de-verdad.js`: https://github.com/minarkap/executive-lab-interfaz/issues/7
- Decisión 133.

## Next

- `aviso-de-verdad.js` se vuelve a correr a mano cuando se toque `avisos.js` o `avisos.yml`.
