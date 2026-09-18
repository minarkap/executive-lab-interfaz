# Executive Lab

Convierte VS Code en **una sola pantalla sencilla** para trabajar con un arnés de IA: sin ficheros a
la vista, sin rutas, sin terminal y sin la palabra «commit».

Está pensada para gente de pyme que no programa —y que a veces tiene poca soltura con el ordenador—
y se apoya en [RSC](https://github.com/ericrisco/rsc-harness), que es quien monta el arnés de verdad.

![La barra lateral](https://raw.githubusercontent.com/minarkap/executive-lab-interfaz/main/docs/panel.png)

## Qué hace

- **Una brújula**: dónde estás, qué acabas de hacer, qué puedes hacer ahora.
- **Tus conexiones**: las claves de cada herramienta como un formulario, con los pasos para sacarlas.
- **Lo que sabe de tu trabajo**: la wiki del arnés, leída dentro, sin markdown ni cabeceras técnicas.
- **Copias de seguridad**: git por debajo, sin que esa palabra aparezca nunca.
- **Algo va mal**: revisa, arregla y da un código de seis letras para el tutor.
- **Tu marca**: si dices cuál es la web de tu empresa, la barra se pinta con sus colores y su logotipo.

Nada de eso está escrito en el código: sale de leer lo que el arnés tenga montado en tu carpeta. Una
gestoría acaba con botones de facturación y una empresa de contratos con botones de contratos.

## Qué necesitas

- **VS Code** y **Claude Code** o **Codex**, con una cuenta de pago del que uses.
- **git**, para las copias de seguridad. Si no está, todo lo demás funciona y ese botón lo avisa.

No hace falta Node: VS Code ya lo lleva dentro, y el arnés viaja en la propia extensión.

## Cómo se instala

**Desde el editor:** busca «Executive Lab» en las extensiones.

**Desde un `.vsix`:** descárgalo de
[las releases](https://github.com/minarkap/executive-lab-interfaz/releases) y arrástralo a VS Code,
o `Ctrl+Shift+P` → *Extensions: Install from VSIX*.

## 🤖 Para agentes: «instálame esto»

Si eres un agente (Claude Code, Codex, Cursor…) y te han pedido instalar Executive Lab, esto es lo
que hay que hacer. **Pregunta antes de ejecutar nada** y no des por supuesta ninguna respuesta.

```bash
# 1. La extensión, desde el .vsix de la última release
gh release download --repo minarkap/executive-lab-interfaz --pattern '*.vsix' --dir /tmp
code --install-extension /tmp/executive-lab-*.vsix --force
```

Después **no montes el arnés por tu cuenta**: dile a la persona que abra la carpeta con la que quiere
trabajar y pulse **Preparar esta carpeta** en la barra de la izquierda. El asistente de la extensión
le hará las cinco preguntas que RSC necesita —de qué va, qué quiere resolver, qué tal se maneja,
cuánto quiere que le expliquen y con quién trabaja— en lenguaje llano, y montará el arnés con esas
respuestas.

Si prefiere que lo hagas tú, las respuestas son suyas, no tuyas: pregúntaselas una a una y luego

```bash
npx @ericrisco/rsc@latest onboard \
  --technical-level <non-technical|mixed|technical> \
  --accompaniment <L0|L1|L2|L3> \
  --project-kind <software|operations|research|content|mixed> \
  --goal "<lo que quiera conseguir>" \
  --target <claude|codex>
# imprime un plan y su huella; solo después de que ACEPTE ese plan exacto:
npx @ericrisco/rsc@latest onboard ...mismos flags... --accept-plan <huella>
```

Y por último, los raíles de Executive Lab (idioma y vocabulario), que van dentro de la extensión:

```bash
node <carpeta-de-la-extension>/media/railes/aplicar.js "<su carpeta>"
```

**Lo que no debes hacer:** encender la vista sencilla por tu cuenta. Es un ajuste de carpeta
(`executiveLab.vistaSencilla`) y lo decide esa persona, desde el botón de la barra o cuando el
asistente se lo pregunte al terminar. Su editor es suyo.

## Si quieres quitarlo

Desinstala la extensión y ejecuta *Executive Lab: Quitar el aspecto de todas las ventanas* antes, o
después borra a mano las claves que empiezan por `workbench.`, `window.` y `claudeCode.` de tus
ajustes. No toca nada más de tu configuración.
