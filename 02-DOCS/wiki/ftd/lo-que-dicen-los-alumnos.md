---
type: ftd
title: Lo que falla, lo que no se entiende y lo que se echa en falta llega a Jose
date: 2026-09-28
status: hecho
---

# Lo que falla, lo que no se entiende y lo que se echa en falta llega a Jose

## Intent

Jose, 28-09-2026: *«alguna forma de detectar cuando la extensión no va bien o cuando el alumno no se
aclara bien con ella […] que sus agentes lo detecten […] y se envíe una issue al repo para que yo
pueda revisarla y aprobarla»*. Y dudaba entre mandarlo con permiso o sin él, y si poner además un botón.

Hoy, lo que falla en el ordenador de un alumno se queda allí: «Algo va mal» deja un informe en un
fichero y un código para el tutor, y a Jose no le llega nada. Lo que no se entiende y lo que se echa en
falta no lo recoge nadie.

## Decisión: con permiso, aviso por aviso

`minarkap/executive-lab-interfaz` es **público**, y una incidencia abierta con la cuenta del alumno lleva
su nombre de GitHub a la vista de cualquiera. Mandarla sin preguntar sería publicar en su nombre. Así que:

- **Preparar no pide permiso**: el asistente o la barra dejan el aviso escrito en su carpeta, que no sale
  de su ordenador.
- **Mandar, sí**: la barra se lo enseña entero y editable, dice dónde va y quién lo puede leer, y solo sale
  con «Mandarlo». Si dice que no, no se vuelve a proponer el mismo.

## Scope

**Dentro**

- `avisos.js`: dónde se guardan, cómo se leen los que deja el asistente, cómo se limpian antes de salir
  (claves, carpetas del ordenador, nombre de la empresa y de la carpeta, correos) y cómo se abren en
  GitHub con la sesión que la barra ya tiene (`repo` basta para un sitio público).
- Tres entradas, y una sola pantalla para mandar:
  1. **El alumno**: «Contárselo a Executive Lab» en Ayuda, con tres opciones (algo no funciona, algo que
     no entiendo, una mejora) y también desde «Algo va mal», con el informe.
  2. **Su asistente**: los raíles (`siempre.md`, regla 8, y `SKILL.md`) le dicen qué se cuenta, qué no se
     cuenta nunca, cómo se escribe en `02-DOCS/raw/avisos/` y que no lo mande él.
  3. **La barra**: lo que revienta por dentro en un botón se apunta solo, una vez por fallo.
- En la pantalla principal, el que haya esperando, con «Verlo antes de mandarlo» y «Ahora no».
- `.github/workflows/avisos.yml`: les pone etiquetas al llegar (`aviso de alumno`, `por revisar` y su tipo),
  para que Jose los revise y los apruebe.
- `02-DOCS/raw/avisos/` fuera de git y vigilado por la barra.
- Diccionario, decisión 131 y pruebas.

**Fuera, y por qué**

- **Mandar sin cuenta de GitHub.** Pediría un servidor intermedio con una clave de Jose, que es
  infraestructura suya y de pago. Sin cuenta, el aviso se queda guardado y el tutor tiene el código.
- **Pull requests**: lo dijo Jose.
- **Mandar sin preguntar**: ver la decisión.

## Checklist

- [x] 1. `avisos.js`: limpiar, componer, mandar, leer los del asistente, archivar.
- [x] 2. La barra: Ayuda, «Algo va mal», pantalla de mandar, aviso en la principal, fallos por dentro.
- [x] 3. Los raíles: `siempre.md` (regla 8) y `SKILL.md`, en las dos copias.
- [x] 4. Fuera de git y vigilado.
- [x] 5. El flujo de etiquetas, con la misma marca que escribe la barra.
- [x] 6. Diccionario, decisión 131, y todas las comprobaciones en verde.
- [x] 7. Revisión adversaria (seguridad y privacidad, y corrección).

## Evidence

- `humo.js`: **339 comprobaciones pasadas** (eran 331). Hay ocho nuevas, y la de las innegociables pasa
  de siete a ocho. `contrato.js`, `empresas-distintas.js`, `comprobar-diccionario.js` y
  `revisar-powershell.js`, en verde.
- **Dieciséis mutaciones, las dieciséis tumbadas**: la pantalla leyendo solo lo de dentro del estado,
  las claves sin tapar, la marca escrita de otra forma, un fallo apuntado cada vez, lo mandado sin
  apartar, los avisos dentro de git, mandar sin cuenta, el nombre de la empresa sin quitar, sin candado
  contra el doble clic, lo limpio mandado sin enseñarlo, el título sin enseñar, sin las formas del
  nombre, la marca en cualquier sitio, la red de la oficina sin tapar, el separador en lo del asistente
  y archivar donde diga `carpeta()`.
- **Revisión**: dos refutadores, seguridad y corrección. Dos críticos y cinco importantes, todos
  arreglados con su prueba (decisión 131, «Lo que encontró la revisión»). Tras los arreglos:
  **339 comprobaciones pasadas**, y contrato, diccionario y PowerShell en verde.
- El guion del flujo de GitHub se ejecuta en la prueba con un GitHub de mentira. Pone `aviso de
  alumno`, `por revisar` y `no se entiende`; con una etiqueta que ya existe no se para, y a una
  incidencia sin marca no le pone nada. El YAML se lee bien.
- **Encontrado por el camino, y arreglado**: el consejo, la versión nueva, «En qué estamos» y el botón
  de Agentes de la principal no salían nunca. Se reprodujo pintando el mensaje tal cual lo manda la
  extensión (`false false`), y ahora lo prueba `un botón que revienta deja apuntado un aviso…`.

## Next

- **Publicar una versión** (`/publicar-una-version`) para que llegue a los alumnos: la barra instalada va
  por detrás del código. Con ella, también empezarán a ver el consejo, la versión nueva, «En qué estamos»
  y el botón de Agentes, que no salían.
- Las carpetas montadas antes verán «Puesto, pero de una versión anterior de la barra» hasta que se
  pongan al día los raíles (regla 8 y el bloque de lo que no entra en git).
- El flujo `avisos.yml` actúa desde que esté en `main`.
- Si Jose quiere avisos de quien no tiene cuenta de GitHub, hace falta un servidor intermedio suyo.
