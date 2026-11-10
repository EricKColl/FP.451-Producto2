import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MiniaturaPipe } from '../../pipes/miniatura.pipe';

// Visor de la foto del jugador a pantalla completa. Un clic (o toque) amplía la foto en el punto
// pulsado y, ampliada, se recorre moviendo el puntero; otro clic la devuelve a su tamaño.
// Es una ventana <dialog>: Escape la cierra y el foco vuelve al botón que la abrió.
@Component({
  selector: 'app-visor-foto',
  imports: [MatTooltipModule, MiniaturaPipe],
  templateUrl: './visor-foto.component.html',
  styleUrl: './visor-foto.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class VisorFotoComponent {
  @Input({ required: true }) foto = '';
  @Input() nombre = '';
  @Input() pie = '';
  @ViewChild('visor', { static: true }) visor!: ElementRef<HTMLDialogElement>;

  abierto = false;
  ampliada = false;
  origen = '50% 50%';
  private readonly cdr = inject(ChangeDetectorRef);

  abrir(): void {
    this.abierto = true;
    this.ampliada = false;
    this.origen = '50% 50%';
    this.visor.nativeElement.showModal();
    this.cdr.markForCheck();
  }

  cerrar(): void {
    this.visor.nativeElement.close();
  }

  // Clic fuera de la foto (en el fondo de la ventana): se cierra, como en cualquier visor
  alPulsarFondo(evento: MouseEvent): void {
    if (evento.target === this.visor.nativeElement) this.cerrar();
  }

  alternarZoom(evento: MouseEvent): void {
    this.moverOrigen(evento);
    this.ampliada = !this.ampliada;
  }

  alternarZoomTeclado(): void {
    this.origen = '50% 50%';
    this.ampliada = !this.ampliada;
  }

  // Con la foto ampliada, el punto de ampliación sigue al puntero
  moverOrigen(evento: MouseEvent): void {
    const caja = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((evento.clientX - caja.left) / caja.width) * 100;
    const y = ((evento.clientY - caja.top) / caja.height) * 100;
    this.origen = `${Math.min(100, Math.max(0, x)).toFixed(1)}% ${Math.min(100, Math.max(0, y)).toFixed(1)}%`;
  }
}
