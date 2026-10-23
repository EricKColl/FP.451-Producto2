import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
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
import { JugadoresService } from '../../services/jugadores.service';
import { AvisosService } from '../../services/avisos.service';

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

  // Jugador al que corresponde la papelera pulsada.
  jugadorABorrar: Jugador | null = null;
  // Mientras Firebase responde, se bloquean los botones para evitar peticiones repetidas.
  borrando = false;

  // Conecta esta propiedad con el <dialog #confirmacion> del HTML.
  @ViewChild('confirmacion', { static: true }) confirmacion!: ElementRef<HTMLDialogElement>;

  // Angular nos proporciona los servicios compartidos que ya preparó Erick.
  private readonly jugadoresService = inject(JugadoresService);
  private readonly avisos = inject(AvisosService);
  private readonly cdr = inject(ChangeDetectorRef);

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
    if (this.borrando) return;
    this.confirmacion.nativeElement.close();
  }

  // Escape cierra normalmente; solo se impide mientras Firebase procesa el borrado.
  alCancelarConfirmacion(evento: Event): void {
    if (this.borrando) evento.preventDefault();
  }

  async confirmarBorrado(): Promise<void> {
    const jugador = this.jugadorABorrar;
    if (!jugador || this.borrando) return;

    const nombre = `${jugador.nombre} ${jugador.apellidos}`;
    this.borrando = true;
    try {
      // Solo se borra en Firestore: la escucha existente actualizará el listado.
      await this.jugadoresService.borrar(jugador.id);
      this.confirmacion.nativeElement.close();
      this.avisos.exito(`${nombre} se ha borrado de la plantilla.`);
    } catch {
      this.avisos.error(
        `No se ha podido borrar a ${nombre}. Comprueba la conexión e inténtalo de nuevo.`,
      );
    } finally {
      this.borrando = false;
      // Pedimos a Angular que refleje el estado final tras la respuesta asíncrona.
      this.cdr.markForCheck();
    }
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.posicionSeleccionada = '';
    this.rangoEdad = '';
  }
}
