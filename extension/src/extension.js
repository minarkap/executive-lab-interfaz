// La barra lateral Executive Lab.
//
// Una sola vista. Nada de lo que enseña está predefinido: sale de lo que el
// arnés tenga montado en esta carpeta — las herramientas de `01-TOOLS/`, los
// comandos de `.claude/commands/`, la wiki de `02-DOCS/`. Una gestoría y una
// empresa de contratos ven cosas distintas porque tienen cosas distintas.
//
// Todo lo que se enseña está en docs/diccionario.md; si hace falta una palabra
// que no esté, se añade allí primero.

const vscode = require('vscode');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const proyecto = require('./proyecto');
const brujula = require('./brujula');
const identidad = require('./identidad');
const puente = require('./puente');
const acciones = require('./acciones');
const conexiones = require('./conexiones');
const sueltas = require('./sueltas');
// Los encargos con su diagnóstico: «Resolver una incidencia» los usaba sin traerlos, y reventaba siempre (G1).
const encargos = require('./encargos');
const cerebro = require('./cerebro');
const buscador = require('./buscar');
const consejos = require('./consejos');
const copias = require('./guardar');
const soporte = require('./soporte');
// Lo que falla, lo que no se entiende y lo que se echa en falta, para Jose (decisión 131).
const avisos = require('./avisos');
const rsc = require('./rsc');
const disfraz = require('./disfraz');
const arrancar = require('./arrancar');
const git = require('./git');
const github = require('./github');
const terreno = require('./terreno');
const saberes = require('./saberes');
const salidas = require('./salidas');
const version = require('./version');
const diario = require('./diario');
const papeles = require('./papeles');
const reglas = require('./reglas');
const ajustes = require('./ajustes');
const donde = require('./donde');
const nombres = require('./nombres');
const pulso = require('./pulso');
const fijadas = require('./fijadas');
const tema = require('./tema');
const proyectos = require('./proyectos');
const agentes = require('./agentes');
const asistentes = require('./asistentes');
const trato = require('./trato');
const lecciones = require('./lecciones');
const marca = require('./marca');
const web = require('./web');
const rastro = require('./rastro');
const entorno = require('./entorno');
const relevo = require('./relevo');

// Lo que la barra recuerda de esta carpeta, y que nadie más ve: las últimas
// peticiones (para detectar la que se repite) y los consejos que el alumno
// apartó con "ahora no".
// Qué se le dice a esa persona cuando el arranque NO ha montado nada nuevo.
// Cada rama hizo una cosa distinta y decir «ya está listo» en las cuatro sería
// no decir nada.
const LO_QUE_SE_HIZO = {
  traer: 'Ya tienes aquí lo que este proyecto traía puesto.',
  completar: 'He terminado de prepararlo. Ya está entero.',
  sinRecibo: 'Lo he puesto al día con lo que este proyecto declaraba.',
  adoptar: 'Le he puesto lo que le faltaba de la barra.',
  ponerAlDia: 'Lo he puesto al día con la versión que trae la barra.',
};

const CLAVE_PETICIONES = 'executiveLab.peticiones';
const CLAVE_SILENCIADOS = 'executiveLab.consejosApartados';
// La última versión de la barra que se abrió aquí, para saber si hay que decir
// qué trae la de ahora; y cuándo se miró en GitHub lo que pasó con los avisos
// mandados de esta carpeta (decisión 134).
const CLAVE_VERSION_VISTA = 'executiveLab.versionVista';
const CLAVE_ARREGLADOS_MIRADOS = 'executiveLab.arregladosMirados';
const UN_DIA = 24 * 60 * 60 * 1000;
// Una versión nueva apartada con «Ahora no» vuelve a salir a los tres días: no
// es urgente, pero quedarse atrás tampoco es gratis (decisión 132).
const VERSION_APARTADA_DURANTE = 3 * 24 * 60 * 60 * 1000;

class Panel {
  constructor(contexto, salida) {
    this.contexto = contexto;
    this.salida = salida;
    this.vista = null;
    // En qué pantalla está el alumno. Cuando el arnés cambia algo por detrás
    // se repinta la que tiene delante, no se le devuelve a la principal: que
    // te saquen de donde estabas mientras rellenas una clave es peor que no
    // enterarte del cambio.
    this.donde = { tipo: 'principal' };
  }

  resolveWebviewView(vista) {
    this.vista = vista;
    this.ponerleElNombre();
    this.pintarPagina();
    vista.webview.onDidReceiveMessage((m) => this.manejar(m));

    // Al volver a mirar la barra lateral, la brújula se pone al día sola.
    vista.onDidChangeVisibility(() => { if (vista.visible) this.refrescar(); });
  }

  // La página entera. Se rehace solo cuando cambia la marca de la empresa,
  // porque eso cambia los colores y el logotipo; lo demás va por mensajes.
  pintarPagina() {
    if (!this.vista) return;
    const medios = vscode.Uri.joinPath(this.contexto.extensionUri, 'media');
    const suya = marca.leer();

    // Al logotipo de la empresa se le da acceso de lectura a su carpeta, y a
    // esa sola: no hace falta abrirle el resto del trabajo del alumno.
    const raices = [medios];
    if (suya && suya.carpeta) raices.push(vscode.Uri.file(suya.carpeta));

    this.vista.webview.options = { enableScripts: true, localResourceRoots: raices };
    this.vista.webview.html = this.html(this.vista.webview, medios, suya);
  }

  // ── Nuestro logotipo, teñido ─────────────────────────────────────────
  //
  // Va escrito en negro. Sobre un tema oscuro del editor eso es un logotipo
  // negro sobre fondo negro: no se ve. Como imagen no hay forma de arreglarlo
  // —una `<img>` no se puede repintar desde la hoja de estilo— así que se mete
  // el dibujo dentro de la página y sus dos colores pasan a ser los de la
  // barra: el nombre toma el color del texto y el asterisco el del acento.
  //
  // Solo el nuestro. El logotipo de una empresa es suyo y se pinta como ella lo
  // hizo; teñirlo sería cambiarle la marca.
  nuestroLogo(medios) {
    try {
      const dibujo = fs.readFileSync(path.join(medios.fsPath, 'logo.svg'), 'utf8');
      // El fichero puede venir en su versión negra o en la blanca, y con los
      // colores escritos en hexadecimal o en `rgb()`. Se aceptan las cuatro
      // formas: así da igual cuál de los dos ficheros esté puesto.
      return `<div class="marca marca--nuestra" role="img" aria-label="Executive Lab">${dibujo
        .replace(/fill="(#0a0a0a|#fefefe|rgb\(\s*10\s*,\s*10\s*,\s*10\s*\)|rgb\(\s*254\s*,\s*254\s*,\s*254\s*\))"/gi, 'fill="currentColor"')
        .replace(/fill="(#EC4429|rgb\(\s*231\s*,\s*60\s*,\s*35\s*\))"/gi, 'fill="var(--acento)"')}</div>`;
    } catch {
      // Si no se puede leer, la imagen de siempre: mejor un logotipo que no se
      // ve en oscuro que una cabecera vacía.
      const uri = (f) => this.vista.webview.asWebviewUri(vscode.Uri.joinPath(medios, f));
      return `<img class="marca" src="${uri('logo.svg')}" alt="Executive Lab">`;
    }
  }

