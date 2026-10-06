---
type: proposal
title: Propuesta — Simplificar la barra
description: Cómo pasar de un panel de mandos con 40 botones a tres filas (Documentos, Acciones y Ayuda), una tarjeta con lo que toca y una línea que dice que todo está guardado, con Conexiones como lo primero porque es lo que más cuesta. Solo sale lo que se tiene; lo demás se apaga, sin borrar nada, y se puede volver a encender.
timestamp: 2026-10-05T17:00:00Z
topic: sdd
slug: simplificar-la-barra
status: propuesta, sin aprobar
---

# Propuesta — Simplificar la barra

## En una frase

La barra deja de ser un panel de mandos y pasa a ser un acompañante que no da miedo. Arriba, **una sola
tarjeta con lo que toca ahora**; debajo, **Documentos, Acciones y Ayuda**, con solo lo que el alumno tiene;
y abajo, una línea que dice que **todo está guardado**. Conexiones es lo primero, porque es lo que más
cuesta. Lo demás se pide con palabras, o se apaga **sin borrarlo**, para poder encenderlo otro día.

Jose, 05-10-2026: *«que solo las cosas de más fricción estén […] mantener documentos, conexiones y lo de
ayuda pero hacerla más simple […] que sea inteligente e interactiva y que solo ponga lo necesario según el
caso, y en brownfield se adapte y dé ideas»*. Y: *«lo que más fricción da es conectar las conexiones y
tools […] las guías para sacar api keys […] y que se pueda saber qué preguntar a informáticos y
técnicos»*.

## Lo que queda, decidido

Jose, 06-10-2026: *«simplificar para que no dé miedo, dejando solo lo esencial»*; y después, la forma:
*«en el acordeón: Documentos, como estaba; Acciones, con Conexiones, Comandos y Habilidades; y finalmente
la ayuda […] y por último el «✓ Todo guardado» con las cosas de git […] solo deben aparecer las cosas que
se tienen, y la propia interfaz debe sugerir instalar cosas si se detecta que se recomienda»*.

| Pieza | Cómo queda |
|---|---|
| **La tarjeta que toca** | Arriba, una sola, cuando hay algo que decir |
| **Documentos** (plegable) | Como estaba: Darle documentos (inbox), Documentos entregados, Resultados (out) |
| **Acciones** (plegable) | Conexiones (tools), Comandos, Habilidades (skills) y Agentes. **Cada uno, solo si hay alguno**, con cuántos al lado. Conexiones sale siempre, porque desde ella se conecta la primera |
| **Ayuda** (plegable) | Estoy atascado · Algo no funciona · Pedir ayuda a una persona · Sugerencias · y abajo, pequeño, Esta barra (ver «Ayuda») |
| **✓ Todo guardado, hace 5 minutos** | Una línea abajo. Al pulsarla: Guardar en git, Ver las copias guardadas, Volver a como estaba, Subir a GitHub. Se guarda solo por defecto |
| Lo demás | Apagado, no borrado (ver «No se borra nada») |

**Solo sale lo que se tiene.** Una fila vacía no se pinta. Lo que falta y le vendría bien lo propone la barra:
en la tarjeta, la sugerencia que más pesa, y en Ayuda › Sugerencias, todas. Por ejemplo, «Le pides esto cada
semana: ¿lo dejo como botón?» crea un comando, y «Para esto te vendría bien Facturación» añade una
habilidad del catálogo.

## No se borra nada: se apaga

Jose, 06-10-2026: *«no borres los mapeos, solo desactívalo […] simplifícalo desactivando cosas, no borres
nada, porque me interesa y a futuro quiero mantenerlo»*.

- **Ni una pantalla, ni un botón, ni un mapeo se quita del código.** `nombres.json`, `capacidades.json`,
  el diccionario, las 34 pantallas y sus encargos se quedan como están.
- **Lo que no está a la vista está apagado**, en un solo sitio: una tabla de piezas (`media/piezas.json`)
  con cada una y si se enseña o no. Encender una es cambiar una línea, sin tocar la pantalla.
- **Un ajuste lo enciende todo**: `executiveLab.barraCompleta`, apagado de fábrica y sin botón en la
  barra. Es para Jose, para un tutor que necesite verlo todo, o para probar. Con él puesto, la barra es la
  de hoy.
