# Cómo probar el instalador de macOS

Dos formas: en falso (aquí mismo, sin tocar nada tuyo) y de verdad (en un Mac limpio). La primera
vale para el día a día; la segunda es la que cuenta.

---

## En falso, en tu propio Mac

Todo lo que hace el instalador va dentro de la carpeta personal, así que se le puede dar una carpeta
personal de mentira y no se entera de nada:

```bash
cd instalador/mac
./construir.sh                       # arma la carga y el .dmg
rm -rf /tmp/casa-falsa && mkdir -p /tmp/casa-falsa/Documents

HOME=/tmp/casa-falsa node "escenario/Instalar Executive Lab.app/Contents/Resources/instalar.js" \
  --progreso /tmp/progreso.txt --sin-dock

./probar.sh --casa /tmp/casa-falsa   # 19 comprobaciones
```

`--sin-dock` es importante: el Dock **no** vive en la carpeta personal, así que sin esa opción te
cambiaría el tuyo de verdad.

Para ver también la parte que sale por pantalla (los diálogos y la barra de progreso), abre la app:

```bash
open "escenario/Instalar Executive Lab.app"
```

Eso sí instala de verdad en tu Mac. Para deshacerlo: `./desinstalar.command`.

---

## De verdad, en un Mac limpio

Lo que de verdad hay que comprobar es lo que no se puede simular: Gatekeeper, el Dock y el primer
arranque. Hace falta un Mac —o una cuenta de usuario nueva, que vale para casi todo— **sin** Xcode,
sin editor y sin haber visto nunca esto.

1. **Sube el `.dmg` a un sitio real y descárgalo con Safari.** No lo copies por AirDrop ni por USB:
   así no se marca como bajado de internet y Gatekeeper no dice nada aunque esté mal firmado, que es
   justo lo que hay que comprobar. **Graba la pantalla.**
2. **Doble clic.** No debería salir ningún aviso. Si sale *«Apple no puede comprobar si contiene
   malware»*, es que falta la notarización (`./firmar.sh`).
3. **No debería pedir contraseña de administrador en ningún momento.** Si la pide, algo escribe
   fuera de la carpeta del alumno.
4. Al terminar: icono en el Dock, editor abierto y la barra a la vista con *«Preparar esta carpeta»*.
5. **Responde el wizard** y espera. Tiene que acabar con la barra enseñando *Dónde estás* y los
   botones del arnés.
6. **Cierra el editor y vuelve a abrirlo por el icono del Dock.** Aquí se responde la pregunta 6 de
   [docs/spike.md](../../docs/spike.md): si sale algún aviso de enganche en la conversación, es que
   el arnés no encuentra nuestro Node.
7. *Guardar copia de seguridad* → *Volver a como estaba antes*.
8. `bash instalador/mac/probar.sh` y guarda el informe.
9. `./desinstalar.command` y comprueba que el Mac queda como estaba.

### Dónde espero que falle primero

- **La firma.** Hoy `./probar.sh` la da por mala a propósito: hace falta un certificado *Developer
  ID Application*, y los *Apple Development* que salen por defecto no valen.
- **La descarga del editor.** Son 250 MB con la barra de progreso de una app nuestra. Con una
  conexión de oficina mala, ahí se puede caer; hay tres intentos y después un informe.
- **El Dock.** `defaults write` + `killall Dock` funciona, pero si alguien tiene el Dock gestionado
  por su empresa puede no quedarse. La app está en Aplicaciones igual.

---

## Lo que no se prueba aquí

Un Mac con Intel. La carga lleva los dos binarios de Node (o uno universal, si `lipo` está
disponible), pero nadie lo ha ejecutado todavía en un Intel de verdad.
