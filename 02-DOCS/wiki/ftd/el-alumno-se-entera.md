---
type: ftd
title: El alumno se entera de lo que pasa con lo que contó y con lo que le llega
date: 2026-09-29
status: hecho
---

# El alumno se entera de lo que pasa con lo que contó y con lo que le llega

## Intent

Tres ideas que Jose dio por buenas el 29-09-2026 (*«perfecto también»*), para cerrar el círculo de los
avisos (decisión 131) y de las actualizaciones (decisión 132):

1. **«Lo que contaste ya está arreglado».** Quien manda un aviso no vuelve a saber nada de él. Si se
   entera de que se arregló, sigue contando cosas; si no, deja de hacerlo.
2. **«Qué trae esta versión».** Tras actualizar no se sabe qué ha cambiado, y un botón nuevo que nadie ve
   es un botón que no existe.
3. **«Probar las versiones nuevas antes».** La prerelease frena una versión sin probar (decisión 132),
   pero entonces no la prueba nadie. Unos pocos alumnos que se ofrezcan la reciben antes.

## Scope

**Dentro**

- Una vez al día, con una sola pregunta y sin cuenta, la barra mira en GitHub si se ha cerrado la
  incidencia de algún aviso que mandó (lo recuerda ella, no un fichero de la carpeta), y se lo dice hasta
  que pulsa «Entendido», con «Verlo en GitHub».
- Al abrir una versión más nueva que la última que vio, una tarjeta con lo de «Qué trae» de su release, y
  «Entendido». En una instalación nueva, nada: no hay nada que comparar.
- Un ajuste, «Probar las versiones nuevas antes», en Ayuda (*Esta barra*). Con él, la barra mira también
  las prereleases, y la tarjeta dice que es una versión de prueba. Lo que se instala, igual de comprobado.
- Diccionario, decisión 134, pruebas y revisión.

**Fuera, y por qué**

- Avisar de una incidencia cerrada con un correo o fuera de la barra: la barra es el sitio.
- Elegir quién prueba antes desde fuera: se lo dice Jose a quien sea, y lo pone esa persona.

## Checklist

- [x] 1. «Lo que contaste ya está arreglado»: mirar, apuntar, decirlo — una pregunta al día por carpeta, se para sin cupo, cuatro frases según lo que era, ni lo viejo ni un fichero de mentira.
- [x] 2. «Qué trae esta versión»: tras actualizar, con lo de la release — callada en una instalación nueva, recordada, y sin volver a preguntar tras un fallo.
- [x] 3. «Probar las versiones nuevas antes»: el ajuste, las prereleases y su tarjeta — sin borradores ni releases de otra persona, y dicho si no se puede guardar.
- [x] 4. Diccionario, decisión 134 y todas las comprobaciones en verde.
- [x] 5. Revisión adversaria — seguridad y corrección: nada crítico; tres importantes y varios menores, arreglados.

## Evidence

- `humo.js`: **351 comprobaciones pasadas**, cinco nuevas. `contrato.js` 14, las tres empresas, diccionario y
  PowerShell, en verde. En el VS Code de verdad, todo bien, con la instalación de «Actualizar ahora».
- **Veinticuatro mutaciones, las veinticuatro tumbadas**: once de las funcionalidades y trece de los
  arreglos de la revisión (cualquier autor, un fallo vuelto a preguntar en la versión o en «Qué trae», lo
  viejo anunciado, la misma frase para todo, la instalación nueva por lo apuntado después, el título
  cortado, lo sangrado, los guiones bajos, pintar sin mirar lo mandado, una pregunta por aviso, el ajuste
  roto sin decirlo, lo mandado sin recordar).
- Decisión 134, con «Lo que encontró la revisión».

## Next

- Publicar la 0.44.0. Será **la primera actualización de verdad con el clic**: tu barra 0.43.0 dirá «Hay una
  versión nueva de la barra» y la pondrá. Y, al recargar, «Ya tienes la 0.44.0. Esto es lo nuevo:».
