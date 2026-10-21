// Posiciones posibles de un jugador. Se usan en los datos y en el desplegable del filtro.
export type Posicion = 'Base' | 'Escolta' | 'Alero' | 'Ala-pívot' | 'Pívot';

export const POSICIONES: Posicion[] = ['Base', 'Escolta', 'Alero', 'Ala-pívot', 'Pívot'];

// Estadísticas medias por partido.
export interface Estadisticas {
  puntos: number;
  rebotes: number;
  asistencias: number;
}

// "Molde" de un jugador: TODOS los jugadores deben tener exactamente estos campos.
export interface Jugador {
  id: number;
  nombre: string;
  apellidos: string;
  dorsal: number;
  posicion: Posicion;
  edad: number;
  altura: number; // en metros, ej. 1.98
  peso: number; // en kilos
  nacionalidad: string;
  foto: string; // ej. 'assets/img/jugadores/jugador-1.jpg'
  video: string; // ej. 'assets/videos/jugador-1.mp4'
  descripcion: string;
  estadisticas: Estadisticas;
}
