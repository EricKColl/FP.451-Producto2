import {
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { provideFirebase } from './firebase';

// Formato español en los pipes de Angular (number, date...): 1,91 en lugar de 1.91
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es' },
    // Conexión con Cloud Firestore (SDK oficial de Firebase)
    provideFirebase(),
    // Aplicación instalable que funciona sin conexión (solo en la compilación de producción)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
