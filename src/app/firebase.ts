import { InjectionToken, Provider } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

// Conexión con Cloud Firestore mediante el SDK oficial de Firebase.
// (@angular/fire todavía no tiene versión para Angular 22: ver el documento de entrega.)
export const FIRESTORE = new InjectionToken<Firestore>('Cloud Firestore');

// Se registra una vez en app.config.ts; los servicios la reciben con inject(FIRESTORE)
export function provideFirebase(): Provider {
  return {
    provide: FIRESTORE,
    useFactory: () => getFirestore(initializeApp(environment.firebase)),
  };
}
