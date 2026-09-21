---
name: texto-de-la-barra
description: "Úsala siempre que vayas a escribir o cambiar algo que se vea en la barra lateral: un rótulo, un botón, un aviso, un mensaje de error. Comprueba el diccionario antes de escribir, no después, y propone la palabra que ya existe en vez de inventar una nueva."
tags: [interfaz, diccionario, texto, executive-lab]
origin: executive-lab
---

# El texto de la barra

Esta barra la usa gente que no es técnica. Cada palabra que sale en pantalla tiene que estar en
`docs/diccionario.md` **antes** de escribirla, no después.

## Lo que hay que hacer, en orden

1. **Mira la tabla primero.** Si lo que vas a nombrar ya está, usa esa palabra exacta. No una
   parecida, la misma.
2. **Si no está, no la inventes sobre la marcha.** Propón la línea que habría que añadir a la tabla y
   espera. Lo que evita que la interfaz se llene de jerga por goteo es justo este paso.
3. **Comprueba**: `node docs/comprobar-diccionario.js`. Caza las palabras prohibidas, pero no caza
   las nuevas — eso lo tienes que ver tú.

## Los tres fallos que ya se han cometido

Por si sirven de aviso, porque los tres los pilló Jose y no el comprobador:

- **Una tercera palabra para lo mismo.** Los artículos de la wiki se llaman *conceptos*. Se les llamó
  *fichas* en una conversación y ya nadie entendía de qué se hablaba.
- **Nombrar la pregunta en vez de la cosa.** Once rótulos empezaban por «Qué…». Cuando todos
  preguntan, ninguno destaca y hay que leerlos enteros para distinguirlos.
- **Nombrar el verbo en vez del dueño.** *Ver los documentos* y *Llevarte un archivo* sonaban igual
  siendo cosas distintas. *Documentos entregados* y *Resultados* se distinguen solas.
- **Nombrar lo que el asistente sabe hacer en vez de la cosa.** *Lo que sabe hacer*, *Puede
  aprender*, *Ayudantes*, *Procesos con un clic*: perífrasis amables que impedían atar lo que se oye
  en clase con lo que se lee en la barra. Jose, 21-09-2026: *«sin simplificaciones excesivas»*. Una
  clase de cosa se llama por su nombre —**Habilidades (skills)**, **Comandos**, **Agentes**,
  **Conexiones (tools)**— y una cosa concreta por el suyo —**Facturación**, no «llevar tus
  facturas»—. Lo que hace va en la (i), y el identificador (`/unslop`) también.

## Cómo se escribe

Segunda persona y verbo primero. Un mensaje, una idea. Los errores dicen **qué hacer**, no qué
falló. Y ninguna pregunta sin opciones: un campo vacío delante de alguien que no sabe qué escribir
es una pared.
