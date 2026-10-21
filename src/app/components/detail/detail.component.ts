import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DecimalPipe, formatNumber, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Estadisticas, Jugador } from '../../models/jugador.model';
import { Credito, CreditoVideo } from '../../models/credito.model';
import { JUGADORES } from '../../data/jugadores.data';
import { CREDITOS, CREDITOS_VIDEO } from '../../data/creditos.data';
import { MediaComponent } from '../media/media.component';

// Las tres secciones de la ficha. fx, fy y fs colocan la "cámara" sobre la foto de fondo.
interface Vista {
  id: 'perfil' | 'stats' | 'video';
  nombre: string;
  icono: string;
  fx: string;
  fy: string;
  fs: number;
  giro: string;
}

const VISTAS: Vista[] = [
  {
    id: 'perfil',
    nombre: 'Perfil',
    icono: 'bi-person-badge',
    fx: '50%',
    fy: '18%',
    fs: 1.25,
    giro: '-6deg',
  },
  {
    id: 'stats',
    nombre: 'Estadísticas',
    icono: 'bi-activity',
    fx: '38%',
    fy: '46%',
    fs: 1.75,
    giro: '6deg',
  },
  {
    id: 'video',
    nombre: 'Vídeo',
    icono: 'bi-play-btn',
    fx: '60%',
    fy: '60%',
    fs: 1.05,
    giro: '-4deg',
  },
];

type ClaveEstadistica = keyof Estadisticas;

// Referencias de la plantilla para comparar a cada jugador con el resto
const valores = (clave: ClaveEstadistica) => JUGADORES.map((j) => j.estadisticas[clave]);
const REFERENCIA: Record<ClaveEstadistica, { max: number; media: number }> = {
  puntos: { max: Math.max(...valores('puntos')), media: media(valores('puntos')) },
  rebotes: { max: Math.max(...valores('rebotes')), media: media(valores('rebotes')) },
  asistencias: { max: Math.max(...valores('asistencias')), media: media(valores('asistencias')) },
};
const ALTURA = {
  min: Math.min(...JUGADORES.map((j) => j.altura)),
  max: Math.max(...JUGADORES.map((j) => j.altura)),
};
const PESO = {
  min: Math.min(...JUGADORES.map((j) => j.peso)),
  max: Math.max(...JUGADORES.map((j) => j.peso)),
};

function media(lista: number[]): number {
  return lista.reduce((suma, valor) => suma + valor, 0) / lista.length;
}

interface Anillo {
  etiqueta: string;
  valor: number;
  mostrado: number; // cifra que se anima de 0 al valor
  max: number;
  fraccion: number;
  naranja: boolean;
}

interface Barra {
  etiqueta: string;
  texto: string;
  fraccion: number;
  media: number | null; // posición de la marca de la media de la plantilla
}

const CIRCUNFERENCIA = 289; // 2·π·46, radio de los anillos

@Component({
  selector: 'app-detail',
  imports: [NgFor, NgIf, NgClass, DecimalPipe, UpperCasePipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.materializando]': 'materializando',
    '[style.--vista]': 'vista',
  },
})
export class DetailComponent implements OnChanges, AfterViewInit, OnDestroy {
  // ENTRADA: el jugador que el usuario ha pulsado en el listado
  @Input({ required: true }) jugador!: Jugador;
  @Input() totalJugadores = JUGADORES.length;
  // SALIDA: avisamos al padre de que hay que cerrar el detalle
  @Output() cerrar = new EventEmitter<void>();

  // El reproductor llega proyectado desde App (<ng-content>) para la pestaña Vídeo
  @ContentChild(MediaComponent) media?: MediaComponent;
  @ViewChild('botonCerrar') botonCerrar?: ElementRef<HTMLButtonElement>;
  @ViewChild('indicador') indicador?: ElementRef<HTMLElement>;
  @ViewChild('pista') pista?: ElementRef<HTMLElement>;
  @ViewChildren('pestana') pestanas!: QueryList<ElementRef<HTMLButtonElement>>;

  readonly vistas = VISTAS;
  vista = 0;
  materializando = false;
  statsVisibles = false;

  datos: { etiqueta: string; valor: string }[] = [];
  equipo = '';
  resumen = '';
  temporada = '';
  credito: Credito | undefined;
  creditoVideo: CreditoVideo | undefined;
  anillos: Anillo[] = [];
  barras: Barra[] = [];