  html(webview, medios, suya) {
    const nonce = crypto.randomBytes(16).toString('base64');
    const uri = (fichero) => webview.asWebviewUri(vscode.Uri.joinPath(medios, fichero));
    // Las fuentes y el logotipo viajan dentro de la extensión: la interfaz no
    // pide nada a la red, así que funciona igual sin conexión o con el IT de
    // la empresa bloqueando dominios.
    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource}`,
      `font-src ${webview.cspSource}`,
      `img-src ${webview.cspSource}`,
      `script-src 'nonce-${nonce}'`,
    ].join('; ');

    // Si el alumno ha contado cuál es la web de su empresa, manda su marca.
    // Sin logotipo utilizable, su nombre escrito: siempre se lee, y en muchas
    // pymes es lo único que hay.
    const escapar = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    // Una plaquita detrás del logotipo cuando no se vea sobre su propio fondo.
    // No se tiñe: el logotipo de una empresa es suyo. El color va en el estilo
    // de la página, junto al resto de la marca.
    const placa = suya && suya.placa ? ' con-placa' : '';

    let cabecera;
    if (suya && suya.logo && suya.logoSinNombre) {
      // El logotipo es solo el símbolo: una ene de puntos preciosa que no dice
      // de quién es esto. El nombre va al lado, como en su propia web.
      cabecera = `<div class="marca-fila">
  <img class="marca marca--simbolo${placa}" src="${webview.asWebviewUri(vscode.Uri.file(suya.logo))}" alt="">
  <p class="marca--nombre">${escapar(suya.nombre)}</p>
</div>`;
    } else if (suya && suya.logo) {
      cabecera = `<img class="marca${placa}" src="${webview.asWebviewUri(vscode.Uri.file(suya.logo))}" alt="${escapar(suya.nombre || 'Tu empresa')}">`;
    } else if (suya && suya.nombre) {
      cabecera = `<p class="marca marca--nombre">${escapar(suya.nombre)}</p>`;
    } else {
      cabecera = this.nuestroLogo(medios);
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<link rel="stylesheet" href="${uri('panel.css')}">
${marca.estilo(suya)}
</head>
<body>
${cabecera}
<div id="app" aria-live="polite"></div>
<script nonce="${nonce}" src="${uri('panel.js')}"></script>
</body>
</html>`;
  }

  // El rótulo de la barra, con el nombre que puso el alumno.
  //
  // El del contenedor ("Mi Empresa") es estático y VS Code no deja cambiarlo,
  // pero el de la vista sí. Y hacía falta: llamarle "empresa" al departamento
  // de marketing de alguien es justo lo que la decisión 16 dice que no se
  // haga —"puede ser un arnés para llevar contabilidad, o solo rrhh"— y
  // llevaba desde entonces sin aplicarse aquí.
  ponerleElNombre() {
    if (!this.vista) return;
    const { arnes, empresa } = identidad.leer();
    this.vista.title = arnes || 'Tu trabajo';
    // El segundo nombre va de subtítulo, en gris y a la derecha.
    this.vista.description = arnes && empresa ? empresa : undefined;
  }

  enviar(mensaje) {
    if (this.vista) this.vista.webview.postMessage(mensaje);
  }

  // Repinta lo que el alumno tenga delante. Lo llama el vigía del arnés.
  async repintarLoQueHaya() {
    const d = this.donde;
    if (d.tipo === 'conexiones') return this.verConexiones();
    if (d.tipo === 'conexion') return this.verConexion(d.proveedor);
    if (d.tipo === 'cerebro') return this.verCerebro();
    if (d.tipo === 'tema') return this.verTema(d.tema);
    // En una pantalla de lectura o de resultado no se toca nada: está leyendo.
    if (d.tipo === 'quieto') return undefined;
    return this.refrescar(true);
  }

  async refrescar(fresco = false) {
    this.donde = { tipo: 'principal' };
    this.ponerleElNombre();
    this.enviar({ tipo: 'cargando' });
    const suya = marca.leer();
    this.enviar({
      tipo: 'estado',
      estado: await brujula.estado({ fresco }),
      // Lo más alto de la barra: hasta cinco cosas que elige quien la usa, de
      // entre sus botones, sus consultas y sus habilidades. Sin elegir nada,
      // los botones que el asistente ha creado.
      acciones: fijadas.puestas(this.almacen(), this.contexto.extensionPath),
      // Cuatro datos de hoy en una línea, en vez de la tarjeta que contaba
      // dónde estabas: eso ya lo hace `orient` en la conversación, y mejor.
      pulso: await pulso.deHoy(),
      // Si el asistente de esta carpeta llega a tener botones. Codex no: RSC no
      // le escribe comandos a ninguno de su familia. Sin esto, la barra
      // enseñaba un hueco y nadie sabía si era que no había o que no iban.
      puedeTenerBotones: donde.puedeTenerBotones(),
      // Cuántos hay de cada cosa, para que el rótulo de su fila lo diga.
      comandos: acciones.todos().length,
      // Las que hay en disco, como en Habilidades (G4).
      habilidades: rsc.habilidadesEnDisco().length,
      // El apartado de SDD sale solo si esa carpeta construye algo.
      hayProyectos: proyectos.hayAlgo(),
      // Los ayudantes tampoco salen hasta que hay uno.
      hayAgentes: agentes.hayAlguno(),
      modo: disfraz.modoDeEstaVentana(),
      // Si la empresa aún no tiene cara puesta, el panel la ofrece en vez de
      // esperar a que el alumno caiga en contarlo.
      marcaPuesta: Boolean(suya && suya.tokens),
      // Cómo llama el alumno a esto: sale en "lo que sabe de…".
      comoSeLlama: identidad.deQuien(),
      // Como mucho uno, y siempre con un botón que lo resuelve ahí mismo.
      consejo: await this.elConsejoQueToca(),
      // Un aviso para Executive Lab que espera a que la persona diga si se
      // manda: lo ha preparado su asistente, la barra al fallar, o ella misma
      // sin poder mandarlo. Como mucho uno; los demás, en Ayuda.
      avisoParaExecutiveLab: this.elAvisoQueToca(),
      // Y lo que pasó con uno que ya mandó: arreglado, o leído (decisión 134).
      arreglado: this.elArregladoQueToca(),
      // Lo nuevo de la versión que acaba de poner. Antes de mirar si hay otra:
      // mirar deja escrito en el almacén que esta barra ya se usaba.
      queTrae: await this.queTraeLaDeAhora(),
      // Con la sesión de GitHub del editor basta; si no la hay, el botón no
      // desaparece — lleva a la guía, que es lo que hace falta cuando no sabes
      // qué es una cuenta de esas.
      puedeSubir: await copias.puedeSubir(),
      // La barra no está en la tienda del editor, y nadie se enteraría de que
      // hay algo mejor. Se mira una vez al día, y se pone solo si la persona
      // pulsa «Actualizar ahora» (decisión 132).
      ...(await this.laVersionQueToca()),
    });
    // Sin esperar: si hay algo que decir, repinta ella sola.
    this.mirarLosArregladosSiToca().catch((error) => this.salida.appendLine(`[avisos] ${error.stack || error.message}`)); // diccionario: interno
  }

  // ------------------------------------------------------- la versión

  // La nueva, si la hay y no se apartó con «Ahora no» hace poco; y si ya se
  // puso y falta recargar, eso, que si no el aviso seguiría diciendo que hay una
  // nueva cuando ya está bajada.
  async laVersionQueToca() {
    const laNueva = await version.laNuevaSiHay(this.contexto, this.versionDeLaBarra());
    const nueva = laNueva && laNueva.version;
    const apartada = (this.almacen().get(CLAVE_SILENCIADOS) || {})[`version:${nueva}`];
    const hacePoco = apartada && Date.now() - apartada < VERSION_APARTADA_DURANTE;
    return {
      hayVersionNueva: nueva && (!hacePoco || this.versionPuesta === nueva) ? nueva : null,
      // Una de prueba, para quien se ofreció a probarlas antes (decisión 134).
      versionDePrueba: Boolean(laNueva && laNueva.deprueba),
      versionPuesta: this.versionPuesta || null,
    };
  }

  // ── Lo que trae la que acaba de poner ─────────────────────────────────
  //
  // Una vez, al abrir una versión más nueva que la última que vio (decisión
  // 134). La primera vez que se abre la barra no hay nada con qué comparar: si
  // ya se usaba antes —una de antes de esto dejó apuntado cuándo miró si había
  // versión nueva—, viene de una más vieja y se le enseña; si no, es una
  // instalación nueva y se calla.
  async queTraeLaDeAhora() {
    try {
      const actual = this.versionDeLaBarra();
      if (!actual) return null;
      const almacen = this.contexto.globalState;
      let vista = almacen.get(CLAVE_VERSION_VISTA);
      if (!vista) {
        vista = almacen.get(version.CLAVE) ? '0.0.0' : actual;
        await almacen.update(CLAVE_VERSION_VISTA, vista);
      }
      if (!version.esMasNueva(actual, vista)) return null;
      return { version: actual, cosas: await version.queTrae(this.contexto, actual) };
    } catch (error) {
      this.salida.appendLine(`[version] qué trae: ${error.stack || error.message}`); // diccionario: interno
      return null;
    }
  }

  async yaLoHeVisto() {
    await this.contexto.globalState.update(CLAVE_VERSION_VISTA, this.versionDeLaBarra());
    return this.refrescar(true);
  }

  // Quien quiera, recibe también las de prueba. Lo recordado del otro canal no
  // vale: se vuelve a mirar al pintar.
  async probarAntes(si) {
    await vscode.workspace.getConfiguration().update(version.AJUSTE_PROBAR_ANTES, si === true, vscode.ConfigurationTarget.Global);
    await this.contexto.globalState.update(version.CLAVE, undefined);
    return this.verAyuda();
  }

  // Solo desde el botón: bajarla, comprobarla e instalarla es de `version.js`.
  async ponerLaNueva() {
    // Un doble clic serían dos descargas escribiendo en el mismo fichero.
    if (this.poniendoLaNueva) return undefined;
    this.poniendoLaNueva = true;
    try {
      return await this.ponerLaNuevaYa();
    } finally {
      this.poniendoLaNueva = false;
    }
  }

  async ponerLaNuevaYa() {
    this.enviar({ tipo: 'esperando', que: 'Bajando la versión nueva…' });
    const hecho = await version.ponerLaNueva(this.contexto, this.versionDeLaBarra());
    this.salida.appendLine(`[version] ${hecho.ok ? `puesta la ${hecho.version}` : `no se ha puesto${hecho.version ? ` la ${hecho.version}` : ''}: ${hecho.motivo}${hecho.detalle ? ` (${hecho.detalle})` : ''}`}`); // diccionario: interno
    if (hecho.ok) {
      this.versionPuesta = hecho.version;
      await this.refrescar(true);
      return this.enviar({
        tipo: 'aviso',
        texto: `Ya está puesta la ${hecho.version}. Recarga la ventana para empezar a usarla: no se pierde nada.`,
        boton: { etiqueta: 'Recargar ahora', accion: { tipo: 'recargar' } },
      });
    }
    await this.refrescar(true);
    if (hecho.motivo === 'yaEstaAlDia') return this.enviar({ tipo: 'aviso', texto: 'Ya tienes la última.' });
    // De repuesto, la página: es lo que había antes, y con un fallo de aquí
    // sigue sirviendo a quien le ayude.
    return this.enviar({
      tipo: 'aviso',
      texto: 'No he podido ponerla. Pulsa «Algo va mal» y pásale el código a tu tutor.',
      malo: true,
      boton: { etiqueta: 'Abrir su página', accion: { tipo: 'bajarLaNueva' } },
    });
  }

  // ------------------------------------------------------- los consejos

  // El almacén de esta carpeta: lo que se ha ido pidiendo y lo que el alumno
  // apartó con "ahora no". No se ve, no se versiona y no sale de aquí.
  almacen() {
    return this.contexto.workspaceState || this.contexto.globalState;
  }

  // Lo que el alumno ya tiene escrito, todo junto: de ahí se saca qué le
  // vendría bien. No se manda a ninguna parte; se lee aquí y se tira.
  corpus() {
    return [
      identidad.objetivo(),
      identidad.deQuien(),
      cerebro.catalogo().map((t) => `${t.etiqueta} ${t.descripcion || ''} ${t.articulos.map((a) => `${a.titulo} ${a.resumen}`).join(' ')}`).join(' '),
      acciones.acciones().map((a) => a.etiqueta).join(' '),
      conexiones.proveedores().map((p) => p.etiqueta).join(' '),
      cerebro.loQueAunNoSabe(5).join(' '),
    ].join(' ');
  }

  // Lo que la barra puede ver por sí misma leyendo el disco. Lo usan dos: el
  // consejo suelto de la pantalla principal —como mucho uno— y la pantalla de
  // sugerencias, que los enseña todos. Antes esto vivía dentro del primero, así
  // que el segundo no habría podido existir sin copiarlo.
  async queVeoYo() {
    const [ultima] = await copias.copias(1);
    return {
      esperando: cerebro.esperandoLectura(),
      esperandoDesdeHace: cerebro.esperandoDesdeHace(),
      conexionesAMedias: conexiones.proveedores().filter((p) => p.faltan > 0),
      diasSinCopia: ultima ? Math.floor((Date.now() - new Date(ultima.cuando).getTime()) / 86400000) : null,
      cambiosSinGuardar: await copias.cambiosSinGuardar(),
      peticiones: this.almacen().get(CLAVE_PETICIONES) || [],
      corpus: this.corpus(),
      yaInstaladas: rsc.habilidadesPuestas(),
      catalogo: consejos.capacidades(this.contexto.extensionPath),
      // Uno basta para el consejo suelto; la pantalla de sugerencias los
      // enseña todos, así que aquí se piden unos cuantos.
      huecos: cerebro.loQueAunNoSabe(4),
      silenciados: this.almacen().get(CLAVE_SILENCIADOS) || {},
      // Lo que el asistente apuntó tras trabajar y nadie leía (decisión 102).
      huecosDeAutomatizacion: consejos.huecosDeAutomatizacion(),
    };
  }

  async elConsejoQueToca() {
    try {
      if (!proyecto.arnesCompleto()) return null;
      return consejos.elQueToca(await this.queVeoYo());
    } catch (error) {
      // Un consejo es un extra: si falla, la barra sigue funcionando igual.
      this.salida.appendLine(`[consejos] ${error.stack || error.message}`);
      return null;
    }
  }

  async ahoraNo(id) {
    const silenciados = { ...(this.almacen().get(CLAVE_SILENCIADOS) || {}), [id]: Date.now() };
    await this.almacen().update(CLAVE_SILENCIADOS, silenciados);
    return this.refrescar(true);
  }

  // Añadir una habilidad del catálogo (`rsc add`), sin que el alumno vea nada
  // de esto. Se nombra por su nombre —«Facturación»— y se le dice cómo se
  // invoca, que con Claude es escribir `/su-identificador`.
  async aprenderCapacidad(id, nombre) {
    this.enviar({ tipo: 'esperando', que: `Añadiendo ${nombre}…` });
    const { ok, masNueva } = await rsc.anadir(id);
    await this.refrescar(true);
    if (masNueva) {
      return this.enviar({
        tipo: 'aviso',
        texto: 'Esta carpeta se montó con una versión del arnés más nueva que la de tu clase. Antes de añadir nada, pulsa «Ponerla como la de la clase» en Qué falta por montar.',
      });
    }
    this.enviar({
      tipo: 'aviso',
      texto: ok
        ? `${nombre} ya está puesta. Se pide con ${saberes.comoSePide(id)}.`
        : 'No he podido añadirla. Pulsa «Algo va mal» y pásale el código a tu tutor.',
      malo: !ok,
    });
  }

  async manejar(mensaje) {
    const rutas = {
      listo: () => this.refrescar(),
      refrescar: () => this.refrescar(true),
      volver: () => this.refrescar(),
      pedir: () => this.pedir(mensaje.prompt),
      abrir: () => vscode.env.openExternal(vscode.Uri.parse(mensaje.url)),
      bajarLaNueva: () => vscode.env.openExternal(version.dondeBajarla()),
      verLaRelease: () => vscode.env.openExternal(version.dondeVerla(this.versionDeLaBarra())),
      yaLoHeVisto: () => this.yaLoHeVisto(),
      probarAntes: () => this.probarAntes(mensaje.cual),
      yaLoSe: () => this.yaLoSe(mensaje.fichero),
      ponerLaNueva: () => this.ponerLaNueva(),
      recargar: () => vscode.commands.executeCommand('workbench.action.reloadWindow'),

      verConexiones: () => this.verConexiones(),
      verConexion: () => this.verConexion(mensaje.proveedor),
      guardarClave: () => this.guardarClave(mensaje.proveedor, mensaje.clave, mensaje.valor),
      probar: () => this.probar(mensaje.proveedor),
      hacerCosita: () => this.hacerCosita(mensaje.proveedor, mensaje.fichero, mensaje.etiqueta, mensaje.pideDatos),

      buscar: () => this.buscar(mensaje.texto, mensaje.donde),
      verCerebro: () => this.verCerebro(),
      verTema: () => this.verTema(mensaje.tema),
      leerArticulo: () => this.leerArticulo(mensaje.ruta, mensaje.tema, mensaje.desde),
      abrirFuera: () => this.abrirFuera(mensaje.ruta),
      cambiarArticulo: () => this.pedir(`Quiero cambiar lo que sabes sobre "${mensaje.titulo}". Ábrelo, enséñame qué dice y pregúntame qué hay que corregir.`),
      anadirDocumentos: () => this.anadirDocumentos(),
      soltarDocumentos: () => this.soltarDocumentos(mensaje.ficheros, mensaje.para),
      abrirPanelCompleto: () => cerebro.abrirPanel(),

      verCopias: () => this.verCopias(),
      guardarCopia: () => this.guardarCopia(),
      subirCopia: () => this.subirCopia(),
      volverA: () => this.volverA(mensaje.id),

      algoVaMal: () => this.algoVaMal(),
      verContar: () => this.verContar(),
      contar: () => this.contar(mensaje.cual),
      contarLaIncidencia: () => this.contarLaIncidencia(),
      verElAviso: () => this.verElAviso(mensaje.fichero),
      mandarElAviso: () => this.mandarElAviso(mensaje.texto, mensaje.titulo),
      noMandarElAviso: () => this.noMandarElAviso(),
      resolverIncidencia: () => this.resolverIncidencia(mensaje.cual),
      verElInforme: () => this.verElInforme(mensaje.fichero),
      arreglar: () => this.arreglar(),
      arrancar: () => this.arrancar(),
      instalarGit: () => this.instalarGit(),
      ponerCopias: () => this.ponerCopias(),
      arreglarElRelevo: () => this.arreglarElRelevo(),
      ponerElFreno: () => this.ponerElFreno(),
      ponerElBloque: () => this.ponerElBloque(),
      ponerComoLaDeLaClase: () => this.ponerComoLaDeLaClase(),
      conectarGitHub: () => this.conectarGitHub(),
      verCopiaFuera: () => this.verCopiaFuera(),
      verRadiografia: () => this.verRadiografia(),
      guardarLaRevision: () => this.guardarLaRevision(),
      verSaberes: () => this.verSaberes(),
      verSalidas: () => this.verSalidas(),
      verHuecos: () => this.verHuecos(),
      verPapeles: () => this.verPapeles(),
      abrirPapel: () => this.abrirPapel(mensaje.ruta),
      quitarPapel: () => this.quitarPapel(mensaje.ruta, mensaje.nombre),
      verAyuda: () => this.verAyuda(),
      verReglas: () => this.verReglas(),
      abrirReglas: () => this.abrirReglas(mensaje.cual),
      abrirRevision: () => this.abrirRevision(mensaje.fichero),
      ponerLosRailesAlDia: () => this.ponerLosRailesAlDia(),
      verAsistente: () => this.verAsistente(),
      verComoTrabaja: () => this.verComoTrabaja(),
      verFijadas: () => this.verFijadas(),
      verLaCara: () => this.verLaCara(),
      verProyectos: () => this.verProyectos(),
      verSugerencias: () => this.verSugerencias(),
      verComandos: () => this.verComandos(),
      verAgentes: () => this.verAgentes(),
      verAgente: () => this.verAgente(mensaje.fichero),
      verProyecto: () => this.verProyecto(mensaje.fichero),
      materialDeMarca: () => this.materialDeMarca(),
      quitarLaCara: () => this.quitarLaCara(),
      fijar: () => this.cambiarFijada(fijadas.fijar, mensaje.cual),
      soltar: () => this.cambiarFijada(fijadas.soltar, mensaje.cual),
      ponerPermiso: () => this.cambiarAjuste(ajustes.ponerPermiso, mensaje.cual),
      ponerCadaCuanto: () => this.cambiarAjuste(ajustes.ponerCadaCuanto, mensaje.cual),
      elegirAsistente: () => this.elegirAsistente(mensaje.cual),
      verDiario: () => this.verDiario(),
      verSesion: () => this.verSesion(mensaje.fichero),
      verTrato: () => this.verTrato(),
      ponerTrato: () => this.ponerTrato(mensaje.cual),
      ponerPalabras: () => this.ponerPalabras(mensaje.cual),
      abrirSalida: () => this.abrirSalida(mensaje.herramienta, mensaje.fichero),
      guardarSalida: () => this.guardarSalida(mensaje.herramienta, mensaje.fichero),
      abrirCarpetaDeSalida: () => salidas.abrirLaCarpeta(mensaje.herramienta),
      ponerLaCara: () => this.ponerLaCara(),
      elegirCarpeta: () => this.elegirCarpeta(),
      // La salida de una carpeta que no se prepara: una nueva, dentro de la
      // personal (B1).
      crearCarpeta: () => arrancar.crearUnaCarpetaDentro(os.homedir(), this.salida),
      abrirAsistente: () => puente.abrirConversacion(),
      ahoraNo: () => this.ahoraNo(mensaje.id),
      aprenderCapacidad: () => this.aprenderCapacidad(mensaje.capacidad, mensaje.nombre),
      verEditorCompleto: () => this.verEditorCompleto(),
      modoSencillo: () => this.modoSencillo(),
    };

    const accion = rutas[mensaje.tipo];
    if (!accion) return;

    try {
      await accion();
    } catch (error) {
      // Nada de excepciones en crudo: el alumno ve una frase y una salida.
      this.salida.appendLine(`[${mensaje.tipo}] ${error.stack || error.message}`);
      // Esto es un fallo de la barra, no del alumno, y a Jose no le llegaba
      // nunca. Se deja apuntado para Executive Lab; sale solo si la persona
      // lo ve y dice que sí (decisión 131).
      avisos.apuntarUnFallo({ accion: mensaje.tipo, error, lineas: this.salida.ultimas ? this.salida.ultimas() : [] });
      this.enviar({ tipo: 'aviso', texto: 'Algo no ha ido bien. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
    }
  }

  async pedir(prompt) {
    // Un botón sin texto no se manda. Parece de cajón y no lo era: un botón mal
    // montado le escribió a Jose la palabra "undefined" en su conversación,
    // porque `encodeURIComponent(undefined)` es la cadena "undefined" y el
    // enlace la entregó tan contento. Lo que llegue vacío se queda aquí, se
    // apunta con nombre y apellidos, y se dice que algo va mal.
    if (typeof prompt !== 'string' || !prompt.trim()) {
      this.salida.appendLine(`[pedir] un botón ha mandado un texto que no vale: ${JSON.stringify(prompt)}`); // diccionario: interno
      this.enviar({ tipo: 'aviso', texto: 'Ese botón está mal montado. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
      return;
    }

    await this.anotarLaPeticion(prompt);
    const como = await puente.enviar(prompt, this.salida);
    // No se dice "se lo he pedido": los dos comandos de Claude dejan el texto
    // escrito en su caja y no lo envían (asistentes.js lo documenta). Decir que
    // ya se lo hemos pedido dejaba a la persona esperando una respuesta que no
    // iba a llegar hasta que ella misma le diera a enviar.
    if (como === 'directo') this.enviar({ tipo: 'aviso', texto: 'Te lo he dejado escrito en la conversación. Dale a enviar.' });
  }

  // Se guardan las últimas peticiones para poder ver cuál se repite y ofrecer
  // dejarla como botón. Solo el texto que el alumno ya ha mandado, aquí, en su
  // ordenador: ni se envía ni se versiona.
  async anotarLaPeticion(prompt) {
    if (!prompt || prompt.startsWith('/')) return; // un botón ya es un botón
    const antes = this.almacen().get(CLAVE_PETICIONES) || [];
    await this.almacen().update(CLAVE_PETICIONES, [...antes, prompt].slice(-20));
  }

  // ------------------------------------------------------- conexiones

  verConexiones() {
    this.donde = { tipo: 'conexiones' };
    this.enviar({
      tipo: 'conexiones',
      proveedores: conexiones.proveedores(),
      // Si el arnés se montó sobre un proyecto que ya existía, puede haber
      // claves guardadas donde estuvieran. Aquí no se leen: se avisa.
      sueltas: sueltas.resumen(),
    });
  }

  verConexion(proveedor, aviso = null) {
    const datos = conexiones.claves(proveedor);
    if (!datos) return this.verConexiones();
    this.donde = { tipo: 'conexion', proveedor };
    const desordenadas = sueltas.resumen();
    return this.enviar({
      tipo: 'conexion',
      ...datos,
      cositas: conexiones.scripts(proveedor),
      // Si alguna clave de esta conexión está en otro sitio, el botón que lo
      // arregla va aquí mismo, que es donde se ve el problema (decisión 104).
      ordenar: desordenadas ? desordenadas.prompt : null,
      aviso,
    });
  }

  guardarClave(proveedor, clave, valor) {
    const { ok, mensaje } = conexiones.escribir(proveedor, clave, valor);
    this.verConexion(proveedor, { texto: mensaje, malo: !ok });
  }

  async probar(proveedor) {
    this.enviar({ tipo: 'esperando', que: 'Probando la conexión…' });
    const { ok, mensaje } = await conexiones.probar(proveedor);
    this.verConexion(proveedor, { texto: mensaje, malo: !ok });
  }

  // Modo mixto: lo que solo mira se ejecuta y se enseña; lo que pide datos o
  // toca algo se lo pedimos al asistente, que pregunta y pide permiso.
  async hacerCosita(proveedor, fichero, etiqueta, pideDatos) {
    if (pideDatos) {
      await this.pedir(`Quiero "${etiqueta}". Usa 01-TOOLS/${proveedor}/${fichero} y pregúntame los datos que te falten.`);
      return;
    }

    this.enviar({ tipo: 'esperando', que: `${etiqueta}…` });
    const hecho = await conexiones.ejecutar(proveedor, fichero);
    if (!hecho.ok) return this.verConexion(proveedor, { texto: hecho.mensaje, malo: true, ...(hecho.boton ? { boton: hecho.boton } : {}) });
    if (!hecho.texto) return this.verConexion(proveedor, { texto: hecho.mensaje, malo: false });
    this.donde = { tipo: 'quieto' };
    return this.enviar({ tipo: 'resultado', titulo: hecho.titulo, texto: hecho.texto, proveedor });
  }

  // ---------------------------------------------------------- cerebro

  verCerebro(aviso = null) {
    this.donde = { tipo: 'cerebro' };
    this.enviar({
      tipo: 'cerebro',
      temas: cerebro.catalogo(),
      sinOrdenar: cerebro.sinOrdenar().slice(0, 8),
      esperando: cerebro.esperandoLectura(),
      yaLeidos: cerebro.yaLeidos(),
      hayPanel: cerebro.hayPanel(),
      aviso,
    });
  }

  verTema(tema) {
    const encontrado = cerebro.catalogo().find((t) => t.id === tema);
    if (!encontrado) return this.verCerebro();
    this.donde = { tipo: 'tema', tema };
    return this.enviar({ tipo: 'tema', tema: encontrado });
  }

  // Buscar es mirar, no conversar: lo resuelve la barra leyendo el disco, sin
  // abrir una conversación ni hacer esperar a nadie (docs/friccion.md §4).
  buscar(texto, donde = null) {
    // Mientras se busca no se repinta por detrás: el vigía borraría lo escrito
    // en la caja a media palabra.
    this.donde = { tipo: 'quieto' };
    return this.enviar({ tipo: 'resultados', ...buscador.buscar(texto, 15, donde) });
  }

  // Se lee dentro del panel: la vista previa de VS Code enseña el frontmatter
  // antes que el texto, y eso es justo lo que aquí no se enseña nunca.
  leerArticulo(ruta, tema, desde) {
    const leido = cerebro.leerArticulo(ruta);
    if (!leido.ok) return this.enviar({ tipo: 'aviso', texto: leido.mensaje, malo: true });
    this.donde = { tipo: 'quieto' };

    // Con qué sigue y con qué venía, dentro del mismo tema: leer una cosa y
    // tener que volver dos pantallas para leer la siguiente es una tontería.
    let hermanos = null;
    if (tema) {
      const lista = cerebro.articulos(tema);
      const i = lista.findIndex((a) => a.ruta === ruta);
      if (i !== -1) {
        hermanos = {
          anterior: i > 0 ? lista[i - 1] : null,
          siguiente: i < lista.length - 1 ? lista[i + 1] : null,
        };
      }
    }

    return this.enviar({ tipo: 'articulo', ...leido, tema, desde, hermanos, ruta });
  }

  async abrirFuera(ruta) {
    const { ok, mensaje } = await cerebro.abrirFuera(ruta);
    if (!ok) this.enviar({ tipo: 'aviso', texto: mensaje, malo: true });
  }

  // Soltados encima de la barra. Llegan ya leídos por el panel, porque el
  // editor no le da la ruta de lo que se suelta — y hace bien.
  async soltarDocumentos(ficheros, para = 'documentos') {
    if (!ficheros || !ficheros.length) return this.refrescar();

    // Arrastrado encima de la pantalla de la marca, el material va a su
    // carpeta: es lo que el asistente mira para sacar los colores, y en la
    // bandeja de documentos se mezclaría con las facturas.
    if (para === 'marca') {
      const puesto = tema.guardarSoltado(ficheros);
      if (!puesto.ok) return this.verLaCara({ texto: puesto.mensaje, malo: true });
      await puente.enviar(tema.queLePedimos({ web: tema.comoEstamos().web, puestos: puesto.puestos }));
      return this.verLaCara({ texto: `${puesto.mensaje} Se lo he pasado al asistente.`, malo: false });
    }

    const { ok, cuantos, mensaje } = cerebro.guardarSoltados(ficheros);
    if (!ok) return this.enviar({ tipo: 'aviso', texto: mensaje, malo: true });

    await this.refrescar(true);
    this.enviar({ tipo: 'aviso', texto: mensaje });
    await puente.enviar(`Te he dejado ${cuantos === 1 ? 'un documento nuevo' : `${cuantos} documentos nuevos`} en la bandeja. Léelos y cuéntame qué has aprendido.`);
    return undefined;
  }

  async anadirDocumentos() {
    const { ok, cuantos, mensaje } = await cerebro.anadirDocumentos();
    if (!ok) return this.verCerebro({ texto: mensaje, malo: true });
    if (!cuantos) return this.verCerebro();

    await puente.enviar('He dejado documentos nuevos en la bandeja de entrada. Léelos, guárdalos donde toque y cuéntame en dos líneas qué has aprendido.');
    brujula.olvidar();
    return this.verCerebro({ texto: mensaje, malo: false });
  }

  // ----------------------------------------------------------- copias

  async verCopias() {
    this.enviar({ tipo: 'copias', copias: await copias.copias(8) });
  }

  // La pantalla de la copia de fuera. Enseña en qué punto está esto —si ha
  // entrado en su cuenta y a dónde va la copia— antes de ofrecer nada, porque
  // "guardar fuera" son tres cosas distintas y de ahí viene la confusión: una
  // cuenta, un sitio donde guardar, y el acto de subir.
  // "¿Hasta qué punto está montada esta carpeta?", pieza por pieza. Existe
  // porque la pantalla principal solo sabe decir si hay arnés o no, y quien no
  // ve conexiones no sabe si es que no hay o es que no se encuentran.
  // "¿Esto qué sabe hacer?" — de las primeras preguntas delante de algo nuevo,
  // y hasta ahora sin respuesta: el consejero ofrecía una capacidad cuando
  // encajaba y no había forma de ver el resto.
  // Llevarte un archivo: lo que el asistente ha producido, en el `out/` que RSC
  // define en cada herramienta.
  async verSalidas() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'salidas', herramientas: salidas.loQueHaProducido() });
  }

  async abrirSalida(herramienta, fichero) {
    const { ok, mensaje } = await salidas.abrir(herramienta, fichero);
    if (!ok) this.enviar({ tipo: 'aviso', texto: mensaje, malo: true });
  }

  async guardarSalida(herramienta, fichero) {
    const hecho = await salidas.guardarCopia(herramienta, fichero);
    if (hecho.cancelado) return;
    this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: !hecho.ok });
  }

  async verSaberes() {
    this.donde = { tipo: 'quieto' };
    const sabe = saberes.queSabe(this.contexto.extensionPath, this.corpus());
    this.enviar({
      tipo: 'saberes',
      sabe: sabe.sabe,
      puedeAprender: sabe.puedeAprender,
      // Lo que no pega con este arnés: va plegado, no se tira.
      lasDemas: sabe.lasDemas,
      deQueVa: sabe.deQueVa,
      suyas: sabe.suyas,
      otras: sabe.otras,
      // Las que el arnés monta para funcionar. Plegadas, pero se ven.
      deSerie: sabe.deSerie,
      instaladas: sabe.instaladas,
      encajan: sabe.encajan,
    });
  }

  // El archivador: los papeles que han entrado, en sus tres montones. Antes de
  // los tres solo se veía un número — "tienes 3 sin leer" y ni forma de saber
  // cuáles son.
  async verPapeles(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'papeles', ...papeles.queHay(), aviso: avisoLocal });
  }

  // Se pregunta antes, y con el nombre del documento dentro de la pregunta: un
  // "¿seguro?" a secas no dice qué se va a borrar.
  async quitarPapel(ruta, nombre) {
    const seguro = await vscode.window.showWarningMessage(
      `¿Quito "${nombre}"? Todavía no lo ha leído nadie, así que no se pierde nada aprendido.`,
      { modal: true },
      'Sí, quítalo',
    );
    if (seguro !== 'Sí, quítalo') return undefined;

    const { ok, mensaje } = papeles.quitar(ruta);
    return this.verPapeles({ texto: mensaje, malo: !ok });
  }

  async abrirPapel(ruta) {
    const { ok, mensaje } = await papeles.abrir(ruta);
    if (!ok) this.enviar({ tipo: 'aviso', texto: mensaje, malo: true });
  }

  // Todo lo que sirve cuando alguien se atasca, junto. "¿Y ahora qué hago?" es
  // la pregunta más frecuente que hay y no tenía botón en ningún sitio.
  async verAyuda() {
    this.donde = { tipo: 'quieto' };
    const laNueva = await version.laNuevaSiHay(this.contexto, this.versionDeLaBarra());
    this.enviar({
      tipo: 'ayuda',
      github: await github.estado(),
      avisos: this.losAvisosQueEsperan(),
      // Qué barra es esta, y si hay otra: aquí sale aunque se apartara con «Ahora no».
      version: {
        esta: this.versionDeLaBarra(),
        nueva: laNueva ? laNueva.version : null,
        deprueba: Boolean(laNueva && laNueva.deprueba),
        puesta: this.versionPuesta || null,
        probarAntes: version.probarAntes(),
      },
    });
  }

  // ── Resolver una incidencia ────────────────────────────────────────────
  //
  // Jose: *«debería haber un botón donde ponga resolver incidencias […] y
  // entonces el asistente audita todo»*. Lo que el alumno sabe decir es el
  // síntoma; el diagnóstico lo tiene la barra. Se mandan juntos, y el
  // asistente repasa la carpeta entera antes de contestar.
  //
  // Las opciones se dan hechas porque una caja de texto vacía delante de
  // alguien atascado es una pared (regla 5 del diccionario). «Otra cosa» abre
  // la caja, con ejemplos.
  async resolverIncidencia(cual) {
    const SINTOMAS = {
      conexiones: 'No encuentro mis conexiones, o falta alguna que yo sé que tengo.',
      clave: 'Una conexión dice que le faltan claves y yo creo que ya las tengo puestas.',
      noHace: 'Le pido cosas al asistente y no hace lo que espero.',
      montar: 'Algo no se ha montado bien en esta carpeta.',
    };

    let sintoma = SINTOMAS[cual];
    if (!sintoma) {
      sintoma = (await vscode.window.showInputBox({
        title: 'Resolver una incidencia',
        prompt: 'Cuéntame qué pasa, con tus palabras. Lo demás lo mira él.',
        placeHolder: 'Por ejemplo: "no sé dónde están las claves de mis herramientas"',
        ignoreFocusOut: true,
      }) || '').trim();
      if (!sintoma) return undefined;
    }

    this.enviar({ tipo: 'esperando', que: 'Mirando cómo está todo…' });
    const encargo = encargos.resolverUnaIncidencia({ sintoma, queVe: await this.loQueNoCuadra() });
    return this.pedir(encargo.prompt);
  }

  // Hechos leídos del disco para acompañar a la incidencia. Nada de
  // impresiones: lo que el asistente no puede ver de un vistazo y la barra sí.
  async loQueNoCuadra() {
    const visto = [];
    try {
      const revision = await terreno.radiografia({ sigueSinCopias: this.eligioSinCopias() });
      for (const pieza of revision.piezas || []) {
        if (pieza.estado === 'no' || pieza.estado === 'aMedias') visto.push(`${pieza.nombre}: ${pieza.detalle}`);
      }
      for (const p of conexiones.proveedores()) {
        if (p.aMedioHacer) visto.push(`La conexión ${p.etiqueta} está a medio preparar (sigue con la plantilla).`);
        else if (p.fueraDeSitio) visto.push(`${p.etiqueta} tiene ${p.fueraDeSitio === 1 ? 'una clave guardada' : `${p.fueraDeSitio} claves guardadas`} fuera de su carpeta.`);
        else if (p.faltan) visto.push(`A ${p.etiqueta} ${p.faltan === 1 ? 'le falta una clave' : `le faltan ${p.faltan} claves`}.`);
      }
      const desordenadas = sueltas.resumen();
      if (desordenadas) {
        if (desordenadas.claves) {
          visto.push(`Hay ${desordenadas.claves === 1 ? 'una clave' : `${desordenadas.claves} claves`} fuera de sitio en: ${desordenadas.ficheros.join(', ')}.`);
          for (const g of desordenadas.reparto) {
            visto.push(`  · ${g.claves.join(', ')} parecen de ${g.herramienta}${g.existe ? '' : ', que no tiene carpeta en 01-TOOLS'}.`);
          }
          if (desordenadas.sinDueno.length) visto.push(`  · Sin dueño claro: ${desordenadas.sinDueno.map((x) => x.nombre).join(', ')}.`);
        }
        // Y las credenciales que son un fichero entero, que van a otro sitio.
        for (const f of desordenadas.ficherosDeAcceso) {
          visto.push(`${f.donde} es ${f.queEs.toLowerCase()} y está fuera de su sitio${f.herramienta ? `; parece de ${f.herramienta}` : ', y no se sabe de quién'}.`);
        }
      }
      for (const g of reglas.losGuardianes()) {
        if (g.estado === 'apagado') visto.push(`El freno "${g.nombre}" está apagado.`);
      }
    } catch (error) {
      this.salida.appendLine(`[incidencia] ${error.stack || error.message}`); // diccionario: interno
    }
    return visto;
  }

  // Las reglas que el asistente respeta siempre. Son tres sitios de RSC y no se
  // veía ninguno — y uno de ellos, la constitución, es de los dos ficheros que
  // el arnés marca como "léete esto antes de cada cosa que hagas".
  async verReglas() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'reglas', ...reglas.queHay() });
  }

  // ── Los raíles de esta carpeta, al día ─────────────────────────────────
  //
  // Los raíles los copia el wizard al montar, con los que llevara la barra
  // ese día. Cuando la barra sube de versión, las carpetas montadas antes se
  // quedan con las reglas viejas y **nada lo dice**: el asistente sigue
  // leyendo lo de la semana pasada (F13 de la auditoría, decisión 108).
  //
  // Esto no decide nada: repone lo que esta carpeta ya declaró tener, con la
  // versión de ahora. Los raíles son nuestros y se sobrescriben enteros, así
  // que es lo mismo que hace `repair` y va sin preguntar — pero se dice.
  async ponerLosRailesAlDia(callado = false) {
    if (!callado) this.enviar({ tipo: 'esperando', que: 'Poniendo al día lo que la barra deja escrito…' });
    // En una carpeta cuyo historial no creó la barra, lo que toca ficheros suyos
    // no se repone en silencio: se ofrece con su botón (C-4).
    const ajena = !(await terreno.podemosGuardarElPuntoDePartida());
    const ok = await arrancar.ponerLosRailes(this.contexto, { ajena });
    this.salida.appendLine(`[railes] al día: ${ok}${ajena ? ' (historial de alguien: lo suyo, pendiente)' : ''}`); // diccionario: interno
    await this.refrescar(true);
    if (!ok) {
      this.enviar({ tipo: 'aviso', texto: 'No he podido ponerlo al día. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
    } else if (!callado) {
      this.enviar({ tipo: 'aviso', texto: 'Ya está al día. El asistente lee las reglas de ahora.' });
    }
    return ok;
  }

  // La revisión que escribió el asistente. Es una página entera, así que se
  // abre fuera, como el panel de conocimiento: dentro del editor se vería el
  // código de la página, que no es lo que nadie quiere ver.
  async abrirRevision(fichero) {
    const donde = terreno.dondeViveLaRevision(fichero);
    if (!donde) return this.enviar({ tipo: 'aviso', texto: 'Esa revisión ya no está.', malo: true });
    await vscode.env.openExternal(vscode.Uri.file(donde));
    return undefined;
  }

  async abrirReglas(cual) {
    const donde = reglas.dondeVive(cual);
    if (!donde) return this.enviar({ tipo: 'aviso', texto: 'Eso todavía no está escrito.', malo: true });

    const uri = vscode.Uri.file(donde);
    try {
      await vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
    } catch {
      await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.Beside, preview: true });
    }
    return undefined;
  }

  // Todos los comandos, no solo los que llevan botón.
  async verComandos() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'comandos', comandos: acciones.todos(), puedeTenerBotones: donde.puedeTenerBotones() });
  }

  // Qué le vendría bien a esto: lo que ve la barra leyendo el disco, y un botón
  // para lo que solo puede ver el asistente.
  async verSugerencias() {
    this.donde = { tipo: 'quieto' };
    let ahora = [];
    try {
      ahora = consejos.consejos(await this.queVeoYo());
    } catch (error) {
      this.salida.appendLine(`[sugerencias] ${error.stack || error.message}`);
    }
    this.enviar({
      tipo: 'sugerencias',
      ahora,
      hayAgentes: agentes.hayAlguno(),
      hayProyectos: proyectos.hayAlgo(),
    });
  }

  // Los ayudantes. No salen en la pantalla principal hasta que hay uno.
  async verAgentes() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'agentes', agentes: agentes.queHay() });
  }

  async verAgente(fichero) {
    const donde2 = agentes.dondeVive(fichero);
    if (!donde2) return this.enviar({ tipo: 'aviso', texto: 'Ese ayudante ya no está.', malo: true });
    return papeles.abrirFichero(donde2);
  }

  // Lo que se acordó construir. Solo existe donde se construya algo con SDD.
  async verProyectos() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'proyectos', montones: proyectos.queHay() });
  }

  async verProyecto(fichero) {
    const donde = proyectos.dondeVive(fichero);
    if (!donde) return this.enviar({ tipo: 'aviso', texto: 'Eso ya no está.', malo: true });
    return papeles.abrirFichero(donde);
  }

  // ------------------------------------------------ la cara de la empresa
  //
  // El diseño lo hace el asistente. Esto solo recoge el material y se lo pasa:
  // la web, el logotipo, su manual de marca, o palabras.
  async verLaCara(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'laCara', ...tema.comoEstamos(), aviso: avisoLocal });
  }

  async materialDeMarca() {
    const hecho = await tema.elegirMaterial();
    if (hecho.cancelado) return this.verLaCara();
    if (!hecho.ok) return this.verLaCara({ texto: hecho.mensaje, malo: true });

    await puente.enviar(tema.queLePedimos({ web: tema.comoEstamos().web, puestos: hecho.puestos }));
    return this.verLaCara({ texto: `${hecho.mensaje} Se lo he pasado al asistente.`, malo: false });
  }

  async quitarLaCara() {
    const { ok, mensaje } = tema.quitarla();
    if (ok) this.pintarPagina();
    return this.verLaCara({ texto: mensaje, malo: !ok });
  }

  // Elegir qué va arriba del todo. Lo que use de verdad esa persona no lo
  // sabemos nosotros, así que lo elige ella.
  async verFijadas(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    this.enviar({
      tipo: 'fijadas',
      grupos: fijadas.candidatos(this.contexto.extensionPath),
      elegidas: fijadas.elegidas(this.almacen()),
      tope: fijadas.TOPE,
      aviso: avisoLocal,
    });
  }

  async cambiarFijada(cambiar, cual) {
    const { ok, mensaje } = await cambiar(this.almacen(), cual, this.contexto.extensionPath);
    await this.verFijadas(ok ? null : { texto: mensaje, malo: true });
    if (ok) await this.refrescar(true);
  }

  // El subapartado de personalización: cuatro cosas que cambian el día a día.
  async verComoTrabaja(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'comoTrabaja', ...ajustes.comoEstamos(), aviso: avisoLocal });
  }

  async cambiarAjuste(poner, cual) {
    const { ok, mensaje } = await poner(cual);
    return this.verComoTrabaja({ texto: mensaje, malo: !ok });
  }

  async verAsistente(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'asistente', ...asistentes.comoEstamos(), aviso: avisoLocal });
  }

  async elegirAsistente(cual) {
    const nombre = (asistentes.porId(cual) || {}).nombre || cual;
    const { ok, mensaje, detalle, cancelado } = await asistentes.elegir(cual, {
      // Si la carpeta no está montada para él, se prepara también para él (E1).
      montar: async (id) => {
        this.enviar({ tipo: 'esperando', que: `Preparando esta carpeta para ${nombre}…` });
        return arrancar.prepararTambienPara(id, this.contexto);
      },
    });
    // Lo que dijo el arnés, para «Algo va mal» (revisión de F5, I3).
    this.salida.appendLine(`[asistente] con ${cual}: ${ok ? 'hecho' : (cancelado ? 'sin su sí' : 'no')}${detalle ? ` · ${detalle}` : ''}`); // diccionario: interno
    // Primero el repintado y después lo dicho: al revés, el repintado tapaba el
    // aviso de los frenos, que es el único momento en que sirve (I5).
    if (ok) {
      vigilarOtraVez();
      await this.refrescar(true);
    }
    await this.verAsistente({ texto: mensaje, malo: !ok && !cancelado });
  }

  // Lo que sabe que no sabe. Estaba al final de la pantalla de conceptos,
  // detrás de todo lo demás, que es donde no lo ve nadie.
  async verHuecos() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'huecos', huecos: cerebro.loQueAunNoSabe(20) });
  }

  // El diario del arnés: lo que se hizo cada día y lo que se decidió. Las dos
  // cosas las escribe RSC solo y hasta ahora no las veía nadie.
  async verDiario() {
    this.donde = { tipo: 'quieto' };
    this.enviar({
      tipo: 'diario',
      sesiones: diario.sesiones(),
      decisiones: diario.decisiones(),
      // `log.md` es el registro de operaciones del arnés: es diario, no
      // documentación. Salía en la pantalla de documentos, que no es su sitio.
      aprendido: cerebro.aprendidoUltimamente(5),
    });
  }

  // Una anotación entera NO cabe en la barra. Se probó y se vio: media página
  // de texto en una columna de 300px, con los nombres de fichero saliéndose
  // por el lado, no hay quien la lea. Así que se abre al lado, ya compuesta,
  // que es donde se lee un documento largo.
  async verSesion(fichero) {
    const donde = diario.dondeVive(fichero);
    if (!donde) return this.enviar({ tipo: 'aviso', texto: 'Esa anotación ya no está.', malo: true });

    const uri = vscode.Uri.file(donde);
    try {
      // Compuesto, no en crudo: quien lee esto no tiene por qué ver los
      // asteriscos y las almohadillas.
      await vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
    } catch {
      await vscode.window.showTextDocument(uri, { viewColumn: vscode.ViewColumn.Beside, preview: true });
    }
    return undefined;
  }

  // Cuánto te explica y con qué palabras. Lo guarda el arnés en su perfil y lo
  // lee todo lo demás antes de contestar, así que esto no es un adorno de la
  // barra: cambia cómo habla el asistente en la conversación.
  // El aviso viaja dentro del mensaje, no aparte: un `aviso` suelto repinta la
  // pantalla principal, y elegir una opción aquí te echaría de la pantalla.
  //
  // Y con lo que ha aprendido de ti: las lecciones de la memoria de RSC, que
  // son de la misma clase —cómo trabajar contigo— y no se enseñaban en ningún
  // sitio. El botón de aprender manda lo que se escribiría a mano: con Claude,
  // el comando `learn` tal cual; con los demás, la petición con palabras.
  async verTrato(avisoLocal = null) {
    this.donde = { tipo: 'quieto' };
    const como = trato.comoEstamos();
    this.enviar({
      tipo: 'trato',
      escalones: como.escalones,
      vocabularios: como.vocabularios,
      trato: como.trato,
      palabras: como.palabras,
      elegido: como.elegido,
      aprendido: lecciones.queHaAprendido(10),
      comoAprende: donde.paraQuien() === 'claude'
        ? '/learn'
        : 'Quiero que aprendas algo de cómo trabajo contigo. Pregúntame qué es y guárdalo como una lección tuya, con tu comando de aprender.',
      aviso: avisoLocal,
    });
  }

  async cambiarElTrato(poner, cual) {
    const { ok, mensaje } = poner(cual);
    return this.verTrato(ok
      ? { texto: 'Hecho. Se nota en la próxima cosa que le pidas.', malo: false }
      : { texto: mensaje, malo: true });
  }

  ponerTrato(cual) { return this.cambiarElTrato(trato.ponerTrato, cual); }

  ponerPalabras(cual) { return this.cambiarElTrato(trato.ponerPalabras, cual); }

  async verRadiografia() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'esperando', que: 'Mirando qué hay aquí…' });
    // Ojo con esparcir aquí dentro: `tipo` es el nombre del mensaje y quien
    // lo pise deja al panel sin saber qué pintar. Pasó, y la pantalla se
    // quedaba en "Mirando qué hay aquí…" para siempre.
    // A fondo: aquí sí se puede pagar. Alguien acaba de pulsar para ver esto y
    // hay una pantalla de espera delante; la principal, que se repinta sola, no
    // puede permitirse tres subprocesos del arnés cada vez.
    const aFondo = (await terreno.reconocer({ profundo: true })).arnes;
    const radio = await terreno.radiografia({ aFondo, sigueSinCopias: this.eligioSinCopias() });
    this.enviar({ tipo: 'radiografia', queEs: radio.queEs, piezas: radio.piezas });
  }

  async verCopiaFuera() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'esperando', que: 'Un momento…' });
    this.enviar({ tipo: 'copiaFuera', github: await github.estado() });
  }

  // Entrar en la cuenta. Lo hace el editor, con su propio diálogo y su
  // navegador: aquí no se pide ni se guarda ninguna clave.
  async conectarGitHub() {
    const hecho = await github.conectar();
    if (!hecho.ok) {
      if (!hecho.cancelado) this.salida.appendLine(`[conectarGitHub] ${hecho.detalle}`);
      return this.verCopiaFuera();
    }
    await this.refrescar(true);
    this.enviar({ tipo: 'aviso', texto: `Ya estás dentro${hecho.usuario ? ` como ${hecho.usuario}` : ''}. Ya puedes guardar copias fuera.` });
    return undefined;
  }

  async subirCopia() {
    this.enviar({ tipo: 'esperando', que: 'Subiendo a GitHub…' });
    const hecho = await copias.subirCopia();
    // Sin cuenta no se enseña un error: se enseña cómo entrar.
    if (hecho.faltaGitHub) return this.verCopiaFuera();
    // Por qué no subió, para «Algo va mal», sin el token (F2).
    if (hecho.detalle) this.salida.appendLine(`[subir] ${hecho.detalle}`); // diccionario: interno

    await this.refrescar(true);
    this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: !hecho.ok });
    return undefined;
  }

  async guardarCopia() {
    const { ok, mensaje, boton } = await copias.guardar();
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok, ...(boton ? { boton } : {}) });
    if (ok) brujula.olvidar();
  }

  async volverA(id) {
    const eleccion = await vscode.window.showWarningMessage(
      'Voy a dejar esta carpeta como estaba entonces. Guardo antes una copia de lo de ahora, por si acaso.',
      { modal: true },
      'Sí, vuelve atrás',
    );
    if (eleccion !== 'Sí, vuelve atrás') return;

    const { ok, mensaje } = await copias.volverA(id);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    await this.refrescar(true);
  }

  // Lo que se ve en pantalla, escrito en un documento para poder pasárselo a
  // alguien. Jose: «podemos reportarlo en un markdown y luego un botón para
  // afinar las cosas». Va donde va todo lo que se lee: la bandeja del arnés; y
  // si no hay arnés, fuera del proyecto, que es donde no estorba.
  async guardarLaRevision() {
    const { piezas, queEs } = await terreno.radiografia({ sigueSinCopias: this.eligioSinCopias() });
    const cuando = new Date().toISOString().slice(0, 10);

    const linea = (p) => `| ${{ si: '✓', aMedias: '!', no: '·' }[p.estado] || '·'} | ${p.nombre} | ${p.detalle} |`;
    const texto = [
      `# Qué hay montado en esta carpeta`,
      '',
      `Fecha: ${cuando}`,
      `Estado: ${queEs}`,
      '',
      '| | Pieza | Cómo está |',
      '|---|---|---|',
      ...piezas.map(linea),
      '',
      ...(piezas.some((p) => p.arreglo) ? [
        '## Lo que falta, y quién puede hacerlo',
        '',
        ...piezas.filter((p) => p.arreglo).map((p) => `- **${p.nombre}** — ${p.arreglo.etiqueta} (${{ solo: 'lo hace la barra', agente: 'se lo pide al asistente', persona: 'lo tienes que hacer tú' }[p.arreglo.como]})`),
      ] : ['Está todo.']),
      '',
    ].join('\n');

    const dentro = proyecto.arnesCompleto() && proyecto.ruta('02-DOCS', 'raw');
    const carpeta = dentro || (this.contexto.globalStorageUri && this.contexto.globalStorageUri.fsPath);
    if (!carpeta) {
      return this.enviar({ tipo: 'aviso', texto: 'No he podido dejarlo escrito en ningún sitio.', malo: true });
    }

    const fichero = path.join(carpeta, `que-hay-montado-${cuando}.md`);
    fs.mkdirSync(carpeta, { recursive: true });
    fs.writeFileSync(fichero, texto);
    await vscode.commands.executeCommand('markdown.showPreviewToSide', vscode.Uri.file(fichero));
    return this.enviar({ tipo: 'aviso', texto: 'Te lo he dejado escrito y abierto al lado.' });
  }

  // ---------------------------------------------------------- soporte

  async algoVaMal() {
    this.enviar({ tipo: 'esperando', que: 'Estoy mirando qué pasa. Tarda un poco.' });
    const informe = await soporte.revisar({
      lineas: this.salida.ultimas ? this.salida.ultimas() : [],
      carpetaAparte: this.contexto.globalStorageUri && this.contexto.globalStorageUri.fsPath,
    });
    (this.salida.sinGuardar || this.salida.appendLine).call(this.salida, informe.informe);
    this.ultimoInforme = informe.fichero;
    // Para «Contárselo a Executive Lab» desde esta misma pantalla: el informe
    // va con el aviso aunque no se haya podido dejar escrito en ningún sitio.
    this.ultimaIncidencia = { codigo: informe.codigo, informe: informe.informe };
    this.enviar({
      tipo: 'incidencia',
      codigo: informe.codigo,
      fichero: informe.fichero,
      sano: informe.sano,
      desconocido: informe.desconocido,
      hayQueTocarAlgo: informe.hayQueTocarAlgo,
      // Si lo que falta es git, `rsc repair` no lo va a arreglar: hay que
      // ponerlo. Mejor ese botón que uno que no puede funcionar.
      faltaGit: informe.faltaGit,
      comoSeInstalaGit: git.comoSeInstala(),
    });
  }

  // El informe entero, abierto en el editor. El alumno dicta el código y ya
  // está; esto es para cuando el tutor está delante —o al otro lado de una
  // pantalla compartida— y quiere leerlo sin buscar el fichero.
  async verElInforme(fichero) {
    const donde = fichero || this.ultimoInforme;
    if (!donde || !fs.existsSync(donde)) {
      this.enviar({ tipo: 'aviso', texto: 'No he podido dejarlo escrito en ningún sitio.', malo: true });
      return;
    }
    await vscode.window.showTextDocument(vscode.Uri.file(donde), { viewColumn: vscode.ViewColumn.Beside });
  }

  // ── Contárselo a Executive Lab ─────────────────────────────────────────
  //
  // Tres entradas y una sola pantalla para mandar (avisos.js): el alumno, desde
  // Ayuda o desde «Algo va mal»; su asistente, que lo deja escrito porque se lo
  // dicen los raíles; y la barra, cuando un botón revienta por dentro. En los
  // tres casos se enseña entero y se puede cambiar, y solo sale con «Mandarlo».
  // El sitio es público y la incidencia va con su cuenta: eso lo decide la
  // persona, aviso por aviso (decisión 131).

  versionDeLaBarra() {
    return this.contexto.extension ? this.contexto.extension.packageJSON.version : null;
  }

  losAvisosQueEsperan() {
    try {
      return avisos.pendientes().map((a) => ({ fichero: a.fichero, titulo: a.titulo, origen: a.origen }));
    } catch (error) {
      this.salida.appendLine(`[avisos] ${error.stack || error.message}`); // diccionario: interno
      return [];
    }
  }

  elArregladoQueToca() {
    try {
      return avisos.arregladoQueToca();
    } catch (error) {
      this.salida.appendLine(`[avisos] ${error.stack || error.message}`); // diccionario: interno
      return null;
    }
  }

  // Una vez al día por carpeta, y sin que nadie espere: pintar no puede
  // depender de GitHub. La hora se apunta antes de mirar, así que un fallo de
  // red no hace que se pregunte en cada repintado.
  async mirarLosArregladosSiToca() {
    const almacen = this.almacen();
    if (Date.now() - (almacen.get(CLAVE_ARREGLADOS_MIRADOS) || 0) < UN_DIA) return;
    await almacen.update(CLAVE_ARREGLADOS_MIRADOS, Date.now());
    const cerrados = await avisos.mirarSiEstanArreglados();
    this.salida.appendLine(`[avisos] mirado en GitHub: ${cerrados} cerrados`); // diccionario: interno
    if (cerrados) await this.repintarLoQueHaya();
  }

  async yaLoSe(fichero) {
    if (!avisos.yaLoSabe(fichero)) this.salida.appendLine('[avisos] no he podido apuntar que ya lo sabe'); // diccionario: interno
    return this.refrescar(true);
  }

  elAvisoQueToca() {
    try {
      return avisos.elQueToca(this.almacen().get(CLAVE_SILENCIADOS) || {});
    } catch (error) {
      this.salida.appendLine(`[avisos] ${error.stack || error.message}`); // diccionario: interno
      return null;
    }
  }

  verContar() {
    this.donde = { tipo: 'quieto' };
    this.enviar({
      tipo: 'contar',
      tipos: Object.entries(avisos.TIPOS).map(([id, t]) => ({ id, etiqueta: t.etiqueta, icono: t.icono })),
    });
  }

  contar(cual) {
    return this.ensenarElAviso({ tipo: avisos.TIPOS[cual] ? cual : 'falla', origen: 'alumno', titulo: '', texto: '', detalle: '' });
  }

  // Desde «Algo va mal»: con el informe y su código, que es lo que el tutor
  // tiene apuntado. Así Jose y el tutor hablan de lo mismo.
  contarLaIncidencia() {
    const hubo = this.ultimaIncidencia;
    return this.ensenarElAviso({
      tipo: 'falla',
      origen: 'alumno',
      titulo: '',
      texto: '',
      detalle: hubo ? `Código de incidencia: ${hubo.codigo}\n\n--- informe de «Algo va mal» ---\n${hubo.informe}` : '',
    });
  }

  verElAviso(fichero) {
    const aviso = fichero ? avisos.pendientes().find((a) => a.fichero === fichero) : null;
    if (!aviso) return this.enviar({ tipo: 'aviso', texto: 'Ese aviso ya no está.' });
    return this.ensenarElAviso(aviso);
  }

  async ensenarElAviso(aviso, nota = null) {
    this.donde = { tipo: 'quieto' };
    // Lo suyo que la barra sabe y no está en el perfil: su usuario de GitHub y
    // el sitio de su copia, que salen en el informe de «Algo va mal».
    const cuenta = await github.estado();
    const otros = [cuenta.usuario, cuenta.remoto && cuenta.remoto.corto].filter(Boolean);
    // Lo que se enseña es lo que se manda: los datos, el texto y el título, ya
    // limpios. Lo que la persona cambie después se vuelve a mirar al pulsar.
    const conQue = avisos.datos({
      barra: this.versionDeLaBarra(),
      editor: vscode.version,
      tipo: aviso.tipo,
      origen: aviso.origen,
      lineas: this.salida.ultimas ? this.salida.ultimas() : [],
      detalle: aviso.detalle,
      otros,
    });
    const texto = avisos.limpiar(aviso.texto || '', { otros });
    const titulo = avisos.limpiar(aviso.titulo || '', { otros });
    this.avisoDelante = { ...aviso, texto, titulo, datos: conQue, otros };
    const cual = avisos.TIPOS[aviso.tipo];
    // `cual` y no `tipo`: un `tipo` en los datos pisa el del mensaje, y el panel
    // se queda sin saber qué pintar (ya pasó una vez).
    this.enviar({
      tipo: 'elAviso',
      cual: aviso.tipo,
      etiqueta: cual.etiqueta,
      icono: cual.icono,
      ejemplo: cual.ejemplo,
      origen: aviso.origen,
      texto,
      // El título es lo primero que se ve en GitHub. El del alumno sale de lo
      // que escribe; el que puso su asistente o la barra se enseña y se puede
      // cambiar (revisión de seguridad: antes salía sin que nadie lo viera).
      titulo: aviso.origen === 'alumno' ? null : titulo,
      datos: conQue,
      nota,
      guardado: Boolean(aviso.fichero),
      hayQueEscribir: aviso.origen === 'alumno',
    });
  }

  async mandarElAviso(texto, titulo) {
    // Se coge y se suelta antes de esperar a nada: un doble clic manda dos
    // mensajes, y sin esto eran dos incidencias con su cuenta (revisión).
    const delante = this.avisoDelante;
    this.avisoDelante = null;
    if (!delante) return this.refrescar();
    const escrito = String(texto == null ? '' : texto).trim();
    const conTitulo = delante.origen === 'alumno'
      ? avisos.tituloDe(escrito)
      : String(titulo == null ? delante.titulo : titulo).replace(/\s+/g, ' ').trim();
    // El panel no deja mandarlo vacío; esto es por si algún día sí.
    if (!escrito && delante.origen === 'alumno') return this.ensenarElAviso(delante);

    // Si lo que ha escrito lleva algo que no puede salir, no se manda otra cosa
    // que lo que ha visto: se le enseña limpio, y lo manda si le parece bien.
    const limpio = avisos.limpiar(escrito, { otros: delante.otros });
    const tituloLimpio = avisos.limpiar(conTitulo, { otros: delante.otros });
    if (limpio !== escrito || tituloLimpio !== conTitulo) {
      return this.ensenarElAviso({ ...delante, texto: limpio, titulo: tituloLimpio },
        'He quitado lo que no debe salir de aquí. Míralo y, si está bien, vuelve a pulsar «Mandarlo».');
    }
    const aviso = { ...delante, texto: escrito, titulo: conTitulo || avisos.tituloDe(escrito) };

    this.enviar({ tipo: 'esperando', que: 'Mandándolo…' });
    let entrar = await copias.comoEntrar();
    if (!entrar) {
      // Ha pulsado «Mandarlo»: pedirle que entre es lo que toca, con el
      // diálogo de siempre del editor.
      const conectado = await github.conectar();
      if (conectado.ok) entrar = await copias.comoEntrar();
    }
    if (!entrar) return this.dejarloParaLuego(aviso, 'No lo he mandado: hace falta entrar en tu cuenta de GitHub. Lo dejo guardado en Ayuda para cuando quieras.');

    const hecho = await avisos.mandar(avisos.componer({ ...aviso, barra: this.versionDeLaBarra(), otros: delante.otros }), entrar.clave);
    this.salida.appendLine(`[avisos] ${hecho.ok ? `mandado: ${hecho.url || 'sin enlace'}` : `no ha salido: ${hecho.motivo}${hecho.estado ? ` (${hecho.estado})` : ''}`}`); // diccionario: interno
    if (!hecho.ok) return this.dejarloParaLuego(aviso, 'No he podido mandarlo. Lo dejo guardado en Ayuda y lo puedes volver a intentar.');

    // Se guarda en `mandados/` con su enlace: así ni la barra ni el asistente
    // vuelven a proponer lo que ya se contó.
    if (!avisos.archivar(aviso, avisos.MANDADOS, { enlace: hecho.url })) {
      this.salida.appendLine('[avisos] mandado, pero no he podido apuntarlo como mandado'); // diccionario: interno
    }
    await this.olvidarElApartado(aviso);
    await this.refrescar(true);
    return this.enviar({
      tipo: 'aviso',
      texto: 'Mandado. Lo lee quien hace esta barra, y así se arregla para todos.',
      boton: hecho.url ? { etiqueta: 'Verlo en GitHub', accion: { tipo: 'abrir', url: hecho.url } } : null,
    });
  }

  // Lo que escribió no se pierde: se guarda en su sitio, o se deja uno nuevo,
  // y queda esperando en Ayuda y en la pantalla principal.
  async dejarloParaLuego(aviso, porQue) {
    const guardado = aviso.fichero ? avisos.reescribir(aviso) : Boolean(avisos.preparar(aviso));
    if (!guardado) this.salida.appendLine('[avisos] no he podido dejarlo guardado'); // diccionario: interno
    this.avisoDelante = null;
    await this.refrescar(true);
    return this.enviar({ tipo: 'aviso', texto: guardado ? porQue : 'No he podido mandarlo. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
  }

  // Un aviso que ya no espera no tiene nada que apartar: su «Ahora no» se
  // quedaba para siempre en el almacén de la carpeta (auditoría final).
  async olvidarElApartado(aviso) {
    const id = aviso && aviso.nombre ? `aviso:${aviso.nombre}` : null;
    const apartados = this.almacen().get(CLAVE_SILENCIADOS) || {};
    if (!id || !(id in apartados)) return;
    const { [id]: _olvidado, ...resto } = apartados;
    await this.almacen().update(CLAVE_SILENCIADOS, resto);
  }

  async noMandarElAviso() {
    const delante = this.avisoDelante;
    this.avisoDelante = null;
    // Uno que ya estaba escrito va a `descartados/`: la barra no lo vuelve a
    // enseñar, y el asistente sabe que esto la persona no lo quiso contar.
    const estaba = Boolean(delante && delante.fichero);
    if (estaba && !avisos.archivar(delante, avisos.DESCARTADOS)) {
      this.salida.appendLine('[avisos] no he podido apartarlo'); // diccionario: interno
    }
    if (estaba) await this.olvidarElApartado(delante);
    await this.refrescar(true);
    if (estaba) this.enviar({ tipo: 'aviso', texto: 'No lo mando, y no te lo vuelvo a proponer.' });
  }

  async arreglar() {
    this.enviar({ tipo: 'esperando', que: 'Arreglándolo…' });
    const { ok, mensaje, detalle } = await soporte.arreglar();
    if (detalle) this.salida.appendLine(detalle);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    await this.refrescar(true);
  }

  // La pieza que falta es git, y sin ella no se monta nada (git.js dice por
  // qué). No la repartimos: se lanza el instalador oficial del sistema. Puede
  // tardar mucho —en un Mac limpio son uno o dos gigas—, así que va con barra
  // de progreso y contando lo que pasa.
  async instalarGit() {
    if (!git.sePuedeInstalarSolo()) {
      return this.enviar({ tipo: 'aviso', texto: git.comoSeInstala(), malo: true });
    }

    const hecho = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Poniendo lo que falta', cancellable: false },
      (progreso) => git.instalar((que) => progreso.report({ message: que })),
    );

    // La respuesta anterior está recordada; sin esto la barra seguiría
    // diciendo que falta justo después de ponerla.
    copias.olvidarSiHayGit();

    if (!hecho.ok) {
      this.salida.appendLine(`[instalarGit] ${hecho.mensaje}`);
      return this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: true });
    }

    await this.refrescar(true);
    return this.enviar({ tipo: 'aviso', texto: 'Ya está. Puedes preparar la carpeta.' });
  }

  // Si en esta carpeta se eligió seguir sin copias. Es la misma clave que
  // guarda el arranque.
  eligioSinCopias() {
    return Boolean(this.contexto.workspaceState && this.contexto.workspaceState.get('executiveLab.sigueSinCopias'));
  }

  // El botón de «Lo que el arnés hace solo» (C2): el relevo, otra vez. El
  // proceso de Claude que ya estaba abierto no lo ve, porque el PATH se hereda
  // al arrancar, así que se dice que se abra la conversación de nuevo.
  async arreglarElRelevo() {
    const puesto = relevo.ponerAlActivar({ carpeta: dondeVaElRelevo(this.contexto), ejecutable: entorno.node() });
    this.salida.appendLine(`[relevo] ${puesto.modo}${puesto.error ? `: ${puesto.error}` : ''}`); // diccionario: interno
    await this.refrescar(true);
    return this.enviar(puesto.modo === 'ninguno'
      ? { tipo: 'aviso', texto: 'No he podido arreglarlo. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true }
      : { tipo: 'aviso', texto: 'Cierra la conversación con Claude y ábrela otra vez para que lo coja.' });
  }

  // El botón del freno pendiente (C-4): con el sí de quien lo pulsa, se engancha
  // en sus ajustes. Claude lo coge al abrir la conversación otra vez, porque lee
  // los enganches al empezar.
  async ponerElFreno() {
    // Los raíles salen con 0 aunque no puedan leer los ajustes: se mira que haya
    // quedado enganchado de verdad antes de decir que sí (revisión de F3, M1).
    const ok = await arrancar.ponerLosRailes(this.contexto, { ajena: true, ponerFreno: true })
      && terreno.comoEstaElFreno().nuestro;
    this.salida.appendLine(`[railes] el freno: ${ok}`); // diccionario: interno
    await this.refrescar(true);
    return this.enviar(ok
      ? { tipo: 'aviso', texto: 'Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.' }
      : { tipo: 'aviso', texto: 'No he podido ponerlo. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
  }

  // El botón del bloque de `CLAUDE.md` pendiente (C-4). Toca un fichero suyo,
  // así que antes se pregunta con la frase de cuando se monta sobre lo de alguien.
  // Ajustar lo de siempre no es montar el arnés: se pregunta con el nombre del
  // botón, y vale para cualquier asistente (revisión de F4, m5).
  async ponerElBloque() {
    const si = 'Ajustarlo ahora';
    // Lo que falta, dicho como se dice en el resumen de montar: sus instrucciones,
    // su `.gitignore` (F1), o los dos.
    const falta = terreno.loQueFaltaPorPoner();
    const lista = falta.length ? falta : ['Cómo se trabaja aquí'];
    const dicha = lista.length < 2 ? lista.join('') : `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`;
    const elegido = await vscode.window.showInformationMessage(
      `Aquí ya hay cosas tuyas. Voy a tocar esto: ${dicha}. No borro nada tuyo.`,
      { modal: true },
      si,
      'No, déjalo',
    );
    if (elegido !== si) return this.enviar({ tipo: 'aviso', texto: 'No he tocado nada. Cuando quieras, el botón sigue aquí.' });
    const ok = await arrancar.ponerElBloque(this.contexto) && terreno.tieneElBloque();
    this.salida.appendLine(`[railes] lo de siempre, a mano: ${ok}`); // diccionario: interno
    await this.refrescar(true);
    const conClaude = donde.paraQuien() === 'claude';
    return this.enviar(ok
      ? { tipo: 'aviso', texto: conClaude ? 'Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.' : 'Ya está.' }
      : { tipo: 'aviso', texto: 'No he podido ponerlo. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true });
  }

  // Una carpeta montada con un arnés más nuevo que el de la clase (B5, C-10). No
  // se baja sin pulsar, y antes se nombra lo que la de la clase no trae.
  async ponerComoLaDeLaClase() {
    const noSePudo = { tipo: 'aviso', texto: 'No he podido ponerla como la de la clase. Pulsa «Algo va mal» y pásale el código a tu tutor.', malo: true };
    // Sin poder leer el catálogo de la clase no se sabe qué se quita, y sin
    // nombrarlo no se quita nada (C-10; revisión de F4, m9).
    const queSobra = arrancar.loQueNoTraeLaClase();
    if (!queSobra) {
      this.salida.appendLine('[version] no se puede leer el catálogo de la clase'); // diccionario: interno
      return this.enviar(noSePudo);
    }
    const { sobran, enElPlan } = queSobra;
    if (sobran.length) {
      const lista = sobran.map((id) => `«${nombres.comoSeLlama('habilidades', id, {}).nombre}»`);
      const dicha = lista.length < 2 ? lista.join('') : `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}`;
      const si = 'Ponerla como la de la clase';
      const elegido = await vscode.window.showWarningMessage(
        `Se quitarán estas habilidades, que la versión de tu clase no trae: ${dicha}.`,
        { modal: true },
        si,
      );
      if (elegido !== si) return this.enviar({ tipo: 'aviso', texto: 'No he tocado nada. Cuando quieras, el botón sigue aquí.' });
    }
    this.enviar({ tipo: 'esperando', que: 'Poniéndola como la de la clase…' });
    // Con lo que sobra en el plan aceptado, su `sync` no puede: se vuelve a
    // montar con la de la clase, y lo que cambia en el plan se enseña antes de
    // firmarlo (revisión de F4, I1).
    const hecho = enElPlan.length
      ? await arrancar.volverAMontarComoLaDeLaClase(this.contexto, this.salida)
      : await arrancar.ponerComoLaDeLaClase(sobran);
    const { ok } = hecho;
    this.salida.appendLine(`[version] como la de la clase: ${ok}${sobran.length ? `, sin ${sobran.join(', ')}` : ''}${hecho.detalle ? ` · ${hecho.detalle}` : ''}`); // diccionario: interno
    if (hecho.cancelado) {
      await this.refrescar(true);
      return this.enviar({ tipo: 'aviso', texto: 'No he tocado nada. Cuando quieras, el botón sigue aquí.' });
    }
    await this.refrescar(true);
    return this.enviar(ok
      ? { tipo: 'aviso', texto: donde.paraQuien() === 'claude' ? 'Ya está. Cierra la conversación con Claude y ábrela otra vez para que lo coja.' : 'Ya está.' }
      : noSePudo);
  }

  // Las copias de una carpeta que se montó sin ellas. Si falta git, se pone
  // antes, con el mismo botón de siempre.
  async ponerCopias() {
    let hecho = await arrancar.ponerLasCopias(this.contexto);
    if (hecho.faltaGit) {
      await this.instalarGit();
      hecho = await arrancar.ponerLasCopias(this.contexto);
      if (hecho.faltaGit) return undefined; // lo que pasa ya lo ha dicho instalarGit
    }
    this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: !hecho.ok });
    return this.refrescar(true);
  }

  async arrancar() {
    const hecho = await arrancar.arrancar(this.contexto, this.salida);

    if (hecho.cancelado) {
      // Dijo que no a montar el arnés sobre lo que ya tenía. La barra funciona
      // sobre el arnés, así que no se instala nada — y se dice, en vez de
      // dejar la pantalla igual y que parezca que no ha pasado nada.
      if (hecho.sinPermiso) {
        this.enviar({ tipo: 'aviso', texto: 'No he tocado nada. Cuando quieras, el botón sigue aquí.' });
      }
      return this.refrescar();
    }

    // Falta git y ha dicho que lo pone: no es un error que mirar, es un botón
    // que pulsar, y la pantalla ya lo enseña.
    if (hecho.faltaGit) return this.refrescar(true);

    // Ha elegido seguir sin copias. Tampoco es un error.
    if (hecho.sigueSinCopias) {
      this.enviar({ tipo: 'aviso', texto: hecho.mensaje });
      return this.refrescar(true);
    }

    if (!hecho.ok) return this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: true });

    // Lo que ya estaba no se celebra: no se ha montado nada.
    if (hecho.yaEstaba) {
      this.enviar({ tipo: 'aviso', texto: hecho.mensaje });
      return this.refrescar(true);
    }

    if (hecho.avisos && hecho.avisos.length) {
      this.salida.appendLine(`[arrancar] terminó con pegas: ${hecho.avisos.join(', ')}`); // diccionario: interno
    }
    // Lo que salió mal y hay que decir, aunque lo demás esté montado (B10).
    for (const pega of hecho.pegas || []) this.enviar({ tipo: 'aviso', texto: pega, malo: true });
    if (hecho.encargos && hecho.encargos.length) {
      this.salida.appendLine(`[arrancar] falta que el asistente haga: ${hecho.encargos.join(', ')}`); // diccionario: interno
    }

    // ── Lo que solo tiene sentido cuando se acaba de montar de cero ───────
    //
    // Traer un arnés de otro ordenador, completar un suelo o adoptar uno que ya
    // estaba no son "montar tu empresa": esa persona ya tenía esto. Preguntarle
    // por la vista sencilla y por GitHub otra vez, y decirle «acabo de montar
    // aquí un arnés», sería contarle una película que no ha pasado.
    const reciénMontado = ['desdeCero', 'encimaDeLoQueHay', 'otroArnes'].includes(hecho.rama);

    if (!reciénMontado) {
      this.enviar({ tipo: 'aviso', texto: LO_QUE_SE_HIZO[hecho.rama] || hecho.mensaje });
      await this.siFaltaAlgoDecirlo(true);
      await puente.enviar('He puesto al día el arnés de esta carpeta. Mira qué hay montado y cuéntame en dos líneas por dónde seguimos.');
      return undefined;
    }

    // Se pregunta, no se impone: puede ser la carpeta de un alumno o la de
    // alguien que solo está mirando cómo funciona esto.
    const sencilla = await vscode.window.showInformationMessage(
      `${hecho.mensaje} ¿Dejo esta ventana en vista sencilla, sin barras ni ficheros a la vista?`,
      'Sí, más sencillo',
      'No, déjala como está',
    );
    if (sencilla === 'Sí, más sencillo') await this.modoSencillo();
    await this.refrescar(true);
    // La lista de lo que falta se deja para el final, después de GitHub: si
    // saliera ahora, la pregunta de la cuenta le caería encima.

    // La cuenta de GitHub, aquí y no cuando haga falta.
    //
    // Antes esto solo salía el día que alguien pulsaba "Subir a GitHub", que es
    // el peor momento: ya quiere guardar algo y se encuentra con que le toca
    // crearse una cuenta. Montar la carpeta es cuando se está montando todo, y
    // es la única vez que el alumno espera trámites.
    //
    // Se ofrece, no se impone: quien no lo quiera ahora lo tiene en Histórico
    // para siempre, y la carpeta funciona igual sin ello.
    if (!(await github.estado()).conectado) {
      const ahora = await vscode.window.showInformationMessage(
        'Te queda una cosa: una cuenta de GitHub para guardar tu trabajo fuera de este ordenador. Si se rompe el portátil, lo recuperas. ¿Te la preparo ahora?',
        'Sí, ahora',
        'Más tarde',
      );
      if (ahora === 'Sí, ahora') await this.verCopiaFuera();
    }

    // La cara, al momento y por la barra: ya tenemos la web, así que no hay
    // que esperar a que el asistente la mire —ni a que el alumno le dé a
    // enviar—. Lo que salga es un primer intento; al asistente se le pide que
    // lo afine, no que lo haga desde cero (decisión 103).
    const cara = hecho.web ? await this.sacarLaCara(hecho.web) : null;
    const conWeb = hecho.web ? `\n\n${marca.queLePedimos(hecho.web, Boolean(cara && cara.ok))}\n\n` : '';

    // Si la carpeta ya traía claves —un `.env` de antes, un `.env.local`—, el
    // plan de a dónde va cada una viaja en este primer mensaje: es cuando el
    // asistente está montando y cuando el alumno espera trámites. Antes solo
    // salía si alguien entraba en Conexiones y pulsaba (decisión 104). Ahora
    // va con los demás encargos del arranque, en `hecho.paraElMensaje` (A7).
    const comoSeLlama = hecho.nombres.arnes || identidad.deQuien();
    await puente.enviar(arrancar.primerMensaje(hecho, { comoSeLlama, conWeb, conFreno: arrancar.hayFreno() }));
    await this.siFaltaAlgoDecirlo(false);
    return undefined;
  }

  // Jose, sobre qué ver al terminar: «si está todo bien, ¿no debería ir a la
  // pantalla principal?». Eso. La lista de piezas solo sale cuando hay algo que
  // decir — y entonces sale con un botón por cada cosa, que es lo que le
  // faltaba a esa pantalla desde el principio.
  async siFaltaAlgoDecirlo(refrescarSiEstaTodo) {
    const revision = await terreno.radiografia({ sigueSinCopias: this.eligioSinCopias() });
    if (revision.listo) {
      if (refrescarSiEstaTodo) await this.refrescar(true);
      return;
    }
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'radiografia', origen: 'init', ...revision });
  }

  // La web se pregunta aquí, en una caja nativa, no mandándole a Claude un
  // párrafo pidiéndole que la pregunte él. Un dato que el alumno tiene en la
  // cabeza no necesita una conversación de ida y vuelta.
  async ponerLaCara() {
    const escrito = await vscode.window.showInputBox({
      title: 'Ponerle la cara de tu empresa',
      prompt: '¿Cuál es la web de tu empresa? De ahí saco los colores y el logotipo.',
      placeHolder: 'nexusconsulting.com',
      ignoreFocusOut: true,
    });
    const limpio = (escrito || '').trim();
    if (!limpio) return;

    const direccion = /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
    const cara = await this.sacarLaCara(direccion);
    await this.pedir(marca.queLePedimos(direccion, cara.ok));
  }

  // La barra mira la web y deja un primer intento de cara; si lo consigue, se
  // ve al momento. Si no —sin red, web caída, una web sin color de marca— no
  // pasa nada: no se escribe nada y el asistente lo hará con calma.
  async sacarLaCara(direccion) {
    this.enviar({ tipo: 'esperando', que: 'Mirando tu web…' });
    const cara = await web.sacarLaCara(direccion);
    if (!cara.ok) this.salida.appendLine(`[cara] ${direccion}: ${cara.motivo}`); // diccionario: interno
    await this.refrescar(true);
    if (cara.ok) {
      this.enviar({
        tipo: 'aviso',
        texto: `Ya lleva la cara de ${cara.nombre}${cara.logo ? ', con su logotipo' : ''}. Le he pedido al asistente que la afine.`,
      });
    }
    return cara;
  }

  // Elegir sobre qué carpeta se trabaja. Hace falta al arrancar —quien abre
  // esto sin nada abierto no tiene por dónde empezar— y después, para cambiar
  // de sitio sin tener que saber dónde está el menú de VS Code.
  async elegirCarpeta() {
    const elegida = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Trabajar aquí',
      title: 'Elige la carpeta con la que quieres trabajar',
      defaultUri: proyecto.raiz() ? vscode.Uri.file(path.dirname(proyecto.raiz())) : undefined,
    });
    if (!elegida || !elegida.length) return;

    // Se abre en esta misma ventana: abrir otra deja al alumno con dos y sin
    // saber cuál es la suya.
    await vscode.commands.executeCommand('vscode.openFolder', elegida[0], { forceNewWindow: false });
  }

  // ------------------------------------------------------ interruptor

  async verEditorCompleto() {
    const { ok, mensaje } = await disfraz.verEditorCompleto(this.contexto, this.salida);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    if (ok) {
      await this.refrescar(true);
      await disfraz.proponerReabrir('Para que se vea entero, hay que cerrar y abrir esta ventana.');
    }
  }

  async modoSencillo() {
    const { mensaje } = await disfraz.volverAModoSencillo(this.contexto, this.salida);
    this.enviar({ tipo: 'aviso', texto: mensaje });
    await this.refrescar(true);
    await disfraz.proponerReabrir('Para que se aplique, hay que cerrar y abrir esta ventana.');
  }
}

