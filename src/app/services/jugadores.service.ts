import { inject, Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  combineLatest,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  startWith,
  Subject,
} from 'rxjs';
import { FIRESTORE } from '../firebase';
import { DatosJugador, Jugador, Posicion } from '../models/jugador.model';

// Tiempo máximo que una ventana espera la confirmación del servidor antes de cerrarse.
const ESPERA_CONFIRMACION_MS = 8000;

// Firestore aplica cada escritura al momento en este navegador, pero su promesa no termina hasta
// que responde el servidor: sin conexión, hasta que vuelva la red. Una ventana que espere esa
// promesa se quedaría bloqueada, así que la espera tiene un límite.
// true: el servidor la ha confirmado. false: sigue pendiente y Firestore la enviará sola al volver
// la conexión. Si el servidor la rechaza dentro del límite, se lanza su error.
export async function confirmadaATiempo(escritura: Promise<unknown>): Promise<boolean> {
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<boolean>((resolver) => {
    const espera = navigator.onLine === false ? 0 : ESPERA_CONFIRMACION_MS;
    temporizador = setTimeout(() => resolver(false), espera);
  });
  try {
    return await Promise.race([escritura.then(() => true), limite]);
  } finally {
    clearTimeout(temporizador);
  }
}

// Estado de la conexión con Firestore que se muestra en la cabecera
export type EstadoConexion = 'conectando' | 'en-directo' | 'sincronizando' | 'sin-conexion';

// Cambio en la plantilla. «remoto»: lo ha hecho otro dispositivo (u otra pestaña)
export interface CambioJugador {
  tipo: 'alta' | 'edicion' | 'borrado';
  jugador: Jugador;
  remoto: boolean;
}

// Lo que sale de cada instantánea de Firestore, una sola vez para todos los suscriptores
interface Lectura {
  jugadores: Jugador[];
  servidor: boolean; // la plantilla ya ha llegado alguna vez del servidor
  enCache: boolean; // esta instantánea viene de la caché local (sin conexión con el servidor)
  pendientes: boolean; // hay escrituras de este navegador que el servidor aún no ha confirmado
}

// Las escrituras propias se marcan unos segundos: cuando el servidor confirma, la fecha de
// modificación cambia de la estimada a la definitiva y no debe parecer un cambio de otro dispositivo
const MARCA_PROPIA_MS = 15000;

// Acceso a la colección «jugadores» de Cloud Firestore.
// Toda la aplicación lee y escribe la plantilla a través de este servicio.
@Injectable({ providedIn: 'root' })
export class JugadoresService {
  private readonly db = inject(FIRESTORE);
  private readonly coleccion = collection(this.db, 'jugadores');
  private readonly propios = new Map<string, number>();
  private readonly cambios = new Subject<CambioJugador>();

