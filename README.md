# EQUIPO BASKET · Producto 2

**Accediendo desde cualquier lugar.** Evolución del Producto 1: la plantilla del equipo deja de estar en un array local y pasa a una base de datos en la nube, **Cloud Firestore** (Firebase). La aplicación, una SPA con **Angular 22** y **Bootstrap 5.3**, lee los jugadores en tiempo real y permite añadirlos, editarlos y borrarlos; cualquier cambio aparece al instante en todos los navegadores, sin recargar.

## Equipo · Front Stack Attack

| Persona   | Rol en el Producto 2                                        | Nombre               |
| --------- | ----------------------------------------------------------- | -------------------- |
| Persona 1 | Coordinación, Firebase, servidor de archivos e integración  | Erick Coll Rodríguez |
| Persona 2 | Listado conectado: borrar y actualización en tiempo real    | Jacobo Barrera Toba  |
| Persona 3 | Ficha: edición de todos los campos y subida de foto y vídeo | Marc Pérez Rodríguez |
| Persona 4 | Alta de jugadores: formulario común y validaciones          | Carles Miguel Millán |

## Qué se puede hacer

- **Consultar la plantilla** con buscador y filtros por posición y edad; la lista llega de Firestore y se actualiza sola.
- **Borrar** un jugador con la papelera de su tarjeta, tras confirmarlo en una ventana.
- **Añadir** un jugador con el botón **Nuevo**: formulario con todos los campos, obligatorios y con rangos, y un mensaje de error en cada campo.
- **Editar** cualquier dato desde la ficha con el botón **Editar**, con el mismo formulario.
- **Subir la foto y el vídeo** desde el ordenador, con vista previa y barra de progreso, al dar de alta o al editar.
- **Avisos** de éxito y de error en todas las acciones. Sin conexión, los cambios se ven al momento y se guardan cuando vuelve la red.

### Mejoras

- **Tiempo real visible:** indicador de conexión en la cabecera (en directo, sincronizando, sin conexión) y la tarjeta que cambia en otro dispositivo se ilumina con un aviso.
- **Deshacer un borrado** desde el propio aviso, durante 8 segundos.
- **Panel del equipo** con las cifras de la plantilla en directo: medias de puntos, rebotes, asistencias, altura y edad, líderes y reparto por posición.
- **Visor de fotos** a pantalla completa y **miniaturas** optimizadas por Cloudinary.
- **Arrastrar y soltar** la foto o el vídeo en el formulario.
- **Aplicación instalable** (PWA): se instala en el ordenador o el móvil y abre la plantilla **sin conexión**.
- **Arranque rápido:** carga diferida de la ficha, transición de la tarjeta a la ficha y esqueletos mientras llegan los datos.

## Enlaces

- **Aplicación publicada (Firebase Hosting):** https://equipo-basket-producto2-ee9e1.web.app
  Compilación de producción de la rama `main`, instalable y con funcionamiento sin conexión.
