import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DatosJugador, Jugador } from '../../models/jugador.model';

// Ventana con el formulario de un jugador: sirve para el alta (Nuevo jugador)
// y para la edición (botón Editar de la ficha).
// PERSONA 4 (Carles) completa este componente: campos, validaciones y mensajes de error.
@Component({
  selector: 'app-formulario-jugador',
  imports: [],
  templateUrl: './formulario-jugador.component.html',
  styleUrl: './formulario-jugador.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioJugadorComponent {
  // CONTRATO (no cambiar nombres)
  // ENTRADA: true mientras el componente padre guarda en Firestore (botón Guardar desactivado)
  @Input() guardando = false;
  // SALIDA: datos completos y válidos del jugador; el padre los guarda en Firestore
  @Output() guardar = new EventEmitter<DatosJugador>();

  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;

  // null = alta de un jugador nuevo; con datos = edición de ese jugador
  jugador: Jugador | null = null;

  // Abre la ventana: vacía para un alta o con los datos del jugador para editarlo
  abrir(jugador: Jugador | null): void {
    this.jugador = jugador;
    this.dialogo.nativeElement.showModal();
  }

  cerrar(): void {
    this.dialogo.nativeElement.close();
  }
}
