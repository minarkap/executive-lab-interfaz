# La prueba en un VS Code de verdad

Todo lo demás que hay en `prueba/` usa dobles: un `vscode` de mentira y un
navegador de mentira. Eso coge mucho, y hay una clase de fallo que **no puede
coger por definición**: que el editor de verdad no haga lo que el doble dice que
hace.

Ejemplos reales de esta misma temporada, todos invisibles para los dobles:

- un comando registrado en el código y ausente del manifiesto;
- `markdown.showPreviewToSide`, que puede no existir según cómo arranque el
  editor;
- escribir un ajuste con el ámbito equivocado, que falla solo con una carpeta
  abierta de verdad;
- un reloj sin `unref` que deja el proceso vivo.

Esta prueba arranca un VS Code de verdad, le abre una empresa de mentira y
ejecuta **todos** los comandos de la barra, uno por uno. No mira cómo se ve —de
eso se encargan las comprobaciones de contraste de `humo.js`— sino que nada
reviente al tocarlo en un editor real.

Y arranca el editor **sin ningún `node` en el PATH**, como el ordenador de un
alumno, para medir el relevo de Node (C2): que la barra lo pone el primero, que
un proceso hijo lo hereda, y que el freno de los raíles corre con él y deniega un
`rm -rf`.

```
npm run probar-en-vscode
```

La primera vez se descarga un VS Code en `~/.cache/executive-lab-vscode-test/`,
**fuera del proyecto** a propósito: dentro, el arnés lo tomaría por código de este
proyecto (P8). Por eso no va en `probar`: tarda y pide red.
