---
type: ftd
title: Cada clave tiene un sitio, y una incidencia se resuelve desde la barra
date: 2026-09-22
status: hecho
---

# Cada clave tiene un sitio

## Intent

Jose, con una captura de un proyecto suyo: las claves no estaban en `01-TOOLS/<herramienta>/.env`
sino en un `.env.local` de la raíz —Replicate, Pexels, Buffer, Drive y Telegram juntas— y en
`.env.local` dentro de la carpeta de una herramienta. La barra no las veía, así que en Conexiones
(tools) salían herramientas «sin conectar» que funcionaban, y proveedores enteros que no salían.
*«Hay que conseguir un mapeo muy bueno con las posibilidades de RSC»* y *«al inicializar el arnés
buscara y encontrara todos los `.env` con todas las credenciales y las herramientas lo ajustara con
RSC»*. Y: *«debería haber un botón donde ponga resolver incidencias […] el asistente audita todo»*.

## Lo que RSC define (y por tanto el «sitio»)

`skills/harness/SKILL.md` y `assets/_TEMPLATE/`: **una carpeta por proveedor en `01-TOOLS/`**, con
`.env` (real, nunca lo escribe RSC), `.env.example` (los nombres), `CREDENTIALS.md` (dónde se saca
cada una), `README.md`, `test_connection.sh` y `.gitignore` (`.env`, `keys/`, `out/`). Las variables
se llaman **`<HERRAMIENTA>_<NOMBRE>`**. Todo lo demás es «fuera de sitio», y el prefijo dice a qué
herramienta pertenece cada clave suelta.

## Scope

**Dentro**

- `sueltas.js` pasa de contar a **inventariar**: todos los `.env*` (raíz, carpetas de primer nivel,
  `config/credentials/secrets/env`, y dentro de cada herramienta los que no son `.env`), los nombres
  de sus claves (nunca valores), y el **reparto**: a qué herramienta va cada una —porque ya la
  espera su `.env.example`, o por el prefijo `<HERRAMIENTA>_`— y cuáles no tienen herramienta
  todavía. El encargo al asistente lleva ese plan hecho.
- `conexiones.js`: una clave que una herramienta espera y está en otro sitio —o en el entorno del
  ordenador— cuenta como **puesta fuera de su sitio**, no como que falta. Cada herramienta lo dice,
  y la prueba de conexión que falla por eso lo dice también.
- Conexiones (tools) enseña las herramientas **por montar** que el inventario deduce (Pexels,
  Drive…), con el botón que se las pide al asistente.
- Al montar el arnés con claves fuera de sitio, el primer mensaje al asistente ya lleva el plan.
- **Resolver una incidencia**, en Ayuda: el alumno elige o cuenta el problema, y el asistente recibe
  el diagnóstico de la barra —piezas, conexiones, claves, frenos— junto a esas palabras.
- El raíl `executive-lab` le dice al asistente el protocolo: dónde vive cada clave, cómo se ordena
  sin romper lo que las leía, y que nunca imprima un valor.

**Fuera**: leer ficheros fuera de la carpeta (la carpeta personal, otros proyectos); ficheros de
claves que no son `.env*` (`*.json` de cuentas de servicio, `*.pem`): se nombran como pendiente.

## Checklist

- [x] El inventario encuentra `.env.local` en raíz, en una carpeta de primer nivel y dentro de una herramienta — prueba en carpeta temporal.
- [x] El reparto asigna por `.env.example` primero y por prefijo después; los prefijos genéricos (`NEXT_PUBLIC_`, `VITE_`) se saltan — prueba.
- [x] Las claves sin herramienta salen como «por montar», agrupadas por proveedor — prueba.
- [x] El encargo nombra `01-TOOLS/<X>/.env` por clave, `_TEMPLATE` para las nuevas, y no lleva ningún valor — prueba.
- [x] Una herramienta con su clave en la raíz sale «puesta fuera de su sitio» (no «falta») y la del entorno del ordenador también — prueba.
- [x] La pantalla de Conexiones pinta las por montar y las fuera de sitio sin escribir «.env» — prueba.
- [x] Ayuda tiene «Resolver una incidencia» con opciones, y el encargo lleva el diagnóstico — prueba.
- [x] Al montar con claves sueltas, el primer mensaje lleva el plan — lectura del código.
- [x] La prueba antigua de claves sueltas sigue pasando con el inventario nuevo.
- [x] Diccionario, `humo.js`, `empresas-distintas.js` en verde.

