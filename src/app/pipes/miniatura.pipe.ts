import { Pipe, PipeTransform } from '@angular/core';

// Las fotos subidas a Cloudinary se piden ya recortadas al tamaño en que se muestran y en el
// formato más ligero que admita el navegador (AVIF o WebP): la lista descarga unos pocos kB por
// jugador en lugar de la foto original. Las fotos del proyecto (assets/...) no cambian.
//   foto | miniatura: 96        → cuadrada de 96 × 96, centrada en la cara
//   foto | miniatura: 1600 : 0  → hasta 1600 px de ancho, sin recortar
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

@Pipe({ name: 'miniatura' })
export class MiniaturaPipe implements PipeTransform {
  transform(url: string | null | undefined, ancho: number, alto: number = ancho): string {
    if (!url) return '';
    const partes = CLOUDINARY.exec(url);
    if (!partes) return url;
    const recorte = alto > 0 ? `c_fill,g_face,w_${ancho},h_${alto}` : `c_limit,w_${ancho}`;
    return `${partes[1]}${recorte},f_auto,q_auto/${partes[2]}`;
  }
}
