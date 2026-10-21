import { Injectable } from '@angular/core';

export type TipoArchivo = 'foto' | 'video';

// Formatos admitidos y tamaño máximo de cada tipo de archivo
export const LIMITES_ARCHIVO: Record<
  TipoArchivo,
  { formatos: string[]; maxMB: number; texto: string }
> = {
  foto: {
    formatos: ['image/jpeg', 'image/png', 'image/webp'],
    maxMB: 5,
    texto: 'JPG, PNG o WebP de hasta 5 MB',
  },
  video: {
    formatos: ['video/mp4', 'video/webm'],
    maxMB: 40,
    texto: 'MP4 o WebM de hasta 40 MB',
  },
};

// Subida de fotos y vídeos al servidor de archivos. Devuelve la dirección pública (URL)
// del archivo, que es lo que se guarda en Firestore en los campos «foto» y «video».
// El resto de la aplicación solo usa validar() y subir(): si se cambia de servidor,
// solo cambia este archivo.
@Injectable({ providedIn: 'root' })
export class ArchivosService {
  // Devuelve el motivo por el que el archivo no se puede subir, o null si es correcto
  validar(archivo: File, tipo: TipoArchivo): string | null {
    const limite = LIMITES_ARCHIVO[tipo];
    if (!limite.formatos.includes(archivo.type)) {
      return `Formato no admitido. Elige un archivo ${limite.texto}.`;
    }
    if (archivo.size > limite.maxMB * 1024 * 1024) {
      return `El archivo pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB. El máximo es ${limite.maxMB} MB.`;
    }
    return null;
  }

  // Sube el archivo y devuelve su URL. alProgresar recibe el porcentaje subido (0-100).
  // PENDIENTE (tarjeta P2.5): conectar con el servidor de archivos elegido.
  subir(
    archivo: File,
    tipo: TipoArchivo,
    alProgresar?: (porcentaje: number) => void,
  ): Promise<string> {
    return Promise.reject(
      new Error('La subida de archivos todavía no está disponible (tarjeta P2.5).'),
    );
  }
}