- **Lo apagado sigue probado.** `humo.js` pinta todas las pantallas y despacha todas las acciones, estén
  encendidas o no. Así lo que se apaga no se pudre, y el día que se encienda funciona.
- **Lo apagado no sale.** La decisión 98 («lo instalado se ve») se sigue cumpliendo: lo que el alumno tiene
  —sus conexiones, sus comandos, sus habilidades, sus agentes— sale en Acciones.

## El criterio

Jose, 06-10-2026: *«la idea es quitar todo lo que sea más fácil hacer con lenguaje natural […] por eso lo
de las conexiones es tan importante»*.

Para cada botón, una pregunta: **¿se puede pedir con una frase, y el asistente lo hace igual o mejor?** Si
la respuesta es sí, el botón sobra. En la barra se queda solo lo que la conversación no puede hacer, o hace
mal:

1. **Meter secretos**: claves y ficheros de acceso. No deben pasar nunca por el chat, y muchas veces los
   tiene otra persona. **Por eso Conexiones es lo primero.**
2. **Meter ficheros**: arrastrar un documento es más fácil que describirlo.
3. **El estado de este ordenador**: si el asistente está puesto, si la carpeta está preparada, si algo se ha
   roto, si hay una versión nueva. El asistente no ve fuera de su conversación, y no puede arreglarse a sí
   mismo si es él lo que falla.
4. **Dar permiso**: mandar un aviso o poner una versión nueva los decide la persona, con un clic.
5. **Añadir una habilidad del catálogo**: el asistente tiene prohibido hacerlo él (regla 7 de los raíles),
   porque se saldría de la versión de la clase.
6. **Lo que pasa fuera de la conversación**: que se ha arreglado algo que contó.

**Lo que se apaga**: hoy hay **34 botones que solo le mandan una frase hecha al asistente** («Dime por
dónde seguir», «Pensemos ideas juntos», «Crear un comando», «Explícame cómo funciona esto», los tres atajos
de «Resolver una incidencia»…). Casi todos se apagan, sin borrarlos. Solo siguen a la vista los que llevan
dentro algo que la barra sabe del disco y el alumno no sabría decir con sus palabras, como «Que las ordene»,
que manda el reparto exacto de las claves sueltas. Y siguen como botón de la tarjeta, cuando toca, no
siempre.

## Lo que hay hoy

Medido en el código el 05-10-2026 (`panel.js`, `extension.js` y los módulos que deciden qué sale):

| | Hoy |
|---|---|
| Pantallas | 34, más 33 órdenes en la paleta del editor, que son otra puerta |
| Lo normal en la principal, todo plegado | 4-8 botones: los tres comandos de los raíles en «Acciones rápidas», «Elegir cuáles» y alguna tarjeta, más 6 rótulos plegados |
| El peor caso en la principal | **53 cosas que se pueden pulsar**: hasta 8 cajas de aviso y tarjetas antes de «Acciones rápidas», y 25 botones dentro de 7 grupos |
| Tarjetas que se apilan arriba | **hasta 5 a la vez**: lo nuevo, el consejo, lo que contó, un aviso y la versión, cada una con su «Ahora no» y su plazo (14, 7 y 3 días) |
| Ayuda | 5 apartados y 13 botones fijos |
| Poner la clave de una conexión | **4 clics**: Acciones › Conexiones › la conexión › Guardar |
| Contárselo a Executive Lab desde Ayuda | 5 clics |

Lo que más se repite:

- **«Qué hago ahora»**, desde cuatro sitios:
  - «No sé qué hacer ahora», el comando que los raíles fijan arriba;
  - el apartado del mismo nombre en Ayuda, con «Dime por dónde seguir», que pide casi lo mismo;
  - «Seguir donde lo dejé»;
  - «Estoy atascado», que solo abre Ayuda.
- **«Algo falla»**, por cuatro caminos, cada uno con su nombre: «Resolver una incidencia» y sus tres
  atajos, «Algo va mal», «Contárselo a Executive Lab» y «Qué falta por montar». Además, el apartado
  «Algo no funciona» de Ayuda y el tipo «Algo no funciona como debería» de los avisos casi se llaman
  igual y llevan a sitios distintos.
