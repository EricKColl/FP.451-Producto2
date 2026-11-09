import { Injectable, signal } from '@angular/core';

// exito y error: resultado de una acción propia. info: algo que ha pasado en otro dispositivo.
export type TipoAviso = 'exito' | 'error' | 'info';

// Botón dentro del aviso, por ejemplo «Deshacer» tras un borrado
export interface AccionAviso {
  texto: string;
  icono?: string;
  ejecutar: () => void;
}

export interface OpcionesAviso {
  // Si ya hay un aviso con la misma clave, se sustituye en lugar de añadir otro
  clave?: string;
  accion?: AccionAviso;
  duracion?: number;
}

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  texto: string;
  duracion: number;
  clave?: string;
  accion?: AccionAviso;
}

const DURACION: Record<TipoAviso, number> = { exito: 5000, info: 6000, error: 9000 };

// Mensajes breves que aparecen en una esquina de la pantalla y se cierran solos
// ("Jugador añadido", "No se ha podido borrar"...). Los muestra AvisosComponent.
// Uso desde cualquier componente: inject(AvisosService).exito('Texto del mensaje');
@Injectable({ providedIn: 'root' })
export class AvisosService {
  // Lista de avisos visibles. Es una señal: la vista se actualiza sola cuando cambia.
  readonly avisos = signal<Aviso[]>([]);
  private siguienteId = 1;
  private readonly temporizadores = new Map<number, ReturnType<typeof setTimeout>>();

  exito(texto: string, opciones?: OpcionesAviso): void {
    this.mostrar('exito', texto, opciones);
  }

  // Los errores duran más en pantalla para que dé tiempo a leerlos
  error(texto: string, opciones?: OpcionesAviso): void {
    this.mostrar('error', texto, opciones);
  }

  info(texto: string, opciones?: OpcionesAviso): void {
    this.mostrar('info', texto, opciones);
  }

  cerrar(id: number): void {
    clearTimeout(this.temporizadores.get(id));
    this.temporizadores.delete(id);
    this.avisos.update((lista) => lista.filter((aviso) => aviso.id !== id));
  }

  // Pulsar la acción la ejecuta y cierra el aviso
  ejecutar(aviso: Aviso): void {
    this.cerrar(aviso.id);
    aviso.accion?.ejecutar();
  }

  private mostrar(tipo: TipoAviso, texto: string, opciones: OpcionesAviso = {}): void {
    const duracion = opciones.duracion ?? DURACION[tipo];
    const anterior = opciones.clave
      ? this.avisos().find((aviso) => aviso.clave === opciones.clave)
      : undefined;
    if (anterior) this.cerrar(anterior.id);
    const id = this.siguienteId++;
    const aviso: Aviso = {
      id,
      tipo,
      texto,
      duracion,
      clave: opciones.clave,
      accion: opciones.accion,
    };
    this.avisos.update((lista) => [...lista, aviso]);
    this.temporizadores.set(
      id,
      setTimeout(() => this.cerrar(id), duracion),
    );
  }
}
