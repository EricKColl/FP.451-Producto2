import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

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
      const megas = (archivo.size / 1024 / 1024).toFixed(1).replace('.', ',');
      return `El archivo pesa ${megas} MB. El máximo es ${limite.maxMB} MB.`;
    }
    return null;
  }

  // Sube el archivo a Cloudinary y devuelve su URL. alProgresar recibe el porcentaje subido (0-100).
  // Se usa XMLHttpRequest y no fetch porque fetch no informa del progreso de una subida.
  subir(
    archivo: File,
    tipo: TipoArchivo,
    alProgresar?: (porcentaje: number) => void,
  ): Promise<string> {
    const { nube, preajuste } = environment.cloudinary;
    if (nube === 'PENDIENTE') {
      return Promise.reject(
        new Error('La subida de archivos todavía no está disponible (tarjeta P2.5).'),
      );
    }
    const datos = new FormData();
    datos.append('file', archivo);
    datos.append('upload_preset', preajuste); // preajuste sin firma: no hace falta clave secreta
    datos.append('folder', tipo === 'foto' ? 'equipo-basket/fotos' : 'equipo-basket/videos');

    return new Promise((resolver, rechazar) => {
      const peticion = new XMLHttpRequest();
      const recurso = tipo === 'foto' ? 'image' : 'video';
      peticion.open('POST', `https://api.cloudinary.com/v1_1/${nube}/${recurso}/upload`);
      // Un vídeo de 40 MB con una conexión lenta puede tardar: se espera hasta 3 minutos
      peticion.timeout = 180_000;
      peticion.upload.onprogress = (evento) => {
        if (evento.lengthComputable) {
          alProgresar?.(Math.round((evento.loaded / evento.total) * 100));
        }
      };
      peticion.onload = () => {
        if (peticion.status === 200) {
          resolver(JSON.parse(peticion.responseText).secure_url);
        } else {
          rechazar(
            new Error('El servidor de archivos ha rechazado el archivo. Inténtalo con otro.'),
          );
        }
      };
      peticion.onerror = () =>
        rechazar(new Error('No se ha podido conectar con el servidor de archivos.'));
      peticion.ontimeout = () =>
        rechazar(
          new Error('La subida ha tardado demasiado. Comprueba la conexión e inténtalo de nuevo.'),
        );
      peticion.send(datos);
    });
  }
}
