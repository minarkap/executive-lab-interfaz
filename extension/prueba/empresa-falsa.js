// Monta una empresa de mentira con la forma que deja RSC: una herramienta con
// sus claves y sus scripts, una wiki con temas e historial, documentos sin
// leer y comandos con y sin botón. La usan la prueba de humo y `demo.sh`.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOY = new Date().toISOString().slice(0, 10);

// Sembrar sobre una carpeta que ya pasó por el arnés no debe pisar lo que RSC
// escribió allí: su declaración y el perfil del alumno mandan.
const escribirSiFalta = (raiz, relativa, contenido) => {
  if (!fs.existsSync(path.join(raiz, relativa))) escribir(raiz, relativa, contenido);
};

const escribir = (raiz, relativa, contenido, modo) => {
  const destino = path.join(raiz, relativa);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, contenido);
  if (modo) fs.chmodSync(destino, modo);
};

function montar(raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'empresa-falsa-'))) {
  fs.mkdirSync(raiz, { recursive: true });

  escribirSiFalta(raiz, '.rsc.json', JSON.stringify({ version: 1, catalogVersion: '1.4.1', targets: ['claude'], skills: [], ownSkills: ['executive-lab'] }, null, 2));

  // --- comandos: tres con botón, dos sin él (uno nuestro, uno de RSC) ---
  const comando = (nombre, cabecera) => escribir(raiz, `.claude/commands/${nombre}.md`, `---\n${cabecera}---\n\nInstrucciones.\n`);
  const comandoSiFalta = (nombre, cabecera) => escribirSiFalta(raiz, `.claude/commands/${nombre}.md`, `---\n${cabecera}---\n\nInstrucciones.\n`);
  comandoSiFalta('seguir', 'description: Seguir donde lo dejé\nboton: Seguir donde lo dejé\ngrupo: diario\nicono: ▸\n');
  comandoSiFalta('empezar', 'description: Empezar algo nuevo\nboton: Empezar algo nuevo\ngrupo: diario\nicono: ✳\n');
  comando('resumen-mes', 'description: Resumen del mes\nboton: Preparar el resumen del mes\ngrupo: aprendido\nicono: 📈\n');
  comandoSiFalta('guardar', 'description: Guardar una copia\n');
  comando('checkpoint', 'description: Freeze the current candidate for review.\n');

  // --- una herramienta, como la deja el protocolo de harness ---
  escribir(raiz, '01-TOOLS/_TEMPLATE/README.md', '# <TOOL_NAME>\n\n| Script | Qué hace | Ejemplo |\n|---|---|---|\n| `<verb_object>.sh` | <descripción> | `./<verb_object>.sh <args>` |\n');
  escribir(raiz, '01-TOOLS/HOLDED/.env.example', '# HOLDED\n# Generate at: https://app.holded.com/api\n\nHOLDED_API_KEY=\nHOLDED_ENV=test\n');
  escribir(raiz, '01-TOOLS/HOLDED/.env', 'HOLDED_API_KEY=abcd1234efgh5678\nHOLDED_ENV=test\n');
  escribir(raiz, '01-TOOLS/HOLDED/CREDENTIALS.md', '# Credentials — Holded\n\n## Provider dashboard\n\n- URL: https://app.holded.com/api\n');
  escribir(raiz, '01-TOOLS/HOLDED/README.md', `# Holded

Facturación de la empresa.

## Scripts

| Script | Qué hace | Ejemplo |
|--------|----------|---------|
| \`test_connection.sh\` | Comprueba que la clave vale | \`./test_connection.sh\` |
| \`listar_facturas.sh\` | Lista las facturas del mes en curso | \`./listar_facturas.sh\` |
| \`crear_factura.sh\` | Crea una factura nueva | \`./crear_factura.sh <cliente> <importe>\` |
`);
  const guion = (cuerpo) => `#!/usr/bin/env bash\nset -euo pipefail\nSCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"\n[ -f "$SCRIPT_DIR/.env" ] || { echo "ERROR: missing $SCRIPT_DIR/.env" >&2; exit 1; }\nset -a; source "$SCRIPT_DIR/.env"; set +a\n: "\${HOLDED_API_KEY:?HOLDED_API_KEY not set}"\n${cuerpo}\n`;
  escribir(raiz, '01-TOOLS/HOLDED/test_connection.sh', guion('echo "OK — credenciales válidas."'), 0o755);
  escribir(raiz, '01-TOOLS/HOLDED/listar_facturas.sh', guion('echo "F-2026-001  Ferretería Soler   1.210,00 €"\necho "F-2026-002  Talleres Ruiz        847,50 €"'), 0o755);
  escribir(raiz, '01-TOOLS/HOLDED/crear_factura.sh', guion('echo "creada"'), 0o755);

  // --- la wiki, con su índice, su historial y sus huecos ---
  escribir(raiz, '02-DOCS/wiki/index.md', `# Knowledge Base Index

## facturacion

Cómo se factura en esta empresa.

| Article | Summary | Updated | Score |
|---------|---------|---------|-------|
| [Ciclo de facturación](facturacion/ciclo.md) | De presupuesto a cobro, paso a paso | ${HOY} | 7.4 |
| [Clientes que pagan tarde](facturacion/morosos.md) | Quiénes y cuánto se retrasan | ${HOY} | 6.1 |

## clientes

Quién es quién.

| Article | Summary | Updated | Score |
|---------|---------|---------|-------|
| [Ferretería Soler](clientes/ferreteria-soler.md) | Cliente desde 2019, paga a 30 días | ${HOY} | 8.0 |
| [{Article Title}]({topic}/{file}.md) | {One-line summary} | {YYYY-MM-DD} | {N.N} |
`);
  const articulo = (titulo) => `---\ntype: article\ntitle: ${titulo}\ntopic: facturacion\nstatus: draft\nscore: 7.0\n---\n\n# ${titulo}\n\n## Overview\n\nContenido de mentira.\n`;
  escribir(raiz, '02-DOCS/wiki/facturacion/ciclo.md', articulo('Ciclo de facturación'));
  escribir(raiz, '02-DOCS/wiki/facturacion/morosos.md', articulo('Clientes que pagan tarde'));
  escribir(raiz, '02-DOCS/wiki/clientes/ferreteria-soler.md', articulo('Ferretería Soler'));
  escribir(raiz, '02-DOCS/wiki/log.md', `# Wiki Log

## [${HOY}] ingest | Ciclo de facturación

Tres fuentes leídas.

## [${HOY}] sweep | Ferretería Soler

Una fuente leída.

## [{YYYY-MM-DD}] ingest | {primary article title}
`);
  escribir(raiz, '02-DOCS/wiki/gaps.md', '# Knowledge Gaps\n\n- Cómo se calculan los recargos por demora\n- Qué condiciones tiene el contrato marco con Talleres Ruiz\n- {Topic wanted but missing}\n');
  escribirSiFalta(raiz, '02-DOCS/wiki/harness/user-profile.md', '---\ntechnical_level: non-technical\naccompaniment: L3\nlanguage: es\n---\n\n# User profile\n\nGoal: organizar mis facturas\n');

  // --- documentos: uno esperando, uno ya leído ---
  escribir(raiz, '02-DOCS/inbox/README.md', '# Inbox\n\nSuelta aquí lo que quieras.\n');
  escribir(raiz, '02-DOCS/inbox/contrato-talleres-ruiz.txt', 'Contrato marco de mentira.\n');
  escribir(raiz, '02-DOCS/inbox/_processed/2026-09-16/albaran-viejo.txt', 'Albarán de mentira.\n');
  escribir(raiz, '02-DOCS/raw/facturacion/_originals/factura.txt', 'Original de mentira.\n');

  return raiz;
}

