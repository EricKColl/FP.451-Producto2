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
  id: string; // identificador del documento en Firestore (colección «jugadores»)
  nombre: string;
  apellidos: string;
  dorsal: number;
  posicion: Posicion;
  edad: number;
  altura: number; // en metros, ej. 1.98
  peso: number; // en kilos
  nacionalidad: string;
  foto: string; // ruta de assets o URL del archivo subido
  video: string; // ruta de assets o URL del archivo subido
  descripcion: string;
  estadisticas: Estadisticas;
}

// Datos que se guardan al crear o editar un jugador: todo menos el id, que lo asigna Firestore
export type DatosJugador = Omit<Jugador, 'id'>;
