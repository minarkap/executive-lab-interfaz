---
type: proposal
title: Propuesta — Simplificar la barra
description: Cómo pasar de un panel de mandos con 40 botones a tres puertas y una tarjeta con lo que toca, con Conexiones como lo primero porque es lo que más cuesta.
timestamp: 2026-10-05T17:00:00Z
topic: sdd
slug: simplificar-la-barra
status: propuesta, sin aprobar
---

# Propuesta — Simplificar la barra

## En una frase

La barra deja de ser un panel de mandos y pasa a ser un acompañante. Arriba solo lo que de verdad cuesta
—**conectar sus herramientas, darle documentos y pedir ayuda**— y **una sola tarjeta con lo que toca
ahora**. Lo demás lo hace la conversación, o queda plegado en «Más».

Jose, 05-10-2026: *«que solo las cosas de más fricción estén […] mantener documentos, conexiones y lo de
ayuda pero hacerla más simple […] que sea inteligente e interactiva y que solo ponga lo necesario según el
caso, y en brownfield se adapte y dé ideas»*. Y: *«lo que más fricción da es conectar las conexiones y
tools […] las guías para sacar api keys […] y que se pueda saber qué preguntar a informáticos y
técnicos»*.

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

**La conversación ya hace casi todo.** La brújula (`orient`) cuenta dónde estás y qué sigue; pedir cosas
es escribirlas. Cada botón que solo manda un encargo al asistente compite con la caja de la conversación,
y la pierde.

**Lo que la barra hace mejor que la conversación** son cuatro cosas, y en eso se queda:

1. **Meter secretos sin pegarlos en el chat**, y guiar a sacarlos: las claves de cada herramienta.
2. **Meter ficheros**: arrastrar documentos.
3. **Ver de un vistazo si algo está roto**, arreglarlo y pedir ayuda.
4. **Ponerse al día** sola.

Lo demás —leer la wiki, el diario, las copias, las reglas, las habilidades— es información. El asistente
la cuenta mejor cuando hace falta, y la barra la puede enseñar sin que esté a la vista.

## Principios

1. **Tres puertas fijas**: Conexiones, Documentos y Ayuda. Siempre en el mismo sitio y con el mismo
   nombre.
2. **Una tarjeta, la que toca.** De una en una y decidida por reglas, no adivinada (P5). Con «Ahora no»
   pasa a la siguiente.
3. **Lo demás, en «Más», plegado y nunca escondido.** «Esconder no es simplificar: es mentir sobre lo que
   hay» (decisión 98). Todo sigue a dos clics.
4. **Cada pantalla, una acción principal.** Lo secundario va en la (i) o detrás de un «Más».
5. **Las cosas se llaman por lo que son** (decisión 98) y **ninguna pantalla sin salida** (P1).
6. **Nada predefinido**: ni una lista de herramientas ni de tareas en el código. Lo que se ofrece sale de
   lo que hay en la carpeta.

## La pantalla principal

```
┌─ Facturación · Ferretería Soler ───────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ A Holded le falta una clave.      │  │
│  │ [ Ponerla ]          Ahora no     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  🔌 Conexiones          1 por terminar  │
│  📄 Documentos          2 sin leer      │
│  🆘 Ayuda                               │
│                                         │
│  Tus botones                            │
│  · Resumen del mes                      │
│                                         │
│  Más ▸                                  │
└─────────────────────────────────────────┘
```

- **La tarjeta** dice una cosa, con un botón que la resuelve y «Ahora no».
- **Las tres puertas** llevan al lado su estado en dos palabras, nunca un número a secas.
- **«Tus botones»** solo sale si el alumno tiene alguno: los comandos que le ha dejado el asistente
  (pregunta 3).
- **«Más»** abre todo lo demás.

De unos 40 botones posibles a **6 como mucho**.

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

Conocimiento (wiki) pasa a «Más»: es lo que ha aprendido, y se le pregunta mejor al asistente.

## Ayuda, en tres

