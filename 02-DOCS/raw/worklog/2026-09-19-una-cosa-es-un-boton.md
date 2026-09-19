---
type: worklog
title: Una cosa es un botón, y lo que hace está detrás de una (i)
description: Las tres listas de la barra - comandos, habilidades y ayudantes - pintaban cada cosa en tres bloques y un botón que ponía "Hacerlo". Ahora la cosa es el botón. Los ayudantes dejan su apartado propio y se meten en Acciones, y las habilidades pasan a tener botón por primera vez. 0.16.0.
timestamp: 2026-09-19T19:00:00Z
topic: interfaz
status: unprocessed
sources: []
---

## Qué hicimos

Jose, viendo la pantalla de comandos: *«quiero que sea con botones, no tanta cosa. Si quieres saber
qué hace puedes meter una (i) de info y meter ahí las cosas. Pero tiene que ser más minimalista»*.

Y antes de eso: *«Pon los comandos, skills y agentes bien en el arnés, solo me salen los dos
comandos»*.

## Lo primero no era lo que parecía

Los tres estaban. Se comprobó ejecutando los módulos contra este mismo repositorio:

    COMANDOS     6   (2 nuestros + 4 que trae RSC)
    AGENTES      2   guardián de las pruebas · vigía del diccionario
    HABILIDADES  1 propia + 4 puestas + 25 que puede aprender

Lo que pasaba es que **los ayudantes tenían un apartado propio**, arriba y aparte, con un único
botón dentro: un desplegable entero para llegar a una cosa. Y son lo mismo que los otros dos —algo
que esta carpeta sabe hacer— así que ahora van dentro de **Acciones**, junto a comandos y
habilidades. Siguen sin salir hasta que hay al menos uno.

## Lo minimalista

Cada cosa ocupaba tres bloques: nombre en negrita, párrafo, y un botón que ponía **"Hacerlo"**. Con
seis comandos era una pantalla de scroll; con veinticinco habilidades, ilegible. Y el botón no decía
qué hacía: decía "Hacerlo".

Ahora hay un solo ayudante de pintado, `filaDeAccion()`, que usan las tres pantallas: el botón con
su nombre, y pegada una (i) cuadrada que despliega la explicación debajo. Dentro del desplegable
caben los botones de segunda fila —"Ver su encargo"— que antes competían con el primero.

La (i) abre y cierra **sin repintar**. Importa: repintar tira el scroll al principio, y en una lista
de veinticinco cosas eso es perder el sitio cada vez que miras una.

## Dos cosas que estaban mal y se vieron al juntarlas

- **Las habilidades no tenían botón.** Eran una lista que no se podía usar: había que salir de ahí y
  escribirlo a mano. Ahora se pulsa una y se pide. En "Puede aprender", pulsar la instala — y el
  rótulo del montón lo dice, para que pulsar un nombre no signifique dos cosas según dónde estés.
- **"Hacerlo" no es un rótulo.** Nombra el acto, no la cosa. Es el mismo fallo que ya está escrito en
  la habilidad `texto-de-la-barra` —nombrar el verbo en vez del dueño— y se nos había colado tres
  pantallas.

## Ficheros tocados

- `extension/media/panel.js` — `filaDeAccion()`, `engancharLasInfos()`, las tres pantallas, y los
  ayudantes dentro de Acciones
- `extension/media/panel.css` — `.fila`, `button.info`, `.loQueHace`
- `extension/prueba/humo.js` — dos comprobaciones nuevas
- `docs/decisiones.md` — decisión 80

## Cómo quedó

149 comprobaciones, las tres empresas enteras, diccionario limpio. Publicada e instalada la 0.16.0.

## Lo siguiente

Sigue abierto el montaje fallido en una carpeta de Jose: desde la 0.15.1, "Algo va mal → Enseñar el
informe" trae el motivo dentro. Falta que lo mire.
