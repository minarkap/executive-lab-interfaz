// La barra entera, contra empresas que no se parecen en nada.
//
// ── Por qué esto además de `humo.js` ─────────────────────────────────────
//
// `humo.js` prueba módulo a módulo contra UNA empresa de mentira. Eso coge
// mucho, pero no coge lo que solo se ve de lejos: que en una carpeta recién
// montada no haya un apartado con un hueco dentro, que en un arnés de Codex no
// se enseñen cero botones sin decir por qué, que un despacho sin conexiones no
// enseñe la pantalla de una gestoría.
//
// Aquí se montan tres carpetas distintas y se pasan las dieciséis pantallas por
// cada una. Lo que se comprueba no es el contenido —eso es de `humo.js`— sino
// que **ninguna revienta y ninguna cae en la pantalla de fallo**, que es la red
// de seguridad y no un aprobado.
//
//   node prueba/empresas-distintas.js <raíz del repositorio>

const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const Module = require('node:module');

const RAIZ = process.argv[2] || path.resolve(__dirname, '..', '..');
const vscode = require(path.join(RAIZ, 'extension/prueba/vscode-falso.js'));
const original = Module._load;
Module._load = (p, ...r) => (p === 'vscode' ? vscode : original(p, ...r));

const { montarPanel } = require(path.join(RAIZ, 'extension/prueba/panel-falso.js'));
const cargar = (n) => {
  const f = path.join(RAIZ, 'extension/src', `${n}.js`);
  delete require.cache[require.resolve(f)];
  return require(f);
};

function escribir(raiz, rel, texto) {
  const f = path.join(raiz, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, texto);
}

// ---- tres empresas que no se parecen en nada -----------------------------

function gestoria() {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), 'gestoria-'));
  escribir(r, '.rsc.json', JSON.stringify({ version: 1, targets: ['claude'], skills: ['bro'], ownSkills: [], catalogVersion: '1.4.1' }, null, 2));
  escribir(r, '01-TOOLS/_TEMPLATE/.env.example', 'X=\n');
  escribir(r, '01-TOOLS/HOLDED/.env.example', 'HOLDED_API_KEY=\n');
  escribir(r, '01-TOOLS/HOLDED/README.md', '# Holded\n\n| Script | Qué hace |\n|---|---|\n| `ver_facturas.sh` | Las facturas del mes |\n');
  escribir(r, '01-TOOLS/HOLDED/ver_facturas.sh', '#!/bin/sh\necho ok\n');
  escribir(r, '02-DOCS/wiki/harness/user-profile.md', '---\ntechnical_level: non-technical\naccompaniment: L3\narnes: Contabilidad\nempresa: Gestoría Pérez\n---\n\n# User profile\n\nGoal: llevar la contabilidad de mis clientes\n');
  escribir(r, '02-DOCS/wiki/index.md', '# Knowledge Base Index\n\n## contabilidad\n\n| Artículo | Resumen |\n|---|---|\n| [Cierre de mes](contabilidad/cierre.md) | Cómo se cierra el mes |\n');
  escribir(r, '02-DOCS/wiki/contabilidad/cierre.md', '---\ntype: article\ntitle: Cierre de mes\n---\n\n# Cierre de mes\n\nSe cierra el día 5.\n');
  escribir(r, '02-DOCS/inbox/README.md', '# Inbox\n');
  escribir(r, '.claude/commands/cerrar-el-mes.md', '---\ndescription: "Cierra el mes"\nboton: "Cerrar el mes"\nicono: "📊"\n---\nCierra el mes.\n');
  return r;
}

function despacho() {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), 'despacho-'));
  escribir(r, '.rsc.json', JSON.stringify({ version: 1, targets: ['codex'], skills: [], ownSkills: [], catalogVersion: '1.4.1' }, null, 2));
  escribir(r, '01-TOOLS/_TEMPLATE/.env.example', 'X=\n');
  escribir(r, '02-DOCS/wiki/harness/user-profile.md', '---\narnes: Contratos\nempresa: Despacho Ruiz\n---\n\n# User profile\n\nGoal: revisar contratos\n');
  escribir(r, 'contrato-sin-firmar.pdf', 'un contrato');
  escribir(r, 'AGENTS.md', '# AGENTS.md\n\n## Working rules\n\n- Nada sale del despacho sin que lo lea un abogado.\n');
  escribir(r, '.codex/agents/plazos.toml', 'name = "vigilante de plazos"\n');
  return r;
}

function reciencita() {
  const r = fs.mkdtempSync(path.join(os.tmpdir(), 'recien-'));
  escribir(r, '.rsc.json', JSON.stringify({ version: 1, targets: ['claude'], skills: [], ownSkills: [], catalogVersion: '1.4.1' }, null, 2));
  escribir(r, '01-TOOLS/_TEMPLATE/.env.example', 'X=\n');
  escribir(r, '02-DOCS/wiki/harness/user-profile.md', '---\narnes: Marketing\n---\n\n# User profile\n');
  return r;
}

