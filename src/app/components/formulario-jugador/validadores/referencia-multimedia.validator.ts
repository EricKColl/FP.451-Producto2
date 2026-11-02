import { ValidatorFn } from '@angular/forms';
import type { TipoArchivo } from '../../../services/archivos.service';

// Rutas de los recursos públicos del proyecto; nunca rutas del sistema ni navegación «..».
const RUTAS_LOCALES: Record<TipoArchivo, RegExp> = {
  foto: /^(?:\.\/|\/)?assets\/img\/jugadores\/[a-z0-9_-]+\.(?:jpe?g|png|webp)$/i,
  video: /^(?:\.\/|\/)?assets\/videos\/[a-z0-9_-]+\.(?:mp4|webm)$/i,
};

// Se comprueba la referencia, sin peticiones de red ni normalización del valor guardado.
// Los CDN pueden servir archivos sin extensión y con parámetros de transformación o firma.
export function referenciaMultimedia(tipo: TipoArchivo): ValidatorFn {
  return (control) => {
    const valor: unknown = control.value;
    if (valor === '') return null; // Opcional, pero null/undefined no son referencias guardables.
    const invalida = { referenciaMultimedia: true };
    if (typeof valor !== 'string' || /[\s\\\u0000-\u001f\u007f]/u.test(valor)) return invalida;
    if (RUTAS_LOCALES[tipo].test(valor)) return null;
    if (!/^https:\/\/[^/?#]+(?:[/?#]|$)/i.test(valor) || /%(?![0-9a-f]{2})/i.test(valor))
      return invalida;
    try {
      const url = new URL(valor);
      const dominioValido = url.hostname
        .split('.')
        .every((parte) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(parte));
      return url.protocol === 'https:' &&
        dominioValido &&
        !url.username &&
        !url.password &&
        url.pathname !== '/'
        ? null
        : invalida;
    } catch {
      return invalida;
    }
  };
}
