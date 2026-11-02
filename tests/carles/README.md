# Pruebas de la parte de Carles

Desde la raíz del Producto 2, con Node 24.22.0:

```sh
node tests/carles/ejecutar.mjs
npm run build
```

El ejecutor usa `node:test`, Angular y el esbuild ya instalado por Angular Build. No añade dependencias ni modifica la configuración compartida. Genera su salida en `tmp/pruebas-carles/`, ignorado por Git.

Las pruebas instancian los componentes y sus Reactive Forms reales, con un diálogo simulado, `JugadoresService` y `AvisosService` simulados. Comprueban validaciones, edición, independencia del objeto original, URL, emisiones, subidas simultáneas, doble envío, éxito y reintento tras error. No renderizan HTML: sustituyen los metadatos de vista al preparar el paquete de pruebas. Las plantillas reales se comprueban con la compilación Angular y la revisión manual del navegador. No escriben en Firestore ni suben archivos a Cloudinary.

`npm test` ya existía, pero `angular.json` no define un objetivo `test`; por eso se usa este ejecutor independiente.

## Contrato para la edición de Marc

- `abrir(jugador)` copia los datos a los controles; `abrir(null)` reinicia el alta.
- `(guardar)` emite solo `DatosJugador`, sin id ni fechas. El padre llama a `actualizar(jugador.id, datos)`.
- El padre debe poner `guardando = true` al empezar y `false` al terminar, también ante errores. Tras el éxito, primero libera `guardando` y después llama a `cerrar()`.
- El formulario bloquea guardar, cerrar y Escape mientras se guarda o se sube un archivo. Cada instancia tiene identificadores propios para etiquetas y errores.
- Foto y vídeo son opcionales según las reglas actuales. Si no se sustituyen, se conservan sus URL. Las vistas previas, validación y subida las proporciona el componente existente de Marc.
- Puede proyectarse un mensaje de error dentro del diálogo; el alta lo usa para que el fallo siga visible en la ventana modal.

## Verificación manual

1. Activa Node 24.22.0 (`nvm use 24.22.0`) y ejecuta `npm start`.
2. Abre la dirección local indicada y pulsa **Nuevo**.
3. Pulsa **Guardar jugador** sin completar campos: aparecen los errores, sin enviar datos.
4. Comprueba los límites indicados y que cancelar y reabrir limpia el formulario.
5. Para verificar un alta real, completa todos los campos y las tres estadísticas. Seleccionar foto o vídeo inicia una subida real a Cloudinary; guardar datos válidos escribe en el Firestore configurado. Realiza estos pasos únicamente en el entorno y con los datos de prueba acordados por el equipo.
6. Durante las subidas, Guardar debe estar bloqueado. Tras guardar correctamente, aparece el aviso, se cierra el diálogo y el jugador llega al listado por su escucha reactiva, sin recargar. Un doble clic no debe generar dos altas.

La integración de edición en la ficha y la verificación con servicios reales quedan fuera de estas pruebas.

## Validación de referencias multimedia

`referenciaMultimedia(tipo)` se aplica a ambos controles, junto al máximo de 1000 caracteres. Admite la cadena vacía, URL HTTPS absolutas de Cloudinary u otros dominios válidos (sin credenciales y con una ruta de recurso), y las rutas locales:

- Foto: `assets/img/jugadores/<nombre>.jpg`, `.jpeg`, `.png` o `.webp`.
- Vídeo: `assets/videos/<nombre>.mp4` o `.webm`.

Las rutas locales pueden empezar por `/` o `./`; los nombres admiten letras, números, guiones y guiones bajos. No se admiten navegación `..`, otras carpetas, espacios, barras invertidas, valores no textuales, URL malformadas ni esquemas distintos de HTTPS. Las URL remotas pueden incluir parámetros y no requieren extensión, para conservar la compatibilidad con CDN y URL firmadas. El validador conserva el texto original; comprueba sintaxis y rutas permitidas, sin verificar la disponibilidad o el contenido del recurso en la red.

Las pruebas adicionales verifican todos los recursos iniciales y conectan los outputs reales de `SubidaArchivoComponent` con el formulario, usando `ArchivosService` simulado. Cubren éxito, referencia devuelta inválida o indefinida y rechazo de la subida. Tras un fallo se conserva el recurso anterior o el campo vacío opcional; no se emite una referencia parcial. El contrato compartido con Marc permanece intacto.
