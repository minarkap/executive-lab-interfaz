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

const fs = require('node:fs');
const path = require('node:path');

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

// 1. La habilidad.
copiarCarpeta(path.join(origen, 'executive-lab'), path.join(destino, '.claude', 'skills', 'executive-lab'));
hechos.push('.claude/skills/executive-lab/');

// 2. Los comandos.
const comandos = path.join(destino, '.claude', 'commands');
fs.mkdirSync(comandos, { recursive: true });
for (const fichero of fs.readdirSync(path.join(origen, 'comandos'))) {
  fs.copyFileSync(path.join(origen, 'comandos', fichero), path.join(comandos, fichero));
}
hechos.push('.claude/commands/ (4 comandos)');

// 3. Los diales del perfil, que es lo que lee `orient` para calibrar la brújula.
//
// RSC escribe este fichero en el onboarding con frontmatter YAML
// (technical_level, accompaniment, project_kind) y una línea "Goal:". Si ya
// existe, se ajustan solo los diales y se respeta el resto. Y si ya lleva la
// marca de los raíles, no se toca sin --forzar: el alumno puede haber pedido
// "no me expliques tanto" y orient haberle bajado el dial a propósito.
const DIALES = [['technical_level', 'non-technical'], ['accompaniment', 'L3'], ['language', 'es'], ['executive_lab_rails', '1']];
const perfil = path.join(destino, '02-DOCS', 'wiki', 'harness', 'user-profile.md');

function ajustarPerfil() {
  if (!fs.existsSync(perfil)) {
    fs.mkdirSync(path.dirname(perfil), { recursive: true });
    fs.copyFileSync(path.join(origen, 'perfil-de-usuario.md'), perfil);
    return '02-DOCS/wiki/harness/user-profile.md (nuevo)';
  }

  const texto = fs.readFileSync(perfil, 'utf8');
  const bloque = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  let frontmatter = bloque ? bloque[1] : '';

  if (/^executive_lab_rails:/m.test(frontmatter) && !forzar) {
    return '02-DOCS/wiki/harness/user-profile.md (ya tenía los raíles — no lo he tocado)';
  }

  for (const [clave, valor] of DIALES) {
    const linea = new RegExp(`^${clave}:.*$`, 'm');
    frontmatter = linea.test(frontmatter) ? frontmatter.replace(linea, `${clave}: ${valor}`) : `${frontmatter}\n${clave}: ${valor}`;
  }
  frontmatter = frontmatter.replace(/^\n+/, '');

  const nuevo = bloque
    ? texto.replace(bloque[0], `---\n${frontmatter}\n---\n`)
    : `---\n${frontmatter}\n---\n\n${texto}`;
  fs.writeFileSync(perfil, nuevo);
  return '02-DOCS/wiki/harness/user-profile.md (diales puestos en non-technical + L3)';
}

hechos.push(ajustarPerfil());

// 4. Dejar constancia en .rsc.json. RSC conserva ownSkills tal cual; en 1.4.1
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
