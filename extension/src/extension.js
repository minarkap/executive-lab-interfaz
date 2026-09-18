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
const path = require('node:path');

const proyecto = require('./proyecto');
const brujula = require('./brujula');
const identidad = require('./identidad');
const puente = require('./puente');
const acciones = require('./acciones');
const conexiones = require('./conexiones');
const sueltas = require('./sueltas');
const cerebro = require('./cerebro');
const buscador = require('./buscar');
const consejos = require('./consejos');
const copias = require('./guardar');
const soporte = require('./soporte');
const rsc = require('./rsc');
const disfraz = require('./disfraz');
const arrancar = require('./arrancar');
const git = require('./git');
const github = require('./github');
const terreno = require('./terreno');
const saberes = require('./saberes');
const salidas = require('./salidas');
const marca = require('./marca');

// Lo que la barra recuerda de esta carpeta, y que nadie más ve: las últimas
// peticiones (para detectar la que se repite) y los consejos que el alumno
// apartó con "ahora no".
const CLAVE_PETICIONES = 'executiveLab.peticiones';
const CLAVE_SILENCIADOS = 'executiveLab.consejosApartados';

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
    let cabecera;
    if (suya && suya.logo) {
      cabecera = `<img class="marca" src="${webview.asWebviewUri(vscode.Uri.file(suya.logo))}" alt="${escapar(suya.nombre || 'Tu empresa')}">`;
    } else if (suya && suya.nombre) {
      cabecera = `<p class="marca marca--nombre">${escapar(suya.nombre)}</p>`;
    } else {
      cabecera = `<img class="marca" src="${uri('logo.svg')}" alt="Executive Lab">`;
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
    this.enviar({ tipo: 'cargando' });
    const suya = marca.leer();
    this.enviar({
      tipo: 'estado',
      estado: await brujula.estado({ fresco }),
      acciones: acciones.acciones(),
      // Los scripts que solo miran, por herramienta: la barra los ejecuta ella
      // y el resultado sale en un segundo, sin abrir conversación.
      deUnVistazo: conexiones.loQueSePuedeMirar(),
      modo: disfraz.modoDeEstaVentana(),
      // Si la empresa aún no tiene cara puesta, el panel la ofrece en vez de
      // esperar a que el alumno caiga en contarlo.
      marcaPuesta: Boolean(suya && suya.tokens),
      // Cómo llama el alumno a esto: sale en "lo que sabe de…".
      comoSeLlama: identidad.deQuien(),
      // Como mucho uno, y siempre con un botón que lo resuelve ahí mismo.
      consejo: await this.elConsejoQueToca(),
      // Con la sesión de GitHub del editor basta; si no la hay, el botón no
      // desaparece — lleva a la guía, que es lo que hace falta cuando no sabes
      // qué es una cuenta de esas.
      puedeSubir: await copias.puedeSubir(),
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

  async elConsejoQueToca() {
    try {
      if (!proyecto.arnesCompleto()) return null;

      const [ultima] = await copias.copias(1);
      return consejos.elQueToca({
        esperando: cerebro.esperandoLectura(),
        esperandoDesdeHace: cerebro.esperandoDesdeHace(),
        conexionesAMedias: conexiones.proveedores().filter((p) => p.faltan > 0),
        diasSinCopia: ultima ? Math.floor((Date.now() - new Date(ultima.cuando).getTime()) / 86400000) : null,
        cambiosSinGuardar: await copias.cambiosSinGuardar(),
        peticiones: this.almacen().get(CLAVE_PETICIONES) || [],
        corpus: this.corpus(),
        yaInstaladas: rsc.habilidadesPuestas(),
        catalogo: consejos.capacidades(this.contexto.extensionPath),
        huecos: cerebro.loQueAunNoSabe(1),
        silenciados: this.almacen().get(CLAVE_SILENCIADOS) || {},
      });
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

  // Enseñarle algo nuevo del catálogo, sin que el alumno vea nada de esto.
  async aprenderCapacidad(id, nombre) {
    this.enviar({ tipo: 'esperando', que: `Aprendiendo a ${nombre}…` });
    const { ok } = await rsc.anadir(id);
    await this.refrescar(true);
    this.enviar({
      tipo: 'aviso',
      texto: ok
        ? `Ya sabe ${nombre}. Pídeselo cuando quieras.`
        : 'No he podido enseñárselo. Prueba con "Algo va mal".',
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

      verConexiones: () => this.verConexiones(),
      verConexion: () => this.verConexion(mensaje.proveedor),
      guardarClave: () => this.guardarClave(mensaje.proveedor, mensaje.clave, mensaje.valor),
      probar: () => this.probar(mensaje.proveedor),
      hacerCosita: () => this.hacerCosita(mensaje.proveedor, mensaje.fichero, mensaje.etiqueta, mensaje.pideDatos),

      buscar: () => this.buscar(mensaje.texto),
      verCerebro: () => this.verCerebro(),
      verTema: () => this.verTema(mensaje.tema),
      leerArticulo: () => this.leerArticulo(mensaje.ruta, mensaje.tema, mensaje.desde),
      abrirFuera: () => this.abrirFuera(mensaje.ruta),
      cambiarArticulo: () => this.pedir(`Quiero cambiar lo que sabes sobre "${mensaje.titulo}". Ábrelo, enséñame qué dice y pregúntame qué hay que corregir.`),
      anadirDocumentos: () => this.anadirDocumentos(),
      soltarDocumentos: () => this.soltarDocumentos(mensaje.ficheros),
      abrirPanelCompleto: () => cerebro.abrirPanel(),

      verCopias: () => this.verCopias(),
      guardarCopia: () => this.guardarCopia(),
      subirCopia: () => this.subirCopia(),
      volverA: () => this.volverA(mensaje.id),

      algoVaMal: () => this.algoVaMal(),
      arreglar: () => this.arreglar(),
      arrancar: () => this.arrancar(),
      instalarGit: () => this.instalarGit(),
      conectarGitHub: () => this.conectarGitHub(),
      verCopiaFuera: () => this.verCopiaFuera(),
      verRadiografia: () => this.verRadiografia(),
      verSaberes: () => this.verSaberes(),
      verSalidas: () => this.verSalidas(),
      abrirSalida: () => this.abrirSalida(mensaje.herramienta, mensaje.fichero),
      guardarSalida: () => this.guardarSalida(mensaje.herramienta, mensaje.fichero),
      abrirCarpetaDeSalida: () => salidas.abrirLaCarpeta(mensaje.herramienta),
      ponerLaCara: () => this.ponerLaCara(),
      elegirCarpeta: () => this.elegirCarpeta(),
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
      this.enviar({ tipo: 'aviso', texto: 'Algo no ha ido bien. Prueba con "Algo va mal".', malo: true });
    }
  }

  async pedir(prompt) {
    await this.anotarLaPeticion(prompt);
    const como = await puente.enviar(prompt, this.salida);
    if (como === 'directo') this.enviar({ tipo: 'aviso', texto: 'Se lo he pedido. Mira la conversación.' });
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
    return this.enviar({ tipo: 'conexion', ...datos, cositas: conexiones.scripts(proveedor), aviso });
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
    if (!hecho.ok) return this.verConexion(proveedor, { texto: hecho.mensaje, malo: true });
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
      aprendido: cerebro.aprendidoUltimamente(5),
      huecos: cerebro.loQueAunNoSabe(4),
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
  buscar(texto) {
    // Mientras se busca no se repinta por detrás: el vigía borraría lo escrito
    // en la caja a media palabra.
    this.donde = { tipo: 'quieto' };
    return this.enviar({ tipo: 'resultados', ...buscador.buscar(texto) });
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
  async soltarDocumentos(ficheros) {
    if (!ficheros || !ficheros.length) return this.refrescar();

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
    const sabe = saberes.queSabe(this.contexto.extensionPath);
    this.enviar({ tipo: 'saberes', sabe: sabe.sabe, puedeAprender: sabe.puedeAprender, deSerie: sabe.deSerie });
  }

  async verRadiografia() {
    this.donde = { tipo: 'quieto' };
    this.enviar({ tipo: 'esperando', que: 'Mirando qué hay aquí…' });
    // Ojo con esparcir aquí dentro: `tipo` es el nombre del mensaje y quien
    // lo pise deja al panel sin saber qué pintar. Pasó, y la pantalla se
    // quedaba en "Mirando qué hay aquí…" para siempre.
    const radio = await terreno.radiografia();
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

    await this.refrescar(true);
    this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: !hecho.ok });
    return undefined;
  }

  async guardarCopia() {
    const { ok, mensaje } = await copias.guardar();
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    if (ok) brujula.olvidar();
  }

  async volverA(id) {
    const eleccion = await vscode.window.showWarningMessage(
      'Voy a dejar tu empresa como estaba entonces. Guardo antes una copia de lo de ahora, por si acaso.',
      { modal: true },
      'Sí, vuelve atrás',
    );
    if (eleccion !== 'Sí, vuelve atrás') return;

    const { ok, mensaje } = await copias.volverA(id);
    this.enviar({ tipo: 'aviso', texto: mensaje, malo: !ok });
    await this.refrescar(true);
  }

  // ---------------------------------------------------------- soporte

  async algoVaMal() {
    this.enviar({ tipo: 'esperando', que: 'Estoy mirando qué pasa. Tarda un poco.' });
    const informe = await soporte.revisar();
    this.salida.appendLine(informe.informe);
    this.enviar({
      tipo: 'incidencia',
      codigo: informe.codigo,
      sano: informe.sano,
      hayQueTocarAlgo: informe.hayQueTocarAlgo,
      // Si lo que falta es git, `rsc repair` no lo va a arreglar: hay que
      // ponerlo. Mejor ese botón que uno que no puede funcionar.
      faltaGit: informe.faltaGit,
      comoSeInstalaGit: git.comoSeInstala(),
    });
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

  async arrancar() {
    const hecho = await arrancar.arrancar(this.contexto, this.salida);
    if (hecho.cancelado) return this.refrescar();
    // Falta git: no es un error que mirar, es un botón que pulsar.
    if (hecho.faltaGit) return this.refrescar(true);
    if (!hecho.ok) return this.enviar({ tipo: 'aviso', texto: hecho.mensaje, malo: true });

    // Se pregunta, no se impone: puede ser la carpeta de un alumno o la de
    // alguien que solo está mirando cómo funciona esto.
    const sencilla = await vscode.window.showInformationMessage(
      `${hecho.mensaje} ¿Dejo esta ventana en vista sencilla, sin barras ni ficheros a la vista?`,
      'Sí, más sencillo',
      'No, déjala como está',
    );
    if (sencilla === 'Sí, más sencillo') await this.modoSencillo();
    await this.refrescar(true);
    const conWeb = hecho.web
      ? ` La web de mi empresa es ${hecho.web}: míralas y quédate con sus colores y su logotipo antes de nada.`
      : '';
    const deQuien = hecho.nombres.empresa ? ` Es para ${hecho.nombres.empresa}.` : '';
    await puente.enviar(`Acabo de montar aquí un arnés que he llamado "${hecho.nombres.arnes}".${deQuien} Lo primero que quiero resolver: ${hecho.objetivo}.${conWeb} Después empieza preguntándome lo que necesites saber, de una pregunta en una pregunta.`);
    return undefined;
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

    const web = /^https?:\/\//i.test(limpio) ? limpio : `https://${limpio}`;
    await this.pedir(`Mira ${web} y ponle a esto la cara de mi empresa: sus colores y su logotipo.`);
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
const LO_QUE_MIRA = '{.rsc.json,.claude/commands/*.md,01-TOOLS/**,02-DOCS/wiki/**,02-DOCS/inbox/*}';

function vigilarElArnes(contexto, panel) {
  const carpetas = vscode.workspace.workspaceFolders;
  if (!carpetas || !carpetas.length) return;

  const vigia = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(carpetas[0], LO_QUE_MIRA),
  );

  // Una tanda de cambios (RSC escribe muchos ficheros de golpe) es un solo
  // repintado, no veinte.
  let reloj = null;
  const alCambiar = (uri) => {
    const esMarca = uri.fsPath.includes(`${marca.CARPETA.join('/')}/`) || uri.fsPath.includes(marca.FICHERO);
    // El índice del buscador se hizo con lo que había antes de este cambio.
    buscador.olvidar();
    clearTimeout(reloj);
    reloj = setTimeout(() => {
      // La marca cambia los colores y el logotipo, así que hay que rehacer la
      // página entera; lo demás se actualiza por mensaje.
      if (esMarca) panel.pintarPagina();
      panel.repintarLoQueHaya().catch(() => {});
    }, 600);
  };

  vigia.onDidCreate(alCambiar);
  vigia.onDidChange(alCambiar);
  vigia.onDidDelete(alCambiar);
  contexto.subscriptions.push(vigia, { dispose: () => clearTimeout(reloj) });
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

function activate(contexto) {
  const salida = vscode.window.createOutputChannel('Executive Lab');
  rsc.saberDondeEstamos(contexto.extensionPath);
  const panel = new Panel(contexto, salida);
  const comando = (id, fn) => vscode.commands.registerCommand(id, fn);
  const repintarModo = vigilarElModo(contexto);

  contexto.subscriptions.push(
    salida,
    vscode.window.registerWebviewViewProvider('executiveLab.panel', panel),
    comando('executiveLab.refrescar', () => panel.refrescar(true)),
    comando('executiveLab.guardar', () => panel.guardarCopia()),
    comando('executiveLab.conexiones', () => panel.verConexiones()),
    comando('executiveLab.cerebro', () => panel.verCerebro()),
    comando('executiveLab.radiografia', () => panel.verRadiografia()),
    comando('executiveLab.saberes', () => panel.verSaberes()),
    comando('executiveLab.salidas', () => panel.verSalidas()),
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
}

function deactivate() {}

module.exports = { activate, deactivate };
