import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { confirmadaATiempo, JugadoresService } from '../../services/jugadores.service';
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
    const nombre = `${datos.nombre} ${datos.apellidos}`;
    try {
      const escritura = this.jugadores.crear(datos);
      if (await confirmadaATiempo(escritura)) {
        this.avisos.exito(`${nombre} se ha añadido a la plantilla.`);
        this.mostrarEnLista(await escritura);
      } else {
        // Sin conexión: el jugador ya está en la lista de este navegador y Firestore lo enviará solo
        this.avisos.error(
          `Sin conexión: ${nombre} ya está en la lista y se guardará al volver la conexión. No cierres esta pestaña.`,
        );
        escritura.then(
          () => this.avisos.exito(`${nombre} se ha añadido a la plantilla.`),
          () => this.avisos.error(`No se ha podido guardar a ${nombre}. Vuelve a añadirlo.`),
        );
      }
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

  // La plantilla puede ser larga: la lista se desplaza hasta el jugador recién añadido
  private mostrarEnLista(id: string): void {
    setTimeout(() =>
      globalThis.document?.getElementById(`jugador-${id}`)?.scrollIntoView({ block: 'nearest' }),
    );
  }
}
