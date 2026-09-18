# Dónde queda fricción, y qué hacer con ella

Escrito el 17 de septiembre de 2026, después de que Jose instalara el `.exe` en un Windows real y
encontrara en una tarde más fallos que todas mis pruebas automáticas juntas.

El orden es **por cuánta gente pierde cada punto**, no por lo interesante que sea arreglarlo. Un
alumno que se cae en el paso 2 no llega nunca al 9.

---

## Lo que pasa hoy, paso a paso

| # | Momento | Qué puede salir mal | Estado |
|---|---|---|---|
| 1 | Recibe el enlace y descarga | **6 MB** por el camino de la extensión. El instalador de escritorio son 268 MB en Windows y 103 en Mac | Resuelto por la extensión |
| 2 | **SmartScreen** (Windows) | *«Windows protegió tu PC»*. El botón visible es *No ejecutar* | **Abierto — el peor** |
| 2b | **Gatekeeper** (Mac) | Peor que SmartScreen: desde macOS 15 hay que ir a Ajustes del sistema | Hay cuenta de Apple; **faltan los certificados** |
| 3 | Instalación | ¿Pide administrador? No debería | **Mac: resuelto** (todo en su carpeta) · Windows: por confirmar |
| 4 | Responde el wizard | Ya no está en el instalador: lo hace el panel al elegir carpeta (decisión 27). ¿Se entienden solas las preguntas? | Por confirmar |
| 5 | Espera | Unos minutos con una barra de progreso | Aceptable |
| 6 | Abre el acceso directo | Debería salir su barra, sin barras ni pestañas | Hecho |
| 7 | **Inicia sesión** | Necesita cuenta de pago. Si no la tiene, aquí se acaba | Avisado en la barra (§19); quién paga sigue abierto |
| 7b | **Falta git** | Sin él no se puede preparar ninguna carpeta | Resuelto: el panel lo instala con un botón (decisión 26) |
| 8 | Primera conversación | El asistente le pregunta; los raíles lo llevan | Hecho |
| 9 | Conecta una herramienta | Guía paso a paso y campos con su pista | Hecho |
| 10 | Se atasca | *Algo va mal* → código para el tutor | Hecho, sin probar en real |

---

## 1. El peso — resuelto por el camino de la extensión

**Son 6 MB.** El camino principal es el `.vsix`, y ahí no hay nada que descargar: VS Code pone el
Node y el arnés viaja dentro del paquete.

El instalador de escritorio sigue pesando, y es el camino secundario:

| | Antes | Ahora | Por qué |
|---|---|---|---|
| Windows | 291 MB | **268 MB** | Fuera MinGit (git lo instala el suyo) y fuera el arnés (va en el `.vsix`) |
| macOS | 122 MB | **103 MB** | Lo mismo, y el editor se descarga al instalar |

Lo que queda de peso en Windows son los **236 MB del instalador de VS Code**, que viaja dentro para
no depender de la red. Descargarlo al instalar —como ya hace el Mac— dejaría el `.exe` en unos 30 MB.
Es lo siguiente si el peso vuelve a molestar.

## 2. SmartScreen — el peor de todos

Un `.exe` sin firmar enseña una pantalla que dice, en esencia, *esto es peligroso*. El botón grande
es *No ejecutar*. El de continuar está escondido detrás de *Más información*.

**No hay truco técnico.** Las opciones son:

- **Certificado OV** (~300 €/año): quita el aviso *después* de que unas cuantas descargas construyan
  reputación. Las primeras semanas sigue saliendo.
- **Certificado EV** (~600 €/año, con llave física): reputación desde el primer día.
- **Sin firmar**: un vídeo de 30 segundos enseñando dónde pulsar, y asumir que se pierde gente.

**Recomendación:** EV si la cohorte es grande, porque el aviso aparece justo en el primer minuto del
curso y no hay segunda oportunidad. Es la decisión más cara y la que más alumnos salva.

**En Mac esto sale mucho más barato y está a medio hacer.** La cuenta de Apple Developer (99 €/año)
ya está; lo que falta son tres pasos de media hora que solo puede dar el titular de la cuenta:
aceptar la licencia de Xcode, crear un certificado *Developer ID Application* y guardar el perfil de
notarización. Los detalles están en [instalador/README.md](../instalador/README.md) § Firma. Hasta
que eso pase, el Mac enseña un aviso **peor** que el de Windows: desde macOS 15 ya no vale el clic
derecho, hay que entrar en Ajustes del sistema.

