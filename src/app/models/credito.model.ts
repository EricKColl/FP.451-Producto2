// Autoría y licencia de la fotografía de un jugador (Wikimedia Commons).
export interface Credito {
  idJugador: number; // id del jugador en JUGADORES
  autor: string;
  licencia: string; // ej. 'CC BY-SA 2.0'
  licenciaUrl: string;
  archivo: string; // nombre del archivo en Wikimedia Commons
  origen: string; // página del archivo en Wikimedia Commons
}

// Vídeo original (YouTube) del que procede el fragmento de cada jugador.
export interface CreditoVideo {
  idJugador: number;
  titulo: string;
  canal: string;
  url: string;
}
