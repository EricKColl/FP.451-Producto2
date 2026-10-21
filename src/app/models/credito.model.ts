// Autoría y licencia de la fotografía de un jugador (Wikimedia Commons).
export interface Credito {
  idJugador: string; // id del documento del jugador en Firestore
  autor: string;
  licencia: string; // ej. 'CC BY-SA 2.0'
  licenciaUrl: string;
  archivo: string; // nombre del archivo en Wikimedia Commons
  origen: string; // página del archivo en Wikimedia Commons
}

// Vídeo original (YouTube) del que procede el fragmento de cada jugador.
export interface CreditoVideo {
  idJugador: string;
  titulo: string;
  canal: string;
  url: string;
}