// El disfraz base se pone en el primer arranque. Las claves de Claude solo
// existen cuando su extensión ya está activa, así que lo que no entre se
// reintenta una vez.
async function vestir(contexto, salida) {
  const { primeraVez, aplicadas, pendientes } = await disfraz.aplicar(contexto, salida);
  if (pendientes.length) setTimeout(() => disfraz.aplicar(contexto, salida).catch(() => {}), 8000);
  if (primeraVez && aplicadas) {
    await disfraz.proponerReabrir('Ya está todo preparado. Para que se vea bien, hay que cerrar y abrir de nuevo.');
  }
}

// El panel se ajusta al arnés conforme se monta. Cuando el asistente conecta
// una herramienta, crea un comando o escribe en la wiki, eso aparece solo: sin
// esto, el alumno tendría que cerrar y abrir para ver lo que acaba de pedir.
//
// Lo que se vigila es exactamente lo que el panel lee (ver `decisiones.md` §7).
//
// Y eso había dejado de ser verdad. Aquí estaba escrito `.claude/commands/*.md`
// y nada más de lo que escribe el asistente, cuando el panel lee además sus
// habilidades y sus ayudantes. Dos consecuencias, las dos silenciosas: una
// habilidad recién puesta no aparecía hasta cerrar y abrir, y en un arnés de
// Codex **no se vigilaba nada suyo**, porque sus cosas no viven en `.claude/`.
//
// Así que las carpetas del asistente se preguntan, no se escriben. Lo fijo es
// lo que no depende de él: la declaración, las herramientas y la wiki.
// Y los avisos para Executive Lab, que deja el asistente y la barra enseña.
const LO_FIJO = ['.rsc.json', '01-TOOLS/**', '02-DOCS/wiki/**', '02-DOCS/inbox/*', '02-DOCS/raw/avisos/*'];

