// Carga la plantilla inicial (10 jugadores) en la colección «jugadores» de Cloud Firestore.
//
//   npm run datos:cargar                 → carga los 10 jugadores si la colección está vacía
//   npm run datos:cargar -- --reiniciar  → borra todos los jugadores y vuelve a cargar los 10
//   npm run datos:prueba                 → añade un jugador de prueba (para probar el borrado,
//                                          la edición y el tiempo real; bórralo al terminar)
//
// Usa el mismo SDK, la misma configuración y las mismas reglas de seguridad que la aplicación.
import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  terminate,
} from 'firebase/firestore';
import { environment } from '../src/environments/environment.ts';

const reiniciar = process.argv.includes('--reiniciar');
const prueba = process.argv.includes('--prueba');
const { jugadores } = JSON.parse(
  await readFile(new URL('./jugadores-iniciales.json', import.meta.url), 'utf8'),
);

const db = getFirestore(initializeApp(environment.firebase));
const coleccion = collection(db, 'jugadores');

// Jugador de prueba: completo y válido para las reglas, con la foto y el vídeo de un original
if (prueba) {
  const numero = Math.floor(Math.random() * 900) + 100;
  const nuevo = await addDoc(coleccion, {
    nombre: 'Prueba',
    apellidos: `Jugador ${numero}`,
    dorsal: numero % 100,
    posicion: 'Alero',
    edad: 25,
    altura: 2.01,
    peso: 98,
    nacionalidad: 'España',
    foto: 'assets/img/jugadores/jugador-5.jpg',
    video: 'assets/videos/jugador-5.mp4',
    descripcion:
      'Jugador de prueba creado con npm run datos:prueba. Bórralo al terminar de probar.',
    estadisticas: { puntos: 12.5, rebotes: 6.1, asistencias: 3.4 },
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  console.log(
    `Añadido «Prueba Jugador ${numero}» (id ${nuevo.id}). Bórralo al terminar de probar.`,
  );
  await terminate(db);
  process.exit(0);
}

const existentes = await getDocs(coleccion);
if (!existentes.empty && !reiniciar) {
  console.log(`La colección ya tiene ${existentes.size} jugadores: no se carga nada.`);
  console.log('Para volver a la plantilla inicial: npm run datos:cargar -- --reiniciar');
  await terminate(db);
  process.exit(0);
}

for (const documento of existentes.docs) {
  await deleteDoc(documento.ref);
}
if (!existentes.empty) console.log(`Borrados ${existentes.size} jugadores.`);

// Uno a uno y en orden: la fecha de creación del servidor mantiene el orden de la plantilla
for (const { id, fuentes, ...datos } of jugadores) {
  await setDoc(doc(coleccion, id), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  console.log(`  ${id.padStart(2)} · ${datos.nombre} ${datos.apellidos}`);
}

console.log(
  `Cargados ${jugadores.length} jugadores en Firestore (${environment.firebase.projectId}).`,
);
await terminate(db);
