// Dónde vive la barra en GitHub, y quién publica sus versiones (decisión 140).
//
// El repositorio pasa de la cuenta de Jose a la organización Executive-Lab.
// GitHub redirige la dirección vieja, así que se puede seguir preguntando a
// `REPO`; pero lo que contesta ya trae la nueva: el paquete se baja de
// `github.com/Executive-Lab/…` y las incidencias se enlazan allí. Una barra que
// solo diera por buena una de las dos dejaría de ponerse al día sola el día del
// traslado, sin decir nada. Por eso se acepta cualquiera de `SITIOS`.
//
// Quién publica no sale de la dirección: la dueña de un repositorio de una
// organización no es una persona, y las versiones las sigue publicando
// `minarkap`. Antes salía de `REPO`, y con la dirección nueva no habría cuadrado
// ninguna.
//
// Cuando el traslado esté hecho y casi todos tengan una barra que lo sepa,
// `REPO` pasa a ser la de la organización; la vieja se queda en `SITIOS`.

const REPO = 'minarkap/executive-lab-interfaz';
const SITIOS = ['minarkap/executive-lab-interfaz', 'Executive-Lab/executive-lab-interfaz'];
const QUIEN_PUBLICA = 'minarkap';

// En GitHub, `Executive-Lab` y `executive-lab` son el mismo sitio.
const esNuestro = (sitio) => SITIOS.some((s) => s.toLowerCase() === String(sitio || '').toLowerCase());

module.exports = { REPO, SITIOS, QUIEN_PUBLICA, esNuestro };
