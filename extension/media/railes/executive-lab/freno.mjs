#!/usr/bin/env node
// El freno ante órdenes peligrosas de Executive Lab (C1, decisión 1 de Jose).
//
// RSC 2.0.5 solo engancha su freno cuando el plan practica la cadena SDD. Con
// «Llevar el día a día», «Crear cosas», «Estudiar un tema» o algo pequeño que
// construir, nada paraba un `rm -rf`, aunque su habilidad `init` lo prometa
// por nivel técnico.
//
// Esto no es un freno nuevo: es el suyo. `freno-rsc-2.0.5.mjs`, aquí al lado,
// es su `targets/danger-guard.mjs` copiado byte a byte (MIT, con la licencia
// al lado), con su misma lista, su mismo interruptor (`.rsc/.no-danger-guard`)
// y su misma regla de nivel técnico. Una prueba lo compara con el del paquete.
//
// Se engancha siempre y decide al ejecutarse. Si el de RSC está puesto y
// enganchado, manda el suyo y este deja pasar sin decir nada: dos frenos
// dirían lo mismo dos veces. Decidirlo al montar dependería de qué orden de
// RSC corrió la última vez (C6).
//
// La orden que lo engancha no lleva `.rsc/`: RSC quita todo enganche con esa
// aguja cuando reescribe los suyos.
//
//   argv[2] = la carpeta del proyecto   stdin = el JSON del enganche (PreToolUse)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = process.argv[2] || process.cwd();

function elDeRscEstaPuesto() {
  if (!existsSync(join(raiz, '.rsc', 'danger-guard.mjs'))) return false;
  try {
    return readFileSync(join(raiz, '.claude', 'settings.json'), 'utf8').includes('.rsc/danger-guard.');
  } catch {
    return false;
  }
}

if (elDeRscEstaPuesto()) process.exit(0);

try {
  await import('./freno-rsc-2.0.5.mjs');
} catch {
  // Como el de RSC: un fallo por dentro nunca bloquea una orden.
  process.exit(0);
}
