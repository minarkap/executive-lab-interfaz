#!/usr/bin/env node
// Pone los raíles de Executive Lab en el proyecto de un alumno.
//
//   node aplicar.js "~/Documentos/Mi Empresa IA"
//   node aplicar.js <carpeta> --forzar     (vuelve a poner los diales aunque ya estuvieran)
//
// RSC trata esto como una "own skill": vive en el repo del alumno, funciona
// para quien clone sin ejecutar nada, y RSC nunca la instala, actualiza ni
// sobrescribe. Se declara en .rsc.json bajo ownSkills para dejar constancia
// de que es nuestra.
//
// ── Los raíles van donde mire el asistente de esa carpeta ────────────────
//
// Esto escribía en `.claude/` pasara lo que pasara. Y el wizard deja elegir
// Codex —le pasa `--target codex` a RSC, que monta el arnés entero en
// `.codex/`— así que en esas carpetas la habilidad que fija el español y el
// vocabulario, y los cuatro comandos, se quedaban en una carpeta que Codex no
// lee jamás. Sin error y sin aviso: raíles puestos que no encarrilan nada.
//
// La tabla de dónde mira cada asistente es la misma que usa la barra
// (`sitios.js`, aquí al lado), para que no haya dos versiones de la misma verdad.

const fs = require('node:fs');
const path = require('node:path');
const sitios = require('./sitios');

const [, , destinoBruto, ...banderas] = process.argv;
const forzar = banderas.includes('--forzar');

if (!destinoBruto) {
  console.error('Dime en qué carpeta. Ejemplo:\n  node aplicar.js "~/Documentos/Mi Empresa IA"');
  process.exit(1);
}

const destino = path.resolve(destinoBruto.replace(/^~/, process.env.HOME || process.env.USERPROFILE || ''));
if (!fs.existsSync(destino)) {
  console.error(`No existe esa carpeta:\n  ${destino}`);
  process.exit(1);
}

const origen = __dirname;
const hechos = [];

function copiarCarpeta(desde, hasta) {
  fs.mkdirSync(hasta, { recursive: true });
  for (const entrada of fs.readdirSync(desde, { withFileTypes: true })) {
    const a = path.join(desde, entrada.name);
    const b = path.join(hasta, entrada.name);
    if (entrada.isDirectory()) copiarCarpeta(a, b);
    else fs.copyFileSync(a, b);
  }
}

// 0. Para qué asistente se montó esta carpeta.
//
// Un asistente que no esté en la tabla no se trata como Claude: se para. Poner
// los raíles de Claude en el arnés de otro es peor que no ponerlos, porque
// desde fuera se ve igual que si estuvieran puestos.
let declaracionLeida = null;
try {
  declaracionLeida = JSON.parse(fs.readFileSync(path.join(destino, '.rsc.json'), 'utf8'));
} catch { /* sin declaración: Claude, que es lo que monta nuestro instalador */ }

const quien = sitios.paraQuien(declaracionLeida);
const suyo = sitios.sitiosDe(quien);
if (!suyo) {
  console.error(`Esta carpeta dice estar montada para "${quien}", que no sé dónde mira.`);
  console.error('No pongo nada: unos raíles en la carpeta equivocada se ven igual que unos puestos.');
  process.exit(1);
}

const en = (...partes) => path.join(destino, ...partes);
const comoSeEscribe = (partes) => partes.join('/');

// 1. La habilidad.
const raizDeHabilidades = suyo.habilidades;
copiarCarpeta(path.join(origen, 'executive-lab'), en(...raizDeHabilidades, 'executive-lab'));
hechos.push(`${comoSeEscribe(raizDeHabilidades)}/executive-lab/`);

// 2. Los comandos.
//
// Y aquí no hay para todos: RSC solo escribe comandos para ocho asistentes, y
// Codex no es uno. No es que estén en otro sitio — con Codex no hay ninguno
// que leer, nunca. Así que se dice, en vez de dejarlos en una carpeta muerta.
// La barra ya sabe explicar ese hueco (`donde.puedeTenerBotones`).
if (suyo.comandos) {
  const comandos = en(...suyo.comandos);
  fs.mkdirSync(comandos, { recursive: true });
  const cuantos = fs.readdirSync(path.join(origen, 'comandos'));
  for (const fichero of cuantos) {
    fs.copyFileSync(path.join(origen, 'comandos', fichero), path.join(comandos, fichero));
  }
  hechos.push(`${comoSeEscribe(suyo.comandos)}/ (${cuantos.length} comandos)`);
} else {
  hechos.push(`sin comandos: ${quien} no tiene dónde guardarlos, y no me los invento`);
}