// ---- probar cada una -----------------------------------------------------

const TODAS = [['Gestoría Pérez', gestoria], ['Despacho Ruiz (Codex)', despacho], ['recién montada', reciencita]];
let mal = 0;

for (const [nombre, montar] of TODAS) {
  vscode.guion.raiz = montar();
  vscode.guion.extensionesInstaladas = ['anthropic.claude-code', 'openai.chatgpt'];
  const panel = montarPanel();
  const ext = path.join(RAIZ, 'extension');

  const mensajes = [];
  const anadir = (tipo, datos, espera) => mensajes.push([tipo, datos, espera]);

  anadir('papeles', { ...cargar('papeles').queHay() }, null);
  anadir('cerebro', {
    temas: cargar('cerebro').catalogo(),
    sinOrdenar: cargar('cerebro').sinOrdenar().slice(0, 8),
    esperando: cargar('cerebro').esperandoLectura(),
    yaLeidos: cargar('cerebro').yaLeidos(),
    hayPanel: cargar('cerebro').hayPanel(),
    aviso: null,
  }, null);
  anadir('huecos', { huecos: cargar('cerebro').loQueAunNoSabe(4) }, null);
  anadir('comandos', { comandos: cargar('acciones').todos() }, null);
  anadir('saberes', cargar('saberes').queSabe(ext, 'contabilidad facturas contratos'), null);
  anadir('conexiones', { proveedores: cargar('conexiones').proveedores(), sueltas: [] }, null);
  anadir('agentes', { agentes: cargar('agentes').queHay() }, null);
  anadir('proyectos', { montones: cargar('proyectos').queHay() }, null);
  anadir('reglas', cargar('reglas').queHay(), null);
  anadir('asistente', { ...cargar('asistentes').comoEstamos(), aviso: null }, null);
  anadir('comoTrabaja', { ...cargar('ajustes').comoEstamos(), aviso: null }, null);
  anadir('laCara', { ...cargar('tema').comoEstamos(), aviso: null }, null);
  anadir('salidas', { herramientas: cargar('salidas').loQueHaProducido() }, null);
  anadir('diario', { sesiones: cargar('diario').sesiones(), decisiones: cargar('diario').decisiones(), aprendido: [] }, null);
  anadir('sugerencias', { ahora: [], hayAgentes: cargar('agentes').hayAlguno(), hayProyectos: cargar('proyectos').hayAlgo() }, null);
  anadir('estado', {
    estado: {
      listo: true,
      sabe: cargar('cerebro').cuantoSabe(),
      conectados: cargar('conexiones').proveedores().length,
      comandos: cargar('acciones').todos().length,
      habilidades: cargar('rsc').habilidadesPuestas().length,
      hayAgentes: cargar('agentes').hayAlguno(),
      hayProyectos: cargar('proyectos').hayAlgo(),
      puedeTenerBotones: cargar('donde').puedeTenerBotones(),
    },
    acciones: cargar('fijadas').puestas({ get: () => undefined, update: async () => {} }, ext),
    modo: 'sencillo',
    marcaPuesta: false,
    comoSeLlama: cargar('identidad').deQuien(),
    pulso: [],
    puedeTenerBotones: cargar('donde').puedeTenerBotones(),
  }, null);

  const rotas = [];
  for (const [tipo, datos] of mensajes) {
    let pintado;
    try {
      pintado = panel.mandar({ tipo, ...datos });
    } catch (e) {
      rotas.push(`${tipo}: ${e.message}`);
      continue;
    }
    if (!pintado || pintado.length < 20) rotas.push(`${tipo}: no pinta nada`);
    else if (/no se ha podido pintar/.test(pintado)) rotas.push(`${tipo}: cae en la pantalla de fallo`);
  }

  const q = cargar;
  const resumen = [
    `${q('conexiones').proveedores().length} conexiones`,
    `${q('acciones').todos().length} comandos`,
    `${q('rsc').habilidadesPuestas().length} habilidades`,
    `${q('agentes').queHay().length} ayudantes`,
    `${q('papeles').queHay().sueltos.length} sin colocar`,
    `botones: ${q('donde').puedeTenerBotones() ? 'sí' : 'no'}`,
  ].join(' · ');

  if (rotas.length) {
    mal += rotas.length;
    console.log(`✗ ${nombre}\n    ${rotas.join('\n    ')}`);
  } else {
    console.log(`✓ ${nombre} — ${mensajes.length} pantallas · ${resumen}`);
  }
}

console.log(mal ? `\n${mal} pantallas rotas` : '\nlas tres empresas, enteras');
process.exit(mal ? 1 : 0);
