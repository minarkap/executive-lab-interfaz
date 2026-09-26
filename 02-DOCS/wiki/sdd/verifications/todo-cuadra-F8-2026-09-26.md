---
type: verification
title: Verificación — todo-cuadra, F8 (los papeles)
description: La batería de F8, criterio por criterio, con lo observado y las mutaciones de cada prueba nueva.
timestamp: 2026-09-26T11:30:00Z
topic: sdd
spec: 02-DOCS/wiki/sdd/specs/todo-cuadra.md
fase: F8
veredicto: pasa
---

# Verificación — F8

Rama `todo-cuadra`, sobre la revisión de F7 (`cbaa7c1`). Tareas T067–T071 y T078 del
[plan](../plans/todo-cuadra.md#f8--documentación-diccionario-y-repositorio). F8 se empezó sobre F7 y se
apartó en un `stash` mientras se arreglaba lo que encontró la revisión de F7; después se siguió encima.
T078 es nueva: salió al escribir T071.

## La batería

| Comprobación | Después de la revisión de F7 | Ahora |
|---|---|---|
| `node extension/prueba/humo.js` | 308 | **314** pasadas, código 0 |
| `node extension/prueba/humo.js --con-arnes` | 315 | **321** pasadas, código 0 |
| `node extension/prueba/contrato.js` | 13 | **13** pasadas, código 0 |
| `node extension/prueba/empresas-distintas.js` | las tres empresas, enteras | igual |
| `node docs/comprobar-diccionario.js` | limpio | limpio, con 54 ficheros y 709 rótulos |
| `node herramientas/revisar-powershell.js` | 4 ficheros, sin pegas | igual |
| `git ls-files -ci --exclude-standard` | cuatro | vacío |
| `grep -rn "Prueba con" extension/src extension/media/panel.js` | catorce | vacío |
| `grep -rnE "cinco preguntas\|0\.9\.1" README.md publicar.sh extension/README.md` | los decían | vacío |

## Criterio por criterio

| # | Observado |
|---|---|
| A8 | La pantalla principal de una carpeta sin arnés dice «antes te hago entre 9 y 12 preguntas», contadas por `rumbo.cuantasPreguntas` con las mismas reglas que las hacen. Ya no dice «una sola cosa» |
| H1 | El README, las notas de `publicar.sh` y el README de la extensión no dicen ni el número de preguntas ni el de la release, dicen que no hace falta instalar Node, y ya no mandan borrar `.rsc.json`. Lo del instalador que se firma queda para Jose |
| H2 | Una sola lista: la del comprobador. La prueba del catálogo la usa. El comprobador ve una palabra sembrada en `nombres.json`, en `capacidades.json`, en la ventana de Mac (también en un diálogo de varias líneas), en los pasos de `instalar.js` y en el asistente de Windows. No ve la del registro (`anotar`), ni las de los comentarios, ni «Node.js». La prueba de las capacidades ya no salta: 246, todas reales |
| H3 | `git ls-files -ci` sale vacío, y una prueba lo vigila. La descripción de `untrustedWorkspaces` dice quién apaga la confianza (el instalador) y qué hace la barra sola al abrirse |
| H4 | Veintiocho mensajes mandan a «Algo va mal», y todos dicen «y pásale el código a tu tutor». La marca descartada dice «Hace falta uno más claro o más oscuro» |
| H5 | `docs/para-rsc.md` tiene nueve cosas para Eric; las seis nuevas llevan fichero y línea contra la 2.0.5, comprobados en el paquete, y un borrador de issue cada una |
| B11 (T078) | Al volver a montar, lo que el asistente apuntó en el perfil sigue ahí: el cuerpo y los campos de la cabecera que RSC no escribe. El objetivo es el del plan nuevo, y el título y el objetivo no se duplican. Lo devuelto lleva el dial que se acaba de elegir, y «Cómo te habla» lee ese. Con un RSC que ya conserve el cuerpo, no se duplica nada |

## Prueba de mutación

| Tarea | Mutaciones | Se ponen rojas |
|---|---|---|
| T067 | el recuento fijo · sin la web en la cuenta · la brújula con la frase de antes · el README con el número | las cuatro, la segunda tras fijar el recuento de una carpeta vacía |
| T068 | sin nombres propios · sin `nombres.json` · sin `capacidades.json` · el registro como pantalla · sin la ventana de Mac · sus comentarios como pantalla · sin `[Messages]` · un comentario de `[Messages]` · sin las cadenas de Windows · sus comentarios · sin los nombres de los lenguajes · las notas de la tabla · `tieneUnaProhibida` ciega · un diálogo de varias líneas cortado · el catálogo del instalador otra vez | las quince |
| T069 | un comando de RSC vuelve a git | la una |
| T070 | uno vuelve a «Prueba con» · uno sin el paso siguiente | las dos |
| T078 | no se devuelve nada · solo con «listo» · el cuerpo con el dial de antes · sin la cabecera · el título dos veces · el objetivo dos veces · sin la guarda de duplicados · la guarda con el dial al día | las ocho; «sin la cabecera», tras cambiar el campo de sonda |

Treinta, y mueren todas. Dos sobrevivían y cada una pedía algo a la prueba, no al código:
- «sin la web en la cuenta»: la prueba solo miraba que la pantalla y `rumbo` dijeran lo mismo, y ahora
  fija el recuento de una carpeta vacía;
- «sin la cabecera»: la prueba miraba `language: es`, que los raíles vuelven a escribir, y ahora mira
  `sector`, que no escribe nadie más.

Y repasando el código de T078 salió un fallo del arreglo: la guarda contra duplicados comparaba lo
devuelto ya con el dial nuevo, y con un RSC que conserve el cuerpo, que lo traería con el de antes, lo
duplicaba. Se compara tal cual estaba, con su prueba, y la mutación que lo deja como antes («la guarda
con el dial al día») muere.

## Pruebas que cambiaron

- La de la brújula esperaba «Puedo montar tu empresa», que además chocaba con la regla de no llamarlo
  empresa: espera la frase nueva.
- La del catálogo dejó su lista de diez palabras y usa la del comprobador.
- La de las capacidades mira el catálogo del `.vsix`.

## Lo que no se puede comprobar aquí

- La versión del `.iss` y del `Info.plist`, y lo que dicen `probar.ps1` y `COMO-PROBARLO.md`. El plan
  para el autopilot antes de tocar los instaladores, que van firmados, así que se quedan para Jose. Y
  lo de Windows se mide allí.
- Abrir las issues de RSC: sale fuera, y lo hace Jose.

## Lo que encontró la revisión con ojos frescos

La hizo un revisor aparte, sobre una exportación de `056950f`, sin tocar el repositorio. Reprodujo la
batería (`humo` 314, `humo+` 321, `contrato` 13, las tres empresas, el diccionario y PowerShell) y
probó sus casos con guiones propios: las 288 combinaciones de la entrevista, perfiles con listas y
tildes, y palabras sembradas donde el comprobador no miraba. Comprobó una a una las citas de
`docs/para-rsc.md` contra el paquete, y todas son correctas. Veredicto: *hay que hacer cambios*, con 0
críticos, 5 importantes y 7 menores. Se comprobaron todos contra el código y, salvo lo que el plan
deja para Jose, se aceptaron.

| Hallazgo | Qué se hizo |
|---|---|
| **Importante 1 (A8).** La cuenta daba dos nombres siempre, y con «La empresa entera» se pregunta uno: la pantalla prometía de 9 a 12 y en el caso más típico se hacían 8. La prueba fijaba lo que devolvía la propia cuenta, sin mirar la entrevista. Y no contaba el aviso de Documentos entera ni el de dentro de otro proyecto | Un nombre con «La empresa entera» y dos si no: de 8 a 12. Una prueba nueva hace la entrevista entera, por el camino más corto y por el más largo, y mira que dé la cuenta. Y la cuenta suma el aviso de Documentos, el Escritorio o las Descargas enteras, y el de dentro de otro proyecto, que la brújula ya le pasa |
| **Importante 2 (H1).** Las órdenes `onboard` para agentes ofrecían `software` y `mixed` sin `--software-scope`, que RSC exige, y la lista de preguntas no traía la del tamaño | Las dos órdenes llevan el tamaño, con una línea que dice cuándo cuenta, y la lista trae lo que RSC necesita. Comprobado con el RSC empaquetado: sin el tamaño, `mixed` no monta; con `operations` no molesta. Prueba nueva |
| **Importante 3 (H1, T067).** El `.iss` sigue en 0.9.0, y `probar.ps1` y `COMO-PROBARLO.md` esperan git y el arnés dentro del instalador | Se quedan para Jose: el plan para el autopilot antes de tocar los instaladores firmados. Lo que no era exacto era el motivo escrito, «se firma», porque editarlos no firma nada. Está corregido |
| **Importante 4 (T078).** Al devolver la cabecera del perfil solo volvían las líneas que empiezan por una clave, sin tildes: una lista volvía sin sus elementos, un bloque sin su texto, y `dirección:` no volvía | Cada clave vuelve con lo que cuelga de ella, y las claves pueden llevar tildes. Prueba nueva con una lista, un bloque y una clave con tilde |
| **Importante 5 (H2).** «El motor de JavaScript sigue sirviendo de resto» sale saltada siempre, y el registro daba una razón falsa | La razón de verdad: ese motor solo existe con `isomorphic-git`, que ya no trae nada de este repositorio y solo queda en instaladores de antes. La prueba lo dice así, y el registro se corrige. Retirar ese motor o traer la biblioteca para probarlo queda para Jose |
| Menor 1. Erratas y datos viejos en el README: «las unas preguntas», `instalacion.log`, «cinco sitios» y lo que versiona este repositorio | Corregidos. La prueba de la versión se llama ya «en todos los sitios donde está escrita» |
| Menor 2 (H2). El comprobador no miraba los títulos de las vistas, la descripción de la confianza ni los mensajes de los módulos comunes | Los mira. Lo que va al registro (`anotar`) no cuenta, en ningún fichero. Sembrado en la prueba, y el proyecto, limpio |
| Menor 3. La descripción de la confianza no era del todo exacta | Dice lo que hace la barra al abrirse, con los nombres del diccionario, y que con el `.vsix` solo sí sale |
| Menor 4 (H4). La prueba no veía comillas curvas ni «Pulsa en…»; el raíl de ayuda pedía el código para el asistente, `siempre.md` no decía qué hacer con él, y la pieza del recibo roto tampoco | La prueba ve esas formas, y lo comprueba. Los raíles dicen que el código es para el tutor, y la pieza, «Pulsa «Algo va mal» y pásale el código a tu tutor». Pruebas nuevas |
| Menor 5. La marca decía «Hace falta uno más claro», que ya no dice qué hacer | «Pídele al asistente uno más claro o más oscuro»: verbo primero y lo que se puede hacer |
| Menor 6. El punto 9 de `docs/para-rsc.md` no contaba lo que ahora hace T078 | Lo cuenta |
| Menor 7. Quedaban textos que llaman «tu empresa» a la carpeta | Los cinco dicen «esta carpeta» o «una carpeta». Las preguntas por la empresa de verdad se quedan. Prueba nueva |

### Mutación de los arreglos

Quince, y mueren todas:
- dos nombres siempre, sin contar Documentos entera, sin contar dentro de otro proyecto, y la brújula
  sin la carpeta de verdad;
- los dos README sin el tamaño;
- las claves sin tildes, y sin lo que cuelga de cada una;
- el comprobador sin los títulos de las vistas, sin la confianza o sin `git.js`;
- la pieza sin el tutor, el raíl de ayuda pidiendo el código para el asistente, y la búsqueda sin
  comillas curvas;
- la carpeta llamada «tu empresa» otra vez.

La batería, con los arreglos y sobre F8: `humo` 320, `humo+` 327, `contrato` 13, las tres
empresas, y el diccionario (57 ficheros y 712 rótulos) y PowerShell limpios.