## 3. La cuenta de Claude o de Codex

Cada alumno necesita una suscripción de pago. Hoy el instalador no lo menciona hasta que la extensión
pide iniciar sesión, y ahí se queda parado el que no la tenga.

**Qué reduce la fricción:**

- **Decirlo antes**: una página en el instalador, antes de empezar, con lo que hace falta y cuánto
  cuesta. Es peor descubrirlo a mitad.
- **Que la barra lo detecte**: si el asistente no tiene sesión, la brújula debería decir *«Falta
  iniciar sesión»* con un botón, en vez de dejar al alumno mirando un chat que no responde.
- **Decidir quién paga** antes de la cohorte. Es lo primero que va a preguntar la clase.

**Recomendación:** lo segundo se hace en una hora y evita el atasco más tonto. Lo tercero es tuyo.

## 4. Lo que sigue costando dentro, ya instalado

**Buscar ya no habla con el asistente** (hecho el 17-09-2026). La barra indexa la wiki, los botones
y las conexiones, y enseña el resultado al momento; solo cuando no encuentra nada ofrece
preguntárselo a él. Falta el resto:

**Los botones abren conversación nueva.** Claude no permite escribir en la que ya tienes abierta; con
Codex no permite ni eso, así que se copia al portapapeles. Lo honesto sería que los botones que solo
consultan **no hablaran con el asistente**: que la barra haga el trabajo y enseñe el resultado, como
ya hace con los scripts de una herramienta. Menos conversación, menos espera, menos fricción.

**El primer documento.** *Darle documentos* copia a la bandeja y avisa al asistente. Sería mejor
poder **arrastrar** un fichero sobre la barra. (Sin hacer: antes hay que comprobar si la barra puede
recibir un fichero soltado encima, que no está claro.)

**Cuando algo tarda.** El arnés puede tardar minutos y la barra solo dice *«Un momento…»*. Debería
decir qué está haciendo y cuánto lleva.

**El que llega al día siguiente.** Abre y no sabe si lo de ayer se guardó. La brújula lo dice, pero en
pequeño. Un *«Ayer dejaste X a medias»* arriba del todo valdría más. (Sin hacer. Lo que sí hay ahora
es una tarjeta que avisa de lo que se ha quedado a medias: documentos sin leer, una conexión sin
terminar, días sin guardar copia.)

## 5. Lo que ya no cuesta (y por qué)

- **La instalación**: un doble clic, sin Node, sin terminal, sin npm.
- **Elegir dónde trabajar**: se pregunta, y se puede cambiar.
- **Las claves**: guía paso a paso, campo por campo, con de dónde sale cada una.
- **Los ficheros**: no se ven. La wiki se lee dentro, sin markdown ni rutas.
- **Git**: se llama *Guardar copia de seguridad* y *Volver a como estaba antes*.
- **Cuando se rompe**: un código de seis letras para el tutor, no una pantalla roja.
- **El editor de quien ya lo usaba**: un interruptor por carpeta. Su VS Code no se entera.
- **Buscar algo**: se escribe y aparece, sin abrir una conversación ni esperar (§4, primer punto).
- **Que falte git**: ya no es un callejón. El panel lo instala con un botón, con el instalador
  oficial de cada sistema (decisión 26). Antes decía *«díselo a tu tutor»*, que no es una salida para
  quien está solo delante de la pantalla.
- **Instalar y no saber dónde vas a trabajar**: el instalador ya no elige carpeta por ti. La eliges
  cuando abres el programa, y el panel la prepara (decisión 27).

---

## Si solo se pudiera hacer una cosa

**Distribuirlo como extensión y no como instalador** (decisión §20). Se lleva por delante los tres
primeros puntos de esta lista de una vez: el peso, SmartScreen y los permisos. Y con ellos, la
necesidad de firmar código, que era lo más caro.

Lo que queda después: **la cuenta de pago**, que es tuya y no técnica. El hueco de git que aquí se
daba por irreducible ya no lo es: el panel lo instala con un botón (decisión 26), así que el camino
de la extensión ya no depende del instalador de escritorio para nada.
