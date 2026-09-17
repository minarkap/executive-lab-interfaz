# Los raíles

Configuración sobre RSC, no código. **Es lo único de este proyecto que se puede usar hoy**, sin
esperar al instalador ni a la extensión.

## Aplicarlo a un alumno

```bash
node aplicar.js "~/Documentos/Mi Empresa IA"
```

Deja cuatro cosas y no pisa nada que el alumno haya escrito:

| Qué | Dónde | Para qué |
|---|---|---|
| La habilidad | `.claude/skills/executive-lab/` | Español, vocabulario de negocio, nunca mandarlo a una terminal |
| Cuatro comandos | `.claude/commands/` | `/empezar` `/seguir` `/guardar` `/ayuda` |
| Los diales | `02-DOCS/wiki/harness/user-profile.md` | Es lo que lee `orient` para calibrar la brújula |
| La declaración | `.rsc.json` → `ownSkills` | Constancia de que es nuestra; RSC la conserva y no la toca |

Se puede volver a ejecutar tantas veces como haga falta: no duplica nada. Sobre el perfil, **ajusta
solo los diales y respeta el resto** (RSC escribe ahí el objetivo del alumno). Y si el perfil ya lleva
la marca de los raíles, no lo toca: el alumno puede haber pedido "no me expliques tanto" y `orient`
haberle bajado el dial a propósito. Para volver a ponerlo igualmente, `--forzar`.

## Por qué "own skill" y no una skill del catálogo

RSC distingue entre lo que instala él y lo que escribe tu equipo. Una habilidad propia vive en el repo
del alumno, funciona para quien clone sin ejecutar ningún comando, y **RSC nunca la instala, actualiza
ni sobrescribe**: su versión es el commit. Es exactamente lo que queremos: los raíles son nuestros y no
compiten con el catálogo.

Un matiz honesto: el README de RSC dice que `doctor` avisa cuando a alguien le falta una `ownSkill`.
En la 1.4.1 no lo hace (no hay rastro en `scripts/doctor.js`); la declaración sirve hoy solo de
constancia.

## La pieza que más importa

El perfil de usuario fija los diales, con los nombres de campo que usa el propio RSC:

```yaml
technical_level: non-technical
accompaniment: L3
language: es
```

`orient` los lee antes de escribir cada bloque de brújula. **L3 es acompañamiento total** y se baja
solo cuando el alumno lo pide. Que alguien haga bien tres tareas seguidas no significa que quiera menos
explicación — es la trampa fácil, y deja tirada a la persona justo cuando empezaba a confiarse.

## Antes de tocar nada aquí

Léete [docs/diccionario.md](../docs/diccionario.md). El vocabulario está cerrado a propósito: si cada
uno escribe con sus palabras, el alumno se encuentra tres nombres distintos para lo mismo y deja de
fiarse de los dos que no reconoce.