// 3. Que el asistente sepa que la habilidad está ahí.
//
// Claude encuentra las suyas solo. Los de la familia AGENTS.md —Codex el
// primero— no: leen su fichero de siempre y nada más, así que una habilidad
// que nadie nombra es una habilidad que no se carga. RSC resuelve esto igual,
// metiendo un trozo entre marcas en ese mismo fichero; aquí se hace lo mismo
// con marcas nuestras, para no pisarnos con las suyas.
//
// Solo en los ficheros compartidos. Los `rsc-suggest.*` son de RSC y los
// reescribe enteros en cada `sync`: escribir ahí sería escribir en agua.
const DESDE = '<!-- executive-lab:start -->';
const HASTA = '<!-- executive-lab:end -->';

function nombrarLaHabilidad() {
  if (!suyo.siempre) return `${quien} encuentra la habilidad solo`;
  if (!suyo.siempre.compartido) {
    return `${comoSeEscribe(suyo.siempre.fichero)} es de RSC y lo reescribe: no lo toco`;
  }

  const fichero = en(...suyo.siempre.fichero);
  const ruta = `${comoSeEscribe(raizDeHabilidades)}/executive-lab/SKILL.md`;
  const trozo = `${DESDE}\nLéete \`${ruta}\` antes de hacer nada y respeta lo que diga: es la habilidad siempre activa de esta carpeta.\n${HASTA}`;

  let texto = '';
  try {
    texto = fs.readFileSync(fichero, 'utf8');
  } catch { /* todavía no existe: se crea con el trozo */ }

  if (texto.includes(DESDE)) {
    texto = texto.replace(new RegExp(`${DESDE}[\\s\\S]*?${HASTA}`), trozo);
  } else {
    texto += `${texto && !texto.endsWith('\n') ? '\n' : ''}\n${trozo}\n`;
  }

  fs.mkdirSync(path.dirname(fichero), { recursive: true });
  fs.writeFileSync(fichero, texto);
  return `${comoSeEscribe(suyo.siempre.fichero)} (apunta a la habilidad)`;
}

hechos.push(nombrarLaHabilidad());

// 4. Callar los avisos del arnés que mandan al alumno a una terminal.
//
// El enganche de arranque de RSC (`targets/session-start.mjs`) corre en cada
// sesión y puede imprimir cinco avisos con `npx @ericrisco/rsc …` dentro. Al
// asistente se le dice, con esas palabras, que **se lo ofrezca al alumno**.
//
// Eso choca de frente con dos cosas de esta casa: la habilidad `executive-lab`
// prohíbe mandar al alumno a una terminal, y la decisión 6 quitó `npx` a
// propósito (en Windows es un `.cmd`, y tarda). Y uno de esos avisos ofrece
// `@latest`, que se saltaría la versión fijada de la que depende que toda la
// clase corra el mismo catálogo.
//
// RSC ya prevé esto: cada aviso tiene su interruptor, y él mismo escribe
// `.no-context7` cuando excluye esa integración. Aquí se hace lo mismo con los
// que no pintan nada en la carpeta de un alumno.
//
// Los que NO se tocan, a propósito:
//   · `.no-git`            — la barra quiere git; que avise si falta está bien.
//   · `.no-claudemd-check` — es higiene de verdad y no lleva ningún comando.
//   · `.no-harness`        — apagaría el onboarding entero.
//
// El aviso de versión nueva no se apaga con un fichero sino con la variable
// `RSC_NO_UPDATE_CHECK`, así que ese sigue abierto y está dicho en la auditoría.
const CALLAR = [
  ['no-audit', 'la revisión de habilidades es herramienta de quien mantiene esto, no del alumno'],
  ['no-worktree-cleanup', 'un alumno no tiene worktrees, y el aviso lleva dos comandos'],
  ['no-scope-check', 'hablar de "scopes" a quien lleva las facturas no significa nada'],
];