- **Ideas**: ocho botones que le piden propuestas al asistente, y la tarjeta del consejo, que sale a la
  vez en la principal y en Sugerencias.
- **Configurar al asistente**, en siete pantallas: Comandos, Habilidades, Agentes, Las reglas, Cómo quieres
  que trabaje, Cómo te habla y Tu asistente. Dentro hay cinco botones para que recuerde una preferencia y
  cinco para crear algo.
- **«Documentos sin leer»**, hasta tres veces en la principal: en la línea de arriba, en el consejo y en
  un botón. Y ese botón lleva a Conocimiento, no a la lista de los que esperan.

Y lo que ya choca con decisiones tomadas:

- **La 25** dice «una tarjeta como mucho», y hoy salen cinco: la 131, la 132 y la 134 añadieron cada una
  la suya «como el consejo».
- **La 31** dice que cada fila plegada cuenta lo que lleva dentro, y solo lo hacen 2 de 7.
- **La 101** pide un nombre por pantalla, y en 8 el botón y el título no coinciden: por ejemplo, «Estoy
  atascado» abre «Ayuda», y «Ver las copias guardadas» abre «Volver atrás».
- **La 54 y la 70** se contradicen sobre qué sale en «Acciones rápidas» sin elegir nada.
- **«Volver»** lleva a la principal aunque se haya llegado desde otra pantalla. En tres pantallas está
  abajo, no arriba (decisión 56).
- **«Díselo a tu tutor»** sale en tres sitios sin ningún botón.
- **Un fallo de la 0.43.0**: tras «Actualizar ahora», lo más probable es que salgan a la vez el aviso y
  la tarjeta, los dos con «Ya está puesta… Recargar ahora». Se arregla en F2.

Cada pieza tiene su porqué en `docs/decisiones.md`, y casi todas resolvieron algo que pasó de verdad.
El problema no es ninguna en concreto. Es que, juntas, ponen delante de una persona que no es técnica
lo mismo que vería quien hizo la barra.

## Por qué sobra

**La conversación ya hace casi todo.** La brújula (`orient`) cuenta dónde estás y qué sigue, y pedir cosas
es escribirlas. Cada botón que solo manda un encargo al asistente compite con la caja de la conversación, y
la pierde. Lo demás —leer la wiki, el diario, las reglas, las habilidades— es información, y el asistente
la cuenta mejor cuando se le pregunta.

## Principios

1. **Tres filas fijas**: Documentos, Acciones y Ayuda, siempre en el mismo sitio y con el mismo nombre.
   Arriba, la tarjeta; abajo, la línea de las copias.
2. **Una tarjeta, la que toca.** De una en una y decidida por reglas, no adivinada (P5). Con «Ahora no»
   pasa a la siguiente.
3. **Solo sale lo que se tiene**, y lo que falta lo sugiere la barra cuando sirve.
4. **Lo demás, apagado y no borrado.** Sigue en el código y probado, y se enciende con una línea o con un
   ajuste. Cada pantalla, una acción principal; lo secundario, en la (i).
5. **Las cosas se llaman por lo que son** (decisión 98) y **ninguna pantalla sin salida** (P1).
6. **Nada predefinido**: ni una lista de herramientas ni de tareas en el código. Lo que se ofrece sale de
   lo que hay en la carpeta.

## La pantalla principal

```
┌─ Facturación · Ferretería Soler ───────┐
│  ┌───────────────────────────────────┐  │
│  │ A Holded le falta una clave.      │  │
│  │ [ Ponerla ]          Ahora no     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ▸ Documentos             2 sin leer    │
│  ▾ Acciones                             │
│     🔌 Conexiones (tools)  2 · 1 a medias│
│     ⌘  Comandos            3            │
│     ✦  Habilidades (skills) 2           │
│  ▸ Ayuda                                │
│                                         │
│  ✓ Todo guardado, hace 5 minutos        │
└─────────────────────────────────────────┘
```

- **La tarjeta** dice una cosa, con un botón que la resuelve y «Ahora no». Cuando no hay nada que decir, no
  sale.
- **Tres filas plegables**, cada una con su estado en palabras al lado. Agentes aparece dentro de Acciones
  el día que haya alguno.
