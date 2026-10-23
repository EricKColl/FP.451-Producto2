import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Jugador, POSICIONES } from '../../models/jugador.model';
import { FiltroJugadoresPipe } from '../../pipes/filtro-jugadores-pipe';
import { CreditosComponent } from '../creditos/creditos.component';
import { NuevoJugadorComponent } from '../nuevo-jugador/nuevo-jugador.component';

@Component({
  selector: 'app-players',
  imports: [
    NgFor,
    NgIf,
    DecimalPipe,
    FormsModule,
    FiltroJugadoresPipe,
    CreditosComponent,
    NuevoJugadorComponent,
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PlayersComponent {
  // CONTRATO (no cambiar nombres)
  // Plantilla en tiempo real que App recibe de Firestore
  @Input({ required: true }) jugadores: Jugador[] = [];
  @Input() cargando = false;
  @Input() errorConexion = false;
  @Input() idSeleccionado: string | null = null;
  @Output() jugadorSeleccionado = new EventEmitter<Jugador>();

  posiciones = POSICIONES;
  textoBusqueda = '';
  posicionSeleccionada = '';
  rangoEdad = '';
  fotosNoDisponibles = new Set<string>();

  // Jugador al que corresponde la papelera pulsada; todavía no se borra nada.
  jugadorABorrar: Jugador | null = null;

  // Conecta esta propiedad con el <dialog #confirmacion> del HTML.
  @ViewChild('confirmacion', { static: true }) confirmacion!: ElementRef<HTMLDialogElement>;

  // Firestore entrega objetos nuevos en cada cambio: con el id, Angular reutiliza las tarjetas
  // que ya existen y la lista no se redibuja entera (no pierde el desplazamiento ni el foco)
  porId(_: number, jugador: Jugador): string {
    return jugador.id;
  }

  marcarFotoNoDisponible(id: string): void {
    this.fotosNoDisponibles.add(id);
  }

  seleccionar(jugador: Jugador): void {
    this.jugadorSeleccionado.emit(jugador);
  }

  // Primero recordamos el jugador y después abrimos la ventana de confirmación.
  pedirBorrado(jugador: Jugador): void {
    this.jugadorABorrar = jugador;
    this.confirmacion.nativeElement.showModal();
  }

  cancelarBorrado(): void {
    this.confirmacion.nativeElement.close();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.posicionSeleccionada = '';
    this.rangoEdad = '';
  }
}