function callarLosAvisos() {
  const carpeta = en('.rsc');
  fs.mkdirSync(carpeta, { recursive: true });
  const puestos = [];
  for (const [nombre, porque] of CALLAR) {
    const fichero = path.join(carpeta, `.${nombre}`);
    if (fs.existsSync(fichero)) continue;
    fs.writeFileSync(fichero, `${porque}\n`);
    puestos.push(nombre);
  }
  return puestos.length ? `.rsc/ (callados: ${puestos.join(', ')})` : '.rsc/ (los avisos ya estaban callados)';
}

hechos.push(callarLosAvisos());

// 5. El perfil del arnés.
//
// Aquí NO se tocan `technical_level` ni `accompaniment`: los pregunta RSC en su
// onboarding y son la respuesta del alumno. Imponer L3 y "no técnico" a todo el
// mundo era arrogante — un arnés puede ser para quien lleva las facturas o para
// quien montó la web de la empresa hace diez años, y RSC ya se lo pregunta.
//
// Lo que sí se pone es lo que es nuestro: el idioma y la marca de los raíles.
// Si el perfil no existe todavía (raíles antes del onboarding), se deja la
// plantilla entera, que sí trae unos valores por defecto prudentes.
const NUESTRO = [['language', 'es'], ['executive_lab_rails', '1']];
const perfil = path.join(destino, '02-DOCS', 'wiki', 'harness', 'user-profile.md');

function ajustarPerfil() {
  if (!fs.existsSync(perfil)) {
    fs.mkdirSync(path.dirname(perfil), { recursive: true });
    fs.copyFileSync(path.join(origen, 'perfil-de-usuario.md'), perfil);
    return '02-DOCS/wiki/harness/user-profile.md (nuevo)';
  }

  const texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!bloque) return '02-DOCS/wiki/harness/user-profile.md (no entiendo su cabecera — no lo toco)';

  let frontmatter = bloque[1];
  if (/^executive_lab_rails:/m.test(frontmatter) && !forzar) {
    return '02-DOCS/wiki/harness/user-profile.md (ya tenía los raíles — no lo he tocado)';
  }

  for (const [clave, valor] of NUESTRO) {
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    frontmatter = linea.test(frontmatter) ? frontmatter.replace(linea, `${clave}: ${valor}`) : `${frontmatter}\n${clave}: ${valor}`;
  }
  frontmatter = frontmatter.replace(/^\n+/, '');

  fs.writeFileSync(perfil, texto.replace(bloque[0], `---\n${frontmatter}\n---\n`));

  const dial = (frontmatter.match(/^accompaniment:\s*(\S+)/m) || [])[1] || '?';
  const nivel = (frontmatter.match(/^technical_level:\s*(\S+)/m) || [])[1] || '?';
  return `02-DOCS/wiki/harness/user-profile.md (idioma es · se respetan ${nivel} y ${dial})`;
}

hechos.push(ajustarPerfil());

// 6. Dejar constancia en .rsc.json. RSC conserva ownSkills tal cual; en 1.4.1
//    `doctor` todavía no lo comprueba, pero es donde el README de RSC dice
//    que va, y es lo que evitará que un futuro `repair` lo tome por basura.
const declaracion = path.join(destino, '.rsc.json');
if (fs.existsSync(declaracion)) {
  try {
    const rsc = JSON.parse(fs.readFileSync(declaracion, 'utf8'));
    const propias = new Set(rsc.ownSkills || []);
    if (!propias.has('executive-lab')) {
      propias.add('executive-lab');
      rsc.ownSkills = [...propias];
      fs.writeFileSync(declaracion, `${JSON.stringify(rsc, null, 2)}\n`);
      hechos.push('.rsc.json (declarada en ownSkills)');
    }
  } catch {
    hechos.push('.rsc.json (no he podido leerlo — decláralo a mano en ownSkills)');
  }
} else {
  hechos.push('.rsc.json (no existe todavía — falta pasar el onboarding del arnés)');
}

console.log(`Raíles puestos en ${destino}\n`);
hechos.forEach((h) => console.log(`  · ${h}`));
console.log('\nAbre una conversación nueva para que se carguen.');
