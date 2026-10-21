import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  Injector,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { PlayersComponent } from './components/players/players.component';
import { DetailComponent } from './components/detail/detail.component';
import { MediaComponent } from './components/media/media.component';
import { Jugador } from './models/jugador.model';
import { JUGADORES } from './data/jugadores.data';

@Component({
  selector: 'app-root',
  imports: [NgIf, HeaderComponent, PlayersComponent, DetailComponent, MediaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  nombreEquipo = 'EQUIPO BASKET';
  totalJugadores = JUGADORES.length;

  // Jugador elegido en el listado (null = ninguno)
  jugadorActual: Jugador | null = null;
  // En móvil la ficha es una hoja que sube y baja: se cierra antes de quitar al jugador
  fichaAbierta = false;

  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private cierrePendiente?: number;

  // Lo llama PlayersComponent mediante su @Output (jugadorSeleccionado)
  onJugadorSeleccionado(jugador: Jugador): void {
    clearTimeout(this.cierrePendiente);
    this.jugadorActual = jugador;
    this.fichaAbierta = true;
    // En móvil y tableta la ficha cubre la pantalla: la página de detrás no se desplaza
    if (this.esMovil()) document.body.style.overflow = 'hidden';
  }

  // Lo llama DetailComponent mediante su @Output (cerrar)
  onCerrarDetalle(): void {
    const id = this.jugadorActual?.id;
    this.fichaAbierta = false;
    document.body.style.overflow = '';
    const terminar = () => {
      this.jugadorActual = null;
      this.cdr.markForCheck();
      // El botón de cerrar desaparece: el foco vuelve al jugador del listado (teclado y lectores)
      this.despuesDePintar(() => document.getElementById(`jugador-${id}`)?.focus());
    };
    // En móvil se espera a que la hoja termine de bajar (0,55 s) para quitar la ficha
    if (this.esMovil() && !this.movimientoReducido()) {
      this.cierrePendiente = window.setTimeout(terminar, 550);
    } else {
      terminar();
    }
  }

  // Si la ventana pasa de móvil a escritorio con la ficha abierta, la página vuelve a desplazarse
  @HostListener('window:resize')
  alCambiarTamano(): void {
    document.body.style.overflow = this.fichaAbierta && this.esMovil() ? 'hidden' : '';
  }

  private despuesDePintar(accion: () => void): void {
    afterNextRender(accion, { injector: this.injector });
  }

  private esMovil(): boolean {
    return window.matchMedia('(max-width: 991.98px)').matches;
  }

  // Sin animación si el usuario lo ha pedido en su sistema (movimiento reducido)
  private movimientoReducido(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
