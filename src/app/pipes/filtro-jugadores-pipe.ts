import { Pipe, PipeTransform } from '@angular/core';
import { Jugador } from '../models/jugador.model';

@Pipe({
  name: 'filtroJugadores',
})
export class FiltroJugadoresPipe implements PipeTransform {
  transform(jugadores: Jugador[], texto = '', posicion = '', rangoEdad = ''): Jugador[] {
    if (!jugadores) return [];

    // Cada palabra buscada debe aparecer en el nombre completo, en cualquier orden:
    // "curry stephen" y "o neal" también encuentran a Stephen Curry y a O'Neal
    const palabras = this.normalizar(texto).split(' ').filter(Boolean);

    return jugadores.filter((jugador) => {
      const nombreCompleto = this.normalizar(`${jugador.nombre} ${jugador.apellidos}`);
      const coincideTexto = palabras.every((palabra) => nombreCompleto.includes(palabra));
      const coincidePosicion = !posicion || jugador.posicion === posicion;
      const coincideEdad = this.estaEnRango(jugador.edad, rangoEdad);

      return coincideTexto && coincidePosicion && coincideEdad;
    });
  }

  private normalizar(valor: string | null): string {
    return (valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  }

  // Rangos del desplegable de edad de PlayersComponent ('' = sin filtro)
  private estaEnRango(edad: number, rangoEdad: string): boolean {
    switch (rangoEdad) {
      case 'hasta25':
        return edad <= 25;
      case '26-28':
        return edad >= 26 && edad <= 28;
      case '29+':
        return edad >= 29;
      default:
        return true;
    }
  }
}
