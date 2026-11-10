import { inject, Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { AvisosService } from './avisos.service';

// Evento que lanzan Chrome y Edge cuando la aplicación se puede instalar
interface EventoInstalacion extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Aplicación instalable (PWA): botón «Instalar» y aviso cuando se publica una versión nueva
@Injectable({ providedIn: 'root' })
export class PwaService {
  private readonly avisos = inject(AvisosService);
  private readonly actualizaciones = inject(SwUpdate);
  private eventoInstalacion: EventoInstalacion | null = null;

  // El navegador permite instalarla y todavía no está instalada
  readonly instalable = signal(false);

  constructor() {
    globalThis.addEventListener?.('beforeinstallprompt', (evento) => {
      // Se guarda el evento: la instalación la decide quien pulsa el botón, no el navegador
      evento.preventDefault();
      this.eventoInstalacion = evento as EventoInstalacion;
      this.instalable.set(true);
    });
    globalThis.addEventListener?.('appinstalled', () => {
      this.eventoInstalacion = null;
      this.instalable.set(false);
      this.avisos.exito('Equipo Basket se ha instalado en este dispositivo.');
    });

    // Versión nueva descargada en segundo plano: se ofrece recargar para usarla
    if (this.actualizaciones.isEnabled) {
      this.actualizaciones.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() =>
          this.avisos.info('Hay una versión nueva de la aplicación.', {
            clave: 'version',
            duracion: 20000,
            accion: {
              texto: 'Actualizar',
              icono: 'bi-arrow-repeat',
              ejecutar: () => document.location.reload(),
            },
          }),
        );
    }
  }

  async instalar(): Promise<void> {
    const evento = this.eventoInstalacion;
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === 'accepted') this.instalable.set(false);
    this.eventoInstalacion = null;
  }
}
