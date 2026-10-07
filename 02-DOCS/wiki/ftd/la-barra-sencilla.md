---
type: ftd
title: La barra sencilla
date: 2026-10-07
status: hecho
---

# La barra sencilla

## Intent

Jose, 05-10-2026: *«Tenemos que simplificar la interfaz»*; y 07-10-2026: *«Si, dale! Pero como quedamos: no
quiero que borres nada, solo apagamos funcionalidades»*. Fases F0, F1 y F2 de
[simplificar-la-barra](../sdd/proposals/simplificar-la-barra.md). Decisión 138.

## Scope

**Dentro**
- F0: la tabla de piezas (`extension/media/piezas.json`) y el ajuste `executiveLab.barraCompleta`.
- F1: una sola tarjeta, la que toca, por orden.
- F2: la principal nueva: tarjeta, Documentos, Acciones (solo lo que hay), Ayuda, la línea de las copias
  (solo si las hay) y el pie con la versión y «Cambiar de proyecto».
- El fallo de los dos «Recargar ahora» tras actualizar.

**Fuera**
- F3 en adelante: Ayuda con sus cinco (Conversación nueva, Pedir ayuda en el foro, que necesita la
  dirección del foro), Conexiones paso a paso, Sugerencias con copias, GitHub y la cara de la empresa.
- Borrar nada: la pantalla de antes sigue entera detrás del ajuste.

## Checklist

- [x] 1. Tabla de piezas y ajuste `barraCompleta` — la prueba enciende `conocimiento` y `tarjetaUnica` en
  la tabla y ve el cambio; con el ajuste, sale la completa entera.
- [x] 2. Una tarjeta, la que toca — con consejo, aviso y versión nueva a la vez sale una; sin git, la de git.
- [x] 3. La principal sencilla — sale lo que hay y no lo que no; la línea de las copias con y sin cambios.
- [x] 4. Un solo «Recargar ahora» — probado con el aviso de verdad que manda la extensión.
- [x] 5. Mutaciones a mano — 5, las 5 tumbadas (tarjeta única ignorada, siempre la completa, Subir a
  GitHub siempre, Comandos siempre, el aviso repetido).
- [x] 6. Todas las baterías — `humo.js` 356, `contrato.js` 14, `empresas-distintas.js`, diccionario, y el
  VS Code de verdad («todo bien»).
- [x] 7. Revisión adversaria — corrección: sin fallos graves; uno leve («Recargar ahora» se escondía con
  otra tarjeta delante), arreglado. Pruebas: 66 mutantes, sobrevivían los del lado de la extensión, los
  botones cableados a otro sitio y el orden; la prueba ahora llama a `lasCopias`, `habilidadesSuyas`,
  `lasPiezas` y `versionDeLaBarra`, mira a dónde lleva cada botón y fija la tabla y el ajuste de fábrica.
  Repetidos los 17 que sobrevivían: los 17 tumbados.
- [ ] 8. Las máquinas de GitHub.

## Evidence

- `humo.js`: «la principal sencilla: una tarjeta, solo lo que hay, y lo demás apagado sin borrar».
- `prueba/en-vscode`: «todo bien», con la sencilla puesta de fábrica.

## Next

- F3: Ayuda con sus cinco. Falta la dirección del foro.
- F8: publicar la versión con un «Qué trae» que cuente el cambio y diga cómo volver a la de antes.