// Relativa a la raíz, que es lo que quiere `RelativePattern`.
function suCarpeta(completa) {
  const raiz = proyecto.raiz();
  if (!completa || !raiz) return null;
  return path.relative(raiz, completa).split(path.sep).join('/');
}

function loQueMira() {
  const suyas = [
    donde.carpetaDeComandos(),
    donde.carpetaDeHabilidades(),
    donde.carpetaDeAgentes(),
  ].map(suCarpeta).filter(Boolean).map((c) => `${c}/**`);

  return `{${[...LO_FIJO, ...new Set(suyas)].join(',')}}`;
}

// Volver a vigilar lo del asistente de ahora. Cambiar de asistente ya no toca
// `.rsc.json` (la elección va aparte, E1), y era lo que rearmaba el vigía: sin
// esto se seguían vigilando las carpetas del anterior (revisión de F5, I4).
let vigilarOtraVez = () => {};

function vigilarElArnes(contexto, panel) {
  const carpetas = vscode.workspace.workspaceFolders;
  if (!carpetas || !carpetas.length) return;

  let vigia = null;
  let mirando = null;
  let reloj = null;

  // Una tanda de cambios (RSC escribe muchos ficheros de golpe) es un solo
  // repintado, no veinte.
  const alCambiar = (uri) => {
    const esMarca = uri.fsPath.includes(`${marca.CARPETA.join('/')}/`) || uri.fsPath.includes(marca.FICHERO);
    // El índice del buscador se hizo con lo que había antes de este cambio.
    buscador.olvidar();
    // Cambiar de asistente cambia dónde vive todo lo suyo, y eso se escribe en
    // `.rsc.json`. Sin rearmar, se seguirían vigilando las carpetas del
    // anterior: la barra dejaría de enterarse de lo que pasa en las de ahora.
    //
    // Se rearma **después** de este aviso, no durante: rearmar es tirar el
    // vigía que nos está llamando ahora mismo, y deshacerse de algo desde
    // dentro de su propio manejador es de esas cosas que van bien hasta que un
    // día no. Sale gratis esperar al siguiente tick.
    if (uri.fsPath.endsWith('.rsc.json') && loQueMira() !== mirando) setTimeout(armar, 0);
    clearTimeout(reloj);
    reloj = setTimeout(() => {
      // La marca cambia los colores y el logotipo, así que hay que rehacer la
      // página entera; lo demás se actualiza por mensaje.
      if (esMarca) panel.pintarPagina();
      panel.repintarLoQueHaya().catch(() => {});
    }, 600);
  };

  function armar() {
    if (vigia) vigia.dispose();
    mirando = loQueMira();
    vigia = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(carpetas[0], mirando));
    vigia.onDidCreate(alCambiar);
    vigia.onDidChange(alCambiar);
    vigia.onDidDelete(alCambiar);
  }

  armar();
  vigilarOtraVez = () => { if (loQueMira() !== mirando) armar(); };
  contexto.subscriptions.push({ dispose: () => { clearTimeout(reloj); if (vigia) vigia.dispose(); } });
}