  private readonly locale = inject(LOCALE_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private temporizadores: number[] = [];
  private fotogramas: number[] = [];
  private movimiento?: Animation;
  private inicioDeslizar: { x: number; y: number } | null = null;

  // Cada jugador nuevo vuelve a Perfil y se "materializa" en el escenario
  ngOnChanges(): void {
    const j = this.jugador;
    this.datos = [
      { etiqueta: 'Nombre', valor: j.nombre },
      { etiqueta: 'Apellidos', valor: j.apellidos },
      { etiqueta: 'Edad', valor: `${j.edad} años` },
      { etiqueta: 'Altura', valor: `${this.numero(j.altura, '1.2-2')} m` },
      { etiqueta: 'Peso', valor: `${j.peso} kg` },
      { etiqueta: 'Nacionalidad', valor: j.nacionalidad },
    ];
    // "Golden State Warriors, temporada 2015-16. Base especialista…" → equipo + resumen
    const punto = j.descripcion.indexOf('. ');
    this.equipo = punto > 0 ? j.descripcion.slice(0, punto) : '';
    this.resumen = punto > 0 ? j.descripcion.slice(punto + 2) : j.descripcion;
    this.temporada = j.descripcion.match(/temporada (\d{4}-\d{2,4})/)?.[1] ?? '';
    this.credito = CREDITOS.find((c) => c.idJugador === j.id);
    this.creditoVideo = CREDITOS_VIDEO.find((c) => c.idJugador === j.id);

    const s = j.estadisticas;
    const anillo = (clave: ClaveEstadistica, etiqueta: string, naranja = false): Anillo => ({
      etiqueta,
      valor: s[clave],
      mostrado: 0,
      max: REFERENCIA[clave].max,
      fraccion: s[clave] / REFERENCIA[clave].max,
      naranja,
    });
    this.anillos = [
      anillo('puntos', 'Puntos', true),
      anillo('rebotes', 'Rebotes'),
      anillo('asistencias', 'Asistencias'),
    ];
    const barra = (clave: ClaveEstadistica, etiqueta: string): Barra => ({
      etiqueta,
      texto: this.numero(s[clave], '1.1-1'),
      fraccion: s[clave] / REFERENCIA[clave].max,
      media: REFERENCIA[clave].media / REFERENCIA[clave].max,
    });
    this.barras = [
      barra('puntos', 'Puntos'),
      barra('rebotes', 'Rebotes'),
      barra('asistencias', 'Asistencias'),
      {
        etiqueta: 'Altura',
        texto: `${this.numero(j.altura, '1.2-2')} m`,
        fraccion: (j.altura - ALTURA.min + 0.05) / (ALTURA.max - ALTURA.min + 0.05),
        media: null,
      },
      {
        etiqueta: 'Peso',
        texto: `${j.peso} kg`,
        fraccion: (j.peso - PESO.min + 5) / (PESO.max - PESO.min + 5),
        media: null,
      },
    ];

    this.cancelarAnimaciones();
    this.vista = 0;
    this.statsVisibles = false;
    this.moverIndicadorDespues();
    this.materializar();
  }

  ngAfterViewInit(): void {
    this.moverIndicador();
    // Las tipografías cambian el ancho de las pestañas: se recoloca el indicador al cargarlas
    document.fonts?.ready.then(() => this.moverIndicador());
    // En móvil la ficha ocupa toda la pantalla: el foco pasa al botón de cerrar
    if (this.esMovil()) this.despues(() => this.botonCerrar?.nativeElement.focus(), 450);
  }

  ngOnDestroy(): void {
    this.cancelarAnimaciones();
  }

  onCerrar(): void {
    this.media?.pausar();
    this.cerrar.emit();
  }

  irA(indice: number): void {
    if (indice === this.vista) return;
    this.vista = indice;
    this.moverIndicadorDespues();
    this.moverCamara(indice);
    if (VISTAS[indice].id === 'stats') this.animarEstadisticas();
    if (VISTAS[indice].id !== 'video') this.media?.pausar();
  }

  // Flechas izquierda y derecha para moverse entre pestañas (patrón de pestañas accesible)
  teclaPestana(evento: KeyboardEvent, indice: number): void {
    const paso = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (!paso) return;
    evento.preventDefault();
    const siguiente = (indice + paso + VISTAS.length) % VISTAS.length;
    this.irA(siguiente);
    this.pestanas.get(siguiente)?.nativeElement.focus();
  }

  get codigo(): string {
    return String(this.jugador.id).padStart(2, '0');
  }

  get total(): string {
    return String(this.totalJugadores).padStart(2, '0');
  }

  // "Maryland GovPics; fotógrafo Scott Henderson" → "Maryland GovPics"
  get autorFoto(): string {
    return (this.credito?.autor ?? '').replace(/; (fotógrafo|recorte original de) .*$/, '');
  }

  desplazamientoAnillo(anillo: Anillo): number {
    return this.statsVisibles
      ? CIRCUNFERENCIA * (1 - Math.min(1, anillo.fraccion))
      : CIRCUNFERENCIA;
  }

  // Escape cierra la ficha (salvo en pantalla completa o con la ventana de créditos abierta)
  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    if (document.fullscreenElement || document.querySelector('dialog[open]')) return;
    this.onCerrar();
  }

  @HostListener('window:resize')
  moverIndicador(): void {
    const seleccionada = this.pestanas?.get(this.vista)?.nativeElement;
    const indicador = this.indicador?.nativeElement;
    if (!seleccionada || !indicador) return;
    indicador.style.width = `${seleccionada.offsetWidth}px`;
    indicador.style.transform = `translateX(${seleccionada.offsetLeft}px)`;
  }

