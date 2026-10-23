import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
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
export class PlayersComponent implements OnChanges {
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

  // Conecta esta propiedad con el <dialog #confirmacion> del HTML.
  @ViewChild('confirmacion', { static: true }) confirmacion!: ElementRef<HTMLDialogElement>;

  // Servicios compartidos: acceso a Firestore y avisos de éxito o error.
  private readonly jugadoresService = inject(JugadoresService);
  private readonly avisos = inject(AvisosService);

  // Tiempo real: si otra persona borra al jugador mientras aquí se pide la confirmación,
  // la ventana se cierra sola porque ya no queda nada que borrar.
  ngOnChanges(): void {
    const pendiente = this.jugadorABorrar;
    if (!pendiente || !this.confirmacion.nativeElement.open) return;
    if (this.jugadores.some((jugador) => jugador.id === pendiente.id)) return;
    this.confirmacion.nativeElement.close();
    this.avisos.error(
      `${pendiente.nombre} ${pendiente.apellidos} ya no está en la plantilla: lo acaban de borrar desde otro dispositivo.`,
    );
  }

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

  // Firestore borra primero en este navegador (la lista se actualiza al momento, también sin
  // conexión) y después espera a que el servidor lo confirme. Por eso la ventana se cierra antes
  // de esperar: sin red no se queda bloqueada, y el aviso llega cuando responde el servidor.
  async confirmarBorrado(): Promise<void> {
    const jugador = this.jugadorABorrar;
    if (!jugador) return;

    const nombre = `${jugador.nombre} ${jugador.apellidos}`;
    this.confirmacion.nativeElement.close();
    this.enfocarVecino(jugador);
    try {
      // Solo se borra en Firestore: la escucha existente actualizará el listado.
      await this.jugadoresService.borrar(jugador.id);
      this.avisos.exito(`${nombre} se ha borrado de la plantilla.`);
    } catch {
      // Si el servidor lo rechaza, Firestore devuelve el jugador a la lista
      this.avisos.error(
        `No se ha podido borrar a ${nombre}. Comprueba la conexión e inténtalo de nuevo.`,
      );
    }
  }

  // La tarjeta borrada desaparece: el foco pasa al jugador de al lado (o al buscador si no queda
  // ninguno) para que quien usa el teclado o un lector de pantalla no pierda su sitio en la lista.
  private enfocarVecino(jugador: Jugador): void {
    const fila = document.getElementById(`jugador-${jugador.id}`)?.closest('li');
    const vecina = (fila?.nextElementSibling ?? fila?.previousElementSibling)?.querySelector(
      '.tarjeta',
    );
    ((vecina as HTMLElement | null) ?? document.getElementById('buscar-jugador'))?.focus();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.posicionSeleccionada = '';
    this.rangoEdad = '';
  }
}
