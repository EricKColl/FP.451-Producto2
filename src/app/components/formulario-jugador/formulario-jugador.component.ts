import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DatosJugador, Jugador, POSICIONES, Posicion } from '../../models/jugador.model';
import { SubidaArchivoComponent } from '../subida-archivo/subida-archivo.component';

import { referenciaMultimedia } from './validadores/referencia-multimedia.validator';

let siguienteFormulario = 0;

// Cifras con coma decimal, como en el resto de la aplicación
const decimal = (valor: number) => String(valor).replace('.', ',');

const texto = (maximo: number) => [
  Validators.required,
  Validators.maxLength(maximo),
  Validators.pattern(/\S/),
];
const finito: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  c.value === null || c.value === '' || (typeof c.value === 'number' && Number.isFinite(c.value))
    ? null
    : { numero: true };
const entero: ValidatorFn = (c: AbstractControl): ValidationErrors | null =>
  c.value === null || Number.isInteger(c.value) ? null : { entero: true };
const numero = (min: number, max: number, esEntero = false) =>
  new FormControl<number | null>(null, [
    Validators.required,
    finito,
    Validators.min(min),
    Validators.max(max),
    ...(esEntero ? [entero] : []),
  ]);

@Component({
  selector: 'app-formulario-jugador',
  imports: [ReactiveFormsModule, SubidaArchivoComponent],
  templateUrl: './formulario-jugador.component.html',
  styleUrl: './formulario-jugador.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class FormularioJugadorComponent {
  private enGuardado = false;
  private enviado = false;
  @Input() set guardando(valor: boolean) {
    this.enGuardado = valor;
    // El padre libera el intento al terminar, también si ha fallado.
    if (!valor) this.enviado = false;
  }
  get guardando(): boolean {
    return this.enGuardado;
  }
  @Output() guardar = new EventEmitter<DatosJugador>();
  @ViewChild('dialogo', { static: true }) dialogo!: ElementRef<HTMLDialogElement>;
  @ViewChildren(SubidaArchivoComponent) subidas?: QueryList<SubidaArchivoComponent>;
  readonly decimal = decimal;
  readonly idFormulario = `formulario-jugador-${++siguienteFormulario}`;
  jugador: Jugador | null = null;
  readonly posiciones = POSICIONES;
  subiendoFoto = false;
  subiendoVideo = false;
  readonly campos = [
    { nombre: 'nombre', etiqueta: 'Nombre', max: 40 },
    { nombre: 'apellidos', etiqueta: 'Apellidos', max: 60 },
    { nombre: 'nacionalidad', etiqueta: 'Nacionalidad', max: 40 },
  ];
  readonly numericos = [
    { nombre: 'dorsal', etiqueta: 'Dorsal', min: 0, max: 99, paso: 1 },
    { nombre: 'edad', etiqueta: 'Edad (años)', min: 16, max: 50, paso: 1 },
    { nombre: 'altura', etiqueta: 'Altura (m)', min: 1.5, max: 2.4, paso: 'any' },
    { nombre: 'peso', etiqueta: 'Peso (kg)', min: 50, max: 180, paso: 'any' },
  ];
  readonly estadisticas = [
    { nombre: 'puntos', etiqueta: 'Puntos', max: 60 },
    { nombre: 'rebotes', etiqueta: 'Rebotes', max: 40 },
    { nombre: 'asistencias', etiqueta: 'Asistencias', max: 30 },
  ];
  readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: texto(40) }),
    apellidos: new FormControl('', { nonNullable: true, validators: texto(60) }),
    nacionalidad: new FormControl('', { nonNullable: true, validators: texto(40) }),
    descripcion: new FormControl('', { nonNullable: true, validators: texto(600) }),
    posicion: new FormControl<Posicion | ''>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        (c) => (POSICIONES.includes(c.value) ? null : { posicion: true }),
      ],
    }),
    dorsal: numero(0, 99, true),
    edad: numero(16, 50, true),
    altura: numero(1.5, 2.4),
    peso: numero(50, 180),
    foto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000), referenciaMultimedia('foto')],
    }),
    video: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000), referenciaMultimedia('video')],
    }),
    estadisticas: new FormGroup({
      puntos: numero(0, 60),
      rebotes: numero(0, 40),
      asistencias: numero(0, 30),
    }),
  });

  // Guardando en Firestore: los datos no se pueden tocar
  get enviando(): boolean {
    return this.guardando || this.enviado;
  }

  // Además, subiendo un archivo: se puede seguir escribiendo, pero no guardar ni cerrar
  get ocupado(): boolean {
    return this.enviando || this.subiendoFoto || this.subiendoVideo;
  }

  abrir(jugador: Jugador | null): void {
    if (this.ocupado) return;
    this.jugador = jugador;
    this.subidas?.forEach((subida) => subida.limpiarError());
    this.formulario.reset();
    if (jugador) {
      // setValue copia los valores en los controles, sin enlazar el objeto original.
      const { id, actualizadoEn, ...datos } = jugador;
      void [id, actualizadoEn];
      this.formulario.setValue(datos);
    }
    if (!this.dialogo.nativeElement.open) this.dialogo.nativeElement.showModal();
    this.enfocar('.dialogo__cuerpo input');
  }

  // Lo llama el padre cuando ya ha guardado: la ventana se cierra siempre
  cerrar(): void {
    this.enviado = false;
    this.dialogo.nativeElement.close();
  }

  // Botones de cerrar y cancelar: no hacen nada mientras se guarda o se sube un archivo
  pedirCierre(): void {
    if (!this.ocupado) this.cerrar();
  }

  private enfocar(selector: string): void {
    setTimeout(() => this.dialogo.nativeElement.querySelector?.<HTMLElement>(selector)?.focus());
  }

  cancelar(evento: Event): void {
    if (this.ocupado) evento.preventDefault();
  }

  error(ruta: string): string {
    const campo = this.formulario.get(ruta);
    if (!campo?.touched || !campo.errors) return '';
    if (campo.hasError('required')) return 'Este campo es obligatorio.';
    if (campo.hasError('pattern')) return 'Introduce texto; no puede contener solo espacios.';
    if (campo.hasError('maxlength'))
      return `Máximo ${campo.errors['maxlength'].requiredLength} caracteres.`;
    if (campo.hasError('referenciaMultimedia'))
      return 'Referencia no válida. Usa una URL HTTPS completa o una ruta de archivos del proyecto compatible con este campo.';
    if (campo.hasError('numero')) return 'Introduce un número válido.';
    if (campo.hasError('entero')) return 'Introduce un número entero.';
    if (campo.hasError('min')) return `El mínimo es ${decimal(campo.errors['min'].min)}.`;
    if (campo.hasError('max')) return `El máximo es ${decimal(campo.errors['max'].max)}.`;
    return 'Selecciona una posición válida.';
  }

  enviar(): void {
    if (this.ocupado) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      // El foco va al primer campo con error: puede estar fuera de la zona visible
      this.enfocar('[aria-invalid="true"]');
      return;
    }
    const valor = this.formulario.getRawValue();
    const datos: DatosJugador = {
      ...valor,
      nombre: valor.nombre.trim(),
      apellidos: valor.apellidos.trim(),
      nacionalidad: valor.nacionalidad.trim(),
      descripcion: valor.descripcion.trim(),
      posicion: valor.posicion as Posicion,
      dorsal: valor.dorsal!,
      edad: valor.edad!,
      altura: valor.altura!,
      peso: valor.peso!,
      estadisticas: {
        puntos: valor.estadisticas.puntos!,
        rebotes: valor.estadisticas.rebotes!,
        asistencias: valor.estadisticas.asistencias!,
      },
    };
    this.enviado = true; // Bloqueo inmediato, antes de que Angular actualice la entrada del padre.
    this.guardar.emit(datos);
  }
}
