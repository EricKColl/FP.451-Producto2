import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { JugadoresService } from '../../services/jugadores.service';
import { AvisosService } from '../../services/avisos.service';
import { DatosJugador } from '../../models/jugador.model';
import { FormularioJugadorComponent } from '../formulario-jugador/formulario-jugador.component';

// Botón «Nuevo» de la plantilla: abre el formulario vacío y guarda el jugador en Firestore.
// El listado se actualiza mediante la escucha existente de Firestore.
@Component({
  selector: 'app-nuevo-jugador',
  imports: [FormularioJugadorComponent],
  templateUrl: './nuevo-jugador.component.html',
  styleUrl: './nuevo-jugador.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class NuevoJugadorComponent {
  @ViewChild(FormularioJugadorComponent) formulario!: FormularioJugadorComponent;

  guardando = false;
  errorGuardado = '';
  private readonly jugadores = inject(JugadoresService);
  private readonly avisos = inject(AvisosService);
  private readonly cdr = inject(ChangeDetectorRef);

  abrirFormulario(): void {
    if (this.guardando) return;
    this.errorGuardado = '';
    this.formulario.abrir(null);
  }

  async crearJugador(datos: DatosJugador): Promise<void> {
    if (this.guardando) return;
    this.errorGuardado = '';
    this.guardando = true;
    this.formulario.guardando = true;
    try {
      await this.jugadores.crear(datos);
      this.avisos.exito('Jugador añadido correctamente a la plantilla.');
      this.formulario.guardando = false;
      this.formulario.cerrar();
    } catch {
      this.errorGuardado =
        'No se ha podido añadir el jugador. Comprueba la conexión e inténtalo de nuevo.';
      this.avisos.error(this.errorGuardado);
    } finally {
      this.guardando = false;
      this.formulario.guardando = false;
      this.cdr.markForCheck();
    }
  }
}
