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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './components/header/header.component';
import { PlayersComponent } from './components/players/players.component';
import { DetailComponent } from './components/detail/detail.component';
import { MediaComponent } from './components/media/media.component';
import { AvisosComponent } from './components/avisos/avisos.component';
import { Jugador } from './models/jugador.model';
import { JugadoresService } from './services/jugadores.service';

@Component({
  selector: 'app-root',
  imports: [
    NgIf,
    HeaderComponent,
    PlayersComponent,
    DetailComponent,
    MediaComponent,
    AvisosComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  nombreEquipo = 'EQUIPO BASKET';

  // Plantilla en tiempo real desde Cloud Firestore (JugadoresService)
  jugadores: Jugador[] = [];
  cargando = true;
  errorConexion = false;

  // Jugador elegido en el listado (null = ninguno)
  jugadorActual: Jugador | null = null;
  // En móvil la ficha es una hoja que sube y baja: se cierra antes de quitar al jugador
  fichaAbierta = false;

  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private cierrePendiente?: number;

  constructor() {
    // Suscripción a la colección «jugadores»: se cancela sola al destruirse la aplicación
    inject(JugadoresService)
      .jugadores$.pipe(takeUntilDestroyed())
      .subscribe({
        next: (lista) => this.alRecibirPlantilla(lista),
        error: () => {
          this.cargando = false;
          this.errorConexion = true;
          this.cdr.markForCheck();
        },
      });
  }

  get totalJugadores(): number {
    return this.jugadores.length;
  }

  // Cada cambio en Firestore llega aquí. Si cambian los datos del jugador abierto, su ficha
  // se actualiza sin recargar; si el jugador se ha borrado, la ficha se cierra.
  private alRecibirPlantilla(lista: Jugador[]): void {
    this.jugadores = lista;
    this.cargando = false;
    this.errorConexion = false;
    const actual = this.jugadorActual;
    if (actual) {
      const nuevo = lista.find((j) => j.id === actual.id);
      if (!nuevo) {
        if (this.fichaAbierta) this.onCerrarDetalle();
        else this.jugadorActual = null;
      } else if (JSON.stringify(nuevo) !== JSON.stringify(actual)) {
        // Solo se sustituye si ha cambiado: así la ficha y el vídeo no se reinician sin motivo
        this.jugadorActual = nuevo;
      }
    }
    this.cdr.markForCheck();
  }

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
