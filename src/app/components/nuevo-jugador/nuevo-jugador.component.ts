import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DatosJugador } from '../../models/jugador.model';
import { FormularioJugadorComponent } from '../formulario-jugador/formulario-jugador.component';

// Botón «Nuevo» de la plantilla: abre el formulario vacío y guarda el jugador en Firestore.
// PERSONA 4 (Carles) completa este componente.
@Component({
  selector: 'app-nuevo-jugador',
  imports: [FormularioJugadorComponent],
  templateUrl: './nuevo-jugador.component.html',
  styleUrl: './nuevo-jugador.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class NuevoJugadorComponent {
  @ViewChild(FormularioJugadorComponent) formulario!: FormularioJugadorComponent;

  abrirFormulario(): void {
    this.formulario.abrir(null);
  }

  // PERSONA 4: guardar el jugador nuevo con JugadoresService.crear(datos)
  crearJugador(datos: DatosJugador): void {}
}
