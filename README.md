# EQUIPO BASKET · Producto 2

**Accediendo desde cualquier lugar.** Evolución del Producto 1: la plantilla del equipo deja de estar en un array local y pasa a una base de datos en la nube, **Cloud Firestore** (Firebase). La aplicación, una SPA con **Angular 22** y **Bootstrap 5.3**, lee los jugadores en tiempo real y permite añadirlos, editarlos y borrarlos; cualquier cambio aparece al instante en todos los navegadores, sin recargar.

## Equipo · Front Stack Attack

| Persona   | Rol en el Producto 2                                     | Nombre               |
| --------- | -------------------------------------------------------- | -------------------- |
| Persona 1 | Coordinación, Firebase, datos en la nube e integración   | Erick Coll Rodríguez |
| Persona 2 | Listado conectado: borrar y actualización en tiempo real | Jacobo Barrera Toba  |
| Persona 3 | Ficha: edición de todos los campos                       | Marc Pérez Rodríguez |
| Persona 4 | Alta de jugadores y subida de foto y vídeo               | Carles Miguel Millán |

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

## Tecnologías

- Angular 22 (componentes standalone, `*ngFor`, `*ngIf`, `@Input`, `@Output`, proyección con `<ng-content>`, pipe propio, RxJS)
- Firebase 13: Cloud Firestore con escucha en tiempo real (`onSnapshot`)
- Bootstrap 5.3.8 en modo oscuro + Bootstrap Icons
- Tipografías Chakra Petch, Inter y JetBrains Mono (Google Fonts)

## Créditos

Las fotografías de la plantilla inicial proceden de Wikimedia Commons y los vídeos, de YouTube. Sus autores, licencias y orígenes se consultan en la aplicación (ventana «Créditos de fotografías» y enlace bajo cada vídeo) y en [`src/app/data/creditos.data.ts`](src/app/data/creditos.data.ts).
