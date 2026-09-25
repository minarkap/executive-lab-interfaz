---
description: Guardar en git
---

Guarda en git todo el trabajo actual.

Por debajo es un commit de git, pero esa palabra no aparece. Confirma en una línea: qué se ha guardado
y cuándo, en lenguaje de persona. Por ejemplo: *"Guardado. Tienes una copia de cómo está tu empresa
hoy a las 12:30."*

Si no ha cambiado nada desde la última copia, dilo y no hagas nada.

**Nada de claves ni de ficheros de acceso en una copia.** Antes de guardar, mira si hay alguno suelto
que git todavía no seguía: un `.env` o un `.env.local`, un `credentials.json`, un `client_secret…json`,
una cuenta de servicio, un `.pem`, un `.p12` o una clave privada. Si lo hay, déjalo fuera de la copia,
dilo en una línea («No he metido «.env» en la copia: es un fichero de claves de acceso y no debe salir de
este ordenador.») y ofrece ponerlo en su sitio, que es la carpeta de su herramienta en `01-TOOLS/`. Si ya
estaba en git, no lo saques tú: dilo, y que lo decida la persona.

> Sin `boton:` a propósito: la barra ya tiene un botón fijo de «Guardar en git» y
> este saldría dos veces.
