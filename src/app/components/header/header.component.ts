import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EstadoConexion } from '../../services/jugadores.service';

// Texto corto del indicador y explicación del tooltip para cada estado de la conexión
const ESTADOS: Record<EstadoConexion, { texto: string; ayuda: string }> = {
  conectando: { texto: 'Conectando', ayuda: 'Conectando con Cloud Firestore…' },
  'en-directo': {
    texto: 'En directo',
    ayuda: 'Conectado a Cloud Firestore: los cambios de cualquier dispositivo aparecen al momento.',
  },
  sincronizando: { texto: 'Guardando', ayuda: 'Enviando los últimos cambios a la nube…' },
  'sin-conexion': {
    texto: 'Sin conexión',
    ayuda:
      'Sin conexión: los cambios se guardan en este dispositivo y se enviarán al volver la red.',
  },
};

@Component({
  selector: 'app-header',
  imports: [MatProgressBarModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HeaderComponent {
  // Datos que le pasa el componente padre (App)
  @Input() nombreEquipo = '';
  @Input() totalJugadores = 0;
  // Mientras llega la plantilla de Firestore no se muestra el número (sería 0)
  @Input() cargando = false;
  // Estado de la conexión con Firestore (indicador «En directo»)
  @Input() conexion: EstadoConexion = 'conectando';

  get estado(): { texto: string; ayuda: string } {
    return ESTADOS[this.conexion];
  }

  // "EQUIPO BASKET" → "EQUIPO" en plata y "BASKET" en cian
  get primeraParte(): string {
    const palabras = this.nombreEquipo.trim().split(/\s+/);
    return palabras.length > 1 ? palabras.slice(0, -1).join(' ') : '';
  }

  get ultimaPalabra(): string {
    return this.nombreEquipo.trim().split(/\s+/).pop() ?? '';
  }
}