  // Profundidad: el fondo y las vistas se desplazan un poco al mover el ratón
  @HostListener('pointermove', ['$event'])
  alMoverPuntero(evento: PointerEvent): void {
    if (!matchMedia('(pointer: fine)').matches || this.movimientoReducido() || this.esMovil())
      return;
    const caja = this.host.nativeElement.parentElement?.getBoundingClientRect();
    if (!caja) return;
    this.fijarParalaje(
      ((evento.clientX - caja.left) / caja.width) * 2 - 1,
      ((evento.clientY - caja.top) / caja.height) * 2 - 1,
    );
  }

  @HostListener('pointerleave')
  alSalirPuntero(): void {
    this.fijarParalaje(0, 0);
  }

  // En móvil y tableta se puede deslizar el dedo para cambiar de pestaña
  @HostListener('pointerdown', ['$event'])
  alTocar(evento: PointerEvent): void {
    const objetivo = evento.target as HTMLElement;
    if (evento.pointerType === 'mouse' || objetivo.closest('input, button, video, a')) return;
    this.inicioDeslizar = { x: evento.clientX, y: evento.clientY };
  }

  @HostListener('pointerup', ['$event'])
  alSoltar(evento: PointerEvent): void {
    if (!this.inicioDeslizar) return;
    const dx = evento.clientX - this.inicioDeslizar.x;
    const dy = evento.clientY - this.inicioDeslizar.y;
    this.inicioDeslizar = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const siguiente = this.vista + (dx < 0 ? 1 : -1);
      if (siguiente >= 0 && siguiente < VISTAS.length) this.irA(siguiente);
    }
  }

  private fijarParalaje(x: number, y: number): void {
    this.host.nativeElement.style.setProperty('--px', x.toFixed(3));
    this.host.nativeElement.style.setProperty('--py', y.toFixed(3));
  }

  // Barrido de luz al cargar un jugador nuevo
  private materializar(): void {
    if (this.movimientoReducido()) return;
    this.materializando = false;
    this.despues(() => (this.materializando = true), 0);
    this.despues(() => (this.materializando = false), 1300);
  }

  // Los anillos y las barras se rellenan y las cifras cuentan desde cero
  private animarEstadisticas(): void {
    this.statsVisibles = false;
    this.anillos.forEach((a) => (a.mostrado = 0));
    if (this.movimientoReducido()) {
      this.statsVisibles = true;
      this.anillos.forEach((a) => (a.mostrado = a.valor));
      return;
    }
    this.fotograma(() => this.fotograma(() => (this.statsVisibles = true)));
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const progreso = Math.min(1, (ahora - inicio) / 1100);
      const suavizado = 1 - Math.pow(1 - progreso, 3);
      this.anillos.forEach((a) => (a.mostrado = a.valor * suavizado));
      if (progreso < 1) this.fotograma(paso);
    };
    this.fotograma(paso);
  }

  private moverIndicadorDespues(): void {
    this.fotograma(() => this.moverIndicador());
  }

  // La pista pasa a la vista nueva y la "cámara" se aleja y gira un instante. La animación
  // empieza en el mismo clic (Web Animations API), sin temporizadores: aunque el navegador
  // vaya lento (StackBlitz, Safari), el movimiento se hace una sola vez.
  private moverCamara(indice: number): void {
    this.movimiento?.cancel();
    const pista = this.pista?.nativeElement;
    if (!pista || typeof pista.animate !== 'function' || this.movimientoReducido()) return;
    const x = `${indice * -33.3333}%`;
    this.movimiento = pista.animate(
      [
        { transform: `translate3d(${x}, 0, 0)` },
        { transform: `translate3d(${x}, 0, -120px) rotateY(${VISTAS[indice].giro})`, offset: 0.5 },
        { transform: `translate3d(${x}, 0, 0)` },
      ],
      { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
    );
  }

  private despues(accion: () => void, ms: number): void {
    this.temporizadores.push(
      window.setTimeout(() => {
        accion();
        this.cdr.markForCheck();
      }, ms),
    );
  }

  private fotograma(accion: (ahora: number) => void): void {
    this.fotogramas.push(
      requestAnimationFrame((ahora) => {
        accion(ahora);
        this.cdr.markForCheck();
      }),
    );
  }

  private cancelarAnimaciones(): void {
    this.temporizadores.forEach((t) => clearTimeout(t));
    this.fotogramas.forEach((f) => cancelAnimationFrame(f));
    this.temporizadores = [];
    this.fotogramas = [];
    this.movimiento?.cancel();
    this.movimiento = undefined;
    this.materializando = false;
  }

  private numero(valor: number, formato: string): string {
    return formatNumber(valor, this.locale, formato);
  }

  private esMovil(): boolean {
    return matchMedia('(max-width: 991.98px)').matches;
  }

  private movimientoReducido(): boolean {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
