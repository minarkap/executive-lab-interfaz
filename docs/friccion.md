# Dónde queda fricción, y qué hacer con ella

Escrito el 17 de septiembre de 2026, después de que Jose instalara el `.exe` en un Windows real y
encontrara en una tarde más fallos que todas mis pruebas automáticas juntas.

El orden es **por cuánta gente pierde cada punto**, no por lo interesante que sea arreglarlo. Un
alumno que se cae en el paso 2 no llega nunca al 9.

---

## Lo que pasa hoy, paso a paso

| # | Momento | Qué puede salir mal | Estado |
|---|---|---|---|
| 1 | Recibe el enlace y descarga | 277 MB. Con mala conexión, cinco minutos mirando una barra | Abierto |
| 2 | **SmartScreen** | *«Windows protegió tu PC»*. El botón visible es *No ejecutar* | **Abierto — el peor** |
| 3 | Instalación | ¿Pide administrador? No debería | Por confirmar |
| 4 | Responde el wizard | Seis páginas: asistente, de qué va, objetivo, cómo te manejas, cuánto te explico, nombres. ¿Se entienden solas? | Por confirmar |
| 5 | Espera | Unos minutos con una barra de progreso | Aceptable |
| 6 | Abre el acceso directo | Debería salir su barra, sin barras ni pestañas | Hecho |
| 7 | **Inicia sesión** | Necesita cuenta de pago. Si no la tiene, aquí se acaba | Avisado en la barra (§19); quién paga sigue abierto |
| 8 | Primera conversación | El asistente le pregunta; los raíles lo llevan | Hecho |
| 9 | Conecta una herramienta | Guía paso a paso y campos con su pista | Hecho |
| 10 | Se atasca | *Algo va mal* → código para el tutor | Hecho, sin probar en real |

---

## 1. Los 277 MB

**Por qué pesa:** lleva Node, MinGit, el arnés y el instalador de VS Code dentro, para no depender de
la red ni de que el alumno tenga nada.

**Lo que se puede hacer, por orden de coste:**

- **Quitar el instalador de VS Code del paquete** (~110 MB) y descargarlo durante la instalación. Se
  gana la mitad del peso y se pierde el funcionar sin red. Como ya hace falta red para el marketplace
  y para el login, no se pierde tanto.
- **MinGit sin la parte de documentación y locales** (~15 MB de los 40).
- **Un instalador pequeño que descarga el resto** (~5 MB). Es lo que hacen casi todos. Cuesta un día
  y necesita un sitio donde alojar los 270 MB.

**Recomendación:** lo primero, cuando haya medido cuánto tarda de verdad en una conexión de pyme.

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

**Los botones abren conversación nueva.** Claude no permite escribir en la que ya tienes abierta; con
Codex no permite ni eso, así que se copia al portapapeles. Lo honesto sería que los botones que solo
consultan **no hablaran con el asistente**: que la barra haga el trabajo y enseñe el resultado, como
ya hace con los scripts de una herramienta. Menos conversación, menos espera, menos fricción.

**El primer documento.** *Darle documentos* copia a la bandeja y avisa al asistente. Sería mejor
poder **arrastrar** un fichero sobre la barra.

**Cuando algo tarda.** El arnés puede tardar minutos y la barra solo dice *«Un momento…»*. Debería
decir qué está haciendo y cuánto lleva.

**El que llega al día siguiente.** Abre y no sabe si lo de ayer se guardó. La brújula lo dice, pero en
pequeño. Un *«Ayer dejaste X a medias»* arriba del todo valdría más.

## 5. Lo que ya no cuesta (y por qué)

- **La instalación**: un doble clic, sin Node, sin terminal, sin npm.
- **Elegir dónde trabajar**: se pregunta, y se puede cambiar.
- **Las claves**: guía paso a paso, campo por campo, con de dónde sale cada una.
- **Los ficheros**: no se ven. La wiki se lee dentro, sin markdown ni rutas.
- **Git**: se llama *Guardar copia de seguridad* y *Volver a como estaba antes*.
- **Cuando se rompe**: un código de seis letras para el tutor, no una pantalla roja.
- **El editor de quien ya lo usaba**: un interruptor por carpeta. Su VS Code no se entera.

---

## Si solo se pudiera hacer una cosa

Firmar el código. Todo lo demás de esta lista afecta a alumnos que **ya han conseguido instalarlo**.
