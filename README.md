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

## Enlaces

- **Proyecto funcionando (StackBlitz):** https://stackblitz.com/github/EricKColl/FP.451-Producto2/tree/main
  Compila el proyecto en el navegador a partir de la rama `main`. No necesita cuenta; la primera carga tarda 1-2 minutos.
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

## Pruebas

Pruebas unitarias del formulario y del alta (lógica, sin navegador ni servicios reales):

```bash
node tests/carles/ejecutar.mjs
```

Las pruebas en navegador (tiempo real con varios navegadores, alta, edición, borrado, subida, móvil y compilación de producción) y sus resultados se recogen en el documento técnico del Producto 2.

## Tecnologías

- Angular 22 (componentes standalone, `*ngFor`, `*ngIf`, `@Input`, `@Output`, proyección con `<ng-content>`, pipe propio, RxJS y formularios reactivos)
- Firebase 13: Cloud Firestore con escucha en tiempo real (`onSnapshot`)
- Cloudinary: fotos y vídeos subidos desde el ordenador
- Ventanas `<dialog>` nativas y avisos con la API Popover
- Bootstrap 5.3.8 en modo oscuro + Bootstrap Icons
- Tipografías Chakra Petch, Inter y JetBrains Mono (Google Fonts)

## Créditos

Las fotografías de la plantilla inicial proceden de Wikimedia Commons y los vídeos, de YouTube. Sus autores, licencias y orígenes se consultan en la aplicación (ventana «Créditos de fotografías» y enlace bajo cada vídeo) y en [`src/app/data/creditos.data.ts`](src/app/data/creditos.data.ts).
