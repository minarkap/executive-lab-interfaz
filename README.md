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

## Las cuatro piezas

| Carpeta | Qué es |
|---|---|
| [instalador/](instalador/) | Un doble clic: Node, VS Code, extensiones, perfil, RSC y la carpeta de trabajo |
| [perfil/](perfil/) | El disfraz para probar a mano; el de verdad lo aplica la extensión |
| [extension/](extension/) | La barra lateral Executive Lab: brújula + seis botones grandes |
| [skills/](skills/) | Los raíles conversacionales sobre RSC (configuración, no código) |

Y [docs/diccionario.md](docs/diccionario.md), que gobierna **todos** los textos: nada aparece en
pantalla si no está ahí.

Las decisiones y lo que se descartó, con las pruebas, están en [docs/decisiones.md](docs/decisiones.md).

## Qué se puede usar ya

[skills/](skills/) es configuración sobre RSC y no depende del instalador ni de la extensión:

```bash
node skills/aplicar.js "~/Documentos/Mi Empresa IA"
```

Se puede aplicar hoy a la cohorte actual. No pisa nada que el alumno haya escrito y se puede repetir
las veces que haga falta.

## Comprobaciones

```bash
node docs/comprobar-diccionario.js   # ningún texto de pantalla usa palabra prohibida
node perfil/construir-perfil.js      # .code-profile para probar el disfraz a mano
cd extension && npm run empaquetar   # valida el manifiesto y genera el .vsix
```

## Estado

Prototipo, **auditado el 17 de septiembre de 2026**: [docs/auditoria.md](docs/auditoria.md) tiene los
hallazgos, qué se corrigió y qué queda abierto. Dos decisiones del plan original cambiaron al
auditar (5 y 6 en [docs/decisiones.md](docs/decisiones.md)).

Probado de verdad, en este Mac: los raíles contra un perfil con el formato real de RSC (tres pasadas:
aplica, respeta el dial que bajó el alumno, `--forzar` lo repone); la extensión cargada y activada
contra un `vscode` de mentira (11 módulos, 9 comandos, disfraz, brújula, puente); el empaquetado con
`vsce`; el comprobador del diccionario; y el arnés RSC instalado en este mismo repo en modo
desarrollador (`rsc doctor` sano, hooks activos).

Lo que **no** se ha ejecutado nunca: la extensión dentro de un VS Code real, el instalador de Windows
y `preparar.js` de principio a fin. Hacen falta máquinas limpias: son las preguntas de
[docs/spike.md](docs/spike.md), y hasta responderlas no hay que construir más encima.

## Este repo también lleva el arnés

Este proyecto está equipado con RSC en modo desarrollador (`technical`, `L1`, `software`): skills
`orient`, `bro`, `eli5`, `show-me`, `suggest`, `unslop`, `harness`, `init`, memoria local y hooks en
`.claude/`. Se versionan `.rsc.json`, `.claude/settings.json` y `.claude/rsc-bootstrap.mjs`; el resto
está en `.gitignore`. Para retomar el arnés en otra máquina: `npx @ericrisco/rsc@1.4.1 sync`.