  // Una sola escucha con Firestore, compartida por la lista, el estado de la conexión y los cambios.
  // includeMetadataChanges: también avisa cuando solo cambia el estado (caché, escrituras pendientes)
  private readonly lecturas$: Observable<Lectura> = new Observable<Lectura>((suscriptor) => {
    let jugadores: Jugador[] = [];
    let servidor = false;
    let primera = true;
    // onSnapshot devuelve la función que cancela la escucha: se ejecuta al cancelar la suscripción
    return onSnapshot(
      query(this.coleccion, orderBy('creadoEn')),
      { includeMetadataChanges: true },
      (instantanea) => {
        // Sin conexión, Firestore responde primero con su caché local, que al arrancar puede estar
        // vacía: se ignora para no mostrar «plantilla vacía» mientras se conecta con el servidor
        if (instantanea.metadata.fromCache && instantanea.empty && !servidor) return;
        servidor ||= !instantanea.metadata.fromCache;
        // La lista solo se rehace si cambian los datos (no con los cambios de estado)
        if (primera || instantanea.docChanges().length) {
          jugadores = instantanea.docs.map((d) =>
            aJugador(d.id, d.data({ serverTimestamps: 'estimate' })),
          );
          if (!primera) this.emitirCambios(instantanea);
          primera = false;
        }
        suscriptor.next({
          jugadores,
          servidor,
          enCache: instantanea.metadata.fromCache,
          pendientes: instantanea.metadata.hasPendingWrites,
        });
      },
      (error) => suscriptor.error(error),
    );
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  // Plantilla en tiempo real: emite la lista completa al suscribirse y cada vez que cambia
  // en Firestore (desde esta app, desde otro navegador o desde la consola de Firebase).
  readonly jugadores$: Observable<Jugador[]> = this.lecturas$.pipe(
    map((l) => l.jugadores),
    distinctUntilChanged(),
  );

  // Altas, ediciones y borrados según llegan, indicando si vienen de otro dispositivo
  readonly cambios$: Observable<CambioJugador> = this.cambios.asObservable();

  // Estado de la conexión: Firestore (caché y escrituras pendientes) y la red del navegador
  readonly conexion$: Observable<EstadoConexion> = combineLatest([
    this.lecturas$.pipe(startWith(null)),
    merge(
      fromEvent(globalThis, 'online').pipe(map(() => true)),
      fromEvent(globalThis, 'offline').pipe(map(() => false)),
    ).pipe(startWith(globalThis.navigator?.onLine !== false)),
  ]).pipe(
    map(([lectura, enLinea]): EstadoConexion => {
      if (!enLinea) return 'sin-conexion';
      if (!lectura || !lectura.servidor) return 'conectando';
      if (lectura.pendientes) return 'sincronizando';
      return lectura.enCache ? 'sin-conexion' : 'en-directo';
    }),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // Alta: el identificador se genera aquí para reconocer después el cambio como propio.
  // El servidor pone las fechas de creación y modificación.
  async crear(datos: DatosJugador): Promise<string> {
    const referencia = doc(this.coleccion);
    this.marcarPropio(referencia.id);
    await setDoc(referencia, {
      ...datos,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
    return referencia.id;
  }

  // Edición: se guardan todos los campos y el servidor actualiza la fecha de modificación
  actualizar(id: string, datos: DatosJugador): Promise<void> {
    this.marcarPropio(id);
    return updateDoc(doc(this.coleccion, id), { ...datos, actualizadoEn: serverTimestamp() });
  }

  borrar(id: string): Promise<void> {
    this.marcarPropio(id);
    return deleteDoc(doc(this.coleccion, id));
  }

  // Deshacer un borrado: el jugador vuelve con su mismo identificador y todos sus datos.
  // Las reglas exigen que la fecha de creación sea la del servidor, así que vuelve al final.
  restaurar(jugador: Jugador): Promise<void> {
    const { id, actualizadoEn, ...datos } = jugador;
    void actualizadoEn;
    this.marcarPropio(id);
    return setDoc(doc(this.coleccion, id), {
      ...datos,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  }

  private marcarPropio(id: string): void {
    this.propios.set(id, Date.now() + MARCA_PROPIA_MS);
  }

  private esPropio(id: string): boolean {
    return (this.propios.get(id) ?? 0) > Date.now();
  }

  // Traduce los cambios de una instantánea (ya con la lista cargada) a altas, ediciones y borrados
  private emitirCambios(instantanea: QuerySnapshot<DocumentData>): void {
    for (const cambio of instantanea.docChanges()) {
      const jugador = aJugador(cambio.doc.id, cambio.doc.data({ serverTimestamps: 'estimate' }));
      const tipo =
        cambio.type === 'added' ? 'alta' : cambio.type === 'modified' ? 'edicion' : 'borrado';
      const propio = this.esPropio(cambio.doc.id) || cambio.doc.metadata.hasPendingWrites;
      this.cambios.next({ tipo, jugador, remoto: !propio });
    }
  }
}

// Convierte un documento de Firestore en un Jugador. La fecha de modificación se usa en la ficha;
// la de creación solo sirve para ordenar la lista.
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
    actualizadoEn: d['actualizadoEn']?.toDate?.() ?? undefined,
  };
}