| Hoy (14 botones) | Después |
|---|---|
| Dime por dónde seguir · Qué le vendría bien a esto · Pensemos ideas juntos | **Estoy atascado**: el asistente dice por dónde seguir. Las ideas las da la tarjeta. |
| Resolver una incidencia (y tres atajos) · Qué falta por montar · Algo va mal | **Algo no funciona**: un solo camino. La barra revisa (lo de «Algo va mal»): si lo puede arreglar, «Arreglarlo»; si no, se lo pasa al asistente con el diagnóstico (lo de «Resolver una incidencia»); y si aun así sigue, el código para el tutor. |
| Contárselo a Executive Lab | **Contárselo a Executive Lab**, igual |
| Explícame cómo funciona esto · Esta barra | Abajo y pequeño: la versión, «Actualizar ahora», «Probar las versiones nuevas antes» y «Explícame cómo funciona esto» |

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

No es un menú de ideas, es la tarjeta de siempre. Si quiere más: «Pensemos ideas juntos» queda en «Más».

## «Más»

Todo lo que hoy está a la vista y deja de estarlo, en una sola pantalla con apartados y su recuento al
lado:

- **Lo que sabe**: Conocimiento (wiki) · Preguntas sin contestar · El diario.
- **Copias**: Guardar en git · Subir a GitHub · Ver las copias guardadas.
- **Cómo trabaja**: Habilidades (skills) · Comandos · Agentes · Las reglas · Cómo quieres que trabaje ·
  Cómo te habla · Tu asistente.
- **Esta carpeta**: Qué falta por montar · En qué estamos · El tema de mi empresa · Cambiar de proyecto ·
  Ver el editor completo.

## Lo que se respeta

- **P1**: ninguna pantalla sin salida, y cada pieza que falta, con su botón (la tarjeta 2).
- **P2**: el diccionario, antes de escribir. Los nombres de hoy se quedan, para que las capturas y lo que
  se explica en clase sigan valiendo.
- **P5**: la tarjeta, las ideas y el mensaje para el informático salen de reglas y del disco, no de una
  ocurrencia del modelo.
- **P6**: la acción de cada botón, tal cual la arma quien tiene los datos.
- **Decisión 98**: lo instalado se ve, aunque sea en «Más».
- **Nada predefinido**: ninguna herramienta nombrada en el código.

## Cómo se sabe que ha salido bien

- **En la principal, 6 botones como mucho**, en cualquier carpeta. `humo.js` lo mide en las tres
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
| F1 | El módulo de la tarjeta que toca, puro y probado. Todavía no cambia la pantalla. | S-M |
| F2 | La principal nueva: tres puertas, la tarjeta y «Más» | M |
| F3 | Ayuda en tres | S |
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

- **Quien ya usa la barra no encuentra un botón.** Nada desaparece: está en «Más» con el mismo nombre, y
  el «Qué trae» de esa versión lo cuenta.
- **La tarjeta esconde algo importante detrás de otra cosa.** El orden se prueba situación por situación,
  y «Ahora no» siempre deja ver la siguiente.
- **El mensaje para el informático da un consejo de seguridad equivocado.** Va escrito una vez, revisado,
  y el contenido de cada herramienta lo pone el asistente con su investigación, no la barra.
- **Con Codex no hay comandos**: «Tus botones» simplemente no sale, como hoy.

## Lo que tiene que decidir Jose antes de F2

1. **Habilidades (skills)**: recomiendo **«Más», y que aparezcan en la tarjeta cuando sirvan** («Para
   esto te vendría bien Facturación — Añadirla»). Nadie entra a curiosear el catálogo; lo que hace falta
   es la adecuada en el momento adecuado. En clase se sigue viendo la palabra, en «Más».
2. **Guardar en git**: recomiendo **la tarjeta cuando hay cambios sin guardar de hace más de un día, y en
   «Más»**. El asistente ya ofrece guardar al terminar algo, y existe «Cada cuánto guarda solo».
3. **«Tus botones»**: recomiendo que **se queden bajo las tres puertas, solo si tiene alguno**, y que
   sean **los que ha creado o ha elegido**, no los tres que hoy fijan los raíles por defecto. «No sé qué
   hacer ahora» ya es «Estoy atascado» en Ayuda, y «Seguir donde lo dejé» lo hace la brújula al abrir la
   conversación. Esto zanja de paso el choque entre la decisión 54 y la 70.
4. **¿Un prototipo antes de construir?** Una página con las pantallas nuevas de mentira, para verlas y
   tocarlas en el móvil o en el ordenador. Media hora, y evita construir algo que no convence.
