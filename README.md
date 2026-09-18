# Interfaz Executive Lab

Una capa sin fricción sobre el arnés [RSC](https://github.com/ericrisco/rsc-harness) para que
trabajadores de pymes **no técnicos** puedan usar Claude Code sin ver una terminal, una ruta de
fichero ni la palabra "commit".

## La idea en una frase

El motor es Claude Code oficial, interactivo, dentro de VS Code. **No construimos un chat.**
Construimos el instalador, el disfraz y los raíles que lo rodean.

## Por qué no un cliente propio

Se evaluó y se descartó por dos razones verificadas:

- **Facturación.** `claude -p` (headless) y las apps de terceros que se autentican con la suscripción
  del usuario a través del Agent SDK consumen un crédito mensual aparte. Claude Code interactivo en
  terminal o IDE, no. Anthropic ya intentó mover esa línea una vez.
- **Términos.** *"Unless previously approved, Anthropic does not allow third party developers to offer
  claude.ai login or rate limits for their products."*

Y el remate: la extensión `anthropic.claude-code` ya **es** una interfaz gráfica nativa sobre Claude
Code, gratis y mantenida por Anthropic, con **Focus view** — que esconde llamadas a herramientas,
resultados y razonamiento. Es la vista para no técnicos, ya construida.

## Cómo se reparte

**El camino principal es la extensión.** VS Code lleva Node dentro y el arnés viaja dentro del
`.vsix`, así que basta con instalarla: 6 MB, sin instalador de escritorio, sin SmartScreen, sin
permisos de administrador y sin necesidad de firmar código.

```bash
./publicar.sh        # deja en publicacion/ el .vsix y las notas de la release
```

El **instalador de escritorio** sigue vivo como camino secundario, para quien llega con el portátil
virgen: instala también VS Code, git y el asistente. Es lo único que cubre el hueco de git.

## Las cuatro piezas

| Carpeta | Qué es |
|---|---|
| [instalador/](instalador/) | Un doble clic: Node, VS Code, extensiones, perfil, RSC y la carpeta de trabajo. `.exe` en Windows, `.dmg` en Mac |
| [perfil/](perfil/) | El disfraz para probar a mano; el de verdad lo aplica la extensión |
| [extension/](extension/) | La barra lateral: brújula, herramientas, wiki y los botones que el arnés tenga |
| [skills/](skills/) | Los raíles conversacionales sobre RSC (configuración, no código) |

Y [docs/diccionario.md](docs/diccionario.md), que gobierna **todos** los textos: nada aparece en
pantalla si no está ahí.

![Las cuatro pantallas del panel](docs/panel.png)

Lo que el arnés va aprendiendo de la empresa se lee dentro del panel — sin rutas, sin markdown y sin
la cabecera técnica del artículo:

![Lo que sabe de tu empresa, y un artículo leído dentro](docs/docs.png)

Conectar una herramienta es un formulario guiado: los pasos que escribió el asistente al investigarla,
y debajo de cada campo de dónde se saca esa clave en concreto.

![La pantalla de una conexión, con su guía](docs/conexion.png)

Y cuando el alumno cuenta cuál es la web de su empresa, el panel deja de llevar nuestra marca y lleva
la suya — mismos botones, sus colores y su logotipo:

![El mismo panel con la marca de Executive Lab y con la de la empresa del alumno](docs/marca.png)

## La regla que ordena el panel

**No hay ni una herramienta, ni una tarea, ni un tema escritos en el código.** Todo lo que el alumno ve
sale de leer lo que RSC tenga montado en su carpeta: las conexiones de `01-TOOLS/`, los comandos de
`.claude/commands/` que lleven `boton:`, los temas de `02-DOCS/wiki/`. Y los botones crecen con el uso,
porque la habilidad `executive-lab` le dice a Claude que cree uno cuando una tarea se repite.

Una gestoría acaba con botones de facturación y una empresa de contratos con botones de contratos, sin
que nadie toque el código. Y **aparecen solos**: la barra vigila lo que el arnés escribe, así que lo
que le acabas de pedir al asistente sale sin cerrar nada.

Las decisiones y lo que se descartó, con las pruebas, están en [docs/decisiones.md](docs/decisiones.md).

## Qué se puede usar ya

[skills/](skills/) es configuración sobre RSC y no depende del instalador ni de la extensión:

```bash
node skills/aplicar.js "~/Documentos/Mi Empresa IA"
```

Se puede aplicar hoy a la cohorte actual. No pisa nada que el alumno haya escrito y se puede repetir
las veces que haga falta.

## Ver la interfaz aquí, en el Mac

```bash
./demo.sh --con-datos
```

Abre un VS Code **aislado** (sus propios ajustes y extensiones, dentro de `.demo/`, sin tocar los
tuyos) con la extensión de Claude y la nuestra instaladas de verdad, sobre una empresa de mentira ya
preparada con el arnés. Es lo que verá un alumno tras el instalador, disfraz incluido. La primera vez
tarda un par de minutos; después abre al instante. Con `--con-datos` siembra además una herramienta
conectada, una wiki y documentos sin leer, para ver las pantallas con contenido. `rm -rf .demo` para
empezar de cero.

## Comprobaciones

```bash
cd extension && npm run probar       # 59 comprobaciones con un vscode de mentira
node extension/prueba/humo.js --con-arnes   # + monta un arnés de verdad (tarda)
node docs/comprobar-diccionario.js   # ningún texto de pantalla usa palabra prohibida
cd extension && npm run empaquetar   # valida el manifiesto y genera el .vsix
node perfil/construir-perfil.js      # .code-profile para probar el disfraz a mano

cd instalador/mac && ./construir.sh  # el .dmg de macOS (~122 MB)
./probar.sh --casa /tmp/casa-falsa   # 19 comprobaciones, sin tocar tu Mac
```

Cómo probar el instalador de Mac entero sin ensuciar el tuyo:
[instalador/mac/COMO-PROBARLO.md](instalador/mac/COMO-PROBARLO.md).

## Estado

Prototipo **usable**, auditado el 17 de septiembre de 2026. Los hallazgos, qué se corrigió y qué
queda están en [docs/auditoria.md](docs/auditoria.md); las decisiones y lo que se descartó, con sus
pruebas, en [docs/decisiones.md](docs/decisiones.md); y dónde queda fricción, ordenada por cuánta
gente pierde cada punto, en [docs/friccion.md](docs/friccion.md).

**Probado de verdad:**

- El arnés montado desde cero en una carpeta vacía, **con solo el Node que lleva VS Code** y la copia
  de RSC que viaja en la extensión: `RSC_ONBOARDING_READY` con el suelo completo.
- El instalador de Windows, **ejecutado en una máquina real** por Jose: instaló, montó el arnés y
  trabajó con ello. De esa tarde salieron doce fallos que ninguna prueba automática habría visto.
- 45 comprobaciones con un `vscode` de mentira y una empresa con la forma que deja RSC
  (`cd extension && npm run probar`), más el wizard completo con `--con-arnes`.
- El comprobador del diccionario sobre todo el texto de pantalla.

**Lo que sigue sin probarse:** la extensión instalada desde el `.vsix` en una máquina limpia de
verdad, el instalador de macOS —que nunca se ha construido— y una sesión con un alumno real.

## Cómo se prueba

```bash
cd extension && npm run probar          # 45 comprobaciones
node extension/prueba/humo.js --con-arnes   # + monta un arnés de verdad
node docs/comprobar-diccionario.js      # ninguna palabra prohibida en pantalla
node herramientas/revisar-powershell.js # los .ps1, antes de llevarlos a Windows
./demo.sh --con-datos                   # verlo funcionando, sin tocar tu VS Code
./publicar.sh                           # deja el .vsix listo para la release
```

## Si clonas esto

El arnés que viaja dentro de la extensión no está versionado. Antes de empaquetar:

```bash
npm install --prefix extension/media/harness @ericrisco/rsc@1.4.1
```

Y para el instalador de escritorio, monta `instalador/windows/carga/` como dice
[instalador/README.md](instalador/README.md).

## Este repo también lleva el arnés

Está equipado con RSC en modo desarrollador. Se versionan `.rsc.json`, `.claude/settings.json` y
`.claude/rsc-bootstrap.mjs`; el resto está en `.gitignore`. Para retomarlo en otra máquina:
`npx @ericrisco/rsc@1.4.1 sync`.

> RSC 2.0.0 está publicado y aquí va fijada la 1.4.1 a propósito. Un salto de versión mayor puede
> cambiar el arnés, y hay que probarlo antes de que llegue a un alumno.
