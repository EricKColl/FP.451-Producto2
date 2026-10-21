import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Observable, shareReplay } from 'rxjs';
import { FIRESTORE } from '../firebase';
import { DatosJugador, Jugador, Posicion } from '../models/jugador.model';

// Acceso a la colección «jugadores» de Cloud Firestore.
// Toda la aplicación lee y escribe la plantilla a través de este servicio.
@Injectable({ providedIn: 'root' })
export class JugadoresService {
  private readonly db = inject(FIRESTORE);
  private readonly coleccion = collection(this.db, 'jugadores');

  // Plantilla en tiempo real: emite la lista completa al suscribirse y cada vez que cambia
  // en Firestore (desde esta app, desde otro navegador o desde la consola de Firebase).
  readonly jugadores$: Observable<Jugador[]> = new Observable<Jugador[]>((suscriptor) =>
    // onSnapshot devuelve la función que cancela la escucha: se ejecuta al cancelar la suscripción
    onSnapshot(
      query(this.coleccion, orderBy('creadoEn')),
      (instantanea) => {
        // Sin conexión, Firestore responde primero con su caché local, que al arrancar está
        // vacía: se ignora para no mostrar «plantilla vacía» mientras se conecta con el servidor
        if (instantanea.metadata.fromCache && instantanea.empty) return;
        suscriptor.next(
          instantanea.docs.map((documento) => aJugador(documento.id, documento.data())),
        );
      },
      (error) => suscriptor.error(error),
    ),
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  // Alta: Firestore asigna el id y el servidor pone las fechas de creación y modificación
  async crear(datos: DatosJugador): Promise<string> {
    const referencia = await addDoc(this.coleccion, {
      ...datos,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return referencia.id;
  }

  // Edición: se guardan todos los campos y el servidor actualiza la fecha de modificación
  actualizar(id: string, datos: DatosJugador): Promise<void> {
    return updateDoc(doc(this.coleccion, id), { ...datos, actualizadoEn: serverTimestamp() });
  }

  borrar(id: string): Promise<void> {
    return deleteDoc(doc(this.coleccion, id));
  }
}

// Convierte un documento de Firestore en un Jugador (las fechas internas no se usan en la vista)
function aJugador(id: string, d: DocumentData): Jugador {
  return {
    id,
    nombre: d['nombre'],
    apellidos: d['apellidos'],
    dorsal: d['dorsal'],
    posicion: d['posicion'] as Posicion,
    edad: d['edad'],
    altura: d['altura'],
    peso: d['peso'],
    nacionalidad: d['nacionalidad'],
    foto: d['foto'] ?? '',
    video: d['video'] ?? '',
    descripcion: d['descripcion'],
    estadisticas: {
      puntos: d['estadisticas']?.['puntos'] ?? 0,
      rebotes: d['estadisticas']?.['rebotes'] ?? 0,
      asistencias: d['estadisticas']?.['asistencias'] ?? 0,
    },
  };
}
