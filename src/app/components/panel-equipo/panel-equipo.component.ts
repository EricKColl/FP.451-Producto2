import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Jugador, POSICIONES, Posicion } from '../../models/jugador.model';

interface Cifra {
  etiqueta: string;
  valor: number;
  formato: string;
  unidad: string;
}

interface Lider {
  etiqueta: string;
  nombre: string;
  valor: number;
  unidad: string;
}

interface Reparto {
  posicion: Posicion;
  total: number;
  fraccion: number;
}

// Panel de la plantilla en el escenario vacío: cifras de todo el equipo calculadas con los datos
// de Firestore. Como la plantilla llega en tiempo real, el panel cambia solo con cada alta,
// edición o borrado, en cualquier dispositivo.
@Component({
  selector: 'app-panel-equipo',
  imports: [DecimalPipe],
  templateUrl: './panel-equipo.component.html',
  styleUrl: './panel-equipo.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PanelEquipoComponent implements OnChanges {
  @Input({ required: true }) jugadores: Jugador[] = [];

  cifras: Cifra[] = [];
  lideres: Lider[] = [];
  reparto: Reparto[] = [];

  ngOnChanges(): void {
    const j = this.jugadores;
    if (!j.length) {
      this.cifras = [];
      this.lideres = [];
      this.reparto = [];
      return;
    }
    const media = (valor: (x: Jugador) => number) => j.reduce((s, x) => s + valor(x), 0) / j.length;
    this.cifras = [
      {
        etiqueta: 'Puntos',
        valor: media((x) => x.estadisticas.puntos),
        formato: '1.1-1',
        unidad: '',
      },
      {
        etiqueta: 'Rebotes',
        valor: media((x) => x.estadisticas.rebotes),
        formato: '1.1-1',
        unidad: '',
      },
      {
        etiqueta: 'Asistencias',
        valor: media((x) => x.estadisticas.asistencias),
        formato: '1.1-1',
        unidad: '',
      },
      { etiqueta: 'Altura', valor: media((x) => x.altura), formato: '1.2-2', unidad: 'm' },
      { etiqueta: 'Edad', valor: media((x) => x.edad), formato: '1.0-1', unidad: 'años' },
    ];
    const mejor = (valor: (x: Jugador) => number) =>
      j.reduce((a, b) => (valor(b) > valor(a) ? b : a));
    const lider = (etiqueta: string, valor: (x: Jugador) => number, unidad = ''): Lider => {
      const x = mejor(valor);
      return { etiqueta, nombre: `${x.nombre} ${x.apellidos}`, valor: valor(x), unidad };
    };
    this.lideres = [
      lider('Máximo anotador', (x) => x.estadisticas.puntos, 'pts'),
      lider('Más rebotes', (x) => x.estadisticas.rebotes, 'reb'),
      lider('Más asistencias', (x) => x.estadisticas.asistencias, 'ast'),
    ];
    const cuenta = POSICIONES.map((posicion) => ({
      posicion,
      total: j.filter((x) => x.posicion === posicion).length,
    }));
    const maximo = Math.max(...cuenta.map((c) => c.total), 1);
    this.reparto = cuenta.map((c) => ({ ...c, fraccion: c.total / maximo }));
  }
}
