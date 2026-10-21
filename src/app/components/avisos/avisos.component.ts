import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { NgFor } from '@angular/common';
import { AvisosService } from '../../services/avisos.service';

// Zona de avisos (esquina inferior derecha). Es un "popover": así se dibuja por encima
// de todo, también de las ventanas abiertas (formularios y confirmaciones).
@Component({
  selector: 'app-avisos',
  imports: [NgFor],
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AvisosComponent {
  @ViewChild('zona', { static: true }) zona!: ElementRef<HTMLElement>;

  readonly servicio = inject(AvisosService);

  constructor() {
    // Cada vez que cambia la lista: se muestra la zona si hay avisos y se oculta si no.
    // Se vuelve a mostrar con cada aviso para que quede encima de la última ventana abierta.
    effect(() => {
      const hayAvisos = this.servicio.avisos().length > 0;
      const zona = this.zona.nativeElement;
      if (zona.matches(':popover-open')) zona.hidePopover();
      if (hayAvisos) zona.showPopover();
    });
  }
}