// La marca de la empresa, como la dejaría el asistente tras mirar su web.
// Aparte de `montar` porque el caso por defecto —sin marca todavía, con la de
// Executive Lab— también hay que poder probarlo.
function montarMarca(raiz, { acento = '#0057b8', texto = '#1a1a1a', fondo = '#f7f5f2', logo = true } = {}) {
  // Sin logotipo utilizable, el récord no lo declara: es lo que debe hacer el
  // asistente cuando el de la empresa no se lee sobre su propio fondo.
  const viejo = path.join(raiz, '02-DOCS/wiki/brand/logo.svg');
  if (!logo && fs.existsSync(viejo)) fs.unlinkSync(viejo);

  escribir(raiz, '02-DOCS/wiki/brand/marca.md', `---
type: concept
title: Marca de Ferretería Soler
description: Los colores y el logotipo de la empresa, tomados de su web.
resource: https://ferreteriasoler.es
tags: [brand, marca]
fondo: "${fondo}"
texto: "${texto}"
acento: "${acento}"
${logo ? 'logo: logo.svg' : ''}
---

# Marca de Ferretería Soler

Tomada de su web el ${HOY}.
`);
  if (logo) {
    escribir(raiz, '02-DOCS/wiki/brand/logo.svg',
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" width="200" height="40">\n  <text x="0" y="28" font-family="serif" font-size="26" fill="${texto}">Ferretería <tspan fill="${acento}">Soler</tspan></text>\n</svg>\n`);
  }
  return path.join(raiz, '02-DOCS/wiki/brand');
}

module.exports = { montar, montarMarca };

if (require.main === module) {
  const destino = process.argv[2];
  console.log(montar(destino ? path.resolve(destino) : undefined));
}
