import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { ArchivosService, LIMITES_ARCHIVO, TipoArchivo } from '../../services/archivos.service';

// Selector de foto o vídeo desde el ordenador, con vista previa y progreso de la subida.
// Lo usa el formulario del jugador (alta y edición).
// PERSONA 3 (Marc) completa este componente.
@Component({
  selector: 'app-subida-archivo',
  imports: [NgIf],
  templateUrl: './subida-archivo.component.html',
  styleUrl: './subida-archivo.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SubidaArchivoComponent {
  // CONTRATO (no cambiar nombres)
  // ENTRADA: 'foto' o 'video'
  @Input({ required: true }) tipo!: TipoArchivo;
  // ENTRADA: dirección del archivo actual ('' si todavía no hay ninguno)
  @Input()
  set url(valor: string) {
    this.direccion = valor;
    this.vistaRota = false; // con una dirección nueva se vuelve a intentar la vista previa
  }
  get url(): string {
    return this.direccion;
  }
  // ENTRADA: id del campo, para que la etiqueta del formulario apunte al botón de elegir
  @Input() idCampo = '';
  // SALIDA: dirección del archivo recién subido. Permite usar [(url)] en el formulario
  @Output() urlChange = new EventEmitter<string>();
  // SALIDA: true al empezar a subir y false al terminar (el formulario no guarda mientras sube)
  @Output() subiendo = new EventEmitter<boolean>();

  private readonly archivos = inject(ArchivosService);
  private readonly cdr = inject(ChangeDetectorRef);

  progreso: number | null = null; // porcentaje subido; null = no se está subiendo nada
  error = '';
  // true si la foto o el vídeo actual no se pueden cargar: en su lugar se ve el icono
  vistaRota = false;
  private direccion = '';

  get limite() {
    return LIMITES_ARCHIVO[this.tipo];
  }

  get nombreTipo(): string {
    return this.tipo === 'foto' ? 'foto' : 'vídeo';
  }

  async alElegirArchivo(evento: Event): Promise<void> {
    const selector = evento.target as HTMLInputElement;
    const archivo = selector.files?.[0];
    selector.value = '';
    if (!archivo) return;

    this.error = this.archivos.validar(archivo, this.tipo) ?? '';
    if (this.error) return;

    this.progreso = 0;
    this.subiendo.emit(true);
    try {
      const url = await this.archivos.subir(archivo, this.tipo, (porcentaje) => {
        this.progreso = porcentaje;
        this.cdr.markForCheck();
      });
      this.url = url;
      this.urlChange.emit(url);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se ha podido subir el archivo.';
    } finally {
      this.progreso = null;
      this.subiendo.emit(false);
      this.cdr.markForCheck();
    }
  }
}