## Evidence

Observado el 22-09-2026 sobre la rama `los-apartados-se-ordenan-y-el-mapeo-se-cierra`.

- `✓ cada clave suelta sabe a qué herramienta va — raíz, carpeta y herramienta · 4 por montar · 1
  puesta fuera de su sitio`. Con una carpeta de mentira calcada de la captura: `.env.local` en la
  raíz (Pexels, Buffer con prefijo `NEXT_PUBLIC_`, Telegram, `PORT`), `01-TOOLS/REPLICATE/.env.local`
  y `auto/.env`. El inventario encuentra los tres; el reparto da REPLICATE (existe), PEXELS, BUFFER,
  TELEGRAM y DRIVE (por montar) y deja `PORT` sin dueño; el encargo nombra
  `01-TOOLS/REPLICATE/.env, que ya existe`, `01-TOOLS/PEXELS/, que no existe` y `_TEMPLATE`, y no
  contiene ningún valor.
- REPLICATE sale con `faltan: 0` y `fueraDeSitio: 1`, y su clave dice «en su carpeta, con otro
  nombre». Una clave exportada en el entorno del proceso dice «en tu ordenador». MAGNIFIC, bien
  puesta, no se marca.
- `✓ una incidencia se resuelve con el diagnóstico de la barra delante`: el encargo lleva el síntoma,
  los hechos de la barra, «No toques nada todavía» y la prohibición de imprimir valores; Ayuda pinta
  el botón y las tres opciones.
- Dos fallos míos que pilló la suite: el raíl `executive-lab` se editó en la copia y no en
  `skills/` (la fuente), y una aserción mía daba por hecho que una clave está en un solo sitio
  cuando estaba en dos. Y una tercera que era mía y no del código: comprobar «.env» sobre el HTML
  entero, cuando los encargos viajan en `data-accion` y están escritos para el asistente.
- `node extension/prueba/humo.js` → **185 comprobaciones pasadas** (dos nuevas; la antigua de
  brownfield sigue en verde). `empresas-distintas.js` → `las tres empresas, enteras`.
  `comprobar-diccionario.js` → limpio.

## Next

Publicar la 0.25.0 (decisión de Jose). Y lo apuntado abajo: las credenciales que no son `.env`.

## Pendiente, apuntado a petición de Jose (22-09-2026)

*«apunta como pendiente para luego hacer los otros ficheros de credenciales […] cuentas de
servicio, `.json` y `.pem`»*.

El inventario de hoy cubre los `.env*`. Faltan las credenciales que **no son un fichero de
variables**, y que en un arnés de verdad aparecen igual:

- **Cuentas de servicio de Google** (`*-service-account.json`, `credentials.json`,
  `client_secret*.json`) y los `token.json` que deja su primer inicio de sesión. Son ficheros
  enteros que hay que mover, no líneas que copiar, y RSC ya les tiene sitio: `01-TOOLS/<X>/keys/`,
  que su `.gitignore` excluye.
- **Claves y certificados** (`*.pem`, `*.p8`, `*.p12`, `*.key`, `id_rsa`): igual, a `keys/`.
- **Perfiles de la nube** (`~/.aws/credentials`, `gcloud`): están fuera de la carpeta, así que solo
  se nombran — la regla de no salir del directorio de trabajo manda.

Cómo se haría, cuando toque: mismo inventario, otra lista de patrones; el reparto por **el nombre
del fichero y su contenido** (un `.json` de cuenta de servicio trae `"type":
"service_account"` y `"client_email"`, que dice el proyecto), y el destino es `01-TOOLS/<X>/keys/`
en vez de una línea en `.env`. Nunca se abre ni se imprime el contenido: basta con reconocerlo.

Riesgo de no hacerlo: un Drive conectado con cuenta de servicio sigue saliendo como «sin conectar».
