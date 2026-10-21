import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TipoArchivo } from '../../services/archivos.service';

// Selector de foto o vídeo desde el ordenador, con vista previa y progreso de la subida.
// Lo usa el formulario del jugador (alta y edición).
// PERSONA 3 (Marc) completa este componente.
@Component({
  selector: 'app-subida-archivo',
  imports: [],
  templateUrl: './subida-archivo.component.html',
  styleUrl: './subida-archivo.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class SubidaArchivoComponent {
  // CONTRATO (no cambiar nombres)
  // ENTRADA: 'foto' o 'video'
  @Input({ required: true }) tipo!: TipoArchivo;
  // ENTRADA: dirección del archivo actual ('' si todavía no hay ninguno)
  @Input() url = '';
  // ENTRADA: id del campo, para que la etiqueta del formulario apunte al botón de elegir
  @Input() idCampo = '';
  // SALIDA: dirección del archivo recién subido. Permite usar [(url)] en el formulario
  @Output() urlChange = new EventEmitter<string>();
  // SALIDA: true al empezar a subir y false al terminar (el formulario no guarda mientras sube)
  @Output() subiendo = new EventEmitter<boolean>();
}
