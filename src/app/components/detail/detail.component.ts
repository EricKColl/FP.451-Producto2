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
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DecimalPipe, formatNumber, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { DatosJugador, Estadisticas, Jugador } from '../../models/jugador.model';
import { Credito, CreditoVideo } from '../../models/credito.model';
import { CREDITOS, CREDITOS_VIDEO, fotoOriginal, videoOriginal } from '../../data/creditos.data';
import { MediaComponent } from '../media/media.component';
import { FormularioJugadorComponent } from '../formulario-jugador/formulario-jugador.component';
import { confirmadaATiempo, JugadoresService } from '../../services/jugadores.service';
import { AvisosService } from '../../services/avisos.service';
import { VisorFotoComponent } from '../visor-foto/visor-foto.component';
import { MiniaturaPipe } from '../../pipes/miniatura.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

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

// Referencias de la plantilla actual (Firestore) para comparar a cada jugador con el resto
interface Referencias {
  estadisticas: Record<ClaveEstadistica, { max: number; media: number }>;
  altura: { min: number; max: number };
  peso: { min: number; max: number };
}

function calcularReferencias(plantilla: Jugador[]): Referencias {
  const valores = (clave: ClaveEstadistica) => plantilla.map((j) => j.estadisticas[clave]);
  const rango = (lista: number[]) => ({ min: Math.min(...lista), max: Math.max(...lista) });
  const estadistica = (clave: ClaveEstadistica) => ({
    max: Math.max(...valores(clave)),
    media: media(valores(clave)),
  });
  return {
    estadisticas: {
      puntos: estadistica('puntos'),
      rebotes: estadistica('rebotes'),
      asistencias: estadistica('asistencias'),
    },
    altura: rango(plantilla.map((j) => j.altura)),
    peso: rango(plantilla.map((j) => j.peso)),
  };
}

function media(lista: number[]): number {
  return lista.reduce((suma, valor) => suma + valor, 0) / lista.length;
}

// «hace 3 minutos», «ayer», «hace 2 semanas»...
const RELATIVO = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const TRAMOS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];
function haceTiempo(fecha: Date): string {
  const segundos = (fecha.getTime() - Date.now()) / 1000;
  for (const [unidad, tamano] of TRAMOS) {
    if (Math.abs(segundos) >= tamano) return RELATIVO.format(Math.round(segundos / tamano), unidad);
  }
  return 'ahora mismo';
}

// Mismos datos sin contar la fecha de modificación (el servidor la confirma después de guardar)
function mismoJugador(antes: Jugador | undefined, ahora: Jugador): boolean {
  if (!antes) return false;
  const sinFecha = ({ actualizadoEn, ...resto }: Jugador) => (
    void actualizadoEn,
    JSON.stringify(resto)
  );
  return sinFecha(antes) === sinFecha(ahora);
}

// El formulario devuelve los mismos datos que ya tiene el jugador (no hay nada que guardar)
function mismosDatos(jugador: Jugador, datos: DatosJugador): boolean {
  const { estadisticas, ...resto } = datos;
  return (
    (Object.keys(resto) as (keyof typeof resto)[]).every((k) => resto[k] === jugador[k]) &&
    (Object.keys(estadisticas) as ClaveEstadistica[]).every(
      (k) => estadisticas[k] === jugador.estadisticas[k],
    )
  );
}

