---
description: "Pasa las comprobaciones de la barra y dice en cristiano qué falla."
boton: "Revisar la barra"
icono: "🔎"
grupo: diario
argument-hint: "[arguments]"
---
Pasa las comprobaciones de este proyecto y cuéntame el resultado en dos líneas, sin pegarme la salida entera: $ARGUMENTS

```
node extension/prueba/humo.js
node extension/prueba/empresas-distintas.js
node docs/comprobar-diccionario.js
node herramientas/revisar-powershell.js
```

Si algo falla, dime **qué** falla y **dónde** está el fichero, no el volcado. Si pasa todo, una línea
basta.