- **La línea de las copias** dice que todo está guardado. Si no lo está, dice desde cuándo, y al pulsarla
  deja guardarlo.

Plegado, son **cinco cosas a la vista** como mucho: la tarjeta, tres rótulos y la línea de las copias.

## La tarjeta que toca

Un módulo nuevo, puro como `rumbo.js`: entra lo que la barra ya sabe del disco y sale **una** tarjeta,
o ninguna. Se prueba con situaciones inventadas, sin abrir nada. Junta en un solo orden lo que hoy son
seis tarjetas que se apilan:

| Orden | Cuándo | Qué dice | Botón |
|---|---|---|---|
| 1 | Falta el asistente, o la carpeta está sin preparar o a medias | lo de hoy (`primerPaso`, `sinAjustar`) | lo de hoy |
| 2 | Algo está roto (una pieza en «no» de Qué falta por montar) | «Hay algo que no funciona y lo puedo arreglar.» | Arreglarlo |
| 3 | Claves dentro de las copias: las de una aplicación ya guardadas en git (PR #10, `sueltas.deLasAppsEnLasCopias()`) | «Hay 3 claves de tu aplicación dentro de tus copias.» | Que deje de guardarlas |
| 4 | Claves fuera de sitio (`sueltas.resumen()`, decisión 104) | «Hay 5 claves fuera de sitio.» | Que las ordene |
| 5 | Acaba de ponerse una versión nueva | «Ya tienes la 0.45.0. Esto es lo nuevo: …» | Entendido |
| 6 | Una conexión a medias: le faltan claves, o falla al probarla | «A Holded le falta una clave.» | Ponerla |
| 7 | Documentos sin leer desde hace más de un día | «Tienes 2 documentos sin leer.» | Que los lea |
| 8 | Cambios sin guardar desde hace más de un día | «Tienes cambios sin guardar desde ayer.» | Guardar en git |
| 9 | Un aviso para Executive Lab esperando | lo de hoy | Verlo antes de mandarlo |
| 10 | Lo que contó, cerrado | lo de hoy | Entendido |
| 11 | Hay una versión nueva | lo de hoy | Actualizar ahora |
| 12 | Una idea (ver «Se adapta y da ideas») | «Por lo que hay aquí, te vendría bien …» | Hacerlo |

Lo de las claves va arriba porque es lo único de la lista que puede costar dinero si se deja: una clave
dentro de las copias sube a GitHub con ellas. El orden se puede discutir; lo que no se discute es que salga
**una**. Lo apartado con «Ahora no» vuelve
según sus plazos de hoy.

## Conexiones: lo primero, porque es lo que más cuesta

### Hoy

Cada conexión tiene:
- sus pasos («Cómo conectarla»), en una lista entera;
- un campo por clave, con «dónde se saca»;
- «Abrir su página» y «Probar la conexión».

Las claves que ya había en la carpeta se detectan y se ofrece ordenarlas. Es una buena base. Lo que
falla es lo que pasa cuando el alumno se para:
- una lista de diez pasos con tres campos debajo es una pared;
- no se sabe qué *clase* de acceso pide la herramienta;
- y no hay nada para cuando la clave la tiene que sacar otra persona.

### Cómo sería

**1. La lista, con el estado de cada una en una palabra.**

```
🔌 Conexiones
  Holded        Conectada · probada hoy
  Google Drive  Le falta un fichero de acceso
  Stripe        Falla: la clave no vale
  [ Conectar algo nuevo ]
```

**2. Conectar algo nuevo.** «¿Qué quieres conectar?», con ejemplos sacados de la carpeta, nunca de una
lista fija:
- claves sueltas de una herramienta sin conexión;
- las herramientas que dijo en su perfil;
- un `credentials.json` que anda por ahí.

El asistente investiga la herramienta de verdad y deja escritas cuatro cosas:
- **qué clase de acceso pide** (punto 4);
- **los pasos**;
- **de dónde sale cada dato**;
- **qué pedirle a su informático** (punto 5).

**3. La guía, un paso cada vez.** No la lista entera:

```
Holded · paso 3 de 5
En el menú de la izquierda, baja hasta «Desarrolladores» y entra en «API».
[ Abrir su página ]   [ Hecho, siguiente ]   No lo encuentro
```

- **El campo de la clave sale en el paso donde se consigue la clave**, no al final.
- **«No lo encuentro»** le pasa al asistente la herramienta y el paso, para que lo busque.
- **Al guardar, se prueba sola**, y el resultado se dice en una frase con lo que hay que hacer:
  «Conectada» o «Esa clave no vale: cópiala otra vez entera».

**4. Cada clase de acceso, su forma.** El asistente la escribe en una columna nueva de
`CREDENTIALS.md`, «Tipo de acceso», y la barra elige la pantalla según lo que diga ahí:

| Tipo de acceso | Lo que ve el alumno |
|---|---|
| Una clave | un campo para pegarla |
| Usuario y contraseña de la herramienta | dos campos |
| Un fichero de acceso (cuenta de servicio, certificado) | «Suéltalo aquí», y va a su sitio |
| Entrar con tu cuenta (OAuth) | no hay nada que pegar: «Entrar» se lo pide al asistente, que abre el navegador |
| Una dirección que te dan (un webhook) | un campo, con la explicación de dónde aparece |

**5. «Pídeselo a tu informático».** Muchas veces la clave no la puede sacar el alumno: la tiene quien
administra la cuenta, o hay que dar permisos que no sabe dar. Un botón en cada conexión arma un mensaje
listo para mandar, con «Copiarlo» y «Mandarlo por correo». Dice:

- qué herramienta y para qué («para que el asistente de Executive Lab lea las facturas de Holded»);
- qué acceso exactamente: la clase, los permisos mínimos, y si basta con solo leer;
- **cómo hacerla llegar sin riesgo**: nunca por correo ni por mensajería; mejor que la pegue él mismo
  en la barra, o con un gestor de contraseñas;
- la página donde se hace;
- **qué preguntarle** si no está claro: «¿Tenemos cuenta de empresa en esto?», «¿Quién es el
  administrador?», «¿Hay que dar de alta la dirección de este ordenador?».

El mensaje no se inventa al pulsar. La barra lo arma con lo que el asistente dejó escrito en una sección
nueva del README de la conexión, «## Para tu informático» (P5). El raíl (`SKILL.md`, §2) le pide
escribirla con los pasos.

**6. Lo que ya existe se queda:** detectar claves fuera de sitio y ordenarlas, las conexiones por montar,
las consultas de cada una y no enseñar nunca un valor.

## Documentos

Una pantalla con tres cosas:
- **Darle documentos**: arrastrar aquí, que también funciona encima de la principal, como hoy;
- **Sin leer todavía**, con «Que los lea»;
- **Resultados**: lo que ha hecho, para abrirlo o llevárselo.

Conocimiento (wiki) se apaga: es lo que ha aprendido, y se le pregunta mejor al asistente.

## Ayuda, para cuando no se sabe ni qué escribir

Es justo el momento en que un botón vale más que el lenguaje natural. Cuatro bloques:

1. **Estoy atascado**
   - **Seguir donde lo dejé**: retoma lo de la última vez con la memoria del arnés (el comando `/seguir`).
   - **Conversación nueva**: cuando una conversación se alarga, se lía o da vueltas, empezar otra es lo que
     mejor funciona. La barra abre una nueva y la empieza con «seguimos con lo de antes: lee dónde lo
     dejamos y dime en qué punto estamos». Así no se pierde nada.
   - **Dime qué hago ahora**: dos o tres opciones concretas.
2. **Algo no funciona**: un solo camino en lugar de los seis botones de hoy. La barra revisa (lo de «Algo
   va mal»). Si lo puede arreglar, «Arreglarlo». Si no, se lo pasa al asistente con el diagnóstico (lo de
   «Resolver una incidencia»). Y si aun así sigue, el código para el tutor. Dentro, **«Volver a como
   estaba»**.
3. **Pedir ayuda a una persona**
   - **Contárselo a Executive Lab**: la incidencia en GitHub, como hasta ahora (decisión 131).
   - **Pedir ayuda en el foro** (nuevo):
     - el alumno pega lo que le ha dicho el asistente, por ejemplo un mensaje de error;
     - la barra le quita las claves, las carpetas y el nombre de su empresa, con el mismo `limpiar` de los
       avisos, y le añade la versión de la barra, la del arnés y el sistema;
     - se lo enseña limpio;
     - con «Copiarlo y abrir el foro», lo deja en el portapapeles y abre el foro para que lo pegue.

     Lo publica él: es un sitio de personas, y la barra no publica nada en su nombre sin que lo vea. **Falta
     la dirección del foro.**
4. **Sugerencias**: todo lo que la barra detecta que le vendría bien, cada cosa con su botón:
   - un comando, cuando pide lo mismo varias veces;
   - una habilidad del catálogo que encaja;
   - un agente;
   - una conexión para las claves que ya tiene;
   - las ideas de automatización que apuntó el asistente.

   La que más pesa sale también sola en la tarjeta.

Abajo y pequeño, **Esta barra**: la versión, «Actualizar ahora» y «Probar las versiones nuevas antes».

| Hoy (14 botones) | Después |
|---|---|
| Dime por dónde seguir · Qué le vendría bien a esto · Pensemos ideas juntos | Estoy atascado (3) y Sugerencias |
| Resolver una incidencia (y tres atajos) · Qué falta por montar · Algo va mal | Algo no funciona: un camino |
| Contárselo a Executive Lab | Pedir ayuda a una persona: Executive Lab y el foro |
| Explícame cómo funciona esto · Esta barra | Esta barra, abajo y pequeño |

## Nada se pierde

Para alguien que no es técnico, el miedo a romper algo paraliza más que cualquier dificultad de verdad. Así
que:

- **Las copias se guardan solas por defecto**, cada hora mientras la ventana está abierta y haya algo
  nuevo («Cada cuánto guarda solo», que hoy viene apagado).
- **«Volver a como estaba»** vive dentro de «Algo no funciona», que es donde se busca cuando algo ha
  salido mal. Antes de mover nada se guarda una copia de lo de ahora, como hoy.
- Guardar a mano, en la misma línea de las copias; o se le pide al asistente, que ya lo ofrece al terminar
  algo.

## Se adapta y da ideas

**En una carpeta que ya tenía cosas** (brownfield), la primera vez:
- **una tarjeta «Esto parece …»**, con lo que la barra ya sabe leer: «Esto parece una web hecha con React,
  con claves de Stripe y 40 documentos»;
- **dos o tres ideas concretas** sacadas de lo que hay, de una en una en la tarjeta, cada una con su
  botón:
  - claves sueltas: «Conectar Stripe, que ya usas»;
  - documentos tirados: «Que los coloque»;
  - una habilidad del catálogo que encaja con lo que hay (lo que ya calcula `consejos.js`).

**En una carpeta nueva**, las ideas salen de lo que dijo al prepararla («Para qué es esto»).

No es un menú de ideas: es la tarjeta de siempre, y la lista entera en Ayuda › Sugerencias.

## Lo que se apaga

Sin borrar nada, y con `executiveLab.barraCompleta` para volver a verlo todo:

- **Conocimiento (wiki)**, Preguntas sin contestar y El diario: se le preguntan al asistente.
- **En qué estamos** (lo de SDD).
- **Las reglas**, **Cómo quieres que trabaje**, **Cómo te habla** y **Tu asistente**: se piden con una
  frase («explícame menos», «pregúntame antes de cambiar nada»).
- **El tema de mi empresa**: lo hace el asistente cuando sabe su web.
- **Qué falta por montar**, como botón suelto: sus arreglos salen en la tarjeta y en «Algo no funciona».
- Los botones que solo mandan una frase hecha, salvo los de Ayuda.

Se queda, pequeño, en **Ayuda › Esta barra**: **Cambiar de proyecto**. Con el editor en modo sencillo no
hay menús, y sin él no habría forma de abrir otra carpeta. **Ver el editor completo** sigue en la barra de
estado, como hoy.

## Lo que se respeta

- **P1**: ninguna pantalla sin salida, y cada pieza que falta, con su botón (la tarjeta 2).
- **P2**: el diccionario, antes de escribir. Los nombres de hoy se quedan, para que las capturas y lo que
  se explica en clase sigan valiendo.
- **P5**: la tarjeta, las ideas y el mensaje para el informático salen de reglas y del disco, no de una
  ocurrencia del modelo.
- **P6**: la acción de cada botón, tal cual la arma quien tiene los datos.
- **Decisión 98**: lo instalado se ve, en Acciones.
- **Nada predefinido**: ninguna herramienta nombrada en el código.

## Cómo se sabe que ha salido bien

- **En la principal, 5 cosas a la vista como mucho** con todo plegado, en cualquier carpeta. `humo.js` lo mide en las tres
  empresas de mentira.
- **Clics hasta lo frecuente**:
  - poner una clave: de 4 a 2 (Conexiones → la conexión);
  - darle un documento: 0 (arrastrarlo encima);
  - pedir ayuda: 1;
  - contárselo a Executive Lab: de 5 a 2;
  - cualquier otra cosa: 2 como mucho (Más → lo que sea).
- **Una tarjeta, no cinco**, en cualquier situación; y **un nombre por pantalla**: el botón dice lo mismo
  que el título que abre.
- **Con personas**: la misma tarea —«conecta tu Holded»— con dos o tres alumnos o tutores, antes y
  después, cronometrada, apuntando dónde se paran.

## Por fases, cada una en su PR

| Fase | Qué | Tamaño |
|---|---|---|
| F0 | La tabla de piezas y el ajuste `barraCompleta`: todo encendido, como hoy, y las pruebas que pintan lo apagado. No cambia nada a la vista. | S |
| F1 | El módulo de la tarjeta que toca, puro y probado. Todavía no cambia la pantalla. | S-M |
| F2 | La principal nueva: la tarjeta, Documentos, Acciones (solo lo que hay), Ayuda y la línea de las copias. Se apaga lo demás en la tabla. | M |
| F3 | Ayuda: Estoy atascado (con «Conversación nueva»), Algo no funciona en un camino, Pedir ayuda (Executive Lab y el foro) y Sugerencias | M |
| F4 | Conexiones I: el estado en la lista, la guía de un paso cada vez y probar al guardar | M |
| F5 | Conexiones II: las clases de acceso, «Pídeselo a tu informático» y el raíl | M-L |
| F6 | Se adapta y da ideas | M |
| F7 | Documentos en una pantalla | S |
| F8 | La versión, con un «Qué trae» que explique el cambio: «Ahora la barra es más sencilla: arriba lo que más cuesta, y lo demás en Más». | S |

Orden recomendado:
1. **F1, F2 y F3** primero, que es lo que más se nota.
2. **F4 y F5** después, que es donde está la fricción.
3. **F6 y F7** al final.

Cada fase pasa por revisión adversaria y por las máquinas de GitHub, como hasta ahora.

## Riesgos

- **Quien ya usa la barra no encuentra un botón.** El «Qué trae» de esa versión lo cuenta, lo que sigue
  encendido tiene el mismo nombre, y si un tutor lo necesita todo, `executiveLab.barraCompleta` lo
  devuelve tal cual.
- **Lo apagado se pudre sin que nadie lo vea.** Por eso `humo.js` lo sigue pintando y despachando entero.
- **La tarjeta esconde algo importante detrás de otra cosa.** El orden se prueba situación por situación,
  y «Ahora no» siempre deja ver la siguiente.
- **El mensaje para el informático da un consejo de seguridad equivocado.** Va escrito una vez, revisado,
  y el contenido de cada herramienta lo pone el asistente con su investigación, no la barra.
- **Con Codex no hay comandos**: Comandos simplemente no sale en Acciones.

## Lo decidido con Jose

1. **Documentos**, como estaba.
2. **Acciones**: Conexiones, Comandos, Habilidades, y Agentes cuando haya alguno. Cada uno, solo si hay algo.
3. **Ayuda**: Estoy atascado (con «Conversación nueva»), Algo no funciona, Pedir ayuda a una persona (Executive
   Lab y el foro) y Sugerencias.
4. **Git**: la línea «✓ Todo guardado», y se guarda solo por defecto.
5. **Solo sale lo que se tiene**, y la barra sugiere lo que falta.
6. **Nada se borra**: se apaga y se puede volver a encender.

Pendiente: **la dirección del foro**, y si se hace un prototipo antes de construir.
