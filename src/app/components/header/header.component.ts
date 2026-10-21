import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HeaderComponent {
  // Datos que le pasa el componente padre (App)
  @Input() nombreEquipo = '';
  @Input() totalJugadores = 0;

  // "EQUIPO BASKET" → "EQUIPO" en plata y "BASKET" en cian
  get primeraParte(): string {
    const palabras = this.nombreEquipo.trim().split(/\s+/);
    return palabras.length > 1 ? palabras.slice(0, -1).join(' ') : '';
  }

  get ultimaPalabra(): string {
    return this.nombreEquipo.trim().split(/\s+/).pop() ?? '';
  }
}