// En modo avanzado nuestra barra puede no estar a la vista, así que la vuelta
// al modo sencillo vive en la barra de estado, que sí se ve.
function vigilarElModo(contexto) {
  const boton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  boton.command = 'executiveLab.modoSencillo';
  boton.text = '$(circle-filled) Modo sencillo';
  boton.tooltip = 'Volver a la vista sencilla en esta ventana';
  boton.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');

  const repintar = () => {
    if (disfraz.modoDeEstaVentana() === 'avanzado') boton.show();
    else boton.hide();
  };
  repintar();

  contexto.subscriptions.push(boton, vscode.workspace.onDidChangeConfiguration(repintar));
  return repintar;
}

// Guardar solo, cada tanto.
//
// ── Por qué existe ───────────────────────────────────────────────────────
//
// Guardar era siempre a mano, y quien no se acuerda de pulsar el botón no
// tiene copias. Que es exactamente el público de esto: alguien que está
// pensando en sus facturas, no en su historial.
//
// ── Las tres cosas que NO hace, que son lo importante ────────────────────
//
//   · **No toca el historial de otra persona.** Si la carpeta ya venía con
//     trabajo de alguien, no se guarda nada solo: la decisión 28 lo dice para
//     el primer guardado y aquí vale igual, o con más razón, porque aquí no
//     hay nadie mirando.
//   · **No guarda si no hay nada nuevo.** Una copia idéntica a la anterior es
//     ruido en una lista que alguien tiene que poder leer.
//   · **No avisa.** Una barra que interrumpe cada hora para decir que todo va
//     bien es una barra que se acaba cerrando. Si falla, se apunta en la salida
//     y ya; es un extra, no puede estropearle el rato a nadie.
function guardarSolo(panel, salida) {
  // Se mira cada cuarto de hora y se guarda cuando toque: así cambiar el ajuste
  // no obliga a reiniciar nada, y un portátil que se suspende no pierde el turno.
  const MIRAR_CADA = 15 * 60 * 1000;
  let ultima = Date.now();

  const reloj = setInterval(async () => {
    try {
      const horas = ajustes.cadaCuantoGuarda();
      if (!horas) return;
      if (Date.now() - ultima < horas * 60 * 60 * 1000) return;

      if (!(await copias.hayGit())) return;
      if (!(await copias.cambiosSinGuardar())) return;
      if (!(await terreno.podemosGuardarElPuntoDePartida())) return;

      const hecho = await copias.guardar(`Copia automática — ${copias.fechaLarga()}`);
      ultima = Date.now();
      if (!hecho.ok) salida.appendLine(`[guardarSolo] ${hecho.mensaje}`);
      else await panel.refrescar(true);
      // Lo que se quedó fuera por ser una credencial (F1): la pieza de las claves
      // fuera de sitio ya lo enseña; aquí, para «Algo va mal».
      if (hecho.excluidos && hecho.excluidos.length) salida.appendLine(`[guardarSolo] fuera de la copia: ${hecho.excluidos.join(', ')}`); // diccionario: interno
    } catch (error) {
      salida.appendLine(`[guardarSolo] ${error.stack || error.message}`);
    }
  }, MIRAR_CADA);

  // Que no sea este reloj lo que mantenga vivo el proceso. En el editor da
  // igual —la ventana sigue abierta de todos modos— pero sin esto las pruebas
  // se quedan colgadas para siempre al arrancar la extensión, que es como se
  // descubrió.
  if (typeof reloj.unref === 'function') reloj.unref();

  return { dispose: () => clearInterval(reloj) };
}

