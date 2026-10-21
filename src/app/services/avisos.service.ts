import { Injectable, signal } from '@angular/core';

export type TipoAviso = 'exito' | 'error';

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  texto: string;
}

// Mensajes breves que aparecen en una esquina de la pantalla y se cierran solos
// ("Jugador añadido", "No se ha podido borrar"...). Los muestra AvisosComponent.
// Uso desde cualquier componente: inject(AvisosService).exito('Texto del mensaje');
@Injectable({ providedIn: 'root' })
export class AvisosService {
  // Lista de avisos visibles. Es una señal: la vista se actualiza sola cuando cambia.
  readonly avisos = signal<Aviso[]>([]);
  private siguienteId = 1;

  exito(texto: string): void {
    this.mostrar('exito', texto, 5000);
  }

  // Los errores duran más en pantalla para que dé tiempo a leerlos
  error(texto: string): void {
    this.mostrar('error', texto, 9000);
  }

  cerrar(id: number): void {
    this.avisos.update((lista) => lista.filter((aviso) => aviso.id !== id));
  }

  private mostrar(tipo: TipoAviso, texto: string, duracion: number): void {
    const id = this.siguienteId++;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrar(id), duracion);
  }
}
