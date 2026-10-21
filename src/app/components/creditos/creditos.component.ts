import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { Credito } from '../../models/credito.model';
import { Jugador } from '../../models/jugador.model';
import { CREDITOS, fotoOriginal } from '../../data/creditos.data';

interface FilaCredito extends Credito {
  jugador: Jugador;
}

// Ventana de créditos de las fotografías. Usa el <dialog> nativo del navegador:
// Escape para cerrar, foco atrapado dentro y el resto de la página inactiva.
@Component({
  selector: 'app-creditos',
  imports: [NgFor],
  templateUrl: './creditos.component.html',
  styleUrl: './creditos.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class CreditosComponent {
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;

  // Plantilla actual (Firestore): solo se acreditan las fotos originales que siguen en uso
  @Input() jugadores: Jugador[] = [];

  get filas(): FilaCredito[] {
    return CREDITOS.flatMap((credito) => {
      const jugador = this.jugadores.find((j) => j.id === credito.idJugador);
      return jugador && jugador.foto === fotoOriginal(jugador.id) ? [{ ...credito, jugador }] : [];
    });
  }

  private origen: HTMLElement | null = null;

  abrir(): void {
    this.origen = document.activeElement as HTMLElement | null;
    this.dialogo.nativeElement.showModal();
  }

  cerrar(): void {
    this.dialogo.nativeElement.close();
  }

  // Un clic en el fondo oscuro (fuera de la ventana) también la cierra
  alPulsar(evento: MouseEvent): void {
    if (evento.target === this.dialogo.nativeElement) this.cerrar();
  }

  // Al cerrar, el foco vuelve al botón que abrió la ventana
  alCerrar(): void {
    this.origen?.focus();
    this.origen = null;
  }

  // "Maryland GovPics; fotógrafo Scott Henderson" → "Maryland GovPics · fotógrafo Scott Henderson"
  autor(credito: Credito): string {
    return credito.autor.replace('; ', ' · ');
  }
}