// El relevo vive en el almacén de la barra, fuera de la carpeta del alumno (P8).
const dondeVaElRelevo = (contexto) => (contexto.globalStorageUri ? path.join(contexto.globalStorageUri.fsPath, 'relevo') : null);

function activate(contexto) {
  // El canal se envuelve para que todo lo que apuntemos por dentro acabe
  // también en el informe de "Algo va mal": ver rastro.js.
  const salida = rastro.envolver(
    vscode.window.createOutputChannel('Executive Lab'),
    contexto.globalStorageUri && contexto.globalStorageUri.fsPath,
  );
  rsc.saberDondeEstamos(contexto.extensionPath);
  // Sin arnés, los avisos para Executive Lab esperan en el almacén de la barra,
  // como el informe de «Algo va mal».
  avisos.dondeSinArnes(contexto.globalStorageUri && contexto.globalStorageUri.fsPath);
  // Con qué asistente se habla en esta carpeta, elegido aquí (E1).
  asistentes.saberDondeGuardar(contexto.workspaceState);
  buscador.saberDondeEstamos(contexto.extensionPath);

  // El relevo de Node, antes de que se abra el chat del asistente: así su
  // proceso y los enganches del arnés lo heredan (C2). Vive en el almacén de
  // la barra, fuera de la carpeta del alumno.
  // Si Claude ya estaba en marcha, su proceso no ve lo que se ponga ahora: se
  // apunta, y la pieza pide abrir la conversación otra vez (revisión de F3, I3).
  const claude = vscode.extensions.getExtension('anthropic.claude-code');
  const elRelevo = relevo.ponerAlActivar({
    carpeta: dondeVaElRelevo(contexto),
    ejecutable: entorno.node(),
    yaHabiaAsistente: Boolean(claude && claude.isActive),
  });
  salida.appendLine(`[relevo] ${elRelevo.modo}${elRelevo.carpeta ? ` en ${elRelevo.carpeta}` : ''}${elRelevo.error ? `: ${elRelevo.error}` : ''}`); // diccionario: interno
  // Para poder comparar los raíles de la carpeta con los que trae la barra.
  terreno.saberDondeEstamos(contexto.extensionPath);
  const panel = new Panel(contexto, salida);
  const comando = (id, fn) => vscode.commands.registerCommand(id, fn);
  const repintarModo = vigilarElModo(contexto);

  contexto.subscriptions.push(
    salida,
    guardarSolo(panel, salida),
    vscode.window.registerWebviewViewProvider('executiveLab.panel', panel),
    comando('executiveLab.refrescar', () => panel.refrescar(true)),
    comando('executiveLab.guardar', () => panel.guardarCopia()),
    comando('executiveLab.conexiones', () => panel.verConexiones()),
    comando('executiveLab.cerebro', () => panel.verCerebro()),
    comando('executiveLab.radiografia', () => panel.verRadiografia()),
    comando('executiveLab.saberes', () => panel.verSaberes()),
    comando('executiveLab.salidas', () => panel.verSalidas()),
    comando('executiveLab.huecos', () => panel.verHuecos()),
    comando('executiveLab.papeles', () => panel.verPapeles()),
    comando('executiveLab.ayuda', () => panel.verAyuda()),
    comando('executiveLab.reglas', () => panel.verReglas()),
    comando('executiveLab.asistente', () => panel.verAsistente()),
    comando('executiveLab.comoTrabaja', () => panel.verComoTrabaja()),
    comando('executiveLab.fijadas', () => panel.verFijadas()),
    comando('executiveLab.laCara', () => panel.verLaCara()),
    comando('executiveLab.proyectos', () => panel.verProyectos()),
    comando('executiveLab.sugerencias', () => panel.verSugerencias()),
    comando('executiveLab.comandos', () => panel.verComandos()),
    comando('executiveLab.agentes', () => panel.verAgentes()),
    comando('executiveLab.diario', () => panel.verDiario()),
    comando('executiveLab.trato', () => panel.verTrato()),
    comando('executiveLab.copiaFuera', () => panel.verCopiaFuera()),
    comando('executiveLab.documentos', () => panel.anadirDocumentos()),
    comando('executiveLab.algoVaMal', () => panel.algoVaMal()),
    comando('executiveLab.empezarEmpresa', () => panel.arrancar()),
    comando('executiveLab.elegirCarpeta', () => panel.elegirCarpeta()),
    comando('executiveLab.ponerLaCara', () => panel.ponerLaCara()),
    comando('executiveLab.seguir', () => panel.pedir('Recuérdame en qué estábamos y sigamos por donde lo dejamos.')),
    comando('executiveLab.empezar', () => panel.pedir('Quiero empezar algo nuevo en mi empresa. Pregúntame qué necesito.')),
    comando('executiveLab.diagnosticoPuente', () => puente.diagnostico(salida)),
    comando('executiveLab.verEditorCompleto', async () => { await panel.verEditorCompleto(); repintarModo(); }),
    comando('executiveLab.modoSencillo', async () => { await panel.modoSencillo(); repintarModo(); }),
    comando('executiveLab.quitarDeTodo', async () => {
      const seguro = await vscode.window.showWarningMessage(
        'Voy a quitar el aspecto de Executive Lab de todas las ventanas, no solo de esta. Tus ajustes propios no se tocan.',
        { modal: true },
        'Quítalo',
      );
      if (seguro !== 'Quítalo') return;
      const { quitadas } = await disfraz.quitar(contexto, salida);
      repintarModo();
      await disfraz.proponerReabrir(`Quitado de ${quitadas} ajustes. Hay que cerrar y abrir para verlo.`);
    }),
  );

  vigilarElArnes(contexto, panel);

  // La barra de actividad está oculta por el disfraz, así que si no forzamos
  // nuestra vista el alumno se encuentra el explorador de ficheros delante.
  vscode.commands.executeCommand('executiveLab.panel.focus');

  // Y el chat de Claude ya abierto en el centro: el alumno no tiene que
  // buscarlo. Su extensión puede tardar en activarse; se le da un momento.
  setTimeout(() => puente.abrirConversacion().catch(() => {}), 1500);

  // El disfraz se pone solo en una instalación de verdad. Quien prueba la
  // extensión desde el código no quiere que le desaparezca su editor: ahí se
  // pone a mano con "Volver al modo sencillo".
  if (contexto.extensionMode !== vscode.ExtensionMode.Development) {
    vestir(contexto, salida).catch((e) => salida.appendLine(`[disfraz] ${e.message}`));
  }

  // Y si esta carpeta se montó con una barra anterior, sus raíles son de
  // entonces: el asistente estaría leyendo las reglas de aquel día. Se repone
  // lo que la carpeta ya declaró tener, con la versión de ahora — reponer no
  // es decidir, así que va solo y sin preguntar (decisión 108). Callado: si
  // sale bien no hay nada que contarle a nadie, y si sale mal la lista de
  // piezas lo dice con su botón.
  setTimeout(() => {
    // Lo que una barra anterior dejó escrito en los enganches —la ruta del Node
    // de este ordenador, y la marca que la escondía de git— se deshace al abrir.
    // Es nuestro, y deshacerlo no es decidir (C3, decisión 119).
    arrancar.apuntarLosEnganches(salida).catch((e) => salida.appendLine(`[enganches] ${e.message}`)); // diccionario: interno
    if (terreno.comoEstanLosRailes().alDia) return;
    salida.appendLine('[railes] los de esta carpeta son de una versión anterior: se reponen'); // diccionario: interno
    panel.ponerLosRailesAlDia(true).catch((e) => salida.appendLine(`[railes] ${e.message}`)); // diccionario: interno
  }, 3000);
}

function deactivate() {}

module.exports = { activate, deactivate };
