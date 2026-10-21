import { Credito, CreditoVideo } from '../models/credito.model';

// Créditos de las fotografías de assets/img/jugadores (jugador-N.jpg, donde N es el id).
// Fuentes y licencias comprobadas en las páginas de archivo de Wikimedia Commons el 8 de octubre de 2026.
// Se usan las versiones reducidas de 500 px de ancho, sin recortar el archivo ni alterar las caras.
export const CREDITOS: Credito[] = [
  {
    idJugador: 1,
    autor: 'Erik Drost',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    archivo: 'Steph Curry 2022 ASG.jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:Steph_Curry_2022_ASG.jpg',
  },
  {
    idJugador: 2,
    autor: 'Keith Allison',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    archivo: 'Chris Paul (cropped).jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:Chris_Paul_%28cropped%29.jpg',
  },
  {
    idJugador: 3,
    autor: 'Gamerscore Blog',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    archivo: 'Kobe Bryant Profile.jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:Kobe_Bryant_Profile.jpg',
  },
  {
    idJugador: 4,
    autor: 'photoren; recorte original de Quadzilla99',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    archivo: 'Dwyane Wade portrait.jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:Dwyane_Wade_portrait.jpg',
  },
  {
    idJugador: 5,
    autor: 'Erik Drost',
    licencia: 'CC BY 4.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/',
    archivo: 'LeBron James (55095816551) (cropped).jpg',
    origen:
      'https://commons.wikimedia.org/wiki/File:LeBron_James_%2855095816551%29_%28cropped%29.jpg',
  },
  {
    idJugador: 6,
    autor: 'Maryland GovPics; fotógrafo Scott Henderson',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    archivo: 'Kevin Durant Day (36573174561) (cropped).jpg',
    origen:
      'https://commons.wikimedia.org/wiki/File:Kevin_Durant_Day_%2836573174561%29_%28cropped%29.jpg',
  },
  {
    idJugador: 7,
    autor: 'Keith Allison',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    archivo: 'DirkNowitzki.jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:DirkNowitzki.jpg',
  },
  {
    idJugador: 8,
    autor: 'Erik Drost',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    archivo: 'Giannis Antetokounmpo (51915182998) (cropped).jpg',
    origen:
      'https://commons.wikimedia.org/wiki/File:Giannis_Antetokounmpo_%2851915182998%29_%28cropped%29.jpg',
  },
  {
    idJugador: 9,
    autor: 'Keith Allison',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    archivo: "Shaquille O'Neal (cropped).jpg",
    origen: 'https://commons.wikimedia.org/wiki/File:Shaquille_O%27Neal_%28cropped%29.jpg',
  },
  {
    idJugador: 10,
    autor: 'All-Pro Reels',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    archivo: 'Dwight-Howard.jpg',
    origen: 'https://commons.wikimedia.org/wiki/File:Dwight-Howard.jpg',
  },
];

// Origen de los fragmentos de assets/videos (jugador-N.mp4): vídeos de YouTube, recortados y
// optimizados para uso académico sin ánimo de lucro. Títulos y canales comprobados el 19 de octubre de 2026.
export const CREDITOS_VIDEO: CreditoVideo[] = [
  {
    idJugador: 1,
    titulo: '10 Minutes Of Stephen Curry Being A Literal God',
    canal: 'MaxaMillion711',
    url: 'https://www.youtube.com/watch?v=hUOfC2ilXak',
  },
  {
    idJugador: 2,
    titulo: '10 Minutes Of Chris Paul "POINT GOD" Moments',
    canal: 'MaxaMillion711',
    url: 'https://www.youtube.com/watch?v=FWPGfrdlPGU',
  },
  {
    idJugador: 3,
    titulo: 'The World’s GREATEST Kobe Bryant Highlight Reel',
    canal: 'MaxaMillion711',
    url: 'https://www.youtube.com/watch?v=sJXWscXF3t4',
  },
  {
    idJugador: 4,
    titulo: "Dwyane Wade's Top 35 Plays of His Career!",
    canal: 'NBA',
    url: 'https://www.youtube.com/watch?v=BjTcXjL2moE',
  },
  {
    idJugador: 5,
    titulo: "LeBron James' Top 40 Career Plays",
    canal: 'NBA',
    url: 'https://www.youtube.com/watch?v=-9lP95Qo-I0',
  },
  {
    idJugador: 6,
    titulo: '10 Minutes Of INSANELY GOOD Kevin Durant Highlights',
    canal: 'MaxaMillion711',
    url: 'https://www.youtube.com/watch?v=-ikmc0D31x4',
  },
  {
    idJugador: 7,
    titulo: "Best Of Dirk Nowitzki's SIGNATURE One-Legged Fadeaway",
    canal: 'NBA',
    url: 'https://www.youtube.com/watch?v=5XrbKIdbf0o',
  },
  {
    idJugador: 8,
    titulo: "Giannis Antetokounmpo's Top 30 Career Plays",
    canal: 'NBA',
    url: 'https://www.youtube.com/watch?v=rp8mc34NztY',
  },
  {
    idJugador: 9,
    titulo: "The World's GREATEST Shaquille O'Neal Highlight Reel",
    canal: 'MaxaMillion711',
    url: 'https://www.youtube.com/watch?v=VH1xyOSKSIA',
  },
  {
    idJugador: 10,
    titulo: '15 MINUTES Of PRIME Dwight Howard MONSTER Highlights',
    canal: 'BroKodMixes',
    url: 'https://www.youtube.com/watch?v=RXpcr55oaSE',
  },
];
