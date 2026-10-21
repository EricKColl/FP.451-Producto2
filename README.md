# EQUIPO BASKET · Producto 1

Aplicación de una sola página (SPA) hecha con **Angular 22** y **Bootstrap 5.3** para gestionar la plantilla de un equipo de baloncesto: listado de jugadores con buscador y filtros, ficha de detalle y reproductor de vídeo.

## Equipo

| Persona | Rol | Nombre |
|---|---|---|
| Persona 1 | Coordinación técnica e integración | Erick Coll Rodríguez |
| Persona 2 | Datos + listado (PlayersComponent) + arquetipos | Jacobo Barrera Toba |
| Persona 3 | Detalle (DetailComponent) + pipe de filtros + mockup | Marc Pérez Rodríguez |
| Persona 4 | Reproductor (MediaComponent) + multimedia + documentación | Carles Miguel Millán |

## Enlaces

- **Proyecto funcionando (StackBlitz):** https://stackblitz.com/github/EricKColl/FP.451-Producto1/tree/main
  Compila el proyecto en el navegador a partir de la rama `main` (siempre la última versión). No necesita cuenta; la primera carga tarda 1-2 minutos.
- **Planificación (Trello):** https://trello.com/b/NjFDvrUe/fp451-p-des-front-end-con-frameworks-avanz-en-ent-m%C3%B3v
  Tareas con responsable, estimación en horas, fecha límite y checklist. Acceso para el equipo y el consultor.
- **Diseño (Figma, solo lectura):**
  - Mockup inicial (v1): https://www.figma.com/design/XtkbScgwVmwlDfgapRlTqH/EQUIPO-BASKET-%E2%80%93-Mockup
  - Rediseño final (v2), con wireframe, mockup navegable y guía de estilo: https://www.figma.com/design/R25EESVjPwe5I7SFRQWKsh/EQUIPO-BASKET-%E2%80%93-Mockup-definitivo

## Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable y entregable. Solo recibe cambios desde `develop`. |
| `develop` | Integración. Aquí se unen las ramas de cada integrante mediante Pull Request. |
| `feature/erick-coll` | Trabajo de Erick |
| `feature/jacobo-barrera` | Trabajo de Jacobo |
| `feature/marc-perez` | Trabajo de Marc |
| `feature/carles-miguel` | Trabajo de Carles |

Flujo: cada uno trabaja en su rama → Pull Request a `develop` → cuando `develop` está probado, Pull Request de `develop` a `main`.

## Cómo arrancarlo

Requisitos: Node.js 24 LTS (24.15 o superior) y Angular CLI 22.

```bash
npm install
ng serve -o
```

Se abre en http://localhost:4200.

> No uses la extensión **Live Server** de VS Code: la página saldría en blanco porque Angular necesita compilarse. Arráncalo siempre con `ng serve` (o `npm start`).

## Tecnologías

- Angular 22 (componentes standalone, `*ngFor`, `*ngIf`, `@Input`, `@Output`, proyección con `<ng-content>`, pipe propio)
- Bootstrap 5.3.8 en modo oscuro (rejilla, formularios, pestañas y utilidades) + Bootstrap Icons
- Tipografías Chakra Petch, Inter y JetBrains Mono (Google Fonts)

## Créditos

Las fotografías de los jugadores proceden de Wikimedia Commons. Sus autores y licencias se consultan en la ventana «Créditos de fotografías» que se abre desde el listado; los datos están en [`src/app/data/creditos.data.ts`](src/app/data/creditos.data.ts).
