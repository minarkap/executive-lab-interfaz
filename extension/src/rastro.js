// Lo que la barra se va apuntando por dentro.
//
// Por qué existe: cuando montar el arnés fallaba, el motivo real se escribía
// con `salida.appendLine` en el panel de salida de VS Code y ahí se quedaba. El
// alumno veía "pásale el código a tu tutor", el tutor abría el informe... y el
// informe no decía nada del fallo. Se le estaba pidiendo que dictara un código
// que no llevaba dentro la única línea que importaba.
//
// Así que el canal se envuelve: todo lo que se escribe sigue yendo al panel de
// salida igual que antes, y además se guarda aquí. El informe de "Algo va mal"
// lo lee y lo pega al final.

const fs = require('node:fs');
const path = require('node:path');

// Suficiente para cubrir un arranque entero (que es lo más largo que escribimos
// de una vez) sin que esto crezca sin fin en una sesión de horas.
const CUANTAS = 300;

function envolver(canal, carpetaDondeGuardar) {
  const lineas = [];
  const fichero = carpetaDondeGuardar ? path.join(carpetaDondeGuardar, 'rastro.txt') : null;

  // Lo de la sesión anterior también cuenta: si VS Code se recarga entre el
  // fallo y el "Algo va mal", sin esto el informe saldría vacío otra vez.
  const deAntes = [];
  if (fichero) {
    try {
      deAntes.push(...fs.readFileSync(fichero, 'utf8').split('\n').filter(Boolean).slice(-CUANTAS));
    } catch { /* la primera vez no hay */ }
  }

  function guardar() {
    if (!fichero) return;
    try {
      fs.mkdirSync(path.dirname(fichero), { recursive: true });
      fs.writeFileSync(fichero, lineas.join('\n'));
    } catch { /* si no se puede escribir, al menos queda en memoria */ }
  }

  function apuntar(texto) {
    for (const linea of String(texto).split('\n')) lineas.push(linea);
    if (lineas.length > CUANTAS) lineas.splice(0, lineas.length - CUANTAS);
  }

  return {
    appendLine(texto) {
      apuntar(`${sello()} ${texto}`);
      guardar();
      canal.appendLine(texto);
    },

    // Para el propio informe de incidencia: se enseña en el panel de salida,
    // pero no se guarda — si no, el informe siguiente vendría con el anterior
    // pegado dentro, y el de después con los dos.
    sinGuardar(texto) {
      canal.appendLine(texto);
    },

    // Lo de esta sesión y lo de la anterior, en orden.
    ultimas() {
      return [...deAntes, ...lineas].slice(-CUANTAS);
    },

    show: (...a) => canal.show(...a),
    dispose: () => canal.dispose(),
  };
}

const sello = () => new Date().toISOString().slice(11, 19);

module.exports = { envolver, CUANTAS };