// Fracción entre 0 y 1 (si el máximo es 0, la barra queda vacía)
function fraccionDe(valor: number, maximo: number): number {
  return maximo > 0 ? valor / maximo : 0;
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
  imports: [
    NgFor,
    NgIf,
    NgClass,
    DecimalPipe,
    UpperCasePipe,
    FormularioJugadorComponent,
    VisorFotoComponent,
    MiniaturaPipe,
    MatTooltipModule,
  ],
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
  // Plantilla completa (Firestore): para comparar estadísticas y numerar la ficha
  @Input() plantilla: Jugador[] = [];
  // SALIDA: avisamos al padre de que hay que cerrar el detalle
  @Output() cerrar = new EventEmitter<void>();

  // El reproductor llega proyectado desde App (<ng-content>) para la pestaña Vídeo
  @ContentChild(MediaComponent) media?: MediaComponent;
  @ViewChild('botonCerrar') botonCerrar?: ElementRef<HTMLButtonElement>;
  @ViewChild('indicador') indicador?: ElementRef<HTMLElement>;
  @ViewChild('pista') pista?: ElementRef<HTMLElement>;
  @ViewChildren('pestana') pestanas!: QueryList<ElementRef<HTMLButtonElement>>;
  // Formulario común (el mismo del alta) para editar al jugador de la ficha
  @ViewChild(FormularioJugadorComponent) formulario!: FormularioJugadorComponent;
  guardando = false;
  errorGuardado = '';

  readonly vistas = VISTAS;
  vista = 0;
  materializando = false;
  statsVisibles = false;

  datos: { etiqueta: string; valor: string }[] = [];
  equipo = '';
  resumen = '';
  temporada = '';
  fotoRota = false; // la foto no se puede cargar: se muestran las iniciales
  credito: Credito | undefined;
  creditoVideo: CreditoVideo | undefined;
  anillos: Anillo[] = [];
  barras: Barra[] = [];

  private readonly locale = inject(LOCALE_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly jugadoresService = inject(JugadoresService);
  private readonly avisos = inject(AvisosService);
  private temporizadores: number[] = [];
  // Cada medio minuto se recalcula «Actualizado hace…»
  private reloj = 0;
  private relojId?: number;
  private fotogramas: number[] = [];
  private movimiento?: Animation;
  private inicioDeslizar: { x: number; y: number } | null = null;

  // Cada jugador nuevo vuelve a Perfil y se "materializa" en el escenario. Si solo cambian sus
  // datos (edición en tiempo real desde Firestore), la ficha se actualiza sin moverse de pestaña.
  ngOnChanges(cambios: SimpleChanges): void {
    const j = this.jugador;
    const otroJugador = cambios['jugador'] && cambios['jugador'].previousValue?.id !== j.id;
    // Otra persona cambia al jugador mientras aquí se edita: el formulario conserva lo escrito
    const datosNuevos = !mismoJugador(cambios['jugador']?.previousValue, j);
    if (!otroJugador && cambios['jugador'] && datosNuevos && this.editando && !this.guardando) {
      this.avisos.error(
        `Otra persona acaba de modificar a ${j.nombre} ${j.apellidos}. Si guardas, se conservarán tus cambios.`,
        { clave: 'remoto-' + j.id },
      );
    }
    if (cambios['jugador']?.previousValue?.foto !== j.foto) this.fotoRota = false;
    const ref = calcularReferencias(this.plantilla.length ? this.plantilla : [j]);
    this.datos = [
      { etiqueta: 'Nombre', valor: j.nombre },
      { etiqueta: 'Apellidos', valor: j.apellidos },
      { etiqueta: 'Edad', valor: `${j.edad} años` },
      { etiqueta: 'Altura', valor: `${this.numero(j.altura, '1.2-2')} m` },
      { etiqueta: 'Peso', valor: `${this.numero(j.peso, '1.0-1')} kg` },
      { etiqueta: 'Nacionalidad', valor: j.nacionalidad },
    ];
    // "Golden State Warriors, temporada 2015-16. Base especialista…" → equipo + resumen
    const punto = j.descripcion.indexOf('. ');
    this.equipo = punto > 0 ? j.descripcion.slice(0, punto) : '';
    this.resumen = punto > 0 ? j.descripcion.slice(punto + 2) : j.descripcion;
    this.temporada = j.descripcion.match(/temporada (\d{4}-\d{2,4})/)?.[1] ?? '';
    // Los créditos solo se muestran mientras el jugador conserve su foto o su vídeo original
    this.credito =
      j.foto === fotoOriginal(j.id) ? CREDITOS.find((c) => c.idJugador === j.id) : undefined;
    this.creditoVideo =
      j.video === videoOriginal(j.id)
        ? CREDITOS_VIDEO.find((c) => c.idJugador === j.id)
        : undefined;

    const s = j.estadisticas;
    const anillo = (clave: ClaveEstadistica, etiqueta: string, naranja = false): Anillo => ({
      etiqueta,
      valor: s[clave],
      mostrado: 0,
      max: ref.estadisticas[clave].max,
      fraccion: fraccionDe(s[clave], ref.estadisticas[clave].max),
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
      fraccion: fraccionDe(s[clave], ref.estadisticas[clave].max),
      media: fraccionDe(ref.estadisticas[clave].media, ref.estadisticas[clave].max),
    });
    this.barras = [
      barra('puntos', 'Puntos'),
      barra('rebotes', 'Rebotes'),
      barra('asistencias', 'Asistencias'),
      {
        etiqueta: 'Altura',
        texto: `${this.numero(j.altura, '1.2-2')} m`,
        fraccion: (j.altura - ref.altura.min + 0.05) / (ref.altura.max - ref.altura.min + 0.05),
        media: null,
      },
      {
        etiqueta: 'Peso',
        texto: `${this.numero(j.peso, '1.0-1')} kg`,
        fraccion: (j.peso - ref.peso.min + 5) / (ref.peso.max - ref.peso.min + 5),
        media: null,
      },
    ];

    if (!otroJugador) {
      // Mismo jugador con datos nuevos: las cifras se muestran directamente, sin animación
      if (this.statsVisibles) this.anillos.forEach((a) => (a.mostrado = a.valor));
      return;
    }
    this.cancelarAnimaciones();
    this.vista = 0;
    this.statsVisibles = false;
    this.moverIndicadorDespues();
    this.materializar();
  }

  // «Actualizado hace 3 minutos»: fecha de la última modificación en Firestore
  get actualizado(): string {
    void this.reloj;
    const fecha = this.jugador.actualizadoEn;
    return fecha ? 'Actualizado ' + haceTiempo(fecha) : '';
  }

  ngAfterViewInit(): void {
    this.relojId = window.setInterval(() => {
      this.reloj++;
      this.cdr.markForCheck();
    }, 30000);
    this.moverIndicador();
    // Las tipografías cambian el ancho de las pestañas: se recoloca el indicador al cargarlas
    document.fonts?.ready.then(() => this.moverIndicador());
    // En móvil la ficha ocupa toda la pantalla: el foco pasa al botón de cerrar
    if (this.esMovil()) this.despues(() => this.botonCerrar?.nativeElement.focus(), 450);
  }

  ngOnDestroy(): void {
    clearInterval(this.relojId);
    // La ficha solo se quita con el formulario abierto si otra persona ha borrado al jugador
    if (this.editando) {
      this.avisos.error(
        `${this.jugador.nombre} ${this.jugador.apellidos} se ha borrado desde otro dispositivo: los cambios no se han guardado.`,
        { clave: 'remoto-' + this.jugador.id },
      );
    }
    this.cancelarAnimaciones();
  }

  onCerrar(): void {
    this.media?.pausar();
    this.cerrar.emit();
  }

  // El formulario de edición está abierto
  get editando(): boolean {
    return !!this.formulario?.dialogo.nativeElement.open;
  }

  editar(): void {
    if (this.guardando) return;
    this.errorGuardado = '';
    this.media?.pausar();
    this.formulario.abrir(this.jugador);
  }

  async guardarCambios(datos: DatosJugador): Promise<void> {
    if (this.guardando) return;
    const nombre = `${datos.nombre} ${datos.apellidos}`;
    // Sin cambios no se escribe en Firestore: la ventana se cierra y la ficha sigue igual
    if (mismosDatos(this.jugador, datos)) {
      this.formulario.cerrar();
      this.avisos.exito(`No había cambios que guardar en la ficha de ${nombre}.`);
      return;
    }
    this.errorGuardado = '';
    this.guardando = true;
    this.formulario.guardando = true;
    try {
      const escritura = this.jugadoresService.actualizar(this.jugador.id, datos);
      if (await confirmadaATiempo(escritura)) {
        this.avisos.exito(`Se han guardado los cambios de ${nombre}.`);
      } else {
        // Sin conexión: la ficha ya muestra los cambios y Firestore los enviará solo
        this.avisos.error(
          `Sin conexión: la ficha ya muestra los cambios de ${nombre} y se guardarán al volver la conexión. No cierres esta pestaña.`,
        );
        escritura.then(
          () => this.avisos.exito(`Se han guardado los cambios de ${nombre}.`),
          () => this.avisos.error(`No se han podido guardar los cambios de ${nombre}.`),
        );
      }
      this.formulario.cerrar();
    } catch {
      // La ventana sigue abierta con los datos escritos para poder reintentar
      this.errorGuardado =
        'No se han podido guardar los cambios. Comprueba la conexión e inténtalo de nuevo.';
      this.avisos.error(this.errorGuardado);
    } finally {
      this.guardando = false;
      this.formulario.guardando = false;
      this.cdr.markForCheck();
    }
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

  // "FICHA 03/10": posición del jugador en la plantilla y número de jugadores
  get codigo(): string {
    const posicion = this.plantilla.findIndex((j) => j.id === this.jugador.id) + 1;
    return String(posicion || 1).padStart(2, '0');
  }

  get total(): string {
    return String(this.plantilla.length || 1).padStart(2, '0');
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
    if (evento.pointerType === 'mouse' || objetivo.closest('input, button, video, a, dialog'))
      return;
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