- **Proyecto funcionando (StackBlitz):** https://stackblitz.com/~/github.com/EricKColl/FP.451-Producto2/tree/main
  Compila el proyecto en el navegador a partir de la rama `main`. No necesita cuenta; la primera carga tarda 1-2 minutos.
  El enlace clásico (https://stackblitz.com/github/EricKColl/FP.451-Producto2/tree/main) abre el mismo proyecto, pero desde el 10/11/2026 su importador se queda en «Cloning repo from GitHub».
- **Planificación (Trello):** https://trello.com/b/NjFDvrUe/fp451-p-des-front-end-con-frameworks-avanz-en-ent-m%C3%B3v
- **Diseño (Figma, solo lectura):** https://www.figma.com/design/R25EESVjPwe5I7SFRQWKsh/EQUIPO-BASKET-%E2%80%93-Mockup-definitivo

## Firebase

| Elemento            | Valor                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Proyecto            | `equipo-basket-producto2-ee9e1` (plan Spark, gratuito)                                     |
| Base de datos       | Cloud Firestore, edición Standard, ubicación `europe-southwest1` (Madrid)                  |
| Colección           | `jugadores`: un documento por jugador, con todos los campos del modelo `Jugador`           |
| Reglas de seguridad | [`firebase/firestore.rules`](firebase/firestore.rules): lectura libre y escritura validada |
| Conexión            | SDK oficial de Firebase (`firebase` 13), en [`src/app/firebase.ts`](src/app/firebase.ts)   |
| Servicio de datos   | [`src/app/services/jugadores.service.ts`](src/app/services/jugadores.service.ts)           |

La configuración de [`src/environments/environment.ts`](src/environments/environment.ts) identifica el proyecto y es pública por diseño; lo que protege los datos son las reglas de Firestore.

### Restaurar la plantilla inicial

Los 10 jugadores de partida están en [`firebase/jugadores-iniciales.json`](firebase/jugadores-iniciales.json), con las fuentes de cada dato.

```bash
npm run datos:cargar                  # carga los 10 jugadores si la colección está vacía
npm run datos:cargar -- --reiniciar   # borra la colección y vuelve a cargar los 10
npm run datos:prueba                  # añade un jugador de prueba (bórralo al terminar)
```

## Fotos y vídeos (Cloudinary)

Firebase Storage exige el plan de pago Blaze y la UOC no dispone de planes de Firebase, así que los archivos se guardan en **Cloudinary** (plan gratuito), con la aprobación del consultor. En Firestore solo se guarda la dirección (URL) de cada archivo.

| Elemento | Valor                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Cuenta   | `cfto2t9j`, con el preajuste de subida sin firma `equipo-basket` (carpetas `fotos` y `videos`)            |
| Formatos | Foto: JPG, PNG o WebP de hasta 5 MB. Vídeo: MP4 o WebM de hasta 40 MB                                     |
| Servicio | [`src/app/services/archivos.service.ts`](src/app/services/archivos.service.ts): `validar()` y `subir()`   |
| Interfaz | [`src/app/components/subida-archivo`](src/app/components/subida-archivo): elegir, vista previa y progreso |

## Ramas

| Rama                     | Uso                                                                           |
| ------------------------ | ----------------------------------------------------------------------------- |
| `main`                   | Versión estable y entregable. Protegida: solo recibe cambios desde `develop`. |
| `develop`                | Integración. Aquí se unen las ramas de cada integrante mediante Pull Request. |
| `feature/erick-coll`     | Trabajo de Erick                                                              |
| `feature/jacobo-barrera` | Trabajo de Jacobo                                                             |
| `feature/marc-perez`     | Trabajo de Marc                                                               |
| `feature/carles-miguel`  | Trabajo de Carles                                                             |

Flujo: cada uno trabaja en su rama → Pull Request a `develop` → cuando `develop` está probado, Pull Request de `develop` a `main`.

## Cómo arrancarlo

Requisitos: Node.js 24 LTS (24.15 o superior) y Angular CLI 22.

```bash
npm install
ng serve -o
```

Se abre en http://localhost:4200 y se conecta directamente a la base de datos de Firebase.

> No uses la extensión **Live Server** de VS Code: la página saldría en blanco porque Angular necesita compilarse. Arráncalo siempre con `ng serve` (o `npm start`).

La aplicación instalable y el modo sin conexión solo se activan en la compilación de producción (en `ng serve` el Service Worker está desactivado).

### Publicar en Firebase Hosting

La configuración está en [`firebase.json`](firebase.json) (carpeta publicada, reglas de caché y cabeceras de seguridad) y el proyecto, en [`.firebaserc`](.firebaserc). Hace falta la herramienta de Firebase (`npm install -g firebase-tools`) y haber iniciado sesión con `firebase login`.

```bash
ng build
firebase deploy --only hosting
```

## Pruebas

Pruebas unitarias del formulario y del alta (lógica, sin navegador ni servicios reales):

```bash
node tests/carles/ejecutar.mjs
```

Las pruebas en navegador (tiempo real con varios navegadores, alta, edición, borrado, subida, móvil y compilación de producción) y sus resultados se recogen en el documento técnico del Producto 2.

## Tecnologías

- Angular 22 (componentes standalone, `*ngFor`, `*ngIf`, `@Input`, `@Output`, proyección con `<ng-content>`, pipe propio, RxJS y formularios reactivos)
- Firebase 13: Cloud Firestore con escucha en tiempo real (`onSnapshot`) y caché persistente para trabajar sin conexión
- Firebase Hosting: publicación de la compilación de producción
- Angular Material 22.2 con un tema propio: tooltips, efecto de pulsación y barra de progreso
- Angular Service Worker y manifiesto web: aplicación instalable y sin conexión
- Cloudinary: fotos y vídeos subidos desde el ordenador, con miniaturas optimizadas
- Ventanas `<dialog>` nativas, avisos con la API Popover y View Transitions API
- Bootstrap 5.3.8 en modo oscuro + Bootstrap Icons
- Tipografías Chakra Petch, Inter y JetBrains Mono (Google Fonts)

## Créditos

Las fotografías de la plantilla inicial proceden de Wikimedia Commons y los vídeos, de YouTube. Sus autores, licencias y orígenes se consultan en la aplicación (ventana «Créditos de fotografías» y enlace bajo cada vídeo) y en [`src/app/data/creditos.data.ts`](src/app/data/creditos.data.ts).
