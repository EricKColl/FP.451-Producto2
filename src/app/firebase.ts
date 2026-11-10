import { InjectionToken, Provider } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { environment } from '../environments/environment';

// Conexión con Cloud Firestore mediante el SDK oficial de Firebase.
// (@angular/fire todavía no tiene versión para Angular 22: ver el documento de entrega.)
export const FIRESTORE = new InjectionToken<Firestore>('Cloud Firestore');

// Se registra una vez en app.config.ts; los servicios la reciben con inject(FIRESTORE)
export function provideFirebase(): Provider {
  return {
    provide: FIRESTORE,
    // Caché persistente en el navegador (IndexedDB), compartida entre pestañas: la plantilla se ve
    // aunque se recargue la página sin conexión, y los cambios hechos sin red se envían al volver.
    // Si el navegador no la admite, Firestore usa la caché en memoria de siempre.
    useFactory: () =>
      initializeFirestore(initializeApp(environment.firebase), {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      }),
  };
}
