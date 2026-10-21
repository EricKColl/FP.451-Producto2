import { Jugador } from '../models/jugador.model';

// Plantilla histórica: estadísticas medias por partido de la temporada regular indicada.
// Edad a 30 de junio del año final de cada temporada; no es la edad actual.
// Altura y peso aproximados de las fichas biográficas, no mediciones de esa temporada.
// Esta constante se exporta y la importa PlayersComponent (lo pide la rúbrica).
export const JUGADORES: Jugador[] = [
  // Fuentes: https://pr.nba.com/stephen-curry-2015-16-kia-nba-mvp-award-warriors/
  // https://pr.nba.com/2016-foot-locker-three-point-contest/
  // https://www.nba.com/player/201939/stephen-curry/bio
  {
    id: 1,
    nombre: 'Stephen',
    apellidos: 'Curry',
    dorsal: 30,
    posicion: 'Base',
    edad: 28,
    altura: 1.88,
    peso: 84,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-1.jpg',
    video: 'assets/videos/jugador-1.mp4',
    descripcion:
      'Golden State Warriors, temporada 2015-16. Base especialista en triples y manejo del balón; elegido MVP por unanimidad.',
    estadisticas: { puntos: 30.1, rebotes: 5.4, asistencias: 6.7 },
  },
  // Fuente: https://www.basketball-reference.com/players/p/paulch01.html
  {
    id: 2,
    nombre: 'Chris',
    apellidos: 'Paul',
    dorsal: 3,
    posicion: 'Base',
    edad: 24,
    altura: 1.83,
    peso: 79,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-2.jpg',
    video: 'assets/videos/jugador-2.mp4',
    descripcion:
      'New Orleans Hornets, temporada 2008-09. Base director de juego, destacado por su visión de pase y su defensa.',
    estadisticas: { puntos: 22.8, rebotes: 5.5, asistencias: 11.0 },
  },
  // Fuente: https://www.basketball-reference.com/players/b/bryanko01.html
  {
    id: 3,
    nombre: 'Kobe',
    apellidos: 'Bryant',
    dorsal: 24,
    posicion: 'Escolta',
    edad: 29,
    altura: 1.98,
    peso: 96,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-3.jpg',
    video: 'assets/videos/jugador-3.mp4',
    descripcion:
      'Los Angeles Lakers, temporada 2007-08. Escolta con gran capacidad anotadora, juego de pies y tiro de media distancia.',
    estadisticas: { puntos: 28.3, rebotes: 6.3, asistencias: 5.4 },
  },
  // Fuente: https://www.basketball-reference.com/players/w/wadedw01.html
  {
    id: 4,
    nombre: 'Dwyane',
    apellidos: 'Wade',
    dorsal: 3,
    posicion: 'Escolta',
    edad: 27,
    altura: 1.93,
    peso: 100,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-4.jpg',
    video: 'assets/videos/jugador-4.mp4',
    descripcion:
      'Miami Heat, temporada 2008-09. Escolta explosivo, especialista en penetraciones y defensa; líder anotador de la NBA ese curso.',
    estadisticas: { puntos: 30.2, rebotes: 5.0, asistencias: 7.5 },
  },
  // Fuentes: https://pr.nba.com/lebron-james-2012-13-kia-nba-mvp-award/
  // https://www.basketball-reference.com/players/j/jamesle01.html
  {
    id: 5,
    nombre: 'LeBron',
    apellidos: 'James',
    dorsal: 6,
    posicion: 'Alero',
    edad: 28,
    altura: 2.06,
    peso: 113,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-5.jpg',
    video: 'assets/videos/jugador-5.mp4',
    descripcion:
      'Miami Heat, temporada 2012-13. Alero versátil que combina anotación, rebote y creación de juego para sus compañeros.',
    estadisticas: { puntos: 26.8, rebotes: 8.0, asistencias: 7.3 },
  },
  // Fuentes: https://pr.nba.com/kevin-durant-2013-14-kia-nba-mvp/
  // https://www.basketball-reference.com/players/d/duranke01.html
  {
    id: 6,
    nombre: 'Kevin',
    apellidos: 'Durant',
    dorsal: 35,
    posicion: 'Alero',
    edad: 25,
    altura: 2.11,
    peso: 109,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-6.jpg',
    video: 'assets/videos/jugador-6.mp4',
    descripcion:
      'Oklahoma City Thunder, temporada 2013-14. Alero con gran alcance y tiro exterior, capaz de anotar desde cualquier zona.',
    estadisticas: { puntos: 32.0, rebotes: 7.4, asistencias: 5.5 },
  },
  // Fuentes: https://www.nba.com/news/kia-nba-most-valuable-player-award-winners-dallas-mavericks
  // https://www.basketball-reference.com/players/n/nowitdi01.html
  {
    id: 7,
    nombre: 'Dirk',
    apellidos: 'Nowitzki',
    dorsal: 41,
    posicion: 'Ala-pívot',
    edad: 29,
    altura: 2.13,
    peso: 111,
    nacionalidad: 'Alemania',
    foto: 'assets/img/jugadores/jugador-7.jpg',
    video: 'assets/videos/jugador-7.mp4',
    descripcion:
      'Dallas Mavericks, temporada 2006-07. Ala-pívot reconocido por su tiro exterior y su lanzamiento a una pierna.',
    estadisticas: { puntos: 24.6, rebotes: 8.9, asistencias: 3.4 },
  },
  // Fuentes: https://www.nba.com/stats/player/203507/traditional?Season=2019-20&SeasonType=Regular+Season
  // https://www.basketball-reference.com/players/a/antetgi01.html
  {
    id: 8,
    nombre: 'Giannis',
    apellidos: 'Antetokounmpo',
    dorsal: 34,
    posicion: 'Ala-pívot',
    edad: 25,
    altura: 2.11,
    peso: 110,
    nacionalidad: 'Grecia',
    foto: 'assets/img/jugadores/jugador-8.jpg',
    video: 'assets/videos/jugador-8.mp4',
    descripcion:
      'Milwaukee Bucks, temporada 2019-20. Ala-pívot potente y versátil, destacado en transiciones, rebotes y defensa.',
    estadisticas: { puntos: 29.5, rebotes: 13.6, asistencias: 5.6 },
  },
  // Fuentes: https://www.nba.com/lakers/history/alumni/shaquille-oneal
  // https://www.basketball-reference.com/players/o/onealsh01.html
  {
    id: 9,
    nombre: 'Shaquille',
    apellidos: "O'Neal",
    dorsal: 34,
    posicion: 'Pívot',
    edad: 28,
    altura: 2.16,
    peso: 147,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-9.jpg',
    video: 'assets/videos/jugador-9.mp4',
    descripcion:
      'Los Angeles Lakers, temporada 1999-2000. Pívot dominante cerca del aro, con gran capacidad anotadora y reboteadora.',
    estadisticas: { puntos: 29.7, rebotes: 13.6, asistencias: 3.8 },
  },
  // Fuentes: https://www.nba.com/player/2730/dwight-howard/bio
  // https://www.basketball-reference.com/players/h/howardw01.html
  {
    id: 10,
    nombre: 'Dwight',
    apellidos: 'Howard',
    dorsal: 12,
    posicion: 'Pívot',
    edad: 25,
    altura: 2.08,
    peso: 120,
    nacionalidad: 'Estados Unidos',
    foto: 'assets/img/jugadores/jugador-10.jpg',
    video: 'assets/videos/jugador-10.mp4',
    descripcion:
      'Orlando Magic, temporada 2010-11. Pívot atlético, especialista en rebotes, tapones y finalizaciones cerca del aro.',
    estadisticas: { puntos: 22.9, rebotes: 14.1, asistencias: 1.4 },
  },
];
